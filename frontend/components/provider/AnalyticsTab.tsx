'use client';

import React, { useMemo } from 'react';
import { Inbox } from 'lucide-react';
import { ProviderJob } from '@/lib/provider-data';

interface AnalyticsTabProps {
  /** Real bookings loaded from GET /bookings/provider/{id}. */
  jobs: ProviderJob[];
}

export default function AnalyticsTab({ jobs }: AnalyticsTabProps) {
  const jobAmount = (j: ProviderJob) => j.finalAmount ?? j.estimatedEarnings ?? 0;

  const totalBookings = jobs.length;
  const completedJobs = useMemo(() => jobs.filter((j) => j.status === 'Completed'), [jobs]);
  const cancelledJobs = useMemo(() => jobs.filter((j) => j.status === 'Cancelled'), [jobs]);

  const totalRevenue = useMemo(
    () => completedJobs.reduce((sum, j) => sum + jobAmount(j), 0),
    [completedJobs]
  );
  const avgJobValue = completedJobs.length ? Math.round(totalRevenue / completedJobs.length) : 0;
  const fulfillmentRate = totalBookings ? Math.round((completedJobs.length / totalBookings) * 1000) / 10 : 0;
  const cancellationRate = totalBookings ? Math.round((cancelledJobs.length / totalBookings) * 1000) / 10 : 0;

  // Repeat clients: customers with more than one completed job, computed from real booking customer names.
  const { repeatClients, uniqueClients } = useMemo(() => {
    const counts = new Map<string, number>();
    completedJobs.forEach((j) => {
      if (!j.customerName) return;
      counts.set(j.customerName, (counts.get(j.customerName) || 0) + 1);
    });
    const repeat = Array.from(counts.values()).filter((c) => c > 1).length;
    return { repeatClients: repeat, uniqueClients: counts.size };
  }, [completedJobs]);
  const repeatClientPct = uniqueClients ? Math.round((repeatClients / uniqueClients) * 100) : 0;

  const metrics = [
    { label: 'Total Bookings', value: String(totalBookings), change: totalBookings ? `${completedJobs.length} completed so far` : 'No bookings yet', positive: true },
    { label: 'Completed Jobs', value: String(completedJobs.length), change: totalBookings ? `${fulfillmentRate}% fulfillment rate` : 'No bookings yet', positive: true },
    { label: 'Cancellations', value: String(cancelledJobs.length), change: totalBookings ? `${cancellationRate}% cancellation rate` : 'No bookings yet', positive: false },
    { label: 'Overall Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: completedJobs.length ? `From ${completedJobs.length} completed ${completedJobs.length === 1 ? 'job' : 'jobs'}` : 'No completed jobs yet', positive: true },
    { label: 'Avg. Job Value', value: `₹${avgJobValue.toLocaleString('en-IN')}`, change: completedJobs.length ? 'Based on completed jobs' : 'No completed jobs yet', positive: true },
    { label: 'Repeat Clients', value: uniqueClients ? `${repeatClientPct}%` : '—', change: uniqueClients ? `${repeatClients} of ${uniqueClients} customers` : 'No completed jobs yet', positive: true }
  ];

  // Revenue by category, computed from completed jobs only.
  const categoryBreakdown = useMemo(() => {
    const byCategory = new Map<string, { count: number; revenue: number }>();
    completedJobs.forEach((j) => {
      const key = j.category || 'Uncategorized';
      const entry = byCategory.get(key) || { count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += jobAmount(j);
      byCategory.set(key, entry);
    });
    const total = Array.from(byCategory.values()).reduce((sum, v) => sum + v.revenue, 0);
    return Array.from(byCategory.entries())
      .map(([category, v]) => ({
        category,
        count: v.count,
        revenue: v.revenue,
        percentage: total ? Math.round((v.revenue / total) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [completedJobs]);

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
          Business Intelligence
        </p>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900 leading-tight">
          Performance <span className="italic font-normal">Analytics</span>
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
          Comprehensive operational metrics, booking conversion ratios, and category revenue share.
        </p>
      </div>

      {totalBookings === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs py-16 flex flex-col items-center justify-center text-center gap-2">
          <Inbox className="text-stone-300" size={32} />
          <p className="text-sm font-semibold text-stone-500">No performance data available yet.</p>
          <p className="text-xs text-stone-400">Metrics will appear here once you start receiving bookings.</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between"
              >
                <div className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                  {m.label}
                </div>
                <div className="my-2 font-display text-3xl sm:text-4xl font-medium tracking-tight text-stone-900">
                  {m.value}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    m.positive ? 'text-emerald-700' : 'text-stone-500'
                  }`}
                >
                  {m.change}
                </div>
              </div>
            ))}
          </div>

          {/* Category Performance Breakdown */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
                Revenue by <span className="italic font-normal">Service Category</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Completed jobs grouped by service category</p>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
                <Inbox className="text-stone-300" size={28} />
                <p className="text-sm font-semibold text-stone-500">No completed jobs yet.</p>
                <p className="text-xs text-stone-400">Category revenue will appear here after your first completed job.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <span className="text-stone-900">{item.category}</span>
                      <span className="text-emerald-800 font-mono">₹{item.revenue.toLocaleString('en-IN')} ({item.count} {item.count === 1 ? 'job' : 'jobs'})</span>
                    </div>
                    <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className="h-full bg-stone-900 rounded-full transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
