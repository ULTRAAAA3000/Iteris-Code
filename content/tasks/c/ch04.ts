// Практичні завдання глави «Вказівники й пам'ять» (уроки 31–44). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04: readonly RemoteTask[] = [
  {
    ...base, id: "c-pointer-basics", lesson: "c/31", xp: 25,
    title: "Вказівник між двома змінними",
    context: "Розіменування це основа всієї роботи з пам'яттю: через вказівник читають і міняють значення, не знаючи імені змінної. Перенаправлення вказівника показує, що адреса в ньому звичайне значення.",
    brief: [
      "У заготовці є змінні <code>a</code> і <code>b</code> та вказівник <code>p</code>. Спрямуйте <code>p</code> на <code>a</code> й збільште <code>a</code> на 5 лише через <code>*p</code>. Потім перенаправте <code>p</code> на <code>b</code> і подвойте <code>b</code> знову тільки через <code>*p</code>.",
      "Очікуваний вивід: <code>a=15</code>, <code>b=14</code>, <code>p вказує на b: 1</code>. Прямо присвоювати <code>a</code> чи <code>b</code> не можна, а адреси друкувати не треба.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int a = 10;
    int b = 7;
    int *p = NULL;
    printf("a=%d\n", a);
    printf("b=%d\n", b);
    printf("p вказує на b: %d\n", p == &b);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "a змінено через вказівник", has: "a=15", hint: "Спершу p = &a;, потім *p += 5;." },
      { on: "stdout", name: "b подвоєно через вказівник", has: "b=14", hint: "Перенаправте p = &b; і напишіть *p *= 2;." },
      { on: "stdout", name: "Вказівник у кінці вказує на b", has: "p вказує на b: 1", hint: "Після p = &b вираз p == &b дає 1." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "a=15\nb=14\np вказує на b: 1", hint: "Рядки: a, b, потім p вказує на b." },
      { on: "source", name: "Запис через розіменування", matches: "\\*\\s*p\\s*(\\+|\\*)=", hint: "Змінюйте значення виразом *p += … і *p *= …, а не іменем змінної." },
      { on: "source", name: "Вказівник перенаправлено на b", matches: "\\bp\\s*=\\s*&\\s*b", hint: "p = &b; це присвоєння адреси, а не порівняння ==." },
    ],
  },
  {
    ...base, id: "c-out-params", lesson: "c/32", xp: 25,
    title: "Мінімум і максимум через вихідні параметри",
    context: "Функція повертає одне значення, але результатів часто кілька. Вихідні параметри дають змогу віддати два числа за один прохід і змінити змінні викликача, як це роблять sscanf і strtol.",
    brief: [
      "Допишіть <code>minmax</code>: за один обхід масиву запишіть найменший елемент у <code>*lo</code>, найбільший у <code>*hi</code>. Допишіть <code>swap</code>, що міняє значення двох змінних через вказівники.",
      "Очікуваний вивід: <code>min=2 max=9</code>, потім <code>після swap: 9 2</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

void minmax(const int a[], size_t n, int *lo, int *hi) {
}

void swap(int *x, int *y) {
}

int main(void) {
    int data[] = {4, 9, 2, 7};
    size_t n = sizeof data / sizeof data[0];
    int lo = 0;
    int hi = 0;
    minmax(data, n, &lo, &hi);
    printf("min=%d max=%d\n", lo, hi);
    swap(&lo, &hi);
    printf("після swap: %d %d\n", lo, hi);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Мінімум і максимум знайдено", has: "min=2 max=9", hint: "Почніть із *lo = *hi = a[0] і оновлюйте в циклі." },
      { on: "stdout", name: "Значення обміняно", has: "після swap: 9 2", hint: "Тимчасова змінна: int t = *x; *x = *y; *y = t;" },
      { on: "stdout", name: "Обидва рядки без зайвого", equals: "min=2 max=9\nпісля swap: 9 2", hint: "main змінювати не потрібно." },
      { on: "source", name: "Запис у вихідний параметр", matches: "\\*\\s*lo\\s*=", hint: "У minmax пишіть *lo = …, а не lo = …." },
      { on: "source", name: "Обмін через розіменування", matches: "\\*\\s*x\\s*=\\s*\\*\\s*y", hint: "Усередині swap: *x = *y;" },
    ],
  },
  {
    ...base, id: "c-ptr-walk", lesson: "c/33", xp: 30,
    title: "Пошук і реверс вказівниками",
    context: "Пошук елемента й розворот буфера на місці це типові задачі для двох вказівників. Різниця вказівників дає індекс, а NULL чесно каже, що нічого не знайдено.",
    brief: [
      "Допишіть <code>find_first</code>: вона повертає вказівник на перше входження <code>x</code> або <code>NULL</code>. Обходьте масив вказівником, без індексів. Допишіть <code>reverse</code>: вона отримує вказівники <code>lo</code> і <code>hi</code> на перший та останній елементи й розвертає діапазон, зсуваючи їх назустріч.",
      "Очікуваний вивід: <code>15 на позиції 2</code>, <code>9 відсутнє</code>, <code>реверс: 42 23 16 15 8 4</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

int *find_first(int *a, size_t n, int x) {
    return NULL;
}

void reverse(int *lo, int *hi) {
}

int main(void) {
    int a[] = {4, 8, 15, 16, 23, 42};
    size_t n = sizeof a / sizeof a[0];
    int *hit = find_first(a, n, 15);
    if (hit != NULL) {
        printf("15 на позиції %td\n", hit - a);
    } else {
        printf("15 не знайдено\n");
    }
    printf("9 %s\n", find_first(a, n, 9) == NULL ? "відсутнє" : "є");
    reverse(a, a + n - 1);
    printf("реверс:");
    for (int *p = a; p != a + n; p++) {
        printf(" %d", *p);
    }
    printf("\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Знайдено позицію 2", has: "15 на позиції 2", hint: "Поверніть p, якщо *p == x. Індекс main отримає як hit - a." },
      { on: "stdout", name: "Відсутній елемент дає NULL", has: "9 відсутнє", hint: "Після циклу поверніть NULL." },
      { on: "stdout", name: "Масив розвернуто", has: "реверс: 42 23 16 15 8 4", hint: "Поки lo < hi: обміняйте *lo і *hi, потім lo++ і hi--." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "15 на позиції 2\n9 відсутнє\nреверс: 42 23 16 15 8 4", hint: "main змінювати не потрібно." },
      { on: "source", name: "Реверс двома вказівниками назустріч", matches: "lo\\s*<\\s*hi", hint: "Умова циклу: while (lo < hi)." },
    ],
  },
  {
    ...base, id: "c-const-ptr", lesson: "c/34", xp: 25,
    title: "Читаємо через const, пишемо через char *",
    context: "Контракт «лише читаю» у параметрі дає змогу передавати літерали й масиви однаково безпечно, а компілятор стереже обіцянку. Функція, що змінює рядок, навпаки, має брати змінюваний буфер.",
    brief: [
      "Допишіть <code>count_vowels</code>: вона рахує голосні латинські літери (a e i o u, будь-якого регістру) в рядку й лише читає його, тож параметр має бути <code>const char *</code>. Допишіть <code>to_upper</code>: вона перетворює рядок на великі літери на місці.",
      "Очікуваний вивід: <code>Голосних у Programming: 3</code>, <code>Голосних у const in C: 2</code>, <code>Після: PROGRAMMING</code>. Змінюйте лише сигнатуру й тіла функцій.",
    ],
    starter: raw`#include <ctype.h>
#include <stdio.h>
#include <string.h>

int count_vowels(char *s) {
    return 0;
}

void to_upper(char *s) {
}

int main(void) {
    char word[] = "Programming";
    const char *title = "const in C";
    printf("Голосних у %s: %d\n", word, count_vowels(word));
    printf("Голосних у %s: %d\n", title, count_vowels(title));
    to_upper(word);
    printf("Після: %s\n", word);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Голосні в Programming", has: "Голосних у Programming: 3", hint: "Для кожного символу перевірте, чи він є в рядку aeiouAEIOU (strchr)." },
      { on: "stdout", name: "Голосні в літералі", has: "Голосних у const in C: 2", hint: "Той самий підрахунок працює й для const char *." },
      { on: "stdout", name: "Рядок у верхньому регістрі", has: "Після: PROGRAMMING", hint: "У циклі до '\\0' пишіть *s = toupper((unsigned char)*s)." },
      { on: "source", name: "Читальний параметр позначено const", matches: "count_vowels\\s*\\(\\s*const\\s+char\\s*\\*", hint: "Змініть сигнатуру на int count_vowels(const char *s)." },
    ],
  },
];
