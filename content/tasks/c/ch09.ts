// Практичні завдання глави «Структури даних» (уроки 81–92). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_09: readonly RemoteTask[] = [
  {
    ...base, id: "c-int-vector", lesson: "c/81", xp: 35,
    title: "Вектор цілих із подвоєнням місткості",
    context: "Власний вектор потрібен там, де розмір даних невідомий заздалегідь. Подвоєння місткості й чіткий власник пам'яті відрізняють контейнер, що працює, від того, що тече й повільніє.",
    brief: [
      "Допишіть <code>vec_push</code>, <code>vec_pop</code> і <code>vec_destroy</code>. Перший <code>push</code> виділяє місце на 2 елементи, далі місткість подвоюється через <code>realloc</code> із тимчасовим вказівником. Кожне збільшення рахуйте в <code>grows</code>.",
      "Очікуваний вивід: <code>len=9 cap=16 grows=4</code>, <code>sum=285</code>, <code>pop=81 pop=64</code>, <code>len=7</code>. Програма не має витікати пам'яттю: <code>destroy</code> звільняє і <code>data</code>, і саму структуру.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
    size_t grows;
} IntVec;

IntVec *vec_create(void) {
    return calloc(1, sizeof(IntVec));
}

int vec_push(IntVec *v, int x) {
    (void)v;
    (void)x;
    return 0;
}

int vec_pop(IntVec *v, int *out) {
    (void)v;
    (void)out;
    return -1;
}

void vec_destroy(IntVec *v) {
    (void)v;
}

int main(void) {
    IntVec *v = vec_create();
    if (v == NULL) {
        return 1;
    }
    long sum = 0;
    for (int i = 1; i <= 9; i++) {
        vec_push(v, i * i);
    }
    for (size_t i = 0; i < v->len; i++) {
        sum += v->data[i];
    }
    printf("len=%zu cap=%zu grows=%zu\n", v->len, v->cap, v->grows);
    printf("sum=%ld\n", sum);
    int a = 0;
    int b = 0;
    vec_pop(v, &a);
    vec_pop(v, &b);
    printf("pop=%d pop=%d\n", a, b);
    printf("len=%zu\n", v->len);
    vec_destroy(v);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Місткість подвоюється: 2, 4, 8, 16", has: "len=9 cap=16 grows=4", hint: "Перший push дає cap 2, далі cap *= 2; кожне збільшення робить grows++." },
      { on: "stdout", name: "Елементи збережено", has: "sum=285", hint: "Після перевиділення старі елементи мають лишитися: використовуйте realloc, а не новий malloc без копіювання." },
      { on: "stdout", name: "pop віддає останні елементи", has: "pop=81 pop=64", hint: "pop читає data[len - 1] і зменшує len." },
      { on: "stdout", name: "Весь вивід", equals: "len=9 cap=16 grows=4\nsum=285\npop=81 pop=64\nlen=7", hint: "Чотири рядки: стан після push, сума, два pop, довжина." },
      { on: "source", name: "Ріст через realloc", matches: "\\brealloc\\s*\\(", hint: "Для розширення блока використайте realloc." },
      { on: "source", name: "Звільняються data і структура", matches: "free\\s*\\(\\s*\\w+\\s*->\\s*data\\s*\\)[\\s\\S]*free\\s*\\(\\s*\\w+\\s*\\)", hint: "У vec_destroy спершу free(v->data), потім free(v)." },
    ],
  },
  {
    ...base, id: "c-linked-list", lesson: "c/82", xp: 35,
    title: "Зв'язний список: вставка, розворот, знищення",
    context: "Зв'язні списки лежать у черг задач і хеш-ланцюжках. Уміння правильно перев'язати вказівники й звільнити вузли без use-after-free відрізняє робочий код від того, що падає під санітайзером.",
    brief: [
      "Допишіть <code>list_push_front</code>, <code>list_push_back</code> (є <code>tail</code>), <code>list_reverse</code> і <code>list_destroy</code>. Кожен вузол виділяється через <code>malloc</code>, <code>destroy</code> спершу зберігає <code>next</code>, потім робить <code>free</code>.",
      "Очікуваний вивід: <code>1 2 3 4 5</code>, <code>5 4 3 2 1</code>, <code>len=5 head=5 tail=1</code>. Після розвороту <code>head</code> і <code>tail</code> міняються місцями, не забудьте про це.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

typedef struct {
    Node *head;
    Node *tail;
    size_t len;
} List;

int list_push_front(List *l, int x) {
    (void)l;
    (void)x;
    return 0;
}

int list_push_back(List *l, int x) {
    (void)l;
    (void)x;
    return 0;
}

void list_reverse(List *l) {
    (void)l;
}

void list_destroy(List *l) {
    (void)l;
}

static void print(const List *l) {
    for (const Node *n = l->head; n != NULL; n = n->next) {
        printf("%d%s", n->value, n->next != NULL ? " " : "");
    }
    printf("\n");
}

int main(void) {
    List l = {NULL, NULL, 0};
    list_push_front(&l, 3);
    list_push_front(&l, 2);
    list_push_front(&l, 1);
    list_push_back(&l, 4);
    list_push_back(&l, 5);
    print(&l);
    list_reverse(&l);
    print(&l);
    printf("len=%zu head=%d tail=%d\n", l.len, l.head ? l.head->value : -1, l.tail ? l.tail->value : -1);
    list_destroy(&l);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Список після вставок", has: "1 2 3 4 5", hint: "push_front ставить вузол перед head, push_back після tail; не забудьте tail для порожнього списку." },
      { on: "stdout", name: "Список після розвороту", has: "5 4 3 2 1", hint: "Три вказівники: prev, cur, next. Перед cur->next = prev запам'ятайте старий cur->next." },
      { on: "stdout", name: "len, head і tail узгоджені", has: "len=5 head=5 tail=1", hint: "Після розвороту старий head стає tail, а старий tail стає head." },
      { on: "stdout", name: "Весь вивід", equals: "1 2 3 4 5\n5 4 3 2 1\nlen=5 head=5 tail=1", hint: "Три рядки." },
      { on: "source", name: "Вузли виділяються malloc", matches: "\\bmalloc\\s*\\(", hint: "Кожен вузол створюється через malloc(sizeof *n)." },
      { on: "source", name: "Вузли звільняються", matches: "\\bfree\\s*\\(", hint: "list_destroy має звільнити кожен вузол." },
      { on: "source", name: "destroy зберігає next перед free", matches: "next\\s*=\\s*\\w+\\s*->\\s*next\\s*;[\\s\\S]{0,80}free\\s*\\(", hint: "Спершу Node *next = n->next;, потім free(n);." },
    ],
  },
  {
    ...base, id: "c-bracket-stack", lesson: "c/83", xp: 35,
    title: "Перевірка дужок на стеку",
    context: "Стек лежить в основі розбору виразів, перевірки дужок і undo. Власний стек на malloc без витоків і без pop з порожнього це базова навичка, яку перевіряють на співбесідах.",
    brief: [
      "Допишіть стек символів (<code>stack_create</code>, <code>stack_push</code>, <code>stack_pop</code>, <code>stack_destroy</code>) на масиві з <code>malloc</code> і функцію <code>balanced</code>: для кожної закривної дужки знімайте верхню й порівнюйте з парною відкривною, в кінці стек має бути порожнім.",
      "Очікуваний вивід за рядками: <code>{[()]}   ok</code>, <code>(]       ні</code>, <code>(((      ні</code>, <code>x(y)[z]  ok</code>, <code>())      ні</code>. Дужки трьох видів: <code>()</code>, <code>[]</code>, <code>{}</code>; інші символи ігноруйте.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *items;
    size_t top;
    size_t cap;
} Stack;

Stack *stack_create(size_t cap) {
    (void)cap;
    return NULL;
}

int stack_push(Stack *s, char c) {
    (void)s;
    (void)c;
    return -1;
}

int stack_pop(Stack *s, char *out) {
    (void)s;
    (void)out;
    return -1;
}

void stack_destroy(Stack *s) {
    (void)s;
}

int balanced(const char *text) {
    (void)text;
    return 0;
}

int main(void) {
    const char *tests[] = {"{[()]}", "(]", "(((", "x(y)[z]", "())"};
    for (size_t i = 0; i < sizeof tests / sizeof tests[0]; i++) {
        printf("%-8s %s\n", tests[i], balanced(tests[i]) ? "ok" : "ні");
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Правильні рядки визнано збалансованими", has: "x(y)[z]  ok", hint: "Сторонні символи пропускаємо; на кожну закривну дужку знімаємо верх стека." },
      { on: "stdout", name: "Неправильні рядки відхилено", has: "(]       ні", hint: "Закривна дужка не збігається з відкривною на вершині." },
      { on: "stdout", name: "Незакриті й зайві дужки", has: "())      ні", hint: "Зайва закривна: pop повертає помилку. Незакрита: після циклу стек не порожній (top != 0)." },
      { on: "stdout", name: "Весь вивід", equals: "{[()]}   ok\n(]       ні\n(((      ні\nx(y)[z]  ok\n())      ні", hint: "П'ять рядків у форматі %-8s %s." },
      { on: "source", name: "Масив стека виділяється через malloc", matches: "\\bmalloc\\s*\\(", hint: "stack_create виділяє структуру й масив items через malloc." },
      { on: "source", name: "Пам'ять звільняється", matches: "free\\s*\\(\\s*\\w+\\s*->\\s*items\\s*\\)", hint: "stack_destroy спершу free(s->items), потім free(s)." },
    ],
  },
  {
    ...base, id: "c-dlist-sentinel", lesson: "c/84", xp: 40,
    title: "Двозв'язний список із вартовим",
    context: "Вставка й видалення за вказівником без обходу це суть двозв'язного списку. Вартовий прибирає особливі випадки, і саме так влаштовані списки ядра Linux і LRU-кеші.",
    brief: [
      "Допишіть <code>dl_insert_after</code> (вузол на купі, чотири присвоєння), <code>dl_remove</code> (перев'язати сусідів, <code>free</code>, <code>len--</code>) і <code>dl_destroy</code> (знімає вузли, поки <code>head.next != &amp;head</code>). <code>dl_init</code> і <code>dl_push_*</code> уже є.",
      "Очікуваний вивід: <code>вперед: 0 1 2 3</code>, <code>назад: 3 2 1 0</code>, після видалення вузла зі значенням 2 за його вказівником: <code>вперед: 0 1 3</code>, <code>назад: 3 1 0</code>, <code>len=3</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *prev;
    struct Node *next;
} Node;

typedef struct {
    Node head;
    size_t len;
} DList;

void dl_init(DList *l) {
    l->head.prev = &l->head;
    l->head.next = &l->head;
    l->len = 0;
}

Node *dl_insert_after(DList *l, Node *pos, int x) {
    (void)l;
    (void)pos;
    (void)x;
    return NULL;
}

void dl_remove(DList *l, Node *n) {
    (void)l;
    (void)n;
}

void dl_destroy(DList *l) {
    (void)l;
}

Node *dl_push_back(DList *l, int x) {
    return dl_insert_after(l, l->head.prev, x);
}

Node *dl_push_front(DList *l, int x) {
    return dl_insert_after(l, &l->head, x);
}

static void print_both(const DList *l) {
    printf("вперед:");
    for (const Node *n = l->head.next; n != &l->head; n = n->next) {
        printf(" %d", n->value);
    }
    printf("\nназад:");
    for (const Node *n = l->head.prev; n != &l->head; n = n->prev) {
        printf(" %d", n->value);
    }
    printf("\n");
}

int main(void) {
    DList l;
    dl_init(&l);
    dl_push_back(&l, 1);
    Node *two = dl_push_back(&l, 2);
    dl_push_back(&l, 3);
    dl_push_front(&l, 0);
    print_both(&l);
    dl_remove(&l, two);
    print_both(&l);
    printf("len=%zu\n", l.len);
    dl_destroy(&l);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Обхід уперед", has: "вперед: 0 1 2 3", hint: "Вставка після pos: n->next = pos->next; pos->next->prev = n; pos->next = n;." },
      { on: "stdout", name: "Обхід назад збігається з дзеркалом", has: "назад: 3 2 1 0", hint: "Не забудьте n->prev = pos і pos->next->prev = n: інакше зворотний обхід зламається." },
      { on: "stdout", name: "Видалення за вказівником", has: "вперед: 0 1 3", hint: "n->prev->next = n->next; n->next->prev = n->prev; free(n);." },
      { on: "stdout", name: "Довжина після видалення", has: "len=3", hint: "dl_remove зменшує len, dl_insert_after збільшує." },
      { on: "source", name: "Вузли виділяються malloc", matches: "\\bmalloc\\s*\\(", hint: "dl_insert_after створює вузол через malloc(sizeof *n)." },
      { on: "source", name: "Вузли звільняються", matches: "\\bfree\\s*\\(\\s*\\w+\\s*\\)", hint: "dl_remove викликає free(n)." },
      { on: "source", name: "Перев'язуються prev і next", matches: "->\\s*prev\\s*->\\s*next\\s*=", hint: "Потрібен рядок виду n->prev->next = n->next;." },
    ],
  },
  {
    ...base, id: "c-hash-table", lesson: "c/85", xp: 45,
    title: "Хеш-таблиця: підрахунок слів із ресайзом",
    context: "Лічильники частот на хеш-таблиці це щоденна робота: логи, слова, ідентифікатори. Власна таблиця з ресайзом і чітким власником пам'яті показує, чому словники швидкі й де в них ховаються витоки.",
    brief: [
      "Допишіть <code>table_grow</code> (подвоїти кошики, перерахувати індекс кожного вузла, перев'язати вузли, звільнити старий масив, <code>resizes++</code>), <code>table_add</code> (знайти ключ і додати <code>delta</code>, або створити вузол із копією ключа на початку ланцюжка; після вставки, якщо <code>len * 4 &gt; nb * 3</code>, викликати <code>table_grow</code>) і <code>table_destroy</code> (звільнити ключі, вузли, масив кошиків і таблицю).",
      "Очікуваний вивід: слова у відсортованому порядку з лічильниками (<code>black=1</code> ... <code>yellow=1</code>), далі <code>green=3 pink=-1</code> і <code>len=7 buckets=16 resizes=3</code>. Програма не має витікати пам'ять.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;
} Entry;

typedef struct {
    Entry **buckets;
    size_t nb;
    size_t len;
    size_t resizes;
} Table;

static uint32_t djb2(const char *s) {
    uint32_t h = 5381;
    for (; *s != '\0'; s++) {
        h = h * 33 + (unsigned char)*s;
    }
    return h;
}

char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != NULL) {
        memcpy(p, s, n);
    }
    return p;
}

Table *table_create(size_t nb) {
    Table *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->buckets = calloc(nb, sizeof *t->buckets);
    if (t->buckets == NULL) {
        free(t);
        return NULL;
    }
    t->nb = nb;
    t->len = 0;
    t->resizes = 0;
    return t;
}

void table_destroy(Table *t) {
    if (t == NULL) {
        return;
    }
    free(t->buckets);
    free(t);
}

static Entry *table_find(const Table *t, const char *key) {
    for (Entry *e = t->buckets[djb2(key) % t->nb]; e != NULL; e = e->next) {
        if (strcmp(e->key, key) == 0) {
            return e;
        }
    }
    return NULL;
}

int table_grow(Table *t) {
    (void)t;
    return 0;
}

int table_add(Table *t, const char *key, int delta) {
    (void)t;
    (void)key;
    (void)delta;
    return 0;
}

int table_get(const Table *t, const char *key, int fallback) {
    const Entry *e = table_find(t, key);
    return e != NULL ? e->value : fallback;
}

static int cmp_entry(const void *a, const void *b) {
    const Entry *x = *(Entry *const *)a;
    const Entry *y = *(Entry *const *)b;
    return strcmp(x->key, y->key);
}

void table_print_sorted(const Table *t) {
    Entry **all = malloc(t->len * sizeof *all);
    if (all == NULL) {
        return;
    }
    size_t n = 0;
    for (size_t i = 0; i < t->nb; i++) {
        for (Entry *e = t->buckets[i]; e != NULL; e = e->next) {
            all[n++] = e;
        }
    }
    qsort(all, n, sizeof *all, cmp_entry);
    for (size_t i = 0; i < n; i++) {
        printf("%s=%d\n", all[i]->key, all[i]->value);
    }
    free(all);
}

int main(void) {
    const char *words[] = {"red", "green", "blue", "green", "red", "green", "yellow", "black", "white", "gray"};
    Table *t = table_create(2);
    if (t == NULL) {
        return 1;
    }
    for (size_t i = 0; i < sizeof words / sizeof words[0]; i++) {
        table_add(t, words[i], 1);
    }
    table_print_sorted(t);
    printf("green=%d pink=%d\n", table_get(t, "green", -1), table_get(t, "pink", -1));
    printf("len=%zu buckets=%zu resizes=%zu\n", t->len, t->nb, t->resizes);
    table_destroy(t);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Лічильники слів і відсортований порядок", has: "black=1\nblue=1\ngray=1\ngreen=3\nred=2\nwhite=1\nyellow=1", hint: "table_add має знаходити наявний ключ і додавати delta, а не створювати дублікат; вивід уже відсортований." },
      { on: "stdout", name: "Пошук за наявним і відсутнім ключем", has: "green=3 pink=-1", hint: "Для відсутнього ключа table_get повертає запасне значення -1; дублікати ключів дали б неправильний лічильник." },
      { on: "stdout", name: "Таблиця росте за коефіцієнтом 0,75", has: "len=7 buckets=16 resizes=3", hint: "Ресайз, коли len * 4 > nb * 3: 2 -> 4 -> 8 -> 16 кошиків, три розширення; не забудьте resizes++." },
      { on: "stdout", name: "Весь вивід", equals: "black=1\nblue=1\ngray=1\ngreen=3\nred=2\nwhite=1\nyellow=1\ngreen=3 pink=-1\nlen=7 buckets=16 resizes=3", hint: "Сім рядків слів, рядок із get і рядок зі статистикою." },
      { on: "source", name: "Копія ключа звільняється", matches: "free\\s*\\(\\s*\\w+\\s*->\\s*key\\s*\\)", hint: "table_destroy має free(e->key) перед free(e): ключ належить таблиці." },
      { on: "source", name: "Ключ копіюється, а не зберігається за вказівником", matches: "dup_str\\s*\\(\\s*key\\s*\\)", hint: "У table_add збережіть e->key = dup_str(key)." },
      { on: "source", name: "Лічильник ресайзів", matches: "resizes\\s*(\\+\\+|\\+=)", hint: "У table_grow збільшуйте t->resizes." },
    ],
  },
  {
    ...base, id: "c-bst-delete", lesson: "c/86", xp: 50,
    title: "Бінарне дерево: висота, пошук і видалення",
    context: "Видалення з дерева пошуку це класична задача на три випадки й на передачу власності: помилка в ній дає витік або висячий вказівник. Висота й лічильник порівнянь показують, чому форма дерева важлива.",
    brief: [
      "Допишіть <code>bst_height</code> (0 для порожнього дерева), <code>bst_contains</code> (цикл, лічильник <code>*cmp</code> зростає на кожне порівняння) і <code>bst_delete</code> із трьома випадками: лист, один нащадок, два нащадки (спадкоємець це мінімум правого піддерева). Результат <code>bst_delete</code> повертає новий корінь піддерева. Вставку, обхід і <code>bst_destroy</code> уже написано.",
      "Очікуваний вивід: початкове дерево, <code>7:1 5:0 порівнянь=8</code>, а потім рядок після видалення кожного з ключів 1, 14, 3 і 8, з висотою дерева. Програма не має витікати пам'ять.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

Node *bst_insert(Node *root, int key) {
    if (root == NULL) {
        Node *n = malloc(sizeof *n);
        if (n == NULL) {
            return NULL;
        }
        n->key = key;
        n->left = NULL;
        n->right = NULL;
        return n;
    }
    if (key < root->key) {
        root->left = bst_insert(root->left, key);
    } else if (key > root->key) {
        root->right = bst_insert(root->right, key);
    }
    return root;
}

void bst_inorder(const Node *root) {
    if (root == NULL) {
        return;
    }
    bst_inorder(root->left);
    printf(" %d", root->key);
    bst_inorder(root->right);
}

void bst_destroy(Node *root) {
    if (root == NULL) {
        return;
    }
    bst_destroy(root->left);
    bst_destroy(root->right);
    free(root);
}

int bst_height(const Node *root) {
    (void)root;
    return 0;
}

int bst_contains(const Node *root, int key, int *cmp) {
    (void)root;
    (void)key;
    (void)cmp;
    return 0;
}

Node *bst_delete(Node *root, int key) {
    (void)key;
    return root;
}

static void show(const char *label, const Node *root) {
    printf("%-5s", label);
    bst_inorder(root);
    printf(" | висота %d\n", bst_height(root));
}

int main(void) {
    int keys[] = {8, 3, 10, 1, 6, 14, 4, 7, 13};
    Node *root = NULL;
    for (size_t i = 0; i < sizeof keys / sizeof keys[0]; i++) {
        root = bst_insert(root, keys[i]);
    }
    show("init", root);
    int cmp = 0;
    int a = bst_contains(root, 7, &cmp);
    int b = bst_contains(root, 5, &cmp);
    printf("7:%d 5:%d порівнянь=%d\n", a, b, cmp);
    int del[] = {1, 14, 3, 8};
    for (size_t i = 0; i < 4; i++) {
        root = bst_delete(root, del[i]);
        char label[16];
        snprintf(label, sizeof label, "-%d", del[i]);
        show(label, root);
    }
    bst_destroy(root);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Висота початкового дерева й обхід", has: "init  1 3 4 6 7 8 10 13 14 | висота 4", hint: "bst_height: 0 для NULL, інакше 1 плюс більша з висот піддерев." },
      { on: "stdout", name: "Пошук і лічильник порівнянь", has: "7:1 5:0 порівнянь=8", hint: "Збільшуйте *cmp на кожному вузлі, який порівнюєте з ключем: 4 порівняння для 7 і 4 для 5." },
      { on: "stdout", name: "Видалення вузла з двома нащадками", has: "-3    4 6 7 8 10 13 | висота 3", hint: "Вузол 3 має нащадків 1 (уже видалений) і 6: перевірте випадки лист, один нащадок, два нащадки; для двох беріть мінімум правого піддерева." },
      { on: "stdout", name: "Видалення кореня", has: "-8    4 6 7 10 13 | висота 3", hint: "Корінь із двома нащадками: скопіюйте мінімум правого піддерева, потім видаліть його звідти." },
      { on: "stdout", name: "Весь вивід", equals: "init  1 3 4 6 7 8 10 13 14 | висота 4\n7:1 5:0 порівнянь=8\n-1    3 4 6 7 8 10 13 14 | висота 4\n-14   3 4 6 7 8 10 13 | висота 4\n-3    4 6 7 8 10 13 | висота 3\n-8    4 6 7 10 13 | висота 3", hint: "Шість рядків: початок, пошук і чотири видалення." },
      { on: "source", name: "Вузли звільняються при видаленні", matches: "\\bfree\\s*\\(\\s*root\\s*\\)", hint: "У bst_delete викличте free(root) для випадків листа й одного нащадка." },
      { on: "source", name: "Результат видалення присвоюється назад", matches: "(left|right)\\s*=\\s*bst_delete\\s*\\(", hint: "Рекурсивний виклик присвоюйте: root->left = bst_delete(root->left, key);." },
    ],
  },
];
