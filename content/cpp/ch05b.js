export const LESSONS_05b = [
  {
    t: "std::optional: значення, якого може не бути",
    ch: "Абстракція",
    easy: "std::optional це коробка, яка або порожня, або містить рівно одну річ. Ви питаєте на пошті, чи є для вас посилка: працівник дає коробку, ви заглядаєте всередину, і лише тоді дістаєте вміст. Вигаданих «порожніх посилок» більше не треба.",
    p: [
      "Багато функцій не завжди мають що повернути: пошук елемента, розбір числа з рядка, читання ключа з налаштувань. Раніше в таких випадках домовлялися про «магічне» значення: <code>-1</code>, порожній рядок, <code>nullptr</code>. Але <code>-1</code> може бути цілком законною відповіддю, а забута перевірка тихо псує програму далі. <code>std::optional&lt;T&gt;</code> із заголовка <code>&lt;optional&gt;</code> робить відсутність значення частиною типу, і її видно в підписі функції.",
      "Модель у голові: <code>optional&lt;int&gt;</code> це пара «є чи нема» плюс місце під <code>int</code>, яке заповнене лише тоді, коли є. Порожній стан позначають <code>std::nullopt</code>. Значення лежить усередині самого об'єкта, а не в купі: жодних динамічних виділень. Тому <code>optional</code> дешевий, і його без страху повертають із функцій за значенням.",
      "Базові операції. Створити порожній: <code>std::optional&lt;int&gt; x;</code> або <code>= std::nullopt</code>. Створити зі значенням: присвоїти його або повернути з функції. Перевірити: <code>x.has_value()</code> або просто <code>if (x)</code>, бо <code>optional</code> перетворюється на bool. Дістати: <code>*x</code> чи <code>x-&gt;поле</code> (без перевірки!) або <code>x.value()</code> (з перевіркою). Замінити відсутнє значенням за замовчуванням: <code>x.value_or(0)</code>. Спорожнити: <code>x.reset()</code>.",
      "Різниця між <code>*x</code> і <code>x.value()</code> важлива. Якщо <code>optional</code> порожній, <code>x.value()</code> кидає виняток <code>std::bad_optional_access</code>, і помилку видно. А <code>*x</code> на порожньому <code>optional</code> це невизначена поведінка, як розіменування <code>nullptr</code>. Тому правило просте: спочатку перевірили через <code>if</code>, потім розіменували. Або взяли <code>value_or</code>, де перевірка вбудована.",
      "Ідіоми. Повертайте <code>optional</code> там, де «немає результату» це нормальна, очікувана ситуація, а не помилка. У C++17 зручно писати <code>if (auto r = find(...); r) { ... }</code>: змінна живе лише в цьому <code>if</code>. Для параметрів функції <code>optional</code> використовують рідше: зазвичай краще два перевантаження. Ще <code>optional</code> порівнюється: два порожні рівні, порожній менший за будь-який із значенням, а <code>x == 5</code> працює без розпакування.",
      "Пастки. По-перше, не плутайте «відсутнє значення» з «помилка»: <code>optional</code> не каже, чому значення немає. Якщо причина важлива, потрібен інший механізм, про що ми поговоримо в главі про помилки. По-друге, <code>optional&lt;bool&gt;</code> збиває з пантелику: <code>if (x)</code> перевіряє наявність, а не значення. По-третє, <code>optional</code> від посилання не існує; для цього беруть вказівник чи <code>std::reference_wrapper</code>.",
      "Отже, <code>optional</code> відповідає на питання «є значення чи ні». Але буває й складніше: значення є завжди, тільки різного типу, наприклад число або рядок. Для такого вибору з кількох типів у стандартній бібліотеці є ще один «безпечний контейнер на одне значення»: <code>std::variant</code>. Про нього наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <optional>
#include <string>
#include <vector>

std::optional<int> find_index(const std::vector<std::string>& v, const std::string& what) {
    for (std::size_t i = 0; i < v.size(); ++i) {
        if (v[i] == what) return static_cast<int>(i);
    }
    return std::nullopt;
}

int main() {
    std::vector<std::string> names{"Оля", "Ігор", "Марта"};
    std::optional<int> a = find_index(names, "Ігор");
    std::optional<int> b = find_index(names, "Петро");
    std::cout << a.has_value() << " " << b.has_value() << "\n";
    if (a) std::cout << "Ігор на місці " << *a << "\n";
    std::cout << "Петро: " << b.value_or(-1) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <optional>
#include <string>

std::optional<int> parse_int(const std::string& s) {
    if (s.empty() || s.size() > 9) return std::nullopt;
    int result = 0;
    for (char ch : s) {
        if (ch < '0' || ch > '9') return std::nullopt;
        result = result * 10 + (ch - '0');
    }
    return result;
}

int main() {
    const char* inputs[] = {"42", "abc", "", "7"};
    for (const char* text : inputs) {
        if (auto n = parse_int(text); n) {
            std::cout << "'" << text << "' -> " << *n << "\n";
        } else {
            std::cout << "'" << text << "' -> не число\n";
        }
    }
    return 0;
}
`,
      String.raw`// аварія: value() порожнього optional кидає std::bad_optional_access, якого ніхто не ловить
#include <iostream>
#include <optional>

int main() {
    std::optional<int> x;
    std::cout << "перед зверненням" << std::endl;
    std::cout << x.value() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <optional>
#include <string>

int main() {
    std::optional<std::string> nick;
    std::cout << "порожній: " << nick.has_value() << "\n";
    nick = "wolf";
    std::cout << "довжина: " << nick->size() << "\n";
    nick.reset();
    std::cout << "після reset: " << (nick == std::nullopt) << "\n";
    nick.emplace(3, 'x');
    std::cout << *nick << "\n";

    std::optional<int> e;
    try {
        std::cout << e.value() << "\n";
    } catch (const std::bad_optional_access&) {
        std::cout << "ловимо bad_optional_access\n";
    }
    std::optional<int> five = 5;
    std::cout << (five == 5) << " " << (e < five) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <map>
#include <optional>
#include <string>

using Config = std::map<std::string, std::string>;

std::optional<std::string> get(const Config& c, const std::string& key) {
    auto it = c.find(key);
    if (it == c.end()) return std::nullopt;
    return it->second;
}

std::optional<int> get_int(const Config& c, const std::string& key) {
    auto s = get(c, key);
    if (!s) return std::nullopt;
    return std::stoi(*s);
}

int main() {
    Config cfg{{"host", "localhost"}, {"port", "8080"}};
    if (auto h = get(cfg, "host")) std::cout << "host=" << *h << "\n";
    int port = get_int(cfg, "port").value_or(80);
    int timeout = get_int(cfg, "timeout").value_or(30);
    std::cout << "port=" << port << " timeout=" << timeout << "\n";
    return 0;
}
`,
    ],
    note: "Перед <code>*x</code> завжди перевіряйте <code>if (x)</code>; на порожньому optional розіменування це невизначена поведінка. Безпечні шляхи: <code>value()</code> (кине виняток) або <code>value_or(запасне)</code>. Відсутнє значення це не помилка з причиною.",
    work: "Напишіть функцію <code>first_negative</code>, що повертає перше від'ємне число з вектора як <code>optional&lt;int&gt;</code>. Виведіть його або слово «немає», використавши <code>if</code> з ініціалізатором. Перевірте порожній вектор і вектор без від'ємних.",
    tasks: [
      "Чим <code>x.value()</code> відрізняється від <code>*x</code> на порожньому optional, і яку з цих форм безпечніше використовувати без попередньої перевірки?",
      "Чому повертати <code>-1</code> як «не знайдено» гірше, ніж повертати <code>std::optional&lt;int&gt;</code>? Наведіть ситуацію, де <code>-1</code> сама є законною відповіддю.",
    ],
  },
  {
    t: "std::variant і std::visit",
    ch: "Абстракція",
    easy: "std::variant це гаманець із одним відділенням, куди влазить або купюра, або картка, але не обидві одразу. Гаманець завжди знає, що в ньому лежить зараз, а касир (visit) для кожного варіанту має свою дію.",
    p: [
      "Іноді значення має один з кількох типів: поле JSON це число, рядок або булеве; команда це рух, репліка або вихід. Старий спосіб у C++ це <code>union</code> (небезпечний: ви самі пам'ятаєте, що в ньому лежить) або ієрархія класів із віртуальними функціями (важкий, коли типи прості). <code>std::variant&lt;A, B, C&gt;</code> із заголовка <code>&lt;variant&gt;</code> це безпечний <b>тип-суму</b>: у кожен момент він містить значення рівно одного з перелічених типів і знає, якого саме.",
      "Модель у голові: <code>variant</code> це пам'ять під найбільший із типів плюс номер активної альтернативи. Номер повертає <code>v.index()</code> (рахунок із нуля). Перевірка типу: <code>std::holds_alternative&lt;int&gt;(v)</code>. Присвоєння нового значення знищує старе й записує нове, змінюючи номер. Без пам'яті в купі і без віртуальних викликів.",
      "Дістати значення можна двома способами. <code>std::get&lt;int&gt;(v)</code> повертає значення, а якщо зараз активний інший тип, кидає <code>std::bad_variant_access</code>. <code>std::get_if&lt;int&gt;(&amp;v)</code> повертає вказівник на значення або <code>nullptr</code>, без винятків. Для одного типу це зручно, але коли альтернатив багато, ланцюжок <code>if</code> стає громіздким і легко щось забути.",
      "Тому основний інструмент це <code>std::visit(visitor, v)</code>. Visitor це викликаний об'єкт, що вміє приймати <b>кожен</b> тип із <code>variant</code>: або структура з кількома <code>operator()</code>, або набір лямбд. <code>visit</code> дивиться на активну альтернативу й викликає потрібне перевантаження. Головна перевага: якщо ви додали новий тип до <code>variant</code>, а visitor його не обробляє, програма <b>не скомпілюється</b>. Компілятор нагадує про забуту гілку.",
      "Ідіоми. Для набору лямбд у C++17 вживають маленький допоміжний шаблон <code>overloaded</code>: він склеює лямбди в один visitor. Ми беремо його як готовий шматок, а як він влаштований, розберемо в просунутому уроці про шаблони зі змінною кількістю аргументів. Усі гілки visitor мають повертати <b>один і той самий тип</b> (або всі <code>void</code>). Для альтернатив без полів заводять порожні структури: <code>struct Quit {};</code>.",
      "Пастки. <code>variant</code> за замовчуванням створює першу альтернативу, і якщо в неї немає конструктора без аргументів, треба вказати значення. Невдале присвоєння <code>std::get</code> іншого типу це виняток, а не мовчазна помилка. У C++17 присвоєння літерала <code>\"текст\"</code> змінній <code>variant&lt;bool, std::string&gt;</code> може вибрати <code>bool</code>: пишіть <code>std::string(\"текст\")</code> явно. І не плутайте з <code>optional</code>: <code>variant</code> завжди щось містить.",
      "Тепер у вас є два типи-обгортки: «значення або нічого» і «одне з кількох». Далі в главі ми повернемося до класів, але вже з іншого боку: як одна ієрархія може мати кілька батьків і чому виникає «ромб». Це просунуті уроки; а базова частина глави на цьому завершується.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <variant>

int main() {
    std::variant<int, std::string> v = 42;
    std::cout << "index: " << v.index() << "\n";
    std::cout << std::get<int>(v) << "\n";

    v = std::string("hello");
    std::cout << "index: " << v.index() << "\n";
    std::cout << std::holds_alternative<std::string>(v) << "\n";
    if (auto* s = std::get_if<std::string>(&v)) {
        std::cout << *s << " " << s->size() << "\n";
    }
    if (std::get_if<int>(&v) == nullptr) std::cout << "int зараз немає\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <variant>

struct Describe {
    std::string operator()(int n) const { return "ціле " + std::to_string(n); }
    std::string operator()(double d) const { return "дробове " + std::to_string(d); }
    std::string operator()(const std::string& s) const { return "рядок " + s; }
};

int main() {
    std::variant<int, double, std::string> items[] = {7, 2.5, std::string("abc")};
    for (const auto& it : items) {
        std::cout << std::visit(Describe{}, it) << "\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <variant>
#include <vector>

template <class... Ts> struct overloaded : Ts... { using Ts::operator()...; };
template <class... Ts> overloaded(Ts...) -> overloaded<Ts...>;

struct Move { int dx, dy; };
struct Say { std::string text; };
struct Quit {};
using Command = std::variant<Move, Say, Quit>;

int main() {
    std::vector<Command> script{Move{1, 2}, Say{"привіт"}, Move{3, -1}, Quit{}, Say{"не буде"}};
    int x = 0, y = 0;
    bool running = true;
    for (const auto& cmd : script) {
        if (!running) break;
        std::visit(overloaded{
            [&](const Move& m) { x += m.dx; y += m.dy; },
            [&](const Say& s) { std::cout << "кажу: " << s.text << "\n"; },
            [&](const Quit&) { running = false; },
        }, cmd);
    }
    std::cout << "позиція " << x << "," << y << "\n";
    return 0;
}
`,
      String.raw`// аварія: get<string> для variant, у якому зараз int, кидає std::bad_variant_access
#include <iostream>
#include <string>
#include <variant>

int main() {
    std::variant<int, std::string> v = 1;
    std::cout << "int: " << std::get<int>(v) << std::endl;
    std::cout << std::get<std::string>(v) << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: visitor не вміє приймати std::string, а visit вимагає обробити всі альтернативи
#include <iostream>
#include <string>
#include <variant>

int main() {
    std::variant<int, std::string> v = 5;
    std::visit([](int n) { std::cout << n << "\n"; }, v);
    return 0;
}
`,
    ],
    note: "<code>std::visit</code> змушує обробити всі альтернативи: додали тип у variant, а visitor не оновили, і програма не збереться. Це краще, ніж забута гілка в ланцюжку <code>if</code>. Усі гілки повертають один тип.",
    work: "Опишіть <code>using Value = std::variant&lt;int, std::string&gt;;</code> і функцію, що через <code>std::visit</code> повертає довжину рядка або саме число. Виведіть результат для <code>Value{5}</code> і <code>Value{std::string(\"abcd\")}</code>.",
    tasks: [
      "Чим <code>std::get&lt;T&gt;(v)</code> відрізняється від <code>std::get_if&lt;T&gt;(&amp;v)</code> за поведінкою, коли в variant зараз інший тип?",
      "Чому додавання нового типу до variant призведе до помилки компіляції в коді з <code>std::visit</code>, і чому це корисно?",
    ],
  },
  {
    t: "Множинне й віртуальне наслідування",
    ch: "Абстракція",
    adv: true,
    easy: "Множинне наслідування схоже на людину з двома посадами: вона одночасно бухгалтер і водій. Якщо в обох посад є «табельний номер», питання «який номер?» стає двозначним, і треба уточнювати, про який саме мова.",
    p: [
      "У C++ клас може мати <b>кількох батьків</b>: <code>class Duck : public Flyer, public Swimmer</code>. Об'єкт <code>Duck</code> містить усередині частину <code>Flyer</code> і частину <code>Swimmer</code>, і успадковує обидва набори членів. На відміну від багатьох мов, C++ це дозволяє для будь-яких класів, не лише для інтерфейсів. Звідси і сила, і проблеми.",
      "Найбезпечніше й найпоширеніше застосування: <b>один «справжній» батько плюс інтерфейси</b>. Інтерфейс це клас лише з чисто віртуальними функціями, без полів (ви вже знаєте абстрактні класи). Клас реалізує кілька інтерфейсів, наприклад <code>Printable</code> і <code>Serializable</code>, і його можна передавати куди завгодно, де очікують будь-який із них. Тут конфліктів майже не буває, бо інтерфейси нічого не зберігають.",
      "Перша проблема: <b>неоднозначність імен</b>. Якщо в обох батьків є функція <code>hello()</code>, то виклик <code>c.hello()</code> не компілюється: компілятор не знає, яку з двох вибрати. Лікування: вказати батька явно, <code>c.A::hello()</code>, або написати в нащадка власну <code>hello()</code>, яка вирішує, що робити. Зверніть увагу: помилка виникає при <i>використанні</i> імені, а не при описі класу.",
      "Друга проблема: <b>ромб</b>. Нехай <code>Flyer</code> і <code>Swimmer</code> обидва успадковують <code>Animal</code>, а <code>Duck</code> успадковує обох. Тоді в <code>Duck</code> опиняються <b>дві окремі копії</b> <code>Animal</code>: по одній через кожного батька. Конструктор <code>Animal</code> спрацює двічі, поле <code>legs</code> буде у двох екземплярах, і <code>d.legs</code> стане неоднозначним. Здебільшого це не те, що ви хотіли: качка одна, тварина теж одна.",
      "Лікування ромба: <b>віртуальне наслідування</b>. Якщо <code>Flyer</code> і <code>Swimmer</code> пишуть <code>: virtual Animal</code>, то в <code>Duck</code> буде лише одна спільна частина <code>Animal</code>. Особливість: конструктор такої спільної бази викликає не проміжний клас, а <b>найвіддаленіший нащадок</b>. Тобто <code>Duck</code> сам вказує, як створювати <code>Animal</code>, і ця ініціалізація «перемагає» ті, що написали <code>Flyer</code> і <code>Swimmer</code>.",
      "Ідіоми. Віддавайте перевагу композиції: «качка <i>має</i> здатність літати» часто краще, ніж «качка <i>є</i> літаючою». Якщо наслідуєте кількох батьків, робіть їх інтерфейсами. Віртуальну базу застосовуйте лише коли ромб справді виник, бо вона трохи дорожча (додатковий рівень непрямого доступу) і ускладнює порядок конструкторів. Деструктор базового класу з віртуальними функціями має бути <code>virtual</code>.",
      "Пастки. Не плутайте <code>virtual</code> у <i>функції</i> (поліморфізм) і у <i>наслідуванні</i> (спільна база): це різні речі з тим самим словом. Не покладайтеся на те, що проміжний клас сам ініціалізує віртуальну базу: у <code>Duck</code> його ініціалізація буде проігнорована. Далі повертаємося до шаблонів: наступний урок про те, як компілятор вибирає код залежно від типу ще до запуску програми.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

struct Printable {
    virtual void print() const = 0;
    virtual ~Printable() = default;
};

struct Serializable {
    virtual std::string serialize() const = 0;
    virtual ~Serializable() = default;
};

class Doc : public Printable, public Serializable {
public:
    explicit Doc(std::string text) : text_(std::move(text)) {}
    void print() const override { std::cout << "Doc: " << text_ << "\n"; }
    std::string serialize() const override { return "doc{" + text_ + "}"; }

private:
    std::string text_;
};

void show(const Printable& p) { p.print(); }
void save(const Serializable& s) { std::cout << s.serialize() << "\n"; }

int main() {
    Doc d("звіт");
    show(d);
    save(d);
    return 0;
}
`,
      String.raw`// не компілюється: обидва батьки мають hello(), виклик c.hello() неоднозначний
#include <iostream>

struct A { void hello() const { std::cout << "A\n"; } };
struct B { void hello() const { std::cout << "B\n"; } };
struct C : A, B {};

int main() {
    C c;
    c.hello();
    return 0;
}
`,
      String.raw`#include <iostream>

struct A { void hello() const { std::cout << "A\n"; } };
struct B { void hello() const { std::cout << "B\n"; } };

struct C : A, B {
    void hello() const {
        A::hello();
        B::hello();
        std::cout << "C\n";
    }
};

int main() {
    C c;
    c.A::hello();
    c.B::hello();
    c.hello();
    return 0;
}
`,
      String.raw`#include <iostream>

struct Animal {
    int legs = 0;
    Animal() { std::cout << "Animal()\n"; }
};
struct Flyer : Animal {};
struct Swimmer : Animal {};
struct Duck : Flyer, Swimmer {};

int main() {
    Duck d;
    d.Flyer::legs = 2;
    d.Swimmer::legs = 4;
    std::cout << d.Flyer::legs << " " << d.Swimmer::legs << "\n";
    Animal* a1 = static_cast<Flyer*>(&d);
    Animal* a2 = static_cast<Swimmer*>(&d);
    std::cout << "та сама тварина: " << (a1 == a2) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

struct Animal {
    std::string name;
    explicit Animal(std::string n) : name(std::move(n)) { std::cout << "Animal(" << name << ")\n"; }
};
struct Flyer : virtual Animal {
    Flyer() : Animal("з Flyer") { std::cout << "Flyer\n"; }
};
struct Swimmer : virtual Animal {
    Swimmer() : Animal("з Swimmer") { std::cout << "Swimmer\n"; }
};
struct Duck : Flyer, Swimmer {
    Duck() : Animal("duck") { std::cout << "Duck\n"; }
};

int main() {
    Duck d;
    Animal* a1 = static_cast<Flyer*>(&d);
    Animal* a2 = static_cast<Swimmer*>(&d);
    std::cout << d.name << " " << (a1 == a2) << "\n";
    return 0;
}
`,
    ],
    note: "Без <code>virtual</code> у ромбі об'єкт містить дві копії спільного предка. З віртуальним наслідуванням копія одна, а її конструктор викликає найвіддаленіший нащадок, ігноруючи ініціалізацію проміжних класів.",
    work: "Опишіть ромб <code>Animal</code>, <code>Flyer</code>, <code>Swimmer</code>, <code>Duck</code> з віртуальною базою й лічильником створених <code>Animal</code>. Переконайтеся, що після створення одного <code>Duck</code> лічильник дорівнює 1, а без слова <code>virtual</code> дорівнював би 2, і поясніть різницю.",
    tasks: [
      "Скільки підоб'єктів <code>Animal</code> міститиме <code>Duck</code> у ромбі без віртуального наслідування і скільки з ним?",
      "Який клас викликає конструктор віртуальної бази і чому ініціалізація в проміжних класах <code>Flyer</code> та <code>Swimmer</code> при створенні <code>Duck</code> не спрацьовує?",
    ],
  },
  {
    t: "if constexpr і основи SFINAE",
    ch: "Абстракція",
    adv: true,
    easy: "if constexpr це розвилка на заводі, що працює до відправки товару: залежно від типу деталі конвеєр одразу збирається за одним із двох проєктів, а зайвий проєкт навіть не друкують. SFINAE це правило «не підходить, шукаємо далі».",
    p: [
      "Шаблони компілюються для конкретних типів. Часто код для одного типу не має сенсу для іншого: у числа немає <code>.size()</code>, а в рядка нема арифметики. Звичайний <code>if</code> тут не рятує, бо компілятор перевіряє <b>обидві</b> гілки, навіть якщо виконується лише одна. Ось чому потрібен механізм вибору коду <b>під час компіляції</b>.",
      "C++17 дає <code>if constexpr (умова)</code>. Умова мусить обчислюватися при компіляції (найчастіше це характеристики типів із <code>&lt;type_traits&gt;</code>: <code>std::is_integral_v&lt;T&gt;</code>, <code>std::is_floating_point_v&lt;T&gt;</code>, <code>std::is_same_v&lt;T, U&gt;</code>). Гілка, яка не обрана, <b>відкидається</b>: у шаблоні вона навіть не інстанціюється, тож помилки в ній для цього типу ніхто не побачить. Це і є «розвилка до відправки».",
      "Модель у голові: для кожного <code>T</code> компілятор бере шаблон, обчислює умови <code>if constexpr</code> і залишає лише одну гілку, ніби ви написали окрему функцію. У виконуваному коді немає ані порівняння, ані зайвої гілки. Увага: відкидання працює лише всередині <b>шаблону</b> і лише коли умова залежить від параметра шаблону. У звичайній функції відкинута гілка все одно мусить бути коректною.",
      "До C++17 те саме робили через <b>SFINAE</b> (Substitution Failure Is Not An Error, «невдала підстановка це не помилка»). Ідея: якщо підстановка типу в підпис шаблону дає неможливий тип, цей шаблон мовчки <i>викидається з набору кандидатів</i>, а не ламає компіляцію. Найвідоміший прийом: <code>std::enable_if_t&lt;умова, int&gt; = 0</code> у списку параметрів. Якщо умова хибна, <code>enable_if_t</code> не існує, шаблон не підходить, і компілятор шукає інше перевантаження.",
      "Ще один прийом SFINAE це <b>ідіома виявлення</b>: чи має тип потрібну можливість. Пишуть <code>std::void_t&lt;decltype(std::declval&lt;T&gt;().size())&gt;</code>: якщо вираз коректний, спеціалізація підходить і ознака стає <code>true</code>, інакше підставляється запасна, <code>false</code>. Результат зручно перевіряти через <code>static_assert</code>: помилка буде при збиранні, а не під час роботи.",
      "Ідіоми. У новому коді віддавайте перевагу <code>if constexpr</code>: він читається як звичайний код. <code>enable_if</code> лишайте для випадків, коли треба саме <i>вибрати між перевантаженнями</i>, а не гілку в тілі. Пишіть <code>static_assert(умова, \"повідомлення\")</code>, щоб помилка звучала зрозуміло. Пастки: у відкинутій гілці не покладайтеся на помилки, що не залежать від <code>T</code> (вони все одно можуть спрацювати); якщо жодне перевантаження з <code>enable_if</code> не підійшло, повідомлення компілятора довге й заплутане.",
      "Отже, ми навчилися вибирати код за типом. Але що, коли аргументів у шаблону не один, а довільна кількість? Саме так працюють <code>std::make_unique</code>, <code>printf</code>-подібні логери та <code>std::tuple</code>. Для цього C++ має пакети параметрів і fold-вирази. Про них наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <type_traits>

template <class T>
std::string kind() {
    if constexpr (std::is_integral_v<T>) {
        return "ціле";
    } else if constexpr (std::is_floating_point_v<T>) {
        return "дробове";
    } else {
        return "інше";
    }
}

int main() {
    std::cout << kind<int>() << "\n";
    std::cout << kind<char>() << "\n";
    std::cout << kind<double>() << "\n";
    std::cout << kind<std::string>() << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: звичайний if перевіряє обидві гілки, а в int немає size()
#include <cstddef>
#include <iostream>
#include <type_traits>

template <class T>
std::size_t length(const T& x) {
    if (std::is_integral_v<T>) {
        return static_cast<std::size_t>(x);
    } else {
        return x.size();
    }
}

int main() {
    std::cout << length(5) << "\n";
    return 0;
}
`,
      String.raw`#include <cstddef>
#include <iostream>
#include <string>
#include <type_traits>
#include <vector>

template <class T>
std::size_t length(const T& x) {
    if constexpr (std::is_integral_v<T>) {
        return static_cast<std::size_t>(x);
    } else {
        return x.size();
    }
}

int main() {
    std::cout << length(5) << "\n";
    std::cout << length(std::string("abcd")) << "\n";
    std::cout << length(std::vector<int>(3)) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <type_traits>
#include <utility>

template <class T, std::enable_if_t<std::is_integral_v<T>, int> = 0>
std::string describe(T v) { return "ціле " + std::to_string(v); }

template <class T, std::enable_if_t<std::is_floating_point_v<T>, int> = 0>
std::string describe(T v) { return "дробове " + std::to_string(v); }

template <class T, class = void>
struct has_size : std::false_type {};
template <class T>
struct has_size<T, std::void_t<decltype(std::declval<const T&>().size())>> : std::true_type {};

static_assert(has_size<std::string>::value, "у рядка є size()");
static_assert(!has_size<int>::value, "в int немає size()");

int main() {
    std::cout << describe(3) << "\n";
    std::cout << describe(2.5) << "\n";
    std::cout << has_size<std::string>::value << has_size<int>::value << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: для std::string жодне перевантаження з enable_if не підходить
#include <iostream>
#include <string>
#include <type_traits>

template <class T, std::enable_if_t<std::is_integral_v<T>, int> = 0>
std::string describe(T v) { return "ціле " + std::to_string(v); }

template <class T, std::enable_if_t<std::is_floating_point_v<T>, int> = 0>
std::string describe(T v) { return "дробове " + std::to_string(v); }

int main() {
    std::cout << describe(std::string("abc")) << "\n";
    return 0;
}
`,
    ],
    note: "Відкидання гілки в <code>if constexpr</code> працює лише в шаблоні й лише для умови, що залежить від його параметра. У звичайному <code>if</code> компілюються обидві гілки. SFINAE мовчки прибирає непридатний шаблон із кандидатів.",
    work: "Напишіть шаблон <code>to_text(T)</code> з <code>if constexpr</code>: для цілих повертає <code>int:</code> і число, для <code>std::string</code> повертає <code>str:</code> і рядок. Додайте <code>static_assert</code> для типу, якого не підтримуєте.",
    tasks: [
      "Чому звичайний <code>if</code> не підходить для вибору між <code>x.size()</code> і <code>static_cast</code> у шаблоні, а <code>if constexpr</code> підходить?",
      "Що відбувається, коли підстановка типу в <code>enable_if_t</code> дає хибну умову, і чому це не помилка компіляції саме по собі?",
    ],
  },
  {
    t: "Шаблони зі змінною кількістю аргументів і fold-вирази",
    ch: "Абстракція",
    adv: true,
    easy: "Пакет параметрів це торба з довільною кількістю предметів. Ви не знаєте наперед, скільки їх, але можете сказати «дістань усе по одному» (рекурсія) або «склади всі разом одним рухом» (fold-вираз).",
    p: [
      "Звичайний шаблон приймає фіксовану кількість аргументів. А <code>std::make_unique</code>, <code>std::tuple</code> чи логер із форматом приймають скільки завгодно. Це можливо завдяки <b>variadic templates</b> (шаблонам зі змінною кількістю аргументів). Запис <code>template &lt;class... Args&gt;</code> оголошує <b>пакет параметрів типів</b> <code>Args</code>, а <code>Args... args</code> у списку параметрів функції це <b>пакет значень</b>.",
      "Модель у голові: пакет це список, який існує лише під час компіляції. Кількість елементів дає <code>sizeof...(args)</code>. Пакет не можна індексувати чи перебирати циклом <code>for</code>; його <b>розгортають</b> трьокрапкою справа від виразу: <code>f(args...)</code> перетворюється на <code>f(a1, a2, a3)</code>, а <code>g(h(args)...)</code> на <code>g(h(a1), h(a2), h(a3))</code>. Трьокрапка застосовується до всього виразу ліворуч від неї.",
      "Класичний спосіб обробки це <b>рекурсія</b>: функція бере перший аргумент, обробляє його й викликає себе з рештою. Потрібна ще функція для порожнього пакета, яка завершує рекурсію. Це працює в будь-якому стандарті, але довго пишеться й породжує по функції на кожну довжину пакета.",
      "C++17 додав <b>fold-вирази</b>: стиснення пакета одним оператором. Чотири форми: <code>(args + ...)</code> (унарна права згортка), <code>(... + args)</code> (унарна ліва), <code>(args + ... + 0)</code> (бінарна права з початковим значенням) і <code>(0 + ... + args)</code>. Дужки обов'язкові. Так <code>sum(1, 2, 3)</code> стає <code>1 + (2 + 3)</code> без жодної рекурсії. Підходить будь-який бінарний оператор, зокрема <code>&amp;&amp;</code>, <code>||</code> і кома.",
      "Кома у fold це спосіб «виконати дію для кожного аргументу»: <code>((std::cout &lt;&lt; xs), ...);</code> надрукує все по черзі. Для <b>порожнього</b> пакета унарна згортка допустима тільки для трьох операторів: <code>&amp;&amp;</code> (дає <code>true</code>), <code>||</code> (дає <code>false</code>) і <code>,</code> (дає <code>void()</code>). Для <code>+</code> порожній пакет без початкового значення це помилка компіляції; тому пишуть форму з <code>0</code>.",
      "Ідіоми. Для передачі аргументів далі без копій: <code>template &lt;class T, class... Args&gt; ... (Args&amp;&amp;... args)</code> і <code>std::forward&lt;Args&gt;(args)...</code>. Це «досконала передача»: так влаштовані <code>make_unique</code> та <code>emplace_back</code>. Перевірку «тип входить у список» пишуть як <code>(std::is_same_v&lt;T, Ts&gt; || ...)</code>. Допоміжний <code>overloaded</code> із попередніх уроків: <code>struct overloaded : Ts...</code> наслідує від усіх лямбд пакета, а <code>using Ts::operator()...;</code> розгортає <code>using</code>.",
      "Пастки. Пакет у кінці списку параметрів функції приймає «все решта», але перевантаження з пакетом мають найнижчий пріоритет. Забута трьокрапка або дужки у fold дають довгі помилки. У рекурсії легко забути порожній випадок. Не зловживайте: коли аргументи однакового типу, простіше взяти <code>std::initializer_list</code> або <code>std::vector</code>. Далі розглянемо шаблонну техніку, де клас передає себе як параметр своєму батькові: CRTP.",
    ],
    code: [
      String.raw`#include <iostream>

void print() { std::cout << "\n"; }

template <class T, class... Rest>
void print(const T& first, const Rest&... rest) {
    std::cout << first;
    if (sizeof...(rest) > 0) std::cout << ", ";
    print(rest...);
}

int main() {
    print(1, "два", 3.5);
    print("один");
    print();
    return 0;
}
`,
      String.raw`#include <iostream>

template <class... Ts>
auto sum(Ts... xs) { return (xs + ... + 0); }

template <class... Ts>
bool all_positive(Ts... xs) { return ((xs > 0) && ...); }

template <class... Ts>
void join(const Ts&... xs) {
    bool first = true;
    ((std::cout << (first ? "" : ", ") << xs, first = false), ...);
    std::cout << "\n";
}

int main() {
    std::cout << sum(1, 2, 3) << " " << sum() << " " << sum(1.5, 2) << "\n";
    std::cout << all_positive(1, 2, 3) << all_positive(1, -2) << all_positive() << "\n";
    join("a", 1, 2.5);
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

struct Point {
    int x, y;
    Point(int a, int b) : x(a), y(b) {}
};

template <class T, class... Args>
std::unique_ptr<T> create(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

int main() {
    auto p = create<Point>(3, 4);
    auto s = create<std::string>(3, 'x');
    std::cout << p->x << "," << p->y << " " << *s << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: унарна згортка з + не допускає порожнього пакета
#include <iostream>

template <class... Ts>
auto sum(Ts... xs) { return (xs + ...); }

int main() {
    std::cout << sum(1, 2) << "\n";
    std::cout << sum() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <type_traits>

template <class T, class... Ts>
inline constexpr bool is_one_of_v = (std::is_same_v<T, Ts> || ...);

static_assert(is_one_of_v<int, char, int, double>, "int є в списку");
static_assert(!is_one_of_v<std::string, char, int>, "рядка в списку немає");

template <class T, class... Rest>
T min_of(T first, Rest... rest) {
    T m = first;
    ((m = rest < m ? rest : m), ...);
    return m;
}

int main() {
    std::cout << min_of(5, 2, 9, 4) << "\n";
    std::cout << min_of(1.5, 0.5) << "\n";
    std::cout << is_one_of_v<char, int, char> << "\n";
    return 0;
}
`,
    ],
    note: "Трьокрапка розгортає пакет: <code>f(args...)</code> дає <code>f(a1, a2, a3)</code>. Fold <code>(args + ... + 0)</code> стискає пакет оператором. Порожній пакет без початкового значення дозволений лише для <code>&amp;&amp;</code>, <code>||</code> і коми.",
    work: "Напишіть <code>sum_all(xs...)</code> через fold із початковим <code>0</code>, <code>any_negative(xs...)</code> через <code>||</code> і <code>count_args(xs...)</code> через <code>sizeof...</code>. Виведіть результат для кількох наборів аргументів, зокрема для порожнього набору, і поясніть отримані значення.",
    tasks: [
      "Який результат дає fold <code>(xs &amp;&amp; ...)</code> для порожнього пакета, і чому для <code>(xs + ...)</code> порожній пакет це помилка?",
      "Що означає запис <code>std::forward&lt;Args&gt;(args)...</code> і навіщо він у функціях типу <code>make_unique</code>?",
    ],
  },
  {
    t: "CRTP і статичний поліморфізм",
    ch: "Абстракція",
    adv: true,
    easy: "CRTP схожий на форму для випікання, яка заздалегідь знає, яке печиво з неї вийде. Базовий клас у шаблоні дізнається, хто його нащадок, і викликає його методи напряму, без «дзвінка по телефону» через віртуальну таблицю.",
    p: [
      "Віртуальні функції дають поліморфізм <b>під час виконання</b>: виклик іде через таблицю віртуальних функцій, і конкретний метод обирається під час роботи програми. Це гнучко, але має ціну: непрямий виклик, указівник на таблицю в кожному об'єкті, обмежені можливості інлайнінгу. Коли тип відомий уже при компіляції, є дешевша альтернатива: <b>CRTP</b> (Curiously Recurring Template Pattern), «дивно повторюваний шаблонний патерн».",
      "Суть у двох рядках: <code>template &lt;class D&gt; struct Base { ... };</code> і <code>struct Derived : Base&lt;Derived&gt; { ... };</code>. Нащадок передає <b>самого себе</b> як параметр шаблону своєму ж батькові. Тепер у <code>Base&lt;D&gt;</code> компілятор знає точний тип нащадка <code>D</code>, і метод бази може викликати метод нащадка простим приведенням: <code>static_cast&lt;const D&amp;&gt;(*this).impl()</code>.",
      "Модель у голові: база це «каркас алгоритму», нащадок постачає «деталі». База пише <code>print()</code>, який усередині викликає <code>area_impl()</code> нащадка. Усе вирішується при компіляції: жодних <code>virtual</code>, жодної таблиці, виклик <code>area_impl</code> можна повністю вбудувати. Така техніка називається <b>статичним поліморфізмом</b>. Для різних нащадків бази <code>Base&lt;A&gt;</code> і <code>Base&lt;B&gt;</code> це <b>різні</b> класи.",
      "Це накладає головне обмеження: у <code>std::vector</code> не покласти разом <code>Base&lt;A&gt;</code> і <code>Base&lt;B&gt;</code>, бо в них немає спільного типу. Якщо вам потрібна однорідна колекція різних типів, залишайтеся при віртуальних функціях. CRTP обирають, коли важлива швидкість і форма відома при компіляції: функція-шаблон <code>template &lt;class D&gt; void report(const Shape&lt;D&gt;&amp; s)</code> працює з будь-яким нащадком без втрат.",
      "Другий популярний вжиток: <b>міксини</b>, тобто «домішки» функціональності. Базовий клас додає нащадкові можливості, не знаючи заздалегідь його типу. Приклад: лічильник екземплярів, де кожен нащадок отримує <i>власну</i> статичну змінну, бо <code>Counted&lt;Apple&gt;</code> і <code>Counted&lt;Pear&gt;</code> різні класи. Інший приклад: з одного <code>operator&lt;</code> база виводить <code>&gt;</code>, <code>&lt;=</code> і <code>&gt;=</code>.",
      "Пастки. Нащадок мусить передати <b>саме себе</b>: якщо написати <code>struct Cat : Base&lt;Dog&gt;</code>, то <code>static_cast</code> у базі стане неправильним приведенням, і результат непередбачуваний. Захист: зробіть конструктор бази <code>protected</code>. Забули реалізувати метод у нащадку: помилка компіляції з'явиться лише при виклику, і повідомлення буває довге. База не може в тілі класу користуватися членами нащадка: на той момент <code>D</code> ще неповний; усе робіть у методах.",
      "Ідіома: назвіть методи нащадка з суфіксом на кшталт <code>_impl</code>, щоб не плутати з методами бази, і додайте приватну допоміжну функцію <code>self()</code>, що робить приведення. Тепер у вас є два способи виразити «спільний інтерфейс»: віртуальні функції (динамічно) і CRTP (статично). У наступному уроці побачимо третій, найсучасніший спосіб: сказати компілятору прямо, що саме мусить уміти тип, через концепти C++20.",
    ],
    code: [
      String.raw`#include <iostream>

template <class D>
struct Shape {
    double area() const { return static_cast<const D&>(*this).area_impl(); }
    void print() const { std::cout << "площа " << area() << "\n"; }
};

struct Square : Shape<Square> {
    explicit Square(double s) : side(s) {}
    double area_impl() const { return side * side; }
    double side;
};

struct Rect : Shape<Rect> {
    Rect(double w, double h) : w_(w), h_(h) {}
    double area_impl() const { return w_ * h_; }
    double w_, h_;
};

int main() {
    Square s(4);
    Rect r(2, 3);
    s.print();
    r.print();
    return 0;
}
`,
      String.raw`#include <iostream>
#include <type_traits>

template <class D>
struct Shape {
    double area() const { return static_cast<const D&>(*this).area_impl(); }
};

struct Square : Shape<Square> {
    explicit Square(double s) : side(s) {}
    double area_impl() const { return side * side; }
    double side;
};

struct Circle3 : Shape<Circle3> {
    double area_impl() const { return 3.0 * 2 * 2; }
};

template <class D>
void report(const Shape<D>& s) { std::cout << "report: " << s.area() << "\n"; }

static_assert(!std::is_polymorphic_v<Square>, "віртуальних функцій немає");

int main() {
    report(Square(5));
    report(Circle3());
    return 0;
}
`,
      String.raw`#include <iostream>

template <class T>
struct Counted {
    static inline int count = 0;
    Counted() { ++count; }
    Counted(const Counted&) { ++count; }
    ~Counted() { --count; }
};

struct Apple : Counted<Apple> {};
struct Pear : Counted<Pear> {};

int main() {
    Apple a1, a2;
    Pear p;
    {
        Apple a3 = a1;
        std::cout << "яблук: " << Counted<Apple>::count << "\n";
    }
    std::cout << "яблук: " << Counted<Apple>::count << ", груш: " << Counted<Pear>::count << "\n";
    (void)a2;
    (void)p;
    return 0;
}
`,
      String.raw`#include <iostream>

template <class D>
struct Ordered {
    friend bool operator>(const D& a, const D& b) { return b < a; }
    friend bool operator<=(const D& a, const D& b) { return !(b < a); }
    friend bool operator>=(const D& a, const D& b) { return !(a < b); }
};

struct Money : Ordered<Money> {
    explicit Money(int c) : cents(c) {}
    int cents;
};

bool operator<(const Money& a, const Money& b) { return a.cents < b.cents; }

int main() {
    Money a(100), b(250);
    std::cout << (a < b) << (a > b) << (a <= b) << (a >= b) << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: нащадок Circle не має area_impl(), яку викликає база
#include <iostream>

template <class D>
struct Shape {
    double area() const { return static_cast<const D&>(*this).area_impl(); }
};

struct Circle : Shape<Circle> {
    double radius = 1;
};

int main() {
    Circle c;
    std::cout << c.area() << "\n";
    return 0;
}
`,
    ],
    note: "CRTP: <code>struct D : Base&lt;D&gt;</code>. База знає тип нащадка й викликає його методи через <code>static_cast</code>, без віртуальної таблиці. Платимо тим, що <code>Base&lt;A&gt;</code> і <code>Base&lt;B&gt;</code> це різні типи, в одному контейнері їх не зберегти.",
    work: "Зробіть міксин <code>Counted&lt;T&gt;</code> зі статичним лічильником живих об'єктів і два класи <code>Apple</code>, <code>Pear</code>. Створіть кілька об'єктів у вкладеному блоці й виведіть лічильники до і після нього.",
    tasks: [
      "Чому не можна покласти в один <code>std::vector</code> об'єкти <code>Base&lt;A&gt;</code> і <code>Base&lt;B&gt;</code>, і коли тоді краще використати віртуальні функції?",
      "Чому лічильник <code>static</code> у <code>Counted&lt;T&gt;</code> для <code>Apple</code> і <code>Pear</code> не спільний?",
    ],
  },
  {
    t: "Концепти C++20: обмеження шаблонів",
    ch: "Абстракція",
    adv: true,
    easy: "Концепт це вимога в оголошенні про роботу: «потрібен водій із категорією B». Шаблон одразу каже, що саме мусить уміти тип, і компілятор відсікає непідходящих до початку роботи, зі зрозумілою відмовою замість довгого листа помилок.",
    p: [
      "У минулих уроках ми обмежували шаблони вручну: <code>enable_if</code>, <code>static_assert</code>, ідіома виявлення. Працює, але читається важко, а помилки компілятора довгі. У C++20 з'явилися <b>концепти</b> (concepts): іменовані вимоги до типу, записані прямо в оголошенні шаблону. Нагадаємо правило курсу: пісочниця збирає за C++17, тому код концептів ми показуємо блоками <code>// фрагмент: C++20</code>, а запускаємо лише C++17-аналоги.",
      "Концепт оголошують як <code>template &lt;typename T&gt; concept Number = std::integral&lt;T&gt; || std::floating_point&lt;T&gt;;</code>. Це булевий вираз від типу, обчислений при компіляції. Застосовують його замість слова <code>typename</code>: <code>template &lt;Number T&gt; T twice(T x)</code>. Є ще скорочений запис <code>auto twice(Number auto x)</code> і речення <code>requires</code> після списку параметрів. Стандартні концепти (<code>std::integral</code>, <code>std::same_as</code>, <code>std::convertible_to</code>) живуть у <code>&lt;concepts&gt;</code>.",
      "Для складніших вимог є <b>requires-вираз</b>: <code>requires(T x) { x.size(); }</code> перевіряє, що вираз у фігурних дужках <i>коректно компілюється</i> для типу. Можна вимагати й тип результату: <code>{ x.size() } -&gt; std::convertible_to&lt;std::size_t&gt;;</code>. Тобто концепт описує <b>інтерфейс</b> типу: які операції він підтримує. Це те, що в SFINAE ми робили через <code>void_t</code> і <code>declval</code>, але читається як звичайне речення.",
      "Модель у голові: концепт це <b>предикат над типом</b>, який перевіряється в момент виклику шаблону. Тип не підходить: компілятор не заходить у тіло, а одразу пише, яка саме вимога не виконана. Звичайний шаблон без обмежень перевіряється пізно, всередині тіла, і помилка вказує на рядок, про який ви не думали. Концепти переносять перевірку <i>на вхід</i>, і повідомлення стає короткою фразою «constraints not satisfied».",
      "Ще одна користь: <b>вибір перевантаження</b>. Дві функції з різними концептами можуть співіснувати, і компілятор вибере підходящу (а якщо підходять обидві, то ту, чий концепт «суворіший»). Це заміна <code>enable_if</code>-перевантажень, але без ребусу з <code>= 0</code> у параметрах. Поки C++17-аналог ми будуємо через <code>static_assert</code> із ознакою: помилка виникає в момент виклику, із вашим власним повідомленням.",
      "Ідіоми. Давайте концептам імена за здатністю (<code>Printable</code>, <code>Container</code>, <code>Number</code>), а не за типом. Тримайте їх малими й комбінуйте через <code>&amp;&amp;</code> та <code>||</code>. Пастки: концепт перевіряє лише <i>синтаксичну</i> можливість операції, а не те, що вона робить розумні речі; два концепти з однаковою назвою в різних просторах імен це різні концепти; не варто обмежувати все підряд, найчастіше потрібні 3-4 основні вимоги. Включайте C++20 у збірці прапорцем <code>-std=c++20</code>.",
      "Цим урок завершує просунуту частину глави про абстракцію: ви побачили, як C++ виражає «що вміє тип» трьома способами: віртуальні функції, CRTP і шаблони, обмежені концептами. Попереду глава про помилки: виключення, їхня ієрархія й безпека. Там ми повернемося до винятків, які в цій главі вже траплялися (<code>bad_optional_access</code>, <code>bad_variant_access</code>).",
    ],
    code: [
      String.raw`// фрагмент: C++20 (концепт і шаблон з обмеженням; збирайте з -std=c++20)
#include <concepts>
#include <iostream>
#include <string>

template <typename T>
concept Number = std::integral<T> || std::floating_point<T>;

template <Number T>
T twice(T x) { return x * 2; }

int main() {
    std::cout << twice(21) << "\n";
    std::cout << twice(1.5) << "\n";
    // twice(std::string("a")); // помилка: constraints not satisfied (std::string не Number)
}
`,
      String.raw`#include <iostream>
#include <type_traits>

template <class T>
inline constexpr bool is_number_v = std::is_integral_v<T> || std::is_floating_point_v<T>;

template <class T, std::enable_if_t<is_number_v<T>, int> = 0>
T twice(T x) { return x * 2; }

static_assert(is_number_v<int> && is_number_v<double>, "числа підходять");

int main() {
    std::cout << twice(21) << "\n";
    std::cout << twice(1.5) << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: std::string не є числом, жодне перевантаження twice не підходить
#include <iostream>
#include <string>
#include <type_traits>

template <class T>
inline constexpr bool is_number_v = std::is_integral_v<T> || std::is_floating_point_v<T>;

template <class T, std::enable_if_t<is_number_v<T>, int> = 0>
T twice(T x) { return x * 2; }

int main() {
    std::cout << twice(std::string("a")) << "\n";
    return 0;
}
`,
      String.raw`// фрагмент: C++20 (requires-вираз описує інтерфейс типу; збирайте з -std=c++20)
#include <concepts>
#include <cstddef>
#include <iostream>
#include <vector>

template <typename T>
concept Printable = requires(const T& x, std::ostream& os) { os << x; };

template <typename T>
concept Sized = requires(const T& c) {
    { c.size() } -> std::convertible_to<std::size_t>;
};

void show(const Printable auto& x) { std::cout << x << "\n"; }

template <Sized C>
std::size_t count_of(const C& c) { return c.size(); }

int main() {
    show(42);
    std::cout << count_of(std::vector<int>{1, 2, 3}) << "\n";
}
`,
      String.raw`#include <iostream>
#include <string>
#include <type_traits>
#include <utility>

template <class T, class = void>
struct is_printable : std::false_type {};
template <class T>
struct is_printable<T, std::void_t<decltype(std::declval<std::ostream&>() << std::declval<const T&>())>>
    : std::true_type {};

struct Opaque {};

static_assert(is_printable<int>::value, "int виводиться в потік");
static_assert(!is_printable<Opaque>::value, "Opaque не виводиться");

template <class T>
void show(const T& x) {
    static_assert(is_printable<T>::value, "T не можна вивести в потік");
    std::cout << x << "\n";
}

int main() {
    show(42);
    show(std::string("hi"));
    return 0;
}
`,
    ],
    note: "Концепт це предикат над типом при компіляції: <code>template &lt;Number T&gt;</code>. Помилка видається на вході, зі зрозумілим «constraints not satisfied». Аналог у C++17: <code>enable_if</code> чи <code>static_assert</code> з ознакою типу.",
    work: "Напишіть C++17-аналог концепту <code>Sized</code>: ознака <code>has_size</code> через <code>void_t</code> і функція <code>count_of</code> з <code>static_assert</code>. Виведіть розмір вектора й рядка. Нижче в коментарі запишіть той самий концепт у C++20.",
    tasks: [
      "Чим концепт <code>template &lt;Number T&gt;</code> краще за звичайний шаблон <code>template &lt;class T&gt;</code>, у якому перевірка типу відбувається лише всередині тіла функції?",
      "Чому в цьому курсі код концептів показано блоками «// фрагмент: C++20», а запускається лише C++17-аналог?",
    ],
  },
];
