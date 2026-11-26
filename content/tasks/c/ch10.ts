// Практичні завдання глави «Тестування й якість» (уроки 93–98). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_10: readonly RemoteTask[] = [
  {
    ...base, id: "c-table-tests", lesson: "c/93", xp: 30,
    title: "Табличний тест для gcd",
    context: "Табличні тести дають звіт про всі випадки одразу, а код виходу повідомляє CI про збій. Граничні входи (нуль, рівні числа) саме ті, на яких найчастіше ламаються функції.",
    brief: [
      "Дві частини: додайте в таблицю випадки <code>{\"нуль\", 0, 7, 7}</code> і <code>{\"рівні\", 9, 9, 9}</code> та напишіть цикл. Для кожного рядка викличте <code>gcd</code>: збіг друкуйте як <code>ok ім'я</code>, розбіжність як <code>FAIL ім'я: got X, want Y</code> і рахуйте в <code>failed</code>.",
      "Наприкінці надрукуйте <code>провалено: 0 з 5</code> (кількість рядків рахуйте через <code>sizeof</code>) і поверніть <code>failed ? 1 : 0</code>.",
    ],
    starter: raw`#include <stdio.h>

static int gcd(int a, int b) {
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a;
}

struct Case {
    const char *name;
    int a;
    int b;
    int want;
};

int main(void) {
    struct Case cases[] = {
        {"звичайні", 12, 18, 6},
        {"взаємно прості", 17, 5, 1},
        {"кратні", 21, 7, 7},
    };
    size_t n = sizeof cases / sizeof cases[0];
    int failed = 0;
    printf("випадків: %zu\n", n);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Звіт про звичайний випадок", has: "ok звичайні", hint: "Для кожного рядка таблиці порівняйте gcd(a, b) із want і друкуйте ok та ім'я випадку." },
      { on: "stdout", name: "Граничні випадки додано", has: "ok рівні", hint: "Додайте до масиву cases рядки {\"нуль\", 0, 7, 7} і {\"рівні\", 9, 9, 9}." },
      { on: "stdout", name: "Весь вивід", equals: "ok звичайні\nok взаємно прості\nok кратні\nok нуль\nok рівні\nпровалено: 0 з 5", hint: "Після циклу надрукуйте «провалено: %d з %zu»; кількість випадків дає sizeof cases / sizeof cases[0]." },
      { on: "source", name: "Код виходу за результатом", matches: "failed\\s*\\?\\s*1\\s*:\\s*0", hint: "Замість return 0 поверніть failed ? 1 : 0, щоб збій було видно ззовні." },
    ],
  },
  {
    ...base, id: "c-mini-framework", lesson: "c/94", xp: 35,
    title: "Макрос EXPECT_EQ для власного каркаса",
    context: "Мінімальний каркас із двох лічильників і макроса замінює десятки однакових printf. Головне, щоб він сам помічав збій, друкував рядок і не обчислював аргументи двічі.",
    brief: [
      "Замініть заглушку <code>EXPECT_EQ(actual, expected)</code> на макрос у <code>do { … } while (0)</code>: аргументи покладіть у <code>long long</code>, збільште <code>g_run</code>, а при розбіжності <code>g_failed</code> і надрукуйте <code>FAIL строка N: вираз == вираз (a != e)</code>, використавши <code>__LINE__</code> та <code>#actual</code>, <code>#expected</code>.",
      "<code>main</code> навмисно містить одну хибну перевірку, щоб довести, що каркас бачить збій. Очікується: <code>збій виявлено: так</code> і <code>перевірок: 3, провалено: 0</code>.",
    ],
    starter: raw`#include <stdio.h>

static int g_run;
static int g_failed;

#define EXPECT_EQ(actual, expected) ((void)0)

static int add(int a, int b) {
    return a + b;
}

int main(void) {
    EXPECT_EQ(add(2, 3), 5);
    EXPECT_EQ(add(-4, 4), 0);
    int before = g_failed;
    EXPECT_EQ(add(2, 2), 5);
    int caught = g_failed - before;
    g_failed = before;
    printf("збій виявлено: %s\n", caught == 1 ? "так" : "ні");
    printf("перевірок: %d, провалено: %d\n", g_run, g_failed);
    return g_failed ? 1 : 0;
}
`,
    checks: [
      { on: "stdout", name: "Збій помічено", has: "збій виявлено: так", hint: "При a != e збільште g_failed і надрукуйте повідомлення: без цього каркас нічого не помічає." },
      { on: "stdout", name: "Обидва значення у звіті", has: "(4 != 5)", hint: "У printf виведіть %lld != %lld з тимчасових змінних, а не з аргументів макроса." },
      { on: "stdout", name: "Лічильники", has: "перевірок: 3, провалено: 0", hint: "Збільшуйте g_run на кожному виклику EXPECT_EQ, незалежно від результату." },
      { on: "source", name: "Номер рядка й текст виразу", matches: "__LINE__.*#\\s*actual", hint: "У повідомленні використайте __LINE__ та стрингіфікацію #actual." },
      { on: "source", name: "Обгортка do-while", matches: "do\\s*\\{.*\\}\\s*while\\s*\\(\\s*0\\s*\\)", hint: "Загорніть тіло макроса в do { … } while (0), щоб він поводився як один оператор." },
    ],
  },
  {
    ...base, id: "c-memstream-test", lesson: "c/95", xp: 35,
    title: "Тест функцій із потоками в пам'яті",
    context: "Функції, що працюють із FILE *, перевіряються без терміналу й файлів: вхід дає fmemopen, а вивід збирає open_memstream. Так тестують парсери й форматери звітів.",
    brief: [
      "Допишіть <code>read_numbers(in, &amp;sum)</code>: читає цілі через <code>fscanf</code> до кінця потоку, записує суму в <code>*sum</code> і повертає кількість прочитаних чисел. Допишіть <code>print_stats(out, sum, count)</code>: пише в потік рядок <code>sum=12 count=3</code> із переносом.",
      "Тестова обв'язка вже є: вона годує функції рядками через <code>fmemopen</code> і збирає вивід через <code>open_memstream</code>. Усі три випадки мають дати <code>ok</code>, а код виходу бути нульовим.",
    ],
    starter: raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int read_numbers(FILE *in, int *sum) {
    *sum = 0;
    return 0;
}

static void print_stats(FILE *out, int sum, int count) {
}

static char *run(const char *input) {
    char text[128];
    snprintf(text, sizeof text, "%s", input);
    char *result = NULL;
    size_t size = 0;
    FILE *in = fmemopen(text, strlen(text), "r");
    FILE *out = open_memstream(&result, &size);
    if (in == NULL || out == NULL) {
        abort();
    }
    int sum;
    int count = read_numbers(in, &sum);
    print_stats(out, sum, count);
    fclose(in);
    fclose(out);
    return result;
}

int main(void) {
    static const struct {
        const char *name;
        const char *in;
        const char *want;
    } cases[] = {
        {"кілька чисел", "3 4 5\n", "sum=12 count=3\n"},
        {"з мінусом", "-2 10", "sum=8 count=2\n"},
        {"порожньо", "", "sum=0 count=0\n"},
    };
    int failed = 0;
    for (size_t i = 0; i < sizeof cases / sizeof cases[0]; i++) {
        char *got = run(cases[i].in);
        int ok = strcmp(got, cases[i].want) == 0;
        printf("%s %s\n", ok ? "ok  " : "FAIL", cases[i].name);
        failed += !ok;
        free(got);
    }
    return failed ? 1 : 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума кількох чисел", has: "ok   кілька чисел", hint: "У read_numbers у циклі while (fscanf(in, \"%d\", &v) == 1) додавайте v до *sum й рахуйте числа." },
      { on: "stdout", name: "Від'ємні числа", has: "ok   з мінусом", hint: "%d у fscanf сам розуміє мінус; перевірте, що *sum накопичується, а не перезаписується." },
      { on: "stdout", name: "Порожній вхід", has: "ok   порожньо", hint: "Для порожнього потоку fscanf одразу повертає EOF: сума й кількість лишаються нулями, але print_stats усе одно має надрукувати рядок." },
      { on: "stdout", name: "Весь вивід", equals: "ok   кілька чисел\nok   з мінусом\nok   порожньо", hint: "Формат рядка точно такий: fprintf(out, \"sum=%d count=%d\\n\", sum, count)." },
    ],
  },
  {
    ...base, id: "c-safe-ub", lesson: "c/96", xp: 40,
    title: "Код, чистий під санітайзерами",
    context: "UB-арифметика й запис за межу буфера проходять тихо, доки їх не зловить UBSan чи ASan. Безпечні версії перевіряють умову до дії, а не після неї.",
    brief: [
      "Допишіть <code>checked_add(a, b, &amp;out)</code>: поверніть 0, якщо <code>a + b</code> не вміщається в <code>int</code> (перевірте через <code>INT_MAX</code> і <code>INT_MIN</code> до додавання, а не після), інакше запишіть суму й поверніть 1.",
      "Допишіть <code>copy_bounded(dst, cap, src)</code>: копіює не більше <code>cap - 1</code> символів, завжди завершує нулем і повертає кількість скопійованих; при <code>cap == 0</code> нічого не пише й повертає 0. Без <code>strcpy</code>.",
    ],
    starter: raw`#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

static int checked_add(int a, int b, int *out) {
    *out = 0;
    return 1;
}

static size_t copy_bounded(char *dst, size_t cap, const char *src) {
    return 0;
}

static void show_add(const char *label, int a, int b) {
    int r;
    if (checked_add(a, b, &r)) {
        printf("%s = %d\n", label, r);
    } else {
        printf("%s: переповнення\n", label);
    }
}

int main(void) {
    show_add("-5+3", -5, 3);
    show_add("INT_MAX+1", INT_MAX, 1);
    show_add("INT_MIN+(-1)", INT_MIN, -1);
    char *dst = malloc(5);
    if (dst == NULL) {
        return 1;
    }
    dst[0] = '\0';
    size_t n = copy_bounded(dst, 5, "abcdefgh");
    printf("скопійовано %zu: %s\n", n, dst);
    n = copy_bounded(dst, 0, "xyz");
    printf("cap=0: скопійовано %zu, dst: %s\n", n, dst);
    n = copy_bounded(dst, 5, "hi");
    printf("скопійовано %zu: %s\n", n, dst);
    free(dst);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Додавання без переповнення", has: "-5+3 = -2", hint: "Якщо перевірки не спрацювали, запишіть a + b у *out і поверніть 1." },
      { on: "stdout", name: "Переповнення вгору й вниз", has: "INT_MIN+(-1): переповнення", hint: "Для b > 0 перевіряйте a > INT_MAX - b, для b < 0 перевіряйте a < INT_MIN - b: ці різниці самі не переповнюються." },
      { on: "stdout", name: "Обрізання з нулем наприкінці", has: "скопійовано 4: abcd", hint: "Копіюйте, поки n + 1 < cap і src[n] не нуль, потім dst[n] = '\\0'." },
      { on: "stdout", name: "Весь вивід", equals: "-5+3 = -2\nINT_MAX+1: переповнення\nINT_MIN+(-1): переповнення\nскопійовано 4: abcd\ncap=0: скопійовано 0, dst: abcd\nскопійовано 2: hi", hint: "При cap == 0 одразу return 0, не торкаючись dst." },
      { on: "source", name: "Без strcpy", matches: "strcpy\\s*\\(", not: true, hint: "strcpy не знає розміру цілі: пишіть цикл із межею cap." },
    ],
  },
  {
    ...base, id: "c-count-steps", lesson: "c/97", xp: 40,
    title: "Двійковий пошук і лічильник кроків",
    context: "Виграш від кращого алгоритму видно у кількості кроків, а не в мілісекундах: лічильник однаковий на будь-якій машині, тож його можна перевіряти в тестах і CI.",
    brief: [
      "Допишіть <code>binary_search(key, &amp;steps)</code> для відсортованого масиву <code>a</code>: на кожну перевірку середнього елемента збільшуйте <code>*steps</code>, поверніть індекс або -1. Лінійний пошук уже є.",
      "<code>main</code> шукає всі 1000 ключів обома способами і порівнює кроки. Очікується: лінійний знайшов 1000 за 500500 кроків, двійковий теж знайшов 1000 і виявився швидшим у 40 і більше разів.",
    ],
    starter: raw`#include <stdio.h>

#define N 1000

static int a[N];

static int linear_search(int key, long *steps) {
    for (int i = 0; i < N; i++) {
        (*steps)++;
        if (a[i] == key) {
            return i;
        }
    }
    return -1;
}

static int binary_search(int key, long *steps) {
    return -1;
}

int main(void) {
    for (int i = 0; i < N; i++) {
        a[i] = i * 2;
    }
    long lin = 0;
    long bin = 0;
    int found_lin = 0;
    int found_bin = 0;
    for (int i = 0; i < N; i++) {
        if (linear_search(i * 2, &lin) == i) {
            found_lin++;
        }
        if (binary_search(i * 2, &bin) == i) {
            found_bin++;
        }
    }
    printf("лінійний: знайдено %d, кроків %ld\n", found_lin, lin);
    printf("двійковий: знайдено %d\n", found_bin);
    printf("двійковий швидший у 40+ разів: %s\n", bin > 0 && bin * 40 < lin ? "так" : "ні");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Лінійний пошук", has: "лінійний: знайдено 1000, кроків 500500", hint: "Цей рядок дає готова функція: він має збігатися без змін." },
      { on: "stdout", name: "Двійковий знаходить усе", has: "двійковий: знайдено 1000", hint: "Тримайте межі lo і hi, дивіться на a[mid]: менший за ключ зсуває lo, більший зсуває hi." },
      { on: "stdout", name: "Кроки пораховано", has: "40+ разів: так", hint: "Збільшуйте *steps на кожній ітерації циклу (кожному порівнянні з a[mid]); без цього bin дорівнює нулю." },
      { on: "stdout", name: "Весь вивід", equals: "лінійний: знайдено 1000, кроків 500500\nдвійковий: знайдено 1000\nдвійковий швидший у 40+ разів: так", hint: "Не змінюйте main: потрібна лише функція binary_search." },
    ],
  },
  {
    ...base, id: "c-style-fix", lesson: "c/98", xp: 30,
    title: "Приведіть код до стилю",
    context: "Формат і змістові звички (дужки, const, size_t) це те, що clang-format і clang-tidy вимагають у проєктах. Тут ви робите вручну те, що в роботі роблять інструменти.",
    brief: [
      "Перепишіть код у охайному стилі, не змінюючи логіки: функція <code>static size_t count_positive(const int *a, size_t n)</code>, відступи по 4 пропуски, фігурні дужки навколо кожного тіла <code>for</code> і <code>if</code>, довжина масиву через <code>sizeof v / sizeof v[0]</code> у змінній <code>size_t n</code>.",
      "Очікуваний вивід: <code>додатних: 3 з 6</code> (формат <code>%zu</code> для <code>size_t</code>).",
    ],
    starter: raw`#include <stdio.h>

int count_positive(int *a,int n){
int c=0;
for(int i=0;i<n;i++)
if(a[i]>0)
c++;
return c;
}

int main(void){
int v[]={3,-1,0,7,-5,2};
printf("додатних: %d\n",count_positive(v,6));
return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід", equals: "додатних: 3 з 6", hint: "Надрукуйте кількість додатних і довжину масиву: printf(\"додатних: %zu з %zu\\n\", …)." },
      { on: "source", name: "const і size_t у функції", matches: "static\\s+size_t\\s+count_positive\\s*\\(\\s*const\\s+int\\s*\\*\\s*\\w+\\s*,\\s*size_t\\s+\\w+\\s*\\)", hint: "Сигнатура: static size_t count_positive(const int *a, size_t n)." },
      { on: "source", name: "Довжина через sizeof", matches: "sizeof\\s+\\w+\\s*/\\s*sizeof\\s+\\w+\\s*\\[\\s*0\\s*\\]", hint: "Не пишіть 6 вручну: size_t n = sizeof v / sizeof v[0]." },
      { on: "source", name: "Дужки навколо кожного тіла", matches: "(if|for)\\s*\\([^)]*\\)\\s*[^{\\s]", not: true, hint: "Після умови if і заголовка for поставте { на тому ж рядку й закрийте }, навіть для одного оператора; умови пишіть без вкладених дужок." },
    ],
  },
];
