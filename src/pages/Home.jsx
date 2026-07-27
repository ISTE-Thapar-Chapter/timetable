import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Calendar,
  Download,
  Plus,
  Trash2,
  X,
  ChevronDown,
  CalendarSync,
  Users,
  Layout,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Check,
  MapPin,
  Clock,
  BookOpen
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundElements from "@/components/BackgroundElements";
import Seo from "@/components/Seo";
import { SEO_SITE_URL, SEO_SITE_NAME } from "@/lib/seo.config";
import { toPng } from 'html-to-image';
import { batchesList, getBatchesData } from "@/utils/schedule";

const siteUrl = SEO_SITE_URL || "https://timetable.vercel.app";

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SEO_SITE_NAME,
      url: siteUrl,
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      name: SEO_SITE_NAME,
      applicationCategory: "EducationApplication",
      operatingSystem: "Web",
      description:
        "Unified student timetable dashboard to view schedules, find free slots, and sync calendar events.",
      url: siteUrl,
    },
  ],
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

const getScheduleStorageKey = (batchName) => `timetable:schedule:${batchName}`;
const getPrimaryWorkspaceBatchKey = () => `timetable:workspace:primary-batch`;

const cloneSchedule = (schedule) => JSON.parse(JSON.stringify(schedule || {}));
const isValidScheduleShape = (value) => value && typeof value === "object" && !Array.isArray(value);

const getTypeColors = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("lecture")) return "bg-sky-500/10 border-sky-500/30 text-sky-300";
  if (t.includes("practical") || t.includes("lab")) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
  if (t.includes("tutorial")) return "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300";
  return "bg-white/5 border-white/10 text-white/70";
};

const getTypeBadgeColors = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("lecture")) return "bg-sky-500/20 text-sky-400";
  if (t.includes("practical") || t.includes("lab")) return "bg-emerald-500/20 text-emerald-400";
  if (t.includes("tutorial")) return "bg-fuchsia-500/20 text-fuchsia-400";
  return "bg-white/10 text-white/50";
};

export function HomeSite() {
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [primaryBatch, setPrimaryBatch] = useState(() => {
    return localStorage.getItem(getPrimaryWorkspaceBatchKey()) || "";
  });
  
  // Search states
  const [primarySearch, setPrimarySearch] = useState("");
  const [isPrimaryDropdownOpen, setIsPrimaryDropdownOpen] = useState(false);
  const primaryDropdownRef = useRef(null);

  // Active view state
  const [activeTab, setActiveTab] = useState("overview"); // overview, weekPlanner, freeSlots

  // Schedule States for loaded primary batch
  const [originalSchedule, setOriginalSchedule] = useState(null);
  const [editedSchedule, setEditedSchedule] = useState(null);
  const [hasSavedLocalData, setHasSavedLocalData] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Day preview state for dashboard timeline
  const [previewDay, setPreviewDay] = useState("");
  const [weekExpandedDay, setWeekExpandedDay] = useState(DAYS[0]);

  // Edit Modal States (for Tab 2 inline editor)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditSlot, setCurrentEditSlot] = useState({ day: "", time: "" });
  const [modalFormData, setModalFormData] = useState({ type: "Lecture", code: "", name: "", location: "" });
  const [expandedCell, setExpandedCell] = useState(null);

  // Drag and Drop (Week Planner)
  const [dragOverCell, setDragOverCell] = useState(null);

  // Free Slots comparison states
  const [comparisonSearch, setComparisonSearch] = useState("");
  const [isComparisonDropdownOpen, setIsComparisonDropdownOpen] = useState(false);
  const comparisonDropdownRef = useRef(null);
  const [comparisonBatches, setComparisonBatches] = useState([]);
  const [freeSlotsResult, setFreeSlotsResult] = useState(null);
  const [freeSlotsLoading, setFreeSlotsLoading] = useState(false);
  const [freeSlotsError, setFreeSlotsError] = useState("");
  const [freeSlotsExpandedDay, setFreeSlotsExpandedDay] = useState(DAYS[0]);

  // Google Calendar Integration states
  const [isAddingCalendar, setIsAddingCalendar] = useState(false);
  const [isResettingCalendar, setIsResettingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState("");

  const hiddenTableRef = useRef(null);

  // Fetch batch list on load
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = batchesList();
        if (data && data.length > 0) {
          setBatches(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  // Set default preview day based on current weekday
  useEffect(() => {
    const currentWeekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (DAYS.includes(currentWeekday)) {
      setPreviewDay(currentWeekday);
    } else {
      setPreviewDay("Monday"); // Default to Monday if weekend
    }
  }, []);

  // Fetch primary batch schedule data when primaryBatch changes
  useEffect(() => {
    if (!primaryBatch) {
      setOriginalSchedule(null);
      setEditedSchedule(null);
      setHasSavedLocalData(false);
      return;
    }

    try {
      // 1. Get backend data
      const data = getBatchesData([primaryBatch]);
      const raw = data[primaryBatch] || {};
      setOriginalSchedule(raw);

      // 2. Check local modifications
      const storageKey = getScheduleStorageKey(primaryBatch);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isValidScheduleShape(parsed)) {
          setEditedSchedule(parsed);
          setHasSavedLocalData(true);
          return;
        }
      }

      setEditedSchedule(cloneSchedule(raw));
      setHasSavedLocalData(false);
    } catch (err) {
      console.error(err);
    }
  }, [primaryBatch]);

  // Handle outside clicks for search inputs
  useEffect(() => {
    function handleClickOutside(event) {
      if (primaryDropdownRef.current && !primaryDropdownRef.current.contains(event.target)) {
        setIsPrimaryDropdownOpen(false);
      }
      if (comparisonDropdownRef.current && !comparisonDropdownRef.current.contains(event.target)) {
        setIsComparisonDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary Batch Search Filter
  const filteredPrimaryBatches = useMemo(() => {
    if (!Array.isArray(batches)) return [];
    return batches.filter((b) => {
      if (typeof b !== 'string') return false;
      return b.toLowerCase().includes(primarySearch.toLowerCase());
    });
  }, [batches, primarySearch]);

  // Comparison Batch Search Filter (excludes primary and already selected)
  const filteredComparisonBatches = useMemo(() => {
    if (!Array.isArray(batches)) return [];
    return batches.filter((b) => {
      if (typeof b !== 'string') return false;
      if (b.toUpperCase() === primaryBatch.toUpperCase()) return false;
      if (comparisonBatches.includes(b)) return false;
      return b.toLowerCase().includes(comparisonSearch.toLowerCase());
    });
  }, [batches, comparisonSearch, primaryBatch, comparisonBatches]);

  // Calculate Free Slots when comparison batch list changes
  useEffect(() => {
    if (activeTab !== "freeSlots") return;

    const allCompare = [primaryBatch, ...comparisonBatches].filter(Boolean);
    if (allCompare.length < 2) {
      setFreeSlotsResult(null);
      setFreeSlotsError("Select at least one other batch to compare schedules.");
      return;
    }

    setFreeSlotsLoading(true);
    setFreeSlotsError("");

    try {
      const data = getBatchesData(allCompare);
      if (data && Object.keys(data).length > 0) {
        // Resolve schedules (preferring local storage edits)
        const resolvedSchedules = allCompare.map((batchName) => {
          const storedKey = getScheduleStorageKey(batchName);
          const localStored = localStorage.getItem(storedKey);
          if (localStored) {
            const parsed = JSON.parse(localStored);
            if (isValidScheduleShape(parsed)) return parsed;
          }
          return data[batchName] || {};
        });

        // Compute free slots overlap
        const hasClassInSlot = (schedule, day, time) => {
          const dayData = schedule?.[day];
          if (!dayData || typeof dayData !== "object") return false;
          const slotValue = dayData[time];
          if (slotValue === undefined || slotValue === null) return false;
          if (Array.isArray(slotValue)) {
            return slotValue.some((item) => String(item ?? "").trim() !== "");
          }
          if (typeof slotValue === "string") {
            return slotValue.trim() !== "";
          }
          return Boolean(slotValue);
        };

        const computed = DAYS.reduce((acc, day) => {
          acc[day] = TIMES.filter((time) => 
            resolvedSchedules.every((schedule) => !hasClassInSlot(schedule, day, time))
          );
          return acc;
        }, {});

        setFreeSlotsResult(computed);
      } else {
        setFreeSlotsError("Failed to load schedules for comparisons.");
      }
    } catch (err) {
      console.error(err);
      setFreeSlotsError(err.message || "An error occurred calculating free slots.");
    } finally {
      setFreeSlotsLoading(false);
    }
  }, [primaryBatch, comparisonBatches, activeTab]);

  // Workspace Actions
  const handleSelectPrimary = (batchName) => {
    setPrimaryBatch(batchName);
    localStorage.setItem(getPrimaryWorkspaceBatchKey(), batchName);
    setIsPrimaryDropdownOpen(false);
    setPrimarySearch("");
    setActiveTab("overview");
  };

  const handleClearWorkspace = () => {
    setPrimaryBatch("");
    localStorage.removeItem(getPrimaryWorkspaceBatchKey());
    setComparisonBatches([]);
    setFreeSlotsResult(null);
  };

  const handleSaveLocal = () => {
    if (!primaryBatch || !editedSchedule) return;
    try {
      const storageKey = getScheduleStorageKey(primaryBatch);
      localStorage.setItem(storageKey, JSON.stringify(editedSchedule));
      setHasSavedLocalData(true);
      setSaveStatus("Changes saved successfully.");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch {
      setSaveStatus("Could not save changes.");
    }
  };

  const handleResetLocal = () => {
    if (!primaryBatch) return;
    const storageKey = getScheduleStorageKey(primaryBatch);
    localStorage.removeItem(storageKey);
    setHasSavedLocalData(false);
    setEditedSchedule(cloneSchedule(originalSchedule));
    setSaveStatus("Schedule reset to default.");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = hiddenTableRef.current;
      if (!element) return;

      await new Promise(r => setTimeout(r, 120));

      const dataUrl = await toPng(element, {
        backgroundColor: "#030712",
        pixelRatio: 2,
        skipFonts: false,
        fetchRequest: {
          cache: 'no-cache',
        },
        style: {
          transform: 'none',
          opacity: '1'
        }
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Timetable_${primaryBatch}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate PNG", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Drag and Drop (Planner Grid)
  const handleDragStart = (e, sourceDay, sourceTime) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ sourceDay, sourceTime }));
  };

  const handleDragOver = (e, day, time) => {
    e.preventDefault();
    setDragOverCell(`${day}-${time}`);
  };

  const handleDrop = (e, targetDay, targetTime) => {
    e.preventDefault();
    setDragOverCell(null);
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;

      const { sourceDay, sourceTime } = JSON.parse(dataStr);
      if (sourceDay === targetDay && sourceTime === targetTime) return;

      const newSchedule = { ...editedSchedule };

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

      setEditedSchedule(newSchedule);
    } catch (err) {
      console.error("Failed to parse drag data", err);
    }
  };

  // Inline modal editors
  const openSlotModal = (day, time, slotData) => {
    setCurrentEditSlot({ day, time });
    if (slotData && Array.isArray(slotData)) {
      setModalFormData({
        code: slotData[0] || "",
        location: slotData[1] || "",
        name: slotData[2] || "",
        type: slotData[3] || "Lecture"
      });
    } else if (slotData && typeof slotData === "string") {
      setModalFormData({
        code: "",
        location: "",
        name: slotData,
        type: "Lecture"
      });
    } else {
      setModalFormData({ code: "", location: "", name: "", type: "Lecture" });
    }
    setIsModalOpen(true);
    setExpandedCell(null);
  };

  const saveSlot = () => {
    const { day, time } = currentEditSlot;
    if (!day || !time) return;

    const newSchedule = { ...editedSchedule };
    if (!newSchedule[day]) newSchedule[day] = {};

    newSchedule[day][time] = [
      modalFormData.code.trim().toUpperCase(),
      modalFormData.location.trim().toUpperCase(),
      modalFormData.name.trim().toUpperCase(),
      modalFormData.type
    ];

    setEditedSchedule(newSchedule);
    setIsModalOpen(false);
  };

  const deleteSlot = () => {
    const { day, time } = currentEditSlot;
    if (!day || !time) return;

    const newSchedule = { ...editedSchedule };
    if (newSchedule[day]) {
      delete newSchedule[day][time];
    }

    setEditedSchedule(newSchedule);
    setIsModalOpen(false);
  };

  // Google Calendar integration call
  const handleCalendarApiCall = async (operation) => {
    if (!primaryBatch) return;

    setCalendarError("");
    if (operation === "addToCalendar") setIsAddingCalendar(true);
    else setIsResettingCalendar(true);

    try {
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

      if (scriptUrl) {
        const targetUrl = new URL(scriptUrl);
        targetUrl.searchParams.set("batch", primaryBatch);
        targetUrl.searchParams.set("operation", operation);
        window.location.href = targetUrl.toString();
        return;
      } else {
        throw new Error("Google Script URL is missing in environment config.");
      }
    } catch (error) {
      console.error(error);
      setCalendarError(error.message || "Failed to sync calendar. Please check setup.");
    } finally {
      if (operation === "addToCalendar") setIsAddingCalendar(false);
      else setIsResettingCalendar(false);
    }
  };

  // Cell rendering inside the Week Timetable
  const renderCellContent = (subjectList, isDesktop = true, isExpanded = false, onEdit = null) => {
    if (!subjectList) return null;

    let code, loc, name, type;
    if (Array.isArray(subjectList)) {
      [code, loc, name, type] = subjectList;
    } else {
      name = subjectList;
      type = "Lecture";
    }

    if (isDesktop) {
      if (isExpanded) {
        return (
          <>
            <div className={`flex flex-col h-full w-full p-2 rounded-lg transition-all justify-center items-center text-center overflow-hidden ${getTypeColors(type)}`}>
              <span className="font-bold text-[9px] uppercase tracking-wider truncate max-w-full leading-none mb-0.5">{code}</span>
              <span className="font-semibold text-[11px] leading-tight mb-1 line-clamp-2 w-full break-words">{name}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-wider shrink-0 ${getTypeBadgeColors(type)}`}>
                {type}
              </span>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[240px] px-4 py-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col justify-center items-center text-center backdrop-blur-3xl border border-white/20 bg-zinc-950">
              <div className="flex flex-col justify-center items-center gap-1 mb-3 opacity-90 w-full">
                <div className={`font-orbitron font-bold text-[12px] uppercase tracking-wider break-all text-center w-full ${getTypeColors(type).split(' ').find(c => c.startsWith('text-'))}`}>{code}</div>
                {loc && (
                  <div className="text-[11px] tracking-wide flex items-center justify-center gap-1 w-full opacity-70">
                    <MapPin size={10} />
                    <span className="break-all text-center min-w-0">{loc}</span>
                  </div>
                )}
              </div>
              <div className="font-space-grotesk font-bold text-[14px] leading-snug mb-3 w-full break-words whitespace-normal text-center text-white">{name}</div>
              <span className={`text-[10px] px-2.5 py-1 rounded shadow-sm whitespace-nowrap uppercase tracking-wider shrink-0 mb-4 ${getTypeBadgeColors(type)}`}>
                {type}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit();
                }}
                className="font-space-grotesk text-[11px] font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-all shadow active:scale-95 w-full shrink-0"
              >
                Edit Slot
              </button>
            </div>
          </>
        );
      }

      return (
        <div className={`flex flex-col h-full w-full p-2 rounded-lg transition-all justify-center items-center text-center overflow-hidden ${getTypeColors(type)}`}>
          <div className="flex flex-col justify-center items-center gap-0.5 mb-1 opacity-90 w-full">
            <span className="font-bold text-[9px] uppercase tracking-wider line-clamp-2 break-all w-full leading-tight">{code}</span>
            {loc && (
              <span className="text-[9px] tracking-wide flex items-center justify-center gap-0.5 w-full opacity-80">
                <MapPin size={8} />
                <span className="truncate max-w-full">{loc}</span>
              </span>
            )}
          </div>
          <span className="font-semibold text-[11px] leading-tight mb-1 line-clamp-3 w-full break-words text-white" title={name}>{name}</span>
          <span className={`text-[8px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-wider shrink-0 ${getTypeBadgeColors(type)}`}>
            {type}
          </span>
        </div>
      );
    }

    return (
      <div className={`flex flex-col w-full p-3 border rounded-xl ${getTypeColors(type)}`}>
        <div className="flex justify-between items-start mb-1 gap-3">
          <span className="font-bold text-xs uppercase tracking-wider break-all min-w-0 flex-1">{code}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${getTypeBadgeColors(type)}`}>
            {type}
          </span>
        </div>
        <div className="font-semibold text-sm leading-snug mb-2 text-white">{name}</div>
        <div className="text-xs opacity-80 mt-auto flex items-center gap-1 w-full">
          <MapPin size={12} className="shrink-0" />
          <span className="break-all min-w-0 flex-1">{loc || "TBA"}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative text-foreground w-full">
      <Seo
        title="Workspace Console"
        description="Unified college dashboard: View class schedules, manage task timelines, edit custom classes, sync calendar notifications, and calculate comparative free slots."
        path="/"
        keywords={["timetable", "schedule", "free slots", "calendar sync", "tiet", "iste", "thapar"]}
        structuredData={homeStructuredData}
      />
      <BackgroundElements />
      <Navbar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-28 pb-16 flex flex-col">
        {!primaryBatch ? (
          // ==================== WORKSPACE SETUP SCREEN ====================
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-2xl text-center space-y-6">
              <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 text-sky-400 shadow-inner mb-2">
                <Layout size={32} />
              </div>
              <h1 className="font-space-grotesk text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Workspace Console
              </h1>
              <p className="text-base md:text-lg text-white/50 max-w-lg mx-auto">
                Configure your primary batch to unlock schedule timelines, inline planners, and interactive free slots comparison panels.
              </p>

              {/* Central Search work desk */}
              <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/10 relative z-20" ref={primaryDropdownRef}>
                <div className="flex flex-col gap-3 relative text-left">
                  <label className="font-share-tech text-xs uppercase tracking-widest text-white/60">Load Class Batch</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                      type="text"
                      placeholder="Type batch name (e.g. 1A11, 2COE1, etc.)..."
                      className="w-full bg-black/40 border border-white/15 rounded-xl pl-12 pr-10 py-3.5 text-white outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 placeholder:text-white/30 text-sm md:text-base transition-all"
                      value={primarySearch}
                      onChange={(e) => {
                        setPrimarySearch(e.target.value);
                        setIsPrimaryDropdownOpen(true);
                      }}
                      onFocus={() => setIsPrimaryDropdownOpen(true)}
                    />
                    {primarySearch && (
                      <button 
                        onClick={() => setPrimarySearch("")} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {isPrimaryDropdownOpen && (
                    <div className="absolute top-[105%] left-0 right-0 max-h-60 overflow-y-auto bg-zinc-950 border border-white/15 rounded-xl p-2 z-50 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                      {loadingBatches ? (
                        <div className="flex items-center justify-center p-6 text-white/40 gap-2 text-sm">
                          <Loader2 size={16} className="animate-spin" /> Fetching database...
                        </div>
                      ) : filteredPrimaryBatches.length > 0 ? (
                        filteredPrimaryBatches.map((b) => (
                          <button
                            key={b}
                            onClick={() => handleSelectPrimary(b)}
                            className="w-full text-left px-4 py-3 rounded-lg text-sm transition-all hover:bg-white/10 hover:text-white text-white/70 mb-0.5 font-medium flex items-center justify-between"
                          >
                            <span>{b}</span>
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                      ) : (
                        <div className="p-6 text-sm text-white/40 text-center">
                          No batches found for "{primarySearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Popular Batches */}
                {!loadingBatches && batches.length > 0 && (
                  <div className="mt-6 text-left border-t border-white/5 pt-5">
                    <span className="font-share-tech text-[10px] uppercase tracking-widest text-white/40 block mb-3">Popular Batches</span>
                    <div className="flex flex-wrap gap-2">
                      {batches.slice(0, 8).map((b) => (
                        <button
                          key={b}
                          onClick={() => handleSelectPrimary(b)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-sky-500/30 hover:bg-sky-500/10 text-white/80 hover:text-sky-300 text-xs font-semibold tracking-wider transition-all"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // ==================== MAIN WORKSPACE VIEW ====================
          <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-4">
            
            {/* 1. SIDEBAR (Control Station) */}
            <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
              {/* Workspace active state card */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col gap-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner shrink-0">
                    <Layout size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-share-tech text-[9px] uppercase tracking-widest text-white/40 block">WORKSPACE ACTIVE</span>
                    <h2 className="font-orbitron text-2xl font-black text-white leading-none truncate mt-0.5">{primaryBatch}</h2>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all ${
                      activeTab === "overview"
                        ? "bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.05)]"
                        : "text-white/60 hover:bg-white/5 border border-transparent hover:text-white"
                    }`}
                  >
                    <Clock size={16} />
                    <span>Overview (Today)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("weekPlanner")}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all ${
                      activeTab === "weekPlanner"
                        ? "bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.05)]"
                        : "text-white/60 hover:bg-white/5 border border-transparent hover:text-white"
                    }`}
                  >
                    <Calendar size={16} />
                    <span>Week Planner</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("freeSlots")}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all ${
                      activeTab === "freeSlots"
                        ? "bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.05)]"
                        : "text-white/60 hover:bg-white/5 border border-transparent hover:text-white"
                    }`}
                  >
                    <Users size={16} />
                    <span>Free Slots Panel</span>
                  </button>
                </div>

                <div className="border-t border-white/5 pt-3 mt-2">
                  <button
                    onClick={handleClearWorkspace}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>Change Workspace Batch</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* 2. DYNAMIC WORKSPACE PANEL */}
            <section className="flex-1 flex flex-col min-w-0">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="flex-1 flex flex-col gap-6">
                  
                  {/* Today's schedule preview */}
                  <div className="glass-card rounded-2xl p-6 border border-white/10 relative z-10 flex-1 flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
                      <div>
                        <span className="font-share-tech text-[10px] uppercase tracking-widest text-sky-400 block mb-1">Today's Agenda</span>
                        <h2 className="font-space-grotesk text-2xl font-bold text-white flex items-center gap-2">
                          Classes Preview for {primaryBatch}
                        </h2>
                      </div>
                      
                      {/* Weekday Selector */}
                      <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        {DAYS.map((d) => (
                          <button
                            key={d}
                            onClick={() => setPreviewDay(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              previewDay === d
                                ? "bg-white text-black shadow-lg"
                                : "text-white/50 hover:text-white"
                            }`}
                          >
                            {d.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="flex-1 flex flex-col gap-3">
                      {editedSchedule && editedSchedule[previewDay] && Object.keys(editedSchedule[previewDay]).length > 0 ? (
                        TIMES.map((time) => {
                          const slotData = editedSchedule[previewDay][time];
                          if (!slotData) return null;

                          let code, loc, name, type;
                          if (Array.isArray(slotData)) {
                            [code, loc, name, type] = slotData;
                          } else {
                            name = slotData;
                            type = "Lecture";
                          }

                          return (
                            <div key={time} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${getTypeColors(type)}`}>
                              <div className="flex items-center gap-2 text-white/50 font-share-tech text-sm shrink-0 w-24 pt-0.5">
                                <Clock size={14} />
                                <span>{time.replace(" AM", "").replace(" PM", "")}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-bold text-xs uppercase tracking-wider text-white">{code || "N/A"}</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getTypeBadgeColors(type)}`}>
                                    {type}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-sm text-white/90 truncate">{name}</h3>
                                {loc && (
                                  <div className="flex items-center gap-1 text-xs text-white/50 mt-1">
                                    <MapPin size={12} />
                                    <span>{loc}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40 border border-dashed border-white/10 rounded-2xl py-12">
                          <BookOpen size={36} className="opacity-40 mb-3" />
                          <p className="text-sm font-medium">No classes scheduled on {previewDay} for {primaryBatch}</p>
                          <p className="text-xs opacity-75 mt-1">Enjoy your free time!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Calendar Sync panel */}
                  <div className="glass-card rounded-2xl p-6 border border-white/10 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner shrink-0">
                        <CalendarSync size={24} />
                      </div>
                      <div>
                        <h3 className="font-space-grotesk text-lg font-bold text-white">Google Calendar Integrations</h3>
                        <p className="text-xs text-white/50">Sync your scheduled events up-to date</p>
                      </div>
                    </div>

                    <p className="text-sm text-white/70 mb-5 leading-relaxed">
                      Wipe previously synced slots and push your live custom edited {primaryBatch} schedule directly to your Google Calendar accounts. Only valid Thapar student emails are authorized.
                    </p>

                    {calendarError && (
                      <div className="text-red-400 text-sm bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/20 mb-4 font-semibold">
                        {calendarError}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleCalendarApiCall("addToCalendar")}
                        disabled={isAddingCalendar || isResettingCalendar}
                        className="flex-1 py-3 px-4 bg-white hover:bg-white/90 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        {isAddingCalendar ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        <span>Sync Events</span>
                      </button>

                      <button
                        onClick={() => handleCalendarApiCall("resetCalendar")}
                        disabled={isAddingCalendar || isResettingCalendar}
                        className="flex-1 py-3 px-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        {isResettingCalendar ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        <span>Reset Calendar</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: WEEK TIMETABLE PLANNER */}
              {activeTab === "weekPlanner" && (
                <div className="glass-card rounded-2xl p-6 border border-white/10 relative z-10 flex-1 flex flex-col">
                  
                  {/* Title & Actions Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
                    <div>
                      <span className="font-share-tech text-[10px] uppercase tracking-widest text-sky-400 block mb-1">Week Workdesk</span>
                      <h2 className="font-space-grotesk text-2xl font-bold text-white">Interactive Week Schedule</h2>
                      <p className="text-xs text-white/50 mt-1">Drag slots to reschedule or click to edit subject values</p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        onClick={handleSaveLocal}
                        disabled={!editedSchedule}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white font-bold rounded-xl border border-white/15 hover:bg-white/15 transition-all active:scale-95 disabled:opacity-50 text-xs"
                      >
                        Save Local
                      </button>
                      <button
                        onClick={handleResetLocal}
                        disabled={!hasSavedLocalData}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500/10 text-sky-300 font-bold rounded-xl border border-sky-400/20 hover:bg-sky-500/20 transition-all active:scale-95 disabled:opacity-50 text-xs"
                      >
                        Reset Local
                      </button>
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50 text-xs shadow-lg"
                      >
                        {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        Download PNG
                      </button>
                    </div>
                  </div>

                  {saveStatus && (
                    <div className="mb-4 text-xs bg-sky-500/10 border border-sky-500/20 text-sky-300 px-4 py-2.5 rounded-xl font-semibold">
                      {saveStatus}
                    </div>
                  )}

                  {/* Desktop Grid Layout */}
                  <div className="hidden md:block w-full overflow-x-auto custom-scrollbar select-none">
                    <table className="w-full text-left border-collapse table-fixed min-w-[1280px]">
                      <thead>
                        <tr>
                          <th className="p-4 border-b border-white/10 bg-white/5 font-bold text-white/90 w-28 text-xs sticky left-0 z-20 backdrop-blur-md">
                            Day
                          </th>
                          {TIMES.map((time) => {
                            const [timeVal, period] = time.split(" ");
                            return (
                              <th
                                key={time}
                                className="p-3 border-b border-white/10 bg-white/5 font-semibold text-center w-[95px] text-xs text-white"
                              >
                                <div className="flex flex-col items-center justify-center leading-none">
                                  <span>{timeVal}</span>
                                  <span className="text-[9px] text-white/40 tracking-widest mt-1 uppercase">{period}</span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day) => (
                          <tr key={day} className="group transition-colors">
                            <td className="p-4 border-b border-white/5 bg-black/40 group-hover:bg-white/5 font-bold text-white border-r border-white/15 text-xs sticky left-0 z-10 w-28 backdrop-blur-md transition-colors uppercase tracking-wider">
                              {day}
                            </td>
                            {TIMES.map((time) => {
                              const cellData = editedSchedule?.[day]?.[time];
                              const isExpanded = expandedCell === `${day}-${time}`;
                              const isDragOver = dragOverCell === `${day}-${time}`;

                              return (
                                <td
                                  key={time}
                                  draggable={!!cellData}
                                  onDragStart={(e) => handleDragStart(e, day, time)}
                                  onDragOver={(e) => handleDragOver(e, day, time)}
                                  onDragLeave={() => setDragOverCell(null)}
                                  onDrop={(e) => handleDrop(e, day, time)}
                                  onClick={() => {
                                    if (cellData) {
                                      setExpandedCell(isExpanded ? null : `${day}-${time}`);
                                    } else {
                                      openSlotModal(day, time, null);
                                    }
                                  }}
                                  className={`p-1.5 border-b border-white/5 text-center transition-all cursor-pointer relative h-20 w-[95px] ${
                                    isDragOver ? "bg-sky-500/20 border-2 border-dashed border-sky-400" : ""
                                  } ${cellData ? "hover:scale-[1.02]" : "hover:bg-white/[0.02]"}`}
                                >
                                  {cellData ? (
                                    renderCellContent(cellData, true, isExpanded, () => openSlotModal(day, time, cellData))
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full opacity-0 hover:opacity-100 transition-opacity">
                                      <Plus size={14} className="text-white/30" />
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

                  {/* Mobile Accordion Layout */}
                  <div className="md:hidden flex flex-col gap-4">
                    {DAYS.map((day) => {
                      const daySlots = Object.entries(editedSchedule?.[day] || {}).sort(
                        (a, b) => TIMES.indexOf(a[0]) - TIMES.indexOf(b[0])
                      );
                      const isExpanded = weekExpandedDay === day;

                      return (
                        <div key={day} className="flex flex-col rounded-xl overflow-hidden glass border border-white/10">
                          <button
                            onClick={() => setWeekExpandedDay(isExpanded ? null : day)}
                            className={`flex items-center justify-between p-4 transition-colors ${
                              isExpanded ? "bg-white/10" : "hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-white/90">{day}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-white/60">
                                {daySlots.length} classes
                              </span>
                            </div>
                            <ChevronDown size={16} className={`text-white/50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="p-4 bg-black/20 border-t border-white/5 flex flex-col gap-3">
                              {daySlots.map(([time, slotData]) => (
                                <div
                                  key={time}
                                  className="flex gap-4 items-stretch cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                                  onClick={() => openSlotModal(day, time, slotData)}
                                >
                                  <div className="flex flex-col items-end justify-start min-w-[70px] pt-1 shrink-0">
                                    <span className="font-orbitron font-bold text-white/90 text-xs leading-none">{time.split(' ')[0]}</span>
                                    <span className="font-share-tech text-[9px] text-white/50 tracking-wider uppercase mt-1 leading-none">{time.split(' ')[1]}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {renderCellContent(slotData, false)}
                                  </div>
                                </div>
                              ))}

                              {daySlots.length === 0 && (
                                <div className="text-center p-4 text-white/40 text-xs italic">
                                  No classes on this day.
                                </div>
                              )}

                              <div className="pt-2 mt-2 border-t border-white/10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSlotModal(day, TIMES[0], null);
                                  }}
                                  className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors border-dashed"
                                >
                                  <Plus size={14} /> Add Class
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Off-screen capture template (to ensure perfect, unclipped downloads) */}
                  <div className="absolute top-[-9999px] left-[-9999px]" ref={hiddenTableRef}>
                    <div style={{ width: "1350px", padding: "30px", background: "#030712", color: "#ffffff" }}>
                      <div style={{ marginBottom: "20px", borderBottom: "2px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>
                        <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase" }}>GENERATED TIMETABLE</div>
                        <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: "5px 0 0 0" }}>Schedule for {primaryBatch}</h2>
                      </div>
                      
                      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                        <thead>
                          <tr>
                            <th style={{ padding: "12px", borderBottom: "2px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", fontWeight: "bold", color: "#ffffff", width: "110px", textAlign: "left", fontSize: "12px" }}>
                              Day
                            </th>
                            {TIMES.map((time) => {
                              const [timeVal, period] = time.split(" ");
                              return (
                                <th key={time} style={{ padding: "10px", borderBottom: "2px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", fontWeight: "bold", textAlign: "center", width: "95px", fontSize: "11px" }}>
                                  <div>{timeVal}</div>
                                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "2px", letterSpacing: "1px" }}>{period}</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {DAYS.map((day) => (
                            <tr key={day}>
                              <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)", fontWeight: "bold", fontSize: "12px", color: "#ffffff", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                                {day}
                              </td>
                              {TIMES.map((time) => {
                                const cellData = editedSchedule?.[day]?.[time];
                                return (
                                  <td key={time} style={{ padding: "6px", borderBottom: "1px solid rgba(255,255,255,0.05)", height: "80px", width: "95px", verticalAlign: "middle" }}>
                                    {cellData ? renderCellContent(cellData, true, false) : <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>-</div>}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: FREE SLOTS COMPARER */}
              {activeTab === "freeSlots" && (
                <div className="glass-card rounded-2xl p-6 border border-white/10 relative z-10 flex-1 flex flex-col">
                  
                  {/* Header & input */}
                  <div className="border-b border-white/10 pb-5 mb-6">
                    <span className="font-share-tech text-[10px] uppercase tracking-widest text-sky-400 block mb-1">Collaboration Hub</span>
                    <h2 className="font-space-grotesk text-2xl font-bold text-white">Compare Batches for Gaps</h2>
                    <p className="text-xs text-white/50 mt-1">Select batches to compute overlapping free timeslots instantly</p>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Active batch lists */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-white/50">Active Batches</label>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-bold flex items-center gap-1.5">
                            {primaryBatch} (Workspace)
                          </span>
                          {comparisonBatches.map((b) => (
                            <button
                              key={b}
                              onClick={() => setComparisonBatches(comparisonBatches.filter(x => x !== b))}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-white/80 hover:text-red-400 text-xs font-semibold flex items-center gap-2 transition-all"
                            >
                              <span>{b}</span>
                              <X size={12} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add Batch Search Dropdown */}
                      <div className="flex flex-col gap-2 relative" ref={comparisonDropdownRef}>
                        <label className="text-xs font-semibold text-white/50">Compare Batch</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                          <input
                            type="text"
                            placeholder="Add batch to compare (e.g. 1A12)..."
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-white outline-none focus:border-sky-500/50 text-xs transition-all"
                            value={comparisonSearch}
                            onChange={(e) => {
                              setComparisonSearch(e.target.value);
                              setIsComparisonDropdownOpen(true);
                            }}
                            onFocus={() => setIsComparisonDropdownOpen(true)}
                          />
                        </div>

                        {isComparisonDropdownOpen && (
                          <div className="absolute top-[105%] left-0 right-0 max-h-48 overflow-y-auto bg-zinc-950 border border-white/15 rounded-lg p-1.5 z-50 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                            {filteredComparisonBatches.length > 0 ? (
                              filteredComparisonBatches.map((b) => (
                                <button
                                  key={b}
                                  onClick={() => {
                                    setComparisonBatches([...comparisonBatches, b]);
                                    setComparisonSearch("");
                                    setIsComparisonDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-md text-xs transition-all hover:bg-white/10 hover:text-white text-white/70 mb-0.5"
                                >
                                  {b}
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-xs text-white/40 text-center">
                                No comparative batches found.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Calculations Display Area */}
                  <div className="flex-1 flex flex-col justify-center">
                    {freeSlotsLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-white/50 gap-3 py-12">
                        <Loader2 className="animate-spin text-amber-500" size={28} />
                        <span className="text-xs">Computing overlapping slots...</span>
                      </div>
                    ) : freeSlotsError ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-amber-400 gap-2 text-center p-8 py-12">
                        <p className="text-sm font-medium">{freeSlotsError}</p>
                      </div>
                    ) : freeSlotsResult ? (
                      <div className="flex-1 flex flex-col">
                        
                        {/* Desktop Slots Grid */}
                        <div className="hidden md:block w-full overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                            <thead>
                              <tr>
                                <th className="p-3 border-b border-white/10 bg-white/5 font-semibold text-white/90 w-24 text-xs sticky left-0 z-20 backdrop-blur-md">
                                  Day
                                </th>
                                {TIMES.map((time) => {
                                  const [timeVal, period] = time.split(" ");
                                  return (
                                    <th
                                      key={time}
                                      className="p-2 border-b border-white/10 bg-white/5 font-medium text-center w-[85px]"
                                    >
                                      <div className="flex flex-col items-center leading-none text-[11px] text-white">
                                        <span>{timeVal}</span>
                                        <span className="text-[9px] text-white/40 mt-1 uppercase tracking-wider">{period}</span>
                                      </div>
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {DAYS.map((day) => (
                                <tr key={day} className="group transition-colors">
                                  <td className="p-3 border-b border-white/5 bg-black/40 group-hover:bg-white/5 font-bold text-white border-r border-white/10 text-xs sticky left-0 z-10 w-24 backdrop-blur-md transition-colors uppercase tracking-wider">
                                    {day}
                                  </td>
                                  {TIMES.map((time) => {
                                    const isFree = freeSlotsResult[day]?.includes(time);
                                    return (
                                      <td
                                        key={time}
                                        className={`p-1.5 border-b border-white/5 text-center transition-all ${
                                          isFree ? "bg-emerald-500/[0.07] hover:bg-emerald-500/[0.12]" : "text-white/10"
                                        }`}
                                      >
                                        <div className="flex items-center justify-center min-h-[40px] w-full">
                                          {isFree ? (
                                            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-wider">
                                              FREE
                                            </span>
                                          ) : (
                                            <span className="opacity-20 text-xs">-</span>
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

                        {/* Mobile Accordion */}
                        <div className="md:hidden flex flex-col gap-3">
                          {DAYS.map((day) => {
                            const freeTimes = freeSlotsResult[day] || [];
                            const isExpanded = freeSlotsExpandedDay === day;

                            return (
                              <div key={day} className="flex flex-col rounded-xl overflow-hidden glass border-white/10">
                                <button
                                  onClick={() => setFreeSlotsExpandedDay(isExpanded ? null : day)}
                                  className={`flex items-center justify-between p-3.5 transition-colors ${
                                    isExpanded ? "bg-white/10" : "hover:bg-white/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-xs uppercase tracking-wider text-white/95">{day}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      freeTimes.length > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                                    }`}>
                                      {freeTimes.length} free
                                    </span>
                                  </div>
                                  <ChevronDown
                                    size={16}
                                    className={`text-white/50 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>

                                {isExpanded && (
                                  <div className="p-3.5 bg-black/20 border-t border-white/5 flex flex-col gap-2">
                                    {freeTimes.length > 0 ? (
                                      <div className="grid grid-cols-2 gap-2">
                                        {freeTimes.map((time) => (
                                          <div
                                            key={time}
                                            className="flex items-center justify-center p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider"
                                          >
                                            {time}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center p-3 text-white/40 text-xs italic">
                                        No free slots matching.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40 py-12">
                        <Users size={32} className="opacity-30 mb-2" />
                        <p className="text-sm font-medium">No calculation details available.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </section>
          </div>
        )}
      </main>

      <Footer />

      {/* ==================== EDIT CLASS DIALOG MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-white/15 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="font-space-grotesk text-xl font-bold text-white mb-1">Edit Class Slot</h3>
            <p className="font-share-tech text-xs text-white/40 mb-6 uppercase tracking-wider">{currentEditSlot.day} at {currentEditSlot.time}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Type</label>
                <select
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50 text-sm"
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
                <label className="block text-xs font-semibold text-white/70 mb-1">Lecture Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPH013P"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50 text-sm font-medium placeholder:text-white/20"
                  value={modalFormData.code}
                  onChange={(e) => setModalFormData({ ...modalFormData, code: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Name</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. PHYSICS"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50 text-sm font-semibold placeholder:text-white/20"
                  value={modalFormData.name}
                  onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. G312 LAB1"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500/50 text-sm font-medium placeholder:text-white/20"
                  value={modalFormData.location}
                  onChange={(e) => setModalFormData({ ...modalFormData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-white/5">
              <button
                onClick={deleteSlot}
                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-semibold text-xs"
              >
                <Trash2 size={14} /> Remove Slot
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-white/70 hover:bg-white/10 rounded-xl transition-all text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSlot}
                  disabled={!modalFormData.name.trim()}
                  className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all text-xs shadow-lg active:scale-95"
                >
                  Save Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}