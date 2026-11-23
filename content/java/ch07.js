export const LESSONS_07 = [
  {
    t: "Thread: створення, запуск і join",
    ch: "Паралелізм",
    easy: String.raw`Потік — це ще один виконавець у вашій програмі: поки основний готує обід, другий накриває на стіл. Вони працюють одночасно, а join означає «зачекаю, поки ти закінчиш».`,
    p: [
      String.raw`Потік (thread) — це послідовність виконання всередині програми. Кожна програма має головний потік (main) і може запускати нові. Потоки ділять пам'ять купи, але мають власні стеки викликів. Паралельність дозволяє використати кілька ядер процесора й не блокувати програму під час очікування (мережа, диск). Ціна — складність: потоки взаємодіють між собою, і виникають помилки, яких не буває в однопотоковому коді.`,
      String.raw`Створення: клас <code>Thread</code> приймає завдання — об'єкт <code>Runnable</code> із методом <code>run()</code>: <code>Thread t = new Thread(() -&gt; System.out.println("hello"));</code> (лямбда, бо Runnable є функціональним інтерфейсом). Запуск — <code>t.start()</code>. Метод <code>run()</code> напряму не викликають: це виконало б код у поточному потоці, а не в новому. Метод <code>start()</code> можна викликати лише раз: повторний виклик дасть <code>IllegalThreadStateException</code>.`,
      String.raw`Порядок виконання потоків не визначений: планувальник операційної системи вирішує, коли й на якому ядрі працювати. Тому вивід двох потоків може чергуватися по-різному від запуску до запуску. Програма, правильність якої залежить від порядку, є помилковою. Для певного порядку існує синхронізація: <code>join</code>, замки, черги, про що йтиметься в наступних уроках.`,
      String.raw`Виклик <code>t.join()</code> блокує поточний потік, поки <code>t</code> не завершиться. Це спосіб дочекатися результату: після <code>join</code> усі зміни, зроблені потоком <code>t</code>, гарантовано видно в поточному потоці (так вирішує модель пам'яті Java). Є й <code>join(millis)</code> із тайм-аутом. Без <code>join</code> головний потік може завершитись раніше, а програма житиме, доки працюють непотоки-демони.`,
      String.raw`Інші методи: <code>Thread.sleep(ms)</code> призупиняє потік (і кидає перевірюваний <code>InterruptedException</code>), <code>Thread.currentThread()</code> повертає поточний потік, а ще є <code>getName()</code>, <code>setName</code>, <code>isAlive()</code> та <code>setDaemon(true)</code>, що робить потік демоном (він не утримує програму від завершення). Імена потокам корисно давати: вони з'являються в журналах і дампах.`,
      String.raw`Переривання: <code>t.interrupt()</code> лише встановлює прапорець переривання, а потік має сам на нього реагувати. Методи очікування (<code>sleep</code>, <code>join</code>, <code>wait</code>) кидають <code>InterruptedException</code>, коли потік перервали. Правильна реакція — завершити роботу або відновити прапорець викликом <code>Thread.currentThread().interrupt()</code>, а не мовчки ковтати виняток.`,
      String.raw`Створювати потоки вручну для кожного завдання — погана практика: це дорого й важко керувати. На практиці користуються пулами потоків (<code>ExecutorService</code>, наступні уроки). Проте розуміти <code>Thread</code>, <code>start</code> та <code>join</code> необхідно: на них побудовано решту. Також можна успадковувати <code>Thread</code>, але передавати <code>Runnable</code> зручніше й гнучкіше. Це особливо важливо для сервісів, де сотні потоків працюють одночасно.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread a = new Thread(() -> System.out.println("hello from a"));
        Thread b = new Thread(() -> System.out.println("hello from b"));
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println("main done");     // гарантовано після обох потоків
    }
}`,
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        int[] results = new int[4];
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            final int id = i;                                  // змінна для лямбди має бути ефективно фінальною
            threads[i] = new Thread(() -> results[id] = id * id);
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println(Arrays.toString(results));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            System.out.println("running in " + Thread.currentThread().getName());
        }, "worker-1");
        worker.start();
        worker.join();
        System.out.println("main is " + Thread.currentThread().getName());
        Thread bg = new Thread(() -> { });
        bg.setDaemon(true);                                    // демон не утримує програму
        System.out.println(bg.isDaemon() + " " + bg.isAlive());
    }
}`,
      String.raw`// аварія: один і той самий потік не можна запустити двічі, IllegalThreadStateException
public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> System.out.println("run"));
        t.start();
        t.join();
        t.start();
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread sleeper = new Thread(() -> {
            try {
                Thread.sleep(5000);
                System.out.println("woke up");
            } catch (InterruptedException e) {
                System.out.println("interrupted");              // реакція на переривання
            }
        });
        sleeper.start();
        sleeper.interrupt();
        sleeper.join();
    }
}`,
    ],
    note: String.raw`Метод <code>start()</code> запускає новий потік, а прямий виклик <code>run()</code> виконає код у поточному. Після <code>join()</code> усі зміни завершеного потоку гарантовано видно, а порядок виконання без синхронізації не визначений.`,
    work: String.raw`Потоки з'являються в серверах, що обробляють багато запитів, у застосунках із довгими обчисленнями та в інтерфейсах, які не повинні зависати. На практиці їх майже завжди запускають через пули, але діагностика (імена потоків, дампи, зависання) вимагає розуміння базових понять: start, join і interrupt.`,
    tasks: [
      String.raw`Чому викликати <code>run()</code> замість <code>start()</code> — помилка?`,
      String.raw`Що гарантує <code>join()</code> щодо видимості змін, зроблених іншим потоком?`,
    ],
  },
  {
    t: "Спільний стан і data race",
    ch: "Паралелізм",
    easy: String.raw`Уявіть двох касирів, які одночасно записують виручку в один зошит: обидва прочитали «100», кожен додав 10, і обидва записали «110» замість «120». Це гонитва за даними: результат залежить від того, хто кого випередив.`,
    p: [
      String.raw`Коли кілька потоків читають і змінюють спільні змінні без координації, виникає гонитва за даними (data race). Простий вираз <code>count++</code> насправді складається з трьох кроків: прочитати, додати, записати. Якщо два потоки виконують ці кроки впереміш, одне збільшення губиться. Тому після 40 000 інкрементів у чотирьох потоках результат часто менший за 40 000, причому щоразу інший.`,
      String.raw`Такі помилки підступні: вони проявляються не завжди й залежать від кількості ядер, навантаження та версії JVM. Тест може проходити тисячу разів і впасти в продакшні. Це класичний «гейзенбаг» — помилка, що зникає під час спроб її спостерігати. Єдиний надійний захист — правильна синхронізація, а не повторні запуски до першого «зеленого» результату.`,
      String.raw`Існують три види проблем: гонитва за даними (одночасний запис), порушення атомарності складних дій «перевір і зроби» (check-then-act: якщо значення порожнє, записати; між перевіркою й записом інший потік уже встиг), та проблеми видимості (один потік не бачить змін, зроблених іншим, через кеші процесора й оптимізації компілятора).`,
      String.raw`Не всі спільні дані небезпечні. Безпечні: незмінні об'єкти (рядки, record із фінальними полями), дані, доступні лише одному потоку (локальні змінні, <code>ThreadLocal</code>), дані, захищені синхронізацією, і потокобезпечні колекції. Найпростіше правило: що менше змінюваних спільних даних, то менше проблем. Не діліть змінний стан, поки це не потрібно.`,
      String.raw`Складність у тому, що ця помилка не видна в коді: <code>count++</code> виглядає як одна дія. Перегляд коду з потоками має шукати спільні змінні й питати, хто їх змінює, коли і як синхронізовано. Корисні інструменти: статичні аналізатори, тести з багатьма потоками й повторами, спеціалізовані інструменти на кшталт jcstress, які навмисно провокують рідкісні перемежування.`,
      String.raw`Класичний приклад check-then-act: ліниве створення об'єкта <code>if (instance == null) instance = new Instance();</code> без синхронізації може створити два об'єкти. Так само й для мап: <code>if (!map.containsKey(k)) map.put(k, v);</code> не атомарне навіть для потокобезпечної мапи; для цього призначені <code>putIfAbsent</code> та <code>computeIfAbsent</code>, що виконують перевірку й запис як одну дію.`,
      String.raw`Висновок: для спільного змінюваного стану використовуйте синхронізацію (<code>synchronized</code>, замки), атомарні змінні чи потокобезпечні колекції; ще краще — уникайте спільного стану (передача повідомлень через черги, незмінні дані). Усі ці інструменти ми розглянемо в наступних уроках по черзі, починаючи з монітора.`,
    ],
    code: [
      String.raw`public class Main {
    static int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 10000; j++) {
                    count++;                  // не атомарно: збільшення можуть губитися
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println(count <= 40000);   // результат часто менший за 40000
    }
}`,
      String.raw`public class Main {
    static int count = 0;
    static final Object LOCK = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 10000; j++) {
                    synchronized (LOCK) {      // критична секція: по черзі
                        count++;
                    }
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println(count);             // завжди 40000
    }
}`,
      String.raw`public class Main {
    static final ThreadLocal<StringBuilder> BUFFER = ThreadLocal.withInitial(StringBuilder::new);

    public static void main(String[] args) throws InterruptedException {
        Thread a = new Thread(() -> {
            BUFFER.get().append("a");           // у кожного потоку власний StringBuilder
            System.out.println(BUFFER.get());
        });
        Thread b = new Thread(() -> {
            BUFFER.get().append("b");
            System.out.println(BUFFER.get());
        });
        a.start();
        a.join();
        b.start();
        b.join();
    }
}`,
      String.raw`import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentMap<String, Integer> cache = new ConcurrentHashMap<>();
        Runnable task = () -> cache.putIfAbsent("key", Thread.currentThread().getName().length());
        Thread a = new Thread(task, "first");
        Thread b = new Thread(task, "second");
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println(cache.size());       // 1: putIfAbsent атомарний, переможе лише один
    }
}`,
      String.raw`// не компілюється: локальну змінну не можна змінювати з лямбди потоку, вона має бути ефективно фінальною
public class Main {
    public static void main(String[] args) throws InterruptedException {
        int count = 0;
        Thread t = new Thread(() -> count++);
        t.start();
        t.join();
        System.out.println(count);
    }
}`,
    ],
    note: String.raw`<code>count++</code> — це три кроки (прочитати, додати, записати), тому без синхронізації збільшення губляться. Перевірку «якщо немає, то додай» теж треба виконувати атомарно, наприклад через <code>putIfAbsent</code>. Найкраще рішення — не ділити змінний стан між потоками.`,
    work: String.raw`Гонитва за даними — головна причина рідкісних, нестабільних збоїв у багатопотокових системах: помилка проявляється раз на тисячу запусків і лише під навантаженням. Тому команди застосовують консервативні правила: незмінні об'єкти, потокобезпечні колекції, мінімум спільного стану й обов'язкове рев'ю будь-якого коду з потоками.`,
    tasks: [
      String.raw`Чому <code>count++</code> не є атомарною операцією?`,
      String.raw`Що таке check-then-act і як зробити його безпечним для мапи?`,
    ],
  },
  {
    t: "synchronized і volatile",
    ch: "Паралелізм",
    easy: String.raw`synchronized — це табличка «зайнято» на дверях кабінки: усередині може бути лише один, інші чекають у черзі. volatile — це дошка оголошень: кожна зміна одразу видна всім, але вона не робить складні дії безпечними.`,
    p: [
      String.raw`Ключове слово <code>synchronized</code> забезпечує взаємне виключення: у критичній секції в кожен момент може бути лише один потік, що тримає монітор (замок) відповідного об'єкта. Синхронізований метод блокує <code>this</code> (а статичний — об'єкт класу): <code>synchronized void increment() { count++; }</code>. Усі потоки, що викликають такі методи одного об'єкта, виконують їх по черзі.`,
      String.raw`Блок <code>synchronized (lock) { ... }</code> дозволяє захистити лише потрібний шматок коду й вибрати об'єкт замка. Практика: тримати приватний фінальний об'єкт замка (<code>private final Object lock = new Object();</code>), а не блокувати <code>this</code>, на якому можуть синхронізуватися й сторонні. Замок має бути одним і тим самим для всіх доступів до певних даних: захищати лише записи без читань — помилка.`,
      String.raw`Синхронізація дає два ефекти: взаємне виключення й видимість. Вихід із synchronized «скидає» зміни в пам'ять, а вхід у synchronized того ж монітора їх бачить. Ця гарантія називається відношенням happens-before. Тому synchronized потрібен навіть для читання змінних, які змінюють інші потоки, інакше можна побачити застаріле значення.`,
      String.raw`Реентрантність: потік, що тримає замок, може повторно увійти в synchronized того ж замка (метод викликає інший synchronized метод) без блокування. Інакше потік блокував би сам себе. Монітор веде лічильник входів і звільняється лише тоді, коли потік вийшов з усіх рівнів. Це робить звичайний об'єктно-орієнтований код безпечним без зайвих хитрощів.`,
      String.raw`<code>volatile</code> — модифікатор поля, що гарантує видимість: запис у volatile-змінну одразу видно всім потокам, а читання завжди бере свіже значення, і компілятор не переставляє операції навколо. Але volatile не забезпечує атомарності складних дій: <code>volatileCount++</code> усе одно небезпечний. Для прапорців зупинки (<code>volatile boolean running</code>) і безпечної публікації він ідеальний.`,
      String.raw`Коли що: прапорець, який один потік пише, а інші читають, — <code>volatile</code>; складні дії над кількома полями (перевір і змініть, переказ коштів) — <code>synchronized</code> чи замки; лічильники й накопичувачі — атомарні класи (окремий урок). Не зловживайте блокуваннями: що довша критична секція, то більше потоків чекає, і програма втрачає перевагу паралельності.`,
      String.raw`Типові помилки: синхронізація на різних об'єктах для одних даних; synchronized на рядкових літералах чи обгортках чисел (вони можуть бути спільними зі сторонніми); виклик чужого коду всередині критичної секції (ризик взаємного блокування); синхронізація лише записів. Мінімізуйте тривалість блокувань і тримайте код усередині простим і передбачуваним.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 5000; j++) {
                    counter.increment();
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println(counter.get());     // 20000
    }
}

class Counter {
    private int value;

    synchronized void increment() {
        value++;
    }

    synchronized int get() {
        return value;
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Stats stats = new Stats();
        Thread a = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                stats.addA();
            }
        });
        Thread b = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                stats.addB();
            }
        });
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println(stats.total());
    }
}

class Stats {
    private final Object lock = new Object();    // приватний замок, а не this
    private int a;
    private int b;

    void addA() {
        synchronized (lock) {
            a++;
        }
    }

    void addB() {
        synchronized (lock) {
            b++;
        }
    }

    int total() {
        synchronized (lock) {
            return a + b;
        }
    }
}`,
      String.raw`public class Main {
    private static volatile boolean running = true;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            long ticks = 0;
            while (running) {                    // volatile: зміну прапорця буде видно
                ticks++;
                if (ticks % 1000 == 0) {
                    Thread.onSpinWait();
                }
            }
            System.out.println("worker stopped");
        });
        worker.start();
        Thread.sleep(50);
        running = false;
        worker.join();
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Account acc = new Account();
        acc.deposit(10);
        System.out.println(acc.balance());
    }
}

class Account {
    private int balance;

    synchronized void deposit(int amount) {
        balance += amount;
        log();                      // реентрантність: той самий потік входить у synchronized повторно
    }

    synchronized void log() {
        System.out.println("balance changed to " + balance);
    }

    synchronized int balance() {
        return balance;
    }
}`,
      String.raw`// аварія: wait() можна викликати лише всередині synchronized, IllegalMonitorStateException
public class Main {
    public static void main(String[] args) throws InterruptedException {
        Object lock = new Object();
        System.out.println("before");
        lock.wait();
    }
}`,
    ],
    note: String.raw`<code>synchronized</code> дає і взаємне виключення, і видимість, а <code>volatile</code> лише видимість: <code>volatile</code>-лічильник усе одно небезпечний. Блокуйте один і той самий замок для всіх доступів до даних і краще використовуйте приватний об'єкт-замок.`,
    work: String.raw`У реальних сервісах synchronized використовують для невеликих критичних секцій: оновити кеш, змінити стан об'єкта, перевірити й записати. Прапорці зупинки й конфігурації роблять volatile. Для лічильників і складнішої координації вибирають Atomic-класи та java.util.concurrent, але розуміння монітора лишається основою.`,
    tasks: [
      String.raw`Чому <code>volatile int count; count++</code> небезпечне, а <code>volatile boolean running</code> — ні?`,
      String.raw`Чому краще блокувати приватний об'єкт, а не <code>this</code>?`,
    ],
  },
  {
    t: "ExecutorService і пул потоків",
    ch: "Паралелізм",
    easy: String.raw`Пул потоків — це бригада робітників на заводі: завдання лежать на конвеєрі, а вільний робітник бере наступне. Нових людей щоразу наймати не потрібно, а кількість працівників можна обмежити.`,
    p: [
      String.raw`Створення потоку для кожного завдання дороге (пам'ять, час) і небезпечне: тисячі потоків можуть вичерпати ресурси. <code>ExecutorService</code> — інтерфейс пулу потоків із пакета <code>java.util.concurrent</code>: ви надсилаєте завдання, а пул розподіляє їх між фіксованою кількістю робочих потоків. Це стандартний спосіб виконувати паралельну роботу в Java.`,
      String.raw`Створення: <code>ExecutorService pool = Executors.newFixedThreadPool(4);</code> — рівно 4 потоки. Інші фабрики: <code>newCachedThreadPool()</code> (створює потоки за потреби, без верхньої межі), <code>newSingleThreadExecutor()</code> (один потік, завдання по черзі), <code>newWorkStealingPool()</code>, <code>newScheduledThreadPool</code>. Для обмежених ресурсів (з'єднання з базою) фіксований пул — найбезпечніший вибір.`,
      String.raw`Подання завдань: <code>pool.execute(runnable)</code> виконує без результату, <code>pool.submit(task)</code> повертає <code>Future</code> (наступний урок). Завдання потрапляють у чергу й виконуються вільними потоками. Якщо завдань більше, ніж потоків, зайві чекають. Тривалі завдання займають потік, тому кількість потоків має відповідати природі роботи: для обчислень приблизно кількості ядер, для очікування вводу-виводу — більше.`,
      String.raw`Зупинка пулу обов'язкова: потоки пулу не є демонами, і без <code>shutdown()</code> програма не завершиться. <code>shutdown()</code> припиняє приймати нові завдання, а наявні виконуються; <code>shutdownNow()</code> намагається перервати активні й повертає список невиконаних. Щоб дочекатися завершення, пишуть <code>pool.awaitTermination(10, TimeUnit.SECONDS)</code>.`,
      String.raw`Рекомендований шаблон: створити пул, подати завдання, викликати <code>shutdown()</code>, дочекатись <code>awaitTermination</code> і лише тоді читати результати. З Java 19 <code>ExecutorService</code> реалізує <code>AutoCloseable</code>: <code>try (var pool = Executors.newFixedThreadPool(4)) { ... }</code> автоматично викличе shutdown і дочекається завершення. Це найзручніший запис, і саме його варто використовувати в нових проєктах.`,
      String.raw`Винятки в завданнях: якщо завдання кинуло виняток через <code>execute</code>, потік пулу завершиться з помилкою (її видно в stderr), а пул створить новий потік. Якщо через <code>submit</code>, виняток зберігається у <code>Future</code> і з'явиться лише при <code>get()</code>, тому про нього можна взагалі не дізнатися, якщо не викликати <code>get</code>. Завжди обробляйте помилки завдань.`,
      String.raw`Не обмінюйтесь даними між завданнями без синхронізації, не блокуйте потоки пулу надовго (інші завдання голодуватимуть) і не створюйте пул у циклі чи при кожному запиті. Пул — довгоживучий ресурс: один на застосунок або підсистему, налаштований під навантаження. Для тестів зручний <code>newSingleThreadExecutor</code> завдяки передбачуваному порядку виконання.`,
      String.raw`Налаштування пулу залежить від природи завдань. Для обчислень, що завантажують процесор, оптимальна кількість потоків близька до кількості ядер (<code>Runtime.getRuntime().availableProcessors()</code>), а для завдань, що довго чекають мережу чи диск, потоків потрібно більше. Вимірюйте реальне навантаження й стежте за довжиною черги: якщо вона зростає, пул не справляється, і слід або збільшити його, або обмежити надходження завдань, або переглянути алгоритм.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        List<Integer> results = Collections.synchronizedList(new ArrayList<>());
        ExecutorService pool = Executors.newFixedThreadPool(3);
        for (int i = 1; i <= 6; i++) {
            final int n = i;
            pool.execute(() -> results.add(n * n));
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        Collections.sort(results);
        System.out.println(results);
    }
}`,
      String.raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        AtomicInteger done = new AtomicInteger();
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {    // Java 19+: close() чекає завершення
            for (int i = 0; i < 10; i++) {
                pool.execute(done::incrementAndGet);
            }
        }
        System.out.println(done.get());
    }
}`,
      String.raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) {
        try (ExecutorService single = Executors.newSingleThreadExecutor()) {
            for (int i = 1; i <= 3; i++) {
                final int n = i;
                single.execute(() -> System.out.println("task " + n));   // порядок передбачуваний
            }
        }
    }
}`,
      String.raw`// аварія: після shutdown пул не приймає нових завдань, RejectedExecutionException
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        pool.shutdown();
        System.out.println(pool.isShutdown());
        pool.execute(() -> System.out.println("never runs"));
    }
}`,
      String.raw`// не компілюється: Thread.sleep кидає перевірюваний InterruptedException, а Runnable не може його оголосити
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) {
        ExecutorService pool = Executors.newFixedThreadPool(1);
        pool.execute(() -> Thread.sleep(10));
        pool.shutdown();
    }
}`,
    ],
    note: String.raw`Пул потрібно зупиняти: <code>shutdown()</code> і <code>awaitTermination</code>, або <code>try-with-resources</code> з Java 19. Через <code>execute</code> виняток завершує потік пулу, а через <code>submit</code> він ховається у <code>Future</code> до виклику <code>get()</code>.`,
    work: String.raw`Пули потоків лежать в основі веб-серверів, обробки черг завдань, пакетних обчислень і клієнтів HTTP. Кількість потоків і розмір черги — ключові налаштування продуктивності: замало — програма простоює, забагато — витрачає пам'ять і час на перемикання. Саме неправильні налаштування пулу найчастіше спричиняють інциденти під навантаженням.`,
    tasks: [
      String.raw`Чому без <code>shutdown()</code> програма з пулом потоків не завершується?`,
      String.raw`Чим <code>execute</code> відрізняється від <code>submit</code> щодо винятків?`,
    ],
  },
  {
    t: "Callable і Future",
    ch: "Паралелізм",
    easy: String.raw`Future — це квитанція з хімчистки: ви віддали завдання, отримали папірець і займаєтесь своїми справами, а коли знадобиться результат, пред'являєте квитанцію й за потреби чекаєте, поки його принесуть.`,
    p: [
      String.raw`Інтерфейс <code>Runnable</code> не повертає результату й не може кинути перевірений виняток. Для завдань із результатом є <code>Callable&lt;V&gt;</code> із методом <code>V call() throws Exception</code>. Це функціональний інтерфейс, тому його записують лямбдою: <code>Callable&lt;Integer&gt; task = () -&gt; 21 * 2;</code>. Саме Callable використовують, коли потрібно щось обчислити у фоні й отримати відповідь.`,
      String.raw`Метод <code>pool.submit(callable)</code> повертає <code>Future&lt;V&gt;</code> — обіцянку результату. Він не блокує: завдання запускається у фоні. Метод <code>future.get()</code> блокує потік, доки результат не буде готовий, і повертає його. Також <code>get(timeout, unit)</code> кидає <code>TimeoutException</code>, якщо чекати довше. Методи <code>isDone()</code> та <code>cancel(...)</code> перевіряють готовність і скасовують завдання.`,
      String.raw`Якщо завдання кинуло виняток, <code>get()</code> кидає <code>ExecutionException</code>, а справжній виняток лежить у <code>getCause()</code>. Також <code>get()</code> кидає перевірюваний <code>InterruptedException</code>, якщо чекаючий потік перервали. Тому код із get зазвичай містить try/catch або оголошує throws. Не ігноруйте ці винятки: вони є єдиним каналом повідомлення про помилку завдання.`,
      String.raw`Паралельні обчислення: надішліть кілька завдань, зберіть <code>Future</code>-и в список і лише потім викликайте <code>get()</code> у циклі. Так усі завдання працюють одночасно. Типова помилка — викликати <code>get()</code> одразу після <code>submit</code> у циклі: тоді кожне завдання чекає на попереднє, і ніякого паралелізму немає, хоча код виглядає багатопотоковим.`,
      String.raw`Зручні методи: <code>invokeAll(tasks)</code> виконує колекцію завдань і повертає список <code>Future</code> після завершення всіх; <code>invokeAny(tasks)</code> повертає результат першого успішного. Вони краще підходять, коли потрібен список результатів, і не вимагають вручну керувати чергою чи перемикатися між Future-ами.`,
      String.raw`Скасування: <code>future.cancel(true)</code> намагається перервати завдання (якщо воно ще не завершилось), і подальший <code>get()</code> кине <code>CancellationException</code>. Завдання має реагувати на переривання: періодично перевіряти <code>Thread.currentThread().isInterrupted()</code> або викликати методи, що кидають <code>InterruptedException</code>; інакше скасування не подіє, а потік продовжить працювати.`,
      String.raw`Обмеження Future: його <code>get()</code> блокує потік, а компонувати кілька Future (виконати після першого друге) незручно. Для цього є <code>CompletableFuture</code>, який розглянемо далі. Але для простих завдань «запустити паралельно й зібрати результати» Future цілком достатньо й добре зрозумілий колегам, тому не ускладнюйте без потреби.`,
      String.raw`Відмінність від безпосередньої роботи з потоками: Future ховає деталі створення потоку й повідомляє про помилки через виняток у <code>get()</code>. Це робить код ближчим до звичайних викликів методів: ви просите виконати завдання й пізніше отримуєте результат або помилку. Саме така модель простіше тестується, ніж вручну керовані потоки зі спільними змінними.`,
    ],
    code: [
      String.raw`import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Callable<Integer> task = () -> 21 * 2;
        Future<Integer> future = pool.submit(task);
        System.out.println("doing other work");
        System.out.println(future.get());
        pool.shutdown();
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        List<Callable<Integer>> tasks = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            final int n = i;
            tasks.add(() -> n * n);
        }
        int total = 0;
        for (Future<Integer> f : pool.invokeAll(tasks)) {      // результати в порядку завдань
            total += f.get();
        }
        System.out.println(total);                             // 1 + 4 + 9 + 16 = 30
        pool.shutdown();
    }
}`,
      String.raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newSingleThreadExecutor();
        Future<String> slow = pool.submit(() -> {
            Thread.sleep(500);
            return "late";
        });
        try {
            System.out.println(slow.get(50, TimeUnit.MILLISECONDS));
        } catch (TimeoutException e) {
            System.out.println("timeout");
            slow.cancel(true);
        }
        pool.shutdownNow();
    }
}`,
      String.raw`// аварія: завдання кинуло виняток, а get() обгорнув його в ExecutionException
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newSingleThreadExecutor();
        Future<Integer> f = pool.submit(() -> 10 / 0);
        try {
            System.out.println(f.get());
        } finally {
            pool.shutdown();
        }
    }
}`,
      String.raw`// не компілюється: Runnable не може повертати значення
public class Main {
    public static void main(String[] args) {
        Runnable r = () -> 42;
        r.run();
    }
}`,
    ],
    note: String.raw`<code>Callable</code> повертає результат і може кидати перевірені винятки, а <code>Future.get()</code> блокує до готовності й обгортає помилку завдання в <code>ExecutionException</code>. Для паралельності спершу надішліть усі завдання, потім збирайте результати.`,
    work: String.raw`Future і Callable використовують для паралельних запитів до кількох сервісів, обчислень над частинами даних і фонового завантаження. Правильний шаблон — надіслати всі завдання, а потім зібрати результати з тайм-аутом. Відсутність тайм-ауту на get — одна з частих причин зависань сервісів, коли одна залежність перестає відповідати.`,
    tasks: [
      String.raw`Чому виклик <code>future.get()</code> одразу після <code>submit</code> у циклі позбавляє паралельності?`,
      String.raw`Куди потрапляє виняток, кинутий у Callable, і як його отримати?`,
    ],
  },
  {
    t: "CompletableFuture",
    ch: "Паралелізм",
    easy: String.raw`CompletableFuture — це ланцюжок домовленостей: «коли перше завдання закінчиться, виконай друге з його результатом, а потім третє», і ніхто не стоїть та не чекає, поки це станеться.`,
    p: [
      String.raw`<code>CompletableFuture&lt;T&gt;</code> — це Future, до якого можна додавати дії «після завершення» й комбінувати кілька майбутніх результатів без блокування. Він реалізує <code>Future</code> та <code>CompletionStage</code>. Запуск у фоні: <code>CompletableFuture.supplyAsync(() -&gt; 21)</code> (повертає значення) чи <code>runAsync(runnable)</code> (без результату). За замовчуванням завдання виконуються у спільному пулі <code>ForkJoinPool.commonPool()</code>; власний пул можна передати другим аргументом.`,
      String.raw`Перетворення результату: <code>thenApply(f)</code> застосовує функцію до результату й повертає новий CompletableFuture; <code>thenAccept(consumer)</code> споживає без повернення; <code>thenRun(runnable)</code> виконує дію після завершення. Це нагадує роботу з Optional: ви описуєте конвеєр перетворень, а не чекаєте результат вручну на кожному кроці.`,
      String.raw`Комбінування: <code>thenCompose(f)</code> з'єднує залежні асинхронні кроки (f повертає інший CompletableFuture), <code>thenCombine(other, bi)</code> об'єднує результати двох незалежних, <code>allOf(...)</code> чекає на всі, <code>anyOf(...)</code> — на перший. Різниця між <code>thenApply</code> і <code>thenCompose</code> така сама, як між <code>map</code> і <code>flatMap</code>: другий розплющує вкладені Future.`,
      String.raw`Помилки: якщо крок кинув виняток, наступні <code>thenApply</code> пропускаються, а виняток передається далі. Обробити його можна через <code>exceptionally(ex -&gt; запасне значення)</code>, <code>handle((value, ex) -&gt; ...)</code> (бачить і результат, і помилку) або <code>whenComplete</code> (лише спостерігає). Необроблений виняток виходить із <code>join()</code> як <code>CompletionException</code>.`,
      String.raw`Отримання значення: <code>join()</code> чекає й повертає результат, кидаючи неперевірюваний <code>CompletionException</code>; <code>get()</code> кидає перевірювані винятки; <code>getNow(default)</code> не блокує. Блокувати слід якомога пізніше, у кінці ланцюжка, а посередині працювати асинхронно. Також є <code>orTimeout</code> і <code>completeOnTimeout</code> (Java 9) для тайм-аутів.`,
      String.raw`Суфікс <code>Async</code> (<code>thenApplyAsync</code>) виконує крок в іншому потоці пулу, а без нього крок виконується в потоці, що завершив попередній, або в поточному, якщо результат уже готовий. Для довгих чи блокуючих кроків краще передати власний виконавець, щоб не забити спільний пул, яким користуються й інші частини програми.`,
      String.raw`Практичні сценарії: паралельні виклики до кількох сервісів із подальшим об'єднанням, обробка запитів без блокування потоків, конвеєри перетворень. Недоліки: складніше налагодження (стеки обірвані), легко загубити помилку, а надмірні ланцюжки читаються гірше за звичайний код. Для великої кількості блокуючих завдань сьогодні можна взяти віртуальні потоки (окремий урок) із простим послідовним кодом.`,
      String.raw`Для навчання корисно порівняти два підходи на одній задачі: послідовне виконання трьох залежних викликів і те саме із CompletableFuture. Другий варіант швидший лише тоді, коли виклики незалежні, і саме для таких випадків його варто застосовувати. Якщо кроки залежні один від одного, виграш мінімальний, а код стає складнішим, тому не використовуйте асинхронність просто тому, що вона доступна.`,
    ],
    code: [
      String.raw`import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> result = CompletableFuture
            .supplyAsync(() -> 21)
            .thenApply(x -> x * 2);
        System.out.println(result.join());     // 42
    }
}`,
      String.raw`import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> a = CompletableFuture.supplyAsync(() -> 21).thenApply(x -> x * 2);
        CompletableFuture<Integer> b = CompletableFuture.supplyAsync(() -> 8);
        CompletableFuture<Integer> sum = a.thenCombine(b, Integer::sum);   // дві незалежні задачі
        System.out.println(sum.join());                                    // 50
        CompletableFuture<String> chained = CompletableFuture
            .supplyAsync(() -> "user-7")
            .thenCompose(id -> CompletableFuture.supplyAsync(() -> "profile of " + id));
        System.out.println(chained.join());
    }
}`,
      String.raw`import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> failing = CompletableFuture.supplyAsync(() -> {
            if (true) {
                throw new IllegalStateException("boom");
            }
            return 1;
        });
        System.out.println(failing.exceptionally(ex -> -1).join());
        System.out.println(failing.handle((value, ex) -> ex == null ? "ok" : "failed").join());
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        List<CompletableFuture<Integer>> futures = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            final int n = i;
            futures.add(CompletableFuture.supplyAsync(() -> n * n));
        }
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        List<Integer> squares = new ArrayList<>();
        for (CompletableFuture<Integer> f : futures) {
            squares.add(f.join());
        }
        System.out.println(squares);
    }
}`,
      String.raw`// аварія: необроблена помилка кроку виходить із join() як CompletionException
import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> f = CompletableFuture.supplyAsync(() -> 10 / 0);
        System.out.println("started");
        System.out.println(f.join());
    }
}`,
    ],
    note: String.raw`<code>thenApply</code> перетворює результат, <code>thenCompose</code> з'єднує залежні асинхронні кроки, <code>thenCombine</code> об'єднує незалежні. Помилки обробляйте через <code>exceptionally</code> чи <code>handle</code>, а блокуйте <code>join()</code> лише наприкінці.`,
    work: String.raw`CompletableFuture використовують для агрегації відповідей кількох сервісів, асинхронних клієнтів HTTP і конвеєрів обробки. Ключова навичка — розуміти, де виконується кожен крок і куди потрапляють помилки: необроблена помилка в ланцюжку мовчки з'являється лише при join, і це частий предмет інцидентів.`,
    tasks: [
      String.raw`Чим <code>thenApply</code> відрізняється від <code>thenCompose</code>?`,
      String.raw`Куди потрапляє виняток, кинутий посередині ланцюжка CompletableFuture, і як його обробити?`,
    ],
  },
  {
    t: "Lock і ReentrantLock",
    ch: "Паралелізм",
    easy: String.raw`ReentrantLock — це ключ від кабінки, який можна взяти, віддати й навіть спробувати взяти, не чекаючи: якщо зайнято, ви йдете займатися іншим. Конструкція synchronized такої гнучкості не дає.`,
    p: [
      String.raw`Інтерфейс <code>Lock</code> із пакета <code>java.util.concurrent.locks</code> — гнучка альтернатива synchronized. Основна реалізація — <code>ReentrantLock</code> (реентрантний, як і монітор). Користування: <code>lock.lock(); try { ... } finally { lock.unlock(); }</code>. Блок <code>finally</code> обов'язковий: якщо забути <code>unlock()</code> (наприклад, при винятку), замок залишиться зайнятим навічно, і всі інші потоки зависнуть.`,
      String.raw`Чому не просто synchronized: замок дає більше можливостей. <code>tryLock()</code> пробує взяти замок без очікування й повертає boolean; <code>tryLock(timeout, unit)</code> чекає обмежений час; <code>lockInterruptibly()</code> дозволяє перервати очікування; <code>new ReentrantLock(true)</code> створює «справедливий» замок (черга за порядком, але повільніший); <code>isLocked()</code> та <code>isHeldByCurrentThread()</code> допомагають діагностувати.`,
      String.raw`<code>tryLock</code> дозволяє уникати взаємних блокувань: якщо не вдалося взяти другий замок, віддати перший і спробувати пізніше, а не чекати вічно. Він корисний і для необов'язкових дій: «якщо ніхто не оновлює кеш, оновлю я, а інакше пропущу». Завжди розгалужуйте за результатом: <code>if (lock.tryLock()) { try { ... } finally { lock.unlock(); } }</code>.`,
      String.raw`<code>ReadWriteLock</code> (реалізація <code>ReentrantReadWriteLock</code>) має два замки: читання (його можуть тримати кілька потоків одночасно) і запису (ексклюзивний). Він підходить для даних, які читають частіше, ніж змінюють: кеші, налаштування. Проте він складніший і не завжди швидший за звичайний замок, тому вимірюйте перед використанням. <code>StampedLock</code> дає оптимістичне читання, але його складніше використовувати правильно.`,
      String.raw`<code>Condition</code> замінює <code>wait/notify</code>: <code>Condition notEmpty = lock.newCondition();</code>, а потік викликає <code>notEmpty.await()</code> (віддає замок і чекає) та <code>notEmpty.signal()</code> (будить один потік). Один замок може мати кілька умов (наприклад, «не порожній» і «не повний» для буфера), чого монітор не дозволяє. Завжди перевіряйте умову в циклі <code>while</code>, бо можливі хибні пробудження.`,
      String.raw`Коли synchronized, а коли Lock: для простих критичних секцій synchronized коротший і безпечніший, бо звільняється автоматично. Lock беруть, коли потрібен <code>tryLock</code>, тайм-аут, переривання, кілька умов чи окремі замки читання й запису. Замок можна брати в одному методі, а звільняти в іншому, але це легко призводить до помилок, тому так краще не робити.`,
      String.raw`Типові помилки: <code>unlock()</code> поза finally; <code>unlock()</code> без попереднього <code>lock()</code> (кидає <code>IllegalMonitorStateException</code>); використання різних екземплярів замка для одних даних. Також пам'ятайте: замок не робить змінні потокобезпечними автоматично, а лише коли всі доступи до них проходять під цим самим замком, включно з читанням.`,
      String.raw`Практичний приклад використання tryLock — кеш із фоновим оновленням: якщо замок оновлення вільний, потік оновлює дані, а якщо зайнятий, інший потік уже робить цю роботу, і поточний просто використовує наявне значення. Так уникають зайвих блокувань і дублювання дорогих обчислень. Такий підхід недоступний із synchronized.`,
    ],
    code: [
      String.raw`import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 5000; j++) {
                    counter.increment();
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println(counter.get());     // 20000
    }
}

class Counter {
    private final Lock lock = new ReentrantLock();
    private int value;

    void increment() {
        lock.lock();
        try {
            value++;
        } finally {
            lock.unlock();                     // завжди у finally
        }
    }

    int get() {
        lock.lock();
        try {
            return value;
        } finally {
            lock.unlock();
        }
    }
}`,
      String.raw`import java.util.concurrent.locks.ReentrantLock;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ReentrantLock lock = new ReentrantLock();
        lock.lock();
        boolean[] got = new boolean[1];
        Thread other = new Thread(() -> {
            got[0] = lock.tryLock();            // замок зайнятий головним потоком
            if (got[0]) {
                lock.unlock();
            }
        });
        other.start();
        other.join();
        System.out.println("tryLock while held: " + got[0]);
        lock.unlock();
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Main {
    public static void main(String[] args) {
        Cache cache = new Cache();
        cache.put("a", 1);
        System.out.println(cache.get("a") + " " + cache.get("b"));
    }
}

class Cache {
    private final ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
    private final Map<String, Integer> data = new HashMap<>();

    Integer get(String key) {
        rw.readLock().lock();                   // читати можуть одночасно кілька потоків
        try {
            return data.get(key);
        } finally {
            rw.readLock().unlock();
        }
    }

    void put(String key, int value) {
        rw.writeLock().lock();                  // запис ексклюзивний
        try {
            data.put(key, value);
        } finally {
            rw.writeLock().unlock();
        }
    }
}`,
      String.raw`import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    private static final ReentrantLock LOCK = new ReentrantLock();
    private static final Condition READY = LOCK.newCondition();
    private static boolean ready = false;

    public static void main(String[] args) throws InterruptedException {
        Thread waiter = new Thread(() -> {
            LOCK.lock();
            try {
                while (!ready) {                // умову перевіряють у циклі
                    READY.awaitUninterruptibly();
                }
                System.out.println("go!");
            } finally {
                LOCK.unlock();
            }
        });
        waiter.start();
        LOCK.lock();
        try {
            ready = true;
            READY.signalAll();
        } finally {
            LOCK.unlock();
        }
        waiter.join();
    }
}`,
      String.raw`// аварія: unlock() без попереднього lock() кидає IllegalMonitorStateException
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    public static void main(String[] args) {
        ReentrantLock lock = new ReentrantLock();
        System.out.println(lock.isLocked());
        lock.unlock();
    }
}`,
    ],
    note: String.raw`Замок завжди звільняйте у <code>finally</code>. <code>tryLock</code> дозволяє не чекати вічно й допомагає уникати взаємних блокувань, а умову в <code>Condition.await()</code> перевіряйте в циклі. Для простих секцій <code>synchronized</code> безпечніший.`,
    work: String.raw`ReentrantLock і ReadWriteLock зустрічаються в кешах, пулах з'єднань, черзі завдань і бібліотеках для конкурентного доступу. Основна вимога на рев'ю — unlock у finally й мінімальний час утримання замка: помилки тут рідко падають одразу й часто призводять до зависання всієї підсистеми.`,
    tasks: [
      String.raw`Чому <code>unlock()</code> завжди пишуть у блоці finally?`,
      String.raw`Чим <code>tryLock()</code> відрізняється від <code>lock()</code> і як це допомагає проти взаємних блокувань?`,
    ],
  },
  {
    t: "Atomic-класи і CAS",
    ch: "Паралелізм",
    adv: true,
    easy: String.raw`Атомарна змінна — це лічильник на турнікеті метро: кожен прохід реєструється рівно один раз, навіть якщо люди йдуть одночасно, і ніхто не змушує інших стояти під замком.`,
    p: [
      String.raw`Пакет <code>java.util.concurrent.atomic</code> містить класи з атомарними операціями без блокувань: <code>AtomicInteger</code>, <code>AtomicLong</code>, <code>AtomicBoolean</code>, <code>AtomicReference&lt;T&gt;</code>, масиви на кшталт <code>AtomicIntegerArray</code>. Метод <code>incrementAndGet()</code> збільшує значення й повертає нове за одну неподільну дію: лічильник із чотирьох потоків без synchronized завжди дає правильну суму.`,
      String.raw`Основа їх роботи — CAS (compare-and-swap): «якщо значення дорівнює очікуваному, замінити його на нове; повернути, чи вдалося». Процесор виконує це однією інструкцією. Метод <code>compareAndSet(expected, newValue)</code> повертає boolean. Алгоритми на CAS зазвичай пишуть як цикл: прочитати, обчислити нове, спробувати замінити, а якщо хтось устиг раніше — повторити. Це оптимістична стратегія без очікування.`,
      String.raw`Корисні методи: <code>get()</code>, <code>set(v)</code>, <code>getAndIncrement()</code>, <code>addAndGet(n)</code>, <code>updateAndGet(f)</code> (застосувати функцію), <code>accumulateAndGet(x, f)</code> (наприклад, з <code>Math::max</code>), <code>getAndSet</code>. Методи з функціями самі виконують CAS-цикл; функція має бути без побічних ефектів, бо при конфлікті її можуть викликати повторно.`,
      String.raw`<code>AtomicReference&lt;T&gt;</code> дозволяє атомарно підміняти посилання на незмінний об'єкт: <code>ref.updateAndGet(old -&gt; old.withValue(5))</code>. Це шаблон «копіювання при записі» без замків: читачі завжди бачать цілісний об'єкт. Атомарним є лише сам обмін посиланням, а не зміни всередині змінного об'єкта, тому об'єкт, на який вказує посилання, має бути незмінним.`,
      String.raw`<code>LongAdder</code> і <code>LongAccumulator</code> швидші за AtomicLong при великій конкуренції (багато потоків інкрементують один лічильник): вони розбивають значення на кілька комірок і підсумовують при читанні. Недолік: <code>sum()</code> під час змін дає наближену картину, тому їх використовують для статистики й метрик, а не для точних перевірок у реальному часі.`,
      String.raw`Проблема ABA: потік бачить значення A, інший змінює його на B і назад на A, а CAS вважає, що нічого не змінилося. Для чисел це часто нешкідливо, а для посилань у структурах даних може порушити логіку; для таких випадків є <code>AtomicStampedReference</code> із додатковою «позначкою» версії. У прикладному коді ця проблема трапляється рідко.`,
      String.raw`Атомарні змінні не замінюють усе: складні дії над кількома змінними все одно потребують замка, бо кожна змінна атомарна окремо, а комбінація — ні. Для одного лічильника, прапорця чи посилання Atomic — ідеальний вибір: швидко, без взаємних блокувань і з чистим кодом, який легко читати й перевіряти.`,
      String.raw`Для порівняння продуктивності: на невеликій кількості потоків AtomicInteger і synchronized дають схожі результати, а при сотнях потоків LongAdder значно випереджає обидва. Тому вибір залежить від навантаження, і вимірювання (наприклад, інструментом JMH) краще за здогадки. Для більшості прикладних програм достатньо простого AtomicInteger.`,
    ],
    code: [
      String.raw`import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        AtomicInteger counter = new AtomicInteger();
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 10000; j++) {
                    counter.incrementAndGet();
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println(counter.get());     // 40000
    }
}`,
      String.raw`import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static void updateMax(AtomicInteger max, int candidate) {
        int current = max.get();
        while (candidate > current) {
            if (max.compareAndSet(current, candidate)) {     // CAS-цикл
                return;
            }
            current = max.get();                              // хтось змінив: читаємо знову
        }
    }

    public static void main(String[] args) throws InterruptedException {
        AtomicInteger max = new AtomicInteger(Integer.MIN_VALUE);
        Thread a = new Thread(() -> { for (int i = 0; i < 1000; i += 2) { updateMax(max, i); } });
        Thread b = new Thread(() -> { for (int i = 1; i < 1000; i += 2) { updateMax(max, i); } });
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println(max.get());                        // 999
    }
}`,
      String.raw`import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;

public class Main {
    public static void main(String[] args) {
        AtomicInteger best = new AtomicInteger(5);
        best.accumulateAndGet(9, Math::max);
        best.accumulateAndGet(3, Math::max);
        System.out.println(best.get());          // 9
        LongAdder hits = new LongAdder();        // швидкий лічильник для багатьох потоків
        hits.add(5);
        hits.increment();
        System.out.println(hits.sum());          // 6
    }
}`,
      String.raw`import java.util.concurrent.atomic.AtomicReference;

public class Main {
    record Config(String mode, int limit) {
        Config withLimit(int limit) {
            return new Config(mode, limit);
        }
    }

    public static void main(String[] args) {
        AtomicReference<Config> ref = new AtomicReference<>(new Config("fast", 10));
        Config old = ref.get();
        ref.updateAndGet(c -> c.withLimit(50));          // підміна незмінного об'єкта
        System.out.println(old);
        System.out.println(ref.get());
    }
}`,
      String.raw`// не компілюється: AtomicInteger — об'єкт, а не int, тому числом його ініціалізувати не можна
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        AtomicInteger count = 0;
        System.out.println(count.get());
    }
}`,
    ],
    note: String.raw`Atomic-класи виконують складені дії (<code>incrementAndGet</code>, <code>compareAndSet</code>) атомарно без замків. Кілька атомарних змінних разом не дають атомарності комбінації. Функції в <code>updateAndGet</code> мають бути без побічних ефектів: при конфлікті вони виконуються повторно.`,
    work: String.raw`Атомарні лічильники, прапорці й посилання зустрічаються в метриках, генераторах ідентифікаторів, обмежувачах швидкості й кешах. Вони швидші й безпечніші за ручні замки для простих випадків. А LongAdder обирають там, де тисячі запитів на секунду оновлюють один лічильник статистики.`,
    tasks: [
      String.raw`Чим <code>compareAndSet</code> відрізняється від звичайного присвоєння?`,
      String.raw`Чому дві атомарні змінні не гарантують атомарності зміни обох разом?`,
    ],
  },
  {
    t: "Конкурентні колекції",
    ch: "Паралелізм",
    easy: String.raw`Звичайна колекція — це зошит, у якому одночасно пишуть кілька людей і псують записи. Конкурентні колекції — зошити з вбудованою чергою на запис: кожен пише по черзі, а читати можуть усі разом.`,
    p: [
      String.raw`Звичайні колекції (<code>ArrayList</code>, <code>HashMap</code>) не потокобезпечні: одночасна зміна з кількох потоків може пошкодити внутрішню структуру, втратити записи або навіть зациклити програму. Спроба «захистити» їх обгорткою <code>Collections.synchronizedList</code> працює для окремих операцій, але складені дії й перебір усе одно доводиться синхронізувати вручну.`,
      String.raw`<code>ConcurrentHashMap</code> — потокобезпечна мапа без блокування всієї структури: читання майже без замків, а записи блокують лише невелику частину. Вона підтримує атомарні складені методи: <code>putIfAbsent</code>, <code>computeIfAbsent</code>, <code>merge</code>, <code>compute</code>. Саме <code>merge(word, 1, Integer::sum)</code> робить підрахунок із багатьох потоків правильним без зовнішніх замків.`,
      String.raw`Обмеження: <code>ConcurrentHashMap</code> не допускає <code>null</code> ні як ключ, ні як значення (щоб відрізнити «немає» від «null»). Операції над кількома ключами не атомарні: <code>size()</code> дає наближене значення під час змін, а перебір відображає стан «слабко узгоджено» — без <code>ConcurrentModificationException</code>, але може не показати найновіші зміни.`,
      String.raw`<code>CopyOnWriteArrayList</code> при кожній зміні копіює весь масив: читання й перебір дуже швидкі й безпечні (ітератор бачить знімок), а запис дорогий. Тому він підходить для списків слухачів і налаштувань, які рідко змінюються й часто читаються. Для частих змін він непридатний: кожен запис копіює всі елементи.`,
      String.raw`Інші типи: <code>ConcurrentLinkedQueue</code> і <code>ConcurrentLinkedDeque</code> (черги без блокувань), <code>ConcurrentSkipListMap</code> та <code>ConcurrentSkipListSet</code> (відсортовані конкурентні), <code>BlockingQueue</code> (окремий урок), <code>Collections.synchronizedMap</code> (обгортка з одним замком). Щоб отримати множину, використовують <code>ConcurrentHashMap.newKeySet()</code>.`,
      String.raw`Вибір: потрібна мапа з багатьох потоків — <code>ConcurrentHashMap</code>; список із рідкими змінами — <code>CopyOnWriteArrayList</code>; черга між потоками — <code>BlockingQueue</code> чи <code>ConcurrentLinkedQueue</code>. Не обгортайте звичайну колекцію в synchronizedXxx, якщо є спеціалізована конкурентна, яка краще масштабується під навантаженням.`,
      String.raw`Помилки: вважати, що потокобезпечна колекція робить потокобезпечною всю логіку (послідовність «перевір, потім змін» усе одно не атомарна без спеціальних методів); використовувати <code>size()</code> для прийняття рішень; змінювати об'єкти всередині колекції без синхронізації; обирати <code>CopyOnWriteArrayList</code> для частих записів. Також у документації методів кожної колекції зазначено, які операції атомарні, а які ні, тож варто читати її перед використанням.`,
      String.raw`Приклад зі справжньої практики: реєстр активних сесій користувачів зберігається в <code>ConcurrentHashMap&lt;String, Session&gt;</code>, де ключ — ідентифікатор сесії. Створення сесії робить <code>putIfAbsent</code>, оновлення часу активності — <code>computeIfPresent</code>, а прибирання застарілих записів — <code>removeIf</code> на <code>values()</code> чи <code>entrySet()</code>. Усі ці операції атомарні або безпечні, і сервер може одночасно обробляти тисячі запитів без глобального замка. Подібно працюють кеші відповідей, реєстри завдань і лічильники метрик у більшості серверних бібліотек.`,
    ],
    code: [
      String.raw`import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Map<String, Integer> counts = new ConcurrentHashMap<>();
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    counts.merge("a", 1, Integer::sum);
                    counts.merge("b", 1, Integer::sum);
                    counts.merge("a", 1, Integer::sum);
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println(new TreeMap<>(counts));   // {a=8000, b=4000}
    }
}`,
      String.raw`import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> listeners = new CopyOnWriteArrayList<>(List.of("x"));
        int iterated = 0;
        for (String s : listeners) {
            iterated++;
            listeners.add("y");                      // безпечно: ітератор бачить знімок
        }
        System.out.println(iterated + " " + listeners);
    }
}`,
      String.raw`import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Set<Integer> seen = ConcurrentHashMap.newKeySet();
        Thread a = new Thread(() -> { for (int i = 0; i < 100; i++) { seen.add(i); } });
        Thread b = new Thread(() -> { for (int i = 50; i < 150; i++) { seen.add(i); } });
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println(seen.size() + " " + new TreeSet<>(seen).first());   // 150 0
    }
}`,
      String.raw`// аварія: ConcurrentHashMap не приймає null, put кидає NullPointerException
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    public static void main(String[] args) {
        ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
        map.put("a", "x");
        System.out.println(map.size());
        map.put("b", null);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        List<Integer> list = Collections.synchronizedList(new ArrayList<>());
        Thread a = new Thread(() -> { for (int i = 0; i < 500; i++) { list.add(i); } });
        Thread b = new Thread(() -> { for (int i = 0; i < 500; i++) { list.add(i); } });
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println(list.size());          // 1000: окремі додавання безпечні
        synchronized (list) {                     // але перебір треба синхронізувати вручну
            int sum = 0;
            for (int x : list) {
                sum += x;
            }
            System.out.println(sum);
        }
    }
}`,
    ],
    note: String.raw`Звичайні колекції не потокобезпечні. <code>ConcurrentHashMap</code> дає атомарні <code>merge</code> та <code>computeIfAbsent</code> і не приймає <code>null</code>, а <code>CopyOnWriteArrayList</code> швидко читає, але дорого змінюється. Потокобезпечна колекція не робить потокобезпечною послідовність власних дій.`,
    work: String.raw`ConcurrentHashMap — основа кешів, реєстрів сесій і лічильників у серверних застосунках; CopyOnWriteArrayList — списків слухачів подій. Вибір неправильної колекції (HashMap у багатопотоковому коді або CopyOnWriteArrayList для частих записів) — типова причина рідкісних збоїв чи просідання продуктивності.`,
    tasks: [
      String.raw`Чому <code>HashMap</code> небезпечно змінювати з кількох потоків?`,
      String.raw`Коли <code>CopyOnWriteArrayList</code> доречний, а коли ні?`,
    ],
  },
  {
    t: "CountDownLatch, Semaphore і CyclicBarrier",
    ch: "Паралелізм",
    easy: String.raw`Засувка — це старт забігу: суддя чекає, поки всі бігуни стануть на лінію. Семафор — гардероб з обмеженою кількістю вішаків, а бар'єр — спільна лінія, за якою група чекає одне одного.`,
    p: [
      String.raw`Синхронізатори координують потоки без ручних замків. <code>CountDownLatch</code> (засувка) має лічильник: потоки викликають <code>countDown()</code>, а інші чекають у <code>await()</code>, поки лічильник не досягне нуля. Засувка одноразова: після нуля вона відкрита назавжди. Типовий випадок — головний потік чекає завершення N робочих; ще один — «стартовий пістолет» для одночасного старту.`,
      String.raw`<code>Semaphore</code> обмежує кількість одночасних користувачів ресурсу: <code>new Semaphore(3)</code> дозволяє до трьох потоків одночасно. Метод <code>acquire()</code> бере дозвіл (і чекає, якщо немає), <code>release()</code> повертає. Метод <code>tryAcquire()</code> пробує без очікування. Семафор підходить для пулів з'єднань, обмеження паралельних запитів до зовнішнього сервісу, обмеження розміру черги.`,
      String.raw`Правила: <code>release()</code> завжди у <code>finally</code>, щоб дозвіл повернувся при помилці; кількість release має відповідати acquire. Семафор з одним дозволом схожий на замок, але не прив'язаний до потоку: дозвіл можна повернути з іншого потоку. «Справедливий» режим (<code>new Semaphore(n, true)</code>) обслуговує чергу в порядку надходження, хоча й повільніше.`,
      String.raw`<code>CyclicBarrier</code> (циклічний бар'єр) змушує групу з N потоків чекати одне одного: кожен викликає <code>await()</code> і блокується, поки всі N не прийдуть, після чого всі рушають далі. Бар'єр можна використовувати повторно (звідси «циклічний»), а за потреби він виконує спільну дію при проходженні. Типове застосування — паралельні алгоритми з фазами: усі завершують фазу, а лише потім стартує наступна.`,
      String.raw`<code>Phaser</code> — гнучкіший варіант із динамічною кількістю учасників і кількома фазами, а <code>Exchanger</code> дозволяє двом потокам обмінятися об'єктами. Їх використовують рідко, і в більшості випадків вистачає засувки, семафора й бар'єра. Для простого «дочекатись завершення завдань» пул потоків із <code>awaitTermination</code> чи <code>invokeAll</code> часто достатній і без засувки.`,
      String.raw`Тайм-аути: <code>await(timeout, unit)</code> у засувки й бар'єра дозволяє не чекати вічно; для бар'єра зламана очікуванням група кидає <code>BrokenBarrierException</code>. Завжди використовуйте тайм-аути для зовнішніх очікувань, щоб помилка в одному потоці не заморожувала всю програму й щоб проблему було видно в журналах.`,
      String.raw`Типові помилки: забути <code>countDown()</code> при виняткових ситуаціях (потрібен finally, інакше <code>await()</code> чекатиме вічно); використовувати засувку повторно (вона одноразова); не повернути дозвіл семафора; створити бар'єр на N потоків, запустивши менше. Усі ці помилки призводять до зависання, а не до винятку, тож їх складно помітити без дампа потоків.`,
      String.raw`Для тестів засувки особливо корисні: замість <code>Thread.sleep(1000)</code> «про всяк випадок» тест чекає <code>latch.await(5, TimeUnit.SECONDS)</code> і завершується миттєво, щойно подія сталася. Такі тести стабільніші й швидші, а тайм-аут гарантує, що зависання не заблокує всю збірку.`,
    ],
    code: [
      String.raw`import java.util.concurrent.CountDownLatch;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        CountDownLatch done = new CountDownLatch(3);
        for (int i = 1; i <= 3; i++) {
            final int id = i;
            new Thread(() -> {
                try {
                    System.out.println("worker " + id + " works");
                } finally {
                    done.countDown();            // завжди у finally
                }
            }).start();
        }
        done.await();
        System.out.println("all workers finished");
    }
}`,
      String.raw`import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch ready = new CountDownLatch(3);
        AtomicInteger started = new AtomicInteger();
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                ready.countDown();
                try {
                    start.await();               // усі чекають «стартового пістолета»
                } catch (InterruptedException e) {
                    return;
                }
                started.incrementAndGet();
            }).start();
        }
        ready.await();
        start.countDown();                       // старт для всіх
        Thread.sleep(100);
        System.out.println(started.get());
    }
}`,
      String.raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Semaphore permits = new Semaphore(2);
        AtomicInteger current = new AtomicInteger();
        AtomicInteger max = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(6);
        for (int i = 0; i < 6; i++) {
            pool.execute(() -> {
                try {
                    permits.acquire();
                    try {
                        int now = current.incrementAndGet();
                        max.accumulateAndGet(now, Math::max);
                        Thread.sleep(20);
                        current.decrementAndGet();
                    } finally {
                        permits.release();       // дозвіл повертаємо завжди
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println(max.get() <= 2);
    }
}`,
      String.raw`import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        AtomicInteger phase1 = new AtomicInteger();
        CyclicBarrier barrier = new CyclicBarrier(3, () -> System.out.println("phase 1 done: " + phase1.get()));
        Thread[] threads = new Thread[3];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                phase1.incrementAndGet();
                try {
                    barrier.await();             // чекаємо, поки прийдуть усі троє
                } catch (InterruptedException | BrokenBarrierException e) {
                    return;
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
    }
}`,
      String.raw`// аварія: лічильник засувки не може бути від'ємним, IllegalArgumentException
import java.util.concurrent.CountDownLatch;

public class Main {
    public static void main(String[] args) {
        System.out.println("creating");
        CountDownLatch latch = new CountDownLatch(-1);
        System.out.println(latch.getCount());
    }
}`,
    ],
    note: String.raw`<code>countDown()</code> завжди викликайте у <code>finally</code>, інакше <code>await()</code> зависне. Засувка одноразова, семафор обмежує одночасний доступ (<code>release()</code> теж у <code>finally</code>), а бар'єр повторно збирає групу потоків.`,
    work: String.raw`Засувки застосовують у тестах і запуску сервісів (дочекатися готовності залежностей), семафори — для обмеження паралельних запитів до зовнішніх систем, бар'єри — у паралельних обчисленнях по фазах. Усі ці об'єкти замінюють крихкі спроби синхронізації через sleep.`,
    tasks: [
      String.raw`Чим CountDownLatch відрізняється від CyclicBarrier?`,
      String.raw`Для чого потрібен семафор і чому <code>release()</code> розміщують у finally?`,
    ],
  },
  {
    t: "BlockingQueue: виробник і споживач",
    ch: "Паралелізм",
    adv: true,
    easy: String.raw`Це черга між кухарем і офіціантом: кухар кладе страви на стійку, офіціант забирає. Якщо стійка повна, чекає кухар, якщо порожня — офіціант, і ніхто не бігає та не питає «ну що, готово?».`,
    p: [
      String.raw`Шаблон «виробник-споживач»: одні потоки створюють дані, інші їх обробляють. Між ними ставлять чергу, яка вирішує синхронізацію: <code>BlockingQueue&lt;T&gt;</code> із пакета <code>java.util.concurrent</code>. Метод <code>put(x)</code> додає елемент і чекає, якщо черга повна; <code>take()</code> забирає й чекає, якщо порожня. Ні <code>wait/notify</code>, ні ручні замки не потрібні: черга сама потокобезпечна.`,
      String.raw`Реалізації: <code>ArrayBlockingQueue</code> (обмежена, на масиві, з фіксованою ємністю), <code>LinkedBlockingQueue</code> (необмежена за замовчуванням або обмежена), <code>PriorityBlockingQueue</code> (за пріоритетом), <code>SynchronousQueue</code> (без буфера: put чекає, поки хтось зробить take), <code>DelayQueue</code> (елементи доступні після затримки). Обмежена черга створює «зворотний тиск»: швидкий виробник сповільнюється, коли споживач не встигає.`,
      String.raw`Набори методів: блокуючі <code>put</code> і <code>take</code>; з тайм-аутом <code>offer(x, time, unit)</code> і <code>poll(time, unit)</code>; без очікування <code>offer</code> (повертає false, якщо черга повна) та <code>poll</code> (повертає null, якщо порожня); а також <code>add</code> і <code>remove</code> із винятками. Для виробничого коду краще брати варіанти з тайм-аутом, щоб потоки не зависали вічно.`,
      String.raw`Завершення роботи: споживача в нескінченному циклі <code>take()</code> потрібно якось зупинити. Типові способи: «отруйна пілюля» (poison pill) — спеціальний елемент, побачивши який споживач виходить; переривання потоку (<code>interrupt</code>) з обробкою <code>InterruptedException</code>; прапорець разом з <code>poll(timeout)</code>. Для кількох споживачів кладуть по одній пілюлі на кожного, інакше хтось залишиться чекати.`,
      String.raw`Гарантії: порядок FIFO зберігається, а дії виробника до <code>put</code> відбуваються раніше за дії споживача після <code>take</code> (happens-before), тому передані об'єкти безпечно публікуються. Не змінюйте об'єкт після передачі в чергу, якщо його читають інші потоки: безпека публікації не поширюється на подальші зміни.`,
      String.raw`Розмір черги й кількість споживачів — параметри налаштування. Занадто велика черга приховує проблему повільного споживача й споживає пам'ять; замала спричиняє блокування виробників. Моніторьте довжину черги: її зростання — ознака, що споживачі не встигають. У сервісах такі черги стоять між прийомом запитів і їх обробкою.`,
      String.raw`Альтернативи: <code>ExecutorService</code> усередині вже є чергою завдань і пулом споживачів, тому для простого «виконати завдання у фоні» власна черга не потрібна. Власна <code>BlockingQueue</code> корисна для потоків даних між етапами конвеєра, обробки подій і передачі повідомлень між компонентами однієї програми.`,
      String.raw`Типова помилка початківців — перевіряти <code>queue.isEmpty()</code> перед <code>take()</code>: між перевіркою й вилученням інший потік може забрати елемент. Правильно просто викликати <code>take()</code> чи <code>poll(timeout)</code> і діяти за результатом; перевірку й дію черга виконує атомарно сама.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class Main {
    static final int POISON = -1;

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);    // обмежена черга
        List<Integer> consumed = new ArrayList<>();
        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 5; i++) {
                    queue.put(i);                                      // чекає, якщо черга повна
                }
                queue.put(POISON);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        Thread consumer = new Thread(() -> {
            try {
                while (true) {
                    int x = queue.take();
                    if (x == POISON) {
                        break;
                    }
                    consumed.add(x);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
        System.out.println(consumed);
    }
}`,
      String.raw`import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class Main {
    public static void main(String[] args) {
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(2);
        System.out.println(queue.offer("a"));      // true
        System.out.println(queue.offer("b"));      // true
        System.out.println(queue.offer("c"));      // false: черга повна, без очікування
        System.out.println(queue.remainingCapacity());
    }
}`,
      String.raw`import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> queue = new LinkedBlockingQueue<>();
        String item = queue.poll(50, TimeUnit.MILLISECONDS);      // порожня черга: тайм-аут
        System.out.println(item);                                 // null
        queue.put("hello");
        System.out.println(queue.poll(50, TimeUnit.MILLISECONDS));
    }
}`,
      String.raw`import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new LinkedBlockingQueue<>();
        AtomicInteger total = new AtomicInteger();
        Thread[] consumers = new Thread[2];
        for (int i = 0; i < consumers.length; i++) {
            consumers[i] = new Thread(() -> {
                try {
                    while (true) {
                        int x = queue.take();
                        if (x < 0) {
                            break;                             // кожен споживач отримує свою пілюлю
                        }
                        total.addAndGet(x);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            consumers[i].start();
        }
        for (int i = 1; i <= 10; i++) {
            queue.put(i);
        }
        queue.put(-1);
        queue.put(-1);
        for (Thread t : consumers) {
            t.join();
        }
        System.out.println(total.get());                       // 55
    }
}`,
      String.raw`// аварія: add() для повної обмеженої черги кидає IllegalStateException
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class Main {
    public static void main(String[] args) {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(1);
        queue.add(1);
        System.out.println("first added");
        queue.add(2);
    }
}`,
    ],
    note: String.raw`<code>put</code> і <code>take</code> блокуються при повній і порожній черзі. Обмежена черга створює зворотний тиск, а споживача зупиняють «отруйною пілюлею» чи перериванням. Для виробничого коду віддавайте перевагу методам із тайм-аутом.`,
    work: String.raw`Черги між потоками — основа конвеєрів обробки даних, брокерів повідомлень (у зменшеному вигляді), логування й обробки подій. Контроль розміру черги та чітка схема завершення споживачів рятують від зависань і витоків пам'яті в реальних сервісах.`,
    tasks: [
      String.raw`Для чого потрібна обмежена черга і що таке зворотний тиск?`,
      String.raw`Як зупинити споживача, що чекає на <code>take()</code>?`,
    ],
  },
  {
    t: "Deadlock, голодування і діагностика",
    ch: "Паралелізм",
    easy: String.raw`Взаємне блокування — це двоє людей у вузькому коридорі, що кожен чекає, поки інший відступить. Ніхто не рухається, але нічого й не зламано: програма просто стоїть.`,
    p: [
      String.raw`Deadlock (взаємне блокування) виникає, коли два чи більше потоків чекають один на одного вічно: потік A тримає замок 1 і чекає замок 2, а потік B тримає замок 2 і чекає замок 1. Жоден не може продовжити. Програма не падає й не виводить помилок, вона просто зависає, і саме тому цю помилку так складно помітити без спеціальних інструментів.`,
      String.raw`Чотири умови deadlock (умови Коффмана): взаємне виключення (ресурс не можна ділити), утримання й очікування (потік тримає ресурс і чекає інший), відсутність витіснення (ресурс не можна забрати силоміць) та циклічне очікування (замкнене коло чекання). Усунення будь-якої з умов запобігає блокуванню. Найпрактичніше розірвати саме циклічне очікування.`,
      String.raw`Головна техніка — єдиний порядок захоплення замків: якщо всі потоки беруть замки в одній і тій самій послідовності (наприклад, за зростанням ідентифікатора рахунку), цикл неможливий. Приклад: переказ між двома рахунками блокує спочатку рахунок із меншим id. Тому правило таке: ніколи не беріть замки в довільному порядку, залежному від аргументів.`,
      String.raw`Інші методи: <code>tryLock</code> із тайм-аутом і відступ (віддати перший замок, якщо другий не вдалося взяти); мінімізація кількості замків; відмова викликати чужий код (колбеки, перевизначувані методи) під замком; використання вищих абстракцій (черги, пули, незмінні дані), де замків немає. Кожен вкладений замок — це потенційний ризик, який варто обґрунтувати.`,
      String.raw`Голодування (starvation): потік довго не отримує ресурс, бо інші постійно його випереджають (несправедливі замки, низькі пріоритети, довгі завдання в загальному пулі). Livelock: потоки активно реагують один на одного, але не просуваються (як двоє людей, що щоразу відходять убік в одному напрямку). Обидві проблеми лікують справедливими чергами, обмеженнями й випадковими затримками.`,
      String.raw`Діагностика: дамп потоків (<code>jstack &lt;pid&gt;</code>, <code>jcmd &lt;pid&gt; Thread.print</code>, VisualVM) показує стан кожного потоку й інформацію про взаємне блокування: «Found one Java-level deadlock». Програмно доступний <code>ThreadMXBean.findDeadlockedThreads()</code>. Імена потоків у дампі — ще одна причина їх задавати, бо «Thread-37» нічого не каже про відповідальний код.`,
      String.raw`Профілактика: код-рев'ю, що шукає вкладені замки; тести з тайм-аутом (щоб зависання не блокувало збірку); моніторинг (кількість заблокованих потоків, довжина черг); правила проєкту про порядок замків. Найкраще — не мати вкладених замків і взагалі не ділити змінний стан, а передавати дані повідомленнями. Ці правила прості, але саме їхнє дотримання відрізняє надійні системи від тих, що зависають раз на місяць.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Acc a = new Acc(1, 1000);
        Acc b = new Acc(2, 1000);
        Thread t1 = new Thread(() -> { for (int i = 0; i < 200; i++) { transfer(a, b, 1); } });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 100; i++) { transfer(b, a, 1); } });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(a.balance + " " + b.balance);
    }

    static void transfer(Acc from, Acc to, int amount) {
        Acc first = from.id < to.id ? from : to;       // єдиний порядок: за зростанням id
        Acc second = first == from ? to : from;
        synchronized (first) {
            synchronized (second) {
                from.balance -= amount;
                to.balance += amount;
            }
        }
    }
}

class Acc {
    final int id;
    int balance;

    Acc(int id, int balance) {
        this.id = id;
        this.balance = balance;
    }
}`,
      String.raw`import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static boolean transfer(ReentrantLock first, ReentrantLock second) throws InterruptedException {
        if (first.tryLock(50, TimeUnit.MILLISECONDS)) {
            try {
                if (second.tryLock(50, TimeUnit.MILLISECONDS)) {
                    try {
                        return true;                      // обидва замки взято
                    } finally {
                        second.unlock();
                    }
                }
            } finally {
                first.unlock();                           // відступаємо, якщо другий недоступний
            }
        }
        return false;
    }

    public static void main(String[] args) throws InterruptedException {
        ReentrantLock a = new ReentrantLock();
        ReentrantLock b = new ReentrantLock();
        System.out.println(transfer(a, b));
    }
}`,
      String.raw`import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;

public class Main {
    public static void main(String[] args) {
        ThreadMXBean bean = ManagementFactory.getThreadMXBean();
        long[] deadlocked = bean.findDeadlockedThreads();     // null, якщо взаємних блокувань немає
        System.out.println(deadlocked == null);
        System.out.println(bean.getThreadCount() > 0);
    }
}`,
      String.raw`// не компілюється: synchronized потребує об'єкта, а не примітивного значення
public class Main {
    public static void main(String[] args) {
        int lock = 5;
        synchronized (lock) {
            System.out.println("inside");
        }
    }
}`,
    ],
    note: String.raw`Взаємне блокування запобігають єдиним порядком захоплення замків, <code>tryLock</code> із тайм-аутом і мінімумом вкладених замків. Діагностують дампом потоків (<code>jstack</code>): він прямо повідомляє про знайдений deadlock.`,
    work: String.raw`Deadlock у продакшні виглядає як сервіс, що перестав відповідати без жодної помилки в журналі й без навантаження на процесор. Перше, що роблять інженери, — знімають дамп потоків, і вміння прочитати його, знайти замкнене коло та виправити порядок замків — це навичка, за якою цінують досвідченого розробника.`,
    tasks: [
      String.raw`Назвіть чотири умови взаємного блокування і яку з них найпрактичніше усунути.`,
      String.raw`Як переказ між двома рахунками можна зробити безпечним від deadlock?`,
    ],
  },
  {
    t: "Віртуальні потоки",
    ch: "Паралелізм",
    adv: true,
    easy: String.raw`Віртуальний потік — це легкий мопед замість важкої вантажівки: їх можна запустити тисячі, а коли водій чекає, під'їжджає наступний, і двигун не простоює.`,
    p: [
      String.raw`Віртуальні потоки (Java 21) — це легкі потоки, якими керує JVM, а не операційна система. Звичайний (платформний) потік займає близько мегабайта пам'яті під стек і відображається на потік ОС, тому їх можна мати лише тисячі. Віртуальних можна створювати мільйони: кожен займає лише кілька кілобайтів і працює поверх невеликої кількості потоків-носіїв.`,
      String.raw`Головна ідея: коли віртуальний потік блокується (очікує мережу, <code>sleep</code>, чергу), JVM «відчіплює» його від потоку-носія, і той одразу виконує інший віртуальний потік. Тому код можна писати у простому блокуючому стилі, «один потік на запит», а масштабування отримувати майже безкоштовно. Для завдань, що здебільшого чекають введення-виведення, це справжня зміна підходу.`,
      String.raw`Створення: <code>Thread.ofVirtual().start(runnable)</code>, <code>Thread.startVirtualThread(runnable)</code>, <code>Thread.ofVirtual().name("v-", 0).factory()</code> і найзручніше <code>Executors.newVirtualThreadPerTaskExecutor()</code>: кожне завдання отримує новий віртуальний потік, а пул не потрібен. Завдяки try-with-resources (Java 19 і новіші) виконавець чекає завершення всіх завдань при закритті.`,
      String.raw`Віртуальні потоки не пулюють: на відміну від платформних, створювати новий потік на кожне завдання — це норма, а пул віртуальних потоків — антипатерн. Обмежити паралельність (наприклад, щодо зовнішнього сервісу) треба семафором, а не розміром пулу. Вони завжди є демонами й не мають пріоритетів, а <code>Thread.currentThread()</code> працює як і раніше.`,
      String.raw`Обмеження: віртуальні потоки не прискорюють обчислення, зв'язані з процесором (CPU-bound): паралельно їх працює рівно стільки, скільки є ядер. Вони корисні саме для очікування. «Прикріплення» (pinning) трапляється, коли потік блокується всередині <code>synchronized</code> чи нативного коду: потік-носій тоді не звільняється (у новіших версіях це покращено); для довгих очікувань замість synchronized зручніше <code>ReentrantLock</code>.`,
      String.raw`Сумісність: майже весь наявний код працює без змін, бо віртуальний потік — це той самий <code>Thread</code>. Але бібліотеки, що використовують <code>ThreadLocal</code>, потребують уваги (мільйони потоків — мільйони копій), а старі пули й кеші, які припускали «мало потоків», слід переглянути. Для спостереження за віртуальними потоками є <code>jcmd Thread.dump_to_file</code>.`,
      String.raw`Коли обирати: серверні застосунки з великою кількістю одночасних блокуючих запитів (HTTP, база, черги) — віртуальні потоки; обчислення на всіх ядрах — пул платформних потоків чи паралельні потоки Stream; складні реактивні конвеєри — розгляньте, чи не простіше їх переписати на послідовний код із віртуальними потоками. Структуроване паралельне виконання (<code>StructuredTaskScope</code>) поки доступне лише в попередньому перегляді, тому в курсі його не використовуємо.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t = Thread.startVirtualThread(() -> System.out.println("hello from virtual"));
        t.join();
        System.out.println(t.isVirtual());
    }
}`,
      String.raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        AtomicInteger done = new AtomicInteger();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 1000; i++) {
                executor.execute(() -> {
                    try {
                        Thread.sleep(10);               // блокування не тримає потік ОС
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    done.incrementAndGet();
                });
            }
        }
        System.out.println(done.get());
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread named = Thread.ofVirtual().name("v-worker").start(() ->
            System.out.println(Thread.currentThread().getName() + " virtual=" + Thread.currentThread().isVirtual()));
        named.join();
        Thread platform = Thread.ofPlatform().name("p-worker").start(() ->
            System.out.println(Thread.currentThread().getName() + " virtual=" + Thread.currentThread().isVirtual()));
        platform.join();
    }
}`,
      String.raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        Semaphore limit = new Semaphore(3);               // обмеження паралельності семафором, а не пулом
        AtomicInteger max = new AtomicInteger();
        AtomicInteger now = new AtomicInteger();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 20; i++) {
                executor.execute(() -> {
                    try {
                        limit.acquire();
                        try {
                            max.accumulateAndGet(now.incrementAndGet(), Math::max);
                            Thread.sleep(5);
                            now.decrementAndGet();
                        } finally {
                            limit.release();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                });
            }
        }
        System.out.println(max.get() <= 3);
    }
}`,
      String.raw`// аварія: віртуальний потік також можна запустити лише один раз, IllegalThreadStateException
public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t = Thread.ofVirtual().unstarted(() -> System.out.println("run"));
        t.start();
        t.join();
        t.start();
    }
}`,
    ],
    note: String.raw`Віртуальні потоки легкі: їх можна запускати тисячами, по одному на завдання, без пулу. Вони виграють на завданнях із очікуванням вводу-виводу, але не прискорюють обчислення. Обмежувати паралельність слід семафором, а не розміром пулу.`,
    work: String.raw`Віртуальні потоки дозволяють писати сервери в простому блокуючому стилі й масштабувати їх до десятків тисяч одночасних запитів без реактивних бібліотек. Нові версії популярних фреймворків уже використовують їх за замовчуванням або за одним налаштуванням, тому розуміння їх обмежень (pinning, ThreadLocal) стало потрібним сучасним Java-розробникам.`,
    tasks: [
      String.raw`Чому віртуальні потоки не прискорюють обчислення, що навантажують процесор?`,
      String.raw`Чому пул віртуальних потоків вважають антипатерном і чим обмежити паралельність?`,
    ],
  },
  {
    t: "ScheduledExecutorService: відкладені й періодичні задачі",
    ch: "Паралелізм",
    easy: String.raw`Планувальник — це будильник для програми: «через п'ять хвилин нагадай», «щодня о сьомій подзвони». Кожна задача чекає свого часу, а програма тим часом займається іншим.`,
    p: [
      String.raw`Інтерфейс <code>ScheduledExecutorService</code> виконує завдання із затримкою або періодично. Створення: <code>Executors.newScheduledThreadPool(2)</code> або <code>newSingleThreadScheduledExecutor()</code>. Це правильна заміна старому <code>Timer</code>: пул справляється з кількома завданнями, виняток в одному не ламає решту, а керування потоками надійніше й гнучкіше.`,
      String.raw`Одноразове відкладене виконання: <code>schedule(task, 5, TimeUnit.SECONDS)</code> повертає <code>ScheduledFuture</code>, за яким можна скасувати завдання чи отримати результат (для <code>Callable</code>). Завдання виконається після затримки, але не раніше; точність залежить від навантаження системи, тож не розраховуйте на мілісекундну пунктуальність.`,
      String.raw`Періодичне виконання: <code>scheduleAtFixedRate(task, initialDelay, period, unit)</code> запускає завдання з фіксованою частотою (кожні <code>period</code> від початку попереднього запуску; якщо виконання довше за період, наступні запуски стартують одразу після завершення попереднього), а <code>scheduleWithFixedDelay(task, initialDelay, delay, unit)</code> чекає <code>delay</code> після завершення кожного запуску. Для більшості фонових задач підходить саме FixedDelay.`,
      String.raw`Підступна пастка: якщо періодичне завдання кинуло виняток, подальші запуски скасовуються мовчки. Тому тіло завдання обгортають у try/catch, який записує помилку в журнал. Інакше ви виявите, що «кеш давно не оновлюється», лише коли станеться інцидент. Це одна з найчастіших помилок при роботі з планувальниками, і вона не залишає слідів у логах.`,
      String.raw`Зупинка: <code>future.cancel(false)</code> скасовує конкретне завдання; <code>shutdown()</code> за замовчуванням дозволяє дочекатися відкладених одноразових завдань, але скасовує періодичні; <code>shutdownNow()</code> перериває все. Без зупинки потоки пулу тримають програму живою. Для стабільності тестів не покладайтеся на sleep: використовуйте <code>CountDownLatch</code> і чекайте на потрібну кількість запусків.`,
      String.raw`Планувальник не гарантує точного часу: затримки пулу, паузи збирання сміття й перевантаження дають відхилення. Для завдань, що потребують точності (секунди й менше), вимірюйте реальний час через <code>System.nanoTime()</code>. А для розкладів на кшталт «щодня о 03:00» зазвичай беруть бібліотеки планування (Quartz, Spring Scheduler) або cron на рівні інфраструктури.`,
      String.raw`Типові застосування: оновлення кешу, очищення прострочених записів, періодичні перевірки стану, надсилання метрик, повторні спроби з відкладом (retry with backoff), тайм-аути. Пам'ятайте: завдання виконуються в потоках пулу, тож тривала операція займе потік і відкладе інші, а розмір пулу має відповідати кількості паралельних завдань. Також не забувайте зупиняти планувальник під час завершення програми.`,
      String.raw`У виробничих системах періодичні завдання зазвичай мають ще два захисти: блокування від паралельного запуску (щоб наступний запуск не починався, поки попередній триває) і метрики — кількість запусків, тривалість, кількість помилок. Це дозволяє швидко помітити, що завдання «застрягло» чи уповільнилося, ще до того, як це відчують користувачі.`,
    ],
    code: [
      String.raw`import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) throws Exception {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        ScheduledFuture<String> later = scheduler.schedule(() -> "delayed hello", 50, TimeUnit.MILLISECONDS);
        System.out.println("scheduled");
        System.out.println(later.get());
        scheduler.shutdown();
    }
}`,
      String.raw`import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        AtomicInteger ticks = new AtomicInteger();
        CountDownLatch three = new CountDownLatch(3);
        ScheduledFuture<?> periodic = scheduler.scheduleAtFixedRate(() -> {
            int n = ticks.incrementAndGet();
            if (n <= 3) {
                System.out.println("tick " + n);
                three.countDown();
            }
        }, 0, 20, TimeUnit.MILLISECONDS);
        three.await();                                // чекаємо рівно три запуски, без sleep
        periodic.cancel(false);
        scheduler.shutdown();
        System.out.println("done");
    }
}`,
      String.raw`import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        AtomicInteger runs = new AtomicInteger();
        scheduler.scheduleWithFixedDelay(() -> {
            runs.incrementAndGet();
            throw new IllegalStateException("boom");       // після винятку запуски припиняються мовчки
        }, 0, 10, TimeUnit.MILLISECONDS);
        Thread.sleep(100);
        scheduler.shutdownNow();
        System.out.println(runs.get());                    // 1
    }
}`,
      String.raw`import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        ScheduledFuture<?> never = scheduler.schedule(() -> System.out.println("never"), 10, TimeUnit.SECONDS);
        System.out.println(never.cancel(false));           // скасовуємо до виконання
        System.out.println(never.isCancelled());
        scheduler.shutdownNow();
    }
}`,
      String.raw`// аварія: період має бути додатним, IllegalArgumentException
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        try {
            scheduler.scheduleAtFixedRate(() -> { }, 0, 0, TimeUnit.MILLISECONDS);
        } finally {
            scheduler.shutdown();
        }
    }
}`,
    ],
    note: String.raw`Виняток у періодичному завданні мовчки скасовує подальші запуски, тому тіло завдання обгортають у <code>try/catch</code>. Для тестів використовуйте <code>CountDownLatch</code> замість <code>sleep</code>, а виконавець обов'язково зупиняйте.`,
    work: String.raw`Планувальники виконують фонові роботи: очищення кешів, оновлення довідників, періодичні перевірки, повторні спроби з відкладом. У виробничому коді їх обов'язково обгортають журналюванням помилок, бо збій такого завдання залишається непомітним, поки не вплине на користувачів.`,
    tasks: [
      String.raw`Чим <code>scheduleAtFixedRate</code> відрізняється від <code>scheduleWithFixedDelay</code>?`,
      String.raw`Що станеться з періодичним завданням, якщо воно кине виняток?`,
    ],
  },
  {
    t: "Модель пам'яті Java: happens-before",
    ch: "Паралелізм",
    adv: true,
    easy: String.raw`Модель пам'яті — це правила про те, коли один потік гарантовано бачить записи іншого. Без правил кожен потік може працювати зі своєю «застарілою копією» світу, і програма поводиться так, ніби час плутається.`,
    p: [
      String.raw`Сучасні процесори й компілятори змінюють порядок операцій і тримають значення в кешах та регістрах, якщо це не змінює результату для одного потоку. Для кількох потоків це руйнує інтуїцію: один потік може не бачити записів іншого або бачити їх в іншому порядку. Модель пам'яті Java (JMM) визначає, які спостереження дозволені, а які ні, і дає інструменти, щоб їх забезпечити.`,
      String.raw`Центральне поняття — відношення <b>happens-before</b> («відбувається раніше»). Якщо дія A відбувається раніше за дію B, то результати A гарантовано видно в B, і A не може бути переставлена після B. Без такого відношення гарантій немає: читання може побачити старе значення, нове чи навіть «половину» запису для 64-бітних значень без volatile на деяких старих платформах.`,
      String.raw`Правила happens-before: у межах одного потоку діє порядок програми; розблокування монітора (<code>synchronized</code>) відбувається раніше за наступне блокування того самого монітора; запис у <code>volatile</code>-поле — раніше за наступне читання цього поля; <code>Thread.start()</code> — раніше за дії запущеного потоку; усі дії потоку — раніше за повернення з <code>join()</code>; <code>countDown()</code> — раніше за повернення з <code>await()</code>; передача в чергу — раніше за вилучення з неї; а ще діє транзитивність.`,
      String.raw`Безпечна публікація об'єкта: щоб інший потік побачив повністю створений об'єкт, його публікують через механізм із happens-before: volatile-поле чи <code>AtomicReference</code>, <code>synchronized</code>, потокобезпечну колекцію або фінальне поле. Публікація через звичайне поле без синхронізації може показати «напівстворений» об'єкт із полями за замовчуванням: це класична причина рідкісних збоїв.`,
      String.raw`Особливість фінальних полів: поля <code>final</code>, задані в конструкторі, гарантовано видно всім потокам після завершення конструктора, навіть при небезпечній публікації (якщо <code>this</code> не «втік» з конструктора). Тому незмінні об'єкти безпечні за замовчуванням. Не передавайте <code>this</code> у чужий код (слухачі, потоки) всередині конструктора: інші потоки побачать об'єкт ще неготовим.`,
      String.raw`Приклад: подвійне перевірене блокування для ліниво створеного об'єкта <code>if (instance == null) { synchronized (lock) { if (instance == null) instance = new X(); } }</code> коректне лише з <code>volatile instance</code>. Без volatile інший потік може побачити ненульове посилання на ще не ініціалізований об'єкт. Простіші альтернативи: статичний внутрішній клас-тримач, <code>enum</code>-синглтон чи просте створення під час запуску.`,
      String.raw`Практичні правила: не покладайтеся на «здається, працює»; для кожного спільного змінюваного стану назвіть механізм, що гарантує happens-before; віддавайте перевагу готовим високорівневим інструментам (<code>java.util.concurrent</code>), які вже коректні; тестуйте на різних навантаженнях і платформах (x86 прощає більше, ніж ARM). Знання JMM — це різниця між кодом, що працює, і кодом, що правильний.`,
    ],
    code: [
      String.raw`public class Main {
    private static int data = 0;
    private static volatile boolean ready = false;

    public static void main(String[] args) throws InterruptedException {
        Thread writer = new Thread(() -> {
            data = 42;                  // звичайний запис ...
            ready = true;               // ... опублікований через volatile: happens-before
        });
        Thread reader = new Thread(() -> {
            while (!ready) {
                Thread.onSpinWait();
            }
            System.out.println(data);   // гарантовано 42
        });
        reader.start();
        writer.start();
        writer.join();
        reader.join();
    }
}`,
      String.raw`public class Main {
    private static int result;

    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> result = 7 * 6);
        t.start();
        t.join();                       // усі дії t відбулися раніше за повернення з join
        System.out.println(result);
    }
}`,
      String.raw`import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger CREATED = new AtomicInteger();

    static class Holder {
        private static volatile Holder instance;        // volatile обов'язковий
        private static final Object LOCK = new Object();

        static Holder get() {
            if (instance == null) {
                synchronized (LOCK) {
                    if (instance == null) {
                        instance = new Holder();
                        CREATED.incrementAndGet();
                    }
                }
            }
            return instance;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[8];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(Holder::get);
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println(CREATED.get());              // 1
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Point shared = new Point(3, 4);
        Thread reader = new Thread(() -> System.out.println(shared.x() + shared.y()));
        reader.start();
        reader.join();
    }
}

final class Point {
    private final int x;                    // фінальні поля безпечно публікуються
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    int x() {
        return x;
    }

    int y() {
        return y;
    }
}`,
      String.raw`// не компілюється: фінальне поле не можна змінити поза конструктором
public class Main {
    public static void main(String[] args) {
        Box box = new Box(1);
        box.set(2);
        System.out.println(box.value);
    }
}

class Box {
    final int value;

    Box(int value) {
        this.value = value;
    }

    void set(int newValue) {
        this.value = newValue;
    }
}`,
    ],
    note: String.raw`Без відношення happens-before немає гарантій, що один потік побачить зміни іншого. Його створюють <code>synchronized</code>, <code>volatile</code>, <code>start</code> і <code>join</code>, засувки, черги та фінальні поля; для лінивого створення з подвійним перевіренням поле має бути <code>volatile</code>.`,
    work: String.raw`Помилки моделі пам'яті проявляються лише на певних процесорах, під навантаженням і після оптимізацій JIT, тому їх майже неможливо відтворити в тесті. Єдиний надійний підхід — спиратися на правила happens-before і готові конкурентні інструменти, і саме цим відрізняється код, який роками працює в продакшні.`,
    tasks: [
      String.raw`Назвіть три способи створити відношення happens-before між потоками.`,
      String.raw`Чому подвійне перевірене блокування потребує volatile?`,
    ],
  },
];
