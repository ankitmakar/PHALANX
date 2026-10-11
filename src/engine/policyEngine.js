// PHALANX - Policy Engine & Call Burst Security Core
// Compliant with PRD v1.0 (FR-01 to FR-10)

export const CALLER_CATEGORIES = {
  TRUSTED: 'TRUSTED',
  SAVED: 'SAVED',
  UNKNOWN: 'UNKNOWN',
  BLOCKED: 'BLOCKED'
};

export const ACTIONS = {
  ALLOW: 'ALLOW',
  ALERT: 'ALERT',
  SILENCE: 'SILENCE',
  BLOCK_REJECT: 'BLOCK_REJECT'
};

export const PROTECTION_MODES = {
  MONITOR: 'MONITOR',
  BALANCED: 'BALANCED',
  STRICT: 'STRICT'
};

export const DEFAULT_SETTINGS = {
  protectionMode: PROTECTION_MODES.BALANCED,
  emergencyOverride: {
    enabled: false,
    until: null // timestamp or null for indefinite
  },
  rules: {
    [CALLER_CATEGORIES.UNKNOWN]: {
      threshold: 3, // 3 calls
      windowSeconds: 60, // in 60s
      action: ACTIONS.SILENCE,
      cooldownSeconds: 60
    },
    [CALLER_CATEGORIES.SAVED]: {
      threshold: 5,
      windowSeconds: 60,
      action: ACTIONS.ALERT,
      cooldownSeconds: 60
    },
    [CALLER_CATEGORIES.TRUSTED]: {
      threshold: 8,
      windowSeconds: 60,
      action: ACTIONS.ALLOW,
      alertOnExtreme: true,
      cooldownSeconds: 30
    }
  },
  privacy: {
    historyRetentionHours: 24,
    maskPhoneNumbers: true,
    telemetryConsent: false
  },
  soundEnabled: true
};

export const DEFAULT_CONTACTS = [
  { id: 'c1', name: 'Mom (Personal)', number: '+91 98200 11223', category: CALLER_CATEGORIES.TRUSTED, avatarColor: '#10B981' },
  { id: 'c2', name: 'Dr. Sharma (Family Doc)', number: '+91 98111 22334', category: CALLER_CATEGORIES.TRUSTED, avatarColor: '#06B6D4' },
  { id: 'c3', name: 'Swiggy / Delivery Partner', number: '+91 80456 78901', category: CALLER_CATEGORIES.SAVED, avatarColor: '#F59E0B' },
  { id: 'c4', name: 'HDFC Bank Alert Desk', number: '+91 22616 06161', category: CALLER_CATEGORIES.SAVED, avatarColor: '#8B5CF6' },
  { id: 'c5', name: 'Rohan (Colleague)', number: '+91 99887 76655', category: CALLER_CATEGORIES.SAVED, avatarColor: '#3B82F6' },
  { id: 'c6', name: 'Spam Telemarketing Agent', number: '+91 14092 34567', category: CALLER_CATEGORIES.BLOCKED, avatarColor: '#EF4444' }
];

// Utility: Normalize phone number
export function normalizePhoneNumber(rawNumber) {
  if (!rawNumber) return '+0000000000';
  let cleaned = String(rawNumber).replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

// Utility: Mask phone number for zero privacy leakage (Section 17)
export function maskPhoneNumber(phone) {
  const norm = normalizePhoneNumber(phone);
  if (norm.length <= 6) return norm.replace(/\d/g, '*');
  const countryCode = norm.slice(0, 3);
  const start = norm.slice(3, 5);
  const end = norm.slice(-3);
  return `${countryCode} ${start}*** **${end}`;
}

// Utility: Fast deterministic string hash for local correlation
export function hashCaller(phone) {
  const norm = normalizePhoneNumber(phone);
  let hash = 0x811c9dc5;
  for (let i = 0; i < norm.length; i++) {
    hash ^= norm.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return '0x' + (hash >>> 0).toString(16).padStart(8, '0');
}

// Policy Engine Class
export class PhalanxPolicyEngine {
  constructor() {
    this.rollingEvents = []; // Array of recent call events
    this.activeCooldowns = new Map(); // callerHash -> expireTimestamp
    this.loadState();
  }

  loadState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedSettings = window.localStorage.getItem('phalanx_settings_v1');
        this.settings = savedSettings ? JSON.parse(savedSettings) : JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        
        const savedContacts = window.localStorage.getItem('phalanx_contacts_v1');
        this.contacts = savedContacts ? JSON.parse(savedContacts) : JSON.parse(JSON.stringify(DEFAULT_CONTACTS));
        
        const savedHistory = window.localStorage.getItem('phalanx_history_v1');
        this.history = savedHistory ? JSON.parse(savedHistory) : [];
      } else {
        this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        this.contacts = JSON.parse(JSON.stringify(DEFAULT_CONTACTS));
        this.history = [];
      }
      
      this.pruneHistory();
    } catch (e) {
      this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      this.contacts = JSON.parse(JSON.stringify(DEFAULT_CONTACTS));
      this.history = [];
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('phalanx_settings_v1', JSON.stringify(this.settings));
      }
    } catch (e) {}
  }

  saveContacts(newContacts) {
    this.contacts = newContacts;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('phalanx_contacts_v1', JSON.stringify(this.contacts));
      }
    } catch (e) {}
  }

  saveHistory() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('phalanx_history_v1', JSON.stringify(this.history.slice(0, 100)));
      }
    } catch (e) {}
  }

  clearHistory() {
    this.history = [];
    this.rollingEvents = [];
    this.activeCooldowns.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('phalanx_history_v1');
      }
    } catch (e) {}
  }

  pruneHistory() {
    const retentionMs = (this.settings.privacy?.historyRetentionHours || 24) * 60 * 60 * 1000;
    const cutoff = Date.now() - retentionMs;
    this.history = this.history.filter(item => item.timestamp >= cutoff);
  }

  // Classify a number against known contacts list
  classifyCaller(rawNumber) {
    const normalized = normalizePhoneNumber(rawNumber);
    const match = this.contacts.find(c => normalizePhoneNumber(c.number) === normalized);
    if (match) {
      return {
        category: match.category,
        contactName: match.name,
        contactId: match.id
      };
    }
    return {
      category: CALLER_CATEGORIES.UNKNOWN,
      contactName: 'Unknown Caller',
      contactId: null
    };
  }

  // Check if emergency override is active
  isEmergencyOverrideActive() {
    if (!this.settings.emergencyOverride?.enabled) return false;
    const until = this.settings.emergencyOverride.until;
    if (until && Date.now() > until) {
      // Expired
      this.settings.emergencyOverride.enabled = false;
      this.settings.emergencyOverride.until = null;
      this.saveSettings(this.settings);
      return false;
    }
    return true;
  }

  setEmergencyOverride(enabled, durationMinutes = null) {
    const until = enabled && durationMinutes ? Date.now() + durationMinutes * 60 * 1000 : null;
    this.settings.emergencyOverride = { enabled, until };
    this.saveSettings(this.settings);
    return { enabled, until };
  }

  // Prune rolling events older than max window
  pruneRollingEvents(currentTime = Date.now()) {
    const maxWindow = 300 * 1000; // 5 minutes max retain
    this.rollingEvents = this.rollingEvents.filter(e => currentTime - e.timestamp <= maxWindow);

    // Prune expired cooldowns
    for (const [hash, expireAt] of this.activeCooldowns.entries()) {
      if (currentTime >= expireAt) {
        this.activeCooldowns.delete(hash);
      }
    }
  }

  // Evaluates an incoming call event (FR-01 to FR-06)
  evaluateIncomingCall(rawNumber, options = {}) {
    const now = options.timestamp || Date.now();
    this.pruneRollingEvents(now);

    const normNumber = normalizePhoneNumber(rawNumber);
    const callerHash = hashCaller(normNumber);
    const callerMasked = maskPhoneNumber(normNumber);
    const { category, contactName } = this.classifyCaller(normNumber);

    const overrideActive = this.isEmergencyOverrideActive();
    const mode = this.settings.protectionMode;

    // Check emergency override fail-safe first (FR-07)
    if (overrideActive) {
      const decision = {
        id: 'det_' + Math.random().toString(36).substring(2, 9),
        timestamp: now,
        callerHash,
        callerMasked,
        callerCategory: category,
        contactName,
        action: ACTIONS.ALLOW,
        isBurst: false,
        reasonCode: 'EMERGENCY_OVERRIDE_ACTIVE',
        reasonExplanation: 'Emergency Override is enabled. All call protection policies bypassed.',
        callsInWindow: 1,
        windowSeconds: 60,
        threshold: 0,
        cooldownRemainingSeconds: 0,
        protectionMode: mode
      };
      this.recordEvent(decision);
      return decision;
    }

    // Check if category is hard-blocked
    if (category === CALLER_CATEGORIES.BLOCKED) {
      const decision = {
        id: 'det_' + Math.random().toString(36).substring(2, 9),
        timestamp: now,
        callerHash,
        callerMasked,
        callerCategory: category,
        contactName,
        action: ACTIONS.BLOCK_REJECT,
        isBurst: false,
        reasonCode: 'MANUAL_BLACKLIST_BLOCKED',
        reasonExplanation: 'Caller is explicitly listed on device block list.',
        callsInWindow: 1,
        windowSeconds: 60,
        threshold: 1,
        cooldownRemainingSeconds: 0,
        protectionMode: mode
      };
      this.recordEvent(decision);
      return decision;
    }

    // Check active cooldown for this caller
    const cooldownExpiresAt = this.activeCooldowns.get(callerHash);
    const inCooldown = cooldownExpiresAt && cooldownExpiresAt > now;
    const cooldownRemaining = inCooldown ? Math.ceil((cooldownExpiresAt - now) / 1000) : 0;

    // Retrieve rule for this caller category
    const rule = this.settings.rules[category] || this.settings.rules[CALLER_CATEGORIES.UNKNOWN];
    const windowMs = (rule.windowSeconds || 60) * 1000;
    const threshold = rule.threshold || 3;

    // Count calls from this caller within rule's window
    const recentCalls = this.rollingEvents.filter(
      e => e.callerHash === callerHash && (now - e.timestamp) <= windowMs
    );
    const callsInWindow = recentCalls.length + 1; // including current event

    // Record this call in rolling events
    this.rollingEvents.push({
      timestamp: now,
      callerHash,
      callerMasked,
      category
    });

    let action = ACTIONS.ALLOW;
    let isBurst = false;
    let reasonCode = 'NORMAL_CALL_PERMITTED';
    let reasonExplanation = 'Call frequency within normal parameters.';
    let cooldownTriggered = false;

    // Determine Burst status
    if (inCooldown) {
      isBurst = true;
      action = mode === PROTECTION_MODES.STRICT ? ACTIONS.BLOCK_REJECT : rule.action;
      reasonCode = 'COOLDOWN_ACTIVE_SUPPRESSED';
      reasonExplanation = `Caller under active protection cooldown (${cooldownRemaining}s remaining). Repeated interruption mitigated.`;
    } else if (callsInWindow >= threshold) {
      isBurst = true;

      // Handle based on Caller Category & Mode
      if (category === CALLER_CATEGORIES.TRUSTED) {
        // Trusted contact logic (Section 10)
        if (rule.alertOnExtreme && callsInWindow >= threshold) {
          action = ACTIONS.ALERT;
          reasonCode = 'TRUSTED_EXTREME_BURST_ALERT';
          reasonExplanation = `Trusted contact (${contactName}) placed ${callsInWindow} rapid calls in ${rule.windowSeconds}s. Permitted with urgent priority alert.`;
        } else {
          action = ACTIONS.ALLOW;
          reasonCode = 'TRUSTED_PRIORITY_BYPASS';
          reasonExplanation = `Trusted VIP contact (${contactName}). Policy prioritizes access over burst suppression.`;
        }
      } else if (category === CALLER_CATEGORIES.SAVED) {
        // Saved contact logic
        action = rule.action || ACTIONS.ALERT;
        reasonCode = 'SAVED_BURST_THRESHOLD_TRIGGERED';
        reasonExplanation = `Saved contact (${contactName}) reached burst threshold (${callsInWindow}/${threshold} calls in ${rule.windowSeconds}s). Safe escalation applied.`;
        
        // Cooldown trigger if non-allow action
        if (action !== ACTIONS.ALLOW) {
          this.activeCooldowns.set(callerHash, now + (rule.cooldownSeconds * 1000));
          cooldownTriggered = true;
        }
      } else {
        // Unknown caller logic (Call bombing primary target)
        if (mode === PROTECTION_MODES.MONITOR) {
          action = ACTIONS.ALLOW;
          reasonCode = 'MONITOR_MODE_BURST_DETECTED';
          reasonExplanation = `Call-bombing burst pattern detected (${callsInWindow} calls in ${rule.windowSeconds}s). Logged only (Monitor Mode active).`;
        } else if (mode === PROTECTION_MODES.STRICT) {
          action = ACTIONS.BLOCK_REJECT;
          reasonCode = 'STRICT_BURST_TERMINATED';
          reasonExplanation = `Aggressive call-burst detected (${callsInWindow} calls in ${rule.windowSeconds}s from unknown caller). Call terminated immediately.`;
          this.activeCooldowns.set(callerHash, now + (rule.cooldownSeconds * 1000));
          cooldownTriggered = true;
        } else {
          // Balanced mode
          action = rule.action || ACTIONS.SILENCE;
          reasonCode = 'BURST_UNKNOWN_THRESHOLD_EXCEEDED';
          reasonExplanation = `Potential call flood detected: ${callsInWindow} calls within ${rule.windowSeconds}s from unverified number. Action: ${action}.`;
          this.activeCooldowns.set(callerHash, now + (rule.cooldownSeconds * 1000));
          cooldownTriggered = true;
        }
      }
    } else {
      // Not crossing threshold
      if (category === CALLER_CATEGORIES.TRUSTED) {
        action = ACTIONS.ALLOW;
        reasonCode = 'TRUSTED_CALL_ALLOWED';
        reasonExplanation = `Trusted VIP contact (${contactName}) verified.`;
      } else if (category === CALLER_CATEGORIES.SAVED) {
        action = ACTIONS.ALLOW;
        reasonCode = 'SAVED_CONTACT_NORMAL';
        reasonExplanation = `Saved contact (${contactName}) call ${callsInWindow}/${threshold}.`;
      } else {
        action = ACTIONS.ALLOW;
        reasonCode = 'UNKNOWN_FIRST_RING_ALLOWED';
        reasonExplanation = `Unknown caller first contact (${callsInWindow}/${threshold} in rolling window).`;
      }
    }

    const decision = {
      id: 'det_' + Math.random().toString(36).substring(2, 9),
      timestamp: now,
      callerHash,
      callerMasked,
      callerCategory: category,
      contactName,
      action,
      isBurst,
      reasonCode,
      reasonExplanation,
      callsInWindow,
      windowSeconds: rule.windowSeconds,
      threshold,
      cooldownTriggered,
      cooldownRemainingSeconds: cooldownTriggered ? rule.cooldownSeconds : cooldownRemaining,
      protectionMode: mode
    };

    this.recordEvent(decision);
    return decision;
  }

  recordEvent(decision) {
    this.history.unshift(decision);
    if (this.history.length > 200) {
      this.history.pop();
    }
    this.saveHistory();
  }

  getMetrics() {
    const totalCalls = this.history.length;
    const burstsMitigated = this.history.filter(
      h => h.isBurst && (h.action === ACTIONS.SILENCE || h.action === ACTIONS.BLOCK_REJECT)
    ).length;
    const allowed = this.history.filter(h => h.action === ACTIONS.ALLOW).length;
    const alerted = this.history.filter(h => h.action === ACTIONS.ALERT).length;
    const activeCooldownsCount = this.activeCooldowns.size;

    return {
      totalCalls,
      burstsMitigated,
      allowed,
      alerted,
      activeCooldownsCount,
      overrideActive: this.isEmergencyOverrideActive(),
      protectionMode: this.settings.protectionMode
    };
  }

  // Rolling window statistics for real-time visualization
  getRollingWindowEvents(windowSeconds = 60) {
    const now = Date.now();
    const cutoff = now - windowSeconds * 1000;
    return this.rollingEvents.filter(e => e.timestamp >= cutoff);
  }
}

// Singleton engine instance
export const engineInstance = new PhalanxPolicyEngine();
