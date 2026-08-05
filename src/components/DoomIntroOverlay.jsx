import { useEffect, useState } from "react";
import { getTheme } from "@/utils/theme";

const playDoomSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // 1. Synth Oscillator for low-frequency steel rumble
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(50, ctx.currentTime); // Low G note
    osc1.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 1.4);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(100, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.6);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(160, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);

    gainNode.gain.setValueAtTime(0.7, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 2. High metallic impact clink
    const oscMetal = ctx.createOscillator();
    const metalGain = ctx.createGain();
    oscMetal.type = "triangle";
    oscMetal.frequency.setValueAtTime(800, ctx.currentTime);
    oscMetal.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);

    metalGain.gain.setValueAtTime(0.25, ctx.currentTime);
    metalGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    oscMetal.connect(metalGain);
    metalGain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    oscMetal.start();
    osc1.stop(ctx.currentTime + 1.8);
    osc2.stop(ctx.currentTime + 1.8);
    oscMetal.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Doom Audio Synthesis failed", e);
  }
};

const playStarkSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // 1. Futuristic repulsor charge sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(960, ctx.currentTime + 1.1);

    filter.type = "peaking";
    filter.frequency.setValueAtTime(250, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 1.0);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // 2. Cybernetic JARVIS chime alert
    const oscChime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    oscChime.type = "sine";
    oscChime.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6 note
    oscChime.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.12); // E6 note

    chimeGain.gain.setValueAtTime(0.12, ctx.currentTime);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    oscChime.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    osc.start();
    oscChime.start();
    osc.stop(ctx.currentTime + 1.6);
    oscChime.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Stark Audio Synthesis failed", e);
  }
};

const playDefaultSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error("Default Audio failed", e);
  }
};

export default function DoomIntroOverlay() {
  const [show, setShow] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [transitionTheme, setTransitionTheme] = useState(null); // 'doom', 'ironman', 'default'

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = getTheme();
      setTransitionTheme(currentTheme);
      setShow(true);
      setSplitting(false);

      if (currentTheme === "doom") {
        playDoomSound();
      } else if (currentTheme === "ironman") {
        playStarkSound();
      } else {
        playDefaultSound();
      }

      // Start splitting panels after 1.2 seconds
      const splitTimer = setTimeout(() => {
        setSplitting(true);
      }, 1200);

      // Remove from DOM after 2.1 seconds (giving transition 900ms to finish)
      const closeTimer = setTimeout(() => {
        setShow(false);
      }, 2100);

      return () => {
        clearTimeout(splitTimer);
        clearTimeout(closeTimer);
      };
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => {
      window.removeEventListener("themechange", handleThemeChange);
    };
  }, []);

  if (!show) return null;

  const renderDoomMaskSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[28rem] h-[28rem] drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] pointer-events-none select-none"
    >
      <path d="M12 2C6.5 2 4 6 4 11c0 3.5 1.5 6.5 4 8v3h8v-3c2.5-1.5 4-4.5 4-8 0-5-2.5-9-8-9z" fill="#042f1a" fillOpacity="0.9" />
      <path d="M5.5 10.5h13v2.5h-13z" fill="#18181b" />
      <path d="M7 11.5l2.5-.5M17 11.5l-2.5-.5" stroke="#10b981" strokeWidth="2.5" />
      <circle cx="8.25" cy="11.25" r="1.1" fill="#34d399" className="animate-pulse" />
      <circle cx="15.75" cy="11.25" r="1.1" fill="#34d399" className="animate-pulse" />
      <circle cx="6.5" cy="7" r="0.6" fill="#9ca3af" />
      <circle cx="17.5" cy="7" r="0.6" fill="#9ca3af" />
      <circle cx="6.5" cy="16" r="0.6" fill="#9ca3af" />
      <circle cx="17.5" cy="16" r="0.6" fill="#9ca3af" />
      <path d="M12 10.5v3.5M10 14h4l-2-3.5z" fill="#374151" />
      <path d="M9 17.5h6" stroke="#9ca3af" />
      <path d="M10 17.5v2M12 17.5v2M14 17.5v2" stroke="#9ca3af" />
      <path d="M5.5 13c1.5 0 2.5 1 2.5 2.5v1.5M18.5 13c-1.5 0-2.5 1-2.5 2.5v1.5" />
    </svg>
  );

  const renderArcReactorSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[28rem] h-[28rem] drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] pointer-events-none select-none animate-[spin_12s_linear_infinite]"
    >
      <circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="0.8" fill="rgba(28,4,4,0.3)" />
      <circle cx="12" cy="12" r="8" stroke="#0891b2" strokeWidth="1.2" strokeDasharray="3 3" />
      <circle cx="12" cy="12" r="6" stroke="#22d3ee" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="#22d3ee" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="3" stroke="#22d3ee" strokeWidth="1.8" fill="rgba(34,211,238,0.2)" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#fbbf24" strokeWidth="1.5" />
      <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" fill="#ffffff" className="animate-pulse" />
    </svg>
  );

  const renderDefaultShieldSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#38bdf8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[28rem] h-[28rem] drop-shadow-[0_0_20px_rgba(56,189,248,0.4)] pointer-events-none select-none"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(3,7,18,0.6)" strokeWidth="1.5" />
      <path d="M12 5v14M5 11h14" stroke="#0ea5e9" strokeWidth="0.8" strokeDasharray="3 3" />
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="#38bdf8" strokeWidth="1.8" fill="rgba(56,189,248,0.1)" />
      <circle cx="12" cy="12" r="1.5" fill="#38bdf8" />
    </svg>
  );

  const isDoom = transitionTheme === "doom";
  const isIronman = transitionTheme === "ironman";

  const getOverlayCenterItem = () => {
    if (isDoom) return renderDoomMaskSVG();
    if (isIronman) return renderArcReactorSVG();
    return renderDefaultShieldSVG();
  };

  const getThemeTextLeft = () => {
    if (isDoom) return { title: "DOOM", sub: "REGIME NO. 1962" };
    if (isIronman) return { title: "STARK", sub: "MARK LXXXV PROTOCOL" };
    return { title: "DEFAULT", sub: "ISTE SYSTEM CORE" };
  };

  const getThemeTextRight = () => {
    if (isDoom) return { title: "DEMANDS", sub: "COMPLIANCE" };
    if (isIronman) return { title: "OS", sub: "INITIALIZED" };
    return { title: "PROTOCOL", sub: "RESTORED" };
  };

  const textLeft = getThemeTextLeft();
  const textRight = getThemeTextRight();

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none select-none flex overflow-hidden">
      {/* HUD scanline grid overlay */}
      <div 
        className="absolute inset-0 bg-white/[0.005] pointer-events-none z-50" 
        style={{ 
          backgroundImage: `linear-gradient(${isDoom ? "rgba(16,185,129,0.04)" : isIronman ? "rgba(6,182,212,0.04)" : "rgba(56,189,248,0.04)"} 1px, transparent 1px), linear-gradient(90deg, ${isDoom ? "rgba(16,185,129,0.04)" : isIronman ? "rgba(6,182,212,0.04)" : "rgba(56,189,248,0.04)"} 1px, transparent 1px)`, 
          backgroundSize: "32px 32px" 
        }} 
      />

      {/* Left Panel */}
      <div
        className={`w-1/2 h-full relative flex items-center justify-end overflow-hidden transition-transform duration-[850ms] cubic-bezier(0.85, 0, 0.15, 1) ${
          splitting ? "-translate-x-full" : "translate-x-0"
        } ${isDoom ? "border-r border-emerald-500/20" : isIronman ? "border-r border-red-500/20" : "border-r border-sky-500/20"}`}
        style={{
          background: isDoom 
            ? "radial-gradient(circle at right, rgba(6,35,16,1) 0%, rgba(9,9,11,1) 85%)" 
            : isIronman 
              ? "radial-gradient(circle at right, rgba(38,4,4,1) 0%, rgba(9,9,11,1) 85%)"
              : "radial-gradient(circle at right, rgba(8,20,38,1) 0%, rgba(9,9,11,1) 85%)",
          boxShadow: "inset -15px 0 30px rgba(0,0,0,0.8)"
        }}
      >
        {/* Glow */}
        <div className={`absolute right-0 w-96 h-96 rounded-full filter blur-3xl pointer-events-none translate-x-1/2 ${
          isDoom ? "bg-emerald-500/10" : isIronman ? "bg-red-500/10" : "bg-sky-500/10"
        }`} />
        
        {/* Left half of SVG */}
        <div className="absolute right-0 translate-x-1/2 h-[32rem] w-[32rem] flex items-center justify-center">
          {getOverlayCenterItem()}
        </div>

        {/* Text branding on left half */}
        <div className={`absolute bottom-20 right-6 text-right pr-3 flex flex-col items-end border-r ${
          isDoom ? "border-emerald-500/30" : isIronman ? "border-red-500/30" : "border-sky-500/30"
        }`}>
          <h1 className={`font-orbitron text-3xl md:text-5xl font-black tracking-widest ${
            isDoom 
              ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
              : isIronman 
                ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] text-glow-red" 
                : "text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          }`}>
            {textLeft.title}
          </h1>
          <span className="font-share-tech text-[10px] text-white/50 tracking-[0.2em] mt-1 block">
            {textLeft.sub}
          </span>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className={`w-1/2 h-full relative flex items-center justify-start overflow-hidden transition-transform duration-[850ms] cubic-bezier(0.85, 0, 0.15, 1) ${
          splitting ? "translate-x-full" : "translate-x-0"
        } ${isDoom ? "border-l border-emerald-500/20" : isIronman ? "border-l border-red-500/20" : "border-l border-sky-500/20"}`}
        style={{
          background: isDoom 
            ? "radial-gradient(circle at left, rgba(6,35,16,1) 0%, rgba(9,9,11,1) 85%)" 
            : isIronman 
              ? "radial-gradient(circle at left, rgba(38,4,4,1) 0%, rgba(9,9,11,1) 85%)"
              : "radial-gradient(circle at left, rgba(8,20,38,1) 0%, rgba(9,9,11,1) 85%)",
          boxShadow: "inset 15px 0 30px rgba(0,0,0,0.8)"
        }}
      >
        {/* Glow */}
        <div className={`absolute left-0 w-96 h-96 rounded-full filter blur-3xl pointer-events-none -translate-x-1/2 ${
          isDoom ? "bg-emerald-500/10" : isIronman ? "bg-red-500/10" : "bg-sky-500/10"
        }`} />
        
        {/* Right half of SVG */}
        <div className="absolute left-0 -translate-x-1/2 h-[32rem] w-[32rem] flex items-center justify-center">
          {getOverlayCenterItem()}
        </div>

        {/* Text branding on right half */}
        <div className={`absolute bottom-20 left-6 text-left pl-3 flex flex-col items-start border-l ${
          isDoom ? "border-emerald-500/30" : isIronman ? "border-red-500/30" : "border-sky-500/30"
        }`}>
          <h1 className={`font-orbitron text-3xl md:text-5xl font-black tracking-widest ${
            isDoom 
              ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
              : isIronman 
                ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] text-glow-red" 
                : "text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          }`}>
            {textRight.title}
          </h1>
          <span className={`font-share-tech text-[10px] tracking-[0.18em] mt-1 block ${
            isDoom ? "text-amber-500" : isIronman ? "text-cyan-400 text-glow-cyan" : "text-amber-400"
          }`}>
            {textRight.sub}
          </span>
        </div>
      </div>
    </div>
  );
}
