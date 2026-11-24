export const LESSONS_10 = [
  {
    t: "Розбір рядка запиту: метод, шлях і заголовки",
    ch: "Формати й протоколи",
    easy: "Запит HTTP це лист із чітким бланком: у першому рядку написано, що зробити й з чим, далі йдуть позначки на конверті, а після порожнього рядка саме повідомлення. Розбір це читання бланка за полями.",
    p: [
      "Усі протоколи, з якими працює сервер, це просто текст або байти за договореними правилами. HTTP-запит складається з трьох частин. Перший рядок, <b>рядок запиту</b>, має вигляд <code>GET /index.html HTTP/1.1</code>: метод, шлях і версія, розділені пробілами. Далі йдуть <b>заголовки</b>, по одному на рядок у вигляді <code>Ім'я: значення</code>. Порожній рядок закінчує заголовки, і все після нього це <b>тіло</b>. Кінець рядка в протоколі це пара символів CR і LF.",
      "Модель у голові: розбір це послідовність маленьких рішень «де закінчується поле». Для слів, розділених пробілами, найпростіше <code>std::istringstream</code> і оператор <code>&gt;&gt;</code>: він пропускає пропуски й читає слово. Для рядків потрібен <code>std::getline</code>. А для заголовка шукаємо двокрапку методом <code>find(':')</code> і ділимо рядок на ім'я та значення двома викликами <code>substr</code>. Нашого інструментарію з попередніх глав достатньо, мережа поки не потрібна: тестовий запит це звичайний рядок.",
      "Є кілька деталей, на яких спотикаються всі. Значення заголовка зазвичай оточене пробілами, тому його треба обрізати (trim). Після <code>getline</code> по символу <code>'\\n'</code> на кінці рядка лишається <code>'\\r'</code>, його теж треба прибрати. Імена заголовків нечутливі до регістру: <code>Host</code>, <code>host</code> і <code>HOST</code> означають те саме, тож ключі мапи зручно зводити до нижнього регістру. Тоді пошук завжди однаковий.",
      "Структуру результату варто оформити типом: <code>struct Request</code> із полями <code>method</code>, <code>path</code>, <code>version</code>, <code>std::map&lt;std::string, std::string&gt; headers</code> і <code>body</code>. Функція розбору повертає <code>bool</code>: так ви відрізняєте добрий запит від зіпсованого, не кидаючи виняток на кожну дрібницю. Дані з мережі треба вважати ненадійними, і перша ознака надійного коду це перевірка кожного кроку: чи є три слова, чи є двокрапка, чи не порожній рядок.",
      "Тіло читають після порожнього рядка. Його довжину зазвичай повідомляє заголовок <code>Content-Length</code>, і для справжнього сервера це число теж треба перевірити: перетворення <code>std::stoi</code> кидає виняток на нечисловому тексті. У навчальному коді ми беремо решту потоку як тіло. Про те, що тіло може бути й бінарним, ми поговоримо в уроці про порядок байтів.",
      "Типові пастки. По-перше, <code>find</code> повертає <code>std::string::npos</code>, коли нічого не знайдено, і якщо не перевірити, <code>substr(npos + 1)</code> дасть дивний результат. По-друге, <code>map::at</code> на відсутньому ключі кидає виняток, тому для необов'язкових заголовків користуйтеся <code>find</code> або <code>count</code>. По-третє, не забувайте про дублікати: другий <code>Cookie</code> просто перезапише перший у нашій мапі, і це свідоме спрощення.",
      "Підсумок: рядок запиту ділимо через <code>istringstream</code>, заголовки через <code>find(':')</code> і trim, ключі зводимо до нижнього регістру, кожен крок перевіряємо. Шлях із запиту ще містить query-рядок після знака питання, наприклад <code>/search?q=cpp</code>. Як його розібрати й розкодувати, розкаже наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::string line = "GET /index.html HTTP/1.1";
    std::istringstream in(line);
    std::string method, path, version;
    in >> method >> path >> version;
    std::cout << "метод: " << method << "\n";
    std::cout << "шлях: " << path << "\n";
    std::cout << "версія: " << version << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

std::string trim(const std::string& s) {
    const char* ws = " \t\r\n";
    std::size_t b = s.find_first_not_of(ws);
    if (b == std::string::npos) {
        return "";
    }
    std::size_t e = s.find_last_not_of(ws);
    return s.substr(b, e - b + 1);
}

int main() {
    std::string line = "Content-Type:  text/html  \r";
    std::size_t colon = line.find(':');
    if (colon == std::string::npos) {
        std::cout << "це не заголовок\n";
        return 0;
    }
    std::string name = trim(line.substr(0, colon));
    std::string value = trim(line.substr(colon + 1));
    std::cout << "[" << name << "] [" << value << "]\n";
    return 0;
}
`,
      String.raw`#include <cctype>
#include <iostream>
#include <map>
#include <sstream>
#include <string>

struct Request {
    std::string method, path, version;
    std::map<std::string, std::string> headers;
    std::string body;
};

std::string trim(const std::string& s) {
    const char* ws = " \t\r\n";
    std::size_t b = s.find_first_not_of(ws);
    if (b == std::string::npos) {
        return "";
    }
    return s.substr(b, s.find_last_not_of(ws) - b + 1);
}

std::string lower(std::string s) {
    for (char& c : s) {
        c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    }
    return s;
}

bool parse_request(const std::string& text, Request& req) {
    std::istringstream in(text);
    std::string line;
    if (!std::getline(in, line)) {
        return false;
    }
    std::istringstream first(trim(line));
    if (!(first >> req.method >> req.path >> req.version)) {
        return false;
    }
    while (std::getline(in, line)) {
        line = trim(line);
        if (line.empty()) {
            break;
        }
        std::size_t colon = line.find(':');
        if (colon == std::string::npos) {
            return false;
        }
        req.headers[lower(trim(line.substr(0, colon)))] = trim(line.substr(colon + 1));
    }
    std::getline(in, req.body, '\0');
    return true;
}

int main() {
    std::string text =
        "POST /api/users HTTP/1.1\r\n"
        "Host: example.com\r\n"
        "Content-Type: application/json\r\n"
        "X-Token:   abc123  \r\n"
        "\r\n"
        "{\"name\":\"Ola\"}";
    Request req;
    if (!parse_request(text, req)) {
        std::cout << "поганий запит\n";
        return 1;
    }
    std::cout << req.method << " " << req.path << " " << req.version << "\n";
    for (const auto& [name, value] : req.headers) {
        std::cout << name << " => " << value << "\n";
    }
    std::cout << "тіло: " << req.body << "\n";

    Request bad;
    std::cout << "порожній запит: " << (parse_request("", bad) ? "ок" : "відхилено") << "\n";
    std::cout << "без шляху: " << (parse_request("GET\r\n\r\n", bad) ? "ок" : "відхилено") << "\n";
    return 0;
}
`,
      String.raw`// аварія: map::at на відсутньому заголовку кидає виняток, якого ніхто не ловить
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, std::string> headers = {{"host", "example.com"}};
    std::cout << "host: " << headers.at("host") << "\n";
    std::cout << "cookie: " << headers.at("cookie") << "\n";
    return 0;
}
`,
    ],
    note: "Рядок запиту читайте через <code>istringstream</code>, заголовки діліть по двокрапці, обрізайте пробіли й <code>'\\r'</code>, а ключі зводьте до нижнього регістру. Кожен крок перевіряйте: <code>find</code> може повернути <code>npos</code>.",
    work: "Так влаштований вхід будь-якого вебсервера, проксі й API-шлюзу: перш ніж обробити запит, його розбирають на метод, шлях і заголовки. Той самий прийом читає листи, конфігурації, журнали й будь-які текстові протоколи.",
    tasks: [
      "Чому ключі заголовків зручно зводити до нижнього регістру перед записом у мапу?",
      "Що поверне <code>find(':')</code>, якщо у рядку немає двокрапки, і що трапиться, якщо цього не перевірити перед <code>substr</code>?",
    ],
  },
  {
    t: "URL і query-рядок: розбір і кодування",
    ch: "Формати й протоколи",
    easy: "Адреса в запиті це поштова адреса з додатковими приміткою: шлях каже, куди йти, а після знака питання лежить список побажань. Спецсимволи в ній пишуть умовним кодом, як пересилають «дзвінок» словами.",
    p: [
      "Шлях із рядка запиту часто виглядає так: <code>/search?q=c%2B%2B&amp;page=2#top</code>. У ньому кілька частин. До знака <code>?</code> іде <b>шлях</b>. Між <code>?</code> і <code>#</code> лежить <b>query-рядок</b>: пари <code>ключ=значення</code>, розділені знаком <code>&amp;</code>. Усе після <code>#</code> це <b>фрагмент</b>: його браузер залишає собі й на сервер не надсилає, але в самому рядку адреси він може бути, тому його теж вміють відокремлювати.",
      "Модель проста: розбір це кілька послідовних розрізів. Спершу шукаємо <code>#</code> і відрізаємо фрагмент, потім шукаємо <code>?</code> і ділимо решту на шлях і query, а query ділимо по <code>&amp;</code>, і кожну пару по першому <code>=</code>. Порядок важливий: шукаючи <code>?</code> спершу, ви випадково візьмете знак питання з фрагмента. Ділити пару треба саме по <i>першому</i> знаку <code>=</code>, бо значення саме може його містити.",
      "Чому ж у прикладі <code>c%2B%2B</code>? Бо символи <code>&amp;</code>, <code>=</code>, <code>?</code>, <code>#</code> і пробіл мають у адресі особливе значення, тому в самих даних їх записують <b>percent-кодуванням</b>: знак <code>%</code> і два шістнадцяткові розряди байта. Плюс це <code>%2B</code>, пробіл це <code>%20</code>, а кирилична літера, яка в UTF-8 займає два байти, дає два таких коди. У query-рядках форм пробіл часто пишуть ще й як звичайний <code>+</code>.",
      "Розкодування читає рядок зліва направо. Звичайні символи копіюємо як є. Побачивши <code>%</code>, беремо наступні два символи, перетворюємо їх із шістнадцяткових цифр на число від 0 до 255 і додаємо цей байт у результат. Кодування працює навпаки: символи цифр, літер і <code>-._~</code> лишаємо, а решту записуємо як <code>%</code> з двома цифрами. Букви в кодах пишуть великими, <code>%2F</code>, так простіше порівнювати.",
      "Головне правило безпеки: <b>спершу розділяйте, потім декодуйте</b>. Якщо спочатку розкодувати все, закодований <code>%26</code> стане знаком <code>&amp;</code> і зламає поділ на пари: хтось зможе підсунути чужий параметр. Тому розбиваємо по <code>&amp;</code> і <code>=</code> у сирому тексті, а розкодовуємо кожне ім'я й значення окремо. Так закодований амперсанд лишається частиною значення.",
      "Пастки: обірваний код <code>%</code> наприкінці рядка, <code>%</code> з не-шістнадцятковими знаками (<code>%zz</code>) і ключ без значення (<code>flag</code> замість <code>flag=1</code>). Не зберігайте результат у <code>std::map</code>, якщо порядок чи дублікати важливі: тоді візьміть <code>std::vector&lt;std::pair&lt;std::string, std::string&gt;&gt;</code>. Усе це дані ззовні, тож некоректний код має викликати помилку, а не мовчки давати сміття.",
      "Отже, адресу ділимо на шлях, query і фрагмент, query на пари, а імена й значення розкодовуємо окремо. Відтепер ми вміємо читати запит повністю. Далі навчимося робити зворотне, але вже для даних: перетворювати структури на текст формату JSON і правильно екранувати спецсимволи.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

int main() {
    std::string target = "/search?q=cpp&page=2#top";
    std::string fragment;
    std::size_t hash = target.find('#');
    if (hash != std::string::npos) {
        fragment = target.substr(hash + 1);
        target.erase(hash);
    }
    std::string query;
    std::size_t qm = target.find('?');
    if (qm != std::string::npos) {
        query = target.substr(qm + 1);
        target.erase(qm);
    }
    std::cout << "шлях: " << target << "\n";
    std::cout << "query: " << query << "\n";
    std::cout << "фрагмент: " << fragment << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <utility>
#include <vector>

std::vector<std::pair<std::string, std::string>> split_query(const std::string& query) {
    std::vector<std::pair<std::string, std::string>> out;
    std::size_t pos = 0;
    while (pos <= query.size()) {
        std::size_t amp = query.find('&', pos);
        if (amp == std::string::npos) {
            amp = query.size();
        }
        std::string part = query.substr(pos, amp - pos);
        if (!part.empty()) {
            std::size_t eq = part.find('=');
            if (eq == std::string::npos) {
                out.emplace_back(part, "");
            } else {
                out.emplace_back(part.substr(0, eq), part.substr(eq + 1));
            }
        }
        pos = amp + 1;
    }
    return out;
}

int main() {
    for (const auto& [k, v] : split_query("q=cpp&page=2&flag&eq=a=b")) {
        std::cout << k << " -> [" << v << "]\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>
#include <string>

int hex_value(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

std::string percent_decode(const std::string& s) {
    std::string out;
    for (std::size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '+') {
            out += ' ';
        } else if (s[i] == '%') {
            if (i + 2 >= s.size() + 0 && i + 2 > s.size() - 1) {
                throw std::invalid_argument("обірваний %-код");
            }
            int hi = hex_value(s[i + 1]);
            int lo = hex_value(s[i + 2]);
            if (hi < 0 || lo < 0) {
                throw std::invalid_argument("не шістнадцяткові цифри після %");
            }
            out += static_cast<char>(hi * 16 + lo);
            i += 2;
        } else {
            out += s[i];
        }
    }
    return out;
}

std::string percent_encode(const std::string& s) {
    const char* hex = "0123456789ABCDEF";
    std::string out;
    for (char ch : s) {
        unsigned char u = static_cast<unsigned char>(ch);
        bool plain = (u >= 'a' && u <= 'z') || (u >= 'A' && u <= 'Z') || (u >= '0' && u <= '9') ||
                     u == '-' || u == '.' || u == '_' || u == '~';
        if (plain) {
            out += ch;
        } else {
            out += '%';
            out += hex[u >> 4];
            out += hex[u & 0x0F];
        }
    }
    return out;
}

int main() {
    std::cout << percent_encode("c++ & a=b") << "\n";
    std::cout << percent_encode("мир") << "\n";
    std::cout << percent_decode("c%2B%2B+%26+a%3Db") << "\n";
    std::string back = percent_decode(percent_encode("привіт, світе!"));
    std::cout << back << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <map>
#include <stdexcept>
#include <string>

int hex_value(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

std::string decode(const std::string& s) {
    std::string out;
    for (std::size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '+') {
            out += ' ';
        } else if (s[i] == '%' && i + 2 < s.size() + 0 + 0 && hex_value(s[i + 1]) >= 0 && hex_value(s[i + 2]) >= 0) {
            out += static_cast<char>(hex_value(s[i + 1]) * 16 + hex_value(s[i + 2]));
            i += 2;
        } else if (s[i] == '%') {
            throw std::invalid_argument("поганий %-код у: " + s);
        } else {
            out += s[i];
        }
    }
    return out;
}

struct Url {
    std::string path, fragment;
    std::map<std::string, std::string> params;
};

Url parse_url(std::string target) {
    Url u;
    std::size_t hash = target.find('#');
    if (hash != std::string::npos) {
        u.fragment = target.substr(hash + 1);
        target.erase(hash);
    }
    std::string query;
    std::size_t qm = target.find('?');
    if (qm != std::string::npos) {
        query = target.substr(qm + 1);
        target.erase(qm);
    }
    u.path = decode(target);
    std::size_t pos = 0;
    while (pos < query.size()) {
        std::size_t amp = query.find('&', pos);
        if (amp == std::string::npos) amp = query.size();
        std::string part = query.substr(pos, amp - pos);
        std::size_t eq = part.find('=');
        if (eq == std::string::npos) {
            u.params[decode(part)] = "";
        } else {
            u.params[decode(part.substr(0, eq))] = decode(part.substr(eq + 1));
        }
        pos = amp + 1;
    }
    return u;
}

int main() {
    Url u = parse_url("/my%20files/list?name=%D0%9E%D0%BB%D1%8F&tag=c%2B%2B&note=a%26b+c#end");
    std::cout << "шлях: " << u.path << "\n";
    for (const auto& [k, v] : u.params) {
        std::cout << k << " = " << v << "\n";
    }
    std::cout << "фрагмент: " << u.fragment << "\n";
    return 0;
}
`,
      String.raw`// аварія: обірваний %-код у вхідному рядку кидає виняток, який ніхто не ловить
#include <iostream>
#include <stdexcept>
#include <string>

int hex_value(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

std::string decode(const std::string& s) {
    std::string out;
    for (std::size_t i = 0; i < s.size(); ++i) {
        if (s[i] != '%') {
            out += s[i];
            continue;
        }
        if (i + 2 >= s.size() || hex_value(s[i + 1]) < 0 || hex_value(s[i + 2]) < 0) {
            throw std::invalid_argument("поганий %-код");
        }
        out += static_cast<char>(hex_value(s[i + 1]) * 16 + hex_value(s[i + 2]));
        i += 2;
    }
    return out;
}

int main() {
    std::cout << decode("a%20b") << "\n";
    std::cout << decode("100%") << "\n";
    return 0;
}
`,
    ],
    note: "Розрізайте адресу в порядку <code>#</code>, <code>?</code>, <code>&amp;</code>, <code>=</code> і лише потім розкодовуйте кожне ім'я та значення. Percent-код це <code>%</code> і два шістнадцяткові розряди; обірваний чи хибний код це помилка.",
    work: "Query-рядки є в кожному вебзапиті: пошук, фільтри, пагінація, токени у посиланнях. Серверний фреймворк робить саме цей розбір для вас, а помилка в порядку розрізів колись давала уразливості підміни параметрів.",
    tasks: [
      "Чому не можна спершу розкодувати весь query-рядок, а вже потім ділити його по <code>&amp;</code>?",
      "Скільки percent-кодів дасть одна кирилична літера в UTF-8 і чому?",
    ],
  },
  {
    t: "JSON вручну: серіалізація й екранування",
    ch: "Формати й протоколи",
    easy: "Серіалізація це пакування речей у валізу за правилами авіакомпанії: усе має лежати в потрібному порядку, а небезпечні предмети, як лапки в тексті, треба загорнути, щоб на іншому кінці їх розпакували правильно.",
    p: [
      "JSON це текстовий формат обміну даними, що складається з кількох видів значень: рядок у подвійних лапках, число, <code>true</code>, <code>false</code>, <code>null</code>, масив у квадратних дужках і об'єкт у фігурних. Об'єкт це пари <code>\"ключ\": значення</code> через кому. Стандартна бібліотека C++ не має JSON, у справжніх проєктах беруть готову бібліотеку, але щоб розуміти, що в ній відбувається, корисно раз написати серіалізатор власноруч. Це не складно, і ми зберемося лише на правилах формату.",
      "Модель у голові: серіалізація це конкатенація рядків. Для цілого числа беремо <code>std::to_string</code>, для <code>bool</code> пишемо слово <code>true</code> або <code>false</code>, для рядка обертаємо вміст у лапки, а для масиву й об'єкта ставимо дужки та розділяємо елементи комами. Єдина тонкість, яка справді відрізняє JSON від «просто тексту», це <b>екранування</b> рядків.",
      "Усередині рядка лапка закінчила б його достроково, тому її пишуть як <code>\\\"</code>. Зворотний слеш, який починає екрановану послідовність, сам пишуть як <code>\\\\</code>. Переводи рядка, табуляції та інші керівні символи (код менше 32) не можна вставляти в рядок «як є»: для них є короткі форми <code>\\n</code>, <code>\\r</code>, <code>\\t</code> і загальна форма <code>\\u00XX</code>. Символи UTF-8 з кодом від 128 можна лишати байтами без змін: JSON допускає Unicode прямо в тексті.",
      "Коми: найчастіша помилка це зайва кома після останнього елемента, бо JSON її не терпить. Зручна ідіома: ставити кому <i>перед</i> кожним елементом, окрім першого, тобто тримати прапорець «перший чи ні». Саме так працює маленький клас-будівельник у прикладах: він сам пам'ятає, чи треба кому, і ви не помилитеся в циклі.",
      "Числа з рухомою комою теж мають правило: JSON не знає <code>NaN</code> і нескінченності. Якщо у вашому <code>double</code> такий результат (наприклад, ділення нуля на нуль), записати його в JSON можна лише домовленим способом: <code>null</code> або помилка. Ми кидаємо виняток, бо тихо надіслати хибні дані гірше, ніж зупинитися. І друге: для <code>double</code> задайте точність потоку, інакше втратите знаки.",
      "Пастка номер один: забути про екранування. Ім'я <code>Оля \"Кіт\"</code> без нього дасть рядок із зайвою лапкою, і чужий парсер зламається, а зловмисник може підлаштувати ім'я так, щоб підмінити сусідні поля. Пастка номер два: будувати JSON через <code>+</code> по шматках без перевірки комами й дужками. Тримайте екранування в одній функції й викликайте її для кожного рядка, як ключа, так і значення.",
      "Отже, серіалізатор це кілька правил: лапки та слеш, керівні символи, коми між елементами, дужки та перевірка чисел. Ми розібрали тексти двох протоколів, а далі спуститься рівнем нижче: до бінарних форматів, де число це не символи, а байти, і вирішальним стає їхній порядок.",
    ],
    code: [
      String.raw`#include <cstdio>
#include <iostream>
#include <string>

std::string escape(const std::string& s) {
    std::string out;
    for (char ch : s) {
        switch (ch) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default:
                if (static_cast<unsigned char>(ch) < 0x20) {
                    char buf[8];
                    std::snprintf(buf, sizeof buf, "\\u%04x", static_cast<unsigned>(static_cast<unsigned char>(ch)));
                    out += buf;
                } else {
                    out += ch;
                }
        }
    }
    return out;
}

std::string quote(const std::string& s) {
    return "\"" + escape(s) + "\"";
}

int main() {
    std::cout << quote("hello") << "\n";
    std::cout << quote("він сказав: \"привіт\"") << "\n";
    std::cout << quote("рядок1\nрядок2\tтаб") << "\n";
    std::cout << quote("шлях C:\\temp") << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

std::string quote(const std::string& s) {
    std::string out = "\"";
    for (char ch : s) {
        if (ch == '"' || ch == '\\') out += '\\';
        out += ch;
    }
    return out + "\"";
}

class JsonObject {
public:
    JsonObject& add(const std::string& key, const std::string& value) { return raw(key, quote(value)); }
    JsonObject& add(const std::string& key, int value) { return raw(key, std::to_string(value)); }
    JsonObject& add(const std::string& key, bool value) { return raw(key, value ? "true" : "false"); }
    JsonObject& raw(const std::string& key, const std::string& json) {
        if (!first_) body_ += ",";
        first_ = false;
        body_ += quote(key) + ":" + json;
        return *this;
    }
    std::string str() const { return "{" + body_ + "}"; }

private:
    std::string body_;
    bool first_ = true;
};

int main() {
    JsonObject o;
    o.add("name", std::string("Ola")).add("age", 30).add("admin", false);
    std::cout << o.str() << "\n";
    std::cout << JsonObject().str() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <sstream>
#include <string>
#include <vector>

struct User {
    std::string name;
    int age;
    std::vector<std::string> tags;
};

std::string quote(const std::string& s) {
    std::string out = "\"";
    for (char ch : s) {
        switch (ch) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            default: out += ch;
        }
    }
    return out + "\"";
}

std::string to_json(const User& u) {
    std::ostringstream os;
    os << "{\"name\":" << quote(u.name) << ",\"age\":" << u.age << ",\"tags\":[";
    for (std::size_t i = 0; i < u.tags.size(); ++i) {
        if (i > 0) os << ",";
        os << quote(u.tags[i]);
    }
    os << "]}";
    return os.str();
}

std::string to_json(const std::vector<User>& users) {
    std::string out = "[";
    for (std::size_t i = 0; i < users.size(); ++i) {
        if (i > 0) out += ",";
        out += to_json(users[i]);
    }
    return out + "]";
}

int main() {
    std::vector<User> users = {
        {"Оля \"Кіт\"", 31, {"admin", "dev"}},
        {"Тарас", 25, {}},
        {"Line\nBreak", 40, {"a\\b"}},
    };
    std::cout << to_json(users) << "\n";
    return 0;
}
`,
      String.raw`// аварія: JSON не має NaN, тому серіалізатор кидає виняток, який ніхто не ловить
#include <cmath>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>

std::string number(double x) {
    if (!std::isfinite(x)) {
        throw std::runtime_error("NaN і нескінченність у JSON неможливі");
    }
    std::ostringstream os;
    os.precision(15);
    os << x;
    return os.str();
}

int main() {
    std::cout << number(0.1) << "\n";
    std::cout << number(2.5) << "\n";
    double zero = 0.0;
    std::cout << number(zero / zero) << "\n";
    return 0;
}
`,
    ],
    note: "У JSON-рядку екрануйте лапку, зворотний слеш і керівні символи; коми ставте перед кожним елементом, окрім першого; <code>NaN</code> і нескінченність у JSON не існують. Екранування тримайте в одній функції.",
    work: "Так сервіси відповідають клієнтам, пишуть структуровані журнали й зберігають налаштування. Навіть якщо ви користуєтеся бібліотекою, вона робить саме це, а баги з неекранованими лапками є класичним джерелом поламаних API.",
    tasks: [
      "Які символи в JSON-рядку обов'язково треба екранувати й чим їх замінюють?",
      "Чому коми зручно ставити перед кожним елементом, окрім першого, а не після кожного?",
    ],
  },
  {
    t: "Порядок байтів і бінарне кодування чисел",
    ch: "Формати й протоколи",
    easy: "Число з кількох байтів це слово з кількох літер: його можна записати й зліва направо, і справа наліво. Щоб двоє людей прочитали його однаково, треба домовитися, з якого кінця починати.",
    p: [
      "Текстові протоколи зручні, але бінарні компактніші й швидші: число 1000000 займає в тексті сім байтів, а в бінарному вигляді чотири. Формати файлів, мережеві заголовки й власні протоколи між сервісами здебільшого бінарні. Тут виникає питання, якого не було з текстом: число, що не вміщується в один байт, лежить у пам'яті як кілька байтів, і їх треба розкласти в певному порядку.",
      "Порядків є два. У <b>big-endian</b> (мережевий порядок) першим іде старший байт: число <code>0x12345678</code> записується як <code>12 34 56 78</code>. У <b>little-endian</b> першим іде молодший байт: <code>78 56 34 12</code>. Більшість сучасних процесорів little-endian, а протоколи, як-от IP і TCP, big-endian. Тому не можна просто скопіювати байти змінної в буфер: на іншій машині їх прочитають навпаки.",
      "Рецепт, який працює скрізь і не залежить від порядку на вашій машині: розкладати число <b>зсувами й масками</b>. Байт номер k отримуємо виразом <code>(value &gt;&gt; (8 * k)) &amp; 0xFF</code>. Збирання виконуємо навпаки: кожен байт зсуваємо на своє місце й об'єднуємо через <code>|</code>. Зсуви діють на значення, а не на розташування в пам'яті, тому результат однаковий і на little-endian, і на big-endian процесорі.",
      "Тип байта в буфері: <code>std::uint8_t</code> у <code>std::vector</code>. Це беззнакове ціле, і тут ховається головна пастка. Перед зсувом байт треба привести до ширшого беззнакового типа: <code>static_cast&lt;std::uint32_t&gt;(b[0]) &lt;&lt; 24</code>. Без приведення <code>b[0]</code> стає <code>int</code>, і зсув на 24 розряди в знаковий біт для значень від 128 і більше це вже неоднозначна поведінка. Так само число зі знаком кодуйте через беззнаковий тип того ж розміру.",
      "Число зі знаком, наприклад <code>std::int16_t</code> зі значенням -2, записують як <b>доповняльний код</b>: байти <code>FF FE</code>. Щоб кодувати, спершу перетворюємо <code>static_cast&lt;std::uint16_t&gt;(v)</code>, а щоб розкодувати, збираємо беззнакове значення й повертаємо <code>static_cast&lt;std::int16_t&gt;(u)</code>. Для чисел із рухомою комою потрібен окремий спосіб, і в навчальному коді їх або пишуть текстом, або домовляються про цілі в сотих частках.",
      "Друга пастка стосується читання з буфера, який прийшов ззовні. Він може бути обірваним: у вас є два байти, а ви читаєте чотири. Читач має <b>перевіряти межі</b> перед кожним читанням і повідомляти про помилку. Типовий дизайн: клас із буфером і позицією, чий метод <code>u32()</code> кидає виняток, якщо залишку бракує. Не покладайтеся на <code>operator[]</code>: він меж не перевіряє.",
      "Отже, байти розкладають зсувами й масками, порядок вибирають явно, перед зсувом розширюють беззнаковий тип і завжди звіряють довжину. Тепер у нас є рівні: текст, структури й байти. Наступний урок сполучить їх: як розбирати протокол, що приходить частинами, за допомогою скінченного автомата.",
    ],
    code: [
      String.raw`#include <cstdint>
#include <iostream>

int main() {
    std::uint32_t value = 0x12345678;
    for (int k = 0; k < 4; ++k) {
        unsigned byte = (value >> (8 * k)) & 0xFF;
        std::cout << "байт " << k << " (від молодшого): " << std::hex << byte << std::dec << "\n";
    }
    std::uint32_t back = 0;
    back |= 0x78u;
    back |= 0x56u << 8;
    back |= 0x34u << 16;
    back |= 0x12u << 24;
    std::cout << "зібрано назад: " << std::hex << back << std::dec << "\n";
    return 0;
}
`,
      String.raw`#include <cstdint>
#include <iomanip>
#include <iostream>
#include <vector>

void put_u32_be(std::vector<std::uint8_t>& out, std::uint32_t v) {
    for (int shift = 24; shift >= 0; shift -= 8) {
        out.push_back(static_cast<std::uint8_t>((v >> shift) & 0xFF));
    }
}

void put_u32_le(std::vector<std::uint8_t>& out, std::uint32_t v) {
    for (int shift = 0; shift <= 24; shift += 8) {
        out.push_back(static_cast<std::uint8_t>((v >> shift) & 0xFF));
    }
}

std::uint32_t get_u32_be(const std::vector<std::uint8_t>& in, std::size_t pos) {
    std::uint32_t v = 0;
    for (std::size_t i = 0; i < 4; ++i) {
        v = (v << 8) | static_cast<std::uint32_t>(in[pos + i]);
    }
    return v;
}

void show(const char* name, const std::vector<std::uint8_t>& b) {
    std::cout << name << ":";
    for (std::uint8_t x : b) {
        std::cout << " " << std::hex << std::setw(2) << std::setfill('0') << static_cast<unsigned>(x);
    }
    std::cout << std::dec << "\n";
}

int main() {
    std::vector<std::uint8_t> be, le;
    put_u32_be(be, 0x12345678);
    put_u32_le(le, 0x12345678);
    show("big-endian   ", be);
    show("little-endian", le);
    std::cout << "читання BE: " << std::hex << get_u32_be(be, 0) << std::dec << "\n";
    std::cout << "читання BE з LE-байтів: " << std::hex << get_u32_be(le, 0) << std::dec << "\n";
    return 0;
}
`,
      String.raw`#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

class Writer {
public:
    void u8(std::uint8_t v) { buf_.push_back(v); }
    void u16(std::uint16_t v) {
        u8(static_cast<std::uint8_t>(v >> 8));
        u8(static_cast<std::uint8_t>(v & 0xFF));
    }
    void i16(std::int16_t v) { u16(static_cast<std::uint16_t>(v)); }
    void u32(std::uint32_t v) {
        u16(static_cast<std::uint16_t>(v >> 16));
        u16(static_cast<std::uint16_t>(v & 0xFFFF));
    }
    void str(const std::string& s) {
        u16(static_cast<std::uint16_t>(s.size()));
        for (char c : s) {
            u8(static_cast<std::uint8_t>(c));
        }
    }
    const std::vector<std::uint8_t>& bytes() const { return buf_; }

private:
    std::vector<std::uint8_t> buf_;
};

class Reader {
public:
    explicit Reader(const std::vector<std::uint8_t>& b) : buf_(b) {}
    std::uint8_t u8() {
        need(1);
        return buf_[pos_++];
    }
    std::uint16_t u16() {
        std::uint16_t hi = u8();
        std::uint16_t lo = u8();
        return static_cast<std::uint16_t>((hi << 8) | lo);
    }
    std::int16_t i16() { return static_cast<std::int16_t>(u16()); }
    std::uint32_t u32() {
        std::uint32_t hi = u16();
        std::uint32_t lo = u16();
        return (hi << 16) | lo;
    }
    std::string str() {
        std::size_t n = u16();
        need(n);
        std::string s(buf_.begin() + static_cast<std::ptrdiff_t>(pos_),
                      buf_.begin() + static_cast<std::ptrdiff_t>(pos_ + n));
        pos_ += n;
        return s;
    }
    std::size_t left() const { return buf_.size() - pos_; }

private:
    void need(std::size_t n) const {
        if (buf_.size() - pos_ < n) {
            throw std::runtime_error("буфер обірваний");
        }
    }
    const std::vector<std::uint8_t>& buf_;
    std::size_t pos_ = 0;
};

int main() {
    Writer w;
    w.u8(7);
    w.i16(-2);
    w.u32(4000000000u);
    w.str("Оля");
    std::cout << "усього байтів: " << w.bytes().size() << "\n";

    Reader r(w.bytes());
    std::cout << "тип: " << static_cast<int>(r.u8()) << "\n";
    std::cout << "i16: " << r.i16() << "\n";
    std::cout << "u32: " << r.u32() << "\n";
    std::cout << "рядок: " << r.str() << "\n";
    std::cout << "залишок: " << r.left() << "\n";

    std::vector<std::uint8_t> cut(w.bytes().begin(), w.bytes().begin() + 5);
    Reader bad(cut);
    try {
        bad.u8();
        bad.i16();
        bad.u32();
    } catch (const std::runtime_error& e) {
        std::cout << "помилка: " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`// аварія: обірваний буфер викликає виняток out_of_range, який ніхто не ловить
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <vector>

std::uint32_t read_u32(const std::vector<std::uint8_t>& b, std::size_t pos) {
    if (b.size() < pos + 4) {
        throw std::out_of_range("для u32 потрібно чотири байти");
    }
    std::uint32_t v = 0;
    for (std::size_t i = 0; i < 4; ++i) {
        v = (v << 8) | b[pos + i];
    }
    return v;
}

int main() {
    std::vector<std::uint8_t> ok = {0, 0, 1, 0};
    std::cout << "ціле: " << read_u32(ok, 0) << "\n";
    std::vector<std::uint8_t> cut = {0, 0};
    std::cout << "обірване: " << read_u32(cut, 0) << "\n";
    return 0;
}
`,
    ],
    note: "Розкладайте число зсувами й масками, порядок байтів вибирайте явно, а байт перед зсувом приводьте до беззнакового ширшого типа. Число зі знаком кодуйте через беззнаковий тип того ж розміру. Довжину буфера перевіряйте перед читанням.",
    work: "Так влаштовані мережеві заголовки, формати зображень і звуку, протоколи баз даних і ваші власні кадри між сервісами. Помилка в порядку байтів чи в межах зазвичай дає сміттєві числа або вразливості, а не акуратну помилку.",
    tasks: [
      "Як записується число 0x0A0B0C0D у big-endian і в little-endian?",
      "Чому перед зсувом <code>b[0] &lt;&lt; 24</code> байт треба привести до <code>std::uint32_t</code>?",
    ],
  },
  {
    t: "Скінченний автомат для розбору протоколу",
    ch: "Формати й протоколи",
    adv: true,
    easy: "Автомат це турнікет у метро: він завжди в одному зі станів, і кожен прохід або монета переводить його в наступний. Розбір протоколу так само: читаємо по символу й міняємо стан за таблицею правил.",
    p: [
      "У попередніх уроках ми розбирали готовий рядок повністю. У мережі дані приходять <b>частинами</b>: запит може розірватися посеред слова, бо система віддала нам лише кілька байтів. Код, що очікує весь рядок, тут не працює. Потрібен розбір, який уміє зупинитися будь-де й продовжити з нового шматка. Для цього придумано <b>скінченні автомати</b>.",
      "Модель у голові: є скінченний набір <b>станів</b> (читаю метод, читаю шлях, читаю ім'я заголовка, помилка, готово) і одна змінна, що каже, у якому з них ми зараз. Кожен прочитаний байт разом із поточним станом визначає, що робити: накопичити символ, перейти до іншого стану чи оголосити помилку. Пам'ятати про минуле нам не потрібно, усе пам'ятає сам стан плюс кілька буферів.",
      "У C++ стани зручно описати переліком <code>enum class State</code>, а крок автомата записати як <code>switch</code> за станом усередині циклу за символами. Перелік дає імена замість чисел, а компілятор із прапорцем <code>-Wall</code> попередить, якщо ви забули обробити котрийсь стан. Тому в <code>switch</code> за <code>enum class</code> не пишуть <code>default</code>: тоді додавання нового стану одразу підсвітить усі місця, які його не знають.",
      "Структура розбирача така: клас зберігає поточний стан і накопичені поля, а метод <code>feed(std::string_view chunk)</code> обробляє довільний шматок. Після нього можна викликати <code>feed</code> ще раз із наступним шматком, і результат буде тим самим, як якби ми віддали все одразу. Цю властивість варто перевіряти тестом: розбийте один вхід на шматки по одному символу, по три і цілком, а результати мають збігтися.",
      "Помилки теж стан. Побачивши неприпустимий символ, автомат переходить у <code>Error</code> і більше нічого не читає: це надійніше, ніж намагатися «вгадати» продовження. Ще одна ідея: обмеження розмірів. Якщо ім'я заголовка росте без кінця, зловмисник може вичерпати пам'ять, тому довжину кожного поля обмежують і при перевищенні теж переходять у помилку. Це частина будь-якого серйозного розбирача.",
      "Пастки: забути обробити <code>'\\r'</code> перед <code>'\\n'</code>, помилитися, коли кінець рядка припадає на межу шматків, і писати переходи розкиданими по коду <code>if</code>. Тримайте всі переходи в одному <code>switch</code>, а по можливості виносьте їх у окремі маленькі функції. Коли станів багато, зручно намалювати таблицю «стан, символ, наступний стан» на папері й лише потім кодувати.",
      "Отже, автомат складається з переліку станів, змінної поточного стану і функції кроку, а його головна сила в тому, що він розбирає дані по шматках. У C++20 такі розбирачі часто мають і більш компактний запис за допомогою кореутин, але для більшості задач вистачає звичайного <code>switch</code>. Наступний урок про те, як подавати шматки без копіювання.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

enum class State { Space, Word };

int main() {
    std::string text = "  один два   три ";
    State st = State::Space;
    int words = 0;
    for (char c : text) {
        switch (st) {
        case State::Space:
            if (c != ' ') {
                st = State::Word;
                ++words;
            }
            break;
        case State::Word:
            if (c == ' ') {
                st = State::Space;
            }
            break;
        }
    }
    std::cout << "слів: " << words << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

enum class State { Method, Path, Version, Done, Error };

struct Line {
    State st = State::Method;
    std::string method, path, version;

    void step(char c) {
        switch (st) {
        case State::Method:
            if (c == ' ') {
                st = method.empty() ? State::Error : State::Path;
            } else {
                method += c;
            }
            break;
        case State::Path:
            if (c == ' ') {
                st = path.empty() ? State::Error : State::Version;
            } else {
                path += c;
            }
            break;
        case State::Version:
            if (c == '\n') {
                st = State::Done;
            } else if (c != '\r') {
                version += c;
            }
            break;
        case State::Done:
        case State::Error:
            break;
        }
    }
};

int main() {
    Line line;
    for (char c : std::string("GET /a?x=1 HTTP/1.1\r\n")) {
        line.step(c);
    }
    std::cout << (line.st == State::Done ? "готово" : "ні") << "\n";
    std::cout << line.method << "|" << line.path << "|" << line.version << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <map>
#include <string>
#include <string_view>

class RequestParser {
public:
    enum class State { Method, Path, Version, HeaderName, HeaderValue, Done, Error };

    void feed(std::string_view chunk) {
        for (char c : chunk) {
            step(c);
        }
    }
    State state() const { return st_; }
    const std::string& method() const { return method_; }
    const std::string& path() const { return path_; }
    const std::map<std::string, std::string>& headers() const { return headers_; }

private:
    void step(char c) {
        switch (st_) {
        case State::Method:
            if (c == ' ') {
                st_ = State::Path;
            } else {
                method_ += c;
            }
            break;
        case State::Path:
            if (c == ' ') {
                st_ = State::Version;
            } else {
                path_ += c;
            }
            break;
        case State::Version:
            if (c == '\n') {
                st_ = State::HeaderName;
            }
            break;
        case State::HeaderName:
            if (c == '\r') {
                break;
            }
            if (c == '\n') {
                st_ = State::Done;
            } else if (c == ':') {
                st_ = State::HeaderValue;
            } else {
                name_ += c;
            }
            break;
        case State::HeaderValue:
            if (c == '\r') {
                break;
            }
            if (c == '\n') {
                headers_[name_] = value_;
                name_.clear();
                value_.clear();
                st_ = State::HeaderName;
            } else if (!(c == ' ' && value_.empty())) {
                value_ += c;
            }
            break;
        case State::Done:
        case State::Error:
            break;
        }
    }

    State st_ = State::Method;
    std::string method_, path_, name_, value_;
    std::map<std::string, std::string> headers_;
};

std::string dump(const RequestParser& p) {
    std::string out = p.method() + " " + p.path();
    for (const auto& [k, v] : p.headers()) {
        out += " [" + k + "=" + v + "]";
    }
    return out;
}

int main() {
    const std::string text = "GET /a HTTP/1.1\r\nHost: example.com\r\nAccept: */*\r\n\r\n";

    RequestParser whole;
    whole.feed(text);

    RequestParser pieces;
    for (std::size_t i = 0; i < text.size(); i += 3) {
        pieces.feed(std::string_view(text).substr(i, 3));
    }

    std::cout << dump(whole) << "\n";
    std::cout << dump(pieces) << "\n";
    std::cout << "однаково: " << (dump(whole) == dump(pieces) ? "так" : "ні") << "\n";
    std::cout << "завершено: " << (pieces.state() == RequestParser::State::Done ? "так" : "ні") << "\n";
    return 0;
}
`,
      String.raw`// аварія: після помилки в автоматі ми кидаємо виняток, який ніхто не ловить
#include <iostream>
#include <stdexcept>
#include <string>

enum class State { Number, Done };

int parse_number(const std::string& text) {
    State st = State::Number;
    int value = 0;
    for (char c : text) {
        switch (st) {
        case State::Number:
            if (c >= '0' && c <= '9') {
                value = value * 10 + (c - '0');
            } else if (c == ';') {
                st = State::Done;
            } else {
                throw std::runtime_error(std::string("неприпустимий символ: ") + c);
            }
            break;
        case State::Done:
            break;
        }
    }
    return value;
}

int main() {
    std::cout << parse_number("1024;") << "\n";
    std::cout << parse_number("10x4;") << "\n";
    return 0;
}
`,
    ],
    note: "Автомат це перелік станів, змінна поточного стану й один <code>switch</code> за станом і символом. Він розбирає дані по шматках, а результат не залежить від того, як їх порізали. Помилку робіть окремим станом.",
    work: "Так розбирають HTTP у вебсерверах, протоколи баз даних, лексери мов програмування й будь-який потік, що приходить мережею частинами. Розбір по шматках не потребує великих буферів і добре працює під навантаженням.",
    tasks: [
      "Чому розбір по шматках зручніше писати як автомат, а не як функцію, що чекає весь рядок?",
      "Навіщо в <code>switch</code> за <code>enum class</code> не пишуть <code>default</code>?",
    ],
  },
  {
    t: "Розбір без копіювання: string_view і span-подібні вікна",
    ch: "Формати й протоколи",
    adv: true,
    easy: "Копіювати текст для розбору це як переписувати книгу, щоб показати одну цитату. Вікно вказує пальцем на місце в оригіналі: початок і довжина, а самі літери лишаються на своїх місцях.",
    p: [
      "Досі наші розбирачі створювали багато маленьких <code>std::string</code>: метод, шлях, імена заголовків. Кожен такий рядок це копія частини вхідного тексту, а іноді й виділення пам'яті. Для великого потоку запитів це відчутна ціна. Знаючи, що вхідний текст усе одно живе в буфері, ми можемо замість копій тримати <b>вікна</b> на нього: покажчик на початок і довжину.",
      "Саме це робить <code>std::string_view</code> із C++17: він зберігає лише два значення і <b>не володіє</b> символами. Його створення, <code>substr</code>, <code>remove_prefix</code> та <code>remove_suffix</code> коштують стільки, як копіювання двох чисел, незалежно від довжини тексту. Модель у голові: оригінал один, а вікна це різні шматки скла, накладені на нього. Змінити текст через вікно не можна, і тим краще: розбір нічого не псує.",
      "Типовий розбір з вікнами: беремо вікно на весь вхід, знаходимо роздільник через <code>find</code>, відрізаємо початок як нове вікно, а від початкового віджимаємо вже прочитане через <code>remove_prefix</code>. Так пишуть <code>split</code>, який повертає <code>std::vector&lt;std::string_view&gt;</code> без жодного виділення рядків. Із <code>std::map&lt;std::string_view, std::string_view&gt;</code> теж можна збудувати таблицю заголовків, що вказує всередину запиту.",
      "Цього ж принципу можна навчити й власний код: <b>span-подібне вікно</b> над масивом. Це маленька структура з покажчиком і розміром та методами <code>size</code>, <code>operator[]</code> і <code>sub(from, count)</code>. У C++20 для цього є стандартний <code>std::span</code>, але ідея проста й її можна написати самим, а бінарні розбирачі так і роблять: заголовок це вікно на перші байти, тіло це вікно на решту.",
      "Головна пастка: вікно не продовжує життя оригіналу. Якщо рядок, на який воно дивиться, зник, вікно <b>висить</b>, і читання з нього це неозначена поведінка. Найчастіше це трапляється так: функція повертає <code>string_view</code>, створений із локальної <code>std::string</code> чи з тимчасового результату іншої функції. Правило: вікно не повинно пережити те, на що воно вказує. Зберігайте вікна лише там, де оригінал надійно живе довше.",
      "Інші дрібниці. Неявно перетворити <code>string_view</code> на <code>std::string</code> не можна, потрібне явне <code>std::string(sv)</code>: компілятор змушує вас бачити місце копіювання. Вікно не гарантує завершального нуля, тому передавати його функціям C, що чекають C-рядок, не можна. А <code>substr</code> із позицією за межами кидає виняток, як і в <code>std::string</code>.",
      "Підсумок: коли оригінал живе довше за розбір, замість копій тримайте вікна. Це прискорює код і не ускладнює його. Ми завершили главу про формати: текстові запити, адреси, JSON, бінарні поля, автомат і розбір без копій. У наступній главі підемо вище, до архітектури: як розкласти такі розбирачі по файлах, шарах і модулях.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <string_view>

int main() {
    std::string text = "Content-Type: text/html";
    std::string_view all = text;
    std::size_t colon = all.find(':');
    std::string_view name = all.substr(0, colon);
    std::string_view value = all.substr(colon + 1);
    value.remove_prefix(1);

    std::cout << "[" << name << "] [" << value << "]\n";
    std::cout << "вікно в тому ж буфері: " << (name.data() == text.data() ? "так" : "ні") << "\n";
    std::cout << "довжини: " << name.size() << " і " << value.size() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <string_view>
#include <vector>

std::vector<std::string_view> split(std::string_view text, char sep) {
    std::vector<std::string_view> parts;
    while (true) {
        std::size_t pos = text.find(sep);
        if (pos == std::string_view::npos) {
            parts.push_back(text);
            return parts;
        }
        parts.push_back(text.substr(0, pos));
        text.remove_prefix(pos + 1);
    }
}

std::string_view trim(std::string_view s) {
    while (!s.empty() && s.front() == ' ') {
        s.remove_prefix(1);
    }
    while (!s.empty() && s.back() == ' ') {
        s.remove_suffix(1);
    }
    return s;
}

int main() {
    std::string line = "  один ,два,  три  ,,п'ять";
    for (std::string_view part : split(line, ',')) {
        std::cout << "[" << trim(part) << "]";
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`#include <cstddef>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <vector>

template <typename T>
class Window {
public:
    Window(const T* data, std::size_t size) : data_(data), size_(size) {}
    std::size_t size() const { return size_; }
    const T& operator[](std::size_t i) const { return data_[i]; }
    Window sub(std::size_t from, std::size_t count) const {
        if (from > size_ || count > size_ - from) {
            throw std::out_of_range("вікно виходить за межі");
        }
        return Window(data_ + from, count);
    }

private:
    const T* data_;
    std::size_t size_;
};

int main() {
    std::vector<std::uint8_t> packet = {0xAA, 0x00, 0x03, 'a', 'b', 'c', 0xFF};
    Window<std::uint8_t> all(packet.data(), packet.size());

    std::size_t len = (static_cast<std::size_t>(all[1]) << 8) | all[2];
    Window<std::uint8_t> body = all.sub(3, len);

    std::cout << "довжина тіла: " << body.size() << "\n";
    for (std::size_t i = 0; i < body.size(); ++i) {
        std::cout << static_cast<char>(body[i]);
    }
    std::cout << "\n";
    try {
        all.sub(5, 10);
    } catch (const std::out_of_range& e) {
        std::cout << "помилка: " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <map>
#include <string>
#include <string_view>

struct Request {
    std::string_view method, path, version;
    std::map<std::string_view, std::string_view> headers;
};

std::string_view next_line(std::string_view& rest) {
    std::size_t pos = rest.find("\r\n");
    std::string_view line = rest.substr(0, pos);
    rest.remove_prefix(pos == std::string_view::npos ? rest.size() : pos + 2);
    return line;
}

bool parse(std::string_view text, Request& req) {
    std::string_view line = next_line(text);
    std::size_t a = line.find(' ');
    std::size_t b = line.rfind(' ');
    if (a == std::string_view::npos || a == b) {
        return false;
    }
    req.method = line.substr(0, a);
    req.path = line.substr(a + 1, b - a - 1);
    req.version = line.substr(b + 1);
    while (!text.empty()) {
        std::string_view h = next_line(text);
        if (h.empty()) {
            break;
        }
        std::size_t colon = h.find(':');
        if (colon == std::string_view::npos) {
            return false;
        }
        std::string_view value = h.substr(colon + 1);
        while (!value.empty() && value.front() == ' ') {
            value.remove_prefix(1);
        }
        req.headers[h.substr(0, colon)] = value;
    }
    return true;
}

int main() {
    const std::string text = "GET /a?x=1 HTTP/1.1\r\nHost: example.com\r\nAccept: */*\r\n\r\n";
    Request req;
    if (!parse(text, req)) {
        std::cout << "поганий запит\n";
        return 1;
    }
    std::cout << req.method << "|" << req.path << "|" << req.version << "\n";
    for (const auto& [k, v] : req.headers) {
        std::cout << k << " => " << v << "\n";
    }
    std::cout << "жодної копії рядка: " << (req.path.data() > text.data() ? "так" : "ні") << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: string_view не перетворюється на std::string неявно, потрібне явне std::string(sv)
#include <iostream>
#include <string>
#include <string_view>

int main() {
    std::string_view sv = "привіт";
    std::string copy = sv;
    std::cout << copy << "\n";
    return 0;
}
`,
    ],
    note: "<code>std::string_view</code> це покажчик і довжина без володіння: його створення й <code>substr</code> не копіюють символів. Вікно не повинно пережити оригінал, а в <code>std::string</code> його перетворюють явно.",
    work: "Так працюють швидкі розбирачі HTTP, JSON і логів: на кожен запит не створюються сотні маленьких рядків. Така економія помітна в сервісах із тисячами запитів на секунду, а від копій страждає і швидкість, і пам'ять.",
    tasks: [
      "Чому <code>string_view</code>, повернений із функції, що створила локальну <code>std::string</code>, небезпечний?",
      "Чим вікно на оригінал відрізняється від копії підрядка за вартістю й за відповідальністю?",
    ],
  },
];
