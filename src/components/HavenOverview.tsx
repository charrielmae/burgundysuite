'use client';

import React from 'react';
import { Plane, Waves, BellRing, Star, MapPin } from 'lucide-react';

export default function HavenOverview() {
  return (
    <section id="haven" className="py-24 bg-[#FBF5F5] text-[#1C1917] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial & Story */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* Location Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#5A1C2A]/10 border border-[#5A1C2A]/20 text-[#5A1C2A] text-xs font-bold tracking-widest uppercase mb-6">
              <MapPin className="w-3.5 h-3.5 text-[#5A1C2A]" />
              <span>Prime District • Emerald Bay</span>
            </div>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2B0E14] leading-[1.2] mb-6">
              A Private Haven Nestled Between Cliffside & Crystal Waters
            </h2>

            {/* Paragraphs */}
            <p className="text-sm sm:text-base text-[#5C4047] leading-relaxed mb-4">
              Situated in the prestigious coastal enclave of{' '}
              <strong className="text-[#2B0E14] font-semibold">Burgundy Cliff, Emerald Bay</strong>,
              our estate combines absolute privacy with sweeping panoramic views of the sea and
              surrounding verdant hills.
            </p>
            <p className="text-sm sm:text-base text-[#5C4047] leading-relaxed mb-8">
              Whether you are looking for a peaceful getaway, a romantic retreat, or an executive
              sanctuary, Burgundy Suite offers unparalleled seclusion just 20 minutes from the
              international airport, backed by 24/7 dedicated concierge service.
            </p>

            {/* 3 Quick Stat Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full pt-4">
              {/* Stat 1 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white border border-[#5A1C2A]/10 shadow-sm hover:shadow-md transition-shadow">
                <Plane className="w-5 h-5 text-[#5A1C2A] mb-2" />
                <span className="font-bold text-xs sm:text-sm text-[#2B0E14]">20 Mins</span>
                <span className="text-[10px] text-[#5C4047] mt-0.5">From Int&apos;l Airport</span>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white border border-[#5A1C2A]/10 shadow-sm hover:shadow-md transition-shadow">
                <Waves className="w-5 h-5 text-[#5A1C2A] mb-2" />
                <span className="font-bold text-xs sm:text-sm text-[#2B0E14]">Private Beach</span>
                <span className="text-[10px] text-[#5C4047] mt-0.5">Exclusive Ocean Front</span>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white border border-[#5A1C2A]/10 shadow-sm hover:shadow-md transition-shadow">
                <BellRing className="w-5 h-5 text-[#5A1C2A] mb-2" />
                <span className="font-bold text-xs sm:text-sm text-[#2B0E14]">Butler Service</span>
                <span className="text-[10px] text-[#5C4047] mt-0.5">24/7 Personalized</span>
              </div>
            </div>
          </div>

          {/* Right Column: Asymmetric Bento Grid (Matches Screenshot 2) */}
          <div className="lg:col-span-7 relative">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {/* Photo 1: Spa amenity with bottle, candle, towel, tulips */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                  alt="Velvet Lotus Spa Towel and Amenities"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B0E14]/40 to-transparent" />
              </div>

              {/* Photo 2: King Bedroom with wood flooring and balcony */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                  alt="Plush Suite Bedroom"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B0E14]/30 to-transparent" />
              </div>

              {/* Photo 3: Pool at twilight reflecting the modern pavilion */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
                  alt="Resort Pool at Twilight"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B0E14]/30 to-transparent" />
              </div>

              {/* Photo 4: Modern sunlit luxury pavilion with floor-to-ceiling glass */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
                  alt="Modern Sunlit Villa Pavilion"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B0E14]/30 to-transparent" />
              </div>
            </div>

            {/* Floating 5.0 Star Luxury Hotel Award Badge (Bottom Center) */}
            <div className="absolute -bottom-5 left-8 sm:left-12 bg-[#2B0E14] border border-[#E5C378]/40 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
              <span className="font-serif text-2xl font-bold text-[#E5C378]">5.0</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[#E5C378]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#E5C378]" />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-white/90 tracking-wide mt-0.5">
                  World Luxury Hotel Award Winner
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
