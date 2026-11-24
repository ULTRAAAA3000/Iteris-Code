// Практичні завдання глави «Паралелізм», частина a (уроки 68–73). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07a: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-thread-join", lesson: "cpp/68", xp: 30,
    title: "Три потоки й join",
    context: "Паралельні задачі запускають потоками й обов'язково приєднують: інакше програма завершиться аварійно. Результати збирають після join, тоді вивід завжди однаковий.",
    brief: [
      "Запустіть <b>три потоки</b> у <code>std::vector&lt;std::thread&gt;</code>. Потік з номером <code>i</code> (від 0 до 2) записує у <code>results[i]</code> число <code>(i + 1) * (i + 1) * 10</code>. Кожен потік пише у своє окреме місце, тож гонки немає.",
      "Потім <b>приєднайте всі потоки</b> викликом <code>join</code> і лише після цього надрукуйте результати: рядки виду <code>потік 0: 10</code>. Друк уже є в заготовці.",
    ],
    starter: raw`#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::vector<int> results(3, 0);
    std::vector<std::thread> workers;

    // TODO: запустіть три потоки; потік i записує results[i] = (i + 1) * (i + 1) * 10
    // TODO: викличте join для кожного потоку

    for (int i = 0; i < 3; ++i) {
        std::cout << "потік " << i << ": " << results[i] << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "потік 0: 10\nпотік 1: 40\nпотік 2: 90", hint: "Три рядки: 10, 40 і 90 для потоків 0, 1 і 2." },
      { on: "stdout", name: "Перший результат 10", has: "потік 0: 10", hint: "Для i = 0 формула дає (0 + 1) * (0 + 1) * 10." },
      { on: "stdout", name: "Останній результат 90", has: "потік 2: 90", hint: "Для i = 2 формула дає 3 * 3 * 10." },
      { on: "source", name: "Використано std::thread", matches: "emplace_back|std::thread\\(", hint: "Створюйте потоки через emplace_back із лямбдою або створюйте std::thread напряму." },
      { on: "source", name: "Потоки приєднано", has: "join()", hint: "Після запуску пройдіться циклом по вектору й викличте join для кожного потоку." },
    ],
  },
  {
    ...base, id: "cpp-thread-args", lesson: "cpp/69", xp: 30,
    title: "Сума двох половин у двох потоках",
    context: "Велику роботу ділять між потоками: кожен рахує свій діапазон і кладе результат у свою змінну. Передача посилання через std::ref дозволяє потоку записати відповідь.",
    brief: [
      "Функція <code>sum_range(v, from, to, out)</code> має підсумувати елементи <code>v[from]</code> … <code>v[to - 1]</code> і записати суму в <code>out</code> (параметр-<b>посилання</b>). Допишіть її тіло.",
      "У <code>main</code> запустіть <b>два потоки</b>: перший рахує елементи 0–49 у <code>left</code>, другий 50–99 у <code>right</code>. Змінну передавайте через <code>std::ref</code>, а вектор через <code>std::cref</code>. Після <code>join</code> друк уже готовий.",
    ],
    starter: raw`#include <functional>
#include <iostream>
#include <numeric>
#include <thread>
#include <vector>

void sum_range(const std::vector<int>& v, int from, int to, long long& out) {
    // TODO: запишіть у out суму v[from] ... v[to - 1]
    (void)v; (void)from; (void)to; (void)out;
}

int main() {
    std::vector<int> data(100);
    std::iota(data.begin(), data.end(), 1);
    long long left = 0, right = 0;

    // TODO: два потоки: sum_range(data, 0, 50, left) і sum_range(data, 50, 100, right)
    // не забудьте std::cref(data), std::ref(left) і join

    std::cout << "ліва: " << left << "\n";
    std::cout << "права: " << right << "\n";
    std::cout << "разом: " << left + right << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ліва: 1275\nправа: 3775\nразом: 5050", hint: "Три рядки: суми 1..50, 51..100 і їхня сума." },
      { on: "stdout", name: "Ліва половина 1275", has: "ліва: 1275", hint: "Перший потік рахує числа від 1 до 50." },
      { on: "stdout", name: "Права половина 3775", has: "права: 3775", hint: "Другий потік рахує числа від 51 до 100." },
      { on: "source", name: "Посилання через std::ref", has: "std::ref(", hint: "Без std::ref потік отримає копію, і змінна не зміниться (код навіть не скомпілюється)." },
    ],
  },
  {
    ...base, id: "cpp-mutex-counter", lesson: "cpp/70", xp: 35,
    title: "Безпечний лічильник",
    context: "Спільний лічильник, який змінюють кілька потоків, без захисту дає гонку даних і хибні числа. Клас, що тримає mutex поруч із даними, робить захист невід'ємним.",
    brief: [
      "У класі <code>Counter</code> є поле <code>value_</code> і <code>std::mutex m_</code>. Допишіть метод <code>add(int n)</code>, який <b>під замком</b> додає <code>n</code> до <code>value_</code>, і метод <code>value()</code>, що під замком повертає поточне значення. Використайте <code>m_.lock()</code> і <code>m_.unlock()</code>.",
      "<code>main</code> запускає чотири потоки, кожен 500 разів викликає <code>add(1)</code>. Після <code>join</code> друкується <code>разом: 2000</code>. Без замка це була б гонка даних.",
    ],
    starter: raw`#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

class Counter {
public:
    void add(int n) {
        // TODO: захопіть m_, додайте n до value_, відпустіть m_
        (void)n;
    }
    int value() {
        // TODO: захопіть m_, скопіюйте value_ у локальну змінну, відпустіть m_, поверніть її
        return 0;
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
    checks: [
      { on: "stdout", name: "Лічильник дорівнює 2000", equals: "разом: 2000", hint: "Чотири потоки по 500 збільшень: 2000. Менше число означає, що додавання не захищено." },
      { on: "source", name: "Замок захоплюється", has: "m_.lock()", hint: "Перед зміною value_ викличте m_.lock()." },
      { on: "source", name: "Замок відпускається", has: "m_.unlock()", hint: "Після зміни обов'язково відпустіть замок, інакше інші потоки зависнуть." },
    ],
  },
  {
    ...base, id: "cpp-lock-guard-sum", lesson: "cpp/71", xp: 35,
    title: "Сума квадратів: один замок на потік",
    context: "Потік рахує свою частину локально без замків і лише наприкінці один раз додає її до спільної суми. Це і швидко, і безпечно: замок тримається мить.",
    brief: [
      "Чотири потоки рахують суму квадратів чисел <code>1..1000</code>. Потік <code>part</code> обробляє числа від <code>part * 250 + 1</code> до <code>(part + 1) * 250</code> включно. Сума часткових результатів має бути <code>333833500</code>.",
      "Спершу рахуйте в <b>локальній</b> змінній <code>local</code> без замків. Наприкінці потоку візьміть <code>std::lock_guard</code> і додайте <code>local</code> до спільної <code>total</code> один раз. Ручних <code>lock</code> і <code>unlock</code> тут бути не повинно.",
    ],
    starter: raw`#include <iostream>
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
            // TODO: у циклі від part * 250 + 1 до (part + 1) * 250 додавайте квадрат числа до local
            // TODO: створіть std::lock_guard<std::mutex> і додайте local до total
            (void)total; (void)m; (void)local;
        });
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "сума квадратів: " << total << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума квадратів правильна", equals: "сума квадратів: 333833500", hint: "Сума квадратів 1..1000 дорівнює 333833500. Перевірте межі діапазонів кожного потоку." },
      { on: "source", name: "Використано lock_guard", has: "std::lock_guard", hint: "Замок беріть обгорткою std::lock_guard<std::mutex>, вона сама відпустить його." },
      { on: "source", name: "Без ручного unlock", matches: "^(?![\\s\\S]*\\.unlock\\()[\\s\\S]*$", hint: "lock_guard відпускає замок автоматично, виклик unlock не потрібен." },
    ],
  },
  {
    ...base, id: "cpp-condvar-queue", lesson: "cpp/72", xp: 35,
    title: "Виробник і споживач",
    context: "Споживач не має крутитися в циклі, питаючи про нові дані: він засинає на condition_variable й прокидається, коли виробник покладе елемент у чергу.",
    brief: [
      "Виробник уже написаний: він кладе в чергу числа <code>1</code>…<code>5</code> і наприкінці ставить <code>done = true</code>. Допишіть <b>споживача</b> в <code>main</code>: цикл, де під <code>std::unique_lock</code> він викликає <code>cv.wait</code> з умовою «черга не порожня або done».",
      "Якщо черга порожня (отже, done), вийдіть з циклу. Інакше дістаньте число, відпустіть замок і надрукуйте <code>взяв N²</code>, де N² це квадрат числа, потім рядок <code>кінець</code>.",
    ],
    starter: raw`#include <condition_variable>
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

    // TODO: цикл споживача: unique_lock, cv.wait(lk, ...), вихід якщо q порожня,
    // інакше дістати число, lk.unlock(), надрукувати "взяв " << число * число << "\n"

    producer.join();
    std::cout << "кінець\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "взяв 1\nвзяв 4\nвзяв 9\nвзяв 16\nвзяв 25\nкінець", hint: "П'ять рядків із квадратами 1, 4, 9, 16, 25 по порядку й рядок «кінець»." },
      { on: "stdout", name: "Останній елемент оброблено", has: "взяв 25", hint: "Після done споживач ще має дочитати елементи, що лишилися в черзі." },
      { on: "source", name: "Очікування через wait", has: "cv.wait(", hint: "Споживач засинає викликом cv.wait з unique_lock і предикатом." },
    ],
  },
  {
    ...base, id: "cpp-async-factorial", lesson: "cpp/73", xp: 35,
    title: "Факторіали через async",
    context: "Запустити задачу й забрати результат без ручного потоку, замка й спільної змінної: це робить std::async. Помилка задачі приходить винятком у get().",
    brief: [
      "Функція <code>factorial(n)</code> кидає <code>std::invalid_argument</code> для від'ємного <code>n</code>. Запустіть через <code>std::async(std::launch::async, ...)</code> задачі для <code>5</code>, <code>6</code> і <code>7</code>, збережіть <code>future</code> і виведіть за порядком <code>5! = 120</code>, <code>6! = 720</code>, <code>7! = 5040</code>.",
      "Потім запустіть задачу для <code>-1</code> і в <code>try/catch</code> навколо <code>get()</code> надрукуйте <code>помилка: від'ємне число</code> (текст береться з <code>what()</code>).",
    ],
    starter: raw`#include <future>
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
    // TODO: запустіть async для 5, 6, 7 і збережіть future у vector
    // TODO: у циклі викличте get() і надрукуйте "N! = значення"

    // TODO: async для -1; get() обгорніть у try/catch і надрукуйте "помилка: " << e.what()
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "5! = 120\n6! = 720\n7! = 5040\nпомилка: від'ємне число", hint: "Три факторіали за порядком і рядок помилки." },
      { on: "stdout", name: "Факторіал 7", has: "7! = 5040", hint: "7! = 5040: результат бере future::get()." },
      { on: "source", name: "Використано std::async", has: "std::async", hint: "Запускайте задачі функцією std::async з std::launch::async." },
      { on: "source", name: "Виняток ловиться навколо get", has: "catch", hint: "Виняток задачі повертається при get(), тому try/catch має охоплювати цей виклик." },
    ],
  },
];
