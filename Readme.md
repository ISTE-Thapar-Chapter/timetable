# ISTE Thapar Chapter | Timetable

It is a feature-rich web application designed to convert complex Excel sheets and PDF schedules into an interactive user interface. Featuring a high-performance grid, free-slot comparison across multiple batches, offline access, Google Calendar integration, and customized themes, this application streamlines academic coordination.

---

## Features

### Access Website Offline
Maintain access to your schedule even without an active internet connection.
- **Service Worker Caching:** Application assets and schedule data are cached locally to load instantly when offline.
- **PWA Capabilities:** Installable on desktop and mobile devices for a native application experience.

### Excel to Interactive UI
Convert multi-tabbed spreadsheets into a smooth, interactive dashboard.
- **Responsive Grid:** View class timetables day-by-day and slot-by-slot.
- **Fluid Animations:** Interface transitions powered by Framer Motion, with typography set in Inter.

### Free Slots Finder (Multi-Batch)
Identify common free periods for group studies, club recruitments, or makeup classes.
- **Cross-Batch Comparison:** Select multiple batches (e.g., CSE-A, ECE-B) to visualize overlapping free periods.
- **Collision Checking:** Review schedule conflicts directly in the scheduler view.

### Custom Theme Selector
Choose your visual preference with a built-in theme engine that adapts the entire layout, backgrounds, and interactive elements.
- **Default Sleek Theme:** Clean, modern cyber-blue layout for standard scheduling.
- **Doctor Doom Theme:** An emerald-glow interface featuring Web Audio API speech synthesis commands and a mascot companion.
- **Iron Man Theme:** A high-tech red-and-gold HUD interface inspired by sleek futuristic grid layouts.

### Sync Schedule to Google Calendar
Synchronize class timetables with external calendar applications.
- **One-Click Sync:** Authenticate with Google to export batch schedules directly to Google Calendar.
- **Reminders:** Configure native device notifications before scheduled lectures.

### Save and Update Schedule
Persistent configuration updates.
- **Local Storage Integration:** Persists selected batch configurations, active themes, and preferences across sessions.
- **Dynamic Updates:** Make and view schedule changes locally.

### Download PNG Format
Export your schedule visualizer layout to static image files for offline reference or sharing.
- **Image Export:** Save the schedule grid to a high-quality PNG image file directly to your local storage.
- **Easy Sharing:** Share schedule visuals via messaging apps or save them as device lockscreens.

---

## Contributing and Issue Tracking

To suggest corrections or updates to a specific batch schedule, please open an issue using the specialized template:
- **Report Schedule Inaccuracies:** [Batch Schedule Fix](https://github.com/ISTE-Thapar-Chapter/timetable/issues)
