// src/services/newsletter.service.ts
import { api } from "@/lib/api";
import {
  NewsletterActionDto,
  NewsletterSubscriber,
  SubscribeResponse,
  PaginatedResponse,
} from "@/types/newsletter";

const NewsletterService = {
  /**
   * Public Actions
   */
  async subscribe(payload: NewsletterActionDto): Promise<SubscribeResponse> {
    const { data } = await api.post("/newsletter/subscribe", payload);
    return data;
  },

  async confirm(token: string): Promise<{ message: string }> {
    const { data } = await api.get("/newsletter/confirm", {
      params: { token },
    });
    return data;
  },

  async unsubscribe(payload: NewsletterActionDto): Promise<{ message: string }> {
    const { data } = await api.post("/newsletter/unsubscribe", payload);
    return data;
  },

  /**
   * Admin Actions (Requires Auth + Admin Role)
   * Backend returns ApiResponse.paginated envelope:
   * { success, message, data: [...], meta: { page, limit, total, totalPages } }
   */
  async getSubscribers(
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<NewsletterSubscriber>> {
    const { data } = await api.get("/newsletter/list", {
      params: { page, limit },
    });
    // Unwrap the ApiResponse envelope → { data: [...], meta: {...} }
    return {
      data: data.data,
      meta: data.meta,
    };
  },
};

export default NewsletterService;