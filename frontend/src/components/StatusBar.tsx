import React, { useState } from 'react';
import {
  Activity,
  Radio,
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { SystemStatus } from '../types';
import { api } from '../services/api';

interface StatusBarProps {
  status: SystemStatus | null;
  isConnected: boolean;
  onEmergencyClick: () => void;
  onRefreshData?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  isConnected,
  onEmergencyClick,
  onRefreshData
}) => {
  const [simulating, setSimulating] = useState<string | null>(null);

  const handleScenario = async (scenario: 'flood' | 'forest_fire' | 'air_pollution' | 'normal') => {
    setSimulating(scenario);
    try {
      await api.triggerSimulation(scenario, 1.0);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSimulating(null), 1000);
    }
  };

  return (
    <header className="bg-[#0B1120] border-b border-slate-800 text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-lg">
      {/* Left: System Status & Live Indicators */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="font-mono font-bold tracking-wider text-slate-200">
            SYSTEM: {isConnected ? 'ONLINE' : 'CONNECTING'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nodes:</span>
            <span className="font-mono text-cyan-300 font-bold">
              {status ? `${status.connected_sensors}/${status.total_sensors}` : '15/15'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Incidents:</span>
            <span className="font-mono text-amber-300 font-bold">
              {status ? status.active_incidents : '0'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Critical:</span>
            <span className="font-mono text-rose-300 font-bold">
              {status ? status.critical_alerts : '0'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Health:</span>
            <span className="font-mono text-emerald-300 font-bold">
              {status ? `${status.network_health_percentage}%` : '100%'}
            </span>
          </div>
        </div>

        {/* Demo Mode Badge */}
        <div className="flex items-center gap-1.5 bg-cyan-950/60 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-800/60 font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          DEMO / SIMULATED DATA
        </div>
      </div>

      {/* Right: Quick Simulation Scenarios & Emergency Action */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-500 text-[11px] hidden xl:inline font-mono">SIMULATION SCENARIOS:</span>

        {/* Scenario: Flood */}
        <button
          onClick={() => handleScenario('flood')}
          disabled={simulating !== null}
          className="flex items-center gap-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 hover:text-cyan-100 px-2.5 py-1 rounded border border-cyan-700/60 transition font-mono active:scale-95 disabled:opacity-50"
          title="Simulate severe flood event (Tirupati Region)"
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span>Flood</span>
        </button>

        {/* Scenario: Fire */}
        <button
          onClick={() => handleScenario('forest_fire')}
          disabled={simulating !== null}
          className="flex items-center gap-1 bg-rose-950 hover:bg-rose-900 text-rose-200 hover:text-rose-100 px-2.5 py-1 rounded border border-rose-700/60 transition font-mono active:scale-95 disabled:opacity-50"
          title="Simulate forest wildfire event (Western Ghats)"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Wildfire</span>
        </button>

        {/* Scenario: AQI */}
        <button
          onClick={() => handleScenario('air_pollution')}
          disabled={simulating !== null}
          className="flex items-center gap-1 bg-purple-950 hover:bg-purple-900 text-purple-200 hover:text-purple-100 px-2.5 py-1 rounded border border-purple-700/60 transition font-mono active:scale-95 disabled:opacity-50"
          title="Simulate hazardous air pollution spike (Delhi NCR)"
        >
          <Wind className="w-3.5 h-3.5 text-purple-400" />
          <span>Smog/AQI</span>
        </button>

        {/* Restore Normal */}
        <button
          onClick={() => handleScenario('normal')}
          disabled={simulating !== null}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-600 transition font-mono active:scale-95 disabled:opacity-50"
          title="Restore sensors to normal baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Normal</span>
        </button>

        {/* Big Emergency Alert Action */}
        <button
          onClick={onEmergencyClick}
          className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold px-3.5 py-1 rounded-md shadow-lg shadow-red-950 border border-red-400/30 transition transform hover:scale-105 active:scale-95 font-mono tracking-wide animate-pulse-slow"
        >
          <ShieldAlert className="w-4 h-4 text-white" />
          <span>🚨 EMERGENCY ALERT</span>
        </button>
      </div>
    </header>
  );
};
