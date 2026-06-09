'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { GET_MEMBERS, CREATE_MEMBER, UPDATE_MEMBER, DELETE_MEMBER } from '@/graphql/operations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

const RELATION_CONFIG: Record<
  string,
  { color: string; avatarBg: string; badgeBg: string; badgeText: string }
> = {
  SPOUSE: {
    color: '#ff2d55',
    avatarBg: 'bg-[#ff2d55]',
    badgeBg: 'bg-[#ff2d55]/10',
    badgeText: 'text-[#ff2d55]',
  },
  PARENT: {
    color: '#ff9500',
    avatarBg: 'bg-[#ff9500]',
    badgeBg: 'bg-[#ff9500]/10',
    badgeText: 'text-[#ff9500]',
  },
  CHILD: {
    color: '#5ac8fa',
    avatarBg: 'bg-[#5ac8fa]',
    badgeBg: 'bg-[#5ac8fa]/10',
    badgeText: 'text-[#5ac8fa]',
  },
  SIBLING: {
    color: '#34c759',
    avatarBg: 'bg-[#34c759]',
    badgeBg: 'bg-[#34c759]/10',
    badgeText: 'text-[#34c759]',
  },
  OTHER: {
    color: '#af52de',
    avatarBg: 'bg-[#af52de]',
    badgeBg: 'bg-[#af52de]/10',
    badgeText: 'text-[#af52de]',
  },
};

const RELATION_OPTIONS = Object.keys(RELATION_CONFIG);

interface MemberForm {
  id?: string;
  name: string;
  birthday: string;
  relation: string;
  avatarUrl?: string;
}

const emptyForm: MemberForm = { name: '', birthday: '', relation: 'CHILD' };

export default function MembersPage() {
  const t = useTranslations('members');
  const tRelation = useTranslations('relation');
  const tCommon = useTranslations('common');

  const { data, loading, refetch } = useQuery(GET_MEMBERS);
  const [createMember] = useMutation(CREATE_MEMBER);
  const [updateMember] = useMutation(UPDATE_MEMBER);
  const [deleteMember] = useMutation(DELETE_MEMBER);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const members = data?.members || [];

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (member: any) => {
    setForm({
      id: member.id,
      name: member.name,
      birthday: member.birthday,
      relation: member.relation,
      avatarUrl: member.avatarUrl || '',
    });
    setEditingId(member.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMember({ variables: { id } });
    refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      name: form.name,
      birthday: form.birthday,
      relation: form.relation,
      avatarUrl: form.avatarUrl || null,
    };
    if (editingId) {
      await updateMember({ variables: { id: editingId, input } });
    } else {
      await createMember({ variables: { input } });
    }
    setDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-[20px] bg-[#1d1d1f] px-10 py-14 sm:px-14 sm:py-16 animate-fade-in-up">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#1a3a4a]/40 to-transparent" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1 text-[12px] font-[450] text-white/50">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
              {t('heroTag')}
            </div>
            <h1 className="text-[36px] font-semibold tracking-[-0.022em] text-white leading-tight sm:text-[44px]">
              {t('title')}
            </h1>
            <p className="mt-2 text-[16px] text-white/40 font-[400] leading-relaxed max-w-md">
              {t('description')}
            </p>
          </div>
          <Button
            onClick={openCreate}
            size="md"
            className="gap-1.5 self-start sm:self-auto shadow-[0_4px_16px_rgba(0,113,227,0.3)]"
          >
            <Plus size={16} strokeWidth={2.2} />
            {t('add')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 rounded-full border-2 border-[#d2d2d7] border-t-[#1d1d1f] animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up delay-200">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-[#86868b]"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-[22px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            {t('empty')}
          </h3>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#86868b]">
            {t('emptyHint')}
          </p>
          <Button onClick={openCreate} size="md" className="mt-6 gap-1.5">
            <Plus size={16} strokeWidth={2} />
            {t('addFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member: any, index: number) => {
            const config = RELATION_CONFIG[member.relation] || RELATION_CONFIG.OTHER;
            return (
              <div
                key={member.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 80}ms` }}
              >
                <div className="group relative h-full overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                  <div className="h-1 w-full" style={{ backgroundColor: config.color }} />

                  <Link href={`/members/${member.id}`} className="block p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{member.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-[500] ${config.badgeBg} ${config.badgeText}`}
                          >
                            {tRelation(member.relation)}
                          </span>
                          <span className="text-[13px] text-[#86868b]">{member.birthday}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3 border-t border-[#f5f5f7] pt-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f7] text-[12px]">
                        {member.relation === 'SPOUSE'
                          ? '💕'
                          : member.relation === 'PARENT'
                            ? '👨‍👩‍👧'
                            : member.relation === 'CHILD'
                              ? '🧒'
                              : member.relation === 'SIBLING'
                                ? '👫'
                                : '🏠'}
                      </div>
                      <div className="flex-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f5f5f7]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${65 + Math.random() * 25}%`,
                              backgroundColor: config.color,
                              opacity: 0.6,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="absolute right-4 top-5 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        openEdit(member);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#86868b] hover:text-[#0071e3] transition-colors cursor-pointer"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(member.id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#86868b] hover:text-[#ff3b30] transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? t('edit') : t('add')}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[14px] font-[450] text-[#1d1d1f]">
              {t('name')}
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('enterName')}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] font-[450] text-[#1d1d1f]">
              {t('birthday')}
            </label>
            <Input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] font-[450] text-[#1d1d1f]">
              {t('relation')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RELATION_OPTIONS.map((value) => {
                const config = RELATION_CONFIG[value];
                const isSelected = form.relation === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, relation: value })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-[13px] font-[450] transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'text-white shadow-md'
                        : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed] ring-1 ring-inset ring-[#d2d2d7]/50'
                    }`}
                    style={isSelected ? { backgroundColor: config.color } : {}}
                  >
                    <span className="text-[18px]">
                      {value === 'SPOUSE'
                        ? '💕'
                        : value === 'PARENT'
                          ? '👨‍👩‍👧'
                          : value === 'CHILD'
                            ? '🧒'
                            : value === 'SIBLING'
                              ? '👫'
                              : ''}
                    </span>
                    {tRelation(value)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" size="md">
              {editingId ? tCommon('save') : tCommon('create')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
