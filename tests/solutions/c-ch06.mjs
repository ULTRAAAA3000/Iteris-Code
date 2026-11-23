// Еталонні рішення завдань C, глава 06 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_06 = {
  "c-header-module": raw`#include <stdio.h>

/* ===== vec.h ===== */
typedef struct {
    int x;
    int y;
} Vec;

Vec vec_add(Vec a, Vec b);
int vec_dot(Vec a, Vec b);
void vec_print(const Vec *v);

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
    Vec r = {a.x + b.x, a.y + b.y};
    return r;
}

int vec_dot(Vec a, Vec b) {
    return a.x * b.x + a.y * b.y;
}

void vec_print(const Vec *v) {
    printf("(%d, %d)\n", v->x, v->y);
}
`,
  "c-make-stale": raw`#include <stdio.h>
#include <stddef.h>

static int stale(long target, const long *deps, size_t n) {
    if (target == 0) {
        return 1;
    }
    for (size_t i = 0; i < n; i++) {
        if (deps[i] > target) {
            return 1;
        }
    }
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
  "c-macro-safe": raw`#include <stdio.h>

#define SQUARE(x) ((x) * (x))
#define ABS(x) ((x) < 0 ? -(x) : (x))
#define CLAMP(x, lo, hi) ((x) < (lo) ? (lo) : (x) > (hi) ? (hi) : (x))

int main(void) {
    printf("SQUARE(1 + 2) = %d\n", SQUARE(1 + 2));
    printf("ABS(2 - 5) = %d\n", ABS(2 - 5));
    printf("CLAMP(15, 0, 10) = %d\n", CLAMP(15, 0, 10));
    printf("CLAMP(-4, 0, 10) = %d\n", CLAMP(-4, 0, 10));
    return 0;
}
`,
  "c-feature-flags": raw`#include <stdio.h>

#define MODE 2

#ifndef LIMIT
#define LIMIT 3
#endif

static const char *mode_name(void) {
#if MODE == 1
    return "debug";
#elif MODE == 2
    return "release";
#else
    return "unknown";
#endif
}

int main(void) {
    printf("mode: %s\n", mode_name());
    printf("limit: %d\n", LIMIT);
    return 0;
}
`,
  "c-static-ids": raw`#include <stdio.h>

static int calls = 0;

static int next_id(void) {
    static int last = 0;
    last++;
    calls++;
    return last;
}

static int total_calls(void) {
    return calls;
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
  "c-mini-tests": raw`#include <stdio.h>

static int checks = 0;
static int failed = 0;

#define CHECK(cond) do { \
    checks++; \
    if (!(cond)) { \
        failed++; \
        printf("FAIL: %s\n", #cond); \
    } \
} while (0)

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
  "c-generic-kind": raw`#include <stdio.h>

_Static_assert(sizeof(double) == 8, "double має бути 8 байтів");

#define KIND(x) _Generic((x), \
    int: "int", \
    double: "double", \
    float: "float", \
    char *: "text", \
    default: "other")

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
  "c-plugin-lookup": raw`#include <stdio.h>
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
    for (size_t i = 0; i < sizeof exports / sizeof exports[0]; i++) {
        if (strcmp(exports[i].name, name) == 0) {
            return exports[i].fn;
        }
    }
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
};
