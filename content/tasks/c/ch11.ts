// Практичні завдання глави «Системне програмування» (уроки 99–106). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_11: readonly RemoteTask[] = [
  {
    ...base, id: "c-args-parse", lesson: "c/99", xp: 35,
    title: "parse_args: прапорці, опції й змінна середовища",
    context: "Розбір аргументів є в кожній утиліті. Якщо винести його у функцію з параметрами argc і argv, його можна перевіряти без запуску програми, а значення з середовища дають розумні типові налаштування.",
    brief: [
      "Допишіть <code>parse_args</code>: <code>-v</code> вмикає <code>verbose</code>, <code>-n N</code> задає <code>count</code> (через <code>strtol</code> з перевіркою; помилка дає <code>-1</code>), <code>--name=X</code> задає ім'я, решта це файли. Типові значення: <code>count=1</code>, <code>name</code> береться з <code>getenv(\"ITERIS_NAME\")</code>, а якщо змінної немає, то <code>anon</code>.",
      "Очікуваний вивід: <code>verbose=1 count=3 name=cli files=2</code>, <code>verbose=0 count=1 name=env-name files=1</code> і <code>помилка в аргументах</code>. Змінну <code>ITERIS_NAME</code> виставляє <code>main</code>.",
    ],
    starter: raw`#define _POSIX_C_SOURCE 200809L
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
    (void)argc;
    (void)argv;
    (void)o;
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
    checks: [
      { on: "stdout", name: "Прапорці, число й ім'я з командного рядка", has: "verbose=1 count=3 name=cli files=2", hint: "-v ставить verbose=1; після -n беріть наступний аргумент і переходьте через нього; --name= має довжину 7." },
      { on: "stdout", name: "Типові значення, ім'я з середовища", has: "verbose=0 count=1 name=env-name files=1", hint: "Перед циклом задайте count=1 і name=getenv(...), а за NULL підставте anon." },
      { on: "stdout", name: "Некоректне число дає помилку", has: "помилка в аргументах", hint: "Після strtol перевірте errno, end == початок рядка і *end != '\\0' та поверніть -1." },
      { on: "stdout", name: "Весь вивід", equals: "verbose=1 count=3 name=cli files=2\nverbose=0 count=1 name=env-name files=1\nпомилка в аргументах", hint: "Три рядки в такому порядку." },
      { on: "source", name: "Число через strtol", matches: "\\bstrtol\\s*\\(", hint: "atoi не вміє повідомляти про помилку, використайте strtol." },
      { on: "source", name: "Значення за замовчуванням із getenv", matches: "\\bgetenv\\s*\\(\\s*\"ITERIS_NAME\"\\s*\\)", hint: "Прочитайте ITERIS_NAME через getenv і перевірте на NULL." },
    ],
  },
  {
    ...base, id: "c-buffer-log", lesson: "c/100", xp: 35,
    title: "Журнал із повною буферизацією й терміновим скиданням",
    context: "Журнали пишуть буферизованими, щоб не звертатися до ядра на кожен рядок, але повідомлення про помилки мають долетіти одразу. Уміти керувати цим і перевірити результат означає не втрачати найважливіші записи.",
    brief: [
      "Допишіть три функції. <code>open_log</code> створює <code>tmpfile()</code> і вмикає повну буферизацію через <code>setvbuf</code>. <code>on_disk</code> повертає розмір файлу в ядрі через <code>fstat(fileno(f), ...)</code>. <code>log_msg</code> пише рядок із <code>\\n</code> і скидає буфер через <code>fflush</code> лише для <code>urgent</code>.",
      "Очікуваний вивід: <code>після start: 0</code>, <code>після urgent: 18</code>, <code>stdout: ok</code>. Рядок у <code>stderr</code> не перевіряється.",
    ],
    starter: raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <sys/stat.h>

FILE *open_log(void) {
    return tmpfile();
}

long on_disk(FILE *f) {
    (void)f;
    return -1;
}

void log_msg(FILE *f, const char *msg, int urgent) {
    (void)f;
    (void)msg;
    (void)urgent;
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
    checks: [
      { on: "stdout", name: "Звичайний запис лишається в буфері", has: "після start: 0", hint: "У ядрі після звичайного рядка ще нічого немає: файл повністю буферизований, fflush не викликається." },
      { on: "stdout", name: "Терміновий запис скинуто разом із попереднім", has: "після urgent: 18", hint: "fflush віддає весь буфер: start\\n (6 байтів) і ERROR: disk\\n (12 байтів)." },
      { on: "stdout", name: "Весь вивід", equals: "після start: 0\nпісля urgent: 18\nstdout: ok", hint: "Три рядки, лише stdout." },
      { on: "source", name: "Режим задано через setvbuf", matches: "\\bsetvbuf\\s*\\(", hint: "Після tmpfile() викличте setvbuf(f, NULL, _IOFBF, 4096)." },
      { on: "source", name: "Є fflush для термінових записів", matches: "\\bfflush\\s*\\(", hint: "Якщо urgent не нуль, після запису викличте fflush(f)." },
      { on: "source", name: "Розмір береться через fstat", matches: "\\bfstat\\s*\\(\\s*fileno", hint: "fstat(fileno(f), &st), далі st.st_size." },
    ],
  },
  {
    ...base, id: "c-csv-parse", lesson: "c/101", xp: 40,
    title: "Розбір рядка CSV із лапками",
    context: "Виписки, експорти й журнали приходять у CSV із порожніми клітинками та лапками. Розбір на місці без копіювання швидкий, але потребує акуратної роботи з двома вказівниками.",
    brief: [
      "Допишіть <code>parse_line(s, out, max)</code>: розріжте рядок по комах на місці, записавши в <code>out</code> вказівники на поля, і поверніть їх кількість. Порожні поля зберігайте, поле в лапках може містити кому, а пара <code>\"\"</code> всередині означає одну лапку.",
      "Очікуваний вивід: <code>3: [a] [b] [c]</code>, <code>4: [ann] [] [42] []</code>, <code>3: [1] [x, y] [say \"hi\"]</code> і <code>1: []</code> для порожнього рядка. Не використовуйте <code>strtok</code>.",
    ],
    starter: raw`#include <stdio.h>

static size_t parse_line(char *s, char **out, size_t max) {
    (void)s;
    (void)out;
    (void)max;
    return 0;
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
    checks: [
      { on: "stdout", name: "Звичайні поля", has: "3: [a] [b] [c]", hint: "Йдіть по рядку, поки не зустрінете кому чи кінець; на місці коми запишіть '\\0', а out[n++] вкажіть на початок поля." },
      { on: "stdout", name: "Порожні поля збережено", has: "4: [ann] [] [42] []", hint: "Порожнє поле це теж поле: після коми в кінці рядка є ще одне, порожнє." },
      { on: "stdout", name: "Кома й лапки всередині поля", has: "3: [1] [x, y] [say \"hi\"]", hint: "У полі в лапках кома не роздільник, а \"\" дає одну лапку: пишіть результат вказівником w, що не випереджає s." },
      { on: "stdout", name: "Весь вивід", equals: "3: [a] [b] [c]\n4: [ann] [] [42] []\n3: [1] [x, y] [say \"hi\"]\n1: []", hint: "Для порожнього рядка має вийти рівно одне порожнє поле." },
      { on: "source", name: "Без strtok", matches: "\\bstrtok\\s*\\(", not: true, hint: "strtok пропускає порожні поля: розбирайте вручну." },
    ],
  },
  {
    ...base, id: "c-json-validate", lesson: "c/102", xp: 40,
    title: "Валідатор JSON: розбір об'єкта",
    context: "Рекурсивний спуск читає вкладений JSON з одним курсором і без виділення пам'яті. Помилка в одному правилі, наприклад кома наприкінці, пропускає зламані документи далі в систему.",
    brief: [
      "Масиви, рядки, числа й ліміт глибини вже готові. Допишіть <code>object(p, depth)</code>: після <code>{</code> порожній об'єкт <code>{}</code> допустимий; далі повторюйте ключ (рядок), <code>:</code>, значення (<code>value(p + 1, depth + 1)</code>), потім <code>,</code> або <code>}</code>. Помилка в будь-якому місці повертає <code>NULL</code>.",
      "Усі сім документів із таблиці мають дати <code>ok</code>: валідні приймаються, а кома в кінці, відсутня двокрапка, ключ-число та сміття після значення відхиляються.",
    ],
    starter: raw`#include <ctype.h>
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
    (void)p;
    (void)depth;
    return NULL;
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
    checks: [
      { on: "stdout", name: "Вкладений об'єкт", has: "ok   об'єкт", hint: "Після ключа й двокрапки викличте value, а потім дивіться, чи далі кома (наступна пара) чи }." },
      { on: "stdout", name: "Кома в кінці відхилена", has: "ok   кома в кінці", hint: "Після коми знову потрібен ключ: string_ на '}' поверне NULL, тож цикл мусить повернутися на його початок." },
      { on: "stdout", name: "Некоректні об'єкти відхилено", has: "ok   ключ не рядок", hint: "Ключ обов'язково рядок, а між ключем і значенням має стояти двокрапка." },
      { on: "stdout", name: "Весь вивід", equals: "ok   масив\nok   об'єкт\nok   порожній об'єкт\nok   кома в кінці\nok   без двокрапки\nok   ключ не рядок\nok   сміття після", hint: "Усі сім рядків мають починатися з ok." },
    ],
  },
  {
    ...base, id: "c-byte-order", lesson: "c/103", xp: 35,
    title: "Кодек запису в мережевому порядку байтів",
    context: "Бінарні протоколи й файли фіксують порядок байтів у специфікації. Явні зсуви дають однакові байти на будь-якому процесорі, а перевірка довжини не дає декодеру читати за межею буфера.",
    brief: [
      "Допишіть <code>encode_record</code>: запишіть <code>id</code> (2 байти) і <code>value</code> (4 байти) у <code>buf</code> старшим байтом уперед, зсувами. Допишіть <code>decode_record</code>: якщо <code>n &lt; 6</code>, поверніть -1, інакше зберіть значення назад (приведення до <code>uint32_t</code> перед зсувом) і поверніть 0.",
      "Очікуваний вивід: <code>байти: 12 34 de ad be ef</code>, <code>id=4660 value=3735928559</code>, <code>коротке: помилка</code>. Без <code>memcpy</code> і <code>fwrite</code>.",
    ],
    starter: raw`#include <stdint.h>
#include <stdio.h>

static void encode_record(uint8_t *buf, uint16_t id, uint32_t value) {
    (void)buf;
    (void)id;
    (void)value;
}

static int decode_record(const uint8_t *buf, size_t n, uint16_t *id, uint32_t *value) {
    (void)buf;
    (void)n;
    (void)id;
    (void)value;
    return -1;
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
    checks: [
      { on: "stdout", name: "Байти в порядку big-endian", has: "байти: 12 34 de ad be ef", hint: "buf[0] = (uint8_t)(id >> 8), далі buf[1] = (uint8_t)id; для value зсуви 24, 16, 8 і 0." },
      { on: "stdout", name: "Круговий результат", has: "id=4660 value=3735928559", hint: "Збирайте (uint32_t)buf[2] << 24 | …; без приведення до uint32_t зсув байта від 0x80 переповнить int." },
      { on: "stdout", name: "Коротке вхідне відхилено", has: "коротке: помилка", hint: "Перш ніж читати, перевірте n < 6 і поверніть -1." },
      { on: "stdout", name: "Весь вивід", equals: "байти: 12 34 de ad be ef\nid=4660 value=3735928559\nкоротке: помилка", hint: "Три рядки в такому порядку." },
      { on: "source", name: "Серіалізація зсувами", matches: ">>\\s*24", hint: "Використайте зсув value >> 24 для старшого байта." },
      { on: "source", name: "Без memcpy і fwrite", matches: "\\b(memcpy|fwrite)\\s*\\(", not: true, hint: "Ці функції запишуть байти в порядку цього процесора, а не за специфікацією." },
    ],
  },
  {
    ...base, id: "c-pipe-roundtrip", lesson: "c/104", xp: 45,
    title: "Повний запис і читання через канал",
    context: "read і write на каналах і сокетах повертають менше, ніж просили, і можуть бути перервані сигналом. Надійні програми загортають їх у цикли write_all і read_all та перевіряють кожен результат.",
    brief: [
      "Допишіть <code>write_all(fd, buf, n)</code>: пишіть у циклі, поки не передано всі <code>n</code> байтів, повторюйте при <code>EINTR</code>, при іншій помилці поверніть -1, інакше 0. Допишіть <code>read_all(fd, buf, cap)</code>: читайте до кінця файлу (0) або заповнення <code>cap</code>, повертайте кількість байтів або -1.",
      "<code>main</code> передає 1000 байтів через <code>pipe</code> в одному процесі й порівнює. Очікується <code>write_all: ok</code>, <code>прочитано: 1000</code>, <code>збіг: так</code>.",
    ],
    starter: raw`#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <stdio.h>
#include <unistd.h>

static int write_all(int fd, const char *buf, size_t n) {
    (void)fd;
    (void)buf;
    (void)n;
    return -1;
}

static ssize_t read_all(int fd, char *buf, size_t cap) {
    (void)fd;
    (void)buf;
    (void)cap;
    return 0;
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
    checks: [
      { on: "stdout", name: "Запис завершився", has: "write_all: ok", hint: "Після кожного write збільшуйте done на повернене значення й повторюйте, поки done не дорівнює n; помилка -1 це повернення -1." },
      { on: "stdout", name: "Прочитано все", has: "прочитано: 1000", hint: "У read_all цикл завершується, коли read повернув 0 (EOF) або буфер повний; додавайте результат до done." },
      { on: "stdout", name: "Весь вивід", equals: "write_all: ok\nпрочитано: 1000\nзбіг: так", hint: "Вміст має збігатися байт у байт." },
      { on: "source", name: "Повтор при EINTR", matches: "\\bEINTR\\b", hint: "Якщо write чи read повернули -1 з errno == EINTR, повторіть виклик." },
    ],
  },
  {
    ...base, id: "c-socket-frames", lesson: "c/105", xp: 45,
    title: "Кадри з префіксом довжини через сокети",
    context: "TCP передає потік байтів без меж повідомлень, тому протоколи додають довжину перед даними. Приймач має читати рівно стільки байтів, скільки заявлено, і відхиляти завеликі кадри до читання.",
    brief: [
      "Бік відправлення готовий. Допишіть <code>recv_all(fd, buf, n)</code>: читайте в циклі, поки не отримано всі <code>n</code> байтів; поверніть 1 при успіху, 0 якщо з'єднання закрили раніше (<code>recv</code> дав 0), -1 при помилці. Допишіть <code>recv_frame(fd, buf, cap)</code>: прочитайте 4 байти довжини (старшим байтом уперед), поверніть -1, якщо <code>len &gt;= cap</code>, інакше прочитайте тіло, поставте <code>'\\0'</code> і поверніть довжину.",
      "Очікується три кадри (5, 0 та 6 байтів) і рядок <code>завеликий: відхилено</code>.",
    ],
    starter: raw`#define _POSIX_C_SOURCE 200809L
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
    (void)fd;
    (void)buf;
    (void)n;
    return -1;
}

static int recv_frame(int fd, char *buf, size_t cap) {
    (void)fd;
    (void)buf;
    (void)cap;
    return -1;
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
    checks: [
      { on: "stdout", name: "Перший кадр", has: "кадр 1: 5 байтів [hello]", hint: "Спершу recv_all(fd, hdr, 4), потім зберіть довжину зсувами й прочитайте рівно len байтів." },
      { on: "stdout", name: "Порожній кадр", has: "кадр 2: 0 байтів []", hint: "Для len == 0 тіло читати не треба, але '\\0' у buf[0] поставте." },
      { on: "stdout", name: "Завеликий кадр відхилено", has: "завеликий: відхилено", hint: "Перевірте len >= cap до читання тіла й поверніть -1." },
      { on: "stdout", name: "Весь вивід", equals: "кадр 1: 5 байтів [hello]\nкадр 2: 0 байтів []\nкадр 3: 6 байтів [world!]\nзавеликий: відхилено", hint: "Чотири рядки в такому порядку." },
      { on: "source", name: "Цикл читання", matches: "while\\s*\\(\\s*n\\s*>\\s*0", hint: "recv може повернути менше, ніж просили: повторюйте, поки n не стане нулем." },
    ],
  },
  {
    ...base, id: "c-pthread-sum", lesson: "c/106", xp: 45,
    title: "Сума в чотирьох потоках із mutex",
    context: "Потоки ділять роботу, але спільний результат без захисту дає гонку даних. Кожен потік рахує локально й один раз додає підсумок під mutex, а головний потік чекає всіх через join.",
    brief: [
      "Допишіть <code>worker</code>: потік отримує <code>Job *</code>, рахує суму чисел від <code>lo</code> до <code>hi - 1</code> у локальній змінній, збільшує <code>job-&gt;items</code> на кількість опрацьованих чисел і додає суму до <code>total</code> під <code>lock</code>.",
      "Допишіть <code>run_all</code>: запустіть по потоку на кожне завдання через <code>pthread_create</code>, потім дочекайтесь усіх через <code>pthread_join</code> і поверніть 0 (або -1, якщо створити потік не вдалося). Очікується <code>run_all: ok</code>, <code>сума: 7998000</code> і <code>оброблено елементів: 4000</code>.",
    ],
    starter: raw`#include <pthread.h>
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
    (void)arg;
    return NULL;
}

static int run_all(Job *jobs, int n) {
    (void)jobs;
    (void)n;
    return 0;
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
    checks: [
      { on: "stdout", name: "Потоки запущено", has: "run_all: ok", hint: "Поверніть 0, якщо всі pthread_create повернули 0." },
      { on: "stdout", name: "Сума всіх діапазонів", has: "сума: 7998000", hint: "Сума чисел 0..3999: кожен потік додає свою частину до total між lock і unlock." },
      { on: "stdout", name: "Весь вивід", equals: "run_all: ok\nсума: 7998000\nоброблено елементів: 4000", hint: "Потрібен і лічильник items у кожному завданні, і join перед друком." },
      { on: "source", name: "Mutex навколо спільної змінної", matches: "pthread_mutex_lock.*pthread_mutex_unlock", hint: "Захистіть total += local викликами pthread_mutex_lock і pthread_mutex_unlock." },
      { on: "source", name: "Очікування потоків", matches: "\\bpthread_join\\s*\\(", hint: "Без pthread_join main надрукує результат раніше, ніж потоки закінчать." },
    ],
  },
];
