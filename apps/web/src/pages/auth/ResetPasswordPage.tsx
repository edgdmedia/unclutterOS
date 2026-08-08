import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { AuthCardShell } from '../../components/AuthCardShell';
import { AuthField, authInputCls } from '../../components/AuthField';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);

  const strength = useMemo(() => {
    const len = password.length;
    if (len === 0) return { pct: 0, label: '', color: '' };
    if (len < 8) return { pct: 35, label: 'Weak', color: '#F59E0B' };
    if (len < 12) return { pct: 58, label: 'Medium', color: '#E3B341' };
    return { pct: 78, label: 'Strong', color: '#15803D' };
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => navigate('/auth/login'), 2000);
  };

  return (
    <AuthCardShell
      variant="reset"
      accent="gold"
      footer={
        <Link to="/auth/login" className="text-[13.5px] font-semibold text-[#64748B] hover:text-[#0F3A53]">
          ← Back to log in
        </Link>
      }
    >
      {done ? (
        <div className="mt-[26px] p-[30px_26px] rounded-[20px] bg-[#F0FDF4] border border-[#BBF7D0] text-center">
          <div className="w-[60px] h-[60px] mx-auto rounded-[19px] bg-[#15803D] text-white flex items-center justify-center shadow-[0_10px_26px_rgba(21,128,61,0.3)]">
            <Check className="h-7 w-7" strokeWidth={2.8} />
          </div>
          <div className="mt-[18px] text-[20px] font-bold tracking-[-0.02em] text-[#0F172A]">
            Password updated
          </div>
          <p className="mt-2 text-sm text-[#166534] leading-[1.6]">Redirecting you to log in…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mt-[26px] text-[25px] font-bold tracking-[-0.03em] text-[#0F172A]">
            Set new password
          </div>
          <p className="mt-2 text-sm text-[#64748B] leading-[1.6]">
            Create a strong password for your practice account.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <AuthField
              label="New password"
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

            <AuthField
              label="Confirm new password"
              icon={<Lock className="h-[17px] w-[17px] text-[#94A3B8] flex-none" strokeWidth={2} />}
            >
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={authInputCls}
              />
            </AuthField>
          </div>

          <div className="mt-[14px] flex items-center gap-2">
            <div className="flex-1 h-[5px] rounded-[99px] bg-[#E2E8F0] overflow-hidden">
              <div
                className="h-full rounded-[99px] transition-all"
                style={{ width: `${strength.pct}%`, background: strength.color }}
              />
            </div>
            {strength.label && (
              <span className="text-[11.5px] font-bold whitespace-nowrap" style={{ color: strength.color }}>
                {strength.label}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="mt-[22px] w-full h-[54px] rounded-[14px] bg-[#0F3A53] text-white text-[15px] font-bold cursor-pointer shadow-[0_10px_26px_rgba(15,58,83,0.26)] transition-[filter] hover:brightness-110"
          >
            Update password
          </button>
        </form>
      )}
    </AuthCardShell>
  );
}
