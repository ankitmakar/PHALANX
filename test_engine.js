// Automated Test Suite for PHALANX Policy Engine
// Verifies FR-01 through FR-10 according to PRD v1.0 specifications

import { 
  PhalanxPolicyEngine, 
  CALLER_CATEGORIES, 
  ACTIONS, 
  PROTECTION_MODES, 
  hashCaller, 
  maskPhoneNumber 
} from './src/engine/policyEngine.js';

console.log('🧪 Starting PHALANX Policy Engine Verification Suite...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Test Privacy Redaction & Hashing (FR-10, Section 17)
console.log('[Test Suite 1: Privacy Redaction & Identifier Hashing]');
const sampleNum = '+91 98765 43210';
const masked = maskPhoneNumber(sampleNum);
const hash = hashCaller(sampleNum);
assert(masked === '+91 98*** **210', `Masked format hides middle digits: got "${masked}"`);
assert(hash.startsWith('0x') && hash.length === 10, `Deterministic hash format: got "${hash}"`);
assert(!masked.includes('765 43'), 'Raw phone number is never exposed in output');

// 2. Test Caller Classification (FR-03)
console.log('\n[Test Suite 2: Contact Classification]');
const engine = new PhalanxPolicyEngine();
// Clean state for test
engine.history = [];
engine.rollingEvents = [];
engine.activeCooldowns.clear();

const momClassification = engine.classifyCaller('+91 98200 11223');
assert(momClassification.category === CALLER_CATEGORIES.TRUSTED, 'Identifies mom as TRUSTED');

const swiggyClassification = engine.classifyCaller('+91 80456 78901');
assert(swiggyClassification.category === CALLER_CATEGORIES.SAVED, 'Identifies delivery partner as SAVED');

const strangerClassification = engine.classifyCaller('+91 99999 11111');
assert(strangerClassification.category === CALLER_CATEGORIES.UNKNOWN, 'Identifies unlisted number as UNKNOWN');

// 3. Test Unknown Caller Burst Detection (FR-02, FR-04, FR-05, FR-06)
console.log('\n[Test Suite 3: Call-Burst Detection on Unknown Spammer]');
const spammerNum = '+91 91234 56789';
const baseTime = Date.now();

// Call 1: Normal first call
const call1 = engine.evaluateIncomingCall(spammerNum, { timestamp: baseTime });
assert(call1.action === ACTIONS.ALLOW, 'Call 1/3 is ALLOWED');
assert(!call1.isBurst, 'Call 1 is not flagged as burst');

// Call 2: Second call within 10s
const call2 = engine.evaluateIncomingCall(spammerNum, { timestamp: baseTime + 10000 });
assert(call2.action === ACTIONS.ALLOW, 'Call 2/3 is ALLOWED');
assert(!call2.isBurst, 'Call 2 is not flagged as burst');

// Call 3: Third call within 20s -> Burst threshold reached!
const call3 = engine.evaluateIncomingCall(spammerNum, { timestamp: baseTime + 20000 });
assert(call3.isBurst, 'Call 3/3 IS flagged as burst');
assert(call3.action === ACTIONS.SILENCE, `Call 3 action is SILENCE (got ${call3.action})`);
assert(call3.reasonCode === 'BURST_UNKNOWN_THRESHOLD_EXCEEDED', `Reason code: ${call3.reasonCode}`);
assert(call3.cooldownTriggered, 'Cooldown was activated for caller');

// Call 4: Fourth call while in cooldown (suppression check)
const call4 = engine.evaluateIncomingCall(spammerNum, { timestamp: baseTime + 30000 });
assert(call4.isBurst, 'Call 4 flagged as burst');
assert(call4.reasonCode === 'COOLDOWN_ACTIVE_SUPPRESSED', `Call 4 suppressed by Cooldown: ${call4.reasonCode}`);

// 4. Test Trusted Contact VIP Exemption (Section 10)
console.log('\n[Test Suite 4: Trusted Contact (VIP) Exemption]');
const momNum = '+91 98200 11223';
// Rapid 3 calls from Mom
engine.evaluateIncomingCall(momNum, { timestamp: baseTime + 1000 });
engine.evaluateIncomingCall(momNum, { timestamp: baseTime + 2000 });
const momCall3 = engine.evaluateIncomingCall(momNum, { timestamp: baseTime + 3000 });
assert(momCall3.action === ACTIONS.ALLOW, `Mom call 3 is ALLOWED: got ${momCall3.action}`);
assert(momCall3.reasonCode.includes('TRUSTED'), `Reason confirms trusted bypass: ${momCall3.reasonCode}`);

// 5. Test Emergency Override (FR-07)
console.log('\n[Test Suite 5: Emergency Override Kill-Switch]');
engine.setEmergencyOverride(true, 15);
assert(engine.isEmergencyOverrideActive(), 'Emergency Override is active');
const spammerCallDuringOverride = engine.evaluateIncomingCall(spammerNum, { timestamp: baseTime + 40000 });
assert(spammerCallDuringOverride.action === ACTIONS.ALLOW, 'Spammer call during override is ALLOWED');
assert(spammerCallDuringOverride.reasonCode === 'EMERGENCY_OVERRIDE_ACTIVE', 'Reason explicitly states override active');

engine.setEmergencyOverride(false);
assert(!engine.isEmergencyOverrideActive(), 'Emergency Override can be disengaged');

// 6. Test Metrics (FR-09)
console.log('\n[Test Suite 6: Telemetry & Metrics]');
const metrics = engine.getMetrics();
assert(metrics.totalCalls > 0, `Total calls tracked: ${metrics.totalCalls}`);
assert(metrics.burstsMitigated >= 1, `Bursts mitigated count: ${metrics.burstsMitigated}`);

console.log(`\n========================================`);
console.log(`Summary: ${passedTests}/${totalTests} tests passed successfully.`);
console.log(`========================================\n`);
