import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import { useHeatmapData } from '../hooks/useHeatmapData';
import 'leaflet/dist/leaflet.css';

const riskColor = {
  critical: '#dc2626', // red-600
  high: '#dc2626',     // red-600  
  medium: '#eab308',   // yellow-500
  low: '#22c55e',      // green-500
};

const riskRadius = {
  critical: 20,
  high: 18,
  medium: 12,
  low: 8,
};

export default function HeatmapMap() {
  const { heatmapPoints, loading, error, locationStats, refreshData } = useHeatmapData();

  // Calculate center based on points or default to Philippines
  const getMapCenter = () => {
    if (heatmapPoints.length === 0) {
      return [12.8797, 121.7740]; // Philippines center
    }
    
    const avgLat = heatmapPoints.reduce((sum, point) => sum + point.lat, 0) / heatmapPoints.length;
    const avgLng = heatmapPoints.reduce((sum, point) => sum + point.lng, 0) / heatmapPoints.length;
    return [avgLat, avgLng];
  };

  const getZoomLevel = () => {
    return heatmapPoints.length > 0 ? 10 : 6;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-slate-100">Risk Location Heatmap</h2>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Location Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-slate-100">{locationStats.total}</div>
          <div className="text-xs text-slate-400">Total Locations</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{locationStats.geocoded}</div>
          <div className="text-xs text-slate-400">Mapped</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-orange-400">{locationStats.failed}</div>
          <div className="text-xs text-slate-400">Failed</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {loading && heatmapPoints.length === 0 ? (
        <div className="w-full h-64 rounded bg-slate-700/50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading map data...</span>
          </div>
        </div>
      ) : heatmapPoints.length === 0 ? (
        <div className="w-full h-64 rounded bg-slate-700/50 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div>No location data available</div>
            <div className="text-xs mt-1">Analysis data must include location_detected field</div>
          </div>
        </div>
      ) : (
        <div className="w-full h-64 rounded overflow-hidden mb-4">
          <MapContainer center={getMapCenter()} zoom={getZoomLevel()} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {heatmapPoints.map((point, idx) => (
              <CircleMarker
                key={`${point.lat}-${point.lng}-${idx}`}
                center={[point.lat, point.lng]}
                radius={riskRadius[point.risk] || riskRadius.low}
                pathOptions={{ 
                  color: riskColor[point.risk] || riskColor.low, 
                  fillColor: riskColor[point.risk] || riskColor.low, 
                  fillOpacity: 0.7,
                  weight: 2
                }}
              >
                <Tooltip>
                  <div className="text-sm">
                    <div className="font-semibold">{point.label}</div>
                    <div className="capitalize">{point.risk} Risk</div>
                    <div className="text-xs text-gray-600">{point.count} incident{point.count !== 1 ? 's' : ''}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="flex gap-4 items-center text-sm">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded mr-1 inline-block" style={{ backgroundColor: riskColor.critical }}></span>
          Critical Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded mr-1 inline-block" style={{ backgroundColor: riskColor.high }}></span>
          High Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded mr-1 inline-block" style={{ backgroundColor: riskColor.medium }}></span>
          Medium Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded mr-1 inline-block" style={{ backgroundColor: riskColor.low }}></span>
          Low Risk
        </span>
      </div>
    </div>
  );
}
