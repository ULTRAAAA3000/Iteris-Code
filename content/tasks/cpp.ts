// Практичні завдання курсу C++: по одному на кожен урок. Запускаються на сервері (runtime: "remote"), перевірка за stdout і кодом.
// Еталони: tests/solutions/cpp.mjs. Стандарт C++17 (компілятор пісочниці gcc), без std::cin: клавіатури в пісочниці немає.
import type { RemoteTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "cpp", runtime: "remote", lang: "cpp", file: "main.cpp", editorLang: "cpp", premium: false } as const;

export const CPP_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-hello-compiler", lesson: "cpp/1", xp: 15,
    title: "Перевірка компілятора: перша програма",
    context: "Після встановлення компілятора першим запускають найпростішу програму: так видно, що збірка працює. У C++ вона складається з підключення бібліотеки й функції main.",
    brief: [
      "Виведіть два рядки через <code>std::cout</code>: <code>Привіт, C++!</code> і <code>Компілятор працює</code>.",
      "Кожен рядок закінчується переносом (<code>std::endl</code> або <code>\"\\n\"</code>).",
    ],
    starter: raw`#include <iostream>

int main() {
    // Виведіть два рядки: Привіт, C++! і Компілятор працює
    std::cout << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, C++!»", has: "Привіт, C++!" },
      { on: "stdout", name: "Виводить «Компілятор працює»", has: "Компілятор працює" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, C++!\nКомпілятор працює" },
    ],
  },
  {
    ...base, id: "cpp-first-program", lesson: "cpp/2", xp: 15,
    title: "Обчислення у виводі через cout",
    context: "cout приймає ланцюжок значень через <<: текст і результати виразів можна друкувати в одному рядку, не склеюючи їх руками.",
    brief: [
      "Першим рядком виведіть <code>2 + 3 = 5</code>, а другим <code>(8 + 4) * 3 = 36</code>. Числа в кінці обчисліть виразом у <code>cout</code>, не пишіть готову відповідь.",
    ],
    starter: raw`#include <iostream>

int main() {
    std::cout << "Привіт, світе!" << std::endl;
    // TODO: виведіть 2 + 3 = 5 і (8 + 4) * 3 = 36, обчисливши результати виразами
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «2 + 3 = 5»", has: "2 + 3 = 5" },
      { on: "stdout", name: "Рядок «(8 + 4) * 3 = 36»", has: "(8 + 4) * 3 = 36" },
      { on: "stdout", name: "Виводить лише два рядки", equals: "2 + 3 = 5\n(8 + 4) * 3 = 36", hint: "Рядок «Привіт, світе!» із заготовки треба прибрати" },
      { on: "source", name: "Результат обчислюється виразом у cout", matches: "<<\\s*\\(?\\s*2\\s*\\+\\s*3\\s*\\)?\\s*<<|<<\\s*\\(\\s*8\\s*\\+\\s*4\\s*\\)\\s*\\*\\s*3" },
    ],
  },
  {
    ...base, id: "cpp-types-total", lesson: "cpp/3", xp: 20,
    title: "Сума замовлення, точність і ділення цілих",
    context: "За замовчуванням cout показує лише 6 значущих цифр, тож 599.97 перетворюється на 600. Для грошей потрібні fixed і setprecision. А ділення цілих у C++ відкидає дробову частину.",
    brief: [
      "Виведіть <code>Разом: 599.97</code>: сума <code>price * qty</code> із двома знаками після коми (<code>std::fixed</code> і <code>std::setprecision(2)</code> з <code>&lt;iomanip&gt;</code>).",
      "Другим рядком виведіть через пробіл результати <code>7 / 2</code> і <code>7 / 2.0</code>: <code>3 3.5</code> (скористайтесь скиданням <code>std::defaultfloat</code>, або виведіть спочатку ці числа, а потім увімкніть <code>fixed</code>).",
    ],
    starter: raw`#include <iostream>
#include <iomanip>

int main() {
    double price = 199.99;
    int qty = 3;
    double total = price * qty;
    // TODO: Разом: 599.97 (fixed + setprecision(2)), а наступним рядком 7 / 2 і 7 / 2.0 через пробіл
    std::cout << "Разом: " << total << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Разом: 599.97»", has: "Разом: 599.97" },
      { on: "stdout", name: "Ділення цілих і дробових: 3 3.5", has: "3 3.5" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 599.97\n3 3.5" },
      { on: "source", name: "Використано setprecision", has: "setprecision" },
    ],
  },
  {
    ...base, id: "cpp-multiples", lesson: "cpp/4", xp: 20,
    title: "Числа, кратні 3 або 5, і їх сума",
    context: "Цикл з умовою всередині: перебрати діапазон, відібрати потрібне, накопичити суму. Основа будь-якої обробки даних: суми, лічильники, фільтри.",
    brief: [
      "У циклі <code>for</code> від 1 до 20 виведіть в один рядок через пробіл числа, що діляться на 3 <b>або</b> на 5, а наступним рядком <code>Сума: 98</code> (суму накопичуйте у змінній).",
    ],
    starter: raw`#include <iostream>

int main() {
    int sum = 0;
    for (int i = 1; i <= 20; i++) {
        // TODO: якщо i кратне 3 або 5: вивести i і додати до sum
    }
    std::cout << std::endl;
    std::cout << "Сума: " << sum << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Числа: 3 5 6 9 10 12 15 18 20", has: "3 5 6 9 10 12 15 18 20" },
      { on: "stdout", name: "Сума: 98", has: "Сума: 98" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "3 5 6 9 10 12 15 18 20\nСума: 98" },
      { on: "source", name: "Кратність перевіряється через %", has: "%" },
    ],
  },
  {
    ...base, id: "cpp-overload-default", lesson: "cpp/5", xp: 25,
    title: "Перевантаження і аргумент за замовчуванням",
    context: "C++ дозволяє мати кілька функцій з однією назвою (перевантаження) і пропускати аргументи, якщо для них задано значення за замовчуванням. Так робляться зручні API: power(5) і power(2, 10).",
    brief: [
      "Допишіть <code>int power(int base, int exp = 2)</code>: піднесення до степеня циклом, за замовчуванням квадрат.",
      "Допишіть дві перевантажені функції <code>area</code>: <code>double area(double r)</code> (коло, <code>3.14159265 * r * r</code>) і <code>double area(double w, double h)</code> (прямокутник).",
    ],
    starter: raw`#include <iostream>
#include <iomanip>

// TODO: int power(int base, int exp = 2)

// TODO: double area(double r) і double area(double w, double h)

int main() {
    std::cout << power(5) << std::endl;
    std::cout << power(2, 10) << std::endl;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << area(2) << std::endl;
    std::cout << area(3, 4) << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "power(5) дає 25", has: "25\n" },
      { on: "stdout", name: "power(2, 10) дає 1024", has: "1024" },
      { on: "stdout", name: "Площа кола з r = 2: 12.57", has: "12.57" },
      { on: "stdout", name: "Площа прямокутника 3 x 4: 12.00", has: "12.00" },
      { on: "source", name: "Аргумент за замовчуванням exp = 2", matches: "exp\\s*=\\s*2" },
    ],
  },
  {
    ...base, id: "cpp-vector-string", lesson: "cpp/6", xp: 30,
    title: "vector: сума, парні числа і перевернутий рядок",
    context: "vector це динамічний масив, який росте разом з даними, а std::string є звичайним рядком із зручними методами. Разом вони покривають більшість повсякденних даних.",
    brief: [
      "Допишіть <code>sum(const std::vector&lt;int&gt;&amp; v)</code>, <code>evens(const std::vector&lt;int&gt;&amp; v)</code> (новий вектор із парних, метод <code>push_back</code>) і <code>reversed(std::string s)</code> (<code>std::reverse</code> з <code>&lt;algorithm&gt;</code>).",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

int sum(const std::vector<int>& v) {
    // TODO
    return 0;
}

std::vector<int> evens(const std::vector<int>& v) {
    // TODO: push_back для парних
    return {};
}

std::string reversed(std::string s) {
    // TODO: std::reverse
    return s;
}

int main() {
    std::vector<int> nums = {5, 2, 9, 7, 4, 10, 3, 8};
    std::cout << "Сума: " << sum(nums) << std::endl;
    std::cout << "Парні:";
    for (int n : evens(nums)) std::cout << " " << n;
    std::cout << std::endl;
    std::cout << reversed("Cpp") << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума: 48", has: "Сума: 48" },
      { on: "stdout", name: "Парні: 2 4 10 8", has: "Парні: 2 4 10 8" },
      { on: "stdout", name: "Перевернутий рядок: ppC", has: "ppC" },
      { on: "source", name: "Елементи додаються через push_back", has: "push_back(" },
    ],
  },
  {
    ...base, id: "cpp-pointers-references", lesson: "cpp/7", xp: 30,
    title: "Посилання і вказівник: swap та increment",
    context: "Звичайна функція працює з копіями аргументів і не змінює оригінал. Посилання (&) і вказівник (*) дозволяють змінити саму змінну: обмін значень, лічильники, вихідні параметри.",
    brief: [
      "Допишіть <code>swapValues(int&amp; a, int&amp; b)</code>: поміняйте значення місцями (через посилання).",
      "Допишіть <code>increment(int* p)</code>: збільште значення, на яке вказує <code>p</code>, на 1 (розіменування <code>*p</code>).",
    ],
    starter: raw`#include <iostream>

void swapValues(int& a, int& b) {
    // TODO: поміняти a і b місцями
}

void increment(int* p) {
    // TODO: збільшити *p на 1
}

int main() {
    int a = 1, b = 2;
    swapValues(a, b);
    std::cout << a << " " << b << std::endl;

    int x = 10;
    increment(&x);
    increment(&x);
    std::cout << x << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "swapValues міняє значення: 2 1", has: "2 1" },
      { on: "stdout", name: "Двічі increment: 12", has: "2 1\n12" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2 1\n12" },
      { on: "source", name: "Є розіменування вказівника", matches: "\\*\\s*p\\b" },
    ],
  },
  {
    ...base, id: "cpp-raii-guard", lesson: "cpp/8", xp: 35,
    title: "RAII: клас Guard із конструктором і деструктором",
    context: "RAII: ресурс (файл, мютекс, з'єднання) захоплюється в конструкторі й звільняється в деструкторі, який C++ викликає сам при виході зі scope. Забути закрити ресурс стає неможливо.",
    brief: [
      "Допишіть конструктор класу <code>Guard</code> (виводить <code>acquire &lt;name&gt;</code>) і деструктор <code>~Guard()</code> (виводить <code>release &lt;name&gt;</code>).",
      "У <code>main</code> об'єкт створюється всередині блоку <code>{ }</code>: деструктор спрацює автоматично на його закритті, до слова <code>end</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>

class Guard {
    std::string name;

public:
    // TODO: конструктор Guard(std::string n): вивести "acquire <name>"
    // TODO: деструктор ~Guard(): вивести "release <name>"
};

int main() {
    std::cout << "start" << std::endl;
    {
        Guard g("A");
        std::cout << "work" << std::endl;
    }
    std::cout << "end" << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Конструктор захоплює ресурс", has: "start\nacquire A\nwork" },
      { on: "stdout", name: "Деструктор звільняє ресурс на виході з блоку", has: "work\nrelease A\nend" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "start\nacquire A\nwork\nrelease A\nend" },
      { on: "source", name: "Описано деструктор", matches: "~\\s*Guard\\s*\\(" },
    ],
  },
  {
    ...base, id: "cpp-virtual-shapes", lesson: "cpp/9", xp: 40,
    title: "Віртуальні функції: фігури через базовий клас",
    context: "Віртуальна функція дозволяє працювати з об'єктом через вказівник на базовий клас, а викликається версія нащадка. Так будують розширювані системи: платіжні методи, фігури, обробники подій.",
    brief: [
      "Базовий клас <code>Shape</code> з чисто віртуальними <code>area()</code> і <code>name()</code> уже написаний. Реалізуйте <code>Circle</code> (радіус, <code>3.14159265 * r * r</code>) та <code>Rect</code> (ширина, висота): <code>name()</code> повертає <code>Коло</code> / <code>Прямокутник</code>, обидва методи позначте <code>override</code>.",
    ],
    starter: raw`#include <iomanip>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

class Shape {
public:
    virtual double area() const = 0;
    virtual std::string name() const = 0;
    virtual ~Shape() = default;
};

// TODO: class Circle : public Shape (конструктор Circle(double r))
// TODO: class Rect : public Shape (конструктор Rect(double w, double h))

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(2));
    shapes.push_back(std::make_unique<Rect>(3, 4));
    std::cout << std::fixed << std::setprecision(2);
    for (const auto& s : shapes) {
        std::cout << s->name() << ": " << s->area() << std::endl;
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Коло: 12.57", has: "Коло: 12.57" },
      { on: "stdout", name: "Прямокутник: 12.00", has: "Прямокутник: 12.00" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Коло: 12.57\nПрямокутник: 12.00" },
      { on: "source", name: "Нащадки успадковують Shape", matches: "class\\s+Circle\\s*:\\s*public\\s+Shape[\\s\\S]*class\\s+Rect\\s*:\\s*public\\s+Shape" },
      { on: "source", name: "Методи позначено override", has: "override" },
    ],
  },
  {
    ...base, id: "cpp-stl-algorithms", lesson: "cpp/10", xp: 40,
    title: "STL: сортування лямбдою та accumulate",
    context: "Стандартна бібліотека вже містить сортування, пошук, підсумовування. Лямбда-вираз коротко описує, як порівнювати елементи: за довжиною, за ціною, за датою.",
    brief: [
      "Відсортуйте <code>words</code> через <code>std::sort</code> із лямбдою: спочатку за довжиною слова (коротші першими), а за однакової довжини за алфавітом. Виведіть слова в один рядок через пробіл.",
      "Другим рядком виведіть <code>Всього літер: 24</code>: сумарна довжина всіх слів через <code>std::accumulate</code> (з <code>&lt;numeric&gt;</code>).",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> words = {"banana", "kiwi", "apple", "fig", "cherry"};

    // TODO 1: std::sort із лямбдою: за довжиною, потім за алфавітом
    for (const auto& w : words) std::cout << w << " ";
    std::cout << std::endl;

    // TODO 2: сумарна довжина слів через std::accumulate
    int total = 0;
    std::cout << "Всього літер: " << total << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Слова відсортовано за довжиною й алфавітом", has: "fig kiwi apple banana cherry" },
      { on: "stdout", name: "Всього літер: 24", has: "Всього літер: 24" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "fig kiwi apple banana cherry\nВсього літер: 24" },
      { on: "source", name: "Використано лямбду в sort", matches: "sort\\([^;]*\\[[^\\]]*\\]\\s*\\(" },
      { on: "source", name: "Використано accumulate", has: "accumulate(" },
    ],
  },
];
