export const LESSONS_07a = [
  {
    t: "std::thread: запуск і join",
    ch: "Паралелізм",
    easy: "Потік це ще один кухар на тій самій кухні: він працює над своєю стравою одночасно з вами. Але перш ніж подавати обід, ви мусите дочекатися, поки кухар закінчить, і саме це робить join.",
    p: [
      "До цієї глави кожна наша програма виконувала рядки строго по черзі: один рядок завершується, починається наступний. Але сучасний процесор має кілька ядер, і одна «лінія виконання» залишає їх без роботи. <b>Потік</b> (thread) це окрема лінія виконання всередині вашої програми: кілька потоків можуть робити різні справи одночасно, ділячись однією пам'яттю. Так програма встигає і рахувати, і відповідати користувачу, і чекати на мережу.",
      "Модель у голові така: головний потік це <code>main</code>, і він існує, поки програма працює. Коли ви пишете <code>std::thread t(f);</code> (потрібен заголовок <code>&lt;thread&gt;</code>), бібліотека створює новий потік, і він одразу починає виконувати функцію <code>f</code>. Об'єкт <code>t</code> це лише «ручка» для керування цим потоком. Тепер дві лінії виконання йдуть паралельно, і ніхто не гарантує, хто з них зробить наступний крок першим.",
      "Тому в уроці діє головне правило: перш ніж <code>t</code> зникне, його треба приєднати викликом <code>t.join()</code>. Цей виклик блокує поточний потік, поки потік <code>t</code> не завершиться. Після <code>join</code> ви впевнені, що все, що зробив потік, уже завершене й видиме вам. Саме тому в цій главі ми друкуємо результати з головного потоку після <code>join</code>: тоді вивід завжди однаковий.",
      "Що відбувається, якщо забути <code>join</code>? Деструктор об'єкта <code>std::thread</code>, який ще «приєднуваний» (joinable), викликає <code>std::terminate</code>, і програма аварійно завершується. Це свідомий захист: стандарт не хоче мовчки губити потік, що ще працює з даними, які можуть зникнути. Є ще <code>detach()</code>, що відпускає потік у вільне плавання, але для початківця це небезпечний інструмент: потік може пережити змінні, до яких звертається.",
      "Потоків можна запускати багато: складайте їх у <code>std::vector&lt;std::thread&gt;</code> через <code>emplace_back</code> і потім у циклі викликайте <code>join</code> для кожного. Передати потоку можна не лише функцію, а й лямбду, і це найчастіший спосіб. Але якщо лямбда захоплює локальні змінні за посиланням (<code>[&amp;]</code>), переконайтеся, що вони доживуть до <code>join</code>. Кілька потоків, що пишуть у <i>різні</i> елементи вектора, не заважають одне одному.",
      "Дві пастки. По-перше, з'єднати потік двічі не можна: після <code>join</code> об'єкт уже не приєднуваний, тож перевіряйте <code>t.joinable()</code>. По-друге, якщо між запуском і <code>join</code> вилетить виняток, <code>join</code> не виконається, і ви отримаєте <code>terminate</code>. Ідіома, яка це лікує, це обгортка за принципом RAII (ви знаєте її з попередніх глав): клас, чий деструктор викликає <code>join</code>. У C++20 для цього є <code>std::jthread</code>, а в C++17 пишуть свою обгортку.",
      "Отже, <code>std::thread</code> запускає функцію в новому потоці одразу при створенні, а <code>join</code> чекає на її завершення. Поки що ми лише розділяли роботу між потоками й збирали результати після <code>join</code>. У наступному уроці дізнаємося, як передавати потокові аргументи й повертати з нього результат, не ламаючи нічого.",
    ],
    code: [
      String.raw`#include <iostream>
#include <thread>

void hello() {
    std::cout << "привіт із потоку\n";
}

int main() {
    std::thread t(hello);
    t.join();
    std::cout << "потік завершився\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <thread>
#include <vector>

int main() {
    std::vector<int> squares(4, 0);
    std::vector<std::thread> workers;
    for (int i = 0; i < 4; ++i) {
        workers.emplace_back([&squares, i] { squares[i] = (i + 1) * (i + 1); });
    }
    for (auto& w : workers) {
        w.join();
    }
    for (int i = 0; i < 4; ++i) {
        std::cout << "квадрат " << i + 1 << " = " << squares[i] << "\n";
    }
    return 0;
}
`,
      String.raw`#include <iostream>
#include <thread>
#include <utility>

class JoinGuard {
public:
    explicit JoinGuard(std::thread t) : t_(std::move(t)) {}
    ~JoinGuard() {
        if (t_.joinable()) {
            t_.join();
        }
    }
    JoinGuard(const JoinGuard&) = delete;
    JoinGuard& operator=(const JoinGuard&) = delete;

private:
    std::thread t_;
};

int main() {
    int result = 0;
    {
        JoinGuard g(std::thread([&result] { result = 42; }));
    }
    std::cout << "результат " << result << "\n";
    return 0;
}
`,
      String.raw`// аварія: деструктор приєднуваного потоку викликає std::terminate
#include <iostream>
#include <thread>

int main() {
    std::cout << "запускаємо потік" << std::endl;
    std::thread t([] {});
    std::cout << "виходимо без join" << std::endl;
    return 0;
}
`,
    ],
    note: "Потік стартує одразу при створенні <code>std::thread</code>. Кожен потік треба приєднати: викличте <code>join()</code> до знищення об'єкта, інакше програма завершиться через <code>std::terminate</code>. Результати друкуйте після <code>join</code>.",
    work: "Потоки запускають для фонових обчислень, обробки запитів сервера, завантаження файлів і розвантаження інтерфейсу. У коді сервісів майже завжди є обгортка з join у деструкторі, щоб виняток не залишив потік без приєднання.",
    tasks: [
      "Що станеться, якщо знищити об'єкт <code>std::thread</code>, для якого не викликали ні <code>join</code>, ні <code>detach</code>?",
      "Чому в прикладах цієї глави результати друкують з головного потоку після <code>join</code>, а не з робочих потоків одночасно?",
    ],
  },
  {
    t: "Передача аргументів у потік і повернення результату",
    ch: "Паралелізм",
    easy: "Це як передати кухареві рецепт: ви кладете інгредієнти йому в руки, і він працює з власною копією. Щоб він змінив ваш горщик, а не свою миску, треба явно сказати: «працюй з цим самим».",
    p: [
      "Потік майже ніколи не працює «в порожнечі»: йому треба передати дані, а потім забрати результат. У прикладах попереднього уроку ми використовували лямбду із захопленням, але можна просто писати аргументи після функції: <code>std::thread t(f, 10, \"abc\");</code>. Конструктор потоку приймає функцію і далі її аргументи, і потік викличе <code>f(10, \"abc\")</code> уже у своєму виконанні.",
      "Ключове правило, яке слід запам'ятати: аргументи потоку <b>копіюються</b> (або переміщуються) у внутрішнє сховище потоку, і лише потім передаються функції. Навіть якщо функція приймає <code>int&amp;</code>, потік спершу зробить копію. Тому зміни не потраплять у вашу змінну. Це захист: так потік не залишиться з посиланням на змінну, що вже зникла.",
      "Якщо ви справді хочете, щоб потік працював із вашою змінною, передайте її обгорткою <code>std::ref(x)</code> (заголовок <code>&lt;functional&gt;</code>). Тоді копіюється не сама змінна, а посилання на неї. Без <code>std::ref</code> функція з параметром <code>int&amp;</code> просто не скомпілюється: компілятор помітить, що тимчасову копію не можна прив'язати до неконстантного посилання. Це гарна помилка: вона не дає втекти в небезпечну поведінку мовчки.",
      "Типи, які можна лише переміщувати, наприклад <code>std::unique_ptr</code>, передають через <code>std::move</code>: потік забере власність на ресурс. Це зручно, коли робота потоку вимагає свого об'єкта, і ніхто більше до нього не звертається. Те саме з лямбдою: <code>[x = std::move(x)]</code> переносить значення в замикання. Ідіома проста: що потоку потрібно у власність, віддайте йому за значенням.",
      "А що з результатом? Функція, яку виконує потік, не може повернути значення так, як звичайна: <code>return</code> у потоці просто губиться. Найпростіший спосіб, який нам тут вистачає, це записати результат у змінну, що живе довше за потік. Це або елемент вектора, або змінна, передана через <code>std::ref</code>, або поле об'єкта. Читати її безпечно лише після <code>join</code>. Більш витончені способи (<code>future</code>) ми розберемо пізніше в цій главі.",
      "Типова пастка: передати в потік вказівник або посилання на локальну змінну, яка закінчиться раніше, ніж потік дочитає. Тому ставте <code>join</code> у тій самій області видимості, де живуть змінні. Друга пастка: кілька потоків пишуть в <i>одну</i> змінну результату. Це вже гонка даних, і про неї наступний урок. Правило безпеки на сьогодні: кожен потік пише у своє окреме місце.",
      "Підсумок: аргументи копіюються в потік, <code>std::ref</code> передає посилання, <code>std::move</code> передає власність, а результат віддають у спільну змінну, яку читають після <code>join</code>. Коли кілька потоків почнуть писати в одне місце, нам знадобиться захист, і це тема уроку про гонку даних і <code>mutex</code>.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <thread>

void greet(const std::string& name, int times) {
    for (int i = 0; i < times; ++i) {
        std::cout << "привіт, " << name << "\n";
    }
}

int main() {
    std::thread t(greet, "Ада", 2);
    t.join();
    return 0;
}
`,
      String.raw`#include <functional>
#include <iostream>
#include <thread>

void add_ten(int& x) {
    x += 10;
}

int main() {
    int value = 5;
    std::thread t(add_ten, std::ref(value));
    t.join();
    std::cout << "value = " << value << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <numeric>
#include <thread>
#include <vector>

int main() {
    std::vector<int> data(100);
    std::iota(data.begin(), data.end(), 1);

    long long left = 0, right = 0;
    std::thread a([&] { left = std::accumulate(data.begin(), data.begin() + 50, 0LL); });
    std::thread b([&] { right = std::accumulate(data.begin() + 50, data.end(), 0LL); });
    a.join();
    b.join();
    std::cout << "ліва " << left << ", права " << right << ", разом " << left + right << "\n";

    auto box = std::make_unique<int>(7);
    std::thread c([p = std::move(box)] { std::cout << "у потоці " << *p << "\n"; });
    c.join();
    return 0;
}
`,
      String.raw`// не компілюється: без std::ref потік передає копію, а не int&
#include <iostream>
#include <thread>

void add_ten(int& x) {
    x += 10;
}

int main() {
    int value = 5;
    std::thread t(add_ten, value);
    t.join();
    std::cout << value << "\n";
    return 0;
}
`,
    ],
    note: "Аргументи потоку копіюються. Для посилання пишіть <code>std::ref(x)</code>, для передачі власності <code>std::move(x)</code>. Результат потоку кладіть у змінну, що переживе потік, і читайте лише після <code>join</code>.",
    work: "Так розбивають велику роботу на частини: кожному потоку дають свій діапазон даних і своє місце для результату, а підсумок збирають після join. Це основа паралельного підсумовування, обробки зображень і пакетної обробки файлів.",
    tasks: [
      "Чому функція з параметром <code>int&amp;</code> не компілюється, якщо передати змінну в <code>std::thread</code> без <code>std::ref</code>?",
      "Як повернути з потоку число, не використовуючи <code>future</code>, і коли його безпечно читати?",
    ],
  },
  {
    t: "Гонка даних і mutex",
    ch: "Паралелізм",
    easy: "Mutex це ключ від єдиної кабінки: хто зайшов, замикає двері, а інші чекають у черзі. Без ключа двоє можуть вломитися разом і зіпсувати все, що всередині.",
    p: [
      "Досі наші потоки писали у <i>різні</i> місця, тож не заважали одне одному. Але що, якщо кілька потоків змінюють одну й ту саму змінну? Це називається <b>гонка даних</b> (data race): два потоки звертаються до однієї пам'яті одночасно, і хоча б один пише. За стандартом це <b>невизначена поведінка</b>: результат може бути будь-яким, і навіть відлагоджувач не покаже стабільної картини. Тому ми не запускаємо гонку як приклад, а лише розбираємо її.",
      "Чому так буває? Оператор <code>++counter</code> здається однією дією, але насправді це три кроки: прочитати значення, додати одиницю, записати назад. Якщо два потоки прочитали те саме число 5, то обидва запишуть 6, і одне збільшення зникло. На практиці з чотирма потоками по тисячі збільшень ви можете отримати число трохи менше за 4000, причому щоразу інше.",
      "Ліки це <b>взаємне виключення</b>: поки один потік працює із спільними даними, решта чекають. У C++ для цього є <code>std::mutex</code> (заголовок <code>&lt;mutex&gt;</code>). Виклик <code>m.lock()</code> захоплює замок: якщо хтось інший уже тримає, потік засинає, поки замок не звільниться. Виклик <code>m.unlock()</code> відпускає його. Код між ними називають <b>критичною секцією</b>: у ній одночасно може бути лише один потік.",
      "Звісно, ручні <code>lock</code> і <code>unlock</code> небезпечні: якщо між ними виняток або ранній <code>return</code>, замок лишиться захопленим назавжди, і всі інші потоки зависнуть. Тому в реальному коді так майже ніколи не пишуть, а користуються обгорткою <code>lock_guard</code>, що розблокує замок у деструкторі. Її докладно розберемо в наступному уроці. Тут ми ще дивимось на самі <code>lock</code> і <code>unlock</code>, щоб зрозуміти, що саме вони роблять.",
      "Mutex має належати до того, що він захищає. Гарна ідіома: покласти його поруч із даними, наприклад у класі лічильника, який зберігає і <code>int</code>, і <code>mutex</code>, а всі методи беруть замок. Тоді зовнішній код не може випадково забути про захист. Важливо також, що захист діє, лише якщо <i>всі</i> місця, які торкаються даних, беруть той самий замок: один «вільний» доступ без замка знову дає гонку.",
      "Пастки. Mutex не можна копіювати: копія замка не мала б сенсу, і компілятор це заборонить. Не тримайте замок довше, ніж треба: поки ви в критичній секції, інші потоки чекають, і паралелізм зникає. Не викликайте <code>unlock</code> для замка, якого не тримаєте: це знов невизначена поведінка. І не плутайте: <code>mutex</code> захищає <i>доступ</i> до даних, а не робить сам оператор <code>++</code> магічно безпечним.",
      "Отже, гонка даних це одночасний доступ із записом без синхронізації, а <code>mutex</code> робить критичну секцію ексклюзивною. Результат стає детермінованим: чотири потоки по тисячі збільшень завжди дають 4000. У наступному уроці ми замінимо ручні <code>lock</code> і <code>unlock</code> на <code>lock_guard</code> і <code>unique_lock</code>, які безпечні навіть при винятках.",
    ],
    code: [
      String.raw`// фрагмент: так писати не можна, це гонка даних (невизначена поведінка)
int counter = 0;

void work() {
    for (int i = 0; i < 1000; ++i) {
        ++counter;   // прочитати, додати, записати: три кроки, потоки перебивають одне одного
    }
}
// чотири потоки з work() можуть дати 3871, 3994 чи будь-що, але не гарантовані 4000
`,
      String.raw`#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

int counter = 0;
std::mutex m;

void work() {
    for (int i = 0; i < 1000; ++i) {
        m.lock();
        ++counter;
        m.unlock();
    }
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back(work);
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "лічильник = " << counter << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

class Counter {
public:
    void add(int n) {
        m_.lock();
        value_ += n;
        m_.unlock();
    }
    int value() {
        m_.lock();
        int v = value_;
        m_.unlock();
        return v;
    }

private:
    std::mutex m_;
    int value_ = 0;
};

int main() {
    Counter c;
    std::vector<std::thread> threads;
    for (int i = 1; i <= 5; ++i) {
        threads.emplace_back([&c, i] {
            for (int k = 0; k < 100; ++k) {
                c.add(i);
            }
        });
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "сума = " << c.value() << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: mutex не можна копіювати
#include <iostream>
#include <mutex>

int main() {
    std::mutex a;
    std::mutex b = a;
    std::cout << "копія замка?\n";
    return 0;
}
`,
    ],
    note: "Гонка даних це одночасний доступ до пам'яті, коли хоча б один потік пише: невизначена поведінка. Захищайте спільні дані одним <code>mutex</code> у всіх місцях доступу, а критичну секцію робіть короткою.",
    work: "Mutex захищає спільні лічильники, кеші, черги завдань і таблиці сесій на серверах. Помилки гонки найтяжче ловити: програма працює тижнями, а потім раптом псує дані. Тому захист закладають у клас, а не розкидають по коду.",
    tasks: [
      "Чому <code>++counter</code> з кількох потоків без захисту може дати менше за очікуване значення?",
      "Чому ручні <code>lock</code> і <code>unlock</code> небезпечні, якщо між ними може вилетіти виняток?",
    ],
  },
  {
    t: "lock_guard, unique_lock і гранулярність блокувань",
    ch: "Паралелізм",
    easy: "lock_guard це двері з автоматичним замком: ви зайшли, замок клацнув, а вийшли з кімнати будь-яким шляхом, і двері самі відімкнулися. Забути залишити їх закритими неможливо.",
    p: [
      "Минулого уроку ми бачили головну слабкість ручних <code>lock</code> і <code>unlock</code>: якщо між ними вилетить виняток або станеться ранній <code>return</code>, замок лишиться захопленим, і всі інші потоки зависнуть назавжди. Ця проблема вам знайома з роботи з ресурсами: пам'ять, файли й замки треба звільняти автоматично. Рішення те саме, RAII: обгортка, яка захоплює замок у конструкторі й відпускає в деструкторі.",
      "Така обгортка це <code>std::lock_guard</code>. Пишете <code>std::lock_guard&lt;std::mutex&gt; g(m);</code>, і замок захоплено до кінця поточної області видимості. Коли виконання виходить із фігурних дужок будь-яким шляхом, деструктор <code>g</code> відпускає <code>m</code>. Жодного ручного <code>unlock</code>. Це найпростіший і найчастіший спосіб, і саме його варто писати за замовчуванням.",
      "Іноді потрібна більша гнучкість: відпустити замок раніше, ніж закінчиться область видимості, або захопити його пізніше, або передати комусь іншому. Для цього є <code>std::unique_lock</code>. Він теж відпускає замок у деструкторі, але вміє і <code>lock()</code>, і <code>unlock()</code> вручну, має <code>owns_lock()</code> і може бути створений без захоплення через <code>std::defer_lock</code>. Платите за це трохи більшим розміром і повільністю, тож без потреби його не беріть.",
      "Тепер про <b>гранулярність</b>: на скільки дрібних і довгих шматків ви ріжете критичні секції. Правило: тримайте замок якнайкоротше. Усе, що не торкається спільних даних, роблять поза замком: обчислення, підготовку значення, форматування. Замок беруть лише на мить, коли треба прочитати чи записати спільне. Довга критична секція перетворює паралельну програму на послідовну, адже інші потоки стоять у черзі.",
      "Але й надто дрібні замки погані. Якщо потік бере і відпускає замок у кожній ітерації циклу з мільйона кроків, накладні витрати на замок з'їдять виграш. Тому ідіома така: потік спершу рахує свою частину у <i>локальній</i> змінній без жодних замків, а наприкінці один раз бере замок і додає свій підсумок до спільної суми. Один замок на потік замість мільйона на потік.",
      "Пастки. Названу змінну обов'язково давайте: запис <code>std::lock_guard&lt;std::mutex&gt;(m);</code> без імені створює тимчасовий об'єкт, який одразу зникає, і замок не діє. Не викликайте довгі або блокувальні функції, поки тримаєте замок: введення, очікування, виклики чужого коду. І не використовуйте той самий <code>mutex</code> повторно в одному потоці, поки він захоплений: це зависання (в основному в звичайного <code>std::mutex</code> це невизначена поведінка).",
      "Підсумок: за замовчуванням беріть <code>lock_guard</code>, для гнучкості <code>unique_lock</code>, а критичні секції робіть короткими й рідкісними. Є ще одна ситуація: потік має <i>чекати</i>, поки інший щось підготує. Крутити в циклі й питати «ну що, готово?» марнує процесор. Для цього існує <code>condition_variable</code>, яка працює саме в парі з <code>unique_lock</code>, і це наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

int total = 0;
std::mutex m;

void add(int n) {
    std::lock_guard<std::mutex> g(m);
    total += n;
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 1; i <= 4; ++i) {
        threads.emplace_back(add, i * 10);
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "total = " << total << "\n";
    return 0;
}
`,
      String.raw`#include <algorithm>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

std::mutex m;
std::vector<int> log_entries;

void worker(int id) {
    int prepared = id * id;
    std::unique_lock<std::mutex> lk(m);
    log_entries.push_back(prepared);
    lk.unlock();

    int extra = prepared + 1;
    lk.lock();
    log_entries.push_back(extra);
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 1; i <= 3; ++i) {
        threads.emplace_back(worker, i);
    }
    for (auto& t : threads) {
        t.join();
    }
    std::sort(log_entries.begin(), log_entries.end());
    for (int v : log_entries) {
        std::cout << v << " ";
    }
    std::cout << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <numeric>
#include <thread>
#include <vector>

int main() {
    std::vector<int> data(1000);
    std::iota(data.begin(), data.end(), 1);

    long long total = 0;
    std::mutex m;
    std::vector<std::thread> threads;
    for (int part = 0; part < 4; ++part) {
        threads.emplace_back([&, part] {
            long long local = 0;
            for (int i = part * 250; i < (part + 1) * 250; ++i) {
                local += data[i];
            }
            std::lock_guard<std::mutex> g(m);
            total += local;
        });
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "сума 1..1000 = " << total << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <mutex>
#include <stdexcept>

std::mutex m;

void risky(bool fail) {
    std::lock_guard<std::mutex> g(m);
    if (fail) {
        throw std::runtime_error("збій усередині замка");
    }
    std::cout << "усе гаразд\n";
}

int main() {
    try {
        risky(true);
    } catch (const std::exception& e) {
        std::cout << "спіймано: " << e.what() << "\n";
    }
    if (m.try_lock()) {
        std::cout << "замок вільний\n";
        m.unlock();
    } else {
        std::cout << "замок застряг\n";
    }
    return 0;
}
`,
      String.raw`// не компілюється: lock_guard не має конструктора без mutex
#include <iostream>
#include <mutex>

int main() {
    std::lock_guard<std::mutex> g;
    std::cout << "замок без mutex?\n";
    return 0;
}
`,
    ],
    note: "Пишіть <code>std::lock_guard&lt;std::mutex&gt; g(m);</code> і давайте йому ім'я. <code>unique_lock</code> потрібен, коли замок треба відпустити чи взяти вручну. Рахуйте поза замком, а замок беріть на мить.",
    work: "У сервісах критичні секції роблять мінімальними: дістати завдання з черги, оновити кеш, додати запис до журналу. Усе важке відбувається поза замком. Профілювальники часто показують, що вузьке місце програми саме надто довгі замки.",
    tasks: [
      "Що робить деструктор <code>lock_guard</code> і чому це рятує від зависання при винятку?",
      "Чому краще порахувати часткову суму в локальній змінній потоку й додати її до спільної один раз, ніж брати замок у кожній ітерації?",
    ],
  },
  {
    t: "condition_variable: очікування події",
    ch: "Паралелізм",
    easy: "Condition_variable це дзвінок у дверях: ви не стоїте під дверима й не смикаєте ручку щосекунди, а спокійно чекаєте, поки кур'єр натисне кнопку. Тільки тоді йдете відчиняти.",
    p: [
      "Потоки часто мусять чекати на подію: чи то результат іншого потоку, чи нове завдання в черзі, чи сигнал «можна починати». Найнаївніший спосіб це крутитися в циклі й раз у раз перевіряти змінну. Так потік гріє процесор, нічого не роблячи, і ще й тримає замок, тож інші потоки не можуть змінити стан. Потрібен спосіб заснути й прокинутися рівно тоді, коли подія сталася.",
      "Цей спосіб називається <code>std::condition_variable</code> (заголовок <code>&lt;condition_variable&gt;</code>). Вона працює в парі з <code>mutex</code> і спільною умовою, наприклад прапорцем <code>bool ready</code>. Потік-чекач бере <code>std::unique_lock</code>, викликає <code>cv.wait(lk, умова)</code> і засинає. Потік-виробник змінює умову під замком, а потім кличе <code>cv.notify_one()</code>, що будить одного чекача, або <code>notify_all()</code>, що будить усіх.",
      "Що робить <code>wait</code> усередині? Він атомарно відпускає замок і присипляє потік, а прокинувшись, знову захоплює замок і перевіряє умову. Саме тому потрібен <code>unique_lock</code>, а не <code>lock_guard</code>: <code>wait</code> має вміти відпускати й брати замок. Якщо умова ще хибна, потік засинає знову. Так ми гарантуємо, що після <code>wait</code> умова істинна й замок у нас.",
      "Умову у виклик <code>wait</code> передають лямбдою: <code>cv.wait(lk, [&amp;]{ return ready; })</code>. Це не просто зручність, а захист від двох проблем. Перша: <b>фальшиве пробудження</b>, коли потік прокидається без жодного сповіщення. Друга: <b>загублене сповіщення</b>, коли <code>notify</code> спрацював раніше, ніж чекач заснув. Із предикатом обидві проблеми зникають, бо умову перевіряють перед сном і після кожного пробудження.",
      "Типова схема «виробник і споживач»: спільна черга, замок і <code>cv</code>. Виробник під замком додає елемент і сповіщає. Споживач чекає з умовою «черга не порожня або роботу завершено», дістає елемент, відпускає замок і лише тоді обробляє його. Прапорець завершення потрібен, щоб споживач знав, коли припинити чекати: сама тиша в черзі ще не означає кінця. Скрізь змінюйте стан під замком, навіть якщо це простий <code>bool</code>.",
      "Пастки. Не викликайте <code>wait</code> без предиката, якщо не розумієте, що робите. Не забувайте змінювати умову перед <code>notify</code>: сповіщення без зміни стану нічого не дає. Не тримайте замок під час довгої обробки елемента: відпускайте його, як тільки взяли дані. І пам'ятайте, що <code>wait</code> вимагає саме <code>unique_lock</code>: спроба передати <code>lock_guard</code> не скомпілюється.",
      "Отже, <code>condition_variable</code> дає змогу потокові спати, поки хтось не змінить спільну умову й не сповістить про це. Це ручний інструмент для будь-яких схем очікування. А коли вам просто треба передати з потоку єдине значення або запустити обчислення й дочекатися відповіді, є вищий рівень, який використовує ці механізми всередині: <code>async</code>, <code>future</code> і <code>promise</code> у наступному уроці.",
    ],
    code: [
      String.raw`#include <condition_variable>
#include <iostream>
#include <mutex>
#include <thread>

std::mutex m;
std::condition_variable cv;
bool ready = false;
int data = 0;

int main() {
    std::thread worker([] {
        int result = 6 * 7;
        {
            std::lock_guard<std::mutex> g(m);
            data = result;
            ready = true;
        }
        cv.notify_one();
    });

    std::unique_lock<std::mutex> lk(m);
    cv.wait(lk, [] { return ready; });
    std::cout << "отримано " << data << "\n";
    lk.unlock();
    worker.join();
    return 0;
}
`,
      String.raw`#include <condition_variable>
#include <iostream>
#include <mutex>
#include <queue>
#include <thread>

int main() {
    std::queue<int> q;
    std::mutex m;
    std::condition_variable cv;
    bool done = false;

    std::thread producer([&] {
        for (int i = 1; i <= 5; ++i) {
            {
                std::lock_guard<std::mutex> g(m);
                q.push(i * 10);
            }
            cv.notify_one();
        }
        {
            std::lock_guard<std::mutex> g(m);
            done = true;
        }
        cv.notify_one();
    });

    while (true) {
        std::unique_lock<std::mutex> lk(m);
        cv.wait(lk, [&] { return !q.empty() || done; });
        if (q.empty()) {
            break;
        }
        int v = q.front();
        q.pop();
        lk.unlock();
        std::cout << "взяв " << v << "\n";
    }
    producer.join();
    std::cout << "кінець\n";
    return 0;
}
`,
      String.raw`#include <condition_variable>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

int main() {
    std::mutex m;
    std::condition_variable cv;
    bool go = false;
    std::vector<int> results(3, 0);
    std::vector<std::thread> workers;

    for (int i = 0; i < 3; ++i) {
        workers.emplace_back([&, i] {
            std::unique_lock<std::mutex> lk(m);
            cv.wait(lk, [&] { return go; });
            lk.unlock();
            results[i] = (i + 1) * 100;
        });
    }

    {
        std::lock_guard<std::mutex> g(m);
        go = true;
    }
    cv.notify_all();

    for (auto& w : workers) {
        w.join();
    }
    for (int i = 0; i < 3; ++i) {
        std::cout << "потік " << i << " дав " << results[i] << "\n";
    }
    return 0;
}
`,
      String.raw`// не компілюється: wait потребує unique_lock, а не lock_guard
#include <condition_variable>
#include <iostream>
#include <mutex>

int main() {
    std::mutex m;
    std::condition_variable cv;
    std::lock_guard<std::mutex> g(m);
    cv.wait(g, [] { return true; });
    std::cout << "дочекалися\n";
    return 0;
}
`,
    ],
    note: "Чекайте за схемою: <code>unique_lock</code>, <code>cv.wait(lk, умова)</code>. Змінюйте стан під замком і потім кличте <code>notify_one</code> або <code>notify_all</code>. Предикат захищає від фальшивих пробуджень і загублених сповіщень.",
    work: "Черги завдань, пули потоків, повідомлення між частинами системи й затвори «стартуємо всі разом» побудовані на condition_variable. У серверах вона дозволяє робочим потокам спати без навантаження на процесор, поки не надійде запит.",
    tasks: [
      "Чому в <code>cv.wait</code> використовують <code>unique_lock</code>, а не <code>lock_guard</code>?",
      "Яку проблему розв'язує предикат у <code>cv.wait(lk, умова)</code>, якщо потік прокинувся без сповіщення або сповіщення прийшло раніше за сон?",
    ],
  },
  {
    t: "async, future і promise",
    ch: "Паралелізм",
    easy: "Future це талон у пекарні: ви замовили хліб і пішли у справах, а коли прийшли й показали талон, отримали випічку. Promise це віконце, з якого пекар обіцяє й кладе булку.",
    p: [
      "Ручна робота з потоком, замком і умовною змінною для простої мети «порахуй і поверни число» надто громіздка. Нам потрібно запустити задачу, піти займатися іншим і потім забрати готовий результат. Для цього в C++ є три пов'язані речі в заголовках <code>&lt;future&gt;</code>: <code>std::async</code> запускає задачу, <code>std::future</code> зберігає майбутній результат, а <code>std::promise</code> дає змогу потоку цей результат поставити.",
      "Найпростіше: <code>auto f = std::async(std::launch::async, func, args...);</code>. Бібліотека запускає <code>func</code> в окремому потоці й повертає <code>std::future&lt;T&gt;</code>, де <code>T</code> це тип, який повертає функція. Далі ви робите свої справи, а коли результат потрібен, викликаєте <code>f.get()</code>. Якщо задача ще не закінчилася, <code>get</code> почекає. Тут не потрібен ні <code>join</code>, ні спільна змінна, ні замок: майбутнє саме все синхронізує.",
      "Явно вказуйте <code>std::launch::async</code>. Без нього бібліотека має право відкласти виконання, і задача запуститься лише при виклику <code>get</code> у вашому ж потоці, тобто зовсім без паралелізму. Є й дві особливості. <code>get()</code> можна викликати лише <i>один раз</i>: результат віддається, і майбутнє стає порожнім. А деструктор <code>future</code>, отриманого від <code>async</code>, <i>блокує</i> до завершення задачі, тож забутий <code>future</code> тихо перетворює паралельний код на послідовний.",
      "Виняток у задачі не губиться. Якщо функція кинула виняток, він зберігається у <code>future</code> і знову викидається при виклику <code>get()</code> у тому потоці, який чекає. Це дуже зручно: помилки потоку обробляються там, де ви читаєте результат, звичайним <code>try/catch</code>. Нехтувати цим не можна: якщо ви не спіймаєте виняток від <code>get</code>, він піде вгору й завершить програму, як будь-який необроблений виняток.",
      "Тепер <code>std::promise&lt;T&gt;</code>. Це інша половина того самого каналу. Ви створюєте <code>promise</code>, беручи з нього <code>future</code> через <code>get_future()</code>, а потім передаєте <code>promise</code> іншому потоку (за допомогою <code>std::move</code>). Той потік викликає <code>set_value(...)</code>, або <code>set_exception(...)</code>, і ваш <code>future</code> прокидається. Це корисно, коли значення готує вручну запущений <code>std::thread</code>, а не <code>async</code>.",
      "Пастки. Не викликайте <code>get</code> двічі й не очікуйте, що забутий <code>future</code> від <code>async</code> не заблокує вас. Не створюйте потік на кожне крихітне обчислення: запуск потоку коштує дорожче, ніж проста арифметика. Не плутайте: <code>future</code> дає <i>одне</i> значення один раз, і для потоку подій (багато значень) він не годиться, там знадобиться черга з умовною змінною з попереднього уроку.",
      "Підсумок: <code>async</code> запускає задачу, <code>future::get</code> чекає й віддає результат або виняток, а <code>promise</code> дозволяє виставити результат із довільного потоку. Це найчистіший спосіб передати відповідь між потоками. Але якщо потрібно лише поділитися простим лічильником, замок тут надмірний: наступний урок покаже <code>atomic</code>, який робить такі лічильники безпечними без блокувань.",
    ],
    code: [
      String.raw`#include <future>
#include <iostream>

int slow_square(int x) {
    return x * x;
}

int main() {
    std::future<int> f = std::async(std::launch::async, slow_square, 12);
    std::cout << "задачу запущено\n";
    std::cout << "результат " << f.get() << "\n";
    return 0;
}
`,
      String.raw`#include <future>
#include <iostream>
#include <numeric>
#include <vector>

long long part_sum(const std::vector<int>& v, std::size_t from, std::size_t to) {
    return std::accumulate(v.begin() + from, v.begin() + to, 0LL);
}

int main() {
    std::vector<int> data(1000);
    std::iota(data.begin(), data.end(), 1);

    std::vector<std::future<long long>> parts;
    for (std::size_t i = 0; i < 4; ++i) {
        parts.push_back(std::async(std::launch::async, part_sum, std::cref(data), i * 250, (i + 1) * 250));
    }
    long long total = 0;
    for (auto& p : parts) {
        total += p.get();
    }
    std::cout << "сума = " << total << "\n";
    return 0;
}
`,
      String.raw`#include <future>
#include <iostream>
#include <string>
#include <thread>
#include <utility>

void prepare(std::promise<std::string> p) {
    p.set_value("готово з іншого потоку");
}

int main() {
    std::promise<std::string> promise;
    std::future<std::string> future = promise.get_future();
    std::thread t(prepare, std::move(promise));
    std::cout << future.get() << "\n";
    t.join();
    return 0;
}
`,
      String.raw`#include <future>
#include <iostream>
#include <stdexcept>

int risky() {
    throw std::runtime_error("задача не вдалася");
}

int main() {
    std::future<int> f = std::async(std::launch::async, risky);
    try {
        int v = f.get();
        std::cout << v << "\n";
    } catch (const std::exception& e) {
        std::cout << "виняток із потоку: " << e.what() << "\n";
    }
    return 0;
}
`,
      String.raw`// аварія: виняток із задачі, який ніхто не спіймав після get()
#include <future>
#include <iostream>
#include <stdexcept>

int risky() {
    throw std::runtime_error("задача не вдалася");
}

int main() {
    std::cout << "запуск" << std::endl;
    std::future<int> f = std::async(std::launch::async, risky);
    int v = f.get();
    std::cout << v << "\n";
    return 0;
}
`,
    ],
    note: "Запускайте <code>std::async(std::launch::async, f, ...)</code> і беріть результат через <code>get()</code> один раз: він чекає й повертає значення або кидає виняток задачі. <code>promise</code> виставляє значення з іншого потоку.",
    work: "Async і future вживають для паралельного завантаження кількох ресурсів, підрахунку частин великого набору даних і фонових обчислень у застосунках з інтерфейсом. Promise зручний у обгортках над колбеками й власними потоками.",
    tasks: [
      "Що станеться з винятком, який кинула функція, запущена через <code>std::async</code>, і де його можна спіймати?",
      "Чому варто явно вказувати <code>std::launch::async</code> і що буде, якщо викликати <code>get()</code> двічі на одному <code>future</code>?",
    ],
  },
];
