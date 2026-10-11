import React, { useState } from 'react';
import { History, Download, Trash2, Filter, ShieldCheck, ShieldAlert, BellOff, AlertTriangle, Eye, Lock, FileSpreadsheet } from 'lucide-react';
import { ACTIONS } from '../engine/policyEngine';

export default function HistoryTab({ engine, onRefresh }) {
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  const history = engine.history || [];

  const filtered = history.filter(item => {
    if (filterAction === 'ALL') return true;
    return item.action === filterAction;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phalanx_incident_audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClear = () => {
    if (window.confirm('Clear all local detection history logs? This cannot be undone.')) {
      engine.clearHistory();
      setSelectedItem(null);
      onRefresh();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '18px 20px',
        background: 'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.12) 0%, rgba(13, 18, 32, 0.95) 70%)',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={18} color="#04101e" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Audit Forensics Log</h2>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Every automated decision explained with reason codes and zero-leakage hashes.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleExportJson}
              disabled={history.length === 0}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(0, 242, 254, 0.12)',
                color: '#00f2fe',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.72rem',
                fontWeight: 600
              }}
              title="Export Forensic Report JSON"
            >
              <Download size={13} />
              <span>Export</span>
            </button>

            <button
              onClick={handleClear}
              disabled={history.length === 0}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.72rem'
              }}
              title="Clear all logs"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.35)',
        padding: 4,
        borderRadius: 12,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        gap: 4,
        overflowX: 'auto'
      }}>
        {[
          { id: 'ALL', label: 'All Events' },
          { id: ACTIONS.BLOCK_REJECT, label: 'Blocked' },
          { id: ACTIONS.SILENCE, label: 'Silenced' },
          { id: ACTIONS.ALERT, label: 'Alerted' },
          { id: ACTIONS.ALLOW, label: 'Allowed' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterAction(f.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: '0.74rem',
              fontWeight: filterAction === f.id ? 700 : 500,
              background: filterAction === f.id ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
              color: filterAction === f.id ? '#fff' : '#94a3b8',
              whiteSpace: 'nowrap',
              flex: 1
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="glass-panel" style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '0.85rem' }}>No events recorded under this filter.</p>
            <p style={{ fontSize: '0.75rem', marginTop: 4 }}>
              Incoming calls will be automatically evaluated and appended here.
            </p>
          </div>
        ) : (
          filtered.map(item => {
            const isBlocked = item.action === ACTIONS.BLOCK_REJECT;
            const isSilenced = item.action === ACTIONS.SILENCE;
            const isAlert = item.action === ACTIONS.ALERT;
            const isSelected = selectedItem?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(isSelected ? null : item)}
                className="glass-panel"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.07)',
                  background: isSelected ? 'rgba(0, 242, 254, 0.06)' : 'var(--bg-glass)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {item.contactName || item.callerMasked}
                      </span>
                      <span className={`badge-category badge-${item.callerCategory.toLowerCase()}`}>
                        {item.callerCategory}
                      </span>
                      {item.isBurst && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#ef4444',
                          background: 'rgba(239, 68, 68, 0.15)',
                          padding: '1px 6px',
                          borderRadius: 4
                        }}>
                          BURST
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.35, marginBottom: 6 }}>
                      {item.reasonExplanation}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.7rem', color: '#94a3b8' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#00f2fe' }}>
                        {item.reasonCode}
                      </span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge-category badge-action-${item.action.toLowerCase().replace('_', '')}`}>
                      {item.action}
                    </span>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                      {item.callsInWindow} call{item.callsInWindow > 1 ? 's' : ''} in {item.windowSeconds}s
                    </div>
                  </div>
                </div>

                {/* Expanded Forensic Detail Drawer */}
                {isSelected && (
                  <div style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    fontSize: '0.74rem',
                    color: '#94a3b8'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Caller Masked Number:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{item.callerMasked}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>On-Device Salted Hash:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#00f2fe' }}>{item.callerHash}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Protection Mode during event:</span>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{item.protectionMode}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Active Cooldown Triggered:</span>
                      <span style={{ color: item.cooldownTriggered ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {item.cooldownTriggered ? `Yes (${item.cooldownRemainingSeconds}s)` : 'No'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
