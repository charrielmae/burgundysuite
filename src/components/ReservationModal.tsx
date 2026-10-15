'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Calendar,
  User,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  BookmarkCheck,
} from 'lucide-react';
import { RoomTypeDetails, NewBookingRequest, BookingWithDetails } from '@/types/database';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTypes: RoomTypeDetails[];
  initialRoomTypeId?: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onBookingSuccess?: (booking: BookingWithDetails) => void;
}

export default function ReservationModal({
  isOpen,
  onClose,
  roomTypes,
  initialRoomTypeId,
  initialCheckIn,
  initialCheckOut,
  onBookingSuccess,
}: ReservationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [roomTypeId, setRoomTypeId] = useState<number>(initialRoomTypeId || roomTypes[0]?.room_type_id || 1);
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn || '');
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut || '');

  // Guest Details (ERD Schema)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('1992-05-15');
  const [nationality, setNationality] = useState('American');
  const [civilStatus, setCivilStatus] = useState('Single');
  const [contactNumber, setContactNumber] = useState('+63 917 829 4100');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('100 Ocean Crest Blvd, Sapphire Coast');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('E-Wallet');

  // Success State
  const [confirmedBooking, setConfirmedBooking] = useState<{
    booking: BookingWithDetails;
    receiptNumber: string;
  } | null>(null);

  useEffect(() => {
    if (initialRoomTypeId) setRoomTypeId(initialRoomTypeId);
    if (initialCheckIn) setCheckIn(initialCheckIn);
    if (initialCheckOut) setCheckOut(initialCheckOut);
  }, [initialRoomTypeId, initialCheckIn, initialCheckOut]);

  // If no dates, set defaults
  useEffect(() => {
    if (!checkIn) {
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      setCheckIn(tmrw.toISOString().split('T')[0]);
    }
    if (!checkOut) {
      const out = new Date();
      out.setDate(out.getDate() + 4);
      setCheckOut(out.toISOString().split('T')[0]);
    }
  }, [checkIn, checkOut]);

  if (!isOpen) return null;

  const selectedSuite = roomTypes.find((r) => r.room_type_id === Number(roomTypeId)) || roomTypes[0];

  // Calculate nights & total
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.max(1, d2.getTime() - d1.getTime());
  const nights = Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)));
  const rate = selectedSuite ? selectedSuite.rate_per_night : 250;
  const subtotal = nights * rate;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const handleNextToGuest = () => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setError('Please select valid check-in and check-out dates.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleNextToPayment = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !contactNumber.trim()) {
      setError('Please provide all required guest identification details.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleAuthorizeBooking = async () => {
    setLoading(true);
    setError(null);

    const payload: NewBookingRequest = {
      room_type_id: Number(roomTypeId),
      check_in_date: checkIn,
      check_out_date: checkOut,
      guest_first_name: firstName,
      guest_last_name: lastName,
      guest_birth_date: birthDate,
      guest_nationality: nationality,
      guest_civil_status: civilStatus,
      guest_contact_number: contactNumber,
      guest_email: email,
      guest_address: address,
      payment_method: paymentMethod,
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authorize reservation');
      }

      setConfirmedBooking(data.data);
      setStep(4);
      if (onBookingSuccess) {
        onBookingSuccess(data.data.booking);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#2B0E14] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Top Bar */}
        <div className="px-6 py-5 bg-[#381018] border-b border-[#5A1C2A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#240A10] border border-[#E5C378]/40 shadow-xs shrink-0 p-1 flex items-center justify-center">
              <Image
                src="/burgundylogov2.png"
                alt="Burgundy Suite Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Reserve Your Stay
              </h3>
              <p className="text-[11px] text-[#E5C378] tracking-wider uppercase font-semibold">
                Burgundy Suite & Resort
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2B0E14] hover:bg-[#5A1C2A] text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Step Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-[#240A10] border-b border-[#5A1C2A]/60 flex items-center justify-between text-xs font-semibold">
            <div
              className={`flex items-center gap-1.5 ${
                step >= 1 ? 'text-[#E5C378]' : 'text-white/40'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Suite & Dates</span>
            </div>
            <div className="h-[1px] w-8 bg-[#5A1C2A]" />
            <div
              className={`flex items-center gap-1.5 ${
                step >= 2 ? 'text-[#E5C378]' : 'text-white/40'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Guest Details</span>
            </div>
            <div className="h-[1px] w-8 bg-[#5A1C2A]" />
            <div
              className={`flex items-center gap-1.5 ${
                step >= 3 ? 'text-[#E5C378]' : 'text-white/40'
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* STEP 1: Suite & Dates */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#E5C378] block mb-2">
                  Select Suite Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roomTypes.map((st) => (
                    <div
                      key={st.room_type_id}
                      onClick={() => setRoomTypeId(st.room_type_id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        roomTypeId === st.room_type_id
                          ? 'bg-[#381018] border-[#E5C378] ring-1 ring-[#E5C378]'
                          : 'bg-[#240A10] border-[#5A1C2A] hover:border-[#5A1C2A]/80'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-serif font-bold text-sm text-white">
                          {st.room_type}
                        </span>
                        <span className="text-[10px] text-[#E5C378] font-bold">
                          Max {st.room_capacity} Guests
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-auto">
                        <span className="text-xs text-white/60">Starting rate</span>
                        <span className="font-bold text-sm text-[#E5C378]">
                          ₱{st.rate_per_night}/night
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
              </div>

              {/* Price Calculation Pill */}
              <div className="p-4 rounded-2xl bg-[#381018]/70 border border-[#5A1C2A] space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>
                    ₱{rate} × {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Resort Spa & Heritage Access Fee (10%)</span>
                  <span>₱{serviceFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-[#5A1C2A] flex justify-between font-bold text-sm text-[#E5C378]">
                  <span>Total Estimated Cost</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextToGuest}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Guest Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Guest Details (ERD Schema) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    placeholder="e.g. Julian"
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    placeholder="e.g. Vance"
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    placeholder="julian.vance@emerald.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    placeholder="+63 917 555 8800"
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-xs focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    placeholder="American"
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-xs focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                    Civil Status
                  </label>
                  <select
                    value={civilStatus}
                    onChange={(e) => setCivilStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-xs focus:outline-none focus:border-[#E5C378]"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#E5C378] block mb-1">
                  Residential / Billing Address
                </label>
                <input
                  type="text"
                  value={address}
                  placeholder="e.g. 740 Park Avenue, New York, NY"
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-full bg-[#240A10] border border-[#5A1C2A] text-white/80 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextToPayment}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#E5C378] block mb-3">
                  Select Payment Method
                </label>
                <div className="space-y-3">
                  {/* E-Wallet Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('E-Wallet')}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                      paymentMethod === 'E-Wallet'
                        ? 'bg-[#381018] border-[#E5C378] shadow-[0_0_15px_rgba(229,195,120,0.15)]'
                        : 'bg-[#2B0E14] border-[#5A1C2A] hover:border-[#E5C378]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'E-Wallet'
                          ? 'bg-[#E5C378] text-[#2B0E14]'
                          : 'bg-[#381018] text-[#E5C378] border border-[#5A1C2A]'
                      }`}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">E-Wallet</p>
                        <p className="text-[11px] text-white/60 mt-0.5">Pay online via GCash, Maya, or other e-wallet services</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'E-Wallet'
                          ? 'border-[#E5C378] bg-[#E5C378]'
                          : 'border-[#5A1C2A]'
                      }`}>
                        {paymentMethod === 'E-Wallet' && (
                          <div className="w-2 h-2 rounded-full bg-[#2B0E14]" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Pay at Counter Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Pay at Counter')}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                      paymentMethod === 'Pay at Counter'
                        ? 'bg-[#381018] border-[#E5C378] shadow-[0_0_15px_rgba(229,195,120,0.15)]'
                        : 'bg-[#2B0E14] border-[#5A1C2A] hover:border-[#E5C378]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'Pay at Counter'
                          ? 'bg-[#E5C378] text-[#2B0E14]'
                          : 'bg-[#381018] text-[#E5C378] border border-[#5A1C2A]'
                      }`}>
                        <Building className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Pay at the Counter</p>
                        <p className="text-[11px] text-white/60 mt-0.5">Settle payment upon arrival at the front desk</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'Pay at Counter'
                          ? 'border-[#E5C378] bg-[#E5C378]'
                          : 'border-[#5A1C2A]'
                      }`}>
                        {paymentMethod === 'Pay at Counter' && (
                          <div className="w-2 h-2 rounded-full bg-[#2B0E14]" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="p-4 rounded-2xl bg-[#240A10] border border-[#5A1C2A] text-xs space-y-1.5 text-white/80">
                <div className="flex justify-between">
                  <span>Suite Reserved:</span>
                  <strong className="text-white">{selectedSuite.room_type}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Guest:</span>
                  <span className="text-white">
                    {firstName} {lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Stay:</span>
                  <span>
                    {checkIn} to {checkOut} ({nights} Nights)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="text-white font-semibold">{paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#5A1C2A] font-bold text-sm text-[#E5C378]">
                  <span>Total Charge:</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-full bg-[#240A10] border border-[#5A1C2A] text-white/80 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAuthorizeBooking}
                  className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing Reservation...</span>
                  ) : (
                    <span>Confirm Reservation</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation & Receipt */}
          {step === 4 && confirmedBooking && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#381018] border-2 border-[#E5C378] text-[#E5C378] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#E5C378]">
                  Reservation Confirmed
                </span>
                <h4 className="font-serif text-2xl font-bold text-white mt-1">
                  We look forward to welcoming you
                </h4>
                <p className="text-xs text-white/70 mt-1">
                  A concierge confirmation has been dispatched to {email}.
                </p>
              </div>

              {/* Receipt Plate */}
              <div className="bg-[#381018] border border-[#5A1C2A] p-5 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-[#5A1C2A] pb-2">
                  <span className="text-white/60">Booking Reference:</span>
                  <span className="font-mono font-bold text-[#E5C378]">
                    {confirmedBooking.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Suite & Room:</span>
                  <span className="font-semibold text-white">
                    {confirmedBooking.booking.room_type.room_type} — Room #{confirmedBooking.booking.room.room_number} (Floor {confirmedBooking.booking.room.floor_number})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Dates:</span>
                  <span className="text-white">
                    {confirmedBooking.booking.check_in_date} to {confirmedBooking.booking.check_out_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Guest Name:</span>
                  <span className="text-white">
                    {confirmedBooking.booking.guest.first_name} {confirmedBooking.booking.guest.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Payment Method:</span>
                  <span className="text-white">{paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#5A1C2A] text-sm font-bold text-[#E5C378]">
                  <span>Total Amount Paid:</span>
                  <span>₱{confirmedBooking.booking.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Email Verification Reminder */}
              <div className="p-3.5 rounded-xl bg-[#2B0E14] border border-[#E5C378]/30 text-left text-xs flex items-center gap-2.5">
                <BookmarkCheck className="w-4 h-4 shrink-0 text-[#E5C378]" />
                <span className="text-[11px] text-white/80 leading-relaxed">
                  <strong className="text-[#E5C378]">Guest Verification:</strong> You don&apos;t need an account or password! You can verify and check your suite details anytime under <strong className="text-white">Verify Booking</strong> on our homepage using <strong className="text-white">{email}</strong>.
                </span>
              </div>

              <div className="flex items-center gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors cursor-pointer"
                >
                  Return to Haven
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
