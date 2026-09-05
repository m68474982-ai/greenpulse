import React from 'react';
import {
  Droplets,
  Flame,
  Wind,
  Battery,
  Wifi,
  Clock,
  Radio,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Sensor, SensorReading, SensorStatus } from '../types';

interface SensorCardProps {
  sensor: Sensor;
  onClick?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensor, onClick }) => {
  const reading: Partial<SensorReading> = sensor.latest_reading ?? {};

  const statusConfig: Record<SensorStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
    normal: {
      label: 'NORMAL',
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-700/50',
      dot: 'bg-emerald-400'
    },
    warning: {
      label: 'WARNING',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-700/50',
      dot: 'bg-amber-400'
    },
    high_risk: {
      label: 'HIGH RISK',
      bg: 'bg-orange-950/60',
      text: 'text-orange-300',
      border: 'border-orange-700/50',
      dot: 'bg-orange-400'
    },
    critical: {
      label: 'CRITICAL',
      bg: 'bg-red-950/80',
      text: 'text-red-300',
      border: 'border-red-600',
      dot: 'bg-red-400 animate-ping'
    },
    offline: {
      label: 'OFFLINE',
      bg: 'bg-slate-900',
      text: 'text-slate-400',
      border: 'border-slate-700',
      dot: 'bg-slate-500'
    }
  };

  const status = statusConfig[sensor.status] || statusConfig.normal;

  return (
    <div
      onClick={onClick}
      className={`bg-[#0F172A] border ${
        sensor.status === 'critical' ? 'border-red-500/80 shadow-lg shadow-red-950/30 ring-1 ring-red-500/40' : 'border-slate-800 hover:border-cyan-500/40'
      } rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between`}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                {sensor.sensor_id}
              </span>
              {sensor.is_simulated && (
                <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
                  SIM
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-slate-100 line-clamp-1 mt-0.5" title={sensor.name}>
              {sensor.name}
            </h4>
            <p className="text-xs text-slate-400">{sensor.location_name}</p>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[10px] font-bold ${status.bg} ${status.text} ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
            <span>{status.label}</span>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 my-3">
          {reading.water_level != null && (
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  Water Level
                </span>
              </div>
              <p className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                {Number(reading.water_level).toFixed(2)} <span className="text-xs font-normal text-slate-400">m</span>
              </p>
            </div>
          )}

          {reading.rainfall != null && (
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  Rainfall
                </span>
              </div>
              <p className="text-base font-bold font-mono text-blue-300 mt-0.5">
                {Number(reading.rainfall).toFixed(1)} <span className="text-xs font-normal text-slate-400">mm/h</span>
              </p>
            </div>
          )}

          {reading.temperature != null && (
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Temperature
                </span>
              </div>
              <p className="text-base font-bold font-mono text-amber-300 mt-0.5">
                {Number(reading.temperature).toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
              </p>
            </div>
          )}

          {reading.pm25 != null && (
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-purple-400" />
                  PM2.5 AQI
                </span>
              </div>
              <p className="text-base font-bold font-mono text-purple-300 mt-0.5">
                {Number(reading.pm25).toFixed(1)} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </p>
            </div>
          )}

          {reading.smoke != null && (
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Smoke Index
                </span>
              </div>
              <p className="text-base font-bold font-mono text-rose-300 mt-0.5">
                {Number(reading.smoke).toFixed(0)} <span className="text-xs font-normal text-slate-400">ppm</span>
              </p>
            </div>
          )}

          {reading.humidity != null && (
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-emerald-400" />
                  Humidity
                </span>
              </div>
              <p className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                {Number(reading.humidity).toFixed(0)} <span className="text-xs font-normal text-slate-400">%</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Telemetry Meta */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Battery className="w-3 h-3 text-emerald-400" />
            {sensor.battery}%
          </span>
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-cyan-400" />
            {sensor.signal_strength} dBm
          </span>
        </div>

        <span className="flex items-center gap-1 text-slate-500 group-hover:text-cyan-400 transition">
          Inspect Node <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
