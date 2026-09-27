'use client';

import React, { useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Download,
  Inbox
} from 'lucide-react';
import { EarningsSubTab } from './ProviderSidebar';
import { ProviderJob } from '@/lib/provider-data';

interface EarningsTabProps {
  activeSubTab: EarningsSubTab;
  setActiveSubTab: (subTab: EarningsSubTab) => void;
  onOpenWithdrawModal: () => void;
  availableBalance: number;
  /** Real bookings loaded from GET /bookings/provider/{id}. Earnings are derived from completed jobs only. */
  jobs: ProviderJob[];
}

interface LedgerRow {
  jobId: string;
  date: string;
  serviceTitle: string;
  customerName: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
}

const PLATFORM_FEE_RATE = 0.1; // same 10% commission already used to compute availableBalance

const toCsv = (rows: LedgerRow[]) => {
  const header = ['Job', 'Date', 'Service', 'Customer', 'Gross Amount', 'Platform Fee', 'Net Credited'];
  const lines = rows.map((r) => [
    `#${r.jobId}`,
    r.date,
    r.serviceTitle,
    r.customerName,
    r.grossAmount,
    r.platformFee,
    r.netAmount
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  return [header.join(','), ...lines].join('\n');
};

export default function EarningsTab({
  activeSubTab,
  setActiveSubTab,
  onOpenWithdrawModal,
  availableBalance,
  jobs
}: EarningsTabProps) {
  const completedJobs = useMemo(() => jobs.filter((j) => j.status === 'Completed'), [jobs]);
  const jobAmount = (j: ProviderJob) => j.finalAmount ?? j.estimatedEarnings ?? 0;

  const totalRevenue = useMemo(
    () => completedJobs.reduce((sum, j) => sum + jobAmount(j), 0),
    [completedJobs]
  );
  const avgJobValue = completedJobs.length ? Math.round(totalRevenue / completedJobs.length) : 0;
  const categories = useMemo(
    () => Array.from(new Set(completedJobs.map((j) => j.category).filter(Boolean))),
    [completedJobs]
  );

  // Current-month vs previous-month revenue, computed from each job's real booking date.
  const now = new Date();
  const monthKey = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${d.getMonth()}`;
  };
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`;

  const thisMonthRevenue = completedJobs
    .filter((j) => monthKey(j.dateISO) === thisMonthKey)
    .reduce((sum, j) => sum + jobAmount(j), 0);
  const lastMonthRevenue = completedJobs
    .filter((j) => monthKey(j.dateISO) === lastMonthKey)
    .reduce((sum, j) => sum + jobAmount(j), 0);
  const monthChangePct = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
    : null;

  // Last 7 calendar days, bucketed from real booking dates.
  const last7Days = useMemo(() => {
    const days: { iso: string; label: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const amount = completedJobs
        .filter((j) => j.dateISO === iso)
        .reduce((sum, j) => sum + jobAmount(j), 0);
      days.push({ iso, label, amount });
    }
    return days;
  }, [completedJobs]);
  const weekMax = Math.max(1, ...last7Days.map((d) => d.amount));
  const weekTotal = last7Days.reduce((sum, d) => sum + d.amount, 0);
  const peakDay = weekTotal > 0 ? last7Days.reduce((a, b) => (b.amount > a.amount ? b : a)) : null;

  // Transaction ledger derived directly from completed bookings (there is no separate transactions table).
  const transactions: LedgerRow[] = useMemo(() => {
    return completedJobs
      .map((j) => {
        const gross = jobAmount(j);
        const platformFee = Math.round(gross * PLATFORM_FEE_RATE);
        return {
          jobId: j.id,
          date: j.date,
          serviceTitle: j.serviceTitle,
          customerName: j.customerName,
          grossAmount: gross,
          platformFee,
          netAmount: gross - platformFee
        };
      })
      .sort((a, b) => (b.jobId > a.jobId ? 1 : -1));
  }, [completedJobs]);

  const handleDownloadCsv = () => {
    if (transactions.length === 0) return;
    const blob = new Blob([toCsv(transactions)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `earnings-statement-${now.toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
            Financial Health
          </p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900 leading-tight">
            Earnings <span className="italic font-normal">&amp; Payouts</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
            Track gross billings, platform commissions, transactions ledger, and withdraw available balances.
          </p>
        </div>

        {/* Subtabs Switcher */}
        <div className="inline-flex p-1.5 rounded-2xl bg-stone-100 border border-stone-200 self-start sm:self-auto">
          {(['overview', 'transactions', 'withdrawals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all ${
                activeSubTab === tab ? 'bg-black text-white shadow-sm' : 'text-stone-600 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs">
              <div className="text-xs uppercase font-bold tracking-wider text-stone-400">Total Month Revenue</div>
              <div className="mt-2 text-3xl sm:text-4xl font-display font-medium tracking-tight text-stone-900">
                ₹{thisMonthRevenue.toLocaleString('en-IN')}
              </div>
              {monthChangePct !== null ? (
                <div className={`mt-2 text-xs font-semibold flex items-center gap-1 ${monthChangePct >= 0 ? 'text-emerald-700' : 'text-stone-500'}`}>
                  <TrendingUp size={13} />
                  <span>{monthChangePct >= 0 ? '+' : ''}{monthChangePct}% from last month</span>
                </div>
              ) : (
                <div className="mt-2 text-xs font-semibold text-stone-400">No data for last month yet</div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs">
              <div className="text-xs uppercase font-bold tracking-wider text-stone-400">Completed Jobs</div>
              <div className="mt-2 text-3xl sm:text-4xl font-display font-medium tracking-tight text-stone-900">
                {completedJobs.length}
              </div>
              <div className="mt-2 text-xs font-semibold text-stone-500">
                {categories.length ? `Across ${categories.join(' & ')}` : 'No completed jobs yet'}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs">
              <div className="text-xs uppercase font-bold tracking-wider text-stone-400">Average Job Value</div>
              <div className="mt-2 text-3xl sm:text-4xl font-display font-medium tracking-tight text-stone-900">
                ₹{avgJobValue.toLocaleString('en-IN')}
              </div>
              <div className="mt-2 text-xs font-semibold text-stone-500">
                {completedJobs.length ? `Based on ${completedJobs.length} completed ${completedJobs.length === 1 ? 'job' : 'jobs'}` : 'No completed jobs yet'}
              </div>
            </div>

            {/* Available Balance & Payout CTA */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-amber-300">Available to Withdraw</div>
                <div className="mt-1 text-3xl sm:text-4xl font-display font-medium tracking-tight text-white">
                  ₹{availableBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                onClick={onOpenWithdrawModal}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all text-center shadow"
              >
                Withdraw Money →
              </button>
            </div>
          </div>

          {/* Weekly Earnings Chart Representation */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
                  Daily Earnings <span className="italic font-normal">Pulse</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {last7Days[0]?.label} — {last7Days[last7Days.length - 1]?.label}
                </p>
              </div>
              {peakDay && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full self-start sm:self-auto">
                  Peak: ₹{peakDay.amount.toLocaleString('en-IN')} on {peakDay.label}
                </span>
              )}
            </div>

            {weekTotal > 0 ? (
              <>
                {/* Bar chart visualization */}
                <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-8 pb-4 border-b border-stone-100">
                  {last7Days.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                      <div
                        style={{ height: `${Math.max(4, Math.round((item.amount / weekMax) * 100))}%` }}
                        className="w-full max-w-[48px] rounded-t-xl bg-stone-900 group-hover:bg-amber-400 transition-colors shadow-xs"
                      />
                      <span className="text-xs font-bold text-stone-600 mt-1 whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Worksy platform deductions are processed net at 10%.</span>
                  <span>All payouts credited to your linked payout method.</span>
                </div>
              </>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                <Inbox className="text-stone-300" size={32} />
                <p className="text-sm font-semibold text-stone-500">No earnings in the last 7 days.</p>
                <p className="text-xs text-stone-400">Completed jobs from this week will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: TRANSACTIONS */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
                Transaction <span className="italic font-normal">Ledger</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Detailed breakdown of customer payments and platform fees</p>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                <Download size={13} />
                <span>Download CSV</span>
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-2">
              <Inbox className="text-stone-300" size={32} />
              <p className="text-sm font-semibold text-stone-500">No earnings data available yet.</p>
              <p className="text-xs text-stone-400">Completed jobs will show up here as transactions.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                    <th className="pb-3">Reference / Date</th>
                    <th className="pb-3">Service &amp; Customer</th>
                    <th className="pb-3 text-right">Gross Total</th>
                    <th className="pb-3 text-right">Platform Fee (10%)</th>
                    <th className="pb-3 text-right">Net Credited</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {transactions.map((tx) => (
                    <tr key={tx.jobId} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4">
                        <div className="font-mono font-bold text-stone-900">#{tx.jobId}</div>
                        <div className="text-[11px] text-stone-400">{tx.date}</div>
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-stone-900">{tx.serviceTitle}</div>
                        <div className="text-[11px] text-stone-500">{tx.customerName}</div>
                      </td>
                      <td className="py-4 text-right font-mono font-semibold text-stone-900">
                        ₹{tx.grossAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 text-right font-mono text-stone-500">
                        {tx.platformFee > 0 ? `-₹${tx.platformFee.toLocaleString('en-IN')}` : '₹0'}
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-emerald-800">
                        ₹{tx.netAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                          <CheckCircle2 size={11} />
                          <span>Completed</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: WITHDRAWALS */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">Available Balance</span>
              <div className="mt-1 text-4xl sm:text-5xl font-display font-medium tracking-tight text-emerald-900">
                ₹{availableBalance.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-stone-500 mt-1">Ready for transfer to your bank or UPI.</p>
            </div>

            <button
              onClick={onOpenWithdrawModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-md"
            >
              <ArrowUpRight size={16} />
              <span>Withdraw Money Now</span>
            </button>
          </div>

          {/* Linked Bank / Payout Method: no payout-methods backend exists yet */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-display text-xl font-medium text-stone-900">Verified Payout Accounts</h3>

            <div className="py-8 flex flex-col items-center justify-center text-center gap-2 rounded-2xl border border-dashed border-stone-200 bg-stone-50">
              <Building2 className="text-stone-300" size={28} />
              <p className="text-sm font-semibold text-stone-500">No payout method linked yet.</p>
              <p className="text-xs text-stone-400 max-w-sm">
                Add a bank account or UPI ID when withdrawing to receive future payouts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
