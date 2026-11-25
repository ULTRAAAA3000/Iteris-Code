export const LESSONS_02 = [
  {
    t: "Змінні й примітивні типи",
    ch: "Основи мови",
    easy: String.raw`Змінна — це підписана коробка: ви вибираєте розмір коробки (тип), даєте їй ім'я й кладете значення. Java суворо стежить, щоб у коробку для цілих чисел не потрапило, наприклад, слово.`,
    p: [
      String.raw`Java — статично типізована мова: тип кожної змінної відомий ще до запуску й не змінюється. Оголошення має вигляд <code>тип ім'я = значення;</code>, наприклад <code>int age = 17;</code>. Компілятор перевіряє, що значення підходить до типу, і саме тому багато помилок знаходять ще до запуску програми. Це відрізняє Java від Python чи JavaScript, де тип належить значенню, а не змінній.`,
      String.raw`Примітивних типів вісім. Цілі: <code>byte</code> (1 байт, від -128 до 127), <code>short</code> (2 байти), <code>int</code> (4 байти, приблизно ±2,1 мільярда) і <code>long</code> (8 байтів). Дробові: <code>float</code> (4 байти) і <code>double</code> (8 байтів). Логічний <code>boolean</code> (<code>true</code> або <code>false</code>) і символ <code>char</code> (один символ Unicode в одинарних лапках: <code>'A'</code>). У повсякденному коді переважають <code>int</code>, <code>double</code>, <code>boolean</code> і трохи рідше <code>long</code>.`,
      String.raw`Усе інше — посилальні типи: <code>String</code>, масиви, класи. Змінна примітивного типу зберігає саме значення, а змінна посилального — посилання на об'єкт; різницю докладно розберемо в главі про типи користувача. Назви примітивів пишуть з малої літери (<code>int</code>), а класів — з великої (<code>String</code>), тож їх легко відрізнити.`,
      String.raw`Змінна має бути ініціалізована до першого читання. Локальні змінні не мають значення за замовчуванням: спроба прочитати <code>int x;</code> без присвоєння дасть помилку компіляції «variable x might not have been initialized». Поля класів отримують нулі автоматично, а локальні змінні — ні. Це корисна суворість: компілятор не дає працювати з випадковим сміттям у пам'яті.`,
      String.raw`З Java 10 можна писати <code>var</code>: <code>var count = 5;</code> — компілятор сам визначить тип <code>int</code> за значенням. Це не динамічна типізація: тип фіксується назавжди, і <code>var</code> не дозволить потім записати рядок. Працює <code>var</code> лише для локальних змінних із початковим значенням. Користуйтеся ним, коли тип очевидний з правої частини, і не ховайте за ним неясні вирази.`,
      String.raw`Імена змінних пишуть у стилі camelCase: <code>totalPrice</code>, <code>userAge</code>. Ім'я починається з літери, <code>_</code> або <code>$</code>, але не з цифри, і не збігається з ключовим словом (<code>class</code>, <code>int</code>). Ім'я має розповідати про зміст: <code>daysLeft</code> краще за <code>x1</code>. Змінну оголошують якомога ближче до першого використання, а діє вона лише в блоці <code>{ }</code>, де її створено: за його межами ім'я невідоме.`,
      String.raw`Тип <code>char</code> цікавий тим, що це число (код Unicode), яке виводиться як символ. Вираз <code>'a' + 1</code> дає число 98 (тип <code>int</code>), а <code>(char) ('a' + 1)</code> дає символ <code>'b'</code>. Приведення типів у дужках розберемо в окремому уроці; поки запам'ятайте, що <code>char</code> можна використовувати в арифметиці, а результат арифметики за замовчуванням має тип <code>int</code>.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        byte small = 100;
        int count = 42;
        long big = 3_000_000_000L;
        double price = 19.99;
        float ratio = 0.5f;
        boolean ready = true;
        char grade = 'A';
        System.out.println(small + " " + count + " " + big);
        System.out.println(price + " " + ratio + " " + ready + " " + grade);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        var total = 10;
        var message = "Total";
        total = total + 5;
        {
            int inner = 7; // існує лише всередині цих дужок
            System.out.println(inner);
        }
        System.out.println(message + ": " + total);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        char letter = 'a';
        System.out.println(letter + 1);          // число 98: char розширюється до int
        System.out.println((char) (letter + 1)); // символ b
        char digit = '7';
        System.out.println(digit - '0');         // число 7
    }
}`,
      String.raw`// не компілюється: локальну змінну прочитано до того, як їй щось присвоїли
public class Main {
    public static void main(String[] args) {
        int count;
        System.out.println(count);
    }
}`,
      String.raw`// не компілюється: змінну inner оголошено у вкладеному блоці, а використано поза ним
public class Main {
    public static void main(String[] args) {
        {
            int inner = 7;
        }
        System.out.println(inner);
    }
}`,
    ],
    note: String.raw`Локальна змінна не має значення за замовчуванням: компілятор не дозволяє читати її, поки їй нічого не присвоєно. Тип змінної, навіть із <code>var</code>, після оголошення не змінюється: <code>var n = 5;</code> не дозволить потім записати рядок.`,
    work: String.raw`У реальному коді тип обирають за змістом: <code>int</code> для лічильників, <code>long</code> для ідентифікаторів і часових міток, <code>double</code> для вимірювань, <code>boolean</code> для прапорців. Для грошей <code>double</code> не вживають, чому — у наступному уроці. А <code>var</code> у командах використовують там, де тип очевидний.`,
    tasks: [
      String.raw`Який тип обрати для віку людини, для кількості населення Землі та для ціни товару? Обґрунтуйте вибір.`,
      String.raw`Чому <code>var n = 5; n = "five";</code> не компілюється, хоча <code>var</code> не вказує тип явно?`,
    ],
  },
  {
    t: "Числа: переповнення, ділення й точність",
    ch: "Основи мови",
    easy: String.raw`int — це лічильник кілометрів на старому авто: коли шкала закінчується, він не ламається, а тихо починає з нуля. Тому важливо знати межі чисел і те, як працює ділення.`,
    p: [
      String.raw`Цілі типи мають межі. <code>int</code> вміщує числа від <code>-2147483648</code> до <code>2147483647</code> (константи <code>Integer.MIN_VALUE</code> і <code>Integer.MAX_VALUE</code>), а <code>long</code> — понад дев'ять квінтильйонів. Літерали long пишуть із суфіксом <code>L</code>: <code>3_000_000_000L</code>. Підкреслення в числах ігноруються й роблять довгі числа читабельними. Без суфікса компілятор вважає число типом int, і число більше межі просто не скомпілюється.`,
      String.raw`Переповнення — найвідоміша тиха помилка: <code>Integer.MAX_VALUE + 1</code> дає <code>Integer.MIN_VALUE</code>. Java не кидає виняток і не попереджає: число «загортається» по колу. Якщо результат може вийти за межі, беруть <code>long</code> або перевірені методи <code>Math.addExact</code> і <code>Math.multiplyExact</code>: вони кидають <code>ArithmeticException</code> замість мовчання. Розрахунки сум, розмірів і ідентифікаторів без такої перевірки не раз ставали причиною реальних аварій.`,
      String.raw`Ділення цілих відкидає дробову частину: <code>7 / 2</code> дає <code>3</code>, а <code>-7 / 2</code> дає <code>-3</code> (до нуля). Остача — оператор <code>%</code>: <code>7 % 2</code> дорівнює <code>1</code>, а <code>-7 % 2</code> дорівнює <code>-1</code>, бо знак остачі збігається зі знаком діленого. Ділення цілого на нуль кидає <code>ArithmeticException</code>. Щоб отримати дробовий результат, один з операндів має бути <code>double</code>: <code>7 / 2.0</code> дає <code>3.5</code>.`,
      String.raw`Дробові числа зберігаються у двійковому вигляді, тому не кожен десятковий дріб подається точно: <code>0.1 + 0.2</code> дає <code>0.30000000000000004</code>. Це не помилка Java, а властивість стандарту IEEE 754, однакова в усіх мовах. Порівнювати <code>double</code> через <code>==</code> небезпечно: порівнюють модуль різниці з малим допуском, наприклад <code>Math.abs(a - b) &lt; 1e-9</code>.`,
      String.raw`Особливі значення: ділення дробового числа на нуль не кидає виняток, а дає <code>Infinity</code> чи <code>-Infinity</code>, а вираз <code>0.0 / 0.0</code> дає <code>NaN</code> (not a number). NaN не дорівнює навіть сам собі, тому єдина надійна перевірка — <code>Double.isNaN(x)</code>. Через це «тихі» помилки з дробовими числами можна загубити далеко від місця, де вони виникли.`,
      String.raw`Гроші в <code>double</code> не зберігають. Типові підходи: цілі числа в найменших одиницях (копійки, центи) або клас <code>BigDecimal</code> (про нього в главі про стандартну бібліотеку). У цьому курсі для грошей використовуємо цілі копійки: сума 19,99 грн — це <code>1999</code> копійок. Додавання й віднімання цілих точні, а для показу користувачеві ділять на 100 й беруть остачу від ділення.`,
      String.raw`Пам'ятайте про пріоритет: множення, ділення й остача виконуються раніше за додавання й віднімання, а дужки роблять порядок явним. Скорочені форми <code>+=</code>, <code>-=</code>, <code>*=</code>, <code>++</code> і <code>--</code> змінюють змінну на місці. Префіксна форма <code>++i</code> спершу збільшує значення, а постфіксна <code>i++</code> повертає старе, але в окремому рядку різниці між ними немає.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        System.out.println(max);
        System.out.println(max + 1);        // загортається до мінімуму
        long safe = (long) max + 1;
        System.out.println(safe);           // у long місця вистачає
    }
}`,
      String.raw`// аварія: addExact не мовчить при переповненні, а кидає ArithmeticException
public class Main {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        System.out.println(Math.addExact(max, 0));
        System.out.println(Math.addExact(max, 1));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println(7 / 2);     // 3
        System.out.println(-7 / 2);    // -3
        System.out.println(7 % 2);     // 1
        System.out.println(-7 % 2);    // -1
        System.out.println(7 / 2.0);   // 3.5
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        double sum = 0.1 + 0.2;
        System.out.println(sum);
        System.out.println(sum == 0.3);                       // false
        System.out.println(Math.abs(sum - 0.3) < 1e-9);       // true
        int cents = 10 + 20;                                  // гроші цілими копійками
        System.out.println(cents / 100 + "." + cents % 100);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        double zero = 0.0;
        System.out.println(1.0 / zero);
        System.out.println(-1.0 / zero);
        double nan = zero / zero;
        System.out.println(nan);
        System.out.println(nan == nan);          // false
        System.out.println(Double.isNaN(nan));   // true
    }
}`,
    ],
    note: String.raw`Переповнення цілих не викликає ні винятку, ні попередження: результат «загортається». Для величин, які можуть вийти за межі <code>int</code>, беріть <code>long</code> або <code>Math.addExact</code>, а гроші не тримайте в <code>double</code>.`,
    work: String.raw`Помилки переповнення й округлення приводили до реальних збоїв: від лічильників, що обнулялися, до неправильних сум у платіжних системах. Тому гроші зберігають цілими в копійках або в BigDecimal, а ідентифікатори й часові мітки — у long. На код-рев'ю <code>double</code> для грошей одразу позначають як помилку.`,
    tasks: [
      String.raw`Що виведе <code>System.out.println(7 / 2 + 7 % 2 + 7 / 2.0);</code> і чому?`,
      String.raw`Чому <code>0.1 + 0.2 == 0.3</code> дає false і як безпечно порівнювати дробові числа?`,
    ],
  },
  {
    t: "Константи: final і літерали",
    ch: "Основи мови",
    easy: String.raw`Константа — це напис «не чіпати» на дверях: значення задають один раз, і програма вже не дозволить його змінити. Так число 20 у коді стає зрозумілим іменем, наприклад TAX_PERCENT.`,
    p: [
      String.raw`Ключове слово <code>final</code> перед змінною забороняє повторне присвоєння: <code>final int days = 7;</code>. Спроба змінити таку змінну дає помилку компіляції «cannot assign a value to final variable». Значення <code>final</code>-змінної можна задати не одразу, а пізніше, але лише один раз і до першого читання.`,
      String.raw`Для констант на рівні класу пишуть <code>static final</code>: <code>static final int MAX_USERS = 100;</code>. Ім'я такої константи традиційно складається з великих літер і підкреслень: <code>TAX_PERCENT</code>, <code>DEFAULT_TIMEOUT_MS</code>. Слово <code>static</code> означає, що константа належить класу, а не об'єкту; поки вважайте його частиною запису. Константи розміщують нагорі класу, перед методами.`,
      String.raw`Магічні числа — це числа без пояснення: <code>price * 20 / 100</code>. Читач не знає, що таке 20: податок, знижка чи кількість днів. Іменована константа <code>TAX_PERCENT</code> розв'язує проблему й дозволяє змінити значення в одному місці. Правило: усе, що не є 0, 1 чи очевидним (як 2 у «половина»), заслуговує на ім'я.`,
      String.raw`Літерали бувають різні: цілі десяткові (<code>42</code>), шістнадцяткові (<code>0xFF</code>), двійкові (<code>0b1010</code>), вісімкові з нулем попереду (<code>017</code>, і це пастка: <code>017</code> дорівнює 15), довгі (<code>42L</code>), дробові (<code>3.14</code>, <code>1e3</code>), типу float (<code>3.14f</code>), символьні (<code>'A'</code>) і рядкові (<code>"text"</code>). Підкреслення в числових літералах (<code>1_000_000</code>) дозволені й ігноруються.`,
      String.raw`<code>final</code> робить незмінною змінну, а не об'єкт, на який вона вказує. Для примітивів і рядків різниці немає, але для масивів і колекцій <code>final</code> лише забороняє присвоїти змінній інший об'єкт, а вміст змінювати можна. Докладніше про це в главі про класи й посилання.`,
      String.raw`Для набору пов'язаних значень (дні тижня, статуси) використовують не окремі константи, а <code>enum</code>, про який буде окремий урок. Окремі константи добре підходять для чисел і рядків із фіксованим змістом: межі, формати, тайм-аути, назви налаштувань. Одне місце для кожного значення дає менше помилок, ніж однакові числа, розкидані по коду.`,
      String.raw`Компілятор знає значення констант ще на етапі компіляції й підставляє їх прямо в код. Через це зміна <code>static final</code>-константи в одній бібліотеці без перекомпіляції залежного коду може не подіяти. У навчальних програмах цього не видно, але у великих проєктах це пояснює дивні випадки зі «старими» значеннями.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        final int days = 7;
        final double rate;   // значення можна задати пізніше, але лише один раз
        rate = 0.25;
        System.out.println(days + " " + rate);
    }
}`,
      String.raw`public class Main {
    static final int TAX_PERCENT = 20;
    static final String CURRENCY = "UAH";

    public static void main(String[] args) {
        int net = 250;
        int gross = net + net * TAX_PERCENT / 100;
        System.out.println(gross + " " + CURRENCY);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println(0xFF);        // 255
        System.out.println(0b1010);      // 10
        System.out.println(017);         // 15: вісімковий літерал, нуль попереду
        System.out.println(1_000_000);
        System.out.println(42L + " " + 3.14f + " " + 1e3);
    }
}`,
      String.raw`// не компілюється: final-змінній не можна присвоїти нове значення
public class Main {
    public static void main(String[] args) {
        final int limit = 10;
        limit = 20;
        System.out.println(limit);
    }
}`,
      String.raw`// не компілюється: final-змінній значення вже присвоєно, друге присвоєння заборонене
public class Main {
    public static void main(String[] args) {
        final int x;
        x = 1;
        x = 2;
        System.out.println(x);
    }
}`,
    ],
    note: String.raw`Константи пишуть великими літерами й виносять угору класу. Замість числа 20 у формулі краще <code>TAX_PERCENT</code>: формула читається без пояснень, а змінити податок можна в одному місці.`,
    work: String.raw`У реальних проєктах константи збирають в окремі класи чи файли налаштувань: адреси сервісів, ліміти, формати дат, назви полів. Магічні числа підсвічують і лінтери, і рев'юери. Одне ім'я замість розкиданих чисел — це різниця між правкою в одному місці й пошуком по всьому проєкту.`,
    tasks: [
      String.raw`Чому <code>final int x = 5; x = 6;</code> не скомпілюється, а <code>int y = 5; y = 6;</code> — скомпілюється?`,
      String.raw`Замініть магічні числа в рядку <code>double cost = hours * 150 * 1.2;</code> іменованими константами й поясніть, що це дає.`,
    ],
  },
  {
    t: "Рядки: String, методи й незмінність",
    ch: "Основи мови",
    easy: String.raw`Рядок у Java — це кам'яна табличка: її вміст не міняють, а при кожній «правці» вирізають нову табличку. Методи String лише повертають новий текст, а старий лишається як був.`,
    p: [
      String.raw`<code>String</code> — не примітив, а клас: рядок є об'єктом із методами. Літерал у подвійних лапках створює рядок автоматично. Довжина — <code>length()</code>, символ за індексом — <code>charAt(i)</code>, а індекси починаються з нуля. Рядки зберігають текст у кодуванні UTF-16, тому українські літери й більшість символів працюють без додаткових зусиль.`,
      String.raw`Найважливіша властивість рядків — незмінність. Жоден метод не змінює рядок: <code>s.toUpperCase()</code> повертає новий рядок, а <code>s</code> лишається таким, як був. Типова помилка — викликати метод і не використати результат: <code>s.trim();</code> нічого не змінює. Правильно: <code>s = s.trim();</code> або <code>String t = s.trim();</code>. Незмінність дає безпеку: рядок можна передавати будь-куди й не боятися, що його хтось зіпсує.`,
      String.raw`Вміст рядків порівнюють методом <code>equals</code>, а не <code>==</code>. Оператор <code>==</code> порівнює посилання, тобто чи це один і той самий об'єкт, і результат залежить від способу створення: літерали з однаковим текстом JVM тримає в одному місці, а <code>new String("a")</code> створює окремий об'єкт. Без урахування регістру порівнює <code>equalsIgnoreCase</code>, а для впорядкування є <code>compareTo</code>.`,
      String.raw`Набір методів для щоденної роботи: <code>substring(from, to)</code> (кінець не входить), <code>indexOf</code> (позиція або -1), <code>contains</code>, <code>startsWith</code>, <code>endsWith</code>, <code>replace</code>, <code>toUpperCase</code>, <code>toLowerCase</code>, <code>trim</code> та <code>strip</code> (прибирають пробіли по краях), <code>isEmpty</code> та <code>isBlank</code> (порожній і лише з пробілів), <code>repeat(n)</code>. Метод <code>split(regex)</code> розбиває рядок на частини, а <code>String.join(sep, a, b, c)</code> склеює їх назад.`,
      String.raw`Склеювання оператором <code>+</code> зручне для кількох частин, але в циклі створює багато проміжних рядків. Для збирання тексту по частинах є <code>StringBuilder</code>, а вираз <code>new StringBuilder("abc").reverse().toString()</code> перевертає рядок. Докладно про нього поговоримо в главі про стандартну бібліотеку, а поки вживайте його лише для перевертання.`,
      String.raw`Помилки меж: <code>charAt</code> і <code>substring</code> з індексом за межами рядка кидають <code>StringIndexOutOfBoundsException</code>. Індекс останнього символу дорівнює <code>length() - 1</code>. Метод <code>substring(2, 5)</code> бере символи з індексами 2, 3 і 4. Коли індекс залежить від даних, спершу перевіряйте довжину.`,
      String.raw`Для багаторядкового тексту з Java 15 є текстові блоки в потрійних лапках: вони зручні для JSON, SQL і HTML, бо не вимагають екранувати лапки та переноси рядків. Звичайні рядки з <code>\n</code> теж лишаються в ужитку, особливо для коротких повідомлень. Тому для короткого тексту беріть звичайний літерал, а для довгого з кількох рядків — текстовий блок.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        String s = "  Java Course  ";
        System.out.println(s.length());
        System.out.println(s.trim().toUpperCase());
        System.out.println(s.trim().charAt(0));
        System.out.println(s.trim().substring(5));
        System.out.println(s.contains("Course") + " " + s.indexOf("Course"));
        System.out.println("a,b,c".replace(",", ";") + " " + "ab".repeat(3));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        System.out.println(a == b);        // true: літерали з одного місця
        System.out.println(a == c);        // false: різні об'єкти
        System.out.println(a.equals(c));   // true: вміст однаковий
        System.out.println("JAVA".equalsIgnoreCase(a));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        String s = "  hello ";
        s.trim();                      // результат загублено: s не змінилася
        System.out.println("[" + s + "]");
        s = s.trim();                  // правильно: присвоюємо результат
        System.out.println("[" + s + "]");
    }
}`,
      String.raw`// аварія: substring виходить за межі рядка, StringIndexOutOfBoundsException
public class Main {
    public static void main(String[] args) {
        String word = "Java";
        System.out.println(word.substring(1, 3));
        System.out.println(word.substring(2, 9));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        String title = "  Hello   World From Java ";
        String slug = String.join("-", title.trim().toLowerCase().split("\\s+"));
        System.out.println(slug);
        System.out.println(new StringBuilder("Java").reverse().toString());
        String word = "Level";
        System.out.println(word.equalsIgnoreCase(new StringBuilder(word).reverse().toString()));
    }
}`,
    ],
    note: String.raw`Рядки незмінні: <code>s.trim()</code> без присвоєння нічого не змінює. А вміст порівнюйте завжди через <code>equals</code>: оператор <code>==</code> порівнює посилання на об'єкти, і результат може здивувати.`,
    work: String.raw`Обробка введення користувача (обрізати пробіли, привести регістр, розбити на слова) — найтиповіша робота з рядками. Роботи з текстом у коді дуже багато: поля форм, адреси, назви файлів, відповіді API. Тому методи String вивчають напам'ять, а на код-рев'ю порівняння через <code>==</code> одразу позначають як помилку.`,
    tasks: [
      String.raw`Чому окремий рядок <code>name.toUpperCase();</code> не змінює змінну name?`,
      String.raw`Що виведе <code>"Java".substring(1, 3)</code> і яким може бути найбільший другий індекс для цього рядка?`,
    ],
  },
  {
    t: "Перетворення типів: приведення й розбір рядків",
    ch: "Основи мови",
    easy: String.raw`Приведення типів схоже на переливання води між посудинами: з меншої у більшу вона переходить без втрат, а з більшої у меншу щось може розлитися, тому Java вимагає вашого явного підпису.`,
    p: [
      String.raw`Розширення — безпечне перетворення меншого типу у більший, воно відбувається автоматично: <code>int</code> до <code>long</code> чи <code>double</code>, <code>char</code> до <code>int</code>. Порядок: byte, short, int, long, float, double. Звуження навпаки може втрачати дані, тому вимагає явного приведення в дужках: <code>int x = (int) 3.99;</code> дає <code>3</code>, бо дробова частина відкидається, а не округлюється.`,
      String.raw`Без явного приведення компілятор не дозволить звуження: <code>int x = 3.5;</code> дає помилку «incompatible types: possible lossy conversion from double to int». Це підтвердження наміру: пишучи <code>(int)</code>, ви визнаєте, що розумієте, що буде втрачено. Те саме для <code>long</code> в <code>int</code> і <code>int</code> в <code>byte</code>: старші біти відкидаються, і значення може змінитися непередбачувано, наприклад <code>(byte) 200</code> дає <code>-56</code>.`,
      String.raw`Змішані вирази підтягуються до ширшого типу: <code>int + double</code> стає double, а <code>int / int</code> лишається int. Звідси найчастіша помилка в середніх значеннях: <code>(a + b) / 2</code> для цілих відкидає дробову частину. Лікують приведенням <b>до</b> ділення: <code>(double) sum / count</code> (приведення діє на sum, а не на результат) або <code>sum / 2.0</code>. Приведення після ділення запізнюється.`,
      String.raw`Округлення: <code>(int)</code> відкидає дріб, а <code>Math.round(x)</code> округлює до найближчого цілого (для double повертає <code>long</code>). Для округлення до двох знаків часто пишуть <code>Math.round(x * 100) / 100.0</code>. Для показу з фіксованою кількістю знаків краще форматування, про яке йтиметься в наступному уроці.`,
      String.raw`Рядки в числа: <code>Integer.parseInt("42")</code>, <code>Double.parseDouble("3.5")</code>, <code>Long.parseLong</code>, <code>Boolean.parseBoolean</code>. Якщо текст не схожий на число, кидається <code>NumberFormatException</code>. Тому дані від користувача, з файлів і з мережі розбирають із перевіркою або обробкою помилки (їй присвячена окрема глава). Пробіли навколо числа теж ламають розбір, тому спершу викликають <code>trim()</code>.`,
      String.raw`Числа в рядки: <code>String.valueOf(42)</code>, <code>Integer.toString(42)</code> або просто <code>"" + 42</code>. Символи й числа: <code>(int) 'A'</code> дає 65, <code>(char) 66</code> дає <code>'B'</code>, а <code>'7' - '0'</code> дає число 7: так цифру-символ перетворюють на значення. Перевірити символ допомагають <code>Character.isDigit</code> і <code>Character.isLetter</code>.`,
      String.raw`Складені оператори присвоєння (<code>+=</code>, <code>*=</code>) мають приховане приведення: <code>byte b = 10; b += 5;</code> компілюється, а <code>b = b + 5;</code> — ні, бо <code>b + 5</code> має тип int. Це зручно, але може сховати втрату даних. Ще нюанс: <code>int</code> у <code>float</code> на великих числах втрачає точність, бо у float лише 24 значущі біти.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        int small = 7;
        long wide = small;          // розширення: автоматично
        double d = small;
        System.out.println(wide + " " + d);
        System.out.println((int) 3.99);       // 3: дріб відкинуто
        System.out.println(Math.round(3.99)); // 4: округлення
        System.out.println((byte) 200);       // -56: старші біти втрачено
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int sum = 13, count = 3;
        System.out.println(sum / count);                   // 4: цілочисельне ділення
        System.out.println((double) sum / count);          // 4.333...
        System.out.println((double) (sum / count));        // 4.0: приведення запізнилось
        System.out.println(Math.round((double) sum / count * 100) / 100.0);   // 4.33
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int n = Integer.parseInt("  15 ".trim());
        double price = Double.parseDouble("3.5");
        System.out.println(n + 5);
        System.out.println(price * 2);
        System.out.println(String.valueOf(42) + "!");
        System.out.println((int) 'A' + " " + (char) 66 + " " + ('7' - '0'));
    }
}`,
      String.raw`// аварія: рядок abc не схожий на число, NumberFormatException
public class Main {
    public static void main(String[] args) {
        System.out.println(Integer.parseInt("42"));
        System.out.println(Integer.parseInt("abc"));
    }
}`,
      String.raw`// не компілюється: звуження double до int без явного приведення, lossy conversion
public class Main {
    public static void main(String[] args) {
        int x = 3.9;
        System.out.println(x);
    }
}`,
    ],
    note: String.raw`Приведення <code>(double)</code> треба ставити до ділення: <code>(double) sum / count</code>. Вираз <code>(double) (sum / count)</code> спершу виконає цілочисельне ділення й лише потім перетворить уже втрачений результат. А <code>(int)</code> дробове число не округлює, а відкидає дріб.`,
    work: String.raw`Дані з форм, файлів і мережі завжди приходять рядками, тому <code>parseInt</code> і <code>parseDouble</code> зустрічаються постійно, а разом із ними й <code>NumberFormatException</code>. Середні значення, відсотки й частки на цілих числах — одне з найчастіших джерел «неправильних» звітів: розробник забув привести тип до ділення.`,
    tasks: [
      String.raw`Що виведе <code>int a = 7, b = 2; System.out.println((double) (a / b));</code> і як виправити, щоб вийшло 3.5?`,
      String.raw`Напишіть код, який перетворює рядок <code>"  15 "</code> на число й додає до нього 5.`,
    ],
  },
  {
    t: "Форматований вивід: printf і String.format",
    ch: "Основи мови",
    easy: String.raw`printf — це шаблон листа з пропусками: у тексті ставите позначки %d, %s, %.2f, а Java вставляє на їхні місця значення й охайно їх форматує.`,
    p: [
      String.raw`Метод <code>System.out.printf(формат, значення...)</code> друкує рядок за шаблоном. У шаблоні звичайний текст змішано зі специфікаторами, які починаються з <code>%</code>, і кожен специфікатор бере наступне значення зі списку. Метод <code>String.format</code> працює так само, але повертає рядок, а не друкує. Починаючи з Java 15 існує ще й запис <code>"...".formatted(args)</code>.`,
      String.raw`Основні специфікатори: <code>%d</code> — ціле, <code>%s</code> — рядок або будь-який об'єкт, <code>%f</code> — дробове, <code>%c</code> — символ, <code>%b</code> — boolean, <code>%x</code> — шістнадцяткове, <code>%n</code> — перенесення рядка, <code>%%</code> — сам знак відсотка. Перенесення <code>%n</code> краще за <code>\n</code>, бо враховує систему. Для <code>%f</code> без уточнення виводиться шість знаків після крапки, тому майже завжди пишуть <code>%.2f</code>.`,
      String.raw`Між відсотком і літерою можна вказати ширину й вирівнювання: <code>%5d</code> — не менше п'яти позицій, праворуч; <code>%-8s</code> — ліворуч на 8 позицій; <code>%05d</code> — доповнити нулями; <code>%,d</code> — розділювач тисяч; <code>%+d</code> — завжди зі знаком; <code>%8.2f</code> — ширина 8 і два знаки після крапки. Саме так друкують охайні таблиці: заголовок і рядки з однаковою шириною колонок.`,
      String.raw`Пастка локалі: <code>%.2f</code> підставляє роздільник дробової частини за налаштуваннями системи. На комп'ютері з українською чи німецькою локаллю результат буде <code>599,97</code> з комою. Для передбачуваного виводу (файли, логи, тести) локаль передають першим аргументом: <code>String.format(Locale.US, "%.2f", x)</code>. Для цього потрібен <code>import java.util.Locale;</code>.`,
      String.raw`Кількість і типи значень мають збігатися зі специфікаторами. Якщо вказати <code>%d</code> для дробового числа, буде <code>IllegalFormatConversionException</code>, а якщо значень менше, ніж специфікаторів, — <code>MissingFormatArgumentException</code>. Це помилки виконання, а не компіляції: рядок шаблону компілятор не перевіряє, тому тестуйте всі гілки виводу.`,
      String.raw`Форматування лише змінює вигляд, а не значення: <code>%.2f</code> округлює «від половини вгору» (<code>0.25</code> дасть <code>0.3</code> при <code>%.1f</code>), але сама змінна лишається такою, як була. Для грошей зберігайте точне значення, а показуйте відформатоване. Не округлюйте число лише заради виводу.`,
      String.raw`Якщо той самий формат потрібен у кількох місцях, зручно мати шаблон-константу: <code>static final String ROW = "%-10s %5d%n";</code> і викликати <code>System.out.printf(ROW, name, qty)</code>. Це зменшує повторення й гарантує однаковий вигляд рядків таблиці. Ще одна порада: перевіряйте вивід на коротких зразках, бо помилку у специфікаторі видно лише під час запуску, а одна забута літера в шаблоні псує цілий звіт. Для таблиць зручно друкувати заголовок тим самим шаблоном, що й рядки: тоді колонки гарантовано збігаються.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        double price = 199.99;
        int qty = 3;
        System.out.printf("Total: %.2f%n", price * qty);
        System.out.printf("Items: %d, name: %s, ok: %b%n", qty, "pen", true);
        System.out.printf("Discount: 15%%%n");
    }
}`,
      String.raw`import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        System.out.println(String.format(Locale.US, "%-8s|%5s|%8s", "Item", "Qty", "Price"));
        System.out.println(String.format(Locale.US, "%-8s|%5d|%8.2f", "Pen", 3, 1.5));
        System.out.println(String.format(Locale.US, "%-8s|%5d|%8.2f", "Notebook", 12, 24.99));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println(String.format("%05d", 42));
        System.out.println(String.format("%,d", 1234567));
        System.out.println(String.format("%x", 255));
        System.out.println(String.format("%+d", 7));
        System.out.println("%s has %d items".formatted("cart", 3));
    }
}`,
      String.raw`// аварія: %d не підходить для дробового числа, IllegalFormatConversionException
public class Main {
    public static void main(String[] args) {
        System.out.printf("Count: %d%n", 3);
        System.out.printf("Count: %d%n", 2.5);
    }
}`,
      String.raw`// аварія: значень менше, ніж специфікаторів, MissingFormatArgumentException
public class Main {
    public static void main(String[] args) {
        System.out.printf("%s and %s%n", "one");
    }
}`,
    ],
    note: String.raw`Специфікатор має відповідати типу значення: <code>%d</code> лише для цілих, <code>%f</code> для дробових. Помилку знайде не компілятор, а виконання, бо рядок шаблону він не перевіряє. Для передбачуваного виводу передавайте <code>Locale.US</code>.`,
    work: String.raw`Форматований вивід потрібен у звітах, чеках, логах і консольних утилітах: охайні колонки, суми з двома знаками, вирівнювання. У Java-проєктах для логів частіше використовують шаблони логера з фігурними дужками, а <code>String.format</code> вживають для текстів, які показують людині.`,
    tasks: [
      String.raw`Який специфікатор виведе число 7 як <code>007</code>?`,
      String.raw`Чому <code>System.out.printf("%d", 2.5)</code> падає під час виконання, а не під час компіляції?`,
    ],
  },
  {
    t: "Умови: if, else і тернарний оператор",
    ch: "Основи мови",
    easy: String.raw`Умова — це розвилка на дорозі: програма перевіряє питання «так чи ні» й іде одним зі шляхів. Оператор if ставить питання, а else підказує, куди йти, коли відповідь «ні».`,
    p: [
      String.raw`Оператор <code>if (умова) { ... } else { ... }</code> виконує блок, коли умова, вираз типу <code>boolean</code>, істинна. На відміну від JavaScript чи Python, у Java умова мусить бути саме <code>boolean</code>: число чи рядок не можна використати як «істину». Тому <code>if (count)</code> для <code>int count</code> не скомпілюється, а треба писати <code>if (count != 0)</code>.`,
      String.raw`Порівняння: <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>. Логічні оператори: <code>&amp;&amp;</code> (і), <code>||</code> (або), <code>!</code> (не). Найвищий пріоритет у <code>!</code>, потім <code>&amp;&amp;</code>, потім <code>||</code>, а дужки роблять умову читабельною. Часта помилка — <code>=</code> замість <code>==</code>: у Java <code>if (x = 5)</code> не скомпілюється, бо присвоєння дає int, а не boolean, і це захищає від старої біди мови C.`,
      String.raw`Ланцюжок <code>else if</code> перевіряє умови згори вниз до першої істинної, решта пропускається. Порядок має значення: спершу пишуть вужчі умови. Фігурні дужки можна пропустити для одного рядка, але так робити не варто: у <code>if (a) x(); y();</code> виклик <code>y()</code> виконається завжди, а відступ вводить в оману. У більшості стилів дужки обов'язкові.`,
      String.raw`Оператори <code>&amp;&amp;</code> і <code>||</code> ліниві (short-circuit): якщо результат уже відомий за лівою частиною, права не виконується. Це не лише оптимізація, а й захист: <code>b != 0 &amp;&amp; a / b &gt; 1</code> ніколи не ділить на нуль. Якщо поміняти частини місцями, вийде <code>ArithmeticException</code>. Є й нелінивні <code>&amp;</code> та <code>|</code>, які завжди обчислюють обидві частини, але потрібні вони рідко.`,
      String.raw`Тернарний оператор <code>умова ? значення1 : значення2</code> є виразом, а не інструкцією: він повертає значення. Запис <code>String label = age &gt;= 18 ? "adult" : "minor";</code> коротший за if/else. Не вкладайте тернарні оператори один в один, бо код швидко стає нечитабельним. Тернарний оператор добре підходить для вибору з двох значень, а if — для вибору між діями.`,
      String.raw`Рядки порівнюють через <code>equals</code>, дробові числа порівнюють із допуском, символи й числа — звичайними операторами. Для багатьох значень однієї змінної краще <code>switch</code>, про нього буде окремий урок. Ранній вихід робить код плоским: перевіряйте «погані» випадки першими й завершуйте метод, замість того щоб вкладати блоки на кілька рівнів.`,
      String.raw`Булеві змінні з промовистими іменами роблять умови зрозумілими: <code>boolean isAdult = age &gt;= 18;</code> і далі <code>if (isAdult &amp;&amp; hasTicket)</code>. Не пишіть <code>if (flag == true)</code>: досить <code>if (flag)</code>. А замість <code>if (x) return true; else return false;</code> пишуть просто <code>return x;</code>.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        int score = 83;
        if (score >= 90) {
            System.out.println("A");
        } else if (score >= 75) {
            System.out.println("B");
        } else if (score >= 60) {
            System.out.println("C");
        } else {
            System.out.println("F");
        }
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int age = 20;
        boolean hasTicket = true;
        boolean isAdult = age >= 18;
        String label = isAdult ? "adult" : "minor";
        System.out.println(label);
        if (isAdult && hasTicket) {
            System.out.println("welcome");
        }
        System.out.println(!hasTicket || age < 12);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int a = 10, b = 0;
        // ліва частина хибна, тому ділення не виконується
        if (b != 0 && a / b > 1) {
            System.out.println("big");
        } else {
            System.out.println("safe");
        }
    }
}`,
      String.raw`// аварія: перевірка b != 0 стоїть після ділення, тож ділення на нуль виконується першим
public class Main {
    public static void main(String[] args) {
        int a = 10, b = 0;
        if (a / b > 1 && b != 0) {
            System.out.println("big");
        }
    }
}`,
      String.raw`// не компілюється: присвоєння замість порівняння, в умові має бути boolean
public class Main {
    public static void main(String[] args) {
        int x = 3;
        if (x = 5) {
            System.out.println("five");
        }
    }
}`,
    ],
    note: String.raw`Умова в Java має бути типу <code>boolean</code>, а оператор <code>&amp;&amp;</code> не обчислює праву частину, якщо результат уже зрозумілий. Користуйтеся цим: спершу безпечна перевірка (<code>b != 0</code>), потім небезпечна дія (<code>a / b</code>).`,
    work: String.raw`Розгалуження — основа бізнес-логіки: перевірка прав доступу, валідація форм, розрахунок знижок. На код-рев'ю цінують ранні виходи й іменовані булеві змінні, а глибоку вкладеність і громіздкі умови просять спростити. Невеликі умови краще виносити в окремі методи з промовистою назвою.`,
    tasks: [
      String.raw`Чому <code>if (x = 5)</code> у Java не скомпілюється, а в мові C — компілюється?`,
      String.raw`Запишіть умову «число n лежить у діапазоні від 10 до 20 включно» через <code>&amp;&amp;</code>.`,
    ],
  },
  {
    t: "Цикли: for, while і do-while",
    ch: "Основи мови",
    easy: String.raw`Цикл — це конвеєр: той самий набір дій повторюється для кожного виробу, доки не виконається умова зупинки. Конвеєром керує лічильник або умова.`,
    p: [
      String.raw`Цикл <code>for</code> має три частини: <code>for (int i = 0; i &lt; 5; i++) { ... }</code> — ініціалізація (один раз), умова (перед кожним кроком) і крок (після кожного). Змінна <code>i</code> існує лише в циклі. Це найпоширеніший цикл, коли відомо, скільки разів повторювати. Лічильник за традицією називають <code>i</code>, <code>j</code>, <code>k</code>, а лічба починається з нуля, бо так влаштовані індекси рядків і масивів.`,
      String.raw`Цикл <code>while (умова) { ... }</code> перевіряє умову перед кожним проходом і підходить, коли кількість повторів невідома: «читати, поки не закінчився вхід», «ділити, поки значення не стане меншим за поріг». Якщо умова з самого початку хибна, тіло не виконається жодного разу. Змінна з умови має змінюватися в тілі, інакше цикл буде нескінченним.`,
      String.raw`Цикл <code>do { ... } while (умова);</code> виконує тіло щонайменше один раз, а умову перевіряє після. Потрібен він рідко: наприклад, коли спершу треба прочитати значення, а потім вирішити, чи повторювати. Зверніть увагу на крапку з комою після умови: це частина синтаксису.`,
      String.raw`Вкладені цикли: зовнішній керує рядками, внутрішній — стовпцями. Таблиця множення — класична задача: <code>for (int i = 1; i &lt;= 9; i++) for (int j = 1; j &lt;= 9; j++) ...</code>. Кількість кроків множиться: цикл у циклі по тисячі елементів — це мільйон кроків, тому вкладення використовують обережно.`,
      String.raw`Типові помилки циклів. Зсув на одиницю (off-by-one): <code>i &lt;= n</code> замість <code>i &lt; n</code> дає зайвий крок. Нескінченний цикл: у <code>while</code> забули змінювати лічильник. Зміна лічильника всередині тіла <code>for</code> збиває рахунок. Крапка з комою після дужок <code>for (...);</code> робить тіло порожнім: цикл крутиться вхолосту, а наступний блок виконується лише раз.`,
      String.raw`Типові задачі циклів: сума й добуток (накопичувач, ініціалізований нулем чи одиницею), пошук мінімуму й максимуму, підрахунок елементів за умовою, генерація послідовностей. Накопичувач оголошують перед циклом, а не всередині: інакше він скидається на кожному кроці. Лічильник типу <code>double</code> небезпечний через похибки, тож для лічби беруть цілі числа.`,
      String.raw`Для перебору елементів колекції є «for-each»: <code>for (int x : numbers)</code>. Його розберемо в главі про колекції разом із масивами. А поки що <code>for</code>, <code>while</code> і <code>do-while</code> закривають майже будь-яку потребу, а інструкції <code>break</code> і <code>continue</code> з окремого уроку дозволяють керувати проходом зсередини.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
        }
        System.out.println("sum = " + sum);
        for (int i = 10; i > 0; i -= 3) {
            System.out.println(i);
        }
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int n = 100;
        int steps = 0;
        while (n > 1) {
            n /= 2;
            steps++;
        }
        System.out.println(steps);
        int k = 10;
        do {
            System.out.println("k = " + k);   // виконається один раз, хоча умова хибна
        } while (k < 5);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                System.out.print(i * j + " ");
            }
            System.out.println();
        }
    }
}`,
      String.raw`// аварія: умова i <= length() дає зайвий крок, charAt кидає StringIndexOutOfBoundsException
public class Main {
    public static void main(String[] args) {
        String word = "Java";
        for (int i = 0; i <= word.length(); i++) {
            System.out.println(word.charAt(i));
        }
    }
}`,
      String.raw`// не компілюється: змінна i існує лише всередині циклу for
public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 3; i++) {
            System.out.println(i);
        }
        System.out.println(i);
    }
}`,
    ],
    note: String.raw`Межа <code>i &lt; n</code> дає рівно n кроків від нуля, а <code>i &lt;= n</code> дає n + 1 і найчастіше буває помилкою. Накопичувач (суму, лічильник) оголошуйте до циклу, а не всередині нього.`,
    work: String.raw`Цикли обробляють списки записів, рядки файлів, відповіді API й порції даних. У виробничому коді прості цикли з лічильником трапляються рідше за цикли за колекцією чи потоки, але пошук, накопичення й вкладене порівняння на них ґрунтуються. Вони ж найчастіше й ламаються: зсув на одиницю — класична помилка.`,
    tasks: [
      String.raw`Скільки разів виконається тіло <code>for (int i = 1; i &lt;= 10; i += 3)</code> і які значення прийме i?`,
      String.raw`Напишіть цикл, який знаходить суму всіх чисел від 1 до 100, кратних 7.`,
    ],
  },
  {
    t: "Оператор switch: старий і сучасний",
    ch: "Основи мови",
    easy: String.raw`switch — це комутатор на пульті: ви набираєте значення, і виклик іде рівно в потрібну кімнату, замість того щоб питати про кожну по черзі. Сучасна стрілка не дає провалитися в сусідню кімнату.`,
    p: [
      String.raw`Оператор <code>switch</code> вибирає гілку за значенням виразу: <code>int</code>, <code>char</code>, <code>String</code>, <code>enum</code> та їхні обгортки (з Java 21 ще й за образцем, про що в главі про інтерфейси). Він замінює довгий ланцюжок <code>else if</code>, коли одна змінна порівнюється з багатьма значеннями: день тижня, код статусу, команда.`,
      String.raw`Класична форма: <code>switch (d) { case 1: ...; break; case 2: ...; break; default: ... }</code>. Без <code>break</code> виконання «провалюється» (fall-through) у наступну гілку: це джерело старих помилок і привід для спеціальних правил стилю. Гілка <code>default</code> виконується, коли жодне значення не збіглося, і її прийнято ставити останньою.`,
      String.raw`Сучасна форма (Java 14): <code>case 1 -&gt; ...;</code>. Стрілка виконує лише свою гілку, провалу немає, <code>break</code> не потрібен. Кілька значень в одній гілці задають через кому: <code>case 6, 7 -&gt; "weekend"</code>. Для кількох інструкцій беруть блок у фігурних дужках. Стрілкова форма коротша й безпечніша, тому в новому коді вживають саме її.`,
      String.raw`Switch може бути виразом, що повертає значення: <code>String name = switch (d) { case 1 -&gt; "Mon"; case 2 -&gt; "Tue"; default -&gt; "Other"; };</code>. Вираз зобов'язаний покривати всі можливі значення: для <code>int</code> і <code>String</code> це означає обов'язковий <code>default</code>, інакше помилка «the switch expression does not cover all possible input values». Для <code>enum</code> default можна пропустити, якщо перелічено всі константи.`,
      String.raw`У блоці всередині switch-виразу результат повертають через <code>yield</code>: <code>case 3 -&gt; { int x = ...; yield x * 2; }</code>. Це потрібно, коли гілка складніша за один вираз. Не змішуйте в одному switch двокрапку й стрілку: компілятор це забороняє.`,
      String.raw`Рядки в switch порівнюються через <code>equals</code> з урахуванням регістру, тому <code>case "stop"</code> не збігається зі словом <code>"STOP"</code>. Значення в <code>case</code> мають бути константами й не повторюватися. Діапазони (<code>case 1..5</code>) не підтримуються: для них беруть <code>if</code> або групують значення арифметикою, наприклад діленням.`,
      String.raw`Класичний приклад — FizzBuzz: для чисел від 1 до 15 вивести <code>Fizz</code> для кратних 3, <code>Buzz</code> для кратних 5 і <code>FizzBuzz</code> для кратних обом. Найсуворішу умову (кратність 15) перевіряють першою. Це вправа на цикл і умову, а switch допомагає, коли значень для вибору мало й вони відомі наперед, наприклад назви днів.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        int d = 2;
        switch (d) {
            case 1:
                System.out.println("Mon");
                break;
            case 2:
                System.out.println("Tue");   // без break виконання провалиться далі
            case 3:
                System.out.println("Wed");
                break;
            default:
                System.out.println("Other");
        }
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int d = 6;
        switch (d) {
            case 1, 2, 3, 4, 5 -> System.out.println("workday");
            case 6, 7 -> System.out.println("weekend");
            default -> System.out.println("unknown");
        }
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int code = 500;
        String text = switch (code) {
            case 200 -> "OK";
            case 404 -> "Not Found";
            case 500 -> {
                String base = "Server";
                yield base + " Error";
            }
            default -> "Other";
        };
        System.out.println(code + " " + text);
    }
}`,
      String.raw`// не компілюється: switch-вираз не покриває всіх значень int, потрібен default
public class Main {
    public static void main(String[] args) {
        int d = 2;
        String name = switch (d) {
            case 1 -> "Mon";
            case 2 -> "Tue";
        };
        System.out.println(name);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            if (i % 15 == 0) {
                System.out.println("FizzBuzz");
            } else if (i % 3 == 0) {
                System.out.println("Fizz");
            } else if (i % 5 == 0) {
                System.out.println("Buzz");
            } else {
                System.out.println(i);
            }
        }
    }
}`,
    ],
    note: String.raw`Стрілка <code>-&gt;</code> виконує лише свою гілку, а двокрапка без <code>break</code> «провалюється» в наступну. Switch-вираз має покривати всі значення: для int і String без <code>default</code> він не скомпілюється.`,
    work: String.raw`Switch зручний для обробки команд, кодів статусу HTTP, типів подій і значень enum. У сучасному коді його пишуть у стрілковій формі й часто як вираз, що повертає значення. Ця конструкція разом з enum і образцями з Java 21 витісняє довгі ланцюжки if/else там, де вибір ведуть за значенням.`,
    tasks: [
      String.raw`Чому в класичному switch без break виконується кілька гілок підряд?`,
      String.raw`Перепишіть <code>if (d == 6 || d == 7) ... else ...</code> як switch-вираз зі стрілками.`,
    ],
  },
  {
    t: "break, continue і мітки",
    ch: "Основи мови",
    adv: true,
    easy: String.raw`break — аварійний вихід із конвеєра, continue — «цей виріб пропускаємо, беремо наступний», а мітка дозволяє вийти з кількох вкладених конвеєрів одразу.`,
    p: [
      String.raw`<code>break</code> негайно завершує найближчий цикл (або <code>switch</code>) і передає керування інструкції після нього. Типове застосування — пошук: щойно знайшли потрібне значення, продовжувати немає сенсу. Цикл «знайти перше число, кратне 7 і 5» виконується лише до першого збігу, а не до кінця діапазону.`,
      String.raw`<code>continue</code> пропускає решту поточного проходу й переходить до наступного: у <code>for</code> — до кроку <code>i++</code> та перевірки умови, у <code>while</code> — одразу до перевірки умови. Він добре прибирає вкладений if: замість «якщо підходить, то зробити ...» пишуть «якщо не підходить, continue», а основна логіка йде далі без відступів.`,
      String.raw`У циклі <code>while</code> разом із <code>continue</code> стежте, щоб крок змінної не опинився після <code>continue</code>: тоді він ніколи не виконається, і цикл зависне. Змінну оновлюють до <code>continue</code>. У <code>for</code> такої пастки немає, бо крок стоїть у заголовку й виконується автоматично.`,
      String.raw`Цикл <code>while (true)</code> з <code>break</code> усередині — поширена конструкція, коли умову виходу зручніше перевіряти посеред тіла: наприклад, «читати команди, доки не прийде quit». Якщо умова виходу проста, краще винести її в заголовок цикла, а <code>while (true)</code> залишити для складних випадків.`,
      String.raw`Мітки (labels) дозволяють вийти не з найближчого, а із зовнішнього циклу: <code>outer: for (...) { for (...) { if (...) break outer; } }</code>. Аналогічно <code>continue outer</code> переходить до наступного кроку зовнішнього циклу. Мітка — це ім'я з двокрапкою перед циклом. Оператора <code>goto</code> у Java немає, хоча слово зарезервоване.`,
      String.raw`Мітки вживають нечасто: у більшості випадків краще винести вкладені цикли в окремий метод і вийти з нього через <code>return</code>. Метод <code>findPair</code> читається краще за цикл із міткою <code>outer</code>. Проте в коротких алгоритмічних задачах (пошук пари в таблиці) мітка цілком доречна.`,
      String.raw`Кілька <code>break</code> в одному циклі ускладнюють розуміння, коли він завершується. Добра практика: один, максимум два виходи, з яких зрозуміла причина. Інструкції <code>break</code> і <code>continue</code> працюють лише всередині циклу (<code>break</code> ще й у <code>switch</code>): поза ним компілятор видасть помилку. Звичка, яка допомагає: перед тим як вставити <code>break</code>, запитайте себе, чи не можна змінити умову в заголовку так, щоб вихід відбувався природно. Часто це робить код коротшим і прибирає потребу пояснювати, чому цикл раптом зупиняється посередині. Пам'ятайте також, що <code>continue</code> у вкладеному циклі впливає лише на внутрішній цикл, якщо не вказати мітку. Це легко перевірити експериментом: додайте до вкладених циклів виведення значень лічильників і простежте, який із двох циклів справді перервався.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 100; i++) {
            if (i % 7 == 0 && i % 5 == 0) {
                System.out.println("first: " + i);
                break;
            }
        }
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            if (i % 2 != 0) {
                continue;          // непарні пропускаємо
            }
            sum += i;
        }
        System.out.println(sum);
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        outer:
        for (int i = 1; i <= 9; i++) {
            for (int j = 1; j <= 9; j++) {
                if (i * j == 42) {
                    System.out.println(i + " x " + j);
                    break outer;     // виходимо з обох циклів
                }
            }
        }
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int n = 1;
        while (true) {
            n *= 2;
            if (n > 100) {
                break;
            }
        }
        System.out.println(n);
    }
}`,
      String.raw`// не компілюється: break поза циклом і поза switch
public class Main {
    public static void main(String[] args) {
        int x = 5;
        if (x > 3) {
            break;
        }
        System.out.println(x);
    }
}`,
    ],
    note: String.raw`<code>break</code> і <code>continue</code> діють лише на найближчий цикл, а щоб вийти із зовнішнього, потрібна мітка: <code>break outer;</code>. У <code>while</code> оновлюйте лічильник до <code>continue</code>, інакше цикл зависне.`,
    work: String.raw`Ранній вихід і пропуск зайвих елементів прибирають вкладені умови й спрощують цикл. Мітки трапляються рідко: у пошуку по таблиці чи сітці. На код-рев'ю частіше просять винести вкладені цикли в метод із <code>return</code>, бо так код читається краще.`,
    tasks: [
      String.raw`Чому цикл <code>while (i &lt; 5) { if (i == 2) continue; i++; }</code> зависне?`,
      String.raw`Знайдіть у таблиці множення 9 на 9 першу пару, добуток якої дорівнює 42, і зупиніть обидва цикли.`,
    ],
  },
  {
    t: "Методи: параметри й результати",
    ch: "Основи мови",
    easy: String.raw`Метод — це кухонний комбайн: ви кладете інгредієнти (параметри), натискаєте кнопку й отримуєте результат. Один раз налаштований, він готує однаково, скільки б разів ви його не запускали.`,
    p: [
      String.raw`Метод — це іменований блок коду, який можна викликати багато разів. Оголошення має вигляд <code>static int add(int a, int b) { return a + b; }</code>: модифікатор, тип результату, ім'я, параметри з типами й тіло. Слово <code>static</code> поки пишемо в усіх методах поряд із <code>main</code>: так їх можна викликати без створення об'єктів (докладно в главі про класи).`,
      String.raw`Виклик виглядає як <code>int s = add(2, 3);</code>. Значення в дужках називаються аргументами й потрапляють у параметри за порядком. Типи перевіряються: <code>add("a", 1)</code> не скомпілюється. Інструкція <code>return</code> повертає значення й одразу завершує метод; тип значення має збігатися з оголошеним або розширюватися до нього.`,
      String.raw`Тип <code>void</code> означає, що результату немає: метод лише виконує дію (друкує, змінює щось). У такому методі <code>return;</code> без значення завершує його достроково. Якщо ж метод оголошено з типом результату, то на кожному шляху виконання має бути <code>return</code>, інакше буде помилка «missing return statement».`,
      String.raw`Параметри примітивних типів — це локальні копії: зміна параметра всередині методу не впливає на змінну поза ним. Усе, що метод хоче повернути, він повертає через <code>return</code>. Саме тому метод не може «поміняти місцями» два числа через параметри. Для об'єктів картина складніша, про це в главі про типи користувача.`,
      String.raw`Метод має робити одну справу й мати назву-дієслово: <code>calculateTotal</code>, <code>isValid</code>, <code>printReport</code>. Методи, що повертають boolean, часто починають із <code>is</code>, <code>has</code>, <code>can</code>. Якщо метод довший за екран або в його назві потрібне слово «і» (<code>readAndSave</code>), його варто розділити. Короткі методи легко тестувати й повторно використовувати.`,
      String.raw`Порядок оголошення методів у класі не важливий: <code>main</code> може викликати метод, оголошений нижче. Змінні, створені в методі, видно лише в ньому. Кілька значень із методу повертають через масив чи спеціальний клас, про що пізніше, а поки що «один метод, один результат».`,
      String.raw`Метод може викликати інший, а також самого себе (рекурсія, окремий урок). Призначення методу коротко описують коментарем <code>/** ... */</code>, якщо назва не пояснює всього. Довгі списки параметрів — сигнал: понад чотири-п'ять параметрів зазвичай означають, що їх варто згрупувати в один об'єкт. Практичне правило перевірки: якщо метод неможливо коротко описати одним реченням, він, імовірно, робить забагато. Так само, якщо тіло складається з кількох блоків, розділених порожніми рядками й коментарями, кожен блок стає кандидатом на власний метод. Малі методи з виразними назвами перетворюють код на розповідь, яку читають згори вниз без зупинок.`,
    ],
    code: [
      String.raw`public class Main {
    static int add(int a, int b) {
        return a + b;
    }

    static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    public static void main(String[] args) {
        int s = add(2, 3);
        System.out.println(s);
        greet("Ira");
        greet("Taras");
    }
}`,
      String.raw`public class Main {
    static boolean isAdult(int age) {
        return age >= 18;
    }

    static String sign(int n) {
        if (n < 0) {
            return "negative";
        }
        if (n == 0) {
            return "zero";
        }
        return "positive";       // ранні return роблять код плоским
    }

    public static void main(String[] args) {
        System.out.println(isAdult(20) + " " + isAdult(12));
        System.out.println(sign(-5) + " " + sign(0) + " " + sign(9));
    }
}`,
      String.raw`public class Main {
    static void tryToChange(int x) {
        x = 100;                 // змінюємо лише локальну копію
    }

    public static void main(String[] args) {
        int value = 5;
        tryToChange(value);
        System.out.println(value);   // 5
    }
}`,
      String.raw`// не компілюється: на шляху n >= 0 немає return, missing return statement
public class Main {
    static String check(int n) {
        if (n < 0) {
            return "negative";
        }
    }

    public static void main(String[] args) {
        System.out.println(check(3));
    }
}`,
      String.raw`// не компілюється: рядок передано в параметр типу int, incompatible types
public class Main {
    static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(add("2", 3));
    }
}`,
    ],
    note: String.raw`Параметри примітивних типів передаються за значенням: метод працює з копією, і зміна параметра не змінює змінну ззовні. Якщо метод оголошено з типом результату, на кожному шляху виконання має бути <code>return</code>.`,
    work: String.raw`Розбиття коду на невеликі методи з промовистими назвами — головна навичка читабельного коду. Рев'юери критикують методи, що роблять багато справ одночасно, і довгі списки параметрів. Окремі маленькі методи ще й набагато легше покривати тестами.`,
    tasks: [
      String.raw`Чому метод <code>static void swap(int a, int b)</code> не може поміняти місцями дві змінні в main?`,
      String.raw`Напишіть метод <code>isEven(int n)</code>, що повертає boolean, і викличте його для чисел від 1 до 5.`,
    ],
  },
  {
    t: "Перевантаження методів і varargs",
    ch: "Основи мови",
    easy: String.raw`Перевантаження схоже на кнопку «друк» у принтері: вона одна, а що саме надрукувати, фото чи текст, залежить від того, що ви їй дали. Методи з однією назвою розрізняються списком параметрів.`,
    p: [
      String.raw`Перевантаження (overloading) — це кілька методів з однаковою назвою, але різними списками параметрів: за кількістю, типами чи порядком типів. Це зручно: <code>area(r)</code> для кола й <code>area(w, h)</code> для прямокутника логічно називаються однаково. У самій бібліотеці Java так працює <code>System.out.println</code>: є версії для int, double, String, char та інших типів.`,
      String.raw`Версію методу компілятор вибирає за типами аргументів ще під час компіляції: спершу точний збіг, потім розширення (<code>int</code> до <code>long</code> до <code>double</code>), потім упаковка (<code>int</code> в <code>Integer</code>) і наприкінці варіативні параметри. Тому виклик <code>area(2)</code> знайде <code>area(double)</code> через розширення int до double.`,
      String.raw`Тип результату в сигнатуру не входить: два методи <code>int f(int a)</code> і <code>double f(int a)</code> в одному класі — помилка «method f(int) is already defined». Імена параметрів теж не розрізняють методи, лише їхні типи й кількість. Сигнатура — це ім'я плюс типи параметрів за порядком.`,
      String.raw`Неоднозначність: якщо жодна версія не підходить краще за інші, компілятор відмовляється вибирати. Наприклад, за наявності <code>f(int, double)</code> і <code>f(double, int)</code> виклик <code>f(1, 2)</code> неоднозначний, бо обидві версії вимагають одного розширення. Вихід — явно привести аргумент: <code>f(1, 2.0)</code>.`,
      String.raw`Варіативні параметри (varargs): <code>static int sum(int... numbers)</code> приймає будь-яку кількість int, зокрема нуль. Усередині <code>numbers</code> — звичайний масив із довжиною <code>numbers.length</code>. Виклики <code>sum()</code>, <code>sum(1)</code> і <code>sum(1, 2, 3)</code> усі коректні. Саме так працюють <code>printf</code> і <code>String.format</code>.`,
      String.raw`Правила varargs: параметр із трьома крапками має бути останнім, і він лише один у методі. Така версія вибирається останньою, коли жодна інша не підійшла. Змішувати перевантаження з varargs і з фіксованою кількістю параметрів варто обережно, бо результат може бути неочевидним.`,
      String.raw`Не зловживайте перевантаженням: якщо методи роблять зовсім різні речі, дайте їм різні назви (як <code>parseInt</code> і <code>parseDouble</code>). Добра межа: однакова мета, різні вхідні дані. Значення за замовчуванням у Java імітують перевантаженням: <code>greet()</code> просто викликає <code>greet("friend")</code>. Корисно пам'ятати й про автоматичну упаковку: виклик методу з параметром <code>Integer</code> для значення <code>int</code> працює, але така версія вибирається лише після того, як відхилено точні збіги й розширення. Тому в публічних бібліотеках перевантаження проєктують особливо обережно, щоб виклики не поводилися несподівано.`,
    ],
    code: [
      String.raw`public class Main {
    static double area(double r) {
        return Math.PI * r * r;
    }

    static double area(double w, double h) {
        return w * h;
    }

    public static void main(String[] args) {
        System.out.printf("%.2f%n", area(2));
        System.out.println(area(3, 4));
    }
}`,
      String.raw`public class Main {
    static int sum(int... numbers) {
        int total = 0;
        for (int i = 0; i < numbers.length; i++) {
            total += numbers[i];
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum());
        System.out.println(sum(5));
        System.out.println(sum(1, 2, 3, 4));
    }
}`,
      String.raw`public class Main {
    static String kind(int x)    { return "int"; }
    static String kind(long x)   { return "long"; }
    static String kind(double x) { return "double"; }

    public static void main(String[] args) {
        System.out.println(kind(5));        // int: точний збіг
        System.out.println(kind(5L));       // long
        System.out.println(kind(5.0f));     // double: float розширюється до double
        System.out.println(kind('a'));      // int: char розширюється до int
    }
}`,
      String.raw`// не компілюється: методи відрізняються лише типом результату, method f(int) is already defined
public class Main {
    static int f(int a) {
        return a;
    }

    static double f(int a) {
        return a * 1.0;
    }

    public static void main(String[] args) {
        System.out.println(f(1));
    }
}`,
      String.raw`// не компілюється: виклик f(1, 2) неоднозначний, reference to f is ambiguous
public class Main {
    static void f(int a, double b) {
        System.out.println("int, double");
    }

    static void f(double a, int b) {
        System.out.println("double, int");
    }

    public static void main(String[] args) {
        f(1, 2);
    }
}`,
    ],
    note: String.raw`Перевантажені методи відрізняє лише список параметрів: тип результату в сигнатуру не входить. Параметр varargs (<code>int... nums</code>) має бути останнім, а всередині методу він є звичайним масивом, і виклик без аргументів дає порожній масив.`,
    work: String.raw`Перевантаження лежить в основі зручних API: конструктори з різною кількістю параметрів, методи <code>of</code> і <code>valueOf</code>, <code>println</code>. Varargs зустрічаються у <code>String.format</code>, <code>Arrays.asList</code> і логерах. Знання правил вибору версії рятує від несподіваних викликів і від помилок про неоднозначність.`,
    tasks: [
      String.raw`Чому <code>int f(int a)</code> і <code>double f(int a)</code> не можуть бути в одному класі?`,
      String.raw`Напишіть метод <code>average(int... nums)</code> і поміркуйте, що він має повертати для виклику без аргументів.`,
    ],
  },
  {
    t: "Рекурсія і стек викликів",
    ch: "Основи мови",
    easy: String.raw`Рекурсія — це матрьошка: щоб розкрити велику, розкриваєш таку саму, лише меншу, і так до найменшої, яка вже не розкривається. Без найменшої матрьошки процес не закінчився б ніколи.`,
    p: [
      String.raw`Рекурсивний метод викликає сам себе, розбиваючи задачу на меншу версію тієї самої задачі. Будь-яка рекурсія має дві обов'язкові частини: <b>базовий випадок</b> (відповідь відома без нових викликів) і <b>рекурсивний крок</b>, що наближає до базового. Класика: <code>n! = n * (n - 1)!</code>, причому <code>0! = 1</code>.`,
      String.raw`Кожен виклик методу кладе в стек потоку новий «кадр» із параметрами й локальними змінними. Рекурсія глибиною 5 створює п'ять кадрів, які знімаються у зворотному порядку, коли досягнуто базового випадку. Стек — не безмежний ресурс: для простих методів він вміщує порядку десяти тисяч кадрів.`,
      String.raw`Якщо базового випадку немає або його не досягти, метод викликає себе, доки стек не переповниться, і JVM кидає <code>StackOverflowError</code>. Це помилка (<code>Error</code>), а не звичайний виняток, і зазвичай вона завершує програму. Питання для перевірки: чи кожен виклик справді просувається до базового випадку, тобто чи параметр зменшується, а не зростає?`,
      String.raw`Приклади: сума цифр числа (<code>n % 10 + digitSum(n / 10)</code>), найбільший спільний дільник за Евклідом (<code>gcd(a, b) = gcd(b, a % b)</code>), числа Фібоначчі, піднесення до степеня. Усі вони природно описуються через самих себе. Для деревоподібних структур (каталоги, вирази, JSON) рекурсія — найпростіший спосіб, тому ви зустрінете її знову.`,
      String.raw`Наївна рекурсія Фібоначчі <code>fib(n) = fib(n-1) + fib(n-2)</code> повторює одні й ті самі обчислення експоненційно багато разів: <code>fib(40)</code> уже помітно повільний. Рішення — запам'ятовувати результати (мемоізація) або написати цикл. Гарний запис не гарантує ефективності.`,
      String.raw`Java не оптимізує хвостову рекурсію: навіть якщо рекурсивний виклик останній у методі, кадр не зникає. Тому для задач із тисячами й мільйонами кроків (обхід довгого списку, лічба до мільйона) пишуть цикл. Рекурсія доречна, коли глибина невелика (логарифмічна або відома наперед), а запис природний.`,
      String.raw`Рекомендації: починайте з базового випадку, перевіряйте найменші входи (0, 1, порожній рядок), переконайтеся, що параметр рухається до бази, і оцініть глибину. Якщо глибина залежить від користувача, не покладайтеся на стек: використайте цикл або власну чергу. Для навчання корисно провести рекурсію вручну на папері: запишіть значення параметрів кожного виклику стовпчиком і простежте, як вони «розкручуються» назад. Так найкраще видно, чому факторіал множить результати саме на виході з викликів, а не на вході, і чому відсутній базовий випадок неминуче закінчується переповненням стека.`,
    ],
    code: [
      String.raw`public class Main {
    static long factorial(int n) {
        if (n <= 1) {
            return 1;                    // базовий випадок
        }
        return n * factorial(n - 1);     // рекурсивний крок
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
        System.out.println(factorial(15));
    }
}`,
      String.raw`public class Main {
    static int digitSum(int n) {
        if (n < 10) {
            return n;
        }
        return n % 10 + digitSum(n / 10);
    }

    static int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    public static void main(String[] args) {
        System.out.println(digitSum(12345));
        System.out.println(gcd(48, 18));
    }
}`,
      String.raw`public class Main {
    static int fib(int n) {
        return n < 2 ? n : fib(n - 1) + fib(n - 2);
    }

    static long power(long base, int exp) {
        if (exp == 0) {
            return 1;
        }
        return base * power(base, exp - 1);
    }

    public static void main(String[] args) {
        System.out.println(fib(10));
        System.out.println(power(2, 10));
    }
}`,
      String.raw`// аварія: у рекурсії немає базового випадку, StackOverflowError
public class Main {
    static int countDown(int n) {
        return countDown(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(countDown(3));
    }
}`,
      String.raw`public class Main {
    static String reverse(String s) {
        if (s.length() <= 1) {
            return s;
        }
        return reverse(s.substring(1)) + s.charAt(0);
    }

    public static void main(String[] args) {
        System.out.println(reverse("recursion"));
    }
}`,
    ],
    note: String.raw`У рекурсії обов'язково мають бути базовий випадок і крок, що до нього наближає. Без цього метод викликає себе, поки стек не переповниться й JVM не кине <code>StackOverflowError</code>. Java не оптимізує хвостові виклики, тож для довгих ланцюжків пишіть цикл.`,
    work: String.raw`Рекурсія природна для деревоподібних даних: обхід каталогів, розбір виразів і JSON, дерева категорій, граф залежностей. Але для масових розрахунків у виробничому коді віддають перевагу циклам: тоді немає ризику переповнити стек на великих вхідних даних. «Перепишіть рекурсію циклом» — типова вправа на співбесіді.`,
    tasks: [
      String.raw`Чому <code>int f(int n) { return n * f(n - 1); }</code> завершиться аварією для будь-якого n?`,
      String.raw`Напишіть рекурсивний метод <code>power(base, exp)</code> для невід'ємних показників степеня.`,
    ],
  },
  {
    t: "Побітові оператори й системи числення",
    ch: "Основи мови",
    adv: true,
    easy: String.raw`Двійкове число — це ряд вимикачів: кожен біт або горить, або ні. Побітові оператори вмикають, вимикають і перевіряють окремі вимикачі, не чіпаючи сусідніх.`,
    p: [
      String.raw`Числа в комп'ютері зберігаються двійково. <code>int</code> має 32 біти, <code>long</code> — 64. Число 10 у двійковій системі це <code>1010</code>, а -1 — усі біти одиниці (так званий доповняльний код). Літерали пишуть як <code>0b1010</code> чи <code>0xFF</code>; для виводу є <code>Integer.toBinaryString(n)</code> і <code>Integer.toHexString(n)</code>, а для зворотного перетворення <code>Integer.parseInt("1010", 2)</code>.`,
      String.raw`Побітові оператори: <code>&amp;</code> (і), <code>|</code> (або), <code>^</code> (виключне або), <code>~</code> (інверсія). Вираз <code>12 &amp; 10</code> дає <code>8</code> (1100 і 1010 дають 1000), <code>12 | 10</code> дає <code>14</code>, а <code>12 ^ 10</code> дає <code>6</code>. XOR цікавий тим, що <code>a ^ a</code> дорівнює 0, а <code>a ^ 0</code> дорівнює a.`,
      String.raw`Зсуви: <code>&lt;&lt;</code> зсув уліво (множення на 2 за кожен біт), <code>&gt;&gt;</code> арифметичний зсув управо (ділення на 2 зі збереженням знака) і <code>&gt;&gt;&gt;</code> логічний зсув управо із заповненням нулями. Вираз <code>1 &lt;&lt; 4</code> дорівнює 16. Кількість зсуву для <code>int</code> береться за модулем 32, тому <code>1 &lt;&lt; 33</code> дорівнює <code>1 &lt;&lt; 1</code>, тобто 2: це пастка.`,
      String.raw`Маски й прапори: набір «увімкнено/вимкнено» зберігають в одному числі, де кожен біт — окремий прапорець. Увімкнути біт <code>k</code>: <code>flags | (1 &lt;&lt; k)</code>. Вимкнути: <code>flags &amp; ~(1 &lt;&lt; k)</code>. Перевірити: <code>(flags &amp; (1 &lt;&lt; k)) != 0</code>. Перемкнути: <code>flags ^ (1 &lt;&lt; k)</code>. Так влаштовані права доступу Unix (rwx), налаштування й мережеві маски.`,
      String.raw`Типові застосування: перевірка парності (<code>n &amp; 1</code>), ділення й множення на ступінь двійки зсувом, пакування кількох значень в одне число (колір RGB: <code>(r &lt;&lt; 16) | (g &lt;&lt; 8) | b</code>), хеш-функції. У сучасному прикладному коді замість масок частіше беруть <code>EnumSet</code> або булеві поля, а бітові маски лишають для продуктивності й протоколів.`,
      String.raw`Готові утиліти: <code>Integer.bitCount(n)</code> рахує одиничні біти, <code>Integer.highestOneBit</code>, <code>Integer.reverse</code>, <code>Long.numberOfTrailingZeros</code>. Їх не варто писати вручну. Системи числення: <code>Integer.toString(255, 16)</code> дає <code>ff</code>, а <code>Integer.parseInt("ff", 16)</code> повертає 255.`,
      String.raw`Пастки: сплутати логічні (<code>&amp;&amp;</code>, <code>||</code>) і побітові (<code>&amp;</code>, <code>|</code>) оператори; забути, що пріоритет <code>==</code> вищий за <code>&amp;</code>, тому <code>flags &amp; 4 == 0</code> розбирається неочікувано й навіть не компілюється (потрібні дужки); сподіватися, що <code>byte</code> зберігає знак при зсуві: значення спершу розширюється до int.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        int n = 10;
        System.out.println(Integer.toBinaryString(n));
        System.out.println(Integer.toHexString(255));
        System.out.println(Integer.parseInt("1010", 2));
        System.out.println(Integer.toBinaryString(-1).length());
        System.out.println(Integer.bitCount(255));
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        System.out.println(12 & 10);
        System.out.println(12 | 10);
        System.out.println(12 ^ 10);
        System.out.println(~12);
        System.out.println(1 << 4);
        System.out.println(-16 >> 2);
        System.out.println(-16 >>> 28);
        System.out.println(1 << 33);    // зсув береться за модулем 32: це 1 << 1
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int flags = 0;
        flags |= 1 << 0;                      // увімкнути біт 0
        flags |= 1 << 2;                      // увімкнути біт 2
        flags &= ~(1 << 0);                   // вимкнути біт 0
        flags ^= 1 << 3;                      // перемкнути біт 3
        System.out.println(Integer.toBinaryString(flags));
        System.out.println((flags & (1 << 2)) != 0);
        int color = (255 << 16) | (128 << 8) | 64;
        System.out.println(Integer.toHexString(color));
    }
}`,
      String.raw`// не компілюється: у двійковому літералі може бути лише 0 і 1
public class Main {
    public static void main(String[] args) {
        int mask = 0b102;
        System.out.println(mask);
    }
}`,
      String.raw`// не компілюється: == має вищий пріоритет за &, тож виходить int & boolean
public class Main {
    public static void main(String[] args) {
        int flags = 5;
        if (flags & 4 == 0) {
            System.out.println("bit 2 is off");
        }
    }
}`,
    ],
    note: String.raw`Зсув <code>&lt;&lt;</code> для int береться за модулем 32: <code>1 &lt;&lt; 33</code> дорівнює 2, а не нулю. А пріоритет <code>==</code> вищий за <code>&amp;</code>, тому перевірку біта завжди беріть у дужки: <code>(flags &amp; 4) != 0</code>.`,
    work: String.raw`Бітові операції зустрічаються в мережевих протоколах, роботі з кольорами, правах доступу, хеш-функціях, стисненні й криптографії. У прикладних системах їх рідше пишуть вручну, але читати чужий код із масками й зсувами доводиться, а на співбесідах про біти питають регулярно.`,
    tasks: [
      String.raw`Що виведе <code>System.out.println(6 &amp; 3 | 8);</code>? Розкрийте за пріоритетом операторів.`,
      String.raw`Напишіть вираз, що вмикає третій біт (рахуючи з нуля) числа <code>flags</code>.`,
    ],
  },
];
