import { useEffect, useRef, useState } from 'react';

import { t, fmtTime, fmtDayLong } from '../../shared/format.js';
import { sessionsOn, dayOn, venue, agenda, isDone } from '../../shared/data.js';
import Icon from './Icon.jsx';

/** Weight categories as chips — the index a judo programme is really read by. */
function Categories({ categories, ui, lang, tone = 'bg-surface text-ink border border-rule' }) {
  if (!categories) return null;
  const groups = [
    [t(ui.women, lang), categories.w],
    [t(ui.men, lang), categories.m],
  ].filter(([, list]) => list?.length);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {groups.map(([label, list]) => (
        <span key={label} className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-faint">{label}</span>
          {list.map((c) => (
            <span key={c} className={`rounded px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums ${tone}`}>
              {c}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

/**
 * One line of the programme, laid out like the official table: when, what,
 * where. Competition rows carry the weight; team paperwork stays grey so the
 * events read first. Everything else opens on tap.
 */
/** The day header already lists the day's classes; a row repeats them only when
 *  it differs — a weigh-in, which is always for the next day's categories. */
const sameAsDay = (s, day) => JSON.stringify(s.categories ?? null) === JSON.stringify(day?.categories ?? null);

function Row({ session: s, guide, lang, status, done, open, onToggle, expandAll, categories }) {
  const ui = guide.ui;
  const place = venue(guide, s.venue);
  // Headline moments state themselves in full — a guest should never have to
  // discover that the gala has a dress code and a departure time.
  const alwaysOpen = Boolean(s.highlight);
  const shown = open || expandAll || alwaysOpen;
  const isEvent = s.kind !== 'logistics';
  const hasDetail = Boolean(t(s.host, lang) || t(s.note, lang) || s.rsvp?.email || place?.address);

  return (
    <li
      className={`border-l-[3px] ${done ? 'opacity-45' : ''} ${
        status === 'now'
          ? 'border-l-accent bg-accent-soft'
          : s.highlight
            ? 'border-l-accent bg-accent-soft/60'
            : status === 'next'
              ? 'border-l-accent/40 bg-surface'
              : isEvent
                ? 'border-l-competition/25 bg-surface'
                : 'border-l-transparent bg-transparent'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={shown}
        disabled={!hasDetail || alwaysOpen}
        className="flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left disabled:cursor-default"
      >
        <span
          className={`w-[68px] shrink-0 font-display text-[15px] leading-tight font-semibold tabular-nums ${
            s.tbc ? 'text-faint' : isEvent ? 'text-accent' : 'text-soft'
          }`}
        >
          {s.tbc ? (
            <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase">{t(ui.tbc, lang)}</span>
          ) : (
            fmtTime(s.start, lang)
          )}
          {s.end && !s.tbc && (
            <span className="block text-[11.5px] font-normal text-faint">{fmtTime(s.end, lang)}</span>
          )}
        </span>

        {/* A headline event carries a filled mark; everything else a plain glyph. */}
        {s.highlight ? (
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent text-white">
            <Icon name={s.icon} kind={s.kind} size={16} />
          </span>
        ) : (
          <Icon
            name={s.icon}
            kind={s.kind}
            size={17}
            className={`mt-0.5 shrink-0 ${isEvent ? 'text-competition' : 'text-faint'}`}
          />
        )}

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`font-display leading-tight font-semibold ${
                s.highlight
                  ? 'text-[20px] text-ink'
                  : isEvent
                    ? 'text-[17px] text-ink'
                    : 'text-[14.5px] text-soft'
              }`}
            >
              {t(s.title, lang)}
            </span>
            {done && !status && (
              <span className="rounded-full bg-raised px-2 py-0.5 text-[9.5px] font-bold tracking-[0.14em] uppercase text-faint">
                {t(ui.finished, lang)}
              </span>
            )}
            {status && (
              <span
                className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.14em] uppercase ${
                  status === 'now' ? 'bg-accent text-white' : 'border border-accent/40 text-accent'
                }`}
              >
                {t(status === 'now' ? ui.currentBlock : ui.upNext, lang)}
              </span>
            )}
            {s.audience === 'team' && (
              <span className="text-[9.5px] font-bold tracking-[0.12em] uppercase text-faint">
                {t(ui.teamOnly, lang)}
              </span>
            )}
          </span>

          {t(s.action, lang) && (
            <span className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-accent">
              <Icon name="clock" size={13} />
              {t(s.action, lang)}
            </span>
          )}

          {categories && (
            <span className="mt-1.5 block">
              <Categories categories={categories} ui={ui} lang={lang} />
            </span>
          )}
        </span>

        {place && (
          <span className="hidden w-[136px] shrink-0 text-right text-[12.5px] text-soft sm:block">
            {t(place.short, lang) || t(place.name, lang)}
          </span>
        )}
      </button>

      {shown && (
        <div className="space-y-1.5 px-3 pb-3 pl-[92px] text-[13px] text-soft">
          {place && (
            <p className="text-faint">
              {t(place.name, lang)} · {place.address}
              {place.mapUrl && (
                <>
                  {' '}
                  <a
                    href={place.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-rule underline-offset-2 hover:text-accent"
                  >
                    {t(ui.openMap, lang)}
                  </a>
                </>
              )}
            </p>
          )}
          {t(s.dress, lang) && (
            <p className="flex items-center gap-2">
              <span className="text-[10.5px] tracking-[0.12em] uppercase text-faint">
                {t(ui.dress, lang)}
              </span>
              <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[12px] font-semibold text-accent">
                {t(s.dress, lang)}
              </span>
            </p>
          )}
          {t(s.host, lang) && <p className="font-display text-ink italic">{t(s.host, lang)}</p>}
          {t(s.note, lang) && <p className="max-w-[74ch]">{t(s.note, lang)}</p>}
          {/* RSVP is email-only on a public page; a phone is tolerated but never assumed. */}
          {s.rsvp?.email && (
            <p>
              <span className="text-[10.5px] tracking-[0.12em] uppercase text-faint">
                {t(ui.rsvp, lang)}
              </span>{' '}
              <a href={`mailto:${s.rsvp.email}`} className="font-semibold hover:text-accent">
                {s.rsvp.email}
              </a>
            </p>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * The whole programme in one column, the way the official table reads: every
 * day in order, events first-class and paperwork subdued, with the current and
 * next blocks called out. The day chips jump between sections rather than
 * filtering, so a guest never loses sight of what comes after today.
 */
export default function ProgrammeTab({ guide, schedule, date, setDate, jumpNonce, lang, now, expandAll }) {
  const [openId, setOpenId] = useState(null);
  const ui = guide.ui;
  const sections = useRef({});
  const { now: current, next } = agenda(schedule, now);

  /**
   * Only a tap on a day chip scrolls the page. `jumpNonce` changes on each tap,
   * including a repeat tap on the same day; watching the date instead would
   * make the observer's own updates scroll the page, and ordinary scrolling
   * would snap from day to day.
   */
  const settling = useRef(0);
  useEffect(() => {
    if (!jumpNonce) return;
    settling.current = Date.now() + 700; // ignore observer noise while it glides
    sections.current[date]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [jumpNonce]);

  /**
   * Scrolling is the other way to change days, so the chips follow the page:
   * whichever day heading sits just under the sticky strip becomes the active
   * chip. Without this a guest scrolls into Saturday while the strip still
   * insists it is Tuesday.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < settling.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.dataset.date) setDate(visible.target.dataset.date);
      },
      // A band just below the sticky strip: the first section to enter it wins.
      { rootMargin: '-104px 0px -68% 0px', threshold: 0 },
    );
    for (const el of Object.values(sections.current)) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [setDate]);

  const statusOf = (s) => (s.id === current?.session.id ? 'now' : s.id === next?.session.id ? 'next' : null);

  return (
    <div>
      <div className="space-y-6">
        {schedule.days.map((day) => {
          const sessions = sessionsOn(schedule, day.date);

          const dayRecord = dayOn(schedule, day.date);

          return (
            <section
              key={day.date}
              ref={(el) => (sections.current[day.date] = el)}
              data-date={day.date}
              className={`scroll-mt-[104px] ${
                dayRecord?.competitionDay
                  ? 'rounded-xl border border-accent/30 bg-accent-soft/40 px-3 pt-3 pb-1 shadow-[0_1px_0_rgba(200,16,46,0.08)]'
                  : ''
              }`}
            >
              <div
                className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-1.5 ${
                  dayRecord?.competitionDay ? 'border-b-2 border-accent/40' : 'border-b-2 border-ink'
                }`}
              >
                <h2
                  className={`font-display font-semibold ${
                    dayRecord?.competitionDay ? 'text-[21px] text-accent' : 'text-[19px]'
                  }`}
                >
                  {fmtDayLong(day.date, lang)}
                </h2>
                {dayRecord?.competitionDay && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                    {t(ui.competitionDay, lang)} {dayRecord.competitionDay}
                  </span>
                )}
                {day.label && <span className="text-[12.5px] text-faint">{t(day.label, lang)}</span>}
              </div>

              {dayRecord?.categories && (
                <div className="mt-2">
                  <Categories categories={dayRecord.categories} ui={ui} lang={lang} />
                </div>
              )}

              {/* A day can be all team paperwork — Wednesday is. Say so, rather
                  than dropping the day and leaving its chip pointing at nothing. */}
              {sessions.length === 0 ? (
                <p className="mt-2 px-3 py-2 text-[13px] text-faint">{t(ui.noEvents, lang)}</p>
              ) : (
              <ul className="mt-2 divide-y divide-hair">
                {sessions.map((s) => (
                  <Row
                    key={s.id}
                    session={s}
                    guide={guide}
                    lang={lang}
                    status={statusOf(s)}
                    done={isDone(s, day.date, now)}
                    categories={sameAsDay(s, dayRecord) ? null : s.categories}
                    open={openId === s.id}
                    onToggle={() => setOpenId((v) => (v === s.id ? null : s.id))}
                    expandAll={expandAll}
                  />
                ))}
              </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
