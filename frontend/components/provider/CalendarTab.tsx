'use client';

import React, { useState } from 'react';
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

export default function CalendarTab({ jobs, onSelectJob }: CalendarTabProps) {
  const [selectedDay, setSelectedDay] = useState<number>(5); // Sept 5th (Today)
  const [workingHours, setWorkingHours] = useState<WorkingHoursDay[]>(initialWorkingHours);
  const [blockedDays, setBlockedDays] = useState<number[]>([14, 15]); // blocked vacation days
  const [hoursSavedSuccess, setHoursSavedSuccess] = useState(false);

  // Month days for Sept 2026 (Starts on Tuesday = day 2, 30 days total)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const startDayOffset = 1; // Sept 1 is Tuesday (0=Mon, 1=Tue)

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

  const toggleBlockDay = (day: number) => {
    if (blockedDays.includes(day)) {
      setBlockedDays(blockedDays.filter((d) => d !== day));
    } else {
      setBlockedDays([...blockedDays, day]);
    }
  };

  // Scheduled jobs on selected day
  const selectedDayJobs = jobs.filter((j) => {
    if (selectedDay === 5) return j.date === 'Today' || j.status === 'Upcoming' || j.status === 'Ongoing';
    if (selectedDay === 6) return j.date === 'Tomorrow';
    return false;
  });

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
          Manage your booking schedule, operational hours, and block out vacation days.
        </p>
      </div>

      {hoursSavedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <Check size={16} />
          <span>Working hours and slot capacity updated successfully!</span>
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
                September <span className="italic font-normal">2026</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">3 active bookings today • 2 blocked days</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBlockDay(selectedDay)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                  blockedDays.includes(selectedDay)
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'border-stone-200 hover:bg-stone-100 text-stone-700'
                }`}
              >
                {blockedDays.includes(selectedDay) ? 'Unblock Date' : 'Block Selected Date'}
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

            {daysInMonth.map((day) => {
              const isSelected = selectedDay === day;
              const isBlocked = blockedDays.includes(day);
              const isToday = day === 5;
              const hasBookings = day === 5 ? 3 : day === 6 ? 1 : day === 8 ? 2 : day === 12 ? 4 : 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
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
              <span>Confirmed Booking</span>
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
                  Sept {selectedDay}, 2026 {selectedDay === 5 && '(Today)'}
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                {selectedDayJobs.length} appointments
              </span>
            </div>

            <div className="space-y-3">
              {selectedDayJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-stone-500">#{job.id}</span>
                    <span className="font-semibold text-emerald-800">₹{job.estimatedEarnings}</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-1">{job.serviceTitle}</div>
                  <div className="text-xs text-stone-600 mt-0.5 flex items-center justify-between">
                    <span>{job.customerName}</span>
                    <span>{job.timeSlot}</span>
                  </div>
                </div>
              ))}

              {selectedDayJobs.length === 0 && (
                <div className="py-6 text-center text-xs text-stone-500">
                  No appointments booked for this date.
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
                <p className="text-xs text-stone-500 mt-0.5">Control when customers can book appointments</p>
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
