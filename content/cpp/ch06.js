export const LESSONS_06 = [
  {
    t: "Виключення: throw, try і catch",
    ch: "Помилки",
    easy: "Виключення схоже на пожежну сигналізацію: той, хто помітив дим, не гасить усе сам, а вмикає тривогу. Вона йде коридорами вгору, доки не знайдеться служба, що вміє з цим працювати.",
    p: [
      "Досі наші функції вважали, що все йде добре. Але файл може не знайтися, число не розібратися, а дільник виявитися нулем. Функція, яка помітила проблему, часто не знає, що з нею робити: показати повідомлення, повторити спробу чи завершити програму. Це вирішує код вище за стеком викликів. <b>Виключення</b> це механізм, який дозволяє повідомити про проблему й передати рішення тому, хто його може ухвалити, не обважнюючи кожну функцію зайвими перевірками.",
      "Модель у голові з трьох слів. <code>throw</code> «кидає» об'єкт-виключення й негайно залишає поточну функцію. <code>try</code> позначає блок, у якому ми готові до проблем. <code>catch</code> ловить виключення певного типу й обробляє його. Якщо після <code>try</code> усе гаразд, усі <code>catch</code> пропускаються. Якщо щось кинули, виконання перестрибує з місця <code>throw</code> просто в підходящий <code>catch</code>, а решта рядків блока не виконується.",
      "Кидати можна значення будь-якого типу, але на практиці кидають об'єкти зі стандартної ієрархії, найчастіше <code>std::runtime_error</code> з <code>&lt;stdexcept&gt;</code>. Він несе текст, який дістають методом <code>what()</code>. Ловіть <b>за константним посиланням</b>: <code>catch (const std::runtime_error&amp; e)</code>. Так ми не копіюємо об'єкт і не відрізаємо від нього частину. Тип у дужках <code>catch</code> має збігатися з кинутим (або бути його базою, про це в наступному уроці).",
      "Найцікавіше відбувається між <code>throw</code> і <code>catch</code>. Виключення піднімається вгору викликами, і в кожній функції, яку воно залишає, знищуються всі локальні об'єкти, причому викликаються їхні деструктори. Це називають <b>розкручуванням стека</b>. Саме тому в C++ ресурси ховають в об'єкти: деструктор спрацює навіть тоді, коли функція завершується не через <code>return</code>, а через виняток.",
      "Обробників може бути кілька, вони перевіряються зверху вниз, і спрацьовує перший підходящий. Обробник <code>catch (...)</code> ловить усе, але не знає типу, тож його ставлять останнім, зазвичай для журналу. Усередині <code>catch</code> можна передати виключення далі коротким <code>throw;</code> без виразу: так перекидають ту саму помилку, не змінюючи її. Не плутайте його з <code>throw e;</code>, який створює копію, про що ми поговоримо згодом.",
      "Головна пастка: <b>необроблений виняток</b>. Якщо жоден <code>catch</code> на шляху не підійшов, програма викликає <code>std::terminate</code> і аварійно завершується, а частина виводу може пропасти, бо буфер не скидається. Інша пастка: виключення для звичайного перебігу подій, наприклад як спосіб вийти з циклу. Це повільно й заплутано. Кидайте їх для справді непередбачених ситуацій, коли функція не може виконати свою роботу.",
      "Підсумок: <code>throw</code> припиняє поточний шлях, <code>try</code> обмежує зону, <code>catch</code> обробляє за типом, а деструктори прибирають за собою під час розкручування. Які типи кидати і як побудувати з них зрозумілу родину, розкажемо в наступному уроці, де з'явиться ієрархія <code>std::exception</code> і власні виключення.",
    ],
    code: [
      String.raw`#include <iostream>

int main() {
    try {
        std::cout << "до throw\n";
        throw 42;
        std::cout << "цей рядок не виконається\n";
    } catch (int code) {
        std::cout << "спіймали код " << code << "\n";
    }
    std::cout << "програма живе далі\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>

double divide(double a, double b) {
    if (b == 0) throw std::runtime_error("ділення на нуль");
    return a / b;
}

int main() {
    try {
        std::cout << divide(10, 4) << "\n";
        std::cout << divide(1, 0) << "\n";
        std::cout << "сюди не дійдемо\n";
    } catch (const std::runtime_error& e) {
        std::cout << "помилка: " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>

struct Noisy {
    const char* name;
    explicit Noisy(const char* n) : name(n) { std::cout << "+" << name << "\n"; }
    ~Noisy() { std::cout << "-" << name << "\n"; }
};

void inner() {
    Noisy a("inner");
    throw std::runtime_error("збій у inner");
}

void middle() {
    Noisy b("middle");
    inner();
    std::cout << "сюди не дійдемо\n";
}

int main() {
    try {
        Noisy c("main");
        middle();
    } catch (const std::exception& e) {
        std::cout << "catch: " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>

void check(int v) {
    if (v < 0) throw std::invalid_argument("від'ємне");
    if (v == 0) throw "нуль";
    std::cout << "ok " << v << "\n";
}

void process(int v) {
    try {
        check(v);
    } catch (...) {
        std::cout << "журнал: щось пішло не так\n";
        throw;
    }
}

int main() {
    for (int v : {5, -1, 0}) {
        try {
            process(v);
        } catch (const std::invalid_argument& e) {
            std::cout << "аргумент: " << e.what() << "\n";
        } catch (...) {
            std::cout << "невідомий тип\n";
        }
    }
    return 0;
}
`,
      String.raw`// аварія: виключення нікому ловити, тож викликається std::terminate
#include <iostream>
#include <stdexcept>

void load() { throw std::runtime_error("файл не знайдено"); }

int main() {
    std::cout << "починаємо" << std::endl;
    load();
    std::cout << "сюди не дійдемо" << std::endl;
    return 0;
}
`,
    ],
    note: "<code>throw</code> залишає функцію, <code>try</code> обмежує зону, <code>catch</code> ловить за типом, найкраще за константним посиланням. Під час розкручування стека деструктори локальних об'єктів спрацьовують самі. Непійманий виняток аварійно завершує програму.",
    work: "Виключення використовують там, де функція не може виконати роботу: не відкрився файл, прийшли биті дані, закінчилась пам'ять. Низькорівневий код кидає, а один обробник нагорі показує користувачеві зрозуміле повідомлення.",
    tasks: [
      "Що станеться з рядками після <code>throw</code> у тому самому блоці <code>try</code> і з локальними об'єктами функцій, які виключення залишає?",
      "Чим <code>throw;</code> усередині <code>catch</code> відрізняється від звичайного <code>throw</code> нового об'єкта і що буде, якщо підходящого <code>catch</code> немає?",
    ],
  },
  {
    t: "Ієрархія std::exception і власні виключення",
    ch: "Помилки",
    easy: "Виключення в стандартній бібліотеці влаштовані як родовід: «будь-яка помилка» на вершині, нижче «помилка в логіці» й «помилка під час роботи». Можна ловити цілу гілку або лише конкретного нащадка.",
    p: [
      "У минулому уроці ми кидали числа й рядки, але так робити не варто: за таким значенням не видно, що сталося, а ловити різні типи окремо незручно. Стандартна бібліотека пропонує готову родину. На вершині стоїть <code>std::exception</code> з віртуальним методом <code>what()</code>, що повертає опис помилки. Правило: все, що кидаєте, успадковуйте від <code>std::exception</code> (прямо чи через її нащадків), і тоді один <code>catch</code> зможе зловити будь-яку помилку.",
      "Нащадків два основні. <code>std::logic_error</code> означає помилку програміста, яку можна було б передбачити: його нащадки <code>std::invalid_argument</code> («передали недопустимий аргумент») і <code>std::out_of_range</code> (вихід за межі). <code>std::runtime_error</code> означає проблему, яку не передбачиш наперед: файл зник, мережа впала, дані биті. Усі вони живуть в <code>&lt;stdexcept&gt;</code>. Вибирайте найточніший тип: він сам документує причину.",
      "Бібліотека теж кидає ці типи. Метод <code>at()</code> контейнерів кидає <code>std::out_of_range</code>, на відміну від <code>[]</code>, а функції <code>std::stoi</code> і <code>std::stod</code> кидають <code>std::invalid_argument</code> на нерозбірливому тексті. Завдяки ієрархії обробник <code>catch (const std::exception&amp; e)</code> спіймає все це й надрукує <code>e.what()</code>. Але самі тексти <code>what()</code> у різних компіляторів різні, тож у логіці програми покладайтеся на тип, а не на текст.",
      "Власні виключення роблять так: <code>class ParseError : public std::runtime_error</code>, і в конструкторі передають повідомлення базі, а додаткові дані (номер рядка, код) зберігають у полях. Базовий клас сам реалізує <code>what()</code>. Можна й успадкувати безпосередньо від <code>std::exception</code> та перевизначити <code>what() const noexcept</code>, якщо хочете повну свободу. Тоді вказуйте <code>noexcept</code>: що саме він означає, розкаже окремий урок.",
      "Порядок обробників важливий. Якщо поставити <code>catch</code> бази перед нащадком, нащадок ніколи не спрацює, бо перший підходящий забирає все. Тому пишіть від <b>конкретного до загального</b>: спочатку <code>ParseError</code>, потім <code>std::runtime_error</code>, наприкінці <code>std::exception</code>. Ловіть завжди за посиланням, інакше об'єкт нащадка <b>зрізується</b> до бази і втрачає свою поведінку та поля.",
      "Є й тонша пастка зрізання: <code>throw e;</code> усередині <code>catch (const std::exception&amp; e)</code> кидає копію статичного типу <code>std::exception</code>, а не справжнього <code>ParseError</code>, тому зовнішній обробник нащадка вже не спрацює. Для передачі далі пишіть <code>throw;</code>. І ще: кидати щось, що не успадковує <code>std::exception</code>, значить, що <code>catch (const std::exception&amp;)</code> його пропустить, а програма аварійно завершиться.",
      "Підсумок: успадковуйте від <code>std::exception</code>, обирайте точний тип, ловіть за константним посиланням від конкретного до загального, а далі передавайте через <code>throw;</code>. Далі розглянемо, як писати код, що лишається правильним, навіть коли виключення пролітають крізь нього: безпеку виключень і RAII-захисники.",
    ],
    code: [
      String.raw`#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

void attempt(int kind) {
    try {
        if (kind == 0) {
            std::vector<int> v{1, 2, 3};
            std::cout << v.at(10) << "\n";
        } else if (kind == 1) {
            std::cout << std::stoi("abc") << "\n";
        } else {
            throw std::runtime_error("інша помилка");
        }
    } catch (const std::out_of_range&) {
        std::cout << "вихід за межі\n";
    } catch (const std::invalid_argument&) {
        std::cout << "не число\n";
    } catch (const std::exception&) {
        std::cout << "щось інше зі стандартної родини\n";
    }
}

int main() {
    for (int k = 0; k < 3; ++k) attempt(k);
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>
#include <string>

class ParseError : public std::runtime_error {
public:
    ParseError(const std::string& msg, int line)
        : std::runtime_error(msg), line_(line) {}
    int line() const { return line_; }

private:
    int line_;
};

void parseLine(int n, const std::string& text) {
    if (text.empty()) throw ParseError("порожній рядок", n);
    std::cout << n << ": " << text << "\n";
}

int main() {
    try {
        parseLine(1, "alpha");
        parseLine(2, "");
        parseLine(3, "beta");
    } catch (const ParseError& e) {
        std::cout << "рядок " << e.line() << ": " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`#include <exception>
#include <iostream>

class DiskFull : public std::exception {
public:
    const char* what() const noexcept override { return "диск заповнений"; }
};

class DiskFullAndLocked : public DiskFull {
public:
    const char* what() const noexcept override { return "диск заповнений і заблокований"; }
};

int main() {
    try {
        throw DiskFullAndLocked();
    } catch (const DiskFullAndLocked& e) {
        std::cout << "найточніший: " << e.what() << "\n";
    } catch (const DiskFull& e) {
        std::cout << "база: " << e.what() << "\n";
    }

    try {
        throw DiskFullAndLocked();
    } catch (const std::exception& e) {
        std::cout << "загальний обробник бачить: " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>

class ParseError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};

void relay(bool keepType) {
    try {
        throw ParseError("биті дані");
    } catch (const std::exception& e) {
        if (keepType) throw;
        throw e;
    }
}

void run(bool keepType) {
    try {
        relay(keepType);
    } catch (const ParseError&) {
        std::cout << "ParseError збережено\n";
    } catch (const std::exception&) {
        std::cout << "тип зрізано до std::exception\n";
    }
}

int main() {
    run(true);
    run(false);
    return 0;
}
`,
      String.raw`// аварія: std::string не є std::exception, тому catch його пропускає і викликається terminate
#include <exception>
#include <iostream>
#include <string>

void fail() { throw std::string("сира помилка"); }

int main() {
    try {
        std::cout << "викликаємо" << std::endl;
        fail();
    } catch (const std::exception& e) {
        std::cout << "спіймали: " << e.what() << std::endl;
    }
    std::cout << "сюди не дійдемо" << std::endl;
    return 0;
}
`,
    ],
    note: "Усе, що кидаєте, успадковуйте від <code>std::exception</code>: <code>logic_error</code> для помилок у логіці, <code>runtime_error</code> для збоїв середовища. Ловіть за константним посиланням від конкретного типу до загального, а передавайте далі через <code>throw;</code>.",
    work: "Бібліотеки оголошують власні типи помилок на кшталт <code>ConfigError</code> чи <code>NetworkError</code>, щоб виклик міг відрізнити «не знайдено налаштування» від «обірвалось з'єднання» й повернути зрозумілий код або повідомлення користувачеві чи журналу.",
    tasks: [
      "Чому <code>catch</code> для <code>std::exception</code> треба ставити після <code>catch</code> для його нащадка, а не перед ним?",
      "Що станеться з типом виключення, якщо в обробнику написати <code>throw e;</code> замість <code>throw;</code>?",
    ],
  },
  {
    t: "Безпека виключень і RAII-захисники",
    ch: "Помилки",
    easy: "Безпека виключень це як складати речі в рюкзак: якщо тривога пролунала посеред збирання, мають лишитися цілі або старі речі, або нова повна комплектація, а не пів-рюкзака й загублена половина.",
    p: [
      "Виключення можуть вилетіти з будь-якого місця, і код, який їх не очікував, лишає після себе безлад: втрачену пам'ять, незакриті ресурси, наполовину змінені дані. <b>Безпека виключень</b> означає, що ми заздалегідь пишемо код так, щоб це не ламало програму. Є кілька рівнів гарантій. Базова гарантія: нічого не тече, об'єкти лишаються в коректному стані, хоч і, можливо, зміненому. Сильна гарантія: операція або виконалась повністю, або не змінила нічого. Гарантія «не кидає»: операція не може викинути виняток.",
      "Головний інструмент вам уже знайомий: <b>RAII</b>. Якщо ресурс належить об'єкту на стеку, то під час розкручування деструктор сам його звільнить. Погляньте на пару <code>new</code> і <code>delete</code>: якщо між ними кидається виняток, <code>delete</code> ніколи не виконається, і пам'ять тече. Замініть сирий вказівник на <code>std::unique_ptr</code>, і проблема зникає, бо деструктор розумного вказівника спрацює за будь-якого виходу з функції.",
      "Коли готового класу немає, пишуть <b>захисник області видимості</b> (scope guard): маленький об'єкт, що зберігає дію очищення і виконує її в деструкторі. Приклад: у конструктор передають лямбду, яка скасовує зміну. Якщо все пройшло успішно, викликають <code>dismiss()</code>, і захисник нічого не робить. Так одна ідея замінює безліч розкиданих <code>try/catch</code> лише заради прибирання.",
      "Сильну гарантію зазвичай досягають за схемою «підготуй копію, зміни копію, лише потім обміняй». Усі операції, що можуть кинути, виконують над тимчасовою копією. Якщо щось викинуло, оригінал недоторканий. Якщо все вдалося, копію ставлять на місце операцією, яка не кидає, наприклад <code>swap</code>. Це дорожче за пряму зміну, тож застосовуйте там, де цілісність даних важить більше за швидкість.",
      "Правило для деструкторів: <b>вони не мають кидати</b>. Деструктори за умовчанням <code>noexcept</code>, і виключення, що вилітає з деструктора, негайно викликає <code>std::terminate</code>. Особливо підступно, якщо деструктор спрацьовує під час розкручування іншого виключення: два одночасні винятки C++ не вміє розв'язати. Тому все, що може кинути (скидання буфера, закриття з'єднання), робіть в окремому методі, а в деструкторі ловіть і гасіть помилки.",
      "Типова пастка: захоплення кількох ресурсів по черзі сирими вказівниками чи викликами <code>open</code> і <code>close</code> у різних місцях. Один виняток посередині лишає перший ресурс відкритим. Робіть так: кожен ресурс кладіть у власний об'єкт одразу після отримання. Тоді порядок звільнення (у зворотному порядку створення) гарантується мовою, і вам не треба згадувати про нього вручну.",
      "Підсумок: пишіть код із гарантією не гіршою за базову, віддавайте ресурси об'єктам-власникам і пам'ятайте, що деструктор не кидає. Є рішення, коли виключення взагалі недоречні: про вибір між виключеннями, кодами помилок і <code>assert</code> поговоримо в наступному уроці.",
    ],
    code: [
      String.raw`#include <iostream>
#include <stdexcept>

static int live = 0;
struct Res {
    Res() { ++live; }
    ~Res() { --live; }
};
static Res* leaked = nullptr;

void risky(bool fail) {
    Res* r = new Res;
    leaked = r;
    if (fail) throw std::runtime_error("збій");
    delete r;
    leaked = nullptr;
}

int main() {
    try {
        risky(true);
    } catch (const std::exception&) {
        std::cout << "живих ресурсів після винятку: " << live << "\n";
    }
    delete leaked;
    std::cout << "після ручного прибирання: " << live << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <stdexcept>

static int live = 0;
struct Res {
    Res() { ++live; }
    ~Res() { --live; }
};

void safe(bool fail) {
    auto r = std::make_unique<Res>();
    if (fail) throw std::runtime_error("збій");
}

int main() {
    try {
        safe(true);
    } catch (const std::exception&) {
        std::cout << "живих ресурсів після винятку: " << live << "\n";
    }
    return 0;
}
`,
      String.raw`#include <functional>
#include <iostream>
#include <stdexcept>
#include <vector>

class ScopeGuard {
public:
    explicit ScopeGuard(std::function<void()> undo) : undo_(std::move(undo)) {}
    ~ScopeGuard() { if (active_) undo_(); }
    void dismiss() { active_ = false; }
    ScopeGuard(const ScopeGuard&) = delete;
    ScopeGuard& operator=(const ScopeGuard&) = delete;

private:
    std::function<void()> undo_;
    bool active_ = true;
};

void addAll(std::vector<int>& v, int count, int failAt) {
    ScopeGuard rollback([&v, size = v.size()] { v.resize(size); });
    for (int i = 0; i < count; ++i) {
        if (i == failAt) throw std::runtime_error("збій на елементі");
        v.push_back(i);
    }
    rollback.dismiss();
}

int main() {
    std::vector<int> v{100};
    try {
        addAll(v, 4, 2);
    } catch (const std::exception&) {
        std::cout << "відкат, розмір " << v.size() << "\n";
    }
    addAll(v, 4, -1);
    std::cout << "успіх, розмір " << v.size() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

void addNames(std::vector<std::string>& list, const std::vector<std::string>& incoming) {
    std::vector<std::string> copy = list;
    for (const auto& s : incoming) {
        if (s.empty()) throw std::invalid_argument("порожнє ім'я");
        copy.push_back(s);
    }
    list.swap(copy);
}

int main() {
    std::vector<std::string> list{"Ада"};
    try {
        addNames(list, {"Біла", "", "Вік"});
    } catch (const std::invalid_argument&) {
        std::cout << "збій, у списку " << list.size() << "\n";
    }
    addNames(list, {"Біла", "Вік"});
    std::cout << "успіх, у списку " << list.size() << "\n";
    return 0;
}
`,
      String.raw`// аварія: виняток вилітає з деструктора, який за умовчанням noexcept, і викликається terminate
#include <iostream>
#include <stdexcept>

void closeConnection() { throw std::runtime_error("не вдалося закрити"); }

struct Connection {
    ~Connection() { closeConnection(); }
};

int main() {
    std::cout << "відкриваємо" << std::endl;
    {
        Connection c;
    }
    std::cout << "сюди не дійдемо" << std::endl;
    return 0;
}
`,
    ],
    note: "Тримайте ресурси в об'єктах: <code>unique_ptr</code>, власні класи, захисник області видимості. Для сильної гарантії працюйте над копією й обмінюйте наприкінці. Деструктор ніколи не кидає: виключення з нього завершує програму.",
    work: "Транзакції з відкатом, блокування, тимчасові файли й підключення до бази закривають через RAII-об'єкти. Так сервер лишається в цілісному стані, навіть коли запит обірвався посеред операції, а ресурси не накопичуються й не витікають із часом.",
    tasks: [
      "Чим відрізняються базова й сильна гарантії безпеки виключень і як у коді отримати сильну?",
      "Чому виключення в деструкторі небезпечне і як правильно діяти, якщо закриття ресурсу може бути невдалим?",
    ],
  },
  {
    t: "Стратегії: виключення, коди помилок і assert",
    ch: "Помилки",
    easy: "Помилки бувають різні, як неприємності вдома: розбита чашка (прибрав і живеш далі), закінчилась кава (повідомив родині), а помилка в кресленні будинку взагалі означає, що будували неправильно. На кожну потрібна своя реакція.",
    p: [
      "Виключення не єдиний спосіб повідомити про помилку, і не завжди найкращий. Є три основні стратегії. <b>Виключення</b> передають проблему вгору й не дозволяють її проігнорувати. <b>Коди помилок</b> (або результат, що несе помилку) повертаються як звичайне значення. <b>assert</b> перевіряє припущення програміста й зупиняє програму, якщо воно хибне. Потрібно вміти вибирати, а не молитися на один інструмент.",
      "Почніть із запитання: чия це вина? Якщо помилка в самій програмі (передали індекс, який за контрактом не може бути за межами, порушено інваріант класу), це <b>помилка програміста</b>. Її не обробляють, її виправляють, тож тут підходить <code>assert</code>. Якщо ж проблема зовнішня (користувач ввів сміття, файл зник, мережа впала), це <b>очікувана помилка середовища</b>, і програма мусить на неї відреагувати: виключенням або кодом.",
      "<b>Коди помилок</b> добре підходять, коли збій частий і нормальний. Розбір рядка, який часто виявляється не числом, не варто робити «виняткового» шляху: він повільніший і гучніший. Функція повертає <code>bool</code>, <code>enum</code> або <code>std::optional</code>, а виклик одразу перевіряє. Мінус у тому, що перевірку легко забути: код мовчки піде далі з порожнім значенням, і компілятор нічого не скаже.",
      "<b>Виключення</b> доречні, коли збій рідкісний, а обробити його вміє лише код далеко вгорі. Проміжні функції не засмічуються перевірками, а забути обробити помилку не вийде: вона або буде спіймана, або завершить програму. Також виключення єдиний чесний спосіб повідомити про невдачу в конструкторі, адже конструктор не має значення, що повертається. Мінус: шлях виконання стає менш помітним, а код потрібно писати з урахуванням безпеки виключень.",
      "<b>assert</b> з <code>&lt;cassert&gt;</code> перевіряє умову під час виконання. Якщо вона хибна, програма друкує місце й причину та викликає <code>abort</code>. У випуску з визначеним <code>NDEBUG</code> усі <code>assert</code> зникають, тому в них не можна ховати роботу з побічними ефектами: <code>assert(read() == 0)</code> перестане читати. Ще важливіше: <code>assert</code> не для помилок користувача, адже у випуску його не буде, а перевірка вхідних даних потрібна завжди.",
      "Пастки: змішувати стратегії в одному інтерфейсі (частина функцій кидає, частина повертає коди, і виклик не знає, чого чекати) і обробляти <code>assert</code>-помилку як виняток. Правило: у межах одного модуля тримайтеся однієї стратегії для зовнішніх помилок і документуйте її. Для внутрішніх інваріантів завжди <code>assert</code>. На межі модулів можна перетворити одне на інше: прочитати код і кинути виняток, чи спіймати виняток і повернути код.",
      "Підсумок: збій частий і локальний, повертайте результат; збій рідкісний і обробляється далеко, кидайте виключення; порушення контракту всередині коду, ставте <code>assert</code>. Але виключення мають ціну й особливості, які впливають на дизайн: у наступному (просунутому) уроці розберемо <code>noexcept</code> і <code>std::terminate</code>.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

enum class ParseStatus { Ok, Empty, NotNumber };

ParseStatus parseDigit(const std::string& s, int& out) {
    if (s.empty()) return ParseStatus::Empty;
    if (s[0] < '0' || s[0] > '9') return ParseStatus::NotNumber;
    out = s[0] - '0';
    return ParseStatus::Ok;
}

int main() {
    for (std::string s : {"7", "", "x"}) {
        int d = 0;
        ParseStatus st = parseDigit(s, d);
        if (st == ParseStatus::Ok) std::cout << "цифра " << d << "\n";
        else if (st == ParseStatus::Empty) std::cout << "порожньо\n";
        else std::cout << "не цифра\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <optional>
#include <string>

std::optional<int> parseDigit(const std::string& s) {
    if (s.empty() || s[0] < '0' || s[0] > '9') return std::nullopt;
    return s[0] - '0';
}

int main() {
    for (std::string s : {"4", "?"}) {
        if (auto d = parseDigit(s)) std::cout << s << " -> " << *d << "\n";
        else std::cout << s << " -> немає значення\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>
#include <string>

int parseDigitOrThrow(const std::string& s) {
    if (s.empty() || s[0] < '0' || s[0] > '9')
        throw std::invalid_argument("очікувалась цифра: " + s);
    return s[0] - '0';
}

int sumDigits(const std::string& a, const std::string& b) {
    return parseDigitOrThrow(a) + parseDigitOrThrow(b);
}

int main() {
    try {
        std::cout << sumDigits("3", "4") << "\n";
        std::cout << sumDigits("3", "z") << "\n";
    } catch (const std::invalid_argument& e) {
        std::cout << "помилка: " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`#include <cassert>
#include <iostream>
#include <vector>

// Контракт: список не порожній. Порушити його може лише помилка програміста.
int firstOf(const std::vector<int>& v) {
    assert(!v.empty() && "firstOf потребує непорожнього списку");
    return v.front();
}

int main() {
    std::vector<int> v{8, 9};
    std::cout << firstOf(v) << "\n";
    return 0;
}
`,
      String.raw`// аварія: assert бачить порушений контракт і викликає abort
#include <cassert>
#include <iostream>
#include <vector>

int firstOf(const std::vector<int>& v) {
    assert(!v.empty() && "firstOf потребує непорожнього списку");
    return v.front();
}

int main() {
    std::vector<int> v;
    std::cout << "перед викликом" << std::endl;
    std::cout << firstOf(v) << "\n";
    return 0;
}
`,
    ],
    note: "Збій частий і локальний: повертайте код чи <code>optional</code>. Рідкісний і обробляється далеко: кидайте виключення. Порушення контракту всередині коду ловить <code>assert</code>, але він зникає з <code>NDEBUG</code>, тож для вхідних даних не годиться.",
    work: "Розбір введення користувача й конфігурації зазвичай повертає результат із помилкою, бо збій там нормальний. Відкриття бази чи нестача пам'яті кидають виключення, а внутрішні інваріанти контейнерів перевіряє <code>assert</code> у налагоджувальній збірці.",
    tasks: [
      "Чому перевірку введення користувача не можна замінити на <code>assert</code>?",
      "У яких випадках код помилки зручніший за виключення, а в яких навпаки?",
    ],
  },
  {
    t: "noexcept, terminate і ціна виключень",
    ch: "Помилки",
    adv: true,
    easy: "Позначка <code>noexcept</code> схожа на табличку «тут тривог не буває». Усі навколо планують свої дії з урахуванням цього. А якщо тривога все ж прозвучить, система не шукатиме рятувальників, а просто вимкне світло.",
    p: [
      "Специфікатор <code>noexcept</code> у кінці оголошення функції обіцяє: виключення з неї не вилетять. Це частина інтерфейсу, схожа на <code>const</code>. Він дозволяє компілятору генерувати простіший код і, що важливіше, дозволяє бібліотеці вибирати швидші алгоритми. Є й оператор <code>noexcept(вираз)</code>: він повертає <code>true</code> або <code>false</code> під час компіляції, залежно від того, чи вираз оголошений нездатним кидати.",
      "Що буде, якщо обіцянку порушити? Виключення, що намагається вийти з <code>noexcept</code>-функції, не розкручує стек далі: програма негайно викликає <code>std::terminate</code>, який за умовчанням викликає <code>abort</code>. Звідси практичне правило: <code>noexcept</code> ставте лише там, де справді впевнені, що виняток не вилетить, або де сам збій не варто переживати. Деструктори вже неявно <code>noexcept</code>, про що ми говорили раніше.",
      "Головна користь <code>noexcept</code> стосується <b>переміщення</b>. Коли <code>std::vector</code> розширюється, він мусить перенести старі елементи в нову пам'ять. Якщо один елемент кине виняток посередині, вектор хотів би повернути все як було, а це можливо, лише коли старі елементи не зіпсовано. Тому переміщувати він наважується, лише якщо конструктор переміщення <code>noexcept</code>. Інакше копіює, що значно дорожче для великих об'єктів. Пишіть <code>noexcept</code> на конструкторах і присвоєннях переміщення.",
      "Подивимося на ціну виключень чесно. У типових реалізаціях шлях без виключень майже безкоштовний: таблиці обробників лежать окремо від коду й не виконуються. Зате сам <b>викид</b> дорогий: він шукає обробник, розкручує стек, викликає деструктори. Такий виклик у тисячі разів повільніший за звичайний <code>return</code>. Висновок: виключення годяться для рідкісних збоїв, а не для частого, штатного шляху, і цим пояснюється порада попереднього уроку.",
      "<code>std::terminate</code> викликається не лише з <code>noexcept</code>. Він спрацьовує, коли виключення не спіймано, коли деструктор кидає під час розкручування, коли <code>join</code> чи інший потік мав помилку. Можна встановити свій обробник через <code>std::set_terminate</code>, щоб записати діагностику, але він усе одно повинен завершити програму: повернутися з нього не можна. Це місце для журналу, а не для відновлення.",
      "Пастки: поставити <code>noexcept</code> на функцію, що викликає код, який може кинути (наприклад, виділяє пам'ять через <code>new</code> чи <code>std::string</code>); спокуса «заради швидкості» позначити нею все підряд. Безпечний варіант: усередині <code>noexcept</code>-функції ловіть усе й перетворюйте на код помилки чи <code>optional</code>, тоді межа <code>noexcept</code> справжня. Не ставте її на функції, які за контрактом можуть кинути.",
      "Підсумок: <code>noexcept</code> це обіцянка з наслідком у вигляді <code>terminate</code>, найпотрібніша для переміщення й деструкторів, а виключення дешеві, коли їх не кидають, і дорогі, коли кидають. Якщо виключення вам не підходять, є третій шлях: повертати результат, що несе або значення, або помилку. Саме цьому присвячений наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

int plain(int x) { return x + 1; }
int safe(int x) noexcept { return x + 1; }
std::string name() noexcept { return "abc"; }

int main() {
    std::cout << std::boolalpha;
    std::cout << "plain: " << noexcept(plain(1)) << "\n";
    std::cout << "safe: " << noexcept(safe(1)) << "\n";
    std::cout << "int + int: " << noexcept(1 + 2) << "\n";
    std::cout << "name: " << noexcept(name()) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <type_traits>
#include <vector>

static_assert(std::is_nothrow_destructible_v<std::string>, "деструктор не кидає");
static_assert(std::is_nothrow_move_constructible_v<std::vector<int>>, "переміщення вектора не кидає");

struct Slow {
    Slow() = default;
    Slow(const Slow&) {}
    Slow(Slow&&) {}
};

struct Fast {
    Fast() = default;
    Fast(const Fast&) {}
    Fast(Fast&&) noexcept {}
};

int main() {
    std::cout << std::boolalpha;
    std::cout << "Slow переміщується без винятків: " << std::is_nothrow_move_constructible_v<Slow> << "\n";
    std::cout << "Fast переміщується без винятків: " << std::is_nothrow_move_constructible_v<Fast> << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <vector>

static int copies = 0;
static int moves = 0;

template <bool NoThrowMove>
struct Item {
    Item() = default;
    Item(const Item&) { ++copies; }
    Item(Item&&) noexcept(NoThrowMove) { ++moves; }
};

template <bool NoThrowMove>
void grow(const char* label) {
    copies = moves = 0;
    std::vector<Item<NoThrowMove>> v;
    v.reserve(2);
    v.emplace_back();
    v.emplace_back();
    v.emplace_back();
    std::cout << label << ": копій " << copies << ", переміщень " << moves << "\n";
}

int main() {
    grow<false>("без noexcept");
    grow<true>("з noexcept");
    return 0;
}
`,
      String.raw`#include <iostream>
#include <optional>
#include <stdexcept>
#include <string>

int risky(const std::string& s) {
    if (s.empty()) throw std::invalid_argument("порожній текст");
    return static_cast<int>(s.size());
}

// Межа noexcept: усередині ловимо все, назовні віддаємо optional.
std::optional<int> tryRisky(const std::string& s) noexcept {
    try {
        return risky(s);
    } catch (...) {
        return std::nullopt;
    }
}

int main() {
    for (std::string s : {"abc", ""}) {
        auto r = tryRisky(s);
        if (r) std::cout << "довжина " << *r << "\n";
        else std::cout << "збій без винятку назовні\n";
    }
    return 0;
}
`,
      String.raw`// аварія: виключення виходить з noexcept-функції, тож одразу викликається std::terminate
#include <cstdlib>
#include <exception>
#include <iostream>
#include <stdexcept>

void broken() noexcept {
    throw std::runtime_error("обіцянку порушено");
}

int main() {
    std::set_terminate([] {
        std::cout << "terminate: програма зупинена" << std::endl;
        std::abort();
    });
    std::cout << "перед викликом" << std::endl;
    broken();
    std::cout << "сюди не дійдемо" << std::endl;
    return 0;
}
`,
    ],
    note: "<code>noexcept</code> обіцяє, що виняток не вилетить; порушення негайно викликає <code>std::terminate</code>. Найважливіше ставити його на переміщення, щоб <code>vector</code> не копіював. Без викиду виключення майже безкоштовні, викид дорогий.",
    work: "У бібліотеках і рушіях <code>noexcept</code> стоїть на переміщеннях, <code>swap</code> і деструкторах. Для критичних до часу циклів виключення прибирають зі штатного шляху, залишаючи їх для рідкісних збоїв, а на межах із бібліотеками ловлять усе й повертають код.",
    tasks: [
      "Що відбувається, коли виключення виходить з функції, оголошеної <code>noexcept</code>?",
      "Чому конструктор переміщення варто позначати <code>noexcept</code>, коли об'єкти лежать у <code>std::vector</code>?",
    ],
  },
  {
    t: "Результат без виключень: Result на variant і std::expected",
    ch: "Помилки",
    adv: true,
    easy: "Результат без виключень нагадує запечатаний конверт від пошти: усередині або посилка, або записка з причиною відмови. Відкривши конверт, ти завжди знаєш, що саме отримав, і не мусиш чекати аварії.",
    p: [
      "Іноді виключення не підходять: у коді, де їх вимкнено, на гарячих шляхах, де збій частий, або в стилі, де помилки є звичайним значенням. Тоді функція повертає <b>результат</b>: об'єкт, що містить або успішне значення, або опис помилки. <code>std::optional</code> уже вміє «є значення чи немає», але не каже, чому його немає. Нам потрібен тип «значення або помилка».",
      "У C++17 такий тип легко збудувати зі знайомого <code>std::variant</code>. Оголосимо <code>struct Error</code> з текстом і скористаємося псевдонімом <code>template &lt;class T&gt; using Result = std::variant&lt;T, Error&gt;</code>. Функція, яка може не вдатися, повертає <code>Result&lt;int&gt;</code>: або число, або <code>Error</code>. Це видно просто з сигнатури, і виклик не може непомітно проігнорувати помилку, бо без розбору варіанта значення не дістати.",
      "Розбирають результат так: <code>std::holds_alternative&lt;Error&gt;(r)</code> перевіряє, що всередині, а <code>std::get&lt;int&gt;(r)</code> дістає значення. Зручніше <code>std::visit</code> з набором лямбд, коли кожен варіант має власну гілку, і компілятор стежить, щоб покрито обидва. Для лямбд у <code>visit</code> використовують допоміжний шаблон <code>overloaded</code>, який склеює їх у один об'єкт.",
      "Справжня сила результату в ланцюжках. Нехай кроки такі: розібрати число, перевірити діапазон, поділити. Якщо кожен крок повертає <code>Result</code>, пишуть допоміжну функцію <code>andThen</code>: вона отримує результат і наступний крок. Якщо результат уже помилка, вона повертає її й крок не викликає. Якщо ні, викликає крок зі значенням. Так помилка сама «пробігає» мимо решти кроків, і не потрібні нескінченні <code>if</code>.",
      "У C++23 з'явився готовий тип <code>std::expected&lt;T, E&gt;</code> із заголовка <code>&lt;expected&gt;</code>. Він робить те саме, але акуратніше: значення читається через <code>*r</code> чи <code>r.value()</code>, помилка через <code>r.error()</code>, а повертати помилку пишуть <code>std::unexpected(err)</code>. Є й готові методи <code>and_then</code> і <code>transform</code>. У нашій пісочниці стандарт C++17, тож блок із ним ми не запускаємо, але читати його варто вміти.",
      "Пастки. По-перше, <code>std::get</code> з неправильним типом кидає <code>std::bad_variant_access</code>: це виключення, і необроблене воно завершить програму, тож завжди спершу перевіряйте. По-друге, якщо типи значення й помилки однакові (наприклад, обидва <code>std::string</code>), <code>variant</code> стає двозначним, бо <code>get&lt;T&gt;</code> не знає, який варіант вибрати. Тому помилку загортають у власний тип, як ми зробили зі структурою <code>Error</code>.",
      "Підсумок: результат робить помилку видимою частиною типу, а ланцюжки кроків зупиняються на першій невдачі. Це кінець глави про помилки: ви знаєте виключення, їхні гарантії, коди й результати. У наступній главі перейдемо до паралелізму, де помилки між потоками теж доведеться передавати цілком свідомо.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <variant>

struct Error {
    std::string message;
};

template <class T>
using Result = std::variant<T, Error>;

Result<int> parseDigit(char c) {
    if (c < '0' || c > '9') return Error{std::string("не цифра: ") + c};
    return c - '0';
}

int main() {
    for (char c : {'8', 'q'}) {
        Result<int> r = parseDigit(c);
        if (std::holds_alternative<Error>(r)) {
            std::cout << "помилка: " << std::get<Error>(r).message << "\n";
        } else {
            std::cout << "значення " << std::get<int>(r) << "\n";
        }
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <variant>

struct Error {
    std::string message;
};

template <class T>
using Result = std::variant<T, Error>;

template <class... Ts>
struct overloaded : Ts... {
    using Ts::operator()...;
};
template <class... Ts>
overloaded(Ts...) -> overloaded<Ts...>;

Result<int> safeDivide(int a, int b) {
    if (b == 0) return Error{"ділення на нуль"};
    return a / b;
}

int main() {
    for (int b : {2, 0}) {
        std::visit(overloaded{
            [](int v) { std::cout << "результат " << v << "\n"; },
            [](const Error& e) { std::cout << "помилка: " << e.message << "\n"; },
        }, safeDivide(10, b));
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <variant>

struct Error {
    std::string message;
};

template <class T>
using Result = std::variant<T, Error>;

template <class T, class F>
auto andThen(const Result<T>& r, F step) -> decltype(step(std::get<T>(r))) {
    if (std::holds_alternative<Error>(r)) return std::get<Error>(r);
    return step(std::get<T>(r));
}

Result<int> parse(const std::string& s) {
    if (s.empty() || s[0] < '0' || s[0] > '9') return Error{"не число: " + s};
    return s[0] - '0';
}

Result<int> checkRange(int v) {
    if (v > 5) return Error{"завелике: " + std::to_string(v)};
    return v;
}

Result<int> invert(int v) {
    if (v == 0) return Error{"нуль не можна обернути"};
    return 100 / v;
}

void run(const std::string& s) {
    auto r = andThen(andThen(parse(s), checkRange), invert);
    if (std::holds_alternative<Error>(r)) std::cout << s << " -> " << std::get<Error>(r).message << "\n";
    else std::cout << s << " -> " << std::get<int>(r) << "\n";
}

int main() {
    for (std::string s : {"4", "9", "0", "x"}) run(s);
    return 0;
}
`,
      String.raw`// фрагмент: C++23, std::expected не запускається в пісочниці з C++17
#include <expected>
#include <iostream>
#include <string>

std::expected<int, std::string> parseDigit(char c) {
    if (c < '0' || c > '9') return std::unexpected("не цифра");
    return c - '0';
}

std::expected<int, std::string> twice(int v) {
    if (v > 4) return std::unexpected("завелике");
    return v * 2;
}

int main() {
    auto r = parseDigit('3').and_then(twice);
    if (r) std::cout << "значення " << *r << "\n";
    else std::cout << "помилка: " << r.error() << "\n";

    auto bad = parseDigit('x').and_then(twice);
    std::cout << bad.value_or(-1) << "\n";
    return 0;
}
`,
      String.raw`// аварія: get з неправильним типом кидає bad_variant_access, який ніхто не ловить
#include <iostream>
#include <string>
#include <variant>

struct Error {
    std::string message;
};

std::variant<int, Error> load() { return Error{"файл не знайдено"}; }

int main() {
    auto r = load();
    std::cout << "завантажуємо" << std::endl;
    std::cout << std::get<int>(r) << std::endl;
    return 0;
}
`,
    ],
    note: "Результат це <code>variant</code> зі значенням або помилкою: його не можна використати, не розібравши. Ланцюжок кроків зупиняється на першій помилці. У C++23 те саме робить <code>std::expected</code>, а <code>get</code> із неправильним типом кидає виняток.",
    work: "Парсери, обробка запитів і мережеві бібліотеки повертають результат із причиною помилки там, де виключення вимкнено чи надто дорогі. Мови на зразок Rust відомі саме таким підходом, і <code>std::expected</code> наближає до нього C++.",
    tasks: [
      "Чим тип «значення або помилка» кращий за <code>std::optional</code> і за код помилки, який можна не перевірити?",
      "Чому <code>std::get&lt;int&gt;</code> на результаті з помилкою небезпечний і як цього уникнути?",
    ],
  },
];
