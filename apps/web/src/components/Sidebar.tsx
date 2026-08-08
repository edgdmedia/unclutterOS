import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Palette,
  IdCard,
  CreditCard,
  FileText,
  Bell,
  LogOut,
  Loader2,
  ClipboardCheck,
  UserCog,
  CalendarClock,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useBrand } from '@unclutteros/ui';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  counter?: string;
  counterType?: 'gold' | 'neutral' | 'rose';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/portal', label: 'Overview', icon: LayoutDashboard },
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/submissions', label: 'Submissions', icon: ClipboardCheck },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const ACCOUNT_MENU_ITEMS: { to: string; label: string; icon: typeof IdCard }[] = [
  { to: '/profile', label: 'My profile', icon: IdCard },
  { to: '/settings/account', label: 'Account & preferences', icon: UserCog },
];

const PRACTICE_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Client-facing',
    items: [
      { to: '/settings/profile', label: 'Practice profile', icon: IdCard },
      { to: '/settings/brand', label: 'Brand & booking page', icon: Palette },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/settings/availability', label: 'Availability', icon: CalendarClock },
      { to: '/settings/team', label: 'Team & staff', icon: Users },
      { to: '/settings/subscription', label: 'Subscription', icon: CreditCard },
      { to: '/settings/payouts', label: 'Payouts', icon: CreditCard },
      { to: '/settings/forms', label: 'Forms & assessments', icon: FileText },
    ],
  },
];

const PRACTICE_OPEN_KEY = 'unclutter_sidebar_practice_open';

function counterClasses(type: 'gold' | 'neutral' | 'rose'): string {
  if (type === 'rose') return 'bg-[#E11D48] text-white';
  if (type === 'gold') return 'bg-[var(--brand-secondary,#E3B341)] text-[#0F172A]';
  return 'bg-white/10 text-[#CBD5E1]';
}

function NavLinkItem({ item, indent = false }: { item: NavItem; indent?: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 h-[44px] ${
          indent ? 'pr-3 pl-[30px]' : 'px-3'
        } rounded-[14px] text-[13.5px] font-semibold transition-all ${
          isActive ? 'text-white' : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]'
        }`
      }
      style={({ isActive }) =>
        isActive
          ? {
              background: `linear-gradient(90deg, color-mix(in srgb, var(--brand-primary) 90%, transparent), color-mix(in srgb, var(--brand-primary) 55%, transparent))`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--brand-secondary, #E3B341) 28%, transparent), 0 8px 24px color-mix(in srgb, var(--brand-primary) 50%, transparent)`,
            }
          : undefined
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] bg-[var(--brand-secondary,#E3B341)] rounded-r-[3px]" />
          )}
          <Icon className={`h-[18px] w-[18px] ${isActive ? 'stroke-[var(--brand-secondary,#E3B341)]' : 'stroke-current'}`} />
          <span className="truncate">{item.label}</span>
          {item.counter && (
            <span
              className={`ml-auto h-5 px-2 rounded-full text-[10.5px] font-extrabold flex items-center justify-center ${counterClasses(item.counterType ?? 'neutral')}`}
            >
              {item.counter}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function UserMenuLink({
  to,
  icon: Icon,
  label,
  onNavigate,
}: {
  to: string;
  icon: typeof IdCard;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="flex items-center gap-2.5 px-3 h-[38px] rounded-[10px] text-[13.5px] font-semibold text-[#CBD5E1] hover:text-white hover:bg-[#334155]"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const brand = useBrand();
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(
    () => localStorage.getItem(PRACTICE_OPEN_KEY) !== '0',
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email
    : brand.name;
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join('');

  return (
    <aside className="w-[248px] min-h-screen os-sidebar text-white flex flex-col justify-between p-[20px_14px] select-none shrink-0 border-r border-slate-800/50">
      <div className="space-y-6">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 px-2 py-1 mb-4">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-7 w-7 rounded-[9px] object-cover border border-white/10"
            />
          ) : (
            <div className="h-7 w-7 rounded-[9px] bg-[#0F3A53] text-[#E3B341] flex items-center justify-center font-extrabold text-sm border border-[#E3B341]/30 shadow-xs">
              {brand.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[17px] tracking-[-0.02em] text-[#F8FAFC] truncate max-w-[120px]">
              {brand.name.toLowerCase()}
            </span>
            <span className="h-[18px] px-2 rounded-full text-[9px] font-extrabold tracking-[0.08em] bg-[#E3B341] text-[#0F172A] flex items-center justify-center uppercase shrink-0">
              OS
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLinkItem key={item.to} item={item} />
          ))}

          <button
            type="button"
            aria-expanded={practiceOpen}
            onClick={() => {
              setPracticeOpen((v) => {
                const next = !v;
                localStorage.setItem(PRACTICE_OPEN_KEY, next ? '1' : '0');
                return next;
              });
            }}
            className="w-full flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase text-[#475569] hover:text-[#94A3B8] px-3 pb-2 pt-5 transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            Practice
            <ChevronDown
              className={`ml-auto h-3.5 w-3.5 transition-transform duration-200 ${
                practiceOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {practiceOpen && (
            <div className="space-y-1">
              {PRACTICE_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="text-[9px] font-black tracking-[0.2em] uppercase text-[#475569] pl-[30px] pt-3 pb-1">
                    {group.label}
                  </div>
                  {group.items.map((item) => (
                    <NavLinkItem key={item.to} item={item} indent />
                  ))}
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* Sidebar Footer: user menu */}
      <div ref={userMenuRef} className="relative pt-3.5 border-t border-white/[0.07] px-2">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 rounded-[12px] cursor-pointer"
        >
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-[10px] object-cover shrink-0 border border-white/10"
            />
          ) : (
            <div className="h-8 w-8 rounded-[10px] bg-[#1B5375] text-white flex items-center justify-center font-extrabold text-xs shrink-0 border border-white/10">
              {initials}
            </div>
          )}
          <div className="truncate text-left">
            <p className="text-[12.5px] font-semibold text-[#E2E8F0] truncate leading-snug">{displayName}</p>
            <p className="text-[10px] text-[#64748B] font-medium leading-none">
              {profile?.type === 'admin' ? 'Administrator' : brand.name}
            </p>
          </div>
          <ChevronDown
            className={`ml-auto h-4 w-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
              menuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute bottom-full left-0 right-0 mb-2 rounded-[14px] bg-[#1E293B] border border-white/10 shadow-2xl p-1.5 space-y-0.5 z-50"
          >
            {ACCOUNT_MENU_ITEMS.map((item) => (
              <UserMenuLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onNavigate={() => setMenuOpen(false)}
              />
            ))}
            <div className="h-px bg-white/10 my-1.5" />
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-3 h-[38px] rounded-[10px] text-[13px] font-semibold text-[#E11D48] hover:bg-[#E11D48]/10 disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <LogOut className="h-4 w-4 shrink-0" />}
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
