-- Read-only audit of this demo batch against the current registered Mars regions.
WITH regions AS (SELECT value AS name FROM jsonb_array_elements_text('__MARS_REGIONS_JSON__'::jsonb)),
batch AS (SELECT * FROM properties WHERE unit_code LIKE 'DEMO-20261108-U%')
SELECT u.id AS user_id, u.full_name, u.role, count(p.id) AS generated_listings,
       count(DISTINCT p.sector_name) AS covered_regions,
       count(p.id) FILTER (WHERE p.status='PUBLISHED') AS published,
       count(p.id) FILTER (WHERE r.name IS NULL) AS unknown_regions,
       count(p.id) FILTER (WHERE p.price<=0 OR p.price<>round(p.price,2)) AS invalid_prices
FROM users u LEFT JOIN batch p ON p.user_id=u.id LEFT JOIN regions r ON r.name=p.sector_name
GROUP BY u.id ORDER BY u.id;

SELECT p.sector_name, count(*) AS listings
FROM properties p WHERE p.unit_code LIKE 'DEMO-20261108-U%'
GROUP BY p.sector_name ORDER BY p.sector_name;

SELECT count(*) AS batch_total,
       count(*) FILTER (WHERE strpos(p.title, chr(8212)) = 0 OR strpos(p.description, chr(65533)) > 0) AS invalid_text_encoding,
       count(*) FILTER (WHERE d.id IS NOT NULL) AS with_details,
       count(*) FILTER (WHERE EXISTS (SELECT 1 FROM property_images i WHERE i.property_id=p.id AND i.is_primary)) AS with_primary_image
FROM properties p LEFT JOIN property_details d ON d.property_id=p.id
WHERE p.unit_code LIKE 'DEMO-20261108-U%';
