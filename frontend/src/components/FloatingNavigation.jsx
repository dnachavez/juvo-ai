import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingNavigation({
  navigationItems,
  scrollToSection,
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
      key="sidenav"
      initial={{opacity: 0, x: -20}}
      whileHover={{opacity: 1, x: 0}}
      exit={{opacity: 0, x: -20}}
      transition={{duration: .2}}
      className="fixed cursor-pointer h-screen top-0 sm:left-6 lg:left-0 z-50">
        <div className="h-full bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded shadow-2xl p-2">
          <div className="flex flex-col gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex cursor-pointer items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg transition-colors group touch-manipulation"
                title={item.label}
              >
                <item.icon size={16} className="sm:hidden flex-shrink-0" />
                <item.icon
                  size={18}
                  className="hidden sm:block lg:hidden flex-shrink-0"
                />
                <item.icon
                  size={20}
                  className="hidden lg:block flex-shrink-0"
                />
                <span className="hidden sm:block text-xs sm:text-sm font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
