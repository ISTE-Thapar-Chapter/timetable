import { useEffect } from "react";
import AppRouter from "@/router/AppRouter";
import { BrowserRouter } from "react-router-dom";
import DoomIntroOverlay from "@/components/DoomIntroOverlay";
import DoomMascot from "@/components/DoomMascot";
import MaintenanceMode from "@/components/MaintenanceMode";
import CONFIG from "@/config";
import { Analytics } from "@vercel/analytics/react";

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

  if (CONFIG.IS_MAINTENANCE_MODE) {
    return <MaintenanceMode />;
  }

  return (
    <BrowserRouter>
      <DoomIntroOverlay />
      <DoomMascot />
      <AppRouter />
      <Analytics />
    </BrowserRouter>
  );
}

export default App;