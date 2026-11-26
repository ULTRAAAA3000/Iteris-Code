// Еталонні рішення завдань C, глава 08 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_08 = {
  "c-tmpfile-copy": raw`#include <stdio.h>

static long copy(FILE *from, FILE *to) {
    long n = 0;
    int c;
    while ((c = fgetc(from)) != EOF) {
        fputc(c, to);
        n++;
    }
    return n;
}

int main(void) {
    FILE *src = tmpfile();
    FILE *dst = tmpfile();
    if (src == NULL || dst == NULL) {
        return 1;
    }
    fputs("Iteris Code\nC11 files\n", src);
    rewind(src);
    long n = copy(src, dst);
    printf("скопійовано: %ld\n", n);
    rewind(dst);
    int c;
    while ((c = fgetc(dst)) != EOF) {
        putchar(c);
    }
    fclose(src);
    fclose(dst);
    return 0;
}
`,
  "c-fgets-scores": raw`#include <stdio.h>

static void read_scores(FILE *f, int *sum, int *count) {
    char line[64];
    char name[32];
    int score;
    int lineno = 0;
    *sum = 0;
    *count = 0;
    while (fgets(line, sizeof line, f) != NULL) {
        lineno++;
        if (sscanf(line, "%31s %d", name, &score) == 2) {
            printf("%s: %d\n", name, score);
            *sum += score;
            (*count)++;
        } else {
            printf("рядок %d пропущено\n", lineno);
        }
    }
}

int main(void) {
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    fprintf(f, "%s %d\n", "Оля", 90);
    fprintf(f, "%s %d\n", "Іван", 75);
    fputs("Тарас abc\n", f);
    fprintf(f, "%s %d\n", "Марія", 88);
    rewind(f);
    int sum, count;
    read_scores(f, &sum, &count);
    printf("сума: %d, середнє: %d\n", sum, count ? sum / count : 0);
    fclose(f);
    return 0;
}
`,
  "c-records-seek": raw`#include <stdint.h>
#include <stdio.h>

struct rec {
    int32_t id;
    int32_t score;
};

static long count_records(FILE *f) {
    if (fseek(f, 0, SEEK_END) != 0) {
        return 0;
    }
    long size = ftell(f);
    return size / (long)sizeof(struct rec);
}

static int read_at(FILE *f, long i, struct rec *r) {
    if (fseek(f, i * (long)sizeof(struct rec), SEEK_SET) != 0) {
        return 0;
    }
    return fread(r, sizeof *r, 1, f) == 1;
}

static int write_at(FILE *f, long i, const struct rec *r) {
    if (fseek(f, i * (long)sizeof(struct rec), SEEK_SET) != 0) {
        return 0;
    }
    return fwrite(r, sizeof *r, 1, f) == 1;
}

int main(void) {
    struct rec all[4] = {{10, 50}, {20, 60}, {30, 70}, {40, 80}};
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    fwrite(all, sizeof all[0], 4, f);
    printf("записів: %ld\n", count_records(f));
    struct rec r = {0, 0};
    if (read_at(f, 2, &r)) {
        printf("запис 2: id=%d score=%d\n", (int)r.id, (int)r.score);
    }
    r.score = 100;
    if (write_at(f, 2, &r)) {
        printf("оновлено: id=%d score=%d\n", (int)r.id, (int)r.score);
    }
    long sum = 0;
    for (long i = 0; i < count_records(f); i++) {
        if (read_at(f, i, &r)) {
            sum += r.score;
        }
    }
    printf("сума балів: %ld\n", sum);
    fclose(f);
    return 0;
}
`,
  "c-exit-atexit": raw`#include <stdio.h>
#include <stdlib.h>

static void close_log(void) {
    puts("очищення: журнал");
}

static void free_pool(void) {
    puts("очищення: пул");
}

static long parse(const char *s, int *ok) {
    char *end;
    long v = strtol(s, &end, 0);
    *ok = end != s && *end == '\0';
    return v;
}

static void finish(long sum) {
    printf("сума: %ld\n", sum);
    exit(EXIT_SUCCESS);
}

int main(void) {
    atexit(close_log);
    atexit(free_pool);
    const char *items[] = {"10", "0x1F", "017", "bad"};
    long sum = 0;
    for (int i = 0; i < 4; i++) {
        int ok;
        long v = parse(items[i], &ok);
        if (ok) {
            printf("%s -> %ld\n", items[i], v);
            sum += v;
        } else {
            printf("%s -> пропущено\n", items[i]);
        }
    }
    finish(sum);
    return 0;
}
`,
  "c-math-geometry": raw`#include <math.h>
#include <stdio.h>

static double dist(double ax, double ay, double bx, double by) {
    double dx = bx - ax;
    double dy = by - ay;
    return sqrt(dx * dx + dy * dy);
}

static double circle_area(double r) {
    return acos(-1) * r * r;
}

static double round2(double x) {
    return round(x * 100) / 100;
}

int main(void) {
    printf("відстань: %.2f\n", dist(0, 0, 3, 4));
    printf("площа кола: %.2f\n", circle_area(2));
    printf("гіпотенуза: %.2f\n", hypot(5, 12));
    printf("округлено: %.2f\n", round2(3.14159));
    printf("стеля: %.0f, підлога: %.0f\n", ceil(7.2), floor(-7.2));
    return 0;
}
`,
  "c-ctype-stats": raw`#include <ctype.h>
#include <stdio.h>

struct stats {
    int letters;
    int digits;
    int spaces;
    int upper;
    int punct;
};

static struct stats count(const char *s) {
    struct stats st = {0, 0, 0, 0, 0};
    for (; *s != '\0'; s++) {
        unsigned char c = (unsigned char)*s;
        if (isalpha(c)) {
            st.letters++;
        }
        if (isdigit(c)) {
            st.digits++;
        }
        if (isspace(c)) {
            st.spaces++;
        }
        if (isupper(c)) {
            st.upper++;
        }
        if (ispunct(c)) {
            st.punct++;
        }
    }
    return st;
}

static void capitalize(char *s) {
    int start = 1;
    for (; *s != '\0'; s++) {
        unsigned char c = (unsigned char)*s;
        if (isspace(c)) {
            start = 1;
        } else {
            if (start && isalpha(c)) {
                *s = (char)toupper(c);
            }
            start = 0;
        }
    }
}

int main(void) {
    char text[] = "learn C: 11 lessons, 7 labs!";
    struct stats st = count(text);
    printf("літер: %d, цифр: %d, пробілів: %d, великих: %d, розділових: %d\n", st.letters, st.digits, st.spaces, st.upper, st.punct);
    capitalize(text);
    printf("%s\n", text);
    return 0;
}
`,
  "c-days-epoch": raw`#include <stdio.h>
#include <time.h>

static long days_from_civil(int y, int m, int d) {
    y -= m <= 2;
    long era = (y >= 0 ? y : y - 399) / 400;
    long yoe = y - era * 400;
    long doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
    long doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    return era * 146097 + doe - 719468;
}

static int weekday(long days) {
    return (int)(((days % 7) + 7 + 4) % 7);
}

int main(void) {
    static const char *names[] = {"неділя", "понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота"};
    long a = days_from_civil(2001, 9, 9);
    long b = days_from_civil(1970, 1, 1);
    printf("2001-09-09: %ld днів, %s\n", a, names[weekday(a)]);
    printf("1970-01-01: %ld днів, %s\n", b, names[weekday(b)]);
    time_t t1 = (time_t)days_from_civil(1999, 12, 31) * 86400;
    time_t t2 = (time_t)days_from_civil(2000, 3, 1) * 86400;
    printf("різниця: %.0f днів\n", difftime(t2, t1) / 86400);
    time_t t = (time_t)(a * 86400);
    struct tm *g = gmtime(&t);
    printf("перевірка gmtime: %04d-%02d-%02d\n", g->tm_year + 1900, g->tm_mon + 1, g->tm_mday);
    return 0;
}
`,
  "c-limits-safe": raw`#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>

static int add_checked(int32_t a, int32_t b, int32_t *out) {
    if (b > 0 && a > INT32_MAX - b) {
        return 0;
    }
    if (b < 0 && a < INT32_MIN - b) {
        return 0;
    }
    *out = a + b;
    return 1;
}

static int clamp_u8(int v) {
    if (v < 0) {
        return 0;
    }
    if (v > 255) {
        return 255;
    }
    return v;
}

int main(void) {
    int32_t r = 0;
    if (add_checked(100, 200, &r)) {
        printf("100 + 200 = %" PRId32 "\n", r);
    } else {
        printf("100 + 200: переповнення\n");
    }
    if (add_checked(INT32_MAX, 1, &r)) {
        printf("INT32_MAX + 1 = %" PRId32 "\n", r);
    } else {
        printf("INT32_MAX + 1: переповнення\n");
    }
    if (add_checked(INT32_MIN, -1, &r)) {
        printf("INT32_MIN - 1 = %" PRId32 "\n", r);
    } else {
        printf("INT32_MIN - 1: переповнення\n");
    }
    printf("-5 -> %d, 300 -> %d, 77 -> %d\n", clamp_u8(-5), clamp_u8(300), clamp_u8(77));
    uint8_t u = 255;
    u++;
    printf("255 + 1 у uint8_t = %d\n", u);
    return 0;
}
`,
  "c-rand-props": raw`#include <stdio.h>
#include <stdlib.h>

static int roll(void) {
    return 1 + rand() % 6;
}

static void shuffle(int *a, int n) {
    for (int i = n - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        int tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
}

static int is_perm(const int *a, int n) {
    int seen[16] = {0};
    for (int i = 0; i < n; i++) {
        if (a[i] < 0 || a[i] >= n) {
            return 0;
        }
        seen[a[i]]++;
    }
    for (int i = 0; i < n; i++) {
        if (seen[i] != 1) {
            return 0;
        }
    }
    return 1;
}

int main(void) {
    srand(42);
    int counts[7] = {0};
    int in_range = 1;
    for (int i = 0; i < 1000; i++) {
        int r = roll();
        if (r < 1 || r > 6) {
            in_range = 0;
            continue;
        }
        counts[r]++;
    }
    int faces = 1;
    for (int f = 1; f <= 6; f++) {
        if (counts[f] == 0) {
            faces = 0;
        }
    }
    printf("кидків: 1000\n");
    printf("усі в межах 1..6: %s\n", in_range ? "так" : "ні");
    printf("кожна грань випала: %s\n", faces ? "так" : "ні");
    int first[20];
    srand(5);
    for (int i = 0; i < 20; i++) {
        first[i] = roll();
    }
    srand(5);
    int same = 1;
    for (int i = 0; i < 20; i++) {
        if (roll() != first[i]) {
            same = 0;
        }
    }
    printf("повтор із тим самим зерном: %s\n", same ? "однаково" : "по-різному");
    int p[10];
    for (int i = 0; i < 10; i++) {
        p[i] = i;
    }
    srand(11);
    shuffle(p, 10);
    printf("перемішування дало перестановку: %s\n", is_perm(p, 10) ? "так" : "ні");
    return 0;
}
`,
  "c-vararg-tools": raw`#include <stdarg.h>
#include <stdio.h>

static int maxi(int n, ...) {
    va_list ap;
    va_start(ap, n);
    int best = va_arg(ap, int);
    for (int i = 1; i < n; i++) {
        int v = va_arg(ap, int);
        if (v > best) {
            best = v;
        }
    }
    va_end(ap);
    return best;
}

static double average(int n, ...) {
    va_list ap;
    va_start(ap, n);
    double total = 0;
    for (int i = 0; i < n; i++) {
        total += va_arg(ap, double);
    }
    va_end(ap);
    return n > 0 ? total / n : 0;
}

static void join(char *out, size_t cap, const char *sep, ...) {
    va_list ap;
    va_start(ap, sep);
    size_t len = 0;
    int first = 1;
    const char *s;
    if (cap > 0) {
        out[0] = '\0';
    }
    while (cap > 0 && (s = va_arg(ap, const char *)) != NULL) {
        int n = snprintf(out + len, cap - len, "%s%s", first ? "" : sep, s);
        if (n < 0 || (size_t)n >= cap - len) {
            break;
        }
        len += (size_t)n;
        first = 0;
    }
    va_end(ap);
}

int main(void) {
    printf("max: %d\n", maxi(4, 3, 9, 2, 7));
    printf("середнє: %.2f\n", average(4, 1.0, 2.0, 3.0, 4.0));
    char buf[32];
    join(buf, sizeof buf, "-", "a", "b", "c", (char *)NULL);
    printf("рядок: %s\n", buf);
    return 0;
}
`,
  "c-signal-flag": raw`#include <signal.h>
#include <stdio.h>

static volatile sig_atomic_t stop = 0;

static void on_signal(int sig) {
    (void)sig;
    stop = 1;
}

static int install(void) {
    return signal(SIGINT, on_signal) != SIG_ERR;
}

int main(void) {
    if (!install()) {
        return 1;
    }
    int done = 0;
    for (int i = 1; i <= 5 && !stop; i++) {
        printf("крок %d\n", i);
        done++;
        if (i == 3) {
            raise(SIGINT);
        }
    }
    printf("сигнал отримано: %s\n", stop ? "так" : "ні");
    printf("оброблено кроків: %d\n", done);
    signal(SIGINT, SIG_IGN);
    raise(SIGINT);
    printf("під SIG_IGN програма жива\n");
    void (*prev)(int) = signal(SIGINT, on_signal);
    printf("попередній обробник був SIG_IGN: %s\n", prev == SIG_IGN ? "так" : "ні");
    signal(SIGINT, SIG_DFL);
    return 0;
}
`,
  "c-locale-utf8": raw`#include <stdio.h>
#include <string.h>
#include <uchar.h>

static size_t utf8_len(const char *s) {
    size_t n = 0;
    for (; *s != '\0'; s++) {
        if (((unsigned char)*s & 0xC0) != 0x80) {
            n++;
        }
    }
    return n;
}

int main(void) {
    const char *text = "Привіт, C!";
    const char32_t *wide = U"Привіт, C!";
    size_t wide_len = 0;
    while (wide[wide_len] != 0) {
        wide_len++;
    }
    size_t chars = utf8_len(text);
    printf("байтів: %zu\n", strlen(text));
    printf("символів: %zu\n", chars);
    printf("збіг із char32_t: %s\n", chars == wide_len ? "так" : "ні");
    return 0;
}
`,
  "c-threads-sum": raw`#include <stdio.h>
#include <threads.h>

struct job {
    const int *data;
    int from;
    int to;
    long sum;
};

static mtx_t lock;
static int counter = 0;

static int worker(void *arg) {
    struct job *j = arg;
    for (int i = j->from; i < j->to; i++) {
        j->sum += j->data[i];
    }
    for (int i = 0; i < 1000; i++) {
        mtx_lock(&lock);
        counter++;
        mtx_unlock(&lock);
    }
    return 0;
}

int main(void) {
    int data[100];
    for (int i = 0; i < 100; i++) {
        data[i] = i + 1;
    }
    struct job jobs[4];
    thrd_t th[4];
    if (mtx_init(&lock, mtx_plain) != thrd_success) {
        return 1;
    }
    for (int k = 0; k < 4; k++) {
        jobs[k] = (struct job){data, k * 25, (k + 1) * 25, 0};
        if (thrd_create(&th[k], worker, &jobs[k]) != thrd_success) {
            return 1;
        }
    }
    long total = 0;
    for (int k = 0; k < 4; k++) {
        thrd_join(th[k], NULL);
        total += jobs[k].sum;
    }
    mtx_destroy(&lock);
    printf("сума 1..100: %ld\n", total);
    printf("лічильник: %d\n", counter);
    return 0;
}
`,
};
