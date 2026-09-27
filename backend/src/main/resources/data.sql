INSERT INTO service_categories (name, icon, description) VALUES
    ('AC Repair', '❄️', 'Deep cleaning, gas refill, repair & installation')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO service_categories (name, icon, description) VALUES
    ('Electrician', '⚡', 'Switchboard, wiring, fans, lights & invertors')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO service_categories (name, icon, description) VALUES
    ('Cleaning', '🧹', 'Full home, kitchen, bathroom & sofa deep cleaning')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO service_categories (name, icon, description) VALUES
    ('Plumbing', '🔧', 'Taps, leakage, pipe fittings, geyser & motors')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO service_categories (name, icon, description) VALUES
    ('Appliance Repair', '🧺', 'Washing machines, microwave, refrigerators & TV')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO service_categories (name, icon, description) VALUES
    ('Beauty & Salon', '💇', 'Salon at home, waxing, facials, haircut & spa')
    ON CONFLICT (name) DO NOTHING;

-- Sample catalogue (idempotent: safe to run on every startup)

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'AC Deep Cleaning (Split)', 799, '60 mins', 'Jet-pump foam wash of indoor and outdoor unit, filter and coil cleaning.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'AC Repair'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'AC Deep Cleaning (Split)');

INSERT INTO service_addons (service_id, name, price, description)
SELECT s.id, 'Gas top-up', 1499, 'R32/R410A refill up to 400g'
FROM services s
WHERE s.title = 'AC Deep Cleaning (Split)'
  AND NOT EXISTS (SELECT 1 FROM service_addons a WHERE a.service_id = s.id AND a.name = 'Gas top-up');

INSERT INTO service_addons (service_id, name, price, description)
SELECT s.id, 'Anti-rust coating', 299, 'Protective coil coating'
FROM services s
WHERE s.title = 'AC Deep Cleaning (Split)'
  AND NOT EXISTS (SELECT 1 FROM service_addons a WHERE a.service_id = s.id AND a.name = 'Anti-rust coating');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'AC Gas Refill & Leak Fix', 1999, '90 mins', 'Leak detection, brazing and full gas recharge.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'AC Repair'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'AC Gas Refill & Leak Fix');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'Fan / Light Installation', 349, '30 mins', 'Installation of ceiling fan, tube light or decorative light.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'Electrician'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'Fan / Light Installation');

INSERT INTO service_addons (service_id, name, price, description)
SELECT s.id, 'Additional point', 149, 'Each additional fixture'
FROM services s
WHERE s.title = 'Fan / Light Installation'
  AND NOT EXISTS (SELECT 1 FROM service_addons a WHERE a.service_id = s.id AND a.name = 'Additional point');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'Switchboard & Wiring Repair', 499, '45 mins', 'Fault finding and repair of switchboards and internal wiring.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'Electrician'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'Switchboard & Wiring Repair');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'Full Home Deep Cleaning (2 BHK)', 2999, '5 hrs', 'Top-to-bottom cleaning of rooms, kitchen and bathrooms.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'Cleaning'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'Full Home Deep Cleaning (2 BHK)');

INSERT INTO service_addons (service_id, name, price, description)
SELECT s.id, 'Balcony cleaning', 399, 'Sweep, scrub and wash'
FROM services s
WHERE s.title = 'Full Home Deep Cleaning (2 BHK)'
  AND NOT EXISTS (SELECT 1 FROM service_addons a WHERE a.service_id = s.id AND a.name = 'Balcony cleaning');

INSERT INTO service_addons (service_id, name, price, description)
SELECT s.id, 'Inside-fridge cleaning', 299, 'Defrost and sanitise'
FROM services s
WHERE s.title = 'Full Home Deep Cleaning (2 BHK)'
  AND NOT EXISTS (SELECT 1 FROM service_addons a WHERE a.service_id = s.id AND a.name = 'Inside-fridge cleaning');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'Bathroom Deep Cleaning', 499, '60 mins', 'Descaling, tile scrubbing and fixtures polish.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'Cleaning'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'Bathroom Deep Cleaning');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'Tap & Pipe Leakage Repair', 299, '45 mins', 'Diagnose and fix leaking taps, joints and pipes.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'Plumbing'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'Tap & Pipe Leakage Repair');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'Geyser Installation / Service', 599, '60 mins', 'Install or service electric and gas geysers.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'Plumbing'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'Geyser Installation / Service');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'Washing Machine Repair', 449, '60 mins', 'Inspection and repair for front and top-load machines.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'Appliance Repair'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'Washing Machine Repair');

INSERT INTO services (category_id, title, price, duration, description, cancellation_policy)
SELECT c.id, 'Haircut & Styling at Home', 599, '45 mins', 'Professional haircut and styling at your doorstep.', 'Free cancellation until the provider confirms; a fee may apply afterwards.'
FROM service_categories c
WHERE c.name = 'Beauty & Salon'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.title = 'Haircut & Styling at Home');
