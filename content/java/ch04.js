export const LESSONS_04 = [
  {
    t: "Класи: поля, конструктори й методи",
    ch: "Типи користувача",
    easy: String.raw`Клас — це креслення, а об'єкт — виріб за цим кресленням. З одного креслення «Товар» можна зробити багато товарів, у кожного з яких своя назва й ціна, але однакова будова.`,
    p: [
      String.raw`Клас описує сутність: які дані вона зберігає (поля) і що вміє робити (методи). Об'єкт створюють оператором <code>new</code>: <code>Product p = new Product("Bread", 25.5);</code>. Кожен об'єкт має власні значення полів, а методи в усіх однакові. Клас визначає новий тип: після оголошення <code>Product</code> можна вживати як <code>int</code> чи <code>String</code>, зокрема в параметрах, полях і колекціях.`,
      String.raw`Поля оголошують усередині класу поза методами: <code>private String name; private double price;</code>. На відміну від локальних змінних, поля мають значення за замовчуванням: <code>0</code>, <code>false</code> або <code>null</code>. Слово <code>private</code> означає, що поле видно лише в цьому класі; це перший крок до інкапсуляції, яку докладно розглянемо в наступних уроках.`,
      String.raw`Конструктор — особливий метод без типу результату з ім'ям класу: <code>Product(String name, double price) { this.name = name; this.price = price; }</code>. Він виконується під час <code>new</code> й задає початковий стан. Слово <code>this</code> означає поточний об'єкт: воно розрізняє поле <code>this.name</code> і параметр <code>name</code>, коли імена збігаються. Якщо конструктора не написано, компілятор додає порожній конструктор без параметрів.`,
      String.raw`Методи об'єкта працюють із його полями: <code>double getPrice() { return price; }</code>. Їх викликають через крапку: <code>p.getPrice()</code>. На відміну від <code>static</code>-методів із попередньої глави, такі методи прив'язані до конкретного об'єкта й бачать його поля. Метод може змінювати стан: <code>void setPrice(double price) { ... }</code>, а може лише читати його.`,
      String.raw`Метод <code>toString()</code> визначає, як об'єкт виглядає у виводі: <code>System.out.println(p)</code> викликає його автоматично. Без нього друкується щось на кшталт <code>Product@1b6d3586</code>: ім'я класу й хеш. Хороший <code>toString</code> коротко показує зміст: <code>Bread: 25.50</code>. Його додають до кожного класу даних, бо він рятує під час налагодження й у журналах.`,
      String.raw`Файли й класи: у навчальних завданнях допоміжні класи пишуть у тому ж файлі <code>Main.java</code> після <code>Main</code> без слова <code>public</code>. У справжніх проєктах кожен публічний клас лежить у власному файлі з тим самим іменем. Кілька класів в одному пакеті бачать один одного без імпорту, а клас у інших пакетах потребує <code>import</code>, про що ми говорили в першій главі.`,
      String.raw`Типові помилки: забути <code>new</code> (змінна лишається <code>null</code>); викликати метод на <code>null</code> (<code>NullPointerException</code>); написати конструктор із типом результату (тоді це звичайний метод, який ніколи не викликається при <code>new</code>); зробити всі поля публічними й дозволити будь-кому ламати стан об'єкта. Добрий клас має невеликий набір методів, зрозумілі імена й гарантований коректний стан після створення.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Product bread = new Product("Bread", 25.5);
        Product milk = new Product("Milk", 42);
        System.out.println(bread.getName() + " " + bread.getPrice());
        System.out.println(milk);
    }
}

class Product {
    private String name;
    private double price;

    Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    String getName() {
        return name;
    }

    double getPrice() {
        return price;
    }

    @Override
    public String toString() {
        return name + ": " + String.format("%.2f", price);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = new Counter();
        a.increment();
        a.increment();
        b.increment();
        System.out.println(a.get() + " " + b.get());   // 2 1: у кожного об'єкта свій стан
    }
}

class Counter {
    private int value;          // за замовчуванням 0

    void increment() {
        value++;
    }

    int get() {
        return value;
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Point p = new Point(3, 4);
        System.out.println(p);
        System.out.println(p.distanceToOrigin());
        Point q = new Point();            // конструктор без параметрів
        System.out.println(q);
    }
}

class Point {
    private final double x;
    private final double y;

    Point() {
        this(0, 0);                       // виклик іншого конструктора
    }

    Point(double x, double y) {
        this.x = x;
        this.y = y;
    }

    double distanceToOrigin() {
        return Math.sqrt(x * x + y * y);
    }

    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }
}`,
      String.raw`// не компілюється: у класі немає конструктора з параметрами, а виклик new Item("pen") його вимагає
public class Main {
    public static void main(String[] args) {
        Item item = new Item("pen");
        System.out.println(item);
    }
}

class Item {
    private String name;
}`,
      String.raw`// аварія: змінну типу Product не ініціалізовано, виклик методу на null дає NullPointerException
public class Main {
    public static void main(String[] args) {
        Product p = null;
        System.out.println("before");
        System.out.println(p.getName());
    }
}

class Product {
    private String name = "x";

    String getName() {
        return name;
    }
}`,
    ],
    note: String.raw`Конструктор не має типу результату й називається як клас. Якщо додати тип результату, це вже звичайний метод, і <code>new</code> його не викличе. А <code>toString</code> виводить стан об'єкта: без нього друкується ім'я класу з хешем.`,
    work: String.raw`Класи даних описують усе, що живе в бізнес-логіці: товар, клієнт, замовлення, платіж. Колеги очікують, що в класу є зрозумілий конструктор, приватні поля й <code>toString</code> для журналів. Це база, на якій будуються інші класи, бази даних і API, тому вона має бути охайною з першого дня.`,
    tasks: [
      String.raw`Чим клас відрізняється від об'єкта і скільки об'єктів можна створити з одного класу?`,
      String.raw`Що станеться, якщо в конструкторі параметр названо так само, як поле, і не вжити <code>this</code>?`,
    ],
  },
  {
    t: "Посилання, null і передача параметрів",
    ch: "Типи користувача",
    easy: String.raw`Змінна об'єкта — це не сам об'єкт, а адреса на конверті. Коли ви передаєте конверт у метод, адреса копіюється, а будинок лишається один: за цією адресою можна змінити будинок, але не можна замінити його іншим.`,
    p: [
      String.raw`Змінні примітивних типів зберігають значення, а змінні класів, масивів і рядків — посилання на об'єкт у купі (heap). Рядок <code>Product p = new Product("a", 1);</code> створює об'єкт у купі, а змінна <code>p</code> містить посилання на нього. Присвоєння <code>Product q = p;</code> копіює лише посилання: <code>p</code> і <code>q</code> тепер вказують на той самий об'єкт, і зміна через одне ім'я видна через інше.`,
      String.raw`Оператор <code>==</code> для посилань перевіряє, чи це один і той самий об'єкт, а не чи рівні їхні значення. Для порівняння вмісту потрібен метод <code>equals</code>, який ми визначимо в одному з наступних уроків. Тому два окремо створені об'єкти з однаковими полями за <code>==</code> різні: це поведінка, яку ми вже бачили в рядків.`,
      String.raw`Значення <code>null</code> означає «посилання нікуди не веде». Змінній посилального типу можна присвоїти <code>null</code>, але будь-який виклик методу чи доступ до поля через <code>null</code> кидає <code>NullPointerException</code>. Це найпоширеніша помилка виконання в Java. Примітиви <code>null</code> мати не можуть, тому <code>int x = null;</code> не скомпілюється.`,
      String.raw`Захист від <code>null</code>: перевіряти перед використанням (<code>if (p != null)</code>), не повертати <code>null</code> там, де можна повернути порожню колекцію чи <code>Optional</code>, ініціалізувати поля одразу. Порівнюючи рядки з літералом, пишуть <code>"abc".equals(s)</code>: літерал точно не <code>null</code>, і виняток не виникне. Починаючи з Java 14, повідомлення про <code>NullPointerException</code> вказує, що саме було null.`,
      String.raw`Передача параметрів у Java завжди відбувається за значенням. Для примітивів копіюється число, і зміна параметра не впливає на змінну ззовні. Для об'єктів копіюється посилання: метод бачить той самий об'єкт, тому зміна його полів ззовні видна, але присвоєння параметру нового об'єкта (<code>p = new Product(...)</code>) лише змінює локальну копію посилання й нічого не змінює для викликача.`,
      String.raw`Це пояснює відому задачу: метод <code>swap(Product a, Product b)</code> не може поміняти місцями два об'єкти в main, бо міняє лише власні копії посилань. Але метод <code>rename(Product p, String newName)</code> змінить назву товару, бо діє через посилання на об'єкт у купі. Запам'ятайте формулу: «посилання передається за значенням».`,
      String.raw`Збирач сміття вилучає об'єкти, на які не лишилося жодного посилання. Присвоєння <code>p = null;</code> або вихід змінної із зони видимості може зробити об'єкт недосяжним, але вручну звільняти пам'ять не потрібно й не можна. Витоки пам'яті в Java виникають, коли об'єкти лишаються досяжними через забуті посилання: кеші, статичні колекції, слухачі подій.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Box a = new Box(5);
        Box b = a;               // те саме посилання, не копія об'єкта
        b.value = 99;
        System.out.println(a.value);
        Box c = new Box(5);
        Box d = new Box(5);
        System.out.println(c == d);      // false: різні об'єкти
        System.out.println(c.value == d.value);
    }
}

class Box {
    int value;

    Box(int value) {
        this.value = value;
    }
}`,
      String.raw`public class Main {
    static void change(Box box) {
        box.value = 100;         // змінює об'єкт, на який вказує посилання
    }

    static void replace(Box box) {
        box = new Box(555);      // змінює лише локальну копію посилання
    }

    public static void main(String[] args) {
        Box x = new Box(1);
        change(x);
        System.out.println(x.value);   // 100
        replace(x);
        System.out.println(x.value);   // усе ще 100
    }
}

class Box {
    int value;

    Box(int value) {
        this.value = value;
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        String s = null;
        System.out.println(s == null);
        System.out.println("abc".equals(s));   // безпечно: виняток не виникає
        if (s != null && s.length() > 0) {
            System.out.println("non-empty");
        } else {
            System.out.println("null or empty");
        }
    }
}`,
      String.raw`// аварія: виклик методу через null-посилання, NullPointerException
public class Main {
    public static void main(String[] args) {
        String name = null;
        System.out.println("start");
        System.out.println(name.length());
    }
}`,
      String.raw`// не компілюється: примітив не може бути null
public class Main {
    public static void main(String[] args) {
        int count = null;
        System.out.println(count);
    }
}`,
    ],
    note: String.raw`Передача параметрів у Java завжди за значенням, але для об'єктів значенням є посилання: метод може змінити сам об'єкт, але не може підмінити його для викликача. Звернення до <code>null</code> завжди дає <code>NullPointerException</code>.`,
    work: String.raw`NullPointerException — найчастіша причина падіння продакшн-систем на Java, і майже кожен код-рев'ю починається з питання, що буде, якщо тут прийде null. Тому в API чітко домовляються, чи може метод повернути null, і замінюють його порожніми колекціями та Optional, а на вході перевіряють аргументи.`,
    tasks: [
      String.raw`Чому метод <code>swap(Box a, Box b)</code> не міняє місцями об'єкти в main, а <code>change(Box b)</code> змінює їх поле?`,
      String.raw`Що виведе <code>String s = null; System.out.println("x".equals(s));</code> і чому це безпечніше за <code>s.equals("x")</code>?`,
    ],
  },
  {
    t: "Інкапсуляція: private, static і final-поля",
    ch: "Типи користувача",
    easy: String.raw`Інкапсуляція — це кришка на механізмі: користувач натискає кнопки, але не може вставити пальці в шестерні. Клас сам вирішує, що відкрити назовні, а що лишити всередині.`,
    p: [
      String.raw`Інкапсуляція означає приховування внутрішнього стану класу й відкриття лише потрібних операцій. Поля роблять <code>private</code>, а доступ дають методами: <code>getPrice()</code> для читання, <code>setPrice(...)</code> для зміни. Сенс не в самих методах, а в контролі: сеттер може перевірити значення й не пустити від'ємну ціну, а клас гарантує, що його об'єкти завжди в коректному стані.`,
      String.raw`Модифікатори доступу: <code>public</code> — видно всім; <code>private</code> — лише в цьому класі; без модифікатора (package-private) — у межах пакета; <code>protected</code> — пакету й нащадкам. Правило практики: усе, що можна закрити, закривають, а відкривають мінімум. Закрите легко змінити, не зламавши чужий код, а відкрите вже стало контрактом.`,
      String.raw`Пара «getter і setter» — стандартний, але не обов'язковий шаблон. Геттер для поля <code>name</code> називають <code>getName()</code>, для boolean — <code>isActive()</code>. Для незмінних даних сеттер не потрібен узагалі. Не додавайте сеттери автоматично для кожного поля: чим менше способів змінити об'єкт, тим простіше стежити за його станом.`,
      String.raw`Слово <code>final</code> для поля забороняє повторне присвоєння після створення: поле можна задати в конструкторі, і далі воно не зміниться. Клас із усіма <code>final</code>-полями простих типів є незмінним (immutable), що безпечно передавати між частинами програми й потоками. Тому поля за замовчуванням краще робити <code>private final</code>, а послаблювати лише за потреби.`,
      String.raw`Статичні члени (<code>static</code>) належать класу, а не об'єкту. Статичне поле існує в одному екземплярі й спільне для всіх об'єктів: наприклад, лічильник створених товарів. Статичний метод викликають через ім'я класу (<code>Math.max</code>) і він не має доступу до <code>this</code> та полів об'єкта. Константи класу — це <code>static final</code>: <code>static final int MAX = 100;</code>.`,
      String.raw`Блок ініціалізації <code>static { ... }</code> виконується один раз, коли клас завантажується, а звичайний блок <code>{ ... }</code> — перед кожним конструктором. Порядок створення об'єкта: статична ініціалізація класу (один раз), потім поля з початковими значеннями, потім конструктор. Складну логіку в блоках ініціалізації тримати не варто: конструктор для цього зрозуміліший.`,
      String.raw`Типова помилка новачка — обернути публічні поля в тривіальні геттери й сеттери й вважати, що цього досить. Справжня інкапсуляція — коли клас пропонує операції предметної області: <code>account.withdraw(50)</code> замість <code>setBalance(getBalance() - 50)</code>. Така операція сама перевіряє достатність коштів і зберігає узгодженість даних. Тому на практиці рахунок, замовлення чи кошик ніколи не дозволяють змінювати внутрішні числа напряму: кожна дія проходить через метод, який знає правила предметної області й може відмовити в зміні, якщо вона порушує інваріант.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Account acc = new Account(100);
        acc.deposit(50);
        System.out.println(acc.getBalance());
        System.out.println(acc.withdraw(500));   // false: недостатньо коштів
        System.out.println(acc.withdraw(30));    // true
        System.out.println(acc.getBalance());
    }
}

class Account {
    private int balance;

    Account(int balance) {
        this.balance = balance;
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
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        new Ticket();
        new Ticket();
        Ticket last = new Ticket();
        System.out.println(last.getNumber() + " of " + Ticket.getCreated());
    }
}

class Ticket {
    private static int created = 0;        // одне поле на весь клас
    private final int number;              // своє в кожного об'єкта, незмінне

    Ticket() {
        created++;
        number = created;
    }

    int getNumber() {
        return number;
    }

    static int getCreated() {
        return created;
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Temperature t = new Temperature(36.6);
        System.out.println(t.getCelsius() + " " + t.getFahrenheit());
        t.setCelsius(-10);
        System.out.println(t.getCelsius());
        t.setCelsius(-500);                 // нижче абсолютного нуля: значення ігнорується
        System.out.println(t.getCelsius());
    }
}

class Temperature {
    private double celsius;

    Temperature(double celsius) {
        this.celsius = celsius;
    }

    double getCelsius() {
        return celsius;
    }

    void setCelsius(double celsius) {
        if (celsius >= -273.15) {
            this.celsius = celsius;
        }
    }

    double getFahrenheit() {
        return celsius * 9 / 5 + 32;
    }
}`,
      String.raw`// не компілюється: приватне поле balance недоступне поза класом Account
public class Main {
    public static void main(String[] args) {
        Account acc = new Account();
        acc.balance = 1000000;
        System.out.println(acc.getBalance());
    }
}

class Account {
    private int balance;

    int getBalance() {
        return balance;
    }
}`,
      String.raw`// не компілюється: final-поле можна задати лише один раз, у конструкторі
public class Main {
    public static void main(String[] args) {
        Id id = new Id(7);
        id.change(8);
        System.out.println(id.value);
    }
}

class Id {
    final int value;

    Id(int value) {
        this.value = value;
    }

    void change(int newValue) {
        this.value = newValue;
    }
}`,
    ],
    note: String.raw`Поля робіть <code>private</code> і, якщо можна, <code>final</code>, а доступ відкривайте методами з перевіркою. Статичне поле одне на весь клас, тому лічильник об'єктів живе в <code>static</code>, а номер конкретного об'єкта — у звичайному <code>final</code>-полі.`,
    work: String.raw`Інкапсуляція дозволяє змінювати внутрішню реалізацію класу, не ламаючи решту програми: можна замінити спосіб зберігання даних, а публічні методи залишаться. У командах приватні поля й незмінні класи вважаються нормою, а публічні змінні поля — приводом для зауваження на рев'ю.`,
    tasks: [
      String.raw`Чому корисніше метод <code>withdraw(int amount)</code> із перевіркою, ніж сеттер <code>setBalance(int)</code>?`,
      String.raw`Чим статичне поле відрізняється від звичайного і де його доречно використати?`,
    ],
  },
  {
    t: "Наслідування, абстрактні класи й поліморфізм",
    ch: "Типи користувача",
    easy: String.raw`Наслідування схоже на родинну будову: усі тварини мають ім'я й уміють їсти, а собака додатково гавкає. Підклас успадковує спільне від батька й додає або змінює своє.`,
    p: [
      String.raw`Наслідування дозволяє створити клас на основі іншого: <code>class Dog extends Animal</code>. Підклас (Dog) отримує поля й методи надкласу (Animal) і може додавати власні. Це відношення «є»: собака є твариною. Кожен клас у Java має лише одного прямого батька, а в самого верху стоїть <code>Object</code>, від якого походять усі класи; саме звідти беруться <code>toString</code>, <code>equals</code> і <code>hashCode</code>.`,
      String.raw`Конструктор підкласу спершу викликає конструктор батька через <code>super(...)</code>: це перший рядок конструктора. Якщо його не написано, компілятор вставляє <code>super()</code>, а коли в батька немає конструктора без параметрів, виникає помилка. Через <code>super.метод()</code> можна викликати версію батька з перевизначеного методу.`,
      String.raw`Перевизначення (override): підклас дає власну реалізацію методу з тим самим підписом. Позначка <code>@Override</code> змушує компілятор перевірити, що метод справді перевизначає батьківський: вона ловить помилки в імені чи параметрах. Приватні та статичні методи не перевизначаються, а фінальні (<code>final</code>) методи й класи заборонено перевизначати й успадковувати.`,
      String.raw`Поліморфізм: змінна типу батька може посилатися на об'єкт підкласу: <code>Animal a = new Dog();</code>. Який метод викликається, вирішується під час виконання за фактичним типом об'єкта, а не за типом змінної. Тому <code>a.sound()</code> для <code>Dog</code> дасть гавкіт, а для <code>Cat</code> нявкіт. Це дозволяє писати код для загального типу й додавати нові підкласи без змін у ньому.`,
      String.raw`Абстрактний клас (<code>abstract class Shape</code>) не можна створити через <code>new</code>: він описує неповну сутність. Він може містити абстрактні методи без тіла (<code>abstract double area();</code>), які підкласи зобов'язані реалізувати, і звичайні методи зі спільним кодом. Це добрий спосіб задати шаблон: загальне в батька, відмінне в нащадках.`,
      String.raw`Приведення типів: розширення (<code>Animal a = dog;</code>) відбувається неявно, а звуження до підкласу потребує явного приведення й може впасти з <code>ClassCastException</code>. Тому перед приведенням перевіряють <code>if (a instanceof Dog d)</code> (запис із шаблоном з Java 16 одразу створює змінну <code>d</code>). Без потреби спускатися до підкласу не слід: це ознака слабкої структури.`,
      String.raw`Наслідування — найсильніший зв'язок між класами, тому з ним обережні. Загальна порада: «перевага композиції над наслідуванням». Якщо клас лише використовує функціональність іншого, краще тримати його як поле, а не наслідувати. Наслідувати слід, коли відношення «є» справді виконується й підклас можна підставити всюди, де очікується батько, без здивувань.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Animal[] zoo = {new Dog("Rex"), new Cat("Tom"), new Animal("Thing")};
        for (Animal a : zoo) {
            System.out.println(a.getName() + ": " + a.sound());   // викликається версія фактичного класу
        }
    }
}

class Animal {
    private final String name;

    Animal(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }

    String sound() {
        return "...";
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name);
    }

    @Override
    String sound() {
        return "Woof";
    }
}

class Cat extends Animal {
    Cat(String name) {
        super(name);
    }

    @Override
    String sound() {
        return "Meow";
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Shape[] shapes = {new Circle(1), new Rect(2, 3)};
        double total = 0;
        for (Shape s : shapes) {
            System.out.println(s.describe());
            total += s.area();
        }
        System.out.printf("%.2f%n", total);
    }
}

abstract class Shape {
    abstract double area();

    String describe() {
        return getClass().getSimpleName() + " area " + String.format("%.2f", area());
    }
}

class Circle extends Shape {
    private final double r;

    Circle(double r) {
        this.r = r;
    }

    @Override
    double area() {
        return Math.PI * r * r;
    }
}

class Rect extends Shape {
    private final double w;
    private final double h;

    Rect(double w, double h) {
        this.w = w;
        this.h = h;
    }

    @Override
    double area() {
        return w * h;
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Animal a = new Dog("Rex");
        if (a instanceof Dog d) {              // перевірка й приведення одним записом
            System.out.println(d.fetch());
        }
        Animal b = new Cat("Tom");
        System.out.println(b instanceof Dog);  // false
    }
}

class Animal {
    private final String name;

    Animal(String name) {
        this.name = name;
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name);
    }

    String fetch() {
        return "fetching";
    }
}

class Cat extends Animal {
    Cat(String name) {
        super(name);
    }
}`,
      String.raw`// не компілюється: абстрактний клас не можна створити оператором new
public class Main {
    public static void main(String[] args) {
        Shape s = new Shape();
        System.out.println(s.area());
    }
}

abstract class Shape {
    abstract double area();
}`,
      String.raw`// аварія: об'єкт Cat не можна привести до Dog, ClassCastException
public class Main {
    public static void main(String[] args) {
        Animal a = new Cat();
        Dog d = (Dog) a;
        System.out.println(d);
    }
}

class Animal {
}

class Dog extends Animal {
}

class Cat extends Animal {
}`,
    ],
    note: String.raw`Який метод викликається, визначає фактичний тип об'єкта, а не тип змінної: це і є поліморфізм. Позначайте перевизначення через <code>@Override</code>, а перед звуженням типу перевіряйте <code>instanceof</code>, інакше можливий <code>ClassCastException</code>.`,
    work: String.raw`Поліморфізм дозволяє писати код для загального типу (оплата, фігура, повідомлення) і додавати нові різновиди без змін у ньому. Але глибокі ієрархії наслідування швидко стають крихкими, тому в сучасних проєктах переважає композиція й інтерфейси, а наслідуванням користуються для невеликих чітких ієрархій і бібліотечних каркасів.`,
    tasks: [
      String.raw`Чому <code>Animal a = new Dog();</code> викликає метод Dog, а не Animal?`,
      String.raw`Коли краще використати композицію замість наслідування? Наведіть приклад.`,
    ],
  },
  {
    t: "enum: перелічення з полями й методами",
    ch: "Типи користувача",
    easy: String.raw`enum — це меню з фіксованого набору страв: ви не можете замовити те, чого немає в меню, і кожна страва має свою назву, ціну й опис. Так статуси й дні тижня перестають бути «магічними» числами.`,
    p: [
      String.raw`<code>enum</code> оголошує тип із фіксованим набором значень: <code>enum Status { NEW, PAID, SHIPPED }</code>. Значення називають константами, їх прийнято писати великими літерами. Змінна типу <code>Status</code> може мати лише одну з перелічених констант або <code>null</code>. Це надійніше за числа чи рядки: компілятор не пропустить неіснуючий статус, а помилка в написанні виявляється одразу.`,
      String.raw`Кожне значення enum є єдиним об'єктом, тому порівнювати їх можна через <code>==</code>. Корисні методи: <code>name()</code> (ім'я константи як рядок), <code>ordinal()</code> (порядковий номер з нуля), <code>values()</code> (масив усіх констант), <code>valueOf("PAID")</code> (константа за ім'ям; для невідомого імені кидає <code>IllegalArgumentException</code>). Метод <code>toString()</code> за замовчуванням повертає ім'я.`,
      String.raw`Enum — це повноцінний клас: константи можуть мати поля, конструктор і методи. Приклад: <code>enum Size { S(36), M(40), L(44); private final int cm; Size(int cm) { this.cm = cm; } int getCm() { return cm; } }</code>. Конструктор enum завжди приватний, а після останньої константи ставлять крапку з комою. Так дані, пов'язані з константою, живуть поруч із нею, а не в окремому <code>switch</code>. Поле може зберігати текст для показу, код для бази, коефіцієнт чи інший параметр: так константа несе весь свій опис і не потребує окремих таблиць відповідності.`,
      String.raw`Enum чудово поєднується з <code>switch</code>: гілки перелічують константи без імені типу (<code>case NEW -&gt; ...</code>), а switch-вираз за наявності всіх констант не потребує <code>default</code>. Якщо потім додати нову константу, компілятор вкаже на всі місця, де її не оброблено. Це сильна перевага над рядковими статусами.`,
      String.raw`Поведінка в константах: enum може оголошувати абстрактний метод, який реалізує кожна константа власним тілом. Наприклад, операція <code>PLUS</code> знає, як додати, а <code>MINUS</code> — як відняти. Це замінює довгий switch і дозволяє додавати нові операції без змін у решті коду. Також enum може реалізувати інтерфейс.`,
      String.raw`Для колекцій із ключами-enum існують <code>EnumMap</code> та <code>EnumSet</code>: вони працюють швидко й зберігають елементи в порядку оголошення констант. Вони компактні, бо внутрішньо використовують масиви й біти. Для невеликих наборів прапорців <code>EnumSet</code> — це читабельний варіант бітових масок із попередньої глави.`,
      String.raw`Коли не слід використовувати enum: коли набір значень не фіксований і змінюється даними (категорії з бази, налаштування користувача). Також не зберігайте <code>ordinal()</code> у базі чи файлах: зміна порядку констант тихо зіпсує дані. Надійніше зберігати <code>name()</code> або власний код, що явно задано в константі.`,
    ],
    code: [
      String.raw`public class Main {
    enum Status { NEW, PAID, SHIPPED }

    public static void main(String[] args) {
        Status s = Status.PAID;
        System.out.println(s + " " + s.name() + " " + s.ordinal());
        System.out.println(s == Status.PAID);
        for (Status st : Status.values()) {
            System.out.print(st + " ");
        }
        System.out.println();
        System.out.println(Status.valueOf("NEW"));
    }
}`,
      String.raw`public class Main {
    enum Size {
        S(36), M(40), L(44);

        private final int cm;

        Size(int cm) {
            this.cm = cm;
        }

        int getCm() {
            return cm;
        }
    }

    public static void main(String[] args) {
        for (Size size : Size.values()) {
            System.out.println(size + " = " + size.getCm() + " cm");
        }
    }
}`,
      String.raw`public class Main {
    enum Status { NEW, PAID, SHIPPED }

    static String describe(Status s) {
        return switch (s) {                     // усі константи перелічено, default не потрібен
            case NEW -> "waiting for payment";
            case PAID -> "ready to ship";
            case SHIPPED -> "on the way";
        };
    }

    public static void main(String[] args) {
        for (Status s : Status.values()) {
            System.out.println(s + ": " + describe(s));
        }
    }
}`,
      String.raw`public class Main {
    enum Op {
        PLUS {
            int apply(int a, int b) {
                return a + b;
            }
        },
        MINUS {
            int apply(int a, int b) {
                return a - b;
            }
        };

        abstract int apply(int a, int b);
    }

    public static void main(String[] args) {
        System.out.println(Op.PLUS.apply(5, 3));
        System.out.println(Op.MINUS.apply(5, 3));
    }
}`,
      String.raw`// аварія: константи PENDING у переліченні немає, valueOf кидає IllegalArgumentException
public class Main {
    enum Status { NEW, PAID }

    public static void main(String[] args) {
        System.out.println(Status.valueOf("PAID"));
        System.out.println(Status.valueOf("PENDING"));
    }
}`,
    ],
    note: String.raw`Константи enum порівнюють через <code>==</code>. Switch-вираз, що перелічує всі константи, не потребує <code>default</code>, а після додавання нової константи компілятор підкаже, де її забули обробити. Не зберігайте <code>ordinal()</code>: зберігайте <code>name()</code>.`,
    work: String.raw`Статуси замовлень, ролі користувачів, типи подій, дні тижня, методи оплати — усе, що має фіксований набір значень, у Java зручно описувати enum. Він замінює «магічні» рядки й числа, спрощує перевірки й тестування, а IDE підказує допустимі значення під час набору коду.`,
    tasks: [
      String.raw`Чим enum кращий за набір <code>static final int</code> констант?`,
      String.raw`Чому не слід зберігати <code>ordinal()</code> у базі даних?`,
    ],
  },
  {
    t: "equals, hashCode і toString",
    ch: "Типи користувача",
    easy: String.raw`equals відповідає на питання «чи це те саме за змістом»: два паспорти з однаковими даними описують одну людину, хоч лежать у різних руках. hashCode — номер шухляди, у якій такі документи мають лежати разом.`,
    p: [
      String.raw`За замовчуванням <code>equals</code> успадковується від <code>Object</code> і порівнює посилання, як <code>==</code>. Тому два окремо створені об'єкти з однаковими полями рівними не вважаються. Щоб порівнювати за змістом, клас перевизначає <code>equals</code>. Це потрібно для пошуку в списках (<code>contains</code>, <code>indexOf</code>), видалення елементів, порівняння в тестах і, головне, для ключів у <code>HashMap</code> та елементів <code>HashSet</code>.`,
      String.raw`Контракт <code>equals</code>: рефлексивність (<code>x.equals(x)</code> істинне), симетричність (якщо <code>x.equals(y)</code>, то й <code>y.equals(x)</code>), транзитивність, стабільність, а <code>x.equals(null)</code> завжди хибне. Типова реалізація така: перевірити, що це той самий об'єкт, перевірити тип (<code>instanceof</code> із шаблоном), порівняти значущі поля — примітиви через <code>==</code>, посилальні через <code>Objects.equals</code>, який безпечний до <code>null</code>.`,
      String.raw`Контракт <code>hashCode</code>: якщо <code>a.equals(b)</code>, то <code>a.hashCode() == b.hashCode()</code>. Зворотне необов'язкове: різні об'єкти можуть мати однаковий хеш (колізія), але чим рівномірніші хеші, тим швидша мапа. Типова реалізація — <code>Objects.hash(поле1, поле2, ...)</code>. Поля в <code>hashCode</code> мають бути тими самими, що й в <code>equals</code>.`,
      String.raw`Що буде, якщо перевизначити лише <code>equals</code>: два «рівні» об'єкти матимуть різні хеші, тож <code>HashSet</code> може зберегти обидва, а <code>HashMap.get</code> не знайде запис за «таким самим» ключем. Це одна з найпідступніших помилок: код не падає, а просто поводиться дивно. Тому правило просте: <code>equals</code> і <code>hashCode</code> завжди перевизначають разом.`,
      String.raw`Не включайте в <code>equals</code> і <code>hashCode</code> змінні поля, якщо об'єкт кладуть у хеш-колекції: після зміни поля хеш зміниться, і об'єкт «загубиться» у своєму кошику. Для сутностей із ключем (ідентифікатором) часто порівнюють лише за ним, а для значень (точка, гроші, колір) — за всіма полями, і такі класи роблять незмінними.`,
      String.raw`<code>toString</code> теж походить від <code>Object</code>: за замовчуванням він дає <code>ім'я@хеш</code>. Його перевизначають, щоб виводити зрозумілий стан: <code>Point(3, 4)</code>. Не вставляйте в нього секрети (паролі, токени), бо <code>toString</code> потрапляє в журнали, повідомлення винятків і налагоджувальний вивід.`,
      String.raw`Писати ці методи вручну довго й легко помилитися, тому середовище розробки генерує їх за кілька кліків, а для простих незмінних даних є <code>record</code> (наступний урок), який створює <code>equals</code>, <code>hashCode</code> і <code>toString</code> автоматично. Проте розуміти контракт потрібно: саме він пояснює дивну поведінку колекцій у чужому коді.`,
    ],
    code: [
      String.raw`import java.util.List;

public class Main {
    public static void main(String[] args) {
        Point a = new Point(1, 2);
        Point b = new Point(1, 2);
        System.out.println(a == b);
        System.out.println(a.equals(b));                 // false: equals не перевизначено
        System.out.println(List.of(a).contains(b));      // false
    }
}

class Point {
    final int x;
    final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}`,
      String.raw`import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Point a = new Point(1, 2);
        Point b = new Point(1, 2);
        System.out.println(a.equals(b));
        System.out.println(List.of(a).contains(b));
        Set<Point> set = new HashSet<>(List.of(a));
        set.add(b);
        System.out.println(set.size());                 // 1: b вважається дублікатом
        System.out.println(a);
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
}`,
      String.raw`import java.util.HashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Set<Tag> tags = new HashSet<>();
        tags.add(new Tag("java"));
        tags.add(new Tag("java"));
        System.out.println(tags.size());   // 2 замість 1: hashCode не перевизначено
    }
}

class Tag {
    private final String name;

    Tag(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Tag t && name.equals(t.name);
    }
}`,
      String.raw`import java.util.Objects;

public class Main {
    public static void main(String[] args) {
        System.out.println(Objects.equals(null, null));     // true
        System.out.println(Objects.equals("a", null));      // false, без NullPointerException
        System.out.println(Objects.hash(1, "a") == Objects.hash(1, "a"));
        System.out.println(Objects.hashCode(null));
        System.out.println(new Object().toString().startsWith("java.lang.Object@"));
    }
}`,
      String.raw`// аварія: equals приводить тип без перевірки instanceof, і порівняння з рядком дає ClassCastException
public class Main {
    public static void main(String[] args) {
        Point p = new Point(1, 2);
        System.out.println(p.equals(new Point(1, 2)));
        System.out.println(p.equals("text"));
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
        Point other = (Point) o;
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return 31 * x + y;
    }
}`,
    ],
    note: String.raw`Якщо перевизначили <code>equals</code>, завжди перевизначайте й <code>hashCode</code> з тими самими полями: інакше <code>HashSet</code> і <code>HashMap</code> поводитимуться непередбачувано. Для порівняння полів, що можуть бути <code>null</code>, беріть <code>Objects.equals</code>.`,
    work: String.raw`Кожна бізнес-сутність, яку кладуть у множину чи мапу або порівнюють у тестах, потребує правильних equals і hashCode. Помилки тут проявляються не падінням, а дублікатами в множині, «зниклими» записами в мапі й тестами, які то проходять, то ні. Тому на рев'ю цю пару перевіряють особливо уважно.`,
    tasks: [
      String.raw`Чому <code>new Point(1, 2).equals(new Point(1, 2))</code> дає false без перевизначення equals?`,
      String.raw`До чого призведе перевизначення лише equals для ключів у HashMap?`,
    ],
  },
  {
    t: "record: прості незмінні типи",
    ch: "Типи користувача",
    easy: String.raw`record — це готова картка з кількома полями: ви лише перелічуєте, що на ній написано, а Java сама додає конструктор, читання полів, порівняння й текстовий вигляд.`,
    p: [
      String.raw`<code>record</code> (Java 16) — компактний запис для незмінних даних: <code>record Point(int x, int y) { }</code>. Компілятор сам створює приватні фінальні поля, канонічний конструктор, методи доступу <code>x()</code> та <code>y()</code> (без префікса get), а також <code>equals</code>, <code>hashCode</code> і <code>toString</code>. Те, що ми писали вручну десятки рядків, тут займає один.`,
      String.raw`Усі поля record незмінні: сеттерів немає, а нове значення можна отримати лише створенням нового об'єкта. Це зручно для даних, які передаються між частинами програми: координати, гроші, рядки таблиці, відповіді API. Незмінні об'єкти безпечні у багатопотоковому коді й чудово працюють як ключі мап. Але пам'ятайте: якщо компонент record сам змінний (наприклад, список), змінюватися може його вміст.`,
      String.raw`<code>toString</code> виводить формат <code>Point[x=3, y=4]</code>, а <code>equals</code> порівнює всі компоненти, тому <code>new Point(1, 2).equals(new Point(1, 2))</code> дає <code>true</code>, а такі об'єкти коректно працюють у <code>HashSet</code>. Усе, чого ми вимагали в попередньому уроці, виконано автоматично й без помилок.`,
      String.raw`У record можна додавати методи, статичні поля та статичні методи: <code>record Rect(double w, double h) { double area() { return w * h; } }</code>. Не можна додавати нестатичні поля й наслідувати інші класи (record неявно фінальний і успадковує <code>java.lang.Record</code>), але можна реалізовувати інтерфейси.`,
      String.raw`Компактний конструктор дозволяє перевіряти й нормалізувати значення: <code>record Age(int years) { Age { if (years &lt; 0) throw new IllegalArgumentException("negative"); } }</code>. Він виконується перед присвоєнням полів, а параметри в ньому можна змінювати, наприклад <code>name = name.trim();</code>. Так record гарантує коректність даних із моменту створення.`,
      String.raw`Коли використовувати record: прості носії даних (DTO, значення, ключі), результати методів із кількома значеннями (замість масиву чи пари). Коли ні: сутності зі змінним станом і складною поведінкою (рахунок із балансом, що змінюється) та класи, до яких фреймворки ставлять особливі вимоги. Для них краще звичайний клас.`,
      String.raw`Рекорди часто поєднують з <code>enum</code> та <code>sealed</code>-інтерфейсами для моделювання даних: <code>record Circle(double r) implements Shape</code>. Це основа сучасного стилю в Java: невеликі незмінні типи даних і функції над ними. У наступних главах побачимо, як із цим працюють switch з образцами й потоки. Запишіть кілька власних записів (адреса, замовлення, точка) і порівняйте з аналогічними класами: різниця в обсязі коду добре видна одразу.`,
    ],
    code: [
      String.raw`public class Main {
    record Point(int x, int y) { }

    public static void main(String[] args) {
        Point p = new Point(3, 4);
        System.out.println(p);               // Point[x=3, y=4]
        System.out.println(p.x() + " " + p.y());
        System.out.println(p.equals(new Point(3, 4)));
    }
}`,
      String.raw`import java.util.HashSet;
import java.util.Set;

public class Main {
    record Tag(String name) { }

    public static void main(String[] args) {
        Set<Tag> tags = new HashSet<>();
        tags.add(new Tag("java"));
        tags.add(new Tag("java"));
        System.out.println(tags.size());     // 1: equals і hashCode створено автоматично
    }
}`,
      String.raw`public class Main {
    record Rect(double w, double h) {
        static final Rect UNIT = new Rect(1, 1);

        double area() {
            return w * h;
        }

        static Rect square(double side) {
            return new Rect(side, side);
        }
    }

    public static void main(String[] args) {
        System.out.println(new Rect(2, 3).area());
        System.out.println(Rect.square(4));
        System.out.println(Rect.UNIT.area());
    }
}`,
      String.raw`// аварія: компактний конструктор відхиляє від'ємний вік, IllegalArgumentException
public class Main {
    record Age(int years) {
        Age {
            if (years < 0) {
                throw new IllegalArgumentException("negative age: " + years);
            }
        }
    }

    public static void main(String[] args) {
        System.out.println(new Age(17));
        System.out.println(new Age(-5));
    }
}`,
      String.raw`// не компілюється: поля record незмінні, присвоїти нове значення не можна
public class Main {
    record Point(int x, int y) { }

    public static void main(String[] args) {
        Point p = new Point(1, 2);
        p.x = 5;
        System.out.println(p);
    }
}`,
    ],
    note: String.raw`Record — незмінний носій даних: поля лише для читання, а <code>equals</code>, <code>hashCode</code> і <code>toString</code> створюються автоматично. Доступ до полів — методом <code>p.x()</code>, а не <code>p.getX()</code>. Перевірки значень пишуть у компактному конструкторі.`,
    work: String.raw`Рекорди швидко стали стандартом для невеликих класів даних: тіла запитів і відповідей API, рядки результатів, ключі кешу, пари значень. Вони скорочують код у рази, прибирають типові помилки з equals і hashCode, а прочитати їх можна за секунду, тож рев'ювери охоче радять їх замість ручних класів.`,
    tasks: [
      String.raw`Які методи компілятор створює автоматично для record?`,
      String.raw`Чому <code>record Age(int years)</code> із перевіркою в компактному конструкторі гарантує коректність усіх об'єктів?`,
    ],
  },
  {
    t: "Незмінні об'єкти і шаблон Builder",
    ch: "Типи користувача",
    adv: true,
    easy: String.raw`Builder — це замовлення піци за бланком: ви галочками позначаєте потрібні начинки в будь-якому порядку, а піцерія збирає готовий виріб лише після підпису внизу. Об'єкт створюється одразу правильним і більше не змінюється.`,
    p: [
      String.raw`Незмінний (immutable) об'єкт після створення не змінює стан: усі поля <code>private final</code>, сеттерів немає, клас <code>final</code> (або конструктор закритий), змінні компоненти копіюються при створенні й при віддачі. Приклади з бібліотеки: <code>String</code>, <code>Integer</code>, <code>LocalDate</code>, <code>BigDecimal</code>. Переваги: безпека в потоках, можливість вільно ділити посилання й простіше міркувати про код.`,
      String.raw`Незмінність і колекції: якщо клас зберігає список, то <code>final</code> на посиланні не робить сам список незмінним. Список треба скопіювати в конструкторі (<code>List.copyOf(items)</code> повертає незмінну копію) і не віддавати зовні змінну версію. Інакше хтось змінить список ззовні, і ваш «незмінний» об'єкт змінить стан. Це класична захисна копія (defensive copy).`,
      String.raw`«Зміна» незмінного об'єкта — це створення нового зі змінами: <code>order.withStatus(PAID)</code> повертає новий <code>Order</code>. Такі методи називають <code>with...</code>. Створення нових об'єктів дешеве, тому практика працює навіть у навантажених системах, а помилок із розділенням стану стає менше.`,
      String.raw`Проблема великих конструкторів: клас із десятком параметрів, частина з яких необов'язкова, перетворює виклик на таблицю: <code>new Pizza("L", true, false, null, 2)</code>. Читач не розуміє, що означає кожне значення. Перевантажені конструктори для всіх комбінацій множаться швидше, ніж їх можна підтримувати.`,
      String.raw`Шаблон Builder розв'язує проблему: окремий клас-будівельник накопичує значення методами, що повертають <code>this</code>, а метод <code>build()</code> перевіряє узгодженість і створює готовий незмінний об'єкт: <code>new Pizza.Builder().size("L").cheese(true).build();</code>. Виклик читається як опис, порядок параметрів не має значення, а необов'язкові просто пропускаються.`,
      String.raw`Реалізація: вкладений статичний клас <code>Builder</code> зі змінними полями й «ланцюжковими» методами; приватний конструктор основного класу, що приймає Builder; перевірки в <code>build()</code>. Так сам клас лишається незмінним, а всі «нестабільні» етапи складання відбуваються в будівельнику. Бібліотеки на кшталт Lombok генерують такий код за анотацією, але розуміти його влаштування потрібно.`,
      String.raw`Коли застосовувати: багато параметрів (приблизно від п'яти), частина з них необов'язкові, потрібні перевірки узгодженості. Для двох-трьох обов'язкових полів достатньо конструктора, а для простих носіїв даних — record. Не перетворюйте Builder на самоціль: кожен зайвий шаблон — це більше коду, який треба підтримувати. Перед створенням Builder переконайтеся, що клас справді має багато необов'язкових параметрів: інакше достатньо звичайного конструктора або фабричного методу з промовистою назвою, який виглядає простіше й не додає зайвих класів до проєкту.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> source = new ArrayList<>(List.of("pen", "ink"));
        Basket basket = new Basket(source);
        source.add("hack");                      // не впливає на basket: збережено копію
        System.out.println(basket.getItems());
    }
}

final class Basket {
    private final List<String> items;

    Basket(List<String> items) {
        this.items = List.copyOf(items);
    }

    List<String> getItems() {
        return items;
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Task t1 = new Task("write", false);
        Task t2 = t1.withDone(true);             // новий об'єкт, t1 не змінився
        System.out.println(t1);
        System.out.println(t2);
    }
}

final class Task {
    private final String title;
    private final boolean done;

    Task(String title, boolean done) {
        this.title = title;
        this.done = done;
    }

    Task withDone(boolean done) {
        return new Task(title, done);
    }

    @Override
    public String toString() {
        return title + (done ? " [x]" : " [ ]");
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Pizza pizza = new Pizza.Builder().size("L").cheese(true).extra("olives").build();
        System.out.println(pizza);
        System.out.println(new Pizza.Builder().build());
    }
}

final class Pizza {
    private final String size;
    private final boolean cheese;
    private final String extra;

    private Pizza(Builder b) {
        this.size = b.size;
        this.cheese = b.cheese;
        this.extra = b.extra;
    }

    @Override
    public String toString() {
        return size + " cheese=" + cheese + " extra=" + extra;
    }

    static class Builder {
        private String size = "M";
        private boolean cheese;
        private String extra = "none";

        Builder size(String size) {
            this.size = size;
            return this;
        }

        Builder cheese(boolean cheese) {
            this.cheese = cheese;
            return this;
        }

        Builder extra(String extra) {
            this.extra = extra;
            return this;
        }

        Pizza build() {
            return new Pizza(this);
        }
    }
}`,
      String.raw`// не компілюється: у «незмінному» класі сеттер намагається змінити final-поле
public class Main {
    public static void main(String[] args) {
        Id id = new Id(7);
        id.setValue(8);
        System.out.println(id.getValue());
    }
}

final class Id {
    private final int value;

    Id(int value) {
        this.value = value;
    }

    int getValue() {
        return value;
    }

    void setValue(int value) {
        this.value = value;
    }
}`,
      String.raw`// аварія: List.copyOf повертає незмінний список, додавати до нього не можна
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> copy = List.copyOf(new ArrayList<>(List.of("a", "b")));
        System.out.println(copy);
        copy.add("c");
    }
}`,
    ],
    note: String.raw`Незмінність означає не лише <code>final</code> поля, а й захисне копіювання змінних компонентів, наприклад списків: <code>List.copyOf(items)</code>. Builder збирає значення поступово й створює готовий об'єкт у <code>build()</code>, де можна перевірити їх узгодженість.`,
    work: String.raw`Незмінні об'єкти й Builder зустрічаються в клієнтах HTTP, конфігураціях, тестових даних та API бібліотек (<code>HttpRequest.newBuilder()</code>, <code>Locale.Builder</code>). Вони роблять код безпечним для багатопотокового виконання й легшим для читання, тому на рев'ю їх радять замість об'єктів із десятком сеттерів.`,
    tasks: [
      String.raw`Чому поле <code>private final List&lt;String&gt; items</code> ще не робить клас незмінним?`,
      String.raw`Коли Builder кращий за конструктор із параметрами?`,
    ],
  },
  {
    t: "Пам'ять Java: стек, купа і збирач сміття",
    ch: "Типи користувача",
    adv: true,
    easy: String.raw`Пам'ять програми схожа на кухню: на робочому столі (стек) лежить те, що потрібно просто зараз, на складі (купа) зберігаються всі продукти, а прибиральник (збирач сміття) викидає те, що вже нікому не потрібно.`,
    p: [
      String.raw`JVM ділить пам'ять на кілька областей. Стек (stack) свій у кожного потоку: у ньому лежать кадри викликів методів із локальними змінними й посиланнями. Купа (heap) спільна для всіх потоків: там створюються всі об'єкти й масиви. Окрему область займають метадані класів (metaspace) і код, але для щоденної роботи важливо розуміти саме стек і купу.`,
      String.raw`Коли метод викликається, на стеку з'являється кадр, а коли завершується — зникає разом зі своїми локальними змінними. Примітиви локальних змінних лежать прямо в кадрі, а об'єкти завжди в купі; у кадрі лише посилання на них. Тому повернення посилання з методу безпечне: об'єкт переживе кадр, доки на нього хтось посилається.`,
      String.raw`Купа поділена на покоління: молоде (young), де народжується більшість об'єктів і де більшість із них швидко помирає, та старе (old) для тих, що вижили кілька циклів збирання. Така «гіпотеза поколінь» робить збирання ефективним: швидкі малі збирання чистять лише молоде покоління, а повні збирання трапляються рідко.`,
      String.raw`Збирач сміття (GC) знаходить досяжні об'єкти, починаючи від «коренів» (локальні змінні в стеках потоків, статичні поля), і звільняє пам'ять усіх недосяжних. Тому «вручну звільнити» об'єкт не можна, а присвоєння <code>null</code> корисне лише коли змінна живе довго (статичне поле чи елемент великого масиву). Метод <code>System.gc()</code> лише пропонує запуск і нічого не гарантує.`,
      String.raw`Сучасні збирачі: G1 (за замовчуванням), ZGC і Shenandoah (мінімальні паузи), Parallel (максимальна пропускна здатність), Serial (для малих програм). Вибір збирача й розміру купи (<code>-Xms</code>, <code>-Xmx</code>) налаштовують прапорцями запуску. Паузи збирання — це час, коли програма затримується; для більшості застосунків вони непомітні, а для низької затримки обирають ZGC.`,
      String.raw`Витоки пам'яті в Java — це не «забутий free», а об'єкти, що лишаються досяжними без потреби: статичні колекції, які лише ростуть, кеші без обмеження, слухачі, що не відписуються, потоки, які не завершуються. Симптом — купа повільно росте аж до <code>OutOfMemoryError</code>. Діагностика: аналіз дампа купи (jmap, Eclipse MAT, VisualVM).`,
      String.raw`Два види помилок пам'яті: <code>StackOverflowError</code> (стек переповнено, зазвичай нескінченна рекурсія) і <code>OutOfMemoryError</code> (купа вичерпана). Обидві — <code>Error</code>, а не звичайні винятки, тож перехоплювати їх заради відновлення зазвичай безглуздо. Реагувати слід зміною коду: обмежити кеш, виправити рекурсію, збільшити пам'ять, якщо вона справді потрібна.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        long max = rt.maxMemory();
        long total = rt.totalMemory();
        long free = rt.freeMemory();
        System.out.println(max > 0);
        System.out.println(total > 0 && free >= 0);
        System.out.println(rt.availableProcessors() > 0);
    }
}`,
      String.raw`public class Main {
    static int[] makeArray() {
        int[] local = new int[3];      // масив у купі, посилання local у кадрі методу
        local[0] = 7;
        return local;                  // кадр зникає, а масив живе: на нього є посилання
    }

    public static void main(String[] args) {
        int[] a = makeArray();
        int[] b = a;
        System.out.println(a[0] + " " + (a == b));
        int[] c = new int[3];
        System.out.println(a == c);
    }
}`,
      String.raw`import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        BoundedCache cache = new BoundedCache(2);
        cache.put("a", 1);
        cache.put("b", 2);
        cache.put("c", 3);               // найстаріший запис видаляється, кеш не росте безмежно
        System.out.println(cache.keySet());
    }
}

class BoundedCache extends LinkedHashMap<String, Integer> {
    private final int capacity;

    BoundedCache(int capacity) {
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
        return size() > capacity;
    }
}`,
      String.raw`// аварія: масив такого розміру неможливо створити, OutOfMemoryError
public class Main {
    public static void main(String[] args) {
        System.out.println("allocating");
        long[] huge = new long[Integer.MAX_VALUE];
        System.out.println(huge.length);
    }
}`,
    ],
    note: String.raw`Об'єкти живуть у купі, а локальні змінні й посилання — на стеку потоку. Збирач сміття звільняє лише недосяжні об'єкти, тому витік у Java — це зайве посилання (кеш, що росте, статична колекція), а не забутий <code>free</code>.`,
    work: String.raw`Знання про пам'ять допомагає діагностувати повільні й падаючі системи: розрахувати розмір купи, знайти витік за дампом, зрозуміти паузи збирача. Це типові питання на співбесідах і в реальних інцидентах, коли сервіс раптом починає споживати все більше пам'яті.`,
    tasks: [
      String.raw`Де зберігається об'єкт, створений у методі, і де зберігається посилання на нього?`,
      String.raw`Чому витік пам'яті можливий навіть у мові зі збирачем сміття?`,
    ],
  },
];
