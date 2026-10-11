import React, { useState } from 'react';
import { Settings, Shield, Lock, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Cpu, Eye, ExternalLink, HardDrive } from 'lucide-react';

export default function SystemTab({ engine, onRefresh }) {
  const [retentionHours, setRetentionHours] = useState(engine.settings.privacy?.historyRetentionHours || 24);
  const [maskNumbers, setMaskNumbers] = useState(engine.settings.privacy?.maskPhoneNumbers !== false);
  const [statusMessage, setStatusMessage] = useState(null);

  const permissions = [
    {
      name: 'Call Screening Service',
      permission: 'android.permission.BIND_SCREEN_CALL_SERVICE',
      status: 'GRANTED',
      purpose: 'Enables background evaluation and silent call deflection without ring interrupt.'
    },
    {
      name: 'Phone State Telephony',
      permission: 'android.permission.READ_PHONE_STATE',
      status: 'GRANTED',
      purpose: 'Detects incoming ringing states and temporal timestamp intervals.'
    },
    {
      name: 'Notification / DND Access',
      permission: 'android.permission.ACCESS_NOTIFICATION_POLICY',
      status: 'GRANTED',
      purpose: 'Permits muting audible ringer during high-burst incidents.'
    },
    {
      name: 'Local Contacts Directory',
      permission: 'android.permission.READ_CONTACTS',
      status: 'LOCAL_ONLY',
      purpose: 'Distinguishes trusted VIP family members from unknown callers on-device.'
    }
  ];

  const handleSavePrivacy = () => {
    engine.saveSettings({
      privacy: {
        ...engine.settings.privacy,
        historyRetentionHours: retentionHours,
        maskPhoneNumbers: maskNumbers
      }
    });
    engine.pruneHistory();
    onRefresh();
    setStatusMessage('Privacy settings updated and history pruned!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleFactoryReset = () => {
    if (window.confirm('Reset all PHALANX engine settings, contacts, and logs to initial baseline?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '18px 20px',
        background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.12) 0%, rgba(13, 18, 32, 0.95) 70%)',
        border: '1px solid rgba(16, 185, 129, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #10b981 0%, #00f2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Settings size={18} color="#04101e" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>System Diagnostics & Privacy</h2>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Zero-leakage telemetry, Android capability verification, and data retention controls.
            </p>
          </div>
        </div>
      </div>

      {/* Android OS Capabilities Diagnostic Matrix */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Smartphone size={16} color="#00f2fe" /> Android Platform Health Check
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 99 }}>
            ALL OK (API 34+)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {permissions.map((p, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f1f5f9' }}>
                  {p.name}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <CheckCircle2 size={12} /> {p.status}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3 }}>
                {p.purpose}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Zero Cloud Leakage & Privacy Manifesto */}
      <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Lock size={18} color="#10b981" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Zero-Cloud Privacy Guarantee (PRD Section 17)</h3>
        </div>

        <p style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: 12 }}>
          PHALANX operates entirely local-first. Incoming call phone numbers are normalized, hashed with a cryptographic salt, and evaluated inside on-device memory. Raw numbers are never uploaded to any remote server or third-party cloud.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{
            padding: '8px 10px',
            borderRadius: 8,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Network Outbound:</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginTop: 2 }}>
              0 bytes (Offline)
            </div>
          </div>

          <div style={{
            padding: '8px 10px',
            borderRadius: 8,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Identifier Storage:</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe', marginTop: 2 }}>
              SHA-256 Salted Hash
            </div>
          </div>
        </div>
      </div>

      {/* Data Retention & Privacy Settings */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>
          Local History Retention
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 4 }}>
              <span style={{ color: '#cbd5e1' }}>Purge logs older than:</span>
              <span style={{ fontWeight: 700, color: '#00f2fe' }}>{retentionHours} hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="72"
              step="1"
              value={retentionHours}
              onChange={(e) => setRetentionHours(Number(e.target.value))}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block' }}>Mask digits in UI</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Hide middle digits e.g. +91 98*** **210</span>
            </div>
            <button
              onClick={() => setMaskNumbers(!maskNumbers)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.74rem',
                fontWeight: 700,
                background: maskNumbers ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: maskNumbers ? '#10b981' : '#94a3b8',
                border: `1px solid ${maskNumbers ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`
              }}
            >
              {maskNumbers ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <button
            onClick={handleSavePrivacy}
            className="btn-primary"
            style={{ width: '100%', marginTop: 4, padding: '10px' }}
          >
            Update Retention Settings
          </button>

          {statusMessage && (
            <p style={{ fontSize: '0.74rem', color: '#10b981', textAlign: 'center' }}>
              {statusMessage}
            </p>
          )}
        </div>
      </div>

      {/* Architecture Layer Breakdown (PRD Section 14) */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={16} color="#a855f7" /> Architecture Flow (PRD Section 14)
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)',
          color: '#94a3b8',
          background: 'rgba(0,0,0,0.3)',
          padding: '12px',
          borderRadius: 10
        }}>
          <div>1. Telephony Layer → Ingests Call Event</div>
          <div>2. Event Normalizer → Normalizes & Hashes number</div>
          <div>3. Category Classifier → Evaluates Saved/Trusted/Unknown</div>
          <div>4. Rolling Window Engine → Counts calls in 60s sliding window</div>
          <div>5. Policy Engine → Generates Deterministic Action & Reason Code</div>
          <div>6. Action Adapter → Executes Deflection / Mute / Ring</div>
          <div>7. Local Forensics Store → Persists compact audit record</div>
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <button
          onClick={handleFactoryReset}
          style={{
            fontSize: '0.74rem',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '8px 14px',
            borderRadius: 8
          }}
        >
          Reset Prototype to Factory State
        </button>
      </div>
    </div>
  );
}
