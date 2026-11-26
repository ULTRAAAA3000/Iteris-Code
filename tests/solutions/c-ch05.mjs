// Еталонні рішення завдань C, глава 05 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_05 = {
  "c-struct-copy": raw`#include <stdio.h>
#include <string.h>

struct Student {
    char name[16];
    int grade;
    double avg;
};

struct Student make_student(const char *name, int grade, double avg) {
    struct Student s = {0};
    snprintf(s.name, sizeof s.name, "%s", name);
    s.grade = grade;
    s.avg = avg;
    return s;
}

struct Student promoted(struct Student s) {
    s.grade++;
    return s;
}

void show(struct Student s) {
    printf("%s %d %.1f\n", s.name, s.grade, s.avg);
}

int main(void) {
    struct Student a = make_student("Olena", 9, 10.5);
    struct Student b = promoted(a);
    show(a);
    show(b);
    return 0;
}
`,
  "c-nested-rect": raw`#include <stdio.h>

typedef struct {
    int x;
    int y;
} Point;

typedef struct {
    Point min;
    Point max;
} Rect;

int rect_area(Rect r) {
    return (r.max.x - r.min.x) * (r.max.y - r.min.y);
}

int rect_contains(Rect r, Point p) {
    return p.x >= r.min.x && p.x <= r.max.x && p.y >= r.min.y && p.y <= r.max.y;
}

Rect rect_shift(Rect r, int dx, int dy) {
    r.min.x += dx;
    r.max.x += dx;
    r.min.y += dy;
    r.max.y += dy;
    return r;
}

int main(void) {
    Rect r = {{1, 1}, {5, 4}};
    Point in = {3, 2};
    Point out = {6, 2};
    Rect m = rect_shift(r, 2, 3);
    printf("площа: %d\n", rect_area(r));
    printf("всередині: %d %d\n", rect_contains(r, in), rect_contains(r, out));
    printf("зсунутий: (%d,%d)-(%d,%d)\n", m.min.x, m.min.y, m.max.x, m.max.y);
    return 0;
}
`,
  "c-struct-pointers": raw`#include <stdio.h>

typedef struct {
    int id;
    long balance;
} Account;

void deposit(Account *a, long sum) {
    a->balance += sum;
}

int withdraw(Account *a, long sum) {
    if (sum > a->balance) {
        return 0;
    }
    a->balance -= sum;
    return 1;
}

Account *richest(Account *list, size_t n) {
    if (n == 0) {
        return NULL;
    }
    Account *best = &list[0];
    for (size_t i = 1; i < n; i++) {
        if (list[i].balance > best->balance) {
            best = &list[i];
        }
    }
    return best;
}

int main(void) {
    Account list[3] = {{1, 100}, {2, 250}, {3, 40}};
    deposit(&list[2], 300);
    int ok = withdraw(&list[0], 500);
    printf("зняття 500: %d, баланс %ld\n", ok, list[0].balance);
    ok = withdraw(&list[0], 60);
    printf("зняття 60: %d, баланс %ld\n", ok, list[0].balance);
    Account *top = richest(list, 3);
    if (top != NULL) {
        printf("найбагатший: %d (%ld)\n", top->id, top->balance);
    }
    return 0;
}
`,
  "c-struct-sort": raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[16];
    int price;
} Product;

static const Product TABLE[] = {{"pen", 15}, {"ink", 40}, {"book", 120}, {"tape", 15}, {"glue", 8}};

Product *load_products(size_t *count) {
    size_t n = sizeof TABLE / sizeof TABLE[0];
    Product *items = malloc(n * sizeof *items);
    if (items == NULL) {
        *count = 0;
        return NULL;
    }
    for (size_t i = 0; i < n; i++) {
        items[i] = TABLE[i];
    }
    *count = n;
    return items;
}

int cmp_price(const void *a, const void *b) {
    const Product *x = a;
    const Product *y = b;
    if (x->price != y->price) {
        return (x->price > y->price) - (x->price < y->price);
    }
    return strcmp(x->name, y->name);
}

int main(void) {
    size_t n = 0;
    Product *items = load_products(&n);
    if (items == NULL) {
        printf("немає даних\n");
        return 0;
    }
    qsort(items, n, sizeof *items, cmp_price);
    for (size_t i = 0; i < n; i++) {
        printf("%s %d\n", items[i].name, items[i].price);
    }
    free(items);
    return 0;
}
`,
  "c-enum-names": raw`#include <stdio.h>

enum Light { LIGHT_RED, LIGHT_GREEN, LIGHT_YELLOW, LIGHT_COUNT };

const char *light_name(enum Light l) {
    switch (l) {
    case LIGHT_RED:
        return "червоний";
    case LIGHT_GREEN:
        return "зелений";
    case LIGHT_YELLOW:
        return "жовтий";
    case LIGHT_COUNT:
        break;
    }
    return "?";
}

enum Light next_light(enum Light l) {
    return (enum Light)((l + 1) % LIGHT_COUNT);
}

int main(void) {
    enum Light l = LIGHT_RED;
    for (int i = 0; i < LIGHT_COUNT + 1; i++) {
        printf("%d %s\n", (int)l, light_name(l));
        l = next_light(l);
    }
    return 0;
}
`,
  "c-tagged-value": raw`#include <stdio.h>
#include <string.h>

typedef enum { KIND_INT, KIND_DOUBLE, KIND_STR } Kind;

typedef struct {
    Kind kind;
    union {
        int i;
        double d;
        const char *s;
    } as;
} Value;

Value make_int(int i) {
    Value v = {.kind = KIND_INT, .as.i = i};
    return v;
}

Value make_double(double d) {
    Value v = {.kind = KIND_DOUBLE, .as.d = d};
    return v;
}

Value make_str(const char *s) {
    Value v = {.kind = KIND_STR, .as.s = s};
    return v;
}

void print_value(Value v) {
    switch (v.kind) {
    case KIND_INT:
        printf("int:%d\n", v.as.i);
        break;
    case KIND_DOUBLE:
        printf("double:%.2f\n", v.as.d);
        break;
    case KIND_STR:
        printf("str:%s\n", v.as.s);
        break;
    }
}

double as_number(Value v) {
    switch (v.kind) {
    case KIND_INT:
        return v.as.i;
    case KIND_DOUBLE:
        return v.as.d;
    case KIND_STR:
        return (double)strlen(v.as.s);
    }
    return 0;
}

int main(void) {
    Value list[] = {make_int(42), make_double(2.5), make_str("hello")};
    double total = 0;
    for (size_t i = 0; i < sizeof list / sizeof list[0]; i++) {
        print_value(list[i]);
        total += as_number(list[i]);
    }
    printf("сума: %.1f\n", total);
    return 0;
}
`,
  "c-library-records": raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef enum { G_NOVEL, G_SCIENCE, G_POETRY, G_COUNT } Genre;

static const char *const GENRE_NAMES[G_COUNT] = {
    [G_NOVEL] = "novel",
    [G_SCIENCE] = "science",
    [G_POETRY] = "poetry",
};

typedef struct {
    int id;
    char title[16];
    int year;
    int copies;
    Genre genre;
} Book;

typedef struct {
    Book *data;
    size_t len;
    size_t cap;
} Library;

int parse_genre(const char *s, Genre *out) {
    for (int g = 0; g < G_COUNT; g++) {
        if (strcmp(s, GENRE_NAMES[g]) == 0) {
            *out = (Genre)g;
            return 1;
        }
    }
    return 0;
}

int library_push(Library *lib, Book b) {
    if (lib->len == lib->cap) {
        size_t cap = lib->cap == 0 ? 4 : lib->cap * 2;
        Book *bigger = realloc(lib->data, cap * sizeof *bigger);
        if (bigger == NULL) {
            return 0;
        }
        lib->data = bigger;
        lib->cap = cap;
    }
    lib->data[lib->len++] = b;
    return 1;
}

int parse_book(const char *line, Book *out) {
    Book tmp;
    char genre[16];
    if (sscanf(line, "%d %15s %d %d %15s", &tmp.id, tmp.title, &tmp.year, &tmp.copies, genre) != 5) {
        return 0;
    }
    if (tmp.year < 1450 || tmp.year > 2100 || tmp.copies < 0 || !parse_genre(genre, &tmp.genre)) {
        return 0;
    }
    *out = tmp;
    return 1;
}

int cmp_book(const void *a, const void *b) {
    const Book *x = a;
    const Book *y = b;
    if (x->year != y->year) {
        return (x->year > y->year) - (x->year < y->year);
    }
    return (x->id > y->id) - (x->id < y->id);
}

int count_copies(const Library *lib, Genre g) {
    int total = 0;
    for (size_t i = 0; i < lib->len; i++) {
        if (lib->data[i].genre == g) {
            total += lib->data[i].copies;
        }
    }
    return total;
}

int lend(Library *lib, int id) {
    for (size_t i = 0; i < lib->len; i++) {
        if (lib->data[i].id == id) {
            if (lib->data[i].copies > 0) {
                lib->data[i].copies--;
                return 1;
            }
            return 0;
        }
    }
    return 0;
}

int main(void) {
    const char *text =
        "1 dune 1965 3 novel\n"
        "2 cosmos 1980 2 science\n"
        "3 kobzar 1840 5 poetry\n"
        "bad line\n"
        "4 emma 1815 0 novel\n"
        "5 atlas 1000 2 science\n"
        "6 origin 1859 4 science\n"
        "7 odes 1820 1 poetry\n";
    Library lib = {0};
    int rejected = 0;
    const char *p = text;
    while (*p != '\0') {
        const char *end = strchr(p, '\n');
        size_t n = end != NULL ? (size_t)(end - p) : strlen(p);
        char line[64];
        snprintf(line, sizeof line, "%.*s", (int)n, p);
        p += n;
        if (*p == '\n') {
            p++;
        }
        Book b;
        if (parse_book(line, &b) && library_push(&lib, b)) {
            continue;
        }
        rejected++;
    }
    printf("прийнято: %zu, відхилено: %d\n", lib.len, rejected);
    if (lib.len > 1) {
        qsort(lib.data, lib.len, sizeof *lib.data, cmp_book);
    }
    for (size_t i = 0; i < lib.len; i++) {
        printf("%d %s\n", lib.data[i].year, lib.data[i].title);
    }
    for (int g = 0; g < G_COUNT; g++) {
        printf("%s: %d\n", GENRE_NAMES[g], count_copies(&lib, (Genre)g));
    }
    printf("видати emma: %d\n", lend(&lib, 4));
    printf("видати odes: %d\n", lend(&lib, 7));
    printf("видати 42: %d\n", lend(&lib, 42));
    printf("poetry після видачі: %d\n", count_copies(&lib, G_POETRY));
    free(lib.data);
    return 0;
}
`,
  "c-bitfield-stamps": raw`#include <assert.h>
#include <stdio.h>
#include <stdlib.h>

struct Stamp {
    unsigned day : 5;
    unsigned month : 4;
    unsigned year : 7;
};

struct Stamp make_stamp(int year, int month, int day) {
    struct Stamp s = {0};
    s.year = (unsigned)(year - 2000);
    s.month = (unsigned)month;
    s.day = (unsigned)day;
    return s;
}

int stamp_cmp(const void *a, const void *b) {
    const struct Stamp *x = a;
    const struct Stamp *y = b;
    if (x->year != y->year) {
        return x->year < y->year ? -1 : 1;
    }
    if (x->month != y->month) {
        return x->month < y->month ? -1 : 1;
    }
    if (x->day != y->day) {
        return x->day < y->day ? -1 : 1;
    }
    return 0;
}

void set_month(struct Stamp *s, unsigned m) {
    s->month = m;
}

int main(void) {
    struct Stamp list[] = {make_stamp(2025, 11, 22), make_stamp(2024, 3, 5), make_stamp(2025, 2, 28), make_stamp(2024, 3, 1)};
    size_t n = sizeof list / sizeof list[0];
    qsort(list, n, sizeof list[0], stamp_cmp);
    for (size_t i = 0; i < n; i++) {
        printf("%d-%02d-%02d\n", 2000 + list[i].year, list[i].month, list[i].day);
    }
    set_month(&list[0], 17);
    printf("місяць після set_month(17): %d\n", list[0].month);
    printf("вміщається в unsigned: %d\n", sizeof(struct Stamp) <= sizeof(unsigned));
    return 0;
}
`,
  "c-flex-str": raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    size_t len;
    char data[];
} Str;

Str *str_new(const char *s) {
    size_t n = strlen(s);
    Str *r = malloc(sizeof *r + n + 1);
    if (r == NULL) {
        return NULL;
    }
    r->len = n;
    memcpy(r->data, s, n + 1);
    return r;
}

Str *str_concat(const Str *a, const Str *b) {
    size_t n = a->len + b->len;
    Str *r = malloc(sizeof *r + n + 1);
    if (r == NULL) {
        return NULL;
    }
    r->len = n;
    memcpy(r->data, a->data, a->len);
    memcpy(r->data + a->len, b->data, b->len + 1);
    return r;
}

size_t str_count(const Str *s, char c) {
    size_t k = 0;
    for (size_t i = 0; i < s->len; i++) {
        if (s->data[i] == c) {
            k++;
        }
    }
    return k;
}

int main(void) {
    Str *a = str_new("flex");
    Str *b = str_new("ible");
    Str *c = a != NULL && b != NULL ? str_concat(a, b) : NULL;
    if (c == NULL) {
        printf("помилка\n");
    } else {
        printf("%s %zu\n", c->data, c->len);
        printf("літера e: %zu\n", str_count(c, 'e'));
        printf("один блок: %d\n", sizeof(Str) == sizeof(size_t));
    }
    free(a);
    free(b);
    free(c);
    return 0;
}
`,
};
