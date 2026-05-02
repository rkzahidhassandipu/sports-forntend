// src/types/support.ts
import { TicketStatus, TicketPriority } from './enums';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: TicketReply[];
  user?: { name: string; email: string };
  memberName?: string | null;  // ✅ add this
}

export interface TicketReply {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  isStaff: boolean; 
  createdAt: string;
  authorName?: string | null;
}

export interface CreateTicketDto {
  subject: string;
  message: string;
  priority?: TicketPriority;
}

export interface ReplyTicketDto {
  message: string;
}

export interface UpdateTicketStatusDto {
  status: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
}