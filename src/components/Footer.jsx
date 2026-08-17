import { useState } from "react";
import { Github, Instagram, AlertTriangle } from "lucide-react";
import DiscrepancyModal from "@/components/DiscrepancyModal";

export default function Footer({ defaultBatch = "" }) {
  const [isDiscrepancyOpen, setIsDiscrepancyOpen] = useState(false);
  const githubUrl = import.meta.env.VITE_GITHUB || "https://github.com/isteTIET/";
  const instagramUrl = import.meta.env.VITE_INSTAGRM || "https://www.instagram.com/iste_tiet/";

  return (
    <>
      <footer className="w-full py-8 mt-20 border-t border-white/10 bg-zinc-950/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 order-2 sm:order-1">
            <p className="text-xs text-white/40 hover:text-white/60 transition-colors">
              © {new Date().getFullYear()} ISTE Student Chapter. All rights reserved.
            </p>
            <button
              onClick={() => setIsDiscrepancyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-semibold transition-all duration-200 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
              <AlertTriangle size={14} />
              <span>Report Discrepancy</span>
            </button>
          </div>

          <div className="flex items-center gap-4 order-1 sm:order-2">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full p-2 text-white/50 hover:text-sky-400 hover:bg-sky-500/10 hover:scale-110 shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all duration-200 border border-transparent hover:border-sky-500/30"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full p-2 text-white/50 hover:text-amber-400 hover:bg-amber-500/10 hover:scale-110 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-200 border border-transparent hover:border-amber-500/30"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </footer>

      <DiscrepancyModal
        isOpen={isDiscrepancyOpen}
        onClose={() => setIsDiscrepancyOpen(false)}
        defaultBatch={defaultBatch}
      />
    </>
  );
}

