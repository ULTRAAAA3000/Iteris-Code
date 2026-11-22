// Єдиний шаблон тіла уроку (src/lesson-body.ts): тексти не змінюються, структура однакова для всіх курсів, збої в прикладах позначені.
// Запуск: node tests/lesson-body.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { codeFlag, lessonBody, readMinutes } from "../src/lesson-body.ts";
import { GO_LESSONS } from "../content/go/index.js";
import { LESSONS_01 } from "../content/python/ch01.js";

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("ok  -", name); };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const sets = { go: GO_LESSONS, python: LESSONS_01 };
for (const [course, lessons] of Object.entries(sets)) {
  test(`${course}: ${lessons.length} уроків мають однакову структуру, а текст лишається дослівним`, () => {
    for (const l of lessons) {
      const html = lessonBody(l), at = `${course} «${l.t}»`;
      for (const id of ["l-theory", "l-code", "l-note", "l-check"]) assert.ok(html.includes(`id="${id}"`), `${at}: немає розділу ${id}`);
      assert.equal(html.includes('id="l-work"'), !!l.work, `${at}: блок «Як це в роботі»`);
      assert.equal((html.match(/<figure class="ex/g) ?? []).length, l.code.length, `${at}: кількість прикладів`);
      assert.equal((html.match(/<li><input type="checkbox"/g) ?? []).length, l.tasks.length, `${at}: кількість завдань`);
      for (const x of [l.easy, ...l.p, l.note, l.work, ...l.tasks]) if (x) assert.ok(html.includes(x), `${at}: текст змінено: ${x.slice(0, 40)}…`);
      for (const x of l.code) assert.ok(html.includes(esc(x)), `${at}: код змінено або не екрановано`);
      const m = readMinutes(l);
      assert.ok(m >= 1 && m <= 15, `${at}: час читання ${m} хв виглядає неправдоподібно`);
    }
  });
}

test("позначки збою в першому рядку прикладу дають мітку; звичайний код і коментар не в першому рядку її не мають", () => {
  assert.deepEqual(codeFlag("// не компілюється: незакрита лапка\nfmt.Println(1)"), { kind: "err", label: "Не компілюється" });
  assert.equal(codeFlag("# аварія: ділення на нуль\nprint(1 / 0)")?.kind, "crash");
  assert.equal(codeFlag("// лише компіляція: нічого не друкує\nfunc main() {}")?.kind, "build");
  assert.equal(codeFlag("# фрагмент: команди термінала\npython --version")?.kind, "frag");
  assert.equal(codeFlag("print(1)\n# аварія пізніше в тексті"), null);
  assert.equal(codeFlag("x = 1  # не компілюється"), null);
  assert.equal(codeFlag(""), null);
});

test("код з тегами екранується, дозволена розмітка текстів лишається", () => {
  const html = lessonBody({ t: "T", p: ["Один <code>x</code>."], code: ["a < b && c > d"], note: "N <b>b</b>", tasks: ["Зробіть <i>це</i>."] });
  assert.ok(html.includes("a &lt; b &amp;&amp; c &gt; d") && html.includes("<code>x</code>") && !html.includes('id="l-work"'));
});

test("у збірку підключено lesson.css, а в ньому є стилі всіх класів шаблону", () => {
  const css = readFileSync(new URL("../src/lesson.css", import.meta.url), "utf8");
  const build = readFileSync(new URL("../build.mjs", import.meta.url), "utf8");
  assert.ok(build.includes("src/lesson.css"));
  for (const c of [".l-body", ".l-toc", ".l-chip", ".l-theory", ".ex", ".ex-flag", ".fl-err", ".l-work", ".co-note"]) assert.ok(css.includes(c), `у lesson.css немає ${c}`);
});

console.log(`\nУсі перевірки пройдено: ${passed}`);
