import React, { useState } from 'react';
import { Sliders, RotateCcw, Shield, BellOff, PhoneOff, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { ACTIONS, CALLER_CATEGORIES, DEFAULT_SETTINGS } from '../engine/policyEngine';

export default function RulesTab({ engine, onRefresh }) {
  const [rules, setRules] = useState(JSON.parse(JSON.stringify(engine.settings.rules)));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = (category, field, value) => {
    setRules(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    engine.saveSettings({ rules });
    onRefresh();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    const defaultCopy = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.rules));
    setRules(defaultCopy);
    engine.saveSettings({ rules: defaultCopy });
    onRefresh();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '18px 20px',
        background: 'radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.12) 0%, rgba(13, 18, 32, 0.95) 70%)',
        border: '1px solid rgba(168, 85, 247, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sliders size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Policy Engine Rules</h2>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Deterministic behavioral burst thresholds & safe escalation policies (PRD v1.0).
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem'
            }}
            title="Reset to recommended factory policy"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Policy 1: Unknown Callers (Primary Call Bombing Vector) */}
      <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700 }}>Unknown Callers</h3>
              <span className="badge-category badge-unknown">Primary Target</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Unsaved numbers, potential automated robodialers & call-bombing vectors.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Burst Count Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
              <span style={{ color: '#cbd5e1' }}>Burst Threshold:</span>
              <span style={{ fontWeight: 700, color: '#ef4444' }}>
                {rules[CALLER_CATEGORIES.UNKNOWN].threshold} calls
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={rules[CALLER_CATEGORIES.UNKNOWN].threshold}
              onChange={(e) => handleUpdate(CALLER_CATEGORIES.UNKNOWN, 'threshold', Number(e.target.value))}
            />
          </div>

          {/* Time Window Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
              <span style={{ color: '#cbd5e1' }}>Rolling Window:</span>
              <span style={{ fontWeight: 700, color: '#00f2fe' }}>
                {rules[CALLER_CATEGORIES.UNKNOWN].windowSeconds} seconds
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={rules[CALLER_CATEGORIES.UNKNOWN].windowSeconds}
              onChange={(e) => handleUpdate(CALLER_CATEGORIES.UNKNOWN, 'windowSeconds', Number(e.target.value))}
            />
          </div>

          {/* Action Choice */}
          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              Triggered Protective Action:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { id: ACTIONS.SILENCE, label: 'Silence & Shunt', icon: BellOff, color: '#f59e0b' },
                { id: ACTIONS.BLOCK_REJECT, label: 'Block / Reject', icon: PhoneOff, color: '#ef4444' },
                { id: ACTIONS.ALERT, label: 'Urgent Alert', icon: AlertTriangle, color: '#c084fc' },
                { id: ACTIONS.ALLOW, label: 'Allow Only', icon: CheckCircle, color: '#10b981' },
              ].map(act => {
                const isSelected = rules[CALLER_CATEGORIES.UNKNOWN].action === act.id;
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleUpdate(CALLER_CATEGORIES.UNKNOWN, 'action', act.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: isSelected ? `${act.color}25` : 'rgba(0, 0, 0, 0.3)',
                      border: `1.5px solid ${isSelected ? act.color : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isSelected ? '#fff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    <Icon size={14} color={act.color} />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cooldown Period */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
              <span style={{ color: '#cbd5e1' }}>Protection Cooldown Duration:</span>
              <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                {rules[CALLER_CATEGORIES.UNKNOWN].cooldownSeconds}s
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="300"
              step="15"
              value={rules[CALLER_CATEGORIES.UNKNOWN].cooldownSeconds}
              onChange={(e) => handleUpdate(CALLER_CATEGORIES.UNKNOWN, 'cooldownSeconds', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Policy 2: Saved Contacts (Address Book) */}
      <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 700 }}>Saved Contacts</h3>
            <span className="badge-category badge-saved">Address Book</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Friends, deliveries, colleagues. More lenient thresholds to prevent blocking legitimate urgent calls.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
              <span style={{ color: '#cbd5e1' }}>Burst Threshold:</span>
              <span style={{ fontWeight: 700, color: '#3b82f6' }}>
                {rules[CALLER_CATEGORIES.SAVED].threshold} calls
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              value={rules[CALLER_CATEGORIES.SAVED].threshold}
              onChange={(e) => handleUpdate(CALLER_CATEGORIES.SAVED, 'threshold', Number(e.target.value))}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              Action on Exceeded Threshold:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { id: ACTIONS.ALERT, label: 'Warn / Alert', icon: AlertTriangle, color: '#c084fc' },
                { id: ACTIONS.SILENCE, label: 'Silence Mute', icon: BellOff, color: '#f59e0b' },
                { id: ACTIONS.ALLOW, label: 'Always Allow', icon: CheckCircle, color: '#10b981' }
              ].map(act => {
                const isSelected = rules[CALLER_CATEGORIES.SAVED].action === act.id;
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleUpdate(CALLER_CATEGORIES.SAVED, 'action', act.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: isSelected ? `${act.color}25` : 'rgba(0, 0, 0, 0.3)',
                      border: `1.5px solid ${isSelected ? act.color : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isSelected ? '#fff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    <Icon size={14} color={act.color} />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Policy 3: Trusted Contacts (VIP Family / Emergency) */}
      <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 700 }}>Trusted Contacts (VIP Priority)</h3>
            <span className="badge-category badge-trusted">Protected Class</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Family and emergency contacts. Policy ensures legitimate critical calls always ring through.
          </p>
        </div>

        <div style={{
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10
        }}>
          <CheckCircle size={18} color="#10b981" />
          <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>
            Guaranteed bypass: Trusted contacts will never be silently dropped or blocked.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
          <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
            Urgent notification banner on extreme burst (&gt;8 calls/60s)
          </span>
          <button
            onClick={() => handleUpdate(CALLER_CATEGORIES.TRUSTED, 'alertOnExtreme', !rules[CALLER_CATEGORIES.TRUSTED].alertOnExtreme)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: '0.74rem',
              fontWeight: 700,
              background: rules[CALLER_CATEGORIES.TRUSTED].alertOnExtreme ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: rules[CALLER_CATEGORIES.TRUSTED].alertOnExtreme ? '#10b981' : '#94a3b8',
              border: `1px solid ${rules[CALLER_CATEGORIES.TRUSTED].alertOnExtreme ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`
            }}
          >
            {rules[CALLER_CATEGORIES.TRUSTED].alertOnExtreme ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="btn-primary"
        style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
      >
        {savedSuccess ? (
          <>
            <CheckCircle size={18} /> Policies Updated Successfully!
          </>
        ) : (
          <>
            <Sparkles size={18} /> Apply Policy Configuration
          </>
        )}
      </button>
    </div>
  );
}
