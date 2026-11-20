// Еталонні рішення завдань Java, глава 04 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_04 = {
  "java-product-class": raw`import java.util.List;

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

class Product {
    private final String name;
    private final double price;

    Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    double getPrice() {
        return price;
    }

    @Override
    public String toString() {
        return name + ": " + String.format("%.2f", price);
    }
}
`,
  "java-ref-swap": raw`public class Main {
    static int safeLength(String s) {
        if (s == null) {
            return 0;
        }
        return s.length();
    }

    static void swapValues(Box a, Box b) {
        int tmp = a.value;
        a.value = b.value;
        b.value = tmp;
    }

    public static void main(String[] args) {
        System.out.println("Length: " + safeLength(null));
        System.out.println("Length: " + safeLength("java"));
        Box a = new Box(1);
        Box b = new Box(2);
        swapValues(a, b);
        System.out.println("Swapped: " + a.value + " " + b.value);
        Box c = a;
        c.value = 99;
        System.out.println("Alias: " + a.value);
    }
}

class Box {
    int value;

    Box(int value) {
        this.value = value;
    }
}
`,
  "java-account-encap": raw`public class Main {
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
    private int balance;
    private static int created;

    Account(int balance) {
        this.balance = balance;
        created++;
    }

    void deposit(int amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    boolean withdraw(int amount) {
        if (amount <= 0 || amount > balance) {
            return false;
        }
        balance -= amount;
        return true;
    }

    int getBalance() {
        return balance;
    }

    static int getCreated() {
        return created;
    }
}
`,
  "java-employee-inherit": raw`public class Main {
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

class Manager extends Employee {
    private final double baseSalary;
    private final double bonus;

    Manager(String name, double baseSalary, double bonus) {
        super(name);
        this.baseSalary = baseSalary;
        this.bonus = bonus;
    }

    @Override
    double salary() {
        return baseSalary + bonus;
    }
}

class Developer extends Employee {
    private final int hours;
    private final double rate;

    Developer(String name, int hours, double rate) {
        super(name);
        this.hours = hours;
        this.rate = rate;
    }

    @Override
    double salary() {
        return hours * rate;
    }
}
`,
  "java-enum-status": raw`public class Main {
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
        Status[] all = values();
        if (ordinal() == all.length - 1) {
            return this;
        }
        return all[ordinal() + 1];
    }
}
`,
  "java-equals-hash": raw`import java.util.HashSet;
import java.util.List;
import java.util.Objects;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Point p)) {
            return false;
        }
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
}
`,
  "java-record-money": raw`public class Main {
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

record Money(int cents, String currency) {
    Money {
        if (cents < 0) {
            throw new IllegalArgumentException("negative amount: " + cents);
        }
    }

    Money plus(Money other) {
        return new Money(cents + other.cents, currency);
    }

    String format() {
        return String.format("%d.%02d %s", cents / 100, cents % 100, currency);
    }
}
`,
  "java-builder-order": raw`import java.util.ArrayList;
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
            this.id = id;
            return this;
        }

        Builder customer(String customer) {
            this.customer = customer;
            return this;
        }

        Builder addItem(String item) {
            this.items.add(item);
            return this;
        }

        Builder express(boolean express) {
            this.express = express;
            return this;
        }

        Order build() {
            return new Order(this);
        }
    }
}
`,
  "java-memory-lru": raw`import java.util.LinkedHashMap;
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
        super(16, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, String> eldest) {
        return size() > capacity;
    }
}
`,
};
