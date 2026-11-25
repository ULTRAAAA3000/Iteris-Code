export const LESSONS_04c = [
  {
    t: "friend, mutable і explicit",
    ch: "Типи користувача й пам'ять",
    easy: "Це три винятки з правил готелю. <code>friend</code> це гість, якому довірили ключ від кімнати, <code>mutable</code> це блокнот на стійці адміністратора, який можна писати навіть у «закритому» номері, а <code>explicit</code> це табличка «лише за пред'явленням паспорта».",
    p: [
      "Клас ховає дані за інтерфейсом, і це правильно. Але бувають три ситуації, де суворі правила заважають. Іноді дві тісно пов'язані сутності мусять бачити внутрішнє одна одної. Іноді метод логічно лише читає, а всередині йому треба щось запам'ятати. І іноді конструктор мимоволі перетворює одне значення на інше там, де ви цього не просили. Для кожної ситуації є окреме слово: <code>friend</code>, <code>mutable</code> і <code>explicit</code>. Це точкові інструменти, їх вживають рідко й свідомо.",
      "<b>friend</b> дає окремій функції або цілому класу доступ до приватних членів. Оголошення пишуть усередині класу: <code>friend void peek(const Vault&amp; v);</code>. Це не метод: у <code>peek</code> немає <code>this</code>, її викликають як звичайну функцію, але вона бачить <code>v.code_</code>. Дружба видається самим класом, ззовні її не захопиш, і вона не успадковується та не взаємна: якщо <code>Pool</code> друг <code>Connection</code>, то <code>Connection</code> не друг <code>Pool</code>. Класичне застосування це оператор виводу <code>operator&lt;&lt;</code>, який не може бути методом, бо зліва в нього потік.",
      "<b>mutable</b> звільняє окреме поле від <code>const</code>. Метод із <code>const</code> обіцяє не змінювати <i>видимий стан</i> об'єкта, і компілятор забороняє писати в поля. Але кеш, лічильник звернень чи м'ютекс не є частиною видимого значення. Якщо поле оголосити <code>mutable int uses_;</code>, його можна змінювати навіть із <code>const</code>-методу. Типовий приклад: метод <code>sum() const</code> один раз рахує суму, зберігає її у <code>mutable</code>-кеші, і далі віддає готову.",
      "<b>explicit</b> стосується конструкторів з одним параметром. Без нього такий конструктор працює і як <i>неявне перетворення</i>: якщо функція приймає <code>Meters</code>, то виклик <code>show(5)</code> мовчки створить <code>Meters</code> із числа. Це зручно для <code>std::string</code> із літерала, але небезпечно для більшості типів: легко передати не те число не в той аргумент. Слово <code>explicit</code> забороняє такий мовчазний шлях: треба писати <code>show(Meters(5))</code>, і намір видно в коді.",
      "Тепер про пастки. Перша: <code>friend</code> руйнує інкапсуляцію, тож кожен друг це додатковий код, який доведеться правити разом із класом. Не дружіть «про всяк випадок». Друга: <code>mutable</code> не дозвіл міняти будь-що. Якщо поле впливає на те, що бачить користувач, воно не має бути <code>mutable</code>. Для кешу й лічильників воно доречне, для даних ні. Третя: потокова безпека. Два потоки, які викликають <code>const</code>-метод із <code>mutable</code>-кешем, можуть писати в нього одночасно, і тоді поле потребує захисту (про це в главі про потоки).",
      "Ідіоми прості. Усі конструктори з одним аргументом позначайте <code>explicit</code>, якщо немає причини, щоб перетворення було неявним; саме так зробили в стандартній бібліотеці для <code>std::vector(size_t)</code>. Дружні функції оголошуйте в класі й записуйте поруч, а не розкидайте по проєкту. Поле <code>mutable</code> підписуйте коментарем, чому воно не змінює видимого стану.",
      "Ці три слова закривають розмову про оболонку класу: хто бачить поля, що можна міняти в <code>const</code> і як об'єкт створюється з одного значення. Наступний крок вглиб: що відбувається з тілом об'єкта в пам'яті, як поля розкладаються байтами й чому розмір структури часто більший за суму розмірів полів. Це урок про <code>sizeof</code> і вирівнювання.",
    ],
    code: [
      String.raw`#include <iostream>

class Vault {
public:
    explicit Vault(int code) : code_(code) {}
    friend void peek(const Vault& v);

private:
    int code_;
};

void peek(const Vault& v) {
    std::cout << "код сейфа: " << v.code_ << "\n";
}

int main() {
    Vault v(1234);
    peek(v);
    return 0;
}
`,
      String.raw`#include <iostream>
#include <utility>
#include <vector>

class Stats {
public:
    explicit Stats(std::vector<int> data) : data_(std::move(data)) {}

    long sum() const {
        if (!cached_) {
            total_ = 0;
            for (int x : data_) total_ += x;
            cached_ = true;
            ++computations_;
        }
        return total_;
    }
    int computations() const { return computations_; }

private:
    std::vector<int> data_;
    mutable long total_ = 0;
    mutable bool cached_ = false;
    mutable int computations_ = 0;
};

int main() {
    Stats s({1, 2, 3, 4});
    const Stats& view = s;
    std::cout << view.sum() << " " << view.sum() << "\n";
    std::cout << "обчислень: " << view.computations() << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: explicit забороняє неявне перетворення int у Meters
#include <iostream>

struct Meters {
    explicit Meters(int v) : value(v) {}
    int value;
};

void show(Meters m) {
    std::cout << m.value << " м\n";
}

int main() {
    show(5);
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <utility>

class Connection {
public:
    explicit Connection(std::string host) : host_(std::move(host)) {}

    std::string describe() const {
        ++uses_;
        return host_ + " (використань: " + std::to_string(uses_) + ")";
    }

private:
    friend class Pool;
    void reset() { uses_ = 0; }

    std::string host_;
    mutable int uses_ = 0;
};

class Pool {
public:
    explicit Pool(std::string host) : conn_(std::move(host)) {}
    const Connection& get() const { return conn_; }
    void recycle() { conn_.reset(); }

private:
    Connection conn_;
};

int main() {
    Pool pool("db.local");
    std::cout << pool.get().describe() << "\n";
    std::cout << pool.get().describe() << "\n";
    pool.recycle();
    std::cout << pool.get().describe() << "\n";
    return 0;
}
`,
    ],
    note: "<code>friend</code> відкриває приватне конкретному другові, <code>mutable</code> дозволяє змінювати кеш чи лічильник у <code>const</code>-методі, <code>explicit</code> забороняє мовчазні перетворення. Усі троє послаблюють правила, тому вживайте їх точково й з причиною.",
    work: "У реальному коді <code>explicit</code> стоїть майже на кожному конструкторі з одним параметром, <code>mutable</code> ховає кеші й м'ютекси в <code>const</code>-методах, а <code>friend</code> зустрічається в <code>operator&lt;&lt;</code> і в парних класах на кшталт «фабрика та продукт».",
    tasks: [
      "Чому <code>operator&lt;&lt;</code> для виводу власного типу не можна зробити методом класу і як <code>friend</code> це вирішує?",
      "Метод <code>size() const</code> кешує результат у полі. Що треба додати до оголошення поля, щоб він скомпілювався, і чому конструктор <code>Meters(int)</code> варто позначити <code>explicit</code>?",
    ],
    adv: true,
  },
  {
    t: "sizeof, вирівнювання й розмітка об'єкта в пам'яті",
    ch: "Типи користувача й пам'ять",
    easy: "Об'єкт у пам'яті це валіза, де речі лежать у відділеннях певної ширини. Якщо покласти малу річ перед широкою, між ними лишиться порожнє місце. Перекладіть речі в іншому порядку, і валіза стане меншою.",
    p: [
      "Досі ми не думали, скільки місця займає об'єкт. Але від цього залежить, чи вміститься масив структур у кеш процесора, скільки пам'яті з'їсть мільйон записів і чи можна записати структуру в мережевий пакет «як є». Для цього потрібні два поняття: <b>розмір</b> типу (<code>sizeof</code>) і його <b>вирівнювання</b> (<code>alignof</code>). Обидва обчислюються під час компіляції й дають <code>std::size_t</code>.",
      "Модель така. Кожен тип має вимогу вирівнювання: його об'єкт має лежати за адресою, кратною певному числу (зазвичай це власний розмір для вбудованих типів). Якщо наступне поле структури вимагає кратності 8, а попереднє закінчилося на непідходящій адресі, компілятор вставляє <b>вирівнювальні байти</b> (<i>padding</i>). Крім того, розмір усієї структури округлюється до її найсуворішого вирівнювання, щоб елементи масиву теж були вирівняні. Тому <code>sizeof</code> структури майже завжди більший за суму розмірів полів.",
      "Гарантії стандарту невеликі: <code>sizeof(char)</code> дорівнює 1 завжди, розмір будь-якого повного типу не менший за 1 (навіть порожня структура), <code>sizeof</code> структури не менший за суму полів, і <code>sizeof(T)</code> кратний <code>alignof(T)</code>. Конкретні числа (чи <code>int</code> має 4 байти, чи <code>long</code> 8) залежать від платформи. Тому <b>не друкуйте розміри й не покладайтеся на них</b>: порівнюйте їх або перевіряйте умови через <code>static_assert</code>, який зупиняє компіляцію, якщо умова хибна.",
      "Порядок полів впливає на розмір. Структура <code>{char a; int b; char c;}</code> зазвичай займає 12 байтів: три паддинги. Якщо записати <code>{int b; char a; char c;}</code>, то обидва <code>char</code> стоять поруч, і розмір падає до 8. Ідіома: оголошуйте поля від найбільшого вирівнювання до найменшого. Для перевірки зміщень поля є макрос <code>offsetof(Тип, поле)</code> із <code>&lt;cstddef&gt;</code>; він працює для типів зі «стандартною розміткою» (прості структури без віртуальних функцій і змішаного доступу).",
      "Вирівнювання можна й підвищити: <code>struct alignas(32) Block {...};</code> вимагає адресу, кратну 32. Це потрібно для SIMD-інструкцій і для розкладання даних по лініях кешу, де різні потоки не повинні ділити одну лінію. Також <code>alignof(x)</code> дає вимогу типу. Адреса будь-якої змінної завжди кратна своєму <code>alignof</code>, це можна перевірити, перетворивши вказівник на <code>std::uintptr_t</code>.",
      "Пастки. Перша: записувати структуру цілком у файл чи сокет через <code>memcpy</code> небезпечно, бо паддинг і розміри типів різняться між платформами; для обміну даними вживайте типи фіксованого розміру (<code>std::uint32_t</code>) і перевіряйте розмітку через <code>static_assert</code>. Друга: розширення на кшталт <code>#pragma pack</code> прибирає паддинг, але робить доступ до невирівняних полів повільним або небезпечним, і воно не стандартне. Третя: пустий об'єкт має розмір не менший за 1, бо різні об'єкти мусять мати різні адреси.",
      "Тепер ми знаємо, як об'єкт лежить у пам'яті. Це відкриває наступну можливість: окремо виділити шматок пам'яті потрібного розміру й вирівнювання, а об'єкт створити в ньому вручну, у вказаному місці. Це називається <i>placement new</i>, і про нього наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>

struct Loose {
    char a;
    int b;
    char c;
};

struct Tight {
    int b;
    char a;
    char c;
};

static_assert(sizeof(char) == 1, "char завжди один байт");
static_assert(sizeof(Loose) >= 2 * sizeof(char) + sizeof(int), "розмір не менший за суму полів");
static_assert(sizeof(Loose) % alignof(Loose) == 0, "розмір кратний вирівнюванню");
static_assert(sizeof(Tight) <= sizeof(Loose), "перестановка полів не збільшує розмір");

int main() {
    std::cout << std::boolalpha;
    std::cout << "Tight не більший за Loose: " << (sizeof(Tight) <= sizeof(Loose)) << "\n";
    std::cout << "Loose кратний alignof: " << (sizeof(Loose) % alignof(Loose) == 0) << "\n";
    return 0;
}
`,
      String.raw`#include <cstddef>
#include <cstdint>
#include <iostream>

struct Packet {
    char tag;
    double value;
    int id;
};

static_assert(offsetof(Packet, tag) == 0, "перше поле на початку");
static_assert(offsetof(Packet, value) % alignof(double) == 0, "double вирівняний");
static_assert(offsetof(Packet, id) > offsetof(Packet, value), "поля йдуть за порядком");

int main() {
    Packet p{'x', 1.5, 7};
    auto addr = reinterpret_cast<std::uintptr_t>(&p.value);
    std::cout << std::boolalpha;
    std::cout << "double за вирівняною адресою: " << (addr % alignof(double) == 0) << "\n";
    std::cout << "поле id після value: " << (offsetof(Packet, id) > offsetof(Packet, value)) << "\n";
    std::cout << p.tag << " " << p.value << " " << p.id << "\n";
    return 0;
}
`,
      String.raw`#include <cstdint>
#include <iostream>

struct alignas(32) Block {
    int data[4];
};

static_assert(alignof(Block) == 32, "вирівнювання підвищено");
static_assert(sizeof(Block) % 32 == 0, "розмір кратний 32");

int main() {
    Block one{};
    Block many[2]{};
    std::cout << std::boolalpha;
    std::cout << (reinterpret_cast<std::uintptr_t>(&one) % 32 == 0) << "\n";
    std::cout << (reinterpret_cast<std::uintptr_t>(&many[1]) % 32 == 0) << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: static_assert хибний, бо після char компілятор вставляє паддинг перед int
#include <iostream>

struct Pair {
    char a;
    int b;
};

static_assert(sizeof(Pair) == sizeof(char) + sizeof(int), "розмір дорівнює сумі полів");

int main() {
    Pair p{'a', 1};
    std::cout << p.b << "\n";
    return 0;
}
`,
      String.raw`#include <cstdint>
#include <cstring>
#include <iostream>

struct Header {
    std::uint32_t id;
    std::uint16_t kind;
    std::uint16_t flags;
};

static_assert(sizeof(Header) == 8, "заголовок без паддингу: рівно 8 байтів");
static_assert(alignof(Header) <= 4, "вирівнювання не суворіше за 4");

int main() {
    Header out{77, 3, 0x0A};
    unsigned char wire[sizeof(Header)];
    std::memcpy(wire, &out, sizeof(Header));

    Header in{};
    std::memcpy(&in, wire, sizeof(Header));
    std::cout << in.id << " " << in.kind << " " << in.flags << "\n";
    std::cout << std::boolalpha << (in.id == out.id && in.kind == out.kind) << "\n";
    return 0;
}
`,
    ],
    note: "<code>sizeof</code> структури зазвичай більший за суму полів через вирівнювальні байти. Конкретні розміри залежать від платформи, тому не друкуйте їх, а перевіряйте умови через <code>static_assert</code>. Поля впорядковуйте від більшого вирівнювання до меншого.",
    work: "Розмітку об'єктів враховують у конвеєрах даних і іграх (щільні масиви структур), у мережевих протоколах і форматах файлів, а також у лок-фрі коді, де <code>alignas(64)</code> розносить лічильники по різних лініях кешу. <code>static_assert</code> фіксує очікування в коді.",
    tasks: [
      "Структура <code>{char a; double b; char c; int d;}</code> займає більше місця, ніж потрібно. Як переставити поля, щоб розмір зменшився, і чому це працює?",
      "Чому не можна друкувати <code>sizeof(long)</code> і вважати результат однаковим скрізь? Яким інструментом краще перевіряти припущення про розмір?",
    ],
    adv: true,
  },
  {
    t: "placement new і ручне керування часом життя",
    ch: "Типи користувача й пам'ять",
    easy: "Звичайний <code>new</code> сам шукає вам квартиру й заселяє. Placement new це коли квартира вже ваша, і ви лише вирішуєте, коли заселити мешканця й коли виселити. Квартира від цього нікуди не зникає.",
    p: [
      "Звичайний вираз <code>new T(...)</code> робить дві речі разом: виділяє сиру пам'ять і викликає конструктор. Іноді ці кроки треба розділити. Пул об'єктів виділяє один великий шматок наперед, а потім по черзі створює в ньому об'єкти. Контейнер на кшталт <code>std::vector</code> тримає запас пам'яті, де живе лише частина елементів. У таких випадках пам'ять і <b>час життя об'єкта</b> керуються окремо. Для цього існує <b>placement new</b>: конструювання об'єкта в уже наявній пам'яті.",
      "Синтаксис: <code>new (адреса) T(аргументи)</code>, потрібен заголовок <code>&lt;new&gt;</code>. Вираз нічого не виділяє: він викликає конструктор у вказаному місці й повертає вказівник <code>T*</code>. Модель у голові така: є <i>сховище</i> (байти з адресою) і є <i>об'єкт</i> (значення, яке в цьому сховищі живе). Сховище існує, поки його не повернули системі; об'єкт існує від кінця конструктора до початку деструктора. Раніше вони збігалися, тепер це різні події.",
      "Друга половина історії: знищення. Для об'єкта, створеного через placement new, <code>delete</code> <b>не можна</b>: він спробує звільнити пам'ять, якої не виділяв. Замість цього деструктор викликають явно: <code>p-&gt;~T();</code>. Після цього об'єкта нема, а сховище вільне, і в ньому можна створити наступний об'єкт. Для типів з тривіальним деструктором (<code>int</code>, прості структури) виклик нічого не робить, але для <code>std::string</code> чи класів з ресурсами він обов'язковий, інакше ресурс витече.",
      "Сховище має бути достатнього розміру й <b>вирівняним</b> для типу (це ми вчили в попередньому уроці). Найпростіше оголосити буфер так: <code>alignas(T) unsigned char buf[sizeof(T)];</code>. Це масив байтів, але з вимогою вирівнювання типу <code>T</code>. Без <code>alignas</code> буфер із <code>unsigned char</code> може лежати за адресою, не кратною 8, і об'єкт на ній буде невирівняним, а це вже недозволена поведінка.",
      "Звертаючись до об'єкта пізніше через адресу буфера, зручно мати вказівник, який повернув <code>new</code>: його і зберігайте. Якщо ж вказівник доводиться відновлювати з сирих байтів, у C++17 є <code>std::launder(reinterpret_cast&lt;T*&gt;(buf))</code>, який каже компілятору, що за цією адресою живе новий об'єкт. Це тонка тема; у цьому уроці достатньо запам'ятати, що навколо сирої пам'яті стоїть багато застережень, тому її ховають у невеликому класі.",
      "Пастки. По-перше, забули викликати деструктор: ресурс об'єкта витікає. По-друге, викликали його двічі або на об'єкті, якого не створювали: поведінка недозволена. По-третє, конструктор може кинути виняток: тоді об'єкт не створено, і деструктор викликати не можна, а виділену пам'ять треба повернути. По-четверте, переповнення: пул із фіксованою ємністю мусить сам перевіряти, що місце є, і повідомляти про відмову винятком або кодом помилки.",
      "Ідіома: ніколи не залишайте ручне керування часом життя відкритим по всій програмі. Загорніть його в клас, який у деструкторі сам знищує всі живі об'єкти (RAII із глави про ресурси). Користувач класу бачить лише <code>push</code> і доступ за індексом. У наступному уроці ми зробимо протилежний висновок для звичайних типів: найкраще, коли власних деструкторів і ручних викликів нема зовсім. Це правило нуля.",
    ],
    code: [
      String.raw`#include <iostream>
#include <new>

int main() {
    alignas(int) unsigned char buf[sizeof(int)];
    int* p = new (buf) int(42);
    std::cout << *p << "\n";
    *p += 1;
    std::cout << *p << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
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

    Noisy* a = new (buf) Noisy(1);
    a->hello();
    a->~Noisy();

    Noisy* b = new (buf) Noisy(2);
    b->hello();
    b->~Noisy();
    std::cout << "кінець\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <new>
#include <stdexcept>
#include <string>

class StringArena {
public:
    StringArena() = default;
    StringArena(const StringArena&) = delete;
    StringArena& operator=(const StringArena&) = delete;
    ~StringArena() {
        for (std::size_t i = count_; i > 0; --i) at(i - 1).~basic_string();
    }

    void push(const std::string& s) {
        if (count_ == kCapacity) throw std::length_error("арена заповнена");
        new (slot(count_)) std::string(s);
        ++count_;
    }
    const std::string& get(std::size_t i) const { return *slot(i); }
    std::size_t size() const { return count_; }

private:
    static constexpr std::size_t kCapacity = 3;
    std::string* slot(std::size_t i) const {
        return std::launder(reinterpret_cast<std::string*>(const_cast<unsigned char*>(raw_)) + i);
    }
    std::string& at(std::size_t i) { return *slot(i); }

    alignas(std::string) unsigned char raw_[kCapacity * sizeof(std::string)];
    std::size_t count_ = 0;
};

int main() {
    StringArena arena;
    arena.push("alpha");
    arena.push("beta");
    arena.push("gamma");
    try {
        arena.push("delta");
    } catch (const std::length_error& e) {
        std::cout << "відмова: " << e.what() << "\n";
    }
    for (std::size_t i = 0; i < arena.size(); ++i) std::cout << arena.get(i) << "\n";
    return 0;
}
`,
      String.raw`// аварія: арена переповнена, виняток ніхто не ловить, і програма завершується через terminate
#include <iostream>
#include <new>
#include <stdexcept>

class IntArena {
public:
    int* push(int v) {
        if (count_ == 2) throw std::length_error("арена заповнена");
        int* p = new (raw_ + count_ * sizeof(int)) int(v);
        ++count_;
        return p;
    }

private:
    alignas(int) unsigned char raw_[2 * sizeof(int)];
    int count_ = 0;
};

int main() {
    IntArena arena;
    std::cout << *arena.push(10) << std::endl;
    std::cout << *arena.push(20) << std::endl;
    arena.push(30);
    std::cout << "сюди не дійдемо\n";
    return 0;
}
`,
    ],
    note: "Placement new <code>new (буфер) T(...)</code> створює об'єкт у готовій пам'яті, а знищувати його треба явним <code>p-&gt;~T()</code>, не <code>delete</code>. Буфер має бути достатнього розміру й вирівняний через <code>alignas(T)</code>. Ховайте це в клас з деструктором.",
    work: "Так працюють пули об'єктів, арени, <code>std::vector</code>, <code>std::optional</code> і <code>std::variant</code>: пам'ять і час життя розділені. Високопродуктивний код, вбудовані системи й ігрові рушії використовують це, щоб не звертатися до загальної купи.",
    tasks: [
      "Чому об'єкт, створений через placement new, не можна знищувати через <code>delete</code>? Що треба зробити замість цього?",
      "Навіщо оголошувати буфер як <code>alignas(T) unsigned char buf[sizeof(T)]</code>, а не просто <code>unsigned char buf[sizeof(T)]</code>? Що може піти не так без <code>alignas</code>?",
    ],
    adv: true,
  },
  {
    t: "Правило нуля й проєктування власних типів",
    ch: "Типи користувача й пам'ять",
    easy: "Хороший клас як акуратний орендар: він нічого не ламає й не залишає. Ви доручаєте прибирання професіоналам (вектор, рядок, розумний вказівник), а сам не пишете жодного деструктора й не відповідаєте за копії.",
    p: [
      "У главі ми пройшли довгий шлях: конструктори, деструктори, RAII, правила трьох і п'яти, переміщення. Може здатися, що кожен клас потребує купи спеціальних функцій. Насправді навпаки: найкращий клас не оголошує <b>жодної</b> із цих функцій. Це <b>правило нуля</b> (<i>rule of zero</i>): якщо всі поля класу самі вміють правильно копіюватися, переміщатися й знищуватися, компілятор згенерує всі спеціальні функції сам, і вони будуть правильні.",
      "Модель у голові: власниками ресурсів мають бути <i>спеціалізовані</i> типи, а прикладні класи лише складаються з них. Рядок <code>std::string</code> знає, як копіювати свої символи; <code>std::vector</code> знає, як копіювати й знищувати елементи; <code>std::unique_ptr</code> знає, як звільнити об'єкт і що його не можна копіювати. Клас, у якого поля саме такі, успадковує всю їхню поведінку: копіюється, якщо копіюються поля, переміщується, якщо переміщуються, і знищується правильно.",
      "Правила трьох і п'яти потрібні, лише коли клас <i>сам</i> володіє сирим ресурсом: вказівником з <code>new[]</code>, дескриптором, з'єднанням. Тоді виникає запитання, чи не можна цей ресурс загорнути у стандартний тип. Майже завжди можна: <code>new int[n]</code> замінює <code>std::vector&lt;int&gt;</code>, голий <code>T*</code> замінює <code>std::unique_ptr&lt;T&gt;</code>. Якщо потрібне особливе прибирання, у <code>unique_ptr</code> є <b>власний видалювач</b> (<i>deleter</i>): функтор, який викличеться замість <code>delete</code>. Тоді оболонка над C-ресурсом теж не потребує деструктора.",
      "Побічний ефект: щойно ви оголосили хоч одну зі спеціальних функцій (навіть порожній деструктор), компілятор перестає генерувати інші в звичному вигляді, наприклад переміщення зникає, і об'єкти тихо копіюються повільніше. Тому, якщо потрібна лише діагностика чи віртуальний деструктор, пишіть <code>= default</code> для решти. Але в звичайному типі даних краще не писати нічого.",
      "Тепер про проєктування власного типу загалом. Спершу вирішіть, чи це <b>значення</b> (копіюється, порівнюється, як <code>std::string</code>) чи <b>власник унікального ресурсу</b> (лише переміщується, як <code>unique_ptr</code>). Потім визначте інваріант: що завжди має бути правдою (відсоток від 0 до 100, непорожнє ім'я). Інваріант охороняють приватні поля й конструктор. Якщо інваріанта немає, <code>struct</code> із відкритими полями чесніший і простіший. Конструктори з одним аргументом позначайте <code>explicit</code>, методи, що не змінюють стан, <code>const</code>.",
      "Пастки. Перша: клас із <code>unique_ptr</code> у полі <b>автоматично не копіюється</b>, і це правильно, але виклик копії тоді дасть помилку компіляції; потрібно або переміщувати, або написати явну глибоку копію. Друга: мішанина сирих вказівників-власників і стандартних типів в одному класі знову вимагає правила п'яти. Третя: перевірка інваріанта лише в одному конструкторі, коли методи можуть його порушити, тому охороняйте його у всіх місцях запису.",
      "Резюме глави: структури й класи задають форму даних, конструктори й деструктори керують часом життя, RAII і розумні вказівники беруть на себе ресурси, а правило нуля каже, що в підсумку вам майже нічого не доведеться писати вручну. Далі курс переходить до шаблонів і стандартної бібліотеки, де всі ці типи працюватимуть у контейнерах і алгоритмах.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <utility>
#include <vector>

struct Profile {
    std::string name;
    std::vector<std::string> tags;
};

int main() {
    Profile a{"Олена", {"c++", "linux"}};
    Profile b = a;
    b.tags.push_back("go");
    std::cout << a.tags.size() << " " << b.tags.size() << "\n";

    Profile c = std::move(b);
    std::cout << c.name << " " << c.tags.size() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <string>
#include <type_traits>
#include <vector>

struct Profile {
    std::string name;
    std::vector<int> scores;
};

struct Owner {
    std::unique_ptr<int> value;
};

int main() {
    std::cout << std::boolalpha;
    std::cout << "Profile копіюється: " << std::is_copy_constructible_v<Profile> << "\n";
    std::cout << "Profile переміщується без винятків: " << std::is_nothrow_move_constructible_v<Profile> << "\n";
    std::cout << "Owner копіюється: " << std::is_copy_constructible_v<Owner> << "\n";
    std::cout << "Owner переміщується: " << std::is_move_constructible_v<Owner> << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: Owner містить unique_ptr, тому згенерована копія видалена
#include <iostream>
#include <memory>

struct Owner {
    std::unique_ptr<int> value;
};

int main() {
    Owner a{std::make_unique<int>(5)};
    Owner b = a;
    std::cout << *b.value << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <utility>

struct Handle {
    int id;
};

struct HandleCloser {
    void operator()(Handle* h) const {
        std::cout << "close " << h->id << "\n";
        delete h;
    }
};

class Session {
public:
    explicit Session(int id) : h_(new Handle{id}) {
        std::cout << "open " << id << "\n";
    }
    int id() const { return h_->id; }

private:
    std::unique_ptr<Handle, HandleCloser> h_;
};

int main() {
    Session a(1);
    Session b = std::move(a);
    std::cout << "активна сесія " << b.id() << "\n";
    return 0;
}
`,
    ],
    note: "Правило нуля: якщо всі поля самі керують собою (<code>string</code>, <code>vector</code>, <code>unique_ptr</code>), не оголошуйте ні деструктор, ні копіювання, ні переміщення. Сирий ресурс загортайте в стандартний тип, а не в ручні п'ять функцій.",
    work: "У сучасних кодових базах переважна більшість класів дотримується правила нуля: це менше коду, менше помилок і вільні переміщення. Ручні п'ять функцій лишаються в низькорівневих обгортках, а в решті коду користуються <code>vector</code> і <code>unique_ptr</code> з видалювачем.",
    tasks: [
      "Клас має поля <code>std::string</code> і <code>std::vector&lt;int&gt;</code>. Чи потрібні йому власний деструктор і копіювання? Поясніть, чому.",
      "Як загорнути C-ресурс, що закривається особливою функцією, у клас так, щоб не писати деструктор? Який наслідок для копіювання такого класу?",
    ],
    adv: true,
  },
  // @@END
];
