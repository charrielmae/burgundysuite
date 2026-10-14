-- Cloudflare D1 / SQLite Initial Migration for Burgundy Suite & Resort
-- Compliant with exact 7-table DBMS ERD Specification

-- Drop existing tables if re-running
DROP TABLE IF EXISTS PAYMENT_DETAILS;
DROP TABLE IF EXISTS ROOM_BOOKING;
DROP TABLE IF EXISTS ROOM_DETAILS;
DROP TABLE IF EXISTS ROOM_TYPE_DETAILS;
DROP TABLE IF EXISTS GUEST_DETAILS;
DROP TABLE IF EXISTS STAFF_DETAILS;
DROP TABLE IF EXISTS USER_ACCOUNT;

-- 1. USER_ACCOUNT
CREATE TABLE USER_ACCOUNT (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role VARCHAR(20) NOT NULL CHECK(user_role IN ('admin', 'staff', 'guest')),
    acc_status VARCHAR(20) NOT NULL CHECK(acc_status IN ('active', 'suspended')),
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. STAFF_DETAILS
CREATE TABLE STAFF_DETAILS (
    staff_id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    position VARCHAR(20) NOT NULL,
    contact_number VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER_ACCOUNT(user_id) ON DELETE CASCADE
);

-- 3. GUEST_DETAILS
CREATE TABLE GUEST_DETAILS (
    user_id INTEGER PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    nationality VARCHAR(20) NOT NULL,
    civil_status VARCHAR(20) NOT NULL,
    contact_number VARCHAR(20) UNIQUE NOT NULL,
    email_address VARCHAR(50) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER_ACCOUNT(user_id) ON DELETE CASCADE
);

-- 4. ROOM_TYPE_DETAILS
CREATE TABLE ROOM_TYPE_DETAILS (
    room_type_id INTEGER PRIMARY KEY,
    room_type VARCHAR(20) NOT NULL CHECK(room_type IN ('Deluxe Suite', 'Executive King', 'Presidential Suite', 'Penthouse Haven')),
    room_capacity INTEGER NOT NULL,
    rate_per_night DECIMAL(10,2) NOT NULL
);

-- 5. ROOM_DETAILS
CREATE TABLE ROOM_DETAILS (
    room_id INTEGER PRIMARY KEY,
    room_type_id INTEGER NOT NULL,
    room_number INTEGER UNIQUE NOT NULL,
    floor_number INTEGER NOT NULL,
    room_status VARCHAR(20) NOT NULL CHECK(room_status IN ('available', 'occupied', 'maintenance')),
    FOREIGN KEY (room_type_id) REFERENCES ROOM_TYPE_DETAILS(room_type_id)
);

-- 6. ROOM_BOOKING
CREATE TABLE ROOM_BOOKING (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) NOT NULL CHECK(booking_status IN ('pending', 'checked-in', 'completed', 'cancelled')),
    FOREIGN KEY (user_id) REFERENCES GUEST_DETAILS(user_id),
    FOREIGN KEY (room_id) REFERENCES ROOM_DETAILS(room_id)
);

-- 7. PAYMENT_DETAILS
CREATE TABLE PAYMENT_DETAILS (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER UNIQUE NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL CHECK(payment_status IN ('unpaid', 'paid', 'refunded')),
    payment_date DATETIME NULL,
    FOREIGN KEY (booking_id) REFERENCES ROOM_BOOKING(booking_id) ON DELETE CASCADE
);

-- Create Indexes for performance
CREATE INDEX idx_user_role ON USER_ACCOUNT(user_role);
CREATE INDEX idx_room_status ON ROOM_DETAILS(room_status);
CREATE INDEX idx_booking_status ON ROOM_BOOKING(booking_status);
CREATE INDEX idx_booking_dates ON ROOM_BOOKING(check_in_date, check_out_date);
CREATE INDEX idx_payment_status ON PAYMENT_DETAILS(payment_status);
