export default {
  "java-wordstat": `import java.util.*;

class TextStats {
    static List<String> words(String text) {
        List<String> res = new ArrayList<>();
        if (text == null) return res;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (Character.isLetter(c)) {
                sb.append(c);
            } else if (sb.length() > 0) {
                res.add(sb.toString());
                sb.setLength(0);
            }
        }
        if (sb.length() > 0) res.add(sb.toString());
        return res;
    }

    static int wordCount(String text) {
        return words(text).size();
    }

    static String longestWord(String text) {
        String best = "";
        for (String w : words(text)) {
            if (w.length() > best.length()) best = w;
        }
        return best;
    }

    static Map<String, Integer> frequency(String text) {
        Map<String, Integer> m = new HashMap<>();
        for (String w : words(text)) {
            String k = w.toLowerCase();
            m.put(k, m.getOrDefault(k, 0) + 1);
        }
        return m;
    }

    static List<String> topWords(String text, int n) {
        if (n < 0) throw new IllegalArgumentException("n не може бути від'ємним");
        Map<String, Integer> m = frequency(text);
        List<String> keys = new ArrayList<>(m.keySet());
        for (int i = 0; i < keys.size(); i++) {
            for (int j = 0; j < keys.size() - 1 - i; j++) {
                String a = keys.get(j), b = keys.get(j + 1);
                int ca = m.get(a), cb = m.get(b);
                boolean swap = cb > ca || (cb == ca && b.compareTo(a) < 0);
                if (swap) { keys.set(j, b); keys.set(j + 1, a); }
            }
        }
        List<String> res = new ArrayList<>();
        for (int i = 0; i < keys.size() && i < n; i++) res.add(keys.get(i));
        return res;
    }

    static boolean isPalindrome(String text) {
        StringBuilder sb = new StringBuilder();
        if (text != null) {
            for (int i = 0; i < text.length(); i++) {
                char c = text.charAt(i);
                if (Character.isLetterOrDigit(c)) sb.append(Character.toLowerCase(c));
            }
        }
        for (int i = 0; i < sb.length() / 2; i++) {
            if (sb.charAt(i) != sb.charAt(sb.length() - 1 - i)) return false;
        }
        return true;
    }
}
`,
  "java-shapes": `import java.util.*;

interface Shape {
    double area();
    double perimeter();
    String name();
}

class Circle implements Shape {
    private final double radius;

    Circle(double radius) {
        if (radius <= 0) throw new IllegalArgumentException("Радіус має бути додатним");
        this.radius = radius;
    }

    public double area() { return Math.PI * radius * radius; }
    public double perimeter() { return 2 * Math.PI * radius; }
    public String name() { return "Коло"; }
}

class Rectangle implements Shape {
    private final double width, height;

    Rectangle(double width, double height) {
        if (width <= 0 || height <= 0) throw new IllegalArgumentException("Сторони мають бути додатними");
        this.width = width;
        this.height = height;
    }

    public double area() { return width * height; }
    public double perimeter() { return 2 * (width + height); }
    public String name() { return "Прямокутник"; }
}

class Triangle implements Shape {
    private final double a, b, c;

    Triangle(double a, double b, double c) {
        if (a <= 0 || b <= 0 || c <= 0) throw new IllegalArgumentException("Сторони мають бути додатними");
        if (a >= b + c || b >= a + c || c >= a + b) throw new IllegalArgumentException("Такого трикутника не існує");
        this.a = a;
        this.b = b;
        this.c = c;
    }

    public double area() {
        double p = (a + b + c) / 2;
        return Math.sqrt(p * (p - a) * (p - b) * (p - c));
    }
    public double perimeter() { return a + b + c; }
    public String name() { return "Трикутник"; }
}

class ShapeUtils {
    static double totalArea(List<Shape> shapes) {
        double sum = 0;
        for (Shape s : shapes) sum += s.area();
        return sum;
    }

    static void sortByArea(List<Shape> shapes) {
        for (int i = 0; i < shapes.size(); i++) {
            for (int j = 0; j < shapes.size() - 1 - i; j++) {
                if (shapes.get(j).area() > shapes.get(j + 1).area()) {
                    Shape t = shapes.get(j);
                    shapes.set(j, shapes.get(j + 1));
                    shapes.set(j + 1, t);
                }
            }
        }
    }

    static Shape largest(List<Shape> shapes) {
        Shape best = null;
        for (Shape s : shapes) {
            if (best == null || s.area() > best.area()) best = s;
        }
        return best;
    }
}
`,
  "java-library": `import java.util.*;

class BookNotAvailableException extends Exception {
    BookNotAvailableException(String message) {
        super(message);
    }
}

class Book {
    private final String isbn, title, author;
    private boolean available = true;

    Book(String isbn, String title, String author) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
    }

    String getIsbn() { return isbn; }
    String getTitle() { return title; }
    String getAuthor() { return author; }
    boolean isAvailable() { return available; }
    void setAvailable(boolean available) { this.available = available; }
}

class Library {
    private final List<Book> books = new ArrayList<>();

    private Book find(String isbn) {
        for (Book b : books) {
            if (b.getIsbn().equals(isbn)) return b;
        }
        return null;
    }

    void addBook(Book book) {
        if (book == null) throw new IllegalArgumentException("Книга не може бути null");
        if (find(book.getIsbn()) != null) throw new IllegalArgumentException("Книга вже є: " + book.getIsbn());
        books.add(book);
    }

    int size() { return books.size(); }

    int countAvailable() {
        int n = 0;
        for (Book b : books) {
            if (b.isAvailable()) n++;
        }
        return n;
    }

    List<Book> findByAuthor(String author) {
        List<Book> res = new ArrayList<>();
        for (Book b : books) {
            if (b.getAuthor().equalsIgnoreCase(author)) res.add(b);
        }
        return res;
    }

    List<Book> listAvailable() {
        List<Book> res = new ArrayList<>();
        for (Book b : books) {
            if (b.isAvailable()) res.add(b);
        }
        return res;
    }

    void borrowBook(String isbn) throws BookNotAvailableException {
        Book b = find(isbn);
        if (b == null || !b.isAvailable()) throw new BookNotAvailableException("Книга недоступна: " + isbn);
        b.setAvailable(false);
    }

    void returnBook(String isbn) {
        Book b = find(isbn);
        if (b == null) throw new IllegalArgumentException("Невідомий isbn: " + isbn);
        if (b.isAvailable()) throw new IllegalStateException("Книгу не видавали: " + isbn);
        b.setAvailable(true);
    }
}
`,
};
