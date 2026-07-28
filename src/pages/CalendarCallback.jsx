import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundElements from "@/components/BackgroundElements";
import Seo from "@/components/Seo";
import { CopyCheck, XOctagon, Check, X } from "lucide-react";

export default function CalendarCallback() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageStatus, setPageStatus] = useState(() => {
    const saved = sessionStorage.getItem("timetable:sync:status");
    return saved ? JSON.parse(saved) : { isSuccess: false, message: "No sync operation status found." };
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const result = searchParams.get("result");

    if (success !== null || result !== null) {
      const isSuccess = success === "true" || result === "success";
      const errorMsg = searchParams.get("message") || 
                       searchParams.get("error") || 
                       searchParams.get("error_description");
      const finalMsg = errorMsg || (isSuccess ? "Your timetable was synced to calendar successfully." : "Calendar sync could not be completed. Please retry the action.");

      const statusObj = { isSuccess, message: finalMsg };
      setPageStatus(statusObj);
      sessionStorage.setItem("timetable:sync:status", JSON.stringify(statusObj));

      setToast({
        type: isSuccess ? "success" : "error",
        message: isSuccess ? "Google Calendar synchronization completed!" : "Google Calendar synchronization failed."
      });

      // Clean the URL parameters afterwards
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("success");
      newParams.delete("result");
      newParams.delete("message");
      newParams.delete("error");
      newParams.delete("error_description");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isSuccess = pageStatus?.isSuccess;
  const message = pageStatus?.message;

  return (
    <div className="min-h-screen flex flex-col relative text-foreground w-full">
      <Seo
        description={
          isSuccess
            ? "Your timetable was synced to calendar successfully."
            : "Calendar sync could not be completed. Please retry the action."
        }
        path="/calendar"
        robots="noindex, nofollow"
        keywords={["calendar callback", "calendar sync", "schedule integration"]}
      />
      <BackgroundElements />
      <Navbar />

      {/* Modern custom toast notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-[100] toast-animate">
          <div className={`glass-card p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border flex items-center gap-3 backdrop-blur-2xl ${
            toast.type === "success" 
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" 
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}>
              {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-bold text-white leading-tight font-space-grotesk">
                {toast.type === "success" ? "Sync Completed" : "Sync Failed"}
              </p>
              <p className="text-[11px] opacity-70 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-white/40 hover:text-white/80 transition-colors ml-2 self-start p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pt-32 pb-16 flex flex-col items-center justify-center">
        <div className="glass-card rounded-2xl p-8 md:p-12 w-full text-center relative overflow-hidden group border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {isSuccess ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />
          ) : (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] pointer-events-none" />
          )}

          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {isSuccess ? <CopyCheck size={36} /> : <XOctagon size={36} />}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4 font-space-grotesk">
              {isSuccess ? "Success!" : "Action Failed"}
            </h1>

            <p className="text-lg text-white/70 mb-10 max-w-md mx-auto leading-relaxed">
              {message}
            </p>

            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] active:scale-[0.98] text-sm"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
