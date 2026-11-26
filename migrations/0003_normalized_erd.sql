-- Migration 0003: Normalized Room Booking Service DBMS ERD
-- Implements ROLE, POSITION, BOOKING_STATUS lookup tables and 3NF foreign keys

CREATE TABLE IF NOT EXISTS ROLE (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(20) UNIQUE NOT NULL CHECK(role_name IN ('admin', 'staff'))
);

CREATE TABLE IF NOT EXISTS POSITION (
    position_id INTEGER PRIMARY KEY AUTOINCREMENT,
    position_name VARCHAR(40) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS BOOKING_STATUS (
    booking_status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_status VARCHAR(20) UNIQUE NOT NULL CHECK(booking_status IN ('confirmed', 'checked-in', 'completed', 'cancelled'))
);

INSERT OR IGNORE INTO ROLE (role_id, role_name) VALUES (1, 'admin'), (2, 'staff');
INSERT OR IGNORE INTO POSITION (position_id, position_name) VALUES
    (1, 'administrator'),
    (2, 'receptionist'),
    (3, 'General Manager'),
    (4, 'Head Concierge'),
    (5, 'Front Desk Supervisor');
INSERT OR IGNORE INTO BOOKING_STATUS (booking_status_id, booking_status) VALUES
    (1, 'confirmed'),
    (2, 'checked-in'),
    (3, 'completed'),
    (4, 'cancelled');

-- Normalized USER_ACCOUNT (role_id FK -> ROLE)
CREATE TABLE IF NOT EXISTS USER_ACCOUNT_V2 (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    acc_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(acc_status IN ('active', 'suspended')),
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES ROLE(role_id)
);

-- Normalized STAFF_DETAILS (position_id FK -> POSITION)
CREATE TABLE IF NOT EXISTS STAFF_DETAILS_V2 (
    staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    position_id INTEGER NOT NULL,
    contact_number VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER_ACCOUNT_V2(user_id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES POSITION(position_id)
);

-- Normalized GUEST_DETAILS (guest_id PK, independent of USER_ACCOUNT)
CREATE TABLE IF NOT EXISTS GUEST_DETAILS_V2 (
    guest_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    birth_date DATE NULL,
    nationality VARCHAR(20) NULL,
    civil_status VARCHAR(20) NULL,
    contact_number VARCHAR(20) UNIQUE NULL,
    email_address VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NULL
);

-- Normalized ROOM_BOOKING (guest_id FK -> GUEST_DETAILS, booking_status_id FK -> BOOKING_STATUS)
CREATE TABLE IF NOT EXISTS ROOM_BOOKING_V2 (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status_id INTEGER NOT NULL,
    FOREIGN KEY (guest_id) REFERENCES GUEST_DETAILS_V2(guest_id),
    FOREIGN KEY (room_id) REFERENCES ROOM_DETAILS(room_id),
    FOREIGN KEY (booking_status_id) REFERENCES BOOKING_STATUS(booking_status_id)
);
