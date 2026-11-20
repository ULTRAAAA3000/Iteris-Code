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
      "Кожен рядок закінчується переносом (<code>\"\\n\"</code> або <code>std::endl</code>). Натисніть «Запустити»: код збереться й виконається на сервері.",
    ],
    starter: raw`#include <iostream>

int main() {
    // Виведіть два рядки: Привіт, C++! і Компілятор працює
    std::cout << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, C++!»", has: "Привіт, C++!", hint: "Текст у лапках надішліть у потік: std::cout << \"Привіт, C++!\" << \"\\n\";" },
      { on: "stdout", name: "Виводить «Компілятор працює»", has: "Компілятор працює", hint: "Другий рядок виведіть окремою інструкцією std::cout, не забудьте крапку з комою." },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, C++!\nКомпілятор працює", hint: "Має бути рівно два рядки без зайвого тексту." },
      { on: "source", name: "Є функція main і використано std::cout", matches: "int\\s+main\\s*\\(.*std::cout", hint: "Залиште main і виводьте через std::cout." },
    ],
  },
  {
    ...base, id: "cpp-first-program", lesson: "cpp/2", xp: 15,
    title: "Обчислення у виводі через cout",
    context: "cout приймає ланцюжок значень через <<: текст і результати виразів можна друкувати в одному рядку, не склеюючи їх руками.",
    brief: [
      "Першим рядком виведіть <code>2 + 3 = 5</code>, а другим <code>(8 + 4) * 3 = 36</code>. Числа в кінці обчисліть виразом у <code>cout</code>, не пишіть готову відповідь.",
      "Рядок «Привіт, світе!» із заготовки приберіть.",
    ],
    starter: raw`#include <iostream>

int main() {
    std::cout << "Привіт, світе!" << "\n";
    // Виведіть два рядки з обчисленими результатами
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «2 + 3 = 5»", has: "2 + 3 = 5", hint: "Виведіть текст «2 + 3 = », а далі через << вираз 2 + 3." },
      { on: "stdout", name: "Рядок «(8 + 4) * 3 = 36»", has: "(8 + 4) * 3 = 36", hint: "Вираз (8 + 4) * 3 у cout беріть у дужки, щоб порядок дій був очевидним." },
      { on: "stdout", name: "Виводить лише два рядки", equals: "2 + 3 = 5\n(8 + 4) * 3 = 36", hint: "Рядок «Привіт, світе!» із заготовки треба прибрати." },
      { on: "source", name: "Результат обчислюється виразом у cout", matches: "<<\\s*\\(?\\s*2\\s*\\+\\s*3\\s*\\)?\\s*<<|<<\\s*\\(\\s*8\\s*\\+\\s*4\\s*\\)\\s*\\*\\s*3", hint: "Не вписуйте 5 і 36 руками: нехай обчислить програма." },
    ],
  },
  {
    ...base, id: "cpp-build-stages", lesson: "cpp/3", xp: 20,
    title: "Макроси, умовна компіляція й прототип",
    context: "Препроцесор підставляє текст ще до компіляції, а прототип дозволяє викликати функцію, визначену нижче. Умовні директиви збирають різні версії програми з одного коду: debug, release, для різних платформ.",
    brief: [
      "Додайте макрос <code>#define VERSION 3</code> і виведіть через нього <code>Iteris Code v3</code>. Через <code>#ifdef DEBUG</code> і <code>#else</code> виведіть <code>Режим: debug</code> або <code>Режим: release</code>: макрос DEBUG не визначайте, тож має вийти release.",
      "Функція <code>twice</code> оголошена прототипом над <code>main</code>, а її визначення внизу поки помилкове. Виправте тіло так, щоб рядок <code>twice(21) = 42</code> вийшов правильним. Прототип залиште на місці.",
    ],
    starter: raw`#include <iostream>

int twice(int x);

int main() {
    std::cout << "Iteris Code v?" << "\n";
    std::cout << "twice(21) = " << twice(21) << "\n";
    return 0;
}

int twice(int x) {
    return x;
}
`,
    checks: [
      { on: "stdout", name: "Версія береться з макросу: Iteris Code v3", has: "Iteris Code v3", hint: "Над main додайте #define VERSION 3 і виведіть \"Iteris Code v\" << VERSION." },
      { on: "stdout", name: "Режим release", has: "Режим: release", hint: "Між #ifdef DEBUG і #else виведіть debug, після #else виведіть release, закрийте блок #endif." },
      { on: "stdout", name: "Функція twice працює: twice(21) = 42", has: "twice(21) = 42", hint: "Тіло twice має повертати x * 2, а не x." },
      { on: "stdout", name: "Точний вивід", equals: "Iteris Code v3\nРежим: release\ntwice(21) = 42", hint: "Порядок рядків: версія, режим, результат twice." },
      { on: "source", name: "Є #define VERSION і умовна компіляція #ifdef", matches: "#define\\s+VERSION\\s+3.*#ifdef\\s+DEBUG.*#else.*#endif", hint: "Використайте директиви препроцесора #define, #ifdef, #else та #endif." },
      { on: "source", name: "Прототип twice лишився над main", matches: "int\\s+twice\\s*\\(\\s*int\\s+\\w+\\s*\\)\\s*;", hint: "Рядок int twice(int x); має залишитись над main." },
    ],
  },
  {
    ...base, id: "cpp-warnings-clean", lesson: "cpp/4", xp: 20,
    title: "Чиста збірка без попереджень",
    context: "У командах збірку запускають з -Wall -Wextra, а попередження вважають помилками: невикористані змінні й параметри часто ховають забуту логіку. Тут ви приберете їх і доповните програму.",
    brief: [
      "Збірка з <code>-Wall -Wextra</code> видала б два попередження: невикористана змінна <code>count</code> і невикористаний параметр <code>depth</code> у функції <code>area</code>. Приберіть обидва.",
      "Після виправлення виведіть другим рядком об'єм: <code>Об'єм: 126</code>, обчисливши <code>width * height * depth</code> у <code>main</code>.",
    ],
    starter: raw`#include <iostream>

int area(int width, int height, int depth) {
    return width * height;
}

int main() {
    int width = 6;
    int height = 7;
    int depth = 3;
    int count = 0;
    std::cout << "Площа: " << area(width, height, depth) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Площа: 42", has: "Площа: 42", hint: "Площа 6 * 7 = 42, цей рядок вже є в заготовці: не зламайте його." },
      { on: "stdout", name: "Об'єм: 126", has: "Об'єм: 126", hint: "Виведіть \"Об'єм: \" і вираз width * height * depth." },
      { on: "stdout", name: "Точний вивід", equals: "Площа: 42\nОб'єм: 126", hint: "Мають бути рівно два рядки: площа, потім об'єм." },
      { on: "source", name: "Невикористану змінну count прибрано", matches: "\\bcount\\b", not: true, hint: "Видаліть рядок з int count." },
      { on: "source", name: "Функція area має два параметри", matches: "int\\s+area\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)", hint: "Параметр depth у area не потрібен: приберіть його з оголошення й з виклику." },
    ],
  },
];
