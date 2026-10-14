'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Calendar, ShieldCheck, BookmarkCheck } from 'lucide-react';

interface NavbarProps {
  onOpenBooking?: (suiteTypeId?: number) => void;
  onOpenMyBookings?: () => void;
}

export default function Navbar({ onOpenBooking, onOpenMyBookings }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors ${
        isAdmin
          ? 'bg-white border-b border-slate-200 shadow-xs'
          : 'bg-[#381018]/95 backdrop-blur-md border-b border-[#5A1C2A]/60 shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center font-serif font-bold text-xl shadow-md transition-all duration-300 ${
              isAdmin
                ? 'bg-[#741B2D] text-white border-2 border-[#741B2D]'
                : 'bg-gradient-to-br from-[#5A1C2A] to-[#2B0E14] border border-[#E5C378]/40 text-[#E5C378] group-hover:border-[#E5C378]'
            }`}
          >
            B
          </div>
          <div className="flex flex-col">
            <span
              className={`font-serif tracking-[0.18em] text-base sm:text-lg font-bold uppercase leading-tight transition-colors ${
                isAdmin
                  ? 'text-slate-900 group-hover:text-[#741B2D]'
                  : 'text-white group-hover:text-[#E5C378]'
              }`}
            >
              Burgundy Suite
            </span>
            <span
              className={`text-[10px] tracking-[0.25em] uppercase font-medium ${
                isAdmin ? 'text-[#741B2D]' : 'text-[#E5C378]/80'
              }`}
            >
              Boutique Haven & Resort
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Hidden on small screens) */}
        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wider text-[#F5EFEB]/80 uppercase">
            <Link href="#home" className="hover:text-[#E5C378] transition-colors">
              Home
            </Link>
            <Link href="#haven" className="hover:text-[#E5C378] transition-colors">
              The Haven
            </Link>
            <Link href="#suites" className="hover:text-[#E5C378] transition-colors">
              Suites & Villa
            </Link>
            <Link href="#amenities" className="hover:text-[#E5C378] transition-colors">
              Amenities
            </Link>
            {onOpenMyBookings && (
              <button
                onClick={onOpenMyBookings}
                className="flex items-center gap-1.5 hover:text-[#E5C378] transition-colors cursor-pointer text-[#E5C378]"
                title="Verify your suite reservation with your email address"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Verify Booking</span>
              </button>
            )}
          </nav>
        )}

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {/* If viewing admin page, show quick return to Guest Portal */}
          {isAdmin && (
            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 transition-all duration-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#741B2D]" />
              <span>Guest Portal</span>
            </Link>
          )}

          {/* Reserve CTA */}
          <button
            onClick={() => (onOpenBooking ? onOpenBooking() : (window.location.href = '/#suites'))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reserve Now</span>
          </button>
        </div>
      </div>
    </header>
  );
}
