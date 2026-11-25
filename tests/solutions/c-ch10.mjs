// Еталонні рішення завдань C, глава 10 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_10 = {
  "c-table-tests": raw`#include <stdio.h>

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
        {"нуль", 0, 7, 7},
        {"рівні", 9, 9, 9},
    };
    size_t n = sizeof cases / sizeof cases[0];
    int failed = 0;
    for (size_t i = 0; i < n; i++) {
        int got = gcd(cases[i].a, cases[i].b);
        if (got == cases[i].want) {
            printf("ok %s\n", cases[i].name);
        } else {
            printf("FAIL %s: got %d, want %d\n", cases[i].name, got, cases[i].want);
            failed++;
        }
    }
    printf("провалено: %d з %zu\n", failed, n);
    return failed ? 1 : 0;
}
`,
  "c-mini-framework": raw`#include <stdio.h>

static int g_run;
static int g_failed;

#define EXPECT_EQ(actual, expected)                                          \
    do {                                                                     \
        long long a_ = (actual);                                             \
        long long e_ = (expected);                                           \
        g_run++;                                                             \
        if (a_ != e_) {                                                      \
            g_failed++;                                                      \
            printf("FAIL строка %d: %s == %s (%lld != %lld)\n", __LINE__,    \
                   #actual, #expected, a_, e_);                              \
        }                                                                    \
    } while (0)

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
  "c-memstream-test": raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int read_numbers(FILE *in, int *sum) {
    int count = 0;
    int v;
    *sum = 0;
    while (fscanf(in, "%d", &v) == 1) {
        *sum += v;
        count++;
    }
    return count;
}

static void print_stats(FILE *out, int sum, int count) {
    fprintf(out, "sum=%d count=%d\n", sum, count);
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
  "c-safe-ub": raw`#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

static int checked_add(int a, int b, int *out) {
    if ((b > 0 && a > INT_MAX - b) || (b < 0 && a < INT_MIN - b)) {
        return 0;
    }
    *out = a + b;
    return 1;
}

static size_t copy_bounded(char *dst, size_t cap, const char *src) {
    if (cap == 0) {
        return 0;
    }
    size_t n = 0;
    while (n + 1 < cap && src[n] != '\0') {
        dst[n] = src[n];
        n++;
    }
    dst[n] = '\0';
    return n;
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
  "c-count-steps": raw`#include <stdio.h>

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
    int lo = 0;
    int hi = N - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        (*steps)++;
        if (a[mid] == key) {
            return mid;
        }
        if (a[mid] < key) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
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
  "c-style-fix": raw`#include <stdio.h>

static size_t count_positive(const int *a, size_t n) {
    size_t count = 0;
    for (size_t i = 0; i < n; i++) {
        if (a[i] > 0) {
            count++;
        }
    }
    return count;
}

int main(void) {
    int v[] = {3, -1, 0, 7, -5, 2};
    size_t n = sizeof v / sizeof v[0];
    printf("додатних: %zu з %zu\n", count_positive(v, n), n);
    return 0;
}
`,
};
