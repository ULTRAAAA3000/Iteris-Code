// Практичні завдання глави «Проєкти», друга частина (уроки 109–110). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_12b: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-lru-cache", lesson: "cpp/109", xp: 55,
    title: "Кеш LRU",
    context: "Кеш LRU стоїть перед повільними джерелами даних і тримає останні використані записи. Поєднання списку й мапи дає сталий час обох операцій, і це класичний прийом із співбесід та реальних систем.",
    brief: [
      "Допишіть шаблон <code>LruCache</code>. Метод <code>get(key)</code> повертає вказівник на значення або <code>nullptr</code>, лічить влучання чи промах і піднімає знайдений елемент на початок списку через <code>splice</code>. Метод <code>put(key, value)</code> оновлює наявний ключ і піднімає його, а для нового ключа при переповненні видаляє останній елемент списку разом із його ключем у мапі.",
      "<code>main</code> уже написаний. Очікуваний вивід, шість рядків: <code>get 1: 10</code>, <code>get 2: немає</code>, <code>get 3: 30</code>, <code>get 1: 11</code>, далі <code>ключі: 1 3</code> і <code>влучань: 3, промахів: 1</code>.",
    ],
    starter: raw`#include <cstddef>
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
        // TODO: знайти ключ у index_; немає: ++misses_ і nullptr
        // TODO: є: ++hits_, splice на початок items_, повернути &значення
        (void)key;
        return nullptr;
    }

    void put(const K& key, V value) {
        // TODO: ключ є: оновити значення й підняти на початок
        // TODO: нового ключа немає: якщо items_.size() == cap_, видалити останній
        //       (ключ із index_, потім pop_back), далі emplace_front і запис в index_
        (void)key;
        (void)value;
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
    checks: [
      { on: "stdout", name: "Витіснення", has: "get 2: немає", hint: "Після get(1) найстарішим став ключ 2: put(3, ...) має його видалити." },
      { on: "stdout", name: "Оновлення значення", has: "get 1: 11", hint: "put для наявного ключа змінює значення, а не додає дублікат." },
      { on: "stdout", name: "Порядок свіжості", has: "ключі: 1 3", hint: "Останній використаний ключ стоїть першим: його піднімає і get, і put." },
      { on: "stdout", name: "Лічильники", has: "влучань: 3, промахів: 1", hint: "Рахуйте кожен виклик get: знайдений це влучання, відсутній це промах." },
      { on: "stdout", name: "Точний вивід", equals: "get 1: 10\nget 2: немає\nget 3: 30\nget 1: 11\nключі: 1 3\nвлучань: 3, промахів: 1", hint: "Шість рядків у заданому порядку." },
      { on: "source", name: "splice", has: "splice", hint: "Перенесення вузла на початок списку без копіювання робить метод splice." },
    ],
  },
  {
    ...base, id: "cpp-rate-limiter", lesson: "cpp/110", xp: 60,
    title: "Rate limiter з тіками",
    context: "Обмежувачі частоти захищають API та форми входу від перевантаження. Якщо час передавати числом, а не читати з годинника, поведінку легко відтворити й перевірити тестом.",
    brief: [
      "Допишіть <code>RateLimiter</code> з ковзним вікном: клієнт може зробити не більше <code>limit</code> дозволених запитів за останні <code>window</code> тіків. Метод <code>allow(client, now)</code> спершу видаляє з голови черги клієнта тіки, для яких <code>now - тік &gt;= window</code>, потім відмовляє (<code>false</code>), якщо в черзі вже <code>limit</code> записів, інакше додає <code>now</code> і повертає <code>true</code>.",
      "Якщо <code>now</code> менший за останній побачений тік, киньте <code>std::invalid_argument</code> з текстом <code>час назад</code>. Годинник не викликайте. <code>main</code> готовий: має вивести дев'ять рядків виду <code>a@0: так</code>, далі <code>дозволено: 7, відхилено: 2</code> і <code>помилка: час назад</code>.",
    ],
    starter: raw`#include <deque>
#include <iostream>
#include <map>
#include <stdexcept>
#include <string>

class RateLimiter {
public:
    RateLimiter(std::size_t limit, long window) : limit_(limit), window_(window) {}

    bool allow(const std::string& client, long now) {
        // TODO: якщо now < last_now_, кинути std::invalid_argument("час назад")
        // TODO: запам'ятати last_now_ = now
        // TODO: взяти чергу клієнта hits_[client], прибрати старі тіки з голови
        // TODO: якщо черга вже містить limit_ записів, повернути false
        // TODO: інакше додати now у хвіст і повернути true
        (void)client;
        (void)now;
        return false;
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
    checks: [
      { on: "stdout", name: "Ліміт вичерпано", has: "a@3: ні", hint: "Четвертий запит клієнта a у вікні з трьох має бути відхилений." },
      { on: "stdout", name: "Клієнти незалежні", has: "b@3: так", hint: "Кожен клієнт має власну чергу тіків." },
      { on: "stdout", name: "Вікно рухається", has: "a@5: так", hint: "Тік 0 уже вийшов за вікно: 5 - 0 >= 5. Приберіть його перед перевіркою." },
      { on: "stdout", name: "Підсумок", has: "дозволено: 7, відхилено: 2", hint: "Відхилені запити в чергу не потрапляють." },
      { on: "stdout", name: "Час назад", has: "помилка: час назад", hint: "Порівняйте now з останнім побаченим тіком і киньте std::invalid_argument." },
      { on: "stdout", name: "Точний вивід", equals: "a@0: так\na@1: так\na@2: так\na@3: ні\nb@3: так\na@5: так\na@6: так\na@7: так\na@8: ні\nдозволено: 7, відхилено: 2\nпомилка: час назад", hint: "Одинадцять рядків, формат клієнт@тік: так або ні." },
      { on: "source", name: "Без годинника", matches: "^(?![\\s\\S]*(chrono|clock|time\\())[\\s\\S]*$", hint: "Час приходить параметром now, годинник не потрібен." },
    ],
  },
];
