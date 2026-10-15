'use client';

import React, { useState } from 'react';
import { BookingWithDetails } from '@/types/database';
import {
  LogOut,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  DoorClosed,
} from 'lucide-react';
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

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
        const day = parseInt(parts[2], 10);
        return `${month} ${day}, ${year}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const calculateNights = (inDate: string, outDate: string) => {
    try {
      const d1 = new Date(inDate).getTime();
      const d2 = new Date(outDate).getTime();
      return Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    } catch {
      return 1;
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
            type="button"
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
            type="button"
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
            type="button"
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
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({bookings.length})
          </button>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-4 px-4 whitespace-nowrap">Booking ID</th>
                <th className="py-4 px-4 whitespace-nowrap">Guest</th>
                <th className="py-4 px-4 whitespace-nowrap">Room</th>
                <th className="py-4 px-4 whitespace-nowrap">Suite Category</th>
                <th className="py-4 px-4 whitespace-nowrap min-w-[220px]">Stay Dates</th>
                <th className="py-4 px-4 whitespace-nowrap">Total Paid</th>
                <th className="py-4 px-4 whitespace-nowrap">Status</th>
                <th className="py-4 px-4 whitespace-nowrap text-right">Action CTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No reservations found matching this category filter.
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
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-[#741B2D] px-2.5 py-1 rounded-lg bg-[#741B2D]/5 border border-[#741B2D]/15 inline-block">
                          #{b.booking_id}
                        </span>
                      </td>

                      {/* Guest */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {b.guest.first_name} {b.guest.last_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[190px] mt-0.5">
                          {b.guest.email_address}
                        </span>
                      </td>

                      {/* Room Number */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs border border-slate-200">
                          <DoorClosed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Room {b.room.room_number}</span>
                        </span>
                      </td>

                      {/* Room Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 text-xs">
                          {b.room_type.room_type}
                        </span>
                      </td>

                      {/* Stay Dates (Enhanced with luxury formatted dates & night counter) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-[#741B2D] shrink-0" />
                          <span>{formatDateDisplay(b.check_in_date)}</span>
                          <span className="text-slate-400 font-normal">→</span>
                          <span>{formatDateDisplay(b.check_out_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                            {calculateNights(b.check_in_date, b.check_out_date)}{' '}
                            {calculateNights(b.check_in_date, b.check_out_date) === 1 ? 'Night' : 'Nights'}
                          </span>
                          {isPendingCheckOut && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                              <Clock className="w-2.5 h-2.5 animate-pulse text-rose-600" />
                              Due Today
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Paid */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-serif text-sm">
                          ₱{b.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Status (Enhanced pill with live indicator & no wrapping) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {b.booking_status === 'checked-in' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/90 whitespace-nowrap shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                            Checked-In
                          </span>
                        )}
                        {b.booking_status === 'completed' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/90 whitespace-nowrap shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            Completed
                          </span>
                        )}
                        {b.booking_status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/90 whitespace-nowrap shadow-2xs">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            Pending
                          </span>
                        )}
                        {b.booking_status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap shadow-2xs">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Action CTA (Enhanced button with no wrapping & sleek hover) */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        {isCheckedIn ? (
                          <button
                            type="button"
                            onClick={() => handleCheckoutClick(b)}
                            disabled={checkingOutId === b.booking_id}
                            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                              isPendingCheckOut
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 ring-2 ring-rose-400/40 animate-pulse'
                                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 shadow-2xs'
                            }`}
                          >
                            <LogOut className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {checkingOutId === b.booking_id ? 'Checking out...' : 'Check-Out'}
                            </span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-100 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            Settled
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
                  {formatDateDisplay(checkoutTarget.check_in_date)} → {formatDateDisplay(checkoutTarget.check_out_date)}
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
