"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import CreateSessionModal from "@/components/dashboard/admin/Sessio/CreateSessionModal";
import { Button } from "@/components/ui/button";
import SessionService from "@/services/session.service";
import { Session } from "@/types/gym";
import { toast } from "sonner";
import { SessionStatus } from "@/types/enums";
import UpdateSessionModal from "@/components/dashboard/admin/Sessio/UpdateSessionModal";

const STATUS_COLORS: Record<SessionStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function ManageSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<SessionStatus | "ALL">(
    "ALL",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await SessionService.getAll();

      const sessionData = Array.isArray(response) ? response : response?.data;

      setSessions(sessionData || []);
    } catch (error) {
      toast.error("Failed to load sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = (sessions || []).filter((s) => {
    const matchesStatus = activeFilter === "ALL" || s.status === activeFilter;

    const matchesSearch = s.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });
  const handleUpdateClick = (session: Session) => {
    setSelectedSession(session);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8fafc] min-h-screen text-slate-900">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Session <span className="text-lime-600">Inventory</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">
            Create and oversee training schedules for members.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-slate-950 text-white hover:bg-black rounded-2xl text-sm font-bold transition-all shadow-lg shadow-slate-200/50 flex items-center gap-2 active:scale-95"
        >
          <span className="text-lg">+</span> Create New Session
        </Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl">
          {["ALL", ...Object.values(SessionStatus)].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status as any)}
              className={cn(
                "px-5 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest uppercase",
                activeFilter === status
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sessions by title..."
          className="pl-4 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 w-full md:w-64 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className="group bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="relative h-44 bg-slate-200">
                  {session.coverImage ? (
                    <img
                      src={session.coverImage}
                      alt={session.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      No Cover Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  <div className="absolute top-5 left-5">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-sm",
                        STATUS_COLORS[session.status],
                      )}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>

                <div className="p-7 space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-lime-600 transition-colors truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {session.category || "General"} •{" "}
                      {session.level || "All Levels"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Attendance
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {session._count?.bookings || 0} / {session.capacity}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Revenue
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        ${session.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px]">
                        👤
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {session.coach?.name || "Assigning..."}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                        ⚙️
                      </button>
                      <button
                        onClick={() => handleUpdateClick(session)} // এই লাইনটি যোগ করুন
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-lime-500 hover:text-slate-950 transition-all"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                No sessions found matching your criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSessions}
      />

      <UpdateSessionModal
        session={selectedSession}
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedSession(null);
        }}
      />
    </div>
  );
}
