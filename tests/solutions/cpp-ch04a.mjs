// Еталонні рішення завдань C++, глава 04 (частина a, уроки 32–37). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_04a = {
  "cpp-struct-rect": raw`#include <iostream>

struct Rect {
    int w;
    int h;
};

int area(const Rect& r) {
    return r.w * r.h;
}

int main() {
    Rect a{3, 4};
    std::cout << "a: " << area(a) << "\n";
    Rect b{5, 6};
    std::cout << "b: " << area(b) << "\n";
    return 0;
}
`,
  "cpp-class-account": raw`#include <iostream>

class Account {
public:
    void deposit(int amount) {
        if (amount > 0) balance_ += amount;
    }
    bool withdraw(int amount) {
        if (amount <= 0 || amount > balance_) return false;
        balance_ -= amount;
        return true;
    }
    int balance() const { return balance_; }

private:
    int balance_ = 0;
};

int main() {
    Account acc;
    acc.deposit(100);
    std::cout << acc.withdraw(30) << " " << acc.balance() << "\n";
    std::cout << acc.withdraw(500) << " " << acc.balance() << "\n";
    return 0;
}
`,
  "cpp-ctor-tracer": raw`#include <iostream>
#include <string>

class Tracer {
public:
    Tracer(const std::string& name) : name_(name) {
        std::cout << "create " << name_ << "\n";
    }
    ~Tracer() {
        std::cout << "destroy " << name_ << "\n";
    }

private:
    std::string name_;
};

int main() {
    {
        Tracer a("A");
        Tracer b("B");
        std::cout << "in scope\n";
    }
    std::cout << "end\n";
    return 0;
}
`,
  "cpp-const-refs": raw`#include <iostream>
#include <vector>

void addBonus(int& score, int bonus) {
    score += bonus;
}

int sum(const std::vector<int>& v) {
    int total = 0;
    for (int x : v) total += x;
    return total;
}

int main() {
    int score = 10;
    addBonus(score, 5);
    std::cout << "score " << score << "\n";
    const std::vector<int> prices{10, 20, 30};
    std::cout << "sum " << sum(prices) << "\n";
    return 0;
}
`,
  "cpp-pointers-references": raw`#include <iostream>

void swapValues(int* a, int* b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

void increment(int* p) {
    ++*p;
}

bool setIfValid(int* p, int value) {
    if (p == nullptr) return false;
    *p = value;
    return true;
}

int main() {
    int a = 1, b = 2;
    swapValues(&a, &b);
    std::cout << a << " " << b << "\n";

    int x = 10;
    increment(&x);
    increment(&x);
    std::cout << x << "\n";

    std::cout << setIfValid(nullptr, 5) << "\n";
    std::cout << setIfValid(&x, 7) << "\n";
    std::cout << x << "\n";
    return 0;
}
`,
  "cpp-new-delete-squares": raw`#include <iostream>

int* makeSquares(int n) {
    int* a = new int[n];
    for (int i = 0; i < n; ++i) a[i] = i * i;
    return a;
}

int main() {
    const int n = 5;
    int* squares = makeSquares(n);
    for (int i = 0; i < n; ++i) {
        std::cout << squares[i] << (i + 1 < n ? " " : "\n");
    }
    delete[] squares;

    int* single = new int(42);
    std::cout << *single << "\n";
    delete single;
    return 0;
}
`,
};
