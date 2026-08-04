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
    console.error("Audio Synthesis failed", e);
  }
};

export default function DoomIntroOverlay() {
  const [show, setShow] = useState(false);
  const [splitting, setSplitting] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = getTheme();
      if (currentTheme === "doom") {
        setShow(true);
        setSplitting(false);
        playDoomSound();

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
      }
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
      {/* Hood */}
      <path d="M12 2C6.5 2 4 6 4 11c0 3.5 1.5 6.5 4 8v3h8v-3c2.5-1.5 4-4.5 4-8 0-5-2.5-9-8-9z" fill="#042f1a" fillOpacity="0.9" />
      
      {/* Eyes steel slot */}
      <path d="M5.5 10.5h13v2.5h-13z" fill="#18181b" />
      
      {/* Menacing angled eye slits */}
      <path d="M7 11.5l2.5-.5M17 11.5l-2.5-.5" stroke="#10b981" strokeWidth="2.5" />
      
      {/* Glowing Green Eye Dots */}
      <circle cx="8.25" cy="11.25" r="1.1" fill="#34d399" className="animate-pulse" />
      <circle cx="15.75" cy="11.25" r="1.1" fill="#34d399" className="animate-pulse" />
      
      {/* Iron rivets */}
      <circle cx="6.5" cy="7" r="0.6" fill="#9ca3af" />
      <circle cx="17.5" cy="7" r="0.6" fill="#9ca3af" />
      <circle cx="6.5" cy="16" r="0.6" fill="#9ca3af" />
      <circle cx="17.5" cy="16" r="0.6" fill="#9ca3af" />

      {/* Nose piece bridge */}
      <path d="M12 10.5v3.5M10 14h4l-2-3.5z" fill="#374151" />

      {/* Vent Grill Mouth */}
      <path d="M9 17.5h6" stroke="#9ca3af" />
      <path d="M10 17.5v2M12 17.5v2M14 17.5v2" stroke="#9ca3af" />
      
      {/* Cheek Seam lines */}
      <path d="M5.5 13c1.5 0 2.5 1 2.5 2.5v1.5M18.5 13c-1.5 0-2.5 1-2.5 2.5v1.5" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none select-none flex overflow-hidden">
      {/* CRT Scanline grid overlay */}
      <div className="absolute inset-0 bg-white/[0.005] pointer-events-none z-50" style={{ backgroundImage: "linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Left Panel */}
      <div
        className={`w-1/2 h-full border-r border-emerald-500/20 relative flex items-center justify-end overflow-hidden transition-transform duration-[850ms] cubic-bezier(0.85, 0, 0.15, 1) ${
          splitting ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{
          background: "radial-gradient(circle at right, rgba(6,35,16,1) 0%, rgba(9,9,11,1) 85%)",
          boxShadow: "inset -15px 0 30px rgba(0,0,0,0.8)"
        }}
      >
        {/* Glow */}
        <div className="absolute right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none translate-x-1/2" />
        
        {/* Left half of Doom Mask SVG */}
        <div className="absolute right-0 translate-x-1/2 h-[32rem] w-[32rem] flex items-center justify-center">
          {renderDoomMaskSVG()}
        </div>

        {/* Text branding on left half */}
        <div className="absolute bottom-20 right-6 text-right pr-3 flex flex-col items-end border-r border-emerald-500/30">
          <h1 className="font-orbitron text-3xl md:text-5xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            DOOM
          </h1>
          <span className="font-share-tech text-[10px] text-white/50 tracking-[0.2em] mt-1 block">REGIME NO. 1962</span>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className={`w-1/2 h-full border-l border-emerald-500/20 relative flex items-center justify-start overflow-hidden transition-transform duration-[850ms] cubic-bezier(0.85, 0, 0.15, 1) ${
          splitting ? "translate-x-full" : "translate-x-0"
        }`}
        style={{
          background: "radial-gradient(circle at left, rgba(6,35,16,1) 0%, rgba(9,9,11,1) 85%)",
          boxShadow: "inset 15px 0 30px rgba(0,0,0,0.8)"
        }}
      >
        {/* Glow */}
        <div className="absolute left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none -translate-x-1/2" />
        
        {/* Right half of Doom Mask SVG */}
        <div className="absolute left-0 -translate-x-1/2 h-[32rem] w-[32rem] flex items-center justify-center">
          {renderDoomMaskSVG()}
        </div>

        {/* Text branding on right half */}
        <div className="absolute bottom-20 left-6 text-left pl-3 flex flex-col items-start border-l border-emerald-500/30">
          <h1 className="font-orbitron text-3xl md:text-5xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            DEMANDS
          </h1>
          <span className="font-share-tech text-[10px] text-amber-500 tracking-[0.18em] mt-1 block">COMPLIANCE</span>
        </div>
      </div>
    </div>
  );
}
