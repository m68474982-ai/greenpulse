import React from 'react';
import { ShieldAlert, CheckCircle, ExternalLink, X } from 'lucide-react';
import { Alert } from '../types';

interface AlertBannerProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onAcknowledge }) => {
  const criticalAlerts = (alerts || []).filter(a => a && a.is_active && (a.level === 'critical' || a.level === 'high'));

  if (criticalAlerts.length === 0) return null;

  const topAlert = criticalAlerts[0];

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-rose-950/90 border-b border-red-500/60 text-white px-4 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-pulse-slow">
      <div className="flex items-center gap-3 flex-1 min-w-[280px]">
        <div className="p-2 bg-red-600 rounded-lg shrink-0 shadow-md">
          <ShieldAlert className="w-5 h-5 text-white animate-ping-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-500 font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
              {topAlert.level} ALERT
            </span>
            <span className="font-mono text-xs text-red-200">{topAlert.alert_id}</span>
            <span className="text-xs text-slate-300 font-semibold">• {topAlert.location_name}</span>
          </div>
          <p className="text-xs font-medium text-slate-100 mt-0.5 line-clamp-1">
            {topAlert.title} — {topAlert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onAcknowledge(topAlert.alert_id)}
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 text-black font-bold font-mono text-xs px-3 py-1.5 rounded transition shadow-md active:scale-95"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Acknowledge Protocol</span>
        </button>
      </div>
    </div>
  );
};
