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
};
