"use client";

import * as z from "zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Session, UpdateSessionDto } from "@/types/gym";
import SessionService from "@/services/session.service";
import { Camera, Loader2 } from "lucide-react";

interface UpdateProps {
  session: Session | null;
  isOpen:  boolean;
  onClose: () => void;
}

const updateSessionSchema = z.object({
  title:       z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().optional(),
  date:        z.string().min(1, "Date is required").optional(),
  startTime:   z.string().min(1, "Start time is required").optional(),
  endTime:     z.string().min(1, "End time is required").optional(),
  duration:    z.number().min(15).optional(),
  capacity:    z.number().min(1).optional(),
  price:       z.number().min(0).optional(),
  category:    z.string().optional(),
  level:       z.string().optional(),
  equipment:   z.array(z.string()).optional(),
});

// ── Same input style as CreateSessionModal ────────────────────────────────────
const INPUT_CLS =
  "w-full px-4 py-3 bg-[#1e3018] text-white placeholder:text-[#7a9c6e] border border-[#2d4a24] rounded-xl text-sm focus:ring-2 focus:ring-lime-500/30 focus:border-[#9AD872] outline-none transition-all";

const LABEL_CLS =
  "text-[10px] font-black uppercase tracking-widest text-[#7a9c6e] ml-1";

export default function UpdateSessionModal({ session, isOpen, onClose }: UpdateProps) {
  const queryClient = useQueryClient();
  const [isUploading,   setIsUploading]   = useState(false);
  const [previewImage,  setPreviewImage]  = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSessionDto>({
    resolver: zodResolver(updateSessionSchema),
  });

  useEffect(() => {
    if (session) {
      setPreviewImage(session.coverImage || null);
      reset({
        title:       session.title,
        description: session.description || "",
        date:        session.date ? session.date.split("T")[0] : "",
        startTime:   session.startTime,
        endTime:     session.endTime,
        duration:    session.duration,
        capacity:    session.capacity,
        price:       session.price,
        category:    session.category || "",
        level:       session.level    || "",
      });
    }
  }, [session, reset]);

  const uploadMutation = useMutation({
    mutationFn: (image: File) => SessionService.uploadCover(session!.id, image),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Cover image uploaded successfully!");
      setPreviewImage(data.url);
      setIsUploading(false);
    },
    onError: () => {
      toast.error("Image upload failed");
      setIsUploading(false);
      setPreviewImage(session?.coverImage || null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: UpdateSessionDto) => SessionService.update(session!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session updated successfully!");
      onClose();
    },
    onError: (error: any) => toast.error(error.message || "Update failed"),
  });

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#162513] w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-white">
              Update <span className="text-lime-400">Session</span>
            </h2>
            <p className="text-xs text-[#7a9c6e] font-medium italic">
              Edit the session details below.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-rose-400 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Cover Image Upload */}
          <div className="relative w-full h-40 bg-[#1e3018] border-2 border-dashed border-[#2d4a24] rounded-3xl overflow-hidden group">
            {previewImage ? (
              <img src={previewImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-[#7a9c6e] font-bold uppercase text-[10px] tracking-widest">
                No Cover Image
              </div>
            )}
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
              {isUploading ? (
                <Loader2 className="animate-spin w-8 h-8" />
              ) : (
                <>
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Change Cover
                  </span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                disabled={isUploading}
              />
            </label>
          </div>

          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4"
          >
            {/* Title */}
            <div className="space-y-1">
              <label className={LABEL_CLS}>Session Title</label>
              <input
                {...register("title")}
                className={INPUT_CLS}
                placeholder="e.g. Morning HIIT Blast"
              />
              {errors.title && (
                <p className="text-rose-400 text-[10px] font-bold ml-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category & Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={LABEL_CLS}>Category</label>
                <select {...register("category")} className={INPUT_CLS}>
                  <option value="Boxing">Boxing</option>
                  <option value="Yoga">Yoga</option>
                  <option value="MMA">MMA</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Gymnastics">Gymnastics</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLS}>Level</label>
                <select {...register("level")} className={INPUT_CLS}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>

            {/* Date & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={LABEL_CLS}>Date</label>
                <input
                  type="date"
                  {...register("date")}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLS}>Price ($)</label>
                <input
                  type="number"
                  min={0}
                  {...register("price", { valueAsNumber: true })}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Start / End / Capacity */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className={LABEL_CLS}>Start</label>
                <input
                  type="time"
                  {...register("startTime")}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLS}>End</label>
                <input
                  type="time"
                  {...register("endTime")}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLS}>Capacity</label>
                <input
                  type="number"
                  min={1}
                  {...register("capacity", { valueAsNumber: true })}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className={LABEL_CLS}>Description (Optional)</label>
              <textarea
                rows={3}
                {...register("description")}
                placeholder="What members can expect..."
                className={`${INPUT_CLS} resize-none`}
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-[#7a9c6e] border border-white/10 rounded-2xl hover:bg-white/5 transition-all"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={mutation.isPending || isUploading}
                className="flex-1 py-4 bg-[#9AD872] text-[#0f1a0d] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-lime-400 transition-all shadow-lg disabled:opacity-50"
              >
                {mutation.isPending ? "Saving..." : "Update Session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}