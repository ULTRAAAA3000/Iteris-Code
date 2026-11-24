// Еталонні рішення завдань Java, глава 07 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_07 = {
  "java-threads-join": raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        int[] results = new int[5];
        Thread[] threads = new Thread[5];
        for (int i = 0; i < threads.length; i++) {
            final int id = i;
            threads[i] = new Thread(() -> results[id] = id * id);
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println("Results: " + Arrays.toString(results));
        int total = 0;
        for (int r : results) {
            total += r;
        }
        System.out.println("Total: " + total);
    }
}
`,
  "java-race-fix": raw`public class Main {
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

    synchronized void increment() {
        value++;
    }

    synchronized int get() {
        return value;
    }
}
`,
  "java-synchronized-bank": raw`public class Main {
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
    private final Object lock = new Object();
    private int balance;

    void deposit(int amount) {
        synchronized (lock) {
            balance += amount;
        }
    }

    boolean withdraw(int amount) {
        synchronized (lock) {
            if (amount > balance) {
                return false;
            }
            balance -= amount;
            return true;
        }
    }

    int balance() {
        synchronized (lock) {
            return balance;
        }
    }
}
`,
  "java-executor-pool": raw`import java.util.ArrayList;
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
        System.out.println("Done: " + results.size());
    }
}
`,
  "java-callable-future": raw`import java.util.ArrayList;
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
        List<Integer> results = new ArrayList<>();
        for (Future<Integer> f : pool.invokeAll(tasks)) {
            results.add(f.get());
        }
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
  "java-completable-chain": raw`import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> a = CompletableFuture.supplyAsync(() -> 21).thenApply(x -> x * 2);
        CompletableFuture<Integer> b = CompletableFuture.supplyAsync(() -> 8);
        int sum = a.thenCombine(b, Integer::sum).join();
        System.out.println("Sum: " + sum);

        CompletableFuture<Integer> failing = CompletableFuture.<Integer>supplyAsync(() -> {
            throw new IllegalStateException("boom");
        });
        int fallback = failing.exceptionally(ex -> -1).join();
        System.out.println("Fallback: " + fallback);

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
        System.out.println("Squares: " + squares);
    }
}
`,
  "java-reentrant-lock": raw`import java.util.concurrent.locks.ReentrantLock;

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
        lock.lock();
        Thread other = new Thread(() -> {
            got[0] = lock.tryLock();
            if (got[0]) {
                lock.unlock();
            }
        });
        other.start();
        other.join();
        lock.unlock();
        System.out.println("tryLock while held: " + got[0]);
    }
}

class Counter {
    private final ReentrantLock lock = new ReentrantLock();
    private int value;

    void increment() {
        lock.lock();
        try {
            value++;
        } finally {
            lock.unlock();
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
}
`,
  "java-atomic-counter": raw`import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger count = new AtomicInteger();
    static final AtomicInteger max = new AtomicInteger(-1);

    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            final int id = i;
            threads[i] = new Thread(() -> {
                for (int v = id; v < 40000; v += 4) {
                    count.incrementAndGet();
                    max.accumulateAndGet(v, Math::max);
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println("Count: " + count.get());
        System.out.println("Max: " + max.get());
    }
}
`,
  "java-concurrent-collections": raw`import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

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
        System.out.println("Counts: " + new TreeMap<>(counts));

        List<String> listeners = new CopyOnWriteArrayList<>(List.of("x"));
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
  "java-latch-semaphore": raw`import java.util.concurrent.CountDownLatch;
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
                try {
                    permits.acquire();
                    try {
                        max.accumulateAndGet(current.incrementAndGet(), Math::max);
                        Thread.sleep(20);
                        current.decrementAndGet();
                    } finally {
                        permits.release();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    done.countDown();
                }
            });
        }
        done.await();
        pool.shutdown();
        System.out.println("Max concurrent <= 2: " + (max.get() <= 2));
        System.out.println("Finished: " + (6 - done.getCount()));
    }
}
`,
  "java-producer-consumer": raw`import java.util.ArrayList;
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
        int sum = 0;
        for (int x : consumed) {
            sum += x;
        }
        System.out.println("Consumed: " + consumed);
        System.out.println("Sum: " + sum);
    }
}
`,
  "java-deadlock-fix": raw`public class Main {
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
        Acc first = from.id < to.id ? from : to;
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
}
`,
  "java-virtual-threads": raw`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        AtomicInteger done = new AtomicInteger();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
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
        Thread t = Thread.ofVirtual().unstarted(() -> { });
        System.out.println("Is virtual: " + t.isVirtual());
    }
}
`,
  "java-scheduled-tasks": raw`import java.util.concurrent.CountDownLatch;
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
        ScheduledFuture<?> periodic = scheduler.scheduleAtFixedRate(() -> {
            int n = ticks.incrementAndGet();
            if (n <= 3) {
                System.out.println("tick " + n);
                three.countDown();
            }
        }, 0, 20, TimeUnit.MILLISECONDS);
        ScheduledFuture<String> delayed = scheduler.schedule(() -> "delayed hello", 200, TimeUnit.MILLISECONDS);
        three.await();
        periodic.cancel(false);
        System.out.println(delayed.get());
        scheduler.shutdown();
        System.out.println("done");
    }
}
`,
  "java-happens-before": raw`import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger CREATED = new AtomicInteger();

    static class Holder {
        private static volatile Holder instance;
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
};
