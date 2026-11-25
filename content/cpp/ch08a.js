export const LESSONS_08a = [
  {
    t: "std::string: пошук, заміна й підрядки",
    ch: "Стандартна бібліотека",
    easy: "Рядок це довга стрічка з літер, а пошук і заміна схожі на роботу з закладками й ножицями: знайти потрібне місце, відрізати шматок або вирізати слово й вклеїти інше замість нього.",
    p: [
      "У главі про основи ви вже складали рядки й дізнавалися їхню довжину. Реальні програми роблять із текстом значно більше: шукають слово в повідомленні, вирізають ім'я з адреси, замінюють шаблон на значення. Для цього <code>std::string</code> має набір методів, і з цього уроку ви вмієте <b>знайти</b>, <b>відрізати</b> і <b>замінити</b> частину рядка без ручних циклів по символах.",
      "Модель у голові проста: рядок це пронумерована послідовність символів, позиції рахуються з нуля. Метод <code>find</code> повертає позицію першого збігу. Якщо збігу немає, він повертає особливе число <code>std::string::npos</code> («не знайдено»). Це не <code>-1</code> у звичному сенсі, а найбільше значення беззнакового типу, тому порівнювати результат треба саме з <code>npos</code>, а не з нулем чи від'ємним числом.",
      "Підрядок вирізає <code>substr(pos, len)</code>: він повертає <i>нову копію</i> шматка, що починається з позиції <code>pos</code> і має довжину не більше <code>len</code>. Якщо <code>len</code> не вказати, візьметься все до кінця. Інші корисні методи: <code>rfind</code> шукає з кінця, <code>find_first_of</code> шукає будь-який із набору символів, <code>starts_with</code> у C++20 є, але в C++17 перевіряють початок через <code>rfind(prefix, 0) == 0</code>.",
      "Змінюють рядок на місці методи <code>replace(pos, len, new)</code> (замінити <code>len</code> символів, що починаються з <code>pos</code>, на новий текст), <code>erase(pos, len)</code> (видалити) та <code>insert(pos, text)</code> (вставити). Усі вони змінюють сам рядок. Щоб замінити <i>всі</i> входження, у циклі шукають наступний збіг, починаючи з місця після попередньої заміни: другий аргумент <code>find</code> задає, з якої позиції шукати.",
      "Перша пастка: забути перевірку на <code>npos</code>. Якщо передати <code>npos</code> у <code>substr</code> або <code>erase</code> як позицію, метод викине виняток <code>std::out_of_range</code>, і необроблений виняток завершить програму. Те саме станеться, якщо позиція більша за довжину рядка. Друга пастка: при заміні всіх входження шукайте далі від кінця вставленого тексту, інакше заміна «а» на «аа» зациклиться, бо щоразу знаходитиме щойно вставлене.",
      "Ідіома для всіх цих випадків однакова: <code>auto pos = s.find(x); if (pos != std::string::npos) { … }</code>. Результат <code>find</code> завжди перевіряйте, перш ніж користуватися ним як позицією. Для типу позиції пишіть <code>auto</code> або <code>std::size_t</code>: тип <code>int</code> тут дасть попередження про порівняння знакового з беззнаковим.",
      "Отже, <code>find</code> знаходить, <code>substr</code> відрізає копію, <code>replace</code>, <code>erase</code> і <code>insert</code> змінюють рядок, а <code>npos</code> означає «не знайдено». Кожен <code>substr</code> копіює символи, і для великих текстів це дорого. У наступному уроці побачимо <code>string_view</code>: спосіб дивитися на частину рядка взагалі без копіювання.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

int main() {
    std::string s = "hello, world";
    auto pos = s.find("world");
    std::cout << "позиція: " << pos << "\n";
    std::cout << "підрядок: " << s.substr(pos) << "\n";
    std::cout << "перші п'ять: " << s.substr(0, 5) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

int main() {
    std::string s = "red apple";
    auto pos = s.find("pear");
    if (pos == std::string::npos) {
        std::cout << "pear не знайдено\n";
    }
    s.replace(0, 3, "green");
    std::cout << s << "\n";
    s.erase(0, 6);
    std::cout << s << "\n";
    s.insert(0, "big ");
    std::cout << s << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

std::string replace_all(std::string text, const std::string& from, const std::string& to) {
    std::size_t pos = 0;
    while ((pos = text.find(from, pos)) != std::string::npos) {
        text.replace(pos, from.size(), to);
        pos += to.size();
    }
    return text;
}

int main() {
    std::string line = "a-b-c-d";
    std::cout << replace_all(line, "-", "::") << "\n";
    std::cout << replace_all("aaa", "a", "aa") << "\n";
    std::string email = "ira@example.com";
    auto at = email.find('@');
    if (at != std::string::npos) {
        std::cout << "користувач: " << email.substr(0, at) << "\n";
        std::cout << "домен: " << email.substr(at + 1) << "\n";
    }
    return 0;
}
`,
      String.raw`// аварія: substr з позицією за межами рядка кидає std::out_of_range
#include <iostream>
#include <string>

int main() {
    std::string s = "abc";
    std::cout << "довжина " << s.size() << std::endl;
    std::cout << s.substr(10) << std::endl;
    return 0;
}
`,
    ],
    note: "<code>find</code> повертає позицію або <code>std::string::npos</code>; завжди перевіряйте це перед використанням. <code>substr</code> дає копію, а позиція за межами рядка кидає <code>std::out_of_range</code>. При заміні всіх входжень шукайте далі від кінця вставленого тексту.",
    work: "Пошук і заміна потрібні всюди, де є текст: розбір рядків запиту й шляхів, підстановка значень у шаблони повідомлень, очищення введення від зайвих символів і вирізання імені користувача з адреси пошти.",
    tasks: [
      "Що повертає <code>find</code>, коли шуканий текст не знайдено, і чому це число не можна порівнювати з <code>-1</code> як із звичайним цілим?",
      "Чому при заміні всіх входжень «а» на «аа» наступний пошук треба починати з <code>pos + to.size()</code>, а не з <code>pos</code>?",
    ],
  },
  {
    t: "string_view: рядки без копіювання",
    ch: "Стандартна бібліотека",
    easy: "Це як закладка в книжці з виділеним абзацом: ви не переписуєте текст у новий зошит, а лише показуєте, де він починається й де закінчується. Книга при цьому має лишатися на столі.",
    p: [
      "У минулому уроці <code>substr</code> щоразу створював нову копію шматка рядка. Якщо розбирати великий текст на сотні слів, це сотні виділень пам'яті. А ще функція, що приймає <code>const std::string&amp;</code>, змушує викликача створити <code>std::string</code>, навіть коли у нього лише літерал. Тип <code>std::string_view</code> із заголовка <code>&lt;string_view&gt;</code> (C++17) вирішує обидві проблеми.",
      "Модель у голові: <code>string_view</code> це пара «вказівник на початок + довжина». Він <b>не володіє</b> символами, а лише дивиться на чужі. Копіювання такого об'єкта дешеве: копіюються лише два числа. Дивитися можна на літерал, на <code>std::string</code> або на частину будь-якого з них. Метод <code>substr</code> у <code>string_view</code> теж повертає view без копіювання символів, а <code>find</code>, <code>size</code>, <code>front</code>, <code>operator[]</code> працюють так само, як у рядка.",
      "Найкраще застосування: параметр функції, яка лише читає текст. Замість <code>const std::string&amp;</code> пишіть <code>std::string_view</code>, і функція приймає літерал, рядок і підрядок однаково, без створення тимчасових об'єктів. Типово view передають за значенням, а не за посиланням: він малий. Додатково є <code>remove_prefix(n)</code> і <code>remove_suffix(n)</code>: вони просто зсувають межі view, нічого не копіюючи.",
      "Для розбору тексту view зручний: у циклі шукаєте роздільник через <code>find</code>, береті шматок через <code>substr</code> і зсуваєте початок. Жодного виділення пам'яті, поки ви самі не вирішите зробити з view справжній рядок: <code>std::string(sv)</code>. Явне перетворення необхідне: неявно view у <code>std::string</code> не перетворюється, і компілятор це зупинить.",
      "Головна пастка: <b>view не продовжує життя даних</b>. Якщо рядок, на який він дивиться, змінився, перемістився або зник, view стає «висячим», і читати через нього не можна. Класичний випадок: повернути view на локальний рядок із функції або зберегти view на тимчасовий <code>std::string</code>. Правило просте: view має жити коротше за рядок, на який він дивиться. Друга пастка: view не гарантує нульового кінця, тож не передавайте його в C-функції, що чекають <code>const char*</code>.",
      "Ідіома: приймайте <code>std::string_view</code> у параметрах, а зберігайте й повертайте <code>std::string</code>, якщо дані мають пережити виклик. Якщо ви повертаєте шматок свого вхідного аргументу, а викликач гарантує його життя, view також доречний, але це контракт, який варто описати в коментарі.",
      "Отже, <code>string_view</code> це дешеве вікно на чужий текст: без копій, але й без володіння. Він ідеально пасує до задач розбору, де ми вирізаємо багато шматків. У наступному уроці розглянемо інший спосіб розбирати й складати текст: потоки рядків <code>stringstream</code>.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <string_view>

void show(std::string_view sv) {
    std::cout << "[" << sv << "] довжина " << sv.size() << "\n";
}

int main() {
    show("літерал");
    std::string s = "hello world";
    show(s);
    show(std::string_view(s).substr(6));
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string_view>

int main() {
    std::string_view sv = "  trim me  ";
    while (!sv.empty() && sv.front() == ' ') {
        sv.remove_prefix(1);
    }
    while (!sv.empty() && sv.back() == ' ') {
        sv.remove_suffix(1);
    }
    std::cout << "[" << sv << "]\n";
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
        auto pos = text.find(sep);
        if (pos == std::string_view::npos) {
            parts.push_back(text);
            break;
        }
        parts.push_back(text.substr(0, pos));
        text.remove_prefix(pos + 1);
    }
    return parts;
}

int main() {
    std::string line = "ana,bob,carl";
    for (auto part : split(line, ',')) {
        std::cout << part << "\n";
    }
    std::string owned(split(line, ',')[1]);
    owned += "!";
    std::cout << owned << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: string_view не перетворюється на std::string неявно
#include <iostream>
#include <string>
#include <string_view>

int main() {
    std::string_view sv = "text";
    std::string s = sv;
    std::cout << s << "\n";
    return 0;
}
`,
    ],
    note: "<code>std::string_view</code> це вказівник і довжина: читання без копій і без володіння. Він має жити коротше за рядок, на який дивиться. У параметрах для читання беріть його за значенням, а в <code>std::string</code> перетворюйте явно.",
    work: "У розборі запитів, конфігів і логів сотні підрядків вирізають із великого тексту. Через <code>string_view</code> сервери роблять це без виділень пам'яті, а повністю копіюють лише те, що треба зберегти надовго.",
    tasks: [
      "Чому <code>string_view</code> не можна повертати з функції, якщо він дивиться на локальний <code>std::string</code> цієї функції?",
      "Чим параметр <code>std::string_view</code> кращий за <code>const std::string&amp;</code>, коли функцію викликають з літералом?",
    ],
  },
  {
    t: "stringstream: розбір і складання тексту",
    ch: "Стандартна бібліотека",
    easy: "Рядковий потік це віртуальний канал, у який можна лити частинки тексту й числа, як у склянку, а потім забрати готовий рядок. Або навпаки: налити готовий рядок і по одному діставати з нього слова й числа.",
    p: [
      "Ви вже користувалися <code>std::cout</code>: потоком, у який пишуть через <code>&lt;&lt;</code>. Потоки бувають не лише до екрана. У заголовку <code>&lt;sstream&gt;</code> є потоки, що працюють з рядком у пам'яті: <code>std::ostringstream</code> для складання тексту й <code>std::istringstream</code> для читання з нього. Це той самий знайомий інтерфейс, тільки без термінала, і саме тому на сайті з пісочницею без <code>cin</code> ми вчимося вводу на ньому.",
      "Модель у голові: <code>ostringstream</code> це буфер, куди <code>&lt;&lt;</code> дописує текстове подання чисел і слів. Забрати все накопичене можна методом <code>str()</code>, що повертає звичайний <code>std::string</code>. Це зручніше й надійніше за склеювання через <code>+</code> і <code>std::to_string</code>, особливо коли змішуються числа, текст і форматування на кшталт <code>std::fixed</code> чи <code>std::setprecision</code>.",
      "Для читання ви створюєте <code>std::istringstream in(text)</code> і виймаєте значення через <code>&gt;&gt;</code>: оператор пропускає пробіли, читає слово або число й переходить далі. Тип змінної визначає, як трактувати текст: у <code>int</code> прочитається число, у <code>std::string</code> одне слово. Щоб розбити рядок на частини за іншим роздільником, використовують <code>std::getline(in, part, ',')</code>: він читає до коми.",
      "Читання може не вдатися, і потік це помічає: коли у <code>in &gt;&gt; x</code> текст не схожий на число, потік переходить у стан збою, а змінна <code>x</code> стає нулем. Умова <code>if (in &gt;&gt; x)</code> перевіряє успіх, і цикл <code>while (in &gt;&gt; x)</code> читає, поки дані не скінчаться або не зустрінеться непридатний текст. Ця перевірка саме те місце, де початківці помиляються найчастіше.",
      "Пастки. По-перше, <code>&gt;&gt;</code> зупиняється на пробілі, тож читати рядок із пробілами треба через <code>getline</code>. По-друге, потік <b>не копіюється</b>: його можна лише передавати за посиланням або переміщувати. По-третє, щоб використати потік удруге з новим текстом, мало написати <code>str(«новий»)</code>: треба ще скинути стан збою викликом <code>clear()</code>, або створити новий потік.",
      "Ідіома розбору: рядок до <code>istringstream</code>, а далі цикл із <code>getline</code> за роздільником, і кожну частину числа перетворюють через ще один <code>istringstream</code> або через <code>&gt;&gt;</code>. Ідіома складання: <code>ostringstream out; out &lt;&lt; … ; return out.str();</code>. Обидві працюють з будь-яким типом, для якого визначено оператори потоку.",
      "Отже, <code>ostringstream</code> збирає текст, <code>istringstream</code> його розбирає, а перевірка <code>if (in &gt;&gt; x)</code> ловить помилки формату. Так ми замінюємо введення з клавіатури в пісочниці й пишемо розбір, що пізніше стане основою обробки запитів. Далі переходимо від тексту до часу: у наступному уроці розберемо <code>chrono</code>.",
    ],
    code: [
      String.raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::ostringstream out;
    out << "x=" << 42 << ", y=" << 3.5 << ", ok=" << true;
    std::string s = out.str();
    std::cout << s << "\n";
    std::cout << "довжина " << s.size() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream in("10 20 abc 30");
    int sum = 0;
    int x = 0;
    while (in >> x) {
        sum += x;
    }
    std::cout << "сума до першого збою: " << sum << "\n";
    in.clear();
    std::string word;
    in >> word;
    std::cout << "наступне слово: " << word << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <sstream>
#include <string>
#include <vector>

int main() {
    std::string csv = "ana,30,kyiv\nbob,25,lviv";
    std::istringstream lines(csv);
    std::string line;
    std::vector<int> ages;
    while (std::getline(lines, line)) {
        std::istringstream fields(line);
        std::string name, age, city;
        std::getline(fields, name, ',');
        std::getline(fields, age, ',');
        std::getline(fields, city, ',');
        ages.push_back(std::stoi(age));
        std::cout << name << " з міста " << city << "\n";
    }
    int total = 0;
    for (int a : ages) {
        total += a;
    }
    std::cout << "сума віків " << total << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: потоки не копіюються
#include <iostream>
#include <sstream>

int main() {
    std::istringstream a("1 2 3");
    std::istringstream b = a;
    int x = 0;
    b >> x;
    std::cout << x << "\n";
    return 0;
}
`,
    ],
    note: "<code>ostringstream</code> збирає текст, а <code>str()</code> віддає рядок. <code>istringstream</code> розбирає через <code>&gt;&gt;</code> і <code>getline</code>. Перевіряйте успіх читання умовою <code>if (in &gt;&gt; x)</code>: після збою потрібен <code>clear()</code>. Потоки не копіюються.",
    work: "Розбір рядків конфігурації, логів і CSV, складання повідомлень з числами й форматуванням, а також тести: підставивши <code>istringstream</code> замість клавіатури, ви перевіряєте код читання автоматично, без людини й без файлів на диску.",
    tasks: [
      "Що станеться зі змінною <code>x</code> і з потоком, якщо виконати <code>in &gt;&gt; x</code> для тексту «abc», а <code>x</code> має тип <code>int</code>?",
      "Як прочитати з рядка весь фрагмент до коми, включно з пробілами, і чому для цього не підходить <code>&gt;&gt;</code>?",
    ],
  },
  {
    t: "chrono: тривалості й час",
    ch: "Стандартна бібліотека",
    easy: "Тривалість це відрізок на лінійці з підписаними одиницями: 2 хвилини, 1500 мілісекунд. Бібліотека chrono пам'ятає одиницю разом із числом, тому не дасть додати секунди до метрів і сама переведе хвилини в секунди.",
    p: [
      "Час у програмах зазвичай зберігають як голе число: <code>int timeout = 5</code>. Але які це одиниці: секунди, мілісекунди, хвилини? Помилка в одиницях тихо ламає програму. Бібліотека <code>&lt;chrono&gt;</code> розв'язує це так: число завжди йде разом з одиницею, і компілятор стежить, щоб їх не плутали.",
      "Модель у голові: <b>тривалість</b> (<code>std::chrono::duration</code>) це кількість «тактів» плюс розмір такту. Готові назви: <code>seconds</code>, <code>milliseconds</code>, <code>minutes</code>, <code>hours</code>. Тривалості можна додавати, віднімати й порівнювати, навіть із різними одиницями: <code>minutes(1) == seconds(60)</code> істинне, бо обидві переводяться до спільної одиниці.",
      "Зручні літерали вмикає <code>using namespace std::chrono_literals;</code>: тоді пишуть <code>500ms</code>, <code>2s</code>, <code>3min</code>. Щоб дізнатися число, викликають <code>.count()</code>. Для явного переведення в грубішу одиницю є <code>duration_cast&lt;seconds&gt;(d)</code>: вона відкидає дробову частину. Перехід до дрібнішої одиниці (секунди в мілісекунди) безпечний і виконується сам.",
      "Крім тривалостей, є <b>моменти часу</b> (<code>time_point</code>) і <b>годинники</b>. <code>steady_clock</code> ніколи не йде назад і годиться для вимірювання, скільки щось тривало: ви берете момент до й після та віднімаєте. <code>system_clock</code> показує календарний час. Різниця двох моментів це тривалість; момент плюс тривалість дає новий момент. Поточний час (<code>now()</code>) вимірюють у справжніх програмах, а в наших прикладах ми його не друкуємо, бо він щоразу інший.",
      "Пастки. По-перше, ділення цілих без втрат неможливе: <code>duration_cast</code> від 1500 мілісекунд у секунди дає 1, а не 1.5, і це відкидання, а не округлення. Тому компілятор забороняє неявно переводити мілісекунди в секунди й змушує писати <code>duration_cast</code> явно. По-друге, <code>.count()</code> повертає голе число без одиниці: щойно ви його взяли, захист зникає, тож тримайте тривалості якомога довше.",
      "Ідіоми: параметри функцій типу <code>std::chrono::milliseconds timeout</code> замість <code>int</code>; літерали для сталих; <code>duration_cast</code> лише на межі, де потрібне число для виводу. Так чинять і бібліотечні функції на кшталт <code>sleep_for</code>, які ви зустрінете в потоках: вони приймають саме тривалість.",
      "Отже, chrono поєднує число з одиницею, перевіряє це на етапі компіляції й дозволяє безпечно рахувати з часом. У наступному уроці перейдемо до випадкових чисел: теж «вимірювання», але від генератора, який ми контролюємо через seed.",
    ],
    code: [
      String.raw`#include <chrono>
#include <iostream>

int main() {
    using namespace std::chrono;
    seconds a(90);
    minutes m = duration_cast<minutes>(a);
    milliseconds ms = a;
    std::cout << a.count() << " с = " << m.count() << " хв (з відкиданням)\n";
    std::cout << a.count() << " с = " << ms.count() << " мс\n";
    return 0;
}
`,
      String.raw`#include <chrono>
#include <iostream>

int main() {
    using namespace std::chrono_literals;
    auto total = 1min + 30s + 500ms;
    std::cout << "мс: " << std::chrono::duration_cast<std::chrono::milliseconds>(total).count() << "\n";
    std::cout << "рівні: " << (60s == 1min) << "\n";
    std::cout << "довше: " << (2min > 100s) << "\n";
    return 0;
}
`,
      String.raw`#include <chrono>
#include <iostream>

int main() {
    using namespace std::chrono;
    using namespace std::chrono_literals;
    system_clock::time_point start{};
    system_clock::time_point end = start + hours(36) + minutes(15);
    auto diff = end - start;
    auto h = duration_cast<hours>(diff);
    auto m = duration_cast<minutes>(diff - h);
    std::cout << h.count() << " год " << m.count() << " хв\n";
    std::cout << "end пізніше: " << (end > start) << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: мілісекунди в секунди без явного duration_cast
#include <chrono>
#include <iostream>

int main() {
    std::chrono::milliseconds ms(1500);
    std::chrono::seconds s = ms;
    std::cout << s.count() << "\n";
    return 0;
}
`,
    ],
    note: "Тривалість це число разом з одиницею. Додавати й порівнювати можна різні одиниці, перехід до грубішої потребує <code>duration_cast</code> і відкидає дріб. Літерали <code>500ms</code> вмикає <code>chrono_literals</code>. <code>.count()</code> повертає число без одиниці.",
    work: "Таймаути мережевих запитів, затримки повторних спроб, вимірювання тривалості операцій через <code>steady_clock</code>, терміни дії токенів і кешів: усюди, де «5» без одиниці спричиняє помилки: хто знає, це секунди чи мілісекунди, той уникає багів у конфігах і API.",
    tasks: [
      "Чому компілятор не дозволяє присвоїти <code>milliseconds</code> змінній типу <code>seconds</code> без <code>duration_cast</code>, а у зворотний бік дозволяє?",
      "Що дає <code>duration_cast&lt;seconds&gt;(milliseconds(2999)).count()</code> і чому?",
    ],
  },
  {
    t: "random: генератори із seed",
    ch: "Стандартна бібліотека",
    easy: "Генератор випадкових чисел схожий на заведену музичну скриньку: поки не знаєш, з якого місця вона почала, мелодія здається випадковою, але з того самого місця (seed) вона зіграє ті самі ноти щоразу.",
    p: [
      "Випадкові числа потрібні для ігор, симуляцій, тестових даних і перемішування. Стара функція <code>rand()</code> має поганий розподіл і спільний глобальний стан, тому в сучасному C++ користуються заголовком <code>&lt;random&gt;</code>. Він розділяє роботу на дві частини: <b>рушій</b> видає потік сирих чисел, а <b>розподіл</b> перетворює їх у потрібний діапазон.",
      "Модель у голові: рушій, наприклад <code>std::mt19937</code>, це детермінована машина. Вона має внутрішній стан, а виклик <code>gen()</code> видає наступне число й змінює стан. «Випадковість» тут обчислена: кожне число повністю визначене початковим значенням, яке називають <b>seed</b> (зерно). Те саме зерно дає ту саму послідовність щоразу, на будь-якому комп'ютері.",
      "Це властивість, а не вада. Для тестів і відтворюваних симуляцій ви фіксуєте зерно й одержуєте однаковий результат при кожному запуску. Для справжньої непередбачуваності зерно беруть із <code>std::random_device</code> (джерело ентропії системи). Нова послідовність при кожному запуску означає нове зерно, і це правильна поведінка гри, але не тесту.",
      "Щоб звести сирі числа до діапазону, створюють розподіл, наприклад <code>std::uniform_int_distribution&lt;int&gt; d(1, 6)</code>, і викликають <code>d(gen)</code>. Увага: сам рушій <code>mt19937</code> гарантовано видає однакові числа всюди, а ось точні значення розподілів стандарт не фіксує, тому різні бібліотеки можуть дати різні числа. Тому для перевірок орієнтуйтеся на властивості (значення в межах діапазону), а не на конкретні числа.",
      "Пастки. По-перше, не створюйте новий рушій при кожному виклику: це дорого, і з однаковим зерном ви щоразу отримуватимете те саме число. Рушій створюють один раз і передають за посиланням. По-друге, <code>gen() % 6</code> дає зміщений розподіл (деякі значення трапляються частіше), тож краще брати розподіл. По-третє, <code>std::shuffle</code> потребує рушія третім аргументом, а старий <code>random_shuffle</code> прибрано зі стандарту.",
      "Ідіоми: один <code>mt19937</code> на програму або на об'єкт, зерно з <code>random_device</code> у продакшені й зафіксоване число в тестах; розподіл створюють поруч із використанням, а рушій передають у <code>std::shuffle</code> і подібні алгоритми.",
      "Отже, рушій дає відтворювану послідовність за зерном, розподіл формує діапазон, а зерно з <code>random_device</code> робить запуски різними. Далі розглянемо алгоритми заголовка <code>&lt;numeric&gt;</code>, які підсумовують і накопичують числа, зокрема й ті, що ми щойно нагенерували.",
    ],
    code: [
      String.raw`#include <iostream>
#include <random>

int main() {
    std::mt19937 gen(42);
    std::cout << gen() << "\n";
    std::cout << gen() << "\n";
    std::cout << gen() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <random>

int main() {
    std::mt19937 a(7);
    std::mt19937 b(7);
    std::mt19937 c(8);
    bool same = true;
    for (int i = 0; i < 5; ++i) {
        if (a() != b()) {
            same = false;
        }
    }
    std::cout << "те саме зерно, та сама послідовність: " << same << "\n";
    std::cout << "інше зерно: " << (std::mt19937(7)() != c()) << "\n";
    return 0;
}
`,
      String.raw`#include <algorithm>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>

int main() {
    std::mt19937 gen(2024);
    std::uniform_int_distribution<int> die(1, 6);
    bool ok = true;
    for (int i = 0; i < 1000; ++i) {
        int v = die(gen);
        if (v < 1 || v > 6) {
            ok = false;
        }
    }
    std::cout << "усі кидки в межах 1..6: " << ok << "\n";

    std::vector<int> v(10);
    std::iota(v.begin(), v.end(), 1);
    std::shuffle(v.begin(), v.end(), gen);
    std::sort(v.begin(), v.end());
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: shuffle потребує генератор третім аргументом
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3, 4};
    std::shuffle(v.begin(), v.end());
    std::cout << v.size() << "\n";
    return 0;
}
`,
    ],
    note: "<code>mt19937</code> з однаковим seed видає однакову послідовність. Розподіл (<code>uniform_int_distribution</code>) звужує числа до діапазону, але його точні значення між бібліотеками різні. Зерно з <code>random_device</code> дає різні запуски. Рушій створюють один раз.",
    work: "Тестові дані з фіксованим зерном, ігрові події, відтворювані симуляції, перемішування списків, випадкові затримки повторних спроб, вибірка зразків для статистики й налагодження рідкісних помилок: збережений seed дозволяє відтворити збій.",
    tasks: [
      "Чому у тесті краще фіксувати seed, а в грі брати його з <code>random_device</code>?",
      "Що не так із кодом, який у циклі щоразу створює <code>std::mt19937 gen(42)</code> і бере з нього одне число?",
    ],
  },
  {
    t: "numeric: accumulate, iota, gcd і partial_sum",
    ch: "Стандартна бібліотека",
    easy: "Заголовок numeric це касовий апарат для контейнерів: він швидко складає чеки, нумерує позиції, знаходить спільний дільник сум і веде проміжні підсумки, поки ви не пишете жодного циклу.",
    p: [
      "Підсумувати елементи, заповнити масив 1, 2, 3…, знайти найбільший спільний дільник: такі задачі трапляються постійно, і кожного разу писати цикл довго. Заголовок <code>&lt;numeric&gt;</code> містить саме ці дрібні алгоритми. Вони працюють з ітераторами, як <code>std::sort</code> із попередніх тем, тож приймають будь-який контейнер.",
      "Модель у голові: <code>std::accumulate(first, last, init)</code> стартує зі значення <code>init</code> й по черзі додає до нього елементи діапазону. <code>std::iota(first, last, start)</code> записує <code>start</code>, <code>start+1</code>, … у діапазон. <code>std::partial_sum(first, last, out)</code> пише в <code>out</code> наростальні суми: i-й вихід це сума перших i+1 елементів. А <code>std::gcd(a, b)</code> і <code>std::lcm(a, b)</code> знаходять НСД і НСК двох цілих.",
      "Для accumulate можна передати власну операцію четвертим аргументом: наприклад, множення замість додавання, щоб порахувати добуток, чи лямбду, що склеює рядки. Тоді init стає нейтральним елементом цієї операції: 0 для суми, 1 для добутку. Це корисна думка: <code>accumulate</code> це «згортка», і пояснює багато реальних задач.",
      "Головна пастка: <b>тип результату береться з init</b>. Якщо скласти <code>vector&lt;double&gt;</code> із init <code>0</code> (ціле), то кожна проміжна сума буде обрізана до цілого, і ви втратите дробову частину без жодного попередження. Правильно писати <code>0.0</code>. Схожа пастка з переповненням: сума багатьох <code>int</code> може не влізти, тоді init беруть типу <code>long long</code>: <code>0LL</code>.",
      "Друга пастка: <code>iota</code> та <code>partial_sum</code> записують у вихідний діапазон, який має вже існувати й бути достатньо великим: спершу створіть <code>vector&lt;int&gt; v(5)</code>, а не порожній. <code>gcd</code> і <code>lcm</code> приймають тільки цілі: дробові аргументи не скомпілюються. Також <code>gcd(0, 0)</code> дорівнює 0, а <code>lcm</code> може переповнити тип, якщо числа великі.",
      "Ідіоми: <code>accumulate(v.begin(), v.end(), 0LL)</code> для безпечної суми, <code>iota</code> для індексів, які потім сортують за якимось ключем, <code>partial_sum</code> для префіксних сум: щоб швидко знайти суму діапазону, достатньо двох чисел. Усе це заміна циклів, що пояснює намір.",
      "Отже, <code>numeric</code> дає згортку, заповнення послідовністю, наростальні суми й НСД. Із цим набором стандартна бібліотека в основних рисах знайома: далі глава розглядає регулярні вирази й побітові операції, що працюють уже над самими даними.",
    ],
    code: [
      String.raw`#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v{3, 5, 7, 9};
    int sum = std::accumulate(v.begin(), v.end(), 0);
    int prod = std::accumulate(v.begin(), v.end(), 1, [](int a, int b) { return a * b; });
    std::cout << "сума " << sum << ", добуток " << prod << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v(6);
    std::iota(v.begin(), v.end(), 10);
    std::vector<int> pre(v.size());
    std::partial_sum(v.begin(), v.end(), pre.begin());
    for (int x : v) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    for (int x : pre) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<double> d{0.5, 1.5, 2.25};
    double wrong = std::accumulate(d.begin(), d.end(), 0);
    double right = std::accumulate(d.begin(), d.end(), 0.0);
    std::cout << "з init=0: " << wrong << "\n";
    std::cout << "з init=0.0: " << right << "\n";
    std::cout << "gcd(12, 18) = " << std::gcd(12, 18) << "\n";
    std::cout << "lcm(4, 6) = " << std::lcm(4, 6) << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: gcd приймає лише цілі числа
#include <iostream>
#include <numeric>

int main() {
    std::cout << std::gcd(4.0, 6.0) << "\n";
    return 0;
}
`,
    ],
    note: "<code>accumulate</code> бере тип результату з початкового значення: для <code>double</code> пишіть <code>0.0</code>, для великих сум <code>0LL</code>. <code>iota</code> і <code>partial_sum</code> пишуть у готовий діапазон. <code>gcd</code> і <code>lcm</code> лише для цілих.",
    work: "Сума й середнє за даними, префіксні суми для швидких запитів по діапазонах, нумерація елементів, скорочення дробів і періоди збігу подій через НСД та НСК, підрахунок підсумків у звітах і перевірка, що дані сходяться.",
    tasks: [
      "Що поверне <code>accumulate</code> для <code>vector&lt;double&gt;{0.5, 0.5}</code> з початковим значенням <code>0</code> і чому?",
      "Який вигляд має результат <code>partial_sum</code> для вектора 1, 2, 3, 4 і навіщо він потрібен?",
    ],
  },
];
