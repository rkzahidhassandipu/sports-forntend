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
  isOpen: boolean;
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
export default function UpdateSessionModal({ session, isOpen, onClose }: UpdateProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateSessionDto>({
    resolver: zodResolver(updateSessionSchema),
  });


  useEffect(() => {
  if (session) {
    setPreviewImage(session.coverImage || null);
    reset({
      title: session.title,
      description: session.description || "",
      date: session.date ? session.date.split("T")[0] : "", // ✅ "2026-04-12T00:00:00Z" → "2026-04-12"
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      capacity: session.capacity,
      price: session.price,
      category: session.category || "",
      level: session.level || "",
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
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreviewImage(localUrl);
      
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: UpdateSessionDto) => SessionService.update(session!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session details updated");
      onClose();
    },
    onError: (error: any) => toast.error(error.message || "Update failed"),
  });

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-[#162513] w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">Update <span className="text-lime-600">Session</span></h2>
          <button onClick={onClose} className="text-[#7a9c6e] hover:text-[#7a9c6e] text-2xl">&times;</button>
        </div>

        {/* ইমেজ আপলোড সেকশন */}
        <div className="relative w-full h-40 mb-6 bg-slate-100 rounded-3xl overflow-hidden group border-2 border-dashed border-slate-200">
          {previewImage ? (
            <img src={previewImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-[#7a9c6e] font-bold uppercase text-[10px] tracking-widest">
              No Cover Image
            </div>
          )}
          
          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#f0f7ec]">
            {isUploading ? (
              <Loader2 className="animate-spin w-8 h-8" />
            ) : (
              <>
                <Camera className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-black uppercase">Change Cover</span>
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

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e] ml-2">Session Title</label>
            <input {...register("title")} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-lime-500/20 outline-none transition-all" />
            {errors.title && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.title.message}</p>}
          </div>

          {/* Date & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e] ml-2">Date</label>
              <input type="date" {...register("date")} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e] ml-2">Price ($)</label>
              <input type="number" {...register("price", { valueAsNumber: true })} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
            </div>
          </div>

          {/* Time & Capacity */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e] ml-2">Start</label>
              <input type="time" {...register("startTime")} className="w-full p-3 border border-slate-100 rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e] ml-2">End</label>
              <input type="time" {...register("endTime")} className="w-full p-3 border border-slate-100 rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7a9c6e] ml-2">Cap</label>
              <input type="number" {...register("capacity", { valueAsNumber: true })} className="w-full p-3 border border-slate-100 rounded-xl" />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={mutation.isPending || isUploading}
              className="w-full py-4 bg-slate-900 text-[#f0f7ec] font-black rounded-2xl hover:bg-[#9AD872] hover:text-[#0f1a0d] transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {mutation.isPending ? "SAVING..." : "UPDATE SESSION"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}