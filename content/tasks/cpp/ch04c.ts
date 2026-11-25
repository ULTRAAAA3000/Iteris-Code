// Практичні завдання глави «Типи користувача й пам'ять», частина c (уроки 45–48, просунуті). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04c: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-friend-mutable-sensor", lesson: "cpp/45", xp: 30,
    title: "Датчик: explicit, mutable і friend",
    context: "Лічильники звернень у const-методах, суворі конструктори й дружні функції діагностики зустрічаються в бібліотечних класах щодня. Завдання збирає всі три інструменти в одному класі.",
    brief: [
      "Клас <code>Sensor</code> майже готовий. Зробіть конструктор <code>explicit</code>, зробіть поле <code>reads_</code> <code>mutable</code>, щоб <code>read() const</code> рахував виклики, і оголосіть <code>friend void report(const Sensor&amp; s);</code>, щоб <code>report</code> могла прочитати приватні поля.",
      "<code>report</code> друкує один рядок у форматі <code>raw=21 reads=2</code>. У <code>main</code> датчик читають двічі, потім викликають <code>report</code>.",
    ],
    starter: raw`#include <iostream>

class Sensor {
public:
    // TODO: зробіть конструктор explicit
    Sensor(int raw) : raw_(raw) {}

    int read() const {
        // TODO: збільшуйте reads_ (поле має стати mutable)
        return raw_;
    }

    // TODO: оголосіть тут friend void report(const Sensor& s);

private:
    int raw_;
    int reads_ = 0;
};

void report(const Sensor& s) {
    // TODO: надрукуйте "raw=<raw_> reads=<reads_>" (потрібен friend)
    (void)s;
    std::cout << "raw=0 reads=0\n";
}

int main() {
    Sensor s(21);
    s.read();
    s.read();
    report(s);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід звіту точний", equals: "raw=21 reads=2", hint: "Формат raw=число reads=число. Лічильник має рости при кожному read()." },
      { on: "stdout", name: "Лічильник звернень дорівнює 2", has: "reads=2", hint: "Збільшуйте reads_ в read(): метод const, тож поле має бути mutable." },
      { on: "source", name: "Конструктор explicit", matches: "explicit\\s+Sensor\\s*\\(", hint: "Слово explicit ставлять перед іменем конструктора." },
      { on: "source", name: "Поле reads_ mutable", matches: "mutable\\s+int\\s+reads_", hint: "mutable ставлять перед типом поля, яке можна змінювати в const-методі." },
      { on: "source", name: "report оголошена як friend", matches: "friend\\s+void\\s+report", hint: "Оголошення friend пишуть усередині класу, перед або після методів." },
    ],
  },
  {
    ...base, id: "cpp-layout-static-assert", lesson: "cpp/46", xp: 30,
    title: "Розмітка структури: порядок полів і alignas",
    context: "Щільні масиви записів, мережеві заголовки й лічильники по лініях кешу залежать від розмітки. Розмір друкувати не можна, але його можна порівнювати й закріплювати через static_assert.",
    brief: [
      "Структура <code>Good</code> має ті самі поля, що й <code>Bad</code>, але в тому ж порядку. Переставте поля в <code>Good</code> від найбільшого вирівнювання до найменшого, щоб вона стала меншою за <code>Bad</code>. Додайте <code>alignas(16)</code> до структури <code>Aligned</code>.",
      "Програма друкує три рядки: <code>Good менша за Bad: true</code>, <code>Aligned по 16: true</code> і <code>sizeof(char): 1</code>. Самі розміри не друкуйте.",
    ],
    starter: raw`#include <iostream>

struct Bad {
    char a;
    double b;
    char c;
    int d;
};

// TODO: переставте поля так, щоб sizeof(Good) < sizeof(Bad)
struct Good {
    char a;
    double b;
    char c;
    int d;
};

// TODO: додайте alignas(16) до цієї структури
struct Aligned {
    int x;
};

int main() {
    std::cout << std::boolalpha;
    std::cout << "Good менша за Bad: " << (sizeof(Good) < sizeof(Bad)) << "\n";
    std::cout << "Aligned по 16: " << (alignof(Aligned) == 16) << "\n";
    std::cout << "sizeof(char): " << sizeof(char) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Точний вивід", equals: "Good менша за Bad: true\nAligned по 16: true\nsizeof(char): 1", hint: "Три рядки: два з true та sizeof(char): 1." },
      { on: "stdout", name: "Good менша за Bad", has: "Good менша за Bad: true", hint: "Спершу найбільші поля (double), потім int, потім обидва char поруч." },
      { on: "stdout", name: "Aligned вирівняна по 16", has: "Aligned по 16: true", hint: "alignas(16) пишуть між struct і назвою типу." },
      { on: "source", name: "Використано alignas(16)", matches: "alignas\\s*\\(\\s*16\\s*\\)", hint: "Підвищте вимогу вирівнювання типу Aligned до 16." },
    ],
  },
  {
    ...base, id: "cpp-placement-new", lesson: "cpp/47", xp: 35,
    title: "Placement new: створити, знищити, повторно використати",
    context: "Пули об'єктів і контейнери тримають пам'ять окремо від об'єктів. Ця вправа показує основу: створення в готовому буфері й явний виклик деструктора.",
    brief: [
      "У <code>main</code> оголошено вирівняний буфер для <code>Noisy</code>. Створіть у ньому об'єкт з ідентифікатором 1 через <b>placement new</b>, викличте <code>hello()</code>, знищіть об'єкт явним деструктором. Потім у тому самому буфері зробіть те саме з ідентифікатором 2.",
      "Очікуваний вивід: <code>create 1</code>, <code>hello 1</code>, <code>destroy 1</code>, <code>create 2</code>, <code>hello 2</code>, <code>destroy 2</code>, <code>кінець</code>, кожен в окремому рядку.",
    ],
    starter: raw`#include <iostream>
#include <new>

class Noisy {
public:
    explicit Noisy(int id) : id_(id) { std::cout << "create " << id_ << "\n"; }
    ~Noisy() { std::cout << "destroy " << id_ << "\n"; }
    void hello() const { std::cout << "hello " << id_ << "\n"; }

private:
    int id_;
};

int main() {
    alignas(Noisy) unsigned char buf[sizeof(Noisy)];
    (void)buf;

    // TODO: створіть Noisy(1) у buf через placement new, викличте hello()
    // TODO: знищіть його явним викликом деструктора
    // TODO: те саме для Noisy(2) у тому ж буфері

    std::cout << "кінець\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Повна послідовність виводу", equals: "create 1\nhello 1\ndestroy 1\ncreate 2\nhello 2\ndestroy 2\nкінець", hint: "Кожен об'єкт: create, hello, destroy, і лише потім наступний." },
      { on: "stdout", name: "Обидва об'єкти знищено", has: "destroy 2", hint: "Деструктор placement-об'єкта не викликається сам, його треба викликати вручну." },
      { on: "source", name: "Placement new у buf", matches: "new\\s*\\(\\s*buf\\s*\\)\\s*Noisy", hint: "Форма: new (адреса) Тип(аргументи)." },
      { on: "source", name: "Явний виклик деструктора", matches: "->\\s*~Noisy\\s*\\(\\s*\\)", hint: "Для таких об'єктів delete не підходить: викличте p->~Тип()." },
      { on: "source", name: "Без delete", matches: "^(?![\\s\\S]*delete\\s+\\w)[\\s\\S]*$", hint: "Пам'ять буфера не виділялася через new, тож delete тут не потрібен." },
    ],
  },
  {
    ...base, id: "cpp-rule-of-zero", lesson: "cpp/48", xp: 35,
    title: "Правило нуля: замінити ручні функції на vector",
    context: "Клас із сирим new[] змушує писати деструктор і копіювання. Заміна на std::vector прибирає їх усі й додає безпечне переміщення. Це типовий рефакторинг у старому коді.",
    brief: [
      "Клас <code>Buffer</code> тримає масив через <code>new int[]</code> і вручну реалізує деструктор, копіювання. Перепишіть його за <b>правилом нуля</b>: замініть сирий масив на <code>std::vector&lt;int&gt;</code> і видаліть деструктор, копіювальний конструктор і оператор присвоєння.",
      "Вивід лишається: <code>10 99</code> (копія незалежна від оригіналу), а другий рядок <code>move noexcept: true</code> (для заготовки він хибний).",
    ],
    starter: raw`#include <iostream>
#include <type_traits>
#include <vector>

class Buffer {
public:
    explicit Buffer(int n) : size_(n), data_(new int[n]()) {}
    // TODO: усе нижче до приватних полів замініть на std::vector<int> і видаліть
    Buffer(const Buffer& other) : size_(other.size_), data_(new int[other.size_]) {
        for (int i = 0; i < size_; ++i) data_[i] = other.data_[i];
    }
    Buffer& operator=(const Buffer& other) {
        if (this != &other) {
            int* fresh = new int[other.size_];
            for (int i = 0; i < other.size_; ++i) fresh[i] = other.data_[i];
            delete[] data_;
            data_ = fresh;
            size_ = other.size_;
        }
        return *this;
    }
    ~Buffer() { delete[] data_; }

    void set(int i, int v) { data_[i] = v; }
    int get(int i) const { return data_[i]; }

private:
    int size_;
    int* data_;
};

int main() {
    Buffer a(3);
    a.set(0, 10);
    Buffer b = a;
    b.set(0, 99);
    std::cout << a.get(0) << " " << b.get(0) << "\n";
    std::cout << "move noexcept: " << std::boolalpha << std::is_nothrow_move_constructible_v<Buffer> << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Копія незалежна від оригіналу", has: "10 99", hint: "Зміна b не повинна чіпати a: vector копіюється глибоко сам." },
      { on: "stdout", name: "Переміщення без винятків", has: "move noexcept: true", hint: "Згенеровані компілятором переміщення vector не кидають винятків." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "10 99\nmove noexcept: true", hint: "Рівно два рядки." },
      { on: "source", name: "Поле на vector", matches: "std::vector\\s*<\\s*int\\s*>\\s+\\w+_", hint: "Оголосіть приватне поле типу std::vector<int>." },
      { on: "source", name: "Деструктора немає", matches: "^(?![\\s\\S]*~Buffer)[\\s\\S]*$", hint: "За правилом нуля деструктор не пишуть: vector прибере сам." },
      { on: "source", name: "Немає ручного new[] і delete", matches: "^(?![\\s\\S]*(new\\s+int\\s*\\[|delete))[\\s\\S]*$", hint: "Уся робота з пам'яттю на боці std::vector." },
    ],
  },
];
