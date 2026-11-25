// Еталони чернеток C++-проєктів: повний код користувача (без main), що проходить усі вимоги harness.
const raw = String.raw;

const temp = raw`#include <string>
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
`;

const bank = raw`#include <iomanip>
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
`;

const zoo = raw`#include <algorithm>
#include <cmath>
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

double totalArea(const std::vector<std::unique_ptr<Shape>>& shapes) {
    double total = 0;
    for (const auto& s : shapes) total += s->area();
    return total;
}

const Shape* largest(const std::vector<std::unique_ptr<Shape>>& shapes) {
    const Shape* best = nullptr;
    for (const auto& s : shapes)
        if (!best || s->area() > best->area()) best = s.get();
    return best;
}

void sortByArea(std::vector<std::unique_ptr<Shape>>& shapes) {
    std::sort(shapes.begin(), shapes.end(), [](const auto& a, const auto& b) { return a->area() < b->area(); });
}
`;

export default { "cpp-temperature-log": temp, "cpp-bank-account": bank, "cpp-shapes-zoo": zoo };
