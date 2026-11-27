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
  {
    ...base, id: "c-min-heap", lesson: "c/87", xp: 45,
    title: "Мін-купа: вставка й виймання",
    context: "Купа лежить у основі пріоритетних черг планувальників і алгоритму Дейкстри. Написати sift up і sift down самому означає зрозуміти, чому обидві операції O(log n).",
    brief: [
      "Допишіть <code>heap_push</code> (за потреби <code>realloc</code> із місткістю 4, потім ×2; новий елемент у кінець і підйом, поки батько більший) і <code>heap_pop</code> (віддати корінь через <code>*out</code>, поставити на його місце останній елемент і опустити; на порожній купі повернути -1). Батько вузла <code>i</code> це <code>(i - 1) / 2</code>.",
      "Очікуваний вивід: масив купи <code>1 3 2 4 8 7 6 9 5</code>, <code>len=9 cap=16</code>, виймання за зростанням і <code>pop з порожньої: -1</code>. Програма не має витікати пам'ять.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
} Heap;

Heap *heap_create(void) {
    return calloc(1, sizeof(Heap));
}

void heap_destroy(Heap *h) {
    if (h == NULL) {
        return;
    }
    free(h->data);
    free(h);
}

void swap_int(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int heap_push(Heap *h, int x) {
    (void)h;
    (void)x;
    return 0;
}

int heap_pop(Heap *h, int *out) {
    (void)h;
    (void)out;
    return -1;
}

int main(void) {
    int in[] = {9, 4, 7, 1, 8, 2, 6, 3, 5};
    Heap *h = heap_create();
    if (h == NULL) {
        return 1;
    }
    for (size_t i = 0; i < sizeof in / sizeof in[0]; i++) {
        heap_push(h, in[i]);
    }
    printf("масив купи:");
    for (size_t i = 0; i < h->len; i++) {
        printf(" %d", h->data[i]);
    }
    printf("\nlen=%zu cap=%zu\n", h->len, h->cap);
    printf("по черзі:");
    int x;
    while (heap_pop(h, &x) == 0) {
        printf(" %d", x);
    }
    printf("\nlen=%zu\n", h->len);
    printf("pop з порожньої: %d\n", heap_pop(h, &x));
    heap_destroy(h);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Масив купи після вставок", has: "масив купи: 1 3 2 4 8 7 6 9 5", hint: "Після вставки елемент піднімається: while (i > 0), міняємо з батьком (i - 1) / 2, поки батько більший." },
      { on: "stdout", name: "Місткість зросла подвоєнням", has: "len=9 cap=16", hint: "Місткість 4, потім 8 і 16: realloc із подвоєнням, коли len == cap." },
      { on: "stdout", name: "Виймання за зростанням", has: "по черзі: 1 2 3 4 5 6 7 8 9", hint: "Після виймання корінь замінює останній елемент, який опускається до меншого з дітей." },
      { on: "stdout", name: "Виймання з порожньої купи", has: "pop з порожньої: -1", hint: "heap_pop повертає -1, якщо len == 0, і нічого не змінює." },
      { on: "stdout", name: "Весь вивід", equals: "масив купи: 1 3 2 4 8 7 6 9 5\nlen=9 cap=16\nпо черзі: 1 2 3 4 5 6 7 8 9\nlen=0\npop з порожньої: -1", hint: "П'ять рядків: масив і len/cap, порядок виймання, len, повідомлення про порожню купу." },
      { on: "source", name: "Місткість зростає через realloc", matches: "\\brealloc\\s*\\(", hint: "У heap_push при len == cap викличте realloc з новою місткістю." },
      { on: "source", name: "Індекс батька (i - 1) / 2", matches: "\\(\\s*\\w+\\s*-\\s*1\\s*\\)\\s*/\\s*2", hint: "Батько вузла i це (i - 1) / 2; діти 2 * i + 1 і 2 * i + 2." },
    ],
  },
  {
    ...base, id: "c-graph-bfs", lesson: "c/88", xp: 50,
    title: "Обхід графа в ширину",
    context: "BFS знаходить найкоротші шляхи за кількістю ребер, тож лежить в основі пошуку маршрутів, соцмереж і краулерів. Тут ви напишете його на списках суміжності з власною чергою.",
    brief: [
      "Допишіть <code>bfs</code>: заповніть <code>dist</code> значеннями -1, стартовій вершині поставте 0, використайте <code>order</code> і як чергу, і як журнал обходу (індекси <code>head</code> і <code>tail</code>). Вершину позначайте при постановці в чергу. Поверніть кількість досяжних вершин. Створення графа та <code>graph_destroy</code> уже є.",
      "Очікуваний вивід: <code>досяжних вершин: 6</code>, порядок обходу <code>0 2 1 3 4 7</code> і відстані до всіх дев'яти вершин (недосяжні мають -1). Програма не має витікати пам'ять.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Edge {
    int to;
    struct Edge *next;
} Edge;

typedef struct {
    int n;
    Edge **adj;
    size_t edges;
} Graph;

Graph *graph_create(int n) {
    Graph *g = malloc(sizeof *g);
    if (g == NULL) {
        return NULL;
    }
    g->adj = calloc((size_t)n, sizeof *g->adj);
    if (g->adj == NULL) {
        free(g);
        return NULL;
    }
    g->n = n;
    g->edges = 0;
    return g;
}

void graph_destroy(Graph *g) {
    if (g == NULL) {
        return;
    }
    for (int v = 0; v < g->n; v++) {
        Edge *e = g->adj[v];
        while (e != NULL) {
            Edge *next = e->next;
            free(e);
            e = next;
        }
    }
    free(g->adj);
    free(g);
}

static int add_arc(Graph *g, int from, int to) {
    Edge *e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->to = to;
    e->next = g->adj[from];
    g->adj[from] = e;
    g->edges++;
    return 0;
}

int graph_add_edge(Graph *g, int a, int b) {
    if (add_arc(g, a, b) != 0) {
        return -1;
    }
    return add_arc(g, b, a);
}

int bfs(const Graph *g, int src, int *dist, int *order) {
    for (int v = 0; v < g->n; v++) {
        dist[v] = -1;
    }
    (void)src;
    (void)order;
    return 0;
}

static const int PAIRS[][2] = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}, {5, 6}, {4, 7}};

int main(void) {
    Graph *g = graph_create(9);
    int dist[9];
    int order[9];
    if (g == NULL) {
        return 1;
    }
    for (size_t i = 0; i < sizeof PAIRS / sizeof PAIRS[0]; i++) {
        graph_add_edge(g, PAIRS[i][0], PAIRS[i][1]);
    }
    int seen = bfs(g, 0, dist, order);
    printf("досяжних вершин: %d\n", seen);
    printf("порядок обходу:");
    for (int i = 0; i < seen; i++) {
        printf(" %d", order[i]);
    }
    printf("\n");
    for (int v = 0; v < g->n; v++) {
        printf("відстань до %d: %d\n", v, dist[v]);
    }
    graph_destroy(g);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Кількість досяжних вершин", has: "досяжних вершин: 6", hint: "Поверніть tail: стільки вершин потрапило в чергу." },
      { on: "stdout", name: "Порядок обходу", has: "порядок обходу: 0 2 1 3 4 7", hint: "Сусіди йдуть у зворотному порядку вставки, тож порядок обходу 0 2 1 3 4 7." },
      { on: "stdout", name: "Відстань до найдальшої вершини", has: "відстань до 6: -1", hint: "dist[сусіда] = dist[v] + 1, коли dist[сусіда] == -1." },
      { on: "stdout", name: "Недосяжна вершина має -1", has: "відстань до 5: -1", hint: "Вершини з іншої компоненти лишаються зі значенням -1." },
      { on: "stdout", name: "Весь вивід", equals: "досяжних вершин: 6\nпорядок обходу: 0 2 1 3 4 7\nвідстань до 0: 0\nвідстань до 1: 1\nвідстань до 2: 1\nвідстань до 3: 2\nвідстань до 4: 3\nвідстань до 5: -1\nвідстань до 6: -1\nвідстань до 7: 4\nвідстань до 8: -1", hint: "Дванадцять рядків: кількість, порядок і дев'ять відстаней." },
      { on: "source", name: "Черга заповнюється через order", matches: "order\\s*\\[[^\\]]*\\]\\s*=", hint: "Кладіть вершину в order[tail++] і читайте з order[head++]." },
    ],
  },
  {
    ...base, id: "c-trie", lesson: "c/89", xp: 45,
    title: "Префіксне дерево: вставка, пошук, підрахунок",
    context: "Trie дає автодоповнення й швидкі запити за префіксом, чого хеш-таблиця не вміє. Задача вчить поєднувати спуск по дереву з власністю вузлів.",
    brief: [
      "Допишіть <code>trie_insert</code> (спуск за літерами, відсутніх синів створюйте через <code>node_new</code>, <code>nodes++</code>, наприкінці <code>terminal = 1</code> і <code>words++</code>, якщо слово нове; літера поза a..z повертає -1) і <code>trie_contains</code> (слово є, лише якщо шлях існує й <code>terminal</code> встановлено). <code>walk</code> і <code>trie_count_prefix</code> уже написано.",
      "Очікуваний вивід: <code>слів 8, вузлів 12</code> і по рядку для запитів <code>car</code>, <code>ca</code>, <code>do</code>, <code>dog</code>, <code>doge</code>, <code>z</code>. Програма не має витікати пам'ять.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ALPHA 26

typedef struct TrieNode {
    struct TrieNode *kid[ALPHA];
    int terminal;
    int below;
} TrieNode;

typedef struct {
    TrieNode *root;
    size_t nodes;
    size_t words;
} Trie;

static TrieNode *node_new(void) {
    return calloc(1, sizeof(TrieNode));
}

Trie *trie_create(void) {
    Trie *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->root = node_new();
    if (t->root == NULL) {
        free(t);
        return NULL;
    }
    t->nodes = 1;
    t->words = 0;
    return t;
}

static void node_free(TrieNode *n) {
    if (n == NULL) {
        return;
    }
    for (int i = 0; i < ALPHA; i++) {
        node_free(n->kid[i]);
    }
    free(n);
}

void trie_destroy(Trie *t) {
    if (t == NULL) {
        return;
    }
    node_free(t->root);
    free(t);
}

int trie_insert(Trie *t, const char *w) {
    (void)t;
    (void)w;
    return 0;
}

static const TrieNode *walk(const Trie *t, const char *s) {
    const TrieNode *n = t->root;
    for (; *s != '\0' && n != NULL; s++) {
        int c = *s - 'a';
        n = (c < 0 || c >= ALPHA) ? NULL : n->kid[c];
    }
    return n;
}

int trie_contains(const Trie *t, const char *w) {
    (void)t;
    (void)w;
    return 0;
}

static int count_words_below(const TrieNode *n) {
    int total = n->terminal ? 1 : 0;
    for (int i = 0; i < ALPHA; i++) {
        if (n->kid[i] != NULL) {
            total += count_words_below(n->kid[i]);
        }
    }
    return total;
}

int trie_count_prefix(const Trie *t, const char *prefix) {
    const TrieNode *n = walk(t, prefix);
    return n == NULL ? 0 : count_words_below(n);
}

int main(void) {
    Trie *t = trie_create();
    if (t == NULL) {
        return 1;
    }
    const char *words[] = {"car", "card", "care", "cart", "cat", "dog", "do", "car", "dot"};
    for (size_t i = 0; i < sizeof words / sizeof words[0]; i++) {
        trie_insert(t, words[i]);
    }
    printf("слів %zu, вузлів %zu\n", t->words, t->nodes);
    const char *q[] = {"car", "ca", "do", "dog", "doge", "z"};
    for (size_t i = 0; i < sizeof q / sizeof q[0]; i++) {
        printf("%-5s слово: %d, слів із префіксом: %d\n", q[i], trie_contains(t, q[i]), trie_count_prefix(t, q[i]));
    }
    trie_destroy(t);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Лічильники слів і вузлів", has: "слів 8, вузлів 12", hint: "Повторна вставка не збільшує words: рахуйте лише коли terminal ще 0." },
      { on: "stdout", name: "Слово й кількість слів із префіксом", has: "car   слово: 1, слів із префіксом: 4", hint: "trie_contains має вимагати terminal у кінці шляху." },
      { on: "stdout", name: "Префікс, що не є словом", has: "ca    слово: 0, слів із префіксом: 5", hint: "\"ca\" лише префікс: шлях є, а terminal 0." },
      { on: "stdout", name: "Слово не лишає хвоста", has: "dog   слово: 1, слів із префіксом: 1", hint: "\"dog\" є слово й одне слово з таким префіксом." },
      { on: "stdout", name: "Весь вивід", equals: "слів 8, вузлів 12\ncar   слово: 1, слів із префіксом: 4\nca    слово: 0, слів із префіксом: 5\ndo    слово: 1, слів із префіксом: 3\ndog   слово: 1, слів із префіксом: 1\ndoge  слово: 0, слів із префіксом: 0\nz     слово: 0, слів із префіксом: 0", hint: "Сім рядків: лічильники й шість запитів." },
      { on: "source", name: "Кінець слова позначається прапором", matches: "->\\s*terminal\\s*=\\s*1", hint: "Наприкінці спуску ставте n->terminal = 1." },
    ],
  },
  {
    ...base, id: "c-merge-sort", lesson: "c/90", xp: 50,
    title: "Merge sort зі стабільністю й лічильником",
    context: "Merge sort дає гарантовані O(n log n) і стабільність, тому ним сортують записи за кількома ключами. Лічильник порівнянь робить складність видимою без годинника.",
    brief: [
      "Допишіть <code>merge</code>: злийте <code>[lo, mid)</code> і <code>[mid, hi)</code> через <code>tmp</code>, потім скопіюйте результат назад у <code>a</code>. Кожне порівняння рахуйте в <code>cmps</code>. Щоб сортування було стабільним, при рівних оцінках беріть елемент із лівої половини. Рекурсія та виділення <code>tmp</code> уже є.",
      "Очікуваний вивід: масив до й після (рівні оцінки зберігають порядок міток), <code>порівнянь: 17</code> і <code>стабільно: так</code>. Програма не має витікати пам'ять.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int score;
    char tag;
} Rec;

static size_t cmps;

static void merge(Rec *a, Rec *tmp, size_t lo, size_t mid, size_t hi) {
    (void)a;
    (void)tmp;
    (void)lo;
    (void)mid;
    (void)hi;
}

static void merge_sort_rec(Rec *a, Rec *tmp, size_t lo, size_t hi) {
    if (hi - lo < 2) {
        return;
    }
    size_t mid = lo + (hi - lo) / 2;
    merge_sort_rec(a, tmp, lo, mid);
    merge_sort_rec(a, tmp, mid, hi);
    merge(a, tmp, lo, mid, hi);
}

int merge_sort(Rec *a, size_t n) {
    Rec *tmp = malloc(n * sizeof *tmp);
    if (tmp == NULL) {
        return -1;
    }
    merge_sort_rec(a, tmp, 0, n);
    free(tmp);
    return 0;
}

static void show(const Rec *a, size_t n) {
    for (size_t i = 0; i < n; i++) {
        printf(" %d%c", a[i].score, a[i].tag);
    }
    printf("\n");
}

int main(void) {
    Rec a[] = {{3, 'a'}, {1, 'b'}, {3, 'c'}, {2, 'd'}, {1, 'e'}, {2, 'f'}, {3, 'g'}, {1, 'h'}};
    size_t n = sizeof a / sizeof a[0];
    printf("до:");
    show(a, n);
    if (merge_sort(a, n) != 0) {
        return 1;
    }
    printf("після:");
    show(a, n);
    printf("порівнянь: %zu\n", cmps);
    int stable = 1;
    for (size_t i = 1; i < n; i++) {
        if (a[i - 1].score == a[i].score && a[i - 1].tag > a[i].tag) {
            stable = 0;
        }
    }
    printf("стабільно: %s\n", stable ? "так" : "ні");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Масив відсортовано", has: "після: 1b 1e 1h 2d 2f 3a 3c 3g", hint: "Масив має бути відсортований за оцінкою, а рівні оцінки йти в тому порядку, у якому стояли до сортування." },
      { on: "stdout", name: "Лічильник порівнянь", has: "порівнянь: 17", hint: "Збільшуйте cmps один раз на кожне порівняння двох елементів у циклі злиття." },
      { on: "stdout", name: "Рівні елементи зберегли порядок", has: "стабільно: так", hint: "Умова a[j].score < a[i].score строга: при рівності береться лівий елемент." },
      { on: "stdout", name: "Весь вивід", equals: "до: 3a 1b 3c 2d 1e 2f 3g 1h\nпісля: 1b 1e 1h 2d 2f 3a 3c 3g\nпорівнянь: 17\nстабільно: так", hint: "Чотири рядки: масив до, масив після, лічильник, стабільність." },
      { on: "source", name: "Порівняння не нестрогі", matches: "\\.score\\s*<=\\s*\\w+\\s*\\[", not: true, hint: "Умова <= у злитті ламає стабільність: рівні елементи з правої половини потрапляють раніше." },
    ],
  },
  {
    ...base, id: "c-binary-search", lesson: "c/91", xp: 35,
    title: "Бінарний пошук: межі діапазону",
    context: "Помилки на одиницю в бінарному пошуку знають усі. Напіввідкритий проміжок і lower_bound з upper_bound дають діапазон копій без жодного обходу й без віднімань беззнакових.",
    brief: [
      "Допишіть <code>lower_bound</code> (перша позиція, де <code>a[pos] &gt;= key</code>) і <code>upper_bound</code> (позиція після останнього елемента, що не більший за <code>key</code>). Працюйте з проміжком <code>[lo, hi)</code>, середину рахуйте як <code>lo + (hi - lo) / 2</code>, кожне порівняння з елементом масиву збільшує <code>*cmps</code>.",
      "Очікуваний вивід: для кожного з шести ключів проміжок <code>[lo, hi)</code>, кількість копій і кількість порівнянь.",
    ],
    starter: raw`#include <stdio.h>

size_t lower_bound(const int *a, size_t n, int key, size_t *cmps) {
    (void)a;
    (void)key;
    (void)cmps;
    return n;
}

size_t upper_bound(const int *a, size_t n, int key, size_t *cmps) {
    (void)a;
    (void)key;
    (void)cmps;
    return n;
}

int main(void) {
    const int a[] = {1, 3, 3, 3, 5, 8, 8, 13, 21, 21, 21, 21, 34, 55};
    const size_t n = sizeof a / sizeof a[0];
    const int keys[] = {3, 21, 8, 4, 0, 99};
    for (size_t i = 0; i < sizeof keys / sizeof keys[0]; i++) {
        size_t cmps = 0;
        size_t lo = lower_bound(a, n, keys[i], &cmps);
        size_t hi = upper_bound(a, n, keys[i], &cmps);
        printf("ключ %2d: [%zu, %zu) копій %zu, порівнянь %zu\n", keys[i], lo, hi, hi - lo, cmps);
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Ключ із кількома копіями", has: "ключ  3: [1, 4) копій 3, порівнянь 8", hint: "lower_bound: якщо a[mid] < key, то lo = mid + 1, інакше hi = mid." },
      { on: "stdout", name: "Ключ у кінці масиву", has: "ключ 21: [8, 12) копій 4, порівнянь 8", hint: "upper_bound: умова a[mid] <= key; різниця hi - lo це кількість копій." },
      { on: "stdout", name: "Відсутній ключ дає порожній проміжок", has: "ключ  4: [4, 4) копій 0, порівнянь 8", hint: "Для відсутнього ключа lo == hi: позиція вставки." },
      { on: "stdout", name: "Ключ більший за всі", has: "ключ 99: [14, 14) копій 0, порівнянь 6", hint: "Для ключа більшого за всі обидві функції повертають n." },
      { on: "stdout", name: "Весь вивід", equals: "ключ  3: [1, 4) копій 3, порівнянь 8\nключ 21: [8, 12) копій 4, порівнянь 8\nключ  8: [5, 7) копій 2, порівнянь 8\nключ  4: [4, 4) копій 0, порівнянь 8\nключ  0: [0, 0) копій 0, порівнянь 8\nключ 99: [14, 14) копій 0, порівнянь 6", hint: "Шість рядків, по одному на ключ." },
      { on: "source", name: "Середина без переповнення", matches: "lo\\s*\\+\\s*\\(\\s*hi\\s*-\\s*lo\\s*\\)\\s*/\\s*2", hint: "Пишіть mid = lo + (hi - lo) / 2." },
      { on: "source", name: "Немає (lo + hi) / 2", matches: "\\(\\s*lo\\s*\\+\\s*hi\\s*\\)\\s*/\\s*2", not: true, hint: "Сума lo + hi може переповнитися." },
    ],
  },
  {
    ...base, id: "c-word-dictionary", lesson: "c/92", xp: 50,
    title: "Словник частот слів на хеш-таблиці",
    context: "Підрахунок частот слів на хеш-таблиці це проєктна задача в мініатюрі: рядки, власність пам'яті, видалення з ланцюжка та сортування. Така ж структура стоїть за аналізом логів і пошуковими індексами.",
    brief: [
      "Допишіть <code>table_remove</code> (знайти ключ у ланцюжку, перев'язати сусідів, <code>free</code> ключа й вузла, <code>len--</code>, повернути 1; якщо ключа немає, повернути 0) і компаратор <code>cmp_top</code> (спершу більший лічильник, при рівних за алфавітом через <code>strcmp</code>). Токенізація, додавання, ресайз і <code>table_destroy</code> уже є.",
      "Очікуваний вивід: <code>було 14, прибрано 5, лишилось 9</code>, топ-3 слова після видалення стоп-слів і значення <code>fox</code> та <code>the</code>. Програма не має витікати пам'ять.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <ctype.h>

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
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            free(e->key);
            free(e);
            e = next;
        }
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

static int table_grow(Table *t) {
    size_t nb2 = t->nb * 2;
    Entry **b2 = calloc(nb2, sizeof *b2);
    if (b2 == NULL) {
        return -1;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            size_t j = djb2(e->key) % nb2;
            e->next = b2[j];
            b2[j] = e;
            e = next;
        }
    }
    free(t->buckets);
    t->buckets = b2;
    t->nb = nb2;
    t->resizes++;
    return 0;
}

int table_add(Table *t, const char *key, int delta) {
    Entry *e = table_find(t, key);
    if (e != NULL) {
        e->value += delta;
        return 0;
    }
    e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->key = dup_str(key);
    if (e->key == NULL) {
        free(e);
        return -1;
    }
    e->value = delta;
    size_t i = djb2(key) % t->nb;
    e->next = t->buckets[i];
    t->buckets[i] = e;
    t->len++;
    if (t->len * 4 > t->nb * 3) {
        return table_grow(t);
    }
    return 0;
}

int table_get(const Table *t, const char *key, int fallback) {
    const Entry *e = table_find(t, key);
    return e != NULL ? e->value : fallback;
}

int table_remove(Table *t, const char *key) {
    (void)t;
    (void)key;
    return 0;
}

int count_words(Table *t, const char *text) {
    char word[32];
    size_t n = 0;
    for (const char *p = text;; p++) {
        if (isalpha((unsigned char)*p) && n + 1 < sizeof word) {
            word[n++] = (char)tolower((unsigned char)*p);
        } else {
            if (n > 0) {
                word[n] = '\0';
                if (table_add(t, word, 1) != 0) {
                    return -1;
                }
                n = 0;
            }
            if (*p == '\0') {
                break;
            }
        }
    }
    return 0;
}

static int cmp_top(const void *a, const void *b) {
    const Entry *x = *(Entry *const *)a;
    const Entry *y = *(Entry *const *)b;
    (void)x;
    (void)y;
    return 0;
}

void table_print_top(const Table *t, size_t k) {
    Entry **all = malloc((t->len + 1) * sizeof *all);
    if (all == NULL) {
        return;
    }
    size_t n = 0;
    for (size_t i = 0; i < t->nb; i++) {
        for (Entry *e = t->buckets[i]; e != NULL; e = e->next) {
            all[n++] = e;
        }
    }
    qsort(all, n, sizeof *all, cmp_top);
    for (size_t i = 0; i < n && i < k; i++) {
        printf("%zu. %s=%d\n", i + 1, all[i]->key, all[i]->value);
    }
    free(all);
}

int main(void) {
    const char *text =
        "The quick brown fox jumps over the lazy dog. The dog barks; the fox runs away. "
        "A quick fox is a happy fox.";
    const char *stop[] = {"the", "a", "is", "over", "away"};
    Table *t = table_create(4);
    if (t == NULL) {
        return 1;
    }
    if (count_words(t, text) != 0) {
        table_destroy(t);
        return 1;
    }
    size_t before = t->len;
    int removed = 0;
    for (size_t i = 0; i < sizeof stop / sizeof stop[0]; i++) {
        removed += table_remove(t, stop[i]);
    }
    printf("було %zu, прибрано %d, лишилось %zu\n", before, removed, t->len);
    table_print_top(t, 3);
    printf("fox=%d the=%d\n", table_get(t, "fox", -1), table_get(t, "the", -1));
    table_destroy(t);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Видалення стоп-слів", has: "було 14, прибрано 5, лишилось 9", hint: "table_remove повертає 1 для наявного ключа і 0 для відсутнього; len зменшується." },
      { on: "stdout", name: "Топ-3 слова", has: "1. fox=4\n2. dog=2\n3. quick=2", hint: "Спершу більший лічильник (y->value > x->value ? 1 : -1), при рівних strcmp(x->key, y->key)." },
      { on: "stdout", name: "Видалене слово більше не знаходиться", has: "fox=4 the=-1", hint: "Після видалення table_get(\"the\") повертає запасне -1." },
      { on: "stdout", name: "Весь вивід", equals: "було 14, прибрано 5, лишилось 9\n1. fox=4\n2. dog=2\n3. quick=2\nfox=4 the=-1", hint: "П'ять рядків: статистика, три рядки топу й рядок із get." },
      { on: "source", name: "Довжина зменшується при видаленні", matches: "->\\s*len\\s*(--|-=\\s*1)", hint: "Після видалення вузла зменште t->len." },
      { on: "source", name: "Ключ і вузол звільняються", matches: "free\\s*\\(\\s*\\w+\\s*->\\s*key\\s*\\)", hint: "Перед free(e) звільніть копію ключа: free(e->key)." },
    ],
  },
];
