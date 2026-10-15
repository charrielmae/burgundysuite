-- Mock Seed Data for Burgundy Suite & Resort
-- Aligned with exact ERD specifications & Admin KPI benchmarks

-- 1. Insert USER_ACCOUNT
INSERT INTO USER_ACCOUNT (user_id, user_name, password_hash, user_role, acc_status, created_date) VALUES
(1, 'admin_clara', '$2a$12$e9qO9W5n2hW6GZ9VwO9L8OBG.bJ3c7r3h1k9vEwJ3lA8w1m2a3b4c', 'admin', 'active', '2026-09-01 08:00:00'),
(2, 'staff_vincent', '$2a$12$e9qO9W5n2hW6GZ9VwO9L8OBG.bJ3c7r3h1k9vEwJ3lA8w1m2a3b4c', 'staff', 'active', '2026-09-05 09:30:00'),
(3, 'staff_helena', '$2a$12$e9qO9W5n2hW6GZ9VwO9L8OBG.bJ3c7r3h1k9vEwJ3lA8w1m2a3b4c', 'staff', 'active', '2026-09-10 11:15:00'),
(4, 'guest_julian', '$2a$12$e9qO9W5n2hW6GZ9VwO9L8OBG.bJ3c7r3h1k9vEwJ3lA8w1m2a3b4c', 'guest', 'active', '2026-10-01 14:20:00'),
(5, 'guest_eleanor', '$2a$12$e9qO9W5n2hW6GZ9VwO9L8OBG.bJ3c7r3h1k9vEwJ3lA8w1m2a3b4c', 'guest', 'active', '2026-10-03 16:45:00'),
(6, 'guest_marcus', '$2a$12$e9qO9W5n2hW6GZ9VwO9L8OBG.bJ3c7r3h1k9vEwJ3lA8w1m2a3b4c', 'guest', 'active', '2026-10-05 10:10:00'),
(7, 'guest_sophia', '$2a$12$e9qO9W5n2hW6GZ9VwO9L8OBG.bJ3c7r3h1k9vEwJ3lA8w1m2a3b4c', 'guest', 'active', '2026-10-08 12:00:00');

-- 2. Insert STAFF_DETAILS
INSERT INTO STAFF_DETAILS (staff_id, user_id, first_name, last_name, position, contact_number) VALUES
(101, 1, 'Clara', 'Montague', 'General Manager', '+63 917 555 8822'),
(102, 2, 'Vincent', 'Moreau', 'Head Concierge', '+63 917 555 3341'),
(103, 3, 'Helena', 'Reyes', 'Front Desk Lead', '+63 917 555 4490');

-- 3. Insert GUEST_DETAILS
INSERT INTO GUEST_DETAILS (user_id, first_name, last_name, birth_date, nationality, civil_status, contact_number, email_address, address) VALUES
(4, 'Julian', 'Vance', '1984-06-15', 'British', 'Married', '+63 917 800 1420', 'julian.vance@vancemedia.co.uk', '45 Belgrave Square, Kensington, London, UK'),
(5, 'Eleanor', 'Sterling', '1991-03-22', 'American', 'Single', '+63 918 800 0189', 'eleanor.sterling@apexcap.com', '740 Park Avenue, Apt 14B, New York, NY, USA'),
(6, 'Marcus', 'Aurelius-Tan', '1988-11-09', 'Singaporean', 'Married', '+63 919 800 4567', 'marcus.tan@solarisventures.sg', '12 Ardmore Park, #20-01, Singapore'),
(7, 'Sophia', 'Laurent', '1995-08-30', 'French', 'Single', '+63 920 800 5678', 'sophia.laurent@parisinspire.fr', '18 Rue de la Paix, 75002 Paris, France');

-- 4. Insert ROOM_TYPE_DETAILS (8 curated suite categories)
INSERT INTO ROOM_TYPE_DETAILS (room_type_id, room_type, room_capacity, rate_per_night) VALUES
(1, 'Deluxe Suite', 2, 250.00),
(2, 'Executive King', 3, 420.00),
(3, 'Presidential Suite', 4, 750.00),
(4, 'Penthouse Haven', 6, 1200.00),
(5, 'Oceanview Sunset Villa', 4, 550.00),
(6, 'Family Suite', 10, 3200.00),
(7, 'Royal Emerald Penthouse', 8, 4500.00),
(8, 'Sapphire Ocean Villa', 4, 750.00);

-- 5. Insert ROOM_DETAILS (8 realistic suites across 5 floors)
INSERT INTO ROOM_DETAILS (room_id, room_type_id, room_number, floor_number, room_status) VALUES
(1, 1, 101, 1, 'occupied'),
(2, 2, 102, 1, 'available'),
(3, 3, 201, 2, 'occupied'),
(4, 5, 202, 2, 'maintenance'),
(5, 6, 301, 3, 'available'),
(6, 8, 302, 3, 'available'),
(7, 4, 401, 4, 'occupied'),
(8, 7, 501, 5, 'available');

-- 6. Insert ROOM_BOOKING
INSERT INTO ROOM_BOOKING (booking_id, user_id, room_id, booking_date, check_in_date, check_out_date, total_amount, booking_status) VALUES
(1001, 4, 1, '2026-10-11', '2026-10-12', '2026-10-16', 1000.00, 'checked-in'),
(1002, 5, 3, '2026-10-08', '2026-10-10', '2026-10-16', 4500.00, 'checked-in'),
(1003, 6, 7, '2026-10-05', '2026-10-11', '2026-10-17', 7200.00, 'checked-in'),
(1004, 7, 2, '2026-10-02', '2026-10-05', '2026-10-09', 1680.00, 'completed');

-- 7. Insert PAYMENT_DETAILS
INSERT INTO PAYMENT_DETAILS (payment_id, booking_id, payment_method, amount, payment_status, payment_date) VALUES
(501, 1001, 'Credit Card (Visa Signature)', 1000.00, 'paid', '2026-10-11 15:42:10'),
(502, 1002, 'Amex Centurion Card', 4500.00, 'paid', '2026-10-08 19:12:04'),
(503, 1003, 'Wire Transfer / Swift', 7200.00, 'paid', '2026-10-05 11:05:32'),
(504, 1004, 'Mastercard World Elite', 1680.00, 'paid', '2026-10-02 14:28:55');

