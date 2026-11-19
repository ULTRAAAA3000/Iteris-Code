// Еталонні рішення завдань Java, глава 01 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_01 = {
  "java-hello-jdk": raw`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        System.out.println("JDK works");
        System.out.println("Java 21+: " + (Runtime.version().feature() >= 21));
    }
}
`,
  "java-print-receipt": raw`public class Main {
    public static void main(String[] args) {
        int pen = 20;
        int notebook = 25;
        System.out.println("Item\tPrice");
        System.out.println("Pen\t" + pen);
        System.out.println("Notebook\t" + notebook);
        System.out.print("Items: ");
        System.out.println(2);
        System.out.println("Total: " + (pen + notebook));
    }
}
`,
  "java-imports-tidy": raw`import java.util.ArrayList;
import java.util.List;
import static java.lang.Math.max;

public class Main {
    public static void main(String[] args) {
        List<Integer> prices = new ArrayList<>();
        prices.add(40);
        prices.add(15);
        prices.add(650);
        int best = max(prices.get(0), max(prices.get(1), prices.get(2)));
        System.out.println("Prices: " + prices);
        System.out.println("Max: " + best);
    }
}
`,
  "java-fix-stacktrace": raw`public class Main {
    public static void main(String[] args) {
        int price = 120;
        int count = 3;
        int total = price * count;
        System.out.println("Total: " + total);
        System.out.println("Average: " + total / count);
        int people = 4;
        System.out.println("Per person: " + total / people);
    }
}
`,
};
