import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, ArrowRight, ArrowLeft } from 'lucide-react';

export function OnboardingWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [practiceName, setPracticeName] = useState('Smith Therapy');
  const [slug, setSlug] = useState('dr-smith');
  const [rate, setRate] = useState('35,000');
  const [copied, setCopied] = useState(false);

  const primaryColor = '#0F3A53';
  const bookingUrl = `https://unclutteros.com/booking/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
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

        <span className="text-xs font-bold text-[#64748B]">Step {step} of 3</span>

        <button onClick={() => navigate('/portal')} className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]">
          Finish later
        </button>
      </header>

      {/* 3-Step Progress Bar Container */}
      <div className="w-full max-w-[820px] my-6 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-8 right-8 h-[3px] bg-[#EEF2F7] -z-0">
            <div className="h-full bg-[#E3B341] transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
          </div>

          {[
            { num: 1, label: 'Practice brand' },
            { num: 2, label: 'Availability & rates' },
            { num: 3, label: 'Share booking link' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 relative z-10">
              <div className={`h-10 w-10 rounded-[14px] font-extrabold text-sm flex items-center justify-center border-2 transition-all ${
                step === s.num
                  ? 'bg-[#0F3A53] text-white border-[#0F3A53]'
                  : step > s.num
                  ? 'bg-[#E3B341] text-[#0F172A] border-[#E3B341]'
                  : 'bg-[#EEF2F7] text-[#94A3B8] border-[#EEF2F7]'
              }`}>
                {step > s.num ? <Check className="h-5 w-5" /> : s.num}
              </div>
              <span className={`text-xs font-bold ${step >= s.num ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Panel */}
      <main className="w-full max-w-[920px] bg-white rounded-[26px] border border-[#E2E8F0] shadow-[0_14px_40px_rgba(15,23,42,.07)] p-8 my-4 flex-1">
        {step === 1 && (
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
                  <label className="text-[11.5px] font-bold text-[#475569]">Practice Name</label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Booking Link Handle</label>
                  <div className="h-[46px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-3 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-[#94A3B8]">unclutteros.com/booking/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 bg-transparent text-xs font-bold text-[#0F172A] outline-none"
                    />
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      AVAILABLE
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
                <p className="text-[11px] text-[#94A3B8]">You can change all of this later in Brand settings.</p>
                <button
                  onClick={() => setStep(2)}
                  className="os-brand-btn h-[44px] px-6 rounded-[14px] font-bold text-xs flex items-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Live Mini Preview */}
            <div className="col-span-5 p-5 rounded-[22px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="p-4 rounded-[18px] text-white space-y-2" style={{ backgroundColor: primaryColor }}>
                <span className="text-[9px] font-black tracking-widest text-[#E3B341] uppercase">BOOK A SESSION</span>
                <h4 className="text-sm font-extrabold">{practiceName}</h4>
              </div>
              <div className="space-y-2">
                <div className="h-10 bg-white rounded-[12px] border border-[#E2E8F0]" />
                <div className="h-10 bg-white rounded-[12px] border border-[#E2E8F0]" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
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
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <button
                        key={i}
                        className={`h-[44px] w-[52px] rounded-[14px] font-bold text-xs flex items-center justify-center ${
                          i < 5 ? 'bg-[#0F3A53] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
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
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full bg-transparent text-[14px] font-bold text-[#0F172A] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[22px] bg-[#EFF6FB] border border-[#0F3A53]/20 space-y-3">
                <span className="text-[10px] font-black tracking-widest text-[#0F3A53] uppercase">THIS GIVES YOU</span>
                <div className="text-[34px] font-extrabold text-[#0F3A53] leading-none">40 slots<span className="text-sm font-medium">/week</span></div>
                <p className="text-xs text-[#0F3A53] font-medium leading-relaxed">
                  At ₦35,000 a session, a half-full week generates about ₦700,000 a month.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <button onClick={() => setStep(1)} className="h-[44px] px-5 rounded-[14px] bg-[#F1F5F9] text-[#475569] font-bold text-xs flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="os-brand-btn h-[44px] px-6 rounded-[14px] font-bold text-xs flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div>
              <span className="os-eyebrow block mb-1">STEP THREE</span>
              <h2 className="text-[27px] font-bold tracking-tight text-[#0F172A]">You're open for bookings.</h2>
              <p className="text-xs text-[#64748B] font-medium mt-1">Share your live booking link with clients.</p>
            </div>

            <div className="p-5 rounded-[22px] bg-[#0F172A] text-white max-w-[540px] mx-auto space-y-3">
              <span className="text-[9px] font-black tracking-widest text-[#E3B341] uppercase block">YOUR BOOKING LINK</span>
              <div className="text-[18px] font-semibold font-mono">{bookingUrl}</div>
              <button
                onClick={handleCopyLink}
                className="h-[44px] px-6 rounded-[14px] bg-[#E3B341] text-[#0F172A] font-bold text-xs hover:brightness-105 inline-flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-800" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy booking link'}</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#E2E8F0]">
              <button onClick={() => setStep(2)} className="h-[44px] px-5 rounded-[14px] bg-[#F1F5F9] text-[#475569] font-bold text-xs flex items-center gap-2">
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
