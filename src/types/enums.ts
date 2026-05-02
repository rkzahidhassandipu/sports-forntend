// src/types/enums.ts

export enum Role {
  ADMIN = "ADMIN",
  COACH = "COACH",
  TRAINER = "TRAINER",
  RECEPTIONIST = "RECEPTIONIST",
  MEMBER = "MEMBER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

export enum SessionStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  SCHEDULED = "SCHEDULED",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  STRIPE = "STRIPE",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum BookingStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum ReportType {
  REVENUE = "REVENUE",
  BOOKINGS = "BOOKINGS",
  MEMBERS = "MEMBERS",
}

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}