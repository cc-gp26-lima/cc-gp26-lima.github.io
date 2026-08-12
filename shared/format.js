/**
 * Language picking and time/date formatting.
 * Pure — no imports from the app, so scripts/ can use it too.
 */

/** Pick the `lang` string out of a { en, es } object, falling back to English. */
export const t = (field, lang) =>
  field == null ? '' : typeof field === 'string' ? field : field[lang] ?? field.en ?? '';

/** "09:30" → 570. Returns NaN for anything that isn't HH:MM. */
export const toMinutes = (hhmm) => {
  if (!/^\d{1,2}:\d{2}$/.test(hhmm ?? '')) return NaN;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** "09:30" → "9:30 a.m." (en) / "9:30 a. m." (es). */
export function fmtTime(hhmm, lang) {
  const mins = toMinutes(hhmm);
  if (Number.isNaN(mins)) return hhmm ?? '';
  const d = new Date(2000, 0, 1, Math.floor(mins / 60), mins % 60);
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-PE' : 'en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: lang !== 'es',
  }).format(d);
}

/** A start/end pair as one label: "9:30 a.m. – 12:00 p.m.", or just the start. */
export const fmtRange = (start, end, lang) =>
  end ? `${fmtTime(start, lang)} – ${fmtTime(end, lang)}` : fmtTime(start, lang);

/**
 * Dates are stored as plain "YYYY-MM-DD" and must not shift by timezone, so
 * they are parsed as local noon rather than through Date's UTC-midnight path.
 */
export const parseDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

/** "Fri 11 Sep" — the short form used on the day strip. */
export const fmtDayShort = (iso, lang) =>
  new Intl.DateTimeFormat(lang === 'es' ? 'es-PE' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(parseDate(iso));

/** "Friday, 11 September" — the heading form. */
export const fmtDayLong = (iso, lang) =>
  new Intl.DateTimeFormat(lang === 'es' ? 'es-PE' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseDate(iso));

/** A stored date + a stored time as one Date, in local (Lima) time. */
export function at(iso, hhmm) {
  const d = parseDate(iso);
  const mins = toMinutes(hhmm);
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
}

/**
 * How far away something is, said the way a person would: "in 40 min",
 * "in 3 h", "tomorrow", "Saturday". Under a minute reads as "now".
 */
export function untilLabel(when, now, lang) {
  const mins = Math.round((when - now) / 60000);
  const es = lang === 'es';
  if (mins <= 0) return es ? 'ahora' : 'now';
  if (mins < 60) return es ? `en ${mins} min` : `in ${mins} min`;
  if (mins < 20 * 60) {
    const h = Math.floor(mins / 60);
    const rest = mins % 60;
    const head = es ? `en ${h} h` : `in ${h} h`;
    return rest ? `${head} ${rest} min` : head;
  }
  const days = Math.round((parseDate(toIso(when)) - parseDate(toIso(now))) / 86400000);
  if (days === 1) return es ? 'mañana' : 'tomorrow';
  return new Intl.DateTimeFormat(es ? 'es-PE' : 'en-GB', { weekday: 'long' }).format(when);
}

const toIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Today as "YYYY-MM-DD" in local time — comparable with the stored dates. */
export const todayIso = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
