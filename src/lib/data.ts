// src/lib/data.ts
// Static mock data used for UI display ONLY (not sent to the API).
// These use extended display-oriented shapes that include fields like
// `sport`, `coach`, `venue`, `timing`, etc. which are denormalized for
// the public-facing session pages. Real API calls use the proper types
// from @/types/gym, @/types/blog etc.

// ─── Display-oriented types (mock data only) ─────────────────────────────────

export interface MockSession {
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

export interface MockBooking {
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

export interface MockBlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  icon: string;
}

export interface MockFitnessRecord {
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

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "coach" | "trainer" | "receptionist";
  avatar?: string;
  joinedAt: string;
  bio?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const SESSIONS: MockSession[] = [
  { id: "1", title: "Pro Football Training", sport: "Football", level: "Beginner", coach: "Sohel Rahman", coachId: "c1", description: "Master dribbling, passing, and tactical gameplay with a former national team player.", price: 1200, duration: "8 Weeks", timing: "Sat, Mon, Wed — 7:00 AM", venue: "FIFA Pitch — Block B", maxMembers: 16, enrolledCount: 12, rating: 4.9, reviewCount: 128, status: "Filling Fast", tags: ["Football", "Beginner"], icon: "⚽", startDate: "May 1, 2026", location: "Mirpur, Dhaka" },
  { id: "2", title: "Competitive Swimming", sport: "Swimming", level: "All Levels", coach: "Karim Hossain", coachId: "c2", description: "Olympic-standard pool training with certified coaches. All stroke techniques covered.", price: 1500, duration: "6 Weeks", timing: "Daily — 6:00 AM or 4:00 PM", venue: "Olympic Pool — Block A", maxMembers: 12, enrolledCount: 8, rating: 4.7, reviewCount: 94, status: "Available", tags: ["Swimming", "All Levels"], icon: "🏊", startDate: "Apr 20, 2026", location: "Gulshan, Dhaka" },
  { id: "3", title: "Strength & Conditioning", sport: "Fitness", level: "Advanced", coach: "Nadia Islam", coachId: "c3", description: "Build explosive power and endurance with a structured 6-week strength program.", price: 2000, duration: "6 Weeks", timing: "Mon, Wed, Fri — 6:00 PM", venue: "Weights Room — Block C", maxMembers: 10, enrolledCount: 10, rating: 5.0, reviewCount: 61, status: "Full", tags: ["Fitness", "Advanced"], icon: "🏋️", startDate: "May 5, 2026", location: "Dhanmondi, Dhaka" },
  { id: "4", title: "Combat Boxing Bootcamp", sport: "Boxing", level: "Intermediate", coach: "Jalal Ahmed", coachId: "c4", description: "High-intensity boxing fundamentals for fitness, discipline, and self-defense.", price: 1800, duration: "8 Weeks", timing: "Tue, Thu — 7:00 PM", venue: "Combat Ring — Block D", maxMembers: 14, enrolledCount: 9, rating: 4.8, reviewCount: 77, status: "Available", tags: ["Boxing", "Intermediate"], icon: "🥊", startDate: "Apr 25, 2026", location: "Banani, Dhaka" },
  { id: "5", title: "Basketball Drills Camp", sport: "Basketball", level: "Intermediate", coach: "Tariq Miah", coachId: "c5", description: "Improve shooting accuracy, defensive positioning, and court vision.", price: 1400, duration: "6 Weeks", timing: "Sat, Mon — 5:00 PM", venue: "Indoor Court — Block B", maxMembers: 18, enrolledCount: 11, rating: 4.6, reviewCount: 53, status: "Available", tags: ["Basketball", "Intermediate"], icon: "🏀", startDate: "May 2, 2026", location: "Mirpur, Dhaka" },
  { id: "6", title: "Tennis Fundamentals", sport: "Tennis", level: "All Levels", coach: "Tahmid Chowdhury", coachId: "c6", description: "Serve, volley, and strategy with a certified national-level tennis coach.", price: 1600, duration: "8 Weeks", timing: "Wed, Sun — 7:00 AM", venue: "Tennis Courts — Block E", maxMembers: 8, enrolledCount: 5, rating: 4.9, reviewCount: 42, status: "Available", tags: ["Tennis", "All Levels"], icon: "🎾", startDate: "Apr 28, 2026", location: "Gulshan, Dhaka" },
  { id: "7", title: "Badminton Smash Pro", sport: "Badminton", level: "Intermediate", coach: "Rifat Kamal", coachId: "c7", description: "Master smash, drop shots, and net play with focused drill sessions.", price: 1100, duration: "4 Weeks", timing: "Tue, Fri — 6:00 PM", venue: "Indoor Badminton Hall", maxMembers: 16, enrolledCount: 7, rating: 4.5, reviewCount: 38, status: "Available", tags: ["Badminton", "Intermediate"], icon: "🏸", startDate: "May 6, 2026", location: "Dhanmondi, Dhaka" },
  { id: "8", title: "Youth Gymnastics Program", sport: "Gymnastics", level: "Beginner", coach: "Shirin Akter", coachId: "c8", description: "Build flexibility, balance, and body awareness. Ages 8–16 welcome.", price: 1300, duration: "8 Weeks", timing: "Sat — 10:00 AM", venue: "Gymnastics Studio — Block F", maxMembers: 12, enrolledCount: 6, rating: 4.8, reviewCount: 29, status: "Available", tags: ["Gymnastics", "Beginner"], icon: "🤸", startDate: "May 3, 2026", location: "Banani, Dhaka" },
];

export const BOOKINGS: MockBooking[] = [
  { id: "b1", userId: "u1", sessionId: "1", sessionTitle: "Pro Football Training", coach: "Sohel Rahman", date: "Apr 8, 2026", amount: 1200, status: "confirmed", paymentMethod: "bKash" },
  { id: "b2", userId: "u1", sessionId: "2", sessionTitle: "Competitive Swimming", coach: "Karim Hossain", date: "Apr 5, 2026", amount: 1500, status: "confirmed", paymentMethod: "Card" },
  { id: "b3", userId: "u1", sessionId: "4", sessionTitle: "Combat Boxing Bootcamp", coach: "Jalal Ahmed", date: "Mar 28, 2026", amount: 1800, status: "completed", paymentMethod: "Nagad" },
];

export const BLOG_POSTS: MockBlogPost[] = [
  { id: "1", title: "5 Drills to Boost Your Football IQ", category: "Football", author: "Sohel Rahman", date: "Apr 8, 2026", readTime: "4 min read", excerpt: "From positional awareness to quick decision-making under pressure — these drills will sharpen your game.", icon: "⚽" },
  { id: "2", title: "Swimming Techniques for Beginners", category: "Swimming", author: "Karim Hossain", date: "Apr 2, 2026", readTime: "5 min read", excerpt: "Master the freestyle stroke with proper breathing technique and body rotation for maximum efficiency.", icon: "🏊" },
  { id: "3", title: "Building a Strength Foundation", category: "Fitness", author: "Nadia Islam", date: "Mar 25, 2026", readTime: "6 min read", excerpt: "Compound movements, progressive overload, and recovery — the three pillars every athlete must master.", icon: "🏋️" },
  { id: "4", title: "Boxing Footwork Essentials", category: "Boxing", author: "Jalal Ahmed", date: "Mar 18, 2026", readTime: "3 min read", excerpt: "Great boxers are made in the feet. Learn the four core footwork patterns used by world-class fighters.", icon: "🥊" },
];

export const SPORTS_CATEGORIES = [
  { name: "Football",    icon: "⚽", count: 12 },
  { name: "Swimming",    icon: "🏊", count: 8  },
  { name: "Boxing",      icon: "🥊", count: 15 },
  { name: "Basketball",  icon: "🏀", count: 10 },
  { name: "Tennis",      icon: "🎾", count: 6  },
  { name: "Gymnastics",  icon: "🤸", count: 4  },
];
