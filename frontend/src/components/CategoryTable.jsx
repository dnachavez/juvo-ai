export default function CategoryTable({ stats }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-slate-800 mb-10">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-700 text-slate-200">
            <th className="px-3 py-2 text-left">Category</th>
            <th className="px-3 py-2 text-left">Description</th>
            <th className="px-3 py-2 text-left">Cases</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((item, idx) => (
            <tr key={item.category} className="border-b border-slate-700">
              <td className="px-3 py-2 font-semibold text-slate-100">{item.category}</td>
              <td className="px-3 py-2 text-slate-400">{item.desc}</td>
              <td className="px-3 py-2 text-blue-400 font-bold">{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
