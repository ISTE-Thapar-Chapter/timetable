import { useEffect, useState } from "react";

export const getTheme = () => {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem("theme") === "doom" ? "doom" : "default";
};

export const setTheme = (theme) => {
  if (typeof window === "undefined") return;
  if (theme === "doom") {
    localStorage.setItem("theme", "doom");
    document.documentElement.classList.add("theme-doom");
  } else {
    localStorage.setItem("theme", "default");
    document.documentElement.classList.remove("theme-doom");
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
    if (current === "doom") {
      document.documentElement.classList.add("theme-doom");
    } else {
      document.documentElement.classList.remove("theme-doom");
    }

    return () => {
      window.removeEventListener("themechange", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "doom" ? "default" : "doom";
    setTheme(nextTheme);
  };

  return { theme, toggleTheme };
};
