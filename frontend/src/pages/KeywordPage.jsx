import { useState } from 'react';
import logsData from '../data/keywordLogs.json';
import { Search, Plus } from 'lucide-react';

export default function KeywordPage() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState(logsData);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: '',
    text: '',
    page: '',
    keyword: '',
    status: ''
  });

  const filtered = logs.filter(log =>
    log.text.toLowerCase().includes(search.toLowerCase()) ||
    log.page.toLowerCase().includes(search.toLowerCase()) ||
    log.keyword.toLowerCase().includes(search.toLowerCase()) ||
    log.status.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddLog(e) {
    e.preventDefault();
    setLogs([{ ...form }, ...logs]);
    setForm({ date: '', text: '', page: '', keyword: '', status: '' });
    setShowForm(false);
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Keyword Detection Log</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 sm:gap-3 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-slate-900 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-colors font-medium text-sm sm:text-base lg:text-lg shadow-lg touch-manipulation">
          <Plus size={18} /> Add Log
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Search size={18} className="text-yellow-400" />
        <input
          type="text"
          placeholder="Search by text, page, keyword, or status..."
          className="bg-slate-800 border border-yellow-500 rounded px-3 py-2 w-full text-slate-100 placeholder:text-yellow-300"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-lg shadow bg-slate-800">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-yellow-500 text-slate-900">
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Detected Text</th>
              <th className="px-3 py-2 text-left">Page Name</th>
              <th className="px-3 py-2 text-left">Risky Keyword</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-yellow-300">No logs found.</td></tr>
            ) : filtered.map((log, idx) => (
              <tr key={idx} className="border-b border-yellow-500/30">
                <td className="px-3 py-2">{log.date}</td>
                <td className="px-3 py-2">{log.text}</td>
                <td className="px-3 py-2">{log.page}</td>
                <td className="px-3 py-2">{log.keyword}</td>
                <td className="px-3 py-2">
                  <span className="px-3 sm:px-4 py-2 rounded-md sm:rounded-lg bg-red-600 text-sm sm:text-base font-medium text-white w-[120px] text-center inline-block">{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleAddLog} className="bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Keyword Log</h3>
            <div className="mb-2">
              <label className="block mb-1">Date</label>
              <input type="date" required className="w-full px-3 py-2 rounded bg-slate-700 border border-yellow-500 text-slate-100" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Detected Text</label>
              <input type="text" required className="w-full px-3 py-2 rounded bg-slate-700 border border-yellow-500 text-slate-100" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Page Name</label>
              <input type="text" required className="w-full px-3 py-2 rounded bg-slate-700 border border-yellow-500 text-slate-100" value={form.page} onChange={e => setForm(f => ({ ...f, page: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Risky Keyword</label>
              <input type="text" required className="w-full px-3 py-2 rounded bg-slate-700 border border-yellow-500 text-slate-100" value={form.keyword} onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Status</label>
              <input type="text" required className="w-full px-3 py-2 rounded bg-slate-700 border border-yellow-500 text-slate-100" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} />
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-500 transition-colors font-medium text-sm sm:text-base touch-manipulation">Cancel</button>
              <button type="submit" className="px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-slate-900 font-medium transition-colors text-sm sm:text-base touch-manipulation">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
