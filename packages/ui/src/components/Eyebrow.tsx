import React from 'react';

export interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className = '' }: EyebrowProps) {
  return (
    <span className={`text-[9px] font-black tracking-[0.22em] uppercase text-[#94A3B8] block ${className}`}>
      {children}
    </span>
  );
}
