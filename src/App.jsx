import { useState, useEffect, useCallback } from 'react';
import { WEEKS, MEAL_META, METRICS } from './data/mealPlan.js';
import {
  getSettings, saveSettings,
  getDayLog, saveDayLog,
  getStreak, getTotalCompleted,
  getCurrentProgramDay, isDayComplete,
} from './db.js';

// ── Helpers ────────────────────────────────────────────────────────────────────
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

// ── Sub-components ─────────────────────────────────────────────────────────────

function StreakBanner({ streak, totalCompleted }) {
  return (
    <div className="streak-banner">
      <div className="streak-main">
        <span className="streak-fire">{streak > 0 ? '🔥' : '💤'}</span>
        <div>
          <div className="streak-count">{streak}</div>
          <div className="streak-label">DAY STREAK</div>
        </div>
      </div>
      <div className="streak-stats">
        <div className="streak-stat">
          <div className="streak-stat-val">{totalCompleted}</div>
          <div className="streak-stat-key">DAYS DONE</div>
        </div>
        <div className="streak-stat">
          <div className="streak-stat-val">{28 - totalCompleted}</div>
          <div className="streak-stat-key">REMAINING</div>
        </div>
      </div>
    </div>
  );
}

function WeekDayNav({ activeWeek, activeDay, setActiveWeek, setActiveDay, todayWeek, todayDay }) {
  const week = WEEKS[activeWeek];
  return (
    <>
      <p className="section-label">Program</p>
      <div className="week-nav">
        {WEEKS.map((w, i) => (
          <button
            key={i}
            className={`week-btn${activeWeek === i ? ' active' : ''}`}
            onClick={() => { setActiveWeek(i); setActiveDay(0); }}
          >
            <div className="wnum">W{w.week}</div>
            <div className="wtheme">{w.theme}</div>
          </button>
        ))}
      </div>
      <div className="day-nav">
        {week.days.map((d, i) => {
          const complete = isDayComplete(activeWeek, i);
          const isToday = activeWeek === todayWeek && i === todayDay;
          return (
            <button
              key={i}
              className={`day-btn${activeDay === i ? ' active' : ''}${complete ? ' completed' : ''}${isToday ? ' today-marker' : ''}`}
              onClick={() => setActiveDay(i)}
            >
              {d.day}
            </button>
          );
        })}
      </div>
    </>
  );
}

function MealCard({ mealKey, meal, checked, onToggle }) {
  const meta = MEAL_META[mealKey];
  return (
    <div
      className={`meal-card${checked ? ' checked' : ''}`}
      style={checked ? { background: meta.dimColor, borderColor: meta.color + '60' } : {}}
      onClick={onToggle}
    >
      <div
        className="meal-card-check"
        style={checked ? { background: meta.color, borderColor: meta.color } : {}}
      >
        {checked && <span style={{ color: '#000', fontWeight: 700 }}>✓</span>}
      </div>
      <div className="meal-card-body">
        <div className="meal-card-header">
          <span
            className="meal-tag"
            style={{ background: meta.dimColor, color: meta.color }}
          >{meta.label}</span>
          <span className="meal-time">{meta.time}</span>
        </div>
        <div className="meal-name" style={checked ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>
          {meal.meal}
        </div>
        <div className="meal-macros">
          <span className="meal-macro" style={{ color: meta.color, borderColor: meta.color + '40', background: meta.dimColor }}>
            {meal.kcal} kcal
          </span>
          <span className="meal-macro">{meal.p}g protein</span>
        </div>
      </div>
    </div>
  );
}

function MetricDots({ metricKey, value, onChange, color }) {
  return (
    <div className="metric-dots">
      {[1, 2, 3, 4, 5].map(n => (
        <div
          key={n}
          className="metric-dot"
          onClick={() => onChange(metricKey, n === value ? 0 : n)}
          style={n <= value ? { background: color, borderColor: color } : {}}
        />
      ))}
    </div>
  );
}

function MetricsPanel({ metrics, onMetricChange }) {
  return (
    <div className="card">
      <div className="card-title">Daily Metrics</div>
      <div className="metrics-grid">
        {METRICS.map(m => (
          <div key={m.key} className="metric-item">
            <div className="metric-label">
              <span>{m.icon} {m.label}</span>
              <span className="metric-val" style={{ color: m.color }}>
                {metrics[m.key] > 0 ? `${metrics[m.key]}/5` : '—'}
              </span>
            </div>
            <MetricDots
              metricKey={m.key}
              value={metrics[m.key]}
              onChange={onMetricChange}
              color={m.color}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdjustmentNote({ adj }) {
  return (
    <div className="card">
      <div className="card-title">Today's Adjustment</div>
      <div className="adj-card" style={{ border: '1px solid var(--border)', borderRadius: 12 }}>
        <span className="adj-icon">{adj.icon}</span>
        <div>
          <div className="adj-title">{adj.title}</div>
          <div className="adj-body">{adj.body}</div>
        </div>
      </div>
    </div>
  );
}

function DayNotes({ notes, onChange }) {
  return (
    <div className="card">
      <div className="card-title">Personal Notes</div>
      <textarea
        className="notes-area"
        placeholder="How are you feeling today? Energy, mood, hunger, weight, anything notable…"
        value={notes}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="progress-wrap">
      <div className="flex-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color }}>{value}/{max}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [log, setLog] = useState(null);
  const [streak, setStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [todayWeek, setTodayWeek] = useState(0);
  const [todayDay, setTodayDay] = useState(0);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');

  // Init
  useEffect(() => {
    const s = getSettings();
    const t = s.theme || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);

    const progDay = getCurrentProgramDay();
    const w = Math.floor(progDay / 7);
    const d = progDay % 7;
    setTodayWeek(w);
    setTodayDay(d);
    setActiveWeek(w);
    setActiveDay(d);

    refreshStats();
  }, []);

  // Load log when week/day changes
  useEffect(() => {
    const l = getDayLog(activeWeek, activeDay);
    setLog(l);
    setSaved(false);
  }, [activeWeek, activeDay]);

  const refreshStats = () => {
    setStreak(getStreak());
    setTotalCompleted(getTotalCompleted());
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    saveSettings({ theme: next });
  };

  const toggleMeal = useCallback((key) => {
    setLog(prev => ({
      ...prev,
      meals: { ...prev.meals, [key]: !prev.meals[key] },
    }));
    setSaved(false);
  }, []);

  const setMetric = useCallback((key, val) => {
    setLog(prev => ({
      ...prev,
      metrics: { ...prev.metrics, [key]: val },
    }));
    setSaved(false);
  }, []);

  const setNotes = useCallback((val) => {
    setLog(prev => ({ ...prev, notes: val }));
    setSaved(false);
  }, []);

  const handleSave = () => {
    saveDayLog(activeWeek, activeDay, log);
    refreshStats();
    setSaved(true);
    setToast('Saved ✓');
    setTimeout(() => setToast(''), 2000);
  };

  const goToToday = () => {
    setActiveWeek(todayWeek);
    setActiveDay(todayDay);
  };

  if (!log) return null;

  const dayData = WEEKS[activeWeek].days[activeDay];
  const mealKeys = ['breakfast', 'snack', 'lunch', 'dinner'];
  const checkedCount = mealKeys.filter(k => log.meals[k]).length;
  const allChecked = checkedCount === 4;
  const totalKcal = mealKeys.reduce((s, k) => s + dayData[k].kcal, 0);
  const totalP    = mealKeys.reduce((s, k) => s + dayData[k].p, 0);
  const isToday   = activeWeek === todayWeek && activeDay === todayDay;
  const dayNum    = activeWeek * 7 + activeDay + 1;

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="eyebrow">🇳🇬 Muscle Protocol</div>
          <h1>Meal Tracker</h1>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Streak */}
      <StreakBanner streak={streak} totalCompleted={totalCompleted} />

      {/* Today pill */}
      {!isToday && (
        <div className="today-pill" onClick={goToToday}>
          <span className="today-dot" />
          Jump to Today · Day {todayWeek * 7 + todayDay + 1}
        </div>
      )}

      {/* Week/Day Nav */}
      <WeekDayNav
        activeWeek={activeWeek} activeDay={activeDay}
        setActiveWeek={setActiveWeek} setActiveDay={setActiveDay}
        todayWeek={todayWeek} todayDay={todayDay}
      />

      {/* Day Summary */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: 14 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 2 }}>Day {dayNum} — {WEEKS[activeWeek].days[activeDay].day}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              Week {activeWeek + 1} · {WEEKS[activeWeek].theme}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>
              {totalKcal.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>kcal · {totalP}g protein</div>
          </div>
        </div>
        <ProgressBar label="Meals completed today" value={checkedCount} max={4} color="var(--green)" />
        <div style={{ marginTop: 10 }}>
          <ProgressBar label="Program progress" value={dayNum} max={28} color="var(--indigo)" />
        </div>
      </div>

      {/* Completion badge */}
      {allChecked && (
        <div className="completion-badge">
          🏆 Day Complete! All meals checked off.
        </div>
      )}

      {/* Meals */}
      <div className="card">
        <div className="card-title">Meal Checklist</div>
        {mealKeys.map(k => (
          <MealCard
            key={k}
            mealKey={k}
            meal={dayData[k]}
            checked={!!log.meals[k]}
            onToggle={() => toggleMeal(k)}
          />
        ))}
      </div>

      {/* Metrics */}
      <MetricsPanel metrics={log.metrics} onMetricChange={setMetric} />

      {/* Adjustment Note */}
      <AdjustmentNote adj={dayData.adjustment} />

      {/* Notes */}
      <DayNotes notes={log.notes} onChange={setNotes} />

      {/* Save */}
      <button
        className={`save-btn${saved ? ' saved' : ''}`}
        onClick={handleSave}
      >
        {saved ? '✓ Saved' : 'Save Today\'s Log'}
      </button>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
