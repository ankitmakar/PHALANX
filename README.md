# 🛡️ PHALANX — Intelligent Call-Bombing & Flood Protection System

[![Status](https://img.shields.io/badge/Status-MVP%20%2F%20Engineering%20Baseline-success)](#)
[![Platform](https://img.shields.io/badge/Platform-Android--First%20%7C%20Web%20Prototype-cyan)](#)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device%20Local-10b981)](#)
[![PRD](https://img.shields.io/badge/PRD%20Compliance-v1.0%20(FR--01%20to%20FR--10)-blue)](#)

> **PHALANX** is an Android-first personal call-behavior defense layer that identifies abnormal incoming call bursts (call bombing / call floods) in real time, preserves access to legitimate callers (trusted & saved contacts), and enforces configurable, explainable policies.

---

## ⚡ Key Highlights & Features

### 1. 🛡️ Real-Time Shield & Telemetry (FR-01, FR-02, FR-07)
* **Live Radar & Visual Pulse**: High-impact security shield indicating active defense state, attack mitigation alerts, and cooldown countdowns.
* **Rolling 60-Second Sliding Window**: FIFO time-bounded queue tracking call arrival frequencies against user thresholds.
* **Mode Selector**:
  * **Monitor**: Passive detection & logging without call interference.
  * **Balanced (Default)**: Automatically silences or shunts high-confidence bursts.
  * **Strict**: Aggressively terminates repeated unknown calls.
* **Emergency Override Kill-Switch (FR-07)**: Instant 1-tap fail-safe control to temporarily or indefinitely pause all rules.

### 2. 💣 Interactive Call-Bombing Simulation Lab (Burst Lab)
* **Aggressive Call Bomb**: Simulates 6 rapid calls in 8s from unknown numbers.
* **Distributed Botnet Flood**: Simulates rotating unknown numbers within 10s.
* **Family Emergency VIP Test**: Verifies that 4 rapid calls from a trusted contact ("Mom") always bypass blocking.
* **Delivery Partner Spike**: Tests moderate escalation for saved contacts (Swiggy / Amazon).
* **Custom Call Injector**: Configure target number, call count (1–10), and delay intervals.

### 3. ⚙️ Deterministic Policy Engine (FR-04, FR-05, FR-08)
* Configurable burst thresholds (e.g., 3 calls in 60s for unknown callers).
* Safe escalation paths: `ALLOW` → `ALERT` → `SILENCE` → `BLOCK_REJECT`.
* Cooldown timers preventing repeated interruption loops.

### 4. 👥 Trusted Contacts Management (FR-03, Section 10)
* VIP priority classification guaranteeing immunity from accidental aggressive blocking.
* On-device phone number masking (`+91 98*** **210`) and deterministic salted SHA-256 identifier hashing.
* Direct in-row test calling and quick promotion.

### 5. 🔍 Explainability & Audit Forensics (FR-06, FR-09, FR-10)
* Every automated decision is backed by a human-readable reason and machine reason code:
  * `BURST_UNKNOWN_THRESHOLD_EXCEEDED`
  * `COOLDOWN_ACTIVE_SUPPRESSED`
  * `TRUSTED_PRIORITY_BYPASS`
  * `SAVED_BURST_THRESHOLD_TRIGGERED`
  * `EMERGENCY_OVERRIDE_ACTIVE`
* **Export Forensic Report**: Download sanitized JSON logs for reporting to carriers or authorities.

### 6. 🔒 100% Local-First Privacy (Section 17)
* Zero cloud server dependency.
* Raw phone numbers are masked and hashed before local persistence.
* Configurable auto-pruning retention policy (default: 24 hours).

---

## 📱 Dual View Experience
Toggle between:
* 📱 **Mobile Phone View**: Simulated Google Pixel / Android 15 device container with status bar and gesture navigation.
* 💻 **Full Dashboard View**: High-resolution wide-screen security monitoring layout.

---

## 🚀 Running Locally

### Development Server
```bash
npm install
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### Run Automated Policy Verification Suite
```bash
node test_engine.js
```
Runs 24 automated unit tests verifying FR-01 through FR-10.

### Build Production Bundle
```bash
npm run build
```

---

## 🏛️ System Architecture

```
[Incoming Call Event] (Android Telecom / Simulated)
          │
          ▼
[Event Normalizer & Hasher] (Masks digits & generates local hash)
          │
          ▼
[Category Classifier] (TRUSTED / SAVED / UNKNOWN / BLOCKED)
          │
          ▼
[Rolling Window Manager] (FIFO queue, prunes expired timestamps)
          │
          ▼
[Policy Engine & Cooldown] (Evaluates frequency against thresholds)
          │
          ▼
[Decision Engine] (ALLOW / ALERT / SILENCE / BLOCK_REJECT)
          │
          ▼
[Action Adapter & HUD] (Visual Heads-Up banner, Web Audio ring/block cues)
          │
          ▼
[Local Forensics Store] (Minimal metadata audit history, 24h retention)
```

---

## 📄 License & Safety
PHALANX is a purely defensive personal security layer designed to mitigate harassment and call flooding.
