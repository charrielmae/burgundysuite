'use client';

import React, { useState } from 'react';
import { RoomWithDetails, RoomStatus } from '@/types/database';
import { Bed, Users, Layers, CheckCircle, AlertCircle, Wrench, Plus } from 'lucide-react';

interface RoomInventoryGridProps {
  rooms: RoomWithDetails[];
  onStatusChange: (roomId: number, newStatus: RoomStatus) => Promise<void>;
  onOpenAddSuite?: () => void;
}

export default function RoomInventoryGrid({
  rooms,
  onStatusChange,
  onOpenAddSuite,
}: RoomInventoryGridProps) {
  const [filter, setFilter] = useState<'all' | RoomStatus>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filteredRooms = filter === 'all' ? rooms : rooms.filter((r) => r.room_status === filter);

  // Counts
  const availableCount = rooms.filter((r) => r.room_status === 'available').length;
  const occupiedCount = rooms.filter((r) => r.room_status === 'occupied').length;
  const maintenanceCount = rooms.filter((r) => r.room_status === 'maintenance').length;

  const handleStatusSelect = async (roomId: number, status: RoomStatus) => {
    setUpdatingId(roomId);
    try {
      await onStatusChange(roomId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>Available</span>
          </span>
        );
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Occupied</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Wrench className="w-3 h-3" />
            <span>Maintenance</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-slate-900 tracking-wide">
            Room Inventory & Live Availability
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy status across all retreat wings and floors
          </p>
        </div>

        {/* Right: Tab Filters & Add Suite Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({rooms.length})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'available'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => setFilter('occupied')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'occupied'
                  ? 'bg-white text-rose-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Occupied ({occupiedCount})
            </button>
            <button
              onClick={() => setFilter('maintenance')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'maintenance'
                  ? 'bg-white text-amber-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maintenance ({maintenanceCount})
            </button>
          </div>

          {onOpenAddSuite && (
            <button
              onClick={onOpenAddSuite}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Suite</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          const isUpdating = updatingId === room.room_id;

          return (
            <div
              key={room.room_id}
              className={`p-5 rounded-2xl bg-white border transition-all duration-300 shadow-xs flex flex-col justify-between ${
                room.room_status === 'occupied'
                  ? 'border-rose-100 hover:border-rose-300'
                  : room.room_status === 'available'
                  ? 'border-emerald-100 hover:border-emerald-300'
                  : 'border-amber-100 hover:border-amber-300'
              }`}
            >
              {/* Card Header: Room # and Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-serif font-bold text-slate-800 text-base">
                    {room.room_number}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      Room {room.room_number}
                    </h4>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Layers className="w-3 h-3 text-slate-400" />
                      Floor {room.floor_number}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(room.room_status)}</div>
              </div>

              {/* Suite Information */}
              <div className="py-3 border-y border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">{room.room_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Capacity:</span>
                  <span className="text-slate-700">{room.room_capacity} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nightly Rate:</span>
                  <span className="font-bold text-[#741B2D]">₱{room.rate_per_night} / night</span>
                </div>
              </div>

              {/* Status Switcher Control */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Change Status:
                </span>
                <select
                  disabled={isUpdating}
                  value={room.room_status}
                  onChange={(e) =>
                    handleStatusSelect(room.room_id, e.target.value as RoomStatus)
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#741B2D] cursor-pointer disabled:opacity-50"
                >
                  <option value="available">Set Available</option>
                  <option value="occupied">Set Occupied</option>
                  <option value="maintenance">Set Maintenance</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
