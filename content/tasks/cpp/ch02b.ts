// Практичні завдання глави «Основи мови», частина b (уроки 12–17). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02b: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-multiples", lesson: "cpp/12", xp: 20,
    title: "Числа, кратні 3 або 5, і їх сума",
    context: "Цикл з умовою всередині: перебрати діапазон, відібрати потрібне, накопичити суму. Основа будь-якої обробки даних: суми, лічильники, фільтри.",
    brief: [
      "У циклі <code>for</code> від 1 до 20 виведіть в один рядок через пробіл числа, що діляться на 3 <b>або</b> на 5. Наступним рядком виведіть <code>Сума: 98</code>: суму накопичуйте у змінній.",
      "Пробіл ставте лише <i>між</i> числами, без зайвого пробілу наприкінці рядка.",
    ],
    starter: raw`#include <iostream>

int main() {
    int sum = 0;
    bool first = true;
    for (int i = 1; i <= 20; i++) {
        // TODO: якщо i кратне 3 або 5: вивести i (з пробілом лише між числами) і додати до sum
        (void)first;
    }
    std::cout << std::endl;
    std::cout << "Сума: " << sum << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Числа: 3 5 6 9 10 12 15 18 20", has: "3 5 6 9 10 12 15 18 20", hint: "Число підходить, якщо залишок від ділення на 3 або на 5 дорівнює нулю." },
      { on: "stdout", name: "Сума: 98", has: "Сума: 98", hint: "Додавайте до sum лише відібрані числа, а не кожне i." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "3 5 6 9 10 12 15 18 20\nСума: 98", hint: "Спочатку рядок із числами, потім рядок із сумою; зайвих пробілів чи рядків немає." },
      { on: "source", name: "Кратність перевіряється через %", has: "%", hint: "Оператор залишку від ділення записується знаком відсотка." },
    ],
  },
  {
    ...base, id: "cpp-function-helpers", lesson: "cpp/13", xp: 20,
    title: "Три функції: сума, просте число, ділення з остачею",
    context: "Код, який повторюється, виносять у функції з чіткими параметрами й результатом. Результат повертають через return, а другий результат віддають через параметр-посилання.",
    brief: [
      "Допишіть три функції: <code>int sumTo(int n)</code> (сума чисел від 1 до n), <code>bool isPrime(int n)</code> (чи просте число) і <code>void divmod(int a, int b, int&amp; q, int&amp; r)</code>, що записує частку в <code>q</code>, а остачу в <code>r</code>.",
      "Функція <code>main</code> уже готова й друкує три рядки: <code>sumTo(100) = 5050</code>, <code>Прості: 11 13 17 19</code> і <code>17 / 5 = 3 остача 2</code>.",
    ],
    starter: raw`#include <iostream>

// TODO: сума 1..n
int sumTo(int n) {
    (void)n;
    return 0;
}

// TODO: просте число більше за 1 і не має дільників, окрім 1 та себе
bool isPrime(int n) {
    (void)n;
    return false;
}

// TODO: q = a / b, r = a % b через параметри-посилання
void divmod(int a, int b, int q, int r) {
    (void)a; (void)b; (void)q; (void)r;
}

int main() {
    std::cout << "sumTo(100) = " << sumTo(100) << "\n";
    std::cout << "Прості:";
    for (int i = 10; i <= 20; i++) {
        if (isPrime(i)) std::cout << " " << i;
    }
    std::cout << "\n";
    int q = 0, r = 0;
    divmod(17, 5, q, r);
    std::cout << "17 / 5 = " << q << " остача " << r << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума 1..100 дорівнює 5050", has: "sumTo(100) = 5050", hint: "Накопичуйте суму у змінній циклом від 1 до n включно й поверніть її." },
      { on: "stdout", name: "Прості числа від 10 до 20", has: "Прості: 11 13 17 19", hint: "Перевіряйте дільники від 2, поки d * d не перевищить n; числа менші за 2 не прості." },
      { on: "stdout", name: "Частка й остача", has: "17 / 5 = 3 остача 2", hint: "Щоб функція змінила змінні викликача, параметри мають бути посиланнями." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "sumTo(100) = 5050\nПрості: 11 13 17 19\n17 / 5 = 3 остача 2", hint: "Не змінюйте main: рядки виводу вже задані." },
      { on: "source", name: "Параметри q і r беруться за посиланням", matches: "int\\s*&\\s*q", hint: "У заголовку divmod біля типу q і r має стояти знак амперсанда." },
    ],
  },
  {
    ...base, id: "cpp-overload-default", lesson: "cpp/14", xp: 25,
    title: "Перевантаження і аргумент за замовчуванням",
    context: "C++ дозволяє мати кілька функцій з однією назвою (перевантаження) і пропускати аргументи, якщо для них задано значення за замовчуванням. Так робляться зручні API: power(5) і power(2, 10).",
    brief: [
      "Допишіть <code>int power(int base, int exp = 2)</code>: піднесення до степеня циклом, за замовчуванням квадрат.",
      "Допишіть дві перевантажені функції <code>area</code>: <code>double area(double r)</code> (коло, <code>3.14159265 * r * r</code>) і <code>double area(double w, double h)</code> (прямокутник).",
    ],
    starter: raw`#include <iostream>
#include <iomanip>

// TODO: піднесення до степеня циклом; значення за замовчуванням для exp має бути 2
int power(int base, int exp = 1) {
    (void)base; (void)exp;
    return 0;
}

// TODO: double area(double r): площа кола
double area(double r) {
    (void)r;
    return 0;
}

// TODO: додайте перевантаження double area(double w, double h): площа прямокутника

int main() {
    std::cout << power(5) << std::endl;
    std::cout << power(2, 10) << std::endl;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << area(2) << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "power(5) дає 25, power(2, 10) дає 1024", has: "25\n1024", hint: "Помножте результат на base рівно exp разів; значення за замовчуванням для exp має бути 2." },
      { on: "stdout", name: "Площа кола з r = 2: 12.57", has: "12.57", hint: "Формула кола: 3.14159265 * r * r." },
      { on: "stdout", name: "Площа прямокутника 3 x 4: 12.00", has: "12.00", hint: "Додайте до main виклик area(3, 4) і перевантажену функцію з двома параметрами." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "25\n1024\n12.57\n12.00", hint: "Четвертий рядок виводу це результат area(3, 4) з двома знаками після крапки." },
      { on: "source", name: "Аргумент за замовчуванням exp = 2", matches: "exp\\s*=\\s*2", hint: "Значення за замовчуванням записується в заголовку функції після імені параметра." },
    ],
  },
  {
    ...base, id: "cpp-lambda-capture", lesson: "cpp/15", xp: 25,
    title: "Лямбди із захопленням за значенням і за посиланням",
    context: "Лямбди передають у сортування, пошук і обробники подій. Головне вміти керувати захопленням: копія фіксує значення на момент створення, а посилання бачить зміни.",
    brief: [
      "У заготовці три лямбди-заглушки. Перепишіть їх: <code>cube</code> повертає куб числа; <code>addBase</code> захоплює <code>base</code> <b>за значенням</b> і повертає <code>x + base</code>; <code>tick</code> захоплює <code>counter</code> <b>за посиланням</b> і збільшує його на 1.",
      "Очікуваний вивід: <code>cube(3) = 27</code>, <code>addBase(5) = 15</code> (хоча <code>base</code> потім змінюється на 100, копія пам'ятає 10), <code>counter = 3</code> після трьох викликів <code>tick</code>.",
    ],
    starter: raw`#include <iostream>

int main() {
    int base = 10;
    // TODO: cube повертає x * x * x
    auto cube = [](int x) { return x; };
    // TODO: захопіть base за значенням і поверніть x + base
    auto addBase = [](int x) { return x; };
    base = 100;

    int counter = 0;
    // TODO: захопіть counter за посиланням і збільшіть його на 1
    auto tick = []() {};
    tick();
    tick();
    tick();

    std::cout << "cube(3) = " << cube(3) << "\n";
    std::cout << "addBase(5) = " << addBase(5) << "\n";
    std::cout << "counter = " << counter << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Куб числа: cube(3) = 27", has: "cube(3) = 27", hint: "Тіло лямбди: return x * x * x;" },
      { on: "stdout", name: "Копія пам'ятає base = 10", has: "addBase(5) = 15", hint: "Захоплення за значенням зберігає base на момент створення лямбди, до присвоєння 100." },
      { on: "stdout", name: "Лічильник змінено через посилання", has: "counter = 3", hint: "Без амперсанда в захопленні лямбда змінювала б власну копію." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "cube(3) = 27\naddBase(5) = 15\ncounter = 3", hint: "Не змінюйте рядки виводу в кінці main." },
      { on: "source", name: "Захоплення за посиланням [&counter]", matches: "\\[\\s*&\\s*counter\\s*\\]", hint: "У квадратних дужках лямбди перед іменем змінної ставте амперсанд." },
      { on: "source", name: "Захоплення за значенням [base]", matches: "\\[\\s*base\\s*\\]", hint: "У квадратних дужках просто напишіть ім'я змінної." },
    ],
  },
  {
    ...base, id: "cpp-recursion-basics", lesson: "cpp/16", xp: 30,
    title: "Рекурсія: факторіал, НСД і довжина двійкового запису",
    context: "Рекурсія природна для задач, що зводяться до меншої копії себе: від факторіала до обходу дерев. Для кожної рекурсивної функції треба чітко знати базовий випадок.",
    brief: [
      "Допишіть три <b>рекурсивні</b> функції: <code>long long factorial(int n)</code> (0 та 1 дають 1), <code>int gcd(int a, int b)</code> (алгоритм Евкліда: якщо <code>b == 0</code>, результат <code>a</code>, інакше <code>gcd(b, a % b)</code>) і <code>int bitLength(int n)</code> (скільки двійкових цифр у n: для 0 це 0, інакше 1 плюс довжина <code>n / 2</code>).",
      "Очікуваний вивід: <code>10! = 3628800</code>, <code>gcd(84, 36) = 12</code>, <code>bits(37) = 6</code>.",
    ],
    starter: raw`#include <iostream>

// TODO: базовий випадок n <= 1, крок n * factorial(n - 1)
long long factorial(int n) {
    (void)n;
    return 0;
}

// TODO: базовий випадок b == 0, крок gcd(b, a % b)
int gcd(int a, int b) {
    (void)a; (void)b;
    return 0;
}

// TODO: базовий випадок n == 0, крок 1 + bitLength(n / 2)
int bitLength(int n) {
    (void)n;
    return 0;
}

int main() {
    std::cout << "10! = " << factorial(10) << "\n";
    std::cout << "gcd(84, 36) = " << gcd(84, 36) << "\n";
    std::cout << "bits(37) = " << bitLength(37) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "10! = 3628800", has: "10! = 3628800", hint: "Базовий випадок повертає 1, а крок множить n на результат для n - 1." },
      { on: "stdout", name: "НСД чисел 84 і 36 дорівнює 12", has: "gcd(84, 36) = 12", hint: "Коли b стає нулем, відповіддю є a; інакше викличте функцію з b та залишком a % b." },
      { on: "stdout", name: "Довжина двійкового запису 37 дорівнює 6", has: "bits(37) = 6", hint: "37 це 100101; кожен виклик відкидає одну цифру діленням на 2." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "10! = 3628800\ngcd(84, 36) = 12\nbits(37) = 6", hint: "Не змінюйте main: рядки виводу вже задані." },
      { on: "source", name: "factorial викликає сама себе", matches: "factorial\\s*\\(\\s*n\\s*-\\s*1\\s*\\)", hint: "Рекурсивний крок викликає factorial з аргументом на одиницю меншим." },
      { on: "source", name: "gcd викликає сама себе", matches: "gcd\\s*\\(\\s*b\\s*,", hint: "У кроці Евкліда першим аргументом стає попередній b." },
    ],
  },
  {
    ...base, id: "cpp-constexpr-fib", lesson: "cpp/17", xp: 30,
    title: "constexpr: числа Фібоначчі й перевірка при збірці",
    context: "Значення, відомі при збірці, віддають компілятору через constexpr, а припущення фіксують static_assert: помилка тоді виявляється ще до запуску програми.",
    brief: [
      "Зробіть функцію <code>fib</code> <b>constexpr</b> і реалізуйте її циклом (<code>fib(0) = 0</code>, <code>fib(1) = 1</code>, далі сума двох попередніх). Змініть <code>kCount</code> на <code>constexpr</code>, щоб він міг бути розміром масиву.",
      "Додайте <code>static_assert</code>, що <code>fib(10) == 55</code>. Очікуваний вивід: рядок <code>0 1 1 2 3 5 8 13 21 34</code> і рядок <code>fib(10) = 55</code>.",
    ],
    starter: raw`#include <iostream>

// TODO: зробіть функцію constexpr і напишіть цикл (a = 0, b = 1, на кожному кроці зсув пари)
int fib(int n) {
    (void)n;
    return 0;
}

int main() {
    // TODO: змініть const на constexpr
    const int kCount = 10;
    // TODO: додайте перевірку під час збірки, що fib(10) дорівнює 55

    int table[kCount];
    for (int i = 0; i < kCount; i++) table[i] = fib(i);

    for (int i = 0; i < kCount; i++) {
        if (i > 0) std::cout << " ";
        std::cout << table[i];
    }
    std::cout << "\n";
    std::cout << "fib(10) = " << fib(10) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Таблиця перших десяти чисел", has: "0 1 1 2 3 5 8 13 21 34", hint: "Тримайте дві змінні a та b і на кожному кроці замінюйте пару на (b, a + b)." },
      { on: "stdout", name: "fib(10) = 55", has: "fib(10) = 55", hint: "Цикл мусить виконатися n разів, а повернути слід a." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "0 1 1 2 3 5 8 13 21 34\nfib(10) = 55", hint: "Не змінюйте код друку в main." },
      { on: "source", name: "Функція fib є constexpr", matches: "constexpr\\s+int\\s+fib", hint: "Слово constexpr ставиться перед типом результату функції." },
      { on: "source", name: "Є static_assert", has: "static_assert", hint: "Перший аргумент умова, другий повідомлення на випадок хибності." },
      { on: "source", name: "kCount є constexpr", matches: "constexpr\\s+int\\s+kCount", hint: "Змініть слово const на constexpr в оголошенні kCount." },
    ],
  },
];
