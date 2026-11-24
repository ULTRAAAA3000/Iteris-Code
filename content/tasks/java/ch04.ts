// Практичні завдання глави «Типи користувача» (уроки 31–39). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
// Допоміжні класи пишуться після Main у тому самому файлі, без слова public.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04: readonly RemoteTask[] = [
  {
    ...base, id: "java-product-class", lesson: "java/31", xp: 35,
    title: "Клас Product: поля, конструктор, toString",
    context: "Клас описує сутність: товар, користувача, замовлення. Поля приховують (private), доступ дають геттери, а toString визначає, як об'єкт виглядає у виводі й логах.",
    brief: [
      "Опишіть клас <code>Product</code> (після <code>Main</code>, без слова <code>public</code>) з приватними полями <code>name</code> (<code>String</code>) і <code>price</code> (<code>double</code>), конструктором, геттером <code>getPrice()</code> та методом <code>toString()</code>, що повертає, наприклад, <code>Bread: 25.50</code> (<code>String.format</code> з <code>%.2f</code>).",
      "Поки класу немає, код не компілюється: прочитайте помилку компілятора.",
    ],
    starter: raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Product> products = List.of(new Product("Bread", 25.5), new Product("Milk", 42), new Product("Cheese", 180));
        double total = 0;
        for (Product p : products) {
            System.out.println(p);
            total += p.getPrice();
        }
        System.out.printf("Total: %.2f%n", total);
    }
}

// TODO: клас Product з полями name і price, конструктором, getPrice() і toString()
`,
    checks: [
      { on: "stdout", name: "toString: Bread: 25.50", has: "Bread: 25.50", hint: "String.format(\"%.2f\", price) дає два знаки після крапки" },
      { on: "stdout", name: "Усі три товари виведено", has: "Bread: 25.50\nMilk: 42.00\nCheese: 180.00", hint: "toString має повертати name + \": \" + ціна" },
      { on: "stdout", name: "Сума цін: 247.50", has: "Total: 247.50", hint: "Геттер getPrice() має повертати поле price" },
      { on: "source", name: "Поля приватні", matches: "private\\s+(final\\s+)?double\\s+price", hint: "private double price;" },
      { on: "source", name: "Описано метод toString", matches: "String\\s+toString\\s*\\(", hint: "public String toString() { ... }" },
    ],
  },
  {
    ...base, id: "java-ref-swap", lesson: "java/32", xp: 25,
    title: "Посилання, null і передача параметрів",
    context: "Метод не може підмінити об'єкт викликача, але може змінити його поля через посилання. А null не має методів: до нього звертаються лише після перевірки.",
    brief: [
      "Допишіть <code>safeLength(String s)</code>: довжина рядка або 0 для <code>null</code>. Допишіть <code>swapValues(Box a, Box b)</code>: поміняйте місцями поля <code>value</code> двох об'єктів.",
      "Виведіть <code>Length: 0</code>, <code>Length: 4</code>, <code>Swapped: 2 1</code> і <code>Alias: 99</code> (змінна <code>c</code> — друге ім'я для <code>a</code>).",
    ],
    starter: raw`public class Main {
    static int safeLength(String s) {
        // TODO: 0 для null, інакше s.length()
        return -1;
    }

    static void swapValues(Box a, Box b) {
        // TODO: поміняйте місцями a.value і b.value
    }

    public static void main(String[] args) {
        System.out.println("Length: " + safeLength(null));
        System.out.println("Length: " + safeLength("java"));
        Box a = new Box(1);
        Box b = new Box(2);
        swapValues(a, b);
        System.out.println("Swapped: " + a.value + " " + b.value);
        Box c = a;
        // TODO: через c запишіть у value число 99 і виведіть Alias: та a.value
    }
}

class Box {
    int value;

    Box(int value) {
        this.value = value;
    }
}
`,
    checks: [
      { on: "stdout", name: "Для null довжина 0", has: "Length: 0", hint: "if (s == null) { return 0; }" },
      { on: "stdout", name: "Для рядка java довжина 4", has: "Length: 4", hint: "Інакше повертайте s.length()" },
      { on: "stdout", name: "Значення поміняно: «Swapped: 2 1»", has: "Swapped: 2 1", hint: "Збережіть a.value у тимчасову змінну, потім переприсвойте" },
      { on: "stdout", name: "Через друге ім'я змінено той самий об'єкт: «Alias: 99»", has: "Alias: 99", hint: "c = a, тому c.value = 99 змінює і a.value" },
      { on: "source", name: "Є перевірка на null", matches: "==\\s*null|null\\s*==", hint: "s == null" },
    ],
  },
  {
    ...base, id: "java-account-encap", lesson: "java/33", xp: 30,
    title: "Інкапсуляція: банківський рахунок",
    context: "Рахунок має приховувати баланс і давати змінювати його лише операціями з перевіркою: поповнити можна додатну суму, а зняти — не більше, ніж є. Ще клас рахує, скільки рахунків створено.",
    brief: [
      "Допишіть клас <code>Account</code>: приватне поле <code>balance</code>, статичний лічильник <code>created</code>, <code>deposit(int)</code> (лише додатна сума), <code>withdraw(int)</code> (повертає <code>false</code>, якщо сума недодатна або більша за баланс) і <code>getBalance()</code>.",
      "Очікуваний вивід: <code>Balance: 150</code>, <code>Withdraw 500: false</code>, <code>Withdraw 30: true</code>, <code>Balance: 120</code>, <code>Accounts: 2</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        Account acc = new Account(100);
        new Account(0);
        acc.deposit(50);
        System.out.println("Balance: " + acc.getBalance());
        System.out.println("Withdraw 500: " + acc.withdraw(500));
        System.out.println("Withdraw 30: " + acc.withdraw(30));
        System.out.println("Balance: " + acc.getBalance());
        System.out.println("Accounts: " + Account.getCreated());
    }
}

class Account {
    // TODO: private int balance; private static int created;
    // конструктор (збільшує created), deposit, withdraw, getBalance, статичний getCreated
}
`,
    checks: [
      { on: "stdout", name: "Поповнення: «Balance: 150»", has: "Balance: 150", hint: "deposit додає суму, якщо вона більша за 0" },
      { on: "stdout", name: "Зняття: false для 500 і true для 30", has: "Withdraw 500: false\nWithdraw 30: true", hint: "withdraw повертає false, якщо amount > balance" },
      { on: "stdout", name: "Баланс після зняття: «Balance: 120»", has: "Balance: 120", hint: "150 - 30 = 120" },
      { on: "stdout", name: "Лічильник рахунків: «Accounts: 2»", has: "Accounts: 2", hint: "created++ у конструкторі, поле static" },
      { on: "source", name: "Баланс приватний", matches: "private\\s+int\\s+balance", hint: "private int balance;" },
      { on: "source", name: "Лічильник статичний", matches: "static\\s+int\\s+created", hint: "private static int created;" },
    ],
  },
  {
    ...base, id: "java-employee-inherit", lesson: "java/34", xp: 30,
    title: "Наслідування: працівники й зарплата",
    context: "Абстрактний клас задає спільне (ім'я) і вимагає від нащадків власної реалізації (розрахунок зарплати). Код, що працює з Employee, не знає, який саме нащадок перед ним.",
    brief: [
      "Допишіть класи <code>Manager</code> (<code>baseSalary</code> плюс <code>bonus</code>) і <code>Developer</code> (<code>hours * rate</code>), які наслідують <code>Employee</code> і перевизначають <code>salary()</code>. У конструкторах викликайте <code>super(name)</code>.",
      "Очікуваний вивід: <code>Ira: 5500.0</code>, <code>Taras: 4000.0</code> і <code>Total: 9500.0</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        Employee[] staff = {new Manager("Ira", 5000, 500), new Developer("Taras", 160, 25)};
        double total = 0;
        for (Employee e : staff) {
            System.out.println(e.getName() + ": " + e.salary());
            total += e.salary();
        }
        System.out.println("Total: " + total);
    }
}

abstract class Employee {
    private final String name;

    Employee(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }

    abstract double salary();
}

// TODO: class Manager extends Employee: поля baseSalary і bonus, salary() = base + bonus
// TODO: class Developer extends Employee: поля hours і rate, salary() = hours * rate
`,
    checks: [
      { on: "stdout", name: "Зарплата менеджера: «Ira: 5500.0»", has: "Ira: 5500.0", hint: "5000 + 500" },
      { on: "stdout", name: "Зарплата розробника: «Taras: 4000.0»", has: "Taras: 4000.0", hint: "160 * 25" },
      { on: "stdout", name: "Загальна сума: «Total: 9500.0»", has: "Total: 9500.0", hint: "Складіть salary() усіх працівників" },
      { on: "source", name: "Manager наслідує Employee", matches: "class\\s+Manager\\s+extends\\s+Employee", hint: "class Manager extends Employee { ... }" },
      { on: "source", name: "Developer наслідує Employee", matches: "class\\s+Developer\\s+extends\\s+Employee", hint: "class Developer extends Employee { ... }" },
      { on: "source", name: "Використано super(name) і @Override", matches: "super\\(\\s*name\\s*\\)[\\s\\S]*@Override|@Override[\\s\\S]*super\\(\\s*name\\s*\\)", hint: "Конструктор викликає super(name), метод позначено @Override" },
    ],
  },
  {
    ...base, id: "java-enum-status", lesson: "java/35", xp: 30,
    title: "enum: статуси замовлення",
    context: "Статуси замовлення мають фіксований набір і порядок: новий, оплачений, відправлений, завершений. Enum із полем і методом next() замінює магічні числа й гарантує, що неіснуючого статусу не буде.",
    brief: [
      "Допишіть у <code>Status</code> метод <code>next()</code>: наступний статус за порядком оголошення, а для останнього — він сам (<code>values()</code> і <code>ordinal()</code>).",
      "Очікуваний вивід: ланцюжок <code>New -&gt; Paid</code>, <code>Paid -&gt; Shipped</code>, <code>Shipped -&gt; Done</code>, <code>Done -&gt; Done</code> і <code>Parsed: Paid</code> для <code>Status.valueOf(\"PAID\")</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        for (Status s : Status.values()) {
            System.out.println(s.getLabel() + " -> " + s.next().getLabel());
        }
        System.out.println("Parsed: " + Status.valueOf("PAID").getLabel());
    }
}

enum Status {
    NEW("New"), PAID("Paid"), SHIPPED("Shipped"), DONE("Done");

    private final String label;

    Status(String label) {
        this.label = label;
    }

    String getLabel() {
        return label;
    }

    Status next() {
        // TODO: наступна константа, для останньої повертайте this
        return this;
    }
}
`,
    checks: [
      { on: "stdout", name: "Перші переходи", has: "New -> Paid\nPaid -> Shipped\nShipped -> Done", hint: "values()[ordinal() + 1]" },
      { on: "stdout", name: "Останній статус лишається собою", has: "Done -> Done", hint: "Для останньої константи поверніть this" },
      { on: "stdout", name: "valueOf повертає PAID", has: "Parsed: Paid", hint: "Цей рядок уже виводиться" },
      { on: "source", name: "Використано values() і ordinal()", matches: "values\\(\\)[\\s\\S]*ordinal\\(\\)|ordinal\\(\\)[\\s\\S]*values\\(\\)", hint: "Status[] all = values(); ... all[ordinal() + 1]" },
    ],
  },
  {
    ...base, id: "java-equals-hash", lesson: "java/36", xp: 35,
    title: "equals, hashCode і toString для Point",
    context: "Без equals і hashCode два однакові за змістом об'єкти вважаються різними, а множина зберігає дублікати. З правильною парою методів колекції, пошук і тести працюють за змістом.",
    brief: [
      "Перевизначте в класі <code>Point</code> методи <code>equals</code> (через <code>instanceof</code> і порівняння полів), <code>hashCode</code> (<code>Objects.hash(x, y)</code>) і <code>toString</code> (формат <code>Point(1, 2)</code>).",
      "Очікуваний вивід: <code>true</code> (equals), <code>true</code> (contains у списку), <code>1</code> (розмір множини з двох однакових точок) і <code>Point(1, 2)</code>.",
    ],
    starter: raw`import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2);
        System.out.println(p1.equals(p2));
        System.out.println(List.of(p1).contains(p2));
        Set<Point> set = new HashSet<>();
        set.add(p1);
        set.add(p2);
        System.out.println(set.size());
        System.out.println(p1);
    }
}

class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // TODO: equals, hashCode і toString
}
`,
    checks: [
      { on: "stdout", name: "equals і contains за змістом", has: "true\ntrue\n1\nPoint(1, 2)", hint: "Усі чотири рядки: true, true, 1 і Point(1, 2)" },
      { on: "source", name: "Перевизначено equals", matches: "boolean\\s+equals\\s*\\(\\s*Object", hint: "public boolean equals(Object o)" },
      { on: "source", name: "Перевизначено hashCode", matches: "int\\s+hashCode\\s*\\(\\s*\\)", hint: "public int hashCode() { return Objects.hash(x, y); }" },
      { on: "source", name: "Перевизначено toString", matches: "String\\s+toString\\s*\\(\\s*\\)", hint: "return \"Point(\" + x + \", \" + y + \")\";" },
      { on: "source", name: "Перевірка типу через instanceof", has: "instanceof", hint: "if (!(o instanceof Point p)) { return false; }" },
    ],
  },
  {
    ...base, id: "java-record-money", lesson: "java/37", xp: 30,
    title: "record Money: гроші в копійках",
    context: "Гроші — типове значення: незмінне, порівнюється за змістом і має просте відображення. Record дає це майже безкоштовно, а компактний конструктор забороняє від'ємні суми.",
    brief: [
      "Опишіть <code>record Money(int cents, String currency)</code> із компактним конструктором, що кидає <code>IllegalArgumentException</code> для від'ємних копійок, методом <code>plus(Money other)</code> (нова сума в тій самій валюті) та методом <code>format()</code> (наприклад, <code>15.00 UAH</code>).",
      "Очікуваний вивід: <code>Money[cents=1500, currency=UAH]</code>, <code>true</code>, <code>1500</code> і <code>15.00 UAH</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        Money a = new Money(1250, "UAH");
        Money b = new Money(250, "UAH");
        Money sum = a.plus(b);
        System.out.println(sum);
        System.out.println(sum.equals(new Money(1500, "UAH")));
        System.out.println(sum.cents());
        System.out.println(sum.format());
    }
}

// TODO: record Money(int cents, String currency) з компактним конструктором, plus і format
`,
    checks: [
      { on: "stdout", name: "Рядкове подання record", has: "Money[cents=1500, currency=UAH]", hint: "Формат Name[field=value, ...] створює сам record" },
      { on: "stdout", name: "equals за змістом: true", has: "Money[cents=1500, currency=UAH]\ntrue\n1500", hint: "Рівність і метод доступу cents() record створює автоматично" },
      { on: "stdout", name: "Форматований вигляд: «15.00 UAH»", has: "15.00 UAH", hint: "String.format(\"%d.%02d %s\", cents / 100, cents % 100, currency)" },
      { on: "source", name: "Описано record Money", matches: "record\\s+Money\\s*\\(", hint: "record Money(int cents, String currency) { ... }" },
      { on: "source", name: "Є перевірка в компактному конструкторі", matches: "IllegalArgumentException", hint: "Money { if (cents < 0) throw new IllegalArgumentException(...); }" },
    ],
  },
  {
    ...base, id: "java-builder-order", lesson: "java/38", xp: 35,
    title: "Незмінне замовлення з Builder",
    context: "Замовлення має багато полів, частина з них необов'язкова. Builder збирає їх у зручному порядку й створює незмінний Order, у якому список позицій захищено копією.",
    brief: [
      "Допишіть у <code>Order.Builder</code> методи <code>id</code>, <code>customer</code>, <code>addItem</code> і <code>express</code> (кожен зберігає значення й повертає <code>this</code>) та метод <code>build()</code>, що повертає <code>new Order(this)</code>.",
      "Очікуваний вивід: <code>Order#7 for Ira: [pen, ink] express=true</code> і <code>Items: 2</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Order order = new Order.Builder().id(7).customer("Ira").addItem("pen").addItem("ink").express(true).build();
        System.out.println(order);
        System.out.println("Items: " + order.getItems().size());
    }
}

final class Order {
    private final int id;
    private final String customer;
    private final List<String> items;
    private final boolean express;

    private Order(Builder b) {
        this.id = b.id;
        this.customer = b.customer;
        this.items = List.copyOf(b.items);
        this.express = b.express;
    }

    List<String> getItems() {
        return items;
    }

    @Override
    public String toString() {
        return "Order#" + id + " for " + customer + ": " + items + " express=" + express;
    }

    static class Builder {
        private int id;
        private String customer = "";
        private final List<String> items = new ArrayList<>();
        private boolean express;

        Builder id(int id) {
            // TODO: збережіть значення і поверніть this
            return this;
        }

        Builder customer(String customer) {
            // TODO
            return this;
        }

        Builder addItem(String item) {
            // TODO
            return this;
        }

        Builder express(boolean express) {
            // TODO
            return this;
        }

        Order build() {
            // TODO: new Order(this)
            return null;
        }
    }
}
`,
    checks: [
      { on: "stdout", name: "Замовлення зібрано: Order#7 for Ira", has: "Order#7 for Ira: [pen, ink] express=true", hint: "Кожен метод Builder зберігає значення й повертає this" },
      { on: "stdout", name: "Кількість позицій: «Items: 2»", has: "Items: 2", hint: "addItem додає елемент у items" },
      { on: "source", name: "Builder повертає this з ланцюжкових методів", matches: "return\\s+this\\s*;[\\s\\S]*return\\s+this\\s*;[\\s\\S]*return\\s+this\\s*;", hint: "Кожен ланцюжковий метод закінчується return this;" },
      { on: "source", name: "build() створює Order через new Order(this)", matches: "new\\s+Order\\s*\\(\\s*this\\s*\\)", hint: "return new Order(this);" },
    ],
  },
  {
    ...base, id: "java-memory-lru", lesson: "java/39", xp: 40,
    title: "Кеш без витоку: LRU на LinkedHashMap",
    context: "Кеш без обмеження поступово з'їдає пам'ять: це класичний витік у Java. LRU-кеш видаляє найдавніше використаний запис, коли місця не вистачає, і тримає розмір під контролем.",
    brief: [
      "Допишіть <code>LruCache</code>: конструктор викликає <code>super(16, 0.75f, true)</code> (порядок за використанням) і зберігає <code>capacity</code>, а метод <code>removeEldestEntry</code> повертає <code>size() &gt; capacity</code>.",
      "Очікуваний вивід: <code>Keys: [3, 1, 4]</code>, <code>Has 2: false</code> і <code>Size: 3</code>.",
    ],
    starter: raw`import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        LruCache cache = new LruCache(3);
        cache.put(1, "a");
        cache.put(2, "b");
        cache.put(3, "c");
        cache.get(1);
        cache.put(4, "d");
        System.out.println("Keys: " + cache.keySet());
        System.out.println("Has 2: " + cache.containsKey(2));
        System.out.println("Size: " + cache.size());
    }
}

class LruCache extends LinkedHashMap<Integer, String> {
    private final int capacity;

    LruCache(int capacity) {
        // TODO: super(16, 0.75f, true) і збереження capacity
        this.capacity = capacity;
    }

    // TODO: перевизначте removeEldestEntry(Map.Entry<Integer, String> eldest)
}
`,
    checks: [
      { on: "stdout", name: "Найдавніший запис видалено: Keys: [3, 1, 4]", has: "Keys: [3, 1, 4]", hint: "Після get(1) ключ 1 «свіжий», а ключ 2 найстаріший" },
      { on: "stdout", name: "Ключа 2 більше немає, розмір 3", has: "Has 2: false\nSize: 3", hint: "removeEldestEntry повертає true, коли розмір перевищує ємність" },
      { on: "source", name: "Порядок за використанням: super(16, 0.75f, true)", matches: "super\\(\\s*16\\s*,\\s*0\\.75f\\s*,\\s*true\\s*\\)", hint: "Третій параметр true вмикає порядок за доступом" },
      { on: "source", name: "Перевизначено removeEldestEntry", matches: "boolean\\s+removeEldestEntry", hint: "protected boolean removeEldestEntry(Map.Entry<Integer, String> eldest)" },
    ],
  },
];
