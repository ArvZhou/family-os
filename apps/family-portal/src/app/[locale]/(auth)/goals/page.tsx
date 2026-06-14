'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslations } from 'next-intl';
import {
  CREATE_GOAL,
  DELETE_GOAL,
  GET_GOALS,
  GET_MEMBERS,
  UPDATE_GOAL_PROGRESS,
} from '@/graphql/operations';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BarChart3, CheckCircle2, Clock3, Plus, Target, Trash2, Trophy } from 'lucide-react';

type GoalType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
type GoalFilterStatus = GoalStatus | '';

interface GoalNode {
  id: string;
  memberId: string;
  title: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface GoalEdge {
  cursor: string;
  node: GoalNode;
}

interface GoalConnection {
  totalCount: number;
  edges: GoalEdge[];
}

interface MembersData {
  members: Array<{ id: string; name: string; relation: string }>;
}

interface GoalsData {
  goals: GoalConnection;
}

interface GoalFormState {
  memberId: string;
  title: string;
  type: GoalType;
  targetValue: string;
  currentValue: string;
  unit: string;
  startDate: string;
  endDate: string;
}

interface ProgressFormState {
  currentValue: string;
}

const goalTypeLabels: Record<GoalType, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  CUSTOM: 'Custom',
};

const goalStatusConfig: Record<GoalStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: '#0071e3' },
  COMPLETED: { label: 'Completed', color: '#34c759' },
  EXPIRED: { label: 'Expired', color: '#ff3b30' },
};

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const emptyForm = (): GoalFormState => ({
  memberId: '',
  title: '',
  type: 'WEEKLY',
  targetValue: '8000',
  currentValue: '0',
  unit: 'steps',
  startDate: today(),
  endDate: inDays(7),
});

export default function GoalsPage() {
  const t = useTranslations('goals');

  const { data: membersData } = useQuery<MembersData>(GET_MEMBERS);
  const { data, loading, refetch } = useQuery<GoalsData>(GET_GOALS, {
    variables: { first: 50 },
  });
  const [createGoal] = useMutation(CREATE_GOAL);
  const [updateGoalProgress] = useMutation(UPDATE_GOAL_PROGRESS);
  const [deleteGoal] = useMutation(DELETE_GOAL);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [progressGoal, setProgressGoal] = useState<GoalNode | null>(null);
  const [memberFilter, setMemberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<GoalFilterStatus>('');
  const [form, setForm] = useState<GoalFormState>(emptyForm());
  const [progressForm, setProgressForm] = useState<ProgressFormState>({ currentValue: '' });

  const members = membersData?.members ?? [];
  const goals = data?.goals.edges.map((edge) => edge.node) ?? [];
  const memberNameMap = useMemo(() => {
    return new Map(members.map((member) => [member.id, member.name] as const));
  }, [members]);

  const visibleGoals = goals.filter((goal) => {
    if (memberFilter && goal.memberId !== memberFilter) {
      return false;
    }
    if (statusFilter && goal.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const summary = useMemo(() => {
    const active = visibleGoals.filter((goal) => goal.status === 'ACTIVE').length;
    const completed = visibleGoals.filter((goal) => goal.status === 'COMPLETED').length;
    const expired = visibleGoals.filter((goal) => goal.status === 'EXPIRED').length;
    return { active, completed, expired };
  }, [visibleGoals]);

  const openCreate = () => {
    setEditingGoalId(null);
    setForm({
      ...emptyForm(),
      memberId: members[0]?.id ?? '',
    });
    setDialogOpen(true);
  };

  const openProgress = (goal: GoalNode) => {
    setProgressGoal(goal);
    setProgressForm({ currentValue: String(goal.currentValue) });
    setProgressDialogOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = {
      memberId: form.memberId,
      title: form.title,
      type: form.type,
      targetValue: Number(form.targetValue),
      currentValue: form.currentValue ? Number(form.currentValue) : 0,
      unit: form.unit,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    if (editingGoalId) {
      await updateGoalProgress({
        variables: {
          id: editingGoalId,
          input: { currentValue: input.currentValue },
        },
      });
    } else {
      await createGoal({ variables: { input } });
    }

    setDialogOpen(false);
    await refetch();
  };

  const handleProgressSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!progressGoal) {
      return;
    }

    await updateGoalProgress({
      variables: {
        id: progressGoal.id,
        input: { currentValue: Number(progressForm.currentValue) },
      },
    });

    setProgressDialogOpen(false);
    setProgressGoal(null);
    await refetch();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this goal?');
    if (!confirmed) {
      return;
    }

    await deleteGoal({ variables: { id } });
    await refetch();
  };

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-[20px] bg-[#1d1d1f] px-10 py-14 sm:px-14 sm:py-16 animate-fade-in-up">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#16334d]/45 to-transparent" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1 text-[12px] font-[450] text-white/50">
              <Target size={12} />
              {t('badge')}
            </div>
            <h1 className="text-[36px] font-semibold tracking-[-0.022em] text-white leading-tight sm:text-[44px]">
              {t('titleLine1')}
              <span className="block text-[#5ac8fa]">{t('titleLine2')}</span>
            </h1>
            <p className="mt-3 max-w-xl text-[16px] text-white/40 font-[400] leading-relaxed">
              {t('description')}
            </p>
          </div>
          <Button onClick={openCreate} size="md" className="gap-1.5 self-start lg:self-auto">
            <Plus size={16} strokeWidth={2.2} />
            New Goal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Active', value: summary.active, icon: Clock3, color: '#0071e3' },
          { label: 'Completed', value: summary.completed, icon: CheckCircle2, color: '#34c759' },
          { label: 'Expired', value: summary.expired, icon: Trophy, color: '#ff3b30' },
        ].map((item, index) => (
          <div
            key={item.label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${80 * (index + 1)}ms` }}
          >
            <div className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-[#86868b]">{item.label}</p>
                <item.icon size={16} color={item.color} />
              </div>
              <div className="mt-2 text-[30px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-[13px] font-medium text-[#1d1d1f]">Member</span>
            <select
              value={memberFilter}
              onChange={(event) => setMemberFilter(event.target.value)}
              className="h-12 min-w-[220px] rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] ring-1 ring-inset ring-[#d2d2d7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            >
              <option value="">All members</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="block text-[13px] font-medium text-[#1d1d1f]">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as GoalFilterStatus)}
              className="h-12 min-w-[220px] rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] ring-1 ring-inset ring-[#d2d2d7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            >
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </label>
        </div>
        <div className="text-[13px] text-[#86868b]">
          {data?.goals.totalCount ?? 0} goals in total
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 rounded-full border-2 border-[#d2d2d7] border-t-[#1d1d1f] animate-spin" />
        </div>
      ) : visibleGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#d2d2d7] bg-white py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f5f7] text-[#86868b]">
            <BarChart3 size={28} />
          </div>
          <h3 className="text-[22px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            No goals yet
          </h3>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#86868b]">
            Create a goal for a family member and track progress here.
          </p>
          <Button onClick={openCreate} size="md" className="mt-6 gap-1.5">
            <Plus size={16} strokeWidth={2} />
            New Goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleGoals.map((goal, index) => {
            const config = goalStatusConfig[goal.status];
            return (
              <div
                key={goal.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${80 * (index + 1)}ms` }}
              >
                <div className="h-full rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${goalStatusConfig[goal.status].color === '#0071e3' ? 'bg-[#0071e3]/10' : goalStatusConfig[goal.status].color === '#34c759' ? 'bg-[#34c759]/10' : 'bg-[#ff3b30]/10'}`}
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </div>
                      <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
                        {goal.title}
                      </h3>
                      <p className="mt-1 text-[13px] text-[#86868b]">
                        {memberNameMap.get(goal.memberId) ?? goal.memberId} ·{' '}
                        {goalTypeLabels[goal.type]}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[24px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
                        {goal.progress.toFixed(0)}%
                      </div>
                      <div className="text-[12px] text-[#86868b]">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f5f5f7]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, goal.progress)}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid gap-2 text-[13px] text-[#86868b] sm:grid-cols-2">
                    <div>Start: {goal.startDate}</div>
                    <div>End: {goal.endDate}</div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openProgress(goal)}>
                      Update progress
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                      <Trash2 size={14} />
                    </Button>
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
        title={editingGoalId ? 'Update goal' : 'Create goal'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="block text-[13px] font-medium text-[#1d1d1f]">Member</span>
            <select
              value={form.memberId}
              onChange={(event) => setForm((prev) => ({ ...prev, memberId: event.target.value }))}
              className="h-12 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] ring-1 ring-inset ring-[#d2d2d7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            >
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <Input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Goal title"
          />
          <label className="space-y-2">
            <span className="block text-[13px] font-medium text-[#1d1d1f]">Type</span>
            <select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, type: event.target.value as GoalType }))
              }
              className="h-12 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] ring-1 ring-inset ring-[#d2d2d7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            >
              {Object.keys(goalTypeLabels).map((key) => (
                <option key={key} value={key}>
                  {goalTypeLabels[key as GoalType]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              type="number"
              value={form.targetValue}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, targetValue: event.target.value }))
              }
              placeholder="Target value"
            />
            <Input
              type="number"
              value={form.currentValue}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, currentValue: event.target.value }))
              }
              placeholder="Current value"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              value={form.unit}
              onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
              placeholder="Unit"
            />
            <Input
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
            />
          </div>
          <Input
            type="date"
            value={form.endDate}
            onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save goal</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        title="Update progress"
      >
        <form className="space-y-4" onSubmit={handleProgressSubmit}>
          <p className="text-[14px] text-[#86868b]">{progressGoal?.title}</p>
          <Input
            type="number"
            value={progressForm.currentValue}
            onChange={(event) => setProgressForm({ currentValue: event.target.value })}
            placeholder="Current value"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setProgressDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
