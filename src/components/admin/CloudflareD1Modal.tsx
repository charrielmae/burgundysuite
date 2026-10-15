'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
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
  const [activeTab, setActiveTab] = useState<'status' | 'd1' | 'r2'>('status');

  // D1 States
  const [accountId, setAccountId] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [apiToken, setApiToken] = useState('');

  // R2 States
  const [r2BucketName, setR2BucketName] = useState('burgundy-bucket');
  const [r2AccessKeyId, setR2AccessKeyId] = useState('');
  const [r2SecretAccessKey, setR2SecretAccessKey] = useState('');
  const [r2PublicUrl, setR2PublicUrl] = useState('');

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
      console.error('Failed to probe Cloudflare services:', err);
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

  const handleSaveAndSyncD1 = async (e: React.FormEvent) => {
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

  const handleSaveR2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    try {
      setLoading(true);
      const res = await fetch('/api/cloudflare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_r2',
          r2BucketName: r2BucketName.trim(),
          r2AccessKeyId: r2AccessKeyId.trim(),
          r2SecretAccessKey: r2SecretAccessKey.trim(),
          r2PublicUrl: r2PublicUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update Cloudflare R2');
      }

      setToast({
        type: 'success',
        message: 'Cloudflare R2 Object Storage settings successfully updated!',
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
                <span>Cloudflare Services & Storage</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  D1 & R2
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Live Cloudflare D1 Database and R2 Object Storage for Burgundy Suite & Resort.
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

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-slate-50/70 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-[#741B2D] text-[#741B2D]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Overview & Health</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('r2')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'r2'
                ? 'border-[#741B2D] text-[#741B2D]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>R2 Object Storage</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('d1')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'd1'
                ? 'border-[#741B2D] text-[#741B2D]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>D1 SQL Settings</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
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

          {/* TAB 1: OVERVIEW & HEALTH */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Service 1: Cloudflare D1 Database */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block text-slate-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      <span>Cloudflare D1 Database (SQL)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {statusLoading
                        ? 'Testing connection...'
                        : status?.connected
                        ? `Connected (${status?.tables?.length || 0} tables, Live UTC: ${status?.serverUtc || 'Active'})`
                        : status?.message || 'Disconnected'}
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
                    <span>Ping</span>
                  </button>

                  {status?.connected && (
                    <button
                      type="button"
                      onClick={handleManualSyncOnly}
                      disabled={loading}
                      className="px-3.5 py-1.5 rounded-xl bg-[#741B2D] text-white text-xs font-bold hover:bg-[#5A1C2A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Sync Data</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Service 2: Cloudflare R2 Object Storage */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      status?.r2?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block text-slate-800 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                      <span>Cloudflare R2 Object Storage (burgundy-bucket)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono text-[10px]">
                      https://b730d1dce2f590cd1ae5726758a0e590.r2.cloudflarestorage.com/burgundy-bucket
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active Storage
                  </span>
                </div>
              </div>

              {/* Active D1 Tables & Row Counts */}
              {status?.tables && status.tables.length > 0 && (
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Synchronized Cloudflare D1 Tables & Row Counts</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {status.tables.map((tbl: string) => (
                      <div
                        key={tbl}
                        className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs flex flex-col"
                      >
                        <span className="text-[10px] text-slate-500 font-semibold truncate">
                          {tbl}
                        </span>
                        <span className="font-bold text-emerald-800 text-sm">
                          {status.counts?.[tbl] !== undefined
                            ? `${status.counts[tbl]} rows`
                            : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: R2 OBJECT STORAGE CONFIGURATION */}
          {activeTab === 'r2' && (
            <form onSubmit={handleSaveR2} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-amber-700" />
                  Cloudflare R2 Bucket Details
                </span>
                <p className="text-[11px] text-amber-800">
                  Suite images uploaded in the Admin portal are stored in Cloudflare R2 bucket:{' '}
                  <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 font-bold">
                    burgundy-bucket
                  </code>
                  .
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    R2 Bucket Name
                  </label>
                  <input
                    type="text"
                    required
                    value={r2BucketName}
                    onChange={(e) => setR2BucketName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    R2 S3 Access Key ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 32-character R2 Access Key ID"
                    value={r2AccessKeyId}
                    onChange={(e) => setR2AccessKeyId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Generated in Cloudflare Dashboard → R2 Overview → Manage R2 API Tokens.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    R2 S3 Secret Access Key (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. 64-character R2 Secret Access Key"
                    value={r2SecretAccessKey}
                    onChange={(e) => setR2SecretAccessKey(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    R2 Public Bucket URL / Custom Domain (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://pub-xxxx.r2.dev or https://media.burgundysuite.com"
                    value={r2PublicUrl}
                    onChange={(e) => setR2PublicUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#741B2D] hover:bg-[#5A1C2A] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Update R2 Storage Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: D1 SQL DATABASE CONFIGURATION */}
          {activeTab === 'd1' && (
            <form onSubmit={handleSaveAndSyncD1} className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Cloudflare D1 Database Credentials
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Applied directly to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env.local</code> and synced with Cloudflare D1.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cloudflare Account ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. b730d1dce2f590cd1ae5726758a0e590"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cloudflare D1 Database ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9b1eb0fe-1e04-44d1-9cc7-e1a800009618"
                      value={databaseId}
                      onChange={(e) => setDatabaseId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cloudflare API Token *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. cfut_..."
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-mono shadow-xs focus:ring-2 focus:ring-[#741B2D]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#F6821F] hover:bg-[#E57213] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Save & Sync to Cloudflare D1</span>
                </button>
              </div>
            </form>
          )}

          {/* Bottom Close Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
