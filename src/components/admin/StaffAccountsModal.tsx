'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Briefcase,
  Phone,
  Lock,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { StaffAccountWithUser, NewAccountRequest, UpdateAccountRequest } from '@/types/database';

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
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const [accounts, setAccounts] = useState<StaffAccountWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Create Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('Staff Concierge');
  const [contactNumber, setContactNumber] = useState('+63 917 ');

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editRole, setEditRole] = useState<'staff' | 'admin'>('staff');
  const [editPassword, setEditPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      setEditingId(null);
      setConfirmDeleteId(null);
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
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
      setActiveTab('list');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (acc: StaffAccountWithUser) => {
    setError(null);
    setSuccess(null);
    setConfirmDeleteId(null);
    setEditingId(acc.user_id);
    setEditFirstName(acc.first_name);
    setEditLastName(acc.last_name);
    setEditPosition(acc.position);
    setEditContact(acc.contact_number);
    setEditRole(acc.user_role);
    setEditPassword('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPassword('');
  };

  const handleSaveEdit = async (userId: number) => {
    setError(null);
    setSuccess(null);

    if (!editFirstName.trim() || !editLastName.trim() || !editPosition.trim()) {
      setError('First name, last name, and position are required.');
      return;
    }

    try {
      setUpdating(true);
      const payload: UpdateAccountRequest = {
        user_id: userId,
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        position: editPosition.trim(),
        contact_number: editContact.trim(),
        user_role: editRole,
      };

      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await fetch('/api/admin/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update account.');
      }

      setSuccess(data.message || 'Staff account updated successfully.');
      setEditingId(null);
      await loadAccounts();
      if (onSuccess) {
        onSuccess(data.message);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async (userId: number) => {
    setError(null);
    setSuccess(null);

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/accounts?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete staff account.');
      }

      setSuccess(data.message || 'Staff account successfully removed.');
      setConfirmDeleteId(null);
      await loadAccounts();
      if (onSuccess) {
        onSuccess(data.message);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
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
                  Staff &amp; Admin Account Management
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5C378]/10 text-[#E5C378] border border-[#E5C378]/30">
                  General Manager Access
                </span>
              </div>
              <p className="text-xs text-white/60">
                Internal team only: General Manager can add, edit, and delete staff accounts.
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
            onClick={() => {
              setActiveTab('list');
              setEditingId(null);
            }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'list'
                ? 'border-[#E5C378] text-[#E5C378]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Staff Directory ({accounts.length})</span>
          </button>
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

          {/* TAB 1: Accounts List with Edit & Delete */}
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
                <div className="space-y-2.5">
                  {accounts.map((acc) => {
                    const isEditing = editingId === acc.user_id;
                    const isConfirmingDelete = confirmDeleteId === acc.user_id;

                    return (
                      <div
                        key={acc.user_id}
                        className={`p-4 rounded-2xl bg-[#381018] border transition-all ${
                          isEditing
                            ? 'border-[#E5C378] ring-1 ring-[#E5C378]/30 shadow-lg'
                            : isConfirmingDelete
                            ? 'border-rose-500/60 bg-rose-950/20'
                            : 'border-[#5A1C2A] hover:border-[#5A1C2A]/90'
                        }`}
                      >
                        {/* NORMAL DISPLAY ROW */}
                        {!isEditing ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  acc.user_role === 'admin'
                                    ? 'bg-[#E5C378] text-[#2B0E14]'
                                    : 'bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/30'
                                }`}
                              >
                                {acc.first_name[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white text-sm">
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
                                <div className="text-[11px] text-white/60 mt-0.5 flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[#E5C378]/80">@{acc.user_name}</span>
                                  <span>•</span>
                                  <span className="text-white/80 font-medium">{acc.position}</span>
                                  <span>•</span>
                                  <span>{acc.contact_number}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions Right Side */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#5A1C2A]/50">
                              {isConfirmingDelete ? (
                                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                                  <span className="text-[11px] text-rose-300 font-semibold">Delete?</span>
                                  <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() => handleDeleteAccount(acc.user_id)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase transition-colors cursor-pointer"
                                  >
                                    {deleting ? '...' : 'Yes, Delete'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1 rounded-lg bg-[#240A10] border border-[#5A1C2A] text-white/70 hover:text-white text-[10px] uppercase font-semibold transition-colors cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(acc)}
                                    title={`Edit ${acc.first_name}'s Details`}
                                    className="p-1.5 rounded-lg bg-[#240A10] hover:bg-[#5A1C2A] text-[#E5C378] hover:text-white border border-[#5A1C2A] transition-colors cursor-pointer flex items-center gap-1 text-[11px] px-2.5 font-medium"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(acc.user_id)}
                                    title={`Delete ${acc.first_name}'s Account`}
                                    className="p-1.5 rounded-lg bg-[#240A10] hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 border border-[#5A1C2A] hover:border-rose-400/40 transition-colors cursor-pointer flex items-center gap-1 text-[11px] px-2 font-medium"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* INLINE EDIT FORM */
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-[#5A1C2A] pb-2">
                              <span className="text-xs font-bold text-[#E5C378] uppercase tracking-wider flex items-center gap-1.5">
                                <Pencil className="w-3.5 h-3.5" />
                                Editing Staff Profile: @{acc.user_name}
                              </span>
                              <span className="text-[10px] text-white/50">User #{acc.user_id}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  value={editFirstName}
                                  onChange={(e) => setEditFirstName(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white focus:outline-none focus:border-[#E5C378]"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  value={editLastName}
                                  onChange={(e) => setEditLastName(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white focus:outline-none focus:border-[#E5C378]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div>
                                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                                  Position / Department
                                </label>
                                <select
                                  value={editPosition}
                                  onChange={(e) => setEditPosition(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white focus:outline-none focus:border-[#E5C378]"
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

                              <div>
                                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                                  Role Authority
                                </label>
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value as 'staff' | 'admin')}
                                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white focus:outline-none focus:border-[#E5C378]"
                                >
                                  <option value="staff">Staff</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                                  Contact Number
                                </label>
                                <input
                                  type="text"
                                  value={editContact}
                                  onChange={(e) => setEditContact(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white focus:outline-none focus:border-[#E5C378]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                                Reset Password (leave blank to keep current)
                              </label>
                              <input
                                type="password"
                                placeholder="Enter new password if changing"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E5C378]"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-4 py-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white/70 hover:text-white text-xs font-semibold uppercase transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={updating}
                                onClick={() => handleSaveEdit(acc.user_id)}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Create Account Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                      Desk operations, room status, bookings check-in &amp; concierge.
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
                      Full executive control, account provisioning, revenue &amp; database sync.
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
        </div>
      </div>
    </div>
  );
}
