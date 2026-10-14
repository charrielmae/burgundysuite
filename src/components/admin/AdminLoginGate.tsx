'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Info,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { AuthenticatedAdmin } from '@/lib/db';

interface AdminLoginGateProps {
  onLoginSuccess: (user: AuthenticatedAdmin) => void;
}

export default function AdminLoginGate({ onLoginSuccess }: AdminLoginGateProps) {
  const [username, setUsername] = useState('admin_clara');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onLoginSuccess(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Back to Guest Portal Link */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#741B2D] hover:text-[#5A1C2A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Guest Haven</span>
        </Link>
        <span className="text-[11px] text-slate-400 tracking-widest uppercase font-semibold">
          Admin System
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-xl p-8 relative z-10">
        {/* Emblem & Title */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-[#741B2D] border-2 border-[#741B2D] flex items-center justify-center text-white font-serif font-bold text-2xl mx-auto shadow-md">
            B
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-[0.25em] text-[#741B2D] uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Executive Management</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-wide mt-1">
              Admin Portal Login
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please enter your authorized management credentials to proceed.
            </p>
          </div>
        </div>

        {/* Guest Email Verification Notice (per user rule) */}
        <div className="my-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-amber-950">Looking for your room booking? </span>
            Guests do not have passwords. Use the{' '}
            <Link href="/#suites" className="underline font-semibold text-[#741B2D] hover:underline">
              Verify Booking
            </Link>{' '}
            button on the guest homepage with your Gmail.
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">
              Admin / Staff Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_clara or staff_vincent"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#741B2D] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#741B2D] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-[#741B2D] hover:bg-[#5A1C2A] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
          >
            {loading ? (
              <span>Authenticating Executive...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
            <Sparkles className="w-3 h-3 text-[#741B2D]" />
            <span>1-Click Test Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin_clara', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-[#741B2D] text-[11px]">
                Clara Montague
              </div>
              <div className="text-[10px] text-slate-500">Admin (GM)</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff_vincent', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-[#741B2D] text-[11px]">
                Vincent Moreau
              </div>
              <div className="text-[10px] text-slate-500">Staff (Concierge)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
