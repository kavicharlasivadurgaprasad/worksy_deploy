'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  AlertCircle,
  MapPin,
  Lock
} from 'lucide-react';
import { ProviderJob, WorkingHoursDay, initialWorkingHours } from '@/lib/provider-data';

interface CalendarTabProps {
  jobs: ProviderJob[];
  onSelectJob: (job: ProviderJob) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalendarEntry {
  job: ProviderJob;
  /** What this entry means on THIS day. */
  label: string;
}

/** Cancelled bookings are not real jobs, so they never appear on the calendar. */
const isCalendarJob = (j: ProviderJob) => j.status !== 'Cancelled';

const statusLabel = (j: ProviderJob): string => {
  switch (j.status) {
    case 'New Requests': return 'Pending request';
    case 'Upcoming': return 'Confirmed';
    case 'Ongoing': return 'In progress';
    case 'Completed':
      return j.completedDateISO ? 'Completed' : 'Completed (completion date not recorded)';
    default: return j.status;
  }
};

export default function CalendarTab({ jobs, onSelectJob }: CalendarTabProps) {
  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [selectedISO, setSelectedISO] = useState<string>(todayISO);
  const [workingHours, setWorkingHours] = useState<WorkingHoursDay[]>(initialWorkingHours);
  // Local to this page (no backend yet): starts EMPTY, nothing is pre-blocked.
  const [blockedDays, setBlockedDays] = useState<string[]>([]);
  const [hoursSavedSuccess, setHoursSavedSuccess] = useState(false);

  const goMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedISO(todayISO);
  };

  // Calendar entries per ISO day, built only from real bookings:
  //  - every non-cancelled booking appears on its real scheduled date;
  //  - a COMPLETED booking also appears on its real completion day (if that differs from the scheduled
  //    date). A booking with no recorded completion date never gets an invented one.
  const entriesByDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    const add = (iso: string | undefined, entry: CalendarEntry) => {
      if (!iso) return;
      const list = map.get(iso) ?? [];
      list.push(entry);
      map.set(iso, list);
    };
    jobs.filter(isCalendarJob).forEach((job) => {
      add(job.dateISO, { job, label: statusLabel(job) });
      if (job.status === 'Completed' && job.completedDateISO && job.completedDateISO !== job.dateISO) {
        add(job.completedDateISO, { job, label: 'Completed on this day' });
      }
    });
    return map;
  }, [jobs]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthBookingCount = monthDays.reduce(
    (sum, d) => sum + (entriesByDay.get(toISO(viewYear, viewMonth, d))?.length ?? 0),
    0
  );
  const blockedThisMonth = blockedDays.filter((iso) => iso.startsWith(`${viewYear}-${pad(viewMonth + 1)}-`)).length;

  const selectedEntries = entriesByDay.get(selectedISO) ?? [];
  const selectedDate = new Date(`${selectedISO}T00:00:00`);
  const selectedTitle = selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleToggleDay = (index: number) => {
    const updated = [...workingHours];
    updated[index].isOpen = !updated[index].isOpen;
    setWorkingHours(updated);
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', val: string) => {
    const updated = [...workingHours];
    updated[index][field] = val;
    setWorkingHours(updated);
  };

  const handleSaveWorkingHours = () => {
    setHoursSavedSuccess(true);
    setTimeout(() => setHoursSavedSuccess(false), 2500);
  };

  const toggleBlockDay = (iso: string) => {
    setBlockedDays((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]));
  };

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
          Schedule &amp; Availability
        </p>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900 leading-tight">
          Work <span className="italic font-normal">Calendar</span>
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
          Your real bookings on their scheduled dates; completed jobs also show on the day they were completed.
        </p>
      </div>

      {hoursSavedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <Check size={16} />
          <span>Working hours updated on this page. They are not saved to your account yet.</span>
        </div>
      )}

      {/* Main Grid: Calendar on Left, Working Hours & Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Monthly Calendar */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
                {MONTH_NAMES[viewMonth]} <span className="italic font-normal">{viewYear}</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {monthBookingCount} {monthBookingCount === 1 ? 'entry' : 'entries'} this month • {blockedThisMonth} blocked {blockedThisMonth === 1 ? 'day' : 'days'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => goMonth(-1)} aria-label="Previous month" className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700">
                <ChevronLeft size={16} />
              </button>
              <button onClick={goToday} className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-bold text-stone-700">
                Today
              </button>
              <button onClick={() => goMonth(1)} aria-label="Next month" className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700">
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => toggleBlockDay(selectedISO)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                  blockedDays.includes(selectedISO)
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'border-stone-200 hover:bg-stone-100 text-stone-700'
                }`}
              >
                {blockedDays.includes(selectedISO) ? 'Unblock Date' : 'Block Selected Date'}
              </button>
            </div>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 text-center font-bold text-xs uppercase tracking-wider text-stone-400">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div className="text-rose-500">Sun</div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for month start offset */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-16 sm:h-20 rounded-2xl bg-stone-50/50" />
            ))}

            {monthDays.map((day) => {
              const iso = toISO(viewYear, viewMonth, day);
              const isSelected = selectedISO === iso;
              const isBlocked = blockedDays.includes(iso);
              const isToday = iso === todayISO;
              const hasBookings = entriesByDay.get(iso)?.length ?? 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedISO(iso)}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'border-black bg-stone-900 text-white shadow-md'
                      : isBlocked
                      ? 'bg-rose-50/60 border-rose-200 text-stone-400'
                      : isToday
                      ? 'bg-amber-50/70 border-amber-300 text-stone-900 font-bold'
                      : 'bg-white border-stone-200/80 hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-extrabold uppercase bg-amber-400 text-black px-1 rounded">
                        Today
                      </span>
                    )}
                    {isBlocked && (
                      <Lock size={10} className="text-rose-500" />
                    )}
                  </div>

                  {/* Indicator dots */}
                  {hasBookings > 0 && !isBlocked && (
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-emerald-500'}`} />
                      <span className={`text-[10px] font-semibold ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                        {hasBookings} {hasBookings === 1 ? 'job' : 'jobs'}
                      </span>
                    </div>
                  )}

                  {isBlocked && (
                    <span className="text-[9px] text-rose-600 font-semibold truncate">
                      Blocked
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Has bookings / completed jobs</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Today</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Blocked / Off</span>
            </span>
          </div>
        </div>

        {/* Right: Selected Day Inspector & Working Hours */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Date Inspector */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                  Day Schedule
                </span>
                <h3 className="font-display text-xl font-medium tracking-tight text-stone-900">
                  {selectedTitle} {selectedISO === todayISO && '(Today)'}
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <div className="space-y-3">
              {selectedEntries.map(({ job, label }) => (
                <div
                  key={`${job.id}-${label}`}
                  onClick={() => onSelectJob(job)}
                  className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-stone-500">#{job.id}</span>
                    <span className="font-semibold text-emerald-800">₹{job.estimatedEarnings.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide text-stone-600 bg-white border border-stone-200 px-1.5 py-0.5 rounded">{label}</div>
                  <div className="text-sm font-bold text-stone-900 mt-1">{job.serviceTitle}</div>
                  <div className="text-xs text-stone-600 mt-0.5 flex items-center justify-between">
                    <span>{job.customerName}</span>
                    <span>{job.timeSlot}</span>
                  </div>
                </div>
              ))}

              {selectedEntries.length === 0 && (
                <div className="py-6 text-center text-xs text-stone-500">
                  No bookings or completed jobs on this date.
                </div>
              )}
            </div>
          </div>

          {/* Working Hours Panel */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight text-stone-900">
                  Standard <span className="italic font-normal">Working Hours</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Kept on this page only for now: not saved to your account and not enforced when customers book.</p>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {workingHours.map((wh, idx) => (
                <div key={wh.day} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 min-w-[90px]">
                    <input
                      type="checkbox"
                      checked={wh.isOpen}
                      onChange={() => handleToggleDay(idx)}
                      className="w-4 h-4 accent-black rounded cursor-pointer"
                    />
                    <span className={`font-semibold ${wh.isOpen ? 'text-stone-900' : 'text-stone-400 line-through'}`}>
                      {wh.day}
                    </span>
                  </div>

                  {wh.isOpen ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <input
                        type="time"
                        value={wh.openTime}
                        onChange={(e) => handleTimeChange(idx, 'openTime', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 font-semibold text-xs"
                      />
                      <span className="text-stone-400">—</span>
                      <input
                        type="time"
                        value={wh.closeTime}
                        onChange={(e) => handleTimeChange(idx, 'closeTime', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 font-semibold text-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-stone-400">Closed</span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveWorkingHours}
                className="w-full py-2.5 px-4 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm"
              >
                Save Working Hours
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
