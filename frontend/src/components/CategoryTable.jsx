import { useState } from 'react';

export default function CategoryTable({ stats }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(stats.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedStats = stats.slice(startIndex, endIndex);

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow mb-10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-100">Categories</h3>
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
      
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-700 text-slate-200">
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Cases</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStats.map((item, idx) => (
              <tr key={item.category} className="border-b border-slate-700">
                <td className="px-3 py-2 font-semibold text-slate-100">{item.category}</td>
                <td className="px-3 py-2 text-slate-400">{item.desc}</td>
                <td className="px-3 py-2 text-blue-400 font-bold">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-slate-400 text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, stats.length)} of {stats.length} results
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
