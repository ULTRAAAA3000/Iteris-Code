// Практичні завдання глави «Проєкти» (уроки 107–110). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_12: readonly RemoteTask[] = [
  {
    ...base, id: "c-project-text-stats", lesson: "c/107", xp: 45,
    title: "Проєкт: аналіз тексту",
    context: "Аналіз тексту поєднує лічильники, таблицю слів у купі та сортування. У проєкті важливі детермінований порядок при рівності й чіткий власник пам'яті.",
    brief: [
      "Підсумковий проєкт: лічильники й обхід тексту вже готові, допишіть три частини. <code>table_add</code> робить копію слова малими літерами, збільшує лічильник наявного запису або додає новий (місткість росте через <code>realloc</code>, 4, 8, ...). <code>cmp_entry</code> впорядковує за лічильником спаданням, а за рівності за абеткою (<code>strcmp</code>). <code>longest</code> повертає найдовше слово, а за рівної довжини менше за абеткою.",
      "Очікуваний вивід: <code>chars=107 words=23 lines=3 unique=14</code>, <code>longest=barks</code>, далі топ-4: <code>1. fox x4</code>, <code>2. the x4</code>, <code>3. a x2</code>, <code>4. dog x2</code>. Програма не має витікати пам'яттю: <code>table_free</code> вже звільняє записи.",
    ],
    starter: raw`#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *text;
    unsigned count;
} Entry;

typedef struct {
    Entry *items;
    size_t len;
    size_t cap;
} Table;

typedef struct {
    size_t chars;
    size_t words;
    size_t lines;
} Stats;

static const char *TEXT =
    "The quick brown fox jumps over the lazy dog.\n"
    "The dog barks; the fox runs away.\n"
    "A quick fox is a happy fox!\n";

static int table_add(Table *t, const char *s, size_t n) {
    (void)t;
    (void)s;
    (void)n;
    return 0;
}

static int cmp_entry(const void *a, const void *b) {
    (void)a;
    (void)b;
    return 0;
}

static const char *longest(const Table *t) {
    (void)t;
    return "";
}

static void table_free(Table *t) {
    for (size_t i = 0; i < t->len; i++) {
        free(t->items[i].text);
    }
    free(t->items);
    t->items = NULL;
    t->len = 0;
    t->cap = 0;
}

static Stats analyze(const char *s, Table *t) {
    Stats st = {0, 0, 0};
    char last = '\n';
    const char *start = NULL;
    for (const char *p = s;; p++) {
        int letter = isalpha((unsigned char)*p) != 0;
        if (letter && start == NULL) {
            start = p;
        }
        if (!letter && start != NULL) {
            st.words++;
            table_add(t, start, (size_t)(p - start));
            start = NULL;
        }
        if (*p == '\0') {
            break;
        }
        st.chars++;
        if (*p == '\n') {
            st.lines++;
        }
        last = *p;
    }
    if (last != '\n') {
        st.lines++;
    }
    return st;
}

int main(void) {
    Table t = {NULL, 0, 0};
    Stats st = analyze(TEXT, &t);
    printf("chars=%zu words=%zu lines=%zu unique=%zu\n", st.chars, st.words, st.lines, t.len);
    printf("longest=%s\n", longest(&t));
    qsort(t.items, t.len, sizeof(Entry), cmp_entry);
    for (size_t i = 0; i < 4 && i < t.len; i++) {
        printf("%zu. %s x%u\n", i + 1, t.items[i].text, t.items[i].count);
    }
    table_free(&t);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Статистика й унікальні слова", has: "chars=107 words=23 lines=3 unique=14", hint: "Слова різного регістру («The», «the») мають зливатися в один запис: копію переводьте в нижній регістр перед пошуком." },
      { on: "stdout", name: "Найдовше слово з правилом рівності", has: "longest=barks", hint: "П'ять слів мають довжину 5; серед них виграє менше за strcmp." },
      { on: "stdout", name: "Топ-4 з детермінованим порядком", has: "1. fox x4\n2. the x4\n3. a x2\n4. dog x2", hint: "Спершу count за спаданням, за рівності strcmp слів. Порівнюйте через > і <, не відніманням." },
      { on: "stdout", name: "Весь вивід", equals: "chars=107 words=23 lines=3 unique=14\nlongest=barks\n1. fox x4\n2. the x4\n3. a x2\n4. dog x2", hint: "Шість рядків: статистика, найдовше, чотири позиції топу." },
      { on: "source", name: "Сортування через qsort", matches: "\\bqsort\\s*\\(", hint: "Відсортуйте таблицю qsort-ом із cmp_entry." },
      { on: "source", name: "Ріст масиву через realloc", matches: "\\brealloc\\s*\\(", hint: "Місткість таблиці розширюйте realloc із тимчасовим вказівником." },
    ],
  },
  {
    ...base, id: "c-project-calculator", lesson: "c/108", xp: 50,
    title: "Проєкт: калькулятор виразів",
    context: "Калькулятор виразів поєднує токенізатор, рекурсивний спуск і коди помилок. Будь-який ввід має давати число або код, а не невизначену поведінку чи аварію.",
    brief: [
      "Токенізатор, <code>calc</code> і тести готові. Допишіть граматику: <code>factor</code> (число, унарний мінус, вираз у дужках), <code>term</code> (<code>*</code> і <code>/</code>) та <code>expr</code> (<code>+</code> і <code>-</code>), усі ліво-асоціативні. Помилки йдуть через <code>fail</code>: ділення на нуль це <code>ERR_DIV0</code>, нерівні дужки <code>ERR_PAREN</code>, зайвий токен чи порожній вираз <code>ERR_SYNTAX</code>.",
      "Захистіть програму: результат після <code>*</code>, <code>+</code>, <code>-</code> проходить через <code>checked</code>, а вкладеність обмежте лічильником <code>p-&gt;depth</code> і <code>MAX_DEPTH</code> (<code>ERR_DEPTH</code>). Очікується, що <code>1+2*3</code> дає 7, <code>-7/2</code> дає -3, <code>8-2-3</code> дає 3, а 60 вкладених дужок завершуються помилкою <code>DEPTH</code>.",
    ],
    starter: raw`#include <ctype.h>
#include <stdio.h>
#include <string.h>

#define LIMIT 1000000000LL
#define MAX_DEPTH 50

typedef enum { OK, ERR_SYNTAX, ERR_DIV0, ERR_PAREN, ERR_CHAR, ERR_RANGE, ERR_DEPTH } Err;
typedef enum { T_NUM, T_PLUS, T_MINUS, T_STAR, T_SLASH, T_LP, T_RP, T_END } Tok;

typedef struct {
    const char *s;
    Tok tok;
    long long num;
    int depth;
    Err err;
} Parser;

static const char *ERR_NAMES[] = {"OK", "SYNTAX", "DIV0", "PAREN", "CHAR", "RANGE", "DEPTH"};

static void fail(Parser *p, Err e) {
    if (p->err == OK) {
        p->err = e;
    }
    p->tok = T_END;
}

static void next(Parser *p) {
    while (*p->s == ' ') {
        p->s++;
    }
    char c = *p->s;
    if (c == '\0') {
        p->tok = T_END;
        return;
    }
    if (isdigit((unsigned char)c)) {
        long long v = 0;
        while (isdigit((unsigned char)*p->s)) {
            v = v * 10 + (*p->s - '0');
            if (v > LIMIT) {
                fail(p, ERR_RANGE);
                return;
            }
            p->s++;
        }
        p->tok = T_NUM;
        p->num = v;
        return;
    }
    p->s++;
    switch (c) {
    case '+': p->tok = T_PLUS; break;
    case '-': p->tok = T_MINUS; break;
    case '*': p->tok = T_STAR; break;
    case '/': p->tok = T_SLASH; break;
    case '(': p->tok = T_LP; break;
    case ')': p->tok = T_RP; break;
    default: fail(p, ERR_CHAR);
    }
}

static long long checked(Parser *p, long long v) {
    if (v > LIMIT || v < -LIMIT) {
        fail(p, ERR_RANGE);
        return 0;
    }
    return v;
}

static long long expr(Parser *p);

static long long factor(Parser *p) {
    (void)p;
    return 0;
}

static long long term(Parser *p) {
    (void)p;
    return 0;
}

static long long expr(Parser *p) {
    (void)p;
    return 0;
}

static Err calc(const char *s, long long *out) {
    Parser p = {s, T_END, 0, 0, OK};
    next(&p);
    long long v = expr(&p);
    if (p.err == OK && p.tok != T_END) {
        fail(&p, p.tok == T_RP ? ERR_PAREN : ERR_SYNTAX);
    }
    if (p.err == OK) {
        *out = v;
    }
    return p.err;
}

static void show(const char *s) {
    long long v = 0;
    Err e = calc(s, &v);
    if (e == OK) {
        printf("[%s] = %lld\n", s, v);
    } else {
        printf("[%s] error %s (%d)\n", s, ERR_NAMES[e], (int)e);
    }
}

int main(void) {
    const char *tests[] = {"1+2*3", "(1+2)*3", "-(4-6)*2", "10/3", "-7/2", "8-2-3", "--5", "2*-3",
                           "7/(3-3)", "(1+2", "1+2)", "2 * x", "1+", "", "1 2", "100000*100000", "99999999999"};
    for (size_t i = 0; i < sizeof tests / sizeof tests[0]; i++) {
        show(tests[i]);
    }
    char deep[160];
    memset(deep, '(', 60);
    deep[60] = '1';
    memset(deep + 61, ')', 60);
    deep[121] = '\0';
    long long v = 0;
    Err e = calc(deep, &v);
    printf("deep error %s (%d)\n", ERR_NAMES[e], (int)e);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Пріоритет, дужки й унарний мінус", has: "[1+2*3] = 7\n[(1+2)*3] = 9\n[-(4-6)*2] = 4", hint: "term викликає factor, expr викликає term: так * і / виявляються старшими за + і -." },
      { on: "stdout", name: "Ділення й ліва асоціативність", has: "[10/3] = 3\n[-7/2] = -3\n[8-2-3] = 3\n[--5] = 5\n[2*-3] = -6", hint: "Додавання й віднімання робіть циклом while у expr, а не рекурсією вправо." },
      { on: "stdout", name: "Коди помилок", has: "[7/(3-3)] error DIV0 (2)\n[(1+2] error PAREN (3)\n[1+2)] error PAREN (3)\n[2 * x] error CHAR (4)\n[1+] error SYNTAX (1)", hint: "Дільник перевіряйте до ділення; у factor після expr очікуйте T_RP, інакше fail(p, ERR_PAREN)." },
      { on: "stdout", name: "Діапазон і глибина", has: "[100000*100000] error RANGE (5)\n[99999999999] error RANGE (5)\ndeep error DEPTH (6)", hint: "Результат множення пропустіть через checked; на вході factor збільшуйте p->depth і порівнюйте з MAX_DEPTH." },
      { on: "stdout", name: "Порожній і двозначний вираз", has: "[] error SYNTAX (1)\n[1 2] error SYNTAX (1)", hint: "Порожній вираз: factor бачить T_END. Залишок після expr: calc сам повідомляє про синтаксис." },
      { on: "source", name: "Лічильник глибини", matches: "->\\s*depth\\s*(\\+\\+|--|>|\\+=)|(\\+\\+|--)\\s*\\w+\\s*->\\s*depth", hint: "Збільшуйте p->depth на вході в factor і зменшуйте на виході." },
    ],
  },
  {
    ...base, id: "c-project-arena", lesson: "c/109", xp: 55,
    title: "Проєкт: арена-аллокатор",
    context: "Арена видає пам'ять зсувом лічильника й звільняє її оптом. У проєкті вирівнювання, вичерпання й порівняння з malloc лічильниками показують, чому арена прискорює дерева.",
    brief: [
      "Заготовка містить <code>arena_create</code>, обгортки <code>counted_malloc</code> і <code>counted_free</code>, звичайне дерево та <code>main</code>. Допишіть чотири частини. <code>arena_alloc(a, size, align)</code>: <code>NULL</code> для некоректного вирівнювання (не степінь двійки) і для браку місця (без переповнення <code>size_t</code>), інакше відступ за адресою, видача й <code>used</code>, <code>count</code>. <code>arena_reset</code> скидає обидва лічильники. <code>arena_destroy</code> звільняє блок і структуру через <code>counted_free</code>. <code>tree_insert</code> бере вузли з арени й повертає 1 (додано), 0 (дублікат), -1 (немає місця).",
      "Очікується: зсуви <code>0 4 8</code>, <code>used=16 count=3</code>, відмови для <code>1000</code> байтів і вирівнювання 3, скидання до нуля, дерево з 15 вузлів у арені точно за розміром (<code>full=yes</code>), 16-та вставка дає -1, а лічильники показують 2 виклики <code>malloc</code> проти 15.",
    ],
    starter: raw`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    unsigned char *base;
    size_t cap;
    size_t used;
    size_t count;
} Arena;

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

static size_t g_malloc = 0;
static size_t g_free = 0;

static void *counted_malloc(size_t n) {
    g_malloc++;
    return malloc(n);
}

static void counted_free(void *p) {
    g_free++;
    free(p);
}

static Arena *arena_create(size_t cap) {
    Arena *a = counted_malloc(sizeof *a);
    if (a == NULL) {
        return NULL;
    }
    a->base = counted_malloc(cap);
    if (a->base == NULL) {
        counted_free(a);
        return NULL;
    }
    a->cap = cap;
    a->used = 0;
    a->count = 0;
    return a;
}

static void *arena_alloc(Arena *a, size_t size, size_t align) {
    (void)a;
    (void)size;
    (void)align;
    return NULL;
}

static void arena_reset(Arena *a) {
    (void)a;
}

static void arena_destroy(Arena *a) {
    (void)a;
}

static int tree_insert(Arena *a, Node **root, int key) {
    (void)a;
    (void)root;
    (void)key;
    return -1;
}

static int plain_insert(Node **root, int key) {
    Node **link = root;
    while (*link != NULL) {
        if (key == (*link)->key) {
            return 0;
        }
        link = key < (*link)->key ? &(*link)->left : &(*link)->right;
    }
    Node *n = counted_malloc(sizeof *n);
    if (n == NULL) {
        return -1;
    }
    n->key = key;
    n->left = NULL;
    n->right = NULL;
    *link = n;
    return 1;
}

static void plain_free(Node *n) {
    if (n == NULL) {
        return;
    }
    plain_free(n->left);
    plain_free(n->right);
    counted_free(n);
}

static int height(const Node *n) {
    if (n == NULL) {
        return 0;
    }
    int l = height(n->left);
    int r = height(n->right);
    return 1 + (l > r ? l : r);
}

static void inorder(const Node *n) {
    if (n == NULL) {
        return;
    }
    inorder(n->left);
    printf("%d ", n->key);
    inorder(n->right);
}

static long off(const Arena *a, const void *p) {
    return p == NULL ? -1 : (long)((const unsigned char *)p - a->base);
}

int main(void) {
    Arena *a = arena_create(256);
    char *c = arena_alloc(a, 1, 1);
    int *i = arena_alloc(a, sizeof(int), _Alignof(int));
    double *d = arena_alloc(a, sizeof(double), _Alignof(double));
    printf("offsets: %ld %ld %ld used=%zu count=%zu\n", off(a, c), off(a, i), off(a, d), a->used, a->count);
    printf("big: %s\n", arena_alloc(a, 1000, 1) == NULL ? "NULL" : "ok");
    printf("bad align: %s\n", arena_alloc(a, 8, 3) == NULL ? "NULL" : "ok");
    arena_reset(a);
    printf("after reset: used=%zu count=%zu\n", a->used, a->count);
    arena_destroy(a);

    int keys[] = {8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15};
    size_t n = sizeof keys / sizeof keys[0];
    g_malloc = 0;
    g_free = 0;
    Arena *ta = arena_create(n * sizeof(Node));
    Node *root = NULL;
    for (size_t k = 0; k < n; k++) {
        tree_insert(ta, &root, keys[k]);
    }
    printf("inorder: ");
    inorder(root);
    printf("\nheight=%d nodes=%zu full=%s\n", height(root), ta->count, ta->used == ta->cap ? "yes" : "no");
    printf("16th insert: %d\n", tree_insert(ta, &root, 16));
    printf("duplicate: %d\n", tree_insert(ta, &root, 8));
    arena_destroy(ta);
    printf("arena: malloc=%zu free=%zu\n", g_malloc, g_free);

    g_malloc = 0;
    g_free = 0;
    Node *plain = NULL;
    for (size_t k = 0; k < n; k++) {
        plain_insert(&plain, keys[k]);
    }
    plain_free(plain);
    printf("plain: malloc=%zu free=%zu\n", g_malloc, g_free);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вирівнювання й облік", has: "offsets: 0 4 8 used=16 count=3", hint: "pad = (align - (addr & (align - 1))) & (align - 1), де addr = (uintptr_t)(base + used)." },
      { on: "stdout", name: "Вичерпання й некоректне вирівнювання", has: "big: NULL\nbad align: NULL", hint: "Перевіряйте align != 0 і (align & (align - 1)) == 0, а місце: size > cap - used - pad." },
      { on: "stdout", name: "reset обнуляє лічильники", has: "after reset: used=0 count=0", hint: "arena_reset лише ставить used = 0 і count = 0; пам'ять не звільняється." },
      { on: "stdout", name: "Дерево в арені точно за розміром", has: "inorder: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15\nheight=4 nodes=15 full=yes\n16th insert: -1\nduplicate: 0", hint: "tree_insert: ідіть по link, дублікат повертає 0, вузол беріть через arena_alloc(a, sizeof *n, _Alignof(Node))." },
      { on: "stdout", name: "Лічильники арени проти malloc", has: "arena: malloc=2 free=2\nplain: malloc=15 free=15", hint: "arena_destroy має викликати counted_free двічі: для base і для самої структури." },
      { on: "source", name: "Адреса через uintptr_t", matches: "uintptr_t", hint: "Для вирівнювання беріть справжню адресу, приведену до uintptr_t." },
    ],
  },
  {
    ...base, id: "c-project-vm", lesson: "c/110", xp: 60,
    title: "Проєкт: віртуальна машина",
    context: "Стекова віртуальна машина виконує байткод із перевірками меж, переповнення, кроків і глибини викликів. Факторіал, що виконують ітерацією й рекурсією, показує, як працюють переходи, виклики й стек повернень.",
    brief: [
      "Асемблер, таблиці опкодів і <code>main</code> готові; у <code>vm_run</code> реалізовано <code>HALT</code>, <code>PUSH</code>, <code>POP</code>, <code>DUP</code> і <code>PRINT</code>. Допишіть решту опкодів. <code>ADD</code>, <code>SUB</code>, <code>MUL</code>: зніміть два операнди (перший вниз), порахуйте в <code>int64_t</code> і передайте в <code>push</code>, який видає <code>VM_OVERFLOW</code>. <code>LOAD</code> і <code>STORE</code>: перевірте індекс (<code>VM_BAD_ADDR</code>). <code>JMP</code>, <code>JZ</code> (перехід, якщо знято нуль), <code>CALL</code> (адреса повернення в <code>calls</code>, <code>VM_CALL_OVER</code> при переповненні), <code>RET</code> (порожній стек повернень це <code>VM_BAD_ADDR</code>).",
      "Очікується: ітеративний факторіал 5 друкує 120, рекурсивний 10 друкує 3628800, 13! дає <code>OVERFLOW</code>, порожній стек <code>STACK_UNDER</code>, нескінченний цикл <code>STEPS</code>, нескінченна рекурсія <code>CALL_OVER</code>, а помилки асемблера виводяться їхніми кодами.",
    ],
    starter: raw`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define CODE_MAX 128
#define STACK_MAX 32
#define CALL_MAX 16
#define MEM_SIZE 8
#define MAX_STEPS 10000
#define LABEL_MAX 16

typedef enum {
    OP_HALT, OP_PUSH, OP_POP, OP_DUP, OP_ADD, OP_SUB, OP_MUL,
    OP_LOAD, OP_STORE, OP_JMP, OP_JZ, OP_CALL, OP_RET, OP_PRINT, OP_COUNT
} Op;

static const char *OP_NAMES[OP_COUNT] = {
    "HALT", "PUSH", "POP", "DUP", "ADD", "SUB", "MUL",
    "LOAD", "STORE", "JMP", "JZ", "CALL", "RET", "PRINT"
};

static const int OP_ARG[OP_COUNT] = {0, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 0, 0};

typedef enum { ASM_OK, ASM_BAD_MNEMONIC, ASM_BAD_ARG, ASM_BAD_LABEL, ASM_TOO_LONG } AsmErr;
typedef enum { VM_OK, VM_STACK_OVER, VM_STACK_UNDER, VM_BAD_OP, VM_BAD_ADDR, VM_CALL_OVER, VM_OVERFLOW, VM_STEPS } VmErr;

static const char *ASM_NAMES[] = {"OK", "BAD_MNEMONIC", "BAD_ARG", "BAD_LABEL", "TOO_LONG"};
static const char *VM_NAMES[] = {"OK", "STACK_OVER", "STACK_UNDER", "BAD_OP", "BAD_ADDR", "CALL_OVER", "OVERFLOW", "STEPS"};

typedef struct {
    int32_t code[CODE_MAX];
    size_t len;
} Program;

typedef struct {
    char name[16];
    size_t addr;
} Label;

static int find_op(const char *w) {
    for (int i = 0; i < OP_COUNT; i++) {
        if (strcmp(OP_NAMES[i], w) == 0) {
            return i;
        }
    }
    return -1;
}

static int find_label(const Label *l, size_t n, const char *w, size_t *addr) {
    for (size_t i = 0; i < n; i++) {
        if (strcmp(l[i].name, w) == 0) {
            *addr = l[i].addr;
            return 1;
        }
    }
    return 0;
}

static AsmErr assemble(const char *src, Program *out) {
    Label labels[LABEL_MAX];
    size_t nl = 0;
    for (int pass = 0; pass < 2; pass++) {
        out->len = 0;
        const char *p = src;
        while (*p != '\0') {
            const char *eol = strchr(p, '\n');
            size_t n = eol != NULL ? (size_t)(eol - p) : strlen(p);
            char line[64];
            if (n >= sizeof line) {
                return ASM_TOO_LONG;
            }
            memcpy(line, p, n);
            line[n] = '\0';
            p += n + (eol != NULL ? 1 : 0);
            char *semi = strchr(line, ';');
            if (semi != NULL) {
                *semi = '\0';
            }
            char w1[16], w2[32], w3[32];
            int cnt = sscanf(line, "%15s %31s %31s", w1, w2, w3);
            if (cnt <= 0) {
                continue;
            }
            size_t l1 = strlen(w1);
            if (w1[l1 - 1] == ':') {
                if (cnt != 1) {
                    return ASM_BAD_ARG;
                }
                w1[l1 - 1] = '\0';
                if (pass == 0) {
                    if (nl == LABEL_MAX) {
                        return ASM_TOO_LONG;
                    }
                    snprintf(labels[nl].name, sizeof labels[nl].name, "%s", w1);
                    labels[nl].addr = out->len;
                    nl++;
                }
                continue;
            }
            int op = find_op(w1);
            if (op < 0) {
                return ASM_BAD_MNEMONIC;
            }
            if (cnt != 1 + (OP_ARG[op] != 0)) {
                return ASM_BAD_ARG;
            }
            if (out->len + 1 + (OP_ARG[op] != 0) > CODE_MAX) {
                return ASM_TOO_LONG;
            }
            out->code[out->len++] = op;
            if (OP_ARG[op] == 1) {
                char *end;
                long v = strtol(w2, &end, 10);
                if (*end != '\0' || v < -1000000 || v > 1000000) {
                    return ASM_BAD_ARG;
                }
                out->code[out->len++] = (int32_t)v;
            } else if (OP_ARG[op] == 2) {
                size_t addr = 0;
                if (pass == 1 && !find_label(labels, nl, w2, &addr)) {
                    return ASM_BAD_LABEL;
                }
                out->code[out->len++] = (int32_t)addr;
            }
        }
    }
    return ASM_OK;
}

typedef struct {
    int32_t stack[STACK_MAX];
    size_t sp;
    size_t calls[CALL_MAX];
    size_t cp;
    int32_t mem[MEM_SIZE];
    size_t pc;
} Vm;

static VmErr push(Vm *vm, int64_t v) {
    if (v > INT32_MAX || v < INT32_MIN) {
        return VM_OVERFLOW;
    }
    if (vm->sp >= STACK_MAX) {
        return VM_STACK_OVER;
    }
    vm->stack[vm->sp++] = (int32_t)v;
    return VM_OK;
}

static VmErr pop(Vm *vm, int32_t *v) {
    if (vm->sp == 0) {
        return VM_STACK_UNDER;
    }
    *v = vm->stack[--vm->sp];
    return VM_OK;
}

static VmErr vm_run(const Program *prog) {
    Vm vm;
    memset(&vm, 0, sizeof vm);
    for (long steps = 0; steps < MAX_STEPS; steps++) {
        if (vm.pc >= prog->len) {
            return VM_BAD_ADDR;
        }
        int op = prog->code[vm.pc++];
        int32_t arg = 0;
        if (op >= 0 && op < OP_COUNT && OP_ARG[op] != 0) {
            if (vm.pc >= prog->len) {
                return VM_BAD_ADDR;
            }
            arg = prog->code[vm.pc++];
        }
        VmErr e = VM_OK;
        int32_t a, b;
        switch (op) {
        case OP_HALT:
            return VM_OK;
        case OP_PUSH:
            e = push(&vm, arg);
            break;
        case OP_POP:
            e = pop(&vm, &a);
            break;
        case OP_DUP:
            if (vm.sp == 0) {
                e = VM_STACK_UNDER;
            } else {
                e = push(&vm, vm.stack[vm.sp - 1]);
            }
            break;
        case OP_ADD:
        case OP_SUB:
        case OP_MUL:
        case OP_LOAD:
        case OP_STORE:
        case OP_JMP:
        case OP_JZ:
        case OP_CALL:
        case OP_RET:
            return VM_BAD_OP;
        case OP_PRINT:
            e = pop(&vm, &a);
            if (e == VM_OK) {
                printf("%d\n", a);
            }
            break;
        default:
            return VM_BAD_OP;
        }
        if (e != VM_OK) {
            return e;
        }
    }
    return VM_STEPS;
}

static void run_text(const char *name, const char *src) {
    Program prog;
    AsmErr ae = assemble(src, &prog);
    if (ae != ASM_OK) {
        printf("%s: asm error %s\n", name, ASM_NAMES[ae]);
        return;
    }
    VmErr ve = vm_run(&prog);
    printf("%s: %s (code=%zu)\n", name, VM_NAMES[ve], prog.len);
}

int main(void) {
    run_text("iter", "PUSH 5\nSTORE 0\nPUSH 1\nSTORE 1\nloop:\nLOAD 0\nJZ end\nLOAD 1\nLOAD 0\nMUL\nSTORE 1\nLOAD 0\nPUSH 1\nSUB\nSTORE 0\nJMP loop\nend:\nLOAD 1\nPRINT\nHALT\n");
    run_text("rec10", "PUSH 10\nCALL fact\nPRINT\nHALT\nfact:\nDUP\nJZ base\nDUP\nPUSH 1\nSUB\nCALL fact\nMUL\nRET\nbase:\nPOP\nPUSH 1\nRET\n");
    run_text("rec13", "PUSH 13\nCALL fact\nPRINT\nHALT\nfact:\nDUP\nJZ base\nDUP\nPUSH 1\nSUB\nCALL fact\nMUL\nRET\nbase:\nPOP\nPUSH 1\nRET\n");
    run_text("under", "ADD\nHALT\n");
    run_text("loop", "top:\nJMP top\n");
    run_text("deep", "f:\nCALL f\n");
    run_text("nolabel", "JMP nowhere\n");
    run_text("badop", "FOO 1\n");
    run_text("badarg", "PUSH x\n");
    run_text("noarg", "PUSH\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Ітеративний факторіал", has: "120\niter: OK (code=32)", hint: "LOAD/STORE працюють з mem[arg]; JZ знімає значення зі стека й стрибає, якщо воно нуль; JMP стрибає завжди." },
      { on: "stdout", name: "Рекурсивний факторіал через CALL і RET", has: "3628800\nrec10: OK (code=21)", hint: "CALL кладе vm.pc (уже за аргументом) у vm.calls, а RET бере її назад." },
      { on: "stdout", name: "Переповнення й порожній стек", has: "rec13: OVERFLOW (code=21)\nunder: STACK_UNDER (code=2)", hint: "Для ADD/SUB/MUL спершу pop(b), потім pop(a); результат (int64_t) передайте в push: він перевіряє діапазон." },
      { on: "stdout", name: "Ліміти кроків і викликів", has: "loop: STEPS (code=2)\ndeep: CALL_OVER (code=2)", hint: "Перед записом у calls перевірте vm.cp >= CALL_MAX і поверніть VM_CALL_OVER." },
      { on: "stdout", name: "Помилки асемблера", has: "nolabel: asm error BAD_LABEL\nbadop: asm error BAD_MNEMONIC\nbadarg: asm error BAD_ARG\nnoarg: asm error BAD_ARG", hint: "Асемблер уже готовий; ці рядки з'являються, коли решта програми виконується правильно." },
      { on: "source", name: "Арифметика в int64_t", matches: "\\(int64_t\\)", hint: "Приведіть операнд до int64_t перед дією: (int64_t)a * b." },
    ],
  },
];
