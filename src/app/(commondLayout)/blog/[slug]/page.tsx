"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import BlogService from "@/services/blog.service";
import type { BlogPost } from "@/types/blog";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  User,
  Loader2,
  Tag,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function BlogDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
      <div className="h-4 w-24 bg-muted rounded-full" />
      <div className="h-10 w-3/4 bg-muted rounded-xl" />
      <div className="h-4 w-1/2 bg-muted rounded-full" />
      <div className="h-64 w-full bg-muted rounded-2xl" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded-full" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.slug as string;

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["blog", "detail", slug],
    queryFn:  () => BlogService.getPost(slug),
    enabled:  !!slug,
    staleTime: 1000 * 60 * 5,
  });

  // API returns { success, data: BlogPost, ... }
  const post: BlogPost | undefined = (response as any)?.data ?? response;

  // ── States ─────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <main className="min-h-screen bg-background">
      <BlogDetailSkeleton />
    </main>
  );

  if (isError || !post) return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-6xl">📭</span>
      <h2 className="text-xl font-black text-foreground">Post not found</h2>
      <p className="text-muted-foreground text-sm">
        This post may have been removed or the link is invalid.
      </p>
      <Link
        href="/blog"
        className="mt-2 flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest hover:underline"
      >
        <ArrowLeft size={16} /> Back to Blog
      </Link>
    </main>
  );

  const displayDate  = formatDate(post.publishedAt ?? post.createdAt);
  const category     = post.tags?.[0] ?? "General";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── Hero cover ── */}
      {post.coverImage && (
        <div className="w-full h-72 md:h-96 overflow-hidden relative">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* ── Back link ── */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={14} /> All Posts
        </Link>

        {/* ── Category tag ── */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Tag size={10} />
            {category}
          </span>
        </div>

        {/* ── Title ── */}
        <h1 className="text-3xl md:text-4xl font-black leading-tight text-foreground mb-4">
          {post.title}
        </h1>

        {/* ── Excerpt ── */}
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-medium">
            {post.excerpt}
          </p>
        )}

        {/* ── Meta row ── */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wide pb-6 border-b border-border mb-8">
          {post.author && (
            <div className="flex items-center gap-1.5">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={12} className="text-primary" />
                </div>
              )}
              <span className="text-foreground/80">{post.author.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            {displayDate}
          </div>

          {post.readTime != null && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              {post.readTime} min read
            </div>
          )}

          {post.viewCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Eye size={13} />
              {post.viewCount.toLocaleString()} views
            </div>
          )}

          {/* Published badge */}
          <span className={`ml-auto px-2.5 py-1 rounded-lg text-[9px] font-black border ${
            post.published
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted text-muted-foreground border-border"
          }`}>
            {post.published ? "Published" : "Draft"}
          </span>
        </div>

        {/* ── Content ── */}
        <article className="prose prose-sm md:prose-base max-w-none
          prose-headings:font-black prose-headings:text-foreground
          prose-p:text-foreground/80 prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded
          prose-pre:bg-card prose-pre:border prose-pre:border-border
          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
          prose-hr:border-border
          prose-img:rounded-2xl
        ">
          {post.content?.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i}>{paragraph}</p>
            ) : (
              <br key={i} />
            ),
          )}
        </article>

        {/* ── Tags ── */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-lg uppercase tracking-wide border border-border hover:border-primary/40 hover:text-primary transition-all"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Back button ── */}
        <div className="mt-12 pt-8 border-t border-border">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>
      </div>
    </main>
  );
}