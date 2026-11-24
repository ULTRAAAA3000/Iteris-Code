// Практичні завдання глави «Помилки» (уроки 62–67). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-try-catch-divide", lesson: "cpp/62", xp: 25,
    title: "Ділення з виключенням: throw і catch",
    context: "Низькорівнева функція не знає, що робити з поганими даними, тож кидає виключення, а код вище вирішує, як повідомити користувача. Так працює обробка помилок у більшості програм.",
    brief: [
      "Допишіть <code>divide</code>: якщо дільник дорівнює нулю, киньте <code>std::runtime_error</code> з текстом <code>division by zero</code>. У <code>main</code> обгорніть виклик у <code>try</code> і зловіть виключення за константним посиланням.",
      "Для пар (10, 2), (7, 0), (9, 3) очікуваний вивід: <code>5</code>, <code>error: division by zero</code>, <code>3</code>, кожне в окремому рядку. Помилка на одній парі не має зупиняти решту.",
    ],
    starter: raw`#include <iostream>
#include <stdexcept>

int divide(int a, int b) {
    // TODO: якщо b == 0, киньте std::runtime_error("division by zero")
    return a / b;
}

int main() {
    int pairs[3][2] = {{10, 2}, {7, 0}, {9, 3}};
    for (auto& p : pairs) {
        // TODO: обгорніть виклик у try, а помилку зловіть через catch (const std::runtime_error& e)
        std::cout << divide(p[0], p[1]) << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Перша пара дає 5", has: "5\nerror", hint: "Після успішного ділення 10 на 2 одразу йде повідомлення про помилку для пари (7, 0)." },
      { on: "stdout", name: "Повідомлення з what()", has: "error: division by zero", hint: "Текст беріть з e.what() і додайте префікс «error: »." },
      { on: "stdout", name: "Остання пара дає 3", has: "zero\n3", hint: "Цикл мусить дійти до кінця: catch стоїть усередині циклу." },
      { on: "stdout", name: "Вивід збігається", equals: "5\nerror: division by zero\n3", hint: "Три рядки: результат, помилка, результат." },
      { on: "source", name: "Є throw і catch за посиланням", matches: "throw[\\s\\S]*catch\\s*\\(\\s*const[^)]*&", hint: "Киньте об'єкт і ловіть його як const T&." },
    ],
  },
  {
    ...base, id: "cpp-custom-exception", lesson: "cpp/63", xp: 30,
    title: "Власне виключення ValidationError",
    context: "У реальних бібліотеках помилки мають власні типи з додатковими даними, наприклад назвою поля форми. Так інтерфейс або журнал точно знають, де саме сталася проблема.",
    brief: [
      "Клас <code>ValidationError</code> успадковано від <code>std::runtime_error</code>, але він ще не зберігає назву поля. Додайте поле, збережіть у ньому аргумент конструктора й поверніть його з <code>field()</code>.",
      "Для віку 30, -5 і 200 очікуваний вивід: <code>ok 30</code>, <code>field=age msg=must be &gt;= 0</code>, <code>field=age msg=must be &lt;= 150</code>. Саме виключення ловіть як <code>const ValidationError&amp;</code>.",
    ],
    starter: raw`#include <iostream>
#include <stdexcept>
#include <string>

class ValidationError : public std::runtime_error {
public:
    ValidationError(const std::string& /*field*/, const std::string& msg)
        : std::runtime_error(msg) {}
    // TODO: збережіть field у приватному полі й поверніть його тут
    std::string field() const { return ""; }
};

void validateAge(int age) {
    if (age < 0) throw ValidationError("age", "must be >= 0");
    if (age > 150) throw ValidationError("age", "must be <= 150");
    std::cout << "ok " << age << "\n";
}

int main() {
    for (int age : {30, -5, 200}) {
        try {
            validateAge(age);
        } catch (const ValidationError& e) {
            std::cout << "field=" << e.field() << " msg=" << e.what() << "\n";
        }
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Коректний вік проходить", has: "ok 30", hint: "Для 30 виключення не кидається." },
      { on: "stdout", name: "Назва поля повертається", has: "field=age msg=must be >= 0", hint: "Конструктор має запам'ятати перший аргумент, а field() повернути його." },
      { on: "stdout", name: "Верхня межа", has: "field=age msg=must be <= 150", hint: "Повідомлення передається базовому класу, і what() віддає його." },
      { on: "stdout", name: "Вивід збігається", equals: "ok 30\nfield=age msg=must be >= 0\nfield=age msg=must be <= 150", hint: "Рівно три рядки у вказаному форматі." },
      { on: "source", name: "Поле класу додано", matches: "std::string\\s+\\w+_?\\s*;", hint: "Потрібен приватний член типу std::string для назви поля." },
    ],
  },
  {
    ...base, id: "cpp-scope-guard", lesson: "cpp/64", xp: 35,
    title: "Захисник області видимості з відкатом",
    context: "Якщо операція обривається посеред змін, дані мають повернутися в попередній стан. Захисник області видимості робить відкат у деструкторі, тож кожен вихід з функції, і виняток теж, прибирає за собою.",
    brief: [
      "Клас <code>ScopeGuard</code> зберігає дію відкату. Допишіть деструктор (виконує дію, лише якщо захисник активний) і <code>dismiss</code> (вимикає його). Функція <code>addAll</code> додає елементи й на успіху викликає <code>dismiss</code>.",
      "Очікуваний вивід: <code>size after failure: 1</code> і <code>size after success: 4</code>. Після невдалої спроби вектор мусить повернутися до початкового розміру.",
    ],
    starter: raw`#include <functional>
#include <iostream>
#include <stdexcept>
#include <vector>

class ScopeGuard {
public:
    explicit ScopeGuard(std::function<void()> undo) : undo_(std::move(undo)) {}
    ~ScopeGuard() {
        // TODO: якщо active_, викличте undo_()
    }
    void dismiss() {
        // TODO: вимкніть захисник
    }
    ScopeGuard(const ScopeGuard&) = delete;
    ScopeGuard& operator=(const ScopeGuard&) = delete;

private:
    std::function<void()> undo_;
    bool active_ = true;
};

void addAll(std::vector<int>& v, int count, int failAt) {
    ScopeGuard rollback([&v, size = v.size()] { v.resize(size); });
    for (int i = 0; i < count; ++i) {
        if (i == failAt) throw std::runtime_error("failure");
        v.push_back(i);
    }
    rollback.dismiss();
}

int main() {
    std::vector<int> v{100};
    try {
        addAll(v, 3, 2);
    } catch (const std::exception&) {
    }
    std::cout << "size after failure: " << v.size() << "\n";
    addAll(v, 3, -1);
    std::cout << "size after success: " << v.size() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Відкат після збою", has: "size after failure: 1", hint: "У деструкторі викличте undo_(), якщо захисник ще активний." },
      { on: "stdout", name: "Успіх без відкату", has: "size after success: 4", hint: "Після dismiss захисник уже нічого не робить." },
      { on: "stdout", name: "Вивід збігається", equals: "size after failure: 1\nsize after success: 4", hint: "Два рядки у вказаному форматі." },
      { on: "source", name: "Деструктор перевіряє active_", matches: "if\\s*\\(\\s*active_\\s*\\)", hint: "Умова: виконувати відкат лише для активного захисника." },
    ],
  },
  {
    ...base, id: "cpp-parse-strategy", lesson: "cpp/65", xp: 30,
    title: "Код чи assert: вибір стратегії помилки",
    context: "Погані дані користувача це очікувана ситуація, а порожній список у внутрішній функції це помилка програміста. Правильний вибір стратегії робить код і простішим, і надійнішим.",
    brief: [
      "Допишіть <code>parsePercent</code>: вона повертає <code>std::optional&lt;int&gt;</code> зі значенням від 0 до 100 або <code>std::nullopt</code>, якщо текст порожній, містить не цифри чи число більше за 100. У <code>average</code> додайте <code>assert</code>, що вектор не порожній.",
      "Очікуваний вивід: рядки вигляду <code>'42' -&gt; 42</code> або <code>'abc' -&gt; invalid</code> для входів 42, abc, порожній рядок, 101, 100, а далі <code>average: 3</code>.",
    ],
    starter: raw`#include <cassert>
#include <cctype>
#include <iostream>
#include <optional>
#include <string>
#include <vector>

std::optional<int> parsePercent(const std::string& s) {
    // TODO: порожній рядок чи символ не цифра: повернути std::nullopt
    // TODO: зберіть число з цифр; якщо воно більше за 100, повернути std::nullopt
    return std::nullopt;
}

int average(const std::vector<int>& v) {
    // TODO: assert(!v.empty());
    int sum = 0;
    for (int x : v) sum += x;
    return sum / static_cast<int>(v.size());
}

int main() {
    for (std::string s : {"42", "abc", "", "101", "100"}) {
        auto p = parsePercent(s);
        std::cout << "'" << s << "' -> ";
        if (p) std::cout << *p << "\n";
        else std::cout << "invalid\n";
    }
    std::cout << "average: " << average({2, 3, 4}) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Коректні значення", has: "'42' -> 42", hint: "Для рядка з цифр поверніть число, зібране як value = value * 10 + цифра." },
      { on: "stdout", name: "Не число відхиляється", has: "'abc' -> invalid", hint: "Перший символ не цифра: nullopt." },
      { on: "stdout", name: "Порожній і завеликий відхиляються", has: "'' -> invalid\n'101' -> invalid\n'100' -> 100", hint: "Порожній рядок і число понад 100 теж помилка, а 100 допустиме." },
      { on: "stdout", name: "Вивід збігається", equals: "'42' -> 42\n'abc' -> invalid\n'' -> invalid\n'101' -> invalid\n'100' -> 100\naverage: 3", hint: "Шість рядків, формат точний." },
      { on: "source", name: "Передумова перевіряється assert", matches: "assert\\s*\\(\\s*!\\s*v\\.empty\\(\\)", hint: "Контракт average: вектор не порожній." },
    ],
  },
  {
    ...base, id: "cpp-noexcept-move", lesson: "cpp/66", xp: 40,
    title: "noexcept: переміщення у векторі й безпечна межа",
    context: "Без noexcept на конструкторі переміщення вектор копіює елементи під час росту, а це дорого. Функція з noexcept, що ловить усе всередині, дає надійну межу, через яку виняток не вилетить.",
    brief: [
      "Позначте конструктор переміщення <code>Item</code> специфікатором <code>noexcept</code>, щоб <code>vector</code> під час росту переміщував елементи, а не копіював. Допишіть <code>toInt</code>: вона викликає <code>std::stoi</code>, а на будь-якому виключенні повертає -1.",
      "Очікуваний вивід: <code>copies: 0</code>, <code>moves: 2</code>, <code>toInt(12)=12</code>, <code>toInt(zz)=-1</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <vector>

static int copies = 0;
static int moves = 0;

struct Item {
    Item() = default;
    Item(const Item&) { ++copies; }
    // TODO: позначте конструктор переміщення як noexcept
    Item(Item&&) { ++moves; }
};

int toInt(const std::string& s) noexcept {
    // TODO: поверніть std::stoi(s), але ловіть будь-яке виключення (catch (...)) і повертайте -1
    return 0;
}

int main() {
    std::vector<Item> v;
    v.reserve(2);
    v.emplace_back();
    v.emplace_back();
    v.emplace_back();
    std::cout << "copies: " << copies << "\n";
    std::cout << "moves: " << moves << "\n";
    std::cout << "toInt(12)=" << toInt("12") << "\n";
    std::cout << "toInt(zz)=" << toInt("zz") << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вектор переміщує, а не копіює", has: "copies: 0\nmoves: 2", hint: "Вектор переміщує лише тоді, коли конструктор переміщення гарантовано не кидає." },
      { on: "stdout", name: "Коректний рядок розбирається", has: "toInt(12)=12", hint: "stoi повертає 12, його й віддайте." },
      { on: "stdout", name: "Збій перетворюється на -1", has: "toInt(zz)=-1", hint: "stoi кидає виключення на нечисловому тексті: поставте try і catch (...)." },
      { on: "stdout", name: "Вивід збігається", equals: "copies: 0\nmoves: 2\ntoInt(12)=12\ntoInt(zz)=-1", hint: "Чотири рядки у вказаному форматі." },
      { on: "source", name: "Є noexcept на переміщенні", matches: "Item\\s*\\(\\s*Item&&\\s*\\)\\s*noexcept", hint: "Специфікатор пишуть після списку параметрів конструктора." },
    ],
  },
  {
    ...base, id: "cpp-result-variant", lesson: "cpp/67", xp: 45,
    title: "Result на variant: ланцюжок кроків",
    context: "Результат із помилкою всередині типу змушує обробити її і дозволяє збирати кроки в ланцюжок без виключень. Такий підхід поширений у парсерах і мережевих бібліотеках.",
    brief: [
      "Типи <code>Error</code>, <code>Result</code> і функція <code>andThen</code> уже готові. Допишіть <code>parse</code>: рядок з однієї чи кількох цифр дає число, інакше <code>Error{\"not a number: \" + s}</code>. Допишіть <code>halve</code>: парне число ділить навпіл, непарне дає <code>Error{\"odd: \" + std::to_string(v)}</code>.",
      "Очікуваний вивід для входів 8, 7, x: <code>8 -&gt; 4</code>, <code>7 -&gt; odd: 7</code>, <code>x -&gt; not a number: x</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <variant>

struct Error {
    std::string message;
};

template <class T>
using Result = std::variant<T, Error>;

template <class T, class F>
auto andThen(const Result<T>& r, F step) -> decltype(step(std::get<T>(r))) {
    if (std::holds_alternative<Error>(r)) return std::get<Error>(r);
    return step(std::get<T>(r));
}

Result<int> parse(const std::string& s) {
    // TODO: порожній рядок чи нецифра: return Error{"not a number: " + s};
    // інакше зберіть число з цифр і поверніть його
    return Error{"not implemented"};
}

Result<int> halve(int v) {
    // TODO: непарне: return Error{"odd: " + std::to_string(v)}; парне: v / 2
    return Error{"not implemented"};
}

int main() {
    for (std::string s : {"8", "7", "x"}) {
        Result<int> r = andThen(parse(s), halve);
        std::cout << s << " -> ";
        if (std::holds_alternative<Error>(r)) std::cout << std::get<Error>(r).message << "\n";
        else std::cout << std::get<int>(r) << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Парне число ділиться", has: "8 -> 4", hint: "parse дає 8, halve повертає 8 / 2." },
      { on: "stdout", name: "Помилка кроку halve", has: "7 -> odd: 7", hint: "Непарне число: Error із текстом «odd: » і самим числом." },
      { on: "stdout", name: "Помилка кроку parse пропускає halve", has: "x -> not a number: x", hint: "Помилка з parse проходить крізь andThen без змін." },
      { on: "stdout", name: "Вивід збігається", equals: "8 -> 4\n7 -> odd: 7\nx -> not a number: x", hint: "Три рядки у вказаному форматі." },
    ],
  },
];
