// Практичні завдання глави «Початок» (уроки 1–4). Запускаються на сервері, результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_01: readonly RemoteTask[] = [
  {
    ...base, id: "go-hello-module", lesson: "go/1", xp: 15,
    title: "Перша програма модуля hello",
    context: "Будь-який сервіс на Go починається з файлу main.go: пакет main і функція main. Саме з неї запускається програма, і саме її ви напишете першою в кожному проєкті.",
    brief: [
      "Програма має вивести два рядки: <code>Привіт, Go!</code> і <code>Модуль: example.com/hello</code>.",
      "Використайте <code>fmt.Println</code>. Натисніть «Запустити», код виконається на сервері, а результат з'явиться в терміналі.",
    ],
    starter: raw`package main

import "fmt"

func main() {
	// Виведіть два рядки: Привіт, Go! і Модуль: example.com/hello
	fmt.Println()
}
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, Go!»", has: "Привіт, Go!" },
      { on: "stdout", name: "Виводить «Модуль: example.com/hello»", has: "Модуль: example.com/hello" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, Go!\nМодуль: example.com/hello" },
    ],
  },
  {
    ...base, id: "go-first-program", lesson: "go/2", xp: 15,
    title: "Прості обчислення у виводі",
    context: "Програма не друкує готові відповіді, а обчислює їх. Навіть у найпростіших скриптах (ціна з податком, сума замовлення) спершу вираз, потім вивід.",
    brief: [
      "Виведіть першим рядком <code>2 + 3 = 5</code>, обчисливши суму виразом (<code>fmt.Println(\"2 + 3 =\", 2+3)</code>).",
      "Другим рядком виведіть значення виразу <code>(8 + 4) * 3</code>, лише число.",
    ],
    starter: raw`package main

import "fmt"

func main() {
	fmt.Println("Привіт, світе!")
	// TODO: виведіть 2 + 3 = 5 і результат (8 + 4) * 3
}
`,
    checks: [
      { on: "stdout", name: "Рядок «2 + 3 = 5»", has: "2 + 3 = 5" },
      { on: "stdout", name: "Результат (8 + 4) * 3 дорівнює 36", has: "36" },
      { on: "stdout", name: "Виводить лише два рядки", equals: "2 + 3 = 5\n36", hint: "Рядок «Привіт, світе!» із заготовки треба прибрати" },
    ],
  },
  {
    ...base, id: "go-imports-visibility", lesson: "go/3", xp: 15,
    title: "Імпорти й видимість імен",
    context: "Половина помилок початківця на Go — це зайві імпорти й імена з неправильним регістром. Уміння швидко їх виправляти економить багато часу в першому ж проєкті.",
    brief: [
      "Програма має вивести <code>GO ЛЮБИТЬ ПАКЕТИ</code>, а наступним рядком площу кола з радіусом 2 з двома знаками після коми.",
      "У заготовці кілька помилок компіляції, пов'язаних із пакетами. Натисніть «Запустити», прочитайте повідомлення компілятора й виправте код.",
    ],
    starter: raw`package main

import (
	"fmt"
	"math"
	"os"
	"strings"
)

func main() {
	fmt.Println(strings.toUpper("go любить пакети"))
	fmt.Printf("%.2f\n", math.pi*2*2)
}
`,
    checks: [
      { on: "stdout", name: "Рядок великими літерами", has: "GO ЛЮБИТЬ ПАКЕТИ", hint: "Експортовані імена пишуться з великої літери: ToUpper" },
      { on: "stdout", name: "Площа кола з радіусом 2: 12.57", has: "12.57", hint: "У пакеті math число пі називається Pi" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "GO ЛЮБИТЬ ПАКЕТИ\n12.57" },
      { on: "source", name: "Зайвий імпорт os прибрано", matches: "\"os\"", not: true, hint: "Пакет, який не використовується, треба прибрати з import" },
    ],
  },
  {
    ...base, id: "go-fix-compile-errors", lesson: "go/4", xp: 20,
    title: "Виправте помилки компіляції",
    context: "У щоденній роботі Go-розробник постійно читає повідомлення компілятора. Хто вміє швидко знайти рядок і причину, той витрачає на налагодження вдвічі менше часу.",
    brief: [
      "Програма має вивести <code>Разом: 9</code>, а наступним рядком <code>Готово</code>.",
      "Заготовка не компілюється. Запустіть її, прочитайте номери рядків у повідомленні й виправте всі помилки. Нічого зайвого не додавайте, достатньо двох виправлень.",
    ],
    starter: raw`package main

import "fmt"

func total(a int, b int) int {
	sum := a + b
}

func main() {
	count := 3
	fmt.Println("Разом:", total(4, 5))
	fmt.Println("Готово")
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Разом: 9»", has: "Разом: 9", hint: "Функція total має повернути суму через return" },
      { on: "stdout", name: "Рядок «Готово»", has: "Готово" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 9\nГотово" },
      { on: "source", name: "Функція повертає значення", matches: "return\\s+(sum|a\\s*\\+\\s*b)", hint: "Додайте return у функцію total" },
    ],
  },
];
