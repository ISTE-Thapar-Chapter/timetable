import React, { useState } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, X, Send, Loader2 } from "lucide-react";
import { useTheme } from "@/utils/theme";

export default function DiscrepancyModal({ isOpen, onClose, defaultBatch = "" }) {
  const { theme } = useTheme();
  const isDoom = theme === "doom";
  const isIronman = theme === "ironman";

  const [batch, setBatch] = useState(defaultBatch);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState("");

  // Sync defaultBatch when modal opens or prop updates
  React.useEffect(() => {
    if (isOpen) {
      setBatch(defaultBatch);
      setStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen, defaultBatch]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Check offline status
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("error");
      setErrorMessage("You can submit only when you are online.");
      return;
    }

    if (!batch.trim()) {
      setStatus("error");
      setErrorMessage("Batch name is required.");
      return;
    }

    if (!description.trim()) {
      setStatus("error");
      setErrorMessage("Discrepancy description is required.");
      return;
    }

    setStatus("submitting");

    // Endpoint resolution: env var -> vercel.json fallback / fallback route -> default endpoint
    const envEndpoint = import.meta.env.VITE_DISCREPANCY_API_URL;
    const endpoint = envEndpoint || "/api/discrepancy";

    const payload = {
      batch: batch.trim(),
      description: description.trim(),
      email: email.trim() || null,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server responded with status ${response.status}`);
      }

      setStatus("success");
      setTimeout(() => {
        setDescription("");
        setEmail("");
        setStatus("idle");
        onClose();
      }, 1800);
    } catch (err) {
      setStatus("error");
      // Double check offline in case fetch failed due to connection drop
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setErrorMessage("You can submit only when you are online.");
      } else {
        setErrorMessage(err.message || "Failed to submit discrepancy report. Please try again later.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`glass-card w-full max-w-md rounded-2xl p-6 border relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] ${
          isDoom
            ? "border-emerald-500/30 bg-zinc-950/95"
            : isIronman
            ? "border-red-500/30 bg-zinc-950/95"
            : "border-white/15 bg-zinc-950/95 text-white"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-white/50 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div
            className={`p-2.5 rounded-xl border ${
              isDoom
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : isIronman
                ? "bg-red-500/10 border-red-500/20 text-red-500"
                : "bg-sky-500/10 border-sky-500/20 text-sky-400"
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-space-grotesk text-xl font-bold text-white leading-tight">
              Report Discrepancy
            </h3>
            <p className="font-share-tech text-xs text-white/50 uppercase tracking-wider">
              {isDoom ? "Imperial Correction Protocol" : isIronman ? "Stark Error Telemetry" : "Feedback & Issue Submission"}
            </p>
          </div>
        </div>

        {status === "success" ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="font-space-grotesk text-lg font-bold text-white">Report Submitted!</h4>
            <p className="text-xs text-white/60 max-w-xs">
              Thank you. Our team will review the batch discrepancy details shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {status === "error" && errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5 uppercase tracking-wider font-share-tech">
                Batch Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1A11, 2COE1..."
                className={`w-full bg-black/60 border rounded-xl px-3.5 py-2.5 text-white outline-none text-sm transition-all placeholder:text-white/30 font-medium ${
                  isDoom
                    ? "border-white/10 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                    : isIronman
                    ? "border-white/10 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20"
                    : "border-white/10 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
                }`}
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5 uppercase tracking-wider font-share-tech">
                Discrepancy Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Please specify incorrect class timing, subject code, room number, or missing elective details..."
                className={`w-full bg-black/60 border rounded-xl px-3.5 py-2.5 text-white outline-none text-sm transition-all placeholder:text-white/30 font-normal leading-relaxed ${
                  isDoom
                    ? "border-white/10 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                    : isIronman
                    ? "border-white/10 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20"
                    : "border-white/10 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
                }`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5 uppercase tracking-wider font-share-tech">
                Contact Email <span className="text-white/40 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="email"
                placeholder="your.email@thapar.edu"
                className={`w-full bg-black/60 border rounded-xl px-3.5 py-2.5 text-white outline-none text-sm transition-all placeholder:text-white/30 font-medium ${
                  isDoom
                    ? "border-white/10 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                    : isIronman
                    ? "border-white/10 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20"
                    : "border-white/10 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={status === "submitting"}
                className="px-4 py-2.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "submitting"}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 active:scale-95 shadow-lg ${
                  isDoom
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                    : isIronman
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-white hover:bg-white/90 text-black"
                }`}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
