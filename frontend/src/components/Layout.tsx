import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { AlertBanner } from './AlertBanner';
import { EmergencyModal } from './EmergencyModal';
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket';
import { api } from '../services/api';
import { SystemStatus, Alert } from '../types';

export const Layout: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchGlobalData = async () => {
    try {
      const [sysStatus, alertsData] = await Promise.all([
        api.getSystemStatus(),
        api.getAlerts(20)
      ]);
      setStatus(sysStatus);
      setAlerts(alertsData);
    } catch (e) {
      console.error('Error fetching global telemetry:', e);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(fetchGlobalData, 10000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleWebSocketMessage = (msg: WebSocketMessage) => {
    if (msg.event === 'new_alert') {
      fetchGlobalData();
    } else if (msg.event === 'emergency_triggered') {
      fetchGlobalData();
    } else if (msg.event === 'scenario_triggered') {
      fetchGlobalData();
    }
  };

  const { isConnected } = useWebSocket(handleWebSocketMessage);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      fetchGlobalData();
    } catch (e) {
      console.error(e);
    }
  };

  const criticalCount = (alerts || []).filter(a => a && a.is_active && a.level === 'critical').length;

  return (
    <div className="flex h-screen bg-[#080D1A] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar criticalAlertsCount={criticalCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Status Bar */}
        <StatusBar
          status={status}
          isConnected={isConnected}
          onEmergencyClick={() => setIsEmergencyModalOpen(true)}
          onRefreshData={fetchGlobalData}
        />

        {/* Top Alert Ticker Banner */}
        <AlertBanner
          alerts={alerts}
          onAcknowledge={handleAcknowledgeAlert}
        />

        {/* Page Content Outlet */}
        <main className="flex-1 p-5 max-w-[1600px] w-full mx-auto space-y-6">
          <Outlet context={{ refreshGlobal: fetchGlobalData }} />
        </main>
      </div>

      {/* Emergency Control Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSuccess={fetchGlobalData}
      />
    </div>
  );
};
