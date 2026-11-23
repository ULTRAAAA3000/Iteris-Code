// «Поломки» еталонів C++: після заміни мають стати FAIL саме перелічені вимоги. Кожна вимога покрита хоч однією поломкою.
// replace: [[від, до]] або [від, до, "all"] для всіх входжень.
export default {
  "cpp-temperature-log": [
    { fails: ["R6"], replace: [["    if (t.empty()) return 0.0;\n", ""]] },
    { fails: ["R3", "R7"], replace: [["if (x < m) m = x;", "if (x > m) m = x;"]] },
    { fails: ["R1"], replace: [["if (temp < 10) return", "if (temp < 9) return"]] },
    { fails: ["R4", "R7"], replace: [["if (x > limit) ++n;", "if (x >= limit) ++n;"]] },
    { fails: ["R5", "R7"], replace: [["} else current = 0;", "}"]] },
    { fails: ["R2", "R6"], replace: [["return sum / static_cast<double>(t.size());", "return sum / (t.size() + 1);"]] },
  ],
  "cpp-bank-account": [
    { fails: ["R1"], replace: [["balance_(balance) {}", "balance_(0.0) {}"]] },
    { fails: ["R2"], replace: [["        if (amount <= 0) return false;\n        balance_ += amount;", "        balance_ += amount;"]] },
    { fails: ["R3"], replace: [["if (amount <= 0 || amount > balance_) return false;\n        balance_ -= amount;\n        history_.push_back(\"зняття", "if (amount <= 0 || amount >= balance_) return false;\n        balance_ -= amount;\n        history_.push_back(\"зняття"]] },
    { fails: ["R4"], replace: [["        to.balance_ += amount;\n", ""]] },
    { fails: ["R5"], replace: [["        history_.push_back(\"поповнення +\" + money(amount));\n", ""]] },
    { fails: ["R6"], replace: [["\"переказ -\"", "\"переказ - \""]] },
    { fails: ["R7"], replace: [["double balance() const {", "double balance() {"]] },
    { fails: ["R8"], replace: [["    double balance_;\n", "    static inline double balance_ = 0;\n"], [", balance_(balance) {}", " { balance_ = balance; }"]] },
  ],
  "cpp-shapes-zoo": [
    // усі три методи мають стати не чисто віртуальними, інакше клас лишається абстрактним
    { fails: ["R1"], replace: [["virtual double area() const = 0;", "virtual double area() const { return 0; }"], ["virtual double perimeter() const = 0;", "virtual double perimeter() const { return 0; }"], ["virtual std::string name() const = 0;", "virtual std::string name() const { return \"\"; }"]] },
    { fails: ["R2"], replace: [["    virtual ~Shape() = default;\n", ""]] },
    { fails: ["R3"], replace: [["return PI * r_ * r_;", "return PI * r_;"]] },
    { fails: ["R4"], replace: [["return 2 * (w_ + h_);", "return w_ + h_;"]] },
    // у трикутника 3-4-5 множник (s - c) дорівнює 1, тож прибираємо інший, щоб площа справді змінилась
    { fails: ["R5"], replace: [["std::sqrt(s * (s - a_) * (s - b_) * (s - c_))", "std::sqrt(s * (s - b_) * (s - c_))"]] },
    { fails: ["R6"], replace: [["virtual std::string name() const = 0;", "std::string name() const { return \"?\"; }"], ["std::string name() const override", "std::string name() const", "all"]] },
    { fails: ["R7"], replace: [["total += s->area();", "total += s->perimeter();"]] },
    { fails: ["R8"], replace: [["return a->area() < b->area();", "return a->area() > b->area();"]] },
  ],
};
