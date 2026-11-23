export const LESSONS_07b = [
  {
    t: "atomic: прості лічильники без блокувань",
    ch: "Паралелізм",
    easy: "Звичайна змінна це дошка в класі: двоє пишуть одночасно, і вийде каша. std::atomic це лічильник на турнікеті метро: кожне проходження рахується цілою неподільною дією, і два пасажири ніколи не зіб'ють рахунок один одному.",
    p: [
      "У попередніх уроках лічильник, до якого пишуть кілька потоків, ми захищали мʼютексом. Це працює, але для однієї цілої змінної мʼютекс надмірний: потік засинає в черзі, щоб лише додати одиницю. Для таких випадків у <code>&lt;atomic&gt;</code> є тип <code>std::atomic&lt;T&gt;</code>. Його операції неподільні: інший потік бачить значення або до операції, або після, але ніколи посередині. Тому одночасне збільшення з багатьох потоків не є гонкою даних.",
      "Модель у голові: усередині <code>std::atomic&lt;int&gt;</code> лежить звичайне число, але кожен доступ до нього компілятор і процесор виконують особливою неподільною інструкцією. Ви не берете й не віддаєте мʼютекс: потік просто виконує операцію й іде далі. Тому слово «без блокувань» у назві уроку означає, що ніхто не чекає на замок. Це не значить, що операція безкоштовна: вона повільніша за звичайну, бо процесорам треба узгодити значення між ядрами.",
      "Основні операції. <code>load()</code> читає значення, <code>store(x)</code> записує. Оператори <code>++</code>, <code>--</code>, <code>+=</code> теж неподільні, а <code>fetch_add(n)</code> і <code>fetch_sub(n)</code> додатково повертають значення <b>до</b> зміни. <code>exchange(x)</code> записує нове й повертає старе. Явне перетворення в число і запис через <code>=</code> теж працюють, тож <code>std::cout &lt;&lt; counter</code> просто виконує <code>load()</code>.",
      "Найкорисніша операція це <code>compare_exchange_strong(expected, desired)</code>. Вона каже: якщо значення зараз дорівнює <code>expected</code>, замін його на <code>desired</code> і поверни <code>true</code>; інакше нічого не змінюй, запиши фактичне значення в <code>expected</code> і поверни <code>false</code>. Із цього будують «цикл повтору»: прочитали, обчислили нове, спробували замінити, а якщо хтось устиг раніше, повторили з оновленим значенням. Так, наприклад, оновлюють спільний максимум без мʼютекса.",
      "Ідіоми. Для лічильників, прапорців «зупинись» і «готово» беріть <code>std::atomic</code>. Прапорець зупинки зазвичай <code>std::atomic&lt;bool&gt;</code>: один потік пише <code>true</code>, інші в циклі перевіряють його. Читайте результат у головному потоці після <code>join</code>, і вивід буде детермінованим. Типи <code>std::atomic&lt;int&gt;</code>, <code>bool</code>, вказівники й інші прості типи підтримуються всіма компіляторами.",
      "Пастки. По-перше, атомарною є одна операція, а не послідовність: <code>if (c.load() &lt; 10) c.fetch_add(1)</code> дві окремі операції, між якими інший потік встигне вклинитися, тож перевірка й дія розійдуться. Потрібен <code>compare_exchange</code> або мʼютекс. По-друге, <code>std::atomic</code> не копіюється: копіювання однієї атомарної змінної в іншу не має сенсу, і компілятор це забороняє. По-третє, два атомарні поля в структурі самі по собі не гарантують узгодженості між собою.",
      "Атомарні змінні добре захищають одне значення. Якщо ж інваріант охоплює кілька змінних, наприклад два рахунки, сума яких не повинна змінитися, потрібен мʼютекс, а разом із ним нова небезпека: потоки можуть заблокувати один одного назавжди. Про це, і про те, як цього уникнути, наступний урок.",
    ],
    code: [
      String.raw`#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::atomic<int> counter{0};
    std::vector<std::thread> threads;
    for (int t = 0; t < 4; ++t) {
        threads.emplace_back([&counter] {
            for (int i = 0; i < 10000; ++i) ++counter;
        });
    }
    for (auto& th : threads) th.join();
    std::cout << "counter = " << counter << "\n";
    return 0;
}
`,
      String.raw`#include <atomic>
#include <iostream>

int main() {
    std::atomic<int> a{10};
    int before = a.fetch_add(5);
    std::cout << "fetch_add: було " << before << ", стало " << a.load() << "\n";

    int old = a.exchange(7);
    std::cout << "exchange: було " << old << ", стало " << a.load() << "\n";

    int expected = 7;
    bool ok = a.compare_exchange_strong(expected, 100);
    std::cout << "cas(7->100): " << ok << ", тепер " << a.load() << "\n";

    expected = 7;
    ok = a.compare_exchange_strong(expected, 5);
    std::cout << "cas(7->5): " << ok << ", фактичне " << expected << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: std::atomic не можна копіювати (копіювальний конструктор видалено)
#include <atomic>
#include <iostream>

int main() {
    std::atomic<int> a{1};
    std::atomic<int> b = a;
    std::cout << b.load() << "\n";
    return 0;
}
`,
      String.raw`#include <atomic>
#include <iostream>
#include <thread>

int main() {
    std::atomic<bool> started{false};
    std::atomic<bool> stop{false};
    long spins = 0;

    std::thread worker([&] {
        while (!stop.load()) {
            ++spins;
            started.store(true);
        }
    });

    while (!started.load()) std::this_thread::yield();
    stop.store(true);
    worker.join();

    std::cout << "робітник зупинено, ітерацій було: " << (spins > 0 ? "більше нуля" : "нуль") << "\n";
    return 0;
}
`,
      String.raw`#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

void update_max(std::atomic<int>& m, int value) {
    int current = m.load();
    while (current < value && !m.compare_exchange_weak(current, value)) {
        // CAS не вдався: current уже оновлено актуальним значенням, пробуємо знову
    }
}

int main() {
    std::atomic<int> best{0};
    std::vector<std::thread> threads;
    for (int t = 0; t < 4; ++t) {
        threads.emplace_back([&best, t] {
            for (int i = 0; i < 5; ++i) update_max(best, t * 10 + i);
        });
    }
    for (auto& th : threads) th.join();
    std::cout << "максимум = " << best.load() << "\n";
    return 0;
}
`,
    ],
    note: "Атомарною є одна операція, а не пара «перевірив і зробив»: <code>if (c.load() &lt; 10) ++c</code> усе ще гонка. Для умовних змін беріть <code>compare_exchange</code> у циклі, а для кількох змінних разом мʼютекс.",
    work: "Запустіть п'ять потоків, кожен додає по 20000 до спільного <code>std::atomic&lt;long&gt;</code> лічильника. Після <code>join</code> виведіть підсумок із головного потоку, а потім повторіть з одним потоком і порівняйте результати.",
    tasks: [
      "Чому <code>if (c.load() &lt; 10) c.fetch_add(1);</code> не гарантує, що лічильник ніколи не перевищить 10, хоча кожна операція окремо атомарна?",
      "Що робить <code>compare_exchange_strong(expected, desired)</code>, коли поточне значення не дорівнює <code>expected</code>, і навіщо це потрібно для циклу повтору?",
    ],
  },
  {
    t: "Взаємне блокування й scoped_lock",
    ch: "Паралелізм",
    adv: true,
    easy: "Два водії заїхали на вузький міст із двох боків і впираються бамперами. Кожен чекає, поки поступиться інший, тож не рушить ніхто й ніколи. Так само два потоки тримають по одному замку й чекають на чужий.",
    p: [
      "Мʼютекс захищає дані, але додає ризик: потік, що чекає на замок, не робить нічого. Якщо потік А тримає замок 1 і чекає на замок 2, а потік Б тримає замок 2 і чекає на замок 1, обидва чекатимуть вічно. Це <b>взаємне блокування</b> (deadlock). Програма не падає й не друкує помилки, вона просто зависає, і відтворити таке на вашому комп'ютері буває важко, бо все залежить від того, у якому порядку планувальник запустив потоки.",
      "Класичний приклад: переказ грошей між двома рахунками. Кожен рахунок має свій мʼютекс. Переказ A→B блокує спершу A, потім B. Одночасний переказ B→A блокує спершу B, потім A. Якщо кожен потік устиг узяти свій перший замок, далі вони впираються один в одного. Для такої гонки досить двох потоків і двох замків. Тому такі програми не запускають навмисно: у першому прикладі нижче код лише показано, а виконується безпечний варіант.",
      "Дві умови роблять deadlock можливим: потік тримає один замок і просить другий, а різні потоки просять замки в різному порядку. Прибрати треба хоча б одну умову. Перший спосіб: домовитися про єдиний порядок захоплення (наприклад, за адресою або номером рахунку). Другий спосіб: захоплювати всі замки одним неподільним викликом, який сам вирішує, як уникнути взаємної блокади.",
      "Саме це робить <code>std::scoped_lock</code> із C++17: <code>std::scoped_lock lock(a.m, b.m);</code> захоплює обидва мʼютекси разом за алгоритмом, що не допускає deadlock, незалежно від порядку аргументів, і відпускає їх у деструкторі. Це той самий RAII, що й у <code>lock_guard</code>, але для кількох замків. З одним мʼютексом <code>scoped_lock</code> поводиться як <code>lock_guard</code>, тож його можна писати скрізь за замовчуванням.",
      "До C++17 для цього використовували <code>std::lock(a.m, b.m)</code>, а потім <code>std::lock_guard</code> з параметром <code>std::adopt_lock</code>: він каже «замок уже взято, лише відпусти в кінці». У старому коді ви ще зустрінете цей запис. Є також <code>try_lock()</code>: він не чекає, а одразу повертає <code>false</code>, якщо замок зайнятий. Це дає змогу відступити й повторити спробу замість вічного очікування.",
      "Пастки. По-перше, <code>scoped_lock</code> розвʼязує проблему лише для замків, які ви берете в одному виклику: якщо потік тримає замок 1 і окремим викликом просить замок 2, порядок знову має значення. По-друге, повторне блокування того самого звичайного мʼютекса в одному потоці це невизначена поведінка. По-третє, не викликайте чужий код (колбеки) під замком: невідомо, які замки він візьме. Ідіома: тримайте замок якомога коротше й беріть усе потрібне разом.",
      "Ми навмисно уникали гонок і блокад, але досі не говорили про те, чому один потік узагалі бачить записи іншого і в якому порядку. Це питання моделі памʼяті: про неї наступний урок.",
    ],
    code: [
      String.raw`// фрагмент: ПРИКЛАД deadlock, не запускайте (зависає назавжди)
#include <mutex>
#include <thread>

std::mutex m1, m2;

int main() {
    std::thread a([] {
        std::lock_guard<std::mutex> l1(m1);   // тримає m1
        std::this_thread::yield();
        std::lock_guard<std::mutex> l2(m2);   // чекає на m2
    });
    std::thread b([] {
        std::lock_guard<std::mutex> l2(m2);   // тримає m2
        std::this_thread::yield();
        std::lock_guard<std::mutex> l1(m1);   // чекає на m1: взаємне блокування
    });
    a.join();
    b.join();
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <thread>

struct Account {
    std::mutex m;
    int balance;
};

void transfer(Account& from, Account& to, int amount) {
    std::scoped_lock lock(from.m, to.m);
    from.balance -= amount;
    to.balance += amount;
}

int main() {
    Account a{{}, 10000};
    Account b{{}, 10000};

    std::thread t1([&] { for (int i = 0; i < 1000; ++i) transfer(a, b, 3); });
    std::thread t2([&] { for (int i = 0; i < 1000; ++i) transfer(b, a, 1); });
    t1.join();
    t2.join();

    std::cout << "a = " << a.balance << ", b = " << b.balance << "\n";
    std::cout << "сума = " << a.balance + b.balance << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <thread>

struct Account {
    std::mutex m;
    int balance;
};

void transfer(Account& from, Account& to, int amount) {
    std::lock(from.m, to.m);
    std::lock_guard<std::mutex> g1(from.m, std::adopt_lock);
    std::lock_guard<std::mutex> g2(to.m, std::adopt_lock);
    from.balance -= amount;
    to.balance += amount;
}

int main() {
    Account a{{}, 500};
    Account b{{}, 500};
    std::thread t1([&] { for (int i = 0; i < 500; ++i) transfer(a, b, 2); });
    std::thread t2([&] { for (int i = 0; i < 500; ++i) transfer(b, a, 1); });
    t1.join();
    t2.join();
    std::cout << a.balance << " " << b.balance << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <thread>

int main() {
    std::mutex m;
    m.lock();

    bool while_locked = true;
    std::thread other([&] { while_locked = m.try_lock(); });
    other.join();
    std::cout << "try_lock, поки замок зайнятий: " << while_locked << "\n";

    m.unlock();

    bool after_unlock = false;
    std::thread again([&] {
        after_unlock = m.try_lock();
        if (after_unlock) m.unlock();
    });
    again.join();
    std::cout << "try_lock після unlock: " << after_unlock << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: lock_guard не можна копіювати чи переміщувати (замок має одного власника)
#include <iostream>
#include <mutex>

int main() {
    std::mutex m;
    std::lock_guard<std::mutex> a(m);
    std::lock_guard<std::mutex> b = a;
    std::cout << "unreachable\n";
    return 0;
}
`,
    ],
    note: "Deadlock потребує двох замків, узятих у різному порядку. Лікування: брати всі замки разом через <code>std::scoped_lock(a, b)</code> або завжди в одному порядку. Не викликайте невідомий код під замком.",
    work: "Опишіть структуру <code>Account</code> з мʼютексом і функцію <code>transfer</code> на <code>std::scoped_lock</code>. Запустіть два потоки, що переказують гроші у протилежних напрямках по 1000 разів, і виведіть обидва баланси та їхню суму.",
    tasks: [
      "Які дві обставини разом дають взаємне блокування двох потоків, і яка з них усувається в <code>std::scoped_lock(a.m, b.m)</code>?",
      "Чим <code>try_lock()</code> відрізняється від <code>lock()</code> і як це допомагає уникнути вічного очікування?",
    ],
  },
  {
    t: "Модель пам'яті й memory_order",
    ch: "Паралелізм",
    adv: true,
    easy: "Кухар кладе страву на вікно видачі й дзвонить у дзвіночок. Офіціант, почувши дзвінок, гарантовано бачить страву. Без цього сигналу він міг би підійти до порожнього вікна. memory_order це правила такого дзвіночка між потоками.",
    p: [
      "Досі ми вважали, що запис одного потоку видно іншому одразу й у тому самому порядку. Насправді компілятор і процесор мають право переставляти операції та тримати значення в кешах, якщо в межах одного потоку результат не змінюється. Інший потік може побачити записи в іншому порядку. <b>Модель памʼяті</b> C++ описує, які гарантії ви отримуєте, і дає інструмент керування: параметр <code>std::memory_order</code> в атомарних операціях.",
      "Модель у голові: між потоками діє відношення «відбувається раніше». Якщо потік А записав дані, а потім виконав <b>release</b>-запис в атомарну змінну, а потік Б прочитав це значення <b>acquire</b>-читанням, то все, що А зробив до запису, гарантовано видно Б після читання. Це пара «відправив» і «отримав», як дзвіночок на кухні. Звичайні (неатомарні) дані при цьому передаються безпечно, бо порядок задано через атомарний прапорець.",
      "Основні режими. <code>memory_order_seq_cst</code> це режим за замовчуванням: усі потоки бачать усі атомарні операції в одному спільному порядку. Він найпростіший і найповільніший. <code>memory_order_release</code> застосовують до запису, <code>memory_order_acquire</code> до читання; вони утворюють пару, описану вище. <code>memory_order_relaxed</code> гарантує лише атомарність самої операції, без жодного порядку відносно інших змінних.",
      "Коли що брати. Лічильник, який лише рахує й нічого не публікує (кількість викликів, статистика), годиться на <code>relaxed</code>: важливий лише підсумок після <code>join</code>. Прапорець «дані готові» пара <code>release</code> + <code>acquire</code>. Простий спінлок: захоплення через <code>test_and_set(acquire)</code>, звільнення через <code>clear(release)</code>. А якщо ви сумніваєтеся, залишайте стандартний <code>seq_cst</code>: він завжди коректний.",
      "Спінлок на <code>std::atomic_flag</code> показує ідею повністю. <code>test_and_set</code> атомарно ставить прапорець і повертає, чи він уже стояв. Поки повертає <code>true</code>, хтось інший у критичній секції, і ми крутимося в циклі. Коли <code>clear</code> із <code>release</code> відпускає замок, наступний потік, що захопив його з <code>acquire</code>, бачить усі записи попереднього власника. Так працюють і справжні мʼютекси, тільки вони ще вміють спати замість кручення.",
      "Пастки. По-перше, <code>relaxed</code> на прапорці, за яким ви читаєте інші дані, ламає гарантію: дані можуть ще не бути видимими. По-друге, помилки з порядком майже не відтворюються: на x86 вони часто мовчать, а на ARM вилізають. Тест, що пройшов, нічого не доводить. По-третє, не вигадуйте власні схеми без потреби: починайте з мʼютекса, а послаблюйте порядок лише коли профілювання показало вузьке місце. Параметр <code>memory_order</code> не є цілим числом: передати <code>5</code> не вдасться.",
      "Далі ми повертаємося до практики: як зробити так, щоб кожен потік мав власну копію змінної й узагалі не потребував синхронізації, і як гарантовано виконати ініціалізацію рівно один раз. Про це наступний урок: <code>thread_local</code> і <code>once_flag</code>.",
    ],
    code: [
      String.raw`#include <atomic>
#include <iostream>
#include <thread>

int main() {
    int payload = 0;
    std::atomic<bool> ready{false};
    int seen = 0;

    std::thread producer([&] {
        payload = 42;
        ready.store(true, std::memory_order_release);
    });
    std::thread consumer([&] {
        while (!ready.load(std::memory_order_acquire)) std::this_thread::yield();
        seen = payload;
    });
    producer.join();
    consumer.join();

    std::cout << "споживач побачив: " << seen << "\n";
    return 0;
}
`,
      String.raw`#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::atomic<long> hits{0};
    std::vector<std::thread> threads;
    for (int t = 0; t < 4; ++t) {
        threads.emplace_back([&hits] {
            for (int i = 0; i < 25000; ++i) hits.fetch_add(1, std::memory_order_relaxed);
        });
    }
    for (auto& th : threads) th.join();
    std::cout << "hits = " << hits.load(std::memory_order_relaxed) << "\n";
    return 0;
}
`,
      String.raw`#include <atomic>
#include <iostream>
#include <thread>
#include <vector>

class SpinLock {
public:
    void lock() {
        while (flag_.test_and_set(std::memory_order_acquire)) {
            // зайнято: крутимося
        }
    }
    void unlock() { flag_.clear(std::memory_order_release); }

private:
    std::atomic_flag flag_ = ATOMIC_FLAG_INIT;
};

int main() {
    SpinLock lock;
    long total = 0;
    std::vector<std::thread> threads;
    for (int t = 0; t < 4; ++t) {
        threads.emplace_back([&] {
            for (int i = 0; i < 5000; ++i) {
                lock.lock();
                ++total;
                lock.unlock();
            }
        });
    }
    for (auto& th : threads) th.join();
    std::cout << "total = " << total << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: memory_order це перелік, а не ціле число
#include <atomic>
#include <iostream>

int main() {
    std::atomic<int> a{0};
    a.fetch_add(1, 2);
    std::cout << a.load() << "\n";
    return 0;
}
`,
    ],
    note: "Пара <code>release</code>-запис і <code>acquire</code>-читання передає видимість усіх попередніх записів. <code>relaxed</code> лише для незалежних лічильників. Не знаєте, що обрати, лишайте <code>seq_cst</code> за замовчуванням.",
    work: "Один потік записує у звичайну змінну число 7 і ставить <code>atomic&lt;bool&gt;</code> через <code>release</code>. Другий чекає на прапорець через <code>acquire</code>, копіює число. Після <code>join</code> виведіть його з головного потоку.",
    tasks: [
      "Що гарантує пара <code>store(release)</code> і <code>load(acquire)</code> для неатомарних даних, записаних до <code>store</code>?",
      "Чому для лічильника викликів достатньо <code>memory_order_relaxed</code>, а для прапорця «дані готові» його недостатньо?",
    ],
  },
  {
    t: "thread_local і once_flag",
    ch: "Паралелізм",
    adv: true,
    easy: "thread_local це особисті шафки в роздягальні: кожен потік має свою, і чужу не відкриє. once_flag це табличка «ремонт зроблено»: перший, хто прийшов, робить ремонт, решта лише бачать табличку й не чіпають.",
    p: [
      "Найкраща синхронізація та, якої не треба. Якщо кожен потік працює зі своєю копією даних, гонки неможливі, і замки зайві. Для цього є специфікатор <code>thread_local</code>: змінна з ним існує окремо в кожному потоці, народжується разом із потоком і зникає, коли потік завершується. Оголошення виглядає як <code>thread_local int counter = 0;</code>, а використовується як звичайна глобальна змінна.",
      "Модель у голові: глобальна змінна одна на всю програму, локальна одна на виклик функції, а <code>thread_local</code> одна на кожен потік. Збільшення такого лічильника в потоці А ніяк не зачіпає лічильник у потоці Б, навіть якщо в коді це одне імʼя. Головний потік теж має власну копію. Типові застосування: буфери й кеші, які не варто ділити, лічильники для статистики потоку, ідентифікатор поточного потоку в журналі.",
      "Друга задача: щось має бути ініціалізовано рівно один раз, хоч би скільки потоків одночасно цього захотіли (відкрити журнал, завантажити налаштування). Для цього є <code>std::once_flag</code> і <code>std::call_once(flag, функція)</code>. Перший потік, що дійшов, виконує функцію, решта чекають її завершення й пропускають виклик. Після повернення всі гарантовано бачать результат ініціалізації, без жодного вашого мʼютекса.",
      "Є й третій, найзручніший шлях: локальна <code>static</code> змінна у функції. Починаючи з C++11 стандарт гарантує, що її ініціалізує лише один потік, а інші чекають. Тому класичний «синглтон» пишеться як <code>static Config c = load();</code> усередині функції, що повертає посилання. Цю гарантію часто називають «magic statics».",
      "Що буде, якщо функція в <code>call_once</code> кине виняток? Тоді виклик вважається невдалим, прапорець залишається «не виконано», і наступний виклик <code>call_once</code> спробує ще раз. Це зручно: ініціалізація, що не вдалася, не отруює програму назавжди. Саме таку поведінку показує один із прикладів нижче в одному потоці, щоб вивід був детермінованим.",
      "Пастки. По-перше, <code>thread_local</code> не передає дані між потоками: те, що ви записали у своїй копії, інший потік не побачить, і головний потік не побачить підсумок робітників. Результати треба явно повернути (вектор із окремим слотом на потік, <code>future</code>). По-друге, <code>std::once_flag</code> не копіюється, як і мʼютекс. По-третє, ініціалізація <code>thread_local</code> змінних із конструкторами має вартість у кожному новому потоці, тож не робіть їх важкими.",
      "Ми вже знаємо потоки, замки, умовні змінні, атомарні змінні та спосіб ініціалізувати рівно раз. Залишається зібрати все докупи: не створювати новий потік для кожного маленького завдання, а тримати готових робітників і давати їм чергу роботи. Це власний пул потоків, і він у наступному, завершальному уроці глави.",
    ],
    code: [
      String.raw`#include <iostream>
#include <thread>
#include <vector>

thread_local int counter = 0;

void work(int times, int& result) {
    for (int i = 0; i < times; ++i) ++counter;
    result = counter;
}

int main() {
    int results[3] = {0, 0, 0};
    std::vector<std::thread> threads;
    for (int t = 0; t < 3; ++t) {
        threads.emplace_back(work, (t + 1) * 100, std::ref(results[t]));
    }
    for (auto& th : threads) th.join();

    for (int t = 0; t < 3; ++t) std::cout << "потік " << t << ": " << results[t] << "\n";
    std::cout << "головний потік: " << counter << "\n";
    return 0;
}
`,
      String.raw`#include <atomic>
#include <iostream>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

std::once_flag init_flag;
std::atomic<int> init_calls{0};
std::string config;

void ensure_config() {
    std::call_once(init_flag, [] {
        ++init_calls;
        config = "loaded";
    });
}

int main() {
    std::vector<std::thread> threads;
    for (int t = 0; t < 4; ++t) threads.emplace_back(ensure_config);
    for (auto& th : threads) th.join();

    std::cout << "config = " << config << "\n";
    std::cout << "ініціалізацій: " << init_calls.load() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <stdexcept>

std::once_flag flag;
int attempts = 0;

void init() {
    ++attempts;
    if (attempts == 1) throw std::runtime_error("перша спроба невдала");
    std::cout << "ініціалізація вдалася зі спроби " << attempts << "\n";
}

int main() {
    for (int i = 0; i < 3; ++i) {
        try {
            std::call_once(flag, init);
            std::cout << "виклик " << i + 1 << ": ок\n";
        } catch (const std::exception& e) {
            std::cout << "виклик " << i + 1 << ": виняток: " << e.what() << "\n";
        }
    }
    std::cout << "спроб було: " << attempts << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <thread>
#include <vector>

struct Settings {
    std::string name;
};

Settings& settings() {
    static Settings s = [] {
        std::cout << "створюю Settings\n";
        return Settings{"prod"};
    }();
    return s;
}

int main() {
    std::vector<const Settings*> seen(4, nullptr);
    std::vector<std::thread> threads;
    for (int t = 0; t < 4; ++t) {
        threads.emplace_back([&seen, t] { seen[t] = &settings(); });
    }
    for (auto& th : threads) th.join();

    bool same = true;
    for (auto* p : seen) same = same && (p == seen[0]);
    std::cout << "усі потоки бачать один об'єкт: " << same << "\n";
    std::cout << seen[0]->name << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: std::once_flag не можна копіювати
#include <iostream>
#include <mutex>

int main() {
    std::once_flag a;
    std::once_flag b = a;
    std::cout << "unreachable\n";
    return 0;
}
`,
    ],
    note: "<code>thread_local</code> дає кожному потоку власну копію, але і ховає її від інших: підсумки треба повертати явно. Одноразова ініціалізація це <code>call_once</code> або локальна <code>static</code> змінна.",
    work: "Оголосіть <code>thread_local int calls</code>. Запустіть два потоки: перший викликає функцію-лічильник 3 рази, другий 5 разів, кожен записує свій підсумок у власну змінну. Після <code>join</code> виведіть обидва числа й значення в головному потоці.",
    tasks: [
      "Чому підсумок, накопичений у <code>thread_local</code> змінній робітничого потоку, не видно в головному потоці, і як його звідти отримати?",
      "Що станеться з <code>std::once_flag</code>, якщо функція в <code>std::call_once</code> кинула виняток, і чим це зручно?",
    ],
  },
  {
    t: "Власний пул потоків",
    ch: "Паралелізм",
    adv: true,
    easy: "Піцерія тримає кількох кухарів на зміні й одну стрічку замовлень. Нове замовлення чіпляють на стрічку, вільний кухар бере наступне. Наймати нового кухаря під кожну піцу дорого, а так працівники завжди зайняті.",
    p: [
      "Запуск потоку коштує дорого: система виділяє стек і планує його. Якщо маленьких завдань тисячі, створення потоку під кожне з'їсть більше часу, ніж саме завдання, і до того ж можна впертися в ліміт потоків. Рішення: <b>пул потоків</b>. Ми створюємо фіксовану кількість робітників на старті, кладемо завдання в спільну чергу, а кожен робітник у циклі бере завдання й виконує його. Потоків небагато, і вони повторно використовуються.",
      "Модель у голові: три частини. Перша, черга <code>std::queue&lt;std::function&lt;void()&gt;&gt;</code>, у якій лежать готові до виконання завдання. Друга, мʼютекс, що охороняє чергу. Третя, <code>condition_variable</code>, на якій спочивають робітники, поки черга порожня. Метод <code>submit</code> кладе завдання під замком і будить одного робітника. Це поєднання всього, що ми вивчили в главі: потоки, мʼютекс, умовна змінна.",
      "Цикл робітника має чітку форму. Захопити <code>unique_lock</code>, чекати на умовній змінній за умови «є завдання або пул зупиняється», узяти завдання з голови черги, <b>відпустити замок</b> і лише тоді виконати. Якщо виконувати завдання під замком, решта робітників чекатимуть, і весь пул зводиться до одного потоку. Коли прапорець зупинки піднято й черга порожня, робітник виходить із циклу.",
      "Завершення потребує обережності, бо тут ховаються блокади. Деструктор пулу ставить прапорець <code>stop_</code> під мʼютексом, будить <b>усіх</b> робітників через <code>notify_all</code>, а потім виконує <code>join</code> для кожного. Якщо забути <code>notify_all</code>, робітники, що сплять, ніколи не прокинуться, і <code>join</code> зависне. Якщо змінювати <code>stop_</code> без замка, сигнал може проскочити повз робітника, що саме збирається заснути. Умова ж у <code>wait</code> дозволяє виконати залишок черги перед виходом.",
      "Часто потрібне й значення, яке повертає завдання. Тоді <code>submit</code> загортає виклик у <code>std::packaged_task</code> і повертає <code>std::future</code>, а в чергу кладе обгортку. Але <code>std::function</code> вимагає копіюваного об'єкта, а <code>packaged_task</code> лише переміщується. Тому його кладуть у <code>std::shared_ptr</code> і захоплюють цей вказівник у лямбді. Це стандартний прийом, який ви побачите в багатьох бібліотеках.",
      "Щоб вивід був детермінованим, завдання різних потоків не повинні друкувати самі: порядок їхнього виконання залежить від планувальника. Збирайте результати під мʼютексом у вектор, після завершення пулу відсортуйте й друкуйте з головного потоку. А з <code>future</code> порядок і так задаєте ви самі: читаєте їх у тому порядку, у якому подали завдання. Пастка: пул не розв'язує проблему спільних даних, захист усе одно ваш.",
      "На цьому закінчується глава про паралелізм: ви пройшли шлях від одного потоку з <code>join</code> до власного пулу, що поєднує мʼютекс, умовну змінну й <code>future</code>. Далі в курсі стандартна бібліотека: рядки, алгоритми й час, де ці знання знадобляться для обробки великих обсягів даних.",
    ],
    code: [
      String.raw`#include <atomic>
#include <cstddef>
#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::vector<int> input{1, 2, 3, 4, 5, 6, 7, 8};
    std::vector<int> output(input.size(), 0);
    std::atomic<std::size_t> next{0};

    auto worker = [&] {
        for (;;) {
            std::size_t i = next.fetch_add(1);
            if (i >= input.size()) return;
            output[i] = input[i] * input[i];
        }
    };

    std::vector<std::thread> threads;
    for (int t = 0; t < 3; ++t) threads.emplace_back(worker);
    for (auto& th : threads) th.join();

    for (int v : output) std::cout << v << " ";
    std::cout << "\n";
    return 0;
}
`,
      String.raw`#include <algorithm>
#include <condition_variable>
#include <functional>
#include <iostream>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>

class ThreadPool {
public:
    explicit ThreadPool(std::size_t n) {
        for (std::size_t i = 0; i < n; ++i) workers_.emplace_back([this] { run(); });
    }
    ~ThreadPool() {
        {
            std::lock_guard<std::mutex> lock(m_);
            stop_ = true;
        }
        cv_.notify_all();
        for (auto& w : workers_) w.join();
    }
    void submit(std::function<void()> job) {
        {
            std::lock_guard<std::mutex> lock(m_);
            jobs_.push(std::move(job));
        }
        cv_.notify_one();
    }

private:
    void run() {
        for (;;) {
            std::function<void()> job;
            {
                std::unique_lock<std::mutex> lock(m_);
                cv_.wait(lock, [this] { return stop_ || !jobs_.empty(); });
                if (jobs_.empty()) return;
                job = std::move(jobs_.front());
                jobs_.pop();
            }
            job();
        }
    }

    std::vector<std::thread> workers_;
    std::queue<std::function<void()>> jobs_;
    std::mutex m_;
    std::condition_variable cv_;
    bool stop_ = false;
};

int main() {
    std::vector<int> results;
    std::mutex results_mutex;
    {
        ThreadPool pool(3);
        for (int i = 1; i <= 8; ++i) {
            pool.submit([i, &results, &results_mutex] {
                std::lock_guard<std::mutex> lock(results_mutex);
                results.push_back(i * i);
            });
        }
    }
    std::sort(results.begin(), results.end());
    for (int v : results) std::cout << v << " ";
    std::cout << "\n";
    return 0;
}
`,
      String.raw`#include <condition_variable>
#include <functional>
#include <future>
#include <iostream>
#include <memory>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>

class ThreadPool {
public:
    explicit ThreadPool(std::size_t n) {
        for (std::size_t i = 0; i < n; ++i) workers_.emplace_back([this] { run(); });
    }
    ~ThreadPool() {
        {
            std::lock_guard<std::mutex> lock(m_);
            stop_ = true;
        }
        cv_.notify_all();
        for (auto& w : workers_) w.join();
    }
    template <class F>
    auto submit(F f) -> std::future<decltype(f())> {
        using R = decltype(f());
        auto task = std::make_shared<std::packaged_task<R()>>(std::move(f));
        std::future<R> fut = task->get_future();
        {
            std::lock_guard<std::mutex> lock(m_);
            jobs_.push([task] { (*task)(); });
        }
        cv_.notify_one();
        return fut;
    }

private:
    void run() {
        for (;;) {
            std::function<void()> job;
            {
                std::unique_lock<std::mutex> lock(m_);
                cv_.wait(lock, [this] { return stop_ || !jobs_.empty(); });
                if (jobs_.empty()) return;
                job = std::move(jobs_.front());
                jobs_.pop();
            }
            job();
        }
    }

    std::vector<std::thread> workers_;
    std::queue<std::function<void()>> jobs_;
    std::mutex m_;
    std::condition_variable cv_;
    bool stop_ = false;
};

int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }

int main() {
    ThreadPool pool(3);
    std::vector<std::future<int>> futures;
    for (int n = 10; n <= 15; ++n) {
        futures.push_back(pool.submit([n] { return fib(n); }));
    }
    for (std::size_t i = 0; i < futures.size(); ++i) {
        std::cout << "fib(" << 10 + i << ") = " << futures[i].get() << "\n";
    }
    return 0;
}
`,
      String.raw`// не компілюється: std::function вимагає копіюваного об'єкта, а лямбда з unique_ptr лише переміщується
#include <functional>
#include <iostream>
#include <memory>

int main() {
    auto p = std::make_unique<int>(5);
    std::function<void()> job = [q = std::move(p)] { std::cout << *q << "\n"; };
    job();
    return 0;
}
`,
    ],
    note: "Завдання виконуйте <b>поза</b> замком, а в деструкторі пулу ставте <code>stop_</code> під мʼютексом, кличте <code>notify_all</code> і робіть <code>join</code>. Результати збирайте безпечно й друкуйте з головного потоку.",
    work: "Візьміть клас <code>ThreadPool</code> із третього прикладу. Подайте в нього шість завдань, що рахують суму чисел від 1 до n для n від 1 до 6. Прочитайте <code>future</code> у порядку подачі й виведіть шість сум.",
    tasks: [
      "Чому завдання з черги треба виконувати після відпускання мʼютекса, а не під ним?",
      "Чому в пулі з <code>future</code> результатів <code>packaged_task</code> кладуть у <code>shared_ptr</code>, а не передають у <code>std::function</code> напряму?",
    ],
  },
];
