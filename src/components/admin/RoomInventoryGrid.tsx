'use client';

import React, { useState } from 'react';
import { RoomWithDetails, RoomStatus } from '@/types/database';
import { Bed, Users, Layers, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

interface RoomInventoryGridProps {
  rooms: RoomWithDetails[];
  onStatusChange: (roomId: number, newStatus: RoomStatus) => Promise<void>;
}

export default function RoomInventoryGrid({ rooms, onStatusChange }: RoomInventoryGridProps) {
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>Available</span>
          </span>
        );
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/40 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#E5C378] animate-pulse" />
            <span>Occupied</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800">
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
          <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
            Room Inventory & Live Availability
          </h3>
          <p className="text-xs text-white/60 mt-1">
            Real-time occupancy status across all retreat wings and floors
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center p-1 rounded-xl bg-[#2B0E14] border border-[#5A1C2A] text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#4A1521] text-[#E5C378] font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All ({rooms.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'available'
                ? 'bg-[#4A1521] text-emerald-400 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'occupied'
                ? 'bg-[#4A1521] text-[#E5C378] font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Occupied ({occupiedCount})
          </button>
          <button
            onClick={() => setFilter('maintenance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'maintenance'
                ? 'bg-[#4A1521] text-amber-400 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Maintenance ({maintenanceCount})
          </button>
        </div>
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          const isUpdating = updatingId === room.room_id;

          return (
            <div
              key={room.room_id}
              className={`p-5 rounded-2xl bg-[#381018] border transition-all duration-300 shadow-md flex flex-col justify-between ${
                room.room_status === 'occupied'
                  ? 'border-[#5A1C2A] hover:border-[#E5C378]/40'
                  : room.room_status === 'available'
                  ? 'border-[#5A1C2A] hover:border-emerald-600/40'
                  : 'border-[#5A1C2A] hover:border-amber-600/40'
              }`}
            >
              {/* Card Header: Room # and Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#2B0E14] border border-[#5A1C2A] flex items-center justify-center font-serif font-bold text-white text-base">
                    {room.room_number}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-white">
                      Room {room.room_number}
                    </h4>
                    <span className="text-[11px] text-[#E5C378] flex items-center gap-1 font-medium">
                      <Layers className="w-3 h-3" />
                      Floor {room.floor_number}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(room.room_status)}</div>
              </div>

              {/* Suite Information */}
              <div className="py-3 border-y border-[#5A1C2A]/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Category:</span>
                  <span className="font-semibold text-white">{room.room_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Max Capacity:</span>
                  <span className="text-white">{room.room_capacity} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Nightly Rate:</span>
                  <span className="font-bold text-[#E5C378]">₱{room.rate_per_night} / night</span>
                </div>
              </div>

              {/* Status Switcher Control */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">
                  Change Status:
                </span>
                <select
                  disabled={isUpdating}
                  value={room.room_status}
                  onChange={(e) =>
                    handleStatusSelect(room.room_id, e.target.value as RoomStatus)
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#2B0E14] border border-[#5A1C2A] text-white text-xs font-medium focus:outline-none focus:border-[#E5C378] cursor-pointer disabled:opacity-50"
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
