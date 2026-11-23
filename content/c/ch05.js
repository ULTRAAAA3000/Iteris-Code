export const LESSONS_05 = [
  {
    t: "Структури",
    ch: "Структури й типи",
    easy: "Структура це анкета з іменованими графами: ім'я, клас і середній бал лежать в одному бланку й рухаються разом. Замість трьох окремих змінних ви зберігаєте й передаєте один об'єкт із власним типом.",
    p: [
      "Досі кожне значення жило у своїй змінній. Але запис про студента це ім'я, клас і середній бал, і тримати їх окремо незручно: три змінні, три параметри функції, паралельні масиви, а нове поле доводиться додавати скрізь. <b>Структура</b> (<code>struct</code>) збирає кілька значень, навіть різних типів, під одним іменем. Це перший крок до власних типів даних, на яких стоїть усе наступне: списки, дерева, записи, протоколи.",
      "Оголошення описує тип і пам'яті не займає: <code>struct Student { char name[16]; int grade; double avg; };</code>. Повне ім'я типу це <code>struct Student</code>, слово <code>struct</code> є його частиною. Крапка з комою після закривної дужки обов'язкова: її пропуск дає дивну помилку далеко від справжнього місця. Змінна оголошується як <code>struct Student a;</code>, а до її <b>членів</b> (полів) звертаються крапкою: <code>a.grade = 9;</code>, <code>printf(\"%s\", a.name);</code>.",
      "Структуру можна ініціалізувати списком у порядку оголошення: <code>struct Student a = {\"Olena\", 9, 10.5};</code>. Зручніша форма C99 з <b>призначеними ініціалізаторами</b>: <code>{ .grade = 9, .name = \"Ira\" }</code>. Порядок тоді довільний, а всі пропущені поля стають нулями. Запис <code>= {0}</code> обнуляє всю структуру. Без ініціалізатора локальна структура, як і <code>int</code>, містить сміття, тому читати її поля до запису не можна.",
      "Модель пам'яті проста: структура це один суцільний шматок, у якому поля лежать підряд у порядку оголошення. Перше поле починається з адреси самої структури, а кожне наступне зі свого стабільного зсуву. Між полями компілятор може вставити байти вирівнювання (padding), тому <code>sizeof</code> структури буває більшим за суму розмірів полів: деталі були в уроці про вирівнювання. Практичне правило одне: розмір беріть через <code>sizeof(struct Student)</code>, а не додавайте вручну.",
      "Присвоєння структур копіює всі байти: <code>b = a;</code> створює незалежну копію, разом із масивом <code>name</code> всередині. Це незвично, бо сам масив присвоїти не можна, а масив у складі структури копіюється. Після копіювання зміна <code>b.grade</code> не чіпає <code>a</code>. Зате оператора <code>==</code> для структур не існує, і спроба його вжити не компілюється. Порівнюйте поля по одному: <code>memcmp</code> тут ненадійний, бо байти padding містять сміття.",
      "Структуру можна передати у функцію й повернути з неї, і в обох випадках працює копія. Для малих типів, як точка чи діапазон, це зручно й природно: <code>struct Point add(struct Point a, struct Point b)</code> нічого не псує у викликача. Для великих структур копіювання дороге, і тоді передають адресу, про що наступні уроки. Окремий запис <code>struct Student</code> усюди швидко набридає, тому далі ми скоротимо його через <code>typedef</code>.",
    ],
    code: [
      String.raw`#include <stdio.h>

struct Student {
    char name[16];
    int grade;
    double avg;
};

int main(void) {
    struct Student a = {"Olena", 9, 10.5};
    printf("%s, %d клас, середній %.1f\n", a.name, a.grade, a.avg);
    a.grade++;
    a.avg = 11.0;
    printf("%s, %d клас, середній %.1f\n", a.name, a.grade, a.avg);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <string.h>

struct Student {
    char name[16];
    int grade;
    double avg;
};

int main(void) {
    struct Student a = {.grade = 9, .name = "Ira"};
    struct Student zero = {0};
    struct Student b = a;
    strcpy(b.name, "Petro");
    b.grade = 10;
    printf("a: %s %d %.1f\n", a.name, a.grade, a.avg);
    printf("b: %s %d %.1f\n", b.name, b.grade, b.avg);
    printf("zero: [%s] %d %.1f\n", zero.name, zero.grade, zero.avg);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stddef.h>

struct Point {
    int x;
    int y;
};

struct Point add(struct Point a, struct Point b) {
    struct Point r = {a.x + b.x, a.y + b.y};
    return r;
}

int main(void) {
    struct Point p = {1, 2};
    struct Point q = {10, 20};
    struct Point s = add(p, q);
    printf("(%d, %d)\n", s.x, s.y);
    printf("p не змінилась: (%d, %d)\n", p.x, p.y);
    printf("x стоїть перед y: %d\n", offsetof(struct Point, x) < offsetof(struct Point, y));
    printf("sizeof не менший за суму: %d\n", sizeof(struct Point) >= 2 * sizeof(int));
    return 0;
}`,
      String.raw`// не компілюється: структури не порівнюються через ==
#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main(void) {
    struct Point a = {1, 2};
    struct Point b = {1, 2};
    if (a == b) {
        printf("рівні\n");
    }
    return 0;
}`,
    ],
    note: "Структура це суцільний блок полів у порядку оголошення, між якими може бути padding. Присвоєння <code>b = a</code> копіює всі байти, а оператора <code>==</code> для структур немає: порівнюйте поля по одному. Розмір беріть через <code>sizeof</code>.",
    work: "Структури описують усе, що має кілька властивостей: запис користувача, точку, пакет протоколу, налаштування, рядок таблиці. Системні API мають вигляд структур (<code>struct tm</code>, <code>struct stat</code>), тому читати їх треба впевнено.",
    tasks: [
      "Що станеться з оригіналом, якщо присвоїти <code>b = a;</code> і змінити <code>b.grade</code>? Чому копіюється й масив <code>name</code> всередині?",
      "Чому <code>sizeof(struct S)</code> може бути більшим за суму розмірів полів, і чому не можна порівнювати структури через <code>memcmp</code>?",
    ],
  },
  {
    t: "typedef і вкладені структури",
    ch: "Структури й типи",
    easy: "typedef це прізвисько для типу: замість довгого «struct Point» ви пишете коротке «Point». Вкладені структури це матрьошка: прямокутник складається з двох точок, а кожна точка з двох чисел.",
    p: [
      "Писати <code>struct Point</code> щоразу втомлює, а в C є спосіб дати типу коротке ім'я: <code>typedef</code>. Форма <code>typedef існуючий_тип нове_ім'я;</code> нічого не створює, лише додає синонім. Тому <code>typedef unsigned long ulong;</code> і <code>typedef int Score;</code> працюють так само, як і для структур. Синонім не є окремим типом: <code>Score</code> і <code>int</code> сумісні без жодних приведень.",
      "Найчастіша ідіома поєднує оголошення структури й синонім в одному записі: <code>typedef struct { int x; int y; } Point;</code>. Структура тут анонімна, і єдине її ім'я це <code>Point</code>. Тоді змінні пишуть як <code>Point p = {1, 2};</code>, без слова <code>struct</code>. Якщо ж структура посилається сама на себе (вузол списку), потрібен тег: <code>typedef struct Node { int v; struct Node *next; } Node;</code>. Усередині оголошення синонім ще не існує, тому там пишуть <code>struct Node *</code>.",
      "Теги й синоніми живуть у різних просторах імен, тому <code>typedef struct Point { ... } Point;</code> цілком законне: тег <code>struct Point</code> і синонім <code>Point</code> не конфліктують. Договір для проєкту простий: типи пишуть з великої літери (<code>Point</code>, <code>Rect</code>), а суфікс <code>_t</code> залишають за POSIX і стандартною бібліотекою, його не вигадують самі. Синонім корисний і для вказівників на функції: <code>typedef int (*Cmp)(const void *, const void *);</code> читається набагато легше.",
      "Структури можуть містити інші структури. Прямокутник це дві точки: <code>typedef struct { Point min; Point max; } Rect;</code>. Тоді дані лежать <b>всередині</b> батьківського об'єкта, в одному суцільному шматку: спочатку весь <code>min</code>, потім весь <code>max</code>. До внутрішніх полів добираються ланцюжком крапок: <code>r.max.x</code>. Вкладена структура це не вказівник і не окремий виділений блок, це частина тіла батька, а копія <code>Rect</code> копіює й обидві точки.",
      "Вкладені структури ініціалізують вкладеними фігурними дужками: <code>Rect r = {{0, 0}, {4, 3}};</code>, або з призначеними ініціалізаторами: <code>{ .min = {0, 0}, .max = {.x = 4, .y = 3} }</code>. Друга форма читається краще й не ламається, коли порядок полів змінюють. Структура не може містити саму себе за значенням: тоді її розмір був би нескінченним. Тому <code>struct Node</code> всередині має лише вказівник на такий самий тип, а повноцінний вкладений об'єкт має бути вже повністю описаним.",
      "Вкладення добре відповідає предметній області: <code>Student</code> містить <code>Date born</code>, <code>Order</code> містить <code>Address</code>. Окремі дрібні типи легше перевіряти й перевикористовувати, ніж один великий шматок із десятком плоских полів. Ідіоми: пишіть <code>typedef</code> одразу при оголошенні структури, давайте тип із великої літери, а обчислення над вкладеними полями ховайте у функції, як <code>rect_area</code>. Далі розберемо, як передавати такі структури без зайвого копіювання.",
    ],
    code: [
      String.raw`#include <stdio.h>

typedef unsigned long ulong;
typedef int Score;

typedef struct {
    int x;
    int y;
} Point;

int main(void) {
    ulong big = 4000000000UL;
    Score s = 95;
    int plain = s;
    Point p = {3, 4};
    printf("%lu %d %d (%d, %d)\n", big, s, plain, p.x, p.y);
    return 0;
}`,
      String.raw`#include <stdio.h>

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

int main(void) {
    Rect r = {{0, 0}, {4, 3}};
    Rect moved = r;
    moved.max.x = 10;
    printf("площа r: %d\n", rect_area(r));
    printf("площа moved: %d\n", rect_area(moved));
    printf("кут: (%d, %d)\n", r.max.x, r.max.y);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

int main(void) {
    Node *second = malloc(sizeof *second);
    Node *first = malloc(sizeof *first);
    if (second == NULL || first == NULL) {
        free(second);
        free(first);
        return 1;
    }
    *second = (Node){20, NULL};
    *first = (Node){10, second};
    int sum = 0;
    for (const Node *n = first; n != NULL; n = n->next) {
        sum += n->value;
    }
    printf("сума: %d\n", sum);
    free(first);
    free(second);
    return 0;
}`,
      String.raw`// не компілюється: структура не може містити саму себе за значенням
typedef struct Node {
    int value;
    struct Node next;
} Node;

int main(void) {
    return 0;
}`,
    ],
    note: "<code>typedef</code> лише додає ім'я, а не створює новий тип. Вкладена структура лежить усередині батька, а копія батька копіює її теж. Сама в себе за значенням структура вкластися не може: для зв'язку потрібен вказівник.",
    work: "Майже кожна C-бібліотека оголошує типи через <code>typedef struct</code>: <code>Point</code>, <code>Config</code>, <code>Vec3</code>. Вкладення відображає предметну область: клієнт містить адресу, пакет містить заголовок. Вузли списків і дерев завжди мають тег для посилання на себе.",
    tasks: [
      "Чим відрізняється анонімна структура з <code>typedef</code> від структури з тегом, і коли тег обов'язковий?",
      "Чому структура не може містити поле власного типу за значенням, а вказівник на власний тип може?",
    ],
  },
  {
    t: "Структури й вказівники: -> і передача у функції",
    ch: "Структури й типи",
    easy: "Вказівник на структуру це ключ від чужого бланка: ви не переписуєте анкету, а йдете за адресою й правите її на місці. Стрілка <code>-&gt;</code> означає «піти за адресою й узяти поле».",
    p: [
      "C передає аргументи за значенням, і структури не виняток: функція отримує <b>повну копію</b>, і все, що вона змінить у параметрі, зникне разом із ним. Для структури із трьох чисел це дрібниця, але структура з масивом <code>char text[256]</code> копіює двісті п'ятдесят шість байтів на кожен виклик. Тому передавати структуру за адресою є двічі корисно: функція може змінити оригінал, і нічого не копіюється, крім самої адреси.",
      "Візьмемо <code>Account acc = {1, 100}; Account *p = &amp;acc;</code>. Щоб дістатися до поля, треба спершу розіменувати вказівник, а потім узяти поле: <code>(*p).balance</code>. Дужки обов'язкові, бо крапка має вищий пріоритет за зірочку, і <code>*p.balance</code> означало б зовсім інше. Щоб не писати дужки щоразу, у мові є стрілка: <code>p-&gt;balance</code> це точно те саме, що <code>(*p).balance</code>. Крапка працює зі структурою, стрілка з вказівником на структуру, і плутати їх компілятор не дасть.",
      "Функція, що змінює об'єкт, приймає вказівник: <code>void deposit(Account *a, long sum) { a-&gt;balance += sum; }</code>, а викликають її з адресою: <code>deposit(&amp;acc, 50);</code>. У функцію копіюється лише адреса, зазвичай вісім байтів, але вона веде до того самого об'єкта, що й у викликача. Звідси чітка модель: структура одна, вказівників на неї може бути багато, і всі вони бачать одні й ті самі поля.",
      "Якщо функція структуру лише читає, приймайте <code>const Account *a</code>. Тоді <code>a-&gt;balance = 0;</code> не скомпілюється, а читач сигналу одразу бачить: тут нічого не міняють. Це продовжує правило з уроку про <code>const</code> і вказівники. Для маленьких типів, як <code>Point</code>, за значенням передавати нормально й навіть зручно, а великі та змінювані об'єкти ходять за вказівником. Хороша звичка: перший параметр функції це об'єкт, над яким вона працює, як у <code>account_deposit(Account *a, ...)</code>.",
      "Вказівник на структуру може бути <code>NULL</code>, і тоді <code>p-&gt;balance</code> це розіменування нульової адреси: аварія. Якщо <code>NULL</code> серед допустимих значень, перевіряйте його на початку функції. Ще одна пастка: ніколи не повертайте адресу локальної структури, бо вона помре разом зі стеком виклику, а вказівник стане висячим. Повертайте структуру за значенням, заповнюйте вихідний параметр або виділяйте пам'ять через <code>malloc</code>.",
      "Стрілки добре ланцюжать: <code>p-&gt;pos.x</code> бере вкладене поле, <code>node-&gt;next-&gt;value</code> іде за двома вказівниками. Адреса поля береться звичним <code>&amp;p-&gt;id</code>: стрілка і крапка зв'язують сильніше за унарний <code>&amp;</code>. Функція може повертати й вказівник на вже наявний об'єкт, як <code>find</code>, що віддає адресу елемента масиву, а через неї потім можна змінити сам елемент. Далі це стане основою для масивів структур і динамічних записів.",
    ],
    code: [
      String.raw`#include <stdio.h>

typedef struct {
    int id;
    long balance;
} Account;

void deposit_copy(Account a, long sum) {
    a.balance += sum;
}

void deposit(Account *a, long sum) {
    a->balance += sum;
}

int main(void) {
    Account acc = {1, 100};
    deposit_copy(acc, 50);
    printf("після копії: %ld\n", acc.balance);
    deposit(&acc, 50);
    printf("після вказівника: %ld\n", acc.balance);
    Account *p = &acc;
    printf("(*p).id=%d p->id=%d\n", (*p).id, p->id);
    return 0;
}`,
      String.raw`#include <stdio.h>

typedef struct {
    int id;
    long balance;
} Account;

long balance_of(const Account *a) {
    return a->balance;
}

int withdraw(Account *a, long sum) {
    if (a == NULL || sum > a->balance) {
        return 0;
    }
    a->balance -= sum;
    return 1;
}

int main(void) {
    Account acc = {7, 80};
    int ok = withdraw(&acc, 100);
    printf("зняти 100: %d, залишок %ld\n", ok, balance_of(&acc));
    ok = withdraw(&acc, 30);
    printf("зняти 30: %d, залишок %ld\n", ok, balance_of(&acc));
    return 0;
}`,
      String.raw`#include <stdio.h>

typedef struct {
    int id;
    long balance;
} Account;

Account *find(Account *list, size_t n, int id) {
    for (size_t i = 0; i < n; i++) {
        if (list[i].id == id) {
            return &list[i];
        }
    }
    return NULL;
}

int main(void) {
    Account list[3] = {{1, 100}, {2, 250}, {3, 40}};
    Account *a = find(list, 3, 2);
    if (a != NULL) {
        a->balance += 50;
    }
    printf("рахунок 2: %ld\n", list[1].balance);
    printf("рахунок 9 знайдено: %d\n", find(list, 3, 9) != NULL);
    return 0;
}`,
      String.raw`// аварія: стрілка через NULL розіменовує нульову адресу
#include <stdio.h>

typedef struct {
    int id;
    long balance;
} Account;

long balance_of(const Account *a) {
    return a->balance;
}

int main(void) {
    Account *none = NULL;
    printf("%ld\n", balance_of(none));
    return 0;
}`,
    ],
    note: "Структура за значенням це копія, за вказівником це той самий об'єкт. Стрілка <code>p-&gt;f</code> дорівнює <code>(*p).f</code>. Для читання беріть <code>const T *</code>, а перед стрілкою через можливий <code>NULL</code> робіть перевірку.",
    work: "Типовий C API це набір функцій, що першим параметром беруть вказівник на структуру: <code>list_push(List *l, ...)</code>, <code>conn_close(Conn *c)</code>. Така форма замінює методи класів і не копіює дані. Читаючи чужий код, пошукайте стрілки: вони показують, що змінюється.",
    tasks: [
      "Чому <code>deposit_copy(acc, 50)</code> не змінює <code>acc</code>, а <code>deposit(&amp;acc, 50)</code> змінює? Що саме копіюється в кожному випадку?",
      "Чому у виразі <code>(*p).balance</code> дужки обов'язкові і для чого в C стрілка? Що станеться, якщо <code>p</code> дорівнює <code>NULL</code>?",
    ],
  },
  {
    t: "Масиви структур і динамічні структури",
    ch: "Структури й типи",
    easy: "Масив структур це таблиця: кожен рядок один запис, кожна колонка одне поле. Динамічна таблиця бере місце на купі й може рости, коли записів побільшало.",
    p: [
      "Один запис мало що дає, а програми працюють зі списками записів: товари, учні, рахунки. Масив структур оголошується так само, як масив чисел: <code>Product items[3] = {{\"pen\", 15}, {\"ink\", 40}, {\"book\", 120}};</code>. Усі елементи мають однаковий розмір і лежать підряд, кожен цілком, зі своїми полями. Тому <code>items[i].price</code> працює за звичною формулою: адреса початку плюс <code>i * sizeof(Product)</code>, а кількість елементів знаходять як <code>sizeof items / sizeof items[0]</code>.",
      "Обходити масив можна індексом чи вказівником: <code>for (const Product *p = items; p != items + n; p++)</code>, а в тілі писати <code>p-&gt;price</code>. У функцію масив структур передають так само, як і масив чисел: адреса першого елемента й довжина окремим параметром, <code>void print_all(const Product *items, size_t n)</code>. Довжина не передається разом з масивом, і втратити її означає вийти за межі.",
      "Коли кількість записів невідома заздалегідь, масив виділяють на купі: <code>Product *items = malloc(n * sizeof *items);</code>. Записувати <code>sizeof *items</code> краще, ніж <code>sizeof(Product)</code>: якщо тип зміниться, розмір підлаштується сам. Перевіряйте результат на <code>NULL</code>, працюйте з <code>items[i].price</code> як зі звичайним масивом і звільняйте блок рівно один раз. Якщо ж у структурі є вказівники на власну виділену пам'ять, спершу звільняють її в кожному елементі, а вже потім сам масив.",
      "Щоб масив міг рости, його загортають у структуру-контейнер: <code>typedef struct { Item *data; size_t len; size_t cap; } ItemList;</code>. Поле <code>len</code> це скільки записів уже є, а <code>cap</code> скільки влізе до наступного збільшення. Функція <code>list_push</code> за потреби подвоює ємність через <code>realloc</code> із тимчасовим вказівником, а потім дописує елемент у кінець. Один <code>list_free</code> звільняє все. Так працюють динамічні масиви в багатьох бібліотеках C.",
      "Сортують масив структур через <code>qsort</code> із порівнювачем, що отримує два <code>const void *</code>. Усередині їх перетворюють на вказівники на структуру й порівнюють потрібне поле: <code>const Product *x = a;</code>, далі <code>(x-&gt;price &gt; y-&gt;price) - (x-&gt;price &lt; y-&gt;price)</code>. Віднімати <code>x-&gt;price - y-&gt;price</code> не варто: різниця великих чисел переповнюється. Для тексту використовують <code>strcmp(x-&gt;name, y-&gt;name)</code>, а для кількох критеріїв перевіряють перший і лише за рівності переходять до наступного. <code>qsort</code> переставляє структури цілком, байт у байт.",
      "Є дві типові пастки. Вираз <code>malloc(n * sizeof *items)</code> при величезному <code>n</code> переповнюється й дає замалу пам'ять, тому для таблиць зручний <code>calloc(n, sizeof *items)</code>, який переповнення перевіряє. Друга пастка тонша: після <code>realloc</code> блок може переїхати, тож збережений раніше вказівник <code>&amp;items[0]</code> стає висячим. Зберігайте індекс, а адресу беріть заново безпосередньо перед використанням. Далі настане черга <code>enum</code>.",
    ],
    code: [
      String.raw`#include <stdio.h>

typedef struct {
    const char *name;
    int price;
} Product;

int main(void) {
    Product items[] = {{"pen", 15}, {"ink", 40}, {"book", 120}};
    size_t n = sizeof items / sizeof items[0];
    int total = 0;
    for (size_t i = 0; i < n; i++) {
        total += items[i].price;
    }
    printf("позицій: %zu, сума: %d\n", n, total);
    for (const Product *p = items; p != items + n; p++) {
        printf("%s -> %d\n", p->name, p->price);
    }
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char name[12];
    int price;
} Product;

int cmp_price(const void *a, const void *b) {
    const Product *x = a;
    const Product *y = b;
    return (x->price > y->price) - (x->price < y->price);
}

int main(void) {
    const char *names[] = {"pen", "ink", "book", "tape"};
    const int prices[] = {15, 40, 120, 8};
    size_t n = 4;
    Product *items = malloc(n * sizeof *items);
    if (items == NULL) {
        return 1;
    }
    for (size_t i = 0; i < n; i++) {
        snprintf(items[i].name, sizeof items[i].name, "%s", names[i]);
        items[i].price = prices[i];
    }
    qsort(items, n, sizeof *items, cmp_price);
    for (size_t i = 0; i < n; i++) {
        printf("%s %d\n", items[i].name, items[i].price);
    }
    free(items);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    int price;
} Item;

typedef struct {
    Item *data;
    size_t len;
    size_t cap;
} ItemList;

int list_push(ItemList *l, Item it) {
    if (l->len == l->cap) {
        size_t cap = l->cap == 0 ? 2 : l->cap * 2;
        Item *bigger = realloc(l->data, cap * sizeof *bigger);
        if (bigger == NULL) {
            return 0;
        }
        l->data = bigger;
        l->cap = cap;
    }
    l->data[l->len++] = it;
    return 1;
}

int main(void) {
    ItemList list = {0};
    for (int i = 1; i <= 5; i++) {
        Item it = {i, i * 10};
        if (!list_push(&list, it)) {
            free(list.data);
            return 1;
        }
    }
    printf("len=%zu cap=%zu\n", list.len, list.cap);
    printf("останній: id=%d price=%d\n", list.data[list.len - 1].id, list.data[list.len - 1].price);
    free(list.data);
    return 0;
}`,
      String.raw`// аварія: assert зупиняє програму, коли індекс виходить за довжину
#include <assert.h>
#include <stdio.h>

typedef struct {
    const char *name;
    int price;
} Product;

const Product *at(const Product *items, size_t len, size_t i) {
    assert(i < len);
    return &items[i];
}

int main(void) {
    Product items[2] = {{"pen", 15}, {"ink", 40}};
    printf("%d\n", at(items, 2, 1)->price);
    printf("%d\n", at(items, 2, 2)->price);
    return 0;
}`,
      String.raw`// фрагмент: вказівник на елемент після realloc стає висячим, так писати не можна
Item *first = &list.data[0];
list_push(&list, extra);
printf("%d\n", first->id);`,
    ],
    note: "Масив структур це суцільна таблиця однакових записів. Розмір беріть через <code>sizeof *items</code>, довжину передавайте окремо, а порівнювач <code>qsort</code> пишіть без віднімання. Після <code>realloc</code> старі вказівники на елементи недійсні.",
    work: "Таблиці записів скрізь: рядки результату запиту, список файлів у каталозі, масив частинок у грі. Контейнер із <code>data</code>, <code>len</code> і <code>cap</code> це робоча конячка C-проєктів, а <code>qsort</code> по полю структури найпоширеніший спосіб упорядкувати такі дані.",
    tasks: [
      "Чому порівнювач для <code>qsort</code> краще писати як <code>(a &gt; b) - (a &lt; b)</code>, ніж як різницю <code>a - b</code>?",
      "Що станеться з вказівником на елемент динамічного масиву після <code>realloc</code> і як цього уникнути?",
    ],
  },
  {
    t: "enum",
    ch: "Структури й типи",
    easy: "enum це список іменованих ярликів: замість «0, 1, 2» ви пишете RED, GREEN, BLUE. Для комп'ютера це звичайні цілі числа, а для людини зрозумілі слова, які ще й перевіряє компілятор.",
    p: [
      "У коді, де стан описано числами, на кшталт <code>if (state == 2)</code>, ніхто не розуміє, що таке двійка. Такі «магічні числа» ламаються, коли додають новий стан, і їх неможливо шукати. Вихід: дати значенням імена. Це можна зробити через <code>#define</code>, але <code>enum</code> кращий: він групує споріднені константи, нумерує їх сам і лишається видимим для компілятора та відладчика.",
      "Синтаксис такий: <code>enum Color { RED, GREEN, BLUE };</code>. Константи нумеруються від нуля підряд: 0, 1, 2. Значення можна задати явно: <code>enum Level { LOW = 10, MID = 20, HIGH };</code>, і тоді <code>HIGH</code> стане 21, бо наступна константа більша за попередню на одиницю. Змінну оголошують як <code>enum Color c = GREEN;</code>, а з <code>typedef</code> просто <code>Color c</code>. Імена констант потрапляють в загальний простір імен файлу, тому їм дають префікс, <code>COLOR_RED</code>, щоб вони не стикалися.",
      "Модель проста: константа enum це <b>цілочисельна константа</b> типу <code>int</code>, а змінна enum зберігається як ціле. Її можна додавати, порівнювати й виводити через <code>%d</code>. Головне, чого не варто чекати: захисту. <code>enum Color c = (enum Color)42;</code> компілюється й працює, C не перевіряє діапазон. Тому enum це зручність для людини й підказка для компілятора, а не бар'єр. Правильність значень мають забезпечувати ви, особливо для даних, що прийшли ззовні.",
      "Найкраща пара для <code>enum</code> це <code>switch</code>. Якщо в <code>switch</code> за enum пропустити константу й не писати <code>default</code>, <code>gcc -Wall</code> попередить про це (<code>-Wswitch</code>). Так, додавши новий стан, ви отримаєте список місць, які треба оновити. Тому в «повних» перемикачах <code>default</code> не пишуть, а недопустимі значення обробляють після <code>switch</code>: <code>return \"невідомий\";</code>. Для значень ззовні <code>default</code> усе ж потрібен.",
      "Останню константу часто залишають службовою: <code>enum Dir { NORTH, EAST, SOUTH, WEST, DIR_COUNT };</code>. Тепер <code>DIR_COUNT</code> дорівнює 4 і може бути розміром масиву. Таблиці назв будують призначеними ініціалізаторами: <code>names[DIR_COUNT] = { [NORTH] = \"північ\", ... }</code>, порядок тоді не має значення. Цикл і «наступне за колом» теж пишуться легко: <code>(d + 1) % DIR_COUNT</code>. Усе це працює, поки значення йдуть підряд без пропусків.",
      "Ще одна ідіома це прапорці: <code>enum { PERM_READ = 1 &lt;&lt; 0, PERM_WRITE = 1 &lt;&lt; 1 };</code> дає окремі біти, які комбінують через <code>|</code> і перевіряють через <code>&amp;</code>, як у уроці про маски. На відміну від <code>const int</code>, константа enum це справжній константний вираз, тож її можна поставити в розмір масиву чи <code>case</code>. Якщо числа йдуть у файл чи мережу, задавайте їх явно: порядок оголошення потім можна змінити, а формат даних лишиться тим самим.",
    ],
    code: [
      String.raw`#include <stdio.h>

enum Color { RED, GREEN, BLUE };

const char *color_name(enum Color c) {
    switch (c) {
    case RED:
        return "червоний";
    case GREEN:
        return "зелений";
    case BLUE:
        return "синій";
    }
    return "невідомий";
}

int main(void) {
    enum Color c = GREEN;
    printf("%d %s\n", (int)c, color_name(c));
    printf("RED=%d BLUE=%d\n", RED, BLUE);
    printf("42: %s\n", color_name((enum Color)42));
    return 0;
}`,
      String.raw`#include <stdio.h>

typedef enum {
    LOW = 10,
    MID = 20,
    HIGH
} Level;

int main(void) {
    Level l = HIGH;
    printf("LOW=%d MID=%d HIGH=%d\n", LOW, MID, HIGH);
    if (l > MID) {
        printf("рівень вищий за MID\n");
    }
    int buf[LOW];
    printf("масив із %zu елементів\n", sizeof buf / sizeof buf[0]);
    return 0;
}`,
      String.raw`#include <stdio.h>

typedef enum {
    DIR_NORTH,
    DIR_EAST,
    DIR_SOUTH,
    DIR_WEST,
    DIR_COUNT
} Dir;

static const char *const NAMES[DIR_COUNT] = {
    [DIR_NORTH] = "північ",
    [DIR_EAST] = "схід",
    [DIR_SOUTH] = "південь",
    [DIR_WEST] = "захід",
};

Dir turn_right(Dir d) {
    return (Dir)((d + 1) % DIR_COUNT);
}

int main(void) {
    Dir d = DIR_WEST;
    for (int i = 0; i < 3; i++) {
        printf("%s -> ", NAMES[d]);
        d = turn_right(d);
    }
    printf("%s\n", NAMES[d]);
    printf("напрямків: %d\n", DIR_COUNT);
    return 0;
}`,
      String.raw`#include <stdio.h>

enum {
    PERM_READ = 1 << 0,
    PERM_WRITE = 1 << 1,
    PERM_EXEC = 1 << 2
};

void show(unsigned perms) {
    printf("%c%c%c\n", perms & PERM_READ ? 'r' : '-', perms & PERM_WRITE ? 'w' : '-', perms & PERM_EXEC ? 'x' : '-');
}

int main(void) {
    unsigned p = PERM_READ | PERM_WRITE;
    show(p);
    p |= PERM_EXEC;
    p &= ~(unsigned)PERM_WRITE;
    show(p);
    return 0;
}`,
      String.raw`// не компілюється: імена констант enum спільні для всього файлу
enum Color { RED, GREEN };
enum Light { RED, YELLOW };

int main(void) {
    return 0;
}`,
    ],
    note: "Константи enum це цілі числа з іменами: нумерація з нуля підряд, значення можна задати. Діапазон C не перевіряє. Імена спільні для файлу, тому давайте префікс. У повному <code>switch</code> без <code>default</code> компілятор нагадає про пропущену константу.",
    work: "Стани автоматів, коди помилок, типи токенів, напрями, режими роботи: усе це enum. Разом із <code>switch</code> він робить код самодокументованим, а службова константа <code>_COUNT</code> дає розмір таблиць назв. Прапорці прав доступу в системних API теж описують як enum або макроси.",
    tasks: [
      "Чому <code>enum Color c = (enum Color)42;</code> компілюється, і що з цього випливає для даних, прочитаних із файлу?",
      "Навіщо в кінці списку констант додають службову <code>_COUNT</code> і чому в повному <code>switch</code> за enum не пишуть <code>default</code>?",
    ],
  },
  {
    t: "union і теговані об'єднання",
    ch: "Структури й типи",
    easy: "union це одна шухляда, в якій лежить або ціле, або дійсне, або вказівник, а місця стільки, скільки треба найбільшому. Етикетка-тег на шухляді каже, що саме лежить усередині зараз.",
    p: [
      "Інколи значення може мати різний вид: число, рядок чи помилка. Структура з усіма можливими полями марнує пам'ять, адже заповнене лише одне. Для цього є <b>об'єднання</b> (<code>union</code>): оголошується як структура, <code>union Num { int i; double d; };</code>, але всі члени починаються з однієї адреси й <b>ділять одну пам'ять</b>. Розмір об'єднання дорівнює найбільшому члену (з урахуванням вирівнювання), а не сумі.",
      "Модель така: у шухляді лежить набір байтів, а члени це різні способи його читати. Запис у <code>n.d</code> перезаписує ті самі байти, що й <code>n.i</code>. Безпечно читати той член, який записували останнім. Читання іншого члена в C означає, що байти трактують як інший тип, і результат залежить від платформи: порядку байтів і представлення чисел. Для навчального й переносного коду на це не покладаються, а для справжнього копіювання бітів використовують <code>memcpy</code>.",
      "Головна проблема об'єднання в тому, що воно <b>не пам'ятає, який член активний</b>. Рішення це <b>тегове об'єднання</b>: структура з полем-тегом (зазвичай <code>enum</code>) і самим <code>union</code>. Приклад: <code>typedef struct { Kind kind; union { int i; double d; const char *s; } as; } Value;</code>. Тег каже, який член чинний, і весь код читає лише його. Це відповідає «сумі типів» з інших мов: значення є або цілим, або дійсним, або рядком.",
      "Тегове об'єднання створюють у функціях-конструкторах, які ставлять тег і значення разом: <code>Value v = {.kind = KIND_INT, .as.i = 42};</code>. Призначений ініціалізатор записує один член об'єднання, а решта нулі. Обробляють значення через <code>switch (v.kind)</code>, у кожному <code>case</code> читаючи відповідний член. Якщо тег і значення розсинхронізувати, помилка стає непомітною, тому змінюйте їх лише разом і в одному місці. C11 дозволяє анонімне об'єднання без імені <code>as</code>, тоді пишуть <code>v.i</code>, але ім'я часто робить код ясніше.",
      "Тегове об'єднання економить пам'ять: розмір <code>Value</code> це тег плюс найбільший член із вирівнюванням, а не сума всіх полів. Для масиву з мільйона змінних значень різниця помітна. Проте реальні числа залежать від платформи, тому перевіряйте властивість (наприклад, «менше за суму»), а не конкретне число. Ще одна тонкість: <code>const char *s</code> у об'єднанні лише вказує на текст і ним не володіє. Якщо текст тимчасовий або треба звільняти, власність має бути чітко визначеною за тегом.",
      "Типові пастки: прочитати не той член, забути гілку <code>case</code> для нового тегу, а також покластися на «зазвичай збіг» байтів. Страхуйтеся <code>assert(v.kind == KIND_INT)</code> у функціях доступу. Тегові об'єднання лежать в основі токенів лексерів, вузлів синтаксичних дерев, команд віртуальних машин і повідомлень протоколів. У наступному уроці ми зберемо структури, масиви, enum та union в одну невелику програму обліку записів.",
    ],
    code: [
      String.raw`#include <stdio.h>

union Num {
    int i;
    double d;
};

int main(void) {
    union Num n;
    n.i = 7;
    printf("i=%d\n", n.i);
    n.d = 2.5;
    printf("d=%.1f\n", n.d);
    printf("не менший за найбільший член: %d\n", sizeof(union Num) >= sizeof(double));
    printf("менший за суму членів: %d\n", sizeof(union Num) < sizeof(int) + sizeof(double));
    return 0;
}`,
      String.raw`#include <stdint.h>
#include <stdio.h>

union Word {
    uint32_t u;
    unsigned char b[4];
};

int main(void) {
    union Word w;
    w.u = 0x01020304;
    int sum = 0;
    for (int i = 0; i < 4; i++) {
        sum += w.b[i];
    }
    printf("сума байтів: %d\n", sum);
    printf("перший байт 1 або 4: %d\n", w.b[0] == 1 || w.b[0] == 4);
    return 0;
}`,
      String.raw`#include <stdio.h>
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
    Value list[] = {make_int(3), make_double(1.5), make_str("abcd")};
    double total = 0;
    for (size_t i = 0; i < sizeof list / sizeof list[0]; i++) {
        print_value(list[i]);
        total += as_number(list[i]);
    }
    printf("сума: %.1f\n", total);
    printf("менше за окремі поля: %d\n", sizeof(Value) < sizeof(Kind) + sizeof(int) + sizeof(double) + sizeof(const char *));
    return 0;
}`,
      String.raw`// аварія: assert ловить читання члена, що не відповідає тегу
#include <assert.h>
#include <stdio.h>

typedef enum { KIND_INT, KIND_STR } Kind;

typedef struct {
    Kind kind;
    union {
        int i;
        const char *s;
    } as;
} Value;

int get_int(Value v) {
    assert(v.kind == KIND_INT);
    return v.as.i;
}

int main(void) {
    Value a = {.kind = KIND_INT, .as.i = 5};
    Value b = {.kind = KIND_STR, .as.s = "text"};
    printf("%d\n", get_int(a));
    printf("%d\n", get_int(b));
    return 0;
}`,
    ],
    note: "Члени <code>union</code> ділять одну пам'ять, а який з них чинний, об'єднання не знає. Тому поруч тримають <code>enum</code>-тег, створюють значення в конструкторах і читають член через <code>switch</code> за тегом. Читання не того члена дає залежний від платформи результат.",
    work: "Тегові об'єднання це «сума типів» у C: токени лексера, вузли синтаксичного дерева, значення JSON, команди віртуальної машини, події в циклі обробки. Звичайні <code>union</code> без тегу трапляються в системному коді для доступу до регістрів і байтів.",
    tasks: [
      "Чому розмір <code>union</code> дорівнює найбільшому члену, і що станеться з <code>n.i</code>, якщо записати щось у <code>n.d</code>?",
      "Яку роль у тегованому об'єднанні відіграє поле <code>kind</code> і яка помилка виникне, якщо його не узгодити з активним членом?",
    ],
  },
  {
    t: "Практика: облік записів",
    ch: "Структури й типи",
    easy: "Облік записів це картотека на столі: кожна картка одна структура, шухляда динамічний масив, а звіт це картки, розкладені за порядком. Ми зберемо її з уже знайомих деталей.",
    p: [
      "Збираємо маленьку програму обліку товарів на складі. Вона розбирає рядки тексту в структури, зберігає їх у масиві, що росте, сортує за вартістю, рахує підсумки за категоріями й змінює один запис за ідентифікатором. Тут працюють усі теми глави: <code>struct</code>, <code>typedef</code>, <code>enum</code>, вказівники на структури, <code>qsort</code> і динамічна пам'ять. Будуємо знизу вгору: спочатку дані, потім функції, які можна перевірити окремо, і лише потім <code>main</code>.",
      "Почнімо з моделі. Запис це <code>Record</code> з ідентифікатором, назвою, кількістю, ціною та категорією. Категорія це <code>enum</code> зі службовою <code>CAT_COUNT</code>, а назви лежать у масиві за індексами enum. Назву тримаємо як <code>char name[16]</code>, а не <code>char *</code>: запис тоді самодостатній, його можна копіювати присвоєнням, і він не володіє жодною зовнішньою пам'яттю, а отже нічого не треба звільняти. Ціна цього лише кілька зайвих байтів.",
      "Розбір рядка це місце, де дані ззовні зустрічаються з вашими структурами, тож довіряти їм не можна. <code>sscanf(line, \"%d %15s %d %d %15s\", ...)</code> має повернути 5, а ширина <code>%15s</code> на одиницю менша за буфер, щоб лишилося місце для нуля. Читаємо в тимчасову змінну <code>tmp</code> і копіюємо у вихідний параметр лише коли всі перевірки пройдені: кількість і ціна не від'ємні, категорія відома. Так функція ніколи не залишає викликачу напівзаповнений запис.",
      "Ввід у пісочниці йде з рядка-літерала, у справжній програмі це був би <code>fgets</code> зі <code>stdin</code>, і інтерфейс розбору лишається той самий. Текст ділимо за символом нового рядка через <code>strchr</code>, а кожен рядок копіюємо в локальний буфер через <code>snprintf(line, sizeof line, \"%.*s\", (int)n, p)</code>. Формат <code>%.*s</code> бере довжину з аргументу, тому надто довгий рядок буде обрізано, а не перепише сусідню пам'ять.",
      "Для зберігання беремо контейнер <code>Table</code> з полями <code>data</code>, <code>len</code> і <code>cap</code>. Функція <code>table_push</code> подвоює ємність через <code>realloc</code> із тимчасовим вказівником, а <code>table_free</code> звільняє все й обнуляє поля. Таблиця володіє своїм масивом, а всі функції приймають <code>Table *</code>, без глобальних змінних. Адреса, взята в такому масиві, живе лише до наступного <code>push</code>, тому довго тримати вказівник на елемент не можна: після <code>realloc</code> він стає висячим.",
      "Звіт будуємо з трьох кроків. Сортуємо через <code>qsort</code> за вартістю (<code>qty * price</code>) за спаданням, а за рівної вартості за <code>id</code>, щоб порядок був однозначним і однаковим на кожному запуску. Підсумки за категоріями збираємо в масив <code>long total[CAT_COUNT]</code>, індексований enum: цикл по записах додає вартість у <code>total[r.cat]</code>. Пошук за <code>id</code> повертає <code>Record *</code>, і через цей вказівник можна змінити поле на місці.",
      "Перевіряйте програму зі <code>-Wall -Wextra -fsanitize=address,undefined</code>: LeakSanitizer одразу скаже, якщо забули <code>table_free</code>, а ASan піймає вихід за межі. Хороша перевірка це надрукувати очікуване й побачити його на екрані. Каркас «розібрати, зберегти, відсортувати, підсумувати» стане основою багатьох програм; далі в курсі ми розділимо такий код на файли <code>.h</code> і <code>.c</code> та збиратимемо його через <code>make</code>.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <string.h>

typedef enum { CAT_TOOL, CAT_FOOD, CAT_TOY, CAT_COUNT } Category;

static const char *const CAT_NAMES[CAT_COUNT] = {
    [CAT_TOOL] = "tool",
    [CAT_FOOD] = "food",
    [CAT_TOY] = "toy",
};

typedef struct {
    int id;
    char name[16];
    int qty;
    int price;
    Category cat;
} Record;

int parse_category(const char *s, Category *out) {
    for (int c = 0; c < CAT_COUNT; c++) {
        if (strcmp(s, CAT_NAMES[c]) == 0) {
            *out = (Category)c;
            return 1;
        }
    }
    return 0;
}

int parse_record(const char *line, Record *r) {
    char cat[16];
    Record tmp;
    if (sscanf(line, "%d %15s %d %d %15s", &tmp.id, tmp.name, &tmp.qty, &tmp.price, cat) != 5) {
        return 0;
    }
    if (tmp.qty < 0 || tmp.price < 0 || !parse_category(cat, &tmp.cat)) {
        return 0;
    }
    *r = tmp;
    return 1;
}

int main(void) {
    const char *lines[] = {"1 hammer 10 12 tool", "oops", "6 kite -2 5 toy", "3 robot 4 45 toy", "9 cake 1 7 sweets"};
    for (size_t i = 0; i < sizeof lines / sizeof lines[0]; i++) {
        Record r;
        if (parse_record(lines[i], &r)) {
            printf("ok: %s x%d, %s\n", r.name, r.qty, CAT_NAMES[r.cat]);
        } else {
            printf("відхилено: %s\n", lines[i]);
        }
    }
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int id;
    int qty;
} Pair;

typedef struct {
    Pair *data;
    size_t len;
    size_t cap;
} Table;

int table_push(Table *t, Pair p) {
    if (t->len == t->cap) {
        size_t cap = t->cap == 0 ? 2 : t->cap * 2;
        Pair *bigger = realloc(t->data, cap * sizeof *bigger);
        if (bigger == NULL) {
            return 0;
        }
        t->data = bigger;
        t->cap = cap;
    }
    t->data[t->len++] = p;
    return 1;
}

void table_free(Table *t) {
    free(t->data);
    t->data = NULL;
    t->len = 0;
    t->cap = 0;
}

int main(void) {
    const char *text = "1 10\n2 x\n3 30\n4 40\n";
    Table t = {0};
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
        Pair pair;
        if (sscanf(line, "%d %d", &pair.id, &pair.qty) == 2 && table_push(&t, pair)) {
            continue;
        }
        rejected++;
    }
    printf("прийнято: %zu, відхилено: %d, ємність: %zu\n", t.len, rejected, t.cap);
    table_free(&t);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef enum { CAT_TOOL, CAT_FOOD, CAT_TOY, CAT_COUNT } Category;

static const char *const CAT_NAMES[CAT_COUNT] = {
    [CAT_TOOL] = "tool",
    [CAT_FOOD] = "food",
    [CAT_TOY] = "toy",
};

typedef struct {
    int id;
    char name[16];
    int qty;
    int price;
    Category cat;
} Record;

typedef struct {
    Record *data;
    size_t len;
    size_t cap;
} Table;

int parse_category(const char *s, Category *out) {
    for (int c = 0; c < CAT_COUNT; c++) {
        if (strcmp(s, CAT_NAMES[c]) == 0) {
            *out = (Category)c;
            return 1;
        }
    }
    return 0;
}

int parse_record(const char *line, Record *r) {
    char cat[16];
    Record tmp;
    if (sscanf(line, "%d %15s %d %d %15s", &tmp.id, tmp.name, &tmp.qty, &tmp.price, cat) != 5) {
        return 0;
    }
    if (tmp.qty < 0 || tmp.price < 0 || !parse_category(cat, &tmp.cat)) {
        return 0;
    }
    *r = tmp;
    return 1;
}

int table_push(Table *t, Record r) {
    if (t->len == t->cap) {
        size_t cap = t->cap == 0 ? 4 : t->cap * 2;
        Record *bigger = realloc(t->data, cap * sizeof *bigger);
        if (bigger == NULL) {
            return 0;
        }
        t->data = bigger;
        t->cap = cap;
    }
    t->data[t->len++] = r;
    return 1;
}

void table_free(Table *t) {
    free(t->data);
    t->data = NULL;
    t->len = 0;
    t->cap = 0;
}

int cmp_value_desc(const void *a, const void *b) {
    const Record *x = a;
    const Record *y = b;
    long vx = (long)x->qty * x->price;
    long vy = (long)y->qty * y->price;
    if (vx != vy) {
        return (vx < vy) - (vx > vy);
    }
    return (x->id > y->id) - (x->id < y->id);
}

Record *table_find(Table *t, int id) {
    for (size_t i = 0; i < t->len; i++) {
        if (t->data[i].id == id) {
            return &t->data[i];
        }
    }
    return NULL;
}

int main(void) {
    const char *text =
        "1 hammer 10 12 tool\n"
        "2 apple 200 3 food\n"
        "3 robot 4 45 toy\n"
        "oops\n"
        "4 saw 3 20 tool\n"
        "5 bread 0 2 food\n"
        "6 kite -2 5 toy\n"
        "7 drill 2 80 tool\n"
        "8 tape 6 10 tool\n";
    Table t = {0};
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
        Record r;
        if (parse_record(line, &r) && table_push(&t, r)) {
            continue;
        }
        rejected++;
    }
    printf("прийнято: %zu, відхилено: %d\n", t.len, rejected);
    qsort(t.data, t.len, sizeof *t.data, cmp_value_desc);
    long total[CAT_COUNT] = {0};
    long count[CAT_COUNT] = {0};
    for (size_t i = 0; i < t.len; i++) {
        const Record *r = &t.data[i];
        printf("%s %d x %d = %d\n", r->name, r->qty, r->price, r->qty * r->price);
        total[r->cat] += (long)r->qty * r->price;
        count[r->cat] += r->qty;
    }
    for (int c = 0; c < CAT_COUNT; c++) {
        printf("%s: %ld шт., %ld\n", CAT_NAMES[c], count[c], total[c]);
    }
    Record *robot = table_find(&t, 3);
    if (robot != NULL) {
        robot->qty += 6;
        printf("поповнення %s: %d шт.\n", robot->name, robot->qty);
    }
    printf("товар 99 знайдено: %d\n", table_find(&t, 99) != NULL);
    table_free(&t);
    return 0;
}`,
      String.raw`// не компілюється: у table_push передали саму таблицю замість адреси
#include <stdio.h>

typedef struct {
    int id;
} Rec;

typedef struct {
    Rec *data;
    size_t len;
} Table;

int table_push(Table *t, Rec r) {
    (void)t;
    (void)r;
    return 1;
}

int main(void) {
    Table t = {0};
    Rec r = {1};
    table_push(t, r);
    return 0;
}`,
    ],
    note: "Програму збирають знизу вгору: тип запису, розбір рядка з перевірками, контейнер із чіткою власністю, потім сортування й звіт. Дані ззовні недовірені: перевіряйте результат <code>sscanf</code> і межі, а виділене звільняйте рівно один раз.",
    work: "Так влаштовані прості бази даних, розбирачі CSV, складські й облікові програми: розібрати рядки в структури, зберегти в динамічному масиві, відсортувати, підсумувати. Той самий каркас лежить в основі багатьох реальних C-проєктів, лише замість рядка там файли чи мережа.",
    tasks: [
      "Чому розбір записують спершу в тимчасову змінну <code>tmp</code>, а у вихідний параметр копіюють лише після всіх перевірок?",
      "Чому порівнювач <code>qsort</code> додатково порівнює <code>id</code> за рівної вартості, і чому не можна довго тримати вказівник на елемент таблиці після <code>push</code>?",
    ],
  },
  {
    t: "Бітові поля",
    ch: "Структури й типи",
    adv: true,
    easy: "Бітове поле це графа анкети, що займає не байт, а кілька біт: прапорець один, місяць чотири. Так кілька дрібних значень упаковуються в одне ціле слово, як дата на штампі.",
    p: [
      "Звичайне поле структури займає щонайменше байт, тож прапорець <code>char ready</code> витрачає вісім біт на один. Коли таких значень багато, а пам'ять або формат даних тісні (прапорці стану, дата у два байти, поля заголовка пристрою), корисні <b>бітові поля</b>. Ширину в бітах пишуть після двокрапки: <code>unsigned ready : 1;</code>. Компілятор упакує сусідні поля в одне слово й сам виконає всі зсуви й маски.",
      "Приклад: <code>struct Stamp { unsigned day : 5; unsigned month : 4; unsigned year : 7; };</code>. П'ять біт дають 0..31 для дня, чотири 0..15 для місяця, сім 0..127 для року від 2000. Усього шістнадцять біт замість трьох <code>int</code>. Тип поля вказують явно <code>unsigned</code> або <code>signed</code>: для простого <code>int</code> знаковість поля визначає реалізація. Безіменне поле <code>unsigned : 3;</code> лишає порожнє місце, а ширина нуль <code>unsigned : 0;</code> змушує почати нову одиницю зберігання.",
      "Користуватися полями можна як звичайними: <code>s.month = 11;</code>, <code>if (s.year &gt; 20)</code>. У виразах таке поле перетворюється на <code>int</code>, тому у <code>printf</code> його друкують через <code>%d</code>. Запис значення, що не влазить, для <code>unsigned</code>-поля визначений: зберігаються лише молодші біти, тобто значення береться за модулем два в степені ширини. Якщо записати 9 у трибітове поле, там опиниться 1. Для знакових полів результат визначає реалізація, тому на це не розраховують.",
      "Найважливіше, що слід знати, це що <b>розкладка бітових полів не гарантована стандартом</b>. Від реалізації залежить, з якого кінця слова починається перше поле, чи може поле перетинати межу слова, який розмір і вирівнювання має структура. Тому структуру з бітовими полями не записують у файл чи мережу «як є»: інший компілятор чи платформа складуть біти інакше. Припущення про розмір фіксують перевіркою часу компіляції: <code>static_assert(sizeof(struct Stamp) &lt;= sizeof(unsigned), \"...\")</code>.",
      "Бітові поля мають жорсткі обмеження. Їхню адресу взяти не можна: <code>&amp;s.month</code> не скомпілюється, адже поле може починатися посеред байта, а вказівники адресують лише цілі байти. Для них немає <code>sizeof</code> і <code>offsetof</code>, а до функції їх передають значенням. Є й обмеження для потоків: сусідні бітові поля становлять один об'єкт пам'яті, тому запис в одне з них у двох потоках без захисту дає гонку даних, хоч поля й різні.",
      "Альтернатива це ручні маски й зсуви, як в уроці про бітові операції: <code>(w &gt;&gt; 5) &amp; 0xF</code> бере місяць із слова. Вони переносимі та точно відповідають формату, а бітові поля зручніші й читабельніші. Практичне правило таке: для внутрішніх прапорців і компактних структур у межах однієї програми беріть бітові поля, а для зовнішніх форматів файлів і протоколів пакуйте й розпаковуйте байти вручну. Далі розберемо гнучкі масиви-члени та непрозорі типи.",
    ],
    code: [
      String.raw`#include <assert.h>
#include <stdio.h>

struct Stamp {
    unsigned day : 5;
    unsigned month : 4;
    unsigned year : 7;
};

static_assert(sizeof(struct Stamp) <= sizeof(unsigned), "дата має вміщатися в unsigned");

struct Stamp make_stamp(int year, int month, int day) {
    struct Stamp s = {.day = (unsigned)day, .month = (unsigned)month, .year = (unsigned)(year - 2000)};
    return s;
}

int main(void) {
    struct Stamp s = make_stamp(2025, 11, 22);
    printf("%d-%02d-%02d\n", 2000 + s.year, s.month, s.day);
    printf("менше за три int: %d\n", sizeof s < 3 * sizeof(int));
    return 0;
}`,
      String.raw`#include <stdio.h>

struct Flags {
    unsigned ready : 1;
    unsigned error : 1;
    unsigned mode : 3;
};

int main(void) {
    struct Flags f = {0};
    f.ready = 1;
    f.mode = 5;
    printf("ready=%d error=%d mode=%d\n", f.ready, f.error, f.mode);
    f.ready = !f.ready;
    printf("ready=%d\n", f.ready);
    unsigned big = 9;
    f.mode = big;
    printf("mode=%d\n", f.mode);
    return 0;
}`,
      String.raw`#include <stdint.h>
#include <stdio.h>

uint16_t pack(int year, int month, int day) {
    return (uint16_t)(((year - 2000) << 9) | (month << 5) | day);
}

int year_of(uint16_t w) {
    return 2000 + ((w >> 9) & 0x7F);
}

int month_of(uint16_t w) {
    return (w >> 5) & 0xF;
}

int day_of(uint16_t w) {
    return w & 0x1F;
}

int main(void) {
    uint16_t w = pack(2025, 11, 22);
    printf("слово: %u\n", (unsigned)w);
    printf("%d-%02d-%02d\n", year_of(w), month_of(w), day_of(w));
    return 0;
}`,
      String.raw`// не компілюється: адресу бітового поля взяти не можна
#include <stdio.h>

struct Flags {
    unsigned ready : 1;
    unsigned mode : 3;
};

int main(void) {
    struct Flags f = {1, 2};
    unsigned *p = &f.mode;
    printf("%u\n", *p);
    return 0;
}`,
    ],
    note: "Бітове поле задає ширину в бітах: <code>unsigned month : 4</code>. Запис надто великого значення в <code>unsigned</code>-поле лишає молодші біти. Розкладка залежить від реалізації, адресу поля взяти не можна, тож для зовнішніх форматів використовуйте ручні маски.",
    work: "Бітові поля зустрічаються в драйверах і описах регістрів, у прапорцях стану об'єктів, у компактних записах для вбудованих систем. Для файлових і мережевих форматів їм зазвичай віддають перевагу маскам, бо складання біт у різних компіляторах не збігається.",
    tasks: [
      "Яке значення опиниться в полі <code>unsigned mode : 3</code> після запису 9 і чому?",
      "Чому структуру з бітовими полями не варто записувати у файл напряму і чому не можна взяти адресу такого поля?",
    ],
  },
  {
    t: "Гнучкі масиви-члени й непрозорі типи",
    ch: "Структури й типи",
    adv: true,
    easy: "Гнучкий масив це хвіст структури змінної довжини: заголовок із довжиною, а відразу за ним скільки завгодно даних в одному блоці. Непрозорий тип це запечатаний конверт: видно лише адресу, а вміст знає тільки автор.",
    p: [
      "Буфер із довжиною зручно описати так: <code>struct { size_t len; char *data; }</code>. Але тоді виділень два: одне для структури й одне для даних. Відповідно потрібні й два <code>free</code>, а блоки лежать у пам'яті окремо. C99 дає кращий спосіб: <b>гнучкий масив-член</b>, останнє поле без розміру: <code>typedef struct { size_t len; char data[]; } Text;</code>. Дані тоді розміщуються прямо за заголовком в одному блоці.",
      "Розмір <code>sizeof(Text)</code> охоплює лише заголовок разом із можливим padding, а хвіст не враховує. Тому виділяють <code>malloc(sizeof *t + n + 1)</code>, і після цього <code>t-&gt;data[i]</code> коректне для всіх i в межах виділеного. Обмеження: гнучкий член має бути останнім і не єдиним, а структуру з ним не вкладають в інші структури й не складають у масиви. Старий прийом із <code>char data[1]</code> застарів і формально є невизначеною поведінкою, тому його не пишуть.",
      "Є ще нюанс, що присвоєння <code>*a = *b</code> копіює лише заголовок, а хвіст ні, тож такі структури створюють лише функціями та передають тільки вказівниками. Якщо хвіст складається з елементів, розмір рахують як <code>sizeof *l + n * sizeof l-&gt;items[0]</code>. У цьому множенні при величезному <code>n</code> легко переповнитися, тому перед <code>malloc</code> перевіряють <code>n &gt; (SIZE_MAX - sizeof *l) / sizeof l-&gt;items[0]</code> і повертають <code>NULL</code>. Переваги такого підходу: один блок, один <code>free</code>, краща локальність.",
      "Друга половина уроку про інкапсуляцію. У C немає ключових слів <code>private</code>, але є <b>неповний тип</b>: <code>typedef struct Stack Stack;</code> оголошує ім'я без визначення. Користувач може тримати <code>Stack *</code>, передавати його у функції й повертати, але не бачить полів і не знає розміру. Визначення <code>struct Stack { ... }</code> лежить лише у <code>.c</code> файлі бібліотеки. Тоді код клієнта фізично не здатен залізти у внутрішні дані.",
      "Через те що розмір невідомий, клієнт не може створити <code>Stack s;</code> на стеку чи викликати <code>sizeof(Stack)</code>. Тому бібліотека надає пару <code>stack_new</code> і <code>stack_free</code>, а володіє об'єктом той, хто його створив. Корисно, щоб <code>stack_free(NULL)</code> нічого не робило, як і <code>free(NULL)</code>. Найвідоміший непрозорий тип це <code>FILE</code>: ви тримаєте <code>FILE *</code> і ніколи не дивитеся всередину. Вигода подвійна: внутрішність можна змінити, не чіпаючи клієнтів, і не можна зіпсувати інваріанти ззовні.",
      "У одному файлі це можна відтворити так: зверху оголошення типу й прототипи (як у <code>.h</code>), далі <code>main</code>, а під ним визначення структури та функцій (як у <code>.c</code>). Компілятор у <code>main</code> бачить лише неповний тип, тому спроба <code>s-&gt;len</code> дає помилку. Обидві техніки можна поєднувати: непрозорий <code>Text</code> із гнучким масивом усередині ховає формат даних за простим API. Заголовки й збірку з кількох файлів детально розбирає наступна глава.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    size_t len;
    char data[];
} Text;

Text *text_new(const char *s) {
    size_t n = strlen(s);
    Text *t = malloc(sizeof *t + n + 1);
    if (t == NULL) {
        return NULL;
    }
    t->len = n;
    memcpy(t->data, s, n + 1);
    return t;
}

int main(void) {
    Text *t = text_new("привіт");
    if (t == NULL) {
        return 1;
    }
    printf("довжина в байтах: %zu\n", t->len);
    printf("текст: %s\n", t->data);
    printf("заголовок без даних: %d\n", sizeof(Text) == sizeof(size_t));
    free(t);
    return 0;
}`,
      String.raw`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    size_t n;
    int items[];
} IntList;

IntList *list_new(const int *src, size_t n) {
    if (n > (SIZE_MAX - sizeof(IntList)) / sizeof(int)) {
        return NULL;
    }
    IntList *l = malloc(sizeof *l + n * sizeof l->items[0]);
    if (l == NULL) {
        return NULL;
    }
    l->n = n;
    for (size_t i = 0; i < n; i++) {
        l->items[i] = src[i];
    }
    return l;
}

long list_sum(const IntList *l) {
    long s = 0;
    for (size_t i = 0; i < l->n; i++) {
        s += l->items[i];
    }
    return s;
}

int main(void) {
    const int src[] = {4, 8, 15, 16, 23, 42};
    IntList *l = list_new(src, 6);
    if (l == NULL) {
        return 1;
    }
    printf("n=%zu sum=%ld\n", l->n, list_sum(l));
    printf("завелике n відхилено: %d\n", list_new(src, SIZE_MAX / 2) == NULL);
    free(l);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Stack Stack;

Stack *stack_new(void);
int stack_push(Stack *s, int v);
int stack_pop(Stack *s, int *out);
size_t stack_size(const Stack *s);
void stack_free(Stack *s);

int main(void) {
    Stack *s = stack_new();
    if (s == NULL) {
        return 1;
    }
    for (int i = 1; i <= 5; i++) {
        stack_push(s, i * i);
    }
    int v = 0;
    while (stack_size(s) > 2 && stack_pop(s, &v)) {
        printf("знято %d\n", v);
    }
    printf("залишилось: %zu\n", stack_size(s));
    stack_free(s);
    return 0;
}

struct Stack {
    int *data;
    size_t len;
    size_t cap;
};

Stack *stack_new(void) {
    return calloc(1, sizeof(Stack));
}

int stack_push(Stack *s, int v) {
    if (s->len == s->cap) {
        size_t cap = s->cap == 0 ? 4 : s->cap * 2;
        int *bigger = realloc(s->data, cap * sizeof *bigger);
        if (bigger == NULL) {
            return 0;
        }
        s->data = bigger;
        s->cap = cap;
    }
    s->data[s->len++] = v;
    return 1;
}

int stack_pop(Stack *s, int *out) {
    if (s->len == 0) {
        return 0;
    }
    *out = s->data[--s->len];
    return 1;
}

size_t stack_size(const Stack *s) {
    return s->len;
}

void stack_free(Stack *s) {
    if (s != NULL) {
        free(s->data);
        free(s);
    }
}`,
      String.raw`// не компілюється: поля неповного типу з main не видно
#include <stdio.h>

typedef struct Stack Stack;

Stack *stack_new(void);

int main(void) {
    Stack *s = stack_new();
    printf("%zu\n", s->len);
    return 0;
}`,
    ],
    note: "Гнучкий масив-член <code>T data[]</code> стоїть останнім, а розмір блока це <code>sizeof *p</code> плюс хвіст, один <code>malloc</code> і один <code>free</code>. Неповний тип <code>typedef struct X X;</code> ховає поля: клієнт має лише вказівник, а створює й знищує об'єкт бібліотека.",
    work: "Гнучкі масиви використовують рядки з довжиною, мережеві пакети, змінні записи в системних API й ядрах. Непрозорі типи це основа бібліотечних інтерфейсів: <code>FILE *</code>, контексти й дескриптори, внутрішність яких можна змінювати без перекомпіляції клієнтів.",
    tasks: [
      "Чому <code>sizeof</code> структури з гнучким масивом не враховує хвіст і як виділити пам'ять під <code>n</code> елементів хвоста?",
      "Що дає непрозорий тип <code>typedef struct Stack Stack;</code>, і чому клієнт не може оголосити змінну <code>Stack s;</code>?",
    ],
  },
];
