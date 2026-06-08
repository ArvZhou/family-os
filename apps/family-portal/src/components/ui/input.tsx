'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white disabled:cursor-not-allowed disabled:opacity-50',
          error && 'ring-[#ff3b30] focus:ring-[#ff3b30]',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-[13px] text-[#ff3b30]">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
