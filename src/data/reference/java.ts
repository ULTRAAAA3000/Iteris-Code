import type { RefSection } from "./types.ts";

const raw = String.raw;

export const java: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`public class Main {
    public static void main(String[] args) {
        System.out.println("Привіт, світе!");
    }
}`, note: "Файл називається так само, як публічний клас: `Main.java`. Кожна інструкція закінчується крапкою з комою." },
    { t: "Компіляція й запуск", code: raw`javac Main.java    # скомпілювати
java Main          # запустити`, note: "Команди виконуються в терміналі." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Примітивні типи", code: raw`int age = 16;
double price = 24.5;
boolean ok = true;
char letter = 'A';
long big = 10_000_000_000L;
String name = "Олена";`, note: "Тип вказується під час оголошення. `String` це не примітив, а клас." },
    { t: "var і константи", code: raw`var count = 10;           // тип виводиться сам (Java 10+)
final double PI = 3.14;    // final: змінити не можна`, note: "`var` працює лише для локальних змінних." },
    { t: "Перетворення типів", code: raw`int n = (int) 3.9;                 // 3
double d = 5 / 2;                  // 2.0 (ділення цілих)
int x = Integer.parseInt("12");
String s = String.valueOf(42);`, note: "Ділення двох `int` відкидає дробову частину." },
  ] },
  { t: "Рядки", items: [
    { t: "Методи String", code: raw`String s = "Java";
System.out.println(s.length() + " " + s.charAt(0));
System.out.println(s.toUpperCase() + s.substring(1, 3));
System.out.println("a".equals("a"));
System.out.printf("%.2f%n", 3.14159);`, note: "Рядки порівнюють методом `equals`, а не `==`." },
  ] },
  { t: "Ввід", items: [
    { t: "Scanner", code: raw`import java.util.Scanner;

Scanner in = new Scanner(System.in);
System.out.print("Вік: ");
int age = in.nextInt();
String name = in.next();`, note: "`nextInt`, `nextDouble`, `next` (слово), `nextLine` (рядок)." },
  ] },
  { t: "Умови", items: [
    { t: "if і switch", code: raw`if (age < 12) {
    System.out.println("дитина");
} else if (age < 18) {
    System.out.println("підліток");
} else {
    System.out.println("дорослий");
}

switch (day) {
    case "сб", "нд" -> System.out.println("вихідний");
    default -> System.out.println("будній");
}`, note: "Стрілочний `switch` (Java 14+) не потребує `break`." },
    { t: "Тернарний оператор", code: raw`String kind = age >= 18 ? "дорослий" : "неповнолітній";`, note: "Короткий запис умови, що повертає значення." },
  ] },
  { t: "Цикли", items: [
    { t: "for, while, for-each", code: raw`for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
int n = 0;
while (n < 3) { n++; }

int[] nums = {1, 2, 3};
for (int x : nums) {
    System.out.println(x);
}`, note: "`break` виходить із циклу, `continue` переходить до наступної ітерації." },
  ] },
  { t: "Масиви й колекції", items: [
    { t: "Масив", code: raw`int[] a = new int[3];     // [0, 0, 0]
int[] b = {5, 2, 9};
Arrays.sort(b);
System.out.println(b.length + " " + Arrays.toString(b));`, note: "Довжина масиву фіксована. Потрібен імпорт `java.util.Arrays`." },
    { t: "ArrayList і HashMap", code: raw`List<String> names = new ArrayList<>();
names.add("Оля");
System.out.println(names.get(0) + names.size());

Map<String, Integer> ages = new HashMap<>();
ages.put("Оля", 16);
System.out.println(ages.getOrDefault("Іван", 0));`, note: "Імпорти: `java.util.List`, `ArrayList`, `Map`, `HashMap`." },
  ] },
  { t: "Методи", items: [
    { t: "Оголошення й виклик", code: raw`static int add(int a, int b) {
    return a + b;
}

static void hello(String name) {
    System.out.println("Привіт, " + name);
}

int sum = add(2, 3);`, note: "`void` означає, що метод нічого не повертає. Метод можна перевантажувати: однакова назва, різні параметри." },
  ] },
  { t: "Класи й об'єкти", items: [
    { t: "Клас, конструктор, метод", code: raw`class Dog {
    private String name;

    Dog(String name) { this.name = name; }

    String speak() { return name + ": гав!"; }
}

Dog rex = new Dog("Рекс");
System.out.println(rex.speak());`, note: "Поля роблять `private`, доступ дають через методи." },
    { t: "Спадкування й інтерфейс", code: raw`interface Shape { double area(); }

class Square implements Shape {
    double side;
    Square(double s) { side = s; }
    public double area() { return side * side; }
}`, note: "`extends` для спадкування від класу, `implements` для інтерфейсу." },
  ] },
  { t: "Помилки", items: [
    { t: "try / catch / finally", code: raw`try {
    int n = Integer.parseInt("abc");
} catch (NumberFormatException e) {
    System.out.println("Не число: " + e.getMessage());
} finally {
    System.out.println("Готово");
}`, note: "Перевірювані винятки треба або ловити, або оголошувати через `throws`." },
  ] },
];
