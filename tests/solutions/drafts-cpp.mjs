// Еталони чернеток проєктів C++ і мутації для перевірки вимог. У сайт не потрапляє.
// Мутація = заміна в еталоні, після якої мають провалитися саме перелічені вимоги (fails). Кожна вимога чернетки покрита хоч однією мутацією.
const raw = String.raw;

export const CPP_SOLUTIONS = {
  "cpp-temperature-log": raw`#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

double average(const std::vector<double>& t) {
    if (t.empty()) return 0.0;
    double sum = 0.0;
    for (double x : t) sum += x;
    return sum / static_cast<double>(t.size());
}

double minTemp(const std::vector<double>& t) {
    double m = t[0];
    for (double x : t)
        if (x < m) m = x;
    return m;
}

double maxTemp(const std::vector<double>& t) {
    double m = t[0];
    for (double x : t)
        if (x > m) m = x;
    return m;
}

int daysAbove(const std::vector<double>& t, double limit) {
    int n = 0;
    for (double x : t)
        if (x > limit) ++n;
    return n;
}

int longestWarmStreak(const std::vector<double>& t, double limit) {
    int best = 0, current = 0;
    for (double x : t) {
        if (x > limit) {
            ++current;
            if (current > best) best = current;
        } else current = 0;
    }
    return best;
}

std::string describe(double temp) {
    if (temp < 10) return "холодно";
    if (temp < 20) return "прохолодно";
    if (temp < 28) return "тепло";
    return "спекотно";
}

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

  "cpp-bank-account": raw`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

std::string money(double v) {
    std::ostringstream out;
    out << std::fixed << std::setprecision(2) << v;
    return out.str();
}

class Account {
public:
    explicit Account(std::string owner, double balance = 0.0) : owner_(std::move(owner)), balance_(balance) {}

    const std::string& owner() const { return owner_; }
    double balance() const { return balance_; }
    std::size_t operations() const { return history_.size(); }
    std::string lastOperation() const { return history_.empty() ? "немає операцій" : history_.back(); }

    bool deposit(double amount) {
        if (amount <= 0) return false;
        balance_ += amount;
        history_.push_back("поповнення +" + money(amount));
        return true;
    }

    bool withdraw(double amount) {
        if (amount <= 0 || amount > balance_) return false;
        balance_ -= amount;
        history_.push_back("зняття -" + money(amount));
        return true;
    }

    bool transferTo(Account& to, double amount) {
        if (amount <= 0 || amount > balance_) return false;
        balance_ -= amount;
        to.balance_ += amount;
        history_.push_back("переказ -" + money(amount) + " (" + to.owner_ + ")");
        to.history_.push_back("переказ +" + money(amount) + " (" + owner_ + ")");
        return true;
    }

private:
    std::string owner_;
    double balance_;
    std::vector<std::string> history_;
};

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

  "cpp-shapes-zoo": raw`#include <algorithm>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

const double PI = 3.14159265358979323846;

class Shape {
public:
    virtual double area() const = 0;
    virtual double perimeter() const = 0;
    virtual std::string name() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    explicit Circle(double r) : r_(r) {}
    double area() const override { return PI * r_ * r_; }
    double perimeter() const override { return 2 * PI * r_; }
    std::string name() const override { return "Коло"; }
private:
    double r_;
};

class Rectangle : public Shape {
public:
    Rectangle(double w, double h) : w_(w), h_(h) {}
    double area() const override { return w_ * h_; }
    double perimeter() const override { return 2 * (w_ + h_); }
    std::string name() const override { return "Прямокутник"; }
private:
    double w_, h_;
};

class Triangle : public Shape {
public:
    Triangle(double a, double b, double c) : a_(a), b_(b), c_(c) {}
    double area() const override {
        double s = (a_ + b_ + c_) / 2;
        return std::sqrt(s * (s - a_) * (s - b_) * (s - c_));
    }
    double perimeter() const override { return a_ + b_ + c_; }
    std::string name() const override { return "Трикутник"; }
private:
    double a_, b_, c_;
};

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
};

/** [від, до] або [від, до, "all"] для заміни всіх входжень */
export const CPP_MUTATIONS = {
  "cpp-temperature-log": [
    { fails: ["R6", "R8"], replace: [["    if (t.empty()) return 0.0;\n", ""]] },
    { fails: ["R3", "R8"], replace: [["if (x < m) m = x;", "if (x > m) m = x;"]] },
    { fails: ["R1", "R8"], replace: [["if (temp < 10) return", "if (temp < 9) return"]] },
    { fails: ["R4", "R8"], replace: [["if (x > limit) ++n;", "if (x > limit + 2) ++n;"]] },
    { fails: ["R5", "R8"], replace: [["} else current = 0;", "}"]] },
    { fails: ["R2", "R8"], replace: [["return sum / static_cast<double>(t.size());", "return sum / (t.size() + 1);"]] },
    { fails: ["R7"], replace: [["#include <iomanip>", "#include <iomanip>\n#include <numeric>"], ["    double sum = 0.0;\n    for (double x : t) sum += x;\n", "    double sum = std::accumulate(t.begin(), t.end(), 0.0);\n"]] },
  ],
  "cpp-bank-account": [
    { fails: ["R1", "R9"], replace: [["balance_(balance) {}", "balance_(0.0) {}"]] },
    { fails: ["R2", "R9"], replace: [["        if (amount <= 0) return false;\n        balance_ += amount;", "        balance_ += amount;"]] },
    { fails: ["R3", "R9"], replace: [["if (amount <= 0 || amount > balance_) return false;\n        balance_ -= amount;\n        history_.push_back(\"зняття", "if (amount <= 0 || amount > balance_ + 1000) return false;\n        balance_ -= amount;\n        history_.push_back(\"зняття"]] },
    { fails: ["R4", "R9"], replace: [["        to.balance_ += amount;\n", ""]] },
    { fails: ["R5", "R9"], replace: [["        history_.push_back(\"поповнення +\" + money(amount));\n", ""]] },
    { fails: ["R6", "R9"], replace: [["\"переказ -\"", "\"переказ - \""]] },
    { fails: ["R7"], replace: [["private:", "public:"]] },
    { fails: ["R8"], replace: [["double balance() const {", "double balance() {"]] },
  ],
  "cpp-shapes-zoo": [
    { fails: ["R1"], replace: [["virtual double area() const = 0;", "virtual double area() const { return 0; }"]] },
    { fails: ["R2"], replace: [["    virtual ~Shape() = default;\n", ""]] },
    { fails: ["R3", "R9"], replace: [["return PI * r_ * r_;", "return PI * r_;"]] },
    { fails: ["R4", "R9"], replace: [["return 2 * (w_ + h_);", "return w_ + h_;"]] },
    // у трикутника 3-4-5 множник (s - c) дорівнює 1, тож прибираємо інший, щоб площа справді змінилась
    { fails: ["R5", "R9"], replace: [["std::sqrt(s * (s - a_) * (s - b_) * (s - c_))", "std::sqrt(s * (s - b_) * (s - c_))"]] },
    { fails: ["R6"], replace: [[" override", "", "all"]] },
    { fails: ["R7", "R8", "R9"], replace: [["std::sqrt(s * (s - a_) * (s - b_) * (s - c_))", "3 * std::sqrt(s * (s - a_) * (s - b_) * (s - c_))"]] },
  ],
};
