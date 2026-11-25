const raw = String.raw;

export const SOLUTIONS_02b = {
  "cpp-multiples": raw`#include <iostream>

int main() {
    int sum = 0;
    bool first = true;
    for (int i = 1; i <= 20; i++) {
        if (i % 3 == 0 || i % 5 == 0) {
            if (!first) std::cout << " ";
            std::cout << i;
            sum += i;
            first = false;
        }
    }
    std::cout << std::endl;
    std::cout << "Сума: " << sum << std::endl;
    return 0;
}
`,
  "cpp-function-helpers": raw`#include <iostream>

int sumTo(int n) {
    int s = 0;
    for (int i = 1; i <= n; i++) s += i;
    return s;
}

bool isPrime(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) return false;
    }
    return true;
}

void divmod(int a, int b, int& q, int& r) {
    q = a / b;
    r = a % b;
}

int main() {
    std::cout << "sumTo(100) = " << sumTo(100) << "\n";
    std::cout << "Прості:";
    for (int i = 10; i <= 20; i++) {
        if (isPrime(i)) std::cout << " " << i;
    }
    std::cout << "\n";
    int q = 0, r = 0;
    divmod(17, 5, q, r);
    std::cout << "17 / 5 = " << q << " остача " << r << "\n";
    return 0;
}
`,
  "cpp-overload-default": raw`#include <iostream>
#include <iomanip>

int power(int base, int exp = 2) {
    int result = 1;
    for (int i = 0; i < exp; i++) result *= base;
    return result;
}

double area(double r) {
    return 3.14159265 * r * r;
}

double area(double w, double h) {
    return w * h;
}

int main() {
    std::cout << power(5) << std::endl;
    std::cout << power(2, 10) << std::endl;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << area(2) << std::endl;
    std::cout << area(3, 4) << std::endl;
    return 0;
}
`,
  "cpp-lambda-capture": raw`#include <iostream>

int main() {
    int base = 10;
    auto cube = [](int x) { return x * x * x; };
    auto addBase = [base](int x) { return x + base; };
    base = 100;

    int counter = 0;
    auto tick = [&counter]() { counter++; };
    tick();
    tick();
    tick();

    std::cout << "cube(3) = " << cube(3) << "\n";
    std::cout << "addBase(5) = " << addBase(5) << "\n";
    std::cout << "counter = " << counter << "\n";
    return 0;
}
`,
  "cpp-recursion-basics": raw`#include <iostream>

long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

int bitLength(int n) {
    if (n == 0) return 0;
    return 1 + bitLength(n / 2);
}

int main() {
    std::cout << "10! = " << factorial(10) << "\n";
    std::cout << "gcd(84, 36) = " << gcd(84, 36) << "\n";
    std::cout << "bits(37) = " << bitLength(37) << "\n";
    return 0;
}
`,
  "cpp-constexpr-fib": raw`#include <iostream>

constexpr int fib(int n) {
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        int next = a + b;
        a = b;
        b = next;
    }
    return a;
}

int main() {
    constexpr int kCount = 10;
    static_assert(fib(10) == 55, "fib(10) має дорівнювати 55");

    int table[kCount];
    for (int i = 0; i < kCount; i++) table[i] = fib(i);

    for (int i = 0; i < kCount; i++) {
        if (i > 0) std::cout << " ";
        std::cout << table[i];
    }
    std::cout << "\n";
    std::cout << "fib(10) = " << fib(10) << "\n";
    return 0;
}
`,
};
