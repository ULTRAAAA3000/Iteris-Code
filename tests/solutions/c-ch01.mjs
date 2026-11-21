// Еталонні рішення завдань C, глава 01 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_01 = {
  "c-first-project": raw`#include <stdio.h>

int main(void) {
    printf("Привіт, C!\n");
    printf("%d\n", 6 * 7);
    return 0;
}
`,
  "c-printf-formats": raw`#include <stdio.h>

int main(void) {
    printf("Мова: %s\n", "C");
    printf("Рік: %d\n", 1972);
    printf("Оцінка: %.1f\n", 4.5);
    printf("Літера: %c\n", 'C');
    return 0;
}
`,
  "c-macro-square": raw`#include <stdio.h>

#define SQUARE(x) ((x) * (x))

int main(void) {
    printf("%d\n", SQUARE(2 + 3));
    printf("%d\n", SQUARE(4));
    return 0;
}
`,
  "c-warnings-fix": raw`#include <stdio.h>

int main(void) {
    int status = 404;
    if (status == 200) {
        printf("OK\n");
    } else {
        printf("Помилка %d\n", status);
    }
    return 0;
}
`,
};
