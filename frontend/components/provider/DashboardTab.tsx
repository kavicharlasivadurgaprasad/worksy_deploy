'use client';

import React from 'react';
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  Navigation,
  Phone,
  MessageSquare,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { ProviderJob, ProviderReviewItem } from '@/lib/provider-data';
import { ProviderMainTab } from './ProviderSidebar';

interface DashboardTabProps {
  jobs: ProviderJob[];
  reviews: ProviderReviewItem[];
  onAcceptLead: (jobId: string) => void;
  onDeclineLead: (jobId: string) => void;
  onSelectJob: (job: ProviderJob) => void;
  onStartNavigation: (job: ProviderJob) => void;
  setActiveTab: (tab: ProviderMainTab) => void;
}

export default function DashboardTab({
  jobs,
  reviews,
  onAcceptLead,
  onDeclineLead,
  onSelectJob,
  onStartNavigation,
  setActiveTab
}: DashboardTabProps) {
  // Compute KPI numbers
  const newRequests = jobs.filter((j) => j.status === 'New Requests');
  const todayUpcoming = jobs.filter((j) => j.status === 'Upcoming' || j.status === 'Ongoing');
  const completedJobs = jobs.filter((j) => j.status === 'Completed');

  // This month's revenue, computed from real completed booking dates/amounts.
  const now = new Date();
  const thisMonthCompleted = completedJobs.filter((j) => {
    if (!j.dateISO) return false;
    const d = new Date(`${j.dateISO}T00:00:00`);
    return !Number.isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const thisMonthRevenue = thisMonthCompleted.reduce((sum, j) => sum + (j.finalAmount ?? j.estimatedEarnings ?? 0), 0);

  // Rating summary, computed from real reviews loaded via GET /reviews/provider/{id}.
  const reviewCount = reviews.length;
  const avgRating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
  const positivePct = reviewCount ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviewCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Top Banner / Question */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
              Operations Center
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tightest text-stone-900 leading-tight">
              What do you need to do <span className="italic font-normal">today?</span>
            </h2>
            <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
              You have <strong className="text-stone-900">{todayUpcoming.length} scheduled jobs</strong> and{' '}
              <strong className="text-amber-700">{newRequests.length} pending lead requests</strong> requiring your immediate attention.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('jobs')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm"
            >
              <span>View All Jobs</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: New Requests */}
        <div
          onClick={() => setActiveTab('jobs')}
          className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>New Requests</span>
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
              ⚡
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl sm:text-5xl font-medium tracking-tightest text-stone-900">
              {newRequests.length}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              +3 today
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Customer inquiries waiting for accept/decline response.
          </p>
        </div>

        {/* Card 2: Today's Jobs */}
        <div
          onClick={() => setActiveTab('jobs')}
          className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:shadow-xl hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Today&apos;s Jobs</span>
            <span className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-sm">
              📋
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl sm:text-5xl font-medium tracking-tightest text-stone-900">
              {todayUpcoming.length + 2}
            </span>
            <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
              2 completed
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            {todayUpcoming.length} appointments remaining for today.
          </p>
        </div>

        {/* Card 3: This Month Earnings */}
        <div
          onClick={() => setActiveTab('earnings')}
          className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:shadow-xl hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>This Month</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              ₹
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-medium tracking-tightest text-emerald-900">
              ₹{thisMonthRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            {thisMonthCompleted.length
              ? `Total gross volume across ${thisMonthCompleted.length} successful ${thisMonthCompleted.length === 1 ? 'service' : 'services'} this month.`
              : 'No completed services this month yet.'}
          </p>
        </div>

        {/* Card 4: Rating */}
        <div
          onClick={() => setActiveTab('reviews')}
          className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Customer Rating</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              ⭐
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl sm:text-5xl font-medium tracking-tightest text-stone-900">
              {reviewCount ? avgRating.toFixed(2) : '—'}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            {reviewCount ? `${positivePct}% of reviewers rated 4 stars or higher.` : 'No reviews yet.'}
          </p>
        </div>
      </div>

      {/* Main 2-Column Section: Today's Schedule & New Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Today's Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
                Today&apos;s <span className="italic font-normal">Schedule</span>
              </h3>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {todayUpcoming.length} appointments
            </span>
          </div>

          <div className="space-y-4">
            {todayUpcoming.map((job) => (
              <div
                key={job.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex flex-col items-center justify-center font-bold shrink-0">
                    <Clock size={16} />
                    <span className="text-[10px] uppercase mt-0.5">{job.timeSlot.split(' - ')[0]}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-medium text-stone-900 text-lg tracking-tight truncate">
                        {job.serviceTitle}
                      </h4>
                      {job.status === 'Ongoing' && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-stone-600 mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-stone-800">{job.customerName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-stone-500">
                        <MapPin size={12} className="text-rose-500" />
                        <span>{job.distanceKm} km away</span>
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-1 italic">
                      &quot;{job.customerNotes}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onSelectJob(job)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors"
                  >
                    View Job
                  </button>
                  <button
                    onClick={() => onStartNavigation(job)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800 transition-colors shadow-sm"
                  >
                    <Navigation size={13} />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            ))}

            {todayUpcoming.length === 0 && (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-sm">
                No more upcoming jobs scheduled for today. Great work!
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: New Service Requests (Leads) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
                New <span className="italic font-normal">Requests</span>
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {newRequests.length} pending
            </span>
          </div>

          <div className="space-y-4">
            {newRequests.map((lead) => (
              <div
                key={lead.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-amber-200/90 shadow-sm flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase font-bold text-amber-800 tracking-wider">
                        {lead.category}
                      </div>
                      <h4 className="font-display font-medium text-stone-900 text-lg tracking-tight mt-0.5">
                        {lead.serviceTitle}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-stone-400 uppercase font-bold">Est. Earnings</div>
                      <div className="text-lg font-display font-semibold text-emerald-800">
                        ₹{lead.estimatedEarnings}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-stone-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-800">Customer: {lead.customerName}</span>
                      <span>•</span>
                      <span>{lead.date} • {lead.timeSlot.split(' - ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-500">
                      <MapPin size={12} className="text-rose-500 shrink-0" />
                      <span className="truncate">{lead.distanceKm} km • {lead.address}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-stone-700 leading-relaxed italic">
                    &quot;{lead.customerNotes}&quot;
                  </div>
                </div>

                {/* Actions: Decline / Accept */}
                <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => onDeclineLead(lead.id)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-stone-600 transition-colors text-center"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onAcceptLead(lead.id)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center shadow-sm"
                  >
                    Accept Job
                  </button>
                </div>
              </div>
            ))}

            {newRequests.length === 0 && (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 text-sm">
                No new lead requests right now. Ensure your status is set to Online to receive jobs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
