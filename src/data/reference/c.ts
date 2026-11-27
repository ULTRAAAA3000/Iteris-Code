import type { RefSection } from "./types.ts";

const raw = String.raw;

export const c: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`#include <stdio.h>

int main(void) {
    printf("Привіт, світе!\n");
    return 0;
}`, note: "Програма починається з `main`. `#include` підключає заголовок із оголошеннями, `printf` друкує форматований текст, а `return 0` повідомляє системі про успіх." },
    { t: "Компіляція й запуск", code: raw`gcc -std=c11 -Wall -Wextra main.c -o main
./main`, note: "C компілюється в машинний код. Прапорці `-Wall -Wextra` вмикають корисні попередження, `-std=c11` фіксує стандарт мови." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Основні типи", code: raw`int age = 16;
double price = 24.5;
char letter = 'A';
unsigned int count = 3u;
const double PI = 3.14159;`, note: "Тип вказується при оголошенні. Без ініціалізації локальна змінна містить випадкове сміття, тому завжди задавайте початкове значення." },
    { t: "Фіксована ширина типів", code: raw`#include <stdint.h>
#include <stdbool.h>

int32_t a = 100000;
uint8_t byte = 255;
bool ok = true;`, note: "Заголовок `stdint.h` дає типи з гарантованим розміром, а `stdbool.h` додає `bool`, `true` і `false`." },
    { t: "Перетворення", code: raw`int n = (int)3.9;      // 3
double d = 7 / 2.0;     // 3.5
double e = 7 / 2;       // 3.0: ділення цілих

#include <stdlib.h>
int x = atoi("12");
double y = strtod("3.5", NULL);`, note: "Ділення цілих відкидає дробову частину. Для надійного розбору рядків використовуйте `strtol` і `strtod`, які повідомляють про помилку." },
  ] },
  { t: "Ввід і вивід", items: [
    { t: "printf", code: raw`printf("%d %5.2f %c %s\n", 42, 3.14159, 'x', "рядок");
printf("%zu байтів\n", sizeof(int));`, note: "Специфікатори: `%d` ціле, `%u` беззнакове, `%f` дробове, `%c` символ, `%s` рядок, `%zu` розмір, `%p` адреса." },
    { t: "scanf і fgets", code: raw`int n;
if (scanf("%d", &n) == 1) printf("%d\n", n * 2);

char line[64];
if (fgets(line, sizeof line, stdin)) printf("%s", line);`, note: "`scanf` повертає кількість прочитаних значень: завжди перевіряйте її. Для рядків надійніший `fgets`, що не виходить за межі буфера." },
  ] },
  { t: "Умови й цикли", items: [
    { t: "if, else, switch", code: raw`if (age < 12) {
    puts("дитина");
} else if (age < 18) {
    puts("підліток");
} else {
    puts("дорослий");
}

switch (day) {
    case 1: puts("пн"); break;
    default: puts("інший");
}`, note: "У `switch` кожну гілку завершуйте `break`, інакше виконання «провалиться» в наступну." },
    { t: "Цикли", code: raw`for (int i = 0; i < 5; i++) printf("%d ", i);

int n = 3;
while (n > 0) n--;

do { n++; } while (n < 3);`, note: "`for` зручний, коли відома кількість кроків, `while` перевіряє умову перед тілом, `do … while` виконує тіло хоча б раз." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення і виклик", code: raw`int square(int x);

int main(void) {
    printf("%d\n", square(7));
    return 0;
}

int square(int x) {
    return x * x;
}`, note: "Прототип повідомляє компілятору про функцію до її визначення. У C аргументи передаються за значенням: функція працює з копією." },
    { t: "Вихідні параметри", code: raw`void min_max(const int *a, int n, int *lo, int *hi) {
    *lo = *hi = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] < *lo) *lo = a[i];
        if (a[i] > *hi) *hi = a[i];
    }
}`, note: "Щоб функція змінила чи повернула кілька значень, їй передають вказівники на змінні." },
  ] },
  { t: "Масиви й рядки", items: [
    { t: "Масив", code: raw`int a[5] = {1, 2, 3};
size_t n = sizeof a / sizeof a[0];
for (size_t i = 0; i < n; i++) printf("%d ", a[i]);`, note: "Масив має фіксований розмір і не перевіряє межі: вихід за них — невизначена поведінка. Передаючи масив у функцію, передавайте й довжину." },
    { t: "Рядки", code: raw`#include <string.h>

char s[16] = "Привіт";
size_t len = strlen(s);
strncpy(s, "ok", sizeof s - 1);
int same = strcmp("a", "b") == 0;`, note: "Рядок у C — масив `char`, що закінчується нульовим байтом `\0`. Розмір буфера стежте самі, а копіюйте обережно." },
  ] },
  { t: "Вказівники й пам'ять", items: [
    { t: "Вказівник", code: raw`int x = 10;
int *p = &x;
*p = 20;
printf("%d %p\n", x, (void *)p);`, note: "`&x` адреса змінної, `*p` значення за адресою. Вказівник `NULL` означає «нікуди»." },
    { t: "malloc і free", code: raw`#include <stdlib.h>

int *a = malloc(5 * sizeof *a);
if (a == NULL) return 1;
for (int i = 0; i < 5; i++) a[i] = i * i;
free(a);
a = NULL;`, note: "Кожному `malloc` має відповідати один `free`. Перевіряйте результат на `NULL`, не використовуйте пам'ять після `free`." },
  ] },
  { t: "Структури", items: [
    { t: "struct і typedef", code: raw`typedef struct {
    char name[20];
    int age;
} Person;

Person p = { "Олена", 17 };
Person *q = &p;
printf("%s %d\n", q->name, q->age);`, note: "`struct` об'єднує поля різних типів. До полів через вказівник звертаються стрілкою `->`." },
    { t: "enum", code: raw`enum Color { RED, GREEN, BLUE };
enum Color c = GREEN;`, note: "`enum` дає іменовані цілі константи: зручніше й безпечніше за «магічні числа»." },
  ] },
  { t: "Файли", items: [
    { t: "Читання й запис", code: raw`FILE *f = fopen("data.txt", "r");
if (f == NULL) { perror("fopen"); return 1; }
char line[128];
while (fgets(line, sizeof line, f)) fputs(line, stdout);
fclose(f);`, note: "Завжди перевіряйте результат `fopen` і закривайте файл `fclose`." },
  ] },
  { t: "Препроцесор", items: [
    { t: "Макроси й умовна компіляція", code: raw`#define MAX 100
#define SQUARE(x) ((x) * (x))

#ifdef DEBUG
    puts("налагодження");
#endif`, note: "Макрос підставляється як текст до компіляції. Параметри макросів беріть у дужки й не передавайте виразів із побічними ефектами." },
    { t: "Захист заголовка", code: raw`#ifndef SHAPES_H
#define SHAPES_H

double area(double w, double h);

#endif`, note: "Захист від повторного підключення не дає оголосити одне й те саме двічі." },
  ] },
];
