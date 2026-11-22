// Практичні завдання глави «Абстракція», частина b (уроки 55–61). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05b: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-optional-find", lesson: "cpp/55", xp: 30,
    title: "optional: перший парний елемент",
    context: "Функції пошуку часто не мають що повернути. optional робить «значення немає» частиною типу, і виклик не можна випадково використати без перевірки, на відміну від магічного -1.",
    brief: [
      "Допишіть функцію <code>find_first_even</code>: вона повертає <code>std::optional&lt;int&gt;</code> з першим парним числом вектора або <code>std::nullopt</code>, якщо парних немає.",
      "Для <code>{3, 5, 8, 10}</code> програма виводить <code>first even: 8</code>, а для <code>{1, 3}</code> виводить <code>first even: none</code>.",
    ],
    starter: raw`#include <iostream>
#include <optional>
#include <vector>

std::optional<int> find_first_even(const std::vector<int>& v) {
    // TODO: пройдіть по v і поверніть перше парне число
    (void)v;
    return std::nullopt;
}

void show(const std::vector<int>& v) {
    auto r = find_first_even(v);
    if (r) {
        std::cout << "first even: " << *r << "\n";
    } else {
        std::cout << "first even: none\n";
    }
}

int main() {
    show({3, 5, 8, 10});
    show({1, 3});
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Знайдено перше парне", has: "first even: 8", hint: "Повертайте число одразу, як тільки знайшли перше парне (x % 2 == 0)." },
      { on: "stdout", name: "Для вектора без парних виведено none", has: "first even: none", hint: "Після циклу, якщо нічого не знайшли, поверніть std::nullopt." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "first even: 8\nfirst even: none", hint: "Два рядки: first even: 8 і first even: none." },
      { on: "source", name: "Повернення optional<int>", matches: "std::optional\\s*<\\s*int\\s*>\\s+find_first_even", hint: "Тип результату функції має бути std::optional<int>." },
    ],
  },
  {
    ...base, id: "cpp-variant-visit", lesson: "cpp/56", xp: 30,
    title: "variant і visit: опис значень",
    context: "variant зберігає одне значення з кількох типів, а visit для кожного типу викликає свою гілку. Так розбирають поля JSON, команди, токени, і компілятор стежить, щоб жодну гілку не забули.",
    brief: [
      "У <code>variant&lt;int, double, std::string&gt;</code> лежать значення <code>7</code>, <code>2.5</code> і <code>\"abc\"</code>. Допишіть у <code>Describe</code> три перевантаження <code>operator()</code> (для <code>int</code>, <code>double</code>, <code>const std::string&amp;</code>) і приберіть універсальний шаблон <code>?</code>.",
      "Формат рядків: <code>int 7</code>, <code>double 2.500000</code> (число через <code>std::to_string</code>), <code>string abc (3)</code>, де в дужках довжина рядка.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <variant>

struct Describe {
    // TODO: operator()(int n) -> "int 7"
    // TODO: operator()(double d) -> "double 2.500000" (через std::to_string)
    // TODO: operator()(const std::string& s) -> "string abc (3)"
    template <class T>
    std::string operator()(const T&) const { return "?"; }
};

int main() {
    std::variant<int, double, std::string> items[] = {7, 2.5, std::string("abc")};
    for (const auto& it : items) {
        std::cout << std::visit(Describe{}, it) << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Обробляється int", has: "int 7", hint: "Перевантаження для int поверніть як \"int \" + std::to_string(n)." },
      { on: "stdout", name: "Обробляється double", has: "double 2.500000", hint: "Для double поверніть \"double \" + std::to_string(d); to_string(2.5) дає 2.500000." },
      { on: "stdout", name: "Обробляється рядок із довжиною", has: "string abc (3)", hint: "Довжину рядка дає s.size(); склейте частини через +." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "int 7\ndouble 2.500000\nstring abc (3)", hint: "Три рядки у порядку елементів масиву, без знаків питання." },
      { on: "source", name: "Використано std::visit", has: "std::visit", hint: "Розбирайте variant через std::visit." },
    ],
  },
  {
    ...base, id: "cpp-virtual-diamond", lesson: "cpp/57", xp: 40,
    title: "Віртуальне наслідування: ромб без дублювання",
    context: "У ромбовидній ієрархії спільний предок без virtual потрапляє в об'єкт двічі. Віртуальне наслідування залишає одну копію, і це типова пастка, коли комбінують класи-можливості.",
    brief: [
      "Клас <code>Animal</code> рахує свої створення в глобальному лічильнику <code>animals</code>. Зараз <code>Duck</code> містить дві копії <code>Animal</code>, тож лічильник показує 2.",
      "Зробіть наслідування <code>Flyer</code> і <code>Swimmer</code> від <code>Animal</code> віртуальним, щоб після створення одного <code>Duck</code> лічильник був <code>animals: 1</code>. Вивід: <code>fly</code>, <code>swim</code>, <code>animals: 1</code>.",
    ],
    starter: raw`#include <iostream>

int animals = 0;

struct Animal {
    Animal() { ++animals; }
};

// TODO: зробіть наслідування від Animal віртуальним в обох класах
struct Flyer : Animal {
    void fly() const { std::cout << "fly\n"; }
};

struct Swimmer : Animal {
    void swim() const { std::cout << "swim\n"; }
};

struct Duck : Flyer, Swimmer {};

int main() {
    Duck d;
    d.fly();
    d.swim();
    std::cout << "animals: " << animals << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Animal створюється один раз", has: "animals: 1", hint: "Слово virtual треба поставити в обох проміжних класах: struct Flyer : virtual Animal." },
      { on: "stdout", name: "Методи обох батьків працюють", has: "fly\nswim", hint: "Duck має й fly(), і swim(); їх виклики вже в main." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "fly\nswim\nanimals: 1", hint: "Три рядки: fly, swim, animals: 1." },
      { on: "source", name: "Віртуальна база в обох класах", matches: "virtual\\s+(public\\s+)?Animal[\\s\\S]*virtual\\s+(public\\s+)?Animal|public\\s+virtual\\s+Animal[\\s\\S]*public\\s+virtual\\s+Animal", hint: "virtual має стояти і в Flyer, і в Swimmer; в одному класі замало." },
    ],
  },
  {
    ...base, id: "cpp-if-constexpr", lesson: "cpp/58", xp: 40,
    title: "if constexpr: різний код для різних типів",
    context: "Шаблонові функції часто треба по-різному обробляти числа, рядки, контейнери. if constexpr вибирає гілку при компіляції, і непідходящий код навіть не перевіряється для цього типу.",
    brief: [
      "Напишіть шаблон <code>to_text(const T&amp; x)</code> з <code>if constexpr</code>: для цілих повертає <code>int:</code> і число, для <code>std::string</code> повертає <code>str:</code> і рядок, для чисел із плаваючою комою повертає <code>float:</code> і значення через <code>std::to_string</code>.",
      "Очікуваний вивід для <code>42</code>, <code>std::string(\"hi\")</code> і <code>2.5</code>: <code>int:42</code>, <code>str:hi</code>, <code>float:2.500000</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <type_traits>

template <class T>
std::string to_text(const T& x) {
    // TODO: if constexpr (std::is_integral_v<T>) ... "int:" + std::to_string(x)
    // TODO: else if constexpr (std::is_floating_point_v<T>) ... "float:" + ...
    // TODO: else if constexpr (std::is_same_v<T, std::string>) ... "str:" + x
    (void)x;
    return "?";
}

int main() {
    std::cout << to_text(42) << "\n";
    std::cout << to_text(std::string("hi")) << "\n";
    std::cout << to_text(2.5) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Ціле число", has: "int:42", hint: "Гілка для std::is_integral_v<T>: \"int:\" + std::to_string(x)." },
      { on: "stdout", name: "Рядок", has: "str:hi", hint: "Гілка для std::is_same_v<T, std::string>: \"str:\" + x. Для рядка to_string не потрібен." },
      { on: "stdout", name: "Дробове число", has: "float:2.500000", hint: "std::to_string(2.5) дає 2.500000." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "int:42\nstr:hi\nfloat:2.500000", hint: "Три рядки в порядку викликів." },
      { on: "source", name: "Використано if constexpr", has: "if constexpr", hint: "Звичайний if не збереться: у гілці для рядка to_string(x) некоректний." },
    ],
  },
  {
    ...base, id: "cpp-fold-expr", lesson: "cpp/59", xp: 40,
    title: "Fold-вирази: sum, all_positive, join",
    context: "Функції зі змінною кількістю аргументів потрібні в логерах, make_unique, tuple. Fold-вирази C++17 замінюють рекурсію одним рядком і правильно обробляють порожній набір.",
    brief: [
      "Допишіть три шаблони: <code>sum_all</code> (сума через fold із початковим <code>0</code>), <code>all_positive</code> (fold з <code>&amp;&amp;</code>) і <code>join</code> (друкує аргументи через кому з пробілом і завершує рядок).",
      "Очікується: <code>sum: 15</code>, <code>sum empty: 0</code>, <code>all positive: 1</code>, <code>all positive: 0</code>, <code>list: a, 2, 3.5</code>.",
    ],
    starter: raw`#include <iostream>

template <class... Ts>
auto sum_all(Ts... xs) {
    // TODO: fold із початковим значенням 0: (xs + ... + 0)
    ((void)xs, ...);
    return 0;
}

template <class... Ts>
bool all_positive(Ts... xs) {
    // TODO: fold з &&: ((xs > 0) && ...)
    ((void)xs, ...);
    return false;
}

template <class... Ts>
void join(const Ts&... xs) {
    // TODO: друкуйте аргументи через ", " (підказка: прапорець first і fold з комою)
    ((void)xs, ...);
    std::cout << "\n";
}

int main() {
    std::cout << "sum: " << sum_all(1, 2, 3, 4, 5) << "\n";
    std::cout << "sum empty: " << sum_all() << "\n";
    std::cout << "all positive: " << all_positive(1, 2, 3) << "\n";
    std::cout << "all positive: " << all_positive(1, -2, 3) << "\n";
    std::cout << "list: ";
    join("a", 2, 3.5);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума й порожня сума", has: "sum: 15\nsum empty: 0", hint: "Форма (xs + ... + 0) дає 0 для порожнього пакета." },
      { on: "stdout", name: "all_positive", has: "all positive: 1\nall positive: 0", hint: "Fold ((xs > 0) && ...) істинний, лише якщо всі додатні." },
      { on: "stdout", name: "join через кому", has: "list: a, 2, 3.5", hint: "Перед кожним аргументом, крім першого, друкуйте \", \". Прапорець first скидайте після першого друку." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "sum: 15\nsum empty: 0\nall positive: 1\nall positive: 0\nlist: a, 2, 3.5", hint: "П'ять рядків у порядку викликів у main." },
      { on: "source", name: "Є fold-вираз з оператором", matches: "\\+\\s*\\.\\.\\.|\\.\\.\\.\\s*\\+", hint: "Fold із плюсом виглядає як (xs + ... + 0)." },
    ],
  },
  {
    ...base, id: "cpp-crtp-counter", lesson: "cpp/60", xp: 40,
    title: "CRTP: лічильник живих об'єктів",
    context: "CRTP-міксин додає класам спільну поведінку без віртуальних функцій. Лічильник екземплярів, оператори порівняння з одного, інтерфейси: усе це підключається успадкуванням від шаблону.",
    brief: [
      "Допишіть шаблон <code>Counted&lt;T&gt;</code>: конструктор збільшує <code>count</code>, копіювання теж збільшує, деструктор зменшує. Зробіть так, щоб <code>Apple</code> успадковував <code>Counted&lt;Apple&gt;</code>, а <code>Pear</code> успадковував <code>Counted&lt;Pear&gt;</code>.",
      "Очікуваний вивід: <code>apples inside: 3</code>, потім <code>apples: 2 pears: 1</code>.",
    ],
    starter: raw`#include <iostream>

template <class T>
struct Counted {
    static inline int count = 0;
    // TODO: конструктор за замовчуванням і копіювання: ++count
    // TODO: деструктор: --count
};

// TODO: нехай Apple і Pear успадковують Counted<Apple> і Counted<Pear>
struct Apple {};
struct Pear {};

int main() {
    Apple a1, a2;
    Pear p1;
    (void)a1;
    (void)a2;
    (void)p1;
    {
        Apple a3 = a1;
        (void)a3;
        std::cout << "apples inside: " << Counted<Apple>::count << "\n";
    }
    std::cout << "apples: " << Counted<Apple>::count << " pears: " << Counted<Pear>::count << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Лічильник рахує копії", has: "apples inside: 3", hint: "Копіювання теж створює живий об'єкт: потрібен власний конструктор копіювання, що робить ++count." },
      { on: "stdout", name: "Деструктор зменшує лічильник", has: "apples: 2 pears: 1", hint: "Після виходу з блоку a3 знищується, тому --count в деструкторі." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "apples inside: 3\napples: 2 pears: 1", hint: "Два рядки; лічильники яблук і груш окремі." },
      { on: "source", name: "Apple успадковує Counted<Apple>", matches: "struct\\s+Apple\\s*:\\s*(public\\s+)?Counted\\s*<\\s*Apple\\s*>", hint: "CRTP: клас передає себе як параметр бази: struct Apple : Counted<Apple>." },
    ],
  },
  {
    ...base, id: "cpp-concept-analog", lesson: "cpp/61", xp: 40,
    title: "Обмеження типів: C++17-аналог концепту",
    context: "Концепти C++20 описують, що має вміти тип. Ту саму ідею в C++17 виражають ознакою типу й static_assert; саме такі перевірки стоять у сучасних бібліотеках, а код читається як вимога.",
    brief: [
      "Допишіть ознаку <code>has_size&lt;T&gt;</code> через <code>std::void_t</code> і <code>decltype(std::declval&lt;const T&amp;&gt;().size())</code>: вона істинна, коли в типу є <code>size()</code>. Додайте в <code>main</code> два <code>static_assert</code>: для <code>std::string</code> істинно, для <code>int</code> хибно.",
      "Очікуваний вивід: <code>string: 5</code>, <code>vector: 3</code>, <code>int has size: 0</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <type_traits>
#include <utility>
#include <vector>

template <class T, class = void>
struct has_size : std::false_type {};

// TODO: частковa спеціалізація через std::void_t<decltype(std::declval<const T&>().size())>
//       яка успадковує std::true_type

template <class T>
std::size_t count_of(const T& c) {
    if constexpr (has_size<T>::value) {
        return c.size();
    } else {
        return 0;
    }
}

int main() {
    // TODO: static_assert(has_size<std::string>::value, "...");
    // TODO: static_assert(!has_size<int>::value, "...");
    std::cout << "string: " << count_of(std::string("hello")) << "\n";
    std::cout << "vector: " << count_of(std::vector<int>{1, 2, 3}) << "\n";
    std::cout << "int has size: " << has_size<int>::value << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Розмір рядка й вектора", has: "string: 5\nvector: 3", hint: "has_size має ставати true, коли вираз .size() коректний; тоді count_of повертає c.size()." },
      { on: "stdout", name: "int не має size()", has: "int has size: 0", hint: "Для int підстановка дає помилку й мовчки відкидається: лишається запасний false_type." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "string: 5\nvector: 3\nint has size: 0", hint: "Три рядки в порядку викликів." },
      { on: "source", name: "Використано void_t", has: "void_t", hint: "Ідіома виявлення будується на std::void_t<decltype(...)>." },
      { on: "source", name: "Є перевірки static_assert", matches: "static_assert\\s*\\(\\s*has_size", hint: "static_assert(has_size<std::string>::value, \"...\"); перевіряє ознаку при компіляції." },
    ],
  },
];
