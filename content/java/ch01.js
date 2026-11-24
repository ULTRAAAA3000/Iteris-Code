export const LESSONS_01 = [
  {
    t: "Встановлення JDK і перший запуск",
    ch: "Початок",
    easy: String.raw`JDK — це майстерня, а JVM — сцена. Ви пишете текст програми, компілятор перекладає його в байткод, а віртуальна машина Java виконує цей байткод на будь-якому комп'ютері, де вона встановлена.`,
    p: [
      String.raw`Java створила компанія Sun Microsystems, перша версія вийшла 1996 року; сьогодні мовою опікуються Oracle і відкрита спільнота OpenJDK. Гасло «напиши один раз, запускай усюди» досі працює: програма компілюється не в команди конкретного процесора, а в байткод, і той самий файл запускається на Windows, macOS і Linux. На Java пишуть серверні системи банків і торгових платформ, Android-застосунки, інструменти для великих даних і ігри на кшталт Minecraft Java Edition. Це одна з найпоширеніших мов корпоративної розробки, тому вакансії для Java-розробників є майже в кожній країні.`,
      String.raw`Три абревіатури, які постійно плутають. <b>JVM</b> (Java Virtual Machine) виконує байткод. <b>JRE</b> (Java Runtime Environment) — це JVM плюс стандартна бібліотека, потрібна лише для запуску програм. <b>JDK</b> (Java Development Kit) — це JRE плюс інструменти розробника: компілятор <code>javac</code>, архіватор <code>jar</code>, дизасемблер <code>javap</code>, інтерактивна оболонка <code>jshell</code>. Для навчання й роботи ставимо саме JDK; окремий JRE сучасні версії вже не розповсюджують.`,
      String.raw`Нові версії Java виходять двічі на рік, у березні й вересні, а кожна четверта з недавніх — LTS, тобто з довгою підтримкою: 8, 11, 17, 21 і 25. У виробничих проєктах зазвичай сидять на LTS. Цей курс написано для Java 21: усі приклади компілюються і з новішими JDK. Можливості, що з'явилися пізніше, ми підписуємо номером версії, а експериментальні (preview) у курсі не використовуємо.`,
      String.raw`Найпростіше встановити збірку Eclipse Temurin з сайту adoptium.net: є інсталятори для Windows і macOS та пакети для Linux. На Ubuntu вистачить <code>sudo apt install openjdk-21-jdk</code>, на macOS — <code>brew install openjdk@21</code>. Якщо потрібно кілька версій одночасно, використовують менеджер SDKMAN. Після встановлення відкрийте новий термінал і виконайте <code>java -version</code> та <code>javac -version</code>: основна версія має збігатися. Коли <code>java</code> працює, а <code>javac</code> «не знайдено», у вас лише JRE або в PATH не той каталог.`,
      String.raw`Змінна середовища <code>JAVA_HOME</code> вказує на каталог встановленого JDK; її читають Maven, Gradle і середовища розробки. Якщо інструмент не знаходить Java, перша перевірка — <code>echo $JAVA_HOME</code> (у Windows <code>echo %JAVA_HOME%</code>). Каталог <code>bin</code> цього JDK також має бути в PATH, інакше система запускатиме іншу, старішу Java, і ви довго шукатимете, чому нові можливості «не компілюються».`,
      String.raw`Перший запуск складається з двох кроків. Створіть файл <code>Main.java</code> і виконайте <code>javac Main.java</code>: з'явиться <code>Main.class</code> із байткодом. Потім <code>java Main</code>: тут пишемо ім'я класу, а не файла. Для коротких експериментів є скорочення <code>java Main.java</code>, яке компілює й запускає програму в пам'яті одним викликом. А <code>jshell</code> — інтерактивна оболонка, де вираз <code>2 + 3</code> одразу дає результат: чудова чернетка для перевірки дрібниць.`,
      String.raw`Правило, на якому спотикається кожен: публічний клас має лежати у файлі з тим самим ім'ям, і регістр літер важливий. Клас <code>public class Hello</code> у файлі Main.java компілятор відхилить. У всіх завданнях курсу головний клас називається <code>Main</code>, а файл — Main.java. Текст, який друкує програма, пишемо латиницею: кодування консолі залежить від системи, і кирилиця у виводі може перетворитися на знаки питання. Коментарі й пояснення лишаються українською.`,
    ],
    code: [
      String.raw`// фрагмент: термінал, перевірка встановлення
$ java -version
openjdk version "21.0.5" 2024-10-15 LTS
$ javac -version
javac 21.0.5
$ echo $JAVA_HOME
/usr/lib/jvm/java-21-openjdk-amd64`,
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        System.out.println("JDK works");
    }
}`,
      String.raw`// фрагмент: термінал, три способи запустити файл Main.java
$ javac Main.java        # створює Main.class
$ java Main              # ім'я класу, без розширення
$ java Main.java         # скорочення: збірка в пам'яті й запуск

$ jshell
jshell> 2 + 3
$1 ==> 5
jshell> "Java".length()
$2 ==> 4
jshell> /exit`,
      String.raw`public class Main {
    public static void main(String[] args) {
        Runtime.Version v = Runtime.version();
        System.out.println("feature = " + v.feature());
        System.out.println("vendor known = " + (System.getProperty("java.vendor") != null));
        System.out.println("at least 21: " + (v.feature() >= 21));
    }
}`,
      String.raw`// не компілюється: public-клас Hello лежить у файлі Main.java, а має бути в Hello.java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}`,
    ],
    note: String.raw`Команда <code>javac</code> приймає ім'я файла з розширенням (<code>Main.java</code>), а <code>java</code> — ім'я класу без розширення (<code>Main</code>). Саме ця різниця найчастіше ламає перший запуск: <code>java Main.class</code> завершується помилкою.`,
    work: String.raw`У компанії вам видадуть ноутбук із певною версією JDK, а проєкт вимагатиме саме її. Тому першою справою нового розробника стає перевірка <code>java -version</code> і JAVA_HOME та налаштування IDE на потрібний JDK. Помилки на кшталт «unsupported class file version» майже завжди означають розбіжність версій компілятора й запуску.`,
    tasks: [
      String.raw`Поясніть своїми словами різницю між JVM, JRE і JDK і скажіть, що саме треба встановити для розробки.`,
      String.raw`Створіть файл Main.java з виводом двох рядків, скомпілюйте його через javac і запустіть через java. Які нові файли з'явилися в каталозі?`,
    ],
  },
  {
    t: "Перша програма: клас Main і System.out",
    ch: "Початок",
    easy: String.raw`Програма на Java схожа на сцену з єдиним входом: віртуальна машина шукає двері з написом main і починає виконання звідти. System.out — це табло, на яке програма виводить текст для людини.`,
    p: [
      String.raw`Мінімальна програма складається з класу й методу <code>main</code>. Рядок <code>public class Main</code> оголошує клас, ім'я якого збігається з іменем файла. Рядок <code>public static void main(String[] args)</code> — точка входу: JVM шукає метод саме з таким підписом. Кожне слово має сенс: <code>public</code> — метод видно ззовні, <code>static</code> — його можна викликати без створення об'єкта, <code>void</code> — результат не повертається, <code>String[] args</code> — масив аргументів командного рядка. Поки сприймайте цей рядок як шаблон: кожне слово ми розберемо в главі про класи.`,
      String.raw`Тіло методу пишуть у фігурних дужках, кожну інструкцію завершує крапка з комою. Відступи роблять код читабельним, але компілятору вони байдужі (на відміну від Python). Java чутлива до регістру: <code>system.out</code> і <code>System.out</code> — різні назви, <code>Main</code> і <code>main</code> — теж. Тому більшість помилок у першій програмі — це або забута крапка з комою, або літера не того регістру.`,
      String.raw`Для виводу є три основні методи. <code>System.out.println(x)</code> друкує значення й переходить на новий рядок, <code>print</code> робить те саме без переходу, <code>printf</code> друкує за форматом (докладно в наступній главі). Тут <code>System</code> — клас, <code>out</code> — його статичне поле, потік стандартного виводу, а <code>println</code> — метод цього потоку. Є й <code>System.err</code> — окремий потік для повідомлень про помилки: у терміналі він виглядає так само, але його можна перенаправити окремо.`,
      String.raw`Рядкові літерали беруть у подвійні лапки. Спеціальні символи записують через зворотну скісну: <code>\n</code> — новий рядок, <code>\t</code> — табуляція, <code>\"</code> — лапка всередині рядка, <code>\\</code> — сама скісна. Оператор <code>+</code> з рядком склеює: <code>"Total: " + 5</code> дає <code>Total: 5</code>. Тут ховається пастка: вирази обчислюються зліва направо, тому <code>"Total: " + 20 + 25</code> дасть <code>Total: 2025</code>, а <code>"Total: " + (20 + 25)</code> — <code>Total: 45</code>. Якщо потрібна сума, беріть її в дужки.`,
      String.raw`Коментарі бувають трьох видів: <code>// до кінця рядка</code>, <code>/* ... */</code> на кілька рядків і <code>/** ... */</code> — документаційні, з яких утиліта javadoc збирає довідку. Добрий коментар пояснює «чому», а не «що»: що робить код, видно з самого коду. Закоментований код у репозиторії не залишають: для історії змін є Git.`,
      String.raw`Усе, що ви напишете в командному рядку після імені класу, потрапляє в масив <code>args</code>: для <code>java Main one two</code> буде <code>args.length == 2</code> і <code>args[0]</code> дорівнює <code>one</code>. Без аргументів масив порожній, але ніколи не <code>null</code>. У завданнях на сайті аргументів немає, тож довжина там завжди 0.`,
      String.raw`Типові пастки першої програми: пропущена крапка з комою; неправильний підпис <code>main</code> — тоді компілятор мовчить, а запуск завершується повідомленням «Main method not found»; незакрита дужка, помилку про яку компілятор показує в кінці файла, а не там, де ви її допустили. У новіших версіях (з Java 25) можна писати програму без явного класу й <code>static</code>, але весь реальний код досі пишуть у класичній формі, тому вчимо саме її.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.print("One ");
        System.out.print("two ");
        System.out.println("three");
        System.out.println("Next line");
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println("Name\tQty");
        System.out.println("Pen\t3");
        System.out.println("She said \"hi\"");
        System.out.println("Path: C:\\temp");
        System.out.println("Line 1\nLine 2");
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        // змінні розберемо в наступній главі: поки це просто два числа
        int a = 20, b = 25;
        System.out.println("Total: " + a + b);
        System.out.println("Total: " + (a + b));
        System.out.println(a + b + " is the total");
        System.out.println("args: " + args.length);
    }
}`,
      String.raw`/**
 * Документаційний коментар: з нього javadoc збирає довідку.
 */
public class Main {
    public static void main(String[] args) {
        // коментар до кінця рядка
        System.out.println("comments are ignored"); // і так теж
        /* а цей коментар
           займає кілька рядків */
        System.out.println("done");
    }
}`,
      String.raw`// аварія: метод названо Main замість main, JVM не знаходить точку входу
public class Main {
    public static void Main(String[] args) {
        System.out.println("Hello");
    }
}`,
    ],
    note: String.raw`Вирази з <code>+</code> обчислюються зліва направо: щойно зліва з'явився рядок, усі наступні числа теж склеюються як текст. Суму чисел у складі рядка завжди беріть у дужки: <code>"Total: " + (a + b)</code>.`,
    work: String.raw`Вивід у консоль — найперший інструмент налагодження, але в реальних сервісах замість <code>System.out.println</code> використовують логер: він додає час, рівень повідомлення й ім'я класу. Зате в скриптах, утилітах командного рядка й на співбесідах із короткими задачами <code>println</code> лишається щоденним інструментом.`,
    tasks: [
      String.raw`Що надрукує <code>System.out.println(1 + 2 + "a" + 1 + 2);</code> і чому саме так?`,
      String.raw`Змініть метод main так, щоб програма друкувала кількість аргументів командного рядка, і запустіть її з двома аргументами.`,
    ],
  },
  {
    t: "Пакети, імпорти й організація файлів",
    ch: "Початок",
    easy: String.raw`Пакет — це папка з адресою для класів: щоб не переплутати двох Іванів, їх називають із прізвищем і містом. Імпорт — коротке прізвисько, яким ви звертаєтесь до чужого класу, не пишучи повну адресу.`,
    p: [
      String.raw`У проєкті тисячі класів, і багато з них мають однакові імена: <code>Date</code>, <code>List</code>, <code>Logger</code>. Пакет — іменований простір, який групує пов'язані класи й розв'язує конфлікти імен. Повне ім'я класу — це пакет плюс клас: <code>java.util.ArrayList</code>. Пакети ще й керують доступом: клас без модифікатора видно лише в межах його пакета.`,
      String.raw`Пакет відповідає каталогу. Рядок <code>package com.shop.orders;</code> на початку файла означає, що файл лежить у каталозі <code>com/shop/orders</code> від кореня вихідних кодів. Імена пакетів пишуть малими літерами, а за традицією починають із перевернутого домену компанії (<code>com.shop</code>), щоб вони були унікальними у світі. Один файл містить один публічний клас, і ім'я файла збігається з ім'ям цього класу.`,
      String.raw`Щоб скористатися класом з іншого пакета, пишуть або повне ім'я щоразу, або <code>import java.util.ArrayList;</code> над класом. Зірочка <code>import java.util.*;</code> підключає всі класи пакета, але не вкладених пакетів. У командах найчастіше вимагають явних імпортів без зірочки: так одразу видно, звідки береться кожне ім'я. Пакет <code>java.lang</code> (String, Math, System, Integer) підключений автоматично, тому для нього імпорт не потрібен.`,
      String.raw`Статичний імпорт <code>import static java.lang.Math.max;</code> дозволяє писати <code>max(a, b)</code> без префікса <code>Math.</code>. Це зручно для констант і тестових перевірок, але зловживання робить код нечитабельним: незрозуміло, звідки взявся метод. Імпорт не копіює код і не завантажує клас наперед: це лише скорочення, яке допомагає компілятору знайти ім'я.`,
      String.raw`Якщо в одному файлі потрібні <code>java.util.Date</code> і <code>java.sql.Date</code>, імпортувати можна лише один із них, а другий пишуть із повним іменем. Якщо ж клас використано без імпорту, компілятор повідомить «cannot find symbol». Середовища розробки (IntelliJ IDEA, VS Code) додають імпорти за одне натискання, тому майже ніхто не набирає їх вручну, але розуміти, що вони роблять, потрібно.`,
      String.raw`Рівні доступу пов'язані з пакетами. <code>public</code> видно всім, <code>private</code> — лише всередині класу, відсутність модифікатора (package-private) — лише в межах пакета, а <code>protected</code> — пакету й нащадкам. Практичне правило: робіть усе якомога закритішим і відкривайте лише те, що справді потрібно іншим. Про <code>private</code> і <code>protected</code> докладно в главі про типи користувача.`,
      String.raw`Як це працює на сайті. Завдання тут запускаються як один файл <code>Main.java</code> без оголошення пакета: поряд із <code>Main</code> можна дописати інші класи (без слова <code>public</code>), а імпорти пишуть угорі. Рядок <code>package</code> у такому файлі зламає запуск: клас потрапить у підкаталог, і JVM не знайде <code>Main</code>. У справжніх проєктах (Maven, Gradle) пакети й каталоги збігаються, про це поговоримо в главі про тестування.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // колекції розберемо в главі 3, тут вони лише для прикладу імпорту
        List<String> names = new ArrayList<>();
        names.add("Ira");
        names.add("Taras");
        System.out.println(names);
        System.out.println(String.valueOf(names.size())); // String з java.lang: імпорт не потрібен
    }
}`,
      String.raw`import static java.lang.Math.max;
import static java.lang.Math.sqrt;

public class Main {
    public static void main(String[] args) {
        System.out.println(max(7, 12));
        System.out.println(sqrt(81));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        // два класи з однаковим іменем: розрізняємо повними іменами
        java.util.Date utilDate = new java.util.Date(0L);
        java.sql.Date sqlDate = new java.sql.Date(0L);
        System.out.println(utilDate.getClass().getName());
        System.out.println(sqlDate.getClass().getName());
    }
}`,
      String.raw`// не компілюється: List і ArrayList використано без import, cannot find symbol
public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Ira");
        System.out.println(names);
    }
}`,
      String.raw`// аварія: з package клас лежить у підкаталозі demo/, і запуск java -cp out Main його не знаходить
package demo;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from package");
    }
}`,
    ],
    note: String.raw`Пакет <code>java.lang</code> підключений автоматично, тому <code>String</code> і <code>Math</code> імпортувати не треба. Усе інше, наприклад <code>java.util</code> чи <code>java.time</code>, потребує <code>import</code>, інакше компілятор видасть «cannot find symbol».`,
    work: String.raw`У Java-проєктах імпорти зазвичай формують автоматично, а правила стилю забороняють зірочки й імпорти, що не використовуються. Структура пакетів за шарами (controller, service, repository) або за функціями — перше, що ви побачите, відкривши чужий репозиторій, і саме вона підказує, де шукати потрібний код.`,
    tasks: [
      String.raw`Чому <code>String</code> можна використовувати без імпорту, а <code>ArrayList</code> — ні?`,
      String.raw`Як використати <code>java.util.Date</code> і <code>java.sql.Date</code> в одному файлі, щоб не було конфлікту імен?`,
    ],
  },
  {
    t: "Інструменти: javac, java і помилки компіляції",
    ch: "Початок",
    easy: String.raw`javac — це суворий коректор, який перевіряє програму до запуску й показує, де саме помилка. Повідомлення компілятора й stack trace — це карта: вони вказують файл, рядок і причину, треба лише вміти її читати.`,
    p: [
      String.raw`Між файлом <code>.java</code> і результатом на екрані відбувається два етапи. Компілятор <code>javac</code> читає вихідний текст, перевіряє синтаксис, типи й імена та створює файли <code>.class</code> з байткодом. Потім JVM завантажує клас і виконує його. Тому помилки бувають двох видів: помилки компіляції (програму не збудовано, жодного рядка не виконано) і помилки виконання (виняток під час роботи). Перші дешевші: компілятор знаходить їх за секунду, тож вчіться перекладати його повідомлення.`,
      String.raw`Повідомлення javac має вигляд <code>Main.java:5: error: ';' expected</code>: файл, номер рядка й суть помилки. Нижче компілятор показує сам рядок коду з позначкою <code>^</code> у місці, де він зрозумів, що щось не так. Номер рядка — лише підказка: пропущену дужку або крапку з комою часто «помічають» у наступному рядку. Виправляйте першу помилку й компілюйте знову: наступні можуть зникнути самі, адже одна невдала дужка здатна породити десятки повідомлень.`,
      String.raw`Три найчастіші помилки новачка. <code>cannot find symbol</code> — невідоме ім'я: помилка в написанні, забутий імпорт, змінна поза зоною видимості. <code>incompatible types</code> — значення не того типу, наприклад <code>int x = "5";</code>. <code>missing return statement</code> — метод обіцяє результат, а на якомусь шляху виконання його немає. Читайте повідомлення буквально: компілятор Java говорить досить прямо.`,
      String.raw`Помилка виконання виглядає інакше: <code>Exception in thread "main" java.lang.ArithmeticException: / by zero</code>, а нижче список рядків <code>at Main.main(Main.java:5)</code>. Це stack trace, тобто стек викликів. Перший рядок каже, який виняток і чому. Перший <code>at</code> показує, де саме впало, наступні — хто це викликав. Шукайте перший рядок із назвою вашого класу, а не з <code>java.base</code>: код JDK зазвичай не винен, винен аргумент, який ви йому передали.`,
      String.raw`Корисні утиліти JDK. <code>javac -d out Main.java</code> складає файли в каталог <code>out</code>, а <code>java -cp out Main</code> вказує, де шукати класи (так званий classpath). <code>javap -c Main</code> показує байткод, <code>jar</code> пакує класи в архів, який запускають командою <code>java -jar app.jar</code>. Прапорець <code>-Xlint:all</code> вмикає додаткові попередження: вони не зупиняють збірку, але вказують на підозрілі місця.`,
      String.raw`Попередження (warning) — не помилка: збірка проходить, а компілятор радить придивитися до коду, наприклад застарілого методу чи небезпечного приведення. У роботі javac вручну викликають рідко: збирає проєкт Maven або Gradle, а середовище розробки підсвічує помилки ще під час набору. Проте розуміти, що відбувається під капотом, потрібно: сервер збірки покаже вам саме сирий вивід компілятора.`,
      String.raw`Стиль теж частина інструментарію. У Java прийнято відступ у чотири пробіли, фігурну дужку на тому ж рядку, імена класів із великої літери (<code>OrderService</code>), імена методів і змінних із малої (<code>totalPrice</code>), а констант — великими літерами (<code>MAX_SIZE</code>). Це договір спільноти, а не вимога компілятора, але порушувати його не варто: це перше, що помітять на код-рев'ю. Середовище розробки форматує код за одне сполучення клавіш.`,
    ],
    code: [
      String.raw`// не компілюється: пропущено крапку з комою в кінці рядка
public class Main {
    public static void main(String[] args) {
        System.out.println("Start")
        System.out.println("Done");
    }
}`,
      String.raw`// не компілюється: printn замість println, cannot find symbol
public class Main {
    public static void main(String[] args) {
        System.out.printn("Hello");
    }
}`,
      String.raw`// не компілюється: рядок не можна присвоїти змінній типу int, incompatible types
public class Main {
    public static void main(String[] args) {
        int count = "5";
        System.out.println(count);
    }
}`,
      String.raw`// аварія: ділення на нуль, stack trace показує ланцюжок викликів
public class Main {
    static int divide(int a, int b) {
        return a / b;
    }

    static int ratio(int total, int parts) {
        return divide(total, parts);
    }

    public static void main(String[] args) {
        // методи розберемо в главі 2: тут важливо лише прочитати stack trace
        System.out.println(ratio(10, 2));
        System.out.println(ratio(10, 0));
    }
}`,
      String.raw`// фрагмент: термінал, збірка в каталог out, байткод і запуск із jar
$ javac -d out Main.java
$ java -cp out Main
$ javap -c -cp out Main
$ jar --create --file app.jar --main-class Main -C out .
$ java -jar app.jar`,
    ],
    note: String.raw`Виправляйте помилки компіляції згори вниз і компілюйте знову після кожної: одна пропущена дужка породжує десятки зайвих повідомлень. А в stack trace шукайте перший рядок <code>at</code> із вашим класом: саме там ваш код передав щось неправильне.`,
    work: String.raw`Розробник читає повідомлення компілятора й stack trace щодня, а на співбесідах часто просять прочитати чужий trace й назвати причину. Сервери збірки (Jenkins, GitHub Actions) показують лише текст помилки, тож уміння швидко знайти рядок і причину напряму впливає на продуктивність.`,
    tasks: [
      String.raw`Що означає повідомлення <code>cannot find symbol</code> і які три причини можуть його викликати?`,
      String.raw`Запустіть програму з діленням на нуль і поясніть, який рядок stack trace вказує на місце помилки у вашому коді.`,
    ],
  },
];
