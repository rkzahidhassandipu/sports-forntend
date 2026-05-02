'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FitnessRecord, ProgressSummary } from '@/types/fitness';
import FitnessService from '@/services/fitness.service';

// ─── helpers ───────────────────────────────────────────────────────────────

function bmiTrendLabel(trend?: string) {
  if (trend === 'down') return { label: 'Trending down', cls: 'text-green-600 dark:text-green-400' };
  if (trend === 'up') return { label: 'Trending up', cls: 'text-red-500 dark:text-red-400' };
  return { label: 'Stable', cls: 'text-muted-foreground' };
}

function recordTypePill(type: string) {
  const map: Record<string, string> = {
    body_composition: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    strength: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    cardio: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  };
  return map[type] ?? 'bg-muted text-muted-foreground';
}

// ─── sub-components ────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  subCls,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  subCls?: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-4 py-3">
      <p className="mb-1 text-xs text-muted-foreground tracking-wide">{label}</p>
      <p className="text-2xl font-medium leading-none text-foreground">{value}</p>
      {sub && <p className={cn('mt-1 text-xs', subCls ?? 'text-muted-foreground')}>{sub}</p>}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[180px] w-full rounded-lg" />;
}

function WeightChart({ records }: { records: FitnessRecord[] }) {
  const data = [...records]
    .filter((r) => r.weight != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: format(new Date(r.date), 'MMM d'),
      weight: Number(r.weight),
    }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '0.5px solid hsl(var(--border))',
            background: 'hsl(var(--background))',
          }}
        formatter={(v: any) => [`${v} kg`, 'Weight']}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#378ADD"
          strokeWidth={2}
          dot={{ r: 3, fill: '#378ADD' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BodyFatChart({ records }: { records: FitnessRecord[] }) {
  const data = [...records]
    .filter((r) => r.bodyFat != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: format(new Date(r.date), 'MMM d'),
      bodyFat: Number(r.bodyFat),
    }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '0.5px solid hsl(var(--border))',
            background: 'hsl(var(--background))',
          }}
          formatter={(v: any) => [`${v}%`, 'Body fat']}
        />
        <Line
          type="monotone"
          dataKey="bodyFat"
          stroke="#1D9E75"
          strokeWidth={2}
          dot={{ r: 3, fill: '#1D9E75' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RecordRow({ record }: { record: FitnessRecord }) {
  return (
    <div className="flex items-start justify-between rounded-lg bg-muted/40 px-3 py-2.5 hover:bg-muted/70 transition-colors">
      <div>
        <p className="text-sm font-medium text-foreground capitalize">
          {record.recordType.replace(/_/g, ' ')}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(new Date(record.date), 'MMM d, yyyy')}
        </p>
        <span
          className={cn(
            'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
            recordTypePill(record.recordType)
          )}
        >
          Logged by Mike
        </span>
      </div>
      <div className="text-right">
        {record.weight && (
          <p className="text-sm font-medium text-foreground">{record.weight} kg</p>
        )}
        {record.bmi && (
          <p className="text-xs text-muted-foreground">BMI {Number(record.bmi).toFixed(1)}</p>
        )}
      </div>
    </div>
  );
}

// ─── page ──────────────────────────────────────────────────────────────────

export default function FitnessDashboardPage() {
  const {
    data: records,
    isLoading: recordsLoading,
    isError: recordsError,
  } = useQuery<FitnessRecord[]>({
    queryKey: ['fitness', 'my-records'],
    queryFn: () => FitnessService.getMyRecords(),
  });

  const {
    data: progress,
    isLoading: progressLoading,
    isError: progressError,
  } = useQuery<ProgressSummary>({
    queryKey: ['fitness', 'my-progress'],
    queryFn: () => FitnessService.getMyProgress(),
  });

  const isLoading = recordsLoading || progressLoading;
  const isError = recordsError || progressError;

  // Use progress.latest since the API returns that
  const latest = progress?.latest;
  const { label: bmiLabel, cls: bmiCls } = bmiTrendLabel(progress?.bmiTrend);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">My fitness overview</h1>
          <p className="text-sm text-muted-foreground">Track your body composition and progress</p>
        </div>
        <Badge variant="muted" className="gap-1.5 text-xs text-green-600 border-green-200 dark:border-green-800">
  <span className="size-1.5 rounded-full bg-green-500" />
  Active member
</Badge>
      </div>

      {isError && (
        <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load fitness data. Please try again.
        </p>
      )}

      {/* Metric cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))
        ) : (
          <>
            <MetricCard
              label="Current weight"
              value={
                <>
                  {latest?.weight ?? '—'}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kg</span>
                </>
              }
              sub={
                progress?.weightChange != null
                  ? `${progress.weightChange > 0 ? '+' : ''}${progress.weightChange.toFixed(1)} kg this month`
                  : 'Starting journey'
              }
              subCls={
                (progress?.weightChange ?? 0) < 0
                  ? 'text-green-600 dark:text-green-400'
                  : (progress?.weightChange ?? 0) > 0 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'
              }
            />
            <MetricCard
              label="BMI"
              value={latest?.bmi ? Number(latest.bmi).toFixed(1) : '—'}
              sub={bmiLabel}
              subCls={bmiCls}
            />
            <MetricCard
              label="Body fat"
              value={
                <>
                  {latest?.bodyFat ? Number(latest.bodyFat).toFixed(1) : '—'}
                  <span className="ml-0.5 text-sm font-normal text-muted-foreground">%</span>
                </>
              }
              sub="Latest measurement"
            />
            <MetricCard
              label="Sessions"
              value={progress?.totalSessions ?? '0'}
              sub={`Streak: ${progress?.streak ?? 0} days`}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              Weight over time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <ChartSkeleton /> : <WeightChart records={records ?? []} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              Body fat %
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <ChartSkeleton /> : <BodyFatChart records={records ?? []} />}
          </CardContent>
        </Card>
      </div>

      {/* Recent records */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              Recent records
            </CardTitle>
            <span className="text-xs text-blue-500 cursor-pointer hover:underline">
              View all
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {records && records.length > 0 ? (
                records.slice(0, 5).map((r) => (
                  <RecordRow key={r.id} record={r} />
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No fitness records yet. Start logging to see your progress!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}