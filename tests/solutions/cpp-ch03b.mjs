// Еталонні рішення завдань C++, глава 03, частина b (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_03b = {
  "cpp-pair-tuple": raw`#include <iostream>
#include <string>
#include <tuple>
#include <utility>
#include <vector>

std::pair<int, int> price_range(const std::vector<std::tuple<std::string, int, int>>& items) {
    int lo = std::get<2>(items[0]);
    int hi = lo;
    for (const auto& [name, qty, price] : items) {
        if (price < lo) lo = price;
        if (price > hi) hi = price;
    }
    return {lo, hi};
}

int main() {
    std::vector<std::tuple<std::string, int, int>> items = {
        {"tea", 3, 40}, {"coffee", 2, 55}, {"cake", 1, 120}};

    int total = 0;
    for (const auto& [name, qty, price] : items) {
        std::cout << name << ": " << qty << " x " << price << " = " << qty * price << "\n";
        total += qty * price;
    }
    std::cout << "Разом: " << total << "\n";

    auto [lo, hi] = price_range(items);
    std::cout << "Мін: " << lo << ", макс: " << hi << "\n";
    return 0;
}
`,
  "cpp-iterator-walk": raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <list>

int main() {
    std::list<int> nums = {5, 8, 12, 7, 3};

    for (auto it = nums.begin(); it != nums.end(); ++it) {
        if (it != nums.begin()) std::cout << " ";
        std::cout << *it;
    }
    std::cout << "\n";

    auto third = std::next(nums.begin(), 2);
    std::cout << "Третій: " << *third << "\n";

    auto found = std::find(nums.begin(), nums.end(), 7);
    if (found != nums.end()) {
        std::cout << "Позиція 7: " << std::distance(nums.begin(), found) << "\n";
    }

    int sum = 0;
    for (auto it = nums.begin(); it != nums.end(); ++it) sum += *it;
    std::cout << "Сума: " << sum << "\n";
    return 0;
}
`,
  "cpp-stl-algorithms": raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <numeric>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> words = {"banana", "kiwi", "apple", "fig", "cherry"};

    std::sort(words.begin(), words.end(), [](const std::string& a, const std::string& b) {
        if (a.size() != b.size()) return a.size() < b.size();
        return a < b;
    });
    for (std::size_t i = 0; i < words.size(); ++i) {
        if (i) std::cout << " ";
        std::cout << words[i];
    }
    std::cout << std::endl;

    int total = std::accumulate(words.begin(), words.end(), 0, [](int acc, const std::string& w) { return acc + (int)w.size(); });
    std::cout << "Всього літер: " << total << std::endl;

    auto longer = std::count_if(words.begin(), words.end(), [](const std::string& w) { return w.size() > 4; });
    std::cout << "Довгих слів: " << longer << std::endl;

    auto it = std::find(words.begin(), words.end(), "apple");
    if (it != words.end()) {
        std::cout << "apple на позиції " << std::distance(words.begin(), it) << std::endl;
    }

    std::vector<int> lens;
    std::transform(words.begin(), words.end(), std::back_inserter(lens), [](const std::string& w) { return (int)w.size(); });
    std::cout << "Довжини:";
    for (int n : lens) std::cout << " " << n;
    std::cout << std::endl;
    return 0;
}
`,
  "cpp-word-freq": raw`#include <algorithm>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

int main() {
    std::istringstream in("the cat and the dog and the bird");

    std::map<std::string, int> freq;
    std::string word;
    while (in >> word) {
        freq[word]++;
    }

    std::vector<std::pair<std::string, int>> items(freq.begin(), freq.end());
    std::sort(items.begin(), items.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });

    for (const auto& [w, n] : items) {
        std::cout << w << ": " << n << "\n";
    }
    return 0;
}
`,
  "cpp-erase-remove": raw`#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>

int main() {
    std::vector<int> v = {4, 7, 10, 3, 8, 5, 12};
    v.erase(std::remove_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; }), v.end());
    for (std::size_t i = 0; i < v.size(); ++i) {
        if (i) std::cout << " ";
        std::cout << v[i];
    }
    std::cout << "\n";

    std::map<std::string, int> stock = {{"apple", 0}, {"pear", 4}, {"plum", 0}, {"kiwi", 2}};
    for (auto it = stock.begin(); it != stock.end();) {
        if (it->second == 0) {
            it = stock.erase(it);
        } else {
            ++it;
        }
    }
    bool first = true;
    for (const auto& [name, qty] : stock) {
        if (!first) std::cout << " ";
        first = false;
        std::cout << name << ":" << qty;
    }
    std::cout << "\n";
    return 0;
}
`,
  "cpp-custom-compare": raw`#include <cstddef>
#include <functional>
#include <iostream>
#include <set>
#include <string>
#include <unordered_set>

struct Point {
    int x;
    int y;
};

struct ByXY {
    bool operator()(const Point& a, const Point& b) const {
        if (a.x != b.x) return a.x < b.x;
        return a.y < b.y;
    }
};

struct ByLen {
    bool operator()(const std::string& a, const std::string& b) const {
        return a.size() < b.size();
    }
};

struct PointHash {
    std::size_t operator()(const Point& p) const {
        return std::hash<int>()(p.x) * 31 + std::hash<int>()(p.y);
    }
};

struct PointEq {
    bool operator()(const Point& a, const Point& b) const {
        return a.x == b.x && a.y == b.y;
    }
};

int main() {
    std::set<Point, ByXY> pts = {{2, 3}, {1, 5}, {2, 1}, {1, 5}};
    std::cout << "Точок: " << pts.size() << "\n";
    bool first = true;
    for (const auto& p : pts) {
        if (!first) std::cout << " ";
        first = false;
        std::cout << "(" << p.x << "," << p.y << ")";
    }
    std::cout << "\n";

    std::set<std::string, ByLen> words = {"cat", "dog", "bird", "fish", "ox"};
    first = true;
    for (const auto& w : words) {
        if (!first) std::cout << " ";
        first = false;
        std::cout << w;
    }
    std::cout << "\n";

    std::unordered_set<Point, PointHash, PointEq> seen;
    seen.insert({2, 3});
    seen.insert({1, 5});
    seen.insert({2, 3});
    std::cout << "Унікальних: " << seen.size() << "\n";
    std::cout << "Є (1,5): " << seen.count({1, 5}) << "\n";
    return 0;
}
`,
  "cpp-algo-partition": raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

void print(const std::vector<int>& v) {
    for (std::size_t i = 0; i < v.size(); ++i) {
        if (i) std::cout << " ";
        std::cout << v[i];
    }
    std::cout << "\n";
}

int main() {
    std::vector<int> v = {5, 3, 5, 1, 3, 9, 1};
    std::sort(v.begin(), v.end());
    v.erase(std::unique(v.begin(), v.end()), v.end());
    print(v);

    auto pos = std::lower_bound(v.begin(), v.end(), 4);
    std::cout << "Позиція 4: " << std::distance(v.begin(), pos) << "\n";

    std::vector<int> mix = {1, 2, 3, 4, 5, 6};
    auto mid = std::partition(mix.begin(), mix.end(), [](int x) { return x % 2 == 0; });
    std::cout << "Парних: " << std::distance(mix.begin(), mid) << "\n";

    std::vector<int> r = {1, 2, 3, 4, 5};
    std::rotate(r.begin(), r.begin() + 2, r.end());
    print(r);
    return 0;
}
`,
};
