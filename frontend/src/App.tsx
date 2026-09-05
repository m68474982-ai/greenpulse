import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { RiskMap } from './pages/RiskMap';
import { SensorNetwork } from './pages/SensorNetwork';
import { Alerts } from './pages/Alerts';
import { AIInsights } from './pages/AIInsights';
import { Analytics } from './pages/Analytics';
import { EmergencyCenter } from './pages/EmergencyCenter';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="live" element={<LiveMonitoring />} />
            <Route path="map" element={<RiskMap />} />
            <Route path="sensors" element={<SensorNetwork />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="insights" element={<AIInsights />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="emergency" element={<EmergencyCenter />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
