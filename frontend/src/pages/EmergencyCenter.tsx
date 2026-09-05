import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Send,
  PhoneCall,
  MapPin,
  Users,
  Flame,
  Droplets,
  Wind,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Hazard, Alert, EmergencyData } from '../types';

export const EmergencyCenter: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyData | null>(null);
  const [location, setLocation] = useState('Tirupati Region, Swarnamukhi Basin');
  const [hazardType, setHazardType] = useState('flood');
  const [broadcastRadius, setBroadcastRadius] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedLogs, setDispatchedLogs] = useState<string[]>([
    'Automated CAP (Common Alerting Protocol) channel synced with CPCB and NDMA.',
    'Early-warning siren grid armed across 12 sector towers.'
  ]);

  const loadData = async () => {
    try {
      const hData = await api.getHazards();
      setHazards(hData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerEmergency = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.triggerEmergency({
        location,
        hazard_type: hazardType,
        risk_score: 98.0,
        broadcast_radius_km: broadcastRadius,
        action_note: 'Tier-1 Emergency Broadcast Initiated. Mandating immediate civilian evacuation and NDRF mobilization.'
      });
      setActiveEmergency(res.details);
      setDispatchedLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🚨 EMERGENCY BROADCAST: ${res.details.location} (${res.details.hazard_type.toUpperCase()})`,
        `[${new Date().toLocaleTimeString()}] Dispatched SMS blast to ${broadcastRadius}km radius communities`,
        `[${new Date().toLocaleTimeString()}] Mobilized NDRF 10th Battalion & District Collectorate`,
        ...prev
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            National Emergency Dispatch Cockpit
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            EMERGENCY CONTROL & DISASTER MOBILIZATION
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Rapid multi-agency incident orchestration, civilian warning sirens, and evacuation logistics
          </p>
        </div>

        <div className="flex items-center gap-2 bg-red-950/80 border border-red-800/80 px-3 py-1.5 rounded-xl font-mono text-xs text-red-200">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <span>NDMA INTEGRATION: <strong>ACTIVE</strong></span>
        </div>
      </div>

      {/* Emergency Active Status Banner */}
      {activeEmergency && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border-2 border-red-500 rounded-2xl p-6 shadow-2xl shadow-red-950/60 animate-pulse-slow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600 text-white rounded-xl shadow-lg">
                <ShieldAlert className="w-7 h-7 animate-ping-slow" />
              </div>
              <div>
                <span className="bg-red-500 font-mono text-xs font-extrabold px-2 py-0.5 rounded text-white uppercase tracking-wider">
                  EMERGENCY MODE ACTIVATED
                </span>
                <h3 className="text-xl font-bold font-mono text-white mt-1">
                  {activeEmergency.location} • {activeEmergency.hazard_type.replace('_', ' ').toUpperCase()}
                </h3>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-xs text-red-200">Alert ID: {activeEmergency.alert_id}</span>
              <p className="text-2xl font-black text-white">{activeEmergency.risk_score}/100 RISK</p>
            </div>
          </div>

          <p className="text-sm text-red-100 font-sans leading-relaxed pt-2 border-t border-red-800/80">
            {activeEmergency.recommended_action}
          </p>
        </div>
      )}

      {/* Grid: Emergency Dispatch Console + Agency Mobilization Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Dispatch Control Panel */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Send className="w-4 h-4 text-red-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Broadcast Emergency Warning
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                Target Disaster Zone / Monitored River Basin
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="Tirupati Region, Swarnamukhi Basin">Tirupati Region, Swarnamukhi Basin (AP)</option>
                <option value="Vijayawada Prakasam Barrage">Vijayawada Prakasam Barrage (AP)</option>
                <option value="Wayanad Highland Zone">Wayanad Highland Landslide Zone (Kerala)</option>
                <option value="BKC Mithi River Basin">BKC Mithi River Basin (Mumbai)</option>
                <option value="Sahyadri Forest Reserve">Sahyadri Forest Reserve (Maharashtra)</option>
                <option value="Brahmaputra Floodplains">Brahmaputra Floodplains (Assam)</option>
                <option value="Delhi Central AQI Smog Zone">Delhi Central AQI Smog Zone</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                Hazard Severity Vector
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="flood">Flash Flood / Hydrological Inundation</option>
                <option value="forest_fire">Severe Wildfire / Forest Fire</option>
                <option value="air_pollution">Toxic Smog / AQI Severe Stage-IV</option>
                <option value="extreme_heat">Extreme Heatwave (Red Code)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                Evacuation Radius: <span className="text-red-400 font-bold font-mono">{broadcastRadius} km</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={broadcastRadius}
                onChange={(e) => setBroadcastRadius(Number(e.target.value))}
                className="w-full accent-red-500 bg-slate-800"
              />
            </div>

            <button
              onClick={handleTriggerEmergency}
              disabled={isSubmitting}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-sm rounded-xl shadow-lg shadow-red-950 transition flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>{isSubmitting ? 'DISPATCHING...' : 'TRIGGER FULL DISASTER PROTOCOL'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Multi-Agency Mobilization Checklist */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Emergency Response Force Mobilization
            </h3>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {[
              { name: 'National Disaster Response Force (NDRF)', status: 'DEPLOYED', color: 'text-emerald-400', desc: '10th Battalion mobilized with 8 motorized rescue rafts.' },
              { name: 'State Disaster Response Force (SDRF)', status: 'STANDBY', color: 'text-amber-400', desc: 'Quick Response Teams positioned at relief shelters.' },
              { name: 'Fire & Emergency Services', status: 'ACTIVE', color: 'text-emerald-400', desc: 'High-volume de-watering pumps and fire tenders on alert.' },
              { name: 'District Collectorate Control Cell', status: 'ALERTED', color: 'text-emerald-400', desc: 'Public warning broadcasts issued across regional channels.' },
              { name: 'Central Water Commission (CWC)', status: 'SYNCED', color: 'text-cyan-400', desc: 'Downstream dam sluice release coordinated.' }
            ].map((agency, i) => (
              <div key={i} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{agency.name}</span>
                  <span className={`font-bold text-[10px] px-2 py-0.5 rounded bg-slate-800 ${agency.color}`}>
                    {agency.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{agency.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dispatched Logs Audit Feed */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
            Live Emergency Audit Trail & Broadcast Log
          </h3>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
          {dispatchedLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
