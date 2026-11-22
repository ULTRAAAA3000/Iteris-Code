// Практичні завдання глави «Паралелізм», частина b (уроки 74–78). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07b: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-atomic-counter", lesson: "cpp/74", xp: 30,
    title: "atomic: спільна сума без мʼютекса",
    context: "Лічильники запитів, прапорці й підсумки, до яких пишуть кілька потоків, зручно робити атомарними: без мʼютекса, без гонки даних і з детермінованим результатом після join.",
    brief: [
      "Допишіть <code>add_range</code>: вона додає до спільного <code>std::atomic&lt;int&gt;</code> числа від 1 до <code>n</code> по одному. Чотири потоки викликають її з <code>n = 100</code>.",
      "Після <code>join</code> головний потік друкує рядок <code>total = 20200</code> (4 × 5050).",
    ],
    starter: raw`#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

void add_range(std::atomic<int>& total, int n) {
    // TODO: у циклі від 1 до n додавайте i до total атомарною операцією
    (void)total;
    (void)n;
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
    checks: [
      { on: "stdout", name: "Сума всіх чотирьох потоків", equals: "total = 20200", hint: "Кожен потік додає 1+2+...+100 = 5050; чотири потоки дають 20200." },
      { on: "stdout", name: "Підсумок не нульовий", matches: "total = [1-9]", hint: "Тіло add_range порожнє: додайте числа до total." },
      { on: "source", name: "Атомарне додавання", matches: "fetch_add|total\\s*\\+=|total\\.fetch|\\+\\+\\s*total", hint: "Використайте fetch_add(i) або оператор += на std::atomic." },
      { on: "source", name: "Тип лічильника atomic", has: "std::atomic<int>", hint: "Лічильник має лишитися std::atomic<int>, а не звичайним int." },
    ],
  },
  {
    ...base, id: "cpp-scoped-lock-transfer", lesson: "cpp/75", xp: 40,
    title: "scoped_lock: переказ без взаємного блокування",
    context: "Коли операція зачіпає два обʼєкти з власними замками, потоки в протилежних напрямках можуть заблокувати один одного. scoped_lock бере обидва замки разом і ця біда зникає.",
    brief: [
      "Допишіть <code>transfer</code>: захопіть мʼютекси обох рахунків одним <code>std::scoped_lock</code> і перенесіть <code>amount</code> з <code>from</code> до <code>to</code>.",
      "Потік 1 переказує 100 разів по 5 з <code>a</code> до <code>b</code>, потік 2 переказує 100 разів по 3 з <code>b</code> до <code>a</code>. Програма друкує <code>a = 800, b = 1200</code> і другим рядком <code>sum = 2000</code>.",
    ],
    starter: raw`#include <iostream>
#include <mutex>
#include <thread>

struct Account {
    std::mutex m;
    int balance;
};

void transfer(Account& from, Account& to, int amount) {
    // TODO: візьміть обидва мʼютекси через std::scoped_lock, потім змініть баланси
    (void)from;
    (void)to;
    (void)amount;
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
    checks: [
      { on: "stdout", name: "Баланси після переказів", has: "a = 800, b = 1200", hint: "a втрачає 100*5 і отримує 100*3: 1000 - 500 + 300." },
      { on: "stdout", name: "Сума збережена", has: "sum = 2000", hint: "Гроші не зникають: віднімання з одного рахунку й додавання до іншого." },
      { on: "stdout", name: "Точний вивід", equals: "a = 800, b = 1200\nsum = 2000", hint: "Два рядки: баланси та сума." },
      { on: "source", name: "Використано scoped_lock", has: "std::scoped_lock", hint: "Передайте в один std::scoped_lock обидва мʼютекси: from.m і to.m." },
    ],
  },
  {
    ...base, id: "cpp-release-acquire", lesson: "cpp/76", xp: 40,
    title: "release і acquire: публікація даних",
    context: "Щоб один потік безпечно передав іншому готові дані, їх публікують через атомарний прапорець: release-запис з одного боку й acquire-читання з другого. На цьому тримається більшість lock-free коду.",
    brief: [
      "Виробник записує <code>payload = 123</code> і публікує прапорець <code>ready</code> із <code>memory_order_release</code>. Споживач (запускається після виробника) читає прапорець із <code>memory_order_acquire</code> і, якщо він піднятий, копіює <code>payload</code> у <code>seen</code>.",
      "Програма друкує <code>seen: 123</code>. У заготовці виробник нічого не публікує, тому друкується <code>seen: -1</code>.",
    ],
    starter: raw`#include <atomic>
#include <iostream>
#include <thread>

int main() {
    int payload = 0;
    std::atomic<bool> ready{false};
    int seen = -1;

    std::thread producer([&] {
        payload = 123;
        // TODO: опублікуйте ready = true з memory_order_release
    });
    producer.join();

    std::thread consumer([&] {
        // TODO: прочитайте ready з memory_order_acquire; якщо true, seen = payload
        (void)payload;
        (void)ready;
        (void)seen;
    });
    consumer.join();

    std::cout << "seen: " << seen;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Споживач побачив дані", equals: "seen: 123", hint: "Виробник має поставити ready у true, а споживач має це побачити й скопіювати payload." },
      { on: "source", name: "Release-запис", has: "memory_order_release", hint: "Запишіть прапорець через ready.store(true, std::memory_order_release)." },
      { on: "source", name: "Acquire-читання", has: "memory_order_acquire", hint: "Прочитайте прапорець через ready.load(std::memory_order_acquire)." },
      { on: "stdout", name: "Не значення за замовчуванням", matches: "^(?![\\s\\S]*-1)[\\s\\S]*$", hint: "seen не повинно лишитися -1: споживач мусить побачити прапорець." },
    ],
  },
  {
    ...base, id: "cpp-thread-local-once", lesson: "cpp/77", xp: 40,
    title: "thread_local і call_once",
    context: "Кеші та лічильники окремого потоку живуть у thread_local, а спільні ресурси на кшталт налаштувань мають ініціалізуватися рівно раз: це робить call_once.",
    brief: [
      "Зробіть лічильник <code>counter</code> змінною <code>thread_local</code> і викличте <code>init_once()</code> через <code>std::call_once</code>, щоб «ініціалізація» виконалась один раз.",
      "Три потоки викликають <code>bump</code> 2, 4 і 6 разів. Програма друкує <code>thread 0: 2</code>, <code>thread 1: 4</code>, <code>thread 2: 6</code>, <code>main: 0</code> і <code>init calls: 1</code>, кожне з нового рядка.",
    ],
    starter: raw`#include <iostream>
#include <mutex>
#include <thread>

int counter = 0;  // TODO: зробіть змінну thread_local
std::once_flag init_flag;
int init_calls = 0;

void init_once() {
    // TODO: виконайте ++init_calls лише один раз через std::call_once(init_flag, ...)
    ++init_calls;
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
    checks: [
      { on: "stdout", name: "Окремі лічильники потоків", has: "thread 2: 6", hint: "Третій потік має стартувати з нуля: у кожного потоку власна копія змінної." },
      { on: "stdout", name: "Головний потік не змінився", has: "main: 0", hint: "Копія головного потоку не зачіпається робітниками." },
      { on: "stdout", name: "Одна ініціалізація", has: "init calls: 1", hint: "Обгорніть ++init_calls у std::call_once(init_flag, [] { ... })." },
      { on: "stdout", name: "Точний вивід", equals: "thread 0: 2\nthread 1: 4\nthread 2: 6\nmain: 0\ninit calls: 1", hint: "П'ять рядків у вказаному порядку." },
      { on: "source", name: "thread_local у коді", has: "thread_local", hint: "Додайте специфікатор thread_local до оголошення counter." },
    ],
  },
  {
    ...base, id: "cpp-thread-pool", lesson: "cpp/78", xp: 50,
    title: "Власний пул потоків",
    context: "Пул потоків повторно використовує робітників замість запуску потоку на кожне завдання. Так працюють сервери та паралельні бібліотеки: черга, мʼютекс і умовна змінна разом.",
    brief: [
      "Допишіть <code>run()</code>: цикл робітника. Він чекає на <code>cv_</code> за умови «зупинка або є завдання», виходить, коли черга порожня й пул зупиняється, інакше бере завдання, відпускає замок і виконує його.",
      "Вісім завдань записують у вектор квадрати 1..8. Після завершення пулу відсортуйте результати й надрукуйте один рядок <code>squares: 1 4 9 16 25 36 49 64</code>.",
    ],
    starter: raw`#include <algorithm>
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
        // TODO: for (;;) { unique_lock; cv_.wait(...); вихід, якщо черга порожня;
        //       взяти завдання, відпустити замок (закрити блок), виконати }
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
    checks: [
      { on: "stdout", name: "Усі вісім квадратів", equals: "squares: 1 4 9 16 25 36 49 64", hint: "Кожне з восьми завдань має виконатися рівно раз, навіть коли пул уже зупиняється." },
      { on: "source", name: "Очікування на умовній змінній", matches: "cv_\\.wait\\s*\\(", hint: "Робітник чекає через cv_.wait(lock, предикат)." },
      { on: "source", name: "Предикат із прапорцем зупинки", matches: "stop_\\s*\\|\\|", hint: "Умова пробудження: stop_ || !jobs_.empty()." },
      { on: "source", name: "Завдання беруться з черги", has: "jobs_.pop()", hint: "Після std::move(jobs_.front()) видаліть елемент через pop()." },
    ],
  },
];
