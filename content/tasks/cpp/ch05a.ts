// Практичні завдання глави «Абстракція», частина a (уроки 49–54). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05a: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-inherit-employee", lesson: "cpp/49", xp: 25,
    title: "Менеджер як нащадок працівника",
    context: "Спільні поля й методи виносять у базовий клас, а нащадки додають своє. Так не доводиться копіювати код, а порядок конструкторів і деструкторів лишається під контролем.",
    brief: [
      "Клас <code>Employee</code> (ім'я й оклад) уже написаний: його конструктор друкує <code>працівник ім'я</code>, деструктор <code>~працівник ім'я</code>. Створіть <code>Manager</code> як <b>публічного нащадка</b> з додатковим полем бонусу. Конструктор приймає ім'я, оклад і бонус та передає перші два базі <b>списком ініціалізації</b>, а сам друкує <code>менеджер ім'я</code>.",
      "Метод <code>total()</code> повертає оклад плюс бонус. Деструктор друкує <code>~менеджер ім'я</code>. Очікуваний вивід дивіться в перевірках: порядок рядків показує, що база будується першою, а знищується останньою.",
    ],
    starter: raw`#include <iostream>
#include <string>

class Employee {
public:
    Employee(const std::string& name, int salary) : name_(name), salary_(salary) {
        std::cout << "працівник " << name_ << "\n";
    }
    ~Employee() { std::cout << "~працівник " << name_ << "\n"; }
    const std::string& name() const { return name_; }
    int salary() const { return salary_; }

private:
    std::string name_;
    int salary_;
};

// TODO: зробіть Manager публічним нащадком Employee, додайте поле bonus_
class Manager {
public:
    Manager(const std::string& /*name*/, int /*salary*/, int /*bonus*/) {
        // TODO: база через список ініціалізації; тут надрукуйте "менеджер " + ім'я
    }
    // TODO: ~Manager друкує "~менеджер " + ім'я
    int total() const { return 0; }  // TODO: оклад + бонус
    std::string name() const { return ""; }
};

int main() {
    {
        Manager m("Ада", 5000, 1200);
        std::cout << m.name() << ": " << m.total() << "\n";
    }
    std::cout << "кінець\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Спершу будується база", has: "працівник Ада\nменеджер Ада", hint: "Базовий конструктор спрацьовує до тіла конструктора нащадка." },
      { on: "stdout", name: "Підсумок 6200", has: "Ада: 6200", hint: "total() додає успадкований оклад salary() до власного бонусу." },
      { on: "stdout", name: "Знищення у зворотному порядку", has: "~менеджер Ада\n~працівник Ада", hint: "Нащадок знищується першим, база останньою." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "працівник Ада\nменеджер Ада\nАда: 6200\n~менеджер Ада\n~працівник Ада\nкінець", hint: "Шість рядків: п'ять до виходу з блоку й «кінець» після нього." },
      { on: "source", name: "Публічне наслідування", matches: "class\\s+Manager\\s*:\\s*public\\s+Employee", hint: "Після імені класу поставте двокрапку, public і назву бази." },
      { on: "source", name: "База в списку ініціалізації", matches: "Employee\\s*\\(\\s*name\\s*,\\s*salary\\s*\\)", hint: "Виклик конструктора бази пишуть після двокрапки в заголовку конструктора." },
    ],
  },
  {
    ...base, id: "cpp-virtual-shapes", lesson: "cpp/50", xp: 35,
    title: "Віртуальні функції: фігури через базовий клас",
    context: "Віртуальна функція дозволяє працювати з об'єктом через вказівник на базовий клас, а викликається версія нащадка. Так будують розширювані системи: платіжні методи, фігури, обробники подій.",
    brief: [
      "Базовий клас <code>Shape</code> із віртуальними <code>area()</code>, <code>name()</code> і віртуальним деструктором уже написаний. Реалізуйте <code>Circle</code> (радіус, <code>3.14159265 * r * r</code>) та <code>Rect</code> (ширина, висота): <code>name()</code> повертає <code>Коло</code> / <code>Прямокутник</code>, обидва методи позначте <code>override</code>.",
      "Останній рядок виводу <code>main</code> показує <b>зрізання</b>: копія фігури за значенням у змінну типу <code>Shape</code> втрачає поведінку нащадка й називається <code>Фігура</code>. Цей рядок уже є в заготовці, його не змінюйте.",
    ],
    starter: raw`#include <iomanip>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

class Shape {
public:
    virtual double area() const { return 0; }
    virtual std::string name() const { return "Фігура"; }
    virtual ~Shape() = default;
};

// TODO: class Circle : public Shape (конструктор Circle(double r))
// TODO: class Rect : public Shape (конструктор Rect(double w, double h))
// Обидва методи area() і name() мають бути з override.
class Circle : public Shape {
public:
    Circle(double) {}
};

class Rect : public Shape {
public:
    Rect(double, double) {}
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(2));
    shapes.push_back(std::make_unique<Rect>(3, 4));
    std::cout << std::fixed << std::setprecision(2);
    for (const auto& s : shapes) {
        std::cout << s->name() << ": " << s->area() << std::endl;
    }
    Shape sliced = *shapes[0];
    std::cout << "зрізана копія: " << sliced.name() << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Коло: 12.57", has: "Коло: 12.57", hint: "Площа круга це 3.14159265 * r * r, де r = 2." },
      { on: "stdout", name: "Прямокутник: 12.00", has: "Прямокутник: 12.00", hint: "name() і area() мають перевизначати віртуальні функції бази." },
      { on: "stdout", name: "Зрізана копія стає Фігурою", has: "зрізана копія: Фігура", hint: "Копія за значенням у Shape лишає тільки базову частину." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Коло: 12.57\nПрямокутник: 12.00\nзрізана копія: Фігура", hint: "Три рядки: дві фігури й зрізана копія." },
      { on: "source", name: "Нащадки успадковують Shape", matches: "class\\s+Circle\\s*:\\s*public\\s+Shape[\\s\\S]*class\\s+Rect\\s*:\\s*public\\s+Shape", hint: "Обидва класи оголошують публічне наслідування від Shape." },
      { on: "source", name: "Методи позначено override", matches: "area\\s*\\(\\s*\\)\\s*const\\s+override[\\s\\S]*name\\s*\\(\\s*\\)\\s*const\\s+override", hint: "Після const у сигнатурі додайте override, щоб компілятор перевірив збіг із базою." },
    ],
  },
  {
    ...base, id: "cpp-abstract-notifier", lesson: "cpp/51", xp: 30,
    title: "Інтерфейс Notifier і дві реалізації",
    context: "Код, що розсилає повідомлення, не повинен знати, куди вони йдуть. Інтерфейс відокремлює «що зробити» від «як»: нові канали додають без змін у розсилці.",
    brief: [
      "Інтерфейс <code>Notifier</code> із чисто віртуальним <code>send(const std::string&amp;)</code> уже описано. Реалізуйте <code>EmailNotifier</code> (друкує <code>email: повідомлення</code>) і <code>SmsNotifier</code> (друкує <code>sms: повідомлення</code>), позначивши <code>send</code> як <code>override</code>.",
      "Функція <code>broadcast</code> приймає вектор вказівників на інтерфейс і розсилає повідомлення кожному. Допишіть її тіло: виклик має йти через інтерфейс, а не через конкретні типи.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <vector>

class Notifier {
public:
    virtual void send(const std::string& msg) = 0;
    virtual ~Notifier() = default;
};

class EmailNotifier : public Notifier {
public:
    void send(const std::string& msg) override {
        // TODO: надрукуйте "email: " + msg
    }
};

class SmsNotifier : public Notifier {
public:
    void send(const std::string& msg) override {
        // TODO: надрукуйте "sms: " + msg
    }
};

void broadcast(const std::vector<Notifier*>& all, const std::string& msg) {
    // TODO: викличте send для кожного елемента
}

int main() {
    EmailNotifier email;
    SmsNotifier sms;
    std::vector<Notifier*> all{&email, &sms};
    broadcast(all, "привіт");
    broadcast(all, "бувай");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Email-канал працює", has: "email: привіт", hint: "send у EmailNotifier друкує префікс і повідомлення." },
      { on: "stdout", name: "SMS-канал працює", has: "sms: привіт", hint: "broadcast має викликати send у кожного елемента вектора." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "email: привіт\nsms: привіт\nemail: бувай\nsms: бувай", hint: "Для кожного повідомлення спершу email, потім sms." },
      { on: "source", name: "Виклик через вказівник на інтерфейс", matches: "->\\s*send\\s*\\(", hint: "Елементи вектора це вказівники: викликайте метод через стрілку." },
    ],
  },
  {
    ...base, id: "cpp-template-clamp", lesson: "cpp/52", xp: 30,
    title: "Шаблон clampTo для будь-якого типу",
    context: "Обмежити значення діапазоном потрібно для чисел, дробів і навіть рядків. Один шаблон замінює кілька однакових функцій і не дає помилкам розповзтися копіями.",
    brief: [
      "Напишіть шаблон функції <code>clampTo(v, lo, hi)</code>: якщо <code>v</code> менший за <code>lo</code>, повертає <code>lo</code>; якщо більший за <code>hi</code>, повертає <code>hi</code>; інакше <code>v</code>. Усі три аргументи мають один тип <code>T</code>, порівнювати можна лише через <code>&lt;</code>.",
      "У <code>main</code> функцію вже викликано для <code>int</code>, <code>double</code> і <code>std::string</code>. Вивід: <code>10</code>, <code>0</code>, <code>1</code>, <code>f</code>, кожне значення в окремому рядку.",
    ],
    starter: raw`#include <iostream>
#include <string>

template <typename T>
T clampTo(T v, T /*lo*/, T /*hi*/) {
    // TODO: поверніть lo, якщо v < lo; hi, якщо hi < v; інакше v
    return v;
}

int main() {
    std::cout << clampTo(15, 0, 10) << "\n";
    std::cout << clampTo(-3, 0, 10) << "\n";
    std::cout << clampTo(2.5, 0.0, 1.0) << "\n";
    std::cout << clampTo(std::string("m"), std::string("a"), std::string("f")) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Верхня межа для int", has: "10", hint: "Якщо hi < v, поверніть hi." },
      { on: "stdout", name: "Нижня межа для int", has: "10\n0\n", hint: "Якщо v < lo, поверніть lo." },
      { on: "stdout", name: "Працює для рядків", has: "1\nf", hint: "Той самий шаблон має працювати з std::string, бо рядки теж порівнюються через <." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "10\n0\n1\nf", hint: "Чотири рядки: int, int, double, string." },
      { on: "source", name: "Є шаблон функції", matches: "template\\s*<\\s*(typename|class)\\s+T\\s*>\\s*T\\s+clampTo", hint: "Оголосіть template <typename T> перед функцією." },
    ],
  },
  {
    ...base, id: "cpp-template-queue", lesson: "cpp/53", xp: 30,
    title: "Шаблон класу Queue<T>",
    context: "Черга задач, повідомлень чи запитів потрібна для різних типів елементів. Шаблон класу дає один контейнер, який працює з будь-яким типом без копіювання коду.",
    brief: [
      "Допишіть методи шаблона <code>Queue&lt;T&gt;</code>. <code>push</code> додає елемент у кінець, <code>pop</code> видаляє елемент із початку й повертає його, <code>size</code> повертає кількість. Усередині тримайте <code>std::vector&lt;T&gt;</code>.",
      "Вивід <code>main</code>: <code>1 2 1</code> (два вилучені числа й залишок), а другим рядком <code>a 1</code> для черги рядків.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <vector>

template <typename T>
class Queue {
public:
    void push(const T& v) {
        // TODO: додайте v у кінець items_
    }
    T pop() {
        // TODO: збережіть перший елемент, видаліть його з початку й поверніть
        return T{};
    }
    std::size_t size() const {
        // TODO: поверніть кількість елементів
        return 0;
    }

private:
    std::vector<T> items_;
};

int main() {
    Queue<int> q;
    q.push(1);
    q.push(2);
    q.push(3);
    int a = q.pop();
    int b = q.pop();
    std::cout << a << " " << b << " " << q.size() << "\n";

    Queue<std::string> words;
    words.push("a");
    words.push("b");
    std::string first = words.pop();
    std::cout << first << " " << words.size() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Числова черга: 1 2 1", has: "1 2 1", hint: "pop бере елемент із початку: items_.front(), потім erase(items_.begin())." },
      { on: "stdout", name: "Рядкова черга: a 1", has: "a 1", hint: "Той самий шаблон працює з std::string." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "1 2 1\na 1", hint: "Два рядки, значення через пробіл." },
      { on: "source", name: "Видалення з початку вектора", matches: "erase\\s*\\(\\s*items_\\.begin\\s*\\(\\s*\\)\\s*\\)", hint: "Видаляйте перший елемент через erase і begin." },
    ],
  },
  {
    ...base, id: "cpp-function-pipeline", lesson: "cpp/54", xp: 35,
    title: "Конвеєр дій на std::function",
    context: "Обробка даних часто складається з кроків, які налаштовують на льоту: додати, помножити, відфільтрувати. Виклики об'єктів із замиканнями дозволяють збирати такі конвеєри з готових шматків.",
    brief: [
      "Реалізуйте <code>makeAdder(n)</code>: вона повертає лямбду, що додає <code>n</code> до свого аргумента, захопивши <code>n</code> <b>за значенням</b>. Реалізуйте <code>applyAll</code>: вона по черзі застосовує всі функції з вектора до значення, передаючи результат кожної наступній, і повертає підсумок.",
      "У <code>main</code> конвеєр: додати 5, помножити на 2, додати -1. Для 10 вивід: <code>15</code> (лише перший крок) і <code>29</code> (увесь конвеєр), кожне в окремому рядку.",
    ],
    starter: raw`#include <functional>
#include <iostream>
#include <vector>

using Step = std::function<int(int)>;

Step makeAdder(int n) {
    // TODO: поверніть лямбду, яка захоплює n за значенням і додає його до аргумента
    return [](int v) { return v; };
}

int applyAll(const std::vector<Step>& steps, int x) {
    // TODO: по черзі застосуйте кожен крок до x
    return x;
}

int main() {
    Step add5 = makeAdder(5);
    std::cout << add5(10) << "\n";

    std::vector<Step> pipeline{
        add5,
        [](int v) { return v * 2; },
        makeAdder(-1),
    };
    std::cout << applyAll(pipeline, 10) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Додавання п'яти: 15", has: "15", hint: "Лямбда повертає v + n, де n захоплено з makeAdder." },
      { on: "stdout", name: "Весь конвеєр дає 29", has: "29", hint: "Результат кожного кроку передається наступному: ((10 + 5) * 2) - 1." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "15\n29", hint: "Два рядки: 15 і 29." },
      { on: "source", name: "Захоплення n за значенням", matches: "\\[\\s*n\\s*\\]", hint: "У квадратних дужках лямбди назвіть змінну, яку треба копіювати." },
      { on: "source", name: "Цикл застосування кроків", matches: "for\\s*\\(", hint: "Пройдіть вектор кроків циклом і оновлюйте проміжне значення." },
    ],
  },
];
