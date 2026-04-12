import { api } from "@/lib/api";
import { NewsletterActionDto, NewsletterSubscriber, SubscribeResponse } from "@/types/newsletter";


const NewsletterService = {
  /**
   * Public Actions
   */
  async subscribe(payload: NewsletterActionDto): Promise<SubscribeResponse> {
    // Note: Backend applies publicRateLimit here
    const { data } = await api.post('/newsletter/subscribe', payload);
    return data;
  },

  async confirm(token: string): Promise<{ message: string }> {
    const { data } = await api.get('/newsletter/confirm', { 
      params: { token } 
    });
    return data;
  },

  async unsubscribe(payload: NewsletterActionDto): Promise<{ message: string }> {
    const { data } = await api.post('/newsletter/unsubscribe', payload);
    return data;
  },

  /**
   * Admin Actions (Requires Auth + Admin Role)
   */
  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    const { data } = await api.get('/newsletter/list');
    return data;
  }
};

export default NewsletterService;