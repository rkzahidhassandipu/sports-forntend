"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import BlogService from "@/services/blog.service";
import { UpdateBlogDto } from "@/types/blog";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ─── Route: /dashboard/admin/blogs/[id] ───────────────────────────────────────
// Folder name must be [id] — not [slug]

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Folder is [id] so params.id gives the post ID
  const id = params.id as string;

  // Fetch post by ID
  const { data: response, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => BlogService.getPost(id),
    enabled: !!id,
  });

  const post = response?.data;

  const { register, handleSubmit, reset } = useForm<UpdateBlogDto>();

  // Populate form once data arrives
  useEffect(() => {
  if (post) {
    reset({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt ?? undefined,
      coverImage: post.coverImage ?? undefined,
      tags: post.tags,
      published: post.published,
    });
  }
}, [post, reset]);

  const updateMutation = useMutation({
  mutationFn: (payload: UpdateBlogDto) => BlogService.updatePost(post!.id, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["blog", id] });

    toast.success("Manuscript updated successfully!");
    router.push("/dashboard/admin/blogs");
  },
  onError: () => toast.error("Failed to update manuscript."),
});

  const onSubmit = (formData: UpdateBlogDto) => {
    updateMutation.mutate(formData);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-lime-600" size={40} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-[#7a9c6e]">
        <p className="font-bold text-sm uppercase tracking-widest">Post not found.</p>
        <Link
          href="/dashboard/admin/blogs"
          className="text-[10px] font-black text-lime-600 uppercase tracking-widest hover:underline"
        >
          ← Back to Archives
        </Link>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard/admin/blogs"
          className="flex items-center gap-2 text-[#7a9c6e] hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Archives
        </Link>
        <h1 className="text-2xl font-black text-slate-900 uppercase italic">
          Edit Manuscript
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[#162513] p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">

          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e]">
              Title
            </label>
            <input
              {...register("title", { required: true })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9AD872] font-bold"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e]">
              Excerpt
            </label>
            <textarea
              {...register("excerpt")}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9AD872] text-sm resize-none"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e]">
              Content
            </label>
            <textarea
              {...register("content")}
              rows={10}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9AD872] text-sm leading-relaxed resize-none"
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e]">
              Cover Image URL
            </label>
            <input
              {...register("coverImage")}
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9AD872] text-sm"
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-700">Visibility Status</p>
              <p className="text-[10px] text-[#7a9c6e] uppercase font-bold tracking-tighter">
                Toggle between draft and live
              </p>
            </div>
            <input
              type="checkbox"
              {...register("published")}
              className="w-6 h-6 accent-lime-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full h-14 bg-[#162513] text-[#f0f7ec] rounded-2xl font-black uppercase tracking-widest hover:bg-[#9AD872] transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {updateMutation.isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          {updateMutation.isPending ? "Syncing..." : "Update Manuscript"}
        </button>
      </form>
    </div>
  );
}