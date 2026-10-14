'use client';

import React, { useState, useEffect } from 'react';
import { RoomTypeDetails } from '@/types/database';
import { Users, Sparkles, Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface SuitesSectionProps {
  roomTypes: RoomTypeDetails[];
  onBookSuite: (roomTypeId: number) => void;
}

export default function SuitesSection({ roomTypes, onBookSuite }: SuitesSectionProps) {
  const ITEMS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(roomTypes.length / ITEMS_PER_PAGE);

  // Keep currentPage valid when roomTypes changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [roomTypes.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSuites = roomTypes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section id="suites" className="py-24 bg-white text-[#1C1917] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-[0.25em] text-[#742537] uppercase block mb-3">
            Accommodations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#2B0E14] mb-4">
            Curated Suites & Private Havens
          </h2>
          <p className="text-sm sm:text-base text-[#5C4047] font-light leading-relaxed">
            Directly mapped from our database. Each room type offers meticulously crafted interiors,
            king plush bedding, and high-speed fiber connectivity.
          </p>
        </div>

        {/* Horizontal Sliding Carousel Viewport */}
        <div className="overflow-hidden w-full -mx-2 px-2 py-3">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
            style={{ transform: `translateX(-${(currentPage - 1) * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const pageSuites = roomTypes.slice(
                pageIdx * ITEMS_PER_PAGE,
                (pageIdx + 1) * ITEMS_PER_PAGE
              );
              return (
                <div key={pageIdx} className="w-full shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
                    {pageSuites.map((suite) => (
                      <div
                        key={suite.room_type_id}
                        className="group bg-white rounded-2xl overflow-hidden border border-[#5A1C2A]/15 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Photo Plate with Capacity Badge */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#2B0E14]">
                          <img
                            src={suite.image_url}
                            alt={suite.room_type}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Capacity Pill (Top Right) */}
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#2B0E14]/80 backdrop-blur-md border border-[#E5C378]/30 text-[#E5C378] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                            <Users className="w-3 h-3 text-[#E5C378]" />
                            <span>Up to {suite.room_capacity} Guests</span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-[#2B0E14] mb-2 group-hover:text-[#742537] transition-colors">
                              {suite.room_type}
                            </h3>
                            <p className="text-xs text-[#5C4047] leading-relaxed mb-4 line-clamp-3">
                              {suite.description}
                            </p>

                            {/* Highlights / Features list */}
                            {suite.features && suite.features.length > 0 && (
                              <div className="space-y-1.5 mb-5 pt-3 border-t border-[#5A1C2A]/10">
                                {suite.features.slice(0, 3).map((f, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 text-[11px] text-[#5C4047]"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                    <span>{f}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Price and Book Suite Button */}
                          <div className="pt-4 border-t border-[#5A1C2A]/10 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#5C4047] uppercase tracking-wider font-semibold">
                                Starting from
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="font-serif text-xl sm:text-2xl font-bold text-[#742537]">
                                  ₱{suite.rate_per_night}
                                </span>
                                <span className="text-[11px] text-[#5C4047]">/ night</span>
                              </div>
                            </div>

                            <button
                              onClick={() => onBookSuite(suite.room_type_id)}
                              className="px-4 py-2.5 rounded-xl bg-[#2B0E14] text-[#E5C378] text-xs font-bold tracking-wider uppercase hover:bg-[#4A1521] hover:text-white transition-all duration-200 flex items-center gap-1.5 shadow hover:shadow-lg cursor-pointer"
                            >
                              <span>Book Suite</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Luxury Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 border-t border-[#5A1C2A]/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
            {/* Showing Range Details */}
            <div className="text-xs text-[#5C4047] font-medium tracking-wide">
              Showing{' '}
              <span className="font-bold text-[#742537]">
                {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, roomTypes.length)}
              </span>{' '}
              of <span className="font-bold text-[#742537]">{roomTypes.length}</span> curated
              accommodations
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Page Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5A1C2A]/20 bg-white text-xs font-bold text-[#2B0E14] hover:border-[#742537] hover:text-[#742537] hover:bg-[#742537]/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#742537]" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1.5 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                      currentPage === page
                        ? 'bg-[#742537] text-white shadow-md scale-105'
                        : 'bg-white border border-[#5A1C2A]/15 text-[#5C4047] hover:border-[#742537] hover:text-[#742537] hover:bg-[#742537]/5'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Page Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5A1C2A]/20 bg-white text-xs font-bold text-[#2B0E14] hover:border-[#742537] hover:text-[#742537] hover:bg-[#742537]/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#742537]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

