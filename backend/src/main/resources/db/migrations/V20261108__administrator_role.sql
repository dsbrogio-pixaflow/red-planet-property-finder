-- Apply explicitly on a test branch before the connected database.
-- Only an existing, unique Master account is promoted. No password or account is created.
BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'USER';

DO $$
BEGIN
    IF (SELECT count(*) FROM users WHERE lower(trim(email)) = 'master@master.com') <> 1 THEN
        RAISE EXCEPTION 'Expected one existing Master account. No role changes were applied.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check' AND conrelid = 'users'::regclass) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN'));
    END IF;
END $$;

UPDATE users SET role = 'ADMIN' WHERE lower(trim(email)) = 'master@master.com';

COMMIT;
