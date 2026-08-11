import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Copy, ArrowRight, ArrowLeft, Loader2, Sparkles, Building2, Calendar, ShieldCheck, ExternalLink, Palette, Image, Mail, Phone, MapPin, Info, Globe } from 'lucide-react';
import { UnclutterLockup } from '@unclutteros/ui';
import { useAuth } from '../context/AuthContext';
import { api, getBookingUrl } from '../utils/apiClient';

type SignupState = {
  practiceName?: string;
  fullName?: string;
  email?: string;
  persona?: 'therapist' | 'practice';
  alsoTherapist?: boolean;
};

type StepKey = 'brand' | 'availability' | 'practice' | 'link';

const DAY_LABELS = [
  { short: 'M', full: 'Mon' },
  { short: 'T', full: 'Tue' },
  { short: 'W', full: 'Wed' },
  { short: 'T', full: 'Thu' },
  { short: 'F', full: 'Fri' },
  { short: 'S', full: 'Sat' },
  { short: 'S', full: 'Sun' },
];

const CANCELLATION_OPTIONS = [12, 24, 48, 72];

const BRAND_PALETTES = [
  { name: 'Navy & Gold', primary: '#0F3A53', secondary: '#E3B341' },
  { name: 'Emerald Health', primary: '#15803D', secondary: '#F59E0B' },
  { name: 'Teal Balance', primary: '#0E7490', secondary: '#E3B341' },
  { name: 'Royal Violet', primary: '#7C3AED', secondary: '#EC4899' },
  { name: 'Signal Indigo', primary: '#1E1B4B', secondary: '#3B82F6' },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function nairaToKobo(value: string) {
  const clean = value.replace(/[^0-9]/g, '');
  return Number(clean || 0) * 100;
}

export function OnboardingWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile: authUser } = useAuth();
  const signupState = (location.state || {}) as SignupState;

  const persona = signupState.persona || 'therapist';
  const alsoTherapist = signupState.alsoTherapist || false;
  const isTherapist = persona === 'therapist' || alsoTherapist;
  const isPractice = persona === 'practice';

  const steps = useMemo<Array<{ key: StepKey; label: string; desc: string }>>(() => {
    const list: Array<{ key: StepKey; label: string; desc: string }> = [
      { key: 'brand', label: 'Practice Identity', desc: 'Brand colors, logo & handle' },
    ];
    if (isTherapist) {
      list.push({ key: 'availability', label: 'Availability & Rates', desc: 'Working hours & pricing' });
    }
    if (isPractice) {
      list.push({ key: 'practice', label: 'Clinic Details', desc: 'Policies & location' });
    }
    list.push({ key: 'link', label: 'Activation Link', desc: 'Public booking URL' });
    return list;
  }, [isTherapist, isPractice]);

  const [stepIndex, setStepIndex] = useState(0);
  const stepKey = steps[stepIndex].key;

  const initialPracticeName = signupState.practiceName || authUser?.practiceName || '';
  const initialSlug = slugify(initialPracticeName || authUser?.tenantSlug || '') || '';

  const [practiceName, setPracticeName] = useState(initialPracticeName);
  const [slug, setSlug] = useState(initialSlug);
  const [customDomain, setCustomDomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0F3A53');
  const [secondaryColor, setSecondaryColor] = useState('#E3B341');
  const [logoUrl, setLogoUrl] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [publicEmail, setPublicEmail] = useState(signupState.email || authUser?.email || '');
  const [publicPhone, setPublicPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');

  const [daysOn, setDaysOn] = useState<boolean[]>([true, true, true, true, true, false, false]);
  const [rate, setRate] = useState('35,000');
  const [cancellationHours, setCancellationHours] = useState(24);
  const [copied, setCopied] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookingUrl = useMemo(() => {
    if (customDomain) {
      return customDomain.startsWith('http') ? customDomain : `https://${customDomain}`;
    }
    return getBookingUrl(slug);
  }, [slug, customDomain]);

  useEffect(() => {
    let cancelled = false;
    async function loadExistingBrand() {
      try {
        const brand = await api.get<{
          name?: string;
          slug?: string;
          customDomain?: string;
          primaryColor?: string;
          secondaryColor?: string;
          logoUrl?: string;
          welcomeMessage?: string;
          publicEmail?: string;
          publicPhone?: string;
          city?: string;
          address?: string;
          category?: string;
          cancellationHours?: number;
        }>('/v1/tenant/brand');
        if (cancelled) return;
        if (brand.name) setPracticeName(brand.name);
        if (brand.slug) setSlug(brand.slug);
        if (brand.customDomain) setCustomDomain(brand.customDomain);
        if (brand.primaryColor) setPrimaryColor(brand.primaryColor);
        if (brand.secondaryColor) setSecondaryColor(brand.secondaryColor);
        if (brand.logoUrl) setLogoUrl(brand.logoUrl);
        if (brand.welcomeMessage) setWelcomeMessage(brand.welcomeMessage);
        if (brand.publicEmail) setPublicEmail(brand.publicEmail);
        if (brand.publicPhone) setPublicPhone(brand.publicPhone);
        if (brand.city) setCity(brand.city);
        if (brand.address) setAddress(brand.address);
        if (brand.category) setCategory(brand.category);
        if (brand.cancellationHours) setCancellationHours(brand.cancellationHours);
      } catch {
        // Ignore errors; fallback to initial state
      }
    }
    void loadExistingBrand();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  async function saveBrand(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      await api.patch('/v1/tenant/brand', {
        name: practiceName.trim(),
        slug: slugify(slug),
        customDomain: customDomain.trim() || undefined,
        primaryColor,
        secondaryColor,
        logoUrl: logoUrl.trim() || undefined,
        welcomeMessage: welcomeMessage.trim() || undefined,
        publicEmail: publicEmail.trim() || undefined,
        publicPhone: publicPhone.trim() || undefined,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your practice brand.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveAvailability(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const enabledCount = daysOn.filter(Boolean).length;
      await api.patch('/v1/consult/therapist/availability', {
        days: daysOn.map((enabled, index) => ({
          day: index,
          enabled,
          windows: enabled ? [{ start: '09:00', end: '17:00' }] : [],
        })),
        sessionLengthMinutes: 50,
        gapMinutes: 10,
        cancellationHours,
      });
      if (enabledCount > 0) {
        await api.post('/v1/consult/services', {
          title: 'Individual Therapy',
          description: 'One-on-one session with your therapist.',
          durationMinutes: 50,
          priceKobo: nairaToKobo(rate),
        });
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your availability and rates.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function savePracticeSettings(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      await api.patch('/v1/tenant/brand', {
        cancellationHours,
        publicEmail: publicEmail.trim() || undefined,
        publicPhone: publicPhone.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        category: category.trim() || undefined,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your practice settings.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  const goNext = async () => {
    if (stepKey === 'brand') {
      if (!(await saveBrand())) return;
    } else if (stepKey === 'availability') {
      if (!(await saveAvailability())) return;
    } else if (stepKey === 'practice') {
      if (!(await savePracticeSettings())) return;
    }
    setStepIndex((i) => i + 1);
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const enabledCount = daysOn.filter(Boolean).length;
  const weeklySlots = enabledCount * 8;
  const rateValue = Number(rate.replace(/[^0-9]/g, '') || 0);
  const monthlyEstimate = weeklySlots * rateValue * 4;

  const initials = (practiceName || 'Okonkwo Therapy')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-outfit flex flex-col">
      {/* Top Navigation Header */}
      <header className="w-full h-[76px] bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <UnclutterLockup markSize={28} variant="light" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#64748B] bg-[#F1F5F9] px-3 py-1.5 rounded-full border border-[#E2E8F0]">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <button
            onClick={() => navigate('/portal')}
            className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer px-3 py-1.5"
          >
            Finish later
          </button>
        </div>
      </header>

      {/* Main Centered Content Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[1040px] bg-white rounded-[28px] border border-[#E2E8F0] shadow-[0_24px_64px_rgba(15,23,42,.07)] overflow-hidden flex flex-col min-h-[620px]">
          
          {/* Step Stepper Navigation Bar */}
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-8 py-5">
            <div className="flex items-center justify-between relative max-w-[780px] mx-auto">
              <div className="absolute top-5 left-6 right-6 h-[2.5px] bg-[#E2E8F0] -z-0">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    backgroundColor: secondaryColor,
                    width: steps.length > 1 ? `${(stepIndex / (steps.length - 1)) * 100}%` : '100%',
                  }}
                />
              </div>

              {steps.map((s, idx) => (
                <div key={s.key} className="flex flex-col items-center gap-1.5 relative z-10">
                  <div
                    className={`h-10 w-10 rounded-[14px] font-extrabold text-sm flex items-center justify-center border-2 transition-all shadow-xs ${
                      stepIndex === idx
                        ? 'text-white border-transparent shadow-md scale-105'
                        : stepIndex > idx
                        ? 'text-[#0F172A] border-transparent'
                        : 'bg-white text-[#94A3B8] border-[#E2E8F0]'
                    }`}
                    style={{
                      backgroundColor: stepIndex === idx ? primaryColor : stepIndex > idx ? secondaryColor : '#FFFFFF',
                    }}
                  >
                    {stepIndex > idx ? <Check className="h-5 w-5 stroke-[2.5]" /> : idx + 1}
                  </div>
                  <div className="text-center">
                    <span className={`text-[12px] font-bold block ${stepIndex >= idx ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-medium hidden sm:block">
                      {s.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wizard Step Body */}
          <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
            {stepKey === 'brand' && (
              <div className="grid grid-cols-12 gap-8 items-start flex-1">
                <div className="col-span-12 md:col-span-7 space-y-6">
                  <div>
                    <span className="os-eyebrow block mb-1">STEP 01 OF {steps.length}</span>
                    <h2 className="text-[28px] font-bold tracking-tight text-[#0F172A] leading-tight">
                      Customize your practice brand.
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mt-1">
                      Set up your official brand name, logo, custom color palette, and public contact details.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Practice Name & Handle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#475569] block">
                          {isPractice ? 'Clinic / Practice Name' : 'Practice Name'}
                        </label>
                        <input
                          type="text"
                          value={practiceName}
                          onChange={(e) => setPracticeName(e.target.value)}
                          placeholder="e.g. Okonkwo Therapy Practice"
                          className="w-full h-[48px] px-4 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#475569] block">Category / Specialty</label>
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="e.g. Clinical Psychology"
                          className="w-full h-[48px] px-4 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#475569] block">Subdomain Handle</label>
                      <div className="h-[48px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-3.5 flex items-center gap-1.5 focus-within:bg-white focus-within:border-[#0F3A53] transition-all">
                        <span className="text-xs font-semibold text-[#64748B] shrink-0">https://</span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(slugify(e.target.value))}
                          placeholder="okonkwo-therapy"
                          className="flex-1 bg-transparent text-xs font-bold text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                        />
                        <span className="text-xs font-semibold text-[#64748B] shrink-0">.os.unclutter.com.ng</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          AVAILABLE
                        </span>
                      </div>
                    </div>

                    {/* Brand Colors */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[12px] font-bold text-[#475569] flex items-center justify-between">
                        <span>Brand Color Palette</span>
                        <span className="text-[10.5px] text-[#64748B] font-normal">Select a preset or custom hex</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {BRAND_PALETTES.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setPrimaryColor(p.primary);
                              setSecondaryColor(p.secondary);
                            }}
                            className={`h-10 px-3 rounded-[12px] text-xs font-bold flex items-center gap-2 border cursor-pointer transition-all ${
                              primaryColor === p.primary && secondaryColor === p.secondary
                                ? 'bg-white border-[#0F172A] shadow-xs ring-2 ring-[#0F172A]/20'
                                : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-slate-100'
                            }`}
                          >
                            <span className="h-4 w-4 rounded-full flex overflow-hidden border border-black/10 shrink-0">
                              <span className="w-1/2 h-full" style={{ backgroundColor: p.primary }} />
                              <span className="w-1/2 h-full" style={{ backgroundColor: p.secondary }} />
                            </span>
                            <span className="text-[#0F172A]">{p.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3 py-1.5">
                          <span className="text-[11px] font-bold text-[#475569]">Primary:</span>
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-xs font-mono font-bold text-[#0F172A]">{primaryColor}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3 py-1.5">
                          <span className="text-[11px] font-bold text-[#475569]">Accent:</span>
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-xs font-mono font-bold text-[#0F172A]">{secondaryColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Logo & Custom Domain */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#475569] block">
                          Practice Logo <span className="text-[#94A3B8] font-normal">(image URL)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="h-[46px] w-[46px] rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0">
                            {logoUrl ? (
                              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <Image className="h-5 w-5 text-[#94A3B8]" />
                            )}
                          </div>
                          <input
                            type="url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="flex-1 h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#475569] block">
                          Custom Domain <span className="text-[#94A3B8] font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                          placeholder="booking.okonkwo.ng"
                          className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13.5px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1]"
                        />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#475569] block">Public Support Email</label>
                        <input
                          type="email"
                          value={publicEmail}
                          onChange={(e) => setPublicEmail(e.target.value)}
                          placeholder="hello@okonkwo.ng"
                          className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13.5px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#475569] block">Public Contact Phone</label>
                        <input
                          type="tel"
                          value={publicPhone}
                          onChange={(e) => setPublicPhone(e.target.value)}
                          placeholder="+234 803 123 4567"
                          className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13.5px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1]"
                        />
                      </div>
                    </div>

                    {/* About Practice Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#475569] block">
                        About Practice / Welcome Bio <span className="text-[#94A3B8] font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        placeholder="e.g. Evidence-based individual & couples psychotherapy in Lagos. We help clients navigate stress, burnout, and relationship dynamics."
                        className="w-full p-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13.5px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1] resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-[14px] px-4 py-3">
                      {error}
                    </p>
                  )}
                </div>

                {/* Right Live Interactive Client Booking Header Mockup */}
                <div className="col-span-12 md:col-span-5 p-6 rounded-[24px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-4 sticky top-4">
                  <div className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase flex items-center justify-between">
                    <span>LIVE BRANDING PREVIEW</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="rounded-[22px] overflow-hidden border border-slate-200 bg-white shadow-lg">
                    {/* Header Banner */}
                    <div
                      className="p-5 border-b space-y-3"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}1F, ${secondaryColor}2F)`,
                        borderColor: `${primaryColor}22`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-[52px] w-[52px] rounded-[16px] object-cover border border-white shadow-xs"
                          />
                        ) : (
                          <div
                            className="h-[52px] w-[52px] rounded-[16px] bg-white shadow-xs flex items-center justify-center font-extrabold text-lg border border-slate-100 shrink-0"
                            style={{ color: primaryColor }}
                          >
                            {initials}
                          </div>
                        )}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className="text-[9.5px] font-black tracking-widest uppercase block" style={{ color: primaryColor }}>
                            {practiceName || 'Your Practice'}
                          </span>
                          <h4 className="text-base font-extrabold tracking-tight text-[#0F172A] truncate">
                            Book a session
                          </h4>
                          <span
                            className="h-[18px] px-2 rounded-full text-[9px] font-bold uppercase inline-flex items-center"
                            style={{ backgroundColor: `${secondaryColor}2A`, color: '#8A6512' }}
                          >
                            {category || 'CLINICAL PRACTICE'}
                          </span>
                        </div>
                      </div>

                      {welcomeMessage && (
                        <p className="text-[11px] text-[#475569] font-medium leading-normal line-clamp-2 border-t border-black/5 pt-2">
                          {welcomeMessage}
                        </p>
                      )}
                    </div>

                    {/* Booking Card Content Mock */}
                    <div className="p-4 bg-[#FAF9F5] space-y-2.5">
                      <div className="h-10 bg-white rounded-[12px] border border-slate-200/80 px-3.5 flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                        <span>Individual Therapy</span>
                        <span className="font-bold" style={{ color: primaryColor }}>₦35,000</span>
                      </div>
                      <div className="h-9 rounded-full text-xs font-bold flex items-center justify-center text-white shadow-xs" style={{ backgroundColor: primaryColor }}>
                        Select date &amp; WAT time
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#64748B] font-medium flex items-center gap-1.5 px-1">
                    <Globe className="h-3.5 w-3.5 text-[#94A3B8]" />
                    <span className="truncate">https://{slug || 'handle'}.os.unclutter.com.ng</span>
                  </div>
                </div>
              </div>
            )}

            {stepKey === 'availability' && (
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div>
                  <span className="os-eyebrow block mb-1">STEP 02 OF {steps.length}</span>
                  <h2 className="text-[28px] font-bold tracking-tight text-[#0F172A]">Working hours &amp; pricing</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mt-1">
                    Set your weekly availability schedule and individual session rate.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#475569] block">Working Days</label>
                      <div className="grid grid-cols-7 gap-1.5">
                        {DAY_LABELS.map((d, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setDaysOn((prev) => prev.map((on, idx) => (idx === i ? !on : on)))}
                            className={`h-[48px] rounded-[14px] font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer border ${
                              daysOn[i]
                                ? 'text-white border-transparent shadow-xs'
                                : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] hover:bg-slate-100'
                            }`}
                            style={{
                              backgroundColor: daysOn[i] ? primaryColor : undefined,
                            }}
                          >
                            <span className="text-[10px] uppercase tracking-wider">{d.short}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#475569] block">Rate per 50-min session</label>
                      <div className="h-[50px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-4 flex items-center gap-2 focus-within:bg-white focus-within:border-[#0F3A53] transition-all">
                        <span className="text-sm font-bold text-[#0F172A]">₦</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                          placeholder="35,000"
                          className="w-full bg-transparent text-[15px] font-bold text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[24px] bg-[#F0F7FC] border border-[#0F3A53]/15 space-y-4">
                    <div className="flex items-center gap-2 text-[#0F3A53]">
                      <Sparkles className="h-4 w-4" style={{ color: secondaryColor }} />
                      <span className="text-[10px] font-black tracking-widest uppercase">ESTIMATED CAPACITY</span>
                    </div>
                    <div>
                      <div className="text-[34px] font-extrabold text-[#0F3A53] leading-none">
                        {weeklySlots} slots<span className="text-sm font-semibold text-[#475569] ml-1">/week</span>
                      </div>
                      <p className="text-xs text-[#334155] font-medium leading-relaxed mt-2">
                        At ₦{rateValue.toLocaleString('en-NG')} per session, a half-full schedule generates approx.{' '}
                        <strong className="text-[#0F3A53] font-bold">₦{monthlyEstimate.toLocaleString('en-NG')}</strong> monthly.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-[14px] px-4 py-3">
                    {error}
                  </p>
                )}
              </div>
            )}

            {stepKey === 'practice' && (
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div>
                  <span className="os-eyebrow block mb-1">STEP {steps.findIndex((s) => s.key === 'practice') + 1} OF {steps.length}</span>
                  <h2 className="text-[28px] font-bold tracking-tight text-[#0F172A]">Clinic policies &amp; details</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mt-1">
                    Define cancellation rules and public contact information for your practice.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#475569] block">Cancellation notice window</label>
                      <select
                        value={cancellationHours}
                        onChange={(e) => setCancellationHours(Number(e.target.value))}
                        className="w-full h-[50px] px-4 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-bold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all cursor-pointer"
                      >
                        {CANCELLATION_OPTIONS.map((h) => (
                          <option key={h} value={h}>
                            {h} hours before session
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-[#94A3B8]">Clients can reschedule or cancel free of charge until this limit.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#475569] block">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Lagos"
                        className="w-full h-[50px] px-4 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#475569] block">Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="12 Admiralty Way, Lekki"
                        className="w-full h-[50px] px-4 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-semibold text-[#0F172A] outline-none focus:bg-white focus:border-[#0F3A53] transition-all placeholder:text-[#CBD5E1]"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-[14px] px-4 py-3">
                    {error}
                  </p>
                )}
              </div>
            )}

            {stepKey === 'link' && (
              <div className="space-y-6 text-center max-w-[560px] mx-auto py-4 flex-1 flex flex-col justify-center items-center">
                <div className="w-16 h-16 rounded-[22px] bg-[#FEF3C7] text-[#92400E] flex items-center justify-center border border-[#E3B341]/30 shadow-md">
                  <Sparkles className="h-8 w-8 text-[#8A6512]" />
                </div>

                <div>
                  <span className="os-eyebrow block mb-1">ACTIVATION COMPLETE</span>
                  <h2 className="text-[30px] font-extrabold tracking-tight text-[#0F172A]">Your practice is live.</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mt-1.5">
                    Share your official booking link directly with clients or add it to your website &amp; Instagram bio.
                  </p>
                </div>

                <div className="p-6 rounded-[24px] bg-[#0F172A] text-white w-full space-y-4 shadow-xl border border-slate-800">
                  <span className="text-[10px] font-black tracking-widest text-[#E3B341] uppercase block">YOUR OFFICIAL BOOKING URL</span>
                  <div className="text-[17px] font-semibold font-mono text-amber-100/90 break-all px-2">
                    {bookingUrl}
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={handleCopyLink}
                      className="h-[46px] px-6 rounded-[14px] bg-[#E3B341] text-[#0F172A] font-bold text-xs hover:brightness-105 transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-950 stroke-[3]" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? 'Copied to clipboard!' : 'Copy booking link'}</span>
                    </button>
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-[46px] w-[46px] rounded-[14px] bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Sticky Action Footer Bar */}
            <div className="pt-6 mt-6 flex items-center justify-between border-t border-[#E2E8F0]">
              {stepIndex > 0 && stepKey !== 'link' ? (
                <button
                  onClick={goBack}
                  className="h-[46px] px-5 rounded-[14px] bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {stepKey === 'link' ? (
                <button
                  onClick={() => navigate('/portal')}
                  className="h-[50px] px-8 rounded-[16px] text-white font-bold text-sm shadow-md hover:brightness-110 transition-all cursor-pointer ml-auto flex items-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>Go to therapist dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => void goNext()}
                  disabled={saving}
                  className="os-brand-btn h-[48px] px-7 rounded-[14px] font-bold text-xs flex items-center gap-2 text-white disabled:opacity-60 cursor-pointer shadow-md transition-all ml-auto"
                  style={{ backgroundColor: primaryColor }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
