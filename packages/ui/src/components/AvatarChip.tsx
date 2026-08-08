import React from 'react';

export interface AvatarChipProps {
  initials: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
}

export function AvatarChip({ initials, src, size = 'md', isOnline, className = '' }: AvatarChipProps) {
  let dims = 'h-[38px] w-[38px] rounded-[12px] text-xs';
  if (size === 'sm') dims = 'h-[32px] w-[32px] rounded-[10px] text-[11px]';
  if (size === 'lg') dims = 'h-[76px] w-[76px] rounded-[24px] text-[24px]';

  return (
    <div className={`relative ${dims} bg-[#0F3A53]/10 text-[#0F3A53] font-extrabold flex items-center justify-center shrink-0 border border-[#0F3A53]/20 ${className}`}>
      {src ? (
        <img src={src} alt="Avatar" className="h-full w-full object-cover rounded-inherit" />
      ) : (
        initials
      )}
      {isOnline && (
        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#10B981] border-2 border-white" />
      )}
    </div>
  );
}
