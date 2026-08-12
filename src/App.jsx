import { useEffect, useMemo, useState } from 'react';

import guide from '../data/guide.json';
import schedule from '../data/schedule.json';
import meals from '../data/meals.json';

import DayStrip from './components/DayStrip.jsx';
import NextUp from './components/NextUp.jsx';
import ProgrammeTab from './components/ProgrammeTab.jsx';
import MealsTab from './components/MealsTab.jsx';
import DiningTab from './components/DiningTab.jsx';
import EssentialsTab from './components/EssentialsTab.jsx';

import { t } from '../shared/format.js';
import { defaultDate } from '../shared/data.js';

/** Only the programme is read a day at a time; the meal arrangement never varies. */
const DATED_TABS = new Set(['programme']);

/** A clock that ticks once a minute — enough for "in 40 min" to stay honest. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/**
 * Everything collapsed on screen has to be open on paper — a printed guide has
 * no disclosure triangles.
 */
function usePrinting() {
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const on = () => setPrinting(true);
    const off = () => setPrinting(false);
    window.addEventListener('beforeprint', on);
    window.addEventListener('afterprint', off);
    return () => {
      window.removeEventListener('beforeprint', on);
      window.removeEventListener('afterprint', off);
    };
  }, []);
  return printing;
}

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('gp-guide-lang') || 'es');
  const [tab, setTab] = useState('programme');
  const now = useNow();
  const printing = usePrinting();
  const dates = useMemo(() => schedule.days.map((d) => d.date), []);
  const [date, setDate] = useState(() => defaultDate(dates));

  useEffect(() => {
    localStorage.setItem('gp-guide-lang', lang);
    document.documentElement.lang = lang;
    document.title = `${t(guide.meta.title, lang)} — ${t(guide.meta.event, lang)}`;
  }, [lang]);

  const ui = guide.ui;
  /** The hero is a shortcut into the programme: tapping it opens that day. */
  const openDay = (d) => {
    setDate(d);
    setTab('programme');
  };

  return (
    <div className="mx-auto max-w-[860px] px-5 pt-6 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-accent">
            {t(guide.meta.event, lang)}
          </p>
          <h1 className="font-display text-[27px] leading-tight font-semibold tracking-tight">
            {t(guide.meta.title, lang)}
          </h1>
        </div>

        <div className="flex items-center gap-2 no-print">
          <div
            className="flex overflow-hidden rounded-full border border-rule"
            role="group"
            aria-label="Language"
          >
            {['es', 'en'].map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={`cursor-pointer px-3 py-1.5 text-[11px] font-bold tracking-[0.1em] uppercase ${
                  lang === l ? 'bg-accent text-white' : 'bg-surface text-soft hover:text-accent'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="cursor-pointer rounded-full border border-rule bg-surface px-3 py-1.5 text-[11px] font-bold tracking-[0.1em] uppercase text-soft hover:border-accent hover:text-accent"
          >
            {t(ui.print, lang)}
          </button>
        </div>
      </header>

      <NextUp guide={guide} schedule={schedule} lang={lang} now={now} onOpen={openDay} />

      <nav
        className="mt-6 flex gap-5 overflow-x-auto border-b border-rule [scrollbar-width:none] no-print"
        role="tablist"
      >
        {Object.entries(ui.tabs).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px shrink-0 cursor-pointer border-b-2 px-0.5 pb-2 font-display text-[15px] whitespace-nowrap transition-colors ${
              tab === id
                ? 'border-accent font-semibold text-accent'
                : 'border-transparent text-faint hover:text-ink'
            }`}
          >
            {t(label, lang)}
          </button>
        ))}
      </nav>

      {/* The strip sticks: the day you are reading is always visible, and
          jumping to another one never means scrolling back to the top. */}
      {DATED_TABS.has(tab) && (
        <div className="sticky top-0 z-30 -mx-5 mt-4 border-b border-rule bg-canvas/95 px-5 py-2.5 backdrop-blur no-print">
          <DayStrip
            dates={dates}
            value={date}
            onChange={setDate}
            lang={lang}
            ui={ui}
            schedule={schedule}
          />
        </div>
      )}

      <main className="mt-5">
        {tab === 'programme' ? (
          <ProgrammeTab
            guide={guide}
            schedule={schedule}
            date={date}
            lang={lang}
            setDate={setDate}
            now={now}
            expandAll={printing}
          />
        ) : tab === 'meals' ? (
          <MealsTab guide={guide} meals={meals} lang={lang} />
        ) : tab === 'dining' ? (
          <DiningTab guide={guide} lang={lang} />
        ) : (
          <EssentialsTab guide={guide} lang={lang} />
        )}
      </main>

      <footer className="mt-10 space-y-1.5 border-t border-rule pt-4 text-[11.5px] text-faint">
        <p className="font-semibold text-soft">
          {t(guide.contacts[0].role, lang)} — {t(guide.contacts[0].name, lang)}
        </p>
        <p className="max-w-[80ch]">{t(guide.disclaimer.body, lang)}</p>
        <p>
          {t(guide.meta.verifiedLabel, lang)} {guide.meta.verified}
        </p>
      </footer>
    </div>
  );
}
