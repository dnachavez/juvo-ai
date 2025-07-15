import { useState } from 'react';
import casesData from '../data/caseReports.json';
import { Plus, Search } from 'lucide-react';

export default function CasesPage() {
  const [search, setSearch] = useState('');
  const [cases, setCases] = useState(casesData);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: '',
    location: '',
    type: '',
    status: '',
    reportedBy: ''
  });

  const filtered = cases.filter(c =>
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase()) ||
    c.status.toLowerCase().includes(search.toLowerCase()) ||
    c.reportedBy.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddCase(e) {
    e.preventDefault();
    setCases([{ ...form }, ...cases]);
    setForm({ date: '', location: '', type: '', status: '', reportedBy: '' });
    setShowForm(false);
  }

  return (
    <div className="p-6 bg-slate-800 min-h-screen text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Case Reports</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-colors font-medium text-sm sm:text-base lg:text-lg shadow-lg touch-manipulation">
          <Plus size={18} /> Add Case
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Search size={18} className="text-blue-400" />
        <input
          type="text"
          placeholder="Search by location, type, status, or reporter..."
          className="bg-blue-900 border bg-slate-700 rounded px-3 py-2 w-full text-slate-100 placeholder:text-blue-300"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-lg shadow bg-slate-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-800 text-blue-200">
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Reported By</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-blue-300">No cases found.</td></tr>
            ) : filtered.map((c, idx) => (
              <tr key={idx} className="border-b border-blue-800">
                <td className="px-3 py-2">{c.date}</td>
                <td className="px-3 py-2">{c.location}</td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">
                  <span className={`px-3 sm:px-4 py-2 rounded-md sm:rounded-lg text-sm sm:text-base font-medium text-white w-[120px] text-center inline-block ${c.status === 'Flagged' ? 'bg-red-600' : 'bg-yellow-600'}`}>{c.status}</span>
                </td>
                <td className="px-3 py-2">{c.reportedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleAddCase} className="bg-blue-900 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Case</h3>
            <div className="mb-2">
              <label className="block mb-1">Date</label>
              <input type="date" required className="w-full px-3 py-2 rounded bg-blue-800 border border-blue-700 text-slate-100" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Location</label>
              <input type="text" required className="w-full px-3 py-2 rounded bg-blue-800 border border-blue-700 text-slate-100" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Type</label>
              <input type="text" required className="w-full px-3 py-2 rounded bg-blue-800 border border-blue-700 text-slate-100" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Status</label>
              <input type="text" required className="w-full px-3 py-2 rounded bg-blue-800 border border-blue-700 text-slate-100" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Reported By</label>
              <input type="text" required className="w-full px-3 py-2 rounded bg-blue-800 border border-blue-700 text-slate-100" value={form.reportedBy} onChange={e => setForm(f => ({ ...f, reportedBy: e.target.value }))} />
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-500 transition-colors font-medium text-sm sm:text-base touch-manipulation">Cancel</button>
              <button type="submit" className="px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium transition-colors text-sm sm:text-base touch-manipulation">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
