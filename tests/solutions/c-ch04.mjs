// Еталонні рішення завдань C, глава 04 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_04 = {
  "c-pointer-basics": raw`#include <stdio.h>

int main(void) {
    int a = 10;
    int b = 7;
    int *p = &a;
    *p += 5;
    p = &b;
    *p *= 2;
    printf("a=%d\n", a);
    printf("b=%d\n", b);
    printf("p вказує на b: %d\n", p == &b);
    return 0;
}
`,
  "c-out-params": raw`#include <stdio.h>

void minmax(const int a[], size_t n, int *lo, int *hi) {
    *lo = a[0];
    *hi = a[0];
    for (size_t i = 1; i < n; i++) {
        if (a[i] < *lo) {
            *lo = a[i];
        }
        if (a[i] > *hi) {
            *hi = a[i];
        }
    }
}

void swap(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}

int main(void) {
    int data[] = {4, 9, 2, 7};
    size_t n = sizeof data / sizeof data[0];
    int lo = 0;
    int hi = 0;
    minmax(data, n, &lo, &hi);
    printf("min=%d max=%d\n", lo, hi);
    swap(&lo, &hi);
    printf("після swap: %d %d\n", lo, hi);
    return 0;
}
`,
  "c-ptr-walk": raw`#include <stdio.h>

int *find_first(int *a, size_t n, int x) {
    for (int *p = a; p != a + n; p++) {
        if (*p == x) {
            return p;
        }
    }
    return NULL;
}

void reverse(int *lo, int *hi) {
    while (lo < hi) {
        int t = *lo;
        *lo = *hi;
        *hi = t;
        lo++;
        hi--;
    }
}

int main(void) {
    int a[] = {4, 8, 15, 16, 23, 42};
    size_t n = sizeof a / sizeof a[0];
    int *hit = find_first(a, n, 15);
    if (hit != NULL) {
        printf("15 на позиції %td\n", hit - a);
    } else {
        printf("15 не знайдено\n");
    }
    printf("9 %s\n", find_first(a, n, 9) == NULL ? "відсутнє" : "є");
    reverse(a, a + n - 1);
    printf("реверс:");
    for (int *p = a; p != a + n; p++) {
        printf(" %d", *p);
    }
    printf("\n");
    return 0;
}
`,
  "c-const-ptr": raw`#include <ctype.h>
#include <stdio.h>
#include <string.h>

int count_vowels(const char *s) {
    int n = 0;
    for (; *s != '\0'; s++) {
        if (strchr("aeiouAEIOU", *s) != NULL) {
            n++;
        }
    }
    return n;
}

void to_upper(char *s) {
    for (; *s != '\0'; s++) {
        *s = (char)toupper((unsigned char)*s);
    }
}

int main(void) {
    char word[] = "Programming";
    const char *title = "const in C";
    printf("Голосних у %s: %d\n", word, count_vowels(word));
    printf("Голосних у %s: %d\n", title, count_vowels(title));
    to_upper(word);
    printf("Після: %s\n", word);
    return 0;
}
`,
  "c-malloc-repeat": raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *repeat(const char *s, int times) {
    size_t len = strlen(s);
    size_t total = len * (size_t)times;
    char *out = malloc(total + 1);
    if (out == NULL) {
        return NULL;
    }
    for (int i = 0; i < times; i++) {
        memcpy(out + (size_t)i * len, s, len);
    }
    out[total] = '\0';
    return out;
}

int main(void) {
    char *a = repeat("ab", 3);
    char *b = repeat("-", 5);
    if (a == NULL || b == NULL) {
        printf("пам'яті немає\n");
        free(a);
        free(b);
        return 0;
    }
    printf("%s (%zu)\n", a, strlen(a));
    printf("%s (%zu)\n", b, strlen(b));
    free(a);
    free(b);
    return 0;
}
`,
  "c-vec-push": raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
} Vec;

int vec_push(Vec *v, int x) {
    if (v->len == v->cap) {
        size_t cap = v->cap == 0 ? 2 : v->cap * 2;
        int *tmp = realloc(v->data, cap * sizeof *tmp);
        if (tmp == NULL) {
            return 0;
        }
        v->data = tmp;
        v->cap = cap;
    }
    v->data[v->len++] = x;
    return 1;
}

int main(void) {
    Vec v = {NULL, 0, 0};
    for (int i = 1; i <= 10; i++) {
        if (!vec_push(&v, i)) {
            printf("пам'яті немає\n");
            free(v.data);
            return 1;
        }
    }
    long sum = 0;
    for (size_t i = 0; i < v.len; i++) {
        sum += v.data[i];
    }
    printf("len=%zu cap=%zu\n", v.len, v.cap);
    printf("sum=%ld\n", sum);
    free(v.data);
    return 0;
}
`,
  "c-join-words": raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *join(const char **words, size_t n, char sep) {
    size_t total = 0;
    for (size_t i = 0; i < n; i++) {
        total += strlen(words[i]);
    }
    if (n > 1) {
        total += n - 1;
    }
    char *out = malloc(total + 1);
    if (out == NULL) {
        return NULL;
    }
    char *w = out;
    for (size_t i = 0; i < n; i++) {
        if (i > 0) {
            *w++ = sep;
        }
        size_t len = strlen(words[i]);
        memcpy(w, words[i], len);
        w += len;
    }
    *w = '\0';
    return out;
}

int main(void) {
    const char *words[] = {"ala", "ma", "kota"};
    char *a = join(words, 3, '_');
    char *b = join(words, 0, '_');
    if (a == NULL || b == NULL) {
        printf("пам'яті немає\n");
        free(a);
        free(b);
        return 0;
    }
    printf("[%s]\n", a);
    printf("[%s]\n", b);
    free(a);
    free(b);
    return 0;
}
`,
  "c-safe-release": raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *make_name(const char *s) {
    char *out = malloc(strlen(s) + 1);
    if (out != NULL) {
        strcpy(out, s);
    }
    return out;
}

void release(char **pp) {
    free(*pp);
    *pp = NULL;
}

int main(void) {
    char *name = make_name("Ada");
    if (name == NULL) {
        return 1;
    }
    printf("ім'я: %s\n", name);
    release(&name);
    printf("після release: %s\n", name == NULL ? "NULL" : "не NULL");
    release(&name);
    printf("повторний release безпечний\n");
    return 0;
}
`,
  "c-static-ticket": raw`#include <stdio.h>
#include <stdlib.h>

int next_ticket(void) {
    static int n = 0;
    n++;
    return n;
}

char *ticket_text(int n) {
    char *s = malloc(16);
    if (s == NULL) {
        return NULL;
    }
    snprintf(s, 16, "T-%03d", n);
    return s;
}

int main(void) {
    for (int i = 0; i < 3; i++) {
        char *t = ticket_text(next_ticket());
        if (t == NULL) {
            printf("немає тексту\n");
            continue;
        }
        printf("%s\n", t);
        free(t);
    }
    return 0;
}
`,
  "c-qsort-people": raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    const char *name;
    int age;
} Person;

int cmp_person(const void *a, const void *b) {
    const Person *x = a;
    const Person *y = b;
    if (x->age != y->age) {
        return (x->age < y->age) - (x->age > y->age);
    }
    return strcmp(x->name, y->name);
}

int main(void) {
    Person people[] = {{"Olya", 25}, {"Bohdan", 31}, {"Anna", 25}, {"Dmytro", 19}, {"Eva", 31}};
    size_t n = sizeof people / sizeof people[0];
    qsort(people, n, sizeof people[0], cmp_person);
    for (size_t i = 0; i < n; i++) {
        printf("%s %d\n", people[i].name, people[i].age);
    }
    return 0;
}
`,
  "c-generic-swap": raw`#include <stdio.h>
#include <stddef.h>

void swap_any(void *a, void *b, size_t size) {
    unsigned char *x = a;
    unsigned char *y = b;
    for (size_t i = 0; i < size; i++) {
        unsigned char tmp = x[i];
        x[i] = y[i];
        y[i] = tmp;
    }
}

int main(void) {
    int x = 3, y = 7;
    double p = 1.25, q = 2.5;
    const char *s = "Anna", *t = "Olya";
    swap_any(&x, &y, sizeof x);
    swap_any(&p, &q, sizeof p);
    swap_any(&s, &t, sizeof s);
    printf("%d %d\n", x, y);
    printf("%.2f %.2f\n", p, q);
    printf("%s %s\n", s, t);
    return 0;
}
`,
  "c-memmove-shift": raw`#include <stdio.h>
#include <string.h>

size_t insert_at(int *a, size_t len, size_t pos, int value) {
    memmove(a + pos + 1, a + pos, (len - pos) * sizeof a[0]);
    a[pos] = value;
    return len + 1;
}

size_t remove_at(int *a, size_t len, size_t pos) {
    memmove(a + pos, a + pos + 1, (len - pos - 1) * sizeof a[0]);
    return len - 1;
}

void show(const int *a, size_t len) {
    for (size_t i = 0; i < len; i++) {
        printf("%d%c", a[i], i + 1 < len ? ' ' : '\n');
    }
}

int main(void) {
    int a[8] = {1, 2, 3, 4, 5};
    size_t len = 5;
    len = insert_at(a, len, 2, 99);
    show(a, len);
    len = remove_at(a, len, 2);
    show(a, len);
    return 0;
}
`,
  "c-struct-reorder": raw`#include <stdio.h>
#include <stddef.h>
#include <assert.h>

typedef struct {
    char flag;
    double value;
    short id;
    char tag;
} RecordLoose;

typedef struct {
    double value;
    short id;
    char flag;
    char tag;
} Record;

static_assert(_Alignof(double) == 8 && sizeof(short) == 2, "очікуємо типову платформу");

int main(void) {
    printf("Record менший: %d\n", sizeof(Record) < sizeof(RecordLoose));
    printf("value на початку: %d\n", offsetof(Record, value) == 0);
    printf("розмір кратний вирівнюванню: %d\n", sizeof(Record) % _Alignof(Record) == 0);
    return 0;
}
`,
  "c-debug-log": raw`#include <stdio.h>
#include <assert.h>

#ifndef DEBUG
#define DEBUG 1
#endif

#define LOG(...) do { if (DEBUG) fprintf(stderr, __VA_ARGS__); } while (0)

int sum_to(int n) {
    assert(n >= 0);
    int s = 0;
    for (int i = 1; i <= n; i++) {
        s += i;
        LOG("i=%d s=%d\n", i, s);
    }
    return s;
}

int main(void) {
    printf("sum=%d\n", sum_to(5));
    printf("sum=%d\n", sum_to(0));
    return 0;
}
`,
};
