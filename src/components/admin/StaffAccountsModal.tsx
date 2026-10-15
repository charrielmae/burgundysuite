'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Shield,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  Users,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Phone,
  Lock,
  Sparkles,
} from 'lucide-react';
import { StaffAccountWithUser, NewAccountRequest } from '@/types/database';

interface StaffAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export default function StaffAccountsModal({
  isOpen,
  onClose,
  onSuccess,
}: StaffAccountsModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [accounts, setAccounts] = useState<StaffAccountWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('Staff Concierge');
  const [contactNumber, setContactNumber] = useState('+63 917 ');

  const loadAccounts = async () => {
    try {
      setFetching(true);
      const res = await fetch('/api/admin/accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      const payload: NewAccountRequest = {
        user_name: username.trim(),
        password: password.trim(),
        user_role: role,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        position: position.trim(),
        contact_number: contactNumber.trim(),
      };

      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setSuccess(`Account for ${data.data.first_name} ${data.data.last_name} (${data.data.user_role}) created and synced to Cloudflare D1!`);
      if (onSuccess) {
        onSuccess(data.message);
      }

      // Reset form
      setUsername('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setContactNumber('+63 917 ');

      await loadAccounts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#2B0E14] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#381018] border-b border-[#5A1C2A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A1C2A] text-[#E5C378] flex items-center justify-center border border-[#E5C378]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                  Staff & Admin Account Provisioning
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5C378]/10 text-[#E5C378] border border-[#E5C378]/30">
                  Internal Only
                </span>
              </div>
              <p className="text-xs text-white/60">
                Private management: No public registration. Only administrators can provision accounts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2B0E14] hover:bg-[#5A1C2A] text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 pt-4 border-b border-[#5A1C2A] gap-4 shrink-0 bg-[#2B0E14]">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'create'
                ? 'border-[#E5C378] text-[#E5C378]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Account</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'list'
                ? 'border-[#E5C378] text-[#E5C378]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Staff Directory ({accounts.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: Create Account Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#E5C378] mb-2">
                  Account Authority Level *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('staff')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'staff'
                        ? 'bg-[#381018] border-[#E5C378] shadow-md'
                        : 'bg-[#240A10] border-[#5A1C2A] hover:border-white/30 text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Briefcase className="w-3.5 h-3.5 text-[#E5C378]" />
                      <span>Staff Member</span>
                    </div>
                    <p className="text-[10px] text-white/60 mt-1">
                      Desk operations, room status, bookings check-in & concierge.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-[#381018] border-[#E5C378] shadow-md'
                        : 'bg-[#240A10] border-[#5A1C2A] hover:border-white/30 text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Shield className="w-3.5 h-3.5 text-[#E5C378]" />
                      <span>Administrator</span>
                    </div>
                    <p className="text-[10px] text-white/60 mt-1">
                      Full executive control, account provisioning, revenue & database sync.
                    </p>
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vincent"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dela Cruz"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
              </div>

              {/* Username & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    Login Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. staff_vincent"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#E5C378] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    Position / Department *
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white focus:outline-none focus:border-[#E5C378]"
                  >
                    <option value="Staff Concierge">Staff Concierge</option>
                    <option value="Front Desk Supervisor">Front Desk Supervisor</option>
                    <option value="Night Auditor">Night Auditor</option>
                    <option value="Guest Relations Officer">Guest Relations Officer</option>
                    <option value="Executive Housekeeper">Executive Housekeeper</option>
                    <option value="Duty Manager">Duty Manager</option>
                    <option value="General Manager">General Manager</option>
                  </select>
                </div>
              </div>

              {/* Password & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#E5C378]">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] text-[#E5C378] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#E5C378]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="+63 917 123 4567"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="p-3 rounded-xl bg-[#381018] border border-[#5A1C2A] text-[11px] text-white/70 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-[#E5C378] mt-0.5 shrink-0" />
                <span>
                  This account will be provisioned into <strong className="text-white">Cloudflare D1</strong> (<code className="text-[#E5C378]">USER_ACCOUNT</code> &amp; <code className="text-[#E5C378]">STAFF_DETAILS</code>) and <strong className="text-white">NextAuth</strong>. The user can log in immediately from the Admin Portal.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Provisioning Account...' : `Create ${role.toUpperCase()} Account`}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Accounts List */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {fetching ? (
                <div className="text-center py-8 text-xs text-white/60">
                  Loading staff accounts from database...
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-xs text-white/60">
                  No staff accounts found.
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts.map((acc) => (
                    <div
                      key={acc.user_id}
                      className="p-3.5 rounded-2xl bg-[#381018] border border-[#5A1C2A] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            acc.user_role === 'admin'
                              ? 'bg-[#E5C378] text-[#2B0E14]'
                              : 'bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/30'
                          }`}
                        >
                          {acc.first_name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {acc.first_name} {acc.last_name}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                acc.user_role === 'admin'
                                  ? 'bg-[#E5C378]/20 text-[#E5C378] border border-[#E5C378]/40'
                                  : 'bg-white/10 text-white/70 border border-white/20'
                              }`}
                            >
                              {acc.user_role}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/60 mt-0.5 flex items-center gap-2">
                            <span>@{acc.user_name}</span>
                            <span>•</span>
                            <span>{acc.position}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-white/50">
                        <div>{acc.contact_number}</div>
                        <div className="text-emerald-400 font-medium">● {acc.acc_status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
