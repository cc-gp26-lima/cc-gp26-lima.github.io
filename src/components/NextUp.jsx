import { t, fmtTime, fmtDayShort, untilLabel } from '../../shared/format.js';
import { agenda, venue } from '../../shared/data.js';
import Icon from './Icon.jsx';

/**
 * The answer to "what do I do now?", before any tab is chosen. Dark card, one
 * big time, one place, one instruction — everything else on the page is
 * reference material a guest consults; this is the part they act on.
 */
export default function NextUp({ guide, schedule, lang, now, onOpen }) {
  const ui = guide.ui;
  const { now: current, next } = agenda(schedule, now);
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
  const after = live ? next : null;

  return (
    <section
      className="ink-card mt-5 overflow-hidden rounded-xl bg-ink text-canvas"
      aria-label={t(live ? ui.now : ui.nextUp, lang)}
    >
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
      </button>

      {(t(lead.session.action, lang) || after) && (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-canvas/12 px-5 py-2.5">
          {t(lead.session.action, lang) ? (
            <p className="flex items-center gap-2 text-[13.5px] font-semibold text-amber">
              <Icon name="clock" size={16} />
              {t(lead.session.action, lang)}
            </p>
          ) : (
            <span />
          )}
          {after && (
            <p className="text-[12.5px] text-canvas/55">
              {t(ui.thenAfter, lang)} · {fmtTime(after.session.start, lang)}{' '}
              {t(after.session.title, lang)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
