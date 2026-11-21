const raw = String.raw;

export const SOLUTIONS_02 = {
  "cpp-basic-types": raw`#include <iostream>

int main() {
    double sum = 18;
    int count = 4;
    double avg = sum / count;
    bool passed = avg >= 4;
    char grade = 'B';
    std::cout << std::boolalpha;
    std::cout << "Середній бал: " << avg << "\n";
    std::cout << "Склав: " << passed << "\n";
    std::cout << "Оцінка: " << grade << "\n";
    return 0;
}
`,
  "cpp-init-const-auto": raw`#include <iostream>

int main() {
    constexpr int vat = 20;
    const int price{250};
    const int qty{3};
    auto net = price * qty;
    auto tax = net * vat / 100;
    auto total = net + tax;
    std::cout << "Без ПДВ: " << net << "\n";
    std::cout << "ПДВ: " << tax << "\n";
    std::cout << "Разом: " << total << "\n";
    return 0;
}
`,
  "cpp-int-limits": raw`#include <cstdint>
#include <iostream>
#include <limits>

static_assert(sizeof(std::int32_t) == 4, "int32_t має 4 байти");

int main() {
    std::uint8_t level = 250;
    level += 10;
    std::cout << "level: " << int(level) << "\n";
    std::cout << "int32 max: " << std::numeric_limits<std::int32_t>::max() << "\n";
    std::uint32_t zero = 0;
    --zero;
    std::cout << "uint32 wrap: " << zero << "\n";
    int a = 2147483000;
    int b = 1000;
    bool fits = a <= std::numeric_limits<int>::max() - b;
    std::cout << std::boolalpha << "fits: " << fits << "\n";
    return 0;
}
`,
  "cpp-float-precision": raw`#include <cmath>
#include <iomanip>
#include <iostream>
#include <limits>

int main() {
    double a = 0.1;
    double b = 0.2;
    double sum = a + b;
    double bad = std::numeric_limits<double>::quiet_NaN();
    std::cout << std::boolalpha;
    std::cout << "рівні: " << (sum == 0.3) << "\n";
    std::cout << "близькі: " << (std::fabs(sum - 0.3) < 1e-9) << "\n";
    std::cout << "сума: " << std::fixed << std::setprecision(2) << sum << "\n";
    std::cout << "nan: " << std::isnan(bad) << "\n";
    return 0;
}
`,
  "cpp-types-total": raw`#include <iomanip>
#include <iostream>

int main() {
    int total = 7;
    int count = 2;
    double avg = static_cast<double>(total) / count;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Середнє: " << avg << "\n";
    std::cout << "Обрізано: " << static_cast<int>(7.9) << "\n";
    std::cout << "Символ: " << static_cast<char>(65) << "\n";
    return 0;
}
`,
  "cpp-string-email": raw`#include <iostream>
#include <string>

int main() {
    std::string email = "artem@example.com";
    std::size_t at = email.find('@');
    std::string user = email.substr(0, at);
    std::string domain = email.substr(at + 1);
    std::cout << "Користувач: " << user << "\n";
    std::cout << "Домен: " << domain << "\n";
    std::cout << "Довжина: " << email.size() << "\n";
    email.replace(at + 1, domain.size(), "iteris.dev");
    std::cout << "Нова адреса: " << email << "\n";
    return 0;
}
`,
  "cpp-stream-table": raw`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream in("Apple 3 12.5");
    std::string item;
    int qty = 0;
    double price = 0;
    in >> item >> qty >> price;
    std::cout << std::left << std::setw(8) << "Item" << std::right << std::setw(5) << "Qty" << std::setw(8) << "Price" << "\n";
    std::cout << std::fixed << std::setprecision(2);
    std::cout << std::left << std::setw(8) << item << std::right << std::setw(5) << qty << std::setw(8) << price << "\n";
    std::cout << "Total: " << qty * price << "\n";
    return 0;
}
`,
  "cpp-if-weather": raw`#include <iostream>

int main() {
    int temp = 27;
    bool raining = true;
    std::cout << "Температура: " << temp << "\n";
    std::cout << "Прогноз: ";
    if (temp < 0) {
        std::cout << "мороз\n";
    } else if (temp < 15) {
        std::cout << "прохолодно\n";
    } else if (temp < 25) {
        std::cout << "тепло\n";
    } else {
        std::cout << "спека\n";
    }
    std::cout << "Парасолька: " << (raining ? "так" : "ні") << "\n";
    return 0;
}
`,
  "cpp-switch-plan": raw`#include <iostream>

int main() {
    int plan = 2;
    std::cout << "Тариф: " << plan << "\n";
    switch (plan) {
        case 3:
            std::cout << "Підтримка 24/7\n";
            [[fallthrough]];
        case 2:
            std::cout << "Резервні копії\n";
            [[fallthrough]];
        case 1:
            std::cout << "Сховище 10 ГБ\n";
            break;
        default:
            break;
    }
    return 0;
}
`,
  "cpp-while-digits": raw`#include <iostream>

int main() {
    int original = 12345;
    int n = original;
    int digits = 0;
    int sum = 0;
    int reversed = 0;
    while (n > 0) {
        int d = n % 10;
        sum += d;
        reversed = reversed * 10 + d;
        digits++;
        n /= 10;
    }
    std::cout << "Число: " << original << "\n";
    std::cout << "Цифр: " << digits << "\n";
    std::cout << "Сума цифр: " << sum << "\n";
    std::cout << "Навпаки: " << reversed << "\n";
    return 0;
}
`,
  "cpp-multiples": raw`#include <iostream>

int main() {
    int sum = 0;
    bool first = true;
    for (int i = 1; i <= 20; i++) {
        if (i % 3 == 0 || i % 5 == 0) {
            std::cout << (first ? "" : " ") << i;
            sum += i;
            first = false;
        }
    }
    std::cout << "\n";
    std::cout << "Сума: " << sum << "\n";
    return 0;
}
`,
};
