import { useState } from "react";
import { useTheme } from "@/utils/theme";

const playMascotSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
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
  "The Fantastic Four could never align 9 schedules this efficiently!",
  "Vite HMR is fast, but not as fast as DOOM's absolute decree!",
  "Victory is mine! Your timetable has been optimized!",
  "DOOM decrees that Wednesday afternoons are reserved for Latverian defense drills!",
  "Your syllabus is child's play! DOOM has mastered all cosmic knowledge!",
  "A true ruler plans his week with calculated precision!"
];

export default function DoomMascot() {
  const { theme } = useTheme();
  const [bubbleText, setBubbleText] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [lastIndex, setLastIndex] = useState(-1);

  if (theme !== "doom") return null;

  const handleMascotClick = () => {
    playMascotSound();
    
    // Pick a random quote avoiding back-to-back repeats
    let index = Math.floor(Math.random() * DOOM_QUOTES.length);
    while (index === lastIndex) {
      index = Math.floor(Math.random() * DOOM_QUOTES.length);
    }
    setLastIndex(index);
    
    setBubbleText(DOOM_QUOTES[index]);
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
        <div className="mb-3.5 max-w-xs p-4 bg-zinc-950/95 border-2 border-emerald-500/30 text-white rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.2)] text-xs font-share-tech relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Arrow */}
          <div className="absolute bottom-[-8px] right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-emerald-500/30" />
          <div className="absolute bottom-[-6px] right-[25px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-zinc-950" />
          
          <div className="text-emerald-400 font-bold uppercase tracking-wider mb-1">Decree of Doom:</div>
          <p className="leading-relaxed">"{bubbleText}"</p>
        </div>
      )}

      {/* Mascot Button */}
      <button
        onClick={handleMascotClick}
        title="Consult Doom"
        className="h-14 w-14 rounded-full bg-zinc-900 border-2 border-emerald-500/40 hover:border-emerald-400 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-95 group relative overflow-hidden"
      >
        {/* Magic Green Glow Pulse */}
        <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />

        {/* Doom Mask SVG Icon */}
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
      </button>
    </div>
  );
}
