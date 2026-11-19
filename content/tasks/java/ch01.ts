// Практичні завдання глави «Початок» (уроки 1–4). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
// Правила набору: головний клас Main першим, допоміжні класи після нього; текст у виводі англійською (ASCII), бо кодування stdout у Java залежить від середовища.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_01: readonly RemoteTask[] = [
  {
    ...base, id: "java-hello-jdk", lesson: "java/1", xp: 15,
    title: "Перевірка JDK: перший запуск",
    context: "Після встановлення JDK перше, що роблять, це запускають найпростішу програму: так видно, що компілятор і віртуальна машина працюють. Версію Java зазвичай перевіряють одразу, бо від неї залежать можливості мови.",
    brief: [
      "Виведіть три рядки через <code>System.out.println</code>: <code>Hello, Java!</code>, <code>JDK works</code> і <code>Java 21+: </code>, після якого стоїть результат порівняння <code>Runtime.version().feature() &gt;= 21</code>.",
      "Склейте текст із порівнянням оператором <code>+</code>: порівняння візьміть у дужки, інакше вийде помилка типів. Клас має називатися <code>Main</code>.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        // Виведіть три рядки: Hello, Java!  JDK works  Java 21+: true
        System.out.println();
    }
}
`,
    checks: [
      { on: "stdout", name: "Виводить «Hello, Java!»", has: "Hello, Java!", hint: "Рядок у подвійних лапках: System.out.println(\"Hello, Java!\");" },
      { on: "stdout", name: "Виводить «JDK works»", has: "JDK works", hint: "Це окремий виклик println зі своїм рядком" },
      { on: "stdout", name: "Третій рядок «Java 21+: true»", has: "Java 21+: true", hint: "\"Java 21+: \" + (Runtime.version().feature() >= 21)" },
      { on: "source", name: "Версію отримано через Runtime.version()", matches: "Runtime\\.version\\(\\)", hint: "Метод feature() повертає номер основної версії, наприклад 21" },
    ],
  },
  {
    ...base, id: "java-print-receipt", lesson: "java/2", xp: 15,
    title: "Чек: print, println і сума в дужках",
    context: "Консольні програми, звіти й логи складаються з рядків, у яких текст змішано з числами. Помилка з порядком обчислення в «Total: » + a + b породжує неправильні суми, які непросто помітити.",
    brief: [
      "Програма має надрукувати чек: заголовок <code>Item</code> і <code>Price</code> через табуляцію, два товари з цінами, кількість товарів і суму.",
      "Кількість надрукуйте двома викликами: <code>System.out.print(\"Items: \")</code>, а потім <code>println</code> із числом. Суму в рядку <code>Total</code> візьміть у дужки, щоб числа додалися, а не склеїлися.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        int pen = 20;
        int notebook = 25;
        // Потрібен вивід:
        // Item<TAB>Price
        // Pen<TAB>20
        // Notebook<TAB>25
        // Items: 2
        // Total: 45
        System.out.println("Total: " + pen + notebook);
    }
}
`,
    checks: [
      { on: "stdout", name: "Таблиця з табуляціями: заголовок і два товари", has: "Item\tPrice\nPen\t20\nNotebook\t25", hint: "Символ табуляції в рядку Java записують як \\t" },
      { on: "stdout", name: "Кількість і сума: «Items: 2» та «Total: 45»", has: "Items: 2\nTotal: 45", hint: "\"Total: \" + (pen + notebook): без дужок числа склеїться як текст" },
      { on: "source", name: "Використано print без переходу на новий рядок", matches: "System\\.out\\.print\\(", hint: "Метод print (без ln) друкує без переходу, наступний вивід продовжить рядок" },
      { on: "source", name: "Табуляція записана як \\t", matches: "\\\\t", hint: "Усередині лапок: \"Pen\\t\" + pen" },
    ],
  },
  {
    ...base, id: "java-imports-tidy", lesson: "java/3", xp: 20,
    title: "Імпорти замість повних імен",
    context: "У реальному коді повні імена на кшталт java.util.ArrayList скрізь не пишуть: імпорти зібрано вгорі файла, і за ними видно, від чого залежить клас. Повні імена лишають лише для конфліктів.",
    brief: [
      "Програма працює, але всюди використовує повні імена. Додайте <code>import java.util.List;</code>, <code>import java.util.ArrayList;</code> і статичний імпорт <code>import static java.lang.Math.max;</code>.",
      "Після цього замініть <code>java.util.List</code>, <code>java.util.ArrayList</code> і <code>Math.max</code> у коді на короткі <code>List</code>, <code>ArrayList</code> і <code>max</code>. Вивід не повинен змінитися.",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        java.util.List<Integer> prices = new java.util.ArrayList<>();
        prices.add(40);
        prices.add(15);
        prices.add(650);
        int best = Math.max(prices.get(0), Math.max(prices.get(1), prices.get(2)));
        System.out.println("Prices: " + prices);
        System.out.println("Max: " + best);
    }
}
`,
    checks: [
      { on: "stdout", name: "Вивід не змінився: «Prices: [40, 15, 650]» і «Max: 650»", has: "Prices: [40, 15, 650]\nMax: 650", hint: "Змінюйте лише імпорти й імена, логіку не чіпайте" },
      { on: "source", name: "Є import java.util.List;", matches: "import java\\.util\\.List;", hint: "Імпорти пишуть угорі файла, до слова class" },
      { on: "source", name: "Є import java.util.ArrayList;", matches: "import java\\.util\\.ArrayList;", hint: "Окремий рядок для кожного класу" },
      { on: "source", name: "Є статичний імпорт Math.max", matches: "import static java\\.lang\\.Math\\.max;", hint: "import static java.lang.Math.max;" },
      { on: "source", name: "Повних імен java.util.List і java.util.ArrayList у коді немає", matches: "(?<!import )java\\.util\\.(List|ArrayList)\\b", not: true, hint: "У тілі методу лишіть короткі імена List і ArrayList" },
      { on: "source", name: "Виклик max без префікса Math.", matches: "(?<![.\\w])Math\\.max", not: true, hint: "Після статичного імпорту пишіть max(a, b)" },
    ],
  },
  {
    ...base, id: "java-fix-stacktrace", lesson: "java/4", xp: 15,
    title: "Читаємо stack trace: ділення на нуль",
    context: "Перше, що роблять після падіння програми, це читають stack trace: він вказує файл, рядок і причину. Уміння знайти в ньому свій рядок економить години налагодження.",
    brief: [
      "Програма падає з <code>ArithmeticException: / by zero</code>. Запустіть її й за stack trace знайдіть рядок із діленням, а потім змінну, яка дорівнює нулю.",
      "Виправте програму так, щоб вона виводила <code>Total: 360</code>, <code>Average: 120</code> і <code>Per person: 90</code> (людей четверо).",
    ],
    starter: raw`public class Main {
    public static void main(String[] args) {
        int price = 120;
        int count = 3;
        int total = price * count;
        System.out.println("Total: " + total);
        System.out.println("Average: " + total / count);
        int people = 0;
        System.out.println("Per person: " + total / people);
    }
}
`,
    checks: [
      { on: "stdout", name: "Загальна сума: «Total: 360»", has: "Total: 360", hint: "price * count дає 360" },
      { on: "stdout", name: "Середня ціна: «Average: 120»", has: "Average: 120", hint: "Цей рядок працює й у вихідній програмі" },
      { on: "stdout", name: "На людину: «Per person: 90»", has: "Per person: 90", hint: "Четверо людей: 360 / 4 = 90. Подивіться, чому змінна people дорівнює 0" },
      { on: "source", name: "Ділення на змінну people залишилось", matches: "total\\s*/\\s*people", hint: "Діліть на кількість людей, а не заміняйте ділення числом" },
      { on: "source", name: "people більше не дорівнює 0", matches: "people\\s*=\\s*0\\s*;", not: true, hint: "Змініть значення змінної people на 4" },
    ],
  },
];
