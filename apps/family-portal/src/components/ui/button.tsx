'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer';
  const variants: Record<string, string> = {
    primary: 'bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#006edb] shadow-sm',
    secondary: 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] active:bg-[#e0e0e5]',
    ghost: 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]',
    danger: 'bg-[#ff3b30] text-white hover:bg-[#ff453a] active:bg-[#e0352b] shadow-sm',
  };
  const sizes: Record<string, string> = {
    sm: 'h-8 px-4 text-xs rounded-full',
    md: 'h-11 px-6 text-[15px] rounded-full',
    lg: 'h-[52px] px-8 text-[17px] rounded-full',
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
