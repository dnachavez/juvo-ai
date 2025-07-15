import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Example data for the heatmap
const riskPoints = [
  { lat: 10.2914, lng: 123.8989, risk: 'high', label: 'Carbon Market' },
  { lat: 10.3098, lng: 123.8931, risk: 'medium', label: 'Fuente Osmeña Circle' },
  { lat: 10.3304, lng: 123.9074, risk: 'low', label: 'IT Park - Apas' },
];

const riskColor = {
  high: 'red',
  medium: 'yellow',
  low: 'green',
};

export default function HeatmapMap() {
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow mt-6">
      <h2 className="text-lg font-semibold mb-3 text-slate-100">Cebu Trafficking Risk Heatmap</h2>
      <div className="w-full h-64 rounded overflow-hidden mb-4">
        <MapContainer center={[10.3000, 123.8950]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {riskPoints.map((point, idx) => (
            <CircleMarker
              key={idx}
              center={[point.lat, point.lng]}
              radius={15}
              pathOptions={{ color: riskColor[point.risk], fillColor: riskColor[point.risk], fillOpacity: 0.6 }}
            >
              <Tooltip>{point.label} ({point.risk.charAt(0).toUpperCase() + point.risk.slice(1)} Risk)</Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="flex gap-4 items-center text-sm">
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-600 rounded mr-1 inline-block"></span>High Risk</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-400 rounded mr-1 inline-block"></span>Medium</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded mr-1 inline-block"></span>Low</span>
      </div>
    </div>
  );
}
