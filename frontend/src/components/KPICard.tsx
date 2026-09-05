import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan',
  onClick
}) => {
  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      bg: 'bg-cyan-500/5',
      iconBg: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/40',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-950/20'
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      bg: 'bg-rose-500/5',
      iconBg: 'bg-rose-950/80 text-rose-400 border-rose-800/40',
      text: 'text-rose-400',
      glow: 'shadow-rose-950/20'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bg: 'bg-amber-500/5',
      iconBg: 'bg-amber-950/80 text-amber-400 border-amber-800/40',
      text: 'text-amber-400',
      glow: 'shadow-amber-950/20'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'bg-emerald-500/5',
      iconBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-950/20'
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      bg: 'bg-purple-500/5',
      iconBg: 'bg-purple-950/80 text-purple-400 border-purple-800/40',
      text: 'text-purple-400',
      glow: 'shadow-purple-950/20'
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-[#0F172A] border ${colorStyles.border} rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${colorStyles.glow} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-sans">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-2.5 rounded-lg border ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-500">Trend Analysis</span>
          <span className={colorStyles.text}>{trend}</span>
        </div>
      )}
    </div>
  );
};
