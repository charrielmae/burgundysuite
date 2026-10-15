'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-gradient-to-b from-[#2B0E14] via-[#240A10] to-[#170509] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-[#F5EFEB]">
      {/* Back to Guest Portal Link */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E5C378] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Guest Haven</span>
        </Link>
        <span className="text-[11px] text-[#E5C378]/60 tracking-widest uppercase font-semibold">
          Admin System
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#381018]/95 border border-[#5A1C2A] text-white rounded-3xl shadow-2xl p-8 relative z-10 backdrop-blur-md">
        {/* Emblem & Title */}
        <div className="text-center space-y-3 pb-6 border-b border-[#5A1C2A]/70">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#240A10] border-2 border-[#E5C378]/50 mx-auto shadow-2xl p-3 flex items-center justify-center">
            <Image
              src="/burgundylogov2.png"
              alt="Burgundy Suite Logo"
              width={80}
              height={80}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-[0.25em] text-[#E5C378] uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Executive Management</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-wide mt-1">
              Admin Portal Login
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Please enter your authorized management credentials to proceed.
            </p>
          </div>
        </div>

        {/* Guest Email Verification Notice (per user rule) */}
        <div className="my-5 p-3.5 rounded-2xl bg-[#240A10] border border-[#5A1C2A] flex items-start gap-2.5 text-xs text-white/80">
          <Info className="w-4 h-4 text-[#E5C378] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-[#E5C378]">Looking for your room booking? </span>
            Guests do not have passwords. Use the{' '}
            <Link href="/#suites" className="underline font-semibold text-[#E5C378] hover:text-white">
              Verify Booking
            </Link>{' '}
            button on the guest homepage with your Gmail.
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1.5">
              Admin / Staff Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E5C378]/70" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_clara or staff_vincent"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#E5C378] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E5C378]/70" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#E5C378] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-[#5A1C2A] hover:bg-[#6D2233] text-[#E5C378] border border-[#E5C378]/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
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
        <div className="mt-6 pt-5 border-t border-[#5A1C2A]/70">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#E5C378]/80 font-semibold mb-2.5">
            <Sparkles className="w-3 h-3 text-[#E5C378]" />
            <span>1-Click Test Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin_clara', 'admin123')}
              className="p-2.5 rounded-xl bg-[#240A10] hover:bg-[#2B0E14] border border-[#5A1C2A] hover:border-[#E5C378]/40 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-white group-hover:text-[#E5C378] text-[11px]">
                Clara Montague
              </div>
              <div className="text-[10px] text-white/50">Admin (GM)</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff_vincent', 'admin123')}
              className="p-2.5 rounded-xl bg-[#240A10] hover:bg-[#2B0E14] border border-[#5A1C2A] hover:border-[#E5C378]/40 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-white group-hover:text-[#E5C378] text-[11px]">
                Vincent Moreau
              </div>
              <div className="text-[10px] text-white/50">Staff (Concierge)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
