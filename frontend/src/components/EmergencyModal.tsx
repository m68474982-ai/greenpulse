import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Radio, X, CheckCircle, BellRing, PhoneCall } from 'lucide-react';
import { api } from '../services/api';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [location, setLocation] = useState('Tirupati Region, Swarnamukhi Basin');
  const [hazardType, setHazardType] = useState('flood');
  const [radius, setRadius] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatched, setDispatched] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.triggerEmergency({
        location,
        hazard_type: hazardType,
        risk_score: 96.0,
        broadcast_radius_km: radius,
        action_note: 'Tier-1 Disaster Protocol Mobilization. Evacuation corridors opened, NDRF dispatched.'
      });
      setDispatched(res.details);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-red-500/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-red-950/50 relative overflow-hidden">
        {/* Top Warning Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!dispatched ? (
          <form onSubmit={handleBroadcast}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-950 text-red-400 border border-red-800/80 rounded-xl">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-mono">
                  🚨 EMERGENCY DISASTER PROTOCOL
                </h3>
                <p className="text-xs text-slate-400">
                  National Disaster Management Authority (NDMA) Early Broadcast
                </p>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-xs text-red-200 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                Triggering emergency mode will broadcast instant sirens across the command grid, notify field SDRF battalions, and elevate AI risk calculation thresholds.
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono font-medium mb-1">
                  Target Zone / River Basin
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
                  Hazard Classification
                </label>
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono"
                >
                  <option value="flood">Flash Flood / Hydrological Inundation</option>
                  <option value="forest_fire">Severe Forest Wildfire / Thermal Spike</option>
                  <option value="air_pollution">Hazardous Toxic Smog / GRAP-IV</option>
                  <option value="extreme_heat">Extreme Heatwave (Red Code)</option>
                  <option value="cyclone">Coastal Cyclone Surge</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono font-medium mb-1">
                  Evacuation & Siren Radius (km)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 15, 25, 50].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadius(r)}
                      className={`py-1.5 rounded-lg border font-mono font-bold text-center transition ${
                        radius === r
                          ? 'bg-red-600 text-white border-red-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Agencies notified */}
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <p className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                  Automated Dispatch Channels:
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> NDRF Battalion 10
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> District Collectorate
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Fire & Emergency Cell
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Public Sirens (12 Units)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-xs rounded-lg shadow-lg shadow-red-950 transition flex items-center gap-2 disabled:opacity-50"
              >
                <BellRing className="w-4 h-4" />
                {isSubmitting ? 'Broadcasting...' : 'INITIATE BROADCAST'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 border border-red-500/60 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-mono text-red-400">
                EMERGENCY MODE ACTIVATED
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Disaster Broadcast ID: <span className="font-mono text-cyan-400">{dispatched.alert_id}</span>
              </p>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-left text-xs font-mono space-y-1.5 text-slate-300">
              <p><span className="text-slate-500">Zone:</span> {dispatched.location}</p>
              <p><span className="text-slate-500">Radius:</span> {dispatched.broadcast_radius_km} km</p>
              <p><span className="text-slate-500">Risk Score:</span> <span className="text-red-400 font-bold">{dispatched.risk_score}/100</span></p>
              <p><span className="text-slate-500">Action:</span> {dispatched.recommended_action}</p>
            </div>

            <button
              onClick={() => {
                setDispatched(null);
                onClose();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-lg transition"
            >
              Return to Command Center
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
