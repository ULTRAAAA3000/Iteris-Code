// ЧЕРНЕТКИ C++-проєктів за ТЗ (C++17). Не підключені до сайту (див. types.ts і Documentation/project-drafts.md).
// Код користувача це функції й класи БЕЗ main; harness із main дописується після нього й друкує «R1 PASS» або «R1 FAIL: причина».
import type { ProgramProject } from "./types.ts";

const raw = String.raw;

// Спільні допоміжні засоби harness: r (запуск вимоги), eq (точне порівняння), near (дійсні числа)
const HELPERS = raw`#include <cmath>
#include <functional>
#include <iostream>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <type_traits>
#include <utility>

namespace icp {
inline void r(const char* id, const std::function<void()>& f) {
    try {
        f();
        std::cout << id << " PASS\n";
    } catch (const std::exception& e) {
        std::string m = e.what();
        for (char& c : m) if (c == '\n') c = ' ';
        std::cout << id << " FAIL: " << m << "\n";
    } catch (...) {
        std::cout << id << " FAIL: невідома помилка\n";
    }
}
template <class A, class B>
void eq(const A& exp, const B& got) {
    if (!(exp == got)) {
        std::ostringstream o;
        o << "очікувалось " << exp << ", отримано " << got;
        throw std::runtime_error(o.str());
    }
}
inline void near(double exp, double got) {
    if (!(std::fabs(exp - got) < 1e-6)) {
        std::ostringstream o;
        o << "очікувалось " << exp << ", отримано " << got;
        throw std::runtime_error(o.str());
    }
}
}  // namespace icp
`;

/* ============================== 1. Журнал температур ============================== */

const tempStarter = raw`#include <string>
#include <vector>

// Журнал температур. Тіла нижче лише заглушки, щоб програма збиралась.

// TODO: середнє арифметичне; для порожнього вектора 0
double average(const std::vector<double>& t) {
    return 0;
}

// TODO: найменше значення (вектор не порожній)
double minTemp(const std::vector<double>& t) {
    return 0;
}

// TODO: найбільше значення (вектор не порожній)
double maxTemp(const std::vector<double>& t) {
    return 0;
}

// TODO: скільки днів строго вище за межу
int daysAbove(const std::vector<double>& t, double limit) {
    return 0;
}

// TODO: довжина найдовшої серії днів поспіль строго вище за межу
int longestWarmStreak(const std::vector<double>& t, double limit) {
    return 0;
}

// TODO: "холодно" (нижче 10), "прохолодно" (нижче 20), "тепло" (нижче 28), "спекотно" (від 28)
std::string describe(double temp) {
    return "";
}
`;

const tempHarness = HELPERS + raw`
using V = std::vector<double>;

int main() {
    using namespace icp;
    const V t = {12.5, 14.0, 9.5, 18.0, 21.5, 23.0, 24.5, 19.5, 26.0, 30.5};
    r("R1", [&] {
        eq("холодно", describe(9.9));
        eq("холодно", describe(-5));
        eq("прохолодно", describe(10));
        eq("прохолодно", describe(19.9));
        eq("тепло", describe(20));
        eq("тепло", describe(27.9));
        eq("спекотно", describe(28));
        eq("спекотно", describe(40));
    });
    r("R2", [&] {
        near(19.9, average(t));
        near(2, average(V{1, 2, 3}));
        near(-1.5, average(V{-2, -1}));
    });
    r("R3", [&] {
        near(9.5, minTemp(t));
        near(30.5, maxTemp(t));
        near(-7, minTemp(V{-3, -1, -7}));
        near(-1, maxTemp(V{-3, -1, -7}));
    });
    r("R4", [&] {
        eq(5, daysAbove(t, 20.0));
        eq(1, daysAbove(V{20, 20, 21}, 20));
        eq(0, daysAbove(t, 100));
        eq(10, daysAbove(t, -100));
    });
    r("R5", [&] {
        eq(3, longestWarmStreak(t, 20.0));
        eq(3, longestWarmStreak(V{25, 25, 25}, 20));
        eq(0, longestWarmStreak(V{1, 2, 3}, 20));
        eq(2, longestWarmStreak(V{21, 5, 21, 22}, 20));
        eq(1, longestWarmStreak(V{21, 20, 21}, 20));
    });
    r("R6", [&] {
        near(0, average(V{}));
        eq(0, daysAbove(V{}, 0));
        eq(0, longestWarmStreak(V{}, 0));
        near(7, average(V{7}));
        near(5, minTemp(V{5}));
        near(5, maxTemp(V{5}));
        eq(1, daysAbove(V{9}, 8));
        eq(1, longestWarmStreak(V{9}, 8));
    });
    r("R7", [&] {
        V big;
        for (int i = 0; i < 100000; ++i) big.push_back(i % 40);
        near(19.5, average(big));
        near(0, minTemp(big));
        near(39, maxTemp(big));
        eq(47500, daysAbove(big, 20));
        eq(19, longestWarmStreak(big, 20));
    });
    return 0;
}
`;

/* ============================== 2. Банківський рахунок ============================== */

const bankStarter = raw`#include <iomanip>
#include <sstream>
#include <string>
#include <vector>

// Допоміжна функція: сума як рядок із двома знаками після коми (готова, змінювати не треба)
std::string money(double v) {
    std::ostringstream out;
    out << std::fixed << std::setprecision(2) << v;
    return out.str();
}

// Клас Account. Тіла нижче лише заглушки, щоб програма збиралась. Усі дані класу мають бути приватними.
class Account {
public:
    // TODO: зберегти власника й початковий баланс (за замовчуванням 0)
    Account(std::string owner, double balance = 0.0) {}

    // TODO: геттери лише читають, тож мають бути const-методами
    const std::string& owner() { static std::string empty; return empty; }
    double balance() { return 0; }
    std::size_t operations() { return 0; }
    std::string lastOperation() { return ""; }

    // TODO: поповнення: сума має бути додатною; успішна операція потрапляє в журнал
    bool deposit(double amount) { return false; }

    // TODO: зняття: сума додатна й не більша за баланс; успішна операція потрапляє в журнал
    bool withdraw(double amount) { return false; }

    // TODO: переказ іншому рахунку за тими самими правилами, запис у журнал обох рахунків
    bool transferTo(Account& to, double amount) { return false; }
};
`;

const bankHarness = HELPERS + raw`
template <class T>
auto constGetters(int) -> decltype((void)std::declval<const T&>().balance(), (void)std::declval<const T&>().owner(),
                                    (void)std::declval<const T&>().operations(), (void)std::declval<const T&>().lastOperation(), std::true_type());
template <class T>
std::false_type constGetters(...);

int main() {
    using namespace icp;
    r("R1", [&] {
        Account a("Anna", 100.0);
        Account b("Ivan");
        eq("Anna", a.owner());
        near(100, a.balance());
        eq("Ivan", b.owner());
        near(0, b.balance());
    });
    r("R2", [&] {
        Account a("A", 10);
        eq(true, a.deposit(5));
        near(15, a.balance());
        eq(false, a.deposit(0));
        eq(false, a.deposit(-1));
        near(15, a.balance());
    });
    r("R3", [&] {
        Account a("A", 10);
        eq(true, a.withdraw(4));
        near(6, a.balance());
        eq(false, a.withdraw(100));
        near(6, a.balance());
        eq(false, a.withdraw(0));
        eq(false, a.withdraw(-3));
        eq(true, a.withdraw(6));
        near(0, a.balance());
    });
    r("R4", [&] {
        Account a("Anna", 100), b("Ivan");
        eq(true, a.transferTo(b, 60));
        near(40, a.balance());
        near(60, b.balance());
        eq(false, a.transferTo(b, 100));
        near(40, a.balance());
        near(60, b.balance());
        eq(false, a.transferTo(b, -5));
        near(40, a.balance());
    });
    r("R5", [&] {
        Account a("Anna", 100), b("Ivan");
        eq(0u, a.operations());
        a.deposit(50);
        a.deposit(-5);
        a.withdraw(500);
        a.withdraw(30.5);
        eq(2u, a.operations());
        a.transferTo(b, 60);
        a.transferTo(b, 100);
        eq(3u, a.operations());
        eq(1u, b.operations());
    });
    r("R6", [&] {
        Account a("Anna", 100), b("Ivan"), fresh("Nobody");
        eq("немає операцій", fresh.lastOperation());
        a.deposit(50);
        eq("поповнення +50.00", a.lastOperation());
        a.withdraw(30.5);
        eq("зняття -30.50", a.lastOperation());
        a.transferTo(b, 60);
        eq("переказ -60.00 (Ivan)", a.lastOperation());
        eq("переказ +60.00 (Anna)", b.lastOperation());
        a.deposit(-1);
        eq("переказ -60.00 (Ivan)", a.lastOperation());
    });
    r("R7", [&] { eq(true, decltype(constGetters<Account>(0))::value); });
    r("R8", [&] {
        Account a("A", 1), b("B", 2);
        a.deposit(10);
        near(11, a.balance());
        near(2, b.balance());
        eq(0u, b.operations());
        eq("B", b.owner());
    });
    return 0;
}
`;

/* ============================== 3. Зоопарк фігур ============================== */

const zooStarter = raw`#include <algorithm>
#include <cmath>
#include <memory>
#include <string>
#include <vector>

const double PI = 3.14159265358979323846;

// Ієрархія фігур. Тіла нижче лише заглушки, щоб програма збиралась.

class Shape {
public:
    // TODO: зробіть ці три методи чисто віртуальними (= 0), а клас абстрактним
    virtual double area() const { return 0; }
    virtual double perimeter() const { return 0; }
    virtual std::string name() const { return ""; }
    // TODO: віртуальний деструктор
};

// TODO: Circle(double r): площа, довжина кола, назва "Коло"
class Circle : public Shape {
public:
    explicit Circle(double r) {}
};

// TODO: Rectangle(double w, double h): назва "Прямокутник"
class Rectangle : public Shape {
public:
    Rectangle(double w, double h) {}
};

// TODO: Triangle(double a, double b, double c): площа за формулою Герона, назва "Трикутник"
class Triangle : public Shape {
public:
    Triangle(double a, double b, double c) {}
};

// TODO: сума площ усіх фігур (для порожнього вектора 0)
double totalArea(const std::vector<std::unique_ptr<Shape>>& shapes) {
    return 0;
}

// TODO: фігура з найбільшою площею; для порожнього вектора nullptr
const Shape* largest(const std::vector<std::unique_ptr<Shape>>& shapes) {
    return nullptr;
}

// TODO: відсортувати вектор НА МІСЦІ за зростанням площі
void sortByArea(std::vector<std::unique_ptr<Shape>>& shapes) {
}
`;

const zooHarness = HELPERS + raw`
struct Probe : Shape {
    static int alive;
    Probe() { ++alive; }
    ~Probe() { --alive; }
    // без слова override навмисно: harness має компілюватись і з помилковими розв'язками, щоб вимоги падали по одній
    double area() const { return 1; }
    double perimeter() const { return 1; }
    std::string name() const { return "p"; }
};
int Probe::alive = 0;

using Zoo = std::vector<std::unique_ptr<Shape>>;
Zoo makeZoo() {
    Zoo z;
    z.push_back(std::make_unique<Circle>(2.0));
    z.push_back(std::make_unique<Rectangle>(3.0, 4.0));
    z.push_back(std::make_unique<Triangle>(3.0, 4.0, 5.0));
    z.push_back(std::make_unique<Circle>(1.0));
    return z;
}

int main() {
    using namespace icp;
    r("R1", [&] { eq(true, std::is_abstract<Shape>::value); });
    r("R2", [&] {
        eq(true, std::has_virtual_destructor<Shape>::value);
        Shape* s = new Probe;
        delete s;
        eq(0, Probe::alive);
    });
    r("R3", [&] {
        Circle c(2);
        near(PI * 4, c.area());
        near(2 * PI * 2, c.perimeter());
        eq("Коло", c.name());
        near(PI, Circle(1).area());
    });
    r("R4", [&] {
        Rectangle s(3, 4);
        near(12, s.area());
        near(14, s.perimeter());
        eq("Прямокутник", s.name());
    });
    r("R5", [&] {
        Triangle t(3, 4, 5);
        near(6, t.area());
        near(12, t.perimeter());
        eq("Трикутник", t.name());
        near(std::sqrt(3.0), Triangle(2, 2, 2).area());
    });
    r("R6", [&] {
        Zoo z = makeZoo();
        eq("Коло", z[0]->name());
        near(PI * 4, z[0]->area());
        eq("Прямокутник", z[1]->name());
        near(14, z[1]->perimeter());
        eq("Трикутник", z[2]->name());
        near(6, z[2]->area());
    });
    r("R7", [&] {
        Zoo z = makeZoo();
        near(PI * 4 + 12 + 6 + PI, totalArea(z));
        near(0, totalArea(Zoo{}));
    });
    r("R8", [&] {
        Zoo z = makeZoo();
        const Shape* big = largest(z);
        if (!big) throw std::runtime_error("largest повернув nullptr для непорожнього вектора");
        near(PI * 4, big->area());
        eq(true, largest(Zoo{}) == nullptr);
        sortByArea(z);
        eq(4u, z.size());
        near(PI, z[0]->area());
        near(6, z[1]->area());
        near(12, z[2]->area());
        near(PI * 4, z[3]->area());
    });
    return 0;
}
`;

export const PROJECTS: readonly ProgramProject[] = [
  {
    id: "cpp-temperature-log", lang: "cpp", lesson: "cpp/6", xp: 50,
    title: "Проєкт: журнал температур",
    context: "Майже кожна програма щось підраховує за серією даних: оцінки, ціни, показники датчиків. Тут ви напишете невелику бібліотеку статистики за вектором і побачите, як із простих циклів виростає корисний звіт.",
    brief: [
      "Метеостанція записала температури за кілька днів. Напишіть функції, які за вектором <code>std::vector&lt;double&gt;</code> рахують статистику: середню, мінімум і максимум, кількість «теплих» днів, найдовшу теплу серію та словесний опис температури.",
      "Алгоритми STL (<code>std::accumulate</code>, <code>std::max_element</code>, <code>std::sort</code>…) поки не використовуйте: ми вивчимо їх пізніше, а тут тренуємо цикли. Програма <code>main</code> прихована: вона викличе ваші функції з різними даними й покаже, які вимоги виконано.",
    ],
    contract: [
      "<code>double average(const std::vector&lt;double&gt;&amp; t)</code> повертає середнє, для порожнього вектора 0",
      "<code>double minTemp(const std::vector&lt;double&gt;&amp; t)</code> і <code>double maxTemp(...)</code>: мінімум і максимум (вектор не порожній)",
      "<code>int daysAbove(const std::vector&lt;double&gt;&amp; t, double limit)</code> рахує дні <i>строго</i> вище за межу",
      "<code>int longestWarmStreak(const std::vector&lt;double&gt;&amp; t, double limit)</code>: довжина найдовшої серії днів поспіль <i>строго</i> вище за межу",
      "<code>std::string describe(double temp)</code>: нижче 10 це «холодно», від 10 до 20 «прохолодно», від 20 до 28 «тепло», від 28 «спекотно»",
    ],
    requirements: [
      { id: "R1", text: "<code>describe</code> повертає правильне слово для кожного діапазону, зокрема на межах (10, 20 і 28 належать вищому діапазону).",
        hint: "Перевіряйте межі по черзі, починаючи з найнижчої: <code>if (temp &lt; 10)</code>, далі <code>&lt; 20</code>, <code>&lt; 28</code>. Рівно 10 уже «прохолодно»." },
      { id: "R2", text: "<code>average</code> повертає середнє арифметичне, зокрема для від'ємних значень.",
        hint: "Складіть усі значення в циклі й поділіть суму на кількість елементів <code>t.size()</code>." },
      { id: "R3", text: "<code>minTemp</code> і <code>maxTemp</code> знаходять найменше й найбільше значення, зокрема коли всі числа від'ємні.",
        hint: "Почніть з першого елемента як «поки найкращого» (не з нуля!) і порівнюйте з ним решту в циклі." },
      { id: "R4", text: "<code>daysAbove</code> рахує дні, температура яких <i>строго</i> вища за межу (рівна межі не рахується).",
        hint: "Лічильник збільшуйте лише тоді, коли значення <i>більше</i> за <code>limit</code>: знак <code>&gt;</code>, а не <code>&gt;=</code>." },
      { id: "R5", text: "<code>longestWarmStreak</code> знаходить найдовшу серію днів поспіль вище за межу; день на межі чи нижче розриває серію.",
        hint: "Тримайте два лічильники: поточну серію й найкращу. Холодний день обнуляє поточну серію, а найкращу лишає." },
      { id: "R6", text: "Крайні випадки: порожній і одноелементний вектори працюють без помилок (для порожнього середнє 0, а не <code>nan</code>).",
        hint: "Перед діленням перевірте <code>t.empty()</code>: ділення нуля на нуль дає <code>nan</code>." },
      { id: "R7", text: "Функції правильно й швидко працюють на великому журналі зі ста тисяч значень.",
        hint: "Один прохід циклом на функцію: вкладені цикли по всьому вектору на великих даних надто повільні." },
    ],
    starter: tempStarter,
    harness: tempHarness,
  },
  {
    id: "cpp-bank-account", lang: "cpp", lesson: "cpp/8", xp: 55,
    title: "Проєкт: банківський рахунок",
    context: "Клас, який стереже власні дані, є основою будь-якої бізнес-логіки: правила (не можна зняти більше, ніж є) живуть усередині класу, а решта програми не може їх обійти. Так влаштовані рахунки, кошики, склади.",
    brief: [
      "Опишіть клас <code>Account</code>: власник, баланс і журнал операцій. Баланс можна змінити лише методами класу, щоб жодна операція не порушила правил банку. Усі поля мають бути <code>private</code>.",
      "Допоміжна функція <code>money(x)</code> уже є: вона повертає суму як рядок із двома знаками після коми (потрібна для записів журналу). Заглушки в заготовці написані без <code>const</code> навмисно.",
    ],
    contract: [
      "конструктор <code>Account(std::string owner, double balance = 0.0)</code>",
      "<code>bool deposit(double amount)</code>: поповнення, сума має бути додатною",
      "<code>bool withdraw(double amount)</code>: зняття, сума додатна й не більша за баланс (зняти весь баланс можна)",
      "<code>bool transferTo(Account&amp; to, double amount)</code>: переказ за тими самими правилами",
      "<code>double balance() const</code>, <code>const std::string&amp; owner() const</code>, <code>std::size_t operations() const</code>, <code>std::string lastOperation() const</code>",
      "записи журналу: <code>поповнення +50.00</code>, <code>зняття -30.50</code>, <code>переказ -60.00 (Ivan)</code> у відправника й <code>переказ +60.00 (Anna)</code> в отримувача; для порожнього журналу <code>немає операцій</code>",
    ],
    requirements: [
      { id: "R1", text: "Конструктор задає власника й початковий баланс (за замовчуванням 0), а <code>owner()</code> і <code>balance()</code> їх повертають.",
        hint: "Параметр <code>balance</code> має значення за замовчуванням <code>0.0</code>. Збережіть обидва значення в приватних полях." },
      { id: "R2", text: "<code>deposit</code> відхиляє нульову й від'ємну суму, нічого не змінюючи, і повертає <code>true</code> лише для успішної операції.",
        hint: "Спершу перевірте <code>amount &lt;= 0</code> і одразу поверніть <code>false</code>, до зміни балансу." },
      { id: "R3", text: "<code>withdraw</code> відхиляє суму, більшу за баланс (і не додатну); баланс при відмові не змінюється; зняти весь баланс можна.",
        hint: "Умова відмови: сума не додатна <i>або</i> більша за поточний баланс. Рівна балансу сума дозволена." },
      { id: "R4", text: "<code>transferTo</code> зменшує баланс відправника й збільшує баланс отримувача; при відмові обидва рахунки лишаються без змін.",
        hint: "Клас має доступ до приватних полів іншого об'єкта того ж класу: <code>to.balance_</code>. Спершу всі перевірки, потім зміни." },
      { id: "R5", text: "Кожна успішна операція потрапляє в журнал (при переказі в журнали обох рахунків); відхилені операції не записуються.",
        hint: "Додавайте рядок у <code>std::vector&lt;std::string&gt;</code> лише в успішній гілці. <code>operations()</code> повертає розмір вектора." },
      { id: "R6", text: "<code>lastOperation()</code> повертає останній запис у заданому форматі, а для порожнього журналу рядок <code>немає операцій</code>.",
        hint: "Суму форматуйте функцією <code>money</code>. Для порожнього вектора перевірте <code>empty()</code> перед <code>back()</code>." },
      { id: "R7", text: "Геттери <code>balance</code>, <code>owner</code>, <code>operations</code>, <code>lastOperation</code> можна викликати для <code>const</code>-об'єкта (вони самі оголошені <code>const</code>).",
        hint: "Слово <code>const</code> ставиться після дужок методу: <code>double balance() const</code>." },
      { id: "R8", text: "Кожен рахунок живе окремо: операція з одним не змінює баланс і журнал іншого.",
        hint: "Дані мають бути звичайними полями об'єкта, а не <code>static</code>." },
    ],
    starter: bankStarter,
    harness: bankHarness,
  },
  {
    id: "cpp-shapes-zoo", lang: "cpp", lesson: "cpp/9", xp: 60,
    title: "Проєкт: зоопарк фігур",
    context: "Поліморфізм дозволяє працювати з різними об'єктами через один інтерфейс: гра малює будь-яких персонажів, редактор будь-які фігури. Додати новий вид можна, не чіпаючи код, який його використовує.",
    brief: [
      "Опишіть ієрархію геометричних фігур: абстрактний базовий клас <code>Shape</code> і три нащадки <code>Circle</code>, <code>Rectangle</code>, <code>Triangle</code>, а також три допоміжні функції, що працюють із вектором <code>std::vector&lt;std::unique_ptr&lt;Shape&gt;&gt;</code>.",
      "Константа <code>PI</code> уже оголошена. Площу трикутника за трьома сторонами рахуйте за формулою Герона: <code>s = (a + b + c) / 2</code>, площа <code>sqrt(s·(s−a)·(s−b)·(s−c))</code>. Нащадки перевизначають методи з <code>override</code>.",
    ],
    contract: [
      "<code>Shape</code>: чисто віртуальні <code>double area() const</code>, <code>double perimeter() const</code>, <code>std::string name() const</code> та віртуальний деструктор",
      "<code>Circle(double r)</code>, <code>Rectangle(double w, double h)</code>, <code>Triangle(double a, double b, double c)</code>",
      "імена: «Коло», «Прямокутник», «Трикутник»",
      "<code>double totalArea(const std::vector&lt;std::unique_ptr&lt;Shape&gt;&gt;&amp; shapes)</code>",
      "<code>const Shape* largest(const std::vector&lt;std::unique_ptr&lt;Shape&gt;&gt;&amp; shapes)</code>: найбільша за площею або <code>nullptr</code>",
      "<code>void sortByArea(std::vector&lt;std::unique_ptr&lt;Shape&gt;&gt;&amp; shapes)</code>: за зростанням площі, на місці",
    ],
    requirements: [
      { id: "R1", text: "<code>Shape</code> абстрактний: його методи чисто віртуальні (<code>= 0</code>), створити просто «фігуру» не можна.",
        hint: "Чиста віртуальна функція не має тіла, замість нього <code>= 0</code>: <code>virtual double area() const = 0;</code>." },
      { id: "R2", text: "У <code>Shape</code> віртуальний деструктор: видалення нащадка через вказівник на базу викликає деструктор нащадка.",
        hint: "Додайте в базовий клас <code>virtual ~Shape() = default;</code>. Без нього видалення нащадка через базу працює неправильно." },
      { id: "R3", text: "<code>Circle</code> рахує площу <code>π·r²</code>, довжину кола <code>2·π·r</code> і має назву «Коло».",
        hint: "Радіус зберігайте в полі. Константа <code>PI</code> уже є вгорі файлу." },
      { id: "R4", text: "<code>Rectangle</code> рахує площу <code>w·h</code>, периметр <code>2·(w+h)</code> і має назву «Прямокутник».",
        hint: "Периметр це сума всіх чотирьох сторін, а не двох." },
      { id: "R5", text: "<code>Triangle</code> рахує площу за формулою Герона, периметр як суму сторін і має назву «Трикутник».",
        hint: "Спершу напівпериметр <code>s</code>, потім <code>std::sqrt(s * (s - a) * (s - b) * (s - c))</code>." },
      { id: "R6", text: "Через вказівник на базу працюють методи нащадків (поліморфізм): <code>z[i]-&gt;name()</code>, <code>area()</code>, <code>perimeter()</code>.",
        hint: "Методи в <code>Shape</code> мають бути <code>virtual</code>, а в нащадках позначені <code>override</code>." },
      { id: "R7", text: "<code>totalArea</code> повертає суму площ усіх фігур (для порожнього вектора 0).",
        hint: "Пройдіть вектор циклом <code>for (const auto&amp; s : shapes)</code> і додавайте <code>s-&gt;area()</code>." },
      { id: "R8", text: "<code>largest</code> повертає найбільшу за площею фігуру (<code>nullptr</code> для порожнього вектора), а <code>sortByArea</code> сортує вектор на місці за зростанням площі.",
        hint: "Для сортування <code>std::sort</code> із лямбдою: <code>[](const auto&amp; a, const auto&amp; b) { return a-&gt;area() &lt; b-&gt;area(); }</code>." },
    ],
    starter: zooStarter,
    harness: zooHarness,
  },
];
