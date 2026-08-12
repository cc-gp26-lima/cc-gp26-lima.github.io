import { t } from '../../shared/format.js';
import Icon from './Icon.jsx';

/**
 * The whole meal arrangement on one screen. There is no per-day breakdown
 * because there is no per-day difference: the same ceiling applies at every
 * lunch and every dinner until a guest checks out. What varies is only what
 * they order, which is not ours to list.
 */
export default function MealsTab({ guide, meals, lang }) {
  const ui = guide.ui;
  const a = meals.allowance;

  return (
    <div>
      <section className="ink-card rounded-xl bg-ink px-5 py-5 text-canvas">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="font-display text-[46px] leading-none font-semibold tabular-nums">
            S/ {a.perService}
          </p>
          <div>
            <p className="font-display text-[17px] font-semibold">{t(a.headline, lang)}</p>
            <p className="text-[12.5px] text-canvas/60">
              {t(ui.coveredBy, lang)} {t(a.payer, lang)}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 border-t border-canvas/12 pt-3.5 text-[13.5px]">
          <li className="flex items-start gap-2.5">
            <Icon name="clock" size={16} className="mt-0.5 shrink-0 text-amber" />
            <span>{t(a.scope, lang)}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="fork" size={16} className="mt-0.5 shrink-0 text-amber" />
            <span>{t(a.excludes, lang)}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="badge" size={16} className="mt-0.5 shrink-0 text-amber" />
            <span>{t(a.overage, lang)}</span>
          </li>
        </ul>
      </section>

      <dl className="mt-5 divide-y divide-hair rounded-xl border border-rule bg-surface px-4">
        {meals.rules.map((rule) => (
          <div key={rule.id} className="py-3">
            <dt className="font-display text-[15px] font-semibold text-ink">{t(rule.title, lang)}</dt>
            <dd className="mt-0.5 max-w-[80ch] text-[13.5px] text-soft">{t(rule.body, lang)}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[12.5px] text-faint">{t(ui.askDesk, lang)}</p>
    </div>
  );
}
