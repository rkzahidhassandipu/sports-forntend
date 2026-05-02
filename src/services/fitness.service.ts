// src/services/fitness.service.ts
import { api } from '@/lib/api';
import { CreateFitnessDto, FitnessRecord, PerformanceReport, ProgressSummary, UpdateFitnessDto } from '@/types/fitness';

const FitnessService = {
  /**
   * Member Access (Self)
   */
  async getMyRecords(): Promise<FitnessRecord[]> {
  const { data } = await api.get('/fitness/my-records');
  return data.data; // unwrap envelope
},

async getMyProgress(): Promise<ProgressSummary> {
  const { data } = await api.get('/fitness/my-progress');
  return data.data; // unwrap envelope
},

  /**
   * Trainer & Staff Management
   */
  async createRecord(payload: CreateFitnessDto): Promise<FitnessRecord> {
    const { data } = await api.post('/fitness', payload);
    return data;
  },

  async getMemberRecords(memberId: string): Promise<FitnessRecord[]> {
    const { data } = await api.get(`/fitness/member/${memberId}`);
    return data;
  },

  async updateRecord(id: string, payload: UpdateFitnessDto): Promise<FitnessRecord> {
    const { data } = await api.put(`/fitness/${id}`, payload);
    return data;
  },

  async deleteRecord(id: string): Promise<void> {
    await api.delete(`/fitness/${id}`);
  },

  /**
   * Advanced Reporting (Coach/Admin)
   */
  async getPerformanceReport(memberId: string): Promise<PerformanceReport> {
    const { data } = await api.get(`/fitness/performance/${memberId}`);
    return data;
  },

  async getTrainerSummary(): Promise<any> {
    const { data } = await api.get('/fitness/trainer-summary');
    return data;
  }
};

export default FitnessService;