// Практичні завдання глави «Помилки» (уроки 62–67). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07: readonly RemoteTask[] = [
  {
    ...base, id: "c-errno-parse", lesson: "c/62", xp: 30,
    title: "Безпечний розбір числа через strtol",
    context: "Розбір чисел із тексту є всюди: конфігурації, аргументи, протоколи. strtol не кричить про збій, а лише виставляє endptr і errno, тож без перевірки сміття чи переповнення тихо стає «правильним» числом.",
    brief: [
      "Допишіть <code>parse_int(s, &amp;out)</code>: поверніть <code>PARSE_OK</code>, <code>PARSE_EMPTY</code> (немає цифр), <code>PARSE_JUNK</code> (після числа є сміття) або <code>PARSE_RANGE</code> (<code>errno == ERANGE</code>). Перед викликом <code>strtol</code> обнуліть <code>errno</code>.",
      "Очікуваний вивід: <code>42 -> 42</code>, <code>12abc -> сміття</code>, <code>-> немає цифр</code> для порожнього рядка та <code>завелике</code> для 99999999999999999999.",
    ],
    starter: raw`#include <errno.h>
#include <stdio.h>
#include <stdlib.h>

enum { PARSE_OK, PARSE_EMPTY, PARSE_JUNK, PARSE_RANGE };

static int parse_int(const char *s, long *out) {
    *out = 0;
    return PARSE_OK;
}

static void show(const char *s) {
    long v;
    switch (parse_int(s, &v)) {
    case PARSE_OK:
        printf("%s -> %ld\n", s, v);
        break;
    case PARSE_EMPTY:
        printf("%s -> немає цифр\n", s);
        break;
    case PARSE_JUNK:
        printf("%s -> сміття\n", s);
        break;
    default:
        printf("%s -> завелике\n", s);
        break;
    }
}

int main(void) {
    show("42");
    show("-17");
    show("12abc");
    show("");
    show("99999999999999999999");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Звичайні числа", has: "-17 -> -17", hint: "Якщо endptr вказує на кінець рядка й errno нуль, запишіть значення в *out і поверніть PARSE_OK." },
      { on: "stdout", name: "Сміття після числа", has: "12abc -> сміття", hint: "Після strtol перевірте *end: якщо це не '\\0', повертайте PARSE_JUNK." },
      { on: "stdout", name: "Переповнення", has: "-> завелике", hint: "Скиньте errno = 0 перед strtol і порівняйте errno з ERANGE після виклику." },
      { on: "stdout", name: "Весь вивід", equals: "42 -> 42\n-17 -> -17\n12abc -> сміття\n -> немає цифр\n99999999999999999999 -> завелике", hint: "Порожній рядок: endptr збігається з початком, це PARSE_EMPTY, а не PARSE_OK з нулем." },
      { on: "source", name: "Обнулення errno", matches: "errno\\s*=\\s*0", hint: "Перед strtol запишіть errno = 0, інакше можна прочитати старий код." },
    ],
  },
  {
    ...base, id: "c-assert-guard", lesson: "c/63", xp: 30,
    title: "Контракт функції через assert",
    context: "assert фіксує передумови всередині модуля: баг викликача зупиняється на місці, а не псує дані десь далі. Помилки зовнішнього вводу при цьому лишаються за звичайним if, бо assert у релізі зникає.",
    brief: [
      "У <code>mean</code> додайте <code>assert</code> для <code>a != NULL</code> та <code>n &gt; 0</code> і поверніть середнє цілих. У <code>digit_value</code> поверніть значення цифри або -1, якщо символ не цифра (це помилка вводу, тому тут <code>if</code>, а не <code>assert</code>).",
      "Очікуваний вивід: <code>mean: 4</code>, <code>digit 7: 7</code>, <code>digit x: -1</code>. Не забудьте <code>#include &lt;assert.h&gt;</code>.",
    ],
    starter: raw`#include <stdio.h>

static int mean(const int *a, int n) {
    return 0;
}

static int digit_value(char c) {
    return 0;
}

int main(void) {
    int data[] = {2, 4, 6};
    printf("mean: %d\n", mean(data, 3));
    printf("digit 7: %d\n", digit_value('7'));
    printf("digit x: %d\n", digit_value('x'));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Середнє", has: "mean: 4", hint: "Складіть елементи й поділіть суму на n." },
      { on: "stdout", name: "Цифра", has: "digit 7: 7", hint: "Значення цифри це c - '0'." },
      { on: "stdout", name: "Не цифра", has: "digit x: -1", hint: "Для символу поза діапазоном '0'..'9' поверніть -1 через if." },
      { on: "source", name: "assert для n", matches: "assert\\s*\\([^;]*n\\s*>\\s*0", hint: "Додайте assert(n > 0); на початку mean." },
      { on: "source", name: "Підключено assert.h", matches: "#include\\s*<assert\\.h>", hint: "assert оголошений у заголовку assert.h." },
    ],
  },
  {
    ...base, id: "c-result-safe", lesson: "c/64", xp: 35,
    title: "Result: безпечне ділення й додавання",
    context: "Структура-результат робить помилку частиною типу: значення й причина лежать разом. Допишіть дві функції, що повертають Result, і перевіряйте переповнення до операції, а не після неї.",
    brief: [
      "У заготовці є <code>ok_value</code> і <code>fail</code>. Допишіть <code>safe_div</code> (нуль у знаменнику дає <code>ERR_DIV_ZERO</code>) і <code>checked_add</code> (якщо сума вийшла б за <code>INT_MAX</code>, поверніть <code>ERR_OVERFLOW</code>, перевіряючи <code>a &gt; INT_MAX - b</code> до додавання, b тут невід'ємне).",
      "Очікуваний вивід: <code>20 / 4 = 5</code>, <code>1 / 0: ділення на нуль</code>, <code>INT_MAX + 1: переповнення</code>, <code>2 + 3 = 5</code>.",
    ],
    starter: raw`#include <limits.h>
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
    return ok_value(0);
}

static Result checked_add(int a, int b) {
    return ok_value(0);
}

static void show(const char *label, Result r) {
    if (r.ok) {
        printf("%s = %d\n", label, r.value);
    } else if (r.err == ERR_DIV_ZERO) {
        printf("%s: ділення на нуль\n", label);
    } else {
        printf("%s: переповнення\n", label);
    }
}

int main(void) {
    show("20 / 4", safe_div(20, 4));
    show("1 / 0", safe_div(1, 0));
    show("INT_MAX + 1", checked_add(INT_MAX, 1));
    show("2 + 3", checked_add(2, 3));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Успішне ділення", has: "20 / 4 = 5", hint: "Якщо b не нуль, поверніть ok_value(a / b)." },
      { on: "stdout", name: "Ділення на нуль", has: "1 / 0: ділення на нуль", hint: "При b == 0 поверніть fail(ERR_DIV_ZERO), не виконуючи ділення." },
      { on: "stdout", name: "Переповнення", has: "INT_MAX + 1: переповнення", hint: "Перевірте a > INT_MAX - b до додавання й поверніть fail(ERR_OVERFLOW)." },
      { on: "stdout", name: "Весь вивід", equals: "20 / 4 = 5\n1 / 0: ділення на нуль\nINT_MAX + 1: переповнення\n2 + 3 = 5", hint: "Звичайна сума 2 + 3 має пройти як успіх." },
      { on: "source", name: "Перевірка до додавання", matches: "INT_MAX\\s*-\\s*b", hint: "Порівнюйте a з INT_MAX - b, а не додавайте й дивіться на результат." },
    ],
  },
  {
    ...base, id: "c-cleanup-chain", lesson: "c/65", xp: 35,
    title: "Єдина точка виходу: мітки goto",
    context: "Коли ресурсів кілька, їх віддають у порядку, зворотному до захоплення. Ідіома goto з мітками дозволяє написати очищення один раз і не забути жодного кроку при помилці.",
    brief: [
      "У <code>run</code> замініть ранні <code>return</code> на <code>goto</code>. Збій A веде на мітку <code>out</code>, збій B на <code>drop_a</code> (там віддається A), а успіх проходить обидві мітки вниз: спершу віддає B, далі A.",
      "Очікуваний вивід для <code>run(0)</code>, <code>run(1)</code>, <code>run(2)</code>: повний цикл і <code>rc=0</code>; <code>A: помилка</code> і <code>rc=-1</code>; <code>A: взяти</code>, <code>B: помилка</code>, <code>A: віддати</code>, <code>rc=-1</code>.",
    ],
    starter: raw`#include <stdio.h>

static int run(int fail_at) {
    int rc = -1;
    if (fail_at == 1) {
        printf("A: помилка\n");
        return rc;
    }
    printf("A: взяти\n");
    if (fail_at == 2) {
        printf("B: помилка\n");
        return rc;
    }
    printf("B: взяти\n");
    printf("робота\n");
    rc = 0;
    printf("B: віддати\n");
    printf("A: віддати\n");
    return rc;
}

int main(void) {
    printf("rc=%d\n", run(0));
    printf("rc=%d\n", run(1));
    printf("rc=%d\n", run(2));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Успішний шлях", has: "робота\nB: віддати\nA: віддати\nrc=0", hint: "Успіх проходить мітки drop_b-подібне віддавання B, потім drop_a: B віддається першим." },
      { on: "stdout", name: "Збій B звільняє A", has: "B: помилка\nA: віддати\nrc=-1", hint: "Після помилки B перейдіть goto drop_a, щоб віддати вже захоплений A." },
      { on: "stdout", name: "Збій A нічого не віддає", has: "A: помилка\nrc=-1", hint: "A не захоплено, тому goto out одразу веде до return." },
      { on: "source", name: "Мітка drop_a", matches: "drop_a\\s*:", hint: "Додайте мітку drop_a: перед рядком printf(\"A: віддати\\n\");" },
      { on: "source", name: "Стрибки goto", matches: "goto\\s+drop_a\\s*;[\\s\\S]*goto\\s+out\\s*;|goto\\s+out\\s*;[\\s\\S]*goto\\s+drop_a\\s*;", hint: "Використайте обидва стрибки: goto out; і goto drop_a;" },
    ],
  },
  {
    ...base, id: "c-longjmp-codes", lesson: "c/66", xp: 40,
    title: "Аварійний вихід із кодом причини",
    context: "longjmp передає код причини в місце, де стояв setjmp. Реалізуйте перевірку, що викидає різні коди, і розгалуження, яке їх розрізняє без ручної передачі помилки через кожну функцію.",
    brief: [
      "Допишіть <code>divide</code>: при <code>b == 0</code> виконайте <code>longjmp(env, 1)</code>, при <code>a &lt; 0</code> виконайте <code>longjmp(env, 2)</code>, інакше поверніть <code>a / b</code>. Решту програми не чіпайте.",
      "Очікуваний вивід: <code>10 / 2 = 5</code>, <code>7 / 0: ділення на нуль</code>, <code>-4 / 2: від'ємне</code>.",
    ],
    starter: raw`#include <setjmp.h>
#include <stdio.h>

static jmp_buf env;

static int divide(int a, int b) {
    return a / (b == 0 ? 1 : b);
}

int main(void) {
    int cases[][2] = {{10, 2}, {7, 0}, {-4, 2}};
    for (int i = 0; i < 3; i++) {
        int a = cases[i][0];
        int b = cases[i][1];
        int code = setjmp(env);
        if (code == 0) {
            printf("%d / %d = %d\n", a, b, divide(a, b));
        } else if (code == 1) {
            printf("%d / %d: ділення на нуль\n", a, b);
        } else {
            printf("%d / %d: від'ємне\n", a, b);
        }
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Звичайне ділення", has: "10 / 2 = 5", hint: "Коли помилок немає, divide просто повертає a / b." },
      { on: "stdout", name: "Нуль у знаменнику", has: "7 / 0: ділення на нуль", hint: "При b == 0 викличте longjmp(env, 1) до ділення." },
      { on: "stdout", name: "Від'ємне число", has: "-4 / 2: від'ємне", hint: "При a < 0 викличте longjmp(env, 2)." },
      { on: "stdout", name: "Весь вивід", equals: "10 / 2 = 5\n7 / 0: ділення на нуль\n-4 / 2: від'ємне", hint: "Перевіряйте b == 0 раніше за інші умови." },
      { on: "source", name: "Виклик longjmp", matches: "longjmp\\s*\\(\\s*env\\s*,\\s*2\\s*\\)", hint: "Другий аргумент longjmp це код причини, який повертає setjmp." },
    ],
  },
  {
    ...base, id: "c-retry-policy", lesson: "c/67", xp: 40,
    title: "Повтор із обмеженням і запасний шлях",
    context: "Тимчасові збої лікуються повтором, але нескінченно повторювати не можна. Реалізуйте обмежену кількість спроб і запасний варіант, який верхній рівень обирає, коли спроби вичерпано.",
    brief: [
      "Допишіть <code>retry(max)</code>: викликайте <code>flaky(i)</code> для <code>i</code> від 1 до <code>max</code> циклом, поверніть номер першої успішної спроби (<code>flaky</code> повертає 0 при успіху), а якщо вдалося жодного разу, поверніть <code>-1</code>.",
      "Очікуваний вивід: <code>успіх на спробі 3</code>, <code>вичерпано 2 спроб, запасний шлях</code>, <code>bye</code> (його друкує <code>atexit</code>).",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

static void bye(void) {
    printf("bye\n");
}

static int flaky(int attempt) {
    return attempt >= 3 ? 0 : -1;
}

static int retry(int max) {
    return -1;
}

int main(void) {
    atexit(bye);
    int n = retry(5);
    if (n > 0) {
        printf("успіх на спробі %d\n", n);
    } else {
        printf("вичерпано 5 спроб, запасний шлях\n");
    }
    n = retry(2);
    if (n > 0) {
        printf("успіх на спробі %d\n", n);
    } else {
        printf("вичерпано 2 спроб, запасний шлях\n");
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Успіх із повтором", has: "успіх на спробі 3", hint: "Цикл for (int i = 1; i <= max; i++) має викликати flaky(i) і повернути i при нулі." },
      { on: "stdout", name: "Вичерпання спроб", has: "вичерпано 2 спроб, запасний шлях", hint: "Якщо цикл завершився без успіху, поверніть -1." },
      { on: "stdout", name: "Весь вивід", equals: "успіх на спробі 3\nвичерпано 2 спроб, запасний шлях\nbye", hint: "Рядок bye виводить atexit після завершення main." },
      { on: "source", name: "Цикл повторів", matches: "for\\s*\\(|while\\s*\\(", hint: "Повторюйте виклик flaky у циклі, обмеженому max." },
    ],
  },
];
