const DB_KEY = 'ng_meal_tracker_v1';

function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : initDB();
  } catch {
    return initDB();
  }
}

function initDB() {
  const db = {
    startDate: new Date().toISOString(),
    settings: { theme: 'dark' },
    logs: {},
  };
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getSettings() {
  return getDB().settings;
}

export function saveSettings(settings) {
  const db = getDB();
  db.settings = { ...db.settings, ...settings };
  saveDB(db);
}

export function getStartDate() {
  return new Date(getDB().startDate);
}

export function setStartDate(date) {
  const db = getDB();
  db.startDate = date.toISOString();
  saveDB(db);
}

export function getDayKey(week, day) {
  return `w${week}d${day}`;
}

export const emptyLog = () => ({
  meals: { breakfast: false, snack: false, lunch: false, dinner: false },
  metrics: { energy: 0, clarity: 0, motivation: 0, sleep: 0 },
  notes: '',
});

export function getDayLog(week, day) {
  const db = getDB();
  return db.logs[getDayKey(week, day)] || emptyLog();
}

export function saveDayLog(week, day, log) {
  const db = getDB();
  db.logs[getDayKey(week, day)] = { ...log, updatedAt: new Date().toISOString() };
  saveDB(db);
}

export function isDayComplete(week, day) {
  const log = getDayLog(week, day);
  const m = log.meals || {};
  return !!(m.breakfast && m.snack && m.lunch && m.dinner);
}

export function getStreak() {
  const db = getDB();
  const start = new Date(db.startDate);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  for (let i = 0; i < 28; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dayOffset = Math.floor((checkDate - start) / 86400000);
    if (dayOffset < 0 || dayOffset >= 28) break;
    const w = Math.floor(dayOffset / 7);
    const d = dayOffset % 7;
    if (!isDayComplete(w, d)) break;
    streak++;
  }
  return streak;
}

export function getTotalCompleted() {
  const db = getDB();
  return Object.values(db.logs).filter(log => {
    const m = log.meals || {};
    return m.breakfast && m.snack && m.lunch && m.dinner;
  }).length;
}

export function getCurrentProgramDay() {
  const start = new Date(getDB().startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / 86400000);
  return Math.max(0, Math.min(diff, 27));
}

export function resetDB() {
  localStorage.removeItem(DB_KEY);
}
