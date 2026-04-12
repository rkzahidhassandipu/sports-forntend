import { api } from "@/lib/api";
import { CreateSessionDto, Review, Session, SessionFilters, UpdateSessionDto } from "@/types/gym";


const SessionService = {
  /**
   * Public & Optional Auth
   */
  async getAll(params?: SessionFilters): Promise<Session[]> {
    const { data } = await api.get('/sessions', { params });
    return data;
  },

  async search(query: string): Promise<Session[]> {
    const { data } = await api.get('/sessions/search', { params: { q: query } });
    return data;
  },

  async getById(id: string): Promise<Session> {
    const { data } = await api.get(`/sessions/${id}`);
    return data;
  },

  async getReviews(id: string): Promise<Review[]> {
    const { data } = await api.get(`/sessions/${id}/reviews`);
    return data;
  },

  /**
   * Member Actions
   */
  async addReview(id: string, payload: { rating: number; comment?: string }): Promise<Review> {
    const { data } = await api.post(`/sessions/${id}/reviews`, payload);
    return data;
  },

  /**
   * Coach/Admin Management
   */
  async create(payload: CreateSessionDto): Promise<Session> {
    const { data } = await api.post('/sessions', payload);
    return data;
  },

  async update(id: string, payload: UpdateSessionDto): Promise<Session> {
    const { data } = await api.put(`/sessions/${id}`, payload);
    return data;
  },

  async updateStatus(id: string, status: string): Promise<Session> {
    const { data } = await api.patch(`/sessions/${id}/status`, { status });
    return data;
  },

  /**
   * Multipart/Form-Data for Image Upload
   */
  async uploadCover(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const { data } = await api.post(`/sessions/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async getMyCoachSessions(): Promise<Session[]> {
    const { data } = await api.get('/sessions/coach/my-sessions');
    return data;
  },

  /**
   * Admin Only
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/sessions/${id}`);
  }
};

export default SessionService;