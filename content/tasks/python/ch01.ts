// Практичні завдання глави «Початок» (уроки 1–4). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_01: readonly RemoteTask[] = [
  {
    ...base, id: "python-hello-run", lesson: "python/1", xp: 15,
    title: "Перший запуск: привітання і обчислення",
    context: "Python часто використовують як калькулятор і швидкий скрипт: написав рядок, запустив, побачив результат. Із цього починається будь-яка автоматизація.",
    brief: [
      "Виведіть два рядки: <code>Привіт, Python!</code> і результат виразу <code>2 ** 10</code> (піднесення до степеня), а саме число, без готової відповіді в коді.",
      "Натисніть «Запустити»: код виконається на сервері, а вивід з'явиться в терміналі.",
    ],
    starter: raw`# Виведіть: Привіт, Python! і значення 2 ** 10
print()
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, Python!»", has: "Привіт, Python!", hint: "Текст у лапках передайте в print: print(\"Привіт, Python!\")." },
      { on: "stdout", name: "Друге число дорівнює 1024", has: "1024", hint: "У другому print напишіть вираз 2 ** 10 без лапок, тоді Python його обчислить." },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, Python!\n1024", hint: "Має бути рівно два рядки: порожніх print або зайвого тексту бути не повинно." },
      { on: "source", name: "Число обчислюється виразом 2 ** 10", matches: "2\\s*\\*\\*\\s*10", hint: "Не вписуйте 1024 руками: нехай відповідь обчислить сама програма." },
    ],
  },
  {
    ...base, id: "python-print-sep-end", lesson: "python/2", xp: 15,
    title: "print: розділювач sep і закінчення end",
    context: "Параметри sep і end керують виводом: через них роблять списки в один рядок, індикатори прогресу, CSV-рядки. Без зайвої склейки рядків руками.",
    brief: [
      "Першим рядком виведіть <code>Go-Rust-Python</code> одним викликом <code>print</code> з параметром <code>sep=\"-\"</code>.",
      "Другим рядком виведіть <code>Завантаження... готово</code> двома викликами <code>print</code>: перший має закінчуватись на <code>... </code> завдяки <code>end</code>, а не переносом рядка.",
    ],
    starter: raw`# 1. Один print із sep="-": Go-Rust-Python
print("Go", "Rust", "Python")

# 2. Два print в один рядок: Завантаження... готово
print("Завантаження")
print("готово")
`,
    checks: [
      { on: "stdout", name: "Перший рядок: Go-Rust-Python", has: "Go-Rust-Python\n", hint: "Додайте до першого print параметр sep=\"-\"." },
      { on: "stdout", name: "Другий рядок: Завантаження... готово", has: "Завантаження... готово", hint: "У першому з двох print задайте end=\"... \" (з пробілом наприкінці)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Go-Rust-Python\nЗавантаження... готово", hint: "Перевірте, що рядків рівно два і між словами немає зайвих пробілів." },
      { on: "source", name: "Використано sep=", has: "sep=", hint: "Розділювач задається іменованим аргументом sep." },
      { on: "source", name: "Використано end=", has: "end=", hint: "Закінчення задається іменованим аргументом end." },
    ],
  },
  {
    ...base, id: "python-import-tools", lesson: "python/3", xp: 15,
    title: "Імпорти зі стандартної бібліотеки",
    context: "Майже кожна програма починається з імпортів: математика, статистика, дати. Уміння підключити потрібний модуль двома способами — перше, що знадобиться вам у чужому коді.",
    brief: [
      "Підключіть <code>import math</code> і <code>from statistics import mean</code>. Виведіть три рядки: цілий корінь <code>math.isqrt(144)</code>, середнє <code>mean([2, 4, 6])</code> і число π, округлене до двох знаків (<code>round(math.pi, 2)</code>).",
      "Усі виклики <code>print</code> розмістіть під перевіркою <code>if __name__ == \"__main__\":</code>.",
    ],
    starter: raw`# TODO: імпортуйте math і з модуля statistics функцію mean

if __name__ == "__main__":
    # TODO: виведіть isqrt(144), mean([2, 4, 6]) і число π з двома знаками
    pass
`,
    checks: [
      { on: "stdout", name: "Цілий корінь із 144 дорівнює 12", has: "12", hint: "Викличте math.isqrt(144) і передайте результат у print." },
      { on: "stdout", name: "Середнє [2, 4, 6] дорівнює 4", has: "4", hint: "mean приймає список: mean([2, 4, 6])." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "12\n4\n3.14", hint: "Три рядки: 12, 4 і 3.14. Для π скористайтесь round(math.pi, 2)." },
      { on: "source", name: "Підключено модуль math", matches: "import\\s+math", hint: "Додайте рядок import math." },
      { on: "source", name: "Із statistics імпортовано mean", matches: "from\\s+statistics\\s+import\\s+mean", hint: "Додайте рядок from statistics import mean." },
      { on: "source", name: "Є перевірка __name__ == \"__main__\"", matches: "__name__\\s*==\\s*[\"']__main__[\"']", hint: "Заготовка вже містить цю перевірку: залиште виклики print усередині неї." },
    ],
  },
  {
    ...base, id: "python-fix-traceback", lesson: "python/4", xp: 20,
    title: "Виправлення помилок за traceback",
    context: "Нова робота починається з читання чужих помилок. Привчіться знаходити причину за останнім рядком traceback і виправляти її точково, а не переписувати все заново.",
    brief: [
      "Програма падає. Запустіть її, прочитайте traceback знизу вгору й виправте помилки по черзі (їх дві).",
      "Після виправлення програма має вивести <code>Разом: 360</code> і <code>Середня ціна: 120.0</code>.",
    ],
    starter: raw`price = 120
count = 3
total = price * cuont
print("Разом: " + total)
print("Середня ціна:", total / count)
`,
    checks: [
      { on: "stdout", name: "Виводить «Разом: 360»", has: "Разом: 360", hint: "Перша помилка NameError: ім'я cuont написано з опечаткою, змінна називається count." },
      { on: "stdout", name: "Виводить «Середня ціна: 120.0»", has: "Середня ціна: 120.0", hint: "Друга помилка TypeError: текст і число не додають знаком +. Передайте їх у print через кому." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 360\nСередня ціна: 120.0", hint: "Після виправлення мають лишитися рівно два рядки." },
      { on: "source", name: "Опечатку cuont виправлено", matches: "cuont", not: true, hint: "У рядку з total має бути count." },
      { on: "source", name: "Текст не додається до числа знаком +", matches: "\"\\s*\\+\\s*total", not: true, hint: "Замініть + на кому: print(\"Разом:\", total)." },
    ],
  },
];
