// Практичні завдання глави «Архітектура» (уроки 101–105). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_11: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-odr-header", lesson: "cpp/101", xp: 30,
    title: "Заголовок без порушення ODR",
    context: "Усе, що потрапляє в заголовок, підключається в багатьох одиницях трансляції. Якщо зробити це неправильно, лінкер відмовиться збирати проєкт, тож треба знати, що можна класти в заголовок.",
    brief: [
      "Файл імітує проєкт: блок «заголовок» зверху, <code>main</code> посередині, блок «cpp» знизу. У «заголовку» константа <code>kMax</code> і функція <code>twice</code> зараз написані так, що порушили б ODR, якби заголовок підключили в двох файлах. Зробіть <code>kMax</code> змінною <code>inline constexpr</code> зі значенням <code>10</code>, а <code>twice</code> функцією <code>inline</code>, що повертає подвоєне число.",
      "Функція <code>bonus()</code> потрібна лише цьому файлу: сховайте її в <b>анонімному просторі імен</b> і поверніть <code>3</code>. Функцію <code>clamp</code> визначте нижче за <code>main</code>: значення менше за 0 стає 0, більше за <code>kMax</code> стає <code>kMax</code>, решта без змін. Формат виводу задає <code>main</code>.",
    ],
    starter: raw`#include <iostream>

// ===== "заголовок" =====
int clamp(int v);  // оголошення

// TODO: зробіть це inline constexpr зі значенням 10
constexpr int kMax = 0;

// TODO: зробіть функцію inline; вона має повертати x * 2
int twice(int /*x*/) { return 0; }

// ===== main =====
// TODO: перенесіть bonus() в анонімний простір імен namespace { ... } і поверніть 3
int bonus() { return 0; }

int main() {
    std::cout << clamp(5) << " " << clamp(50) << " " << clamp(-3) << "\n";
    std::cout << twice(clamp(7)) << "\n";
    std::cout << kMax << " " << bonus() << "\n";
    return 0;
}

// ===== "cpp" =====
// TODO: визначте clamp: менше 0 дає 0, більше kMax дає kMax, інакше v
int clamp(int v) {
    return v;
}
`,
    checks: [
      { on: "stdout", name: "Обмеження значень", has: "5 10 0", hint: "clamp перетискає число в проміжок від 0 до kMax." },
      { on: "stdout", name: "Подвоєння", has: "14", hint: "twice(7) має повернути 14." },
      { on: "stdout", name: "Константа й допоміжна функція", has: "10 3", hint: "kMax дорівнює 10, bonus() повертає 3." },
      { on: "stdout", name: "Повний вивід", equals: "5 10 0\n14\n10 3", hint: "Три рядки: clamp, twice, потім kMax і bonus." },
      { on: "source", name: "inline-змінна в заголовку", matches: "inline\\s+constexpr\\s+int\\s+kMax", hint: "У C++17 змінну для заголовка пишуть як inline constexpr." },
      { on: "source", name: "inline-функція", matches: "inline\\s+int\\s+twice", hint: "Слово inline ставлять перед типом результату." },
      { on: "source", name: "Анонімний простір імен", matches: "namespace\\s*\\{", hint: "namespace без імені, одразу фігурна дужка." },
    ],
  },
  {
    ...base, id: "cpp-layers-notes", lesson: "cpp/102", xp: 35,
    title: "Три шари: нотатки",
    context: "Розділення на handler, service і repository тримає правила окремо від розбору запитів і зберігання. Помилку правила сервіс повідомляє винятком, а handler перетворює її на код відповіді.",
    brief: [
      "Шар repository вже готовий. Допишіть <b>service</b>: <code>create</code> кидає <code>std::invalid_argument</code> для порожнього тексту, інакше додає нотатку й повертає її id; <code>get</code> шукає нотатку; <code>count</code> повертає кількість. Потім у <b>handler</b> заповніть гілку <code>ADD</code>: успіх дає <code>201 id=N</code>, а виняток <code>400 empty</code>.",
      "Гілки <code>GET</code> і невідомої команди (<code>404 not found</code>, <code>405 unknown</code>) уже написані. Вивід кожного запиту має вигляд <code>запит -&gt; відповідь</code>, а в кінці рядок <code>всього: N</code>.",
    ],
    starter: raw`#include <iostream>
#include <map>
#include <optional>
#include <sstream>
#include <stdexcept>
#include <string>

namespace repository {
class NoteRepository {
public:
    int add(const std::string& text) {
        items_[next_] = text;
        return next_++;
    }
    std::optional<std::string> find(int id) const {
        auto it = items_.find(id);
        if (it == items_.end()) return std::nullopt;
        return it->second;
    }
    std::size_t count() const { return items_.size(); }

private:
    std::map<int, std::string> items_;
    int next_ = 1;
};
}  // namespace repository

namespace service {
class NoteService {
public:
    explicit NoteService(repository::NoteRepository& repo) : repo_(repo) {}
    // TODO: create кидає std::invalid_argument("empty") для порожнього тексту, інакше repo_.add(text)
    int create(const std::string& /*text*/) { return 0; }
    // TODO: get повертає repo_.find(id)
    std::optional<std::string> get(int /*id*/) const { return std::nullopt; }
    // TODO: count повертає repo_.count()
    std::size_t count() const { return 0; }

private:
    repository::NoteRepository& repo_;
};
}  // namespace service

namespace handler {
std::string handle(service::NoteService& svc, const std::string& request) {
    std::istringstream in(request);
    std::string method;
    in >> method;
    if (method == "ADD") {
        std::string text;
        std::getline(in >> std::ws, text);
        // TODO: спробуйте svc.create(text) і поверніть "201 id=" + номер;
        //       якщо впіймали std::invalid_argument, поверніть "400 empty"
        return "";
    }
    if (method == "GET") {
        int id = 0;
        in >> id;
        auto note = svc.get(id);
        if (!note) return "404 not found";
        return "200 " + *note;
    }
    return "405 unknown";
}
}  // namespace handler

int main() {
    repository::NoteRepository repo;
    service::NoteService svc(repo);
    const char* requests[] = {"ADD buy milk", "ADD", "GET 1", "GET 5", "PING"};
    for (const char* r : requests) {
        std::cout << r << " -> " << handler::handle(svc, r) << "\n";
    }
    std::cout << "всього: " << svc.count() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Успішне додавання", has: "ADD buy milk -> 201 id=1", hint: "У гілці ADD поверніть рядок «201 id=» і номер, який дав сервіс." },
      { on: "stdout", name: "Порожній текст відхилено", has: "ADD -> 400 empty", hint: "Виняток із сервісу ловіть у handler і перетворюйте на відповідь." },
      { on: "stdout", name: "Читання нотатки", has: "GET 1 -> 200 buy milk", hint: "Сервіс get має пересилати виклик у сховище." },
      { on: "stdout", name: "Повний вивід", equals: "ADD buy milk -> 201 id=1\nADD -> 400 empty\nGET 1 -> 200 buy milk\nGET 5 -> 404 not found\nPING -> 405 unknown\nвсього: 1", hint: "Відхилена нотатка в сховище не потрапляє, тож лічильник дорівнює 1." },
      { on: "source", name: "Виняток для порожнього тексту", matches: "throw\\s+std::invalid_argument", hint: "Правило перевірки живе в сервісі: кидайте std::invalid_argument." },
      { on: "source", name: "Обробка в handler", matches: "catch\\s*\\(\\s*const\\s+std::invalid_argument", hint: "У handler потрібен блок catch за константним посиланням." },
    ],
  },
  {
    ...base, id: "cpp-di-notifier", lesson: "cpp/103", xp: 35,
    title: "Фейк замість справжнього сповіщувача",
    context: "Сервіс, який отримує залежність через інтерфейс, легко перевірити з підставним об'єктом: без пошти, мережі й консолі. Це основа швидких модульних тестів.",
    brief: [
      "Інтерфейс <code>Notifier</code> і <code>ConsoleNotifier</code> уже є. Допишіть <code>SignupService</code>: конструктор приймає <code>Notifier&amp;</code> і зберігає посилання; <code>signup(user)</code> для порожнього імені повертає <code>false</code>, інакше надсилає <code>вітаємо, ім'я</code> і повертає <code>true</code>.",
      "Потім реалізуйте <code>FakeNotifier</code>: метод <code>send</code> не друкує, а додає текст у вектор <code>messages</code>. <code>main</code> показує обидві реалізації; змінювати його не потрібно.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <vector>

class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void send(const std::string& msg) = 0;
};

class ConsoleNotifier : public Notifier {
public:
    void send(const std::string& msg) override { std::cout << "[консоль] " << msg << "\n"; }
};

// TODO: send має додавати msg у messages (а не нічого не робити)
class FakeNotifier : public Notifier {
public:
    void send(const std::string& /*msg*/) override {}
    std::vector<std::string> messages;
};

// TODO: збережіть Notifier& у полі; signup("") дає false, інакше надішліть "вітаємо, " + user і поверніть true
class SignupService {
public:
    explicit SignupService(Notifier& /*n*/) {}
    bool signup(const std::string& /*user*/) { return false; }
};

int main() {
    ConsoleNotifier console;
    SignupService real(console);
    real.signup("Ада");

    FakeNotifier fake;
    SignupService tested(fake);
    tested.signup("Ада");
    tested.signup("");
    tested.signup("Грейс");

    std::cout << "надіслано: " << fake.messages.size() << "\n";
    for (const auto& m : fake.messages) std::cout << "- " << m << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Справжній сповіщувач друкує", has: "[консоль] вітаємо, Ада", hint: "signup викликає send через збережене посилання." },
      { on: "stdout", name: "Фейк рахує повідомлення", has: "надіслано: 2", hint: "Порожнє ім'я не має доходити до send." },
      { on: "stdout", name: "Фейк зберіг тексти", has: "- вітаємо, Грейс", hint: "FakeNotifier::send додає msg у вектор messages." },
      { on: "stdout", name: "Повний вивід", equals: "[консоль] вітаємо, Ада\nнадіслано: 2\n- вітаємо, Ада\n- вітаємо, Грейс", hint: "Фейк нічого не друкує сам: рядки з дефісом виводить main." },
      { on: "source", name: "Збережена залежність", matches: "Notifier&\\s+\\w+_\\s*;", hint: "Поле-посилання на інтерфейс: Notifier&, ім'я закінчується підкресленням." },
      { on: "source", name: "Фейк записує у вектор", has: "messages.push_back", hint: "Скористайтеся методом push_back вектора." },
    ],
  },
  {
    ...base, id: "cpp-pimpl-counter", lesson: "cpp/104", xp: 45,
    title: "Лічильник за ідіомою pimpl",
    context: "Pimpl ховає поля за вказівником, тож зміна реалізації не вимагає перекомпіляції користувачів. Тут треба правильно визначити конструктор, деструктор і копіювання в місці, де структура вже повна.",
    brief: [
      "Клас <code>Counter</code> оголошено з <code>struct Impl;</code> і <code>std::unique_ptr&lt;Impl&gt;</code>. У блоці «cpp» визначте <code>Impl</code> з полями суми й кількості викликів, а також методи: <code>add(n)</code> збільшує суму на <code>n</code> і кількість викликів на 1, <code>total()</code> і <code>calls()</code> їх повертають.",
      "Деструктор визначте як <code>= default</code> (у блоці «cpp»). Копіюючий конструктор має робити <b>глибоку копію</b>: новий <code>Impl</code> із вмістом чужого. Тоді зміна копії не зачіпає оригінал.",
    ],
    starter: raw`#include <iostream>
#include <memory>

// ===== "counter.h" =====
class Counter {
public:
    Counter();
    Counter(const Counter& other);
    ~Counter();
    void add(int n);
    int total() const;
    int calls() const;

private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

// ===== "counter.cpp" =====
// TODO: додайте в Impl поля: int total = 0; int calls = 0;
struct Counter::Impl {};

Counter::Counter() : impl_(std::make_unique<Impl>()) {}
// TODO: глибока копія: створіть новий Impl із *other.impl_
Counter::Counter(const Counter& /*other*/) : impl_(std::make_unique<Impl>()) {}
Counter::~Counter() = default;
// TODO: add збільшує total на n і calls на 1
void Counter::add(int /*n*/) {}
int Counter::total() const { return 0; }  // TODO
int Counter::calls() const { return 0; }  // TODO

// ===== main =====
int main() {
    Counter a;
    a.add(5);
    a.add(7);
    Counter b = a;
    b.add(100);
    std::cout << a.total() << " " << a.calls() << "\n";
    std::cout << b.total() << " " << b.calls() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Оригінал не змінився", has: "12 2", hint: "Після копіювання b.add не повинен чіпати a." },
      { on: "stdout", name: "Копія продовжила рахунок", has: "112 3", hint: "Копія починає зі стану оригіналу: 12 і 2, потім ще 100." },
      { on: "stdout", name: "Повний вивід", equals: "12 2\n112 3", hint: "Два рядки: спершу a, потім b." },
      { on: "source", name: "Глибока копія", matches: "make_unique<Impl>\\(\\s*\\*\\s*other\\.impl_\\s*\\)", hint: "Новий Impl створіть із копії розіменованого чужого вказівника." },
      { on: "source", name: "Деструктор у cpp", has: "Counter::~Counter() = default", hint: "Визначення деструктора поряд з Impl, а не в заголовку." },
    ],
  },
  {
    ...base, id: "cpp-cmake-gen", lesson: "cpp/105", xp: 40,
    title: "Генератор CMakeLists.txt",
    context: "Файли збирання пишуть за шаблоном, тож їх нерідко генерують скриптами. Вправа закріплює, з яких команд складається мінімальний CMakeLists.txt і що таке ціль.",
    brief: [
      "Напишіть функцію <code>cmake(name, sources, standard)</code>, що повертає текст мінімального <code>CMakeLists.txt</code> із чотирьох рядків: <code>cmake_minimum_required(VERSION 3.16)</code>, <code>project(ім'я LANGUAGES CXX)</code>, <code>add_executable(ім'я файли через пробіл)</code> і <code>target_compile_features(ім'я PRIVATE cxx_std_НН)</code>.",
      "Рядки розділяйте <code>\\n</code> (після останнього рядка переведення не потрібне: <code>main</code> додасть його сам). Збирайте текст через <code>std::ostringstream</code>. <code>main</code> друкує два результати, між ними рядок <code>---</code>.",
    ],
    starter: raw`#include <iostream>
#include <sstream>
#include <string>
#include <vector>

// TODO: зберіть текст із чотирьох рядків; джерела через пробіл
std::string cmake(const std::string& /*name*/, const std::vector<std::string>& /*sources*/, int /*standard*/) {
    return "";
}

int main() {
    std::cout << cmake("notes", {"main.cpp", "service.cpp", "repo.cpp"}, 17) << "\n";
    std::cout << "---\n";
    std::cout << cmake("tool", {"tool.cpp"}, 20) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок add_executable", has: "add_executable(notes main.cpp service.cpp repo.cpp)", hint: "Джерела розділяють пробілами, без коми й пробілу після останнього." },
      { on: "stdout", name: "Стандарт з параметра", has: "target_compile_features(tool PRIVATE cxx_std_20)", hint: "Номер стандарту підставте після cxx_std_." },
      { on: "stdout", name: "Повний вивід", equals: "cmake_minimum_required(VERSION 3.16)\nproject(notes LANGUAGES CXX)\nadd_executable(notes main.cpp service.cpp repo.cpp)\ntarget_compile_features(notes PRIVATE cxx_std_17)\n---\ncmake_minimum_required(VERSION 3.16)\nproject(tool LANGUAGES CXX)\nadd_executable(tool tool.cpp)\ntarget_compile_features(tool PRIVATE cxx_std_20)", hint: "Чотири рядки, потім ---, потім ще чотири рядки." },
      { on: "source", name: "Потік для збирання тексту", has: "std::ostringstream", hint: "Створіть ostringstream і пишіть у нього через <<." },
    ],
  },
];
