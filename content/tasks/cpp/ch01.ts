// Практичні завдання глави «Початок» (уроки 1–4). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_01: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-hello-compiler", lesson: "cpp/1", xp: 15,
    title: "Перевірка компілятора: перша програма",
    context: "Після встановлення компілятора першим запускають найпростішу програму: так видно, що збірка працює. У C++ вона складається з підключення бібліотеки й функції main.",
    brief: [
      "Виведіть два рядки через <code>std::cout</code>: <code>Привіт, C++!</code> і <code>Компілятор працює</code>.",
      "Кожен рядок закінчується переносом (<code>std::endl</code> або <code>\"\\n\"</code>).",
    ],
    starter: raw`#include <iostream>

int main() {
    // TODO: виведіть два рядки: Привіт, C++! і Компілятор працює
    std::cout << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, C++!»", has: "Привіт, C++!", hint: "Текст у лапках передайте в cout через оператор &lt;&lt;." },
      { on: "stdout", name: "Виводить «Компілятор працює»", has: "Компілятор працює", hint: "Другий рядок виводиться окремим ланцюжком із &lt;&lt; після першого переносу." },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, C++!\nКомпілятор працює", hint: "Рівно два рядки: зайвий порожній endl із заготовки треба прибрати чи використати." },
    ],
  },
  {
    ...base, id: "cpp-first-program", lesson: "cpp/2", xp: 15,
    title: "Обчислення у виводі через cout",
    context: "cout приймає ланцюжок значень через <<: текст і результати виразів можна друкувати в одному рядку, не склеюючи їх руками.",
    brief: [
      "Першим рядком виведіть <code>2 + 3 = 5</code>, а другим <code>(8 + 4) * 3 = 36</code>. Числа в кінці обчисліть виразом у <code>cout</code>, не пишіть готову відповідь.",
    ],
    starter: raw`#include <iostream>

int main() {
    std::cout << "Привіт, світе!" << std::endl;
    // TODO: виведіть 2 + 3 = 5 і (8 + 4) * 3 = 36, обчисливши результати виразами
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «2 + 3 = 5»", has: "2 + 3 = 5", hint: "Виведіть текст «2 + 3 = », а далі в тому ж ланцюжку сам вираз 2 + 3." },
      { on: "stdout", name: "Рядок «(8 + 4) * 3 = 36»", has: "(8 + 4) * 3 = 36", hint: "Дужки у виразі потрібні, щоб спершу виконалося додавання." },
      { on: "stdout", name: "Виводить лише два рядки", equals: "2 + 3 = 5\n(8 + 4) * 3 = 36", hint: "Рядок «Привіт, світе!» із заготовки треба прибрати." },
      { on: "source", name: "Результат обчислюється виразом у cout", matches: "<<\\s*\\(?\\s*2\\s*\\+\\s*3\\s*\\)?\\s*<<|<<\\s*\\(\\s*8\\s*\\+\\s*4\\s*\\)\\s*\\*\\s*3", hint: "Не вписуйте 5 і 36 руками: поставте вираз після &lt;&lt;, нехай порахує програма." },
    ],
  },
  {
    ...base, id: "cpp-namespace-shop", lesson: "cpp/3", xp: 15,
    title: "Власний простір імен без using namespace std",
    context: "У проєктах кожен модуль живе у своєму просторі імен, щоб назви не конфліктували. А using namespace std у великому коді заборонений правилами стилю: краще точкові оголошення.",
    brief: [
      "Створіть простір імен <code>shop</code> з функцією <code>int total(int price, int qty)</code>, що повертає добуток. У <code>main</code> оголосіть <code>using std::cout;</code> і виведіть <code>Разом: 150</code> для ціни 50 і кількості 3.",
      "Не використовуйте <code>using namespace std;</code>. Функцію викликайте з префіксом <code>shop::</code>.",
    ],
    starter: raw`#include <iostream>

// TODO: namespace shop з функцією int total(int price, int qty)

int main() {
    // TODO: using std::cout; і вивід «Разом: 150» через shop::total(50, 3)
    std::cout << "Разом: 0" << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Виводить «Разом: 150»", equals: "Разом: 150", hint: "Результат має дати виклик функції з ціною 50 і кількістю 3." },
      { on: "source", name: "Оголошено простір імен shop", matches: "namespace\\s+shop\\s*\\{", hint: "Обгорніть функцію в namespace shop { ... }." },
      { on: "source", name: "Виклик через shop::total", has: "shop::total(", hint: "Функцію з простору імен викликають із префіксом shop::." },
      { on: "source", name: "Точкове оголошення using std::cout", has: "using std::cout;", hint: "Підключіть лише cout, а не весь простір імен std." },
      { on: "source", name: "Немає using namespace std", matches: "^(?![\\s\\S]*using\\s+namespace\\s+std)[\\s\\S]*$", hint: "Приберіть рядок using namespace std: він затягує весь std." },
    ],
  },
  {
    ...base, id: "cpp-clean-build", lesson: "cpp/4", xp: 20,
    title: "Збірка без попереджень: -Wall -Wextra",
    context: "На CI збирання з -Wall -Wextra -Werror блокує коміт із попередженнями. Порівняння знакового зі беззнаковим і невикористана змінна: два найчастіші приводи для таких попереджень.",
    brief: [
      "Програма рахує суму елементів вектора й виводить <code>Сума: 6</code> та <code>Елементів: 3</code>, але збирається з попередженнями. Виправте обидва: порівняння <code>int</code> з <code>size()</code> і невикористану змінну.",
      "Індекс зробіть типу <code>std::size_t</code>, а зайву змінну видаліть. Вивід лишається незмінним.",
    ],
    starter: raw`#include <cstddef>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3};
    int unused = 0;
    int sum = 0;
    for (int i = 0; i < v.size(); ++i) {
        sum += v[i];
    }
    std::cout << "Сума: " << sum << std::endl;
    std::cout << "Елементів: " << v.size() << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Сума: 6\nЕлементів: 3", hint: "Результат не має змінитися: виправляйте лише типи й зайву змінну." },
      { on: "source", name: "Індекс типу std::size_t", has: "std::size_t i", hint: "Лічильник циклу оголосіть як std::size_t, тоді порівняння з size() без попередження." },
      { on: "source", name: "Невикористану змінну видалено", matches: "^(?![\\s\\S]*\\bunused\\b)[\\s\\S]*$", hint: "Змінна, яку ніхто не читає, дає попередження -Wunused: приберіть її." },
    ],
  },
];
