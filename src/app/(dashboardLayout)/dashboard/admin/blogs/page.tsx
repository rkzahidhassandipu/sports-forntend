"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import BlogService from "@/services/blog.service";
import { BlogFilters, BlogPost } from "@/types/blog";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Clock,
  Calendar,
  FileText,
  Globe,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import CreateBlogPopup from "@/components/dashboard/admin/blog/CreateBlogPost";

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Pagination component ─────────────────────────────────────────────────────
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  // Build page number windows: always show first, last, and ±1 around current
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 1;

    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    pages.push(1);
    if (range[0] > 2) pages.push("ellipsis");
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Count info */}
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Showing{" "}
        <span className="text-slate-700">
          {from}–{to}
        </span>{" "}
        of <span className="text-slate-700">{total}</span> manuscripts
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="First page"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((item, idx) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="h-9 w-9 flex items-center justify-center text-slate-300 text-sm font-bold select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-xl text-[11px] font-black uppercase tracking-wide transition-all",
                item === currentPage
                  ? "bg-slate-900 text-white border border-slate-900 shadow-md"
                  : "border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900",
              )}
              aria-label={`Page ${item}`}
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Last page"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type TabKey = "ALL" | "PUBLISHED" | "DRAFT";

// ─── Main Page ────────────────────────────────────────────────────────────────
const LIMIT = 10;

export default function BlogManagementPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Reset to page 1 whenever tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch]);

  // Build filters — only pass `published` when tab is PUBLISHED or DRAFT
  const filters = useMemo<BlogFilters>(
  () => ({
    page: currentPage,
    limit: LIMIT,
    // যদি activeTab 'PUBLISHED' হয় তবে published: true পাঠাবে
    // যদি activeTab 'DRAFT' হয় তবে published: false পাঠাবে
    // যদি 'ALL' হয় তবে এই প্রপার্টি পাঠাবেই না (যাতে সব ডেটা আসে)
    ...(activeTab === "PUBLISHED" && { published: true }),
    ...(activeTab === "DRAFT" && { published: false }),
    ...(debouncedSearch && { search: debouncedSearch }),
  }),
  [activeTab, debouncedSearch, currentPage]
);
  console.log("filters", filters)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["blogs", filters],
    queryFn: () => BlogService.getPosts(filters),
    placeholderData: (previousData) => previousData,
  });

  const posts: BlogPost[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPages: number = meta?.totalPages ?? 1;
  const total: number = meta?.total ?? 0;

  // ── Delete mutation with optimistic update ──────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => BlogService.deletePost(id),
    onMutate: async (id) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["blogs", filters] });

      const previousData = queryClient.getQueryData(["blogs", filters]);

      queryClient.setQueryData(["blogs", filters], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: (old.data as BlogPost[]).filter((p) => p.id !== id),
          meta: old.meta
            ? {
                ...old.meta,
                total: Math.max(0, old.meta.total - 1),
              }
            : old.meta,
        };
      });

      return { previousData };
    },
    onError: (_err, _id, context) => {
      // Roll back on error
      queryClient.setQueryData(["blogs", filters], context?.previousData);
    },
    onSettled: () => {
      // Always refetch after settle so server state is authoritative
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this manuscript?")) return;
    deleteMutation.mutate(id);
  };

  // ── Tab change helper ────────────────────────────────────────────────────────
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchTerm("");
  };

  // ── Tab counts from meta (optional — remove if your API doesn't return them) ─
  // const tabCounts = meta?.counts; // e.g. { all: 120, published: 80, draft: 40 }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-lime-600 font-bold text-[10px] uppercase tracking-[0.3em]">
              <span className="w-8 h-[1px] bg-lime-600" />
              Admin Studio
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Editorial{" "}
              <span className="font-serif italic font-light text-slate-400">
                Archives
              </span>
            </h1>
          </div>

          <button
            onClick={() => setIsPopupOpen(true)}
            className="group flex items-center gap-2 h-14 px-8 bg-slate-950 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-lime-600 transition-all duration-300 shadow-xl shadow-slate-200"
          >
            <Plus
              size={18}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            Write New Entry
          </button>
        </header>

        {/* ── Filters ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Tab switcher */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {(["ALL", "PUBLISHED", "DRAFT"] as TabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "flex-1 py-3 px-5 rounded-xl text-[10px] font-black transition-all tracking-widest uppercase whitespace-nowrap",
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-grow group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-lime-600 transition-colors"
              size={18}
            />
            <input
              type="text"
              value={searchTerm}
              placeholder="Filter by title..."
              className="w-full h-full py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-sm focus:border-lime-500 outline-none transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ── Loading overlay indicator (on refetch, not initial load) ────────── */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-lime-600 uppercase tracking-widest">
            <Loader2 size={12} className="animate-spin" />
            Updating…
          </div>
        )}

        {/* ── Post list ──────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">
                Syncing Manuscripts…
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-24 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-slate-300">
              <FileText size={48} strokeWidth={1} className="mb-4" />
              <p className="font-bold text-sm uppercase tracking-widest">
                No Manuscripts Found
              </p>
              {debouncedSearch && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-[10px] font-bold text-lime-600 uppercase tracking-widest hover:underline"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            posts.map((post: BlogPost) => (
              <article
                key={post.id}
                className="group bg-white border border-slate-200 rounded-3xl p-5 hover:border-slate-400 transition-all flex flex-col md:flex-row items-center gap-6 shadow-sm"
              >
                {/* Cover image or icon */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full rounded-2xl flex items-center justify-center transition-colors",
                        post.published
                          ? "bg-lime-50 text-lime-600"
                          : "bg-slate-50 text-slate-400",
                      )}
                    >
                      {post.published ? (
                        <Globe size={28} />
                      ) : (
                        <FileText size={28} />
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow space-y-2 text-center md:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border",
                        post.published
                          ? "bg-lime-50 text-lime-700 border-lime-100"
                          : "bg-slate-100 text-slate-500 border-slate-200",
                      )}
                    >
                      {post.published ? "Live" : "Draft"}
                    </span>

                    {post.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] bg-slate-50 text-slate-400 px-2 py-1 rounded-lg font-bold uppercase tracking-tighter"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-black tracking-tight text-slate-800 group-hover:text-lime-600 transition-colors truncate">
                    {post.title}
                  </h3>

                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                    <div className="flex items-center gap-1.5">
                      <Eye size={14} />
                      {post.viewCount ?? 0} Views
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {post.readTime ?? 1} Min Read
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(
                        post.publishedAt ?? post.createdAt,
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex-shrink-0">
                  <Link href={`/dashboard/admin/blogs/${post.id}`}>
                    <span className="h-11 w-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                      <Edit3 size={18} />
                    </span>
                  </Link>

                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deleteMutation.isPending}
                    aria-label={`Delete "${post.title}"`}
                    className="h-11 w-11 rounded-xl bg-rose-50 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleteMutation.isPending &&
                    deleteMutation.variables === post.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        {!isLoading && posts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* ── Create popup ─────────────────────────────────────────────────────── */}
      <CreateBlogPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSuccess={() => {
          setIsPopupOpen(false);
          // Go to page 1 and refetch so the new post is visible
          setCurrentPage(1);
          queryClient.invalidateQueries({ queryKey: ["blogs"] });
        }}
      />
    </div>
  );
}