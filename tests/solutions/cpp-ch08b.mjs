// Еталонні рішення завдань C++, глава 08 (частина b, уроки 85–89). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_08b = {
  "cpp-regex-dates": raw`#include <iostream>
#include <regex>
#include <string>

int main() {
    std::string text = "start 2026-11-22, end 2027-01-05, bad 2026-1-5, last 1999-12-31";
    std::regex date(R"((\d{4})-(\d{2})-(\d{2}))");
    for (std::sregex_iterator it(text.begin(), text.end(), date), end; it != end; ++it) {
        std::cout << it->str(3) << "." << it->str(2) << "." << it->str(1) << "\n";
    }
    std::cout << std::regex_replace(text, date, "<$1>") << "\n";
    return 0;
}
`,

  "cpp-bitset-perms": raw`#include <bitset>
#include <iostream>

const unsigned READ = 1u << 0;
const unsigned WRITE = 1u << 1;
const unsigned EXEC = 1u << 2;

unsigned grant(unsigned perms, unsigned mask) { return perms | mask; }
unsigned revoke(unsigned perms, unsigned mask) { return perms & ~mask; }
unsigned toggle(unsigned perms, unsigned mask) { return perms ^ mask; }
bool has(unsigned perms, unsigned mask) { return (perms & mask) != 0; }

int main() {
    unsigned perms = 0;
    perms = grant(perms, READ | WRITE);
    std::cout << std::bitset<3>(perms) << "\n";
    perms = revoke(perms, WRITE);
    perms = toggle(perms, EXEC);
    std::cout << std::bitset<3>(perms) << "\n";
    std::cout << "exec: " << (has(perms, EXEC) ? "yes" : "no") << "\n";
    std::cout << "write: " << (has(perms, WRITE) ? "yes" : "no") << "\n";
    std::cout << "set: " << std::bitset<3>(perms).count() << "\n";
    return 0;
}
`,

  "cpp-ranges-squares": raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v(20);
    std::iota(v.begin(), v.end(), 1);

    std::vector<int> even;
    std::copy_if(v.begin(), v.end(), std::back_inserter(even), [](int x) { return x % 2 == 0; });

    std::vector<int> squares(even.size());
    std::transform(even.begin(), even.end(), squares.begin(), [](int x) { return x * x; });
    squares.resize(3);

    for (std::size_t i = 0; i < squares.size(); ++i) {
        if (i > 0) {
            std::cout << " ";
        }
        std::cout << squares[i];
    }
    std::cout << "\n";
    std::cout << "sum: " << std::accumulate(squares.begin(), squares.end(), 0) << "\n";
    return 0;
}
`,

  "cpp-format-table": raw`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

std::string row(const std::string& name, double price) {
    std::ostringstream out;
    out << std::left << std::setw(8) << name
        << std::right << std::setw(8) << std::fixed << std::setprecision(2) << price;
    return out.str();
}

int main() {
    std::cout << "[" << row("tea", 3.5) << "]\n";
    std::cout << "[" << row("cake", 12.5) << "]\n";
    std::cout << "[" << row("total", 1234.75) << "]\n";
    return 0;
}
`,

  "cpp-utf8-bytes": raw`#include <iomanip>
#include <iostream>
#include <string>

std::size_t countCodePoints(const std::string& s) {
    std::size_t n = 0;
    for (unsigned char c : s) {
        if ((c & 0xC0) != 0x80) {
            ++n;
        }
    }
    return n;
}

void report(const std::string& s) {
    std::cout << "bytes=" << s.size() << " chars=" << countCodePoints(s) << " hex:";
    for (unsigned char c : s) {
        std::cout << " " << std::hex << std::uppercase << std::setw(2) << std::setfill('0')
                  << static_cast<int>(c);
    }
    std::cout << std::dec << "\n";
}

int main() {
    report("abc");
    report("Їжак");
    report("a-Ї");
    return 0;
}
`,

};
