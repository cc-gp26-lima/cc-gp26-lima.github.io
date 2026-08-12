/**
 * Lookups, derived views and structural checks over data/*.json.
 * Pure functions — the caller supplies the parsed JSON.
 */

import { t, toMinutes, todayIso, at } from './format.js';

export const MEALS = ['breakfast', 'lunch', 'snack', 'dinner'];
export const KINDS = ['competition', 'social', 'logistics'];

export const byId = (rows) => new Map(rows.map((r) => [r.id, r]));

export const venueName = (guide, id, lang) => t(guide.venues.find((v) => v.id === id)?.name, lang) || id;
export const venue = (guide, id) => guide.venues.find((v) => v.id === id) ?? null;

/**
 * The date to open on: today when the guest is reading during the event,
 * otherwise the first day — so a guest reading in advance sees day one.
 */
export function defaultDate(dates, now = new Date()) {
  const today = todayIso(now);
  return dates.includes(today) ? today : dates[0];
}

/**
 * Where a session sits in the day. The official programme leaves the
 * preliminaries TBC, so those carry an `approxStart` that orders them without
 * ever being shown as a time.
 */
const slot = (s) => toMinutes(s.start ?? s.approxStart ?? '00:00');

/** Sessions for one date, earliest first, all-day entries pinned to the top. */
export function sessionsOn(schedule, date) {
  const day = schedule.days.find((d) => d.date === date);
  if (!day) return [];
  return [...day.sessions].sort(
    (a, b) => Number(!!b.allDay) - Number(!!a.allDay) || slot(a) - slot(b),
  );
}

/**
 * What is happening now, and what comes after it — including team logistics,
 * since a weigh-in is exactly the kind of thing someone wants surfaced.
 * Sessions whose hour is still TBC are the one exclusion: they cannot tell
 * anyone when to be anywhere. Returns `{ now, next }`, each
 * `{ session, date, start, end }` or null.
 */
export const IMPLIED_RUN_MS = 2 * 60 * 60 * 1000;

/**
 * Has this session finished? Without a stated end it is assumed to run two
 * hours; a session whose hour is still TBC counts as over once its day is.
 */
export function isDone(session, date, when = new Date()) {
  if (session.tbc || !session.start) return at(date, '23:59') < when;
  const start = at(date, session.start);
  const end = session.end ? at(date, session.end) : new Date(start.getTime() + IMPLIED_RUN_MS);
  return end < when;
}

export function agenda(schedule, when = new Date()) {
  const timed = schedule.days
    .flatMap((day) =>
      day.sessions
        .filter((s) => s.start && !s.tbc && !s.allDay)
        .map((s) => ({
          session: s,
          date: day.date,
          start: at(day.date, s.start),
          end: s.end ? at(day.date, s.end) : null,
        })),
    )
    .sort((a, b) => a.start - b.start);

  // Without a stated end, something stays "on" for two hours — long enough for
  // a final block or a dinner, short enough not to shadow what comes next.
  const impliedEnd = (e) => e.end ?? new Date(e.start.getTime() + IMPLIED_RUN_MS);

  const now = timed.find((e) => when >= e.start && when <= impliedEnd(e)) ?? null;
  const nextIndex = timed.findIndex((e) => e.start > when);
  const next = nextIndex === -1 ? null : timed[nextIndex];
  const after = nextIndex === -1 ? null : (timed[nextIndex + 1] ?? null);

  // The last thing that finished, so the card can show where the day has got to.
  const done = timed.filter((e) => impliedEnd(e) < when);
  const previous = done.length ? done[done.length - 1] : null;

  return { previous, now, next, after };
}

/** The whole day record — label, competition day number, weight categories. */
export const dayOn = (schedule, date) => schedule.days.find((d) => d.date === date) ?? null;

export const dayLabel = (schedule, date) => schedule.days.find((d) => d.date === date)?.label ?? null;

/**
 * Structural checks. Returns an array of human-readable problems; empty is a
 * pass. Run by `npm run validate` before every build.
 */
export function validate({ guide, schedule, meals }) {
  const problems = [];
  const venues = new Set(guide.venues.map((v) => v.id));
  const { from, to } = guide.meta.dates;

  const bilingual = (obj, where, field) => {
    const v = obj?.[field];
    if (v == null || v === '') return; // optional fields may be omitted
    if (typeof v !== 'object' || v.en == null || v.es == null) {
      problems.push(`${where}: ${field} needs both en and es`);
    }
  };

  const checkTime = (value, where, field, { required = false } = {}) => {
    if (value == null) {
      if (required) problems.push(`${where}: missing ${field}`);
      return;
    }
    if (Number.isNaN(toMinutes(value))) problems.push(`${where}: ${field} "${value}" is not HH:MM`);
  };

  const checkDate = (date, where) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) return problems.push(`${where}: bad date "${date}"`);
    if (date < from || date > to) problems.push(`${where}: date ${date} is outside ${from}–${to}`);
  };

  // --- guide.json ---
  if (!venues.has(guide.hotel.id)) problems.push(`hotel "${guide.hotel.id}": no matching venue`);
  checkTime(guide.hotel.checkIn, 'hotel', 'checkIn', { required: true });
  checkTime(guide.hotel.checkOut, 'hotel', 'checkOut', { required: true });
  for (const item of guide.essentials) {
    bilingual(item, `essentials "${item.id}"`, 'ask');
    bilingual(item, `essentials "${item.id}"`, 'answer');
  }
  for (const c of guide.contacts) {
    bilingual(c, `contact "${c.id}"`, 'role');
    bilingual(c, `contact "${c.id}"`, 'note');
  }

  // --- schedule.json ---
  const sessionIds = new Set();
  for (const day of schedule.days) {
    checkDate(day.date, `day "${day.date}"`);
    for (const s of day.sessions) {
      const where = `session "${s.id || '(unnamed)'}" on ${day.date}`;
      if (!s.id) problems.push(`${where}: missing id`);
      else if (sessionIds.has(s.id)) problems.push(`${where}: duplicate id`);
      else sessionIds.add(s.id);

      bilingual(s, where, 'title');
      bilingual(s, where, 'note');
      bilingual(s, where, 'dress');
      bilingual(s, where, 'host');
      bilingual(s, where, 'action');
      // The action line is read at a glance on a phone; long ones defeat that.
      for (const l of ['en', 'es']) {
        if ((s.action?.[l]?.length ?? 0) > 60) problems.push(`${where}: action.${l} is too long to scan`);
      }
      if (!KINDS.includes(s.kind)) problems.push(`${where}: unknown kind "${s.kind}"`);
      if (s.audience && !['all', 'team'].includes(s.audience)) {
        problems.push(`${where}: unknown audience "${s.audience}"`);
      }
      if (s.venue && !venues.has(s.venue)) problems.push(`${where}: unknown venue "${s.venue}"`);
      // A session states a start, or says openly that the hour is not yet set.
      if (!s.start && !s.tbc && !s.allDay) problems.push(`${where}: needs a start, or tbc: true`);
      if (s.tbc && s.start) problems.push(`${where}: tbc and start "${s.start}" contradict each other`);
      checkTime(s.start, where, 'start');
      checkTime(s.approxStart, where, 'approxStart');
      checkTime(s.end, where, 'end');
      if (s.end && toMinutes(s.end) <= toMinutes(s.start)) {
        problems.push(`${where}: ${s.start}–${s.end} does not move forward`);
      }
    }
  }

  // --- meals.json ---
  // The arrangement is stated once, not per service: what the guide promises is
  // a ceiling per lunch and per dinner, valid until each guest checks out.
  const a = meals.allowance;
  if (!(a?.perService > 0)) problems.push('allowance: perService must be a positive amount');
  for (const m of a?.appliesTo ?? []) {
    if (!MEALS.includes(m)) problems.push(`allowance: unknown meal "${m}" in appliesTo`);
  }
  for (const field of ['payer', 'headline', 'scope', 'body', 'excludes', 'overage']) {
    bilingual(a, 'allowance', field);
  }
  for (const rule of meals.rules) {
    bilingual(rule, `rule "${rule.id}"`, 'title');
    bilingual(rule, `rule "${rule.id}"`, 'body');
  }

  // --- no phone numbers: this guide is published publicly ---
  const phone = /(\+\s?\d[\d\s().-]{7,})/;
  const scan = (node, path) => {
    if (typeof node === 'string') {
      if (phone.test(node)) problems.push(`${path}: looks like a phone number — this guide is public`);
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) scan(v, path ? `${path}.${k}` : k);
    }
  };
  scan({ guide, schedule, meals }, '');

  return problems;
}

/** Anything still carrying a TODO — reported as a warning, never a failure. */
export function todos({ guide, schedule, meals }) {
  const found = [];
  const walk = (node, path) => {
    if (typeof node === 'string') {
      if (node.includes('TODO')) found.push(path);
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk({ guide, schedule, meals }, '');
  return found;
}
