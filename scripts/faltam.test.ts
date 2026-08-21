import { describe, it } from 'vitest';
import { getAllSpecialties } from '../src/curriculum';
describe('faltam', () => { it('lista', () => {
  let n = 0, alt = 0;
  for (const s of getAllSpecialties())
    for (const m of s.modules) for (const l of m.lessons) for (const q of (l.questions ?? []) as any[]) {
      const o = q.data.options || q.data.scenarios;
      if (!o) continue;
      const erradas = o.filter((x: any) => !x.correct);
      if (erradas.every((x: any) => x.porque)) continue;
      n++; alt += erradas.filter((x: any) => !x.porque).length;
      console.log(`\n${q.id} — ${q.prompt}`);
      for (const x of o) console.log(`  ${x.correct ? '>>' : '  '} ${x.text}`);
    }
  console.log(`\n### faltam ${n} questoes, ${alt} alternativas`);
}); });
