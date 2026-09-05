import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { AIInsightsData } from '../types';

export const AIInsights: React.FC = () => {
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadInsights = async () => {
    try {
      const res = await api.getAIInsights();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
    const interval = setInterval(loadInsights, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            AI RISK INTELLIGENCE & EARLY-WARNING ENGINE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Physics-informed heuristics, stochastic anomaly detection, and multi-horizon hazard forecasts
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-800/60 px-3 py-1.5 rounded-lg text-xs font-mono text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>Average AI Engine Confidence: <strong>{data?.overall_ai_confidence || 94.8}%</strong></span>
        </div>
      </div>

      {/* Top AI Intelligence Narrative Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wide">
          Active AI Hazard Intelligence Summaries ({data?.insights.length || 0})
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {data?.insights.map((insight) => {
            const isHigh = insight.risk_score >= 60;
            return (
              <div
                key={insight.id}
                className={`bg-[#0F172A] border ${
                  isHigh ? 'border-purple-500/70 shadow-lg shadow-purple-950/30' : 'border-slate-800'
                } rounded-xl p-5 space-y-4`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {insight.hazard_type.toUpperCase()} MODEL
                    </span>
                    <h4 className="text-base font-bold text-slate-100 font-sans">
                      {insight.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-slate-400">
                      Trend: <strong className={insight.trend === 'increasing' ? 'text-rose-400' : 'text-emerald-400'}>{insight.trend.toUpperCase()}</strong>
                    </span>
                    <span className="text-slate-400">
                      AI Confidence: <strong className="text-cyan-400">{insight.ai_confidence}%</strong>
                    </span>
                    <span className="text-slate-400">
                      Score: <strong className={isHigh ? 'text-red-400' : 'text-emerald-400'}>{insight.risk_score}/100</strong>
                    </span>
                  </div>
                </div>

                {/* Narrative Statement */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                  <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold mb-1">
                    AI Synthesis & Physical Interpretation:
                  </p>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    "{insight.narrative}"
                  </p>
                </div>

                {/* Anomalies & Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Anomalies Detected */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <p className="text-[11px] text-amber-400 font-bold uppercase mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Detected Telemetry Anomalies:
                    </p>
                    <ul className="space-y-1.5 text-slate-300">
                      {(insight.detected_anomalies || []).map((anom, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                          <span>{anom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Early Actions */}
                  <div className="bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-800/40">
                    <p className="text-[11px] text-cyan-300 font-bold uppercase mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Actionable Mitigations:
                    </p>
                    <ul className="space-y-1.5 text-cyan-100 font-sans">
                      {(insight.recommended_actions || []).map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Horizon Predictive Forecast & Feature Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Horizon Predictive Forecast */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Multi-Horizon Predictive Risk Forecast
            </h3>
          </div>

          <div className="space-y-3">
            {data?.predictive_forecast.map((item, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-cyan-400 uppercase">Horizon: {item.horizon}</span>
                  <span className="text-slate-400">
                    Confidence: <strong className="text-slate-200">{item.confidence}%</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.predicted_risk >= 70 ? 'bg-red-500' :
                        item.predicted_risk >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.predicted_risk}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-200 w-12 text-right">
                    {item.predicted_risk}%
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans">
                  {item.expected_conditions}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Feature Weight Attribution */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              AI Risk Engine Feature Importance
            </h3>
          </div>

          <div className="space-y-3">
            {data?.feature_importance.map((f, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{f.feature}</span>
                  <span className="text-purple-400 font-bold">{(f.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${f.weight * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{f.category} Vector</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
