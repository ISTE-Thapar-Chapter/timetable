import { useEffect } from "react";
import AppRouter from "@/router/AppRouter";
import { BrowserRouter } from "react-router-dom";
import DoomIntroOverlay from "@/components/DoomIntroOverlay";
import DoomMascot from "@/components/DoomMascot";

function App() {
  useEffect(() => {
    // Initial anti-flash theme check
    const savedTheme = localStorage.getItem("theme");
    document.documentElement.classList.remove("theme-doom", "theme-ironman");
    if (savedTheme === "doom") {
      document.documentElement.classList.add("theme-doom");
    } else if (savedTheme === "ironman") {
      document.documentElement.classList.add("theme-ironman");
    }
  }, []);

  return (
    <BrowserRouter>
      <DoomIntroOverlay />
      <DoomMascot />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;