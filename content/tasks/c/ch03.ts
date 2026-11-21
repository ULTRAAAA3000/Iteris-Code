// Практичні завдання глави «Масиви й рядки» (уроки 20–30). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_03: readonly RemoteTask[] = [
  {
    ...base, id: "c-array-stats", lesson: "c/20", xp: 20,
    title: "Температури тижня: сума, максимум і мінімум",
    context: "Статистика над рядом значень, як-от показання датчика чи оцінки класу, завжди зводиться до обходу масиву. Правильні межі циклу й початкове значення для пошуку відрізняють надійний код від такого, що ламається на краю.",
    brief: [
      "У заготовці є масив <code>temps</code> з шести значень. Одним циклом <code>for</code> з індексом <code>size_t</code> порахуйте суму, максимум і мінімум. Початкові значення для максимуму й мінімуму візьміть з <code>temps[0]</code>.",
      "Виведіть чотири рядки: <code>Елементів: 6</code>, <code>Сума: 30</code>, <code>Максимум: 9</code>, <code>Мінімум: 2</code>. Кількість елементів залишайте виразом із <code>sizeof</code>.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int temps[] = {4, 9, 2, 7, 5, 3};
    size_t n = sizeof temps / sizeof temps[0];
    printf("Елементів: %zu\n", n);
    printf("Сума: 0\n");
    printf("Максимум: 0\n");
    printf("Мінімум: 0\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума дорівнює 30", has: "Сума: 30", hint: "Додавайте temps[i] до змінної sum, що починається з 0." },
      { on: "stdout", name: "Максимум дорівнює 9", has: "Максимум: 9", hint: "Почніть з max = temps[0] і оновлюйте, якщо temps[i] більше." },
      { on: "stdout", name: "Мінімум дорівнює 2", has: "Мінімум: 2", hint: "Почніть з min = temps[0] і оновлюйте, якщо temps[i] менше." },
      { on: "stdout", name: "Усі чотири рядки без зайвого", equals: "Елементів: 6\nСума: 30\nМаксимум: 9\nМінімум: 2", hint: "Порядок рядків: Елементів, Сума, Максимум, Мінімум." },
      { on: "source", name: "Є цикл for", matches: "for\\s*\\(", hint: "Обійдіть масив циклом for (size_t i = 0; i < n; i++)." },
      { on: "source", name: "Початкове значення береться з першого елемента", matches: "=\\s*temps\\[0\\]", hint: "int max = temps[0]; а не вигадане число." },
    ],
  },
  {
    ...base, id: "c-array-functions", lesson: "c/21", xp: 25,
    title: "Масив у функції: підрахунок і реверс",
    context: "Функція над масивом отримує лише адресу початку, тому довжину передають окремо. Читання через const й зміна на місці це два звичайні шаблони, на яких стоїть більшість функцій обробки даних у C.",
    brief: [
      "Допишіть <code>count_above</code>: вона повертає, скільки елементів масиву строго більші за <code>limit</code>. Масив у ній лише читається, тож параметр уже позначений <code>const</code>.",
      "Допишіть <code>reverse</code>: вона розвертає масив на місці обміном елементів з обох кінців. Довжину беріть із параметра <code>n</code>, а не з <code>sizeof</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

int count_above(const int a[], size_t n, int limit) {
    return 0;
}

void reverse(int a[], size_t n) {
}

int main(void) {
    int data[] = {3, 8, 1, 9, 4, 7};
    size_t n = sizeof data / sizeof data[0];
    printf("Більших за 4: %d\n", count_above(data, n, 4));
    reverse(data, n);
    printf("Після реверсу:");
    for (size_t i = 0; i < n; i++) {
        printf(" %d", data[i]);
    }
    printf("\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Три елементи більші за 4", has: "Більших за 4: 3", hint: "Підходять 8, 9 і 7. Порівнюйте a[i] > limit й збільшуйте лічильник." },
      { on: "stdout", name: "Масив розвернуто", has: "Після реверсу: 7 4 9 1 8 3", hint: "Міняйте a[i] і a[n - 1 - i] для i від 0 до n / 2." },
      { on: "stdout", name: "Обидва рядки без зайвого", equals: "Більших за 4: 3\nПісля реверсу: 7 4 9 1 8 3", hint: "main змінювати не потрібно." },
      { on: "source", name: "Реверс використовує тимчасову змінну", matches: "=\\s*a\\[\\s*i\\s*\\]\\s*;", hint: "int tmp = a[i]; a[i] = a[n - 1 - i]; a[n - 1 - i] = tmp;" },
    ],
  },
  {
    ...base, id: "c-string-terminator", lesson: "c/22", xp: 25,
    title: "Рядок без бібліотеки: довжина, підрахунок, заміна",
    context: "Усі функції для рядків у C зводяться до обходу до нульового байта. Якщо написати їх самому, нуль-термінатор перестає бути магією, а пошук помилок у чужому коді стає значно швидшим.",
    brief: [
      "Допишіть без <code>strlen</code> три функції: <code>my_len</code> повертає довжину рядка, <code>count_char</code> рахує входження символу, <code>spaces_to_underscores</code> замінює в рядку на місці кожен пробіл на підкреслення.",
      "Усі цикли ведіть до <code>'\\0'</code>. Очікуваний вивід: <code>Довжина: 13</code>, <code>Літер l: 3</code>, <code>Результат: hello_c_world</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

size_t my_len(const char s[]) {
    return 0;
}

size_t count_char(const char s[], char c) {
    return 0;
}

void spaces_to_underscores(char s[]) {
}

int main(void) {
    char text[] = "hello c world";
    printf("Довжина: %zu\n", my_len(text));
    printf("Літер l: %zu\n", count_char(text, 'l'));
    spaces_to_underscores(text);
    printf("Результат: %s\n", text);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Довжина рядка дорівнює 13", has: "Довжина: 13", hint: "Лічіть символи, доки s[n] != '\\0'. Сам нуль у довжину не входить." },
      { on: "stdout", name: "Літера l зустрічається 3 рази", has: "Літер l: 3", hint: "Обходьте рядок до термінатора й збільшуйте лічильник, коли s[i] == c." },
      { on: "stdout", name: "Пробіли замінено на підкреслення", has: "Результат: hello_c_world", hint: "Якщо s[i] == ' ', запишіть s[i] = '_'." },
      { on: "stdout", name: "Усі три рядки без зайвого", equals: "Довжина: 13\nЛітер l: 3\nРезультат: hello_c_world", hint: "main змінювати не потрібно." },
      { on: "source", name: "Цикл іде до нульового термінатора", matches: "\\\\0", hint: "Умова циклу: s[i] != '\\0'." },
      { on: "source", name: "strlen не використано", matches: "\\bstrlen\\s*\\(", not: true, hint: "Довжину порахуйте самі, обходом до '\\0'." },
    ],
  },
  {
    ...base, id: "c-string-h", lesson: "c/23", xp: 25,
    title: "Ім'я користувача: strcat, strcmp і strncpy",
    context: "Імена, ключі й команди постійно склеюють, порівнюють і вкорочують під фіксований буфер. Щоб робити це без переповнення, треба знати, що саме перевіряє кожна функція string.h, а що лишає вам.",
    brief: [
      "У <code>main</code> склейте в <code>full</code> ім'я <code>first</code>, пробіл і <code>last</code> через <code>strcpy</code> і <code>strcat</code>. Виведіть <code>Повне ім'я: Ada Lovelace</code> і довжину через <code>strlen</code>: <code>Довжина: 12</code>.",
      "Порівняйте <code>first</code> з рядком <code>\"Alan\"</code> через <code>strcmp</code> і виведіть лише знак результату (<code>-1</code>, <code>0</code> або <code>1</code>) як <code>Порядок: -1</code>. Потім скопіюйте <code>\"Programming\"</code> у <code>short_name</code> через <code>strncpy</code>, самі поставте нуль наприкінці й виведіть <code>Скорочено: Progr</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <string.h>

int main(void) {
    char first[] = "Ada";
    char last[] = "Lovelace";
    char full[32] = "";
    char short_name[6] = "";
    printf("Повне ім'я: %s\n", full);
    printf("Довжина: %d\n", 0);
    printf("Порядок: %d\n", 0);
    printf("Скорочено: %s\n", short_name);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Повне ім'я склеєно", has: "Повне ім'я: Ada Lovelace", hint: "strcpy(full, first); strcat(full, \" \"); strcat(full, last);" },
      { on: "stdout", name: "Довжина дорівнює 12", has: "Довжина: 12", hint: "strlen(full) має тип size_t, друкуйте його через %zu." },
      { on: "stdout", name: "Порядок за алфавітом: -1", has: "Порядок: -1", hint: "strcmp повертає довільне від'ємне число; зведіть до знака: (c > 0) - (c < 0)." },
      { on: "stdout", name: "Усі чотири рядки без зайвого", equals: "Повне ім'я: Ada Lovelace\nДовжина: 12\nПорядок: -1\nСкорочено: Progr", hint: "Скорочено: у short_name має поміститися 5 літер і нуль." },
      { on: "source", name: "Використано strcat", matches: "\\bstrcat\\s*\\(", hint: "Склейте частини імені через strcat." },
      { on: "source", name: "Використано strncpy", matches: "\\bstrncpy\\s*\\(", hint: "strncpy(short_name, \"Programming\", sizeof short_name - 1);" },
      { on: "source", name: "Нуль наприкінці поставлено вручну", matches: "short_name\\s*\\[[^\\]]+\\]\\s*=\\s*'\\\\0'", hint: "short_name[sizeof short_name - 1] = '\\0'; бо strncpy не завжди додає нуль." },
    ],
  },
  {
    ...base, id: "c-snprintf-label", lesson: "c/24", xp: 30,
    title: "Мітка товару: snprintf і виявлення обрізання",
    context: "Мітки, шляхи й рядки логу формують у буферах фіксованого розміру. Надійний код використовує snprintf і за поверненим числом дізнається, чи текст помістився, замість того щоб ризикувати переповненням.",
    brief: [
      "Допишіть <code>make_label</code>: вона має записати в <code>out</code> текст за зразком <code>ID-007:widget</code> (<code>ID-%03d:%s</code>) і повернути те, що повертає <code>snprintf</code>. Розмір приймача береться з параметра <code>size</code>.",
      "Не використовуйте <code>sprintf</code>. Очікуваний вивід: <code>big: ID-007:widget (13)</code> і <code>small: ID-007: (13) обрізано</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

int make_label(char out[], size_t size, const char name[], int id) {
    return 0;
}

int main(void) {
    char big[32] = "";
    char small[8] = "";
    int n1 = make_label(big, sizeof big, "widget", 7);
    int n2 = make_label(small, sizeof small, "widget", 7);
    printf("big: %s (%d)\n", big, n1);
    printf("small: %s (%d)%s\n", small, n2, n2 >= (int)sizeof small ? " обрізано" : "");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Великий буфер вміщає мітку", has: "big: ID-007:widget (13)", hint: "Формат \"ID-%03d:%s\" дає 13 символів." },
      { on: "stdout", name: "Малий буфер обрізає, але лишає рядок", has: "small: ID-007: (13) обрізано", hint: "snprintf запише 7 символів і нуль, а поверне 13." },
      { on: "stdout", name: "Обидва рядки без зайвого", equals: "big: ID-007:widget (13)\nsmall: ID-007: (13) обрізано", hint: "Поверніть результат snprintf із функції: return snprintf(...)." },
      { on: "source", name: "Використано snprintf", matches: "\\bsnprintf\\s*\\(", hint: "return snprintf(out, size, ...);" },
      { on: "source", name: "sprintf не використано", matches: "\\bsprintf\\s*\\(", not: true, hint: "sprintf не знає розміру буфера, замініть його на snprintf." },
    ],
  },
];
