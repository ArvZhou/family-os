'use client';

import { useTranslations } from 'next-intl';
import { Target, Trophy, BarChart3, CalendarCheck, Flag } from 'lucide-react';

export default function GoalsPage() {
  const t = useTranslations('goals');

  const features = [
    { icon: Flag, title: t('setting.title'), desc: t('setting.desc'), color: '#ff9500' },
    { icon: BarChart3, title: t('progress.title'), desc: t('progress.desc'), color: '#0071e3' },
    { icon: CalendarCheck, title: t('habits.title'), desc: t('habits.desc'), color: '#34c759' },
    {
      icon: Trophy,
      title: t('achievements.title'),
      desc: t('achievements.desc'),
      color: '#af52de',
    },
  ];

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-[20px] bg-[#1d1d1f] px-10 py-14 sm:px-14 sm:py-16 animate-fade-in-up">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#2a1a4a]/30 to-transparent" />

        <div className="relative z-10 max-w-lg">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1 text-[12px] font-[450] text-white/50">
            <Target size={12} />
            {t('badge')}
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.022em] text-white leading-tight sm:text-[44px]">
            {t('titleLine1')}
            <span className="block text-gradient-purple">{t('titleLine2')}</span>
          </h1>
          <p className="mt-3 text-[16px] text-white/40 font-[400] leading-relaxed">
            {t('description')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="animate-fade-in-up"
            style={{ animationDelay: `${(index + 1) * 80}ms` }}
          >
            <div className="group h-full rounded-2xl bg-white p-7 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: feature.color }}
              >
                <feature.icon size={20} strokeWidth={1.8} />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{feature.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#86868b]">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center py-4 animate-fade-in-up delay-400">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-5 py-2.5 text-[14px] text-[#86868b] ring-1 ring-inset ring-[#d2d2d7]/50">
          <Target size={14} />
          {t('comingSoon')}
        </div>
      </div>
    </div>
  );
}
