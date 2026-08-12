import { t, fmtTime, fmtDayShort, untilLabel } from '../../shared/format.js';
import { agenda, venue } from '../../shared/data.js';
import Icon from './Icon.jsx';

/**
 * A small line above or below the headline: what just finished, and what comes
 * after. Together the three tiers say where the day has got to, which is what a
 * guest is really asking when they open the page.
 */
function Aside({ entry, guide, lang, label, tone, onOpen }) {
  const place = venue(guide, entry.session.venue);

  return (
    <button
      type="button"
      onClick={() => onOpen(entry.date)}
      className="flex w-full cursor-pointer items-baseline gap-2.5 px-5 py-2 text-left text-[12.5px]"
    >
      <span
        className={`shrink-0 text-[9.5px] font-bold tracking-[0.14em] uppercase ${
          tone === 'done' ? 'text-canvas/40' : 'text-canvas/55'
        }`}
      >
        {label}
      </span>
      <span
        className={`font-semibold tabular-nums ${tone === 'done' ? 'text-canvas/45' : 'text-canvas/80'}`}
      >
        {fmtTime(entry.session.start, lang)}
      </span>
      <span className={`truncate ${tone === 'done' ? 'text-canvas/45' : 'text-canvas/80'}`}>
        {t(entry.session.title, lang)}
      </span>
      {place && (
        <span className="ml-auto hidden shrink-0 text-canvas/40 sm:block">
          {t(place.short, lang) || t(place.name, lang)}
        </span>
      )}
    </button>
  );
}

/**
 * The answer to "where are we?", before any tab is chosen: what just finished,
 * what is on now (or next), and what follows it.
 */
export default function NextUp({ guide, schedule, lang, now, onOpen }) {
  const ui = guide.ui;
  const { previous, now: current, next, after } = agenda(schedule, now);
  const lead = current ?? next;

  if (!lead) {
    return (
      <section className="ink-card mt-5 rounded-xl bg-ink px-5 py-4 text-canvas">
        <p className="font-display text-lg">{t(ui.eventOver, lang)}</p>
      </section>
    );
  }

  const live = lead === current;
  const place = venue(guide, lead.session.venue);
  const following = live ? next : after;

  return (
    <section
      className="ink-card mt-5 overflow-hidden rounded-xl bg-ink text-canvas"
      aria-label={t(live ? ui.now : ui.nextUp, lang)}
    >
      {previous && (
        <div className="border-b border-canvas/10">
          <Aside
            entry={previous}
            guide={guide}
            lang={lang}
            label={t(ui.finished, lang)}
            tone="done"
            onOpen={onOpen}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onOpen(lead.date)}
        className="block w-full cursor-pointer px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase">
          <span className={live ? 'text-amber' : 'text-canvas/55'}>
            {live ? t(ui.now, lang) : t(ui.nextUp, lang)}
          </span>
          {!live && (
            <span className="rounded-full bg-canvas/12 px-2 py-0.5 tracking-[0.1em] text-canvas/80 normal-case">
              {untilLabel(lead.start, now, lang)}
            </span>
          )}
          {live && <span className="size-1.5 animate-pulse rounded-full bg-amber" />}
        </div>

        <div className="mt-2.5 flex items-start gap-4">
          <Icon
            name={lead.session.icon}
            kind={lead.session.kind}
            size={30}
            className="mt-1 shrink-0 text-canvas/70"
          />
          <div className="min-w-0">
            <p className="font-display text-[34px] leading-none font-semibold tabular-nums">
              {fmtTime(lead.session.start, lang)}
              <span className="ml-3 text-[15px] font-normal tracking-wide text-canvas/55 uppercase">
                {fmtDayShort(lead.date, lang)}
              </span>
            </p>
            <h2 className="mt-1.5 font-display text-2xl leading-tight font-semibold">
              {t(lead.session.title, lang)}
            </h2>
            {place && (
              <p className="mt-1 text-[14px] text-canvas/70">
                {t(place.short, lang) || t(place.name, lang)}
              </p>
            )}
          </div>
        </div>

        {t(lead.session.action, lang) && (
          <p className="mt-3 flex items-center gap-2 text-[13.5px] font-semibold text-amber">
            <Icon name="clock" size={16} />
            {t(lead.session.action, lang)}
          </p>
        )}
      </button>

      {following && (
        <div className="border-t border-canvas/10">
          <Aside
            entry={following}
            guide={guide}
            lang={lang}
            label={t(ui.thenAfter, lang)}
            tone="upcoming"
            onOpen={onOpen}
          />
        </div>
      )}
    </section>
  );
}
