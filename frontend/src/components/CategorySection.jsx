import CategoryStatCard from './CategoryStatCard';

const colorMap = [
  'border-blue-500',
  'border-red-500',
  'border-yellow-500',
  'border-green-500',
  'border-pink-500',
  'border-purple-500',
  'border-orange-500',
  'border-cyan-500',
  'border-fuchsia-500',
  'border-amber-500',
  'border-lime-500',
];

export default function CategorySection({ stats }) {
  // Sort stats by count in descending order for better visual hierarchy
  const sortedStats = [...stats].sort((a, b) => b.count - a.count);
  
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedStats.map((item, idx) => (
          <CategoryStatCard 
            key={item.category} 
            index={idx}
            {...item} 
            color={colorMap[idx % colorMap.length]} 
          />
        ))}
      </div>
    </div>
  );
}
