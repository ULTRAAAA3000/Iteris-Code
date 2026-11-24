// Еталонні рішення завдань C++, глава 12 «Проєкти», друга частина (уроки 109–110). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_12b = {
  "cpp-lru-cache": raw`#include <cstddef>
#include <iostream>
#include <list>
#include <string>
#include <unordered_map>
#include <utility>

template <typename K, typename V>
class LruCache {
public:
    explicit LruCache(std::size_t capacity) : cap_(capacity) {}

    V* get(const K& key) {
        auto it = index_.find(key);
        if (it == index_.end()) {
            ++misses_;
            return nullptr;
        }
        ++hits_;
        items_.splice(items_.begin(), items_, it->second);
        return &it->second->second;
    }

    void put(const K& key, V value) {
        auto it = index_.find(key);
        if (it != index_.end()) {
            it->second->second = std::move(value);
            items_.splice(items_.begin(), items_, it->second);
            return;
        }
        if (cap_ == 0) return;
        if (items_.size() == cap_) {
            index_.erase(items_.back().first);
            items_.pop_back();
        }
        items_.emplace_front(key, std::move(value));
        index_[key] = items_.begin();
    }

    std::string keys() const {
        std::string out;
        for (const auto& kv : items_) {
            if (!out.empty()) out += " ";
            out += std::to_string(kv.first);
        }
        return out;
    }
    std::size_t hits() const { return hits_; }
    std::size_t misses() const { return misses_; }

private:
    using Item = std::pair<K, V>;
    std::size_t cap_;
    std::size_t hits_ = 0;
    std::size_t misses_ = 0;
    std::list<Item> items_;
    std::unordered_map<K, typename std::list<Item>::iterator> index_;
};

static void show(LruCache<int, int>& c, int key) {
    int* v = c.get(key);
    std::cout << "get " << key << ": ";
    if (v) std::cout << *v; else std::cout << "немає";
    std::cout << "\n";
}

int main() {
    LruCache<int, int> cache(2);
    cache.put(1, 10);
    cache.put(2, 20);
    show(cache, 1);
    cache.put(3, 30);
    show(cache, 2);
    show(cache, 3);
    cache.put(1, 11);
    show(cache, 1);
    std::cout << "ключі: " << cache.keys() << "\n";
    std::cout << "влучань: " << cache.hits() << ", промахів: " << cache.misses() << "\n";
    return 0;
}
`,
  "cpp-rate-limiter": raw`#include <deque>
#include <iostream>
#include <map>
#include <stdexcept>
#include <string>

class RateLimiter {
public:
    RateLimiter(std::size_t limit, long window) : limit_(limit), window_(window) {}

    bool allow(const std::string& client, long now) {
        if (now < last_now_) {
            throw std::invalid_argument("час назад");
        }
        last_now_ = now;
        auto& q = hits_[client];
        while (!q.empty() && now - q.front() >= window_) {
            q.pop_front();
        }
        if (q.size() >= limit_) {
            return false;
        }
        q.push_back(now);
        return true;
    }

private:
    std::size_t limit_;
    long window_;
    long last_now_ = 0;
    std::map<std::string, std::deque<long>> hits_;
};

int main() {
    RateLimiter rl(3, 5);
    struct Req { const char* who; long t; };
    const Req reqs[] = {{"a", 0}, {"a", 1}, {"a", 2}, {"a", 3}, {"b", 3},
                        {"a", 5}, {"a", 6}, {"a", 7}, {"a", 8}};
    int ok = 0, denied = 0;
    for (const Req& r : reqs) {
        bool res = rl.allow(r.who, r.t);
        std::cout << r.who << "@" << r.t << ": " << (res ? "так" : "ні") << "\n";
        if (res) ++ok; else ++denied;
    }
    std::cout << "дозволено: " << ok << ", відхилено: " << denied << "\n";
    try {
        rl.allow("a", 2);
    } catch (const std::invalid_argument& e) {
        std::cout << "помилка: " << e.what() << "\n";
    }
    return 0;
}
`,
};
