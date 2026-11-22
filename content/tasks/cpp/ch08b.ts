// Практичні завдання глави «Стандартна бібліотека», частина b (уроки 85–89). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08b: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-regex-dates", lesson: "cpp/85", xp: 30,
    title: "Дати з тексту: regex_search і групи",
    context: "Логи, листи й конфігурації містять дати в довільних місцях. Регулярний вираз із групами витягує їх, а потім їх легко переписати в інший формат.",
    brief: [
      "У <code>main</code> є текст із трьома датами формату <code>РРРР-ММ-ДД</code> і однією некоректною (<code>2026-1-5</code>). Складіть шаблон із <b>трьома групами</b> (рік, місяць, день) і пройдіть по всіх збігах через <code>std::sregex_iterator</code>, друкуючи кожну дату як <code>ДД.ММ.РРРР</code>.",
      "Решту вже написано: рядок із <code>regex_replace</code> замінює кожну дату на рік у кутових дужках. Очікуваний вивід: три дати по одній у рядку, потім заміна.",
    ],
    starter: raw`#include <iostream>
#include <regex>
#include <string>

int main() {
    std::string text = "start 2026-11-22, end 2027-01-05, bad 2026-1-5, last 1999-12-31";
    // TODO: шаблон з трьома групами: рік, місяць, день
    std::regex date(R"(TODO)");
    for (std::sregex_iterator it(text.begin(), text.end(), date), end; it != end; ++it) {
        std::cout << it->str(3) << "." << it->str(2) << "." << it->str(1) << "\n";
    }
    std::cout << std::regex_replace(text, date, "<$1>") << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Знайдено першу дату", has: "22.11.2026", hint: "Шаблон має збігатися з чотирма цифрами, дефісом, двома цифрами, дефісом і двома цифрами; кожну частину візьміть у дужки." },
      { on: "stdout", name: "Некоректна дата пропущена", matches: "^(?![\\s\\S]*2026\\.5\\.1)[\\s\\S]*$", hint: "Квантифікатор {2} вимагає рівно дві цифри, тож «2026-1-5» не збігається." },
      { on: "stdout", name: "Заміна працює", has: "start <2026>", hint: "Після дат з'являється рядок із замінами: групи нумеруються з одиниці." },
      { on: "stdout", name: "Повний вивід збігається", equals: "22.11.2026\n05.01.2027\n31.12.1999\nstart <2026>, end <2027>, bad 2026-1-5, last <1999>", hint: "Три дати з крапками, а далі один рядок із заміною." },
      { on: "source", name: "Використано sregex_iterator", matches: "sregex_iterator", hint: "Обхід усіх збігів виконує sregex_iterator." },
    ],
  },
  {
    ...base, id: "cpp-bitset-perms", lesson: "cpp/86", xp: 30,
    title: "Права доступу: прапорці в одному числі",
    context: "Права файлів, опції драйверів і мережеві прапорці зберігають у одному числі. Масками вмикають, вимикають і перевіряють окремі біти, не чіпаючи решти.",
    brief: [
      "Реалізуйте чотири функції для прав у беззнаковому числі: <code>grant</code> вмикає біти маски, <code>revoke</code> вимикає, <code>toggle</code> перемикає, <code>has</code> перевіряє, що хоч один біт маски ввімкнений. Використовуйте <code>|</code>, <code>&amp; ~</code>, <code>^</code> і <code>&amp;</code>.",
      "Вивід <code>main</code> уже готовий: двійкові значення через <code>std::bitset&lt;3&gt;</code>, відповіді про <code>exec</code> і <code>write</code> та кількість ввімкнених бітів.",
    ],
    starter: raw`#include <bitset>
#include <iostream>

const unsigned READ = 1u << 0;
const unsigned WRITE = 1u << 1;
const unsigned EXEC = 1u << 2;

unsigned grant(unsigned perms, unsigned mask) {
    (void)mask;
    // TODO: увімкніть біти маски
    return perms;
}
unsigned revoke(unsigned perms, unsigned mask) {
    (void)mask;
    // TODO: вимкніть біти маски
    return perms;
}
unsigned toggle(unsigned perms, unsigned mask) {
    (void)mask;
    // TODO: перемкніть біти маски
    return perms;
}
bool has(unsigned perms, unsigned mask) {
    (void)mask;
    // TODO: перевірте, що хоч один біт маски увімкнений
    return false;
}

int main() {
    unsigned perms = 0;
    perms = grant(perms, READ | WRITE);
    std::cout << std::bitset<3>(perms) << "\n";
    perms = revoke(perms, WRITE);
    perms = toggle(perms, EXEC);
    std::cout << std::bitset<3>(perms) << "\n";
    std::cout << "exec: " << (has(perms, EXEC) ? "yes" : "no") << "\n";
    std::cout << "write: " << (has(perms, WRITE) ? "yes" : "no") << "\n";
    std::cout << "set: " << std::bitset<3>(perms).count() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Після grant прапори 011", has: "011", hint: "Увімкнення це побітове АБО зі значенням маски." },
      { on: "stdout", name: "Після revoke і toggle прапори 101", has: "101", hint: "Вимкнути біти: &amp; з інвертованою маскою; перемкнути: XOR." },
      { on: "stdout", name: "Перевірка has працює", has: "exec: yes", hint: "Перевірка біта це (perms &amp; mask) != 0." },
      { on: "stdout", name: "Повний вивід збігається", equals: "011\n101\nexec: yes\nwrite: no\nset: 2", hint: "П'ять рядків: два двійкові числа, exec, write і кількість встановлених бітів." },
      { on: "source", name: "Є побітові операції", matches: "\\^", hint: "Для перемикання потрібен XOR." },
    ],
  },
  {
    ...base, id: "cpp-ranges-squares", lesson: "cpp/87", xp: 35,
    title: "Конвеєр без views: copy_if, transform, accumulate",
    context: "У C++20 такий конвеєр пишуть через views, а в C++17 виражають алгоритмами STL. Це та сама ідея «відфільтруй, перетвори, підсумуй» у стандарті, що доступний скрізь.",
    brief: [
      "Вектор <code>v</code> містить числа від 1 до 20. Допишіть конвеєр у стилі C++17: скопіюйте парні числа в <code>even</code> через <code>copy_if</code>, запишіть їхні квадрати в <code>squares</code> через <code>transform</code>, залиште перші три і підсумуйте їх через <code>accumulate</code>.",
      "Очікуваний вивід: <code>4 16 36</code>, а наступним рядком <code>sum: 56</code>.",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v(20);
    std::iota(v.begin(), v.end(), 1);

    std::vector<int> even;
    // TODO: скопіюйте парні числа з v у even (copy_if)

    std::vector<int> squares(even.size());
    // TODO: запишіть у squares квадрати чисел з even (transform)
    // TODO: залиште лише перші три квадрати (resize)

    for (std::size_t i = 0; i < squares.size(); ++i) {
        if (i > 0) {
            std::cout << " ";
        }
        std::cout << squares[i];
    }
    std::cout << "\n";
    std::cout << "sum: " << 0 /* TODO: сума через accumulate */ << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Перші три парні квадрати", has: "4 16 36", hint: "Парні числа 2, 4, 6: їхні квадрати 4, 16, 36." },
      { on: "stdout", name: "Сума дорівнює 56", has: "sum: 56", hint: "Сума 4 + 16 + 36; скористайтеся std::accumulate." },
      { on: "stdout", name: "Повний вивід збігається", equals: "4 16 36\nsum: 56", hint: "Два рядки: числа через пробіл, потім сума." },
      { on: "source", name: "Використано copy_if", has: "copy_if", hint: "Парні елементи відбирає алгоритм copy_if." },
      { on: "source", name: "Використано transform", has: "transform", hint: "Квадрати рахує алгоритм transform." },
    ],
  },
  {
    ...base, id: "cpp-format-table", lesson: "cpp/88", xp: 35,
    title: "Таблиця цін: ostringstream замість std::format",
    context: "У C++17 немає std::format, тому вирівняні рядки таблиць збирають через потік рядка. Одна функція форматування дозволяє потім замінити її тіло, коли стандарт зросте.",
    brief: [
      "Допишіть функцію <code>row</code>: ім'я вирівняйте <b>вліво</b> в полі шириною 8, ціну <b>вправо</b> в полі шириною 8 із двома знаками після коми (<code>std::left</code>, <code>std::right</code>, <code>std::setw</code>, <code>std::fixed</code>, <code>std::setprecision</code>).",
      "Очікуваний вивід: три рядки в квадратних дужках, наприклад <code>[tea         3.50]</code> (ширина полів 8 + 8 = 16 символів між дужками).",
    ],
    starter: raw`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

std::string row(const std::string& name, double price) {
    std::ostringstream out;
    // TODO: ім'я зліва в полі 8, ціна справа в полі 8 з двома знаками після коми
    out << name << price;
    return out.str();
}

int main() {
    std::cout << "[" << row("tea", 3.5) << "]\n";
    std::cout << "[" << row("cake", 12.5) << "]\n";
    std::cout << "[" << row("total", 1234.75) << "]\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Ціна має два знаки після коми", has: "3.50", hint: "Без fixed і setprecision(2) число друкується інакше." },
      { on: "stdout", name: "Ціна вирівняна вправо", has: "1234.75]", hint: "Поле ціни має ширину 8, тож цифри притиснуті до правої дужки." },
      { on: "stdout", name: "Ім'я вирівняне вліво", has: "[tea ", hint: "Після імені мають іти пробіли до кінця поля." },
      { on: "stdout", name: "Повний вивід збігається", equals: "[tea         3.50]\n[cake       12.50]\n[total    1234.75]", hint: "Три рядки, у кожному 16 символів між дужками." },
      { on: "source", name: "Використано setw", has: "setw", hint: "Ширину поля задає std::setw." },
    ],
  },
  {
    ...base, id: "cpp-utf8-bytes", lesson: "cpp/89", xp: 40,
    title: "Байти й символи: звіт про рядок у UTF-8",
    context: "Помилки з кирилицею й емодзі починаються з плутанини байтів і символів. Перевірка байтів не залежить від термінала, тому це надійний спосіб налагодження.",
    brief: [
      "Допишіть умову в <code>countCodePoints</code>: рахуйте лише байти, що <b>не є продовженням</b> UTF-8, тобто такі, у яких старші два біти не дорівнюють <code>10</code> (<code>(c &amp; 0xC0) != 0x80</code>).",
      "<code>report</code> друкує кількість байтів, символів і самі байти в шістнадцятковому вигляді. Очікуваний вивід: три рядки для «abc», «Їжак» і «a-Ї».",
    ],
    starter: raw`#include <iomanip>
#include <iostream>
#include <string>

std::size_t countCodePoints(const std::string& s) {
    std::size_t n = 0;
    for (unsigned char c : s) {
        (void)c;
        if (true /* TODO: байт не є продовженням (10xxxxxx) */) {
            ++n;
        }
    }
    return n;
}

void report(const std::string& s) {
    std::cout << "bytes=" << s.size() << " chars=" << countCodePoints(s) << " hex:";
    for (unsigned char c : s) {
        std::cout << " " << std::hex << std::uppercase << std::setw(2) << std::setfill('0')
                  << static_cast<int>(c);
    }
    std::cout << std::dec << "\n";
}

int main() {
    report("abc");
    report("Їжак");
    report("a-Ї");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "ASCII: байтів стільки ж, скільки символів", has: "bytes=3 chars=3", hint: "Для латиниці кожен байт це початок символу." },
      { on: "stdout", name: "Їжак: 8 байтів і 4 символи", has: "bytes=8 chars=4", hint: "Кожна кирилична літера це два байти, але лише один не є продовженням." },
      { on: "stdout", name: "Байти Ї виглядають як D0 87", has: "D0 87", hint: "Байти друкуються через unsigned char." },
      { on: "stdout", name: "Повний вивід збігається", equals: "bytes=3 chars=3 hex: 61 62 63\nbytes=8 chars=4 hex: D0 87 D0 B6 D0 B0 D0 BA\nbytes=4 chars=3 hex: 61 2D D0 87", hint: "Три рядки у форматі «bytes=.. chars=.. hex: ..»." },
      { on: "source", name: "Є маска 0xC0", has: "0xC0", hint: "Старші два біти виділяє маска 0xC0." },
    ],
  },
];
