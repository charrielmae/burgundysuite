'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminLoginGate from '@/components/admin/AdminLoginGate';
import AdminKPIs from '@/components/admin/AdminKPIs';
import RoomInventoryGrid from '@/components/admin/RoomInventoryGrid';
import BookingsTable from '@/components/admin/BookingsTable';
import PaymentLogs from '@/components/admin/PaymentLogs';
import AddSuiteModal from '@/components/admin/AddSuiteModal';
import CloudflareD1Modal from '@/components/admin/CloudflareD1Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Footer from '@/components/Footer';
import {
  AdminKPIs as AdminKPIsType,
  RoomWithDetails,
  BookingWithDetails,
  RoomStatus,
} from '@/types/database';
import { AuthenticatedAdmin } from '@/lib/db';
import { RotateCcw, Clock } from 'lucide-react';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedAdmin | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [kpis, setKpis] = useState<AdminKPIsType | null>(null);
  const [rooms, setRooms] = useState<RoomWithDetails[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddSuiteOpen, setIsAddSuiteOpen] = useState(false);
  const [isCloudflareOpen, setIsCloudflareOpen] = useState(false);
  const [isCloudflareConnected, setIsCloudflareConnected] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [kpiRes, roomRes, bookingRes, payRes, cfRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/rooms'),
        fetch('/api/bookings?filter=all'),
        fetch('/api/payments'),
        fetch('/api/cloudflare'),
      ]);

      const [kpiData, roomData, bookingData, payData, cfData] = await Promise.all([
        kpiRes.json(),
        roomRes.json(),
        bookingRes.json(),
        payRes.json(),
        cfRes.json(),
      ]);

      if (kpiData.success) setKpis(kpiData.data);
      if (roomData.success) setRooms(roomData.data);
      if (bookingData.success) setBookings(bookingData.data);
      if (payData.success) setPayments(payData.data);
      if (cfData.success) setIsCloudflareConnected(Boolean(cfData.data?.connected));
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error refreshing command center metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setAuthLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.data) {
        setCurrentUser(data.data);
        await loadData();
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      showToast('Successfully logged out of Admin Command Center.');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Handle Room Status Change
  const handleRoomStatusChange = async (roomId: number, newStatus: RoomStatus) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showToast(`Room #${roomId} status updated to ${newStatus.toUpperCase()}`);
      await loadData();
    } catch (err) {
      showToast(`Failed to update room: ${(err as Error).message}`);
    }
  };

  // Handle Process Check-out
  const handleProcessCheckout = async (bookingId: number) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showToast(data.message || `Booking #${bookingId} checked out successfully.`);
      await loadData();
    } catch (err) {
      showToast(`Check-out failed: ${(err as Error).message}`);
    }
  };

  // Simulate Due Checkouts Modal Confirmation
  const handleSimulateCheckouts = () => {
    setIsSimulateModalOpen(true);
  };

  const executeSimulateCheckouts = async () => {
    try {
      setIsSimulating(true);
      const res = await fetch('/api/admin/simulate-checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showToast(data.message || 'Simulated checkouts executed successfully.');
      setIsSimulateModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(`Simulation failed: ${(err as Error).message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset to default seed Modal Confirmation
  const handleResetData = () => {
    setIsResetModalOpen(true);
  };

  const executeResetData = async () => {
    try {
      setIsResetting(true);
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      showToast('Database successfully reset to original benchmark state.');
      setIsResetModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(`Reset failed: ${(err as Error).message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Export CSV Report
  const handleExportReport = () => {
    if (!kpis) return;

    let csv = `BURGUNDY SUITE & RESORT - EXECUTIVE WEEKLY MANAGEMENT REPORT\n`;
    csv += `Export Date,${new Date().toISOString()}\n`;
    csv += `Total Revenue,₱${kpis.total_revenue.toFixed(2)}\n`;
    csv += `Occupancy Rate,${kpis.occupancy_rate_percent}%\n`;
    csv += `Occupied Rooms,${kpis.occupied_rooms_count}/${kpis.total_rooms_count}\n`;
    csv += `Pending Checkouts Today,${kpis.pending_checkouts_today_count}\n`;
    csv += `Average Stay Duration,${kpis.avg_stay_duration_nights} Nights\n\n`;

    csv += `--- ROOM INVENTORY ---\n`;
    csv += `Room Number,Floor,Category,Nightly Rate,Status\n`;
    rooms.forEach((r) => {
      csv += `${r.room_number},${r.floor_number},"${r.room_type}",₱${r.rate_per_night},${r.room_status}\n`;
    });

    csv += `\n--- ACTIVE & RECENT BOOKINGS ---\n`;
    csv += `Booking ID,Guest Name,Email,Room Number,Check-In,Check-Out,Total Amount,Status\n`;
    bookings.forEach((b) => {
      csv += `#${b.booking_id},"${b.guest.first_name} ${b.guest.last_name}",${b.guest.email_address},${b.room.room_number},${b.check_in_date},${b.check_out_date},₱${b.total_amount},${b.booking_status}\n`;
    });

    csv += `\n--- PAYMENT AUDIT LOG ---\n`;
    csv += `Payment ID,Booking Ref,Guest Name,Method,Amount,Status,Timestamp\n`;
    payments.forEach((p) => {
      csv += `#PAY-${p.payment_id},#BSR-${p.booking_id},"${p.guest_name}","${p.payment_method}",₱${p.amount},${p.payment_status},"${p.payment_date || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Burgundy_Suite_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Weekly Management Report exported as CSV.');
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center text-slate-800">
        <div className="w-12 h-12 rounded-full border-2 border-[#741B2D] border-t-transparent animate-spin mb-4" />
        <p className="text-xs uppercase tracking-[0.2em] text-[#741B2D] font-bold">
          Verifying Management Credentials...
        </p>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <AdminLoginGate
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            loadData();
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col selection:bg-[#741B2D] selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <span className="text-xs font-semibold text-[#741B2D]">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar />

      {/* Admin Header with Actions & Current User Session */}
      <AdminHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAddSuite={() => setIsAddSuiteOpen(true)}
        onExportReport={handleExportReport}
      />

      {/* Main Command Center Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {loading || !kpis ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#741B2D] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-600 font-medium">Connecting to Burgundy Command Center...</p>
          </div>
        ) : (
          <>
            {/* 1. Key Metric KPI Cards (Screenshot 4) */}
            <AdminKPIs kpis={kpis} />

            {/* 2. Room Availability & Inventory Grid */}
            <RoomInventoryGrid
              rooms={rooms}
              onStatusChange={handleRoomStatusChange}
              onOpenAddSuite={() => setIsAddSuiteOpen(true)}
            />

            {/* 4. Reservations & Guest Bookings Table */}
            <BookingsTable
              bookings={bookings}
              onCheckOut={handleProcessCheckout}
            />

            {/* 5. Payment Transaction Logs */}
            <PaymentLogs payments={payments} />
          </>
        )}
      </div>

      {/* Admin Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Burgundy Suite & Resort — Executive Management Console</span>
          <span className="text-[11px] text-slate-400">DBMS Schema Compliant • Cloudflare D1 / SQLite</span>
        </div>
      </footer>

      {/* Add New Room / Suite Modal */}
      <AddSuiteModal
        isOpen={isAddSuiteOpen}
        onClose={() => setIsAddSuiteOpen(false)}
        onSuccess={(suiteName) => {
          showToast(`Suite "${suiteName}" published successfully! Available immediately in Guest Portal.`);
          loadData();
        }}
      />

      {/* Cloudflare D1 Connection & Sync Modal */}
      <CloudflareD1Modal
        isOpen={isCloudflareOpen}
        onClose={() => setIsCloudflareOpen(false)}
        onStatusChange={(connected) => {
          setIsCloudflareConnected(connected);
          loadData();
        }}
      />

      {/* Database Reset Benchmark Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={executeResetData}
        isLoading={isResetting}
        title="Reset Benchmark Database"
        variant="warning"
        confirmLabel="Reset to Seed State"
        cancelLabel="Cancel"
        icon={<RotateCcw className="w-5 h-5 text-amber-600" />}
        description={
          <p>
            Are you sure you want to reset the Burgundy database to its original benchmark demo state?
            All newly created suites, test reservations, and payment records will be refreshed back to seed data.
          </p>
        }
        detailsCard={
          <div className="space-y-1 text-slate-600">
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Resets 7 DBMS tables: USER_ACCOUNT, STAFF, GUEST, ROOMS, BOOKINGS, PAYMENTS</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Useful for refreshing demonstration environments and running new booking simulations.
            </div>
          </div>
        }
      />

      {/* Simulate Checkouts Modal */}
      <ConfirmModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onConfirm={executeSimulateCheckouts}
        isLoading={isSimulating}
        title="Simulate Due Checkouts"
        variant="burgundy"
        confirmLabel="Execute Due Checkouts"
        cancelLabel="Cancel"
        icon={<Clock className="w-5 h-5 text-[#741B2D]" />}
        description={
          <p>
            This action will automatically process check-out for all checked-in reservations whose departure date has been reached.
            All respective rooms will be restored to <strong className="text-emerald-700">Available</strong> inventory and synced across Cloudflare D1.
          </p>
        }
        detailsCard={
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Pending Due Departures</span>
              <span className="font-bold text-slate-900 text-sm">
                {kpis?.pending_checkouts_today_count || 0} reservations pending
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
              Automatic Room Release
            </div>
          </div>
        }
      />
    </main>
  );
}
