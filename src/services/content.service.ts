import { api } from "@/lib/api";
import { CreateContentDto, StaticContent, UpdateContentDto } from "@/types/content";


const ContentService = {
  /**
   * Public Access
   */
  async getPrivacy(): Promise<StaticContent> {
    const { data } = await api.get('/content/privacy');
    return data;
  },

  async getTerms(): Promise<StaticContent> {
    const { data } = await api.get('/content/terms');
    return data;
  },

  async getByKey(key: string): Promise<StaticContent> {
    const { data } = await api.get(`/content/${key}`);
    return data;
  },

  /**
   * Admin Management (Requires Auth + Admin Role)
   */
  async getAll(): Promise<StaticContent[]> {
    const { data } = await api.get('/content');
    return data;
  },

  async create(payload: CreateContentDto): Promise<StaticContent> {
    const { data } = await api.post('/content', payload);
    return data;
  },

  async update(key: string, payload: UpdateContentDto): Promise<StaticContent> {
    const { data } = await api.put(`/content/${key}`, payload);
    return data;
  },

  async delete(key: string): Promise<void> {
    await api.delete(`/content/${key}`);
  }
};

export default ContentService;