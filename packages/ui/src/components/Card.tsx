import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export function Card({ children, className = '', padding = 'p-[24px_26px]' }: CardProps) {
  return (
    <div className={`bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.06)] ${padding} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, eyebrow, action }: { title?: string; eyebrow?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
      <div>
        {eyebrow && <span className="text-[9px] font-black tracking-[0.22em] uppercase text-[#94A3B8] block">{eyebrow}</span>}
        {title && <h3 className="text-[15px] font-bold text-[#0F172A]">{title}</h3>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
