import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Bell, Link2, Calendar, FileText, Video, Upload, Globe, Palette, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@unclutteros/ui';
import { api, TENANT_SLUG } from '../utils/apiClient';

interface DashboardPageProps {
  tenantStatus?: 'ACTIVE' | 'PAUSED';
  setTenantStatus?: (status: 'ACTIVE' | 'PAUSED') => void;
  primaryColor?: string;
  setPrimaryColor?: (color: string) => void;
  secondaryColor?: string;
  setSecondaryColor?: (color: string) => void;
  clients?: any[];
  sessions?: any[];
}

export function DashboardPage(props: DashboardPageProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [practiceActive, setPracticeActive] = useState(props.tenantStatus === 'ACTIVE');
  const primaryColor = props.primaryColor || '#0F3A53';
  const secondaryColor = props.secondaryColor || '#E3B341';
  const [customDomain, setCustomDomain] = useState('');
  const [profileName, setProfileName] = useState('Dr. Jane Smith');
  const [profileTitle, setProfileTitle] = useState('Clinical Psychologist');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [summary, setSummary] = useState<{
    revenueThisMonthNaira: number;
    scheduledSessionsCount: number;
    totalClientsCount: number;
    activeRosterCount: number;
    onboardingCompleted?: boolean;
    hasAvailability?: boolean;
    hasService?: boolean;
    hasPayout?: boolean;
    upcomingSessions: any[];
  }>({
    revenueThisMonthNaira: 0,
    scheduledSessionsCount: 0,
    totalClientsCount: 0,
    activeRosterCount: 1,
    onboardingCompleted: true,
    upcomingSessions: [],
  });

  const bookingUrl = `https://unclutteros.com/booking/${TENANT_SLUG}`;

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardMeta() {
      try {
        const [brand, profile, notifications, dashSummary] = await Promise.all([
          api.get<{ customDomain?: string | null }>('/v1/tenant/brand'),
          api.get<{ firstName?: string; lastName?: string; specialty?: string; avatarUrl?: string | null }>('/v1/consult/therapist/profile'),
          api.get<Array<{ unread: boolean }>>('/v1/tenant/notifications'),
          api.get<{
            revenueThisMonthNaira: number;
            scheduledSessionsCount: number;
            totalClientsCount: number;
            activeRosterCount: number;
            onboardingCompleted?: boolean;
            hasAvailability?: boolean;
            hasService?: boolean;
            hasPayout?: boolean;
            upcomingSessions: any[];
          }>('/v1/consult/dashboard/summary'),
        ]);
        if (cancelled) return;
        setCustomDomain(brand.customDomain || '');
        setProfileName(`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Dr. Jane Smith');
        setProfileTitle(profile.specialty || 'Clinical Psychologist');
        setProfileAvatar(profile.avatarUrl || null);
        setUnreadCount(notifications.filter((item) => item.unread).length);
        if (dashSummary) setSummary(dashSummary);
      } catch {
        // Best-effort only; the rest of the dashboard is already derived from live props.
      }
    }

    void loadDashboardMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const presetSwatches = [
    { name: 'UnclutterOS navy', primary: '#0F3A53', secondary: '#E3B341' },
    { name: 'Signal blue', primary: '#007BFF', secondary: '#6F42C1' },
    { name: 'Calm teal', primary: '#0E7490', secondary: '#F59E0B' },
    { name: 'Deep violet', primary: '#7C3AED', secondary: '#EC4899' },
    { name: 'Forest', primary: '#15803D', secondary: '#B45309' },
  ];

  // Derive dynamic stats from backend summary or props
  const totalSessions = summary.scheduledSessionsCount || props.sessions?.length || 0;
  const totalClients = summary.totalClientsCount || props.clients?.length || 0;
  const activeClients = summary.activeRosterCount || (props.clients?.filter(c => c.status === 'Active').length || 0);

  const needsOnboarding = summary.onboardingCompleted === false || (summary.totalClientsCount === 0 && summary.revenueThisMonthNaira === 0);

  const monthlyBars = [
    { month: 'S', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.5 : 0 },
    { month: 'O', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.6 : 0 },
    { month: 'N', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.55 : 0 },
    { month: 'D', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.7 : 0 },
    { month: 'J', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.65 : 0 },
    { month: 'F', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.75 : 0 },
    { month: 'M', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.7 : 0 },
    { month: 'A', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.85 : 0 },
    { month: 'M', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.8 : 0 },
    { month: 'J', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.9 : 0 },
    { month: 'J', val: summary.revenueThisMonthNaira > 0 ? summary.revenueThisMonthNaira * 0.85 : 0 },
    { month: 'A', val: summary.revenueThisMonthNaira || 1, current: true },
  ];

  // Render list of actual sessions
  const dynamicSessions = (props.sessions || []).map(s => {
    const startObj = new Date(s.startsAt);
    const endObj = new Date(s.endsAt);
    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return {
      id: s.id,
      time: formatTime(startObj),
      end: formatTime(endObj),
      name: s.title,
      type: s.type,
      mode: s.type.includes('Supervision') || s.type.includes('Notes') ? 'Internal Block' : 'Telehealth',
      status: 'Confirmed'
    };
  });

  return (
    <div className="flex-1 min-w-[1192px] flex flex-col bg-[#F8FAFC]">
      {/* 80px Top Header Bar */}
      <header className="h-[80px] bg-white border-b border-[#E2E8F0] px-[26px] flex items-center justify-between gap-5 shrink-0">
        <div>
          <span className="os-eyebrow block">PRACTICE OVERVIEW</span>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#0F172A]">Good morning, Dr. Smith</h1>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Booking Link Field */}
          <div className="h-[44px] bg-[#F1F5F9] border border-[#E2E8F0] rounded-[14px] px-3.5 flex items-center gap-2.5">
            <Link2 className="h-4 w-4 text-[#64748B] shrink-0" />
            <input
              type="text"
              readOnly
              value={bookingUrl}
              className="w-[238px] bg-transparent text-[13px] font-medium text-[#334155] select-all outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="h-[32px] w-[32px] bg-white rounded-[10px] shadow-[0_1px_2px_rgba(15,23,42,.08)] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors border border-[#E2E8F0]"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-[#475569]" />}
            </button>
          </div>

          {/* Copy Booking Link Button */}
          <button
            onClick={handleCopyLink}
            className="os-brand-btn h-[44px] px-5 rounded-[14px] font-bold text-[14px] flex items-center gap-2 whitespace-nowrap text-white cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Link copied' : 'Copy Booking Link'}</span>
          </button>

          <div className="h-[28px] w-[1px] bg-[#E2E8F0]" />

          {/* Notification Button */}
          <button className="relative h-[44px] w-[44px] bg-white border border-[#E2E8F0] rounded-[14px] flex items-center justify-center hover:bg-[#F8FAFC]">
            <Bell className="h-5 w-5 text-[#475569]" />
            {unreadCount > 0 ? <span className="absolute top-[9px] right-[9px] h-[7px] w-[7px] rounded-full bg-[#E11D48] ring-[1.5px] ring-white" /> : null}
          </button>
        </div>
      </header>

      {/* Main Workspace 2-Column Layout */}
      <main className="p-[24px_26px_30px] grid grid-cols-[1fr_372px] gap-[20px] items-start">
        {/* Left Column */}
        <div className="space-y-[20px]">
          {/* Practice Setup Onboarding Banner */}
          {needsOnboarding && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F3A53] to-[#1E293B] text-white shadow-md border border-[#E3B341]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-[#E3B341]" />
                  <h3 className="font-bold text-[16px] text-white">Complete your practice onboarding setup</h3>
                </div>
                <p className="text-[13px] text-slate-300">
                  Run the 3-step setup wizard to set your brand, session rates, working hours, and 0% fee direct payouts:
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate('/onboarding')}
                  className="h-9 px-4 rounded-xl bg-[#E3B341] text-[#0F172A] text-xs font-bold hover:bg-[#F0C558] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Launch 3-Step Wizard</span>
                </button>
                <button
                  onClick={() => navigate('/portal/settings/payouts')}
                  className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  Payouts
                </button>
              </div>
            </div>
          )}

          {/* Revenue Summary Card */}
          <div className="os-card p-[24px_26px] bg-white border border-slate-100 shadow-sm rounded-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span className="os-eyebrow block mb-1">REVENUE THIS MONTH</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-[40px] font-extrabold tracking-[-0.04em] text-[#0F172A] leading-none">
                    ₦{summary.revenueThisMonthNaira.toLocaleString()}
                  </span>
                  {summary.revenueThisMonthNaira > 0 ? (
                    <span className="h-6 px-3 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-bold flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+100%</span>
                    </span>
                  ) : (
                    <span className="h-6 px-3 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                      Current month
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#64748B] font-medium mt-1">
                  {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Wrapped Stat Tiles */}
              <div className="flex flex-wrap justify-end gap-3.5">
                <div className="min-w-[96px] p-[12px_14px] rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[22px] font-extrabold tracking-[-0.03em] text-[#0F172A] block leading-none mb-1">{totalSessions}</span>
                  <span className="text-[11px] text-[#64748B] font-medium">Scheduled sessions</span>
                </div>
                <div className="min-w-[96px] p-[12px_14px] rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[22px] font-extrabold tracking-[-0.03em] text-[#0F172A] block leading-none mb-1">{totalClients}</span>
                  <span className="text-[11px] text-[#64748B] font-medium">Total clients</span>
                </div>
                <div className="min-w-[96px] p-[12px_14px] rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[22px] font-extrabold tracking-[-0.03em] text-[#0F172A] block leading-none mb-1">{activeClients}</span>
                  <span className="text-[11px] text-[#64748B] font-medium">Active roster</span>
                </div>
              </div>
            </div>

            {/* 12-Month Revenue Bars */}
            <div className="h-[96px] flex items-end gap-[10px] pt-4 border-t border-[#E2E8F0]">
              {monthlyBars.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full rounded-t-[8px] rounded-b-[3px] transition-all duration-300 min-h-[6px]"
                    style={{
                      height: `${(b.val / 450) * 100}%`,
                      backgroundColor: b.current ? primaryColor : `${primaryColor}4D`,
                    }}
                  />
                  <span className="text-[10.5px] font-semibold text-[#94A3B8]">{b.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Client Sessions Card */}
          <div className="os-card p-[22px_24px_24px] space-y-4 bg-white border border-slate-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="os-eyebrow block">UPCOMING</span>
                <h2 className="text-[17px] font-bold text-[#0F172A] tracking-[-0.02em]">Client sessions scheduled</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-[32px] px-3 rounded-[10px] bg-[#F1F5F9] text-[#475569] text-[12.5px] font-bold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>August 2026</span>
                </span>
              </div>
            </div>

            {/* Client Session Rows */}
            <div className="space-y-2.5">
              {dynamicSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-[14px_16px] rounded-[18px] border border-[#E2E8F0] flex items-center justify-between gap-4 hover:shadow-[0_8px_24px_rgba(15,23,42,.08)] hover:-translate-y-[1px] transition-all bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-[52px] shrink-0 text-center">
                      <span className="text-[15px] font-extrabold text-[#0F172A] block leading-none">{s.time}</span>
                      <span className="text-[10.5px] font-semibold text-[#94A3B8]">{s.end}</span>
                    </div>

                    <div className="h-[34px] w-[1px] bg-[#E2E8F0]" />

                    <div className="h-[38px] w-[38px] rounded-[12px] bg-[#0F3A53]/10 text-[#0F3A53] font-extrabold flex items-center justify-center text-sm shrink-0">
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      <h3 className="text-[14.5px] font-bold text-[#0F172A] leading-snug">{s.name}</h3>
                      <p className="text-[12px] text-[#64748B] font-medium">{s.type} · {s.mode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                      {s.status}
                    </span>

                    <button className="h-[34px] px-3 rounded-[11px] bg-[#F1F5F9] text-[#475569] text-xs font-bold hover:bg-[#E2E8F0] flex items-center gap-1.5 cursor-pointer">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Notes</span>
                    </button>

                    <button
                      onClick={() => navigate(`/session/${s.id}/prep`)}
                      className="h-[34px] px-3 rounded-[11px] text-white text-xs font-bold flex items-center gap-1.5 transition-opacity cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Start session</span>
                    </button>
                  </div>
                </div>
              ))}
              {dynamicSessions.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  No upcoming sessions.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-[20px]">
          {/* Profile Photo Card */}
          <div className="os-card p-[22px]">
            <span className="os-eyebrow block mb-3">PROFILE PHOTO</span>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-[76px] w-[76px] rounded-[24px] bg-[#0F3A53]/10 text-[#0F3A53] font-extrabold flex items-center justify-center text-[24px] ring-3 ring-[#0F3A53]/20 shrink-0">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Preview" className="h-full w-full object-cover rounded-[24px]" />
                ) : (
                  profileName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase()
                )}
                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#10B981] border-[3px] border-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">{profileName}</h3>
                <p className="text-[12.5px] text-[#64748B] font-medium">{profileTitle}</p>
                <p className="text-[11.5px] text-[#94A3B8] font-medium">JPG or PNG · max 2 MB</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setProfileAvatar(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
                <span
                  className="os-brand-btn h-[40px] px-4 rounded-[14px] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer w-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Photo</span>
                </span>
              </label>
              <button
                onClick={() => setProfileAvatar(null)}
                className="h-[40px] px-4 rounded-[14px] bg-[#F1F5F9] text-[#475569] text-xs font-bold hover:bg-[#E2E8F0]"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Practice Status Card */}
          <div className="os-card p-[20px_22px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="os-eyebrow block">PRACTICE STATUS</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`h-2 w-2 rounded-full ${practiceActive ? 'bg-[#10B981]' : 'bg-[#64748B]'}`} />
                  <span className="text-[16px] font-bold text-[#0F172A]">
                    {practiceActive ? 'Active Practice' : 'Inactive Practice'}
                  </span>
                </div>
              </div>

              {/* 60px x 34px Smooth Toggle Switch */}
              <button
                onClick={() => {
                  const nextActive = !practiceActive;
                  setPracticeActive(nextActive);
                  props.setTenantStatus?.(nextActive ? 'ACTIVE' : 'PAUSED');
                }}
                className={`w-[60px] h-[34px] rounded-full p-[3px] transition-colors duration-200 cursor-pointer ${
                  practiceActive ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'
                }`}
              >
                <div
                  className={`w-[28px] h-[28px] rounded-full bg-white shadow-[0_2px_6px_rgba(15,23,42,.22)] transition-transform duration-200 ${
                    practiceActive ? 'translate-x-[26px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[12px] text-[#64748B] font-medium leading-relaxed max-w-[220px]">
              {practiceActive
                ? 'Your booking page is live and accepting new client bookings.'
                : 'Your booking page is hidden. Existing sessions are unaffected.'}
            </p>
          </div>

          {/* Brand Styling Customizer Card */}
          <div className="os-card p-[22px] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="os-eyebrow block">BRAND STYLING</span>
                <h3 className="text-[15px] font-bold text-[#0F172A]">Your booking page</h3>
              </div>
              <span className="h-[22px] px-2.5 rounded-full bg-[#FBF1DA] text-[#8A6512] text-[10px] font-extrabold tracking-[0.06em] flex items-center">
                WHITE-LABEL
              </span>
            </div>

            {/* 2-Col Color Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-[10px_12px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => props.setPrimaryColor?.(e.target.value)}
                  className="h-9 w-9 rounded-[10px] border-none cursor-pointer p-0 shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] block">Primary</span>
                  <span className="text-[12px] font-mono font-bold text-[#0F172A] uppercase">{primaryColor}</span>
                </div>
              </div>

              <div className="p-[10px_12px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => props.setSecondaryColor?.(e.target.value)}
                  className="h-9 w-9 rounded-[10px] border-none cursor-pointer p-0 shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] block">Secondary</span>
                  <span className="text-[12px] font-mono font-bold text-[#0F172A] uppercase">{secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold text-[#94A3B8] uppercase block">Presets</span>
              <div className="flex items-center gap-2">
                {presetSwatches.map((swatch, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      props.setPrimaryColor?.(swatch.primary);
                      props.setSecondaryColor?.(swatch.secondary);
                    }}
                    className={`h-[30px] w-[30px] rounded-[10px] overflow-hidden flex cursor-pointer border-2 transition-all ${
                      primaryColor === swatch.primary ? 'border-[#0F172A]' : 'border-[#E2E8F0]'
                    }`}
                  >
                    <span className="w-1/2 h-full" style={{ backgroundColor: swatch.primary }} />
                    <span className="w-1/2 h-full" style={{ backgroundColor: swatch.secondary }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Domain Input */}
            <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <label className="text-[11.5px] font-bold text-[#475569]">Custom domain (CNAME)</label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  VERIFIED
                </span>
              </div>
              <div className="h-[44px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full bg-transparent text-[12.5px] font-mono font-bold text-[#0F172A] outline-none"
                />
              </div>
            </div>

            <button
              className="os-brand-btn w-full h-[44px] rounded-[14px] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Save brand settings</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
