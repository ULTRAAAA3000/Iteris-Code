// Еталонні рішення завдань C++, глава 04 (частина b, уроки 38–44). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_04b = {
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
  "cpp-unique-ptr-owner": raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

class Res {
public:
    explicit Res(std::string n) : name_(std::move(n)) { std::cout << "open " << name_ << "\n"; }
    ~Res() { std::cout << "close " << name_ << "\n"; }
    const std::string& name() const { return name_; }

private:
    std::string name_;
};

std::unique_ptr<Res> make(const std::string& n) {
    return std::make_unique<Res>(n);
}

int main() {
    auto a = make("A");
    std::unique_ptr<Res> b = std::move(a);
    std::cout << "a=" << (a ? a->name() : std::string("empty"))
              << " b=" << (b ? b->name() : std::string("empty")) << "\n";
    b.reset();
    std::cout << "end\n";
    return 0;
}
`,
  "cpp-shared-weak": raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

class Res {
public:
    explicit Res(std::string n) : name_(std::move(n)) { std::cout << "open " << name_ << "\n"; }
    ~Res() { std::cout << "close " << name_ << "\n"; }

private:
    std::string name_;
};

void report(const std::weak_ptr<Res>& w) {
    if (auto p = w.lock()) {
        std::cout << "alive\n";
    } else {
        std::cout << "gone\n";
    }
}

int main() {
    auto a = std::make_shared<Res>("S");
    std::weak_ptr<Res> w = a;
    std::shared_ptr<Res> b = a;
    std::cout << "count=" << a.use_count() << "\n";
    report(w);
    b.reset();
    a.reset();
    report(w);
    std::cout << "end\n";
    return 0;
}
`,
  "cpp-rule-of-three": raw`#include <iostream>

class Buffer {
public:
    explicit Buffer(int size) : size_(size), data_(new int[size]) {
        for (int i = 0; i < size_; ++i) data_[i] = i + 1;
    }
    ~Buffer() { delete[] data_; }

    Buffer(const Buffer& other) : size_(other.size_), data_(new int[other.size_]) {
        for (int i = 0; i < size_; ++i) data_[i] = other.data_[i];
    }
    Buffer& operator=(const Buffer& other) {
        if (this != &other) {
            int* fresh = new int[other.size_];
            for (int i = 0; i < other.size_; ++i) fresh[i] = other.data_[i];
            delete[] data_;
            data_ = fresh;
            size_ = other.size_;
        }
        return *this;
    }

    void set(int i, int v) { data_[i] = v; }
    int sum() const {
        int s = 0;
        for (int i = 0; i < size_; ++i) s += data_[i];
        return s;
    }

private:
    int size_;
    int* data_;
};

int main() {
    Buffer a(3);
    Buffer b = a;
    a.set(0, 100);
    Buffer c(1);
    c = a;
    a.set(1, 0);
    std::cout << "a=" << a.sum() << " b=" << b.sum() << " c=" << c.sum() << "\n";
    return 0;
}
`,
  "cpp-move-handle": raw`#include <iostream>
#include <utility>

class Handle {
public:
    explicit Handle(int v) : p_(new int(v)) {}
    ~Handle() { delete p_; }
    Handle(const Handle&) = delete;
    Handle& operator=(const Handle&) = delete;

    Handle(Handle&& other) noexcept : p_(other.p_) { other.p_ = nullptr; }
    Handle& operator=(Handle&& other) noexcept {
        if (this != &other) {
            delete p_;
            p_ = other.p_;
            other.p_ = nullptr;
        }
        return *this;
    }

    bool valid() const { return p_ != nullptr; }
    int value() const { return p_ ? *p_ : -1; }

private:
    int* p_;
};

int main() {
    Handle a(7);
    Handle b = std::move(a);
    std::cout << "a=" << a.valid() << " b=" << b.value() << "\n";
    Handle c(1);
    c = std::move(b);
    std::cout << "b=" << b.valid() << " c=" << c.value() << "\n";
    return 0;
}
`,
  "cpp-enum-static": raw`#include <initializer_list>
#include <iostream>

enum class Level { Low, Mid, High };

const char* toString(Level l) {
    switch (l) {
        case Level::Low: return "low";
        case Level::Mid: return "mid";
        case Level::High: return "high";
    }
    return "?";
}

class Counter {
public:
    Counter() {
        ++created;
    }
    static int total() { return created; }

private:
    inline static int created = 0;
};

int main() {
    for (Level l : {Level::Low, Level::Mid, Level::High}) {
        std::cout << toString(l) << "\n";
    }
    Counter a, b, c;
    std::cout << "created=" << Counter::total() << "\n";
    return 0;
}
`,
  "cpp-operators-vec2": raw`#include <iostream>

struct Vec2 {
    int x;
    int y;
};

Vec2 operator+(const Vec2& a, const Vec2& b) {
    return Vec2{a.x + b.x, a.y + b.y};
}

Vec2 operator*(const Vec2& a, int k) {
    return Vec2{a.x * k, a.y * k};
}

bool operator==(const Vec2& a, const Vec2& b) {
    return a.x == b.x && a.y == b.y;
}

std::ostream& operator<<(std::ostream& os, const Vec2& v) {
    return os << "(" << v.x << ", " << v.y << ")";
}

int main() {
    Vec2 a{1, 2};
    Vec2 b{3, 4};
    std::cout << a + b << "\n";
    std::cout << a * 3 << "\n";
    std::cout << std::boolalpha << (a + b == Vec2{4, 6}) << "\n";
    return 0;
}
`,
};
