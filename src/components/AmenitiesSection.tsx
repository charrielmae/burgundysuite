'use client';

import React from 'react';
import { Sparkles, Utensils, Waves, Wine, Compass, ShieldCheck } from 'lucide-react';

const AMENITIES = [
  {
    id: 'spa',
    title: 'The Velvet Lotus Spa',
    subtitle: 'Holistic Body & Spirit Rejuvenation',
    description:
      'Immerse in bespoke hydrotherapy rituals, organic botanical massages, and private Himalayan salt steam rooms overlooking the coastline.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    tags: ['Hydrotherapy', 'Herbal Elixirs', 'Private Cabanas'],
  },
  {
    id: 'dining',
    title: 'Aura Fine Dining',
    subtitle: 'Gastronomy by the Emerald Sea',
    description:
      'Michelin-inspired artisanal seafood, grass-fed cuts, and sommelier-curated grand cru vintages served on an open-air cliffside pavilion.',
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tags: ['Sommelier Cellar', 'Ocean Sunset Seating', 'Bespoke Degustation'],
  },
  {
    id: 'pool',
    title: 'Ocean Infinity Pool',
    subtitle: 'Cliffside Horizon Immersion',
    description:
      'A heated saltwater architectural marvel that visually dissolves into the azure waves of Emerald Bay with private sunken sunbeds.',
    icon: Waves,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    tags: ['Heated Saltwater', 'Sunken Lounges', 'Swim-up Bar'],
  },
];

export default function AmenitiesSection() {
  return (
    <section id="amenities" className="py-24 bg-[#2B0E14] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#5A1C2A]/20 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-[0.25em] text-[#E5C378] uppercase block mb-3">
            Curated Indulgences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-4">
            World-Class Amenities Designed for Tranquility
          </h2>
          <p className="text-sm sm:text-base text-[#F5EFEB]/75 font-light leading-relaxed">
            Every moment at Burgundy Suite is sculpted with uncompromising attention to detail,
            wellness, and sensory delight.
          </p>
        </div>

        {/* 3 Dark Maroon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AMENITIES.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <div
                key={amenity.id}
                className="group rounded-2xl bg-[#381018] border border-[#5A1C2A] overflow-hidden hover:border-[#E5C378]/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Photo Top */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={amenity.image}
                    alt={amenity.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#381018] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-[#2B0E14]/85 border border-[#E5C378]/40 flex items-center justify-center text-[#E5C378]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#E5C378] tracking-widest uppercase block mb-1">
                      {amenity.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white mb-3">
                      {amenity.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F5EFEB]/80 leading-relaxed mb-6 font-light">
                      {amenity.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[#5A1C2A]/60">
                    {amenity.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#2B0E14] text-[#E5C378] border border-[#5A1C2A]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extra Perks Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#381018]/60 border border-[#5A1C2A] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Wine className="w-6 h-6 text-[#E5C378] mb-2" />
            <h4 className="font-bold text-sm text-white">Private Wine Cellar</h4>
            <p className="text-xs text-[#F5EFEB]/70 mt-1">Over 1,200 curated labels</p>
          </div>
          <div className="flex flex-col items-center">
            <Compass className="w-6 h-6 text-[#E5C378] mb-2" />
            <h4 className="font-bold text-sm text-white">Yacht Charters</h4>
            <p className="text-xs text-[#F5EFEB]/70 mt-1">Direct from resort marina</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-[#E5C378] mb-2" />
            <h4 className="font-bold text-sm text-white">VIP Seclusion</h4>
            <p className="text-xs text-[#F5EFEB]/70 mt-1">24/7 Gated security & privacy</p>
          </div>
        </div>
      </div>
    </section>
  );
}
