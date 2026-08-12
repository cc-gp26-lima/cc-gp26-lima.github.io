#!/usr/bin/env node
/**
 * Structural check on data/*.json. Exits non-zero on any problem.
 * Outstanding TODO placeholders are listed as a reminder but never fail the
 * build — the skeleton is meant to be publishable while copy is still landing.
 */

import { loadData } from './lib/load.mjs';
import { validate, todos } from '../shared/data.js';

const data = await loadData();
const problems = validate(data);

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}

const sessions = data.schedule.days.reduce((n, d) => n + d.sessions.length, 0);
console.log(
  `✓ ${data.schedule.days.length} days · ${sessions} sessions · ${data.meals.rules.length} meal rules — data is valid`,
);

const pending = todos(data);
if (pending.length) {
  console.log(`\n⚠ ${pending.length} field(s) still marked TODO:`);
  for (const p of pending) console.log(`  · ${p}`);
}
