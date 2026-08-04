import { Github, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/utils/theme";

export default function Navbar({ onLogoClick }) {
  const { theme, toggleTheme } = useTheme();
  const isDoom = theme === "doom";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto rounded-2xl px-5 md:px-6 py-3 flex items-center justify-between border border-white/15 bg-zinc-950/85 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/70 shadow-[0_8px_30px_rgba(0,0,0,0.45)] md:border-white/10 md:bg-white/5 md:backdrop-blur-md md:supports-[backdrop-filter]:bg-white/5 md:shadow-[0_4px_20px_rgba(0,0,0,0.28)]">
        <Link 
          to="/" 
          onClick={(e) => {
            if (onLogoClick) {
              e.preventDefault();
              onLogoClick();
            }
          }}
          className="flex items-center gap-3.5 group"
        >
          <img
            src="/logo.png"
            alt="ISTE Logo"
            className="h-12 w-auto transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col justify-center leading-none">
            <span className={`font-orbitron text-2xl md:text-3xl font-black tracking-wider text-white transition-colors duration-200 ${isDoom ? "group-hover:text-emerald-400" : "group-hover:text-sky-400"}`}>
              ISTE
            </span>
            <span className={`font-share-tech text-[10px] md:text-[11px] font-medium tracking-[0.15em] uppercase text-white/50 mt-1 transition-colors duration-200 ${isDoom ? "group-hover:text-emerald-400/80" : "group-hover:text-amber-400/80"}`}>
              Thapar Chapter
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {/* Doom Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDoom ? "Restore Default Regime" : "Initialize Latverian Regime"}
            className="rounded-full p-2 text-white/85 hover:text-white hover:bg-white/15 transition-all duration-200 md:text-white/70 md:hover:bg-white/10 flex items-center justify-center relative group"
          >
            {isDoom ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#34d399" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"
              >
                <path d="M12 2C6.5 2 4 6 4 11c0 3.5 1.5 6.5 4 8v3h8v-3c2.5-1.5 4-4.5 4-8 0-5-2.5-9-8-9z" fill="currentColor" fillOpacity="0.1" />
                <path d="M8 10h8" />
                <path d="M7 11.5l2.5-.5M17 11.5l-2.5-.5" />
                <circle cx="8.5" cy="11.25" r="0.6" fill="#10b981" />
                <circle cx="15.5" cy="11.25" r="0.6" fill="#10b981" />
                <path d="M12 10.5v2.5M10.5 13h3L12 10.5z" />
                <path d="M9 16.5h6" />
                <path d="M10 16.5v2M12 16.5v2M14 16.5v2" />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-105"
              >
                <path d="M12 2C6.5 2 4 6 4 11c0 3.5 1.5 6.5 4 8v3h8v-3c2.5-1.5 4-4.5 4-8 0-5-2.5-9-8-9z" />
                <path d="M8 10h8" />
                <circle cx="8" cy="11" r="0.5" fill="currentColor" />
                <circle cx="16" cy="11" r="0.5" fill="currentColor" />
                <path d="M12 10v3M9 16h6" />
              </svg>
            )}
          </button>

          <a
            href={import.meta.env.VITE_GITHUB || "https://github.com/isteTIET/"}
            target="_blank"
            rel="noreferrer"
            className="rounded-full p-2 text-white/85 hover:text-white hover:bg-white/15 transition-colors md:text-white/70 md:hover:bg-white/10"
          >
            <Github size={20} />
          </a>
          <a
            href={import.meta.env.VITE_INSTAGRM || "https://www.instagram.com/iste_tiet/"}
            target="_blank"
            rel="noreferrer"
            className="rounded-full p-2 text-white/85 hover:text-white hover:bg-white/15 transition-colors md:text-white/70 md:hover:bg-white/10"
          >
            <Instagram size={20} />
          </a>
        </div>
      </div>
    </nav>
  );
}
