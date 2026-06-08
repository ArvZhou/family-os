'use client';

import { useAuth } from './auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Heart, Target, Cpu, Globe, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/members', icon: Users, label: 'members' as const },
  { href: '/health', icon: Heart, label: 'health' as const },
  { href: '/goals', icon: Target, label: 'goals' as const },
  { href: '/devices', icon: Cpu, label: 'devices' as const },
];

const labels: Record<string, { zh: string; en: string }> = {
  members: { zh: '家庭成员', en: 'Members' },
  health: { zh: '健康', en: 'Health' },
  goals: { zh: '目标', en: 'Goals' },
  devices: { zh: '设备', en: 'Devices' },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isZh = pathname.startsWith('/zh');

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Top navigation — Apple-style frosted glass */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/[0.72] backdrop-blur-2xl backdrop-saturate-[1.8]">
        <div className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-6">
          <Link
            href="/members"
            className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] hover:opacity-70 transition-opacity"
          >
            Family OS
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-[14px] font-[420] transition-colors',
                    isActive ? 'text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]',
                  )}
                >
                  {labels[item.label][isZh ? 'zh' : 'en']}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newLocale = isZh ? 'en' : 'zh';
                const newPath = pathname.replace(/^\/(zh|en)/, `/${newLocale}`);
                router.push(newPath);
              }}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            >
              <Globe size={15} />
              <span className="hidden sm:inline">{isZh ? 'EN' : '中文'}</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom tab bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/[0.06] bg-white/[0.88] backdrop-blur-2xl md:hidden">
        <div className="flex items-center justify-around h-[50px] px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-0',
                  isActive ? 'text-[#0071e3]' : 'text-[#86868b]',
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="text-[10px] font-[450] leading-none">
                  {labels[item.label][isZh ? 'zh' : 'en']}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-10 pb-20 md:py-12">{children}</main>
    </div>
  );
}
