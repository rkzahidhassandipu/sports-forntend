"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import BlogService from "@/services/blog.service";
import type { BlogPost } from "@/types/blog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRandomItems<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BlogCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-36 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-2.5 w-16 bg-muted rounded-full" />
        <div className="h-4 w-3/4 bg-muted rounded-full" />
        <div className="h-3 w-full bg-muted rounded-full" />
        <div className="h-3 w-5/6 bg-muted rounded-full" />
        <div className="flex gap-3 pt-1">
          <div className="h-2.5 w-16 bg-muted rounded-full" />
          <div className="h-2.5 w-12 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function BlogCard({ post }: { post: BlogPost }) {
  const href        = `/blog/${post.slug ?? post.id}`;
  const category    = post.tags?.[0] ?? "General";
  const displayDate = formatDate(post.publishedAt ?? post.createdAt);

  return (
    <Link
      href={href}
      className="group bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl flex flex-col"
    >
      {post.coverImage ? (
        <div className="h-36 overflow-hidden flex-shrink-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-36 bg-muted flex items-center justify-center text-4xl flex-shrink-0 select-none">
          📝
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-2">
          {category}
        </span>

        {/* Title */}
        <h3 className="font-bold text-lg leading-tight mb-2 text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-auto pt-3 border-t border-border">
          {post.author && (
            <>
              <span className="font-medium text-foreground/70">
                {post.author.name ?? "Unknown"}
              </span>
              <span className="opacity-30">·</span>
            </>
          )}
          <span>{displayDate}</span>
          {post.readTime != null && (
            <>
              <span className="opacity-30">·</span>
              <span>{post.readTime} min read</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BlogPosts() {
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ["blog", "random-home"],
    queryFn:  () => BlogService.getPosts({ published: true, limit: 100 }),
    // Safely unwrap { success, data: [...], meta: {} } envelope
    select: (res: any): BlogPost[] => {
      const arr: BlogPost[] =
        Array.isArray(res)       ? res        // already an array
        : Array.isArray(res?.data) ? res.data  // { data: [...] }
        : [];
      return getRandomItems(arr, 4);
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
              Blog
            </span>
            <h2 className="font-black text-[clamp(36px,5vw,56px)] leading-tight text-foreground">
              YOU MIGHT<br />
              <span className="text-primary">ALSO LIKE</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="border border-border text-muted-foreground font-bold text-sm px-5 py-2.5 rounded-xl hover:border-primary/50 hover:text-primary transition-all duration-200 tracking-wide"
          >
            ALL POSTS →
          </Link>
        </div>

        {/* ── Grid ── */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}

          {isError && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              Could not load posts. Please try again later.
            </div>
          )}

          {!isLoading && !isError && posts.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              No posts available yet.
            </div>
          )}

          {!isLoading && !isError && posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}