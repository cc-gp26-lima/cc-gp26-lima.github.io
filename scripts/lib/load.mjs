import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Load the three data files. */
export async function loadData() {
  const read = async (name) => JSON.parse(await readFile(resolve(ROOT, 'data', name), 'utf8'));
  const [guide, schedule, meals] = await Promise.all([
    read('guide.json'),
    read('schedule.json'),
    read('meals.json'),
  ]);
  return { guide, schedule, meals };
}
