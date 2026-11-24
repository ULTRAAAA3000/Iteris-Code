// Еталонні рішення завдань C, глава 09 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_09 = {
  "c-int-vector": raw`#include <stdio.h>
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
    if (v->len == v->cap) {
        size_t ncap = v->cap == 0 ? 2 : v->cap * 2;
        int *p = realloc(v->data, ncap * sizeof *p);
        if (p == NULL) {
            return -1;
        }
        v->data = p;
        v->cap = ncap;
        v->grows++;
    }
    v->data[v->len++] = x;
    return 0;
}

int vec_pop(IntVec *v, int *out) {
    if (v->len == 0) {
        return -1;
    }
    *out = v->data[--v->len];
    return 0;
}

void vec_destroy(IntVec *v) {
    if (v != NULL) {
        free(v->data);
        free(v);
    }
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
  "c-linked-list": raw`#include <stdio.h>
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

static Node *new_node(int x) {
    Node *n = malloc(sizeof *n);
    if (n != NULL) {
        n->value = x;
        n->next = NULL;
    }
    return n;
}

int list_push_front(List *l, int x) {
    Node *n = new_node(x);
    if (n == NULL) {
        return -1;
    }
    n->next = l->head;
    l->head = n;
    if (l->tail == NULL) {
        l->tail = n;
    }
    l->len++;
    return 0;
}

int list_push_back(List *l, int x) {
    Node *n = new_node(x);
    if (n == NULL) {
        return -1;
    }
    if (l->tail == NULL) {
        l->head = n;
    } else {
        l->tail->next = n;
    }
    l->tail = n;
    l->len++;
    return 0;
}

void list_reverse(List *l) {
    Node *prev = NULL;
    Node *cur = l->head;
    l->tail = l->head;
    while (cur != NULL) {
        Node *next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    l->head = prev;
}

void list_destroy(List *l) {
    Node *n = l->head;
    while (n != NULL) {
        Node *next = n->next;
        free(n);
        n = next;
    }
    l->head = NULL;
    l->tail = NULL;
    l->len = 0;
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
  "c-bracket-stack": raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *items;
    size_t top;
    size_t cap;
} Stack;

Stack *stack_create(size_t cap) {
    Stack *s = malloc(sizeof *s);
    if (s == NULL) {
        return NULL;
    }
    s->items = malloc(cap * sizeof *s->items);
    if (s->items == NULL) {
        free(s);
        return NULL;
    }
    s->top = 0;
    s->cap = cap;
    return s;
}

int stack_push(Stack *s, char c) {
    if (s->top == s->cap) {
        return -1;
    }
    s->items[s->top++] = c;
    return 0;
}

int stack_pop(Stack *s, char *out) {
    if (s->top == 0) {
        return -1;
    }
    *out = s->items[--s->top];
    return 0;
}

void stack_destroy(Stack *s) {
    if (s != NULL) {
        free(s->items);
        free(s);
    }
}

int balanced(const char *text) {
    Stack *s = stack_create(strlen(text) + 1);
    if (s == NULL) {
        return 0;
    }
    int ok = 1;
    for (const char *p = text; *p != '\0' && ok; p++) {
        char c = *p;
        if (c == '(' || c == '[' || c == '{') {
            stack_push(s, c);
        } else if (c == ')' || c == ']' || c == '}') {
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            char open = 0;
            ok = stack_pop(s, &open) == 0 && open == want;
        }
    }
    ok = ok && s->top == 0;
    stack_destroy(s);
    return ok;
}

int main(void) {
    const char *tests[] = {"{[()]}", "(]", "(((", "x(y)[z]", "())"};
    for (size_t i = 0; i < sizeof tests / sizeof tests[0]; i++) {
        printf("%-8s %s\n", tests[i], balanced(tests[i]) ? "ok" : "ні");
    }
    return 0;
}
`,
  "c-dlist-sentinel": raw`#include <stdio.h>
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
    Node *n = malloc(sizeof *n);
    if (n == NULL) {
        return NULL;
    }
    n->value = x;
    n->prev = pos;
    n->next = pos->next;
    pos->next->prev = n;
    pos->next = n;
    l->len++;
    return n;
}

void dl_remove(DList *l, Node *n) {
    n->prev->next = n->next;
    n->next->prev = n->prev;
    free(n);
    l->len--;
}

void dl_destroy(DList *l) {
    while (l->head.next != &l->head) {
        dl_remove(l, l->head.next);
    }
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
  "c-hash-table": raw`#include <stdio.h>
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
  "c-bst-delete": raw`#include <stdio.h>
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
    if (root == NULL) {
        return 0;
    }
    int l = bst_height(root->left);
    int r = bst_height(root->right);
    return 1 + (l > r ? l : r);
}

int bst_contains(const Node *root, int key, int *cmp) {
    while (root != NULL) {
        (*cmp)++;
        if (key == root->key) {
            return 1;
        }
        root = key < root->key ? root->left : root->right;
    }
    return 0;
}

static const Node *bst_min(const Node *n) {
    while (n->left != NULL) {
        n = n->left;
    }
    return n;
}

Node *bst_delete(Node *root, int key) {
    if (root == NULL) {
        return NULL;
    }
    if (key < root->key) {
        root->left = bst_delete(root->left, key);
    } else if (key > root->key) {
        root->right = bst_delete(root->right, key);
    } else if (root->left == NULL || root->right == NULL) {
        Node *child = root->left != NULL ? root->left : root->right;
        free(root);
        return child;
    } else {
        root->key = bst_min(root->right)->key;
        root->right = bst_delete(root->right, root->key);
    }
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
};
