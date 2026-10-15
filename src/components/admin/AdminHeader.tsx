'use client';

import React from 'react';
import Image from 'next/image';
import {
  Download,
  LogOut,
  Plus,
} from 'lucide-react';
import { AuthenticatedAdmin } from '@/lib/db';

interface AdminHeaderProps {
  onExportReport: () => void;
  onOpenAddSuite?: () => void;
  currentUser?: AuthenticatedAdmin | null;
  onLogout?: () => void;
}

export default function AdminHeader({
  onExportReport,
  onOpenAddSuite,
  currentUser,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="w-full bg-[#381018]/95 backdrop-blur-md border-b border-[#5A1C2A] py-4 px-4 sm:px-6 lg:px-8 shadow-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#240A10] border border-[#E5C378]/40 shadow-sm shrink-0 p-1 flex items-center justify-center">
            <Image
              src="/burgundylogov2.png"
              alt="Burgundy Suite Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-serif leading-none tracking-wide">
              Burgundy Suite & Resort
            </h1>
            <p className="text-[11px] text-[#E5C378]/80 mt-1 leading-none font-medium">
              Administrative Command Center
            </p>
          </div>
        </div>

        {/* Right Side: Action Controls & User Profile (Beside Export) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Add Suite / Room Button */}
          {onOpenAddSuite && (
            <button
              onClick={onOpenAddSuite}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-emerald-700 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-sm border border-emerald-500/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Suite</span>
            </button>
          )}

          {/* Export Weekly Report Button */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#5A1C2A] text-[#E5C378] hover:bg-[#6D2233] border border-[#E5C378]/30 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Weekly Report</span>
          </button>

          {/* Active Admin Profile Pill with Logout (Positioned on the Right Side Beside Export) */}
          {currentUser && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#240A10] border border-[#5A1C2A] shadow-md">
              <div className="w-7 h-7 rounded-full bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/30 text-xs font-bold flex items-center justify-center shadow-xs">
                {currentUser.first_name[0]}
              </div>
              <div className="text-left text-xs">
                <span className="font-semibold text-white block leading-tight">
                  {currentUser.first_name} {currentUser.last_name}
                </span>
                <span className="text-[10px] text-[#E5C378] font-medium block leading-tight">
                  {currentUser.position}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Log Out of Admin System"
                  className="ml-1 p-1 rounded-full bg-[#381018] hover:bg-rose-950/60 text-white/70 hover:text-rose-300 border border-[#5A1C2A] hover:border-rose-400/40 transition-colors cursor-pointer flex items-center gap-1 text-[10px] px-2 font-medium"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
