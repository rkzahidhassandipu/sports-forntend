// src/services/contact.service.ts
import { api } from "@/lib/api";
import { ApiResponse } from "@/types";
import { ContactFilters, ContactForm, SubmitContactDto } from "@/types/contact";


const ContactService = {
  /**
   * Public Action
   * Note: This route is rate-limited on the backend.
   */
  async submit(payload: SubmitContactDto): Promise<{ message: string }> {
    const { data } = await api.post('/contact', payload);
    return data;
  },

  /**
   * Staff/Admin Management
   */
  async getAll(params?: ContactFilters): Promise<ApiResponse<ContactForm[]>> {
  const { data } = await api.get<ApiResponse<ContactForm[]>>('/contact', { params });
  return data;
},

  async getById(id: string): Promise<ContactForm> {
    const { data } = await api.get(`/contact/${id}`);
    return data;
  },

  async markAsRead(id: string): Promise<ContactForm> {
    const { data } = await api.patch(`/contact/${id}/read`);
    return data;
  },

  /**
   * Admin-only Action
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/contact/${id}`);
  }
};

export default ContactService;
