import { useEffect, useState } from "react";

export const getTheme = () => {
  if (typeof window === "undefined") return "default";
  const saved = localStorage.getItem("theme");
  if (saved === "doom") return "doom";
  if (saved === "ironman") return "ironman";
  return "default";
};

export const setTheme = (theme) => {
  if (typeof window === "undefined") return;
  
  // Remove all custom theme classes
  document.documentElement.classList.remove("theme-doom", "theme-ironman");
  
  if (theme === "doom") {
    localStorage.setItem("theme", "doom");
    document.documentElement.classList.add("theme-doom");
  } else if (theme === "ironman") {
    localStorage.setItem("theme", "ironman");
    document.documentElement.classList.add("theme-ironman");
  } else {
    localStorage.setItem("theme", "default");
  }
  window.dispatchEvent(new Event("themechange"));
};

export const useTheme = () => {
  const [theme, setThemeState] = useState(getTheme);

  useEffect(() => {
    const handleThemeChange = () => {
      setThemeState(getTheme());
    };

    window.addEventListener("themechange", handleThemeChange);
    // Initial class sync in case state is mismatched
    const current = getTheme();
    document.documentElement.classList.remove("theme-doom", "theme-ironman");
    if (current === "doom") {
      document.documentElement.classList.add("theme-doom");
    } else if (current === "ironman") {
      document.documentElement.classList.add("theme-ironman");
    }

    return () => {
      window.removeEventListener("themechange", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "default" ? "ironman" : theme === "ironman" ? "doom" : "default";
    setTheme(nextTheme);
  };

  return { theme, setTheme, toggleTheme };
};

