// Практичні завдання глави «Вказівники й пам'ять» (уроки 31–44). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04: readonly RemoteTask[] = [
  {
    ...base, id: "c-pointer-basics", lesson: "c/31", xp: 25,
    title: "Вказівник між двома змінними",
    context: "Розіменування це основа всієї роботи з пам'яттю: через вказівник читають і міняють значення, не знаючи імені змінної. Перенаправлення вказівника показує, що адреса в ньому звичайне значення.",
    brief: [
      "У заготовці є змінні <code>a</code> і <code>b</code> та вказівник <code>p</code>. Спрямуйте <code>p</code> на <code>a</code> й збільште <code>a</code> на 5 лише через <code>*p</code>. Потім перенаправте <code>p</code> на <code>b</code> і подвойте <code>b</code> знову тільки через <code>*p</code>.",
      "Очікуваний вивід: <code>a=15</code>, <code>b=14</code>, <code>p вказує на b: 1</code>. Прямо присвоювати <code>a</code> чи <code>b</code> не можна, а адреси друкувати не треба.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int a = 10;
    int b = 7;
    int *p = NULL;
    printf("a=%d\n", a);
    printf("b=%d\n", b);
    printf("p вказує на b: %d\n", p == &b);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "a змінено через вказівник", has: "a=15", hint: "Спершу p = &a;, потім *p += 5;." },
      { on: "stdout", name: "b подвоєно через вказівник", has: "b=14", hint: "Перенаправте p = &b; і напишіть *p *= 2;." },
      { on: "stdout", name: "Вказівник у кінці вказує на b", has: "p вказує на b: 1", hint: "Після p = &b вираз p == &b дає 1." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "a=15\nb=14\np вказує на b: 1", hint: "Рядки: a, b, потім p вказує на b." },
      { on: "source", name: "Запис через розіменування", matches: "\\*\\s*p\\s*(\\+|\\*)=", hint: "Змінюйте значення виразом *p += … і *p *= …, а не іменем змінної." },
      { on: "source", name: "Вказівник перенаправлено на b", matches: "\\bp\\s*=\\s*&\\s*b", hint: "p = &b; це присвоєння адреси, а не порівняння ==." },
    ],
  },
  {
    ...base, id: "c-out-params", lesson: "c/32", xp: 25,
    title: "Мінімум і максимум через вихідні параметри",
    context: "Функція повертає одне значення, але результатів часто кілька. Вихідні параметри дають змогу віддати два числа за один прохід і змінити змінні викликача, як це роблять sscanf і strtol.",
    brief: [
      "Допишіть <code>minmax</code>: за один обхід масиву запишіть найменший елемент у <code>*lo</code>, найбільший у <code>*hi</code>. Допишіть <code>swap</code>, що міняє значення двох змінних через вказівники.",
      "Очікуваний вивід: <code>min=2 max=9</code>, потім <code>після swap: 9 2</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

void minmax(const int a[], size_t n, int *lo, int *hi) {
}

void swap(int *x, int *y) {
}

int main(void) {
    int data[] = {4, 9, 2, 7};
    size_t n = sizeof data / sizeof data[0];
    int lo = 0;
    int hi = 0;
    minmax(data, n, &lo, &hi);
    printf("min=%d max=%d\n", lo, hi);
    swap(&lo, &hi);
    printf("після swap: %d %d\n", lo, hi);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Мінімум і максимум знайдено", has: "min=2 max=9", hint: "Почніть із *lo = *hi = a[0] і оновлюйте в циклі." },
      { on: "stdout", name: "Значення обміняно", has: "після swap: 9 2", hint: "Тимчасова змінна: int t = *x; *x = *y; *y = t;" },
      { on: "stdout", name: "Обидва рядки без зайвого", equals: "min=2 max=9\nпісля swap: 9 2", hint: "main змінювати не потрібно." },
      { on: "source", name: "Запис у вихідний параметр", matches: "\\*\\s*lo\\s*=", hint: "У minmax пишіть *lo = …, а не lo = …." },
      { on: "source", name: "Обмін через розіменування", matches: "\\*\\s*x\\s*=\\s*\\*\\s*y", hint: "Усередині swap: *x = *y;" },
    ],
  },
  {
    ...base, id: "c-ptr-walk", lesson: "c/33", xp: 30,
    title: "Пошук і реверс вказівниками",
    context: "Пошук елемента й розворот буфера на місці це типові задачі для двох вказівників. Різниця вказівників дає індекс, а NULL чесно каже, що нічого не знайдено.",
    brief: [
      "Допишіть <code>find_first</code>: вона повертає вказівник на перше входження <code>x</code> або <code>NULL</code>. Обходьте масив вказівником, без індексів. Допишіть <code>reverse</code>: вона отримує вказівники <code>lo</code> і <code>hi</code> на перший та останній елементи й розвертає діапазон, зсуваючи їх назустріч.",
      "Очікуваний вивід: <code>15 на позиції 2</code>, <code>9 відсутнє</code>, <code>реверс: 42 23 16 15 8 4</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>

int *find_first(int *a, size_t n, int x) {
    return NULL;
}

void reverse(int *lo, int *hi) {
}

int main(void) {
    int a[] = {4, 8, 15, 16, 23, 42};
    size_t n = sizeof a / sizeof a[0];
    int *hit = find_first(a, n, 15);
    if (hit != NULL) {
        printf("15 на позиції %td\n", hit - a);
    } else {
        printf("15 не знайдено\n");
    }
    printf("9 %s\n", find_first(a, n, 9) == NULL ? "відсутнє" : "є");
    reverse(a, a + n - 1);
    printf("реверс:");
    for (int *p = a; p != a + n; p++) {
        printf(" %d", *p);
    }
    printf("\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Знайдено позицію 2", has: "15 на позиції 2", hint: "Поверніть p, якщо *p == x. Індекс main отримає як hit - a." },
      { on: "stdout", name: "Відсутній елемент дає NULL", has: "9 відсутнє", hint: "Після циклу поверніть NULL." },
      { on: "stdout", name: "Масив розвернуто", has: "реверс: 42 23 16 15 8 4", hint: "Поки lo < hi: обміняйте *lo і *hi, потім lo++ і hi--." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "15 на позиції 2\n9 відсутнє\nреверс: 42 23 16 15 8 4", hint: "main змінювати не потрібно." },
      { on: "source", name: "Реверс двома вказівниками назустріч", matches: "lo\\s*<\\s*hi", hint: "Умова циклу: while (lo < hi)." },
    ],
  },
  {
    ...base, id: "c-const-ptr", lesson: "c/34", xp: 25,
    title: "Читаємо через const, пишемо через char *",
    context: "Контракт «лише читаю» у параметрі дає змогу передавати літерали й масиви однаково безпечно, а компілятор стереже обіцянку. Функція, що змінює рядок, навпаки, має брати змінюваний буфер.",
    brief: [
      "Допишіть <code>count_vowels</code>: вона рахує голосні латинські літери (a e i o u, будь-якого регістру) в рядку й лише читає його, тож параметр має бути <code>const char *</code>. Допишіть <code>to_upper</code>: вона перетворює рядок на великі літери на місці.",
      "Очікуваний вивід: <code>Голосних у Programming: 3</code>, <code>Голосних у const in C: 2</code>, <code>Після: PROGRAMMING</code>. Змінюйте лише сигнатуру й тіла функцій.",
    ],
    starter: raw`#include <ctype.h>
#include <stdio.h>
#include <string.h>

int count_vowels(char *s) {
    return 0;
}

void to_upper(char *s) {
}

int main(void) {
    char word[] = "Programming";
    const char *title = "const in C";
    printf("Голосних у %s: %d\n", word, count_vowels(word));
    printf("Голосних у %s: %d\n", title, count_vowels(title));
    to_upper(word);
    printf("Після: %s\n", word);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Голосні в Programming", has: "Голосних у Programming: 3", hint: "Для кожного символу перевірте, чи він є в рядку aeiouAEIOU (strchr)." },
      { on: "stdout", name: "Голосні в літералі", has: "Голосних у const in C: 2", hint: "Той самий підрахунок працює й для const char *." },
      { on: "stdout", name: "Рядок у верхньому регістрі", has: "Після: PROGRAMMING", hint: "У циклі до '\\0' пишіть *s = toupper((unsigned char)*s)." },
      { on: "source", name: "Читальний параметр позначено const", matches: "count_vowels\\s*\\(\\s*const\\s+char\\s*\\*", hint: "Змініть сигнатуру на int count_vowels(const char *s)." },
    ],
  },
  {
    ...base, id: "c-malloc-repeat", lesson: "c/35", xp: 30,
    title: "Повторення рядка на купі",
    context: "Функції, що збирають рядок невідомої заздалегідь довжини, виділяють для нього пам'ять самі й віддають її викликачеві. Вміння порахувати розмір, перевірити malloc і звільнити блок потрібне в кожному C-проєкті.",
    brief: [
      "Допишіть <code>repeat(s, times)</code>: вона виділяє <code>malloc</code>-блок потрібного розміру (з байтом під <code>'\\0'</code>), записує в нього рядок <code>s</code> підряд <code>times</code> разів і повертає блок. Якщо <code>malloc</code> не вдався, поверніть <code>NULL</code>.",
      "Очікуваний вивід: <code>ababab (6)</code> і <code>----- (5)</code>. Блоки звільняє <code>main</code>, його змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *repeat(const char *s, int times) {
    return NULL;
}

int main(void) {
    char *a = repeat("ab", 3);
    char *b = repeat("-", 5);
    if (a == NULL || b == NULL) {
        printf("пам'яті немає\n");
        free(a);
        free(b);
        return 0;
    }
    printf("%s (%zu)\n", a, strlen(a));
    printf("%s (%zu)\n", b, strlen(b));
    free(a);
    free(b);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок ab повторено тричі", has: "ababab (6)", hint: "Розмір блока: strlen(s) * times + 1. Копіюйте s на позицію i * len." },
      { on: "stdout", name: "Рядок із дефісів", has: "----- (5)", hint: "Не забудьте записати '\\0' в кінець результату." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "ababab (6)\n----- (5)", hint: "Функція main вже друкує обидва рядки." },
      { on: "source", name: "Пам'ять виділено через malloc", matches: "\\bmalloc\\s*\\(", hint: "char *out = malloc(len * times + 1);" },
      { on: "source", name: "Результат malloc перевіряється", matches: "==\\s*NULL", hint: "Якщо out == NULL, поверніть NULL." },
    ],
  },
  {
    ...base, id: "c-vec-push", lesson: "c/36", xp: 35,
    title: "Вектор, що росте через realloc",
    context: "Масив, який збільшується під час роботи, лежить в основі буферів і списків. Безпечний realloc через тимчасовий вказівник і подвоєння ємності відрізняють робочий код від того, що витікає й падає.",
    brief: [
      "Допишіть <code>vec_push</code>: якщо <code>len == cap</code>, збільшіть ємність (почніть з 2, далі подвоюйте) через <code>realloc</code> з тимчасовим вказівником, потім запишіть елемент. Поверніть 1 при успіху й 0, якщо пам'яті не вистачило.",
      "Очікуваний вивід після додавання чисел від 1 до 10: <code>len=10 cap=16</code> і <code>sum=55</code>. Присвоювати <code>v->data = realloc(v->data, …)</code> напряму не можна.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
} Vec;

int vec_push(Vec *v, int x) {
    return 1;
}

int main(void) {
    Vec v = {NULL, 0, 0};
    for (int i = 1; i <= 10; i++) {
        if (!vec_push(&v, i)) {
            printf("пам'яті немає\n");
            free(v.data);
            return 1;
        }
    }
    long sum = 0;
    for (size_t i = 0; i < v.len; i++) {
        sum += v.data[i];
    }
    printf("len=%zu cap=%zu\n", v.len, v.cap);
    printf("sum=%ld\n", sum);
    free(v.data);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Довжина й ємність", has: "len=10 cap=16", hint: "Ємність: 2, 4, 8, 16. Збільшуйте, коли len == cap." },
      { on: "stdout", name: "Сума збережених чисел", has: "sum=55", hint: "Після перенесення блока дані мають зберегтися: пишіть v->data[v->len++] = x." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "len=10 cap=16\nsum=55", hint: "main змінювати не потрібно." },
      { on: "source", name: "Використано realloc", matches: "\\brealloc\\s*\\(", hint: "int *tmp = realloc(v->data, cap * sizeof *tmp);" },
      { on: "source", name: "Немає присвоєння realloc просто у вказівник даних", matches: "data\\s*=\\s*realloc", not: true, hint: "Спершу tmp = realloc(...), перевірка tmp == NULL, потім v->data = tmp." },
    ],
  },
  {
    ...base, id: "c-join-words", lesson: "c/37", xp: 35,
    title: "Склеїти масив рядків через роздільник",
    context: "Масив рядків char ** це argv, список слів і набір заголовків. Склеювання їх в один рядок вимагає порахувати довжину, виділити блок і не забути байт під нуль: рівно те, що роблять реальні утиліти.",
    brief: [
      "Допишіть <code>join(words, n, sep)</code>: вона складає в одному <code>malloc</code>-блоці всі слова масиву через символ <code>sep</code> і повертає рядок, який звільнить викликач. Для <code>n == 0</code> поверніть порожній рядок. Якщо <code>malloc</code> не вдався, поверніть <code>NULL</code>.",
      "Очікуваний вивід: <code>[ala_ma_kota]</code> і <code>[]</code>. Функцію <code>main</code> змінювати не треба.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *join(const char **words, size_t n, char sep) {
    return NULL;
}

int main(void) {
    const char *words[] = {"ala", "ma", "kota"};
    char *a = join(words, 3, '_');
    char *b = join(words, 0, '_');
    if (a == NULL || b == NULL) {
        printf("пам'яті немає\n");
        free(a);
        free(b);
        return 0;
    }
    printf("[%s]\n", a);
    printf("[%s]\n", b);
    free(a);
    free(b);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Слова склеєно", has: "[ala_ma_kota]", hint: "Довжина: сума strlen слів плюс n - 1 роздільників плюс 1 байт під '\\0'." },
      { on: "stdout", name: "Порожній масив дає порожній рядок", has: "[]", hint: "Для n == 0 виділіть 1 байт і запишіть у нього '\\0'." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "[ala_ma_kota]\n[]", hint: "main вже друкує обидва результати." },
      { on: "source", name: "Пам'ять виділено через malloc", matches: "\\bmalloc\\s*\\(", hint: "char *out = malloc(total + 1);" },
      { on: "source", name: "Довжину слів знайдено через strlen", matches: "\\bstrlen\\s*\\(", hint: "Для кожного words[i] додайте strlen(words[i])." },
    ],
  },
  {
    ...base, id: "c-safe-release", lesson: "c/38", xp: 30,
    title: "release: звільнити й обнулити",
    context: "Обнулення вказівника після free перетворює подвійне звільнення й висячий вказівник на безпечну дію або чесну аварію. Таку функцію пишуть у багатьох проєктах, щоб не забувати цього кроку.",
    brief: [
      "Допишіть <code>release(char **pp)</code>: вона звільняє блок, на який вказує <code>*pp</code>, і записує в <code>*pp</code> значення <code>NULL</code>. Повторний виклик на вже обнуленому вказівнику має бути безпечним.",
      "Очікуваний вивід: <code>ім'я: Ada</code>, <code>після release: NULL</code> і <code>повторний release безпечний</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *make_name(const char *s) {
    char *out = malloc(strlen(s) + 1);
    if (out != NULL) {
        strcpy(out, s);
    }
    return out;
}

void release(char **pp) {
}

int main(void) {
    char *name = make_name("Ada");
    if (name == NULL) {
        return 1;
    }
    printf("ім'я: %s\n", name);
    release(&name);
    printf("після release: %s\n", name == NULL ? "NULL" : "не NULL");
    release(&name);
    printf("повторний release безпечний\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вказівник обнулено", has: "після release: NULL", hint: "Після free(*pp) запишіть *pp = NULL;." },
      { on: "stdout", name: "Ім'я надруковано до звільнення", has: "ім'я: Ada", hint: "Вивід робить main, змінювати його не треба." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "ім'я: Ada\nпісля release: NULL\nповторний release безпечний", hint: "Три рядки: ім'я, після release, повторний." },
      { on: "source", name: "Блок звільнено через вказівник на вказівник", matches: "free\\s*\\(\\s*\\*\\s*pp\\s*\\)", hint: "free(*pp); звільняє те, на що вказує *pp." },
      { on: "source", name: "Вказівник обнулено", matches: "\\*\\s*pp\\s*=\\s*NULL", hint: "*pp = NULL; змінює змінну викликача." },
    ],
  },
  {
    ...base, id: "c-static-ticket", lesson: "c/39", xp: 30,
    title: "Квитки: статичний лічильник і текст на купі",
    context: "Лічильник, що пам'ятає значення між викликами, живе в статичній пам'яті, а текст, який має пережити функцію, виділяють на купі. Вибір місця зберігання за часом життя це щоденне рішення C-програміста.",
    brief: [
      "Допишіть <code>next_ticket</code>: вона має повертати 1, 2, 3 при послідовних викликах, тож лічильник зберігайте в <code>static</code>-змінній. Допишіть <code>ticket_text</code>: вона виділяє <code>malloc</code>-блок, записує в нього текст на кшталт <code>T-007</code> через <code>snprintf</code> (формат <code>T-%03d</code>) і повертає його.",
      "Очікуваний вивід: три рядки <code>T-001</code>, <code>T-002</code>, <code>T-003</code>. Блоки звільняє <code>main</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>

int next_ticket(void) {
    int n = 0;
    n++;
    return n;
}

char *ticket_text(int n) {
    return NULL;
}

int main(void) {
    for (int i = 0; i < 3; i++) {
        char *t = ticket_text(next_ticket());
        if (t == NULL) {
            printf("немає тексту\n");
            continue;
        }
        printf("%s\n", t);
        free(t);
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Перший квиток", has: "T-001", hint: "snprintf(s, 16, \"T-%03d\", n) дає нулі зліва." },
      { on: "stdout", name: "Третій квиток: лічильник пам'ятає значення", has: "T-003", hint: "Локальна змінна щоразу починає з нуля. Потрібна static int n = 0;" },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "T-001\nT-002\nT-003", hint: "Три рядки, по одному на виклик." },
      { on: "source", name: "Лічильник статичний", matches: "\\bstatic\\s+int\\b", hint: "static int n = 0; усередині next_ticket." },
      { on: "source", name: "Текст виділено на купі", matches: "\\bmalloc\\s*\\(", hint: "char *s = malloc(16); не забудьте перевірити NULL." },
    ],
  },
  {
    ...base, id: "c-qsort-people", lesson: "c/40", xp: 40,
    title: "Сортування людей через qsort",
    context: "qsort не знає типу елементів, тому правило порядку передають їй як функцію. Порівнювач із двома ключами робить сортування передбачуваним навіть тоді, коли значення першого ключа повторюються.",
    brief: [
      "Допишіть порівнювач <code>cmp_person</code>: спершу за віком від найстаршого до наймолодшого, а при однаковому віці за іменем за алфавітом (<code>strcmp</code>). Не віднімайте числа: використайте порівняння.",
      "Очікуваний вивід: <code>Bohdan 31</code>, <code>Eva 31</code>, <code>Anna 25</code>, <code>Olya 25</code>, <code>Dmytro 19</code>, кожен у своєму рядку. Виклик <code>qsort</code> уже в <code>main</code>.",
    ],
    starter: raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    const char *name;
    int age;
} Person;

int cmp_person(const void *a, const void *b) {
    return 0;
}

int main(void) {
    Person people[] = {{"Olya", 25}, {"Bohdan", 31}, {"Anna", 25}, {"Dmytro", 19}, {"Eva", 31}};
    size_t n = sizeof people / sizeof people[0];
    qsort(people, n, sizeof people[0], cmp_person);
    for (size_t i = 0; i < n; i++) {
        printf("%s %d\n", people[i].name, people[i].age);
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Найстарші першими, за алфавітом", has: "Bohdan 31\nEva 31", hint: "Якщо вік різний, поверніть порівняння за віком у зворотному напрямку." },
      { on: "stdout", name: "Однаковий вік: за іменем", has: "Anna 25\nOlya 25", hint: "Коли вік однаковий, поверніть strcmp(x->name, y->name)." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "Bohdan 31\nEva 31\nAnna 25\nOlya 25\nDmytro 19", hint: "П'ять рядків: від найстаршого до наймолодшого." },
      { on: "source", name: "Імена порівнюються через strcmp", matches: "\\bstrcmp\\s*\\(", hint: "strcmp повертає від'ємне, нуль або додатне, як потрібно порівнювачу." },
      { on: "source", name: "Немає віднімання віку", matches: "age\\s*-\\s*[\\w>.()-]*age", not: true, hint: "Замість x->age - y->age напишіть (x->age < y->age) - (x->age > y->age)." },
    ],
  },
  {
    ...base, id: "c-generic-swap", lesson: "c/41", xp: 40,
    title: "Універсальний swap за розміром",
    context: "Одна функція, що міняє місцями значення будь-якого типу, потребує лише адрес і розміру елемента. Це основа qsort, memcpy і всіх узагальнених контейнерів у C.",
    brief: [
      "Допишіть <code>swap_any(void *a, void *b, size_t size)</code>: вона має міняти місцями <code>size</code> байтів двох об'єктів, не знаючи їхнього типу. Виклики в <code>main</code> уже є. Усередині працюйте через <code>unsigned char *</code>.",
      "Очікуваний вивід: <code>7 3</code>, <code>2.50 1.25</code>, <code>Olya Anna</code>, кожен у своєму рядку. Не пишіть окремих функцій для кожного типу.",
    ],
    starter: raw`#include <stdio.h>
#include <stddef.h>

void swap_any(void *a, void *b, size_t size) {
    (void)a;
    (void)b;
    (void)size;
}

int main(void) {
    int x = 3, y = 7;
    double p = 1.25, q = 2.5;
    const char *s = "Anna", *t = "Olya";
    swap_any(&x, &y, sizeof x);
    swap_any(&p, &q, sizeof p);
    swap_any(&s, &t, sizeof s);
    printf("%d %d\n", x, y);
    printf("%.2f %.2f\n", p, q);
    printf("%s %s\n", s, t);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "int міняються місцями", has: "7 3", hint: "Цикл по size байтах: тимчасова змінна, x[i] = y[i], y[i] = тимчасова." },
      { on: "stdout", name: "double міняються місцями", has: "2.50 1.25", hint: "Та сама функція, інший sizeof: розмір передає викликач." },
      { on: "stdout", name: "Вказівники на рядки міняються", has: "Olya Anna", hint: "Передаємо адреси самих вказівників &s і &t, розмір sizeof s." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "7 3\n2.50 1.25\nOlya Anna", hint: "Три рядки в такому порядку." },
      { on: "source", name: "Робота через unsigned char *", matches: "unsigned\\s+char\\s*\\*", hint: "unsigned char *x = a; unsigned char *y = b;" },
    ],
  },
  {
    ...base, id: "c-memmove-shift", lesson: "c/42", xp: 40,
    title: "Вставка й видалення через memmove",
    context: "Зсув елементів усередині одного масиву це накладання областей, де memcpy не гарантує нічого. Тому вставка й видалення в масиві будуються на memmove.",
    brief: [
      "Допишіть <code>insert_at</code> і <code>remove_at</code> для масиву <code>int</code>. Вставка зсуває хвіст праворуч, видалення ліворуч, обидві через <code>memmove</code> (кількість байтів це число елементів помножене на <code>sizeof</code>). Не використовуйте <code>memcpy</code>.",
      "Очікуваний вивід: <code>1 2 99 3 4 5</code> після вставки на позицію 2 й <code>1 2 3 4 5</code> після видалення тієї самої позиції.",
    ],
    starter: raw`#include <stdio.h>
#include <string.h>

size_t insert_at(int *a, size_t len, size_t pos, int value) {
    (void)a;
    (void)pos;
    (void)value;
    return len;
}

size_t remove_at(int *a, size_t len, size_t pos) {
    (void)a;
    (void)pos;
    return len;
}

void show(const int *a, size_t len) {
    for (size_t i = 0; i < len; i++) {
        printf("%d%c", a[i], i + 1 < len ? ' ' : '\n');
    }
}

int main(void) {
    int a[8] = {1, 2, 3, 4, 5};
    size_t len = 5;
    len = insert_at(a, len, 2, 99);
    show(a, len);
    len = remove_at(a, len, 2);
    show(a, len);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вставка зсуває хвіст праворуч", has: "1 2 99 3 4 5", hint: "memmove(a + pos + 1, a + pos, (len - pos) * sizeof a[0]); потім a[pos] = value; повернути len + 1." },
      { on: "stdout", name: "Видалення зсуває хвіст ліворуч", has: "1 2 3 4 5", hint: "memmove(a + pos, a + pos + 1, (len - pos - 1) * sizeof a[0]); повернути len - 1." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "1 2 99 3 4 5\n1 2 3 4 5", hint: "Два рядки: після вставки й після видалення." },
      { on: "source", name: "Є memmove", matches: "\\bmemmove\\s*\\(", hint: "Для накладання областей потрібен memmove." },
      { on: "source", name: "Немає memcpy", matches: "\\bmemcpy\\s*\\(", not: true, hint: "memcpy на перетині областей дає невизначену поведінку." },
    ],
  },
  {
    ...base, id: "c-struct-reorder", lesson: "c/43", xp: 45,
    title: "Порядок полів і падінг",
    context: "Та сама структура може займати різний обсяг залежно від порядку полів. Впорядкування за спаданням вирівнювання прибирає зайвий падінг, а static_assert фіксує припущення про платформу.",
    brief: [
      "Структура <code>Record</code> містить ті самі поля, що й <code>RecordLoose</code>, але в порядку, що марнує місце. Переставте поля в <code>Record</code> від найбільшого вирівнювання до найменшого: <code>double value</code>, <code>short id</code>, <code>char flag</code>, <code>char tag</code>. Інші рядки не змінюйте.",
      "Очікуваний вивід: <code>Record менший: 1</code>, <code>value на початку: 1</code>, <code>розмір кратний вирівнюванню: 1</code>. Конкретні числа не друкуємо: вони залежать від платформи.",
    ],
    starter: raw`#include <stdio.h>
#include <stddef.h>
#include <assert.h>

typedef struct {
    char flag;
    double value;
    short id;
    char tag;
} RecordLoose;

typedef struct {
    char flag;
    double value;
    short id;
    char tag;
} Record;

static_assert(_Alignof(double) == 8 && sizeof(short) == 2, "очікуємо типову платформу");

int main(void) {
    printf("Record менший: %d\n", sizeof(Record) < sizeof(RecordLoose));
    printf("value на початку: %d\n", offsetof(Record, value) == 0);
    printf("розмір кратний вирівнюванню: %d\n", sizeof(Record) % _Alignof(Record) == 0);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Record став меншим", has: "Record менший: 1", hint: "Поставте double першим, далі short, потім обидва char." },
      { on: "stdout", name: "double на початку структури", has: "value на початку: 1", hint: "Поле value має бути першим у Record." },
      { on: "stdout", name: "Весь вивід без зайвого", equals: "Record менший: 1\nvalue на початку: 1\nрозмір кратний вирівнюванню: 1", hint: "Три рядки; сам RecordLoose не змінюйте." },
      { on: "source", name: "Є static_assert", matches: "\\bstatic_assert\\s*\\(", hint: "Припущення про платформу фіксує static_assert, залиште його." },
    ],
  },
  {
    ...base, id: "c-debug-log", lesson: "c/44", xp: 40,
    title: "Відладковий друк у stderr",
    context: "Відладковий друк не має псувати результат програми, тому його пишуть у stderr, а вмикають і вимикають макросом. assert додатково ловить порушені припущення.",
    brief: [
      "Макрос <code>LOG</code> зараз друкує у <code>stdout</code> і засмічує результат. Перепишіть його: <code>do { if (DEBUG) fprintf(stderr, __VA_ARGS__); } while (0)</code>. У <code>sum_to</code> додайте <code>assert(n &gt;= 0);</code> (заголовок <code>assert.h</code> підключіть).",
      "Очікуваний вивід у <code>stdout</code> лише два рядки: <code>sum=15</code> та <code>sum=0</code>. Рядки з <code>LOG</code> мають іти в <code>stderr</code>.",
    ],
    starter: raw`#include <stdio.h>

#ifndef DEBUG
#define DEBUG 1
#endif

#define LOG(...) printf(__VA_ARGS__)

int sum_to(int n) {
    int s = 0;
    for (int i = 1; i <= n; i++) {
        s += i;
        LOG("i=%d s=%d\n", i, s);
    }
    return s;
}

int main(void) {
    printf("sum=%d\n", sum_to(5));
    printf("sum=%d\n", sum_to(0));
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Результат у stdout", has: "sum=15", hint: "Після виправлення LOG у stdout лишаються тільки рядки з sum=." },
      { on: "stdout", name: "Налагоджувальний друк не в stdout", equals: "sum=15\nsum=0", hint: "Замініть printf у макросі на fprintf(stderr, ...)." },
      { on: "source", name: "Друк у stderr", matches: "fprintf\\s*\\(\\s*stderr", hint: "fprintf(stderr, __VA_ARGS__);" },
      { on: "source", name: "Є assert", matches: "\\bassert\\s*\\(", hint: "assert(n >= 0); на початку sum_to, і #include &lt;assert.h&gt;." },
      { on: "source", name: "Макрос загорнуто у do-while", matches: "do\\s*\\{[\\s\\S]*\\}\\s*while\\s*\\(\\s*0\\s*\\)", hint: "do { ... } while (0), щоб макрос поводився як один оператор." },
    ],
  },
];
