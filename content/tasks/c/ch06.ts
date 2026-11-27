// Практичні завдання глави «Модульність і препроцесор» (уроки 54–61). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "c-header-module", lesson: "c/54", xp: 25,
    title: "Модуль векторів: заголовок і реалізація",
    context: "Модуль це інтерфейс у заголовку й реалізація в .c. Платформа запускає один файл, тож межі модуля позначені коментарями: зверху «заголовок», нижче «реалізація», а головне, щоб кожен виклик мав прототип.",
    brief: [
      "У секції «vec.h» додайте прототип <code>void vec_print(const Vec *v);</code>, бо <code>main</code> викликає функцію раніше, ніж вона визначена. У секції «vec.c» допишіть <code>vec_add</code>, <code>vec_dot</code> і <code>vec_print</code>, яка друкує <code>(x, y)</code>.",
      "Очікуваний вивід: <code>(4, 6)</code>, потім <code>dot: 11</code> для векторів (1, 2) і (3, 4).",
    ],
    starter: raw`#include <stdio.h>

/* ===== vec.h ===== */
typedef struct {
    int x;
    int y;
} Vec;

Vec vec_add(Vec a, Vec b);
int vec_dot(Vec a, Vec b);

/* ===== main.c ===== */
int main(void) {
    Vec a = {1, 2};
    Vec b = {3, 4};
    Vec s = vec_add(a, b);
    vec_print(&s);
    printf("dot: %d\n", vec_dot(a, b));
    return 0;
}

/* ===== vec.c ===== */
Vec vec_add(Vec a, Vec b) {
    Vec r = {0, 0};
    return r;
}

int vec_dot(Vec a, Vec b) {
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума векторів", has: "(4, 6)", hint: "vec_add повертає вектор із x = a.x + b.x та y = a.y + b.y, а vec_print друкує (x, y)." },
      { on: "stdout", name: "Скалярний добуток", has: "dot: 11", hint: "1*3 + 2*4 = 11: перемножте однойменні координати й додайте." },
      { on: "stdout", name: "Весь вивід", equals: "(4, 6)\ndot: 11", hint: "Два рядки: сума у вигляді (x, y) і рядок dot: 11." },
      { on: "source", name: "Прототип vec_print у заголовку", matches: "void\\s+vec_print\\s*\\(\\s*const\\s+Vec\\s*\\*\\s*\\w*\\s*\\)\\s*;", hint: "Додайте в секцію vec.h рядок void vec_print(const Vec *v); із крапкою з комою." },
    ],
  },
  {
    ...base, id: "c-make-stale", lesson: "c/55", xp: 30,
    title: "Серце make: чи застаріла ціль",
    context: "Make перезбирає ціль лише тоді, коли її немає або залежність новіша. Реалізуйте це правило функцією й подивіться, як воно вирішує, що компілювати після зміни заголовка.",
    brief: [
      "Допишіть <code>stale(target, deps, n)</code>: поверніть 1, якщо час цілі нульовий (файлу немає) або будь-яка залежність новіша за ціль, інакше 0. Цикл по <code>deps</code> обов'язковий.",
      "Очікуваний вивід: <code>main.o: збирати</code>, <code>geometry.o: актуальний</code>, <code>app: збирати</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <stddef.h>

static int stale(long target, const long *deps, size_t n) {
    return 0;
}

int main(void) {
    long header = 5, main_c = 12, geo_c = 15;
    long main_o = 10, geo_o = 20, app = 0;
    long main_deps[] = {main_c, header};
    long geo_deps[] = {geo_c, header};
    long app_deps[] = {main_o, geo_o};
    printf("main.o: %s\n", stale(main_o, main_deps, 2) ? "збирати" : "актуальний");
    printf("geometry.o: %s\n", stale(geo_o, geo_deps, 2) ? "збирати" : "актуальний");
    printf("app: %s\n", stale(app, app_deps, 2) ? "збирати" : "актуальний");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "main.c новіший за main.o", has: "main.o: збирати", hint: "main.c має час 12, а main.o лише 10: залежність новіша, значить збирати." },
      { on: "stdout", name: "geometry.o актуальний", has: "geometry.o: актуальний", hint: "Усі залежності (15 і 5) старіші за ціль (20): повертайте 0." },
      { on: "stdout", name: "Ціль, якої немає", has: "app: збирати", hint: "Нульовий час означає, що файлу ще немає: одразу повертайте 1." },
      { on: "source", name: "Цикл по залежностях", matches: "for\\s*\\(", hint: "Перебирайте deps[i] циклом for і порівнюйте з target." },
    ],
  },
  {
    ...base, id: "c-macro-safe", lesson: "c/56", xp: 30,
    title: "Безпечні макроси: дужки скрізь",
    context: "Макрос підставляє текст, тому без дужок пріоритет операторів ламає результат. Перепишіть три макроси так, щоб вони поводилися як функції на будь-якому виразі.",
    brief: [
      "У заготовці <code>SQUARE</code>, <code>ABS</code> і <code>CLAMP</code> написані без дужок і дають неправильні числа. Візьміть у дужки кожен параметр і все тіло макроса.",
      "Очікуваний вивід: <code>SQUARE(1 + 2) = 9</code>, <code>ABS(2 - 5) = 3</code>, <code>CLAMP(15, 0, 10) = 10</code>, <code>CLAMP(-4, 0, 10) = 0</code>. Функцію <code>main</code> не змінюйте.",
    ],
    starter: raw`#include <stdio.h>

#define SQUARE(x) x * x
#define ABS(x) x < 0 ? -x : x
#define CLAMP(x, lo, hi) x < lo ? lo : x > hi ? hi : x

int main(void) {
    printf("SQUARE(1 + 2) = %d\n", SQUARE(1 + 2));
    printf("ABS(2 - 5) = %d\n", ABS(2 - 5));
    printf("CLAMP(15, 0, 10) = %d\n", CLAMP(15, 0, 10));
    printf("CLAMP(-4, 0, 10) = %d\n", CLAMP(-4, 0, 10));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Квадрат суми", has: "SQUARE(1 + 2) = 9", hint: "Без дужок вийде 1 + 2 * 1 + 2 = 5. Напишіть ((x) * (x))." },
      { on: "stdout", name: "Модуль різниці", has: "ABS(2 - 5) = 3", hint: "Параметр x стоїть тричі: у кожному місці потрібні дужки, і ціле тіло теж у дужках." },
      { on: "stdout", name: "Весь вивід", equals: "SQUARE(1 + 2) = 9\nABS(2 - 5) = 3\nCLAMP(15, 0, 10) = 10\nCLAMP(-4, 0, 10) = 0", hint: "Виправте всі три макроси: чотири рядки виводу мають збігтися." },
      { on: "source", name: "SQUARE у дужках", matches: "#define\\s+SQUARE\\s*\\(\\s*x\\s*\\)\\s+\\(\\s*\\(\\s*x\\s*\\)\\s*\\*\\s*\\(\\s*x\\s*\\)\\s*\\)", hint: "Тіло має вигляд ((x) * (x)): дужки навколо кожного x і навколо всього добутку." },
    ],
  },
  {
    ...base, id: "c-feature-flags", lesson: "c/57", xp: 30,
    title: "Прапорці збірки: #if і значення за замовчуванням",
    context: "Умовна компіляція вирішує, який варіант коду потрапить у програму. Допишіть вибір назви режиму через #if/#elif та значення за замовчуванням для LIMIT через #ifndef.",
    brief: [
      "У <code>mode_name</code> поверніть <code>\"debug\"</code> для <code>MODE == 1</code>, <code>\"release\"</code> для 2 і <code>\"unknown\"</code> в інших випадках, використавши <code>#if</code>, <code>#elif</code>, <code>#else</code>, <code>#endif</code>. Усередині <code>#ifndef LIMIT</code> задайте <code>#define LIMIT 3</code>.",
      "Очікуваний вивід: <code>mode: release</code> і <code>limit: 3</code>.",
    ],
    starter: raw`#include <stdio.h>

#define MODE 2

#ifndef LIMIT
#endif

static const char *mode_name(void) {
    return "?";
}

int main(void) {
    printf("mode: %s\n", mode_name());
    printf("limit: %d\n", LIMIT);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Назва режиму", has: "mode: release", hint: "Для MODE == 2 гілка #elif має повертати \"release\"." },
      { on: "stdout", name: "Значення за замовчуванням", has: "limit: 3", hint: "Між #ifndef LIMIT та #endif поставте #define LIMIT 3." },
      { on: "stdout", name: "Весь вивід", equals: "mode: release\nlimit: 3", hint: "Два рядки: mode: release і limit: 3." },
      { on: "source", name: "Вибір через #if MODE", matches: "#if\\s+MODE\\s*==\\s*1[\\s\\S]*#elif\\s+MODE\\s*==\\s*2[\\s\\S]*#endif", hint: "Скористайтеся ланцюжком #if MODE == 1 ... #elif MODE == 2 ... #else ... #endif." },
    ],
  },
  {
    ...base, id: "c-static-ids", lesson: "c/58", xp: 30,
    title: "Лічильник ідентифікаторів зі static",
    context: "Статична змінна переживає виклики функції, а static на рівні файла ховає ім'я від інших файлів. Зробіть генератор ідентифікаторів зі збереженим станом і приватним лічильником викликів.",
    brief: [
      "Усередині <code>next_id</code> оголосіть <code>static int last = 0;</code> і повертайте збільшене значення. На рівні файла додайте <code>static int calls = 0;</code>, збільшуйте його в <code>next_id</code>, а <code>total_calls</code> нехай повертає <code>calls</code>.",
      "Очікуваний вивід: <code>ids: 1 2 3</code> і <code>calls: 3</code>.",
    ],
    starter: raw`#include <stdio.h>

static int next_id(void) {
    int last = 0;
    last++;
    return last;
}

static int total_calls(void) {
    return 0;
}

int main(void) {
    int a = next_id();
    int b = next_id();
    int c = next_id();
    printf("ids: %d %d %d\n", a, b, c);
    printf("calls: %d\n", total_calls());
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Ідентифікатори зростають", has: "ids: 1 2 3", hint: "Змінна last має бути static: тоді вона зберігає значення між викликами." },
      { on: "stdout", name: "Лічильник викликів", has: "calls: 3", hint: "Збільшуйте calls у next_id, а total_calls повертайте його." },
      { on: "stdout", name: "Весь вивід", equals: "ids: 1 2 3\ncalls: 3", hint: "Два рядки: ids: 1 2 3 і calls: 3." },
      { on: "source", name: "Статична локальна last", matches: "static\\s+int\\s+last\\s*=\\s*0", hint: "Усередині next_id напишіть static int last = 0;" },
      { on: "source", name: "Приватний лічильник calls", matches: "static\\s+int\\s+calls\\s*=\\s*0", hint: "На рівні файла, над функціями: static int calls = 0;" },
    ],
  },
  {
    ...base, id: "c-mini-tests", lesson: "c/59", xp: 35,
    title: "Міні-фреймворк тестів: макрос CHECK",
    context: "Тест це програма, що порівнює очікуване з фактичним. Власний макрос CHECK рахує перевірки, показує текст кожної, що провалилась, і не зупиняє решту тестів, на відміну від assert.",
    brief: [
      "Допишіть макрос <code>CHECK(cond)</code> у формі <code>do { } while (0)</code>: збільшуйте <code>checks</code>, а якщо умова хибна, збільшуйте <code>failed</code> і друкуйте <code>FAIL: </code> та текст умови через <code>#cond</code>.",
      "Одна з перевірок у <code>main</code> навмисно хибна. Очікуваний вивід: <code>FAIL: clamp(99, 0, 10) == 9</code>, потім <code>перевірок: 4, помилок: 1</code>.",
    ],
    starter: raw`#include <stdio.h>

static int checks = 0;
static int failed = 0;

#define CHECK(cond) do { } while (0)

static int clamp(int x, int lo, int hi) {
    if (x < lo) {
        return lo;
    }
    if (x > hi) {
        return hi;
    }
    return x;
}

int main(void) {
    CHECK(clamp(5, 0, 10) == 5);
    CHECK(clamp(-3, 0, 10) == 0);
    CHECK(clamp(99, 0, 10) == 9);
    CHECK(clamp(10, 0, 10) == 10);
    printf("перевірок: %d, помилок: %d\n", checks, failed);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Текст хибної умови", has: "FAIL: clamp(99, 0, 10) == 9", hint: "Друкуйте printf(\"FAIL: %s\\n\", #cond); оператор # перетворює умову на рядок." },
      { on: "stdout", name: "Підсумок", has: "перевірок: 4, помилок: 1", hint: "checks збільшується при кожній перевірці, failed лише коли умова хибна." },
      { on: "stdout", name: "Весь вивід", equals: "FAIL: clamp(99, 0, 10) == 9\nперевірок: 4, помилок: 1", hint: "Успішні перевірки нічого не друкують." },
      { on: "source", name: "Рядкове подання через #cond", matches: "#\\s*cond", hint: "Використайте оператор # перед іменем параметра макроса." },
    ],
  },
  {
    ...base, id: "c-generic-kind", lesson: "c/60", xp: 40,
    title: "_Generic: назва типу й перевірка під час компіляції",
    context: "_Generic вибирає вираз за типом ще під час компіляції, а _Static_assert зупиняє збірку, якщо припущення про платформу хибне. Разом вони замінюють небезпечні макроси типобезпечними.",
    brief: [
      "Перепишіть <code>KIND(x)</code> через <code>_Generic</code>: <code>int</code> дає <code>\"int\"</code>, <code>double</code> дає <code>\"double\"</code>, <code>float</code> дає <code>\"float\"</code>, <code>char *</code> дає <code>\"text\"</code>, решта <code>\"other\"</code>. Додайте <code>_Static_assert</code>, що <code>sizeof(double) == 8</code>.",
      "Очікуваний вивід: <code>i: int</code>, <code>d: double</code>, <code>f: float</code>, <code>s: text</code>, <code>'a': int</code> (символьна константа в C має тип <code>int</code>).",
    ],
    starter: raw`#include <stdio.h>

#define KIND(x) "?"

int main(void) {
    int i = 7;
    double d = 2.5;
    float f = 1.5f;
    char buf[] = "hi";
    char *s = buf;
    printf("i: %s\n", KIND(i));
    printf("d: %s\n", KIND(d));
    printf("f: %s\n", KIND(f));
    printf("s: %s\n", KIND(s));
    printf("'a': %s\n", KIND('a'));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Цілий і дробовий типи", has: "d: double", hint: "У _Generic додайте гілку double: \"double\"; тип double відрізняється від float." },
      { on: "stdout", name: "Символьна константа це int", has: "'a': int", hint: "У C літерал 'a' має тип int, тому підійде та сама гілка int: \"int\"." },
      { on: "stdout", name: "Весь вивід", equals: "i: int\nd: double\nf: float\ns: text\n'a': int", hint: "Для char * поверніть \"text\", для решти типів default: \"other\"." },
      { on: "source", name: "Вибір через _Generic", matches: "_Generic\\s*\\(", hint: "Макрос має розгортатися в _Generic((x), int: ..., default: ...)." },
      { on: "source", name: "Перевірка через _Static_assert", matches: "_Static_assert\\s*\\(\\s*sizeof\\s*\\(\\s*double\\s*\\)\\s*==\\s*8", hint: "Додайте _Static_assert(sizeof(double) == 8, \"double має бути 8 байтів\");" },
    ],
  },
  {
    ...base, id: "c-plugin-lookup", lesson: "c/61", xp: 40,
    title: "Пошук символу за іменем, як dlsym",
    context: "Динамічне підвантаження бере функцію за ім'ям і повертає вказівник або NULL. Змоделюйте це таблицею експорту й функцією пошуку, щоб зрозуміти, що робить dlsym і чому його результат треба перевіряти.",
    brief: [
      "Допишіть <code>lookup</code>: пройдіть таблицю <code>exports</code> і поверніть вказівник на функцію, ім'я якої збігається з <code>name</code> (порівнюйте через <code>strcmp</code>), або <code>NULL</code>, якщо такого символу немає.",
      "Очікуваний вивід: <code>add: 13</code>, <code>mul: 42</code>, <code>div: символ не знайдено</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <string.h>

typedef int (*op_fn)(int, int);

typedef struct {
    const char *name;
    op_fn fn;
} Export;

static int op_add(int a, int b) {
    return a + b;
}

static int op_mul(int a, int b) {
    return a * b;
}

static const Export exports[] = {
    {"add", op_add},
    {"mul", op_mul},
};

static op_fn lookup(const char *name) {
    return NULL;
}

int main(void) {
    const char *names[] = {"add", "mul", "div"};
    for (int i = 0; i < 3; i++) {
        op_fn fn = lookup(names[i]);
        if (fn == NULL) {
            printf("%s: символ не знайдено\n", names[i]);
        } else {
            printf("%s: %d\n", names[i], fn(6, 7));
        }
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Знайдено add", has: "add: 13", hint: "Порівняйте name з exports[i].name через strcmp(...) == 0 і поверніть exports[i].fn." },
      { on: "stdout", name: "Знайдено mul", has: "mul: 42", hint: "Цикл має пройти всю таблицю, а не лише перший елемент." },
      { on: "stdout", name: "Весь вивід", equals: "add: 13\nmul: 42\ndiv: символ не знайдено", hint: "Для відсутнього імені після циклу поверніть NULL." },
      { on: "source", name: "Порівняння через strcmp", matches: "strcmp\\s*\\(", hint: "Рядки порівнюють функцією strcmp, а не знаком ==." },
    ],
  },
];
