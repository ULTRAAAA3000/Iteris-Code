// Еталонні рішення завдань Java, глава 03 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_03 = {
  "java-array-stats": raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] scores = {72, 85, 90, 64, 88};
        int sum = 0;
        int max = scores[0];
        int min = scores[0];
        for (int s : scores) {
            sum += s;
            if (s > max) {
                max = s;
            }
            if (s < min) {
                min = s;
            }
        }
        System.out.println("Scores: " + Arrays.toString(scores));
        System.out.println("Length: " + scores.length);
        System.out.println("Sum: " + sum);
        System.out.println("Max: " + max);
        System.out.println("Min: " + min);
        System.out.println("Average: " + (double) sum / scores.length);
    }
}
`,
  "java-arrays-utils": raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] data = {9, 3, 7, 1, 5};
        Arrays.sort(data);
        System.out.println("Sorted: " + Arrays.toString(data));
        System.out.println("Index of 7: " + Arrays.binarySearch(data, 7));
        System.out.println("Copy: " + Arrays.toString(Arrays.copyOf(data, 7)));
        int[] filled = new int[3];
        Arrays.fill(filled, 4);
        System.out.println("Filled: " + Arrays.toString(filled));
        System.out.println("Equal: " + Arrays.equals(Arrays.copyOf(data, 5), data));
    }
}
`,
  "java-arrays-list": raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    static int sum(int[] a) {
        int total = 0;
        for (int x : a) {
            total += x;
        }
        return total;
    }

    static List<Integer> evens(int[] a) {
        List<Integer> result = new ArrayList<>();
        for (int x : a) {
            if (x % 2 == 0) {
                result.add(x);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {5, 2, 9, 7, 4, 10, 3, 8};
        System.out.println("Sum: " + sum(nums));
        System.out.println("Evens: " + evens(nums));
        System.out.println("Count: " + evens(nums).size());
    }
}
`,
  "java-list-edit": raw`import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(10, 20, 30, 40, 50));
        list.add(1, 15);
        list.remove(Integer.valueOf(30));
        list.remove(list.size() - 1);
        list.set(0, 11);
        System.out.println("List: " + list);
        System.out.println("Size: " + list.size());
        System.out.println("Has 20: " + list.contains(20));
    }
}
`,
  "java-deque-brackets": raw`import java.util.ArrayDeque;
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
        System.out.println(isBalanced("(("));
    }
}
`,
  "java-grid-transpose": raw`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}};
        int[][] t = new int[m[0].length][m.length];
        int sum = 0;
        for (int r = 0; r < m.length; r++) {
            for (int c = 0; c < m[r].length; c++) {
                t[c][r] = m[r][c];
                sum += m[r][c];
            }
        }
        System.out.println("Rows: " + m.length + ", Cols: " + m[0].length);
        System.out.println(Arrays.deepToString(t));
        System.out.println("Sum: " + sum);
    }
}
`,
  "java-map-stock": raw`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = new HashMap<>();
        stock.put("apple", 5);
        stock.put("banana", 3);
        stock.put("cherry", 7);
        stock.put("banana", 10);
        stock.remove("cherry");
        System.out.println("Banana: " + stock.get("banana"));
        System.out.println("Has cherry: " + stock.containsKey("cherry"));
        System.out.println("Size: " + stock.size());
        System.out.println("Missing: " + stock.get("kiwi"));
        int total = 0;
        for (int v : stock.values()) {
            total += v;
        }
        System.out.println("Total: " + total);
    }
}
`,
  "java-map-group": raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        String[] words = "one two three four five six seven".split(" ");
        Map<Integer, List<String>> byLength = new HashMap<>();
        for (String w : words) {
            byLength.computeIfAbsent(w.length(), k -> new ArrayList<>()).add(w);
        }
        Map<String, Integer> sales = new HashMap<>();
        sales.merge("apple", 3, Integer::sum);
        sales.merge("apple", 4, Integer::sum);
        sales.merge("pear", 2, Integer::sum);
        System.out.println(new TreeMap<>(byLength));
        System.out.println(new TreeMap<>(sales));
    }
}
`,
  "java-set-ops": raw`import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5));
        Set<Integer> b = new HashSet<>(Arrays.asList(4, 5, 6, 7));
        Set<Integer> union = new HashSet<>(a);
        union.addAll(b);
        Set<Integer> common = new HashSet<>(a);
        common.retainAll(b);
        Set<Integer> onlyA = new HashSet<>(a);
        onlyA.removeAll(b);
        System.out.println("Union: " + new TreeSet<>(union));
        System.out.println("Common: " + new TreeSet<>(common));
        System.out.println("Only A: " + new TreeSet<>(onlyA));
        List<Integer> raw = Arrays.asList(3, 1, 3, 2, 1);
        System.out.println("Unique: " + new LinkedHashSet<>(raw));
    }
}
`,
  "java-sort-names": raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Oleh", "anna", "Zoya", "bohdan"));
        List<Integer> nums = new ArrayList<>(List.of(5, 1, 9, 3));
        List<String> natural = new ArrayList<>(names);
        List<String> ignore = new ArrayList<>(names);
        Collections.sort(natural);
        ignore.sort(String.CASE_INSENSITIVE_ORDER);
        nums.sort(Comparator.reverseOrder());
        System.out.println("Natural: " + natural);
        System.out.println("Ignore case: " + ignore);
        System.out.println("Desc: " + nums);
        System.out.println("Max: " + Collections.max(nums));
    }
}
`,
  "java-iterator-clean": raw`import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8));
        Iterator<Integer> it = nums.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) {
                it.remove();
            }
        }
        List<String> words = new ArrayList<>(List.of("a", "java", "to", "code"));
        words.removeIf(w -> w.length() < 3);
        System.out.println("Odd: " + nums);
        System.out.println("Long: " + words);
    }
}
`,
  "java-wordcount-map": raw`import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.TreeMap;

public class Main {
    static HashMap<String, Integer> count(String text) {
        HashMap<String, Integer> counts = new HashMap<>();
        for (String w : text.split(" ")) {
            counts.merge(w, 1, Integer::sum);
        }
        return counts;
    }

    static int uniqueCount(String text) {
        return new HashSet<>(Arrays.asList(text.split(" "))).size();
    }

    public static void main(String[] args) {
        String text = "go is fun and go is fast";
        System.out.println(new TreeMap<>(count(text)));
        System.out.println("Unique: " + uniqueCount(text));
    }
}
`,
};
