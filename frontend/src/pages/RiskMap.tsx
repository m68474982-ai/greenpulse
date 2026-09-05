import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  AlertTriangle,
  Radio,
  Droplets,
  Flame,
  Wind,
  ShieldAlert,
  Sparkles,
  Info,
  Building,
  Anchor,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { Sensor, Hazard } from '../types';

// Custom Map Marker Icons using Leaflet divIcon for pure styling
const createHazardIcon = (color: string, label: string, isPulsing: boolean = false) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${isPulsing ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="background: #0B1120; border: 2px solid ${color}; color: ${color}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color}80; font-family: monospace; font-size: 11px; font-weight: bold;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const iconFlood = createHazardIcon('#06B6D4', '🌊', true);
const iconFire = createHazardIcon('#EF4444', '🔥', true);
const iconPollution = createHazardIcon('#A855F7', '💨', true);
const iconHeat = createHazardIcon('#F97316', '☀️', true);
const iconNormal = createHazardIcon('#10B981', '🟢');
const iconWarning = createHazardIcon('#F59E0B', '⚠️');
const iconInfra = createHazardIcon('#38BDF8', '🏛️');
const iconEmergency = createHazardIcon('#EC4899', '🚑');

// Critical India Infrastructure & Emergency Bases
const CRITICAL_INFRASTRUCTURE = [
  { name: 'Prakasam Barrage & Sluice Gates', lat: 16.5062, lng: 80.6480, type: 'Dam / Flood Gate', state: 'AP' },
  { name: 'Swarnamukhi River Dam & Reservoir', lat: 13.6288, lng: 79.4192, type: 'Hydrological Reservoir', state: 'AP' },
  { name: 'Western Ghats Bio-Corridor HQ', lat: 18.5204, lng: 73.8567, type: 'Forest Reserve Hub', state: 'MH' },
  { name: 'Brahmaputra Flood Protection Embankment', lat: 26.1445, lng: 91.7362, type: 'Riverine Dike', state: 'AS' },
  { name: 'NDRF 10th Battalion HQ', lat: 16.5150, lng: 80.6200, type: 'NDRF Disaster Base', state: 'AP' },
  { name: 'NDRF 8th Battalion HQ', lat: 28.6300, lng: 77.2200, type: 'National NDRF HQ', state: 'DL' }
];

export const RiskMap: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      const [sData, hData] = await Promise.all([api.getSensors(), api.getHazards()]);
      setSensors(sData);
      setHazards(hData);
      if (hData.length > 0 && !selectedHazard) {
        setSelectedHazard(hData[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const getMarkerIcon = (sensor: Sensor) => {
    if (sensor.status === 'critical') return iconFire;
    if (sensor.status === 'high_risk') return iconWarning;
    if (sensor.status === 'warning') return iconWarning;
    return iconNormal;
  };

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'flood': return iconFlood;
      case 'forest_fire': return iconFire;
      case 'air_pollution': return iconPollution;
      case 'extreme_heat': return iconHeat;
      default: return iconWarning;
    }
  };

  const getHazardColor = (type: string) => {
    switch (type) {
      case 'flood': return '#06B6D4';
      case 'forest_fire': return '#EF4444';
      case 'air_pollution': return '#A855F7';
      case 'extreme_heat': return '#F97316';
      default: return '#F59E0B';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            INTERACTIVE ENVIRONMENTAL RISK MAP (INDIA GRID)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Geospatial hazard localization, risk radius zones, and sensor node topology
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <span className="flex items-center gap-1 bg-cyan-950/80 text-cyan-300 px-2 py-1 rounded border border-cyan-800/50">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Flood
          </span>
          <span className="flex items-center gap-1 bg-rose-950/80 text-rose-300 px-2 py-1 rounded border border-rose-800/50">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Forest Fire
          </span>
          <span className="flex items-center gap-1 bg-purple-950/80 text-purple-300 px-2 py-1 rounded border border-purple-800/50">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Air Pollution
          </span>
          <span className="flex items-center gap-1 bg-orange-950/80 text-orange-300 px-2 py-1 rounded border border-orange-800/50">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span> Extreme Heat
          </span>
          <span className="flex items-center gap-1 bg-emerald-950/80 text-emerald-300 px-2 py-1 rounded border border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Normal Sensor
          </span>
        </div>
      </div>

      {/* Main Map Container + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[680px]">
        {/* Map Column (2 spans) */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
          <MapContainer
            center={[20.5937, 78.9629]} // Center of India
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            {/* Dark cartographic tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & CartoDB'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Render Hazard Circles (Affected Area Radius) */}
            {hazards.map((h) => {
              const color = getHazardColor(h.hazard_type);
              return (
                <Circle
                  key={`hazard-circle-${h.id}`}
                  center={[h.latitude, h.longitude]}
                  radius={h.affected_radius_km * 1000}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.25,
                    weight: 2,
                    dashArray: '4, 6'
                  }}
                />
              );
            })}

            {/* Render Active Hazards Markers */}
            {hazards.map((h) => (
              <Marker
                key={`hazard-marker-${h.id}`}
                position={[h.latitude, h.longitude]}
                icon={getHazardIcon(h.hazard_type)}
                eventHandlers={{
                  click: () => setSelectedHazard(h)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="bg-[#0B1120] text-slate-100 p-2 rounded text-xs font-mono">
                    <p className="text-red-400 font-bold uppercase">{h.hazard_type.replace('_', ' ')}</p>
                    <p className="text-slate-200">{h.location_name}</p>
                    <p className="text-cyan-300">Score: {h.risk_score}/100 • AI: {h.ai_confidence}%</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render Sensor Node Markers */}
            {sensors.map((sensor) => (
              <Marker
                key={`sensor-marker-${sensor.id}`}
                position={[sensor.latitude, sensor.longitude]}
                icon={getMarkerIcon(sensor)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="bg-[#0B1120] text-slate-100 p-2 rounded text-xs font-mono">
                    <p className="text-cyan-400 font-bold">{sensor.sensor_id}</p>
                    <p className="text-slate-200">{sensor.name}</p>
                    <p className="text-slate-400">{sensor.location_name}</p>
                    <p className="text-emerald-400 mt-1">Status: {sensor.status.toUpperCase()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render Critical Infrastructure & Emergency Bases */}
            {CRITICAL_INFRASTRUCTURE.map((infra, idx) => (
              <Marker
                key={`infra-${idx}`}
                position={[infra.lat, infra.lng]}
                icon={infra.type.includes('NDRF') ? iconEmergency : iconInfra}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="bg-[#0B1120] text-slate-100 p-2 rounded text-xs font-mono">
                    <p className="text-sky-400 font-bold">{infra.name}</p>
                    <p className="text-slate-300">{infra.type} • {infra.state}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Hazard & Sensor Details Inspector (1 span) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between overflow-y-auto">
          {selectedHazard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold uppercase ${
                  selectedHazard.risk_score >= 80 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-black'
                }`}>
                  {selectedHazard.risk_level} HAZARD
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {new Date(selectedHazard.updated_at).toLocaleTimeString()}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold font-mono text-slate-100">
                  {selectedHazard.hazard_type.replace('_', ' ').toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedHazard.location_name}
                </p>
              </div>

              {/* AI & Risk Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Composite Risk</span>
                  <p className={`text-xl font-bold ${selectedHazard.risk_score >= 80 ? 'text-red-400' : 'text-amber-400'}`}>
                    {selectedHazard.risk_score}/100
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">AI Confidence</span>
                  <p className="text-xl font-bold text-cyan-400">
                    {selectedHazard.ai_confidence}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Affected Radius</span>
                  <p className="text-sm font-bold text-slate-300">
                    {selectedHazard.affected_radius_km} km
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Sensor Source</span>
                  <p className="text-sm font-bold text-slate-300">
                    {selectedHazard.sensor_id || 'Regional Grid'}
                  </p>
                </div>
              </div>

              {/* Detection Reasons */}
              <div>
                <h5 className="text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  AI Physics / Detection Triggers:
                </h5>
                <ul className="text-xs text-slate-300 space-y-1.5 font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  {(selectedHazard.detection_reasons || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Action Protocol */}
              <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold uppercase">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Recommended Action:
                </div>
                <p className="text-cyan-100 font-sans leading-relaxed">
                  {selectedHazard.recommended_action}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 font-mono text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              Click any hazard or sensor marker on the India map to inspect telemetry and AI diagnostics.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Projection: WGS84 / EPSG:4326</span>
            <span className="text-emerald-400">Map Live Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
