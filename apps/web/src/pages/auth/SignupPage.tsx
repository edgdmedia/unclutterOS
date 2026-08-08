import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building, Lock, Mail, User } from 'lucide-react';
import { AuthSplitShell } from '../../components/AuthSplitShell';
import { AuthField, authInputCls } from '../../components/AuthField';

export function SignupPage() {
  const navigate = useNavigate();
  const [practiceName, setPracticeName] = useState('Dr. Jane Smith Therapy');
  const [fullName, setFullName] = useState('Dr. Jane Smith');
  const [email, setEmail] = useState('dr.jane@smiththerapy.ng');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/onboarding');
  };

  return (
    <AuthSplitShell
      variant="signup"
      headline="Start your free 14-day trial"
      tagline="Build your white-label booking portal, manage clients, write clinical SOAP notes, and hold telehealth sessions."
      footer="No credit card required. Cancel anytime."
      bullets={[
        'Your booking page live in minutes',
        'Paystack payouts straight to your bank',
        'Telehealth room with live SOAP notes',
      ]}
    >
      <div className="text-[29px] font-bold tracking-[-0.03em] text-[#0F172A]">
        Create your practice
      </div>
      <p className="mt-[7px] text-[14.5px] text-[#64748B] leading-[1.6]">
        Setup your practice portal in under 2 minutes.
      </p>

      <form onSubmit={handleSignup} className="mt-[26px] flex flex-col gap-4">
        <AuthField
          label="Practice / clinic name"
          icon={<Building className="h-[17px] w-[17px] text-[#94A3B8] flex-none" strokeWidth={2} />}
        >
          <input
            type="text"
            required
            value={practiceName}
            onChange={(e) => setPracticeName(e.target.value)}
            placeholder="Dr. Jane Smith Therapy"
            className={authInputCls}
          />
        </AuthField>

        <AuthField
          label="Your full name"
          icon={<User className="h-[17px] w-[17px] text-[#94A3B8] flex-none" strokeWidth={2} />}
        >
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. Jane Smith"
            className={authInputCls}
          />
        </AuthField>

        <AuthField
          label="Work email address"
          icon={<Mail className="h-[17px] w-[17px] text-[#94A3B8] flex-none" strokeWidth={2} />}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@smiththerapy.ng"
            className={authInputCls}
          />
        </AuthField>

        <AuthField
          label="Password"
          icon={<Lock className="h-[17px] w-[17px] text-[#94A3B8] flex-none" strokeWidth={2} />}
        >
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={authInputCls}
          />
        </AuthField>

        <button
          type="submit"
          className="w-full h-[54px] rounded-[14px] bg-[#0F3A53] text-white text-[15px] font-bold inline-flex items-center justify-center gap-[10px] cursor-pointer shadow-[0_10px_26px_rgba(15,58,83,0.26)] transition-[filter] hover:brightness-110"
        >
          <span>Create practice workspace</span>
          <ArrowRight className="h-[17px] w-[17px]" strokeWidth={2.4} />
        </button>
      </form>

      <p className="mt-[14px] text-[11.5px] text-[#94A3B8] text-center leading-[1.6]">
        By creating a practice you agree to the unclutterOS terms and privacy policy.
      </p>

      <div className="mt-[18px] text-[13.5px] text-[#64748B] text-center">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-bold text-[#0F3A53] hover:underline">
          Log in
        </Link>
      </div>
    </AuthSplitShell>
  );
}
