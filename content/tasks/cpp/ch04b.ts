// Практичні завдання глави «Типи користувача й пам'ять», частина b (уроки 38–44). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04b: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-raii-guard", lesson: "cpp/38", xp: 30,
    title: "RAII: клас Guard із конструктором і деструктором",
    context: "RAII: ресурс (файл, мютекс, з'єднання) захоплюється в конструкторі й звільняється в деструкторі, який C++ викликає сам при виході зі scope. Забути закрити ресурс стає неможливо.",
    brief: [
      "Допишіть конструктор класу <code>Guard</code> (виводить <code>acquire &lt;name&gt;</code>) і деструктор <code>~Guard()</code> (виводить <code>release &lt;name&gt;</code>).",
      "У <code>main</code> об'єкт створюється всередині блоку <code>{ }</code>: деструктор спрацює автоматично на його закритті, до слова <code>end</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>

class Guard {
    std::string name;

public:
    // TODO: конструктор Guard(std::string n): вивести "acquire <name>"
    // TODO: деструктор ~Guard(): вивести "release <name>"
};

int main() {
    std::cout << "start" << std::endl;
    {
        Guard g("A");
        std::cout << "work" << std::endl;
    }
    std::cout << "end" << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Конструктор захоплює ресурс", has: "start\nacquire A\nwork", hint: "Конструктор має запам'ятати ім'я в полі й надрукувати рядок acquire з цим ім'ям." },
      { on: "stdout", name: "Деструктор звільняє ресурс на виході з блоку", has: "work\nrelease A\nend", hint: "Деструктор викликається сам, коли g виходить зі scope, тобто до слова end." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "start\nacquire A\nwork\nrelease A\nend", hint: "П'ять рядків у порядку: start, acquire A, work, release A, end." },
      { on: "source", name: "Описано деструктор", matches: "~\\s*Guard\\s*\\(", hint: "Деструктор називається так само, як клас, із тильдою попереду." },
    ],
  },
  {
    ...base, id: "cpp-unique-ptr-owner", lesson: "cpp/39", xp: 30,
    title: "unique_ptr: створення, передача володіння, reset",
    context: "unique_ptr робить власника ресурсу єдиним і сам звільняє ресурс. Так у сучасному C++ замість голих new/delete тримають файли, з'єднання й об'єкти в купі.",
    brief: [
      "Фабрика <code>make</code> зараз створює об'єкт через <code>new</code>. Замініть це на <code>std::make_unique</code>. У <code>main</code> передайте володіння від <code>a</code> до <code>b</code> через <code>std::move</code>, а потім звільніть ресурс викликом <code>b.reset()</code>.",
      "Очікуваний вивід: <code>open A</code>, <code>a=empty b=A</code>, <code>close A</code>, <code>end</code>, кожен в окремому рядку.",
    ],
    starter: raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

class Res {
public:
    explicit Res(std::string n) : name_(std::move(n)) { std::cout << "open " << name_ << "\n"; }
    ~Res() { std::cout << "close " << name_ << "\n"; }
    const std::string& name() const { return name_; }

private:
    std::string name_;
};

std::unique_ptr<Res> make(const std::string& n) {
    // TODO: замініть new на std::make_unique<Res>(n)
    return std::unique_ptr<Res>(new Res(n));
}

int main() {
    auto a = make("A");
    // TODO: перекладіть володіння з a у b через std::move
    std::unique_ptr<Res> b;
    std::cout << "a=" << (a ? a->name() : std::string("empty"))
              << " b=" << (b ? b->name() : std::string("empty")) << "\n";
    // TODO: звільніть ресурс викликом b.reset()
    std::cout << "end\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Після переміщення a порожній, b володіє", has: "open A\na=empty b=A", hint: "std::move віддає володіння: a стає порожнім, b тримає об'єкт." },
      { on: "stdout", name: "reset звільняє ресурс до end", has: "b=A\nclose A\nend", hint: "Виклик reset() знищує об'єкт одразу, тому close друкується перед end." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "open A\na=empty b=A\nclose A\nend", hint: "Чотири рядки; close A лише один раз." },
      { on: "source", name: "Фабрика використовує make_unique", has: "make_unique", hint: "std::make_unique<Res>(n) створює об'єкт і одразу віддає його unique_ptr." },
      { on: "source", name: "Немає голого new", matches: "^(?![\\s\\S]*\\bnew\\s)[\\s\\S]*$", hint: "Приберіть вираз new: за створення відповідає make_unique." },
    ],
  },
  {
    ...base, id: "cpp-shared-weak", lesson: "cpp/40", xp: 30,
    title: "shared_ptr і weak_ptr: лічильник і спостерігач",
    context: "shared_ptr дає кільком власникам спільний об'єкт, а weak_ptr дозволяє стежити за ним, не продовжуючи життя. Так будують кеші й зворотні посилання без витоків.",
    brief: [
      "Зробіть <code>b</code> другим власником того ж об'єкта (копія <code>a</code>), а в функції <code>report</code> перевірте спостерігача: якщо <code>w.lock()</code> дає непорожній <code>shared_ptr</code>, надрукуйте <code>alive</code>, інакше <code>gone</code>.",
      "Очікуваний вивід: <code>open S</code>, <code>count=2</code>, <code>alive</code>, <code>close S</code>, <code>gone</code>, <code>end</code>, кожен в окремому рядку.",
    ],
    starter: raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

class Res {
public:
    explicit Res(std::string n) : name_(std::move(n)) { std::cout << "open " << name_ << "\n"; }
    ~Res() { std::cout << "close " << name_ << "\n"; }

private:
    std::string name_;
};

void report(const std::weak_ptr<Res>& w) {
    // TODO: якщо w.lock() непорожній, надрукуйте "alive", інакше "gone"
    std::cout << "gone\n";
}

int main() {
    auto a = std::make_shared<Res>("S");
    std::weak_ptr<Res> w = a;
    std::shared_ptr<Res> b;  // TODO: зробіть b копією a (другий власник)
    std::cout << "count=" << a.use_count() << "\n";
    report(w);
    b.reset();
    a.reset();
    report(w);
    std::cout << "end\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Два власники дають лічильник 2", has: "open S\ncount=2", hint: "Копіювання shared_ptr збільшує лічильник: b має бути копією a." },
      { on: "stdout", name: "Поки є власники, weak_ptr бачить об'єкт", has: "count=2\nalive", hint: "lock() повертає непорожній shared_ptr, поки хоч один власник живий." },
      { on: "stdout", name: "Після reset обох власників об'єкт знищено", has: "alive\nclose S\ngone", hint: "Останній reset знищує об'єкт, і lock() повертає порожній вказівник." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "open S\ncount=2\nalive\nclose S\ngone\nend", hint: "Шість рядків; close S лише один раз." },
    ],
  },
  {
    ...base, id: "cpp-rule-of-three", lesson: "cpp/41", xp: 35,
    title: "Правило трьох: глибоке копіювання Buffer",
    context: "Клас, що володіє пам'яттю, має сам вміти копіюватися: інакше дві копії діляться одним буфером і ламають одна одну. Це основа безпечних власних контейнерів.",
    brief: [
      "Клас <code>Buffer</code> володіє масивом. Допишіть <b>конструктор копіювання</b> і <b>оператор присвоєння копіюванням</b> так, щоб копія мала власний масив (глибока копія). У присвоєнні врахуйте самоприсвоєння.",
      "Очікуваний вивід: <code>a=103 b=6 c=105</code> одним рядком.",
    ],
    starter: raw`#include <iostream>

class Buffer {
public:
    explicit Buffer(int size) : size_(size), data_(new int[size]) {
        for (int i = 0; i < size_; ++i) data_[i] = i + 1;
    }
    ~Buffer() { delete[] data_; }

    // TODO: конструктор копіювання: виділіть власний масив і скопіюйте елементи
    Buffer(const Buffer& other) : size_(0), data_(nullptr) { (void)other; }
    // TODO: присвоєння: перевірка this != &other, звільнити старе, виділити нове, скопіювати
    Buffer& operator=(const Buffer& other) {
        (void)other;
        return *this;
    }

    void set(int i, int v) { data_[i] = v; }
    int sum() const {
        int s = 0;
        for (int i = 0; i < size_; ++i) s += data_[i];
        return s;
    }

private:
    int size_;
    int* data_;
};

int main() {
    Buffer a(3);
    Buffer b = a;
    a.set(0, 100);
    Buffer c(1);
    c = a;
    a.set(1, 0);
    std::cout << "a=" << a.sum() << " b=" << b.sum() << " c=" << c.sum() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Копія b не змінюється разом з a", has: "b=6", hint: "Сума b лишається 1+2+3 лише тоді, коли b має власний масив." },
      { on: "stdout", name: "Присвоєння c = a копіює вміст", has: "c=105", hint: "Після c = a у c ті самі елементи, що були в a: 100, 2, 3." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "a=103 b=6 c=105", hint: "Один рядок: a=…, b=…, c=… через пробіли." },
      { on: "source", name: "Є перевірка самоприсвоєння", matches: "this\\s*!=\\s*&", hint: "Порівняйте this з адресою аргументу, щоб не знищити власні дані." },
    ],
  },
  {
    ...base, id: "cpp-move-handle", lesson: "cpp/42", xp: 35,
    title: "Семантика переміщення: Handle забирає ресурс",
    context: "Переміщення передає ресурс без копіювання: так повертають великі об'єкти з функцій і кладуть їх у контейнери. Джерело після цього лишається порожнім, але придатним.",
    brief: [
      "У класі <code>Handle</code> допишіть <b>конструктор переміщення</b> і <b>оператор присвоєння переміщенням</b>: вони забирають вказівник у джерела, а джерело обнуляють. Обидві функції позначте <code>noexcept</code>.",
      "Очікуваний вивід: <code>a=0 b=7</code> і <code>b=0 c=7</code> (<code>valid()</code> друкується як 0 або 1), кожен в окремому рядку.",
    ],
    starter: raw`#include <iostream>
#include <utility>

class Handle {
public:
    explicit Handle(int v) : p_(new int(v)) {}
    ~Handle() { delete p_; }
    Handle(const Handle&) = delete;
    Handle& operator=(const Handle&) = delete;

    // TODO: конструктор переміщення (noexcept): забрати p_ у other, обнулити other.p_
    Handle(Handle&& other) noexcept : p_(nullptr) { (void)other; }
    // TODO: присвоєння переміщенням (noexcept): звільнити своє, забрати чуже, обнулити чуже
    Handle& operator=(Handle&& other) noexcept {
        (void)other;
        return *this;
    }

    bool valid() const { return p_ != nullptr; }
    int value() const { return p_ ? *p_ : -1; }

private:
    int* p_;
};

int main() {
    Handle a(7);
    Handle b = std::move(a);
    std::cout << "a=" << a.valid() << " b=" << b.value() << "\n";
    Handle c(1);
    c = std::move(b);
    std::cout << "b=" << b.valid() << " c=" << c.value() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Конструктор переміщення забирає значення", has: "a=0 b=7", hint: "Після переміщення a не має володіти нічим, а b тримає 7." },
      { on: "stdout", name: "Присвоєння переміщенням передає ресурс", has: "b=0 c=7", hint: "Спершу звільніть старий p_ у c, потім заберіть p_ у джерела." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "a=0 b=7\nb=0 c=7", hint: "Два рядки; джерело обнуляйте через nullptr." },
      { on: "source", name: "Операції переміщення позначено noexcept", matches: "&&[^)]*\\)\\s*noexcept", hint: "Додайте noexcept після списку параметрів обох операцій." },
    ],
  },
  {
    ...base, id: "cpp-enum-static", lesson: "cpp/43", xp: 30,
    title: "enum class і статичний лічильник об'єктів",
    context: "enum class дає іменовані значення без плутанини з числами, а статичний член зберігає дані, спільні для всіх об'єктів класу, наприклад кількість створених екземплярів.",
    brief: [
      "Допишіть <code>toString</code>: через <code>switch</code> поверніть <code>low</code>, <code>mid</code> або <code>high</code> для відповідного значення <code>Level</code>. У конструкторі <code>Counter</code> збільшуйте статичний лічильник <code>created</code>.",
      "Очікуваний вивід: <code>low</code>, <code>mid</code>, <code>high</code>, потім <code>created=3</code>, кожен в окремому рядку.",
    ],
    starter: raw`#include <initializer_list>
#include <iostream>

enum class Level { Low, Mid, High };

const char* toString(Level l) {
    // TODO: switch по l: Low -> "low", Mid -> "mid", High -> "high"
    (void)l;
    return "?";
}

class Counter {
public:
    Counter() {
        // TODO: збільште статичний лічильник created
    }
    static int total() { return created; }

private:
    inline static int created = 0;
};

int main() {
    for (Level l : {Level::Low, Level::Mid, Level::High}) {
        std::cout << toString(l) << "\n";
    }
    Counter a, b, c;
    std::cout << "created=" << Counter::total() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Назви рівнів друкуються по порядку", has: "low\nmid\nhigh", hint: "Кожне значення Level відображається на свій рядок у switch." },
      { on: "stdout", name: "Лічильник рахує створені об'єкти", has: "created=3", hint: "Статичний член спільний для всіх об'єктів: ++created у конструкторі." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "low\nmid\nhigh\ncreated=3", hint: "Чотири рядки без зайвого тексту." },
      { on: "source", name: "Використано enum class з switch", matches: "switch\\s*\\(", hint: "Розгляньте значення переліку оператором switch." },
    ],
  },
  {
    ...base, id: "cpp-operators-vec2", lesson: "cpp/44", xp: 30,
    title: "Перевантаження операторів: Vec2",
    context: "Перевантажені оператори роблять власні типи (вектори, гроші, час) зручними: a + b читається як у математиці. Головне, щоб оператор робив те, чого від нього чекають.",
    brief: [
      "Для структури <code>Vec2</code> допишіть <code>operator+</code> (покомпонентна сума), <code>operator*</code> (множення на число) і <code>operator==</code> (рівність обох полів). <code>operator&lt;&lt;</code> уже готовий і друкує <code>(x, y)</code>.",
      "Очікуваний вивід: <code>(4, 6)</code>, <code>(3, 6)</code> і <code>true</code>, кожен в окремому рядку.",
    ],
    starter: raw`#include <iostream>

struct Vec2 {
    int x;
    int y;
};

// TODO: поверніть Vec2 із сумою відповідних полів
Vec2 operator+(const Vec2& a, [[maybe_unused]] const Vec2& b) {
    return a;
}

// TODO: поверніть Vec2, у якого обидва поля помножено на k
Vec2 operator*(const Vec2& a, [[maybe_unused]] int k) {
    return a;
}

// TODO: поверніть true, якщо збігаються і x, і y
bool operator==([[maybe_unused]] const Vec2& a, [[maybe_unused]] const Vec2& b) {
    return false;
}

std::ostream& operator<<(std::ostream& os, const Vec2& v) {
    return os << "(" << v.x << ", " << v.y << ")";
}

int main() {
    Vec2 a{1, 2};
    Vec2 b{3, 4};
    std::cout << a + b << "\n";
    std::cout << a * 3 << "\n";
    std::cout << std::boolalpha << (a + b == Vec2{4, 6}) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума векторів", has: "(4, 6)", hint: "Складайте поля x з x та y з y і повертайте новий Vec2." },
      { on: "stdout", name: "Множення на число", has: "(3, 6)", hint: "Кожне поле множиться на k: {1, 2} * 3." },
      { on: "stdout", name: "Рівність векторів", has: "(3, 6)\ntrue", hint: "operator== порівнює обидва поля й повертає bool." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "(4, 6)\n(3, 6)\ntrue", hint: "Три рядки, формат (x, y) уже забезпечує operator<<." },
      { on: "source", name: "Оператор == описано", matches: "operator\\s*==", hint: "Функція називається operator== і повертає bool." },
    ],
  },
];
