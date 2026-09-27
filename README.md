# 🛢️ Baghewala Digital Twin — AI-Powered CSS + SRP Operations Platform

> **v1.0.0 (SIMULATED)** · A full-stack petroleum engineering digital twin for the **Baghewala Heavy Oil Field**, India — built with React, Three.js, and a physics-inspired simulation engine.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Pages & Modules](#-pages--modules)
- [Simulation Engine](#-simulation-engine)
- [State Management](#-state-management)
- [3D Digital Twin Components](#-3d-digital-twin-components)
- [Data & Types](#-data--types)
- [Authentication](#-authentication)
- [Getting Started](#-getting-started)
- [Environment & Configuration](#-environment--configuration)
- [Scripts](#-scripts)
- [Design System](#-design-system)
- [Known Limitations](#-known-limitations)

---

## 🔍 Overview

**Baghewala Digital Twin** is an advanced petroleum engineering web application that models and visualizes the **Cyclic Steam Stimulation (CSS)** and **Sucker Rod Pump (SRP)** operations of the Baghewala Heavy Oil Field in Rajasthan, India (operated by Oil India Limited).

The platform combines:
- A **physics-inspired simulation engine** using Andrade viscosity reduction, steam enthalpy equations, and kinematic pump displacement models
- An **interactive 3D digital twin** rendered with WebGL (Three.js + React Three Fiber)
- A **multi-page engineering dashboard** with real-time KPIs, telemetry charts, and what-if scenario analysis

This is a **prototype/demo application** with simulated data — all telemetry values are computed deterministically from the underlying simulation engine, not live SCADA feeds.

---

## ✨ Key Features

### 🎛️ Interactive Simulation Engine
- Adjustable CSS parameters: steam injection rate, temperature, soak duration
- SRP parameters: pump speed (SPM), stroke length, fluid level, pump condition
- Real-time output recalculation on every parameter change (Zustand reactive store)
- What-if scenario comparison with side-by-side results

### 🤖 AI-Optimized Recommendations
- Deterministic AI parameter optimization based on field viscosity, reservoir temperature, and pressure
- Uses viscosity ratio scaling to recommend optimal steam temperature (270–315 °C), injection rate, soak duration, and SRP speed
- Outputs expected production rate with energy consumption estimate

### 🏗️ Interactive 3D Digital Twin
- Full WebGL-rendered virtual well system (wellhead, wellbore, downhole pump, reservoir)
- Camera presets: Full Well, Surface, Wellbore, Reservoir
- CSS phase visualization: live animated steam injection particles and heat diffusion
- Clickable 3D components showing live telemetry overlay (floating panels)
- Supports dark/light theme

### 📊 Multi-Chart Analytics
- 7-day production history (oil rate area chart from SCADA stream)
- CSS cycle history: oil recovered vs. steam injected (bar chart)
- Production multi-rate comparison: oil, water, gas rates (stacked area chart)
- Radar chart for multi-objective optimization scoring
- Recharts-powered, responsive containers

### ⚠️ Alerting System
- Multi-severity alerts (info, warning, critical)
- Parameter-tagged alert descriptions with suggested corrective actions
- Acknowledge workflow

### 📑 Reports & Export
- Structured engineering report layout with KPI summaries
- CSS cycle performance table
- SRP diagnostic snapshot

### ⚙️ Configurable Settings
- Dark / Light theme toggle (persisted to CSS class on `<html>`)
- User profile management (role-based demo accounts)

---

## 🧰 Technology Stack

| Category | Technology | Version |
|---|---|---|
| **Runtime** | React | ^19.2.8 |
| **Language** | TypeScript | ~6.0.2 |
| **Build Tool** | Vite | ^8.2.2 |
| **3D Rendering** | Three.js | ^0.185.1 |
| **3D React Bridge** | @react-three/fiber | ^9.7.0 |
| **3D Helpers** | @react-three/drei | ^10.7.8 |
| **Animations** | Framer Motion | ^13.2.0 |
| **Routing** | React Router DOM | ^7.18.3 |
| **State Management** | Zustand | ^5.0.15 |
| **Charts** | Recharts | ^3.10.1 |
| **Icons** | Lucide React | ^1.40.0 |
| **CSS Framework** | Tailwind CSS v4 | ^4.3.3 |
| **Linting** | OxLint | ^1.79.0 |

---

## 📁 Project Structure

```
OILWELL/
├── index.html                     # Vite HTML entry point
├── vite.config.ts                 # Vite config (React + Tailwind plugins, port 5173)
├── tsconfig.json                  # TypeScript root config
├── tsconfig.app.json              # App TypeScript settings
├── tsconfig.node.json             # Node TypeScript settings
├── package.json                   # NPM dependencies & scripts
├── .oxlintrc.json                 # OxLint rules
│
└── src/
    ├── main.tsx                   # React DOM entry point
    ├── App.tsx                    # Root router & lazy-loaded page routes
    ├── App.css                    # Global overrides
    ├── index.css                  # CSS custom properties (design tokens)
    ├── vite-env.d.ts              # Vite type declarations
    │
    ├── pages/                     # Top-level route pages (lazy-loaded)
    │   ├── Landing.tsx            # Hero landing page (/)
    │   ├── Overview.tsx           # Main dashboard (/app/overview)
    │   ├── DigitalTwin.tsx        # 3D interactive twin (/app/digital-twin)
    │   ├── Operations.tsx         # CSS & SRP operations panel (/app/operations)
    │   ├── Simulation.tsx         # What-if & optimization (/app/simulation)
    │   ├── Reports.tsx            # Engineering reports (/app/reports)
    │   └── Settings.tsx           # App settings (/app/settings)
    │
    ├── components/
    │   ├── CinematicIntro.tsx     # Animated intro screen
    │   ├── auth/                  # Login/auth components
    │   ├── controls/
    │   │   └── SliderControl.tsx  # Reusable labeled slider input
    │   ├── journey/               # Onboarding/journey flow components
    │   ├── layout/
    │   │   ├── AppLayout.tsx      # Main shell with sidebar + header
    │   │   ├── Header.tsx         # Top bar (user info, theme toggle, telemetry bar)
    │   │   ├── Sidebar.tsx        # Left navigation
    │   │   └── TelemetryBar.tsx   # Live telemetry status strip
    │   ├── three/                 # WebGL / Three.js 3D components
    │   │   ├── DigitalTwinScene.tsx   # Main R3F Canvas scene wrapper
    │   │   ├── CameraController.tsx   # Animated camera preset transitions
    │   │   ├── WellSystem.tsx         # Composite well assembly
    │   │   ├── WellheadModel.tsx      # 3D wellhead geometry
    │   │   ├── WellboreModel.tsx      # 3D wellbore / casing column
    │   │   ├── SuckerRodModel.tsx     # Animated sucker rod string
    │   │   ├── DownholePumpModel.tsx  # Downhole pump geometry
    │   │   ├── SurfacePumpModel.tsx   # Surface pump jack model
    │   │   ├── ReservoirModel.tsx     # Reservoir layer visualization
    │   │   ├── SteamVisualization.tsx # Animated steam injection particles
    │   │   ├── HeatVisualization.tsx  # Heat map / thermal diffusion overlay
    │   │   ├── FloatingTelemetry.tsx  # 3D HUD annotation panels
    │   │   └── LandingScene.tsx       # Hero page 3D backdrop
    │   └── ui/
    │       ├── KPIWidget.tsx          # Engineering KPI card with trend indicator
    │       ├── StatusBadge.tsx        # Color-coded status label
    │       ├── SimulatedTag.tsx       # "SIMULATED" watermark badge
    │       ├── ThemeToggle.tsx        # Dark/Light toggle button
    │       ├── DynamicCursor.tsx      # Custom animated cursor
    │       └── ScenarioComparison.tsx # Side-by-side scenario diff view
    │
    ├── engine/                        # Petroleum engineering computation modules
    │   ├── petroleumEngine.ts         # Core physics engine (CSS + SRP + AI)
    │   ├── formulas.ts                # Simulation formula helpers
    │   ├── simulation.ts              # Simulation runner utilities
    │   ├── optimization.ts            # Multi-objective optimization search
    │   └── prediction.ts             # Time-series prediction generation
    │
    ├── stores/                        # Zustand global state
    │   ├── simulationStore.ts         # Core sim params, outputs, optimization state
    │   ├── authStore.ts               # Authentication & user profile
    │   ├── themeStore.ts              # Dark/Light theme state
    │   └── uiStore.ts                 # Camera mode & UI state
    │
    ├── data/                          # Static mock data & type definitions
    │   ├── types.ts                   # All TypeScript interfaces & types
    │   ├── mockAlerts.ts              # Demo alert dataset
    │   ├── mockCSS.ts                 # Demo CSS cycle history records
    │   ├── mockSensors.ts             # Production history generator
    │   └── mockWells.ts               # Well registry data
    │
    └── utils/
        ├── constants.ts               # App-wide constants (defaults, ranges, colors)
        └── formatters.ts              # Number/date formatting helpers
```

---

## 📄 Pages & Modules

### `/` — Landing Page
Animated hero page with a full-screen 3D backdrop (`LandingScene`). Entry point to the application with a cinematic introduction.

### `/app/overview` — Operations Overview
The primary engineering dashboard. Displays:
- **Well identity banner**: BGW-DEMO-01 with live CSS phase and SRP speed indicators
- **6-card KPI row**: Oil Production (bbl/d), Reservoir Temperature (°C), Steam Injection (t/cycle), Pump Efficiency (%), Energy Consumption (kWh), Equipment Risk
- **Live 3D Twin preview** (compact, full-view shortcut)
- **Operating Well Status** panel: active cycle, SRP unit speed, stroke length, dynamic fluid level
- **7-day Production History** area chart (SCADA stream telemetry)
- **CSS Thermal Cycle** oil-vs-steam bar chart (cycles #7–#14)

### `/app/digital-twin` — 3D Digital Twin Viewer
Full-viewport interactive 3D well visualization:
- **Left panel (75%)**: WebGL scene with the complete virtual well — surface pump jack, wellhead, wellbore column, downhole pump, and reservoir layers
- **Right panel (25%)**: Engineering control panel
  - **Camera presets**: Full Well, Surface, Wellbore, Reservoir
  - **CSS phase controls**: Injection / Soak / Production phase selector
  - **Parameter sliders**: Steam rate, temperature, soak duration, SRP speed, stroke length, fluid level
  - **Component inspector**: Click any 3D object to open a telemetry data popup
- **Top HUD**: Simulated telemetry tags (temperature, pressure, flow rate)

### `/app/operations` — CSS & SRP Operations
Consolidated operations monitoring dashboard:
- **CSS Operations sub-tab**: Cycle history table, steam injection parameters, phase tracking
- **SRP Operations sub-tab**: Pump dynamometer data (SPM, stroke length, pump efficiency, rod load, fluid level, motor power)
- **Analytics**: Multi-rate production trend (oil, water, gas), reservoir temperature trends
- **Alerts panel**: Active alerts with severity icons, descriptions, and acknowledge actions

### `/app/simulation` — What-If Simulation & Optimization
Engineering scenario workbench:
- **What-If Simulation**: Independently configure all 7 parameters and run a simulated scenario side-by-side with the live baseline
- **Multi-Objective Optimization**: Set weighted objectives (production 40%, steam efficiency 30%, energy efficiency 20%, equipment reliability 10%) and get top-3 ranked configurations
- **Radar Chart**: Visual comparison of optimization candidates across objectives
- **Apply to Twin**: Push optimal parameters directly to the live simulation store

### `/app/reports` — Engineering Reports
Structured PDF-style report layout with well summary, KPI snapshot, CSS cycle performance records, and SRP diagnostic data.

### `/app/settings` — Application Settings
Theme toggle (Dark/Light), user profile display (name, role, employee ID, department), and app version info.

---

## ⚙️ Simulation Engine

All calculations are deterministic and physics-inspired. Located in `src/engine/`.

### CSS Simulation (`petroleumEngine.ts`)

#### Steam Enthalpy
```
Base Enthalpy (MJ/kg) = 2.4 + ((steamTemp - 200) / 100) × 0.4 + ((steamPressure - 30) / 60) × 0.15
Heat Delivered (GJ)   = steamUsed_tons × 1000 × Enthalpy / 1000
```

#### Reservoir Temperature Rise
```
permFactor     = clamp(0.85 + (permeability / 1500) × 0.3,  0.75, 1.25)
tempRiseFactor = (heatDelivered / 220) × permFactor
tempIncrease   = clamp(65 × tempRiseFactor, 25, 145)  °C
finalTemp      = reservoirTemp + tempIncrease
```

#### Soaking & Viscosity Reduction (Andrade Model)
Optimal soak window: 72–96 hours. Over-soaking dissipates heat to the caprock.
```
soakEfficiency        = max(0.55,  1.0 - |soakHours - 72| × 0.0035)
heatRetentionPct      = 70 + soakEfficiency × 22
reducedViscosity (cP) = initViscosity × exp(−0.032 × ΔTemp × soakEfficiency)
```

#### SRP Production Rate
```
viscMobilityMult   = clamp(1200 / reducedViscosity, 0.8, 3.5)
kinDisplacement    = (srpSpeed × 14) × (strokeLength / 2.0) × (pumpEff / 100)
production (bbl/d) = clamp((kinDisplacement × 0.75 + 60) × viscMobilityMult × 0.7, 45, 480)
```

#### Energy Consumption
```
steamBoilerEnergy (kWh) = steamUsed × 78
srpMotorEnergy    (kWh) = srpSpeed × strokeLength × 3.2 × 24 × (100 / pumpEfficiency)
totalEnergy       (kWh) = steamBoilerEnergy + srpMotorEnergy
```

### AI Recommendations (`petroleumEngine.ts`)

Where `viscRatio = clamp(oilViscosity / 10000, 0, 1)`:

| Parameter | Formula | Range |
|---|---|---|
| Steam Temperature | `270 + viscRatio × 45` °C | 270–315 °C |
| Steam Injection Rate | `80 + viscRatio × 25` t/d | 80–105 t/d |
| Steam Pressure | `reservoirPressure + 28` bar | 48–75 bar |
| Steam Injection Time | `48 + viscRatio × 24` hours | 48–72 hours |
| Soaking Time | `(2.5 + viscRatio × 1.5)` days | 2.5–4.0 days |
| SRP Pump Speed | `5.5 + (1 - viscRatio) × 1.5` SPM | 5.5–7.0 SPM |

### Equipment Risk Scoring (`simulationStore.ts`)

```
riskScore = srpSpeed × 5 + (3 - strokeLength) × 10 + (100 - pumpEfficiency) × 0.5 + pumpPenalty
```

| Score | Risk Level |
|---|---|
| < 25 | 🟢 Low |
| 25–49 | 🟡 Medium |
| 50–74 | 🟠 High |
| ≥ 75 | 🔴 Critical |

Pump condition penalty: `excellent = 0`, `good = 5`, `fair = 20`, `poor = 45`

---

## 🗃️ State Management

Zustand stores are in `src/stores/`.

### `simulationStore` — Core Engineering State

| Field | Type | Default | Description |
|---|---|---|---|
| `params` | `SimulationParams` | `DEFAULT_PARAMS` | Active CSS + SRP input parameters |
| `output` | `SimulationOutput` | Auto-computed | Live output (recalculated on every param change) |
| `cssPhase` | `CSSPhase` | `'production'` | Current CSS cycle phase |
| `scenarioParams` | `SimulationParams\|null` | `null` | What-if scenario inputs |
| `scenarioOutput` | `SimulationOutput\|null` | `null` | What-if scenario outputs |
| `optimizationWeights` | `OptimizationWeights` | See below | Objective function weights |
| `optimizationResults` | `OptimizationResult[]` | `[]` | Top-N optimization candidates |
| `predictionHorizon` | `'24h'\|'3d'\|'7d'\|'30d'` | `'7d'` | Forecast window |

**Default Parameters:**
| Parameter | Default | Unit | Range |
|---|---|---|---|
| `steamRate` | 85 | t/cycle | 60–120 |
| `steamTemperature` | 280 | °C | 200–350 |
| `soakDuration` | 3 | days | 2–5 |
| `srpSpeed` | 6 | SPM | 4–10 |
| `strokeLength` | 2.0 | m | 1.5–3.0 |
| `fluidLevel` | 42 | m | 20–80 |
| `pumpCondition` | good | — | excellent/good/fair/poor |

### `authStore` — User Authentication

Session persisted to `localStorage` key `baghewala_dt_auth`. Three demo role presets:

| Role | Name | Employee ID | Department |
|---|---|---|---|
| `engineer` | Er. Rajesh Sharma | OIL-BGW-5502 | CSS & SRP Optimization Cell |
| `manager` | P. K. Goswami | OIL-HQ-1049 | Heavy Oil Asset Management |
| `operator` | R. S. Bhati | OIL-BGW-8932 | Surface Facilities & Artificial Lift |

### `themeStore` — Theme
Persists `'dark'` or `'light'`. Applies/removes `dark` class on `document.documentElement`.

### `uiStore` — UI / Camera State
Tracks active `CameraMode`: `'full' | 'surface' | 'wellbore' | 'reservoir' | 'css' | 'srp'`

---

## 🌐 3D Digital Twin Components

All in `src/components/three/`, built with **React Three Fiber** + **@react-three/drei**.

| Component | Description |
|---|---|
| `DigitalTwinScene` | Root R3F `<Canvas>` — lighting, shadows, orbit controls |
| `CameraController` | Spring-physics camera transitions between presets |
| `WellSystem` | Composite assembly of all well subcomponents |
| `WellheadModel` | Christmas tree / wellhead geometry at ground level |
| `WellboreModel` | Cylindrical casing string descending into the formation |
| `SuckerRodModel` | Animated reciprocating rod string (keyed to SPM) |
| `DownholePumpModel` | Downhole pump barrel at the base of the rod string |
| `SurfacePumpModel` | Animated walking beam pump jack (crank, pitman arm, beam) |
| `ReservoirModel` | Layered formation geometry with heat-map color mapping |
| `SteamVisualization` | Particle system for CSS injection phase steam animation |
| `HeatVisualization` | Thermal diffusion overlay on the reservoir layer |
| `FloatingTelemetry` | R3F `<Html>` annotation panels showing live parameter values |
| `LandingScene` | Hero page decorative 3D backdrop |

### Camera Presets

| Preset ID | Position | Target |
|---|---|---|
| `full` | [15, 10, 15] | [0, −5, 0] |
| `surface` | [8, 5, 8] | [0, 0, 0] |
| `wellbore` | [5, −5, 5] | [0, −10, 0] |
| `reservoir` | [10, −20, 10] | [0, −25, 0] |

---

## 📐 Data & Types

Defined in `src/data/types.ts`.

```ts
interface SimulationParams {
  steamRate: number;           // t/cycle (60–120)
  steamTemperature: number;    // °C (200–350)
  soakDuration: number;        // days (2–5)
  srpSpeed: number;            // SPM (4–10)
  strokeLength: number;        // m (1.5–3.0)
  fluidLevel: number;          // m (20–80)
  pumpCondition: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SimulationOutput {
  production: number;          // bbl/d
  reservoirTemperature: number;// °C
  steamRequirement: number;    // tons
  energyConsumption: number;   // kWh
  pumpEfficiency: number;      // %
  equipmentRisk: 'low' | 'medium' | 'high' | 'critical';
  equipmentRiskScore: number;  // 0–100
}

interface CSSCycle {
  cycleNumber: number;
  phase: 'injection' | 'soaking' | 'production';
  steamVolume: number;         // tons
  steamTemp: number;           // °C
  injectionDuration: number;   // hours
  soakDuration: number;        // hours
  productionDuration: number;  // hours
  oilProduced: number;         // bbl
  startDate: string;
  endDate: string;
}

interface SRPData {
  spm: number;
  strokeLength: number;
  pumpEfficiency: number;      // %
  rodLoad: number;             // kN
  fluidLevel: number;          // m
  motorPower: number;          // kW
  operatingCondition: 'normal' | 'warning' | 'critical';
}

type CSSPhase   = 'injection' | 'soaking' | 'production';
type CameraMode = 'full' | 'surface' | 'wellbore' | 'reservoir' | 'css' | 'srp';
type ThemeMode  = 'dark' | 'light';
```

---

## 🔐 Authentication

Authentication is **simulated** — no backend required. Any username is accepted and mapped to a default engineer profile. Session is persisted in `localStorage` and survives page refresh until explicit logout.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server (opens http://localhost:5173 automatically)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚙️ Environment & Configuration

### `vite.config.ts`
```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, open: true },
});
```

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed)
- **TypeScript** strict mode, ES2022 target
- All routes are **lazy-loaded** via `React.lazy()` + `<Suspense>`

---

## 📜 Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Development server with HMR |
| `build` | `tsc -b && vite build` | Type-check + production bundle |
| `preview` | `vite preview` | Serve the production build locally |
| `lint` | `oxlint` | Run OxLint static analysis |

---

## 🎨 Design System

### CSS Custom Properties (Design Tokens)

Defined in `src/index.css`, toggled by `html.dark` class:

| Token | Purpose |
|---|---|
| `--bg-app` | Application background |
| `--bg-panel` | Card / panel background |
| `--bg-surface` | Input / surface background |
| `--text-primary` | Primary text |
| `--text-secondary` | Labels / secondary text |
| `--text-muted` | Metadata / muted text |
| `--border-color` | Standard border |
| `--border-subtle` | Subtle divider |

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Accent / Primary | amber-500 | `#f59e0b` |
| Secondary / Steam | cyan-500 | `#06b6d4` |
| Success / Production | emerald-500 | `#10b981` |
| Warning / Soak | amber-500 | `#f59e0b` |
| Error / Critical | red-500 | `#ef4444` |

### CSS Phase Colors

| Phase | Color |
|---|---|
| Injection | `#ef4444` (red-500) |
| Soaking | `#f59e0b` (amber-500) |
| Production | `#10b981` (emerald-500) |

---

## ⚠️ Known Limitations

1. **No live SCADA connection** — All telemetry is deterministically simulated; no OPC-UA, MODBUS, or real-time data feeds.
2. **No backend / database** — State is in-memory (Zustand). Only auth session and theme are persisted via `localStorage`; all other data resets on page reload.
3. **Simulated alerts** — Alert data comes from a static mock dataset (`mockAlerts.ts`), not a live alarm management system.
4. **Simplified optimization** — The optimization engine generates 3 parametric variations around current settings, not a true genetic or gradient-based solver.
5. **No real authentication** — Any username is accepted. No JWTs, tokens, or role-based access control is enforced.
6. **WebGL required** — The 3D digital twin requires a WebGL-capable browser (Chrome, Edge, Firefox on modern hardware).
7. **Single well** — Only `BGW-DEMO-01` is modeled. Multi-well fleet management is not implemented.

---

## 📖 Background: Baghewala Field

The **Baghewala Field** in Rajasthan, India, is a heavy oil field operated by Oil India Limited (OIL), characterized by:
- **High oil viscosity**: 500–15,000 cP at reservoir conditions
- **Shallow reservoir depth**: ~300–500 m TVD
- **Recovery method**: Cyclic Steam Stimulation (CSS) + Sucker Rod Pump (SRP) artificial lift
- **Steam requirements**: 200–350 °C at 30–90 bar injection pressure
- **Typical production**: 50–350 bbl/day per well depending on CSS cycle efficiency and reservoir response

This digital twin provides reservoir engineers, production engineers, and field operators with a unified platform to monitor, simulate, and optimize these operations.

---

*Built for Oil India Limited — Baghewala Heavy Oil Asset · CSS & SRP Optimization Cell*
