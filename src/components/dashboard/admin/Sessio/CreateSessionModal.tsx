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

export default function CreateSessionModal({ isOpen, onClose, onSuccess }: CreateSessionModalProps) {
  const [loading, setLoading] = useState(false);
  
  // ১. আপনার DTO অনুযায়ী স্টেট ম্যানেজমেন্ট
  const [formData, setFormData] = useState<CreateSessionDto>({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0], // Default today
    startTime: "10:00",
    endTime: "11:00",
    duration: 60,
    capacity: 20,
    price: 0,
    category: "Boxing",
    level: "Beginner",
    equipment: [],
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call using the DTO
      await SessionService.create(formData);
      toast.success("New session scheduled successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to create session. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Schedule <span className="text-lime-600">Session</span></h2>
            <p className="text-xs text-slate-400 font-medium italic">Enter details following the PH-Gym schema.</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors">✕</button>
        </div>

        <form className="p-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
          
          {/* Title & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Boxing">Boxing</option>
                <option value="Yoga">Yoga</option>
                <option value="MMA">MMA</option>
                <option value="HIIT">HIIT</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input 
                type="date"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
              <input 
                type="time"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
              <input 
                type="time"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>

          {/* Price, Capacity, Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ($)</label>
              <input 
                type="number"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity</label>
              <input 
                type="number"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (min)</label>
              <input 
                type="number"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-lime-500/20 outline-none resize-none"
              placeholder="Tell members what to expect..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-lime-500 hover:text-slate-950 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm & Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}