// Еталонні рішення завдань C, глава 11 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_11 = {
  "c-args-parse": raw`#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int verbose;
    long count;
    const char *name;
    int files;
} Opts;

int parse_args(int argc, char **argv, Opts *o) {
    o->verbose = 0;
    o->count = 1;
    o->name = getenv("ITERIS_NAME");
    if (o->name == NULL) {
        o->name = "anon";
    }
    o->files = 0;
    for (int i = 1; i < argc; i++) {
        const char *a = argv[i];
        if (strcmp(a, "-v") == 0) {
            o->verbose = 1;
        } else if (strcmp(a, "-n") == 0) {
            if (i + 1 >= argc) {
                return -1;
            }
            char *end;
            errno = 0;
            long v = strtol(argv[++i], &end, 10);
            if (errno != 0 || end == argv[i] || *end != '\0') {
                return -1;
            }
            o->count = v;
        } else if (strncmp(a, "--name=", 7) == 0) {
            o->name = a + 7;
        } else {
            o->files++;
        }
    }
    return 0;
}

static void show(int argc, char **argv) {
    Opts o = {0, 0, "?", 0};
    if (parse_args(argc, argv, &o) != 0) {
        printf("помилка в аргументах\n");
        return;
    }
    printf("verbose=%d count=%ld name=%s files=%d\n", o.verbose, o.count, o.name, o.files);
}

int main(void) {
    setenv("ITERIS_NAME", "env-name", 1);
    char *a[] = {"prog", "-v", "-n", "3", "--name=cli", "a.txt", "b.txt", NULL};
    show(7, a);
    char *b[] = {"prog", "a.txt", NULL};
    show(2, b);
    char *c[] = {"prog", "-n", "x", NULL};
    show(3, c);
    return 0;
}
`,
  "c-buffer-log": raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <sys/stat.h>

FILE *open_log(void) {
    FILE *f = tmpfile();
    if (f != NULL) {
        setvbuf(f, NULL, _IOFBF, 4096);
    }
    return f;
}

long on_disk(FILE *f) {
    struct stat st;
    if (fstat(fileno(f), &st) != 0) {
        return -1;
    }
    return (long)st.st_size;
}

void log_msg(FILE *f, const char *msg, int urgent) {
    fprintf(f, "%s\n", msg);
    if (urgent) {
        fflush(f);
    }
}

int main(void) {
    FILE *f = open_log();
    if (f == NULL) {
        return 1;
    }
    log_msg(f, "start", 0);
    printf("після start: %ld\n", on_disk(f));
    log_msg(f, "ERROR: disk", 1);
    printf("після urgent: %ld\n", on_disk(f));
    fprintf(stderr, "готово\n");
    fclose(f);
    printf("stdout: ok\n");
    return 0;
}
`,
  "c-csv-parse": raw`#include <stdio.h>

static size_t parse_line(char *s, char **out, size_t max) {
    size_t n = 0;
    while (n < max) {
        char *w = s;
        out[n++] = w;
        if (*s == '"') {
            s++;
            while (*s != '\0') {
                if (*s == '"') {
                    if (s[1] == '"') {
                        *w++ = '"';
                        s += 2;
                        continue;
                    }
                    s++;
                    break;
                }
                *w++ = *s++;
            }
            while (*s != ',' && *s != '\0') {
                s++;
            }
        } else {
            while (*s != ',' && *s != '\0') {
                *w++ = *s++;
            }
        }
        char sep = *s;
        *w = '\0';
        if (sep == '\0') {
            break;
        }
        s++;
    }
    return n;
}

int main(void) {
    static const char *lines[] = {
        "a,b,c",
        "ann,,42,",
        "1,\"x, y\",\"say \"\"hi\"\"\"",
        "",
    };
    for (size_t i = 0; i < sizeof lines / sizeof lines[0]; i++) {
        char buf[64];
        snprintf(buf, sizeof buf, "%s", lines[i]);
        char *f[8];
        size_t n = parse_line(buf, f, 8);
        printf("%zu:", n);
        for (size_t j = 0; j < n; j++) {
            printf(" [%s]", f[j]);
        }
        printf("\n");
    }
    return 0;
}
`,
  "c-json-validate": raw`#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

enum { MAX_DEPTH = 32 };

static const char *value(const char *p, int depth);

static const char *skip_ws(const char *p) {
    while (*p == ' ' || *p == '\t' || *p == '\n' || *p == '\r') {
        p++;
    }
    return p;
}

static const char *string_(const char *p) {
    if (*p != '"') {
        return NULL;
    }
    p++;
    while (*p != '"') {
        if (*p == '\0' || (unsigned char)*p < 0x20) {
            return NULL;
        }
        if (*p == '\\') {
            p++;
            if (*p == '\0') {
                return NULL;
            }
        }
        p++;
    }
    return p + 1;
}

static const char *array(const char *p, int depth) {
    p = skip_ws(p + 1);
    if (*p == ']') {
        return p + 1;
    }
    for (;;) {
        p = value(p, depth + 1);
        if (p == NULL) {
            return NULL;
        }
        p = skip_ws(p);
        if (*p == ',') {
            p = skip_ws(p + 1);
            continue;
        }
        return *p == ']' ? p + 1 : NULL;
    }
}

static const char *object(const char *p, int depth) {
    p = skip_ws(p + 1);
    if (*p == '}') {
        return p + 1;
    }
    for (;;) {
        p = string_(p);
        if (p == NULL) {
            return NULL;
        }
        p = skip_ws(p);
        if (*p != ':') {
            return NULL;
        }
        p = value(p + 1, depth + 1);
        if (p == NULL) {
            return NULL;
        }
        p = skip_ws(p);
        if (*p == ',') {
            p = skip_ws(p + 1);
            continue;
        }
        return *p == '}' ? p + 1 : NULL;
    }
}

static const char *value(const char *p, int depth) {
    if (depth > MAX_DEPTH) {
        return NULL;
    }
    p = skip_ws(p);
    if (*p == '[') {
        return array(p, depth);
    }
    if (*p == '{') {
        return object(p, depth);
    }
    if (*p == '"') {
        return string_(p);
    }
    if (strncmp(p, "true", 4) == 0 || strncmp(p, "null", 4) == 0) {
        return p + 4;
    }
    if (strncmp(p, "false", 5) == 0) {
        return p + 5;
    }
    if (*p == '-' || isdigit((unsigned char)*p)) {
        char *end;
        strtod(p, &end);
        return end == p ? NULL : end;
    }
    return NULL;
}

static int valid(const char *s) {
    const char *end = value(s, 0);
    return end != NULL && *skip_ws(end) == '\0';
}

int main(void) {
    static const struct {
        const char *name;
        const char *text;
        int want;
    } docs[] = {
        {"масив", "[1, 2.5, -3e2]", 1},
        {"об'єкт", "{\"a\": [1, {\"b\": null}], \"c\": \"x\"}", 1},
        {"порожній об'єкт", "{}", 1},
        {"кома в кінці", "{\"a\":1,}", 0},
        {"без двокрапки", "{\"a\" 1}", 0},
        {"ключ не рядок", "{1:2}", 0},
        {"сміття після", "[1] x", 0},
    };
    int failed = 0;
    for (size_t i = 0; i < sizeof docs / sizeof docs[0]; i++) {
        int got = valid(docs[i].text);
        printf("%s %s\n", got == docs[i].want ? "ok  " : "FAIL", docs[i].name);
        failed += got != docs[i].want;
    }
    return failed ? 1 : 0;
}
`,
  "c-byte-order": raw`#include <stdint.h>
#include <stdio.h>

static void encode_record(uint8_t *buf, uint16_t id, uint32_t value) {
    buf[0] = (uint8_t)(id >> 8);
    buf[1] = (uint8_t)id;
    buf[2] = (uint8_t)(value >> 24);
    buf[3] = (uint8_t)(value >> 16);
    buf[4] = (uint8_t)(value >> 8);
    buf[5] = (uint8_t)value;
}

static int decode_record(const uint8_t *buf, size_t n, uint16_t *id, uint32_t *value) {
    if (n < 6) {
        return -1;
    }
    *id = (uint16_t)((uint16_t)buf[0] << 8 | buf[1]);
    *value = (uint32_t)buf[2] << 24 | (uint32_t)buf[3] << 16 | (uint32_t)buf[4] << 8 | (uint32_t)buf[5];
    return 0;
}

int main(void) {
    uint8_t buf[6] = {0};
    encode_record(buf, 0x1234, 0xDEADBEEFu);
    printf("байти:");
    for (size_t i = 0; i < sizeof buf; i++) {
        printf(" %02x", buf[i]);
    }
    printf("\n");
    uint16_t id = 0;
    uint32_t value = 0;
    if (decode_record(buf, sizeof buf, &id, &value) == 0) {
        printf("id=%u value=%u\n", (unsigned)id, (unsigned)value);
    } else {
        printf("id: помилка\n");
    }
    printf("коротке: %s\n", decode_record(buf, 5, &id, &value) == 0 ? "прийнято" : "помилка");
    return 0;
}
`,
  "c-pipe-roundtrip": raw`#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <stdio.h>
#include <unistd.h>

static int write_all(int fd, const char *buf, size_t n) {
    size_t done = 0;
    while (done < n) {
        ssize_t w = write(fd, buf + done, n - done);
        if (w < 0) {
            if (errno == EINTR) {
                continue;
            }
            return -1;
        }
        done += (size_t)w;
    }
    return 0;
}

static ssize_t read_all(int fd, char *buf, size_t cap) {
    size_t done = 0;
    while (done < cap) {
        ssize_t r = read(fd, buf + done, cap - done);
        if (r < 0) {
            if (errno == EINTR) {
                continue;
            }
            return -1;
        }
        if (r == 0) {
            break;
        }
        done += (size_t)r;
    }
    return (ssize_t)done;
}

int main(void) {
    char msg[1000];
    for (size_t i = 0; i < sizeof msg; i++) {
        msg[i] = (char)('a' + i % 26);
    }
    int fds[2];
    if (pipe(fds) != 0) {
        return 1;
    }
    int w = write_all(fds[1], msg, sizeof msg);
    close(fds[1]);
    char back[1000];
    ssize_t n = read_all(fds[0], back, sizeof back);
    close(fds[0]);
    int same = n == (ssize_t)sizeof msg;
    for (size_t i = 0; same && i < sizeof msg; i++) {
        same = msg[i] == back[i];
    }
    printf("write_all: %s\n", w == 0 ? "ok" : "помилка");
    printf("прочитано: %zd\n", n);
    printf("збіг: %s\n", same ? "так" : "ні");
    return 0;
}
`,
  "c-socket-frames": raw`#define _POSIX_C_SOURCE 200809L
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

static int send_all(int fd, const void *buf, size_t n) {
    const char *p = buf;
    while (n > 0) {
        ssize_t w = send(fd, p, n, 0);
        if (w < 0) {
            return -1;
        }
        p += w;
        n -= (size_t)w;
    }
    return 0;
}

static int send_frame(int fd, const char *s) {
    uint32_t len = (uint32_t)strlen(s);
    uint8_t hdr[4] = {(uint8_t)(len >> 24), (uint8_t)(len >> 16), (uint8_t)(len >> 8), (uint8_t)len};
    if (send_all(fd, hdr, sizeof hdr) != 0) {
        return -1;
    }
    return send_all(fd, s, len);
}

static int recv_all(int fd, void *buf, size_t n) {
    char *p = buf;
    while (n > 0) {
        ssize_t r = recv(fd, p, n, 0);
        if (r < 0) {
            return -1;
        }
        if (r == 0) {
            return 0;
        }
        p += r;
        n -= (size_t)r;
    }
    return 1;
}

static int recv_frame(int fd, char *buf, size_t cap) {
    uint8_t hdr[4];
    if (recv_all(fd, hdr, sizeof hdr) != 1) {
        return -1;
    }
    uint32_t len = (uint32_t)hdr[0] << 24 | (uint32_t)hdr[1] << 16 | (uint32_t)hdr[2] << 8 | (uint32_t)hdr[3];
    if (len >= cap) {
        return -1;
    }
    if (len > 0 && recv_all(fd, buf, len) != 1) {
        return -1;
    }
    buf[len] = '\0';
    return (int)len;
}

int main(void) {
    int sv[2];
    if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) != 0) {
        return 1;
    }
    const char *msgs[] = {"hello", "", "world!"};
    for (size_t i = 0; i < 3; i++) {
        if (send_frame(sv[0], msgs[i]) != 0) {
            return 1;
        }
    }
    for (size_t i = 0; i < 3; i++) {
        char buf[16];
        int n = recv_frame(sv[1], buf, sizeof buf);
        if (n < 0) {
            printf("кадр %zu: помилка\n", i + 1);
        } else {
            printf("кадр %zu: %d байтів [%s]\n", i + 1, n, buf);
        }
    }
    if (send_frame(sv[0], "this message is longer than sixteen bytes") != 0) {
        return 1;
    }
    char buf[16];
    printf("завеликий: %s\n", recv_frame(sv[1], buf, sizeof buf) < 0 ? "відхилено" : "прийнято");
    close(sv[0]);
    close(sv[1]);
    return 0;
}
`,
  "c-pthread-sum": raw`#include <pthread.h>
#include <stdio.h>

enum { THREADS = 4, CHUNK = 1000 };

typedef struct {
    int lo;
    int hi;
    long items;
} Job;

static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
static long total;

static void *worker(void *arg) {
    Job *job = arg;
    long local = 0;
    for (int i = job->lo; i < job->hi; i++) {
        local += i;
        job->items++;
    }
    pthread_mutex_lock(&lock);
    total += local;
    pthread_mutex_unlock(&lock);
    return NULL;
}

static int run_all(Job *jobs, int n) {
    pthread_t tid[THREADS];
    int created = 0;
    int rc = 0;
    for (int i = 0; i < n; i++) {
        if (pthread_create(&tid[i], NULL, worker, &jobs[i]) != 0) {
            rc = -1;
            break;
        }
        created++;
    }
    for (int i = 0; i < created; i++) {
        pthread_join(tid[i], NULL);
    }
    return rc;
}

int main(void) {
    Job jobs[THREADS];
    for (int i = 0; i < THREADS; i++) {
        jobs[i].lo = i * CHUNK;
        jobs[i].hi = (i + 1) * CHUNK;
        jobs[i].items = 0;
    }
    int rc = run_all(jobs, THREADS);
    long items = 0;
    for (int i = 0; i < THREADS; i++) {
        items += jobs[i].items;
    }
    printf("run_all: %s\n", rc == 0 ? "ok" : "помилка");
    printf("сума: %ld\n", total);
    printf("оброблено елементів: %ld\n", items);
    return 0;
}
`,
};
