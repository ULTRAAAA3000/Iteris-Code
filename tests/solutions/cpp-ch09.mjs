// Еталонні рішення завдань C++, глава 09 «Тестування» (уроки 90–94). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_09 = {
  "cpp-assert-preconditions": raw`#include <cassert>
#include <iostream>
#include <vector>

int divide(int a, int b) {
    assert(b != 0 && "divide: дільник не має бути нулем");
    return a / b;
}

int average(const std::vector<int>& v) {
    assert(!v.empty() && "average: вектор не має бути порожнім");
    int sum = 0;
    for (int x : v) {
        sum += x;
    }
    return sum / static_cast<int>(v.size());
}

int main() {
    std::cout << "частка: " << divide(21, 3) << "\n";
    std::cout << "середнє: " << average({4, 8, 6}) << "\n";
    return 0;
}
`,
  "cpp-mini-test-stand": raw`#include <iostream>

static int g_passed = 0;
static int g_failed = 0;

#define CHECK(cond)                                      \
    do {                                                 \
        if (cond) {                                      \
            ++g_passed;                                  \
        } else {                                         \
            ++g_failed;                                  \
            std::cout << "ПРОВАЛ: " << #cond << "\n";    \
        }                                                \
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
  "cpp-table-tests": raw`#include <iostream>
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
    for (const Case& c : table) {
        int got = ticket_price(c.age);
        if (got == c.expected) {
            ++ok;
        } else {
            std::cout << "ПРОВАЛ: " << c.name << " (" << c.age << "): очікувалось "
                      << c.expected << ", отримано " << got << "\n";
        }
    }
    std::cout << "пройдено " << ok << " з " << table.size() << "\n";
    return 0;
}
`,
  "cpp-test-double-spy": raw`#include <iostream>
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

class SpyLogger : public Logger {
public:
    void log(const std::string& text) override { seen.push_back(text); }
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
  "cpp-bench-harness": raw`#include <chrono>
#include <functional>
#include <iostream>
#include <vector>

volatile long long g_sink = 0;

std::chrono::nanoseconds bench(const std::function<void()>& f, int reps) {
    using clock = std::chrono::steady_clock;
    std::chrono::nanoseconds best = std::chrono::nanoseconds::max();
    for (int i = 0; i < reps; ++i) {
        auto t0 = clock::now();
        f();
        auto dt = std::chrono::duration_cast<std::chrono::nanoseconds>(clock::now() - t0);
        if (dt < best) {
            best = dt;
        }
    }
    return best;
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
};
