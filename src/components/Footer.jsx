import { Github, Instagram } from "lucide-react";

export default function Footer() {
  const githubUrl = import.meta.env.VITE_GITHUB || "https://github.com/isteTIET/";
  const instagramUrl = import.meta.env.VITE_INSTAGRM || "https://www.instagram.com/iste_tiet/";

  return (
    <footer className="w-full py-8 mt-20 border-t border-white/5 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/40 order-2 sm:order-1">
          © {new Date().getFullYear()} ISTE Student Chapter. All rights reserved.
        </p>

        <div className="flex items-center gap-4 order-1 sm:order-2">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full p-2 text-white/50 hover:text-white hover:bg-white/10 transition-all"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full p-2 text-white/50 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
