import React from "react";
import CategoryLineGraph from "./CategoryLineGraph";
import CategorySection from "./CategorySection";

export default function CategoriesSection({ categoryStats }) {
  return (
    <section
      id="categories"
      className="bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6 lg:p-8 shadow-xl"
    >
      <div className="text-center mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 mb-2 sm:mb-3">
          Case Categories Analysis
        </h2>
        <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
          Statistical breakdown and trends across different case types
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8 lg:mb-10">
        <div className="xl:col-span-2 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <CategoryLineGraph stats={categoryStats} />
        </div>
        <div className="xl:col-span-1 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 sm:p-6 h-full">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4 sm:mb-6 text-center">
              Quick Statistics
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Total Categories</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">{categoryStats.length}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Total Cases</div>
                <div className="text-2xl sm:text-3xl font-bold text-green-400">{categoryStats.reduce((sum, cat) => sum + cat.count, 0)}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                <div className="text-slate-300 text-xs sm:text-sm mb-1">Highest Category</div>
                <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{Math.max(...categoryStats.map((cat) => cat.count))}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-100 mb-6 sm:mb-8 text-center">Category Breakdown</h3>
        <CategorySection stats={categoryStats} />
      </div>
    </section>
  );
}
