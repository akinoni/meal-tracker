# 🇳🇬 Nigerian Meal Tracker

A personalised 28-day muscle-gain and testosterone-optimisation meal tracking app built with **React + Vite**, using a localStorage database for full offline persistence. Designed specifically around Nigerian food availability, affordability, and a sedentary-to-active lifestyle transition.

---

## Table of Contents

- [Background](#background)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Database Layer](#database-layer)
- [Meal Plan Logic](#meal-plan-logic)
- [Tracking System](#tracking-system)
- [Theming](#theming)
- [Customisation Guide](#customisation-guide)
- [Nutritional Targets](#nutritional-targets)
- [Key Foods & Why](#key-foods--why)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Disclaimer](#disclaimer)

---

## Background

This app was designed for a 27-year-old male (65 kg, 183 cm) experiencing chronic low energy, fatigue, poor concentration, and low motivation — symptoms consistent with being underweight and nutritionally deficient. The protocol addresses root causes through:

- Caloric surplus (~2,400 kcal/day) to bring body weight to a healthy range
- High-protein rotation (~130g/day) to support muscle synthesis
- Testosterone-optimising foods (zinc, omega-3, vitamin D, magnesium)
- Nigerian-accessible ingredients only — no imports, no expensive supplements
- Progressive weekly structure: Foundation → Load & Build → Intensify → Consolidate

The app tracks daily meals, logs personal metrics, and maintains a streak system to build the consistency habit.

---

## Features

### Core
- **28-day meal plan** — 4 weeks × 7 days, each with 3 meals + 1 snack
- **Meal checklist** — tap to check off each meal as eaten; visual completion state per meal
- **Day completion badge** — fires when all 4 meals are checked
- **Jump to Today** — pill button that navigates directly to the current program day

### Tracking & Streaks
- **Streak counter** — counts consecutive fully-completed days (all 4 meals checked); resets on any missed day
- **Total days completed** — cumulative count across the full 28-day program
- **Program progress bar** — shows Day X of 28 visually
- **Daily completion bar** — shows meals checked vs. total (0–4)
- **Completed day indicators** — green dot on day nav buttons for any day with full meal completion

### Metrics (Daily, per day)
Each day accepts four 1–5 dot ratings:
- ⚡ **Energy** — physical energy levels
- 🧠 **Clarity** — mental focus and concentration
- 🔥 **Drive** — motivation and testosterone-adjacent mood
- 🌙 **Sleep** — quality of previous night's sleep

### Per-Day Adjustment Notes
Every single day (28 total) has a unique, hand-written contextual tip covering:
- Nutrition adjustments (when to eat more, timing shifts)
- Training progressions (when to start, how to scale)
- Lifestyle factors (sleep, sunlight, hydration)
- Weekly benchmarks (weigh-ins, push-up counts, cognitive checks)
- Hormonal milestones (when to expect shifts in energy and drive)

### Personal Notes
Free-text input per day for logging weight, mood, observations, or anything personal. Persists to the local database.

### UI & Theme
- **Dark mode** (default) — deep navy palette built for night use
- **Light mode** — clean slate theme, one-tap toggle
- Theme preference persists across sessions via the database
- Fully responsive — optimised for mobile-first use

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Vanilla CSS with CSS custom properties |
| Fonts | Playfair Display · DM Sans · DM Mono (Google Fonts) |
| Database | localStorage (client-side, zero backend) |
| Deployment | Vercel / Netlify / any static host |

No external UI libraries. No Tailwind. No state management library. Pure React hooks + CSS variables.

---

## Project Structure

```
meal-tracker/
│
├── .gitignore                  # Node, build, env exclusions
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite + React plugin config
├── index.html                  # HTML shell with Google Fonts
│
└── src/
    ├── main.jsx                # React root mount
    ├── App.jsx                 # Main application + all components
    ├── styles.css              # Full CSS: variables, layout, components
    ├── db.js                   # localStorage database abstraction layer
    │
    └── data/
        └── mealPlan.js         # 4-week meal data + per-day adjustment notes
```

---

## Getting Started

### Prerequisites

- Node.js **v18+**
- npm **v9+**

Verify with:
```bash
node -v
npm -v
```

### Installation

```bash
# 1. Unzip the project
unzip meal-tracker.zip
cd meal-tracker

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output goes to the `/dist` folder. Preview the production build locally:

```bash
npm run preview
```

---

## Deployment

### Vercel (Recommended)

**Option A — CLI:**
```bash
npm install -g vercel
npm run build
vercel --prod
```

**Option B — Drag & drop:**
1. Run `npm run build`
2. Go to [vercel.com](https://vercel.com)
3. Drag the `/dist` folder onto the dashboard
4. Done — live URL generated instantly

### Netlify

```bash
npm run build
# Drag /dist to netlify.com/drop
# Or use Netlify CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/meal-tracker",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Then:
```bash
npm run deploy
```

---

## Database Layer

**File:** `src/db.js`

All data is stored in `localStorage` under the key `ng_meal_tracker_v1`. The database is a single JSON object with the following shape:

```json
{
  "startDate": "2026-04-29T00:00:00.000Z",
  "settings": {
    "theme": "dark"
  },
  "logs": {
    "w0d0": {
      "meals": {
        "breakfast": true,
        "snack": false,
        "lunch": true,
        "dinner": false
      },
      "metrics": {
        "energy": 3,
        "clarity": 4,
        "motivation": 2,
        "sleep": 5
      },
      "notes": "Felt better than expected today.",
      "updatedAt": "2026-04-29T19:45:00.000Z"
    }
  }
}
```

### Exported Functions

| Function | Description |
|---|---|
| `getSettings()` | Returns current app settings (theme) |
| `saveSettings(obj)` | Merges and saves settings |
| `getStartDate()` | Returns program start date as `Date` |
| `setStartDate(date)` | Overrides the program start date |
| `getDayLog(week, day)` | Returns log for a specific week/day, or empty default |
| `saveDayLog(week, day, log)` | Persists a day's log with timestamp |
| `isDayComplete(week, day)` | Returns `true` if all 4 meals are checked |
| `getStreak()` | Returns current consecutive-day streak |
| `getTotalCompleted()` | Returns count of fully completed days |
| `getCurrentProgramDay()` | Returns today's day index (0–27) based on start date |
| `resetDB()` | Wipes all data — use with caution |

### Streak Calculation

The streak algorithm works backwards from today:

1. Determine today's date
2. Calculate which program day (week/day index) corresponds to today using `startDate`
3. Walk backwards day by day, checking if each day has all 4 meals completed
4. Stop at the first incomplete or unlogged day
5. Return the count

A day is only counted in the streak if `breakfast`, `snack`, `lunch`, and `dinner` are all `true`.

---

## Meal Plan Logic

**File:** `src/data/mealPlan.js`

The plan is structured as an array of 4 week objects. Each week contains 7 day objects. Each day contains:

```js
{
  day: 'Mon',
  adjustment: {
    icon: '🌱',
    title: 'Day 1 — Start Clean',
    body: '...',
  },
  breakfast: { meal: '...', kcal: 620, p: 38 },
  snack:     { meal: '...', kcal: 310, p: 14 },
  lunch:     { meal: '...', kcal: 780, p: 48 },
  dinner:    { meal: '...', kcal: 680, p: 36 },
}
```

### Weekly Themes

| Week | Theme | Focus |
|---|---|---|
| 1 | Foundation | Establishing meal timing, caloric baseline |
| 2 | Load & Build | Increasing protein density, introducing training |
| 3 | Intensify | Pushing calories toward 2,600, training volume up |
| 4 | Consolidate | Habit locking, benchmarking, Phase 2 prep |

### Meal Timing

| Meal | Time | Purpose |
|---|---|---|
| Breakfast | 6:30 AM | Testosterone ignition — cholesterol, zinc, slow carbs |
| Snack | 10:30 AM | Mid-morning protein bridge, metabolism signal |
| Lunch | 1:00 PM | Primary fuel — highest calorie meal of the day |
| Dinner | 7:00 PM | Recovery and overnight repair — omega-3, magnesium |

---

## Tracking System

### How a Day is Tracked

1. Navigate to the correct week and day using the nav
2. Check off each meal as you eat it (tap the meal card)
3. Rate your 4 metrics using the dot selectors
4. Add personal notes (optional but recommended)
5. Press **Save Today's Log** — data is written to localStorage

### Streak Rules

- Streak increments only when **all 4 meals** are checked and saved on a given program day
- Missing any single meal breaks the streak
- Going back and completing a past day does **not** restore the streak (streak is calendar-based)
- The streak resets to 0 if today's program day is incomplete

### Program Day Mapping

The app uses `startDate` (set on first launch) to determine which program day corresponds to today. If you open the app on Day 1, Week 1 Day 1 is today. On Day 8, Week 2 Day 1 is today, and so on.

To change your start date (e.g. if you started the program before installing the app), call `setStartDate(new Date('YYYY-MM-DD'))` in the browser console.

---

## Theming

**File:** `src/styles.css`

All colours are defined as CSS custom properties scoped to `[data-theme]` on the `<html>` element:

```css
[data-theme="dark"] {
  --bg:       #060A12;
  --surface:  #0F172A;
  --border:   #1E293B;
  --text:     #E2E8F0;
  --text2:    #94A3B8;
  --green:    #10B981;
  --amber:    #F59E0B;
  /* ... */
}

[data-theme="light"] {
  --bg:       #F1F5F9;
  --surface:  #FFFFFF;
  --border:   #E2E8F0;
  --text:     #0F172A;
  /* ... */
}
```

Toggling theme calls `document.documentElement.setAttribute('data-theme', next)` and saves the preference via `saveSettings()`. All transitions are handled by `transition: background 0.25s, color 0.25s` on `body`.

---

## Customisation Guide

### Change Your Start Date

Open the browser console on the deployed app:
```js
import { setStartDate } from './src/db.js';
setStartDate(new Date('2026-04-01'));
location.reload();
```

Or directly in console:
```js
const db = JSON.parse(localStorage.getItem('ng_meal_tracker_v1'));
db.startDate = new Date('2026-04-01').toISOString();
localStorage.setItem('ng_meal_tracker_v1', JSON.stringify(db));
location.reload();
```

### Add or Edit a Meal

Open `src/data/mealPlan.js` and find the relevant week/day object. Edit the `meal`, `kcal`, and `p` (protein in grams) fields:

```js
breakfast: { meal: 'Your new breakfast here', kcal: 650, p: 40 },
```

### Add a New Metric

In `src/data/mealPlan.js`, add to the `METRICS` array:
```js
{ key: 'hydration', label: 'Hydration', icon: '💧', color: '#0EA5E9' },
```

Then update the `emptyLog()` function in `src/db.js` to include the new key:
```js
metrics: { energy: 0, clarity: 0, motivation: 0, sleep: 0, hydration: 0 },
```

### Reset All Data

In the browser console:
```js
localStorage.removeItem('ng_meal_tracker_v1');
location.reload();
```

---

## Nutritional Targets

| Metric | Daily Target | Rationale |
|---|---|---|
| Calories | ~2,400 kcal | Caloric surplus for a 65 kg underweight male |
| Protein | 130g | ~2g per kg bodyweight for muscle protein synthesis |
| Carbohydrates | 280g | Primary energy source for sedentary-to-active transition |
| Fat | 75g | Dietary fat is the precursor to testosterone synthesis |

Caloric distribution across meals:

| Meal | Target kcal | % of Daily |
|---|---|---|
| Breakfast | 620–680 | ~27% |
| Snack | 250–310 | ~12% |
| Lunch | 760–880 | ~35% |
| Dinner | 660–860 | ~29% |

---

## Key Foods & Why

| Food | Key Nutrients | Benefit |
|---|---|---|
| Whole eggs (3/day) | Cholesterol, zinc, choline | Direct testosterone precursor; cholesterol is the raw material |
| Titus fish (mackerel) | Omega-3, vitamin D | Reduces SHBG (frees up testosterone), supports brain function |
| Cow liver (2×/week) | Zinc, B12, iron, vitamin A | Highest zinc-density food available; B12 eliminates fatigue |
| Ugu (fluted pumpkin leaves) | Magnesium, iron | Magnesium drives overnight testosterone production |
| Groundnuts | Monounsaturated fats, selenium | Hormone synthesis support; selenium is an antioxidant for T |
| Beans | Plant protein, fibre | Complete protein when paired with fish; stabilises blood sugar |
| Yam / sweet potato | Complex carbohydrates | Sustained energy, prevents cortisol spikes from low blood sugar |
| Peak powdered milk | Protein, calcium, calories | Caloric density; practical in Nigerian context |
| Unripe plantain | Resistant starch, potassium | Gut health, electrolyte balance, slower glucose release |

> ⚠️ **Cow liver limit:** Do not exceed 2 servings per week. Liver is extremely high in Vitamin A, and excess Vitamin A is toxic and can suppress testosterone. The plan already accounts for this.

---

## Known Limitations

- **Single device only** — localStorage is browser and device specific. Data does not sync across devices.
- **No authentication** — the app is single-user by design. Anyone with access to the device can view and edit logs.
- **No cloud backup** — if you clear browser data or switch browsers, all logs are lost. Export notes manually if needed.
- **Start date is fixed at first launch** — changing it requires manual intervention (see Customisation Guide).
- **No push notifications** — meal time reminders require a native app wrapper (React Native / Capacitor).

---

## Roadmap

Planned features for Phase 2:

- [ ] Weekly summary chart — energy, clarity, motivation trends over 28 days
- [ ] Weight tracking graph — plot bodyweight progression
- [ ] Export to PDF — 28-day report card with all metrics
- [ ] Phase 2 meal plan — post-28-day higher-calorie, gym-integrated protocol
- [ ] Supplementation tracker — vitamin D, zinc, creatine (Phase 2)
- [ ] PWA support — install on home screen, offline-first
- [ ] Data export / import — JSON backup and restore
- [ ] Notification support — meal time reminders via Capacitor (mobile wrapper)

---

## Disclaimer

This application is a **nutritional guidance tool**, not a medical device or professional health service. The meal plan and recommendations within this app are based on general nutritional science and are tailored for general wellness goals.

**Consult a qualified healthcare professional or registered dietitian** before making significant changes to your diet, especially if you have any underlying medical conditions, are taking medication, or experience symptoms that may indicate a nutritional deficiency or hormonal imbalance.

The developer of this app assumes no liability for health outcomes resulting from use of this plan.

---

*Built with React + Vite · Designed for the Nigerian context · 28-day muscle gain protocol*
