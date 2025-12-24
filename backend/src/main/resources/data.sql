INSERT INTO users (email, password, full_name, phone, address, role)
VALUES (
    'admin@crms.com',
    '$2y$10$i23v1hexS//yvti92QXZy.E/a9w6EAaIf8T7PCMmISun.fnMwYu0K',
    'Fleet Admin',
    '+90 555 000 0000',
    'Central Operations HQ',
    'ADMIN'
)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    role = EXCLUDED.role;

INSERT INTO admins (id, staff_code)
SELECT id, 'ADMIN-001'
FROM users
WHERE email = 'admin@crms.com'
ON CONFLICT (id) DO UPDATE
SET staff_code = EXCLUDED.staff_code;

INSERT INTO locations (code, name, address, phone)
VALUES
    ('IST-AIR', 'Istanbul Airport Branch', 'Tayakadin Terminal Rd, Arnavutkoy', '+90 212 444 4444'),
    ('IZM-DWT', 'Izmir Downtown Branch', 'Cumhuriyet Blvd No:32', '+90 232 555 5525'),
    ('ANK-CEN', 'Ankara Central Branch', 'Tunali Hilmi Cd. No:80', '+90 312 600 1200'),
    ('ANT-AIR', 'Antalya Airport Branch', 'Yesilkoy Airport Road', '+90 242 330 2424')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone;

INSERT INTO additional_services (name, daily_price)
VALUES
    ('GPS Navigation', 12.00),
    ('Child Seat', 9.00),
    ('Roadside Assistance', 15.00)
ON CONFLICT (name) DO UPDATE
SET daily_price = EXCLUDED.daily_price;

INSERT INTO equipment (name, daily_price)
VALUES
    ('Snow Chains', 8.00),
    ('WiFi Hotspot', 10.00)
ON CONFLICT (name) DO UPDATE
SET daily_price = EXCLUDED.daily_price;

INSERT INTO cars (
    make,
    model,
    model_year,
    barcode,
    license_plate,
    vin,
    car_type,
    mileage,
    seats,
    daily_rate,
    transmission,
    fuel_type,
    gps_included,
    child_seat,
    air_conditioning,
    status,
    description,
    location_id
)
VALUES (
    'Toyota',
    'Corolla',
    2022,
    'CRMS-IST-001',
    '34 CRMS 01',
    'JTDB1234567890001',
    'Sedan',
    28500,
    5,
    58.00,
    'Automatic',
    'Gasoline',
    true,
    false,
    true,
    'AVAILABLE',
    'Comfortable sedan with low fuel consumption.',
    (SELECT id FROM locations WHERE code = 'IST-AIR')
)
ON CONFLICT (license_plate) DO NOTHING;

INSERT INTO cars (
    make,
    model,
    model_year,
    barcode,
    license_plate,
    vin,
    car_type,
    mileage,
    seats,
    daily_rate,
    transmission,
    fuel_type,
    gps_included,
    child_seat,
    air_conditioning,
    status,
    description,
    location_id
)
VALUES (
    'Hyundai',
    'Tucson',
    2023,
    'CRMS-ANK-003',
    '06 CRMS 03',
    'KMH1234567890003',
    'SUV',
    14200,
    5,
    95.00,
    'Automatic',
    'Diesel',
    true,
    true,
    true,
    'AVAILABLE',
    'Spacious SUV with advanced safety features.',
    (SELECT id FROM locations WHERE code = 'ANK-CEN')
)
ON CONFLICT (license_plate) DO NOTHING;

INSERT INTO cars (
    make,
    model,
    model_year,
    barcode,
    license_plate,
    vin,
    car_type,
    mileage,
    seats,
    daily_rate,
    transmission,
    fuel_type,
    gps_included,
    child_seat,
    air_conditioning,
    status,
    description,
    location_id
)
VALUES (
    'Renault',
    'Clio',
    2021,
    'CRMS-IZM-002',
    '35 CRMS 02',
    'VF11234567890002',
    'Hatchback',
    36700,
    5,
    46.00,
    'Manual',
    'Gasoline',
    false,
    false,
    true,
    'AVAILABLE',
    'Compact hatchback ideal for city trips.',
    (SELECT id FROM locations WHERE code = 'IZM-DWT')
)
ON CONFLICT (license_plate) DO NOTHING;

INSERT INTO cars (
    make,
    model,
    model_year,
    barcode,
    license_plate,
    vin,
    car_type,
    mileage,
    seats,
    daily_rate,
    transmission,
    fuel_type,
    gps_included,
    child_seat,
    air_conditioning,
    status,
    description,
    location_id
)
VALUES (
    'Ford',
    'Transit',
    2020,
    'CRMS-ANT-004',
    '07 CRMS 04',
    'WF01234567890004',
    'Van',
    51200,
    8,
    120.00,
    'Manual',
    'Diesel',
    false,
    false,
    true,
    'AVAILABLE',
    'Large van for group travel and cargo.',
    (SELECT id FROM locations WHERE code = 'ANT-AIR')
)
ON CONFLICT (license_plate) DO NOTHING;
