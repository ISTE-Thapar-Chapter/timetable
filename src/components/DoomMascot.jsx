import { useState } from "react";
import { useTheme } from "@/utils/theme";

const playMascotSound = (theme) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (theme === "doom") {
      // Metallic resonance clang
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime); // Low gong tone
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.8);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } else if (theme === "ironman") {
      // High-tech cybernetic repulsor charge & chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(660, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.error("Audio Context failed", e);
  }
};

const DOOM_QUOTES = [
  "DOOM demands your presence in lecture at 08:00 AM! Do not test my patience!",
  "Richards! Even your scheduling algorithm is inferior to DOOM's intellect!",
  "A master of science and magic requires no calendar sync, yet DOOM provides one!",
  "Latverian citizens do not miss tutorials under penalty of disintegration!",
  "Do not test DOOM's patience with custom class overlaps!",
  "The Fantastic Four could never align schedules this efficiently!",
  "Vite HMR is fast, but not as fast as DOOM's absolute decree!",
  "Victory is mine! Your timetable has been optimized!",
  "DOOM decrees that Wednesday afternoons are reserved for Latverian defense drills!",
  "Your syllabus is child's play! DOOM has mastered all cosmic knowledge!",
  "A true ruler plans his week with calculated precision!"
];

const JARVIS_QUOTES = [
  "Welcome back, Boss. All scheduling diagnostics are reporting optimal efficiency.",
  "Sir, I have synchronized your Google Calendar. Ready to fly.",
  "Arc reactor core at 100%. Ready for the practical exam, Boss.",
  "Sir, Rhodey is asking if you're attending the elective presentation or if he should deploy the Mark-IV armor.",
  "Sometimes you gotta run before you can walk. I suggest attending that 8:00 AM lecture, Boss.",
  "Jarvis, show me the schedule overlaps... Done. Excellent choice, Boss.",
  "The clean energy initiative is active, Sir. But your lecture attendance log requires a reboot.",
  "Warning: Mid-week energy depletion detected. Initiating caffeine intake sequence.",
  "Sir, the probability of surviving this Friday's lab is 99.8%. With me, of course.",
  "I have configured the Stark database. Your custom schedule modules have compiled successfully.",
  "Sir, I took the liberty of adjusting your calendar route to bypass heavy traffic. Happy flying."
];

export default function DoomMascot() {
  const { theme } = useTheme();
  const [bubbleText, setBubbleText] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [lastIndex, setLastIndex] = useState(-1);

  if (theme !== "doom" && theme !== "ironman") return null;

  const isDoom = theme === "doom";
  const quotesList = isDoom ? DOOM_QUOTES : JARVIS_QUOTES;

  const handleMascotClick = () => {
    playMascotSound(theme);
    
    // Pick a random quote avoiding back-to-back repeats
    let index = Math.floor(Math.random() * quotesList.length);
    while (index === lastIndex && quotesList.length > 1) {
      index = Math.floor(Math.random() * quotesList.length);
    }
    setLastIndex(index);
    
    setBubbleText(quotesList[index]);
    setShowBubble(true);

    // Auto-fade speech bubble after 5.5 seconds
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 5500);

    return () => clearTimeout(timer);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-auto">
      {/* Speech Bubble */}
      {showBubble && (
        <div className={`mb-3.5 max-w-xs p-4 bg-zinc-950/95 border-2 rounded-2xl text-xs font-share-tech relative animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          isDoom 
            ? "border-emerald-500/30 text-white shadow-[0_8px_30px_rgba(16,185,129,0.2)]" 
            : "border-cyan-500/30 text-white shadow-[0_8px_30px_rgba(6,182,212,0.2)]"
        }`}>
          {/* Arrow */}
          <div className={`absolute bottom-[-8px] right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] ${
            isDoom ? "border-t-emerald-500/30" : "border-t-cyan-500/30"
          }`} />
          <div className="absolute bottom-[-6px] right-[25px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-zinc-950" />
          
          <div className={`font-bold uppercase tracking-wider mb-1 ${
            isDoom ? "text-emerald-400" : "text-cyan-400 text-glow-cyan"
          }`}>
            {isDoom ? "Decree of Doom:" : "JARVIS Protocol:"}
          </div>
          <p className="leading-relaxed">"{bubbleText}"</p>
        </div>
      )}

      {/* Mascot Button */}
      <button
        onClick={handleMascotClick}
        title={isDoom ? "Consult Doom" : "Access JARVIS"}
        className={`h-14 w-14 rounded-full bg-zinc-900 border-2 flex items-center justify-center transition-all active:scale-95 group relative overflow-hidden ${
          isDoom 
            ? "border-emerald-500/40 hover:border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]" 
            : "border-red-500/40 hover:border-red-400 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
        }`}
      >
        {/* Glow Pulse */}
        <div className={`absolute inset-0 transition-colors ${
          isDoom ? "bg-emerald-500/5 group-hover:bg-emerald-500/10" : "bg-red-500/5 group-hover:bg-red-500/10"
        }`} />

        {isDoom ? (
          /* Doom Mask SVG Icon */
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-8 h-8 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] transform group-hover:scale-110 group-hover:rotate-6 transition-all"
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
          /* Stark Arc Reactor SVG Icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] transform group-hover:scale-110 group-hover:rotate-12 transition-all text-cyan-400"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" fill="currentColor" fillOpacity="0.05" />
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" className="animate-pulse" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
