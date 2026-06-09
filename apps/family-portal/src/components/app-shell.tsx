'use client';

import { useAuth } from './auth-provider';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/members', label: 'members' as const },
  { href: '/health', label: 'health' as const },
  { href: '/goals', label: 'goals' as const },
  { href: '/devices', label: 'devices' as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav');
  const { logout } = useAuth();
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="sticky top-0 z-50 border-b border-[#d2d2d7]/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[48px] max-w-[1200px] items-center justify-between px-6">
          <Link
            href="/members"
            className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] transition-opacity hover:opacity-70"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1d1d1f]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            {t('brand')}
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[14px] font-[420] transition-colors duration-200',
                    isActive ? 'text-[#1d1d1f] font-[500]' : 'text-[#86868b] hover:text-[#1d1d1f]',
                  )}
                >
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const newLocale = isZh ? 'en' : 'zh';
                router.replace(pathname, { locale: newLocale });
              }}
              className="flex items-center gap-1.5 text-[13px] text-[#86868b] transition-colors hover:text-[#1d1d1f] cursor-pointer"
            >
              <Globe size={14} strokeWidth={1.8} />
              <span className="font-[420]">{isZh ? t('switchToEn') : t('switchToZh')}</span>
            </button>

            <div className="h-3.5 w-px bg-[#d2d2d7]" />

            <button
              onClick={logout}
              className="text-[#86868b] transition-colors hover:text-[#1d1d1f] cursor-pointer"
            >
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d2d2d7]/50 bg-white/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around h-[50px] px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-[11px] font-[450] transition-colors duration-200',
                  isActive ? 'text-[#1d1d1f]' : 'text-[#86868b]',
                )}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-[1200px] px-6 py-12 pb-20 md:py-16">{children}</main>
    </div>
  );
}
