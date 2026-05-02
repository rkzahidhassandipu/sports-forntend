// src/types/user.ts
import { Role, UserStatus } from "./enums";

/**
 * The core User entity as returned from the database.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt?: string | null; // ISO Date string
  avatar?: string | null;
  phone?: string | null;
  bio?: string | null;
  role: Role;
  status: UserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Optional relations (usually populated via Prisma 'include')
  profile?: UserProfile | null;
  _count?: UserCount;
}

/**
 * Detailed profile information for a user.
 */
export interface UserProfile {
  id: string;
  userId: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  dateOfBirth?: string | null; // ISO Date string
  gender?: string | null;
  emergencyContact?: string | null;
  membershipExpiry?: string | null;
  specializations: string[];
  certifications: string[];
  socialLinks?: Record<string, any> | null; // Mapping Prisma Json
  createdAt: string;
  updatedAt: string;
}

/**
 * Aggregated relation counts (Prisma _count)
 */
export interface UserCount {
  sessions: number;
  bookings: number;
  payments: number;
  reviews: number;
  notifications: number;
  blogPosts: number;
}

/**
 * External social auth accounts (Google, GitHub, etc.)
 */
export interface SocialAccount {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  createdAt: string;
}

export interface UserFilters {
  role?: Role;
  status?: UserStatus;
  search?: string; // For filtering by name or email
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  [key: string]: unknown; 
}

export interface UpdateProfileDto {
  address?: string | null;
  city?: string | null;
  country?: string | null;
  dateOfBirth?: string | null; // Send as ISO string
  gender?: string | null;
  emergencyContact?: string | null;
  
  // Specific to Coaches/Trainers
  specializations?: string[];
  certifications?: string[];
  
  // Social link JSON
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string | null;
  link?: string | null;
  createdAt: string;
}