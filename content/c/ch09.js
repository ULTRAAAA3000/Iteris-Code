export const LESSONS_09 = [
  {
    t: "Динамічний масив: vector на C",
    ch: "Структури даних",
    easy: "Динамічний масив схожий на валізу, якій стає тісно: ви берете більшу, переносите всі речі одним рухом і відразу залишаєте запас місця. Так переїздів мало, і кожна нова річ майже завжди лягає без зусиль.",
    p: [
      "Масив C має фіксований розмір, а реальні дані рідко повідомляють, скільки їх буде: рядки файлу, слова тексту, результати пошуку. У C++ для цього є <code>std::vector</code>, у Python список, а в C його немає, і ми пишемо його самі. Уся глава працює так: <code>struct</code>, <code>malloc</code>, <code>free</code> і набір функцій із префіксом типу (<code>vec_create</code>, <code>vec_push</code>, <code>vec_pop</code>, <code>vec_destroy</code>), що ховають деталі від викликача.",
      "Модель у голові проста: три поля. <code>data</code> вказує на блок у купі, <code>cap</code> (місткість) скільки елементів у блок влізе, <code>len</code> скільки з них зайнято. Завжди <code>len &lt;= cap</code>. Сама структура теж живе на купі, якщо її створює <code>vec_create</code>, тому блоків два і <code>free</code> потрібно два: спершу <code>data</code>, потім структуру. Зворотний порядок втратив би вказівник на <code>data</code> ще до звільнення.",
      "Власник пам'яті чітко один: хто викликав <code>vec_create</code>, той викликає <code>vec_destroy</code>. Контейнер володіє масивом <code>data</code>, а викликач структурою. Для <code>int</code> усе просто: <code>vec_push</code> копіює значення в блок, і ніхто більше не володіє цим числом. Для елементів-вказівників власність довелося б обговорювати окремо, і ми повернемося до цього в хеш-таблиці.",
      "Росте масив через <code>realloc</code>: він пробує розширити блок на місці, а якщо не виходить, виділяє новий, копіює вміст і звільняє старий. Скільки виділяти? Якщо додавати по одному місцю, кожен <code>push</code> потенційно копіює весь масив, і n вставок коштують близько n²/2 копій. Якщо подвоювати місткість, копіювання відбувається рідко: сума 4+8+16+…+512 менша за 2n. Тому один <code>push</code> у гіршому випадку O(n), а в середньому по серії O(1): це називають <b>амортизованою</b> складністю. Приклад 2 вимірює це лічильником копій.",
      "Є ідіома, без якої <code>realloc</code> небезпечний: <code>int *p = realloc(v-&gt;data, bytes); if (p == NULL) { … } v-&gt;data = p;</code>. Запис <code>v-&gt;data = realloc(v-&gt;data, …)</code> при невдачі кладе в <code>data</code> значення <code>NULL</code> і губить старий блок: це витік, який бачить LeakSanitizer. Ще одна пастка: після <code>realloc</code> блок міг переїхати, тож усі раніше взяті адреси елементів (<code>&amp;v-&gt;data[i]</code>) стають недійсними. Зберігайте індекс, а не адресу.",
      "Доступ за індексом перевіряйте. Вихід за <code>len</code> це читання чи запис за межею виділеного, тобто невизначена поведінка, яка може мовчки зіпсувати сусідні дані. У <code>vec_get</code> ставте <code>assert(i &lt; v-&gt;len)</code>: у навчальній збірці він гарантовано зупинить програму з зрозумілим повідомленням. Індекси й довжини тримайте в <code>size_t</code> і друкуйте через <code>%zu</code>. <code>vec_pop</code> лише зменшує <code>len</code>: місткість лишається, і наступний <code>push</code> не потребує нової пам'яті.",
      "Щоб довести відсутність витоків, збирайте з <code>-fsanitize=address</code>: на виході програма сама повідомить про блок, який не звільнили. Правило: кожному <code>malloc</code> відповідає <code>free</code> на всіх шляхах виходу. Наступний урок прибирає копіювання зовсім: зв'язний список не перевиділяє пам'ять, натомість платить за довільний доступ.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
} IntVec;

IntVec *vec_create(void) {
    IntVec *v = malloc(sizeof *v);
    if (v == NULL) {
        return NULL;
    }
    v->data = NULL;
    v->len = 0;
    v->cap = 0;
    return v;
}

int vec_push(IntVec *v, int x) {
    if (v->len == v->cap) {
        size_t ncap = v->cap == 0 ? 4 : v->cap * 2;
        int *p = realloc(v->data, ncap * sizeof *p);
        if (p == NULL) {
            return -1;
        }
        v->data = p;
        v->cap = ncap;
    }
    v->data[v->len++] = x;
    return 0;
}

int vec_pop(IntVec *v, int *out) {
    if (v->len == 0) {
        return -1;
    }
    *out = v->data[--v->len];
    return 0;
}

void vec_destroy(IntVec *v) {
    if (v != NULL) {
        free(v->data);
        free(v);
    }
}

int main(void) {
    IntVec *v = vec_create();
    if (v == NULL) {
        return 1;
    }
    for (int i = 1; i <= 10; i++) {
        vec_push(v, i * i);
    }
    printf("len=%zu cap=%zu\n", v->len, v->cap);
    int last = 0;
    vec_pop(v, &last);
    printf("pop=%d len=%zu\n", last, v->len);
    for (size_t i = 0; i < v->len; i++) {
        printf("%d ", v->data[i]);
    }
    printf("\n");
    vec_destroy(v);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
    size_t copies;
    size_t grows;
    int doubling;
} IntVec;

static void vec_push(IntVec *v, int x) {
    if (v->len == v->cap) {
        size_t ncap = v->cap + 1;
        if (v->doubling) {
            ncap = v->cap == 0 ? 4 : v->cap * 2;
        }
        int *p = realloc(v->data, ncap * sizeof *p);
        if (p == NULL) {
            abort();
        }
        v->data = p;
        v->cap = ncap;
        v->copies += v->len;
        v->grows++;
    }
    v->data[v->len++] = x;
}

int main(void) {
    for (int policy = 0; policy < 2; policy++) {
        IntVec v = {NULL, 0, 0, 0, 0, policy};
        for (int i = 0; i < 1000; i++) {
            vec_push(&v, i);
        }
        printf("%s: перевиділень=%zu копій=%zu\n",
               policy ? "подвоєння" : "по одному", v.grows, v.copies);
        free(v.data);
    }
    return 0;
}
`,
      String.raw`// аварія: assert у vec_get зупиняє програму на виході за len, а не віддає сміття з пам'яті
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
} IntVec;

static void vec_push(IntVec *v, int x) {
    if (v->len == v->cap) {
        size_t ncap = v->cap == 0 ? 4 : v->cap * 2;
        int *p = realloc(v->data, ncap * sizeof *p);
        if (p == NULL) {
            abort();
        }
        v->data = p;
        v->cap = ncap;
    }
    v->data[v->len++] = x;
}

static int vec_get(const IntVec *v, size_t i) {
    assert(i < v->len);
    return v->data[i];
}

int main(void) {
    IntVec v = {NULL, 0, 0};
    vec_push(&v, 10);
    vec_push(&v, 20);
    vec_push(&v, 30);
    printf("v[2]=%d\n", vec_get(&v, 2));
    printf("v[3]=%d\n", vec_get(&v, 3));
    free(v.data);
    return 0;
}
`,
      String.raw`// не компілюється: v це вказівник, поле береться через ->, а не через крапку
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
} IntVec;

int main(void) {
    IntVec *v = malloc(sizeof *v);
    if (v == NULL) {
        return 1;
    }
    v->data = NULL;
    v->len = 0;
    printf("%zu\n", v.len);
    free(v);
    return 0;
}
`,
    ],
    note: "Структура з трьома полями (data, len, cap) і чесний власник: create і destroy в парі, free спершу для data, потім для структури. Тимчасовий вказівник після realloc рятує від витоку, а подвоєння місткості робить push амортизовано O(1).",
    work: "Так влаштовані динамічні буфери всюди в C-коді: рядки в SDS і strbuf у git, списки токенів у парсерах, масиви вершин у графічних рушіях. У ядрі Linux та в Redis структура з data, len і cap зустрічається на кожному кроці.",
    tasks: [
      "Чому подвоєння місткості дає амортизовано O(1) на push, а збільшення на одиницю ні? Скільки копій (приблизно) зроблять 1000 вставок у кожному випадку?",
      "Що станеться з вказівником на <code>v-&gt;data[0]</code>, узятим до виклику <code>vec_push</code>, якщо push викликав <code>realloc</code>, і чому записувати результат <code>realloc</code> прямо в <code>v-&gt;data</code> небезпечно?",
    ],
  },
  {
    t: "Зв'язний список",
    ch: "Структури даних",
    easy: "Зв'язний список це квест із записками: кожна записка містить число і підказку, де лежить наступна. Додати нову записку легко, достатньо змінити одну підказку, а щоб знайти п'яту, доведеться пройти перші чотири.",
    p: [
      "Динамічний масив тримає елементи впритул, і вставка на початок зсуває всі решту. Зв'язний список іде протилежним шляхом: кожен елемент це окремий блок на купі, <b>вузол</b>, що несе значення і адресу наступного вузла. Нічого не зсувається й не копіюється, вставка на початок це кілька присвоєнь. Ціна: пам'ять розкидана, доступ за номером вимагає ходити по ланцюжку, а на кожен вузол іде окремий <code>malloc</code> і додатковий вказівник.",
      "Вузол визначається самовкладено: <code>typedef struct Node { int value; struct Node *next; } Node;</code>. Всередині структури ім'я <code>Node</code> від typedef ще не існує, тому поле пишемо з <code>struct Node *</code>. Сам список зручно обгорнути в структуру <code>List</code> з вказівником <code>head</code> і лічильником <code>len</code>: порожній список це <code>head == NULL</code>, а кінець ланцюжка завжди <code>next == NULL</code>.",
      "Власність така. Список володіє всіма вузлами: створює їх у <code>push</code> і звільняє в <code>pop</code>, <code>remove</code> та <code>destroy</code>. Знищувати ланцюжок треба обережно: <code>free(n)</code> робить <code>n-&gt;next</code> недоступним, тому спершу зберіть наступний вказівник у змінну, потім звільніть вузол. Цикл <code>for (n = h; n; n = n-&gt;next) free(n)</code> читає вже звільнену пам'ять: це use-after-free, яке ловить AddressSanitizer.",
      "Складність міряємо кроками, тобто переходами по <code>next</code>. <code>push_front</code> завжди 0 кроків: O(1). <code>push_back</code> без додаткового вказівника має дійти до кінця, на n-му елементі це n кроків, і n вставок разом коштують близько n²/2 переходів (приклад 2). Тримаєте в списку ще й <code>tail</code>, тоді вставка в кінець теж O(1). Пошук за значенням завжди O(n): тут немає індексу, лише ходіння з голови.",
      "Видалення за значенням має класичну ідіому з вказівником на вказівник: <code>Node **pp = &amp;l-&gt;head; while (*pp &amp;&amp; (*pp)-&gt;value != x) pp = &amp;(*pp)-&gt;next;</code>. Змінна <code>pp</code> тримає адресу <i>місця</i>, де лежить посилання на вузол: це або <code>head</code>, або чийсь <code>next</code>. Тому видалення першого вузла і середнього пишеться однаково: <code>*pp = (*pp)-&gt;next</code>, без окремої гілки й без змінної «попередній».",
      "Розвернути список на місці можна за один прохід трьома вказівниками (<code>prev</code>, <code>cur</code>, <code>next</code>): перед тим, як переставити <code>cur-&gt;next</code>, запам'ятайте старе значення. Типові помилки: розіменування <code>NULL</code> на порожньому списку (приклад 4), забутий <code>len--</code> після видалення й витік вузла, коли <code>head</code> перезаписали, не звільнивши. Перевіряйте повернення <code>malloc</code> і не змінюйте список, поки не маєте нового вузла.",
      "Ми не сортуємо й не ходимо назад, тому вистачає однозв'язного списку. Але саме на ньому видно ключову ідею глави: структура даних це не лише поля, а й договір про те, що дешеве, що дороге і хто що звільняє. У наступному уроці з однозв'язного списку виростають стек і черга.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

typedef struct {
    Node *head;
    size_t len;
} List;

List *list_create(void) {
    List *l = malloc(sizeof *l);
    if (l == NULL) {
        return NULL;
    }
    l->head = NULL;
    l->len = 0;
    return l;
}

int list_push_front(List *l, int x) {
    Node *n = malloc(sizeof *n);
    if (n == NULL) {
        return -1;
    }
    n->value = x;
    n->next = l->head;
    l->head = n;
    l->len++;
    return 0;
}

void list_print(const List *l) {
    for (const Node *n = l->head; n != NULL; n = n->next) {
        printf("%d -> ", n->value);
    }
    printf("NULL\n");
}

void list_destroy(List *l) {
    Node *n = l->head;
    while (n != NULL) {
        Node *next = n->next;
        free(n);
        n = next;
    }
    free(l);
}

int main(void) {
    List *l = list_create();
    if (l == NULL) {
        return 1;
    }
    for (int i = 1; i <= 4; i++) {
        list_push_front(l, i * 10);
    }
    list_print(l);
    printf("len=%zu\n", l->len);
    list_destroy(l);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

typedef struct {
    Node *head;
    Node *tail;
    size_t len;
} List;

static size_t hops;

static Node *new_node(int x) {
    Node *n = malloc(sizeof *n);
    if (n == NULL) {
        abort();
    }
    n->value = x;
    n->next = NULL;
    return n;
}

static void push_back_slow(List *l, int x) {
    Node *n = new_node(x);
    if (l->head == NULL) {
        l->head = n;
    } else {
        Node *cur = l->head;
        while (cur->next != NULL) {
            cur = cur->next;
            hops++;
        }
        cur->next = n;
    }
    l->len++;
}

static void push_back_fast(List *l, int x) {
    Node *n = new_node(x);
    if (l->tail == NULL) {
        l->head = n;
    } else {
        l->tail->next = n;
    }
    l->tail = n;
    l->len++;
}

static void destroy(List *l) {
    Node *n = l->head;
    while (n != NULL) {
        Node *next = n->next;
        free(n);
        n = next;
    }
}

int main(void) {
    List slow = {NULL, NULL, 0};
    List fast = {NULL, NULL, 0};
    for (int i = 0; i < 500; i++) {
        push_back_slow(&slow, i);
    }
    printf("push_back без tail: переходів=%zu\n", hops);
    hops = 0;
    for (int i = 0; i < 500; i++) {
        push_back_fast(&fast, i);
    }
    printf("push_back з tail: переходів=%zu\n", hops);
    destroy(&slow);
    destroy(&fast);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

static Node *push_front(Node *head, int x) {
    Node *n = malloc(sizeof *n);
    if (n == NULL) {
        abort();
    }
    n->value = x;
    n->next = head;
    return n;
}

static Node *remove_value(Node *head, int x) {
    Node **pp = &head;
    while (*pp != NULL && (*pp)->value != x) {
        pp = &(*pp)->next;
    }
    if (*pp != NULL) {
        Node *dead = *pp;
        *pp = dead->next;
        free(dead);
    }
    return head;
}

static Node *reverse(Node *head) {
    Node *prev = NULL;
    Node *cur = head;
    while (cur != NULL) {
        Node *next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}

static void print(const Node *n) {
    for (; n != NULL; n = n->next) {
        printf("%d ", n->value);
    }
    printf("\n");
}

static void destroy(Node *n) {
    while (n != NULL) {
        Node *next = n->next;
        free(n);
        n = next;
    }
}

int main(void) {
    Node *head = NULL;
    for (int i = 5; i >= 1; i--) {
        head = push_front(head, i);
    }
    print(head);
    head = remove_value(head, 1);
    head = remove_value(head, 3);
    head = remove_value(head, 99);
    print(head);
    head = reverse(head);
    print(head);
    destroy(head);
    return 0;
}
`,
      String.raw`// аварія: pop з порожнього списку розіменовує NULL, бо head == NULL
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

static int pop_front(Node **head) {
    Node *n = *head;
    int v = n->value;
    *head = n->next;
    free(n);
    return v;
}

int main(void) {
    Node *head = malloc(sizeof *head);
    if (head == NULL) {
        return 1;
    }
    head->value = 7;
    head->next = NULL;
    printf("%d\n", pop_front(&head));
    printf("%d\n", pop_front(&head));
    return 0;
}
`,
    ],
    note: "Список володіє вузлами: кожному malloc рівно один free. Знищуючи ланцюжок, спершу збережіть next, потім free. Вказівник на вказівник робить видалення голови й середини однаковим кодом, а push_back без tail коштує O(n).",
    work: "Зв'язні списки лежать в основі черг задач, списків процесів планувальника й хеш-ланцюжків. Інтрузивні списки ядра Linux (list_head) і freelist в алокаторах це той самий принцип: вузол несе посилання на сусіда.",
    tasks: [
      "Чому цикл <code>for (n = head; n; n = n-&gt;next) free(n)</code> для знищення списку неправильний і як це виправити? Який інструмент це покаже?",
      "Скільки переходів по <code>next</code> зробить <code>push_back</code> у список із 100 вузлів без tail і з ним? Як зміниться загальна ціна 100 вставок підряд?",
    ],
  },
  {
    t: "Стек і черга",
    ch: "Структури даних",
    easy: "Стек це стопка тарілок: кладете й берете лише згори, тому перша зверху піде першою. Черга це людська черга в касу: хто прийшов раніше, той раніше й обслужений. Обмеження доступу тут і є вся користь.",
    p: [
      "Стек і черга це не нові способи зберігати дані, а <b>обмеження</b> того, що з даними можна робити. Стек працює за правилом LIFO (останнім прийшов, першим пішов): є лише <code>push</code> на вершину, <code>pop</code> з вершини й <code>peek</code>. Черга працює за FIFO (першим прийшов, першим пішов): <code>enqueue</code> у кінець, <code>dequeue</code> з початку. Обмеження робить код передбачуваним: читач одразу знає, що алгоритм ніколи не лізе в середину.",
      "Ви вже користуєтесь стеком щодня: стек викликів функцій у пам'яті це він, і кожен виклик кладе кадр, а <code>return</code> його знімає. Так само працюють «скасувати» у редакторі, обхід у глибину, розбір виразів і перевірка дужок (приклад 1). Черга обслуговує задачі за порядком надходження, буфери вводу-виводу й обхід у ширину. Обидві структури дають <code>push</code>/<code>pop</code> і <code>enqueue</code>/<code>dequeue</code> за O(1).",
      "Стек природно живе на масиві з полями <code>items</code>, <code>top</code> (скільки елементів лежить, він же індекс наступного вільного місця) і <code>cap</code>. <code>push</code> пише в <code>items[top++]</code>, <code>pop</code> читає <code>items[--top]</code>. Порожній стек це <code>top == 0</code>, повний <code>top == cap</code>. Робити <code>pop</code> з порожнього не можна: або повертайте код помилки, або ставте <code>assert</code>, залежно від того, чи вважаєте це помилкою викликача (приклад 4).",
      "Для черги найпростіша реалізація це зв'язний список із двома вказівниками, <code>head</code> і <code>tail</code>. <code>enqueue</code> чіпляє вузол за <code>tail</code>, <code>dequeue</code> знімає <code>head</code>. Є класична пастка: коли ви знімаєте останній елемент, <code>head</code> стає <code>NULL</code>, а <code>tail</code> усе ще вказує на звільнений вузол. Наступний <code>enqueue</code> запише в нього. Виправлення одне: якщо <code>head == NULL</code>, то й <code>tail = NULL</code>.",
      "Черга на масиві має підступ. Якщо <code>dequeue</code> бере <code>items[0]</code> і зсуває решту вліво, кожне зняття коштує O(n). Для тисячі елементів це ~500 тисяч зсувів (приклад 3). Рішення це <b>кільцевий буфер</b>: масив фіксованої місткості, індекс початку <code>head</code> і довжина <code>len</code>. Запис іде в <code>(head + len) % cap</code>, зняття збільшує <code>head</code> по колу. Нічого не зсувається, обидві операції O(1), але місткість фіксована, і повну чергу треба обробити окремо.",
      "Про власність. Структура <code>Stack</code> або <code>Queue</code> володіє своїми внутрішніми блоками (масивом чи вузлами) і звільняє їх у <code>destroy</code>. <code>dequeue</code> віддає значення викликачу через вихідний параметр і сам звільняє вузол, тому викликач не отримує нічого, що треба було б <code>free</code>. Якби елементами були вказівники на виділені об'єкти, потрібне правило, хто їх звільняє: домовтеся про це в документації API.",
      "Складність обох структур не залежить від розміру: це ідеал, до якого ми прагнемо, але платимо відсутністю пошуку. Знайти елемент у стеку можна лише розібравши його. Наступний урок додає вузлу вказівник назад, і видалення з середини теж стане дешевим.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *items;
    size_t top;
    size_t cap;
} Stack;

Stack *stack_create(size_t cap) {
    Stack *s = malloc(sizeof *s);
    if (s == NULL) {
        return NULL;
    }
    s->items = malloc(cap * sizeof *s->items);
    if (s->items == NULL) {
        free(s);
        return NULL;
    }
    s->top = 0;
    s->cap = cap;
    return s;
}

int stack_push(Stack *s, char c) {
    if (s->top == s->cap) {
        return -1;
    }
    s->items[s->top++] = c;
    return 0;
}

int stack_pop(Stack *s, char *out) {
    if (s->top == 0) {
        return -1;
    }
    *out = s->items[--s->top];
    return 0;
}

void stack_destroy(Stack *s) {
    if (s != NULL) {
        free(s->items);
        free(s);
    }
}

static int balanced(const char *text) {
    Stack *s = stack_create(strlen(text) + 1);
    if (s == NULL) {
        return 0;
    }
    int ok = 1;
    for (const char *p = text; *p != '\0' && ok; p++) {
        char c = *p;
        if (c == '(' || c == '[' || c == '{') {
            stack_push(s, c);
        } else if (c == ')' || c == ']' || c == '}') {
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            char open = 0;
            ok = stack_pop(s, &open) == 0 && open == want;
        }
    }
    ok = ok && s->top == 0;
    stack_destroy(s);
    return ok;
}

int main(void) {
    const char *tests[] = {"({[]})", "([)]", "((", "a[b]{c}", "}"};
    for (size_t i = 0; i < sizeof tests / sizeof tests[0]; i++) {
        printf("%-8s %s\n", tests[i], balanced(tests[i]) ? "ok" : "ні");
    }
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct QNode {
    int value;
    struct QNode *next;
} QNode;

typedef struct {
    QNode *head;
    QNode *tail;
    size_t len;
} Queue;

int queue_enqueue(Queue *q, int x) {
    QNode *n = malloc(sizeof *n);
    if (n == NULL) {
        return -1;
    }
    n->value = x;
    n->next = NULL;
    if (q->tail == NULL) {
        q->head = n;
    } else {
        q->tail->next = n;
    }
    q->tail = n;
    q->len++;
    return 0;
}

int queue_dequeue(Queue *q, int *out) {
    if (q->head == NULL) {
        return -1;
    }
    QNode *n = q->head;
    *out = n->value;
    q->head = n->next;
    if (q->head == NULL) {
        q->tail = NULL;
    }
    free(n);
    q->len--;
    return 0;
}

void queue_destroy(Queue *q) {
    int tmp;
    while (queue_dequeue(q, &tmp) == 0) {
    }
}

int main(void) {
    Queue q = {NULL, NULL, 0};
    for (int i = 1; i <= 5; i++) {
        queue_enqueue(&q, i);
    }
    int x = 0;
    for (int i = 0; i < 3; i++) {
        queue_dequeue(&q, &x);
        printf("видано %d\n", x);
    }
    queue_enqueue(&q, 6);
    printf("у черзі %zu:", q.len);
    while (queue_dequeue(&q, &x) == 0) {
        printf(" %d", x);
    }
    printf("\n");
    queue_enqueue(&q, 99);
    printf("після спорожнення: head і tail %s\n", q.head == q.tail ? "узгоджені" : "розійшлися");
    queue_destroy(&q);
    return 0;
}
`,
      String.raw`#include <stdio.h>

#define CAP 1024

typedef struct {
    int items[CAP];
    size_t head;
    size_t len;
} Ring;

typedef struct {
    int items[CAP];
    size_t len;
} ShiftQueue;

static void ring_put(Ring *r, int x) {
    r->items[(r->head + r->len) % CAP] = x;
    r->len++;
}

static int ring_get(Ring *r) {
    int x = r->items[r->head];
    r->head = (r->head + 1) % CAP;
    r->len--;
    return x;
}

static size_t moves;

static void shift_put(ShiftQueue *q, int x) {
    q->items[q->len++] = x;
}

static int shift_get(ShiftQueue *q) {
    int x = q->items[0];
    for (size_t i = 1; i < q->len; i++) {
        q->items[i - 1] = q->items[i];
        moves++;
    }
    q->len--;
    return x;
}

int main(void) {
    static ShiftQueue sq;
    static Ring ring;
    long sum_shift = 0;
    long sum_ring = 0;
    for (int i = 1; i <= 1000; i++) {
        shift_put(&sq, i);
        ring_put(&ring, i);
    }
    while (sq.len > 0) {
        sum_shift += shift_get(&sq);
    }
    while (ring.len > 0) {
        sum_ring += ring_get(&ring);
    }
    printf("зсув: сума=%ld зсувів=%zu\n", sum_shift, moves);
    printf("кільце: сума=%ld зсувів=0\n", sum_ring);
    return 0;
}
`,
      String.raw`// аварія: pop з порожнього стека зупиняє програму через assert, а не читає items[-1]
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *items;
    size_t top;
} Stack;

static void push(Stack *s, int x) {
    s->items[s->top++] = x;
}

static int pop(Stack *s) {
    assert(s->top > 0);
    return s->items[--s->top];
}

int main(void) {
    Stack s;
    s.items = malloc(4 * sizeof *s.items);
    if (s.items == NULL) {
        return 1;
    }
    s.top = 0;
    push(&s, 1);
    push(&s, 2);
    printf("%d\n", pop(&s));
    printf("%d\n", pop(&s));
    printf("%d\n", pop(&s));
    free(s.items);
    return 0;
}
`,
    ],
    note: "Стек це LIFO, черга це FIFO, і обидві операції O(1). Піймайте дві пастки: pop з порожнього стека і забутий tail = NULL у черзі зі списку. Черга на масиві зі зсувом O(n), кільцевий буфер O(1).",
    work: "Стек викликів, undo в редакторі й DFS це стеки. Черги в планувальниках, мережевих буферах, лог-конвеєрах і BFS. Кільцевий буфер лежить у драйверах, аудіо та в канальних буферах ядра: ніяких виділень під час роботи.",
    tasks: [
      "Чому в черзі зі списку при знятті останнього елемента потрібно обнулити tail і що станеться, якщо цього не зробити?",
      "Скільки зсувів елементів зробить черга на масиві зі зсувом після 1000 вставок і 1000 зняттів і чому кільцевий буфер це прибирає?",
    ],
  },
  {
    t: "Двозв'язний список",
    ch: "Структури даних",
    easy: "Двозв'язний список це потяг, у якого кожен вагон з'єднаний і з наступним, і з попереднім. Відчепити вагон посередині можна, не бігаючи від локомотива: у ньому вже є обидва сусіди.",
    p: [
      "В однозв'язному списку видалити вузол, маючи лише вказівник на нього, неможливо без попередника: треба дійти з голови, це O(n). Додайте вузлу ще одне поле <code>prev</code>, і вузол знає обох сусідів. Тоді видалення за вказівником це кілька присвоєнь, обхід можливий в обидва боки, а вставка перед вузлом так само дешева, як після. Платимо вісьмома байтами на вузол і подвоєнням місць, де можна наробити помилок.",
      "Кожен зв'язок тепер записаний двічі, і головне правило це <b>інваріант</b>: для кожного вузла <code>n-&gt;next-&gt;prev == n</code> і <code>n-&gt;prev-&gt;next == n</code>. Усі операції мають лишати його істинним. Коли ви змінюєте один вказівник і забуваєте парний, список ламається тихо: вперед ідете нормально, а назад потрапляєте в чужі вузли. Корисно мати функцію <code>check</code> з <code>assert</code> і викликати її в тестах (приклад 3).",
      "Звичайний двозв'язний список з <code>head</code> і <code>tail</code> має купу окремих випадків: порожній список, єдиний вузол, перший, останній. Їх усі прибирає <b>вартовий</b> (sentinel): додатковий вузол без даних, що замикає список у кільце. У порожньому списку він вказує сам на себе, <code>head.next == head.prev == &amp;head</code>. Тоді в списку завжди є сусіди, а вставка між <code>pos</code> і <code>pos-&gt;next</code> це чотири присвоєння без жодних <code>if</code>.",
      "Операція вставки така: новий вузол <code>n</code>, куди ставимо <code>n-&gt;prev = pos; n-&gt;next = pos-&gt;next; pos-&gt;next-&gt;prev = n; pos-&gt;next = n;</code>. Порядок важливий: <code>pos-&gt;next</code> читаємо до того, як його змінюємо. <code>push_back</code> це вставка після <code>head.prev</code>, <code>push_front</code> вставка після самого вартового. Видалення ще коротше: <code>n-&gt;prev-&gt;next = n-&gt;next; n-&gt;next-&gt;prev = n-&gt;prev; free(n);</code>, і жодних порівнянь із <code>NULL</code>.",
      "Вимірюємо кроки. Видалення за відомим вказівником коштує нуль переходів по списку: O(1). У прикладі 2 ми видаляємо 500 вузлів із тисячі за вказівниками з масиву й жодного разу не йдемо по ланцюжку. Пошук за значенням, навпаки, O(n): ми відвідуємо вузол за вузлом. Отже, двозв'язний список виграє там, де вузли вже знайдено, наприклад, коли ви тримаєте вказівники в хеш-таблиці, як це робить LRU-кеш.",
      "Власність така: список володіє вузлами. Вказівник <code>Node *</code>, який повернув <code>push_back</code>, дійсний до <code>remove</code> цього вузла або <code>destroy</code> списку; після цього він висячий, і користуватися ним не можна. Ще одна тонкість вартового: його вказівники вказують на сам список, тому структуру <code>DList</code> не копіюють після <code>init</code> (копія вказувала б на оригінал). Знищення це цикл, що знімає <code>head.next</code>, поки список не стане порожнім.",
      "Самопосилання вузла в типі вимагає імені структури: <code>typedef struct { Node *next; } Node;</code> не збереться, бо всередині ім'я <code>Node</code> ще не існує (приклад 4); пишіть <code>struct Node</code> у тілі й <code>typedef</code> після. У наступному уроці ми повернемося до пошуку за ключем і побудуємо його на хеш-таблиці з ланцюжками, де такі списки стають відрами.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *prev;
    struct Node *next;
} Node;

typedef struct {
    Node head;
    size_t len;
} DList;

void dl_init(DList *l) {
    l->head.prev = &l->head;
    l->head.next = &l->head;
    l->len = 0;
}

Node *dl_insert_after(DList *l, Node *pos, int x) {
    Node *n = malloc(sizeof *n);
    if (n == NULL) {
        return NULL;
    }
    n->value = x;
    n->prev = pos;
    n->next = pos->next;
    pos->next->prev = n;
    pos->next = n;
    l->len++;
    return n;
}

Node *dl_push_back(DList *l, int x) {
    return dl_insert_after(l, l->head.prev, x);
}

Node *dl_push_front(DList *l, int x) {
    return dl_insert_after(l, &l->head, x);
}

void dl_remove(DList *l, Node *n) {
    n->prev->next = n->next;
    n->next->prev = n->prev;
    free(n);
    l->len--;
}

void dl_destroy(DList *l) {
    while (l->head.next != &l->head) {
        dl_remove(l, l->head.next);
    }
}

int main(void) {
    DList l;
    dl_init(&l);
    dl_push_back(&l, 2);
    dl_push_back(&l, 3);
    dl_push_front(&l, 1);
    printf("вперед:");
    for (const Node *n = l.head.next; n != &l.head; n = n->next) {
        printf(" %d", n->value);
    }
    printf("\nназад:");
    for (const Node *n = l.head.prev; n != &l.head; n = n->prev) {
        printf(" %d", n->value);
    }
    printf("\nlen=%zu\n", l.len);
    dl_destroy(&l);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *prev;
    struct Node *next;
} Node;

typedef struct {
    Node head;
    size_t len;
} DList;

static Node *push_back(DList *l, int x) {
    Node *n = malloc(sizeof *n);
    if (n == NULL) {
        abort();
    }
    Node *pos = l->head.prev;
    n->value = x;
    n->prev = pos;
    n->next = pos->next;
    pos->next->prev = n;
    pos->next = n;
    l->len++;
    return n;
}

static void remove_node(DList *l, Node *n) {
    n->prev->next = n->next;
    n->next->prev = n->prev;
    free(n);
    l->len--;
}

int main(void) {
    DList l;
    l.head.prev = &l.head;
    l.head.next = &l.head;
    l.len = 0;
    Node *nodes[1000];
    for (int i = 0; i < 1000; i++) {
        nodes[i] = push_back(&l, i);
    }
    size_t removed = 0;
    for (int i = 0; i < 1000; i += 2) {
        remove_node(&l, nodes[i]);
        removed++;
    }
    printf("видалено за вказівником: %zu вузлів, переходів по списку: 0\n", removed);
    size_t visited = 0;
    for (const Node *n = l.head.next; n != &l.head; n = n->next) {
        visited++;
        if (n->value == 999) {
            break;
        }
    }
    printf("пошук значення 999: відвідано %zu вузлів із %zu\n", visited, l.len);
    while (l.head.next != &l.head) {
        remove_node(&l, l.head.next);
    }
    return 0;
}
`,
      String.raw`// аварія: вставка забула виставити prev, і assert у check ловить порушений інваріант
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *prev;
    struct Node *next;
} Node;

static void check(const Node *head) {
    for (const Node *n = head->next; n != head; n = n->next) {
        assert(n->next->prev == n);
        assert(n->prev->next == n);
    }
}

static void bad_insert_after(Node *pos, int x) {
    Node *n = malloc(sizeof *n);
    if (n == NULL) {
        abort();
    }
    n->value = x;
    n->prev = pos;
    n->next = pos->next;
    pos->next = n;
}

int main(void) {
    Node head;
    head.prev = &head;
    head.next = &head;
    check(&head);
    printf("порожній список: інваріант цілий\n");
    bad_insert_after(&head, 5);
    check(&head);
    printf("сюди ми не дійдемо\n");
    return 0;
}
`,
      String.raw`// не компілюється: усередині безіменної struct ім'я Node ще не існує, треба struct Node
#include <stdio.h>

typedef struct {
    int value;
    Node *next;
} Node;

int main(void) {
    Node n = {1, NULL};
    printf("%d\n", n.value);
    return 0;
}
`,
    ],
    note: "Інваріант (prev наступного вузла вказує на сам вузол) лишається істинним після кожної операції. Вартовий прибирає особливі випадки, remove за вказівником O(1), а пошук за значенням усе одно O(n). Вузол після free висячий: не користуйтеся ним.",
    work: "Двозв'язні списки тримають LRU-кеші (хеш-таблиця вказує на вузли), історію в браузері й редакторі, списки процесів і задач у ядрі Linux (list_head з вартовим). Усюди, де треба швидко вирвати вузол із середини.",
    tasks: [
      "Яку рівність називають інваріантом двозв'язного списку і яку симптоматику дає забутий prev у вставці?",
      "Чому видалення вузла за вказівником у двозв'язному списку O(1), а в однозв'язному O(n), і як вартовий спрощує вставку на порожньому списку?",
    ],
  },
  {
    t: "Хеш-таблиця",
    ch: "Структури даних",
    easy: "Хеш-таблиця схожа на шафу з підписаними шухлядками: за назвою речі ви одразу рахуєте, у якій шухляді її шукати, і не перебираєте весь дім. Якщо в шухляді лежить кілька речей, швидко переглядаєте лише її.",
    p: [
      "Масив шукає за O(n), впорядкований масив за O(log n), але вставка в нього зсуває елементи. Хеш-таблиця дає в середньому O(1) і на пошук, і на вставку. На ній стоять словники Python, <code>Map</code> у JavaScript, <code>unordered_map</code> у C++. У стандартній бібліотеці C її немає, тож ми пишемо її вручну: це підрахунок частот слів, кеші, таблиці символів у компіляторах.",
      "Ідея в двох кроках. <b>Хеш-функція</b> перетворює ключ-рядок на число, а число за модулем кількості кошиків <code>nb</code> дає індекс кошика. Ми беремо <b>djb2</b>: починаємо з 5381 і для кожного байта робимо <code>h = h * 33 + c</code>. Хеш зберігаємо в <code>uint32_t</code>: переповнення беззнакового типу в C це арифметика за модулем 2^32, визначена стандартом (на відміну від <code>int</code>, де це UB). Тому число однакове на будь-якій платформі, див. приклад 1.",
      "Ключів безліч, кошиків мало, тож різні ключі неминуче потрапляють в один кошик. Це <b>колізія</b>: у прикладі 1 слова <code>cat</code> і <code>act</code> обидва мають індекс 5. Ми розв'язуємо її <b>ланцюжками</b>: кожен кошик це однозв'язний список вузлів <code>Entry</code> (ключ, значення, <code>next</code>). Вставка нового ключа це додавання на початок ланцюжка, O(1). Пошук рахує індекс і проходить лише цей ланцюжок, порівнюючи ключі через <code>strcmp</code>.",
      "Власник пам'яті один: таблиця. Вона володіє вузлами, масивом кошиків і <b>копіями</b> ключів. Копія обов'язкова: рядок, який ви передали, часто лежить у тимчасовому буфері (<code>strtok</code>, <code>fgets</code>), і вже наступний прохід перезапише його. Тому <code>dup_str</code> робить <code>malloc</code> і <code>memcpy</code> (функція <code>strdup</code> є в POSIX, але не в C11). <code>table_destroy</code> іде зсередини назовні: ключ, вузол, потім масив кошиків і сама таблиця. Приклад 4 показує, що буває без копії.",
      "Швидкість залежить від довжини ланцюжків. Середня довжина це <b>коефіцієнт завантаження</b> <code>len / nb</code>. Якщо кошиків лишається 4, а ключів 1000, ланцюжки по 250 вузлів, і пошук вироджується в O(n). Тому таблиця росте: коли <code>len * 4 &gt; nb * 3</code> (завантаження вище 0,75), ми подвоюємо <code>nb</code> і розкладаємо вузли заново. Індекс залежить від <code>nb</code>, отже старі індекси недійсні, і потрібен <b>rehash</b>. Вузли не копіюємо, а лише перев'язуємо, старий масив кошиків звільняємо.",
      "Одне розширення коштує O(n), але трапляється рідко, як і в векторі: амортизована вартість вставки O(1). Міряємо лічильником, а не годинником. Приклад 3 робить 1000 пошуків: при фіксованих 4 кошиках ланцюжки дають 125502 порівнянь ключів, а з ростом лише 1426, тобто близько 1,4 кроку на ключ. Лічильник детермінований, на відміну від секундоміра, і добре видно, що саме дає ресайз.",
      "Таблиця <b>не зберігає порядок</b>: обхід кошиків дає ключі в порядку, що залежить від хеш-функції й поточного <code>nb</code>, і після ресайзу він інший. Щоб вивід був стабільним, збираємо вказівники на вузли в масив і сортуємо його через <code>qsort</code> за <code>strcmp</code> ключів (приклад 2). Ще одне правило: не змінюйте ключ вузла після вставки, інакше він залишиться в кошику, який уже не відповідає його хешу, і пошук його не знайде.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdint.h>

static uint32_t djb2(const char *s) {
    uint32_t h = 5381;
    for (; *s != '\0'; s++) {
        h = h * 33 + (unsigned char)*s;
    }
    return h;
}

int main(void) {
    const char *words[] = {"a", "ab", "abc", "dog", "cat", "act"};
    const size_t nb = 8;
    for (size_t i = 0; i < sizeof words / sizeof words[0]; i++) {
        uint32_t h = djb2(words[i]);
        printf("%-6s hash=%10u bucket=%u\n", words[i], (unsigned)h, (unsigned)(h % nb));
    }
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;
} Entry;

typedef struct {
    Entry **buckets;
    size_t nb;
    size_t len;
    size_t resizes;
} Table;

static uint32_t djb2(const char *s) {
    uint32_t h = 5381;
    for (; *s != '\0'; s++) {
        h = h * 33 + (unsigned char)*s;
    }
    return h;
}

static char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != NULL) {
        memcpy(p, s, n);
    }
    return p;
}

Table *table_create(size_t nb) {
    Table *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->buckets = calloc(nb, sizeof *t->buckets);
    if (t->buckets == NULL) {
        free(t);
        return NULL;
    }
    t->nb = nb;
    t->len = 0;
    t->resizes = 0;
    return t;
}

void table_destroy(Table *t) {
    if (t == NULL) {
        return;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            free(e->key);
            free(e);
            e = next;
        }
    }
    free(t->buckets);
    free(t);
}

static Entry *table_find(const Table *t, const char *key) {
    for (Entry *e = t->buckets[djb2(key) % t->nb]; e != NULL; e = e->next) {
        if (strcmp(e->key, key) == 0) {
            return e;
        }
    }
    return NULL;
}

static int table_grow(Table *t) {
    size_t nb2 = t->nb * 2;
    Entry **b2 = calloc(nb2, sizeof *b2);
    if (b2 == NULL) {
        return -1;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            size_t j = djb2(e->key) % nb2;
            e->next = b2[j];
            b2[j] = e;
            e = next;
        }
    }
    free(t->buckets);
    t->buckets = b2;
    t->nb = nb2;
    t->resizes++;
    return 0;
}

int table_add(Table *t, const char *key, int delta) {
    Entry *e = table_find(t, key);
    if (e != NULL) {
        e->value += delta;
        return 0;
    }
    e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->key = dup_str(key);
    if (e->key == NULL) {
        free(e);
        return -1;
    }
    e->value = delta;
    size_t i = djb2(key) % t->nb;
    e->next = t->buckets[i];
    t->buckets[i] = e;
    t->len++;
    if (t->len * 4 > t->nb * 3) {
        return table_grow(t);
    }
    return 0;
}

static int cmp_entry(const void *a, const void *b) {
    const Entry *x = *(Entry *const *)a;
    const Entry *y = *(Entry *const *)b;
    return strcmp(x->key, y->key);
}

void table_print_sorted(const Table *t) {
    Entry **all = malloc(t->len * sizeof *all);
    if (all == NULL) {
        return;
    }
    size_t n = 0;
    for (size_t i = 0; i < t->nb; i++) {
        for (Entry *e = t->buckets[i]; e != NULL; e = e->next) {
            all[n++] = e;
        }
    }
    qsort(all, n, sizeof *all, cmp_entry);
    for (size_t i = 0; i < n; i++) {
        printf("%s=%d\n", all[i]->key, all[i]->value);
    }
    free(all);
}

int main(void) {
    char text[] = "to be or not to be that is the question to be";
    Table *t = table_create(4);
    if (t == NULL) {
        return 1;
    }
    for (char *w = strtok(text, " "); w != NULL; w = strtok(NULL, " ")) {
        table_add(t, w, 1);
    }
    table_print_sorted(t);
    printf("len=%zu buckets=%zu resizes=%zu\n", t->len, t->nb, t->resizes);
    table_destroy(t);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;
} Entry;

typedef struct {
    Entry **buckets;
    size_t nb;
    size_t len;
    size_t resizes;
    size_t steps;
    int autogrow;
} Table;

static uint32_t djb2(const char *s) {
    uint32_t h = 5381;
    for (; *s != '\0'; s++) {
        h = h * 33 + (unsigned char)*s;
    }
    return h;
}

static char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != NULL) {
        memcpy(p, s, n);
    }
    return p;
}

Table *table_create(size_t nb, int autogrow) {
    Table *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->buckets = calloc(nb, sizeof *t->buckets);
    if (t->buckets == NULL) {
        free(t);
        return NULL;
    }
    t->nb = nb;
    t->len = 0;
    t->resizes = 0;
    t->steps = 0;
    t->autogrow = autogrow;
    return t;
}

void table_destroy(Table *t) {
    if (t == NULL) {
        return;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            free(e->key);
            free(e);
            e = next;
        }
    }
    free(t->buckets);
    free(t);
}

static Entry *table_find(Table *t, const char *key) {
    for (Entry *e = t->buckets[djb2(key) % t->nb]; e != NULL; e = e->next) {
        t->steps++;
        if (strcmp(e->key, key) == 0) {
            return e;
        }
    }
    return NULL;
}

static int table_grow(Table *t) {
    size_t nb2 = t->nb * 2;
    Entry **b2 = calloc(nb2, sizeof *b2);
    if (b2 == NULL) {
        return -1;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            size_t j = djb2(e->key) % nb2;
            e->next = b2[j];
            b2[j] = e;
            e = next;
        }
    }
    free(t->buckets);
    t->buckets = b2;
    t->nb = nb2;
    t->resizes++;
    return 0;
}

int table_add(Table *t, const char *key, int delta) {
    Entry *e = table_find(t, key);
    if (e != NULL) {
        e->value += delta;
        return 0;
    }
    e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->key = dup_str(key);
    if (e->key == NULL) {
        free(e);
        return -1;
    }
    e->value = delta;
    size_t i = djb2(key) % t->nb;
    e->next = t->buckets[i];
    t->buckets[i] = e;
    t->len++;
    if (t->autogrow && t->len * 4 > t->nb * 3) {
        return table_grow(t);
    }
    return 0;
}

static size_t run(int autogrow) {
    Table *t = table_create(4, autogrow);
    if (t == NULL) {
        return 0;
    }
    char key[16];
    for (int i = 0; i < 1000; i++) {
        snprintf(key, sizeof key, "k%d", i);
        table_add(t, key, i);
    }
    t->steps = 0;
    for (int i = 0; i < 1000; i++) {
        snprintf(key, sizeof key, "k%d", i);
        table_add(t, key, 1);
    }
    size_t steps = t->steps;
    printf("autogrow=%d buckets=%zu len=%zu resizes=%zu\n", autogrow, t->nb, t->len, t->resizes);
    table_destroy(t);
    return steps;
}

int main(void) {
    size_t slow = run(0);
    size_t fast = run(1);
    printf("кроків пошуку: без росту %zu, з ростом %zu\n", slow, fast);
    printf("з ростом менше, ніж 2 кроки на ключ: %s\n", fast < 2000 ? "так" : "ні");
    return 0;
}
`,
      String.raw`// фрагмент: ключ без копії, усі вузли вказують на один і той самий буфер
char buf[16];
for (int i = 0; i < 3; i++) {
    snprintf(buf, sizeof buf, "k%d", i);
    Entry *e = malloc(sizeof *e);
    e->key = buf;
    e->value = i;
}
// після циклу в buf лежить "k2", тож усі три ключі виглядають як "k2";
// а якщо buf локальний у функції, після її завершення вказівники ще й висячі
`,
      String.raw`// не компілюється: switch працює лише з цілими, рядок у case не підходить
#include <stdio.h>

int main(void) {
    const char *key = "red";
    switch (key) {
    case "red":
        printf("червоний\n");
        break;
    default:
        printf("інший\n");
    }
    return 0;
}
`,
    ],
    note: "Хеш-таблиця швидка лише тоді, коли ланцюжки короткі: тримайте len/nb не вище 0,75 за допомогою ресайзу. Зберігайте копію ключа, а не вказівник на тимчасовий буфер, і ніколи не покладайтеся на порядок обходу.",
    work: "На хеш-таблицях стоять словники й множини мов, кеші запитів, таблиці символів компіляторів, індекси в базах даних і дедуплікація записів. Redis і ядро Linux теж використовують ланцюжки й поступове розширення таблиць.",
    tasks: [
      "Чому колізія не ламає таблицю з ланцюжками і що станеться з довжиною ланцюжків, якщо ніколи не робити ресайз?",
      "Чому при ресайзі не можна просто скопіювати кошики в більший масив, а треба перерахувати індекс кожного ключа, і хто володіє ключем у таблиці?",
    ],
  },
  {
    t: "Бінарне дерево пошуку",
    ch: "Структури даних",
    easy: "Бінарне дерево пошуку працює як гра «вгадай число»: на кожному кроці ви питаєте, менше чи більше, і одразу відкидаєте половину варіантів. Тільки варіанти тут розкладені по вузлах з двома відгалуженнями.",
    p: [
      "Хеш-таблиця швидка, але не знає порядку. Впорядкований масив шукає за O(log n), та вставка в нього зсуває елементи, O(n). <b>Бінарне дерево пошуку</b> (BST) тримає ключі впорядкованими й дає вставку, пошук і видалення в середньому за O(log n), а обхід по порядку віддає ключі відсортованими. На такому принципі побудовані <code>std::map</code> у C++ і індекси баз даних.",
      "Вузол має три поля: <code>key</code>, <code>left</code> і <code>right</code>. Головна властивість: усі ключі в лівому піддереві менші за ключ вузла, а в правому більші. Дублікати ми ігноруємо. Усе дерево це один вказівник на корінь, а <code>NULL</code> означає порожнє дерево. Означення рекурсивне: кожне піддерево теж є деревом пошуку, і код природно рекурсивний.",
      "Вставка спускається ліворуч чи праворуч за порівнянням, а на <code>NULL</code> створює вузол через <code>malloc</code>. Функція <b>повертає корінь піддерева</b>, і викликач пише <code>root = bst_insert(root, key);</code>. Так порожнє дерево не потребує вказівника на вказівник. Власник один: дерево володіє вузлами. <code>bst_destroy</code> обходить у зворотному порядку: спершу обидва піддерева, потім <code>free</code> вузла. Якщо звільнити вузол першим, діти стануть недосяжними, і це витік.",
      "Пошук можна зробити циклом: порівняли, пішли вліво чи вправо, на <code>NULL</code> зупинилися. Ми рахуємо порівняння в лічильнику <code>cmp</code>, щоб складність була видна числом: у прикладі 1 пошук і наявного ключа 60, і відсутнього 65 коштує по 3 порівняння. Обхід <b>in-order</b> (ліве піддерево, вузол, праве) друкує ключі за зростанням. Це прямий наслідок властивості BST, а не окрема вигадка.",
      "Вартість операцій це O(h), де h <b>висота</b> дерева: кількість рівнів, 0 для порожнього, <code>1 + max(ліва, права)</code> інакше. Дерево не гарантує, що h близьке до log n. Приклад 2 вставляє ті самі 15 ключів у двох порядках: за зростанням виходить висота 15 і 120 порівнянь на 15 пошуків, а в перемішаному порядку висота 4 і лише 49. Дерево, у якому кожен вузол має одного нащадка, це зв'язний список. Балансувальні дерева (AVL, червоно-чорні) вирішують це, наше просте дерево ні. Рекурсія теж має глибину h, тому вироджене дерево з сотень тисяч вузлів переповнить стек.",
      "<b>Видалення</b> має три випадки. Лист: <code>free</code> і повернути <code>NULL</code>. Один нащадок: <code>free</code> і повернути цього нащадка. Два нащадки: знаходимо спадкоємця in-order, тобто найменший ключ правого піддерева (йдемо вліво до кінця), копіюємо його ключ у вузол і видаляємо спадкоємця з правого піддерева. У спадкоємця немає лівого нащадка, тож це вже випадок 1 або 2. Його ключ більший за все ліве й менший за все праве, тому властивість BST зберігається, див. приклад 3.",
      "Типові помилки. Забути присвоїти результат: після <code>bst_delete(root, key);</code> без <code>root =</code> корінь міг бути звільнений, і ви тримаєте висячий вказівник. Видалити вузол із двома нащадками простим <code>free</code> (приклад 4): піддерева втрачені. Забути <code>free</code> при видаленні: вузол випав із дерева, але лишився в пам'яті, і LeakSanitizer це покаже. Після <code>free</code> вказівник на вузол ніколи не використовуємо. Поведінку перевіряйте in-order виводом: вона має залишатися відсортованою після кожного видалення.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

Node *bst_insert(Node *root, int key) {
    if (root == NULL) {
        Node *n = malloc(sizeof *n);
        if (n == NULL) {
            return NULL;
        }
        n->key = key;
        n->left = NULL;
        n->right = NULL;
        return n;
    }
    if (key < root->key) {
        root->left = bst_insert(root->left, key);
    } else if (key > root->key) {
        root->right = bst_insert(root->right, key);
    }
    return root;
}

int bst_contains(const Node *root, int key, int *cmp) {
    while (root != NULL) {
        (*cmp)++;
        if (key == root->key) {
            return 1;
        }
        root = key < root->key ? root->left : root->right;
    }
    return 0;
}

void bst_inorder(const Node *root) {
    if (root == NULL) {
        return;
    }
    bst_inorder(root->left);
    printf(" %d", root->key);
    bst_inorder(root->right);
}

void bst_destroy(Node *root) {
    if (root == NULL) {
        return;
    }
    bst_destroy(root->left);
    bst_destroy(root->right);
    free(root);
}

int main(void) {
    int keys[] = {50, 30, 70, 20, 40, 60, 80, 40};
    Node *root = NULL;
    for (size_t i = 0; i < sizeof keys / sizeof keys[0]; i++) {
        root = bst_insert(root, keys[i]);
    }
    printf("in-order:");
    bst_inorder(root);
    printf("\n");
    int queries[] = {60, 65};
    for (size_t i = 0; i < 2; i++) {
        int cmp = 0;
        int found = bst_contains(root, queries[i], &cmp);
        printf("пошук %d: %s, порівнянь %d\n", queries[i], found ? "є" : "немає", cmp);
    }
    bst_destroy(root);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

Node *bst_insert(Node *root, int key) {
    if (root == NULL) {
        Node *n = malloc(sizeof *n);
        if (n == NULL) {
            return NULL;
        }
        n->key = key;
        n->left = NULL;
        n->right = NULL;
        return n;
    }
    if (key < root->key) {
        root->left = bst_insert(root->left, key);
    } else if (key > root->key) {
        root->right = bst_insert(root->right, key);
    }
    return root;
}

int bst_height(const Node *root) {
    if (root == NULL) {
        return 0;
    }
    int l = bst_height(root->left);
    int r = bst_height(root->right);
    return 1 + (l > r ? l : r);
}

int bst_contains(const Node *root, int key, int *cmp) {
    while (root != NULL) {
        (*cmp)++;
        if (key == root->key) {
            return 1;
        }
        root = key < root->key ? root->left : root->right;
    }
    return 0;
}

void bst_destroy(Node *root) {
    if (root == NULL) {
        return;
    }
    bst_destroy(root->left);
    bst_destroy(root->right);
    free(root);
}

static void report(const char *name, const int *keys, size_t n) {
    Node *root = NULL;
    for (size_t i = 0; i < n; i++) {
        root = bst_insert(root, keys[i]);
    }
    int cmp = 0;
    for (int k = 1; k <= 15; k++) {
        bst_contains(root, k, &cmp);
    }
    printf("%s: висота %d, порівнянь на 15 пошуків %d\n", name, bst_height(root), cmp);
    bst_destroy(root);
}

int main(void) {
    int sorted[15];
    for (int i = 0; i < 15; i++) {
        sorted[i] = i + 1;
    }
    int mixed[] = {8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15};
    report("за зростанням", sorted, 15);
    report("перемішано   ", mixed, 15);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

Node *bst_insert(Node *root, int key) {
    if (root == NULL) {
        Node *n = malloc(sizeof *n);
        if (n == NULL) {
            return NULL;
        }
        n->key = key;
        n->left = NULL;
        n->right = NULL;
        return n;
    }
    if (key < root->key) {
        root->left = bst_insert(root->left, key);
    } else if (key > root->key) {
        root->right = bst_insert(root->right, key);
    }
    return root;
}

static const Node *bst_min(const Node *n) {
    while (n->left != NULL) {
        n = n->left;
    }
    return n;
}

Node *bst_delete(Node *root, int key) {
    if (root == NULL) {
        return NULL;
    }
    if (key < root->key) {
        root->left = bst_delete(root->left, key);
    } else if (key > root->key) {
        root->right = bst_delete(root->right, key);
    } else if (root->left == NULL || root->right == NULL) {
        Node *child = root->left != NULL ? root->left : root->right;
        free(root);
        return child;
    } else {
        root->key = bst_min(root->right)->key;
        root->right = bst_delete(root->right, root->key);
    }
    return root;
}

void bst_inorder(const Node *root) {
    if (root == NULL) {
        return;
    }
    bst_inorder(root->left);
    printf(" %d", root->key);
    bst_inorder(root->right);
}

void bst_destroy(Node *root) {
    if (root == NULL) {
        return;
    }
    bst_destroy(root->left);
    bst_destroy(root->right);
    free(root);
}

int main(void) {
    int keys[] = {50, 30, 70, 20, 40, 60, 80, 65};
    Node *root = NULL;
    for (size_t i = 0; i < sizeof keys / sizeof keys[0]; i++) {
        root = bst_insert(root, keys[i]);
    }
    int del[] = {20, 60, 50, 99};
    const char *why[] = {"лист", "один нащадок", "два нащадки (корінь)", "немає такого ключа"};
    printf("старт   :");
    bst_inorder(root);
    printf("\n");
    for (size_t i = 0; i < 4; i++) {
        root = bst_delete(root, del[i]);
        printf("-%d (%s):", del[i], why[i]);
        bst_inorder(root);
        printf("\n");
    }
    bst_destroy(root);
    return 0;
}
`,
      String.raw`// фрагмент: так видаляти не можна, піддерева вузла з двома нащадками губляться
if (key == root->key) {
    free(root);
    return NULL;
}
// ліве й праве піддерево були досяжні лише через root: після free вони
// недосяжні, але не звільнені, і LeakSanitizer це покаже; потрібні три випадки
`,
      String.raw`// не компілюється: root це вказівник, до поля через вказівник звертаються стрілкою
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
} Node;

int main(void) {
    Node *root = calloc(1, sizeof *root);
    if (root == NULL) {
        return 1;
    }
    printf("%d\n", root.key);
    free(root);
    return 0;
}
`,
    ],
    note: "Усі операції BST коштують O(h), а не гарантовано O(log n): висоту визначає порядок вставки. Видалення має три випадки, і результат завжди присвоюйте назад: root = bst_delete(root, key). Дерево володіє вузлами.",
    work: "Дерева пошуку лежать в основі впорядкованих словників і множин (std::map, TreeMap), індексів баз даних (B-дерева як розвиток ідеї), планувальників задач і файлових систем. Збалансовані варіанти забезпечують O(log n) без залежності від порядку даних.",
    tasks: [
      "Чому обхід in-order завжди дає ключі за зростанням і від чого залежить складність пошуку в BST?",
      "Опишіть три випадки видалення вузла й поясніть, чому для вузла з двома нащадками береться мінімум правого піддерева.",
    ],
  },
  {
    t: "Купа й пріоритетна черга",
    ch: "Структури даних",
    adv: true,
    easy: "Купа схожа на чергу до лікаря з пріоритетом: найтерміновіший пацієнт завжди першим, а решта лише приблизно впорядковані. Нам не треба тримати всіх по порядку, потрібно лише швидко діставати найважливішого.",
    p: [
      "Часто потрібно знову й знову діставати найменший (або найважливіший) елемент: планувальник задач, алгоритм Дейкстри, відбір k найкращих. Відсортований масив робить вставку за O(n), неупорядкований шукає мінімум за O(n). <b>Бінарна купа</b> дає і вставку, і виймання мінімуму за O(log n).",
      "Купа це повне бінарне дерево, записане в масиві без жодного вказівника. Вузол <code>i</code> має батька <code>(i - 1) / 2</code> і дітей <code>2i + 1</code> та <code>2i + 2</code>. Інваріант min-купи: кожен батько не більший за своїх дітей, тому мінімум завжди лежить у <code>data[0]</code>. Купа <b>не відсортована</b>: приклад 1 дає масив <code>1 3 2 5 9 8 7</code>, а відсортований порядок з'являється лише при послідовних <code>pop</code>.",
      "Вставка кладе елемент у кінець (індекс <code>len</code>) і <b>піднімає</b> його: поки батько більший, міняємо їх місцями. Підйомів не більше, ніж рівнів дерева, тобто log2 n. Виймання забирає корінь, ставить на його місце останній елемент і <b>опускає</b>: обираємо меншого з двох дітей, міняємося з ним і так до відновлення інваріанта. Обидві операції O(log n).",
      "Пам'ять влаштована як у векторі з уроку 81: <code>realloc</code> із подвоєнням місткості, один власник, <code>heap_destroy</code> звільняє масив і структуру. Елементи <code>int</code> копіюються в масив. У прикладі 3 копіюються цілі структури <code>Job</code>, а поле <code>name</code> це вказівник на рядковий літерал: купа ним не володіє, і це треба знати, інакше хтось спробує зробити <code>free</code> літерала.",
      "Лічильник показує реальну ціну. У прикладі 2 тисяча випадкових значень дала 2144 порівняння при вставках: у середньому близько двох на елемент, бо новий елемент рідко піднімається високо. Виймання коштувало 15007 порівнянь, тобто близько 15 на елемент. Верхня межа два порівняння на рівень, log2 1000 ≈ 10, отже до 20. Разом n вставок і n виймань це O(n log n): так працює heap sort.",
      "Купа не гарантує порядок серед <b>рівних</b> пріоритетів. Щоб вийшла чесна черга FIFO, додаємо до кожного елемента номер надходження <code>seq</code> і порівнюємо пару (пріоритет, <code>seq</code>), як у функції <code>before</code> з прикладу 3: завдання «аварія», «помилка входу», «збій диска» мають однаковий пріоритет 1 і виходять у порядку надходження. Без <code>seq</code> їхній порядок був би довільним.",
      "Типові помилки. Виймання з порожньої купи: перевіряйте <code>len</code> і повертайте код помилки; <code>assert</code> з прикладу 4 зупиняє програму, але при збірці з <code>NDEBUG</code> його вимикають, тож замість перевірки він не годиться. Для беззнакового <code>i = 0</code> вираз <code>i - 1</code> дає <code>SIZE_MAX</code>, тому цикл підйому має умову <code>i &gt; 0</code>. Змінити значення елемента всередині купи напряму означає зламати інваріант, а пошук довільного елемента коштує O(n).",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
} Heap;

Heap *heap_create(void) {
    return calloc(1, sizeof(Heap));
}

void heap_destroy(Heap *h) {
    if (h == NULL) {
        return;
    }
    free(h->data);
    free(h);
}

static void swap_int(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int heap_push(Heap *h, int x) {
    if (h->len == h->cap) {
        size_t cap = h->cap == 0 ? 4 : h->cap * 2;
        int *p = realloc(h->data, cap * sizeof *p);
        if (p == NULL) {
            return -1;
        }
        h->data = p;
        h->cap = cap;
    }
    size_t i = h->len++;
    h->data[i] = x;
    while (i > 0) {
        size_t parent = (i - 1) / 2;
        if (h->data[parent] <= h->data[i]) {
            break;
        }
        swap_int(&h->data[parent], &h->data[i]);
        i = parent;
    }
    return 0;
}

int heap_pop(Heap *h, int *out) {
    if (h->len == 0) {
        return -1;
    }
    *out = h->data[0];
    h->data[0] = h->data[--h->len];
    size_t i = 0;
    for (;;) {
        size_t l = 2 * i + 1;
        size_t r = l + 1;
        size_t m = i;
        if (l < h->len && h->data[l] < h->data[m]) {
            m = l;
        }
        if (r < h->len && h->data[r] < h->data[m]) {
            m = r;
        }
        if (m == i) {
            break;
        }
        swap_int(&h->data[i], &h->data[m]);
        i = m;
    }
    return 0;
}

int main(void) {
    int in[] = {5, 3, 8, 1, 9, 2, 7};
    Heap *h = heap_create();
    if (h == NULL) {
        return 1;
    }
    for (size_t i = 0; i < sizeof in / sizeof in[0]; i++) {
        heap_push(h, in[i]);
    }
    printf("масив купи:");
    for (size_t i = 0; i < h->len; i++) {
        printf(" %d", h->data[i]);
    }
    printf("\nпо черзі:");
    int x;
    while (heap_pop(h, &x) == 0) {
        printf(" %d", x);
    }
    printf("\n");
    heap_destroy(h);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
    size_t cmps;
} Heap;

Heap *heap_create(void) {
    return calloc(1, sizeof(Heap));
}

void heap_destroy(Heap *h) {
    if (h == NULL) {
        return;
    }
    free(h->data);
    free(h);
}

static void swap_int(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int heap_push(Heap *h, int x) {
    if (h->len == h->cap) {
        size_t cap = h->cap == 0 ? 4 : h->cap * 2;
        int *p = realloc(h->data, cap * sizeof *p);
        if (p == NULL) {
            return -1;
        }
        h->data = p;
        h->cap = cap;
    }
    size_t i = h->len++;
    h->data[i] = x;
    while (i > 0) {
        size_t parent = (i - 1) / 2;
        h->cmps++;
        if (h->data[parent] <= h->data[i]) {
            break;
        }
        swap_int(&h->data[parent], &h->data[i]);
        i = parent;
    }
    return 0;
}

int heap_pop(Heap *h, int *out) {
    if (h->len == 0) {
        return -1;
    }
    *out = h->data[0];
    h->data[0] = h->data[--h->len];
    size_t i = 0;
    for (;;) {
        size_t l = 2 * i + 1;
        size_t r = l + 1;
        size_t m = i;
        if (l < h->len) {
            h->cmps++;
        }
        if (l < h->len && h->data[l] < h->data[m]) {
            m = l;
        }
        if (r < h->len) {
            h->cmps++;
        }
        if (r < h->len && h->data[r] < h->data[m]) {
            m = r;
        }
        if (m == i) {
            break;
        }
        swap_int(&h->data[i], &h->data[m]);
        i = m;
    }
    return 0;
}

int main(void) {
    const int n = 1000;
    Heap *h = heap_create();
    if (h == NULL) {
        return 1;
    }
    uint32_t seed = 12345;
    for (int i = 0; i < n; i++) {
        seed = seed * 1103515245u + 12345u;
        heap_push(h, (int)((seed >> 8) % 100000));
    }
    printf("n=%d, порівнянь при вставці: %zu\n", n, h->cmps);
    h->cmps = 0;
    int prev = -1;
    int sorted = 1;
    int x;
    while (heap_pop(h, &x) == 0) {
        if (x < prev) {
            sorted = 0;
        }
        prev = x;
    }
    printf("порівнянь при вийманні: %zu, відсортовано: %s\n", h->cmps, sorted ? "так" : "ні");
    heap_destroy(h);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int prio;
    unsigned seq;
    const char *name;
} Job;

typedef struct {
    Job *data;
    size_t len;
    size_t cap;
    unsigned next_seq;
} PQ;

static int before(const Job *a, const Job *b) {
    if (a->prio != b->prio) {
        return a->prio < b->prio;
    }
    return a->seq < b->seq;
}

PQ *pq_create(void) {
    return calloc(1, sizeof(PQ));
}

void pq_destroy(PQ *q) {
    if (q == NULL) {
        return;
    }
    free(q->data);
    free(q);
}

int pq_push(PQ *q, int prio, const char *name) {
    if (q->len == q->cap) {
        size_t cap = q->cap == 0 ? 4 : q->cap * 2;
        Job *p = realloc(q->data, cap * sizeof *p);
        if (p == NULL) {
            return -1;
        }
        q->data = p;
        q->cap = cap;
    }
    size_t i = q->len++;
    q->data[i] = (Job){prio, q->next_seq++, name};
    while (i > 0 && before(&q->data[i], &q->data[(i - 1) / 2])) {
        Job t = q->data[i];
        q->data[i] = q->data[(i - 1) / 2];
        q->data[(i - 1) / 2] = t;
        i = (i - 1) / 2;
    }
    return 0;
}

int pq_pop(PQ *q, Job *out) {
    if (q->len == 0) {
        return -1;
    }
    *out = q->data[0];
    q->data[0] = q->data[--q->len];
    size_t i = 0;
    for (;;) {
        size_t m = i;
        size_t l = 2 * i + 1;
        size_t r = l + 1;
        if (l < q->len && before(&q->data[l], &q->data[m])) {
            m = l;
        }
        if (r < q->len && before(&q->data[r], &q->data[m])) {
            m = r;
        }
        if (m == i) {
            break;
        }
        Job t = q->data[i];
        q->data[i] = q->data[m];
        q->data[m] = t;
        i = m;
    }
    return 0;
}

int main(void) {
    PQ *q = pq_create();
    if (q == NULL) {
        return 1;
    }
    pq_push(q, 2, "резервна копія");
    pq_push(q, 1, "аварія");
    pq_push(q, 3, "звіт");
    pq_push(q, 1, "помилка входу");
    pq_push(q, 2, "оновлення");
    pq_push(q, 1, "збій диска");
    Job j;
    while (pq_pop(q, &j) == 0) {
        printf("пріоритет %d: %s\n", j.prio, j.name);
    }
    pq_destroy(q);
    return 0;
}
`,
      String.raw`// аварія: pop із порожньої купи, assert зупиняє програму
#include <assert.h>
#include <stdio.h>

typedef struct {
    int data[8];
    size_t len;
} Heap;

int heap_top(const Heap *h) {
    assert(h->len > 0);
    return h->data[0];
}

int main(void) {
    Heap h = {{0}, 0};
    printf("верх: %d\n", heap_top(&h));
    return 0;
}
`,
    ],
    note: "Купа не відсортована: гарантовано лише те, що батько не більший за дітей, а найменший лежить у корені. Вставка й виймання коштують O(log n). Для FIFO серед рівних пріоритетів додавайте номер надходження.",
    work: "Пріоритетні черги тримають планувальники задач і таймери, алгоритми Дейкстри й A*, злиття відсортованих потоків і відбір top-k елементів. У бібліотеках це heapq у Python і priority_queue у C++.",
    tasks: [
      "Як за індексом вузла знайти його батька й дітей у масиві-купі і чому корінь завжди найменший?",
      "Опишіть вставку та виймання з купи, поясніть, чому обидві O(log n) і як зробити порядок FIFO для рівних пріоритетів.",
    ],
  },
  {
    t: "Графи: списки суміжності й BFS",
    ch: "Структури даних",
    adv: true,
    easy: "Граф це схема метро: станції це вершини, перегони між ними ребра. Обхід у ширину працює як хвиля від камінця в воді: спершу сусіди, потім сусіди сусідів, тож до кожної станції ви їдете найменшою кількістю зупинок.",
    p: [
      "Граф складається з вершин і ребер: дороги між містами, дружба в соцмережі, залежності між пакетами. Вершини нумеруємо від 0 до n-1. Є два основні подання. <b>Матриця суміжності</b> n на n: пам'ять O(n²), перевірка ребра O(1). <b>Списки суміжності</b>: пам'ять O(V+E), перегляд сусідів пропорційний їхній кількості. Більшість реальних графів розріджені, тому беремо списки.",
      "Структура <code>Graph</code> має масив <code>adj</code>, де <code>adj[v]</code> це голова списку вузлів <code>Edge</code> (поля <code>to</code> і <code>next</code>). Неорієнтоване ребро це дві дуги, тож <code>graph_add_edge</code> додає два записи, а <code>edges</code> рахує саме записи: у прикладі 1 п'ять ребер дали 10 записів. Додаємо на початок списку за O(1), тому сусіди йдуть у зворотному порядку вставки (<code>0: 2 1</code>). Порядок сусідів змінює порядок обходу, але не відстані.",
      "Власник один: граф. Він володіє масивом <code>adj</code> і всіма вузлами <code>Edge</code>. <code>graph_destroy</code> проходить кожен список, як у уроці 82, і лише потім звільняє <code>adj</code> та сам граф. Вершини не містять вказівників одна на одну, а лише числа-індекси, тож висячих вказівників між вершинами не буває: це сильна сторона подання через індекси.",
      "<b>BFS</b>, обхід у ширину, потребує черги (масив розміром n з індексами <code>head</code> і <code>tail</code>, як у уроці 83) і масиву відстаней <code>dist</code>, заповненого значеннями -1 («не бачили»). Стартова вершина отримує 0 і йде в чергу. Беремо вершину з голови, і для кожного сусіда з <code>dist == -1</code> ставимо <code>dist[v] + 1</code> та кладемо в чергу. Відвідану вершину позначаємо <b>при постановці в чергу</b>, а не при вийманні, інакше одна вершина потрапляла б у чергу кілька разів. Див. приклад 2.",
      "Чому BFS знаходить найкоротші шляхи за кількістю ребер: вершини виймаються з черги в порядку зростання відстані, тож перше досягнення вершини відбувається за мінімум кроків. Масив <code>parent</code> запам'ятовує, звідки ми прийшли, і шлях відновлюється рекурсією від цілі до старту. У прикладі 3 сітка 4 на 3 з перегородкою дала шлях <code>0 -&gt; 4 -&gt; 8 -&gt; 9 -&gt; 10 -&gt; 11</code> довжини 5.",
      "Складність: кожну вершину виймаємо один раз, кожен запис у списках переглядаємо один раз, разом O(V+E). Приклад 3 довів це лічильником: у списках 30 записів, переглянуто рівно 30. Приклад 2 показує ще одну властивість: вершина 5 лишилася з відстанню -1, бо BFS бачить лише <b>компоненту зв'язності</b> старту.",
      "Типові помилки. Індекс вершини поза діапазоном <code>[0, n)</code> у <code>graph_add_edge</code> це запис за межі масиву, тож перевіряйте його. Невстановлене <code>dist</code>: сміття сприйметься як відстань. Позначення при вийманні замість постановки роздуває чергу. Приклад 4 не збереться: <code>Edge *adj[4]</code> це масив, його не можна присвоїти результатом <code>calloc</code>; для динамічного масиву голів потрібен <code>Edge **adj</code>.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Edge {
    int to;
    struct Edge *next;
} Edge;

typedef struct {
    int n;
    Edge **adj;
    size_t edges;
} Graph;

Graph *graph_create(int n) {
    Graph *g = malloc(sizeof *g);
    if (g == NULL) {
        return NULL;
    }
    g->adj = calloc((size_t)n, sizeof *g->adj);
    if (g->adj == NULL) {
        free(g);
        return NULL;
    }
    g->n = n;
    g->edges = 0;
    return g;
}

void graph_destroy(Graph *g) {
    if (g == NULL) {
        return;
    }
    for (int v = 0; v < g->n; v++) {
        Edge *e = g->adj[v];
        while (e != NULL) {
            Edge *next = e->next;
            free(e);
            e = next;
        }
    }
    free(g->adj);
    free(g);
}

static int add_arc(Graph *g, int from, int to) {
    Edge *e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->to = to;
    e->next = g->adj[from];
    g->adj[from] = e;
    g->edges++;
    return 0;
}

int graph_add_edge(Graph *g, int a, int b) {
    if (add_arc(g, a, b) != 0) {
        return -1;
    }
    return add_arc(g, b, a);
}

static const int PAIRS[][2] = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};

int main(void) {
    Graph *g = graph_create(6);
    if (g == NULL) {
        return 1;
    }
    for (size_t i = 0; i < sizeof PAIRS / sizeof PAIRS[0]; i++) {
        graph_add_edge(g, PAIRS[i][0], PAIRS[i][1]);
    }
    for (int v = 0; v < g->n; v++) {
        printf("%d:", v);
        for (const Edge *e = g->adj[v]; e != NULL; e = e->next) {
            printf(" %d", e->to);
        }
        printf("\n");
    }
    printf("вершин %d, дуг у списках %zu\n", g->n, g->edges);
    graph_destroy(g);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Edge {
    int to;
    struct Edge *next;
} Edge;

typedef struct {
    int n;
    Edge **adj;
    size_t edges;
} Graph;

Graph *graph_create(int n) {
    Graph *g = malloc(sizeof *g);
    if (g == NULL) {
        return NULL;
    }
    g->adj = calloc((size_t)n, sizeof *g->adj);
    if (g->adj == NULL) {
        free(g);
        return NULL;
    }
    g->n = n;
    g->edges = 0;
    return g;
}

void graph_destroy(Graph *g) {
    if (g == NULL) {
        return;
    }
    for (int v = 0; v < g->n; v++) {
        Edge *e = g->adj[v];
        while (e != NULL) {
            Edge *next = e->next;
            free(e);
            e = next;
        }
    }
    free(g->adj);
    free(g);
}

static int add_arc(Graph *g, int from, int to) {
    Edge *e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->to = to;
    e->next = g->adj[from];
    g->adj[from] = e;
    g->edges++;
    return 0;
}

int graph_add_edge(Graph *g, int a, int b) {
    if (add_arc(g, a, b) != 0) {
        return -1;
    }
    return add_arc(g, b, a);
}

int bfs(const Graph *g, int src, int *dist, int *parent, size_t *scans) {
    int *queue = malloc((size_t)g->n * sizeof *queue);
    if (queue == NULL) {
        return -1;
    }
    for (int v = 0; v < g->n; v++) {
        dist[v] = -1;
        parent[v] = -1;
    }
    size_t head = 0;
    size_t tail = 0;
    dist[src] = 0;
    queue[tail++] = src;
    while (head < tail) {
        int v = queue[head++];
        printf(" %d", v);
        for (const Edge *e = g->adj[v]; e != NULL; e = e->next) {
            (*scans)++;
            if (dist[e->to] == -1) {
                dist[e->to] = dist[v] + 1;
                parent[e->to] = v;
                queue[tail++] = e->to;
            }
        }
    }
    free(queue);
    return 0;
}

static const int PAIRS[][2] = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};

int main(void) {
    Graph *g = graph_create(6);
    int dist[6];
    int parent[6];
    if (g == NULL) {
        return 1;
    }
    for (size_t i = 0; i < sizeof PAIRS / sizeof PAIRS[0]; i++) {
        graph_add_edge(g, PAIRS[i][0], PAIRS[i][1]);
    }
    size_t scans = 0;
    printf("порядок обходу:");
    bfs(g, 0, dist, parent, &scans);
    printf("\n");
    for (int v = 0; v < g->n; v++) {
        if (dist[v] < 0) {
            printf("%d: недосяжна\n", v);
        } else {
            printf("%d: відстань %d\n", v, dist[v]);
        }
    }
    printf("переглянуто записів у списках: %zu із %zu\n", scans, g->edges);
    graph_destroy(g);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct Edge {
    int to;
    struct Edge *next;
} Edge;

typedef struct {
    int n;
    Edge **adj;
    size_t edges;
} Graph;

Graph *graph_create(int n) {
    Graph *g = malloc(sizeof *g);
    if (g == NULL) {
        return NULL;
    }
    g->adj = calloc((size_t)n, sizeof *g->adj);
    if (g->adj == NULL) {
        free(g);
        return NULL;
    }
    g->n = n;
    g->edges = 0;
    return g;
}

void graph_destroy(Graph *g) {
    if (g == NULL) {
        return;
    }
    for (int v = 0; v < g->n; v++) {
        Edge *e = g->adj[v];
        while (e != NULL) {
            Edge *next = e->next;
            free(e);
            e = next;
        }
    }
    free(g->adj);
    free(g);
}

static int add_arc(Graph *g, int from, int to) {
    Edge *e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->to = to;
    e->next = g->adj[from];
    g->adj[from] = e;
    g->edges++;
    return 0;
}

int graph_add_edge(Graph *g, int a, int b) {
    if (add_arc(g, a, b) != 0) {
        return -1;
    }
    return add_arc(g, b, a);
}

int bfs(const Graph *g, int src, int *dist, int *parent, size_t *scans) {
    int *queue = malloc((size_t)g->n * sizeof *queue);
    if (queue == NULL) {
        return -1;
    }
    for (int v = 0; v < g->n; v++) {
        dist[v] = -1;
        parent[v] = -1;
    }
    size_t head = 0;
    size_t tail = 0;
    dist[src] = 0;
    queue[tail++] = src;
    while (head < tail) {
        int v = queue[head++];
        printf(" %d", v);
        for (const Edge *e = g->adj[v]; e != NULL; e = e->next) {
            (*scans)++;
            if (dist[e->to] == -1) {
                dist[e->to] = dist[v] + 1;
                parent[e->to] = v;
                queue[tail++] = e->to;
            }
        }
    }
    free(queue);
    return 0;
}

static void print_path(const int *parent, int v) {
    if (parent[v] != -1) {
        print_path(parent, parent[v]);
        printf(" ->");
    }
    printf(" %d", v);
}

int main(void) {
    const int w = 4;
    const int h = 3;
    Graph *g = graph_create(w * h);
    int dist[12];
    int parent[12];
    if (g == NULL) {
        return 1;
    }
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
            int v = y * w + x;
            if (x + 1 < w && !(x == 1 && y < 2)) {
                graph_add_edge(g, v, v + 1);
            }
            if (y + 1 < h) {
                graph_add_edge(g, v, v + w);
            }
        }
    }
    size_t scans = 0;
    printf("порядок обходу:");
    bfs(g, 0, dist, parent, &scans);
    printf("\nнайкоротший шлях 0 до 11, довжина %d:", dist[11]);
    print_path(parent, 11);
    printf("\nзаписів у списках %zu, переглянуто %zu: кожну рівно раз\n", g->edges, scans);
    graph_destroy(g);
    return 0;
}
`,
      String.raw`// не компілюється: масив не можна присвоїти, список суміжності виділяють як вказівник на вказівники
#include <stdio.h>
#include <stdlib.h>

typedef struct Edge {
    int to;
    struct Edge *next;
} Edge;

int main(void) {
    Edge *adj[4];
    adj = calloc(4, sizeof *adj);
    printf("%d\n", adj[0] == NULL);
    return 0;
}
`,
    ],
    note: "Списки суміжності займають O(V+E) пам'яті, BFS працює за O(V+E). Позначайте вершину відвідуваною в момент постановки в чергу. Граф володіє масивом голів і всіма вузлами списків.",
    work: "BFS шукає найкоротший шлях у лабіринтах і на картах, знаходить знайомих у соцмережах на заданій відстані, обходить посилання в пошукових краулерах, перевіряє зв'язність комп'ютерних мереж і розв'язує головоломки з мінімальною кількістю ходів.",
    tasks: [
      "Чим списки суміжності кращі за матрицю для розрідженого графа і чому неорієнтоване ребро дає два записи?",
      "Чому BFS знаходить найкоротший шлях за кількістю ребер і чому вершину позначають при постановці в чергу?",
    ],
  },
  {
    t: "Префіксне дерево (trie)",
    ch: "Структури даних",
    adv: true,
    easy: "Префіксне дерево схоже на розгалужений покажчик: слова з однаковим початком ділять один шлях букв. Пройти слід «car» один раз, а далі дорога розходиться на card, care і cart.",
    p: [
      "Потрібно швидко відповісти на два питання: чи є слово у словнику і які слова починаються з префікса (автодоповнення, словники ігор, маршрутизація IP). Хеш-таблиця знає слова, але нічого не знає про префікси. Відсортований масив шукає префікс за O(log n), але вставка в нього дорога. <b>Trie</b> шукає слово довжини L за O(L) незалежно від кількості слів.",
      "Вузол містить масив із 26 вказівників на дітей (за буквами a..z) і прапор <code>terminal</code>: «тут закінчується слово». Корінь порожній. Слово це шлях від кореня, де літера <code>c</code> веде в <code>kid[c - 'a']</code>. Самих слів у вузлах немає, слово це шлях плюс прапор <code>terminal</code> у кінці: у прикладі 1 <code>ca</code> є префіксом, але не словом.",
      "Вставка йде за буквами слова, відсутнього сина створює через <code>calloc</code> (він обнуляє всі 26 вказівників і прапор), а в кінці ставить <code>terminal</code>. Лічильник <code>nodes</code> показує ціну в пам'яті. Індекс <code>c - 'a'</code> поза діапазоном 0..25 це вихід за межі масиву, тобто UB, тож літеру спершу перевіряємо. Наш trie приймає лише малі латинські літери.",
      "Пошук слова і пошук префікса роблять той самий спуск (<code>walk</code>): <code>NULL</code> означає, що шляху немає. Різниця лише в кінці: слово вимагає <code>terminal</code>, префікс ні. Вартість O(L) не залежить від кількості слів: у прикладі 1 для <code>cart</code> спуск зупиняється на третій букві, хоч слів у дереві шість.",
      "Обхід дітей у порядку a..z віддає слова в <b>алфавітному порядку</b> без сортування. Приклад 2 друкує автодоповнення для префікса <code>te</code>: <code>tea team teapot tee ten tent</code>. Функція <code>collect</code> накопичує букви в буфері і друкує його, коли зустріла <code>terminal</code>. Глибина рекурсії дорівнює довжині слова, а довжину буфера ми перевіряємо перед копіюванням префікса.",
      "Спільні префікси економлять вузли. У прикладі 3 шість слів мають 43 букви, але дерево має лише 17 вузлів разом із коренем, бо <code>inter</code> ділять усі слова. Зате кожен вузол несе 26 вказівників, тому для розріджених словників пам'яті йде багато; виходом є списки дітей або стиснуте дерево. Розмір вузла в байтах залежить від платформи, тож ми міряємо вузлами, а не <code>sizeof</code>.",
      "Власник: trie володіє всіма вузлами. <code>trie_destroy</code> рекурсивно звільняє дітей раніше за вузол, як у дереві пошуку; забутий обхід дає витік, який покаже LeakSanitizer. Повторна вставка того ж слова не збільшує <code>words</code>, бо ми дивимося на <code>terminal</code>. Приклад 4 не збереться: <code>kid</code> це масив усередині структури, йому не можна присвоїти результат <code>calloc</code>; calloc потрібен для самого вузла.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ALPHA 26

typedef struct TrieNode {
    struct TrieNode *kid[ALPHA];
    int terminal;
    int below;
} TrieNode;

typedef struct {
    TrieNode *root;
    size_t nodes;
    size_t words;
} Trie;

static TrieNode *node_new(void) {
    return calloc(1, sizeof(TrieNode));
}

Trie *trie_create(void) {
    Trie *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->root = node_new();
    if (t->root == NULL) {
        free(t);
        return NULL;
    }
    t->nodes = 1;
    t->words = 0;
    return t;
}

static void node_free(TrieNode *n) {
    if (n == NULL) {
        return;
    }
    for (int i = 0; i < ALPHA; i++) {
        node_free(n->kid[i]);
    }
    free(n);
}

void trie_destroy(Trie *t) {
    if (t == NULL) {
        return;
    }
    node_free(t->root);
    free(t);
}

int trie_insert(Trie *t, const char *w) {
    TrieNode *n = t->root;
    for (; *w != '\0'; w++) {
        int c = *w - 'a';
        if (c < 0 || c >= ALPHA) {
            return -1;
        }
        if (n->kid[c] == NULL) {
            n->kid[c] = node_new();
            if (n->kid[c] == NULL) {
                return -1;
            }
            t->nodes++;
        }
        n = n->kid[c];
    }
    if (!n->terminal) {
        n->terminal = 1;
        t->words++;
    }
    return 0;
}

static const TrieNode *walk(const Trie *t, const char *s) {
    const TrieNode *n = t->root;
    for (; *s != '\0' && n != NULL; s++) {
        int c = *s - 'a';
        n = (c < 0 || c >= ALPHA) ? NULL : n->kid[c];
    }
    return n;
}

int trie_contains(const Trie *t, const char *w) {
    const TrieNode *n = walk(t, w);
    return n != NULL && n->terminal;
}

int trie_has_prefix(const Trie *t, const char *p) {
    return walk(t, p) != NULL;
}

static void collect(const TrieNode *n, char *buf, size_t len) {
    if (n->terminal) {
        buf[len] = '\0';
        printf(" %s", buf);
    }
    for (int i = 0; i < ALPHA; i++) {
        if (n->kid[i] != NULL) {
            buf[len] = (char)('a' + i);
            collect(n->kid[i], buf, len + 1);
        }
    }
}

void trie_complete(const Trie *t, const char *prefix) {
    const TrieNode *n = walk(t, prefix);
    char buf[64];
    size_t len = strlen(prefix);
    if (n == NULL || len >= sizeof buf - 1) {
        return;
    }
    memcpy(buf, prefix, len);
    collect(n, buf, len);
}

int main(void) {
    Trie *t = trie_create();
    if (t == NULL) {
        return 1;
    }
    const char *words[] = {"car", "card", "care", "cat", "dog", "do", "car"};
    for (size_t i = 0; i < sizeof words / sizeof words[0]; i++) {
        trie_insert(t, words[i]);
    }
    const char *q[] = {"car", "ca", "dog", "dot", "cart"};
    for (size_t i = 0; i < sizeof q / sizeof q[0]; i++) {
        printf("%-5s слово: %d, префікс: %d\n", q[i], trie_contains(t, q[i]), trie_has_prefix(t, q[i]));
    }
    printf("слів %zu, вузлів %zu\n", t->words, t->nodes);
    trie_destroy(t);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ALPHA 26

typedef struct TrieNode {
    struct TrieNode *kid[ALPHA];
    int terminal;
    int below;
} TrieNode;

typedef struct {
    TrieNode *root;
    size_t nodes;
    size_t words;
} Trie;

static TrieNode *node_new(void) {
    return calloc(1, sizeof(TrieNode));
}

Trie *trie_create(void) {
    Trie *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->root = node_new();
    if (t->root == NULL) {
        free(t);
        return NULL;
    }
    t->nodes = 1;
    t->words = 0;
    return t;
}

static void node_free(TrieNode *n) {
    if (n == NULL) {
        return;
    }
    for (int i = 0; i < ALPHA; i++) {
        node_free(n->kid[i]);
    }
    free(n);
}

void trie_destroy(Trie *t) {
    if (t == NULL) {
        return;
    }
    node_free(t->root);
    free(t);
}

int trie_insert(Trie *t, const char *w) {
    TrieNode *n = t->root;
    for (; *w != '\0'; w++) {
        int c = *w - 'a';
        if (c < 0 || c >= ALPHA) {
            return -1;
        }
        if (n->kid[c] == NULL) {
            n->kid[c] = node_new();
            if (n->kid[c] == NULL) {
                return -1;
            }
            t->nodes++;
        }
        n = n->kid[c];
    }
    if (!n->terminal) {
        n->terminal = 1;
        t->words++;
    }
    return 0;
}

static const TrieNode *walk(const Trie *t, const char *s) {
    const TrieNode *n = t->root;
    for (; *s != '\0' && n != NULL; s++) {
        int c = *s - 'a';
        n = (c < 0 || c >= ALPHA) ? NULL : n->kid[c];
    }
    return n;
}

int trie_contains(const Trie *t, const char *w) {
    const TrieNode *n = walk(t, w);
    return n != NULL && n->terminal;
}

int trie_has_prefix(const Trie *t, const char *p) {
    return walk(t, p) != NULL;
}

static void collect(const TrieNode *n, char *buf, size_t len) {
    if (n->terminal) {
        buf[len] = '\0';
        printf(" %s", buf);
    }
    for (int i = 0; i < ALPHA; i++) {
        if (n->kid[i] != NULL) {
            buf[len] = (char)('a' + i);
            collect(n->kid[i], buf, len + 1);
        }
    }
}

void trie_complete(const Trie *t, const char *prefix) {
    const TrieNode *n = walk(t, prefix);
    char buf[64];
    size_t len = strlen(prefix);
    if (n == NULL || len >= sizeof buf - 1) {
        return;
    }
    memcpy(buf, prefix, len);
    collect(n, buf, len);
}

int main(void) {
    Trie *t = trie_create();
    if (t == NULL) {
        return 1;
    }
    const char *words[] = {"tea", "ten", "to", "team", "tent", "toad", "inn", "tee", "teapot"};
    for (size_t i = 0; i < sizeof words / sizeof words[0]; i++) {
        trie_insert(t, words[i]);
    }
    const char *prefixes[] = {"te", "to", "x", ""};
    for (size_t i = 0; i < 4; i++) {
        printf("[%s]:", prefixes[i]);
        trie_complete(t, prefixes[i]);
        printf("\n");
    }
    trie_destroy(t);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ALPHA 26

typedef struct TrieNode {
    struct TrieNode *kid[ALPHA];
    int terminal;
    int below;
} TrieNode;

typedef struct {
    TrieNode *root;
    size_t nodes;
    size_t words;
} Trie;

static TrieNode *node_new(void) {
    return calloc(1, sizeof(TrieNode));
}

Trie *trie_create(void) {
    Trie *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->root = node_new();
    if (t->root == NULL) {
        free(t);
        return NULL;
    }
    t->nodes = 1;
    t->words = 0;
    return t;
}

static void node_free(TrieNode *n) {
    if (n == NULL) {
        return;
    }
    for (int i = 0; i < ALPHA; i++) {
        node_free(n->kid[i]);
    }
    free(n);
}

void trie_destroy(Trie *t) {
    if (t == NULL) {
        return;
    }
    node_free(t->root);
    free(t);
}

int trie_insert(Trie *t, const char *w) {
    TrieNode *n = t->root;
    for (; *w != '\0'; w++) {
        int c = *w - 'a';
        if (c < 0 || c >= ALPHA) {
            return -1;
        }
        if (n->kid[c] == NULL) {
            n->kid[c] = node_new();
            if (n->kid[c] == NULL) {
                return -1;
            }
            t->nodes++;
        }
        n = n->kid[c];
    }
    if (!n->terminal) {
        n->terminal = 1;
        t->words++;
    }
    return 0;
}

static const TrieNode *walk(const Trie *t, const char *s) {
    const TrieNode *n = t->root;
    for (; *s != '\0' && n != NULL; s++) {
        int c = *s - 'a';
        n = (c < 0 || c >= ALPHA) ? NULL : n->kid[c];
    }
    return n;
}

int trie_contains(const Trie *t, const char *w) {
    const TrieNode *n = walk(t, w);
    return n != NULL && n->terminal;
}

int trie_has_prefix(const Trie *t, const char *p) {
    return walk(t, p) != NULL;
}

static void collect(const TrieNode *n, char *buf, size_t len) {
    if (n->terminal) {
        buf[len] = '\0';
        printf(" %s", buf);
    }
    for (int i = 0; i < ALPHA; i++) {
        if (n->kid[i] != NULL) {
            buf[len] = (char)('a' + i);
            collect(n->kid[i], buf, len + 1);
        }
    }
}

void trie_complete(const Trie *t, const char *prefix) {
    const TrieNode *n = walk(t, prefix);
    char buf[64];
    size_t len = strlen(prefix);
    if (n == NULL || len >= sizeof buf - 1) {
        return;
    }
    memcpy(buf, prefix, len);
    collect(n, buf, len);
}

int main(void) {
    Trie *t = trie_create();
    if (t == NULL) {
        return 1;
    }
    const char *words[] = {"inter", "internal", "internet", "interval", "intern", "interact"};
    size_t letters = 0;
    for (size_t i = 0; i < sizeof words / sizeof words[0]; i++) {
        letters += strlen(words[i]);
        trie_insert(t, words[i]);
        printf("після %-9s вузлів %zu\n", words[i], t->nodes);
    }
    printf("букв у словах %zu, вузлів у дереві %zu (з коренем)\n", letters, t->nodes);
    trie_destroy(t);
    return 0;
}
`,
      String.raw`// не компілюється: масив kid не можна присвоїти, вузли виділяють по одному й зберігають як вказівники
#include <stdio.h>
#include <stdlib.h>

typedef struct TrieNode {
    struct TrieNode *kid[26];
    int terminal;
} TrieNode;

int main(void) {
    TrieNode n;
    n.kid = calloc(26, sizeof(TrieNode *));
    printf("%d\n", n.terminal);
    return 0;
}
`,
    ],
    note: "Trie шукає слово за O(L), де L довжина слова, і віддає слова за префіксом в алфавітному порядку. Слово це шлях плюс прапор terminal. Перевіряйте діапазон літери й звільняйте дітей раніше за вузол.",
    work: "Префіксні дерева стоять за автодоповненням у пошуку й екранних клавіатурах, перевіркою правопису, словниками для ігор у слова та маршрутизацією IP-префіксів (радіксні дерева в ядрах операційних систем і роутерах).",
    tasks: [
      "Чому для «ca» у прикладі 1 префікс є, а слова немає і за що відповідає прапор terminal?",
      "Чому обхід дітей у порядку a..z дає алфавітний порядок і від чого залежить вартість пошуку слова в trie?",
    ],
  },
  {
    t: "Алгоритми сортування: merge sort і quicksort",
    ch: "Структури даних",
    adv: true,
    easy: "Merge sort схожий на злиття двох стопок карток: розділили навпіл, відсортували кожну, а потім по одній знімаєте меншу верхню картку. Quicksort ставить одну картку-опору на її місце й сортує окремо менші та більші.",
    p: [
      "У хеш-таблиці ми вже викликали <code>qsort</code>, але корисно знати, що відбувається всередині й скільки це коштує. Мірилом ми візьмемо кількість <b>порівнянь</b>, а не секунди: лічильник детермінований і показує різницю між O(n log n) та O(n²) чисто.",
      "<b>Merge sort</b> ділить проміжок <code>[lo, hi)</code> навпіл, рекурсивно сортує половини й зливає їх через допоміжний масив: два індекси, щоразу береться менший із двох елементів. Складність O(n log n) <b>завжди</b>. Приклад 1 показує: n = 8 дає 16 порівнянь, 64 дає 308, 512 дає 3952, 4096 дає 43976, а верхня межа n·log2 n для 4096 це 49152. Додаткова пам'ять O(n): один <code>tmp</code>, який виділяє й звільняє сама <code>merge_sort</code>.",
      "<b>Стабільне</b> сортування зберігає взаємний порядок рівних елементів. Merge sort стабільний, якщо при рівності брати лівий елемент: умова <code>a[j] &lt; a[i]</code> строга, з <code>&lt;=</code> стабільність зникає. Приклад 3 сортує записи (оцінка, мітка): merge залишив <code>2a 2c 2e</code> у вихідному порядку, а quicksort зі свопами видав <code>1f 1d 1b</code>. Стабільність потрібна, коли сортують за кількома ключами по черзі: спершу за другорядним, потім за головним.",
      "<b>Quicksort</b> обирає опору, розбиває елементи на менші за опору та решту, ставить опору на остаточне місце і рекурсивно сортує обидві частини. Додаткового масиву не потрібно, лише стек рекурсії, але сортування нестабільне. Складність залежить від опори: якщо розбиття ділить навпіл, виходить O(n log n); якщо опора щоразу найменша або найбільша, частини мають розмір 0 та n-1, і це O(n²).",
      "Приклад 2 на 1000 елементах це показує. З опорою «перший елемент» на вже відсортованих даних буде 499500 порівнянь (n(n-1)/2) і глибина рекурсії 999. Медіана трьох (перший, середній, останній) дає на тих самих даних 7987 порівнянь і глибину 9. На випадкових даних обидві стратегії близько 10 тисяч. Глибина рекурсії це стек: 999 кадрів переносимо, а мільйон ні. Захист: рекурсувати в меншу частину, а більшу обробляти циклом; бібліотечний introsort ще й перемикається на heap sort.",
      "Стандартний <code>qsort</code> не гарантує ні конкретного алгоритму, ні стабільності. Якщо стабільність потрібна, додайте початковий індекс як другий ключ порівняння. Компаратор не пишіть як <code>a - b</code>: різниця двох <code>int</code> може переповнитися, а це UB (фрагмент у прикладі 4). Правильно: <code>(a &gt; b) - (a &lt; b)</code>.",
      "Як вибирати. Merge sort: потрібна стабільність і гарантія O(n log n), сортування зв'язних списків і зовнішнє сортування. Quicksort: масив у пам'яті й мало зайвої пам'яті. Для коротких проміжків (приблизно до 16 елементів) швидший insertion sort, тому бібліотеки перемикаються на нього. У тестах завжди перевіряйте результат функцією <code>is_sorted</code>, як у прикладі 1. Приклад 5 показує, що буває, якщо забути злиття: <code>assert</code> на <code>is_sorted</code> зупиняє програму.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

static size_t cmps;

static int merge_sort_rec(int *a, int *tmp, size_t lo, size_t hi) {
    if (hi - lo < 2) {
        return 0;
    }
    size_t mid = lo + (hi - lo) / 2;
    merge_sort_rec(a, tmp, lo, mid);
    merge_sort_rec(a, tmp, mid, hi);
    size_t i = lo;
    size_t j = mid;
    size_t k = lo;
    while (i < mid && j < hi) {
        cmps++;
        if (a[j] < a[i]) {
            tmp[k++] = a[j++];
        } else {
            tmp[k++] = a[i++];
        }
    }
    while (i < mid) {
        tmp[k++] = a[i++];
    }
    while (j < hi) {
        tmp[k++] = a[j++];
    }
    for (k = lo; k < hi; k++) {
        a[k] = tmp[k];
    }
    return 0;
}

int merge_sort(int *a, size_t n) {
    int *tmp = malloc(n * sizeof *tmp);
    if (tmp == NULL) {
        return -1;
    }
    merge_sort_rec(a, tmp, 0, n);
    free(tmp);
    return 0;
}

static void fill(int *a, size_t n, uint32_t seed) {
    for (size_t i = 0; i < n; i++) {
        seed = seed * 1664525u + 1013904223u;
        a[i] = (int)((seed >> 12) % 100000);
    }
}

static int is_sorted(const int *a, size_t n) {
    for (size_t i = 1; i < n; i++) {
        if (a[i - 1] > a[i]) {
            return 0;
        }
    }
    return 1;
}

int main(void) {
    const size_t sizes[] = {8, 64, 512, 4096};
    for (size_t s = 0; s < 4; s++) {
        size_t n = sizes[s];
        int *a = malloc(n * sizeof *a);
        if (a == NULL) {
            return 1;
        }
        fill(a, n, 7);
        cmps = 0;
        merge_sort(a, n);
        printf("n=%-5zu порівнянь %-6zu відсортовано: %s\n", n, cmps, is_sorted(a, n) ? "так" : "ні");
        free(a);
    }
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

static size_t cmps;
static size_t max_depth;

static void swap_int(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

static size_t pick(const int *a, size_t lo, size_t hi, int median) {
    if (!median) {
        return lo;
    }
    size_t mid = lo + (hi - lo) / 2;
    size_t last = hi - 1;
    if ((a[lo] <= a[mid] && a[mid] <= a[last]) || (a[last] <= a[mid] && a[mid] <= a[lo])) {
        return mid;
    }
    if ((a[mid] <= a[lo] && a[lo] <= a[last]) || (a[last] <= a[lo] && a[lo] <= a[mid])) {
        return lo;
    }
    return last;
}

static void quick_sort(int *a, size_t lo, size_t hi, int median, size_t depth) {
    if (hi - lo < 2) {
        return;
    }
    if (depth > max_depth) {
        max_depth = depth;
    }
    swap_int(&a[lo], &a[pick(a, lo, hi, median)]);
    int pivot = a[lo];
    size_t p = lo;
    for (size_t i = lo + 1; i < hi; i++) {
        cmps++;
        if (a[i] < pivot) {
            p++;
            swap_int(&a[p], &a[i]);
        }
    }
    swap_int(&a[lo], &a[p]);
    quick_sort(a, lo, p, median, depth + 1);
    quick_sort(a, p + 1, hi, median, depth + 1);
}

static void run(const char *name, const int *src, size_t n, int median) {
    int *a = malloc(n * sizeof *a);
    if (a == NULL) {
        return;
    }
    for (size_t i = 0; i < n; i++) {
        a[i] = src[i];
    }
    cmps = 0;
    max_depth = 0;
    quick_sort(a, 0, n, median, 1);
    printf("%s: порівнянь %zu, глибина %zu\n", name, cmps, max_depth);
    free(a);
}

int main(void) {
    enum { N = 1000 };
    int sorted[N];
    int mixed[N];
    uint32_t seed = 99;
    for (int i = 0; i < N; i++) {
        sorted[i] = i;
        seed = seed * 1664525u + 1013904223u;
        mixed[i] = (int)((seed >> 12) % 100000);
    }
    run("перший, відсортований", sorted, N, 0);
    run("медіана трьох, відсортований", sorted, N, 1);
    run("перший, випадкові", mixed, N, 0);
    run("медіана трьох, випадкові", mixed, N, 1);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int score;
    char tag;
} Rec;

static void merge_sort_rec(Rec *a, Rec *tmp, size_t lo, size_t hi) {
    if (hi - lo < 2) {
        return;
    }
    size_t mid = lo + (hi - lo) / 2;
    merge_sort_rec(a, tmp, lo, mid);
    merge_sort_rec(a, tmp, mid, hi);
    size_t i = lo;
    size_t j = mid;
    size_t k = lo;
    while (i < mid && j < hi) {
        tmp[k++] = a[j].score < a[i].score ? a[j++] : a[i++];
    }
    while (i < mid) {
        tmp[k++] = a[i++];
    }
    while (j < hi) {
        tmp[k++] = a[j++];
    }
    for (k = lo; k < hi; k++) {
        a[k] = tmp[k];
    }
}

static void quick_sort(Rec *a, size_t lo, size_t hi) {
    if (hi - lo < 2) {
        return;
    }
    int pivot = a[hi - 1].score;
    size_t p = lo;
    for (size_t i = lo; i + 1 < hi; i++) {
        if (a[i].score < pivot) {
            Rec t = a[p];
            a[p] = a[i];
            a[i] = t;
            p++;
        }
    }
    Rec t = a[p];
    a[p] = a[hi - 1];
    a[hi - 1] = t;
    quick_sort(a, lo, p);
    quick_sort(a, p + 1, hi);
}

static void show(const char *name, const Rec *a, size_t n) {
    printf("%-6s", name);
    for (size_t i = 0; i < n; i++) {
        printf(" %d%c", a[i].score, a[i].tag);
    }
    printf("\n");
}

int main(void) {
    const Rec src[] = {{2, 'a'}, {1, 'b'}, {2, 'c'}, {1, 'd'}, {2, 'e'}, {1, 'f'}};
    enum { N = sizeof src / sizeof src[0] };
    Rec m[N];
    Rec q[N];
    Rec tmp[N];
    for (size_t i = 0; i < N; i++) {
        m[i] = src[i];
        q[i] = src[i];
    }
    merge_sort_rec(m, tmp, 0, N);
    quick_sort(q, 0, N);
    show("merge", m, N);
    show("quick", q, N);
    return 0;
}
`,
      String.raw`// фрагмент: порівняння через віднімання ламається на великих значеннях
static int cmp_bad(const void *pa, const void *pb) {
    int a = *(const int *)pa;
    int b = *(const int *)pb;
    return a - b;                    // INT_MAX - (-1) переповнює int: UB
}

static int cmp_good(const void *pa, const void *pb) {
    int a = *(const int *)pa;
    int b = *(const int *)pb;
    return (a > b) - (a < b);        // завжди -1, 0 або 1
}
`,
      String.raw`// аварія: злиття забуте, відсортовані половини ще не відсортований масив
#include <assert.h>
#include <stdio.h>

static int is_sorted(const int *a, size_t n) {
    for (size_t i = 1; i < n; i++) {
        if (a[i - 1] > a[i]) {
            return 0;
        }
    }
    return 1;
}

static void sort2(int *a) {
    if (a[0] > a[1]) {
        int t = a[0];
        a[0] = a[1];
        a[1] = t;
    }
}

int main(void) {
    int a[] = {4, 3, 2, 1};
    sort2(a);
    sort2(a + 2);
    printf("%d %d %d %d\n", a[0], a[1], a[2], a[3]);
    assert(is_sorted(a, 4));
    return 0;
}
`,
    ],
    note: "Merge sort стабільний і завжди O(n log n), але потребує O(n) пам'яті. Quicksort без додаткового масиву, нестабільний, а з поганою опорою вироджується в O(n²). Компаратор не пишіть як a - b.",
    work: "Merge sort лежить в основі стабільних сортувань бібліотек (Python, Java для об'єктів) і зовнішнього сортування великих файлів. Варіанти quicksort працюють у qsort багатьох libc і std::sort у C++.",
    tasks: [
      "Чому merge sort завжди O(n log n), а quicksort може бути O(n²), і що робить опору поганою?",
      "Що таке стабільність сортування, яка умова в злитті її забезпечує і чому не можна писати компаратор як a - b?",
    ],
  },
  {
    t: "Пошук і бінарний пошук",
    ch: "Структури даних",
    easy: "Бінарний пошук схожий на пошук слова в паперовому словнику: відкрили посередині, зрозуміли, ліворуч чи праворуч шукане, і відкинули половину книги. За двадцять відкриттів можна знайти слово серед мільйона.",
    p: [
      "Умова одна: масив <b>відсортований</b>. Лінійний пошук має вартість O(n): мільйон елементів це до мільйона порівнянь. Бінарний пошук відкидає половину елементів після кожного порівняння, тому коштує O(log n). Приклад 2 показує: на мільйоні елементів потрібно 20 порівнянь.",
      "Надійний бінарний пошук тримається на <b>інваріантах</b>. Ми працюємо з напіввідкритим проміжком <code>[lo, hi)</code>: відповідь лежить у ньому. Функція <code>lower_bound</code> шукає першу позицію, де <code>a[pos] &gt;= key</code>. Інваріант: усе зліва від <code>lo</code> менше за <code>key</code>, а все від <code>hi</code> і правіше не менше. Цикл <code>while (lo &lt; hi)</code> бере <code>mid = lo + (hi - lo) / 2</code> і зсуває одну з меж. Коли проміжок порожній, <code>lo == hi</code> це шукана позиція (приклад 1).",
      "Звідки беруться помилки на одиницю. Вираз <code>(lo + hi) / 2</code> може переповнитися на великих індексах, тож пишемо <code>lo + (hi - lo) / 2</code>. Закритий проміжок <code>[lo, hi]</code> вимагає <code>hi = n - 1</code>, а для порожнього масиву з беззнаковим <code>size_t</code> це <code>SIZE_MAX</code>; так само <code>hi = mid - 1</code> при <code>mid == 0</code> (приклад 4). Напіввідкритий проміжок усіх цих віднімань не потребує: <code>hi = mid</code> і <code>lo = mid + 1</code>.",
      "Що повертати. <code>lower_bound</code> повертає не «знайдено чи ні», а <b>позицію</b>: перевірка <code>pos &lt; n &amp;&amp; a[pos] == key</code> каже, чи ключ є. Для відсутнього ключа позиція показує, куди його вставити: у прикладі 1 для 5 вона дорівнює 4, між 4 та 7; для більшого за всі елементи вона дорівнює n. Це корисніше за -1, бо інформацію не втрачено.",
      "Дублікати. <code>lower_bound</code> дає першу позицію ключа, а <code>upper_bound</code> (умова <code>a[mid] &lt;= key</code>) позицію після останньої. Кількість копій це різниця. У прикладі 2 серед мільйона елементів знайшлося 3 копії числа 5000, на що пішло лише 39 порівнянь на обидва пошуки, без жодного обходу.",
      "Лічильник підтверджує оцінку. Кожне порівняння відкидає половину, тому їх не більше <code>floor(log2 n) + 1</code>: для n = 8 це 3-4 (приклад 1), для 1000000 це 20. Подвоєння n додає лише одне порівняння. Лінійний пошук у тому ж масиві робив би до мільйона.",
      "Стандартна бібліотека має <code>bsearch(&amp;key, base, n, size, cmp)</code> у <code>stdlib.h</code>. Вона повертає вказівник на знайдений елемент або <code>NULL</code>. Компаратор приймає <code>const void *</code>; масив має бути відсортований <b>за тим самим компаратором</b>; ключ має той самий тип, що й елементи (приклад 3: <code>Item</code> із заповненим лише <code>name</code>). Індекс знаходимо відніманням вказівників: <code>hit - table</code> має тип <code>ptrdiff_t</code>, формат <code>%td</code>. При дублікатах <code>bsearch</code> повертає довільний із рівних, тож для першого використовуйте <code>lower_bound</code>. Приклад 5 перевіряє передумову відсортованості через <code>assert</code>: на невідсортованих даних бінарний пошук мовчки дає сміття.",
    ],
    code: [
      String.raw`#include <stdio.h>

size_t lower_bound(const int *a, size_t n, int key, size_t *cmps) {
    size_t lo = 0;
    size_t hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        (*cmps)++;
        if (a[mid] < key) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

int main(void) {
    const int a[] = {2, 4, 4, 4, 7, 9, 12, 15};
    const size_t n = sizeof a / sizeof a[0];
    const int keys[] = {4, 5, 1, 15, 20};
    for (size_t i = 0; i < sizeof keys / sizeof keys[0]; i++) {
        size_t cmps = 0;
        size_t pos = lower_bound(a, n, keys[i], &cmps);
        int found = pos < n && a[pos] == keys[i];
        printf("ключ %2d: позиція %zu, %s, порівнянь %zu\n", keys[i], pos, found ? "знайдено" : "немає", cmps);
    }
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

static size_t lower_bound(const int *a, size_t n, int key, size_t *cmps) {
    size_t lo = 0;
    size_t hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        (*cmps)++;
        if (a[mid] < key) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

static size_t upper_bound(const int *a, size_t n, int key, size_t *cmps) {
    size_t lo = 0;
    size_t hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        (*cmps)++;
        if (a[mid] <= key) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

int main(void) {
    enum { N = 1000000 };
    int *a = malloc(N * sizeof *a);
    if (a == NULL) {
        return 1;
    }
    for (int i = 0; i < N; i++) {
        a[i] = i / 3;
    }
    size_t cmps = 0;
    size_t first = lower_bound(a, N, 5000, &cmps);
    size_t past = upper_bound(a, N, 5000, &cmps);
    printf("ключ 5000: перша позиція %zu, після останньої %zu, копій %zu\n", first, past, past - first);
    printf("порівнянь на два пошуки: %zu, при n=%d\n", cmps, N);
    cmps = 0;
    size_t none = lower_bound(a, N, -1, &cmps);
    printf("менший за всіх: позиція %zu, порівнянь %zu\n", none, cmps);
    free(a);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    const char *name;
    int code;
} Item;

static int cmp_item(const void *a, const void *b) {
    const Item *x = a;
    const Item *y = b;
    return strcmp(x->name, y->name);
}

int main(void) {
    const Item table[] = {{"alpha", 1}, {"beta", 2}, {"delta", 4}, {"gamma", 3}, {"omega", 9}};
    const size_t n = sizeof table / sizeof table[0];
    const char *queries[] = {"delta", "alpha", "zeta", "epsilon"};
    for (size_t i = 0; i < sizeof queries / sizeof queries[0]; i++) {
        Item key = {queries[i], 0};
        const Item *hit = bsearch(&key, table, n, sizeof table[0], cmp_item);
        if (hit != NULL) {
            printf("%-8s індекс %td, code=%d\n", queries[i], hit - table, hit->code);
        } else {
            printf("%-8s немає\n", queries[i]);
        }
    }
    return 0;
}
`,
      String.raw`// фрагмент: помилки на одиницю в бінарному пошуку
size_t hi = n - 1;                  // n == 0: беззнакове n - 1 це SIZE_MAX, цикл піде за межі
while (lo <= hi) {
    size_t mid = (lo + hi) / 2;     // lo + hi може переповнитися на великих індексах
    if (a[mid] < key) lo = mid + 1;
    else hi = mid - 1;              // mid == 0: беззнакове mid - 1 знову SIZE_MAX
}
`,
      String.raw`// аварія: бінарний пошук мовчки дає сміття на невідсортованих даних, assert передумови це ловить
#include <assert.h>
#include <stdio.h>

static int is_sorted(const int *a, size_t n) {
    for (size_t i = 1; i < n; i++) {
        if (a[i - 1] > a[i]) {
            return 0;
        }
    }
    return 1;
}

int main(void) {
    const int a[] = {1, 5, 3, 9, 7};
    assert(is_sorted(a, 5));
    printf("шукаємо у відсортованому масиві\n");
    return 0;
}
`,
    ],
    note: "Бінарний пошук потребує відсортованого масиву. Тримайте напіввідкритий проміжок [lo, hi), рахуйте середину як lo + (hi - lo) / 2 і повертайте позицію, а не лише факт знайдення. Це знімає помилки на одиницю.",
    work: "Бінарний пошук лежить у пошуку за відсортованими індексами баз даних, у bsearch і std::lower_bound, у git bisect (пошук коміту, що зламав збірку) і в підборі параметра за умовою «підходить чи ні».",
    tasks: [
      "Який інваріант тримає цикл lower_bound з проміжком [lo, hi) і чому тоді не потрібні hi = n - 1 та mid - 1?",
      "Як за допомогою lower_bound і upper_bound порахувати кількість копій ключа і що повертає bsearch для відсутнього ключа?",
    ],
  },
  {
    t: "Практика: словник на хеш-таблиці",
    ch: "Структури даних",
    easy: "Словник на хеш-таблиці це записник, де кожне слово має свою сторінку з лічильником. Ми збираємо його з тексту, викреслюємо зайве й дивимося, які слова трапляються найчастіше.",
    p: [
      "Практика поєднує все з глави: рядки, структури, <code>malloc</code> і <code>free</code>, хеш-таблицю з уроку 85 і <code>qsort</code>. Задача типова: підрахувати частоти слів у тексті. План із чотирьох кроків: розбити текст на слова, занести їх у таблицю «слово, лічильник», прибрати стоп-слова, надрукувати топ-N. Модулі: <code>table</code> (створення, <code>add</code>, <code>get</code>, <code>remove</code>, <code>destroy</code>), <code>count_words</code> і <code>table_print_top</code>.",
      "Токенізація без stdin: текст лежить у рядковому літералі (у реальній програмі це <code>fgets</code> зі стандартного вводу). Цикл іде по символах: літеру приводимо до нижнього регістру й дописуємо в буфер <code>word</code>, будь-який інший символ закриває слово й передає його в <code>table_add</code>. Буфер захищаємо умовою <code>n + 1 &lt; sizeof word</code>. Функції <code>isalpha</code> і <code>tolower</code> приймають значення <code>unsigned char</code>: передати їм <code>char</code> із від'ємним кодом це UB, тому є приведення (приклад 2).",
      "API та власність. <code>table_add(t, key, delta)</code> копіює ключ: таблиця володіє копіями. <code>table_get(t, key, fallback)</code> нічого не змінює й тому приймає <code>const Table *</code>. <code>table_remove</code> повертає 1, якщо ключ був, і 0, якщо ні. Викликач володіє самою таблицею: <code>table_create</code> і <code>table_destroy</code> стоять в одній функції. Помилки повертаємо кодом, а не <code>exit</code>: у прикладі 2 при невдачі <code>count_words</code> ми спершу робимо <code>table_destroy</code>, потім <code>return 1</code>.",
      "Видалення з ланцюжка зручно писати через <b>вказівник на вказівник</b>: <code>Entry **link = &amp;t-&gt;buckets[i]</code>, далі <code>link = &amp;e-&gt;next</code>. Знайшовши ключ, робимо <code>*link = e-&gt;next</code>: це перев'язує і попереднього сусіда, і голову кошика одним і тим самим кодом, без особливого випадку «видаляємо першого». Потім <code>free(e-&gt;key)</code>, <code>free(e)</code> і <code>len--</code>. Приклад 1 перевіряє це на практиці.",
      "Топ-N. Таблиця неупорядкована, тому збираємо вказівники на вузли в масив і сортуємо <code>qsort</code>: спершу більший лічильник, при рівних за алфавітом через <code>strcmp</code>. Другий критерій обов'язковий, інакше порядок рівних залежав би від хеш-функції й розміру таблиці. Компаратор повертає <code>y-&gt;value &gt; x-&gt;value ? 1 : -1</code>, а не різницю. У прикладі 2 слова <code>fox</code> і <code>the</code> мають по 4, і <code>fox</code> стоїть першим за алфавітом, а <code>a</code> та <code>dog</code> з двома.",
      "Не вірте на слово, перевіряйте. Приклад 1 це мінітест: перше видалення дає 1, друге 0, після видалення <code>get</code> повертає запасне значення, решта ключів на місці. Приклад 3 додає діагностику <code>table_longest_chain</code>: 14 слів розкладено на 32 кошики з найдовшим ланцюжком у два вузли, отже ресайз працює. Збирайте програму з <code>-fsanitize=address,undefined</code>: після всіх видалень витоків бути не повинно.",
      "Куди розвивати. Значенням може бути рядок із власною копією (словник «слово, переклад»), лічильник біграм, список позицій слова в тексті. Правила незмінні: таблиця копіює й володіє ключами, ключ не змінюють після вставки, читальні функції беруть <code>const</code>. Приклад 4 показує, що компілятор допомагає: через <code>const Entry *</code> змінити поле не вийде.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <ctype.h>

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;
} Entry;

typedef struct {
    Entry **buckets;
    size_t nb;
    size_t len;
    size_t resizes;
} Table;

static uint32_t djb2(const char *s) {
    uint32_t h = 5381;
    for (; *s != '\0'; s++) {
        h = h * 33 + (unsigned char)*s;
    }
    return h;
}

char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != NULL) {
        memcpy(p, s, n);
    }
    return p;
}

Table *table_create(size_t nb) {
    Table *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->buckets = calloc(nb, sizeof *t->buckets);
    if (t->buckets == NULL) {
        free(t);
        return NULL;
    }
    t->nb = nb;
    t->len = 0;
    t->resizes = 0;
    return t;
}

void table_destroy(Table *t) {
    if (t == NULL) {
        return;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            free(e->key);
            free(e);
            e = next;
        }
    }
    free(t->buckets);
    free(t);
}

static Entry *table_find(const Table *t, const char *key) {
    for (Entry *e = t->buckets[djb2(key) % t->nb]; e != NULL; e = e->next) {
        if (strcmp(e->key, key) == 0) {
            return e;
        }
    }
    return NULL;
}

static int table_grow(Table *t) {
    size_t nb2 = t->nb * 2;
    Entry **b2 = calloc(nb2, sizeof *b2);
    if (b2 == NULL) {
        return -1;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            size_t j = djb2(e->key) % nb2;
            e->next = b2[j];
            b2[j] = e;
            e = next;
        }
    }
    free(t->buckets);
    t->buckets = b2;
    t->nb = nb2;
    t->resizes++;
    return 0;
}

int table_add(Table *t, const char *key, int delta) {
    Entry *e = table_find(t, key);
    if (e != NULL) {
        e->value += delta;
        return 0;
    }
    e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->key = dup_str(key);
    if (e->key == NULL) {
        free(e);
        return -1;
    }
    e->value = delta;
    size_t i = djb2(key) % t->nb;
    e->next = t->buckets[i];
    t->buckets[i] = e;
    t->len++;
    if (t->len * 4 > t->nb * 3) {
        return table_grow(t);
    }
    return 0;
}

int table_get(const Table *t, const char *key, int fallback) {
    const Entry *e = table_find(t, key);
    return e != NULL ? e->value : fallback;
}

int table_remove(Table *t, const char *key) {
    Entry **link = &t->buckets[djb2(key) % t->nb];
    while (*link != NULL) {
        Entry *e = *link;
        if (strcmp(e->key, key) == 0) {
            *link = e->next;
            free(e->key);
            free(e);
            t->len--;
            return 1;
        }
        link = &e->next;
    }
    return 0;
}

size_t table_longest_chain(const Table *t) {
    size_t best = 0;
    for (size_t i = 0; i < t->nb; i++) {
        size_t len = 0;
        for (const Entry *e = t->buckets[i]; e != NULL; e = e->next) {
            len++;
        }
        if (len > best) {
            best = len;
        }
    }
    return best;
}

int main(void) {
    Table *t = table_create(2);
    if (t == NULL) {
        return 1;
    }
    const char *keys[] = {"red", "green", "blue", "cyan", "pink", "gold"};
    for (size_t i = 0; i < 6; i++) {
        table_add(t, keys[i], (int)i * 10);
    }
    printf("len=%zu buckets=%zu\n", t->len, t->nb);
    int first = table_remove(t, "blue");
    int second = table_remove(t, "blue");
    printf("remove blue: %d, ще раз: %d\n", first, second);
    printf("get blue=%d get gold=%d len=%zu\n", table_get(t, "blue", -1), table_get(t, "gold", -1), t->len);
    int ok = 1;
    for (size_t i = 0; i < 6; i++) {
        if (strcmp(keys[i], "blue") != 0 && table_get(t, keys[i], -1) != (int)i * 10) {
            ok = 0;
        }
    }
    printf("решта ключів на місці: %s\n", ok ? "так" : "ні");
    table_destroy(t);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <ctype.h>

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;
} Entry;

typedef struct {
    Entry **buckets;
    size_t nb;
    size_t len;
    size_t resizes;
} Table;

static uint32_t djb2(const char *s) {
    uint32_t h = 5381;
    for (; *s != '\0'; s++) {
        h = h * 33 + (unsigned char)*s;
    }
    return h;
}

char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != NULL) {
        memcpy(p, s, n);
    }
    return p;
}

Table *table_create(size_t nb) {
    Table *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->buckets = calloc(nb, sizeof *t->buckets);
    if (t->buckets == NULL) {
        free(t);
        return NULL;
    }
    t->nb = nb;
    t->len = 0;
    t->resizes = 0;
    return t;
}

void table_destroy(Table *t) {
    if (t == NULL) {
        return;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            free(e->key);
            free(e);
            e = next;
        }
    }
    free(t->buckets);
    free(t);
}

static Entry *table_find(const Table *t, const char *key) {
    for (Entry *e = t->buckets[djb2(key) % t->nb]; e != NULL; e = e->next) {
        if (strcmp(e->key, key) == 0) {
            return e;
        }
    }
    return NULL;
}

static int table_grow(Table *t) {
    size_t nb2 = t->nb * 2;
    Entry **b2 = calloc(nb2, sizeof *b2);
    if (b2 == NULL) {
        return -1;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            size_t j = djb2(e->key) % nb2;
            e->next = b2[j];
            b2[j] = e;
            e = next;
        }
    }
    free(t->buckets);
    t->buckets = b2;
    t->nb = nb2;
    t->resizes++;
    return 0;
}

int table_add(Table *t, const char *key, int delta) {
    Entry *e = table_find(t, key);
    if (e != NULL) {
        e->value += delta;
        return 0;
    }
    e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->key = dup_str(key);
    if (e->key == NULL) {
        free(e);
        return -1;
    }
    e->value = delta;
    size_t i = djb2(key) % t->nb;
    e->next = t->buckets[i];
    t->buckets[i] = e;
    t->len++;
    if (t->len * 4 > t->nb * 3) {
        return table_grow(t);
    }
    return 0;
}

int table_get(const Table *t, const char *key, int fallback) {
    const Entry *e = table_find(t, key);
    return e != NULL ? e->value : fallback;
}

int table_remove(Table *t, const char *key) {
    Entry **link = &t->buckets[djb2(key) % t->nb];
    while (*link != NULL) {
        Entry *e = *link;
        if (strcmp(e->key, key) == 0) {
            *link = e->next;
            free(e->key);
            free(e);
            t->len--;
            return 1;
        }
        link = &e->next;
    }
    return 0;
}

int count_words(Table *t, const char *text) {
    char word[32];
    size_t n = 0;
    for (const char *p = text;; p++) {
        if (isalpha((unsigned char)*p) && n + 1 < sizeof word) {
            word[n++] = (char)tolower((unsigned char)*p);
        } else {
            if (n > 0) {
                word[n] = '\0';
                if (table_add(t, word, 1) != 0) {
                    return -1;
                }
                n = 0;
            }
            if (*p == '\0') {
                break;
            }
        }
    }
    return 0;
}

static int cmp_top(const void *a, const void *b) {
    const Entry *x = *(Entry *const *)a;
    const Entry *y = *(Entry *const *)b;
    if (x->value != y->value) {
        return y->value > x->value ? 1 : -1;
    }
    return strcmp(x->key, y->key);
}

void table_print_top(const Table *t, size_t k) {
    Entry **all = malloc((t->len + 1) * sizeof *all);
    if (all == NULL) {
        return;
    }
    size_t n = 0;
    for (size_t i = 0; i < t->nb; i++) {
        for (Entry *e = t->buckets[i]; e != NULL; e = e->next) {
            all[n++] = e;
        }
    }
    qsort(all, n, sizeof *all, cmp_top);
    for (size_t i = 0; i < n && i < k; i++) {
        printf("%zu. %s=%d\n", i + 1, all[i]->key, all[i]->value);
    }
    free(all);
}

int main(void) {
    const char *text =
        "The quick brown fox jumps over the lazy dog. The dog barks; the fox runs away. "
        "A quick fox is a happy fox.";
    Table *t = table_create(4);
    if (t == NULL) {
        return 1;
    }
    if (count_words(t, text) != 0) {
        table_destroy(t);
        return 1;
    }
    printf("різних слів: %zu\n", t->len);
    table_print_top(t, 4);
    table_destroy(t);
    return 0;
}
`,
      String.raw`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <ctype.h>

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;
} Entry;

typedef struct {
    Entry **buckets;
    size_t nb;
    size_t len;
    size_t resizes;
} Table;

static uint32_t djb2(const char *s) {
    uint32_t h = 5381;
    for (; *s != '\0'; s++) {
        h = h * 33 + (unsigned char)*s;
    }
    return h;
}

char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != NULL) {
        memcpy(p, s, n);
    }
    return p;
}

Table *table_create(size_t nb) {
    Table *t = malloc(sizeof *t);
    if (t == NULL) {
        return NULL;
    }
    t->buckets = calloc(nb, sizeof *t->buckets);
    if (t->buckets == NULL) {
        free(t);
        return NULL;
    }
    t->nb = nb;
    t->len = 0;
    t->resizes = 0;
    return t;
}

void table_destroy(Table *t) {
    if (t == NULL) {
        return;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            free(e->key);
            free(e);
            e = next;
        }
    }
    free(t->buckets);
    free(t);
}

static Entry *table_find(const Table *t, const char *key) {
    for (Entry *e = t->buckets[djb2(key) % t->nb]; e != NULL; e = e->next) {
        if (strcmp(e->key, key) == 0) {
            return e;
        }
    }
    return NULL;
}

static int table_grow(Table *t) {
    size_t nb2 = t->nb * 2;
    Entry **b2 = calloc(nb2, sizeof *b2);
    if (b2 == NULL) {
        return -1;
    }
    for (size_t i = 0; i < t->nb; i++) {
        Entry *e = t->buckets[i];
        while (e != NULL) {
            Entry *next = e->next;
            size_t j = djb2(e->key) % nb2;
            e->next = b2[j];
            b2[j] = e;
            e = next;
        }
    }
    free(t->buckets);
    t->buckets = b2;
    t->nb = nb2;
    t->resizes++;
    return 0;
}

int table_add(Table *t, const char *key, int delta) {
    Entry *e = table_find(t, key);
    if (e != NULL) {
        e->value += delta;
        return 0;
    }
    e = malloc(sizeof *e);
    if (e == NULL) {
        return -1;
    }
    e->key = dup_str(key);
    if (e->key == NULL) {
        free(e);
        return -1;
    }
    e->value = delta;
    size_t i = djb2(key) % t->nb;
    e->next = t->buckets[i];
    t->buckets[i] = e;
    t->len++;
    if (t->len * 4 > t->nb * 3) {
        return table_grow(t);
    }
    return 0;
}

int table_get(const Table *t, const char *key, int fallback) {
    const Entry *e = table_find(t, key);
    return e != NULL ? e->value : fallback;
}

int table_remove(Table *t, const char *key) {
    Entry **link = &t->buckets[djb2(key) % t->nb];
    while (*link != NULL) {
        Entry *e = *link;
        if (strcmp(e->key, key) == 0) {
            *link = e->next;
            free(e->key);
            free(e);
            t->len--;
            return 1;
        }
        link = &e->next;
    }
    return 0;
}

size_t table_longest_chain(const Table *t) {
    size_t best = 0;
    for (size_t i = 0; i < t->nb; i++) {
        size_t len = 0;
        for (const Entry *e = t->buckets[i]; e != NULL; e = e->next) {
            len++;
        }
        if (len > best) {
            best = len;
        }
    }
    return best;
}

int count_words(Table *t, const char *text) {
    char word[32];
    size_t n = 0;
    for (const char *p = text;; p++) {
        if (isalpha((unsigned char)*p) && n + 1 < sizeof word) {
            word[n++] = (char)tolower((unsigned char)*p);
        } else {
            if (n > 0) {
                word[n] = '\0';
                if (table_add(t, word, 1) != 0) {
                    return -1;
                }
                n = 0;
            }
            if (*p == '\0') {
                break;
            }
        }
    }
    return 0;
}

static int cmp_top(const void *a, const void *b) {
    const Entry *x = *(Entry *const *)a;
    const Entry *y = *(Entry *const *)b;
    if (x->value != y->value) {
        return y->value > x->value ? 1 : -1;
    }
    return strcmp(x->key, y->key);
}

void table_print_top(const Table *t, size_t k) {
    Entry **all = malloc((t->len + 1) * sizeof *all);
    if (all == NULL) {
        return;
    }
    size_t n = 0;
    for (size_t i = 0; i < t->nb; i++) {
        for (Entry *e = t->buckets[i]; e != NULL; e = e->next) {
            all[n++] = e;
        }
    }
    qsort(all, n, sizeof *all, cmp_top);
    for (size_t i = 0; i < n && i < k; i++) {
        printf("%zu. %s=%d\n", i + 1, all[i]->key, all[i]->value);
    }
    free(all);
}

int main(void) {
    const char *text =
        "The quick brown fox jumps over the lazy dog. The dog barks; the fox runs away. "
        "A quick fox is a happy fox.";
    const char *stop[] = {"the", "a", "is", "over", "away"};
    Table *t = table_create(4);
    if (t == NULL) {
        return 1;
    }
    if (count_words(t, text) != 0) {
        table_destroy(t);
        return 1;
    }
    size_t before = t->len;
    int removed = 0;
    for (size_t i = 0; i < sizeof stop / sizeof stop[0]; i++) {
        removed += table_remove(t, stop[i]);
    }
    printf("було %zu, прибрано стоп-слів %d, лишилось %zu\n", before, removed, t->len);
    table_print_top(t, 3);
    printf("найдовший ланцюжок %zu при %zu кошиках\n", table_longest_chain(t), t->nb);
    table_destroy(t);
    return 0;
}
`,
      String.raw`// не компілюється: через const Entry * поле змінити не можна
#include <stdio.h>

typedef struct Entry {
    const char *key;
    int value;
    struct Entry *next;
} Entry;

void bump(const Entry *e) {
    e->value++;
}

int main(void) {
    Entry e = {"fox", 1, NULL};
    bump(&e);
    printf("%d\n", e.value);
    return 0;
}
`,
    ],
    note: "Таблиця копіює й володіє ключами; читальні функції беруть const; видалення з ланцюжка зручно писати через Entry **link. Для стабільного виводу сортуйте за кількома критеріями й не покладайтеся на порядок обходу.",
    work: "Підрахунок частот на хеш-таблиці лежить в аналізі логів, пошукових індексах, моніторингу (топ найчастіших помилок), перевірці дублікатів і в простих текстових аналізаторах на кшталт wc чи зв'язки sort з uniq.",
    tasks: [
      "Чому table_add копіює ключ і чому для видалення з ланцюжка зручний вказівник на вказівник?",
      "Навіщо в компараторі топ-N другий критерій за алфавітом і як ви перевірите, що після видалень немає витоків?",
    ],
  },
];
