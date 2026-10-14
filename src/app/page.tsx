'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HavenOverview from '@/components/HavenOverview';
import SuitesSection from '@/components/SuitesSection';
import AmenitiesSection from '@/components/AmenitiesSection';
import ReservationModal from '@/components/ReservationModal';
import MyBookingsModal from '@/components/MyBookingsModal';
import Footer from '@/components/Footer';
import { RoomTypeDetails, BookingWithDetails } from '@/types/database';

export default function GuestPortalPage() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeDetails[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | undefined>(undefined);
  const [searchDates, setSearchDates] = useState<{ checkIn: string; checkOut: string }>({
    checkIn: '',
    checkOut: '',
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch initial room types
  useEffect(() => {
    fetch('/api/room-types')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setRoomTypes(data.data);
        }
      })
      .catch((err) => console.error('Failed to load room types:', err));
  }, []);

  const handleOpenBooking = (suiteTypeId?: number) => {
    setSelectedSuiteId(suiteTypeId);
    setIsBookingOpen(true);
  };

  const handleHeroSearch = (checkIn: string, checkOut: string, roomTypeId?: number) => {
    setSearchDates({ checkIn, checkOut });
    setSelectedSuiteId(roomTypeId);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (booking: BookingWithDetails) => {
    setToastMessage(
      `Congratulations! Booking confirmed for ${booking.room_type.room_type} (Room #${booking.room.room_number}).`
    );
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <main className="min-h-screen bg-[#2B0E14] text-[#F5EFEB] flex flex-col selection:bg-[#D4AF37] selection:text-[#2B0E14]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md px-5 py-3.5 rounded-2xl bg-[#381018] border border-[#E5C378] text-white shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <span className="text-xs font-semibold text-[#E5C378]">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Luxury Navigation Bar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />

      {/* Hero Section */}
      <Hero roomTypes={roomTypes} onSearch={handleHeroSearch} />

      {/* The Haven Bento Overview Section */}
      <HavenOverview />

      {/* Curated Suites & Accommodations Grid */}
      <SuitesSection
        roomTypes={roomTypes}
        onBookSuite={(suiteId) => handleOpenBooking(suiteId)}
      />

      {/* Curated Indulgences / Amenities */}
      <AmenitiesSection />

      {/* Footer */}
      <Footer />

      {/* Multi-Step Reservation Modal */}
      <ReservationModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        roomTypes={roomTypes}
        initialRoomTypeId={selectedSuiteId}
        initialCheckIn={searchDates.checkIn}
        initialCheckOut={searchDates.checkOut}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* My Bookings Lookup Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
      />
    </main>
  );
}
