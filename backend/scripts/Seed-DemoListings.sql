-- Explicit demo data only; never run automatically at application startup.
-- Stable unit codes make this batch repeatable without duplicating listings.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';

CREATE TEMP TABLE seed_regions ON COMMIT DROP AS
SELECT value AS name, ordinal::integer AS ordinal
FROM jsonb_array_elements_text('__MARS_REGIONS_JSON__'::jsonb) WITH ORDINALITY AS region(value, ordinal);

CREATE TEMP TABLE seed_users ON COMMIT DROP AS
SELECT id, full_name, floor(random() * (SELECT count(*) FROM seed_regions))::integer AS region_offset
FROM users WHERE role = 'USER' ORDER BY id FOR UPDATE;

CREATE TEMP TABLE seed_image_pool ON COMMIT DROP AS
SELECT image_url, row_number() OVER (ORDER BY image_url) AS ordinal
FROM (SELECT DISTINCT i.image_url FROM property_images i JOIN properties p ON p.id=i.property_id
      WHERE p.status='PUBLISHED' AND i.is_primary AND i.image_url ~ '^https?://' AND length(i.image_url)<=1000) pool;

CREATE TEMP TABLE seed_candidates ON COMMIT DROP AS
SELECT u.id AS user_id, slot,
       'DEMO-20261108-U' || u.id || '-' || lpad(slot::text, 2, '0') AS unit_code,
       r.name AS region,
       (ARRAY['CYLINDRICAL_HABITAT','ICE_HOME','UNDERGROUND_MANSION','CONNECTED_MODULAR_COMPLEX','GEODESIC_SUPERADOBE_DOME'])
         [1 + floor(random()*5)::integer] AS property_type,
       CASE WHEN random()<0.30 THEN 'RENT' ELSE 'SALE' END AS transaction_type,
       (ARRAY['Aurora','Horizonte','Atlas','Solaris','Estelar','Nova Era','Oásis','Alvorada','Pioneiro','Cosmos',
              'Serenidade','Orion','Vanguarda','Eclipse','Odisséia','Refúgio','Celeste','Centauri','Expansão','Infinito'])[slot] AS nickname,
       1+floor(random()*5)::integer AS bedrooms,
       1+floor(random()*3)::integer AS bathrooms,
       round((45+random()*455)::numeric, 2) AS habitable_area,
       2+floor(random()*10)::integer AS capacity
FROM seed_users u CROSS JOIN generate_series(1,20) slot
JOIN seed_regions r ON r.ordinal = 1 + ((slot-1+u.region_offset) % (SELECT count(*)::integer FROM seed_regions))
WHERE NOT EXISTS (SELECT 1 FROM properties p WHERE p.user_id=u.id
                  AND p.unit_code='DEMO-20261108-U' || u.id || '-' || lpad(slot::text,2,'0'));

CREATE TEMP TABLE seed_inserted ON COMMIT DROP AS
WITH inserted AS (
    INSERT INTO properties(title, description, property_type, transaction_type, price, bedrooms,
                           bathrooms, habitable_area, capacity, colony_name, sector_name, complex_name,
                           unit_code, status, created_at, updated_at, user_id)
    SELECT (CASE property_type WHEN 'CYLINDRICAL_HABITAT' THEN 'Habitat Cilíndrico'
                              WHEN 'ICE_HOME' THEN 'Casa de Gelo'
                              WHEN 'UNDERGROUND_MANSION' THEN 'Residência Subterrânea'
                              WHEN 'CONNECTED_MODULAR_COMPLEX' THEN 'Complexo Modular'
                              ELSE 'Domo Geodésico' END) || ' ' || nickname || ' — ' || region,
           'Anúncio fictício de demonstração. Unidade ' || nickname || ' no setor cadastrado ' || region
           || ', com ' || bedrooms || ' dormitórios, ' || bathrooms || ' banheiros e '
           || habitable_area || ' m² de área habitável. Ambiente pressurizado com sistemas ilustrativos'
           || ' de oxigenação, reciclagem de água e proteção contra radiação. Valores e características'
           || ' foram gerados para testes; não representam imóveis ou serviços reais.',
           property_type, transaction_type,
           round((CASE WHEN transaction_type='RENT' THEN 1200+random()*18800 ELSE 180000+random()*2820000 END)::numeric,2),
           bedrooms, bathrooms, habitable_area, capacity,
           'Colônia ' || region, region, 'Complexo ' || nickname, unit_code,
           'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, user_id
    FROM seed_candidates
    RETURNING id, user_id
)
SELECT * FROM inserted;

INSERT INTO property_details(property_id, has_parking, parking_spaces, parking_type, radiation_protection,
                             radiation_protection_level, shielding_material, energy_source,
                             energy_autonomy_hours, energy_storage_system, oxygen_system,
                             atmospheric_pressure_control, water_recycling, environmental_control)
SELECT id, true, 1+floor(random()*3)::integer, 'Garagem pressurizada (demonstração)',
       'Blindagem multicamada (demonstração)',
       (ARRAY['Básico ilustrativo','Intermediário ilustrativo','Avançado ilustrativo'])[1+floor(random()*3)::integer],
       (ARRAY['Regolito e compósitos','Gelo e polímeros','Cerâmica e compósitos'])[1+floor(random()*3)::integer],
       (ARRAY['Solar','Solar e baterias','Sistema híbrido ilustrativo'])[1+floor(random()*3)::integer],
       24+floor(random()*145)::integer, 'Baterias de reserva (demonstração)', true, true, true, true
FROM seed_inserted;

-- Reuse only public HTTP(S) images already present in the catalog. No new external asset is fetched.
INSERT INTO property_images(property_id, image_url, caption, display_order, is_primary, created_at)
SELECT p.id, i.image_url, 'Imagem ilustrativa do catálogo demonstrativo.', 0, true, CURRENT_TIMESTAMP
FROM seed_inserted p JOIN seed_image_pool i
ON i.ordinal = 1 + (p.id % nullif((SELECT count(*) FROM seed_image_pool),0));

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM seed_users u LEFT JOIN properties p
        ON p.user_id=u.id AND p.unit_code LIKE 'DEMO-20261108-U' || u.id || '-%'
        GROUP BY u.id HAVING count(p.id)<>20 OR count(DISTINCT p.sector_name)<>(SELECT count(*) FROM seed_regions)
    ) THEN RAISE EXCEPTION 'Seed validation failed: expected 20 listings covering all regions for each non-admin user.';
    END IF;
    IF EXISTS (SELECT 1 FROM seed_inserted p JOIN users u ON u.id=p.user_id WHERE u.role<>'USER') THEN
        RAISE EXCEPTION 'Seed validation failed: an administrator would receive demo listings.';
    END IF;
END $$;

SELECT u.id AS user_id, u.full_name,
       (SELECT count(*) FROM seed_inserted p WHERE p.user_id=u.id) AS created_now,
       count(p.id) AS batch_total, count(DISTINCT p.sector_name) AS covered_regions
FROM seed_users u LEFT JOIN properties p ON p.user_id=u.id AND p.unit_code LIKE 'DEMO-20261108-U' || u.id || '-%'
GROUP BY u.id,u.full_name ORDER BY u.id;
SELECT count(*) AS created_total FROM seed_inserted;
COMMIT;
