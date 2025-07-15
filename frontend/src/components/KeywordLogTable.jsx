import logs from '../data/keywordLogs.json';

export default function KeywordLogTable() {
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow mt-6">
      <h2 className="text-lg font-semibold mb-3 text-slate-100">Keyword Detection Log</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-200">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-3 py-2 text-left">Date Detected</th>
              <th className="px-3 py-2 text-left">Detected Text</th>
              <th className="px-3 py-2 text-left">Page Name</th>
              <th className="px-3 py-2 text-left">Risky Keyword</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} className="border-b border-slate-700">
                <td className="px-3 py-2">{log.date}</td>
                <td className="px-3 py-2">{log.text}</td>
                <td className="px-3 py-2">{log.page}</td>
                <td className="px-3 py-2">{log.keyword}</td>
                <td className="px-3 py-2">
                  <span className="px-2 sm:px-2 py-1 rounded-md sm:rounded-lg bg-red-600 text-sm sm:text-base font-medium text-white w-[120px] text-center inline-block">{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
