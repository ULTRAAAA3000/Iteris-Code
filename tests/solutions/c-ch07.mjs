// Еталонні рішення завдань C, глава 07 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_07 = {
  "c-errno-parse": raw`#include <errno.h>
#include <stdio.h>
#include <stdlib.h>

enum { PARSE_OK, PARSE_EMPTY, PARSE_JUNK, PARSE_RANGE };

static int parse_int(const char *s, long *out) {
    char *end;
    errno = 0;
    long v = strtol(s, &end, 10);
    if (end == s) {
        return PARSE_EMPTY;
    }
    if (errno == ERANGE) {
        return PARSE_RANGE;
    }
    if (*end != '\0') {
        return PARSE_JUNK;
    }
    *out = v;
    return PARSE_OK;
}

static void show(const char *s) {
    long v;
    switch (parse_int(s, &v)) {
    case PARSE_OK:
        printf("%s -> %ld\n", s, v);
        break;
    case PARSE_EMPTY:
        printf("%s -> немає цифр\n", s);
        break;
    case PARSE_JUNK:
        printf("%s -> сміття\n", s);
        break;
    default:
        printf("%s -> завелике\n", s);
        break;
    }
}

int main(void) {
    show("42");
    show("-17");
    show("12abc");
    show("");
    show("99999999999999999999");
    return 0;
}
`,
  "c-assert-guard": raw`#include <assert.h>
#include <stdio.h>

static int mean(const int *a, int n) {
    assert(a != NULL);
    assert(n > 0);
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += a[i];
    }
    return sum / n;
}

static int digit_value(char c) {
    if (c < '0' || c > '9') {
        return -1;
    }
    return c - '0';
}

int main(void) {
    int data[] = {2, 4, 6};
    printf("mean: %d\n", mean(data, 3));
    printf("digit 7: %d\n", digit_value('7'));
    printf("digit x: %d\n", digit_value('x'));
    return 0;
}
`,
  "c-result-safe": raw`#include <limits.h>
#include <stdbool.h>
#include <stdio.h>

typedef enum { ERR_OK, ERR_DIV_ZERO, ERR_OVERFLOW } Err;

typedef struct {
    bool ok;
    int value;
    Err err;
} Result;

static Result ok_value(int v) {
    Result r = {true, v, ERR_OK};
    return r;
}

static Result fail(Err e) {
    Result r = {false, 0, e};
    return r;
}

static Result safe_div(int a, int b) {
    if (b == 0) {
        return fail(ERR_DIV_ZERO);
    }
    return ok_value(a / b);
}

static Result checked_add(int a, int b) {
    if (a > INT_MAX - b) {
        return fail(ERR_OVERFLOW);
    }
    return ok_value(a + b);
}

static void show(const char *label, Result r) {
    if (r.ok) {
        printf("%s = %d\n", label, r.value);
    } else if (r.err == ERR_DIV_ZERO) {
        printf("%s: ділення на нуль\n", label);
    } else {
        printf("%s: переповнення\n", label);
    }
}

int main(void) {
    show("20 / 4", safe_div(20, 4));
    show("1 / 0", safe_div(1, 0));
    show("INT_MAX + 1", checked_add(INT_MAX, 1));
    show("2 + 3", checked_add(2, 3));
    return 0;
}
`,
  "c-cleanup-chain": raw`#include <stdio.h>

static int run(int fail_at) {
    int rc = -1;
    if (fail_at == 1) {
        printf("A: помилка\n");
        goto out;
    }
    printf("A: взяти\n");
    if (fail_at == 2) {
        printf("B: помилка\n");
        goto drop_a;
    }
    printf("B: взяти\n");
    printf("робота\n");
    rc = 0;
    printf("B: віддати\n");
drop_a:
    printf("A: віддати\n");
out:
    return rc;
}

int main(void) {
    printf("rc=%d\n", run(0));
    printf("rc=%d\n", run(1));
    printf("rc=%d\n", run(2));
    return 0;
}
`,
  "c-longjmp-codes": raw`#include <setjmp.h>
#include <stdio.h>

static jmp_buf env;

static int divide(int a, int b) {
    if (b == 0) {
        longjmp(env, 1);
    }
    if (a < 0) {
        longjmp(env, 2);
    }
    return a / b;
}

int main(void) {
    int cases[][2] = {{10, 2}, {7, 0}, {-4, 2}};
    for (int i = 0; i < 3; i++) {
        int a = cases[i][0];
        int b = cases[i][1];
        int code = setjmp(env);
        if (code == 0) {
            printf("%d / %d = %d\n", a, b, divide(a, b));
        } else if (code == 1) {
            printf("%d / %d: ділення на нуль\n", a, b);
        } else {
            printf("%d / %d: від'ємне\n", a, b);
        }
    }
    return 0;
}
`,
  "c-retry-policy": raw`#include <stdio.h>
#include <stdlib.h>

static void bye(void) {
    printf("bye\n");
}

static int flaky(int attempt) {
    return attempt >= 3 ? 0 : -1;
}

static int retry(int max) {
    for (int i = 1; i <= max; i++) {
        if (flaky(i) == 0) {
            return i;
        }
    }
    return -1;
}

int main(void) {
    atexit(bye);
    int n = retry(5);
    if (n > 0) {
        printf("успіх на спробі %d\n", n);
    } else {
        printf("вичерпано 5 спроб, запасний шлях\n");
    }
    n = retry(2);
    if (n > 0) {
        printf("успіх на спробі %d\n", n);
    } else {
        printf("вичерпано 2 спроб, запасний шлях\n");
    }
    return 0;
}
`,
};
