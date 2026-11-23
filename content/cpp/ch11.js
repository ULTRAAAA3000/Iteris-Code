export const LESSONS_11 = [
  {
    t: "Заголовки, одиниці трансляції й ODR",
    ch: "Архітектура",
    easy: "Заголовок це меню ресторана: воно лише обіцяє, які страви є, а готує кухня в одному місці. Якби кожен зал мав власну кухню з тією самою стравою, замовлення плуталися б: так само лінкер не терпить двох однакових визначень.",
    p: [
      "Поки програма вміщається в один файл, усе просто. Але справжні проєкти ділять код на десятки файлів: кожен має свою відповідальність, змінюється окремо й збирається окремо. Щоб це працювало, C++ має чітку модель збирання, і її треба знати, бо більшість «дивних» помилок лінкера випливають саме звідси. Цей урок про те, що таке заголовок, що таке одиниця трансляції і чому одне ім'я не можна визначати двічі.",
      "Модель у голові. Файл <code>.cpp</code> разом із усім, що підтягнули директиви <code>#include</code>, це одна <b>одиниця трансляції</b>: препроцесор буквально вставляє текст заголовків у місце директиви, і компілятор бачить один великий файл. Кожну одиницю компілюють окремо в об'єктний файл, нічого не знаючи про інші. Потім <b>лінкер</b> склеює об'єктні файли й зв'язує виклики з визначеннями. Тому компілятору досить <b>оголошення</b> (<code>int twice(int);</code>), щоб дозволити виклик, а тіло функції шукає лінкер.",
      "Звідси розподіл ролей. У <b>заголовку</b> (<code>.h</code>) лежать оголошення: прототипи функцій, опис класів і структур, константи. У <code>.cpp</code> лежать <b>визначення</b>: тіла функцій і методів. Заголовок підключають усюди, де потрібен цей інтерфейс, а <code>.cpp</code> компілюють один раз. Щоб заголовок не вставився двічі в одну одиницю (через ланцюжок включень), його захищають <b>охоронцем включення</b>: <code>#pragma once</code> або трійкою <code>#ifndef</code>/<code>#define</code>/<code>#endif</code>.",
      "<b>ODR</b> (one definition rule, правило одного визначення) каже: у всій програмі кожна функція й змінна зі зовнішнім зв'язуванням мають рівно одне визначення. Оголошень може бути скільки завгодно, визначення одне. Порушення в межах однієї одиниці компілятор ловить сам (<code>redefinition</code>), а між різними одиницями це помилка лінкера <code>multiple definition</code>. Класи й шаблони мають винятки: їхнє визначення дозволено в кількох одиницях, але воно мусить бути <i>однаковим</i> скрізь.",
      "Типова пастка: ви поклали <b>тіло звичайної функції</b> в заголовок. Поки заголовок включає один <code>.cpp</code>, усе працює. Щойно його підключив другий файл, у двох об'єктних файлах з'явилося по визначенню, і лінкер зупиняється. Лік простий: або винесіть тіло в <code>.cpp</code>, або позначте функцію <code>inline</code> (тоді дублікати дозволені й зливаються в один). Те саме для змінних: у заголовку пишіть <code>inline constexpr int k = 5;</code> (C++17) замість <code>int k = 5;</code>.",
      "Ще дві ідіоми. Ім'я, потрібне лише одній одиниці, ховають в анонімному просторі імен <code>namespace { … }</code> (або <code>static</code>): воно має <b>внутрішнє зв'язування</b>, невидиме лінкеру, тож конфліктів не буде. А в заголовках не пишіть <code>using namespace std;</code>: воно просочується в усі файли, що включають заголовок. Шаблони й <code>inline</code>-функції лишаються в заголовку цілком, бо компілятору потрібне їхнє тіло в кожній одиниці.",
      "Тепер у нас є мова поділу коду на файли. Але сам поділ це ще не архітектура: треба вирішити, <i>що</i> куди класти. У наступному уроці розкладемо програму на шари: обробник запитів, бізнес-логіку й сховище, і кожен шар матиме власний заголовок і вузьку відповідальність.",
    ],
    code: [
      String.raw`// фрагмент: три файли одного проєкту (кожен блок лежить у своєму файлі)
// --- shape.h ---
#pragma once            // охоронець: не вставляти двічі
#include <string>

struct Shape {
    std::string name;
    double side;
};

double area(const Shape& s);          // оголошення: тіла тут немає
inline double perimeter(const Shape& s) { return 4 * s.side; }  // inline: тіло в заголовку дозволене

// --- shape.cpp ---
#include "shape.h"

double area(const Shape& s) {         // єдине визначення area
    return s.side * s.side;
}

// --- main.cpp ---
#include <iostream>
#include "shape.h"

int main() {
    Shape sq{"квадрат", 3.0};
    std::cout << area(sq) << " " << perimeter(sq) << "\n";
}
// збирання: g++ -std=c++17 main.cpp shape.cpp -o app
`,
      String.raw`#include <iostream>

// оголошення: що існує
int square(int x);

// inline-функція й inline-змінна (C++17) безпечні для заголовка
inline int cube(int x) { return x * x * x; }
inline constexpr int kLimit = 100;

namespace {
// внутрішнє зв'язування: це ім'я бачить лише ця одиниця
int hidden() { return 7; }
}

int main() {
    std::cout << square(5) << "\n";
    std::cout << cube(3) << "\n";
    std::cout << kLimit << " " << hidden() << "\n";
    return 0;
}

// визначення: тіло, яке шукатиме лінкер
int square(int x) {
    return x * x;
}
`,
      String.raw`// не компілюється: двічі визначена одна функція в одній одиниці трансляції (redefinition)
#include <iostream>

int twice(int x) { return x * 2; }
int twice(int x) { return x + x; }

int main() {
    std::cout << twice(4) << "\n";
    return 0;
}
`,
      String.raw`// фрагмент: порушення ODR між файлами дає помилку лінкера (виконайте в себе)
// --- util.h ---
#pragma once
int twice(int x) { return x * 2; }     // ПОМИЛКА: звичайне тіло в заголовку
// виправлення: inline int twice(int x) { return x * 2; }

// --- a.cpp ---
#include "util.h"
int fromA() { return twice(1); }

// --- b.cpp ---
#include "util.h"
int fromB() { return twice(2); }

// g++ -c a.cpp b.cpp  → обидва компілюються
// g++ a.o b.o main.o  → multiple definition of 'twice(int)'
`,
    ],
    note: "Заголовок містить оголошення, <code>.cpp</code> містить визначення: рівно одне на програму. Тіло звичайної функції в заголовку ламає лінкер, коли заголовок підключили двічі; виправлення це <code>inline</code> або перенесення в <code>.cpp</code>.",
    work: "Кожен великий проєкт на C++ це сотні одиниць трансляції. Розуміння ODR допомагає за хвилину розшифрувати «multiple definition» або «undefined reference» замість того, щоб навмання змінювати файли, а акуратні заголовки скорочують час збирання.",
    tasks: [
      "Файл <code>a.cpp</code> і <code>b.cpp</code> підключають заголовок із <code>int counter = 0;</code>. Яку помилку дасть збирання, на якому етапі і як виправити за допомогою C++17?",
      "Чому оголошення функції можна повторювати в багатьох файлах, а визначення ні? Хто саме перевіряє кожне з цих правил: компілятор чи лінкер?",
    ],
  },
  {
    t: "Шари: handler, service і repository",
    ch: "Архітектура",
    easy: "Шари це кухонний конвеєр: офіціант приймає замовлення й не готує, кухар готує за рецептом і не ходить на склад сам, комірник знає лише полиці. Кожен робить одне, і заміна комірника не вимагає перевчати офіціанта.",
    p: [
      "Коли весь код у <code>main</code>, зміна одного правила зачіпає все: розбір запиту, перевірки й зберігання даних перемішані. Типове лікування це <b>шаруватість</b>: програму ділять на шари з однією відповідальністю, і кожен шар знає лише про шар під собою. Цей прийом працює в будь-якій мові, а в C++ він ще й природно лягає на заголовки: на шар припадає пара <code>.h</code>/<code>.cpp</code>.",
      "Три класичні шари. <b>Handler</b> (обробник) стоїть на краю системи: приймає запит (рядок, команду, пакет), розбирає його, викликає сервіс і формує відповідь. Він нічого не знає про те, як зберігаються дані. <b>Service</b> (сервіс) містить бізнес-правила: перевірити, що текст не порожній, що користувач існує, що сума не від'ємна. <b>Repository</b> (сховище) вміє лише зберегти й дістати дані; у нашому курсі воно тримає їх у <code>std::map</code>, а в реальності це була б база даних.",
      "Правила залежностей прості, і вони важливіші за самі назви. Стрілка йде лише вниз: handler викликає service, service викликає repository, але не навпаки. Сховище не знає про сервіс, сервіс не знає про формат запиту. Тоді заміна формату (з тексту на JSON) чіпає тільки handler, а заміна <code>std::map</code> на файл чи базу чіпає тільки repository. Кожен шар можна перевіряти окремо, без решти.",
      "Як це виглядає в коді. Шар це клас (або набір функцій) у власному просторі імен: <code>repository::NoteRepository</code>, <code>service::NoteService</code>, <code>handler::handle</code>. Сервіс отримує сховище в конструкторі й тримає на нього посилання. Помилки правил сервіс повідомляє винятками або порожнім <code>std::optional</code>, а handler перетворює їх на відповідь для клієнта: код статусу й текст. Так обробка помилок має чітке місце.",
      "У нашому навчальному зразку все лежить в одному файлі, тож шари ми імітуємо просторами імен, а в реальному проєкті кожному відповідала б пара файлів. Запити приходять у вигляді рядків, які ми розбираємо через <code>std::istringstream</code>: мережі й вводу тут немає, але логіка та сама. Відповідь handler повертає рядком на кшталт <code>201 id=1</code> чи <code>404 not found</code>, схожим на HTTP.",
      "Пастки. Перша: <b>протікання шарів</b>, коли handler лізе прямо в сховище «бо так швидше». Через місяць правила дублюються в трьох місцях. Друга: забутий виняток. Якщо сервіс кидає, а handler не ловить, програма завершується через <code>std::terminate</code>, а клієнт не отримує навіть відповіді. Третя: надмірність. Для скрипта на двадцять рядків три шари зайві; розділяйте тоді, коли з'являється друге правило або друге сховище.",
      "Наразі сервіс сам створює або отримує конкретний клас сховища, тож замінити його нелегко. Наступний урок виправляє це: сервіс залежатиме від <i>інтерфейсу</i> чи шаблонного параметра, а конкретну реалізацію йому підставлять ззовні. Так шари стають справді взаємозамінними.",
    ],
    code: [
      String.raw`#include <iostream>
#include <map>
#include <optional>
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

int main() {
    repository::NoteRepository repo;
    int a = repo.add("купити хліб");
    int b = repo.add("прочитати розділ");
    std::cout << a << " " << b << " " << repo.count() << "\n";
    auto n = repo.find(2);
    std::cout << (n ? *n : "немає") << "\n";
    std::cout << (repo.find(9) ? "є" : "немає") << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <map>
#include <optional>
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

private:
    std::map<int, std::string> items_;
    int next_ = 1;
};
}  // namespace repository

namespace service {
class NoteService {
public:
    explicit NoteService(repository::NoteRepository& repo) : repo_(repo) {}

    int create(const std::string& text) {
        if (text.empty()) throw std::invalid_argument("порожній текст");
        return repo_.add(text);
    }
    std::optional<std::string> get(int id) const { return repo_.find(id); }

private:
    repository::NoteRepository& repo_;
};
}  // namespace service

int main() {
    repository::NoteRepository repo;
    service::NoteService svc(repo);

    std::cout << "id = " << svc.create("перша нотатка") << "\n";
    try {
        svc.create("");
    } catch (const std::invalid_argument& e) {
        std::cout << "відхилено: " << e.what() << "\n";
    }
    auto note = svc.get(1);
    std::cout << (note ? *note : "немає") << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
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

private:
    std::map<int, std::string> items_;
    int next_ = 1;
};
}  // namespace repository

namespace service {
class NoteService {
public:
    explicit NoteService(repository::NoteRepository& repo) : repo_(repo) {}
    int create(const std::string& text) {
        if (text.empty()) throw std::invalid_argument("empty");
        return repo_.add(text);
    }
    std::optional<std::string> get(int id) const { return repo_.find(id); }

private:
    repository::NoteRepository& repo_;
};
}  // namespace service

namespace handler {
std::string handle(service::NoteService& svc, const std::string& request) {
    std::istringstream in(request);
    std::string method;
    in >> method;
    if (method == "POST") {
        std::string text;
        std::getline(in >> std::ws, text);
        try {
            return "201 id=" + std::to_string(svc.create(text));
        } catch (const std::invalid_argument&) {
            return "400 empty text";
        }
    }
    if (method == "GET") {
        int id = 0;
        if (!(in >> id)) return "400 bad id";
        auto note = svc.get(id);
        if (!note) return "404 not found";
        return "200 " + *note;
    }
    return "405 method not allowed";
}
}  // namespace handler

int main() {
    repository::NoteRepository repo;
    service::NoteService svc(repo);
    const char* requests[] = {"POST hello world", "POST", "GET 1", "GET 7", "GET x", "DELETE 1"};
    for (const char* r : requests) {
        std::cout << r << " -> " << handler::handle(svc, r) << "\n";
    }
    return 0;
}
`,
      String.raw`// аварія: виняток із сервісу не оброблено в handler, тож викликається std::terminate
#include <iostream>
#include <map>
#include <stdexcept>
#include <string>

namespace repository {
class Repo {
public:
    int add(const std::string& text) {
        items_[next_] = text;
        return next_++;
    }

private:
    std::map<int, std::string> items_;
    int next_ = 1;
};
}  // namespace repository

namespace service {
class Service {
public:
    explicit Service(repository::Repo& r) : repo_(r) {}
    int create(const std::string& text) {
        if (text.empty()) throw std::invalid_argument("порожній текст");
        return repo_.add(text);
    }

private:
    repository::Repo& repo_;
};
}  // namespace service

namespace handler {
std::string post(service::Service& s, const std::string& text) {
    return "201 id=" + std::to_string(s.create(text));  // немає try/catch
}
}  // namespace handler

int main() {
    repository::Repo repo;
    service::Service svc(repo);
    std::cout << handler::post(svc, "добре") << "\n";
    std::cout << handler::post(svc, "") << "\n";
    return 0;
}
`,
    ],
    note: "Стрілка залежностей іде вниз: handler кличе service, service кличе repository. Правила живуть у сервісі, зберігання у сховищі, розбір запиту в handler. Помилки сервісу handler мусить перетворити на відповідь, а не пропустити.",
    work: "Шаруватість це спосіб, яким серверні застосунки на C++ (і не лише) лишаються керованими: заміна формату запитів, перевірок чи бази чіпає один шар. Саме так організовані веб-сервіси, обробники черг і ігрові бекенди.",
    tasks: [
      "Додайте до прикладу команду <code>COUNT</code>, яка повертає кількість нотаток. У яких саме шарах доведеться додати код і чому не в одному?",
      "Handler напряму викликає <code>repo.add(text)</code>, оминаючи сервіс. Яке правило шарів порушено і яка конкретна проблема з'явиться, коли в сервісі додадуть перевірку тексту?",
    ],
  },
  {
    t: "Залежності: впровадження через інтерфейси й шаблони",
    ch: "Архітектура",
    easy: "Дриль не вбудований у стіну, а має патрон: бур міняють за секунду. Сервіс так само: він не створює сховище чи сповіщувач сам, а отримує їх ззовні, тож у тесті замість справжнього ставимо підставний.",
    p: [
      "Нехай сервіс реєстрації надсилає привітання. Якщо в його тілі написано <code>ConsoleNotifier n;</code>, сервіс прикутий до консолі: перевірити його без реального виводу неможливо, а замінити консоль на пошту означає переписувати сервіс. Така <b>жорстка залежність</b> руйнує шари з попереднього уроку. Лікування називається <b>впровадженням залежностей</b> (dependency injection, DI): залежність створює той, хто викликає, і передає в конструктор.",
      "Модель у голові. Сервіс описує, що йому <i>потрібно</i> (вміти надсилати повідомлення), а не що саме це буде. Цей опис і є контракт. У C++ контракт виражають двома способами. Перший: <b>інтерфейс</b>, тобто абстрактний клас із чисто віртуальними функціями (<code>= 0</code>). Сервіс тримає посилання на інтерфейс, а конкретний клас реалізує його. Вибір реалізації відбувається під час виконання, через таблицю віртуальних функцій.",
      "Другий спосіб: <b>шаблон</b>. Сервіс стає шаблоном <code>Service&lt;Notifier&gt;</code>, і йому підходить будь-який тип, що має потрібні методи, без спільного базового класу. Вибір відбувається під час компіляції: нуля віртуальних викликів, але кожна пара «сервіс + тип» це окремий код, а помилку невідповідності ви побачите довгим повідомленням компілятора в місці використання.",
      "Як обирати. Інтерфейс дає вибір реалізації під час роботи (конфігурація, плагіни), ховає реалізацію й дозволяє тримати різні об'єкти в одному контейнері, але коштує віртуального виклику й вимагає спільної бази. Шаблон швидший, не вимагає спадкування, але лишається в заголовку й роздуває збирання. Для типових сервісів шарів починайте з інтерфейсу, а шаблон беріть для гарячих місць або коли тип відомий заздалегідь.",
      "Впровадження через конструктор має кілька правил. Тримайте залежність як <b>посилання</b> на інтерфейс, якщо власник живе довше за сервіс, або як <code>std::unique_ptr</code>, якщо сервіс володіє нею. Інтерфейс завжди має <b>віртуальний деструктор</b>, бо інакше видалення через базовий вказівник дає UB. Об'єкти збирають в одному місці, у <code>main</code> (так званий корінь композиції), а решта коду про конкретні типи не знає.",
      "Найбільша вигода: підставні об'єкти. Для тесту пишуть <b>фейк</b>, наприклад <code>FakeNotifier</code>, що не друкує, а запам'ятовує повідомлення у векторі. Тест викликає сервіс і порівнює вектор з очікуваним. Пастки: забутий <code>= 0</code> чи нереалізований метод робить клас абстрактним, і створити його екземпляр не можна (помилка компіляції); посилання на тимчасовий об'єкт висить після повернення з конструктора; а надмірні інтерфейси «про всяк випадок» лише ускладнюють код.",
      "Ми навчилися розв'язувати зв'язки між шарами. Але реалізація класу все ще видна в заголовку: змінили приватне поле, і перекомпілюється весь проєкт. Наступний урок показує ідіому pimpl, яка ховає реалізацію за вказівником і прибирає цю залежність при збиранні.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

// інтерфейс: контракт, який потрібен сервісу
class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void send(const std::string& msg) = 0;
};

class ConsoleNotifier : public Notifier {
public:
    void send(const std::string& msg) override { std::cout << "[консоль] " << msg << "\n"; }
};

class SignupService {
public:
    explicit SignupService(Notifier& n) : notifier_(n) {}  // залежність приходить ззовні
    void signup(const std::string& user) { notifier_.send("вітаємо, " + user); }

private:
    Notifier& notifier_;
};

int main() {
    ConsoleNotifier console;
    SignupService svc(console);
    svc.signup("Ада");
    svc.signup("Лінус");
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <vector>

class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void send(const std::string& msg) = 0;
};

// фейк для тесту: нічого не друкує, лише запам'ятовує
class FakeNotifier : public Notifier {
public:
    void send(const std::string& msg) override { messages.push_back(msg); }
    std::vector<std::string> messages;
};

class SignupService {
public:
    explicit SignupService(Notifier& n) : notifier_(n) {}
    bool signup(const std::string& user) {
        if (user.empty()) return false;
        notifier_.send("вітаємо, " + user);
        return true;
    }

private:
    Notifier& notifier_;
};

int main() {
    FakeNotifier fake;
    SignupService svc(fake);
    svc.signup("Ада");
    svc.signup("");
    svc.signup("Грейс");

    std::cout << "надіслано: " << fake.messages.size() << "\n";
    for (const auto& m : fake.messages) std::cout << "- " << m << "\n";
    std::cout << (fake.messages.size() == 2 ? "тест пройдено" : "тест провалено") << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <utility>

// шаблонна залежність: потрібен лише метод send, спільної бази немає
template <typename Notifier>
class SignupService {
public:
    explicit SignupService(Notifier n) : notifier_(std::move(n)) {}
    void signup(const std::string& user) { notifier_.send("вітаємо, " + user); }
    const Notifier& notifier() const { return notifier_; }

private:
    Notifier notifier_;
};

struct ConsoleNotifier {
    void send(const std::string& msg) { std::cout << "[консоль] " << msg << "\n"; }
};

struct CountingNotifier {
    void send(const std::string&) { ++count; }
    int count = 0;
};

int main() {
    SignupService<ConsoleNotifier> a{ConsoleNotifier{}};
    a.signup("Ада");

    SignupService<CountingNotifier> b{CountingNotifier{}};
    b.signup("один");
    b.signup("два");
    std::cout << "порахував: " << b.notifier().count << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: клас не реалізував чисту віртуальну функцію send, тож він абстрактний і об'єкт створити не можна
#include <iostream>
#include <string>

class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void send(const std::string& msg) = 0;
};

class BrokenNotifier : public Notifier {
public:
    void ping() { std::cout << "ping\n"; }
};

int main() {
    BrokenNotifier n;
    n.ping();
    return 0;
}
`,
    ],
    note: "Сервіс не створює залежності сам, а отримує їх у конструкторі: через інтерфейс із віртуальним деструктором (вибір під час виконання) або через шаблонний параметр (вибір під час компіляції). Так у тесті ставлять фейк.",
    work: "DI дає змогу тестувати сервіс без бази, пошти чи мережі й міняти реалізації конфігурацією. У великих C++ проєктах (ігрові рушії, бекенди, драйвери) саме так тримають модулі незалежними й перевіряють їх швидкими модульними тестами.",
    tasks: [
      "Чому інтерфейс <code>Notifier</code> обов'язково має віртуальний деструктор, коли сервіс володіє залежністю через <code>std::unique_ptr&lt;Notifier&gt;</code>?",
      "Коли для залежності краще взяти шаблонний параметр, а коли віртуальний інтерфейс? Назвіть по одній ситуації для кожного варіанта.",
    ],
  },
  {
    t: "pimpl: ховаємо реалізацію",
    ch: "Архітектура",
    adv: true,
    easy: "Пульт від телевізора має кнопки, а плата всередині запаяна в корпусі. Ви користуєтеся кнопками, і виробник може змінити плату, не змінюючи пульта: так само pimpl лишає в заголовку лише кнопки класу.",
    p: [
      "Приватні поля класу ховаються від користувача, але не від компілятора: вони лежать у тому ж заголовку. Змінили тип поля чи додали допоміжну структуру, і кожен <code>.cpp</code>, що підключає заголовок, мусить перекомпілюватися. Крім того, заголовок тягне за собою всі <code>#include</code>, потрібні лише для приватних даних. У великих проєктах це хвилини зайвого збирання.",
      "Ідіома <b>pimpl</b> (pointer to implementation, «вказівник на реалізацію», ще її звуть «компіляційним брандмауером») це прибирає. У заголовку клас має лише публічні методи й <b>один вказівник</b> на вкладену структуру <code>struct Impl;</code>, оголошену, але не визначену. Усі поля лежать у <code>Impl</code>, а її визначення живе в <code>.cpp</code>. Користувачі бачать заголовок, який майже не змінюється.",
      "Модель у голові: клас це фасад, а справжній вміст за ним. Конструктор створює <code>Impl</code> (<code>std::make_unique&lt;Impl&gt;()</code>), методи пересилають роботу в нього через <code>impl_-&gt;</code>. Тип вказівника зручно взяти <code>std::unique_ptr&lt;Impl&gt;</code>: він сам видалить реалізацію. Розмір фасаду стає сталим (один вказівник), і це також дає стабільний двійковий інтерфейс бібліотеки.",
      "Головна тонкість: <code>std::unique_ptr</code> на <b>неповний тип</b> вимагає, щоб деструктор класу було визначено там, де <code>Impl</code> уже повний, тобто в <code>.cpp</code>. Тому в заголовку пишемо лише <code>~Widget();</code>, а в <code>.cpp</code> після визначення <code>Impl</code> пишемо <code>Widget::~Widget() = default;</code>. Те саме для переміщення: оголосіть <code>Widget(Widget&amp;&amp;) noexcept;</code> і визначте <code>= default</code> у <code>.cpp</code>.",
      "Копіювання за замовчуванням зникає: <code>unique_ptr</code> не копіюється, тож клас стає лише переміщуваним. Якщо копії потрібні, напишіть копіюючий конструктор, що створює новий <code>Impl</code> як копію чужого: <code>impl_(std::make_unique&lt;Impl&gt;(*other.impl_))</code>. Тоді копії незалежні (глибоке копіювання). Після переміщення вихідний об'єкт має порожній вказівник, тож користуватися ним не можна, окрім присвоєння чи знищення.",
      "Ціна ідіоми: додатковий виділений блок пам'яті, непряме звернення через вказівник, трохи більше шаблонного коду. Тому pimpl беруть для класів публічних бібліотек і для заголовків, що змінюються й тягнуть важкі залежності, а не для кожного дрібного класу. Пастка: забути вказати деструктор у <code>.cpp</code> (або залишити неявний) і отримати помилку компіляції про неповний тип.",
      "Заголовки, шари, залежності й pimpl це про організацію коду. Лишається питання, як усе це збирається автоматично: у наступному уроці зробимо огляд CMake та модулів C++20, які поступово замінюють заголовки.",
    ],
    code: [
      String.raw`// фрагмент: pimpl у трьох файлах (кожен блок лежить у своєму файлі)
// --- logger.h ---
#pragma once
#include <cstddef>
#include <memory>
#include <string>

class Logger {
public:
    Logger();
    ~Logger();                       // визначимо в .cpp, де Impl повний
    void add(const std::string& line);
    std::size_t size() const;

private:
    struct Impl;                     // лише оголошення
    std::unique_ptr<Impl> impl_;
};

// --- logger.cpp ---
#include "logger.h"
#include <vector>                    // важкі залежності лишаються тут

struct Logger::Impl {
    std::vector<std::string> lines;
};

Logger::Logger() : impl_(std::make_unique<Impl>()) {}
Logger::~Logger() = default;         // тут Impl уже повний
void Logger::add(const std::string& line) { impl_->lines.push_back(line); }
std::size_t Logger::size() const { return impl_->lines.size(); }

// --- main.cpp ---
#include <iostream>
#include "logger.h"                  // заголовок не знає про <vector>

int main() {
    Logger log;
    log.add("старт");
    std::cout << log.size() << "\n";
}
`,
      String.raw`#include <cstddef>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

// ===== імітація logger.h =====
class Logger {
public:
    Logger();
    ~Logger();
    void add(const std::string& line);
    std::size_t size() const;
    const std::string& last() const;

private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

// ===== імітація logger.cpp =====
struct Logger::Impl {
    std::vector<std::string> lines;
};

Logger::Logger() : impl_(std::make_unique<Impl>()) {}
Logger::~Logger() = default;
void Logger::add(const std::string& line) { impl_->lines.push_back(line); }
std::size_t Logger::size() const { return impl_->lines.size(); }
const std::string& Logger::last() const { return impl_->lines.back(); }

// ===== імітація main.cpp =====
int main() {
    Logger log;
    log.add("старт");
    log.add("робота");
    std::cout << log.size() << " " << log.last() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

class Box {
public:
    explicit Box(int v);
    Box(const Box& other);               // глибока копія
    Box(Box&& other) noexcept;           // переміщення
    ~Box();
    void set(int v);
    int get() const;

private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

struct Box::Impl {
    int value;
};

Box::Box(int v) : impl_(std::make_unique<Impl>(Impl{v})) {}
Box::Box(const Box& other) : impl_(std::make_unique<Impl>(*other.impl_)) {}
Box::Box(Box&& other) noexcept = default;
Box::~Box() = default;
void Box::set(int v) { impl_->value = v; }
int Box::get() const { return impl_->value; }

int main() {
    Box a(10);
    Box b = a;          // копія: власний Impl
    b.set(99);
    std::cout << a.get() << " " << b.get() << "\n";

    Box c = std::move(b);  // переміщення: Impl переходить до c
    std::cout << c.get() << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: Impl ніде не визначено, тож unique_ptr не може видалити неповний тип
#include <iostream>
#include <memory>

class Widget {
public:
    Widget() = default;
    int id() const { return 1; }

private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

int main() {
    Widget w;
    std::cout << w.id() << "\n";
    return 0;
}
`,
    ],
    note: "Pimpl ховає поля за вказівником на неповну структуру: заголовок стабільний, збирання швидке. Деструктор (і переміщення) визначають у <code>.cpp</code>, де <code>Impl</code> повний. Копії треба писати вручну.",
    work: "Pimpl використовують публічні бібліотеки (Qt, багато SDK), щоб зберегти сумісність між версіями й не перекомпілювати користувачів після кожної зміни приватних даних. У власних проєктах він скорочує час збирання через важкі заголовки.",
    tasks: [
      "Чому <code>Logger::~Logger() = default;</code> треба писати в <code>.cpp</code>, а не залишити неявний деструктор чи написати <code>= default</code> у заголовку?",
      "Клас із pimpl має копіюватися за значенням. Що саме треба дописати і чим «глибока» копія відрізняється від копії вказівника?",
    ],
  },
  {
    t: "CMake і модулі C++20: огляд",
    ch: "Архітектура",
    adv: true,
    easy: "CMake це рецепт-керівництво для кухні: у ньому написано, з яких інгредієнтів-файлів що готувати й у якому порядку. Модулі C++20 мають замінити меню-заголовки на готові напівфабрикати, які не треба щоразу розбирати.",
    p: [
      "Коли файлів багато, збирати їх вручну командою <code>g++ a.cpp b.cpp …</code> незручно: легко забути файл, а змінений один не повинен перекомпільовувати решту. Проєкт описують у системі збирання, а <b>CMake</b> це найпоширеніший генератор: ви пишете <code>CMakeLists.txt</code>, а він створює файли для <code>make</code>, <code>ninja</code> чи Visual Studio. У курсі ми лише оглядаємо його текстом, не запускаючи.",
      "Мінімальний <code>CMakeLists.txt</code> складається з трьох команд. <code>cmake_minimum_required(VERSION 3.16)</code> фіксує версію, <code>project(app LANGUAGES CXX)</code> дає проєкту ім'я, а <code>add_executable(app main.cpp shape.cpp)</code> оголошує програму й її джерела. Стандарт мови задають через <code>target_compile_features(app PRIVATE cxx_std_17)</code> або <code>set(CMAKE_CXX_STANDARD 17)</code>. Важливе слово тут <b>ціль</b> (target): усі налаштування прив'язують до неї.",
      "Багатофайловий проєкт зазвичай має бібліотеку й програму. <code>add_library(core core.cpp)</code> збирає бібліотеку, <code>target_include_directories(core PUBLIC include)</code> показує, де лежать її заголовки, а <code>target_link_libraries(app PRIVATE core)</code> підключає її до програми. Слова <code>PUBLIC</code> і <code>PRIVATE</code> керують тим, чи успадкують залежні цілі налаштування. Збирають поза деревом джерел: <code>cmake -S . -B build</code>, потім <code>cmake --build build</code>.",
      "Тепер про <b>модулі C++20</b>. Заголовок підключається копіюванням тексту, тому його розбирають знову в кожній одиниці трансляції, а макроси просочуються всюди. Модуль же компілюють один раз у бінарний інтерфейс, і <code>import</code> його підключає без повторного розбору. У файлі інтерфейсу пишуть <code>export module shapes;</code>, а <code>export</code> перед оголошенням робить його видимим. Користувач пише <code>import shapes;</code>.",
      "Переваги модулів: швидше збирання, немає охоронців включення, макроси не протікають, чітко видно, що експортується. Але в 2026 році підтримка нерівна: потрібні нові версії компілятора (gcc 14+, clang, MSVC), нова версія CMake (від 3.28) і сканування залежностей, а стандартна бібліотека як модуль <code>import std;</code> з'явилася лише в C++23. Тому в продакшн-проєктах модулі ще впроваджують обережно, поряд із заголовками.",
      "Пастки. У CMake: перелічили не всі <code>.cpp</code>, і лінкер скаржиться на <code>undefined reference</code>; додали заголовок, але не вказали каталог, і <code>#include</code> не знаходить файл. Загальна пастка: взяти C++20-код і зібрати з <code>-std=c++17</code>: компілятор не розпізнає <code>import</code>. Версію мови можна перевірити макросом <code>__cplusplus</code>: для C++17 це <code>201703L</code>.",
      "Цим ми завершуємо розмову про архітектуру: файли, шари, залежності, приховування реалізації й збирання. У наступній главі все застосуємо на практиці: невеликі проєкти, де кожна з цих ідей на своєму місці.",
    ],
    code: [
      String.raw`// фрагмент: CMakeLists.txt для програми й бібліотеки (CMake, не C++)
cmake_minimum_required(VERSION 3.16)
project(notes LANGUAGES CXX)

# бібліотека з логікою
add_library(core src/service.cpp src/repository.cpp)
target_include_directories(core PUBLIC include)
target_compile_features(core PUBLIC cxx_std_17)

# виконуваний файл залежить від бібліотеки
add_executable(notes src/main.cpp)
target_link_libraries(notes PRIVATE core)

# збирання (у терміналі):
#   cmake -S . -B build
#   cmake --build build
#   ./build/notes
`,
      String.raw`#include <iostream>

// перевірка стандарту під час компіляції: макрос __cplusplus дорівнює 201703L для C++17
static_assert(__cplusplus >= 201703L, "потрібен щонайменше C++17");

int main() {
    std::cout << "стандарт не нижче C++17\n";
#if __cplusplus >= 202002L
    std::cout << "доступні можливості C++20\n";
#else
    std::cout << "лише C++17\n";
#endif
    return 0;
}
`,
      String.raw`// фрагмент: C++20 (модулі; потрібні свіжий компілятор і CMake 3.28+)
// --- shapes.cppm (інтерфейс модуля) ---
export module shapes;

export struct Square {
    double side;
};

export double area(const Square& s) { return s.side * s.side; }

double secret() { return 42; }     // без export: поза модулем невидимо

// --- main.cpp ---
import shapes;                     // замість #include "shapes.h"
#include <iostream>

int main() {
    std::cout << area(Square{3.0}) << "\n";
}

// CMake (3.28+):
//   add_library(shapes)
//   target_sources(shapes PUBLIC FILE_SET CXX_MODULES FILES shapes.cppm)
//   target_link_libraries(app PRIVATE shapes)
`,
      String.raw`// не компілюється: модулі C++20 у режимі C++17 недоступні, import не розпізнається
import shapes;

int main() {
    return 0;
}
`,
    ],
    note: "CMake описує проєкт цілями: <code>add_executable</code>, <code>add_library</code>, <code>target_link_libraries</code>. Модулі C++20 (<code>export module</code>, <code>import</code>) замінюють заголовки, але вимагають свіжих компілятора й CMake.",
    work: "Майже кожен сучасний проєкт на C++ збирається через CMake: він переносимий між Linux, macOS і Windows та підтримується IDE. Знання його основ потрібне, щоб підключити бібліотеку чи додати файл до чужого проєкту.",
    tasks: [
      "Програма складається з <code>main.cpp</code> і <code>util.cpp</code>, а в <code>add_executable</code> перелічено лише <code>main.cpp</code>. Яку помилку побачите і на якому етапі збирання?",
      "Чим <code>import</code> модуля відрізняється від <code>#include</code> заголовка з погляду того, скільки разів компілятор розбирає вміст?",
    ],
  },
];
