'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  Edit3,
  Camera,
  Plus,
  Wrench,
  Check,
  Sparkles
} from 'lucide-react';
import { MARKETPLACE_SKILLS, DEFAULT_PROVIDER_SKILLS } from '@/lib/provider-data';
import { useAuth } from '@/lib/auth-context';

interface ProfileTabProps {
  providerSkills?: string[];
  onUpdateSkills?: (skills: string[]) => void;
}

export default function ProfileTab({
  providerSkills = DEFAULT_PROVIDER_SKILLS,
  onUpdateSkills
}: ProfileTabProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Edits are local only: the backend has no update-profile endpoint yet (see AUDIT_REPORT.md)
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [bio, setBio] = useState('');

  const activeSkills = providerSkills;

  const handleToggleSkill = (skill: string) => {
    if (!onUpdateSkills) return;
    if (activeSkills.includes(skill)) {
      if (activeSkills.length === 1) {
        alert('You must keep at least one active skill to receive job requests.');
        return;
      }
      onUpdateSkills(activeSkills.filter((s) => s !== skill));
    } else {
      onUpdateSkills([...activeSkills, skill]);
    }
  };

  const services = [
    { title: 'AC Comprehensive Deep Cleaning', category: 'AC Care', price: 499, duration: '45 mins' },
    { title: 'Switchboard & Fan Installation', category: 'Electrical', price: 199, duration: '30 mins' },
    { title: 'AC Gas Charging & Leak Diagnosis', category: 'AC Care', price: 1400, duration: '60 mins' },
    { title: 'Main Distribution MCB Tripping Fix', category: 'Electrical', price: 399, duration: '40 mins' },
    { title: 'Inverter Emergency Wiring Fix', category: 'Electrical', price: 450, duration: '45 mins' }
  ];

  const serviceAreas = ['Indiranagar', 'Koramangala', 'Domlur', 'HAL 2nd Stage', 'Ulsoor', 'HSR Layout'];

  const certifications = [
    { title: 'Master Electrician License (Grade A)', issuer: 'Karnataka Electrical Inspectorate', year: '2018' },
    { title: 'HVAC & Inverter AC Specialist Certification', issuer: 'Daikin & BlueStar Technical Training', year: '2020' },
    { title: 'Worksy Verified Top Partner Guarantee', issuer: 'Worksy Quality & Safety Council', year: '2024' }
  ];

  const portfolio = [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400'
  ];

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-xs">
        {/* Cover Image */}
        <div className="relative h-48 sm:h-56 w-full bg-stone-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200"
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-900 shadow">
            Worksy Partner Since 2024
          </div>
        </div>

        {/* Profile Card Info - Cleanly placed with zero overlap on the cover image */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative z-10 bg-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-6">
              {/* Avatar neatly overlapping banner border */}
              <div className="relative -mt-16 sm:-mt-20 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
                  alt={user?.name || "Profile"}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white ring-1 ring-stone-200/80"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-emerald-600 text-white rounded-full p-1.5 border-2 border-white shadow">
                  <ShieldCheck size={16} />
                </span>
              </div>

              {/* Provider Name and Business Details */}
              <div className="pt-2 sm:pt-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900">
                    {user?.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                    <ShieldCheck size={13} />
                    <span>Worksy Verified Pro</span>
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-stone-700 mt-1">
                  {businessName} • <span className="text-stone-500 font-normal">Licensed Electrical &amp; HVAC Pro</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-stone-600 mt-2.5 font-medium">
                  <span className="flex items-center gap-1 font-bold text-stone-900">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    <span>4.86</span>
                    <span className="text-stone-400 font-normal">(1,284 reviews)</span>
                  </span>
                  <span>•</span>
                  <span>2,400+ jobs completed</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-rose-500">
                    <MapPin size={13} />
                    <span>Indiranagar, Bengaluru</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs sm:text-sm font-bold text-stone-800 transition-colors self-start md:self-end mt-2 md:mt-0 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Skills Management, About & Services */}
        <div className="lg:col-span-7 space-y-6">
          {/* Provided Skills Card (Key requirement: provider only gets jobs matching skills) */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                  <Wrench size={18} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium text-stone-900">
                    Provided <span className="italic font-normal">Skills &amp; Job Dispatch</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    You will only receive customer jobs and leads matching the skills selected below
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                {activeSkills.length} Active {activeSkills.length === 1 ? 'Skill' : 'Skills'}
              </span>
            </div>

            <div className="pt-2">
              <div className="flex flex-wrap gap-2.5">
                {MARKETPLACE_SKILLS.map((skill) => {
                  const isSelected = activeSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/10'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center text-stone-400">
                          <Plus size={11} />
                        </span>
                      )}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                <Sparkles size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Active Lead Matching: </span>
                  <span>
                    Your job pipeline currently displays work orders for{' '}
                    <span className="font-bold underline">{activeSkills.join(', ')}</span>. Jobs from other
                    categories are automatically filtered out.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About Bio */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="font-display text-xl font-medium text-stone-900">
              About <span className="italic font-normal">the Business</span>
            </h3>
            {isEditing ? (
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 text-sm text-stone-800 focus:outline-none focus:border-black"
              />
            ) : (
              <p className="text-sm text-stone-600 leading-relaxed font-medium">
                {bio}
              </p>
            )}
          </div>

          {/* Services & Pricing List */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-medium text-stone-900">
                  Services <span className="italic font-normal">&amp; Standard Pricing</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Rates displayed to customers searching in your radius</p>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {services.map((srv, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <div className="font-bold text-stone-900">{srv.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                        {srv.category}
                      </span>
                      <span className="text-[11px] text-stone-400">Estimated: {srv.duration}</span>
                    </div>
                  </div>
                  <div className="font-display font-semibold text-emerald-800 text-base">
                    ₹{srv.price} onwards
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Photos */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-display text-xl font-medium text-stone-900">
              Work <span className="italic font-normal">Portfolio</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {portfolio.map((img, idx) => (
                <div key={idx} className="h-28 sm:h-36 rounded-2xl overflow-hidden bg-stone-100">
                  <img src={img} alt="Work" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Service Areas & Certifications */}
        <div className="lg:col-span-5 space-y-6">
          {/* Service Area Coverage */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-display text-lg sm:text-xl font-medium text-stone-900">
              Service <span className="italic font-normal">Coverage Areas</span>
            </h3>
            <p className="text-xs text-stone-500">You will receive lead dispatches within these neighborhoods</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {serviceAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 font-semibold text-xs border border-stone-200"
                >
                  📍 {area}
                </span>
              ))}
            </div>
          </div>

          {/* Licenses & Verified Credentials */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-display text-lg sm:text-xl font-medium text-stone-900">
              Licenses <span className="italic font-normal">&amp; Credentials</span>
            </h3>

            <div className="space-y-3">
              {certifications.map((cert, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{cert.title}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{cert.issuer} • Issued {cert.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
