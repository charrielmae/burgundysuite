'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  Download,
  Bell,
  RotateCcw,
  PlusCircle,
  ExternalLink,
  LogOut,
  UserCheck,
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
    <header className="w-full bg-[#2B0E14] border-b border-[#5A1C2A] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Title and Badge */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#E5C378] uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-[#E5C378]" />
            <span>Burgundy Suite Executive Management System</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Admin Command Center
          </h1>
        </div>

        {/* Portal Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Admin Profile Pill with Logout */}
          {currentUser && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#1A080C] border border-[#5A1C2A] shadow-inner">
              <div className="w-6 h-6 rounded-full bg-[#5A1C2A] text-[#E5C378] text-[10px] font-bold flex items-center justify-center border border-[#E5C378]/30">
                {currentUser.first_name[0]}
              </div>
              <div className="text-left text-xs">
                <span className="font-semibold text-white block leading-none">
                  {currentUser.first_name} {currentUser.last_name}
                </span>
                <span className="text-[10px] text-[#E5C378]/80 block leading-tight mt-0.5">
                  {currentUser.position}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Log Out"
                  className="ml-1 p-1.5 rounded-full bg-[#2B0E14] hover:bg-rose-950 text-white/50 hover:text-rose-300 border border-[#5A1C2A] hover:border-rose-800 transition-colors cursor-pointer flex items-center gap-1 text-[10px] px-2"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
          {/* Switcher Pill */}
          <div className="flex items-center p-1 rounded-full bg-[#1A080C] border border-[#5A1C2A]">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Guest Portal</span>
              <ExternalLink className="w-3 h-3 text-white/40" />
            </Link>
            <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#381018] text-[#E5C378] border border-[#E5C378]/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin Portal</span>
            </div>
          </div>

          {/* Simulate Due Checkouts Button */}
          <button
            onClick={onSimulateCheckouts}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#381018] text-[#E5C378] border border-[#5A1C2A] hover:border-[#E5C378]/60 hover:bg-[#4A1521] transition-all cursor-pointer shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Due Checkouts</span>
          </button>

          {/* Export Weekly Report Button */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] hover:shadow-lg transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Weekly Report</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            title="Reset DB to Default Seed"
            className="w-9 h-9 rounded-xl bg-[#1A080C] border border-[#5A1C2A] hover:border-[#E5C378]/60 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative w-9 h-9 rounded-xl bg-[#381018] border border-[#5A1C2A] flex items-center justify-center text-white/80">
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
