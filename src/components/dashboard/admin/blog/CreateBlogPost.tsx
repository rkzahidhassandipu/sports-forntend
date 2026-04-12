"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Image as ImageIcon, Hash, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BlogService from "@/services/blog.service";
import { CreateBlogDto } from "@/types/blog";

const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content is too short"),
  excerpt: z.string().optional(),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

interface CreateBlogPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBlogPopup({
  isOpen,
  onClose,
  onSuccess,
}: CreateBlogPopupProps) {
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateBlogDto>({
    resolver: zodResolver(blogSchema),
    defaultValues: { tags: [], published: false },
  });
  // Keep UI in sync with form state
  const tags = watch("tags") || [];

  // --- TanStack Mutation (The "Correct" way to POST data) ---
  const mutation = useMutation({
    mutationFn: (data: CreateBlogDto) => BlogService.createPost(data),
    onSuccess: (responseData) => {
      // 1. Logic works because we haven't closed the modal yet
      console.log("Success! Server returned:", responseData);

      // 2. Tell TanStack to refresh the main blog list
      queryClient.invalidateQueries({ queryKey: ["blogs"] });

      // 3. Cleanup
      onSuccess();
      handleInternalClose();
    },
    onError: (error) => {
      console.error("Post Error:", error);
      alert("Failed to save article.");
    },
  });

  const handleInternalClose = () => {
    reset();
    setTagInput("");
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setValue("tags", [...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove),
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleInternalClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-white z-[101] rounded-[2.5rem] shadow-2xl overflow-hidden md:w-3/5 lg:w-2/5 flex flex-col mx-auto"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center text-white">
                  <Plus size={20} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter">
                    New Manuscript
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Drafting Mode
                  </p>
                </div>
              </div>
              <button
                onClick={handleInternalClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Form Body */}
            <form
              id="blog-form"
              onSubmit={handleSubmit(
                (data) => {
                  console.log("🚀 SUBMITTING TO API:", data);
                  mutation.mutate(data);
                },
                (errors) => {
                  console.log("❌ VALIDATION ERRORS:", errors); // This will tell you WHY it's not submitting
                },
              )}
              className="flex-grow overflow-y-auto p-8 lg:p-12"
            >
              <div className="space-y-8">
                <div className="space-y-2">
                  <input
                    {...register("title")}
                    placeholder="Article Title..."
                    className="w-full text-4xl font-black tracking-tight border-none outline-none placeholder:text-slate-100 focus:ring-0"
                  />
                  {errors.title && (
                    <p className="text-rose-500 text-[10px] font-bold uppercase">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <textarea
                  {...register("content")}
                  placeholder="Start your story here..."
                  className="w-full min-h-[250px] text-lg leading-relaxed border-none outline-none placeholder:text-slate-100 focus:ring-0 resize-none"
                />

                {/* Sidebar Meta Info */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Send size={12} /> Brief Summary
                    </label>
                    <textarea
                      {...register("excerpt")}
                      className="w-full h-20 p-4 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-lime-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <ImageIcon size={12} /> Cover Image URL
                    </label>
                    <input
                      {...register("coverImage")}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-lime-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Hash size={12} /> Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((t, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold"
                        >
                          #{t}
                          <X
                            size={10}
                            className="cursor-pointer hover:text-rose-500"
                            onClick={() => removeTag(t)}
                          />
                        </span>
                      ))}
                    </div>
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type and hit enter..."
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-lime-500"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("published")}
                  className="w-5 h-5 accent-lime-600 rounded"
                />
                <span className="text-xs font-bold text-slate-600">
                  Publish immediately
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleInternalClose}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  form="blog-form"
                  disabled={mutation.isPending}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-lime-600 transition-all shadow-lg disabled:opacity-50"
                >
                  {mutation.isPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {mutation.isPending ? "Processing..." : "Finalize Article"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
