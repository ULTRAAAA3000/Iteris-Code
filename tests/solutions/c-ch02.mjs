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
};
