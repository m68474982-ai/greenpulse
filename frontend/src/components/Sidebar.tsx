import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  MapPin,
  Cpu,
  BellRing,
  BrainCircuit,
  BarChart3,
  ShieldAlert,
  Settings,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface SidebarProps {
  criticalAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ criticalAlertsCount = 0 }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live', label: 'Live Monitoring', icon: Activity },
    { to: '/map', label: 'Risk Map', icon: MapPin },
    { to: '/sensors', label: 'Sensor Network', icon: Cpu },
    { to: '/alerts', label: 'Alerts', icon: BellRing, badge: criticalAlertsCount },
    { to: '/insights', label: 'AI Insights', icon: BrainCircuit },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/emergency', label: 'Emergency Center', icon: ShieldAlert, highlight: true },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A0F1D] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-950 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B1120] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider text-slate-100 font-mono">
              ECOSHIELD <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
              Early-Warning Network
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Command Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-inner'
                      : item.highlight
                      ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-900/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-rose-400' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>ESP32 IoT Grid</span>
          </div>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-cyan-400 h-full rounded-full w-[96%] animate-pulse"></div>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
          India Disaster Grid v1.0 • SIH 2024
        </p>
      </div>
    </aside>
  );
};
