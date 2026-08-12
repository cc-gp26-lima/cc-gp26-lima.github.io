import { t } from '../../shared/format.js';
import Icon from './Icon.jsx';

/**
 * The hand-off to the separate dining reference. It stays its own app — it has
 * a map, filters and a PDF — so this tab is a deliberate doorway rather than a
 * copy of its data.
 */
export default function DiningTab({ guide, lang }) {
  const ui = guide.ui;
  const link = guide.links.dining;

  return (
    <section className="rounded-xl border border-rule bg-surface p-5">
      <div className="flex items-start gap-3">
        <Icon name="fork" size={22} className="mt-1 shrink-0 text-accent" />
        <div>
          <h2 className="font-display text-[20px] font-semibold">{t(link.title, lang)}</h2>
          <p className="mt-1.5 max-w-[74ch] text-[14px] text-soft">{t(link.body, lang)}</p>

          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-[12px] font-bold tracking-[0.12em] text-white uppercase hover:opacity-90"
          >
            {t(ui.openGuide, lang)} →
          </a>
        </div>
      </div>
    </section>
  );
}
