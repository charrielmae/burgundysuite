'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sparkles, Calendar, ShieldCheck, BookmarkCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenBooking?: (suiteTypeId?: number) => void;
  onOpenMyBookings?: () => void;
}

export default function Navbar({ onOpenBooking, onOpenMyBookings }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

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
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#381018] border border-[#E5C378]/50 shadow-md group-hover:border-[#E5C378] group-hover:shadow-[#E5C378]/25 transition-all duration-300 shrink-0 p-1.5 flex items-center justify-center">
            <Image
              src="/burgundylogov2.png"
              alt="Burgundy Suite Logo"
              width={44}
              height={44}
              priority
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span
              className={`font-serif tracking-[0.12em] sm:tracking-[0.18em] text-sm sm:text-lg font-bold uppercase leading-tight transition-colors ${
                isAdmin
                  ? 'text-slate-900 group-hover:text-[#741B2D]'
                  : 'text-white group-hover:text-[#E5C378]'
              }`}
            >
              Burgundy Suite
            </span>
            <span
              className={`text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.25em] uppercase font-medium ${
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

        {/* Right CTA Actions & Mobile Toggle Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* If viewing admin page, show quick return to Guest Portal */}
          {isAdmin && (
            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 transition-all duration-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#741B2D]" />
              <span className="hidden sm:inline">Guest Portal</span>
            </Link>
          )}

          {/* Reserve CTA */}
          <button
            onClick={() => (onOpenBooking ? onOpenBooking() : (window.location.href = '/#suites'))}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reserve Now</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white hover:text-[#E5C378] transition-colors cursor-pointer flex items-center justify-center shadow-xs ml-1"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Animated Navigation Drawer */}
      {mobileMenuOpen && !isAdmin && (
        <div className="md:hidden border-t border-[#5A1C2A] bg-[#2B0E14]/98 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 px-5 py-6">
          <nav className="flex flex-col space-y-3">
            <Link
              href="#home"
              onClick={handleMobileNavClick}
              className="flex items-center justify-between py-2 text-sm font-semibold tracking-wider text-[#F5EFEB] hover:text-[#E5C378] border-b border-[#5A1C2A]/40 transition-colors uppercase"
            >
              <span>Home</span>
              <span className="text-[#E5C378]/50 text-xs">01</span>
            </Link>
            <Link
              href="#haven"
              onClick={handleMobileNavClick}
              className="flex items-center justify-between py-2 text-sm font-semibold tracking-wider text-[#F5EFEB] hover:text-[#E5C378] border-b border-[#5A1C2A]/40 transition-colors uppercase"
            >
              <span>The Haven</span>
              <span className="text-[#E5C378]/50 text-xs">02</span>
            </Link>
            <Link
              href="#suites"
              onClick={handleMobileNavClick}
              className="flex items-center justify-between py-2 text-sm font-semibold tracking-wider text-[#F5EFEB] hover:text-[#E5C378] border-b border-[#5A1C2A]/40 transition-colors uppercase"
            >
              <span>Suites & Villa</span>
              <span className="text-[#E5C378]/50 text-xs">03</span>
            </Link>
            <Link
              href="#amenities"
              onClick={handleMobileNavClick}
              className="flex items-center justify-between py-2 text-sm font-semibold tracking-wider text-[#F5EFEB] hover:text-[#E5C378] border-b border-[#5A1C2A]/40 transition-colors uppercase"
            >
              <span>Amenities</span>
              <span className="text-[#E5C378]/50 text-xs">04</span>
            </Link>
            {onOpenMyBookings && (
              <button
                type="button"
                onClick={() => {
                  handleMobileNavClick();
                  onOpenMyBookings();
                }}
                className="flex items-center justify-between py-2.5 text-sm font-semibold tracking-wider text-[#E5C378] hover:text-white border-b border-[#5A1C2A]/40 transition-colors uppercase text-left w-full cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-[#E5C378]" />
                  Verify Booking
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/30">
                  Guest
                </span>
              </button>
            )}
          </nav>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                handleMobileNavClick();
                if (onOpenBooking) {
                  onOpenBooking();
                } else {
                  window.location.href = '/#suites';
                }
              }}
              className="w-full py-3 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve Your Stay</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
