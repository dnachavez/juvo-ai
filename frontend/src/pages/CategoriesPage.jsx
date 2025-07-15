import categoryStats from '../data/categoryStats.json';
import CategorySection from '../components/CategorySection';
import CategoryTable from '../components/CategoryTable';

export default function CategoriesPage() {
  return (
    <div className="p-6 bg-slate-800 min-h-screen text-slate-100">
      <h2 className="text-2xl font-bold mb-6">Categorized Case Statistics</h2>
      <CategorySection stats={categoryStats} />
      <CategoryTable stats={categoryStats} />
    </div>
  );
}
