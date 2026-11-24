// Еталонні рішення завдань C++, глава 08 (частина a, уроки 79–84). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_08a = {
  "cpp-string-replace-all": raw`#include <iostream>
#include <string>

std::string replace_all(std::string s, const std::string& from, const std::string& to) {
    std::size_t pos = 0;
    while ((pos = s.find(from, pos)) != std::string::npos) {
        s.replace(pos, from.size(), to);
        pos += to.size();
    }
    return s;
}

int main() {
    std::string list = replace_all("red,green,blue", ",", ", ");
    std::cout << "list: " << list << "\n";

    std::string email = "user@example.org";
    std::string domain = email.substr(email.find('@') + 1);
    std::cout << "domain: " << domain << "\n";
    return 0;
}
`,
  "cpp-string-view-split": raw`#include <iostream>
#include <string_view>

std::string_view next_word(std::string_view& rest) {
    std::size_t pos = rest.find(' ');
    if (pos == std::string_view::npos) {
        std::string_view word = rest;
        rest = std::string_view();
        return word;
    }
    std::string_view word = rest.substr(0, pos);
    rest.remove_prefix(pos + 1);
    return word;
}

int main() {
    std::string_view text = "one two three";
    while (!text.empty()) {
        std::string_view w = next_word(text);
        std::cout << w << ":" << w.size() << "\n";
    }
    return 0;
}
`,
  "cpp-stringstream-parse": raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::string data = "ana 30\nbob 25\neve 41\n";
    std::istringstream in(data);
    std::string name;
    int age = 0;
    int sum = 0;
    while (in >> name >> age) {
        std::cout << name << "=" << age << "\n";
        sum += age;
    }
    std::ostringstream out;
    out << "sum=" << sum;
    std::cout << out.str() << "\n";
    return 0;
}
`,
  "cpp-chrono-total": raw`#include <chrono>
#include <iomanip>
#include <iostream>

int main() {
    using namespace std::chrono;
    using namespace std::chrono_literals;
    milliseconds total = 1h + 45min + 90s + 2500ms;

    seconds s = duration_cast<seconds>(total);
    hours h = duration_cast<hours>(s);
    minutes m = duration_cast<minutes>(s - h);
    seconds sec = s - h - m;

    std::cout << "ms: " << total.count() << "\n";
    std::cout << "s: " << s.count() << "\n";
    std::cout << "time: " << std::setfill('0') << std::setw(2) << h.count() << ":"
              << std::setw(2) << m.count() << ":" << std::setw(2) << sec.count() << "\n";
    return 0;
}
`,
  "cpp-random-seed": raw`#include <iostream>
#include <random>

int main() {
    std::mt19937 gen(42);
    for (int i = 0; i < 3; ++i) {
        std::cout << gen() << "\n";
    }

    std::mt19937 a(5);
    std::mt19937 b(5);
    bool same = true;
    for (int i = 0; i < 100; ++i) {
        if (a() != b()) {
            same = false;
        }
    }
    std::cout << "same: " << same << "\n";
    return 0;
}
`,
  "cpp-numeric-tools": raw`#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> a(5);
    std::iota(a.begin(), a.end(), 1);
    std::cout << "iota:";
    for (int x : a) {
        std::cout << " " << x;
    }
    std::cout << "\n";

    std::vector<int> v{12, 18, 30, 42};
    int total = std::accumulate(v.begin(), v.end(), 0);
    std::cout << "total: " << total << "\n";

    std::vector<int> prefix(v.size());
    std::partial_sum(v.begin(), v.end(), prefix.begin());
    std::cout << "prefix:";
    for (int x : prefix) {
        std::cout << " " << x;
    }
    std::cout << "\n";

    int g = std::accumulate(v.begin() + 1, v.end(), v[0], [](int x, int y) { return std::gcd(x, y); });
    std::cout << "gcd: " << g << "\n";
    return 0;
}
`,
};
