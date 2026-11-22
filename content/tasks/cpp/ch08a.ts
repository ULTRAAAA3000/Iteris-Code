// Практичні завдання глави «Стандартна бібліотека», частина a (уроки 79–84). Запускаються на сервері (runtime: "remote").
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08a: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-string-replace-all", lesson: "cpp/79", xp: 30,
    title: "Заміна всіх входжень і домен з адреси",
    context: "Очищення й розбір тексту (шаблони листів, адреси, шляхи) щодня потребує пошуку й заміни підрядків без ручних циклів по символах.",
    brief: [
      "Допишіть <code>replace_all</code>: вона замінює <b>всі</b> входження <code>from</code> у рядку на <code>to</code> і повертає результат. Шукайте через <code>find</code>, а наступний пошук починайте після вставленого тексту.",
      "У <code>main</code> виведіть <code>red, green, blue</code> (заміна «,» на «, » у <code>red,green,blue</code>), а потім домен з адреси <code>user@example.org</code>: усе після <code>@</code>. Вивід: два рядки, <code>list: …</code> і <code>domain: …</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>

std::string replace_all(std::string s, const std::string& from, const std::string& to) {
    // TODO: у циклі шукайте from через find, замінюйте через replace
    // і рухайте позицію пошуку далі за вставленим текстом
    return s;
}

int main() {
    std::string list = replace_all("red,green,blue", ",", ", ");
    std::cout << "list: " << list << "\n";

    std::string email = "user@example.org";
    // TODO: знайдіть '@' і візьміть підрядок після нього
    std::string domain = "";
    std::cout << "domain: " << domain << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Список із пробілами", has: "list: red, green, blue", hint: "Кожна кома має стати комою з пробілом; перевірте, що замінено всі входження, а не лише перше." },
      { on: "stdout", name: "Домен вирізано", has: "domain: example.org", hint: "Позиція '@' плюс 1 це початок домену; substr з одним аргументом бере все до кінця." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "list: red, green, blue\ndomain: example.org", hint: "Рівно два рядки у вказаному форматі." },
      { on: "source", name: "Використано find і replace", matches: "find\\s*\\([\\s\\S]*replace\\s*\\(", hint: "Знайдіть позицію через find, змініть через replace." },
    ],
  },
  {
    ...base, id: "cpp-string-view-split", lesson: "cpp/80", xp: 30,
    title: "Розбиття рядка на слова через string_view",
    context: "Розбір рядків запитів і логів без зайвих копій: кожне слово лише «вікно» в початковому тексті, тож пам'ять не витрачається на тимчасові рядки.",
    brief: [
      "Функція <code>next_word</code> бере <code>std::string_view</code>, повертає перше слово (до пробілу) і <b>скорочує</b> вхідний <code>rest</code> до решти після пропуску пробілу. Допишіть її через <code>find</code>, <code>substr</code> і <code>remove_prefix</code>.",
      "Для тексту <code>one two three</code> виведіть кожне слово з його довжиною у форматі <code>слово:довжина</code>, по рядку на слово.",
    ],
    starter: raw`#include <iostream>
#include <string_view>

std::string_view next_word(std::string_view& rest) {
    // TODO: знайдіть пробіл; слово це rest.substr(0, pos);
    // якщо пробілу немає, слово це весь rest, а rest стає порожнім
    std::string_view word = rest;
    rest = std::string_view();
    return word;
}

int main() {
    std::string_view text = "one two three";
    while (!text.empty()) {
        std::string_view w = next_word(text);
        std::cout << w << ":" << w.size() << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Перше слово", has: "one:3", hint: "Слово береться до першого пробілу, довжина з size()." },
      { on: "stdout", name: "Останнє слово без пробілу", has: "three:5", hint: "Коли пробілу немає, find повертає npos: тоді слово це весь залишок." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "one:3\ntwo:3\nthree:5", hint: "Три рядки формату слово:довжина." },
      { on: "source", name: "Використано remove_prefix", has: "remove_prefix", hint: "Після слова зсуньте початок вікна методом remove_prefix." },
    ],
  },
  {
    ...base, id: "cpp-stringstream-parse", lesson: "cpp/81", xp: 35,
    title: "Розбір записів із рядка через istringstream",
    context: "Конфігурації, логи й CSV приходять рядками. Розбір через потік замість клавіатури дозволяє перевіряти код читання без людини.",
    brief: [
      "Текст містить рядки <code>ім'я вік</code>. Читайте його через <code>std::istringstream</code>: кожен запис через <code>&gt;&gt;</code> у <code>name</code> і <code>age</code>. Для кожного запису виведіть <code>name=age</code>, а наприкінці <code>sum=…</code> (сума віків).",
      "Підсумковий рядок складіть через <code>std::ostringstream</code> і виведіть результат <code>str()</code>.",
    ],
    starter: raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::string data = "ana 30\nbob 25\neve 41\n";
    std::istringstream in(data);
    std::string name;
    int age = 0;
    int sum = 0;
    // TODO: while (in >> name >> age) виведіть name=age і додайте age до sum

    // TODO: складіть "sum=<число>" через ostringstream і виведіть str()
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Записи розібрано", has: "bob=25", hint: "Читайте в циклі while (in >> name >> age): оператор пропускає пробіли й переходи рядка." },
      { on: "stdout", name: "Сума віків", has: "sum=96", hint: "30 + 25 + 41; додавайте age у циклі." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ana=30\nbob=25\neve=41\nsum=96", hint: "Три записи й підсумок, кожен в окремому рядку." },
      { on: "source", name: "Підсумок через ostringstream", has: "ostringstream", hint: "Створіть ostringstream, запишіть у нього через << і візьміть str()." },
    ],
  },
  {
    ...base, id: "cpp-chrono-total", lesson: "cpp/82", xp: 35,
    title: "Сума тривалостей і формат гг:хх:сс",
    context: "Таймаути, тривалості відео й виконання завдань складаються з частин в різних одиницях. chrono рахує їх безпечно, без плутанини секунд і мілісекунд.",
    brief: [
      "Складіть тривалість <code>1h + 45min + 90s + 2500ms</code> зі стандартними літералами. Виведіть: <code>ms: …</code> (усього мілісекунд), <code>s: …</code> (цілі секунди через <code>duration_cast</code>) і <code>time: гг:хх:сс</code> з нулями до двох цифр.",
      "Для формату виділіть години, потім хвилини з залишку, потім секунди. Не користуйтеся <code>now()</code>.",
    ],
    starter: raw`#include <chrono>
#include <iomanip>
#include <iostream>

int main() {
    using namespace std::chrono;
    using namespace std::chrono_literals;
    // TODO: total = 1h + 45min + 90s + 2500ms
    milliseconds total(0);

    // TODO: цілі секунди через duration_cast<seconds>
    seconds s(0);
    // TODO: hours h, minutes m (з s - h), seconds sec (з s - h - m)
    hours h(0);
    minutes m(0);
    seconds sec(0);

    std::cout << "ms: " << total.count() << "\n";
    std::cout << "s: " << s.count() << "\n";
    std::cout << "time: " << std::setfill('0') << std::setw(2) << h.count() << ":"
              << std::setw(2) << m.count() << ":" << std::setw(2) << sec.count() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Мілісекунди", has: "ms: 6392500", hint: "3600 + 2700 + 90 секунд плюс 2,5 с, усе в мілісекундах." },
      { on: "stdout", name: "Цілі секунди", has: "s: 6392", hint: "duration_cast відкидає дробову частину, це не округлення." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ms: 6392500\ns: 6392\ntime: 01:46:32", hint: "Три рядки; години, хвилини й секунди по дві цифри." },
      { on: "source", name: "Використано duration_cast", has: "duration_cast", hint: "Перехід до грубішої одиниці потребує явного duration_cast." },
    ],
  },
  {
    ...base, id: "cpp-random-seed", lesson: "cpp/83", xp: 35,
    title: "Відтворювана послідовність із seed",
    context: "Тести й симуляції мають давати однаковий результат при кожному запуску. Для цього генератор ініціалізують фіксованим seed і перевіряють відтворюваність.",
    brief: [
      "Створіть <code>std::mt19937 gen(42)</code> і виведіть його три перші сирі значення, кожне в окремому рядку (без розподілів).",
      "Далі створіть два генератори із зерном 5 і порівняйте перші 100 значень. Виведіть <code>same: 1</code>, якщо всі збіглися, інакше <code>same: 0</code>.",
    ],
    starter: raw`#include <iostream>
#include <random>

int main() {
    // TODO: gen із seed 42; виведіть три перші значення gen()
    std::mt19937 gen(0);

    // TODO: два генератори із seed 5; порівняйте 100 значень
    bool same = false;
    std::cout << "same: " << same << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Перше значення для seed 42", has: "1608637542", hint: "Передайте 42 у конструктор і викличте gen() без розподілу." },
      { on: "stdout", name: "Генератори збігаються", has: "same: 1", hint: "Те саме зерно дає ту саму послідовність: порівнюйте a() і b() у циклі." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "1608637542\n3421126067\n4083286876\nsame: 1", hint: "Три значення й підсумок." },
      { on: "source", name: "Використано mt19937", has: "mt19937", hint: "Рушій це std::mt19937." },
    ],
  },
  {
    ...base, id: "cpp-numeric-tools", lesson: "cpp/84", xp: 35,
    title: "iota, partial_sum, accumulate і gcd",
    context: "Суми, префіксні суми й НСД трапляються в аналітиці, перевірках і скороченні дробів. Алгоритми numeric замінюють цикли й пояснюють намір.",
    brief: [
      "Заповніть вектор через <code>iota</code> значеннями 1..5 і виведіть його. Для <code>v = {12, 18, 30, 42}</code> виведіть <code>total</code> (accumulate), префіксні суми (partial_sum) і <code>gcd</code> усіх чисел (згортка через <code>std::gcd</code>).",
      "Формат: <code>iota: 1 2 3 4 5</code>, <code>total: 102</code>, <code>prefix: 12 30 60 102</code>, <code>gcd: 6</code>.",
    ],
    starter: raw`#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> a(5);
    // TODO: iota(a.begin(), a.end(), 1)
    std::cout << "iota:";
    for (int x : a) {
        std::cout << " " << x;
    }
    std::cout << "\n";

    std::vector<int> v{12, 18, 30, 42};
    // TODO: total через accumulate
    int total = 0;
    std::cout << "total: " << total << "\n";

    // TODO: prefix через partial_sum
    std::vector<int> prefix(v.size());
    std::cout << "prefix:";
    for (int x : prefix) {
        std::cout << " " << x;
    }
    std::cout << "\n";

    // TODO: gcd усіх чисел: accumulate з std::gcd, початок v[0]
    int g = 0;
    std::cout << "gcd: " << g << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Заповнення iota", has: "iota: 1 2 3 4 5", hint: "iota записує start, start+1, … у діапазон." },
      { on: "stdout", name: "Сума й префікси", has: "prefix: 12 30 60 102", hint: "partial_sum пише наростальні суми у вихідний вектор потрібного розміру." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "iota: 1 2 3 4 5\ntotal: 102\nprefix: 12 30 60 102\ngcd: 6", hint: "Чотири рядки у вказаному форматі." },
      { on: "source", name: "Використано accumulate", has: "accumulate", hint: "Суму рахуйте через std::accumulate." },
    ],
  },
];
