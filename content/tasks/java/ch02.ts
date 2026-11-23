// Практичні завдання глави «Основи мови» (уроки 5–18). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02: readonly RemoteTask[] = [
  {
    ...base, id: "java-vars-types", lesson: "java/5", xp: 15,
    title: "Змінні й типи: товар у кошику",
    context: "Кожна змінна в Java має тип, і від нього залежить, що з нею можна робити. Для кількості беруть int, для ціни double, для прапорців boolean, а для окремих символів char.",
    brief: [
      "Оголосіть змінну <code>boolean active</code> зі значенням <code>true</code> і змінну <code>char grade</code> зі значенням <code>'A'</code>. Виведіть їх у рядках <code>Active: true</code> і <code>Grade: A</code>.",
      "Потім виведіть <code>Total:</code> із добутком <code>items * price</code>. Типи вказуйте явно, без <code>var</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        int items = 3;
        double price = 9.5;
        System.out.println("Items: " + items);
        System.out.println("Price: " + price);
        // TODO: boolean active = true; char grade = 'A'; і виведіть Active, Grade та Total
    }
}
`,
    checks: [
      { on: "stdout", name: "Рядки Active і Grade", has: "Active: true\nGrade: A", hint: "Склейте текст зі змінними: \"Active: \" + active" },
      { on: "stdout", name: "Загальна сума: «Total: 28.5»", has: "Total: 28.5", hint: "3 * 9.5 дорівнює 28.5, це добуток items * price" },
      { on: "stdout", name: "Повний вивід збігається з очікуваним", equals: "Items: 3\nPrice: 9.5\nActive: true\nGrade: A\nTotal: 28.5", hint: "Порядок рядків: Items, Price, Active, Grade, Total" },
      { on: "source", name: "boolean active оголошено зі значенням true", matches: "boolean\\s+active\\s*=\\s*true", hint: "boolean active = true;" },
      { on: "source", name: "char grade оголошено з літерою A в одинарних лапках", matches: "char\\s+grade\\s*=\\s*'A'", hint: "Для char беруть одинарні лапки: 'A'" },
    ],
  },
  {
    ...base, id: "java-money-cents", lesson: "java/6", xp: 20,
    title: "Гроші в копійках і long",
    context: "Сума в double накопичує похибки, а ціле число копійок рахується точно. Тому в рахунках і касових програмах гроші зберігають цілими, а гривні й копійки виділяють діленням.",
    brief: [
      "Ціни 19,99 і 25,50 грн задано в копійках: <code>1999</code> та <code>2550</code>. Знайдіть суму й виведіть <code>Total cents:</code>, <code>Whole:</code> (цілі гривні через <code>/ 100</code>) і <code>Cents:</code> (копійки через <code>% 100</code>).",
      "Ще створіть <code>long big = 3_000_000_000L</code> і виведіть <code>Big:</code> із подвоєним значенням, щоб побачити, що в long місця вистачає.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        double pen = 19.99;
        double notebook = 25.5;
        System.out.println("Total: " + (pen + notebook));
        // TODO: перейдіть на цілі копійки: 1999 і 2550
    }
}
`,
    checks: [
      { on: "stdout", name: "Сума в копійках: «Total cents: 4549»", has: "Total cents: 4549", hint: "1999 + 2550 = 4549" },
      { on: "stdout", name: "Гривні й копійки: «Whole: 45» та «Cents: 49»", has: "Whole: 45\nCents: 49", hint: "4549 / 100 дає 45, а 4549 % 100 дає 49" },
      { on: "stdout", name: "Подвоєне велике число: «Big: 6000000000»", has: "Big: 6000000000", hint: "Змінна має бути long із суфіксом L, інакше число не поміститься в int" },
      { on: "source", name: "Використано оператор остачі %", matches: "%\\s*100", hint: "Копійки: total % 100" },
      { on: "source", name: "Грошей у double більше немає", matches: "\\bdouble\\b", not: true, hint: "Замініть double на int з копійками" },
    ],
  },
  {
    ...base, id: "java-constants-tax", lesson: "java/7", xp: 15,
    title: "Константа замість магічного числа",
    context: "Число 20 у формулі нічого не пояснює: читач не знає, податок це чи знижка. Константа TAX_PERCENT дає числу ім'я і дозволяє змінити його в одному місці.",
    brief: [
      "У програмі двічі вжито число <code>20</code> як відсоток податку. Оголосіть <code>static final int TAX_PERCENT = 20;</code> над методом <code>main</code> і використайте її в обох формулах.",
      "Вивід не повинен змінитися: <code>Gross: 120</code> і <code>Gross: 300</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        int net1 = 100;
        int net2 = 250;
        System.out.println("Gross: " + (net1 + net1 * 20 / 100));
        System.out.println("Gross: " + (net2 + net2 * 20 / 100));
    }
}
`,
    checks: [
      { on: "stdout", name: "Вивід не змінився: Gross 120 і 300", has: "Gross: 120\nGross: 300", hint: "100 + 20 дорівнює 120, а 250 + 50 дорівнює 300" },
      { on: "source", name: "Оголошено static final int TAX_PERCENT = 20", matches: "static\\s+final\\s+int\\s+TAX_PERCENT\\s*=\\s*20\\s*;", hint: "static final int TAX_PERCENT = 20; над методом main" },
      { on: "source", name: "Константу використано в обох формулах", matches: "TAX_PERCENT[\\s\\S]*TAX_PERCENT[\\s\\S]*TAX_PERCENT", hint: "Окрім оголошення, ім'я має зустрічатися ще двічі" },
      { on: "source", name: "Магічного числа 20 у формулах не лишилось", matches: "\\*\\s*20\\s*/", not: true, hint: "Замініть * 20 / 100 на * TAX_PERCENT / 100" },
    ],
  },
  {
    ...base, id: "java-strings-slug", lesson: "java/8", xp: 25,
    title: "Рядки: slug, reverse і паліндром",
    context: "Рядки в Java незмінні, тому результат кожного методу треба зберігати. Із заголовка статті так отримують адресу сторінки (slug), а перевірка паліндрома ґрунтується на перевернутому рядку.",
    brief: [
      "Отримайте <code>slug</code> із заголовка: обріжте пробіли (<code>trim</code>), приведіть до малих літер, розбийте за пробілами (<code>split(\"\\\\s+\")</code>) і з'єднайте дефісом (<code>String.join</code>).",
      "Переверніть слово через <code>StringBuilder</code> і перевірте, чи воно паліндром без урахування регістру (<code>equalsIgnoreCase</code>).",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        String title = "  Hello   World From Java ";
        String word = "Level";
        // slug: trim, toLowerCase, split("\\s+"), String.join("-", ...)
        String slug = title;
        // reversed: слово, перевернуте через StringBuilder
        String reversed = word;
        // palindrome: слово дорівнює перевернутому без урахування регістру
        boolean palindrome = false;
        System.out.println(slug);
        System.out.println(reversed);
        System.out.println(palindrome);
    }
}
`,
    checks: [
      { on: "stdout", name: "slug: hello-world-from-java", has: "hello-world-from-java", hint: "title.trim().toLowerCase().split(\"\\\\s+\") і String.join(\"-\", ...)" },
      { on: "stdout", name: "Перевернуте слово: leveL", has: "leveL", hint: "new StringBuilder(word).reverse().toString()" },
      { on: "stdout", name: "Level це паліндром: true", has: "leveL\ntrue", hint: "word.equalsIgnoreCase(reversed)" },
      { on: "source", name: "Використано StringBuilder", has: "StringBuilder", hint: "Для перевертання: new StringBuilder(word).reverse()" },
      { on: "source", name: "Використано String.join", has: "String.join", hint: "String.join(\"-\", parts)" },
    ],
  },
  {
    ...base, id: "java-types-average", lesson: "java/9", xp: 20,
    title: "Типи, цілочисельне ділення і приведення",
    context: "У Java 13 / 3 дорівнює 4, а не 4.33: ділення цілих відкидає дробову частину. Це класична причина помилок у середніх значеннях і відсотках. Лікується приведенням типу до ділення.",
    brief: [
      "У заготовці виводиться лише цілочисельне ділення. Додайте рядки <code>Average: 4.33</code> (середнє як <code>double</code>, <code>(double) sum / 3</code>, округлене через <code>Math.round(x * 100) / 100.0</code>), <code>Code of A: 65</code> (числовий код символу через <code>(int) 'A'</code>) і <code>Parsed: 20</code> (рядок <code>raw</code> перетворіть через <code>Integer.parseInt</code> із <code>trim()</code> і додайте 5).",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        int a = 4, b = 5, c = 4;
        int sum = a + b + c;
        System.out.println("Int division: " + sum / 3);
        String raw = "  15 ";
        // TODO: Average: 4.33, Code of A: 65 і Parsed: 20
    }
}
`,
    checks: [
      { on: "stdout", name: "Цілочисельне ділення: «Int division: 4»", has: "Int division: 4", hint: "13 / 3 у цілих дає 4" },
      { on: "stdout", name: "Середнє як double: «Average: 4.33»", has: "Average: 4.33", hint: "Math.round((double) sum / 3 * 100) / 100.0" },
      { on: "stdout", name: "Код символу A: «Code of A: 65»", has: "Code of A: 65", hint: "(int) 'A'" },
      { on: "stdout", name: "Розібране число: «Parsed: 20»", has: "Parsed: 20", hint: "Integer.parseInt(raw.trim()) + 5" },
      { on: "source", name: "Є приведення до double", matches: "\\(\\s*double\\s*\\)", hint: "Приведення ставте до ділення: (double) sum / 3" },
      { on: "source", name: "Використано parseInt", has: "parseInt", hint: "Integer.parseInt(raw.trim())" },
    ],
  },
  {
    ...base, id: "java-printf-total", lesson: "java/10", xp: 15,
    title: "Форматований вивід суми через printf",
    context: "Гроші показують з двома знаками після коми, а не як 599.9699999999999. Для цього в Java є printf і специфікатори формату: %.2f для дробових, %d для цілих, %n для переносу рядка.",
    brief: [
      "Виведіть через <code>printf</code> три рядки: <code>Total: 599.97</code> (<code>price * qty</code> з двома знаками), <code>Items: 3</code> і <code>Tax: 20%</code>.",
      "Знак відсотка в шаблоні записують як <code>%%</code>. Підказка: <code>System.out.printf(\"Total: %.2f%n\", ...)</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        double price = 199.99;
        int qty = 3;
        // TODO: через printf виведіть Total: 599.97, Items: 3 і Tax: 20%
        System.out.println(price * qty);
    }
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Total: 599.97»", has: "Total: 599.97", hint: "%.2f залишає два знаки після крапки" },
      { on: "stdout", name: "Рядок «Items: 3»", has: "Items: 3", hint: "%d підставляє ціле число" },
      { on: "stdout", name: "Рядок «Tax: 20%»", has: "Tax: 20%", hint: "Знак відсотка в шаблоні подвоюється: %%" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Total: 599.97\nItems: 3\nTax: 20%", hint: "Рівно три рядки, кожен закінчується через %n" },
      { on: "source", name: "Використано printf", has: "printf(", hint: "System.out.printf(...)" },
    ],
  },
  {
    ...base, id: "java-grade-ladder", lesson: "java/11", xp: 20,
    title: "Оцінка за балами: if, && і тернарний оператор",
    context: "Розгалуження перетворюють числа на рішення: оцінку за балами, статус замовлення, право доступу. Ланцюжок else if перевіряє умови зверху вниз, а тернарний оператор вибирає одне з двох значень.",
    brief: [
      "Для <code>score = 83</code> обчисліть <code>grade</code> ланцюжком <code>if / else if / else</code>: від 90 — <code>A</code>, від 75 — <code>B</code>, від 60 — <code>C</code>, інакше <code>F</code>.",
      "Змінну <code>inB</code> задайте через <code>&amp;&amp;</code> (бали від 75 до 89), а останній рядок виведіть тернарним оператором: <code>Passed</code> або <code>Failed</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        int score = 83;
        String grade = "?";
        // TODO: 90 і більше A, від 75 до 89 B, від 60 до 74 C, інакше F
        System.out.println("Grade: " + grade);
        boolean inB = false;
        // TODO: inB має бути true, якщо score від 75 до 89 включно
        System.out.println("In B range: " + inB);
        // TODO: тернарним оператором виведіть Passed, якщо score >= 60, інакше Failed
    }
}
`,
    checks: [
      { on: "stdout", name: "Оцінка: «Grade: B»", has: "Grade: B", hint: "83 потрапляє в діапазон від 75 до 89" },
      { on: "stdout", name: "Діапазон: «In B range: true»", has: "In B range: true", hint: "score >= 75 && score <= 89" },
      { on: "stdout", name: "Результат: «Passed»", has: "Passed", hint: "score >= 60 ? \"Passed\" : \"Failed\"" },
      { on: "source", name: "Використано else if", matches: "else\\s+if", hint: "Потрібен ланцюжок: if ... else if ... else" },
      { on: "source", name: "Використано оператор &&", has: "&&", hint: "Обидві межі діапазону перевіряються через &&" },
      { on: "source", name: "Використано тернарний оператор", matches: "\\?\\s*\"Passed\"\\s*:\\s*\"Failed\"", hint: "умова ? \"Passed\" : \"Failed\"" },
    ],
  },
  {
    ...base, id: "java-loops-sums", lesson: "java/12", xp: 20,
    title: "Цикли: суми, квадрати й ділення навпіл",
    context: "Цикли накопичують суми, перебирають числа й повторюють дію, доки не виконається умова. Цикл for підходить, коли відомо кількість кроків, а while — коли вона залежить від даних.",
    brief: [
      "Циклом <code>for</code> знайдіть суму чисел від 1 до 100, кратних 7, і виведіть <code>Sum7: 735</code>. Потім іншим циклом <code>for</code> виведіть квадрати чисел від 1 до 5, кожен з нового рядка.",
      "Циклом <code>while</code> порахуйте, скільки разів можна поділити 100 навпіл, доки число більше за 1, і виведіть <code>Steps: 6</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        int sum = 0;
        // TODO: цикл for: додайте до sum числа від 1 до 100, кратні 7
        System.out.println("Sum7: " + sum);
        // TODO: цикл for: виведіть квадрати чисел від 1 до 5, кожен з нового рядка
        int n = 100;
        int steps = 0;
        // TODO: цикл while: ділите n навпіл, доки n > 1, і рахуйте кроки
        System.out.println("Steps: " + steps);
    }
}
`,
    checks: [
      { on: "stdout", name: "Сума кратних 7: «Sum7: 735»", has: "Sum7: 735", hint: "7 + 14 + ... + 98 = 735; перевіряйте i % 7 == 0" },
      { on: "stdout", name: "Квадрати від 1 до 5", has: "Sum7: 735\n1\n4\n9\n16\n25\nSteps: 6", hint: "Квадрати виводьте між рядками Sum7 і Steps, кожен println" },
      { on: "stdout", name: "Кроки ділення: «Steps: 6»", has: "Steps: 6", hint: "100, 50, 25, 12, 6, 3, 1: шість ділень" },
      { on: "source", name: "Є цикл for", matches: "for\\s*\\(", hint: "for (int i = 1; i <= 100; i++)" },
      { on: "source", name: "Є цикл while", matches: "while\\s*\\(", hint: "while (n > 1) { n /= 2; steps++; }" },
    ],
  },
  {
    ...base, id: "java-fizzbuzz-switch", lesson: "java/13", xp: 20,
    title: "FizzBuzz і switch",
    context: "Цикл for перебирає числа, if вирішує, що робити, а switch замінює довгий ланцюжок if/else, коли значень багато: день тижня, код статусу, тип події.",
    brief: [
      "У циклі <code>for</code> виведіть числа від 1 до 15, але <code>Fizz</code> для кратних 3, <code>Buzz</code> для кратних 5 і <code>FizzBuzz</code> для кратних обом.",
      "Другим циклом для <code>d</code> від 1 до 4 обчисліть назву дня через switch-вираз зі стрілками: 1 дає <code>Mon</code>, 2 — <code>Tue</code>, 3 — <code>Wed</code>, решта — <code>Unknown</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            System.out.println(i);   // TODO: Fizz / Buzz / FizzBuzz
        }
        for (int d = 1; d <= 4; d++) {
            String name = "";   // TODO: switch-вираз: 1 Mon, 2 Tue, 3 Wed, інакше Unknown
            System.out.println(name);
        }
    }
}
`,
    checks: [
      { on: "stdout", name: "FizzBuzz для 1..15", has: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n", hint: "Спершу перевіряйте кратність 15, потім 3 і 5" },
      { on: "stdout", name: "Назви днів: Mon, Tue, Wed, Unknown", has: "FizzBuzz\nMon\nTue\nWed\nUnknown", hint: "switch (d) { case 1 -> \"Mon\"; ... default -> \"Unknown\"; }" },
      { on: "source", name: "Використано switch", matches: "\\bswitch\\b", hint: "Для назв днів потрібен switch" },
      { on: "source", name: "Switch у стрілковій формі", has: "->", hint: "case 1 -> \"Mon\";" },
    ],
  },
  {
    ...base, id: "java-break-labels", lesson: "java/14", xp: 25,
    title: "break із міткою і continue",
    context: "Щойно потрібне значення знайдено, шукати далі марно: break перериває цикл, а мітка дозволяє вийти з обох вкладених циклів одразу. continue пропускає зайві кроки.",
    brief: [
      "Двома вкладеними циклами (<code>i</code> і <code>j</code> від 1 до 9) знайдіть першу пару з добутком 42 і виведіть <code>Found: 6 x 7</code>. Зовнішньому циклу дайте мітку й вийдіть із обох через <code>break</code> із міткою.",
      "Потім циклом від 1 до 10 додайте до <code>evenSum</code> лише парні числа, пропустивши непарні через <code>continue</code>. Має вийти <code>Even sum: 30</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        // TODO: вкладені цикли з міткою: знайдіть першу пару 1..9 з добутком 42
        System.out.println("Found: none");
        int evenSum = 0;
        // TODO: через continue додайте до evenSum лише парні числа від 1 до 10
        System.out.println("Even sum: " + evenSum);
    }
}
`,
    checks: [
      { on: "stdout", name: "Знайдена пара: «Found: 6 x 7»", has: "Found: 6 x 7", hint: "Виводьте i + \" x \" + j, коли i * j == 42" },
      { on: "stdout", name: "Сума парних: «Even sum: 30»", has: "Even sum: 30", hint: "2 + 4 + 6 + 8 + 10 = 30" },
      { on: "source", name: "Є мітка перед циклом for", matches: "\\w+\\s*:\\s*for\\s*\\(", hint: "outer:\\n for (...) { ... }" },
      { on: "source", name: "Використано break із міткою", matches: "break\\s+\\w+\\s*;", hint: "break outer;" },
      { on: "source", name: "Використано continue", matches: "continue\\s*;", hint: "if (i % 2 != 0) { continue; }" },
    ],
  },
  {
    ...base, id: "java-methods-basic", lesson: "java/15", xp: 25,
    title: "Методи: square, isEven, max3 і printLine",
    context: "Метод дає назву шматку логіки й дозволяє викликати його багато разів. Хороший метод робить одну справу, має зрозуміле ім'я й повертає результат через return.",
    brief: [
      "Допишіть чотири методи: <code>square(int n)</code> повертає квадрат, <code>isEven(int n)</code> повертає <code>boolean</code>, <code>max3(int a, int b, int c)</code> повертає найбільше з трьох, а <code>printLine(String text)</code> друкує <code>-- text --</code>.",
      "Метод <code>main</code> уже викликає їх; очікуваний вивід: <code>49</code>, <code>true</code>, <code>9</code>, <code>-- done --</code>.",
    ],
    starter: raw`public class Main {
    static int square(int n) {
        // TODO
        return 0;
    }

    static boolean isEven(int n) {
        // TODO
        return false;
    }

    static int max3(int a, int b, int c) {
        // TODO
        return 0;
    }

    static void printLine(String text) {
        // TODO: надрукуйте -- text --
    }

    public static void main(String[] args) {
        System.out.println(square(7));
        System.out.println(isEven(10));
        System.out.println(max3(4, 9, 6));
        printLine("done");
    }
}
`,
    checks: [
      { on: "stdout", name: "square(7) дає 49", has: "49\n", hint: "Квадрат: n * n" },
      { on: "stdout", name: "isEven(10) дає true", has: "49\ntrue", hint: "n % 2 == 0" },
      { on: "stdout", name: "max3(4, 9, 6) дає 9", has: "true\n9", hint: "Порівняйте три числа через Math.max або if" },
      { on: "stdout", name: "printLine друкує «-- done --»", has: "9\n-- done --", hint: "System.out.println(\"-- \" + text + \" --\");" },
      { on: "source", name: "printLine лишається методом void", matches: "static\\s+void\\s+printLine", hint: "Метод лише друкує, тому return не потрібен" },
    ],
  },
  {
    ...base, id: "java-methods-overload", lesson: "java/16", xp: 25,
    title: "Методи і перевантаження",
    context: "Перевантаження дозволяє мати кілька методів з однією назвою, але різними параметрами: area(r) для кола і area(w, h) для прямокутника. Виклик сам вибирає потрібний варіант.",
    brief: [
      "Допишіть <code>max(int a, int b)</code>, <code>area(double w, double h)</code> (площа прямокутника) і <code>sum(int... nums)</code> (сума будь-якої кількості чисел, для порожнього виклику 0). Метод <code>area(double r)</code> для кола вже є.",
      "Методи <code>area</code> мають однакову назву, але різні списки параметрів. Очікуваний вивід: <code>7</code>, <code>12.57</code>, <code>12.0</code>, <code>6</code>, <code>0</code>.",
    ],
    starter: raw`public class Main {
    static int max(int a, int b) {
        // TODO
        return 0;
    }

    static double area(double r) {
        return Math.PI * r * r;
    }

    // TODO: area(double w, double h) для прямокутника

    // TODO: sum(int... nums) для будь-якої кількості чисел

    public static void main(String[] args) {
        System.out.println(max(7, 3));
        System.out.printf("%.2f%n", area(2));
        System.out.println(area(3, 4));
        System.out.println(sum(1, 2, 3));
        System.out.println(sum());
    }
}
`,
    checks: [
      { on: "stdout", name: "max(7, 3) дає 7", has: "7\n", hint: "Поверніть більше з двох чисел" },
      { on: "stdout", name: "Площа кола з r = 2: 12.57", has: "12.57", hint: "Цей метод уже написано" },
      { on: "stdout", name: "Площа прямокутника 3 x 4: 12.0", has: "12.0", hint: "Поверніть w * h" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "7\n12.57\n12.0\n6\n0", hint: "sum(1, 2, 3) дає 6, а sum() без аргументів дає 0" },
      { on: "source", name: "Два методи area з різними параметрами", matches: "static\\s+double\\s+area\\s*\\(\\s*double\\s+\\w+\\s*\\)[\\s\\S]*static\\s+double\\s+area\\s*\\(\\s*double\\s+\\w+\\s*,\\s*double\\s+\\w+\\s*\\)", hint: "Методи розрізняються кількістю параметрів" },
      { on: "source", name: "Є варіативний параметр int...", matches: "int\\s*\\.\\.\\.\\s*\\w+", hint: "static int sum(int... nums)" },
    ],
  },
  {
    ...base, id: "java-recursion-basics", lesson: "java/17", xp: 30,
    title: "Рекурсія: факторіал, НСД і сума цифр",
    context: "Рекурсивні методи мають базовий випадок і крок, що до нього наближає. Факторіал, найбільший спільний дільник і сума цифр природно описуються через себе.",
    brief: [
      "Допишіть три рекурсивні методи: <code>factorial(int n)</code> (<code>n * factorial(n - 1)</code>, база <code>n &lt;= 1</code>), <code>gcd(int a, int b)</code> (<code>gcd(b, a % b)</code>, база <code>b == 0</code>) і <code>digitSum(int n)</code> (<code>n % 10 + digitSum(n / 10)</code>, база <code>n &lt; 10</code>).",
      "Очікуваний вивід: <code>5! = 120</code>, <code>gcd = 6</code>, <code>digits = 15</code>.",
    ],
    starter: raw`public class Main {
    static long factorial(int n) {
        // TODO: базовий випадок і рекурсивний крок
        return 0;
    }

    static int gcd(int a, int b) {
        // TODO
        return 0;
    }

    static int digitSum(int n) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        System.out.println("5! = " + factorial(5));
        System.out.println("gcd = " + gcd(48, 18));
        System.out.println("digits = " + digitSum(12345));
    }
}
`,
    checks: [
      { on: "stdout", name: "Факторіал: «5! = 120»", has: "5! = 120", hint: "5 * 4 * 3 * 2 * 1 дорівнює 120" },
      { on: "stdout", name: "НСД: «gcd = 6»", has: "gcd = 6", hint: "gcd(48, 18) = gcd(18, 12) = gcd(12, 6) = gcd(6, 0) = 6" },
      { on: "stdout", name: "Сума цифр: «digits = 15»", has: "digits = 15", hint: "1 + 2 + 3 + 4 + 5 дорівнює 15" },
      { on: "source", name: "factorial викликає сам себе", matches: "factorial\\s*\\(\\s*n\\s*-\\s*1\\s*\\)", hint: "return n * factorial(n - 1);" },
      { on: "source", name: "gcd викликає сам себе", matches: "gcd\\s*\\(\\s*b\\s*,", hint: "return gcd(b, a % b);" },
      { on: "source", name: "digitSum викликає сам себе", matches: "digitSum\\s*\\(\\s*n\\s*/\\s*10", hint: "return n % 10 + digitSum(n / 10);" },
    ],
  },
  {
    ...base, id: "java-bits-flags", lesson: "java/18", xp: 30,
    title: "Права доступу як біти",
    context: "Набір прав на кшталт READ, WRITE і EXEC тримають в одному числі, де кожне право займає свій біт. Побітові оператори вмикають, вимикають і перевіряють права без зайвих полів.",
    brief: [
      "Спершу <code>perms = READ | EXEC</code>. Додайте право <code>WRITE</code> через <code>|=</code> і заберіть <code>READ</code> через <code>&amp;= ~READ</code>. Виведіть <code>perms: 110</code> (<code>Integer.toBinaryString</code>).",
      "Далі виведіть <code>can write: true</code> та <code>can read: false</code> через <code>(perms &amp; WRITE) != 0</code> і <code>bits set: 2</code> через <code>Integer.bitCount</code>.",
    ],
    starter: raw`public class Main {
    static final int READ = 1;
    static final int WRITE = 2;
    static final int EXEC = 4;

    public static void main(String[] args) {
        int perms = READ | EXEC;
        // TODO: додайте WRITE через |=, заберіть READ через &= ~
        System.out.println("perms: " + Integer.toBinaryString(perms));
        // TODO: can write, can read через (perms & ...) != 0 і bits set через Integer.bitCount
    }
}
`,
    checks: [
      { on: "stdout", name: "Біти прав: «perms: 110»", has: "perms: 110", hint: "READ вимкнено, WRITE і EXEC ввімкнено: 110" },
      { on: "stdout", name: "Перевірки прав: write true, read false", has: "can write: true\ncan read: false", hint: "(perms & WRITE) != 0 і (perms & READ) != 0" },
      { on: "stdout", name: "Кількість бітів: «bits set: 2»", has: "bits set: 2", hint: "Integer.bitCount(perms)" },
      { on: "source", name: "Право додано через |=", matches: "\\|=", hint: "perms |= WRITE;" },
      { on: "source", name: "Право забрано через &= ~", matches: "&=\\s*~", hint: "perms &= ~READ;" },
    ],
  },
];
