// Проєкти за ТЗ для Java (див. program-types.ts). Еталони: tests/solutions/java-projects.mjs.
import type { ProgramProject } from "./program-types.ts";

// Спільні допоміжні методи harness: r — запуск перевірки, eq/near — порівняння, thrown — очікування виняткy
const HELPERS = `  interface Check { void run() throws Exception; }
  static void r(String id, Check c) {
    try { c.run(); System.out.println(id + " PASS"); }
    catch (Throwable t) {
      String m = t.getMessage();
      if (m == null) m = t.getClass().getSimpleName();
      m = m.replaceAll("\\\\s+", " ");
      System.out.println(id + " FAIL: " + m);
    }
  }
  static void eq(Object exp, Object got) {
    if (!String.valueOf(exp).equals(String.valueOf(got))) throw new Error("очікувалось " + exp + ", отримано " + got);
  }
  static void near(double exp, double got) {
    if (Math.abs(exp - got) > 1e-6) throw new Error("очікувалось " + exp + ", отримано " + got);
  }
  static void thrown(Class<?> type, Check c) {
    try { c.run(); }
    catch (Throwable t) {
      if (type.isInstance(t)) return;
      throw new Error("очікувався " + type.getSimpleName() + ", отримано " + t.getClass().getSimpleName());
    }
    throw new Error("очікувався " + type.getSimpleName() + ", але виняток не виник");
  }`;

const wordstatStarter = `import java.util.*;

// Статистика тексту. Слово — послідовність літер (Character.isLetter), усе інше є роздільником.
class TextStats {
    // TODO: кількість слів у тексті
    static int wordCount(String text) {
        return 0;
    }

    // TODO: перше з найдовших слів (з оригінальним регістром), "" якщо слів немає
    static String longestWord(String text) {
        return null;
    }

    // TODO: слово (малими літерами) -> скільки разів зустрілось
    static Map<String, Integer> frequency(String text) {
        return null;
    }

    // TODO: n найчастіших слів; за однакової частоти — за алфавітом
    static List<String> topWords(String text, int n) {
        return null;
    }

    // TODO: паліндром без урахування регістру та всього, крім літер і цифр
    static boolean isPalindrome(String text) {
        return false;
    }
}
`;

const wordstatHarness = `public class Main {
${HELPERS}
  static Map<String, Integer> sorted(Map<String, Integer> m) { return new TreeMap<String, Integer>(m); }

  public static void main(String[] args) {
    r("R1", () -> {
      eq(2, TextStats.wordCount("  Hello,   world! "));
      eq(5, TextStats.wordCount("Я люблю Java, а ти?"));
      eq(3, TextStats.wordCount("один-два\\nтри"));
    });
    r("R2", () -> {
      eq(0, TextStats.wordCount(""));
      eq(0, TextStats.wordCount("... !!! 123"));
      eq(0, TextStats.wordCount(null));
      eq(2, TextStats.wordCount("a1b"));
    });
    r("R3", () -> {
      eq("програмування", TextStats.longestWord("я люблю програмування, а ти?"));
      eq("Cat", TextStats.longestWord("Cat, dog; Cat"));
      eq("Cat", TextStats.longestWord("Cat, dog"));
      eq("", TextStats.longestWord("?! 42"));
    });
    r("R4", () -> {
      Map<String, Integer> m = TextStats.frequency("Дім, дім, ДІМ! Ліс.");
      eq("{дім=3, ліс=1}", sorted(m));
      eq(2, m.size());
    });
    r("R5", () -> {
      Map<String, Integer> m = TextStats.frequency("");
      eq(0, m.size());
      eq(0, TextStats.frequency("123 !!").size());
    });
    r("R6", () -> {
      eq("[a, b, c]", TextStats.topWords("b a b c a d", 3));
      eq("[сміється, хто]", TextStats.topWords("Той, хто сміється, сміється останнім; хто?", 2));
    });
    r("R7", () -> {
      eq("[x, y]", TextStats.topWords("y x y x", 10));
      eq("[]", TextStats.topWords("a b c", 0));
      eq("[]", TextStats.topWords("", 5));
    });
    r("R8", () -> {
      thrown(IllegalArgumentException.class, () -> TextStats.topWords("a b", -1));
      eq("[a]", TextStats.topWords("a a b", 1));
    });
    r("R9", () -> {
      eq(true, TextStats.isPalindrome("А роза упала на лапу Азора"));
      eq(true, TextStats.isPalindrome("Was it a car or a cat I saw?"));
      eq(true, TextStats.isPalindrome("!!!"));
      eq(false, TextStats.isPalindrome("hello"));
      eq(false, TextStats.isPalindrome("ab"));
    });
  }
}`;

const shapesStarter = `import java.util.*;

interface Shape {
    double area();
    double perimeter();
    String name();
}

class Circle implements Shape {
    // TODO: поле радіуса; радіус має бути > 0, інакше IllegalArgumentException
    Circle(double radius) {
    }

    public double area() {
        return 0;
    }

    public double perimeter() {
        return 0;
    }

    public String name() {
        return null;
    }
}

class Rectangle implements Shape {
    // TODO: сторони мають бути > 0, інакше IllegalArgumentException
    Rectangle(double width, double height) {
    }

    public double area() {
        return 0;
    }

    public double perimeter() {
        return 0;
    }

    public String name() {
        return null;
    }
}

class Triangle implements Shape {
    // TODO: три сторони: усі > 0 і кожна менша за суму двох інших, інакше IllegalArgumentException
    Triangle(double a, double b, double c) {
    }

    // TODO: площа за формулою Герона
    public double area() {
        return 0;
    }

    public double perimeter() {
        return 0;
    }

    public String name() {
        return null;
    }
}

class ShapeUtils {
    // TODO: сума площ усіх фігур (для порожнього списку 0)
    static double totalArea(List<Shape> shapes) {
        return 0;
    }

    // TODO: відсортувати список НА МІСЦІ за зростанням площі (наприклад, бульбашкою)
    static void sortByArea(List<Shape> shapes) {
    }

    // TODO: фігура з найбільшою площею, null для порожнього списку
    static Shape largest(List<Shape> shapes) {
        return null;
    }
}
`;

const shapesHarness = `public class Main {
${HELPERS}
  public static void main(String[] args) {
    r("R1", () -> {
      Shape c = new Circle(2);
      near(Math.PI * 4, c.area());
      near(Math.PI * 4, c.perimeter());
    });
    r("R2", () -> {
      Shape s = new Rectangle(3, 4);
      near(12, s.area());
      near(14, s.perimeter());
    });
    r("R3", () -> {
      Shape t = new Triangle(3, 4, 5);
      near(6, t.area());
      near(12, t.perimeter());
      near(Math.sqrt(3) / 4 * 4, new Triangle(2, 2, 2).area());
    });
    r("R4", () -> {
      eq("Коло", new Circle(1).name());
      eq("Прямокутник", new Rectangle(1, 2).name());
      eq("Трикутник", new Triangle(3, 4, 5).name());
    });
    r("R5", () -> {
      thrown(IllegalArgumentException.class, () -> new Circle(0));
      thrown(IllegalArgumentException.class, () -> new Circle(-1));
      thrown(IllegalArgumentException.class, () -> new Rectangle(-1, 2));
      thrown(IllegalArgumentException.class, () -> new Rectangle(2, 0));
      near(2, new Rectangle(2, 1).area());
    });
    r("R6", () -> {
      thrown(IllegalArgumentException.class, () -> new Triangle(1, 2, 3));
      thrown(IllegalArgumentException.class, () -> new Triangle(1, 1, 5));
      thrown(IllegalArgumentException.class, () -> new Triangle(0, 4, 5));
      thrown(IllegalArgumentException.class, () -> new Triangle(3, -4, 5));
      near(12, new Triangle(5, 5, 6).perimeter() - 4);
    });
    r("R7", () -> {
      List<Shape> list = new ArrayList<Shape>();
      near(0, ShapeUtils.totalArea(list));
      list.add(new Rectangle(2, 3));
      list.add(new Rectangle(1, 1));
      list.add(new Triangle(3, 4, 5));
      near(13, ShapeUtils.totalArea(list));
    });
    r("R8", () -> {
      List<Shape> list = new ArrayList<Shape>();
      list.add(new Rectangle(5, 5));
      list.add(new Triangle(3, 4, 5));
      list.add(new Rectangle(1, 2));
      list.add(new Circle(2));
      ShapeUtils.sortByArea(list);
      eq("2.0 6.0 12.566370614359172 25.0", list.get(0).area() + " " + list.get(1).area() + " " + list.get(2).area() + " " + list.get(3).area());
      eq(4, list.size());
    });
    r("R9", () -> {
      List<Shape> list = new ArrayList<Shape>();
      eq(null, ShapeUtils.largest(list));
      Shape big = new Circle(3);
      list.add(new Rectangle(2, 2));
      list.add(big);
      list.add(new Triangle(3, 4, 5));
      if (ShapeUtils.largest(list) != big) throw new Error("найбільшою має бути коло радіуса 3");
      eq(3, list.size());
    });
  }
}`;

const libraryStarter = `import java.util.*;

// Перевірюваний виняток: книгу не можна видати
class BookNotAvailableException extends Exception {
    // TODO: передайте повідомлення в батьківський клас через super(message)
    BookNotAvailableException(String message) {
    }
}

class Book {
    // TODO: поля isbn, title, author і ознака «на полиці»
    Book(String isbn, String title, String author) {
    }

    String getIsbn() {
        return null;
    }

    String getTitle() {
        return null;
    }

    String getAuthor() {
        return null;
    }

    // TODO: нова книга доступна
    boolean isAvailable() {
        return false;
    }

    // TODO: за потреби додайте методи, якими Library змінюватиме стан книги
}

class Library {
    // TODO: сховище книг (наприклад, ArrayList<Book>)

    // TODO: додати книгу; null або повторний isbn -> IllegalArgumentException
    void addBook(Book book) {
    }

    // TODO: скільки книг у фонді загалом
    int size() {
        return 0;
    }

    // TODO: скільки книг зараз на полиці
    int countAvailable() {
        return 0;
    }

    // TODO: книги автора (без урахування регістру) у порядку додавання; порожній список, якщо немає
    List<Book> findByAuthor(String author) {
        return null;
    }

    // TODO: усі доступні книги у порядку додавання
    List<Book> listAvailable() {
        return null;
    }

    // TODO: видати книгу; невідомий isbn або книга вже видана -> BookNotAvailableException
    void borrowBook(String isbn) throws BookNotAvailableException {
    }

    // TODO: повернути книгу; невідомий isbn -> IllegalArgumentException, книга не була видана -> IllegalStateException
    void returnBook(String isbn) {
    }
}
`;

const libraryHarness = `public class Main {
${HELPERS}
  static Library sample() {
    Library lib = new Library();
    lib.addBook(new Book("111", "Кобзар", "Тарас Шевченко"));
    lib.addBook(new Book("222", "Лісова пісня", "Леся Українка"));
    lib.addBook(new Book("333", "Гайдамаки", "Тарас Шевченко"));
    return lib;
  }

  public static void main(String[] args) {
    r("R1", () -> {
      Book b = new Book("111", "Кобзар", "Тарас Шевченко");
      eq("111", b.getIsbn());
      eq("Кобзар", b.getTitle());
      eq("Тарас Шевченко", b.getAuthor());
      eq(true, b.isAvailable());
    });
    r("R2", () -> {
      Library lib = sample();
      eq(3, lib.size());
      eq(3, lib.countAvailable());
      eq(0, new Library().size());
    });
    r("R3", () -> {
      Library lib = sample();
      thrown(IllegalArgumentException.class, () -> lib.addBook(new Book("222", "Інша", "Хтось")));
      thrown(IllegalArgumentException.class, () -> lib.addBook(null));
      eq(3, lib.size());
    });
    r("R4", () -> {
      Library lib = sample();
      List<Book> res = lib.findByAuthor("тарас шевченко");
      eq(2, res.size());
      eq("Кобзар", res.get(0).getTitle());
      eq("Гайдамаки", res.get(1).getTitle());
      eq(0, lib.findByAuthor("Невідомий").size());
    });
    r("R5", () -> {
      Library lib = sample();
      lib.borrowBook("111");
      eq(2, lib.countAvailable());
      eq(3, lib.size());
      List<Book> av = lib.listAvailable();
      eq(2, av.size());
      eq("222", av.get(0).getIsbn());
      eq("333", av.get(1).getIsbn());
    });
    r("R6", () -> {
      Library lib = sample();
      lib.borrowBook("111");
      thrown(BookNotAvailableException.class, () -> lib.borrowBook("111"));
      thrown(BookNotAvailableException.class, () -> lib.borrowBook("999"));
      eq(2, lib.countAvailable());
    });
    r("R7", () -> {
      Library lib = sample();
      try { lib.borrowBook("999"); throw new Error("очікувався BookNotAvailableException"); }
      catch (BookNotAvailableException e) {
        if (e.getMessage() == null || !e.getMessage().contains("999")) throw new Error("повідомлення має містити isbn, отримано " + e.getMessage());
      }
      if (RuntimeException.class.isAssignableFrom(BookNotAvailableException.class)) throw new Error("виняток має бути перевірюваним (extends Exception)");
    });
    r("R8", () -> {
      Library lib = sample();
      lib.borrowBook("222");
      eq(2, lib.countAvailable());
      lib.returnBook("222");
      eq(3, lib.countAvailable());
      lib.borrowBook("222");
      eq(2, lib.countAvailable());
    });
    r("R9", () -> {
      Library lib = sample();
      thrown(IllegalStateException.class, () -> lib.returnBook("111"));
      thrown(IllegalArgumentException.class, () -> lib.returnBook("999"));
      eq(3, lib.countAvailable());
    });
  }
}`;

export const PROJECTS: readonly ProgramProject[] = [
  {
    id: "java-wordstat",
    lang: "java",
    lesson: "java/30",
    title: "Проєкт: статистика тексту",
    xp: 60,
    context:
      "Підрахунок слів і частот — повсякденна задача: від пошуку й аналітики відгуків до перевірки текстів у редакторах. На ній добре відпрацьовуються рядки, цикли та HashMap, які потрібні майже в кожній Java-програмі.",
    brief: [
      "Редакція онлайн-журналу просить невелику бібліотеку <code>TextStats</code>, яка аналізує статтю: скільки в ній слів, яке слово найдовше, які слова трапляються найчастіше, і чи є рядок паліндромом (для рубрики «Мовні дивини»).",
      "У заготовці вже є клас із методами-заглушками. Реалізуйте їх за вимогами R1–R9. Натискайте «Перевірити проєкт»: ми запустимо вашу програму, перевіримо кожну вимогу R1–R9 і покажемо, що виконано, а що ні.",
    ],
    contract: [
      "усе пишіть у класі <code>TextStats</code> зі <b>статичними</b> методами; клас <code>Main</code> не оголошуйте, перший рядок файлу — <code>import java.util.*;</code>;",
      "<b>слово</b> — послідовність літер (<code>Character.isLetter</code>); усе інше (пробіли, розділові знаки, цифри, дефіс, перенос рядка) є роздільником;",
      "<code>static int wordCount(String text)</code>, <code>static String longestWord(String text)</code>, <code>static Map&lt;String, Integer&gt; frequency(String text)</code>, <code>static List&lt;String&gt; topWords(String text, int n)</code>, <code>static boolean isPalindrome(String text)</code>;",
      "<code>null</code> вважайте порожнім текстом; методи повертають <code>0</code>, <code>\"\"</code>, порожню мапу чи порожній список, а не <code>null</code>.",
    ],
    requirements: [
      { id: "R1", text: "<code>wordCount</code> рахує слова, ігноруючи зайві пробіли й розділові знаки: <code>\"  Hello,   world! \"</code> дає 2, <code>\"Я люблю Java, а ти?\"</code> дає 5, <code>\"один-два\\nтри\"</code> дає 3.", hint: "Проходьте рядок символ за символом: коли зустріли літеру після не-літери — почалось нове слово. Або збирайте слово в StringBuilder." },
      { id: "R2", text: "<code>wordCount</code> для тексту без слів повертає 0: <code>\"\"</code>, <code>\"... !!! 123\"</code> і <code>null</code>. Цифри — роздільники: у <code>\"a1b\"</code> два слова.", hint: "Спершу перевірте text == null. Цифри — не літери, тому «123» словом не є." },
      { id: "R3", text: "<code>longestWord</code> повертає перше з найдовших слів в оригінальному регістрі: для <code>\"я люблю програмування, а ти?\"</code> це <code>\"програмування\"</code>; для <code>\"Cat, dog; Cat\"</code> — <code>\"Cat\"</code>; якщо слів немає — <code>\"\"</code>.", hint: "Замінюйте найкраще слово лише коли нове СТРОГО довше (>, а не >=), тоді за рівної довжини лишиться перше." },
      { id: "R4", text: "<code>frequency</code> рахує слова без урахування регістру й ключі — малими літерами: <code>\"Дім, дім, ДІМ! Ліс.\"</code> дає <code>{дім=3, ліс=1}</code>.", hint: "Перед додаванням у HashMap викличте toLowerCase(). Лічильник: map.put(w, map.getOrDefault(w, 0) + 1)." },
      { id: "R5", text: "<code>frequency</code> для тексту без слів повертає порожню мапу (не <code>null</code>): <code>\"\"</code> та <code>\"123 !!\"</code>.", hint: "Створіть new HashMap одразу на початку методу й повертайте її в будь-якому випадку." },
      { id: "R6", text: "<code>topWords(text, n)</code> повертає <code>n</code> найчастіших слів (малими літерами), за однакової частоти — за алфавітом: <code>topWords(\"b a b c a d\", 3)</code> дає <code>[a, b, c]</code>.", hint: "Візьміть ключі мапи frequency у список і впорядкуйте: перше слово ставте раніше, якщо його частота більша, або частота рівна і compareTo(...) &lt; 0." },
      { id: "R7", text: "Якщо <code>n</code> більше за кількість різних слів — повертаються всі слова (<code>topWords(\"y x y x\", 10)</code> дає <code>[x, y]</code>); для <code>n = 0</code> або тексту без слів — порожній список.", hint: "Копіюйте у результат не більше ніж Math.min(n, кількість слів) елементів." },
      { id: "R8", text: "<code>topWords</code> для від'ємного <code>n</code> кидає <code>IllegalArgumentException</code>; при цьому <code>topWords(\"a a b\", 1)</code> дає <code>[a]</code>.", hint: "На початку методу: if (n &lt; 0) throw new IllegalArgumentException(\"n не може бути від'ємним\");" },
      { id: "R9", text: "<code>isPalindrome</code> ігнорує регістр і все, крім літер та цифр: <code>\"А роза упала на лапу Азора\"</code>, <code>\"Was it a car or a cat I saw?\"</code> і <code>\"!!!\"</code> — паліндроми; <code>\"hello\"</code> і <code>\"ab\"</code> — ні.", hint: "Спершу зберіть у StringBuilder лише символи, для яких Character.isLetterOrDigit, переведені в нижній регістр; потім порівнюйте i-й символ з (довжина-1-i)-м." },
    ],
    starter: wordstatStarter,
    harness: wordstatHarness,
  },
  {
    id: "java-shapes",
    lang: "java",
    lesson: "java/40",
    title: "Проєкт: геометричні фігури",
    xp: 75,
    context:
      "Інтерфейси й поліморфізм — основа розширюваного коду: платіжні методи, формати експорту, типи сповіщень працюють за тією самою схемою «спільний інтерфейс, різні реалізації». Фігури — найпростіша модель, на якій цю ідею добре видно.",
    brief: [
      "Студія САПР просить маленьку модель фігур для креслення: коло, прямокутник і трикутник, кожна вміє рахувати площу та периметр і називати себе. Некоректні фігури (від'ємний радіус, трикутник, якого не існує) створювати заборонено.",
      "Ще потрібні службові методи для списку фігур: загальна площа, сортування за площею та пошук найбільшої. Реалізуйте заготовку за вимогами R1–R9: запустимо вашу програму й перевіримо кожну вимогу R1–R9.",
    ],
    contract: [
      "інтерфейс <code>Shape</code> (вже в заготовці): <code>double area()</code>, <code>double perimeter()</code>, <code>String name()</code>; не змінюйте його;",
      "класи <code>Circle(double radius)</code>, <code>Rectangle(double width, double height)</code>, <code>Triangle(double a, double b, double c)</code> реалізують <code>Shape</code>; <code>name()</code> повертає відповідно «Коло», «Прямокутник», «Трикутник»;",
      "некоректні параметри конструктора — <code>IllegalArgumentException</code>; числа порівнюються з точністю 1e-6;",
      "клас <code>ShapeUtils</code> зі статичними методами <code>double totalArea(List&lt;Shape&gt;)</code>, <code>void sortByArea(List&lt;Shape&gt;)</code> (сортує список на місці за зростанням площі), <code>Shape largest(List&lt;Shape&gt;)</code>;",
      "клас <code>Main</code> не оголошуйте, перший рядок файлу — <code>import java.util.*;</code>.",
    ],
    requirements: [
      { id: "R1", text: "<code>Circle</code>: для радіуса 2 площа і периметр дорівнюють <code>π·4</code> (≈ 12.566), тобто <code>πr²</code> та <code>2πr</code>.", hint: "Використовуйте Math.PI. Збережіть радіус у полі конструктором: this.radius = radius." },
      { id: "R2", text: "<code>Rectangle(3, 4)</code>: площа 12, периметр 14.", hint: "Площа = width * height, периметр = 2 * (width + height)." },
      { id: "R3", text: "<code>Triangle</code>: для сторін 3, 4, 5 площа 6 і периметр 12; для рівностороннього зі стороною 2 площа √3.", hint: "Формула Герона: p = (a+b+c)/2, площа = Math.sqrt(p*(p-a)*(p-b)*(p-c))." },
      { id: "R4", text: "<code>name()</code> повертає «Коло», «Прямокутник» і «Трикутник» для відповідних класів.", hint: "Просто поверніть рядковий літерал у кожному класі." },
      { id: "R5", text: "<code>new Circle(0)</code>, <code>new Circle(-1)</code>, <code>new Rectangle(-1, 2)</code>, <code>new Rectangle(2, 0)</code> кидають <code>IllegalArgumentException</code>; коректний <code>Rectangle(2, 1)</code> створюється й має площу 2.", hint: "На початку конструктора: if (radius &lt;= 0) throw new IllegalArgumentException(\"...\");" },
      { id: "R6", text: "<code>Triangle</code> кидає <code>IllegalArgumentException</code>, якщо сторона не додатна або кожна сторона не менша за суму двох інших: <code>(1,2,3)</code>, <code>(1,1,5)</code>, <code>(0,4,5)</code>, <code>(3,-4,5)</code>. Трикутник <code>(5,5,6)</code> коректний.", hint: "Умова існування трикутника: a &lt; b + c, b &lt; a + c, c &lt; a + b (строго; (1,2,3) вироджений)." },
      { id: "R7", text: "<code>ShapeUtils.totalArea</code> повертає суму площ: для порожнього списку 0, для <code>Rectangle(2,3)</code>, <code>Rectangle(1,1)</code>, <code>Triangle(3,4,5)</code> — 13.", hint: "Цикл for (Shape s : shapes) sum += s.area(); — працює для будь-якої фігури завдяки поліморфізму." },
      { id: "R8", text: "<code>ShapeUtils.sortByArea</code> сортує той самий список за зростанням площі: для <code>Rectangle(5,5)</code>, <code>Triangle(3,4,5)</code>, <code>Rectangle(1,2)</code>, <code>Circle(2)</code> площі йдуть 2, 6, ≈12.57, 25.", hint: "Бульбашка: два вкладені цикли, якщо list.get(j).area() &gt; list.get(j+1).area() — поміняйте місцями через list.set(...)." },
      { id: "R9", text: "<code>ShapeUtils.largest</code> повертає фігуру з найбільшою площею (саме той об'єкт зі списку), а для порожнього списку — <code>null</code>; список не змінюється.", hint: "Почніть з null; для кожної фігури, якщо best == null або s.area() > best.area(), запам'ятайте її." },
    ],
    starter: shapesStarter,
    harness: shapesHarness,
  },
  {
    id: "java-library",
    lang: "java",
    lesson: "java/54",
    title: "Проєкт: бібліотека",
    xp: 90,
    context:
      "Облік об'єктів зі станом (книги, товари, квитки) і власні винятки для бізнес-помилок — типова робота бекенд-розробника. Тут ви вчитесь розподіляти відповідальність між класами та відрізняти очікувані збої від помилок у виклику.",
    brief: [
      "Шкільна бібліотека хоче програму обліку: книги додаються до фонду, їх можна шукати за автором, видавати читачам і приймати назад. Спроба видати книгу, якої немає на полиці, — звичайна ситуація, на яку код має реагувати власним винятком.",
      "Реалізуйте класи <code>Book</code>, <code>Library</code> та виняток <code>BookNotAvailableException</code> за вимогами R1–R9. Ми запустимо вашу програму, виконаємо сценарії видачі й повернення та перевіримо кожну вимогу R1–R9.",
    ],
    contract: [
      "<code>class BookNotAvailableException extends Exception</code> — перевірюваний виняток з конструктором <code>(String message)</code>; він вже є в заготовці;",
      "<code>Book(String isbn, String title, String author)</code>, методи <code>getIsbn()</code>, <code>getTitle()</code>, <code>getAuthor()</code>, <code>boolean isAvailable()</code>;",
      "<code>Library</code> (конструктор без параметрів): <code>void addBook(Book)</code>, <code>int size()</code>, <code>int countAvailable()</code>, <code>List&lt;Book&gt; findByAuthor(String)</code>, <code>List&lt;Book&gt; listAvailable()</code>, <code>void borrowBook(String isbn) throws BookNotAvailableException</code>, <code>void returnBook(String isbn)</code>;",
      "книги ідентифікуються за <code>isbn</code>; списки повертаються в порядку додавання книг; клас <code>Main</code> не оголошуйте, перший рядок файлу — <code>import java.util.*;</code>.",
    ],
    requirements: [
      { id: "R1", text: "<code>Book</code> зберігає <code>isbn</code>, <code>title</code>, <code>author</code>, а щойно створена книга доступна (<code>isAvailable()</code> дає <code>true</code>).", hint: "Збережіть три параметри у полях, додайте поле boolean available = true. Не забудьте і про конструктор винятку: super(message)." },
      { id: "R2", text: "Після <code>addBook</code> трьох книг <code>size()</code> дорівнює 3 і <code>countAvailable()</code> теж 3; у новій бібліотеці <code>size()</code> дорівнює 0.", hint: "Тримайте книги в ArrayList&lt;Book&gt;, що створюється в оголошенні поля. countAvailable — цикл із лічильником для книг, у яких isAvailable()." },
      { id: "R3", text: "<code>addBook</code> кидає <code>IllegalArgumentException</code> для <code>null</code> та для книги з уже наявним <code>isbn</code>; фонд при цьому не змінюється.", hint: "Перед додаванням пройдіться по списку й порівняйте isbn через equals. Для пошуку за isbn зручно написати приватний метод find(String isbn), що повертає Book або null." },
      { id: "R4", text: "<code>findByAuthor</code> шукає автора без урахування регістру й повертає книги в порядку додавання: для «тарас шевченко» — «Кобзар», «Гайдамаки»; для невідомого автора — порожній список.", hint: "Порівнюйте через equalsIgnoreCase. Створіть новий ArrayList і додавайте в нього знайдені книги." },
      { id: "R5", text: "Після <code>borrowBook(\"111\")</code> книга недоступна: <code>countAvailable()</code> зменшується на 1, <code>size()</code> лишається, а <code>listAvailable()</code> повертає тільки книги на полиці в порядку додавання.", hint: "Додайте в Book метод, що змінює available (наприклад, setAvailable(boolean)), і викликайте його з Library." },
      { id: "R6", text: "<code>borrowBook</code> кидає <code>BookNotAvailableException</code>, якщо книгу вже видано або isbn невідомий; кількість доступних книг при цьому не змінюється.", hint: "Знайдіть книгу; якщо null або !isAvailable() — throw new BookNotAvailableException(...). Сигнатура методу вже містить throws." },
      { id: "R7", text: "Повідомлення <code>BookNotAvailableException</code> містить isbn, а сам виняток перевірюваний (не <code>RuntimeException</code>).", hint: "Складіть повідомлення з isbn: \"Книга недоступна: \" + isbn. Клас має успадковувати Exception, а не RuntimeException." },
      { id: "R8", text: "<code>returnBook</code> повертає видану книгу на полицю: після видачі й повернення <code>countAvailable()</code> знову 3, і книгу можна видати повторно.", hint: "Знайдіть книгу за isbn і поставте available = true через метод Book." },
      { id: "R9", text: "<code>returnBook</code> кидає <code>IllegalStateException</code>, якщо книга не була видана, і <code>IllegalArgumentException</code>, якщо isbn невідомий.", hint: "Спершу перевірте, що книга знайдена (інакше IllegalArgumentException), потім що вона зараз видана (інакше IllegalStateException)." },
    ],
    starter: libraryStarter,
    harness: libraryHarness,
  },
];
