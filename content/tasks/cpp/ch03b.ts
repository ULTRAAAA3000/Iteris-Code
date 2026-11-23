// Практичні завдання глави «Колекції», частина b (уроки 25–31). Запускаються на сервері, результат перевіряється за stdout.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_03b: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-pair-tuple", lesson: "cpp/25", xp: 25,
    title: "Кошик покупок: tuple, pair і структуровані зв'язування",
    context: "Функції часто повертають кілька значень, а записи з трьох-чотирьох полів не варто оформлювати окремою структурою. Для цього є pair і tuple, а зв'язування робить код читабельним.",
    brief: [
      "Кошик це вектор кортежів <code>(назва, кількість, ціна)</code>. Допишіть цикл зі <b>структурованим зв'язуванням</b> <code>[name, qty, price]</code>: для кожного рядка виведіть <code>name: qty x price = сума</code> і накопичте <code>total</code>.",
      "Також допишіть <code>price_range</code>: вона повертає <code>std::pair</code> з мінімальною й максимальною ціною. У <code>main</code> розкладіть результат на <code>lo</code> і <code>hi</code> і виведіть <code>Мін: 40, макс: 120</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <tuple>
#include <utility>
#include <vector>

// TODO 1: поверніть пару {мінімальна ціна, максимальна ціна}
std::pair<int, int> price_range(const std::vector<std::tuple<std::string, int, int>>& items) {
    return {0, 0};
}

int main() {
    std::vector<std::tuple<std::string, int, int>> items = {
        {"tea", 3, 40}, {"coffee", 2, 55}, {"cake", 1, 120}};

    int total = 0;
    // TODO 2: обійдіть items циклом зі структурованим зв'язуванням [name, qty, price],
    // виведіть "name: qty x price = сума" і додайте суму до total

    std::cout << "Разом: " << total << "\n";

    // TODO 3: розкладіть результат price_range на lo і hi структурованим зв'язуванням
    int lo = 0, hi = 0;
    std::cout << "Мін: " << lo << ", макс: " << hi << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок для tea", has: "tea: 3 x 40 = 120", hint: "Сума рядка це кількість, помножена на ціну." },
      { on: "stdout", name: "Підсумок кошика", has: "Разом: 350", hint: "Додавайте суму кожного рядка до total всередині циклу." },
      { on: "stdout", name: "Діапазон цін", has: "Мін: 40, макс: 120", hint: "price_range має пройти всі ціни й запам'ятати найменшу та найбільшу." },
      { on: "stdout", name: "Повний вивід збігається", equals: "tea: 3 x 40 = 120\ncoffee: 2 x 55 = 110\ncake: 1 x 120 = 120\nРазом: 350\nМін: 40, макс: 120", hint: "Дотримуйтеся формату з завдання: один рядок на товар, потім підсумок і діапазон." },
      { on: "source", name: "Використано структуроване зв'язування", matches: "auto\\s*&?\\s*\\[\\s*\\w+\\s*,\\s*\\w+", hint: "Запишіть auto [name, qty, price] замість std::get." },
    ],
  },
  {
    ...base, id: "cpp-iterator-walk", lesson: "cpp/26", xp: 25,
    title: "Подорож списком за допомогою ітераторів",
    context: "Ітератор це спільний спосіб рухатися будь-яким контейнером. З list індексів немає, тому обхід, пошук позиції й підсумок доводиться робити саме ітераторами.",
    brief: [
      "Дано <code>std::list&lt;int&gt; nums</code>. Виведіть елементи через пробіл, обходячи список <b>ітератором</b> від <code>begin()</code> до <code>end()</code>.",
      "Потім виведіть третій елемент (ітератор через <code>std::next</code>), позицію числа 7 (<code>std::find</code> і <code>std::distance</code>) і суму всіх елементів. Формат: <code>Третій: 12</code>, <code>Позиція 7: 3</code>, <code>Сума: 35</code>.",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <list>

int main() {
    std::list<int> nums = {5, 8, 12, 7, 3};

    // TODO 1: виведіть елементи через пробіл циклом з ітератором (begin, end, ++, *)
    std::cout << "\n";

    // TODO 2: ітератор на третій елемент отримайте через std::next
    std::cout << "Третій: " << 0 << "\n";

    // TODO 3: знайдіть 7 через std::find; якщо не end(), виведіть std::distance від begin
    std::cout << "Позиція 7: " << -1 << "\n";

    // TODO 4: підсумуйте елементи циклом з ітератором
    int sum = 0;
    std::cout << "Сума: " << sum << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Обхід списку", has: "5 8 12 7 3", hint: "Розділяйте елементи пробілом, але не ставте пробіл після останнього." },
      { on: "stdout", name: "Третій елемент", has: "Третій: 12", hint: "std::next(nums.begin(), 2) пересуває ітератор на два кроки." },
      { on: "stdout", name: "Позиція числа 7", has: "Позиція 7: 3", hint: "std::distance(nums.begin(), знайдений_ітератор) дає номер від нуля." },
      { on: "stdout", name: "Повний вивід збігається", equals: "5 8 12 7 3\nТретій: 12\nПозиція 7: 3\nСума: 35", hint: "Чотири рядки в порядку з завдання." },
      { on: "source", name: "Є цикл з ітератором", matches: "\\+\\+\\s*\\w+\\s*\\)|\\w+\\s*\\+\\+\\s*\\)", hint: "Цикл for з auto it = nums.begin(); it != nums.end(); ++it." },
    ],
  },
  {
    ...base, id: "cpp-stl-algorithms", lesson: "cpp/27", xp: 40,
    title: "STL: sort, count_if, find і transform",
    context: "Стандартна бібліотека вже містить сортування, пошук, підрахунок і перетворення. Лямбда-вираз коротко описує, як порівнювати елементи чи яку умову перевіряти: за довжиною, ціною чи датою.",
    brief: [
      "Відсортуйте <code>words</code> через <code>std::sort</code> із лямбдою: спершу за довжиною (коротші першими), за однакової довжини за алфавітом. Виведіть слова в один рядок через пробіл. Потім виведіть <code>Всього літер: 24</code> (<code>std::accumulate</code> із <code>&lt;numeric&gt;</code>).",
      "Далі <code>Довгих слів: 3</code> (<code>std::count_if</code>: довших за 4 літери), <code>apple на позиції 2</code> (<code>std::find</code> і <code>std::distance</code>) і рядок <code>Довжини: 3 4 5 6 6</code>, який заповніть через <code>std::transform</code> і <code>std::back_inserter</code>.",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <numeric>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> words = {"banana", "kiwi", "apple", "fig", "cherry"};

    // TODO 1: std::sort із лямбдою: за довжиною, за однакової довжини за алфавітом
    for (std::size_t i = 0; i < words.size(); ++i) {
        if (i) std::cout << " ";
        std::cout << words[i];
    }
    std::cout << std::endl;

    // TODO 2: сумарна довжина слів через std::accumulate
    int total = 0;
    std::cout << "Всього літер: " << total << std::endl;

    // TODO 3: скільки слів довших за 4 літери (std::count_if)
    long longer = 0;
    std::cout << "Довгих слів: " << longer << std::endl;

    // TODO 4: позиція "apple" через std::find і std::distance
    long pos = -1;
    std::cout << "apple на позиції " << pos << std::endl;

    // TODO 5: заповніть lens довжинами слів через std::transform і std::back_inserter
    std::vector<int> lens;
    std::cout << "Довжини:";
    for (int n : lens) std::cout << " " << n;
    std::cout << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Слова відсортовано за довжиною й алфавітом", has: "fig kiwi apple banana cherry", hint: "Якщо довжини різні, порівнюйте довжини; інакше самі рядки." },
      { on: "stdout", name: "Сума літер", has: "Всього літер: 24", hint: "accumulate з початковим 0 і лямбдою, що додає розмір слова." },
      { on: "stdout", name: "Довгі слова й позиція", matches: "Довгих слів: 3\\napple на позиції 2", hint: "count_if рахує слова з size() > 4; find шукає слово, distance дає позицію." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "fig kiwi apple banana cherry\nВсього літер: 24\nДовгих слів: 3\napple на позиції 2\nДовжини: 3 4 5 6 6", hint: "П'ять рядків у порядку з завдання." },
      { on: "source", name: "Використано лямбду в sort", matches: "sort\\([^;]*\\[[^\\]]*\\]\\s*\\(", hint: "Третім аргументом sort передайте лямбду [](...) { ... }." },
      { on: "source", name: "Використано transform", has: "transform(", hint: "transform записує результат у вектор через std::back_inserter(lens)." },
    ],
  },
  {
    ...base, id: "cpp-word-freq", lesson: "cpp/28", xp: 30,
    title: "Частотний словник слів",
    context: "Підрахунок частот лежить в основі аналізу журналів, рейтингів і пошукових індексів. Скелет завжди той самий: розбити текст, порахувати в map, упорядкувати результат.",
    brief: [
      "Текст уже лежить у <code>std::istringstream</code>. Порахуйте слова: у циклі <code>while (in &gt;&gt; word)</code> збільшуйте <code>freq[word]</code>.",
      "Скопіюйте <code>freq</code> у вектор пар і відсортуйте лямбдою: частіші слова першими, за однакової частоти за алфавітом. Виведіть по рядку <code>слово: кількість</code>.",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

int main() {
    std::istringstream in("the cat and the dog and the bird");

    std::map<std::string, int> freq;
    std::string word;
    while (in >> word) {
        // TODO 1: збільшіть лічильник слова в freq
    }

    // TODO 2: скопіюйте freq у вектор пар
    std::vector<std::pair<std::string, int>> items;

    // TODO 3: відсортуйте items лямбдою: частіші першими, за однакової частоти за алфавітом

    for (const auto& [w, n] : items) {
        std::cout << w << ": " << n << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Найчастіше слово перше", has: "the: 3\nand: 2", hint: "Сортуйте за спаданням другого поля пари (a.second > b.second)." },
      { on: "stdout", name: "Однакова частота: за алфавітом", has: "bird: 1\ncat: 1\ndog: 1", hint: "Додайте другий критерій: за рівних лічильників порівнюйте слова." },
      { on: "stdout", name: "Повний вивід збігається", equals: "the: 3\nand: 2\nbird: 1\ncat: 1\ndog: 1", hint: "По одному рядку на слово, формат «слово: кількість»." },
      { on: "source", name: "Лічильник через map", matches: "freq\\s*\\[\\s*\\w+\\s*\\]", hint: "freq[word]++ створює запис із нулем і збільшує його." },
    ],
  },
  {
    ...base, id: "cpp-erase-remove", lesson: "cpp/29", xp: 35,
    title: "Видалення за умовою: remove-erase і erase в циклі",
    context: "Видалити з контейнера елементи за умовою (прострочені записи, порожні лоти) потрібно постійно. Наївний цикл з erase ламає ітератори, тому треба знати дві безпечні ідіоми.",
    brief: [
      "У <code>vector</code> приберіть усі парні числа ідіомою <code>v.erase(std::remove_if(...), v.end())</code>. Очікуваний вивід: <code>7 3 5</code>.",
      "У <code>map</code> залишків видаліть записи з нульовою кількістю циклом з ітератором: <code>it = stock.erase(it)</code>, інакше <code>++it</code>. Очікуваний вивід: <code>kiwi:2 pear:4</code>.",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>

int main() {
    std::vector<int> v = {4, 7, 10, 3, 8, 5, 12};
    // TODO 1: приберіть парні числа ідіомою erase + remove_if

    for (std::size_t i = 0; i < v.size(); ++i) {
        if (i) std::cout << " ";
        std::cout << v[i];
    }
    std::cout << "\n";

    std::map<std::string, int> stock = {{"apple", 0}, {"pear", 4}, {"plum", 0}, {"kiwi", 2}};
    // TODO 2: циклом з ітератором видаліть записи з нульовою кількістю (it = stock.erase(it))

    bool first = true;
    for (const auto& [name, qty] : stock) {
        if (!first) std::cout << " ";
        first = false;
        std::cout << name << ":" << qty;
    }
    std::cout << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Парні видалено з вектора", has: "7 3 5", hint: "remove_if лише пересуває потрібні елементи, а erase відтинає хвіст." },
      { on: "stdout", name: "Нульові залишки видалено з map", has: "kiwi:2 pear:4", hint: "erase повертає ітератор на наступний елемент: присвойте його it." },
      { on: "stdout", name: "Повний вивід збігається", equals: "7 3 5\nkiwi:2 pear:4", hint: "Два рядки: вектор, потім map." },
      { on: "source", name: "Є remove_if і erase", matches: "erase\\([\\s\\S]*remove_if|remove_if[\\s\\S]*erase\\(", hint: "Поєднайте v.erase(...) з std::remove_if(...)." },
      { on: "source", name: "erase у циклі присвоює ітератор", matches: "=\\s*\\w+\\.erase\\(", hint: "Напишіть it = stock.erase(it);" },
    ],
  },
  {
    ...base, id: "cpp-custom-compare", lesson: "cpp/30", xp: 40,
    title: "Власні компаратор і хеш для точок",
    context: "Ключі-структури (точки сітки, пари id, дати) і нестандартний порядок трапляються постійно. Компаратор і хеш дозволяють тримати їх у set та unordered_set без обхідних шляхів.",
    brief: [
      "Допишіть компаратор <code>ByXY</code> (спершу за <code>x</code>, за рівних <code>x</code> за <code>y</code>) і створіть <code>std::set&lt;Point, ByXY&gt;</code> із точок (2,3), (1,5), (2,1), (1,5). Виведіть <code>Точок: 3</code>, а другим рядком точки через пробіл у вигляді <code>(x,y)</code>.",
      "Допишіть <code>PointHash</code> і <code>PointEq</code> та створіть <code>std::unordered_set</code>: вставте (2,3), (1,5), (2,3). Виведіть <code>Унікальних: 2</code> і <code>Є (1,5): 1</code> (результат <code>count</code>). Рядок про <code>words</code> уже готовий.",
    ],
    starter: raw`#include <cstddef>
#include <functional>
#include <iostream>
#include <set>
#include <string>
#include <unordered_set>

struct Point {
    int x;
    int y;
};

// TODO 1: компаратор ByXY: спершу за x, за рівних x за y (строге порівняння)
struct ByXY {
};

struct ByLen {
    bool operator()(const std::string& a, const std::string& b) const {
        return a.size() < b.size();
    }
};

// TODO 2: PointHash (поєднайте хеші x і y) та PointEq (порівняння x і y)
struct PointHash {
};
struct PointEq {
};

int main() {
    // TODO 3: створіть std::set<Point, ByXY> pts із {2, 3}, {1, 5}, {2, 1}, {1, 5};
    // виведіть "Точок: N" і точки у вигляді (x,y) через пробіл у другому рядку
    std::cout << "Точок: " << 0 << "\n";
    std::cout << "\n";

    std::set<std::string, ByLen> words = {"cat", "dog", "bird", "fish", "ox"};
    bool first = true;
    for (const auto& w : words) {
        if (!first) std::cout << " ";
        first = false;
        std::cout << w;
    }
    std::cout << "\n";

    // TODO 4: unordered_set<Point, PointHash, PointEq>: вставте (2,3), (1,5), (2,3) і виведіть розмір та seen.count({1, 5})
    std::cout << "Унікальних: " << 0 << "\n";
    std::cout << "Є (1,5): " << 0 << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Дублікат у set не додано", has: "Точок: 3", hint: "Точки з однаковими x і y вважаються однаковими, вдруге не вставляться." },
      { on: "stdout", name: "Точки впорядковані за x, потім за y", has: "(1,5) (2,1) (2,3)", hint: "Порівнюйте x; лише коли вони рівні, порівнюйте y." },
      { on: "stdout", name: "unordered_set без дублікатів", has: "Унікальних: 2\nЄ (1,5): 1", hint: "Потрібні хеш, що поєднує x і y, і оператор рівності." },
      { on: "stdout", name: "Повний вивід збігається", equals: "Точок: 3\n(1,5) (2,1) (2,3)\nox cat bird\nУнікальних: 2\nЄ (1,5): 1", hint: "Рядок з words не змінюйте: він пояснює, чому dog зникає." },
      { on: "source", name: "Використано власний хеш", has: "unordered_set<Point, PointHash", hint: "Другим і третім параметрами шаблону передайте PointHash і PointEq." },
    ],
  },
  {
    ...base, id: "cpp-algo-partition", lesson: "cpp/31", xp: 45,
    title: "Sort+unique, lower_bound, partition і rotate",
    context: "Унікальні значення, бінарний пошук позиції, розділення на групи та циклічний зсув закривають більшість задач із впорядкованими послідовностями без зайвих циклів і додаткових векторів.",
    brief: [
      "Приберіть із <code>v</code> дублікати: спершу <code>std::sort</code>, потім <code>v.erase(std::unique(...), v.end())</code>. Знайдіть <code>std::lower_bound</code> для числа 4 і виведіть індекс: <code>Позиція 4: 2</code>.",
      "Розділіть <code>mix</code> через <code>std::partition</code> (парні перед непарними) і виведіть, скільки парних: <code>Парних: 3</code>. Нарешті зсуньте <code>r</code> вліво на 2 через <code>std::rotate</code>: очікується <code>3 4 5 1 2</code>.",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

void print(const std::vector<int>& v) {
    for (std::size_t i = 0; i < v.size(); ++i) {
        if (i) std::cout << " ";
        std::cout << v[i];
    }
    std::cout << "\n";
}

int main() {
    std::vector<int> v = {5, 3, 5, 1, 3, 9, 1};
    // TODO 1: відсортуйте v і приберіть дублікати (sort, потім erase + unique)
    print(v);

    // TODO 2: lower_bound для 4 у v; виведіть індекс через std::distance
    long idx = -1;
    std::cout << "Позиція 4: " << idx << "\n";

    std::vector<int> mix = {1, 2, 3, 4, 5, 6};
    // TODO 3: std::partition: парні перед непарними; виведіть, скільки парних (distance до точки розділу)
    long evens = 0;
    std::cout << "Парних: " << evens << "\n";

    std::vector<int> r = {1, 2, 3, 4, 5};
    // TODO 4: циклічно зсуньте r вліво на 2 через std::rotate
    print(r);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Дублікати прибрано", has: "1 3 5 9", hint: "unique прибирає лише сусідні дублікати, тому спершу відсортуйте." },
      { on: "stdout", name: "Позиція lower_bound", has: "Позиція 4: 2", hint: "lower_bound повертає ітератор; індекс це std::distance(v.begin(), it)." },
      { on: "stdout", name: "Кількість парних і зсув", has: "Парних: 3\n3 4 5 1 2", hint: "partition повертає точку розділу; rotate(first, middle, last) робить middle першим." },
      { on: "stdout", name: "Повний вивід збігається", equals: "1 3 5 9\nПозиція 4: 2\nПарних: 3\n3 4 5 1 2", hint: "Чотири рядки в порядку з завдання." },
      { on: "source", name: "Використано unique і rotate", matches: "unique\\([\\s\\S]*rotate\\(", hint: "Потрібні std::unique та std::rotate." },
    ],
  },
];
