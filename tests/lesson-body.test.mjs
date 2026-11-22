// Єдиний шаблон тіла уроку (src/lesson-body.ts): тексти не змінюються, структура однакова для всіх курсів, збої в прикладах позначені.
// Запуск: node tests/lesson-body.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { codeFlag, lessonBody, placeExamples, readMinutes, splitParagraph } from "../src/lesson-body.ts";
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
      for (const x of [l.easy, l.note, l.work, ...l.tasks]) if (x) assert.ok(html.includes(x), `${at}: текст змінено: ${x.slice(0, 40)}…`);
      for (const x of l.p) assert.ok(html.includes(splitParagraph(x).map((c) => `<p>${c}</p>`).join("")), `${at}: абзац змінено: ${x.slice(0, 40)}…`);
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

for (const [course, lessons] of Object.entries(sets)) {
  test(`${course}: приклади розставлені за порядком між абзацами, нічого не загублено`, () => {
    for (const l of lessons) {
      const at = placeExamples(l.p, l.code), where = `${course} «${l.t}»`;
      assert.equal(at.length, l.code.length, `${where}: кількість місць`);
      for (let i = 0; i < at.length; i++) {
        assert.ok(at[i] >= 0 && at[i] < l.p.length, `${where}: місце ${at[i]} поза абзацами`);
        if (i) assert.ok(at[i] >= at[i - 1], `${where}: порядок прикладів порушено`);
      }
      const html = lessonBody(l);
      let from = 0;
      for (const x of l.p) { const pos = html.indexOf(`<p>${splitParagraph(x)[0]}</p>`, from); assert.ok(pos >= from, `${where}: порядок абзаців змінено`); from = pos; }
      assert.ok(!html.includes('<h2 id="l-code">'), `${where}: приклади більше не окремий розділ`);
    }
  });
}

test("довгі абзаци діляться по реченнях, текст при цьому не змінюється", () => {
  let split = 0, total = 0;
  for (const lessons of Object.values(sets)) for (const l of lessons) for (const x of l.p) {
    const parts = splitParagraph(x);
    total++; if (parts.length > 1) split++;
    assert.equal(parts.join(" ").replace(/\s+/g, " "), x.replace(/\s+/g, " "), `текст абзацу змінено: ${x.slice(0, 40)}…`);
    assert.ok(parts.length <= 5, `занадто багато частин: ${parts.length}`);
    for (const c of parts) {
      assert.ok(c.trim().length > 0 && c === c.trim(), "порожня частина або зайві пробіли по краях");
      assert.equal((c.match(/<code>/g) ?? []).length, (c.match(/<\/code>/g) ?? []).length, `тег <code> розірвано: ${c.slice(0, 50)}…`);
      assert.equal((c.match(/<b>/g) ?? []).length, (c.match(/<\/b>/g) ?? []).length, "тег <b> розірвано");
    }
    if (parts.length > 1) for (const c of parts) assert.ok(c.length >= 95, `частина закоротка: ${c}`);
  }
  assert.ok(split > total * 0.3, `розбито лише ${split} із ${total} абзаців`);
});

test("короткі абзаци не ріжуться; скорочення й крапки всередині <code> не вважаються кінцем речення", () => {
  assert.deepEqual(splitParagraph("Коротко. Дуже."), ["Коротко. Дуже."]);
  const long = "Перше речення про щось доволі довге, щоб набрати потрібну кількість символів у першій частині абзацу, і ще трохи слів для надійності. " +
    "Викликайте <code>fmt.Println. Далі</code> так, як показано, і не плутайте з іншим способом, бо це один із найпоширеніших випадків у реальному коді. " +
    "Це стосується, напр. Go та ін. мов. Останнє речення лишається окремою частиною, і воно теж достатньо довге для цього.";
  const parts = splitParagraph(long);
  assert.ok(parts.length >= 2);
  assert.ok(parts.every((c) => !c.includes("<code>fmt.Println.") || c.includes("Далі</code>")), "розрізано всередині <code>");
  assert.ok(parts.every((c) => !/(напр\.|ін\.)$/.test(c)), "розрізано після скорочення");
});

test("приклад іде одразу за абзацом, у якому його пояснено", () => {
  const l = GO_LESSONS.find((x) => x.t.startsWith("Змінні: var"));
  const html = lessonBody(l);
  const p2 = html.indexOf(splitParagraph(l.p[1])[0]), p3 = html.indexOf(splitParagraph(l.p[2])[0]), fig = html.indexOf("<figure");
  assert.ok(p2 > 0 && fig > p2 && fig < p3, "перший приклад (var age int = 17…) має стояти між 2-м і 3-м абзацами");
  assert.ok(placeExamples(l.p, l.code)[0] === 1);
});

test("приклади без збігів із текстом розподіляються рівномірно, а не збираються в кінці", () => {
  const ps = ["Вступ.", "Один.", "Два.", "Три.", "Чотири.", "П'ять."];
  assert.deepEqual(placeExamples(ps, ["a", "b", "c"]), [1, 3, 4]);
  assert.deepEqual(placeExamples(ps, []), []);
  assert.deepEqual(placeExamples([], ["a"]), [0]);
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
