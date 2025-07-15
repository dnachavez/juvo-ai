import React from "react";

export default function LogFormModal({
  showLogForm,
  handleAddLog,
  logForm,
  setLogForm,
  setShowLogForm
}) {
  const statusOptions = [
    { value: "review", label: "Under Review" },
    { value: "flagged", label: "Flagged" },
    { value: "cleared", label: "Cleared" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add current timestamp if date is empty
    const formData = {
      ...logForm,
      date: logForm.date || new Date().toISOString().split("T")[0],
      status: logForm.status || statusOptions[0].value,
    };
    handleAddLog(e, formData);
  };

  if (!showLogForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md"
      >
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-100 mb-4 sm:mb-6 text-center">
          Add Keyword Log
        </h3>
        <div className="space-y-3 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Date
            </label>
            <input
              type="date"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base"
              value={logForm.date}
              onChange={(e) =>
                setLogForm((f) => ({ ...f, date: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Detected Text
            </label>
            <textarea
              required
              placeholder="Enter detected text"
              rows="3"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base placeholder:text-slate-500 resize-none"
              value={logForm.text}
              onChange={(e) =>
                setLogForm((f) => ({ ...f, text: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Page Name
            </label>
            <input
              type="text"
              required
              placeholder="Page name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base placeholder:text-slate-500"
              value={logForm.page}
              onChange={(e) =>
                setLogForm((f) => ({ ...f, page: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
              Risky Keyword
            </label>
            <input
              type="text"
              required
              placeholder="Keyword"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm sm:text-base placeholder:text-slate-500"
              value={logForm.keyword}
              onChange={(e) =>
                setLogForm((f) => ({ ...f, keyword: e.target.value }))
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
              value={logForm.status}
              onChange={(e) =>
                setLogForm((f) => ({ ...f, status: e.target.value }))
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
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
          <button
            type="button"
            onClick={() => setShowLogForm(false)}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-500 transition-colors font-medium text-sm sm:text-base touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-slate-900 font-medium transition-colors text-sm sm:text-base touch-manipulation"
          >
            Add Log
          </button>
        </div>
      </form>
    </div>
  );
}
