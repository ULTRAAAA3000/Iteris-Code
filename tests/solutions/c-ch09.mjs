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
  "c-min-heap": raw`#include <stdio.h>
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

static void swap_int(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int heap_push(Heap *h, int x) {
    if (h->len == h->cap) {
        size_t cap = h->cap == 0 ? 4 : h->cap * 2;
        int *p = realloc(h->data, cap * sizeof *p);
        if (p == NULL) {
            return -1;
        }
        h->data = p;
        h->cap = cap;
    }
    size_t i = h->len++;
    h->data[i] = x;
    while (i > 0) {
        size_t parent = (i - 1) / 2;
        if (h->data[parent] <= h->data[i]) {
            break;
        }
        swap_int(&h->data[parent], &h->data[i]);
        i = parent;
    }
    return 0;
}

int heap_pop(Heap *h, int *out) {
    if (h->len == 0) {
        return -1;
    }
    *out = h->data[0];
    h->data[0] = h->data[--h->len];
    size_t i = 0;
    for (;;) {
        size_t l = 2 * i + 1;
        size_t r = l + 1;
        size_t m = i;
        if (l < h->len && h->data[l] < h->data[m]) {
            m = l;
        }
        if (r < h->len && h->data[r] < h->data[m]) {
            m = r;
        }
        if (m == i) {
            break;
        }
        swap_int(&h->data[i], &h->data[m]);
        i = m;
    }
    return 0;
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
  "c-graph-bfs": raw`#include <stdio.h>
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
    size_t head = 0;
    size_t tail = 0;
    dist[src] = 0;
    order[tail++] = src;
    while (head < tail) {
        int v = order[head++];
        for (const Edge *e = g->adj[v]; e != NULL; e = e->next) {
            if (dist[e->to] == -1) {
                dist[e->to] = dist[v] + 1;
                order[tail++] = e->to;
            }
        }
    }
    return (int)tail;
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
  "c-trie": raw`#include <stdio.h>
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
    TrieNode *n = t->root;
    for (; *w != '\0'; w++) {
        int c = *w - 'a';
        if (c < 0 || c >= ALPHA) {
            return -1;
        }
        if (n->kid[c] == NULL) {
            n->kid[c] = node_new();
            if (n->kid[c] == NULL) {
                return -1;
            }
            t->nodes++;
        }
        n = n->kid[c];
    }
    if (!n->terminal) {
        n->terminal = 1;
        t->words++;
    }
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
    const TrieNode *n = walk(t, w);
    return n != NULL && n->terminal;
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
  "c-merge-sort": raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int score;
    char tag;
} Rec;

static size_t cmps;

static void merge(Rec *a, Rec *tmp, size_t lo, size_t mid, size_t hi) {
    size_t i = lo;
    size_t j = mid;
    size_t k = lo;
    while (i < mid && j < hi) {
        cmps++;
        if (a[j].score < a[i].score) {
            tmp[k++] = a[j++];
        } else {
            tmp[k++] = a[i++];
        }
    }
    while (i < mid) {
        tmp[k++] = a[i++];
    }
    while (j < hi) {
        tmp[k++] = a[j++];
    }
    for (k = lo; k < hi; k++) {
        a[k] = tmp[k];
    }
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
  "c-binary-search": raw`#include <stdio.h>

size_t lower_bound(const int *a, size_t n, int key, size_t *cmps) {
    size_t lo = 0;
    size_t hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        (*cmps)++;
        if (a[mid] < key) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

size_t upper_bound(const int *a, size_t n, int key, size_t *cmps) {
    size_t lo = 0;
    size_t hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        (*cmps)++;
        if (a[mid] <= key) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
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
  "c-word-dictionary": raw`#include <stdio.h>
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
    Entry **link = &t->buckets[djb2(key) % t->nb];
    while (*link != NULL) {
        Entry *e = *link;
        if (strcmp(e->key, key) == 0) {
            *link = e->next;
            free(e->key);
            free(e);
            t->len--;
            return 1;
        }
        link = &e->next;
    }
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
    if (x->value != y->value) {
        return y->value > x->value ? 1 : -1;
    }
    return strcmp(x->key, y->key);
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
};
