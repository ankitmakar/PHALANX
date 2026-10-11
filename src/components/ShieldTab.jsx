import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Power, AlertTriangle, Clock, Activity, Zap, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { PROTECTION_MODES, ACTIONS } from '../engine/policyEngine';

export default function ShieldTab({ 
  engine, 
  metrics, 
  onRefresh, 
  onNavigateTab,
  recentDetections 
}) {
  const [overrideMinutes, setOverrideMinutes] = useState(15);
  const [countdown, setCountdown] = useState(null);

  const isOverrideActive = engine.isEmergencyOverrideActive();
  const currentMode = engine.settings.protectionMode;
  const recentBurst = recentDetections.length > 0 && 
    (Date.now() - recentDetections[0].timestamp < 45000) && 
    recentDetections[0].isBurst;

  // Countdown timer for emergency override
  useEffect(() => {
    const updateCountdown = () => {
      const until = engine.settings.emergencyOverride?.until;
      if (engine.settings.emergencyOverride?.enabled && until) {
        const remaining = Math.max(0, Math.floor((until - Date.now()) / 1000));
        setCountdown(remaining);
        if (remaining <= 0) {
          engine.setEmergencyOverride(false);
          onRefresh();
        }
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [engine.settings.emergencyOverride]);

  const handleToggleOverride = (enable) => {
    if (enable) {
      engine.setEmergencyOverride(true, overrideMinutes);
    } else {
      engine.setEmergencyOverride(false);
    }
    onRefresh();
  };

  const handleModeChange = (mode) => {
    engine.saveSettings({ protectionMode: mode });
    onRefresh();
  };

  const formatTimer = (seconds) => {
    if (seconds === null) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Rolling window points
  const rollingCalls = engine.getRollingWindowEvents(60);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Shield Emblem & Radar Status */}
      <div className="glass-panel" style={{
        position: 'relative',
        padding: '24px 20px',
        textAlign: 'center',
        overflow: 'hidden',
        background: isOverrideActive
          ? 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.15) 0%, rgba(13, 18, 32, 0.95) 70%)'
          : recentBurst
            ? 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.18) 0%, rgba(13, 18, 32, 0.95) 70%)'
            : 'radial-gradient(circle at 50% 30%, rgba(0, 242, 254, 0.15) 0%, rgba(13, 18, 32, 0.95) 70%)'
      }}>
        {/* Radar Sweep Effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 220,
          height: 220,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1px dashed rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          width: 110,
          height: 110,
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: isOverrideActive
            ? 'rgba(245, 158, 11, 0.12)'
            : recentBurst
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(16, 185, 129, 0.12)',
          border: `2px solid ${
            isOverrideActive
              ? '#f59e0b'
              : recentBurst
                ? '#ef4444'
                : '#10b981'
          }`
        }}
        className={
          isOverrideActive
            ? ''
            : recentBurst
              ? 'animate-shield-danger'
              : 'animate-shield-active'
        }>
          {isOverrideActive ? (
            <Power size={52} color="#f59e0b" strokeWidth={2.2} />
          ) : recentBurst ? (
            <ShieldAlert size={52} color="#ef4444" strokeWidth={2.2} />
          ) : (
            <ShieldCheck size={52} color="#10b981" strokeWidth={2.2} />
          )}
        </div>

        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: isOverrideActive ? '#f59e0b' : recentBurst ? '#ef4444' : '#10b981',
          marginBottom: 4
        }}>
          {isOverrideActive
            ? 'OVERRIDE DISENGAGED'
            : recentBurst
              ? 'CALL BOMB INTERCEPTED'
              : currentMode === PROTECTION_MODES.MONITOR
                ? 'MONITORING ACTIVE'
                : 'CALL DEFENSE ACTIVE'}
        </h2>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: 320, margin: '0 auto 16px' }}>
          {isOverrideActive
            ? 'Protection temporarily paused. All incoming calls are permitted directly.'
            : recentBurst
              ? 'Rapid call burst detected and mitigated. Active cooldown protection running.'
              : 'Real-time temporal call burst monitoring & trusted contact preservation active.'}
        </p>

        {/* Protection Mode Toggle Pills */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(0, 0, 0, 0.45)',
          padding: 4,
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          gap: 4
        }}>
          {[
            { id: PROTECTION_MODES.MONITOR, label: 'Monitor', desc: 'Detect & Log' },
            { id: PROTECTION_MODES.BALANCED, label: 'Balanced', desc: 'Auto-Defend' },
            { id: PROTECTION_MODES.STRICT, label: 'Strict', desc: 'Max Defense' }
          ].map(m => {
            const isSelected = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected 
                    ? (m.id === 'STRICT' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 242, 254, 0.22)') 
                    : 'transparent',
                  color: isSelected ? '#fff' : '#94a3b8',
                  border: isSelected 
                    ? `1px solid ${m.id === 'STRICT' ? '#ef4444' : '#00f2fe'}` 
                    : '1px solid transparent'
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Override Control Card (PRD FR-07) */}
      <div className="glass-panel" style={{
        padding: '16px',
        background: isOverrideActive ? 'rgba(245, 158, 11, 0.08)' : 'rgba(19, 27, 46, 0.72)',
        border: `1.5px solid ${isOverrideActive ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: isOverrideActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Power size={20} color={isOverrideActive ? '#f59e0b' : '#94a3b8'} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Emergency Override</h3>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                {isOverrideActive 
                  ? (countdown ? `Active (${formatTimer(countdown)} remaining)` : 'Active indefinitely')
                  : 'Immediately bypass all call blocking rules'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleOverride(!isOverrideActive)}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: '0.8rem',
              fontWeight: 700,
              background: isOverrideActive 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              boxShadow: isOverrideActive 
                ? '0 0 15px rgba(16, 185, 129, 0.4)' 
                : '0 0 15px rgba(245, 158, 11, 0.3)'
            }}
          >
            {isOverrideActive ? 'Resume Shield' : 'Bypass All'}
          </button>
        </div>

        {/* Quick duration presets when configuring */}
        {!isOverrideActive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Override duration:</span>
            {[
              { label: '15 Min', val: 15 },
              { label: '1 Hour', val: 60 },
              { label: 'Indefinite', val: null }
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => setOverrideMinutes(preset.val)}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: overrideMinutes === preset.val ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0,0,0,0.2)',
                  color: overrideMinutes === preset.val ? '#fff' : '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real-Time Rolling Burst Window Timeline (Section 8 & 9) */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="#00f2fe" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Rolling 60s Call Timeline</h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            {rollingCalls.length} calls in window
          </span>
        </div>

        {/* Timeline Visualization Canvas/Bar */}
        <div style={{
          height: 52,
          background: 'rgba(0, 0, 0, 0.45)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px'
        }}>
          {/* Threshold marker line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '40%',
            height: 1,
            borderTop: '1px dashed rgba(239, 68, 68, 0.4)',
            pointerEvents: 'none'
          }} />
          <span style={{
            position: 'absolute',
            right: 8,
            top: 4,
            fontSize: '0.62rem',
            color: '#ef4444',
            fontFamily: 'var(--font-mono)'
          }}>
            Threshold: 3 calls
          </span>

          {rollingCalls.length === 0 ? (
            <div style={{ width: '100%', textAlign: 'center', fontSize: '0.72rem', color: '#475569' }}>
              No calls detected in current 60s sliding window
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', overflowX: 'auto' }}>
              {rollingCalls.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    padding: '3px 8px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minWidth: 54
                  }}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: c.category === 'TRUSTED' ? '#10b981' : c.category === 'SAVED' ? '#3b82f6' : '#ef4444',
                    boxShadow: '0 0 6px currentColor'
                  }} />
                  <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {Math.round((Date.now() - c.timestamp) / 1000)}s ago
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.68rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} /> Unknown
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} /> Saved
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Trusted
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('lab')}
            style={{
              fontSize: '0.72rem',
              color: '#00f2fe',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}
          >
            Launch Burst Lab <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Bursts Mitigated</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444' }}>
              {metrics.burstsMitigated}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>suppressed</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Calls Analyzed</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#00f2fe' }}>
              {metrics.totalCalls}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>total</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Active Cooldowns</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b' }}>
              {metrics.activeCooldownsCount}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>numbers</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>On-Device Privacy</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={15} /> 100% Local
            </span>
          </div>
        </div>
      </div>

      {/* Recent Incidents Section (PRD FR-09) */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Recent Detections</h3>
          <button
            onClick={() => onNavigateTab('history')}
            style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}
          >
            View All ({engine.history.length}) <ChevronRight size={14} />
          </button>
        </div>

        {recentDetections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748b', fontSize: '0.8rem' }}>
            No incoming call incidents logged yet. Try triggering a simulation in Burst Lab!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentDetections.slice(0, 3).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                      {item.contactName || item.callerMasked}
                    </span>
                    <span className={`badge-category badge-${item.callerCategory.toLowerCase()}`}>
                      {item.callerCategory}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {item.reasonCode}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge-category badge-action-${item.action.toLowerCase().replace('_', '')}`}>
                    {item.action}
                  </span>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 3 }}>
                    {Math.round((Date.now() - item.timestamp) / 1000)}s ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
