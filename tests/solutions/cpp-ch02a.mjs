const raw = String.raw;

export const SOLUTIONS_02a = {
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
  "cpp-init-const": raw`#include <iostream>

int main() {
    const int qty{4};
    const double price{25.5};
    auto total = price * qty;
    std::cout << "Кількість: " << qty << "\n";
    std::cout << "Сума: " << total << "\n";
    return 0;
}
`,
  "cpp-int-overflow": raw`#include <iostream>

int main() {
    long long sum = 0;
    for (int i = 1; i <= 100000; ++i) {
        sum += i;
    }
    std::cout << sum << "\n";
    std::cout << 17 / 5 << " " << 17 % 5 << "\n";
    return 0;
}
`,
  "cpp-string-basics": raw`#include <iostream>
#include <string>

int main() {
    std::string full = "Taras Petrenko";
    std::size_t space = full.find(' ');
    std::cout << "Name: " << full.substr(0, space) << "\n";
    std::cout << "Surname: " << full.substr(space + 1) << "\n";
    std::cout << "Length: " << full.size() << "\n";
    return 0;
}
`,
  "cpp-stream-sum": raw`#include <iomanip>
#include <iostream>
#include <sstream>

int main() {
    std::istringstream in("3 4 5 6");
    int value = 0;
    int count = 0;
    int sum = 0;
    while (in >> value) {
        ++count;
        sum += value;
    }
    std::cout << "Count: " << count << "\n";
    std::cout << "Sum: " << sum << "\n";
    std::cout << "Average: " << std::fixed << std::setprecision(2)
              << static_cast<double>(sum) / count << "\n";
    return 0;
}
`,
  "cpp-convert-parse": raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream in("12 abc 7 x9 30");
    std::string word;
    int valid = 0;
    int bad = 0;
    int sum = 0;
    while (in >> word) {
        try {
            sum += std::stoi(word);
            ++valid;
        } catch (const std::exception&) {
            ++bad;
        }
    }
    std::cout << "Valid: " << valid << "\n";
    std::cout << "Bad: " << bad << "\n";
    std::cout << "Sum: " << sum << "\n";
    return 0;
}
`,
  "cpp-conditions-switch": raw`#include <iostream>
#include <string>

int main() {
    int temps[] = {-5, 12, 25, 38};
    for (int t : temps) {
        std::string label;
        if (t < 0) {
            label = "freezing";
        } else if (t < 15) {
            label = "cool";
        } else if (t < 30) {
            label = "warm";
        } else {
            label = "hot";
        }
        std::cout << t << ": " << label << "\n";
    }
    std::string signals = "RGYX";
    for (char s : signals) {
        std::string action;
        switch (s) {
            case 'R':
                action = "stop";
                break;
            case 'G':
                action = "go";
                break;
            case 'Y':
                action = "wait";
                break;
            default:
                action = "unknown";
                break;
        }
        std::cout << s << ": " << action << "\n";
    }
    return 0;
}
`,
};
