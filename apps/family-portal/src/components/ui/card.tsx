'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('mb-6', className)}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('', className)}>{children}</div>;
}
