'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Activity, Calendar, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import {
  CREATE_HEALTH_RECORD,
  GET_HEALTH_RECORDS,
  GET_HEALTH_TREND,
  GET_MEMBERS,
} from '@/graphql/operations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HEALTH_TYPES = ['BLOOD_PRESSURE', 'BLOOD_SUGAR', 'WEIGHT', 'TEMPERATURE', 'OTHER'] as const;
const TREND_PERIODS = ['D7', 'D30', 'D90'] as const;

type HealthType = (typeof HEALTH_TYPES)[number];
type TrendPeriod = (typeof TREND_PERIODS)[number];

interface HealthFormState {
  memberId: string;
  type: HealthType;
  recordedAt: string;
  systolic: string;
  diastolic: string;
  glucose: string;
  weight: string;
  temperature: string;
  unit: string;
  notes: string;
}

const initialFormState = (memberId: string, type: HealthType): HealthFormState => ({
  memberId,
  type,
  recordedAt: new Date().toISOString().slice(0, 16),
  systolic: '',
  diastolic: '',
  glucose: '',
  weight: '',
  temperature: '',
  unit: '',
  notes: '',
});

function formatHealthValue(type: HealthType, values: Record<string, unknown>): string {
  if (type === 'BLOOD_PRESSURE') {
    const systolic = values.systolic;
    const diastolic = values.diastolic;
    return `${systolic ?? '-'} / ${diastolic ?? '-'} mmHg`;
  }

  if (type === 'BLOOD_SUGAR') {
    return `${values.glucose ?? '-'} ${values.unit ?? ''}`.trim();
  }

  if (type === 'WEIGHT') {
    return `${values.weight ?? '-'} ${values.unit ?? ''}`.trim();
  }

  if (type === 'TEMPERATURE') {
    return `${values.temperature ?? '-'} ${values.unit ?? ''}`.trim();
  }

  return values.notes ? String(values.notes) : '-';
}

export default function HealthPage() {
  const t = useTranslations('health');
  const common = useTranslations('common');
  const searchParams = useSearchParams();
  const initialMemberId = searchParams.get('memberId') || '';

  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId);
  const [selectedType, setSelectedType] = useState<HealthType>('BLOOD_PRESSURE');
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>('D30');
  const [form, setForm] = useState<HealthFormState>(
    initialFormState(initialMemberId, 'BLOOD_PRESSURE'),
  );
  const [error, setError] = useState('');

  const { data: membersData, loading: membersLoading } = useQuery(GET_MEMBERS);
  const members = membersData?.members ?? [];

  useEffect(() => {
    if (!selectedMemberId && members.length > 0) {
      setSelectedMemberId(members[0].id);
    }
  }, [members, selectedMemberId]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      memberId: selectedMemberId,
      type: selectedType,
    }));
  }, [selectedMemberId, selectedType]);

  const listVariables = useMemo(
    () => ({
      input: {
        memberId: selectedMemberId,
        type: selectedType,
        first: 20,
      },
    }),
    [selectedMemberId, selectedType],
  );

  const trendVariables = useMemo(
    () => ({
      input: {
        memberId: selectedMemberId,
        type: selectedType,
        period: selectedPeriod,
      },
    }),
    [selectedMemberId, selectedType, selectedPeriod],
  );

  const {
    data: recordsData,
    loading: recordsLoading,
    refetch: refetchRecords,
  } = useQuery(GET_HEALTH_RECORDS, {
    variables: listVariables,
    skip: !selectedMemberId,
  });

  const { data: trendData, refetch: refetchTrend } = useQuery(GET_HEALTH_TREND, {
    variables: trendVariables,
    skip: !selectedMemberId,
  });

  const [createHealthRecord, { loading: saving }] = useMutation(CREATE_HEALTH_RECORD, {
    onCompleted: async () => {
      setError('');
      await Promise.all([refetchRecords(), refetchTrend()]);
      setForm(initialFormState(selectedMemberId, selectedType));
    },
    onError: (err) => {
      setError(err.message || common('error'));
    },
  });

  const records =
    recordsData?.healthRecords?.edges?.map(
      (edge: { node: Record<string, unknown> }) => edge.node,
    ) ?? [];
  const trend = trendData?.healthTrend;
  const trendPoints = trend?.points ?? [];
  const maxValue = Math.max(...trendPoints.map((point: { value: number }) => point.value), 1);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMemberId) {
      setError(t('selectMemberHint'));
      return;
    }

    const values: Record<string, unknown> = {
      unit: form.unit || undefined,
      notes: form.notes || undefined,
    };

    if (selectedType === 'BLOOD_PRESSURE') {
      values.systolic = Number(form.systolic);
      values.diastolic = Number(form.diastolic);
      values.unit = form.unit || 'mmHg';
    } else if (selectedType === 'BLOOD_SUGAR') {
      values.glucose = Number(form.glucose);
      values.unit = form.unit || 'mmol/L';
    } else if (selectedType === 'WEIGHT') {
      values.weight = Number(form.weight);
      values.unit = form.unit || 'kg';
    } else if (selectedType === 'TEMPERATURE') {
      values.temperature = Number(form.temperature);
      values.unit = form.unit || '°C';
    }

    createHealthRecord({
      variables: {
        input: {
          memberId: selectedMemberId,
          type: selectedType,
          recordedAt: new Date(form.recordedAt).toISOString(),
          values,
        },
      },
    });
  };

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-[20px] bg-[#1d1d1f] px-10 py-14 sm:px-14 sm:py-16 animate-fade-in-up">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#4a1a2a]/30 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1 text-[12px] font-[450] text-white/50">
            <Activity size={12} />
            {t('badge')}
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.022em] text-white leading-tight sm:text-[44px]">
            {t('titleLine1')}
            <span className="block text-gradient-warm">{t('titleLine2')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-[16px] font-[400] leading-relaxed text-white/40">
            {t('description')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">{t('panelTitle')}</h2>
              <p className="mt-1 text-[14px] text-[#86868b]">{t('panelDesc')}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void Promise.all([refetchRecords(), refetchTrend()]);
              }}
              className="gap-1.5"
            >
              <RefreshCw size={14} />
              {t('refresh')}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="block text-[13px] font-[450] text-[#1d1d1f]">{t('member')}</span>
                <select
                  value={selectedMemberId}
                  onChange={(event) => setSelectedMemberId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f]"
                  disabled={membersLoading}
                >
                  <option value="">{t('selectMember')}</option>
                  {members.map((member: { id: string; name: string }) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="block text-[13px] font-[450] text-[#1d1d1f]">{t('type')}</span>
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value as HealthType)}
                  className="h-11 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f]"
                >
                  {HEALTH_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`types.${type}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="block text-[13px] font-[450] text-[#1d1d1f]">
                  {t('recordedAt')}
                </span>
                <Input
                  type="datetime-local"
                  value={form.recordedAt}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, recordedAt: event.target.value }))
                  }
                />
              </label>
              <label className="space-y-1.5">
                <span className="block text-[13px] font-[450] text-[#1d1d1f]">{t('unit')}</span>
                <Input
                  value={form.unit}
                  onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
                  placeholder={t('unitPlaceholder')}
                />
              </label>
            </div>

            {selectedType === 'BLOOD_PRESSURE' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="number"
                  value={form.systolic}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, systolic: event.target.value }))
                  }
                  placeholder={t('systolic')}
                />
                <Input
                  type="number"
                  value={form.diastolic}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, diastolic: event.target.value }))
                  }
                  placeholder={t('diastolic')}
                />
              </div>
            )}

            {selectedType === 'BLOOD_SUGAR' && (
              <Input
                type="number"
                value={form.glucose}
                onChange={(event) => setForm((prev) => ({ ...prev, glucose: event.target.value }))}
                placeholder={t('glucose')}
              />
            )}

            {selectedType === 'WEIGHT' && (
              <Input
                type="number"
                value={form.weight}
                onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
                placeholder={t('weight')}
              />
            )}

            {selectedType === 'TEMPERATURE' && (
              <Input
                type="number"
                value={form.temperature}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, temperature: event.target.value }))
                }
                placeholder={t('temperature')}
              />
            )}

            <label className="space-y-1.5 block">
              <span className="block text-[13px] font-[450] text-[#1d1d1f]">{t('notes')}</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="min-h-24 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                placeholder={t('notesPlaceholder')}
              />
            </label>

            {error && <p className="text-[13px] text-[#ff3b30]">{error}</p>}

            <Button type="submit" className="gap-1.5" disabled={saving || !selectedMemberId}>
              <Plus size={16} />
              {saving ? common('loading') : t('addRecord')}
            </Button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-4 flex items-center gap-2 text-[#1d1d1f]">
              <TrendingUp size={16} />
              <h2 className="text-[18px] font-semibold">{t('trendTitle')}</h2>
            </div>
            <label className="mb-4 block space-y-1.5">
              <span className="block text-[13px] font-[450] text-[#1d1d1f]">{t('period')}</span>
              <select
                value={selectedPeriod}
                onChange={(event) => setSelectedPeriod(event.target.value as TrendPeriod)}
                className="h-11 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f]"
              >
                {TREND_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {t(`periods.${period}`)}
                  </option>
                ))}
              </select>
            </label>

            {trendPoints.length === 0 ? (
              <p className="text-[14px] text-[#86868b]">{t('trendEmpty')}</p>
            ) : (
              <div className="space-y-3">
                {trendPoints.map((point: { label: string; value: number }, index: number) => (
                  <div key={`${point.label}-${index}`}>
                    <div className="mb-1 flex items-center justify-between text-[13px] text-[#86868b]">
                      <span>{point.label}</span>
                      <span>{point.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f5f5f7]">
                      <div
                        className="h-full rounded-full bg-[#0071e3]"
                        style={{ width: `${Math.max((point.value / maxValue) * 100, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-4 flex items-center gap-2 text-[#1d1d1f]">
              <Calendar size={16} />
              <h2 className="text-[18px] font-semibold">{t('recordList')}</h2>
            </div>

            {recordsLoading ? (
              <p className="text-[14px] text-[#86868b]">{common('loading')}</p>
            ) : records.length === 0 ? (
              <p className="text-[14px] text-[#86868b]">{t('recordsEmpty')}</p>
            ) : (
              <div className="space-y-3">
                {records.map(
                  (record: {
                    id: string;
                    type: HealthType;
                    recordedAt: string;
                    values: Record<string, unknown>;
                  }) => (
                    <div key={record.id} className="rounded-xl bg-[#f5f5f7] px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[14px] font-[500] text-[#1d1d1f]">
                            {t(`types.${record.type}`)}
                          </p>
                          <p className="text-[12px] text-[#86868b]">
                            {new Date(record.recordedAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-[14px] font-[500] text-[#1d1d1f]">
                          {formatHealthValue(record.type, record.values)}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
