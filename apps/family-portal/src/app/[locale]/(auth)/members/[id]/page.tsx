'use client';

import { useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { GET_MEMBER } from '@/graphql/operations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Heart, User } from 'lucide-react';

const RELATION_CONFIG: Record<string, { color: string }> = {
  SPOUSE: { color: '#ff2d55' },
  PARENT: { color: '#ff9500' },
  CHILD: { color: '#5ac8fa' },
  SIBLING: { color: '#34c759' },
  OTHER: { color: '#af52de' },
};

export default function MemberDetailPage() {
  const t = useTranslations('members');
  const tRelation = useTranslations('relation');
  const { id } = useParams<{ id: string }>();

  const { data, loading } = useQuery(GET_MEMBER, { variables: { id } });
  const member = data?.member;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 rounded-full border-2 border-[#d2d2d7] border-t-[#1d1d1f] animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up">
        <p className="text-[17px] text-[#86868b]">{t('notFound')}</p>
        <Link href="/members" className="mt-6">
          <Button variant="secondary" size="md">
            <ArrowLeft size={16} className="mr-1.5" />
            {t('backToList')}
          </Button>
        </Link>
      </div>
    );
  }

  const config = RELATION_CONFIG[member.relation] || RELATION_CONFIG.OTHER;

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-wrap gap-3">
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-[15px] text-[#0071e3] transition-colors hover:text-[#0077ed] hover:underline"
        >
          <ArrowLeft size={16} />
          {t('backToList')}
        </Link>
        <Link
          href={`/health?memberId=${member.id}`}
          className="inline-flex items-center gap-1.5 text-[15px] text-[#0071e3] transition-colors hover:text-[#0077ed] hover:underline"
        >
          <Heart size={16} />
          {t('healthRecords')}
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-[20px] bg-[#1d1d1f] p-10 sm:p-14">
        <div
          className="absolute right-0 top-0 h-full w-1/2 opacity-20"
          style={{ background: `linear-gradient(to left, ${config.color}30, transparent)` }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-[32px] font-bold text-white"
            style={{ backgroundColor: config.color }}
          >
            {member.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <div
              className="mb-2 inline-flex items-center rounded-full px-3 py-0.5 text-[12px] font-[500] text-white"
              style={{ backgroundColor: config.color }}
            >
              {tRelation(member.relation)}
            </div>
            <h1 className="text-[32px] font-semibold tracking-[-0.022em] text-white leading-tight sm:text-[40px]">
              {member.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="animate-fade-in-up delay-200 rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3]/[0.08]">
              <Calendar size={16} className="text-[#0071e3]" />
            </div>
            <h3 className="text-[15px] font-[500] text-[#86868b]">{t('basicInfo')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-4 py-3.5">
              <span className="text-[14px] text-[#86868b]">{t('birthday')}</span>
              <span className="text-[15px] font-[500] text-[#1d1d1f]">{member.birthday}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-4 py-3.5">
              <span className="text-[14px] text-[#86868b]">{t('relation')}</span>
              <span
                className="inline-flex items-center rounded-full px-3 py-0.5 text-[12px] font-[500] text-white"
                style={{ backgroundColor: config.color }}
              >
                {tRelation(member.relation)}
              </span>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up delay-400 rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#af52de]/[0.08]">
              <User size={16} className="text-[#af52de]" />
            </div>
            <h3 className="text-[15px] font-[500] text-[#86868b]">{t('more')}</h3>
          </div>
          {member.avatarUrl ? (
            <div className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-4 py-3.5">
              <span className="text-[14px] text-[#86868b]">{t('avatar')}</span>
              <span className="max-w-[180px] truncate text-[14px] font-[500] text-[#1d1d1f]">
                {member.avatarUrl}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7]">
                <User size={16} className="text-[#d2d2d7]" />
              </div>
              <p className="text-[14px] text-[#86868b]">{t('noAvatar')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
