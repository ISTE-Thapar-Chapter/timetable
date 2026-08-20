import React from 'react';
import CONFIG from '@/config';

const MaintenanceMode = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full text-center z-10 space-y-6">
        {/* Animated Icon Container */}
        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-2 shadow-lg shadow-amber-500/5 animate-pulse">
          <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17l2.496-3.03c.317-.384.74-.664 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.654-4.654m0 0l3.03-2.496c.102-.468.382-.89.766-1.208L17.25 3A2.652 2.652 0 0121 6.75l-5.83 5.83m-4.001 2.59l4.001-2.59" />
          </svg>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full">
            Under Maintenance
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            We'll be back soon!
          </h1>
        </div>

        {/* Description Message */}
        <p className="text-slate-400 text-sm leading-relaxed">
          {CONFIG.MAINTENANCE_DESCRIPTION}
        </p>

        {/* Operational Status Card (No duration part) */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Status</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              {CONFIG.MAINTENANCE_STATUS_MESSAGE}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 text-xs text-slate-500">
          ISTE Timetable 2.0 &bull; Scheduled Maintenance
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
