'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-3xl bg-white p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] animate-in zoom-in-95 fade-in duration-300',
          className,
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[22px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
