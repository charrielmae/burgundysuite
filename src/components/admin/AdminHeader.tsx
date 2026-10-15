'use client';

import React from 'react';
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
    <header className="w-full bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#741B2D]/10 text-[#741B2D] border border-[#741B2D]/20 flex items-center justify-center font-serif font-bold text-base shadow-xs">
            B
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 font-serif leading-none tracking-wide">
              Burgundy Suite & Resort
            </h1>
            <p className="text-[11px] text-slate-500 mt-1 leading-none font-medium">
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Suite</span>
            </button>
          )}

          {/* Export Weekly Report Button */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#741B2D] text-white hover:bg-[#5A1C2A] transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Weekly Report</span>
          </button>

          {/* Active Admin Profile Pill with Logout (Positioned on the Right Side Beside Export) */}
          {currentUser && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-[#741B2D] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {currentUser.first_name[0]}
              </div>
              <div className="text-left text-xs">
                <span className="font-semibold text-slate-900 block leading-tight">
                  {currentUser.first_name} {currentUser.last_name}
                </span>
                <span className="text-[10px] text-[#741B2D] font-medium block leading-tight">
                  {currentUser.position}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Log Out of Admin System"
                  className="ml-1 p-1 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer flex items-center gap-1 text-[10px] px-2 font-medium"
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
