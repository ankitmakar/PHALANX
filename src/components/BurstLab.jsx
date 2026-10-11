import React, { useState } from 'react';
import { Zap, Play, Flame, HeartHandshake, ShieldAlert, PhoneCall, RefreshCw, Terminal, CheckCircle2, AlertOctagon } from 'lucide-react';
import { CALLER_CATEGORIES, ACTIONS } from '../engine/policyEngine';
import { soundEffects } from '../utils/soundEffects';

export default function BurstLab({ 
  engine, 
  onSimulateCall, 
  onRefresh, 
  soundEnabled 
}) {
  const [customNumber, setCustomNumber] = useState('+91 91234 56789');
  const [customCategory, setCustomCategory] = useState(CALLER_CATEGORIES.UNKNOWN);
  const [burstCount, setBurstCount] = useState(4);
  const [burstInterval, setBurstInterval] = useState(1200); // ms
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLog, setSimLog] = useState([]);

  // Preset Scenarios
  const scenarios = [
    {
      id: 'call_bomb',
      title: 'Aggressive Call Bomb',
      subtitle: '6 rapid calls from unknown number (+91 91234 56789) in 8 seconds',
      icon: Flame,
      color: '#ef4444',
      badge: 'Spam Attack',
      number: '+91 91234 56789',
      category: CALLER_CATEGORIES.UNKNOWN,
      count: 6,
      interval: 1000
    },
    {
      id: 'distributed_flood',
      title: 'Distributed Bot Flood',
      subtitle: '5 calls from rotating unknown numbers within 10 seconds',
      icon: AlertOctagon,
      color: '#f59e0b',
      badge: 'Multi-Number',
      isDistributed: true,
      count: 5,
      interval: 1200
    },
    {
      id: 'family_emergency',
      title: 'Family Emergency (VIP)',
      subtitle: '4 rapid calls from Mom (Trusted Contact)',
      icon: HeartHandshake,
      color: '#10b981',
      badge: 'Trusted VIP',
      number: '+91 98200 11223', // Mom
      category: CALLER_CATEGORIES.TRUSTED,
      count: 4,
      interval: 1400
    },
    {
      id: 'delivery_spike',
      title: 'Delivery Partner Spike',
      subtitle: '3 calls from Swiggy / Courier (Saved Contact)',
      icon: PhoneCall,
      color: '#3b82f6',
      badge: 'Saved Contact',
      number: '+91 80456 78901', // Swiggy
      category: CALLER_CATEGORIES.SAVED,
      count: 3,
      interval: 1500
    }
  ];

  const runScenario = async (scenario) => {
    if (isSimulating) return;
    setIsSimulating(true);

    if (soundEnabled) soundEffects.playBurstAttack();

    for (let i = 0; i < scenario.count; i++) {
      const targetNum = scenario.isDistributed 
        ? `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`
        : scenario.number;

      const decision = engine.evaluateIncomingCall(targetNum);
      onSimulateCall(decision);

      // Play audio cue depending on action
      if (soundEnabled) {
        if (decision.action === ACTIONS.BLOCK_REJECT) {
          soundEffects.playBlock();
        } else if (decision.action === ACTIONS.SILENCE) {
          soundEffects.playBlock();
        } else if (decision.action === ACTIONS.ALERT) {
          soundEffects.playAlert();
        } else {
          soundEffects.playRing();
        }
      }

      setSimLog(prev => [
        {
          id: decision.id,
          time: new Date().toLocaleTimeString(),
          step: `${i + 1}/${scenario.count}`,
          caller: decision.callerMasked,
          action: decision.action,
          reasonCode: decision.reasonCode
        },
        ...prev.slice(0, 15)
      ]);

      onRefresh();

      if (i < scenario.count - 1) {
        await new Promise(r => setTimeout(r, scenario.interval));
      }
    }

    setIsSimulating(false);
  };

  const handleCustomLaunch = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    if (soundEnabled) soundEffects.playBurstAttack();

    for (let i = 0; i < burstCount; i++) {
      const decision = engine.evaluateIncomingCall(customNumber);
      onSimulateCall(decision);

      if (soundEnabled) {
        if (decision.action === ACTIONS.BLOCK_REJECT || decision.action === ACTIONS.SILENCE) {
          soundEffects.playBlock();
        } else if (decision.action === ACTIONS.ALERT) {
          soundEffects.playAlert();
        } else {
          soundEffects.playRing();
        }
      }

      setSimLog(prev => [
        {
          id: decision.id,
          time: new Date().toLocaleTimeString(),
          step: `${i + 1}/${burstCount}`,
          caller: decision.callerMasked,
          action: decision.action,
          reasonCode: decision.reasonCode
        },
        ...prev.slice(0, 15)
      ]);

      onRefresh();

      if (i < burstCount - 1) {
        await new Promise(r => setTimeout(r, burstInterval));
      }
    }

    setIsSimulating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '18px 20px',
        background: 'radial-gradient(circle at 10% 20%, rgba(0, 242, 254, 0.12) 0%, rgba(13, 18, 32, 0.95) 70%)',
        border: '1px solid rgba(0, 242, 254, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={18} color="#04101e" />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Burst Attack Simulator</h2>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Test PHALANX's real-time temporal policy engine by launching simulated call-bombing attacks and observing deterministic decisions.
        </p>
      </div>

      {/* Preset Scenarios List */}
      <div>
        <h3 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 10, letterSpacing: '0.02em' }}>
          Standard Attack Scenarios (1-Tap Test)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                className="glass-panel"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'all 0.2s ease',
                  border: `1px solid rgba(255, 255, 255, 0.08)`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${sc.color}20`,
                    border: `1px solid ${sc.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={20} color={sc.color} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{sc.title}</h4>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: sc.color,
                        background: `${sc.color}18`,
                        padding: '1px 6px',
                        borderRadius: 99,
                        border: `1px solid ${sc.color}35`
                      }}>
                        {sc.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.25 }}>
                      {sc.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  disabled={isSimulating}
                  onClick={() => runScenario(sc)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: isSimulating ? 'rgba(255, 255, 255, 0.08)' : `${sc.color}25`,
                    color: isSimulating ? '#64748b' : sc.color,
                    border: `1px solid ${isSimulating ? 'transparent' : `${sc.color}60`}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0
                  }}
                >
                  <Play size={13} fill="currentColor" />
                  <span>Launch</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Call Injector */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🛠️ Custom Burst Injector</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              Target Caller Number
            </label>
            <input
              type="text"
              value={customNumber}
              onChange={(e) => setCustomNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Burst Count: {burstCount} calls
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={burstCount}
                onChange={(e) => setBurstCount(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Delay: {(burstInterval / 1000).toFixed(1)}s
              </label>
              <input
                type="range"
                min="400"
                max="3000"
                step="200"
                value={burstInterval}
                onChange={(e) => setBurstInterval(Number(e.target.value))}
              />
            </div>
          </div>

          <button
            disabled={isSimulating}
            onClick={handleCustomLaunch}
            className="btn-primary"
            style={{ width: '100%', marginTop: 4, opacity: isSimulating ? 0.6 : 1 }}
          >
            {isSimulating ? (
              <>
                <RefreshCw size={15} className="animate-spin" /> Simulating Call Bomb Burst...
              </>
            ) : (
              <>
                <Zap size={16} /> Fire {burstCount} Test Calls
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Telephony Event Console */}
      <div className="glass-panel" style={{ padding: '14px', background: 'rgba(5, 8, 15, 0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Terminal size={15} color="#00f2fe" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#00f2fe' }}>
              TELEPHONY EVENT STREAM
            </span>
          </div>
          {simLog.length > 0 && (
            <button
              onClick={() => setSimLog([])}
              style={{ fontSize: '0.68rem', color: '#64748b' }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{
          maxHeight: 140,
          overflowY: 'auto',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
          {simLog.length === 0 ? (
            <div style={{ color: '#475569', textAlign: 'center', padding: '12px 0' }}>
              Awaiting simulated telephony event triggers...
            </div>
          ) : (
            simLog.map((log, i) => (
              <div
                key={log.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 6px',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `2px solid ${
                    log.action === 'BLOCK_REJECT' ? '#ef4444' :
                    log.action === 'SILENCE' ? '#f59e0b' :
                    log.action === 'ALERT' ? '#a855f7' : '#10b981'
                  }`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#64748b' }}>[{log.time}]</span>
                  <span style={{ color: '#94a3b8' }}>#{log.step}</span>
                  <span style={{ color: '#f8fafc' }}>{log.caller}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    color: log.action === 'BLOCK_REJECT' ? '#ef4444' :
                           log.action === 'SILENCE' ? '#f59e0b' :
                           log.action === 'ALERT' ? '#c084fc' : '#10b981',
                    fontWeight: 700
                  }}>
                    {log.action}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
