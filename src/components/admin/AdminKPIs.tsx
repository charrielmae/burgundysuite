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
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="w-8 h-8 rounded-full bg-[#741B2D]/10 border border-[#741B2D]/20 flex items-center justify-center text-[#741B2D] font-bold text-sm">
            ₱
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
            ₱{kpis.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{kpis.weekly_revenue_delta} from last week</span>
          </div>
        </div>
      </div>

      {/* 2. Occupancy Rate */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Occupancy Rate
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
            {kpis.occupancy_rate_percent}%
          </div>
          <div className="text-xs text-slate-500 mt-1.5 font-medium">
            {kpis.occupied_rooms_count} / {kpis.total_rooms_count} Rooms Occupied
          </div>
        </div>
      </div>

      {/* 3. Pending Checkouts Today */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
        {kpis.pending_checkouts_today_count > 0 && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-xl pointer-events-none" />
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Checkouts Today
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Bell className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-rose-600 tracking-tight">
            {kpis.pending_checkouts_today_count}
          </div>
          <div className="text-xs text-rose-600/80 mt-1.5 font-medium">
            Requires Front Desk clearance
          </div>
        </div>
      </div>

      {/* 4. Avg Stay Duration */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Avg Stay Duration
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
            {kpis.avg_stay_duration_nights}{' '}
            <span className="text-xl font-normal text-slate-500">Nights</span>
          </div>
          <div className="text-xs text-slate-500 mt-1.5 font-medium">Based on active logs</div>
        </div>
      </div>
    </div>
  );
}
