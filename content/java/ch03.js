export const LESSONS_03 = [
  {
    t: "Масиви",
    ch: "Колекції",
    easy: String.raw`Масив — це шафа з однаковими комірками, пронумерованими з нуля: розмір шафи задають один раз, а далі до будь-якої комірки можна дістатися за номером.`,
    p: [
      String.raw`Масив зберігає фіксовану кількість елементів одного типу. Оголошення <code>int[] nums = new int[5];</code> створює п'ять комірок, заповнених нулями. Інший спосіб — літерал: <code>int[] nums = {5, 2, 9};</code>. Розмір задають під час створення, і змінити його потім не можна. Масив у Java — це об'єкт: змінна зберігає посилання на нього, а не самі дані.`,
      String.raw`Значення за замовчуванням: <code>0</code> для чисел, <code>false</code> для boolean, символ із кодом нуль для char і <code>null</code> для посилальних типів. Тому <code>new String[3]</code> дає три порожні посилання, а не три порожні рядки. Це типова пастка, яка проявляється під час першого виклику методу на такому елементі: вийде <code>NullPointerException</code>.`,
      String.raw`Доступ за індексом: <code>nums[0]</code> — перший елемент, <code>nums[nums.length - 1]</code> — останній. Довжина — це поле <code>length</code> без дужок, на відміну від методу <code>length()</code> у рядка. Індекс за межами від <code>0</code> до <code>length - 1</code> кидає <code>ArrayIndexOutOfBoundsException</code>: це найчастіша помилка виконання при роботі з масивами.`,
      String.raw`Для перебору є класичний <code>for (int i = 0; i &lt; nums.length; i++)</code>, який дає доступ до індексу, і цикл for-each <code>for (int x : nums)</code>, зручніший, коли індекс не потрібен. У for-each змінна циклу — це копія елемента, тому присвоєння їй не змінює масив. Для запису значень по індексах використовуйте звичайний цикл for.`,
      String.raw`Масив — посилальний тип, тому присвоєння <code>int[] b = a;</code> копіює лише посилання: обидві змінні вказують на один і той самий масив, і зміна через <code>b</code> видна через <code>a</code>. Справжню копію дають <code>a.clone()</code> або <code>Arrays.copyOf</code> (наступний урок). Порівняння масивів оператором <code>==</code> теж порівнює посилання, а не вміст.`,
      String.raw`Виклик <code>System.out.println(nums)</code> друкує щось на кшталт <code>[I@6d06d69c</code>: тип і хеш. Щоб побачити вміст, використовують <code>Arrays.toString(nums)</code> з імпортом <code>java.util.Arrays</code>. Це часто спантеличує новачків: код працює, а у виводі незрозумілі символи, хоча помилки немає.`,
      String.raw`Типові задачі з масивами: сума, мінімум і максимум, підрахунок за умовою, розворот, зсув. Для кожної є стандартний шаблон: накопичувач перед циклом, перебір, оновлення накопичувача. Масиви примітивів швидші й економніші за колекції, тому їх вживають у продуктивному коді, а для звичайного прикладного коду частіше беруть <code>ArrayList</code>, про який йтиметься далі.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 2, 9, 7};
        int sum = 0;
        for (int i = 0; i < nums.length; i++) {
            sum += nums[i];
        }
        System.out.println("length = " + nums.length + ", sum = " + sum);
        for (int x : nums) {
            System.out.print(x + " ");
        }
        System.out.println();
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int[] numbers = new int[3];
        boolean[] flags = new boolean[2];
        String[] words = new String[2];
        System.out.println(numbers[0] + " " + flags[0] + " " + words[0]);   // 0 false null
        words[0] = "java";
        System.out.println(words[0].length());
    }
}`,
      String.raw`public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = a;              // те саме посилання, не копія
        b[0] = 99;
        System.out.println(a[0]); // 99
        int[] c = a.clone();      // справжня копія
        c[1] = 77;
        System.out.println(a[1]); // 2
    }
}`,
      String.raw`// аварія: індекс 3 виходить за межі масиву з трьох елементів, ArrayIndexOutOfBoundsException
public class Main {
    public static void main(String[] args) {
        int[] nums = {10, 20, 30};
        for (int i = 0; i <= nums.length; i++) {
            System.out.println(nums[i]);
        }
    }
}`,
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {3, 1, 2};
        System.out.println(Arrays.toString(nums));
        System.out.println(nums.length);
        char[] letters = {'a', 'b', 'c'};
        System.out.println(letters);                 // char[] друкується як текст
        System.out.println(Arrays.toString(letters));
    }
}`,
    ],
    note: String.raw`Розмір масиву задається один раз. Змінна масиву зберігає посилання, тому <code>int[] b = a;</code> не копіює дані, а лише створює друге ім'я для того самого масиву. Для виводу вмісту потрібен <code>Arrays.toString</code>.`,
    work: String.raw`Масиви лежать в основі решти колекцій і зустрічаються в аргументах командного рядка, буферах читання файлів, обробці зображень і числових обчисленнях. У прикладному коді їх використовують рідше за списки, але розуміти, як вони влаштовані й чому мають фіксований розмір, потрібно для коректної роботи з колекціями.`,
    tasks: [
      String.raw`Що виведе <code>int[] a = {1, 2, 3}; int[] b = a; b[0] = 9; System.out.println(a[0]);</code> і чому?`,
      String.raw`Чому <code>new String[3]</code> не містить трьох порожніх рядків і що станеться при виклику <code>length()</code> на його елементі?`,
    ],
  },
  {
    t: "Утиліти Arrays: sort, fill, copyOf, equals",
    ch: "Колекції",
    easy: String.raw`Arrays — це ящик інструментів для масивів: відсортувати, заповнити, скопіювати, порівняти й показати вміст можна одним викликом, а не власним циклом.`,
    p: [
      String.raw`Клас <code>java.util.Arrays</code> містить статичні методи для роботи з масивами. Найчастіше потрібні <code>toString</code> (вміст у вигляді рядка), <code>sort</code>, <code>fill</code>, <code>copyOf</code>, <code>copyOfRange</code>, <code>equals</code>, <code>binarySearch</code> та <code>asList</code>. Усі вони приймають масив першим аргументом. Імпорт: <code>import java.util.Arrays;</code>.`,
      String.raw`Виклик <code>Arrays.sort(a)</code> сортує масив на місці за зростанням. Для примітивів використовується швидке сортування, для об'єктів — стабільне. Можна сортувати лише частину: <code>Arrays.sort(a, from, to)</code> (кінець не входить). Рядки сортуються за кодами символів, тому великі літери йдуть перед малими. Для іншого порядку потрібен компаратор, про що в уроці про сортування.`,
      String.raw`Метод <code>Arrays.fill(a, value)</code> заповнює весь масив однаковим значенням, а <code>Arrays.fill(a, from, to, value)</code> — його частину. Це зручно для ініціалізації лічильників чи значення «невідомо». <code>Arrays.copyOf(a, newLength)</code> повертає нову копію заданої довжини: якщо довжина більша, додаткові комірки заповнюються нулями, якщо менша — хвіст відкидається. <code>copyOfRange(a, from, to)</code> копіює проміжок.`,
      String.raw`Метод <code>Arrays.equals(a, b)</code> порівнює вміст двох масивів (довжину й елементи по порядку), на відміну від <code>a == b</code> та <code>a.equals(b)</code>, які порівнюють лише посилання. Для багатовимірних масивів є <code>deepEquals</code> і <code>deepToString</code>. Не покладайтеся на <code>equals</code> самого масиву: він успадкований від Object і не порівнює вміст.`,
      String.raw`Метод <code>Arrays.binarySearch(a, key)</code> шукає значення у вже відсортованому масиві за логарифмічний час і повертає його індекс. Якщо значення відсутнє, результат від'ємний: мінус місце вставки мінус один. Якщо масив не відсортовано, результат непередбачуваний, тому спершу викликайте <code>sort</code>. Для одного пошуку в невідсортованому масиві простіший звичайний цикл.`,
      String.raw`Виклик <code>Arrays.asList(1, 2, 3)</code> повертає список фіксованого розміру, який «дивиться» на масив: елементи можна міняти, а додавати чи видаляти не можна (<code>UnsupportedOperationException</code>). Щоб отримати звичайний змінний список, його обгортають: <code>new ArrayList&lt;&gt;(Arrays.asList(...))</code>. Для масивів примітивів <code>asList</code> працює не так, як очікують: <code>int[]</code> стає списком із єдиного елемента.`,
      String.raw`Утиліти не змінюють розмір масиву: <code>copyOf</code> створює новий масив, а старий лишається. Щоб «додати» елемент у масив, його копіюють у більший, і саме це робить <code>ArrayList</code> автоматично, коли заповнюється. Поєднання <code>sort</code>, <code>binarySearch</code> і <code>copyOf</code> закриває більшість задач, поки не знадобляться повноцінні колекції. Перед використанням методу корисно зазирнути в його документацію: у класі Arrays десятки перевантажень для різних типів, і потрібна версія часто вже існує. Вивчіть чотири-п'ять найуживаніших і заглядайте в довідку для решти, замість того щоб писати власні цикли.`,
    ],
    code: [
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] data = {9, 3, 7, 1, 5};
        Arrays.sort(data);
        System.out.println(Arrays.toString(data));
        String[] words = {"pear", "Apple", "banana"};
        Arrays.sort(words);
        System.out.println(Arrays.toString(words));   // велика літера йде першою
    }
}`,
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] zeros = new int[4];
        Arrays.fill(zeros, 7);
        System.out.println(Arrays.toString(zeros));
        int[] a = {1, 2, 3};
        System.out.println(Arrays.toString(Arrays.copyOf(a, 5)));   // [1, 2, 3, 0, 0]
        System.out.println(Arrays.toString(Arrays.copyOf(a, 2)));   // [1, 2]
        System.out.println(Arrays.toString(Arrays.copyOfRange(a, 1, 3)));
    }
}`,
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println(a == b);                 // false: різні об'єкти
        System.out.println(a.equals(b));            // false: equals масиву порівнює посилання
        System.out.println(Arrays.equals(a, b));    // true: порівняння вмісту
    }
}`,
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] sorted = {1, 3, 5, 7, 9};
        System.out.println(Arrays.binarySearch(sorted, 7));   // 3
        System.out.println(Arrays.binarySearch(sorted, 4));   // -3: місце вставки 2, мінус 2, мінус 1
    }
}`,
      String.raw`// аварія: список із Arrays.asList має фіксований розмір, add кидає UnsupportedOperationException
import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Ira", "Taras");
        names.set(0, "Olha");
        System.out.println(names);
        names.add("Petro");
    }
}`,
    ],
    note: String.raw`<code>Arrays.sort</code> змінює масив на місці, а <code>copyOf</code> створює новий. Вміст порівнюйте через <code>Arrays.equals</code>, а не <code>==</code>, і сортуйте масив перед <code>binarySearch</code>.`,
    work: String.raw`Бібліотечні методи Arrays економлять код і помилки: сортування, копіювання й пошук, написані вручну, майже завжди повільніші й помилковіші. На код-рев'ю власний цикл, який повторює <code>Arrays.fill</code> чи <code>copyOf</code>, зазвичай просять замінити готовим викликом.`,
    tasks: [
      String.raw`Чому <code>Arrays.binarySearch</code> на невідсортованому масиві може дати неправильний результат?`,
      String.raw`Як зробити копію масиву з 5 елементів, збільшену до 8, і чим заповняться нові комірки?`,
    ],
  },
  {
    t: "ArrayList: основи й узагальнений синтаксис",
    ch: "Колекції",
    easy: String.raw`ArrayList — це розтяжна шафа: коли комірки закінчуються, вона сама збільшується. Ви лише додаєте й дістаєте елементи, а розмір шафи — її власна справа.`,
    p: [
      String.raw`<code>ArrayList&lt;T&gt;</code> — динамічний масив із пакета <code>java.util</code>, розмір якого змінюється автоматично. Створення: <code>List&lt;Integer&gt; nums = new ArrayList&lt;&gt;();</code>. Тип у кутових дужках — параметр узагальненого типу (generics): <code>ArrayList&lt;String&gt;</code> зберігає лише рядки, і компілятор не пропустить інші. Порожні кутові дужки <code>&lt;&gt;</code> справа (ромб) дозволяють компілятору вивести тип із лівої частини.`,
      String.raw`Змінну прийнято оголошувати типом інтерфейсу <code>List</code>, а створювати конкретний клас: <code>List&lt;String&gt; names = new ArrayList&lt;&gt;();</code>. Так згодом можна замінити реалізацію (наприклад, на <code>LinkedList</code>), не чіпаючи решти коду. Про інтерфейси докладно йтиметься в окремій главі, поки вживайте цей шаблон як є.`,
      String.raw`Основні методи: <code>add(x)</code> додає в кінець, <code>get(i)</code> повертає елемент за індексом, <code>set(i, x)</code> замінює, <code>size()</code> дає кількість (а не довжину масиву), а ще <code>isEmpty()</code>, <code>contains(x)</code>, <code>indexOf(x)</code> та <code>clear()</code>. Індекс за межами від <code>0</code> до <code>size() - 1</code> кидає <code>IndexOutOfBoundsException</code>.`,
      String.raw`Колекції зберігають лише об'єкти, а не примітиви: <code>List&lt;int&gt;</code> не існує. Замість нього пишуть <code>List&lt;Integer&gt;</code>: Java автоматично перетворює <code>int</code> на <code>Integer</code> і назад (автоупаковка й розпакування). Для кожного примітива є клас-обгортка: <code>Double</code>, <code>Long</code>, <code>Boolean</code>, <code>Character</code>.`,
      String.raw`Виклик <code>System.out.println(list)</code> дає читабельний вигляд <code>[2, 4, 10]</code>: у колекцій метод <code>toString</code> реалізовано, на відміну від масивів. Перебирають список циклом for-each (<code>for (String s : names)</code>) або звичайним for із <code>get(i)</code>. Змінювати розмір списку під час for-each не можна, докладніше про це в окремому уроці про ітератори.`,
      String.raw`Порівняння з масивом: розмір списку змінний і є готові методи, але зберігаються лише об'єкти, а доступ трохи повільніший. Перетворення: <code>Arrays.asList(1, 2, 3)</code> дає список із масиву, а <code>list.toArray(new String[0])</code> — масив зі списку. Для початкових значень зручний <code>List.of(1, 2, 3)</code> (Java 9 і новіші), який повертає незмінний список.`,
      String.raw`Типові помилки: звернення до порожнього списку (<code>get(0)</code> при <code>size() == 0</code>), використання <code>length</code> чи <code>length()</code> замість <code>size()</code>, спроба зберігати примітиви, плутанина між <code>List.of</code> (незмінний) і <code>new ArrayList&lt;&gt;()</code> (змінний). Читайте повідомлення компілятора: воно зазвичай прямо вказує на невідповідність типів. Пам'ятайте також, що узагальнення працюють лише під час компіляції, а під час виконання тип у кутових дужках стирається, про що розповімо в главі про generics.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Ira");
        names.add("Taras");
        names.add("Olha");
        System.out.println(names);
        System.out.println(names.size() + " " + names.get(1));
        names.set(1, "Petro");
        for (String s : names) {
            System.out.println(s);
        }
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>();
        nums.add(10);              // автоупаковка int -> Integer
        nums.add(20);
        int first = nums.get(0);   // розпакування Integer -> int
        System.out.println(first + nums.get(1));
        System.out.println(nums.contains(20) + " " + nums.indexOf(20) + " " + nums.indexOf(99));
    }
}`,
      String.raw`// аварія: List.of повертає незмінний список, додавати до нього не можна
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> fixed = List.of("a", "b");
        System.out.println(fixed);
        fixed.add("c");
    }
}`,
      String.raw`// не компілюється: у кутових дужках потрібен клас, а не примітив
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<int> nums = new ArrayList<>();
        System.out.println(nums);
    }
}`,
      String.raw`// аварія: у порожньому списку немає елемента з індексом 0, IndexOutOfBoundsException
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> empty = new ArrayList<>();
        System.out.println(empty.isEmpty());
        System.out.println(empty.get(0));
    }
}`,
    ],
    note: String.raw`У колекціях лежать лише об'єкти: замість <code>List&lt;int&gt;</code> пишуть <code>List&lt;Integer&gt;</code>. Кількість елементів дає <code>size()</code>, а <code>List.of(...)</code> повертає незмінний список, до якого не можна додавати.`,
    work: String.raw`ArrayList — найуживаніша колекція в Java: результати запитів до бази, списки замовлень, відповіді API майже завжди з'являються як <code>List</code>. Змінну типізують інтерфейсом, а реалізацію обирають у місці створення. Цей прийом ви бачитимете в кожному проєкті.`,
    tasks: [
      String.raw`Чому <code>List&lt;int&gt;</code> не компілюється і чим його замінити?`,
      String.raw`Створіть список із трьох рядків, додайте четвертий і виведіть кількість елементів та сам список.`,
    ],
  },
  {
    t: "ArrayList: вставка, видалення й вартість операцій",
    ch: "Колекції",
    easy: String.raw`Додати людину в кінець черги легко, а вставити в середину доведеться посунути всіх, хто стоїть далі. Вартість операцій над списком залежить від того, де саме в ньому ви працюєте.`,
    p: [
      String.raw`Вставка на позицію: <code>list.add(index, x)</code> зсуває всі наступні елементи вправо; допустимі індекси від <code>0</code> до <code>size()</code> включно. Видалення за індексом: <code>list.remove(index)</code> повертає видалений елемент і зсуває решту вліво. Додавання в кінець (<code>add(x)</code>) зазвичай найдешевше.`,
      String.raw`Пастка перевантаження <code>remove</code>: для <code>List&lt;Integer&gt;</code> виклик <code>remove(1)</code> видаляє елемент з індексом 1, а не число 1. Щоб видалити за значенням, пишуть <code>remove(Integer.valueOf(1))</code>. Для <code>List&lt;String&gt;</code> такої плутанини немає: <code>remove("a")</code> видаляє перше входження рядка й повертає <code>true</code> або <code>false</code>.`,
      String.raw`Вартість: <code>get(i)</code> та <code>set(i, x)</code> виконуються миттєво (O(1)), бо під капотом лежить масив. Додавання в кінець в середньому теж O(1): коли внутрішній масив заповнений, список створює більший (приблизно в півтора раза) і копіює дані. Вставка чи видалення на початку або посередині коштує O(n), бо потрібен зсув. Методи <code>contains</code> та <code>indexOf</code> також O(n): це послідовний пошук.`,
      String.raw`Масові операції: <code>addAll(other)</code> додає всі елементи, <code>removeAll(other)</code> видаляє всі, що є в іншій колекції, <code>retainAll</code> лишає лише спільні, а <code>subList(from, to)</code> повертає «вікно» на частину списку (не копію). Метод <code>removeIf(умова)</code> видаляє елементи за умовою, але приймає лямбда-вираз, який докладно розглянемо в главі про інтерфейси.`,
      String.raw`<code>subList</code> — це подання, а не копія: зміни у вікні видно в оригіналі, а структурна зміна оригіналу після створення вікна робить вікно непридатним (<code>ConcurrentModificationException</code>). Якщо потрібна незалежна копія, пишуть <code>new ArrayList&lt;&gt;(list.subList(1, 3))</code>. Копіювальний конструктор <code>new ArrayList&lt;&gt;(other)</code> створює поверхневу копію: елементи лишаються тими самими об'єктами.`,
      String.raw`Якщо приблизну кількість елементів відомо наперед, її можна передати в конструктор: <code>new ArrayList&lt;&gt;(1000)</code>. Це початкова місткість, а не розмір: <code>size()</code> лишається нулем. Так список рідше перевиділяє пам'ять. У більшості програм такі мікрооптимізації не потрібні, але корисно розуміти, що ховається за словом «динамічний».`,
      String.raw`Видалення в циклі — класична помилка: коли видаляєте елемент у <code>for (int i...)</code>, наступні елементи зсуваються, і ви пропускаєте один. Безпечні способи: перебирати від кінця до початку, використати <code>removeIf</code> або ітератор (окремий урок). Видалення зі списку під час for-each кидає <code>ConcurrentModificationException</code>.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("a", "b", "c"));
        list.add(1, "X");                       // [a, X, b, c]
        System.out.println(list);
        String removed = list.remove(2);        // видаляє "b"
        System.out.println(removed + " " + list);
        System.out.println(list.remove("c") + " " + list);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(10, 20, 30, 40));
        nums.remove(1);                         // за індексом: видалено 20
        System.out.println(nums);
        nums.remove(Integer.valueOf(40));       // за значенням: видалено 40
        System.out.println(nums);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        List<Integer> view = nums.subList(1, 4);
        view.set(0, 99);                        // змінює й оригінал
        System.out.println(nums);
        List<Integer> copy = new ArrayList<>(nums.subList(1, 4));
        copy.clear();
        System.out.println(nums.size());
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        for (int i = nums.size() - 1; i >= 0; i--) {   // з кінця, щоб зсув не заважав
            if (nums.get(i) % 2 == 0) {
                nums.remove(i);
            }
        }
        System.out.println(nums);
    }
}`,
      String.raw`// аварія: вставка за межами size(), IndexOutOfBoundsException
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("a", "b"));
        list.add(2, "c");
        System.out.println(list);
        list.add(5, "x");
    }
}`,
    ],
    note: String.raw`Для <code>List&lt;Integer&gt;</code> виклик <code>remove(1)</code> видаляє елемент за індексом 1, а не число 1: для видалення за значенням пишіть <code>remove(Integer.valueOf(1))</code>. Вставка й видалення посередині списку зсувають усі наступні елементи.`,
    work: String.raw`Вибір структури даних впливає на швидкість: список із мільйона елементів, у який постійно вставляють на початок, працюватиме повільно. Тому чергу чи стек реалізують іншими структурами, а ArrayList лишають для випадків, де переважають читання й додавання в кінець.`,
    tasks: [
      String.raw`Що лишиться в списку <code>[10, 20, 30, 40]</code> після <code>remove(1)</code>, а що після <code>remove(Integer.valueOf(1))</code>?`,
      String.raw`Чому видалення зі списку в циклі з індексом від початку може пропустити елементи?`,
    ],
  },
  {
    t: "LinkedList, ArrayDeque і черги",
    ch: "Колекції",
    adv: true,
    easy: String.raw`Черга в магазині працює за принципом «перший прийшов, перший обслужений», а стопка тарілок — «останню поклали, першою взяли». ArrayDeque вміє і те, й інше, до того ж швидше за звичайні списки.`,
    p: [
      String.raw`Інтерфейс <code>Queue</code> описує чергу за принципом FIFO (first in, first out): <code>offer(x)</code> додає в кінець, <code>poll()</code> забирає з початку (а для порожньої черги повертає <code>null</code>), <code>peek()</code> дивиться на голову без видалення. Методи <code>add</code>, <code>remove</code> і <code>element</code> роблять те саме, але для порожньої черги кидають виняток.`,
      String.raw`Інтерфейс <code>Deque</code> (двостороння черга) додає операції з обох кінців: <code>addFirst</code>, <code>addLast</code>, <code>pollFirst</code>, <code>pollLast</code>, <code>peekFirst</code>, <code>peekLast</code>. Одну структуру можна використати і як чергу (додаємо в кінець, беремо з початку), і як стек: <code>push</code> кладе на вершину, <code>pop</code> знімає, <code>peek</code> дивиться.`,
      String.raw`<code>ArrayDeque</code> реалізує двосторонню чергу на круговому масиві: усі операції на кінцях виконуються в середньому за O(1), пам'ять використовується економно. Це типовий вибір і для черги, і для стека. Він не зберігає <code>null</code> і не є потокобезпечним. Старі класи <code>Stack</code> та <code>Vector</code> вважають застарілими.`,
      String.raw`<code>LinkedList</code> реалізує і <code>List</code>, і <code>Deque</code>: це двозв'язний список, у якому кожен елемент посилається на сусідів. Вставка й видалення на кінцях коштують O(1), але доступ за індексом <code>get(i)</code> — O(n), бо треба йти від початку. На практиці <code>ArrayDeque</code> майже завжди швидший, а <code>LinkedList</code> вибирають рідко.`,
      String.raw`Приклад стека — перевірка парності дужок. Для кожної відкритої дужки кладемо її в стек, а для кожної закритої знімаємо вершину й перевіряємо, що вона парна. Якщо стек порожній під час зняття або не порожній наприкінці, дужки розставлено неправильно. Така задача — класичне застосування стека.`,
      String.raw`Приклад черги — обхід у ширину, обробка завдань за порядком надходження, буфер повідомлень. Для черги з пріоритетами є <code>PriorityQueue</code>: <code>poll()</code> завжди віддає найменший елемент за природним порядком (або за компаратором), а не найстаріший. Порядок перебору <code>PriorityQueue</code> не відсортований, гарантовано найменшою є лише голова.`,
      String.raw`Вибір: потрібен стек чи звичайна черга — <code>ArrayDeque</code>; потрібна черга з пріоритетами — <code>PriorityQueue</code>; потрібен список із доступом за індексом — <code>ArrayList</code>; потрібні вставки всередину за готовим вузлом — <code>LinkedList</code> (рідко). Усі ці типи живуть у пакеті <code>java.util</code>, імпортуйте їх явно. Якщо сумніваєтеся, починайте з ArrayDeque: переходити на інший тип потрібно лише тоді, коли з'являється конкретна вимога, наприклад пріоритет елементів чи доступ за індексом. Така звичка економить час і зменшує кількість зайвих класів у коді, а вимоги легше зрозуміти, коли вони вже виникли.`,
    ],
    code: [
      String.raw`import java.util.ArrayDeque;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        Queue<String> queue = new ArrayDeque<>();
        queue.offer("first");
        queue.offer("second");
        queue.offer("third");
        System.out.println(queue.peek());
        System.out.println(queue.poll());
        System.out.println(queue.poll());
        System.out.println(queue.size());
    }
}`,
      String.raw`import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println(stack.peek());   // 3
        System.out.println(stack.pop());    // 3
        System.out.println(stack.pop());    // 2
        System.out.println(stack);
    }
}`,
      String.raw`import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) {
                    return false;
                }
                char open = stack.pop();
                boolean ok = (open == '(' && c == ')') || (open == '[' && c == ']') || (open == '{' && c == '}');
                if (!ok) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(isBalanced("([]{})"));
        System.out.println(isBalanced("([)]"));
    }
}`,
      String.raw`import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(5);
        pq.offer(1);
        pq.offer(3);
        System.out.println(pq.poll());   // 1: найменший
        System.out.println(pq.poll());   // 3
        System.out.println(pq.peek());   // 5
    }
}`,
      String.raw`// аварія: pop() на порожньому стеку кидає NoSuchElementException
import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    public static void main(String[] args) {
        Deque<String> stack = new ArrayDeque<>();
        System.out.println(stack.pollFirst());   // null: безпечний варіант
        System.out.println(stack.pop());
    }
}`,
    ],
    note: String.raw`Методи <code>offer</code>, <code>poll</code> і <code>peek</code> для порожньої черги повертають <code>null</code> або <code>false</code>, а <code>add</code>, <code>remove</code> і <code>pop</code> кидають <code>NoSuchElementException</code>. Для стека й черги беріть <code>ArrayDeque</code>, а не <code>Stack</code>.`,
    work: String.raw`Черги й стеки лежать в основі обходу графів, обробки завдань, історії дій (undo), розбору виразів, буферів повідомлень. У багатопотоковому коді ті самі ідеї втілюють потокобезпечні черги з java.util.concurrent, про які буде окрема глава. Правильний вибір структури одразу прибирає цілий клас повільних рішень.`,
    tasks: [
      String.raw`Чим відрізняється <code>poll()</code> від <code>remove()</code> для порожньої черги?`,
      String.raw`Яку структуру використати для історії дій «скасувати» і чому?`,
    ],
  },
  {
    t: "Двовимірні масиви",
    ch: "Колекції",
    adv: true,
    easy: String.raw`Двовимірний масив — це таблиця з рядками й стовпцями, де кожна клітинка має адресу з двох чисел. У Java таблиця насправді є масивом рядків, і кожен рядок — окремий масив.`,
    p: [
      String.raw`Двовимірний масив оголошують так: <code>int[][] grid = new int[3][4];</code> — це 3 рядки, 4 стовпці, і всюди нулі. Літерал: <code>int[][] m = {{1, 2, 3}, {4, 5, 6}};</code>. Елемент у рядку <code>r</code> і стовпці <code>c</code> — це <code>m[r][c]</code>. Вираз <code>m.length</code> дає кількість рядків, а <code>m[0].length</code> — довжину першого рядка.`,
      String.raw`У Java «матриця» — це масив масивів. Кожен рядок є окремим об'єктом, тому рядки можуть мати різну довжину (так званий ламаний, jagged-масив): <code>int[][] tri = new int[3][]; tri[0] = new int[1]; tri[1] = new int[2];</code>. Через це внутрішню межу циклу пишуть як <code>m[r].length</code>, а не як довжину першого рядка.`,
      String.raw`Вкладений цикл — стандартний спосіб обходу: зовнішній іде по рядках, внутрішній по стовпцях. Порядок «рядок за рядком» відповідає розташуванню даних у пам'яті, тому він швидший за обхід стовпець за стовпцем. Приклади: сума всіх елементів, сума рядка, пошук максимуму.`,
      String.raw`Для зручного перегляду є <code>Arrays.deepToString(m)</code>: звичайний <code>Arrays.toString</code> показав би лише посилання на внутрішні масиви. Порівняти вміст допомагає <code>Arrays.deepEquals</code>. Копіювання через <code>m.clone()</code> і <code>Arrays.copyOf</code> створює поверхневу копію (рядки спільні), тому для справжньої копії копіюють кожен рядок окремо.`,
      String.raw`Типові задачі: таблиця множення, транспонування (рядки стають стовпцями), діагоналі, ігрове поле (хрестики-нулики, сапер), зображення як сітка пікселів. Для сіток корисний прийом перебору сусідів через масив зсувів: пари <code>{-1,0}</code>, <code>{1,0}</code>, <code>{0,-1}</code>, <code>{0,1}</code> і обов'язкова перевірка меж.`,
      String.raw`Помилки меж: <code>m[3][0]</code> для трьох рядків дає <code>ArrayIndexOutOfBoundsException</code>, а переплутані <code>r</code> і <code>c</code> у вкладеному циклі — окрема класика, особливо для неквадратних матриць. Якщо рядків 3, а стовпців 4, то межа зовнішнього циклу дорівнює 3, а внутрішнього 4, і ніколи навпаки.`,
      String.raw`Для більших структур (таблиця записів, сітка з об'єктами) краще брати список об'єктів чи власний клас замість двовимірного масиву: імена полів пояснюють зміст краще, ніж індекси. Проте для чисельних розрахунків і ігрових полів двовимірні масиви цілком доречні й швидкі. Для великих сіток корисно пам'ятати про пам'ять: масив із мільйона рядків по мільйону клітинок не поміститься в пам'яті, тому для розріджених даних, де більшість клітинок порожні, використовують мапу координат або спеціальні структури.`,
    ],
    code: [
      String.raw`public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}};
        int sum = 0;
        for (int r = 0; r < m.length; r++) {
            for (int c = 0; c < m[r].length; c++) {
                sum += m[r][c];
            }
        }
        System.out.println("rows = " + m.length + ", cols = " + m[0].length + ", sum = " + sum);
    }
}`,
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] tri = new int[3][];
        for (int r = 0; r < tri.length; r++) {
            tri[r] = new int[r + 1];
            Arrays.fill(tri[r], r);
        }
        System.out.println(Arrays.deepToString(tri));
    }
}`,
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}};
        int[][] t = new int[3][2];
        for (int r = 0; r < 2; r++) {
            for (int c = 0; c < 3; c++) {
                t[c][r] = m[r][c];
            }
        }
        System.out.println(Arrays.deepToString(t));
    }
}`,
      String.raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] a = {{1, 2}, {3, 4}};
        int[][] shallow = a.clone();        // рядки спільні
        shallow[0][0] = 99;
        System.out.println(a[0][0]);        // 99
        int[][] deep = new int[a.length][];
        for (int r = 0; r < a.length; r++) {
            deep[r] = a[r].clone();
        }
        deep[1][1] = 77;
        System.out.println(Arrays.deepToString(a));
    }
}`,
      String.raw`// аварія: матриця має 2 рядки й 3 стовпці, а внутрішній цикл виходить за межі рядка
public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}};
        for (int r = 0; r < m.length; r++) {
            for (int c = 0; c < m.length + 2; c++) {
                System.out.println(m[r][c]);
            }
        }
    }
}`,
    ],
    note: String.raw`Двовимірний масив — це масив масивів: <code>m.length</code> дає кількість рядків, а <code>m[r].length</code> — довжину конкретного рядка. Для виводу беріть <code>Arrays.deepToString</code>, а для копії копіюйте кожен рядок окремо.`,
    work: String.raw`Сітки зустрічаються в іграх, обробці зображень, картах, таблицях даних і алгоритмах динамічного програмування. Уміння обходити й транспонувати матрицю перевіряють на співбесідах, а в промисловому коді її часто замінюють спеціалізованими структурами, але принцип «рядок і стовпець» лишається тим самим.`,
    tasks: [
      String.raw`Скільки елементів у <code>new int[3][4]</code> і як дістатися до останнього з них?`,
      String.raw`Напишіть цикл, який виводить таблицю множення 3 на 3 з двовимірного масиву.`,
    ],
  },
  {
    t: "HashMap",
    ch: "Колекції",
    easy: String.raw`HashMap — це словник або картотека: за ключем (прізвищем) миттєво знаходиться картка (значення), і не треба гортати всі картки по черзі.`,
    p: [
      String.raw`<code>Map&lt;K, V&gt;</code> зберігає пари «ключ — значення». Ключі унікальні: повторне додавання з тим самим ключем замінює значення. <code>HashMap</code> — найуживаніша реалізація: пошук, вставка й видалення за ключем виконуються в середньому за O(1). Створення: <code>Map&lt;String, Integer&gt; ages = new HashMap&lt;&gt;();</code>, причому змінну, як і для списків, типізують інтерфейсом.`,
      String.raw`Основні методи: <code>put(k, v)</code> додає або замінює (повертає старе значення чи <code>null</code>), <code>get(k)</code> повертає значення або <code>null</code>, <code>containsKey(k)</code>, <code>containsValue(v)</code>, <code>remove(k)</code>, <code>size()</code>, <code>isEmpty()</code> і <code>clear()</code>. Запам'ятайте: <code>get</code> для відсутнього ключа повертає <code>null</code>, а не кидає виняток.`,
      String.raw`Через це розпакування може впасти: <code>int n = map.get("x");</code> для відсутнього ключа кидає <code>NullPointerException</code>, бо <code>null</code> не можна перетворити на <code>int</code>. Тому перед <code>get</code> перевіряють <code>containsKey</code> або користуються <code>getOrDefault</code> (наступний урок). Це найчастіша помилка при роботі з мапами.`,
      String.raw`Перебір: <code>map.keySet()</code> дає ключі, <code>map.values()</code> значення, а <code>map.entrySet()</code> пари <code>Map.Entry&lt;K, V&gt;</code> з методами <code>getKey()</code> і <code>getValue()</code>. Перебір пар через <code>entrySet</code> ефективніший за цикл по ключах із викликом <code>get</code> на кожен. Вивід <code>System.out.println(map)</code> має вигляд <code>{a=1, b=2}</code>.`,
      String.raw`Порядок елементів у <code>HashMap</code> не гарантується: він залежить від хеш-кодів ключів і може змінюватися. Не спирайтеся на порядок виводу. Якщо потрібен порядок вставки, є <code>LinkedHashMap</code>, а якщо відсортований за ключем — <code>TreeMap</code>, про які ми поговоримо в наступних уроках.`,
      String.raw`Як це працює: ключ перетворюється на число методом <code>hashCode()</code>, за цим числом обирається «кошик», а всередині кошика ключі порівнюються через <code>equals</code>. Тому для ключів власних класів потрібно узгоджено перевизначати обидва методи (окремий урок про <code>equals</code> і <code>hashCode</code>). Рядки й обгортки чисел уже мають правильні реалізації й ідеально підходять як ключі.`,
      String.raw`Ключі мають бути незмінними: якщо змінити поле ключа після вставки, його хеш-код зміниться, і запис «загубиться» в мапі. Через це як ключі беруть рядки, числа, <code>enum</code> і <code>record</code>. Дозволено один ключ <code>null</code> і значення <code>null</code>, але з ними краще не мати справи, бо вони приховують помилки. Мапа не гарантує нічого, окрім відповідності ключа значенню, тому на кожному кроці уявляйте, що її вміст розкладено у випадковому порядку. Такий підхід захищає від тестів, які проходять лише випадково, і від помилок, що з'являються після оновлення версії Java.`,
    ],
    code: [
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> ages = new HashMap<>();
        ages.put("Ira", 17);
        ages.put("Taras", 20);
        ages.put("Ira", 18);                 // заміна значення
        System.out.println(ages.get("Ira"));
        System.out.println(ages.size() + " " + ages.containsKey("Olha"));
        System.out.println(ages.get("Olha"));   // null
    }
}`,
      String.raw`import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = new LinkedHashMap<>();
        stock.put("apple", 5);
        stock.put("pear", 3);
        stock.put("plum", 8);
        for (Map.Entry<String, Integer> e : stock.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }
        int total = 0;
        for (int v : stock.values()) {
            total += v;
        }
        System.out.println("total = " + total);
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        System.out.println(m.put("a", 1));      // null: ключа не було
        System.out.println(m.put("a", 2));      // 1: старе значення
        System.out.println(m.remove("a"));      // 2
        System.out.println(m.isEmpty());
    }
}`,
      String.raw`// аварія: get повертає null, а розпакування null у int кидає NullPointerException
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        m.put("a", 1);
        int a = m.get("a");
        System.out.println(a);
        int missing = m.get("zzz");
        System.out.println(missing);
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        m.put("a", 1);
        if (m.containsKey("b")) {
            System.out.println(m.get("b"));
        } else {
            System.out.println("no b");
        }
        Integer boxed = m.get("b");           // посилальний тип безпечно приймає null
        System.out.println(boxed == null);
    }
}`,
    ],
    note: String.raw`<code>get</code> для відсутнього ключа повертає <code>null</code>, а розпакування <code>int n = map.get(k)</code> тоді кидає <code>NullPointerException</code>. Порядок елементів у <code>HashMap</code> не гарантований: не покладайтеся на нього.`,
    work: String.raw`Мапи — основа кешів, індексів, лічильників, налаштувань і розбору JSON: усе, що шукається за ідентифікатором, зазвичай лежить у HashMap. Здорове правило: якщо ви шукаєте елемент у списку циклом за якоюсь властивістю, ймовірно, потрібна мапа з цією властивістю як ключем.`,
    tasks: [
      String.raw`Що поверне <code>map.get("x")</code>, якщо ключа немає, і чим це небезпечно для змінної типу <code>int</code>?`,
      String.raw`Чому не варто покладатися на порядок елементів у <code>HashMap</code>?`,
    ],
  },
  {
    t: "HashMap: getOrDefault, merge і вкладені мапи",
    ch: "Колекції",
    easy: String.raw`Лічильник у мапі схожий на зошит відвідувачів: якщо людини ще немає, ви записуєте її з одиничкою, а якщо вже є, збільшуєте число. Метод merge робить це одним рядком.`,
    p: [
      String.raw`Підрахунок за ключем — найчастіша задача: скільки разів зустрілось слово, скільки замовлень у клієнта. Наївний варіант виглядає так: <code>if (!map.containsKey(w)) map.put(w, 1); else map.put(w, map.get(w) + 1);</code> і потребує три звернення до мапи. Коротше й швидше пишуть через готові методи.`,
      String.raw`Метод <code>getOrDefault(key, def)</code> повертає значення або запасне, якщо ключа немає: <code>map.put(w, map.getOrDefault(w, 0) + 1);</code>. Це безпечне читання без <code>null</code> і без перевірки <code>containsKey</code>. Запасне значення не додається до мапи, воно лише повертається.`,
      String.raw`Метод <code>merge(key, value, функція)</code> робить усе одним викликом: якщо ключа немає, кладе <code>value</code>, інакше обчислює нове значення зі старого й <code>value</code> за вказаною функцією. Для лічильника: <code>map.merge(w, 1, Integer::sum);</code>. Запис <code>Integer::sum</code> — посилання на метод; докладно про такі записи розповімо в главі про лямбди, а поки сприймайте його як «додати».`,
      String.raw`Метод <code>putIfAbsent(k, v)</code> кладе значення, лише якщо ключа немає (або там <code>null</code>), і повертає наявне. <code>computeIfAbsent(k, функція)</code> створює значення за потреби: ідеально для мап зі списками, де потрібен «кошик» на кожен ключ: <code>groups.computeIfAbsent(len, k -&gt; new ArrayList&lt;&gt;()).add(word);</code>.`,
      String.raw`Вкладені мапи: <code>Map&lt;String, Map&lt;String, Integer&gt;&gt;</code>, наприклад продажі за містом і товаром. Додавання: <code>sales.computeIfAbsent(city, k -&gt; new HashMap&lt;&gt;()).merge(item, qty, Integer::sum);</code>. Читати треба обережно: внутрішня мапа може бути відсутня, тому перевіряйте <code>get</code> на <code>null</code> або користуйтеся <code>getOrDefault(city, Map.of())</code>.`,
      String.raw`Інші корисні методи: <code>compute</code> (перерахувати значення), <code>computeIfPresent</code>, <code>replaceAll</code>, <code>forEach((k, v) -&gt; ...)</code>, а також <code>Map.of(...)</code> і <code>Map.entry</code> для коротких незмінних мап (до десяти пар). Незмінна мапа <code>Map.of</code> кидає <code>UnsupportedOperationException</code> при спробі її змінити.`,
      String.raw`Вибір між варіантами: для лічильника береться <code>merge</code> (найкоротше), для читання із запасним значенням — <code>getOrDefault</code>, для «кошиків» — <code>computeIfAbsent</code>. Усі три читаються краще за ручний <code>if</code> і виконують пошук за ключем менше разів. Лямбди (<code>k -&gt; ...</code>) будуть докладно розглянуті в главі про інтерфейси, тут вони лише шаблон. На практиці після кількох застосувань ці методи запам'ятовуються як одна ідея: «знайти запис за ключем і оновити його одним викликом». Вони також безпечні для порожніх мап і не потребують попередньої перевірки наявності ключа.`,
    ],
    code: [
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        String[] words = {"to", "be", "or", "not", "to", "be"};
        Map<String, Integer> counts = new HashMap<>();
        for (String w : words) {
            counts.put(w, counts.getOrDefault(w, 0) + 1);
        }
        System.out.println(new TreeMap<>(counts));   // стабільний порядок за абеткою
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> sales = new HashMap<>();
        sales.merge("apple", 3, Integer::sum);
        sales.merge("apple", 4, Integer::sum);
        sales.merge("pear", 2, Integer::sum);
        System.out.println(new TreeMap<>(sales));
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Map<Integer, List<String>> byLength = new TreeMap<>();
        for (String w : "one two three four five six".split(" ")) {
            byLength.computeIfAbsent(w.length(), k -> new ArrayList<>()).add(w);
        }
        System.out.println(byLength);
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Map<String, Integer>> sales = new HashMap<>();
        sales.computeIfAbsent("Kyiv", k -> new HashMap<>()).merge("pen", 5, Integer::sum);
        sales.computeIfAbsent("Kyiv", k -> new HashMap<>()).merge("pen", 2, Integer::sum);
        sales.computeIfAbsent("Lviv", k -> new HashMap<>()).merge("ink", 1, Integer::sum);
        System.out.println(sales.get("Kyiv"));
        System.out.println(sales.getOrDefault("Odesa", Map.of()));
    }
}`,
      String.raw`// аварія: Map.of повертає незмінну мапу, put кидає UnsupportedOperationException
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> fixed = Map.of("a", 1, "b", 2);
        System.out.println(fixed.get("a"));
        fixed.put("c", 3);
    }
}`,
    ],
    note: String.raw`Лічильник найкоротше пишеться як <code>map.merge(key, 1, Integer::sum)</code>, а читання без <code>null</code> — як <code>getOrDefault(key, 0)</code>. Для мапи зі списками беріть <code>computeIfAbsent</code>, а <code>Map.of</code> повертає незмінну мапу.`,
    work: String.raw`У прикладному коді мапи з лічильниками й групуванням трапляються постійно: статистика запитів, групування замовлень за клієнтами, індекси слів. Методи merge і computeIfAbsent радять використовувати замість ручних перевірок: код стає коротшим, а помилок через забуту перевірку на null менше.`,
    tasks: [
      String.raw`Перепишіть цикл підрахунку з <code>if/else</code> і <code>containsKey</code> через <code>merge</code>.`,
      String.raw`Чим <code>putIfAbsent</code> відрізняється від <code>put</code>?`,
    ],
  },
  {
    t: "Множини: HashSet, LinkedHashSet і TreeSet",
    ch: "Колекції",
    easy: String.raw`Множина — це список запрошених без дублікатів: кожне ім'я там рівно один раз, і швидко можна перевірити, чи є людина в списку, а скільки разів вона записалась, ніхто не рахує.`,
    p: [
      String.raw`<code>Set&lt;E&gt;</code> зберігає унікальні елементи: повторне додавання ігнорується (<code>add</code> повертає <code>false</code>). Приклади застосування: унікальні слова, ідентифікатори, дозволені ролі. Основні методи: <code>add</code>, <code>contains</code>, <code>remove</code>, <code>size</code>, <code>isEmpty</code>, <code>clear</code>. Індексів у множини немає: елемент за номером узяти неможливо.`,
      String.raw`<code>HashSet</code> — найшвидша реалізація: <code>add</code>, <code>contains</code> і <code>remove</code> виконуються в середньому за O(1), бо всередині діє той самий хеш-механізм, що й у HashMap (власне, HashSet тримає елементи як ключі мапи). Порядок елементів не гарантований, тому не покладайтеся на нього.`,
      String.raw`<code>LinkedHashSet</code> додатково пам'ятає порядок додавання: перебір повертає елементи так, як їх вставляли. Він трохи повільніший і витрачає більше пам'яті, зате результат передбачуваний, що зручно для виводу й тестів. <code>TreeSet</code> тримає елементи відсортованими (за природним порядком або компаратором), і його операції коштують O(log n).`,
      String.raw`У <code>TreeSet</code> є методи навігації: <code>first()</code>, <code>last()</code>, <code>floor(x)</code> (найбільший не більший за x), <code>ceiling(x)</code> (найменший не менший за x), <code>higher</code>, <code>lower</code>, <code>headSet</code>, <code>tailSet</code>, <code>subSet</code>. Усі елементи мають бути порівнянними між собою: власні класи реалізують <code>Comparable</code> або отримують <code>Comparator</code>, інакше буде <code>ClassCastException</code>.`,
      String.raw`Унікальність визначається методами <code>equals</code> та <code>hashCode</code> (для HashSet) або <code>compareTo</code> чи компаратором (для TreeSet). Тому для власних класів без перевизначених <code>equals</code> і <code>hashCode</code> дві «однакові» за змістом сутності вважатимуться різними. Ця тема окремо розглянута в главі про типи користувача.`,
      String.raw`Операції над множинами: об'єднання — <code>a.addAll(b)</code>, перетин — <code>a.retainAll(b)</code>, різниця — <code>a.removeAll(b)</code>, перевірка підмножини — <code>a.containsAll(b)</code>. Усі вони змінюють <code>a</code>, тому для збереження вихідної множини спершу робіть копію: <code>new HashSet&lt;&gt;(a)</code>.`,
      String.raw`Видалити дублікати зі списку можна так: <code>new LinkedHashSet&lt;&gt;(list)</code> прибирає повтори й зберігає порядок. Перевірка належності — головна причина, чому множини швидші за списки: <code>contains</code> у списку коштує O(n), а в HashSet O(1). Для великих даних це різниця між миттєвим і відчутно повільним кодом. Також пам'ятайте, що множина не зберігає кількості: якщо потрібно знати, скільки разів зустрівся елемент, беріть мапу з лічильниками. А якщо потрібні й унікальність, і сортування, і навігація (найближче менше чи більше значення), найкращим вибором буде TreeSet, хоча він і повільніший за HashSet. Вибір залежить від того, що саме потрібно від колекції: швидкість, порядок вставки чи сортування.`,
    ],
    code: [
      String.raw`import java.util.HashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Set<String> tags = new HashSet<>();
        System.out.println(tags.add("java"));   // true
        System.out.println(tags.add("java"));   // false: уже є
        tags.add("code");
        System.out.println(tags.size() + " " + tags.contains("code"));
    }
}`,
      String.raw`import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        List<Integer> data = List.of(3, 1, 3, 2, 1);
        System.out.println(new LinkedHashSet<>(data));   // порядок вставки: [3, 1, 2]
        System.out.println(new TreeSet<>(data));         // відсортовано: [1, 2, 3]
        Set<Integer> unique = new LinkedHashSet<>(data);
        System.out.println(unique.size());
    }
}`,
      String.raw`import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<>();
        for (int x : new int[] {10, 20, 30, 40}) {
            set.add(x);
        }
        System.out.println(set.first() + " " + set.last());
        System.out.println(set.floor(25) + " " + set.ceiling(25));
        System.out.println(set.higher(40));
        System.out.println(set.headSet(30));
    }
}`,
      String.raw`import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3, 4));
        Set<Integer> b = new HashSet<>(Arrays.asList(3, 4, 5));
        Set<Integer> union = new HashSet<>(a);
        union.addAll(b);
        Set<Integer> common = new HashSet<>(a);
        common.retainAll(b);
        Set<Integer> only = new HashSet<>(a);
        only.removeAll(b);
        System.out.println(new TreeSet<>(union) + " " + new TreeSet<>(common) + " " + new TreeSet<>(only));
    }
}`,
      String.raw`// аварія: first() у порожньому TreeSet кидає NoSuchElementException
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        TreeSet<String> names = new TreeSet<>();
        System.out.println(names.isEmpty());
        System.out.println(names.first());
    }
}`,
    ],
    note: String.raw`Множина не має індексів і не пускає дублікатів: <code>add</code> повертає <code>false</code>, якщо елемент уже є. <code>HashSet</code> швидкий, але без порядку, <code>LinkedHashSet</code> тримає порядок вставки, <code>TreeSet</code> — відсортований.`,
    work: String.raw`Множини використовують для унікальних значень, перевірки належності (чи є користувач у списку заблокованих), видалення дублікатів і порівняння наборів. Поширений прийом: перенести список у HashSet перед багаторазовою перевіркою contains, щоб замінити повільний пошук у списку швидким.`,
    tasks: [
      String.raw`Який клас обрати, щоб видалити дублікати зі списку й зберегти порядок?`,
      String.raw`Чим перетин множин відрізняється від різниці й які методи їх виконують?`,
    ],
  },
  {
    t: "Сортування: Collections.sort і порядок елементів",
    ch: "Колекції",
    easy: String.raw`Сортування — це розкладання книжок на полиці за певним правилом: за абеткою, за роком, за автором. Правило можна замінити, а книжки лишаться тими самими.`,
    p: [
      String.raw`Виклик <code>Collections.sort(list)</code> сортує список на місці за природним порядком елементів: числа за зростанням, рядки за кодами символів. Починаючи з Java 8, те саме робить <code>list.sort(null)</code> і <code>list.sort(порівняльник)</code>. Сортування стабільне: рівні елементи зберігають взаємний порядок.`,
      String.raw`Природний порядок визначається інтерфейсом <code>Comparable</code>, тому сортувати можна лише списки, елементи яких його реалізують (<code>Integer</code>, <code>String</code>, <code>LocalDate</code> та інші). Спроба відсортувати список власних об'єктів без <code>Comparable</code> дає помилку компіляції або <code>ClassCastException</code>. Як зробити власний тип порівнянним, розповімо в главі про інтерфейси.`,
      String.raw`Для іншого порядку використовують <code>Comparator</code>. Готові варіанти: <code>Comparator.naturalOrder()</code>, <code>Comparator.reverseOrder()</code>, <code>String.CASE_INSENSITIVE_ORDER</code>, а також <code>Collections.reverseOrder()</code>. Сортування за спаданням: <code>list.sort(Comparator.reverseOrder());</code>. Власні компаратори пишуть лямбдою: <code>list.sort((a, b) -&gt; a.length() - b.length());</code>, докладно про це в главі про лямбди.`,
      String.raw`Рядки в природному порядку порівнюються за кодами символів: усі великі літери йдуть перед малими, а слово «Zebra» стоїть перед «apple». Для людського порядку без урахування регістру беруть <code>String.CASE_INSENSITIVE_ORDER</code>. Українські літери порівнюються за кодами Unicode, і «ї» чи «є» можуть займати не те місце, якого чекає читач: для мовного порядку існує <code>Collator</code>.`,
      String.raw`Корисні методи класу <code>Collections</code>: <code>reverse</code>, <code>shuffle</code> (перемішування, з <code>Random</code> та фіксованим seed для відтворюваності), <code>swap</code>, <code>max</code>, <code>min</code>, <code>frequency</code>, <code>unmodifiableList</code>, <code>binarySearch</code> (для відсортованого списку), <code>nCopies</code>, <code>emptyList</code>. Для масивів схожі методи є в <code>Arrays</code>.`,
      String.raw`Сортування мап і множин: <code>HashMap</code> не сортується, але його ключі можна покласти в <code>TreeMap</code> (<code>new TreeMap&lt;&gt;(map)</code>) для виводу за зростанням ключів. Щоб відсортувати за значеннями, елементи <code>entrySet</code> копіюють у список і сортують його з компаратором за <code>getValue()</code>. Саме така задача виникає при пошуку «топ-N слів».`,
      String.raw`Складність сортування — O(n log n). Сортуйте один раз і шукайте бінарним пошуком, а не сортуйте перед кожним пошуком. Якщо дані потрібно весь час тримати відсортованими, зручніші <code>TreeSet</code> або <code>TreeMap</code>. Змінювати елементи після сортування можна, але порядок тоді може перестати бути правильним. Тому дані, які змінюються, краще сортувати безпосередньо перед використанням або тримати в TreeSet чи TreeMap, які підтримують порядок самі. Це простіше, ніж стежити за станом ручного сортування. Помилка з порядком у звіті зазвичай виявляється вже в користувача, а не в тесті.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(5, 1, 9, 3));
        Collections.sort(nums);
        System.out.println(nums);
        List<String> names = new ArrayList<>(List.of("Oleh", "anna", "Zoya", "bohdan"));
        Collections.sort(names);
        System.out.println(names);   // великі літери йдуть першими
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Oleh", "anna", "Zoya", "bohdan"));
        names.sort(String.CASE_INSENSITIVE_ORDER);
        System.out.println(names);
        List<Integer> nums = new ArrayList<>(List.of(5, 1, 9, 3));
        nums.sort(Comparator.reverseOrder());
        System.out.println(nums);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("pear", "fig", "banana", "kiwi"));
        words.sort((a, b) -> a.length() - b.length());   // за довжиною, лямбда з глави про інтерфейси
        System.out.println(words);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> counts = new HashMap<>();
        counts.put("go", 2);
        counts.put("is", 2);
        counts.put("fun", 1);
        counts.put("fast", 1);
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(counts.entrySet());
        entries.sort((a, b) -> {
            int byCount = b.getValue() - a.getValue();        // частота за спаданням
            return byCount != 0 ? byCount : a.getKey().compareTo(b.getKey());
        });
        System.out.println(entries.get(0) + " " + entries.get(1));
    }
}`,
      String.raw`// аварія: List.of повертає незмінний список, його не можна відсортувати на місці
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> fixed = List.of(3, 1, 2);
        System.out.println(fixed);
        fixed.sort(null);
    }
}`,
    ],
    note: String.raw`Для списку власних об'єктів потрібен <code>Comparator</code> або <code>Comparable</code>. Рядки природно сортуються за кодами символів, тому «Zebra» йде перед «apple». Незмінний список з <code>List.of</code> відсортувати не можна: буде <code>UnsupportedOperationException</code>.`,
    work: String.raw`Сортування — щоденна дія: таблиці замовлень за датою, товари за ціною, топ-10 за кількістю. Складний порядок (спершу за містом, потім за прізвищем) будують ланцюжком компараторів, який ми розберемо в главі про інтерфейси. Тут важливо знати, що сортування стабільне й що його можна виконувати на місці.`,
    tasks: [
      String.raw`Як відсортувати список рядків за спаданням без урахування регістру?`,
      String.raw`Чому «Zebra» опиняється перед «apple» при сортуванні за природним порядком?`,
    ],
  },
  {
    t: "Iterator і ConcurrentModificationException",
    ch: "Колекції",
    adv: true,
    easy: String.raw`Ітератор — це закладка в книжці: він пам'ятає, де ви зупинилися, і вміє вирвати прочитану сторінку так, щоб книжка не розсипалася.`,
    p: [
      String.raw`Кожна колекція вміє віддати <code>Iterator</code>: об'єкт, який ходить по елементах. Його методи: <code>hasNext()</code> перевіряє, чи є наступний елемент, <code>next()</code> бере його, <code>remove()</code> видаляє останній повернений. Цикл for-each насправді є скороченим записом ітератора й працює для будь-якого типу, що реалізує <code>Iterable</code>.`,
      String.raw`Явний ітератор виглядає так: <code>Iterator&lt;String&gt; it = list.iterator(); while (it.hasNext()) { String s = it.next(); ... }</code>. Він потрібен, коли треба видаляти елементи під час обходу. Метод <code>remove()</code> можна викликати лише один раз після кожного <code>next()</code>, інакше буде <code>IllegalStateException</code>.`,
      String.raw`Якщо під час for-each змінити розмір колекції будь-яким іншим способом (<code>list.remove(x)</code>, <code>list.add(y)</code>), наступний виклик <code>next()</code> кине <code>ConcurrentModificationException</code>. Назва підступна: паралельності тут може не бути, достатньо змінити список із тіла власного циклу. Ітератори в Java «відмовостійкі» (fail-fast): вони помічають зміни й одразу падають, а не продовжують із сміттям.`,
      String.raw`Як це працює: колекція веде лічильник структурних змін (<code>modCount</code>), ітератор запам'ятовує його при створенні й порівнює при кожному <code>next()</code>. Заміна значення (<code>set</code>) структурною зміною не є, а додавання чи видалення є. Є й підступний виняток: видалення передостаннього елемента в for-each не падає, бо цикл завершується до наступної перевірки, але будувати код на такому «везінні» не можна.`,
      String.raw`Безпечні способи видалення під час обходу: <code>Iterator.remove()</code>; метод <code>removeIf(умова)</code> для колекцій (Java 8 і новіші); обхід за індексами від кінця до початку; побудова нового списку з потрібних елементів. Для мап підходять <code>entrySet().removeIf(...)</code> або видалення через ітератор.`,
      String.raw`<code>ListIterator</code> для списків ходить в обидва боки (<code>hasPrevious</code>, <code>previous</code>) і вміє <code>set</code> та <code>add</code> під час обходу. Він корисний, коли потрібно замінювати або вставляти елементи в процесі перебору, а не лише видаляти їх.`,
      String.raw`Щоб власний клас можна було використати в for-each, він реалізує <code>Iterable&lt;T&gt;</code> і повертає <code>Iterator&lt;T&gt;</code>: достатньо методів <code>hasNext</code> та <code>next</code>. У багатопотокових колекціях (<code>CopyOnWriteArrayList</code>, <code>ConcurrentHashMap</code>) ітератори слабко узгоджені й не кидають <code>ConcurrentModificationException</code>, але про них поговоримо в главі про паралелізм. Для налагодження корисно знати, що ConcurrentModificationException майже завжди вказує на дефект у логіці, а не на проблему середовища: треба знайти місце, де колекція змінюється під час обходу, і замінити його на безпечну операцію. Не варто «лікувати» виняток перехопленням, бо це лише приховує справжню помилку й залишає програму з частково зміненими даними.`,
    ],
    code: [
      String.raw`import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        Iterator<Integer> it = nums.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) {
                it.remove();
            }
        }
        System.out.println(nums);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("a", "java", "to", "code"));
        words.removeIf(w -> w.length() < 3);
        System.out.println(words);
    }
}`,
      String.raw`// аварія: видалення елемента списку з тіла for-each, ConcurrentModificationException
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4));
        for (int x : nums) {
            if (x == 2) {
                nums.remove(Integer.valueOf(x));
            }
        }
        System.out.println(nums);
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("ira", "taras", "olha"));
        ListIterator<String> it = names.listIterator();
        while (it.hasNext()) {
            String s = it.next();
            it.set(s.toUpperCase());          // заміна на місці
        }
        System.out.println(names);
        while (it.hasPrevious()) {
            System.out.print(it.previous() + " ");
        }
        System.out.println();
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = new HashMap<>();
        stock.put("apple", 0);
        stock.put("pear", 4);
        stock.put("plum", 0);
        stock.entrySet().removeIf(e -> e.getValue() == 0);
        System.out.println(new TreeMap<>(stock));
    }
}`,
    ],
    note: String.raw`Змінювати розмір колекції під час for-each не можна: наступний <code>next()</code> кине <code>ConcurrentModificationException</code>. Видаляйте через <code>Iterator.remove()</code> або <code>removeIf</code>.`,
    work: String.raw`Помилка ConcurrentModificationException — одна з найвідоміших у Java: вона трапляється в списках замовлень, кешах, обробниках подій. Правильна відповідь на неї — не обгортати код у try/catch, а змінити спосіб видалення: removeIf чи ітератор роблять те саме безпечно й коротко.`,
    tasks: [
      String.raw`Чому видалення в for-each кидає <code>ConcurrentModificationException</code>, хоча потоки не задіяні?`,
      String.raw`Перепишіть видалення парних чисел зі списку через <code>removeIf</code> і через <code>Iterator</code>.`,
    ],
  },
  {
    t: "Практика: частотний словник",
    ch: "Колекції",
    easy: String.raw`Частотний словник — це підрахунок голосів: кожне слово голосує за себе, ми підсумовуємо, скільки голосів набрало кожне слово, і показуємо лідерів списку.`,
    p: [
      String.raw`Задача: за текстом порахувати, скільки разів зустрічається кожне слово, і показати найчастіші. Це класична вправа, яка поєднує рядки, цикли, мапи й сортування: потрібно розбити текст на слова, нормалізувати їх, підрахувати й упорядкувати результат.`,
      String.raw`Крок 1 — розбиття й нормалізація. Виклик <code>text.split("\\s+")</code> ділить текст за пробілами, а <code>toLowerCase()</code> робить «Go» і «go» одним словом. Пунктуацію прибирають заміною за регулярним виразом: <code>replaceAll("[^a-z ]", "")</code> залишає лише малі латинські літери й пробіли (для англомовного тексту). Порожні рядки, які виникають від зайвих пробілів, пропускають.`,
      String.raw`Крок 2 — підрахунок: <code>map.merge(word, 1, Integer::sum)</code> для кожного слова. Мапа <code>HashMap&lt;String, Integer&gt;</code> швидка, але виводить слова у довільному порядку, тому для стабільного виводу її копіюють у <code>TreeMap</code> (за абеткою) або сортують за частотою.`,
      String.raw`Крок 3 — унікальні слова. Кількість різних слів дорівнює <code>map.size()</code>, а без мапи її дає <code>new HashSet&lt;&gt;(Arrays.asList(words)).size()</code>. Мапа корисніша, бо зберігає й частоту, але множина простіша, коли потрібна лише унікальність.`,
      String.raw`Крок 4 — «топ-N». Елементи <code>map.entrySet()</code> копіюють у <code>ArrayList</code> і сортують за значенням за спаданням, а для однакових частот — за словом за абеткою, щоб результат був детермінованим. Потім беруть перші N елементів. Вибір передбачуваного порядку для рівних значень — ознака дбайливого коду, бо тест із випадковим порядком рано чи пізно впаде.`,
      String.raw`Типові помилки: забути нормалізацію регістру; порахувати порожній рядок як слово; покластися на порядок <code>HashMap</code>; користуватися <code>get</code> без запасного значення, коли ключа ще немає; змінювати мапу під час обходу. Усе це ми розбирали в попередніх уроках, і саме задача про частоти виявляє їх на практиці.`,
      String.raw`Що далі: ту саму схему застосовують до підрахунку літер, статусів замовлень, кодів відповідей сервера й подій у журналі. Замініть слово на ключ будь-якого змісту — і отримаєте універсальний інструмент аналітики, без якого не обходиться жоден звіт. Вправа за цією схемою також є типовим тестовим завданням на співбесіді. Спробуйте самостійно розширити розв'язок: додайте виведення відсотка кожного слова від загальної кількості, порахуйте довжину найдовшого слова й знайдіть слова, що зустрілися рівно один раз. Кожне таке розширення використовує ті самі методи, але закріплює їх на нових прикладах і привчає думати про граничні випадки: порожній текст, один символ, текст лише з розділових знаків.`,
    ],
    code: [
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        String text = "go is fun and go is fast";
        Map<String, Integer> counts = new HashMap<>();
        for (String w : text.split("\\s+")) {
            counts.merge(w, 1, Integer::sum);
        }
        System.out.println(new TreeMap<>(counts));
    }
}`,
      String.raw`import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        String text = "Go, go! Is Go fun? It is.";
        String clean = text.toLowerCase().replaceAll("[^a-z ]", "");
        Map<String, Integer> counts = new HashMap<>();
        for (String w : clean.split("\\s+")) {
            if (!w.isEmpty()) {
                counts.merge(w, 1, Integer::sum);
            }
        }
        System.out.println(new TreeMap<>(counts));
    }
}`,
      String.raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> counts = new HashMap<>();
        for (String w : "b a c a b a".split(" ")) {
            counts.merge(w, 1, Integer::sum);
        }
        List<Map.Entry<String, Integer>> top = new ArrayList<>(counts.entrySet());
        top.sort((x, y) -> y.getValue() != x.getValue().intValue()
            ? y.getValue() - x.getValue()
            : x.getKey().compareTo(y.getKey()));
        for (int i = 0; i < 2; i++) {
            System.out.println(top.get(i).getKey() + "=" + top.get(i).getValue());
        }
    }
}`,
      String.raw`// аварія: слова c у мапі немає, get повертає null, а розпакування в int падає
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> counts = new HashMap<>();
        counts.put("a", 2);
        int safe = counts.getOrDefault("c", 0);
        System.out.println(safe);
        int boom = counts.get("c");
        System.out.println(boom);
    }
}`,
      String.raw`import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        String[] words = "go is fun and go is fast".split(" ");
        Set<String> unique = new HashSet<>(Arrays.asList(words));
        System.out.println("Unique: " + unique.size());
    }
}`,
    ],
    note: String.raw`Для стабільного виводу мапу з лічильниками копіюють у <code>TreeMap</code> або сортують її записи, а нормалізацію регістру й порожніх слів виконують до підрахунку. Для лічильника достатньо одного виклику <code>merge(word, 1, Integer::sum)</code>.`,
    work: String.raw`Підрахунок частот лежить в основі пошукових систем, аналізу журналів, статистики використання функцій і виявлення спаму. У виробничому коді його часто будують потоками (Stream API) та групуючими колекторами, але логіка залишається тією самою, а розуміння мапи допомагає прочитати будь-який такий код.`,
    tasks: [
      String.raw`Чому перед підрахунком слів треба привести текст до одного регістру й прибрати пунктуацію?`,
      String.raw`Як отримати топ-3 слова з однаковою частотою в стабільному порядку?`,
    ],
  },
];
