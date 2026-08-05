import { useEffect, useRef } from "react";

export default function BackgroundElements() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let mouse = { x: null, y: null, radius: 110 };

    // Set dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle template
    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * 1.0 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 30 + 1;
        // Speeds
        this.vx = (Math.random() - 0.5) * 0.12;
        this.vy = (Math.random() - 0.5) * 0.12;
        // Track color type for dynamic updates on theme toggles
        this.colorType = Math.random() > 0.3 ? "primary" : "secondary";
      }

      update() {
        // Drift slowly
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on borders
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Interactive cursor push (Easter Egg)
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density * 0.5;
            let directionY = forceDirectionY * force * this.density * 0.5;
            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }

      draw() {
        const isDoom = document.documentElement.classList.contains("theme-doom");
        const isIronman = document.documentElement.classList.contains("theme-ironman");
        // Latverian magic (neon green/silver) vs Stark Protocol (crimson/gold) vs default cyan/amber
        let color;
        if (isDoom) {
          color = this.colorType === "primary" ? "rgba(16, 185, 129, 0.25)" : "rgba(209, 213, 219, 0.2)";
        } else if (isIronman) {
          color = this.colorType === "primary" ? "rgba(239, 68, 68, 0.3)" : "rgba(251, 191, 36, 0.2)";
        } else {
          color = this.colorType === "primary" ? "rgba(56, 189, 248, 0.2)" : "rgba(245, 158, 11, 0.2)";
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Populate particles
    const init = () => {
      particles = [];
      const numberOfParticles = Math.min(35, Math.floor((canvas.width * canvas.height) / 45000));
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };
    init();

    // Mouse handlers
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Click creates a tiny, neat burst of particles (non-intrusive)
    const handleMouseClick = (e) => {
      const burstCount = 6;
      for (let i = 0; i < burstCount; i++) {
        const p = new Particle(e.clientX, e.clientY);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.4;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.size = Math.random() * 1.2 + 0.6;
        p.colorType = Math.random() > 0.4 ? "primary" : "secondary";
        particles.push(p);
      }
      // Cap max particles so it doesn't slow down
      if (particles.length > 100) {
        particles.splice(0, particles.length - 100);
      }
    };
    window.addEventListener("click", handleMouseClick);

    // Loop
    const animate = () => {
      const isDoom = document.documentElement.classList.contains("theme-doom");
      const isIronman = document.documentElement.classList.contains("theme-ironman");
      if (isDoom || isIronman) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#030712"; // Solid theme background color (rich dark indigo/black)
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Subtle grid pattern drawn over solid background
      let strokeStyle = "rgba(255, 255, 255, 0.012)";
      if (isDoom) {
        strokeStyle = "rgba(16, 185, 129, 0.012)";
      } else if (isIronman) {
        strokeStyle = "rgba(6, 182, 212, 0.012)";
      }
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      // Draw cursor hover light aura (subtle glow Easter Egg)
      if (mouse.x !== null && mouse.y !== null) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius * 1.1);
        if (isDoom) {
          glow.addColorStop(0, "rgba(16, 185, 129, 0.045)");
          glow.addColorStop(0.5, "rgba(52, 211, 153, 0.015)");
        } else if (isIronman) {
          glow.addColorStop(0, "rgba(6, 182, 212, 0.05)");
          glow.addColorStop(0.5, "rgba(34, 211, 238, 0.015)");
        } else {
          glow.addColorStop(0, "rgba(56, 189, 248, 0.035)");
          glow.addColorStop(0.5, "rgba(99, 102, 241, 0.015)");
        }
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleMouseClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-transparent"
    />
  );
}
