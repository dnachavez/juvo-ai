import React from "react";
import DashboardCard from "./DashboardCard";

export default function DashboardOverview({ cards }) {
  return (
    <section
      id="overview"
      className="bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6 lg:p-8 shadow-xl"
    >
      <div className="text-center mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 mb-2 sm:mb-3">
          Dashboard
        </h2>
        <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
          Comprehensive monitoring and case management system
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
        {cards.map((card, idx) => (
          <DashboardCard key={idx} index={idx} {...card} />
        ))}
      </div>
    </section>
  );
}
