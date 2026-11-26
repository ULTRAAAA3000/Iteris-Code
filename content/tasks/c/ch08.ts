// Практичні завдання глави «Стандартна бібліотека» (уроки 68–80). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08: readonly RemoteTask[] = [
  {
    ...base, id: "c-tmpfile-copy", lesson: "c/68", xp: 25,
    title: "Копіювання між двома потоками",
    context: "Копіювання потоку байт за байтом лежить в основі утиліт cat, cp і завантажувачів. Функція, що працює з FILE *, однаково годиться для файлу, тимчасового файлу й пам'яті.",
    brief: [
      "Допишіть <code>copy(from, to)</code>: читайте <code>fgetc</code> до <code>EOF</code>, пишіть <code>fputc</code> і повертайте кількість скопійованих байтів. Змінна для <code>fgetc</code> має бути <code>int</code>.",
      "Очікуваний вивід: <code>скопійовано: 22</code>, а далі вміст копії: <code>Iteris Code</code> і <code>C11 files</code>.",
    ],
    starter: raw`#include <stdio.h>

static long copy(FILE *from, FILE *to) {
    (void)from;
    (void)to;
    return 0;
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
    checks: [
      { on: "stdout", name: "Кількість байтів", has: "скопійовано: 22", hint: "Лічильник збільшуйте на кожен успішно прочитаний байт; \"Iteris Code\\nC11 files\\n\" це 22 байти." },
      { on: "stdout", name: "Вміст копії", has: "C11 files", hint: "Кожен прочитаний байт запишіть у <code>to</code> функцією fputc." },
      { on: "stdout", name: "Весь вивід", equals: "скопійовано: 22\nIteris Code\nC11 files", hint: "Цикл: while ((c = fgetc(from)) != EOF) { fputc(c, to); n++; }" },
      { on: "source", name: "Змінна int для EOF", matches: "int\\s+c\\b", hint: "fgetc повертає int, щоб відрізнити EOF від байта: тип змінної має бути int." },
      { on: "source", name: "Обидва потоки закрито", matches: "fclose\\(dst\\)", hint: "Кожен tmpfile треба закрити через fclose." },
    ],
  },
  {
    ...base, id: "c-fgets-scores", lesson: "c/69", xp: 30,
    title: "Розбір балів із рядків файлу",
    context: "Розбір табличних даних із рядків: журнали, експорт, конфігурації. Кривий рядок має пропускатися з номером, а не валити програму.",
    brief: [
      "Допишіть <code>read_scores(f)</code>: читайте рядки через <code>fgets</code>, розбирайте <code>sscanf(line, \"%31s %d\", name, &amp;score)</code>. Якщо значень не два, друкуйте <code>рядок N пропущено</code>. Повертайте суму та лічильник через вказівники.",
      "Очікуваний вивід: чотири рядки даних, одна пропущена, <code>сума: 253, середнє: 84</code>.",
    ],
    starter: raw`#include <stdio.h>

static void read_scores(FILE *f, int *sum, int *count) {
    (void)f;
    *sum = 0;
    *count = 0;
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
    checks: [
      { on: "stdout", name: "Розібрані рядки", has: "Оля: 90", hint: "Після успішного sscanf друкуйте ім'я, двокрапку й бал." },
      { on: "stdout", name: "Пропущений рядок", has: "рядок 3 пропущено", hint: "Ведіть лічильник рядків і друкуйте його, коли sscanf повернув не 2." },
      { on: "stdout", name: "Підсумок", has: "сума: 253, середнє: 84", hint: "Складайте тільки бали з коректних рядків; середнє це sum / count." },
      { on: "stdout", name: "Весь вивід", equals: "Оля: 90\nІван: 75\nрядок 3 пропущено\nМарія: 88\nсума: 253, середнє: 84", hint: "Порядок рядків такий самий, як у файлі." },
      { on: "source", name: "Читання через fgets", matches: "fgets\\s*\\(", hint: "Прочитайте рядок цілком функцією fgets у масив line." },
    ],
  },
  {
    ...base, id: "c-records-seek", lesson: "c/70", xp: 35,
    title: "Записи фіксованого розміру й fseek",
    context: "Індекси баз даних, збереження ігор і кеші зберігають записи однакового розміру: i-й запис знаходять за зсувом без читання попередніх. Так працює довільний доступ до файлу.",
    brief: [
      "Допишіть три функції: <code>count_records</code> (<code>fseek(f, 0, SEEK_END)</code> і <code>ftell</code>), <code>read_at</code> та <code>write_at</code>, що встановлюють позицію <code>i * sizeof(struct rec)</code> через <code>fseek</code>. Вони повертають <code>1</code> при успіху.",
      "Очікуваний вивід: <code>записів: 4</code>, <code>запис 2: id=30 score=70</code>, після оновлення <code>score=100</code> і <code>сума балів: 290</code>.",
    ],
    starter: raw`#include <stdint.h>
#include <stdio.h>

struct rec {
    int32_t id;
    int32_t score;
};

static long count_records(FILE *f) {
    (void)f;
    return 0;
}

static int read_at(FILE *f, long i, struct rec *r) {
    (void)f;
    (void)i;
    (void)r;
    return 0;
}

static int write_at(FILE *f, long i, const struct rec *r) {
    (void)f;
    (void)i;
    (void)r;
    return 0;
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
    checks: [
      { on: "stdout", name: "Кількість записів", has: "записів: 4", hint: "Перейдіть у кінець через fseek(f, 0, SEEK_END), ftell дасть розмір у байтах; поділіть на sizeof(struct rec)." },
      { on: "stdout", name: "Читання за номером", has: "запис 2: id=30 score=70", hint: "Зсув запису i це i * (long)sizeof(struct rec) від SEEK_SET; потім fread одного елемента." },
      { on: "stdout", name: "Сума після оновлення", has: "сума балів: 290", hint: "write_at має зробити fseek на запис і fwrite; сума 50 + 60 + 100 + 80." },
      { on: "stdout", name: "Весь вивід", equals: "записів: 4\nзапис 2: id=30 score=70\nоновлено: id=30 score=100\nсума балів: 290", hint: "Перевірте результат fseek і кількість елементів, яку повертає fread/fwrite." },
      { on: "source", name: "Позиціонування", matches: "fseek\\s*\\(", hint: "Для довільного доступу до запису користуйтеся fseek." },
    ],
  },
  {
    ...base, id: "c-exit-atexit", lesson: "c/71", xp: 30,
    title: "Розбір чисел з основою 0 і atexit",
    context: "Розбір чисел із різних записів (десяткових, шістнадцяткових) і гарантоване прибирання при будь-якому виході: типова оболонка утиліт командного рядка.",
    brief: [
      "Допишіть <code>parse</code> через <code>strtol(s, &amp;end, 0)</code>: <code>ok</code> дорівнює <code>1</code>, лише якщо є цифри й <code>*end == '\\0'</code>. У <code>main</code> зареєструйте <code>atexit(close_log)</code>, потім <code>atexit(free_pool)</code>, а <code>finish</code> нехай завершує програму через <code>exit(EXIT_SUCCESS)</code>.",
      "Очікуваний вивід: <code>10 -> 10</code>, <code>0x1F -> 31</code>, <code>017 -> 15</code>, <code>bad -> пропущено</code>, <code>сума: 56</code>, потім два рядки очищення в зворотному порядку.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

static void close_log(void) {
    puts("очищення: журнал");
}

static void free_pool(void) {
    puts("очищення: пул");
}

static long parse(const char *s, int *ok) {
    (void)s;
    *ok = 0;
    return 0;
}

static void finish(long sum) {
    printf("сума: %ld\n", sum);
}

int main(void) {
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
    checks: [
      { on: "stdout", name: "Шістнадцяткове число", has: "0x1F -> 31", hint: "Основа 0 у strtol сама розпізнає префікс 0x." },
      { on: "stdout", name: "Вісімкове число", has: "017 -> 15", hint: "Із основою 0 рядок, що починається з нуля, читається як вісімковий." },
      { on: "stdout", name: "Порядок очищення", has: "сума: 56\nочищення: пул\nочищення: журнал", hint: "atexit виконує обробники у зворотному порядку: зареєструйте close_log першим, free_pool другим." },
      { on: "stdout", name: "Весь вивід", equals: "10 -> 10\n0x1F -> 31\n017 -> 15\nbad -> пропущено\nсума: 56\nочищення: пул\nочищення: журнал", hint: "Для bad strtol не знаходить цифр: end збігається з s." },
      { on: "source", name: "Реєстрація обробників", matches: "atexit\\s*\\(\\s*close_log", hint: "У main викличте atexit(close_log) і atexit(free_pool)." },
    ],
  },
  {
    ...base, id: "c-math-geometry", lesson: "c/72", xp: 30,
    title: "Геометрія з math.h",
    context: "Відстані, площі й округлення це щоденна математика ігор, графіки й обчислень. У C11 немає M_PI, тому число пі отримують через acos(-1).",
    brief: [
      "Допишіть <code>dist</code> (через <code>sqrt</code>), <code>circle_area</code> (число пі як <code>acos(-1)</code>, бо <code>M_PI</code> не входить у C11) і <code>round2</code> (<code>round(x * 100) / 100</code>).",
      "Очікуваний вивід: <code>відстань: 5.00</code>, <code>площа кола: 12.57</code>, <code>гіпотенуза: 13.00</code>, <code>округлено: 3.14</code>, <code>стеля: 8, підлога: -8</code>.",
    ],
    starter: raw`#include <math.h>
#include <stdio.h>

static double dist(double ax, double ay, double bx, double by) {
    (void)ax;
    (void)ay;
    (void)bx;
    (void)by;
    return 0;
}

static double circle_area(double r) {
    (void)r;
    return 0;
}

static double round2(double x) {
    return x;
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
    checks: [
      { on: "stdout", name: "Відстань", has: "відстань: 5.00", hint: "Корінь із dx*dx + dy*dy, тобто sqrt(dx * dx + dy * dy)." },
      { on: "stdout", name: "Площа кола", has: "площа кола: 12.57", hint: "Площа це пі * r * r, а пі дорівнює acos(-1)." },
      { on: "stdout", name: "Округлення", has: "округлено: 3.14", hint: "round(x * 100) / 100 залишає дві цифри після коми." },
      { on: "stdout", name: "Весь вивід", equals: "відстань: 5.00\nплоща кола: 12.57\nгіпотенуза: 13.00\nокруглено: 3.14\nстеля: 8, підлога: -8", hint: "Усі функції повертають double; друкуйте їх з %.2f." },
      { on: "source", name: "Число пі без M_PI", matches: "acos\\s*\\(\\s*-\\s*1", hint: "M_PI не входить у C11: отримайте пі як acos(-1)." },
      { on: "source", name: "Квадратний корінь", matches: "sqrt\\s*\\(", hint: "Для відстані між точками скористайтеся sqrt." },
    ],
  },
  {
    ...base, id: "c-ctype-stats", lesson: "c/73", xp: 30,
    title: "Статистика тексту через ctype.h",
    context: "Лексери, валідація полів і підрахунок слів спираються на класифікацію символів. Ключове правило: у функції ctype передають unsigned char, а не char.",
    brief: [
      "Допишіть <code>count</code>: підрахуйте літери, цифри, пробіли, великі й розділові через <code>isalpha</code>, <code>isdigit</code>, <code>isspace</code>, <code>isupper</code>, <code>ispunct</code> і <code>capitalize</code>: перша літера кожного слова стає великою. Передавайте <code>(unsigned char)</code>.",
      "Очікуваний вивід: <code>літер: 17, цифр: 3, пробілів: 5, великих: 1, розділових: 3</code> і <code>Learn C: 11 Lessons, 7 Labs!</code>.",
    ],
    starter: raw`#include <ctype.h>
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
    (void)s;
    return st;
}

static void capitalize(char *s) {
    (void)s;
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
    checks: [
      { on: "stdout", name: "Підрахунок класів", has: "літер: 17, цифр: 3, пробілів: 5, великих: 1, розділових: 3", hint: "Один прохід по рядку: на кожному символі збільшуйте потрібний лічильник." },
      { on: "stdout", name: "Великі літери слів", has: "Learn C: 11 Lessons, 7 Labs!", hint: "Тримайте прапорець «початок слова»: пробіл його вмикає, перша літера слова перетворюється toupper." },
      { on: "stdout", name: "Весь вивід", equals: "літер: 17, цифр: 3, пробілів: 5, великих: 1, розділових: 3\nLearn C: 11 Lessons, 7 Labs!", hint: "Цифри й розділові знаки слово не починають, лише прапорець гаситься." },
      { on: "source", name: "Приведення до unsigned char", matches: "\\(unsigned char\\)", hint: "Передавайте у функції ctype (unsigned char)*p, щоб уникнути UB для байтів понад 127." },
    ],
  },
  {
    ...base, id: "c-days-epoch", lesson: "c/74", xp: 40,
    title: "Дні від епохи без часового поясу",
    context: "Дата без часового поясу це чиста арифметика днів. Власний підрахунок і перевірка через gmtime дають однаковий результат на будь-якій машині, на відміну від mktime.",
    brief: [
      "Допишіть <code>days_from_civil(y, m, d)</code>: кількість днів від 1970-01-01 (алгоритм Говарда Хіннанта), а також <code>weekday</code> (0 це неділя; 1970-01-01 четвер, тобто <code>(days + 4) % 7</code> для невід'ємних).",
      "Очікуваний вивід: <code>2001-09-09: 11574 днів, неділя</code>, <code>1970-01-01: 0 днів, четвер</code>, <code>різниця: 61 днів</code> і перевірка через <code>gmtime</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <time.h>

static long days_from_civil(int y, int m, int d) {
    (void)y;
    (void)m;
    (void)d;
    return 0;
}

static int weekday(long days) {
    (void)days;
    return 0;
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
    checks: [
      { on: "stdout", name: "Дні від епохи", has: "2001-09-09: 11574 днів, неділя", hint: "Алгоритм Хіннанта: зсуньте рік для січня й лютого, порахуйте епоху в 400 років, потім день у році." },
      { on: "stdout", name: "Початок епохи", has: "1970-01-01: 0 днів, четвер", hint: "Перша дата епохи має дати нуль; weekday(0) це четвер (індекс 4)." },
      { on: "stdout", name: "Збіг із gmtime", has: "перевірка gmtime: 2001-09-09", hint: "Власний підрахунок і gmtime мають погоджуватися: перевірте формулу для дня в році." },
      { on: "stdout", name: "Весь вивід", equals: "2001-09-09: 11574 днів, неділя\n1970-01-01: 0 днів, четвер\nрізниця: 61 днів\nперевірка gmtime: 2001-09-09", hint: "Для днів до епохи беріть дільник із підлогою, щоб weekday не став від'ємним." },
      { on: "source", name: "Епоха в днях", matches: "719468", hint: "Зсув 719468 переводить дні від 0000-03-01 до дат від 1970-01-01." },
    ],
  },
  {
    ...base, id: "c-limits-safe", lesson: "c/75", xp: 35,
    title: "Безпечне додавання й обмеження",
    context: "Переповнення цілих при розрахунку розмірів і сум це давнє джерело вразливостей. Перевірка до операції й типи точної ширини роблять код передбачуваним на будь-якій платформі.",
    brief: [
      "Допишіть <code>add_checked(a, b, &amp;out)</code> для <code>int32_t</code>: перевіряйте <b>до</b> додавання через <code>INT32_MAX</code> та <code>INT32_MIN</code> і повертайте <code>1</code> лише за успіху. Допишіть <code>clamp_u8(v)</code>, що обмежує значення діапазоном 0–255.",
      "Очікуваний вивід: <code>100 + 200 = 300</code>, два повідомлення про переповнення, <code>-5 -> 0, 300 -> 255, 77 -> 77</code> і <code>255 + 1 у uint8_t = 0</code>.",
    ],
    starter: raw`#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>

static int add_checked(int32_t a, int32_t b, int32_t *out) {
    (void)a;
    (void)b;
    (void)out;
    return 0;
}

static int clamp_u8(int v) {
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
    checks: [
      { on: "stdout", name: "Звичайне додавання", has: "100 + 200 = 300", hint: "Якщо переповнення немає, запишіть a + b у *out і поверніть 1." },
      { on: "stdout", name: "Переповнення вгору", has: "INT32_MAX + 1: переповнення", hint: "Для b > 0 переповнення, коли a > INT32_MAX - b." },
      { on: "stdout", name: "Обмеження", has: "-5 -> 0, 300 -> 255, 77 -> 77", hint: "clamp_u8: менше нуля дає 0, більше 255 дає 255." },
      { on: "stdout", name: "Весь вивід", equals: "100 + 200 = 300\nINT32_MAX + 1: переповнення\nINT32_MIN - 1: переповнення\n-5 -> 0, 300 -> 255, 77 -> 77\n255 + 1 у uint8_t = 0", hint: "Для b < 0 переповнення вниз, коли a < INT32_MIN - b." },
      { on: "source", name: "Межі з stdint.h", matches: "INT32_MAX\\s*-\\s*b", hint: "Перевіряйте до операції: a > INT32_MAX - b." },
    ],
  },
  {
    ...base, id: "c-rand-props", lesson: "c/76", xp: 30,
    title: "Властивості псевдовипадкових чисел",
    context: "Тести ігор і симуляцій не можуть покладатися на конкретні значення rand, бо вони залежать від бібліотеки. Перевіряють межі, повторюваність за зерном і коректність перестановки.",
    brief: [
      "Допишіть <code>roll</code> (<code>1 + rand() % 6</code>) і <code>shuffle</code> (Фішер і Йейтс: <code>i</code> від <code>n-1</code> до 1, <code>j = rand() % (i + 1)</code>, обмін).",
      "Очікуваний вивід: п'ять рядків-властивостей, що виводять «так»/«однаково»; значення чисел не друкуються.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

static int roll(void) {
    return 0;
}

static void shuffle(int *a, int n) {
    (void)a;
    (void)n;
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
    checks: [
      { on: "stdout", name: "Межі кубика", has: "усі в межах 1..6: так", hint: "Кидок це 1 + rand() % 6: значення від 1 до 6." },
      { on: "stdout", name: "Кожна грань", has: "кожна грань випала: так", hint: "За 1000 кидків випадуть усі шість граней; перевірте, що roll не повертає сталу." },
      { on: "stdout", name: "Перестановка", has: "перемішування дало перестановку: так", hint: "Обмінюйте a[i] і a[j], де j від 0 до i включно; елементи не губляться й не дублюються." },
      { on: "stdout", name: "Весь вивід", equals: "кидків: 1000\nусі в межах 1..6: так\nкожна грань випала: так\nповтор із тим самим зерном: однаково\nперемішування дало перестановку: так", hint: "Зерно ставить main; roll і shuffle лише викликають rand." },
      { on: "source", name: "Використано rand", matches: "rand\\s*\\(\\s*\\)\\s*%", hint: "Скористайтеся rand() % n для діапазону." },
    ],
  },
  {
    ...base, id: "c-vararg-tools", lesson: "c/77", xp: 35,
    title: "Функції зі змінною кількістю аргументів",
    context: "Логери, форматувальники й будівники рядків приймають довільну кількість аргументів. Контракт про кількість і типи тримається лише на програмісті, тому його треба вміти будувати.",
    brief: [
      "Допишіть три функції: <code>maxi(n, ...)</code> (найбільше з <code>n</code> цілих), <code>average(n, ...)</code> (середнє <code>double</code>) і <code>join(out, cap, sep, ...)</code>, що склеює рядки через роздільник до сентинела <code>NULL</code> із захистом від переповнення через <code>snprintf</code>.",
      "Очікуваний вивід: <code>max: 9</code>, <code>середнє: 2.50</code>, <code>рядок: a-b-c</code>.",
    ],
    starter: raw`#include <stdarg.h>
#include <stdio.h>

static int maxi(int n, ...) {
    (void)n;
    return 0;
}

static double average(int n, ...) {
    (void)n;
    return 0;
}

static void join(char *out, size_t cap, const char *sep, ...) {
    (void)sep;
    if (cap > 0) {
        out[0] = '\0';
    }
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
    checks: [
      { on: "stdout", name: "Максимум", has: "max: 9", hint: "Прочитайте перший елемент через va_arg(ap, int), далі порівнюйте з рештою." },
      { on: "stdout", name: "Середнє", has: "середнє: 2.50", hint: "Читайте va_arg(ap, double), а не int; сума 10 поділена на 4." },
      { on: "stdout", name: "Склеєний рядок", has: "рядок: a-b-c", hint: "Читайте const char * до NULL; перед усіма елементами, крім першого, додавайте роздільник." },
      { on: "stdout", name: "Весь вивід", equals: "max: 9\nсереднє: 2.50\nрядок: a-b-c", hint: "У кожній функції викличте va_start і va_end." },
      { on: "source", name: "Завершення обходу", matches: "va_end\\s*\\(", hint: "Кожен va_start мусить завершуватися va_end." },
    ],
  },
  {
    ...base, id: "c-signal-flag", lesson: "c/78", xp: 35,
    title: "Прапорець у обробнику сигналу",
    context: "Акуратне завершення сервера по SIGTERM будується на прапорці, який піднімає обробник. Тут сигнал імітує raise, тож результат детермінований і не залежить від терміналу.",
    brief: [
      "Допишіть <code>on_signal</code> (піднімає <code>stop</code> типу <code>volatile sig_atomic_t</code>) та <code>install</code> (<code>signal(SIGINT, on_signal)</code>, повертає <code>1</code> за успіху). Всередині обробника нічого не друкуйте.",
      "Очікуваний вивід: кроки 1–3, після третього <code>raise(SIGINT)</code> цикл зупиняється, далі <code>оброблено кроків: 3</code> та перевірка <code>SIG_IGN</code>.",
    ],
    starter: raw`#include <signal.h>
#include <stdio.h>

static volatile sig_atomic_t stop = 0;

static void on_signal(int sig) {
    (void)sig;
}

static int install(void) {
    return signal(SIGINT, SIG_IGN) != SIG_ERR;
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
    checks: [
      { on: "stdout", name: "Цикл зупинено", has: "крок 3\nсигнал отримано: так", hint: "Обробник має встановити stop = 1, тоді умова !stop у циклі зупинить його після третього кроку." },
      { on: "stdout", name: "Кількість кроків", has: "оброблено кроків: 3", hint: "Прапорець піднімається під час третього кроку, тому четвертого вже немає." },
      { on: "stdout", name: "Виживання під SIG_IGN", has: "під SIG_IGN програма жива", hint: "signal(SIGINT, SIG_IGN) перед raise ігнорує сигнал." },
      { on: "stdout", name: "Весь вивід", equals: "крок 1\nкрок 2\nкрок 3\nсигнал отримано: так\nоброблено кроків: 3\nпід SIG_IGN програма жива\nпопередній обробник був SIG_IGN: так", hint: "install має встановлювати саме on_signal, а не SIG_IGN." },
      { on: "source", name: "Тип прапорця", matches: "volatile\\s+sig_atomic_t", hint: "Прапорець має бути volatile sig_atomic_t." },
    ],
  },
  {
    ...base, id: "c-locale-utf8", lesson: "c/79", xp: 35,
    title: "Скільки символів у UTF-8 рядку",
    context: "Довжину рядка для людини рахують у символах, а не в байтах: поля форм, обрізання тексту, вирівнювання. Підрахунок за байтами-продовженнями не залежить від локалі.",
    brief: [
      "Допишіть <code>utf8_len</code>: кількість символів дорівнює кількості байтів, у яких старші два біти не <code>10</code> (<code>(b &amp; 0xC0) != 0x80</code>). Решту <code>main</code> вже перевіряє підрахунок через літерал <code>U\"...\"</code> типу <code>char32_t</code>.",
      "Очікуваний вивід: <code>байтів: 16</code>, <code>символів: 10</code> та <code>збіг із char32_t: так</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <string.h>
#include <uchar.h>

static size_t utf8_len(const char *s) {
    return strlen(s);
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
    checks: [
      { on: "stdout", name: "Байти", has: "байтів: 16", hint: "Кожна кирилична літера в UTF-8 займає два байти: шість літер це 12 байтів плюс чотири ASCII." },
      { on: "stdout", name: "Символи", has: "символів: 10", hint: "Не рахуйте байти-продовження: вони мають вигляд 10xxxxxx, тобто (b & 0xC0) == 0x80." },
      { on: "stdout", name: "Збіг із char32_t", has: "збіг із char32_t: так", hint: "Кількість символів мусить збігатися з довжиною U-літералу." },
      { on: "stdout", name: "Весь вивід", equals: "байтів: 16\nсимволів: 10\nзбіг із char32_t: так", hint: "Приводьте байт до unsigned char перед порозрядною операцією." },
      { on: "source", name: "Маска продовження", matches: "0xC0", hint: "Продовження UTF-8 розпізнають маскою 0xC0 та значенням 0x80." },
    ],
  },
  {
    ...base, id: "c-threads-sum", lesson: "c/80", xp: 40,
    title: "Сума в чотирьох потоках",
    context: "Розбиття роботи між потоками й збір результатів після join основа паралельних обчислень. Спільний лічильник під м'ютексом показує, як уникнути гонки даних.",
    brief: [
      "Допишіть <code>worker</code>: підсумуйте <code>data[from..to)</code> у <code>j-&gt;sum</code> і тисячу разів збільште спільний <code>counter</code> під <code>mtx_lock</code>/<code>mtx_unlock</code>. Повертайте <code>0</code>.",
      "Очікуваний вивід: <code>сума 1..100: 5050</code> і <code>лічильник: 4000</code>. Результати збирає <code>main</code> після <code>thrd_join</code>.",
    ],
    starter: raw`#include <stdio.h>
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
    (void)j;
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
    checks: [
      { on: "stdout", name: "Сума частин", has: "сума 1..100: 5050", hint: "Кожен потік додає елементи свого діапазону в j->sum; main складає результати після join." },
      { on: "stdout", name: "Лічильник без втрат", has: "лічильник: 4000", hint: "Чотири потоки по 1000 збільшень; кожне counter++ огорніть mtx_lock і mtx_unlock." },
      { on: "stdout", name: "Весь вивід", equals: "сума 1..100: 5050\nлічильник: 4000", hint: "Суму рахуйте в локальній структурі потоку, а не в спільній змінній." },
      { on: "source", name: "Захист м'ютексом", matches: "mtx_lock\\s*\\(\\s*&lock", hint: "Спільну змінну змінюйте між mtx_lock(&lock) і mtx_unlock(&lock)." },
    ],
  },
];
