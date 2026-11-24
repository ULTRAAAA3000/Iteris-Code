export const LESSONS_05 = [
  {
    t: "Інтерфейси",
    ch: "Інтерфейси та generics",
    easy: String.raw`Інтерфейс — це розетка стандартної форми: усе, що має відповідну вилку, можна підключити, і розетці байдуже, чи це лампа, чайник чи зарядка. Вона описує, що можна робити, але не як саме.`,
    p: [
      String.raw`Інтерфейс описує контракт: набір методів, які мусить мати клас, без вказівки реалізації. Приклад: <code>interface Shape { double area(); String name(); }</code>. Методи інтерфейсу за замовчуванням публічні й абстрактні, тому слова <code>public</code> та <code>abstract</code> не пишуть. Інтерфейс не можна створити через <code>new</code>, але змінну типу інтерфейсу можна оголосити й присвоїти їй об'єкт будь-якого класу, що його реалізує.`,
      String.raw`Клас реалізує інтерфейс словом <code>implements</code>: <code>class Circle implements Shape { ... }</code>. Він зобов'язаний реалізувати всі абстрактні методи (інакше сам має бути абстрактним), а реалізації роблять <code>public</code>, бо перевизначений метод не може звужувати доступ. Позначка <code>@Override</code> захищає від помилок в імені чи параметрах методу й не дає непомітно створити зовсім інший метод.`,
      String.raw`Клас може реалізувати кілька інтерфейсів, перелічуючи їх через кому: <code>class Duck implements Flyer, Swimmer</code>, хоча успадковувати може лише один клас. Так Java обходить проблему множинного наслідування стану: поведінку можна поєднувати, а поля й конструктори батька беруться лише від одного класу. Інтерфейси також можуть наслідувати інші інтерфейси через <code>extends</code>, причому навіть кілька одразу.`,
      String.raw`Головна сила — поліморфізм через контракт: код працює зі змінною типу <code>List&lt;Shape&gt;</code> і не знає, які саме фігури всередині. Можна додати новий клас (трикутник), і жоден рядок коду, що рахує площі, не зміниться. Це принцип «програмуйте до інтерфейсу, а не до реалізації»: у сигнатурах методів пишуть <code>List</code>, а не <code>ArrayList</code>, щоб викликач міг передати будь-яку реалізацію.`,
      String.raw`Інтерфейс не може мати полів стану, лише константи: поле в інтерфейсі неявно <code>public static final</code>. Тому інтерфейси описують поведінку, а не дані. Порівняйте з абстрактним класом: той може мати поля, конструктори й частковий код, але клас успадковує лише один такий батьківський клас. Вибір простий: потрібен спільний стан чи код — абстрактний клас; потрібен лише контракт або кілька ролей — інтерфейс.`,
      String.raw`Інтерфейси забезпечують слабкий зв'язок між частинами програми. Клас, що викликає <code>PaymentService</code>, не залежить від того, чи платіж іде карткою, чи банківським переказом, а в тестах підставляють заглушку. На цьому будується підміна залежностей, яку ми побачимо в главі про архітектуру. Стандартні колекції теж є інтерфейсами: <code>List</code>, <code>Map</code>, <code>Set</code>, <code>Queue</code> мають різні реалізації.`,
      String.raw`Інтерфейси називають іменниками чи прикметниками (<code>Shape</code>, <code>Comparable</code>, <code>Runnable</code>) без префікса <code>I</code>. Інтерфейси з одним методом із Java 8 стали основою лямбда-виразів. Не створюйте інтерфейс для кожного класу «про всяк випадок»: він доречний, коли справді є або передбачається кілька реалізацій чи коли потрібно відокремити споживача від деталей.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Shape[] shapes = {new Circle(2), new Rect(3, 4)};
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

    Circle(double r) {
        this.r = r;
    }

    @Override
    public double area() {
        return Math.PI * r * r;
    }

    @Override
    public String name() {
        return "Circle";
    }
}

class Rect implements Shape {
    private final double w;
    private final double h;

    Rect(double w, double h) {
        this.w = w;
        this.h = h;
    }

    @Override
    public double area() {
        return w * h;
    }

    @Override
    public String name() {
        return "Rectangle";
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Duck duck = new Duck();
        Flyer f = duck;          // один об'єкт, дві ролі
        Swimmer s = duck;
        System.out.println(f.fly());
        System.out.println(s.swim());
    }
}

interface Flyer {
    String fly();
}

interface Swimmer {
    String swim();
}

class Duck implements Flyer, Swimmer {
    @Override
    public String fly() {
        return "duck flies";
    }

    @Override
    public String swim() {
        return "duck swims";
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static double total(List<? extends Priced> items) {
        double sum = 0;
        for (Priced p : items) {
            sum += p.price();
        }
        return sum;
    }

    public static void main(String[] args) {
        List<Priced> cart = new ArrayList<>();   // у сигнатурі інтерфейс, у new реалізація
        cart.add(new Book(12.5));
        cart.add(new Pen(1.5));
        System.out.println(total(cart));
        System.out.println(Priced.CURRENCY);
    }
}

interface Priced {
    String CURRENCY = "UAH";        // поле інтерфейсу: public static final
    double price();
}

class Book implements Priced {
    private final double price;

    Book(double price) {
        this.price = price;
    }

    @Override
    public double price() {
        return price;
    }
}

class Pen implements Priced {
    private final double price;

    Pen(double price) {
        this.price = price;
    }

    @Override
    public double price() {
        return price;
    }
}`,
      String.raw`// не компілюється: клас Circle не реалізував метод name() інтерфейсу Shape
public class Main {
    public static void main(String[] args) {
        Shape s = new Circle();
        System.out.println(s.area());
    }
}

interface Shape {
    double area();
    String name();
}

class Circle implements Shape {
    @Override
    public double area() {
        return 3.14;
    }
}`,
      String.raw`// не компілюється: реалізація методу інтерфейсу має бути public, а тут доступ звужено
public class Main {
    public static void main(String[] args) {
        Shape s = new Circle();
        System.out.println(s.area());
    }
}

interface Shape {
    double area();
}

class Circle implements Shape {
    double area() {
        return 3.14;
    }
}`,
    ],
    note: String.raw`Клас реалізує інтерфейс через <code>implements</code> і мусить зробити всі його методи <code>public</code>. Змінна типу інтерфейсу може тримати об'єкт будь-якого реалізатора, тому в сигнатурах використовують <code>List</code>, а не <code>ArrayList</code>.`,
    work: String.raw`Інтерфейси — основа гнучкої архітектури: сервіси, репозиторії, обробники подій і клієнти зовнішніх систем описують інтерфейсами, а реалізації змінюють без правок у решті коду. У тестах справжні залежності замінюють заглушками, що реалізують той самий інтерфейс. Без цього великі проєкти важко підтримувати.`,
    tasks: [
      String.raw`Чим інтерфейс відрізняється від абстрактного класу і коли варто вибрати який?`,
      String.raw`Чому реалізацію методу інтерфейсу в класі доводиться робити <code>public</code>?`,
    ],
  },
  {
    t: "default- і static-методи інтерфейсів",
    ch: "Інтерфейси та generics",
    easy: String.raw`default-метод — це запасний варіант у меню: якщо заклад (клас) не приготував страву по-своєму, подають стандартну версію з кухні інтерфейсу. Нові страви можна додавати, не розсилаючи нових меню всім закладам.`,
    p: [
      String.raw`До Java 8 інтерфейс міг містити лише абстрактні методи, і додавання нового ламало всі наявні реалізації. Метод <code>default</code> має тіло: <code>interface Greeter { String name(); default String greet() { return "Hello, " + name(); } }</code>. Класи, що реалізують інтерфейс, отримують такий метод автоматично й можуть його перевизначити, якщо потрібна інша поведінка.`,
      String.raw`Це дозволило розвивати бібліотеку без поламок: методи <code>forEach</code>, <code>removeIf</code> і <code>sort</code> у <code>Collection</code> та <code>List</code> з'явилися саме як default-методи, і всі старі реалізації списків одразу їх отримали. Default-метод може викликати абстрактні методи свого інтерфейсу, як <code>greet()</code> викликає <code>name()</code>: така схема нагадує «шаблонний метод».`,
      String.raw`Конфлікт: якщо клас реалізує два інтерфейси з однаковим default-методом, компілятор вимагає від класу явного рішення. У класі перевизначають метод і за потреби викликають потрібну версію так: <code>A.super.hello()</code>. Також клас завжди виграє: якщо метод оголошено в самому класі чи його батькові, він має пріоритет над default-методом інтерфейсу.`,
      String.raw`Статичні методи інтерфейсу — це <code>static</code> із тілом: <code>static Shape unit() { ... }</code>. Їх викликають через ім'я інтерфейсу (<code>Shape.unit()</code>), і вони не успадковуються класами. Це зручне місце для фабричних методів і допоміжних функцій, що логічно належать контракту. Приклади з бібліотеки: <code>List.of</code>, <code>Comparator.naturalOrder</code>, <code>Map.entry</code>.`,
      String.raw`Приватні методи інтерфейсу (Java 9) — це <code>private</code> із тілом: вони дозволяють винести спільний код кількох default-методів і не показувати його іншим. Реалізатори їх не бачать, і вони не є частиною контракту. Так інтерфейс не змушує дублювати код у кількох default-методах, а публічний контракт лишається компактним.`,
      String.raw`Default-методи не замінюють абстрактні класи: вони не можуть зберігати стан (у інтерфейсі немає полів екземпляра) і не мають доступу до приватних полів реалізатора. Їхнє призначення — розумна поведінка за замовчуванням, виражена через інші методи контракту. Якщо логіка потребує полів, їй місце в класі, а не в інтерфейсі.`,
      String.raw`Правило стриманості: додавайте default-метод лише коли існує добра поведінка за замовчуванням, що працює для всіх реалізацій. Не перетворюйте інтерфейс на склад коду: тоді втрачається ясність контракту. Коли ж інтерфейс публічний і широко використовується, додавати до нього абстрактний метод не можна, а default-метод залишається безпечним способом розширення. Саме так розвивають і власні бібліотеки: новий метод з'являється з розумною поведінкою, старі реалізації продовжують працювати, а нові класи за потреби перевизначають його. Перед додаванням default-методу поставте собі питання, чи справді потрібна така поведінка всім реалізаціям.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Greeter g = new Person("Ira");
        System.out.println(g.greet());
    }
}

interface Greeter {
    String name();

    default String greet() {
        return "Hello, " + name();
    }
}

class Person implements Greeter {
    private final String name;

    Person(String name) {
        this.name = name;
    }

    @Override
    public String name() {
        return name;
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Greeter a = () -> "Ira";                   // лямбда: інтерфейс має один абстрактний метод
        Greeter b = new Formal();
        System.out.println(a.greet());
        System.out.println(b.greet());
    }
}

interface Greeter {
    String name();

    default String greet() {
        return "Hello, " + name();
    }
}

class Formal implements Greeter {
    @Override
    public String name() {
        return "Mr. Taras";
    }

    @Override
    public String greet() {                        // перевизначили default
        return "Good day, " + name();
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println(new C().hello());
    }
}

interface A {
    default String hello() {
        return "A";
    }
}

interface B {
    default String hello() {
        return "B";
    }
}

class C implements A, B {
    @Override
    public String hello() {
        return A.super.hello() + B.super.hello();    // явне рішення конфлікту
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Validator v = Validator.notEmpty();
        System.out.println(v.check("") + " " + v.check("x"));
        System.out.println(v.describe());
    }
}

interface Validator {
    boolean check(String s);

    static Validator notEmpty() {                  // статичний фабричний метод
        return s -> !s.isEmpty();
    }

    default String describe() {
        return prefix() + "validator";
    }

    private String prefix() {                      // приватний допоміжний метод
        return "simple ";
    }
}`,
      String.raw`// не компілюється: два інтерфейси дають однаковий default-метод, а клас не розв'язав конфлікт
public class Main {
    public static void main(String[] args) {
        System.out.println(new C().hello());
    }
}

interface A {
    default String hello() {
        return "A";
    }
}

interface B {
    default String hello() {
        return "B";
    }
}

class C implements A, B {
}`,
    ],
    note: String.raw`Клас завжди виграє в конфлікті: метод у самому класі чи його батькові має пріоритет над <code>default</code>. Якщо два інтерфейси дають однаковий <code>default</code>, клас мусить перевизначити його сам, за потреби викликавши <code>A.super.hello()</code>.`,
    work: String.raw`Default-методи дозволяють бібліотекам розвиватися без поламки старого коду: саме так у Collection з'явилися forEach і removeIf. У власних проєктах їх використовують помірно, для стандартної поведінки контракту, а фабричні методи на кшталт <code>Validator.notEmpty()</code> розміщують прямо в інтерфейсі.`,
    tasks: [
      String.raw`Чому default-методи були потрібні Java 8 для колекцій?`,
      String.raw`Що робити, якщо клас реалізує два інтерфейси з однаковим default-методом?`,
    ],
  },
  {
    t: "Стандартні інтерфейси: Iterable і AutoCloseable",
    ch: "Інтерфейси та generics",
    easy: String.raw`Iterable — це обіцянка «мене можна обійти по черзі», а AutoCloseable — «після мене треба зачинити двері». Знаючи ці два слова, Java дозволяє вашим класам працювати в for-each і в try-with-resources.`,
    p: [
      String.raw`Стандартні інтерфейси Java — це спільна мова бібліотек. Реалізувавши їх, ваш клас стає «своїм» для всього екосистемного коду: <code>Comparable</code> задає порядок, <code>Iterable</code> дає обхід, <code>AutoCloseable</code> звільняє ресурси, <code>Runnable</code> і <code>Callable</code> описують задачі, <code>CharSequence</code> — послідовність символів. Далі ми розглянемо перші три з цього переліку та <code>CharSequence</code>.`,
      String.raw`Інтерфейс <code>Iterable&lt;T&gt;</code> має єдиний метод <code>Iterator&lt;T&gt; iterator()</code>. Клас, що його реалізує, можна використати у for-each: <code>for (Integer x : range)</code>. Ітератор має методи <code>hasNext()</code> і <code>next()</code> (метод <code>remove()</code> за замовчуванням не підтримується). Так будь-яку структуру даних — діапазон, дерево, сторінки відповіді сервера — можна обійти єдиним циклом, не розкриваючи її будову.`,
      String.raw`Щоб написати ітератор, потрібно зберігати поточну позицію між викликами <code>next()</code>. Типово ітератор — окремий клас (часто внутрішній) із полем-покажчиком. Він повертає наступний елемент і зсуває позицію; коли елементів не лишилось, <code>hasNext()</code> дає <code>false</code>, а виклик <code>next()</code> має кинути <code>NoSuchElementException</code>. Ця дисципліна гарантує, що цикл for-each працює правильно.`,
      String.raw`Інтерфейс <code>AutoCloseable</code> має метод <code>void close()</code>. Клас, що тримає ресурс (файл, з'єднання, потік), реалізує його, а викликач користується конструкцією try-with-resources: <code>try (Resource r = new Resource()) { ... }</code>. Метод <code>close()</code> викликається автоматично, навіть якщо в тілі виникне виняток. Докладно про цю конструкцію поговоримо в главі про помилки; тут важливо знати сам контракт.`,
      String.raw`Інтерфейс <code>Closeable</code> із пакета <code>java.io</code> є спеціалізацією <code>AutoCloseable</code> для введення-виведення: його метод може кидати <code>IOException</code>. У власних класах зазвичай достатньо <code>AutoCloseable</code>, а метод <code>close()</code> бажано робити ідемпотентним: повторний виклик не має ламати програму чи повторно звільняти один ресурс.`,
      String.raw`<code>CharSequence</code> реалізують <code>String</code>, <code>StringBuilder</code> і <code>StringBuffer</code>: інтерфейс описує <code>length()</code>, <code>charAt(i)</code> та <code>subSequence</code>. Метод, що приймає <code>CharSequence</code>, працює з будь-яким із цих типів без зайвих перетворень. Це приклад того, як інтерфейс дозволяє написати один метод для багатьох типів і не копіювати код.`,
      String.raw`Висновок: реалізуйте стандартні інтерфейси, коли це має сенс, замість винаходу власних: тоді ваш тип сумісний із циклами, колекціями, потоками й конструкціями мови. Власні інтерфейси створюйте для нових понять предметної області, а для загальних понять спершу пошукайте готовий у JDK. Це заощаджує час і робить код зрозумілим для будь-якого Java-розробника. Перед написанням власного інтерфейсу варто переглянути пакети java.util, java.util.function та java.io: часто потрібна абстракція там уже є, і її знають усі, хто читатиме ваш код у майбутньому.`,
    ],
    code: [
      String.raw`import java.util.Iterator;
import java.util.NoSuchElementException;

public class Main {
    public static void main(String[] args) {
        Range r = new Range(0, 10, 3);
        for (int x : r) {
            System.out.print(x + " ");
        }
        System.out.println();
    }
}

class Range implements Iterable<Integer> {
    private final int from;
    private final int to;
    private final int step;

    Range(int from, int to, int step) {
        this.from = from;
        this.to = to;
        this.step = step;
    }

    @Override
    public Iterator<Integer> iterator() {
        return new RangeIterator();
    }

    private class RangeIterator implements Iterator<Integer> {
        private int current = from;

        @Override
        public boolean hasNext() {
            return current < to;
        }

        @Override
        public Integer next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            int value = current;
            current += step;
            return value;
        }
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        try (Resource r = new Resource("db")) {
            System.out.println("using " + r.name());
        }
        System.out.println("done");
    }
}

class Resource implements AutoCloseable {
    private final String name;

    Resource(String name) {
        this.name = name;
        System.out.println("open " + name);
    }

    String name() {
        return name;
    }

    @Override
    public void close() {
        System.out.println("close " + name);
    }
}`,
      String.raw`public class Main {
    static int countVowels(CharSequence text) {
        int count = 0;
        for (int i = 0; i < text.length(); i++) {
            if ("aeiou".indexOf(text.charAt(i)) >= 0) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countVowels("education"));
        System.out.println(countVowels(new StringBuilder("iterator")));
    }
}`,
      String.raw`// не компілюється: клас Bag не реалізує Iterable, тому for-each до нього не застосовний
public class Main {
    public static void main(String[] args) {
        Bag bag = new Bag();
        for (String s : bag) {
            System.out.println(s);
        }
    }
}

class Bag {
}`,
      String.raw`// аварія: у ітератора немає другого елемента, next() кидає NoSuchElementException
import java.util.Iterator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Iterator<String> it = List.of("only").iterator();
        System.out.println(it.next());
        System.out.println(it.hasNext());
        System.out.println(it.next());
    }
}`,
    ],
    note: String.raw`Реалізація <code>Iterable</code> дозволяє використовувати клас у for-each, а <code>AutoCloseable</code> — у try-with-resources. Ітератор, у якого немає наступного елемента, має кидати <code>NoSuchElementException</code> із <code>next()</code>.`,
    work: String.raw`Реалізація стандартних інтерфейсів робить власні типи сумісними з усім JDK: колекції приймають Iterable, а ресурси звільняє try-with-resources. У проєктах без цієї дисципліни ресурси витікають, а код обходу дублюється в кожному місці, де потрібно пройти по власній структурі.`,
    tasks: [
      String.raw`Що потрібно зробити, щоб власний клас можна було використати в циклі for-each?`,
      String.raw`Чому метод <code>close()</code> бажано робити так, щоб повторний виклик нічого не ламав?`,
    ],
  },
  {
    t: "sealed-типи й switch з образцами",
    ch: "Інтерфейси та generics",
    easy: String.raw`Sealed-інтерфейс — закрита родина: у ній перелічено всіх можливих «родичів», і компілятор знає, що інших не буде. Тому switch із образцами може перевірити, що ви розглянули кожного, і не дасть забути жодного.`,
    p: [
      String.raw`Switch з образцями (Java 21) дозволяє перевіряти тип значення в гілках: <code>case Circle c -&gt; ...</code>. На відміну від ланцюжка <code>if (s instanceof Circle)</code>, switch читається як таблиця, дає змінну потрібного типу в кожній гілці й може бути виразом. Образець <code>Circle c</code> перевіряє тип і одразу оголошує змінну <code>c</code> типу <code>Circle</code>, яку можна використати в гілці.`,
      String.raw`Умову додають словом <code>when</code>: <code>case Circle c when c.r() &gt; 10 -&gt; "big circle";</code>. Порядок гілок важливий: компілятор не пропустить гілку, яка ніколи не виконається через попередню загальнішу. Гілка <code>default</code> ловить решту. Значення <code>null</code> у switch за замовчуванням кидає <code>NullPointerException</code>, але його можна обробити окремою гілкою <code>case null</code>.`,
      String.raw`Запечатані (sealed) типи: <code>sealed interface Shape permits Circle, Rect { }</code> обмежує перелік дозволених підтипів. Підтипи мають бути <code>final</code> (або <code>record</code>, який неявно фінальний), <code>sealed</code> чи <code>non-sealed</code>. Закритість ієрархії — це контракт: компілятор знає всіх нащадків, а отже, може перевірити, що жодного не пропущено.`,
      String.raw`Головна вигода: switch за sealed-типом без <code>default</code> компілятор перевіряє на повноту. Якщо додати новий підтип (<code>Triangle</code>), усі switch, що його не обробляють, перестануть компілюватися, замість того щоб мовчки пропустити новий випадок. Це перетворює помилки «забув обробити» з помилок виконання на помилки компіляції, а такі помилки найдешевші.`,
      String.raw`Поєднання з record дає алгебраїчні типи даних: <code>sealed interface Expr permits Num, Add { }</code>, <code>record Num(int v) implements Expr { }</code>, <code>record Add(Expr l, Expr r) implements Expr { }</code>. Функція обчислення — це один switch, що розбирає вираз рекурсивно. Такий стиль зручний для розбору мов, подій, команд і моделювання станів, і саме на ньому тримається сучасна Java.`,
      String.raw`Образці записів (Java 21): <code>case Add(Expr l, Expr r) -&gt; eval(l) + eval(r)</code> розбирає record на компоненти прямо в гілці, без викликів методів доступу. Образці можна вкладати: <code>case Add(Num(var a), Num(var b))</code>. Це робить обробку структур даних короткою й виразною, хоча надмірно глибокі образці варто виносити в окремі методи для читабельності.`,
      String.raw`Коли використовувати: для обмеженого набору варіантів (фігури, події, результат операції «успіх або помилка»). Для відкритих ієрархій, які розширюють інші модулі, лишаються звичайні інтерфейси й поліморфізм. Не плутайте: <code>instanceof</code> з образцем (Java 16) і switch з образцями (Java 21) — різні можливості, перша простіша й часто достатня.`,
    ],
    code: [
      String.raw`public class Main {
    static String kind(Object o) {
        return switch (o) {
            case Integer i -> "int " + i;
            case String s -> "string of " + s.length();
            case null -> "null";
            default -> "other";
        };
    }

    public static void main(String[] args) {
        System.out.println(kind(5));
        System.out.println(kind("abc"));
        System.out.println(kind(null));
        System.out.println(kind(2.5));
    }
}`,
      String.raw`public class Main {
    static double area(Shape s) {
        return switch (s) {                       // default не потрібен: Shape запечатаний
            case Circle c -> Math.PI * c.r() * c.r();
            case Rect r -> r.w() * r.h();
        };
    }

    public static void main(String[] args) {
        System.out.printf("%.2f%n", area(new Circle(1)));
        System.out.printf("%.2f%n", area(new Rect(2, 3)));
    }
}

sealed interface Shape permits Circle, Rect {
}

record Circle(double r) implements Shape {
}

record Rect(double w, double h) implements Shape {
}`,
      String.raw`public class Main {
    static String size(Shape s) {
        return switch (s) {
            case Circle c when c.r() > 10 -> "big circle";
            case Circle c -> "circle";
            case Rect r -> "rect";
        };
    }

    public static void main(String[] args) {
        System.out.println(size(new Circle(50)));
        System.out.println(size(new Circle(1)));
        System.out.println(size(new Rect(1, 1)));
    }
}

sealed interface Shape permits Circle, Rect {
}

record Circle(double r) implements Shape {
}

record Rect(double w, double h) implements Shape {
}`,
      String.raw`public class Main {
    static int eval(Expr e) {
        return switch (e) {
            case Num n -> n.v();
            case Add(Expr l, Expr r) -> eval(l) + eval(r);     // образець запису
            case Mul(Expr l, Expr r) -> eval(l) * eval(r);
        };
    }

    public static void main(String[] args) {
        Expr e = new Add(new Num(2), new Mul(new Num(3), new Num(4)));
        System.out.println(eval(e));      // 14
    }
}

sealed interface Expr permits Num, Add, Mul {
}

record Num(int v) implements Expr {
}

record Add(Expr l, Expr r) implements Expr {
}

record Mul(Expr l, Expr r) implements Expr {
}`,
      String.raw`// не компілюється: switch за запечатаним типом не охоплює підтип Rect
public class Main {
    static double area(Shape s) {
        return switch (s) {
            case Circle c -> Math.PI * c.r() * c.r();
        };
    }

    public static void main(String[] args) {
        System.out.println(area(new Circle(1)));
    }
}

sealed interface Shape permits Circle, Rect {
}

record Circle(double r) implements Shape {
}

record Rect(double w, double h) implements Shape {
}`,
    ],
    note: String.raw`Sealed-інтерфейс перелічує дозволених нащадків, тому switch із образцами за ним перевіряється на повноту без <code>default</code>: після додавання нового підтипу код, що його не обробляє, перестає компілюватися. Умову до гілки додає <code>when</code>.`,
    work: String.raw`Sealed-типи з record і switch з образцами — сучасний спосіб моделювати результати операцій, події, команди й стани (успіх чи помилка, оплата карткою чи переказом). Кожна нова гілка змушує оновити всі місця обробки, і це ловить цілий клас помилок ще на етапі компіляції.`,
    tasks: [
      String.raw`Чому switch за sealed-типом без default кращий за ланцюжок if/instanceof?`,
      String.raw`Що означає <code>when</code> у гілці switch і чому порядок гілок важливий?`,
    ],
  },
  {
    t: "Comparable і Comparator",
    ch: "Інтерфейси та generics",
    easy: String.raw`Comparable — це власна думка речі про те, де вона стоїть у черзі: «я молодший за тебе». Comparator — зовнішній суддя, який може впорядкувати ті самі речі за зростом, віком чи іменем, не питаючи в них дозволу.`,
    p: [
      String.raw`Інтерфейс <code>Comparable&lt;T&gt;</code> має єдиний метод <code>int compareTo(T other)</code>, що повертає від'ємне число, нуль або додатне, якщо поточний об'єкт менший, рівний чи більший за <code>other</code>. Це «природний порядок» типу: за ним працюють <code>Collections.sort</code>, <code>TreeSet</code>, <code>TreeMap</code> та <code>Arrays.sort</code>. Типи <code>Integer</code>, <code>String</code> і <code>LocalDate</code> уже його реалізують.`,
      String.raw`Для власного класу: <code>class Person implements Comparable&lt;Person&gt; { public int compareTo(Person o) { return Integer.compare(age, o.age); } }</code>. Для чисел користуються <code>Integer.compare</code> та <code>Double.compare</code>, а не відніманням: різниця <code>a - b</code> може переповнитися й дати неправильний знак. Для рядків є <code>compareTo</code> та <code>compareToIgnoreCase</code>.`,
      String.raw`Контракт: порядок має бути узгоджений із <code>equals</code> (бажано, щоб <code>compareTo</code> давав 0 тоді й лише тоді, коли <code>equals</code> дає true), антисиметричний і транзитивний. Інакше <code>TreeSet</code> вважатиме елементи дублікатами, а сортування може кинути <code>IllegalArgumentException</code> з повідомленням про порушення загального контракту методу порівняння.`,
      String.raw`<code>Comparator&lt;T&gt;</code> — окремий об'єкт із методом <code>int compare(T a, T b)</code>. Він дозволяє мати кілька порядків для одного типу й сортувати типи, що не реалізують Comparable. Його передають у <code>list.sort(cmp)</code>, <code>Collections.sort(list, cmp)</code>, <code>new TreeSet&lt;&gt;(cmp)</code>. Базова форма — лямбда: <code>(a, b) -&gt; Integer.compare(a.age, b.age)</code>.`,
      String.raw`Готові фабрики: <code>Comparator.comparing(Person::name)</code>, <code>comparingInt</code>, <code>comparingDouble</code>. Ланцюжок: <code>thenComparing(...)</code> для другого критерію, <code>reversed()</code> для зворотного порядку, а ще <code>Comparator.naturalOrder()</code>, <code>reverseOrder()</code>, <code>nullsFirst</code> та <code>nullsLast</code>. Запис <code>Person::name</code> — посилання на метод, докладно про нього в одному з наступних уроків.`,
      String.raw`Порядок за кількома полями: <code>Comparator.comparing(Person::city).thenComparing(Person::name)</code> спершу порівнює міста, а за рівності — імена. Саме такі ланцюжки замінюють довгі ручні <code>if</code> у компараторах і майже не лишають місця для помилок. Для зворотного порядку за одним полем користуйтеся <code>Comparator.comparing(...).reversed()</code>.`,
      String.raw`Не змінюйте поля, за якими впорядковано елементи в <code>TreeSet</code> чи <code>TreeMap</code>, після вставки: структура не помітить зміни, і пошук буде зламано. Сортування в <code>List.sort</code> стабільне: порядок рівних елементів зберігається, тому додатковий критерій потрібен лише тоді, коли хочете повністю передбачуваний результат. На практиці це означає: якщо два елементи можуть бути рівними за основним критерієм, додайте другий, наприклад ім'я чи ідентифікатор, і звіт щоразу виглядатиме однаково.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Person> people = new ArrayList<>(List.of(new Person("Ira", 30), new Person("Oleh", 25), new Person("Anna", 22)));
        Collections.sort(people);
        System.out.println(people);
    }
}

class Person implements Comparable<Person> {
    private final String name;
    private final int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public int compareTo(Person o) {
        return Integer.compare(age, o.age);
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Main {
    record Person(String name, String city, int age) { }

    public static void main(String[] args) {
        List<Person> people = new ArrayList<>(List.of(
            new Person("Ira", "Kyiv", 30), new Person("Oleh", "Lviv", 25),
            new Person("Anna", "Kyiv", 22), new Person("Taras", "Lviv", 30)));
        people.sort(Comparator.comparing(Person::city).thenComparing(Person::name));
        for (Person p : people) {
            System.out.println(p);
        }
    }
}`,
      String.raw`import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        TreeSet<String> words = new TreeSet<>(
            Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        words.addAll(List.of("pear", "fig", "banana", "kiwi", "apple"));
        System.out.println(words);
        TreeSet<Integer> desc = new TreeSet<>(Comparator.reverseOrder());
        desc.addAll(List.of(3, 1, 2));
        System.out.println(desc);
    }
}`,
      String.raw`// не компілюється: клас Plain не реалізує Comparable, тому Collections.sort не знає порядку
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Plain> items = new ArrayList<>();
        items.add(new Plain());
        Collections.sort(items);
    }
}

class Plain {
}`,
      String.raw`// аварія: елемент Object не реалізує Comparable, TreeSet кидає ClassCastException
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        TreeSet<Object> set = new TreeSet<>();
        set.add(new Object());
        System.out.println(set.size());
    }
}`,
    ],
    note: String.raw`Для чисел у <code>compareTo</code> і компараторах беріть <code>Integer.compare</code>, а не віднімання: різниця може переповнитися. Другий критерій додає <code>thenComparing</code>, а зворотний порядок — <code>reversed()</code>.`,
    work: String.raw`Сортування за кількома критеріями (спершу за статусом, потім за датою, потім за ім'ям) — щоденна задача для звітів і таблиць у застосунках. Ланцюжки <code>Comparator.comparing(...).thenComparing(...)</code> зустрічаються в кожному проєкті, а помилки з порядком майже завжди пов'язані з порушенням контракту compareTo.`,
    tasks: [
      String.raw`Чому в <code>compareTo</code> краще писати <code>Integer.compare(a, b)</code>, ніж <code>a - b</code>?`,
      String.raw`Як відсортувати людей спершу за містом, а за однакового міста — за віком за спаданням?`,
    ],
  },
  {
    t: "Функціональні інтерфейси й лямбди",
    ch: "Інтерфейси та generics",
    easy: String.raw`Лямбда — це записка з інструкцією: «візьми це й зроби так». Замість окремого класу ви просто передаєте шматок поведінки туди, де його потрібно виконати.`,
    p: [
      String.raw`Функціональний інтерфейс має рівно один абстрактний метод (анотація <code>@FunctionalInterface</code> перевіряє це на етапі компіляції). Приклади: <code>Runnable</code> із методом <code>run()</code>, <code>Comparator</code> із <code>compare</code>, <code>Callable</code> із <code>call</code>. Лямбда-вираз — це короткий запис реалізації такого інтерфейсу: <code>(a, b) -&gt; a + b</code>. Тип лямбди визначається цільовим типом: тим, куди її передають чи присвоюють.`,
      String.raw`Синтаксис: параметри в дужках, стрілка, тіло. Якщо параметр один, дужки необов'язкові: <code>x -&gt; x * 2</code>. Тіло з одного виразу пишуть без фігурних дужок і <code>return</code>, а багаторядкове беруть у блок із <code>return</code>. Типи параметрів зазвичай виводяться з контексту. Лямбда без параметрів виглядає так: <code>() -&gt; System.out.println("hi")</code>.`,
      String.raw`Стандартні функціональні інтерфейси з пакета <code>java.util.function</code>: <code>Function&lt;T, R&gt;</code> (<code>apply</code>: з T у R), <code>Predicate&lt;T&gt;</code> (<code>test</code>: з T у boolean), <code>Consumer&lt;T&gt;</code> (<code>accept</code>: приймає T, нічого не повертає), <code>Supplier&lt;T&gt;</code> (<code>get</code>: нічого на вході, T на виході), а також <code>BiFunction</code>, <code>UnaryOperator&lt;T&gt;</code> і <code>BinaryOperator&lt;T&gt;</code>. Для примітивів є варіанти <code>IntPredicate</code>, <code>IntFunction</code> та інші без упаковки.`,
      String.raw`Лямбда може використовувати змінні з оточення, але лише ефективно незмінні (effectively final): змінну не можна перепризначити після того, як лямбда її захопила. Спроба змінити захоплену локальну змінну — помилка компіляції. Обійти її можна масивом чи атомарним об'єктом, але це зазвичай ознака, що логіку варто переглянути. Поля об'єкта лямбда змінювати може.`,
      String.raw`Лямбди передають у методи колекцій: <code>list.removeIf(x -&gt; x &lt; 0)</code>, <code>list.forEach(System.out::println)</code>, <code>map.computeIfAbsent(k, key -&gt; new ArrayList&lt;&gt;())</code>, <code>list.sort((a, b) -&gt; ...)</code>. Вони ж лежать в основі Stream API, пулів потоків і обробників подій. Лямбда замінює анонімний клас, але коротша й не вимагає окремого опису класу.`,
      String.raw`Власні функціональні інтерфейси: <code>@FunctionalInterface interface Validator { boolean ok(String s); }</code>. Тоді метод <code>static boolean check(String s, Validator v)</code> можна викликати з лямбдою: <code>check("a@b", s -&gt; s.contains("@"))</code>. Так передають поведінку як параметр: стратегії, перевірки, обробники. Перш ніж створювати власний інтерфейс, перевірте, чи немає готового в <code>java.util.function</code>.`,
      String.raw`Лямбди краще тримати короткими: якщо тіло довше трьох-чотирьох рядків, його виносять у метод і викликають за посиланням. Пам'ятайте також про винятки: лямбда для <code>Function</code> не може кидати перевірені винятки без обгортання. І не використовуйте лямбди для прихованих побічних ефектів у потоках: код стає неочевидним і складно тестується.`,
    ],
    code: [
      String.raw`import java.util.function.Function;
import java.util.function.Predicate;

public class Main {
    public static void main(String[] args) {
        Predicate<String> isLong = s -> s.length() > 4;
        Function<String, Integer> len = s -> s.length();
        System.out.println(isLong.test("lambda") + " " + isLong.test("go"));
        System.out.println(len.apply("hello"));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println(check("a@b.com", s -> s.contains("@")));
        System.out.println(check("abc", s -> s.contains("@")));
        System.out.println(check("", s -> !s.isEmpty()));
    }

    static boolean check(String s, Validator v) {
        return v.ok(s);
    }
}

@FunctionalInterface
interface Validator {
    boolean ok(String s);
}`,
      String.raw`import java.util.function.BinaryOperator;
import java.util.function.Consumer;
import java.util.function.Supplier;

public class Main {
    public static void main(String[] args) {
        BinaryOperator<Integer> add = (a, b) -> a + b;
        Supplier<String> greeting = () -> "Hello";
        Consumer<String> printer = s -> System.out.println("> " + s);
        System.out.println(add.apply(2, 3));
        printer.accept(greeting.get());
    }
}`,
      String.raw`// не компілюється: змінну count змінюють після захоплення лямбдою, вона не ефективно незмінна
public class Main {
    public static void main(String[] args) {
        int count = 0;
        Runnable r = () -> count++;
        r.run();
        System.out.println(count);
    }
}`,
      String.raw`// не компілюється: інтерфейс має два абстрактні методи, тому лямбда до нього не застосовна
public class Main {
    public static void main(String[] args) {
        Two t = () -> System.out.println("x");
        t.a();
    }
}

interface Two {
    void a();
    void b();
}`,
    ],
    note: String.raw`Лямбда можлива лише там, де очікується функціональний інтерфейс з одним абстрактним методом. Змінні оточення в ній мають бути ефективно незмінними: перепризначити їх після захоплення не можна.`,
    work: String.raw`Лямбди передають поведінку як параметр: сортування, фільтрація, обробники подій, колбеки, відкладені обчислення. Майже кожен сучасний Java-код використовує їх разом із колекціями й Stream API, а правильний вибір стандартних інтерфейсів із java.util.function скорочує код і робить його зрозумілішим.`,
    tasks: [
      String.raw`Чому лямбда не може змінити локальну змінну, оголошену поза нею?`,
      String.raw`Який стандартний функціональний інтерфейс підійде для перевірки рядка на порожність, а який для перетворення рядка на його довжину?`,
    ],
  },
  {
    t: "Посилання на методи і композиція функцій",
    ch: "Інтерфейси та generics",
    adv: true,
    easy: String.raw`Посилання на метод — це ярлик на робочому столі: замість того щоб описувати дію знову, ви вказуєте на вже готову. Композиція функцій — конвеєр із двох ярликів: результат першої дії автоматично потрапляє в другу.`,
    p: [
      String.raw`Посилання на метод — короткий запис лямбди, яка лише викликає наявний метод. Запис <code>String::length</code> замінює <code>s -&gt; s.length()</code>, а <code>System.out::println</code> замінює <code>x -&gt; System.out.println(x)</code>. Вони роблять код коротшим і виразнішим, коли лямбда нічого, крім виклику, не робить, і допускають ті самі цільові типи, що й звичайні лямбди.`,
      String.raw`Чотири види посилань: на статичний метод (<code>Integer::parseInt</code>), на метод конкретного об'єкта (<code>System.out::println</code>, <code>list::add</code>), на метод довільного об'єкта певного типу (<code>String::toUpperCase</code>, де перший аргумент стає отримувачем) і на конструктор (<code>ArrayList::new</code>, <code>Person::new</code>). Компілятор підбирає потрібну форму за цільовим типом і кількістю параметрів.`,
      String.raw`Вибір між лямбдою та посиланням — питання читабельності. Якщо метод має зрозумілу назву, посилання читається як опис: <code>map(String::trim)</code>. Якщо потрібно додати параметри чи умову, лямбда прозоріша. Не перетворюйте все на посилання за будь-яку ціну: головне, щоб читач за секунду зрозумів намір, а не щоб рядок був якомога коротшим.`,
      String.raw`Композиція: <code>Function</code> має методи <code>andThen(g)</code> («спершу f, потім g») та <code>compose(g)</code> («спершу g, потім f»). Для <code>Function&lt;String, String&gt; trim = String::trim</code> і <code>Function&lt;String, Integer&gt; len = String::length</code> вираз <code>trim.andThen(len)</code> дає функцію «обрізати й порахувати». Так із дрібних функцій складають складніші без додаткових класів і без проміжних змінних.`,
      String.raw`<code>Predicate</code> теж компонується: <code>and</code>, <code>or</code>, <code>negate</code>, а статичний <code>Predicate.not(...)</code> (Java 11) заперечує посилання на метод: <code>filter(Predicate.not(String::isBlank))</code>. <code>Comparator</code> також комбінується: <code>thenComparing</code>, <code>reversed</code>. Це дозволяє будувати умови блоками й повторно використовувати їх у різних місцях програми.`,
      String.raw`Каррінг і часткове застосування: вбудованого синтаксису в Java немає, але функцію, що повертає функцію, можна записати так: <code>Function&lt;Integer, Function&lt;Integer, Integer&gt;&gt; add = a -&gt; b -&gt; a + b</code>. Це рідко потрібно в прикладному коді, але допомагає зрозуміти, як працюють стратегії й фабрики поведінки, у яких одна функція налаштовує іншу.`,
      String.raw`Типові помилки: неоднозначність посилання на перевантажений метод (компілятор не знає, яку версію вибрати); очікування, що посилання на метод екземпляра <code>obj::method</code> обчислить <code>obj</code> пізніше (воно обчислюється одразу при створенні посилання); спроба посилатися на метод, що кидає перевірений виняток, у функціональний інтерфейс без відповідного <code>throws</code>.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;

public class Main {
    public static void main(String[] args) {
        Function<String, Integer> parse = Integer::parseInt;       // статичний метод
        Function<String, String> upper = String::toUpperCase;      // метод довільного об'єкта
        Supplier<List<String>> maker = ArrayList::new;             // конструктор
        List<String> list = maker.get();
        list.add(upper.apply("java"));
        list.forEach(System.out::println);                         // метод конкретного об'єкта
        System.out.println(parse.apply("42") + 1);
    }
}`,
      String.raw`import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        Function<String, String> trim = String::trim;
        Function<String, Integer> len = String::length;
        Function<String, Integer> trimmedLength = trim.andThen(len);
        System.out.println(trimmedLength.apply("  hello  "));
        Function<Integer, Integer> plusOne = x -> x + 1;
        Function<Integer, Integer> twice = x -> x * 2;
        System.out.println(plusOne.andThen(twice).apply(5));   // (5 + 1) * 2 = 12
        System.out.println(plusOne.compose(twice).apply(5));   // 5 * 2 + 1 = 11
    }
}`,
      String.raw`import java.util.function.Predicate;

public class Main {
    public static void main(String[] args) {
        Predicate<String> notBlank = Predicate.not(String::isBlank);
        Predicate<String> shortWord = s -> s.length() < 5;
        Predicate<String> ok = notBlank.and(shortWord);
        System.out.println(ok.test("java"));
        System.out.println(ok.test("   "));
        System.out.println(ok.negate().test("language"));
    }
}`,
      String.raw`import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        Function<Integer, Function<Integer, Integer>> add = a -> b -> a + b;
        Function<Integer, Integer> addFive = add.apply(5);        // часткове застосування
        System.out.println(addFive.apply(10));
        System.out.println(add.apply(1).apply(2));
    }
}`,
      String.raw`// не компілюється: Integer::toString неоднозначне, бо існує і статична, і нестатична версія
import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        Function<Integer, String> f = Integer::toString;
        System.out.println(f.apply(5));
    }
}`,
    ],
    note: String.raw`<code>f.andThen(g)</code> виконує спершу <code>f</code>, потім <code>g</code>, а <code>f.compose(g)</code> навпаки. Посилання на метод зручне, коли лямбда лише викликає готовий метод; неоднозначні перевантаження на кшталт <code>Integer::toString</code> компілятор не розв'яже.`,
    work: String.raw`Композиція функцій і посилання на методи роблять код обробки даних декларативним: опис «що робити» замість циклів. Вони щодня зустрічаються в Stream API, Optional, Comparator і CompletableFuture. Уміння читати такі ланцюжки — обов'язкова навичка для роботи з сучасним Java-кодом.`,
    tasks: [
      String.raw`Перепишіть лямбди <code>s -&gt; s.trim()</code> і <code>() -&gt; new ArrayList&lt;&gt;()</code> через посилання на метод і конструктор.`,
      String.raw`Чим <code>f.andThen(g)</code> відрізняється від <code>f.compose(g)</code>?`,
    ],
  },
  {
    t: "Generics: класи й методи",
    ch: "Інтерфейси та generics",
    easy: String.raw`Generics — це типізована коробка з наліпкою: на ній написано, що саме лежить усередині, тому, дістаючи річ, ви не боїтеся, що замість яблука виявиться апельсин.`,
    p: [
      String.raw`Узагальнений (generic) клас має параметр типу в кутових дужках: <code>class Box&lt;T&gt; { private T value; T get() { return value; } void set(T v) { value = v; } }</code>. Тоді <code>Box&lt;String&gt;</code> зберігає лише рядки, а <code>Box&lt;Integer&gt;</code> лише числа. Компілятор перевіряє типи й підставляє приведення сам: не потрібно писати <code>(String) box.get()</code>, а помилки типів виявляються на етапі компіляції, а не як <code>ClassCastException</code> під час виконання.`,
      String.raw`Без generics колекції зберігали <code>Object</code>, і розробникові доводилося приводити тип вручну. Це давало помилки на кшталт додавання числа в «список рядків», що проявлялися лише під час роботи програми. Узагальнення прибрали цю проблему: <code>List&lt;String&gt;</code> не прийме число, а <code>get</code> одразу повертає <code>String</code>, і ніякого приведення писати не треба.`,
      String.raw`Імена параметрів типу — одна велика літера за традицією: <code>T</code> (type), <code>E</code> (element), <code>K</code> і <code>V</code> (key, value), <code>R</code> (result), <code>N</code> (number). Параметрів може бути кілька: <code>class Pair&lt;A, B&gt;</code>. Аргумент типу підставляють при створенні: <code>Pair&lt;String, Integer&gt; p = new Pair&lt;&gt;("a", 1);</code>, а ромб <code>&lt;&gt;</code> дозволяє компілятору вивести типи автоматично.`,
      String.raw`Узагальнені методи оголошують власний параметр типу перед типом результату: <code>static &lt;T&gt; T first(List&lt;T&gt; list) { return list.get(0); }</code>. Тип виводиться з аргументів під час виклику: <code>first(List.of("a", "b"))</code> повертає <code>String</code>. Метод може бути узагальненим навіть у неузагальненому класі, а параметри класу не видно у статичних методах: вони оголошують власні.`,
      String.raw`Параметрами типу можуть бути лише посилальні типи: <code>Box&lt;int&gt;</code> заборонено, потрібно <code>Box&lt;Integer&gt;</code>, а автоупаковка зробить решту. Також не можна створювати масив узагальненого типу (<code>new T[10]</code>) чи екземпляр параметра типу (<code>new T()</code>) через особливості реалізації, про які буде окремий урок про стирання типів.`,
      String.raw`Сире використання (raw type) — це узагальнений клас без аргументів типу: <code>List list = new ArrayList();</code>. Воно залишене для сумісності зі старим кодом: компілятор попереджає, а безпека типів пропадає. У новому коді сирих типів уникають. Якщо тип справді невідомий, користуються підстановкою <code>List&lt;?&gt;</code> або <code>List&lt;Object&gt;</code>.`,
      String.raw`Інваріантність: <code>List&lt;Integer&gt;</code> не є підтипом <code>List&lt;Number&gt;</code>, хоча <code>Integer</code> є підтипом <code>Number</code>. Інакше через посилання <code>List&lt;Number&gt;</code> можна було б додати <code>Double</code> у список цілих, і безпека типів зникла б. Для гнучкості існують підстановки з обмеженнями, які розглянемо в наступному уроці.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Box<String> text = new Box<>();
        text.set("java");
        String s = text.get();               // приведення не потрібне
        Box<Integer> number = new Box<>();
        number.set(42);
        System.out.println(s.length() + number.get());
    }
}

class Box<T> {
    private T value;

    T get() {
        return value;
    }

    void set(T value) {
        this.value = value;
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Pair<String, Integer> p = new Pair<>("age", 30);
        System.out.println(p.first() + "=" + p.second());
        System.out.println(p.swap());
    }
}

class Pair<A, B> {
    private final A first;
    private final B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    A first() {
        return first;
    }

    B second() {
        return second;
    }

    Pair<B, A> swap() {
        return new Pair<>(second, first);
    }

    @Override
    public String toString() {
        return "(" + first + ", " + second + ")";
    }
}`,
      String.raw`import java.util.List;

public class Main {
    static <T> T first(List<T> list) {
        return list.get(0);
    }

    static <T> T firstOrDefault(List<T> list, T def) {
        return list.isEmpty() ? def : list.get(0);
    }

    public static void main(String[] args) {
        String s = first(List.of("a", "b"));
        int n = first(List.of(10, 20));
        System.out.println(s + n);
        System.out.println(firstOrDefault(List.<String>of(), "none"));
    }
}`,
      String.raw`// не компілюється: Box<String> не приймає число, перевірка типів на етапі компіляції
public class Main {
    public static void main(String[] args) {
        Box<String> box = new Box<>();
        box.set(5);
        System.out.println(box.get());
    }
}

class Box<T> {
    private T value;

    T get() {
        return value;
    }

    void set(T value) {
        this.value = value;
    }
}`,
      String.raw`// не компілюється: List<Integer> не є підтипом List<Number>, інваріантність generics
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Number> numbers = new ArrayList<Integer>();
        System.out.println(numbers);
    }
}`,
    ],
    note: String.raw`Параметр типу може бути лише посилальним: <code>Box&lt;int&gt;</code> не скомпілюється, потрібен <code>Box&lt;Integer&gt;</code>. Generics перевіряють типи на етапі компіляції, а <code>List&lt;Integer&gt;</code> не є підтипом <code>List&lt;Number&gt;</code>.`,
    work: String.raw`Без generics неможливі ні колекції, ні Optional, ні Stream, ні Map. У власному коді їх застосовують для універсальних контейнерів, результатів операцій, репозиторіїв і кешів, щоб не дублювати клас для кожного типу й не повертатися до Object із приведеннями.`,
    tasks: [
      String.raw`Чому <code>List&lt;Integer&gt;</code> не можна присвоїти змінній типу <code>List&lt;Number&gt;</code>?`,
      String.raw`Напишіть узагальнений метод <code>last(List&lt;T&gt;)</code>, що повертає останній елемент.`,
    ],
  },
  {
    t: "Generics: обмеження extends і wildcards",
    ch: "Інтерфейси та generics",
    easy: String.raw`Обмеження типу — це вимога до кандидата на роботу: «будь-хто, але вміє рахувати». А підстановка ? — це гість, про якого відомо лише, з якої він родини: його можна послухати, але не можна підсунути йому довільний подарунок.`,
    p: [
      String.raw`Обмеження верхньої межі: <code>&lt;T extends Number&gt;</code> означає, що T — це Number або його нащадок. Тоді в методі можна викликати методи Number: <code>static &lt;T extends Number&gt; double sum(List&lt;T&gt; list) { ... x.doubleValue() ... }</code>. Для інтерфейсів теж використовують слово <code>extends</code>: <code>&lt;T extends Comparable&lt;T&gt;&gt;</code> вимагає, щоб тип можна було порівнювати з собою. Кілька меж записують через амперсанд: <code>&lt;T extends Number &amp; Comparable&lt;T&gt;&gt;</code>.`,
      String.raw`Класичний приклад — найбільший елемент: <code>static &lt;T extends Comparable&lt;T&gt;&gt; T max(List&lt;T&gt; list)</code>. Без обмеження компілятор не знав би, що в T є метод <code>compareTo</code>. Обмеження дає змогу писати універсальний код і при цьому викликати конкретні методи, зберігаючи безпеку типів, адже спроба передати несумісний тип зупиняється компілятором.`,
      String.raw`Підстановка (wildcard) <code>?</code> означає невідомий тип: <code>List&lt;?&gt;</code> — це список чогось. З нього можна читати елементи лише як <code>Object</code>, а додавати нічого, крім <code>null</code>. Це корисно для методів, яким байдужий тип елемента: <code>static int count(List&lt;?&gt; list) { return list.size(); }</code>. Такий метод приймає список будь-якого типу.`,
      String.raw`Підстановка з верхньою межею <code>? extends T</code> означає «будь-який підтип T». <code>List&lt;? extends Number&gt;</code> приймає <code>List&lt;Integer&gt;</code> та <code>List&lt;Double&gt;</code>. З нього можна читати елементи як <code>Number</code>, але додавати не можна: компілятор не знає, який саме це список. Це «виробник» (producer): він віддає значення.`,
      String.raw`Підстановка з нижньою межею <code>? super T</code> означає «будь-який надтип T». <code>List&lt;? super Integer&gt;</code> приймає <code>List&lt;Integer&gt;</code>, <code>List&lt;Number&gt;</code> і <code>List&lt;Object&gt;</code>. У нього можна додавати <code>Integer</code>, а читати лише як <code>Object</code>. Це «споживач» (consumer): він приймає значення, але віддає їх без точного типу.`,
      String.raw`Мнемоніка PECS: producer extends, consumer super. Якщо параметр лише віддає значення методу — <code>extends</code>; якщо лише приймає — <code>super</code>; якщо і те, і те — без підстановки. Приклад зі стандартної бібліотеки: <code>Collections.copy(List&lt;? super T&gt; dest, List&lt;? extends T&gt; src)</code>. Не нагромаджуйте підстановки без потреби: прості сигнатури читаються краще, а гнучкість потрібна переважно в публічних API бібліотек.`,
    ],
    code: [
      String.raw`import java.util.List;

public class Main {
    static <T extends Number> double sum(List<T> list) {
        double total = 0;
        for (T x : list) {
            total += x.doubleValue();       // метод Number доступний завдяки обмеженню
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum(List.of(1, 2, 3)));
        System.out.println(sum(List.of(1.5, 2.5)));
    }
}`,
      String.raw`import java.util.List;

public class Main {
    static <T extends Comparable<T>> T max(List<T> list) {
        T best = list.get(0);
        for (T x : list) {
            if (x.compareTo(best) > 0) {
                best = x;
            }
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(max(List.of(3, 9, 4)));
        System.out.println(max(List.of("pear", "apple", "zebra")));
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static double total(List<? extends Number> list) {      // виробник: читаємо
        double sum = 0;
        for (Number n : list) {
            sum += n.doubleValue();
        }
        return sum;
    }

    static void fill(List<? super Integer> out, int n) {    // споживач: записуємо
        for (int i = 0; i < n; i++) {
            out.add(i);
        }
    }

    public static void main(String[] args) {
        List<Number> numbers = new ArrayList<>();
        fill(numbers, 3);
        System.out.println(numbers + " " + total(numbers));
    }
}`,
      String.raw`// не компілюється: до List<? extends Number> не можна додавати елементи
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<? extends Number> list = new ArrayList<Integer>();
        list.add(5);
        System.out.println(list);
    }
}`,
      String.raw`// не компілюється: Object не реалізує Comparable, тож T не вдовольняє обмеження
import java.util.List;

public class Main {
    static <T extends Comparable<T>> T max(List<T> list) {
        return list.get(0);
    }

    public static void main(String[] args) {
        System.out.println(max(List.of(new Object())));
    }
}`,
    ],
    note: String.raw`PECS: <code>? extends T</code> для того, що тільки віддає значення (читаємо), <code>? super T</code> для того, що тільки приймає (записуємо). У <code>List&lt;? extends Number&gt;</code> додавати елементи не можна, а обмеження <code>&lt;T extends Comparable&lt;T&gt;&gt;</code> дає право викликати <code>compareTo</code>.`,
    work: String.raw`Підстановки й обмеження зустрічаються в сигнатурах бібліотечних методів і в публічних API: копіювання, сортування, об'єднання колекцій. Правило PECS допомагає прочитати їх без паніки, а в прикладному коді достатньо вміти писати прості обмеження на кшталт T extends Comparable&lt;T&gt;.`,
    tasks: [
      String.raw`Чому в <code>List&lt;? extends Number&gt;</code> не можна додавати елементи?`,
      String.raw`Що означає PECS і як його застосувати до методу <code>copy(dest, src)</code>?`,
    ],
  },
  {
    t: "Generics на практиці: Pair, Result і кеш",
    ch: "Інтерфейси та generics",
    adv: true,
    easy: String.raw`Result — це лист, що може бути або подякою, або скаргою: адресат відкриває його й точно знає, що всередині, не вгадуючи. Узагальнені типи дозволяють зробити таку «конвертну» систему для будь-яких даних.`,
    p: [
      String.raw`Узагальнені прості контейнери лежать в основі прикладних бібліотек. <code>Pair&lt;A, B&gt;</code> повертає два значення з методу; <code>Result&lt;T&gt;</code> описує результат операції, що може бути успішним чи помилковим; <code>Cache&lt;K, V&gt;</code> зберігає значення за ключем. Усі три невеликі, але виражають зрозумілі поняття й повторно використовуються з будь-якими типами.`,
      String.raw`Незмінний <code>Pair</code> зручно записати як <code>record Pair&lt;A, B&gt;(A first, B second) { }</code>: компілятор сам створить конструктор, доступ до компонентів, <code>equals</code>, <code>hashCode</code> та <code>toString</code>. Узагальнені record працюють так само, як звичайні класи. Перевага над масивом із двох елементів — типи компонентів зберігаються, а доступ іменований, тож помилку порядку видно одразу.`,
      String.raw`<code>Result&lt;T&gt;</code> варто описати як sealed-інтерфейс із двома record: <code>sealed interface Result&lt;T&gt; permits Ok, Err { }</code>, <code>record Ok&lt;T&gt;(T value) implements Result&lt;T&gt; { }</code>, <code>record Err&lt;T&gt;(String message) implements Result&lt;T&gt; { }</code>. Тоді switch з образцами розбирає результат, а компілятор перевіряє, що обидва варіанти оброблено. Це альтернатива винятку для очікуваних помилок: некоректне введення, відсутній запис.`,
      String.raw`Методи-перетворювачі роблять Result зручним: <code>map</code> застосовує функцію до успішного значення й не чіпає помилку, <code>orElse(default)</code> повертає значення або запасне. Це зменшує кількість <code>if</code> у викликача й нагадує поведінку <code>Optional</code>, але з поясненням причини помилки. Узагальнений метод <code>map</code> записують так: <code>&lt;R&gt; Result&lt;R&gt; map(Function&lt;T, R&gt; f)</code>.`,
      String.raw`Кеш <code>Cache&lt;K, V&gt;</code> на основі <code>HashMap</code> показує типову обгортку над колекцією: метод <code>get(key, loader)</code> повертає закешоване значення або обчислює його через функцію й зберігає. Параметри типу тут — ключ і значення, а завантажувач — <code>Function&lt;K, V&gt;</code>. Метод <code>computeIfAbsent</code> розв'язує задачу в один рядок, але власна обгортка дозволяє додати обмеження розміру, статистику чи термін життя.`,
      String.raw`Типові помилки: надто загальні типи (<code>Pair&lt;Object, Object&gt;</code> втрачає всі переваги), надмірно складні сигнатури там, де вистачило б звичайного класу, змішування сирих типів із узагальненими. Створюйте узагальнений тип, коли той самий шаблон потрібен щонайменше з двома різними типами, а не «про запас»: для одного використання звичайний клас простіший, а узагальнення вигідне, коли код повторюється.`,
    ],
    code: [
      String.raw`public class Main {
    record Pair<A, B>(A first, B second) { }

    static Pair<Integer, Integer> minMax(int a, int b, int c) {
        int min = Math.min(a, Math.min(b, c));
        int max = Math.max(a, Math.max(b, c));
        return new Pair<>(min, max);
    }

    public static void main(String[] args) {
        Pair<Integer, Integer> p = minMax(5, 2, 9);
        System.out.println(p);
        System.out.println(p.first() + " " + p.second());
    }
}`,
      String.raw`public class Main {
    static Result<Integer> parse(String s) {
        if (s.matches("-?\\d+")) {
            return new Ok<>(Integer.parseInt(s));
        }
        return new Err<>("not a number: " + s);
    }

    static <T> String describe(Result<T> r) {
        return switch (r) {
            case Ok<T> ok -> "ok " + ok.value();
            case Err<T> err -> "error " + err.message();
        };
    }

    public static void main(String[] args) {
        System.out.println(describe(parse("42")));
        System.out.println(describe(parse("x1")));
    }
}

sealed interface Result<T> permits Ok, Err {
}

record Ok<T>(T value) implements Result<T> {
}

record Err<T>(String message) implements Result<T> {
}`,
      String.raw`import java.util.function.Function;

public class Main {
    static <T, R> Result<R> map(Result<T> r, Function<T, R> f) {
        return switch (r) {
            case Ok<T> ok -> new Ok<>(f.apply(ok.value()));
            case Err<T> err -> new Err<>(err.message());
        };
    }

    public static void main(String[] args) {
        Result<Integer> a = new Ok<>(20);
        Result<String> b = map(a, x -> "value " + (x + 1));
        System.out.println(b);
        Result<Integer> bad = new Err<>("no data");
        System.out.println(map(bad, x -> x * 2));
    }
}

sealed interface Result<T> permits Ok, Err {
}

record Ok<T>(T value) implements Result<T> {
}

record Err<T>(String message) implements Result<T> {
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        Cache<String, String> cache = new Cache<>(key -> key.toUpperCase());
        System.out.println(cache.get("a"));
        System.out.println(cache.get("a"));
        System.out.println(cache.loads());       // 1: друге звернення взяте з кешу
    }
}

class Cache<K, V> {
    private final Map<K, V> data = new HashMap<>();
    private final Function<K, V> loader;
    private int loads;

    Cache(Function<K, V> loader) {
        this.loader = loader;
    }

    V get(K key) {
        V value = data.get(key);
        if (value == null) {
            value = loader.apply(key);
            data.put(key, value);
            loads++;
        }
        return value;
    }

    int loads() {
        return loads;
    }
}`,
      String.raw`// аварія: через сирий тип у список рядків потрапило число, помилка проявилась лише при читанні
import java.util.ArrayList;
import java.util.List;

public class Main {
    @SuppressWarnings({"unchecked", "rawtypes"})
    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        List raw = strings;
        raw.add(42);                       // компілятор мовчить
        String first = strings.get(0);     // ClassCastException тут
        System.out.println(first);
    }
}`,
    ],
    note: String.raw`Узагальнений тип доречний, коли той самий шаблон потрібен хоча б із двома різними типами: <code>Pair</code>, <code>Result</code>, <code>Cache</code>. Sealed-<code>Result</code> змушує викликача обробити і успіх, і помилку, а змішування сирих типів з узагальненими руйнує безпеку типів.`,
    work: String.raw`Типи Result і Optional дозволяють не використовувати виняток для очікуваних помилок, а Pair і подібні кортежі замінюють масиви з двох елементів. Кеші із завантажувачем є майже в кожному сервісі. Уміння написати такі невеликі узагальнені обгортки — типове завдання на співбесіді й у реальних проєктах.`,
    tasks: [
      String.raw`Чому <code>Pair&lt;Object, Object&gt;</code> гірший за <code>Pair&lt;String, Integer&gt;</code> для результату методу?`,
      String.raw`Як <code>sealed Result</code> допомагає не забути обробити помилку?`,
    ],
  },
  {
    t: "Проєктування інтерфейсів і стирання типів",
    ch: "Інтерфейси та generics",
    adv: true,
    easy: String.raw`Стирання типів — це переклад на ходу: під час компіляції ми пишемо докладні підписи на коробках, а перед відправленням на склад їх змивають, і склад бачить лише загальне «річ». Тому деякі речі, що вимагають підпису під час виконання, неможливі.`,
    p: [
      String.raw`Стирання типів (type erasure): компілятор перевіряє узагальнені типи й вилучає інформацію про них у байткоді. <code>List&lt;String&gt;</code> і <code>List&lt;Integer&gt;</code> під час виконання — просто <code>List</code>. Так зроблено для сумісності зі старим кодом, написаним до Java 5. Параметри типу замінюються на їхню межу (<code>Object</code> або те, що вказано в <code>extends</code>), а потрібні приведення вставляє компілятор.`,
      String.raw`Наслідки: не можна перевірити <code>obj instanceof List&lt;String&gt;</code> (лише <code>instanceof List&lt;?&gt;</code>), створити масив узагальненого типу <code>new T[10]</code>, створити екземпляр <code>new T()</code>, використати <code>T.class</code>, а також перевантажити методи, що відрізняються лише аргументом типу: <code>void f(List&lt;String&gt;)</code> і <code>void f(List&lt;Integer&gt;)</code> мають однакове стирання й конфліктують.`,
      String.raw`Обхідні шляхи: передати <code>Class&lt;T&gt;</code> параметром і використати <code>type.cast(obj)</code> або створення через рефлексію; передати фабрику <code>Supplier&lt;T&gt;</code> замість <code>new T()</code>; взяти <code>List&lt;T&gt;</code> замість масиву <code>T[]</code>. Ці прийоми трапляються у фреймворках: «токен типу» <code>Class&lt;T&gt;</code> повідомляє коду, що саме треба створити.`,
      String.raw`Забруднення купи (heap pollution): якщо обійти перевірки компілятора через сирі типи чи неперевірені приведення, у <code>List&lt;String&gt;</code> може потрапити число. Помилка проявиться пізніше, коли хтось прочитає елемент як рядок: <code>ClassCastException</code> виникне далеко від справжнього джерела. Компілятор попереджає про неперевірені операції (unchecked warnings), і до цих попереджень варто ставитися серйозно.`,
      String.raw`Анотація <code>@SuppressWarnings("unchecked")</code> гасить попередження, і її ставлять якомога вужче й лише коли впевнені в безпеці приведення, пояснюючи причину коментарем. Для методів із varargs узагальненого типу є <code>@SafeVarargs</code>. Не ховайте попередження за глобальними налаштуваннями: кожне заглушене місце — це зона особистої відповідальності розробника.`,
      String.raw`Проєктування інтерфейсів: описуйте контракт мінімальним набором операцій, придатним для кількох реалізацій. Приймайте в параметрах найзагальніший тип (<code>Collection</code> чи <code>Iterable</code> замість <code>ArrayList</code>), а повертайте найточніший, який легко гарантувати (<code>List</code>). Не вигадуйте інтерфейс заради інтерфейсу: він має мати зміст, а не лише дзеркалити клас.`,
      String.raw`Стабільність контракту: публічний інтерфейс — це обіцянка. Додавання до нього абстрактних методів ламає реалізації, тому його розширюють default-методами. Документуйте поведінку на межах: для <code>null</code>, порожніх колекцій, винятків. Добрий інтерфейс складно використати неправильно, і саме про це варто думати під час проєктування, а не після першої скарги користувачів.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        List<Integer> numbers = new ArrayList<>();
        System.out.println(strings.getClass() == numbers.getClass());   // true: параметри стерто
        System.out.println(strings.getClass().getSimpleName());
    }
}`,
      String.raw`// не компілюється: створити масив узагальненого типу неможливо через стирання
public class Main {
    static <T> T[] make() {
        return new T[3];
    }

    public static void main(String[] args) {
        System.out.println(make());
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class Main {
    static <T> List<T> repeat(Supplier<T> factory, int n) {   // фабрика замість new T()
        List<T> result = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            result.add(factory.get());
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(repeat(() -> "x", 3));
        List<StringBuilder> builders = repeat(StringBuilder::new, 2);
        System.out.println(builders.get(0) != builders.get(1));
    }
}`,
      String.raw`// аварія: приведення List<Object> до List<String> компілюється, але помилка проявляється при читанні
import java.util.ArrayList;
import java.util.List;

public class Main {
    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        List<Object> objects = new ArrayList<>();
        objects.add(1);
        List<String> strings = (List<String>) (List<?>) objects;
        System.out.println(strings.size());
        String s = strings.get(0);
        System.out.println(s);
    }
}`,
      String.raw`// не компілюється: після стирання обидва методи мають однаковий підпис f(List)
import java.util.List;

public class Main {
    static void f(List<String> list) {
        System.out.println("strings");
    }

    static void f(List<Integer> list) {
        System.out.println("numbers");
    }

    public static void main(String[] args) {
        f(List.of("a"));
    }
}`,
    ],
    note: String.raw`Під час виконання <code>List&lt;String&gt;</code> і <code>List&lt;Integer&gt;</code> — той самий клас: параметри типу стираються. Через це не можна писати <code>new T()</code>, <code>new T[n]</code> чи <code>instanceof List&lt;String&gt;</code>; обхід — передати <code>Supplier&lt;T&gt;</code> або <code>Class&lt;T&gt;</code>.`,
    work: String.raw`Стирання типів пояснює дивні обмеження generics і попередження про неперевірені операції, які ви бачите щодня. Знання про нього потрібне, щоб проєктувати узагальнені API з фабриками й токенами типів і розуміти, чому помилка ClassCastException з'являється там, де код начебто безпечний.`,
    tasks: [
      String.raw`Чому <code>obj instanceof List&lt;String&gt;</code> не компілюється?`,
      String.raw`Чим токен типу <code>Class&lt;T&gt;</code> допомагає створювати об'єкти в узагальненому коді?`,
    ],
  },
  {
    t: "Рефлексія: основи",
    ch: "Інтерфейси та generics",
    adv: true,
    easy: String.raw`Рефлексія — це дзеркало для програми: вона дивиться на себе й розповідає, які в неї є класи, поля та методи, навіть якщо про них нічого не було відомо під час написання коду.`,
    p: [
      String.raw`Рефлексія (пакет <code>java.lang.reflect</code>) дозволяє під час виконання отримати інформацію про типи й діяти з ними: дізнатися ім'я класу, перелічити поля та методи, створити об'єкт, викликати метод чи прочитати поле за назвою. Це основа фреймворків (Spring, Hibernate, JUnit, Jackson): вони знаходять ваші класи й анотації та працюють із ними, не знаючи заздалегідь, що саме там лежить.`,
      String.raw`Вхідна точка — об'єкт <code>Class</code>: <code>obj.getClass()</code>, <code>String.class</code> або <code>Class.forName("java.util.ArrayList")</code>. Його методи: <code>getName()</code>, <code>getSimpleName()</code>, <code>getSuperclass()</code>, <code>getInterfaces()</code>, <code>isInterface()</code>, <code>getDeclaredFields()</code>, <code>getDeclaredMethods()</code>, <code>getDeclaredConstructors()</code>. Для record є <code>getRecordComponents()</code>, а для enum — <code>getEnumConstants()</code>.`,
      String.raw`Поля: <code>Field f = cls.getDeclaredField("name"); f.setAccessible(true); Object v = f.get(obj);</code>. Приватні поля можна прочитати й змінити, але для цього потрібен <code>setAccessible(true)</code>, а в сучасних версіях Java модульна система може заборонити це для класів JDK. У власних класах це працює, проте порушує інкапсуляцію, тому застосовувати його слід обережно й усвідомлено.`,
      String.raw`Методи: <code>Method m = cls.getDeclaredMethod("greet", String.class); Object r = m.invoke(obj, "Ira");</code>. Виклик через <code>invoke</code> повільніший за прямий і не перевіряється компілятором: помилка в імені чи типах параметрів виявляється лише під час виконання (<code>NoSuchMethodException</code>). Винятки, які кидає викликаний метод, огортаються в <code>InvocationTargetException</code>. Ці винятки перевірювані, тож у прикладах нижче <code>main</code> оголошує <code>throws Exception</code>, про що ми поговоримо в главі про помилки.`,
      String.raw`Створення об'єктів: <code>cls.getDeclaredConstructor().newInstance()</code> викликає конструктор без параметрів. Так завантажують плагіни й класи за іменем із конфігурації. Рефлексія також читає анотації: <code>method.getAnnotation(MyAnn.class)</code>. Власні анотації з <code>@Retention(RetentionPolicy.RUNTIME)</code> видно під час виконання, і саме на цьому тримається більшість магії фреймворків.`,
      String.raw`Ціна рефлексії: повільніше виконання, відсутність перевірок компілятора, складніше налагодження, проблеми з обфускацією та нативною компіляцією. У прикладному коді її уникають, віддаючи перевагу інтерфейсам і поліморфізму. Доречна вона там, де код має працювати з невідомими наперед типами: серіалізація, ін'єкція залежностей, тестові фреймворки, інструменти розробника.`,
      String.raw`Безпека: рефлексія дозволяє обійти <code>private</code>, тому небезпечна в чужому коді. Не створюйте клас за іменем, що прийшло від користувача: це класична вразливість, а дозволені імена слід перевіряти за списком. Сучасні альтернативи рефлексії — <code>MethodHandle</code> і <code>VarHandle</code> (швидші й безпечніші) та генерація коду на етапі компіляції.`,
    ],
    code: [
      String.raw`import java.lang.reflect.Field;

public class Main {
    public static void main(String[] args) {
        Class<?> cls = User.class;
        System.out.println(cls.getSimpleName());
        for (Field f : cls.getDeclaredFields()) {
            System.out.println(f.getName() + " : " + f.getType().getSimpleName());
        }
        System.out.println(cls.getDeclaredMethods().length > 0);
    }
}

class User {
    private String name = "Ira";
    private int age = 30;

    String greet(String other) {
        return "Hi, " + other + "! I am " + name;
    }
}`,
      String.raw`import java.lang.reflect.Field;

public class Main {
    public static void main(String[] args) throws Exception {
        User u = new User();
        Field f = User.class.getDeclaredField("name");
        f.setAccessible(true);                    // обхід private
        System.out.println(f.get(u));
        f.set(u, "Taras");
        System.out.println(f.get(u));
    }
}

class User {
    private String name = "Ira";
}`,
      String.raw`import java.lang.reflect.Method;

public class Main {
    public static void main(String[] args) throws Exception {
        User u = new User();
        Method m = User.class.getDeclaredMethod("greet", String.class);
        Object result = m.invoke(u, "Olha");
        System.out.println(result);
        User created = User.class.getDeclaredConstructor().newInstance();
        System.out.println(created.greet("Petro"));
    }
}

class User {
    String greet(String other) {
        return "Hi, " + other;
    }
}`,
      String.raw`// аварія: такого методу в класі немає, NoSuchMethodException
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("looking up");
        User.class.getDeclaredMethod("nope");
    }
}

class User {
    String greet() {
        return "hi";
    }
}`,
      String.raw`import java.lang.reflect.RecordComponent;

public class Main {
    record Point(int x, int y) { }

    public static void main(String[] args) {
        for (RecordComponent c : Point.class.getRecordComponents()) {
            System.out.println(c.getName() + " : " + c.getType());
        }
        System.out.println(Point.class.isRecord());
    }
}`,
    ],
    note: String.raw`Рефлексія працює з типами під час виконання, але без перевірок компілятора: помилка в імені методу чи поля виявляється лише при запуску. Приватні члени доступні після <code>setAccessible(true)</code>, але це порушує інкапсуляцію, тому використовувати їх слід обережно.`,
    work: String.raw`Рефлексією користуються фреймворки: Spring створює об'єкти й вставляє залежності, Jackson читає поля для JSON, JUnit знаходить тестові методи. Сам розробник пише її рідко, проте розуміння механізму допомагає зрозуміти помилки фреймворків і особливості продуктивності та безпеки.`,
    tasks: [
      String.raw`Як за допомогою рефлексії прочитати значення приватного поля і чому це порушує інкапсуляцію?`,
      String.raw`Чому код із рефлексією складніше налагоджувати, ніж звичайний виклик методу?`,
    ],
  },
];
