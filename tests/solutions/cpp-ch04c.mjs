// Еталонні рішення завдань C++, глава 04 (частина c, уроки 45–48). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_04c = {
  "cpp-friend-mutable-sensor": raw`#include <iostream>

class Sensor {
public:
    explicit Sensor(int raw) : raw_(raw) {}

    int read() const {
        ++reads_;
        return raw_;
    }

    friend void report(const Sensor& s);

private:
    int raw_;
    mutable int reads_ = 0;
};

void report(const Sensor& s) {
    std::cout << "raw=" << s.raw_ << " reads=" << s.reads_ << "\n";
}

int main() {
    Sensor s(21);
    s.read();
    s.read();
    report(s);
    return 0;
}
`,
  "cpp-layout-static-assert": raw`#include <iostream>

struct Bad {
    char a;
    double b;
    char c;
    int d;
};

struct Good {
    double b;
    int d;
    char a;
    char c;
};

struct alignas(16) Aligned {
    int x;
};

int main() {
    std::cout << std::boolalpha;
    std::cout << "Good менша за Bad: " << (sizeof(Good) < sizeof(Bad)) << "\n";
    std::cout << "Aligned по 16: " << (alignof(Aligned) == 16) << "\n";
    std::cout << "sizeof(char): " << sizeof(char) << "\n";
    return 0;
}
`,
  "cpp-placement-new": raw`#include <iostream>
#include <new>

class Noisy {
public:
    explicit Noisy(int id) : id_(id) { std::cout << "create " << id_ << "\n"; }
    ~Noisy() { std::cout << "destroy " << id_ << "\n"; }
    void hello() const { std::cout << "hello " << id_ << "\n"; }

private:
    int id_;
};

int main() {
    alignas(Noisy) unsigned char buf[sizeof(Noisy)];

    Noisy* a = new (buf) Noisy(1);
    a->hello();
    a->~Noisy();

    Noisy* b = new (buf) Noisy(2);
    b->hello();
    b->~Noisy();

    std::cout << "кінець\n";
    return 0;
}
`,
  "cpp-rule-of-zero": raw`#include <iostream>
#include <type_traits>
#include <vector>

class Buffer {
public:
    explicit Buffer(int n) : data_(static_cast<std::size_t>(n), 0) {}

    void set(int i, int v) { data_[static_cast<std::size_t>(i)] = v; }
    int get(int i) const { return data_[static_cast<std::size_t>(i)]; }

private:
    std::vector<int> data_;
};

int main() {
    Buffer a(3);
    a.set(0, 10);
    Buffer b = a;
    b.set(0, 99);
    std::cout << a.get(0) << " " << b.get(0) << "\n";
    std::cout << "move noexcept: " << std::boolalpha << std::is_nothrow_move_constructible_v<Buffer> << "\n";
    return 0;
}
`,
};
