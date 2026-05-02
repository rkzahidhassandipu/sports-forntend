"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import BlogService from "@/services/blog.service";
import type { BlogPost, BlogFilters } from "@/types/blog";

// ─── Query key factory ────────────────────────────────────────────────────────

export const blogKeys = {
  all: ["blog"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (filters: BlogFilters) => [...blogKeys.lists(), filters] as const,
  detail: (slugOrId: string) => [...blogKeys.all, "detail", slugOrId] as const,
};

// ─── Constants ────────────────────────────────────────────────────────────────

const LIMIT = 9;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useState(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  });
  return debounced;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
      {children}
    </span>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-40 bg-brand-mid" />
      <div className="p-5 space-y-3">
        <div className="h-2.5 w-16 bg-brand-border rounded-full" />
        <div className="h-4 w-3/4 bg-brand-border rounded-full" />
        <div className="h-3 w-full bg-brand-border rounded-full" />
        <div className="h-3 w-5/6 bg-brand-border rounded-full" />
        <div className="flex gap-3 pt-1">
          <div className="h-2.5 w-20 bg-brand-border rounded-full" />
          <div className="h-2.5 w-16 bg-brand-border rounded-full" />
        </div>
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const href = `/blog/${post.slug ?? post.id}`;
  const category = post.tags?.[0] ?? "General";
  const displayDate = formatDate(post.publishedAt ?? post.createdAt);

  return (
    <Link
      href={href}
      className="group bg-brand-card border border-brand-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#9AD872]/30 hover:shadow-xl hover:shadow-lime-500/5 flex flex-col"
    >
      {post.coverImage ? (
        <div className="h-40 overflow-hidden flex-shrink-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-brand-card to-brand-mid flex items-center justify-center text-4xl flex-shrink-0 select-none">
          📝
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-[10px] font-bold text-teal-500 tracking-widest uppercase">
            {category}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg leading-tight mb-2 group-hover:text-[#9AD872] transition-colors duration-200 line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-auto pt-3 border-t border-brand-border/50">
          {post.author && (
            <>
              <span className="font-medium text-foreground/70">
                {post.author.name ?? post.author.email}
              </span>
              <span className="text-brand-border">·</span>
            </>
          )}
          <span>{displayDate}</span>
          {post.readTime != null && (
            <>
              <span className="text-brand-border">·</span>
              <span>{post.readTime} min read</span>
            </>
          )}
          {post.viewCount > 0 && (
            <>
              <span className="text-brand-border">·</span>
              <span>{post.viewCount.toLocaleString()} views</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-5xl">📭</span>
      <p className="text-muted-foreground text-sm">
        {query ? `No posts found for "${query}".` : "No posts here yet. Check back soon."}
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-5xl">⚠️</span>
      <p className="text-muted-foreground text-sm">Failed to load posts.</p>
      <button
        onClick={onRetry}
        className="border border-brand-border text-muted-foreground font-display font-bold text-xs px-4 py-2 rounded-lg hover:border-[#9AD872]/50 hover:text-[#9AD872] transition-all duration-200 tracking-wide"
      >
        RETRY
      </button>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 text-xs font-bold font-display tracking-widest border border-brand-border rounded-lg disabled:opacity-30 hover:border-[#9AD872]/50 hover:text-[#9AD872] transition-all duration-200 disabled:pointer-events-none"
      >
        ← PREV
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 text-xs font-bold font-display rounded-lg border transition-all duration-200 ${
            p === page
              ? "border-[#9AD872] bg-[#9AD872]/10 text-[#9AD872]"
              : "border-brand-border text-muted-foreground hover:border-[#9AD872]/50 hover:text-[#9AD872]"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 text-xs font-bold font-display tracking-widest border border-brand-border rounded-lg disabled:opacity-30 hover:border-[#9AD872]/50 hover:text-[#9AD872] transition-all duration-200 disabled:pointer-events-none"
      >
        NEXT →
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 400);

  const filters: BlogFilters = {
    page,
    limit: LIMIT,
    published: true,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: blogKeys.list(filters),
    queryFn: () => BlogService.getPosts(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });

  const posts: BlogPost[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? meta?.lastPage ?? 1;

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchInput(e.target.value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-brand-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-12">
          <SectionTag>Blog</SectionTag>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-display font-black text-[clamp(40px,6vw,72px)] leading-tight">
              ALL POSTS FROM<br />
              <span className="text-[#9AD872]">THE CLUB</span>
            </h1>
            <Link
              href="/"
              className="border border-brand-border text-muted-foreground font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:border-[#9AD872]/50 hover:text-[#9AD872] transition-all duration-200 tracking-wide"
            >
              ← HOME
            </Link>
          </div>
        </div>

        {/* ── Search bar ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchInput}
              onChange={handleSearch}
              className="w-full bg-brand-card border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#9AD872]/50 transition-colors duration-200"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {meta?.total != null && (
            <div className="sm:ml-auto flex items-center text-xs text-muted-foreground">
              <span className="text-[#9AD872] font-bold mr-1">{meta.total}</span>
              {meta.total === 1 ? "post" : "posts"}
            </div>
          )}
        </div>

        {/* ── Grid ───────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[400px]">
          {isLoading && Array.from({ length: LIMIT }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}

          {isError && <ErrorState onRetry={refetch} />}

          {!isLoading && !isError && posts.length === 0 && (
            <EmptyState query={debouncedSearch} />
          )}

          {!isLoading && !isError && posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {!isLoading && !isError && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </main>
  );
}