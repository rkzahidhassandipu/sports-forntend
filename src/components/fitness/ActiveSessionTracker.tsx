"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FitnessService from "@/services/fitness.service";
import { CreateFitnessDto } from "@/types/fitness";
import { toast } from "sonner";

interface Set {
  weight: number;
  reps: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Props {
  memberId: string;
  onComplete: () => void;
}

export default function ActiveSessionTracker({ memberId, onComplete }: Props) {
  const queryClient = useQueryClient();
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // ডিফল্ট ওয়ার্কআউট ডেটা
  const [workout, setWorkout] = useState<Exercise[]>([
    {
      id: "1",
      name: "Barbell Back Squat",
      sets: [
        { weight: 100, reps: 5, completed: false },
        { weight: 100, reps: 5, completed: false },
        { weight: 100, reps: 5, completed: false },
      ],
    },
    {
      id: "2",
      name: "Bulgarian Split Squat",
      sets: [
        { weight: 40, reps: 10, completed: false },
        { weight: 40, reps: 10, completed: false },
      ],
    },
  ]);

  // ১. টাইমার লজিক
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // ২. লাইভ ভলিউম ক্যালকুলেশন (Weight * Reps)
  const totalVolume = useMemo(() => {
    return workout.reduce((acc, ex) => 
      acc + ex.sets.reduce((sAcc, set) => sAcc + (set.completed ? set.weight * set.reps : 0), 0), 0
    );
  }, [workout]);

  // ৩. API মিউটেশন (ডেটা সেভ করা)
  const saveMutation = useMutation({
    mutationFn: (payload: CreateFitnessDto) => FitnessService.createRecord(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness-records"] });
      toast.success(`Session saved successfully for ${memberId}`);
      onComplete();
    },
    onError: () => toast.error("Failed to sync session with server"),
  });

  const handleToggleSet = (exId: string, setIdx: number) => {
    setWorkout(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const newSets = [...ex.sets];
      newSets[setIdx] = { ...newSets[setIdx], completed: !newSets[setIdx].completed };
      return { ...ex, sets: newSets };
    }));
  };

  const handleFinishWorkout = () => {
    const payload: CreateFitnessDto = {
      memberId,
      recordType: "STRENGTH_SESSION",
      data: {
        exercises: workout,
        durationSeconds: seconds,
        totalVolumeKg: totalVolume,
        finishedAt: new Date().toISOString(),
      },
      notes: `Professional session tracked for member ID: ${memberId}`,
    };
    saveMutation.mutate(payload);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HUD (Heads-Up Display) */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-lime-400 rounded-3xl flex items-center justify-center text-slate-900 text-2xl animate-pulse">
            ⚡
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tight">Active <span className="text-lime-400">Tracker</span></h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Member: {memberId}</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time</p>
            <p className="text-3xl font-black font-mono">{formatTime(seconds)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vol (kg)</p>
            <p className="text-3xl font-black text-lime-400">{totalVolume.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={cn(
              "px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
              isTimerRunning ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-lime-400 text-slate-900"
            )}
          >
            {isTimerRunning ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      {/* 2. Exercise List */}
      <div className="grid grid-cols-1 gap-6">
        {workout.map((exercise) => (
          <div key={exercise.id} className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{exercise.name}</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength Phase</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Set</span>
                <span>Target</span>
                <span>Weight</span>
                <span className="text-right">Action</span>
              </div>

              {exercise.sets.map((set, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToggleSet(exercise.id, idx)}
                  className={cn(
                    "grid grid-cols-4 items-center p-4 rounded-2xl border transition-all cursor-pointer",
                    set.completed 
                      ? "bg-lime-50 border-lime-200 opacity-60" 
                      : "bg-slate-50 border-slate-100 hover:border-slate-300"
                  )}
                >
                  <span className="font-black text-slate-900">0{idx + 1}</span>
                  <span className="text-xs font-bold text-slate-400 italic">80% 1RM</span>
                  <span className="font-black text-slate-900">{set.weight}kg x {set.reps}</span>
                  <div className="flex justify-end">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      set.completed ? "bg-slate-900 border-slate-900 text-lime-400" : "border-slate-300"
                    )}>
                      {set.completed && "✓"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Action Bar */}
      <div className="flex justify-end items-center gap-6 pt-6 border-t border-slate-200">
        <button 
          onClick={onComplete}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
        >
          Discard Session
        </button>
        <button 
          onClick={handleFinishWorkout}
          disabled={saveMutation.isPending}
          className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
        >
          {saveMutation.isPending ? "Syncing..." : "Complete & Save Workout"}
        </button>
      </div>
    </div>
  );
}