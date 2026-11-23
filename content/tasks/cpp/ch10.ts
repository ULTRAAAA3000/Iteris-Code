// Практичні завдання глави «Формати й протоколи» (уроки 95–100). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_10: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-http-header", lesson: "cpp/95", xp: 30,
    title: "Розбір рядка заголовка",
    context: "Кожен вебсервер розбирає заголовки запиту: ділить рядок по двокрапці, обрізає пробіли й зводить ім'я до нижнього регістру. Помилка тут ламає весь запит.",
    brief: [
      "Допишіть функцію <code>parse_header(line, name, value)</code>. Вона шукає перший <code>':'</code>; якщо його немає, повертає <code>false</code>. Інакше в <code>name</code> кладе ім'я <b>в нижньому регістрі</b> без пробілів по краях, а в <code>value</code> значення, обрізане з обох боків (разом із <code>'\\r'</code>), і повертає <code>true</code>. Функції <code>trim</code> і <code>lower</code> уже є.",
      "Друк у <code>main</code> готовий: для кожного рядка виводиться <code>ім'я=значення</code> або слово <code>відхилено</code>.",
    ],
    starter: raw`#include <cctype>
#include <iostream>
#include <string>
#include <vector>

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

bool parse_header(const std::string& line, std::string& name, std::string& value) {
    // TODO: знайдіть ':' (npos означає «немає» і повертайте false)
    // TODO: name = lower(trim(частина до ':')), value = trim(частина після ':')
    (void)line; (void)name; (void)value;
    return false;
}

int main() {
    std::vector<std::string> lines = {
        "Host: Example.com\r",
        "X-Token:   abc123  \r",
        "ACCEPT:*/*",
        "це не заголовок",
    };
    for (const std::string& line : lines) {
        std::string name, value;
        if (parse_header(line, name, value)) {
            std::cout << name << "=" << value << "\n";
        } else {
            std::cout << "відхилено\n";
        }
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "host=Example.com\nx-token=abc123\naccept=*/*\nвідхилено", hint: "Імена в нижньому регістрі, значення без пробілів і без '\\r'; рядок без двокрапки відхиляється." },
      { on: "stdout", name: "Ім'я зведено до нижнього регістру", has: "accept=*/*", hint: "ACCEPT має стати accept: застосуйте lower до імені." },
      { on: "stdout", name: "Значення обрізано", has: "x-token=abc123", hint: "Пробіли навколо значення прибирає trim." },
      { on: "source", name: "Шукається двокрапка", has: "find(':')", hint: "Позицію роздільника дає std::string::find." },
      { on: "source", name: "Перевірено npos", has: "npos", hint: "Коли двокрапки немає, find повертає std::string::npos." },
    ],
  },
  {
    ...base, id: "cpp-url-decode", lesson: "cpp/96", xp: 30,
    title: "Percent-розкодування",
    context: "Значення в query-рядку приходять закодованими: %2B, %20, байти кирилиці. Сервер мусить їх розкодувати й відхилити зіпсований код, а не дати сміття.",
    brief: [
      "Допишіть <code>percent_decode(in, out)</code>. Звичайні символи копіюються, <code>'+'</code> стає пробілом, а <code>%XX</code> (дві шістнадцяткові цифри) стає одним байтом. Якщо після <code>%</code> немає двох шістнадцяткових цифр, функція повертає <code>false</code>.",
      "Допоміжна <code>hex_val</code> уже є: вона повертає значення цифри 0–15 або -1. Друк у <code>main</code> готовий.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <vector>

int hex_val(char c) {
    if (c >= '0' && c <= '9') {
        return c - '0';
    }
    if (c >= 'a' && c <= 'f') {
        return c - 'a' + 10;
    }
    if (c >= 'A' && c <= 'F') {
        return c - 'A' + 10;
    }
    return -1;
}

bool percent_decode(const std::string& in, std::string& out) {
    out.clear();
    // TODO: пройдіть по in; '+' -> ' '; '%' + дві hex-цифри -> один байт; інакше копіюйте символ
    // TODO: якщо після '%' бракує двох hex-цифр, поверніть false
    (void)in;
    return true;
}

int main() {
    std::vector<std::string> inputs = {"c%2B%2B", "a+b%20c", "%D0%9E%D0%BB%D1%8F", "100%", "x%zzy"};
    for (const std::string& in : inputs) {
        std::string out;
        if (percent_decode(in, out)) {
            std::cout << in << " => " << out << "\n";
        } else {
            std::cout << in << " => помилка\n";
        }
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "c%2B%2B => c++\na+b%20c => a b c\n%D0%9E%D0%BB%D1%8F => Оля\n100% => помилка\nx%zzy => помилка", hint: "Розкодуйте плюс, %20 і два байти UTF-8 для кожної літери; обірваний чи нешістнадцятковий код це помилка." },
      { on: "stdout", name: "%2B дало плюс", has: "c%2B%2B => c++", hint: "%2B це байт 0x2B, тобто символ '+'. Його не можна знову перетворювати на пробіл." },
      { on: "stdout", name: "Кирилицю зібрано з байтів", has: "=> Оля", hint: "Кожен %XX дає один байт; два байти разом утворюють літеру UTF-8." },
      { on: "stdout", name: "Обірваний код відхилено", has: "100% => помилка", hint: "Після % потрібні рівно дві цифри: перевірте, чи вони є, перш ніж їх читати." },
      { on: "source", name: "Використано hex_val", has: "hex_val(", hint: "Для кожної з двох цифр викличте hex_val і перевірте, що результат не від'ємний." },
    ],
  },
  {
    ...base, id: "cpp-json-escape", lesson: "cpp/97", xp: 30,
    title: "Екранування рядка для JSON",
    context: "Неекрановані лапки в значенні ламають чужий парсер, а іноді відкривають шлях до підміни полів. Тому екранування пишуть один раз і викликають для кожного рядка.",
    brief: [
      "Допишіть <code>escape(s)</code>: лапку замініть на <code>\\\"</code>, зворотний слеш на <code>\\\\</code>, перевід рядка на <code>\\n</code>, табуляцію на <code>\\t</code>. Решту символів, зокрема UTF-8, лишайте без змін.",
      "Збирання об'єкта в <code>main</code> готове (коми ставляться через прапорець). Програма має надрукувати один рядок JSON.",
    ],
    starter: raw`#include <iostream>
#include <string>

std::string escape(const std::string& s) {
    std::string out;
    for (char c : s) {
        // TODO: '"' -> \", '\\' -> \\, '\n' -> \n, '\t' -> \t, інші символи без змін
        out += c;
    }
    return out;
}

std::string quote(const std::string& s) {
    return "\"" + escape(s) + "\"";
}

int main() {
    std::string json = "{";
    json += quote("name") + ":" + quote("Оля \"Кіт\"");
    json += "," + quote("path") + ":" + quote("C:\\temp");
    json += "," + quote("note") + ":" + quote("рядок1\nрядок2\tкінець");
    json += "," + quote("age") + ":" + std::to_string(30);
    json += "}";
    std::cout << json << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "{\"name\":\"Оля \\\"Кіт\\\"\",\"path\":\"C:\\\\temp\",\"note\":\"рядок1\\nрядок2\\tкінець\",\"age\":30}", hint: "Лапки, слеш, перевід рядка й табуляція мають бути записані двосимвольними послідовностями." },
      { on: "stdout", name: "Лапки екрановано", has: "\\\"Кіт\\\"", hint: "Перед кожною лапкою всередині рядка має стояти зворотний слеш." },
      { on: "stdout", name: "Слеш подвоєно", has: "C:\\\\temp", hint: "Один зворотний слеш у даних записується як два." },
      { on: "stdout", name: "Перевід рядка записано як \\n", has: "рядок1\\nрядок2", hint: "У виводі має бути не справжній перевід рядка, а два символи: слеш і n." },
      { on: "source", name: "Є розгалуження за символом", matches: "switch|case|if\\s*\\(", hint: "Обробіть кожен спецсимвол окремою гілкою switch або if." },
    ],
  },
  {
    ...base, id: "cpp-endian-bytes", lesson: "cpp/98", xp: 30,
    title: "Кодування чисел у байти",
    context: "У бінарних протоколах число записують байтами в узгодженому порядку. Зсуви й маски дають однаковий результат на будь-якому процесорі, а приведення типів захищає від помилок знака.",
    brief: [
      "Допишіть чотири функції: <code>put_u32_be</code> і <code>put_u32_le</code> (дописують у вектор чотири байти числа в big-endian і little-endian), <code>get_u32_le</code> (збирає число з чотирьох байтів у little-endian) та <code>put_i16_be</code> (два байти числа зі знаком, big-endian). Використовуйте зсуви й маски, не копіювання пам'яті.",
      "Для <code>std::int16_t</code> зі значенням -2 очікується <code>ff fe</code>. Функція <code>show</code> і друк уже є.",
    ],
    starter: raw`#include <cstdint>
#include <iomanip>
#include <iostream>
#include <vector>

using Bytes = std::vector<std::uint8_t>;

void put_u32_be(Bytes& out, std::uint32_t v) {
    // TODO: старший байт першим
    (void)out; (void)v;
}

void put_u32_le(Bytes& out, std::uint32_t v) {
    // TODO: молодший байт першим
    (void)out; (void)v;
}

std::uint32_t get_u32_le(const Bytes& in, std::size_t pos) {
    // TODO: зберіть число; кожен байт спершу приведіть до std::uint32_t
    (void)in; (void)pos;
    return 0;
}

void put_i16_be(Bytes& out, std::int16_t v) {
    // TODO: перетворіть на std::uint16_t і запишіть два байти
    (void)out; (void)v;
}

void show(const char* name, const Bytes& b) {
    std::cout << name << ":";
    for (std::uint8_t x : b) {
        std::cout << " " << std::hex << std::setw(2) << std::setfill('0') << static_cast<unsigned>(x);
    }
    std::cout << std::dec << "\n";
}

int main() {
    Bytes be, le, neg;
    put_u32_be(be, 0x12345678);
    put_u32_le(le, 0x12345678);
    put_i16_be(neg, -2);
    show("be", be);
    show("le", le);
    show("i16", neg);
    if (be.size() == 4) {
        std::cout << "LE з BE-байтів: " << std::hex << get_u32_le(be, 0) << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "be: 12 34 56 78\nle: 78 56 34 12\ni16: ff fe\nLE з BE-байтів: 78563412", hint: "Big-endian починається зі старшого байта 12, little-endian з молодшого 78; -2 у два байти це ff fe." },
      { on: "stdout", name: "Big-endian", has: "be: 12 34 56 78", hint: "Зсуви на 24, 16, 8 і 0 розрядів, по порядку." },
      { on: "stdout", name: "Little-endian", has: "le: 78 56 34 12", hint: "Той самий набір зсувів, але в зворотному порядку." },
      { on: "stdout", name: "Число зі знаком", has: "i16: ff fe", hint: "Спершу static_cast<std::uint16_t>(v), потім розкладіть на два байти." },
      { on: "source", name: "Використано зсув і маску", matches: ">>[\\s\\S]*0xFF|0xFF[\\s\\S]*>>", hint: "Байт номер k це (v >> (8 * k)) & 0xFF." },
    ],
  },
  {
    ...base, id: "cpp-fsm-pairs", lesson: "cpp/99", xp: 40,
    title: "Автомат для пар ключ=значення",
    context: "Дані з мережі приходять шматками, тому розбирач має вміти зупинитися будь-де. Автомат зберігає стан між шматками, і результат не залежить від того, де розрізали вхід.",
    brief: [
      "Розбирач читає потік виду <code>a=1;name=Ola;x=;</code>. У стані <code>Key</code> символи накопичуються в ключ, <code>'='</code> переводить у <code>Value</code>; у стані <code>Value</code> символи йдуть у значення, а <code>';'</code> зберігає пару й повертає в <code>Key</code>. Допишіть <code>switch</code> у методі <code>step</code>.",
      "<code>main</code> подає той самий вхід двома способами: цілим і шматками по два символи. Вивід має бути однаковим, друк готовий.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <utility>
#include <vector>

enum class State { Key, Value };

class PairParser {
public:
    void feed(const std::string& chunk) {
        for (char c : chunk) {
            step(c);
        }
    }
    const std::vector<std::pair<std::string, std::string>>& pairs() const { return pairs_; }

private:
    void step(char c) {
        switch (st_) {
        case State::Key:
            // TODO: '=' -> st_ = State::Value; інакше key_ += c
            (void)c;
            break;
        case State::Value:
            // TODO: ';' -> зберегти пару (key_, value_), очистити обидва, st_ = State::Key; інакше value_ += c
            break;
        }
    }

    State st_ = State::Key;
    std::string key_, value_;
    std::vector<std::pair<std::string, std::string>> pairs_;
};

std::string dump(const PairParser& p) {
    std::string out;
    for (const auto& [k, v] : p.pairs()) {
        out += k + "=[" + v + "]\n";
    }
    return out;
}

int main() {
    const std::string input = "a=1;name=Ola;x=;";
    PairParser whole;
    whole.feed(input);

    PairParser pieces;
    for (std::size_t i = 0; i < input.size(); i += 2) {
        pieces.feed(input.substr(i, 2));
    }

    std::cout << dump(whole);
    std::cout << "пар: " << whole.pairs().size() << "\n";
    std::cout << "однаково: " << (dump(whole) == dump(pieces) ? "так" : "ні") << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "a=[1]\nname=[Ola]\nx=[]\nпар: 3\nоднаково: так", hint: "Три пари, остання з порожнім значенням; шматки по два символи мають давати той самий результат." },
      { on: "stdout", name: "Знайдено три пари", has: "пар: 3", hint: "Пару зберігайте на ';' у стані Value, навіть якщо значення порожнє." },
      { on: "stdout", name: "Шматки дають той самий результат", has: "однаково: так", hint: "Стан і буфери живуть у класі між викликами feed, тому нічого не скидайте на початку feed." },
      { on: "stdout", name: "Значення Ola", has: "name=[Ola]", hint: "Після '=' символи йдуть у значення, поки не зустрінеться ';'." },
      { on: "source", name: "Перехід між станами", has: "st_ = State::Value", hint: "Після '=' у стані Key змініть st_ на State::Value." },
    ],
  },
  {
    ...base, id: "cpp-view-split", lesson: "cpp/100", xp: 40,
    title: "Розбиття без копіювання",
    context: "Швидкі розбирачі не створюють копій підрядків, а повертають вікна на вхідний буфер. Так обробляють тисячі запитів на секунду без зайвих виділень пам'яті.",
    brief: [
      "Допишіть <code>trim(sv)</code> (обрізає пробіли з обох боків через <code>remove_prefix</code> і <code>remove_suffix</code>) та <code>split(text, sep)</code>, що повертає <code>std::vector&lt;std::string_view&gt;</code> усіх частин між роздільниками. Жодних <code>std::string</code> усередині: лише вікна на оригінал.",
      "Друк у <code>main</code> готовий. Він також перевіряє, що перше вікно справді вказує всередину вихідного рядка.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <string_view>
#include <vector>

std::string_view trim(std::string_view s) {
    // TODO: приберіть пробіли спереду (remove_prefix) і ззаду (remove_suffix)
    return s;
}

std::vector<std::string_view> split(std::string_view text, char sep) {
    std::vector<std::string_view> parts;
    // TODO: знаходьте sep через find, додавайте text.substr(0, pos), відрізайте remove_prefix(pos + 1)
    // TODO: останню частину (після останнього sep) теж додайте
    (void)text; (void)sep;
    return parts;
}

int main() {
    std::string line = "alpha, beta ,gamma";
    std::vector<std::string_view> parts = split(line, ',');
    for (std::string_view p : parts) {
        std::cout << "[" << trim(p) << "]";
    }
    std::cout << "\n";
    std::cout << "частин: " << parts.size() << "\n";
    bool inside = !parts.empty() && parts[0].data() == line.data();
    std::cout << "у тому ж буфері: " << (inside ? "так" : "ні") << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[alpha][beta][gamma]\nчастин: 3\nу тому ж буфері: так", hint: "Три частини без пробілів по краях; перше вікно починається в тому ж місці, що й рядок." },
      { on: "stdout", name: "Обрізано пробіли", has: "[alpha][beta][gamma]", hint: "Пробіли прибирає trim: спереду remove_prefix, ззаду remove_suffix." },
      { on: "stdout", name: "Остання частина додана", has: "частин: 3", hint: "Після циклу ще лишається текст після останнього роздільника, додайте його." },
      { on: "source", name: "Вікна без копій", has: "remove_prefix", hint: "Відрізайте прочитане від початку вікна викликом remove_prefix." },
      { on: "source", name: "Немає створення std::string у split", matches: "^(?![\\s\\S]*std::string\\()[\\s\\S]*$", hint: "Тримайте лише string_view: конструктор std::string тут копіював би символи." },
    ],
  },
];
