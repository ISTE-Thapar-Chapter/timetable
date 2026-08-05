import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { SEO_SITE_URL, SEO_SITE_NAME } from "@/lib/seo.config";
import { toPng } from 'html-to-image';
import { batchesList, getBatchesData } from "@/utils/schedule";
import subjectMap from "@/assets/subjectMap.json" with { type: "json" };

const siteUrl = SEO_SITE_URL || "https://timetable.vercel.app";

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

const getScheduleStorageKey = (batchName) => `timetable:schedule:${batchName ? batchName.toUpperCase() : ""}`;
const getPrimaryWorkspaceBatchKey = () => `timetable:workspace:primary-batch`;
const getCalendarName = (batchName) => `Timetable - ${batchName ? batchName.toUpperCase() : ""}`;

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
  if (t.includes("lecture")) return "bg-sky-500/10 border-sky-500/30 text-sky-300";
  if (t.includes("practical") || t.includes("lab")) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
  if (t.includes("tutorial")) return "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300";
  if (t.includes("elective")) return "bg-amber-500/10 border-amber-500/30 text-amber-300";
  return "bg-white/5 border-white/10 text-white/70";
};

const getTypeBadgeColors = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("lecture")) return "bg-sky-500/20 text-sky-400";
  if (t.includes("practical") || t.includes("lab")) return "bg-emerald-500/20 text-emerald-400";
  if (t.includes("tutorial")) return "bg-fuchsia-500/20 text-fuchsia-400";
  if (t.includes("elective")) return "bg-amber-500/20 text-amber-400";
  return "bg-white/10 text-white/50";
};

const CALENDAR_NAME = "Timetable";
const SEMESTER_START = "2026-07-27";
const SEMESTER_END = "2026-12-20";
const TIME_ZONE = "Asia/Kolkata";
const UNTIL_RULE = "20261220T182959Z"; // 2026-12-20 23:59:59 in IST

const DAY_MAP = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

// Loader for Google Identity Services SDK
const loadGsi = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google);
      } else {
        reject(new Error("Google Identity Services failed to initialize."));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Google Identity Services SDK."));
    document.body.appendChild(script);
  });
};

const uploadToGoogleDrive = async (accessToken, timetableData, onProgress) => {
  onProgress("Checking Google Drive AppData...");
  const searchUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${encodeURIComponent("name='timetable.json' and 'appDataFolder' in parents")}`;
  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Failed to check Drive AppData: ${errText}`);
  }
  const searchResult = await searchRes.json();
  const existingFile = searchResult.files && searchResult.files[0];

  const fileContent = JSON.stringify(timetableData);

  if (existingFile) {
    onProgress("Updating timetable.json in Google Drive...");
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
    const updateRes = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: fileContent
    });
    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Failed to update timetable.json: ${errText}`);
    }
  } else {
    onProgress("Uploading timetable.json to Google Drive...");
    const createUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    const boundary = "timetable_sync_boundary";
    const metadata = {
      name: "timetable.json",
      parents: ["appDataFolder"]
    };

    const body = [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      fileContent,
      `--${boundary}--`
    ].join("\r\n");

    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body: body
    });
    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Failed to upload timetable.json: ${errText}`);
    }
  }
};

const syncToGoogleCalendar = async (accessToken, editedSchedule, primaryBatch, onProgress) => {
  onProgress("Checking Google Calendars...");
  const listUrl = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!listRes.ok) {
    const errText = await listRes.text();
    throw new Error(`Failed to fetch calendars: ${errText}`);
  }
  const listData = await listRes.json();
  const calendarName = getCalendarName(primaryBatch);
  const existingCalendar = listData.items?.find(cal => cal.summary === calendarName);

  let calendarId;

  if (existingCalendar) {
    onProgress(`Cleaning up previous ${calendarName} calendar...`);
    const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/${existingCalendar.id}`;
    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!deleteRes.ok) {
      console.warn("Failed to delete calendar, continuing...");
    }
  }

  onProgress(`Creating a fresh ${calendarName} calendar...`);
  const createUrl = "https://www.googleapis.com/calendar/v3/calendars";
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ summary: calendarName, timeZone: TIME_ZONE })
  });
  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create calendar: ${errText}`);
  }
  const newCalendar = await createRes.json();
  calendarId = newCalendar.id;

  const classesToSync = [];

  for (const [day, slots] of Object.entries(editedSchedule || {})) {
    if (!slots) continue;
    for (const [time, info] of Object.entries(slots)) {
      if (!info) continue;
      const courseCode = info[0];
      const room = info[1];
      const subject = info[2];
      const type = info[3];

      if (!subject) continue; // Skip empty slots

      classesToSync.push({ day, time, courseCode, room, subject, type });
    }
  }

  const totalClasses = classesToSync.length;
  if (totalClasses === 0) {
    onProgress("No classes found to sync.");
    return;
  }

  const getFirstOccurrenceDate = (startDateStr, dayName, timeString) => {
    const date = new Date(startDateStr);
    while (date.getDay() !== DAY_MAP[dayName]) {
      date.setDate(date.getDate() + 1);
    }
    const [clock, modifier] = timeString.split(" ");
    let [hour, minute] = clock.split(":").map(Number);
    if (modifier === "PM" && hour !== 12) hour += 12;
    if (modifier === "AM" && hour === 12) hour = 0;
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const getColorId = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("lecture")) return "9"; // Blue
    if (t.includes("lab") || t.includes("practical")) return "10"; // Basil (Green)
    if (t.includes("tutorial")) return "3"; // Grape (Mauve)
    return "8"; // Graphite (Gray)
  };

  onProgress(`Syncing 0 of ${totalClasses} classes...`);

  // Call API in parallel batches of 3
  const batchSize = 3;
  for (let i = 0; i < totalClasses; i += batchSize) {
    const currentBatch = classesToSync.slice(i, i + batchSize);
    
    await Promise.all(currentBatch.map(async (cls) => {
      const start = getFirstOccurrenceDate(SEMESTER_START, cls.day, cls.time);
      const end = new Date(start.getTime() + 50 * 60000);

      const eventBody = {
        summary: `${cls.subject} (${cls.type})`,
        location: cls.room,
        description: `Course Code: ${cls.courseCode}\nType: ${cls.type}\nBatch: ${primaryBatch}`,
        start: {
          dateTime: start.toISOString(),
          timeZone: TIME_ZONE
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: TIME_ZONE
        },
        recurrence: [
          `RRULE:FREQ=WEEKLY;UNTIL=${UNTIL_RULE}`
        ],
        colorId: getColorId(cls.type)
      };

      const eventUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
      const res = await fetch(eventUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(eventBody)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to create event for ${cls.subject}: ${errText}`);
      }
    }));

    const syncedCount = Math.min(i + batchSize, totalClasses);
    onProgress(`Syncing ${syncedCount} of ${totalClasses} classes...`);
  }
};

const deleteCalendarOnly = async (accessToken, batchName, onProgress) => {
  onProgress("Checking Google Calendars...");
  const listUrl = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!listRes.ok) {
    const errText = await listRes.text();
    throw new Error(`Failed to fetch calendars: ${errText}`);
  }
  const listData = await listRes.json();
  const calendarName = getCalendarName(batchName);
  const existingCalendar = listData.items?.find(cal => cal.summary === calendarName);

  if (existingCalendar) {
    onProgress(`Deleting ${calendarName} calendar...`);
    const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/${existingCalendar.id}`;
    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      throw new Error(`Failed to delete calendar: ${errText}`);
    }
    onProgress(`${calendarName} calendar deleted successfully.`);
  } else {
    onProgress(`${calendarName} calendar not found.`);
  }
};

export function HomeSite() {
  const { theme } = useTheme();
  const isDoom = theme === "doom";
  const isIronman = theme === "ironman";
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState("weekPlanner"); // weekPlanner, freeSlots

  // Schedule States for loaded primary batch
  const [originalSchedule, setOriginalSchedule] = useState(null);
  const [editedSchedule, setEditedSchedule] = useState(null);
  const [hasSavedLocalData, setHasSavedLocalData] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Day preview state for dashboard timeline
  const [weekExpandedDay, setWeekExpandedDay] = useState(DAYS[0]);

  // Edit Modal States (for Tab 2 inline editor)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditSlot, setCurrentEditSlot] = useState({ day: "", time: "" });
  const [modalFormData, setModalFormData] = useState({ type: "Lecture", code: "", name: "", location: "", altWeek: null, options: [] });
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
  const [isDownloadingFreeSlots, setIsDownloadingFreeSlots] = useState(false);
  const freeSlotsHiddenTableRef = useRef(null);

  // Google Calendar Integration states
  const [isAddingCalendar, setIsAddingCalendar] = useState(false);
  const [isResettingCalendar, setIsResettingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const [syncProgress, setSyncProgress] = useState("");

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
      setWeekExpandedDay(currentWeekday);
    } else {
      setWeekExpandedDay("Monday"); // Default to Monday if weekend
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
      let resolvedRaw;
      if (["CASTLE_DOOM_GUARD_A", "LATVERIA_COHORT_1", "RICHARDS_IS_INFERIOR"].includes(primaryBatch)) {
        resolvedRaw = getDoomMockSchedule(primaryBatch);
      } else {
        const data = getBatchesData([primaryBatch]);
        const raw = data[primaryBatch] || {};
        resolvedRaw = resolveElectives(raw, primaryBatch);
      }
      setOriginalSchedule(resolvedRaw);

      // 2. Check local modifications
      const storageKey = getScheduleStorageKey(primaryBatch);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isValidScheduleShape(parsed)) {
          setEditedSchedule(resolveElectives(parsed, primaryBatch));
          setHasSavedLocalData(true);
          return;
        }
      }

      setEditedSchedule(cloneSchedule(resolvedRaw));
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

    // Easter Egg Doom triggers
    const query = primarySearch.toLowerCase().trim();
    if (query === "doom" || query === "latveria" || query === "richards") {
      return ["CASTLE_DOOM_GUARD_A", "LATVERIA_COHORT_1", "RICHARDS_IS_INFERIOR"];
    }

    return batches.filter((b) => {
      if (typeof b !== 'string') return false;
      return b.toLowerCase().includes(primarySearch.toLowerCase());
    });
  }, [batches, primarySearch]);

  // Comparison Batch Search Filter (excludes already selected)
  const filteredComparisonBatches = useMemo(() => {
    if (!Array.isArray(batches)) return [];

    // Easter Egg Doom triggers
    const query = comparisonSearch.toLowerCase().trim();
    if (query === "doom" || query === "latveria" || query === "richards") {
      return ["CASTLE_DOOM_GUARD_A", "LATVERIA_COHORT_1", "RICHARDS_IS_INFERIOR"].filter(b => !comparisonBatches.includes(b));
    }

    return batches.filter((b) => {
      if (typeof b !== 'string') return false;
      if (comparisonBatches.includes(b)) return false;
      return b.toLowerCase().includes(comparisonSearch.toLowerCase());
    });
  }, [batches, comparisonSearch, comparisonBatches]);

  // Sync comparisonBatches with primaryBatch when primaryBatch changes
  useEffect(() => {
    if (primaryBatch) {
      setComparisonBatches([primaryBatch]);
    } else {
      setComparisonBatches([]);
    }
  }, [primaryBatch]);

  // Calculate Free Slots when comparison batch list changes
  useEffect(() => {
    if (activeTab !== "freeSlots") return;

    if (comparisonBatches.length < 2) {
      setFreeSlotsResult(null);
      setFreeSlotsError("Select at least 2 batches to compare schedules.");
      return;
    }

    setFreeSlotsLoading(true);
    setFreeSlotsError("");

    try {
      const data = getBatchesData(comparisonBatches);
      if (data && Object.keys(data).length > 0) {
        // Resolve schedules (preferring local storage edits)
        const resolvedSchedules = comparisonBatches.map((batchName) => {
          if (batchName === primaryBatch && editedSchedule) {
            return editedSchedule;
          }
          const storedKey = getScheduleStorageKey(batchName);
          const localStored = localStorage.getItem(storedKey);
          if (localStored) {
            const parsed = JSON.parse(localStored);
            if (isValidScheduleShape(parsed)) {
              return resolveElectives(parsed, batchName);
            }
          }
          const defaultRaw = data[batchName] || {};
          return resolveElectives(defaultRaw, batchName);
        });

        // Compute free slots overlap
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
  }, [comparisonBatches, activeTab]);

  // Workspace Actions
  const handleSelectPrimary = (batchName) => {
    setPrimaryBatch(batchName);
    localStorage.setItem(getPrimaryWorkspaceBatchKey(), batchName);
    setIsPrimaryDropdownOpen(false);
    setPrimarySearch("");
    setActiveTab("weekPlanner");
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
      const upperBatch = primaryBatch.toUpperCase();
      const storageKey = getScheduleStorageKey(primaryBatch);
      localStorage.setItem(storageKey, JSON.stringify(editedSchedule));

      // Save elective selection configurations
      DAYS.forEach((day) => {
        if (!editedSchedule[day]) return;
        Object.keys(editedSchedule[day]).forEach((time) => {
          const slot = editedSchedule[day][time];
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
      setSaveStatus("Changes saved successfully.");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch {
      setSaveStatus("Could not save changes.");
    }
  };

  const handleResetLocal = () => {
    if (!primaryBatch) return;
    const upperBatch = primaryBatch.toUpperCase();
    const storageKey = getScheduleStorageKey(primaryBatch);
    localStorage.removeItem(storageKey);

    // Clear elective keys for this batch
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(`timetable:elective:${primaryBatch}:`) || key.startsWith(`timetable:elective:${upperBatch}:`))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

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
      a.download = `Timetable_${primaryBatch}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate PNG", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFreeSlotsDownload = async () => {
    setIsDownloadingFreeSlots(true);
    try {
      const element = freeSlotsHiddenTableRef.current;
      if (!element) return;

      await new Promise(r => setTimeout(r, 120));

      const dataUrl = await toPng(element, {
        backgroundColor: "#030712",
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
      const downloadName = comparisonBatches.length > 0 ? `Free_Slots_${comparisonBatches.join("_")}.png` : "Common_Free_Slots.png";
      a.download = downloadName;
      a.click();
    } catch (err) {
      console.error("Failed to generate PNG", err);
    } finally {
      setIsDownloadingFreeSlots(false);
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
        type: slotData[3] || "Lecture",
        altWeek: slotData[4] || null,
        options: slotData[5] || []
      });
    } else if (slotData && typeof slotData === "string") {
      setModalFormData({
        code: "",
        location: "",
        name: slotData,
        type: "Lecture",
        altWeek: null,
        options: []
      });
    } else {
      setModalFormData({ code: "", location: "", name: "", type: "Lecture", altWeek: null, options: [] });
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
      modalFormData.type,
      modalFormData.altWeek,
      modalFormData.options
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

  const handleCalendarApiError = (error) => {
    console.error(error);
    setCalendarError(error.message || "Failed to complete Google Calendar action. Please retry.");
    setIsAddingCalendar(false);
    setIsResettingCalendar(false);
    setSyncProgress("");
  };

  const proceedWithCalendarToken = async (token, operation) => {
    try {
      if (operation === "addToCalendar") {
        // Compile exact timetable data
        setSyncProgress("Compiling timetable data...");
        const getLocalTimetableData = () => {
          const scheduleKey = `timetable:schedule:${primaryBatch}`;
          const scheduleData = localStorage.getItem(scheduleKey);
          
          const electives = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`timetable:elective:${primaryBatch}:`)) {
              try {
                electives[key] = JSON.parse(localStorage.getItem(key));
              } catch {
                electives[key] = localStorage.getItem(key);
              }
            }
          }

          const allLocalData = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("timetable:")) {
              allLocalData[key] = localStorage.getItem(key);
            }
          }

          return {
            batch: primaryBatch,
            schedule: scheduleData ? JSON.parse(scheduleData) : editedSchedule,
            electives,
            allLocalData,
            lastUpdated: new Date().toISOString()
          };
        };

        const timetablePayload = getLocalTimetableData();

        // 1. Upload to Google Drive AppData
        await uploadToGoogleDrive(token, timetablePayload, setSyncProgress);

        // 2. Sync to Google Calendar
        await syncToGoogleCalendar(token, timetablePayload.schedule, primaryBatch, setSyncProgress);

        setSyncProgress("Sync complete! Redirecting...");
        navigate("/calendar?success=true", { replace: true });
      } else {
        // resetCalendar operation
        // Delete calendar related to active workbench
        await deleteCalendarOnly(token, primaryBatch, setSyncProgress);

        setSyncProgress("Calendar reset complete! Redirecting...");
        navigate("/calendar?success=true", { replace: true });
      }
    } catch (error) {
      handleCalendarApiError(error);
    } finally {
      setIsAddingCalendar(false);
      setIsResettingCalendar(false);
      setSyncProgress("");
    }
  };

  const requestCalendarTokenAndProceed = (googleObj, clientId, operation) => {
    setSyncProgress("Requesting permissions...");
    const scopes = operation === "addToCalendar"
      ? "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/calendar"
      : "https://www.googleapis.com/auth/calendar";

    try {
      const tokenClient = googleObj.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes,
        callback: (response) => {
          if (response.error) {
            handleCalendarApiError(new Error(response.error_description || response.error));
            return;
          }
          if (!response.access_token) {
            handleCalendarApiError(new Error("No access token returned from Google."));
            return;
          }
          proceedWithCalendarToken(response.access_token, operation);
        },
        error_callback: (err) => {
          handleCalendarApiError(new Error(err.message || "OAuth authentication error."));
        }
      });
      tokenClient.requestAccessToken({ prompt: "consent", hd: "thapar.edu" });
    } catch (err) {
      handleCalendarApiError(err);
    }
  };

  // Google Calendar integration call
  const handleCalendarApiCall = (operation) => {
    if (!primaryBatch) return;

    setCalendarError("");
    setSyncProgress("Initializing...");
    if (operation === "addToCalendar") setIsAddingCalendar(true);
    else setIsResettingCalendar(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      handleCalendarApiError(new Error("Google OAuth Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in your .env file."));
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setSyncProgress("Loading Google authentication...");
      loadGsi()
        .then((googleObj) => {
          requestCalendarTokenAndProceed(googleObj, clientId, operation);
        })
        .catch((error) => {
          handleCalendarApiError(error);
        });
    } else {
      requestCalendarTokenAndProceed(window.google, clientId, operation);
    }
  };

  // Cell rendering inside the Week Timetable
  const renderCellContent = (subjectList, isDesktop = true, isExpanded = false, onEdit = null) => {
    if (!subjectList) return null;

    let code, loc, name, type, altWeek, options;
    if (Array.isArray(subjectList)) {
      [code, loc, name, type, altWeek, options] = subjectList;
    } else {
      name = subjectList;
      type = "Lecture";
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
            <div className={`flex flex-col h-full w-full p-2 rounded-lg transition-all justify-center items-center text-center overflow-hidden ${getTypeColors(type)}`}>
              <span className="font-bold text-[9px] uppercase tracking-wider truncate max-w-full leading-none mb-0.5">{cleanCode}</span>
              {note && <span className="text-[8px] text-amber-400 font-mono leading-none mb-0.5 font-bold uppercase tracking-wider">{note}</span>}
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

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[240px] px-4 py-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col justify-center items-center text-center backdrop-blur-3xl border border-white/20 bg-zinc-950">
              <div className="flex flex-col justify-center items-center gap-1 mb-3 opacity-90 w-full">
                <div className={`font-orbitron font-bold text-[12px] uppercase tracking-wider break-all text-center w-full ${getTypeColors(type).split(' ').find(c => c.startsWith('text-'))}`}>
                  {cleanCode}
                  {note && <div className="text-[10px] text-amber-400 font-mono mt-0.5 font-bold uppercase tracking-wider">{note}</div>}
                </div>
                {loc && (
                  <div className="text-[11px] tracking-wide flex items-center justify-center gap-1 w-full opacity-70">
                    <MapPin size={10} />
                    <span className="break-all text-center min-w-0">{loc}</span>
                  </div>
                )}
              </div>
              <div className="font-space-grotesk font-bold text-[14px] leading-snug mb-3 w-full break-words whitespace-normal text-center text-white">{name}</div>
              <div className="flex items-center gap-1.5 mb-4 shrink-0">
                <span className={`text-[10px] px-2.5 py-1 rounded shadow-sm whitespace-nowrap uppercase tracking-wider ${getTypeBadgeColors(type)}`}>
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
                className="font-space-grotesk text-[11px] font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-all shadow active:scale-[0.98] w-full shrink-0"
              >
                {isElective ? "Select Elective" : "Edit Slot"}
              </button>
            </div>
          </>
        );
      }

      return (
        <div className={`flex flex-col h-full w-full p-2 rounded-lg transition-all justify-center items-center text-center overflow-hidden ${getTypeColors(type)}`}>
          <div className="flex flex-col justify-center items-center gap-0.5 mb-1 opacity-90 w-full">
            <span className="font-bold text-[9px] uppercase tracking-wider line-clamp-2 break-all w-full leading-tight">
              {cleanCode}
              {note && <span className="block text-[8px] text-amber-400 font-mono font-bold mt-0.5 leading-none uppercase tracking-wider">{note}</span>}
            </span>
            {loc && (
              <span className="text-[9px] tracking-wide flex items-center justify-center gap-0.5 w-full opacity-80">
                <MapPin size={8} />
                <span className="truncate max-w-full">{loc}</span>
              </span>
            )}
          </div>
          <span className="font-semibold text-[11px] leading-tight mb-1 line-clamp-3 w-full break-words text-white" title={name}>{name}</span>
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
      <div className={`flex flex-col w-full p-3 border rounded-xl ${getTypeColors(type)}`}>
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
        title="Timetable Dashboard"
        description="Unified college dashboard: View class schedules, edit custom classes, sync calendar notifications, and find overlapping free time slots."
        path="/"
        keywords={["timetable", "schedule", "free slots", "calendar sync", "tiet", "iste", "thapar"]}
        structuredData={homeStructuredData}
      />
      <BackgroundElements />
      <Navbar onLogoClick={handleClearWorkspace} />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-28 pb-16 flex flex-col">
        {!primaryBatch ? (
          // ==================== WORKSPACE SETUP SCREEN ====================
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-2xl text-center space-y-6">
              <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 text-sky-400 shadow-inner mb-2">
                {isDoom ? (
                  <DoomMaskIcon size={32} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                ) : isIronman ? (
                  <ArcReactorIcon size={32} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                ) : (
                  <Layout size={32} />
                )}
              </div>
              <h1 className={`font-space-grotesk text-4xl md:text-5xl font-extrabold tracking-tight text-white ${
                isDoom ? "text-glow-green" : isIronman ? "text-glow-red text-red-500" : ""
              }`}>
                {isDoom ? "Doom's Timetable Decree" : isIronman ? "Stark Holo-Scheduler" : "Timetable Dashboard"}
              </h1>
              <p className="text-base md:text-lg text-white/50 max-w-lg mx-auto">
                {isDoom 
                  ? "DOOM demands compliance. Select your cohort to receive weekly regimental timetable assignments." 
                  : isIronman
                    ? "Welcome back, Boss. Select your protocol to initialize holographic scheduling interfaces."
                    : "Select your batch to view your schedule, edit classes, and compare free time slots."
                }
              </p>

              {/* Central Search work desk */}
              <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/10 relative z-20" ref={primaryDropdownRef}>
                <div className="flex flex-col gap-3 relative text-left">
                  <label className="font-share-tech text-xs uppercase tracking-widest text-white/60">
                    {isDoom ? "SELECT COHORT FOR IMPERIAL DECREE" : isIronman ? "INITIALIZE STARK PROTOCOL (SELECT BATCH)" : "Select Your Batch"}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                      type="text"
                      placeholder={
                        isDoom 
                          ? "Input cohort name under penalty of DOOM..." 
                          : isIronman 
                            ? "Select batch protocol (e.g. 1A11, 2COE1)..." 
                            : "Type batch name (e.g. 1A11, 2COE1, etc.)..."
                      }
                      className={`w-full bg-black/40 border border-white/15 rounded-xl pl-12 pr-10 py-3.5 text-white outline-none focus:ring-4 placeholder:text-white/30 text-sm md:text-base transition-all ${
                        isDoom 
                          ? "focus:border-emerald-500/50 focus:ring-emerald-500/10" 
                          : isIronman 
                            ? "focus:border-red-500/50 focus:ring-red-500/10" 
                            : "focus:border-sky-500/50 focus:ring-sky-500/10"
                      }`}
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
                    <div className={`absolute top-[105%] left-0 right-0 max-h-60 overflow-y-auto bg-zinc-950 border rounded-xl p-2 z-50 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl ${
                      isDoom ? "border-emerald-500/25" : isIronman ? "border-red-500/25" : "border-white/15"
                    }`}>
                      {loadingBatches ? (
                        <div className="flex items-center justify-center p-6 text-white/40 gap-2 text-sm">
                          <Loader2 size={16} className="animate-spin" /> Fetching database...
                        </div>
                      ) : filteredPrimaryBatches.length > 0 ? (
                        filteredPrimaryBatches.map((b) => (
                          <button
                            key={b}
                            onClick={() => handleSelectPrimary(b)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all text-white/70 mb-0.5 font-medium flex items-center justify-between group ${
                              isDoom 
                                ? "hover:bg-emerald-500/10 hover:text-emerald-400" 
                                : isIronman 
                                  ? "hover:bg-red-500/10 hover:text-red-500" 
                                  : "hover:bg-sky-500/10 hover:text-sky-300"
                            }`}
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
                    <span className="font-share-tech text-[10px] uppercase tracking-widest text-white/40 block mb-3">
                      {isDoom ? "REGIMENT COHORTS" : isIronman ? "POPULAR PROTOCOLS" : "Popular Batches"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {batches.slice(0, 8).map((b) => (
                        <button
                          key={b}
                          onClick={() => handleSelectPrimary(b)}
                          className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs font-semibold tracking-wider transition-all ${
                            isDoom 
                              ? "hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400" 
                              : isIronman 
                                ? "hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 text-glow-red" 
                                : "hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-300"
                          }`}
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
          <div className="flex-1 flex flex-col gap-6 mt-4 w-full">
            
             {/* Sleek Horizontal Control Deck */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${
                  isDoom 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                    : isIronman 
                      ? "bg-red-500/10 border border-red-500/20 text-red-500" 
                      : "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                }`}>
                  {isDoom ? (
                    <DoomMaskIcon size={20} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  ) : isIronman ? (
                    <ArcReactorIcon size={20} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  ) : (
                    <Layout size={20} />
                  )}
                </div>
                <div>
                  <span className="font-share-tech text-[9px] uppercase tracking-widest text-white/40 block">
                    {isDoom ? "ASSIGNED COHORT" : isIronman ? "ACTIVE PROTOCOL" : "ACTIVE BATCH"}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h2 className="font-orbitron text-2xl font-black text-white leading-none">{primaryBatch}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold">
                      {isDoom ? "REGIME DECREE" : isIronman ? "STARK OS 26-27" : "ODD 26-27"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs Switcher and Change Workspace button */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setActiveTab("weekPlanner")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "weekPlanner"
                        ? "bg-white text-black shadow-lg"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {isDoom ? "Regimental Planner" : isIronman ? "Interface Console" : "Week Planner"}
                  </button>
                  <button
                    onClick={() => setActiveTab("freeSlots")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "freeSlots"
                        ? "bg-white text-black shadow-lg"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {isDoom ? "Free Slots Decrees" : isIronman ? "Holo-Gap Analyzer" : "Free Slots Panel"}
                  </button>
                </div>

                <button
                  onClick={handleClearWorkspace}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-center flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>{isDoom ? "Re-assign Cohort" : isIronman ? "Eject Protocol" : "Change Batch"}</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC WORKSPACE PANEL */}
            <section className="flex-1 flex flex-col min-w-0 w-full">
              {activeTab === "weekPlanner" && (
                <>
                  <div className="glass-card rounded-2xl p-6 border border-white/10 relative z-10 flex-1 flex flex-col">
                  
                  {/* Title & Actions Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
                    <div>
                      <span className={`font-share-tech text-[10px] uppercase tracking-widest block mb-1 ${
                        isDoom ? "text-emerald-400" : isIronman ? "text-red-500" : "text-sky-400"
                      }`}>
                        {isDoom ? "IMPERIAL PLANNER" : isIronman ? "STARK MAIN CONSOLE" : "Schedule Planner"}
                      </span>
                      <h2 className={`font-space-grotesk text-2xl font-bold text-white ${
                        isDoom ? "text-glow-green" : isIronman ? "text-glow-red text-red-500" : ""
                      }`}>
                        {isDoom ? "Weekly Regimental Decree" : isIronman ? "Stark Weekly Scheduler" : "Edit Weekly Schedule"}
                      </h2>
                      <p className="text-xs text-white/50 mt-1">
                        {isDoom 
                          ? "Adjust imperial cohort assignments. Changes are bound to local device memory." 
                          : isIronman
                            ? "Configure Stark-engineered timeline modules below. Alterations will compile onto local nodes."
                            : "Drag classes to move them, or click on a class to edit details"
                        }
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        onClick={handleSaveLocal}
                        disabled={!editedSchedule}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 font-bold rounded-xl border transition-all active:scale-95 disabled:opacity-50 text-xs ${
                          isDoom 
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20" 
                            : isIronman 
                              ? "bg-red-500/10 text-red-500 border-red-500/25 hover:bg-red-500/20 text-glow-red" 
                              : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                        }`}
                      >
                        {isDoom ? "Commit Decree" : isIronman ? "Compile Protocol" : "Save Local"}
                      </button>
                      <button
                        onClick={handleResetLocal}
                        disabled={!hasSavedLocalData}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 font-bold rounded-xl border transition-all active:scale-95 disabled:opacity-50 text-xs ${
                          isDoom 
                            ? "bg-zinc-800/50 text-white/50 border-white/5 hover:bg-zinc-800" 
                            : isIronman 
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 text-glow-gold" 
                              : "bg-sky-500/10 text-sky-300 border-sky-400/20 hover:bg-sky-500/20"
                        }`}
                      >
                        {isDoom ? "Revert Archival" : isIronman ? "Flush Cache" : "Reset Local"}
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
                    <div className={`mb-4 text-xs px-4 py-2.5 rounded-xl font-semibold border ${
                      isDoom 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" 
                        : isIronman 
                          ? "bg-red-500/10 border-red-500/20 text-red-400" 
                          : "bg-sky-500/10 border-sky-500/20 text-sky-300"
                    }`}>
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (cellData) {
                                      const isElective = Array.isArray(cellData) && (cellData[3] === "Elective" || (cellData[5] && cellData[5].length > 0));
                                      const isUnselected = isElective && (!cellData[0] || cellData[0] === "ELECTIVE");
                                      if (isUnselected) {
                                        openSlotModal(day, time, cellData);
                                      } else {
                                        setExpandedCell(isExpanded ? null : `${day}-${time}`);
                                      }
                                    } else {
                                      openSlotModal(day, time, null);
                                    }
                                  }}
                                  className={`p-1.5 border-b border-white/5 text-center transition-all cursor-pointer relative h-20 w-[95px] ${
                                    isDragOver ? "bg-sky-500/20 border-2 border-dashed border-sky-400" : ""
                                  } ${cellData ? (!isExpanded ? "hover:scale-[1.02]" : "") : "hover:bg-white/[0.02]"}`}
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
                  <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -9999 }}>
                    <div ref={hiddenTableRef} style={{ width: "1350px", padding: "30px", background: "#030712", color: "#ffffff" }}>
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

                {/* Calendar Sync Panel */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 relative z-10 mt-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner shrink-0">
                      <CalendarSync size={24} />
                    </div>
                    <div>
                      <h3 className="font-space-grotesk text-lg font-bold text-white">Google Calendar Sync</h3>
                      <p className="text-xs text-white/50">Push your custom timetable to your Google Calendar</p>
                    </div>
                  </div>

                  <p className="text-sm text-white/70 mb-5 leading-relaxed max-w-2xl">
                    Wipe previously synced slots and push your live custom edited {primaryBatch} schedule directly to your Google Calendar accounts. Only valid Thapar student emails are authorized.
                  </p>

                  {calendarError && (
                    <div className="text-red-400 text-sm bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/20 mb-4 font-semibold">
                      {calendarError}
                    </div>
                  )}

                  <div className="flex gap-4 max-w-md">
                    <button
                      onClick={() => handleCalendarApiCall("addToCalendar")}
                      disabled={isAddingCalendar || isResettingCalendar}
                      className="flex-1 py-3 px-4 bg-white hover:bg-white/90 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {isAddingCalendar && syncProgress ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                      <span>Sync Events</span>
                    </button>

                    <button
                      onClick={() => handleCalendarApiCall("resetCalendar")}
                      disabled={isAddingCalendar || isResettingCalendar}
                      className="flex-1 py-3 px-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {isResettingCalendar && syncProgress ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      <span>Reset Calendar</span>
                    </button>
                  </div>

                  {(isAddingCalendar || isResettingCalendar) && syncProgress && (
                    <div className="mt-4 p-4 glass rounded-xl border border-white/10 flex flex-col gap-2 max-w-md">
                      <div className="flex justify-between items-center text-xs text-white/70">
                        <span className="font-semibold">{syncProgress}</span>
                        <Loader2 className="animate-spin text-sky-400" size={14} />
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-sky-400 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: syncProgress.includes("Google Drive") ? "40%" :
                                   syncProgress.includes("fresh Timetable") ? "60%" :
                                   syncProgress.includes("Syncing") ? 
                                     (() => {
                                       const matches = syncProgress.match(/\d+/g);
                                       if (matches && matches.length >= 2) {
                                         const current = parseInt(matches[0]);
                                         const total = parseInt(matches[1]);
                                         return `${60 + (current / total) * 40}%`;
                                       }
                                       return "80%";
                                     })() :
                                   "15%"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

              {/* TAB 3: FREE SLOTS COMPARER */}
              {activeTab === "freeSlots" && (
                <div className="glass-card rounded-2xl p-6 border border-white/10 relative z-10 flex-1 flex flex-col">
                  
                  {/* Header & input */}
                  <div className="border-b border-white/10 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className={`font-share-tech text-[10px] uppercase tracking-widest block mb-1 ${
                        isDoom ? "text-emerald-400" : isIronman ? "text-red-500" : "text-sky-400"
                      }`}>
                        {isDoom ? "IMPERIAL RECONNAISSANCE" : isIronman ? "HOLO-DIAGNOSTICS" : "Find Common Gaps"}
                      </span>
                      <h2 className={`font-space-grotesk text-2xl font-bold text-white ${
                        isDoom ? "text-glow-green" : isIronman ? "text-glow-cyan text-cyan-400" : ""
                      }`}>
                        {isDoom ? "Overlapping Cohort Gaps" : isIronman ? "Stark Holo-Gap Diagnostics" : "Compare Batch Schedules"}
                      </h2>
                      <p className="text-xs text-white/50 mt-1">
                        {isDoom 
                          ? "DOOM commands identifying overlapping rest schedules for imperial surveillance." 
                          : isIronman
                            ? "Execute hologram analysis to identify intersecting idle phases across separate user protocols."
                            : "Select multiple batches to find overlapping free slots"
                        }
                      </p>
                    </div>
                    {freeSlotsResult && (
                      <button
                        onClick={handleFreeSlotsDownload}
                        disabled={isDownloadingFreeSlots}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50 text-xs shadow-lg whitespace-nowrap self-start md:self-center"
                      >
                        {isDownloadingFreeSlots ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        Download PNG
                      </button>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Active batch lists */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/50">Active Batches</label>
                      <div className="flex flex-wrap gap-2">
                        {comparisonBatches.length > 0 ? (
                          comparisonBatches.map((b) => (
                            <button
                              key={b}
                              onClick={() => setComparisonBatches(comparisonBatches.filter((x) => x !== b))}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                                b === primaryBatch
                                  ? "bg-sky-500/10 border-sky-500/20 text-sky-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                                  : "bg-white/5 border-white/10 text-white/80 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                              }`}
                            >
                              <span>{b} {b === primaryBatch && "(Active)"}</span>
                              <X size={12} />
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-white/40 italic py-1">No batches selected. Add below or from search.</span>
                        )}
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

                  {/* Off-screen capture template (to ensure perfect, unclipped downloads) */}
                  {freeSlotsResult && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -9999 }}>
                      <div ref={freeSlotsHiddenTableRef} style={{ width: "1350px", padding: "35px", background: "#030712", color: "#ffffff" }}>
                        <div style={{ marginBottom: "25px", borderBottom: "2px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>
                          <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Space Grotesk, sans-serif" }}>COMMON FREE SLOTS</div>
                          <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: "5px 0 0 0", fontFamily: "Space Grotesk, sans-serif" }}>Overlapping Availability</h2>
                          {comparisonBatches.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Batches:</span>
                              {comparisonBatches.map((b) => (
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
                                  const isFree = freeSlotsResult[day]?.includes(time);
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

            {modalFormData.options && modalFormData.options.length > 0 ? (
              <div className="space-y-4">
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
              </div>
            ) : (
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
            )}

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