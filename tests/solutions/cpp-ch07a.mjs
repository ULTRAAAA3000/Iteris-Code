// Еталонні рішення завдань C++, глава 07 (частина a, уроки 68–73). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_07a = {
  "cpp-thread-join": raw`#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::vector<int> results(3, 0);
    std::vector<std::thread> workers;

    for (int i = 0; i < 3; ++i) {
        workers.emplace_back([&results, i] { results[i] = (i + 1) * (i + 1) * 10; });
    }
    for (auto& w : workers) {
        w.join();
    }

    for (int i = 0; i < 3; ++i) {
        std::cout << "потік " << i << ": " << results[i] << "\n";
    }
    return 0;
}
`,
  "cpp-thread-args": raw`#include <functional>
#include <iostream>
#include <numeric>
#include <thread>
#include <vector>

void sum_range(const std::vector<int>& v, int from, int to, long long& out) {
    long long s = 0;
    for (int i = from; i < to; ++i) {
        s += v[i];
    }
    out = s;
}

int main() {
    std::vector<int> data(100);
    std::iota(data.begin(), data.end(), 1);
    long long left = 0, right = 0;

    std::thread a(sum_range, std::cref(data), 0, 50, std::ref(left));
    std::thread b(sum_range, std::cref(data), 50, 100, std::ref(right));
    a.join();
    b.join();

    std::cout << "ліва: " << left << "\n";
    std::cout << "права: " << right << "\n";
    std::cout << "разом: " << left + right << "\n";
    return 0;
}
`,
  "cpp-mutex-counter": raw`#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

class Counter {
public:
    void add(int n) {
        m_.lock();
        value_ += n;
        m_.unlock();
    }
    int value() {
        m_.lock();
        int v = value_;
        m_.unlock();
        return v;
    }

private:
    std::mutex m_;
    int value_ = 0;
};

int main() {
    Counter c;
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back([&c] {
            for (int k = 0; k < 500; ++k) {
                c.add(1);
            }
        });
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "разом: " << c.value() << "\n";
    return 0;
}
`,
  "cpp-lock-guard-sum": raw`#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

int main() {
    long long total = 0;
    std::mutex m;
    std::vector<std::thread> threads;

    for (int part = 0; part < 4; ++part) {
        threads.emplace_back([&total, &m, part] {
            long long local = 0;
            for (int i = part * 250 + 1; i <= (part + 1) * 250; ++i) {
                local += static_cast<long long>(i) * i;
            }
            std::lock_guard<std::mutex> g(m);
            total += local;
        });
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "сума квадратів: " << total << "\n";
    return 0;
}
`,
  "cpp-condvar-queue": raw`#include <condition_variable>
#include <iostream>
#include <mutex>
#include <queue>
#include <thread>

int main() {
    std::queue<int> q;
    std::mutex m;
    std::condition_variable cv;
    bool done = false;

    std::thread producer([&] {
        for (int i = 1; i <= 5; ++i) {
            {
                std::lock_guard<std::mutex> g(m);
                q.push(i);
            }
            cv.notify_one();
        }
        {
            std::lock_guard<std::mutex> g(m);
            done = true;
        }
        cv.notify_one();
    });

    while (true) {
        std::unique_lock<std::mutex> lk(m);
        cv.wait(lk, [&] { return !q.empty() || done; });
        if (q.empty()) {
            break;
        }
        int v = q.front();
        q.pop();
        lk.unlock();
        std::cout << "взяв " << v * v << "\n";
    }

    producer.join();
    std::cout << "кінець\n";
    return 0;
}
`,
  "cpp-async-factorial": raw`#include <future>
#include <iostream>
#include <stdexcept>
#include <vector>

long long factorial(int n) {
    if (n < 0) {
        throw std::invalid_argument("від'ємне число");
    }
    long long r = 1;
    for (int i = 2; i <= n; ++i) {
        r *= i;
    }
    return r;
}

int main() {
    std::vector<int> inputs = {5, 6, 7};
    std::vector<std::future<long long>> futures;
    for (int n : inputs) {
        futures.push_back(std::async(std::launch::async, factorial, n));
    }
    for (std::size_t i = 0; i < futures.size(); ++i) {
        std::cout << inputs[i] << "! = " << futures[i].get() << "\n";
    }

    std::future<long long> bad = std::async(std::launch::async, factorial, -1);
    try {
        bad.get();
    } catch (const std::exception& e) {
        std::cout << "помилка: " << e.what() << "\n";
    }
    return 0;
}
`,
};
