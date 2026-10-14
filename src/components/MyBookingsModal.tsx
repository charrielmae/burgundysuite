'use client';

import React, { useState } from 'react';
import { X, Search, Calendar, User, CreditCard, BookmarkCheck, CheckCircle } from 'lucide-react';
import { BookingWithDetails } from '@/types/database';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyBookingsModal({ isOpen, onClose }: MyBookingsModalProps) {
  const [email, setEmail] = useState('julian.vance@vancemedia.co.uk');
  const [bookings, setBookings] = useState<BookingWithDetails[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to locate bookings');
      }
      setBookings(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#2B0E14] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Top Header */}
        <div className="px-6 py-5 bg-[#381018] border-b border-[#5A1C2A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookmarkCheck className="w-5 h-5 text-[#E5C378]" />
            <h3 className="font-serif text-lg font-bold text-white tracking-wide">
              Guest Reservation Lookup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2B0E14] hover:bg-[#5A1C2A] text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">
              Enter Guest Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. julian.vance@vancemedia.co.uk"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>

            {/* Quick Demo Links */}
            <div className="flex items-center gap-2 text-[11px] text-white/60 pt-1">
              <span>Quick lookup:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('julian.vance@vancemedia.co.uk');
                }}
                className="text-[#E5C378] underline hover:text-[#D4AF37] cursor-pointer"
              >
                Julian Vance
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('eleanor.sterling@apexcap.com');
                }}
                className="text-[#E5C378] underline hover:text-[#D4AF37] cursor-pointer"
              >
                Eleanor Sterling
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
              {error}
            </div>
          )}

          {/* Results List */}
          {bookings && (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-[#5A1C2A] pb-2 text-xs text-white/70">
                <span>Found {bookings.length} Reservation(s)</span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-white/50 text-xs">
                  No active or past reservations found for this email address.
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.booking_id}
                    className="p-4 rounded-2xl bg-[#381018] border border-[#5A1C2A] space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs text-[#E5C378] font-bold">
                          #BSR-2026-{b.booking_id}
                        </span>
                        <h4 className="font-serif font-bold text-base text-white mt-0.5">
                          {b.room_type.room_type} — Room #{b.room.room_number}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          b.booking_status === 'checked-in'
                            ? 'bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/40'
                            : b.booking_status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {b.booking_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-white/70 pt-2 border-t border-[#5A1C2A]/60">
                      <div>
                        <span className="block text-[10px] text-white/40 uppercase">Check-In</span>
                        <span>{b.check_in_date}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/40 uppercase">Check-Out</span>
                        <span>{b.check_out_date}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#5A1C2A]/60 text-xs">
                      <span className="text-white/60">Total Paid:</span>
                      <span className="font-bold text-sm text-[#E5C378]">
                        ₱{b.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
