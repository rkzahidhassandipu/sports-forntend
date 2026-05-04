"use client";
import React, { useState } from "react";
import SessionService from "@/services/session.service";
import { CreateSessionDto } from "@/types/gym";
import { toast } from "sonner";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INPUT_CLS =
  "w-full px-4 py-3 bg-[#1e3018] text-white placeholder:text-[#7a9c6e] border border-[#2d4a24] rounded-xl text-sm focus:ring-2 focus:ring-lime-500/30 focus:border-[#9AD872] outline-none transition-all";

export default function CreateSessionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSessionModalProps) {
  const [loading, setLoading] = useState(false);

  const INITIAL_FORM: CreateSessionDto = {
    title:       "",
    description: "",
    date:        new Date().toISOString().split("T")[0],
    startTime:   "10:00",
    endTime:     "11:00",
    duration:    60,
    capacity:    20,
    price:       0,
    category:    "Boxing",
    level:       "Beginner",
    equipment:   [],
  };

  const [formData, setFormData] = useState<CreateSessionDto>(INITIAL_FORM);

  if (!isOpen) return null;

  const set = (key: keyof CreateSessionDto, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await SessionService.create(formData);
      toast.success("New session scheduled successfully!");
      setFormData(INITIAL_FORM); // ✅ reset form
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Failed to create session. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

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
              Schedule <span className="text-lime-400">Session</span>
            </h2>
            <p className="text-xs text-[#7a9c6e] font-medium italic">
              Enter details following the PH-Gym schema.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-rose-400 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          className="p-8 space-y-4 max-h-[80vh] overflow-y-auto"
          onSubmit={handleSubmit}
        >
          {/* Title & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
                Title
              </label>
              <input
                required
                className={INPUT_CLS}
                value={formData.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
                Category
              </label>
              <select
                className={INPUT_CLS}
                value={formData.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="Boxing">Boxing</option>
                <option value="Yoga">Yoga</option>
                <option value="MMA">MMA</option>
                <option value="HIIT">HIIT</option>
                <option value="Gymnastics">Gymnastics</option>
              </select>
            </div>
          </div>

          {/* Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
              Level
            </label>
            <select
              className={INPUT_CLS}
              value={formData.level}
              onChange={(e) => set("level", e.target.value)}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
                Date
              </label>
              <input
                type="date"
                required
                className={INPUT_CLS}
                value={formData.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
                Start Time
              </label>
              <input
                type="time"
                required
                className={INPUT_CLS}
                value={formData.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
                End Time
              </label>
              <input
                type="time"
                required
                className={INPUT_CLS}
                value={formData.endTime}
                onChange={(e) => set("endTime", e.target.value)}
              />
            </div>
          </div>

          {/* Price, Capacity, Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
                Price ($)
              </label>
              <input
                type="number"
                required
                min={0}
                className={INPUT_CLS}
                value={formData.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
                Capacity
              </label>
              <input
                type="number"
                required
                min={1}
                className={INPUT_CLS}
                value={formData.capacity}
                onChange={(e) => set("capacity", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
                Duration (min)
              </label>
              <input
                type="number"
                required
                min={1}
                className={INPUT_CLS}
                value={formData.duration}
                onChange={(e) => set("duration", Number(e.target.value))}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              className={`${INPUT_CLS} resize-none`}
              placeholder="Tell members what to expect..."
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
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
              disabled={loading}
              className="flex-1 py-4 bg-[#9AD872] text-[#0f1a0d] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-lime-400 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm & Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}