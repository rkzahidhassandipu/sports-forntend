"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Pencil, Trash2, CheckCircle2, 
  AlertCircle, Database, Weight, Ruler, Activity, 
  X, Loader2, ArrowRight
} from "lucide-react";
import FitnessService from "@/services/fitness.service";
import { FitnessRecord, CreateFitnessDto, UpdateFitnessDto } from "@/types/fitness";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────

const RECORD_TYPES = ["body_composition", "strength", "cardio", "flexibility", "nutrition"] as const;

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  body_composition: { label: "Body Comp", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: Activity },
  strength: { label: "Strength", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: Weight },
  cardio: { label: "Cardio", color: "text-[#9AD872] bg-[#9AD872]/10 border-[#9AD872]/20", icon: Activity },
  flexibility: { label: "Flexibility", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Ruler },
  nutrition: { label: "Nutrition", color: "text-violet-500 bg-violet-500/10 border-violet-500/20", icon: Database },
};

// ─── Shared UI Components ───────────────────────────────────────────────────

const FormInput = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
      {Icon && <Icon size={12} />} {label}
    </label>
    <input 
      {...props} 
      className={cn(
        "w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-sm text-[#f0f7ec] outline-none transition-all",
        "focus:border-[#9AD872] focus:ring-1 focus:ring-lime-500/20 placeholder:text-zinc-700",
        props.className
      )}
    />
  </div>
);

const ActionButton = ({ children, variant = "primary", loading, ...props }: any) => (
  <button 
    disabled={loading}
    className={cn(
      "w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50",
      variant === "primary" ? "bg-[#9AD872] text-black hover:bg-[#9AD872] shadow-lg shadow-lime-500/10" : "bg-zinc-800 text-[#f0f7ec] hover:bg-zinc-700",
      props.className
    )}
    {...props}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
  </button>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TrainerFitnessPage() {
  const [activeTab, setActiveTab] = useState<string>("records");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [editingRecord, setEditingRecord] = useState<FitnessRecord | null>(null);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (record: FitnessRecord) => {
    setEditingRecord(record);
    setActiveTab("update");
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-[#9AD872] selection:text-black pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9AD872]/10 border border-[#9AD872]/20 text-[10px] font-black uppercase tracking-widest text-[#9AD872]">
              <Database size={12} /> Fitness Core
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-[#f0f7ec]">
              Athlete <span className="text-[#9AD872]">Metrics</span>
            </h1>
            <p className="text-zinc-500 text-sm max-w-md">Record and analyze physical transformations with precision data.</p>
          </div>
          <button 
            onClick={() => setActiveTab("create")}
            className="group flex items-center gap-3 bg-zinc-900 border border-white/10 px-6 py-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Plus className="text-[#9AD872]" size={20} />
            <span className="text-xs font-black uppercase tracking-widest">New Assessment</span>
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-zinc-900/50 border border-white/5 rounded-[2rem] mb-12 overflow-x-auto no-scrollbar">
          {["records", "create", "update", "delete"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative flex-1 min-w-[140px] py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                activeTab === tab ? "bg-[#162513] text-black" : "text-zinc-500 hover:text-[#f0f7ec]"
              )}
            >
              {tab === "update" && editingRecord && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9AD872] rounded-full border-4 border-black animate-pulse" />
              )}
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Sections */}
        <main className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "records" && <RecordsSection onEdit={startEdit} notify={notify} />}
              {activeTab === "create" && <CreateSection notify={notify} onSuccess={() => setActiveTab("records")} />}
              {activeTab === "update" && <UpdateSection prefill={editingRecord} notify={notify} onSuccess={() => { setEditingRecord(null); setActiveTab("records"); }} />}
              {activeTab === "delete" && <DeleteSection notify={notify} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modern Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4"
          >
            <div className={cn(
              "flex items-center gap-4 p-5 rounded-2xl border backdrop-blur-xl shadow-2xl",
              toast.type === "success" ? "bg-[#9AD872]/10 border-[#9AD872]/20 text-[#9AD872]" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            )}>
              {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">{toast.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-Sections ────────────────────────────────────────────────────────────

function RecordsSection({ onEdit, notify }: any) {
  const [memberId, setMemberId] = useState("");
  const [records, setRecords] = useState<FitnessRecord[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    if (!memberId.trim()) return notify("Enter Member ID first", "error");
    setLoading(true);
    try {
      const data = await FitnessService.getMemberRecords(memberId.trim());
      setRecords(data);
      if (data.length === 0) notify("No records found", "error");
    } catch { notify("Failed to fetch data", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
          <input 
            className="w-full bg-black border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm text-[#f0f7ec] outline-none focus:border-[#9AD872]/50 transition-all" 
            placeholder="Search Athlete (e.g. SP-123)..." 
            value={memberId} 
            onChange={e => setMemberId(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && fetchRecords()} 
          />
        </div>
        <button 
          onClick={fetchRecords} 
          disabled={loading}
          className="px-8 bg-[#9AD872] text-black font-black text-xs tracking-widest rounded-2xl hover:bg-[#9AD872] active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? "SEARCHING..." : "SEARCH ATHLETE"}
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-950/50 shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-zinc-900/20">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Metric Type</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Log Date</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Core Stats</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {records?.map((r) => {
              const cfg = TYPE_CONFIG[r.recordType] || TYPE_CONFIG.body_composition;
              return (
                <tr key={r.id} className="group hover:bg-zinc-900/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase italic tracking-wider", cfg.color)}>
                      <cfg.icon size={12} /> {cfg.label}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-zinc-400">{new Date(r.date).toLocaleDateString('en-GB')}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      {r.weight && <div><span className="text-[#f0f7ec] font-black">{r.weight}</span> <span className="text-[10px] text-zinc-600 font-bold tracking-tighter">KG</span></div>}
                      {r.bmi && <div><span className="text-[#9AD872] font-black">{r.bmi}</span> <span className="text-[10px] text-zinc-600 font-bold tracking-tighter">BMI</span></div>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => onEdit(r)} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-[#f0f7ec] transition-all border border-white/5">
                      <Pencil size={14}/>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!records && (
          <div className="py-24 text-center space-y-4">
            <Activity className="mx-auto text-zinc-800 animate-pulse" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">No Member Data Loaded</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateSection({ notify, onSuccess }: any) {
  const [form, setForm] = useState<Partial<CreateFitnessDto>>({ recordType: 'body_composition' });
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!form.memberId || !form.recordType) return notify("Member ID is required", "error");
    setLoading(true);
    try {
      // DTO structure matching: we put extra stats inside 'data' field too if required by backend
      const payload: CreateFitnessDto = {
        memberId: form.memberId,
        recordType: form.recordType,
        weight: Number(form.weight),
        height: Number(form.height),
        bodyFat: Number(form.bodyFat),
        notes: form.notes || "",
        data: { weight: form.weight, bmi: form.bmi } 
      };
      await FitnessService.createRecord(payload);
      notify("Record stored in cloud");
      onSuccess();
    } catch { notify("Failed to save", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-zinc-950 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden text-left p-10 space-y-10">
      <div className="space-y-2 border-b border-white/5 pb-8">
        <h3 className="text-2xl font-black text-[#f0f7ec] italic uppercase">Publish Assessment</h3>
        <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase">Metrics for organization analytics.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormInput label="Member ID" placeholder="SP-000" value={form.memberId || ""} onChange={(e:any) => setForm({...form, memberId: e.target.value})} />
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">Category</label>
          <select 
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-sm text-[#f0f7ec] outline-none focus:border-[#9AD872] appearance-none" 
            value={form.recordType || ""} 
            onChange={(e) => setForm({...form, recordType: e.target.value as any})}
          >
            {RECORD_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <FormInput label="Weight (kg)" type="number" value={form.weight || ""} onChange={(e:any) => setForm({...form, weight: e.target.value})} />
        <FormInput label="Height (cm)" type="number" value={form.height || ""} onChange={(e:any) => setForm({...form, height: e.target.value})} />
        <FormInput label="Body Fat %" type="number" value={form.bodyFat || ""} onChange={(e:any) => setForm({...form, bodyFat: e.target.value})} />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Trainer's Insight</label>
        <textarea 
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-sm text-[#f0f7ec] min-h-[120px] outline-none focus:border-[#9AD872] placeholder:text-zinc-700 resize-none" 
          placeholder="Notes on athlete condition..." 
          value={form.notes || ""} 
          onChange={(e) => setForm({...form, notes: e.target.value})} 
        />
      </div>

      <ActionButton loading={loading} onClick={handlePublish}>
        Finalize & Upload <ArrowRight size={16} />
      </ActionButton>
    </div>
  );
}

function UpdateSection({ prefill, notify, onSuccess }: any) {
  const [form, setForm] = useState<Partial<UpdateFitnessDto>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefill) {
      setForm({
        recordType: prefill.recordType,
        weight: prefill.weight ?? 0,
        height: prefill.height ?? 0,
        bodyFat: prefill.bodyFat ?? 0,
        notes: prefill.notes ?? "",
      });
    }
  }, [prefill]);

  if (!prefill) return (
    <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-zinc-950/20">
      <Pencil className="mx-auto mb-6 text-zinc-800" size={48} />
      <h3 className="text-xl font-black text-zinc-700 uppercase italic">No Record Selected</h3>
      <p className="text-[10px] font-black text-zinc-800 tracking-[0.3em] uppercase mt-2">Select a record from the history tab to modify.</p>
    </div>
  );

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await FitnessService.updateRecord(prefill.id, form);
      notify("Log updated successfully");
      onSuccess();
    } catch { notify("Sync failed", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-zinc-950 border border-white/5 rounded-[2.5rem] p-10 text-left space-y-10">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-[#f0f7ec] italic uppercase">Modify Entry</h3>
          <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase">Target: {prefill.id}</p>
        </div>
        <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", TYPE_CONFIG[prefill.recordType]?.color)}>
          {prefill.recordType}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Change Category</label>
          <select 
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-sm text-[#f0f7ec] outline-none" 
            value={form.recordType || ""} 
            onChange={(e) => setForm({...form, recordType: e.target.value as any})}
          >
            {RECORD_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <FormInput label="Weight" type="number" value={form.weight || ""} onChange={(e:any) => setForm({...form, weight: e.target.value})} />
      </div>

      <FormInput label="Insight Update" value={form.notes || ""} onChange={(e:any) => setForm({...form, notes: e.target.value})} />

      <div className="flex gap-4">
        <ActionButton variant="outline" onClick={onSuccess}>Discard Changes</ActionButton>
        <ActionButton loading={loading} onClick={handleUpdate}>Synchronize Data</ActionButton>
      </div>
    </div>
  );
}

function DeleteSection({ notify }: any) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!id.trim()) return notify("Input ID first", "error");
    setLoading(true);
    try {
      await FitnessService.deleteRecord(id.trim());
      notify("Data Purged Successfully");
      setId("");
    } catch { notify("Access Denied or Invalid ID", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-950 border border-rose-500/10 rounded-[2.5rem] p-12 space-y-8 text-center shadow-2xl shadow-rose-500/5">
      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
        <Trash2 size={28} />
      </div>
      <div>
        <h3 className="text-2xl font-black text-[#f0f7ec] italic uppercase">Purge Record</h3>
        <p className="text-xs font-bold text-zinc-600 mt-2 tracking-widest uppercase leading-relaxed">This action will permanently strip the assessment data from the cloud servers.</p>
      </div>
      <FormInput placeholder="Enter ID to confirm..." value={id} onChange={(e:any) => setId(e.target.value)} className="text-center" />
      <button 
        disabled={loading} 
        onClick={handleDelete}
        className="w-full bg-rose-600 hover:bg-rose-500 text-[#f0f7ec] font-black py-5 rounded-2xl tracking-[0.2em] text-xs transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? "PURGING..." : "CONFIRM PERMANENT DELETE"}
      </button>
    </div>
  );
}