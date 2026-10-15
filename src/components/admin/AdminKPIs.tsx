'use client';

import React from 'react';
import { DollarSign, Percent, Bell, Clock, TrendingUp } from 'lucide-react';
import { AdminKPIs as AdminKPIsType } from '@/types/database';

interface AdminKPIsProps {
  kpis: AdminKPIsType;
}

export default function AdminKPIs({ kpis }: AdminKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Total Revenue */}
      <div className="p-6 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between hover:border-[#E5C378]/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#E5C378] uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="w-8 h-8 rounded-full bg-[#240A10] border border-[#5A1C2A] flex items-center justify-center text-[#E5C378] font-bold text-sm shadow-xs">
            ₱
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-white tracking-tight">
            ₱{kpis.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{kpis.weekly_revenue_delta} from last week</span>
          </div>
        </div>
      </div>

      {/* 2. Occupancy Rate */}
      <div className="p-6 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between hover:border-[#E5C378]/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#E5C378] uppercase tracking-wider">
            Occupancy Rate
          </span>
          <div className="w-8 h-8 rounded-full bg-[#240A10] border border-[#5A1C2A] flex items-center justify-center text-[#E5C378] shadow-xs">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-white tracking-tight">
            {kpis.occupancy_rate_percent}%
          </div>
          <div className="text-xs text-white/60 mt-1.5 font-medium">
            {kpis.occupied_rooms_count} / {kpis.total_rooms_count} Rooms Occupied
          </div>
        </div>
      </div>

      {/* 3. Pending Checkouts Today */}
      <div className="p-6 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between hover:border-rose-400/50 transition-all duration-300 relative overflow-hidden">
        {kpis.pending_checkouts_today_count > 0 && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-xl pointer-events-none" />
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#E5C378] uppercase tracking-wider">
            Pending Checkouts Today
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-300 shadow-xs">
            <Bell className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-rose-400 tracking-tight">
            {kpis.pending_checkouts_today_count}
          </div>
          <div className="text-xs text-rose-300/80 mt-1.5 font-medium">
            Requires Front Desk clearance
          </div>
        </div>
      </div>

      {/* 4. Avg Stay Duration */}
      <div className="p-6 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between hover:border-[#E5C378]/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#E5C378] uppercase tracking-wider">
            Avg Stay Duration
          </span>
          <div className="w-8 h-8 rounded-full bg-[#240A10] border border-[#5A1C2A] flex items-center justify-center text-[#E5C378] shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-white tracking-tight">
            {kpis.avg_stay_duration_nights}{' '}
            <span className="text-xl font-normal text-white/60">Nights</span>
          </div>
          <div className="text-xs text-white/60 mt-1.5 font-medium">Based on active logs</div>
        </div>
      </div>
    </div>
  );
}
