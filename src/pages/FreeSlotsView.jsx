import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Users, ChevronDown, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/utils/theme";

const DoomMaskIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    style={{ width: size, height: size }}
  >
    <path d="M12 2C6.5 2 4 6 4 11c0 3.5 1.5 6.5 4 8v3h8v-3c2.5-1.5 4-4.5 4-8 0-5-2.5-9-8-9z" fill="currentColor" fillOpacity="0.15" />
    <path d="M8 10h8" />
    <path d="M7 11.5l2.5-.5M17 11.5l-2.5-.5" />
    <circle cx="8.25" cy="11.25" r="0.75" fill="#10b981" />
    <circle cx="15.75" cy="11.25" r="0.75" fill="#10b981" />
    <path d="M12 10.5v2.5M10.5 13h3L12 10.5z" fill="#374151" />
    <path d="M9 16.5h6" />
    <path d="M10 16.5v2M12 16.5v2M14 16.5v2" />
  </svg>
);

const ArcReactorIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: size, height: size }}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" fill="currentColor" fillOpacity="0.05" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

const getDoomMockSchedule = (batchName) => {
  const schedule = {};
  const DAYS_LIST = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const TIMES_LIST = [
    "08:00 AM", "08:50 AM", "09:40 AM", "10:30 AM", "11:20 AM",
    "12:10 PM", "01:00 PM", "01:50 PM", "02:40 PM", "03:30 PM",
    "04:20 PM", "05:10 PM", "06:00 PM"
  ];
  
  DAYS_LIST.forEach(day => {
    schedule[day] = {};
    TIMES_LIST.forEach(time => {
      schedule[day][time] = null;
    });

    if (day === "Monday" || day === "Wednesday" || day === "Friday") {
      schedule[day]["09:40 AM"] = ["DOOM101", "Intro to Sorcery", "Castle Doom Sanctum", "Dr. Doom", "L", []];
      schedule[day]["11:20 AM"] = ["DOOM204", "Doombot Robotics Lab", "Armory Level 3", "Doombot Prime", "P", []];
      schedule[day]["02:40 PM"] = ["DOOM399", "Anti-Richards Seminar", "Latverian War Room", "Dr. Doom", "L", []];
    } else {
      schedule[day]["08:50 AM"] = ["DOOM102", "Glory of Latveria History", "Grand Throne Room", "Chancellor", "L", []];
      schedule[day]["01:50 PM"] = ["DOOM444", "Cosmic Power Harnessing", "Sanctum Laboratory", "Dr. Doom", "L", []];
      schedule[day]["03:30 PM"] = ["DOOM555", "Hypnotism & Mind Control", "Dungeon Level 1", "Dr. Doom", "P", []];
    }
  });
  return schedule;
};
import Footer from "@/components/Footer";
import BackgroundElements from "@/components/BackgroundElements";
import Seo from "@/components/Seo";
import { toPng } from 'html-to-image';
import { getBatchesData } from "@/utils/schedule";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = [
  "08:00 AM",
  "08:50 AM",
  "09:40 AM",
  "10:30 AM",
  "11:20 AM",
  "12:10 PM",
  "01:00 PM",
  "01:50 PM",
  "02:40 PM",
  "03:30 PM",
  "04:20 PM",
  "05:10 PM",
  "06:00 PM",
];

const getScheduleStorageKey = (batchName) => `timetable:schedule:${batchName ? batchName.toUpperCase() : ""}`;

const isValidScheduleShape = (value) => value && typeof value === "object" && !Array.isArray(value);

const cloneSchedule = (schedule) => JSON.parse(JSON.stringify(schedule || {}));

const resolveElectives = (schedule, batchName) => {
  if (!schedule || typeof schedule !== "object") return schedule;
  const newSchedule = cloneSchedule(schedule);
  const upperBatch = batchName ? batchName.toUpperCase() : "";
  DAYS.forEach((day) => {
    if (!newSchedule[day]) return;
    Object.keys(newSchedule[day]).forEach((time) => {
      const slot = newSchedule[day][time];
      if (Array.isArray(slot) && slot.length >= 6 && Array.isArray(slot[5]) && slot[5].length > 0) {
        const storageKey = `timetable:elective:${upperBatch}:${day}:${time}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const saved = JSON.parse(stored);
            if (saved && saved.subject_code) {
              newSchedule[day][time] = [
                saved.subject_code,
                saved.place || "",
                saved.subject_name || "",
                saved.type || slot[3] || "Elective",
                slot[4],
                slot[5]
              ];
            }
          } catch (e) {
            console.error("Failed to parse stored elective", e);
          }
        }
      }
    });
  });
  return newSchedule;
};

const normalizeBatchSchedules = (payload, batches) => {
  const raw = payload?.data ?? payload;
  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && typeof raw === "object") {
    return batches.map((batch) => raw[batch] || raw[batch?.toUpperCase?.()] || null);
  }

  return [];
};

const getStoredScheduleForBatch = (batchName) => {
  try {
    const stored = localStorage.getItem(getScheduleStorageKey(batchName));
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return isValidScheduleShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const hasClassInSlot = (schedule, day, time) => {
  const dayData = schedule?.[day];
  if (!dayData || typeof dayData !== "object") return false;

  const slotValue = dayData[time];
  if (slotValue === undefined || slotValue === null) return false;

  if (Array.isArray(slotValue)) {
    const codeStr = String(slotValue[0] ?? "").trim();
    const nameStr = String(slotValue[2] ?? "").trim();
    return codeStr !== "" || nameStr !== "";
  }

  if (typeof slotValue === "string") {
    return slotValue.trim() !== "";
  }

  if (typeof slotValue === "object") {
    return Object.keys(slotValue).length > 0;
  }

  return Boolean(slotValue);
};

const calculateCommonFreeSlots = (schedules) => {
  const validSchedules = schedules.filter((schedule) => isValidScheduleShape(schedule));

  return DAYS.reduce((acc, day) => {
    acc[day] = TIMES.filter((time) => validSchedules.every((schedule) => !hasClassInSlot(schedule, day, time)));
    return acc;
  }, {});
};

export default function FreeSlotsView() {
  const { theme } = useTheme();
  const isDoom = theme === "doom";
  const isIronman = theme === "ironman";
  const location = useLocation();
  const rawBatches = location.state?.batches;
  const batches = useMemo(() => rawBatches || [], [rawBatches]);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(DAYS[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const hiddenTableRef = useRef(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = hiddenTableRef.current;
      if (!element) return;

      await new Promise(r => setTimeout(r, 120));

      const dataUrl = await toPng(element, {
        backgroundColor: "#09090b",
        pixelRatio: 2,
        skipFonts: true,
        cacheBust: true,
        style: {
          transform: 'none',
          opacity: '1',
          visibility: 'visible'
        }
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      const downloadName = batches.length > 0 ? `Free_Slots_${batches.join("_")}.png` : "Common_Free_Slots.png";
      a.download = downloadName;
      a.click();
    } catch (err) {
      console.error("Failed to generate PNG", err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (batches.length > 0) {
          const rawData = getBatchesData(batches);
          const data = { ...rawData };
          batches.forEach(b => {
            if (["CASTLE_DOOM_GUARD_A", "LATVERIA_COHORT_1", "RICHARDS_IS_INFERIOR"].includes(b)) {
              data[b] = getDoomMockSchedule(b);
            }
          });

          if (data && Object.keys(data).length > 0) {
            const backendSchedules = normalizeBatchSchedules(data, batches);

            const mergedSchedules = batches.map((batchName, index) => {
              const localSchedule = getStoredScheduleForBatch(batchName);
              if (localSchedule) {
                return resolveElectives(localSchedule, batchName);
              }

              const backendSchedule = backendSchedules[index];
              const scheduleShape = isValidScheduleShape(backendSchedule) ? backendSchedule : {};
              return resolveElectives(scheduleShape, batchName);
            });

            setResult(calculateCommonFreeSlots(mergedSchedules));
          } else {
            setError("Failed to fetch free slots data.");
          }
        } else {
          setError("No batches provided for free slots.");
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [batches]);

  return (
    <div className="min-h-screen flex flex-col relative text-foreground w-full">
      <Seo
        title="Common Free Slots"
        description="Compare selected batches and discover overlapping free time slots for easier planning."
        path="/freeslots"
        keywords={[
          "free slots",
          "common availability",
          "batch comparison",
          "student planner",
        ]}
      />
      <BackgroundElements />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-16 flex flex-col">
        <div className="mb-8">
          <div className="flex justify-between items-center w-full">
            <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
            {result && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap text-sm shadow-lg shadow-black/20"
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Download PNG
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 mt-6 mb-2">
            <h1 className={`font-space-grotesk text-3xl font-bold text-white flex items-center gap-3 ${
              isDoom ? "text-glow-green" : isIronman ? "text-glow-cyan text-cyan-400" : ""
            }`}>
              {isDoom ? (
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  <DoomMaskIcon size={24} />
                </span>
              ) : isIronman ? (
                <span className="p-2 bg-red-500/20 text-red-500 rounded-lg drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  <ArcReactorIcon size={24} className="animate-pulse" />
                </span>
              ) : (
                <span className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                  <Users size={24} />
                </span>
              )}
              {isDoom ? "Imperial Overlapping Gaps" : isIronman ? "Holo-Gap Analysis" : "Common Free Slots"}
            </h1>
            {batches.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/50 text-sm">
                  {isDoom ? "Assigned Cohorts:" : isIronman ? "Scanned Protocols:" : "Comparing Batches:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {batches.map((b) => (
                    <span key={b} className="text-xs px-2.5 py-1 bg-white/10 rounded-md text-white/90 font-medium">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-white/50">
            {isDoom 
              ? "DOOM enforces synchronization of empty periods between Latverian cohorts." 
              : "Find overlapping free time slots among selected batches."
            }
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 min-h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-white/50 gap-4 relative z-10">
              <Loader2 size={32} className="animate-spin text-amber-500" />
              <p>Calculating common free slots...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center flex-1 text-amber-400 gap-4 relative z-10">
              <p className="text-lg font-medium text-center">{error}</p>
              <Link
                to="/"
                className="mt-2 inline-flex items-center justify-center px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all active:scale-95 text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : result ? (
            <div className="flex-1 flex flex-col relative z-10 w-full">
              {/* Desktop View: Grid (Refined to optimally fill screen) */}
              <div className="hidden md:block w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse table-fixed min-w-[1280px]">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-white/10 bg-white/5/50 font-bold text-white/90 w-28 text-xs sticky left-0 z-20 backdrop-blur-md font-space-grotesk uppercase tracking-wider">
                        Day
                      </th>
                      {TIMES.map((time) => {
                        const [timeVal, period] = time.split(" ");
                        return (
                          <th
                            key={time}
                            className="p-3 border-b border-white/10 bg-white/5/50 font-semibold text-center w-[90px] text-xs text-white"
                          >
                            <div className="flex flex-col items-center justify-center leading-none">
                              <span className="font-space-grotesk">{timeVal}</span>
                              <span className="text-[9px] font-share-tech text-white/40 tracking-widest uppercase mt-1">{period}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <tr key={day} className="group transition-colors">
                        <td className="p-4 border-b border-white/5 bg-black/40 group-hover:bg-white/5 font-medium text-white/80 border-r border-white/10 text-sm sticky left-0 z-10 w-28 backdrop-blur-md transition-colors">
                          {day}
                        </td>
                        {TIMES.map((time) => {
                          const isFree = result[day]?.includes(time);
                          return (
                            <td
                              key={time}
                              className={`p-2 border-b border-white/5 text-center transition-all ${isFree
                                ? "bg-emerald-500/[0.08] hover:bg-emerald-500/[0.15]"
                                : "text-white/20 hover:bg-white/5"
                                }`}
                            >
                              <div className="flex items-center justify-center min-h-[48px] w-full h-full">
                                {isFree ? (
                                  <span className="px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                    FREE
                                  </span>
                                ) : (
                                  <span className="opacity-20">-</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: Accordion / List */}
              <div className="md:hidden flex flex-col gap-4">
                {DAYS.map((day) => {
                  const freeTimes = result[day] || [];
                  const isExpanded = expandedDay === day;

                  return (
                    <div key={day} className="flex flex-col rounded-xl overflow-hidden glass border-white/10">
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : day)}
                        className={`flex items-center justify-between p-4 transition-colors ${isExpanded ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-white/90">{day}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${freeTimes.length > 0
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/10 text-white/40"
                              }`}
                          >
                            {freeTimes.length} slots free
                          </span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-white/50 transition-transform ${isExpanded ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      <div
                        className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                          }`}
                      >
                        <div className="p-4 bg-black/20 border-t border-white/5 flex flex-col gap-2">
                          {freeTimes.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {freeTimes.map((time) => (
                                <div
                                  key={time}
                                  className="flex items-center justify-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
                                >
                                  {time}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-4 text-white/40 text-sm italic">
                              No free slots on this day.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-white/50 relative z-10">
              <p>No data to display.</p>
            </div>
          )}
        </div>

        {/* Off-screen capture template (to ensure perfect, unclipped downloads) */}
        {result && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -9999 }}>
            <div ref={hiddenTableRef} style={{
              width: "1350px",
              padding: "35px",
              background: isDoom ? "#040a06" : isIronman ? "#1c0404" : "#09090b",
              color: "#ffffff",
              fontFamily: "Space Grotesk, sans-serif"
            }}>
              <div style={{
                marginBottom: "25px",
                borderBottom: `2px solid ${isDoom ? 'rgba(16,185,129,0.2)' : isIronman ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'}`,
                paddingBottom: "15px"
              }}>
                <div style={{
                  fontSize: "11px",
                  color: isDoom ? "#10b981" : isIronman ? "#ef4444" : "#f59e0b",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                  textTransform: "uppercase"
                }}>
                  {isDoom ? "IMPERIAL OVERLAPPING GAPS" : isIronman ? "HOLO-GAP DIAGNOSTICS" : "COMMON FREE SLOTS"}
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  margin: "5px 0 0 0",
                  color: isDoom ? "#10b981" : isIronman ? "#ef4444" : "#ffffff"
                }}>
                  {isDoom ? "Latverian Cohort Alignment" : isIronman ? "Stark Protocol Intersection" : "Overlapping Availability"}
                </h2>
                {batches.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                      {isDoom ? "Cohorts:" : isIronman ? "Protocols:" : "Batches:"}
                    </span>
                    {batches.map((b) => (
                      <span key={b} style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", color: "rgba(255,255,255,0.8)" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "12px", borderBottom: "2px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", fontWeight: "bold", color: "#ffffff", width: "110px", textAlign: "left", fontSize: "12px", fontFamily: "Space Grotesk, sans-serif" }}>
                      Day
                    </th>
                    {TIMES.map((time) => {
                      const [timeVal, period] = time.split(" ");
                      return (
                        <th key={time} style={{ padding: "10px", borderBottom: "2px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", fontWeight: "bold", textAlign: "center", width: "95px", fontSize: "11px" }}>
                          <div style={{ fontFamily: "Space Grotesk, sans-serif" }}>{timeVal}</div>
                          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "2px", letterSpacing: "1px" }}>{period}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)", fontWeight: "bold", fontSize: "12px", color: "#ffffff", borderRight: "1px solid rgba(255,255,255,0.1)", fontFamily: "Space Grotesk, sans-serif" }}>
                        {day}
                      </td>
                      {TIMES.map((time) => {
                        const isFree = result[day]?.includes(time);
                        return (
                          <td
                            key={time}
                            style={{
                              padding: "8px",
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              textAlign: "center",
                              background: isFree ? "rgba(16, 185, 129, 0.08)" : "transparent"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40px" }}>
                              {isFree ? (
                                <span style={{
                                  margin: "auto",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  background: "rgba(16, 185, 129, 0.15)",
                                  border: "1px solid rgba(16, 185, 129, 0.2)",
                                  color: "#34d399",
                                  fontWeight: "bold",
                                  fontSize: "10px",
                                  letterSpacing: "1px"
                                }}>
                                  FREE
                                </span>
                              ) : (
                                <span style={{ margin: "auto", color: "rgba(255,255,255,0.15)" }}>-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
