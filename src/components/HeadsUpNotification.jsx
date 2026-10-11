import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, BellOff, AlertTriangle, ShieldCheck, X, ShieldAlert } from 'lucide-react';
import { ACTIONS, CALLER_CATEGORIES } from '../engine/policyEngine';

export default function HeadsUpNotification({ call, onDismiss, onAnswer, onReject }) {
  if (!call) return null;

  const isBlocked = call.action === ACTIONS.BLOCK_REJECT;
  const isSilenced = call.action === ACTIONS.SILENCE;
  const isAlerted = call.action === ACTIONS.ALERT;
  const isAllowed = call.action === ACTIONS.ALLOW;

  return (
    <div className="animate-slide-down" style={{
      position: 'absolute',
      top: 14,
      left: 12,
      right: 12,
      zIndex: 100,
      background: isBlocked 
        ? 'linear-gradient(135deg, rgba(35, 12, 16, 0.96) 0%, rgba(20, 10, 14, 0.96) 100%)'
        : isSilenced 
          ? 'linear-gradient(135deg, rgba(35, 25, 12, 0.96) 0%, rgba(20, 16, 10, 0.96) 100%)'
          : isAlerted
            ? 'linear-gradient(135deg, rgba(30, 15, 38, 0.96) 0%, rgba(18, 10, 25, 0.96) 100%)'
            : 'linear-gradient(135deg, rgba(12, 28, 22, 0.96) 0%, rgba(10, 18, 16, 0.96) 100%)',
      backdropFilter: 'blur(20px)',
      border: `1.5px solid ${
        isBlocked ? 'rgba(239, 68, 68, 0.6)' :
        isSilenced ? 'rgba(245, 158, 11, 0.6)' :
        isAlerted ? 'rgba(168, 85, 247, 0.6)' :
        'rgba(16, 185, 129, 0.6)'
      }`,
      borderRadius: '20px',
      padding: '14px 16px',
      boxShadow: isBlocked 
        ? '0 10px 30px rgba(239, 68, 68, 0.35)' 
        : isSilenced
          ? '0 10px 30px rgba(245, 158, 11, 0.35)'
          : '0 10px 30px rgba(16, 185, 129, 0.35)',
      color: '#fff'
    }}>
      {/* Top Banner: Status & Category */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {isBlocked ? (
            <ShieldAlert size={17} color="#ef4444" />
          ) : isSilenced ? (
            <BellOff size={17} color="#f59e0b" />
          ) : isAlerted ? (
            <AlertTriangle size={17} color="#c084fc" />
          ) : (
            <ShieldCheck size={17} color="#10b981" />
          )}

          <span style={{ 
            fontSize: '0.78rem', 
            fontWeight: 800, 
            letterSpacing: '0.06em', 
            textTransform: 'uppercase',
            color: isBlocked ? '#ef4444' : isSilenced ? '#f59e0b' : isAlerted ? '#c084fc' : '#10b981'
          }}>
            {isBlocked ? 'PHALANX: CALL FLOOD TERMINATED' :
             isSilenced ? 'PHALANX: BURST SILENCED & SHUNTED' :
             isAlerted ? 'PHALANX: URGENT BURST ALERT' :
             'PHALANX: INCOMING CALL (ALLOWED)'}
          </span>
        </div>

        <button 
          onClick={onDismiss} 
          style={{ 
            color: 'rgba(255,255,255,0.6)', 
            padding: 3, 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: '50%'
          }}
          title="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>

      {/* Main Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h4 style={{ 
              fontSize: '1.02rem', 
              fontWeight: 700, 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {call.contactName || 'Unknown Caller'}
            </h4>
            <span className={`badge-category badge-${call.callerCategory.toLowerCase()}`}>
              {call.callerCategory}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#94a3b8' }}>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{call.callerMasked}</span>
            <span>•</span>
            <span style={{ color: call.isBurst ? '#f87171' : '#38bdf8', fontWeight: 600 }}>
              {call.callsInWindow} {call.callsInWindow === 1 ? 'call' : 'calls'} in {call.windowSeconds}s
            </span>
          </div>

          <p style={{ 
            fontSize: '0.74rem', 
            color: '#cbd5e1', 
            marginTop: 5, 
            lineHeight: 1.35,
            background: 'rgba(0,0,0,0.25)',
            padding: '4px 8px',
            borderRadius: '6px',
            borderLeft: `3px solid ${isBlocked ? '#ef4444' : isSilenced ? '#f59e0b' : '#10b981'}`
          }}>
            {call.reasonExplanation}
          </p>
        </div>
      </div>

      {/* Action Buttons for Incoming Call */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end', 
        gap: 8, 
        marginTop: 12,
        paddingTop: 8,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)' 
      }}>
        {isBlocked ? (
          <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShieldAlert size={14} /> Deflected by Phalanx Kernel
          </span>
        ) : isSilenced ? (
          <>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <BellOff size={13} /> Ringer Muted
            </span>
            <button 
              onClick={onReject}
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <PhoneOff size={13} /> Drop Call
            </button>
            <button 
              onClick={onAnswer}
              style={{
                background: 'rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Phone size={13} /> Answer Anyway
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={onReject}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <PhoneOff size={13} /> Decline
            </button>
            <button 
              onClick={onAnswer}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Phone size={13} /> Accept
            </button>
          </>
        )}
      </div>
    </div>
  );
}
