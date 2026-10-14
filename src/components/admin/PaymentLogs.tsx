'use client';

import React from 'react';
import { CreditCard, CheckCircle2, DollarSign, Calendar, Clock } from 'lucide-react';
import { PaymentDetails } from '@/types/database';

interface PaymentLogItem extends PaymentDetails {
  booking_id: number;
  guest_name: string;
  room_number: number;
}

interface PaymentLogsProps {
  payments: PaymentLogItem[];
}

export default function PaymentLogs({ payments }: PaymentLogsProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#E5C378]" />
          <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
            Payment Transaction Logs & Audit Trail
          </h3>
        </div>
        <p className="text-xs text-white/60 mt-1">
          Exact ledger records mapped to PAYMENT_DETAILS with instant reconciliation
        </p>
      </div>

      <div className="rounded-2xl bg-[#381018] border border-[#5A1C2A] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2B0E14] border-b border-[#5A1C2A] text-[#E5C378] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-5">Payment ID</th>
                <th className="py-4 px-5">Booking Ref</th>
                <th className="py-4 px-5">Guest Name</th>
                <th className="py-4 px-5">Room #</th>
                <th className="py-4 px-5">Payment Method</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5A1C2A]/60">
              {payments.map((p) => (
                <tr key={p.payment_id} className="hover:bg-[#4A1521]/40 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-[#E5C378]">
                    #PAY-{p.payment_id}
                  </td>
                  <td className="py-4 px-5 font-mono text-white/80">
                    #BSR-{p.booking_id}
                  </td>
                  <td className="py-4 px-5 font-semibold text-white">
                    {p.guest_name}
                  </td>
                  <td className="py-4 px-5 text-white/90">
                    Room {p.room_number || 'N/A'}
                  </td>
                  <td className="py-4 px-5 text-white/80">
                    {p.payment_method}
                  </td>
                  <td className="py-4 px-5 font-bold text-[#E5C378] text-sm">
                    ₱{Number(p.amount).toFixed(2)}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{p.payment_status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-white/60">
                    {p.payment_date ? new Date(p.payment_date).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
