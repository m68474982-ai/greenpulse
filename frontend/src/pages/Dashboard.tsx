import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Radio,
  ShieldAlert,
  BrainCircuit,
  Activity,
  Cpu,
  MapPin,
  TrendingUp,
  Droplets,
  Flame,
  Wind,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { SensorCard } from '../components/SensorCard';
import { api } from '../services/api';
import { Sensor, Hazard, Alert, SystemStatus } from '../types';
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sData, hData, aData, sysStatus] = await Promise.all([
        api.getSensors(),
        api.getHazards(),
        api.getAlerts(10),
        api.getSystemStatus()
      ]);
      setSensors(sData);
      setHazards(hData);
      setAlerts(aData);
      setStatus(sysStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  useWebSocket((msg: WebSocketMessage) => {
    if (msg.event === 'sensor_update') {
      // Live patch sensor in state
      setSensors((prev) =>
        prev.map((s) =>
          s.sensor_id === msg.sensor_id
            ? { ...s, status: msg.status, latest_reading: msg.reading }
            : s
        )
      );
    } else if (msg.event === 'new_alert' || msg.event === 'scenario_triggered') {
      loadData();
    }
  });

  const highRiskHazards = hazards.filter(h => h.risk_score >= 60);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Live Multi-Hazard Command Grid
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
            ECOSHIELD <span className="text-cyan-400">AI</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">
            ENVIRONMENTAL INTELLIGENCE COMMAND CENTER • INDIA
          </p>
        </div>

        {/* Demo Fast-Action Bar */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
          <span className="text-slate-400 text-[11px] font-mono px-2">Quick Navigate:</span>
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Risk Map</span>
          </button>
          <button
            onClick={() => navigate('/insights')}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          title="ACTIVE HAZARDS"
          value={String(hazards.length).padStart(2, '0')}
          subtitle={`${highRiskHazards.length} High / Critical`}
          icon={AlertTriangle}
          color={hazards.length > 0 ? 'rose' : 'emerald'}
          trend={hazards.length > 0 ? '+1 active zone' : 'Normal stable'}
          onClick={() => navigate('/alerts')}
        />

        <KPICard
          title="CONNECTED SENSORS"
          value={status ? `${status.connected_sensors}/${status.total_sensors}` : '15/15'}
          subtitle="ESP32 IoT telemetry online"
          icon={Cpu}
          color="cyan"
          trend="100% online telemetry"
          onClick={() => navigate('/sensors')}
        />

        <KPICard
          title="HIGH-RISK ZONES"
          value={String(highRiskHazards.length).padStart(2, '0')}
          subtitle="Immediate dispatch watch"
          icon={ShieldAlert}
          color={highRiskHazards.length > 0 ? 'amber' : 'emerald'}
          trend="Real-time geo-radius"
          onClick={() => navigate('/map')}
        />

        <KPICard
          title="ALERTS TODAY"
          value={status ? String(status.alerts_today).padStart(2, '0') : '00'}
          subtitle="Early-warning dispatches"
          icon={Radio}
          color="purple"
          trend="Automated NDMA protocol"
          onClick={() => navigate('/alerts')}
        />

        <KPICard
          title="AI CONFIDENCE"
          value={`${status ? status.ai_confidence_average : 94.6}%`}
          subtitle="Multi-sensor weighted score"
          icon={BrainCircuit}
          color="emerald"
          trend="Physics + anomaly engine"
          onClick={() => navigate('/insights')}
        />
      </div>

      {/* Main Grid: Live Hazards Feed + Real-Time Active Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Hazard Intelligence & Incident Detection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Hazards Panel */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-950/80 text-rose-400 border border-rose-800/60 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Live Environmental Hazards & Risk Detection
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time AI/ML physics heuristics & hydrological thresholds
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/map')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                View on Map <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {hazards.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <h4 className="font-mono text-sm font-bold text-slate-200">
                  ALL MONITORED REGIONS WITHIN BENIGN THRESHOLDS
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  No active flood, wildfire, or toxic smog spikes detected. Click "Flood" or "Wildfire" in the top bar to simulate an emergency.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(hazards || []).map((h) => {
                  const isCritical = (h.risk_score || 0) >= 80;
                  return (
                    <div
                      key={h.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCritical
                          ? 'bg-red-950/40 border-red-500/70 shadow-lg shadow-red-950/30'
                          : 'bg-slate-900/80 border-amber-500/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase ${
                            isCritical ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-black'
                          }`}>
                            {h.risk_level || 'ELEVATED'} RISK
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-100">
                            {h.location_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="text-slate-400">
                            AI Confidence: <strong className="text-cyan-400">{h.ai_confidence || 94.6}%</strong>
                          </span>
                          <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                            Score: {h.risk_score || 0}/100
                          </span>
                        </div>
                      </div>

                      {/* Detection Reasons */}
                      <ul className="text-xs text-slate-300 space-y-1 my-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                        {(h.detection_reasons || []).map((r, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Recommended Action */}
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-start gap-2 text-xs">
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-cyan-200">
                          <strong className="font-mono uppercase text-cyan-300">Action Protocol: </strong>
                          {h.recommended_action || 'Continue baseline telemetry sampling.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-Time Sensor Grid Preview */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Live Telemetry Feeds (India Network)
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-frequency IoT sensor packets with live physics fluctuations
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/live')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                View All Sensors ({sensors.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sensors.slice(0, 4).map((sensor) => (
                <SensorCard
                  key={sensor.id}
                  sensor={sensor}
                  onClick={() => navigate(`/sensors`)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Alerts Stream & AI Diagnostic Summary */}
        <div className="space-y-6">
          {/* Live Alerts Feed */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Recent Dispatches
                </h3>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
              >
                All Alerts
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono text-center py-6">
                  No active alerts recorded.
                </p>
              ) : (
                alerts.slice(0, 6).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                        alert.level === 'critical' ? 'bg-red-500 text-white' :
                        alert.level === 'high' ? 'bg-orange-500 text-black' :
                        alert.level === 'warning' ? 'bg-amber-500 text-black' :
                        'bg-blue-500 text-white'
                      }`}>
                        {alert.level}
                      </span>
                      <span className="text-slate-500">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-200 line-clamp-1 font-sans">
                      {alert.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                    {alert.location_name && (
                      <p className="text-[10px] font-mono text-cyan-400/80 mt-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {alert.location_name}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Architecture Pipeline Banner */}
            <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/60 p-3 rounded-lg text-center">
              <p className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
                EcoShield Operational Pipeline
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                SENSE → CONNECT → ANALYZE → PREDICT → LOCALIZE → ALERT → ACT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
