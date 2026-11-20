// Практичні завдання глави «Колекції», частина a (уроки 18–24). Запускаються на сервері, результат перевіряється за stdout.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_03a: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-array-stats", lesson: "cpp/18", xp: 20,
    title: "std::array: розмір, сума, максимум і зворотний обхід",
    context: "std::array замінює C-масив: розмір входить у тип і не губиться при передачі у функцію. Типова робота з ним це обхід, підсумки та пошук екстремумів.",
    brief: [
      "У <code>main</code> уже є <code>std::array&lt;int, 6&gt; a</code>. Допишіть <code>sum</code> і <code>maxOf</code>, які приймають масив за <code>const</code>-посиланням, і виведіть чотири рядки: <code>Розмір: 6</code>, <code>Сума: 108</code>, <code>Максимум: 42</code> та <code>Зворотний: 42 23 16 15 8 4</code>.",
      "Розмір беріть із методу <code>size()</code>, а зворотний порядок виведіть циклом за індексом від кінця (<code>at()</code> або <code>[]</code>).",
    ],
    starter: raw`#include <array>
#include <iostream>

using Arr = std::array<int, 6>;

int sum(const Arr& a) {
    // TODO: додайте всі елементи
    return 0;
}

int maxOf(const Arr& a) {
    // TODO: знайдіть найбільший елемент
    return 0;
}

int main() {
    Arr a = {4, 8, 15, 16, 23, 42};
    std::cout << "Розмір: " << 0 << "\n";  // TODO: a.size()
    std::cout << "Сума: " << sum(a) << "\n";
    std::cout << "Максимум: " << maxOf(a) << "\n";
    std::cout << "Зворотний:";
    // TODO: виведіть елементи від останнього до першого, кожен із пробілом перед ним
    std::cout << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Розмір береться з масиву: 6", has: "Розмір: 6", hint: "Замініть 0 на a.size(): розмір є частиною типу std::array." },
      { on: "stdout", name: "Сума дорівнює 108", has: "Сума: 108", hint: "Пройдіть по масиву циклом for (int x : a) і накопичуйте суму в змінній." },
      { on: "stdout", name: "Максимум дорівнює 42", has: "Максимум: 42", hint: "Почніть із a[0] і оновлюйте змінну, коли зустрінете більший елемент." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Розмір: 6\nСума: 108\nМаксимум: 42\nЗворотний: 42 23 16 15 8 4", hint: "Рядок «Зворотний:» має містити елементи від останнього до першого, кожен після пробілу." },
      { on: "source", name: "Використано std::array", has: "std::array", hint: "Масив має лишатися std::array, а не C-масивом." },
    ],
  },
  {
    ...base, id: "cpp-vector-string", lesson: "cpp/19", xp: 25,
    title: "vector: сума, парні числа і перевернутий рядок",
    context: "vector це динамічний масив, який росте разом з даними, а std::string є звичайним рядком із зручними методами. Разом вони покривають більшість повсякденних даних.",
    brief: [
      "Допишіть <code>sum(const std::vector&lt;int&gt;&amp; v)</code>, <code>evens(const std::vector&lt;int&gt;&amp; v)</code> (новий вектор із парних, метод <code>push_back</code>) і <code>reversed(std::string s)</code> (<code>std::reverse</code> з <code>&lt;algorithm&gt;</code>).",
      "Формат виводу вже написаний у <code>main</code>: <code>Сума: …</code>, <code>Парні: …</code> і перевернуте слово.",
    ],
    starter: raw`#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

int sum(const std::vector<int>& v) {
    // TODO
    return 0;
}

std::vector<int> evens(const std::vector<int>& v) {
    // TODO: push_back для парних
    return {};
}

std::string reversed(std::string s) {
    // TODO: std::reverse
    return s;
}

int main() {
    std::vector<int> nums = {5, 2, 9, 7, 4, 10, 3, 8};
    std::cout << "Сума: " << sum(nums) << std::endl;
    std::cout << "Парні:";
    for (int n : evens(nums)) std::cout << " " << n;
    std::cout << std::endl;
    std::cout << reversed("Cpp") << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума: 48", has: "Сума: 48", hint: "Пройдіть по вектору циклом for (int n : v) і додавайте n до змінної total." },
      { on: "stdout", name: "Парні: 2 4 10 8", has: "Парні: 2 4 10 8", hint: "Парне число це n % 2 == 0; порядок елементів має лишитися вихідним." },
      { on: "stdout", name: "Перевернутий рядок: ppC", has: "ppC", hint: "std::reverse(s.begin(), s.end()) змінює рядок на місці." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Сума: 48\nПарні: 2 4 10 8\nppC", hint: "Не додавайте зайвих рядків: формат виводу вже є в main." },
      { on: "source", name: "Елементи додаються через push_back", has: "push_back(", hint: "Новий вектор наповнюйте методом push_back." },
    ],
  },
  {
    ...base, id: "cpp-vector-edit", lesson: "cpp/20", xp: 25,
    title: "Вектор: видалення, вставка і pop_back",
    context: "Дані рідко лишаються незмінними: записи видаляють, вставляють, відкидають останній. Уміння правильно стерти елементи під час обходу це щоденна робота з vector.",
    brief: [
      "Вектор <code>v</code> містить числа з мінусами. Видаліть усі від'ємні (<code>erase</code> у циклі за індексом, індекс збільшуйте лише коли нічого не стерли), потім вставте <code>0</code> на початок (<code>insert</code>) і відкиньте останній елемент (<code>pop_back</code>).",
      "Після кожного кроку викличте готову <code>show</code>. Наприкінці виведіть <code>Розмір: 5</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <vector>

void show(const std::string& label, const std::vector<int>& v) {
    std::cout << label << ":";
    for (int x : v) std::cout << " " << x;
    std::cout << "\n";
}

int main() {
    std::vector<int> v = {3, -1, 4, -1, 5, -9, 2, 6};
    // TODO 1: видаліть усі від'ємні елементи (erase), потім show("Без від'ємних", v)
    // TODO 2: вставте 0 на початок (insert), потім show("З нулем", v)
    // TODO 3: приберіть останній елемент (pop_back), потім show("Без останнього", v)
    std::cout << "Розмір: " << v.size() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Від'ємні видалено", has: "Без від'ємних: 3 4 5 2 6", hint: "Цикл for (size_t i = 0; i < v.size();): якщо v[i] < 0, викличте v.erase(v.begin() + i), інакше ++i." },
      { on: "stdout", name: "Нуль вставлено на початок", has: "З нулем: 0 3 4 5 2 6", hint: "v.insert(v.begin(), 0) додає елемент перед першим." },
      { on: "stdout", name: "Останній елемент прибрано", has: "Без останнього: 0 3 4 5 2", hint: "pop_back() видаляє останній елемент і нічого не повертає." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Без від'ємних: 3 4 5 2 6\nЗ нулем: 0 3 4 5 2 6\nБез останнього: 0 3 4 5 2\nРозмір: 5", hint: "Перевірте, що show викликається рівно тричі й у правильному порядку." },
      { on: "source", name: "Використано erase і pop_back", matches: "erase\\([\\s\\S]*pop_back\\(", hint: "Видалення робіть через erase, а останній елемент через pop_back." },
    ],
  },
  {
    ...base, id: "cpp-map-stock", lesson: "cpp/21", xp: 25,
    title: "map: склад із додаванням, оновленням і пошуком",
    context: "Словник ключ-значення потрібен скрізь: склад, налаштування, оцінки. Головне вміти додати запис, змінити його й перевірити наявність ключа так, щоб випадково не створити зайвий запис.",
    brief: [
      "У <code>std::map&lt;std::string, int&gt; stock</code> уже є <code>apple</code> і <code>pear</code>. Додайте <code>plum</code> зі значенням 7 через <code>[]</code>, збільште <code>pear</code> на 3, а наявність <code>kiwi</code> перевірте через <code>find</code> (не через <code>[]</code>!).",
      "Виведіть усі записи у форматі <code>ключ: значення</code> (map сам їх упорядкує), далі <code>kiwi: none</code> і <code>records: 3</code>.",
    ],
    starter: raw`#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> stock = {{"apple", 5}, {"pear", 2}};
    // TODO 1: додайте "plum" зі значенням 7
    // TODO 2: збільште "pear" на 3
    for (const auto& [name, qty] : stock) std::cout << name << ": " << qty << "\n";
    // TODO 3: через find перевірте "kiwi": якщо немає, виведіть "kiwi: none"
    std::cout << "records: " << stock.size() << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "plum додано", has: "plum: 7", hint: "stock[\"plum\"] = 7; створить запис зі значенням 7." },
      { on: "stdout", name: "pear збільшено до 5", has: "pear: 5", hint: "stock[\"pear\"] += 3; змінює наявне значення." },
      { on: "stdout", name: "kiwi перевірено без створення запису", has: "records: 3", hint: "Для перевірки використайте stock.find(\"kiwi\") == stock.end(): оператор [] створив би четвертий запис." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "apple: 5\npear: 5\nplum: 7\nkiwi: none\nrecords: 3", hint: "Записи йдуть за алфавітом ключів; рядок про kiwi виведіть після обходу." },
      { on: "source", name: "Пошук через find", has: "find(", hint: "Наявність ключа перевіряйте методом find." },
    ],
  },
  {
    ...base, id: "cpp-set-unique", lesson: "cpp/22", xp: 25,
    title: "set і multiset: унікальні значення й підрахунок",
    context: "Прибрати дублікати й швидко перевірити, чи елемент є в наборі, доводиться постійно: унікальні відвідувачі, теги, ідентифікатори. set робить це сам, а multiset зберігає повтори.",
    brief: [
      "З вектора <code>data</code> побудуйте <code>std::set&lt;int&gt;</code> і виведіть унікальні значення за зростанням, їхню кількість, наявність 9 і 7 (через <code>count</code>). Потім побудуйте <code>std::multiset&lt;int&gt;</code> і виведіть, скільки разів зустрічається 5.",
      "Формат: <code>Унікальні: 1 3 5 9</code>, <code>Кількість: 4</code>, <code>Є 9: так</code>, <code>Є 7: ні</code>, <code>П'ятірок: 3</code>.",
    ],
    starter: raw`#include <iostream>
#include <set>
#include <vector>

int main() {
    std::vector<int> data = {5, 3, 5, 1, 3, 9, 1, 5};
    // TODO 1: std::set<int> unique із елементів data (конструктор з begin/end)
    std::cout << "Унікальні:";
    // TODO 2: виведіть елементи unique, кожен із пробілом перед ним
    std::cout << "\n";
    std::cout << "Кількість: " << 0 << "\n";
    std::cout << "Є 9: " << "?" << "\n";  // TODO: так/ні через count(9)
    std::cout << "Є 7: " << "?" << "\n";  // TODO: так/ні через count(7)
    // TODO 3: multiset<int> з data
    std::cout << "П'ятірок: " << 0 << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Унікальні значення за зростанням", has: "Унікальні: 1 3 5 9", hint: "std::set<int> unique(data.begin(), data.end()); дублікати відкинуться, порядок буде зростаючим." },
      { on: "stdout", name: "Кількість унікальних: 4", has: "Кількість: 4", hint: "Розмір набору дає unique.size()." },
      { on: "stdout", name: "Перевірка членства", has: "Є 9: так\nЄ 7: ні", hint: "unique.count(9) повертає 1 або 0: використайте його в умові." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Унікальні: 1 3 5 9\nКількість: 4\nЄ 9: так\nЄ 7: ні\nП'ятірок: 3", hint: "Для останнього рядка multiset зберігає всі повтори: його count(5) дасть 3." },
      { on: "source", name: "Використано multiset", has: "std::multiset", hint: "Кількість повторів рахуйте через std::multiset." },
    ],
  },
  {
    ...base, id: "cpp-unordered-count", lesson: "cpp/23", xp: 30,
    title: "unordered_map: лічильник і перший повтор",
    context: "Хеш-таблиця дає пошук за ключем у середньому за сталий час: лічильники слів, дедуплікація, кеші. Порядок обходу не гарантовано, тож вивід треба будувати за відомим списком ключів.",
    brief: [
      "Пройдіть по <code>words</code> і порахуйте повтори в <code>std::unordered_map&lt;std::string, int&gt;</code>. Одночасно за допомогою <code>std::unordered_set&lt;std::string&gt;</code> знайдіть перше слово-повтор: те, що вже траплялося раніше.",
      "Порядок <code>unordered_*</code> не друкуйте: виведіть лічильники для ключів <code>red</code>, <code>blue</code>, <code>green</code>, <code>black</code> у цьому порядку (відсутній ключ це 0, <b>без</b> створення запису через <code>[]</code> у виводі), потім <code>Різних: 3</code> і <code>Перший повтор: red</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

int main() {
    std::vector<std::string> words = {"red", "blue", "red", "green", "blue", "red"};
    std::unordered_map<std::string, int> count;
    std::unordered_set<std::string> seen;
    std::string firstRepeat;
    for (const auto& w : words) {
        // TODO: збільште count[w]; якщо w уже є в seen і firstRepeat порожній, запам'ятайте w; додайте w до seen
    }
    for (const std::string key : {"red", "blue", "green", "black"}) {
        auto it = count.find(key);
        std::cout << key << ": " << 0 << "\n";  // TODO: it->second або 0, якщо ключа немає
        (void)it;
    }
    std::cout << "Різних: " << count.size() << "\n";
    std::cout << "Перший повтор: " << firstRepeat << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Лічильники слів", has: "red: 3\nblue: 2\ngreen: 1\nblack: 0", hint: "У циклі робіть ++count[w]; а для виводу використовуйте find: відсутній ключ дає 0." },
      { on: "stdout", name: "Різних слів: 3", has: "Різних: 3", hint: "Якщо вивід black звернувся до count[\"black\"], запис створився й різних стало 4: читайте через find." },
      { on: "stdout", name: "Перший повтор", has: "Перший повтор: red", hint: "Перед додаванням до seen перевірте seen.count(w): якщо слово там уже є, це повтор." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "red: 3\nblue: 2\ngreen: 1\nblack: 0\nРізних: 3\nПерший повтор: red", hint: "Кожен рядок формату «ключ: число», порядок ключів задано в main." },
      { on: "source", name: "Використано unordered_set", has: "seen.insert", hint: "Запам'ятовуйте переглянуті слова методом insert у unordered_set seen." },
    ],
  },
  {
    ...base, id: "cpp-stack-brackets", lesson: "cpp/24", xp: 30,
    title: "stack: перевірка парних дужок",
    context: "Стек природно розв'язує вкладеність: дужки у виразах, теги в розмітці, виклики функцій. Остання відкрита дужка має закритися першою, а саме так поводиться std::stack.",
    brief: [
      "Допишіть <code>bool balanced(const std::string&amp; s)</code> зі <code>std::stack&lt;char&gt;</code>: відкриваючі дужки <code>( [ {</code> кладіть на стек, а закриваючі звіряйте з вершиною (перед <code>top()</code> і <code>pop()</code> перевіряйте <code>empty()</code>). Наприкінці стек має бути порожнім.",
      "<code>main</code> друкує <code>ok</code> або <code>bad</code> для кожного тестового рядка.",
    ],
    starter: raw`#include <iostream>
#include <stack>
#include <string>
#include <vector>

bool balanced(const std::string& s) {
    std::stack<char> st;
    for (char c : s) {
        // TODO: відкриваюча дужка: push; закриваюча: перевірити вершину та зробити pop
        (void)c;
    }
    return true;  // TODO: стек має бути порожнім
}

int main() {
    std::vector<std::string> tests = {"(a[b]{c})", "(]", "((", "", "())"};
    for (const auto& t : tests) std::cout << (balanced(t) ? "ok" : "bad") << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Правильна вкладеність це ok", has: "ok\nbad", hint: "Рядок (a[b]{c}) має дати ok, а (] дає bad: закриваюча дужка не відповідає вершині." },
      { on: "stdout", name: "Незакриті дужки це bad", has: "bad\nbad\nok", hint: "Рядок «((» закінчується непорожнім стеком; порожній рядок це ok." },
      { on: "stdout", name: "Зайва закриваюча дужка", equals: "ok\nbad\nbad\nok\nbad", hint: "Для «())» стек стає порожнім раніше, ніж приходить остання дужка: перевірте empty() перед top()." },
      { on: "source", name: "Використано std::stack", has: "std::stack<char>", hint: "Дужки відстежуйте через std::stack<char>." },
    ],
  },
];
