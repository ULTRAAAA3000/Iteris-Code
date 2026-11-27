// Еталонні рішення завдань C, глава 12 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_12 = {
  "c-project-text-stats": raw`#include <ctype.h>
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
    char *w = malloc(n + 1);
    if (w == NULL) {
        return -1;
    }
    for (size_t i = 0; i < n; i++) {
        w[i] = (char)tolower((unsigned char)s[i]);
    }
    w[n] = '\0';
    for (size_t i = 0; i < t->len; i++) {
        if (strcmp(t->items[i].text, w) == 0) {
            t->items[i].count++;
            free(w);
            return 0;
        }
    }
    if (t->len == t->cap) {
        size_t ncap = t->cap == 0 ? 4 : t->cap * 2;
        Entry *p = realloc(t->items, ncap * sizeof *p);
        if (p == NULL) {
            free(w);
            return -1;
        }
        t->items = p;
        t->cap = ncap;
    }
    t->items[t->len].text = w;
    t->items[t->len].count = 1;
    t->len++;
    return 0;
}

static int cmp_entry(const void *a, const void *b) {
    const Entry *x = a;
    const Entry *y = b;
    if (x->count != y->count) {
        return x->count > y->count ? -1 : 1;
    }
    return strcmp(x->text, y->text);
}

static const char *longest(const Table *t) {
    const char *best = "";
    for (size_t i = 0; i < t->len; i++) {
        const char *w = t->items[i].text;
        size_t lw = strlen(w);
        size_t lb = strlen(best);
        if (lw > lb || (lw == lb && strcmp(w, best) < 0)) {
            best = w;
        }
    }
    return best;
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
  "c-project-calculator": raw`#include <ctype.h>
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
    if (p->err != OK) {
        return 0;
    }
    if (++p->depth > MAX_DEPTH) {
        fail(p, ERR_DEPTH);
        p->depth--;
        return 0;
    }
    long long v = 0;
    if (p->tok == T_NUM) {
        v = p->num;
        next(p);
    } else if (p->tok == T_MINUS) {
        next(p);
        v = -factor(p);
    } else if (p->tok == T_LP) {
        next(p);
        v = expr(p);
        if (p->err == OK && p->tok != T_RP) {
            fail(p, ERR_PAREN);
        } else if (p->err == OK) {
            next(p);
        }
    } else {
        fail(p, ERR_SYNTAX);
    }
    p->depth--;
    return v;
}

static long long term(Parser *p) {
    long long v = factor(p);
    while (p->err == OK && (p->tok == T_STAR || p->tok == T_SLASH)) {
        Tok op = p->tok;
        next(p);
        long long r = factor(p);
        if (op == T_STAR) {
            v = checked(p, v * r);
        } else if (r == 0) {
            fail(p, ERR_DIV0);
            return 0;
        } else {
            v = v / r;
        }
    }
    return v;
}

static long long expr(Parser *p) {
    long long v = term(p);
    while (p->err == OK && (p->tok == T_PLUS || p->tok == T_MINUS)) {
        Tok op = p->tok;
        next(p);
        long long r = term(p);
        v = checked(p, op == T_PLUS ? v + r : v - r);
    }
    return v;
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
  "c-project-arena": raw`#include <stdint.h>
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
    if (align == 0 || (align & (align - 1)) != 0) {
        return NULL;
    }
    uintptr_t addr = (uintptr_t)(a->base + a->used);
    size_t pad = (size_t)((align - (addr & (align - 1))) & (align - 1));
    if (pad > a->cap - a->used || size > a->cap - a->used - pad) {
        return NULL;
    }
    void *p = a->base + a->used + pad;
    a->used += pad + size;
    a->count++;
    return p;
}

static void arena_reset(Arena *a) {
    a->used = 0;
    a->count = 0;
}

static void arena_destroy(Arena *a) {
    if (a == NULL) {
        return;
    }
    counted_free(a->base);
    counted_free(a);
}

static int tree_insert(Arena *a, Node **root, int key) {
    Node **link = root;
    while (*link != NULL) {
        if (key == (*link)->key) {
            return 0;
        }
        link = key < (*link)->key ? &(*link)->left : &(*link)->right;
    }
    Node *n = arena_alloc(a, sizeof *n, _Alignof(Node));
    if (n == NULL) {
        return -1;
    }
    n->key = key;
    n->left = NULL;
    n->right = NULL;
    *link = n;
    return 1;
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
  "c-project-vm": raw`#include <stdint.h>
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
            e = pop(&vm, &b);
            if (e == VM_OK) {
                e = pop(&vm, &a);
            }
            if (e == VM_OK) {
                int64_t r = op == OP_ADD ? (int64_t)a + b : op == OP_SUB ? (int64_t)a - b : (int64_t)a * b;
                e = push(&vm, r);
            }
            break;
        case OP_LOAD:
            if (arg < 0 || arg >= MEM_SIZE) {
                return VM_BAD_ADDR;
            }
            e = push(&vm, vm.mem[arg]);
            break;
        case OP_STORE:
            if (arg < 0 || arg >= MEM_SIZE) {
                return VM_BAD_ADDR;
            }
            e = pop(&vm, &vm.mem[arg]);
            break;
        case OP_JMP:
        case OP_JZ:
        case OP_CALL: {
            if (arg < 0 || (size_t)arg >= prog->len) {
                return VM_BAD_ADDR;
            }
            int take = 1;
            if (op == OP_JZ) {
                e = pop(&vm, &a);
                take = e == VM_OK && a == 0;
            } else if (op == OP_CALL) {
                if (vm.cp >= CALL_MAX) {
                    return VM_CALL_OVER;
                }
                vm.calls[vm.cp++] = vm.pc;
            }
            if (take) {
                vm.pc = (size_t)arg;
            }
            break;
        }
        case OP_RET:
            if (vm.cp == 0) {
                return VM_BAD_ADDR;
            }
            vm.pc = vm.calls[--vm.cp];
            break;
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
};
