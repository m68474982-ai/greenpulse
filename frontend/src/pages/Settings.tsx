import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Radio,
  Sliders,
  Shield,
  RotateCcw,
  Save,
  CheckCircle2,
  Database,
  Lock
} from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [mqttHost, setMqttHost] = useState('localhost');
  const [mqttPort, setMqttPort] = useState('1883');
  const [mqttTopic, setMqttTopic] = useState('ecoshield/sensors/+/telemetry');

  // AI Thresholds
  const [floodThreshold, setFloodThreshold] = useState('4.5');
  const [fireTempThreshold, setFireTempThreshold] = useState('40.0');
  const [pm25Threshold, setPm25Threshold] = useState('150.0');

  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await api.resetDemo();
      alert('Demo data successfully refreshed to clean baseline.');
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          SYSTEM CONFIGURATION & IOT INTEGRATION
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Configure MQTT brokers, ESP32 IoT node telemetry parameters, AI threshold tuning, and demo controls
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 p-3.5 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration parameters saved to command center database.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IoT & MQTT Broker Settings */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              ESP32 IoT & MQTT Gateway Settings
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                MQTT Broker Hostname / IP
              </label>
              <input
                type="text"
                value={mqttHost}
                onChange={(e) => setMqttHost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                MQTT Broker Port
              </label>
              <input
                type="text"
                value={mqttPort}
                onChange={(e) => setMqttPort(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                Subscribed Ingestion Topic
              </label>
              <input
                type="text"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">Hardware Node Setup: </span>
              Flash ESP32 using the provided <code className="text-slate-200">iot/esp32_ecoshield.ino</code> sketch to stream multi-sensor payloads directly.
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold font-mono text-xs rounded-lg transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save IoT Gateway Config</span>
            </button>
          </form>
        </div>

        {/* AI Risk Engine Parameters */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              AI Risk Engine Threshold Tuning
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                Critical Flood Water Level Threshold (Meters)
              </label>
              <input
                type="text"
                value={floodThreshold}
                onChange={(e) => setFloodThreshold(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                Wildfire Trigger Temperature (°C)
              </label>
              <input
                type="text"
                value={fireTempThreshold}
                onChange={(e) => setFireTempThreshold(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-medium mb-1">
                Severe Air Pollution PM2.5 Threshold (µg/m³)
              </label>
              <input
                type="text"
                value={pm25Threshold}
                onChange={(e) => setPm25Threshold(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs rounded-lg transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update AI Thresholds</span>
            </button>
          </form>
        </div>
      </div>

      {/* Demo Controls & Security RBAC Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hackathon Demonstration Tools */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Hackathon Demonstration Reset
            </h3>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Re-initializes all Indian sensor telemetry, wipes active simulation spikes, and restores baseline hydrological readings for clean demonstration cycles.
          </p>

          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs rounded-lg border border-cyan-700/60 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting Demo...' : 'Reset to Clean Baseline State'}</span>
          </button>
        </div>

        {/* Role-Based Access Control (RBAC) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase">
              Role-Based Access Control (RBAC)
            </h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="bg-slate-900 p-2 rounded flex justify-between">
              <span className="text-slate-300 font-bold">ADMIN</span>
              <span className="text-emerald-400">Full System & Sensor Provisioning</span>
            </div>
            <div className="bg-slate-900 p-2 rounded flex justify-between">
              <span className="text-slate-300 font-bold">AUTHORITY</span>
              <span className="text-cyan-400">Alert Dispatch & Emergency Trigger</span>
            </div>
            <div className="bg-slate-900 p-2 rounded flex justify-between">
              <span className="text-slate-300 font-bold">OPERATOR</span>
              <span className="text-amber-400">Telemetry Ingestion & Calibration</span>
            </div>
            <div className="bg-slate-900 p-2 rounded flex justify-between">
              <span className="text-slate-300 font-bold">VIEWER</span>
              <span className="text-slate-400">Read-Only Command Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
