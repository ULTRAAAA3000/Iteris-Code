// Еталонні рішення завдань C++, глава 11 (уроки 101–105). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_11 = {
  "cpp-odr-header": raw`#include <iostream>

// ===== "заголовок" =====
int clamp(int v);  // оголошення

inline constexpr int kMax = 10;

inline int twice(int x) { return x * 2; }

// ===== main =====
namespace {
int bonus() { return 3; }
}  // namespace

int main() {
    std::cout << clamp(5) << " " << clamp(50) << " " << clamp(-3) << "\n";
    std::cout << twice(clamp(7)) << "\n";
    std::cout << kMax << " " << bonus() << "\n";
    return 0;
}

// ===== "cpp" =====
int clamp(int v) {
    if (v < 0) return 0;
    if (v > kMax) return kMax;
    return v;
}
`,
  "cpp-layers-notes": raw`#include <iostream>
#include <map>
#include <optional>
#include <sstream>
#include <stdexcept>
#include <string>

namespace repository {
class NoteRepository {
public:
    int add(const std::string& text) {
        items_[next_] = text;
        return next_++;
    }
    std::optional<std::string> find(int id) const {
        auto it = items_.find(id);
        if (it == items_.end()) return std::nullopt;
        return it->second;
    }
    std::size_t count() const { return items_.size(); }

private:
    std::map<int, std::string> items_;
    int next_ = 1;
};
}  // namespace repository

namespace service {
class NoteService {
public:
    explicit NoteService(repository::NoteRepository& repo) : repo_(repo) {}
    int create(const std::string& text) {
        if (text.empty()) throw std::invalid_argument("empty");
        return repo_.add(text);
    }
    std::optional<std::string> get(int id) const { return repo_.find(id); }
    std::size_t count() const { return repo_.count(); }

private:
    repository::NoteRepository& repo_;
};
}  // namespace service

namespace handler {
std::string handle(service::NoteService& svc, const std::string& request) {
    std::istringstream in(request);
    std::string method;
    in >> method;
    if (method == "ADD") {
        std::string text;
        std::getline(in >> std::ws, text);
        try {
            return "201 id=" + std::to_string(svc.create(text));
        } catch (const std::invalid_argument&) {
            return "400 empty";
        }
    }
    if (method == "GET") {
        int id = 0;
        in >> id;
        auto note = svc.get(id);
        if (!note) return "404 not found";
        return "200 " + *note;
    }
    return "405 unknown";
}
}  // namespace handler

int main() {
    repository::NoteRepository repo;
    service::NoteService svc(repo);
    const char* requests[] = {"ADD buy milk", "ADD", "GET 1", "GET 5", "PING"};
    for (const char* r : requests) {
        std::cout << r << " -> " << handler::handle(svc, r) << "\n";
    }
    std::cout << "всього: " << svc.count() << "\n";
    return 0;
}
`,
  "cpp-di-notifier": raw`#include <iostream>
#include <string>
#include <vector>

class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void send(const std::string& msg) = 0;
};

class ConsoleNotifier : public Notifier {
public:
    void send(const std::string& msg) override { std::cout << "[консоль] " << msg << "\n"; }
};

class FakeNotifier : public Notifier {
public:
    void send(const std::string& msg) override { messages.push_back(msg); }
    std::vector<std::string> messages;
};

class SignupService {
public:
    explicit SignupService(Notifier& n) : notifier_(n) {}
    bool signup(const std::string& user) {
        if (user.empty()) return false;
        notifier_.send("вітаємо, " + user);
        return true;
    }

private:
    Notifier& notifier_;
};

int main() {
    ConsoleNotifier console;
    SignupService real(console);
    real.signup("Ада");

    FakeNotifier fake;
    SignupService tested(fake);
    tested.signup("Ада");
    tested.signup("");
    tested.signup("Грейс");

    std::cout << "надіслано: " << fake.messages.size() << "\n";
    for (const auto& m : fake.messages) std::cout << "- " << m << "\n";
    return 0;
}
`,
  "cpp-pimpl-counter": raw`#include <iostream>
#include <memory>

// ===== "counter.h" =====
class Counter {
public:
    Counter();
    Counter(const Counter& other);
    ~Counter();
    void add(int n);
    int total() const;
    int calls() const;

private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

// ===== "counter.cpp" =====
struct Counter::Impl {
    int total = 0;
    int calls = 0;
};

Counter::Counter() : impl_(std::make_unique<Impl>()) {}
Counter::Counter(const Counter& other) : impl_(std::make_unique<Impl>(*other.impl_)) {}
Counter::~Counter() = default;
void Counter::add(int n) {
    impl_->total += n;
    ++impl_->calls;
}
int Counter::total() const { return impl_->total; }
int Counter::calls() const { return impl_->calls; }

// ===== main =====
int main() {
    Counter a;
    a.add(5);
    a.add(7);
    Counter b = a;
    b.add(100);
    std::cout << a.total() << " " << a.calls() << "\n";
    std::cout << b.total() << " " << b.calls() << "\n";
    return 0;
}
`,
  "cpp-cmake-gen": raw`#include <iostream>
#include <sstream>
#include <string>
#include <vector>

std::string cmake(const std::string& name, const std::vector<std::string>& sources, int standard) {
    std::ostringstream out;
    out << "cmake_minimum_required(VERSION 3.16)\n";
    out << "project(" << name << " LANGUAGES CXX)\n";
    out << "add_executable(" << name;
    for (const auto& s : sources) out << " " << s;
    out << ")\n";
    out << "target_compile_features(" << name << " PRIVATE cxx_std_" << standard << ")";
    return out.str();
}

int main() {
    std::cout << cmake("notes", {"main.cpp", "service.cpp", "repo.cpp"}, 17) << "\n";
    std::cout << "---\n";
    std::cout << cmake("tool", {"tool.cpp"}, 20) << "\n";
    return 0;
}
`,
};
