'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, LogOut, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'burgundy';
  isLoading?: boolean;
  icon?: React.ReactNode;
  detailsCard?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'burgundy',
  isLoading = false,
  icon,
  detailsCard,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
          defaultIcon: <LogOut className="w-5 h-5 text-rose-600" />,
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
          defaultIcon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        };
      case 'primary':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
          defaultIcon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        };
      case 'burgundy':
      default:
        return {
          iconBg: 'bg-[#5A1C2A] text-[#E5C378] border-[#E5C378]/30',
          confirmBtn: 'bg-[#5A1C2A] hover:bg-[#6D2233] text-[#E5C378] border border-[#E5C378]/30 shadow-md',
          defaultIcon: <LogOut className="w-5 h-5 text-[#E5C378]" />,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#381018] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#5A1C2A]/70 bg-[#240A10]/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${vStyles.iconBg}`}
            >
              {icon || vStyles.defaultIcon}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">{title}</h3>
              <p className="text-[11px] text-[#E5C378]/70">Burgundy Suite & Resort Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-[#240A10] hover:bg-[#2B0E14] text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 border border-[#5A1C2A]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-white/80 leading-relaxed">{description}</div>

          {/* Optional Highlights / Details Card */}
          {detailsCard && (
            <div className="p-4 rounded-2xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white/80">
              {detailsCard}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-[#240A10]/70 border-t border-[#5A1C2A]/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-[#5A1C2A] text-xs font-semibold text-white/70 hover:bg-[#2B0E14] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${vStyles.confirmBtn}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
