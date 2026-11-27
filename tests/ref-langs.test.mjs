// Мови лише з довідником (R у src/data.ts): розділи, приклади, англійська версія без кирилиці
// Запуск: node tests/ref-langs.test.mjs   (REF_LANG=rust перевіряє одну мову)
import assert from "node:assert/strict";
import { R } from "../src/data.ts";
import { REF } from "../src/data/reference/index.ts";
import { refSections } from "../src/i18n-ref.ts";
import { inLang } from "../src/i18n.ts";

const CY = /[А-ЯІЇЄҐа-яіїєґ]/;
const only = process.env.REF_LANG;
const keys = Object.keys(R).filter((k) => !only || k === only);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("ok  -", name); };

for (const k of keys) {
  const secs = REF[k];
  test(`${k}: щонайменше 8 розділів, у кожному 2–4 приклади, усього 18+ прикладів`, () => {
    assert.ok(secs && secs.length >= 8, `розділів ${secs?.length}`);
    let n = 0;
    for (const s of secs) {
      assert.ok(s.t && s.items.length >= 2 && s.items.length <= 4, `${s.t}: ${s.items.length} прикладів`);
      n += s.items.length;
    }
    assert.ok(n >= 18, `прикладів ${n}`);
    assert.equal(new Set(secs.map((s) => s.t)).size, secs.length, "заголовки розділів унікальні");
  });
  test(`${k}: кожен приклад має заголовок, код і пояснення з 30–220 символів; код до 16 рядків`, () => {
    for (const s of secs) for (const x of s.items) {
      const w = `${s.t}/${x.t}`;
      assert.ok(x.t && x.code.trim().length > 5, w);
      assert.ok(x.note && x.note.length >= 30 && x.note.length <= 220, `${w}: пояснення ${x.note?.length}`);
      assert.ok(x.code.split("\n").length <= 16, `${w}: код задовгий`);
    }
  });
  test(`${k}: англійська версія повна: та сама структура, без кирилиці, код без українських слів незмінний`, () => {
    const en = inLang("en", () => refSections(k));
    assert.equal(en.length, secs.length);
    secs.forEach((s, i) => {
      assert.ok(!CY.test(en[i].t), `${k}: ${s.t}`);
      assert.equal(en[i].items.length, s.items.length);
      s.items.forEach((x, j) => {
        const y = en[i].items[j];
        assert.ok(!CY.test(y.t) && !CY.test(y.note ?? "") && !CY.test(y.code), `${k}/${s.t}/${x.t}: ${[y.t, y.note, y.code].filter((z) => CY.test(z ?? "")).join(" | ").slice(0, 100)}`);
        const a = x.code.split("\n"), b = y.code.split("\n");
        assert.equal(b.length, a.length);
        a.forEach((line, n) => { if (!CY.test(line)) assert.equal(b[n], line); });
      });
    });
  });
}
console.log(`\nУсі перевірки довідників без курсів пройдено: ${passed}`);
