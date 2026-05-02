"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import BlogService from "@/services/blog.service";
import type { BlogPost } from "@/types/blog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Query key ────────────────────────────────────────────────────────────────

export const randomBlogKeys = {
  random: ["blog", "random"] as const,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function BlogCardSkeleton() {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-36 bg-brand-mid" />
      <div className="p-5 space-y-3">
        <div className="h-2.5 w-16 bg-brand-border rounded-full" />
        <div className="h-4 w-3/4 bg-brand-border rounded-full" />
        <div className="h-3 w-full bg-brand-border rounded-full" />
        <div className="h-3 w-5/6 bg-brand-border rounded-full" />
        <div className="flex gap-3 pt-1">
          <div className="h-2.5 w-16 bg-brand-border rounded-full" />
          <div className="h-2.5 w-12 bg-brand-border rounded-full" />
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
        <div className="h-36 overflow-hidden flex-shrink-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-brand-card to-brand-mid flex items-center justify-center text-4xl flex-shrink-0 select-none">
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
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BlogPosts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: randomBlogKeys.random,
    queryFn: () => BlogService.getPosts({ published: true, limit: 100 }),
    staleTime: 1000 * 60 * 5, // 5 min — same pool, random picks on each mount
    select: (res) => getRandomItems(res.data, 4),
  });

  return (
    <section className="py-20 bg-brand-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="inline-block bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
              Blog
            </span>
            <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight">
              YOU MIGHT<br />
              <span className="text-[#9AD872]">ALSO LIKE</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="border border-brand-border text-muted-foreground font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:border-[#9AD872]/50 hover:text-[#9AD872] transition-all duration-200 tracking-wide"
          >
            ALL POSTS →
          </Link>
        </div>

        {/* Grid — 2 cols on md, 4 on xl */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}

          {isError && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              Could not load posts.
            </div>
          )}

          {!isLoading && !isError && data?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}