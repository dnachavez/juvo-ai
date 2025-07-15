import { Bell, UserCircle } from "lucide-react";
import JuvoIcon from "../assets/juvo.svg";
import { useState } from "react";

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "New Case Report",
      message: "A new case has been reported in Carbon Market",
      time: "5m ago",
    },
    {
      id: 2,
      title: "High Risk Alert",
      message: "Unusual activity detected in Fuente Circle",
      time: "10m ago",
    },
    {
      id: 3,
      title: "Keyword Match",
      message: "New keyword match found in recent scan",
      time: "15m ago",
    },
  ];

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
      <div className="flex items-center">
        <img src={JuvoIcon} className="w-10 h-10" />
        <h1 className="text-xl text-slate-100 tracking-widest">JUVO</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-300 hover:text-slate-100 focus:outline-none cursor-pointer hover:bg-slate-700 p-2 sm:p-3 rounded-full transition-colors touch-manipulation"
          >
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute md:right-0 -right-3 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-3 hover:bg-slate-700/50 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-slate-200">
                      {notification.title}
                    </p>
                    <span className="text-xs text-slate-400">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {notification.message}
                  </p>
                </div>
              ))}
              <div className="border-t border-slate-700 mt-2 pt-2 px-4">
                <button className="text-sm text-slate-300 hover:text-slate-100 w-full text-center py-2 px-4 rounded hover:bg-slate-600 transition-colors touch-manipulation">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
