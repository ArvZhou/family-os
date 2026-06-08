'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { usePathname } from 'next/navigation';
import { GET_MEMBERS, CREATE_MEMBER, UPDATE_MEMBER, DELETE_MEMBER } from '@/graphql/operations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

const RELATIONS: Record<string, { zh: string; en: string }> = {
  SPOUSE: { zh: '配偶', en: 'Spouse' },
  PARENT: { zh: '父母', en: 'Parent' },
  CHILD: { zh: '子女', en: 'Child' },
  SIBLING: { zh: '兄弟姐妹', en: 'Sibling' },
  OTHER: { zh: '其他', en: 'Other' },
};

const RELATION_OPTIONS = Object.keys(RELATIONS);

interface MemberForm {
  id?: string;
  name: string;
  birthday: string;
  relation: string;
  avatarUrl?: string;
}

const emptyForm: MemberForm = { name: '', birthday: '', relation: 'CHILD' };

export default function MembersPage() {
  const pathname = usePathname();
  const isZh = pathname.startsWith('/zh');
  const r = (key: string) => RELATIONS[key]?.[isZh ? 'zh' : 'en'] || key;

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
    <div className="space-y-10">
      {/* Hero area */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            {isZh ? '家庭成员' : 'Family Members'}
          </h1>
          <p className="mt-1.5 text-[17px] text-[#86868b]">
            {isZh ? '管理你的家庭成员信息' : 'Manage your family members'}
          </p>
        </div>
        <Button onClick={openCreate} size="md" className="gap-1.5 self-start sm:self-auto">
          <Plus size={18} strokeWidth={2} />
          {isZh ? '添加成员' : 'Add Member'}
        </Button>
      </div>

      {/* Member grid or empty state */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#86868b] border-t-transparent" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <svg
              width="44"
              height="44"
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
          <h3 className="text-[21px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            {isZh ? '暂无家庭成员' : 'No Family Members'}
          </h3>
          <p className="mt-2 max-w-sm text-[15px] text-[#86868b]">
            {isZh
              ? '点击上方按钮添加你的第一位家庭成员，开始记录家人的健康与生活'
              : 'Add your first family member to start tracking their health and activities'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member: any) => (
            <Card
              key={member.id}
              className="group relative p-0 overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            >
              <Link href={`/members/${member.id}`} className="block p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] text-[20px] font-medium text-[#1d1d1f]">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{member.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-[14px] text-[#86868b]">
                  <span>{member.birthday}</span>
                  <span className="text-[#d2d2d7]">·</span>
                  <span>{r(member.relation)}</span>
                </div>
              </Link>
              {/* Action buttons overlay */}
              <div className="absolute right-3 top-3 flex gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    openEdit(member);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur text-[#86868b] hover:text-[#0071e3] hover:bg-white shadow-sm ring-1 ring-black/[0.04] transition-all cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(member.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur text-[#86868b] hover:text-[#ff3b30] hover:bg-white shadow-sm ring-1 ring-black/[0.04] transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? (isZh ? '编辑成员' : 'Edit Member') : isZh ? '添加成员' : 'Add Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[14px] font-[450] text-[#1d1d1f]">
              {isZh ? '姓名' : 'Name'}
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={isZh ? '输入姓名' : 'Enter name'}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] font-[450] text-[#1d1d1f]">
              {isZh ? '生日' : 'Birthday'}
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
              {isZh ? '关系' : 'Relation'}
            </label>
            <select
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
              className="flex h-12 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] ring-1 ring-inset ring-[#d2d2d7] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white appearance-none cursor-pointer"
            >
              {RELATION_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {RELATIONS[value][isZh ? 'zh' : 'en']}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setDialogOpen(false)}
            >
              {isZh ? '取消' : 'Cancel'}
            </Button>
            <Button type="submit" size="md">
              {editingId ? (isZh ? '保存' : 'Save') : isZh ? '创建' : 'Create'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
