// Практичні завдання глави «Типи користувача й пам'ять», частина a (уроки 32–37). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04a: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-struct-rect", lesson: "cpp/32", xp: 25,
    title: "Структура Rect і агрегатна ініціалізація",
    context: "Пов'язані дані (координати, розміри, запис із бази) зручно тримати в одній структурі, а не в окремих змінних. Агрегатна ініціалізація створює таку структуру одним рядком.",
    brief: [
      "Структура <code>Rect</code> уже описана. Допишіть <code>area</code>: вона повертає площу прямокутника (ширина на висоту).",
      "У <code>main</code> створіть <code>Rect b</code> із шириною 5 і висотою 6 <b>агрегатною ініціалізацією</b> у фігурних дужках. Вивід: <code>a: 12</code> і <code>b: 30</code>, кожен в окремому рядку.",
    ],
    starter: raw`#include <iostream>

struct Rect {
    int w;
    int h;
};

int area(const Rect& r) {
    // TODO: поверніть площу (w * h)
    return 0;
}

int main() {
    Rect a{3, 4};
    std::cout << "a: " << area(a) << "\n";

    // TODO: створіть Rect b із w = 5, h = 6 у фігурних дужках
    Rect b{};
    std::cout << "b: " << area(b) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Площа a дорівнює 12", has: "a: 12\n", hint: "Площа це добуток полів r.w і r.h." },
      { on: "stdout", name: "Площа b дорівнює 30", has: "b: 30", hint: "Порожні дужки {} обнуляють поля: задайте значення в дужках." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "a: 12\nb: 30\n", hint: "Рівно два рядки, формат «a: число» і «b: число»." },
      { on: "source", name: "Агрегатна ініціалізація {5, 6}", matches: "\\{\\s*5\\s*,\\s*6\\s*\\}", hint: "Значення полів у порядку оголошення: спершу ширина, потім висота." },
    ],
  },
  {
    ...base, id: "cpp-class-account", lesson: "cpp/33", xp: 25,
    title: "Клас Account: приватний баланс і методи",
    context: "Клас ховає дані за інтерфейсом і сам стежить за правилами: з рахунку не можна зняти більше, ніж там є. Так захищають інваріанти в реальних системах.",
    brief: [
      "У класі <code>Account</code> поле <code>balance_</code> приватне. Допишіть <code>deposit</code> (додає суму), <code>withdraw</code> (знімає суму й повертає <code>true</code>; якщо коштів не вистачає, баланс не змінюється, а повертається <code>false</code>) і <code>balance</code>.",
      "Очікуваний вивід: <code>1 70</code> і <code>0 70</code> (результат операції, пробіл, баланс).",
    ],
    starter: raw`#include <iostream>

class Account {
public:
    void deposit(int amount) {
        // TODO: збільшіть balance_ на amount
    }
    bool withdraw(int amount) {
        // TODO: якщо amount більший за balance_, поверніть false;
        // інакше зменште balance_ і поверніть true
        return false;
    }
    int balance() const {
        // TODO: поверніть balance_
        return 0;
    }

private:
    int balance_ = 0;
};

int main() {
    Account acc;
    acc.deposit(100);
    std::cout << acc.withdraw(30) << " " << acc.balance() << "\n";
    std::cout << acc.withdraw(500) << " " << acc.balance() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Успішне зняття: 1 70", has: "1 70\n", hint: "100 - 30 = 70, а withdraw повертає true, що друкується як 1." },
      { on: "stdout", name: "Відмова при нестачі коштів: 0 70", has: "0 70", hint: "Якщо amount > balance_, поверніть false і не чіпайте баланс." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "1 70\n0 70\n", hint: "Рівно два рядки." },
      { on: "source", name: "Баланс змінюється всередині класу", matches: "balance_\\s*[-+]=", hint: "Змінюйте balance_ через += або -= у методах класу." },
    ],
  },
  {
    ...base, id: "cpp-ctor-tracer", lesson: "cpp/34", xp: 30,
    title: "Конструктор зі списком ініціалізації й деструктор",
    context: "Конструктор готує об'єкт до роботи, деструктор прибирає за ним: закриває файл, знімає блокування. Порядок їхніх викликів треба знати, щоб не помилитися з ресурсами.",
    brief: [
      "Клас <code>Tracer</code> має поле <code>name_</code>. Допишіть конструктор, який ініціалізує його <b>списком ініціалізації</b> і друкує <code>create ім'я</code>, та деструктор, який друкує <code>destroy ім'я</code>.",
      "Вивід для коду з <code>main</code>: <code>create A</code>, <code>create B</code>, <code>in scope</code>, <code>destroy B</code>, <code>destroy A</code>, <code>end</code> (деструктори викликаються у зворотному порядку).",
    ],
    starter: raw`#include <iostream>
#include <string>

class Tracer {
public:
    Tracer(const std::string& name) {
        // TODO: ініціалізуйте name_ у списку ініціалізації (після дужок, через двокрапку)
        // і виведіть "create ім'я"
        (void)name;
    }
    ~Tracer() {
        // TODO: виведіть "destroy ім'я"
    }

private:
    std::string name_;
};

int main() {
    {
        Tracer a("A");
        Tracer b("B");
        std::cout << "in scope\n";
    }
    std::cout << "end\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Конструктори викликані по черзі", has: "create A\ncreate B\n", hint: "Конструктор друкує «create » і значення name_." },
      { on: "stdout", name: "Деструктори у зворотному порядку", has: "destroy B\ndestroy A\n", hint: "Деструктор друкує «destroy » і name_; порядок C++ забезпечує сам." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "create A\ncreate B\nin scope\ndestroy B\ndestroy A\nend\n", hint: "Перевірте, що name_ справді заповнене до друку, а зайвих рядків немає." },
      { on: "source", name: "Список ініціалізації name_(name)", matches: "\\)\\s*:\\s*name_\\s*\\(\\s*name\\s*\\)", hint: "Форма: Tracer(...) : name_(name) { ... }." },
    ],
  },
  {
    ...base, id: "cpp-const-refs", lesson: "cpp/35", xp: 25,
    title: "Посилання та const-посилання у параметрах",
    context: "Вектор великого розміру не копіюють при кожному виклику: його передають за const-посиланням. А щоб функція змінила аргумент, потрібне неконстантне посилання.",
    brief: [
      "Допишіть <code>addBonus</code>: вона змінює переданий <code>score</code> (параметр-посилання). Допишіть <code>sum</code>, яка приймає вектор за <b>const-посиланням</b> і повертає суму елементів.",
      "Очікуваний вивід: <code>score 15</code> і <code>sum 60</code>.",
    ],
    starter: raw`#include <iostream>
#include <vector>

void addBonus(int score, int bonus) {
    // TODO: змініть параметр на посилання (int&) і додайте bonus до score
    (void)score;
    (void)bonus;
}

int sum(std::vector<int> v) {
    // TODO: прийміть вектор за const-посиланням і поверніть суму елементів
    (void)v;
    return 0;
}

int main() {
    int score = 10;
    addBonus(score, 5);
    std::cout << "score " << score << "\n";
    const std::vector<int> prices{10, 20, 30};
    std::cout << "sum " << sum(prices) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "score змінився на 15", has: "score 15\n", hint: "Параметр int без & отримує копію; потрібен int& score." },
      { on: "stdout", name: "Сума елементів дорівнює 60", has: "sum 60", hint: "Пройдіть по v циклом for (int x : v) і накопичуйте суму." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "score 15\nsum 60\n", hint: "Рівно два рядки." },
      { on: "source", name: "Вектор приймається за const-посиланням", matches: "const\\s+std::vector<int>\\s*&", hint: "Підпис: const std::vector<int>& v." },
      { on: "source", name: "Параметр score це посилання", matches: "int\\s*&\\s*score", hint: "Додайте & між типом і назвою: int& score." },
    ],
  },
  {
    ...base, id: "cpp-pointers-references", lesson: "cpp/36", xp: 30,
    title: "Вказівники: swap, increment і перевірка nullptr",
    context: "Вказівник дозволяє функції змінити чужу змінну й може бути порожнім. Перед розіменуванням його перевіряють на nullptr: так уникають найпоширенішої аварії в C++.",
    brief: [
      "Допишіть <code>swapValues(int*, int*)</code>: поміняйте значення, на які вказують аргументи. Допишіть <code>increment(int*)</code>: збільште значення за вказівником на 1.",
      "Допишіть <code>setIfValid</code>: якщо вказівник дорівнює <code>nullptr</code>, поверніть <code>false</code>, інакше запишіть значення й поверніть <code>true</code>. Очікуваний вивід: <code>2 1</code>, <code>12</code>, <code>0</code>, <code>1</code>, <code>7</code> (кожне в окремому рядку).",
    ],
    starter: raw`#include <iostream>

void swapValues(int* a, int* b) {
    // TODO: поміняти *a і *b місцями
    (void)a;
    (void)b;
}

void increment(int* p) {
    // TODO: збільшити *p на 1
    (void)p;
}

bool setIfValid(int* p, int value) {
    // TODO: якщо p == nullptr, повернути false; інакше записати value у *p і повернути true
    (void)p;
    (void)value;
    return false;
}

int main() {
    int a = 1, b = 2;
    swapValues(&a, &b);
    std::cout << a << " " << b << "\n";

    int x = 10;
    increment(&x);
    increment(&x);
    std::cout << x << "\n";

    std::cout << setIfValid(nullptr, 5) << "\n";
    std::cout << setIfValid(&x, 7) << "\n";
    std::cout << x << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "swapValues міняє значення: 2 1", has: "2 1\n", hint: "Збережіть *a у тимчасову змінну, потім присвойте *a = *b і *b = тимчасова." },
      { on: "stdout", name: "Двічі increment: 12", has: "2 1\n12\n", hint: "Збільшуйте саме значення за вказівником (*p), а не сам вказівник." },
      { on: "stdout", name: "nullptr відхилено, коректний вказівник прийнято", has: "12\n0\n1\n7", hint: "Спершу if (p == nullptr) return false;, потім *p = value." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2 1\n12\n0\n1\n7\n", hint: "П'ять рядків, жодних зайвих." },
      { on: "source", name: "Є перевірка на nullptr", matches: "nullptr", hint: "Порівняйте вказівник із nullptr перед розіменуванням." },
    ],
  },
  {
    ...base, id: "cpp-new-delete-squares", lesson: "cpp/37", xp: 30,
    title: "new[] і delete[]: масив квадратів у купі",
    context: "Коли розмір даних відомий лише під час роботи, пам'ять беруть у купі через new. Кожному new відповідає свій delete, інакше пам'ять витікає.",
    brief: [
      "Допишіть <code>makeSquares</code>: заповніть масив числами <code>i * i</code>. У <code>main</code> звільніть масив через <code>delete[]</code>, а окреме число, створене <code>new int(42)</code>, через <code>delete</code>.",
      "Очікуваний вивід: <code>0 1 4 9 16</code> (в одному рядку) і <code>42</code> (в наступному).",
    ],
    starter: raw`#include <iostream>

int* makeSquares(int n) {
    int* a = new int[n]();
    // TODO: заповніть a[i] значенням i * i
    return a;
}

int main() {
    const int n = 5;
    int* squares = makeSquares(n);
    for (int i = 0; i < n; ++i) {
        std::cout << squares[i] << (i + 1 < n ? " " : "\n");
    }
    // TODO: звільніть масив squares

    int* single = new int(42);
    std::cout << *single << "\n";
    // TODO: звільніть single
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Квадрати: 0 1 4 9 16", has: "0 1 4 9 16\n", hint: "У циклі присвойте a[i] = i * i." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "0 1 4 9 16\n42\n", hint: "Два рядки: квадрати й число 42." },
      { on: "source", name: "Масив звільнено через delete[]", matches: "delete\\s*\\[\\s*\\]\\s*squares", hint: "Пам'ять, взяту через new[], звільняють через delete[]." },
      { on: "source", name: "Окреме число звільнено через delete", matches: "delete\\s+single\\s*;", hint: "Для new int(42) потрібен звичайний delete single;." },
    ],
  },
];
