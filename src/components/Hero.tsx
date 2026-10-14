'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { RoomTypeDetails } from '@/types/database';

interface HeroProps {
  roomTypes: RoomTypeDetails[];
  onSearch: (checkIn: string, checkOut: string, roomTypeId?: number) => void;
}

export default function Hero({ roomTypes, onSearch }: HeroProps) {
  const [checkIn, setCheckIn] = useState('2026-10-15');
  const [checkOut, setCheckOut] = useState('2026-10-18');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const inStr = tomorrow.toISOString().split('T')[0];

    const out = new Date(tomorrow);
    out.setDate(out.getDate() + 3);
    const outStr = out.toISOString().split('T')[0];

    setCheckIn(inStr);
    setCheckOut(outStr);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeId = selectedCategory === 'all' ? undefined : Number(selectedCategory);
    onSearch(checkIn, checkOut, typeId);
  };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#2B0E14]"
    >
      {/* Background Photography with Warm Dusk Ambient Lighting */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')`,
        }}
      />

      {/* Atmospheric Maroon Vignette & Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2B0E14]/85 via-[#381018]/75 to-[#2B0E14] backdrop-brightness-75" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Subtitle Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E5C378]/30 bg-[#2B0E14]/70 backdrop-blur-sm text-[#E5C378] text-xs font-semibold tracking-[0.25em] uppercase mb-8 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
          <span>A Sanctuary of Coastal Opulence</span>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.15] mb-6">
          Experience Unmatched{' '}
          <span className="italic font-normal font-serif text-[#E5C378] gold-gradient-text drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)]">
            Elegance
          </span>
        </h1>

        {/* Body Narrative */}
        <p className="max-w-2xl text-base sm:text-lg text-[#F5EFEB]/90 font-light leading-relaxed mb-12 drop-shadow">
          Welcome to <strong className="font-semibold text-white">Burgundy Suite & Resort</strong>
          —where timeless architectural splendor meets the tranquil waters of Emerald Bay. Indulge in
          bespoke luxury tailored to your every moment.
        </p>

        {/* Floating Availability Pill Card (Matches Screenshot 1) */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-[#381018]/90 backdrop-blur-xl border border-[#5A1C2A] p-4 sm:p-5 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Check-In Date */}
          <div className="w-full sm:w-1/3 flex flex-col px-4 text-left border-b sm:border-b-0 sm:border-r border-[#5A1C2A]/60 pb-3 sm:pb-0">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#E5C378]/90 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#E5C378]" />
              Check-In Date
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent text-white text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Check-Out Date */}
          <div className="w-full sm:w-1/3 flex flex-col px-4 text-left border-b sm:border-b-0 sm:border-r border-[#5A1C2A]/60 pb-3 sm:pb-0">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#E5C378]/90 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#E5C378]" />
              Check-Out Date
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-white text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Suite Category Dropdown */}
          <div className="w-full sm:w-1/3 flex flex-col px-4 text-left pb-2 sm:pb-0">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#E5C378]/90 mb-1">
              Suite Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-white text-sm font-medium focus:outline-none appearance-none pr-6 cursor-pointer"
              >
                <option value="all" className="bg-[#2B0E14] text-white">
                  All Suites & Villas
                </option>
                {roomTypes.map((rt) => (
                  <option
                    key={rt.room_type_id}
                    value={rt.room_type_id}
                    className="bg-[#2B0E14] text-white"
                  >
                    {rt.room_type} (₱{rt.rate_per_night}/nt)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#E5C378] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Gold Action Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Check Availability</span>
          </button>
        </form>
      </div>

      {/* Subtle Bottom Ambient Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#FBF5F5] to-transparent pointer-events-none" />
    </section>
  );
}
