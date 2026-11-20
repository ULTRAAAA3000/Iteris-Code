// Практичні завдання глави «Колекції» (уроки 19–30). Запускаються на сервері, результат перевіряється за stdout і вихідним кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_03: readonly RemoteTask[] = [
  {
    ...base, id: "java-array-stats", lesson: "java/19", xp: 20,
    title: "Масив оцінок: сума, максимум і мінімум",
    context: "Статистика за масивом чисел — найпростіша аналітика: підсумок, найкращий і найгірший результат, середнє. Усе це обчислюється одним проходом циклу по масиву з накопичувачами.",
    brief: [
      "Для масиву <code>scores</code> одним циклом <code>for</code> обчисліть <code>sum</code>, <code>max</code> і <code>min</code>. Початкові значення <code>max</code> і <code>min</code> вже задано першим елементом.",
      "Середнє виведіть як <code>double</code>: <code>(double) sum / scores.length</code>. Очікуваний вивід містить <code>Sum: 399</code>, <code>Max: 90</code>, <code>Min: 64</code> і <code>Average: 79.8</code>.",
    ],
    starter: raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] scores = {72, 85, 90, 64, 88};
        int sum = 0;
        int max = scores[0];
        int min = scores[0];
        // TODO: циклом for обчисліть sum, max і min
        System.out.println("Scores: " + Arrays.toString(scores));
        System.out.println("Length: " + scores.length);
        System.out.println("Sum: " + sum);
        System.out.println("Max: " + max);
        System.out.println("Min: " + min);
        System.out.println("Average: " + 0.0);   // TODO: середнє як double
    }
}
`,
    checks: [
      { on: "stdout", name: "Масив і довжина виведені", has: "Scores: [72, 85, 90, 64, 88]\nLength: 5", hint: "Це вже написано, не змінюйте цих рядків" },
      { on: "stdout", name: "Сума: «Sum: 399»", has: "Sum: 399", hint: "72 + 85 + 90 + 64 + 88 = 399" },
      { on: "stdout", name: "Максимум і мінімум: 90 та 64", has: "Max: 90\nMin: 64", hint: "У циклі порівнюйте кожен елемент із max і min" },
      { on: "stdout", name: "Середнє: «Average: 79.8»", has: "Average: 79.8", hint: "(double) sum / scores.length" },
      { on: "source", name: "Є цикл for або for-each", matches: "for\\s*\\(", hint: "for (int s : scores) { ... }" },
    ],
  },
  {
    ...base, id: "java-arrays-utils", lesson: "java/20", xp: 20,
    title: "Arrays: sort, binarySearch, copyOf, fill",
    context: "Утиліти Arrays замінюють власні цикли: відсортувати, знайти, скопіювати з розширенням, заповнити й порівняти масиви можна одним викликом. Так пишуть і швидше, і з меншою кількістю помилок.",
    brief: [
      "Відсортуйте <code>data</code> через <code>Arrays.sort</code>, знайдіть індекс числа 7 через <code>binarySearch</code>, створіть копію довжиною 7 через <code>copyOf</code>.",
      "Заповніть масив із трьох елементів четвірками через <code>fill</code> і перевірте через <code>Arrays.equals</code>, що копія перших п'яти елементів збігається з відсортованим масивом.",
    ],
    starter: raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] data = {9, 3, 7, 1, 5};
        System.out.println("Sorted: " + Arrays.toString(data));
        // TODO: відсортуйте data і виведіть Sorted
        // TODO: Index of 7, Copy (довжина 7), Filled (три четвірки) та Equal
    }
}
`,
    checks: [
      { on: "stdout", name: "Відсортований масив", has: "Sorted: [1, 3, 5, 7, 9]", hint: "Arrays.sort(data) змінює масив на місці" },
      { on: "stdout", name: "Індекс числа 7: «Index of 7: 3»", has: "Index of 7: 3", hint: "Arrays.binarySearch(data, 7) працює лише для відсортованого масиву" },
      { on: "stdout", name: "Копія: [1, 3, 5, 7, 9, 0, 0]", has: "Copy: [1, 3, 5, 7, 9, 0, 0]", hint: "Arrays.copyOf(data, 7) дописує нулі" },
      { on: "stdout", name: "Заповнення й порівняння", has: "Filled: [4, 4, 4]\nEqual: true", hint: "Arrays.fill(arr, 4) і Arrays.equals(a, b)" },
      { on: "source", name: "Використано Arrays.fill і Arrays.copyOf", matches: "Arrays\\.fill[\\s\\S]*Arrays\\.copyOf|Arrays\\.copyOf[\\s\\S]*Arrays\\.fill", hint: "Обидва методи мають бути в коді" },
    ],
  },
  {
    ...base, id: "java-arrays-list", lesson: "java/21", xp: 25,
    title: "Масив і ArrayList: сума та парні числа",
    context: "Масив має фіксований розмір, ArrayList росте разом з даними. Сума й фільтрація колекції — щоденні операції з даними: підсумок замовлення, відбір записів за умовою.",
    brief: [
      "Допишіть <code>sum(int[] a)</code>: сума елементів масиву.",
      "Допишіть <code>evens(int[] a)</code>: поверніть <code>List&lt;Integer&gt;</code> лише з парних чисел у тому самому порядку (метод <code>add</code>).",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static int sum(int[] a) {
        // TODO
        return 0;
    }

    static List<Integer> evens(int[] a) {
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
      { on: "stdout", name: "Сума: 48", has: "Sum: 48", hint: "Додайте всі елементи масиву в циклі" },
      { on: "stdout", name: "Парні: [2, 4, 10, 8]", has: "Evens: [2, 4, 10, 8]", hint: "Перевірка парності: x % 2 == 0" },
      { on: "stdout", name: "Кількість парних: 4", has: "Count: 4", hint: "Метод size() списку" },
      { on: "source", name: "Елементи додаються через add", has: ".add(", hint: "result.add(x)" },
    ],
  },
  {
    ...base, id: "java-list-edit", lesson: "java/22", xp: 20,
    title: "Редагування списку: вставка, видалення, заміна",
    context: "Список змінюється: у середину вставляють, за значенням і за індексом видаляють, а елементи замінюють. Для List<Integer> легко сплутати remove за індексом і за значенням, тому тут перевіряємо обидва.",
    brief: [
      "Зі списку <code>[10, 20, 30, 40, 50]</code> зробіть <code>[11, 15, 20, 40]</code>: вставте 15 на індекс 1, видаліть значення 30 через <code>remove(Integer.valueOf(30))</code>, видаліть останній елемент і замініть перший на 11 через <code>set</code>.",
      "Виведіть <code>List: [11, 15, 20, 40]</code>, <code>Size: 4</code> і <code>Has 20: true</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(10, 20, 30, 40, 50));
        // TODO: 1) вставте 15 на індекс 1; 2) видаліть значення 30;
        // 3) видаліть останній елемент; 4) замініть перший елемент на 11
        System.out.println("List: " + list);
        System.out.println("Size: " + list.size());
        System.out.println("Has 20: " + list.contains(20));
    }
}
`,
    checks: [
      { on: "stdout", name: "Підсумковий список: [11, 15, 20, 40]", has: "List: [11, 15, 20, 40]", hint: "Виконуйте дії по порядку: від вставки до заміни" },
      { on: "stdout", name: "Розмір: «Size: 4»", has: "Size: 4", hint: "Після всіх змін у списку чотири елементи" },
      { on: "source", name: "Вставку зроблено add(1, 15)", matches: "add\\(\\s*1\\s*,\\s*15\\s*\\)", hint: "list.add(1, 15)" },
      { on: "source", name: "Видалення за значенням: Integer.valueOf(30)", matches: "remove\\(\\s*Integer\\.valueOf\\(\\s*30\\s*\\)\\s*\\)", hint: "remove(30) видалило б елемент з індексом 30" },
      { on: "source", name: "Заміну зроблено через set", matches: "\\.set\\(\\s*0\\s*,\\s*11", hint: "list.set(0, 11)" },
    ],
  },
  {
    ...base, id: "java-deque-brackets", lesson: "java/23", xp: 25,
    title: "Стек: перевірка дужок",
    context: "Компілятори й редактори перевіряють парність дужок стеком: відкриту дужку кладуть, закриту зіставляють із вершиною. ArrayDeque у ролі стека працює швидко й без зайвого коду.",
    brief: [
      "Допишіть <code>isBalanced(String s)</code> із <code>ArrayDeque&lt;Character&gt;</code>: для <code>(</code>, <code>[</code>, <code>{</code> робіть <code>push</code>, для закритих <code>pop</code> і перевіряйте пару. Стек порожній наприкінці — дужки збалансовані.",
      "Очікуваний вивід для <code>([]{})</code>, <code>([)]</code> і <code>((</code>: <code>true</code>, <code>false</code>, <code>false</code>.",
    ],
    starter: raw`import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        // TODO: push для відкритих дужок, pop і перевірка пари для закритих
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isBalanced("([]{})"));
        System.out.println(isBalanced("([)]"));
        System.out.println(isBalanced("(("));
    }
}
`,
    checks: [
      { on: "stdout", name: "Збалансовані дужки: true, false, false", equals: "true\nfalse\nfalse", hint: "([]{}) правильна; ([)] і (( ні" },
      { on: "source", name: "Використано ArrayDeque", has: "ArrayDeque", hint: "Deque<Character> stack = new ArrayDeque<>();" },
      { on: "source", name: "Є push і pop", matches: "push\\([\\s\\S]*pop\\(", hint: "Відкрита дужка: push, закрита: pop" },
    ],
  },
  {
    ...base, id: "java-grid-transpose", lesson: "java/24", xp: 25,
    title: "Транспонування матриці",
    context: "Транспонування міняє місцями рядки й стовпці: елемент m[r][c] стає t[c][r]. Таку операцію виконують над таблицями даних, зображеннями й матрицями в обчисленнях.",
    brief: [
      "Заповніть масив <code>t</code> розмірами 3 на 2 транспонованою матрицею <code>m</code> (вкладені цикли) і порахуйте суму всіх елементів <code>m</code>.",
      "Очікуваний вивід: <code>Rows: 2, Cols: 3</code>, потім <code>[[1, 4], [2, 5], [3, 6]]</code> і <code>Sum: 21</code>.",
    ],
    starter: raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}};
        int[][] t = new int[m[0].length][m.length];
        int sum = 0;
        // TODO: вкладеними циклами заповніть t і порахуйте sum
        System.out.println("Rows: " + m.length + ", Cols: " + m[0].length);
        System.out.println(Arrays.deepToString(t));
        System.out.println("Sum: " + sum);
    }
}
`,
    checks: [
      { on: "stdout", name: "Розміри: «Rows: 2, Cols: 3»", has: "Rows: 2, Cols: 3", hint: "Цей рядок уже виводиться" },
      { on: "stdout", name: "Транспонована матриця", has: "[[1, 4], [2, 5], [3, 6]]", hint: "t[c][r] = m[r][c]" },
      { on: "stdout", name: "Сума всіх елементів: «Sum: 21»", has: "Sum: 21", hint: "Додавайте m[r][c] у тому самому вкладеному циклі" },
      { on: "source", name: "Вкладені цикли", matches: "for\\s*\\([\\s\\S]*for\\s*\\(", hint: "Зовнішній цикл по рядках, внутрішній по стовпцях" },
    ],
  },
  {
    ...base, id: "java-map-stock", lesson: "java/25", xp: 20,
    title: "Склад у HashMap",
    context: "Склад, словник, налаштування: усе, що шукається за назвою, зручно тримати в мапі. Вона швидко знаходить значення за ключем, а get для відсутнього ключа повертає null.",
    brief: [
      "Перезапишіть кількість <code>banana</code> на 10 і видаліть <code>cherry</code>. Виведіть <code>Banana: 10</code>, <code>Has cherry: false</code>, <code>Size: 2</code> і <code>Missing: null</code> (значення відсутнього ключа <code>kiwi</code>).",
      "Потім циклом по <code>stock.values()</code> порахуйте загальну кількість і виведіть <code>Total: 15</code>.",
    ],
    starter: raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = new HashMap<>();
        stock.put("apple", 5);
        stock.put("banana", 3);
        stock.put("cherry", 7);
        // TODO: перезапишіть banana на 10 і видаліть cherry
        System.out.println("Banana: " + stock.get("banana"));
        System.out.println("Has cherry: " + stock.containsKey("cherry"));
        System.out.println("Size: " + stock.size());
        System.out.println("Missing: " + stock.get("kiwi"));
        // TODO: Total: сума всіх значень через цикл по stock.values()
    }
}
`,
    checks: [
      { on: "stdout", name: "Банани перезаписано: «Banana: 10»", has: "Banana: 10", hint: "put з існуючим ключем замінює значення" },
      { on: "stdout", name: "Вишні видалено", has: "Has cherry: false\nSize: 2", hint: "stock.remove(\"cherry\")" },
      { on: "stdout", name: "Відсутній ключ дає null", has: "Missing: null", hint: "Це поведінка get; нічого додавати не треба" },
      { on: "stdout", name: "Загальна кількість: «Total: 15»", has: "Total: 15", hint: "5 + 10: додайте значення в циклі for (int v : stock.values())" },
      { on: "source", name: "Є перебір values()", has: ".values()", hint: "for (int v : stock.values())" },
    ],
  },
  {
    ...base, id: "java-map-group", lesson: "java/26", xp: 25,
    title: "Групування слів і підсумок продажів",
    context: "Групування за ознакою й накопичення сум — типова аналітика: слова за довжиною, замовлення за клієнтом, продажі за товаром. Методи computeIfAbsent і merge роблять її короткою.",
    brief: [
      "Згрупуйте слова за довжиною в <code>Map&lt;Integer, List&lt;String&gt;&gt;</code> через <code>computeIfAbsent</code>, а продажі <code>apple 3</code>, <code>apple 4</code>, <code>pear 2</code> складіть у <code>sales</code> через <code>merge(name, qty, Integer::sum)</code>.",
      "Очікуваний вивід: <code>{3=[one, two, six], 4=[four, five], 5=[three, seven]}</code> і <code>{apple=7, pear=2}</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        String[] words = "one two three four five six seven".split(" ");
        Map<Integer, List<String>> byLength = new HashMap<>();
        // TODO: згрупуйте слова за довжиною через computeIfAbsent
        Map<String, Integer> sales = new HashMap<>();
        // TODO: через merge додайте продажі: apple 3, apple 4, pear 2
        System.out.println(new TreeMap<>(byLength));
        System.out.println(new TreeMap<>(sales));
    }
}
`,
    checks: [
      { on: "stdout", name: "Групи за довжиною", has: "{3=[one, two, six], 4=[four, five], 5=[three, seven]}", hint: "byLength.computeIfAbsent(w.length(), k -> new ArrayList<>()).add(w)" },
      { on: "stdout", name: "Підсумок продажів: {apple=7, pear=2}", has: "{apple=7, pear=2}", hint: "sales.merge(\"apple\", 3, Integer::sum)" },
      { on: "source", name: "Використано computeIfAbsent", has: "computeIfAbsent", hint: "Метод створює список для нового ключа" },
      { on: "source", name: "Використано merge", has: ".merge(", hint: "merge додає до наявного значення" },
    ],
  },
  {
    ...base, id: "java-set-ops", lesson: "java/27", xp: 20,
    title: "Множини: об'єднання, перетин, різниця",
    context: "Множини відповідають на питання «що спільне, що відрізняється»: спільні друзі, нові клієнти, унікальні теги. Об'єднання, перетин і різниця виконують addAll, retainAll та removeAll.",
    brief: [
      "Заповніть <code>union</code>, <code>common</code> і <code>onlyA</code> так, щоб множини <code>a</code> і <code>b</code> лишилися без змін (спершу копіюйте через конструктор).",
      "Ще приберіть дублікати зі списку <code>[3, 1, 3, 2, 1]</code> із збереженням порядку через <code>LinkedHashSet</code> і виведіть <code>Unique: [3, 1, 2]</code>.",
    ],
    starter: raw`import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5));
        Set<Integer> b = new HashSet<>(Arrays.asList(4, 5, 6, 7));
        Set<Integer> union = new HashSet<>();
        Set<Integer> common = new HashSet<>();
        Set<Integer> onlyA = new HashSet<>();
        // TODO: заповніть union, common і onlyA, не змінюючи a і b
        System.out.println("Union: " + new TreeSet<>(union));
        System.out.println("Common: " + new TreeSet<>(common));
        System.out.println("Only A: " + new TreeSet<>(onlyA));
        List<Integer> raw = Arrays.asList(3, 1, 3, 2, 1);
        // TODO: Unique: дублікати прибрано, порядок збережено (LinkedHashSet)
    }
}
`,
    checks: [
      { on: "stdout", name: "Об'єднання: [1..7]", has: "Union: [1, 2, 3, 4, 5, 6, 7]", hint: "Скопіюйте a у union і викличте union.addAll(b)" },
      { on: "stdout", name: "Перетин: [4, 5]", has: "Common: [4, 5]", hint: "common = копія a, потім retainAll(b)" },
      { on: "stdout", name: "Різниця A без B: [1, 2, 3]", has: "Only A: [1, 2, 3]", hint: "onlyA = копія a, потім removeAll(b)" },
      { on: "stdout", name: "Унікальні зі збереженням порядку", has: "Unique: [3, 1, 2]", hint: "new LinkedHashSet<>(raw)" },
      { on: "source", name: "Використано retainAll і removeAll", matches: "retainAll[\\s\\S]*removeAll|removeAll[\\s\\S]*retainAll", hint: "Обидва методи потрібні для перетину й різниці" },
    ],
  },
  {
    ...base, id: "java-sort-names", lesson: "java/28", xp: 25,
    title: "Сортування імен і чисел",
    context: "Природний порядок рядків ставить великі літери перед малими, тому для людського виводу часто потрібен порядок без урахування регістру. Сортування в зворотному порядку теж щоденна потреба.",
    brief: [
      "Відсортуйте копію <code>natural</code> за природним порядком (<code>Collections.sort</code>), копію <code>ignore</code> без урахування регістру (<code>String.CASE_INSENSITIVE_ORDER</code>), а числа <code>nums</code> — за спаданням (<code>Comparator.reverseOrder()</code>).",
      "Виведіть чотири рядки: <code>Natural</code>, <code>Ignore case</code>, <code>Desc</code> і <code>Max</code> (найбільше число через <code>Collections.max</code>).",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Oleh", "anna", "Zoya", "bohdan"));
        List<Integer> nums = new ArrayList<>(List.of(5, 1, 9, 3));
        List<String> natural = new ArrayList<>(names);
        List<String> ignore = new ArrayList<>(names);
        // TODO: відсортуйте natural, ignore і nums (за спаданням)
        System.out.println("Natural: " + natural);
        System.out.println("Ignore case: " + ignore);
        System.out.println("Desc: " + nums);
        System.out.println("Max: " + 0);   // TODO: Collections.max(nums)
    }
}
`,
    checks: [
      { on: "stdout", name: "Природний порядок: [Oleh, Zoya, anna, bohdan]", has: "Natural: [Oleh, Zoya, anna, bohdan]", hint: "Collections.sort(natural)" },
      { on: "stdout", name: "Без урахування регістру", has: "Ignore case: [anna, bohdan, Oleh, Zoya]", hint: "ignore.sort(String.CASE_INSENSITIVE_ORDER)" },
      { on: "stdout", name: "Числа за спаданням: [9, 5, 3, 1]", has: "Desc: [9, 5, 3, 1]", hint: "nums.sort(Comparator.reverseOrder())" },
      { on: "stdout", name: "Максимум: «Max: 9»", has: "Max: 9", hint: "Collections.max(nums)" },
      { on: "source", name: "Використано CASE_INSENSITIVE_ORDER і reverseOrder", matches: "CASE_INSENSITIVE_ORDER[\\s\\S]*reverseOrder|reverseOrder[\\s\\S]*CASE_INSENSITIVE_ORDER", hint: "Обидва готові компаратори з уроку" },
    ],
  },
  {
    ...base, id: "java-iterator-clean", lesson: "java/29", xp: 25,
    title: "Безпечне видалення під час обходу",
    context: "Видаляти елементи колекції з тіла for-each не можна: буде ConcurrentModificationException. Правильні способи — Iterator.remove() і removeIf, які узгоджено змінюють колекцію.",
    brief: [
      "Видаліть усі парні числа зі списку <code>nums</code> через явний <code>Iterator</code> і метод <code>it.remove()</code>.",
      "А зі списку <code>words</code> видаліть слова коротші за 3 символи через <code>removeIf</code>. Очікуваний вивід: <code>Odd: [1, 3, 5, 7]</code> і <code>Long: [java, code]</code>.",
    ],
    starter: raw`import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8));
        // TODO: через Iterator видаліть усі парні числа
        List<String> words = new ArrayList<>(List.of("a", "java", "to", "code"));
        // TODO: через removeIf видаліть слова коротші за 3 символи
        System.out.println("Odd: " + nums);
        System.out.println("Long: " + words);
    }
}
`,
    checks: [
      { on: "stdout", name: "Лишились непарні: [1, 3, 5, 7]", has: "Odd: [1, 3, 5, 7]", hint: "Усередині while (it.hasNext()) викликайте it.remove() для парних" },
      { on: "stdout", name: "Лишились довгі слова: [java, code]", has: "Long: [java, code]", hint: "words.removeIf(w -> w.length() < 3)" },
      { on: "source", name: "Використано ітератор", matches: "\\.iterator\\(\\)", hint: "Iterator<Integer> it = nums.iterator();" },
      { on: "source", name: "Видалення через it.remove()", matches: "\\bit\\.remove\\(\\)|\\w+\\.remove\\(\\)\\s*;", hint: "Метод remove() ітератора видаляє останній повернений next() елемент" },
      { on: "source", name: "Використано removeIf", has: "removeIf", hint: "Умова пишеться лямбдою: w -> w.length() < 3" },
    ],
  },
  {
    ...base, id: "java-wordcount-map", lesson: "java/30", xp: 30,
    title: "Частота слів: HashMap і HashSet",
    context: "HashMap зберігає пари «ключ: значення» і миттєво знаходить за ключем, а HashSet зберігає лише унікальні значення. Підрахунок частоти й видалення дублікатів — їх головні застосування.",
    brief: [
      "Допишіть <code>count(String text)</code>: поверніть <code>HashMap&lt;String, Integer&gt;</code>, де ключ — слово, а значення — кількість його появ (<code>getOrDefault</code> або <code>merge</code>).",
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
      { on: "stdout", name: "Підрахунок слів правильний", has: "{and=1, fast=1, fun=1, go=2, is=2}", hint: "counts.merge(w, 1, Integer::sum) для кожного слова з split(\" \")" },
      { on: "stdout", name: "Унікальних слів: 5", has: "Unique: 5", hint: "Розмір HashSet зі слів" },
      { on: "source", name: "Використано HashSet", has: "new HashSet", hint: "new HashSet<>(Arrays.asList(words)) або додавання в циклі" },
      { on: "source", name: "Підрахунок через merge або getOrDefault", matches: "merge\\(|getOrDefault\\(", hint: "Не перевіряйте containsKey вручну" },
    ],
  },
];
