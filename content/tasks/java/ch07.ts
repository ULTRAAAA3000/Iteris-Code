// Практичні завдання глави «Паралелізм» (уроки 59–73). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
// Усі результати детерміновані: потоки завжди чекають через join, засувки або зупинку пулу, а не через sleep.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07: readonly RemoteTask[] = [
  {
    ...base, id: "java-threads-join", lesson: "java/59", xp: 25,
    title: "Потоки й join: квадрати в масиві",
    context: "Кожен потік обчислює свою частину роботи й записує результат у власну комірку масиву. Головний потік має дочекатися всіх через join, і тоді результати гарантовано видно.",
    brief: [
      "Запустіть 5 потоків: потік із номером <code>id</code> записує в <code>results[id]</code> значення <code>id * id</code>. Змінну для лямбди зробіть <code>final</code> (<code>final int id = i;</code>).",
      "Потім викличте <code>join()</code> для кожного потоку. Очікуваний вивід: <code>Results: [0, 1, 4, 9, 16]</code> і <code>Total: 30</code>.",
    ],
    starter: raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        int[] results = new int[5];
        Thread[] threads = new Thread[5];
        // TODO: створіть і запустіть 5 потоків: results[id] = id * id
        // TODO: дочекайтеся всіх потоків через join
        System.out.println("Results: " + Arrays.toString(results));
        int total = 0;
        for (int r : results) {
            total += r;
        }
        System.out.println("Total: " + total);
    }
}
`,
    checks: [
      { on: "stdout", name: "Результати потоків: [0, 1, 4, 9, 16]", has: "Results: [0, 1, 4, 9, 16]", hint: "Кожен потік записує id * id у results[id]" },
      { on: "stdout", name: "Сума: «Total: 30»", has: "Total: 30", hint: "0 + 1 + 4 + 9 + 16 = 30" },
      { on: "source", name: "Створено й запущено потоки", matches: "new\\s+Thread\\s*\\([\\s\\S]*\\.start\\s*\\(", hint: "threads[i] = new Thread(() -> ...); threads[i].start();" },
      { on: "source", name: "Є join", has: ".join()", hint: "Для кожного потоку: t.join();" },
    ],
  },
  {
    ...base, id: "java-race-fix", lesson: "java/60", xp: 30,
    title: "Виправлення гонитви за даними",
    context: "Лічильник, який збільшують чотири потоки без синхронізації, губить збільшення: count++ складається з трьох кроків. Критична секція під спільним замком робить результат точним.",
    brief: [
      "Чотири потоки по 10000 разів викликають <code>counter.increment()</code>. Зробіть клас <code>Counter</code> потокобезпечним: методи <code>increment()</code> та <code>get()</code> мають бути <code>synchronized</code>.",
      "Очікуваний вивід: <code>Count: 40000</code> за будь-якого запуску.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 10000; j++) {
                    counter.increment();
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println("Count: " + counter.get());
    }
}

class Counter {
    private int value;

    // TODO: зробіть методи потокобезпечними
    void increment() {
        value++;
    }

    int get() {
        return value;
    }
}
`,
    checks: [
      { on: "stdout", name: "Жодне збільшення не втрачено: «Count: 40000»", has: "Count: 40000", hint: "Усі звернення до value мають іти під одним замком" },
      { on: "source", name: "Методи синхронізовано", matches: "synchronized\\s+void\\s+increment", hint: "synchronized void increment() { value++; }" },
      { on: "source", name: "Читання теж синхронізовано", matches: "synchronized\\s+int\\s+get", hint: "synchronized int get() { return value; }: так читання бачить свіже значення" },
    ],
  },
  {
    ...base, id: "java-synchronized-bank", lesson: "java/61", xp: 30,
    title: "Синхронізований рахунок",
    context: "Рахунок змінюють кілька потоків, а операція зняття має спершу перевірити баланс, а потім змінити його. Без синхронізації між перевіркою й зміною може втрутитися інший потік.",
    brief: [
      "Зробіть методи <code>deposit</code>, <code>withdraw</code> і <code>balance</code> класу <code>BankAccount</code> потокобезпечними через приватний об'єкт-замок і блоки <code>synchronized (lock)</code>.",
      "Очікуваний вивід: <code>Balance: 20000</code>, <code>Withdraw too much: false</code>, <code>Withdraw 50: true</code> і <code>Final: 19950</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        BankAccount account = new BankAccount();
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 5000; j++) {
                    account.deposit(1);
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println("Balance: " + account.balance());
        System.out.println("Withdraw too much: " + account.withdraw(1_000_000));
        System.out.println("Withdraw 50: " + account.withdraw(50));
        System.out.println("Final: " + account.balance());
    }
}

class BankAccount {
    // TODO: приватний фінальний об'єкт-замок
    private int balance;

    void deposit(int amount) {
        // TODO: synchronized (lock) { ... }
        balance += amount;
    }

    boolean withdraw(int amount) {
        // TODO: перевірка й зняття мають бути в одній критичній секції
        if (amount > balance) {
            return false;
        }
        balance -= amount;
        return true;
    }

    int balance() {
        // TODO
        return balance;
    }
}
`,
    checks: [
      { on: "stdout", name: "Баланс після паралельних поповнень", has: "Balance: 20000", hint: "Усі 20000 поповнень мають зберегтися" },
      { on: "stdout", name: "Зняття: false для надто великої суми й true для 50", has: "Withdraw too much: false\nWithdraw 50: true\nFinal: 19950", hint: "20000 - 50 = 19950" },
      { on: "source", name: "Є приватний об'єкт-замок", matches: "private\\s+final\\s+Object\\s+lock", hint: "private final Object lock = new Object();" },
      { on: "source", name: "Використано блоки synchronized (lock)", matches: "synchronized\\s*\\(\\s*lock\\s*\\)[\\s\\S]*synchronized\\s*\\(\\s*lock\\s*\\)[\\s\\S]*synchronized\\s*\\(\\s*lock\\s*\\)", hint: "Кожен із трьох методів працює під замком" },
    ],
  },
  {
    ...base, id: "java-executor-pool", lesson: "java/62", xp: 30,
    title: "Пул потоків: квадрати чисел",
    context: "Замість окремого потоку на кожне завдання користуються пулом: фіксована кількість працівників бере завдання з черги. Пул обов'язково зупиняють і чекають завершення, і лише тоді читають результати.",
    brief: [
      "Створіть <code>Executors.newFixedThreadPool(3)</code>, подайте 6 завдань через <code>execute</code> (завдання <code>n</code> додає <code>n * n</code> у синхронізований список), викличте <code>shutdown()</code> і <code>awaitTermination</code>.",
      "Відсортуйте результати й виведіть <code>[1, 4, 9, 16, 25, 36]</code>, потім <code>Done: 6</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        List<Integer> results = Collections.synchronizedList(new ArrayList<>());
        // TODO: пул із 3 потоків, 6 завдань (n = 1..6): results.add(n * n)
        // TODO: shutdown() і awaitTermination(5, TimeUnit.SECONDS)
        Collections.sort(results);
        System.out.println(results);
        System.out.println("Done: " + results.size());
    }
}
`,
    checks: [
      { on: "stdout", name: "Результати всіх завдань", has: "[1, 4, 9, 16, 25, 36]", hint: "Завдання n додає n * n; перед виводом список сортують" },
      { on: "stdout", name: "Виконано шість завдань", has: "Done: 6", hint: "Дочекайтеся завершення пулу перед читанням результатів" },
      { on: "source", name: "Створено фіксований пул", has: "newFixedThreadPool", hint: "Executors.newFixedThreadPool(3)" },
      { on: "source", name: "Пул зупинено й дочекано", matches: "shutdown\\s*\\([\\s\\S]*awaitTermination", hint: "pool.shutdown(); pool.awaitTermination(5, TimeUnit.SECONDS);" },
    ],
  },
  {
    ...base, id: "java-callable-future", lesson: "java/63", xp: 30,
    title: "Callable і Future: паралельні обчислення",
    context: "Завдання з результатом описують через Callable, а результати збирають із Future. Щоб обчислення справді йшли паралельно, спершу надсилають усі завдання, а get() викликають вже потім.",
    brief: [
      "Для чисел від 1 до 4 створіть <code>Callable&lt;Integer&gt;</code> (<code>n * n</code>), виконайте їх через <code>pool.invokeAll</code> і зберіть результати з <code>Future.get()</code> у список.",
      "Очікуваний вивід: <code>Results: [1, 4, 9, 16]</code> і <code>Total: 30</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        List<Callable<Integer>> tasks = new ArrayList<>();
        // TODO: для n = 1..4 додайте Callable, що повертає n * n
        List<Integer> results = new ArrayList<>();
        // TODO: pool.invokeAll(tasks) і збір результатів через get()
        pool.shutdown();
        int total = 0;
        for (int r : results) {
            total += r;
        }
        System.out.println("Results: " + results);
        System.out.println("Total: " + total);
    }
}
`,
    checks: [
      { on: "stdout", name: "Результати у порядку завдань", has: "Results: [1, 4, 9, 16]", hint: "invokeAll повертає Future у порядку завдань" },
      { on: "stdout", name: "Сума: «Total: 30»", has: "Total: 30", hint: "1 + 4 + 9 + 16 = 30" },
      { on: "source", name: "Використано Callable і invokeAll", matches: "Callable[\\s\\S]*invokeAll", hint: "pool.invokeAll(tasks)" },
      { on: "source", name: "Результати читаються через get()", has: ".get()", hint: "future.get() повертає результат завдання" },
    ],
  },
  {
    ...base, id: "java-completable-chain", lesson: "java/64", xp: 35,
    title: "CompletableFuture: ланцюжок, помилка, allOf",
    context: "Асинхронні кроки з'єднують у ланцюжок без блокування: перетворити результат, об'єднати з іншим, замінити помилку значенням за замовчуванням і дочекатися групи завдань.",
    brief: [
      "Обчисліть <code>supplyAsync(() -&gt; 21).thenApply(x -&gt; x * 2)</code> і об'єднайте його через <code>thenCombine</code> із <code>supplyAsync(() -&gt; 8)</code> (сума 50). Для завдання, що кидає виняток, застосуйте <code>exceptionally(ex -&gt; -1)</code>.",
      "Три завдання <code>n * n</code> зберіть через <code>allOf</code>. Очікуваний вивід: <code>Sum: 50</code>, <code>Fallback: -1</code> і <code>Squares: [1, 4, 9]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> a = null;      // TODO: supplyAsync(() -> 21).thenApply(x -> x * 2)
        CompletableFuture<Integer> b = null;      // TODO: supplyAsync(() -> 8)
        int sum = 0;                              // TODO: a.thenCombine(b, Integer::sum).join()
        System.out.println("Sum: " + sum);

        CompletableFuture<Integer> failing = CompletableFuture.<Integer>supplyAsync(() -> {
            throw new IllegalStateException("boom");
        });
        int fallback = 0;                         // TODO: failing.exceptionally(ex -> -1).join()
        System.out.println("Fallback: " + fallback);

        List<CompletableFuture<Integer>> futures = new ArrayList<>();
        // TODO: для n = 1..3 додайте supplyAsync(() -> n * n)
        // TODO: CompletableFuture.allOf(...).join()
        List<Integer> squares = new ArrayList<>();
        // TODO: зберіть join() кожного
        System.out.println("Squares: " + squares);
    }
}
`,
    checks: [
      { on: "stdout", name: "Об'єднання двох результатів: «Sum: 50»", has: "Sum: 50", hint: "42 + 8 = 50: thenCombine(b, Integer::sum)" },
      { on: "stdout", name: "Значення замість помилки: «Fallback: -1»", has: "Fallback: -1", hint: "exceptionally(ex -> -1)" },
      { on: "stdout", name: "Результати трьох завдань", has: "Squares: [1, 4, 9]", hint: "allOf(...).join(), потім join() кожного" },
      { on: "source", name: "Використано thenApply, thenCombine і exceptionally", matches: "thenApply[\\s\\S]*thenCombine[\\s\\S]*exceptionally", hint: "Три етапи з уроку" },
      { on: "source", name: "Використано allOf", has: "allOf", hint: "CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))" },
    ],
  },
  {
    ...base, id: "java-reentrant-lock", lesson: "java/65", xp: 30,
    title: "ReentrantLock: лічильник і tryLock",
    context: "Замок дозволяє не лише захистити секцію, а й спробувати взяти його без очікування. Звільняти замок треба завжди у finally, інакше одна помилка заблокує всіх.",
    brief: [
      "Зробіть <code>Counter</code> потокобезпечним через <code>ReentrantLock</code>: <code>lock()</code>, зміна, <code>unlock()</code> у <code>finally</code>. Потім із іншого потоку спробуйте <code>tryLock()</code> тоді, коли головний потік тримає замок.",
      "Очікуваний вивід: <code>Count: 20000</code> і <code>tryLock while held: false</code>.",
    ],
    starter: raw`import java.util.concurrent.locks.ReentrantLock;

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
        System.out.println("Count: " + counter.get());

        ReentrantLock lock = new ReentrantLock();
        boolean[] got = {true};
        // TODO: головний потік бере lock; інший потік записує у got[0] результат lock.tryLock();
        // після join головний потік звільняє замок
        System.out.println("tryLock while held: " + got[0]);
    }
}

class Counter {
    // TODO: private final ReentrantLock lock = new ReentrantLock();
    private int value;

    void increment() {
        // TODO: lock(), зміна, unlock() у finally
        value++;
    }

    int get() {
        return value;
    }
}
`,
    checks: [
      { on: "stdout", name: "Лічильник без втрат: «Count: 20000»", has: "Count: 20000", hint: "Замок має охоплювати кожне value++" },
      { on: "stdout", name: "tryLock не береться, поки замок тримає інший потік", has: "tryLock while held: false", hint: "lock.lock() у main, потім у потоці got[0] = lock.tryLock()" },
      { on: "source", name: "Використано ReentrantLock", has: "new ReentrantLock()", hint: "private final ReentrantLock lock = new ReentrantLock();" },
      { on: "source", name: "unlock() у блоці finally", matches: "finally\\s*\\{\\s*\\w*\\.?unlock\\(\\)", hint: "try { value++; } finally { lock.unlock(); }" },
    ],
  },
  {
    ...base, id: "java-atomic-counter", lesson: "java/66", xp: 35,
    title: "Atomic-лічильник і максимум через CAS",
    context: "Лічильник і максимум, які оновлюють багато потоків, зручно тримати в атомарних змінних: без замків, без втрат і з коректним результатом.",
    brief: [
      "Замініть звичайні <code>int</code> на <code>AtomicInteger</code>: <code>count</code> збільшуйте через <code>incrementAndGet()</code>, а <code>max</code> оновлюйте через <code>accumulateAndGet(value, Math::max)</code>.",
      "Чотири потоки обробляють числа <code>id, id + 4, id + 8, ...</code> до 40000. Очікуваний вивід: <code>Count: 40000</code> і <code>Max: 39999</code>.",
    ],
    starter: raw`import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static int count = 0;       // TODO: замініть на AtomicInteger
    static int max = -1;        // TODO: замініть на AtomicInteger

    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            final int id = i;
            threads[i] = new Thread(() -> {
                for (int v = id; v < 40000; v += 4) {
                    count++;
                    if (v > max) {
                        max = v;
                    }
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println("Count: " + count);
        System.out.println("Max: " + max);
    }
}
`,
    checks: [
      { on: "stdout", name: "Жодне збільшення не втрачено: «Count: 40000»", has: "Count: 40000", hint: "incrementAndGet() атомарний" },
      { on: "stdout", name: "Максимум: «Max: 39999»", has: "Max: 39999", hint: "max.accumulateAndGet(v, Math::max)" },
      { on: "source", name: "Використано AtomicInteger і incrementAndGet", matches: "AtomicInteger[\\s\\S]*incrementAndGet", hint: "static final AtomicInteger count = new AtomicInteger();" },
      { on: "source", name: "Максимум оновлюється через accumulateAndGet або compareAndSet", matches: "accumulateAndGet|compareAndSet|updateAndGet", hint: "Методи з функцією виконують CAS-цикл самі" },
    ],
  },
  {
    ...base, id: "java-concurrent-collections", lesson: "java/67", xp: 30,
    title: "Конкурентні колекції: ConcurrentHashMap і CopyOnWriteArrayList",
    context: "HashMap і ArrayList небезпечні для кількох потоків. Спеціальні колекції підтримують атомарний merge і безпечний перебір із зміною, тож результат завжди передбачуваний.",
    brief: [
      "Замініть <code>HashMap</code> на <code>ConcurrentHashMap</code> (чотири потоки роблять <code>merge</code> за слово), а <code>ArrayList</code> на <code>CopyOnWriteArrayList</code>, щоб додавання в циклі не кидало виняток.",
      "Очікуваний вивід: <code>Counts: {a=8000, b=4000}</code>, <code>Iterated: 1</code> і <code>List: [x, y]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Map<String, Integer> counts = new HashMap<>();          // TODO: ConcurrentHashMap
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
        System.out.println("Counts: " + new TreeMap<>(counts));

        List<String> listeners = new ArrayList<>(List.of("x"));     // TODO: CopyOnWriteArrayList
        int iterated = 0;
        for (String s : listeners) {
            iterated++;
            listeners.add("y");
        }
        System.out.println("Iterated: " + iterated);
        System.out.println("List: " + listeners);
    }
}
`,
    checks: [
      { on: "stdout", name: "Підрахунок без втрат", has: "Counts: {a=8000, b=4000}", hint: "ConcurrentHashMap.merge атомарний" },
      { on: "stdout", name: "Перебір зі зміною без винятку", has: "Iterated: 1\nList: [x, y]", hint: "CopyOnWriteArrayList: ітератор бачить знімок" },
      { on: "source", name: "Використано ConcurrentHashMap", has: "new ConcurrentHashMap", hint: "Map<String, Integer> counts = new ConcurrentHashMap<>();" },
      { on: "source", name: "Використано CopyOnWriteArrayList", has: "new CopyOnWriteArrayList", hint: "new CopyOnWriteArrayList<>(List.of(\"x\"))" },
    ],
  },
  {
    ...base, id: "java-latch-semaphore", lesson: "java/68", xp: 35,
    title: "CountDownLatch і Semaphore",
    context: "Засувка дозволяє головному потоку дочекатися групи завдань, а семафор обмежує кількість завдань, що працюють одночасно. Разом вони керують паралельністю без sleep.",
    brief: [
      "Кожне з 6 завдань має взяти дозвіл <code>Semaphore(2)</code>, збільшити <code>current</code>, оновити <code>max</code>, поспати 20 мс, зменшити <code>current</code>, повернути дозвіл у <code>finally</code> і викликати <code>countDown()</code> засувки.",
      "Головний потік чекає <code>await()</code>. Очікуваний вивід: <code>Max concurrent &lt;= 2: true</code> і <code>Finished: 6</code>.",
    ],
    starter: raw`import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Semaphore permits = new Semaphore(2);
        CountDownLatch done = new CountDownLatch(6);
        AtomicInteger current = new AtomicInteger();
        AtomicInteger max = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(6);
        for (int i = 0; i < 6; i++) {
            pool.execute(() -> {
                // TODO: acquire; current++; max = max(max, current); sleep(20); current--; release у finally; countDown
            });
        }
        // TODO: done.await();
        pool.shutdown();
        System.out.println("Max concurrent <= 2: " + (max.get() <= 2));
        System.out.println("Finished: " + (6 - done.getCount()));
    }
}
`,
    checks: [
      { on: "stdout", name: "Семафор обмежив паралельність", has: "Max concurrent <= 2: true", hint: "permits.acquire() перед роботою й release() у finally" },
      { on: "stdout", name: "Усі шість завдань завершились", has: "Finished: 6", hint: "Кожне завдання викликає done.countDown(); main чекає done.await()" },
      { on: "source", name: "Дозвіл повертається у finally", matches: "finally\\s*\\{[\\s\\S]*release\\s*\\(", hint: "try { ... } finally { permits.release(); }" },
      { on: "source", name: "Є await() засувки", has: ".await()", hint: "done.await()" },
    ],
  },
  {
    ...base, id: "java-producer-consumer", lesson: "java/69", xp: 35,
    title: "Виробник і споживач із BlockingQueue",
    context: "Виробник кладе завдання в чергу, споживач їх забирає. Спеціальний елемент-«пілюля» повідомляє споживачеві, що завдань більше не буде, і він завершується без зависання.",
    brief: [
      "Допишіть споживача: у циклі <code>take()</code> із черги, для значення <code>POISON</code> вийдіть із циклу, інші числа додайте в <code>consumed</code>. Виробник уже кладе числа 1-5 і пілюлю.",
      "Запустіть обох і дочекайтеся через <code>join</code>. Очікуваний вивід: <code>Consumed: [1, 2, 3, 4, 5]</code> і <code>Sum: 15</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class Main {
    static final int POISON = -1;

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        List<Integer> consumed = new ArrayList<>();
        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 5; i++) {
                    queue.put(i);
                }
                queue.put(POISON);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        Thread consumer = new Thread(() -> {
            // TODO: цикл take(): POISON завершує, інакше consumed.add(x)
        });
        producer.start();
        // TODO: запустіть consumer і дочекайтеся обох потоків
        int sum = 0;
        for (int x : consumed) {
            sum += x;
        }
        System.out.println("Consumed: " + consumed);
        System.out.println("Sum: " + sum);
    }
}
`,
    checks: [
      { on: "stdout", name: "Споживач отримав усі числа по порядку", has: "Consumed: [1, 2, 3, 4, 5]", hint: "take() повертає елементи у порядку FIFO" },
      { on: "stdout", name: "Сума: «Sum: 15»", has: "Sum: 15", hint: "1 + 2 + 3 + 4 + 5" },
      { on: "source", name: "Є take() і перевірка пілюлі", matches: "take\\s*\\(\\s*\\)[\\s\\S]*POISON", hint: "int x = queue.take(); if (x == POISON) break;" },
      { on: "source", name: "Споживача запущено й дочекано", matches: "consumer\\.start\\(\\)[\\s\\S]*consumer\\.join\\(\\)", hint: "consumer.start(); ... consumer.join();" },
    ],
  },
  {
    ...base, id: "java-deadlock-fix", lesson: "java/70", xp: 35,
    title: "Переказ без взаємного блокування",
    context: "Два потоки переказують гроші між рахунками в протилежних напрямках. Якщо кожен бере замки у своєму порядку, настає взаємне блокування. Єдиний порядок за ідентифікатором його унеможливлює.",
    brief: [
      "Допишіть <code>transfer(from, to, amount)</code>: спершу блокуйте рахунок із меншим <code>id</code>, потім із більшим (вкладені <code>synchronized</code>), потім змініть баланси.",
      "Потік 1 робить 200 переказів з A на B по 1, потік 2 — 100 переказів з B на A. Очікуваний вивід: <code>A: 900 B: 1100</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) throws InterruptedException {
        Acc a = new Acc(1, 1000);
        Acc b = new Acc(2, 1000);
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 200; i++) {
                transfer(a, b, 1);
            }
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 100; i++) {
                transfer(b, a, 1);
            }
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("A: " + a.balance + " B: " + b.balance);
    }

    static void transfer(Acc from, Acc to, int amount) {
        // TODO: єдиний порядок блокування за id, потім from.balance -= amount; to.balance += amount;
    }
}

class Acc {
    final int id;
    int balance;

    Acc(int id, int balance) {
        this.id = id;
        this.balance = balance;
    }
}
`,
    checks: [
      { on: "stdout", name: "Баланси після переказів", has: "A: 900 B: 1100", hint: "1000 - 200 + 100 = 900; 1000 + 200 - 100 = 1100" },
      { on: "source", name: "Вкладені synchronized", matches: "synchronized\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*synchronized\\s*\\([^)]*\\)", hint: "synchronized (first) { synchronized (second) { ... } }" },
      { on: "source", name: "Порядок за id", matches: "\\.id\\s*[<>]\\s*\\w+\\.id|\\bid\\b[\\s\\S]*\\bid\\b", hint: "Порівняйте from.id і to.id, щоб визначити, що блокувати першим" },
    ],
  },
  {
    ...base, id: "java-virtual-threads", lesson: "java/71", xp: 35,
    title: "Віртуальні потоки: тисяча завдань",
    context: "Для завдань, що здебільшого чекають, віртуальні потоки дозволяють запустити тисячі завдань, по потоку на кожне, без пулу фіксованого розміру й без складної налаштування.",
    brief: [
      "Запустіть 1000 завдань (кожне спить 10 мс і збільшує <code>done</code>) через <code>Executors.newVirtualThreadPerTaskExecutor()</code> у <code>try-with-resources</code>.",
      "Ще створіть віртуальний потік через <code>Thread.ofVirtual().unstarted(...)</code> і виведіть <code>isVirtual()</code>. Очікуваний вивід: <code>Done: 1000</code> і <code>Is virtual: true</code>.",
    ],
    starter: raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        AtomicInteger done = new AtomicInteger();
        // TODO: замініть пул платформних потоків на newVirtualThreadPerTaskExecutor()
        try (ExecutorService executor = Executors.newFixedThreadPool(50)) {
            for (int i = 0; i < 1000; i++) {
                executor.execute(() -> {
                    try {
                        Thread.sleep(10);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    done.incrementAndGet();
                });
            }
        }
        System.out.println("Done: " + done.get());
        Thread t = new Thread(() -> { });        // TODO: Thread.ofVirtual().unstarted(() -> { })
        System.out.println("Is virtual: " + t.isVirtual());
    }
}
`,
    checks: [
      { on: "stdout", name: "Усі 1000 завдань виконано", has: "Done: 1000", hint: "try-with-resources чекає завершення виконавця" },
      { on: "stdout", name: "Потік віртуальний", has: "Is virtual: true", hint: "Thread.ofVirtual().unstarted(() -> { })" },
      { on: "source", name: "Використано віртуальні потоки", matches: "newVirtualThreadPerTaskExecutor|Thread\\s*\\.\\s*ofVirtual", hint: "Executors.newVirtualThreadPerTaskExecutor()" },
      { on: "source", name: "Пул із 50 потоків прибрано", has: "newFixedThreadPool", not: true, hint: "Для віртуальних потоків пул не потрібен" },
    ],
  },
  {
    ...base, id: "java-scheduled-tasks", lesson: "java/72", xp: 35,
    title: "Планувальник: тики й відкладене завдання",
    context: "Планувальник виконує завдання за розкладом: періодичні тики й одноразове відкладене завдання. Для детермінованого тесту очікують через засувку, а не через sleep.",
    brief: [
      "Через <code>scheduleAtFixedRate</code> запускайте завдання щодо 20 мс: перші три запуски друкують <code>tick 1..3</code> і викликають <code>countDown()</code>. Після <code>await()</code> скасуйте періодичне завдання.",
      "Через <code>schedule</code> заплануйте <code>Callable</code>, що повертає <code>delayed hello</code> за 200 мс, і виведіть результат. Очікуваний вивід: <code>tick 1</code>, <code>tick 2</code>, <code>tick 3</code>, <code>delayed hello</code>, <code>done</code>.",
    ],
    starter: raw`import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
        AtomicInteger ticks = new AtomicInteger();
        CountDownLatch three = new CountDownLatch(3);
        // TODO: scheduleAtFixedRate: n = ticks.incrementAndGet(); для n <= 3 друкуйте "tick " + n і three.countDown()
        // TODO: scheduler.schedule(() -> "delayed hello", 200, ms): виведіть результат get()
        // TODO: three.await(); потім скасуйте періодичне завдання
        scheduler.shutdown();
        System.out.println("done");
    }
}
`,
    checks: [
      { on: "stdout", name: "Три періодичні запуски", has: "tick 1\ntick 2\ntick 3", hint: "Друкуйте тик лише для n <= 3" },
      { on: "stdout", name: "Відкладене завдання виконалось після тиків", has: "tick 3\ndelayed hello\ndone", hint: "Результат schedule(...).get() виведіть після await() засувки" },
      { on: "source", name: "Використано scheduleAtFixedRate", has: "scheduleAtFixedRate", hint: "scheduler.scheduleAtFixedRate(task, 0, 20, TimeUnit.MILLISECONDS)" },
      { on: "source", name: "Використано schedule для відкладеного завдання", matches: "\\.schedule\\s*\\(", hint: "scheduler.schedule(callable, 200, TimeUnit.MILLISECONDS)" },
    ],
  },
  {
    ...base, id: "java-happens-before", lesson: "java/73", xp: 35,
    title: "Ліниве створення з подвійною перевіркою",
    context: "Ліниво створений спільний об'єкт має бути створений рівно один раз і безпечно опублікований. Подвійна перевірка із synchronized працює правильно лише тоді, коли поле volatile.",
    brief: [
      "Допишіть <code>Holder.get()</code>: подвійна перевірка <code>instance == null</code> із <code>synchronized (LOCK)</code> між ними. Поле <code>instance</code> має бути <code>volatile</code>. Під час створення збільшуйте <code>CREATED</code>.",
      "Вісім потоків викликають <code>get()</code> одночасно. Очікуваний вивід: <code>Created: 1</code> і <code>Same instance: true</code>.",
    ],
    starter: raw`import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger CREATED = new AtomicInteger();

    static class Holder {
        private static Holder instance;          // TODO: volatile
        private static final Object LOCK = new Object();

        static Holder get() {
            // TODO: if (instance == null) { synchronized (LOCK) { if (instance == null) { ... } } }
            return instance;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Holder[] seen = new Holder[8];
        Thread[] threads = new Thread[8];
        for (int i = 0; i < threads.length; i++) {
            final int id = i;
            threads[i] = new Thread(() -> seen[id] = Holder.get());
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        boolean same = true;
        for (Holder h : seen) {
            same &= h == seen[0];
        }
        System.out.println("Created: " + CREATED.get());
        System.out.println("Same instance: " + same);
    }
}
`,
    checks: [
      { on: "stdout", name: "Об'єкт створено один раз", has: "Created: 1", hint: "CREATED.incrementAndGet() лише всередині подвійної перевірки" },
      { on: "stdout", name: "Усі потоки бачать один екземпляр", has: "Same instance: true", hint: "Поле volatile забезпечує безпечну публікацію" },
      { on: "source", name: "Поле instance volatile", matches: "volatile\\s+Holder\\s+instance", hint: "private static volatile Holder instance;" },
      { on: "source", name: "Подвійна перевірка під synchronized", matches: "instance\\s*==\\s*null[\\s\\S]*synchronized[\\s\\S]*instance\\s*==\\s*null", hint: "Перевірка до замка, потім під замком" },
    ],
  },
];
