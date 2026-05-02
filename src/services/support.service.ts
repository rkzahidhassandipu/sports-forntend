import { api } from "@/lib/api";
import {
  CreateTicketDto,
  ReplyTicketDto,
  SupportTicket,
  TicketReply,
  UpdateTicketStatusDto,
} from "@/types/support";

const SupportService = {
  /**
   * Member Actions
   */
  async createTicket(payload: CreateTicketDto): Promise<SupportTicket> {
    const body: Record<string, unknown> = {
      subject: payload.subject,
      message: payload.message,
    };

    // Only include priority if explicitly provided — sending undefined
    // can cause backend validators (e.g. class-validator IsEnum) to 422
    if (payload.priority !== undefined) {
      body.priority = payload.priority;
    }

    const { data } = await api.post("/support", body);
    return data;
  },

  async getMyTickets(): Promise<SupportTicket[]> {
    const { data } = await api.get("/support/my");
    // Unwrap the paginated envelope
    return Array.isArray(data?.data) ? data.data : [];
  },

  async getTicket(
    id: string,
  ): Promise<SupportTicket & { replies: TicketReply[] }> {
    const { data } = await api.get(`/support/${id}`);
    const ticket = data?.data ?? data;
    return {
      ...ticket,
      memberName: ticket.memberName ?? ticket.user?.name,
    };
  },
  async replyToTicket(
    id: string,
    payload: ReplyTicketDto,
  ): Promise<TicketReply> {
    const { data } = await api.post(`/support/${id}/reply`, payload);
    return data;
  },

  async closeTicket(id: string): Promise<void> {
    await api.post(`/support/${id}/close`);
  },

  /**
   * Staff/Admin Management
   */
  async getAllTickets(params?: {
    status?: string;
    priority?: string;
  }): Promise<SupportTicket[]> {
    const { data } = await api.get("/support/admin/all", { params });
    return Array.isArray(data?.data) ? data.data : [];
  },

  async updateStatus(
    id: string,
    payload: UpdateTicketStatusDto,
  ): Promise<SupportTicket> {
    const { data } = await api.patch(`/support/${id}/status`, payload);
    return data;
  },

  async deleteTicket(id: string): Promise<void> {
    await api.delete(`/support/${id}`);
  },
};

export default SupportService;
