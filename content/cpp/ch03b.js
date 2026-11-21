// Глава 03 «Колекції», частина b (уроки 25–31)
const raw = String.raw;

export const LESSONS_03b = [
  {
    t: "pair, tuple і структуровані зв'язування",
    ch: "Колекції",
    easy: "Pair це конверт із двома відділеннями, tuple це коробка з кількома. Структуроване зв'язування розкладає вміст на іменовані змінні: замість «відділення 0 і 1» ви пишете «місто і населення».",
    p: [
      "Часто треба тримати разом кілька значень, але не хочеться оголошувати окрему структуру: слово й лічильник, ім'я й вік, мінімум і максимум. Для цього є <code>std::pair&lt;A, B&gt;</code> із заголовка <code>&lt;utility&gt;</code>. Це пара зі значень двох типів із публічними полями <code>first</code> і <code>second</code>. Ви вже зустрічали її: елементи <code>std::map</code> якраз пари «ключ, значення».",
      "Створюють пару фігурними дужками (<code>std::pair&lt;std::string, int&gt; p{\"anna\", 3}</code>) або функцією <code>std::make_pair(a, b)</code>, яка сама виводить типи. Пари можна копіювати, присвоювати й порівнювати: оператори <code>==</code> і <code>&lt;</code> працюють за лексикографічним правилом, тобто спочатку порівнюється <code>first</code>, і лише якщо вони рівні, дивляться на <code>second</code>. Саме тому вектор пар легко сортувати й класти в <code>std::set</code> без жодного додаткового коду.",
      "Коли значень більше двох, беруть <code>std::tuple&lt;A, B, C, ...&gt;</code> із <code>&lt;tuple&gt;</code>. Полів із іменами в нього немає, тому доступ іде за номером на етапі компіляції: <code>std::get&lt;0&gt;(t)</code>, <code>std::get&lt;1&gt;(t)</code>. Номер це шаблонний параметр, а не змінна: <code>std::get&lt;i&gt;(t)</code> із змінною <code>i</code> не скомпілюється. Кортеж також порівнюється лексикографічно, а створюється через <code>std::make_tuple</code> або фігурні дужки.",
      "Писати <code>p.first</code> і <code>std::get&lt;2&gt;(t)</code> швидко втомлює й погано читається. У C++17 з'явилися <b>структуровані зв'язування</b>: <code>auto [city, pop, area] = row;</code> створює три змінні, кожна ініціалізується відповідним елементом. Працює для пар, кортежів, масивів і простих структур. Слово <code>auto</code> можна доповнити: <code>const auto&amp; [k, v]</code> не копіює, а <code>auto&amp; [k, v]</code> дозволяє змінювати елемент на місці.",
      "Найкраще зв'язування розкриває себе в циклах і при поверненні кількох результатів. <code>for (const auto&amp; [name, qty] : stock)</code> замість <code>kv.first</code> і <code>kv.second</code> читається майже як речення. Метод <code>insert</code> у <code>map</code> повертає <code>pair&lt;iterator, bool&gt;</code>: <code>auto [it, inserted] = m.insert(...)</code> одразу каже, чи вдалося вставити, і дає позицію елемента. Функція, що має повернути два-три значення, може повернути пару чи кортеж замість вихідних параметрів.",
      "Дві пастки. Кількість імен у квадратних дужках має точно збігатися з кількістю елементів: <code>auto [a, b] = tuple_of_three</code> це помилка компіляції. І імена в дужках лише ярлики на поля: вони не нові типи, тому коли значень більше двох-трьох або вони мають власний сенс, краще оголосити <code>struct</code> з іменованими полями. Кортеж <code>tuple&lt;string, int, double&gt;</code> за місяць ніхто не згадає, що означає друге число.",
      "Також існує <code>std::tie(a, b)</code>: вона збирає посилання на наявні змінні, щоб присвоїти в них елементи кортежу (<code>std::tie(a, std::ignore, c) = t</code> пропускає зайве поле). У новому коді зручніше зв'язування, а <code>tie</code> знадобиться, коли змінні вже оголошені. Далі в главі ми дивимося, як контейнери подають свої елементи, тобто розбираємо ітератори, і вони зустрінуть нас у кожному виразі виду <code>it-&gt;second</code>."
    ],
    code: [
      raw`#include <iostream>
#include <string>
#include <utility>

int main() {
    std::pair<std::string, int> a{"anna", 3};
    auto b = std::make_pair(std::string("anna"), 5);
    std::cout << a.first << " " << a.second << "\n";
    // порівняння: спершу first, потім second
    std::cout << std::boolalpha << (a < b) << " " << (a == b) << "\n";
    a.second = 5;
    std::cout << (a == b) << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> stock{{"apple", 3}, {"pear", 5}};
    for (const auto& [name, qty] : stock) {
        std::cout << name << ": " << qty << "\n";
    }
    auto [it1, ok1] = stock.insert({"apple", 10});  // ключ уже є
    std::cout << std::boolalpha << ok1 << " " << it1->second << "\n";
    auto [it2, ok2] = stock.insert({"fig", 1});
    std::cout << ok2 << " " << it2->first << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <string>
#include <tuple>

int main() {
    std::tuple<std::string, int, double> row{"Kyiv", 3000, 839.0};
    std::cout << std::get<0>(row) << " " << std::get<1>(row) << "\n";

    auto [city, pop, area] = row;
    std::cout << city << " " << pop << " " << area << "\n";

    std::string name;
    double sq = 0;
    std::tie(name, std::ignore, sq) = row;  // другий елемент пропускаємо
    std::cout << name << " " << sq << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <utility>
#include <vector>

// два результати одним поверненням
std::pair<int, int> minMax(const std::vector<int>& v) {
    int lo = v[0];
    int hi = v[0];
    for (int x : v) {
        if (x < lo) lo = x;
        if (x > hi) hi = x;
    }
    return {lo, hi};
}

int main() {
    std::vector<int> v{7, 2, 9, 4};
    auto [lo, hi] = minMax(v);
    std::cout << "min=" << lo << " max=" << hi << "\n";

    std::vector<std::pair<int, char>> items{{2, 'b'}, {1, 'z'}, {1, 'a'}};
    for (auto& [n, c] : items) n *= 10;  // змінюємо елементи на місці
    for (const auto& [n, c] : items) std::cout << n << c << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`// не компілюється: у кортежі три елементи, а імен у зв'язуванні лише два
#include <iostream>
#include <tuple>

int main() {
    auto t = std::make_tuple(1, 2, 3);
    auto [a, b] = t;
    std::cout << a << b << "\n";
    return 0;
}
`
    ],
    note: "pair має first і second, tuple доступний через get за номером. Структуровані зв'язування auto [a, b] розкладають їх на імена; кількість імен мусить збігатися з кількістю елементів.",
    work: "Пари природні для результату «значення й чи вдалося» (insert у map), для елементів словника та для повернення двох значень. Кортеж доречний для коротких тимчасових груп; для довшого життя краще struct з іменованими полями.",
    tasks: [
      "Як порівнюються дві пари за оператором &lt; і що це дає під час сортування вектора пар?",
      "Що поверне map::insert і як зручно розкласти цей результат на дві змінні?"
    ]
  },
  {
    t: "Ітератори: begin, end і подорож контейнером",
    ch: "Колекції",
    easy: "Ітератор це закладка в книзі: вона вказує на конкретну сторінку, її можна посунути далі й заглянути, що там. Закладки «кінець» немає на жодній сторінці: вона стоїть одразу за останньою.",
    p: [
      "Контейнери влаштовані по-різному: масив, дерево, список. Але обходити їх хочеться однаково. Рішення: <b>ітератор</b> — об'єкт, який вказує на елемент контейнера та вміє перейти до наступного. Його використання навмисно скопійоване з вказівників: <code>*it</code> дає елемент, <code>++it</code> посуває далі, <code>it == other</code> порівнює позиції. Завдяки цьому той самий код працює з <code>vector</code>, <code>list</code>, <code>map</code>, <code>set</code> і рядками.",
      "Кожен контейнер має методи <code>begin()</code> і <code>end()</code>. <code>begin()</code> дає ітератор на перший елемент, а <code>end()</code> на позицію <b>одразу після останнього</b>. Це півінтервал «від begin включно до end виключно»: обхід виглядає як <code>for (auto it = v.begin(); it != v.end(); ++it)</code>. Порожній контейнер має <code>begin() == end()</code>, тому цикл виконається нуль разів без жодних особливих перевірок. Розіменовувати <code>end()</code> не можна: там немає елемента.",
      "Цикл range-for, який ви використовуєте з початку курсу, насправді перетворюється на такий самий цикл із <code>begin</code> і <code>end</code>. Тому range-for працює для всього, що має ці методи. Явні ітератори потрібні, коли обхід не простий: треба знати позицію, зупинитися посередині, обійти з кінця чи пропустити частину.",
      "Для елементів <code>map</code> ітератор вказує на пару, тож доступ через стрілку: <code>it-&gt;first</code> і <code>it-&gt;second</code>. Стрілка <code>it-&gt;x</code> це скорочення <code>(*it).x</code>. Тип ітератора довгий (<code>std::vector&lt;int&gt;::iterator</code>), тому майже завжди пишуть <code>auto</code>. Для читання без змін є <code>cbegin()</code> і <code>cend()</code>, які дають <code>const_iterator</code>: через нього елемент змінити не можна, а контейнер <code>const</code> віддає лише такі.",
      "Можливості ітераторів різні. Усі вміють <code>++</code>. Ітератори <code>list</code> і <code>map</code> двосторонні: ще й <code>--</code>. Ітератори <code>vector</code>, <code>deque</code> і <code>string</code> із довільним доступом: ще й <code>it + 3</code>, <code>it2 - it1</code>, <code>it[2]</code>. Для універсального коду є допоміжні функції із <code>&lt;iterator&gt;</code>: <code>std::next(it, n)</code> повертає ітератор на n кроків уперед, <code>std::prev</code> назад, <code>std::advance(it, n)</code> посуває сам <code>it</code>, а <code>std::distance(a, b)</code> рахує кроки між двома позиціями. Вони працюють і зі списком, просто там йдуть кроками.",
      "Зворотний обхід дають <code>rbegin()</code> і <code>rend()</code>: це ітератори, у яких <code>++</code> веде до початку. Пошукові функції, як <code>find</code>, повертають ітератор, а <b>«не знайдено» означає саме <code>end()</code></b>. Тому після пошуку завжди порівнюйте результат із <code>end()</code>, перш ніж розіменовувати. Розіменування <code>end()</code> це UB, тож перевірка обов'язкова.",
      "Ітератор прив'язаний до конкретного контейнера й до його поточного стану: коли контейнер змінюється (додавання, видалення), деякі ітератори перестають бути правильними. Це окрема й важлива тема, їй присвячено просунутий урок наприкінці глави. Наступний урок використає ітератори як «мову» стандартних алгоритмів: вони приймають пару <code>begin</code>, <code>end</code> і працюють на будь-якому контейнері."
    ],
    code: [
      raw`#include <iostream>
#include <list>
#include <vector>

int main() {
    std::vector<int> v{10, 20, 30};
    for (auto it = v.begin(); it != v.end(); ++it) {
        *it += 1;                 // змінюємо елемент через ітератор
        std::cout << *it << " ";
    }
    std::cout << "\n";

    std::list<char> l{'a', 'b', 'c'};
    for (auto it = l.begin(); it != l.end(); ++it) std::cout << *it;
    std::cout << "\n";

    std::vector<int> empty;
    std::cout << std::boolalpha << (empty.begin() == empty.end()) << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> ages{{"Ola", 30}, {"Ivan", 25}};
    for (auto it = ages.begin(); it != ages.end(); ++it) {
        std::cout << it->first << "=" << it->second << "\n";
    }
    auto found = ages.find("Ola");
    if (found != ages.end()) {
        std::cout << "знайдено, вік " << found->second << "\n";
    }
    if (ages.find("Petro") == ages.end()) {
        std::cout << "Petro немає\n";
    }
    return 0;
}
`,
      raw`#include <iostream>
#include <iterator>
#include <list>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3, 4, 5};
    auto it = v.begin() + 2;                       // довільний доступ
    std::cout << *it << " " << it[1] << " " << (v.end() - v.begin()) << "\n";

    std::list<int> l{1, 2, 3, 4, 5};
    auto p = std::next(l.begin(), 3);              // список: кроками
    std::cout << *p << " " << *std::prev(p) << "\n";
    std::cout << std::distance(l.begin(), p) << "\n";

    for (auto r = v.rbegin(); r != v.rend(); ++r) std::cout << *r << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <string>
#include <vector>

void show(const std::vector<std::string>& names) {
    // у const-контейнера begin() дає const_iterator
    for (auto it = names.cbegin(); it != names.cend(); ++it) {
        std::cout << it->size() << ":" << *it << " ";
    }
    std::cout << "\n";
}

int main() {
    std::vector<std::string> names{"Ola", "Ivan", "Zoya"};
    show(names);
    std::vector<std::string>::iterator first = names.begin();
    first->push_back('!');                 // через iterator можна змінювати
    show(names);
    return 0;
}
`,
      raw`// не компілюється: ітератор list не підтримує додавання числа (немає довільного доступу)
#include <iostream>
#include <list>

int main() {
    std::list<int> l{1, 2, 3, 4};
    auto it = l.begin() + 2;
    std::cout << *it << "\n";
    return 0;
}
`
    ],
    note: "begin() вказує на перший елемент, end() на позицію після останнього; розіменовувати end() не можна. Ітератор list не вміє + n, а для таких кроків є std::next. Результат find порівнюйте з end().",
    work: "Ітератори це спільна мова контейнерів і алгоритмів STL. Через них шукають елементи, видаляють, вставляють посередині, обходять з кінця. Без розуміння пари begin/end не прочитати жодної документації стандартної бібліотеки.",
    tasks: [
      "На що вказує end() і чому розіменування end() неприпустиме?",
      "Чим ітератор vector відрізняється від ітератора list і яка функція допомагає посунути обидва на n кроків?"
    ]
  },
  {
    t: "Алгоритми STL: sort, find, count і transform",
    ch: "Колекції",
    easy: "Алгоритми STL це набір готових інструментів майстерні: пилка, лінійка, лічильник. Ви не вигадуєте сортування щоразу, а кажете «від сюди до сюди, ось як порівнювати», і майстерня все робить.",
    p: [
      "Цикл «знайти», цикл «порахувати», цикл «перетворити» ми пишемо знову й знову. Стандартна бібліотека містить готові версії в заголовку <code>&lt;algorithm&gt;</code> (а <code>accumulate</code> у <code>&lt;numeric&gt;</code>). Вони перевірені, відомо, як швидко працюють, і читаються як опис наміру: <code>std::sort(v.begin(), v.end())</code> одразу зрозуміло, що робить, на відміну від десяти рядків власного сортування.",
      "Усі алгоритми приймають <b>діапазон</b> як пару ітераторів <code>[first, last)</code>, а не контейнер. Звідси їхня універсальність: той самий <code>find</code> шукає у векторі, списку й навіть у шматку масиву. <code>std::sort(v.begin(), v.end())</code> сортує за зростанням; для порядку за спаданням третій аргумент <code>std::greater&lt;int&gt;()</code> або власна лямбда. Лямбда у третьому аргументі й є «правилом порівняння»: <code>[](const std::string&amp; a, const std::string&amp; b) { return a.size() &lt; b.size(); }</code>. Сортувати можна лише контейнери з довільним доступом, тому <code>std::sort</code> не годиться для <code>list</code> (у нього є свій метод <code>sort</code>).",
      "Пошук. <code>std::find(first, last, x)</code> шукає перший елемент, рівний <code>x</code>, і повертає ітератор на нього або <code>last</code>, якщо не знайдено. Для складнішої умови є <code>std::find_if(first, last, pred)</code>, де <code>pred</code> — лямбда, що повертає <code>bool</code>. Результат завжди порівнюйте з кінцем діапазону, перш ніж розіменовувати. Щоб дізнатися індекс, віднімайте: <code>it - v.begin()</code> або <code>std::distance</code>.",
      "Підрахунок. <code>std::count(first, last, x)</code> повертає, скільки елементів дорівнює <code>x</code>, а <code>std::count_if</code> рахує ті, для яких умова істинна. Результат має знаковий тип (<code>ptrdiff_t</code>), тому порівнюючи його з <code>size()</code>, кастуйте або використовуйте <code>long</code>, інакше компілятор попередить про порівняння знакового з беззнаковим. Подібні алгоритми: <code>min_element</code>, <code>max_element</code> (повертають ітератор, не значення) та <code>std::accumulate(first, last, init)</code>, що складає елементи, починаючи з <code>init</code>.",
      "Перетворення. <code>std::transform(first, last, out, f)</code> застосовує функцію <code>f</code> до кожного елемента й записує результат починаючи з ітератора <code>out</code>. Якщо <code>out</code> дорівнює <code>first</code>, елементи змінюються на місці. Якщо пишете в інший контейнер, у ньому має бути вже достатньо місця: або заздалегідь <code>std::vector&lt;int&gt; res(v.size())</code>, або вставний ітератор <code>std::back_inserter(res)</code> із <code>&lt;iterator&gt;</code>, який сам викликає <code>push_back</code>.",
      "Пастки. Алгоритм не знає про контейнер, тож сам не змінює його розмір: <code>transform</code> у порожній вектор без <code>back_inserter</code> пише за межі, а <code>find</code> на порожньому діапазоні повертає <code>last</code>. Лямбда для <code>sort</code> має задавати <b>строгий порядок</b>: порівняння «менше» (<code>&lt;</code>), але не «менше або дорівнює» (<code>&lt;=</code>), інакше поведінка не визначена. Для <code>find</code> у <code>map</code> чи <code>set</code> краще їхній власний метод <code>find</code>: він працює за логарифмічний час, а загальний <code>std::find</code> проходить усі елементи.",
      "Ідіома така: перед написанням циклу згадайте, чи нема алгоритму. Він зазвичай коротший і виразніший. Наступний урок збере все вивчене в главі (мапу, вектор пар, сортування) в одну практичну програму: частотний словник."
    ],
    code: [
      raw`#include <algorithm>
#include <functional>
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<int> v{5, 2, 9, 1, 7};
    std::sort(v.begin(), v.end());
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";
    std::sort(v.begin(), v.end(), std::greater<int>());
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";

    std::vector<std::string> w{"pear", "fig", "banana", "kiwi"};
    std::sort(w.begin(), w.end(), [](const std::string& a, const std::string& b) {
        return a.size() < b.size();
    });
    for (const auto& s : w) std::cout << s.size() << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{4, 8, 15, 8, 23, 42};
    auto it = std::find(v.begin(), v.end(), 15);
    if (it != v.end()) {
        std::cout << "знайдено 15 на позиції " << (it - v.begin()) << "\n";
    }
    std::cout << "число 99 " << (std::find(v.begin(), v.end(), 99) == v.end() ? "відсутнє" : "є") << "\n";

    std::cout << "вісімок: " << std::count(v.begin(), v.end(), 8) << "\n";
    std::cout << "парних: " << std::count_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; }) << "\n";

    auto big = std::find_if(v.begin(), v.end(), [](int x) { return x > 20; });
    std::cout << "перше більше 20: " << *big << "\n";
    std::cout << "максимум: " << *std::max_element(v.begin(), v.end()) << "\n";
    return 0;
}
`,
      raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3, 4};
    std::vector<int> squares;
    std::transform(v.begin(), v.end(), std::back_inserter(squares), [](int x) { return x * x; });
    for (int x : squares) std::cout << x << " ";
    std::cout << "\n";

    std::transform(v.begin(), v.end(), v.begin(), [](int x) { return x + 100; });  // на місці
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";

    std::cout << "сума: " << std::accumulate(v.begin(), v.end(), 0) << "\n";
    return 0;
}
`,
      raw`// аварія: find повернув end(), індекс = size(), а at() вийшов за межі й кинув виняток
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{3, 1, 4};
    std::cout << "шукаємо 7\n";
    auto it = std::find(v.begin(), v.end(), 7);
    std::cout << v.at(it - v.begin()) << "\n";
    return 0;
}
`,
      raw`// не компілюється: std::sort потребує ітераторів довільного доступу, а в list їх немає
#include <algorithm>
#include <iostream>
#include <list>

int main() {
    std::list<int> l{3, 1, 2};
    std::sort(l.begin(), l.end());
    std::cout << l.front() << "\n";
    return 0;
}
`
    ],
    note: "Алгоритми приймають діапазон [first, last) і повертають ітератор; «не знайдено» це last. Лямбда задає правило порівняння чи умову. transform у інший контейнер потребує місця або back_inserter.",
    work: "Сортування за ціною, пошук користувача за умовою, підрахунок помилок у журналі, перетворення всіх значень: усе це один рядок алгоритму замість власного циклу. Код стає коротшим і менше помиляється.",
    tasks: [
      "Що повертає std::find, коли елемента немає, і що треба перевірити перед розіменуванням?",
      "Чому std::transform у порожній вектор без back_inserter небезпечний і як це виправити?"
    ]
  },
  {
    t: "Практика: частотний словник",
    ch: "Колекції",
    easy: "Частотний словник це підрахунок голосів: кожне слово кладе бюлетень у свою скриньку. Наприкінці скриньки розкладають за кількістю бюлетенів і оголошують лідерів.",
    p: [
      "У цьому уроці нових понять немає: ми зберемо вже вивчене в одну типову програму. Задача: за текстом порахувати, скільки разів зустрічається кожне слово, і показати найчастіші. Таку програму пишуть для аналізу журналів, пошуку ключових слів, підрахунку голосів. Вона вміщує три кроки: розбити текст на слова, порахувати їх у словнику, упорядкувати результат.",
      "Розбиття на слова. Читати зі стандартного вводу пісочниця не дає, тому текст лежить у рядку, а читаємо його через <code>std::istringstream</code> із <code>&lt;sstream&gt;</code>: це потік, що читає з рядка так само, як <code>cin</code> із клавіатури. Вираз <code>while (in &gt;&gt; word)</code> дістає слова, розділені пробілами, і зупиняється наприкінці. У справжній програмі той самий цикл працював би з <code>std::cin</code> або з файлом без змін.",
      "Нормалізація. «Кіт» і «кіт» для людини те саме слово, для комп'ютера різні. Тому слово зводять до одного регістру. Для ASCII годиться <code>std::tolower</code> із <code>&lt;cctype&gt;</code>, але передавати їй треба <code>unsigned char</code>, інакше від'ємні значення дають UB: <code>std::tolower(static_cast&lt;unsigned char&gt;(c))</code>. Знаки пунктуації теж відкидають, наприклад, зберігаючи лише літери. Кирилицю така функція не обробить: UTF-8 це кілька байтів на символ, повноцінну роботу з ним ми тут не розглядаємо.",
      "Підрахунок. Ключ це слово, значення це лічильник: <code>std::map&lt;std::string, int&gt; freq</code>. Оператор <code>freq[word]++</code> робить усе одразу: якщо слова ще немає, <code>[]</code> створить запис зі значенням 0, а <code>++</code> зробить його одиницею. Цю ідіому ви вже бачили в уроках про <code>map</code>. Альтернатива <code>unordered_map</code> швидша, але порядок обходу в ній довільний, тому для стабільного виводу все одно доведеться впорядковувати.",
      "Упорядкування за частотою. Словник <code>map</code> сортований за ключем, а нам потрібен порядок за значенням. Копіюємо його в <code>std::vector&lt;std::pair&lt;std::string, int&gt;&gt;</code> і сортуємо лямбдою: спершу за лічильником за спаданням, а за однакового лічильника за словом за зростанням. Другий критерій важливий, бо без нього порядок рівних слів залежав би від реалізації, а вивід став би нестабільним.",
      "Вивід. Ітеруємо вектор і друкуємо топ-N, де N не більше, ніж є слів: <code>std::min(n, entries.size())</code>. Типова помилка: звернутися до слова, якого немає, через <code>freq.at(word)</code>. Метод <code>at</code> кидає виняток <code>std::out_of_range</code>, що без обробки завершує програму. Для читання «можливо відсутнього» ключа користуйтеся <code>find</code> або <code>count</code>, а оператор <code>[]</code> залишайте для запису, бо він мовчки створює порожній запис.",
      "Зверніть увагу на склад: <code>istringstream</code> дає слова, <code>map</code> рахує, <code>vector</code> із <code>pair</code> і <code>sort</code> упорядковують, структуроване зв'язування читає результат. Так виглядає звична робота зі стандартною бібліотекою: кілька готових деталей з'єднані кількома рядками. Далі в главі йдуть три просунуті уроки: про те, коли ітератори стають недійсними, про власні компаратори й хеші та про ширші алгоритми."
    ],
    code: [
      raw`#include <iostream>
#include <map>
#include <sstream>
#include <string>

int main() {
    std::string text = "to be or not to be";
    std::istringstream in(text);
    std::map<std::string, int> freq;
    std::string word;
    while (in >> word) {
        freq[word]++;
    }
    for (const auto& [w, n] : freq) {
        std::cout << w << " " << n << "\n";
    }
    return 0;
}
`,
      raw`#include <cctype>
#include <iostream>
#include <string>

// малі літери, без розділових знаків
std::string normalize(const std::string& s) {
    std::string out;
    for (char c : s) {
        unsigned char u = static_cast<unsigned char>(c);
        if (std::isalpha(u)) out += static_cast<char>(std::tolower(u));
    }
    return out;
}

int main() {
    std::cout << normalize("Hello,") << "\n";
    std::cout << normalize("WORLD!") << "\n";
    std::cout << "[" << normalize("...") << "]\n";
    return 0;
}
`,
      raw`#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <utility>
#include <vector>

int main() {
    std::map<std::string, int> freq{{"cat", 2}, {"dog", 5}, {"bird", 2}, {"ant", 1}};
    std::vector<std::pair<std::string, int>> entries(freq.begin(), freq.end());
    std::sort(entries.begin(), entries.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) return a.second > b.second;  // частіші першими
        return a.first < b.first;                              // за рівності за алфавітом
    });
    for (const auto& [w, n] : entries) std::cout << w << ":" << n << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`#include <algorithm>
#include <cctype>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

std::string normalize(const std::string& s) {
    std::string out;
    for (char c : s) {
        unsigned char u = static_cast<unsigned char>(c);
        if (std::isalpha(u)) out += static_cast<char>(std::tolower(u));
    }
    return out;
}

int main() {
    std::istringstream in("The cat and the dog. The END, and the cat!");
    std::map<std::string, int> freq;
    std::string raw;
    while (in >> raw) {
        std::string w = normalize(raw);
        if (!w.empty()) freq[w]++;
    }

    std::vector<std::pair<std::string, int>> entries(freq.begin(), freq.end());
    std::sort(entries.begin(), entries.end(), [](const auto& a, const auto& b) {
        return a.second != b.second ? a.second > b.second : a.first < b.first;
    });

    size_t top = std::min<size_t>(3, entries.size());
    for (size_t i = 0; i < top; ++i) {
        std::cout << (i + 1) << ". " << entries[i].first << " " << entries[i].second << "\n";
    }
    return 0;
}
`,
      raw`// аварія: at() для відсутнього ключа кидає std::out_of_range, який ніхто не ловить
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> freq{{"cat", 2}};
    std::cout << "cat: " << freq.at("cat") << "\n";
    std::cout << "dog: " << freq.at("dog") << "\n";
    return 0;
}
`
    ],
    note: "Частотний словник складається з трьох кроків: розбити текст на слова, порахувати в map через freq[word]++, упорядкувати копію у vector із pair лямбдою з другим критерієм для стабільності.",
    work: "Так аналізують журнали (найчастіші помилки), підраховують голоси, будують хмари слів і пошукові індекси. Так само працюють рейтинги й статистика відвідувань. Той самий скелет «розбити, порахувати, відсортувати» повторюється в безлічі реальних програм.",
    tasks: [
      "Чому для упорядкування за частотою вміст map копіюють у vector пар, а не сортують сам map?",
      "Навіщо в лямбді сортування другий критерій (за словом) і чим небезпечний at() для відсутнього ключа?"
    ]
  },
  {
    t: "Інвалідація ітераторів і ідіома remove-erase",
    ch: "Колекції",
    adv: true,
    easy: "Ітератор це адреса будинку у вашому записнику. Якщо будинок знесли чи вулицю перебудували, адреса в записнику лишилась, але ведеть у нікуди. Інвалідація це момент, коли запис застарів.",
    p: [
      "Ітератор залежить від того, як контейнер зберігає елементи. Коли контейнер змінюється, частина ітераторів (а також посилань і вказівників на елементи) <b>інвалідується</b>: вони більше не вказують на правильне місце, і користуватися ними, навіть просто порівнювати чи розіменовувати, це UB. Ні компілятор, ні runtime цього зазвичай не помітять, тому правила треба знати напам'ять.",
      "Для <code>vector</code>: <code>push_back</code>, <code>insert</code>, <code>resize</code>, <code>reserve</code>, що перевищили ємність, перевиділяють пам'ять, і <b>усі</b> ітератори, посилання й вказівники стають недійсними. Якщо перевиділення не було, недійсними стають лише елементи від місця вставки до кінця. <code>erase</code> недійсними робить ітератори від місця видалення до кінця. Хронічна помилка: тримати <code>auto it = v.begin()</code>, потім додавати елементи й користуватися <code>it</code>.",
      "Для <code>deque</code> вставка посередині інвалідує все, вставка на краях інвалідує ітератори (але не посилання на елементи). У <code>list</code>, <code>map</code> і <code>set</code> додавання нічого не інвалідує, а видалення інвалідує лише ітератори на видалений елемент. Саме ця стійкість і є головною причиною вибрати вузловий контейнер. Запам'ятати правило можна так: хто зберігає елементи одним суцільним блоком, тому ітератори тендітні; хто виділяє окремий вузол, тому ітератори стійкі.",
      "Класичне застосування: видалення в циклі. Цикл <code>for (auto it = v.begin(); it != v.end(); ++it) if (...) v.erase(it);</code> помилковий, бо після <code>erase</code> ітератор <code>it</code> недійсний, а ми його ще й посуваємо. Правильно користуватися тим, що <code>erase(it)</code> <b>повертає ітератор на наступний елемент</b>: <code>it = v.erase(it)</code>, а <code>++it</code> виконувати лише в гілці, де нічого не видалили. Те саме працює для <code>list</code>, <code>map</code> і <code>set</code>.",
      "Для вектора такий цикл правильний, але повільний: кожне видалення зсуває хвіст, разом квадратичний час. Тому існує ідіома <b>remove-erase</b>: <code>v.erase(std::remove(v.begin(), v.end(), x), v.end())</code>. Алгоритм <code>std::remove</code> не видаляє по-справжньому, адже не знає про контейнер: він пересуває потрібні елементи на початок, а ті, що лишилися, залишає в «хвості» у невизначеному стані, і повертає ітератор на початок цього хвоста. Розмір вектора не змінюється. Лише потім <code>erase(новий_кінець, v.end())</code> фактично відкидає хвіст. Для умови є <code>std::remove_if</code> із лямбдою.",
      "Ідіома має типові пастки. Якщо забути другий аргумент і написати <code>v.erase(std::remove(...))</code>, видаляється лише один елемент, і це UB, коли знайдено нічого. Не можна застосовувати <code>remove</code> до <code>map</code> і <code>set</code>: їхні елементи не присвоюються, код не скомпілюється, і там користуються циклом із <code>it = m.erase(it)</code>. У <code>list</code> є власні методи <code>remove</code> і <code>remove_if</code>, які видаляють справді. У C++20 додано <code>std::erase(v, x)</code> та <code>std::erase_if(v, pred)</code>, що роблять ідіому одним викликом.",
      "Загальне правило безпеки: після будь-якої зміни контейнера не користуйтеся ітераторами, отриманими до неї, якщо не знаєте напевно правил його інвалідації; або отримуйте ітератор заново, або тримайте індекс. Наступний урок про власні компаратори й хеші покаже, як навчити контейнери порівнювати власні типи."
    ],
    code: [
      raw`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3, 2, 4, 2};
    auto newEnd = std::remove(v.begin(), v.end(), 2);
    std::cout << "після remove розмір ще " << v.size() << "\n";
    std::cout << "потрібних елементів " << (newEnd - v.begin()) << "\n";
    for (auto it = v.begin(); it != newEnd; ++it) std::cout << *it << " ";
    std::cout << "\n";
    v.erase(newEnd, v.end());
    std::cout << "після erase розмір " << v.size() << "\n";
    return 0;
}
`,
      raw`#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<int> nums{1, 2, 3, 4, 5, 6, 7, 8};
    nums.erase(std::remove_if(nums.begin(), nums.end(), [](int x) { return x % 2 == 0; }), nums.end());
    for (int x : nums) std::cout << x << " ";
    std::cout << "\n";

    std::vector<std::string> names{"Ola", "", "Ivan", ""};
    names.erase(std::remove(names.begin(), names.end(), std::string()), names.end());
    std::cout << names.size() << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <list>
#include <vector>

int main() {
    std::vector<int> v{10, 15, 20, 25, 30};
    for (auto it = v.begin(); it != v.end();) {
        if (*it % 2 == 0) {
            it = v.erase(it);  // erase повертає наступний елемент
        } else {
            ++it;
        }
    }
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";

    std::list<int> l{1, 2, 3, 4, 5};
    l.remove(3);                              // метод списку видаляє справді
    l.remove_if([](int x) { return x > 4; });
    for (int x : l) std::cout << x << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> stock{{"apple", 0}, {"pear", 4}, {"fig", 0}, {"plum", 7}};
    for (auto it = stock.begin(); it != stock.end();) {
        if (it->second == 0) {
            it = stock.erase(it);  // видаляємо порожні позиції
        } else {
            ++it;
        }
    }
    for (const auto& [name, qty] : stock) std::cout << name << "=" << qty << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`// не компілюється: елементи map мають const-ключ і не присвоюються, remove_if до map не застосовний
#include <algorithm>
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> stock{{"apple", 0}, {"pear", 4}};
    stock.erase(std::remove_if(stock.begin(), stock.end(),
                               [](const auto& kv) { return kv.second == 0; }),
                stock.end());
    std::cout << stock.size() << "\n";
    return 0;
}
`
    ],
    note: "Змінення контейнера може інвалідувати ітератори: vector при перевиділенні втрачає всі, вузлові контейнери стійкі. У циклі пишіть it = v.erase(it); для vector є ідіома v.erase(std::remove(...), v.end()).",
    work: "Видалення за умовою зі списків завдань, фільтрація записів, очищення кешу: усе це видалення в циклі. Помилка з недійсним ітератором дає непередбачувані збої, які проявляються не одразу, тому ідіому треба знати напам'ять.",
    tasks: [
      "Чому std::remove не зменшує розмір вектора й що треба зробити після нього?",
      "Як правильно видаляти елементи за умовою в циклі for з ітератором і чому ++it після erase помилковий?"
    ]
  },
  {
    t: "Власні компаратори й хеші для контейнерів",
    ch: "Колекції",
    adv: true,
    easy: "Компаратор це правило, за яким бібліотекар розставляє книги: за назвою, за автором чи за роком. Хеш це правило, яке підказує, до якої полиці віднести книгу; обидва правила мусять узгоджуватися з тим, що означає «та сама книга».",
    p: [
      "Упорядковані контейнери <code>map</code> і <code>set</code> розставляють елементи за допомогою порівняння: за замовчуванням <code>std::less&lt;T&gt;</code>, тобто оператор <code>&lt;</code>. Для чисел і рядків він готовий, а для власних типів його немає: <code>std::set&lt;Point&gt;</code> без нього не скомпілюється. Є два шляхи: перевантажити <code>operator&lt;</code> для типу або передати компаратор шаблонним параметром контейнера.",
      "Компаратор це клас (чи лямбда) із <code>operator()</code>, що отримує два елементи й повертає <code>true</code>, якщо перший має стояти раніше. Другим шаблонним параметром <code>set</code> його передають як тип: <code>std::set&lt;int, std::greater&lt;int&gt;&gt;</code> зберігає за спаданням. Власний компаратор оформлюють структурою: <code>struct ByLen { bool operator()(const std::string&amp; a, const std::string&amp; b) const { return a.size() &lt; b.size(); } };</code>, а в контейнері пишуть <code>std::set&lt;std::string, ByLen&gt;</code>. Слово <code>const</code> після дужок обов'язкове.",
      "Головна вимога: компаратор має задавати <b>строгий слабкий порядок</b>. Це означає: <code>comp(a, a)</code> завжди хибне; якщо <code>comp(a, b)</code> істинне, то <code>comp(b, a)</code> хибне; і «рівність» (коли ні <code>comp(a, b)</code>, ні <code>comp(b, a)</code>) транзитивна. Порівняння <code>&lt;=</code> цю вимогу порушує і дає UB. Також ключ ідентифікується порівнянням, а не оператором <code>==</code>: у <code>set</code> з компаратором <code>ByLen</code> слова «кіт» і «пес» однакової довжини вважаються тим самим елементом, і друге просто не вставиться.",
      "Для складених ключів зручно використати <code>std::tie</code>: <code>return std::tie(a.x, a.y) &lt; std::tie(b.x, b.y);</code>. Кортеж порівнюється лексикографічно, тож усе робиться рядком і без помилок у ручних <code>if</code>. Так само задають порядок для структури, перевантажуючи <code>operator&lt;</code> один раз, і тоді <code>sort</code>, <code>set</code> і <code>map</code> працюватимуть із типом без додаткових параметрів.",
      "Невпорядковані контейнери <code>unordered_map</code> і <code>unordered_set</code> потребують не порядку, а <b>хеша</b> й рівності. Хеш це функція, що перетворює ключ на число, за яким обирається «кошик». Для власного типу пишуть структуру з <code>size_t operator()(const T&amp;) const</code> і передають її як параметр: <code>std::unordered_set&lt;Point, PointHash&gt;</code>. Також потрібен <code>operator==</code> для типу (або власний предикат рівності четвертим параметром).",
      "Хеш має узгоджуватися з рівністю: <b>якщо a == b, то хеші мусять збігатися</b>; зворотне не обов'язкове (колізії дозволені). Складені значення хешують комбінуванням: беруть <code>std::hash</code> кожного поля й змішують, наприклад <code>h1 ^ (h2 + 0x9e3779b9 + (h1 &lt;&lt; 6) + (h1 &gt;&gt; 2))</code>. Простий XOR двох однакових полів дає нуль, тому голий <code>h1 ^ h2</code> погано розподіляє значення. Погана хеш-функція не ламає програму, а лише сповільнює пошук до лінійного.",
      "Не покладайтеся на порядок обходу <code>unordered_*</code>: він залежить від реалізації й хеша, тому перевіряйте наявність і кількість, а не порядок виводу. Лямбду можна передати як компаратор лише через <code>decltype</code> і конструктор (<code>std::set&lt;int, decltype(cmp)&gt; s(cmp)</code>), тому для довгоживучих типів структура зручніша. Наступний урок завершує главу алгоритмами для впорядкованих послідовностей: partition, unique, rotate і бінарний пошук."
    ],
    code: [
      raw`#include <functional>
#include <iostream>
#include <set>
#include <string>

struct ByLen {
    bool operator()(const std::string& a, const std::string& b) const {
        return a.size() < b.size();
    }
};

int main() {
    std::set<int, std::greater<int>> desc{3, 1, 4, 1, 5};
    for (int x : desc) std::cout << x << " ";
    std::cout << "\n";

    std::set<std::string, ByLen> byLen;
    byLen.insert("kiwi");
    byLen.insert("fig");
    byLen.insert("pear");  // довжина 4 вже є: той самий елемент
    byLen.insert("banana");
    for (const auto& s : byLen) std::cout << s << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <map>
#include <set>
#include <tuple>

struct Point {
    int x;
    int y;
};

bool operator<(const Point& a, const Point& b) {
    return std::tie(a.x, a.y) < std::tie(b.x, b.y);
}

int main() {
    std::set<Point> pts{{2, 1}, {1, 5}, {1, 2}, {2, 1}};
    for (const auto& p : pts) std::cout << "(" << p.x << "," << p.y << ") ";
    std::cout << "\n";
    std::map<Point, std::string> names;
    names[{0, 0}] = "origin";
    std::cout << names.count({0, 0}) << names.count({1, 1}) << "\n";
    return 0;
}
`,
      raw`#include <cstddef>
#include <functional>
#include <iostream>
#include <unordered_set>

struct Point {
    int x;
    int y;
};

bool operator==(const Point& a, const Point& b) {
    return a.x == b.x && a.y == b.y;
}

struct PointHash {
    std::size_t operator()(const Point& p) const {
        std::size_t h1 = std::hash<int>()(p.x);
        std::size_t h2 = std::hash<int>()(p.y);
        return h1 ^ (h2 + 0x9e3779b9 + (h1 << 6) + (h1 >> 2));
    }
};

int main() {
    std::unordered_set<Point, PointHash> seen;
    seen.insert({1, 2});
    seen.insert({3, 4});
    seen.insert({1, 2});  // дубль
    std::cout << "унікальних: " << seen.size() << "\n";
    std::cout << std::boolalpha << (seen.count({3, 4}) == 1) << " " << (seen.count({9, 9}) == 1) << "\n";
    return 0;
}
`,
      raw`#include <iostream>
#include <map>
#include <string>

// порівняння без урахування регістру (лише ASCII)
struct NoCase {
    bool operator()(const std::string& a, const std::string& b) const {
        std::size_t n = a.size() < b.size() ? a.size() : b.size();
        for (std::size_t i = 0; i < n; ++i) {
            char x = static_cast<char>(a[i] | 0x20);
            char y = static_cast<char>(b[i] | 0x20);
            if (x != y) return x < y;
        }
        return a.size() < b.size();
    }
};

int main() {
    std::map<std::string, int, NoCase> m;
    m["Apple"] = 1;
    m["apple"] += 10;  // той самий ключ
    m["Banana"] = 2;
    for (const auto& [k, v] : m) std::cout << k << "=" << v << "\n";
    return 0;
}
`,
      raw`// не компілюється: для std::set<Point> немає оператора < , порівняти елементи нічим
#include <iostream>
#include <set>

struct Point {
    int x;
    int y;
};

int main() {
    std::set<Point> pts;
    pts.insert({1, 2});
    std::cout << pts.size() << "\n";
    return 0;
}
`
    ],
    note: "map і set порівнюють елементи компаратором зі строгим слабким порядком (не &lt;=). unordered_* потребують хеша й ==, причому рівні ключі мусять давати однаковий хеш. Порядок unordered не друкуйте.",
    work: "Ключі-структури (точки сітки, пари id, дати) і нестандартні порядки (без регістру, за довжиною, за пріоритетом) трапляються постійно. Власний компаратор чи хеш дає змогу тримати їх у словнику й множині без обхідних шляхів.",
    tasks: [
      "Яку вимогу має виконувати компаратор для set і чому порівняння &lt;= її порушує?",
      "Який зв'язок має існувати між оператором == і хешем у unordered_set для власного типу?"
    ]
  },
  {
    t: "Алгоритми: partition, unique, rotate і lower_bound",
    ch: "Колекції",
    adv: true,
    easy: "Partition це розділити людей на дві групи за ознакою. Unique це прибрати дублікати, що стоять поруч. Rotate це прокрутити карусель. Lower_bound це розгорнути телефонну книгу посередині й швидко знайти потрібну сторінку.",
    p: [
      "Крім <code>sort</code> і <code>find</code>, стандартна бібліотека має алгоритми для типових перетворень послідовності. Усі вони, як і раніше, працюють із діапазоном ітераторів і не змінюють розміру контейнера: нову межу вони повертають, а видаляти хвіст має <code>erase</code>. Цей урок показує чотири найкорисніші ідеї.",
      "<code>std::partition(first, last, pred)</code> переставляє елементи так, що всі, для яких <code>pred</code> істинний, опиняються попереду, а решта ззаду. Повертає ітератор на початок другої групи. Відносний порядок усередині груп <b>не гарантується</b>. Якщо порядок важливий, є <code>std::stable_partition</code>, що його зберігає (трохи повільніший). Це основа швидкого сортування та зручний спосіб відокремити, скажімо, парні числа від непарних, не пишучи двох циклів.",
      "<code>std::unique(first, last)</code> прибирає <b>сусідні</b> дублікати: з групи однакових поспіль елементів лишає один. Повертає новий кінець, як <code>remove</code>, тож застосовується разом з <code>erase</code>: <code>v.erase(std::unique(v.begin(), v.end()), v.end())</code>. Ключове слово «сусідні»: у послідовності <code>1 2 1</code> нічого не зміниться. Тому для видалення всіх дублікатів вектор спершу сортують (<code>sort</code>, потім <code>unique</code> і <code>erase</code>); це найпоширеніший спосіб зробити вектор множиною унікальних значень.",
      "<code>std::rotate(first, middle, last)</code> циклічно зсуває елементи так, що <code>middle</code> стає першим: <code>1 2 3 4 5</code> із <code>middle</code> на «3» стає <code>3 4 5 1 2</code>. Повертає ітератор на нове місце колишнього першого елемента. Операція змінює вміст на місці без допоміжної пам'яті й корисна для зсуву вікна, циклічного буфера, переміщення елемента на нову позицію (зсув підінтервалу).",
      "<code>std::lower_bound(first, last, x)</code> виконує <b>бінарний пошук</b> у вже відсортованому діапазоні: повертає ітератор на перший елемент, що <b>не менший</b> за <code>x</code>. <code>std::upper_bound</code> повертає перший, <b>більший</b> за <code>x</code>. Різниця між ними це діапазон рівних елементів, його одразу дає <code>std::equal_range</code>. Швидкість логарифмічна: мільйон елементів це приблизно двадцять кроків, тоді як лінійний <code>find</code> може перебрати все. <code>std::binary_search</code> лише відповідає «є чи нема» (<code>bool</code>).",
      "Пастки. Бінарні алгоритми вимагають відсортованості саме за тим порядком, який ви їм передаєте: на несортованих даних результат безглуздий (формально UB). Результат <code>lower_bound</code> це ітератор, а не індекс і не значення: його порівнюють із <code>end()</code> і лише потім розіменовують, а індекс беруть через віднімання <code>it - v.begin()</code>. Для <code>map</code> і <code>set</code> краще користуватися їхніми методами <code>lower_bound</code>/<code>upper_bound</code>, які використовують структуру дерева; загальний алгоритм на них працював би повільно.",
      "Усе це приклади того, що в стандартній бібліотеці вже є відповідь на більшість запитів до послідовності. Звикайте шукати ім'я алгоритму, а не писати цикл. На цьому глава про колекції завершена: ви вмієте вибирати контейнер, обходити його ітераторами, застосовувати алгоритми й пояснювати, коли ітератори стають недійсними. Наступна глава відкриває власні типи: структури й класи."
    ],
    code: [
      raw`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3, 4, 5, 6, 7, 8};
    auto mid = std::stable_partition(v.begin(), v.end(), [](int x) { return x % 2 == 0; });
    std::cout << "парних: " << (mid - v.begin()) << "\n";
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{3, 1, 3, 3, 2, 1, 2};
    auto bad = v;
    bad.erase(std::unique(bad.begin(), bad.end()), bad.end());  // без sort: лишаються не-сусіди
    std::cout << "без sort: " << bad.size() << " елементів\n";

    std::sort(v.begin(), v.end());
    v.erase(std::unique(v.begin(), v.end()), v.end());
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3, 4, 5};
    std::rotate(v.begin(), v.begin() + 2, v.end());  // 3 став першим
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";

    // перенести останній елемент на початок
    std::rotate(v.begin(), v.end() - 1, v.end());
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";
    return 0;
}
`,
      raw`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 3, 3, 3, 5, 8, 13};  // відсортований
    auto lo = std::lower_bound(v.begin(), v.end(), 3);
    auto hi = std::upper_bound(v.begin(), v.end(), 3);
    std::cout << "трійки з " << (lo - v.begin()) << " по " << (hi - v.begin()) << "\n";
    std::cout << "кількість: " << (hi - lo) << "\n";

    auto it = std::lower_bound(v.begin(), v.end(), 6);
    if (it != v.end()) std::cout << "перше >= 6: " << *it << "\n";
    std::cout << std::boolalpha << std::binary_search(v.begin(), v.end(), 8) << " "
              << std::binary_search(v.begin(), v.end(), 9) << "\n";
    auto range = std::equal_range(v.begin(), v.end(), 3);
    std::cout << (range.second - range.first) << "\n";
    return 0;
}
`,
      raw`// не компілюється: lower_bound повертає ітератор, а не індекс, int з нього не виходить
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 3, 5, 7};
    int idx = std::lower_bound(v.begin(), v.end(), 5);
    std::cout << idx << "\n";
    return 0;
}
`
    ],
    note: "partition ділить на дві групи, unique прибирає лише сусідні дублікати (спершу sort), rotate зсуває циклічно, lower_bound шукає бінарно в відсортованих даних і повертає ітератор, а не індекс.",
    work: "Sort+unique дає унікальні значення, lower_bound швидко знаходить позицію в упорядкованих даних (ціни, часові мітки), partition відокремлює відфільтровані записи без другого вектора, rotate зсуває вікно чи переставляє елемент.",
    tasks: [
      "Чому unique не прибере всі дублікати у послідовності 1 2 1 і що треба зробити перед ним?",
      "Що повертає lower_bound і які вимоги до діапазону, у якому він шукає?"
    ]
  }
];
