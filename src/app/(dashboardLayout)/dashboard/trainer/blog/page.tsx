"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BlogService from "@/services/blog.service";
import { BlogPost, CreateBlogDto, UpdateBlogDto } from "@/types/blog";

// ─────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────
function PostModal({
  post,
  onClose,
  onSubmit,
  isLoading,
}: {
  post?: BlogPost | null;
  onClose: () => void;
  onSubmit: (data: CreateBlogDto | UpdateBlogDto) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<CreateBlogDto>({
    title:      post?.title      ?? "",
    content:    post?.content    ?? "",
    excerpt:    post?.excerpt    ?? "",
    coverImage: post?.coverImage ?? "",
    tags:       post?.tags       ?? [],
    published:  post?.published  ?? false,
  });

  const set = (k: keyof CreateBlogDto, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0f1221] border border-[#2a3d22] rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3d22]">
          <h3 className="font-black text-[#f0f7ec] text-lg uppercase tracking-tight">
            {post ? "Edit Post" : "New Post"}
          </h3>
          <button
            onClick={onClose}
            className="text-[#7a9c6e] hover:text-[#0f1a0d] transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a9c6e] block mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Post title..."
              className="w-full bg-[#1c2f17]/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#f0f7ec] placeholder:text-[#7a9c6e] focus:outline-none focus:border-[#9AD872] transition-all"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a9c6e] block mb-1.5">
              Excerpt
            </label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Short description..."
              className="w-full bg-[#1c2f17]/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#f0f7ec] placeholder:text-[#7a9c6e] focus:outline-none focus:border-[#9AD872] transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a9c6e] block mb-1.5">
              Content *
            </label>
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Write your post content..."
              className="w-full bg-[#1c2f17]/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#f0f7ec] placeholder:text-[#7a9c6e] focus:outline-none focus:border-[#9AD872] transition-all resize-none"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a9c6e] block mb-1.5">
              Cover Image URL
            </label>
            <input
              type="text"
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#1c2f17]/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#f0f7ec] placeholder:text-[#7a9c6e] focus:outline-none focus:border-[#9AD872] transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#7a9c6e] block mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={form.tags?.join(", ")}
              onChange={(e) =>
                set(
                  "tags",
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                )
              }
              placeholder="nutrition, training, recovery"
              className="w-full bg-[#1c2f17]/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#f0f7ec] placeholder:text-[#7a9c6e] focus:outline-none focus:border-[#9AD872] transition-all"
            />
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => set("published", !form.published)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                form.published ? "bg-[#9AD872]" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#162513] transition-all ${
                  form.published ? "left-5" : "left-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-[#7a9c6e] group-hover:text-[#0f1a0d] transition-colors">
              Publish immediately
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a3d22] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#7a9c6e] hover:text-[#0f1a0d] hover:bg-[#1c2f17] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={isLoading || !form.title || !form.content}
            className="px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide bg-[#9AD872] text-[#0f1a0d] hover:bg-[#9AD872] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Saving…" : post ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function TrainerBlogManager() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen]     = useState(false);
  const [editPost, setEditPost]       = useState<BlogPost | null>(null);
  const [filter, setFilter]           = useState<"all" | "published" | "draft">("all");

  // ── GET /blog ──
  const { data, isLoading } = useQuery({
    queryKey: ["my-blogs", filter],
    queryFn: () =>
      BlogService.getPosts({
        ...(filter === "published" && { published: true }),
        ...(filter === "draft"     && { published: false }),
      }),
  });

  const posts: BlogPost[] = data?.data ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["my-blogs"] });

  // ── POST /blog ──
  const createMutation = useMutation({
    mutationFn: (dto: CreateBlogDto) => BlogService.createPost(dto),
    onSuccess: () => { invalidate(); setModalOpen(false); },
  });

  // ── PUT /blog/:id ──
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBlogDto }) =>
      BlogService.updatePost(id, dto),
    onSuccess: () => { invalidate(); setModalOpen(false); setEditPost(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => BlogService.deletePost(id),
    onSuccess: invalidate,
  });

  const handleSubmit = (data: CreateBlogDto | UpdateBlogDto) => {
    if (editPost) {
      updateMutation.mutate({ id: editPost.id, dto: data });
    } else {
      createMutation.mutate(data as CreateBlogDto);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditPost(post);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditPost(null);
    setModalOpen(true);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0f1a0d] text-[#f0f7ec] px-6 py-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#9AD872] uppercase mb-1">
            Content Manager
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">
              Creations
            </span>
          </h1>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-[#9AD872] hover:bg-[#9AD872] text-[#0f1a0d] font-black uppercase tracking-widest text-xs rounded-xl transition-all active:scale-95"
        >
          + New Post
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 mb-8">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
              filter === f
                ? "bg-[#9AD872] text-[#0f1a0d]"
                : "bg-[#1c2f17]/60 text-[#7a9c6e] hover:text-[#0f1a0d]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#1c2f17]/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Posts List ── */}
      {!isLoading && (
        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1c2f17] flex items-center justify-center text-3xl mb-4">
                ✍️
              </div>
              <p className="text-[#7a9c6e] font-semibold">No posts yet</p>
              <p className="text-[#7a9c6e] text-sm mt-1">
                Create your first post to get started
              </p>
            </div>
          )}

          {posts.map((post) => (
            <div
              key={post.id}
              className="group flex items-center gap-4 bg-slate-900 border border-[#2a3d22] hover:border-slate-700 rounded-2xl p-5 transition-all"
            >
              {/* Cover thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1c2f17] shrink-0">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">
                    📝
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#f0f7ec] truncate">{post.title}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      post.published
                        ? "bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  {post.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[9px] font-bold text-[#7a9c6e] uppercase tracking-widest"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(post)}
                  className="p-2.5 bg-[#1c2f17] hover:bg-slate-700 rounded-xl transition-all text-sm"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteMutation.mutate(post.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all text-sm disabled:opacity-50"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <PostModal
          post={editPost}
          onClose={() => { setModalOpen(false); setEditPost(null); }}
          onSubmit={handleSubmit}
          isLoading={isMutating}
        />
      )}
    </div>
  );
}