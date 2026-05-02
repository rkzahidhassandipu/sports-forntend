
export interface FitnessRecord {
  id: string;
  memberId: string;
  trainerId?: string | null;
  recordType: string; // e.g., "body_composition", "strength"
  date: string;
  data: Record<string, any>; // From Prisma Json
  notes?: string | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFat?: number | null;
  goals?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFitnessDto {
  memberId: string;
  recordType: string;
  data: Record<string, any>;
  notes?: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  bmi?: number;
}

export interface UpdateFitnessDto extends Partial<Omit<CreateFitnessDto, 'memberId'>> {}

export interface ProgressSummary {
  latest?: {
    weight?: number | string | null;
    bmi?: number | string | null;
    bodyFat?: number | string | null;
  };
  bmiTrend?: string;
  weightChange?: number | null;
  totalSessions?: number;
  streak?: number;
}

export interface PerformanceReport {
  memberId: string;
  period: string;
  metrics: Record<string, number[]>;
  coachNotes?: string;
}