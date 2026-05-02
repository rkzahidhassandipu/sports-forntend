"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Activity,
  Camera,
  Save,
  CheckCheck,
  Check,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Loader2,
  Pencil,
  Clock,
  User as UserIcon,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import UserService from "@/services/user.service";
import { ActivityLog } from "@/types/report";
import type {
  AppNotification,
  UpdateProfileDto,
  UpdateUserDto,
  User,
} from "@/types/user";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "profile" | "notifications" | "activity" | "danger";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "profile",       label: "Profile",       icon: UserIcon      },
  { key: "notifications", label: "Notifications", icon: Bell          },
  { key: "activity",      label: "Activity",       icon: Activity      },
  { key: "danger",        label: "Danger Zone",    icon: AlertTriangle },
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely format an ISO date string. Returns fallback on null / invalid date.
 */
function safeFormat(
  dateStr: string | null | undefined,
  fmt: string,
  fallback = "—",
): string {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? fallback : format(d, fmt);
}

/**
 * Safely parse a date field from a form input (HTML date inputs return "YYYY-MM-DD").
 * Returns an ISO string for the backend, or undefined when empty / invalid.
 * Never returns an empty string or "Invalid Date".
 */
function parseDateField(raw: string | null | undefined): string | undefined {
  if (!raw || raw.trim() === "") return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * Remove keys whose value is null, undefined, or empty string before sending
 * to the backend. Zod's .optional() passes `undefined` cleanly; `null` on a
 * field without .nullable() causes a 422.
 */
function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  ) as Partial<T>;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-[#f0f7ec] outline-none focus:border-[#9AD872]/40 transition-colors placeholder-zinc-700";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
        <Icon size={12} className="text-zinc-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
          {label}
        </p>
        <p className="text-sm text-zinc-300 truncate">{value}</p>
      </div>
    </div>
  );
}

function SaveButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9AD872] hover:bg-lime-300 disabled:opacity-50 text-black text-xs font-black uppercase tracking-widest transition-colors"
    >
      {isLoading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Save size={12} />
      )}
      Save Changes
    </button>
  );
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────

function AvatarUploader({
  currentUrl,
  name,
  onUpload,
  isUploading,
}: {
  currentUrl?: string | null;
  name: string;
  onUpload: (file: File) => void;
  isUploading: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const initials =
    (name ?? "?")
      .split(" ")
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="relative w-24 h-24 shrink-0">
      {currentUrl ? (
        <img
          src={currentUrl}
          alt={name}
          className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10"
        />
      ) : (
        <div className="w-24 h-24 rounded-2xl bg-[#9AD872]/10 border-2 border-lime-400/20 flex items-center justify-center">
          <span className="text-2xl font-black text-[#9AD872]">{initials}</span>
        </div>
      )}
      <button
        onClick={() => ref.current?.click()}
        disabled={isUploading}
        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[#9AD872] hover:border-lime-400/30 transition-all"
      >
        {isUploading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Camera size={13} />
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          // Reset so the same file can be re-selected if needed
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────

function DeleteAccountModal({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#f0f7ec]">Delete Account</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
              This permanently deletes your account, bookings, and all
              associated data. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">
            Type <span className="text-rose-400">DELETE</span> to confirm
          </p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-[#f0f7ec] outline-none focus:border-rose-500/40 transition-colors"
            placeholder="DELETE"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={input !== "DELETE" || isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-[#f0f7ec] transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting && <Loader2 size={12} className="animate-spin" />}
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: UserService.getProfile,
  });

  const [basicForm, setBasicForm] = useState<UpdateUserDto>({});
  const [detailForm, setDetailForm] = useState<UpdateProfileDto>({});
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingDetail, setIsEditingDetail] = useState(false);

  const user = userData?.data as User | null | undefined;

  useEffect(() => {
    if (user) {
      setBasicForm({
        name:  user.name,
        email: user.email,
        phone: user.phone ?? "",
        bio:   user.bio   ?? "",
      });
      setDetailForm({
        address:          user.profile?.address          ?? "",
        city:             user.profile?.city             ?? "",
        country:          user.profile?.country          ?? "",
        // Slice to "YYYY-MM-DD" so the date <input type="date"> renders correctly
        dateOfBirth:      user.profile?.dateOfBirth?.slice(0, 10) ?? "",
        gender:           user.profile?.gender           ?? "",
        emergencyContact: user.profile?.emergencyContact ?? "",
      });
    }
  }, [user]);

  // ── Basic info mutation ────────────────────────────────────────────────────
  const { mutate: updateBasic, isPending: isSavingBasic } = useMutation({
    mutationFn: (payload: UpdateUserDto) =>
      UserService.updateBasicInfo(stripEmpty(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated");
      setIsEditingBasic(false);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to update"),
  });

  // ── Detail info mutation ───────────────────────────────────────────────────
  const { mutate: updateDetail, isPending: isSavingDetail } = useMutation({
    mutationFn: (payload: UpdateProfileDto) =>
      UserService.updateDetailedProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Details updated successfully");
      setIsEditingDetail(false);
    },
    onError: (e: any) => {
      console.error("Backend Validation Error:", e?.response?.data);
      const msg =
        Array.isArray(e?.response?.data?.message)
          ? e.response.data.message.join(", ")
          : (e?.response?.data?.message ?? "Validation failed");
      toast.error(msg);
    },
  });

  // ── Avatar mutation ────────────────────────────────────────────────────────
  const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => UserService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Avatar updated");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Upload failed"),
  });

  // ── Handle detail save ─────────────────────────────────────────────────────
  function handleDetailSave() {
    // parseDateField converts "" / null / invalid → undefined (passes Zod optional)
    // stripEmpty removes any remaining undefined / null / "" keys
    const payload = stripEmpty({
      ...detailForm,
      dateOfBirth: parseDateField(detailForm.dateOfBirth),
    }) as UpdateProfileDto;

    updateDetail(payload);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#9AD872]" size={28} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* ── Header card ── */}
      <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <AvatarUploader
            currentUrl={user.avatar}
            name={user.name}
            onUpload={uploadAvatar}
            isUploading={isUploading}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#f0f7ec]">{user.name}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-[#9AD872]/10 border border-lime-400/20 text-[10px] font-black uppercase tracking-widest text-[#9AD872]">
                    {user.role}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest",
                      user.status === "ACTIVE"
                        ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
                    )}
                  >
                    {user.status}
                  </span>
                  {user.emailVerified && (
                    <span className="px-2 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/20 text-[10px] font-black uppercase tracking-widest text-sky-400 flex items-center gap-1">
                      <Check size={9} /> Verified
                    </span>
                  )}
                </div>
              </div>
              {user.lastLoginAt && (
                <p className="text-[10px] text-zinc-700 shrink-0">
                  Last seen{" "}
                  {formatDistanceToNow(new Date(user.lastLoginAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
            {user.bio && (
              <p className="text-xs text-zinc-400 mt-3 leading-relaxed border-t border-white/[0.05] pt-3">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <section className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Basic Info
          </p>
          <button
            onClick={() => setIsEditingBasic((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-[#9AD872] transition-colors"
          >
            <Pencil size={10} />
            {isEditingBasic ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isEditingBasic ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name">
                  <input
                    value={basicForm.name ?? ""}
                    onChange={(e) =>
                      setBasicForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Email">
                  <input
                    value={basicForm.email ?? ""}
                    onChange={(e) =>
                      setBasicForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={basicForm.phone ?? ""}
                    onChange={(e) =>
                      setBasicForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="+880..."
                  />
                </Field>
              </div>
              <Field label="Bio">
                <textarea
                  value={basicForm.bio ?? ""}
                  onChange={(e) =>
                    setBasicForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={3}
                  className={cn(inputCls, "resize-none")}
                  placeholder="Tell us about yourself..."
                />
              </Field>
              <div className="flex justify-end pt-2">
                <SaveButton
                  onClick={() => updateBasic(basicForm)}
                  isLoading={isSavingBasic}
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={UserIcon} label="Name"          value={user.name}  />
              <InfoRow icon={Mail}     label="Email"         value={user.email} />
              <InfoRow icon={Phone}    label="Phone"         value={user.phone ?? "—"} />
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={safeFormat(user.createdAt, "dd MMM yyyy")}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Profile Details ── */}
      <section className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Profile Details
          </p>
          <button
            onClick={() => setIsEditingDetail((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-[#9AD872] transition-colors"
          >
            <Pencil size={10} />
            {isEditingDetail ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isEditingDetail ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Address">
                  <input
                    value={detailForm.address ?? ""}
                    onChange={(e) =>
                      setDetailForm((p) => ({ ...p, address: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="City">
                  <input
                    value={detailForm.city ?? ""}
                    onChange={(e) =>
                      setDetailForm((p) => ({ ...p, city: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Country">
                  <input
                    value={detailForm.country ?? ""}
                    onChange={(e) =>
                      setDetailForm((p) => ({ ...p, country: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Date of Birth">
                  <input
                    type="date"
                    // Always a "YYYY-MM-DD" string or "" — never null — so the
                    // controlled input never gets the React null-value warning.
                    value={detailForm.dateOfBirth?.slice(0, 10) ?? ""}
                    onChange={(e) =>
                      setDetailForm((p) => ({
                        ...p,
                        dateOfBirth: e.target.value, // "YYYY-MM-DD" or ""
                      }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Gender">
                  <select
                    value={detailForm.gender ?? ""}
                    onChange={(e) =>
                      setDetailForm((p) => ({ ...p, gender: e.target.value }))
                    }
                    className={inputCls}
                  >
                    <option value="">Select…</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Emergency Contact">
                  <input
                    value={detailForm.emergencyContact ?? ""}
                    onChange={(e) =>
                      setDetailForm((p) => ({
                        ...p,
                        emergencyContact: e.target.value,
                      }))
                    }
                    className={inputCls}
                    placeholder="+880..."
                  />
                </Field>
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton onClick={handleDetailSave} isLoading={isSavingDetail} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={MapPin}
                label="Address"
                value={user.profile?.address ?? "—"}
              />
              <InfoRow
                icon={MapPin}
                label="City"
                value={user.profile?.city ?? "—"}
              />
              <InfoRow
                icon={MapPin}
                label="Country"
                value={user.profile?.country ?? "—"}
              />
              <InfoRow
                icon={Calendar}
                label="Date of Birth"
                value={safeFormat(user.profile?.dateOfBirth, "dd MMM yyyy")}
              />
              <InfoRow
                icon={UserIcon}
                label="Gender"
                value={user.profile?.gender ?? "—"}
              />
              <InfoRow
                icon={Phone}
                label="Emergency Contact"
                value={user.profile?.emergencyContact ?? "—"}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: UserService.getNotifications,
  });

  const notifications: AppNotification[] = Array.isArray(data)
    ? data
    : ((data as any)?.data ?? []);

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => UserService.markNotificationRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
  });

  const { mutate: markAll, isPending: isMarkingAll } = useMutation({
    mutationFn: UserService.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      toast.success("All marked as read");
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#9AD872]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-600">
          {unreadCount > 0 ? (
            <span className="text-[#9AD872] font-bold">{unreadCount} unread</span>
          ) : (
            "All caught up"
          )}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll()}
            disabled={isMarkingAll}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-[#9AD872] transition-colors disabled:opacity-40"
          >
            {isMarkingAll ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <CheckCheck size={10} />
            )}
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-20 text-center">
          <Bell className="mx-auto mb-3 text-zinc-800" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
            No notifications yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={cn(
                "group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                n.isRead
                  ? "bg-zinc-900/30 border-white/[0.04]"
                  : "bg-zinc-900/60 border-lime-400/10 hover:border-lime-400/20",
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  n.isRead ? "bg-zinc-700" : "bg-[#9AD872]",
                )}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-bold",
                    n.isRead ? "text-zinc-500" : "text-[#f0f7ec]",
                  )}
                >
                  {n.title}
                </p>
                {n.message && (
                  <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                )}
                <p className="text-[10px] text-zinc-700 mt-1.5">
                  {formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {!n.isRead && (
                <Check
                  size={12}
                  className="text-zinc-700 group-hover:text-[#9AD872] transition-colors shrink-0 mt-1"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: UserService.getMyActivity,
  });

  const logs: ActivityLog[] = Array.isArray(data)
    ? data
    : ((data as any)?.data ?? []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#9AD872]" size={28} />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-20 text-center">
        <Activity className="mx-auto mb-3 text-zinc-800" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log, i) => (
        <div
          key={log.id ?? i}
          className="flex items-start gap-4 p-4 bg-zinc-900/30 border border-white/[0.04] rounded-xl"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
            <Clock size={13} className="text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#f0f7ec]">{log.action}</p>
            {log.description && (
              <p className="text-xs text-zinc-600 mt-0.5">{log.description}</p>
            )}
          </div>
          <p className="text-[10px] text-zinc-700 shrink-0">
            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Danger Zone Tab ──────────────────────────────────────────────────────────

function DangerTab() {
  const [showModal, setShowModal] = useState(false);

  const { mutate: deleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: UserService.deleteAccount,
    onSuccess: () => {
      toast.success("Account deleted. Redirecting…");
      setTimeout(() => (window.location.href = "/"), 1500);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to delete account"),
  });

  return (
    <>
      {showModal && (
        <DeleteAccountModal
          isDeleting={isDeleting}
          onConfirm={() => deleteAccount()}
          onCancel={() => setShowModal(false)}
        />
      )}

      <div className="space-y-4">
        <div className="p-5 bg-rose-500/5 border border-rose-500/15 rounded-2xl flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#f0f7ec] flex items-center gap-2">
              <AlertTriangle size={14} className="text-rose-400" />
              Delete Account
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-md">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500 hover:text-[#f0f7ec] transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const TAB_CONTENT: Record<Tab, React.ReactNode> = {
    profile:       <ProfileTab />,
    notifications: <NotificationsTab />,
    activity:      <ActivityTab />,
    danger:        <DangerTab />,
  };

  return (
    <div className="min-h-screen bg-black text-[#f0f7ec]">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
            Account
          </p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            My{" "}
            <span className="text-[#9AD872] underline decoration-zinc-800">
              Profile
            </span>
          </h1>
        </div>

        <div className="flex gap-1 p-1 bg-zinc-900/50 border border-white/[0.05] rounded-2xl">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === key
                  ? key === "danger"
                    ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                    : "bg-zinc-800 border border-white/5 text-[#9AD872]"
                  : "text-zinc-600 hover:text-zinc-400",
              )}
            >
              <Icon size={11} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div>{TAB_CONTENT[activeTab]}</div>
      </div>
    </div>
  );
}