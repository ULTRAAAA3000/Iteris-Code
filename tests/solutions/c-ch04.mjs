// Еталонні рішення завдань C, глава 04 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_04 = {
  "c-pointer-basics": raw`#include <stdio.h>

int main(void) {
    int a = 10;
    int b = 7;
    int *p = &a;
    *p += 5;
    p = &b;
    *p *= 2;
    printf("a=%d\n", a);
    printf("b=%d\n", b);
    printf("p вказує на b: %d\n", p == &b);
    return 0;
}
`,
  "c-out-params": raw`#include <stdio.h>

void minmax(const int a[], size_t n, int *lo, int *hi) {
    *lo = a[0];
    *hi = a[0];
    for (size_t i = 1; i < n; i++) {
        if (a[i] < *lo) {
            *lo = a[i];
        }
        if (a[i] > *hi) {
            *hi = a[i];
        }
    }
}

void swap(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}

int main(void) {
    int data[] = {4, 9, 2, 7};
    size_t n = sizeof data / sizeof data[0];
    int lo = 0;
    int hi = 0;
    minmax(data, n, &lo, &hi);
    printf("min=%d max=%d\n", lo, hi);
    swap(&lo, &hi);
    printf("після swap: %d %d\n", lo, hi);
    return 0;
}
`,
  "c-ptr-walk": raw`#include <stdio.h>

int *find_first(int *a, size_t n, int x) {
    for (int *p = a; p != a + n; p++) {
        if (*p == x) {
            return p;
        }
    }
    return NULL;
}

void reverse(int *lo, int *hi) {
    while (lo < hi) {
        int t = *lo;
        *lo = *hi;
        *hi = t;
        lo++;
        hi--;
    }
}

int main(void) {
    int a[] = {4, 8, 15, 16, 23, 42};
    size_t n = sizeof a / sizeof a[0];
    int *hit = find_first(a, n, 15);
    if (hit != NULL) {
        printf("15 на позиції %td\n", hit - a);
    } else {
        printf("15 не знайдено\n");
    }
    printf("9 %s\n", find_first(a, n, 9) == NULL ? "відсутнє" : "є");
    reverse(a, a + n - 1);
    printf("реверс:");
    for (int *p = a; p != a + n; p++) {
        printf(" %d", *p);
    }
    printf("\n");
    return 0;
}
`,
  "c-const-ptr": raw`#include <ctype.h>
#include <stdio.h>
#include <string.h>

int count_vowels(const char *s) {
    int n = 0;
    for (; *s != '\0'; s++) {
        if (strchr("aeiouAEIOU", *s) != NULL) {
            n++;
        }
    }
    return n;
}

void to_upper(char *s) {
    for (; *s != '\0'; s++) {
        *s = (char)toupper((unsigned char)*s);
    }
}

int main(void) {
    char word[] = "Programming";
    const char *title = "const in C";
    printf("Голосних у %s: %d\n", word, count_vowels(word));
    printf("Голосних у %s: %d\n", title, count_vowels(title));
    to_upper(word);
    printf("Після: %s\n", word);
    return 0;
}
`,
};
