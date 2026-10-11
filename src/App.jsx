import React, { useState, useEffect, useCallback } from 'react';
import PhoneFrame from './components/PhoneFrame';
import HeadsUpNotification from './components/HeadsUpNotification';
import ShieldTab from './components/ShieldTab';
import BurstLab from './components/BurstLab';
import RulesTab from './components/RulesTab';
import ContactsTab from './components/ContactsTab';
import HistoryTab from './components/HistoryTab';
import SystemTab from './components/SystemTab';
import { engineInstance, CALLER_CATEGORIES, ACTIONS } from './engine/policyEngine';
import { soundEffects } from './utils/soundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState('shield');
  const [activeCall, setActiveCall] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [metrics, setMetrics] = useState(engineInstance.getMetrics());
  const [historyList, setHistoryList] = useState([...engineInstance.history]);
  const [tick, setTick] = useState(0);

  // Pre-seed realistic PRD demonstration events if history is brand new
  useEffect(() => {
    if (engineInstance.history.length === 0) {
      const now = Date.now();
      // Seed an unknown burst intercepted
      engineInstance.history.push({
        id: 'det_demo1',
        timestamp: now - 12000,
        callerHash: '0x811c9ab2',
        callerMasked: '+91 91*** **789',
        callerCategory: CALLER_CATEGORIES.UNKNOWN,
        contactName: 'Unknown Caller',
        action: ACTIONS.SILENCE,
        isBurst: true,
        reasonCode: 'BURST_UNKNOWN_THRESHOLD_EXCEEDED',
        reasonExplanation: 'Potential call flood detected: 3 calls within 60s from unverified number. Action: SILENCE.',
        callsInWindow: 3,
        windowSeconds: 60,
        threshold: 3,
        cooldownTriggered: true,
        cooldownRemainingSeconds: 60,
        protectionMode: 'BALANCED'
      });
      // Seed a mom call allowed
      engineInstance.history.push({
        id: 'det_demo2',
        timestamp: now - 45000,
        callerHash: '0x32f1a90c',
        callerMasked: '+91 98*** **223',
        callerCategory: CALLER_CATEGORIES.TRUSTED,
        contactName: 'Mom (Personal)',
        action: ACTIONS.ALLOW,
        isBurst: false,
        reasonCode: 'TRUSTED_PRIORITY_BYPASS',
        reasonExplanation: 'Trusted VIP contact (Mom). Policy prioritizes access over burst suppression.',
        callsInWindow: 1,
        windowSeconds: 60,
        threshold: 8,
        cooldownTriggered: false,
        cooldownRemainingSeconds: 0,
        protectionMode: 'BALANCED'
      });
      engineInstance.saveHistory();
      setHistoryList([...engineInstance.history]);
      setMetrics(engineInstance.getMetrics());
    }
  }, []);

  const refreshState = useCallback(() => {
    setMetrics(engineInstance.getMetrics());
    setHistoryList([...engineInstance.history]);
    setTick(t => t + 1);
  }, []);

  // When a simulated or incoming call is triggered
  const handleIncomingCall = useCallback((decision) => {
    setActiveCall(decision);
    refreshState();

    // Auto-dismiss notification after 8 seconds
    const timer = setTimeout(() => {
      setActiveCall(prev => (prev?.id === decision.id ? null : prev));
    }, 8000);

    return () => clearTimeout(timer);
  }, [refreshState]);

  const handleDismissCall = () => {
    setActiveCall(null);
  };

  const handleAnswerCall = () => {
    if (soundEnabled) soundEffects.playRing();
    setActiveCall(null);
  };

  const handleRejectCall = () => {
    if (soundEnabled) soundEffects.playBlock();
    setActiveCall(null);
  };

  return (
    <PhoneFrame
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      overrideActive={engineInstance.isEmergencyOverrideActive()}
      soundEnabled={soundEnabled}
      setSoundEnabled={setSoundEnabled}
      burstDetectedRecently={metrics.burstsMitigated > 0}
    >
      {/* Real-time Heads-Up Notification Banner */}
      <HeadsUpNotification
        call={activeCall}
        onDismiss={handleDismissCall}
        onAnswer={handleAnswerCall}
        onReject={handleRejectCall}
      />

      {/* Render active screen */}
      {activeTab === 'shield' && (
        <ShieldTab
          engine={engineInstance}
          metrics={metrics}
          onRefresh={refreshState}
          onNavigateTab={setActiveTab}
          recentDetections={historyList}
        />
      )}

      {activeTab === 'lab' && (
        <BurstLab
          engine={engineInstance}
          onSimulateCall={handleIncomingCall}
          onRefresh={refreshState}
          soundEnabled={soundEnabled}
        />
      )}

      {activeTab === 'rules' && (
        <RulesTab
          engine={engineInstance}
          onRefresh={refreshState}
        />
      )}

      {activeTab === 'contacts' && (
        <ContactsTab
          engine={engineInstance}
          onRefresh={refreshState}
          onSimulateCall={handleIncomingCall}
        />
      )}

      {activeTab === 'history' && (
        <HistoryTab
          engine={engineInstance}
          onRefresh={refreshState}
        />
      )}

      {activeTab === 'system' && (
        <SystemTab
          engine={engineInstance}
          onRefresh={refreshState}
        />
      )}
    </PhoneFrame>
  );
}
