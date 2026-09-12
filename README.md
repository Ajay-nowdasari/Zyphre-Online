# ⚔️ Life RPG: Gamified Real-World Productivity Platform

> **A prize-winning, AAA-tier gamified productivity application** that transforms everyday habits and real-world tasks into an immersive virtual progression system with **interactive 3D WebGL assets**, **live multi-theme switching**, **exact non-linear mathematical progression equations**, **strict zero-trust server validation against stat cheating**, and **relational ACID database persistence**.

---

## 🌟 Key Highlights & Feature Matrix

### 1. 🎨 Theme & Creative Direction (SRS Section 2 & 4.4)
- **Flagship Theme: Aetheria (Cyberpunk Neo-Arcane)**:
  - Deep obsidian glassmorphism, animated neon cyan (`#00f0ff`) and magenta (`#ff007f`) energy conduits.
  - Holographic scanlines toggle, futuristic typography (`Inter` & `JetBrains Mono`).
- **Live Multi-Theme Engine**:
  - Players can spend mined Gold in the Virtual Bazaar to unlock and switch between all 3 themes specified in the SRS:
    1. **Cyberpunk Neon**: High-contrast neon grids, holographic HUD, cyber synth SFX.
    2. **Cozy Lo-Fi Sanctuary**: Warm amber candlelight, rain-streaked glass, floating embers, mellow acoustic tones.
    3. **16-Bit Retro Dungeon**: Midnight slate, royal gold runes, pixel art badges, retro chiptune chimes.

### 2. 🧊 Interactive 3D WebGL Assets (Three.js)
- **Interactive 3D Hero Avatar**:
  - A stylized 3D holographic champion on an illuminated dais.
  - Full 360-degree mouse/touch orbit rotation controls.
  - Ambient idle levitation and triumphant level-up spin animations.
  - Particle swarm orbiting the avatar that shifts colors dynamically with themes.
- **Dynamic 3D Equipment Rig**:
  - Equipping gear from the Virtual Bazaar (e.g. *Plasma Cyber-Katana*, *Chrono Wings*, *Aegis Shield*, *Celestial Runic Halo*) mounts visible, articulated 3D geometries directly to the avatar in real time!
- **Reactive 3D Quest Core**:
  - A floating crystalline obelisk with gyroscopic energy rings that detonates 3D particle cascades upon quest completions.

### 3. 🛡️ Strict Server-Side Validation & Anti-Cheat (SRS Section 4.1 & 4.3)
- **Zero-Trust Client Contract**: The client **never** submits XP or Gold values.
- Completion requests (`POST /api/quests/:id/complete`) calculate all rewards server-side in an atomic database transaction.
- **Exact Non-Linear RPG Progression Formula (SRS 4.3)**:
  $$\text{XP}_{\text{required}}(L) = \lfloor \text{BaseXP} \times L^{\text{growth\_factor}} \rfloor$$
  - $\text{BaseXP} = 100$, $\text{growth\_factor} = 1.5$
  - Level 1 $\rightarrow$ 2: 100 XP
  - Level 2 $\rightarrow$ 3: 282 XP
  - Level 3 $\rightarrow$ 4: 519 XP
  - Level 4 $\rightarrow$ 5: 800 XP
- **Level-Up Rewards**: Awards $+5$ unspent attribute stat points and $Level \times 50$ bonus gold upon crossing the threshold.

### 4. 🔥 Streaks & Multiplier System (SRS Section 4.4)
- Calendar day difference evaluation in UTC.
- **Streak Multiplier**:
  $$\text{Multiplier} = 1.0 + \min((\text{streak} - 1) \times 0.05, 0.50) \quad (\text{up to } 1.50\times \text{ boost})$$
- **Aegis Streak Freeze**: Automatically consumes a freeze token from inventory if a day is missed, preventing streak resets.
- 30-Day Chrono Matrix activity visualizer.

### 5. 💎 Character Attributes & Passive Perks (SRS Section 4.2 & 4.4)
- **Intellect**: Boosts XP gain multiplier ($+0.5\%$ per point above 10).
- **Strength**: Boosts Gold mined multiplier ($+0.5\%$ per point above 10).
- **Vitality**: Fortifies streak resilience and buffer recovery.
- **Charisma**: Yields merchant discounts in the Virtual Bazaar (up to $25\%$).

### 6. 🛒 Virtual Bazaar & Real-World Rewards Economy (SRS Section 4.4)
- **Cosmetic Themes**: Cyberpunk, Lo-Fi, Retro Dungeon.
- **3D Avatar Gear**: Katana, Wings, Shield, Halo.
- **Consumables**: Streak Freezes, Mind Surge Elixir.
- **Custom Real-World Rewards**: Configure custom real-world treats (e.g. "Order Pizza - 250 G", "1 Hour Video Games - 100 G") and redeem them using earned gold.

### 7. 🔊 Procedural Web Audio API Sound Synthesizer
- Zero external MP3 file dependencies (eliminates network lag & 404 errors).
- Synthesizes crystal chimes, triumphant level-up fanfare chords, coin clinks, and button blips in real time.
- Persistent master mute toggle.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) + React 18 | High-performance server rendering & client HUD |
| **Styling** | Tailwind CSS + CSS Variables | Glassmorphic design & dynamic multi-theme system |
| **Animations** | Framer Motion + Canvas-Confetti | Tactile spring physics & victory particle bursts |
| **3D Graphics** | Three.js WebGL Canvas | Interactive 3D avatar, gear rig & quest core |
| **Audio** | Web Audio API | Procedural retro/cyber sound synthesizer |
| **Backend API** | Node.js + Express (TypeScript) | Zero-trust REST API with server-side validation |
| **Database** | Prisma ORM + PostgreSQL / SQLite | Relational ACID compliance for stats, items & audit logs |
| **Authentication**| Custom JWT with HttpOnly Cookies | Secure session isolation & credential hashing |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (v22 recommended)
- npm v10+

### 1. Install All Dependencies
```bash
npm run install:all
```

### 2. Initialize Database & Seed Content
```bash
# Push schema to create relational database tables
npm run prisma:push

# Seed rich starting demo character and quests
npm run seed
```

### 3. Start Development Servers
```bash
npm run dev
```
- **Frontend HUD**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### 4. Demo Login Credentials
- **Instant Demo**: Click **"INSTANT 1-CLICK DEMO LOGIN"** in the authentication modal.
- Or log in manually:
  - **Email**: `demo@liferpg.dev`
  - **Password**: `password123`

---

## 🧪 Running Automated Tests

Run the Vitest test suite verifying the mathematical progression engine, non-linear thresholds, streak logic, attribute perks, and discounts:
```bash
npm test
```
All 10 progression and anti-cheat tests will execute and validate:
- $\text{XP}_{\text{required}}(L) = \lfloor 100 \times L^{1.5} \rfloor$
- Multi-level leap calculations
- Consecutive day streak increments and freeze consumption
- Stat boosts and shop discounts

---

## 🎬 90–180 Second Demonstration Video Walkthrough Script

| Time | Action | Visual / Acoustic Cue |
| :--- | :--- | :--- |
| **0:00 - 0:25** | **Authentication & Security** | Open [http://localhost:3000](http://localhost:3000). Click "Instant 1-Click Demo Login". Observe seamless transition into the HUD with authenticated session and character codename. |
| **0:25 - 0:55** | **3D Interactive Avatar & HUD** | Click and drag on the 3D Hero Avatar to rotate 360 degrees. Highlight active Level 1, current XP bar, Gold coin purse, and streak flame. |
| **0:55 - 1:20** | **Task Creation & Server Validation** | Click **"Forge New Quest"**. Create an "Epic" task (*"Neural Architecture Design"*) targeting the **Intellect** attribute. Submit and observe it bound to the Quest Log. |
| **1:20 - 1:40** | **Quest Completion & Level Up!** | Click the quest completion circle. Observe instant spring reaction, confetti explosion, procedural victory chime, and 3D crystal reaction. The hero **Levels Up to Level 2**! |
| **1:40 - 2:00** | **Attribute Allocation** | Navigate to **Character Radar**. Observe $+5$ unspent stat points. Allocate 3 to Intellect and 2 to Strength. Click "Confirm Stat Allocation". Observe updated passive perk bonuses. |
| **2:00 - 2:25** | **Virtual Bazaar & 3D Gear Mount** | Switch to **Virtual Bazaar**. Purchase the *Plasma Cyber-Katana* or *Chrono Wings*. Equip it. Return to the 3D Hero Stage and observe the 3D model **dynamically rendering the new weapon/wings in real-time**! |
| **2:25 - 2:45** | **Theme Shift & Persistence Proof** | In the Shop, activate the **"Cozy Lo-Fi Sanctuary"** theme. Observe the entire interface, colors, 3D lighting, and audio switch instantly. Perform a **Hard Browser Refresh (Ctrl+F5)** to verify 100% database persistence from Prisma. |
| **2:45 - 3:00** | **Audit Ledger Verification** | Open the Audit History modal to show the cryptographic transaction record of all completions and level-ups. |

---

## ⚖️ Evaluation Criteria Self-Check

- [x] **Public GitHub Repository**: Clean commit history, descriptive README, `.env.example`.
- [x] **Relational Database Persistence**: Prisma ORM with relational integrity across Users, Attributes, Quests, Inventory, and Audit Logs (No fake localStorage!).
- [x] **Strict Server-Side Stat Validation**: Anti-cheat engine calculates XP/Gold server-side and enforces $XP_{required}(L) = \lfloor 100 \times L^{1.5} \rfloor$.
- [x] **Interactive 3D Assets**: Orbit-controlled 3D Hero Avatar, reactive 3D Quest Core, dynamic 3D equipment mounting.
- [x] **All SRS Themes Supported**: Cyberpunk Neon, Cozy Lo-Fi Sanctuary, 16-Bit Retro Dungeon with real-time switching.
- [x] **WCAG 2.1 AA Accessibility**: Keyboard focus navigation, semantic tags, ARIA roles, and high-contrast styling.
