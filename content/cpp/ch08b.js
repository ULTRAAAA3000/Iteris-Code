export const LESSONS_08b = [
  {
    t: "regex: регулярні вирази",
    ch: "Стандартна бібліотека",
    easy: "Регулярний вираз це трафарет для тексту: ви вирізаєте в картоні віконце потрібної форми й прикладаєте до рядка. Де слова пролізли крізь віконце, там збіг; де ні, там ні.",
    p: [
      "Рядкові функції з попередніх уроків шукають <i>точний</i> підрядок: <code>find(\"abc\")</code> знайде саме «abc». Але реальні задачі складніші: знайти всі числа, перевірити, що рядок схожий на дату, витягти ім'я та значення з рядка конфігурації. Для цього існують <b>регулярні вирази</b>: короткий запис <i>шаблону</i>, який описує цілу родину рядків. У C++ вони живуть у заголовку <code>&lt;regex&gt;</code>, а головний тип це <code>std::regex</code>.",
      "Модель у голові така: шаблон складається зі звичайних символів (вони збігаються самі із собою) і спеціальних. Клас <code>[0-9]</code> означає «одна цифра», <code>\\d</code> теж цифра, <code>\\w</code> літера, цифра чи підкреслення, <code>.</code> будь-який символ. Квантифікатори кажуть «скільки разів»: <code>+</code> один чи більше, <code>*</code> нуль чи більше, <code>?</code> нуль або один, <code>{4}</code> рівно чотири. Круглі дужки створюють <b>групу</b>, яку можна витягти окремо. Зручно писати шаблон у сирому рядку <code>R\"(...)\"</code>, щоб не подвоювати зворотні скісні риски.",
      "Є три головні операції. <code>std::regex_match(рядок, шаблон)</code> питає: чи шаблону відповідає <i>весь</i> рядок цілком? <code>std::regex_search</code> питає: чи є <i>десь усередині</i> рядка місце, що відповідає шаблону? <code>std::regex_replace</code> повертає новий рядок, де всі збіги замінено на заданий текст. Різницю між match і search плутають найчастіше: рядок «20x6» не відповідає шаблону <code>[0-9]+</code> цілком, але search знайде в ньому «20».",
      "Щоб дізнатися, що саме збіглося, передайте у <code>regex_search</code> об'єкт <code>std::smatch</code> (для <code>std::string</code>). Тоді <code>m[0]</code> це весь збіг, <code>m[1]</code> перша група, <code>m[2]</code> друга й так далі, а <code>m.str(1)</code> повертає групу як рядок. Щоб пройти по <i>всіх</i> збігах, використовують <code>std::sregex_iterator</code>: пара ітераторів «початок» і «кінець», як у контейнерів. У заміні групи позначаються як <code>$1</code>, <code>$2</code>, а <code>$&amp;</code> це весь збіг.",
      "Перша пастка: шаблон розбирається під час виконання, і некоректний шаблон (наприклад, з незакритою дужкою) кидає виняток <code>std::regex_error</code>. Ловіть його, якщо шаблон приходить ззовні. Друга пастка: створення <code>std::regex</code> дороге, тож не конструюйте його всередині гарячого циклу, а виносьте перед циклом. Третя: ECMAScript-синтаксис за замовчуванням не знає всього, що є в інших мовах, а сама реалізація повільна, тому для величезних обсягів тексту часто пишуть розбір вручну.",
      "Ідіоми прості: сирий рядок для шаблону, один об'єкт <code>regex</code> на кілька використань, <code>regex_match</code> для валідації вводу, <code>regex_search</code> з групами для вибірки полів, а <code>sregex_iterator</code> для «знайди все». Якщо шаблон довгий, розбийте його на іменовані константи й додайте коментар до кожної групи. А якщо задачу легко розв'язати <code>find</code> і <code>substr</code>, то регулярний вираз зайвий: він складніший для читання.",
      "Отже, регулярний вираз описує форму тексту, а match, search і replace відповідають на три різні питання про нього. Наступний урок про інший вид «малих» даних: біти. Там ми навчимося пакувати прапорці в одне число й користуватися <code>std::bitset</code>.",
    ],
    code: [
      String.raw`#include <iostream>
#include <regex>
#include <string>

void check(const std::string& s, const std::regex& re) {
    std::cout << s << ": " << (std::regex_match(s, re) ? "увесь збігся" : "не збігся") << "\n";
}

int main() {
    std::regex digits("[0-9]+");
    check("2026", digits);
    check("20x6", digits);

    std::string s = "20x6";
    std::cout << "search знайшов у 20x6: " << (std::regex_search(s, digits) ? "так" : "ні") << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <regex>
#include <string>

int main() {
    std::regex date(R"((\d{4})-(\d{2})-(\d{2}))");
    std::string text = "release 2026-11-22 is ready";
    std::smatch m;

    if (std::regex_search(text, m, date)) {
        std::cout << "збіг: " << m[0] << "\n";
        std::cout << "рік: " << m.str(1) << "\n";
        std::cout << "місяць: " << m.str(2) << "\n";
        std::cout << "день: " << m.str(3) << "\n";
        std::cout << "до: [" << m.prefix() << "]\n";
        std::cout << "після: [" << m.suffix() << "]\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <regex>
#include <string>

int main() {
    std::string s = "a1 b22 c333";
    std::regex num("[0-9]+");

    for (std::sregex_iterator it(s.begin(), s.end(), num), end; it != end; ++it) {
        std::cout << "число " << it->str() << "\n";
    }

    std::cout << std::regex_replace(s, num, "#") << "\n";

    std::regex pair("([a-z])([0-9]+)");
    std::cout << std::regex_replace(s, pair, "$2$1") << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <map>
#include <regex>
#include <sstream>
#include <string>

int main() {
    std::istringstream config("host = example.org\nport=8080\n# коментар\n  mode =  fast  \n");
    std::regex line(R"(^\s*(\w+)\s*=\s*(.*?)\s*$)");
    std::map<std::string, std::string> settings;

    std::string row;
    while (std::getline(config, row)) {
        std::smatch m;
        if (std::regex_match(row, m, line)) {
            settings[m[1]] = m[2];
        }
    }

    for (const auto& [key, value] : settings) {
        std::cout << key << " -> [" << value << "]\n";
    }
    return 0;
}
`,
      String.raw`// аварія: некоректний шаблон кидає std::regex_error, який ніхто не ловить
#include <iostream>
#include <regex>

int main() {
    std::cout << "компілюємо шаблон" << std::endl;
    std::regex bad("(abc");
    std::cout << "сюди не дійдемо" << std::endl;
    return 0;
}
`,
    ],
    note: "<code>regex_match</code> вимагає збігу всього рядка, <code>regex_search</code> шукає збіг усередині. Шаблон пишіть у сирому рядку <code>R\"(...)\"</code>, створюйте <code>std::regex</code> один раз поза циклом, а некоректний шаблон ловіть як <code>std::regex_error</code>.",
    work: "Регулярні вирази застосовують для перевірки форматів (дата, телефон, ідентифікатор), розбору рядків логів і конфігурацій, масової заміни в тексті. Але для гарячих шляхів із великими обсягами даних розбір часто пишуть вручну.",
    tasks: [
      "Чим відрізняється <code>std::regex_match</code> від <code>std::regex_search</code>? Що поверне кожна з них для рядка «20x6» і шаблону <code>[0-9]+</code>?",
      "Що станеться, якщо передати у конструктор <code>std::regex</code> шаблон із незакритою круглою дужкою, і як цього уникнути у програмі?",
    ],
  },
  {
    t: "bitset і побітові операції",
    ch: "Стандартна бібліотека",
    easy: "Число це ряд вимикачів на щитку: кожен біт або ввімкнений, або вимкнений. Побітові операції дозволяють клацати окремими вимикачами, не чіпаючи сусідніх, а bitset це готовий щиток із підписами.",
    p: [
      "Кожне ціле число в пам'яті це послідовність <b>бітів</b>: нулів та одиниць. Зазвичай нам байдуже до цього, ми думаємо числами. Але є задачі, де число це набір прапорців: «є право читати», «є право писати», «файл прихований». Пакувати їх у одне число економно, швидко й зручно передавати. Для цього в C++ є побітові операції та клас <code>std::bitset</code> із заголовка <code>&lt;bitset&gt;</code>.",
      "Побітових операцій шість, і вони працюють над кожним бітом окремо. <code>a &amp; b</code> (І) лишає одиницю лише там, де вона є в обох. <code>a | b</code> (АБО) там, де є хоч в одному. <code>a ^ b</code> (виключне АБО) там, де біти різні. <code>~a</code> інвертує всі біти. <code>a &lt;&lt; n</code> зсуває біти вліво на n позицій (це множення на два в степені n), а <code>a &gt;&gt; n</code> вправо. Не плутайте їх із логічними <code>&amp;&amp;</code> та <code>||</code>, які працюють із цілим значенням «істина чи хиба».",
      "Для прапорців діє чотири ідіоми з <b>маскою</b> <code>m = 1u &lt;&lt; k</code> (число з єдиною одиницею на позиції k). Перевірити біт: <code>(x &amp; m) != 0</code>. Увімкнути: <code>x |= m</code>. Вимкнути: <code>x &amp;= ~m</code>. Перемкнути: <code>x ^= m</code>. Пишіть <code>1u</code>, а не <code>1</code>: зсув знакового числа на позицію знакового біта небезпечний, а для беззнакових типів усе визначено чітко.",
      "Клас <code>std::bitset&lt;N&gt;</code> це масив із рівно N бітів, розмір відомий на етапі компіляції. Він вміє <code>set(i)</code>, <code>reset(i)</code>, <code>flip(i)</code>, <code>test(i)</code>, а також <code>count()</code> (скільки одиниць), <code>any()</code>, <code>none()</code>, <code>all()</code>. Його можна створити з рядка нулів та одиниць, перетворити назад через <code>to_string()</code> або <code>to_ulong()</code> і застосовувати до нього ті самі оператори <code>&amp;</code>, <code>|</code>, <code>^</code>, <code>~</code>, <code>&lt;&lt;</code>. Друкується він як рядок бітів, старший зліва.",
      "Пастки. Нумерація бітів іде від нуля з правого (молодшого) краю: <code>bitset&lt;8&gt;(\"00000001\")</code> має встановленим біт 0. Метод <code>test(i)</code> перевіряє межі й кидає <code>std::out_of_range</code>, коли i не менше N, а от <code>b[i]</code> межі <i>не</i> перевіряє, тож вихід за них це невизначена поведінка. Ще одна пастка: зсув на кількість бітів, що дорівнює ширині типу або більша за неї, невизначений, тому <code>x &lt;&lt; 32</code> для 32-бітного числа писати не можна. Нарешті, <code>~</code> на малих типах спершу підвищує їх до <code>int</code>, і результат може мати зайві старші одиниці.",
      "Типові ідіоми: іменовані константи-маски замість «магічних» чисел, <code>bitset</code> для решета простих чисел або множини «є/немає» над невеликим діапазоном, а перебір усіх підмножин через лічильник від нуля до <code>(1u &lt;&lt; n) - 1</code>. Для виводу чисел у шістнадцятковому вигляді вмикайте <code>std::hex</code>, а потім повертайте <code>std::dec</code>.",
      "Отже, біти дають компактні прапорці, а <code>bitset</code> робить роботу з ними безпечнішою й читабельнішою. Далі в главі йдуть три просунуті теми, які спираються на C++20: діапазони й <code>views</code>, форматований вивід <code>std::format</code> і нарешті кодування рядків. Ми покажемо там C++20 фрагментами й дамо запусканий аналог на C++17.",
    ],
    code: [
      String.raw`#include <iostream>

int main() {
    unsigned a = 0b1100;
    unsigned b = 0b1010;

    std::cout << std::hex;
    std::cout << "a & b  = " << (a & b) << "\n";
    std::cout << "a | b  = " << (a | b) << "\n";
    std::cout << "a ^ b  = " << (a ^ b) << "\n";
    std::cout << "~a & 0xF = " << (~a & 0xFu) << "\n";
    std::cout << "a << 2 = " << (a << 2) << "\n";
    std::cout << "a >> 2 = " << (a >> 2) << "\n";
    std::cout << std::dec;
    return 0;
}
`,
      String.raw`#include <iostream>

constexpr unsigned READ = 1u << 0;
constexpr unsigned WRITE = 1u << 1;
constexpr unsigned EXEC = 1u << 2;

void show(unsigned perm) {
    std::cout << (perm & READ ? 'r' : '-') << (perm & WRITE ? 'w' : '-') << (perm & EXEC ? 'x' : '-') << "\n";
}

int main() {
    unsigned perm = READ | WRITE;
    show(perm);
    perm |= EXEC;
    show(perm);
    perm &= ~WRITE;
    show(perm);
    perm ^= READ;
    show(perm);
    return 0;
}
`,
      String.raw`#include <bitset>
#include <iostream>

int main() {
    std::bitset<8> b("00001010");
    std::cout << "старт: " << b << "\n";

    b.set(0);
    b.reset(1);
    b.flip(7);
    std::cout << "після змін: " << b << "\n";
    std::cout << "одиниць: " << b.count() << " з " << b.size() << "\n";
    std::cout << "біт 7 увімкнено: " << (b.test(7) ? "так" : "ні") << "\n";
    std::cout << "число: " << b.to_ulong() << "\n";

    std::bitset<8> mask("11110000");
    std::cout << "b & mask = " << (b & mask) << "\n";
    std::cout << "b << 2   = " << (b << 2) << "\n";
    return 0;
}
`,
      String.raw`#include <bitset>
#include <iostream>

int main() {
    const int N = 50;
    std::bitset<N + 1> prime;
    prime.set();
    prime.reset(0);
    prime.reset(1);

    for (int i = 2; i * i <= N; ++i) {
        if (prime.test(i)) {
            for (int j = i * i; j <= N; j += i) {
                prime.reset(j);
            }
        }
    }

    std::cout << "прості до " << N << " (" << prime.count() << "):";
    for (int i = 0; i <= N; ++i) {
        if (prime.test(i)) {
            std::cout << " " << i;
        }
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`// аварія: test(10) на bitset<8> кидає std::out_of_range
#include <bitset>
#include <iostream>

int main() {
    std::bitset<8> b("00000001");
    std::cout << "біт 0: " << b.test(0) << std::endl;
    std::cout << "біт 10: " << b.test(10) << std::endl;
    return 0;
}
`,
    ],
    note: "Біти: <code>x |= m</code> вмикає, <code>x &amp;= ~m</code> вимикає, <code>x ^= m</code> перемикає, <code>(x &amp; m) != 0</code> перевіряє. Маску пишіть як <code>1u &lt;&lt; k</code>. У <code>bitset</code> метод <code>test(i)</code> перевіряє межі, а <code>b[i]</code> ні.",
    work: "Побітові прапорці зустрічаються у правах доступу, опціях драйверів і мережевих протоколах, а <code>bitset</code> у решетах, множинах малого діапазону й масках станів. Також зсуви та маски потрібні для хешів і двійкових форматів.",
    tasks: [
      "Як увімкнути, вимкнути й перемкнути біт номер k у беззнаковому числі <code>x</code>? Чому маску краще писати як <code>1u &lt;&lt; k</code>, а не <code>1 &lt;&lt; k</code>?",
      "Чим відрізняються <code>b.test(i)</code> і <code>b[i]</code> у <code>std::bitset</code>, коли <code>i</code> виходить за межі розміру?",
    ],
  },
  {
    t: "Діапазони C++20: ranges і views",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Діапазони це конвеєр на заводі: деталі їдуть стрічкою, одна машина відбраковує, друга штампує, і кожна деталь проходить усі етапи по черзі. Складу проміжних напівфабрикатів не потрібно.",
    p: [
      "Алгоритми C++17 приймають пару ітераторів: <code>std::sort(v.begin(), v.end())</code>. Це незручно: легко переплутати контейнери, а ланцюжок «відфільтруй, перетвори, візьми перші п'ять» вимагає проміжних векторів. C++20 додав <b>діапазони</b> (<code>&lt;ranges&gt;</code>): алгоритми, що беруть контейнер цілком, і <b>views</b>, ліниві «вікна» на дані, які можна з'єднувати знаком <code>|</code>.",
      "Модель у голові: <i>view</i> це не копія даних, а рецепт. <code>v | std::views::filter(pred)</code> нічого не обчислює, поки ви не почнете проходити результат. Кожен елемент витягується через увесь конвеєр по одному, а проміжних контейнерів немає. Тому view дешеве й копіюється швидко, але це «посилання з правилом», а не власник даних.",
      "Базові будівельні блоки: <code>std::views::filter</code> залишає елементи за умовою, <code>transform</code> перетворює кожен, <code>take(n)</code> бере перші n, <code>drop(n)</code> пропускає n, <code>reverse</code> іде з кінця, <code>iota(a, b)</code> породжує числа. Версії алгоритмів у просторі <code>std::ranges</code> приймають контейнер напряму: <code>std::ranges::sort(v)</code>. Усе це працює тільки в C++20, тому в нашій пісочниці воно показане фрагментом.",
      "Запускана програма на C++17 робить те саме явно: <code>copy_if</code>, <code>transform</code> і проміжний вектор. Результат однаковий, але видно ціну: кожен етап проходить усі дані й створює контейнер. Різницю в лінощах легко пояснити: щоб узяти перші три парні квадрати з тисячі чисел, конвеєр views зупиниться після трьох знайдених, а варіант із вектором обробить усе. Третій приклад показує цю ідею вручну.",
      "Пастки. Перша: view не володіє даними, тож якщо контейнер зник, view «висить», а звернення до нього це невизначена поведінка; не повертайте view на локальний вектор. Друга: зміна контейнера під час обходу view може його зламати. Третя: у C++17 ні <code>std::ranges</code>, ні <code>views</code> немає, і спроба скористатися ними дає помилку компіляції; стандарт вмикають прапорцем <code>-std=c++20</code>.",
      "Ідіоми: ланцюжок через <code>|</code> читається зліва направо як речення; <code>std::ranges::sort(v)</code> замість пари ітераторів; <code>iota | take</code> для лічильників; у проміжний контейнер результат збирайте лише тоді, коли він справді потрібен надовго. Якщо компілятор не підтримує C++20, ту саму ідею виражають алгоритмами та лямбдами, як у запусканих прикладах.",
      "Отже, діапазони дають конвеєр без проміжних контейнерів, а <code>views</code> лише описують обчислення. Наступний урок про ще один сучасний інструмент C++20: форматований вивід <code>std::format</code>, який замінює громіздкі маніпулятори потоків.",
    ],
    code: [
      String.raw`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{5, 2, 9, 1, 7};
    std::sort(v.begin(), v.end());
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`// фрагмент: C++20, діапазони та views (потрібен -std=c++20)
#include <iostream>
#include <ranges>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3, 4, 5, 6, 7, 8};
    auto result = v
        | std::views::filter([](int x) { return x % 2 == 0; })
        | std::views::transform([](int x) { return x * x; })
        | std::views::take(3);
    for (int x : result) {
        std::cout << x << " ";   // 4 16 36
    }
    std::cout << "\n";
    std::ranges::sort(v);        // без begin() та end()
    return 0;
}
`,
      String.raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3, 4, 5, 6, 7, 8};

    std::vector<int> even;
    std::copy_if(v.begin(), v.end(), std::back_inserter(even),
                 [](int x) { return x % 2 == 0; });

    std::vector<int> squares(even.size());
    std::transform(even.begin(), even.end(), squares.begin(),
                   [](int x) { return x * x; });

    if (squares.size() > 3) {
        squares.resize(3);
    }
    for (int x : squares) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <vector>

// Ліниве «перші n парних квадратів»: зупиняємося одразу, як назбирали n.
std::vector<int> firstEvenSquares(int limit, int n) {
    std::vector<int> out;
    int visited = 0;
    for (int x = 1; x <= limit && static_cast<int>(out.size()) < n; ++x) {
        ++visited;
        if (x % 2 == 0) {
            out.push_back(x * x);
        }
    }
    std::cout << "переглянуто чисел: " << visited << "\n";
    return out;
}

int main() {
    for (int x : firstEvenSquares(1000, 3)) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: у режимі C++17 немає простору імен std::ranges
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{3, 1, 2};
    std::ranges::sort(v);
    std::cout << v[0] << "\n";
    return 0;
}
`,
    ],
    note: "Діапазони C++20: <code>v | views::filter(...) | views::transform(...)</code> будує ліниву стрічку без проміжних контейнерів, а <code>std::ranges::sort(v)</code> не потребує пари ітераторів. У C++17 їх немає: там <code>copy_if</code> і <code>transform</code>.",
    work: "Конвеєри views зручні для обробки потоків записів: відфільтрувати, перетворити, взяти першу сторінку результатів без зайвих копій. У старому коді або на старому компіляторі ту саму логіку пишуть алгоритмами STL і лямбдами.",
    tasks: [
      "Чим view відрізняється від контейнера і чому він дешево копіюється? Коли view стає небезпечним?",
      "Як у C++17 виразити конвеєр «залишити парні, піднести до квадрата»? Яка ціна порівняно з views?",
    ],
  },
  {
    t: "std::format і форматований вивід C++20",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Рядок формату це бланк із пропусками: «Шановний {}, ваш баланс {}». Ви один раз описуєте вигляд, а значення вписуються в пропуски самі, без довгого ланцюга «&lt;&lt;».",
    p: [
      "Потоки <code>cout</code> гнучкі, але форматування ними громіздке: щоб надрукувати число з двома знаками після коми в полі шириною 8, треба <code>setw</code>, <code>setprecision</code>, <code>fixed</code>, а вони ще й «липнуть» до потоку. C++20 додав <code>std::format</code> із заголовка <code>&lt;format&gt;</code>: рядок-шаблон з місцями <code>{}</code> для значень. Це схоже на f-рядки Python чи <code>Printf</code> у Go.",
      "Модель у голові: у шаблоні кожне <code>{}</code> бере наступний аргумент. Після двокрапки йде <b>специфікація</b>: <code>{:&gt;8}</code> вирівняти вправо в ширину 8, <code>{:&lt;8}</code> вліво, <code>{:^8}</code> по центру, <code>{:08.3f}</code> число з трьома знаками й нулями зліва, <code>{:x}</code> шістнадцяткове, <code>{:b}</code> двійкове. Число перед двокрапкою задає номер аргумента: <code>{1} {0}</code>. Літеральні дужки пишуть подвоєними: <code>{{</code> і <code>}}</code>.",
      "Головна перевага: шаблон перевіряється на етапі компіляції. Невідповідність типу чи кількості аргументів це помилка збирання, а не сюрприз у виводі, як із <code>printf</code>. Результат повертається як <code>std::string</code>, тож його можна зберегти, передати далі чи надрукувати через <code>cout</code>. Також є <code>std::format_to</code> для запису в готовий буфер і <code>std::formatted_size</code> для підрахунку довжини.",
      "У нашій пісочниці працює лише C++17, тому <code>std::format</code> показано фрагментом. Аналоги в C++17 це <code>std::ostringstream</code> із маніпуляторами та <code>std::snprintf</code>. Вони дають той самий вигляд, але ціною довшого коду або відсутності перевірки типів. Тому, пишучи для старого стандарту, форматування обгортають в одну функцію, а коли стандарт зростає, замінюють лише її тіло.",
      "Пастки. Перша: маніпулятори потоку (<code>fixed</code>, <code>setprecision</code>) зберігаються в потоці й діють на подальший вивід; у <code>std::format</code> такого немає, і це добре. Друга: <code>snprintf</code> не перевіряє типів, тож <code>%d</code> для <code>double</code> це невизначена поведінка. Третя: у C++17 <code>std::format</code> не існує, і спроба його використати це помилка компіляції.",
      "Ідіоми: один рядок-шаблон замість ланцюга «&lt;&lt;»; специфікація ширини для таблиць; <code>std::format</code> для збирання повідомлень, а <code>cout</code> лише для друку; у C++17 локальний <code>ostringstream</code> всередині функції, щоб маніпулятори зникали разом зі змінною. Для таблиць вирівнюйте ASCII: кирилиця рахується байтами, і ширина «з'їде».",
      "Отже, <code>std::format</code> дає читабельні шаблони з перевіркою на етапі компіляції, а в C++17 його замінюють <code>ostringstream</code> і <code>snprintf</code>. У наступному уроці розберемо, чому рядок із кирилицею має довжину не таку, як здається: це питання кодувань.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

int main() {
    std::string name = "Оля";
    int score = 42;
    std::cout << "Привіт, " << name << "! Рахунок: " << score << "\n";
    return 0;
}
`,
      String.raw`// фрагмент: C++20, std::format (потрібен -std=c++20)
#include <format>
#include <iostream>

int main() {
    std::cout << std::format("{} має {} балів\n", "Оля", 42);
    std::cout << std::format("[{:>8}] [{:<8}] [{:^8}]\n", "r", "l", "c");
    std::cout << std::format("{:08.3f} {:x} {:b}\n", 3.14159, 255, 5);
    std::cout << std::format("{1} {0} {{літерал}}\n", "a", "b");
    return 0;
}
`,
      String.raw`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

std::string money(const std::string& label, double v) {
    std::ostringstream out;
    out << std::left << std::setw(8) << label
        << std::right << std::setw(10) << std::fixed << std::setprecision(2) << v;
    return out.str();
}

int main() {
    std::cout << "[" << money("tea", 3.5) << "]\n";
    std::cout << "[" << money("cake", 12.345) << "]\n";
    std::cout << "[" << money("total", 1234.5) << "]\n";
    return 0;
}
`,
      String.raw`#include <cstdio>
#include <iostream>
#include <string>

int main() {
    char buf[64];
    int n = std::snprintf(buf, sizeof buf, "%05d|%-6s|%6.2f|%x", 42, "ab", 3.14159, 255);
    std::cout << buf << "\n";
    std::cout << "довжина: " << n << "\n";

    std::string name = "item";
    std::snprintf(buf, sizeof buf, "%s-%03d", name.c_str(), 7);
    std::cout << buf << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: у режимі C++17 немає std::format
#include <iostream>
#include <string>

int main() {
    std::string s = std::format("{} + {}", 1, 2);
    std::cout << s << "\n";
    return 0;
}
`,
    ],
    note: "<code>std::format(\"{:&gt;8.2f}\", x)</code> (C++20) вписує значення в <code>{}</code>, а після двокрапки стоїть ширина, вирівнювання й точність. У C++17 його заміняють <code>ostringstream</code> із <code>setw</code> або <code>snprintf</code>.",
    work: "Форматований вивід потрібен для таблиць у терміналі, повідомлень журналу, звітів і текстових протоколів. Шаблонний рядок легше читати та перекладати, а перевірка типів на етапі компіляції ловить помилки до запуску.",
    tasks: [
      "Що означає специфікація <code>{:&gt;8.2f}</code> у <code>std::format</code> і чим вона зручніша за <code>setw</code> та <code>setprecision</code>?",
      "Чим небезпечний <code>snprintf</code> порівняно з <code>std::format</code> і що використовувати в C++17?",
    ],
  },
  {
    t: "UTF-8, wchar_t і кодування рядків",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Рядок це шухляда з комірками-байтами. Латинська літера займає одну комірку, українська дві, емодзі чотири. Тож «довжина» залежить від того, що ви рахуєте: комірки чи те, що бачить людина.",
    p: [
      "Досі ми вважали, що <code>std::string</code> містить «літери». Насправді він містить <b>байти</b>. Поки текст англійський, один символ це один байт, і різниці немає. Але для кирилиці, інших алфавітів і емодзі потрібне кодування, а найпоширеніше це <b>UTF-8</b>: символ (кодова точка Unicode) займає від 1 до 4 байтів. Латиниця це 1 байт, українські літери 2, більшість ієрогліфів 3, емодзі 4.",
      "Модель у голові: у <code>std::string</code> лежать байти, а <code>size()</code> повертає їх кількість. Рядок «Привіт» має шість літер, але <code>size()</code> дорівнює 12. Щоб побачити правду, друкуйте байти як числа через <code>unsigned char</code>: так результат не залежить від налаштувань терміналу чи локалі. Літера «П» це байти 0xD0 0x9F. Перший байт багатобайтового символу починається з бітів <code>11</code>, а наступні («байти продовження») з <code>10</code>.",
      "Звідси проста ідіома підрахунку символів: рахуйте байти, які <i>не</i> є продовженням, тобто для яких <code>(b &amp; 0xC0) != 0x80</code>. Для UTF-8 цього достатньо. Декодувати кодову точку теж нескладно: за першим байтом видно довжину послідовності, з решти біт збирають число. Усе це працює на звичайних побітових операціях із попереднього уроку.",
      "Є ще <code>wchar_t</code> і <code>std::wstring</code>. «Широкий» символ має фіксований розмір, але сам розмір залежить від платформи: 2 байти у Windows і 4 у Linux. Тому <code>wchar_t</code> не розв'язує проблему переносимості, а ще потребує окремих потоків (<code>wcout</code>) і правильної локалі. Для кодових точок надійніше <code>char32_t</code> і <code>std::u32string</code>: один елемент це рівно одна кодова точка. У C++20 додано тип <code>char8_t</code> для літералів UTF-8, його показано у фрагменті.",
      "Пастки. Перша: <code>s.size()</code> і <code>s[i]</code> працюють із байтами, тож «взяти перші три символи» через <code>substr(0, 3)</code> може розрізати українську літеру навпіл і дати некоректний UTF-8. Друга: <code>toupper</code> і <code>sort</code> не знають про Unicode: вони розуміють лише ASCII. Третя: те, як текст виглядає в терміналі, залежить від термінала, а не від програми, тому для перевірки дивіться на байти.",
      "Ідіоми: зберігайте й передавайте текст як UTF-8 у <code>std::string</code>; для підрахунку чи нарізання переходьте до <code>std::u32string</code> або рахуйте не-продовження байти; не змішуйте байти й символи в одному індексі; для коректного порівняння, регістру та сортування беріть бібліотеку на кшталт ICU, бо стандартна вміє це слабко.",
      "Отже, рядок це байти, UTF-8 кодує символ одним-чотирма байтами, а довжина в символах рахується окремо. Це завершує розділ про стандартну бібліотеку. Далі глава про тестування: там ми навчимося перевіряти, що написаний нами код справді працює.",
    ],
    code: [
      String.raw`#include <iomanip>
#include <iostream>
#include <string>

int main() {
    std::string s = "Привіт";
    std::cout << "size = " << s.size() << "\n";
    for (unsigned char c : s) {
        std::cout << std::hex << std::uppercase << std::setw(2) << std::setfill('0')
                  << static_cast<int>(c) << " ";
    }
    std::cout << std::dec << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

// Кількість кодових точок: рахуємо байти, що не є продовженням (10xxxxxx).
std::size_t countCodePoints(const std::string& s) {
    std::size_t n = 0;
    for (unsigned char c : s) {
        if ((c & 0xC0) != 0x80) {
            ++n;
        }
    }
    return n;
}

int main() {
    std::string ascii = "hello";
    std::string ukr = "Привіт";
    std::string mixed = "a Ї b";
    std::cout << ascii << ": " << ascii.size() << " байтів, " << countCodePoints(ascii) << " символів\n";
    std::cout << ukr << ": " << ukr.size() << " байтів, " << countCodePoints(ukr) << " символів\n";
    std::cout << mixed << ": " << mixed.size() << " байтів, " << countCodePoints(mixed) << " символів\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <stdexcept>
#include <string>

// Декодер UTF-8 у кодові точки; кидає виняток на некоректних послідовностях.
std::u32string decode(const std::string& s) {
    std::u32string out;
    std::size_t i = 0;
    while (i < s.size()) {
        unsigned char c = static_cast<unsigned char>(s[i]);
        std::size_t extra = 0;
        char32_t cp = 0;
        if (c < 0x80) { cp = c; }
        else if ((c & 0xE0) == 0xC0) { cp = c & 0x1F; extra = 1; }
        else if ((c & 0xF0) == 0xE0) { cp = c & 0x0F; extra = 2; }
        else if ((c & 0xF8) == 0xF0) { cp = c & 0x07; extra = 3; }
        else { throw std::runtime_error("некоректний початковий байт"); }
        if (i + extra >= s.size() && extra > 0) {
            throw std::runtime_error("обірваний символ");
        }
        for (std::size_t k = 1; k <= extra; ++k) {
            unsigned char t = static_cast<unsigned char>(s[i + k]);
            if ((t & 0xC0) != 0x80) {
                throw std::runtime_error("очікувався байт продовження");
            }
            cp = (cp << 6) | (t & 0x3F);
        }
        out.push_back(cp);
        i += extra + 1;
    }
    return out;
}

int main() {
    std::u32string cps = decode("Привіт");
    std::cout << "довжина u32string: " << cps.size() << "\n";
    for (char32_t cp : cps) {
        std::cout << "U+" << std::hex << static_cast<unsigned long>(cp) << " ";
    }
    std::cout << std::dec << "\n";

    std::wstring w = L"Привіт";
    std::cout << "wstring: " << w.size() << ", перший U+" << std::hex
              << static_cast<unsigned long>(w[0]) << "\n";
    return 0;
}
`,
      String.raw`// фрагмент: C++20, char8_t та літерали u8 (потрібен -std=c++20)
#include <iostream>
#include <string>

int main() {
    std::u8string s = u8"Привіт";   // тип char8_t: окремий від char
    std::cout << s.size() << "\n";  // 12 байтів
    // std::cout << s;              // помилка: потоку char невідомий char8_t
    return 0;
}
`,
      String.raw`// аварія: substr розрізав двобайтову літеру, перевірка кидає виняток
#include <iostream>
#include <stdexcept>
#include <string>

void validate(const std::string& s) {
    std::size_t i = 0;
    while (i < s.size()) {
        unsigned char c = static_cast<unsigned char>(s[i]);
        std::size_t len = c < 0x80 ? 1 : (c & 0xE0) == 0xC0 ? 2 : (c & 0xF0) == 0xE0 ? 3 : 4;
        if (i + len > s.size()) {
            throw std::runtime_error("обірваний UTF-8");
        }
        i += len;
    }
}

int main() {
    std::string s = "Привіт";
    validate(s.substr(0, 4));
    std::cout << "перші 4 байти: добре (2 літери)" << std::endl;
    validate(s.substr(0, 3));
    std::cout << "сюди не дійдемо" << std::endl;
    return 0;
}
`,
    ],
    note: "<code>std::string</code> зберігає байти: у UTF-8 кирилична літера це 2 байти, тож <code>size()</code> не дорівнює числу символів. Рахуйте символи як байти з <code>(b &amp; 0xC0) != 0x80</code>, а байти друкуйте через <code>unsigned char</code>.",
    work: "Кодування видно в іменах користувачів, пошуку по тексту, обрізанні рядків для інтерфейсу й обміні даними між системами. Помилка з байтами та символами ламає кирилицю та емодзі, а перевірка байтів це надійний спосіб налагодження.",
    tasks: [
      "Чому <code>\"Привіт\".size()</code> дорівнює 12, а не 6, і як порахувати справжню кількість символів?",
      "Чому <code>wchar_t</code> не розв'язує проблему кодувань, і який тип надійніший для кодових точок?",
    ],
  },
];
