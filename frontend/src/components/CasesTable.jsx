import { useState } from 'react';
import cases from "../data/caseReports.json";

export default function CasesTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(cases.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCases = cases.slice(startIndex, endIndex);

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-slate-100">
          Case Reports
        </h2>
        <select
          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-slate-100 text-sm"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
          <option value={25}>25 rows</option>
          <option value={50}>50 rows</option>
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-200">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Type of Case</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Reported By</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCases.map((c, idx) => (
              <tr key={idx} className="border-b border-slate-700">
                <td className="px-3 py-2">{c.date}</td>
                <td className="px-3 py-2">{c.location}</td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 sm:px-4 py-1 rounded-md sm:rounded-lg text-sm sm:text-base font-medium text-white w-[120px] text-center inline-block ${
                      c.status === "Flagged" ? "bg-red-600" : "bg-yellow-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-3 py-2">{c.reportedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-slate-400 text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, cases.length)} of {cases.length} results
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-slate-100 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-slate-300 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-slate-100 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
