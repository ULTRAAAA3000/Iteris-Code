// Еталонні рішення завдань C++ (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const CPP = {
  "cpp-hello-compiler": raw`#include <iostream>

int main() {
    std::cout << "Привіт, C++!" << std::endl;
    std::cout << "Компілятор працює" << std::endl;
    return 0;
}
`,
  "cpp-first-program": raw`#include <iostream>

int main() {
    std::cout << "2 + 3 = " << 2 + 3 << std::endl;
    std::cout << "(8 + 4) * 3 = " << (8 + 4) * 3 << std::endl;
    return 0;
}
`,
  "cpp-types-total": raw`#include <iostream>
#include <iomanip>

int main() {
    double price = 199.99;
    int qty = 3;
    double total = price * qty;
    std::cout << "Разом: " << std::fixed << std::setprecision(2) << total << std::endl;
    std::cout << std::defaultfloat << 7 / 2 << " " << 7 / 2.0 << std::endl;
    return 0;
}
`,
  "cpp-multiples": raw`#include <iostream>

int main() {
    int sum = 0;
    bool first = true;
    for (int i = 1; i <= 20; i++) {
        if (i % 3 == 0 || i % 5 == 0) {
            if (!first) std::cout << " ";
            std::cout << i;
            sum += i;
            first = false;
        }
    }
    std::cout << std::endl;
    std::cout << "Сума: " << sum << std::endl;
    return 0;
}
`,
  "cpp-overload-default": raw`#include <iostream>
#include <iomanip>

int power(int base, int exp = 2) {
    int result = 1;
    for (int i = 0; i < exp; i++) result *= base;
    return result;
}

double area(double r) {
    return 3.14159265 * r * r;
}

double area(double w, double h) {
    return w * h;
}

int main() {
    std::cout << power(5) << std::endl;
    std::cout << power(2, 10) << std::endl;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << area(2) << std::endl;
    std::cout << area(3, 4) << std::endl;
    return 0;
}
`,
  "cpp-vector-string": raw`#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

int sum(const std::vector<int>& v) {
    int total = 0;
    for (int n : v) total += n;
    return total;
}

std::vector<int> evens(const std::vector<int>& v) {
    std::vector<int> out;
    for (int n : v) {
        if (n % 2 == 0) out.push_back(n);
    }
    return out;
}

std::string reversed(std::string s) {
    std::reverse(s.begin(), s.end());
    return s;
}

int main() {
    std::vector<int> nums = {5, 2, 9, 7, 4, 10, 3, 8};
    std::cout << "Сума: " << sum(nums) << std::endl;
    std::cout << "Парні:";
    for (int n : evens(nums)) std::cout << " " << n;
    std::cout << std::endl;
    std::cout << reversed("Cpp") << std::endl;
    return 0;
}
`,
  "cpp-pointers-references": raw`#include <iostream>

void swapValues(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}

void increment(int* p) {
    *p += 1;
}

int main() {
    int a = 1, b = 2;
    swapValues(a, b);
    std::cout << a << " " << b << std::endl;

    int x = 10;
    increment(&x);
    increment(&x);
    std::cout << x << std::endl;
    return 0;
}
`,
  "cpp-raii-guard": raw`#include <iostream>
#include <string>

class Guard {
    std::string name;

public:
    Guard(std::string n) : name(n) {
        std::cout << "acquire " << name << std::endl;
    }
    ~Guard() {
        std::cout << "release " << name << std::endl;
    }
};

int main() {
    std::cout << "start" << std::endl;
    {
        Guard g("A");
        std::cout << "work" << std::endl;
    }
    std::cout << "end" << std::endl;
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
    virtual double area() const = 0;
    virtual std::string name() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double r;

public:
    Circle(double r) : r(r) {}
    double area() const override { return 3.14159265 * r * r; }
    std::string name() const override { return "Коло"; }
};

class Rect : public Shape {
    double w, h;

public:
    Rect(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
    std::string name() const override { return "Прямокутник"; }
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(2));
    shapes.push_back(std::make_unique<Rect>(3, 4));
    std::cout << std::fixed << std::setprecision(2);
    for (const auto& s : shapes) {
        std::cout << s->name() << ": " << s->area() << std::endl;
    }
    return 0;
}
`,
  "cpp-stl-algorithms": raw`#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> words = {"banana", "kiwi", "apple", "fig", "cherry"};

    std::sort(words.begin(), words.end(), [](const std::string& a, const std::string& b) {
        if (a.size() != b.size()) return a.size() < b.size();
        return a < b;
    });
    for (const auto& w : words) std::cout << w << " ";
    std::cout << std::endl;

    int total = std::accumulate(words.begin(), words.end(), 0, [](int acc, const std::string& w) { return acc + (int)w.size(); });
    std::cout << "Всього літер: " << total << std::endl;
    return 0;
}
`,
};
