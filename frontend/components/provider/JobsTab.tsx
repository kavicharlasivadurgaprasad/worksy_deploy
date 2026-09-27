'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Navigation,
  FileText,
  DollarSign,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { ProviderJob, JobStatus } from '@/lib/provider-data';

interface JobsTabProps {
  jobs: ProviderJob[];
  activeSubTab: JobStatus;
  setActiveSubTab: (tab: JobStatus) => void;
  onAcceptLead: (jobId: string) => void;
  onDeclineLead: (jobId: string) => void;
  onSelectJob: (job: ProviderJob) => void;
  onStartNavigation: (job: ProviderJob) => void;
  onOpenCompleteModal: (job: ProviderJob) => void;
  providerSkills?: string[];
  onGoToProfile?: () => void;
}

export default function JobsTab({
  jobs,
  activeSubTab,
  setActiveSubTab,
  onAcceptLead,
  onDeclineLead,
  onSelectJob,
  onStartNavigation,
  onOpenCompleteModal,
  providerSkills,
  onGoToProfile
}: JobsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const subTabs: { id: JobStatus; label: string }[] = [
    { id: 'New Requests', label: 'New Requests' },
    { id: 'Upcoming', label: 'Upcoming' },
    { id: 'Ongoing', label: 'Ongoing' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Cancelled', label: 'Cancelled' }
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = job.status === activeSubTab;
    const matchesSearch =
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Title & Subtabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
            Work Orders Management
          </p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900 leading-tight">
            Job <span className="italic font-normal">Pipeline</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
            Manage your leads, active doorstep bookings, and service completion reports.
          </p>
        </div>

        {/* Subtabs Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-100 border border-stone-200/80 overflow-x-auto no-scrollbar self-start sm:self-auto">
          {subTabs.map((tab) => {
            const count = jobs.filter((j) => j.status === tab.id).length;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-stone-600 hover:text-black hover:bg-stone-200/60'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-black' : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills Dispatch Banner */}
      {providerSkills && providerSkills.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Dispatched Skills:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {providerSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900 text-white text-xs font-semibold"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
            <span className="text-xs text-stone-400 hidden lg:inline">• Only jobs matching these skills are shown</span>
          </div>
          {onGoToProfile && (
            <button
              type="button"
              onClick={onGoToProfile}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              Manage Provided Skills in Profile →
            </button>
          )}
        </div>
      )}


      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeSubTab.toLowerCase()} by customer, service, address...`}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black shadow-xs"
        />
      </div>

      {/* Jobs Grid / List */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/90 max-w-xl mx-auto shadow-xs">
          <div className="text-4xl mb-3">📂</div>
          <h3 className="font-display text-xl font-medium text-stone-900">No {activeSubTab} found</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
            {searchQuery
              ? 'Try modifying your search term.'
              : `You currently have no jobs in the ${activeSubTab} stage.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 hover:shadow-xl transition-all flex flex-col justify-between group relative"
            >
              <div>
                {/* Header: ID, Date, Earnings */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                      #{job.id}
                    </span>
                    <span className="ml-2 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      {job.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      {job.status === 'Completed' ? 'Total Earned' : 'Est. Earnings'}
                    </span>
                    <span className="font-display font-semibold text-emerald-800 text-xl">
                      ₹{job.finalAmount || job.estimatedEarnings}
                    </span>
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="font-display font-medium text-stone-900 text-xl tracking-tight mt-3">
                  {job.serviceTitle}
                </h3>

                {/* Customer Details */}
                <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <img
                    src={job.customerAvatar}
                    alt={job.customerName}
                    className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-stone-900 truncate">
                      {job.customerName}
                    </div>
                    <div className="text-xs text-stone-500 truncate">{job.customerPhone}</div>
                  </div>
                  {job.otp && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Start OTP</span>
                      <span className="font-mono text-xs font-extrabold text-stone-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        {job.otp}
                      </span>
                    </div>
                  )}
                </div>

                {/* Schedule & Location */}
                <div className="mt-4 space-y-2 text-xs sm:text-sm text-stone-600">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-stone-400 shrink-0" />
                    <span>
                      {job.date} • {job.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {job.distanceKm} km away • {job.address}
                    </span>
                  </div>
                </div>

                {/* Customer Notes */}
                {job.customerNotes && (
                  <div className="mt-4 p-3 rounded-2xl bg-stone-50/80 text-xs text-stone-600 italic leading-relaxed">
                    &quot;{job.customerNotes}&quot;
                  </div>
                )}

                {/* Parts Used (if completed) */}
                {job.partsUsed && job.partsUsed.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
                    <span className="font-bold text-stone-800">Parts Billed: </span>
                    {job.partsUsed.map((p) => `${p.name} (₹${p.price})`).join(', ')}
                  </div>
                )}
              </div>

              {/* Action Buttons based on job status */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
                {activeSubTab === 'New Requests' && (
                  <>
                    <button
                      onClick={() => onDeclineLead(job.id)}
                      className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors text-center"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => onAcceptLead(job.id)}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all text-center shadow-sm"
                    >
                      Accept Job
                    </button>
                  </>
                )}

                {activeSubTab === 'Upcoming' && (
                  <>
                    <button
                      onClick={() => onSelectJob(job)}
                      className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors text-center"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onStartNavigation(job)}
                      className="flex-1 py-3 px-4 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-all text-center shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Navigation size={13} />
                      <span>Start Navigation</span>
                    </button>
                  </>
                )}

                {activeSubTab === 'Ongoing' && (
                  <>
                    <button
                      onClick={() => onStartNavigation(job)}
                      className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors text-center flex items-center justify-center gap-1.5"
                    >
                      <Navigation size={13} />
                      <span>GPS Route</span>
                    </button>
                    <button
                      onClick={() => onOpenCompleteModal(job)}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-all text-center shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Complete Service</span>
                    </button>
                  </>
                )}

                {activeSubTab === 'Completed' && (
                  <button
                    onClick={() => onSelectJob(job)}
                    className="w-full py-3 px-4 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors text-center"
                  >
                    View Job Report &amp; Invoice
                  </button>
                )}

                {activeSubTab === 'Cancelled' && (
                  <button
                    onClick={() => onSelectJob(job)}
                    className="w-full py-3 px-4 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-500 hover:bg-stone-50 transition-colors text-center"
                  >
                    Cancellation Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
