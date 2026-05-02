import { api } from "@/lib/api";
import { CreateContentDto, StaticContent, UpdateContentDto } from "@/types/content";


const ContentService = {
  async getPrivacy(): Promise<StaticContent> {
    const { data } = await api.get('/content/privacy');
    return data.data;
  },

  async getTerms(): Promise<StaticContent> {
    const { data } = await api.get('/content/terms');
    return data.data;
  },

  async getByKey(key: string): Promise<StaticContent> {
    const { data } = await api.get(`/content/${key}`);
    return data.data;
  },

  async getAll(): Promise<StaticContent[]> {
    const { data } = await api.get('/content');
    return data.data ?? [];
  },

  async create(payload: CreateContentDto): Promise<StaticContent> {
    const { data } = await api.post('/content', payload);
    return data.data;
  },

  async update(key: string, payload: UpdateContentDto): Promise<StaticContent> {
    const { data } = await api.put(`/content/${key}`, payload);
    return data.data;
  },

  async delete(key: string): Promise<void> {
    await api.delete(`/content/${key}`);
  }
};

export default ContentService;
