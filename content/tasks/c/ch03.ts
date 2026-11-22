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
  {
    ...base, id: "c-input-parse", lesson: "c/25", xp: 30,
    title: "Вік із введеного рядка: strtol з перевірками",
    context: "Користувач вводить що завгодно: літери, числа з хвостом, надто великі значення. Надійний розбір через strtol відрізняє коректне число від сміття, а не мовчки перетворює його на нуль, як atoi.",
    brief: [
      "Допишіть <code>parse_age</code>: вона розбирає рядок через <code>strtol</code> і повертає вік, або <code>-1</code>, якщо цифр немає, після числа є зайве, число виходить за межі <code>long</code> або вік не в межах від 0 до 150.",
      "Не використовуйте <code>atoi</code>. Функцію <code>main</code> змінювати не треба: вона читає п'ять рядків через <code>fgets</code> з імітованого вводу й друкує результат для кожного.",
    ],
    starter: raw`#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int parse_age(const char s[]) {
    return 0;
}

int main(void) {
    char data[] = "17\nabc\n42x\n200\n  8\n";
    FILE *in = fmemopen(data, strlen(data), "r");
    if (in == NULL) {
        return 1;
    }
    char line[16];
    while (fgets(line, sizeof line, in) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        printf("[%s] -> %d\n", line, parse_age(line));
    }
    fclose(in);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Коректний вік розпізнано", has: "[17] -> 17", hint: "Якщо end вказує на кінець рядка, поверніть (int)v." },
      { on: "stdout", name: "Слово й число з хвостом відхилено", has: "[42x] -> -1", hint: "Перевірте end == s (немає цифр) і *end != '\\0' (є хвіст)." },
      { on: "stdout", name: "Вік поза межами відхилено", has: "[200] -> -1", hint: "Додайте перевірку v < 0 || v > 150." },
      { on: "stdout", name: "Початкові пробіли пропускаються", has: "[  8] -> 8", hint: "strtol сама пропускає пробіли на початку, окремо їх обробляти не треба." },
      { on: "stdout", name: "Усі п'ять рядків без зайвого", equals: "[17] -> 17\n[abc] -> -1\n[42x] -> -1\n[200] -> -1\n[  8] -> 8", hint: "main змінювати не потрібно." },
      { on: "source", name: "Використано strtol", matches: "\\bstrtol\\s*\\(", hint: "long v = strtol(s, &end, 10);" },
      { on: "source", name: "atoi не використано", matches: "\\batoi\\s*\\(", not: true, hint: "atoi не повідомляє про помилки, використайте strtol." },
    ],
  },
  {
    ...base, id: "c-matrix-transpose", lesson: "c/26", xp: 30,
    title: "Транспонування матриці 2 на 3",
    context: "Матриці й таблиці часто доводиться розвертати: рядки стають стовпцями. Це хороша вправа на двовимірні індекси й на правило, що параметр-масив потребує ширини рядка.",
    brief: [
      "Допишіть <code>transpose</code>: вона копіює матрицю <code>src</code> з <code>rows</code> рядків і 3 стовпців у <code>dst</code> так, щоб <code>dst[j][i]</code> дорівнював <code>src[i][j]</code>.",
      "Для матриці <code>{{1, 2, 3}, {4, 5, 6}}</code> результат має мати три рядки: <code>1 4</code>, <code>2 5</code>, <code>3 6</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

void transpose(size_t rows, int src[][3], int dst[][2]) {
}

int main(void) {
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int t[3][2] = {{0}};
    transpose(2, m, t);
    for (size_t i = 0; i < 3; i++) {
        printf("%d %d\n", t[i][0], t[i][1]);
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Перший рядок результату 1 4", has: "1 4", hint: "Перший стовпець матриці m це 1 і 4." },
      { on: "stdout", name: "Останній рядок результату 3 6", has: "3 6", hint: "Третій стовпець m це 3 і 6." },
      { on: "stdout", name: "Усі три рядки без зайвого", equals: "1 4\n2 5\n3 6", hint: "dst[j][i] = src[i][j] у подвійному циклі за i < rows і j < 3." },
      { on: "source", name: "Використано два індекси підряд", matches: "dst\\s*\\[[^\\]]+\\]\\s*\\[[^\\]]+\\]\\s*=", hint: "Присвоюйте елемент через dst[j][i] = src[i][j];" },
    ],
  },
  {
    ...base, id: "c-vla-literals", lesson: "c/27", xp: 30,
    title: "VLA-параметри й складений літерал",
    context: "Функції над матрицями різної ширини зручно писати з VLA-параметрами, а тимчасові масиви для викликів без допоміжних змінних дають складені літерали. Розмір VLA потрібно тримати під контролем.",
    brief: [
      "Допишіть <code>sum_matrix</code>, яка рахує суму всіх елементів матриці через VLA-параметр <code>int m[rows][cols]</code>, <code>max_of</code>, що повертає найбільший елемент масиву, і <code>squares_sum</code>.",
      "У <code>squares_sum(n)</code> оголосіть масив змінної довжини <code>int sq[n]</code>, заповніть його квадратами <code>i * i</code> від 0 до <code>n - 1</code> і поверніть суму. Очікуваний вивід: <code>a: 21</code>, <code>b: 25</code>, <code>max: 9</code>, <code>squares: 30</code>.",
    ],
    starter: raw`#include <stdio.h>

int sum_matrix(size_t rows, size_t cols, int m[rows][cols]) {
    return 0;
}

int max_of(const int a[], size_t n) {
    return 0;
}

int squares_sum(size_t n) {
    return 0;
}

int main(void) {
    int a[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int b[3][2] = {{1, 2}, {3, 4}, {5, 10}};
    printf("a: %d\n", sum_matrix(2, 3, a));
    printf("b: %d\n", sum_matrix(3, 2, b));
    printf("max: %d\n", max_of((int[]){4, 9, 2, 7}, 4));
    printf("squares: %d\n", squares_sum(5));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума матриці 2 на 3", has: "a: 21", hint: "Подвійний цикл за i < rows і j < cols, додавайте m[i][j]." },
      { on: "stdout", name: "Та сама функція для матриці 3 на 2", has: "b: 25", hint: "Функція не має залежати від ширини: беріть cols із параметра." },
      { on: "stdout", name: "Максимум дорівнює 9", has: "max: 9", hint: "Почніть з a[0] і порівнюйте решту елементів." },
      { on: "stdout", name: "Усі чотири рядки без зайвого", equals: "a: 21\nb: 25\nmax: 9\nsquares: 30", hint: "squares_sum(5) = 0 + 1 + 4 + 9 + 16." },
      { on: "source", name: "Оголошено масив змінної довжини sq[n]", matches: "int\\s+sq\\s*\\[\\s*n\\s*\\]\\s*;", hint: "int sq[n]; без ініціалізатора, заповніть циклом." },
    ],
  },
  {
    ...base, id: "c-utf8-count", lesson: "c/28", xp: 30,
    title: "UTF-8: кодові точки й префікс за символами",
    context: "Текст користувачів містить кирилицю, діакритику й знаки валют, тому довжина в байтах і довжина в символах розходяться. Рахувати й різати такі рядки треба по межах символів, інакше текст зіпсується.",
    brief: [
      "Допишіть <code>utf8_count</code>: повертає кількість кодових точок, тобто байтів, які не є байтами продовження (значення від <code>0x80</code> до <code>0xBF</code>). Байт беріть як <code>unsigned char</code>.",
      "Допишіть <code>utf8_prefix_bytes(s, chars)</code>: повертає, скільки байтів займають перші <code>chars</code> символів. Для рядка <code>Привіт, світе</code> очікується <code>Байтів: 24</code>, <code>Символів: 13</code>, <code>Початок: Привіт</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <string.h>

size_t utf8_count(const char s[]) {
    return 0;
}

size_t utf8_prefix_bytes(const char s[], size_t chars) {
    return 0;
}

int main(void) {
    const char text[] = "Привіт, світе";
    printf("Байтів: %zu\n", strlen(text));
    printf("Символів: %zu\n", utf8_count(text));
    printf("Початок: %.*s\n", (int)utf8_prefix_bytes(text, 6), text);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Довжина в байтах 24", has: "Байтів: 24", hint: "Цей рядок друкує main через strlen, нічого міняти не треба." },
      { on: "stdout", name: "Символів 13", has: "Символів: 13", hint: "Лічіть байти, що не лежать у діапазоні 0x80 до 0xBF." },
      { on: "stdout", name: "Префікс із шести символів", has: "Початок: Привіт", hint: "Зупиніться на початковому байті сьомого символу й поверніть його індекс." },
      { on: "stdout", name: "Усі три рядки без зайвого", equals: "Байтів: 24\nСимволів: 13\nПочаток: Привіт", hint: "main змінювати не потрібно." },
      { on: "source", name: "Байти порівнюються як unsigned char", matches: "unsigned\\s+char", hint: "unsigned char c = (unsigned char)s[i];" },
    ],
  },
  {
    ...base, id: "c-bit-flags", lesson: "c/29", xp: 30,
    title: "Біти: встановити, скинути, перевірити, порахувати",
    context: "Прапорці прав, регістри пристроїв і заголовки протоколів зберігають багато значень в одному числі. Чотири базові дії з бітом і підрахунок ввімкнених бітів потрібні в кожному системному коді.",
    brief: [
      "Допишіть <code>set_bit</code>, <code>clear_bit</code> і <code>test_bit</code>: вони встановлюють, скидають і перевіряють біт номер <code>n</code> у беззнаковому <code>x</code> (нумерація з нуля, маска <code>1u &lt;&lt; n</code>). <code>test_bit</code> повертає 0 або 1.",
      "Допишіть <code>popcount</code>: кількість ввімкнених бітів числа. Очікуваний вивід: <code>set: 42</code>, <code>clear: 34</code>, <code>bit5: 1</code>, <code>bit3: 0</code>, <code>bits: 12</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

unsigned set_bit(unsigned x, unsigned n) {
    return x;
}

unsigned clear_bit(unsigned x, unsigned n) {
    return x;
}

unsigned test_bit(unsigned x, unsigned n) {
    return 0;
}

unsigned popcount(unsigned x) {
    return 0;
}

int main(void) {
    unsigned x = 0;
    x = set_bit(x, 1);
    x = set_bit(x, 3);
    x = set_bit(x, 5);
    printf("set: %u\n", x);
    x = clear_bit(x, 3);
    printf("clear: %u\n", x);
    printf("bit5: %u\n", test_bit(x, 5));
    printf("bit3: %u\n", test_bit(x, 3));
    printf("bits: %u\n", popcount(0xFF0Fu));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Біти 1, 3 і 5 дають 42", has: "set: 42", hint: "x | (1u << n) вмикає біт n: 2 + 8 + 32." },
      { on: "stdout", name: "Скидання біта 3 дає 34", has: "clear: 34", hint: "x & ~(1u << n) вимикає біт n." },
      { on: "stdout", name: "Перевірка бітів", has: "bit5: 1\nbit3: 0", hint: "(x >> n) & 1u повертає 0 або 1." },
      { on: "stdout", name: "Усі п'ять рядків без зайвого", equals: "set: 42\nclear: 34\nbit5: 1\nbit3: 0\nbits: 12", hint: "У 0xFF0F дванадцять ввімкнених бітів: x &= x - 1 скидає наймолодший." },
      { on: "source", name: "Використано зсув беззнакової одиниці", matches: "1u\\s*<<", hint: "Маска біта: 1u << n." },
      { on: "source", name: "Використано інверсію маски", matches: "~\\s*\\(", hint: "Скидання: x & ~(1u << n)." },
    ],
  },
  {
    ...base, id: "c-word-frequency", lesson: "c/30", xp: 35,
    title: "Частотний словник тексту",
    context: "Частоти літер і слів потрібні в стисненні, шифрах, фільтрах спаму й аналізі журналів. Масив лічильників з індексом-ключем це найпростіший і найшвидший спосіб, і він без мап.",
    brief: [
      "Допишіть <code>count_letters</code>: для кожної літери тексту (без урахування регістру) збільште комірку <code>counts[c - 'a']</code>. Допишіть <code>count_words</code>: вона рахує слова, тобто групи літер, розділені будь-чим іншим. Символи передавайте в <code>ctype.h</code> як <code>unsigned char</code>.",
      "Допишіть <code>top_letter</code>, що повертає найчастішу літеру (при рівності перша за абеткою). Очікуваний вивід: <code>Слів: 8</code>, <code>Найчастіша: t (6)</code>, <code>Літер a: 5</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <ctype.h>
#include <stdio.h>

void count_letters(const char text[], unsigned counts[26]) {
}

size_t count_words(const char text[]) {
    return 0;
}

char top_letter(const unsigned counts[]) {
    return 'a';
}

int main(void) {
    const char text[] = "the cat and the hat and the bat";
    unsigned counts[26] = {0};
    count_letters(text, counts);
    char top = top_letter(counts);
    printf("Слів: %zu\n", count_words(text));
    printf("Найчастіша: %c (%u)\n", top, counts[top - 'a']);
    printf("Літер a: %u\n", counts['a' - 'a']);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Слів вісім", has: "Слів: 8", hint: "Слово починається, коли літера йде після не-літери (або з початку тексту)." },
      { on: "stdout", name: "Найчастіша літера t шість разів", has: "Найчастіша: t (6)", hint: "Пройдіть counts і оновлюйте найбільше лише при строго більшому значенні." },
      { on: "stdout", name: "Літера a п'ять разів", has: "Літер a: 5", hint: "Збільшуйте counts[tolower(c) - 'a'] для кожної літери." },
      { on: "stdout", name: "Усі три рядки без зайвого", equals: "Слів: 8\nНайчастіша: t (6)\nЛітер a: 5", hint: "main змінювати не потрібно." },
      { on: "source", name: "Літери фільтруються через isalpha", matches: "\\bisalpha\\s*\\(", hint: "Перед індексацією перевірте isalpha((unsigned char)c)." },
      { on: "source", name: "Індекс обчислюється від 'a'", matches: "-\\s*'a'", hint: "counts[tolower(c) - 'a']++;" },
    ],
  },
];
