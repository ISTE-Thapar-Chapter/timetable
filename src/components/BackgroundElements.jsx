export default function BackgroundElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background">

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Blue Glow */}
      <div
        className="absolute top-[-10%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-blue-500/20 blur-[140px] animate-pulse"
      />

      {/* Moving Lines */}
      <div className="line line1"></div>
      <div className="line line2"></div>
      <div className="line line3"></div>

      {/* Floating Dots */}
      <div className="dot dot1"></div>
      <div className="dot dot2"></div>
      <div className="dot dot3"></div>

    </div>
  );
}
