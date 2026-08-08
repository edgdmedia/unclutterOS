import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MailCheck } from 'lucide-react';
import { AuthCardShell } from '../../components/AuthCardShell';

export function VerifyEmailPage() {
  return (
    <AuthCardShell
      variant="verify"
      accent="green"
      center
      footer={
        <>
          Nothing arrived?{' '}
          <Link to="/auth/verify-email" className="font-bold text-[#0F172A] hover:underline">
            Resend the link
          </Link>{' '}
          or check your spam folder.
        </>
      }
    >
      <div className="w-16 h-16 mx-auto mt-[28px] rounded-[20px] bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
        <MailCheck className="h-[30px] w-[30px]" strokeWidth={2} />
      </div>

      <div className="mt-5 text-[25px] font-bold tracking-[-0.03em] text-[#0F172A]">
        Check your inbox
      </div>
      <p className="mt-[10px] text-[14.5px] text-[#64748B] leading-[1.65]">
        We've sent a verification link to your email address. Click the link in the email to
        activate your practice account.
      </p>

      <div className="mt-[22px] flex items-center justify-center gap-[10px] h-[50px] px-4 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0]">
        <Mail className="h-4 w-4 text-[#94A3B8] flex-none" strokeWidth={2} />
        <span className="text-[14.5px] font-semibold text-[#334155]">dr.jane@smiththerapy.com</span>
      </div>

      <Link
        to="/portal"
        className="mt-[22px] w-full h-[54px] rounded-[14px] bg-[#0F3A53] text-white text-[15px] font-bold inline-flex items-center justify-center gap-[10px] shadow-[0_10px_26px_rgba(15,58,83,0.26)] transition-[filter] hover:brightness-110"
      >
        <span>Proceed to portal</span>
        <ArrowRight className="h-[17px] w-[17px]" strokeWidth={2.4} />
      </Link>
    </AuthCardShell>
  );
}
