const raw = String.raw;

export const SOLUTIONS_01 = {
  "cpp-hello-compiler": raw`#include <iostream>

int main() {
    std::cout << "Привіт, C++!" << std::endl;
    std::cout << "Компілятор працює" << std::endl;
    return 0;
}
`,
  "cpp-first-program": raw`#include <iostream>

int main() {
    std::cout << "2 + 3 = " << 2 + 3 << std::endl;
    std::cout << "(8 + 4) * 3 = " << (8 + 4) * 3 << std::endl;
    return 0;
}
`,
  "cpp-namespace-shop": raw`#include <iostream>

namespace shop {
int total(int price, int qty) {
    return price * qty;
}
}

int main() {
    using std::cout;
    cout << "Разом: " << shop::total(50, 3) << std::endl;
    return 0;
}
`,
  "cpp-clean-build": raw`#include <cstddef>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{1, 2, 3};
    int sum = 0;
    for (std::size_t i = 0; i < v.size(); ++i) {
        sum += v[i];
    }
    std::cout << "Сума: " << sum << std::endl;
    std::cout << "Елементів: " << v.size() << std::endl;
    return 0;
}
`,
};
