// Еталонні рішення завдань C++, глава 05 (частина b, уроки 55–61). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_05b = {
  "cpp-optional-find": raw`#include <iostream>
#include <optional>
#include <vector>

std::optional<int> find_first_even(const std::vector<int>& v) {
    for (int x : v) {
        if (x % 2 == 0) return x;
    }
    return std::nullopt;
}

void show(const std::vector<int>& v) {
    auto r = find_first_even(v);
    if (r) {
        std::cout << "first even: " << *r << "\n";
    } else {
        std::cout << "first even: none\n";
    }
}

int main() {
    show({3, 5, 8, 10});
    show({1, 3});
    return 0;
}
`,
  "cpp-variant-visit": raw`#include <iostream>
#include <string>
#include <variant>

struct Describe {
    std::string operator()(int n) const { return "int " + std::to_string(n); }
    std::string operator()(double d) const { return "double " + std::to_string(d); }
    std::string operator()(const std::string& s) const {
        return "string " + s + " (" + std::to_string(s.size()) + ")";
    }
};

int main() {
    std::variant<int, double, std::string> items[] = {7, 2.5, std::string("abc")};
    for (const auto& it : items) {
        std::cout << std::visit(Describe{}, it) << "\n";
    }
    return 0;
}
`,
  "cpp-virtual-diamond": raw`#include <iostream>

int animals = 0;

struct Animal {
    Animal() { ++animals; }
};

struct Flyer : virtual Animal {
    void fly() const { std::cout << "fly\n"; }
};

struct Swimmer : virtual Animal {
    void swim() const { std::cout << "swim\n"; }
};

struct Duck : Flyer, Swimmer {};

int main() {
    Duck d;
    d.fly();
    d.swim();
    std::cout << "animals: " << animals << "\n";
    return 0;
}
`,
  "cpp-if-constexpr": raw`#include <iostream>
#include <string>
#include <type_traits>

template <class T>
std::string to_text(const T& x) {
    if constexpr (std::is_integral_v<T>) {
        return "int:" + std::to_string(x);
    } else if constexpr (std::is_floating_point_v<T>) {
        return "float:" + std::to_string(x);
    } else if constexpr (std::is_same_v<T, std::string>) {
        return "str:" + x;
    } else {
        return "?";
    }
}

int main() {
    std::cout << to_text(42) << "\n";
    std::cout << to_text(std::string("hi")) << "\n";
    std::cout << to_text(2.5) << "\n";
    return 0;
}
`,
  "cpp-fold-expr": raw`#include <iostream>

template <class... Ts>
auto sum_all(Ts... xs) {
    return (xs + ... + 0);
}

template <class... Ts>
bool all_positive(Ts... xs) {
    return ((xs > 0) && ...);
}

template <class... Ts>
void join(const Ts&... xs) {
    bool first = true;
    ((std::cout << (first ? "" : ", ") << xs, first = false), ...);
    std::cout << "\n";
}

int main() {
    std::cout << "sum: " << sum_all(1, 2, 3, 4, 5) << "\n";
    std::cout << "sum empty: " << sum_all() << "\n";
    std::cout << "all positive: " << all_positive(1, 2, 3) << "\n";
    std::cout << "all positive: " << all_positive(1, -2, 3) << "\n";
    std::cout << "list: ";
    join("a", 2, 3.5);
    return 0;
}
`,
  "cpp-crtp-counter": raw`#include <iostream>

template <class T>
struct Counted {
    static inline int count = 0;
    Counted() { ++count; }
    Counted(const Counted&) { ++count; }
    ~Counted() { --count; }
};

struct Apple : Counted<Apple> {};
struct Pear : Counted<Pear> {};

int main() {
    Apple a1, a2;
    Pear p1;
    (void)a1;
    (void)a2;
    (void)p1;
    {
        Apple a3 = a1;
        (void)a3;
        std::cout << "apples inside: " << Counted<Apple>::count << "\n";
    }
    std::cout << "apples: " << Counted<Apple>::count << " pears: " << Counted<Pear>::count << "\n";
    return 0;
}
`,
  "cpp-concept-analog": raw`#include <iostream>
#include <string>
#include <type_traits>
#include <utility>
#include <vector>

template <class T, class = void>
struct has_size : std::false_type {};

template <class T>
struct has_size<T, std::void_t<decltype(std::declval<const T&>().size())>> : std::true_type {};

template <class T>
std::size_t count_of(const T& c) {
    if constexpr (has_size<T>::value) {
        return c.size();
    } else {
        return 0;
    }
}

int main() {
    static_assert(has_size<std::string>::value, "у рядка є size()");
    static_assert(!has_size<int>::value, "в int немає size()");
    std::cout << "string: " << count_of(std::string("hello")) << "\n";
    std::cout << "vector: " << count_of(std::vector<int>{1, 2, 3}) << "\n";
    std::cout << "int has size: " << has_size<int>::value << "\n";
    return 0;
}
`,
};
