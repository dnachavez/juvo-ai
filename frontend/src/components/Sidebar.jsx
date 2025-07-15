import { Home, FileText, Map, Search, Settings, LogOut, Flag } from 'lucide-react';


const navItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Cases", icon: FileText, path: "/cases" },
  { name: "Categories", icon: Flag, path: "/categories" },
  { name: "Heatmap", icon: Map, path: "/heatmap" },
  { name: "Keyword Monitor", icon: Search, path: "/keywords" },
  { name: "Settings", icon: Settings, path: "#" },
  { name: "Logout", icon: LogOut, path: "#" },
];

import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="bg-slate-900 h-screen w-56 flex flex-col py-6 px-4 border-r border-slate-800">
      <div className="text-2xl font-bold text-slate-100 mb-8">Anti-Trafficking</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map(({ name, icon: Icon, path }) => (
            <li key={name}>
              <Link
                to={path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${location.pathname === path ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-200 hover:bg-slate-800'}`}
              >
                <Icon size={20} />
                <span>{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
