import React, { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs rounded-xl font-bold',
    md: 'h-10 px-4 text-sm rounded-xl font-bold',
    lg: 'h-12 px-6 text-base rounded-2xl font-bold',
  }[size];

  const variantStyles = {
    primary: 'bg-[var(--brand-primary,#0F3A53)] text-white hover:opacity-90 transition-opacity',
    secondary: 'bg-[var(--brand-secondary,#E3B341)] text-slate-900 hover:opacity-90 transition-opacity',
    danger: 'bg-red-600 text-white hover:bg-red-700 transition-colors',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 transition-colors',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 border-none outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
