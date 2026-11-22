// Еталонні рішення завдань C++, глава 06 (уроки 62–67). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_06 = {
  "cpp-try-catch-divide": raw`#include <iostream>
#include <stdexcept>

int divide(int a, int b) {
    if (b == 0) throw std::runtime_error("division by zero");
    return a / b;
}

int main() {
    int pairs[3][2] = {{10, 2}, {7, 0}, {9, 3}};
    for (auto& p : pairs) {
        try {
            std::cout << divide(p[0], p[1]) << "\n";
        } catch (const std::runtime_error& e) {
            std::cout << "error: " << e.what() << "\n";
        }
    }
    return 0;
}
`,
  "cpp-custom-exception": raw`#include <iostream>
#include <stdexcept>
#include <string>

class ValidationError : public std::runtime_error {
public:
    ValidationError(const std::string& field, const std::string& msg)
        : std::runtime_error(msg), field_(field) {}
    std::string field() const { return field_; }

private:
    std::string field_;
};

void validateAge(int age) {
    if (age < 0) throw ValidationError("age", "must be >= 0");
    if (age > 150) throw ValidationError("age", "must be <= 150");
    std::cout << "ok " << age << "\n";
}

int main() {
    for (int age : {30, -5, 200}) {
        try {
            validateAge(age);
        } catch (const ValidationError& e) {
            std::cout << "field=" << e.field() << " msg=" << e.what() << "\n";
        }
    }
    return 0;
}
`,
  "cpp-scope-guard": raw`#include <functional>
#include <iostream>
#include <stdexcept>
#include <vector>

class ScopeGuard {
public:
    explicit ScopeGuard(std::function<void()> undo) : undo_(std::move(undo)) {}
    ~ScopeGuard() {
        if (active_) undo_();
    }
    void dismiss() { active_ = false; }
    ScopeGuard(const ScopeGuard&) = delete;
    ScopeGuard& operator=(const ScopeGuard&) = delete;

private:
    std::function<void()> undo_;
    bool active_ = true;
};

void addAll(std::vector<int>& v, int count, int failAt) {
    ScopeGuard rollback([&v, size = v.size()] { v.resize(size); });
    for (int i = 0; i < count; ++i) {
        if (i == failAt) throw std::runtime_error("failure");
        v.push_back(i);
    }
    rollback.dismiss();
}

int main() {
    std::vector<int> v{100};
    try {
        addAll(v, 3, 2);
    } catch (const std::exception&) {
    }
    std::cout << "size after failure: " << v.size() << "\n";
    addAll(v, 3, -1);
    std::cout << "size after success: " << v.size() << "\n";
    return 0;
}
`,
  "cpp-parse-strategy": raw`#include <cassert>
#include <cctype>
#include <iostream>
#include <optional>
#include <string>
#include <vector>

std::optional<int> parsePercent(const std::string& s) {
    if (s.empty()) return std::nullopt;
    int value = 0;
    for (char c : s) {
        if (!std::isdigit(static_cast<unsigned char>(c))) return std::nullopt;
        value = value * 10 + (c - '0');
        if (value > 100) return std::nullopt;
    }
    return value;
}

int average(const std::vector<int>& v) {
    assert(!v.empty());
    int sum = 0;
    for (int x : v) sum += x;
    return sum / static_cast<int>(v.size());
}

int main() {
    for (std::string s : {"42", "abc", "", "101", "100"}) {
        auto p = parsePercent(s);
        std::cout << "'" << s << "' -> ";
        if (p) std::cout << *p << "\n";
        else std::cout << "invalid\n";
    }
    std::cout << "average: " << average({2, 3, 4}) << "\n";
    return 0;
}
`,
  "cpp-noexcept-move": raw`#include <iostream>
#include <string>
#include <vector>

static int copies = 0;
static int moves = 0;

struct Item {
    Item() = default;
    Item(const Item&) { ++copies; }
    Item(Item&&) noexcept { ++moves; }
};

int toInt(const std::string& s) noexcept {
    try {
        return std::stoi(s);
    } catch (...) {
        return -1;
    }
}

int main() {
    std::vector<Item> v;
    v.reserve(2);
    v.emplace_back();
    v.emplace_back();
    v.emplace_back();
    std::cout << "copies: " << copies << "\n";
    std::cout << "moves: " << moves << "\n";
    std::cout << "toInt(12)=" << toInt("12") << "\n";
    std::cout << "toInt(zz)=" << toInt("zz") << "\n";
    return 0;
}
`,
  "cpp-result-variant": raw`#include <iostream>
#include <string>
#include <variant>

struct Error {
    std::string message;
};

template <class T>
using Result = std::variant<T, Error>;

template <class T, class F>
auto andThen(const Result<T>& r, F step) -> decltype(step(std::get<T>(r))) {
    if (std::holds_alternative<Error>(r)) return std::get<Error>(r);
    return step(std::get<T>(r));
}

Result<int> parse(const std::string& s) {
    if (s.empty()) return Error{"not a number: " + s};
    int value = 0;
    for (char c : s) {
        if (c < '0' || c > '9') return Error{"not a number: " + s};
        value = value * 10 + (c - '0');
    }
    return value;
}

Result<int> halve(int v) {
    if (v % 2 != 0) return Error{"odd: " + std::to_string(v)};
    return v / 2;
}

int main() {
    for (std::string s : {"8", "7", "x"}) {
        Result<int> r = andThen(parse(s), halve);
        std::cout << s << " -> ";
        if (std::holds_alternative<Error>(r)) std::cout << std::get<Error>(r).message << "\n";
        else std::cout << std::get<int>(r) << "\n";
    }
    return 0;
}
`,
};
