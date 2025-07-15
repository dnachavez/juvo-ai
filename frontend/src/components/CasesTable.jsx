import cases from "../data/caseReports.json";

export default function CasesTable() {
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow mt-6">
      <h2 className="text-lg font-semibold mb-3 text-slate-100">
        Case Reports
      </h2>
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
            {cases.map((c, idx) => (
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
    </div>
  );
}
