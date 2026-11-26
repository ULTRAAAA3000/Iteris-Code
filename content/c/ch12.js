export const LESSONS_12 = [
  {
    t: "Проєкт: аналіз тексту",
    ch: "Проєкти",
    easy: "Проєкт схожий на збирання шафи за інструкцією: окремі дошки вже знайомі, а вміння полягає в тому, щоб скласти їх у правильному порядку й перевіряти кожен крок, а не дивуватися в кінці, що дверцята не закриваються.",
    p: [
      "Останні уроки курсу не вводять нових конструкцій. Вони вчать складати знайомі: структури, динамічну пам'ять, рядки, <code>qsort</code>, перевірку помилок. Перший проєкт простий за змістом: із рядка тексту порахувати символи, слова й рядки, знайти найчастіші слова та найдовше слово. У пісочниці вхід це рядок-літерал. У справжній програмі той самий текст прийшов би з файлу або зі <code>stdin</code>, і змінилося б лише джерело, а функції лишилися б тими самими.",
      "Розбір задачі починається не з коду, а з питань. Що таке слово? Домовимося: безперервна послідовність латинських літер, усе інше розділювачі. Чи різні «The» і «the»? Ні, порівнюємо без урахування регістру. Що робити, коли два слова трапились однаково часто? Сортуємо за абеткою. Що виведе програма для порожнього тексту? Нулі й жодного слова. Це не дрібниці: такі відповіді стають специфікацією, а за специфікацією пишуться перевірки. Кирилицю тут не розбираємо: <code>isalpha</code> працює з байтами, а літера UTF-8 займає два.",
      "Проєктування в одному <code>main.c</code> означає секції, які читаються згори вниз. Спочатку типи: <code>Stats</code> із трьома лічильниками (копіюється за значенням, пам'яті не потребує), <code>Entry</code> зі словом і лічильником, <code>Table</code> із масивом записів, довжиною й місткістю. Далі функції таблиці, компаратор, аналіз тексту, друк. Головне питання проєкту це власник пам'яті. Вхідний текст лише читають через <code>const char *</code>: його ніхто не змінює й не звільняє. А слова в таблиці це копії в купі, і ними володіє <code>Table</code>: вона їх створює, вона ж звільняє в <code>table_free</code>.",
      "Збирайте рішення шарами й перевіряйте кожен. Шар перший: один прохід по тексту з прапорцем «я всередині слова», який дає символи, слова й рядки. Шар другий: <code>table_add</code>, яка робить копію слова малими літерами, шукає її в таблиці й або збільшує лічильник, або додає запис, розширюючи масив через <code>realloc</code> із тимчасовим вказівником. Шар третій: сортування й вибірка перших N. Якщо кожен шар перевірено на трьох словах, помилка в готовому проєкті шукається в одному місці, а не в усіх одразу.",
      "Детермінований порядок вимагає повного компаратора. <code>qsort</code> не гарантує стабільності: записи з рівними лічильниками можуть опинитися в будь-якому порядку, і вивід «іноді» зміниться. Тому компаратор порівнює спочатку лічильники за спаданням, а за рівності слова через <code>strcmp</code>. Не віднімайте беззнакові числа: різниця <code>a - b</code> для <code>unsigned</code> обертається в величезне додатне. Порівнюйте явно через <code>&gt;</code> і <code>&lt;</code>. Те саме з найдовшим словом: правило при рівності довжин (перше за появою або за абеткою) треба вибрати й записати, інакше воно залежить від випадку.",
      "Типові помилки проєкту знайомі з попередніх глав. <code>isalpha(*p)</code> із від'ємним <code>char</code> дає невизначену поведінку, потрібне приведення до <code>unsigned char</code>. Копія слова, яка знайшлась у таблиці, стає зайвою, і без <code>free</code> програма тече. Присвоєння <code>t-&gt;items = realloc(t-&gt;items, …)</code> губить блок при невдачі. Запит «топ 5» при чотирьох різних словах виходить за межі масиву, якщо не взяти менше з двох чисел. А функція «найдовше слово» на порожній таблиці має повернути зрозуміле значення, а не розіменувати порожнечу.",
      "Перевіряйте так: малий текст, відповідь на який ви рахуєте вручну; порожній рядок; текст, де лічильники рівні; текст в одне слово. Збирайте з <code>-Wall -Wextra -fsanitize=address,undefined</code>: ASan покаже витік і вихід за межі, UBSan знайде переповнення. Порівняйте вивід із записаним «еталонним», і тоді після кожної правки видно, чи не зламалось те, що працювало. Така звичка важливіша за будь-яку окрему функцію проєкту, і наступний урок застосує її до зовсім іншої задачі.",
    ],
    code: [
      String.raw`#include <ctype.h>
#include <stdio.h>

typedef struct {
    size_t chars;
    size_t words;
    size_t lines;
} Stats;

static Stats count_text(const char *s) {
    Stats st = {0, 0, 0};
    int in_word = 0;
    char last = '\n';
    for (; *s != '\0'; s++) {
        st.chars++;
        if (*s == '\n') {
            st.lines++;
        }
        if (isalpha((unsigned char)*s)) {
            if (!in_word) {
                st.words++;
            }
            in_word = 1;
        } else {
            in_word = 0;
        }
        last = *s;
    }
    if (last != '\n') {
        st.lines++;
    }
    return st;
}

int main(void) {
    Stats st = count_text("one two\nthree\n\nfour");
    printf("chars=%zu words=%zu lines=%zu\n", st.chars, st.words, st.lines);
    Stats none = count_text("");
    printf("порожній: %zu %zu %zu\n", none.chars, none.words, none.lines);
    return 0;
}
`,
      String.raw`#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *text;
    unsigned count;
} Entry;

typedef struct {
    Entry *items;
    size_t len;
    size_t cap;
} Table;

static int table_add(Table *t, const char *s, size_t n) {
    char *w = malloc(n + 1);
    if (w == NULL) {
        return -1;
    }
    for (size_t i = 0; i < n; i++) {
        w[i] = (char)tolower((unsigned char)s[i]);
    }
    w[n] = '\0';
    for (size_t i = 0; i < t->len; i++) {
        if (strcmp(t->items[i].text, w) == 0) {
            t->items[i].count++;
            free(w);
            return 0;
        }
    }
    if (t->len == t->cap) {
        size_t ncap = t->cap == 0 ? 4 : t->cap * 2;
        Entry *p = realloc(t->items, ncap * sizeof *p);
        if (p == NULL) {
            free(w);
            return -1;
        }
        t->items = p;
        t->cap = ncap;
    }
    t->items[t->len].text = w;
    t->items[t->len].count = 1;
    t->len++;
    return 0;
}

static void table_free(Table *t) {
    for (size_t i = 0; i < t->len; i++) {
        free(t->items[i].text);
    }
    free(t->items);
    t->items = NULL;
    t->len = 0;
    t->cap = 0;
}

int main(void) {
    Table t = {NULL, 0, 0};
    const char *src = "Bob bob ALICE";
    table_add(&t, src, 3);
    table_add(&t, src + 4, 3);
    table_add(&t, src + 8, 5);
    for (size_t i = 0; i < t.len; i++) {
        printf("%s=%u\n", t.items[i].text, t.items[i].count);
    }
    table_free(&t);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    const char *text;
    unsigned count;
} Entry;

static int cmp_entry(const void *a, const void *b) {
    const Entry *x = a;
    const Entry *y = b;
    if (x->count != y->count) {
        return x->count > y->count ? -1 : 1;
    }
    return strcmp(x->text, y->text);
}

static const char *longest(const Entry *e, size_t n) {
    const char *best = "";
    for (size_t i = 0; i < n; i++) {
        if (strlen(e[i].text) > strlen(best)) {
            best = e[i].text;
        }
    }
    return best;
}

int main(void) {
    Entry e[] = {{"pear", 2}, {"fig", 5}, {"apple", 2}, {"kiwi", 2}, {"plum", 1}};
    size_t n = sizeof e / sizeof e[0];
    printf("найдовше: %s\n", longest(e, n));
    qsort(e, n, sizeof e[0], cmp_entry);
    size_t top = 3 < n ? 3 : n;
    for (size_t i = 0; i < top; i++) {
        printf("%zu. %s x%u\n", i + 1, e[i].text, e[i].count);
    }
    return 0;
}
`,
      String.raw`// аварія: assert на порожньому тексті: слів немає, а функція вимагає хоча б одне
#include <assert.h>
#include <stdio.h>
#include <string.h>

static const char *longest(const char *const *words, size_t n) {
    assert(n > 0);
    const char *best = words[0];
    for (size_t i = 1; i < n; i++) {
        if (strlen(words[i]) > strlen(best)) {
            best = words[i];
        }
    }
    return best;
}

int main(void) {
    const char *const *none = NULL;
    printf("найдовше: %s\n", longest(none, 0));
    return 0;
}
`,
    ],
    note: "Рішення проєкту збирають шарами й перевіряють кожен окремо. Рівність у сортуванні та пошуку максимуму вирішуйте правилом, записаним у коді: <code>qsort</code> нестабільний. Власник пам'яті один: таблиця створює копії слів і сама звільняє їх.",
    work: "Та сама схема (лічильники, таблиця частот, топ-N) працює в аналізі логів, пошукових індексах, статистиці коду й перевірці правопису. Різниця лише в джерелі тексту й у визначенні слова. Утиліта <code>wc</code> і частотні словники будуються саме так.",
    tasks: [
      "Чому компаратор для топ-N слів порівнює не лише лічильники, а й самі слова, і що станеться з виводом, якщо цього не робити?",
      "Хто володіє копіями слів у таблиці й де вони звільняються? Що станеться, якщо слово вже є в таблиці, а тимчасову копію не звільнити?",
    ],
  },
  {
    t: "Проєкт: калькулятор виразів",
    ch: "Проєкти",
    easy: "Калькулятор схожий на касира, який читає чек зліва направо: спершу розбиває рядок на окремі «слова» (числа й знаки), потім розставляє дії за старшинством. А на дивний ввід відповідає чемною відмовою, а не втікає з каси.",
    p: [
      "Друга задача проєкту: обчислити вираз із цілих чисел, знаків <code>+ - * /</code>, дужок і унарного мінуса, наприклад <code>-(4-6)*2</code>. Результат це або число, або код помилки. Ввід тут найнебезпечніший: порожній рядок, <code>1/0</code>, тисяча дужок чи число завбільшки з планету не повинні валити програму. Кожен такий рядок має закінчуватися зрозумілою відмовою, без невизначеної поведінки.",
      "Розбір задачі фіксує правила. Множення й ділення старші за додавання й віднімання. Операції ліво-асоціативні: <code>8-2-3</code> це <code>(8-2)-3 = 3</code>. Ділення цілочисельне з відкиданням дробу до нуля (так визначає C99): <code>-7/2</code> дає <code>-3</code>. Діапазон обмежимо: числа й кожен проміжний результат лежать у межах від -10⁹ до 10⁹. Тоді добуток двох значень не перевищує 10¹⁸ і гарантовано вміщується в <code>long long</code>: переповнення знакового типу, тобто UB, неможливе за побудовою. Коди помилок: синтаксис, ділення на нуль, дужки, чужий символ, діапазон, глибина.",
      "Проєктування в одному <code>main.c</code>: три секції. Токенізатор: структура <code>Parser</code> тримає вказівник у вхідному рядку, поточний токен і його число. Граматика: <code>expr</code> це <code>term</code> із додаванням і відніманням, <code>term</code> це <code>factor</code> із множенням і діленням, а <code>factor</code> це число, мінус перед <code>factor</code> або вираз у дужках. Інтерфейс: <code>Err calc(const char *s, long long *out)</code>. Купи в проєкті немає зовсім: вхід лише читається, парсер живе на стеку, результат іде у <code>out</code>. Відсутність власника пам'яті теж рішення проєктування, і найпростіше.",
      "Обирати можна між двома підходами. Рекурсивний спуск прямо віддзеркалює граматику: кожному рівню пріоритету відповідає функція, а старшинство вшите в порядок викликів. Алгоритм сортувальної станції (shunting-yard) тримає явний стек операторів і зручний, коли пріоритети лежать у таблиці, а оператори додають користувачі. Для чотирьох дій спуск коротший і легше читається, тож збираємо його. Шар перший: <code>next</code> пропускає пробіли й читає число чи один знак. Шар другий: три функції за граматикою. Шар третій: помилки.",
      "Помилки реалізуйте полем <code>err</code> у <code>Parser</code> і функцією <code>fail</code>: перша помилка виграє, а токен стає кінцем вводу, тож усі цикли зупиняються самі, без ланцюжка <code>return</code> на кожному рівні. Ділення перевіряє дільник до операції. Діапазон перевіряється після кожної дії й під час читання числа. Глибина потрібна, бо рекурсія на вкладених дужках і мінусах з'їдає стек: ввід із мільйона дужок валить програму ще до перевірки балансу. Лічильник <code>depth</code> із обмеженням перетворює крах на код <code>ERR_DEPTH</code>. Незакрита дужка видно там, де після <code>expr</code> чекали <code>)</code>, зайва видно по токену, що лишився після виразу.",
      "Типові помилки. Запис <code>expr = term - expr</code> дає праву асоціативність, і <code>8-2-3</code> стане 9. Число 0 не можна робити ознакою помилки: це законна відповідь, тому окремий код і <code>out</code>. Функції <code>isdigit</code> потрібне приведення до <code>unsigned char</code>. Після <code>p-&gt;s++</code> легко пройти за нульовий байт, тож нуль завжди перевіряйте першим. Збір цифр без обмеження переповнить <code>long long</code> уже на двадцяти цифрах. І нарешті, глушити помилку мовчки (повернути 0 замість коду) гірше за крах: хибна відповідь виглядає правдивою.",
      "Перевіряйте таблицею: вираз і очікуваний результат або код. Обов'язково гранична: порожній рядок, <code>()</code>, <code>1+</code>, <code>1 2</code>, <code>(((1)))</code>, ділення на нуль усередині дужок, <code>100000*100000</code>, глибока вкладеність. Збирайте з <code>-fsanitize=address,undefined</code>: UBSan миттєво покаже переповнення, якого ви не передбачили. Такий набір тестів потім захищає від поламок при кожній правці. Далі арена-аллокатор: проєкт, де ми самі керуємо пам'яттю, яку тут обійшли.",
    ],
    code: [
      String.raw`#include <ctype.h>
#include <stdio.h>

int main(void) {
    const char *s = "12 + (3*4) - -5 $";
    while (*s != '\0') {
        if (*s == ' ') {
            s++;
            continue;
        }
        if (isdigit((unsigned char)*s)) {
            long v = 0;
            while (isdigit((unsigned char)*s)) {
                v = v * 10 + (*s - '0');
                s++;
            }
            printf("NUM(%ld) ", v);
            continue;
        }
        switch (*s) {
        case '+':
        case '-':
        case '*':
        case '/':
            printf("OP(%c) ", *s);
            break;
        case '(':
            printf("LP ");
            break;
        case ')':
            printf("RP ");
            break;
        default:
            printf("BAD(%c) ", *s);
        }
        s++;
    }
    printf("\n");
    return 0;
}
`,
      String.raw`#include <ctype.h>
#include <stdio.h>

typedef struct {
    const char *s;
} P;

static void skip(P *p) {
    while (*p->s == ' ') {
        p->s++;
    }
}

static long expr(P *p);

static long factor(P *p) {
    skip(p);
    if (*p->s == '-') {
        p->s++;
        return -factor(p);
    }
    if (*p->s == '(') {
        p->s++;
        long v = expr(p);
        skip(p);
        p->s++;
        return v;
    }
    long v = 0;
    while (isdigit((unsigned char)*p->s)) {
        v = v * 10 + (*p->s - '0');
        p->s++;
    }
    return v;
}

static long term(P *p) {
    long v = factor(p);
    for (;;) {
        skip(p);
        char c = *p->s;
        if (c != '*' && c != '/') {
            return v;
        }
        p->s++;
        long r = factor(p);
        v = c == '*' ? v * r : v / r;
    }
}

static long expr(P *p) {
    long v = term(p);
    for (;;) {
        skip(p);
        char c = *p->s;
        if (c != '+' && c != '-') {
            return v;
        }
        p->s++;
        long r = term(p);
        v = c == '+' ? v + r : v - r;
    }
}

int main(void) {
    const char *tests[] = {"1+2*3", "(1+2)*3", "-(4-6)*2", "8-2-3", "10/4"};
    for (int i = 0; i < 5; i++) {
        P p = {tests[i]};
        printf("%s = %ld\n", tests[i], expr(&p));
    }
    return 0;
}
`,
      String.raw`#include <ctype.h>
#include <stdio.h>
#include <string.h>

#define LIMIT 1000000000LL
#define MAX_DEPTH 50

typedef enum { OK, ERR_SYNTAX, ERR_DIV0, ERR_PAREN, ERR_CHAR, ERR_RANGE, ERR_DEPTH } Err;
typedef enum { T_NUM, T_PLUS, T_MINUS, T_STAR, T_SLASH, T_LP, T_RP, T_END } Tok;

typedef struct {
    const char *s;
    Tok tok;
    long long num;
    int depth;
    Err err;
} Parser;

static const char *ERR_NAMES[] = {"OK", "SYNTAX", "DIV0", "PAREN", "CHAR", "RANGE", "DEPTH"};

static void fail(Parser *p, Err e) {
    if (p->err == OK) {
        p->err = e;
    }
    p->tok = T_END;
}

static void next(Parser *p) {
    while (*p->s == ' ') {
        p->s++;
    }
    char c = *p->s;
    if (c == '\0') {
        p->tok = T_END;
        return;
    }
    if (isdigit((unsigned char)c)) {
        long long v = 0;
        while (isdigit((unsigned char)*p->s)) {
            v = v * 10 + (*p->s - '0');
            if (v > LIMIT) {
                fail(p, ERR_RANGE);
                return;
            }
            p->s++;
        }
        p->tok = T_NUM;
        p->num = v;
        return;
    }
    p->s++;
    switch (c) {
    case '+': p->tok = T_PLUS; break;
    case '-': p->tok = T_MINUS; break;
    case '*': p->tok = T_STAR; break;
    case '/': p->tok = T_SLASH; break;
    case '(': p->tok = T_LP; break;
    case ')': p->tok = T_RP; break;
    default: fail(p, ERR_CHAR);
    }
}

static long long checked(Parser *p, long long v) {
    if (v > LIMIT || v < -LIMIT) {
        fail(p, ERR_RANGE);
        return 0;
    }
    return v;
}

static long long expr(Parser *p);

static long long factor(Parser *p) {
    if (p->err != OK) {
        return 0;
    }
    if (++p->depth > MAX_DEPTH) {
        fail(p, ERR_DEPTH);
        p->depth--;
        return 0;
    }
    long long v = 0;
    if (p->tok == T_NUM) {
        v = p->num;
        next(p);
    } else if (p->tok == T_MINUS) {
        next(p);
        v = -factor(p);
    } else if (p->tok == T_LP) {
        next(p);
        v = expr(p);
        if (p->err == OK && p->tok != T_RP) {
            fail(p, ERR_PAREN);
        } else if (p->err == OK) {
            next(p);
        }
    } else {
        fail(p, ERR_SYNTAX);
    }
    p->depth--;
    return v;
}

static long long term(Parser *p) {
    long long v = factor(p);
    while (p->err == OK && (p->tok == T_STAR || p->tok == T_SLASH)) {
        Tok op = p->tok;
        next(p);
        long long r = factor(p);
        if (op == T_STAR) {
            v = checked(p, v * r);
        } else if (r == 0) {
            fail(p, ERR_DIV0);
            return 0;
        } else {
            v = v / r;
        }
    }
    return v;
}

static long long expr(Parser *p) {
    long long v = term(p);
    while (p->err == OK && (p->tok == T_PLUS || p->tok == T_MINUS)) {
        Tok op = p->tok;
        next(p);
        long long r = term(p);
        v = checked(p, op == T_PLUS ? v + r : v - r);
    }
    return v;
}

static Err calc(const char *s, long long *out) {
    Parser p = {s, T_END, 0, 0, OK};
    next(&p);
    long long v = expr(&p);
    if (p.err == OK && p.tok != T_END) {
        fail(&p, p.tok == T_RP ? ERR_PAREN : ERR_SYNTAX);
    }
    if (p.err == OK) {
        *out = v;
    }
    return p.err;
}

static void show(const char *s) {
    long long v = 0;
    Err e = calc(s, &v);
    if (e == OK) {
        printf("[%s] = %lld\n", s, v);
    } else {
        printf("[%s] error %s (%d)\n", s, ERR_NAMES[e], (int)e);
    }
}

int main(void) {
    const char *tests[] = {"1+2*3", "(1+2)*3", "-(4-6)*2", "10/3", "-7/2", "8-2-3", "--5", "2*-3",
                           "7/(3-3)", "(1+2", "1+2)", "2 * x", "1+", "", "1 2", "100000*100000", "99999999999"};
    for (size_t i = 0; i < sizeof tests / sizeof tests[0]; i++) {
        show(tests[i]);
    }
    char deep[160];
    memset(deep, '(', 60);
    deep[60] = '1';
    memset(deep + 61, ')', 60);
    deep[121] = '\0';
    long long v = 0;
    Err e = calc(deep, &v);
    printf("deep error %s (%d)\n", ERR_NAMES[e], (int)e);
    return 0;
}
`,
      String.raw`// аварія: assert на діленні на нуль: у вираз 1/(2-2) жодна перевірка не вбудована
#include <assert.h>
#include <stdio.h>

static int divide(int a, int b) {
    assert(b != 0);
    return a / b;
}

int main(void) {
    printf("%d\n", divide(10, 3));
    printf("%d\n", divide(1, 2 - 2));
    return 0;
}
`,
    ],
    note: "Пріоритет вшитий у порядок викликів <code>expr</code>, <code>term</code>, <code>factor</code>. Обмеження чисел і глибини роблять UB неможливим, а перша помилка перемагає й зупиняє розбір. Нуль не може бути ознакою помилки: потрібен окремий код.",
    work: "Вирази розбирають у калькуляторах, електронних таблицях, мовах конфігурації, фільтрах пошуку й SQL. Парсери кожного формату ставлять ті самі питання: токени, пріоритет, помилки, обмеження вкладеності. Атаки на парсери часто починаються саме з глибоких або величезних вводів.",
    tasks: [
      "Чому рекурсивний спуск із правилом <code>expr = term - expr</code> обчислює <code>8-2-3</code> неправильно і як цикл у <code>expr</code> це виправляє?",
      "Для чого обмежувати числа діапазоном 10⁹ і глибину вкладеності, і яку невизначену поведінку чи аварію це усуває?",
    ],
  },
  {
    t: "Проєкт: арена-аллокатор",
    ch: "Проєкти",
    adv: true,
    easy: "Арена схожа на рулон паперу, з якого відрізають шматки по черзі: швидко й без суперечок, де чия смужка. Окремий шматок не повертають. Коли робота скінчена, викидають або перемотують увесь рулон одразу.",
    p: [
      "Арена, або «bump-аллокатор», це один великий блок пам'яті й лічильник <code>used</code>. Виділення означає зсунути лічильник і повернути вказівник на місце, де він стояв: ні списків вільних блоків, ні пошуку. Окремий об'єкт не звільняють, зате весь вміст арени вмить скидають одним викликом. Для задач із спільним часом життя (розбір запиту, кадр гри, синтаксичне дерево) це швидше за <code>malloc</code> і не дає фрагментації. Мінус у тому, що пам'ять вільна лише оптом.",
      "Розбір задачі: інтерфейс із чотирьох функцій. <code>arena_create(cap)</code> виділяє блок, <code>arena_alloc(a, size, align)</code> віддає шматок, <code>arena_reset</code> повертає лічильник на нуль, <code>arena_destroy</code> звільняє все. Вимоги: повернена адреса ділиться на <code>align</code>; при браку місця <code>alloc</code> повертає <code>NULL</code> і нічого не псує; некоректне вирівнювання (не степінь двійки) теж <code>NULL</code>; обчислення не переповнюють <code>size_t</code>. Росту арена не має: це політика, і ми її називаємо прямо.",
      "Проєктування: структура <code>Arena</code> із полями <code>base</code>, <code>cap</code>, <code>used</code> і <code>count</code> (скільки об'єктів видано, для звіту). Власник пам'яті один: арена володіє блоком, а користувач володіє тільки тим, що не переживе <code>reset</code> і <code>destroy</code>. Звільняти окремі об'єкти <code>free</code>-ом не можна, адже це не адреси <code>malloc</code>. Структуру й буфер зробимо двома виділеннями: так простіше. У реальних бібліотеках їх нерідко зливають в один блок.",
      "Серце проєкту це вирівнювання. Адреса має ділитися на <code>align</code>, тож перед шматком вставляють відступ <code>pad</code>. Для степеня двійки він дорівнює <code>(align - (addr &amp; (align - 1))) &amp; (align - 1)</code>, де <code>addr</code> це справжня адреса як <code>uintptr_t</code>, а не лише зсув: вирівняність бази гарантує лише <code>malloc</code>, і лише до <code>max_align_t</code>. Далі перевіряємо вміст без переповнення: <code>pad &gt; cap - used</code>, потім <code>size &gt; cap - used - pad</code>. Запис <code>used + pad + size &gt; cap</code> небезпечний, бо сума може обернутися. Для масивів перевіряйте й <code>n * size</code>.",
      "Дерево в арені показує, навіщо це все. Кожен вузол береться з арени, тож не треба рекурсивно обходити дерево й викликати <code>free</code> на кожному: досить <code>arena_destroy</code>. Порівняйте з <code>malloc</code> лічильниками: обгорніть <code>malloc</code> і <code>free</code> функціями, що збільшують глобальні числа. Арена дає два виклики незалежно від кількості вузлів, звичайне дерево дає по виклику на вузол. Час не вимірюйте: він недетермінований, а кількість викликів точна. Бонусом вузли лежать поруч, що дружньо до кешу процесора.",
      "Типові помилки. Звернення до об'єкта після <code>reset</code> чи <code>destroy</code>: пам'ять формально жива, а вказівник уже висячий. Об'єкти, що володіють зовнішніми ресурсами (відкритий файл, окремий <code>malloc</code>), нікому буде закрити, адже арена не викликає жодних деструкторів, тож тече те, що поза нею. Відсутня перевірка <code>NULL</code> після вичерпання: запис за нульовою адресою це аварія. Невирівняний <code>double</code> це UB, який <code>UBSan</code> зловить, а частина платформ упаде. І <code>realloc</code> на об'єкті арени неможливий: його адреса не від <code>malloc</code>.",
      "Перевірка: виведіть зсуви перших видач (0, 4, 8), перевірте вичерпання, <code>reset</code> і повторне використання, тест «арена розміром у точності <code>n * sizeof</code>». Чесне попередження про санітайзери: ASan бачить лише межі великого блока, тож вихід за межі одного об'єкта в сусідній усередині арени він не помітить. Для цього в справжніх аллокаторах «отруюють» вільні ділянки спеціальними макросами. Останній проєкт покаже віртуальну машину, де пам'ять і команди описані самі.",
    ],
    code: [
      String.raw`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    unsigned char *base;
    size_t cap;
    size_t used;
    size_t count;
} Arena;

static Arena *arena_create(size_t cap) {
    Arena *a = malloc(sizeof *a);
    if (a == NULL) {
        return NULL;
    }
    a->base = malloc(cap);
    if (a->base == NULL) {
        free(a);
        return NULL;
    }
    a->cap = cap;
    a->used = 0;
    a->count = 0;
    return a;
}

static void *arena_alloc(Arena *a, size_t size, size_t align) {
    if (align == 0 || (align & (align - 1)) != 0) {
        return NULL;
    }
    uintptr_t addr = (uintptr_t)(a->base + a->used);
    size_t pad = (size_t)((align - (addr & (align - 1))) & (align - 1));
    if (pad > a->cap - a->used || size > a->cap - a->used - pad) {
        return NULL;
    }
    void *p = a->base + a->used + pad;
    a->used += pad + size;
    a->count++;
    return p;
}

static void arena_reset(Arena *a) {
    a->used = 0;
    a->count = 0;
}

static void arena_destroy(Arena *a) {
    if (a == NULL) {
        return;
    }
    free(a->base);
    free(a);
}

static long off(const Arena *a, const void *p) {
    return (long)((const unsigned char *)p - a->base);
}

int main(void) {
    Arena *a = arena_create(128);
    char *c = arena_alloc(a, 1, 1);
    int *i = arena_alloc(a, sizeof(int), _Alignof(int));
    double *d = arena_alloc(a, sizeof(double), _Alignof(double));
    printf("зсуви: %ld %ld %ld\n", off(a, c), off(a, i), off(a, d));
    printf("used=%zu count=%zu\n", a->used, a->count);
    *c = 'x';
    *i = 42;
    *d = 2.5;
    printf("%c %d %.1f\n", *c, *i, *d);
    arena_reset(a);
    printf("після reset: used=%zu\n", a->used);
    arena_destroy(a);
    return 0;
}
`,
      String.raw`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    unsigned char *base;
    size_t cap;
    size_t used;
    size_t count;
} Arena;

static Arena *arena_create(size_t cap) {
    Arena *a = malloc(sizeof *a);
    if (a == NULL) {
        return NULL;
    }
    a->base = malloc(cap);
    if (a->base == NULL) {
        free(a);
        return NULL;
    }
    a->cap = cap;
    a->used = 0;
    a->count = 0;
    return a;
}

static void *arena_alloc(Arena *a, size_t size, size_t align) {
    if (align == 0 || (align & (align - 1)) != 0) {
        return NULL;
    }
    uintptr_t addr = (uintptr_t)(a->base + a->used);
    size_t pad = (size_t)((align - (addr & (align - 1))) & (align - 1));
    if (pad > a->cap - a->used || size > a->cap - a->used - pad) {
        return NULL;
    }
    void *p = a->base + a->used + pad;
    a->used += pad + size;
    a->count++;
    return p;
}

static void arena_reset(Arena *a) {
    a->used = 0;
    a->count = 0;
}

static void arena_destroy(Arena *a) {
    if (a == NULL) {
        return;
    }
    free(a->base);
    free(a);
}

static void *arena_array(Arena *a, size_t n, size_t size, size_t align) {
    if (size != 0 && n > SIZE_MAX / size) {
        return NULL;
    }
    return arena_alloc(a, n * size, align);
}

int main(void) {
    Arena *a = arena_create(48);
    int *xs = arena_array(a, 4, sizeof(int), _Alignof(int));
    printf("4 int: %s, used=%zu\n", xs != NULL ? "так" : "ні", a->used);
    double *ys = arena_array(a, 3, sizeof(double), _Alignof(double));
    printf("3 double: %s, used=%zu\n", ys != NULL ? "так" : "ні", a->used);
    printf("ще 16 байтів: %s\n", arena_alloc(a, 16, 1) != NULL ? "так" : "ні");
    printf("переповнення n*size: %s\n", arena_array(a, SIZE_MAX / 2, 8, 8) != NULL ? "так" : "ні");
    arena_reset(a);
    printf("після reset: %s, used=%zu\n", arena_alloc(a, 48, 1) != NULL ? "48 байтів є" : "немає", a->used);
    arena_destroy(a);
    return 0;
}
`,
      String.raw`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

static size_t g_malloc = 0;
static size_t g_free = 0;

static void *counted_malloc(size_t n) {
    g_malloc++;
    return malloc(n);
}

static void counted_free(void *p) {
    g_free++;
    free(p);
}

typedef struct {
    unsigned char *base;
    size_t cap;
    size_t used;
} Arena;

static Arena *arena_create(size_t cap) {
    Arena *a = counted_malloc(sizeof *a);
    if (a == NULL) {
        return NULL;
    }
    a->base = counted_malloc(cap);
    if (a->base == NULL) {
        counted_free(a);
        return NULL;
    }
    a->cap = cap;
    a->used = 0;
    return a;
}

static void *arena_alloc(Arena *a, size_t size, size_t align) {
    uintptr_t addr = (uintptr_t)(a->base + a->used);
    size_t pad = (size_t)((align - (addr & (align - 1))) & (align - 1));
    if (pad > a->cap - a->used || size > a->cap - a->used - pad) {
        return NULL;
    }
    void *p = a->base + a->used + pad;
    a->used += pad + size;
    return p;
}

static void arena_destroy(Arena *a) {
    counted_free(a->base);
    counted_free(a);
}

static Node *arena_node(Arena *a, int key) {
    Node *n = arena_alloc(a, sizeof *n, _Alignof(Node));
    if (n != NULL) {
        n->key = key;
        n->left = NULL;
        n->right = NULL;
    }
    return n;
}

static Node *plain_node(int key) {
    Node *n = counted_malloc(sizeof *n);
    if (n != NULL) {
        n->key = key;
        n->left = NULL;
        n->right = NULL;
    }
    return n;
}

static Node *insert(Node *root, int key, Arena *a) {
    if (root == NULL) {
        return a != NULL ? arena_node(a, key) : plain_node(key);
    }
    if (key < root->key) {
        root->left = insert(root->left, key, a);
    } else if (key > root->key) {
        root->right = insert(root->right, key, a);
    }
    return root;
}

static void plain_free(Node *n) {
    if (n == NULL) {
        return;
    }
    plain_free(n->left);
    plain_free(n->right);
    counted_free(n);
}

static int sum(const Node *n) {
    return n == NULL ? 0 : n->key + sum(n->left) + sum(n->right);
}

int main(void) {
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    size_t n = sizeof keys / sizeof keys[0];

    Arena *a = arena_create(n * sizeof(Node));
    Node *t1 = NULL;
    for (size_t i = 0; i < n; i++) {
        t1 = insert(t1, keys[i], a);
    }
    printf("арена: сума=%d, malloc=%zu, вузли=%zu байтів\n", sum(t1), g_malloc, a->used);
    arena_destroy(a);
    printf("арена: free=%zu\n", g_free);

    g_malloc = 0;
    g_free = 0;
    Node *t2 = NULL;
    for (size_t i = 0; i < n; i++) {
        t2 = insert(t2, keys[i], NULL);
    }
    printf("malloc: сума=%d, malloc=%zu\n", sum(t2), g_malloc);
    plain_free(t2);
    printf("malloc: free=%zu\n", g_free);
    return 0;
}
`,
      String.raw`// аварія: арена вичерпана, alloc повернув NULL, а код записує без перевірки
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    unsigned char *base;
    size_t cap;
    size_t used;
    size_t count;
} Arena;

static Arena *arena_create(size_t cap) {
    Arena *a = malloc(sizeof *a);
    if (a == NULL) {
        return NULL;
    }
    a->base = malloc(cap);
    if (a->base == NULL) {
        free(a);
        return NULL;
    }
    a->cap = cap;
    a->used = 0;
    a->count = 0;
    return a;
}

static void *arena_alloc(Arena *a, size_t size, size_t align) {
    if (align == 0 || (align & (align - 1)) != 0) {
        return NULL;
    }
    uintptr_t addr = (uintptr_t)(a->base + a->used);
    size_t pad = (size_t)((align - (addr & (align - 1))) & (align - 1));
    if (pad > a->cap - a->used || size > a->cap - a->used - pad) {
        return NULL;
    }
    void *p = a->base + a->used + pad;
    a->used += pad + size;
    a->count++;
    return p;
}

static void arena_reset(Arena *a) {
    a->used = 0;
    a->count = 0;
}

static void arena_destroy(Arena *a) {
    if (a == NULL) {
        return;
    }
    free(a->base);
    free(a);
}

int main(void) {
    Arena *a = arena_create(16);
    int *xs = arena_alloc(a, 8 * sizeof(int), _Alignof(int));
    xs[0] = 1;
    printf("%d\n", xs[0]);
    arena_destroy(a);
    return 0;
}
`,
    ],
    note: "Арена звільняє пам'ять лише оптом, а вказівники в ній живуть до <code>reset</code> чи <code>destroy</code>. Виділення повертає <code>NULL</code> при браку місця, і це треба перевіряти. Адресу вирівнюйте за справжнім значенням, а перевірки робіть без переповнення <code>size_t</code>.",
    work: "Арени вживають компілятори (синтаксичні дерева), ігрові рушії (пам'ять на кадр), HTTP-сервери (пам'ять на запит) та парсери. Apache має пули пам'яті, а Go-рантайм і V8 мають власні регіональні схеми. Заміна тисяч <code>free</code> одним скиданням спрощує код і лікує витоки.",
    tasks: [
      "Чому в <code>arena_alloc</code> перевірку місця пишуть як <code>size &gt; cap - used - pad</code>, а не <code>used + pad + size &gt; cap</code>?",
      "Чому арена не підходить для об'єктів, що тримають відкритий файл чи власний <code>malloc</code>, і чим тут допомагає розподіл на «пам'ять арени» й «зовнішні ресурси»?",
    ],
  },
  {
    t: "Проєкт: віртуальна машина й підсумок курсу",
    ch: "Проєкти",
    adv: true,
    easy: "Віртуальна машина схожа на механічне піаніно: стрічка з отворами це програма, а механізм читає отвір за отвором і натискає клавіші. Ми збудуємо такий механізм, а наприкінці пригадаємо весь шлях курсу.",
    p: [
      "Фінальний проєкт це стекова віртуальна машина: маленький комп'ютер усередині програми. Програма для нього це масив чисел (байткод), а VM читає його й виконує. За тією ж схемою працюють JVM, інтерпретатор Python, Lua і WebAssembly. Задача: опкоди, цикл виконання, стек, переходи й виклики, асемблер із тексту в байткод і обчислення факторіала двома способами, циклом і рекурсією.",
      "Проєктування. Опкоди: <code>HALT</code>, <code>PUSH n</code>, <code>POP</code>, <code>DUP</code>, <code>ADD</code>, <code>SUB</code>, <code>MUL</code>, <code>LOAD i</code>, <code>STORE i</code>, <code>JMP</code>, <code>JZ</code>, <code>CALL</code>, <code>RET</code>, <code>PRINT</code>. У стековій моделі операнди беруться з вершини стека, а результат повертається туди ж, тому <code>ADD</code> не має аргументів. Стан VM лежить у структурі <code>Vm</code> на стеку: масив значень, окремий стек адрес повернення, вісім комірок пам'яті й лічильник <code>pc</code>. Купи немає, власника пам'яті немає, а всі межі фіксовані.",
      "Асемблер перетворює рядки <code>PUSH 5</code> і мітки <code>loop:</code> на числа. Мова описана двома таблицями: <code>OP_NAMES</code> (назви) і <code>OP_ARG</code> (скільки аргументів), тож нова команда додається в одному місці. Мітки потребують двох проходів: перший запам'ятовує адреси, другий підставляє їх, інакше стрибок уперед на ще не знайдену мітку неможливий. Помилки теж коди: невідома команда, поганий аргумент, невідома мітка, завеликий текст. Програма на вході це недовірений ввід, як і будь-який інший.",
      "Цикл виконання: прочитати слово за <code>pc</code>, збільшити <code>pc</code>, вибрати дію через <code>switch</code>. Перед кожним доступом перевірка: <code>pc</code> у програмі, стек не порожній і не повний, адреса переходу існує, номер комірки допустимий. Арифметику ведіть в <code>int64_t</code>, а перед записом у <code>int32_t</code> перевіряйте діапазон: тоді 13! дає помилку <code>OVERFLOW</code>, а не UB. Ліміт кроків зупиняє нескінченний цикл, ліміт глибини викликів зупиняє нескінченну рекурсію.",
      "<code>CALL</code> кладе адресу наступної команди в стек повернень і стрибає, <code>RET</code> знімає її. Аргумент і результат ідуть через основний стек: рекурсивний факторіал це <code>DUP; JZ base; DUP; PUSH 1; SUB; CALL fact; MUL; RET</code>, де <code>base</code> знімає нуль і кладе 1. Ітеративний тримає n і добуток у комірках пам'яті. Типові помилки: забути прочитати аргумент (<code>pc</code> вказує на нього, а не на команду), змішати стек даних зі стеком повернень, пропустити <code>HALT</code>. Перевіряйте обома способами, а ще помилковими програмами: порожній стек, неіснуюча мітка, цикл без виходу.",
      "Підсумок курсу. Перші дві глави дали компіляцію, типи, керування й функції. Масиви й рядки показали пам'ять як послідовність байтів із нулем у кінці. Вказівники й пам'ять навчили стеку, купі, <code>malloc</code>, <code>free</code> та власнику. Структури, модулі й препроцесор дали власні типи, заголовки, макроси. Глави про помилки й стандартну бібліотеку охопили коди повернення, файли, час і математику. Структури даних (вектор, список, хеш-таблиця, дерево), тестування із санітайзерами й системне програмування (аргументи, буфери, процеси, потоки) привели до чотирьох проєктів цієї глави.",
      "Що вчити далі: «Мова програмування C» Кернігана й Рітчі (класика, але C89), «Modern C» Єнса Густедта (сучасно й безкоштовно), код ядра Linux (читайте з коментарями про стиль), Valgrind і ASan із UBSan на кожному запуску тестів, embedded (регістри, <code>volatile</code>, пам'ять без <code>malloc</code>), C23 із <code>nullptr</code>, <code>constexpr</code> та <code>#embed</code>, і Rust як сусіда, що перевіряє власника пам'яті компілятором. Чесне попередження: UB не означає «одразу впаде». Програма може роками «працювати», а потім перестати з новою версією компілятора. Санітайзер бачить лише те, що виконалось, тож чистий прогін нічого не доводить. Не покладайтеся на «у мене працює».",
    ],
    code: [
      String.raw`#include <stdio.h>

enum { PUSH, ADD, MUL, PRINT, HALT };

static int run(const int *code, size_t len) {
    int stack[8];
    size_t sp = 0;
    size_t pc = 0;
    while (pc < len) {
        int op = code[pc++];
        if (op == PUSH) {
            if (pc >= len || sp >= 8) {
                return -1;
            }
            stack[sp++] = code[pc++];
        } else if (op == ADD || op == MUL) {
            if (sp < 2) {
                return -1;
            }
            int b = stack[--sp];
            int a = stack[--sp];
            stack[sp++] = op == ADD ? a + b : a * b;
        } else if (op == PRINT) {
            if (sp == 0) {
                return -1;
            }
            printf("%d\n", stack[--sp]);
        } else if (op == HALT) {
            return 0;
        } else {
            return -1;
        }
    }
    return -1;
}

int main(void) {
    int good[] = {PUSH, 2, PUSH, 3, ADD, PUSH, 4, MUL, PRINT, HALT};
    int bad[] = {ADD, HALT};
    int open[] = {PUSH, 1};
    printf("good: %d\n", run(good, sizeof good / sizeof good[0]));
    printf("bad: %d\n", run(bad, sizeof bad / sizeof bad[0]));
    printf("без HALT: %d\n", run(open, sizeof open / sizeof open[0]));
    return 0;
}
`,
      String.raw`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define CODE_MAX 128
#define LABEL_MAX 16

typedef enum {
    OP_HALT, OP_PUSH, OP_POP, OP_DUP, OP_ADD, OP_SUB, OP_MUL,
    OP_LOAD, OP_STORE, OP_JMP, OP_JZ, OP_CALL, OP_RET, OP_PRINT, OP_COUNT
} Op;

static const char *OP_NAMES[OP_COUNT] = {
    "HALT", "PUSH", "POP", "DUP", "ADD", "SUB", "MUL",
    "LOAD", "STORE", "JMP", "JZ", "CALL", "RET", "PRINT"
};

static const int OP_ARG[OP_COUNT] = {0, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 0, 0};

typedef enum { ASM_OK, ASM_BAD_MNEMONIC, ASM_BAD_ARG, ASM_BAD_LABEL, ASM_TOO_LONG } AsmErr;

static const char *ASM_NAMES[] = {"OK", "BAD_MNEMONIC", "BAD_ARG", "BAD_LABEL", "TOO_LONG"};

typedef struct {
    int32_t code[CODE_MAX];
    size_t len;
} Program;

typedef struct {
    char name[16];
    size_t addr;
} Label;

static int find_op(const char *w) {
    for (int i = 0; i < OP_COUNT; i++) {
        if (strcmp(OP_NAMES[i], w) == 0) {
            return i;
        }
    }
    return -1;
}

static int find_label(const Label *l, size_t n, const char *w, size_t *addr) {
    for (size_t i = 0; i < n; i++) {
        if (strcmp(l[i].name, w) == 0) {
            *addr = l[i].addr;
            return 1;
        }
    }
    return 0;
}

static AsmErr assemble(const char *src, Program *out) {
    Label labels[LABEL_MAX];
    size_t nl = 0;
    for (int pass = 0; pass < 2; pass++) {
        out->len = 0;
        const char *p = src;
        while (*p != '\0') {
            const char *eol = strchr(p, '\n');
            size_t n = eol != NULL ? (size_t)(eol - p) : strlen(p);
            char line[64];
            if (n >= sizeof line) {
                return ASM_TOO_LONG;
            }
            memcpy(line, p, n);
            line[n] = '\0';
            p += n + (eol != NULL ? 1 : 0);
            char *semi = strchr(line, ';');
            if (semi != NULL) {
                *semi = '\0';
            }
            char w1[16], w2[32], w3[32];
            int cnt = sscanf(line, "%15s %31s %31s", w1, w2, w3);
            if (cnt <= 0) {
                continue;
            }
            size_t l1 = strlen(w1);
            if (w1[l1 - 1] == ':') {
                if (cnt != 1) {
                    return ASM_BAD_ARG;
                }
                w1[l1 - 1] = '\0';
                if (pass == 0) {
                    if (nl == LABEL_MAX) {
                        return ASM_TOO_LONG;
                    }
                    snprintf(labels[nl].name, sizeof labels[nl].name, "%s", w1);
                    labels[nl].addr = out->len;
                    nl++;
                }
                continue;
            }
            int op = find_op(w1);
            if (op < 0) {
                return ASM_BAD_MNEMONIC;
            }
            if (cnt != 1 + (OP_ARG[op] != 0)) {
                return ASM_BAD_ARG;
            }
            if (out->len + 1 + (OP_ARG[op] != 0) > CODE_MAX) {
                return ASM_TOO_LONG;
            }
            out->code[out->len++] = op;
            if (OP_ARG[op] == 1) {
                char *end;
                long v = strtol(w2, &end, 10);
                if (*end != '\0' || v < -1000000 || v > 1000000) {
                    return ASM_BAD_ARG;
                }
                out->code[out->len++] = (int32_t)v;
            } else if (OP_ARG[op] == 2) {
                size_t addr = 0;
                if (pass == 1 && !find_label(labels, nl, w2, &addr)) {
                    return ASM_BAD_LABEL;
                }
                out->code[out->len++] = (int32_t)addr;
            }
        }
    }
    return ASM_OK;
}


int main(void) {
    Program prog;
    AsmErr e = assemble("PUSH 3\ntop:\nDUP\nPRINT\nPUSH 1\nSUB\nDUP\nJZ done\nJMP top\ndone:\nHALT\n", &prog);
    printf("asm: %s, слів: %zu\n", ASM_NAMES[e], prog.len);
    for (size_t i = 0; i < prog.len;) {
        int op = (int)prog.code[i];
        if (OP_ARG[op] != 0) {
            printf("%02zu: %s %d\n", i, OP_NAMES[op], (int)prog.code[i + 1]);
            i += 2;
        } else {
            printf("%02zu: %s\n", i, OP_NAMES[op]);
            i += 1;
        }
    }
    return 0;
}
`,
      String.raw`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define CODE_MAX 128
#define STACK_MAX 32
#define CALL_MAX 16
#define MEM_SIZE 8
#define MAX_STEPS 10000
#define LABEL_MAX 16

typedef enum {
    OP_HALT, OP_PUSH, OP_POP, OP_DUP, OP_ADD, OP_SUB, OP_MUL,
    OP_LOAD, OP_STORE, OP_JMP, OP_JZ, OP_CALL, OP_RET, OP_PRINT, OP_COUNT
} Op;

static const char *OP_NAMES[OP_COUNT] = {
    "HALT", "PUSH", "POP", "DUP", "ADD", "SUB", "MUL",
    "LOAD", "STORE", "JMP", "JZ", "CALL", "RET", "PRINT"
};

static const int OP_ARG[OP_COUNT] = {0, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 0, 0};

typedef enum { ASM_OK, ASM_BAD_MNEMONIC, ASM_BAD_ARG, ASM_BAD_LABEL, ASM_TOO_LONG } AsmErr;
typedef enum { VM_OK, VM_STACK_OVER, VM_STACK_UNDER, VM_BAD_OP, VM_BAD_ADDR, VM_CALL_OVER, VM_OVERFLOW, VM_STEPS } VmErr;

static const char *ASM_NAMES[] = {"OK", "BAD_MNEMONIC", "BAD_ARG", "BAD_LABEL", "TOO_LONG"};
static const char *VM_NAMES[] = {"OK", "STACK_OVER", "STACK_UNDER", "BAD_OP", "BAD_ADDR", "CALL_OVER", "OVERFLOW", "STEPS"};

typedef struct {
    int32_t code[CODE_MAX];
    size_t len;
} Program;

typedef struct {
    char name[16];
    size_t addr;
} Label;

static int find_op(const char *w) {
    for (int i = 0; i < OP_COUNT; i++) {
        if (strcmp(OP_NAMES[i], w) == 0) {
            return i;
        }
    }
    return -1;
}

static int find_label(const Label *l, size_t n, const char *w, size_t *addr) {
    for (size_t i = 0; i < n; i++) {
        if (strcmp(l[i].name, w) == 0) {
            *addr = l[i].addr;
            return 1;
        }
    }
    return 0;
}

static AsmErr assemble(const char *src, Program *out) {
    Label labels[LABEL_MAX];
    size_t nl = 0;
    for (int pass = 0; pass < 2; pass++) {
        out->len = 0;
        const char *p = src;
        while (*p != '\0') {
            const char *eol = strchr(p, '\n');
            size_t n = eol != NULL ? (size_t)(eol - p) : strlen(p);
            char line[64];
            if (n >= sizeof line) {
                return ASM_TOO_LONG;
            }
            memcpy(line, p, n);
            line[n] = '\0';
            p += n + (eol != NULL ? 1 : 0);
            char *semi = strchr(line, ';');
            if (semi != NULL) {
                *semi = '\0';
            }
            char w1[16], w2[32], w3[32];
            int cnt = sscanf(line, "%15s %31s %31s", w1, w2, w3);
            if (cnt <= 0) {
                continue;
            }
            size_t l1 = strlen(w1);
            if (w1[l1 - 1] == ':') {
                if (cnt != 1) {
                    return ASM_BAD_ARG;
                }
                w1[l1 - 1] = '\0';
                if (pass == 0) {
                    if (nl == LABEL_MAX) {
                        return ASM_TOO_LONG;
                    }
                    snprintf(labels[nl].name, sizeof labels[nl].name, "%s", w1);
                    labels[nl].addr = out->len;
                    nl++;
                }
                continue;
            }
            int op = find_op(w1);
            if (op < 0) {
                return ASM_BAD_MNEMONIC;
            }
            if (cnt != 1 + (OP_ARG[op] != 0)) {
                return ASM_BAD_ARG;
            }
            if (out->len + 1 + (OP_ARG[op] != 0) > CODE_MAX) {
                return ASM_TOO_LONG;
            }
            out->code[out->len++] = op;
            if (OP_ARG[op] == 1) {
                char *end;
                long v = strtol(w2, &end, 10);
                if (*end != '\0' || v < -1000000 || v > 1000000) {
                    return ASM_BAD_ARG;
                }
                out->code[out->len++] = (int32_t)v;
            } else if (OP_ARG[op] == 2) {
                size_t addr = 0;
                if (pass == 1 && !find_label(labels, nl, w2, &addr)) {
                    return ASM_BAD_LABEL;
                }
                out->code[out->len++] = (int32_t)addr;
            }
        }
    }
    return ASM_OK;
}

typedef struct {
    int32_t stack[STACK_MAX];
    size_t sp;
    size_t calls[CALL_MAX];
    size_t cp;
    int32_t mem[MEM_SIZE];
    size_t pc;
} Vm;

static VmErr push(Vm *vm, int64_t v) {
    if (v > INT32_MAX || v < INT32_MIN) {
        return VM_OVERFLOW;
    }
    if (vm->sp >= STACK_MAX) {
        return VM_STACK_OVER;
    }
    vm->stack[vm->sp++] = (int32_t)v;
    return VM_OK;
}

static VmErr pop(Vm *vm, int32_t *v) {
    if (vm->sp == 0) {
        return VM_STACK_UNDER;
    }
    *v = vm->stack[--vm->sp];
    return VM_OK;
}

static VmErr vm_run(const Program *prog) {
    Vm vm;
    memset(&vm, 0, sizeof vm);
    for (long steps = 0; steps < MAX_STEPS; steps++) {
        if (vm.pc >= prog->len) {
            return VM_BAD_ADDR;
        }
        int op = prog->code[vm.pc++];
        int32_t arg = 0;
        if (op >= 0 && op < OP_COUNT && OP_ARG[op] != 0) {
            if (vm.pc >= prog->len) {
                return VM_BAD_ADDR;
            }
            arg = prog->code[vm.pc++];
        }
        VmErr e = VM_OK;
        int32_t a, b;
        switch (op) {
        case OP_HALT:
            return VM_OK;
        case OP_PUSH:
            e = push(&vm, arg);
            break;
        case OP_POP:
            e = pop(&vm, &a);
            break;
        case OP_DUP:
            if (vm.sp == 0) {
                e = VM_STACK_UNDER;
            } else {
                e = push(&vm, vm.stack[vm.sp - 1]);
            }
            break;
        case OP_ADD:
        case OP_SUB:
        case OP_MUL:
            e = pop(&vm, &b);
            if (e == VM_OK) {
                e = pop(&vm, &a);
            }
            if (e == VM_OK) {
                int64_t r = op == OP_ADD ? (int64_t)a + b : op == OP_SUB ? (int64_t)a - b : (int64_t)a * b;
                e = push(&vm, r);
            }
            break;
        case OP_LOAD:
            if (arg < 0 || arg >= MEM_SIZE) {
                return VM_BAD_ADDR;
            }
            e = push(&vm, vm.mem[arg]);
            break;
        case OP_STORE:
            if (arg < 0 || arg >= MEM_SIZE) {
                return VM_BAD_ADDR;
            }
            e = pop(&vm, &vm.mem[arg]);
            break;
        case OP_JMP:
        case OP_JZ:
        case OP_CALL: {
            if (arg < 0 || (size_t)arg >= prog->len) {
                return VM_BAD_ADDR;
            }
            int take = 1;
            if (op == OP_JZ) {
                e = pop(&vm, &a);
                take = e == VM_OK && a == 0;
            } else if (op == OP_CALL) {
                if (vm.cp >= CALL_MAX) {
                    return VM_CALL_OVER;
                }
                vm.calls[vm.cp++] = vm.pc;
            }
            if (take) {
                vm.pc = (size_t)arg;
            }
            break;
        }
        case OP_RET:
            if (vm.cp == 0) {
                return VM_BAD_ADDR;
            }
            vm.pc = vm.calls[--vm.cp];
            break;
        case OP_PRINT:
            e = pop(&vm, &a);
            if (e == VM_OK) {
                printf("%d\n", a);
            }
            break;
        default:
            return VM_BAD_OP;
        }
        if (e != VM_OK) {
            return e;
        }
    }
    return VM_STEPS;
}

static void run_text(const char *name, const char *src) {
    Program prog;
    AsmErr ae = assemble(src, &prog);
    if (ae != ASM_OK) {
        printf("%s: asm error %s\n", name, ASM_NAMES[ae]);
        return;
    }
    VmErr ve = vm_run(&prog);
    printf("%s: %s (code=%zu)\n", name, VM_NAMES[ve], prog.len);
}

int main(void) {
    run_text("iter", "PUSH 5\nSTORE 0\nPUSH 1\nSTORE 1\nloop:\nLOAD 0\nJZ end\nLOAD 1\nLOAD 0\nMUL\nSTORE 1\nLOAD 0\nPUSH 1\nSUB\nSTORE 0\nJMP loop\nend:\nLOAD 1\nPRINT\nHALT\n");
    run_text("rec10", "PUSH 10\nCALL fact\nPRINT\nHALT\nfact:\nDUP\nJZ base\nDUP\nPUSH 1\nSUB\nCALL fact\nMUL\nRET\nbase:\nPOP\nPUSH 1\nRET\n");
    run_text("rec13", "PUSH 13\nCALL fact\nPRINT\nHALT\nfact:\nDUP\nJZ base\nDUP\nPUSH 1\nSUB\nCALL fact\nMUL\nRET\nbase:\nPOP\nPUSH 1\nRET\n");
    run_text("under", "ADD\nHALT\n");
    run_text("nolabel", "JMP nowhere\n");
    return 0;
}
`,
      String.raw`// аварія: assert на порожньому стеку: pop без перевірки, програма ADD без операндів
#include <assert.h>
#include <stdio.h>

static int stack[8];
static size_t sp = 0;

static int pop(void) {
    assert(sp > 0);
    return stack[--sp];
}

int main(void) {
    int code[] = {1, 1};
    int b = pop();
    int a = pop();
    printf("%d\n", a + b + code[0]);
    return 0;
}
`,
    ],
    note: "Усі межі VM перевіряйте до доступу: байткод це недовірений ввід. Арифметику ведіть у ширшому типі, лімітуйте кроки й глибину викликів. А чистий прогін санітайзера лише каже, що виконані шляхи без помилок, а не що UB немає.",
    work: "VM і байткод стоять за мовами й рушіями: JVM, CPython, Lua, eBPF у ядрі Linux, WebAssembly, ігрові скриптові системи. Той самий проєкт навчає читати асемблер і розуміти, що робить процесор, коли ви пишете цикл або виклик функції.",
    tasks: [
      "Навіщо асемблеру два проходи і що станеться зі стрибком <code>JMP end</code>, якщо мітку <code>end</code> оголошено нижче в тексті?",
      "Чому арифметику VM виконують в <code>int64_t</code>, а не прямо в <code>int32_t</code>, і що тоді відбувається з <code>13!</code>?",
    ],
  },
];
