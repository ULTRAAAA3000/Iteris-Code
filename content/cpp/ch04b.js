export const LESSONS_04b = [
  {
    t: "RAII: час життя об'єкта як інструмент",
    ch: "Типи користувача й пам'ять",
    easy: "RAII це готель із автоматичним замком: коли ви заселяєтесь, кімната ваша, а коли виходите, замок сам закривається й ключ повертається на ресепшен. Забути здати номер неможливо, навіть якщо ви вибігли посеред ночі.",
    p: [
      "У минулому уроці ми бачили, що ручні пари <code>new</code> та <code>delete</code> крихкі: достатньо раннього <code>return</code> або винятку між ними, і ресурс витікає. Те саме стосується не лише пам'яті: відкритий файл, захоплений м'ютекс, з'єднання з базою теж треба обов'язково віддати назад. C++ вирішує це не «дисципліною», а механізмом мови. Він має назву <b>RAII</b> (Resource Acquisition Is Initialization): ресурс захоплюється в конструкторі об'єкта й звільняється в його деструкторі.",
      "Модель у голові: деструктор викликається <b>автоматично й гарантовано</b>, коли об'єкт із автоматичним часом життя (звичайна локальна змінна) залишає свою область видимості. Не має значення, як саме ви вийшли: дійшли до закривальної дужки, зробили <code>return</code>, <code>break</code> чи кинули виняток. Якщо в одному блоці кілька об'єктів, вони знищуються у <b>зворотному порядку</b> створення: останній створений іде першим, як стос тарілок.",
      "Отже, час життя об'єкта стає інструментом. Хочете, щоб щось відбулося в кінці блоку, що б там не було, покладіть це в деструктор локального об'єкта. Саме так працюють <code>std::lock_guard</code> (розблокує м'ютекс), <code>std::ifstream</code> (закриє файл), <code>std::vector</code> (звільнить масив) і розумні вказівники з наступних уроків. Вам майже ніколи не доведеться писати <code>delete</code> чи <code>unlock</code> руками.",
      "Власний захисник пишуть так: конструктор бере ресурс, деструктор віддає, а копіювання забороняють (<code>= delete</code>). Заборона потрібна, бо два об'єкти-копії після виходу зі scope звільнили б один і той самий ресурс двічі. Так само потрібен лише <b>один власник</b>: RAII-об'єкт це власник ресурсу, і власників не має бути двоє. Докладно про копіювання ми поговоримо в уроці про правила трьох і п'яти.",
      "Ідіоми. Захоплюйте ресурс <b>у тому ж рядку</b>, де створюєте об'єкт: <code>std::lock_guard&lt;std::mutex&gt; lock(m);</code>, а не окремо «заблокувати» і «розблокувати». Обмежуйте життя об'єкта додатковими фігурними дужками, якщо ресурс потрібен лише на частину функції: деструктор спрацює на закритті блоку. Давайте об'єктам імена: <code>std::lock_guard&lt;std::mutex&gt;(m);</code> без імені створить тимчасовий об'єкт, який знищиться в тому ж рядку.",
      "Пастки. Деструктор не повинен кидати винятків: якщо він кине під час розмотування стека від іншого винятку, програма негайно завершиться. Не повертайте з функції посилання чи вказівник на локальний RAII-об'єкт, бо після виходу він уже знищений. Не забувайте, що поле-вказівник усередині класу саме не звільняється: RAII працює тільки тому, що деструктор, який ви написали (або який написав стандартний клас), це робить. І пам'ятайте: об'єкти в купі (<code>new</code>) RAII не дістають, їхній деструктор викликається лише через <code>delete</code>.",
      "RAII це найважливіша ідіома C++, і решта глави на ній стоїть. Тепер питання лише в тому, як зробити так, щоб сама динамічна пам'ять теж ховалася в об'єкті-власнику, і не доводилося писати <code>delete</code>. Для цього в стандартній бібліотеці є <code>std::unique_ptr</code>: це той самий захисник, але для пам'яті з купи. Про нього наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <utility>

class Tracer {
public:
    explicit Tracer(std::string name) : name_(std::move(name)) {
        std::cout << "+ " << name_ << "\n";
    }
    ~Tracer() { std::cout << "- " << name_ << "\n"; }

private:
    std::string name_;
};

int main() {
    std::cout << "start\n";
    {
        Tracer a("A");
        Tracer b("B");
        std::cout << "робота\n";
    }
    std::cout << "кінець\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>
#include <string>

class Guard {
public:
    explicit Guard(const char* name) : name_(name) {
        std::cout << "acquire " << name_ << "\n";
    }
    ~Guard() { std::cout << "release " << name_ << "\n"; }
    Guard(const Guard&) = delete;
    Guard& operator=(const Guard&) = delete;

private:
    std::string name_;
};

int process(int x) {
    Guard g("db");
    if (x < 0) {
        std::cout << "негативне\n";
        return -1;
    }
    if (x == 0) {
        throw std::runtime_error("нуль");
    }
    return x * 2;
}

int main() {
    int r = process(5);
    std::cout << "результат " << r << "\n";
    r = process(-1);
    std::cout << "результат " << r << "\n";
    try {
        process(0);
    } catch (const std::exception& e) {
        std::cout << "виняток: " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <string>
#include <vector>

std::mutex logMutex;
std::vector<std::string> lines;

void log(const std::string& text) {
    std::lock_guard<std::mutex> lock(logMutex);
    lines.push_back(text);
}

class Section {
public:
    explicit Section(std::string name) : name_(std::move(name)) {
        log("enter " + name_);
    }
    ~Section() { log("leave " + name_); }

private:
    std::string name_;
};

void load() {
    Section s("load");
    log("читаємо дані");
}

int main() {
    {
        Section outer("main");
        load();
        {
            Section inner("save");
            log("пишемо дані");
        }
    }
    for (const std::string& line : lines) {
        std::cout << line << "\n";
    }
    return 0;
}
`,
      String.raw`// не компілюється: копіювати Guard заборонено (= delete), інакше два об'єкти звільнили б один ресурс
#include <iostream>

class Guard {
public:
    Guard() { std::cout << "acquire\n"; }
    ~Guard() { std::cout << "release\n"; }
    Guard(const Guard&) = delete;
    Guard& operator=(const Guard&) = delete;
};

int main() {
    Guard a;
    Guard b = a;
    return 0;
}
`,
    ],
    note: "Захоплюйте ресурс у конструкторі, віддавайте в деструкторі, а об'єкт робіть локальною змінною з іменем. Деструктор спрацює завжди: при виході з блоку, <code>return</code> і винятку. Копіювання ресурсного класу забороняйте.",
    work: "RAII у щоденній роботі це <code>lock_guard</code> для м'ютексів, файлові потоки, контейнери, розумні вказівники й власні обгортки над дескрипторами та з'єднаннями. Саме тому код на C++ без <code>finally</code> та <code>defer</code> не губить ресурси.",
    tasks: [
      "Напишіть клас <code>Scope</code>, який у конструкторі друкує <code>begin</code>, а в деструкторі <code>end</code>. Створіть два такі об'єкти в одному блоці й передбачте порядок виводу.",
      "Чому RAII-об'єкт не можна просто копіювати? Що станеться, якщо два об'єкти після виходу зі scope звільнять один дескриптор?",
    ],
  },
  {
    t: "unique_ptr: єдиний власник",
    ch: "Типи користувача й пам'ять",
    easy: "Унікальний вказівник це єдиний ключ від квартири: він є тільки в одного власника. Можна передати ключ комусь іншому, але не можна зробити копію. Коли власник іде й нікому не передав ключ, квартиру прибирають.",
    p: [
      "Ручні <code>new</code> та <code>delete</code> легко зламати, а RAII вчить, що звільнення мусить робити деструктор. Стандартна бібліотека вже містить такий захисник для пам'яті з купи: <code>std::unique_ptr</code> з заголовка <code>&lt;memory&gt;</code>. Це об'єкт, який <b>володіє</b> динамічною пам'яттю й видаляє її у власному деструкторі. Тож замість «new і не забути delete» ви пишете один рядок, і пам'ять повертається сама.",
      "Створюють його через <code>std::make_unique&lt;T&gt;(аргументи)</code>: <code>auto w = std::make_unique&lt;Widget&gt;(1);</code>. Користуються як звичайним вказівником: <code>*w</code> дає об'єкт, <code>w-&gt;поле</code> звертається до члена. Порожній вказівник це <code>nullptr</code>, а перевірка <code>if (w)</code> каже, чи є в ньому щось. Пам'ять звільниться, коли <code>w</code> вийде зі scope, або коли ви викличете <code>w.reset()</code>.",
      "Головна властивість у назві: власник <b>єдиний</b>. Копіювати <code>unique_ptr</code> не можна: компілятор це забороняє, бо інакше два власники видалили б один блок двічі. Натомість володіння можна <b>передати</b>: <code>auto b = std::move(a);</code>. Слово <code>std::move</code> тут лише позначка «віддаю», докладно про нього в уроці про переміщення. Після передачі <code>a</code> гарантовано порожній (<code>nullptr</code>), а <code>b</code> володіє об'єктом.",
      "Це відкриває дві корисні ідіоми. Перша: функція-фабрика повертає <code>unique_ptr</code> за значенням, і власність природно переходить до того, хто викликав: <code>auto w = make();</code> без жодного <code>move</code>. Друга: функція, що має <b>забрати</b> власність, приймає <code>unique_ptr</code> за значенням, і викликач явно пише <code>std::move</code>. Якщо функція лише користується об'єктом, давайте їй звичайне посилання чи сирий вказівник, <code>w.get()</code>: вона не власник.",
      "<code>unique_ptr</code> працює й із масивами: <code>std::make_unique&lt;int[]&gt;(5)</code> створює п'ять нулів, а <code>a[i]</code> звертається до елемента. Його можна класти у <code>std::vector&lt;std::unique_ptr&lt;T&gt;&gt;</code>: вектор стає власником усіх об'єктів, і при його знищенні вони видаляться. Але у вектор його передають лише через <code>push_back(std::make_unique&lt;T&gt;(…))</code> або <code>move</code>, бо копіювати елементи не можна. Цикл за такими елементами треба писати з посиланням: <code>for (const auto&amp; p : v)</code>.",
      "Пастки. Не створюйте два <code>unique_ptr</code> з одного сирого вказівника (<code>unique_ptr&lt;int&gt; a(p), b(p);</code>): кожен спробує видалити, і це UB. Не викликайте <code>release()</code>, якщо не збираєтесь руками знищити пам'ять: він віддає власність і ніхто її вже не звільнить. Не робіть <code>delete w.get()</code>. І не користуйтеся «<code>*w</code>» на порожньому <code>unique_ptr</code>: спершу перевіряйте <code>if (w)</code>.",
      "Правило практики: у сучасному C++ за замовчуванням створюйте об'єкти або на стеку, або через <code>make_unique</code>, і <code>new</code> з <code>delete</code> руками майже не пишуть. Накладні витрати нульові, це той самий вказівник у обгортці. Але що робити, якщо власників справді кілька, як у кеші чи графі? Для цього є <code>shared_ptr</code>, наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <memory>

struct Widget {
    explicit Widget(int id) : id_(id) { std::cout << "створено " << id_ << "\n"; }
    ~Widget() { std::cout << "знищено " << id_ << "\n"; }
    int id_;
};

int main() {
    auto w = std::make_unique<Widget>(1);
    std::cout << "id = " << w->id_ << ", " << (*w).id_ << "\n";

    w.reset();
    std::cout << "після reset: " << (w ? "є" : "порожній") << "\n";

    auto w2 = std::make_unique<Widget>(2);
    std::cout << "кінець main\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

struct Document {
    explicit Document(std::string title) : title_(std::move(title)) {}
    ~Document() { std::cout << "закрито " << title_ << "\n"; }
    std::string title_;
};

std::unique_ptr<Document> open(const std::string& title) {
    return std::make_unique<Document>(title);
}

void archive(std::unique_ptr<Document> doc) {
    std::cout << "архівуємо " << doc->title_ << "\n";
}

void show(const Document& doc) {
    std::cout << "дивимось " << doc.title_ << "\n";
}

int main() {
    auto a = open("звіт");
    show(*a);

    auto b = std::move(a);
    std::cout << "a " << (a ? "має" : "не має") << " документ\n";
    std::cout << "b " << (b ? "має" : "не має") << " документ\n";

    archive(std::move(b));
    std::cout << "після archive\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <vector>

struct Item {
    explicit Item(int id) : id_(id) {}
    ~Item() { std::cout << "видалено " << id_ << "\n"; }
    int id_;
};

int main() {
    std::vector<std::unique_ptr<Item>> items;
    items.push_back(std::make_unique<Item>(1));
    items.push_back(std::make_unique<Item>(2));
    items.push_back(std::make_unique<Item>(3));

    for (const auto& p : items) {
        std::cout << "item " << p->id_ << "\n";
    }

    items.erase(items.begin());
    std::cout << "лишилось " << items.size() << "\n";

    auto arr = std::make_unique<int[]>(4);
    for (int i = 0; i < 4; ++i) {
        arr[i] = i * i;
    }
    std::cout << "arr[3] = " << arr[3] << "\n";

    Item* raw = items[0].get();
    std::cout << "сирий вказівник: " << raw->id_ << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: unique_ptr не копіюється, власність передають через std::move
#include <iostream>
#include <memory>

int main() {
    auto a = std::make_unique<int>(7);
    auto b = a;
    std::cout << *b << "\n";
    return 0;
}
`,
    ],
    note: "Створюйте об'єкти через <code>std::make_unique</code>, і пам'ять звільниться сама. Копіювати <code>unique_ptr</code> не можна, передавати власність можна через <code>std::move</code>: після цього джерело порожнє. Функції без власності беруть посилання або <code>get()</code>.",
    work: "<code>unique_ptr</code> це стандартний спосіб тримати об'єкти в купі: фабрики, поля класів із необов'язковими компонентами, вектори об'єктів різних типів, «pimpl». Витоків і подвійних видалень він просто не допускає.",
    tasks: [
      "Створіть <code>unique_ptr&lt;int&gt;</code> зі значенням 5, передайте власність другому змінному через <code>std::move</code> і виведіть, чи порожній перший.",
      "Чому функція, яка лише читає об'єкт, не повинна приймати <code>unique_ptr</code> за значенням? Що вона має приймати замість нього?",
    ],
  },
  {
    t: "shared_ptr і weak_ptr: спільне володіння",
    ch: "Типи користувача й пам'ять",
    easy: "Спільний вказівник це світло в коридорі з кількома мешканцями: поки хоч один тримає вимикач увімкненим, воно горить, а коли останній виходить, гасне. Слабкий вказівник лише дивиться на світло й не змушує його горіти.",
    p: [
      "Іноді об'єкт справді мають кілька власників, і ніхто з них не знає заздалегідь, хто піде останнім: кеш і клієнти, що ним користуються, вузол графа і його сусіди, налаштування, які читають кілька модулів. Для цього є <code>std::shared_ptr</code>. Він теж RAII-обгортка над пам'яттю, але <b>копіюється</b>, і об'єкт видаляється тоді, коли знищено або скинуто <i>останній</i> спільний власник.",
      "Усередині живе <b>лічильник посилань</b>: кожна копія <code>shared_ptr</code> збільшує його, кожне знищення зменшує, а при нулі об'єкт видаляється. Дізнатися лічильник можна викликом <code>p.use_count()</code>. Створюйте спільні вказівники через <code>std::make_shared&lt;T&gt;(аргументи)</code>: це швидше за окремий <code>new</code> і безпечніше. Користуються ним так само, як <code>unique_ptr</code>: <code>*p</code>, <code>p-&gt;поле</code>, <code>if (p)</code>.",
      "Лічильник має ціну: збільшення й зменшення атомарні, тому <code>shared_ptr</code> повільніший за <code>unique_ptr</code>, а ще робить час життя об'єкта менш очевидним. Тому правило: за замовчуванням <code>unique_ptr</code>, а <code>shared_ptr</code> беріть, коли спільне володіння справді потрібне за задачею. Якщо функція лише використовує об'єкт, передавайте їй <code>const T&amp;</code> чи сирий вказівник, а не копію <code>shared_ptr</code>.",
      "Головна біда спільного володіння це <b>цикл</b>. Якщо A тримає <code>shared_ptr</code> на B, а B тримає <code>shared_ptr</code> на A, то після зникнення зовнішніх посилань лічильники лишаються по одиниці: вони підтримують один одного, і жоден об'єкт ніколи не видалиться. Це витік, і компілятор його не помітить. Виправлення: одне з посилань робимо <b>слабким</b>.",
      "<code>std::weak_ptr</code> спостерігає за об'єктом, але не володіє ним і лічильник не збільшує. Створюють його з <code>shared_ptr</code>: <code>std::weak_ptr&lt;T&gt; w = p;</code>. Щоб скористатися об'єктом, викличте <code>w.lock()</code>: він повертає <code>shared_ptr</code>, який або вказує на живий об'єкт, або порожній, якщо об'єкт уже видалено. Перевірка <code>w.expired()</code> теж є, але надійніше брати <code>lock()</code> і відразу перевіряти результат. Типове застосування: батьківське посилання в дереві, спостерігачі, кеші.",
      "Пастки. Не створюйте два незалежних <code>shared_ptr</code> із одного сирого вказівника: у них будуть різні лічильники й подвійне видалення. Завжди копіюйте вже наявний <code>shared_ptr</code>. Не робіть кільцевих посилань без <code>weak_ptr</code>. Конструювання <code>shared_ptr</code> із простроченого <code>weak_ptr</code> (<code>std::shared_ptr&lt;T&gt; s(w);</code>) кидає виняток <code>std::bad_weak_ptr</code>, тому для перевірки користуйтеся <code>lock()</code>.",
      "Тепер ми вміємо тримати ресурси в об'єктах: сам клас-власник (RAII), єдиний вказівник і спільний. Лишається питання, що відбувається, коли такий об'єкт копіюють: хто володітиме ресурсом після копії? Це правила трьох і п'яти, наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <memory>

int main() {
    auto a = std::make_shared<int>(42);
    std::cout << "use_count = " << a.use_count() << "\n";
    {
        std::shared_ptr<int> b = a;
        std::shared_ptr<int> c = b;
        std::cout << "use_count = " << a.use_count() << ", значення " << *c << "\n";
    }
    std::cout << "use_count = " << a.use_count() << "\n";

    std::shared_ptr<int> d = a;
    a.reset();
    std::cout << "після reset a: d = " << *d << ", use_count = " << d.use_count() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>
#include <vector>

struct Config {
    explicit Config(std::string name) : name_(std::move(name)) {}
    ~Config() { std::cout << "конфіг " << name_ << " знищено\n"; }
    std::string name_;
};

struct Service {
    Service(std::string id, std::shared_ptr<Config> cfg) : id_(std::move(id)), cfg_(std::move(cfg)) {}
    std::string id_;
    std::shared_ptr<Config> cfg_;
};

int main() {
    auto cfg = std::make_shared<Config>("prod");
    {
        std::vector<Service> services;
        services.emplace_back("api", cfg);
        services.emplace_back("worker", cfg);
        std::cout << "власників: " << cfg.use_count() << "\n";
    }
    std::cout << "сервіси знищено, власників: " << cfg.use_count() << "\n";
    cfg.reset();
    std::cout << "кінець\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>

int nodes = 0, parents = 0, children = 0;

struct Node {
    Node() { ++nodes; }
    ~Node() { --nodes; }
    std::shared_ptr<Node> next;
};

struct Child;
struct Parent {
    Parent() { ++parents; }
    ~Parent() { --parents; }
    std::shared_ptr<Child> child;
};
struct Child {
    Child() { ++children; }
    ~Child() { --children; }
    std::weak_ptr<Parent> parent;
};

int main() {
    {
        auto a = std::make_shared<Node>();
        auto b = std::make_shared<Node>();
        a->next = b;
        b->next = a;
    }
    std::cout << "цикл shared_ptr, живих вузлів: " << nodes << "\n";

    {
        auto p = std::make_shared<Parent>();
        p->child = std::make_shared<Child>();
        p->child->parent = p;
        std::cout << "parent use_count = " << p.use_count() << "\n";
    }
    std::cout << "з weak_ptr: " << parents << " і " << children << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>

void report(const std::weak_ptr<int>& w) {
    if (auto s = w.lock()) {
        std::cout << "живий: " << *s << "\n";
    } else {
        std::cout << "об'єкт уже знищено\n";
    }
}

int main() {
    std::weak_ptr<int> w;
    {
        auto s = std::make_shared<int>(10);
        w = s;
        std::cout << "use_count = " << s.use_count() << "\n";
        report(w);
    }
    std::cout << "expired: " << w.expired() << "\n";
    report(w);
    return 0;
}
`,
      String.raw`// аварія: shared_ptr, створений із простроченого weak_ptr, кидає std::bad_weak_ptr, а виняток ніхто не ловить
#include <iostream>
#include <memory>

int main() {
    std::weak_ptr<int> w;
    {
        auto s = std::make_shared<int>(1);
        w = s;
    }
    std::cout << "перед створенням\n";
    std::shared_ptr<int> again(w);
    std::cout << *again << "\n";
    return 0;
}
`,
    ],
    note: "<code>shared_ptr</code> рахує власників і видаляє об'єкт, коли лишається нуль. Береться лише тоді, коли спільне володіння справді потрібне. Щоб розірвати цикл і просто стежити за об'єктом, тримайте <code>weak_ptr</code> і перевіряйте <code>lock()</code>.",
    work: "Спільні вказівники трапляються в кешах, графах, деревах із батьківськими посиланнями, обробниках подій і колбеках, що живуть довше за викликача. <code>weak_ptr</code> там захищає від витоків через цикли.",
    tasks: [
      "Створіть <code>make_shared&lt;int&gt;(5)</code>, зробіть дві копії й виведіть <code>use_count</code> до і після виходу копій зі scope.",
      "Два об'єкти тримають один одного через <code>shared_ptr</code>. Чому вони не видаляються? Яке одне посилання треба замінити і на що?",
    ],
  },
  {
    t: "Правила трьох і п'яти: копіювання об'єктів",
    ch: "Типи користувача й пам'ять",
    easy: "Копіювати об'єкт з ресурсом це як копіювати ключ від сейфа. Мілка копія дає два ключі від одного сейфа, і закрити його захочуть двічі. Глибока копія виготовляє другий сейф зі своїм ключем.",
    p: [
      "Коли ви пишете <code>Noisy b = a;</code> або передаєте об'єкт у функцію за значенням, компілятор створює копію. Для звичайних структур це просто: поля копіюються одне за одним. Але якщо клас володіє ресурсом, наприклад масивом із купи, поштовий вказівник теж скопіюється як число. Тоді два об'єкти вказують на <b>один і той самий</b> масив, і коли обидва знищаться, деструктори звільнять його двічі. Це подвійне видалення, один із найгірших багів у C++. Тому копіювання треба продумати свідомо.",
      "Модель у голові: у класі є три «особливі» операції, пов'язані з життям об'єкта. <b>Деструктор</b> звільняє ресурс. <b>Конструктор копіювання</b> <code>T(const T&amp;)</code> створює новий об'єкт із наявного. <b>Копіювальне присвоєння</b> <code>T&amp; operator=(const T&amp;)</code> перезаписує вже наявний об'єкт. Якщо ви власноруч написали хоча б одну з цих трьох, майже напевно потрібні всі три: це <b>правило трьох</b>. Причина проста: потреба в нестандартному деструкторі означає, що клас щось тримає, а отже стандартне поелементне копіювання для нього хибне.",
      "Конструктор копіювання робить <b>глибоку копію</b>: виділяє власну пам'ять і переписує туди дані. Присвоєнню складніше, бо об'єкт уже володіє старим ресурсом. Безпечний порядок такий: перевірити самоприсвоєння <code>this != &amp;other</code>, виділити нову пам'ять, скопіювати дані, і лише потім звільнити стару та підмінити вказівник. Тоді навіть якщо виділення пам'яті кине виняток, старий стан об'єкта лишається цілим. Саме порядок «спершу нове, потім видалити старе» і є головним у присвоєнні.",
      "Із приходом переміщення (його розбираємо в наступному уроці) правило розширилося до <b>правила п'яти</b>: до трьох операцій додаються <b>конструктор переміщення</b> і <b>переміщувальне присвоєння</b>. Якщо ви визначаєте будь-яку зі п'яти, свідомо визначте або заборонте решту (<code>= default</code>, <code>= delete</code>). А найкраще правило це <b>правило нуля</b>: якщо кожне поле класу саме вміє правильно копіюватися й знищуватися (<code>std::string</code>, <code>std::vector</code>, розумні вказівники), не пишіть жодної з п'яти операцій. Компілятор згенерує коректні.",
      "Ідіоми. Хочете клас, який володіє ресурсом? Спершу спробуйте обгорнути ресурс у <code>std::vector</code> чи <code>std::unique_ptr</code> і лишитися на правилі нуля. Не хочете, щоб об'єкт копіювався (з'єднання, м'ютекс)? Явно напишіть <code>= delete</code>: тоді спроба копіювання дасть помилку компіляції, а не тихий баг. Передавайте об'єкти у функції за <code>const T&amp;</code>, і копія взагалі не знадобиться: найдешевше копіювання те, якого немає.",
      "Пастки. Деструктор є, а копіювання не написане: компілятор усе одно згенерує поверхневу копію, і вийде подвійне видалення. Присвоєння без перевірки <code>this != &amp;other</code>: у разі <code>a = a;</code> ви спершу видалите власні дані, а потім копіюватимете з уже видаленого. Копіювання лише частини полів, коли в клас додали нове поле, а конструктор копіювання не оновили. Кожна така помилка збирається без попередження й ламає програму лише під час виконання, тому її так важко знайти.",
      "Отже, ми вміємо робити копії безпечними, але глибока копія дорога: для великого буфера це виділення пам'яті й переписування всіх байтів. Часто копія зайва: об'єкт тимчасовий і зараз зникне, тож його ресурс можна просто забрати. Саме це робить семантика переміщення, і вона в наступному уроці.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <utility>

class Noisy {
public:
    explicit Noisy(std::string name) : name_(std::move(name)) {
        std::cout << "створено " << name_ << "\n";
    }
    Noisy(const Noisy& other) : name_(other.name_ + "-копія") {
        std::cout << "копія з " << other.name_ << "\n";
    }
    ~Noisy() { std::cout << "знищено " << name_ << "\n"; }

private:
    std::string name_;
};

void take(Noisy n) {
    std::cout << "у функції\n";
}

int main() {
    Noisy a("a");
    Noisy b = a;
    take(a);
    std::cout << "кінець main\n";
    return 0;
}
`,
      String.raw`#include <algorithm>
#include <cstddef>
#include <iostream>

class IntArray {
public:
    explicit IntArray(std::size_t n) : size_(n), data_(new int[n]()) {}
    IntArray(const IntArray& other) : size_(other.size_), data_(new int[other.size_]) {
        std::copy(other.data_, other.data_ + size_, data_);
    }
    IntArray& operator=(const IntArray& other) {
        if (this != &other) {
            int* fresh = new int[other.size_];
            std::copy(other.data_, other.data_ + other.size_, fresh);
            delete[] data_;
            data_ = fresh;
            size_ = other.size_;
        }
        return *this;
    }
    ~IntArray() { delete[] data_; }

    void set(std::size_t i, int v) { data_[i] = v; }
    int get(std::size_t i) const { return data_[i]; }
    std::size_t size() const { return size_; }

private:
    std::size_t size_;
    int* data_;
};

int main() {
    IntArray a(3);
    a.set(0, 10);
    IntArray b = a;
    b.set(0, 99);
    std::cout << "a[0] = " << a.get(0) << ", b[0] = " << b.get(0) << "\n";

    IntArray c(1);
    c = a;
    c = c;
    std::cout << "c: розмір " << c.size() << ", c[0] = " << c.get(0) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <vector>

struct Profile {
    std::string name;
    std::vector<int> scores;
};

int main() {
    Profile a{"Ада", {5, 4}};
    Profile b = a;
    b.name = "Грейс";
    b.scores.push_back(3);

    std::cout << a.name << ": " << a.scores.size() << " оцінки\n";
    std::cout << b.name << ": " << b.scores.size() << " оцінки\n";

    Profile c{};
    c = b;
    std::cout << c.name << ": " << c.scores.back() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <string>

class Document {
public:
    explicit Document(std::string text) : body_(std::make_unique<std::string>(std::move(text))) {}
    Document(const Document& other) : body_(std::make_unique<std::string>(*other.body_)) {}
    Document& operator=(const Document& other) {
        if (this != &other) {
            body_ = std::make_unique<std::string>(*other.body_);
        }
        return *this;
    }

    void append(const std::string& more) { *body_ += more; }
    const std::string& text() const { return *body_; }

private:
    std::unique_ptr<std::string> body_;
};

int main() {
    Document original("Чернетка");
    Document copy = original;
    copy.append(" (правка)");
    std::cout << original.text() << "\n";
    std::cout << copy.text() << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: копіювання заборонено (= delete), а передача за значенням його вимагає
#include <iostream>

class Connection {
public:
    Connection() = default;
    Connection(const Connection&) = delete;
    Connection& operator=(const Connection&) = delete;
};

void use(Connection c) {
    std::cout << "використовуємо\n";
}

int main() {
    Connection conn;
    use(conn);
    return 0;
}
`,
    ],
    note: "Власний деструктор означає, що потрібне й власне копіювання: правило трьох. Присвоєння спершу створює нове, потім звільняє старе. Найкраще правило нуля: тримайте ресурси у <code>vector</code>, <code>string</code> і розумних вказівниках, і нічого не пишіть.",
    work: "Правило трьох і п'яти пояснює, чому класи-обгортки над дескрипторами, буферами й з'єднаннями або забороняють копіювання, або копіюють глибоко. У коді-рев'ю це перше питання до будь-якого класу з деструктором.",
    tasks: [
      "У класі є деструктор із <code>delete[]</code>, але немає конструктора копіювання. Що станеться після <code>A b = a;</code> і виходу обох об'єктів зі scope?",
      "Чому в копіювальному присвоєнні перевіряють <code>this != &amp;other</code> і чому нову пам'ять виділяють до видалення старої?",
    ],
  },
  {
    t: "Семантика переміщення й std::move",
    ch: "Типи користувача й пам'ять",
    easy: "Копіювати книгу це віддати її в копіцентр і повернутися з двома примірниками. Перемістити книгу це просто передати її з рук у руки: примірник один, тепер він у нового власника, а старий лишився з порожніми руками.",
    p: [
      "Попередній урок закінчився проблемою: глибока копія дорога. Але нерідко копіювати зайве: ви повертаєте з функції локальний вектор, кладете в контейнер тимчасовий рядок, передаєте об'єкт, який далі не знадобиться. Старий об'єкт зараз зникне, тож замість копіювання вмісту можна просто <b>забрати його внутрішній ресурс</b>: перекинути вказівник на буфер і обнулити джерело. Це <b>переміщення</b>, і воно коштує кілька присвоєнь вказівників замість виділення й копіювання пам'яті.",
      "Щоб компілятор розрізнив «копіюй» і «забирай», у C++ є <b>rvalue-посилання</b> <code>T&amp;&amp;</code>. Воно прив'язується до тимчасових значень, тобто таких, що не мають імені й зараз зникнуть. Конструктор переміщення має сигнатуру <code>T(T&amp;&amp; other) noexcept</code>, переміщувальне присвоєння: <code>T&amp; operator=(T&amp;&amp; other) noexcept</code>. Слово <code>noexcept</code> важливе: контейнери, як-от <code>vector</code>, при зростанні переміщують елементи лише тоді, коли переміщення гарантовано не кидає винятків.",
      "А як змусити компілятор перемістити об'єкт, який має ім'я? Для цього є <code>std::move(x)</code>. Попри назву, він нічого не переміщує, а лише <b>дозволяє</b> переміщення: перетворює <code>x</code> на rvalue, і тоді викликається конструктор переміщення, якщо він є. Якщо ж переміщення в класу немає (або об'єкт <code>const</code>), мовчки спрацює звичайне копіювання, тож не очікуйте виграшу там, де його не передбачено.",
      "Що з об'єктом після переміщення? Він лишається в <b>коректному, але невизначеному стані</b>: його можна знищити, можна присвоїти йому нове значення, але покладатися на його вміст не можна. Стандартні типи зазвичай стають порожніми, проте гарантії щодо точного вмісту немає. Власні класи ви пишете самі, тому домовляйтеся: після переміщення джерело порожнє (вказівник <code>nullptr</code>, розмір нуль), і деструктор над ним безпечний. Тоді <code>delete[]</code> на <code>nullptr</code> нічого не робить.",
      "Ідіоми. Повертайте локальні змінні з функції просто через <code>return v;</code>: компілятор або взагалі не створить копії (<b>RVO</b>), або перемістить. Писати <code>return std::move(v);</code> не треба, це навіть шкодить. Приймаючи рядок, який збираєтеся зберегти, беріть його <b>за значенням</b> і переміщуйте в поле: <code>Person(std::string name) : name_(std::move(name)) {}</code>. Тоді й тимчасове значення, і копія коштують мінімум. А <code>std::unique_ptr</code> з минулих уроків саме тому лише переміщується: копіювати єдиного власника не можна.",
      "Пастки. Після <code>std::move(x)</code> не користуйтеся значенням <code>x</code>: присвоювати нове можна, читати старий вміст ні. <code>std::move</code> на <code>const</code>-об'єкті дає копіювання, а не переміщення. Забутий <code>noexcept</code> у переміщенні змусить <code>vector</code> копіювати елементи при зростанні. І нарешті, <code>std::move</code> не звільняє пам'ять і не знищує об'єкт: це лише привід для іншого коду забрати ресурс.",
      "Тепер ви знаєте весь життєвий цикл об'єкта: створення, копіювання, переміщення, знищення. Лишилося опанувати дрібніші, але звичні речі класів: перелічення, які не змішуються з числами, і дані, спільні для всього класу, а не для окремого об'єкта. Про це наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <utility>
#include <vector>

int main() {
    std::string a = "довгий рядок, який не хочеться копіювати щоразу, коли він змінює власника";
    std::string b = a;
    std::string c = std::move(a);
    std::cout << (b == c ? "b і c однакові" : "різні") << "\n";

    a = "новий вміст";
    std::cout << a << "\n";

    std::vector<int> v1{1, 2, 3};
    std::vector<int> v2 = std::move(v1);
    v1.clear();
    std::cout << "v1: " << v1.size() << ", v2: " << v2.size() << "\n";
    return 0;
}
`,
      String.raw`#include <algorithm>
#include <cstddef>
#include <iostream>
#include <utility>
#include <vector>

class Buffer {
public:
    explicit Buffer(std::size_t n) : size_(n), data_(new int[n]()) {}
    Buffer(const Buffer& other) : size_(other.size_), data_(new int[other.size_]) {
        std::copy(other.data_, other.data_ + size_, data_);
        std::cout << "копія\n";
    }
    Buffer(Buffer&& other) noexcept : size_(other.size_), data_(other.data_) {
        other.size_ = 0;
        other.data_ = nullptr;
        std::cout << "переміщення\n";
    }
    Buffer& operator=(const Buffer&) = delete;
    Buffer& operator=(Buffer&&) = delete;
    ~Buffer() { delete[] data_; }

    std::size_t size() const { return size_; }

private:
    std::size_t size_;
    int* data_;
};

int main() {
    Buffer a(4);
    Buffer b = a;
    Buffer c = std::move(a);
    std::cout << "a: " << a.size() << ", b: " << b.size() << ", c: " << c.size() << "\n";

    std::vector<Buffer> v;
    v.reserve(2);
    v.push_back(Buffer(2));
    v.push_back(b);
    std::cout << "у векторі " << v.size() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <utility>
#include <vector>

class Library {
public:
    void add(std::string title) { books_.push_back(std::move(title)); }
    std::size_t count() const { return books_.size(); }
    const std::string& at(std::size_t i) const { return books_.at(i); }

private:
    std::vector<std::string> books_;
};

std::vector<std::string> makeTitles() {
    std::vector<std::string> titles;
    titles.push_back("Кобзар");
    titles.push_back("Лісова пісня");
    return titles;
}

int main() {
    Library lib;
    std::string draft = "Тіні забутих предків";
    lib.add(std::move(draft));
    lib.add("Захар Беркут");
    for (const std::string& t : makeTitles()) {
        lib.add(t);
    }
    for (std::size_t i = 0; i < lib.count(); ++i) {
        std::cout << i + 1 << ". " << lib.at(i) << "\n";
    }
    return 0;
}
`,
      String.raw`// не компілюється: unique_ptr не копіюється, його можна лише перемістити через std::move
#include <iostream>
#include <memory>

int main() {
    std::unique_ptr<int> a = std::make_unique<int>(7);
    std::unique_ptr<int> b = a;
    std::cout << *b << "\n";
    return 0;
}
`,
      String.raw`// аварія: після переміщення unique_ptr порожній, і перевірка кидає виняток, який ніхто не ловить
#include <iostream>
#include <memory>
#include <stdexcept>
#include <utility>

int main() {
    std::unique_ptr<int> a = std::make_unique<int>(7);
    std::unique_ptr<int> b = std::move(a);
    std::cout << "b володіє: " << *b << "\n";
    if (!a) {
        throw std::logic_error("a вже переміщено");
    }
    std::cout << *a << "\n";
    return 0;
}
`,
    ],
    note: "<code>std::move</code> не переміщує, а лише дозволяє забрати ресурс: потрібен конструктор переміщення з <code>noexcept</code>. Після переміщення об'єкт можна знищити або присвоїти йому нове, але не читати. З функції повертайте просто <code>return v;</code>.",
    work: "Переміщення робить швидкими повернення великих контейнерів із функцій, наповнення векторів рядками та передачу <code>unique_ptr</code> між модулями. Тому сучасний C++ не боїться передавати об'єкти за значенням.",
    tasks: [
      "Чим конструктор переміщення відрізняється від конструктора копіювання за сигнатурою і за тим, що він робить із джерелом?",
      "Що станеться, якщо викликати <code>std::move</code> на <code>const std::string</code> і чому <code>return std::move(v);</code> із функції зайве?",
    ],
  },
  {
    t: "enum class і статичні члени класу",
    ch: "Типи користувача й пам'ять",
    easy: "Перелічення це випадаючий список у формі: ви обираєте один із дозволених пунктів і не можете вписати довільне число. Статичний член це табличка на дверях офісу: вона одна на всю компанію, а не своя в кожного працівника.",
    p: [
      "Часто змінна має приймати одне з кількох фіксованих значень: стан завдання, колір, код відповіді. Можна позначити їх числами 0, 1, 2, але тоді код читається як шифр, а у функцію легко передати 17. Для цього є <b>перелічення</b>. Сучасний вигляд це <code>enum class</code>: <code>enum class Color { Red, Green, Blue };</code>. Кожне значення називається <b>перелічувачем</b> і записується з іменем типу: <code>Color::Red</code>.",
      "Чому саме <code>enum class</code>, а не старий <code>enum</code>? Модель така: перелічувачі живуть усередині власного простору імен типу, тому <code>Color::Red</code> і <code>Alert::Red</code> не конфліктують. І головне: <code>enum class</code> <b>сильно типізований</b>. Він не перетворюється на <code>int</code> мовчки, і порівняти його з числом чи передати замість числа не вийде. Це відсікає цілий клас випадкових помилок. Старий <code>enum</code> без <code>class</code> сам перетворюється на число й засмічує оточення іменами, тож у новому коді його не пишуть.",
      "Коли число все ж потрібне (надрукувати код, записати в протокол), перетворення роблять явно: <code>static_cast&lt;int&gt;(c)</code>, а назад <code>static_cast&lt;Color&gt;(1)</code>. Типом, що лежить під перелічуванням, за замовчуванням є <code>int</code>, але його можна задати: <code>enum class Status : int { Ok = 200, NotFound = 404 };</code>. Значення можна прописати явно, а ті, що без числа, продовжують лічбу від попереднього. Обробляйте перелічення через <code>switch</code>: компілятор попередить, якщо ви забули один із перелічувачів.",
      "Друга тема уроку: дані, спільні для всього класу. Звичайне поле є в кожному об'єкті окремо. <b>Статичне</b> поле, позначене <code>static</code>, існує в єдиному екземплярі для всіх об'єктів класу, ніби глобальна змінна, але з ім'ям усередині класу. Типові приклади: лічильник створених об'єктів, генератор ідентифікаторів, константа класу. Від C++17 статичне поле можна оголосити й ініціалізувати прямо в класі словом <code>inline</code>: <code>inline static int counter_ = 0;</code>, без окремого визначення поза класом.",
      "Є й <b>статичні методи</b>. Вони належать класу, а не об'єкту, тому викликаються через ім'я класу: <code>Ticket::issued()</code>, і в них немає <code>this</code>: звертатися можна лише до статичних членів. Константи класу ідіоматично пишуть як <code>static constexpr int kMax = 3;</code>. Усередині конструктора статичний лічильник вдало видає унікальні номери: <code>id_(++counter_)</code>. Але одну деталь тримайте в голові: для порядку виконання в єдиному потоці це просто, а при кількох потоках лічильник потребує захисту.",
      "Пастки. Спроба присвоїти <code>enum class</code> цілому числу без <code>static_cast</code> дає помилку компіляції: це не недолік, а страховка. Перетворення довільного числа на перелічення (<code>static_cast&lt;Color&gt;(42)</code>) компілюється, але дає значення, якого немає у списку, тож перевіряйте число перед перетворенням. Статичне поле без <code>inline</code> у C++17 і без визначення поза класом спричинить помилку лінкера. А глобальний стан у статичних полях ускладнює тестування, тому не зловживайте ним.",
      "У цьому уроці ми додали класу два нових способи виражати дані: обмежений список значень і спільний для всіх стан. Наступний урок про те, як зробити, щоб власні типи працювали зі звичними знаками <code>+</code>, <code>==</code>, <code>&lt;&lt;</code>: перевантаження операторів.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

enum class Color { Red, Green, Blue };

std::string name(Color c) {
    switch (c) {
        case Color::Red: return "red";
        case Color::Green: return "green";
        case Color::Blue: return "blue";
    }
    return "?";
}

int main() {
    Color c = Color::Green;
    std::cout << name(c) << "\n";
    std::cout << "номер: " << static_cast<int>(c) << "\n";
    for (int i = 0; i < 3; ++i) {
        Color x = static_cast<Color>(i);
        std::cout << i << " -> " << name(x) << "\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>

enum class Status : int { Ok = 200, NotFound = 404, ServerError = 500 };
enum class Level { Low, High };
enum class Mode { Low, High };

static_assert(static_cast<int>(Status::Ok) == 200, "Ok має бути 200");

bool isError(Status s) {
    return static_cast<int>(s) >= 400;
}

int main() {
    Status s = static_cast<Status>(404);
    std::cout << "код " << static_cast<int>(s) << "\n";
    std::cout << (s == Status::NotFound ? "не знайдено" : "інше") << "\n";
    std::cout << "помилка? " << isError(Status::Ok) << isError(s) << "\n";

    Level l = Level::High;
    Mode m = Mode::Low;
    std::cout << static_cast<int>(l) << static_cast<int>(m) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>

class Ticket {
public:
    static constexpr int kMax = 3;

    Ticket() : id_(++counter_) {}
    int id() const { return id_; }
    static int issued() { return counter_; }
    static bool soldOut() { return counter_ >= kMax; }

private:
    inline static int counter_ = 0;
    int id_;
};

int main() {
    std::cout << "видано: " << Ticket::issued() << "\n";
    Ticket a;
    Ticket b;
    std::cout << "id: " << a.id() << ", " << b.id() << "\n";
    std::cout << "видано: " << Ticket::issued() << "\n";
    std::cout << "усе розкуплено? " << Ticket::soldOut() << "\n";
    Ticket c;
    std::cout << "усе розкуплено? " << Ticket::soldOut() << ", ліміт " << Ticket::kMax << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: enum class не перетворюється на int неявно, потрібен static_cast
#include <iostream>

enum class Color { Red, Green, Blue };

int main() {
    int x = Color::Green;
    std::cout << x << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <utility>
#include <vector>

class Task {
public:
    enum class State { Todo, Doing, Done };

    Task(std::string title) : id_(++nextId_), title_(std::move(title)) {}

    void advance() {
        if (state_ == State::Todo) {
            state_ = State::Doing;
        } else if (state_ == State::Doing) {
            state_ = State::Done;
        }
    }
    State state() const { return state_; }
    int id() const { return id_; }
    const std::string& title() const { return title_; }

    static const char* label(State s) {
        switch (s) {
            case State::Todo: return "todo";
            case State::Doing: return "doing";
            case State::Done: return "done";
        }
        return "?";
    }

private:
    inline static int nextId_ = 0;
    int id_;
    std::string title_;
    State state_ = State::Todo;
};

int main() {
    std::vector<Task> tasks;
    tasks.emplace_back("Написати урок");
    tasks.emplace_back("Перевірити приклади");
    tasks[0].advance();
    tasks[0].advance();
    tasks[1].advance();
    for (const Task& t : tasks) {
        std::cout << "#" << t.id() << " " << t.title() << ": " << Task::label(t.state()) << "\n";
    }
    return 0;
}
`,
    ],
    note: "<code>enum class</code> дає іменований набір значень без неявного перетворення на число: перетворюйте через <code>static_cast</code>. Статичний член один на весь клас, статичний метод викликають через <code>Клас::метод()</code>. У C++17 пишіть <code>inline static</code>.",
    work: "Перелічення описують стани завдань, коди відповідей, режими роботи й типи подій. Статичні лічильники й константи класу видають ідентифікатори та зберігають налаштування, спільні для всіх об'єктів.",
    tasks: [
      "Оголосіть <code>enum class Dir { Up, Down }</code> і напишіть функцію, що повертає назву напряму через <code>switch</code>. Як вивести числове значення?",
      "Чим статичне поле відрізняється від звичайного? Скільки його копій існує, якщо створено десять об'єктів, і як звернутися до нього без об'єкта?",
    ],
  },
  {
    t: "Перевантаження операторів",
    ch: "Типи користувача й пам'ять",
    easy: "Перевантаження операторів це навчити нову річ знайомому слову. Знак плюс між двома числами додає, а між двома векторами чи сумами грошей додасть їх покомпонентно, якщо ви пояснили класу, що це означає.",
    p: [
      "Для чисел ми пишемо <code>a + b</code>, для рядків теж, і це зручно читається. Для власних типів (точка, дріб, гроші) компілятор не знає, що означає плюс. Але C++ дозволяє пояснити: оператор це звичайна функція зі спеціальним іменем <code>operator+</code>, і запис <code>a + b</code> компілятор перетворює на виклик <code>operator+(a, b)</code>. Це <b>перевантаження операторів</b>: нових знаків ви не вигадуєте, лише задаєте зміст наявних для своїх типів.",
      "Оператор можна визначити двома способами. Як <b>вільна функція</b>: <code>Vec2 operator+(const Vec2&amp; a, const Vec2&amp; b)</code>. Або як <b>метод</b>, де лівий операнд це <code>*this</code>: <code>Vec2 operator+(const Vec2&amp; o) const</code>. Бінарні симетричні оператори (<code>+</code>, <code>==</code>, <code>&lt;</code>) зручніше робити вільними функціями, а ті, що змінюють лівий операнд (<code>+=</code>, <code>++</code>, <code>[]</code>, <code>()</code>), методами. Операнди-об'єкти беріть за <code>const T&amp;</code>, щоб не копіювати.",
      "Найчастіше потрібні кілька груп. Арифметика: <code>+</code>, <code>-</code>, <code>*</code>. Порівняння: <code>==</code>, <code>!=</code>, <code>&lt;</code> (останній потрібен для <code>std::sort</code> і <code>std::map</code>). Складене присвоєння <code>+=</code>. Виведення в потік: <code>std::ostream&amp; operator&lt;&lt;(std::ostream&amp; os, const T&amp; x)</code>, яка повертає той самий потік, щоб працювало <code>cout &lt;&lt; a &lt;&lt; b</code>. Індексування <code>operator[]</code> і виклик <code>operator()</code> роблять об'єкт схожим на масив чи функцію.",
      "Ідіома: реалізуйте спершу <code>+=</code> як метод, що змінює об'єкт, а <code>+</code> напишіть через нього: скопіюйте лівий операнд і додайте правий. Так логіка живе в одному місці. Так само <code>!=</code> виражають через <code>==</code>, а <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code> через <code>&lt;</code>. Для індексування пишуть дві версії: звичайну, що повертає посилання для запису, і <code>const</code>, що повертає значення чи <code>const</code>-посилання для читання. Об'єкт, у якого є <code>operator()</code>, називають <b>функтором</b>, і його можна передавати в алгоритми STL.",
      "Є й префіксний та постфіксний інкремент: <code>T&amp; operator++()</code> для <code>++x</code> і <code>T operator++(int)</code> для <code>x++</code>, де порожній <code>int</code> лише розрізняє форми. Префіксний дешевший, бо не створює копію, тож за замовчуванням користуйтеся ним. Оператори <code>&amp;&amp;</code>, <code>||</code> і кому перевантажувати не варто: втрачається порядок обчислення, і код дивує читача.",
      "Головна пастка не технічна, а смислова: оператор має означати те, що від нього очікують. Якщо <code>a + b</code> раптом віднімає або друкує, код стає нечитабельним. Перевантажуйте оператор лише коли зміст очевидний, інакше напишіть звичайний метод із ясною назвою. Технічні пастки: не можна змінити пріоритет оператора й перевантажити оператори для суто вбудованих типів (<code>int + int</code>), а якщо оператора для типу не існує, компілятор видасть помилку, а не здогадається.",
      "Тут закінчується головна частина глави. Ви вмієте будувати власні типи: структури й класи, конструктори, посилання й вказівники, RAII, розумні вказівники, копіювання, переміщення, перелічення й оператори. Далі йдуть просунуті уроки про friend, розмітку в пам'яті й ручне керування часом життя.",
    ],
    code: [
      String.raw`#include <iostream>

struct Vec2 {
    int x;
    int y;
};

Vec2 operator+(const Vec2& a, const Vec2& b) {
    return {a.x + b.x, a.y + b.y};
}

bool operator==(const Vec2& a, const Vec2& b) {
    return a.x == b.x && a.y == b.y;
}

bool operator!=(const Vec2& a, const Vec2& b) {
    return !(a == b);
}

std::ostream& operator<<(std::ostream& os, const Vec2& v) {
    return os << "(" << v.x << ", " << v.y << ")";
}

int main() {
    Vec2 a{1, 2};
    Vec2 b{3, 4};
    Vec2 c = a + b;
    std::cout << a << " + " << b << " = " << c << "\n";
    std::cout << (c == Vec2{4, 6}) << " " << (a != b) << "\n";
    return 0;
}
`,
      String.raw`#include <algorithm>
#include <iostream>
#include <vector>

class Money {
public:
    explicit Money(long cents) : cents_(cents) {}

    long cents() const { return cents_; }
    Money& operator+=(const Money& other) {
        cents_ += other.cents_;
        return *this;
    }
    Money operator-() const { return Money(-cents_); }

private:
    long cents_;
};

Money operator+(Money a, const Money& b) {
    a += b;
    return a;
}

bool operator<(const Money& a, const Money& b) {
    return a.cents() < b.cents();
}

std::ostream& operator<<(std::ostream& os, const Money& m) {
    long c = m.cents();
    if (c < 0) {
        os << "-";
        c = -c;
    }
    return os << c / 100 << "." << (c % 100 < 10 ? "0" : "") << c % 100;
}

int main() {
    Money total(0);
    std::vector<Money> prices{Money(1999), Money(250), Money(505)};
    for (const Money& p : prices) {
        total += p;
    }
    std::cout << "разом " << total << "\n";
    std::cout << "мінус " << -total << "\n";

    std::sort(prices.begin(), prices.end());
    for (const Money& p : prices) {
        std::cout << p << " ";
    }
    std::cout << "\n" << Money(100) + Money(5) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <vector>

class Grid {
public:
    Grid(int rows, int cols) : cols_(cols), cells_(static_cast<std::size_t>(rows * cols), 0) {}

    int& operator()(int r, int c) { return cells_[static_cast<std::size_t>(r * cols_ + c)]; }
    int operator()(int r, int c) const { return cells_[static_cast<std::size_t>(r * cols_ + c)]; }

    Grid& operator++() {
        for (int& v : cells_) {
            ++v;
        }
        return *this;
    }

private:
    int cols_;
    std::vector<int> cells_;
};

int main() {
    Grid g(2, 3);
    g(0, 1) = 5;
    g(1, 2) = 7;
    ++g;
    const Grid& view = g;
    std::cout << view(0, 0) << " " << view(0, 1) << " " << view(1, 2) << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: для структури Point не визначено operator+
#include <iostream>

struct Point {
    int x;
    int y;
};

int main() {
    Point a{1, 2};
    Point b{3, 4};
    Point c = a + b;
    std::cout << c.x << "\n";
    return 0;
}
`,
      String.raw`#include <algorithm>
#include <iostream>
#include <vector>

struct GreaterThan {
    int limit;
    bool operator()(int v) const { return v > limit; }
};

struct Counter {
    int value = 0;
    int operator()() { return ++value; }
};

int main() {
    std::vector<int> data{3, 8, 1, 9, 5, 12};
    GreaterThan big{4};
    std::cout << big(3) << big(10) << "\n";
    std::cout << "більших за 4: " << std::count_if(data.begin(), data.end(), big) << "\n";

    Counter next;
    next();
    next();
    std::cout << "лічильник: " << next() << "\n";
    return 0;
}
`,
    ],
    note: "Оператор це функція <code>operator+</code>, <code>operator==</code>, <code>operator&lt;&lt;</code> тощо. Симетричні робіть вільними, змінні (<code>+=</code>, <code>[]</code>, <code>()</code>) методами. Пишіть <code>+</code> через <code>+=</code> і підтримуйте очевидний зміст.",
    work: "Перевантажені оператори роблять користувацькі типи природними: гроші, вектори, дроби, ідентифікатори. Без них не працюють <code>std::sort</code> і <code>std::map</code> для власних ключів, а функтори з <code>operator()</code> передають у алгоритми.",
    tasks: [
      "Напишіть для структури <code>Fraction</code> з полями <code>num</code> і <code>den</code> оператори <code>operator==</code> і <code>operator&lt;&lt;</code>. Чому <code>operator&lt;&lt;</code> повертає потік за посиланням?",
      "Чому <code>+</code> зручно виразити через <code>+=</code>, а не навпаки? Які оператори не слід перевантажувати?",
    ],
  },
  // @@END
];
