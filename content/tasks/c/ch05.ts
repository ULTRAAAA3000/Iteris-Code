// Практичні завдання глави «Структури й типи» (уроки 45–53). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05: readonly RemoteTask[] = [
  {
    ...base, id: "c-struct-copy", lesson: "c/45", xp: 25,
    title: "Студент: збірка структури й копія",
    context: "Записи з кількома полями це основа будь-якої програми: користувачі, замовлення, точки. Важливо розуміти, що структура копіюється цілком, тому функція, яка отримала її за значенням, не змінює оригінал.",
    brief: [
      "Допишіть <code>make_student</code>: скопіюйте ім'я в <code>s.name</code> через <code>snprintf</code>, а клас і середній бал запишіть у відповідні поля. Допишіть <code>promoted</code>: функція отримує студента за значенням і повертає його з класом на одиницю більшим.",
      "Очікуваний вивід: <code>Olena 9 10.5</code>, потім <code>Olena 10 10.5</code>. Оригінал <code>a</code> не змінюється, бо функція працює з копією. Функції <code>show</code> і <code>main</code> чіпати не треба.",
    ],
    starter: raw`#include <stdio.h>
#include <string.h>

struct Student {
    char name[16];
    int grade;
    double avg;
};

struct Student make_student(const char *name, int grade, double avg) {
    struct Student s = {0};
    return s;
}

struct Student promoted(struct Student s) {
    return s;
}

void show(struct Student s) {
    printf("%s %d %.1f\n", s.name, s.grade, s.avg);
}

int main(void) {
    struct Student a = make_student("Olena", 9, 10.5);
    struct Student b = promoted(a);
    show(a);
    show(b);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Студента створено", has: "Olena 9 10.5", hint: "Заповніть три поля: ім'я, клас і середній бал, потім поверніть s." },
      { on: "stdout", name: "Підвищена копія", has: "Olena 10 10.5", hint: "Параметр s уже є копією: збільште s.grade й поверніть його." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "Olena 9 10.5\nOlena 10 10.5", hint: "Перший рядок це оригінал, другий підвищена копія." },
      { on: "source", name: "Ім'я скопійовано через snprintf", matches: "snprintf\\s*\\(\\s*s\\.name", hint: "Масив не присвоїти знаком =, напишіть snprintf(s.name, sizeof s.name, \"%s\", name);" },
    ],
  },
  {
    ...base, id: "c-nested-rect", lesson: "c/46", xp: 25,
    title: "Прямокутник із двох точок",
    context: "Складні типи збирають із простих: прямокутник із двох точок, замовлення з адреси. Вкладені поля й невеликі функції над ними роблять код близьким до предметної області.",
    brief: [
      "У заготовці є типи <code>Point</code> і <code>Rect</code> (дві точки <code>min</code> і <code>max</code>). Допишіть <code>rect_area</code>, <code>rect_contains</code> (межі входять у прямокутник) і <code>rect_shift</code>, що повертає зсунуту копію й не змінює оригінал.",
      "Для <code>Rect r = {{1, 1}, {5, 4}}</code> очікується: площа 12, точка (3, 2) усередині, точка (6, 2) ні, зсув на (2, 3) дає кути (3,4) і (7,7).",
    ],
    starter: raw`#include <stdio.h>

typedef struct {
    int x;
    int y;
} Point;

typedef struct {
    Point min;
    Point max;
} Rect;

int rect_area(Rect r) {
    return 0;
}

int rect_contains(Rect r, Point p) {
    return 0;
}

Rect rect_shift(Rect r, int dx, int dy) {
    return r;
}

int main(void) {
    Rect r = {{1, 1}, {5, 4}};
    Point in = {3, 2};
    Point out = {6, 2};
    Rect m = rect_shift(r, 2, 3);
    printf("площа: %d\n", rect_area(r));
    printf("всередині: %d %d\n", rect_contains(r, in), rect_contains(r, out));
    printf("зсунутий: (%d,%d)-(%d,%d)\n", m.min.x, m.min.y, m.max.x, m.max.y);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Площа обчислена", has: "площа: 12", hint: "Ширина це r.max.x - r.min.x, висота r.max.y - r.min.y." },
      { on: "stdout", name: "Точки всередині й ззовні", has: "всередині: 1 0", hint: "Усі чотири порівняння нестрогі: x між min.x і max.x, y між min.y і max.y." },
      { on: "stdout", name: "Зсув виконано", has: "зсунутий: (3,4)-(7,7)", hint: "Змініть обидві точки копії: x на dx, y на dy." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "площа: 12\nвсередині: 1 0\nзсунутий: (3,4)-(7,7)", hint: "Три рядки: площа, всередині, зсунутий." },
      { on: "source", name: "Доступ до вкладених полів", matches: "r\\s*\\.\\s*max\\s*\\.\\s*x", hint: "До поля вкладеної точки дістаються ланцюжком: r.max.x." },
    ],
  },
  {
    ...base, id: "c-struct-pointers", lesson: "c/47", xp: 30,
    title: "Рахунки: зміна через вказівник",
    context: "Функції на кшталт list_push чи conn_close беруть вказівник на структуру й змінюють її на місці. Саме так у C пишуть код, що працює з об'єктом, а не з його копією.",
    brief: [
      "Допишіть <code>deposit</code> (додає суму), <code>withdraw</code> (знімає, якщо вистачає коштів, повертає 1, інакше 0 і нічого не змінює) та <code>richest</code>, що повертає вказівник на рахунок із найбільшим балансом. Усі зміни роблять через <code>-&gt;</code>.",
      "Очікуваний вивід: <code>зняття 500: 0, баланс 100</code>, <code>зняття 60: 1, баланс 40</code>, <code>найбагатший: 3 (340)</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

typedef struct {
    int id;
    long balance;
} Account;

void deposit(Account *a, long sum) {
}

int withdraw(Account *a, long sum) {
    return 0;
}

Account *richest(Account *list, size_t n) {
    return NULL;
}

int main(void) {
    Account list[3] = {{1, 100}, {2, 250}, {3, 40}};
    deposit(&list[2], 300);
    int ok = withdraw(&list[0], 500);
    printf("зняття 500: %d, баланс %ld\n", ok, list[0].balance);
    ok = withdraw(&list[0], 60);
    printf("зняття 60: %d, баланс %ld\n", ok, list[0].balance);
    Account *top = richest(list, 3);
    if (top != NULL) {
        printf("найбагатший: %d (%ld)\n", top->id, top->balance);
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Зняття більше за баланс відхилено", has: "зняття 500: 0, баланс 100", hint: "Спершу перевірте sum > a->balance: тоді поверніть 0 і нічого не міняйте." },
      { on: "stdout", name: "Коректне зняття", has: "зняття 60: 1, баланс 40", hint: "Якщо коштів вистачає, зробіть a->balance -= sum; і поверніть 1." },
      { on: "stdout", name: "Знайдено найбагатший рахунок", has: "найбагатший: 3 (340)", hint: "Тримайте вказівник best на кращий елемент і порівнюйте list[i].balance з best->balance." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "зняття 500: 0, баланс 100\nзняття 60: 1, баланс 40\nнайбагатший: 3 (340)", hint: "deposit має додати 300 до рахунку з id 3 (було 40)." },
      { on: "source", name: "Доступ через стрілку", matches: "a\\s*->\\s*balance", hint: "Змінюйте поле через вказівник: a->balance." },
    ],
  },
  {
    ...base, id: "c-struct-sort", lesson: "c/48", xp: 35,
    title: "Товари: динамічний масив і qsort",
    context: "Таблиця записів на купі й сортування за полем це щоденний патерн C: список файлів, рядки звіту, замовлення. Порівнювач з другим критерієм робить порядок стабільним і передбачуваним.",
    brief: [
      "Допишіть <code>load_products</code>: виділіть через <code>malloc</code> масив на всі записи таблиці <code>TABLE</code>, скопіюйте їх, віддайте довжину через <code>*count</code>. Допишіть <code>cmp_price</code>: за ціною за зростанням, а за рівних цін за назвою (<code>strcmp</code>).",
      "Очікуваний вивід п'ять рядків: <code>glue 8</code>, <code>pen 15</code>, <code>tape 15</code>, <code>ink 40</code>, <code>book 120</code>. Пам'ять звільняє <code>main</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[16];
    int price;
} Product;

static const Product TABLE[] = {{"pen", 15}, {"ink", 40}, {"book", 120}, {"tape", 15}, {"glue", 8}};

Product *load_products(size_t *count) {
    *count = 0;
    return NULL;
}

int cmp_price(const void *a, const void *b) {
    return 0;
}

int main(void) {
    size_t n = 0;
    Product *items = load_products(&n);
    if (items == NULL) {
        printf("немає даних\n");
        return 0;
    }
    qsort(items, n, sizeof *items, cmp_price);
    for (size_t i = 0; i < n; i++) {
        printf("%s %d\n", items[i].name, items[i].price);
    }
    free(items);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Найдешевший товар першим", has: "glue 8", hint: "load_products має повернути не NULL, а масив із п'яти записів." },
      { on: "stdout", name: "Рівні ціни впорядковано за назвою", has: "pen 15\ntape 15", hint: "Якщо ціни рівні, поверніть strcmp(x->name, y->name)." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "glue 8\npen 15\ntape 15\nink 40\nbook 120", hint: "Порядок: ціна за зростанням, потім назва." },
      { on: "source", name: "Пам'ять виділено на купі", matches: "malloc\\s*\\(|calloc\\s*\\(", hint: "Скористайтеся malloc(n * sizeof *items) і перевірте результат на NULL." },
      { on: "source", name: "Порівнювач використовує вказівники на структуру", matches: "const\\s+Product\\s*\\*\\s*\\w+\\s*=\\s*\\w+\\s*;", hint: "Перетворіть const void * на const Product *: const Product *x = a;" },
    ],
  },
  {
    ...base, id: "c-enum-names", lesson: "c/49", xp: 25,
    title: "Світлофор: enum, switch і коло",
    context: "Стани, режими й команди в C описують через enum, а поведінку розписують у switch. Службова константа COUNT дозволяє крутити стани по колу без магічних чисел.",
    brief: [
      "Допишіть <code>light_name</code>: через <code>switch</code> поверніть назву стану (<code>червоний</code>, <code>зелений</code>, <code>жовтий</code>), а також <code>next_light</code>, що повертає наступний стан по колу за допомогою <code>LIGHT_COUNT</code>.",
      "Очікуваний вивід чотири рядки: <code>0 червоний</code>, <code>1 зелений</code>, <code>2 жовтий</code>, <code>0 червоний</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

enum Light { LIGHT_RED, LIGHT_GREEN, LIGHT_YELLOW, LIGHT_COUNT };

const char *light_name(enum Light l) {
    return "?";
}

enum Light next_light(enum Light l) {
    return l;
}

int main(void) {
    enum Light l = LIGHT_RED;
    for (int i = 0; i < LIGHT_COUNT + 1; i++) {
        printf("%d %s\n", (int)l, light_name(l));
        l = next_light(l);
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Назви станів", has: "1 зелений", hint: "У switch на кожну константу напишіть case LIGHT_…: return \"…\";" },
      { on: "stdout", name: "Коло замикається", has: "2 жовтий\n0 червоний", hint: "Після останнього стану наступним має бути перший: (l + 1) % LIGHT_COUNT." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "0 червоний\n1 зелений\n2 жовтий\n0 червоний", hint: "Чотири рядки: номер і назва стану." },
      { on: "source", name: "Використано switch за enum", matches: "switch\\s*\\(\\s*l\\s*\\)", hint: "Напишіть switch (l) і по одному case на кожну константу." },
      { on: "source", name: "Коло через LIGHT_COUNT", matches: "%\\s*LIGHT_COUNT", hint: "Остача від ділення на кількість станів: % LIGHT_COUNT." },
    ],
  },
  {
    ...base, id: "c-tagged-value", lesson: "c/50", xp: 35,
    title: "Значення з тегом: int, double чи рядок",
    context: "Тегове об'єднання це спосіб тримати значення різних видів в одному типі: токени, поля JSON, команди. Без перевірки тегу легко прочитати не той член, тому всю логіку ховають у switch.",
    brief: [
      "У заготовці є тип <code>Value</code> (тег <code>kind</code> і <code>union as</code>) та конструктори. Допишіть <code>print_value</code>, що друкує <code>int:42</code>, <code>double:2.50</code> або <code>str:hello</code>, і <code>as_number</code>: число як є, а для рядка його довжину (<code>strlen</code>).",
      "Очікуваний вивід: три рядки значень і <code>сума: 49.5</code> (42 + 2.5 + 5). Читайте лише той член, що відповідає тегу.",
    ],
    starter: raw`#include <stdio.h>
#include <string.h>

typedef enum { KIND_INT, KIND_DOUBLE, KIND_STR } Kind;

typedef struct {
    Kind kind;
    union {
        int i;
        double d;
        const char *s;
    } as;
} Value;

Value make_int(int i) {
    Value v = {.kind = KIND_INT, .as.i = i};
    return v;
}

Value make_double(double d) {
    Value v = {.kind = KIND_DOUBLE, .as.d = d};
    return v;
}

Value make_str(const char *s) {
    Value v = {.kind = KIND_STR, .as.s = s};
    return v;
}

void print_value(Value v) {
}

double as_number(Value v) {
    return 0;
}

int main(void) {
    Value list[] = {make_int(42), make_double(2.5), make_str("hello")};
    double total = 0;
    for (size_t i = 0; i < sizeof list / sizeof list[0]; i++) {
        print_value(list[i]);
        total += as_number(list[i]);
    }
    printf("сума: %.1f\n", total);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Ціле й дійсне надруковано", has: "int:42\ndouble:2.50", hint: "Для дійсного формат %.2f, для цілого %d." },
      { on: "stdout", name: "Рядок надруковано", has: "str:hello", hint: "У гілці KIND_STR друкуйте v.as.s через %s." },
      { on: "stdout", name: "Сума з довжиною рядка", has: "сума: 49.5", hint: "Для рядка в as_number поверніть (double)strlen(v.as.s)." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "int:42\ndouble:2.50\nstr:hello\nсума: 49.5", hint: "Три рядки значень і підсумок." },
      { on: "source", name: "Перемикання за тегом", matches: "switch\\s*\\(\\s*v\\.kind\\s*\\)", hint: "Обирайте член за тегом: switch (v.kind)." },
    ],
  },
  {
    ...base, id: "c-library-records", lesson: "c/51", xp: 45,
    title: "Облік книг: розбір, сортування, підсумки",
    context: "Типова C-програма розбирає текст у структури, зберігає їх у динамічному масиві, сортує та підсумовує. Тут усе разом: sscanf із перевірками, enum, qsort по полю і зміна запису через вказівник.",
    brief: [
      "Інфраструктура вже є (таблиця <code>Library</code>, enum <code>Genre</code>, розбиття тексту на рядки). Допишіть чотири функції: <code>parse_book</code> (<code>sscanf</code> із <code>%15s</code>; відхилити, якщо рік поза 1450..2100, примірників менше нуля або жанр невідомий; у <code>*out</code> писати лише після успіху), <code>cmp_book</code> (за роком, потім за <code>id</code>), <code>count_copies</code> (сума примірників жанру) і <code>lend</code> (зменшує <code>copies</code>, якщо книга є й примірники лишились, повертає 1, інакше 0).",
      "Очікується: прийнято 6, відхилено 2; книги за роком від <code>1815 emma</code> до <code>1980 cosmos</code>; примірники жанрів 3, 6, 6; видача <code>emma</code> дає 0, <code>odes</code> дає 1, id 42 дає 0; після видачі <code>poetry</code> має 5.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef enum { G_NOVEL, G_SCIENCE, G_POETRY, G_COUNT } Genre;

static const char *const GENRE_NAMES[G_COUNT] = {
    [G_NOVEL] = "novel",
    [G_SCIENCE] = "science",
    [G_POETRY] = "poetry",
};

typedef struct {
    int id;
    char title[16];
    int year;
    int copies;
    Genre genre;
} Book;

typedef struct {
    Book *data;
    size_t len;
    size_t cap;
} Library;

int parse_genre(const char *s, Genre *out) {
    for (int g = 0; g < G_COUNT; g++) {
        if (strcmp(s, GENRE_NAMES[g]) == 0) {
            *out = (Genre)g;
            return 1;
        }
    }
    return 0;
}

int library_push(Library *lib, Book b) {
    if (lib->len == lib->cap) {
        size_t cap = lib->cap == 0 ? 4 : lib->cap * 2;
        Book *bigger = realloc(lib->data, cap * sizeof *bigger);
        if (bigger == NULL) {
            return 0;
        }
        lib->data = bigger;
        lib->cap = cap;
    }
    lib->data[lib->len++] = b;
    return 1;
}

int parse_book(const char *line, Book *out) {
    return 0;
}

int cmp_book(const void *a, const void *b) {
    return 0;
}

int count_copies(const Library *lib, Genre g) {
    return 0;
}

int lend(Library *lib, int id) {
    return 0;
}

int main(void) {
    const char *text =
        "1 dune 1965 3 novel\n"
        "2 cosmos 1980 2 science\n"
        "3 kobzar 1840 5 poetry\n"
        "bad line\n"
        "4 emma 1815 0 novel\n"
        "5 atlas 1000 2 science\n"
        "6 origin 1859 4 science\n"
        "7 odes 1820 1 poetry\n";
    Library lib = {0};
    int rejected = 0;
    const char *p = text;
    while (*p != '\0') {
        const char *end = strchr(p, '\n');
        size_t n = end != NULL ? (size_t)(end - p) : strlen(p);
        char line[64];
        snprintf(line, sizeof line, "%.*s", (int)n, p);
        p += n;
        if (*p == '\n') {
            p++;
        }
        Book b;
        if (parse_book(line, &b) && library_push(&lib, b)) {
            continue;
        }
        rejected++;
    }
    printf("прийнято: %zu, відхилено: %d\n", lib.len, rejected);
    if (lib.len > 1) {
        qsort(lib.data, lib.len, sizeof *lib.data, cmp_book);
    }
    for (size_t i = 0; i < lib.len; i++) {
        printf("%d %s\n", lib.data[i].year, lib.data[i].title);
    }
    for (int g = 0; g < G_COUNT; g++) {
        printf("%s: %d\n", GENRE_NAMES[g], count_copies(&lib, (Genre)g));
    }
    printf("видати emma: %d\n", lend(&lib, 4));
    printf("видати odes: %d\n", lend(&lib, 7));
    printf("видати 42: %d\n", lend(&lib, 42));
    printf("poetry після видачі: %d\n", count_copies(&lib, G_POETRY));
    free(lib.data);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядки розібрано й відхилено правильно", has: "прийнято: 6, відхилено: 2", hint: "Відхиляйте рядок, якщо sscanf не повернув 5, рік поза 1450..2100, примірників менше нуля або жанр невідомий." },
      { on: "stdout", name: "Сортування за роком", has: "1815 emma\n1820 odes\n1840 kobzar\n1859 origin\n1965 dune\n1980 cosmos", hint: "У cmp_book порівняйте year через (x > y) - (x < y), за рівності порівняйте id." },
      { on: "stdout", name: "Підсумки за жанрами", has: "novel: 3\nscience: 6\npoetry: 6", hint: "Додавайте copies лише тих книг, у яких genre збігається з g." },
      { on: "stdout", name: "Видача книг", has: "видати emma: 0\nвидати odes: 1\nвидати 42: 0", hint: "lend знаходить книгу за id, і якщо copies > 0, зменшує його й повертає 1." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "прийнято: 6, відхилено: 2\n1815 emma\n1820 odes\n1840 kobzar\n1859 origin\n1965 dune\n1980 cosmos\nnovel: 3\nscience: 6\npoetry: 6\nвидати emma: 0\nвидати odes: 1\nвидати 42: 0\npoetry після видачі: 5", hint: "Після видачі odes у poetry лишається 5 примірників." },
      { on: "source", name: "Ширина в %s обмежує буфер", matches: "%\\d+s", hint: "Для буфера char[16] пишіть %15s у форматі sscanf." },
    ],
  },
  {
    ...base, id: "c-bitfield-stamps", lesson: "c/52", xp: 35,
    title: "Дата у шістнадцяти бітах",
    context: "Бітові поля стискають дрібні значення в одне слово: прапорці, дати, поля регістрів. Корисно знати, як вони поводяться, коли значення не влазить, і як сортувати такі записи.",
    brief: [
      "У заготовці є <code>struct Stamp</code> із полями <code>day : 5</code>, <code>month : 4</code>, <code>year : 7</code> (рік від 2000). Допишіть <code>make_stamp</code>, порівнювач <code>stamp_cmp</code> для <code>qsort</code> (рік, місяць, день) та <code>set_month</code>, що записує число в поле місяця через вказівник.",
      "Очікуються чотири дати за зростанням, потім <code>місяць після set_month(17): 1</code> (у чотирибітове поле влазить лише молодша частина) і <code>вміщається в unsigned: 1</code>.",
    ],
    starter: raw`#include <assert.h>
#include <stdio.h>
#include <stdlib.h>

struct Stamp {
    unsigned day : 5;
    unsigned month : 4;
    unsigned year : 7;
};

struct Stamp make_stamp(int year, int month, int day) {
    struct Stamp s = {0};
    return s;
}

int stamp_cmp(const void *a, const void *b) {
    return 0;
}

void set_month(struct Stamp *s, unsigned m) {
}

int main(void) {
    struct Stamp list[] = {make_stamp(2025, 11, 22), make_stamp(2024, 3, 5), make_stamp(2025, 2, 28), make_stamp(2024, 3, 1)};
    size_t n = sizeof list / sizeof list[0];
    qsort(list, n, sizeof list[0], stamp_cmp);
    for (size_t i = 0; i < n; i++) {
        printf("%d-%02d-%02d\n", 2000 + list[i].year, list[i].month, list[i].day);
    }
    set_month(&list[0], 17);
    printf("місяць після set_month(17): %d\n", list[0].month);
    printf("вміщається в unsigned: %d\n", sizeof(struct Stamp) <= sizeof(unsigned));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Дати впорядковано", has: "2024-03-01\n2024-03-05\n2025-02-28\n2025-11-22", hint: "У stamp_cmp порівняйте year, потім month, потім day, як у словнику." },
      { on: "stdout", name: "Значення зведено до ширини поля", has: "місяць після set_month(17): 1", hint: "У set_month просто запишіть s->month = m;, зайву частину біт компілятор відкине сам." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "2024-03-01\n2024-03-05\n2025-02-28\n2025-11-22\nмісяць після set_month(17): 1\nвміщається в unsigned: 1", hint: "make_stamp має записати рік як year - 2000." },
      { on: "source", name: "Запис у бітове поле через вказівник", matches: "->\\s*month\\s*=", hint: "У set_month пишіть s->month = m;" },
    ],
  },
  {
    ...base, id: "c-flex-str", lesson: "c/53", xp: 40,
    title: "Рядок із довжиною в одному блоці",
    context: "Гнучкий масив-член дає змогу зберігати довжину й дані в одному виділенні: один malloc, один free. Так влаштовано багато буферів і пакетів у C-бібліотеках.",
    brief: [
      "У заготовці є <code>Str</code> з гнучким хвостом <code>char data[]</code>. Допишіть <code>str_new</code> (копія рядка), <code>str_concat</code> (новий <code>Str</code> зі склеєних двох) і <code>str_count</code> (скільки разів зустрічається літера). Пам'ять під заголовок і хвіст беріть одним <code>malloc</code>.",
      "Очікуваний вивід: <code>flexible 8</code>, <code>літера e: 2</code>, <code>один блок: 1</code>. Звільняє пам'ять <code>main</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    size_t len;
    char data[];
} Str;

Str *str_new(const char *s) {
    return NULL;
}

Str *str_concat(const Str *a, const Str *b) {
    return NULL;
}

size_t str_count(const Str *s, char c) {
    return 0;
}

int main(void) {
    Str *a = str_new("flex");
    Str *b = str_new("ible");
    Str *c = a != NULL && b != NULL ? str_concat(a, b) : NULL;
    if (c == NULL) {
        printf("помилка\n");
    } else {
        printf("%s %zu\n", c->data, c->len);
        printf("літера e: %zu\n", str_count(c, 'e'));
        printf("один блок: %d\n", sizeof(Str) == sizeof(size_t));
    }
    free(a);
    free(b);
    free(c);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядки склеєно в новий Str", has: "flexible 8", hint: "Довжина результату a->len + b->len; скопіюйте обидва хвости, другий разом із нулем." },
      { on: "stdout", name: "Літери пораховано", has: "літера e: 2", hint: "Пройдіть s->data[i] для i від 0 до s->len і рахуйте збіги з c." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "flexible 8\nлітера e: 2\nодин блок: 1", hint: "Три рядки: склеєний текст із довжиною, кількість літер, перевірка розміру." },
      { on: "source", name: "Один malloc на заголовок і хвіст", matches: "malloc\\s*\\(\\s*sizeof", hint: "Розмір блока: sizeof *r + довжина хвоста + 1 для нуля." },
      { on: "source", name: "Копіювання через memcpy", matches: "memcpy\\s*\\(", hint: "Хвіст копіюють memcpy(r->data, ..., ...)." },
    ],
  },
];
