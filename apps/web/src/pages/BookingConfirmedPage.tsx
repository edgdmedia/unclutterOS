import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar, Video, ArrowLeft } from 'lucide-react';
import { useBrand } from '@unclutteros/ui';

export function BookingConfirmedPage() {
  const navigate = useNavigate();
  const brand = useBrand();
  const primaryColor = brand.primaryColor || '#0F3A53';

  return (
    <div className="min-h-screen bg-[#FCFDFE] text-[#0F172A] font-outfit flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[560px] space-y-6 text-center">
        {/* Success Icon Badge */}
        <div
          className="h-[72px] w-[72px] rounded-[26px] mx-auto flex items-center justify-center text-white shadow-xl"
          style={{ backgroundColor: primaryColor }}
        >
          <Check className="h-9 w-9 stroke-[3]" />
        </div>

        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.035em] text-[#0F172A]">Your session is booked</h1>
          <p className="text-[15px] text-[#475569] font-medium max-w-[460px] mx-auto mt-2 leading-relaxed">
            A confirmation has been sent to your email, along with a secure telehealth link you can open five minutes before the session.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="rounded-[24px] bg-white border border-[#E2E8F0] shadow-[0_12px_34px_rgba(15,23,42,.09)] overflow-hidden text-left space-y-4">
          <div className="p-[20px_24px] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-[46px] w-[46px] rounded-[14px] bg-[#0F3A53]/10 text-[#0F3A53] font-extrabold flex items-center justify-center text-base">
                JS
              </div>
              <div>
                <h3 className="text-[15.5px] font-bold text-[#0F172A]">Dr. Jane Smith</h3>
                <p className="text-[12.5px] text-[#64748B] font-medium">50-minute Individual Session</p>
              </div>
            </div>
            <span className="h-6 px-3 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-bold border border-[#A7F3D0]">
              Confirmed
            </span>
          </div>

          <div className="px-[24px] space-y-3 text-[13.5px]">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#94A3B8] w-[100px]">Booking ref</span>
              <span className="font-mono font-bold text-[#0F172A]">UOS-4C81-2026</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#94A3B8] w-[100px]">Date</span>
              <span className="font-bold text-[#0F172A]">Fri, 14 Aug 2026</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#94A3B8] w-[100px]">Time</span>
              <span className="font-bold text-[#0F172A]">11:30 AM WAT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#94A3B8] w-[100px]">Video Link</span>
              <a
                href="https://meet.jit.si/unclutteros-session-4c81"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs font-bold text-blue-600 underline flex items-center gap-1"
              >
                <Video className="h-3.5 w-3.5" />
                <span>meet.jit.si/unclutteros-4c81</span>
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#94A3B8] w-[100px]">Paid</span>
              <span className="font-bold text-[#0F172A]">₦30,000 · Card ending 4412</span>
            </div>
          </div>

          <div className="p-[0_24px_24px] grid grid-cols-2 gap-3 pt-2">
            <button
              className="os-brand-btn h-[48px] rounded-[16px] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Calendar className="h-4 w-4" />
              <span>Add to calendar</span>
            </button>
            <button
              onClick={() => navigate('/booking/dr-smith')}
              className="h-[48px] rounded-[16px] bg-[#F1F5F9] text-[#475569] font-bold text-sm hover:bg-[#E2E8F0] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Reschedule</span>
            </button>
          </div>

          <div className="p-[14px_24px] bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
            <span className="text-[10.5px] font-semibold text-[#94A3B8]">Booking powered by </span>
            <span className="text-[10.5px] font-extrabold text-brand-primary">UnclutterOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
