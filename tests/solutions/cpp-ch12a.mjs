const raw = String.raw;

export const SOLUTIONS_12a = {
  "cpp-project-text-stats": raw`#include <algorithm>
#include <cctype>
#include <iostream>
#include <map>
#include <string>
#include <utility>
#include <vector>

using Freq = std::map<std::string, int>;
using Entry = std::pair<std::string, int>;

std::vector<std::string> tokenize(const std::string& text) {
    std::vector<std::string> words;
    std::string cur;
    for (char ch : text) {
        unsigned char c = static_cast<unsigned char>(ch);
        if (std::isalpha(c)) {
            cur += static_cast<char>(std::tolower(c));
        } else if (!cur.empty()) {
            words.push_back(cur);
            cur.clear();
        }
    }
    if (!cur.empty()) words.push_back(cur);
    return words;
}

Freq countWords(const std::vector<std::string>& words) {
    Freq freq;
    for (const auto& w : words) ++freq[w];
    return freq;
}

std::vector<Entry> topN(const Freq& freq, std::size_t n) {
    std::vector<Entry> v(freq.begin(), freq.end());
    std::sort(v.begin(), v.end(), [](const Entry& a, const Entry& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    if (v.size() > n) v.resize(n);
    return v;
}

std::string longest(const std::vector<std::string>& words) {
    std::string best;
    for (const auto& w : words) {
        if (w.size() > best.size() || (w.size() == best.size() && w < best)) best = w;
    }
    return best;
}

int main() {
    const std::string text = "To be, or not to be: that is the question. Be brave, be kind.";
    auto words = tokenize(text);
    auto freq = countWords(words);
    std::cout << "words: " << words.size() << "\n";
    std::cout << "unique: " << freq.size() << "\n";
    std::cout << "longest: " << longest(words) << "\n";
    int place = 0;
    for (const auto& e : topN(freq, 3)) {
        std::cout << ++place << ". " << e.first << " " << e.second << "\n";
    }
    return 0;
}
`,
  "cpp-project-kv-api": raw`#include <iostream>
#include <map>
#include <sstream>
#include <string>

class Store {
public:
    bool set(const std::string& k, const std::string& v) {
        bool created = data_.find(k) == data_.end();
        data_[k] = v;
        return created;
    }
    const std::string* get(const std::string& k) const {
        auto it = data_.find(k);
        return it == data_.end() ? nullptr : &it->second;
    }
    bool remove(const std::string& k) { return data_.erase(k) > 0; }
    std::size_t size() const { return data_.size(); }
private:
    std::map<std::string, std::string> data_;
};

std::string handle(Store& s, const std::string& line) {
    std::istringstream in(line);
    std::string cmd, key, val;
    in >> cmd >> key;
    if (cmd == "SET" && !key.empty() && (in >> val)) {
        return s.set(key, val) ? "201 created" : "200 updated";
    }
    if (cmd == "GET" && !key.empty()) {
        const std::string* v = s.get(key);
        return v ? "200 " + *v : "404 not found";
    }
    if (cmd == "DEL" && !key.empty()) {
        return s.remove(key) ? "204 deleted" : "404 not found";
    }
    if (cmd == "COUNT") return "200 " + std::to_string(s.size());
    return "400 bad request";
}

int main() {
    Store store;
    const char* requests[] = {
        "SET a 1", "SET b 2", "SET a 3", "GET a", "GET z",
        "DEL b", "DEL b", "COUNT", "SET c", "PUT x y",
    };
    for (const char* r : requests) {
        std::cout << r << " -> " << handle(store, r) << "\n";
    }
    return 0;
}
`,
  "cpp-project-parallel-sums": raw`#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

int main() {
    const int N = 1000;
    const int WORKERS = 4;
    const int CHUNK = N / WORKERS;
    std::vector<long long> sums(WORKERS, 0);
    std::atomic<int> evens{0};
    std::vector<std::thread> pool;

    for (int w = 0; w < WORKERS; ++w) {
        pool.emplace_back([&sums, &evens, w, CHUNK] {
            long long sum = 0;
            int localEvens = 0;
            for (int k = w * CHUNK + 1; k <= (w + 1) * CHUNK; ++k) {
                sum += static_cast<long long>(k) * k;
                if (k % 2 == 0) ++localEvens;
            }
            sums[w] = sum;
            evens += localEvens;
        });
    }
    for (auto& t : pool) t.join();

    long long total = 0;
    for (int w = 0; w < WORKERS; ++w) {
        std::cout << "worker " << w << ": " << sums[w] << "\n";
        total += sums[w];
    }
    std::cout << "total: " << total << "\n";
    std::cout << "evens: " << evens.load() << "\n";
    return 0;
}
`,
};
