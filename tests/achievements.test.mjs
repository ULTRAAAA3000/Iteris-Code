// Досягнення: каталог і правила отримання (чиста логіка, без БД).
// Запуск: node tests/achievements.test.mjs
import assert from "node:assert/strict";
import { ACHIEVEMENTS, achIcon, earnedAchievements } from "../src/data/achievements.ts";

const z = { lessons: 0, tasks: 0, level: 1, streakBest: 0, coursesDone: 0 };
let n = 0;
const test = (name, fn) => { fn(); n++; console.log("ok -", name); };

test("id унікальні, іконки існують", () => {
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
  for (const a of ACHIEVEMENTS) assert.ok(achIcon(a.icon).includes("<path"), a.id);
});
test("новачок нічого не має", () => assert.deepEqual(earnedAchievements(z), []));
test("перший урок і завдання", () => assert.deepEqual(earnedAchievements({ ...z, lessons: 1, tasks: 1 }), ["lesson1", "task1"]));
test("серія 7 дає 3 і 7, не 30", () => {
  const e = earnedAchievements({ ...z, streakBest: 7 });
  assert.ok(e.includes("streak3") && e.includes("streak7") && !e.includes("streak30"));
});
test("курс пройдено і рівні", () => {
  const e = earnedAchievements({ ...z, level: 10, coursesDone: 1 });
  assert.ok(e.includes("course1") && e.includes("level5") && e.includes("level10"));
});
console.log(n + " passed");
