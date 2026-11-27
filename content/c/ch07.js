export const LESSONS_07 = [
  {
    t: "Помилки в C: коди повернення й errno",
    ch: "Помилки",
    easy: "Функція в C схожа на касира без книги скарг: вона не кричить про проблему, а мовчки кладе у відповідь особливий знак: -1, NULL чи код. Якщо ви не глянули на цей знак, помилка тихо поїде далі разом із вами.",
    p: [
      "У C немає винятків, блоків <code>try</code>/<code>catch</code> і розкрутки стека. Помилка це <b>звичайне значення</b>: функція повертає його або записує через вказівник, а той, хто викликав, мусить сам його перевірити. Ніхто не перерве програму замість вас. Тому вся культура обробки помилок у C зводиться до дисципліни: кожен виклик, що може не вдатися, має мати перевірку.",
      "Є три основні способи повідомити про збій. <b>Код повернення</b>: <code>int</code>, де <code>0</code> означає успіх, а ненульове значення пояснює причину. <b>NULL</b> для функцій, що повертають вказівник: так роблять <code>malloc</code> і <code>fopen</code>. <b>Сентинел</b>, особливе значення в самому результаті, як <code>EOF</code> у <code>getchar</code>. Сентинел годиться лише тоді, коли в успішного результату є вільне значення. Якщо підійде будь-яке <code>int</code>, результат віддають через <b>out-параметр</b> (вказівник на змінну викликача), а повертають лише статус.",
      "Стандартна бібліотека додає ще <code>errno</code> з <code>&lt;errno.h&gt;</code>: змінну (насправді макрос, свою для кожного потоку), куди функція записує причину збою. Три правила. Бібліотека ніколи не скидає <code>errno</code> в нуль при успіху, тому перед викликом пишіть <code>errno = 0</code>. Дивіться на неї лише після того, як сама функція повідомила про збій. І читайте одразу: наступний виклик, навіть <code>printf</code>, може її змінити, тож за потреби збережіть значення у змінну.",
      "Класичний приклад це <code>strtol</code>. Вона повертає <code>long</code>, а другим аргументом віддає <code>endptr</code>: місце, де розбір зупинився. Якщо <code>endptr == s</code>, цифр не було. Якщо <code>*endptr != '\\0'</code>, у кінці лишилося сміття. Якщо число завелике, функція повертає <code>LONG_MAX</code> або <code>LONG_MIN</code> і ставить <code>errno = ERANGE</code>. Не розраховуйте, що на рядок «abc» вона виставить <code>EINVAL</code>: стандарт C цього не гарантує, тому «немає цифр» перевіряють саме через <code>endptr</code>.",
      "Інший приклад: <code>fopen</code> для шляху, якого немає, повертає <code>NULL</code> і ставить <code>errno = ENOENT</code>. Функції <code>strerror</code> і <code>perror</code> перетворюють код на текст, але сам текст залежить від платформи й локалі. Тому в логіці порівнюйте числа (<code>ENOENT</code>, <code>ERANGE</code>), а текст лишайте для людини в журналі.",
      "Головна пастка це <b>ігнорована помилка</b>. Компілятор мовчить, програма начебто працює, а <code>NULL</code> розіменується через десять рядків і далеко від справжньої причини. Такий збій важко знайти: симптом не вказує на місце, де помилку проґавили. Перевіряйте кожен результат, що може не вдатися; не помилитися допомагає й ранній вихід, коли перевірка стоїть на початку функції, а основна логіка йде далі без зайвої вкладеності.",
      "Далі в главі: <code>assert</code> для помилок програміста, результат-структура, яка не дає проігнорувати помилку непомітно, а потім <code>goto cleanup</code> для звільнення ресурсів.",
    ],
    code: [
      String.raw`#include <stdio.h>

static int divide(int a, int b, int *out) {
    if (b == 0) {
        return -1;
    }
    *out = a / b;
    return 0;
}

int main(void) {
    int q = 0;
    if (divide(10, 2, &q) == 0) {
        printf("10 / 2 = %d\n", q);
    }
    if (divide(1, 0, &q) != 0) {
        printf("1 / 0: помилка\n");
    }
    return 0;
}`,
      String.raw`#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

static void show(const char *s) {
    char *end;
    errno = 0;
    long v = strtol(s, &end, 10);
    if (end == s) {
        printf("%s: немає цифр\n", s);
    } else if (errno == ERANGE) {
        printf("%s: завелике, %s\n", s, v == LONG_MAX ? "LONG_MAX" : "LONG_MIN");
    } else if (*end != '\0') {
        printf("%s: прочитано %ld, залишок %s\n", s, v, end);
    } else {
        printf("%s: %ld\n", s, v);
    }
}

int main(void) {
    show("42");
    show("abc");
    show("12abc");
    show("99999999999999999999");
    return 0;
}`,
      String.raw`#include <errno.h>
#include <stdio.h>

int main(void) {
    errno = 0;
    FILE *f = fopen("/no/such/dir/iteris-missing.txt", "r");
    if (f == NULL) {
        int saved = errno;
        printf("файл не відкрито\n");
        printf("ENOENT: %s\n", saved == ENOENT ? "так" : "ні");
        return 0;
    }
    fclose(f);
    return 0;
}`,
      String.raw`// аварія: помилку (NULL) проігноровано, далі розіменування NULL
#include <stdio.h>

static const int *find(const int *a, int n, int x) {
    for (int i = 0; i < n; i++) {
        if (a[i] == x) {
            return &a[i];
        }
    }
    return NULL;
}

int main(void) {
    int data[] = {3, 5, 8};
    const int *p = find(data, 3, 7);
    printf("знайдено: %d\n", *p);
    return 0;
}`,
    ],
    note: "Помилка в C це значення, яке перевіряєте ви самі. Обнуляйте <code>errno</code> перед викликом, читайте її одразу після збою й порівнюйте з <code>ERANGE</code> чи <code>ENOENT</code>, а не з текстом <code>strerror</code>.",
    work: "Кожен системний виклик, читання файлу чи розбір конфігурації в C-проєктах закінчується перевіркою результату. Через пропущену перевірку <code>malloc</code> і <code>fopen</code> народжується чимало падінь, а в журналах серверів основна інформація це код <code>errno</code>.",
    tasks: [
      "Чому для рядка «abc» функція <code>strtol</code> не дозволяє покладатися лише на <code>errno</code>, і що перевіряють замість цього?",
      "Навіщо перед викликом <code>strtol</code> пишуть <code>errno = 0</code> і чому значення <code>errno</code> зберігають у змінну, перш ніж викликати <code>printf</code>?",
    ],
  },
  {
    t: "assert і захисне програмування",
    ch: "Помилки",
    easy: "assert це табличка «тут не можна стояти»: у правильній програмі вона ніколи не спрацьовує. Якщо ж хтось вийшов за межу, програма негайно зупиняється й показує, де саме порушено правило.",
    p: [
      "Не всі помилки однакові. Помилка зовнішнього світу (немає файлу, поганий ввід, закінчилась пам'ять) очікувана, тому функція повертає код і програма живе далі. Помилка програміста (<code>NULL</code> там, де контракт його забороняє, індекс поза масивом, від'ємна довжина) це <b>баг</b>. Його не «обробляють», бо програма вже в невідомому стані; його треба виявити й зупинитися. Для цього служить <code>assert</code>.",
      "Макрос <code>assert(умова)</code> із <code>&lt;assert.h&gt;</code> нічого не робить, коли умова істинна. Коли вона хибна, у <code>stderr</code> друкується файл, рядок, функція та текст умови, після чого викликається <code>abort()</code>: процес завершується з ненульовим кодом (сигнал <code>SIGABRT</code>). Ви отримуєте зупинку точно в місці порушення, а не «дивну» поведінку через сотню рядків.",
      "У термінах <b>контракту</b> assert записує передумови функції (що має бути правдою на вході), постумови (що вона гарантує на виході) та інваріанти (що не змінюється в циклі чи структурі). Наприклад, <code>mean</code> вимагає <code>a != NULL</code> і <code>n &gt; 0</code>. Такі рядки працюють як документація, яку перевіряє машина, а не коментар, що застаріває.",
      "Тепер найважливіше: <code>NDEBUG</code>. Якщо макрос визначено до підключення <code>&lt;assert.h&gt;</code> (у релізних збірках це прапор <code>-DNDEBUG</code>), кожен <code>assert</code> розкривається в порожній вираз, а його умова <b>взагалі не обчислюється</b>. З цього два наслідки. Побічні ефекти в умові зникають: <code>assert(i++ &lt; n)</code> у релізі не збільшить <code>i</code>. І <code>assert</code> не захищає від поганого вводу, бо в релізі його немає.",
      "Як вибрати між <code>assert</code> і <code>if</code>? Спитайте: чи може це статися в <i>правильній</i> програмі через дані ззовні? Якщо так (поганий рядок, відсутній файл, <code>malloc</code> повернув <code>NULL</code>), потрібен <code>if</code> і код помилки. Якщо це можливо лише через баг викликача, потрібен <code>assert</code>. Звичайна комбінація: на межі модуля <code>if</code> перевіряє вхідні дані, а всередині <code>assert</code> стверджує те, що після перевірки вже має бути істиною.",
      "Захисне програмування не означає «перевіряти все всюди». Перевіряйте на межах модулів, формулюйте умови явно, тримайте стан малим. Не дублюйте <code>if</code> у вигляді <code>assert</code>: шум відволікає. Умову, що складається з кількох частин, краще розбити на кілька <code>assert</code>, тоді в повідомленні видно, яка саме частина хибна. Ідіома <code>assert(cond &amp;&amp; \"пояснення\")</code> додає людський текст: літерал рядка завжди істинний, але потрапляє в повідомлення.",
      "Для умов, відомих на етапі компіляції, є <code>static_assert</code> (C11, макрос у <code>&lt;assert.h&gt;</code>, а ключове слово <code>_Static_assert</code> уже вчили в главі про препроцесор): розмір типу чи ємність таблиці перевіряє компілятор, і програма з порушенням просто не збереться.",
    ],
    code: [
      String.raw`#include <assert.h>
#include <stdio.h>

static int mean(const int *a, int n) {
    assert(a != NULL);
    assert(n > 0);
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += a[i];
    }
    return sum / n;
}

int main(void) {
    int data[] = {2, 4, 9};
    printf("середнє: %d\n", mean(data, 3));
    return 0;
}`,
      String.raw`#include <assert.h>
#include <stdio.h>

static int digit_value(char c) {
    if (c < '0' || c > '9') {
        return -1;
    }
    return c - '0';
}

static int square_digit(int d) {
    assert(d >= 0 && d <= 9);
    return d * d;
}

int main(void) {
    const char *input = "7x3";
    for (int i = 0; input[i] != '\0'; i++) {
        int d = digit_value(input[i]);
        if (d < 0) {
            printf("%c: не цифра\n", input[i]);
            continue;
        }
        printf("%c: %d\n", input[i], square_digit(d));
    }
    return 0;
}`,
      String.raw`#define NDEBUG
#include <assert.h>
#include <stdio.h>

static_assert(sizeof(int) >= 2, "int надто малий");

int main(void) {
    int calls = 0;
    assert(++calls > 0);
    printf("calls = %d\n", calls);
    return 0;
}`,
      String.raw`// аварія: assert порушено, програма завершується через abort
#include <assert.h>
#include <stdio.h>

static int at(const int *a, int n, int idx) {
    assert(a != NULL && "масив обов'язковий");
    assert(idx >= 0 && idx < n);
    return a[idx];
}

int main(void) {
    int d[3] = {1, 2, 3};
    printf("%d\n", at(d, 3, 2));
    printf("%d\n", at(d, 3, 3));
    return 0;
}`,
    ],
    note: "<code>assert</code> перевіряє помилки програміста, а не вводу чи ресурсів. У релізі з <code>NDEBUG</code> умова не обчислюється взагалі, тому жодних побічних ефектів усередині <code>assert</code>.",
    work: "У бібліотеках assert охороняє внутрішні контракти: у налагоджувальних збірках баг зупиняється на місці, а в релізі контроль знімають. Для некоректного вводу в публічному API лишаються перевірки з кодом помилки, що працюють завжди.",
    tasks: [
      "Чому <code>malloc</code>, що повернув <code>NULL</code>, перевіряють через <code>if</code>, а не через <code>assert</code>?",
      "Що надрукує програма з <code>assert(++calls &gt; 0)</code>, якщо збирати її з <code>-DNDEBUG</code>, і чому так робити не можна?",
    ],
  },
  {
    t: "Типи-результати: enum і структури",
    ch: "Помилки",
    easy: "Код -1 це записка без підпису: незрозуміло, що саме сталося, і її легко не помітити. Результат-структура більше схожа на конверт із двома відділеннями: у ньому окремо лежить відповідь, окремо причина, якщо відповіді немає.",
    p: [
      "Код повернення й out-параметр працюють, але їх легко проігнорувати: функція повернула <code>-1</code>, а викликач цього не помітив і поскакав далі. Хочеться, щоб значення й статус були нерозривні, а причини мали імена, а не загадкові числа. У C для цього є два прості засоби: <code>enum</code> для причин і <code>struct</code> як пара «значення плюс статус».",
      "<code>enum</code> це іменований набір цілих констант: <code>typedef enum { ERR_OK, ERR_DIV_ZERO, ERR_NEGATIVE } Err;</code>. Першу константу роблять нулем і називають «успіх», тоді <code>if (err)</code> читається як «є помилка». Замість <code>-1</code> і <code>-2</code> в коді стоять імена, а окрема функція <code>err_name</code> зі <code>switch</code> перетворює значення на текст для журналу. Пам'ятайте, що <code>enum</code> у C сумісний із <code>int</code>: компілятор не забороняє передати число, якого немає в переліку, зате <code>-Wswitch</code> попереджає, якщо у <code>switch</code> пропущено якусь константу.",
      "<b>Результат-структура</b>: <code>typedef struct { bool ok; int value; Err err; } Result;</code> (тип <code>bool</code> із <code>&lt;stdbool.h&gt;</code>, C99). Функція повертає її за значенням: маленька структура копіюється дешево, і ні вказівників, ні <code>malloc</code> не потрібно. Зручно мати дві функції-конструктори: <code>ok_value(v)</code> і <code>fail(e)</code>. Домовляємося, що за <code>ok == false</code> поле <code>value</code> не має значення (ми кладемо туди нуль, щоб вивід був передбачуваним).",
      "Чим це краще за сентинел <code>-1</code>? Структуру неможливо випадково використати як число: <code>int v = safe_div(10, 2);</code> просто не скомпілюється, і доведеться явно написати <code>r.value</code>. А звернувшись до поля, природно спитати й про <code>r.ok</code>. Це не абсолютний захист, бо ніщо не забороняє прочитати <code>value</code> без перевірки. Але мовчазний шлях зникає: помилка стала частиною типу, а не домовленістю в коментарі.",
      "Поширення помилки вгору виглядає так: <code>Result a = parse(x); if (!a.ok) return a;</code>. Якщо функція повертає той самий тип <code>Result</code>, помилку можна передати без перетворень. Це ручний аналог оператора <code>?</code> з інших мов: перевірив і одразу віддав нагору. Основна логіка після таких перевірок іде рівно, без вкладених <code>if</code>.",
      "Як вибрати форму? Для одного значення на виході зручний <code>Result</code>. Для кількох значень краще статус <code>Err</code> у поверненні й out-параметри для даних. Для функцій, що повертають вказівник, лишається <code>NULL</code>, а причину при потребі повідомляють окремо. Головне, щоб у модулі була одна стала схема, а не три різні.",
      "І остання деталь: помилку арифметики перевіряють <b>до</b> операції. Переповнення знакового <code>int</code> це невизначена поведінка, тож «додати й подивитися, чи стало від'ємне» не працює. Правильно писати <code>if (a &gt; INT_MAX - b)</code>, і лише потім додавати.",
    ],
    code: [
      String.raw`#include <stdio.h>

typedef enum { ERR_OK, ERR_DIV_ZERO, ERR_NEGATIVE } Err;

static const char *err_name(Err e) {
    switch (e) {
    case ERR_OK:
        return "ok";
    case ERR_DIV_ZERO:
        return "ділення на нуль";
    case ERR_NEGATIVE:
        return "від'ємне число";
    }
    return "невідома помилка";
}

static Err ratio(int a, int b, int *out) {
    if (b == 0) {
        return ERR_DIV_ZERO;
    }
    if (a < 0 || b < 0) {
        return ERR_NEGATIVE;
    }
    *out = a / b;
    return ERR_OK;
}

int main(void) {
    int pairs[][2] = {{9, 3}, {4, 0}, {-2, 5}};
    for (int i = 0; i < 3; i++) {
        int q = 0;
        Err e = ratio(pairs[i][0], pairs[i][1], &q);
        if (e == ERR_OK) {
            printf("%d / %d = %d\n", pairs[i][0], pairs[i][1], q);
        } else {
            printf("%d / %d: %s\n", pairs[i][0], pairs[i][1], err_name(e));
        }
    }
    return 0;
}`,
      String.raw`#include <limits.h>
#include <stdbool.h>
#include <stdio.h>

typedef enum { ERR_OK, ERR_DIV_ZERO, ERR_OVERFLOW } Err;

typedef struct {
    bool ok;
    int value;
    Err err;
} Result;

static Result ok_value(int v) {
    Result r = {true, v, ERR_OK};
    return r;
}

static Result fail(Err e) {
    Result r = {false, 0, e};
    return r;
}

static Result safe_div(int a, int b) {
    if (b == 0) {
        return fail(ERR_DIV_ZERO);
    }
    return ok_value(a / b);
}

static Result checked_add(int a, int b) {
    if (b > 0 && a > INT_MAX - b) {
        return fail(ERR_OVERFLOW);
    }
    return ok_value(a + b);
}

int main(void) {
    Result r = safe_div(20, 4);
    printf("20 / 4: ok=%d value=%d\n", r.ok, r.value);
    r = safe_div(1, 0);
    printf("1 / 0: ok=%d err=%d\n", r.ok, r.err == ERR_DIV_ZERO);
    r = checked_add(INT_MAX, 1);
    printf("INT_MAX + 1: ok=%d err=%d\n", r.ok, r.err == ERR_OVERFLOW);
    return 0;
}`,
      String.raw`#include <stdbool.h>
#include <stdio.h>

typedef enum { ERR_OK, ERR_NOT_DIGIT, ERR_DIV_ZERO } Err;

typedef struct {
    bool ok;
    int value;
    Err err;
} Result;

static Result parse_digit(char c) {
    Result r = {false, 0, ERR_NOT_DIGIT};
    if (c >= '0' && c <= '9') {
        r.ok = true;
        r.value = c - '0';
        r.err = ERR_OK;
    }
    return r;
}

static Result divide_digits(char x, char y) {
    Result a = parse_digit(x);
    if (!a.ok) {
        return a;
    }
    Result b = parse_digit(y);
    if (!b.ok) {
        return b;
    }
    if (b.value == 0) {
        Result r = {false, 0, ERR_DIV_ZERO};
        return r;
    }
    Result r = {true, a.value / b.value, ERR_OK};
    return r;
}

int main(void) {
    const char *cases[] = {"82", "80", "x2"};
    for (int i = 0; i < 3; i++) {
        Result r = divide_digits(cases[i][0], cases[i][1]);
        if (r.ok) {
            printf("%s -> %d\n", cases[i], r.value);
        } else {
            printf("%s -> помилка %d\n", cases[i], (int)r.err);
        }
    }
    return 0;
}`,
      String.raw`// не компілюється: структуру Result не можна мовчки сприйняти за int
#include <stdbool.h>
#include <stdio.h>

typedef struct {
    bool ok;
    int value;
} Result;

static Result safe_div(int a, int b) {
    Result r = {b != 0, b != 0 ? a / b : 0};
    return r;
}

int main(void) {
    int v = safe_div(10, 2);
    printf("%d\n", v);
    return 0;
}`,
    ],
    note: "Результат-структура робить помилку частиною типу: щоб дістати значення, треба звернутися до поля, а отже, природно перевірити <code>ok</code>. Помилку арифметики перевіряйте до операції, бо переповнення <code>int</code> це UB.",
    work: "Парсери, обгортки над системними викликами та протоколи часто повертають пару «значення чи помилка». У C це <code>enum</code> із кодами й невелика структура: так працюють розбір конфігурацій, перевірені арифметичні функції та шари між модулями.",
    tasks: [
      "Чим функція, що повертає <code>Result</code>, захищеніша від ігнорування помилки, ніж функція, що повертає <code>-1</code> як сентинел?",
      "Чому переповнення додавання <code>int</code> перевіряють виразом <code>a &gt; INT_MAX - b</code> до додавання, а не після нього?",
    ],
  },
  {
    t: "Очищення ресурсів: goto cleanup",
    ch: "Помилки",
    easy: "Коли готуєш вечерю, спочатку дістаєш каструлю, потім воду, потім вмикаєш плиту. Якщо щось пішло не так, прибираєш у зворотному порядку: вимикаєш плиту, виливаєш воду, ставиш каструлю. goto cleanup працює саме так.",
    p: [
      "Реальна функція рідко захоплює один ресурс. Вона виділяє пам'ять, відкриває файл, бере блокування, і кожен крок може не вдатися. Щойно щось зламалося посередині, треба звільнити все, що вже захоплене, і нічого зайвого. Без плану код швидко розростається: або піраміда вкладених <code>if</code>, або однакове звільнення, продубльоване перед кожним <code>return</code>. Один забутий <code>free</code> це витік пам'яті, а в C його ніхто не прибере за вас.",
      "Ідіома <b>goto cleanup</b> дає функції єдину точку виходу. Коли щось не вдалося, робимо <code>goto cleanup;</code>, а внизу функції стоїть мітка <code>cleanup:</code>, під якою звільняється все захоплене. Це одна з небагатьох ситуацій, де <code>goto</code> вважають нормальним: ядро Linux пишеться саме так. Правила суворі: стрибаємо лише <b>вперед</b> і лише до кінця функції, ніколи назад і ніколи всередину блоків.",
      "Найпростіший варіант з однією міткою. На початку всі вказівники ініціалізують значенням <code>NULL</code>, змінну <code>rc</code> (код результату) ставлять у <code>-1</code>, а на самому кінці роботи змінюють на <code>0</code>. Під міткою пишуть <code>free(p)</code> без жодної перевірки: стандарт гарантує, що <code>free(NULL)</code> нічого не робить. Для <code>FILE *</code> потрібна перевірка <code>if (f != NULL) fclose(f);</code>, бо <code>fclose(NULL)</code> безпечним не є.",
      "Коли захоплюється кілька різнорідних ресурсів, зручніший варіант з кількома мітками. Ресурси A, B, C беруться в такому порядку, а віддаються у <b>зворотному</b>: C, потім B, потім A. Тому мітки стоять в зворотному порядку: <code>drop_b</code>, <code>drop_a</code>, <code>out</code>. Збій на кроці B означає перейти на <code>drop_a</code> (B не захоплено, звільняти треба лише A), збій на C веде до <code>drop_b</code>. Успішний шлях просто «провалюється» крізь ті самі мітки й віддає все.",
      "Чому саме зворотний порядок? Пізніший ресурс нерідко залежить від раннього: буфер читає з файлу, блокування захищає структуру, виділену раніше. Якщо віддати A раніше за B, то B лишиться з висячою залежністю. Крім того, симетрія дає читабельність: куди б не пішла помилка, код внизу дзеркально повторює код нагорі, і подивившись на нього, одразу видно, чи не забули якийсь ресурс.",
      "Пастки. Змінні, які використовуються в cleanup, оголошуйте й ініціалізуйте <b>до</b> першого <code>goto</code>, інакше під міткою можна прочитати невизначене значення. Перестрибнути через оголошення масиву змінної довжини компілятор взагалі забороняє: помилка в четвертому прикладі. Після <code>free</code> корисно занулити вказівник, якщо він ще лишається у видимості. Статус, який треба повернути, зберігають у змінній, бо <code>return</code> стоїть уже після мітки.",
      "Перевіряти цю ідіому треба на всіх шляхах: успіх і збій на кожному кроці. Допомагає <code>LeakSanitizer</code>: вона вкаже на кожен забутий <code>free</code> після виходу програми. У GNU C є розширення <code>__attribute__((cleanup))</code>, що викликає функцію при виході зі scope, але воно нестандартне, тож у переносимому C лишається <code>goto</code>. Далі розглянемо інший механізм виходу з глибини викликів: <code>setjmp</code> і <code>longjmp</code>.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int join(const char *a, const char *b) {
    int rc = -1;
    char *copy = NULL;
    char *both = NULL;
    copy = malloc(strlen(a) + 1);
    if (copy == NULL) {
        goto cleanup;
    }
    strcpy(copy, a);
    both = malloc(strlen(a) + strlen(b) + 1);
    if (both == NULL) {
        goto cleanup;
    }
    strcpy(both, copy);
    strcat(both, b);
    printf("%s\n", both);
    rc = 0;
cleanup:
    free(both);
    free(copy);
    return rc;
}

int main(void) {
    return join("ab", "cd");
}`,
      String.raw`#include <stdio.h>

static int open_all(int fail_at) {
    int rc = -1;
    printf("A: взяти\n");
    if (fail_at == 1) {
        goto out;
    }
    printf("B: взяти\n");
    if (fail_at == 2) {
        goto drop_a;
    }
    printf("C: взяти\n");
    if (fail_at == 3) {
        goto drop_b;
    }
    printf("робота\n");
    rc = 0;
    printf("C: віддати\n");
drop_b:
    printf("B: віддати\n");
drop_a:
    printf("A: віддати\n");
out:
    return rc;
}

int main(void) {
    printf("rc=%d\n", open_all(0));
    printf("rc=%d\n", open_all(3));
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

static int roundtrip(void) {
    int rc = -1;
    FILE *f = NULL;
    char *buf = NULL;
    f = tmpfile();
    if (f == NULL) {
        goto cleanup;
    }
    buf = malloc(32);
    if (buf == NULL) {
        goto cleanup;
    }
    if (fputs("hello via tmpfile", f) == EOF) {
        goto cleanup;
    }
    rewind(f);
    if (fgets(buf, 32, f) == NULL) {
        goto cleanup;
    }
    printf("прочитано: %s\n", buf);
    rc = 0;
cleanup:
    free(buf);
    if (f != NULL) {
        fclose(f);
    }
    return rc;
}

int main(void) {
    return roundtrip();
}`,
      String.raw`// не компілюється: goto перестрибує оголошення масиву змінної довжини
#include <stdio.h>

int main(int argc, char **argv) {
    (void)argv;
    if (argc > 5) {
        goto skip;
    }
    int n = argc + 2;
    int buf[n];
    buf[0] = 1;
    printf("%d\n", buf[0]);
skip:
    return 0;
}`,
    ],
    note: "Захоплюйте ресурси в одному порядку, віддавайте у зворотному. Мітки cleanup стоять у зворотному порядку, стрибки йдуть лише вперед, а вказівники до першого <code>goto</code> ініціалізовані <code>NULL</code>.",
    work: "Драйвери, мережеві сервери й бібліотеки на C пишуть обробку збоїв саме так: одна функція, один вихід, мітки в зворотному порядку. Ядро Linux і багато проєктів із відкритим кодом зводять увесь витік пам'яті до однієї перевіреної конструкції.",
    tasks: [
      "Чому в ідіомі з кількома мітками ресурси віддають у порядку, зворотному до захоплення, і що трапиться при іншому порядку?",
      "Чому вказівники, які звільняються під міткою <code>cleanup</code>, ініціалізують <code>NULL</code> до першого <code>goto</code>?",
    ],
  },
  {
    t: "setjmp і longjmp",
    adv: true,
    ch: "Помилки",
    easy: "setjmp ставить закладку в програмі, а longjmp одним стрибком повертає виконання до цієї закладки з будь-якої глибини викликів. Це схоже на аварійний вихід, що пропускає всі проміжні поверхи будівлі.",
    p: [
      "Коли помилка виникає глибоко у ланцюжку викликів, її доводиться передавати вгору через кожну функцію. Це надійно, але громіздко: у розборі вкладеного формату на кожному рівні стоїть однакова перевірка. Бібліотека <code>&lt;setjmp.h&gt;</code> пропонує <b>нелокальний перехід</b>: <code>setjmp(env)</code> запам'ятовує стан виконання в об'єкті типу <code>jmp_buf</code>, а <code>longjmp(env, code)</code> повертає виконання до того місця, ніби <code>setjmp</code> щойно повернувся вдруге.",
      "Хитрість у тому, що <code>setjmp</code> повертається двічі. Перший раз, коли ви його викликаєте, він повертає <code>0</code>. Другий раз це відбувається після <code>longjmp</code>, і тоді повертається значення, яке передали другим аргументом. Тому типовий каркас такий: <code>if (setjmp(env) == 0) { ... звичайний шлях ... } else { ... обробка помилки ... }</code>. Якщо передати в <code>longjmp</code> нуль, <code>setjmp</code> повернув би одиницю, бо нуль зарезервовано для першого виклику.",
      "Це схоже на винятки з інших мов, але відмінності суттєві. Стрибок <b>нічого не очищає</b>: усі проміжні функції просто припиняються, пам'ять, яку вони виділили, не звільняється, файли не закриваються, і це ваша відповідальність. Звичний вихід: тримати вказівники на ресурси в місці, доступному обробнику (у статичній змінній чи в структурі контексту), й звільняти їх у гілці помилки. Саме через це в більшості програм переважають коди повернення, а <code>longjmp</code> лишають для рідкісних випадків: синтаксичні аналізатори, інтерпретатори, відновлення після фатальної помилки в бібліотеці.",
      "Правила суворі, бо порушення це невизначена поведінка. По-перше, функція, у якій викликали <code>setjmp</code>, мусить ще бути <b>активною</b>: стрибок у функцію, що вже завершилась, неможливий, її кадр у стеку не існує. По-друге, локальні змінні, які змінюються між <code>setjmp</code> і <code>longjmp</code>, після стрибка мають невизначене значення, якщо вони не <code>volatile</code>. Тож лічильник спроб, який має пережити стрибок, оголошують <code>volatile int attempts</code>. Компілятор із <code>-Wextra</code> підказує про це попередженням «might be clobbered».",
      "По-третє, виклик <code>setjmp</code> дозволений лише в простих контекстах: як окремий вираз, як умова <code>if</code> чи <code>switch</code>, у порівнянні з константою або з запереченням. Записати його у складний вираз на кшталт <code>x = f(setjmp(env))</code> не можна. Масиви змінної довжини, оголошені після <code>setjmp</code>, також створюють проблеми: стрибок їх не звільняє. Тому в функціях, що використовують ці механізми, тримайте код максимально простим.",
      "Типовий шаблон з кількома причинами: <code>int code = setjmp(env);</code>, а далі <code>if (code == 0) { робота } else switch (code) { case E_EMPTY: ... }</code>. Значення <code>code</code> передаєте у <code>longjmp</code> при виявленні конкретної помилки. Об'єкт <code>jmp_buf</code> зазвичай статичний чи глобальний, щоб його бачили глибші функції, а це означає, що вкладені «спроби» потрібно зберігати й відновлювати вручну.",
      "Підсумок: <code>setjmp</code> і <code>longjmp</code> корисні для швидкого виходу з глибокої рекурсії та для сценаріїв «спробувати ще раз», але вимагають ручного очищення. Якщо можна обійтися кодами повернення й <code>goto cleanup</code>, робіть так. Якщо ні, обмежте нелокальні переходи одним модулем і задокументуйте, що саме скидається при стрибку.",
    ],
    code: [
      String.raw`#include <setjmp.h>
#include <stdio.h>

static jmp_buf on_error;

static int parse_digit(char c) {
    if (c < '0' || c > '9') {
        longjmp(on_error, 1);
    }
    return c - '0';
}

static int parse_number(const char *s) {
    int v = 0;
    for (; *s != '\0'; s++) {
        v = v * 10 + parse_digit(*s);
    }
    return v;
}

int main(void) {
    const char *inputs[] = {"123", "4x5", "78"};
    for (int i = 0; i < 3; i++) {
        if (setjmp(on_error) == 0) {
            printf("%s -> %d\n", inputs[i], parse_number(inputs[i]));
        } else {
            printf("%s -> помилка\n", inputs[i]);
        }
    }
    return 0;
}`,
      String.raw`#include <setjmp.h>
#include <stdio.h>

enum { E_NONE, E_EMPTY, E_RANGE };

static jmp_buf env;

static void check(int n) {
    if (n == 0) {
        longjmp(env, E_EMPTY);
    }
    if (n > 100) {
        longjmp(env, E_RANGE);
    }
}

int main(void) {
    int values[] = {5, 0, 500};
    for (int i = 0; i < 3; i++) {
        int code = setjmp(env);
        if (code == 0) {
            check(values[i]);
            printf("%d: гаразд\n", values[i]);
        } else if (code == E_EMPTY) {
            printf("%d: порожнє значення\n", values[i]);
        } else {
            printf("%d: поза діапазоном\n", values[i]);
        }
    }
    return 0;
}`,
      String.raw`#include <setjmp.h>
#include <stdio.h>

static jmp_buf env;

static int flaky(int attempt) {
    if (attempt < 3) {
        longjmp(env, attempt);
    }
    return 42;
}

int main(void) {
    volatile int attempts = 0;
    if (setjmp(env) != 0) {
        printf("повтор після збою %d\n", attempts);
    }
    attempts = attempts + 1;
    int v = flaky(attempts);
    printf("результат %d після %d спроб\n", v, attempts);
    return 0;
}`,
      String.raw`#include <setjmp.h>
#include <stdio.h>
#include <stdlib.h>

static jmp_buf env;
static char *scratch = NULL;

static void work(int bad) {
    scratch = malloc(16);
    if (scratch == NULL) {
        return;
    }
    snprintf(scratch, 16, "дані");
    if (bad) {
        longjmp(env, 1);
    }
    free(scratch);
    scratch = NULL;
}

int main(void) {
    for (int bad = 0; bad < 2; bad++) {
        if (setjmp(env) == 0) {
            work(bad);
            printf("крок %d завершено\n", bad);
        } else {
            printf("збій на кроці %d, звільняємо пам'ять\n", bad);
            free(scratch);
            scratch = NULL;
        }
    }
    return 0;
}`,
      String.raw`// не компілюється: без setjmp.h тип jmp_buf невідомий
#include <stdio.h>

static jmp_buf env;

int main(void) {
    printf("не дійде\n");
    return 0;
}`,
    ],
    note: "<code>setjmp</code> повертає двічі: <code>0</code> одразу й ненульове значення після <code>longjmp</code>. Стрибок нічого не очищає, змінні після нього мають бути <code>volatile</code>, а функція із <code>setjmp</code> мусить ще бути активною.",
    work: "Нелокальні переходи використовують інтерпретатори, синтаксичні аналізатори й бібліотеки, які мають вибратися з глибокої рекурсії при фатальній помилці. Наприклад, бібліотека <code>libpng</code> саме так повідомляє про збої розбору зображень, а обробники в таких місцях пишуть дуже ретельно.",
    tasks: [
      "Чому <code>setjmp</code> називають функцією, що повертається двічі? Що саме він повертає в кожному випадку?",
      "Чому змінну, змінену після <code>setjmp</code> і прочитану після <code>longjmp</code>, оголошують <code>volatile</code>? Що станеться з пам'яттю, виділеною проміжними функціями?",
    ],
  },
  {
    t: "Стратегії обробки помилок і аварії",
    adv: true,
    ch: "Помилки",
    easy: "Не всі помилки однакові. Вхідні дані користувача можуть бути хибними, і це нормально, а порушений внутрішній інваріант це баг. Перше обробляють і живуть далі, друге ловлять і зупиняють програму якомога раніше.",
    p: [
      "Ми вже знаємо інструменти: коди повернення, <code>errno</code>, <code>assert</code>, результат-структури, <code>goto cleanup</code> і <code>longjmp</code>. Лишилося питання стратегії: що робити в кожному випадку. Перше розрізнення принципове. <b>Очікувана помилка</b> походить із зовнішнього світу: файлу немає, ввід хибний, мережа недоступна. Її обробляють. <b>Помилка програміста</b> (баг) це порушена передумова, нульовий вказівник, що не мав бути нульовим. Її не «обробляють», а виявляють і зупиняються.",
      "Для багів діє принцип <b>fail fast</b>: що раніше програма впаде на порушенні інваріанта, то ближче до причини буде повідомлення й то менше шкоди завдасть зіпсований стан. Стандартні засоби: <code>assert</code> (з файлом і рядком), <code>abort()</code> (сигнал <code>SIGABRT</code>, ненульовий код, буфери <code>stdout</code> не скидаються) і <code>exit(code)</code> (нормальне завершення: скидає буфери, викликає обробники <code>atexit</code>). Перед <code>abort</code> корисно зробити <code>fflush(stdout)</code>, інакше вже надруковане може не з'явитися.",
      "Для очікуваних помилок програма має вирішити, чого вона хоче. Варіантів кілька: <b>повідомити й припинити</b> (утиліта командного рядка: повідомлення в <code>stderr</code> і <code>return EXIT_FAILURE</code>), <b>повторити</b> (тимчасові збої, з обмеженою кількістю спроб), <b>запасний шлях</b> (взяти значення за замовчуванням, використати кеш), <b>деградація</b> (працювати з урізаними можливостями). Головне, щоб рішення ухвалював той рівень коду, який знає контекст. Нижчі рівні лише повідомляють про факт.",
      "Тому корисне правило: <b>обробляти помилку один раз і на правильному рівні</b>. Нижній рівень повертає код. Середній додає контекст («читаючи конфіг»), але не друкує нічого й передає помилку вгору. Верхній, у <code>main</code>, вирішує: надрукувати, повторити чи завершитися. Якщо кожен рівень пише повідомлення в журнал і ще й повертає помилку, у журналі з'являється п'ять рядків про одну проблему.",
      "Повідомлення мають бути корисними: що робилося, з чим і чому не вдалося. «Помилка» нічого не каже, а «не вдалося розібрати порт '80x': очікувалось число» одразу показує, де шукати. Діагностику виводять у <code>stderr</code>, окремо від результату в <code>stdout</code>: тоді ланцюжки команд не змішують дані з повідомленнями. Код завершення це частина інтерфейсу програми: <code>0</code> означає успіх, <code>EXIT_FAILURE</code> чи інші числа зі зрозумілою таблицею означають збій.",
      "Окремо про <b>ігнорування</b> помилок. Результати <code>fclose</code>, <code>fwrite</code>, <code>fflush</code> зазвичай не перевіряють, а дарма: помилка запису на повний диск виявляється саме на них, і дані мовчки втрачаються. Невеликий шматок коду, що перевіряє підсумок <code>fclose</code>, може врятувати користувача від тихої втрати даних. Якщо ви свідомо ігноруєте результат, зробіть це видимо: <code>(void)fflush(stdout);</code>.",
      "Підсумкова схема така. Баг: <code>assert</code> чи <code>abort</code>. Очікувана помилка: код або структура-результат, обробка на верхньому рівні. Ресурси: <code>goto cleanup</code>. Глибока рекурсія: за потреби <code>longjmp</code> з ручним очищенням. Завершення: <code>atexit</code> для спільного прибирання і зрозумілий код завершення. Така дисципліна, а не окремі прийоми, відрізняє програму, що поводиться передбачувано, від тієї, що ламається в несподіваних місцях.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

enum { OK, ERR_RANGE };

static int read_port(const char *text, int *out) {
    int v = atoi(text);
    if (v <= 0 || v > 65535) {
        return ERR_RANGE;
    }
    *out = v;
    return OK;
}

static int load_config(const char *text, int *port) {
    int rc = read_port(text, port);
    if (rc != OK) {
        printf("конфіг: порт '%s' поза діапазоном\n", text);
        return rc;
    }
    return OK;
}

int main(void) {
    int port = 0;
    if (load_config("8080", &port) == OK) {
        printf("порт %d\n", port);
    }
    if (load_config("99999", &port) != OK) {
        printf("використовуємо порт за замовчуванням\n");
        port = 80;
    }
    printf("порт %d\n", port);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

static void bye(void) {
    printf("прибирання перед виходом\n");
}

static void fatal(const char *why) {
    printf("фатально: %s\n", why);
    exit(0);
}

int main(void) {
    atexit(bye);
    printf("старт\n");
    fatal("тест завершення");
    printf("сюди не дійдемо\n");
    return 0;
}`,
      String.raw`// аварія: abort зупиняє програму зі збоєм, ненульовий код
#include <stdio.h>
#include <stdlib.h>

static void check_invariant(int size, int cap) {
    if (size > cap) {
        printf("інваріант порушено: size > cap\n");
        fflush(stdout);
        abort();
    }
}

int main(void) {
    check_invariant(3, 8);
    printf("перша перевірка пройшла\n");
    check_invariant(9, 8);
    printf("сюди не дійдемо\n");
    return 0;
}`,
      String.raw`#include <stdio.h>

static int attempt_count = 0;

static int fetch(void) {
    attempt_count++;
    return attempt_count >= 3 ? 0 : -1;
}

static int fetch_with_retry(int max) {
    for (int i = 1; i <= max; i++) {
        if (fetch() == 0) {
            return i;
        }
        printf("спроба %d невдала\n", i);
    }
    return -1;
}

int main(void) {
    int n = fetch_with_retry(5);
    if (n > 0) {
        printf("успіх на спробі %d\n", n);
    } else {
        printf("запасний шлях: кеш\n");
    }
    return 0;
}`,
    ],
    note: "Баги ловлять рано: <code>assert</code>, <code>abort</code>. Очікувані помилки обробляють на рівні, що знає контекст, один раз. Діагностика йде в <code>stderr</code>, а код завершення частина інтерфейсу програми.",
    work: "Так вирішують, що робити з помилкою в утиліті, сервері чи вбудованій системі: де повторити, де вжити запасного значення, а де зупинитися. Саме вибір стратегії, а не окремі виклики, визначає надійність програми.",
    tasks: [
      "Чим очікувана помилка відрізняється від помилки програміста і як їх обробляють по-різному?",
      "Чим <code>exit</code> відрізняється від <code>abort</code> щодо буферів і обробників <code>atexit</code>? Чому помилку краще обробляти один раз на відповідному рівні?",
    ],
  },
];
