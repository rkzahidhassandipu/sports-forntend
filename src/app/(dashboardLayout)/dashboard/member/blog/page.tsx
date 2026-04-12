"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BlogService from "@/services/blog.service";

const TAGS = ["All", "Nutrition", "Training", "Recovery", "Mindset", "Gear"];

export default function MemberBlogFeed() {
  const [activeTag, setActiveTag] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["blogs", { published: true, tag: activeTag }],
    queryFn: () => BlogService.getPosts({ published: true, tag: activeTag }),
  });

  const posts = data?.data ?? [];
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#090c14] text-white px-6 py-10 space-y-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-lime-500 uppercase mb-2">
            Member Feed
          </p>
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tight">
            Fitness{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">
              Journal
            </span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Expert tips to fuel your progress.
          </p>
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const val = tag === "All" ? "" : tag.toLowerCase();
            const isActive = activeTag === val;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(val)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-lime-500 text-slate-950"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl bg-slate-800/40 animate-pulse ${
                i === 0 ? "md:col-span-2 h-72" : "h-52"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Posts Grid ── */}
      {!isLoading && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Featured Post */}
          {featured && (
            <article className="md:col-span-2 group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-lime-500/40 transition-all cursor-pointer">
              {featured.coverImage ? (
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-5xl">
                  💪
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex gap-2 mb-3">
                  {featured.tags?.slice(0, 2).map((t: string) => (
                    <span
                      key={t}
                      className="text-[9px] font-black uppercase tracking-widest text-lime-400 bg-lime-500/10 border border-lime-500/20 px-2.5 py-1 rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-black text-white leading-tight mb-2">
                  {featured.title}
                </h2>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                  {featured.excerpt}
                </p>
                <button className="text-[10px] font-black uppercase tracking-widest text-lime-400 flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read Story <span>→</span>
                </button>
              </div>
            </article>
          )}

          {/* Side Posts */}
          <div className="flex flex-col gap-6">
            {rest.slice(0, 2).map((post: any) => (
              <article
                key={post.id}
                className="group flex gap-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-lime-500/40 p-4 transition-all cursor-pointer"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📝
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex gap-1.5 mb-1.5">
                    {post.tags?.slice(0, 1).map((t: string) => (
                      <span
                        key={t}
                        className="text-[9px] font-black uppercase tracking-widest text-lime-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-1">
                    {post.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Remaining Posts */}
          {rest.slice(2).map((post: any) => (
            <article
              key={post.id}
              className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-lime-500/40 overflow-hidden transition-all cursor-pointer"
            >
              <div className="aspect-video bg-slate-800 overflow-hidden">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    🏋️
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-3">
                  {post.tags?.slice(0, 2).map((t: string) => (
                    <span
                      key={t}
                      className="text-[9px] font-black uppercase tracking-widest text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
                <button className="text-[10px] font-black uppercase tracking-widest text-lime-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Read <span>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-4">
            📭
          </div>
          <p className="text-slate-400 font-semibold">No posts found</p>
          <p className="text-slate-600 text-sm mt-1">Try a different tag</p>
        </div>
      )}
    </div>
  );
}