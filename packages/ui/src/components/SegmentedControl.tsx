import React from 'react';

export interface OptionItem {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: (OptionItem | string)[];
  value: string;
  onChange: (val: string) => void;
  height?: string;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, height = 'h-[40px]', className = '' }: SegmentedControlProps) {
  return (
    <div className={`${height} p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[14px] flex gap-1 ${className}`}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = value === val;

        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`flex-1 rounded-[10px] text-xs font-bold capitalize transition-all ${
              active ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
