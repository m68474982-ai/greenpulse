import React, { useState, useEffect } from 'react';
import {
  BellRing,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Filter,
  Check,
  RotateCcw,
  Search,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Alert, AlertLevel } from '../types';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [search, setSearch] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts(100);
      setAlerts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    setProcessingId(alertId);
    try {
      await api.acknowledgeAlert(alertId, 'Duty Commander');
      loadAlerts();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (alertId: string) => {
    setProcessingId(alertId);
    try {
      await api.resolveAlert(alertId, 'Conditions verified normalized by ground team');
      loadAlerts();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesLevel = levelFilter === 'all' || a.level === levelFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && a.is_active) ||
      (statusFilter === 'resolved' && !a.is_active);
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      (a.location_name && a.location_name.toLowerCase().includes(search.toLowerCase())) ||
      a.alert_id.toLowerCase().includes(search.toLowerCase());

    return matchesLevel && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-rose-400" />
            EARLY-WARNING ALERT MANAGEMENT & DISPATCH
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Automated multi-hazard emergency alerts, authority acknowledgments, and resolution audits
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-48"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="active">Active Alerts</option>
            <option value="resolved">Resolved History</option>
            <option value="all">All Alerts</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 bg-[#0F172A] border border-dashed border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-mono font-bold text-slate-200">
              NO ALERTS FOUND
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              All environmental parameters are operating in normal parameters or matching filters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.level === 'critical';
            const isHigh = alert.level === 'high';
            const isWarning = alert.level === 'warning';

            return (
              <div
                key={alert.id}
                className={`bg-[#0F172A] border ${
                  !alert.is_active
                    ? 'border-slate-800/60 opacity-70'
                    : isCritical
                    ? 'border-red-500/80 shadow-lg shadow-red-950/40 bg-red-950/10'
                    : isHigh
                    ? 'border-orange-500/60'
                    : isWarning
                    ? 'border-amber-500/50'
                    : 'border-blue-500/40'
                } rounded-xl p-5 transition hover:shadow-md`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Alert Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase ${
                        isCritical ? 'bg-red-500 text-white animate-pulse' :
                        isHigh ? 'bg-orange-500 text-black' :
                        isWarning ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
                      }`}>
                        {alert.level}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {alert.alert_id}
                      </span>
                      {alert.location_name && (
                        <span className="font-mono text-xs text-cyan-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {alert.location_name}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-mono">
                        • {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 font-sans">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {alert.message}
                    </p>

                    {/* AI & Scope Metrics */}
                    <div className="flex items-center gap-4 flex-wrap text-xs font-mono pt-1 text-slate-400">
                      {alert.risk_score !== null && (
                        <span>
                          Risk Score: <strong className={isCritical ? 'text-red-400' : 'text-amber-400'}>{alert.risk_score}/100</strong>
                        </span>
                      )}
                      {alert.ai_confidence !== null && (
                        <span>
                          AI Confidence: <strong className="text-cyan-400">{alert.ai_confidence}%</strong>
                        </span>
                      )}
                      {alert.affected_area && (
                        <span>
                          Area: <strong className="text-slate-300">{alert.affected_area}</strong>
                        </span>
                      )}
                    </div>

                    {/* Action Guideline */}
                    {alert.recommended_action && (
                      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs flex items-start gap-2 mt-2">
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-cyan-200 font-sans">
                          <strong className="font-mono uppercase text-cyan-300">Action Protocol: </strong>
                          {alert.recommended_action}
                        </p>
                      </div>
                    )}

                    {/* Audit trail */}
                    {alert.acknowledged_at && (
                      <p className="text-[11px] font-mono text-emerald-400 pt-1">
                        ✓ Acknowledged by <strong>{alert.acknowledged_by || 'Officer'}</strong> at {new Date(alert.acknowledged_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex lg:flex-col items-center gap-2 shrink-0">
                    {alert.is_active ? (
                      <>
                        {!alert.acknowledged_at && (
                          <button
                            onClick={() => handleAcknowledge(alert.alert_id)}
                            disabled={processingId === alert.alert_id}
                            className="w-full px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs rounded-lg transition shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleResolve(alert.alert_id)}
                          disabled={processingId === alert.alert_id}
                          className="w-full px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs rounded-lg transition shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve Incident</span>
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 bg-slate-800 text-slate-400 font-mono text-xs rounded-lg border border-slate-700">
                        RESOLVED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
