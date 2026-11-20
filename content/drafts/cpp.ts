// Чернетки проєктів за ТЗ для курсу C++ (стандарт C++17, без std::cin: у пісочниці немає клавіатури). НЕ ПУБЛІКУЮТЬСЯ.
// Еталони й мутації для перевірки вимог: tests/solutions/drafts-cpp.mjs. Правила: Documentation/spec-drafts.md
import type { RemoteDraft } from "./types.ts";

const raw = String.raw;

export const CPP_DRAFTS: readonly RemoteDraft[] = [
  {
    id: "cpp-temperature-log", course: "cpp", runtime: "remote", lang: "cpp", xp: 50,
    after: "cpp/6", needs: ["vector", "цикли", "функції", "const-посилання", "форматований вивід (iomanip)"],
    title: "Проєкт: журнал температур",
    context: "Майже кожна програма щось підраховує за серією даних: оцінки, ціни, показники датчиків. Тут ви напишете невелику бібліотеку статистики за вектором і побачите, як з простих циклів виростає корисний звіт.",
    brief: [
      "Метеостанція записала температури за 10 днів. Напишіть функції, які за вектором <code>std::vector&lt;double&gt;</code> рахують статистику, а готова <code>main</code> надрукує звіт.",
      "Алгоритми STL (<code>std::accumulate</code>, <code>std::max_element</code>, <code>std::sort</code>…) поки не використовуйте: ми їх вивчимо пізніше, а тут тренуємо цикли.",
    ],
    contract: [
      "<code>double average(const std::vector&lt;double&gt;&amp; t)</code> повертає середнє, для порожнього вектора 0",
      "<code>double minTemp(...)</code> і <code>double maxTemp(...)</code> повертають мінімум і максимум",
      "<code>int daysAbove(const std::vector&lt;double&gt;&amp; t, double limit)</code> рахує дні строго вище за межу",
      "<code>int longestWarmStreak(const std::vector&lt;double&gt;&amp; t, double limit)</code> повертає довжину найдовшої серії днів поспіль вище за межу",
      "<code>std::string describe(double temp)</code>: нижче 10 це «холодно», від 10 до 20 «прохолодно», від 20 до 28 «тепло», від 28 «спекотно»",
    ],
    mockup: [
      "День 1: 12.5 прохолодно", "День 2: 14.0 прохолодно", "День 3: 9.5 холодно", "День 4: 18.0 прохолодно", "День 5: 21.5 тепло",
      "День 6: 23.0 тепло", "День 7: 24.5 тепло", "День 8: 19.5 прохолодно", "День 9: 26.0 тепло", "День 10: 30.5 спекотно",
      "Середня: 19.9", "Мінімум: 9.5", "Максимум: 30.5", "Днів вище 20.0: 5", "Найдовша тепла серія: 3", "Порожній журнал: 0.0 0",
    ].join("\n"),
    starter: raw`#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

// TODO: реалізуйте функції за договором із ТЗ. Тіла нижче лише заглушки, щоб програма збиралась.
double average(const std::vector<double>& t) { return 0; }
double minTemp(const std::vector<double>& t) { return 0; }
double maxTemp(const std::vector<double>& t) { return 0; }
int daysAbove(const std::vector<double>& t, double limit) { return 0; }
int longestWarmStreak(const std::vector<double>& t, double limit) { return 0; }
std::string describe(double temp) { return ""; }

int main() {
    std::vector<double> t = {12.5, 14.0, 9.5, 18.0, 21.5, 23.0, 24.5, 19.5, 26.0, 30.5};
    std::cout << std::fixed << std::setprecision(1);
    for (std::size_t i = 0; i < t.size(); ++i)
        std::cout << "День " << i + 1 << ": " << t[i] << " " << describe(t[i]) << "\n";
    std::cout << "Середня: " << average(t) << "\n";
    std::cout << "Мінімум: " << minTemp(t) << "\n";
    std::cout << "Максимум: " << maxTemp(t) << "\n";
    std::cout << "Днів вище 20.0: " << daysAbove(t, 20.0) << "\n";
    std::cout << "Найдовша тепла серія: " << longestWarmStreak(t, 20.0) << "\n";
    std::vector<double> empty;
    std::cout << "Порожній журнал: " << average(empty) << " " << daysAbove(empty, 0) << "\n";
    return 0;
}
`,
    requirements: [
      { id: "R1", short: "Опис кожного дня: холодно, прохолодно, тепло, спекотно",
        text: "Функція <code>describe</code> повертає слово за температурою, і звіт має десять правильних рядків «День N».",
        hint: "Перевіряйте межі по черзі: спершу найнижчу (<code>&lt; 10</code>), потім наступну. Дев'ять із половиною градусів це ще «холодно».",
        checks: [{ on: "stdout", has: "День 1: 12.5 прохолодно\nДень 2: 14.0 прохолодно\nДень 3: 9.5 холодно\nДень 4: 18.0 прохолодно\nДень 5: 21.5 тепло\nДень 6: 23.0 тепло\nДень 7: 24.5 тепло\nДень 8: 19.5 прохолодно\nДень 9: 26.0 тепло\nДень 10: 30.5 спекотно" }] },
      { id: "R2", short: "Середня температура 19.9", text: "<code>average</code> повертає середнє арифметичне всіх значень.",
        hint: "Складіть усі значення в циклі й поділіть суму на кількість елементів <code>t.size()</code>.",
        checks: [{ on: "stdout", has: "Середня: 19.9\n" }] },
      { id: "R3", short: "Мінімум 9.5 і максимум 30.5", text: "<code>minTemp</code> і <code>maxTemp</code> знаходять найменше й найбільше значення.",
        hint: "Почніть з першого елемента як «поки найкращого» і порівнюйте з ним решту в циклі.",
        checks: [{ on: "stdout", has: "Мінімум: 9.5\nМаксимум: 30.5" }] },
      { id: "R4", short: "Днів вище 20 градусів: 5", text: "<code>daysAbove</code> рахує дні, температура яких <i>строго</i> вища за межу.",
        hint: "Лічильник збільшуйте лише в гілці, де значення більше за <code>limit</code>.",
        checks: [{ on: "stdout", has: "Днів вище 20.0: 5\n" }] },
      { id: "R5", short: "Найдовша тепла серія: 3 дні", text: "<code>longestWarmStreak</code> знаходить найдовшу серію днів поспіль вище за межу.",
        hint: "Тримайте два лічильники: поточну серію й найкращу. Холодний день обнуляє поточну серію.",
        checks: [{ on: "stdout", has: "Найдовша тепла серія: 3\n" }] },
      { id: "R6", short: "Порожній журнал не ламає програму", text: "Для порожнього вектора <code>average</code> повертає 0, а не ділить на нуль.",
        hint: "Перед діленням перевірте <code>t.empty()</code>. Ділення нуля на нуль дає <code>nan</code>.",
        checks: [{ on: "stdout", has: "Порожній журнал: 0.0 0" }] },
      { id: "R7", short: "Без алгоритмів STL: тільки власні цикли", text: "У розв'язку немає <code>std::accumulate</code>, <code>std::max_element</code>, <code>std::min_element</code>, <code>std::count_if</code> і <code>std::sort</code>.",
        hint: "Тут ми вчимося писати цикл самі. Готові алгоритми стануть у пригоді в уроці про стандартну бібліотеку.",
        checks: [{ on: "source", matches: "std::(accumulate|max_element|min_element|count_if|sort)", not: true }] },
      { id: "R8", short: "Увесь звіт збігається з макетом", text: "Увесь вивід збігається з макетом: нічого зайвого й нічого пропущеного.",
        hint: "Порівняйте свій вивід із макетом рядок за рядком. Формат чисел задає готова <code>main</code>, його міняти не треба.",
        checks: [{ on: "stdout", equals: "День 1: 12.5 прохолодно\nДень 2: 14.0 прохолодно\nДень 3: 9.5 холодно\nДень 4: 18.0 прохолодно\nДень 5: 21.5 тепло\nДень 6: 23.0 тепло\nДень 7: 24.5 тепло\nДень 8: 19.5 прохолодно\nДень 9: 26.0 тепло\nДень 10: 30.5 спекотно\nСередня: 19.9\nМінімум: 9.5\nМаксимум: 30.5\nДнів вище 20.0: 5\nНайдовша тепла серія: 3\nПорожній журнал: 0.0 0" }] },
    ],
  },
  {
    id: "cpp-bank-account", course: "cpp", runtime: "remote", lang: "cpp", xp: 55,
    after: "cpp/8", needs: ["класи", "приватні поля й методи", "const-методи", "посилання", "vector<string>", "RAII (конструктор)"],
    title: "Проєкт: банківський рахунок",
    context: "Клас, який стереже власні дані, — основа будь-якої бізнес-логіки: правила (не можна зняти більше, ніж є) живуть усередині класу, а решта програми не може їх обійти. Так влаштовані рахунки, кошики, склади.",
    brief: [
      "Опишіть клас <code>Account</code>: власник, баланс і журнал операцій. Баланс можна змінити лише методами класу, щоб жодна операція не порушила правил банку.",
      "Готова <code>main</code> проводить сценарій із двома рахунками. Допоміжна функція <code>money(x)</code> вже є: вона повертає суму як рядок із двома знаками після коми.",
    ],
    contract: [
      "конструктор <code>Account(std::string owner, double balance = 0.0)</code>",
      "<code>bool deposit(double amount)</code>: поповнення, сума має бути додатною",
      "<code>bool withdraw(double amount)</code>: зняття, не більше за баланс",
      "<code>bool transferTo(Account&amp; to, double amount)</code>: переказ іншому рахунку за тими самими правилами",
      "<code>double balance() const</code>, <code>const std::string&amp; owner() const</code>, <code>std::size_t operations() const</code>, <code>std::string lastOperation() const</code>",
      "записи журналу: <code>поповнення +50.00</code>, <code>зняття -30.50</code>, <code>переказ -60.00 (Ivan)</code> у відправника й <code>переказ +60.00 (Anna)</code> у отримувача; для порожнього журналу <code>немає операцій</code>",
    ],
    mockup: [
      "Anna: 100.00", "Ivan: 0.00", "Поповнення 50: ok", "Поповнення -5: відхилено", "Зняття 500: відхилено", "Зняття 30.5: ok",
      "Переказ 60 Ivan: ok", "Переказ 100 Ivan: відхилено", "Anna: 59.50", "Ivan: 60.00", "Операцій Anna: 3", "Остання Anna: переказ -60.00 (Ivan)",
      "Операцій Ivan: 1", "Остання Ivan: переказ +60.00 (Anna)", "Новий рахунок: немає операцій",
    ].join("\n"),
    starter: raw`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

// Допоміжна функція: сума як рядок із двома знаками після коми (готова, змінювати не треба)
std::string money(double v) {
    std::ostringstream out;
    out << std::fixed << std::setprecision(2) << v;
    return out.str();
}

// TODO: клас Account за договором із ТЗ (поля приватні!)

const char* verdict(bool ok) { return ok ? "ok" : "відхилено"; }

int main() {
    Account anna("Anna", 100.0);
    Account ivan("Ivan");
    std::cout << anna.owner() << ": " << money(anna.balance()) << "\n";
    std::cout << ivan.owner() << ": " << money(ivan.balance()) << "\n";
    std::cout << "Поповнення 50: " << verdict(anna.deposit(50)) << "\n";
    std::cout << "Поповнення -5: " << verdict(anna.deposit(-5)) << "\n";
    std::cout << "Зняття 500: " << verdict(anna.withdraw(500)) << "\n";
    std::cout << "Зняття 30.5: " << verdict(anna.withdraw(30.5)) << "\n";
    std::cout << "Переказ 60 Ivan: " << verdict(anna.transferTo(ivan, 60)) << "\n";
    std::cout << "Переказ 100 Ivan: " << verdict(anna.transferTo(ivan, 100)) << "\n";
    std::cout << anna.owner() << ": " << money(anna.balance()) << "\n";
    std::cout << ivan.owner() << ": " << money(ivan.balance()) << "\n";
    std::cout << "Операцій Anna: " << anna.operations() << "\n";
    std::cout << "Остання Anna: " << anna.lastOperation() << "\n";
    std::cout << "Операцій Ivan: " << ivan.operations() << "\n";
    std::cout << "Остання Ivan: " << ivan.lastOperation() << "\n";
    Account fresh("Nobody");
    std::cout << "Новий рахунок: " << fresh.lastOperation() << "\n";
    return 0;
}
`,
    requirements: [
      { id: "R1", short: "Конструктор і геттери: Anna 100.00, Ivan 0.00", text: "Конструктор задає власника й початковий баланс (за замовчуванням 0), а <code>owner()</code> і <code>balance()</code> їх повертають.",
        hint: "Параметр <code>balance</code> має значення за замовчуванням <code>0.0</code>. Збережіть обидва значення в полях класу.",
        checks: [{ on: "stdout", has: "Anna: 100.00\nIvan: 0.00" }] },
      { id: "R2", short: "Поповнення лише додатною сумою", text: "<code>deposit</code> відхиляє нульову й від'ємну суму та нічого не змінює.",
        hint: "Спершу перевірте <code>amount &lt;= 0</code> і одразу поверніть <code>false</code>, до зміни балансу.",
        checks: [{ on: "stdout", has: "Поповнення 50: ok\nПоповнення -5: відхилено" }] },
      { id: "R3", short: "Не можна зняти більше, ніж є", text: "<code>withdraw</code> відхиляє суму більшу за баланс (і не додатну) та не змінює баланс.",
        hint: "Умова відмови: сума не додатна <i>або</i> більша за поточний баланс.",
        checks: [{ on: "stdout", has: "Зняття 500: відхилено\nЗняття 30.5: ok" }] },
      { id: "R4", short: "Переказ змінює обидва рахунки або жоден", text: "<code>transferTo</code> зменшує баланс відправника й збільшує отримувача; при відмові обидва лишаються незмінними.",
        hint: "Клас має доступ до приватних полів іншого об'єкта того ж класу: <code>to.balance_</code>. Спершу всі перевірки, потім зміни.",
        checks: [{ on: "stdout", has: "Переказ 60 Ivan: ok\nПереказ 100 Ivan: відхилено\nAnna: 59.50\nIvan: 60.00" }] },
      { id: "R5", short: "Журнал рахує успішні операції", text: "Кожна успішна операція записується в журнал (у обох рахунків при переказі); відхилені не записуються.",
        hint: "Додавайте рядок у <code>std::vector&lt;std::string&gt;</code> лише на успішній гілці. <code>operations()</code> повертає розмір вектора.",
        checks: [{ on: "stdout", has: "Операцій Anna: 3\n" }, { on: "stdout", has: "Операцій Ivan: 1\n" }] },
      { id: "R6", short: "Формат записів журналу й порожній журнал", text: "<code>lastOperation()</code> повертає останній запис у заданому форматі, а для порожнього журналу рядок <code>немає операцій</code>.",
        hint: "Суму форматуйте функцією <code>money</code>. Для порожнього вектора перевірте <code>empty()</code> перед <code>back()</code>.",
        checks: [{ on: "stdout", has: "Остання Anna: переказ -60.00 (Ivan)\nОперацій Ivan: 1\nОстання Ivan: переказ +60.00 (Anna)\nНовий рахунок: немає операцій" }] },
      { id: "R7", short: "Поля приховані в private", text: "Дані класу лежать у секції <code>private</code>, зовні їх змінити не можна.",
        hint: "Методи оголосіть у <code>public:</code>, а власника, баланс і журнал у <code>private:</code>.",
        checks: [{ on: "source", matches: "private\\s*:" }] },
      { id: "R8", short: "Геттери позначені const", text: "<code>balance()</code> оголошено як <code>const</code>-метод: він лише читає.",
        hint: "Слово <code>const</code> ставиться після дужок методу: <code>double balance() const</code>.",
        checks: [{ on: "source", matches: "balance\\s*\\(\\s*\\)\\s*const" }] },
      { id: "R9", short: "Увесь сценарій збігається з макетом", text: "Увесь вивід збігається з макетом.",
        hint: "Порівняйте з макетом рядок за рядком: зайві пробіли в записах журналу теж помітні.",
        checks: [{ on: "stdout", equals: "Anna: 100.00\nIvan: 0.00\nПоповнення 50: ok\nПоповнення -5: відхилено\nЗняття 500: відхилено\nЗняття 30.5: ok\nПереказ 60 Ivan: ok\nПереказ 100 Ivan: відхилено\nAnna: 59.50\nIvan: 60.00\nОперацій Anna: 3\nОстання Anna: переказ -60.00 (Ivan)\nОперацій Ivan: 1\nОстання Ivan: переказ +60.00 (Anna)\nНовий рахунок: немає операцій" }] },
    ],
  },
  {
    id: "cpp-shapes-zoo", course: "cpp", runtime: "remote", lang: "cpp", xp: 60,
    after: "cpp/9", needs: ["успадкування", "віртуальні функції", "абстрактні класи", "віртуальний деструктор", "unique_ptr", "std::sort з лямбдою"],
    title: "Проєкт: зоопарк фігур",
    context: "Поліморфізм дозволяє працювати з різними об'єктами через один інтерфейс: гра малює будь-яких персонажів, редактор будь-які фігури. Додати новий вид можна, не чіпаючи код, який його використовує.",
    brief: [
      "Опишіть ієрархію геометричних фігур: абстрактний базовий клас <code>Shape</code> і три нащадки <code>Circle</code>, <code>Rectangle</code>, <code>Triangle</code>. Готова <code>main</code> зберігає їх у <code>std::vector&lt;std::unique_ptr&lt;Shape&gt;&gt;</code>, друкує, сортує за площею й підсумовує.",
      "Константа <code>PI</code> уже оголошена. Площу трикутника за трьома сторонами рахуйте за формулою Герона: <code>s = (a + b + c) / 2</code>, площа <code>sqrt(s·(s−a)·(s−b)·(s−c))</code>.",
    ],
    contract: [
      "<code>Shape</code> має чисті віртуальні методи <code>double area() const</code>, <code>double perimeter() const</code>, <code>std::string name() const</code> і віртуальний деструктор",
      "<code>Circle(double r)</code>, <code>Rectangle(double w, double h)</code>, <code>Triangle(double a, double b, double c)</code>",
      "імена: «Коло», «Прямокутник», «Трикутник»",
      "перевизначення в нащадках позначайте <code>override</code>",
    ],
    mockup: [
      "Фігури:", "Коло: площа 12.57, периметр 12.57", "Прямокутник: площа 12.00, периметр 14.00", "Трикутник: площа 6.00, периметр 12.00",
      "Коло: площа 3.14, периметр 6.28", "За площею: Коло Трикутник Прямокутник Коло", "Загальна площа: 33.71", "Найбільша: Коло",
    ].join("\n"),
    starter: raw`#include <algorithm>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

const double PI = 3.14159265358979323846;

// TODO: клас Shape (абстрактний) і його нащадки Circle, Rectangle, Triangle за договором із ТЗ

int main() {
    std::vector<std::unique_ptr<Shape>> zoo;
    zoo.push_back(std::make_unique<Circle>(2.0));
    zoo.push_back(std::make_unique<Rectangle>(3.0, 4.0));
    zoo.push_back(std::make_unique<Triangle>(3.0, 4.0, 5.0));
    zoo.push_back(std::make_unique<Circle>(1.0));

    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Фігури:\n";
    for (const auto& s : zoo)
        std::cout << s->name() << ": площа " << s->area() << ", периметр " << s->perimeter() << "\n";

    std::sort(zoo.begin(), zoo.end(), [](const auto& a, const auto& b) { return a->area() < b->area(); });
    std::cout << "За площею:";
    for (const auto& s : zoo) std::cout << " " << s->name();
    std::cout << "\n";

    double total = 0;
    for (const auto& s : zoo) total += s->area();
    std::cout << "Загальна площа: " << total << "\n";
    std::cout << "Найбільша: " << zoo.back()->name() << "\n";
    return 0;
}
`,
    requirements: [
      { id: "R1", short: "Shape абстрактний: area() const = 0", text: "<code>Shape</code> оголошує <code>area()</code> чистим віртуальним методом: <code>virtual double area() const = 0;</code>.",
        hint: "Чиста віртуальна функція не має тіла, замість нього <code>= 0</code>. Клас із такою функцією не можна створити напряму.",
        checks: [{ on: "source", matches: "virtual\\s+double\\s+area\\s*\\(\\s*\\)\\s*const\\s*=\\s*0" }] },
      { id: "R2", short: "Віртуальний деструктор у Shape", text: "Базовий клас має віртуальний деструктор: <code>virtual ~Shape() = default;</code>.",
        hint: "Без віртуального деструктора видалення нащадка через вказівник на базу працює неправильно.",
        checks: [{ on: "source", matches: "virtual\\s+~Shape" }] },
      { id: "R3", short: "Коло: площа й периметр", text: "<code>Circle</code> рахує площу <code>π·r²</code> і довжину кола <code>2·π·r</code>.",
        hint: "Радіус зберігайте в полі. Константа <code>PI</code> уже є вгорі файлу.",
        checks: [{ on: "stdout", has: "Коло: площа 12.57, периметр 12.57\n" }, { on: "stdout", has: "Коло: площа 3.14, периметр 6.28\n" }] },
      { id: "R4", short: "Прямокутник: площа й периметр", text: "<code>Rectangle</code> рахує площу <code>w·h</code> і периметр <code>2·(w+h)</code>.",
        hint: "Периметр це сума всіх чотирьох сторін, а не двох.",
        checks: [{ on: "stdout", has: "Прямокутник: площа 12.00, периметр 14.00" }] },
      { id: "R5", short: "Трикутник: площа за формулою Герона", text: "<code>Triangle</code> рахує площу за формулою Герона й периметр як суму сторін.",
        hint: "Спершу напівпериметр <code>s</code>, потім <code>std::sqrt(s * (s - a) * (s - b) * (s - c))</code>.",
        checks: [{ on: "stdout", has: "Трикутник: площа 6.00, периметр 12.00" }] },
      { id: "R6", short: "Перевизначення позначено override", text: "У нащадках перевизначені методи позначені <code>override</code> (щонайменше шість разів).",
        hint: "Слово <code>override</code> після <code>const</code>: компілятор тоді піймає помилку в сигнатурі.",
        checks: [{ on: "source", matches: "(?:override[\\s\\S]*){6}" }] },
      { id: "R7", short: "Сортування за площею працює поліморфно", text: "Сортування в <code>main</code> працює, бо кожен об'єкт відповідає на <code>area()</code> по-своєму.",
        hint: "Якщо порядок неправильний, спочатку перевірте площі кожної фігури окремо.",
        checks: [{ on: "stdout", has: "За площею: Коло Трикутник Прямокутник Коло\n" }] },
      { id: "R8", short: "Загальна площа 33.71, найбільша фігура: Коло", text: "Підсумки: сума площ і назва найбільшої фігури.",
        hint: "Якщо сума не збігається, перевірте площі окремих фігур у першому блоці виводу.",
        checks: [{ on: "stdout", has: "Загальна площа: 33.71\nНайбільша: Коло" }] },
      { id: "R9", short: "Увесь звіт збігається з макетом", text: "Увесь вивід збігається з макетом.",
        hint: "Порівняйте з макетом рядок за рядком.",
        checks: [{ on: "stdout", equals: "Фігури:\nКоло: площа 12.57, периметр 12.57\nПрямокутник: площа 12.00, периметр 14.00\nТрикутник: площа 6.00, периметр 12.00\nКоло: площа 3.14, периметр 6.28\nЗа площею: Коло Трикутник Прямокутник Коло\nЗагальна площа: 33.71\nНайбільша: Коло" }] },
    ],
  },
];
