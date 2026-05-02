"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ContentService from "@/services/content.service";
import type {
  StaticContent,
  CreateContentDto,
  UpdateContentDto,
} from "@/types/content";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Section {
  title: string;
  content: string;
}

function parseSections(raw: string): Section[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Section[];
  } catch {}
  return [{ title: "Content", content: raw }];
}

function stringifySections(sections: Section[]): string {
  return JSON.stringify(sections);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#162513] border border-slate-200/60 rounded-[2rem] p-7 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-100 rounded-full w-24" />
          <div className="h-3 bg-slate-100 rounded-full w-48" />
        </div>
        <div className="h-6 bg-slate-100 rounded-full w-16" />
      </div>
      <div className="h-px bg-slate-50" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-3 bg-slate-100 rounded-full"
            style={{ width: `${80 - i * 15}%` }}
          />
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-9 bg-slate-100 rounded-xl w-20" />
        <div className="h-9 bg-slate-100 rounded-xl w-20" />
      </div>
    </div>
  );
}

// ─── Section Editor Row ───────────────────────────────────────────────────────
function SectionRow({
  section,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  section: Section;
  index: number;
  total: number;
  onChange: (i: number, field: keyof Section, val: string) => void;
  onRemove: (i: number) => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
}) {
  return (
    <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-3 group">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-lg bg-lime-100 text-lime-700 text-[10px] font-black flex items-center justify-center flex-shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <input
          value={section.title}
          onChange={(e) => onChange(index, "title", e.target.value)}
          placeholder="Section title..."
          className="flex-1 bg-[#162513] border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-[#9AD872] transition-all"
        />
        {/* Move controls */}
        <div className="flex gap-1">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="w-7 h-7 rounded-lg border border-slate-100 text-[#7a9c6e] hover:text-slate-700 hover:bg-[#162513] transition-all disabled:opacity-30 flex items-center justify-center text-xs"
          >
            ↑
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="w-7 h-7 rounded-lg border border-slate-100 text-[#7a9c6e] hover:text-slate-700 hover:bg-[#162513] transition-all disabled:opacity-30 flex items-center justify-center text-xs"
          >
            ↓
          </button>
          <button
            onClick={() => onRemove(index)}
            className="w-7 h-7 rounded-lg border border-rose-100 text-rose-400 hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      </div>
      <textarea
        value={section.content}
        onChange={(e) => onChange(index, "content", e.target.value)}
        placeholder="Section content..."
        rows={3}
        className="w-full bg-[#162513] border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-[#9AD872] transition-all resize-none leading-relaxed"
      />
    </div>
  );
}

// ─── Content Modal (Create / Edit) ───────────────────────────────────────────
function ContentModal({
  mode,
  initial,
  onClose,
  onSave,
  isSaving,
}: {
  mode: "create" | "edit";
  initial?: StaticContent;
  onClose: () => void;
  onSave: (key: string, payload: CreateContentDto | UpdateContentDto) => void;
  isSaving: boolean;
}) {
  const [key, setKey] = useState(initial?.key ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [sections, setSections] = useState<Section[]>(
    initial ? parseSections(initial.content) : [{ title: "", content: "" }],
  );

  function handleSectionChange(i: number, field: keyof Section, val: string) {
    setSections((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );
  }
  function handleAddSection() {
    setSections((prev) => [...prev, { title: "", content: "" }]);
  }
  function handleRemoveSection(i: number) {
    setSections((prev) => prev.filter((_, idx) => idx !== i));
  }
  function handleMoveUp(i: number) {
    if (i === 0) return;
    setSections((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }
  function handleMoveDown(i: number) {
    setSections((prev) => {
      if (i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }

  function handleSubmit() {
  if (!title.trim() || sections.length === 0) return;
  const payload =
    mode === "create"
      ? {
          key: key.trim().toLowerCase().replace(/\s+/g, "-"),
          title: title.trim(),
          content: stringifySections(sections),
          isActive,
        }
      : {
          title: title.trim(),
          content: stringifySections(sections),
          isActive,
        };
  onSave(initial?.key ?? key, payload as CreateContentDto | UpdateContentDto);
}

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#162513] rounded-[2rem] border border-slate-200/60 shadow-2xl /60 w-full max-w-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {mode === "create" ? "Create Content" : "Edit Content"}
            </h2>
            <p className="text-xs text-[#7a9c6e] font-medium mt-0.5">
              {mode === "create"
                ? "Add a new static content entry"
                : `Editing: ${initial?.key}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-100 text-[#7a9c6e] hover:text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-8 py-6 space-y-5">
          {/* Key (create only) */}
          {mode === "create" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">
                Key <span className="text-rose-400">*</span>
              </label>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. privacy, terms, about"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-[#9AD872] transition-all font-mono"
              />
              <p className="text-[10px] text-[#7a9c6e]">
                Unique identifier used in API URL — lowercase, no spaces
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Privacy Policy"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-[#9AD872] transition-all"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-700">Active</p>
              <p className="text-[10px] text-[#7a9c6e]">
                Visible to public users
              </p>
            </div>
            <button
              onClick={() => setIsActive((v) => !v)}
              className={cn(
                "w-11 h-6 rounded-full transition-all duration-200 relative",
                isActive ? "bg-[#9AD872]" : "bg-slate-200",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-5 h-5 bg-[#162513] rounded-full shadow transition-all duration-200",
                  isActive ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">
                Sections ({sections.length})
              </label>
              <button
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-xl bg-lime-50 border border-lime-100 text-lime-700 text-[10px] font-black uppercase tracking-widest hover:bg-lime-100 transition-all"
              >
                + Add Section
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {sections.map((s, i) => (
                <SectionRow
                  key={i}
                  section={s}
                  index={i}
                  total={sections.length}
                  onChange={handleSectionChange}
                  onRemove={handleRemoveSection}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-slate-100 text-sm font-bold text-[#7a9c6e] hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !title.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#162513] text-[#f0f7ec] text-sm font-bold hover:bg-[#0f1a0d] transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {mode === "create" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({
  contentKey,
  onClose,
  onConfirm,
  isDeleting,
}: {
  contentKey: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-[#162513] rounded-[2rem] border border-slate-200/60 shadow-2xl w-full max-w-sm p-8 space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl">
          🗑
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Delete Content?</h2>
          <p className="text-sm text-[#7a9c6e] mt-1">
            <span className="font-bold text-slate-700 font-mono">
              "{contentKey}"
            </span>{" "}
            will be permanently deleted. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-100 text-sm font-bold text-[#7a9c6e] hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-[#f0f7ec] text-sm font-bold hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Content Card ─────────────────────────────────────────────────────────────
function ContentCard({
  item,
  onEdit,
  onDelete,
}: {
  item: StaticContent;
  onEdit: (item: StaticContent) => void;
  onDelete: (item: StaticContent) => void;
}) {
  const sections = parseSections(item.content);

  return (
    <div className="group bg-[#162513] border border-slate-200/60 rounded-[2rem] overflow-hidden hover:shadow-xl hover:/40 transition-all duration-300">
      <div className="p-7 space-y-5">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#7a9c6e] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                /{item.key}
              </span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest",
                  item.isActive
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-[#7a9c6e] border-slate-200",
                )}
              >
                {item.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-lime-600 transition-colors leading-tight">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Sections preview */}
        <div className="space-y-1.5 py-4 border-y border-slate-50">
          <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest mb-2">
            {sections.length} Section{sections.length !== 1 ? "s" : ""}
          </p>
          {sections.slice(0, 4).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9AD872] flex-shrink-0" />
              <p className="text-xs text-[#7a9c6e] font-medium truncate">
                {s.title || "Untitled section"}
              </p>
            </div>
          ))}
          {sections.length > 4 && (
            <p className="text-[10px] text-[#7a9c6e] pl-3.5">
              +{sections.length - 4} more
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">
              Updated
            </p>
            <p className="text-xs font-bold text-[#7a9c6e] mt-0.5">
              {new Date(item.updatedAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">
              Created
            </p>
            <p className="text-xs font-bold text-[#7a9c6e] mt-0.5">
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-[#f0f7ec] text-[10px] font-black uppercase tracking-widest hover:bg-[#9AD872] hover:text-[#0f1a0d] transition-all active:scale-95"
          >
            Edit Content
          </button>
          <button
            onClick={() => onDelete(item)}
            className="px-4 py-2.5 rounded-xl border border-rose-100 text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageContentPage() {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<
    | { type: "create" }
    | { type: "edit"; item: StaticContent }
    | { type: "delete"; item: StaticContent }
    | null
  >(null);

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
  data: contents = [],
  isLoading,
  isError,
  refetch,
} = useQuery<StaticContent[]>({
  queryKey: ["content", "all"],
  queryFn: () => ContentService.getAll(), 
});

  // ── Create ─────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: CreateContentDto) => ContentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setModal(null);
    },
    onError: (err: unknown) => console.error("Create failed:", err), // ✅ যোগ করুন
  });

  const updateMutation = useMutation({
    mutationFn: ({
      key,
      payload,
    }: {
      key: string;
      payload: UpdateContentDto;
    }) => ContentService.update(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setModal(null);
    },
    onError: (err: unknown) => console.error("Update failed:", err), // ✅ যোগ করুন
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => ContentService.delete(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setModal(null);
    },
    onError: (err: unknown) => console.error("Delete failed:", err), // ✅ যোগ করুন
  });

  function handleSave(
    key: string,
    payload: CreateContentDto | UpdateContentDto,
  ) {
    if (modal?.type === "create") {
      createMutation.mutate(payload as CreateContentDto);
    } else {
      updateMutation.mutate({ key, payload: payload as UpdateContentDto });
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8fafc] min-h-screen text-slate-900">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Static <span className="text-lime-600">Content</span>
          </h1>
          <p className="text-[#7a9c6e] text-sm mt-1 font-medium italic">
            Manage Privacy Policy, Terms of Service, and other static pages.
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="px-6 py-3 bg-[#162513] text-[#f0f7ec] hover:bg-[#0f1a0d] rounded-2xl text-sm font-bold transition-all shadow-lg  flex items-center gap-2 active:scale-95"
        >
          <span className="text-lg">+</span> Create Content
        </button>
      </header>

      {/* Stat bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Pages", value: contents.length },
          {
            label: "Active",
            value: contents?.filter((c) => c.isActive).length,
            accent: "text-emerald-600",
          },
          {
            label: "Inactive",
            value: contents?.filter((c) => !c.isActive).length,
            accent: "text-[#7a9c6e]",
          },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="bg-[#162513] border border-slate-200/60 rounded-2xl p-5 space-y-1 shadow-sm"
          >
            <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">
              {label}
            </p>
            <p
              className={cn("text-2xl font-black", accent ?? "text-slate-900")}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {(createMutation.isError ||
        updateMutation.isError ||
        deleteMutation.isError) && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-6 py-4">
          <p className="text-sm font-medium text-rose-600">
            ✕ Operation failed. Please try again.
          </p>
        </div>
      )}


      {/* Error */}
      {isError && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-2xl px-6 py-4">
          <p className="text-sm font-medium text-rose-600">
            ✕ Failed to load content.
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
        ) : contents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-2xl">
              📄
            </div>
            <p className="text-base font-black text-slate-700">
              No content yet
            </p>
            <p className="text-xs text-[#7a9c6e] max-w-xs">
              Create your first static content entry like a Privacy Policy or
              Terms of Service.
            </p>
            <button
              onClick={() => setModal({ type: "create" })}
              className="mt-2 px-5 py-2.5 rounded-2xl bg-[#162513] text-[#f0f7ec] text-xs font-black uppercase tracking-widest hover:bg-[#9AD872] hover:text-[#0f1a0d] transition-all"
            >
              + Create First Content
            </button>
          </div>
        ) : (
          contents.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onEdit={(i) => setModal({ type: "edit", item: i })}
              onDelete={(i) => setModal({ type: "delete", item: i })}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {(modal?.type === "create" || modal?.type === "edit") && (
        <ContentModal
          mode={modal.type}
          initial={modal.type === "edit" ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteModal
          contentKey={modal.item.key}
          onClose={() => setModal(null)}
          onConfirm={() => deleteMutation.mutate(modal.item.key)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
