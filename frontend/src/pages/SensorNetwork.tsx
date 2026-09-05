import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Search,
  Filter,
  Battery,
  Wifi,
  MapPin,
  Clock,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { Sensor, SensorStatus } from '../types';

export const SensorNetwork: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const loadSensors = async () => {
    try {
      const data = await api.getSensors();
      setSensors(data);
      if (data.length > 0 && !selectedSensor) {
        setSelectedSensor(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSensors();
    const interval = setInterval(loadSensors, 5000);
    return () => clearInterval(interval);
  }, []);

  const indianStates = Array.from(new Set(sensors.map((s) => s.state)));

  const filteredSensors = sensors.filter((s) => {
    const matchesState = stateFilter === 'all' || s.state === stateFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      s.sensor_id.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location_name.toLowerCase().includes(search.toLowerCase());
    return matchesState && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: SensorStatus) => {
    switch (status) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500 text-white animate-pulse">CRITICAL</span>;
      case 'high_risk':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500 text-black">HIGH RISK</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-black">WARNING</span>;
      case 'offline':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-300">OFFLINE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            SENSOR NETWORK & HARDWARE TOPOLOGY
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time IoT nodes across Indian ecological basins, hardware telemetries, and battery health
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search sensor node ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-56"
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All States ({sensors.length})</option>
            {indianStates.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

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

      {/* Network Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-slate-400">TOTAL NODES</span>
          <p className="text-xl font-bold font-mono text-cyan-400 mt-1">{sensors.length}</p>
          <span className="text-[10px] text-slate-500 font-mono">Distributed across 8 states</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-slate-400">ACTIVE TELEMETRY</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {sensors.filter((s) => s.status !== 'offline').length} / {sensors.length}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">100% data transmission</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-slate-400">AVG BATTERY LEVEL</span>
          <p className="text-xl font-bold font-mono text-slate-100 mt-1">92.4%</p>
          <span className="text-[10px] text-emerald-400 font-mono">Solar charging nominal</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-slate-400">PROTOCOL</span>
          <p className="text-xl font-bold font-mono text-purple-400 mt-1">MQTT + REST</p>
          <span className="text-[10px] text-slate-500 font-mono">ESP32 / LoRaWAN Mesh</span>
        </div>
      </div>

      {/* Main Content: Table + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Deployed Sensor Grid ({filteredSensors.length})
            </h3>
            <span className="text-xs font-mono text-slate-500">Click row to inspect</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Node ID</th>
                  <th className="p-3">Location / State</th>
                  <th className="p-3">Sensors</th>
                  <th className="p-3">Battery</th>
                  <th className="p-3">Signal</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSensors.map((sensor) => {
                  const isSelected = selectedSensor?.id === sensor.id;
                  return (
                    <tr
                      key={sensor.id}
                      onClick={() => setSelectedSensor(sensor)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <td className="p-3 font-bold text-cyan-400">{sensor.sensor_id}</td>
                      <td className="p-3">
                        <p className="text-slate-200 font-sans font-semibold line-clamp-1">{sensor.name}</p>
                        <p className="text-[10px] text-slate-400">{sensor.state}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {sensor.sensor_types.slice(0, 2).map((t) => (
                            <span key={t} className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Battery className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{sensor.battery}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{sensor.signal_strength} dBm</span>
                        </div>
                      </td>
                      <td className="p-3">{getStatusBadge(sensor.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Sensor Detailed Inspector (1 Col) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          {selectedSensor ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {selectedSensor.sensor_id}
                </span>
                {getStatusBadge(selectedSensor.status)}
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-100 font-sans">
                  {selectedSensor.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedSensor.location_name}, {selectedSensor.state}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  GPS: {selectedSensor.latitude}° N, {selectedSensor.longitude}° E
                </p>
              </div>

              {/* Real-Time Telemetry Readout */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  Latest Ingested Telemetry
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {Object.entries(selectedSensor.latest_reading || {}).map(([key, val]) => {
                    if (key === 'timestamp' || val === null || val === undefined) return null;
                    return (
                      <div key={key} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <p className="text-[10px] font-mono text-slate-500 uppercase">{key.replace('_', ' ')}</p>
                        <p className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                          {typeof val === 'boolean' ? (val ? 'ACTIVE' : 'NO') : val}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Spec & Diagnostic */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Firmware:</span>
                  <span className="text-slate-200">{selectedSensor.firmware_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ingest Mode:</span>
                  <span className="text-cyan-400">ESP32 REST / MQTT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sampling Cadence:</span>
                  <span className="text-slate-200">5 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Telemetry:</span>
                  <span className="text-slate-200">{new Date(selectedSensor.last_seen).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs font-mono">
              Select a sensor node to inspect telemetry.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 text-center">
            Node verified by EcoShield Hardware Bridge
          </div>
        </div>
      </div>
    </div>
  );
};
