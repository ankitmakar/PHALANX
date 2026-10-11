import React, { useState } from 'react';
import { Smartphone, Monitor, Shield, Zap, Sliders, Users, History, Settings, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

export default function PhoneFrame({ 
  children, 
  activeTab, 
  setActiveTab, 
  overrideActive,
  soundEnabled,
  setSoundEnabled,
  burstDetectedRecently
}) {
  const [isPhoneMode, setIsPhoneMode] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.setEnabled(next);
    if (next) soundEffects.playToggle();
  };

  const navItems = [
    { id: 'shield', label: 'Shield', icon: Shield },
    { id: 'lab', label: 'Burst Lab', icon: Zap },
    { id: 'rules', label: 'Policies', icon: Sliders },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'history', label: 'Forensics', icon: History },
    { id: 'system', label: 'System', icon: Settings },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: isPhoneMode ? '16px 8px 30px' : '16px 20px 40px',
      position: 'relative'
    }}>
      {/* Top Floating App Bar / Utility Switcher */}
      <header style={{
        width: '100%',
        maxWidth: isPhoneMode ? 460 : 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        padding: '8px 14px',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
          }}>
            <Shield size={18} color="#04101e" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: '0.96rem', letterSpacing: '0.04em', color: '#fff' }}>
                PHALANX
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#00f2fe',
                background: 'rgba(0, 242, 254, 0.12)',
                padding: '1px 6px',
                borderRadius: 4,
                letterSpacing: '0.08em'
              }}>
                DEFENSE v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.1 }}>
              Android Call-Bomb & Flood Shield
            </p>
          </div>
        </div>

        {/* View mode toggle & Sound toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={toggleSound}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: soundEnabled ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255,255,255,0.05)',
              color: soundEnabled ? '#00f2fe' : '#64748b',
              border: `1px solid ${soundEnabled ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              fontWeight: 600
            }}
            title={soundEnabled ? 'Audio Feedback Enabled' : 'Audio Feedback Muted'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span style={{ display: isPhoneMode ? 'none' : 'inline' }}>Sound</span>
          </button>

          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 10,
            padding: 2,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => setIsPhoneMode(true)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: isPhoneMode ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: isPhoneMode ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                fontWeight: 600
              }}
              title="Android Phone Mockup"
            >
              <Smartphone size={14} />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setIsPhoneMode(false)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: !isPhoneMode ? 'rgba(0, 242, 254, 0.18)' : 'transparent',
                color: !isPhoneMode ? '#00f2fe' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                fontWeight: 600
              }}
              title="Full Dashboard Layout"
            >
              <Monitor size={14} />
              <span>Full View</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Phone Mockup or Widescreen View */}
      <div style={{
        width: '100%',
        maxWidth: isPhoneMode ? 440 : 1200,
        position: 'relative'
      }}>
        <div style={{
          position: 'relative',
          borderRadius: isPhoneMode ? '44px' : '24px',
          background: '#090d18',
          border: isPhoneMode ? '4px solid #1e293b' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isPhoneMode 
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 40px rgba(0, 242, 254, 0.1)' 
            : '0 20px 50px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: isPhoneMode ? 820 : 'auto',
          maxHeight: isPhoneMode ? '92vh' : 'none'
        }}>
          {/* Android Status Bar (Only in Phone Mode) */}
          {isPhoneMode && (
            <div style={{
              height: 38,
              background: '#070a12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 22px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              userSelect: 'none',
              zIndex: 30,
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>
              <span style={{ fontWeight: 700, color: '#f1f5f9' }}>14:20</span>

              {/* Front Camera Cutout */}
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#000',
                border: '1.5px solid #1e293b',
                boxShadow: 'inset 0 0 3px rgba(0, 242, 254, 0.3)'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00f2fe' }}>5G</span>
                <span>📶</span>
                <span>98%</span>
              </div>
            </div>
          )}

          {/* Scrollable Content Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: isPhoneMode ? '16px 14px 84px' : '24px 28px 84px',
            position: 'relative'
          }}>
            {children}
          </div>

          {/* Bottom Android Navigation Pill Bar */}
          <nav style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(9, 13, 24, 0.94)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: isPhoneMode ? '10px 4px 18px' : '10px 24px',
            zIndex: 40
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (soundEnabled) soundEffects.playToggle();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 8px',
                    borderRadius: '12px',
                    color: isActive ? '#00f2fe' : '#64748b',
                    background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                    position: 'relative',
                    flex: 1,
                    maxWidth: 72
                  }}
                >
                  <Icon size={isPhoneMode ? 20 : 22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.02em'
                  }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      width: 16,
                      height: 3,
                      borderRadius: 99,
                      background: '#00f2fe',
                      boxShadow: '0 0 8px #00f2fe'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Android Home Gesture Line Indicator (Only in Phone Mode) */}
          {isPhoneMode && (
            <div style={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 110,
              height: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.25)',
              zIndex: 45,
              pointerEvents: 'none'
            }} />
          )}
        </div>
      </div>
    </div>
  );
}
