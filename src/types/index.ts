export type UserRole = "user" | "admin" | "coach" | "trainer" | "receptionist";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  joinedAt: string;
  bio?: string;
}

export interface Session {
  id: string;
  title: string;
  sport: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  coach: string;
  coachId: string;
  description: string;
  price: number;
  duration: string;
  timing: string;
  venue: string;
  maxMembers: number;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  status: "Available" | "Filling Fast" | "Full";
  tags: string[];
  icon: string;
  startDate: string;
  location: string;
}

export interface Booking {
  id: string;
  userId: string;
  sessionId: string;
  sessionTitle: string;
  coach: string;
  date: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  paymentMethod: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  sessionId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  icon: string;
}

export interface FitnessRecord {
  id: string;
  userId: string;
  date: string;
  weight: number;
  bmi: number;
  cardio: number;
  strength: number;
  flexibility: number;
  notes: string;
}

export interface DashboardStats {
  totalMembers: number;
  totalBookings: number;
  revenue: number;
  activeSports: number;
  growthPercent: number;
}


export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  timestamp?: string;
}