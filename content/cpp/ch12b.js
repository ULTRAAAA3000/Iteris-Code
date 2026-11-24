export const LESSONS_12b = [
  {
    t: "Проєкт: кеш LRU з шаблонами",
    ch: "Проєкти",
    adv: true,
    easy: "Кеш LRU це стіл із обмеженим місцем: нове лягає зверху, те, чим щойно користувалися, піднімається нагору, а коли місця бракує, зі столу зникає те, що найдовше лежало без діла.",
    p: [
      "<b>Розбір ТЗ.</b> Потрібен контейнер, що пам'ятає не більше <code>N</code> пар «ключ-значення». Операція <code>get(ключ)</code> повертає значення або повідомляє, що його немає. Операція <code>put(ключ, значення)</code> додає пару. Коли місця бракує, видаляється елемент, до якого не зверталися найдовше: звідси назва LRU, least recently used. Обидві операції мають працювати за сталий час, а не обходити всі елементи. Ключ і значення довільні, тому клас буде шаблоном.",
      "<b>Декомпозиція.</b> Задачу розкладаємо на дві вимоги. Перша: швидко знайти елемент за ключем, для цього підходить <code>std::unordered_map</code>. Друга: швидко визначити найстаріший елемент і переставити елемент на «найсвіжіше» місце, для цього підходить <code>std::list</code>, бо вставка й видалення в ньому не інвалідують решту ітераторів. Зв'язуємо їх так: список зберігає пари в порядку свіжості, а мапа за ключем зберігає <i>ітератор</i> на потрібну позицію списку.",
      "Ключова операція це <code>splice</code>: <code>items.splice(items.begin(), items, it)</code> переносить вузол <code>it</code> на початок того ж списку без копіювання значення, за сталий час, і ітератор лишається чинним. Саме тому мапа може безпечно тримати ітератори. Початок списку це найсвіжіший елемент, кінець це кандидат на видалення. Під час переповнення беремо <code>items.back()</code>, стираємо його ключ із мапи й робимо <code>pop_back</code>.",
      "<b>Шаблон.</b> Параметри <code>K</code> і <code>V</code> це ключ і значення. Вимоги до <code>K</code> випливають із <code>unordered_map</code>: ключ має мати <code>operator==</code> і <code>std::hash</code>. Для <code>int</code> і <code>std::string</code> усе готове, для власної структури hash доведеться написати. Метод <code>get</code> повертає вказівник на значення або <code>nullptr</code>: це чесно показує «немає» без винятків і без копії. Метод <code>put</code> для наявного ключа оновлює значення й теж піднімає елемент угору.",
      "<b>Типові помилки.</b> Перша: забути оновити свіжість у <code>get</code>, тоді кеш перетворюється на FIFO. Друга: при видаленні стерти елемент зі списку, але лишити ключ у мапі, тоді в мапі висять ітератори на знищені вузли. Третя: не обробити місткість нуль, тоді <code>back()</code> порожнього списку це UB. Четверта: покластися на <code>unordered_map::at</code> замість перевірки: на відсутній ключ він кидає виняток. П'ята: ключ без <code>std::hash</code> дає довгу помилку компіляції шаблону.",
      "<b>Перевірка.</b> Кеш зручно тестувати сценарієм із відомим результатом: місткість два, кладемо a і b, читаємо a, кладемо c, і тепер має зникнути b, бо a щойно використовували. Додайте лічильники влучань і промахів: в реальних системах саме вони показують, чи кеш взагалі корисний. Порядок ключів від найсвіжішого до найстарішого вивести просто, обійшовши список, і цей порядок детермінований, на відміну від обходу <code>unordered_map</code>.",
      "У цьому проєкті зійшлося багато з курсу: шаблони, контейнери, ітератори, переміщення значень і інваріанти класу. Сталий час обох операцій дає саме поєднання двох структур, і це загальний прийом: коли одна структура не дає всього, їх зв'язують. У наступному проєкті ми побудуємо rate limiter, а час у ньому передаватимемо як число тіків, щоб поведінка була повністю відтворюваною.",
    ],
    code: [
      String.raw`#include <iostream>
#include <list>
#include <string>

int main() {
    std::list<std::string> items{"a", "b", "c"};
    auto it = items.end();
    --it;                                      // вказує на "c"
    items.splice(items.begin(), items, it);    // "c" стає найсвіжішим
    for (const auto& s : items) {
        std::cout << s << " ";
    }
    std::cout << "\n";
    std::cout << "ітератор чинний: " << *it << "\n";
    return 0;
}
`,
      String.raw`#include <cstddef>
#include <iostream>
#include <list>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

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
        if (cap_ == 0) {
            return;
        }
        if (items_.size() == cap_) {
            index_.erase(items_.back().first);
            items_.pop_back();
        }
        items_.emplace_front(key, std::move(value));
        index_[key] = items_.begin();
    }

    std::size_t size() const { return items_.size(); }
    std::size_t hits() const { return hits_; }
    std::size_t misses() const { return misses_; }

    std::vector<K> keys() const {
        std::vector<K> out;
        for (const auto& kv : items_) {
            out.push_back(kv.first);
        }
        return out;
    }

private:
    using Item = std::pair<K, V>;
    std::size_t cap_;
    std::size_t hits_ = 0;
    std::size_t misses_ = 0;
    std::list<Item> items_;
    std::unordered_map<K, typename std::list<Item>::iterator> index_;
};

int main() {
    LruCache<std::string, int> cache(2);
    cache.put("a", 1);
    cache.put("b", 2);
    cache.get("a");        // a тепер найсвіжіший
    cache.put("c", 3);     // місця немає: зникає b
    std::cout << "b: " << (cache.get("b") ? "є" : "немає") << "\n";
    std::cout << "a: " << *cache.get("a") << "\n";
    for (const auto& k : cache.keys()) {
        std::cout << k << " ";
    }
    std::cout << "\n";
    std::cout << "влучань: " << cache.hits() << ", промахів: " << cache.misses() << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: ключ Point не має std::hash, unordered_map не можна створити
#include <iostream>
#include <list>
#include <unordered_map>

struct Point {
    int x, y;
    bool operator==(const Point& o) const { return x == o.x && y == o.y; }
};

int main() {
    std::unordered_map<Point, int> index;
    index[Point{1, 2}] = 3;
    std::cout << index.size() << "\n";
    return 0;
}
`,
      String.raw`// аварія: at() на відсутньому ключі кидає виняток, який ніхто не ловить
#include <iostream>
#include <string>
#include <unordered_map>

int main() {
    std::unordered_map<std::string, int> index{{"a", 1}};
    std::cout << "a: " << index.at("a") << std::endl;
    std::cout << "b: " << index.at("b") << std::endl;
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <unordered_map>
#include <list>
#include <utility>

// Ключ власного типу: вказуємо hash самі
struct Point {
    int x, y;
    bool operator==(const Point& o) const { return x == o.x && y == o.y; }
};

struct PointHash {
    std::size_t operator()(const Point& p) const {
        return static_cast<std::size_t>(p.x) * 31u + static_cast<std::size_t>(p.y);
    }
};

int main() {
    std::unordered_map<Point, std::string, PointHash> names;
    names[Point{1, 2}] = "дім";
    names[Point{3, 4}] = "робота";
    const auto it = names.find(Point{3, 4});
    std::cout << (it != names.end() ? it->second : "?") << "\n";
    std::cout << "елементів: " << names.size() << "\n";
    return 0;
}
`,
    ],
    note: "LRU це список (порядок свіжості) плюс мапа (ключ → ітератор у списку). <code>splice</code> піднімає елемент за сталий час, а при переповненні йде видалення з кінця списку й ключа з мапи.",
    work: "Кеші LRU стоять перед повільними джерелами: базами даних, DNS, декодерами зображень. Їх параметр, місткість, добирають за відсотком влучань, який рахують саме такими лічильниками: якщо влучань мало, кеш лише їсть пам'ять і нічого не прискорює.",
    tasks: [
      "Чому в мапі зберігають ітератори списку і чому після <code>splice</code> вони лишаються чинними?",
      "Що має бути в типі ключа, щоб його можна було використати з <code>std::unordered_map</code>?",
    ],
  },
  {
    t: "Проєкт: rate limiter і підсумок курсу",
    ch: "Проєкти",
    adv: true,
    easy: "Rate limiter це контролер біля входу в клуб: за хвилину пускає не більше десяти людей. Хто прийшов одинадцятим, чекає, а коли старі відвідувачі «випадають» з хвилинного вікна, місця з'являються.",
    p: [
      "<b>Розбір ТЗ.</b> Сервіс має відхиляти клієнтів, що надсилають забагато запитів. Правило: не більше <code>limit</code> запитів від одного клієнта за вікно в <code>window</code> тіків. Операція <code>allow(клієнт, тік)</code> повертає <code>true</code>, якщо запит дозволено (і тоді його обліковують), і <code>false</code>, якщо ліміт вичерпано. Головна умова: <b>час це параметр</b>. Годинник не викликаємо, замість нього приймаємо ціле число тіків. Тоді кожен запуск дає той самий результат, а тести не залежать від швидкості машини.",
      "<b>Декомпозиція.</b> Для кожного клієнта треба пам'ятати моменти його дозволених запитів. Беремо <code>std::map&lt;std::string, std::deque&lt;long&gt;&gt;</code>: ключ це ім'я клієнта, черга це тіки запитів у порядку надходження. При кожному запиті спершу прибираємо з голови черги всі тіки, що вийшли з вікна (<code>тік - старий_тік &gt;= window</code>), потім дивимося, чи є місце. Якщо черга коротша за ліміт, додаємо поточний тік у хвіст і дозволяємо, інакше відмовляємо. Це «ковзне вікно».",
      "<b>Альтернатива.</b> Є ще «відро з жетонами»: у відрі до <code>N</code> жетонів, кожен запит забирає один, а один жетон повертається за кожні <code>k</code> тіків. Воно пам'ятає лише два числа замість черги й дозволяє короткі сплески. Ковзне вікно точніше, але витрачає пам'ять на кожен запит. Вибір залежить від ТЗ, і вміти обґрунтувати його теж частина роботи розробника. У цьому проєкті реалізуємо вікно, а відро буде вашим завданням.",
      "<b>Типові помилки.</b> Перша: брати час із годинника всередині класу, тоді тест не відтворити. Друга: не чистити старі тіки, тоді клієнт, що колись вичерпав ліміт, заблокований назавжди. Третя: межа вікна «на одиницю»: запит у момент <code>старий + window</code> уже за вікном, і це треба вирішити однозначно. Четверта: час, що повертається назад. Це порушення передумови, і про нього краще повідомити винятком, ніж мовчки порахувати дурницю.",
      "<b>Що ми вивчили.</b> Основи (змінні, функції, потоки керування), контейнери й алгоритми STL, класи, RAII, правила 0/3/5 і семантика переміщення, шаблони, лямбди, <code>variant</code> та <code>optional</code>, винятки й гарантії безпеки, потоки з <code>mutex</code> та <code>atomic</code>, рядки, <code>chrono</code> і випадкові числа, тестування й профілювання, проєктування шарів і своїх проєктів. Це справжній базовий інструментарій сучасного C++17.",
      "<b>Куди далі.</b> По-перше, збірка: <b>CMake</b> дає змогу будувати проєкти з багатьох файлів, підключати тести й залежності. По-друге, бібліотеки: Boost, fmt, GoogleTest, Catch2, Abseil. По-третє, нові стандарти: C++20 приніс концепти, діапазони, <code>std::format</code>, корутини й модулі, C++23 додав <code>std::expected</code> та <code>std::print</code>. По-четверте, відкритий код: читайте чужі проєкти, надсилайте виправлення й дрібні патчі, це найшвидший спосіб дорости до професійного рівня.",
      "Практичний план такий: візьміть один зі своїх проєктів, винесіть його в окремі файли, додайте CMake і тести, увімкніть санітайзери й застосуйте <code>-Wall -Wextra</code>. Потім перепишіть окремі місця з можливостями C++20, щоб відчути різницю. Не намагайтеся вивчити весь C++ одразу: мова величезна, і навіть досвідчені розробники знають її частинами. Пишіть код, читайте код, і курс стане лише початком вашого шляху.",
    ],
    code: [
      String.raw`#include <iostream>

// Відро з жетонами: час приходить параметром (цілі тіки)
class TokenBucket {
public:
    TokenBucket(int capacity, int period) : cap_(capacity), period_(period), tokens_(capacity) {}

    bool allow(long now) {
        long gained = (now - last_) / period_;
        if (gained > 0) {
            tokens_ = tokens_ + static_cast<int>(gained) > cap_ ? cap_ : tokens_ + static_cast<int>(gained);
            last_ += gained * period_;
        }
        if (tokens_ == 0) {
            return false;
        }
        --tokens_;
        return true;
    }

private:
    int cap_;
    int period_;
    int tokens_;
    long last_ = 0;
};

int main() {
    TokenBucket bucket(2, 10);
    for (long t : {0L, 1L, 2L, 10L, 11L}) {
        std::cout << "тік " << t << ": " << (bucket.allow(t) ? "так" : "ні") << "\n";
    }
    return 0;
}
`,
      String.raw`#include <deque>
#include <iostream>
#include <map>
#include <stdexcept>
#include <string>

class RateLimiter {
public:
    RateLimiter(std::size_t limit, long window) : limit_(limit), window_(window) {}

    bool allow(const std::string& client, long now) {
        if (now < last_now_) {
            throw std::invalid_argument("час не може повертатися назад");
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
    RateLimiter rl(2, 10);
    struct Req { const char* who; long t; };
    for (const Req& r : {Req{"anna", 0}, Req{"anna", 3}, Req{"anna", 5}, Req{"bob", 6},
                         Req{"anna", 10}, Req{"anna", 13}, Req{"anna", 14}}) {
        std::cout << r.who << " @" << r.t << ": " << (rl.allow(r.who, r.t) ? "так" : "ні") << "\n";
    }
    return 0;
}
`,
      String.raw`// аварія: час повернувся назад, винятку ніхто не ловить
#include <iostream>
#include <stdexcept>

long last = 0;

bool allow(long now) {
    if (now < last) {
        throw std::invalid_argument("час не може повертатися назад");
    }
    last = now;
    return true;
}

int main() {
    std::cout << allow(5) << std::endl;
    std::cout << allow(2) << std::endl;
    return 0;
}
`,
      String.raw`// фрагмент: CMake для проєкту з кількох файлів (CMakeLists.txt)
cmake_minimum_required(VERSION 3.16)
project(limiter CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(limiter main.cpp rate_limiter.cpp)
target_compile_options(limiter PRIVATE -Wall -Wextra)

# збірка: cmake -S . -B build && cmake --build build
`,
    ],
    note: "Rate limiter приймає час як ціле число тіків, тому поведінка детермінована й легко тестується. Ковзне вікно зберігає тіки запитів у черзі, а старі прибирає перед кожною перевіркою.",
    work: "Обмежувачі стоять на вході API, шлюзів, поштових серверів і логінів: вони захищають сервіс від перевантаження та підбору паролів. Параметр часу в класі це стандартний прийом, що робить таку логіку перевірюваною тестами.",
    tasks: [
      "Чому rate limiter приймає час параметром, а не викликає годинник усередині?",
      "Чим ковзне вікно відрізняється від відра з жетонами за пам'яттю й поведінкою на сплесках?",
    ],
  },
];
