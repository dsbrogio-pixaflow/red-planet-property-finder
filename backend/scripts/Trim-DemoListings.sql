-- Reduce only this generated demo batch to 10 listings per non-admin user.
-- Repeating the operation removes nothing further. Original listings are excluded.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';

CREATE TEMP TABLE trim_users ON COMMIT DROP AS
SELECT id, full_name FROM users WHERE role='USER' ORDER BY id FOR UPDATE;

CREATE TEMP TABLE trim_candidates ON COMMIT DROP AS
SELECT p.id, p.user_id FROM properties p JOIN trim_users u ON u.id=p.user_id
WHERE p.unit_code LIKE 'DEMO-20261108-U' || u.id || '-%'
ORDER BY p.id FOR UPDATE OF p;

CREATE TEMP TABLE trim_originals ON COMMIT DROP AS
SELECT id FROM properties WHERE id NOT IN (SELECT id FROM trim_candidates);

CREATE TEMP TABLE trim_selected ON COMMIT DROP AS
SELECT id, user_id FROM (
    SELECT id, user_id, row_number() OVER (PARTITION BY user_id ORDER BY random()) AS selection_order,
           count(*) OVER (PARTITION BY user_id) AS batch_size
    FROM trim_candidates
) randomized WHERE selection_order <= greatest(batch_size-10,0);

-- JPA cascades do not run in SQL; delete related rows explicitly in the same transaction.
DELETE FROM property_images WHERE property_id IN (SELECT id FROM trim_selected);
DELETE FROM property_details WHERE property_id IN (SELECT id FROM trim_selected);
DELETE FROM properties WHERE id IN (SELECT id FROM trim_selected);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM trim_originals original LEFT JOIN properties p ON p.id=original.id WHERE p.id IS NULL) THEN
        RAISE EXCEPTION 'Trim validation failed: an original or administrator listing is missing.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM trim_users u
        WHERE (SELECT count(*) FROM properties p WHERE p.user_id=u.id AND p.unit_code LIKE 'DEMO-20261108-U' || u.id || '-%')
              <> least(10,(SELECT count(*) FROM trim_candidates p WHERE p.user_id=u.id))
    ) THEN RAISE EXCEPTION 'Trim validation failed: unexpected remaining demo inventory.';
    END IF;
END $$;

SELECT u.id AS user_id, u.full_name,
       (SELECT count(*) FROM trim_selected p WHERE p.user_id=u.id) AS removed_now,
       (SELECT count(*) FROM properties p WHERE p.user_id=u.id AND p.unit_code LIKE 'DEMO-20261108-U' || u.id || '-%') AS remaining_demo,
       (SELECT count(*) FROM properties p WHERE p.user_id=u.id) AS all_remaining
FROM trim_users u ORDER BY u.id;

SELECT (SELECT count(*) FROM trim_selected) AS removed_total,
       (SELECT count(*) FROM properties) AS remaining_total;
COMMIT;
