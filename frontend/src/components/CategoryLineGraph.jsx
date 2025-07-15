import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CategoryLineGraph({ stats }) {
  // Transform the data for the line chart
  const chartData = stats.map((item, index) => ({
    name: item.category.length > 20 ? item.category.substring(0, 20) + '...' : item.category,
    fullName: item.category,
    count: item.count,
    desc: item.desc,
    index: index + 1
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-100 font-semibold text-sm mb-1">{data.fullName}</p>
          <p className="text-blue-400 font-bold text-lg mb-1">{data.count} cases</p>
          <p className="text-slate-400 text-xs leading-tight">{data.desc}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg border border-slate-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-100 mb-2">Categorized Case Statistics</h3>
        <p className="text-slate-400 text-sm">Case distribution across different categories</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="name"
              stroke="#9CA3AF"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2, fill: '#1E40AF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 