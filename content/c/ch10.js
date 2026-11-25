export const LESSONS_10 = [
  {
    t: "Табличні тести на assert",
    ch: "Тестування й якість",
    easy: "Табличний тест схожий на екзаменаційну відомість: у кожному рядку є вхід і очікувана оцінка, а перевіряльник один. Щоб додати перевірку, ви дописуєте рядок у таблицю, а не копіюєте ще один шматок коду.",
    p: [
      "Функцію, яку не перевіряли, ви не знаєте, а лише сподіваєтесь, що вона працює. Найпростіше тестування в C не потребує жодної бібліотеки: ви пишете <code>main</code>, що викликає функцію на відомих входах і порівнює результат з очікуваним. Але п'ять викликів <code>printf</code> з однаковою структурою швидко стають копіюванням, у якому легко помилитися. Тому тести пишуть таблицею: масив структур <code>{name, in, want}</code>, один цикл і один формат виводу. Новий випадок коштує один рядок.",
      "Тестовий випадок має три частини: <code>name</code> (щоб у звіті було видно, що саме впало), вхідні дані та очікуване значення. Масив оголошуйте без розміру, а кількість рахуйте як <code>sizeof cases / sizeof cases[0]</code>: додавання рядка нічого не ламає. Це працює, лише поки <code>cases</code> справжній масив, а не вказівник, який отримала функція: у вказівника <code>sizeof</code> дасть розмір адреси. Лічильник тримайте в <code>size_t</code> і друкуйте через <code>%zu</code>.",
      "Цикл порівнює <code>got</code> з <code>want</code>, друкує <code>ok</code> або <code>FAIL</code> з обома значеннями й рахує невдачі. Не зупиняйтесь на першій помилці: звіт про всі збої показує закономірність (скажімо, падають усі кратні 100). Головне ж: програма повертає <code>failed ? 1 : 0</code>. Платформа, CI і <code>make test</code> дивляться саме на код виходу, а не на текст у терміналі: програма, що надрукувала FAIL і повернула 0, для них успішна.",
      "Є й найкоротша форма: <code>assert(cond)</code> з <code>&lt;assert.h&gt;</code>. Якщо умова хибна, програма друкує вираз, файл і рядок та викликає <code>abort()</code>, тож код виходу ненульовий. Мінус: перший збій обриває весь прогін, і решти ви не побачите. Плюс: нуль додаткового коду. Тому <code>assert</code> добре тримає внутрішні припущення функції, а таблиця з лічильником краще для звіту про набір випадків. Не плутайте: при <code>-DNDEBUG</code> <code>assert</code> зникає разом із виразом, тож не кладіть у нього побічні дії на кшталт <code>assert(i++ &lt; n)</code>.",
      "Що класти в таблицю? Типові, граничні й підступні входи. Для високосного року це 2023 (звичайний), 2024 (кратний 4), 1900 (століття, не високосний) і 2000 (кратний 400). Версія, що знає лише правило «кратний 4», пройде перші два випадки й упаде на третьому: саме тому 1900 і є в таблиці. Для рядків беріть порожній рядок, один символ і рядок із самих пробілів, для чисел нуль, мінус один і максимум типу.",
      "Якщо розмір таблиці має збігатися з очікуваним, зафіксуйте це в <code>_Static_assert</code> (C11): розбіжність вилізе під час компіляції, а не в бою. Тести на рівні функції не замінюють перевірки всієї програми, але ловлять регресії за мілісекунди. Звичка «спершу рядок у таблицю, що відтворює баг, потім виправлення» гарантує, що той самий збій не повернеться непомітно.",
      "У наступному уроці ми винесемо повторюваний друк і лічильники в макроси <code>CHECK</code> і <code>EXPECT_EQ</code>, тобто зберемо власний мінімальний тестовий каркас.",
    ],
    code: [
      String.raw`#include <stdio.h>

static int is_leap(int y) {
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}

int main(void) {
    struct {
        const char *name;
        int in;
        int want;
    } cases[] = {
        {"звичайний", 2023, 0},
        {"кратний 4", 2024, 1},
        {"століття", 1900, 0},
        {"кратний 400", 2000, 1},
    };
    size_t n = sizeof cases / sizeof cases[0];
    int failed = 0;
    for (size_t i = 0; i < n; i++) {
        int got = is_leap(cases[i].in);
        if (got == cases[i].want) {
            printf("ok   %s\n", cases[i].name);
        } else {
            printf("FAIL %s: is_leap(%d) = %d, want %d\n", cases[i].name, cases[i].in, got, cases[i].want);
            failed++;
        }
    }
    printf("випадків: %zu, провалено: %d\n", n, failed);
    return failed ? 1 : 0;
}
`,
      String.raw`#include <assert.h>
#include <stdio.h>

static int count_words(const char *s) {
    int n = 0;
    int inside = 0;
    for (; *s != '\0'; s++) {
        if (*s == ' ') {
            inside = 0;
        } else if (!inside) {
            inside = 1;
            n++;
        }
    }
    return n;
}

int main(void) {
    static const struct {
        const char *in;
        int want;
    } cases[] = {
        {"", 0},
        {"   ", 0},
        {"one", 1},
        {"  two   words ", 2},
        {"a b c d", 4},
    };
    for (size_t i = 0; i < sizeof cases / sizeof cases[0]; i++) {
        assert(count_words(cases[i].in) == cases[i].want);
    }
    printf("усі %zu випадків пройдено\n", sizeof cases / sizeof cases[0]);
    return 0;
}
`,
      String.raw`// аварія: таблиця зловила помилку: версія is_leap без правила століть, assert зупиняє прогін на 1900
#include <assert.h>
#include <stdio.h>

static int is_leap(int y) {
    return y % 4 == 0;
}

int main(void) {
    static const struct {
        int in;
        int want;
    } cases[] = {
        {2023, 0},
        {2024, 1},
        {1900, 0},
        {2000, 1},
    };
    for (size_t i = 0; i < sizeof cases / sizeof cases[0]; i++) {
        printf("перевіряю %d\n", cases[i].in);
        fflush(stdout);
        assert(is_leap(cases[i].in) == cases[i].want);
    }
    printf("усе гаразд\n");
    return 0;
}
`,
      String.raw`// не компілюється: _Static_assert стоїть на сторожі: у таблиці 4 рядки, а очікується 5
#include <stdio.h>

static const struct {
    int in;
    int want;
} cases[] = {
    {1, 1},
    {2, 4},
    {3, 9},
    {4, 16},
};

_Static_assert(sizeof cases / sizeof cases[0] == 5, "у таблиці має бути 5 випадків");

int main(void) {
    printf("%zu\n", sizeof cases / sizeof cases[0]);
    return 0;
}
`,
    ],
    note: "Таблиця структур <code>{name, in, want}</code>, один цикл і код виходу <code>failed ? 1 : 0</code>: нова перевірка це рядок, а не копія коду. <code>assert</code> зручний для припущень, але обриває прогін на першому збої.",
    work: "У бібліотеках на C тестові набори часто складаються з довгих таблиць «вхід і очікуваний вихід»: знайдений баг додає ще один рядок. Саме код виходу читають make test і CI, тому збій зупиняє злиття змін.",
    tasks: [
      "Чому <code>sizeof cases / sizeof cases[0]</code> працює в <code>main</code>, але дасть хибний результат, якщо передати <code>cases</code> у функцію як параметр?",
      "Які чотири входи ви б додали до таблиці для <code>count_words</code> (слова розділені пробілами) і чому саме їх?",
    ],
  },
  {
    t: "Власний мінімальний тестовий каркас",
    ch: "Тестування й якість",
    easy: "Тестовий каркас схожий на касовий апарат: ви лише повідомляєте, що перевірити, а лічильники, чек і підсумок він веде сам. Кілька макросів замінюють десятки однакових рядків із printf.",
    p: [
      "Бібліотеки на кшталт Unity чи Check — це, по суті, кілька макросів, лічильники й друк підсумку. Для навчального проєкту їх варто написати самому: так видно, що відбувається за лаштунками, а в пісочниці немає чужих заголовків і додаткових файлів. Мінімальний каркас має три частини: лічильники виконаних і провалених перевірок, макрос перевірки з номером рядка та підсумок із кодом виходу.",
      "Лічильники це два <code>static int</code> на файл: <code>tests_run</code> і <code>tests_failed</code>. Макрос <code>CHECK(cond)</code> збільшує <code>tests_run</code>, а при хибній умові друкує <code>FAIL</code>, номер рядка <code>__LINE__</code> і текст самої умови через оператор <code>#</code> (стрингіфікація: <code>#cond</code> перетворює аргумент макроса на рядковий літерал). Шлях до файлу не друкуємо: рядок і текст умови вже однозначно вказують на місце збою.",
      "Макрос, що розгортається в кілька операторів, загортайте в <code>do { … } while (0)</code>. Без цього <code>if (x) CHECK(a); else …</code> зламається: після розгортання крапка з комою завершить <code>if</code>, а <code>else</code> лишиться без пари. Конструкція з <code>while (0)</code> поводиться як один оператор і вимагає крапки з комою після виклику, як звичайна функція.",
      "<code>EXPECT_EQ(actual, expected)</code> корисніший за голий <code>CHECK(a == b)</code>: він друкує обидва значення. Аргументи слід обчислювати один раз, тому макрос кладе їх у тимчасові змінні. Інакше <code>EXPECT_EQ(next(), 3)</code> викликав би <code>next()</code> двічі: раз для порівняння й раз для друку, і побічні дії відбулися б двічі. Те саме з <code>MAX(i++, 3)</code>: аргумент потрапляє в текст макроса двічі. Тип для друку беремо найширший: <code>long long</code> і <code>%lld</code>.",
      "Для груп перевірок зручна «таблиця тестів»: масив <code>{name, fn}</code>, де <code>fn</code> — вказівник на функцію <code>void (*)(void)</code>. Ранер викликає кожну, після неї порівнює <code>tests_failed</code> із попереднім значенням і друкує <code>ok</code> чи <code>FAIL</code> для всієї групи. Імена функцій у таблиці працюють як документація: <code>test_parse_empty</code> каже, що зламано, ще до читання коду.",
      "Підсумок завершує програму: друкуємо кількість перевірок і провалів та повертаємо <code>tests_failed ? 1 : 0</code>. Макроси не мають ні типів, ні області видимості, тому давайте їм довгі імена з префіксом проєкту й тримайте каркас невеликим. Для великих наборів переходьте на готові бібліотеки, але принцип у них той самий: лічильники, макроси з <code>__LINE__</code> і код виходу.",
    ],
    code: [
      String.raw`#include <stdio.h>

static int tests_run;
static int tests_failed;

#define CHECK(cond)                                                \
    do {                                                           \
        tests_run++;                                               \
        if (!(cond)) {                                             \
            tests_failed++;                                        \
            printf("FAIL строка %d: %s\n", __LINE__, #cond);       \
        }                                                          \
    } while (0)

#define EXPECT_EQ(actual, expected)                                \
    do {                                                           \
        long long a_ = (actual);                                   \
        long long e_ = (expected);                                 \
        tests_run++;                                               \
        if (a_ != e_) {                                            \
            tests_failed++;                                        \
            printf("FAIL строка %d: %s == %s (%lld != %lld)\n",    \
                   __LINE__, #actual, #expected, a_, e_);          \
        }                                                          \
    } while (0)

static int square(int x) {
    return x * x;
}

int main(void) {
    CHECK(square(3) == 9);
    EXPECT_EQ(square(-4), 16);
    EXPECT_EQ(square(0), 0);
    printf("перевірок: %d, провалено: %d\n", tests_run, tests_failed);
    return tests_failed ? 1 : 0;
}
`,
      String.raw`#include <stdio.h>
#include <string.h>

static int tests_run;
static int tests_failed;

#define EXPECT_EQ(actual, expected)                                \
    do {                                                           \
        long long a_ = (actual);                                   \
        long long e_ = (expected);                                 \
        tests_run++;                                               \
        if (a_ != e_) {                                            \
            tests_failed++;                                        \
            printf("  строка %d: %lld != %lld\n", __LINE__, a_, e_); \
        }                                                          \
    } while (0)

static void test_strlen_empty(void) {
    EXPECT_EQ(strlen(""), 0);
}

static void test_strlen_word(void) {
    EXPECT_EQ(strlen("hello"), 5);
    EXPECT_EQ(strlen("a b"), 3);
}

static void test_strcmp_order(void) {
    EXPECT_EQ(strcmp("a", "a"), 0);
    EXPECT_EQ(strcmp("a", "b") < 0, 1);
}

int main(void) {
    static const struct {
        const char *name;
        void (*fn)(void);
    } tests[] = {
        {"strlen_empty", test_strlen_empty},
        {"strlen_word", test_strlen_word},
        {"strcmp_order", test_strcmp_order},
    };
    for (size_t i = 0; i < sizeof tests / sizeof tests[0]; i++) {
        int before = tests_failed;
        tests[i].fn();
        printf("%s %s\n", tests_failed == before ? "ok  " : "FAIL", tests[i].name);
    }
    printf("перевірок: %d, провалено: %d\n", tests_run, tests_failed);
    return tests_failed ? 1 : 0;
}
`,
      String.raw`// аварія: каркас бачить збій EXPECT_EQ, друкує FAIL і повертає код 1
#include <stdio.h>

static int tests_run;
static int tests_failed;

#define EXPECT_EQ(actual, expected)                                \
    do {                                                           \
        long long a_ = (actual);                                   \
        long long e_ = (expected);                                 \
        tests_run++;                                               \
        if (a_ != e_) {                                            \
            tests_failed++;                                        \
            printf("FAIL строка %d: %s == %s (%lld != %lld)\n",    \
                   __LINE__, #actual, #expected, a_, e_);          \
        }                                                          \
    } while (0)

static int abs_val(int x) {
    return x > 0 ? x : x;
}

int main(void) {
    EXPECT_EQ(abs_val(5), 5);
    EXPECT_EQ(abs_val(-5), 5);
    printf("перевірок: %d, провалено: %d\n", tests_run, tests_failed);
    return tests_failed ? 1 : 0;
}
`,
      String.raw`#include <stdio.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main(void) {
    int i = 5;
    int m = MAX(i++, 3);
    printf("результат=%d i=%d\n", m, i);
    int j = 5;
    int k = j++;
    int m2 = k > 3 ? k : 3;
    printf("результат=%d j=%d\n", m2, j);
    return 0;
}
`,
    ],
    note: "Каркас це два лічильники, макроси CHECK і EXPECT_EQ із <code>__LINE__</code> та <code>#cond</code>, обгортка <code>do { } while (0)</code> і код виходу. Аргументи макроса обчислюйте один раз, у тимчасових змінних.",
    work: "Так влаштовані Unity для мікроконтролерів, Check і munit: макроси з номером рядка, лічильники й підсумок. Власного каркаса на кілька десятків рядків часто досить для прошивки чи малої бібліотеки, де зайва залежність недоречна.",
    tasks: [
      "Навіщо макрос загортають у <code>do { … } while (0)</code> і що зламається в <code>if (ok) CHECK(x); else report();</code> без цієї обгортки?",
      "Що надрукує і як змінить <code>i</code> вираз <code>MAX(i++, 3)</code> при <code>i = 5</code>, і чому EXPECT_EQ кладе аргументи в тимчасові змінні?",
    ],
  },
  {
    t: "Тестування функцій із введенням-виведенням: fmemopen",
    ch: "Тестування й якість",
    easy: "fmemopen це віртуальний файл у пам'яті: ви підсовуєте функції рядок, ніби файл, а вона не помічає підміни. open_memstream працює навпаки: збирає все, що функція записала, у рядок, який можна порівняти.",
    p: [
      "Функція, що читає з <code>stdin</code> або пише в <code>stdout</code>, незручна для тесту: вхід треба вводити руками, а вивід розбирати очима. Вихід у тому, щоб приймати <code>FILE *in</code> і <code>FILE *out</code> параметрами. Справжня програма передає <code>stdin</code> і <code>stdout</code>, а тест передає потоки в пам'яті. Тоді вся логіка перевіряється автоматично, без терміналу, файлів на диску та шляхів.",
      "<code>fmemopen(buf, size, \"r\")</code> повертає <code>FILE *</code>, що читає байти з буфера <code>buf</code>. Далі працюють звичайні <code>fgets</code>, <code>fscanf</code>, <code>getc</code>, а в кінці буфера настає <code>EOF</code>. Функція входить у POSIX 2008, а не в стандарт C, тому з <code>-std=c11</code> її оголошення сховане, доки першим рядком файлу не стоїть <code>#define _POSIX_C_SOURCE 200809L</code>. Перший аргумент має бути змінюваним: передавайте масив <code>char buf[]</code>, а не рядковий літерал.",
      "Для виводу є <code>open_memstream(&amp;buf, &amp;size)</code>: вона виділяє пам'ять сама й росте за потреби. Усе записане стає видимим у <code>buf</code> лише після <code>fflush</code> або <code>fclose</code>, і тільки тоді <code>buf</code> закінчується нулем, а <code>size</code> містить довжину. Пастка: читати <code>buf</code> до закриття потоку, адже там може бути порожньо чи застаріло. Після порівняння не забудьте <code>free(buf)</code>: пам'ять виділила бібліотека, але власником після <code>fclose</code> стаєте ви.",
      "Зберіть це в допоміжну функцію: <code>run(const char *input)</code> відкриває вхід, створює потік виводу, викликає перевірювану функцію, закриває потоки й повертає <code>char *</code> із результатом (його звільняє викликач). Тоді тест знову стає таблицею <code>{name, in, want}</code> з минулих уроків, лише <code>got</code> тепер рядок, а порівнюють його через <code>strcmp</code>. Нова перевірка це один рядок таблиці.",
      "Порівнюйте весь вивід, включно з кінцевим <code>\\n</code>: зайвий пробіл чи забутий перенос рядка і є дефектом, який користувач помітить першим. Реалізації по-різному ставляться до крайніх випадків (наприклад, до нульового розміру буфера), тому після <code>fmemopen</code> і <code>open_memstream</code> завжди перевіряйте результат на <code>NULL</code>: у тесті для цього вистачить <code>assert</code> або <code>abort</code>.",
      "Є й додаткова користь: функція з <code>FILE *</code> працює однаково з файлом, терміналом, <code>tmpfile()</code> і пам'яттю. Це приклад проєктування «під тестування»: залежності (звідки читаємо, куди пишемо) передаються ззовні, а не зашиті в тіло. Та сама ідея знадобиться в наступній главі, коли ми писатимемо розбір CSV та JSON: парсер бере потік і не знає, звідки той прийшов.",
    ],
    code: [
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>

static int sum_stream(FILE *in) {
    int sum = 0;
    int v;
    while (fscanf(in, "%d", &v) == 1) {
        sum += v;
    }
    return sum;
}

int main(void) {
    char text[] = "10 20\n30\n";
    FILE *in = fmemopen(text, sizeof text - 1, "r");
    if (in == NULL) {
        return 1;
    }
    printf("сума=%d\n", sum_stream(in));
    fclose(in);
    return 0;
}
`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void print_report(FILE *out, const char *name, int score) {
    fprintf(out, "%-6s|%3d\n", name, score);
}

int main(void) {
    char *buf = NULL;
    size_t size = 0;
    FILE *out = open_memstream(&buf, &size);
    if (out == NULL) {
        return 1;
    }
    print_report(out, "ann", 7);
    print_report(out, "bob", 100);
    fclose(out);
    printf("довжина=%zu\n%s", size, buf);
    int same = strcmp(buf, "ann   |  7\nbob   |100\n") == 0;
    printf("збіг з очікуваним: %s\n", same ? "так" : "ні");
    free(buf);
    return 0;
}
`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void upcase_lines(FILE *in, FILE *out) {
    int c;
    while ((c = fgetc(in)) != EOF) {
        fputc(c >= 'a' && c <= 'z' ? c - 'a' + 'A' : c, out);
    }
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
    upcase_lines(in, out);
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
        {"слово", "abc\n", "ABC\n"},
        {"змішане", "aB1 c\n", "AB1 C\n"},
        {"без переносу", "xy", "XY"},
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
      String.raw`// аварія: очікуваний вивід не збігається з справжнім (немає кінцевого \n), тест повертає код 1
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void greet(FILE *out, const char *name) {
    fprintf(out, "Привіт, %s!\n", name);
}

int main(void) {
    char *buf = NULL;
    size_t size = 0;
    FILE *out = open_memstream(&buf, &size);
    if (out == NULL) {
        return 2;
    }
    greet(out, "світе");
    fclose(out);
    int ok = strcmp(buf, "Привіт, світе!") == 0;
    printf("%s\n", ok ? "ok" : "FAIL: розбіжність виводу");
    free(buf);
    return ok ? 0 : 1;
}
`,
    ],
    note: "Передавайте функціям <code>FILE *in</code> і <code>FILE *out</code>: у програмі це <code>stdin</code> і <code>stdout</code>, у тесті <code>fmemopen</code> та <code>open_memstream</code>. Результат читайте після <code>fclose</code>, а буфер звільняйте.",
    work: "Так перевіряють форматери звітів, парсери конфігурацій і консольні утиліти: логіка бере <code>FILE *</code>, а тести годують її рядками з пам'яті. Без диска й терміналу прогін займає мить і однаковий скрізь.",
    tasks: [
      "Чому для <code>fmemopen</code> потрібен <code>#define _POSIX_C_SOURCE 200809L</code> і чому його пишуть першим рядком, до всіх <code>#include</code>?",
      "Що може бути в буфері <code>open_memstream</code>, якщо прочитати його до <code>fclose</code> чи <code>fflush</code>, і кому належить пам'ять після закриття потоку?",
    ],
  },
  {
    t: "Санітайзери й valgrind",
    ch: "Тестування й якість",
    adv: true,
    easy: "Санітайзери це сигналізація, яку компілятор вбудовує в програму: щойно код вийшов за межу масиву чи забув пам'ять, лунає тривога з точним рядком. Valgrind робить схоже ззовні, без перекомпіляції, зате повільніше.",
    p: [
      "У C помилка пам'яті часто не падає одразу. Запис за межу масиву мовчки псує сусідню змінну, а програма завершується з кодом 0 і «працює» ще тиждень. Невизначену поведінку (UB) компілятор вважає неможливою, тож він не зобов'язаний нічого повідомляти. Санітайзери перетворюють тиху помилку на гучну: програма збирається з додатковими перевірками й зупиняється на першому порушенні, показуючи, де саме воно сталося.",
      "<code>-fsanitize=address</code> (AddressSanitizer, ASan) обкладає виділені блоки «червоними зонами» й перевіряє кожен доступ до пам'яті. Він ловить вихід за межі стека, купи та глобальних даних, використання після <code>free</code>, подвійний <code>free</code> і, на Linux, витоки (LeakSanitizer). <code>-fsanitize=undefined</code> (UBSan) стежить за переповненням знакових цілих, діленням на нуль, зсувами за ширину типу, нульовими й невирівняними вказівниками. Додайте <code>-g</code> для рядків у звіті та <code>-O0</code> чи <code>-O1</code>, щоб стек лишався читабельним.",
      "Звіт ASan читають зверху вниз: перший рядок називає клас помилки (<code>heap-buffer-overflow</code>, <code>heap-use-after-free</code>, <code>stack-buffer-overflow</code>), далі стек того, хто порушив (<code>WRITE of size 4</code>), потім стек місця, де блок виділили, а для use-after-free ще й де його звільнили. Це три точки: хто зіпсував, хто виділив, хто звільнив. Адреси змінюються від запуску до запуску, їх ігноруйте, а дивіться на рядки на кшталт <code>main.c:7</code>. ThreadSanitizer (<code>-fsanitize=thread</code>) шукає гонки даних і не поєднується з ASan.",
      "<b>Valgrind</b> (<code>valgrind --leak-check=full ./prog</code>) працює з готовим бінарником: емулює процесор і стежить за кожним доступом. Він повільніший у десятки разів, зате знаходить читання неініціалізованих значень (<code>Conditional jump depends on uninitialised value</code>), яких ASan не бачить. Підсумок витоків ділиться на <code>definitely lost</code> (адресу втрачено: точно витік), <code>indirectly lost</code> (блок, до якого вів втрачений), <code>possibly lost</code> і <code>still reachable</code> (адреса ще є на виході, зазвичай не помилка).",
      "Пастки. Санітайзер бачить лише те, що виконалося: помилка в гілці, якої тести не торкнулись, лишиться непоміченою, тож прогін із санітайзерами поєднують із тестами з минулих уроків. Прапор потрібен і при компіляції, і при лінкуванні. Збірку з ним не віддають користувачам: вона повільніша, а ASan збільшує споживання пам'яті в рази. І якщо UBSan повідомляє про переповнення, не заглушайте повідомлення, а перепишіть вираз так, щоб UB не було (приклад 4).",
      "Практична схема: <code>make test</code> збирає тест двічі, звичайно й з <code>-fsanitize=address,undefined -fno-sanitize-recover=undefined</code>. Останній прапор робить кожне порушення UBSan фатальним, і CI справді падає, а не лише друкує рядок. У цьому уроці приклади безпечні (їх можна запустити під санітайзерами й отримати тишу), а звіти для помилок показано фрагментами: так ви впізнаєте їх до першої зустрічі.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int *squares(size_t n) {
    int *a = malloc(n * sizeof *a);
    if (a == NULL) {
        return NULL;
    }
    for (size_t i = 0; i < n; i++) {
        a[i] = (int)(i * i);
    }
    return a;
}

int main(void) {
    size_t n = 5;
    int *a = squares(n);
    if (a == NULL) {
        return 1;
    }
    long total = 0;
    for (size_t i = 0; i < n; i++) {
        total += a[i];
    }
    char name[8];
    snprintf(name, sizeof name, "%s", "ok");
    printf("сума=%ld, ім'я: %s (%zu байт)\n", total, name, strlen(name));
    free(a);
    return 0;
}
`,
      String.raw`// фрагмент: типовий звіт AddressSanitizer для запису за межу блока (адреси й порядок рядків залежать від системи)
$ gcc -std=c11 -g -O0 -fsanitize=address,undefined main.c -o prog
$ ./prog
==4021==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x602000000020
WRITE of size 4 at 0x602000000020 thread T0
    #0 0x5581 in main main.c:8
0x602000000020 is located 0 bytes after 16-byte region [0x602000000010,0x602000000020)
allocated by thread T0 here:
    #0 0x7f3a in malloc
    #1 0x5581 in main main.c:6
SUMMARY: AddressSanitizer: heap-buffer-overflow main.c:8 in main
`,
      String.raw`// фрагмент: звіт UBSan про переповнення та підсумок valgrind про витік
$ ./prog
main.c:5:14: runtime error: signed integer overflow: 2147483647 + 1 cannot be represented in type 'int'
$ valgrind --leak-check=full ./prog
==77== Conditional jump or move depends on uninitialised value(s)
==77==    at 0x1091: main (main.c:9)
==77== HEAP SUMMARY:
==77==     in use at exit: 40 bytes in 1 blocks
==77== 40 bytes in 1 blocks are definitely lost in loss record 1 of 1
==77==    at 0x484: malloc (vg_replace_malloc.c)
==77==    by 0x1086: main (main.c:6)
==77== LEAK SUMMARY: definitely lost: 40 bytes in 1 blocks
`,
      String.raw`#include <limits.h>
#include <stdio.h>

static int add_checked(int a, int b, int *out) {
    return !__builtin_add_overflow(a, b, out);
}

int main(void) {
    int r;
    if (add_checked(INT_MAX, 1, &r)) {
        printf("сума %d\n", r);
    } else {
        printf("INT_MAX + 1: переповнення виявлено без UB\n");
    }
    if (add_checked(40, 2, &r)) {
        printf("сума %d\n", r);
    }
    return 0;
}
`,
      String.raw`// аварія: запис через нульовий вказівник гарантовано зупиняє програму; під ASan звіт починається з «SEGV on unknown address 0x000000000000»
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = NULL;
    printf("зараз упаде\n");
    fflush(stdout);
    *(volatile int *)p = 1;
    return 0;
}
`,
    ],
    note: "ASan ловить вихід за межі, use-after-free і витоки, UBSan UB-арифметику; valgrind працює без перекомпіляції й бачить неініціалізоване. Читайте звіт так: що порушено, де, хто виділив, хто звільнив.",
    work: "У ядрі Linux (KASAN), Chromium і Firefox збірки з санітайзерами постійно працюють у CI й ловлять помилки пам'яті, що роками жили непоміченими. Тому тести без прогону під ASan і UBSan лише половина перевірки.",
    tasks: [
      "Чим у звіті ASan відрізняються <code>heap-buffer-overflow</code> і <code>heap-use-after-free</code> та які три місця (стеки) допомагають знайти причину?",
      "Чому прапор <code>-fsanitize</code> потрібен і при компіляції, і при лінкуванні та чому така збірка не підходить для релізу?",
    ],
  },
  {
    t: "Профілювання й оптимізація: -O2, gprof і perf",
    ch: "Тестування й якість",
    adv: true,
    easy: "Профілювання це діагностика програми: спершу вимірюємо, де болить, і лише потім лікуємо. Інакше можна годинами прискорювати функцію, що займає два відсотки роботи.",
    p: [
      "Правило Кнута каже: передчасна оптимізація корінь зла. Не тому, що швидкість неважлива, а тому, що інтуїція про «гарячі» місця майже завжди хибна. Порядок такий: спершу правильність (тести з минулих уроків), потім вимірювання, потім зміна найгарячішого місця, потім знову вимірювання й тести. Без тестів «швидша» версія може бути швидко неправильною: приклад 5 це показує.",
      "Найбільший виграш дає складність алгоритму, а не мікротрюки. Лінійний пошук у відсортованому масиві з 1024 елементів робить у середньому близько 500 порівнянь, двійковий близько 9. Наївний <code>fib(25)</code> робить 242785 викликів, а з запам'ятовуванням (мемоїзацією) 49. У цьому уроці ми міряємо кроки: лічильник порівнянь чи викликів дає однаковий результат на будь-якій машині, а час залежить від навантаження, кешу й частоти процесора. Тому в тестах порівнюють кроки, а не мілісекунди.",
      "Далі йде компілятор. <code>-O0</code> (за замовчуванням) майже нічого не оптимізує й дає зручний для налагодження код. <code>-O2</code> вмикає вбудовування функцій, винесення інваріантів із циклів, видалення мертвого коду та інші перетворення; <code>-O3</code> додає агресивніші (векторизацію, розгортання циклів) і не завжди швидший. Компілятор вважає, що UB немає, тому оптимізація виявляє приховані помилки: програма, що «працювала» на <code>-O0</code>, ламається на <code>-O2</code>. Це не баг компілятора, а сигнал шукати UB санітайзером.",
      "Для пошуку гарячих місць є два інструменти. <b>gprof</b>: збираєте з <code>-pg</code>, запускаєте (поруч з'являється <code>gmon.out</code>), потім <code>gprof ./prog gmon.out</code> показує плоский профіль (функції, відсоток часу, кількість викликів) і граф викликів. Він вставляє код підрахунку в кожну функцію, тому спотворює дрібні функції. <b>perf</b> (Linux) нічого не вставляє: <code>perf record</code> бере вибірки лічильника команд тисячі разів на секунду, а <code>perf report</code> показує, у яких функціях їх було найбільше. Для читабельних стеків збирайте з <code>-g -fno-omit-frame-pointer</code>.",
      "Читайте звіт критично. Колонка <code>self</code> це час у самій функції, <code>total</code> чи <code>children</code> разом із викликаними; гаряча функція має великий <code>self</code>. Профілюйте оптимізовану збірку з <code>-O2 -g</code>, бо профіль <code>-O0</code> показує інші вузькі місця, ніж реальна робота. Вхід має бути типовим: на крихітному все «миттєве». Пастка мікробенчмарків: якщо результат циклу ніде не використано, <code>-O2</code> просто видалить цикл і покаже «нескінченну» швидкість.",
      "Типові безкоштовні виграші: не викликати <code>strlen</code> в умові циклу (кожен виклик проходить рядок, разом виходить O(n²)), виносити з циклу те, що не змінюється, не виділяти пам'ять у гарячому циклі, обходити двовимірні масиви по рядках, бо пам'ять читається послідовно й кеш не промахується. Після кожної зміни запускайте тести. Якщо виграшу немає, поверніть код як було: простий код цінніший за «швидкий», який нічого не дав.",
    ],
    code: [
      String.raw`#include <stdio.h>

#define N 1024

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
    for (int i = 0; i < N; i++) {
        linear_search(i * 2, &lin);
        binary_search(i * 2, &bin);
    }
    printf("ключів: %d\n", N);
    printf("лінійний: %ld кроків, у середньому %ld\n", lin, lin / N);
    printf("двійковий: %ld кроків, у середньому %ld\n", bin, bin / N);
    return 0;
}
`,
      String.raw`#include <stdio.h>

static long calls;
static long memo[64];

static long fib_naive(int n) {
    calls++;
    return n < 2 ? n : fib_naive(n - 1) + fib_naive(n - 2);
}

static long fib_memo(int n) {
    calls++;
    if (n < 2) {
        return n;
    }
    if (memo[n] == 0) {
        long left = fib_memo(n - 1);
        long right = fib_memo(n - 2);
        memo[n] = left + right;
    }
    return memo[n];
}

int main(void) {
    long a = fib_naive(25);
    printf("наївний: fib(25)=%ld, викликів=%ld\n", a, calls);
    calls = 0;
    long b = fib_memo(25);
    printf("з пам'яттю: fib(25)=%ld, викликів=%ld\n", b, calls);
    return 0;
}
`,
      String.raw`// фрагмент: профіль gprof (відсотки й секунди залежать від машини, порядок рядків за self)
$ gcc -std=c11 -O2 -g -pg main.c -o prog
$ ./prog
$ gprof -b -p ./prog gmon.out
Flat profile:
Each sample counts as 0.01 seconds.
  %   cumulative   self              self     total
 time   seconds   seconds    calls  ms/call  ms/call  name
 92.31      0.12     0.12        1   120.00   120.00  count_pairs
  7.69      0.13     0.01     1000     0.01     0.01  hash_key
`,
      String.raw`// фрагмент: perf record, perf report і perf stat (числа залежать від машини)
$ gcc -std=c11 -O2 -g -fno-omit-frame-pointer main.c -o prog
$ perf record -g ./prog
$ perf report --stdio
# Overhead  Command  Shared Object  Symbol
    91.40%  prog     prog           [.] count_pairs
     6.12%  prog     prog           [.] hash_key
$ perf stat ./prog
     1 234 567 890      instructions
         345 678 901      cycles
           1 234 567      branch-misses
`,
      String.raw`// аварія: «швидка» перевірка степеня двійки без тесту: x & (x - 1) вважає нуль степенем двійки, assert це ловить
#include <assert.h>
#include <stdio.h>

static int is_pow2_slow(unsigned x) {
    unsigned p = 1;
    while (p < x) {
        p *= 2;
    }
    return p == x;
}

static int is_pow2_fast(unsigned x) {
    return (x & (x - 1)) == 0;
}

int main(void) {
    for (unsigned x = 1; x <= 64; x++) {
        assert(is_pow2_fast(x) == is_pow2_slow(x));
    }
    printf("для 1..64 версії збігаються\n");
    assert(is_pow2_fast(0) == is_pow2_slow(0));
    printf("для 0 теж\n");
    return 0;
}
`,
    ],
    note: "Спершу правильність і тести, потім вимірювання (gprof, perf), потім зміна гарячого місця й повторний вимір. Найбільше дає складність алгоритму; у тестах порівнюйте кроки, а не мілісекунди.",
    work: "Профілювання показує, що більшість часу забирають кілька функцій: саме їх оптимізують у відеокодеках, базах даних і ігрових рушіях. Перевірка кількості операцій у тестах не дає повільній версії непомітно повернутись.",
    tasks: [
      "Чому в тестах швидкодії надійніше порівнювати лічильники кроків, ніж виміряний час, і що саме ви б рахували для двійкового пошуку?",
      "Що показує колонка <code>self</code> у плоскому профілі gprof і чому профілювати варто збірку з <code>-O2</code>, а не з <code>-O0</code>?",
    ],
  },
  {
    t: "Стиль, clang-format і clang-tidy",
    ch: "Тестування й якість",
    easy: "Стиль коду це дорожня розмітка: вона не змінює, куди їде машина, але без неї на перехресті всі гальмують. clang-format розставляє розмітку автоматично, а clang-tidy чергує як інспектор і зупиняє за небезпечні маневри.",
    p: [
      "Код читають частіше, ніж пишуть, тому єдиний стиль економить увагу. Суперечки про відступи й фігурні дужки не варті часу: оберіть правила один раз, запишіть у файл і довірте машині. Правила діляться на форматування (відступи, дужки, пробіли: це робота clang-format) і зміст (імена, <code>const</code>, типи: тут допомагають clang-tidy та попередження компілятора).",
      "Домовленості, що працюють у більшості C-проєктів: імена в <code>snake_case</code>, макроси й константи <code>ВЕЛИКИМИ</code>, функції модуля з префіксом (<code>vec_push</code>), внутрішні функції й змінні файлу з <code>static</code>. Фігурні дужки навколо кожного тіла <code>if</code> і <code>for</code>, навіть однорядкового: інакше другий рядок із відступом, дописаний пізніше, опиниться поза умовою, і виникне помилка, схожа на відому дірку «goto fail».",
      "Змістовні звички: параметри-вказівники, через які функція лише читає, позначайте <code>const</code>; довжини й індекси тримайте в <code>size_t</code>, а не в <code>int</code>; не лишайте «магічних чисел» (<code>enum</code> чи <code>const</code> з іменем замість 86400); оголошуйте змінну там, де вона потрібна, одразу з ініціалізацією (C99); у функції <code>ctype</code> передавайте <code>(unsigned char)c</code>; перевіряйте результат <code>malloc</code>. Ранній <code>return</code> робить код плоским: менше вкладених <code>if</code>.",
      "<b>clang-format</b> читає файл <code>.clang-format</code> у корені проєкту (наприклад, <code>BasedOnStyle: LLVM</code>, <code>IndentWidth: 4</code>, <code>ColumnLimit: 100</code>) і переписує код: <code>clang-format -i main.c</code> змінює файл, а <code>clang-format --dry-run -Werror main.c</code> лише перевіряє й повертає ненульовий код, тож його ставлять у CI. Форматування не змінює поведінки програми, тому комітьте його окремо від логіки: тоді в diff видно лише суть.",
      "<b>clang-tidy</b> аналізує код і радить за групами перевірок: <code>bugprone-*</code> (підозрілі конструкції, наприклад <code>sizeof</code> від вказівника замість масиву), <code>clang-analyzer-*</code> (аналіз шляхів виконання: розіменування <code>NULL</code>, витоки, use-after-free), <code>readability-*</code> (дужки, довгі функції), <code>performance-*</code>. Запуск: <code>clang-tidy main.c -- -std=c11</code>, після <code>--</code> йдуть прапори компілятора. Рядок звіту має вигляд <code>файл:рядок:колонка: warning: опис [назва-перевірки]</code>: за назвою перевірку вимикають або шукають пояснення.",
      "Не забувайте компілятор: <code>-Wall -Wextra -Wpedantic -Wshadow -Wconversion</code> ловить недбалість безкоштовно, а <code>-Werror</code> у CI перетворює попередження на збій. Пастка: інструменти шумлять, і хибні спрацювання треба вимикати у файлі <code>.clang-tidy</code> з поясненням, а не ігнорувати весь звіт. Автоматика це перший рецензент: людина дивиться вже лише на логіку.",
    ],
    code: [
      String.raw`#include <ctype.h>
#include <stdio.h>
#include <string.h>

enum { WORDS = 3 };

static size_t count_vowels(const char *s) {
    size_t count = 0;
    for (size_t i = 0; s[i] != '\0'; i++) {
        int c = tolower((unsigned char)s[i]);
        if (strchr("aeiou", c) != NULL) {
            count++;
        }
    }
    return count;
}

int main(void) {
    const char *words[WORDS] = {"Education", "rhythm", "Queue"};
    for (size_t i = 0; i < WORDS; i++) {
        printf("%-10s голосних: %zu\n", words[i], count_vowels(words[i]));
    }
    return 0;
}
`,
      String.raw`// фрагмент: файл .clang-format і команди (clang-format не змінює поведінку, лише вигляд)
BasedOnStyle: LLVM
IndentWidth: 4
ColumnLimit: 100
AllowShortIfStatementsOnASingleLine: Never
BreakBeforeBraces: Attach

$ clang-format -i main.c
$ clang-format --dry-run -Werror main.c
main.c:3:12: error: code should be clang-formatted [-Wclang-format-violations]
`,
      String.raw`// фрагмент: файл .clang-tidy і типовий звіт
Checks: 'bugprone-*,clang-analyzer-*,readability-braces-around-statements,-bugprone-easily-swappable-parameters'
WarningsAsErrors: ''

$ clang-tidy main.c -- -std=c11
main.c:6:5: warning: statement should be inside braces [readability-braces-around-statements]
main.c:9:20: warning: 'sizeof' on pointer: array size is not the pointer size [bugprone-sizeof-expression]
main.c:12:5: warning: Dereference of null pointer [clang-analyzer-core.NullDereference]
`,
      String.raw`#include <stdio.h>

static void print_reversed(const int *a, size_t n) {
    for (size_t i = n; i-- > 0;) {
        printf("%d ", a[i]);
    }
    printf("\n");
}

int main(void) {
    int v[] = {1, 2, 3, 4};
    size_t n = sizeof v / sizeof v[0];
    print_reversed(v, n);
    print_reversed(v, 0);
    return 0;
}
`,
      String.raw`// не компілюється: параметр const char * лише для читання, запис через нього не дозволений
#include <stdio.h>

static void shout(const char *s) {
    s[0] = 'X';
}

int main(void) {
    char word[] = "abc";
    shout(word);
    printf("%s\n", word);
    return 0;
}
`,
    ],
    note: "Один стиль на проєкт, записаний у <code>.clang-format</code>: форматування віддаємо машині. clang-tidy і <code>-Wall -Wextra</code> ловлять підозріле; <code>const</code>, <code>size_t</code>, дужки навколо кожного тіла й іменовані константи роблять код надійнішим.",
    work: "У ядрі Linux, LLVM і Chromium формат перевіряють автоматично до рев'ю, а clang-tidy та попередження компілятора стоять у CI. Тому рецензенти сперечаються про задум, а не про пробіли.",
    tasks: [
      "Чому радять ставити фігурні дужки навколо тіла <code>if</code> з одного оператора і що може піти не так, якщо їх пропустити?",
      "Чим відрізняються завдання clang-format і clang-tidy та що означає частина <code>-- -std=c11</code> у команді запуску clang-tidy?",
    ],
  },
];
