import React from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function HeatmapSection({ riskPoints, riskColor }) {
  return (
    <section
      id="heatmap"
      className="bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6 lg:p-8 shadow-xl"
    >
      <div className="text-center mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 mb-2 sm:mb-3">
          Geographic Risk Analysis
        </h2>
        <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
          Interactive heatmap showing risk levels across monitored locations
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
        <div className="xl:col-span-3 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 sm:p-6">
            <div className="w-full h-80 sm:h-96 lg:h-[600px] rounded-lg overflow-hidden mb-4 sm:mb-6">
              <MapContainer center={[10.3157, 123.8854]} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {riskPoints.map((point, idx) => (
                  <CircleMarker
                    key={idx}
                    center={[point.lat, point.lng]}
                    radius={Math.max(15, point.count * 8)}
                    pathOptions={{
                      color: riskColor[point.risk],
                      fillColor: riskColor[point.risk],
                      fillOpacity: 0.6,
                      weight: 3,
                    }}
                  >
                    <Tooltip>
                      <div>
                        <div className="font-medium">{point.label}</div>
                        <div className="text-sm">{point.risk.charAt(0).toUpperCase() + point.risk.slice(1)} Risk</div>
                        <div className="text-xs">{point.count} incident{point.count !== 1 ? 's' : ''}</div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 items-center">
              <span className="flex items-center gap-2 sm:gap-3">
                <span className="w-3 sm:w-4 h-3 sm:h-4 bg-red-600 rounded-full"></span>
                <span className="text-slate-300 font-medium text-sm sm:text-base">High Risk</span>
              </span>
              <span className="flex items-center gap-2 sm:gap-3">
                <span className="w-3 sm:w-4 h-3 sm:h-4 bg-yellow-400 rounded-full"></span>
                <span className="text-slate-300 font-medium text-sm sm:text-base">Medium Risk</span>
              </span>
              <span className="flex items-center gap-2 sm:gap-3">
                <span className="w-3 sm:w-4 h-3 sm:h-4 bg-green-500 rounded-full"></span>
                <span className="text-slate-300 font-medium text-sm sm:text-base">Low Risk</span>
              </span>
            </div>
          </div>
        </div>
        <div className="xl:col-span-1 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 sm:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-3 text-center">Risk Summary</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-slate-800 rounded border border-slate-600">
                  <div className="text-lg font-bold text-red-400">{riskPoints.filter(p => p.risk === 'high').length}</div>
                  <div className="text-xs text-slate-400">High Risk</div>
                </div>
                <div className="text-center p-2 bg-slate-800 rounded border border-slate-600">
                  <div className="text-lg font-bold text-yellow-400">{riskPoints.filter(p => p.risk === 'medium').length}</div>
                  <div className="text-xs text-slate-400">Medium Risk</div>
                </div>
                <div className="text-center p-2 bg-slate-800 rounded border border-slate-600">
                  <div className="text-lg font-bold text-green-400">{riskPoints.filter(p => p.risk === 'low').length}</div>
                  <div className="text-xs text-slate-400">Low Risk</div>
                </div>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4 sm:mb-6 text-center">Risk Locations</h3>
            <div className="space-y-3 sm:space-y-4">
              {riskPoints
                .sort((a, b) => {
                  const riskOrder = { high: 3, medium: 2, low: 1 };
                  return riskOrder[b.risk] - riskOrder[a.risk] || b.count - a.count;
                })
                .map((point, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="text-center">
                    <div className="text-slate-100 text-sm sm:text-base font-medium mb-2">{point.label}</div>
                    <div className="mb-2">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          point.risk === "high"
                            ? "bg-red-600/20 text-red-400 border border-red-600/30"
                            : point.risk === "medium"
                            ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                            : "bg-green-600/20 text-green-400 border border-green-600/30"
                        }`}
                      >
                        {point.risk.charAt(0).toUpperCase() + point.risk.slice(1)} Risk
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {point.count} incident{point.count !== 1 ? 's' : ''} detected
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
