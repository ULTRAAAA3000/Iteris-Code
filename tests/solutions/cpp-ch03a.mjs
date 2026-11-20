// Еталонні рішення завдань C++, глава 03, частина a (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_03a = {
  "cpp-array-stats": raw`#include <array>
#include <iostream>

using Arr = std::array<int, 6>;

int sum(const Arr& a) {
    int total = 0;
    for (int x : a) total += x;
    return total;
}

int maxOf(const Arr& a) {
    int best = a[0];
    for (int x : a) {
        if (x > best) best = x;
    }
    return best;
}

int main() {
    Arr a = {4, 8, 15, 16, 23, 42};
    std::cout << "Розмір: " << a.size() << "\n";
    std::cout << "Сума: " << sum(a) << "\n";
    std::cout << "Максимум: " << maxOf(a) << "\n";
    std::cout << "Зворотний:";
    for (std::size_t i = a.size(); i > 0; --i) std::cout << " " << a[i - 1];
    std::cout << "\n";
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
  "cpp-vector-edit": raw`#include <iostream>
#include <string>
#include <vector>

void show(const std::string& label, const std::vector<int>& v) {
    std::cout << label << ":";
    for (int x : v) std::cout << " " << x;
    std::cout << "\n";
}

int main() {
    std::vector<int> v = {3, -1, 4, -1, 5, -9, 2, 6};
    for (std::size_t i = 0; i < v.size();) {
        if (v[i] < 0) v.erase(v.begin() + i);
        else ++i;
    }
    show("Без від'ємних", v);
    v.insert(v.begin(), 0);
    show("З нулем", v);
    v.pop_back();
    show("Без останнього", v);
    std::cout << "Розмір: " << v.size() << "\n";
    return 0;
}
`,
  "cpp-map-stock": raw`#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> stock = {{"apple", 5}, {"pear", 2}};
    stock["plum"] = 7;
    stock["pear"] += 3;
    for (const auto& [name, qty] : stock) std::cout << name << ": " << qty << "\n";
    if (stock.find("kiwi") == stock.end()) std::cout << "kiwi: none\n";
    std::cout << "records: " << stock.size() << "\n";
    return 0;
}
`,
  "cpp-set-unique": raw`#include <iostream>
#include <set>
#include <vector>

int main() {
    std::vector<int> data = {5, 3, 5, 1, 3, 9, 1, 5};
    std::set<int> unique(data.begin(), data.end());
    std::cout << "Унікальні:";
    for (int x : unique) std::cout << " " << x;
    std::cout << "\n";
    std::cout << "Кількість: " << unique.size() << "\n";
    std::cout << "Є 9: " << (unique.count(9) ? "так" : "ні") << "\n";
    std::cout << "Є 7: " << (unique.count(7) ? "так" : "ні") << "\n";
    std::multiset<int> all(data.begin(), data.end());
    std::cout << "П'ятірок: " << all.count(5) << "\n";
    return 0;
}
`,
  "cpp-unordered-count": raw`#include <iostream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

int main() {
    std::vector<std::string> words = {"red", "blue", "red", "green", "blue", "red"};
    std::unordered_map<std::string, int> count;
    std::unordered_set<std::string> seen;
    std::string firstRepeat;
    for (const auto& w : words) {
        ++count[w];
        if (seen.count(w) && firstRepeat.empty()) firstRepeat = w;
        seen.insert(w);
    }
    for (const std::string key : {"red", "blue", "green", "black"}) {
        auto it = count.find(key);
        std::cout << key << ": " << (it == count.end() ? 0 : it->second) << "\n";
    }
    std::cout << "Різних: " << count.size() << "\n";
    std::cout << "Перший повтор: " << firstRepeat << "\n";
    return 0;
}
`,
  "cpp-stack-brackets": raw`#include <iostream>
#include <stack>
#include <string>
#include <vector>

bool balanced(const std::string& s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (st.empty()) return false;
            char open = st.top();
            st.pop();
            if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{')) return false;
        }
    }
    return st.empty();
}

int main() {
    std::vector<std::string> tests = {"(a[b]{c})", "(]", "((", "", "())"};
    for (const auto& t : tests) std::cout << (balanced(t) ? "ok" : "bad") << "\n";
    return 0;
}
`,
};
