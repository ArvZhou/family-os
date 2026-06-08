'use client';

import { useQuery } from '@apollo/client';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { GET_MEMBER } from '@/graphql/operations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const RELATIONS: Record<string, { zh: string; en: string }> = {
  SPOUSE: { zh: '配偶', en: 'Spouse' },
  PARENT: { zh: '父母', en: 'Parent' },
  CHILD: { zh: '子女', en: 'Child' },
  SIBLING: { zh: '兄弟姐妹', en: 'Sibling' },
  OTHER: { zh: '其他', en: 'Other' },
};

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const isZh = pathname.startsWith('/zh');
  const r = (key: string) => RELATIONS[key]?.[isZh ? 'zh' : 'en'] || key;

  const { data, loading } = useQuery(GET_MEMBER, { variables: { id } });
  const member = data?.member;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#86868b] border-t-transparent" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-[17px] text-[#86868b]">{isZh ? '成员不存在' : 'Member not found'}</p>
        <Link href="/members" className="mt-6">
          <Button variant="secondary" size="md">
            <ArrowLeft size={16} className="mr-1.5" />
            {isZh ? '返回成员列表' : 'Back to Members'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/members"
        className="inline-flex items-center gap-1 text-[15px] text-[#0071e3] hover:underline"
      >
        <ArrowLeft size={16} />
        {isZh ? '返回成员列表' : 'Back to Members'}
      </Link>

      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] text-[28px] font-medium text-[#1d1d1f] shadow-sm">
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
                {member.name}
              </h1>
              <p className="mt-1 text-[17px] text-[#86868b]">{r(member.relation)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-[#f5f5f7] px-5 py-4">
              <span className="text-[14px] text-[#86868b]">{isZh ? '生日' : 'Birthday'}</span>
              <span className="text-[15px] font-medium text-[#1d1d1f]">{member.birthday}</span>
            </div>
            {member.avatarUrl && (
              <div className="flex items-center justify-between rounded-2xl bg-[#f5f5f7] px-5 py-4">
                <span className="text-[14px] text-[#86868b]">{isZh ? '头像' : 'Avatar'}</span>
                <span className="max-w-[200px] truncate text-[15px] font-medium text-[#1d1d1f]">
                  {member.avatarUrl}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
