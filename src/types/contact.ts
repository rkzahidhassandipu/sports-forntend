// src/types/contact.ts

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  repliedAt?: string | null;
  createdAt: string;
}

export interface SubmitContactDto {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactFilters {
  isRead?: boolean;
  page?: number;
  limit?: number;
}
