import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  Droplets,
  Flame,
  Wind,
  CloudRain,
  Activity,
  Calendar,
  Layers,
  PieChart as PieIcon
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';

export const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalytics(timeframe);
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const COLORS = ['#06B6D4', '#EF4444', '#A855F7', '#F59E0B', '#10B981'];

  return (
    <div className="space-y-6">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            ENVIRONMENTAL TELEMETRY & RISK ANALYTICS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Temporal telemetry trendlines, threshold breach frequencies, and network health matrix
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {[
            { id: '1h', label: 'Last 1 Hour' },
            { id: '24h', label: 'Last 24 Hours' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                timeframe === tf.id
                  ? 'bg-cyan-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Water Level vs Time & Temperature vs Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Water Level & Flood Crest */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
                Water Level vs Time (Hydrological Basins)
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-400">Unit: Meters (m)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.water_level_trend || []}>
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748B" domain={[0, 6]} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#waterGrad)" name="Water Level (m)" />
                <Line type="monotone" dataKey="threshold" stroke="#F59E0B" strokeDasharray="4 4" name="Warning (3.5m)" />
                <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeDasharray="4 4" name="Critical (4.5m)" />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature & Humidity */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
                Thermal & Humidity Dynamics (Fire Risk Vector)
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400">°C / % RH</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary?.temperature_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} name="Temperature (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#10B981" strokeWidth={2} name="Humidity (%)" />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Air Quality (PM2.5 vs time) & Rainfall vs time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PM2.5 vs Time */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-purple-400" />
              <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
                Respirable Particulate Loading (PM2.5 / PM10)
              </h3>
            </div>
            <span className="text-xs font-mono text-purple-400">µg/m³</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.pm25_trend || []}>
                <defs>
                  <linearGradient id="pmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#pmGrad)" name="PM2.5 (µg/m³)" />
                <Line type="monotone" dataKey="standard" stroke="#10B981" strokeDasharray="4 4" name="CPCB Limit (60)" />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rainfall & Cumulative Volume */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
                Precipitation & Rain Gauge Dynamics
              </h3>
            </div>
            <span className="text-xs font-mono text-blue-400">mm / hr</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.rainfall_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Rainfall Rate (mm/h)" />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Hazard Frequency Breakdown & Alert Severity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hazard Frequency */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Hazard Class Distribution
            </h3>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.hazard_frequency || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="hazard_type"
                >
                  {(summary?.hazard_frequency || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-300">
            {(summary?.hazard_frequency || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span>{item.hazard_type}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts by Severity */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Alerts by Severity Level
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(summary?.alerts_by_severity || {}).map(([level, count]) => {
              const color =
                level === 'CRITICAL' ? 'bg-red-500 text-red-400' :
                level === 'HIGH' ? 'bg-orange-500 text-orange-400' :
                level === 'WARNING' ? 'bg-amber-500 text-amber-400' :
                'bg-blue-500 text-blue-400';

              return (
                <div key={level} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">{level}</span>
                    <span className="font-bold text-slate-100">{count} events</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`${color.split(' ')[0]} h-full rounded-full`} style={{ width: `${Math.min(100, count * 15)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Distribution Profile */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Sensor Risk Tier Distribution
            </h3>
          </div>

          <div className="space-y-3 pt-2 font-mono text-xs">
            {Object.entries(summary?.risk_distribution || {}).map(([tier, count]) => (
              <div key={tier} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">{tier}</span>
                <span className="font-bold text-cyan-400">{count} Nodes</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
