import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Copy, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { api, getBookingUrl } from '../utils/apiClient';

type SignupState = {
  practiceName?: string;
  fullName?: string;
  email?: string;
  persona?: 'therapist' | 'practice';
  alsoTherapist?: boolean;
};

type StepKey = 'brand' | 'availability' | 'practice' | 'link';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CANCELLATION_OPTIONS = [12, 24, 48, 72];

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
  const signupState = (location.state || {}) as SignupState;

  const persona = signupState.persona || 'therapist';
  const alsoTherapist = signupState.alsoTherapist || false;
  const isTherapist = persona === 'therapist' || alsoTherapist;
  const isPractice = persona === 'practice';

  const steps = useMemo<Array<{ key: StepKey; label: string }>>(() => {
    const list: Array<{ key: StepKey; label: string }> = [{ key: 'brand', label: 'Practice brand' }];
    if (isTherapist) list.push({ key: 'availability', label: 'Availability & rates' });
    if (isPractice) list.push({ key: 'practice', label: 'Practice settings' });
    list.push({ key: 'link', label: 'Booking link' });
    return list;
  }, [isTherapist, isPractice]);

  const [stepIndex, setStepIndex] = useState(0);
  const stepKey = steps[stepIndex].key;

  const [practiceName, setPracticeName] = useState(signupState.practiceName || '');
  const [slug, setSlug] = useState(slugify(signupState.practiceName || '') || 'my-practice');
  const [daysOn, setDaysOn] = useState<boolean[]>([true, true, true, true, true, false, false]);
  const [rate, setRate] = useState('35,000');
  const [cancellationHours, setCancellationHours] = useState(24);
  const [publicEmail, setPublicEmail] = useState(signupState.email || '');
  const [publicPhone, setPublicPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [copied, setCopied] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryColor = '#0F3A53';
  const bookingUrl = useMemo(() => getBookingUrl(slug), [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  async function saveBrand(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      await api.patch('/v1/tenant/brand', { name: practiceName.trim(), slug: slugify(slug) });
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

  const stepLabels: Record<StepKey, string> = {
    brand: 'Practice brand',
    availability: 'Availability & rates',
    practice: 'Practice settings',
    link: 'Booking link',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-outfit flex flex-col items-center justify-between">
      {/* 76px Header */}
      <header className="w-full h-[76px] bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-[10px] bg-[#0F3A53] text-[#E3B341] font-extrabold flex items-center justify-center text-sm">
            U
          </div>
          <span className="font-bold text-lg tracking-tight text-[#0F172A]">unclutterOS</span>
        </div>

        <span className="text-xs font-bold text-[#64748B]">Step {stepIndex + 1} of {steps.length}</span>

        <button onClick={() => navigate('/portal')} className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]">
          Finish later
        </button>
      </header>

      {/* Step Progress Bar Container */}
      <div className="w-full max-w-[820px] my-6 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-8 right-8 h-[3px] bg-[#EEF2F7] -z-0">
            <div
              className="h-full bg-[#E3B341] transition-all duration-300"
              style={{ width: steps.length > 1 ? `${(stepIndex / (steps.length - 1)) * 100}%` : '100%' }}
            />
          </div>

          {steps.map((s, idx) => (
            <div key={s.key} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`h-10 w-10 rounded-[14px] font-extrabold text-sm flex items-center justify-center border-2 transition-all ${
                  stepIndex === idx
                    ? 'bg-[#0F3A53] text-white border-[#0F3A53]'
                    : stepIndex > idx
                    ? 'bg-[#E3B341] text-[#0F172A] border-[#E3B341]'
                    : 'bg-[#EEF2F7] text-[#94A3B8] border-[#EEF2F7]'
                }`}
              >
                {stepIndex > idx ? <Check className="h-5 w-5" /> : idx + 1}
              </div>
              <span className={`text-xs font-bold ${stepIndex >= idx ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Panel */}
      <main className="w-full max-w-[920px] bg-white rounded-[26px] border border-[#E2E8F0] shadow-[0_14px_40px_rgba(15,23,42,.07)] p-8 my-4 flex-1">
        {stepKey === 'brand' && (
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-7 space-y-5">
              <div>
                <span className="os-eyebrow block mb-1">STEP ONE</span>
                <h2 className="text-[27px] font-bold tracking-tight text-[#0F172A]">Let's make it yours.</h2>
                <p className="text-xs text-[#64748B] font-medium leading-relaxed mt-1">
                  Your clients only ever see your name and colours. unclutterOS stays out of the way.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">
                    {isPractice ? 'Clinic / Practice Name' : 'Practice Name'}
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g. Smith Therapy"
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Booking Link Handle</label>
                  <div className="h-[46px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-3 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-[#94A3B8]">os.unclutter.com.ng/booking/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="your-practice"
                      className="flex-1 bg-transparent text-xs font-bold text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                    />
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      AVAILABLE
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs font-medium text-red-600 bg-red-50 rounded-[12px] px-3.5 py-2.5">{error}</p>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
                <p className="text-[11px] text-[#94A3B8]">You can change all of this later in Brand settings.</p>
                <button
                  onClick={() => void goNext()}
                  disabled={saving}
                  className="os-brand-btn h-[44px] px-6 rounded-[14px] font-bold text-xs flex items-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: primaryColor }}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Continue</span>}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Live Mini Preview */}
            <div className="col-span-5 p-5 rounded-[22px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="p-4 rounded-[18px] text-white space-y-2" style={{ backgroundColor: primaryColor }}>
                <span className="text-[9px] font-black tracking-widest text-[#E3B341] uppercase">BOOK A SESSION</span>
                <h4 className="text-sm font-extrabold">{practiceName || 'Your Practice'}</h4>
              </div>
              <div className="space-y-2">
                <div className="h-10 bg-white rounded-[12px] border border-[#E2E8F0]" />
                <div className="h-10 bg-white rounded-[12px] border border-[#E2E8F0]" />
              </div>
            </div>
          </div>
        )}

        {stepKey === 'availability' && (
          <div className="space-y-6">
            <div>
              <span className="os-eyebrow block mb-1">STEP TWO</span>
              <h2 className="text-[27px] font-bold tracking-tight text-[#0F172A]">Availability & rates</h2>
              <p className="text-xs text-[#64748B] font-medium mt-1">Set your working days and session pricing.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Working Days</label>
                  <div className="flex items-center gap-2">
                    {DAY_LABELS.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDaysOn((prev) => prev.map((on, idx) => (idx === i ? !on : on)))}
                        className={`h-[44px] w-[52px] rounded-[14px] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                          daysOn[i] ? 'bg-[#0F3A53] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Rate per 50-min session</label>
                  <div className="h-[46px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-3.5 flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0F172A]">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="35,000"
                      className="w-full bg-transparent text-[14px] font-bold text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[22px] bg-[#EFF6FB] border border-[#0F3A53]/20 space-y-3">
                <span className="text-[10px] font-black tracking-widest text-[#0F3A53] uppercase">THIS GIVES YOU</span>
                <div className="text-[34px] font-extrabold text-[#0F3A53] leading-none">{weeklySlots} slots<span className="text-sm font-medium">/week</span></div>
                <p className="text-xs text-[#0F3A53] font-medium leading-relaxed">
                  At ₦{rateValue.toLocaleString('en-NG')} a session, a half-full week generates about ₦{monthlyEstimate.toLocaleString('en-NG')} a month.
                </p>
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 rounded-[12px] px-3.5 py-2.5">{error}</p>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <button onClick={goBack} className="h-[44px] px-5 rounded-[14px] bg-[#F1F5F9] text-[#475569] font-bold text-xs flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => void goNext()}
                disabled={saving}
                className="os-brand-btn h-[44px] px-6 rounded-[14px] font-bold text-xs flex items-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Continue</span>}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {stepKey === 'practice' && (
          <div className="space-y-6">
            <div>
              <span className="os-eyebrow block mb-1">STEP {steps.findIndex((s) => s.key === 'practice') + 1}</span>
              <h2 className="text-[27px] font-bold tracking-tight text-[#0F172A]">Practice settings</h2>
              <p className="text-xs text-[#64748B] font-medium mt-1">Booking policies and public contact details.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Cancellation window</label>
                  <select
                    value={cancellationHours}
                    onChange={(e) => setCancellationHours(Number(e.target.value))}
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-bold text-[#0F172A] outline-none"
                  >
                    {CANCELLATION_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {h} hours before the session
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#94A3B8]">Clients can cancel without a fee up to this point.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Category / specialty</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Mental Health Clinic"
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Public phone</label>
                  <input
                    type="tel"
                    value={publicPhone}
                    onChange={(e) => setPublicPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Public email</label>
                  <input
                    type="email"
                    value={publicEmail}
                    onChange={(e) => setPublicEmail(e.target.value)}
                    placeholder="hello@yourclinic.com"
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lagos"
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12 Admiralty Way, Lekki"
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none placeholder:text-[#CBD5E1]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 rounded-[12px] px-3.5 py-2.5">{error}</p>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <button onClick={goBack} className="h-[44px] px-5 rounded-[14px] bg-[#F1F5F9] text-[#475569] font-bold text-xs flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => void goNext()}
                disabled={saving}
                className="os-brand-btn h-[44px] px-6 rounded-[14px] font-bold text-xs flex items-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Continue</span>}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {stepKey === 'link' && (
          <div className="space-y-6 text-center">
            <div>
              <span className="os-eyebrow block mb-1">STEP {steps.length}</span>
              <h2 className="text-[27px] font-bold tracking-tight text-[#0F172A]">You're open for bookings.</h2>
              <p className="text-xs text-[#64748B] font-medium mt-1">Share your live booking link with clients.</p>
            </div>

            <div className="p-5 rounded-[22px] bg-[#0F172A] text-white max-w-[540px] mx-auto space-y-3">
              <span className="text-[9px] font-black tracking-widest text-[#E3B341] uppercase block">YOUR BOOKING LINK</span>
              <div className="text-[18px] font-semibold font-mono break-all">{bookingUrl}</div>
              <button
                onClick={handleCopyLink}
                className="h-[44px] px-6 rounded-[14px] bg-[#E3B341] text-[#0F172A] font-bold text-xs hover:brightness-105 inline-flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-800" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy booking link'}</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <button onClick={goBack} className="h-[44px] px-5 rounded-[14px] bg-[#F1F5F9] text-[#475569] font-bold text-xs flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => navigate('/portal')}
                className="h-[44px] px-6 rounded-[14px] bg-[#E3B341] text-[#0F172A] font-extrabold text-xs shadow-lg hover:brightness-105"
              >
                Go to my dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
