'use client';

import React, { useState } from 'react';
import { BookingWithDetails } from '@/types/database';
import { LogOut, Calendar, User, CheckCircle2, Clock } from 'lucide-react';

interface BookingsTableProps {
  bookings: BookingWithDetails[];
  onCheckOut: (bookingId: number) => Promise<void>;
}

export default function BookingsTable({ bookings, onCheckOut }: BookingsTableProps) {
  const [filter, setFilter] = useState<'active' | 'upcoming' | 'completed' | 'all'>('active');
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);

  const today = '2026-10-14';

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'active') return b.booking_status === 'checked-in';
    if (filter === 'upcoming')
      return b.booking_status === 'pending' || (b.check_in_date > today && b.booking_status !== 'cancelled');
    if (filter === 'completed') return b.booking_status === 'completed' || b.booking_status === 'cancelled';
    return true;
  });

  const handleCheckoutClick = async (bookingId: number) => {
    if (!confirm(`Are you sure you want to process check-out for booking #${bookingId}? The room will automatically be released to Available.`)) {
      return;
    }
    setCheckingOutId(bookingId);
    try {
      await onCheckOut(bookingId);
    } finally {
      setCheckingOutId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Table Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
            Guest Reservations & Room Bookings
          </h3>
          <p className="text-xs text-white/60 mt-1">
            Official relational booking logs directly bound to ROOM_BOOKING and GUEST_DETAILS
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center p-1 rounded-xl bg-[#2B0E14] border border-[#5A1C2A] text-xs">
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'active'
                ? 'bg-[#4A1521] text-[#E5C378] font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Ongoing / Active ({bookings.filter((b) => b.booking_status === 'checked-in').length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-[#4A1521] text-[#E5C378] font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-[#4A1521] text-emerald-400 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Completed / History ({bookings.filter((b) => b.booking_status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#4A1521] text-white font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="rounded-2xl bg-[#381018] border border-[#5A1C2A] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2B0E14] border-b border-[#5A1C2A] text-[#E5C378] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-5">Booking ID</th>
                <th className="py-4 px-5">Guest Name</th>
                <th className="py-4 px-5">Room #</th>
                <th className="py-4 px-5">Suite Category</th>
                <th className="py-4 px-5">Stay Dates</th>
                <th className="py-4 px-5">Total Paid</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Action CTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5A1C2A]/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-white/50">
                    No bookings found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isCheckedIn = b.booking_status === 'checked-in';
                  const isPendingCheckOut = isCheckedIn && b.check_out_date <= today;

                  return (
                    <tr
                      key={b.booking_id}
                      className="hover:bg-[#4A1521]/40 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-4 px-5 font-mono font-bold text-[#E5C378]">
                        #{b.booking_id}
                      </td>

                      {/* Guest */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">
                          {b.guest.first_name} {b.guest.last_name}
                        </div>
                        <span className="text-[10px] text-white/50 block">
                          {b.guest.email_address}
                        </span>
                      </td>

                      {/* Room */}
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#2B0E14] border border-[#5A1C2A] font-bold text-white">
                          Room {b.room.room_number}
                        </span>
                      </td>

                      {/* Suite Type */}
                      <td className="py-4 px-5 font-medium text-white/90">
                        {b.room_type.room_type}
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <Calendar className="w-3.5 h-3.5 text-[#E5C378]" />
                          <span>
                            {b.check_in_date} → {b.check_out_date}
                          </span>
                        </div>
                        {isPendingCheckOut && (
                          <span className="text-[10px] text-rose-400 font-bold block mt-0.5">
                            ★ Check-Out Due Today
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5 font-bold text-[#E5C378]">
                        ₱{b.total_amount.toFixed(2)}
                      </td>

                      {/* Status Pill */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.booking_status === 'checked-in'
                              ? 'bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/40'
                              : b.booking_status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {b.booking_status === 'checked-in' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378] animate-pulse" />
                          )}
                          <span>{b.booking_status}</span>
                        </span>
                      </td>

                      {/* Action CTA */}
                      <td className="py-4 px-5 text-right">
                        {isCheckedIn ? (
                          <button
                            disabled={checkingOutId === b.booking_id}
                            onClick={() => handleCheckoutClick(b.booking_id)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-800 to-rose-900 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-200 border border-rose-700 hover:border-rose-500 flex items-center gap-1.5 ml-auto shadow cursor-pointer disabled:opacity-50"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>
                              {checkingOutId === b.booking_id
                                ? 'Processing...'
                                : 'Process Check-Out'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-white/40 italic">
                            Archived
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
