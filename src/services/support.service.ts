import { api } from "@/lib/api";
import { CreateTicketDto, ReplyTicketDto, SupportTicket, TicketReply, UpdateTicketStatusDto } from "@/types/support";


const SupportService = {
  /**
   * Member Actions
   */
  async createTicket(payload: CreateTicketDto): Promise<SupportTicket> {
    const { data } = await api.post('/support', payload);
    return data;
  },

  async getMyTickets(): Promise<SupportTicket[]> {
    const { data } = await api.get('/support/my');
    return data;
  },

  async getTicket(id: string): Promise<SupportTicket & { replies: TicketReply[] }> {
    const { data } = await api.get(`/support/${id}`);
    return data;
  },

  async replyToTicket(id: string, payload: ReplyTicketDto): Promise<TicketReply> {
    const { data } = await api.post(`/support/${id}/reply`, payload);
    return data;
  },

  async closeTicket(id: string): Promise<void> {
    await api.post(`/support/${id}/close`);
  },

  /**
   * Staff/Admin Management
   */
  async getAllTickets(params?: { status?: string; priority?: string }): Promise<SupportTicket[]> {
    const { data } = await api.get('/support/admin/all', { params });
    return data;
  },

  async updateStatus(id: string, payload: UpdateTicketStatusDto): Promise<SupportTicket> {
    const { data } = await api.patch(`/support/${id}/status`, payload);
    return data;
  },

  async deleteTicket(id: string): Promise<void> {
    await api.delete(`/support/${id}`);
  }
};

export default SupportService;