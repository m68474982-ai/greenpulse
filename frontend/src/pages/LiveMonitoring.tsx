import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Flame,
  Wind,
  Sprout,
  CloudSun,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  PlusCircle,
  Radio
} from 'lucide-react';
import { SensorCard } from '../components/SensorCard';
import { api } from '../services/api';
import { Sensor } from '../types';
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket';

export const LiveMonitoring: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  const loadSensors = async () => {
    try {
      const data = await api.getSensors();
      setSensors(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSensors();
    const interval = setInterval(loadSensors, 5000);
    return () => clearInterval(interval);
  }, []);

  useWebSocket((msg: WebSocketMessage) => {
    if (msg.event === 'sensor_update') {
      setSensors((prev) =>
        prev.map((s) =>
          s.sensor_id === msg.sensor_id
            ? { ...s, status: msg.status, latest_reading: msg.reading }
            : s
        )
      );
    }
  });

  const categories = [
    { id: 'all', label: 'All Sensors', icon: Radio, count: (sensors || []).length },
    {
      id: 'flood',
      label: 'Flood Monitoring',
      icon: Droplets,
      count: (sensors || []).filter((s) => (s.sensor_types || []).includes('water_level') || (s.sensor_types || []).includes('rainfall')).length
    },
    {
      id: 'fire',
      label: 'Forest Fire',
      icon: Flame,
      count: (sensors || []).filter((s) => (s.sensor_types || []).includes('smoke') || (s.sensor_types || []).includes('temperature')).length
    },
    {
      id: 'pollution',
      label: 'Air Pollution (AQI)',
      icon: Wind,
      count: (sensors || []).filter((s) => (s.sensor_types || []).includes('pm25') || (s.sensor_types || []).includes('co')).length
    },
    {
      id: 'agri',
      label: 'Land & Agriculture',
      icon: Sprout,
      count: (sensors || []).filter((s) => (s.sensor_types || []).includes('soil_moisture')).length
    },
    {
      id: 'weather',
      label: 'Weather & Wind',
      icon: CloudSun,
      count: (sensors || []).filter((s) => (s.sensor_types || []).includes('weather') || (s.sensor_types || []).includes('wind_speed')).length
    }
  ];

  const filteredSensors = (sensors || []).filter((sensor) => {
    const types = sensor.sensor_types || [];
    // Category filter
    let matchesCategory = true;
    if (activeCategory === 'flood') {
      matchesCategory = types.includes('water_level') || types.includes('rainfall');
    } else if (activeCategory === 'fire') {
      matchesCategory = types.includes('smoke') || types.includes('flame_detected');
    } else if (activeCategory === 'pollution') {
      matchesCategory = types.includes('pm25') || types.includes('no2');
    } else if (activeCategory === 'agri') {
      matchesCategory = types.includes('soil_moisture');
    } else if (activeCategory === 'weather') {
      matchesCategory = types.includes('weather') || types.includes('wind_speed');
    }

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = sensor.status === statusFilter;
    }

    // Search query
    const matchesSearch =
      (sensor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sensor.location_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sensor.sensor_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sensor.state || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            LIVE ENVIRONMENT MONITORING
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Distributed environmental sensor telemetry categorized by ecological hazard vector
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search node, state, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="normal">Normal</option>
            <option value="warning">Warning</option>
            <option value="high_risk">High Risk</option>
            <option value="critical">Critical</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition shrink-0 ${
                isActive
                  ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-950/40'
                  : 'bg-[#0F172A] text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-cyan-400'}`} />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSensors.map((sensor) => (
          <SensorCard
            key={sensor.id}
            sensor={sensor}
            onClick={() => setSelectedSensor(sensor)}
          />
        ))}
      </div>

      {filteredSensors.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <p className="text-sm font-mono text-slate-400">
            No sensor nodes found matching filter criteria.
          </p>
        </div>
      )}

      {/* Sensor Inspection Modal Drawer */}
      {selectedSensor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {selectedSensor.sensor_id}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                  {selectedSensor.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedSensor.location_name}, {selectedSensor.state} • Lat: {selectedSensor.latitude}, Lng: {selectedSensor.longitude}
                </p>
              </div>

              <button
                onClick={() => setSelectedSensor(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Telemetry Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              {Object.entries(selectedSensor.latest_reading || {}).map(([key, val]) => {
                if (key === 'timestamp' || val === null || val === undefined) return null;
                return (
                  <div key={key} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {key.replace('_', ' ')}
                    </span>
                    <p className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                      {typeof val === 'boolean' ? (val ? 'ACTIVE' : 'NONE') : val}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Metadata */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Firmware:</span>
                <span className="text-slate-200">{selectedSensor.firmware_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Battery Health:</span>
                <span className="text-emerald-400">{selectedSensor.battery}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Signal Strength:</span>
                <span className="text-cyan-400">{selectedSensor.signal_strength} dBm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Telemetry Packet:</span>
                <span className="text-slate-200">{new Date(selectedSensor.last_seen).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedSensor(null)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold font-mono text-xs rounded-lg transition"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
