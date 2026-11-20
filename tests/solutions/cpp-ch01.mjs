const raw = String.raw;

export const SOLUTIONS_01 = {
  "cpp-hello-compiler": raw`#include <iostream>

int main() {
    std::cout << "Привіт, C++!" << "\n";
    std::cout << "Компілятор працює" << "\n";
    return 0;
}
`,
  "cpp-first-program": raw`#include <iostream>

int main() {
    std::cout << "2 + 3 = " << 2 + 3 << "\n";
    std::cout << "(8 + 4) * 3 = " << (8 + 4) * 3 << "\n";
    return 0;
}
`,
  "cpp-build-stages": raw`#include <iostream>

#define VERSION 3

int twice(int x);

int main() {
    std::cout << "Iteris Code v" << VERSION << "\n";
#ifdef DEBUG
    std::cout << "Режим: debug" << "\n";
#else
    std::cout << "Режим: release" << "\n";
#endif
    std::cout << "twice(21) = " << twice(21) << "\n";
    return 0;
}

int twice(int x) {
    return x * 2;
}
`,
  "cpp-warnings-clean": raw`#include <iostream>

int area(int width, int height) {
    return width * height;
}

int main() {
    int width = 6;
    int height = 7;
    int depth = 3;
    std::cout << "Площа: " << area(width, height) << "\n";
    std::cout << "Об'єм: " << width * height * depth << "\n";
    return 0;
}
`,
};
