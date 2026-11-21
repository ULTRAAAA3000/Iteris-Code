// Еталонні рішення завдань C, глава 02 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_02 = {
  "c-variables-types": raw`#include <stdio.h>

int main(void) {
    int boys = 12;
    int girls = 16;
    int total = boys + girls;
    double average = 4.25;
    char group = 'B';
    printf("Група %c: %d учнів, середній бал %.2f\n", group, total, average);
    return 0;
}
`,
  "c-const-init": raw`#include <stdio.h>

int main(void) {
    const int unit_price = 15;
    int quantity = 4;
    int total = unit_price * quantity;
    const double discount = 0.1;
    double final_price = total * (1 - discount);
    printf("Разом: %d\n", total);
    printf("Зі знижкою: %.2f\n", final_price);
    return 0;
}
`,
  "c-int-ranges": raw`#include <stdint.h>
#include <stdio.h>

int main(void) {
    uint8_t level = 250;
    level = level + 10;
    uint32_t zero = 0;
    zero = zero - 1;
    int64_t wide = INT32_MAX;
    wide = wide + 1;
    printf("uint8: %d\n", level);
    printf("uint32: %u\n", zero);
    printf("int64: %lld\n", (long long)wide);
    return 0;
}
`,
  "c-float-compare": raw`#include <float.h>
#include <math.h>
#include <stdio.h>

int main(void) {
    double sum = 0.1 + 0.2;
    double eps = 1e-9;
    printf("sum: %.17f\n", sum);
    printf("exact: %d\n", sum == 0.3);
    printf("close: %d\n", fabs(sum - 0.3) < eps);
    printf("digits: %d\n", DBL_DIG);
    return 0;
}
`,
  "c-casts": raw`#include <stdio.h>

int main(void) {
    int total = 17;
    int count = 4;
    double avg = (double)total / count;
    double negative = -3.99;
    unsigned char x = 200;
    unsigned char y = 100;
    printf("avg: %.2f\n", avg);
    printf("cut: %d\n", (int)negative);
    printf("promoted: %d\n", x + y);
    return 0;
}
`,
  "c-char-arith": raw`#include <ctype.h>
#include <stdio.h>

int main(void) {
    char digit_char = '7';
    int digit = digit_char - '0';
    char ch = 'x';
    char shifted = 'a' + (ch - 'a' + 3) % 26;
    printf("digit: %d\n", digit);
    printf("upper: %c\n", toupper('h'));
    printf("caesar: %c\n", shifted);
    printf("code: %d\n", shifted);
    return 0;
}
`,
  "c-printf-table": raw`#include <stdio.h>

int main(void) {
    printf("|%-10s|%6s|%9s|\n", "Item", "Qty", "Price");
    int row = printf("|%-10s|%6d|%9.2f|\n", "Bread", 3, 25.5);
    printf("|%-10s|%6d|%9.2f|\n", "Milk", 12, 9.99);
    printf("row length: %d\n", row);
    return 0;
}
`,
  "c-conditions": raw`#include <stdio.h>

int main(void) {
    int score = 82;
    int a = 7;
    int b = 12;
    int d = 0;
    char grade;
    if (score >= 90) {
        grade = 'A';
    } else if (score >= 75) {
        grade = 'B';
    } else {
        grade = 'C';
    }
    int max = a > b ? a : b;
    printf("grade: %c\n", grade);
    printf("max: %d\n", max);
    if (d != 0 && 100 / d > 5) {
        printf("safe: no\n");
    } else {
        printf("safe: yes\n");
    }
    return 0;
}
`,
  "c-switch-days": raw`#include <stdio.h>

int main(void) {
    int month = 6;
    int a = 6;
    int b = 7;
    char op = '*';
    int days = 0;
    int result = 0;
    switch (month) {
    case 4:
    case 6:
    case 9:
    case 11:
        days = 30;
        break;
    case 2:
        days = 28;
        break;
    default:
        days = 31;
        break;
    }
    switch (op) {
    case '+':
        result = a + b;
        break;
    case '-':
        result = a - b;
        break;
    case '*':
        result = a * b;
        break;
    default:
        printf("невідома операція\n");
        break;
    }
    printf("days: %d\n", days);
    printf("result: %d\n", result);
    return 0;
}
`,
  "c-while-digits": raw`#include <stdio.h>

int main(void) {
    int number = 12345;
    int n = number;
    int digits = 0;
    int sum = 0;
    int reversed = 0;
    while (n > 0) {
        int last = n % 10;
        sum += last;
        reversed = reversed * 10 + last;
        digits++;
        n /= 10;
    }
    printf("digits: %d\n", digits);
    printf("sum: %d\n", sum);
    printf("reversed: %d\n", reversed);
    return 0;
}
`,
  "c-for-squares": raw`#include <stdio.h>

int main(void) {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        printf("%d ", i * i);
        sum += i * i;
    }
    printf("\n");
    printf("sum: %d\n", sum);
    printf("down:");
    for (int i = 10; i > 0; i -= 3) {
        printf(" %d", i);
    }
    printf("\n");
    return 0;
}
`,
  "c-break-continue": raw`#include <stdio.h>

int main(void) {
    int sum = 0;
    int i;
    for (i = 1; i <= 20; i++) {
        if (i % 2 == 0) {
            continue;
        }
        if (i > 9) {
            break;
        }
        sum += i;
    }
    printf("sum: %d\nstopped: %d\n", sum, i);
    return 0;
}
`,
  "c-functions-max": raw`#include <stdio.h>

int max3(int a, int b, int c);
int sum_to(int n);

int main(void) {
    printf("max3: %d\n", max3(4, 9, 7));
    printf("sum_to: %d\n", sum_to(10));
    return 0;
}

int max3(int a, int b, int c) {
    int best = a;
    if (b > best) {
        best = b;
    }
    if (c > best) {
        best = c;
    }
    return best;
}

int sum_to(int n) {
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
`,
  "c-static-counter": raw`#include <stdio.h>

int next_ticket(void) {
    static int n = 0;
    n++;
    return n;
}

int main(void) {
    int a = next_ticket();
    int b = next_ticket();
    int c = next_ticket();
    printf("tickets: %d %d %d\n", a, b, c);
    int d = next_ticket();
    printf("after: %d\n", d);
    return 0;
}
`,
  "c-recursion-power": raw`#include <stdio.h>

long long power(long long base, int exp);
int sum_digits(int n);

int main(void) {
    printf("power: %lld\n", power(2, 10));
    printf("digits: %d\n", sum_digits(12345));
    return 0;
}

long long power(long long base, int exp) {
    if (exp == 0) {
        return 1;
    }
    return base * power(base, exp - 1);
}

int sum_digits(int n) {
    if (n < 10) {
        return n;
    }
    return n % 10 + sum_digits(n / 10);
}
`,
};
