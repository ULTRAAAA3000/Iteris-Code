// Практичні завдання курсу Java: по одному на кожен урок. Запускаються на сервері (runtime: "remote"), перевірка за stdout і кодом.
// Еталони: tests/solutions/java.mjs. Правила цього набору:
//  - головний клас називається Main і йде в файлі першим, допоміжні класи після нього;
//  - текст у виводі англійською (ASCII): кодування stdout у Java залежить від налаштувань середовища, і кирилиця може стати «?».
import type { RemoteTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "java", runtime: "remote", lang: "java", file: "Main.java", editorLang: "java", premium: false } as const;

export const JAVA_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "java-hello-jdk", lesson: "java/1", xp: 15,
    title: "Перевірка JDK: перший запуск",
    context: "Після встановлення JDK перше, що роблять, це запускають найпростішу програму: так видно, що компілятор і віртуальна машина працюють. Усе в Java живе в класі, а запуск починається з методу main.",
    brief: [
      "Виведіть два рядки: <code>Hello, Java!</code> і <code>JDK works</code> через <code>System.out.println</code>.",
      "Клас має називатися <code>Main</code>: це ім'я файла й точка входу. Усі завдання курсу виводять англійський текст, бо кодування консолі в Java залежить від середовища.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        // Виведіть два рядки: Hello, Java! і JDK works
        System.out.println();
    }
}
`,
    checks: [
      { on: "stdout", name: "Виводить «Hello, Java!»", has: "Hello, Java!" },
      { on: "stdout", name: "Виводить «JDK works»", has: "JDK works" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Hello, Java!\nJDK works" },
    ],
  },
  {
    ...base, id: "java-printf-total", lesson: "java/2", xp: 15,
    title: "Форматований вивід суми через printf",
    context: "Гроші показують з двома знаками після коми, а не як 599.9699999999999. Для цього в Java є printf і специфікатори формату: %.2f для дробових, %d для цілих, %n для переносу рядка.",
    brief: [
      "Виведіть через <code>printf</code> два рядки: <code>Total: 599.97</code> (<code>price * qty</code> з двома знаками) і <code>Items: 3</code>.",
      "Підказка: <code>System.out.printf(\"Total: %.2f%n\", ...)</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        double price = 199.99;
        int qty = 3;
        // TODO: через printf виведіть Total: 599.97 і Items: 3
        System.out.println(price * qty);
    }
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Total: 599.97»", has: "Total: 599.97" },
      { on: "stdout", name: "Рядок «Items: 3»", has: "Items: 3" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Total: 599.97\nItems: 3" },
      { on: "source", name: "Використано printf", has: "printf(" },
    ],
  },
  {
    ...base, id: "java-types-average", lesson: "java/3", xp: 20,
    title: "Типи, цілочисельне ділення і приведення",
    context: "У Java 13 / 3 дорівнює 4, а не 4.33: ділення цілих відкидає дробову частину. Це класична причина помилок у середніх значеннях і відсотках. Лікується приведенням типу.",
    brief: [
      "У заготовці виводиться лише результат цілочисельного ділення. Виведіть три рядки: <code>Int division: 4</code>, <code>Average: 4.33</code> (середнє <code>a</code>, <code>b</code>, <code>c</code> як <code>double</code>, два знаки) і <code>Code of A: 65</code> (числовий код символу <code>'A'</code> через <code>(int)</code>).",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        int a = 4, b = 5, c = 4;
        int sum = a + b + c;
        System.out.println("Int division: " + sum / 3);
        // TODO: Average: 4.33 (як double, %.2f) і Code of A: 65
    }
}
`,
    checks: [
      { on: "stdout", name: "Цілочисельне ділення: 4", has: "Int division: 4" },
      { on: "stdout", name: "Середнє як double: 4.33", has: "Average: 4.33" },
      { on: "stdout", name: "Код символу A: 65", has: "Code of A: 65" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Int division: 4\nAverage: 4.33\nCode of A: 65" },
      { on: "source", name: "Є приведення типу або дробове ділення", matches: "\\(\\s*(double|int)\\s*\\)|/\\s*3\\.0" },
    ],
  },
  {
    ...base, id: "java-fizzbuzz-switch", lesson: "java/4", xp: 20,
    title: "FizzBuzz і switch",
    context: "Цикл for перебирає числа, if вирішує, що робити, а switch заміняє довгий ланцюжок if/else, коли значень багато: день тижня, код статусу, тип події.",
    brief: [
      "У циклі <code>for</code> виведіть числа від 1 до 15, але <code>Fizz</code> для кратних 3, <code>Buzz</code> для кратних 5 і <code>FizzBuzz</code> для кратних обом.",
      "Допишіть <code>dayName(int d)</code> через <code>switch</code>: 1 дає <code>Mon</code>, 2 дає <code>Tue</code>, 3 дає <code>Wed</code>, решта <code>Unknown</code>.",
    ],
    starter: raw`public class Main {
    static String dayName(int d) {
        // TODO: switch (1 -> Mon, 2 -> Tue, 3 -> Wed, інакше Unknown)
        return "";
    }

    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            System.out.println(i);   // TODO: Fizz / Buzz / FizzBuzz
        }
        System.out.println(dayName(2));
        System.out.println(dayName(9));
    }
}
`,
    checks: [
      { on: "stdout", name: "FizzBuzz для 1..15", has: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n" },
      { on: "stdout", name: "dayName(2) дає Tue", has: "FizzBuzz\nTue" },
      { on: "stdout", name: "dayName(9) дає Unknown", has: "Tue\nUnknown" },
      { on: "source", name: "Використано switch", matches: "\\bswitch\\b" },
    ],
  },
  {
    ...base, id: "java-methods-overload", lesson: "java/5", xp: 25,
    title: "Методи і перевантаження",
    context: "Перевантаження дозволяє мати кілька методів з однією назвою, але різними параметрами: area(r) для кола і area(w, h) для прямокутника. Виклик сам вибирає потрібний варіант.",
    brief: [
      "Допишіть <code>max(int a, int b)</code>, <code>area(double r)</code> (площа кола, <code>Math.PI * r * r</code>) і <code>area(double w, double h)</code> (площа прямокутника).",
      "Методи мають однакову назву <code>area</code>, але різні списки параметрів.",
    ],
    starter: raw`public class Main {
    static int max(int a, int b) {
        // TODO
        return 0;
    }

    // TODO: area(double r) для кола і area(double w, double h) для прямокутника

    public static void main(String[] args) {
        System.out.println(max(7, 3));
        System.out.printf("%.2f%n", area(2));
        System.out.println(area(3, 4));
    }
}
`,
    checks: [
      { on: "stdout", name: "max(7, 3) дає 7", has: "7\n" },
      { on: "stdout", name: "Площа кола з r = 2: 12.57", has: "12.57" },
      { on: "stdout", name: "Площа прямокутника 3 x 4: 12.0", has: "12.0" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "7\n12.57\n12.0" },
      { on: "source", name: "Два методи з назвою area", matches: "area\\([\\s\\S]*static[\\s\\S]*area\\(|static[^\\n]*\\barea\\([^\\n]*\\n[\\s\\S]*static[^\\n]*\\barea\\(" },
    ],
  },
  {
    ...base, id: "java-strings-slug", lesson: "java/6", xp: 25,
    title: "Рядки: slug, reverse і паліндром",
    context: "Рядки в Java незмінні, тому для складання й перевертання використовують StringBuilder, а для розбору split і String.join. Із заголовка статті так роблять адресу сторінки.",
    brief: [
      "Допишіть <code>slug(String title)</code>: обрізати пробіли (<code>trim</code>), привести до малих літер, розділити за пробілами (<code>split(\"\\\\s+\")</code>) і з'єднати дефісом (<code>String.join</code>).",
      "Допишіть <code>reverse(String s)</code> через <code>StringBuilder</code> і <code>isPalindrome(String s)</code> (без урахування регістру).",
    ],
    starter: raw`public class Main {
    static String slug(String title) {
        // TODO: trim, toLowerCase, split("\\s+"), String.join("-", ...)
        return title;
    }

    static String reverse(String s) {
        // TODO: StringBuilder.reverse()
        return s;
    }

    static boolean isPalindrome(String s) {
        // TODO: порівняйте рядок з його перевернутою версією без урахування регістру
        return false;
    }

    public static void main(String[] args) {
        System.out.println(slug("  Hello   World From Java "));
        System.out.println(reverse("Java"));
        System.out.println(isPalindrome("Level"));
        System.out.println(isPalindrome("Java"));
    }
}
`,
    checks: [
      { on: "stdout", name: "slug: hello-world-from-java", has: "hello-world-from-java" },
      { on: "stdout", name: "reverse(\"Java\") дає avaJ", has: "avaJ" },
      { on: "stdout", name: "Level це паліндром", has: "avaJ\ntrue" },
      { on: "stdout", name: "Java не паліндром", has: "true\nfalse" },
      { on: "source", name: "Використано StringBuilder", has: "StringBuilder" },
    ],
  },
  {
    ...base, id: "java-arrays-list", lesson: "java/7", xp: 25,
    title: "Масив і ArrayList: сума та парні числа",
    context: "Масив має фіксований розмір, ArrayList росте разом з даними. Сума й фільтрація колекції це щоденні операції з даними: підсумок замовлення, відбір записів за умовою.",
    brief: [
      "Допишіть <code>sum(int[] a)</code>: сума елементів масиву.",
      "Допишіть <code>evens(int[] a)</code>: поверніть <code>ArrayList&lt;Integer&gt;</code> лише з парних чисел у тому ж порядку (метод <code>add</code>).",
    ],
    starter: raw`import java.util.ArrayList;

public class Main {
    static int sum(int[] a) {
        // TODO
        return 0;
    }

    static ArrayList<Integer> evens(int[] a) {
        // TODO: новий ArrayList із парних чисел
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        int[] nums = {5, 2, 9, 7, 4, 10, 3, 8};
        System.out.println("Sum: " + sum(nums));
        System.out.println("Evens: " + evens(nums));
        System.out.println("Count: " + evens(nums).size());
    }
}
`,
    checks: [
      { on: "stdout", name: "Сума: 48", has: "Sum: 48" },
      { on: "stdout", name: "Парні: [2, 4, 10, 8]", has: "Evens: [2, 4, 10, 8]" },
      { on: "stdout", name: "Кількість парних: 4", has: "Count: 4" },
      { on: "source", name: "Елементи додаються через add", has: ".add(" },
    ],
  },
  {
    ...base, id: "java-wordcount-map", lesson: "java/8", xp: 30,
    title: "Частота слів: HashMap і HashSet",
    context: "HashMap зберігає пари «ключ: значення» і миттєво знаходить за ключем, а HashSet зберігає лише унікальні значення. Підрахунок частоти й видалення дублікатів це їх головні застосування.",
    brief: [
      "Допишіть <code>count(String text)</code>: поверніть <code>HashMap&lt;String, Integer&gt;</code>, де ключ це слово, а значення це кількість його появ (<code>getOrDefault</code> або <code>merge</code>).",
      "Допишіть <code>uniqueCount(String text)</code>: скільки різних слів у тексті (<code>HashSet</code>). Мапа виводиться через <code>TreeMap</code>, щоб порядок був стабільним.",
    ],
    starter: raw`import java.util.HashMap;
import java.util.HashSet;
import java.util.TreeMap;

public class Main {
    static HashMap<String, Integer> count(String text) {
        // TODO: слово -> скільки разів зустрілось
        return new HashMap<>();
    }

    static int uniqueCount(String text) {
        // TODO: кількість різних слів через HashSet
        return 0;
    }

    public static void main(String[] args) {
        String text = "go is fun and go is fast";
        System.out.println(new TreeMap<>(count(text)));
        System.out.println("Unique: " + uniqueCount(text));
    }
}
`,
    checks: [
      { on: "stdout", name: "Підрахунок слів правильний", has: "{and=1, fast=1, fun=1, go=2, is=2}" },
      { on: "stdout", name: "Унікальних слів: 5", has: "Unique: 5" },
      { on: "source", name: "Використано HashSet", has: "new HashSet" },
    ],
  },
  {
    ...base, id: "java-product-class", lesson: "java/9", xp: 35,
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
      { on: "stdout", name: "toString: Bread: 25.50", has: "Bread: 25.50" },
      { on: "stdout", name: "Усі три товари виведено", has: "Bread: 25.50\nMilk: 42.00\nCheese: 180.00" },
      { on: "stdout", name: "Сума цін: 247.50", has: "Total: 247.50" },
      { on: "source", name: "Поля приватні", matches: "private\\s+(final\\s+)?double\\s+price" },
      { on: "source", name: "Описано метод toString", matches: "String\\s+toString\\s*\\(" },
    ],
  },
  {
    ...base, id: "java-shapes-interface", lesson: "java/10", xp: 35,
    title: "Інтерфейс Shape і поліморфізм",
    context: "Інтерфейс описує, що вміє об'єкт, не уточнюючи як. Код працює зі списком Shape, і йому байдуже, кружечок там чи прямокутник: кожен сам знає, як рахувати площу.",
    brief: [
      "Інтерфейс <code>Shape</code> уже описаний. Реалізуйте його в класах <code>Circle</code> (радіус) та <code>Rect</code> (ширина й висота): <code>name()</code> повертає <code>Circle</code> / <code>Rectangle</code>, а <code>area()</code> площу.",
      "У <code>main</code> фігури лежать у списку типу <code>List&lt;Shape&gt;</code>, і цикл не знає, яка саме перед ним.",
    ],
    starter: raw`import java.util.List;

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

// TODO: class Circle implements Shape (конструктор Circle(double r))
// TODO: class Rect implements Shape (конструктор Rect(double w, double h))
`,
    checks: [
      { on: "stdout", name: "Circle: 12.57", has: "Circle: 12.57" },
      { on: "stdout", name: "Rectangle: 12.00", has: "Rectangle: 12.00" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Circle: 12.57\nRectangle: 12.00" },
      { on: "source", name: "Обидва класи реалізують Shape", matches: "class\\s+Circle\\s+implements\\s+Shape[\\s\\S]*class\\s+Rect\\s+implements\\s+Shape" },
    ],
  },
  {
    ...base, id: "java-exceptions-custom", lesson: "java/11", xp: 40,
    title: "Власний виняток InsufficientFundsException",
    context: "Перевірений виняток (checked exception) змушує того, хто викликає метод, подумати про помилку: компілятор не пропустить код без try/catch або throws. Блок finally виконується завжди.",
    brief: [
      "Опишіть клас <code>InsufficientFundsException extends Exception</code> (конструктор приймає повідомлення й передає його в <code>super</code>).",
      "Допишіть <code>withdraw(int balance, int amount)</code>: якщо коштів менше, ніж треба, кидає цей виняток з повідомленням <code>insufficient funds</code>, інакше повертає новий баланс. Метод оголошує <code>throws InsufficientFundsException</code>.",
    ],
    starter: raw`public class Main {
    // TODO: додайте throws InsufficientFundsException і перевірку balance < amount
    static int withdraw(int balance, int amount) {
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

// TODO: class InsufficientFundsException extends Exception
`,
    checks: [
      { on: "stdout", name: "Успішне зняття: Balance: 70", has: "Balance: 70\n" },
      { on: "stdout", name: "Виняток спіймано з повідомленням", has: "Error: insufficient funds" },
      { on: "stdout", name: "Блок finally виконався", has: "Done" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Balance: 70\nError: insufficient funds\nDone" },
      { on: "source", name: "Власний виняток успадковує Exception", matches: "class\\s+InsufficientFundsException\\s+extends\\s+Exception" },
      { on: "source", name: "Метод оголошує throws", matches: "withdraw\\([^)]*\\)\\s+throws\\s+InsufficientFundsException" },
    ],
  },
];
