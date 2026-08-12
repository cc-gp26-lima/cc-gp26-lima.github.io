import { useEffect, useRef } from 'react';

import { fmtDayShort, todayIso } from '../../shared/format.js';
import { dayOn } from '../../shared/data.js';

/**
 * The day selector, pinned above the programme. Competition days carry their
 * number — the whole event is spoken about as "day 1, day 2, day 3".
 */
export default function DayStrip({ dates, value, onChange, lang, ui, schedule }) {
  const today = todayIso();
  const strip = useRef(null);
  const chips = useRef({});

  /**
   * Scrolling the page changes the active day, so the strip has to keep that
   * chip in sight — otherwise the answer to "which day am I reading?" sits off
   * the right edge. Only the strip's own scroll position moves; touching
   * scrollIntoView here would drag the page as well.
   */
  useEffect(() => {
    const box = strip.current;
    const chip = chips.current[value];
    if (!box || !chip) return;

    const overflowLeft = chip.offsetLeft - box.scrollLeft;
    const overflowRight = overflowLeft + chip.offsetWidth - box.clientWidth;
    if (overflowLeft < 16) box.scrollTo({ left: chip.offsetLeft - 16, behavior: 'smooth' });
    else if (overflowRight > -16) box.scrollTo({ left: box.scrollLeft + overflowRight + 16, behavior: 'smooth' });
  }, [value]);

  return (
    <div
      ref={strip}
      className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] no-print"
      role="tablist"
      aria-label="Day"
    >
      {dates.map((date) => {
        const active = date === value;
        const n = schedule ? dayOn(schedule, date)?.competitionDay : null;
        const muted = active ? 'text-white/75' : 'text-faint';

        return (
          <button
            key={date}
            ref={(el) => (chips.current[date] = el)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(date)}
            className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-[12px] font-semibold tracking-wide whitespace-nowrap transition-colors ${
              active
                ? 'border-accent bg-accent text-white'
                : 'border-rule bg-surface text-soft hover:border-accent hover:text-accent'
            }`}
          >
            {fmtDayShort(date, lang)}
            {n && <span className={`ml-1.5 text-[10.5px] tabular-nums ${muted}`}>D{n}</span>}
            {date === today && (
              <span className={`ml-1.5 text-[10px] uppercase ${muted}`}>{ui.today[lang] ?? ui.today.en}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
