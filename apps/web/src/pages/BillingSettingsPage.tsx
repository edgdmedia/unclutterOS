import React, { useState } from 'react';
import { CreditCard, Check, ShieldCheck, Download, ArrowUpRight, X } from 'lucide-react';
import { Eyebrow, Card, StatusBadge, Button } from '@unclutteros/ui';
import { useBrand } from '@unclutteros/ui';

interface BillingInfo {
  plan: 'starter' | 'pro' | 'clinic';
  nextBillingDate: string;
  nextChargeAmount: string;
  payoutsActive: boolean;
  bankName: string;
  accountNumber: string;
  accountName: string;
  invoiceHistory: Array<{ date: string; desc: string; amount: string; status: string }>;
}

interface BillingSettingsPageProps {
  billingInfo: BillingInfo;
  setBillingInfo: React.Dispatch<React.SetStateAction<BillingInfo>>;
}

export function BillingSettingsPage({ billingInfo, setBillingInfo }: BillingSettingsPageProps) {
  const brand = useBrand();
  const primaryColor = brand.primaryColor || '#0F3A53';

  const [showBankModal, setShowBankModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Modal temporary state
  const [tempBankName, setTempBankName] = useState(billingInfo.bankName);
  const [tempAccountNumber, setTempAccountNumber] = useState(billingInfo.accountNumber);
  const [tempAccountName, setTempAccountName] = useState(billingInfo.accountName);

  const handleDownloadInvoice = (desc: string) => {
    alert(`Downloading PDF invoice for: ${desc}`);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingInfo({
      ...billingInfo,
      bankName: tempBankName,
      accountNumber: tempAccountNumber,
      accountName: tempAccountName,
    });
    setShowBankModal(false);
  };

  const handleSelectPlan = (plan: 'starter' | 'pro' | 'clinic') => {
    if (plan === billingInfo.plan) return;

    if (plan === 'clinic') {
      setShowUpgradeModal(true);
    } else {
      const chargeAmounts = {
        starter: '₦0',
        pro: '₦25,000',
        clinic: '₦75,000',
      };
      setBillingInfo({
        ...billingInfo,
        plan,
        nextChargeAmount: chargeAmounts[plan],
      });
    }
  };

  const handleUpgradeClinic = () => {
    setBillingInfo({
      ...billingInfo,
      plan: 'clinic',
      nextChargeAmount: '₦75,000',
    });
    setShowUpgradeModal(false);
  };

  return (
    <div className="flex-1 min-w-[1192px] flex flex-col bg-[#F8FAFC]">
      {/* 88px Header Bar */}
      <header className="h-[88px] bg-white border-b border-[#E2E8F0] px-[26px] flex items-center justify-between gap-5 shrink-0">
        <div>
          <Eyebrow>SETTINGS</Eyebrow>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#0F172A]">Subscription & bank payouts</h1>
          <p className="text-xs text-[#64748B] font-medium">
            Next charge {billingInfo.nextChargeAmount} on {billingInfo.nextBillingDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {billingInfo.payoutsActive && (
            <span className="h-7 px-3 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-bold border border-[#A7F3D0] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Payouts active</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="p-[24px_26px_30px] space-y-6 flex-1">
        {/* 3 Subscription Plan Cards Grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Starter Plan */}
          <div
            onClick={() => handleSelectPlan('starter')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all relative flex flex-col justify-between space-y-4 bg-white ${
              billingInfo.plan === 'starter'
                ? 'border-2 border-[#0F3A53] shadow-[0_12px_34px_rgba(15,23,42,.12)]'
                : 'border border-[#E2E8F0] hover:border-slate-300'
            }`}
          >
            {billingInfo.plan === 'starter' && (
              <span className="absolute top-4 right-4 h-5 px-2.5 rounded-full bg-slate-200 text-slate-800 text-[9px] font-black tracking-wider uppercase">
                CURRENT PLAN
              </span>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-extrabold text-[#0F172A]">Starter</h3>
                <span className="h-5 px-2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase flex items-center">
                  FREE
                </span>
              </div>
              <div className="text-[28px] font-extrabold text-[#0F172A]">
                ₦0<span className="text-xs font-medium text-[#64748B]">/month</span>
              </div>
              <ul className="space-y-2 text-xs text-[#475569] font-medium pt-2 border-t border-[#F1F5F9]">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> 1 Practitioner profile
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Up to 20 bookings / mo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Instant Jitsi WebRTC video
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan (Dark Card) */}
          <div
            onClick={() => handleSelectPlan('pro')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all relative flex flex-col justify-between space-y-4 bg-[#0F172A] text-white ${
              billingInfo.plan === 'pro'
                ? 'border-2 border-[#E3B341] shadow-[0_12px_34px_rgba(15,23,42,.24)]'
                : 'border border-slate-800 hover:brightness-110'
            }`}
          >
            {billingInfo.plan === 'pro' && (
              <span className="absolute top-4 right-4 h-5 px-2.5 rounded-full bg-[#E3B341] text-[#0F172A] text-[9px] font-black tracking-wider uppercase flex items-center">
                CURRENT PLAN
              </span>
            )}
            <div className="space-y-3">
              <h3 className="text-[18px] font-extrabold">Pro Solo</h3>
              <div className="text-[28px] font-extrabold text-white">
                ₦25,000<span className="text-xs font-medium text-slate-400">/month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-medium pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#E3B341]" /> Unlimited sessions & bookings
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#E3B341]" /> 1 Receptionist / Staff login
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#E3B341]" /> Custom Domain (CNAME)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#E3B341]" /> Daily.co BYOK Cloud Recording
                </li>
              </ul>
            </div>
          </div>

          {/* Group Clinic Plan */}
          <div
            onClick={() => handleSelectPlan('clinic')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all relative flex flex-col justify-between space-y-4 bg-white ${
              billingInfo.plan === 'clinic'
                ? 'border-2 border-[#0F3A53] shadow-[0_12px_34px_rgba(15,23,42,.12)]'
                : 'border border-[#E2E8F0] hover:border-slate-300'
            }`}
          >
            {billingInfo.plan === 'clinic' && (
              <span className="absolute top-4 right-4 h-5 px-2.5 rounded-full bg-slate-200 text-slate-800 text-[9px] font-black tracking-wider uppercase flex items-center">
                CURRENT PLAN
              </span>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-extrabold text-[#0F172A]">Group Clinic</h3>
                <span className="h-5 px-2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase flex items-center">
                  CLINIC TIER
                </span>
              </div>
              <div className="text-[28px] font-extrabold text-[#0F172A]">
                ₦75,000<span className="text-xs font-medium text-[#64748B]">/month</span>
              </div>
              <ul className="space-y-2 text-xs text-[#475569] font-medium pt-2 border-t border-[#F1F5F9]">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Up to 25 Therapist profiles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Group Clinic RBAC Roles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Supervisor case reviews
                </li>
              </ul>
            </div>

            {billingInfo.plan !== 'clinic' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpgradeModal(true);
                }}
                className="os-brand-btn w-full h-[40px] rounded-[14px] font-bold text-xs cursor-pointer text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Upgrade plan
              </button>
            )}
          </div>
        </div>

        {/* Bank Payout Subaccount Card */}
        <Card padding="p-[24px_26px]" className="max-w-[560px] space-y-4 bg-white border border-slate-100">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <Eyebrow>PAYOUT ACCOUNT</Eyebrow>
              <h3 className="text-[16px] font-bold text-[#0F172A]">Paystack Bank Subaccount</h3>
            </div>
            <span className="h-6 px-3 rounded-full bg-[#ECFDF5] text-[#059669] font-bold text-xs border border-[#A7F3D0] flex items-center">
              VERIFIED
            </span>
          </div>

          <div className="p-5 rounded-[20px] bg-[#0F3A53] text-white space-y-3 shadow-md">
            <span className="text-[10px] font-black tracking-widest text-[#E3B341] uppercase">{billingInfo.bankName}</span>
            <div className="text-[22px] font-extrabold font-mono tracking-widest leading-none">
              •••• •••• {billingInfo.accountNumber.slice(-4)}
            </div>
            <p className="text-xs text-slate-300 font-medium">{billingInfo.accountName} · Lagos, Nigeria</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setTempBankName(billingInfo.bankName);
                setTempAccountNumber(billingInfo.accountNumber);
                setTempAccountName(billingInfo.accountName);
                setShowBankModal(true);
              }}
              className="h-[40px] rounded-[14px] bg-[#F1F5F9] text-[#0F172A] font-bold text-xs hover:bg-[#E2E8F0] cursor-pointer"
            >
              Change account
            </button>
            <button
              onClick={() => alert('Opening Paystack settlement history...')}
              className="os-brand-btn h-[40px] rounded-[14px] font-bold text-xs cursor-pointer text-white"
              style={{ backgroundColor: primaryColor }}
            >
              View settlements
            </button>
          </div>
        </Card>

        {/* Invoice History Table */}
        <Card padding="p-0" className="overflow-hidden border border-[#E2E8F0] bg-white">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-[24px] py-[16px] grid grid-cols-[1.1fr_1.4fr_0.9fr_0.9fr_0.7fr] gap-4 items-center">
            <Eyebrow>DATE</Eyebrow>
            <Eyebrow>DESCRIPTION</Eyebrow>
            <Eyebrow>AMOUNT</Eyebrow>
            <Eyebrow>STATUS</Eyebrow>
            <Eyebrow className="text-right">INVOICE</Eyebrow>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {billingInfo.invoiceHistory.map((inv, idx) => (
              <div key={idx} className="px-[24px] py-[16px] grid grid-cols-[1.1fr_1.4fr_0.9fr_0.9fr_0.7fr] gap-4 items-center hover:bg-[#FCFDFE]">
                <span className="text-[13.5px] font-bold text-[#0F172A]">{inv.date}</span>
                <span className="text-[13px] font-medium text-[#475569]">{inv.desc}</span>
                <span className="text-[13.5px] font-extrabold text-[#0F172A]">{inv.amount}</span>
                <div>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="text-right">
                  <button
                    onClick={() => handleDownloadInvoice(inv.desc)}
                    className="text-xs font-bold text-[#0F3A53] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      {/* Change Bank Account Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <form
            onSubmit={handleSaveBankDetails}
            className="w-full max-w-[480px] bg-white rounded-[24px] p-6 shadow-2xl space-y-4 border border-slate-200 relative"
          >
            <button
              type="button"
              onClick={() => setShowBankModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-[#0F172A]">Update Payout Bank Account</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">Bank Name</label>
                <select
                  value={tempBankName}
                  onChange={(e) => setTempBankName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0F172A] outline-none"
                >
                  <option value="Guaranty Trust Bank">Guaranty Trust Bank (GTB)</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">10-Digit NUBAN Account Number</label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={tempAccountNumber}
                  onChange={(e) => setTempAccountNumber(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono font-bold text-[#0F172A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={tempAccountName}
                  onChange={(e) => setTempAccountName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0F172A] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="flex-1 h-11 rounded-[14px] bg-[#F1F5F9] text-[#475569] font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-[14px] font-bold text-xs cursor-pointer text-white flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upgrade Subscription Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-[440px] bg-white rounded-[24px] p-6 shadow-2xl space-y-4 border border-slate-200 text-center relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-12 w-12 rounded-[16px] bg-[#0F3A53] text-[#E3B341] font-bold text-xl flex items-center justify-center mx-auto">
              U
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Upgrade to Group Clinic Tier</h3>
            <p className="text-xs text-[#64748B] font-medium">
              ₦75,000/month. Supports up to 25 therapists with RBAC roles and clinic-wide analytics.
            </p>
            <button
              onClick={handleUpgradeClinic}
              className="os-brand-btn w-full h-11 rounded-[14px] font-bold text-xs cursor-pointer text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Proceed to Paystack Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
