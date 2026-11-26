-- Migration 0002: Guest Reviews & Feedback (Service and Rooms)
-- Compatible with Cloudflare D1 / SQLite

CREATE TABLE IF NOT EXISTS GUEST_REVIEW (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NULL,
    room_type_id INTEGER NULL,
    target_type VARCHAR(20) NOT NULL CHECK(target_type IN ('room', 'service', 'both')),
    guest_name VARCHAR(80) NOT NULL,
    guest_email VARCHAR(80) NOT NULL,
    room_rating INTEGER NOT NULL CHECK(room_rating BETWEEN 1 AND 5),
    service_rating INTEGER NOT NULL CHECK(service_rating BETWEEN 1 AND 5),
    overall_rating INTEGER NOT NULL CHECK(overall_rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    staff_reply TEXT NULL,
    replied_by VARCHAR(80) NULL,
    replied_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES ROOM_BOOKING(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (room_type_id) REFERENCES ROOM_TYPE_DETAILS(room_type_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_review_room_type ON GUEST_REVIEW(room_type_id);
CREATE INDEX IF NOT EXISTS idx_review_created ON GUEST_REVIEW(created_at DESC);
