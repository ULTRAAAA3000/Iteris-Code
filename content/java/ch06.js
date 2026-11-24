export const LESSONS_06 = [
  {
    t: "Виняток як подія: try, catch і stack trace",
    ch: "Помилки",
    easy: String.raw`Виняток — це сигнал тривоги: коли щось іде не так, метод не мовчки йде далі, а піднімає тривогу, яка летить угору ланцюжком викликів, доки хтось не відреагує. try і catch — це пост охорони, що ловить такий сигнал.`,
    p: [
      String.raw`Виняток (exception) — об'єкт, що описує помилкову ситуацію: ділення на нуль, відсутній файл, неправильний формат числа. Коли він виникає, нормальне виконання зупиняється, а JVM шукає обробник, піднімаючись вгору стеком викликів. Якщо обробника немає, програма завершується зі stack trace. Це надійніше, ніж коди помилок, які можна ненавмисно проігнорувати, адже виняток неможливо «не помітити».`,
      String.raw`Обробка виглядає так: <code>try { ... } catch (NumberFormatException e) { ... }</code>. Код у try виконується; якщо в ньому кидається виняток зазначеного типу (або його підтипу), керування переходить у відповідний catch, а решта try пропускається. Змінна <code>e</code> містить об'єкт винятку: <code>e.getMessage()</code> дає текст, <code>e.printStackTrace()</code> друкує стек, а <code>e.toString()</code> повертає тип і повідомлення.`,
      String.raw`Кілька блоків catch перевіряються згори вниз, і виконується перший, що підходить. Тому спершу ставлять вужчі типи, а потім ширші: <code>catch (NumberFormatException e)</code> стоїть перед <code>catch (RuntimeException e)</code>. Якщо поставити ширший першим, вужчий стане недосяжним, і компілятор відхилить код. Кілька типів з однаковою реакцією можна об'єднати в один блок: <code>catch (A | B e)</code>.`,
      String.raw`Блок <code>finally</code> виконується завжди: і після успішного try, і після catch, і навіть якщо виняток не спіймано (перед його подальшим поширенням). У ньому звільняють ресурси й завершують дії, які мають виконатися за будь-яких умов. Виняток із <code>finally</code> або <code>return</code> у ньому може перекрити початковий результат, тому код у <code>finally</code> має бути простим і безпечним.`,
      String.raw`Виняток кидають оператором <code>throw</code>: <code>throw new IllegalArgumentException("age must be positive");</code>. Це правильна реакція на некоректний вхід: метод не повинен мовчки продовжувати з поганими даними. Повідомлення має пояснювати, що не так і яке значення було передано, бо воно потрапить у журнал, і від його якості залежить швидкість діагностики.`,
      String.raw`Stack trace (стек викликів) показує ланцюжок методів від місця виникнення помилки до верху: перший рядок містить тип і повідомлення, далі йдуть рядки <code>at клас.метод(файл:рядок)</code>. Шукайте перший рядок зі своїм кодом. Не ковтайте винятки: порожній <code>catch</code> приховує проблему й ускладнює пошук. Як мінімум, залогуйте виняток разом зі stack trace, щоб помилка лишила слід.`,
      String.raw`Виняток варто ловити там, де ви можете щось із ним зробити: повторити спробу, показати зрозуміле повідомлення, використати запасне значення. Якщо зробити нічого не можна, виняток краще пропустити вище. Не перехоплюйте загальні <code>Exception</code> чи <code>Throwable</code> без потреби: ви зловите й ті помилки, які мали б зупинити програму, і приховаєте справжню причину.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        String[] inputs = {"12", "x7", "40"};
        for (String s : inputs) {
            try {
                int n = Integer.parseInt(s);
                System.out.println("parsed " + n);
            } catch (NumberFormatException e) {
                System.out.println("bad input: " + e.getMessage());
            }
        }
    }
}`,
      String.raw`public class Main {
    static void check(String s, int index) {
        try {
            int n = Integer.parseInt(s);
            System.out.println(10 / n + " " + s.charAt(index));
        } catch (NumberFormatException e) {
            System.out.println("not a number");
        } catch (ArithmeticException | StringIndexOutOfBoundsException e) {
            System.out.println("math or index problem: " + e.getClass().getSimpleName());
        }
    }

    public static void main(String[] args) {
        check("abc", 0);
        check("0", 0);
        check("5", 9);
        check("5", 0);
    }
}`,
      String.raw`public class Main {
    static int test(boolean fail) {
        try {
            System.out.println("try");
            if (fail) {
                throw new IllegalStateException("boom");
            }
            return 1;
        } catch (IllegalStateException e) {
            System.out.println("catch");
            return 2;
        } finally {
            System.out.println("finally");     // виконується в обох випадках
        }
    }

    public static void main(String[] args) {
        System.out.println(test(false));
        System.out.println(test(true));
    }
}`,
      String.raw`// не компілюється: ширший catch стоїть перед вужчим, тому NumberFormatException уже перехоплено
public class Main {
    public static void main(String[] args) {
        try {
            Integer.parseInt("x");
        } catch (RuntimeException e) {
            System.out.println("runtime");
        } catch (NumberFormatException e) {
            System.out.println("number format");
        }
    }
}`,
      String.raw`// аварія: метод кидає виняток, який ніхто не перехопив, програма завершується зі stack trace
public class Main {
    static void setAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("age must be >= 0, got " + age);
        }
        System.out.println("age = " + age);
    }

    public static void main(String[] args) {
        setAge(20);
        setAge(-5);
        System.out.println("unreachable");
    }
}`,
    ],
    note: String.raw`Блоки <code>catch</code> перевіряються згори вниз, тому вужчі типи ставлять раніше за ширші. Блок <code>finally</code> виконується завжди, а спійманий виняток не варто «ковтати» порожнім <code>catch</code>: залогуйте його.`,
    work: String.raw`Обробка винятків — повсякденна частина роботи: некоректний ввід користувача, недоступний сервер, відсутній файл. Хороший код ловить лише те, що вміє обробити, а решту пропускає вище, де є контекст для рішення. На код-рев'ю порожні catch і перехоплення Exception майже завжди викликають зауваження.`,
    tasks: [
      String.raw`Чому спершу ставлять вужчі типи в блоках catch?`,
      String.raw`Коли виконується блок finally і чи завжди він виконується?`,
    ],
  },
  {
    t: "Перевірювані й неперевірювані винятки: throws",
    ch: "Помилки",
    easy: String.raw`Перевірювані винятки — це знак «увага, слизько» на дорозі, який змушує знизити швидкість, а неперевірювані — несподівана яма, про яку ніхто не попереджав: у перших компілятор вимагає реакції, а в других ні.`,
    p: [
      String.raw`Ієрархія: усе, що можна кинути, — це <code>Throwable</code>. Його підкласи: <code>Error</code> (серйозні збої JVM на кшталт <code>OutOfMemoryError</code> і <code>StackOverflowError</code>, їх зазвичай не обробляють) та <code>Exception</code>. Усередині <code>Exception</code> є особлива гілка <code>RuntimeException</code>. Перевірювані (checked) — це <code>Exception</code> та його підкласи, крім <code>RuntimeException</code>; неперевірювані (unchecked) — <code>RuntimeException</code> і <code>Error</code> з усіма нащадками.`,
      String.raw`Перевірювані винятки описують ситуації, які можуть статися незалежно від якості коду: файл відсутній (<code>IOException</code>), мережа недоступна, база не відповідає. Компілятор вимагає від кожного методу, що може їх викинути, або спіймати їх, або оголосити в сигнатурі через <code>throws</code>. Це змушує враховувати помилку ще на етапі проєктування й не ігнорувати її.`,
      String.raw`Неперевірювані винятки здебільшого вказують на помилку програміста: <code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>, <code>IllegalArgumentException</code>, <code>IllegalStateException</code>, <code>ArithmeticException</code>, <code>ClassCastException</code>, <code>NumberFormatException</code>. Компілятор не вимагає їх обробляти, бо правильна реакція — виправити код, а не ловити виняток там, де його можна було б уникнути.`,
      String.raw`Оголошення <code>throws</code> виглядає так: <code>static String read(String path) throws IOException</code>. Викликач опиняється перед вибором: спіймати виняток (try/catch) або теж оголосити <code>throws</code>. Метод <code>main</code> теж може оголосити <code>throws Exception</code>, і в навчальних прикладах ми це приймаємо, але у виробничому коді виняток варто обробляти ближче до причини, де є контекст для рішення.`,
      String.raw`Правила перевизначення: метод підкласу не може кидати ширші перевірювані винятки, ніж метод батька (він може кидати вужчі або жодних). Це зберігає принцип підстановки: код, що працює з батьківським типом, не очікує нових перевірюваних винятків. Для неперевірюваних винятків обмежень немає, тому їх можна додавати без зміни сигнатури.`,
      String.raw`Суперечка про перевірювані винятки триває давно: вони роблять помилки видимими, але ускладнюють сигнатури й лямбди (стандартні функціональні інтерфейси не оголошують <code>throws</code>). Тому сучасні бібліотеки й фреймворки частіше обирають неперевірювані винятки, а перевірювані лишають для справді відновлюваних ситуацій, у яких викликач має реальну можливість вчинити інакше.`,
      String.raw`Практичні поради: перевірюваний виняток не «ковтайте» і не перетворюйте мовчки на нічого. Якщо його не можна обробити тут, обгорніть у неперевірюваний із причиною (<code>throw new IllegalStateException("cannot read config", e)</code>) або пропустіть через <code>throws</code>. І не оголошуйте <code>throws Exception</code> у публічних методах бібліотеки: така сигнатура нічого не розповідає про те, що може піти не так. Якщо ж виняток доводиться оголосити широко, поясніть це в документації методу й опишіть, у яких випадках він виникає.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        Class<?> c = NumberFormatException.class;
        while (c != null) {
            System.out.println(c.getSimpleName());
            c = c.getSuperclass();                 // ланцюг предків аж до Object
        }
        System.out.println(RuntimeException.class.isAssignableFrom(java.io.IOException.class));
    }
}`,
      String.raw`import java.io.IOException;

public class Main {
    static String load(String name) throws IOException {
        if (name.isEmpty()) {
            throw new IOException("name is empty");
        }
        return "data of " + name;
    }

    public static void main(String[] args) {
        try {
            System.out.println(load("app"));
            System.out.println(load(""));
        } catch (IOException e) {
            System.out.println("failed: " + e.getMessage());
        }
    }
}`,
      String.raw`// не компілюється: перевірюваний IOException не оброблено і не оголошено в throws
import java.io.IOException;

public class Main {
    static void risky() throws IOException {
        throw new IOException("disk");
    }

    public static void main(String[] args) {
        risky();
    }
}`,
      String.raw`// не компілюється: метод підкласу не може кидати ширший перевірюваний виняток, ніж метод батька
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        System.out.println(new Child());
    }
}

class Parent {
    void work() throws IOException {
    }
}

class Child extends Parent {
    @Override
    void work() throws Exception {
    }
}`,
      String.raw`import java.io.IOException;

public class Main {
    static String read() throws IOException {
        throw new IOException("no file");
    }

    static String readOrFail() {
        try {
            return read();
        } catch (IOException e) {
            throw new IllegalStateException("cannot read config", e);   // обгортка з причиною
        }
    }

    public static void main(String[] args) {
        try {
            readOrFail();
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage() + " / " + e.getCause().getMessage());
        }
    }
}`,
    ],
    note: String.raw`Перевірювані винятки (<code>Exception</code> без <code>RuntimeException</code>) компілятор змушує спіймати або оголосити в <code>throws</code>. Неперевірювані — це помилки програмування: їх виправляють у коді, а не ловлять.`,
    work: String.raw`У прикладних проєктах перевірювані винятки з'являються на межах із зовнішнім світом: файлові операції, мережа, база. Рівень сервісів зазвичай перетворює їх на власні неперевірювані винятки з поясненням, а верхній шар (контролер) показує користувачеві зрозуміле повідомлення й логує подробиці.`,
    tasks: [
      String.raw`Чим перевірюваний виняток відрізняється від неперевірюваного і як компілятор їх розрізняє?`,
      String.raw`Чому метод підкласу не може кидати ширший перевірюваний виняток, ніж метод батька?`,
    ],
  },
  {
    t: "Власні винятки",
    ch: "Помилки",
    easy: String.raw`Власний виняток — це бланк претензії зі своєю назвою: замість загального «щось пішло не так» ви пишете «недостатньо коштів на рахунку», і той, хто читає, одразу розуміє, про що йдеться і що з цим робити.`,
    p: [
      String.raw`Власні винятки створюють для помилок предметної області: <code>InsufficientFundsException</code>, <code>OrderNotFoundException</code>, <code>InvalidEmailException</code>. Назва розповідає, що сталося, без читання повідомлення. Це дозволяє викликачеві реагувати по-різному на різні помилки (catch за типом) і робить журнали зрозумілішими, бо в них видно не загальне «Exception», а конкретну причину.`,
      String.raw`Створення: <code>class InsufficientFundsException extends Exception { InsufficientFundsException(String message) { super(message); } }</code>. Якщо наслідувати <code>Exception</code>, виняток перевірюваний; якщо <code>RuntimeException</code> — неперевірюваний. Назви винятків за традицією закінчують словом <code>Exception</code>. Усі винятки мають конструктор із повідомленням, яке передають батьківському класу через <code>super</code>.`,
      String.raw`Що вибрати: перевірюваний, коли викликач реально може відновитися (спробувати іншу картку, показати форму повторно) і ви хочете змусити його подумати про це; неперевірюваний, коли помилка — порушення контракту чи програмна помилка, або коли виняток має пройти через кілька рівнів без обгорток. Сучасна практика схиляється до неперевірюваних, а перевірювані лишає для справді відновлюваних сценаріїв.`,
      String.raw`Корисно додавати у виняток дані, а не лише текст: поле із сумою, ідентифікатором, ім'ям параметра. Тоді обробник отримує структуру, а не розбирає рядок. Приклад: <code>class InsufficientFundsException extends Exception { private final int missing; ... int getMissing() { return missing; } }</code>. Так верхній шар може показати користувачеві, скількох коштів не вистачає.`,
      String.raw`Конструктори: зазвичай надають варіант без аргументів, із повідомленням і з повідомленням та причиною (<code>super(message, cause)</code>). Причина дозволяє зберегти початкову помилку під час обгортання (про це наступний урок). Повідомлення має пояснювати ситуацію достатньо для діагностики: «Account 42: balance 70, requested 500», а не просто «Error».`,
      String.raw`Ієрархія власних винятків: корисно мати спільного предка для модуля (<code>ShopException</code>), від якого успадковуються конкретні. Тоді викликач може спіймати вузький тип або весь клас помилок модуля одним catch. Не створюйте занадто глибоких ієрархій: двох-трьох рівнів достатньо, а десятки дрібних класів лише ускладнюють підтримку. Також не зловживайте власними типами: якщо виняток не потребує окремої обробки, достатньо стандартного <code>IllegalArgumentException</code> чи <code>IllegalStateException</code> із добрим повідомленням.`,
      String.raw`Не використовуйте винятки для звичайного керування потоком (наприклад, для виходу з циклу чи пошуку елемента): вони повільніші за умови й заплутують код. Виняток призначено для винятків: ситуацій, що не належать нормальному сценарію. Очікувані варіанти (порожній результат, відсутній запис) краще виражати поверненим значенням, наприклад <code>Optional</code>. Така дисципліна зберігає швидкодію та робить код передбачуваним для читача.`,
    ],
    code: [
      String.raw`public class Main {
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
}`,
      String.raw`public class Main {
    static void order(int stock, int wanted) {
        if (wanted > stock) {
            throw new OutOfStockException(wanted - stock);
        }
        System.out.println("ordered " + wanted);
    }

    public static void main(String[] args) {
        order(10, 4);
        try {
            order(3, 8);
        } catch (OutOfStockException e) {
            System.out.println(e.getMessage() + ", missing " + e.getMissing());
        }
    }
}

class OutOfStockException extends RuntimeException {
    private final int missing;

    OutOfStockException(int missing) {
        super("out of stock");
        this.missing = missing;
    }

    int getMissing() {
        return missing;
    }
}`,
      String.raw`public class Main {
    static void process(int code) {
        if (code == 1) {
            throw new NotFoundException("item 7");
        }
        if (code == 2) {
            throw new ConflictException("duplicate id");
        }
        System.out.println("ok");
    }

    public static void main(String[] args) {
        for (int code = 0; code <= 2; code++) {
            try {
                process(code);
            } catch (NotFoundException e) {
                System.out.println("404 " + e.getMessage());
            } catch (ShopException e) {                      // решта помилок модуля
                System.out.println("generic " + e.getMessage());
            }
        }
    }
}

class ShopException extends RuntimeException {
    ShopException(String message) {
        super(message);
    }
}

class NotFoundException extends ShopException {
    NotFoundException(String message) {
        super(message);
    }
}

class ConflictException extends ShopException {
    ConflictException(String message) {
        super(message);
    }
}`,
      String.raw`// не компілюється: власний перевірюваний виняток не оброблено і не оголошено в throws
public class Main {
    static void fail() {
        throw new MyException("boom");
    }

    public static void main(String[] args) {
        fail();
    }
}

class MyException extends Exception {
    MyException(String message) {
        super(message);
    }
}`,
      String.raw`// аварія: власний неперевірюваний виняток ніхто не перехопив
public class Main {
    public static void main(String[] args) {
        System.out.println("start");
        throw new InvalidEmailException("no at sign: user.example.com");
    }
}

class InvalidEmailException extends RuntimeException {
    InvalidEmailException(String message) {
        super(message);
    }
}`,
    ],
    note: String.raw`Власний перевірюваний виняток успадковує <code>Exception</code>, неперевірюваний — <code>RuntimeException</code>. Передавайте повідомлення в <code>super(message)</code> і додавайте корисні дані полями. Блок <code>finally</code> виконується незалежно від того, був виняток чи ні.`,
    work: String.raw`У великих системах власні винятки відображають мову бізнесу й дозволяють обробникові верхнього рівня зіставити тип помилки з відповіддю: «не знайдено» — 404, «некоректні дані» — 400, «конфлікт» — 409. Тому в кожному проєкті є ієрархія власних винятків зі зрозумілими назвами й повідомленнями.`,
    tasks: [
      String.raw`Коли власний виняток краще зробити перевірюваним, а коли неперевірюваним?`,
      String.raw`Чому не слід використовувати винятки для звичайного керування потоком виконання?`,
    ],
  },
  {
    t: "Ланцюги причин: cause і suppressed",
    ch: "Помилки",
    adv: true,
    easy: String.raw`Ланцюг причин — це розслідування: «проєкт зірвався, бо не завантажився звіт, а він не завантажився, бо відсутній файл». Кожна ланка зберігає попередню, тож зворотним шляхом можна знайти першопричину.`,
    p: [
      String.raw`Коли нижній рівень кидає виняток, верхній часто обгортає його власним, зрозумілішим для свого рівня: <code>catch (IOException e) { throw new ConfigException("cannot load config", e); }</code>. Другий аргумент — причина (cause). Так на рівні сервісу ми бачимо зрозуміле повідомлення, а нижче зберігається технічна подробиця. Без передачі причини початкова інформація втрачається, і діагностика стає значно складнішою.`,
      String.raw`Метод <code>getCause()</code> повертає причину або <code>null</code>. Stack trace друкує всі причини з написом <code>Caused by:</code>, і найглибша з них є початковою. Для обходу ланцюга достатньо циклу: <code>Throwable t = e; while (t.getCause() != null) t = t.getCause();</code> — так отримаємо першопричину. Є також метод <code>initCause</code>, який дозволяє задати причину пізніше, коли її не передали в конструктор.`,
      String.raw`Вибір рівня абстракції: не пропускайте низькорівневі винятки через межі модулів. Репозиторій не повинен розкривати, що працює з SQL, а сервіс — що використовує HTTP. Обгортаючи виняток у тип свого рівня, ви приховуєте деталі реалізації й можете змінити їх без поламки викликачів, а початкова причина залишається доступною для діагностики.`,
      String.raw`Приховані (suppressed) винятки виникають, коли під час обробки одного винятку виникає інший, наприклад закриття ресурсу в try-with-resources теж кинуло виняток. Початковий виняток лишається основним, а другий додається до нього як приглушений: <code>e.getSuppressed()</code> повертає масив. Це гарантує, що жодна помилка не зникає мовчки, навіть якщо їх було кілька. У журналах такі винятки видно під рядками «Suppressed:», і саме вони допомагають зрозуміти, що закриття ресурсу теж не вдалося, хоча справжня причина — у тілі блоку.`,
      String.raw`Антипатерн: <code>catch (Exception e) { throw new RuntimeException(e.getMessage()); }</code> втрачає причину й stack trace оригіналу. Правильно передати <code>e</code> як причину. Ще одна типова помилка — логувати виняток і одночасно кидати його далі: у журналі з'являється кілька дублікатів однієї проблеми. Оберіть одне: або обробити тут, або передати вище.`,
      String.raw`Повідомлення обгорнутого винятку має додавати інформацію, а не повторювати причину: «Cannot load config /etc/app.cfg» і причина «Permission denied». Так видно, що намагалась зробити програма й чому не вдалося. Додавайте в повідомлення дані, які допоможуть відтворити проблему: імена файлів, ідентифікатори, значення параметрів.`,
      String.raw`Для відлагодження зручні метод <code>printStackTrace()</code> (для тимчасового виводу) і логер, що друкує виняток разом із усіма причинами. Не показуйте користувачеві stack trace: це небезпечно й незрозуміло. Користувач бачить коротке пояснення, а повні подробиці лишаються в журналі, де їх знайдуть розробники.`,
    ],
    code: [
      String.raw`import java.io.IOException;

public class Main {
    static void readFile() throws IOException {
        throw new IOException("file not found");
    }

    static void loadConfig() throws ConfigException {
        try {
            readFile();
        } catch (IOException e) {
            throw new ConfigException("cannot load config", e);
        }
    }

    public static void main(String[] args) {
        try {
            loadConfig();
        } catch (ConfigException e) {
            System.out.println(e.getMessage());
            System.out.println(e.getCause().getMessage());
        }
    }
}

class ConfigException extends Exception {
    ConfigException(String message, Throwable cause) {
        super(message, cause);
    }
}`,
      String.raw`public class Main {
    static Throwable rootCause(Throwable t) {
        while (t.getCause() != null) {
            t = t.getCause();
        }
        return t;
    }

    public static void main(String[] args) {
        Exception root = new IllegalStateException("password rejected");
        Exception mid = new RuntimeException("cannot connect to db", root);
        Exception top = new RuntimeException("cannot start service", mid);
        System.out.println(rootCause(top).getMessage());
        System.out.println(top.getCause().getMessage());
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        try (Res a = new Res("A")) {
            throw new IllegalStateException("body failed");
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
            for (Throwable s : e.getSuppressed()) {
                System.out.println("suppressed: " + s.getMessage());
            }
        }
    }
}

class Res implements AutoCloseable {
    private final String name;

    Res(String name) {
        this.name = name;
    }

    @Override
    public void close() {
        throw new IllegalArgumentException("close " + name + " failed");
    }
}`,
      String.raw`// не компілюється: ConfigException перевірюваний, а метод не оголошує throws і не ловить його
import java.io.IOException;

public class Main {
    static void load() {
        try {
            throw new IOException("disk");
        } catch (IOException e) {
            throw new ConfigException("cannot load", e);
        }
    }

    public static void main(String[] args) {
        load();
    }
}

class ConfigException extends Exception {
    ConfigException(String message, Throwable cause) {
        super(message, cause);
    }
}`,
      String.raw`// аварія: stack trace показує обидва винятки, а рядок Caused by вказує на першопричину
public class Main {
    static void low() {
        throw new IllegalStateException("password rejected");
    }

    static void high() {
        try {
            low();
        } catch (IllegalStateException e) {
            throw new RuntimeException("cannot connect to db", e);
        }
    }

    public static void main(String[] args) {
        high();
    }
}`,
    ],
    note: String.raw`Обгортаючи виняток, завжди передавайте початковий як причину: <code>new MyException("msg", e)</code>. Без цього втрачаються першопричина й stack trace. Приховані винятки (<code>getSuppressed</code>) зберігають помилки, що виникли під час закриття ресурсів.`,
    work: String.raw`У виробничих журналах ланцюги причин — головне джерело діагностики: рядок «Caused by» часто одразу вказує на справжню першопричину, наприклад неправильний пароль до бази. Втрата причини під час обгортання — одна з найдорожчих помилок: інцидент доводиться відтворювати вручну.`,
    tasks: [
      String.raw`Чому під час обгортання винятку треба передавати початковий як причину?`,
      String.raw`Що таке suppressed-винятки і коли вони виникають?`,
    ],
  },
  {
    t: "try-with-resources і finally",
    ch: "Помилки",
    easy: String.raw`try-with-resources — це автоматичні двері, що самі зачиняються за вами: ви зайшли, попрацювали, вийшли — і не треба пам'ятати, чи зачинили. Навіть якщо всередині щось пішло не так, двері зачиняться.`,
    p: [
      String.raw`Ресурси (файли, з'єднання, потоки) потрібно закривати: інакше вони витікають, вичерпуються дескриптори, дані не скидаються на диск. Раніше для цього писали громіздкий <code>finally</code> з перевіркою на <code>null</code> і окремим try для <code>close()</code>. З Java 7 є конструкція try-with-resources, яка робить усе це автоматично й правильно, а код стає коротшим і надійнішим.`,
      String.raw`Синтаксис: <code>try (Resource r = new Resource()) { ... }</code>. Ресурс оголошується в круглих дужках, його тип має реалізовувати <code>AutoCloseable</code>. Після блоку (нормального чи аварійного) викликається <code>r.close()</code>. Можна оголосити кілька ресурсів через крапку з комою: <code>try (A a = ...; B b = ...)</code>. Вони закриваються у зворотному порядку оголошення: спершу той, що відкрито останнім.`,
      String.raw`З Java 9 можна використати вже наявну фінальну (ефективно фінальну) змінну: <code>try (r)</code>. Блоки catch і finally додаються як зазвичай, і вони виконуються після закриття ресурсів. Тобто порядок такий: тіло try, закриття ресурсів, потім catch (якщо був виняток), потім finally. Це корисно знати, коли в catch потрібно звернутися до результатів роботи ресурсу.`,
      String.raw`Якщо виняток виник і в тілі, і при закритті, основним лишається виняток тіла, а виняток із <code>close()</code> додається як приглушений (<code>getSuppressed</code>). Це краще, ніж класичний finally, де виняток із <code>close()</code> міг затерти початковий. Також ресурс, який не вдалося створити (виняток у конструкторі), не закривається, бо його фактично не існує.`,
      String.raw`Блок <code>finally</code> лишається для дій, не пов'язаних із ресурсами AutoCloseable: відновити стан, зняти блокування, записати в журнал. У <code>finally</code> не повертайте значення оператором <code>return</code> і не кидайте нових винятків: це перекриває початковий результат чи виняток і ховає помилки, які мали б бути помітними.`,
      String.raw`Реалізація власного ресурсу: клас реалізує <code>AutoCloseable</code> з методом <code>close()</code>. Метод має бути ідемпотентним (повторний виклик нічого не ламає) і не кидати винятків без потреби. Для ресурсів введення-виведення використовують стандартні класи, які вже реалізують <code>Closeable</code>: потоки, зчитувачі, з'єднання з базою.`,
      String.raw`Типові помилки: забути закрити ресурс (створити <code>new FileReader(...)</code> без try-with-resources), спробувати використати ресурс після блоку (він уже закритий), створити ресурс поза try і пізніше помістити його всередину. Хороше правило: усе, що відкривається, відкривається в заголовку try-with-resources, а не десь окремо. Так компілятор сам стежить, щоб кожен відкритий ресурс гарантовано закрився, навіть коли код змінюватимуть інші розробники.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        try (Conn c = new Conn("db")) {
            System.out.println("working with " + c.name());
        }
        System.out.println("after");
    }
}

class Conn implements AutoCloseable {
    private final String name;

    Conn(String name) {
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
    public static void main(String[] args) {
        try (Conn a = new Conn("A"); Conn b = new Conn("B")) {
            System.out.println("body");
        }
    }
}

class Conn implements AutoCloseable {
    private final String name;

    Conn(String name) {
        this.name = name;
        System.out.println("open " + name);
    }

    @Override
    public void close() {
        System.out.println("close " + name);   // спершу B, потім A
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        try (Conn a = new Conn("A")) {
            throw new IllegalStateException("body failed");
        } catch (IllegalStateException e) {
            System.out.println("caught: " + e.getMessage());   // ресурс уже закрито
        } finally {
            System.out.println("finally");
        }
    }
}

class Conn implements AutoCloseable {
    private final String name;

    Conn(String name) {
        this.name = name;
        System.out.println("open " + name);
    }

    @Override
    public void close() {
        System.out.println("close " + name);
    }
}`,
      String.raw`public class Main {
    static String old(Conn c) {
        try {
            return "value";
        } finally {
            c.close();        // ручне закриття: легко забути або зіпсувати
        }
    }

    public static void main(String[] args) {
        System.out.println(old(new Conn("X")));
        Conn shared = new Conn("Y");
        try (shared) {        // Java 9: ефективно фінальна змінна
            System.out.println("using Y");
        }
    }
}

class Conn implements AutoCloseable {
    private final String name;

    Conn(String name) {
        this.name = name;
        System.out.println("open " + name);
    }

    @Override
    public void close() {
        System.out.println("close " + name);
    }
}`,
      String.raw`// не компілюється: клас Plain не реалізує AutoCloseable, тому не може бути ресурсом try-with-resources
public class Main {
    public static void main(String[] args) {
        try (Plain p = new Plain()) {
            System.out.println("body");
        }
    }
}

class Plain {
}`,
    ],
    note: String.raw`Ресурси в try-with-resources закриваються автоматично у зворотному порядку оголошення, навіть при винятку. Якщо виняток виникає й у тілі, й при <code>close()</code>, основним лишається перший, а другий стає приглушеним. Не повертайте значення з <code>finally</code>.`,
    work: String.raw`Файли, з'єднання з базою, мережеві сокети й потоки — типові ресурси: якщо їх не закрити, сервіс поступово вичерпає ліміти й зупиниться. Тому будь-який код із введенням-виведенням пишуть із try-with-resources, а перевірка забутих закриттів — стандартна вимога на код-рев'ю та в статичних аналізаторах.`,
    tasks: [
      String.raw`У якому порядку закриваються ресурси, оголошені в try-with-resources?`,
      String.raw`Чим try-with-resources кращий за ручний finally із викликом close()?`,
    ],
  },
  {
    t: "Помилки програмування: NPE, assert і неперехоплені винятки",
    ch: "Помилки",
    easy: String.raw`Деякі помилки — це не ситуації, а промахи: ви звернулися до порожньої шухляди чи вийшли за межі списку. Їх не ловлять, а запобігають: перевіряють вхід, ставлять твердження-страховку й уважно читають stack trace.`,
    p: [
      String.raw`Помилки програмування — це дефекти, а не відновлювані ситуації: <code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>, <code>ClassCastException</code>, <code>IllegalArgumentException</code> (некоректний аргумент), <code>IllegalStateException</code> (об'єкт у неправильному стані), <code>ArithmeticException</code>. Правильна реакція — знайти й виправити причину, а не обгортати все в try/catch, адже це лише сховає проблему.`,
      String.raw`NullPointerException виникає під час звернення до <code>null</code>. З Java 14 повідомлення докладне: воно вказує, що саме було null. Запобігання: перевіряти вхідні параметри, не повертати <code>null</code> там, де можна повернути порожню колекцію чи <code>Optional</code>, ініціалізувати поля, а також користуватися <code>Objects.requireNonNull(x, "x is required")</code>, який одразу кидає виняток зі зрозумілим повідомленням.`,
      String.raw`Перевірка аргументів на вході методу (fail fast): <code>if (age &lt; 0) throw new IllegalArgumentException("age must be &gt;= 0, got " + age);</code>. Чим раніше виявлено помилку, тим ближче до причини stack trace. Виняток <code>IllegalStateException</code> кидають, коли метод викликано в неналежний момент: наприклад, читання із закритого потоку чи повторний запуск уже запущеного сервісу.`,
      String.raw`Оператор <code>assert</code> перевіряє внутрішні припущення: <code>assert balance &gt;= 0 : "negative balance";</code>. За замовчуванням перевірки вимкнені й вмикаються прапорцем <code>-ea</code> під час запуску (у тестах це роблять завжди), тому <code>assert</code> не можна використовувати для перевірки вхідних даних чи дій із побічними ефектами. Це інструмент розробника, а не захист від некоректного користувацького вводу.`,
      String.raw`Неперехоплений виняток завершує потік, у якому виник: у головному потоці програма завершується з кодом помилки, а в додаткових потоках лише цей потік (основна програма може жити далі, і ніхто не помітить). Для винятків у потоках задають обробник <code>Thread.setDefaultUncaughtExceptionHandler</code>, який записує помилку в журнал і повідомляє про збій.`,
      String.raw`У виробничому сервісі на верхньому рівні (точка входу запиту, обробник завдань) виняток ловлять, логують із повним stack trace й повертають відповідь про помилку, не даючи програмі впасти. Але це не виправдовує ловлі всього всюди: нижчі рівні мають пропускати помилки програміста вгору, а не ховати їх, інакше дефекти житимуть у системі роками.`,
      String.raw`Корисні утиліти: <code>Objects.requireNonNull</code>, <code>Objects.requireNonNullElse</code>, <code>Objects.checkIndex</code>, <code>Optional</code>, а також анотації <code>@Nullable</code> і <code>@NonNull</code> разом зі статичними аналізаторами. Типові джерела NPE: відсутній ключ у мапі, результат <code>get</code>, неініціалізоване поле, виклик методу на результаті, що може бути null. Привчіть себе запитувати: «Чи може це значення бути null?»`,
    ],
    code: [
      String.raw`import java.util.Objects;

public class Main {
    static String greet(String name) {
        String safe = Objects.requireNonNullElse(name, "guest");
        return "Hello, " + safe;
    }

    public static void main(String[] args) {
        System.out.println(greet("Ira"));
        System.out.println(greet(null));
    }
}`,
      String.raw`public class Main {
    static int parseAge(String s) {
        int age = Integer.parseInt(s.trim());
        if (age < 0) {
            throw new IllegalArgumentException("age must be >= 0, got " + age);
        }
        return age;
    }

    public static void main(String[] args) {
        System.out.println(parseAge(" 17 "));
        try {
            parseAge("-5");
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      String.raw`public class Main {
    static int half(int n) {
        assert n % 2 == 0 : "n must be even";     // без -ea ця перевірка пропускається
        return n / 2;
    }

    public static void main(String[] args) {
        System.out.println(half(10));
        System.out.println(half(7));              // без -ea працює без помилки
    }
}`,
      String.raw`// аварія: звернення до null кидає NullPointerException з докладним повідомленням
public class Main {
    public static void main(String[] args) {
        String name = null;
        System.out.println("before");
        System.out.println(name.length());
    }
}`,
      String.raw`// аварія: requireNonNull відразу кидає NullPointerException зі зрозумілим повідомленням
import java.util.Objects;

public class Main {
    static void register(String name) {
        Objects.requireNonNull(name, "name is required");
        System.out.println("registered " + name);
    }

    public static void main(String[] args) {
        register("Ira");
        register(null);
    }
}`,
    ],
    note: String.raw`Помилки програмування (NPE, вихід за межі, неправильний аргумент) усувають у коді, а не ловлять. Перевіряйте вхід на початку методу (<code>IllegalArgumentException</code>, <code>Objects.requireNonNull</code>). Оператор <code>assert</code> вимкнений за замовчуванням, тому не покладайтеся на нього для перевірки даних.`,
    work: String.raw`NullPointerException і некоректні аргументи — найчастіші причини інцидентів. Практика fail fast, зрозумілі повідомлення і прибирання null з API скорочують час на діагностику з годин до хвилин. Сучасні команди додають перевірки аргументів до публічних методів і дозволяють аналізаторам виявляти потенційні null ще до запуску.`,
    tasks: [
      String.raw`Чим assert відрізняється від перевірки аргументу з IllegalArgumentException?`,
      String.raw`Чому краще перевіряти аргументи на початку методу, ніж чекати, коли програма впаде десь глибше?`,
    ],
  },
  {
    t: "Стратегії обробки помилок: Optional і результат",
    ch: "Помилки",
    adv: true,
    easy: String.raw`Optional — це коробка, яка може бути порожньою, але чесно про це повідомляє: відкриваючи її, ви знаєте, що там може не бути нічого, і не отримаєте неприємного сюрпризу у вигляді null.`,
    p: [
      String.raw`Є кілька способів повідомити про невдачу: кинути виняток, повернути спеціальне значення (-1, <code>null</code>), повернути <code>Optional</code>, повернути результат з описом помилки. Вибір залежить від того, наскільки помилка очікувана й що з нею робитиме викликач. Узгодьте стратегію в проєкті: плутанина між підходами робить API непередбачуваним для всіх, хто його використовує.`,
      String.raw`Виняток підходить для винятків: порушення контракту, збій інфраструктури, ситуації, які викликач не очікує й навряд чи обробить локально. Він має велику вартість (stack trace) і ламає потік виконання, тому для звичайних, очікуваних випадків (запису немає, користувач не знайшов товар) не годиться: такі ситуації виникають щодня й не мають лякати.`,
      String.raw`Спеціальні значення (<code>null</code>, -1, порожній рядок) небезпечні: легко забути перевірку, а <code>null</code> непомітно рухається далі, доки не впаде в дальньому місці. Метод <code>indexOf</code> повертає -1 за традицією, але це приклад API, який сьогодні проєктували б інакше. У нових інтерфейсах уникайте магічних значень і обирайте типи, що виражають відсутність явно.`,
      String.raw`<code>Optional&lt;T&gt;</code> описує значення, що може бути відсутнім: <code>Optional.of(x)</code>, <code>Optional.empty()</code>, <code>Optional.ofNullable(x)</code>. Він змушує викликача подумати про відсутність. Методи: <code>isPresent()</code>, <code>isEmpty()</code>, <code>get()</code> (кидає <code>NoSuchElementException</code>, якщо порожній, тому уникайте його без перевірки), <code>orElse(def)</code>, <code>orElseGet(supplier)</code>, <code>orElseThrow()</code>, <code>map</code>, <code>filter</code>, <code>ifPresent</code>.`,
      String.raw`Правила використання Optional: повертати його з методів, що можуть не знайти значення (<code>findById</code>); не використовувати як поле класу, параметр методу чи елемент колекції; не викликати <code>get()</code> без перевірки; для порожніх колекцій повертати порожню колекцію, а не Optional. Optional — це спосіб повідомити «може бути порожнім» у типі, а не заміна всіх перевірок і не привід писати вкладені ланцюжки.`,
      String.raw`Коли причина невдачі важлива (некоректне введення зі змістом помилки), краще повернути результат із поясненням: <code>Result&lt;T&gt;</code> із попередньої глави або власний тип <code>Validation</code>. Так викликач бачить і успіх, і причину невдачі, а не просто «порожньо». Такий підхід часто використовують для валідації форм, де потрібно показати користувачеві всі помилки одразу, а не лише першу.`,
      String.raw`Практичний підхід: для очікуваної відсутності — Optional чи порожня колекція; для очікуваних помилок із поясненням — результат; для порушень контракту й збоїв — виняток (неперевірюваний для помилок програмування, перевірюваний для відновлюваних збоїв зовнішніх систем). Одне й те саме правило має діяти в усьому коді проєкту, інакше колеги плутатимуться.`,
    ],
    code: [
      String.raw`import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Optional<String> present = Optional.of("Ira");
        Optional<String> empty = Optional.empty();
        System.out.println(present.isPresent() + " " + empty.isEmpty());
        System.out.println(present.orElse("guest"));
        System.out.println(empty.orElse("guest"));
        System.out.println(present.map(String::toUpperCase).orElse("?"));
    }
}`,
      String.raw`import java.util.Map;
import java.util.Optional;

public class Main {
    static final Map<String, String> USERS = Map.of("1", "Ira", "2", "Taras");

    static Optional<String> findUser(String id) {
        return Optional.ofNullable(USERS.get(id));
    }

    public static void main(String[] args) {
        System.out.println(findUser("1").orElse("unknown"));
        System.out.println(findUser("9").orElse("unknown"));
        findUser("2").ifPresent(name -> System.out.println("found " + name));
    }
}`,
      String.raw`import java.util.Optional;

public class Main {
    static String describe(Optional<String> email) {
        return email
            .map(String::trim)
            .filter(e -> e.contains("@"))
            .map(e -> "email " + e)
            .orElse("no valid email");
    }

    public static void main(String[] args) {
        System.out.println(describe(Optional.of("  ira@example.com ")));
        System.out.println(describe(Optional.of("nonsense")));
        System.out.println(describe(Optional.empty()));
    }
}`,
      String.raw`// аварія: get() на порожньому Optional кидає NoSuchElementException
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Optional<String> empty = Optional.empty();
        System.out.println("before");
        System.out.println(empty.get());
    }
}`,
      String.raw`// не компілюється: параметром Optional може бути лише посилальний тип
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Optional<int> number = Optional.of(5);
        System.out.println(number);
    }
}`,
    ],
    note: String.raw`Optional повертають із методів, що можуть не знайти значення; не використовуйте його як поле чи параметр і не викликайте <code>get()</code> без перевірки. Для очікуваних помилок із поясненням підходить результат (<code>Result</code>), а виняток — для порушень контракту й збоїв.`,
    work: String.raw`Метод пошуку, що повертає Optional, одразу повідомляє читачеві, що результату може не бути, і не лишає простору для NullPointerException. Єдина обов'язкова згода в команді про стратегію помилок робить API передбачуваним: розробникам не треба читати реалізацію, щоб зрозуміти, як отримати помилку.`,
    tasks: [
      String.raw`Коли Optional кращий за повернення null, а коли за виняток?`,
      String.raw`Чому Optional не варто використовувати як поле класу чи параметр методу?`,
    ],
  },
];
