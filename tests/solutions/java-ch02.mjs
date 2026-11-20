// Еталонні рішення завдань Java, глава 02 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_02 = {
  "java-vars-types": raw`public class Main {
    public static void main(String[] args) {
        int items = 3;
        double price = 9.5;
        boolean active = true;
        char grade = 'A';
        System.out.println("Items: " + items);
        System.out.println("Price: " + price);
        System.out.println("Active: " + active);
        System.out.println("Grade: " + grade);
        System.out.println("Total: " + items * price);
    }
}
`,
  "java-money-cents": raw`public class Main {
    public static void main(String[] args) {
        int pen = 1999;
        int notebook = 2550;
        int total = pen + notebook;
        System.out.println("Total cents: " + total);
        System.out.println("Whole: " + total / 100);
        System.out.println("Cents: " + total % 100);
        long big = 3_000_000_000L;
        System.out.println("Big: " + big * 2);
    }
}
`,
  "java-constants-tax": raw`public class Main {
    static final int TAX_PERCENT = 20;

    public static void main(String[] args) {
        int net1 = 100;
        int net2 = 250;
        System.out.println("Gross: " + (net1 + net1 * TAX_PERCENT / 100));
        System.out.println("Gross: " + (net2 + net2 * TAX_PERCENT / 100));
    }
}
`,
  "java-strings-slug": raw`public class Main {
    public static void main(String[] args) {
        String title = "  Hello   World From Java ";
        String word = "Level";
        String slug = String.join("-", title.trim().toLowerCase().split("\\s+"));
        String reversed = new StringBuilder(word).reverse().toString();
        boolean palindrome = word.equalsIgnoreCase(reversed);
        System.out.println(slug);
        System.out.println(reversed);
        System.out.println(palindrome);
    }
}
`,
  "java-types-average": raw`public class Main {
    public static void main(String[] args) {
        int a = 4, b = 5, c = 4;
        int sum = a + b + c;
        System.out.println("Int division: " + sum / 3);
        String raw = "  15 ";
        System.out.println("Average: " + Math.round((double) sum / 3 * 100) / 100.0);
        System.out.println("Code of A: " + (int) 'A');
        System.out.println("Parsed: " + (Integer.parseInt(raw.trim()) + 5));
    }
}
`,
  "java-printf-total": raw`public class Main {
    public static void main(String[] args) {
        double price = 199.99;
        int qty = 3;
        System.out.printf("Total: %.2f%n", price * qty);
        System.out.printf("Items: %d%n", qty);
        System.out.printf("Tax: 20%%%n");
    }
}
`,
  "java-grade-ladder": raw`public class Main {
    public static void main(String[] args) {
        int score = 83;
        String grade;
        if (score >= 90) {
            grade = "A";
        } else if (score >= 75) {
            grade = "B";
        } else if (score >= 60) {
            grade = "C";
        } else {
            grade = "F";
        }
        System.out.println("Grade: " + grade);
        boolean inB = score >= 75 && score <= 89;
        System.out.println("In B range: " + inB);
        System.out.println(score >= 60 ? "Passed" : "Failed");
    }
}
`,
  "java-loops-sums": raw`public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            if (i % 7 == 0) {
                sum += i;
            }
        }
        System.out.println("Sum7: " + sum);
        for (int i = 1; i <= 5; i++) {
            System.out.println(i * i);
        }
        int n = 100;
        int steps = 0;
        while (n > 1) {
            n /= 2;
            steps++;
        }
        System.out.println("Steps: " + steps);
    }
}
`,
  "java-fizzbuzz-switch": raw`public class Main {
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
        for (int d = 1; d <= 4; d++) {
            String name = switch (d) {
                case 1 -> "Mon";
                case 2 -> "Tue";
                case 3 -> "Wed";
                default -> "Unknown";
            };
            System.out.println(name);
        }
    }
}
`,
  "java-break-labels": raw`public class Main {
    public static void main(String[] args) {
        outer:
        for (int i = 1; i <= 9; i++) {
            for (int j = 1; j <= 9; j++) {
                if (i * j == 42) {
                    System.out.println("Found: " + i + " x " + j);
                    break outer;
                }
            }
        }
        int evenSum = 0;
        for (int i = 1; i <= 10; i++) {
            if (i % 2 != 0) {
                continue;
            }
            evenSum += i;
        }
        System.out.println("Even sum: " + evenSum);
    }
}
`,
  "java-methods-basic": raw`public class Main {
    static int square(int n) {
        return n * n;
    }

    static boolean isEven(int n) {
        return n % 2 == 0;
    }

    static int max3(int a, int b, int c) {
        return Math.max(a, Math.max(b, c));
    }

    static void printLine(String text) {
        System.out.println("-- " + text + " --");
    }

    public static void main(String[] args) {
        System.out.println(square(7));
        System.out.println(isEven(10));
        System.out.println(max3(4, 9, 6));
        printLine("done");
    }
}
`,
  "java-methods-overload": raw`public class Main {
    static int max(int a, int b) {
        return a > b ? a : b;
    }

    static double area(double r) {
        return Math.PI * r * r;
    }

    static double area(double w, double h) {
        return w * h;
    }

    static int sum(int... nums) {
        int total = 0;
        for (int n : nums) {
            total += n;
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(max(7, 3));
        System.out.printf("%.2f%n", area(2));
        System.out.println(area(3, 4));
        System.out.println(sum(1, 2, 3));
        System.out.println(sum());
    }
}
`,
  "java-recursion-basics": raw`public class Main {
    static long factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    static int gcd(int a, int b) {
        if (b == 0) {
            return a;
        }
        return gcd(b, a % b);
    }

    static int digitSum(int n) {
        if (n < 10) {
            return n;
        }
        return n % 10 + digitSum(n / 10);
    }

    public static void main(String[] args) {
        System.out.println("5! = " + factorial(5));
        System.out.println("gcd = " + gcd(48, 18));
        System.out.println("digits = " + digitSum(12345));
    }
}
`,
  "java-bits-flags": raw`public class Main {
    static final int READ = 1;
    static final int WRITE = 2;
    static final int EXEC = 4;

    public static void main(String[] args) {
        int perms = READ | EXEC;
        perms |= WRITE;
        perms &= ~READ;
        System.out.println("perms: " + Integer.toBinaryString(perms));
        System.out.println("can write: " + ((perms & WRITE) != 0));
        System.out.println("can read: " + ((perms & READ) != 0));
        System.out.println("bits set: " + Integer.bitCount(perms));
    }
}
`,
};
