import React from "react";
import CasesTable from "./CasesTable";

export default function CasesManagement({
  filteredCases,
  searchCases,
  setSearchCases,
  setShowCaseForm,
  cases
}) {
  return (
    <section
      id="cases"
      className="bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6 lg:p-8 shadow-xl"
    >
      <div className="text-center mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 mb-2 sm:mb-3">
          Case Reports Management
        </h2>
        <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
          Track and manage all case reports in the system
        </p>
      </div>
      <div className="flex justify-center mb-6 sm:mb-8">
        <button
          onClick={() => setShowCaseForm(true)}
          className="flex items-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-colors font-medium text-sm sm:text-base lg:text-lg shadow-lg touch-manipulation"
        >
          <span className="hidden sm:inline">Add New Case</span>
          <span className="sm:hidden">Add Case</span>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="lg:col-span-3 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center">
              <input
                type="text"
                placeholder="Search cases..."
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 sm:px-6 py-3 sm:py-4 w-full sm:max-w-md lg:max-w-2xl text-slate-100 placeholder:text-slate-400 text-center text-sm sm:text-base"
                value={searchCases}
                onChange={(e) => setSearchCases(e.target.value)}
              />
            </div>
            <CasesTable filteredCases={filteredCases} />
          </div>
        </div>
        <div className="lg:col-span-1 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4 sm:mb-6 text-center">Case Summary</h3>
            <div className="space-y-3 sm:space-y-6">
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Total Cases</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">{cases.length}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Flagged Cases</div>
                <div className="text-2xl sm:text-3xl font-bold text-red-400">{cases.filter((c) => c.status === "Flagged").length}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Under Investigation</div>
                <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{cases.filter((c) => c.status === "Investigation").length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
