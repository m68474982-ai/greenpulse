export type SensorStatus = 'normal' | 'warning' | 'high_risk' | 'critical' | 'offline';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type AlertLevel = 'info' | 'warning' | 'high' | 'critical';

export type HazardType = 'flood' | 'forest_fire' | 'air_pollution' | 'extreme_heat' | 'drought' | 'cyclone';

export interface SensorReading {
  timestamp: string;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  water_level?: number;
  water_flow?: number;
  river_level?: number;
  smoke?: number;
  flame_detected?: boolean;
  pm25?: number;
  pm10?: number;
  co?: number;
  co2?: number;
  no2?: number;
  so2?: number;
  voc?: number;
  wind_speed?: number;
  wind_direction?: number;
  pressure?: number;
  soil_moisture?: number;
  soil_temperature?: number;
}

export interface Sensor {
  id: number;
  sensor_id: string;
  name: string;
  sensor_types: string[];
  latitude: number;
  longitude: number;
  location_name: string;
  state: string;
  status: SensorStatus;
  battery: number;
  signal_strength: number;
  firmware_version: string;
  is_simulated: boolean;
  is_active: boolean;
  created_at: string;
  last_seen: string;
  latest_reading?: SensorReading;
  recent_readings?: SensorReading[];
}

export interface Hazard {
  id: number;
  hazard_type: HazardType;
  location_name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: RiskLevel;
  ai_confidence: number;
  detected_at: string;
  updated_at: string;
  affected_radius_km: number;
  detection_reasons: string[];
  recommended_action: string;
  sensor_id?: string;
  status: string;
  is_active: boolean;
}

export interface Alert {
  id: number;
  alert_id: string;
  hazard_id?: number;
  level: AlertLevel;
  title: string;
  message: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  risk_score?: number;
  ai_confidence?: number;
  affected_area?: string;
  recommended_action?: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  is_active: boolean;
}

export interface SystemStatus {
  status: string;
  connected_sensors: number;
  total_sensors: number;
  active_incidents: number;
  critical_alerts: number;
  high_risk_zones: number;
  alerts_today: number;
  ai_confidence_average: number;
  network_health_percentage: number;
  last_data_update: string;
  is_demo_mode: boolean;
  active_scenario?: string;
}

export interface AIInsight {
  id: string;
  hazard_type: string;
  title: string;
  location: string;
  risk_score: number;
  risk_level: string;
  ai_confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  prediction_timeframe: string;
  narrative: string;
  detected_anomalies: string[];
  recommended_actions: string[];
  timestamp: string;
}

export interface AIInsightsData {
  overall_ai_confidence: number;
  active_hazard_count: number;
  insights: AIInsight[];
  feature_importance: Array<{ feature: string; weight: number; category: string }>;
  predictive_forecast: Array<{ horizon: string; predicted_risk: number; confidence: number; expected_conditions: string }>;
}

export interface AnalyticsSummary {
  timeframe: string;
  water_level_trend: Array<{ time: string; value: number; threshold: number; critical: number }>;
  temperature_trend: Array<{ time: string; value: number; humidity: number }>;
  pm25_trend: Array<{ time: string; value: number; pm10: number; standard: number }>;
  rainfall_trend: Array<{ time: string; value: number; cumulative: number }>;
  hazard_frequency: Array<{ hazard_type: string; count: number; color: string }>;
  alerts_by_severity: { CRITICAL: number; HIGH: number; WARNING: number; INFO: number };
  risk_distribution: { [key: string]: number };
  sensor_health_list: Array<{
    sensor_id: string;
    name: string;
    location: string;
    state: string;
    battery: number;
    signal: number;
    status: SensorStatus;
    uptime_percentage: number;
  }>;
}

export interface EmergencyData {
  status: string;
  alert_id: string;
  location: string;
  hazard_type: string;
  risk_score: number;
  broadcast_radius_km: number;
  initiated_by: string;
  timestamp: string;
  recommended_action: string;
}
