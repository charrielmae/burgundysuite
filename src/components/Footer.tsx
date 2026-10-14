'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, Share2, Compass, Award, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a080c] text-white border-t border-[#5A1C2A]/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#5A1C2A]/40">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5A1C2A] border border-[#E5C378]/40 flex items-center justify-center text-[#E5C378] font-serif font-bold text-lg">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-wider text-white text-base font-bold uppercase">
                  Burgundy Suite
                </span>
                <span className="text-[9px] tracking-widest text-[#E5C378]/70 uppercase">
                  Boutique Haven & Spa
                </span>
              </div>
            </div>
            <p className="text-xs text-[#F5EFEB]/70 leading-relaxed">
              A private coastal haven in Emerald Bay where world-class hospitality, fine dining, and
              secluded architectural suites converge.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[#E5C378]">
              <Globe className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
              <Share2 className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
              <Compass className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#E5C378] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#F5EFEB]/75">
              <li>
                <Link href="#home" className="hover:text-[#E5C378] transition-colors">
                  Home Sanctuary
                </Link>
              </li>
              <li>
                <Link href="#haven" className="hover:text-[#E5C378] transition-colors">
                  The Haven & Estate
                </Link>
              </li>
              <li>
                <Link href="#suites" className="hover:text-[#E5C378] transition-colors">
                  Suites & Private Villas
                </Link>
              </li>
              <li>
                <Link href="#amenities" className="hover:text-[#E5C378] transition-colors">
                  Curated Indulgences
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-[#E5C378] transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3 h-3 text-[#E5C378]" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Suites Showcase */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#E5C378] uppercase tracking-wider">
              Accommodations
            </h4>
            <ul className="space-y-2 text-xs text-[#F5EFEB]/75">
              <li>Deluxe Suite — From ₱250/nt</li>
              <li>Executive King — From ₱420/nt</li>
              <li>Presidential Suite — From ₱750/nt</li>
              <li>Penthouse Haven — From ₱1,200/nt</li>
              <li className="text-[11px] text-[#E5C378] pt-1">
                ★ 24/7 Butler & Helipad Transfer
              </li>
            </ul>
          </div>

          {/* Contact & Concierge */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#E5C378] uppercase tracking-wider">
              Concierge & Arrival
            </h4>
            <div className="space-y-2.5 text-xs text-[#F5EFEB]/75">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E5C378] shrink-0 mt-0.5" />
                <span>Burgundy Cliff, Emerald Bay Enclave, Sapphire Coast</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E5C378] shrink-0" />
                <span>+63 917 888 2874 / (02) 8555-BURG</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E5C378] shrink-0" />
                <span>concierge@burgundysuite.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin Portal Pill */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© 2026 Burgundy Suite & Resort. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Hospitality</span>
            <span className="hover:text-white cursor-pointer">Concierge Protocols</span>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2B0E14] border border-[#5A1C2A] text-[#E5C378] hover:text-white hover:border-[#E5C378] transition-all cursor-pointer shadow-xs ml-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5C378]" />
              <span className="font-semibold text-[11px]">Admin Portal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
