'use client';

import React, { useState } from 'react';
import { BookingWithDetails } from '@/types/database';
import { LogOut, Calendar, User, CheckCircle2, Clock } from 'lucide-react';

import ConfirmModal from './ConfirmModal';

interface BookingsTableProps {
  bookings: BookingWithDetails[];
  onCheckOut: (bookingId: number) => Promise<void>;
}

export default function BookingsTable({ bookings, onCheckOut }: BookingsTableProps) {
  const [filter, setFilter] = useState<'active' | 'upcoming' | 'completed' | 'all'>('active');
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<BookingWithDetails | null>(null);

  const today = '2026-10-14';

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'active') return b.booking_status === 'checked-in';
    if (filter === 'upcoming')
      return b.booking_status === 'pending' || (b.check_in_date > today && b.booking_status !== 'cancelled');
    if (filter === 'completed') return b.booking_status === 'completed' || b.booking_status === 'cancelled';
    return true;
  });

  const handleCheckoutClick = (booking: BookingWithDetails) => {
    setCheckoutTarget(booking);
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutTarget) return;
    setCheckingOutId(checkoutTarget.booking_id);
    try {
      await onCheckOut(checkoutTarget.booking_id);
      setCheckoutTarget(null);
    } finally {
      setCheckingOutId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Table Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-slate-900 tracking-wide">
            Guest Reservations & Room Bookings
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Official relational booking logs directly bound to ROOM_BOOKING and GUEST_DETAILS
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'active'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ongoing / Active ({bookings.filter((b) => b.booking_status === 'checked-in').length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-white text-emerald-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({bookings.filter((b) => b.booking_status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
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
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
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
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-4 px-5 font-mono font-bold text-[#741B2D]">
                        #{b.booking_id}
                      </td>

                      {/* Guest */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">
                          {b.guest.first_name} {b.guest.last_name}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {b.guest.email_address}
                        </span>
                      </td>

                      {/* Room Number */}
                      <td className="py-4 px-5 font-mono font-bold text-slate-800">
                        {b.room.room_number}
                      </td>

                      {/* Room Type */}
                      <td className="py-4 px-5 text-slate-700">
                        {b.room_type.room_type}
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-5">
                        <div className="text-slate-800">
                          {b.check_in_date} → {b.check_out_date}
                        </div>
                        {isPendingCheckOut && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-0.5">
                            <Clock className="w-2.5 h-2.5" /> Due Today
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-4 px-5 font-bold text-slate-900">
                        ₱{b.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.booking_status === 'checked-in'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : b.booking_status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.booking_status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {b.booking_status}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-5 text-right">
                        {isCheckedIn ? (
                          <button
                            onClick={() => handleCheckoutClick(b)}
                            disabled={checkingOutId === b.booking_id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isPendingCheckOut
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-pulse'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <LogOut className="w-3 h-3" />
                            <span>
                              {checkingOutId === b.booking_id ? 'Checking out...' : 'Check-Out'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No action</span>
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

      {/* Luxury Check-Out Confirmation Modal */}
      {checkoutTarget && (
        <ConfirmModal
          isOpen={Boolean(checkoutTarget)}
          onClose={() => setCheckoutTarget(null)}
          onConfirm={handleConfirmCheckout}
          isLoading={checkingOutId === checkoutTarget.booking_id}
          title="Confirm Guest Check-Out"
          variant="burgundy"
          confirmLabel="Process Check-Out"
          cancelLabel="Keep Checked-In"
          icon={<LogOut className="w-5 h-5 text-[#741B2D]" />}
          description={
            <p>
              Are you sure you want to process check-out for booking{' '}
              <strong className="text-slate-900 font-bold font-mono">
                #{checkoutTarget.booking_id}
              </strong>
              ? The room will automatically be released back to{' '}
              <strong className="text-emerald-700">Available</strong> in room inventory and synced with Cloudflare D1.
            </p>
          }
          detailsCard={
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Guest</span>
                <span className="font-semibold text-slate-900">
                  {checkoutTarget.guest.first_name} {checkoutTarget.guest.last_name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {checkoutTarget.guest.email_address}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Accommodation</span>
                <span className="font-semibold text-slate-900">
                  Room {checkoutTarget.room.room_number}
                </span>
                <span className="text-[10px] text-[#741B2D] font-bold block">
                  {checkoutTarget.room_type.room_type}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Stay Duration</span>
                <span className="text-slate-800">
                  {checkoutTarget.check_in_date} → {checkoutTarget.check_out_date}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Amount</span>
                <span className="font-bold text-[#741B2D]">
                  ₱{checkoutTarget.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
