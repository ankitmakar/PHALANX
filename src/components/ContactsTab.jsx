import React, { useState } from 'react';
import { Users, UserPlus, Star, Shield, Phone, Search, Trash2, Key, Check, AlertCircle } from 'lucide-react';
import { CALLER_CATEGORIES, hashCaller, maskPhoneNumber } from '../engine/policyEngine';

export default function ContactsTab({ engine, onRefresh, onSimulateCall }) {
  const [contacts, setContacts] = useState([...engine.contacts]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newCategory, setNewCategory] = useState(CALLER_CATEGORIES.TRUSTED);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.number.includes(search);
    const matchesFilter = filter === 'ALL' || c.category === filter;
    return matchesSearch && matchesFilter;
  });

  const handleToggleTrusted = (contactId) => {
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        const nextCategory = c.category === CALLER_CATEGORIES.TRUSTED 
          ? CALLER_CATEGORIES.SAVED 
          : CALLER_CATEGORIES.TRUSTED;
        return { ...c, category: nextCategory };
      }
      return c;
    });
    setContacts(updated);
    engine.saveContacts(updated);
    onRefresh();
  };

  const handleDelete = (contactId) => {
    const updated = contacts.filter(c => c.id !== contactId);
    setContacts(updated);
    engine.saveContacts(updated);
    onRefresh();
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newNumber.trim()) return;

    const newContact = {
      id: 'c_' + Date.now(),
      name: newName.trim(),
      number: newNumber.trim(),
      category: newCategory,
      avatarColor: newCategory === CALLER_CATEGORIES.TRUSTED ? '#10B981' : '#3B82F6'
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);
    engine.saveContacts(updated);
    setNewName('');
    setNewNumber('');
    setShowAddForm(false);
    onRefresh();
  };

  const handleTestCall = (contact) => {
    const decision = engine.evaluateIncomingCall(contact.number);
    onSimulateCall(decision);
    onRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '18px 20px',
        background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.12) 0%, rgba(13, 18, 32, 0.95) 70%)',
        border: '1px solid rgba(16, 185, 129, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Trusted Contacts</h2>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Manage VIP and saved contacts to guarantee immunity from accidental blocking.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
            style={{ padding: '7px 12px', fontSize: '0.76rem' }}
          >
            <UserPlus size={14} />
            <span>Add VIP</span>
          </button>
        </div>
      </div>

      {/* Add Contact Accordion Form */}
      {showAddForm && (
        <form onSubmit={handleAddContact} className="glass-panel" style={{
          padding: '16px',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#00f2fe' }}>
            Register New Contact Policy
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dad / Home"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98..."
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              Trust Classification
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: CALLER_CATEGORIES.TRUSTED, label: 'VIP Trusted (Guaranteed Bypass)' },
                { id: CALLER_CATEGORIES.SAVED, label: 'Saved Contact' },
                { id: CALLER_CATEGORIES.BLOCKED, label: 'Hard Blocked' }
              ].map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setNewCategory(cat.id)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 8,
                    fontSize: '0.74rem',
                    fontWeight: newCategory === cat.id ? 700 : 500,
                    background: newCategory === cat.id ? 'rgba(0, 242, 254, 0.2)' : 'rgba(0,0,0,0.3)',
                    color: newCategory === cat.id ? '#00f2fe' : '#94a3b8',
                    border: `1px solid ${newCategory === cat.id ? '#00f2fe' : 'rgba(255,255,255,0.08)'}`
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.74rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.74rem' }}
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '8px 12px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search contacts or numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.8rem',
              width: '100%'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['ALL', 'TRUSTED', 'SAVED', 'BLOCKED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 10px',
                borderRadius: 10,
                fontSize: '0.7rem',
                fontWeight: filter === f ? 700 : 500,
                background: filter === f ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0,0,0,0.25)',
                color: filter === f ? '#fff' : '#64748b',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredContacts.map(c => {
          const isTrusted = c.category === CALLER_CATEGORIES.TRUSTED;
          const isBlocked = c.category === CALLER_CATEGORIES.BLOCKED;
          const callerHash = hashCaller(c.number);
          const masked = maskPhoneNumber(c.number);

          return (
            <div
              key={c.id}
              className="glass-panel"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                border: isTrusted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: isTrusted ? 'rgba(16, 185, 129, 0.2)' : isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  color: isTrusted ? '#10b981' : isBlocked ? '#ef4444' : '#60a5fa',
                  flexShrink: 0
                }}>
                  {c.name.charAt(0)}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </h4>
                    <span className={`badge-category badge-${c.category.toLowerCase()}`}>
                      {c.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{masked}</span>
                    <span>•</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }} title="On-device SHA-256 salted identifier">
                      {callerHash}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => handleToggleTrusted(c.id)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: isTrusted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isTrusted ? '#10b981' : '#64748b',
                    border: `1px solid ${isTrusted ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`
                  }}
                  title={isTrusted ? 'Demote from VIP Trusted' : 'Promote to VIP Trusted (Guaranteed Bypass)'}
                >
                  <Star size={14} fill={isTrusted ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={() => handleTestCall(c)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: 'rgba(0, 242, 254, 0.12)',
                    color: '#00f2fe',
                    border: '1px solid rgba(0, 242, 254, 0.25)'
                  }}
                  title="Simulate Call from this contact"
                >
                  <Phone size={14} />
                </button>

                <button
                  onClick={() => handleDelete(c.id)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                  title="Remove contact"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
