import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Calendar, Download, Plus, Trash2, X, ChevronDown } from "lucide-react";
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

import { batchScheduleData } from "@/utils/schedule";
import subjectMap from "@/assets/subjectMap.json" with { type: "json" };

const getSubjectNameFromMap = (code) => {
  if (!code) return "";
  const cleaned = code.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!cleaned) return "";

  // 1. Direct match
  if (subjectMap[cleaned]) return subjectMap[cleaned];

  // 2. Custom match (exact match after cleaning keys, or prefix match if length >= 5)
  const keys = Object.keys(subjectMap);
  const exactKey = keys.find((k) => k.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleaned);
  if (exactKey) return subjectMap[exactKey];

  if (cleaned.length >= 5) {
    const partialKey = keys.find((k) => {
      const kClean = k.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      return kClean.startsWith(cleaned) || cleaned.startsWith(kClean);
    });
    if (partialKey) return subjectMap[partialKey];
  }
  return "";
};

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

const parseSubjectCode = (code) => {
  if (!code) return { cleanCode: "", note: "" };
  const match = code.match(/([^(]+)\((UPTO[^)]+)\)/i);
  if (match) {
    let note = match[2].trim();
    const timeMatch = note.match(/UPTO(\d{2}):(\d{2})(AM|PM)/i);
    if (timeMatch) {
      note = `Upto ${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3]}`;
    }
    return {
      cleanCode: match[1].trim(),
      note: note
    };
  }
  return { cleanCode: code, note: "" };
};
const isValidScheduleShape = (value) => value && typeof value === "object" && !Array.isArray(value);

const getTypeColors = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("lecture")) return "bg-blue-500/10 border-blue-500/30 text-blue-300";
  if (t.includes("practical") || t.includes("lab")) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
  if (t.includes("tutorial")) return "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300";
  if (t.includes("elective")) return "bg-amber-500/10 border-amber-500/30 text-amber-300";
  return "bg-white/5 border-white/10 text-white/70";
};

const getTypeBadgeColors = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("lecture")) return "bg-blue-500/20 text-blue-400";
  if (t.includes("practical") || t.includes("lab")) return "bg-emerald-500/20 text-emerald-400";
  if (t.includes("tutorial")) return "bg-fuchsia-500/20 text-fuchsia-400";
  if (t.includes("elective")) return "bg-amber-500/20 text-amber-400";
  return "bg-white/10 text-white/50";
};

export default function ScheduleView() {
  const { theme } = useTheme();
  const isDoom = theme === "doom";
  const isIronman = theme === "ironman";
  const [searchParams] = useSearchParams();
  const batch = searchParams.get("batch");
  const seoPath = batch ? `/schedule?batch=${encodeURIComponent(batch)}` : "/schedule";
  const seoTitle = batch ? `${batch} Schedule` : "Schedule";
  const seoDescription = batch
    ? `View and edit the timetable for ${batch}, then export your schedule as a PNG.`
    : "View and edit your timetable, then export the schedule as a PNG.";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null); // original
  const [editedResult, setEditedResult] = useState(null); // local edits
  const [error, setError] = useState(null);

  const [expandedDay, setExpandedDay] = useState(DAYS[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasSavedLocalData, setHasSavedLocalData] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditSlot, setCurrentEditSlot] = useState(null); // { day, time }
  const [modalFormData, setModalFormData] = useState({ code: "", location: "", name: "", type: "Lecture", altWeek: null, options: [] });

  const [expandedCell, setExpandedCell] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);

  const desktopTableRef = useRef(null);
  const hiddenTableRef = useRef(null); // For mobile capturing

  useEffect(() => {
    const handleClick = () => setExpandedCell(null);
    if (expandedCell) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [expandedCell]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (batch) {
          let resolvedBackend;
          if (["CASTLE_DOOM_GUARD_A", "LATVERIA_COHORT_1", "RICHARDS_IS_INFERIOR"].includes(batch)) {
            resolvedBackend = getDoomMockSchedule(batch);
          } else {
            const data = batchScheduleData(batch);
            if (data && Object.keys(data).length !== 0) {
              resolvedBackend = resolveElectives(data, batch);
            } else {
              resolvedBackend = null;
            }
          }

          if (resolvedBackend) {
            setResult(resolvedBackend);

            const storageKey = getScheduleStorageKey(batch);
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
              try {
                const parsed = JSON.parse(savedData);
                if (isValidScheduleShape(parsed)) {
                  setEditedResult(resolveElectives(parsed, batch));
                  setHasSavedLocalData(true);
                } else {
                  setEditedResult(cloneSchedule(resolvedBackend));
                  setHasSavedLocalData(false);
                }
              } catch {
                setEditedResult(cloneSchedule(resolvedBackend));
                setHasSavedLocalData(false);
              }
            } else {
              setEditedResult(cloneSchedule(resolvedBackend));
              setHasSavedLocalData(false);
            }
          } else {
            setError(`Batch "${batch}" not found. Please check the batch name and try again.`);
          }
        } else {
          setError("No batch specified.");
        }
      } catch (err) {
        setError(`Connection failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [batch]);

  useEffect(() => {
    if (!saveStatus) return;
    const timeoutId = setTimeout(() => setSaveStatus(""), 2400);
    return () => clearTimeout(timeoutId);
  }, [saveStatus]);

  const handleSaveLocal = () => {
    if (!batch || !editedResult) return;
    try {
      const upperBatch = batch.toUpperCase();
      const storageKey = getScheduleStorageKey(batch);
      localStorage.setItem(storageKey, JSON.stringify(editedResult));

      // Save elective selection configurations
      DAYS.forEach((day) => {
        if (!editedResult[day]) return;
        Object.keys(editedResult[day]).forEach((time) => {
          const slot = editedResult[day][time];
          if (Array.isArray(slot) && slot.length >= 6 && Array.isArray(slot[5]) && slot[5].length > 0) {
            if (slot[0] && slot[0] !== "ELECTIVE") {
              const electiveStorageKey = `timetable:elective:${upperBatch}:${day}:${time}`;
              const selectedItem = slot[5].find(opt => opt.subject_code === slot[0]);
              if (selectedItem) {
                localStorage.setItem(electiveStorageKey, JSON.stringify(selectedItem));
              }
            }
          }
        });
      });

      setHasSavedLocalData(true);
      setSaveStatus("Saved locally for this batch.");
    } catch {
      setSaveStatus("Could not save locally on this device.");
    }
  };

  const handleResetLocal = () => {
    if (!batch) return;
    const upperBatch = batch.toUpperCase();
    const storageKey = getScheduleStorageKey(batch);
    localStorage.removeItem(storageKey);

    // Clear elective keys for this batch
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(`timetable:elective:${batch}:`) || key.startsWith(`timetable:elective:${upperBatch}:`))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    setHasSavedLocalData(false);
    setSaveStatus("Local saved data removed. Using backend default.");
    if (result) {
      setEditedResult(cloneSchedule(result));
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // ALways use the hidden off-screen table for reliable, unclipped PNG generation
      const element = hiddenTableRef.current;
      if (!element) return;

      // Small delay to ensure React commits and CSS paints the hidden table properly
      await new Promise(r => setTimeout(r, 100));

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
      a.download = `Timetable_${batch}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate PNG", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const openSlotModal = (day, time, slotData) => {
    setCurrentEditSlot({ day, time });
    if (slotData && Array.isArray(slotData)) {
      setModalFormData({
        code: slotData[0] || "",
        location: slotData[1] || "",
        name: slotData[2] || "",
        type: slotData[3] || "Lecture",
        altWeek: slotData[4] || null,
        options: slotData[5] || []
      });
    } else if (slotData && typeof slotData === "string") {
      setModalFormData({ code: "", location: "", name: slotData, type: "Lecture", altWeek: null, options: [] });
    } else {
      setModalFormData({ code: "", location: "", name: "", type: "Lecture", altWeek: null, options: [] });
    }
    setIsModalOpen(true);
    setExpandedCell(null);
  };

  const saveSlot = () => {
    const { day, time } = currentEditSlot;
    const newSchedule = { ...editedResult };
    if (!newSchedule[day]) newSchedule[day] = {};

    newSchedule[day][time] = [
      modalFormData.code.trim().toUpperCase(),
      modalFormData.location.trim().toUpperCase(),
      modalFormData.name.trim().toUpperCase(),
      modalFormData.type,
      modalFormData.altWeek,
      modalFormData.options
    ];

    setEditedResult(newSchedule);
    setIsModalOpen(false);
  };

  const deleteSlot = () => {
    const { day, time } = currentEditSlot;
    const newSchedule = { ...editedResult };
    if (newSchedule[day]) {
      delete newSchedule[day][time];
    }
    setEditedResult(newSchedule);
    setIsModalOpen(false);
  };

  const handleDrop = (e, targetDay, targetTime) => {
    e.preventDefault();
    setDragOverCell(null);
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;

      const { sourceDay, sourceTime } = JSON.parse(dataStr);
      if (sourceDay === targetDay && sourceTime === targetTime) return;

      const newSchedule = { ...editedResult };

      const sourceSlot = newSchedule[sourceDay]?.[sourceTime];
      const targetSlot = newSchedule[targetDay]?.[targetTime];

      if (!newSchedule[targetDay]) newSchedule[targetDay] = {};
      if (!newSchedule[sourceDay]) newSchedule[sourceDay] = {};

      if (sourceSlot) {
        newSchedule[targetDay][targetTime] = sourceSlot;
      } else {
        delete newSchedule[targetDay][targetTime];
      }

      if (targetSlot) {
        newSchedule[sourceDay][sourceTime] = targetSlot;
      } else {
        delete newSchedule[sourceDay][sourceTime];
      }

      setEditedResult(newSchedule);
    } catch (err) {
      console.error("Failed to parse drag data", err);
    }
  };

  // Shared generic cell render function
  const renderCellContent = (subjectList, isDesktop = true, isExpanded = false, onEdit = null) => {
    if (!subjectList) return null;

    let code, loc, name, type, altWeek, options;
    if (Array.isArray(subjectList)) {
      [code, loc, name, type, altWeek, options] = subjectList;
    } else {
      name = subjectList;
      type = "Unknown";
    }

    const { cleanCode, note } = parseSubjectCode(code);
    const isElective = type === "Elective" || (options && options.length > 0);
    const isUnselectedElective = isElective && (!code || code === "ELECTIVE");

    if (isDesktop) {
      if (isUnselectedElective) {
        return (
          <div className="flex flex-col h-full w-full p-1.5 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 text-amber-300 transition-all justify-center items-center text-center overflow-hidden">
            <span className="font-share-tech font-bold text-[9px] uppercase tracking-wider leading-none mb-0.5">ELECTIVE</span>
            <span className="font-semibold text-[10px] leading-tight mb-1 text-amber-400/80">Configure slot</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">Select</span>
          </div>
        );
      }

      if (isExpanded) {
        return (
          <>
            <div className={`flex flex-col h-full w-full p-1.5 rounded-md transition-all justify-center items-center text-center overflow-hidden ${getTypeColors(type)}`}>
              <div className="flex flex-col justify-center items-center gap-0.5 mb-0.5 opacity-90 w-full">
                <span className="font-bold text-[9px] uppercase tracking-wider truncate max-w-full">{cleanCode}</span>
                {note && <span className="text-[8px] text-amber-400 font-mono leading-none mb-0.5 font-bold uppercase tracking-wider">{note}</span>}
              </div>
              <span className="font-semibold text-[11px] leading-tight mb-1 line-clamp-2 w-full break-words">{name}</span>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[8px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-wider ${getTypeBadgeColors(type)}`}>
                  {type}
                </span>
                {altWeek && (
                  <span className="text-[8px] px-1 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-bold uppercase tracking-wider" title="Alternate starting week">
                    ALT
                  </span>
                )}
              </div>
            </div>

            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[240px] px-4 py-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col justify-center items-center text-center backdrop-blur-3xl border border-white/20 bg-zinc-950`}
            >
              <div className="flex flex-col justify-center items-center gap-1.5 mb-3 opacity-90 w-full">
                <div className={`font-orbitron font-bold text-[12px] uppercase tracking-wider break-all text-center w-full ${getTypeColors(type).split(' ').find(c => c.startsWith('text-'))}`}>
                  {cleanCode}
                  {note && <div className="text-[10px] text-amber-400 font-mono mt-0.5 font-bold uppercase tracking-wider">{note}</div>}
                </div>
                {loc && (
                  <div className={`text-[11px] tracking-wide flex items-start justify-center gap-1.5 w-full ${getTypeColors(type).split(' ').find(c => c.startsWith('text-'))}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0 mt-[5px]" />
                    <span className="break-all text-center min-w-0">{loc}</span>
                  </div>
                )}
              </div>
              <div className={`font-space-grotesk font-bold text-[14px] leading-snug mb-3 w-full break-words whitespace-normal text-center text-white`}>{name}</div>
              <div className="flex items-center gap-1.5 mb-4 shrink-0">
                <span className={`text-[10px] px-2 py-1 rounded shadow-sm whitespace-nowrap uppercase tracking-wider ${getTypeBadgeColors(type)}`}>
                  {type}
                </span>
                {altWeek && (
                  <span className="text-[9px] px-2 py-1 rounded bg-sky-500/20 text-sky-400 font-mono font-bold uppercase tracking-wider">
                    ALT WEEK
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit();
                }}
                className="font-space-grotesk text-[11px] font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-all shadow active:scale-95 w-full shrink-0"
              >
                {isElective ? "Select Elective" : "Edit Slot"}
              </button>
            </div>
          </>
        );
      }

      return (
        <div className={`flex flex-col h-full w-full p-1.5 rounded-md transition-all justify-center items-center text-center overflow-hidden ${getTypeColors(type)}`}>
          <div className="flex flex-col justify-center items-center gap-0.5 mb-1 opacity-90 w-full">
            <span className="font-bold text-[9px] uppercase tracking-wider line-clamp-2 break-all w-full leading-tight">
              {cleanCode}
              {note && <span className="block text-[8px] text-amber-400 font-mono font-bold mt-0.5 leading-none uppercase tracking-wider">{note}</span>}
            </span>
            {loc && (
              <span className="text-[9px] tracking-wide flex items-center justify-center gap-1 w-full opacity-80">
                <div className="w-1 h-1 rounded-full bg-current opacity-50 shrink-0" />
                <span className="truncate max-w-full">{loc}</span>
              </span>
            )}
          </div>
          <span className="font-semibold text-[11px] leading-tight mb-1 line-clamp-3 w-full break-words" title={name}>{name}</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[8px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-wider ${getTypeBadgeColors(type)}`}>
              {type}
            </span>
            {altWeek && (
              <span className="text-[8px] px-1 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-bold uppercase tracking-wider shrink-0" title="Alternate starting week">
                ALT
              </span>
            )}
          </div>
        </div>
      );
    }

    if (isUnselectedElective) {
      return (
        <div className="flex flex-col w-full p-3 border border-dashed border-amber-500/40 bg-amber-500/5 text-amber-300 rounded-xl">
          <div className="flex justify-between items-start mb-1 gap-3">
            <span className="font-bold text-xs uppercase tracking-wider">ELECTIVE</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">Select</span>
          </div>
          <div className="font-semibold text-sm leading-snug mb-1 text-amber-200/80">Tap to select subject</div>
        </div>
      );
    }

    return (
      <div className={`flex flex-col w-full p-3 border rounded-lg ${getTypeColors(type)}`}>
        <div className="flex justify-between items-start mb-1 gap-3">
          <span className="font-bold text-xs uppercase tracking-wider break-all min-w-0 flex-1">
            {cleanCode}
            {note && <span className="text-[9px] text-amber-400 font-mono ml-2 font-bold uppercase tracking-wider">({note})</span>}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${getTypeBadgeColors(type)}`}>
              {type}
            </span>
            {altWeek && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold uppercase tracking-wider">
                ALT
              </span>
            )}
          </div>
        </div>
        <div className="font-semibold text-sm leading-snug mb-2 break-words whitespace-normal w-full text-white">{name}</div>
        <div className="text-xs opacity-80 mt-auto flex items-start gap-1.5 w-full">
          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0 mt-[4px]" />
          <span className="break-all min-w-0 flex-1">{loc || "TBA"}</span>
        </div>
      </div>
    );
  };

  // Render unified table component (used for Desktop UI AND Hidden Mobile capture container)
  const renderDesktopTable = (refProps, isCaptureOnly = false) => (
    <div
      {...refProps}
      className={`${!isCaptureOnly ? "w-full overflow-x-auto custom-scrollbar bg-black/40 rounded-2xl p-4 shadow-2xl glass-card border-none" : "bg-[#09090b] text-white p-6 pb-4 w-[1350px] min-w-[1350px] max-w-[1350px] block"}`}
    >
      <div className={`flex items-end justify-between pb-4 ${isCaptureOnly ? 'mb-6 border-b-2 border-white/10' : 'mb-4 border-b border-white/10'}`}>
        <div>
          {isCaptureOnly && (
            <div className={`font-space-grotesk font-semibold text-xs tracking-widest uppercase mb-1.5 flex items-center gap-2 ${
              isDoom ? "text-emerald-400" : isIronman ? "text-red-500" : "text-sky-400"
            }`}>
              {isDoom ? (
                <DoomMaskIcon size={14} className="text-emerald-400" />
              ) : isIronman ? (
                <ArcReactorIcon size={14} className="text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              ) : (
                <Calendar size={14} />
              )}
              {isDoom ? "IMPERIAL DECREE" : isIronman ? "STARK MODULE COMPILE" : "GENERATED TIMETABLE"}
            </div>
          )}
          <h2 className={`font-space-grotesk ${isCaptureOnly ? 'text-3xl' : 'text-xl'} font-bold text-white flex items-center gap-2 tracking-tight ${
            isDoom ? "text-glow-green" : isIronman ? "text-glow-red text-red-500" : ""
          }`}>
            {!isCaptureOnly && (
              isDoom ? (
                <DoomMaskIcon className="text-emerald-400" />
              ) : isIronman ? (
                <ArcReactorIcon className="text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)] animate-pulse" />
              ) : (
                <Calendar className="text-sky-400" />
              )
            )}
            {isDoom 
              ? `Regimental Decree: ${batch}` 
              : isIronman 
                ? `Stark Protocol: ${batch}` 
                : (isCaptureOnly ? `Schedule for ${batch}` : `Schedule: ${batch}`)
            }
          </h2>
        </div>
      </div>

      <table className="w-full text-left border-collapse table-fixed min-w-[1280px]">
        <thead>
          <tr>
            <th className={`p-3 border-b border-r border-white/10 bg-white/5 font-bold text-white/90 w-24 text-xs ${!isCaptureOnly ? "sticky left-0 z-20 backdrop-blur-md font-space-grotesk uppercase tracking-wider" : "font-space-grotesk uppercase tracking-wider"}`}>
              Day
            </th>
            {TIMES.map((time) => {
              const [timeVal, period] = time.split(" ");
              return (
                <th key={time} className="p-2 border-b border-r border-white/10 bg-white/5 font-semibold text-center w-[90px] text-xs">
                  <div className="flex flex-col items-center justify-center gap-0.5 leading-none">
                    <span className="text-white font-space-grotesk">{timeVal}</span>
                    <span className="text-[9px] text-white/40 tracking-widest uppercase mt-1">{period}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day} className="group transition-colors">
              <td className={`p-3 border-b border-white/5 bg-black/40 font-medium text-white/80 border-r border-white/10 text-sm w-24 ${!isCaptureOnly ? "sticky left-0 z-10 backdrop-blur-md group-hover:bg-white/5" : ""}`}>
                {day.slice(0, 3)}
              </td>
              {TIMES.map((time) => {
                const subjectList = editedResult?.[day]?.[time];
                return (
                  <td
                    key={time}
                    draggable={!isCaptureOnly && !!subjectList}
                    onDragStart={(e) => {
                      if (!isCaptureOnly && !!subjectList) {
                        e.dataTransfer.setData("application/json", JSON.stringify({ sourceDay: day, sourceTime: time }));
                      }
                    }}
                    onDragOver={(e) => {
                      if (!isCaptureOnly) {
                        e.preventDefault();
                        setDragOverCell(`${day}-${time}`);
                      }
                    }}
                    onDragLeave={() => setDragOverCell(null)}
                    onDrop={(e) => {
                      if (!isCaptureOnly) handleDrop(e, day, time);
                    }}
                    onClick={(e) => {
                      if (isCaptureOnly) return;
                      e.stopPropagation();
                      if (!subjectList) {
                        openSlotModal(day, time, subjectList);
                        return;
                      }
                      const isElective = Array.isArray(subjectList) && (subjectList[3] === "Elective" || (subjectList[5] && subjectList[5].length > 0));
                      const isUnselected = isElective && (!subjectList[0] || subjectList[0] === "ELECTIVE");
                      if (isUnselected) {
                        openSlotModal(day, time, subjectList);
                        return;
                      }
                      const cellId = `${day}-${time}`;
                      if (expandedCell === cellId) {
                        setExpandedCell(null);
                      } else {
                        setExpandedCell(cellId);
                      }
                    }}
                    className={`relative p-1.5 border-b border-r border-white/5 text-center transition-all h-[100px] w-[90px] align-top
                      ${!isCaptureOnly && expandedCell !== `${day}-${time}` ? "cursor-pointer hover:bg-white/5" : ""}
                      ${dragOverCell === `${day}-${time}` ? "bg-white/10 shadow-[inset_0_0_0_2px_rgba(244,63,94,0.5)]" : ""}
                    `}
                  >
                    {subjectList ? (
                      renderCellContent(
                        subjectList,
                        true,
                        (!isCaptureOnly && expandedCell === `${day}-${time}`),
                        () => {
                          setExpandedCell(null);
                          openSlotModal(day, time, subjectList);
                        },
                        isCaptureOnly
                      )
                    ) : (
                      <div className={`flex items-center justify-center w-full h-full rounded-md border border-dashed border-white/10 text-white/10 ${!isCaptureOnly && "group-hover:text-white/30 group-hover:border-white/30 group-hover:bg-white/5"} transition-all min-h-[50px]`}>
                        {!isCaptureOnly ? <Plus size={16} /> : <span className="opacity-0 select-none">.</span>}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative text-foreground w-full">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={seoPath}
        keywords={[
          "batch timetable",
          "class schedule",
          "weekly planner",
          "timetable download",
        ]}
      />
      <BackgroundElements />
      <Navbar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-32 pb-16 flex flex-col">
        <div className="mb-8 flex flex-col gap-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className={`font-space-grotesk text-3xl font-bold text-white flex items-center gap-3 mb-2 ${
                isDoom ? "text-glow-green" : isIronman ? "text-glow-red text-red-500" : ""
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
                  <span className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                    <Calendar size={24} />
                  </span>
                )}
                {isDoom ? `Regimental Decree for ${batch}` : isIronman ? `Stark Protocol: ${batch}` : `Schedule for ${batch}`}
              </h1>
              <p className="text-white/50">
                {isDoom 
                  ? "Adjust cohort timetable assignments. Disobedience will be dealt with by DOOM." 
                  : isIronman
                    ? "Welcome back, Boss. Manual scheduling modules are operational. Export protocol ready."
                    : "Edit your classes manually, then download your personalized timetable."
                }
              </p>
              {saveStatus && (
                <p className="text-xs text-white/70 mt-2">{saveStatus}</p>
              )}
            </div>

            {result && (
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto self-start md:self-end">
                <button
                  onClick={handleSaveLocal}
                  disabled={!editedResult}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white font-semibold rounded-lg border border-white/15 hover:bg-white/15 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Save Schedule
                </button>
                <button
                  onClick={handleResetLocal}
                  disabled={!hasSavedLocalData}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500/10 text-sky-300 font-semibold rounded-lg border border-sky-400/20 hover:bg-sky-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Reset Schedule
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Download PNG
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex flex-col flex-1">
          {loading ? (
            <div className="glass-card rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center text-white/50 gap-4">
              <Loader2 size={32} className="animate-spin text-sky-400" />
              <p>Fetching schedule...</p>
            </div>
          ) : error ? (
            <div className="glass-card rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center text-sky-400 gap-4">
              <p className="text-lg font-medium text-center">{error}</p>
              <Link
                to="/"
                className="mt-2 inline-flex items-center justify-center px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all active:scale-95 text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : editedResult ? (
            <>
              {/* Desktop View */}
              <div className="hidden md:block w-full">
                {renderDesktopTable({ ref: desktopTableRef })}
              </div>

              {/* Mobile View: Accordion */}
              <div className="md:hidden flex flex-col gap-4">
                {DAYS.map((day) => {
                  const daySlots = Object.entries(editedResult[day] || {}).sort((a, b) => TIMES.indexOf(a[0]) - TIMES.indexOf(b[0]));
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
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                            {daySlots.length} classes
                          </span>
                        </div>
                        <ChevronDown size={18} className={`text-white/50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="p-4 bg-black/20 border-t border-white/5 flex flex-col gap-3">
                          {/* List Filled Slots */}
                          {daySlots.map(([time, slotData]) => (
                            <div key={time} className="flex gap-4 items-stretch cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all" onClick={() => openSlotModal(day, time, slotData)}>
                              <div className="flex flex-col items-end justify-start min-w-[70px] pt-1">
                                <span className="font-bold text-white/90 text-sm">{time.split(' ')[0]}</span>
                                <span className="text-[10px] text-white/50 tracking-wider">{time.split(' ')[1]}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                {renderCellContent(slotData, false)}
                              </div>
                            </div>
                          ))}

                          {/* Unfilled slots adding interface */}
                          {daySlots.length === 0 && (
                            <div className="text-center p-4 text-white/40 text-sm italic">
                              No classes on this day.
                            </div>
                          )}

                          <div className="pt-2 mt-2 border-t border-white/10">
                            <button
                              onClick={(e) => { e.stopPropagation(); openSlotModal(day, TIMES[0], null); }}
                              className="w-full py-2.5 flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors border-dashed"
                            >
                              <Plus size={16} /> Add Class
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hidden Desktop Table for Reliable PNG Captures */}
              <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -9999 }}>
                {renderDesktopTable({ ref: hiddenTableRef }, true)}
              </div>
            </>
          ) : (
            <div className="glass-card rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center text-white/50">
              <p>No data to display.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Editor Modal */}
      {isModalOpen && currentEditSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card bg-[#09090b]/90 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-space-grotesk text-xl font-bold text-white mb-1">Edit Timetable Slot</h3>
            <p className="font-share-tech text-xs text-white/40 mb-6 uppercase tracking-wider">{currentEditSlot.day} at {currentEditSlot.time}</p>

            <div className="space-y-4">
              <div className="md:hidden">
                {/* On mobile, allow changing the time itself when 'adding a class' from empty day */}
                <label className="block text-xs font-medium text-white/70 mb-1">Time Slot</label>
                <select
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50 text-sm"
                  value={currentEditSlot.time}
                  onChange={(e) => setCurrentEditSlot({ ...currentEditSlot, time: e.target.value })}
                >
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {modalFormData.options && modalFormData.options.length > 0 ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Select Elective Subject</label>
                    <select
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-sky-500/50 text-xs font-semibold"
                      value={modalFormData.code}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const selected = modalFormData.options.find(opt => opt.subject_code === selectedVal);
                        if (selected) {
                          setModalFormData({
                            ...modalFormData,
                            code: selected.subject_code || "",
                            location: selected.place || "",
                            name: selected.subject_name || "",
                            type: selected.type || "Lecture"
                          });
                        } else {
                          setModalFormData({
                            ...modalFormData,
                            code: "",
                            location: "",
                            name: "",
                            type: "Elective"
                          });
                        }
                      }}
                    >
                      <option value="">-- Choose elective subject --</option>
                      {modalFormData.options.map((opt) => {
                        const { cleanCode, note } = parseSubjectCode(opt.subject_code);
                        return (
                          <option key={opt.subject_code} value={opt.subject_code}>
                            {cleanCode} - {opt.subject_name || "TBA"} {note ? `(${note})` : ""} ({opt.place || "TBA"})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {modalFormData.code && (() => {
                    const { cleanCode, note } = parseSubjectCode(modalFormData.code);
                    return (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2.5 text-xs">
                        <div>
                          <span className="text-white/40 block mb-0.5 font-share-tech uppercase tracking-wider text-[10px]">Subject Name</span>
                          <span className="text-white font-semibold font-space-grotesk">{modalFormData.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-white/40 block mb-0.5 font-share-tech uppercase tracking-wider text-[10px]">Subject Code</span>
                            <span className="text-sky-300 font-mono font-semibold">
                              {cleanCode}
                              {note && <span className="text-amber-400 block mt-0.5 text-[9px] font-bold">({note})</span>}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/40 block mb-0.5 font-share-tech uppercase tracking-wider text-[10px]">Room / Place</span>
                            <span className="text-white font-semibold">{modalFormData.location || "TBA"}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-white/40 block mb-0.5 font-share-tech uppercase tracking-wider text-[10px]">Class Type</span>
                          <span className="text-white/80 font-semibold">{modalFormData.type}</span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Type</label>
                    <select
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50"
                      value={modalFormData.type}
                      onChange={(e) => setModalFormData({ ...modalFormData, type: e.target.value })}
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Practical">Practical / Lab</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Event">Event / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Lecture Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. UPH013P"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50"
                      value={modalFormData.code}
                      onChange={(e) => {
                        const inputCode = e.target.value;
                        const autoName = getSubjectNameFromMap(inputCode);
                        if (autoName) {
                          setModalFormData({
                            ...modalFormData,
                            code: inputCode,
                            name: autoName
                          });
                        } else {
                          setModalFormData({
                            ...modalFormData,
                            code: inputCode
                          });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Name</label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. PHYSICS"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. G312 LAB1"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50"
                      value={modalFormData.location}
                      onChange={(e) => setModalFormData({ ...modalFormData, location: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 mt-8">
              <button
                onClick={deleteSlot}
                className="flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-medium text-sm"
              >
                <Trash2 size={16} /> Remove
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-white/70 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSlot}
                  disabled={!modalFormData.name}
                  className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                >
                  Save
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
