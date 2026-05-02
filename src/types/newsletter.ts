// src/types/newsletter.ts

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string | null;
  isActive: boolean;
  confirmedAt?: string | null;
  createdAt: string;
}

export interface NewsletterActionDto {
  email: string;
  name?: string;
}

export interface SubscribeResponse {
  message: string;
}

// Matches ApiResponse.paginated envelope:
// { success, message, data, meta: { page, limit, total, totalPages } }
export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}