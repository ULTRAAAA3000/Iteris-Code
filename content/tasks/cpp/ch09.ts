// Практичні завдання глави «Тестування» (уроки 90–94). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_09: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-assert-preconditions", lesson: "cpp/90", xp: 30,
    title: "Передумови через assert",
    context: "Assert фіксує передумови функції прямо в коді: порушення ловиться на вході, а не за сто викликів звідти. У релізі з NDEBUG такі перевірки зникають і нічого не коштують.",
    brief: [
      "Допишіть дві функції. <code>divide(a, b)</code> повертає <code>a / b</code>, а її передумова: <code>b != 0</code>. <code>average(v)</code> повертає суму елементів, поділену на їх кількість, а передумова: вектор не порожній.",
      "Передумови запишіть через <code>assert</code> із поясненням у рядку (<code>&amp;&amp; \"текст\"</code>). Умова в assert не має змінювати стан програми. У <code>main</code> виклики правильні: програма друкує <code>частка: 7</code> і <code>середнє: 6</code>.",
    ],
    starter: raw`#include <cassert>
#include <iostream>
#include <vector>

int divide(int a, int b) {
    // TODO: assert, що b != 0, з поясненням
    return 0;  // TODO: a / b
}

int average(const std::vector<int>& v) {
    // TODO: assert, що вектор не порожній
    return 0;  // TODO: сума елементів, поділена на кількість
}

int main() {
    std::cout << "частка: " << divide(21, 3) << "\n";
    std::cout << "середнє: " << average({4, 8, 6}) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Частка", has: "частка: 7", hint: "Функція divide має повертати a / b." },
      { on: "stdout", name: "Середнє", has: "середнє: 6", hint: "Сума 4 + 8 + 6 дорівнює 18, а елементів три." },
      { on: "stdout", name: "Точний вивід", equals: "частка: 7\nсереднє: 6", hint: "Два рядки, без зайвого тексту." },
      { on: "source", name: "Assert на нуль", matches: "assert\\s*\\(\\s*b\\s*!=\\s*0", hint: "Передумова ділення: дільник не дорівнює нулю." },
      { on: "source", name: "Assert на порожній вектор", matches: "assert\\s*\\(\\s*!\\s*v\\.empty\\s*\\(\\s*\\)", hint: "Метод empty() каже, чи порожній вектор." },
    ],
  },
  {
    ...base, id: "cpp-mini-test-stand", lesson: "cpp/91", xp: 35,
    title: "Власний тестовий стенд",
    context: "Бібліотеки тестування починаються з лічильників і одного макроса. Свій стенд показує, як перетворити вираз на текст звіту, і допомагає зрозуміти, що саме роблять GoogleTest чи Catch2.",
    brief: [
      "Дороблено все, крім макроса <code>CHECK(cond)</code>. Він має в <code>do { } while (0)</code> збільшувати <code>g_passed</code>, якщо умова істинна, інакше збільшувати <code>g_failed</code> і друкувати <code>ПРОВАЛ: </code> та текст умови через оператор <code>#cond</code>.",
      "Одна з перевірок у <code>main</code> навмисно хибна. Очікуваний вивід: рядок про провал <code>ПРОВАЛ: clamp(5, 0, 3) == 4</code> і підсумок <code>пройдено: 3, провалено: 1</code>.",
    ],
    starter: raw`#include <iostream>

static int g_passed = 0;
static int g_failed = 0;

// TODO: тіло макроса в do { ... } while (0): лічильники й друк "ПРОВАЛ: " << #cond
#define CHECK(cond) \
    do {            \
        (void)(cond); \
    } while (0)

int clamp(int x, int lo, int hi) {
    if (x < lo) return lo;
    if (x > hi) return hi;
    return x;
}

int main() {
    CHECK(clamp(2, 0, 3) == 2);
    CHECK(clamp(-1, 0, 3) == 0);
    CHECK(clamp(5, 0, 3) == 3);
    CHECK(clamp(5, 0, 3) == 4);
    std::cout << "пройдено: " << g_passed << ", провалено: " << g_failed << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Текст умови з коду", has: "ПРОВАЛ: clamp(5, 0, 3) == 4", hint: "Оператор # у макросі перетворює аргумент на рядок." },
      { on: "stdout", name: "Підсумок", has: "пройдено: 3, провалено: 1", hint: "Три перевірки істинні, одна хибна: лічильники мають це показати." },
      { on: "stdout", name: "Точний вивід", equals: "ПРОВАЛ: clamp(5, 0, 3) == 4\nпройдено: 3, провалено: 1", hint: "Спершу рядок про провал, потім підсумок." },
      { on: "source", name: "Оператор # у макросі", matches: "<<\\s*#cond", hint: "Виведіть #cond потоком після тексту «ПРОВАЛ: »." },
      { on: "source", name: "Ідіома do-while", matches: "do\\s*\\{[\\s\\S]*\\}\\s*while\\s*\\(\\s*0\\s*\\)", hint: "Тіло макроса загортають у do { } while (0)." },
    ],
  },
  {
    ...base, id: "cpp-table-tests", lesson: "cpp/92", xp: 35,
    title: "Табличний тест з межами",
    context: "Табличний тест відокремлює дані від логіки: новий випадок це один рядок. Таблиця з граничними значеннями ловить помилки «на одиницю», яких не помітять перевірки з типовими числами.",
    brief: [
      "Функція <code>ticket_price(age)</code> має в собі помилку на межі. Таблиця випадків (<code>name</code>, <code>age</code>, <code>expected</code>) уже складена. Допишіть у <code>main</code> цикл range-for: порівняйте результат функції з очікуваним, порахуйте пройдені й у разі розбіжності надрукуйте рядок формату <code>ПРОВАЛ: назва (вік): очікувалось X, отримано Y</code>.",
      "Наприкінці друкуйте <code>пройдено P з N</code>, де N це розмір таблиці. Помилку у функції не виправляйте: вона й має знайтися таблицею.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <vector>

int ticket_price(int age) {
    if (age < 6) return 0;
    if (age < 18) return 50;
    if (age <= 65) return 100;  // помилка на межі, її має знайти таблиця
    return 60;
}

struct Case {
    std::string name;
    int age;
    int expected;
};

int main() {
    const std::vector<Case> table = {
        {"немовля", 0, 0},
        {"останній безкоштовний", 5, 0},
        {"перший дитячий", 6, 50},
        {"останній дитячий", 17, 50},
        {"перший дорослий", 18, 100},
        {"останній дорослий", 64, 100},
        {"межа пенсії", 65, 60},
        {"пенсіонер", 80, 60},
    };
    int ok = 0;
    // TODO: цикл по table; при збігу ++ok, інакше друк "ПРОВАЛ: назва (вік): очікувалось X, отримано Y"
    std::cout << "пройдено " << ok << " з " << table.size() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Знайдено помилку на межі", has: "ПРОВАЛ: межа пенсії (65): очікувалось 60, отримано 100", hint: "У рядку про провал: назва, вік у дужках, очікуване й отримане." },
      { on: "stdout", name: "Лише один провал", matches: "^(?![\\s\\S]*ПРОВАЛ[\\s\\S]*ПРОВАЛ)[\\s\\S]*$", hint: "Решта семи випадків має пройти без повідомлень." },
      { on: "stdout", name: "Підсумок", has: "пройдено 7 з 8", hint: "Лічильник збільшуйте лише коли результат збігся з очікуваним." },
      { on: "stdout", name: "Точний вивід", equals: "ПРОВАЛ: межа пенсії (65): очікувалось 60, отримано 100\nпройдено 7 з 8", hint: "Спершу провал, потім підсумок." },
      { on: "source", name: "Цикл по таблиці", matches: "for\\s*\\(\\s*const\\s+Case\\s*&\\s*\\w+\\s*:\\s*table\\s*\\)", hint: "Пройдіться по таблиці через range-for зі сталим посиланням." },
    ],
  },
  {
    ...base, id: "cpp-test-double-spy", lesson: "cpp/93", xp: 35,
    title: "Шпигун замість справжнього логера",
    context: "Код, що пише в журнал, мережу чи пошту, в тесті отримує дубль. Шпигун запам'ятовує виклики, і тест перевіряє не лише результат функції, а й її побічні ефекти.",
    brief: [
      "Інтерфейс <code>Logger</code> і клас <code>Monitor</code> готові: монітор викликає <code>log</code>, коли температура вища за 30. Напишіть <code>SpyLogger</code>: публічного нащадка <code>Logger</code>, який у методі <code>log</code> (з <code>override</code>) складає тексти в публічний <code>std::vector&lt;std::string&gt;</code> з іменем <code>seen</code>.",
      "У <code>main</code> монітор перевіряє температури 25, 35 і 40. Програма друкує кількість повідомлень і кожне повідомлення на окремому рядку.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <vector>

class Logger {
public:
    virtual ~Logger() = default;
    virtual void log(const std::string& text) = 0;
};

class Monitor {
public:
    explicit Monitor(Logger& logger) : logger_(logger) {}
    void check(int temp) {
        if (temp > 30) {
            logger_.log("жарко: " + std::to_string(temp));
        }
    }

private:
    Logger& logger_;
};

// TODO: SpyLogger : public Logger; log(...) override кладе текст у вектор seen
class SpyLogger {
public:
    std::vector<std::string> seen;
};

int main() {
    SpyLogger spy;
    Monitor monitor(spy);
    monitor.check(25);
    monitor.check(35);
    monitor.check(40);
    std::cout << "повідомлень: " << spy.seen.size() << "\n";
    for (const std::string& s : spy.seen) {
        std::cout << s << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Кількість повідомлень", has: "повідомлень: 2", hint: "Тепла температура 25 нічого не журналить, 35 і 40 журналять." },
      { on: "stdout", name: "Зміст повідомлень", has: "жарко: 35\nжарко: 40", hint: "Шпигун зберігає тексти у порядку викликів." },
      { on: "stdout", name: "Точний вивід", equals: "повідомлень: 2\nжарко: 35\nжарко: 40", hint: "Три рядки: лічильник і два повідомлення." },
      { on: "source", name: "Нащадок інтерфейсу", matches: "class\\s+SpyLogger\\s*:\\s*public\\s+Logger", hint: "SpyLogger має публічно успадковувати Logger." },
      { on: "source", name: "override у log", matches: "void\\s+log\\s*\\([^)]*\\)\\s*override", hint: "Позначте перевизначений метод ключовим словом override." },
    ],
  },
  {
    ...base, id: "cpp-bench-harness", lesson: "cpp/94", xp: 40,
    title: "Мінімальний бенчмарк-харнес",
    context: "Чесний замір вимагає стабільного годинника, кількох повторів і результату, який оптимізатор не може викинути. Харнес на двадцять рядків відтворює ці правила без жодних бібліотек.",
    brief: [
      "Напишіть <code>bench(f, reps)</code>: функція викликає <code>f</code> рівно <code>reps</code> разів, міряє кожен виклик через <code>std::chrono::steady_clock</code> і повертає найменшу тривалість у наносекундах.",
      "Результат обчислень у <code>main</code> записується у <code>volatile</code>-змінну <code>g_sink</code>, щоб оптимізатор не викинув цикл. Самих часів не друкуйте: вони щоразу інші. Друкуйте лише детерміновані рядки з заготовки.",
    ],
    starter: raw`#include <chrono>
#include <functional>
#include <iostream>
#include <vector>

volatile long long g_sink = 0;

// TODO: викликає f рівно reps разів, міряє кожен виклик steady_clock і повертає мінімум
std::chrono::nanoseconds bench(const std::function<void()>& f, int reps) {
    (void)f;
    (void)reps;
    return std::chrono::nanoseconds::zero();
}

int main() {
    std::vector<int> data(1000, 2);
    int calls = 0;
    auto best = bench([&] {
        long long s = 0;
        for (int x : data) {
            s += x;
        }
        g_sink = s;
        ++calls;
    }, 5);
    std::cout << "викликів: " << calls << "\n";
    std::cout << "замір невід'ємний: " << (best.count() >= 0 ? "так" : "ні") << "\n";
    std::cout << "сума: " << g_sink << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "f викликано рівно reps разів", has: "викликів: 5", hint: "Цикл у bench має зробити рівно reps ітерацій." },
      { on: "stdout", name: "Сума обчислена", has: "сума: 2000", hint: "Лише виклик f обчислює суму й записує її в g_sink." },
      { on: "stdout", name: "Точний вивід", equals: "викликів: 5\nзамір невід'ємний: так\nсума: 2000", hint: "Три рядки з заготовки." },
      { on: "source", name: "Стабільний годинник", has: "steady_clock", hint: "Використайте std::chrono::steady_clock: він не стрибає назад." },
      { on: "source", name: "Мінімум замість середнього", matches: "best|min", hint: "Зберігайте найменший замір і оновлюйте його, коли знайдено менший." },
    ],
  },
];
