export const LESSONS_12a = [
  {
    t: "Проєкт: аналіз тексту",
    ch: "Проєкти",
    easy: "Аналіз тексту це робота бібліотекаря з книгою: він розкладає її на слова, веде картку на кожне слово, ставить позначку за кожну зустріч і наприкінці називає найпопулярніші. Кожен крок окремий і зрозумілий.",
    p: [
      "Це перший підсумковий проєкт курсу. Досі кожен урок давав один інструмент, а тут ми збираємо їх у програму, яку можна показати. Завдання з технічного завдання (ТЗ): прочитати текст, порахувати слова, знайти унікальні та вивести три найчастіші з однаковим, відтворюваним форматом. Це мініатюра реальних задач: розбір журналів, пошукові індекси, статистика відгуків.",
      "Починаємо не з коду, а з ТЗ і декомпозиції. Пишемо точні правила: слово це послідовність латинських літер, регістр не важливий, усе інше розділяє слова. Далі ділимо роботу на функції з однією відповідальністю: <code>tokenize</code> перетворює рядок на вектор слів, <code>countWords</code> будує словник слово-кількість, <code>topN</code> вибирає лідерів, а <code>main</code> лише з'єднує їх і друкує. Кожну частину можна перевірити окремо.",
      "Модель у голові це конвеєр: текст, потім слова, потім частоти, потім рейтинг. Кожна станція отримує результат попередньої й нічого не знає про решту. Для слів підходить <code>std::vector&lt;std::string&gt;</code>, для частот упорядкований <code>std::map&lt;std::string, int&gt;</code>: ключі в ньому відсортовані, а <code>++freq[word]</code> сам створює запис із нулем. Для рейтингу копіюємо пари у вектор і сортуємо алгоритмом <code>std::sort</code> з власним порівнянням.",
      "Найтонше місце це детермінізм. Якщо два слова мають однакову частоту, порядок у рейтингу має бути визначений правилом, а не випадковістю: спершу більша кількість, а за рівності слова за алфавітом. Саме тому порівняння в лямбді має дві гілки. Без другої гілки <code>std::sort</code> залишить рівні елементи в довільному порядку, і вивід на різних компіляторах відрізнятиметься, а тест стане нестабільним.",
      "Типові помилки. Перша: передавати символ у <code>std::isalpha</code> як <code>char</code>, не перетворивши його на <code>unsigned char</code>; для від'ємних значень це неозначена поведінка, тож перетворюйте. Друга: забути слово, що стоїть останнім і не має після себе роздільника, тому після циклу треба перевірити буфер. Третя: використати <code>map::at</code> для слова, якого немає: це виняток <code>std::out_of_range</code>. Для пошуку з перевіркою використовуйте <code>find</code> або <code>count</code>.",
      "Ідіоми проєкту. Приймайте великі об'єкти за <code>const&amp;</code>, повертайте вектори й словники за значенням: оптимізатор і переміщення зроблять це дешевим. Не змішуйте обчислення й друк: функція, що повертає результат, легко тестується, а та, що пише в <code>cout</code>, ні. Крайні випадки перевіряйте окремо: порожній рядок, рядок без літер, текст із розділовими знаками на краях.",
      "Приклад нижче це повна програма на сотню рядків із чотирма функціями. Зверніть увагу, як кожен крок ТЗ відповідає окремій функції. У наступному проєкті ми повторимо той самий прийом, але замість тексту розбиратимемо запити до маленького API нотаток: розбір, сервіс і сховище так само стануть окремими шарами.",
    ],
    code: [
      String.raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream in("one two  three\nfour");
    std::string word;
    int n = 0;
    while (in >> word) {
        ++n;
        std::cout << n << ": " << word << "\n";
    }
    std::cout << "слів: " << n << "\n";
    return 0;
}
`,
      String.raw`#include <cctype>
#include <iostream>
#include <string>
#include <vector>

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

int main() {
    for (const auto& w : tokenize("Hello, World! It's 2024.")) {
        std::cout << "[" << w << "]";
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`#include <algorithm>
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
    std::vector<Entry> v(freq.begin(), freq.end());
    std::sort(v.begin(), v.end(), [](const Entry& a, const Entry& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    if (v.size() > n) v.resize(n);
    return v;
}

void report(const std::string& text) {
    auto words = tokenize(text);
    auto freq = countWords(words);
    std::cout << "слів: " << words.size() << "\n";
    std::cout << "унікальних: " << freq.size() << "\n";
    int place = 0;
    for (const auto& e : topN(freq, 3)) {
        std::cout << ++place << ". " << e.first << " " << e.second << "\n";
    }
}

int main() {
    report("The cat and the dog. The dog saw the cat; and the cat ran!");
    report("... 42 ...");
    return 0;
}
`,
      String.raw`// аварія: map::at для відсутнього слова кидає std::out_of_range, який ніхто не ловить
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> freq{{"cat", 3}, {"dog", 2}};
    std::cout << "cat: " << freq.at("cat") << "\n";
    std::cout << "bird: " << freq.at("bird") << "\n";
    return 0;
}
`,
    ],
    note: "Проєкт починайте з ТЗ і декомпозиції: одна функція, одна відповідальність. Конвеєр <code>tokenize</code>, <code>countWords</code>, <code>topN</code> легко перевірити по частинах. Для рівних частот задавайте друге правило порядку, інакше вивід не буде відтворюваним.",
    work: "Так будують аналіз журналів, статистику слів у відгуках, пошукові індекси й підказки автодоповнення. Той самий конвеєр «розібрати, порахувати, відсортувати, показати» зустрічається майже в кожній задачі обробки даних, великій чи малій.",
    tasks: [
      "Чому в порівнянні для сортування рейтингу потрібна друга гілка для однакових частот?",
      "Що станеться, якщо звернутися до відсутнього слова через <code>map::at</code>, і чим його замінити для безпечного пошуку?",
    ],
  },
  {
    t: "Проєкт: HTTP-подібний API нотаток у пам'яті",
    ch: "Проєкти",
    easy: "API нотаток схоже на вікно реєстратури: клієнт кладе записку з вимогою, працівник читає її, звіряється з картотекою та віддає коротку відповідь із кодом. Вимоги бувають різні, а відповіді завжди однакової форми.",
    p: [
      "Другий проєкт ближчий до справжньої роботи: сервіс, який приймає текстові запити на кшталт <code>POST /notes купити хліб</code> і відповідає рядками <code>201 id=1</code>. Мережі в нас немає й не потрібно: запит це звичайний рядок, а відповідь рядок із кодом статусу. Так ми тренуємо архітектуру, не відволікаючись на сокети, і весь сервіс стає простим для перевірки.",
      "ТЗ задаємо таблицею. <code>POST /notes текст</code> додає нотатку й повертає <code>201 id=N</code>; <code>GET /notes/N</code> повертає <code>200 текст</code> або <code>404 not found</code>; <code>GET /notes</code> віддає всі нотатки; <code>DELETE /notes/N</code> повертає <code>204</code> або <code>404</code>. Усе незрозуміле дає <code>400 bad request</code>. Коди статусу це спільна мова: за ними клієнт розуміє результат, не читаючи тексту.",
      "Декомпозиція повторює шари з попередніх глав. Сховище <code>NoteRepo</code> тримає <code>std::map&lt;int, std::string&gt;</code> і лічильник id та нічого не знає про запити. Розбір рядка запиту виділяємо в окрему функцію: метод, шлях і тіло. Функція <code>handle</code> з'єднує їх: розбирає запит, вибирає дію за методом і шляхом, викликає сховище й складає відповідь. Кожен шар можна замінити, не чіпаючи інших.",
      "Розбір запиту робить <code>std::istringstream</code>: <code>in &gt;&gt; method &gt;&gt; path</code> бере два перші слова, а решту рядка, тобто тіло з пробілами, забирає <code>std::getline</code>; перед тілом лишається зайвий пробіл, його треба прибрати. Ідентифікатор зі шляху <code>/notes/7</code> витягуємо через <code>std::stoi</code>, а некоректне число, як <code>/notes/abc</code>, ловимо виключенням і відповідаємо <code>400</code>, а не падаємо.",
      "Пастки. Забути <code>const</code> у методах, що лише читають: тоді сховище не можна передати як <code>const&amp;</code>. Повертати вказівник на нотатку після видалення: він стає недійсним, тому віддавайте копію рядка. Плутати 404 і 400: перший означає «такого ресурсу немає», другий «запит складено неправильно». Ще одна пастка: змішувати друк і логіку, адже <code>handle</code> мусить повертати рядок, а друкує лише <code>main</code>.",
      "Ідіоми: перелік дій як послідовність <code>if</code> за методом і шляхом, структура <code>Response</code> із полями статусу й тіла та функція форматування, що збирає їх в один рядок. Тоді правила відповіді живуть в одному місці. Лічильник id тільки зростає: після видалення нотатки її номер не використовується повторно, і це відповідає поведінці справжніх баз даних.",
      "Приклад нижче показує повний сервіс без мережі й файлів. Після нього ви зможете вмикати його в тестах так само, як у главі про тестування: подав рядок, порівняв відповідь. Наступний проєкт додає паралелізм: кілька потоків обробляють завдання одночасно, а результат лишається таким самим передбачуваним.",
    ],
    code: [
      String.raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::string request = "POST /notes купити хліб і молоко";
    std::istringstream in(request);
    std::string method, path, body;
    in >> method >> path;
    std::getline(in, body);
    if (!body.empty() && body[0] == ' ') body.erase(0, 1);
    std::cout << "метод: " << method << "\n";
    std::cout << "шлях: " << path << "\n";
    std::cout << "тіло: " << body << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <map>
#include <string>

class NoteRepo {
public:
    int add(const std::string& text) {
        notes_[next_] = text;
        return next_++;
    }
    bool get(int id, std::string& out) const {
        auto it = notes_.find(id);
        if (it == notes_.end()) return false;
        out = it->second;
        return true;
    }
    bool remove(int id) { return notes_.erase(id) > 0; }
    std::size_t size() const { return notes_.size(); }

private:
    std::map<int, std::string> notes_;
    int next_ = 1;
};

int main() {
    NoteRepo repo;
    int a = repo.add("перша");
    int b = repo.add("друга");
    repo.remove(a);
    int c = repo.add("третя");
    std::string text;
    std::cout << a << " " << b << " " << c << " розмір " << repo.size() << "\n";
    std::cout << (repo.get(a, text) ? "є" : "немає") << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <map>
#include <sstream>
#include <string>

class NoteRepo {
public:
    int add(const std::string& text) {
        notes_[next_] = text;
        return next_++;
    }
    const std::map<int, std::string>& all() const { return notes_; }
    bool remove(int id) { return notes_.erase(id) > 0; }

private:
    std::map<int, std::string> notes_;
    int next_ = 1;
};

struct Response {
    int status;
    std::string body;
};

std::string format(const Response& r) {
    return r.body.empty() ? std::to_string(r.status) : std::to_string(r.status) + " " + r.body;
}

bool idFromPath(const std::string& path, int& id) {
    const std::string prefix = "/notes/";
    if (path.rfind(prefix, 0) != 0) return false;
    try {
        std::size_t used = 0;
        id = std::stoi(path.substr(prefix.size()), &used);
        return used == path.size() - prefix.size();
    } catch (const std::exception&) {
        return false;
    }
}

Response handle(NoteRepo& repo, const std::string& request) {
    std::istringstream in(request);
    std::string method, path, body;
    in >> method >> path;
    std::getline(in, body);
    if (!body.empty() && body[0] == ' ') body.erase(0, 1);

    int id = 0;
    if (method == "POST" && path == "/notes" && !body.empty()) {
        return {201, "id=" + std::to_string(repo.add(body))};
    }
    if (method == "GET" && path == "/notes") {
        std::string list;
        for (const auto& [k, v] : repo.all()) list += (list.empty() ? "" : ", ") + std::to_string(k) + ":" + v;
        return {200, list.empty() ? "(порожньо)" : list};
    }
    if (method == "GET" && idFromPath(path, id)) {
        auto it = repo.all().find(id);
        if (it == repo.all().end()) return {404, "not found"};
        return {200, it->second};
    }
    if (method == "DELETE" && idFromPath(path, id)) {
        return repo.remove(id) ? Response{204, ""} : Response{404, "not found"};
    }
    return {400, "bad request"};
}

int main() {
    NoteRepo repo;
    for (const char* req : {"POST /notes купити хліб", "POST /notes вивчити C++", "GET /notes/2",
                            "GET /notes/9", "DELETE /notes/1", "GET /notes", "GET /notes/x", "PUT /notes/2 нове"}) {
        std::cout << req << " => " << format(handle(repo, req)) << "\n";
    }
    return 0;
}
`,
      String.raw`// не компілюється: add змінює сховище, а викликається через const-посилання
#include <iostream>
#include <string>
#include <vector>

class Repo {
public:
    void add(const std::string& s) { items_.push_back(s); }
    std::size_t size() const { return items_.size(); }

private:
    std::vector<std::string> items_;
};

void fill(const Repo& repo) {
    repo.add("нотатка");
}

int main() {
    Repo repo;
    fill(repo);
    std::cout << repo.size() << "\n";
    return 0;
}
`,
    ],
    note: "Сервіс без мережі це рядок на вході й рядок на виході. Розділіть шари: сховище, розбір запиту, <code>handle</code>. Коди статусу: 201 створено, 200 успіх, 204 видалено, 404 немає ресурсу, 400 помилковий запит. Відповідь повертайте значенням, друкує лише <code>main</code>.",
    work: "Така структура лежить в основі справжніх веб-сервісів: маршрутизація за методом і шляхом, сервісний шар і сховище. Рядкове API зручне для автоматичних тестів, бо не потребує сервера, мережі чи годинника.",
    tasks: [
      "Чим відрізняється відповідь 404 від 400 і в яких випадках ваш <code>handle</code> повертає кожну з них?",
      "Чому метод сховища, що лише читає дані, має бути позначений <code>const</code>?",
    ],
  },
  {
    t: "Проєкт: конкурентний обробник",
    ch: "Проєкти",
    easy: "Конкурентний обробник схожий на касу в супермаркеті з кількома касирами: кожен бере наступного покупця з черги, обслуговує його у своєму темпі, а наприкінці дня звіт складається по порядку чеків, а не за швидкістю касирів.",
    p: [
      "Останній проєкт цієї частини додає паралелізм. Є пакет незалежних завдань, наприклад обчислити суму квадратів чисел до <code>n</code> для кількох значень <code>n</code>. Ми запускаємо кілька потоків, і кожен забирає наступне завдання, поки вони не скінчаться. Вимога ТЗ така: результат і вивід мають бути <b>однаковими</b> за будь-якої кількості потоків і за будь-якого порядку їхнього виконання.",
      "Детермінізм у потоках досягається двома правилами. Перше: потік пише результат лише у власну комірку <code>results[i]</code>, де <code>i</code> номер завдання, тому записи різних потоків не перетинаються й гонки даних немає. Друге: друкуємо не з потоків, а в <code>main</code> після <code>join</code>, ідучи за індексами. Так порядок виводу залежить від номерів завдань, а не від швидкості потоків.",
      "Роздача завдань робиться через <code>std::atomic&lt;int&gt; next</code>. Кожен потік у циклі бере <code>int i = next++</code>: ця операція атомарна, тож два потоки ніколи не отримають однаковий номер. Якщо <code>i</code> не менше кількості завдань, потік завершується. Це найпростіша «черга» без блокувань: швидкий потік встигає взяти більше завдань, повільний менше, а результат однаковий.",
      "Окремо потрібні спільні дані, які змінюють усі потоки, як лічильник виконаних завдань. Для них ми беремо <code>std::mutex</code> і <code>std::lock_guard</code>: замок береться на час зміни й гарантовано знімається в кінці блоку. Тримайте критичну секцію короткою: важкі обчислення робіть поза замком, а під замком лише додавання до лічильника. Тоді потоки майже не чекають один одного.",
      "Пастки. Перша: потік, що ще не приєднаний, а його об'єкт знищується, викликає <code>std::terminate</code>, тому кожен <code>std::thread</code> мусить пройти <code>join</code>. Друга: друк з потоків, бо рядки перемішаються й порядок стане випадковим. Третя: звичайний <code>int</code> замість <code>atomic</code> чи замка для спільного лічильника: це гонка даних і неозначена поведінка. Четверта: лямбда з <code>[&amp;]</code>, що переживає змінні, на які посилається.",
      "Декомпозиція така: функція <code>work(n)</code> чисте обчислення без потоків, функція <code>runAll(jobs, workers)</code> керує потоками й повертає вектор результатів, <code>main</code> друкує. Чисту функцію легко перевірити окремо, а проєкт працює й з одним потоком. Хороша перевірка паралельного коду: порівняйте результат при одному й при кількох потоках, вони мусять збігатися.",
      "Приклад нижче збирає все разом: пул із кількох потоків, атомарна черга, комірки результатів і лічильник під замком. Тестувати паралелізм складно, тому ми й вигадали правила, за яких вивід передбачуваний. Ці ж принципи, як-от незалежні комірки, <code>join</code> перед читанням і короткі замки, працюють у будь-яких паралельних програмах.",
    ],
    code: [
      String.raw`#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::vector<int> results(4, 0);
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back([&results, i] { results[i] = (i + 1) * 10; });
    }
    for (auto& t : threads) t.join();
    for (int i = 0; i < 4; ++i) std::cout << "потік " << i << ": " << results[i] << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

int main() {
    int total = 0;
    std::mutex m;
    std::vector<std::thread> threads;
    for (int t = 0; t < 4; ++t) {
        threads.emplace_back([&total, &m] {
            for (int k = 0; k < 1000; ++k) {
                std::lock_guard<std::mutex> lock(m);
                ++total;
            }
        });
    }
    for (auto& t : threads) t.join();
    std::cout << "разом: " << total << "\n";
    return 0;
}
`,
      String.raw`#include <atomic>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

long long work(int n) {
    long long sum = 0;
    for (int k = 1; k <= n; ++k) sum += static_cast<long long>(k) * k;
    return sum;
}

std::vector<long long> runAll(int jobs, int workers, int& done) {
    std::vector<long long> results(jobs, 0);
    std::atomic<int> next{0};
    std::mutex m;
    done = 0;

    auto worker = [&] {
        while (true) {
            int i = next++;
            if (i >= jobs) break;
            results[i] = work((i + 1) * 100);
            std::lock_guard<std::mutex> lock(m);
            ++done;
        }
    };

    std::vector<std::thread> pool;
    for (int w = 0; w < workers; ++w) pool.emplace_back(worker);
    for (auto& t : pool) t.join();
    return results;
}

int main() {
    int doneA = 0, doneB = 0;
    auto a = runAll(6, 3, doneA);
    auto b = runAll(6, 1, doneB);
    for (std::size_t i = 0; i < a.size(); ++i) {
        std::cout << "job " << i + 1 << ": " << a[i] << "\n";
    }
    std::cout << "виконано: " << doneA << " і " << doneB << "\n";
    std::cout << "однаково: " << (a == b ? "так" : "ні") << "\n";
    return 0;
}
`,
      String.raw`// аварія: знищення приєднуваного std::thread без join викликає std::terminate
#include <iostream>
#include <thread>

int main() {
    std::cout << "запускаємо потік\n";
    std::thread t([] {});
    return 0;
}
`,
    ],
    note: "Детермінований паралелізм: кожен потік пише у власну комірку, спільний лічильник береться під <code>lock_guard</code> або це <code>atomic</code>, друк лише в <code>main</code> після <code>join</code>. Кожен <code>std::thread</code> обов'язково приєднуйте, інакше програма завершиться через <code>terminate</code>.",
    work: "Так працюють пакетна обробка файлів, паралельні перевірки, розсилки й обчислення над розділеними даними. Розподіл незалежних завдань між потоками з атомарним лічильником це основа власних пулів потоків і планувальників.",
    tasks: [
      "Чому запис результату в <code>results[i]</code> з різних потоків не створює гонки даних, а спільний <code>int</code> лічильник створює?",
      "Що станеться, якщо знищити об'єкт <code>std::thread</code>, не викликавши <code>join</code>, і як це виправити?",
    ],
  },
];
