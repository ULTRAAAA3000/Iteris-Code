// Еталонні рішення завдань C++, глава 07 (частина b, уроки 74–78). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_07b = {
  "cpp-atomic-counter": raw`#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

void add_range(std::atomic<int>& total, int n) {
    for (int i = 1; i <= n; ++i) total.fetch_add(i);
}

int main() {
    std::atomic<int> total{0};
    std::vector<std::thread> threads;
    for (int t = 0; t < 4; ++t) {
        threads.emplace_back(add_range, std::ref(total), 100);
    }
    for (auto& th : threads) th.join();
    std::cout << "total = " << total.load();
    return 0;
}
`,
  "cpp-scoped-lock-transfer": raw`#include <iostream>
#include <mutex>
#include <thread>

struct Account {
    std::mutex m;
    int balance;
};

void transfer(Account& from, Account& to, int amount) {
    std::scoped_lock lock(from.m, to.m);
    from.balance -= amount;
    to.balance += amount;
}

int main() {
    Account a{{}, 1000};
    Account b{{}, 1000};
    std::thread t1([&] { for (int i = 0; i < 100; ++i) transfer(a, b, 5); });
    std::thread t2([&] { for (int i = 0; i < 100; ++i) transfer(b, a, 3); });
    t1.join();
    t2.join();
    std::cout << "a = " << a.balance << ", b = " << b.balance << "\n";
    std::cout << "sum = " << a.balance + b.balance;
    return 0;
}
`,
  "cpp-release-acquire": raw`#include <atomic>
#include <iostream>
#include <thread>

int main() {
    int payload = 0;
    std::atomic<bool> ready{false};
    int seen = -1;

    std::thread producer([&] {
        payload = 123;
        ready.store(true, std::memory_order_release);
    });
    producer.join();

    std::thread consumer([&] {
        if (ready.load(std::memory_order_acquire)) seen = payload;
    });
    consumer.join();

    std::cout << "seen: " << seen;
    return 0;
}
`,
  "cpp-thread-local-once": raw`#include <iostream>
#include <mutex>
#include <thread>

thread_local int counter = 0;
std::once_flag init_flag;
int init_calls = 0;

void init_once() {
    std::call_once(init_flag, [] { ++init_calls; });
}

void bump(int times, int& result) {
    init_once();
    for (int i = 0; i < times; ++i) ++counter;
    result = counter;
}

int main() {
    int results[3] = {0, 0, 0};
    for (int t = 0; t < 3; ++t) {
        std::thread th(bump, (t + 1) * 2, std::ref(results[t]));
        th.join();
    }
    for (int t = 0; t < 3; ++t) std::cout << "thread " << t << ": " << results[t] << "\n";
    std::cout << "main: " << counter << "\n";
    std::cout << "init calls: " << init_calls;
    return 0;
}
`,
  "cpp-thread-pool": raw`#include <algorithm>
#include <condition_variable>
#include <functional>
#include <iostream>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>

class ThreadPool {
public:
    explicit ThreadPool(std::size_t n) {
        for (std::size_t i = 0; i < n; ++i) workers_.emplace_back([this] { run(); });
    }
    ~ThreadPool() {
        {
            std::lock_guard<std::mutex> lock(m_);
            stop_ = true;
        }
        cv_.notify_all();
        for (auto& w : workers_) w.join();
    }
    void submit(std::function<void()> job) {
        {
            std::lock_guard<std::mutex> lock(m_);
            jobs_.push(std::move(job));
        }
        cv_.notify_one();
    }

private:
    void run() {
        for (;;) {
            std::function<void()> job;
            {
                std::unique_lock<std::mutex> lock(m_);
                cv_.wait(lock, [this] { return stop_ || !jobs_.empty(); });
                if (jobs_.empty()) return;
                job = std::move(jobs_.front());
                jobs_.pop();
            }
            job();
        }
    }

    std::vector<std::thread> workers_;
    std::queue<std::function<void()>> jobs_;
    std::mutex m_;
    std::condition_variable cv_;
    bool stop_ = false;
};

int main() {
    std::vector<int> results;
    std::mutex results_mutex;
    {
        ThreadPool pool(3);
        for (int i = 1; i <= 8; ++i) {
            pool.submit([i, &results, &results_mutex] {
                std::lock_guard<std::mutex> lock(results_mutex);
                results.push_back(i * i);
            });
        }
    }
    std::sort(results.begin(), results.end());
    std::cout << "squares:";
    for (int v : results) std::cout << " " << v;
    return 0;
}
`,
};
