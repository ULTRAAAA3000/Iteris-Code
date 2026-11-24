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
];
