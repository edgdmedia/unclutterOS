import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, MapPin, Award, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useBrand } from '@unclutteros/ui';
import { api } from '../utils/apiClient';

type PublicReview = {
  id: string;
  rating: number | null;
  testimonial: string;
  displayName: string;
  publishedAt: string;
};

type PublicReviewsPayload = {
  averageRating: number | null;
  count: number;
  reviews: PublicReview[];
};

export function ClientBookingPage() {
  const navigate = useNavigate();
  const { slug = 'dr-smith' } = useParams<{ slug: string }>();
  const [selectedService, setSelectedService] = useState<'individual' | 'couples'>('individual');
  const [selectedDate, setSelectedDate] = useState<number>(14);
  const [selectedSlot, setSelectedSlot] = useState<string>('11:30 AM');
  const [sessionFormat, setSessionFormat] = useState<'online' | 'in-person'>('online');
  const [fullName, setFullName] = useState('Adaeze Okonkwo');
  const [email, setEmail] = useState('adaeze@email.com');
  const [phone, setPhone] = useState('+234 801 234 5678');
  const [concerns, setConcerns] = useState('');
  const [reviews, setReviews] = useState<PublicReviewsPayload>({ averageRating: null, count: 0, reviews: [] });

  const brand = useBrand();
  const primaryColor = brand.primaryColor || '#0F3A53';
  const secondaryColor = brand.secondaryColor || '#E3B341';
  const price = selectedService === 'individual' ? '₦30,000' : '₦52,000';

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        const payload = await api.get<PublicReviewsPayload>('/v1/intake/public/reviews');
        if (!cancelled) setReviews(payload);
      } catch {
        if (!cancelled) setReviews({ averageRating: null, count: 0, reviews: [] });
      }
    }

    void loadReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConfirmBooking = () => {
    navigate('/booking/confirmed');
  };

  return (
    <div className="min-h-screen bg-[#FCFDFE] text-[#0F172A] font-outfit flex flex-col items-center">
      {/* 1180px Max Width Container */}
      <div className="w-full max-w-[1180px] shadow-2xl rounded-3xl overflow-hidden my-8 border border-[#E2E8F0] bg-white">
        {/* Dynamic Brand Header */}
        <header
          className="p-[30px_40px_26px] border-b"
          style={{
            background: `linear-gradient(120deg, ${primaryColor}14, ${secondaryColor}1F)`,
            borderColor: `${primaryColor}33`,
          }}
        >
          <div className="flex items-center gap-5">
            <div className="h-[82px] w-[82px] rounded-[26px] bg-white shadow-[0_8px_24px_rgba(15,23,42,.10)] flex items-center justify-center font-extrabold text-[26px] shrink-0 border border-slate-100" style={{ color: primaryColor }}>
              JS
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black tracking-[0.2em] uppercase block" style={{ color: primaryColor }}>
                Dr. Jane Smith Therapy
              </span>
              <div className="flex items-center gap-3">
                <h1 className="text-[30px] font-extrabold tracking-[-0.035em] text-[#0F172A]">
                  Book a session with Dr. Jane Smith
                </h1>
                <span className="h-[20px] px-3 rounded-full text-[10px] font-bold tracking-[0.06em] uppercase flex items-center" style={{ backgroundColor: `${secondaryColor}1A`, color: '#8A6512' }}>
                  CLINICAL PSYCHOLOGY
                </span>
              </div>
              <div className="flex items-center gap-4 text-[13px] text-[#475569] font-medium pt-1">
                {reviews.count > 0 ? (
                  <>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#E3B341] stroke-[#E3B341]" />
                      <strong className="text-[#0F172A]">{reviews.averageRating?.toFixed(1)}</strong> ({reviews.count} review{reviews.count === 1 ? '' : 's'})
                    </span>
                    <span>·</span>
                  </>
                ) : null}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-[#64748B]" />
                  Lagos, Nigeria · Online & in-person
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-[#64748B]" />
                  Licensed · 12 years practising
                </span>
              </div>
            </div>

            {reviews.count > 0 ? (
              <div className="mt-6 grid grid-cols-3 gap-3">
                {reviews.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="rounded-[20px] border border-white/70 bg-white/85 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,.06)] backdrop-blur">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`h-3.5 w-3.5 ${review.rating !== null && index < Math.round(review.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <p className="mt-3 text-[12.5px] leading-6 font-medium text-[#334155]">
                      {review.testimonial || 'Shared a positive review about their experience with the practice.'}
                    </p>
                    <div className="mt-3 text-[11px] font-bold text-[#0F172A]">{review.displayName}</div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between rounded-[22px] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_12px_32px_rgba(15,23,42,.06)] backdrop-blur">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">Already worked with us?</div>
                <div className="mt-1 text-[15px] font-bold text-[#0F172A]">Leave a review for the practice</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/booking/${slug}/review`)}
                className="h-[42px] rounded-[14px] px-4 text-xs font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Leave a review
              </button>
            </div>
          </div>
        </header>

        {/* 2-Column Body Layout */}
        <div className="p-[30px_40px_40px] grid grid-cols-[1fr_348px] gap-[28px] items-start bg-[#FCFDFE]">
          {/* Main Flow (Steps 1, 2, 3) */}
          <div className="space-y-8">
            {/* Step 1: Choose a Service */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[22px] w-[22px] rounded-full text-white font-extrabold text-[11px] flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  1
                </div>
                <h2 className="text-[16px] font-bold text-[#0F172A]">Choose a service</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedService('individual')}
                  className={`p-[18px] rounded-[20px] bg-white cursor-pointer border-2 transition-all relative ${
                    selectedService === 'individual'
                      ? 'border-brand-primary shadow-[0_10px_28px_var(--brand-ring)]'
                      : 'border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <span className={`absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    selectedService === 'individual' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedService === 'individual' ? 'SELECTED' : 'MOST BOOKED'}
                  </span>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">50-minute Individual Session</h3>
                  <p className="text-[12.5px] text-[#64748B] font-medium mt-1">One-to-one therapy · online or in person</p>
                  <div className="mt-4">
                    <span className="text-[24px] font-extrabold tracking-[-0.03em] text-[#0F172A]">₦30,000</span>
                    <span className="text-[12px] text-[#94A3B8] font-medium ml-1">per session</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedService('couples')}
                  className={`p-[18px] rounded-[20px] bg-white cursor-pointer border-2 transition-all relative ${
                    selectedService === 'couples'
                      ? 'border-brand-primary shadow-[0_10px_28px_var(--brand-ring)]'
                      : 'border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <span className={`absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    selectedService === 'couples' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedService === 'couples' ? 'SELECTED' : '80 MIN'}
                  </span>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">80-minute Couples Session</h3>
                  <p className="text-[12.5px] text-[#64748B] font-medium mt-1">For partners attending together</p>
                  <div className="mt-4">
                    <span className="text-[24px] font-extrabold tracking-[-0.03em] text-[#0F172A]">₦52,000</span>
                    <span className="text-[12px] text-[#94A3B8] font-medium ml-1">per session</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Pick a Date & Time */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[22px] w-[22px] rounded-full text-white font-extrabold text-[11px] flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  2
                </div>
                <h2 className="text-[16px] font-bold text-[#0F172A]">Pick a date & time</h2>
              </div>

              <div className="p-5 rounded-[22px] bg-white border border-[#E2E8F0] grid grid-cols-[1fr_216px] gap-5">
                {/* Calendar Widget */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[14.5px] font-bold text-[#0F172A]">August 2026</span>
                    <span className="text-[11.5px] font-semibold text-[#94A3B8]">WAT (GMT+1)</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black text-[#94A3B8] tracking-widest uppercase mb-2">
                    <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {[10, 11, 12, 13, 14, 17, 18, 19, 20, 21].map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(day)}
                        className={`h-[38px] rounded-[12px] text-[13px] font-semibold transition-all relative flex items-center justify-center ${
                          selectedDate === day
                            ? 'bg-brand-primary text-white border border-brand-primary'
                            : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100'
                        }`}
                      >
                        {day}
                        {selectedDate !== day && (
                          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-primary/40" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="border-l border-[#E2E8F0] pl-5 space-y-3">
                  <span className="os-eyebrow block">AVAILABLE TIMES</span>
                  <p className="text-[13px] font-semibold text-[#0F172A]">Friday, {selectedDate} August</p>

                  <div className="space-y-2">
                    {['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'].map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full h-[42px] rounded-full text-[13.5px] font-bold transition-all border-1.5 ${
                          selectedSlot === slot
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Your Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[22px] w-[22px] rounded-full text-white font-extrabold text-[11px] flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  3
                </div>
                <h2 className="text-[16px] font-bold text-[#0F172A]">Your details</h2>
              </div>

              <div className="p-5 rounded-[22px] bg-white border border-[#E2E8F0] grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none focus:bg-white focus:border-[#94A3B8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none focus:bg-white focus:border-[#94A3B8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Phone number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-[46px] px-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none focus:bg-white focus:border-[#94A3B8]"
                  />
                </div>

                {/* Session Format Segmented Control */}
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">Session format</label>
                  <div className="h-[46px] p-1 bg-[#F1F5F9] rounded-[14px] flex gap-1">
                    <button
                      onClick={() => setSessionFormat('online')}
                      className={`flex-1 rounded-[11px] text-xs font-bold transition-all ${
                        sessionFormat === 'online' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Online
                    </button>
                    <button
                      onClick={() => setSessionFormat('in-person')}
                      className={`flex-1 rounded-[11px] text-xs font-bold transition-all ${
                        sessionFormat === 'in-person' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      In-person
                    </button>
                  </div>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#475569]">
                    Share concerns <span className="text-[#94A3B8] font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    placeholder="Anything you'd like Dr. Smith to know before your first session."
                    className="w-full p-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium text-[#0F172A] outline-none focus:bg-white focus:border-[#94A3B8] resize-none"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2 text-[11.5px] text-[#94A3B8] font-medium pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Encrypted and confidential. Shared only with Dr. Smith.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Session Summary Sidebar */}
          <div className="sticky top-[24px] rounded-[22px] bg-white border border-[#E2E8F0] shadow-[0_12px_34px_rgba(15,23,42,.09)] overflow-hidden space-y-4">
            <div className="p-[16px_22px]" style={{ backgroundColor: primaryColor }}>
              <span className="text-[9px] font-black text-white/75 tracking-[0.2em] uppercase block">SESSION SUMMARY</span>
              <h3 className="text-[17px] font-bold text-white mt-0.5">
                {selectedService === 'individual' ? 'Individual Therapy' : 'Couples Therapy'}
              </h3>
            </div>

            <div className="px-[22px] space-y-3 text-[13.5px]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-[#94A3B8]">Date</span>
                <span className="font-bold text-[#0F172A]">Fri, {selectedDate} Aug 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-[#94A3B8]">Time</span>
                <span className="font-bold text-[#0F172A]">{selectedSlot} WAT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-[#94A3B8]">Therapist</span>
                <span className="font-bold text-[#0F172A]">Dr. Jane Smith</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-[#94A3B8]">Format</span>
                <span className="font-bold text-[#0F172A] capitalize">{sessionFormat}</span>
              </div>

              <div className="h-[1px] bg-[#E2E8F0] my-2" />

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[13px] font-bold text-[#475569]">Total</span>
                <span className="text-[26px] font-extrabold tracking-[-0.035em] text-[#0F172A]">{price}</span>
              </div>
            </div>

            <div className="p-[0_22px_22px] space-y-3">
              <button
                onClick={handleConfirmBooking}
                className="os-brand-btn w-full h-[52px] rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_26px_rgba(15,58,83,.2)]"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Confirm & Book Session</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-[11.5px] text-[#94A3B8] font-medium text-center">
                Free cancellation up to 24 hours before
              </p>
            </div>

            <div className="p-[14px_22px] bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center gap-2 justify-center">
              <span className="text-[10.5px] font-semibold text-[#94A3B8]">Booking powered by</span>
              <span className="text-[10.5px] font-extrabold text-brand-primary">UnclutterOS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
