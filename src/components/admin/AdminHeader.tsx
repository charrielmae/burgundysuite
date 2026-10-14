'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Download,
  Bell,
  RotateCcw,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { AuthenticatedAdmin } from '@/lib/db';

interface AdminHeaderProps {
  onSimulateCheckouts: () => void;
  onExportReport: () => void;
  onResetData: () => void;
  pendingCheckoutsCount: number;
  currentUser?: AuthenticatedAdmin | null;
  onLogout?: () => void;
}

export default function AdminHeader({
  onSimulateCheckouts,
  onExportReport,
  onResetData,
  pendingCheckoutsCount,
  currentUser,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-xs sticky top-20 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Admin Profile & Portal Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Admin Profile Pill with Logout */}
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

          {/* Portal Switcher Pill */}
          <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <span>Guest Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#741B2D] border border-slate-200/80 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Right Side: Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Simulate Due Checkouts Button */}
          <button
            onClick={onSimulateCheckouts}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            <span>Simulate Due Checkouts</span>
          </button>

          {/* Export Weekly Report Button */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#741B2D] text-white hover:bg-[#5A1C2A] transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Weekly Report</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            title="Reset DB to Default Seed"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
            <Bell className="w-4 h-4" />
            {pendingCheckoutsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                {pendingCheckoutsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
