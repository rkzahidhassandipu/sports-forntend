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

const INPUT_CLS =
  "w-full bg-card text-card-foreground placeholder:text-muted-foreground border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all";

const LABEL_CLS = "text-[10px] font-black uppercase tracking-widest text-muted-foreground";

export default function BlogEditPage() {
  const params      = useParams();
  const router      = useRouter();
  const queryClient = useQueryClient();

  const id = params.id as string;

  const { data: response, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn:  () => BlogService.getPost(id),
    enabled:  !!id,
  });

  const post = response?.data;

  const { register, handleSubmit, reset } = useForm<UpdateBlogDto>();

  useEffect(() => {
    if (post) {
      reset({
        title:      post.title,
        content:    post.content,
        excerpt:    post.excerpt     ?? undefined,
        coverImage: post.coverImage  ?? undefined,
        tags:       post.tags,
        published:  post.published,
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

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
        <p className="font-bold text-sm uppercase tracking-widest">Post not found.</p>
        <Link
          href="/dashboard/admin/blogs"
          className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
        >
          ← Back to Archives
        </Link>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 bg-background min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard/admin/blogs"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Archives
        </Link>
        <h1 className="text-2xl font-black text-foreground uppercase italic">
          Edit <span className="text-primary">Manuscript</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
        <div className="bg-card border border-border p-8 rounded-[2rem] shadow-sm space-y-6">

          {/* Title */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>Title</label>
            <input
              {...register("title", { required: true })}
              className={`${INPUT_CLS} font-bold`}
              placeholder="Post title..."
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>Excerpt</label>
            <textarea
              {...register("excerpt")}
              rows={2}
              placeholder="Short summary..."
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>Content</label>
            <textarea
              {...register("content")}
              rows={12}
              placeholder="Write your content here..."
              className={`${INPUT_CLS} resize-none leading-relaxed`}
            />
          </div>

          {/* Cover Image URL */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>Cover Image URL</label>
            <input
              {...register("coverImage")}
              placeholder="https://..."
              className={INPUT_CLS}
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border">
            <div>
              <p className="text-sm font-bold text-foreground">Visibility Status</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                Toggle between draft and live
              </p>
            </div>
            <input
              type="checkbox"
              {...register("published")}
              className="w-6 h-6 accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
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