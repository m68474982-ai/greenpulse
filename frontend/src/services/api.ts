import {
  Sensor,
  Hazard,
  Alert,
  SystemStatus,
  AIInsightsData,
  AnalyticsSummary,
  EmergencyData
} from '../types';

const API_BASE = '/api';

export const api = {
  // ---------------- System Status & Demo Controls ----------------
  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  async triggerEmergency(payload: {
    location: string;
    hazard_type: string;
    risk_score?: number;
    broadcast_radius_km?: number;
    action_note?: string;
  }): Promise<{ status: string; message: string; details: EmergencyData }> {
    const res = await fetch(`${API_BASE}/system/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to trigger emergency');
    return res.json();
  },

  async triggerSimulation(scenario: 'flood' | 'forest_fire' | 'air_pollution' | 'extreme_heat' | 'normal', intensity: number = 1.0) {
    const res = await fetch(`${API_BASE}/system/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, intensity })
    });
    if (!res.ok) throw new Error('Failed to trigger simulation scenario');
    return res.json();
  },

  async resetDemo(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/system/reset-demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },

  // ---------------- Sensors ----------------
  async getSensors(): Promise<Sensor[]> {
    const res = await fetch(`${API_BASE}/sensors`);
    if (!res.ok) throw new Error('Failed to fetch sensors');
    return res.json();
  },

  async getSensorById(sensorId: string): Promise<Sensor> {
    const res = await fetch(`${API_BASE}/sensors/${sensorId}`);
    if (!res.ok) throw new Error(`Failed to fetch sensor ${sensorId}`);
    return res.json();
  },

  async postSensorReading(reading: any): Promise<any> {
    const res = await fetch(`${API_BASE}/sensors/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading)
    });
    if (!res.ok) throw new Error('Failed to post reading');
    return res.json();
  },

  // ---------------- Hazards ----------------
  async getHazards(activeOnly: boolean = true): Promise<Hazard[]> {
    const res = await fetch(`${API_BASE}/hazards?active_only=${activeOnly}`);
    if (!res.ok) throw new Error('Failed to fetch hazards');
    return res.json();
  },

  // ---------------- Alerts ----------------
  async getAlerts(limit: number = 50): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/alerts?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(alertId: string, officerName: string = 'Command Center Officer'): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledged_by: officerName })
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

  async resolveAlert(alertId: string, notes: string = 'Resolved via command protocol'): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_notes: notes })
    });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  // ---------------- AI Insights ----------------
  async getAIInsights(): Promise<AIInsightsData> {
    const res = await fetch(`${API_BASE}/ai/insights`);
    if (!res.ok) throw new Error('Failed to fetch AI insights');
    return res.json();
  },

  // ---------------- Analytics ----------------
  async getAnalytics(timeframe: string = '24h'): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics?timeframe=${timeframe}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
