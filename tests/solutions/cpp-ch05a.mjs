// Еталонні рішення завдань C++, глава 05 (частина a, уроки 49–54). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_05a = {
  "cpp-inherit-employee": raw`#include <iostream>
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

class Manager : public Employee {
public:
    Manager(const std::string& name, int salary, int bonus) : Employee(name, salary), bonus_(bonus) {
        std::cout << "менеджер " << this->name() << "\n";
    }
    ~Manager() { std::cout << "~менеджер " << name() << "\n"; }
    int total() const { return salary() + bonus_; }

private:
    int bonus_;
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
  "cpp-virtual-shapes": raw`#include <iomanip>
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

class Circle : public Shape {
public:
    Circle(double r) : r_(r) {}
    double area() const override { return 3.14159265 * r_ * r_; }
    std::string name() const override { return "Коло"; }

private:
    double r_;
};

class Rect : public Shape {
public:
    Rect(double w, double h) : w_(w), h_(h) {}
    double area() const override { return w_ * h_; }
    std::string name() const override { return "Прямокутник"; }

private:
    double w_, h_;
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
  "cpp-abstract-notifier": raw`#include <iostream>
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
        std::cout << "email: " << msg << "\n";
    }
};

class SmsNotifier : public Notifier {
public:
    void send(const std::string& msg) override {
        std::cout << "sms: " << msg << "\n";
    }
};

void broadcast(const std::vector<Notifier*>& all, const std::string& msg) {
    for (Notifier* n : all) n->send(msg);
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
  "cpp-template-clamp": raw`#include <iostream>
#include <string>

template <typename T>
T clampTo(T v, T lo, T hi) {
    if (v < lo) return lo;
    if (hi < v) return hi;
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
  "cpp-template-queue": raw`#include <iostream>
#include <string>
#include <vector>

template <typename T>
class Queue {
public:
    void push(const T& v) { items_.push_back(v); }
    T pop() {
        T first = items_.front();
        items_.erase(items_.begin());
        return first;
    }
    std::size_t size() const { return items_.size(); }

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
  "cpp-function-pipeline": raw`#include <functional>
#include <iostream>
#include <vector>

using Step = std::function<int(int)>;

Step makeAdder(int n) {
    return [n](int v) { return v + n; };
}

int applyAll(const std::vector<Step>& steps, int x) {
    for (const Step& s : steps) {
        x = s(x);
    }
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
};
