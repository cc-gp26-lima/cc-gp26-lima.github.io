import { t } from '../../shared/format.js';
import Icon from './Icon.jsx';

/**
 * The questions guests actually ask, and who to ask. Anything the hotel already
 * handles — Wi-Fi, laundry, room service — is named once and handed back to
 * reception rather than restated here.
 */
export default function EssentialsTab({ guide, lang }) {
  const ui = guide.ui;
  const [desk, ...rest] = guide.contacts;

  return (
    <div>
      <section className="rounded-xl border border-rule border-l-[3px] border-l-accent bg-surface px-4 py-3.5">
        <div className="flex items-start gap-3">
          <Icon name="badge" size={20} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <h2 className="font-display text-[17px] font-semibold">{t(desk.role, lang)}</h2>
            <p className="mt-0.5 font-display text-[19px] font-semibold text-accent">
              {t(desk.name, lang)}
            </p>
            <p className="mt-1 max-w-[70ch] text-[13.5px] text-soft">{t(desk.note, lang)}</p>
          </div>
        </div>
      </section>

      <dl className="mt-4 divide-y divide-hair rounded-xl border border-rule bg-surface px-4">
        {guide.essentials
          .filter((row) => row.id !== 'desk')
          .map((row) => (
            <div key={row.id} className="py-3">
              <dt className="font-display text-[15px] font-semibold text-ink">{t(row.ask, lang)}</dt>
              <dd className="mt-0.5 max-w-[80ch] text-[13.5px] text-soft">{t(row.answer, lang)}</dd>
            </div>
          ))}
      </dl>

      {rest.map((c) => (
        <p key={c.id} className="mt-4 text-[13px] text-soft">
          <span className="text-[10.5px] tracking-[0.12em] uppercase text-faint">{t(c.role, lang)}</span>{' '}
          <a
            href={`mailto:${c.email}`}
            className="font-semibold underline decoration-rule underline-offset-2 hover:text-accent"
          >
            {c.email}
          </a>
          <span className="text-faint"> — {t(c.note, lang)}</span>
        </p>
      ))}
    </div>
  );
}
