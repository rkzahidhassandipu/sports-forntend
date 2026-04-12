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
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  STRIPE = "STRIPE",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
}

export enum ReportType {
  FINANCE = "FINANCE",
  ACTIVITY = "ACTIVITY",
  PERFORMANCE = "PERFORMANCE",
  MEMBERSHIP = "MEMBERSHIP",
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