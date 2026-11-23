// Практичні завдання глави «Проєкти», частина a (уроки 106–108). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_12a: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-project-text-stats", lesson: "cpp/106", xp: 50,
    title: "Проєкт: статистика тексту",
    context: "Підрахунок слів і рейтинг частот лежать в основі аналізу журналів, відгуків і пошуку. Дві відсутні функції конвеєра треба написати за технічним завданням.",
    brief: [
      "Конвеєр <code>tokenize</code>, <code>countWords</code> уже готовий. Допишіть <code>topN</code> (частота за спаданням, за рівності слово за алфавітом, не більше <code>n</code> записів) і <code>longest</code> (найдовше слово, за рівної довжини менше за алфавітом).",
      "Вивід <code>main</code> уже задано: <code>words</code>, <code>unique</code>, <code>longest</code> і три рядки рейтингу вигляду <code>1. be 4</code>.",
    ],
    starter: raw`#include <algorithm>
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
    // TODO: скопіюйте пари у вектор, відсортуйте (частота за спаданням, за рівності слово за алфавітом), залиште n перших
    (void)freq;
    (void)n;
    return {};
}

std::string longest(const std::vector<std::string>& words) {
    // TODO: найдовше слово; за рівної довжини менше за алфавітом
    (void)words;
    return "";
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
    checks: [
      { on: "stdout", name: "Кількість слів і унікальних", has: "words: 14\nunique: 10", hint: "Ці рядки друкує готовий код; перевірте, що програма збирається й доходить до них." },
      { on: "stdout", name: "Найдовше слово", has: "longest: question", hint: "Порівнюйте довжини; на рівних довжинах лишайте менше слово за алфавітом." },
      { on: "stdout", name: "Рейтинг за рівної частоти", has: "2. to 2\n3. brave 1", hint: "Слів із частотою 1 багато: друге правило порядку це алфавіт." },
      { on: "stdout", name: "Повний вивід збігається", equals: "words: 14\nunique: 10\nlongest: question\n1. be 4\n2. to 2\n3. brave 1", hint: "Звірте кожен рядок із форматом із умови." },
    ],
  },
  {
    ...base, id: "cpp-project-kv-api", lesson: "cpp/107", xp: 55,
    title: "Проєкт: командне API сховища",
    context: "Сервіс, що розбирає рядок-запит і повертає рядок-відповідь із кодом, легко тестувати без мережі. Так будують маршрутизацію реальних веб-сервісів.",
    brief: [
      "Клас <code>Store</code> готовий. Допишіть <code>handle</code>: <code>SET k v</code> дає <code>201 created</code> або <code>200 updated</code>, <code>GET k</code> дає <code>200 значення</code> або <code>404 not found</code>, <code>DEL k</code> дає <code>204 deleted</code> або <code>404 not found</code>, <code>COUNT</code> дає <code>200 кількість</code>. Усе інше, зокрема <code>SET</code> без значення, це <code>400 bad request</code>.",
      "<code>main</code> друкує по рядку <code>запит -&gt; відповідь</code> для десяти запитів.",
    ],
    starter: raw`#include <iostream>
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
    // TODO: SET k v -> "201 created" або "200 updated"; GET k -> "200 <v>" або "404 not found";
    //       DEL k -> "204 deleted" або "404 not found"; COUNT -> "200 <n>"; інакше "400 bad request"
    (void)s;
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
    checks: [
      { on: "stdout", name: "Створення й оновлення", has: "SET a 1 -> 201 created\nSET b 2 -> 201 created\nSET a 3 -> 200 updated", hint: "set повертає true, коли ключ новий." },
      { on: "stdout", name: "Читання", has: "GET a -> 200 3\nGET z -> 404 not found", hint: "get повертає nullptr, якщо ключа немає." },
      { on: "stdout", name: "Видалення й лічильник", has: "DEL b -> 204 deleted\nDEL b -> 404 not found\nCOUNT -> 200 1", hint: "Повторне видалення того самого ключа вже нічого не знаходить." },
      { on: "stdout", name: "Помилкові запити", has: "SET c -> 400 bad request\nPUT x y -> 400 bad request", hint: "Для SET перевірте, що значення справді прочитане." },
      { on: "stdout", name: "Повний вивід збігається", equals: "SET a 1 -> 201 created\nSET b 2 -> 201 created\nSET a 3 -> 200 updated\nGET a -> 200 3\nGET z -> 404 not found\nDEL b -> 204 deleted\nDEL b -> 404 not found\nCOUNT -> 200 1\nSET c -> 400 bad request\nPUT x y -> 400 bad request", hint: "Пробіли й коди мають збігатися символ у символ." },
    ],
  },
  {
    ...base, id: "cpp-project-parallel-sums", lesson: "cpp/108", xp: 55,
    title: "Проєкт: паралельні суми квадратів",
    context: "Розподіл незалежних шматків роботи між потоками з власними комірками результату й атомарним лічильником це основа пакетної обробки. Друк лише після join робить вивід відтворюваним.",
    brief: [
      "Числа від 1 до 1000 розбито на 4 діапазони по 250. Кожен потік має додати квадрати чисел свого діапазону в <code>sums[w]</code> і збільшити атомарний лічильник <code>evens</code> для кожного парного числа.",
      "Друк виконує <code>main</code> після <code>join</code>: чотири рядки <code>worker w: сума</code>, потім <code>total</code> і <code>evens</code>.",
    ],
    starter: raw`#include <atomic>
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
            // TODO: для k від w*CHUNK+1 до (w+1)*CHUNK додайте k*k до sums[w]
            //       і збільште evens для кожного парного k
            (void)sums;
            (void)evens;
            (void)w;
            (void)CHUNK;
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
    checks: [
      { on: "stdout", name: "Суми потоків", has: "worker 0: 5239625\nworker 1: 36552125", hint: "Квадрат краще рахувати в long long, щоб не переповнити int." },
      { on: "stdout", name: "Загальна сума", has: "total: 333833500", hint: "Сума квадратів 1..1000 разом по всіх потоках." },
      { on: "stdout", name: "Лічильник парних", has: "evens: 500", hint: "Лічильник атомарний, тож його можна збільшувати з усіх потоків." },
      { on: "source", name: "Потоки приєднуються", matches: "join\\(", hint: "Кожен std::thread треба приєднати до завершення main." },
      { on: "stdout", name: "Повний вивід збігається", equals: "worker 0: 5239625\nworker 1: 36552125\nworker 2: 99114625\nworker 3: 192927125\ntotal: 333833500\nevens: 500", hint: "Порядок рядків задає цикл у main, а не швидкість потоків." },
    ],
  },
];
