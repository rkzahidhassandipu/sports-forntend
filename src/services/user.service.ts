// src/services/user.service.ts
import { api } from "@/lib/api";
import { ApiResponse } from "@/types";
import { Role, UserStatus } from "@/types/enums";
import { Session } from "@/types/gym";
import { ActivityLog } from "@/types/report";
import {
  UpdateProfileDto,
  UpdateUserDto,
  User,
  UserFilters,
  UserProfile,
} from "@/types/user";

const UserService = {
  // ─────────────────────────────────────────
  // My Profile (Self)
  // ─────────────────────────────────────────

  async getProfile(): Promise<ApiResponse<User>> {
  const { data } = await api.get<ApiResponse<User>>("/users/profile");
  return data;
},

  async updateBasicInfo(payload: UpdateUserDto): Promise<User> {
    const { data } = await api.put("/users/profile", payload);
    return data;
  },

  async updateDetailedProfile(payload: UpdateProfileDto): Promise<UserProfile> {
    const { data } = await api.put("/users/profile/details", payload);
    return data;
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // ─────────────────────────────────────────
  // Notifications & Activity
  // ─────────────────────────────────────────

  async getNotifications(): Promise<Notification[]> {
    const { data } = await api.get("/users/notifications");
    return data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await api.patch(`/users/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.patch("/users/notifications/read-all");
  },

  async getMyActivity(): Promise<ActivityLog[]> {
    const { data } = await api.get("/users/activity");
    return data;
  },

  // ─────────────────────────────────────────
  // Admin / Staff — Full User CRUD
  // ─────────────────────────────────────────

  /** GET /users — Paginated list with optional filters */
  async getAll(): Promise<Session[]> {
  const { data } = await api.get<ApiResponse<Session[]>>('/sessions');
  return data.data;
},

  /** GET /users/:id */
  async getUserById(id: string): Promise<User> {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  /** PUT /users/:id — Full profile update by admin */
  async updateUser(id: string, payload: UpdateUserDto): Promise<User> {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  /** PATCH /users/:id/role — Change a user's role */
  async updateUserRole(id: string, role: Role): Promise<User> {
    const { data } = await api.patch(`/users/${id}/role`, { role });
    return data;
  },

  /** PATCH /users/:id/status — Activate, suspend, or deactivate */
  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const { data } = await api.patch(`/users/${id}/status`, { status });
    return data;
  },

  /** DELETE /users/:id — Hard delete (Admin only) */
   async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  /** DELETE /users/me — Self account deletion */
  async deleteAccount(): Promise<void> {
    await api.delete("/users/me");
  },

  
};




export default UserService;
