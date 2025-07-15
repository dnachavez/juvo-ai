import React from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const HeatmapSection = React.memo(function HeatmapSection({ riskPoints, riskColor, loading, error, locationStats }) {
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
        {locationStats && (
          <div className="text-xs text-slate-500 mt-2">
            Locations: {locationStats.geocoded} geocoded, {locationStats.failed} failed, {locationStats.total} total
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8" style={{ minHeight: '600px' }}>
        <div className="xl:col-span-3 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700 p-4 sm:p-6">
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 sm:p-6 h-full flex flex-col">
            <div className="w-full h-80 sm:h-96 lg:h-[500px] xl:h-[550px] rounded-lg overflow-hidden mb-4 sm:mb-6 flex-1">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-slate-800 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading location data...</p>
                  </div>
                </div>
              ) : (
                <MapContainer center={[10.3157, 123.8854]} zoom={12} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                  {error && (
                    <div className="absolute top-4 left-4 bg-red-900/80 text-red-200 px-3 py-2 rounded-lg text-sm z-[1000]">
                      Error: {error}
                    </div>
                  )}
                  {!error && (!riskPoints || riskPoints.length === 0) && (
                    <div className="absolute top-4 left-4 bg-slate-900/80 text-slate-300 px-3 py-2 rounded-lg text-sm z-[1000]">
                      No risk locations available
                    </div>
                  )}
                  {riskPoints && riskPoints.map((point, idx) => (
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
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 items-center flex-shrink-0">
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
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-6 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-100 mb-3 text-center">Risk Summary</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-slate-800 rounded border border-slate-600">
                  <div className="text-lg font-bold text-red-400">
                    {loading ? "..." : (riskPoints ? riskPoints.filter(p => p.risk === 'high').length : 0)}
                  </div>
                  <div className="text-xs text-slate-400">High Risk</div>
                </div>
                <div className="text-center p-2 bg-slate-800 rounded border border-slate-600">
                  <div className="text-lg font-bold text-yellow-400">
                    {loading ? "..." : (riskPoints ? riskPoints.filter(p => p.risk === 'medium').length : 0)}
                  </div>
                  <div className="text-xs text-slate-400">Medium Risk</div>
                </div>
                <div className="text-center p-2 bg-slate-800 rounded border border-slate-600">
                  <div className="text-lg font-bold text-green-400">
                    {loading ? "..." : (riskPoints ? riskPoints.filter(p => p.risk === 'low').length : 0)}
                  </div>
                  <div className="text-xs text-slate-400">Low Risk</div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4 sm:mb-6 text-center flex-shrink-0">Risk Locations</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 sm:space-y-4" style={{ maxHeight: '450px' }}>
                {loading ? (
                  <div className="text-center text-slate-400 py-8">
                    <div className="animate-pulse">Loading locations...</div>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-400 py-8">
                    <div>Failed to load locations</div>
                  </div>
                ) : !riskPoints || riskPoints.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <div>No risk locations found</div>
                    <div className="text-xs mt-2">Check if analyzed data contains location information</div>
                  </div>
                ) : (
                  riskPoints
                    .sort((a, b) => {
                      const riskOrder = { high: 3, medium: 2, low: 1 };
                      return riskOrder[b.risk] - riskOrder[a.risk] || b.count - a.count;
                    })
                    .map((point, idx) => (
                    <div key={idx} className="p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-600 flex-shrink-0">
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HeatmapSection;
