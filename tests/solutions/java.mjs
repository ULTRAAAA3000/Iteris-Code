// Еталонні рішення завдань Java (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const JAVA = {
  "java-hello-jdk": raw`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        System.out.println("JDK works");
    }
}
`,
  "java-printf-total": raw`public class Main {
    public static void main(String[] args) {
        double price = 199.99;
        int qty = 3;
        System.out.printf("Total: %.2f%n", price * qty);
        System.out.printf("Items: %d%n", qty);
    }
}
`,
  "java-types-average": raw`public class Main {
    public static void main(String[] args) {
        int a = 4, b = 5, c = 4;
        int sum = a + b + c;
        System.out.println("Int division: " + sum / 3);
        double avg = (double) sum / 3;
        System.out.printf("Average: %.2f%n", avg);
        System.out.println("Code of A: " + (int) 'A');
    }
}
`,
  "java-fizzbuzz-switch": raw`public class Main {
    static String dayName(int d) {
        switch (d) {
            case 1: return "Mon";
            case 2: return "Tue";
            case 3: return "Wed";
            default: return "Unknown";
        }
    }

    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            if (i % 15 == 0) System.out.println("FizzBuzz");
            else if (i % 3 == 0) System.out.println("Fizz");
            else if (i % 5 == 0) System.out.println("Buzz");
            else System.out.println(i);
        }
        System.out.println(dayName(2));
        System.out.println(dayName(9));
    }
}
`,
  "java-methods-overload": raw`public class Main {
    static int max(int a, int b) {
        return a > b ? a : b;
    }

    static double area(double r) {
        return Math.PI * r * r;
    }

    static double area(double w, double h) {
        return w * h;
    }

    public static void main(String[] args) {
        System.out.println(max(7, 3));
        System.out.printf("%.2f%n", area(2));
        System.out.println(area(3, 4));
    }
}
`,
  "java-strings-slug": raw`public class Main {
    static String slug(String title) {
        return String.join("-", title.trim().toLowerCase().split("\\s+"));
    }

    static String reverse(String s) {
        return new StringBuilder(s).reverse().toString();
    }

    static boolean isPalindrome(String s) {
        return s.equalsIgnoreCase(reverse(s));
    }

    public static void main(String[] args) {
        System.out.println(slug("  Hello   World From Java "));
        System.out.println(reverse("Java"));
        System.out.println(isPalindrome("Level"));
        System.out.println(isPalindrome("Java"));
    }
}
`,
  "java-arrays-list": raw`import java.util.ArrayList;

public class Main {
    static int sum(int[] a) {
        int total = 0;
        for (int n : a) total += n;
        return total;
    }

    static ArrayList<Integer> evens(int[] a) {
        ArrayList<Integer> out = new ArrayList<>();
        for (int n : a) {
            if (n % 2 == 0) out.add(n);
        }
        return out;
    }

    public static void main(String[] args) {
        int[] nums = {5, 2, 9, 7, 4, 10, 3, 8};
        System.out.println("Sum: " + sum(nums));
        System.out.println("Evens: " + evens(nums));
        System.out.println("Count: " + evens(nums).size());
    }
}
`,
  "java-wordcount-map": raw`import java.util.HashMap;
import java.util.HashSet;
import java.util.TreeMap;

public class Main {
    static HashMap<String, Integer> count(String text) {
        HashMap<String, Integer> counts = new HashMap<>();
        for (String w : text.split(" ")) {
            counts.put(w, counts.getOrDefault(w, 0) + 1);
        }
        return counts;
    }

    static int uniqueCount(String text) {
        HashSet<String> set = new HashSet<>();
        for (String w : text.split(" ")) set.add(w);
        return set.size();
    }

    public static void main(String[] args) {
        String text = "go is fun and go is fast";
        System.out.println(new TreeMap<>(count(text)));
        System.out.println("Unique: " + uniqueCount(text));
    }
}
`,
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
        return String.format("%s: %.2f", name, price);
    }
}
`,
  "java-shapes-interface": raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(2), new Rect(3, 4));
        for (Shape s : shapes) {
            System.out.printf("%s: %.2f%n", s.name(), s.area());
        }
    }
}

interface Shape {
    double area();
    String name();
}

class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
    public String name() { return "Circle"; }
}

class Rect implements Shape {
    private final double w, h;
    Rect(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
    public String name() { return "Rectangle"; }
}
`,
  "java-exceptions-custom": raw`public class Main {
    static int withdraw(int balance, int amount) throws InsufficientFundsException {
        if (balance < amount) {
            throw new InsufficientFundsException("insufficient funds");
        }
        return balance - amount;
    }

    public static void main(String[] args) {
        try {
            System.out.println("Balance: " + withdraw(100, 30));
            System.out.println("Balance: " + withdraw(70, 500));
        } catch (InsufficientFundsException e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            System.out.println("Done");
        }
    }
}

class InsufficientFundsException extends Exception {
    InsufficientFundsException(String message) {
        super(message);
    }
}
`,
};
