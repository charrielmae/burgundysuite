'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Save,
} from 'lucide-react';

interface CloudflareD1ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (connected: boolean) => void;
}

export default function CloudflareD1Modal({
  isOpen,
  onClose,
  onStatusChange,
}: CloudflareD1ModalProps) {
  const [accountId, setAccountId] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const checkStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await fetch('/api/cloudflare');
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
        if (onStatusChange) {
          onStatusChange(Boolean(data.data.connected));
        }
      }
    } catch (err) {
      console.error('Failed to probe Cloudflare D1:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      setToast(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!accountId.trim() || !databaseId.trim() || !apiToken.trim()) {
      setToast({
        type: 'error',
        message: 'Please fill in Account ID, Database ID, and API Token.',
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/cloudflare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: accountId.trim(),
          databaseId: databaseId.trim(),
          apiToken: apiToken.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect to Cloudflare D1');
      }

      setToast({
        type: 'success',
        message: data.message || 'Cloudflare D1 credentials verified and all data synced!',
      });
      await checkStatus();
    } catch (err) {
      setToast({
        type: 'error',
        message: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSyncOnly = async () => {
    setToast(null);
    try {
      setLoading(true);
      const res = await fetch('/api/cloudflare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_now' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Sync failed');
      }
      setToast({
        type: 'success',
        message: data.message || 'All local suites, rooms, and bookings synced to Cloudflare D1!',
      });
      await checkStatus();
    } catch (err) {
      setToast({
        type: 'error',
        message: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F6821F]/10 text-[#F6821F] flex items-center justify-center border border-[#F6821F]/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Cloudflare D1 Database Sync</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Live DBMS
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Connect and sync Burgundy Suite records with Cloudflare D1.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-start gap-3 ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{toast.message}</div>
            </div>
          )}

          {/* Current Live Status Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-slate-700">
                  {statusLoading
                    ? 'Probing Cloudflare D1...'
                    : status?.connected
                    ? 'Cloudflare D1 Connected & Ready'
                    : 'Cloudflare D1 Disconnected'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {statusLoading
                    ? 'Testing connection...'
                    : status?.message || 'Awaiting valid Cloudflare credentials'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={checkStatus}
                disabled={statusLoading}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>

              {status?.connected && (
                <button
                  type="button"
                  onClick={handleManualSyncOnly}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-xl bg-[#741B2D] text-white text-xs font-bold hover:bg-[#5A1C2A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Sync All Local Data</span>
                </button>
              )}
            </div>
          </div>

          {/* Tables Found in Cloudflare D1 */}
          {status?.tables && status.tables.length > 0 && (
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active D1 Tables & Row Counts</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {status.tables.map((tbl: string) => (
                  <div
                    key={tbl}
                    className="p-2 rounded-xl bg-white border border-emerald-200/80 shadow-2xs flex flex-col"
                  >
                    <span className="text-[10px] text-slate-500 font-semibold truncate">{tbl}</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {status.counts?.[tbl] !== undefined ? `${status.counts[tbl]} rows` : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSaveAndSync} className="space-y-4">
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Enter Cloudflare D1 Credentials
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">
                These will be saved directly into <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env.local</code> and applied to the active database connection.
              </p>

              <div className="space-y-3.5">
                {/* Account ID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cloudflare Account ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7a9f8b4c2d1e0f3a6b5c4d3e2f1a0b9c"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Found in the right sidebar of your Cloudflare Dashboard overview page.
                  </p>
                </div>

                {/* Database ID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cloudflare D1 Database ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8f6b4e2a-1c3d-5e7f-9a0b-2c4d6e8f0a2b"
                    value={databaseId}
                    onChange={(e) => setDatabaseId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Found under Cloudflare Dashboard → Workers & Pages → D1 → Your Database.
                  </p>
                </div>

                {/* API Token */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cloudflare API Token (with D1 Edit Permissions) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. cloufdlare_api_token_here..."
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Create in My Profile → API Tokens → Create Token → Select &quot;D1:Edit&quot; permissions.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#F6821F] hover:bg-[#E57213] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting & Syncing...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Save & Sync to Cloudflare D1</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
