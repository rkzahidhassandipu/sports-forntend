"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import ContactService from "@/services/contact.service"; // নিশ্চিত করুন এই পাথটি সঠিক
import { SubmitContactDto } from "@/types/contact";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const [form, setForm] = useState<SubmitContactDto>({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: "" // অপশনাল ফোন ফিল্ড যোগ করা হয়েছে
  });

  const mutation = useMutation({
    mutationFn: (payload: SubmitContactDto) => ContactService.submit(payload),
    onSuccess: () => {
      setForm({ name: "", email: "", subject: "", message: "", phone: "" });
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate(form);
  }

  const isSuccess = mutation.isSuccess;
  const isError = mutation.isError;
  const isPending = mutation.isPending;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-black">
      {/* Header Section */}
      <div className="bg-zinc-950 border-b border-white/5 py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-[#9AD872]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-block bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/20 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4">
            Contact Us
          </span>
          <h1 className="font-display font-black text-5xl sm:text-7xl leading-tight text-[#f0f7ec] italic">
            GET IN <span className="text-[#9AD872]">TOUCH</span>
          </h1>
          <p className="text-zinc-500 mt-4 max-w-xl text-sm leading-relaxed">
            Have a question about our training sessions or membership? Our team is here to help you stay in the game.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Info Cards */}
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: <Mail className="w-4 h-4" />, title: "Email Us", value: "info@sportpulse.com.bd", sub: "Reply within 24 hours" },
                { icon: <Phone className="w-4 h-4" />, title: "Call Us", value: "+880 1700-123456", sub: "Daily 9 AM – 9 PM" },
                { icon: <MapPin className="w-4 h-4" />, title: "Visit Us", value: "123 Sports Complex", sub: "Mirpur, Dhaka-1216" },
                { icon: <Clock className="w-4 h-4" />, title: "Opening Hours", value: "Daily 6 AM – 10 PM", sub: "365 days a year" },
              ].map((item) => (
                <div key={item.title} className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-[#9AD872]/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-[#9AD872]/10 border border-[#9AD872]/20 flex items-center justify-center text-[#9AD872] mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-[#f0f7ec] font-black text-xs tracking-widest uppercase mb-1">{item.title}</h3>
                  <p className="text-sm font-bold text-zinc-200 mb-1">{item.value}</p>
                  <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-br from-lime-500/10 to-transparent border border-[#9AD872]/10 rounded-2xl p-8">
              <h3 className="text-[#f0f7ec] font-black text-sm tracking-[0.2em] mb-6 uppercase italic">Follow the Squad</h3>
              <div className="flex gap-4">
                {['Facebook', 'Instagram', 'LinkedIn', 'Twitter'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="px-4 py-2 rounded-lg bg-black border border-white/5 text-[10px] font-black text-zinc-500 hover:text-[#9AD872] hover:border-[#9AD872]/50 transition-all uppercase tracking-widest"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-black text-[#f0f7ec] mb-8 tracking-tight uppercase italic">Send a Message</h2>
            
            {isSuccess ? (
              <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-[#9AD872]/10 border border-[#9AD872]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#9AD872]" />
                </div>
                <h3 className="text-2xl font-black text-[#f0f7ec] mb-2 uppercase italic">Message Received!</h3>
                <p className="text-zinc-500 text-sm max-w-[250px] mx-auto mb-8">
                  Check your email. One of our squad members will contact you shortly.
                </p>
                <button 
                  onClick={() => mutation.reset()}
                  className="text-[#9AD872] font-black text-xs tracking-widest hover:underline uppercase"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={isPending}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-5 py-4 text-[#f0f7ec] focus:border-[#9AD872] outline-none transition-all placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={isPending}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-5 py-4 text-[#f0f7ec] focus:border-[#9AD872] outline-none transition-all placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Membership Inquiry"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    disabled={isPending}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-5 py-4 text-[#f0f7ec] focus:border-[#9AD872] outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    disabled={isPending}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-5 py-4 text-[#f0f7ec] focus:border-[#9AD872] outline-none transition-all placeholder:text-zinc-700 resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isPending} 
                  className={cn(
                    "w-full font-display font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 tracking-widest active:scale-95",
                    isPending 
                      ? "bg-[#9AD872]/50 text-black/50 cursor-not-allowed" 
                      : "bg-[#9AD872] text-black hover:bg-lime-400 shadow-lg shadow-lime-500/20"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      SEND MESSAGE
                    </>
                  )}
                </button>

                {isError && (
                  <div className="flex items-center gap-2 text-rose-500 bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase">Error sending message. Please try again.</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}