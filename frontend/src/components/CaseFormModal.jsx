import React from "react";

export default function CaseFormModal({
  showCaseForm,
  handleAddCase,
  caseForm,
  setCaseForm,
  setShowCaseForm
}) {
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add current timestamp if date is empty
    const formData = {
      ...caseForm,
      date: caseForm.date || new Date().toISOString().split("T")[0],
      status: caseForm.status || statusOptions[0].value,
    };
    handleAddCase(e, formData);
  };

  if (!showCaseForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md"
      >
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-100 mb-4 sm:mb-6 text-center">
          Add New Case
        </h3>
        <div className="space-y-3 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Date
            </label>
            <input
              type="date"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base"
              value={caseForm.date}
              onChange={(e) =>
                setCaseForm((f) => ({ ...f, date: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Location
            </label>
            <input
              type="text"
              required
              placeholder="Enter location"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base placeholder:text-slate-500"
              value={caseForm.location}
              onChange={(e) =>
                setCaseForm((f) => ({ ...f, location: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Type
            </label>
            <input
              type="text"
              required
              placeholder="Case type"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base placeholder:text-slate-500"
              value={caseForm.type}
              onChange={(e) =>
                setCaseForm((f) => ({ ...f, type: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Status
            </label>
            <select
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base"
              value={caseForm.status}
              onChange={(e) =>
                setCaseForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="" disabled>
                Select status
              </option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Reported By
            </label>
            <input
              type="text"
              required
              placeholder="Reporter name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base placeholder:text-slate-500"
              value={caseForm.reportedBy}
              onChange={(e) =>
                setCaseForm((f) => ({ ...f, reportedBy: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
          <button
            type="button"
            onClick={() => setShowCaseForm(false)}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-500 transition-colors font-medium text-sm sm:text-base touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium transition-colors text-sm sm:text-base touch-manipulation"
          >
            Add Case
          </button>
        </div>
      </form>
    </div>
  );
}
