import { useEffect, useState, useRef } from "react";
import { ChevronDown, Check, Loader2, CalendarSync, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getCalendarName = (batchName) => `Timetable - ${batchName ? batchName.toUpperCase() : ""}`;
const SEMESTER_START = "2026-07-27";
const SEMESTER_END = "2026-12-20";
const TIME_ZONE = "Asia/Kolkata";
const UNTIL_RULE = "20261220T182959Z";

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

const syncToGoogleCalendar = async (accessToken, editedSchedule, selectedBatch, onProgress) => {
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
  const calendarName = getCalendarName(selectedBatch);
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
        description: `Course Code: ${cls.courseCode}\nType: ${cls.type}\nBatch: ${selectedBatch}`,
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

export default function CalendarCard({ batches, loadingBatches }) {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState("");
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const dropdownRef = useRef(null);

  // For the two buttons
  const [isAdding, setIsAdding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [syncProgress, setSyncProgress] = useState("");

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBatches = Array.isArray(batches) ? batches.filter((b) => {
    if (typeof b !== 'string') return false;
    return b.toLowerCase().includes(search.toLowerCase());
  }) : [];

  const handleApiError = (error) => {
    console.error(error);
    setErrorMsg(error.message || "Failed to complete Google Calendar action. Please retry.");
    setIsAdding(false);
    setIsResetting(false);
    setSyncProgress("");
  };

  const proceedWithToken = async (token, operation) => {
    try {
      if (operation === "addToCalendar") {
        // Compile exact timetable data
        setSyncProgress("Compiling timetable data...");
        const getLocalTimetableData = () => {
          const scheduleKey = `timetable:schedule:${selectedBatch}`;
          const scheduleData = localStorage.getItem(scheduleKey);
          
          const electives = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`timetable:elective:${selectedBatch}:`)) {
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

          let schedule = null;
          if (scheduleData) {
            schedule = JSON.parse(scheduleData);
          } else {
            // Load batch schedule data
            const raw = {}; // start empty
            schedule = raw;
          }

          return {
            batch: selectedBatch,
            schedule,
            electives,
            allLocalData,
            lastUpdated: new Date().toISOString()
          };
        };

        const timetablePayload = getLocalTimetableData();

        // 1. Upload to Google Drive AppData
        await uploadToGoogleDrive(token, timetablePayload, setSyncProgress);

        // 2. Sync to Google Calendar
        await syncToGoogleCalendar(token, timetablePayload.schedule, selectedBatch, setSyncProgress);

        setSyncProgress("Sync complete! Redirecting...");
        navigate("/calendar?success=true", { replace: true });
      } else {
        // resetCalendar operation
        // Delete calendar related to active workbench
        await deleteCalendarOnly(token, selectedBatch, setSyncProgress);

        setSyncProgress("Calendar reset complete! Redirecting...");
        navigate("/calendar?success=true", { replace: true });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsAdding(false);
      setIsResetting(false);
      setSyncProgress("");
    }
  };

  const requestTokenAndProceed = (googleObj, clientId, operation) => {
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
            handleApiError(new Error(response.error_description || response.error));
            return;
          }
          if (!response.access_token) {
            handleApiError(new Error("No access token returned from Google."));
            return;
          }
          proceedWithToken(response.access_token, operation);
        },
        error_callback: (err) => {
          handleApiError(new Error(err.message || "OAuth authentication error."));
        }
      });
      tokenClient.requestAccessToken({ prompt: "consent", hd: "thapar.edu" });
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleApiCall = (operation) => {
    if (operation === "addToCalendar" && !selectedBatch) return;

    setErrorMsg("");
    setSyncProgress("Initializing...");
    if (operation === "addToCalendar") setIsAdding(true);
    else setIsResetting(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      handleApiError(new Error("Google OAuth Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in your .env file."));
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setSyncProgress("Loading Google authentication...");
      loadGsi()
        .then((googleObj) => {
          requestTokenAndProceed(googleObj, clientId, operation);
        })
        .catch((error) => {
          handleApiError(error);
        });
    } else {
      requestTokenAndProceed(window.google, clientId, operation);
    }
  };

  return (
    <div className={`glass-card rounded-2xl p-6 md:p-8 flex flex-col overflow-visible group hover:border-white/20 transition-all h-full ${isDropdownOpen ? 'z-50' : 'z-10'} relative`}>
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transition-all pointer-events-none" />

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 shadow-inner">
          <CalendarSync size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Google Calendar</h2>
          <p className="text-sm text-white/50">Sync & Reset Events</p>
        </div>
      </div>

      <p className="text-sm text-white/70 mb-6 relative z-10">
        Sync your class timetable up-to date seamlessly to Google Calendar or easily wipe events synced previously.
      </p>

      <div className="space-y-4 mb-8 relative z-20 flex-1">
        {loadingBatches ? (
          <div className="flex items-center gap-3 text-white/50 h-[42px] px-4 glass rounded-lg">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading batches...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 relative group/input pt-2" ref={dropdownRef}>
            <label className="text-sm font-medium text-white/70">Select your batch</label>
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all cursor-text ${isDropdownOpen ? 'border-blue-500/50 ring-2 ring-blue-500/20 bg-black/40' : 'glass border-white/10'}`}
              onClick={() => setIsDropdownOpen(true)}
            >
              <input
                type="text"
                placeholder="Search batch (e.g. 1A11)"
                className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/30 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-[110%] left-0 right-0 max-h-56 overflow-y-auto bg-black/80 border border-white/20 rounded-xl p-2 z-[100] shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((batch) => (
                    <button
                      key={batch}
                      onClick={() => {
                        setSelectedBatch(batch);
                        setSearch(batch);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between mb-0.5
                        ${selectedBatch === batch ? 'bg-blue-500/20 text-blue-300' : 'text-white/70 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <span className="font-medium">{batch}</span>
                      {selectedBatch === batch && <Check size={16} />}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-white/40 text-center flex flex-col items-center gap-2">
                    <span className="opacity-50 text-xl block">📭</span>
                    No batches match '{search}'
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 relative z-10 w-full mt-auto pt-4">
        {errorMsg && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            {errorMsg}
          </div>
        )}
        <div className="flex gap-4 w-full">
          <button
            onClick={() => handleApiCall('addToCalendar')}
            disabled={!selectedBatch || isAdding || isResetting}
            className="flex-1 py-3 px-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isAdding && syncProgress ? <Loader2 className="animate-spin" size={18} /> : <span>Add</span>}
          </button>
          <button
            onClick={() => handleApiCall('resetCalendar')}
            disabled={isAdding || isResetting}
            className="flex-1 py-3 px-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isResetting && syncProgress ? <Loader2 className="animate-spin" size={18} /> : <span>Reset</span>}
          </button>
        </div>

        {(isAdding || isResetting) && syncProgress && (
          <div className="mt-4 p-4 glass rounded-xl border border-white/10 flex flex-col gap-2">
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
    </div>
  );
}
