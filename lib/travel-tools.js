const DAILY_GB = { light: 0.55, medium: 1.15, heavy: 2.1 };
const TIERS = [1, 3, 5, 10, 20, 50];

export function recommendData({ days, usage = 'medium', hotspot = false }) {
  const safeDays = Math.max(1, Number(days) || 1);
  const raw = safeDays * (DAILY_GB[usage] || DAILY_GB.medium) + (hotspot ? 5 : 0);
  return TIERS.find((tier) => tier >= raw) || 'unlimited';
}

export function estimateTrip({ days, stay, food, transport, esim, activities = false }) {
  const safeDays = Math.max(1, Number(days) || 1);
  const perDay = [stay, food, transport].reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0) + (activities ? 25 : 0);
  return { days: safeDays, perDay, total: perDay * safeDays + Math.max(0, Number(esim) || 0) };
}

export function adviceFor(destination, templates) {
  const safeDestination = String(destination || '').trim() || 'your destination';
  return templates.map((template) => template.replaceAll('{destination}', safeDestination));
}
