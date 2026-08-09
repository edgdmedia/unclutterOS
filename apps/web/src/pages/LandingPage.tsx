import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppWindow, Check, ChevronLeft, ChevronRight, CreditCard, Play, Video } from 'lucide-react';

// ── Content ────────────────────────────────────────────────────────────────────

const HERO_ROWS = [
  { time: '09:00', name: 'Adaeze O. — Individual', tag: 'PAID' },
  { time: '11:00', name: 'Tunde A. — Follow-up', tag: 'PAID' },
  { time: '14:00', name: 'Chidinma E. — Intake', tag: 'NEW' },
  { time: '16:00', name: 'Group session — CBT', tag: '4 SEATS' },
];

const PHONE_DAYS = [
  { label: 'M 8', sel: false },
  { label: 'T 9', sel: false },
  { label: 'W 10', sel: true },
  { label: 'T 11', sel: false },
  { label: 'F 12', sel: false },
  { label: 'S 13', sel: false },
  { label: 'M 15', sel: false },
  { label: 'T 16', sel: false },
];

interface PanelRow {
  title: string;
  meta: string;
  pill: string;
  tone: 'gold' | 'navy' | 'muted';
}

interface Tab {
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  panelLabel: string;
  rows: PanelRow[];
}

const TABS: Tab[] = [
  {
    label: 'Client Scheduling & Availability',
    eyebrow: 'SCHEDULING',
    title: 'Availability you set once, bookings that fill themselves.',
    body: 'Publish recurring weekly availability, buffer times and session lengths. Clients pick a slot on your own domain, pay through Paystack, and the session lands in your calendar with reminders already queued.',
    bullets: [
      'Recurring rules & blackout dates',
      'Automatic WhatsApp + email reminders',
      'Reschedule and cancellation policies',
    ],
    panelLabel: 'MONDAY 14 SEPTEMBER',
    rows: [
      { title: '09:00 — Adaeze O.', meta: 'Individual · 50 min', pill: 'PAID', tone: 'gold' },
      { title: '11:00 — Tunde A.', meta: 'Follow-up · 50 min', pill: 'PAID', tone: 'gold' },
      { title: '13:00 — Blocked', meta: 'Lunch', pill: 'HOLD', tone: 'muted' },
      { title: '14:00 — Chidinma E.', meta: 'Intake · 80 min', pill: 'NEW', tone: 'navy' },
      { title: '16:00 — Open slot', meta: 'Bookable', pill: 'FREE', tone: 'muted' },
    ],
  },
  {
    label: 'Universal Intake & PHQ-9',
    eyebrow: 'ASSESSMENTS',
    title: 'Build intake forms and scored assessments without code.',
    body: 'Drag fields into a universal intake, attach validated instruments like PHQ-9 or GAD-7, and let the platform score and trend them across sessions. Results attach to the client record automatically.',
    bullets: [
      'Conditional logic & required consent',
      'Auto-scored PHQ-9, GAD-7, DASS-21',
      'Score trends plotted in the client file',
    ],
    panelLabel: 'INTAKE BUILDER — PHQ-9',
    rows: [
      { title: 'Little interest or pleasure', meta: 'Score 0–3', pill: '2', tone: 'navy' },
      { title: 'Feeling down or hopeless', meta: 'Score 0–3', pill: '3', tone: 'navy' },
      { title: 'Trouble sleeping', meta: 'Score 0–3', pill: '1', tone: 'muted' },
      { title: 'Consent to teletherapy', meta: 'Required checkbox', pill: 'REQ', tone: 'gold' },
      { title: 'Total severity', meta: 'Moderate depression', pill: '14', tone: 'gold' },
    ],
  },
  {
    label: 'Group Practice RBAC',
    eyebrow: 'TEAMS',
    title: 'Run a clinic with the right access for every role.',
    body: 'Add therapists, receptionists and supervisors with scoped permissions. Front desk books and bills; clinicians own their notes; the clinic owner sees revenue across every practitioner.',
    bullets: [
      'Per-role permission matrix',
      'Clinical notes locked to the treating therapist',
      'Clinic-wide revenue and utilisation reports',
    ],
    panelLabel: 'STAFF ROSTER — 6 MEMBERS',
    rows: [
      { title: 'Dr. Jane Smith', meta: 'Clinical Psychologist', pill: 'OWNER', tone: 'gold' },
      { title: 'Dr. Emeka N.', meta: 'Psychotherapist', pill: 'THERAPIST', tone: 'navy' },
      { title: 'Amara U.', meta: 'Front desk', pill: 'RECEPTION', tone: 'muted' },
      { title: 'Dr. Bola A.', meta: 'Supervisor', pill: 'SUPERVISOR', tone: 'navy' },
      { title: 'Ifeoma K.', meta: 'Billing', pill: 'FINANCE', tone: 'muted' },
    ],
  },
];

const TONES: Record<PanelRow['tone'], { bg: string; border: string; title: string; pillBg: string; pillFg: string }> = {
  gold: { bg: 'rgba(227,179,65,0.1)', border: 'rgba(227,179,65,0.28)', title: '#F8FAFC', pillBg: '#E3B341', pillFg: '#0F172A' },
  navy: { bg: 'rgba(27,83,117,0.28)', border: 'rgba(27,83,117,0.5)', title: '#E2E8F0', pillBg: 'rgba(255,255,255,0.14)', pillFg: '#CBD5E1' },
  muted: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', title: '#94A3B8', pillBg: 'rgba(255,255,255,0.08)', pillFg: '#94A3B8' },
};

const QUOTES = [
  {
    quote:
      'UnclutterOS allowed me to launch my private practice in 10 minutes. My clients book directly on my custom domain and payments land in my account instantly.',
    author: 'Dr. Jane Smith',
    role: 'Clinical Psychologist, Lagos',
    initials: 'JS',
  },
  {
    quote:
      'We moved a five-therapist clinic off spreadsheets in a weekend. Role permissions mean my front desk books without ever seeing a clinical note.',
    author: 'Dr. Emeka Nwosu',
    role: 'Clinic Director, Abuja',
    initials: 'EN',
  },
  {
    quote:
      "Session notes finish themselves while I'm still in the call, and PHQ-9 scores trend automatically. I get an hour of my evening back.",
    author: 'Adaeze Okafor',
    role: 'Psychotherapist, Port Harcourt',
    initials: 'AO',
  },
];

interface Plan {
  name: string;
  price: string;
  cta: string;
  blurb: string;
  features: string[];
  dark: boolean;
  popular: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'STARTER',
    price: '₦0',
    cta: 'Start free',
    blurb: 'For a solo practitioner testing the waters.',
    features: ['1 practitioner', '20 bookings per month', 'Basic Jitsi telehealth', 'unclutterOS badge on portal', 'Email support'],
    dark: false,
    popular: false,
  },
  {
    name: 'PRO SOLO',
    price: '₦25,000',
    cta: 'Start 14-day trial',
    blurb: 'For an established private practice ready to own its brand.',
    features: ['Unlimited sessions', 'Custom domain (CNAME)', '1 receptionist login', 'Daily.co cloud recording', '0% payout fee'],
    dark: true,
    popular: true,
  },
  {
    name: 'GROUP CLINIC',
    price: '₦75,000',
    cta: 'Talk to sales',
    blurb: 'For multi-therapist clinics that need oversight.',
    features: ['Up to 25 therapists', 'Multi-role RBAC', 'Clinic-wide revenue analytics', 'Priority support', 'Dedicated onboarding'],
    dark: false,
    popular: false,
  },
];

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'White-Labeling', href: '#white-labeling' },
  { label: 'Telehealth', href: '#telehealth' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

const TRUST_BADGES = ['NPA Registered', 'NDPR Compliant', 'Paystack Verified', '256-bit Encryption'];

// ── Shared bits ────────────────────────────────────────────────────────────────

function OsLogo({ pillCls, wordCls }: { pillCls?: string; wordCls?: string }) {
  return (
    <a href="#top" className="flex items-center gap-[10px] no-underline">
      <span
        className={`h-[30px] inline-flex items-center px-[11px] rounded-full bg-[#E3B341] text-[#0F172A] text-[13px] font-black tracking-[0.04em] ${pillCls ?? ''}`}
      >
        OS
      </span>
      <span className={`text-[#F8FAFC] text-[19px] font-semibold tracking-[-0.02em] ${wordCls ?? ''}`}>
        unclutter<span className="font-extrabold">OS</span>
      </span>
    </a>
  );
}

const scrollCls = 'scroll-mt-[88px]';

// ── Nav ────────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header
      className="sticky top-0 z-50 h-[80px] bg-[rgba(15,23,42,0.9)] backdrop-blur-[18px] border-b border-[rgba(255,255,255,0.07)]"
    >
      <div className="max-w-[1280px] mx-auto h-[80px] px-6 lg:px-10 flex items-center gap-10">
        <OsLogo />
        <nav className="hidden lg:flex items-center gap-[30px] ml-3">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[#CBD5E1] text-[14px] font-medium hover:text-[#E3B341] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/login"
            className="h-[42px] inline-flex items-center px-[18px] rounded-[14px] bg-transparent border border-[rgba(255,255,255,0.16)] text-[#E2E8F0] text-[14px] font-semibold hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="h-[42px] inline-flex items-center px-5 rounded-[14px] bg-[#E3B341] text-[#0F172A] text-[14px] font-bold shadow-[0_8px_24px_rgba(227,179,65,0.28)] hover:bg-[#F0C558] transition-colors"
          >
            Start 14-Day Free Trial
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="top" className="bg-[#0F172A] relative overflow-hidden">
      <div
        aria-hidden
        className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[1100px] h-[520px] bg-[radial-gradient(ellipse_at_center,rgba(27,83,117,0.55),rgba(15,23,42,0)_68%)] pointer-events-none"
      />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 pt-[84px] grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-14 lg:gap-14 items-center">
        <div className="flex flex-col items-start gap-[22px]">
          <div className="inline-flex items-center gap-[9px] px-[14px] py-[7px] rounded-full bg-[rgba(227,179,65,0.1)] border border-[rgba(227,179,65,0.28)]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#E3B341]" />
            <span className="text-[10px] font-black tracking-[0.18em] text-[#E3B341]">
              PRACTICE MANAGEMENT &amp; TELEHEALTH FOR THERAPISTS IN NIGERIA
            </span>
          </div>
          <h1 className="text-[34px] lg:text-[42px] leading-[1.12] font-bold tracking-[-0.035em] text-[#F8FAFC] [text-wrap:balance]">
            Your Own Branded Therapy Practice. <span className="text-[#E3B341]">Zero Platform Fees.</span>
          </h1>
          <p className="text-[16px] leading-[1.65] text-[#94A3B8] max-w-[490px] [text-wrap:pretty]">
            Give your clients a 100% white-label booking experience under your own brand and domain. Manage schedule,
            clinical SOAP notes, and HD telehealth sessions — with direct Paystack bank payouts.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/register"
              className="h-[52px] inline-flex items-center px-[26px] rounded-[16px] bg-[#0F3A53] border border-[#E3B341] text-[#E3B341] text-[15px] font-bold shadow-[0_14px_34px_rgba(15,58,83,0.5)] hover:bg-[#1B5375] transition-colors"
            >
              Start Free 14-Day Trial
            </Link>
            <a
              href="#features"
              className="h-[52px] inline-flex items-center gap-[10px] px-[22px] rounded-[16px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.14)] text-[#E2E8F0] text-[15px] font-semibold hover:bg-[rgba(255,255,255,0.12)] transition-colors"
            >
              <span className="w-[22px] h-[22px] rounded-full bg-[#E3B341] text-[#0F172A] inline-flex items-center justify-center">
                <Play className="h-[9px] w-[9px] fill-current" strokeWidth={2} />
              </span>
              Watch 2-Min Demo
            </a>
          </div>
          <div className="flex items-center gap-[18px] pt-[10px] text-[12.5px] text-[#64748B]">
            <span>No card required</span>
            <span aria-hidden className="opacity-40">
              •
            </span>
            <span>NDPR compliant</span>
            <span aria-hidden className="opacity-40">
              •
            </span>
            <span>Paystack verified</span>
          </div>
        </div>

        {/* hero graphic */}
        <div className="relative h-[520px] max-w-[720px]">
          {/* Browser mock */}
          <div className="absolute top-6 left-0 w-[720px] rounded-[20px] overflow-hidden bg-[#F8FAFC] shadow-[0_40px_90px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)]">
            <div className="h-[38px] bg-[#0F172A] flex items-center gap-2 px-[14px] border-b border-[rgba(255,255,255,0.08)]">
              <span className="w-[9px] h-[9px] rounded-full bg-[#EF4444]" />
              <span className="w-[9px] h-[9px] rounded-full bg-[#E3B341]" />
              <span className="w-[9px] h-[9px] rounded-full bg-[#22C55E]" />
              <div className="ml-3 h-[22px] flex-1 max-w-[290px] rounded-full bg-[rgba(255,255,255,0.08)] flex items-center px-3 text-[10.5px] text-[#94A3B8]">
                app.drjanesmith.ng/dashboard
              </div>
            </div>
            <div className="flex h-[420px]">
              <div className="w-[150px] bg-[#0F172A] py-4 px-2.5 flex flex-col gap-[5px]">
                <div className="flex items-center gap-[7px] px-1.5 pb-4">
                  <span className="h-[20px] inline-flex items-center px-[7px] rounded-full bg-[#E3B341] text-[#0F172A] text-[9px] font-black">
                    OS
                  </span>
                  <span className="text-[#E2E8F0] text-[11.5px] font-semibold">Practice</span>
                </div>
                <div className="h-8 rounded-[10px] bg-[linear-gradient(90deg,rgba(15,58,83,0.95),rgba(27,83,117,0.45))] shadow-[inset_0_0_0_1px_rgba(227,179,65,0.3)] flex items-center px-[10px] text-white text-[11px] font-semibold">
                  Dashboard
                </div>
                {['Calendar', 'Clients', 'Notes', 'Payouts'].map((item) => (
                  <div key={item} className="h-8 flex items-center px-[10px] text-[#94A3B8] text-[11px]">
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-[18px] flex flex-col gap-[14px]">
                <div className="flex items-baseline gap-[10px]">
                  <span className="text-[16px] font-bold tracking-[-0.02em]">Good morning, Dr. Jane</span>
                  <span className="text-[11px] text-[#64748B]">6 sessions today</span>
                </div>
                <div className="grid grid-cols-3 gap-[10px]">
                  {[
                    { label: 'THIS WEEK', value: '₦412,000' },
                    { label: 'SESSIONS', value: '18' },
                    { label: 'NEW INTAKES', value: '5' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white border border-[rgba(15,23,42,0.06)] rounded-[16px] p-3"
                    >
                      <div className="text-[8.5px] font-black tracking-[0.16em] text-[#94A3B8]">{s.label}</div>
                      <div className="text-[22px] font-light tracking-[-0.02em] pt-1">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-white border border-[rgba(15,23,42,0.06)] rounded-[20px] p-[14px] flex flex-col gap-[9px]">
                  <div className="text-[8.5px] font-black tracking-[0.16em] text-[#94A3B8]">TODAY'S SCHEDULE</div>
                  {HERO_ROWS.map((r) => (
                    <div
                      key={r.time}
                      className="flex items-center gap-[10px] px-[10px] py-2 rounded-[12px] bg-[#F8FAFC]"
                    >
                      <span className="w-[3px] h-[22px] rounded-[9px] bg-[#0F3A53]" />
                      <span className="text-[11px] font-bold w-[52px] text-[#0F172A]">{r.time}</span>
                      <span className="text-[11px] text-[#334155] flex-1">{r.name}</span>
                      <span className="text-[9px] font-extrabold tracking-[0.1em] px-2 py-[3px] rounded-full bg-[rgba(227,179,65,0.16)] text-[#8A6A16]">
                        {r.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Phone mock */}
          <div className="absolute right-[-6px] bottom-[-52px] w-[214px] rounded-[32px] bg-[#0F172A] p-[9px] shadow-[0_40px_80px_rgba(0,0,0,0.55)] border border-[rgba(255,255,255,0.12)]">
            <div className="rounded-[25px] overflow-hidden bg-[#FDFCF8] h-[400px] flex flex-col">
              <div className="h-9 bg-[#0F3A53] flex items-center justify-center text-white text-[11px] font-bold tracking-[-0.01em]">
                Dr. Jane Smith
              </div>
              <div className="p-[14px] flex flex-col gap-[10px] flex-1">
                <div className="text-[8.5px] font-black tracking-[0.2em] text-[#94A3B8]">BOOK A SESSION</div>
                <div className="text-[15px] font-bold tracking-[-0.02em] leading-[1.25]">
                  Choose a time that
                  <br />
                  works for you.
                </div>
                <div className="grid grid-cols-4 gap-[5px] pt-[2px]">
                  {PHONE_DAYS.map((d) => (
                    <div
                      key={d.label}
                      className={`h-[34px] rounded-[10px] flex flex-col items-center justify-center text-[9px] font-bold ${
                        d.sel ? 'bg-[#0F3A53] text-white' : 'bg-[rgba(15,23,42,0.05)] text-[#334155]'
                      }`}
                    >
                      {d.label}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  {['09:00 — 09:50', '11:00 — 11:50', '14:00 — 14:50'].map((slot, i) => (
                    <div
                      key={slot}
                      className={`h-8 rounded-[11px] flex items-center px-[11px] text-[10.5px] ${
                        i === 1 ? 'bg-[#0F3A53] text-white font-semibold' : 'border border-[rgba(15,23,42,0.1)] text-[#334155]'
                      }`}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
                <div className="mt-auto h-10 rounded-[14px] bg-[#E3B341] text-[#0F172A] flex items-center justify-center text-[12px] font-extrabold">
                  Pay ₦25,000 &amp; Confirm
                </div>
                <div className="text-center text-[8px] text-[#94A3B8] tracking-[0.04em]">Secured by Paystack</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[120px]" />
    </section>
  );
}

// ── Value cards ────────────────────────────────────────────────────────────────

const VALUE_CARDS = [
  {
    id: 'white-labeling',
    tileBg: 'rgba(227,179,65,0.16)',
    iconCls: 'text-[#8A6A16]',
    Icon: AppWindow,
    title: '100% White-Label Portal',
    body: 'Your brand, your domain. Clients never see unclutterOS.',
  },
  {
    id: 'telehealth',
    tileBg: 'rgba(15,58,83,0.1)',
    iconCls: 'text-[#0F3A53]',
    Icon: Video,
    title: 'HD Telehealth & Live SOAP Notes',
    body: 'End-to-end encrypted WebRTC rooms with side-by-side SOAP note autosaving and PHQ-9 scoring.',
  },
  {
    id: 'payouts',
    tileBg: 'rgba(34,197,94,0.13)',
    iconCls: 'text-[#15803D]',
    Icon: CreditCard,
    title: 'Direct Paystack Bank Payouts',
    body: '0% platform commission on client booking payouts. Money goes straight to your GTBank/Access account.',
  },
];

function ValueCards() {
  return (
    <section id="features" className="bg-[#F8FAFC] px-6 lg:px-10 pt-24 pb-10">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {VALUE_CARDS.map((c) => (
          <div
            key={c.title}
            id={c.id === 'payouts' ? undefined : c.id}
            className="bg-white border border-[rgba(15,23,42,0.06)] rounded-3xl p-8 flex flex-col gap-[14px] shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.1)]"
          >
            <div
              className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center"
              style={{ background: c.tileBg }}
            >
              <c.Icon className={`w-6 h-6 ${c.iconCls}`} strokeWidth={2} />
            </div>
            <div className="text-[19px] font-bold tracking-[-0.02em]">{c.title}</div>
            <p className="text-[14.5px] leading-[1.6] text-[#64748B] [text-wrap:pretty]">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Feature showcase ───────────────────────────────────────────────────────────

function FeatureShowcase() {
  const [tab, setTab] = useState(0);
  const active = TABS[tab];

  const select = (i: number) => setTab(i);

  return (
    <section className="bg-[#F8FAFC] px-6 lg:px-10 pt-[72px] pb-24">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-7 items-center">
        <div className="os-eyebrow text-[10px] tracking-[0.22em] text-[#94A3B8]">EVERYTHING THE PRACTICE RUNS ON</div>
        <h2 className="text-[28px] lg:text-[34px] font-bold tracking-[-0.035em] text-center">
          One workspace, from first enquiry to final note.
        </h2>

        <div
          role="tablist"
          aria-label="Product features"
          className="flex gap-2 p-1.5 rounded-[20px] bg-white border border-[rgba(15,23,42,0.06)] shadow-[0_10px_28px_rgba(15,23,42,0.05)] max-w-full overflow-x-auto"
        >
          {TABS.map((t, i) => (
            <button
              key={t.label}
              role="tab"
              aria-selected={i === tab}
              aria-controls={`tab-panel-${i}`}
              id={`tab-${i}`}
              onClick={() => select(i)}
              className={`h-[44px] whitespace-nowrap px-5 rounded-[15px] text-[13.5px] font-semibold transition-colors cursor-pointer ${
                i === tab ? 'bg-[#0F172A] text-white' : 'bg-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`tab-panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="w-full bg-white border border-[rgba(15,23,42,0.06)] rounded-[32px] p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 lg:gap-12 items-center min-h-[400px] shadow-[0_20px_60px_rgba(15,23,42,0.07)]"
        >
          <div className="flex flex-col gap-4 items-start">
            <div className="text-[10px] font-black tracking-[0.2em] text-[#E3B341]">{active.eyebrow}</div>
            <div className="text-[24px] lg:text-[26px] font-bold tracking-[-0.03em] leading-[1.2]">{active.title}</div>
            <p className="text-[15px] leading-[1.65] text-[#64748B] [text-wrap:pretty]">{active.body}</p>
            <div className="flex flex-col gap-[10px] pt-1.5">
              {active.bullets.map((b) => (
                <div key={b} className="flex items-center gap-[10px]">
                  <span className="w-[18px] h-[18px] rounded-full bg-[rgba(15,58,83,0.1)] text-[#0F3A53] inline-flex items-center justify-center flex-none">
                    <Check className="h-[10px] w-[10px]" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] text-[#334155]">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-3xl p-[22px] min-h-[320px] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E3B341]" />
              <span className="text-[10px] font-black tracking-[0.18em] text-[#94A3B8]">{active.panelLabel}</span>
            </div>
            <div className="flex-1 flex flex-col gap-[9px]">
              {active.rows.map((r) => {
                const t = TONES[r.tone];
                return (
                  <div
                    key={r.title}
                    className="flex items-center gap-3 px-4 py-[13px] rounded-[16px] border"
                    style={{ background: t.bg, borderColor: t.border }}
                  >
                    <span className="text-[13px] font-semibold flex-1" style={{ color: t.title }}>
                      {r.title}
                    </span>
                    <span className="text-[11.5px] text-[#94A3B8]">{r.meta}</span>
                    <span
                      className="text-[9px] font-extrabold tracking-[0.1em] px-[9px] py-1 rounded-full"
                      style={{ background: t.pillBg, color: t.pillFg }}
                    >
                      {r.pill}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────────

function Pricing() {
  const [plan, setPlan] = useState(1);

  return (
    <section id="pricing" className={`${scrollCls} bg-white border-y border-[rgba(15,23,42,0.06)] px-6 lg:px-10 py-24`}>
      <div className="max-w-[1280px] mx-auto flex flex-col gap-[14px] items-center">
        <div className="os-eyebrow text-[10px] tracking-[0.22em] text-[#94A3B8]">PRICING</div>
        <h2 className="text-[28px] lg:text-[34px] font-bold tracking-[-0.035em] text-center">
          Simple, transparent pricing. No hidden fees.
        </h2>
        <p className="text-[15px] text-[#64748B] text-center mb-[26px]">
          Every plan keeps 0% of your session revenue. Cancel any time.
        </p>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" role="radiogroup" aria-label="Plans">
          {PLANS.map((p, i) => {
            const sel = i === plan;
            return (
              <label
                key={p.name}
                className={`rounded-3xl p-[34px_30px] flex flex-col gap-[18px] cursor-pointer border transition-[transform,box-shadow] duration-200 ease-out ${
                  p.dark
                    ? 'bg-[#0F172A] border-[#E3B341] lg:-translate-y-[14px] shadow-[0_30px_70px_rgba(15,23,42,0.28),0_0_0_4px_rgba(227,179,65,0.16)]'
                    : sel
                      ? 'bg-white border-[rgba(15,58,83,0.35)] lg:-translate-y-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.12)]'
                      : 'bg-white border-[rgba(15,23,42,0.08)] shadow-[0_10px_30px_rgba(15,23,42,0.05)]'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  className="sr-only"
                  checked={sel}
                  onChange={() => setPlan(i)}
                  value={p.name}
                />
                <div className="flex items-center gap-[10px] min-h-6">
                  <span
                    className={`text-[10px] font-black tracking-[0.2em] ${p.dark ? 'text-[#E3B341]' : 'text-[#94A3B8]'}`}
                  >
                    {p.name}
                  </span>
                  {p.popular && (
                    <span className="text-[9px] font-black tracking-[0.12em] px-[10px] py-1 rounded-full bg-[#E3B341] text-[#0F172A]">
                      MOST POPULAR
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-[40px] font-light tracking-[-0.04em] ${p.dark ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}
                  >
                    {p.price}
                  </span>
                  <span className={`text-[14px] ${p.dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>/month</span>
                </div>
                <p
                  className={`text-[14px] leading-[1.55] min-h-[44px] [text-wrap:pretty] ${
                    p.dark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  {p.blurb}
                </p>
                <button
                  type="button"
                  className={`h-12 rounded-[16px] text-[14.5px] font-bold border transition-colors cursor-pointer ${
                    p.dark
                      ? 'bg-[#E3B341] text-[#0F172A] border-[#E3B341] hover:bg-[#F0C558]'
                      : sel
                        ? 'bg-[#0F3A53] text-white border-[#0F3A53] hover:bg-[#1B5375]'
                        : 'bg-white text-[#0F172A] border-[rgba(15,23,42,0.14)] hover:bg-[#F1F5F9]'
                  }`}
                  onClick={() => setPlan(i)}
                >
                  {p.cta}
                </button>
                <div
                  className={`flex flex-col gap-[11px] pt-1.5 border-t ${
                    p.dark ? 'border-[rgba(255,255,255,0.1)]' : 'border-[rgba(15,23,42,0.07)]'
                  }`}
                >
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-[10px]">
                      <span
                        className={`w-[17px] h-[17px] mt-[2px] flex-none rounded-full text-[9.5px] inline-flex items-center justify-center ${
                          p.dark ? 'bg-[rgba(227,179,65,0.18)] text-[#E3B341]' : 'bg-[rgba(15,58,83,0.1)] text-[#0F3A53]'
                        }`}
                      >
                        <Check className="h-[8px] w-[8px]" strokeWidth={3.5} />
                      </span>
                      <span className={`text-[13.5px] leading-[1.45] ${p.dark ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </label>
            );
          })}
        </div>
        <div className="text-[12.5px] text-[#94A3B8] pt-5 text-center">
          All prices in Nigerian Naira. Paystack handles billing; payouts settle to your bank in 24 hours.
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────────

function Testimonials() {
  const [quote, setQuote] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = window.setInterval(() => setQuote((s) => (s + 1) % QUOTES.length), 7000);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [paused]);

  const go = (i: number) => {
    if (timer.current !== null) window.clearInterval(timer.current);
    setQuote((i + QUOTES.length) % QUOTES.length);
    timer.current = window.setInterval(() => setQuote((s) => (s + 1) % QUOTES.length), 7000);
  };

  const q = QUOTES[quote];

  return (
    <section id="testimonials" className={`${scrollCls} bg-[#F8FAFC] px-6 lg:px-10 py-24`}>
      <div className="max-w-[1000px] mx-auto flex flex-col items-center gap-8">
        <div className="os-eyebrow text-[10px] tracking-[0.22em] text-[#94A3B8]">TRUSTED BY NIGERIAN PRACTITIONERS</div>

        <div
          aria-live="polite"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="w-full bg-white border border-[rgba(15,23,42,0.06)] rounded-[32px] p-8 lg:p-[48px_56px] shadow-[0_20px_60px_rgba(15,23,42,0.06)] flex flex-col gap-[26px] min-h-[250px]"
        >
          <div aria-hidden className="text-[34px] leading-none text-[#E3B341] font-bold">
            “
          </div>
          <p className="text-[18px] lg:text-[22px] leading-[1.55] font-medium tracking-[-0.02em] text-[#0F172A] [text-wrap:pretty]">
            {q.quote}
          </p>
          <div className="flex items-center gap-[14px] mt-auto">
            <div className="w-[46px] h-[46px] rounded-full bg-[#0F3A53] text-[#E3B341] text-[14px] font-bold flex items-center justify-center">
              {q.initials}
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[14.5px] font-bold">{q.author}</span>
              <span className="text-[12.5px] text-[#64748B]">{q.role}</span>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                aria-label="Previous testimonial"
                onClick={() => go(quote - 1)}
                className="w-10 h-10 rounded-full border border-[rgba(15,23,42,0.1)] bg-white text-[#0F172A] inline-flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
              </button>
              <button
                aria-label="Next testimonial"
                onClick={() => go(quote + 1)}
                className="w-10 h-10 rounded-full border border-[rgba(15,23,42,0.1)] bg-white text-[#0F172A] inline-flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-[7px]" role="tablist" aria-label="Testimonials">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === quote}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => go(i)}
              className={`h-[7px] rounded-full p-0 cursor-pointer transition-all ${
                i === quote ? 'w-[26px] bg-[#E3B341]' : 'w-[7px] bg-[rgba(15,23,42,0.15)]'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-10 pt-4 opacity-[0.55]">
          {TRUST_BADGES.map((b) => (
            <span key={b} className="text-[13px] font-bold tracking-[-0.01em] text-[#475569]">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──────────────────────────────────────────────────────────────────

function FinalCta() {
  return (
    <section className="px-6 lg:px-10 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto rounded-[32px] bg-[linear-gradient(120deg,#0F3A53,#1B5375)] p-10 lg:p-[72px_56px] flex flex-col lg:flex-row items-center gap-10 shadow-[0_30px_70px_rgba(15,58,83,0.28)]">
        <div className="flex flex-col gap-[14px]">
          <h2 className="text-[28px] lg:text-[36px] font-bold tracking-[-0.035em] text-white">
            Ready to scale your therapy practice?
          </h2>
          <p className="text-[16px] text-[rgba(255,255,255,0.68)] max-w-[520px]">
            Launch your branded booking portal today. Free for 14 days, no card required.
          </p>
        </div>
        <Link
          to="/register"
          className="lg:ml-auto flex-none h-14 px-8 rounded-[18px] bg-[#E3B341] text-[#0F172A] text-[16px] font-bold shadow-[0_16px_40px_rgba(227,179,65,0.32)] inline-flex items-center justify-center hover:bg-[#F0C558] transition-colors"
        >
          Create Your Practice Now
        </Link>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#0F172A] px-6 lg:px-10 pt-14 pb-10">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-9">
        <OsLogo pillCls="h-[28px] px-[10px] text-[12px]" wordCls="text-[17px]" />
        <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
          {['Terms', 'Privacy (NDPR Compliance)', 'Contact', 'Support'].map((l) => (
            <a key={l} href="#top" className="text-[13.5px] text-[#94A3B8] hover:text-[#E3B341] transition-colors">
              {l}
            </a>
          ))}
          <span className="lg:ml-auto text-[13px] text-[#475569]">Copyright 2026 UnclutterOS Inc.</span>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Nav />
      <Hero />
      <ValueCards />
      <FeatureShowcase />
      <Pricing />
      <Testimonials />
      <FinalCta />
      <Footer />
    </div>
  );
}
