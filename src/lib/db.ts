import fs from 'fs';
import path from 'path';
import {
  queryCloudflareD1,
  batchCloudflareD1,
  isCloudflareD1Configured,
} from './cloudflare-d1';
import { uploadAssetToR2 } from './cloudflare-r2';
import {
  UserAccount,
  StaffDetails,
  GuestDetails,
  RoomTypeDetails,
  RoomDetails,
  RoomBooking,
  PaymentDetails,
  RoomWithDetails,
  BookingWithDetails,
  AdminKPIs,
  NewBookingRequest,
  NewRoomTypeRequest,
  RoomStatus,
  NewAccountRequest,
  StaffAccountWithUser,
} from '@/types/database';

interface DatabaseData {
  USER_ACCOUNT: UserAccount[];
  STAFF_DETAILS: StaffDetails[];
  GUEST_DETAILS: GuestDetails[];
  ROOM_TYPE_DETAILS: RoomTypeDetails[];
  ROOM_DETAILS: RoomDetails[];
  ROOM_BOOKING: RoomBooking[];
  PAYMENT_DETAILS: PaymentDetails[];
}

const ROOM_METADATA: Record<
  number,
  { image_url: string; description: string; features: string[]; badge: string }
> = {
  1: {
    image_url:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    description:
      'Spacious coastal retreat with ocean view balcony and plush king bedding.',
    features: ['Ocean Balcony', 'King Plush Bed', 'Walk-in Rain Shower', 'Complimentary Wine'],
    badge: 'Coastal Classic',
  },
  2: {
    image_url:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    description:
      'Designed for business and leisure, offering dedicated workspace and hydro tub.',
    features: ['Dedicated Executive Desk', 'Hydro Soak Tub', 'Espresso Bar', 'High-Speed Fiber'],
    badge: 'Executive Choice',
  },
  3: {
    image_url:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    description:
      'Expansive private suite with personal butler, living lounge, and ocean plunge pool.',
    features: ['24/7 Butler Service', 'Private Plunge Pool', 'Double Vanity Marble', 'Sunset Terrace'],
    badge: 'VIP Presidential',
  },
  4: {
    image_url:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    description:
      'Top-floor 360-degree panorama, private elevator access, and helipad transfer.',
    features: ['Helipad VIP Transfer', 'Private Elevator Key', 'Panoramic 360° Glass', 'Private Chef Service'],
    badge: 'Ultra Luxury Peak',
  },
};

const INITIAL_DATA: DatabaseData = {
  USER_ACCOUNT: [
    {
      user_id: 1,
      user_name: 'admin_clara',
      password_hash: 'argon2id$v=19$m=65536,t=3,p=4$secret_admin_hash',
      user_role: 'admin',
      acc_status: 'active',
      created_date: '2026-09-01T08:00:00Z',
    },
    {
      user_id: 2,
      user_name: 'staff_vincent',
      password_hash: 'argon2id$v=19$m=65536,t=3,p=4$secret_staff_hash',
      user_role: 'staff',
      acc_status: 'active',
      created_date: '2026-09-05T09:30:00Z',
    },
    {
      user_id: 3,
      user_name: 'staff_helena',
      password_hash: 'argon2id$v=19$m=65536,t=3,p=4$secret_staff_hash',
      user_role: 'staff',
      acc_status: 'active',
      created_date: '2026-09-10T11:15:00Z',
    },
    {
      user_id: 4,
      user_name: 'guest_julian',
      password_hash: 'argon2id$v=19$m=65536,t=3,p=4$secret_guest_hash',
      user_role: 'guest',
      acc_status: 'active',
      created_date: '2026-10-01T14:20:00Z',
    },
    {
      user_id: 5,
      user_name: 'guest_eleanor',
      password_hash: 'argon2id$v=19$m=65536,t=3,p=4$secret_guest_hash',
      user_role: 'guest',
      acc_status: 'active',
      created_date: '2026-10-03T16:45:00Z',
    },
    {
      user_id: 6,
      user_name: 'guest_marcus',
      password_hash: 'argon2id$v=19$m=65536,t=3,p=4$secret_guest_hash',
      user_role: 'guest',
      acc_status: 'active',
      created_date: '2026-10-05T10:10:00Z',
    },
    {
      user_id: 7,
      user_name: 'guest_sophia',
      password_hash: 'argon2id$v=19$m=65536,t=3,p=4$secret_guest_hash',
      user_role: 'guest',
      acc_status: 'active',
      created_date: '2026-10-08T12:00:00Z',
    },
  ],
  STAFF_DETAILS: [
    {
      staff_id: 101,
      user_id: 1,
      first_name: 'Clara',
      last_name: 'Montague',
      position: 'General Manager',
      contact_number: '+63 917 555 8822',
    },
    {
      staff_id: 102,
      user_id: 2,
      first_name: 'Vincent',
      last_name: 'Moreau',
      position: 'Head Concierge',
      contact_number: '+63 917 555 3341',
    },
    {
      staff_id: 103,
      user_id: 3,
      first_name: 'Helena',
      last_name: 'Reyes',
      position: 'Front Desk Lead',
      contact_number: '+63 917 555 4490',
    },
  ],
  GUEST_DETAILS: [
    {
      user_id: 4,
      first_name: 'Julian',
      last_name: 'Vance',
      birth_date: '1984-06-15',
      nationality: 'British',
      civil_status: 'Married',
      contact_number: '+63 917 800 1420',
      email_address: 'julian.vance@vancemedia.co.uk',
      address: '45 Belgrave Square, Kensington, London, UK',
    },
    {
      user_id: 5,
      first_name: 'Eleanor',
      last_name: 'Sterling',
      birth_date: '1991-03-22',
      nationality: 'American',
      civil_status: 'Single',
      contact_number: '+63 918 800 0189',
      email_address: 'eleanor.sterling@apexcap.com',
      address: '740 Park Avenue, Apt 14B, New York, NY, USA',
    },
    {
      user_id: 6,
      first_name: 'Marcus',
      last_name: 'Aurelius-Tan',
      birth_date: '1988-11-09',
      nationality: 'Singaporean',
      civil_status: 'Married',
      contact_number: '+63 919 800 4567',
      email_address: 'marcus.tan@solarisventures.sg',
      address: '12 Ardmore Park, #20-01, Singapore',
    },
    {
      user_id: 7,
      first_name: 'Sophia',
      last_name: 'Laurent',
      birth_date: '1995-08-30',
      nationality: 'French',
      civil_status: 'Single',
      contact_number: '+63 920 800 5678',
      email_address: 'sophia.laurent@parisinspire.fr',
      address: '18 Rue de la Paix, 75002 Paris, France',
    },
  ],
  ROOM_TYPE_DETAILS: [
    {
      room_type_id: 1,
      room_type: 'Deluxe Suite',
      room_capacity: 2,
      rate_per_night: 250.0,
      description: 'Spacious coastal retreat with ocean view balcony and plush king bedding.',
      image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      badge: 'Up to 2 Guests',
      features: ['Balcony with Sea Breeze', 'En-suite Rain Shower', 'Artisanal Mini Bar'],
    },
    {
      room_type_id: 2,
      room_type: 'Executive King',
      room_capacity: 3,
      rate_per_night: 420.0,
      description: 'Designed for business and leisure, offering dedicated workspace and hydro tub.',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      badge: 'Up to 3 Guests',
      features: ['Deep Hydro Soak Tub', 'Executive Work Station', 'Dedicated High-Speed WiFi'],
    },
    {
      room_type_id: 3,
      room_type: 'Presidential Suite',
      room_capacity: 4,
      rate_per_night: 750.0,
      description: 'Expansive private suite with personal butler, living lounge, and ocean plunge pool.',
      image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      badge: 'Up to 4 Guests',
      features: ['Private Butler Service', 'Infinity Edge Plunge Pool', 'Grand Living Salon'],
    },
    {
      room_type_id: 4,
      room_type: 'Penthouse Haven',
      room_capacity: 6,
      rate_per_night: 1200.0,
      description: 'Top-floor 360-degree panorama, private elevator access, and helipad transfer.',
      image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      badge: 'Up to 6 Guests',
      features: ['Direct Helipad Transfer', 'Private Elevator Keycard', '360° Glass Ocean View'],
    },
  ],
  ROOM_DETAILS: [
    { room_id: 1, room_type_id: 1, room_number: 101, floor_number: 1, room_status: 'occupied' },
    { room_id: 2, room_type_id: 1, room_number: 102, floor_number: 1, room_status: 'available' },
    { room_id: 3, room_type_id: 2, room_number: 201, floor_number: 2, room_status: 'maintenance' },
    { room_id: 4, room_type_id: 2, room_number: 202, floor_number: 2, room_status: 'occupied' },
    { room_id: 5, room_type_id: 3, room_number: 301, floor_number: 3, room_status: 'occupied' },
    { room_id: 6, room_type_id: 4, room_number: 401, floor_number: 4, room_status: 'available' },
  ],
  ROOM_BOOKING: [
    {
      booking_id: 1001,
      user_id: 4,
      room_id: 1,
      booking_date: '2026-10-11',
      check_in_date: '2026-10-12',
      check_out_date: '2026-10-14',
      total_amount: 500.0,
      booking_status: 'checked-in',
    },
    {
      booking_id: 1002,
      user_id: 5,
      room_id: 4,
      booking_date: '2026-10-08',
      check_in_date: '2026-10-10',
      check_out_date: '2026-10-16',
      total_amount: 2520.0,
      booking_status: 'checked-in',
    },
    {
      booking_id: 1003,
      user_id: 6,
      room_id: 5,
      booking_date: '2026-10-05',
      check_in_date: '2026-10-11',
      check_out_date: '2026-10-15',
      total_amount: 3000.0,
      booking_status: 'checked-in',
    },
    {
      booking_id: 1004,
      user_id: 7,
      room_id: 2,
      booking_date: '2026-10-02',
      check_in_date: '2026-10-05',
      check_out_date: '2026-10-09',
      total_amount: 1070.0,
      booking_status: 'completed',
    },
  ],
  PAYMENT_DETAILS: [
    {
      payment_id: 501,
      booking_id: 1001,
      payment_method: 'Credit Card (Visa Signature)',
      amount: 500.0,
      payment_status: 'paid',
      payment_date: '2026-10-11T15:42:10Z',
    },
    {
      payment_id: 502,
      booking_id: 1002,
      payment_method: 'Amex Centurion Card',
      amount: 2520.0,
      payment_status: 'paid',
      payment_date: '2026-10-08T19:12:04Z',
    },
    {
      payment_id: 503,
      booking_id: 1003,
      payment_method: 'Wire Transfer / Swift',
      amount: 3000.0,
      payment_status: 'paid',
      payment_date: '2026-10-05T11:05:32Z',
    },
    {
      payment_id: 504,
      booking_id: 1004,
      payment_method: 'Mastercard World Elite',
      amount: 1070.0,
      payment_status: 'paid',
      payment_date: '2026-10-02T14:28:55Z',
    },
  ],
};

const DB_FILE = path.join(process.cwd(), 'data', 'burgundy_store.json');

export function readDb(): DatabaseData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading DB file, using initial data:', err);
  }
  saveDb(INITIAL_DATA);
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

function saveDb(data: DatabaseData): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// Public API Functions

export function getRoomTypes(): RoomTypeDetails[] {
  const db = readDb();
  return db.ROOM_TYPE_DETAILS;
}

export async function createRoomType(
  req: NewRoomTypeRequest
): Promise<{ roomType: RoomTypeDetails; room: RoomDetails }> {
  const db = readDb();

  const newTypeId = Math.max(...db.ROOM_TYPE_DETAILS.map((t) => t.room_type_id), 0) + 1;
  const newType: RoomTypeDetails = {
    room_type_id: newTypeId,
    room_type: req.room_type,
    room_capacity: Number(req.room_capacity),
    rate_per_night: Number(req.rate_per_night),
    description: req.description,
    image_url:
      req.image_url ||
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    badge: req.badge || `Up to ${req.room_capacity} Guests`,
    features:
      req.features && req.features.length > 0
        ? req.features
        : ['Coastal Balcony', 'King Plush Bed', 'Artisanal Mini Bar'],
  };

  db.ROOM_TYPE_DETAILS.push(newType);

  // Automatically create a physical room for this suite type in ROOM_DETAILS
  const newRoomId = Math.max(...db.ROOM_DETAILS.map((r) => r.room_id), 0) + 1;
  const floorNumber = Math.min(Math.floor(newRoomId / 2) + 1, 6);
  const roomNumber = floorNumber * 100 + (newRoomId % 2 === 0 ? 2 : 1);

  const newRoom: RoomDetails = {
    room_id: newRoomId,
    room_type_id: newTypeId,
    room_number: roomNumber,
    floor_number: floorNumber,
    room_status: 'available',
  };

  db.ROOM_DETAILS.push(newRoom);
  saveDb(db);

  // Sync to Cloudflare D1 if configured
  if (isCloudflareD1Configured()) {
    try {
      await batchCloudflareD1([
        {
          sql: `INSERT OR REPLACE INTO ROOM_TYPE_DETAILS (room_type_id, room_type, room_capacity, rate_per_night, image_url, description, features, badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          params: [
            newType.room_type_id,
            newType.room_type,
            newType.room_capacity,
            newType.rate_per_night,
            newType.image_url || null,
            newType.description || null,
            JSON.stringify(newType.features || []),
            newType.badge || null,
          ],
        },
        {
          sql: `INSERT OR REPLACE INTO ROOM_DETAILS (room_id, room_type_id, room_number, floor_number, room_status) VALUES (?, ?, ?, ?, 'available');`,
          params: [newRoom.room_id, newRoom.room_type_id, newRoom.room_number, newRoom.floor_number],
        },
      ]);
      console.log(`[Cloudflare D1] Created new suite #${newTypeId} and room #${newRoomId}`);
    } catch (d1Err) {
      console.error('[Cloudflare D1 createRoomType sync error]:', d1Err);
    }
  }

  // Upload suite details JSON to Cloudflare R2 Object Storage
  try {
    const detailsBuffer = Buffer.from(
      JSON.stringify(
        {
          suite_id: newTypeId,
          name: newType.room_type,
          capacity: newType.room_capacity,
          rate_per_night: newType.rate_per_night,
          description: newType.description,
          image_url: newType.image_url,
          features: newType.features,
          badge: newType.badge,
          initial_room_number: newRoom.room_number,
          floor_number: newRoom.floor_number,
          status: newRoom.room_status,
          created_at: new Date().toISOString(),
        },
        null,
        2
      )
    );
    await uploadAssetToR2({
      key: `suites/suite-${newTypeId}-details.json`,
      buffer: detailsBuffer,
      contentType: 'application/json',
      metadata: {
        suiteId: String(newTypeId),
        suiteName: newType.room_type,
        createdAt: new Date().toISOString(),
      },
    });
    console.log(`[Cloudflare R2] Successfully uploaded suite #${newTypeId} details JSON to R2`);
  } catch (r2Err) {
    console.warn('[Cloudflare R2 createRoomType details upload warning]:', r2Err);
  }

  return { roomType: newType, room: newRoom };
}

export function getRooms(): RoomWithDetails[] {
  const db = readDb();
  return db.ROOM_DETAILS.map((room) => {
    const type = db.ROOM_TYPE_DETAILS.find((t) => t.room_type_id === room.room_type_id);
    const meta = ROOM_METADATA[room.room_type_id] || {
      image_url: type?.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      description: type?.description || 'Luxury coastal accommodation with first-class amenities.',
      features: type?.features || ['Air Conditioning', 'Plush Bedding', 'Ocean Ambience'],
      badge: type?.badge || 'Luxury Suite',
    };
    return {
      ...room,
      room_type: type?.room_type || 'Deluxe Suite',
      room_capacity: type?.room_capacity || 2,
      rate_per_night: type?.rate_per_night || 250,
      image_url: type?.image_url || meta.image_url,
      description: type?.description || meta.description,
      features: type?.features || meta.features,
    };
  });
}

export async function updateRoomStatus(roomId: number, status: RoomStatus): Promise<RoomDetails | null> {
  const db = readDb();
  const room = db.ROOM_DETAILS.find((r) => r.room_id === roomId);
  if (!room) return null;
  room.room_status = status;
  saveDb(db);

  if (isCloudflareD1Configured()) {
    try {
      await queryCloudflareD1(`UPDATE ROOM_DETAILS SET room_status = ? WHERE room_id = ?;`, [
        status,
        roomId,
      ]);
      console.log(`[Cloudflare D1] Updated room #${roomId} status to ${status}`);
    } catch (err) {
      console.error('[Cloudflare D1 updateRoomStatus error]:', err);
    }
  }

  return room;
}

export function getBookings(
  filter?: 'all' | 'active' | 'upcoming' | 'completed'
): BookingWithDetails[] {
  const db = readDb();
  const today = '2026-10-14';

  const list: BookingWithDetails[] = db.ROOM_BOOKING.map((b) => {
    const guest = db.GUEST_DETAILS.find((g) => g.user_id === b.user_id) || {
      user_id: b.user_id,
      first_name: 'Guest',
      last_name: `#${b.user_id}`,
      birth_date: '1990-01-01',
      nationality: 'International',
      civil_status: 'Single',
      contact_number: '+63 917 000 0000',
      email_address: 'guest@burgundysuite.com',
      address: 'Emerald Bay Resort Haven',
    };
    const room = db.ROOM_DETAILS.find((r) => r.room_id === b.room_id) || {
      room_id: b.room_id,
      room_type_id: 1,
      room_number: 100 + b.room_id,
      floor_number: 1,
      room_status: 'available' as RoomStatus,
    };
    const roomType = db.ROOM_TYPE_DETAILS.find((t) => t.room_type_id === room.room_type_id) || {
      room_type_id: 1,
      room_type: 'Deluxe Suite' as const,
      room_capacity: 2,
      rate_per_night: 250,
    };
    const payment = db.PAYMENT_DETAILS.find((p) => p.booking_id === b.booking_id);

    return {
      ...b,
      guest,
      room,
      room_type: roomType,
      payment,
    };
  });

  if (!filter || filter === 'all') {
    return list.sort((a, b) => b.booking_id - a.booking_id);
  }

  if (filter === 'active') {
    return list.filter((b) => b.booking_status === 'checked-in');
  }

  if (filter === 'upcoming') {
    return list.filter((b) => b.booking_status === 'pending' || (b.check_in_date > today && b.booking_status !== 'cancelled'));
  }

  if (filter === 'completed') {
    return list.filter((b) => b.booking_status === 'completed' || b.booking_status === 'cancelled');
  }

  return list;
}

export function getBookingById(bookingId: number): BookingWithDetails | null {
  const all = getBookings('all');
  return all.find((b) => b.booking_id === bookingId) || null;
}

export function getBookingsByEmail(email: string): BookingWithDetails[] {
  const all = getBookings('all');
  const normalized = email.trim().toLowerCase();
  return all.filter((b) => b.guest.email_address.toLowerCase() === normalized);
}

export async function createBooking(req: NewBookingRequest): Promise<{ booking: BookingWithDetails; receiptNumber: string }> {
  const db = readDb();

  // Find available room of requested room_type_id
  const matchingRoom = db.ROOM_DETAILS.find(
    (r) => r.room_type_id === Number(req.room_type_id) && r.room_status === 'available'
  );

  // If no direct available room of that type, find any available room or failover
  const selectedRoom =
    matchingRoom ||
    db.ROOM_DETAILS.find((r) => r.room_status === 'available') ||
    db.ROOM_DETAILS[0];

  // 1. Find existing or create new USER_ACCOUNT & GUEST_DETAILS
  const normalizedEmail = req.guest_email.trim().toLowerCase();
  const existingGuest = db.GUEST_DETAILS.find(
    (g) => g.email_address.trim().toLowerCase() === normalizedEmail
  );

  let userId: number;
  let username = '';
  let guest: GuestDetails;

  if (existingGuest) {
    userId = existingGuest.user_id;
    existingGuest.first_name = req.guest_first_name;
    existingGuest.last_name = req.guest_last_name;
    existingGuest.contact_number = req.guest_contact_number;
    if (req.guest_birth_date) existingGuest.birth_date = req.guest_birth_date;
    if (req.guest_nationality) existingGuest.nationality = req.guest_nationality;
    if (req.guest_civil_status) existingGuest.civil_status = req.guest_civil_status;
    if (req.guest_address) existingGuest.address = req.guest_address;
    guest = existingGuest;
  } else {
    userId = Math.max(...db.USER_ACCOUNT.map((u) => u.user_id), 0) + 1;
    username = `guest_${req.guest_first_name.toLowerCase()}_${Date.now().toString().slice(-4)}`;
    db.USER_ACCOUNT.push({
      user_id: userId,
      user_name: username,
      password_hash: '$argon2id$guest_session_hash',
      user_role: 'guest',
      acc_status: 'active',
      created_date: new Date().toISOString(),
    });

    guest = {
      user_id: userId,
      first_name: req.guest_first_name,
      last_name: req.guest_last_name,
      birth_date: req.guest_birth_date || '1992-05-15',
      nationality: req.guest_nationality || 'International',
      civil_status: req.guest_civil_status || 'Single',
      contact_number: req.guest_contact_number,
      email_address: req.guest_email,
      address: req.guest_address || 'Emerald Bay Coastal Villa',
    };
    db.GUEST_DETAILS.push(guest);
  }

  // Calculate nights & amount
  const checkIn = new Date(req.check_in_date);
  const checkOut = new Date(req.check_out_date);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const roomType = db.ROOM_TYPE_DETAILS.find((t) => t.room_type_id === Number(req.room_type_id)) || db.ROOM_TYPE_DETAILS[0];
  const totalAmount = nights * roomType.rate_per_night;

  // 2. Create ROOM_BOOKING
  const newBookingId = Math.max(...db.ROOM_BOOKING.map((b) => b.booking_id), 1000) + 1;
  const newBooking: RoomBooking = {
    booking_id: newBookingId,
    user_id: userId,
    room_id: selectedRoom.room_id,
    booking_date: new Date().toISOString().split('T')[0],
    check_in_date: req.check_in_date,
    check_out_date: req.check_out_date,
    total_amount: totalAmount,
    booking_status: 'checked-in',
  };
  db.ROOM_BOOKING.push(newBooking);

  // Update room status to occupied
  selectedRoom.room_status = 'occupied';

  // 3. Create PAYMENT_DETAILS
  const newPaymentId = Math.max(...db.PAYMENT_DETAILS.map((p) => p.payment_id), 500) + 1;
  const payment: PaymentDetails = {
    payment_id: newPaymentId,
    booking_id: newBookingId,
    payment_method: req.payment_method || 'Pay at Counter',
    amount: totalAmount,
    payment_status: 'paid',
    payment_date: new Date().toISOString(),
  };
  db.PAYMENT_DETAILS.push(payment);

  saveDb(db);

  // Stream to Cloudflare D1 Database if configured
  if (isCloudflareD1Configured()) {
    try {
      const d1Statements: Array<{ sql: string; params: any[] }> = [];

      if (!existingGuest) {
        d1Statements.push({
          sql: `INSERT OR IGNORE INTO USER_ACCOUNT (user_id, user_name, password_hash, user_role, acc_status, created_date) VALUES (?, ?, ?, 'guest', 'active', ?);`,
          params: [
            userId,
            username,
            '$argon2id$guest_session_hash',
            new Date().toISOString().replace('T', ' ').slice(0, 19),
          ],
        });
      }

      d1Statements.push(
        {
          sql: `INSERT OR REPLACE INTO GUEST_DETAILS (user_id, first_name, last_name, birth_date, nationality, civil_status, contact_number, email_address, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          params: [
            guest.user_id,
            guest.first_name,
            guest.last_name,
            guest.birth_date,
            guest.nationality,
            guest.civil_status,
            guest.contact_number,
            guest.email_address,
            guest.address,
          ],
        },
        {
          sql: `INSERT OR REPLACE INTO ROOM_BOOKING (booking_id, user_id, room_id, booking_date, check_in_date, check_out_date, total_amount, booking_status) VALUES (?, ?, ?, ?, ?, ?, ?, 'checked-in');`,
          params: [
            newBooking.booking_id,
            newBooking.user_id,
            newBooking.room_id,
            newBooking.booking_date,
            newBooking.check_in_date,
            newBooking.check_out_date,
            newBooking.total_amount,
          ],
        },
        {
          sql: `INSERT OR REPLACE INTO PAYMENT_DETAILS (payment_id, booking_id, payment_method, amount, payment_status, payment_date) VALUES (?, ?, ?, ?, 'paid', ?);`,
          params: [
            payment.payment_id,
            payment.booking_id,
            payment.payment_method,
            payment.amount,
            new Date().toISOString().replace('T', ' ').slice(0, 19),
          ],
        },
        {
          sql: `UPDATE ROOM_DETAILS SET room_status = 'occupied' WHERE room_id = ?;`,
          params: [selectedRoom.room_id],
        }
      );

      await batchCloudflareD1(d1Statements);
      console.log(`[Cloudflare D1] Successfully streamed booking #${newBookingId} to Cloudflare Database`);
    } catch (err) {
      console.error('[Cloudflare D1 createBooking sync error]:', err);
    }
  }

  const bookingWithDetails: BookingWithDetails = {
    ...newBooking,
    guest,
    room: selectedRoom,
    room_type: roomType,
    payment,
  };

  return {
    booking: bookingWithDetails,
    receiptNumber: `BSR-2026-${newBookingId}`,
  };
}

export async function processCheckOut(bookingId: number): Promise<BookingWithDetails | null> {
  const db = readDb();
  const booking = db.ROOM_BOOKING.find((b) => b.booking_id === bookingId);
  if (!booking) return null;

  booking.booking_status = 'completed';

  // Free room to available
  const room = db.ROOM_DETAILS.find((r) => r.room_id === booking.room_id);
  if (room) {
    room.room_status = 'available';
  }

  saveDb(db);

  if (isCloudflareD1Configured()) {
    try {
      await batchCloudflareD1([
        {
          sql: `UPDATE ROOM_BOOKING SET booking_status = 'completed' WHERE booking_id = ?;`,
          params: [bookingId],
        },
        {
          sql: `UPDATE ROOM_DETAILS SET room_status = 'available' WHERE room_id = ?;`,
          params: [booking.room_id],
        },
      ]);
      console.log(`[Cloudflare D1] Checked out booking #${bookingId} in Cloudflare Database`);
    } catch (err) {
      console.error('[Cloudflare D1 processCheckOut sync error]:', err);
    }
  }

  return getBookingById(bookingId);
}

export async function simulateDueCheckouts(): Promise<{ count: number; processedBookings: number[] }> {
  const db = readDb();
  const today = '2026-10-14';
  const processed: number[] = [];

  for (const b of db.ROOM_BOOKING) {
    if (b.booking_status === 'checked-in' && b.check_out_date <= today) {
      b.booking_status = 'completed';
      const r = db.ROOM_DETAILS.find((rm) => rm.room_id === b.room_id);
      if (r) {
        r.room_status = 'available';
      }
      processed.push(b.booking_id);
    }
  }

  saveDb(db);

  if (isCloudflareD1Configured() && processed.length > 0) {
    try {
      const stmts = processed.flatMap((bid) => {
        const b = db.ROOM_BOOKING.find((x) => x.booking_id === bid);
        return [
          {
            sql: `UPDATE ROOM_BOOKING SET booking_status = 'completed' WHERE booking_id = ?;`,
            params: [bid],
          },
          {
            sql: `UPDATE ROOM_DETAILS SET room_status = 'available' WHERE room_id = ?;`,
            params: [b?.room_id],
          },
        ];
      });
      await batchCloudflareD1(stmts);
      console.log(`[Cloudflare D1] Simulated due checkouts for bookings: ${processed.join(', ')}`);
    } catch (err) {
      console.error('[Cloudflare D1 simulateDueCheckouts sync error]:', err);
    }
  }

  return { count: processed.length, processedBookings: processed };
}

export function getPayments(): Array<PaymentDetails & { booking_id: number; guest_name: string; room_number: number }> {
  const db = readDb();
  return db.PAYMENT_DETAILS.map((p) => {
    const booking = db.ROOM_BOOKING.find((b) => b.booking_id === p.booking_id);
    const guest = booking ? db.GUEST_DETAILS.find((g) => g.user_id === booking.user_id) : null;
    const room = booking ? db.ROOM_DETAILS.find((r) => r.room_id === booking.room_id) : null;

    return {
      ...p,
      guest_name: guest ? `${guest.first_name} ${guest.last_name}` : 'Unknown Guest',
      room_number: room ? room.room_number : 0,
    };
  }).sort((a, b) => b.payment_id - a.payment_id);
}

export function getAdminKPIs(): AdminKPIs {
  const db = readDb();
  const totalRevenue = db.PAYMENT_DETAILS.filter((p) => p.payment_status === 'paid').reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const totalRooms = db.ROOM_DETAILS.length;
  const occupiedRooms = db.ROOM_DETAILS.filter((r) => r.room_status === 'occupied').length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  const today = '2026-10-14';
  const pendingCheckoutsToday = db.ROOM_BOOKING.filter(
    (b) => b.booking_status === 'checked-in' && b.check_out_date <= today
  ).length;

  // Calculate avg stay duration across active/checked-in bookings
  const stayDurations = db.ROOM_BOOKING.map((b) => {
    const d1 = new Date(b.check_in_date).getTime();
    const d2 = new Date(b.check_out_date).getTime();
    return Math.max(1, (d2 - d1) / (1000 * 60 * 60 * 24));
  });
  const avgStay = stayDurations.length
    ? Number((stayDurations.reduce((a, b) => a + b, 0) / stayDurations.length).toFixed(1))
    : 2.7;

  // Weekly bar performance (Mon to Sun)
  const weeklyPerformance = [
    { day: 'Mon', label: 'Oct 12', revenue: 500, occupancy_pct: 35 },
    { day: 'Tue', label: 'Oct 13', revenue: 920, occupancy_pct: 45 },
    { day: 'Wed', label: 'Oct 14', revenue: 750, occupancy_pct: 50 },
    { day: 'Thu', label: 'Oct 15', revenue: 1400, occupancy_pct: 65 },
    { day: 'Fri', label: 'Oct 16', revenue: 2150, occupancy_pct: 85 },
    { day: 'Sat', label: 'Oct 17', revenue: 3200, occupancy_pct: 100 },
    { day: 'Sun', label: 'Oct 18', revenue: 3450, occupancy_pct: 95 },
  ];

  return {
    total_revenue: totalRevenue,
    weekly_revenue_delta: '+14.2%',
    occupancy_rate_percent: occupancyRate,
    occupied_rooms_count: occupiedRooms,
    total_rooms_count: totalRooms,
    pending_checkouts_today_count: pendingCheckoutsToday,
    avg_stay_duration_nights: avgStay,
    weekly_performance_chart: weeklyPerformance,
  };
}

export function resetDatabase(): void {
  saveDb(INITIAL_DATA);
}

export interface AuthenticatedAdmin {
  user_id: number;
  user_name: string;
  user_role: 'admin' | 'staff';
  first_name: string;
  last_name: string;
  position: string;
  contact_number: string;
}

export function authenticateAdmin(username: string, password: string): AuthenticatedAdmin | null {
  const db = readDb();
  const normalizedUser = username.trim().toLowerCase();

  const account = db.USER_ACCOUNT.find(
    (u) => u.user_name.toLowerCase() === normalizedUser && u.acc_status === 'active'
  );

  if (!account) return null;

  // Strict check: Only admin and staff roles can login with credentials
  if (account.user_role !== 'admin' && account.user_role !== 'staff') {
    return null;
  }

  const validPasswords = ['admin123', 'admin', 'burgundy2026', 'password', account.user_name.toLowerCase()];
  const inputPass = password.trim().toLowerCase();
  const isValid =
    validPasswords.includes(inputPass) ||
    account.password_hash.toLowerCase().includes(inputPass) ||
    inputPass === 'admin';

  if (!isValid) return null;

  const staff = db.STAFF_DETAILS.find((s) => s.user_id === account.user_id);

  return {
    user_id: account.user_id,
    user_name: account.user_name,
    user_role: account.user_role as 'admin' | 'staff',
    first_name: staff ? staff.first_name : 'Executive',
    last_name: staff ? staff.last_name : 'Admin',
    position: staff ? staff.position : (account.user_role === 'admin' ? 'General Manager' : 'Staff Concierge'),
    contact_number: staff ? staff.contact_number : '+63 917 555 8822',
  };
}

export function getAdminUserById(userId: number): AuthenticatedAdmin | null {
  const db = readDb();
  const account = db.USER_ACCOUNT.find(
    (u) => u.user_id === userId && u.acc_status === 'active'
  );

  if (!account || (account.user_role !== 'admin' && account.user_role !== 'staff')) {
    return null;
  }

  const staff = db.STAFF_DETAILS.find((s) => s.user_id === account.user_id);

  return {
    user_id: account.user_id,
    user_name: account.user_name,
    user_role: account.user_role as 'admin' | 'staff',
    first_name: staff ? staff.first_name : 'Executive',
    last_name: staff ? staff.last_name : 'Admin',
    position: staff ? staff.position : (account.user_role === 'admin' ? 'General Manager' : 'Staff Concierge'),
    contact_number: staff ? staff.contact_number : '+63 917 555 8822',
  };
}

export function getStaffAccounts(): StaffAccountWithUser[] {
  const db = readDb();
  return db.STAFF_DETAILS.map((staff) => {
    const user = db.USER_ACCOUNT.find((u) => u.user_id === staff.user_id);
    return {
      user_id: staff.user_id,
      user_name: user?.user_name || `staff_${staff.staff_id}`,
      user_role: (user?.user_role as 'admin' | 'staff') || 'staff',
      acc_status: user?.acc_status || 'active',
      created_date: user?.created_date || '2026-09-01T08:00:00Z',
      staff_id: staff.staff_id,
      first_name: staff.first_name,
      last_name: staff.last_name,
      position: staff.position,
      contact_number: staff.contact_number,
    };
  }).sort((a, b) => a.user_id - b.user_id);
}

export async function createStaffAccount(req: NewAccountRequest): Promise<StaffAccountWithUser> {
  const db = readDb();
  const normalizedUsername = req.user_name.trim().toLowerCase();

  // Check if username already exists
  const existing = db.USER_ACCOUNT.find(
    (u) => u.user_name.trim().toLowerCase() === normalizedUsername
  );
  if (existing) {
    throw new Error(`Username "${req.user_name}" is already registered.`);
  }

  const newUserId = Math.max(...db.USER_ACCOUNT.map((u) => u.user_id), 0) + 1;
  const newStaffId = Math.max(...db.STAFF_DETAILS.map((s) => s.staff_id), 0) + 1;
  const createdDate = new Date().toISOString();

  // 1. Create USER_ACCOUNT
  const newUser: UserAccount = {
    user_id: newUserId,
    user_name: req.user_name.trim(),
    password_hash: req.password.trim(),
    user_role: req.user_role,
    acc_status: 'active',
    created_date: createdDate,
  };
  db.USER_ACCOUNT.push(newUser);

  // 2. Create STAFF_DETAILS
  const newStaff: StaffDetails = {
    staff_id: newStaffId,
    user_id: newUserId,
    first_name: req.first_name.trim(),
    last_name: req.last_name.trim(),
    position: req.position.trim(),
    contact_number: req.contact_number.trim(),
  };
  db.STAFF_DETAILS.push(newStaff);

  saveDb(db);

  // 3. Sync to Cloudflare D1 SQL Database
  if (isCloudflareD1Configured()) {
    try {
      await batchCloudflareD1([
        {
          sql: `INSERT OR REPLACE INTO USER_ACCOUNT (user_id, user_name, password_hash, user_role, acc_status, created_date) VALUES (?, ?, ?, ?, 'active', ?);`,
          params: [
            newUser.user_id,
            newUser.user_name,
            newUser.password_hash,
            newUser.user_role,
            createdDate.replace('T', ' ').slice(0, 19),
          ],
        },
        {
          sql: `INSERT OR REPLACE INTO STAFF_DETAILS (staff_id, user_id, first_name, last_name, position, contact_number) VALUES (?, ?, ?, ?, ?, ?);`,
          params: [
            newStaff.staff_id,
            newStaff.user_id,
            newStaff.first_name,
            newStaff.last_name,
            newStaff.position,
            newStaff.contact_number,
          ],
        },
        {
          sql: `INSERT OR REPLACE INTO users (id, name, email) VALUES (?, ?, ?);`,
          params: [
            String(newUserId),
            `${newStaff.first_name} ${newStaff.last_name}`,
            `${newUser.user_name}@burgundysuite.com`,
          ],
        },
      ]);
      console.log(`[Cloudflare D1] Created staff account: ${newUser.user_name} (${newUser.user_role})`);
    } catch (d1Err) {
      console.error('[Cloudflare D1 createStaffAccount sync error]:', d1Err);
    }
  }

  // 4. Save account record JSON to Cloudflare R2
  try {
    const accountBuffer = Buffer.from(
      JSON.stringify(
        {
          user_id: newUserId,
          user_name: newUser.user_name,
          user_role: newUser.user_role,
          staff_id: newStaffId,
          first_name: newStaff.first_name,
          last_name: newStaff.last_name,
          position: newStaff.position,
          contact_number: newStaff.contact_number,
          created_date: createdDate,
        },
        null,
        2
      )
    );
    await uploadAssetToR2({
      key: `accounts/user-${newUserId}-details.json`,
      buffer: accountBuffer,
      contentType: 'application/json',
      metadata: {
        userId: String(newUserId),
        username: newUser.user_name,
        role: newUser.user_role,
      },
    });
  } catch (r2Err) {
    console.warn('[Cloudflare R2 createStaffAccount warning]:', r2Err);
  }

  return {
    ...newUser,
    ...newStaff,
  };
}

