'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AdminHeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#2B0E14]">
      {/* Background Photography with Warm Dusk Ambient Lighting */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')`,
        }}
      />

      {/* Atmospheric Maroon Vignette & Gradient Overlay (Vibrant so pool & warm lights shine through) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2B0E14]/70 via-[#240A10]/35 to-[#2B0E14]" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center flex flex-col items-center">
        {/* Subtitle Pill with Frosted Glass Blur */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E5C378]/40 bg-[#2B0E14]/80 backdrop-blur-md text-[#E5C378] text-xs font-semibold tracking-[0.25em] uppercase mb-6 sm:mb-7 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
          <span>A Sanctuary of Coastal Opulence</span>
        </div>

        {/* Main Title: Experience Unmatched with Elegance on second line */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.15] mb-6 overflow-visible text-center">
          <span className="block drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Experience Unmatched</span>
          <span className="block mt-1 sm:mt-2 italic font-normal font-serif text-[#E5C378] gold-gradient-text tracking-normal drop-shadow-[0_4px_16px_rgba(212,175,55,0.4)]">
            Elegance
          </span>
        </h1>

        {/* Body Narrative */}
        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-[#F5EFEB]/90 font-light leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] text-center">
          Welcome to <strong className="font-semibold text-white">Burgundy Suite & Resort</strong>
          —where timeless architectural splendor meets the tranquil waters of Emerald Bay. Indulge in
          bespoke luxury tailored to your every moment.
        </p>
      </div>
    </section>
  );
}
