// Еталонні рішення завдань C, глава 03 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_03 = {
  "c-array-stats": raw`#include <stdio.h>

int main(void) {
    int temps[] = {4, 9, 2, 7, 5, 3};
    size_t n = sizeof temps / sizeof temps[0];
    int sum = 0;
    int max = temps[0];
    int min = temps[0];
    for (size_t i = 0; i < n; i++) {
        sum += temps[i];
        if (temps[i] > max) {
            max = temps[i];
        }
        if (temps[i] < min) {
            min = temps[i];
        }
    }
    printf("Елементів: %zu\n", n);
    printf("Сума: %d\n", sum);
    printf("Максимум: %d\n", max);
    printf("Мінімум: %d\n", min);
    return 0;
}
`,
  "c-array-functions": raw`#include <stdio.h>

int count_above(const int a[], size_t n, int limit) {
    int count = 0;
    for (size_t i = 0; i < n; i++) {
        if (a[i] > limit) {
            count++;
        }
    }
    return count;
}

void reverse(int a[], size_t n) {
    for (size_t i = 0; i < n / 2; i++) {
        int tmp = a[i];
        a[i] = a[n - 1 - i];
        a[n - 1 - i] = tmp;
    }
}

int main(void) {
    int data[] = {3, 8, 1, 9, 4, 7};
    size_t n = sizeof data / sizeof data[0];
    printf("Більших за 4: %d\n", count_above(data, n, 4));
    reverse(data, n);
    printf("Після реверсу:");
    for (size_t i = 0; i < n; i++) {
        printf(" %d", data[i]);
    }
    printf("\n");
    return 0;
}
`,
  "c-string-terminator": raw`#include <stdio.h>

size_t my_len(const char s[]) {
    size_t n = 0;
    while (s[n] != '\0') {
        n++;
    }
    return n;
}

size_t count_char(const char s[], char c) {
    size_t count = 0;
    for (size_t i = 0; s[i] != '\0'; i++) {
        if (s[i] == c) {
            count++;
        }
    }
    return count;
}

void spaces_to_underscores(char s[]) {
    for (size_t i = 0; s[i] != '\0'; i++) {
        if (s[i] == ' ') {
            s[i] = '_';
        }
    }
}

int main(void) {
    char text[] = "hello c world";
    printf("Довжина: %zu\n", my_len(text));
    printf("Літер l: %zu\n", count_char(text, 'l'));
    spaces_to_underscores(text);
    printf("Результат: %s\n", text);
    return 0;
}
`,
  "c-string-h": raw`#include <stdio.h>
#include <string.h>

int main(void) {
    char first[] = "Ada";
    char last[] = "Lovelace";
    char full[32] = "";
    char short_name[6] = "";
    strcpy(full, first);
    strcat(full, " ");
    strcat(full, last);
    int order = strcmp(first, "Alan");
    strncpy(short_name, "Programming", sizeof short_name - 1);
    short_name[sizeof short_name - 1] = '\0';
    printf("Повне ім'я: %s\n", full);
    printf("Довжина: %zu\n", strlen(full));
    printf("Порядок: %d\n", (order > 0) - (order < 0));
    printf("Скорочено: %s\n", short_name);
    return 0;
}
`,
  "c-snprintf-label": raw`#include <stdio.h>

int make_label(char out[], size_t size, const char name[], int id) {
    return snprintf(out, size, "ID-%03d:%s", id, name);
}

int main(void) {
    char big[32] = "";
    char small[8] = "";
    int n1 = make_label(big, sizeof big, "widget", 7);
    int n2 = make_label(small, sizeof small, "widget", 7);
    printf("big: %s (%d)\n", big, n1);
    printf("small: %s (%d)%s\n", small, n2, n2 >= (int)sizeof small ? " обрізано" : "");
    return 0;
}
`,
  "c-input-parse": raw`#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int parse_age(const char s[]) {
    char *end;
    errno = 0;
    long v = strtol(s, &end, 10);
    if (end == s || *end != '\0' || errno == ERANGE || v < 0 || v > 150) {
        return -1;
    }
    return (int)v;
}

int main(void) {
    char data[] = "17\nabc\n42x\n200\n  8\n";
    FILE *in = fmemopen(data, strlen(data), "r");
    if (in == NULL) {
        return 1;
    }
    char line[16];
    while (fgets(line, sizeof line, in) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        printf("[%s] -> %d\n", line, parse_age(line));
    }
    fclose(in);
    return 0;
}
`,
  "c-matrix-transpose": raw`#include <stdio.h>

void transpose(size_t rows, int src[][3], int dst[][2]) {
    for (size_t i = 0; i < rows; i++) {
        for (size_t j = 0; j < 3; j++) {
            dst[j][i] = src[i][j];
        }
    }
}

int main(void) {
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int t[3][2] = {{0}};
    transpose(2, m, t);
    for (size_t i = 0; i < 3; i++) {
        printf("%d %d\n", t[i][0], t[i][1]);
    }
    return 0;
}
`,
  "c-vla-literals": raw`#include <stdio.h>

int sum_matrix(size_t rows, size_t cols, int m[rows][cols]) {
    int total = 0;
    for (size_t i = 0; i < rows; i++) {
        for (size_t j = 0; j < cols; j++) {
            total += m[i][j];
        }
    }
    return total;
}

int max_of(const int a[], size_t n) {
    int max = a[0];
    for (size_t i = 1; i < n; i++) {
        if (a[i] > max) {
            max = a[i];
        }
    }
    return max;
}

int squares_sum(size_t n) {
    int sq[n];
    int total = 0;
    for (size_t i = 0; i < n; i++) {
        sq[i] = (int)(i * i);
        total += sq[i];
    }
    return total;
}

int main(void) {
    int a[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int b[3][2] = {{1, 2}, {3, 4}, {5, 10}};
    printf("a: %d\n", sum_matrix(2, 3, a));
    printf("b: %d\n", sum_matrix(3, 2, b));
    printf("max: %d\n", max_of((int[]){4, 9, 2, 7}, 4));
    printf("squares: %d\n", squares_sum(5));
    return 0;
}
`,
  "c-utf8-count": raw`#include <stdio.h>
#include <string.h>

size_t utf8_count(const char s[]) {
    size_t n = 0;
    for (size_t i = 0; s[i] != '\0'; i++) {
        unsigned char c = (unsigned char)s[i];
        if (c < 0x80 || c >= 0xC0) {
            n++;
        }
    }
    return n;
}

size_t utf8_prefix_bytes(const char s[], size_t chars) {
    size_t seen = 0;
    size_t i = 0;
    for (; s[i] != '\0'; i++) {
        unsigned char c = (unsigned char)s[i];
        if (c < 0x80 || c >= 0xC0) {
            if (seen == chars) {
                break;
            }
            seen++;
        }
    }
    return i;
}

int main(void) {
    const char text[] = "Привіт, світе";
    printf("Байтів: %zu\n", strlen(text));
    printf("Символів: %zu\n", utf8_count(text));
    printf("Початок: %.*s\n", (int)utf8_prefix_bytes(text, 6), text);
    return 0;
}
`,
  "c-bit-flags": raw`#include <stdio.h>

unsigned set_bit(unsigned x, unsigned n) {
    return x | (1u << n);
}

unsigned clear_bit(unsigned x, unsigned n) {
    return x & ~(1u << n);
}

unsigned test_bit(unsigned x, unsigned n) {
    return (x >> n) & 1u;
}

unsigned popcount(unsigned x) {
    unsigned count = 0;
    while (x != 0) {
        x &= x - 1;
        count++;
    }
    return count;
}

int main(void) {
    unsigned x = 0;
    x = set_bit(x, 1);
    x = set_bit(x, 3);
    x = set_bit(x, 5);
    printf("set: %u\n", x);
    x = clear_bit(x, 3);
    printf("clear: %u\n", x);
    printf("bit5: %u\n", test_bit(x, 5));
    printf("bit3: %u\n", test_bit(x, 3));
    printf("bits: %u\n", popcount(0xFF0Fu));
    return 0;
}
`,
  "c-word-frequency": raw`#include <ctype.h>
#include <stdio.h>

void count_letters(const char text[], unsigned counts[26]) {
    for (size_t i = 0; text[i] != '\0'; i++) {
        unsigned char c = (unsigned char)text[i];
        if (isalpha(c)) {
            counts[tolower(c) - 'a']++;
        }
    }
}

size_t count_words(const char text[]) {
    size_t words = 0;
    int in_word = 0;
    for (size_t i = 0; text[i] != '\0'; i++) {
        if (isalpha((unsigned char)text[i])) {
            if (!in_word) {
                words++;
            }
            in_word = 1;
        } else {
            in_word = 0;
        }
    }
    return words;
}

char top_letter(const unsigned counts[]) {
    int best = 0;
    for (int i = 1; i < 26; i++) {
        if (counts[i] > counts[best]) {
            best = i;
        }
    }
    return (char)('a' + best);
}

int main(void) {
    const char text[] = "the cat and the hat and the bat";
    unsigned counts[26] = {0};
    count_letters(text, counts);
    char top = top_letter(counts);
    printf("Слів: %zu\n", count_words(text));
    printf("Найчастіша: %c (%u)\n", top, counts[top - 'a']);
    printf("Літер a: %u\n", counts['a' - 'a']);
    return 0;
}
`,
};
