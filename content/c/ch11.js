export const LESSONS_11 = [
  {
    t: "Аргументи командного рядка й змінні середовища",
    ch: "Системне програмування",
    easy: "Аргументи схожі на записку, яку ви лишаєте майстрові разом з ключами: що саме зробити. Змінні середовища нагадують загальні правила в майстерні, що діють для всіх замовлень: програма читає їх, щоб знати умови роботи.",
    p: [
      "Програма не живе у вакуумі: утиліта має отримати від оболонки, що їй робити й з якими файлами. Без цього кожне значення довелося б вшивати в код і перекомпільовувати. Модель проста. Перед <code>main</code> система кладе в пам'ять нової програми масив рядків: це аргументи. Окремо вона дає ще один масив рядків вигляду <code>ІМ'Я=значення</code>: це середовище. Обидва лише копії, які програма може читати, а свої зміни не повертає нікуди.",
      "Повна форма головної функції: <code>int main(int argc, char *argv[])</code>. Тут <code>argc</code> це кількість рядків, а <code>argv</code> масив вказівників на них. Запис <code>char *argv[]</code> у параметрі означає те саме, що <code>char **argv</code>. Стандарт гарантує, що <code>argv[argc]</code> дорівнює <code>NULL</code>, тому масив можна обійти й без лічильника. Елемент <code>argv[0]</code> це ім'я, під яким запустили програму (воно може бути й порожнім), тож справжні аргументи починаються з індексу 1. У пісочниці Iteris аргументів немає, тому там <code>argc == 1</code>.",
      "Через це розбір завжди виносять у функцію <code>parse_args(int argc, char **argv, ...)</code> і перевіряють її власним масивом рядків: так роблять і в реальних проєктах, бо тест не може запускати програму з різними аргументами. Усередині розрізняють прапорці (<code>-v</code>), опції зі значенням (<code>-n 3</code> або <code>--name=x</code>) і позиційні аргументи. Числа читайте через <code>strtol</code>, а не <code>atoi</code>: <code>atoi</code> на сміття мовчки видає 0. Після <code>strtol</code> перевіряйте <code>errno</code>, що кінець не збігається з початком і що <code>*end == '\\0'</code>.",
      "Змінні середовища читає <code>getenv(name)</code>. Вона повертає вказівник на значення або <code>NULL</code>, якщо змінної немає. Рядок належить середовищу: його не можна змінювати й не можна звільняти через <code>free</code>, а після наступного <code>setenv</code> він здатен стати недійсним, тож потрібне значення копіюйте. Стандартна ідіома значення за замовчуванням: <code>const char *v = getenv(\"X\"); if (v == NULL) v = \"типово\";</code>. Передати <code>NULL</code> у <code>printf(\"%s\")</code> чи <code>strlen</code> означає невизначену поведінку.",
      "Змінювати середовище дозволяють POSIX-функції (під <code>-std=c11</code> потрібен <code>#define _POSIX_C_SOURCE 200809L</code> першим рядком, а для <code>putenv</code> замість нього <code>_XOPEN_SOURCE 700</code>). <code>setenv(name, value, overwrite)</code> копіює обидва рядки, а при <code>overwrite == 0</code> не чіпає наявну змінну. <code>unsetenv</code> видаляє її. А <code>putenv(\"A=b\")</code> нічого не копіює: середовище зберігає ваш вказівник. Тому рядок має жити довше за змінну (<code>static</code> або <code>malloc</code>); локальний масив стане висячим вказівником, щойно функція завершиться. Здебільшого беріть <code>setenv</code>. Зміни бачить лише поточний процес і його діти, оболонку не змінити.",
      "У тестах не покладайтеся на чужі змінні: <code>PATH</code>, <code>HOME</code>, <code>USER</code> різні на кожній машині й у пісочниці. Виставляйте власні з префіксом проєкту (<code>ITERIS_MODE</code>), а там, де не ставили, очікуйте <code>NULL</code>. Тоді результат не залежить від того, хто й де запустив програму.",
      "Про безпеку: і <code>argv</code>, і середовище це недовірений ввід. Довжини, діапазони й формат перевіряйте так само, як ввід користувача, особливо в програмах із підвищеними правами. Далі розберемо, куди писати повідомлення про неправильні аргументи: у <code>stderr</code>, і чому порядок виводу не такий очевидний, як здається.",
    ],
    code: [
      String.raw`#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("аргументів після імені програми: %d\n", argc - 1);
    for (int i = 1; i < argc; i++) {
        printf("  [%d] %s\n", i, argv[i]);
    }
    printf("argv[argc] == NULL: %s\n", argv[argc] == NULL ? "так" : "ні");
    return 0;
}
`,
      String.raw`#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int verbose;
    long count;
    int files;
} Opts;

static int parse_args(int argc, char **argv, Opts *o) {
    o->verbose = 0;
    o->count = 1;
    o->files = 0;
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-v") == 0) {
            o->verbose = 1;
        } else if (strcmp(argv[i], "-n") == 0) {
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
        } else {
            o->files++;
        }
    }
    return 0;
}

int main(void) {
    char *demo[] = {"tool", "-v", "-n", "3", "a.txt", "b.txt", NULL};
    Opts o;
    int rc = parse_args(6, demo, &o);
    printf("rc=%d verbose=%d count=%ld files=%d\n", rc, o.verbose, o.count, o.files);
    char *bad[] = {"tool", "-n", "x", NULL};
    printf("погане число: %d\n", parse_args(3, bad, &o));
    char *lone[] = {"tool", "-n", NULL};
    printf("немає значення: %d\n", parse_args(2, lone, &o));
    return 0;
}
`,
      String.raw`#define _XOPEN_SOURCE 700
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    unsetenv("ITERIS_DEMO_MODE");
    const char *before = getenv("ITERIS_DEMO_MODE");
    printf("до setenv: %s\n", before != NULL ? before : "(немає)");
    setenv("ITERIS_DEMO_MODE", "fast", 1);
    printf("після setenv: %s\n", getenv("ITERIS_DEMO_MODE"));
    setenv("ITERIS_DEMO_MODE", "slow", 0);
    printf("overwrite=0: %s\n", getenv("ITERIS_DEMO_MODE"));
    static char entry[] = "ITERIS_DEMO_LEVEL=7";
    putenv(entry);
    printf("putenv: %s\n", getenv("ITERIS_DEMO_LEVEL"));
    unsetenv("ITERIS_DEMO_MODE");
    printf("після unsetenv: %s\n", getenv("ITERIS_DEMO_MODE") == NULL ? "NULL" : "є");
    return 0;
}
`,
      String.raw`// аварія: getenv повернув NULL, і ми передали його в strlen
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    const char *path = getenv("ITERIS_NO_SUCH_VARIABLE");
    printf("довжина: %zu\n", strlen(path));
    return 0;
}
`,
    ],
    note: "Значення з <code>argv</code> і <code>getenv</code> це чужий ввід. <code>getenv</code> може повернути <code>NULL</code>, а <code>putenv</code> не копіює рядок. Числа розбирайте через <code>strtol</code> із перевіркою <code>errno</code> і хвоста, а не через <code>atoi</code>.",
    work: "Кожна консольна утиліта має прапорці на кшталт <code>-v</code> і <code>--help</code>, шляхи до файлів і режими. Змінні середовища задають налаштування без файлів: токени в CI, <code>NO_COLOR</code>, адреси сервісів у контейнерах. Для складних інтерфейсів беруть <code>getopt_long</code>.",
    tasks: [
      "Чому справжні аргументи користувача починаються з <code>argv[1]</code>, а не з <code>argv[0]</code>, і що гарантує стандарт щодо <code>argv[argc]</code>?",
      "Чим <code>putenv</code> відрізняється від <code>setenv</code> і що піде не так, якщо передати <code>putenv</code> локальний масив символів?",
    ],
  },
  {
    t: "Буферизація, fflush і stderr",
    ch: "Системне програмування",
    easy: "Буфер схожий на поштову скриньку, яку виймають лише раз на день: листи накопичуються й їдуть пачкою. Дешевше, ніж носити кожен лист окремо, але терміновий лист доведеться віднести самому, тобто викликати <code>fflush</code>.",
    p: [
      "Системний виклик <code>write</code> дорогий: треба перейти в ядро й повернутися. Якби <code>printf</code> звертався до ядра на кожен символ, програма працювала б у сотні разів повільніше. Тому <code>stdio</code> тримає в пам'яті буфер: дані копляться й віддаються ядру однією порцією. Побічний ефект у тому, що надруковане ще не обов'язково дійшло до місця призначення, і постає питання, коли воно дійде.",
      "Є три режими. Повна буферизація (<code>_IOFBF</code>) скидає буфер, коли він заповнений, і діє за замовчуванням для файлів і каналів. Рядкова (<code>_IOLBF</code>) скидає на кожному <code>'\\n'</code>, це типовий режим <code>stdout</code>, поки він підключений до термінала. Без буферизації (<code>_IONBF</code>) кожен виклик іде в ядро одразу, так працює <code>stderr</code>. Тому та сама програма в терміналі друкує одразу, а в каналі чи файлі вивалює все наприкінці. Тестова пісочниця читає <code>stdout</code> через канал, отже там повна буферизація.",
      "<code>fflush(f)</code> змушує віддати буфер потоку ядру негайно, <code>fflush(NULL)</code> робить це для всіх вихідних потоків. Автоматично буфери скидають <code>fclose</code>, нормальне повернення з <code>main</code> і <code>exit</code>. Класичний випадок: запрошення без переведення рядка, <code>printf(\"Ім'я: \"); fflush(stdout);</code>, бо без <code>fflush</code> воно не з'явиться до читання. Не викликайте <code>fflush(stdin)</code>: для вхідних потоків стандарт C цього не визначає. І пам'ятайте, що <code>fflush</code> віддає дані ядру, але не на диск; гарантію дає лише <code>fsync</code>.",
      "<code>setvbuf(f, buf, mode, size)</code> міняє режим і буфер. Викликати його треба після відкриття потоку й до будь-якого вводу-виводу. Якщо <code>buf</code> дорівнює <code>NULL</code>, бібліотека обере буфер сама; якщо передаєте свій, він має жити, поки потік відкритий: масив у функції, що вже завершилась, стане висячим буфером. Типові застосування: <code>_IOLBF</code> для журналу в каналі, щоб рядки не застрягали, і <code>_IONBF</code> під час відлагодження.",
      "Потік <code>stderr</code> призначений для діагностики. Розділяйте виходи: результат йде в <code>stdout</code>, повідомлення про помилки й підказки <code>usage</code> у <code>stderr</code>. Тоді команда <code>prog &gt; out.txt</code> не змішає їх, а скрипт, що читає <code>stdout</code>, не побачить сторонніх рядків. Порядок між двома потоками не гарантований: коли <code>stdout</code> буферизований, повідомлення про помилку здатне з'явитися раніше за вивід, надрукований до нього. Тому тести платформи перевіряють лише <code>stdout</code>.",
      "Найпідступніша пастка: втрачений вивід. <code>abort()</code>, смерть від сигналу чи <code>_exit()</code> не скидають буфери, тож <code>printf(\"дійшли сюди\")</code> без <code>'\\n'</code> і без <code>fflush</code> просто зникне. Ви шукатимете помилку там, де програма не доходила, а вона була раніше. Для відлагоджувального друку користуйтеся <code>stderr</code>. Те саме стосується <code>fork</code>: дочірній процес успадкує копію непорожнього буфера й надрукує її вдруге.",
      "Дізнатися, скільки байтів уже в ядрі, можна без здогадок: <code>fstat(fileno(f), &amp;st)</code> показує <code>st_size</code> файлу. Приклади нижче саме так і спостерігають режими. Далі розберемо розбір текстових форматів, починаючи з CSV.",
    ],
    code: [
      String.raw`#include <stdio.h>

int main(void) {
    printf("Результат: ");
    fflush(stdout);
    fprintf(stderr, "діагностика: обчислюю\n");
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    printf("%d\n", sum);
    return 0;
}
`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <sys/stat.h>

static long on_disk(FILE *f) {
    struct stat st;
    if (fstat(fileno(f), &st) != 0) {
        return -1;
    }
    return (long)st.st_size;
}

int main(void) {
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    setvbuf(f, NULL, _IOFBF, 4096);
    fputs("abc\n", f);
    printf("записано, ядро бачить: %ld\n", on_disk(f));
    fflush(f);
    printf("після fflush: %ld\n", on_disk(f));
    fputs("defg\n", f);
    printf("ще рядок у буфері: %ld\n", on_disk(f));
    fclose(f);
    return 0;
}
`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <sys/stat.h>

static long on_disk(FILE *f) {
    struct stat st;
    if (fstat(fileno(f), &st) != 0) {
        return -1;
    }
    return (long)st.st_size;
}

static void probe(int mode, const char *name) {
    FILE *f = tmpfile();
    if (f == NULL) {
        return;
    }
    setvbuf(f, NULL, mode, 4096);
    fputs("x", f);
    long first = on_disk(f);
    fputs("y\n", f);
    long second = on_disk(f);
    printf("%s: після x = %ld, після y\\n = %ld\n", name, first, second);
    fclose(f);
}

int main(void) {
    probe(_IOFBF, "повна");
    probe(_IOLBF, "рядкова");
    probe(_IONBF, "без буферизації");
    return 0;
}
`,
      String.raw`// аварія: abort() не скидає буфери, друк без \n зникне
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    printf("це повідомлення застрягне в буфері");
    abort();
}
`,
    ],
    note: "Надруковане ще не означає дійшло: при <code>abort</code>, сигналі чи <code>_exit</code> буфер <code>stdout</code> пропаде. Діагностику пишіть у <code>stderr</code> або викликайте <code>fflush</code>, а порядок між <code>stdout</code> і <code>stderr</code> не вважайте гарантованим.",
    work: "Запрошення в інтерактивних програмах, журнали в канали й контейнери (де <code>stdout</code> повністю буферизований), розділення результату й діагностики в утилітах командного рядка, <code>fflush</code> перед <code>fork</code> і <code>setvbuf</code> для швидкого масового запису.",
    tasks: [
      "Чому програма в терміналі друкує рядки одразу, а після перенаправлення в файл показує все лише наприкінці, і який режим буферизації в кожному випадку?",
      "Що станеться з текстом <code>printf(\"abc\")</code> без переведення рядка, якщо одразу викликати <code>abort()</code>, і як цього уникнути?",
    ],
  },
  {
    t: "Розбір текстових форматів: CSV",
    ch: "Системне програмування",
    easy: "CSV це таблиця, записана рядками: кома відокремлює клітинки, перенос рядка відокремлює рядки. Розбирати її можна лише формально: клітинка в лапках може містити й кому, і лапку, тож проста «розрізати по комі» її ламає.",
    p: [
      "CSV найпоширеніший формат обміну таблицями: експорт із електронних таблиць, звіти, журнали. Здається, що достатньо розрізати рядок по комі, але формат допускає порожні клітинки, лапки навколо клітинки, кому та лапку всередині клітинки (її подвоюють: <code>\"\"</code>). Тому розбір CSV це маленький автомат зі станами «поза лапками» і «у лапках». Мета уроку: функція з чітким контрактом, яку можна перевірити таблицею тестів.",
      "Модель проста: на вході змінюваний рядок, на виході масив вказівників на поля <code>char *out[]</code>, а результат функції це кількість полів (<code>size_t</code>). Поля не копіюються: ми ставимо <code>'\\0'</code> замість роздільників прямо в буфері, і кожен вказівник дивиться всередину нього. Поле живе, доки живий буфер; якщо воно потрібне довше, робіть копію (<code>strdup</code>). Параметр <code>max</code> обмежує масив: зайві поля не пишемо за межу, а відкидаємо.",
      "Пастка <code>strtok</code>: вона зливає підряд роздільники в один і пропускає порожні поля, тож <code>\"ann,,42,\"</code> дасть два поля замість чотирьох. До того ж <code>strtok</code> зберігає стан у прихованій статичній змінній і не годиться для вкладених викликів чи потоків. Для CSV порожнє поле це значення, тому розбираємо циклом на <code>strchr</code>, який нічого не пропускає (приклад 1).",
      "Поле в лапках читаємо за двома вказівниками: <code>s</code> іде по входу, <code>w</code> пише результат. Відкриваюча лапка пропускається, пара <code>\"\"</code> дає одну <code>\"</code>, одиночна лапка закриває поле, а все до наступної коми ігнорується. Оскільки <code>w</code> ніколи не випереджає <code>s</code>, переписувати поле на тому самому місці безпечно, а скорочення (лапки зникли) лише звільняє місце. Не закрита лапка не повинна виходити за кінець рядка: перевіряйте <code>'\\0'</code>.",
      "Числа з клітинок перетворюйте через <code>strtol</code> чи <code>strtod</code> із перевіркою хвоста, як у главі про помилки, а не через <code>atoi</code>. Контракт помилки визначте заздалегідь: пропустити рядок і порахувати його чи зупинитися. У прикладі 3 поганий рядок друкується з номером і не псує підсумок. Заголовок таблиці пропускайте або зіставляйте назви колонок з індексами, щоб порядок колонок не був зашитий.",
      "Що перевірити в таблиці тестів: порожній рядок (одне порожнє поле), останнє поле порожнє, лапки з комою всередині, подвоєні лапки, символ <code>'\\r'</code> перед переносом (файли з Windows; його прибирають до розбору), більше полів, ніж <code>max</code>. У реальній програмі рядки приходять із <code>fgets</code>: якщо в буфері немає <code>'\\n'</code>, рядок довший за буфер, і це окрема помилка, а не тихе обрізання. Не змішуйте розбір і введення-виведення: функція бере рядок, а читання лишається викликачеві.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <string.h>

static size_t split(char *line, char sep, char **out, size_t max) {
    size_t n = 0;
    char *p = line;
    while (n < max) {
        out[n++] = p;
        char *q = strchr(p, sep);
        if (q == NULL) {
            break;
        }
        *q = '\0';
        p = q + 1;
    }
    return n;
}

int main(void) {
    char line[] = "ann,,42,";
    char *f[8];
    size_t n = split(line, ',', f, 8);
    printf("полів: %zu\n", n);
    for (size_t i = 0; i < n; i++) {
        printf("[%zu] \"%s\"\n", i, f[i]);
    }
    char again[] = "ann,,42,";
    size_t k = 0;
    for (char *t = strtok(again, ","); t != NULL; t = strtok(NULL, ",")) {
        k++;
    }
    printf("strtok бачить лише %zu\n", k);
    return 0;
}
`,
      String.raw`#include <stdio.h>

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
    char line[] = "id,\"Іваненко, Петро\",\"say \"\"hi\"\"\",";
    char *f[8];
    size_t n = parse_line(line, f, 8);
    printf("полів: %zu\n", n);
    for (size_t i = 0; i < n; i++) {
        printf("[%zu] %s\n", i, f[i]);
    }
    return 0;
}
`,
      String.raw`#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static size_t split(char *line, char sep, char **out, size_t max) {
    size_t n = 0;
    char *p = line;
    while (n < max) {
        out[n++] = p;
        char *q = strchr(p, sep);
        if (q == NULL) {
            break;
        }
        *q = '\0';
        p = q + 1;
    }
    return n;
}

int main(void) {
    const char *data = "name,qty\nbolt,10\nnut,x\nscrew,5\n";
    long total = 0;
    int lineno = 0;
    const char *p = data;
    while (*p != '\0') {
        const char *nl = strchr(p, '\n');
        size_t len = nl != NULL ? (size_t)(nl - p) : strlen(p);
        char buf[64];
        if (len >= sizeof buf) {
            printf("рядок %d задовгий\n", lineno + 1);
            return 1;
        }
        memcpy(buf, p, len);
        buf[len] = '\0';
        p += len + (nl != NULL ? 1 : 0);
        lineno++;
        if (lineno == 1) {
            continue;
        }
        char *f[4];
        size_t n = split(buf, ',', f, 4);
        char *end;
        errno = 0;
        long qty = n == 2 ? strtol(f[1], &end, 10) : 0;
        if (n != 2 || errno != 0 || end == f[1] || *end != '\0') {
            printf("рядок %d: погане число\n", lineno);
            continue;
        }
        total += qty;
    }
    printf("разом: %ld\n", total);
    return 0;
}
`,
      String.raw`// аварія: запис має 2 поля замість очікуваних 3, assert зупиняє програму
#include <assert.h>
#include <stdio.h>
#include <string.h>

static size_t split(char *line, char sep, char **out, size_t max) {
    size_t n = 0;
    char *p = line;
    while (n < max) {
        out[n++] = p;
        char *q = strchr(p, sep);
        if (q == NULL) {
            break;
        }
        *q = '\0';
        p = q + 1;
    }
    return n;
}

int main(void) {
    char good[] = "a,b,c";
    char bad[] = "a,b";
    char *f[8];
    assert(split(good, ',', f, 8) == 3);
    printf("перший запис: 3 поля\n");
    assert(split(bad, ',', f, 8) == 3);
    printf("другий запис: 3 поля\n");
    return 0;
}
`,
    ],
    note: "Розбирайте CSV автоматом із двома станами, на місці й без <code>strtok</code>, що ковтає порожні поля. Лапки, подвоєні лапки, порожній рядок, <code>'\\r'</code> і перебір полів занесіть у таблицю тестів.",
    work: "CSV читають імпорт у бази, експорт банківських виписок, телеметрія й журнали подій. Власний розбір з обмеженням полів і явними помилками рядків не падає на «брудних» даних зі звітів, які складали люди.",
    tasks: [
      "Скільки полів дасть <code>strtok</code> для <code>\"ann,,42,\"</code>, скільки дасть цикл на <code>strchr</code> і чому для CSV правильний другий результат?",
      "Чому при читанні поля в лапках безпечно переписувати його на тому самому місці вказівником <code>w</code>, який іде за <code>s</code>?",
    ],
  },
  {
    t: "Розбір JSON вручну",
    ch: "Системне програмування",
    easy: "Рекурсивний розбір JSON схожий на читання вкладених матрьошок: бачите відкриту дужку, розкриваєте вкладену фігурку тією самою процедурою, а коли дужка закрита, повертаєтесь на рівень вище.",
    p: [
      "JSON є всюди: відповіді веб-сервісів, налаштування, обмін між програмами. У стандартній бібліотеці C його немає, і в справжньому проєкті беруть готову (cJSON, jansson), але розбір вручну вчить головного: як читати вкладену структуру з недовіреного вводу, не виходячи за межі рядка. Граматика коротка: значення це об'єкт, масив, рядок, число, <code>true</code>, <code>false</code> або <code>null</code>.",
      "Метод називається рекурсивним спуском: на кожне правило граматики одна функція. Вона приймає <code>const char *p</code>, тобто «курсор» на поточне місце в тексті, і повертає курсор одразу за розібраним або <code>NULL</code> при помилці. Глобальних змінних немає: стан у курсорі. Перед кожним токеном викликаємо <code>skip_ws</code> (пробіл, табуляція, <code>'\\n'</code>, <code>'\\r'</code>). Масив і об'єкт викликають <code>value</code>, а та викликає їх: рекурсія природно повторює вкладеність.",
      "Рядки в JSON беруть у лапки; усередині дозволені екрани <code>\\\"</code>, <code>\\\\</code>, <code>\\/</code>, <code>\\n</code>, <code>\\t</code> тощо та <code>\\uXXXX</code>, а керуючі символи з кодом менше 0x20 заборонені. Байти UTF-8 від 0x80 копіюємо як є. Невідомий екран найпростіше вважати помилкою. Якщо рядок копіюється в буфер, перевіряйте <code>cap</code> на кожному символі (приклад 2), інакше довгий рядок перепише чужу пам'ять.",
      "Числа спокушають викликом <code>strtod</code>, але він ліберальніший за JSON: приймає <code>0x1F</code>, <code>inf</code>, <code>nan</code>, <code>+5</code>, а за локалі з десятковою комою розбере <code>2,5</code> інакше. Приклад 1 показує <code>0x1F</code> як 31. Тож перед викликом перевіряйте, що число починається з <code>'-'</code> чи цифри, а для строгого розбору пильнуйте ведучі нулі й формат. Локаль у програмі, що читає JSON, тримайте <code>\"C\"</code>.",
      "Рекурсія на недовіреному вводі небезпечна: <code>[[[[…</code> з мільйоном дужок вичерпає стек, і програма впаде. Тому <code>value</code> веде глибину й відмовляється, коли вона перевищує ліміт (приклад 4: 100 дужок при ліміті 32). Не забувайте й перевірку після значення верхнього рівня: далі мають бути лише пробіли, бо інакше <code>[1] x</code> буде «валідним». Коми в кінці, <code>{\"a\" 1}</code>, не закриті лапки це помилки, які кожна функція ловить сама.",
      "Тест тут табличний: валідні й невалідні документи з очікуванням 1 чи 0. Для повідомлень корисно повертати зсув помилки («байт 7»), а не просто <code>NULL</code>. Валідатор з прикладу 3 не виділяє пам'ять, тому й не тече. Щоб дістати дані, будують дерево вузлів у купі з рекурсивним <code>free</code>, але форма розбору лишається та сама.",
    ],
    code: [
      String.raw`#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>

static const char *skip_ws(const char *p) {
    while (*p == ' ' || *p == '\t' || *p == '\n' || *p == '\r') {
        p++;
    }
    return p;
}

static const char *parse_number(const char *p, double *out) {
    char *end;
    double v = strtod(p, &end);
    if (end == p) {
        return NULL;
    }
    *out = v;
    return end;
}

int main(void) {
    const char *inputs[] = {"  -12.5e1 ", "7", "abc", "0x1F"};
    for (size_t i = 0; i < sizeof inputs / sizeof inputs[0]; i++) {
        double v = 0;
        const char *rest = parse_number(skip_ws(inputs[i]), &v);
        if (rest == NULL) {
            printf("'%s': не число\n", inputs[i]);
        } else {
            printf("'%s': %g\n", inputs[i], v);
        }
    }
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <string.h>

static const char *parse_string(const char *p, char *out, size_t cap) {
    if (*p != '"') {
        return NULL;
    }
    p++;
    size_t n = 0;
    while (*p != '"') {
        char c = *p;
        if (c == '\0' || (unsigned char)c < 0x20) {
            return NULL;
        }
        if (c == '\\') {
            p++;
            switch (*p) {
            case '"':
                c = '"';
                break;
            case '\\':
                c = '\\';
                break;
            case 'n':
                c = '\n';
                break;
            default:
                return NULL;
            }
        }
        if (n + 1 >= cap) {
            return NULL;
        }
        out[n++] = c;
        p++;
    }
    out[n] = '\0';
    return p + 1;
}

int main(void) {
    const char *inputs[] = {"\"abc\"", "\"a\\\"b\\n\"", "\"незакрита", "\"довгий рядок\""};
    for (size_t i = 0; i < sizeof inputs / sizeof inputs[0]; i++) {
        char buf[8];
        const char *rest = parse_string(inputs[i], buf, sizeof buf);
        if (rest == NULL) {
            printf("%zu: помилка\n", i);
        } else {
            printf("%zu: довжина %zu\n", i, strlen(buf));
        }
    }
    return 0;
}
`,
      String.raw`#include <ctype.h>
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
        const char *text;
        int want;
    } docs[] = {
        {"{\"a\": [1, 2, {\"b\": null}], \"c\": \"x\"}", 1},
        {"[true, false, null]", 1},
        {"  42  ", 1},
        {"[1, 2,]", 0},
        {"{\"a\" 1}", 0},
        {"\"abc", 0},
        {"[1] x", 0},
    };
    int failed = 0;
    for (size_t i = 0; i < sizeof docs / sizeof docs[0]; i++) {
        int got = valid(docs[i].text);
        printf("%s %zu: %s\n", got == docs[i].want ? "ok  " : "FAIL", i, got ? "валідний" : "помилка");
        failed += got != docs[i].want;
    }
    return failed ? 1 : 0;
}
`,
      String.raw`// аварія: без ліміту глибини 100 вкладених дужок вичерпували б стек, з лімітом розбір відмовляє, і assert зупиняє програму
#include <assert.h>
#include <stdio.h>
#include <string.h>

static const char *nested(const char *p, int depth) {
    if (depth > 32) {
        return NULL;
    }
    if (*p == '[') {
        p = nested(p + 1, depth + 1);
        if (p == NULL) {
            return NULL;
        }
        return *p == ']' ? p + 1 : NULL;
    }
    return p;
}

int main(void) {
    char shallow[16];
    memset(shallow, '[', 3);
    memset(shallow + 3, ']', 3);
    shallow[6] = '\0';
    assert(nested(shallow, 0) != NULL);
    printf("3 рівні: прийнято\n");
    char deep[256];
    memset(deep, '[', 100);
    memset(deep + 100, ']', 100);
    deep[200] = '\0';
    assert(nested(deep, 0) != NULL);
    printf("100 рівнів: прийнято\n");
    return 0;
}
`,
    ],
    note: "Рекурсивний спуск: функція на правило граматики, курсор <code>const char *p</code> і <code>NULL</code> для помилки. Обмежуйте глибину й довжину, перевіряйте хвіст після значення, не вірте <code>strtod</code> у строгості.",
    work: "Конфігурації, відповіді API й обмін між службами йдуть у JSON, а вбудовані системи й утиліти часто розбирають його власним малим парсером без залежностей. Ліміти глибини й розміру захищають від навмисно зламаного вводу.",
    tasks: [
      "Чому розбір JSON потребує ліміту глибини і що саме станеться без нього на вводі з мільйоном символів <code>[</code>?",
      "Які рядки <code>strtod</code> прийме, а JSON відхилить, і як перевірити число перед викликом <code>strtod</code>?",
    ],
  },
  {
    t: "Порядок байтів і бінарні формати",
    ch: "Системне програмування",
    easy: "Порядок байтів схожий на запис дати: 25.12.2026 чи 2026-12-25. Цифри ті самі, але домовитись про порядок треба, інакше два боки прочитають різні числа. У бінарному форматі ця домовленість записана в специфікації.",
    p: [
      "Коли програма пише число у файл чи шле його в мережу, воно перетворюється на послідовність байтів. Для 32-бітного <code>0x12345678</code> байтів чотири, і постає питання, який іде першим. Порядок <b>big-endian</b> починає зі старшого (<code>12 34 56 78</code>), його називають мережевим. <b>Little-endian</b> починає з молодшого (<code>78 56 34 12</code>): так працюють x86 та більшість ARM. Обидва порядки законні, але файл, записаний в одному й прочитаний у другому, дасть інше число, тож формат фіксує порядок раз і назавжди.",
      "Звідси головна пастка: <code>fwrite(&amp;x, sizeof x, 1, f)</code> чи <code>memcpy</code> у буфер пишуть байти в порядку <i>цього</i> процесора, тобто файл виходить непереносним. Правильний спосіб: серіалізація зсувами. <code>b[0] = (uint8_t)(v &gt;&gt; 24)</code> бере старший байт значення за будь-якого процесора, бо зсув працює зі значенням, а не з розкладкою пам'яті. Типи фіксованої ширини <code>uint8_t</code>, <code>uint16_t</code>, <code>uint32_t</code> походять із <code>&lt;stdint.h&gt;</code> (C99): розмір <code>int</code> і <code>long</code> між платформами різний.",
      "Читання роблять дзеркально: <code>(uint32_t)b[0] &lt;&lt; 24 | (uint32_t)b[1] &lt;&lt; 16 | …</code>. Приведення до <code>uint32_t</code> перед зсувом обов'язкове: <code>b[0]</code> розширюється до знакового <code>int</code>, і зсув байта від 0x80 в старший біт переповнює його, а це невизначена поведінка. Знакові значення зберігайте як беззнакові в доповняльному коді й повертайте знак явно на межі формату: перетворення <code>uint32_t</code> у <code>int32_t</code> для великих значень залежить від реалізації.",
      "Структури теж не пишіть цілком. У <code>struct { uint8_t tag; uint32_t id; }</code> компілятор вставляє вирівнювання (padding) між полями, його розмір і розкладка залежать від платформи, а байти вирівнювання не визначені. <code>#pragma pack</code> прибирає прогалини, але не порядок байтів і породжує невирівняний доступ. Так само не читайте буфер через <code>(uint32_t *)buf</code>: це порушує вирівнювання й правила псевдонімів. Пишіть і читайте поле за полем.",
      "Бінарний формат зазвичай має заголовок: <i>magic</i> (кілька байтів, які швидко відсікають чужі файли), версію (<code>uint16_t</code>), кількість чи довжину та самі дані. Декодер ніколи не довіряє довжині з даних: спершу перевіряє, що в буфері вистачає байтів, і лише потім читає. Кожна вада (коротко, не той magic, не та версія) має окремий код помилки, як у прикладі 3. Це та сама дисципліна, що й у розборі текстових форматів, лише без пробілів і лапок.",
      "Для мережі є <code>htons</code>, <code>htonl</code>, <code>ntohs</code>, <code>ntohl</code> із <code>&lt;arpa/inet.h&gt;</code> (POSIX): вони перетворюють число з порядку хоста в мережевий і назад. Для файлів і власних форматів явні зсуви простіші й переносимі. Перевіряйте кодек круговою перевіркою «закодувати, розкодувати, порівняти» на граничних значеннях (0, 1, 0x7F, 0x80, 0xFFFFFFFF), а вміст дивіться дампом, наприклад <code>xxd</code>.",
    ],
    code: [
      String.raw`#include <stdint.h>
#include <stdio.h>

static void put_u32_be(uint8_t *b, uint32_t v) {
    b[0] = (uint8_t)(v >> 24);
    b[1] = (uint8_t)(v >> 16);
    b[2] = (uint8_t)(v >> 8);
    b[3] = (uint8_t)v;
}

static void put_u32_le(uint8_t *b, uint32_t v) {
    b[0] = (uint8_t)v;
    b[1] = (uint8_t)(v >> 8);
    b[2] = (uint8_t)(v >> 16);
    b[3] = (uint8_t)(v >> 24);
}

static void dump(const char *label, const uint8_t *b, size_t n) {
    printf("%s:", label);
    for (size_t i = 0; i < n; i++) {
        printf(" %02x", b[i]);
    }
    printf("\n");
}

int main(void) {
    uint8_t buf[4];
    put_u32_be(buf, 0x12345678u);
    dump("big-endian   ", buf, sizeof buf);
    put_u32_le(buf, 0x12345678u);
    dump("little-endian", buf, sizeof buf);
    return 0;
}
`,
      String.raw`#include <stdint.h>
#include <stdio.h>

static void put_u32_be(uint8_t *b, uint32_t v) {
    b[0] = (uint8_t)(v >> 24);
    b[1] = (uint8_t)(v >> 16);
    b[2] = (uint8_t)(v >> 8);
    b[3] = (uint8_t)v;
}

static uint32_t get_u32_be(const uint8_t *b) {
    return (uint32_t)b[0] << 24 | (uint32_t)b[1] << 16 | (uint32_t)b[2] << 8 | (uint32_t)b[3];
}

int main(void) {
    static const uint32_t values[] = {0u, 1u, 0x7Fu, 0x80u, 0x80000000u, 0xFFFFFFFFu};
    int failed = 0;
    for (size_t i = 0; i < sizeof values / sizeof values[0]; i++) {
        uint8_t buf[4];
        put_u32_be(buf, values[i]);
        uint32_t back = get_u32_be(buf);
        printf("%s 0x%08x -> 0x%08x\n", back == values[i] ? "ok  " : "FAIL", (unsigned)values[i], (unsigned)back);
        failed += back != values[i];
    }
    return failed ? 1 : 0;
}
`,
      String.raw`#include <stdint.h>
#include <stdio.h>
#include <string.h>

enum { HDR = 8, ERR_SHORT = -1, ERR_MAGIC = -2, ERR_VERSION = -3 };

static void put_u16(uint8_t *b, uint16_t v) {
    b[0] = (uint8_t)v;
    b[1] = (uint8_t)(v >> 8);
}

static uint16_t get_u16(const uint8_t *b) {
    return (uint16_t)(b[0] | b[1] << 8);
}

static size_t encode(uint8_t *out, uint16_t version, const uint8_t *data, uint16_t len) {
    memcpy(out, "ITRS", 4);
    put_u16(out + 4, version);
    put_u16(out + 6, len);
    memcpy(out + HDR, data, len);
    return HDR + (size_t)len;
}

static int decode(const uint8_t *in, size_t n, uint16_t *len) {
    if (n < HDR) {
        return ERR_SHORT;
    }
    if (memcmp(in, "ITRS", 4) != 0) {
        return ERR_MAGIC;
    }
    if (get_u16(in + 4) != 1) {
        return ERR_VERSION;
    }
    *len = get_u16(in + 6);
    if (n < HDR + (size_t)*len) {
        return ERR_SHORT;
    }
    return 0;
}

int main(void) {
    uint8_t buf[64];
    const uint8_t data[] = {10, 20, 30};
    size_t n = encode(buf, 1, data, sizeof data);
    uint16_t len = 0;
    printf("кадр %zu байтів, decode=%d, len=%u\n", n, decode(buf, n, &len), (unsigned)len);
    printf("обрізаний: %d\n", decode(buf, n - 1, &len));
    buf[0] = 'X';
    printf("чужий magic: %d\n", decode(buf, n, &len));
    return 0;
}
`,
      String.raw`// фрагмент: запис структури цілком і чому так не роблять (розмір і порядок байтів залежать від платформи)
struct Rec {
    uint8_t tag;
    uint32_t id;
};

struct Rec r = {1, 42};
fwrite(&r, sizeof r, 1, f);

$ xxd data.bin
00000000: 0100 0000 2a00 0000
`,
      String.raw`// аварія: буфер коротший, ніж заявлено в заголовку, декодер повертає помилку, assert зупиняє програму
#include <assert.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

static int decode(const uint8_t *in, size_t n, uint16_t *len) {
    if (n < 4) {
        return -1;
    }
    *len = (uint16_t)(in[0] | in[1] << 8);
    return n < 2 + (size_t)*len ? -1 : 0;
}

int main(void) {
    const uint8_t ok[] = {2, 0, 7, 8};
    uint16_t len = 0;
    assert(decode(ok, sizeof ok, &len) == 0);
    printf("цілий кадр: len=%u\n", (unsigned)len);
    const uint8_t cut[] = {5, 0, 1, 2};
    assert(decode(cut, sizeof cut, &len) == 0);
    printf("обрізаний кадр прийнято\n");
    return 0;
}
`,
    ],
    note: "Пишіть і читайте байти явно, зсувами з <code>uint8_t</code>, <code>uint16_t</code>, <code>uint32_t</code>, а не <code>fwrite</code> зі структури. Порядок байтів і поля заголовка фіксує специфікація; декодер перевіряє довжину раніше за читання.",
    work: "Бінарні формати мають PNG, ZIP, ELF, мережеві протоколи й збережені ігри. Явна серіалізація дає файли, що однаково читаються на різних процесорах, а перевірка довжин захищає від зламаних чи шкідливих даних.",
    tasks: [
      "Чому <code>fwrite(&amp;x, sizeof x, 1, f)</code> для <code>uint32_t</code> дає непереносний файл, а серіалізація зсувами ні?",
      "Чому в <code>(uint32_t)b[0] &lt;&lt; 24</code> приведення до <code>uint32_t</code> стоїть перед зсувом і що буде без нього для байта 0x80?",
    ],
  },
  {
    t: "POSIX: файли, процеси й канали",
    ch: "Системне програмування",
    adv: true,
    easy: "Файловий дескриптор це номерок у гардеробі: ядро видає його за відкритий ресурс, а ви повертаєте номерок функціям читання й запису. Канал це труба між двома номерками: що вкинули з одного кінця, виходить з іншого.",
    p: [
      "Потоки <code>FILE *</code> з <code>stdio</code> лише обгортка з буфером у вашій програмі. Під ними лежать виклики POSIX: <code>open</code>, <code>read</code>, <code>write</code>, <code>close</code>. Ресурс описує <b>файловий дескриптор</b>: мале ціле, індекс у таблиці відкритих файлів процесу; 0, 1 і 2 це <code>stdin</code>, <code>stdout</code>, <code>stderr</code>. Під <code>-std=c11</code> потрібен <code>#define _POSIX_C_SOURCE 200809L</code> першим рядком, а заголовки це <code>&lt;unistd.h&gt;</code>, <code>&lt;fcntl.h&gt;</code>, <code>&lt;sys/stat.h&gt;</code>.",
      "<code>read</code> і <code>write</code> повертають <code>ssize_t</code>: кількість байтів, 0 для кінця файлу (у <code>read</code>) і -1 при помилці з кодом у <code>errno</code>. Головне: вони можуть обробити <i>менше</i>, ніж просили, особливо на каналах і сокетах. Також виклик може перерватися сигналом (<code>EINTR</code>), і його повторюють. Тому читають і пишуть у циклі, поки не зроблено все (<code>write_all</code>, <code>read_all</code>), а результат кожного виклику перевіряють: ігнорувати -1 означає губити дані мовчки.",
      "Дескриптори є обмеженим ресурсом: кожен <code>open</code>, <code>pipe</code>, <code>socket</code> потребує <code>close</code>, інакше процес поступово вичерпає ліміт (витік дескрипторів, як витік пам'яті, але з іншою помилкою <code>EMFILE</code>). <code>fclose</code> закриває потік разом з його дескриптором, тож двічі закривати не можна. <code>lseek</code> зсуває спільну позицію читання й запису, а <code>fstat</code> повертає метадані, зокрема розмір <code>st_size</code>. Приклад 1 пробігає все це на файлі з <code>tmpfile()</code>.",
      "<b>Канал</b> створює <code>pipe(int fds[2])</code>: <code>fds[0]</code> для читання, <code>fds[1]</code> для запису, байти йдуть в один бік за порядком (FIFO) без меж повідомлень. Читач побачить кінець файлу лише тоді, коли закриті <i>всі</i> копії записуючого кінця: найпоширеніша причина зависання «читаю вічно» це забутий <code>close(fds[1])</code>. Буфер каналу обмежений (часто 64 КіБ): якщо один процес пише більше, ніж може зберегти канал, і сам же не читає, він заблокується навічно. У прикладах дані малі.",
      "<code>fork()</code> створює копію процесу: у дитині повертає 0, у батька ідентифікатор дитини, при помилці -1. Дитина успадковує відкриті дескриптори (тому канал працює між ними) і копію буфера <code>stdio</code>, тому перед <code>fork</code> роблять <code>fflush</code>, а дитина закінчує через <code>_exit</code>, щоб не скинути той самий буфер удруге. <code>exec*</code> замінює образ процесу іншою програмою, <code>waitpid(pid, &amp;status, 0)</code> забирає код завершення (<code>WIFEXITED</code>, <code>WEXITSTATUS</code>) і не лишає «зомбі». Фрагмент 4 показує повну зв'язку; запускати <code>fork</code> у пісочниці не будемо.",
      "Типовий порядок: батько створює канал, робить <code>fork</code>; дитина закриває читальний кінець, через <code>dup2(fds[1], 1)</code> перенаправляє <code>stdout</code> у канал і викликає <code>execvp</code>; батько закриває записуючий кінець, читає вивід до кінця файлу й чекає <code>waitpid</code>. Пастки: не закритий зайвий кінець (зависання), немає <code>waitpid</code> (зомбі), використання дескриптора після <code>close</code> (його номер уже могли видати іншому файлу). Санітайзери таких помилок не бачать, тому кожен виклик перевіряйте на -1.",
    ],
    code: [
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>

int main(void) {
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    int fd = fileno(f);
    const char msg[] = "hello, fd";
    ssize_t w = write(fd, msg, sizeof msg - 1);
    struct stat st;
    if (w < 0 || fstat(fd, &st) != 0) {
        fclose(f);
        return 1;
    }
    off_t pos = lseek(fd, 0, SEEK_SET);
    char buf[32];
    ssize_t r = read(fd, buf, sizeof buf - 1);
    if (pos < 0 || r < 0) {
        fclose(f);
        return 1;
    }
    buf[r] = '\0';
    printf("записано %zd, розмір %lld, прочитано %zd: %s\n", w, (long long)st.st_size, r, buf);
    fclose(f);
    return 0;
}
`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <unistd.h>

int main(void) {
    int fds[2];
    if (pipe(fds) != 0) {
        return 1;
    }
    const char msg[] = "через канал";
    if (write(fds[1], msg, sizeof msg - 1) < 0) {
        return 1;
    }
    close(fds[1]);
    char buf[64];
    size_t total = 0;
    for (;;) {
        ssize_t n = read(fds[0], buf + total, 4);
        if (n < 0) {
            return 1;
        }
        if (n == 0) {
            break;
        }
        total += (size_t)n;
    }
    close(fds[0]);
    buf[total] = '\0';
    printf("прочитано %zu байтів частинами по 4: %s\n", total, buf);
    return 0;
}
`,
      String.raw`#define _POSIX_C_SOURCE 200809L
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
    char data[500];
    for (size_t i = 0; i < sizeof data; i++) {
        data[i] = (char)('a' + i % 26);
    }
    int fds[2];
    if (pipe(fds) != 0) {
        return 1;
    }
    int w = write_all(fds[1], data, sizeof data);
    close(fds[1]);
    char back[500];
    ssize_t n = read_all(fds[0], back, sizeof back);
    close(fds[0]);
    int same = w == 0 && n == (ssize_t)sizeof data;
    for (size_t i = 0; same && i < sizeof data; i++) {
        same = data[i] == back[i];
    }
    printf("записано: %s, прочитано: %zd, збіг: %s\n", w == 0 ? "ok" : "помилка", n, same ? "так" : "ні");
    return 0;
}
`,
      String.raw`// фрагмент: дитина виконує команду, батько читає її вивід через канал (типовий вивід, pid різні)
int fds[2];
pipe(fds);
fflush(stdout);
pid_t pid = fork();
if (pid == 0) {
    close(fds[0]);
    dup2(fds[1], 1);
    close(fds[1]);
    execlp("echo", "echo", "привіт з дитини", (char *)NULL);
    _exit(127);
}
close(fds[1]);
char buf[128];
ssize_t n = read(fds[0], buf, sizeof buf - 1);
close(fds[0]);
int status;
waitpid(pid, &status, 0);

$ ./prog
прочитано: привіт з дитини
код завершення: 0
`,
      String.raw`// аварія: read з недійсного дескриптора повертає -1 (EBADF), а assert вимагає невід'ємного результату
#define _POSIX_C_SOURCE 200809L
#include <assert.h>
#include <stdio.h>
#include <unistd.h>

int main(void) {
    char buf[8];
    ssize_t n = read(-1, buf, sizeof buf);
    printf("read повернув %zd\n", n);
    assert(n >= 0);
    printf("сюди не дійдемо\n");
    return 0;
}
`,
    ],
    note: "<code>read</code> і <code>write</code> можуть обробити менше, ніж просили, і перериватися з <code>EINTR</code>, тому їх викликають у циклі. Канал дає EOF лише коли закриті всі записуючі кінці; кожен дескриптор слід закрити, а кожен виклик перевірити.",
    work: "Оболонка, утиліти, веб-сервери й системи збірки тримаються на цих викликах: запуск програм через <code>fork</code> і <code>exec</code>, з'єднання їх каналами, обмін даними між процесами. Бібліотеки вищого рівня все одно викликають їх під капотом.",
    tasks: [
      "Чому читання з каналу може зависнути, хоча записуючий процес завершив писати, і яку дію забувають найчастіше?",
      "Чому <code>write</code> на каналі чи сокеті викликають у циклі і яку роль у ньому грають повернене значення й <code>EINTR</code>?",
    ],
  },
  {
    t: "Сокети: як це працює",
    ch: "Системне програмування",
    adv: true,
    easy: "Сокет це телефонна розетка програми: ви вмикаєте слухавку (<code>socket</code>), набираєте номер (<code>connect</code>) або чекаєте дзвінка (<code>listen</code> і <code>accept</code>), а далі просто говорите й слухаєте байти.",
    p: [
      "Сокет це дескриптор для обміну байтами між процесами, зокрема на різних машинах. Після створення з ним працюють як із файлом: <code>send</code> і <code>recv</code> (або <code>write</code> і <code>read</code>). Родини адрес: <code>AF_INET</code> і <code>AF_INET6</code> для IP-мережі, <code>AF_UNIX</code> для локальних сокетів. Типи: <code>SOCK_STREAM</code> (TCP: потік байтів із гарантією порядку й доставки) і <code>SOCK_DGRAM</code> (UDP: окремі пакети без гарантій). У пісочниці мережі немає, тому <code>socketpair</code> створює пару з'єднаних сокетів в одному процесі: код <code>send</code> і <code>recv</code> той самий, а портів і мережі не потрібно.",
      "Сервер проходить такий шлях: <code>socket</code>, <code>setsockopt(SO_REUSEADDR)</code>, <code>bind</code> (адреса й порт), <code>listen</code> (черга очікування), <code>accept</code>. Останній повертає <i>новий</i> дескриптор для кожного клієнта, а слухаючий лишається й чекає наступних. Клієнт простіший: <code>socket</code>, <code>connect</code>, <code>send</code>/<code>recv</code>, <code>close</code>. Порт у <code>struct sockaddr_in</code> записують у мережевому порядку через <code>htons</code>, як у уроці про порядок байтів. Фрагменти 3 і 4 показують обидва боки; запускати їх тут не будемо.",
      "Імена перетворює <code>getaddrinfo(host, service, &amp;hints, &amp;res)</code>: вона повертає список адрес для IPv4 й IPv6, а список звільняють <code>freeaddrinfo</code>. Це сучасний спосіб замість застарілого <code>gethostbyname</code>. Код, що перебирає список і пробує <code>connect</code> до першого успіху, працює з обома версіями IP без змін.",
      "Головне, що треба знати про TCP: це потік, а не повідомлення. Два <code>send</code> можуть прийти як один <code>recv</code>, а один <code>send</code> як два; <code>recv</code> повертає скільки встигло прийти, не більше й не менше. Тому потрібне обрамлення (<i>framing</i>): префікс довжини (скажімо, 4 байти в мережевому порядку) або роздільник, як <code>\\n</code> у текстових протоколах. Приймач читає заголовок, перевіряє довжину <i>до</i> читання тіла (інакше чужий пакет змусить виділити гігабайти) і читає рівно стільки байтів у циклі, як у прикладі 2.",
      "Закриття з'єднання видно з повернення <code>recv</code>: 0 означає, що співрозмовник закрив його або викликав <code>shutdown(SHUT_WR)</code>; це нормальний кінець, а не помилка, і цикл читання виходить. Значення -1 з <code>EINTR</code> повторюють, інші коди (<code>ECONNRESET</code>) повідомляють про збій. Запис у з'єднання, яке закрила інша сторона, надсилає процесу сигнал <code>SIGPIPE</code>, що за замовчуванням завершує програму: його ігнорують або передають <code>MSG_NOSIGNAL</code> й перевіряють <code>EPIPE</code>.",
      "Як обслужити багатьох клієнтів? Потік на кожного (наступний урок) простий, але дорогий для тисяч з'єднань. Мультиплексування (<code>select</code>, <code>poll</code>, <code>epoll</code>) чекає багатьох дескрипторів одним викликом. Все, що прийшло з мережі, це недовірений ввід: довжини, формат і час очікування (<code>SO_RCVTIMEO</code>) перевіряйте так само суворо, як у розборі файлів. А тестувати протокол найпростіше саме на <code>socketpair</code>: ті самі функції, без портів, мережі й залежності від чужих процесів.",
    ],
    code: [
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <sys/socket.h>
#include <unistd.h>

int main(void) {
    int sv[2];
    if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) != 0) {
        return 1;
    }
    const char req[] = "ping";
    if (send(sv[0], req, sizeof req - 1, 0) < 0) {
        return 1;
    }
    shutdown(sv[0], SHUT_WR);
    char buf[16];
    size_t total = 0;
    for (;;) {
        ssize_t n = recv(sv[1], buf + total, sizeof buf - 1 - total, 0);
        if (n < 0) {
            return 1;
        }
        if (n == 0) {
            break;
        }
        total += (size_t)n;
    }
    buf[total] = '\0';
    printf("сервер отримав: %s (%zu байтів)\n", buf, total);
    const char rep[] = "pong";
    if (send(sv[1], rep, sizeof rep - 1, 0) < 0) {
        return 1;
    }
    ssize_t n = recv(sv[0], buf, sizeof buf - 1, 0);
    if (n < 0) {
        return 1;
    }
    buf[n] = '\0';
    printf("клієнт отримав: %s\n", buf);
    close(sv[0]);
    close(sv[1]);
    return 0;
}
`,
      String.raw`#define _POSIX_C_SOURCE 200809L
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

static int send_frame(int fd, const char *s) {
    uint32_t len = (uint32_t)strlen(s);
    uint8_t hdr[4] = {(uint8_t)(len >> 24), (uint8_t)(len >> 16), (uint8_t)(len >> 8), (uint8_t)len};
    if (send_all(fd, hdr, sizeof hdr) != 0) {
        return -1;
    }
    return send_all(fd, s, len);
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
    const char *msgs[] = {"hello", "", "третє слово"};
    for (size_t i = 0; i < 3; i++) {
        if (send_frame(sv[0], msgs[i]) != 0) {
            return 1;
        }
    }
    for (size_t i = 0; i < 3; i++) {
        char buf[64];
        int n = recv_frame(sv[1], buf, sizeof buf);
        printf("кадр %zu: %d байтів [%s]\n", i + 1, n, n >= 0 ? buf : "помилка");
    }
    close(sv[0]);
    close(sv[1]);
    return 0;
}
`,
      String.raw`// фрагмент: скелет TCP-сервера (у пісочниці мережі немає, показано для розуміння)
int srv = socket(AF_INET, SOCK_STREAM, 0);
int yes = 1;
setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof yes);

struct sockaddr_in addr = {0};
addr.sin_family = AF_INET;
addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
addr.sin_port = htons(8080);

bind(srv, (struct sockaddr *)&addr, sizeof addr);
listen(srv, 16);

for (;;) {
    int cli = accept(srv, NULL, NULL);
    char buf[256];
    ssize_t n = recv(cli, buf, sizeof buf, 0);
    if (n > 0) {
        send(cli, buf, (size_t)n, 0);
    }
    close(cli);
}
`,
      String.raw`// фрагмент: клієнт через getaddrinfo, перевірка сервера з терміналу (вивід залежить від системи)
struct addrinfo hints = {0};
hints.ai_family = AF_UNSPEC;
hints.ai_socktype = SOCK_STREAM;
struct addrinfo *res;
if (getaddrinfo("localhost", "8080", &hints, &res) != 0) {
    return 1;
}
int fd = -1;
for (struct addrinfo *p = res; p != NULL; p = p->ai_next) {
    fd = socket(p->ai_family, p->ai_socktype, p->ai_protocol);
    if (fd >= 0 && connect(fd, p->ai_addr, p->ai_addrlen) == 0) {
        break;
    }
    if (fd >= 0) {
        close(fd);
        fd = -1;
    }
}
freeaddrinfo(res);

$ ss -ltn
State   Recv-Q  Send-Q  Local Address:Port
LISTEN  0       16      127.0.0.1:8080
$ echo hi | nc 127.0.0.1 8080
hi
`,
      String.raw`// аварія: співрозмовник закрив з'єднання, recv повертає 0, а assert вимагає хоч один байт
#define _POSIX_C_SOURCE 200809L
#include <assert.h>
#include <stdio.h>
#include <sys/socket.h>
#include <unistd.h>

int main(void) {
    int sv[2];
    if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) != 0) {
        return 1;
    }
    close(sv[1]);
    char buf[8];
    ssize_t n = recv(sv[0], buf, sizeof buf, 0);
    printf("recv повернув %zd\n", n);
    assert(n > 0);
    close(sv[0]);
    return 0;
}
`,
    ],
    note: "TCP це потік байтів без меж повідомлень: потрібне обрамлення (префікс довжини) і цикл <code>recv</code>. Нуль від <code>recv</code> означає закриття з'єднання. Сервер: socket, bind, listen, accept; тест: <code>socketpair</code>.",
    work: "Так працюють веб-сервери, бази даних, чати й клієнти API: <code>accept</code> у циклі та обмін кадрами. Бібліотеки (libcurl, libuv) ховають ці деталі, але помилки з обрамленням і закритими з'єднаннями трапляються в кожній мережевій програмі.",
    tasks: [
      "Чому два виклики <code>send</code> по 5 байтів можуть бути прочитані одним <code>recv</code> і яким способом приймач знаходить межі повідомлень?",
      "Що означає значення 0 від <code>recv</code>, чим воно відрізняється від -1 і який сигнал загрожує процесу при записі в закрите з'єднання?",
    ],
  },
  {
    t: "Потоки POSIX: pthread",
    ch: "Системне програмування",
    adv: true,
    easy: "Потоки це кілька кухарів на одній кухні: інструменти й продукти спільні, тож без черги до плити вони заважатимуть одне одному. Mutex це табличка «зайнято» на плиті, а <code>join</code> очікування, поки кухар закінчить страву.",
    p: [
      "Потік це окремий шлях виконання всередині процесу: у нього свій стек і регістри, а купа, глобальні змінні й відкриті дескриптори спільні. Потоки дають паралельність на кількох ядрах і спосіб не блокувати програму очікуванням. Платимо за це спільною пам'яттю без захисту: звідси найпідступніші помилки в C. Збирають із <code>-pthread</code> (і при компіляції, і при лінкуванні), заголовок <code>&lt;pthread.h&gt;</code>. Стандарт C11 має й <code>&lt;threads.h&gt;</code> із <code>thrd_create</code>, але pthread поширеніший і є всюди, де є POSIX.",
      "Життєвий цикл: <code>pthread_create(&amp;tid, NULL, fn, arg)</code> повертає 0 або код помилки (не <code>errno</code>). Функція має вигляд <code>void *fn(void *arg)</code>: отримує <code>arg</code>, повертає <code>void *</code>. <code>pthread_join(tid, &amp;ret)</code> чекає завершення потоку й забирає результат; без <code>join</code> (або <code>pthread_detach</code>) ресурси потоку витікають. Аргумент має жити довше за потік: не віддавайте адресу локальної змінної, яка вийде зі сфери. Зручно завести масив структур-завдань, де кожен потік пише лише у свою, як у прикладі 1.",
      "Гонка даних виникає, коли два потоки звертаються до однієї змінної, і хоч один пише без синхронізації: це невизначена поведінка. Навіть <code>counter++</code> це три кроки (прочитати, додати, записати), і два потоки гублять чужі оновлення: результат різний щоразу, а на малих числах тест може «проходити». Тому все спільне змінюване захищають. Звіт ThreadSanitizer у фрагменті 5 показує, як це виглядає: два доступи, хто писав, хто створив потоки.",
      "Основний засіб це <b>mutex</b>: <code>pthread_mutex_lock</code> і <code>pthread_mutex_unlock</code> навколо критичної секції, ініціалізований через <code>PTHREAD_MUTEX_INITIALIZER</code> чи <code>pthread_mutex_init</code>. Секція має бути короткою. Відмикає той самий потік, що замкнув. Повторний <code>lock</code> власного звичайного mutex чи два mutex, які різні потоки беруть у різному порядку, дають взаємне блокування (deadlock): завжди беріть їх в одному порядку. <code>pthread_mutex_trylock</code> не чекає й повертає <code>EBUSY</code>, якщо зайнято (приклад 4).",
      "Коли потік має чекати події, а не змінної, беруть <b>умовну змінну</b>: <code>pthread_cond_wait(&amp;cv, &amp;m)</code> атомарно відмикає mutex і засинає, а прокидається вже із замкненим. Умову завжди перевіряють у циклі <code>while (!ready)</code>, бо бувають хибні пробудження. Той, хто змінив стан, робить це під mutex і викликає <code>pthread_cond_signal</code>. Приклад 3: виробник і споживач із кільцевим буфером на 4 елементи, де умови «не повний» і «не порожній» обидві в циклах.",
      "Порядок виконання потоків не детермінований, тому тести перевіряють підсумок (суму, лічильник), а не порядок виводу, і друкують із <code>main</code> після <code>join</code>. Не лікуйте гонки викликом <code>sleep</code>: це лише змінює шанси. Для пошуку гонок є <code>-fsanitize=thread</code> (не поєднується з ASan) та <code>valgrind --tool=helgrind</code>. Спільні дані краще не ділити взагалі: кожен потік працює зі своєю частиною, а результати збираються після <code>join</code>.",
    ],
    code: [
      String.raw`#include <pthread.h>
#include <stdio.h>

typedef struct {
    int lo;
    int hi;
    long sum;
} Job;

static void *worker(void *arg) {
    Job *job = arg;
    job->sum = 0;
    for (int i = job->lo; i < job->hi; i++) {
        job->sum += i;
    }
    return NULL;
}

int main(void) {
    enum { THREADS = 4, CHUNK = 250 };
    pthread_t tid[THREADS];
    Job jobs[THREADS];
    for (int i = 0; i < THREADS; i++) {
        jobs[i].lo = i * CHUNK;
        jobs[i].hi = (i + 1) * CHUNK;
        if (pthread_create(&tid[i], NULL, worker, &jobs[i]) != 0) {
            return 1;
        }
    }
    long total = 0;
    for (int i = 0; i < THREADS; i++) {
        pthread_join(tid[i], NULL);
        printf("потік %d: [%d, %d) сума %ld\n", i, jobs[i].lo, jobs[i].hi, jobs[i].sum);
        total += jobs[i].sum;
    }
    printf("разом: %ld\n", total);
    return 0;
}
`,
      String.raw`#include <pthread.h>
#include <stdio.h>

enum { THREADS = 4, ROUNDS = 10000 };

static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
static long counter;

static void *worker(void *arg) {
    (void)arg;
    for (int i = 0; i < ROUNDS; i++) {
        pthread_mutex_lock(&lock);
        counter++;
        pthread_mutex_unlock(&lock);
    }
    return NULL;
}

int main(void) {
    pthread_t tid[THREADS];
    for (int i = 0; i < THREADS; i++) {
        if (pthread_create(&tid[i], NULL, worker, NULL) != 0) {
            return 1;
        }
    }
    for (int i = 0; i < THREADS; i++) {
        pthread_join(tid[i], NULL);
    }
    printf("лічильник: %ld, очікувалось: %d\n", counter, THREADS * ROUNDS);
    return counter == THREADS * ROUNDS ? 0 : 1;
}
`,
      String.raw`#include <pthread.h>
#include <stdio.h>

enum { CAP = 4, ITEMS = 20 };

static int ring[CAP];
static int head;
static int count;
static pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
static pthread_cond_t not_full = PTHREAD_COND_INITIALIZER;
static pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;

static void *producer(void *arg) {
    (void)arg;
    for (int v = 1; v <= ITEMS; v++) {
        pthread_mutex_lock(&m);
        while (count == CAP) {
            pthread_cond_wait(&not_full, &m);
        }
        ring[(head + count) % CAP] = v;
        count++;
        pthread_cond_signal(&not_empty);
        pthread_mutex_unlock(&m);
    }
    return NULL;
}

static void *consumer(void *arg) {
    long *sum = arg;
    for (int i = 0; i < ITEMS; i++) {
        pthread_mutex_lock(&m);
        while (count == 0) {
            pthread_cond_wait(&not_empty, &m);
        }
        *sum += ring[head];
        head = (head + 1) % CAP;
        count--;
        pthread_cond_signal(&not_full);
        pthread_mutex_unlock(&m);
    }
    return NULL;
}

int main(void) {
    pthread_t p;
    pthread_t c;
    long sum = 0;
    if (pthread_create(&c, NULL, consumer, &sum) != 0) {
        return 1;
    }
    if (pthread_create(&p, NULL, producer, NULL) != 0) {
        return 1;
    }
    pthread_join(p, NULL);
    pthread_join(c, NULL);
    printf("спожито: %d елементів, сума %ld\n", ITEMS, sum);
    return 0;
}
`,
      String.raw`// аварія: звичайний mutex уже замкнений, trylock повертає EBUSY, а assert вимагає успіху
#include <assert.h>
#include <pthread.h>
#include <stdio.h>

int main(void) {
    pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
    pthread_mutex_lock(&m);
    int rc = pthread_mutex_trylock(&m);
    printf("trylock повернув ненульовий код: %s\n", rc != 0 ? "так" : "ні");
    assert(rc == 0);
    pthread_mutex_unlock(&m);
    return 0;
}
`,
      String.raw`// фрагмент: гонка даних і звіт ThreadSanitizer (адреси й номери потоків залежать від запуску)
static long counter;

static void *worker(void *arg) {
    for (int i = 0; i < 100000; i++) {
        counter++;
    }
    return NULL;
}

$ gcc -std=c11 -g -O1 -pthread -fsanitize=thread main.c -o prog
$ ./prog
WARNING: ThreadSanitizer: data race (pid=5120)
  Write of size 8 at 0x5581 by thread T2:
    #0 worker main.c:5
  Previous write of size 8 at 0x5581 by thread T1:
    #0 worker main.c:5
  Thread T2 created by main thread at:
    #0 pthread_create
    #1 main main.c:14
SUMMARY: ThreadSanitizer: data race main.c:5 in worker
`,
    ],
    note: "Потоки ділять купу й глобальні змінні, тож спільні дані захищає mutex, а очікування події умовна змінна в циклі <code>while</code>. Кожен потік або <code>join</code>, або <code>detach</code>. Тестуйте підсумок, а не порядок.",
    work: "Потоки використовують веб-сервери для обслуговування клієнтів, бази даних для фонових задач, ігрові рушії й кодеки для розподілу роботи між ядрами. Гонки відтворюються рідко, тому ThreadSanitizer у CI часто єдиний шанс їх зловити.",
    tasks: [
      "Чому <code>counter++</code> у двох потоках без mutex може дати менше за очікуване значення, хоча кожен потік виконав усі свої кроки?",
      "Навіщо <code>pthread_cond_wait</code> викликають у циклі <code>while</code>, а не в <code>if</code>, і що робить цей виклик із mutex?",
    ],
  },
];
