// Database Schema Types based on DBMS ERD for Burgundy Suite & Resort

export type UserRole = 'admin' | 'staff' | 'guest';
export type AccountStatus = 'active' | 'suspended';
export type RoomType = 'Deluxe Suite' | 'Executive King' | 'Presidential Suite' | 'Penthouse Haven';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'under maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

// Lookup Tables (3NF Normalized ERD)
export interface RoleRecord {
  role_id: number;
  role_name: 'admin' | 'staff';
}

export interface PositionRecord {
  position_id: number;
  position_name: string;
}

export interface BookingStatusRecord {
  booking_status_id: number;
  booking_status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
}

// 1. USER_ACCOUNT
export interface UserAccount {
  user_id: number;
  user_name: string;
  password_hash: string;
  role_id?: number;
  user_role: UserRole;
  acc_status: AccountStatus;
  created_date: string;
}

// 2. STAFF_DETAILS
export interface StaffDetails {
  staff_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  position_id?: number;
  position: string;
  contact_number: string;
}

// 3. GUEST_DETAILS
export interface GuestDetails {
  guest_id?: number;
  user_id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationality: string;
  civil_status: string;
  contact_number: string;
  email_address: string;
  address: string;
}

// 4. ROOM_TYPE_DETAILS
export interface RoomTypeDetails {
  room_type_id: number;
  room_type: string;
  room_capacity: number;
  rate_per_night: number;
  description?: string;
  image_url?: string;
  badge?: string;
  features?: string[];
}

export interface NewRoomTypeRequest {
  room_type: string;
  room_capacity: number;
  rate_per_night: number;
  description: string;
  image_url: string;
  badge?: string;
  features: string[];
}

// 5. ROOM_DETAILS
export interface RoomDetails {
  room_id: number;
  room_type_id: number;
  room_number: number;
  floor_number: number;
  room_status: RoomStatus;
}

// 6. ROOM_BOOKING
export interface RoomBooking {
  booking_id: number;
  guest_id?: number;
  user_id: number;
  room_id: number;
  booking_date: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  booking_status_id?: number;
  booking_status: BookingStatus;
}

// 7. PAYMENT_DETAILS
export interface PaymentDetails {
  payment_id: number;
  booking_id: number;
  payment_method: string;
  amount: number;
  payment_status: PaymentStatus;
  payment_date: string | null;
}

// Joined / Composite Views for Application Surfaces
export interface RoomWithDetails extends RoomDetails {
  room_type: string;
  room_capacity: number;
  rate_per_night: number;
  image_url: string;
  description: string;
  features: string[];
}

export interface BookingWithDetails extends RoomBooking {
  guest: GuestDetails;
  room: RoomDetails;
  room_type: RoomTypeDetails;
  payment?: PaymentDetails;
}

export interface AdminKPIs {
  total_revenue: number;
  weekly_revenue_delta: string;
  occupancy_rate_percent: number;
  occupied_rooms_count: number;
  total_rooms_count: number;
  pending_checkouts_today_count: number;
  avg_stay_duration_nights: number;
  weekly_performance_chart: Array<{
    day: string;
    revenue: number;
    occupancy_pct: number;
    label: string;
  }>;
}

export interface NewBookingRequest {
  room_type_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_birth_date: string;
  guest_nationality: string;
  guest_civil_status: string;
  guest_contact_number: string;
  guest_email: string;
  guest_address: string;
  payment_method: string;
}

export interface NewAccountRequest {
  user_name: string;
  password: string;
  user_role: 'admin' | 'staff';
  first_name: string;
  last_name: string;
  position: string;
  contact_number: string;
}

export interface StaffAccountWithUser {
  user_id: number;
  user_name: string;
  user_role: 'admin' | 'staff';
  acc_status: AccountStatus;
  created_date: string;
  staff_id: number;
  first_name: string;
  last_name: string;
  position: string;
  contact_number: string;
}

export interface UpdateAccountRequest {
  user_id: number;
  user_name?: string;
  password?: string;
  user_role?: 'admin' | 'staff';
  first_name?: string;
  last_name?: string;
  position?: string;
  contact_number?: string;
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

export interface RoomAvailabilityResult {
  room_type_id: number;
  room_type: string;
  room_capacity: number;
  rate_per_night: number;
  description?: string;
  image_url?: string;
  badge?: string;
  features?: string[];
  total_rooms: number;
  available_rooms: number;
  is_available: boolean;
  available_room_numbers: number[];
  nights: number;
  total_estimated_rate: number;
}

export interface RoomAvailabilityResponse {
  check_in_date: string;
  check_out_date: string;
  nights: number;
  results: RoomAvailabilityResult[];
}

// 8. GUEST_REVIEW (Service & Rooms Feedback)
export type ReviewTargetType = 'room' | 'service' | 'both';

export interface GuestReview {
  review_id: number;
  booking_id: number | null;
  room_type_id: number | null;
  room_type?: string | null;
  target_type: ReviewTargetType;
  guest_name: string;
  guest_email: string;
  room_rating: number;
  service_rating: number;
  overall_rating: number;
  comment: string;
  staff_reply: string | null;
  replied_by: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface NewReviewRequest {
  booking_id?: number | null;
  room_type_id?: number | null;
  target_type?: ReviewTargetType;
  guest_name: string;
  guest_email: string;
  room_rating: number;
  service_rating: number;
  comment: string;
}

export interface ReviewReplyRequest {
  staff_reply: string;
  replied_by?: string;
}


