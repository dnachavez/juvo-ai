import React from "react";
import KeywordLogTable from "./KeywordLogTable";

export default function KeywordsSection({
  filteredLogs,
  searchLogs,
  setSearchLogs,
  setShowLogForm,
  logs
}) {
  return (
    <section
      id="keywords"
      className="bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6 lg:p-8 shadow-xl"
    >
      <div className="text-center mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 mb-2 sm:mb-3">
          Keyword Detection System
        </h2>
        <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
          Monitor and analyze keyword detections across platforms
        </p>
      </div>
      <div className="flex justify-center mb-6 sm:mb-8">
        <button
          onClick={() => setShowLogForm(true)}
          className="flex items-center gap-2 sm:gap-3 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-slate-900 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-colors font-medium text-sm sm:text-base lg:text-lg shadow-lg touch-manipulation"
        >
          <span className="hidden sm:inline">Add Detection Log</span>
          <span className="sm:hidden">Add Log</span>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="lg:col-span-3 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center">
              <input
                type="text"
                placeholder="Search keywords..."
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 sm:px-6 py-3 sm:py-4 w-full sm:max-w-md lg:max-w-2xl text-slate-100 placeholder:text-slate-400 text-center text-sm sm:text-base"
                value={searchLogs}
                onChange={(e) => setSearchLogs(e.target.value)}
              />
            </div>
            <KeywordLogTable filteredLogs={filteredLogs} />
          </div>
        </div>
        <div className="lg:col-span-1 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4 sm:mb-6 text-center">Detection Stats</h3>
            <div className="space-y-3 sm:space-y-6">
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Total Detections</div>
                <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{logs.length}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Flagged Items</div>
                <div className="text-2xl sm:text-3xl font-bold text-red-400">{logs.filter((l) => l.status === "Flagged").length}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Monitored Pages</div>
                <div className="text-2xl sm:text-3xl font-bold text-green-400">{new Set(logs.map((l) => l.page)).size}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
