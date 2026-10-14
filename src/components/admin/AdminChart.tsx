'use client';

import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

interface WeeklyDataPoint {
  day: string;
  revenue: number;
  occupancy_pct: number;
  label: string;
}

interface AdminChartProps {
  data: WeeklyDataPoint[];
}

export default function AdminChart({ data }: AdminChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Maximum value for scaling (with some headroom)
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 4000);

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-[#381018] border border-[#5A1C2A] shadow-lg">
      {/* Title & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#E5C378]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Weekly Performance & Revenue Report
            </h3>
          </div>
          <p className="text-xs text-white/60 mt-1">
            Comparative revenue breakdown and booking trends across current week
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-[#E5C378]">
          <span className="w-3.5 h-3.5 rounded-sm bg-gradient-to-t from-[#742537] via-[#C5A059] to-[#E5C378]" />
          <span className="font-semibold tracking-wide">Revenue (₱)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-6 pb-2">
        {/* Horizontal grid guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
          <div className="border-b border-white w-full" />
          <div className="border-b border-white w-full" />
          <div className="border-b border-white w-full" />
          <div className="border-b border-white w-full" />
        </div>

        {/* Bar Columns Container */}
        <div className="relative h-64 sm:h-72 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {data.map((item, idx) => {
            const heightPercent = Math.max(12, Math.round((item.revenue / maxRevenue) * 100));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 px-3 py-1.5 rounded-xl bg-[#2B0E14] border border-[#E5C378] text-white shadow-xl text-center pointer-events-none animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap">
                    <span className="block font-bold text-xs text-[#E5C378]">
                      ₱{item.revenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/70">
                      {item.occupancy_pct}% Occupancy ({item.label})
                    </span>
                  </div>
                )}

                {/* Gold Gradient Bar Plate */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[80px] rounded-t-xl transition-all duration-300 relative overflow-hidden ${isHovered
                      ? 'bg-gradient-to-t from-[#5A1C2A] via-[#E5C378] to-[#FFF6D6] shadow-[0_0_20px_rgba(229,195,120,0.5)] scale-[1.02]'
                      : 'bg-gradient-to-t from-[#4A1521] via-[#C5A059] to-[#E5C378]'
                    }`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Day Label */}
                <span
                  className={`mt-3 text-xs font-semibold transition-colors ${isHovered ? 'text-[#E5C378]' : 'text-white/60'
                    }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
