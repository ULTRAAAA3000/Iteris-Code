// Еталонні рішення завдань Python, глава 02 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_02 = {
  "python-order-total": raw`item = "Зошит"
price = 40
qty = 5

total = price * qty
total += 20
print(item + ":", total)
print(type(item).__name__, type(total).__name__)
`,
  "python-numbers-money": raw`from decimal import Decimal

minutes = 135

hours, rest = divmod(minutes, 60)
print(hours, "год", rest, "хв")
print(Decimal("0.1") + Decimal("0.2"))
print(round(10 / 3, 2))
`,
  "python-bool-none": raw`age = 16
has_ticket = True
is_vip = False
nickname = ""
token = None

print(age >= 18 or is_vip)
print(has_ticket and not is_vip)
print(nickname or "гість")
print(token is None)
`,
  "python-slugify": raw`title = "  Hello   World From Python "
word_a = "А роза упала на лапу Азора"
word_b = "Python"

print("-".join(title.strip().lower().split()))

clean_a = word_a.lower().replace(" ", "")
print(clean_a == clean_a[::-1])
clean_b = word_b.lower().replace(" ", "")
print(clean_b == clean_b[::-1])
`,
  "python-parse-input": raw`raw_price = " 12,50 "
raw_qty = "3"

price = float(raw_price.strip().replace(",", "."))
qty = int(raw_qty)
total = price * qty
print(total)
print(type(total).__name__)
print(bool("0"), bool(0))
`,
  "python-format-receipt": raw`name = "Зошит"
price = 40
qty = 3
big = 1234567.891

print(f"{name:<8}|{price:>7.2f}|{qty:>3}|{price * qty:>8.2f}")
print(f"Усього: {big:,.2f}")
`,
  "python-grade": raw`score = 82
age = 15
has_parent = True

if score >= 90:
    print("відмінно")
elif score >= 75:
    print("добре")
elif score >= 60:
    print("задовільно")
else:
    print("незадовільно")

if age >= 18 or (age >= 14 and has_parent):
    print("Вхід дозволено")
else:
    print("Вхід заборонено")
`,
  "python-match-command": raw`status = 404
command = "move 3 4".split()

match status:
    case 200 | 201 | 204:
        print("Успіх")
    case 404:
        print("Не знайдено")
    case _:
        print("Інше")

match command:
    case ["move", x, y]:
        print(f"рух: x={x}, y={y}")
    case _:
        print("Невідома команда")
`,
  "python-fizzbuzz": raw`for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)

n = 100
steps = 0
while n >= 1:
    n /= 2
    steps += 1
print("Кроків:", steps)
`,
  "python-first-prime": raw`for n in range(91, 200):
    for d in range(2, n):
        if n % d == 0:
            break
    else:
        print(n)
        break

total = 0
for i in range(1, 21):
    if i % 3 == 0:
        continue
    total += i
print("Сума:", total)
`,
  "python-function-basics": raw`def rectangle_area(w, h):
    return w * h


def is_even(n):
    return n % 2 == 0


def full_name(first, last):
    return first.title() + " " + last.title()


print(rectangle_area(4, 6))
print(is_even(10), is_even(7))
print(full_name("ada", "lovelace"))
`,
  "python-functions": raw`def apply_discount(price, percent=10):
    return round(price * (1 - percent / 100), 2)


def summary(*nums):
    total = sum(nums)
    return (len(nums), total, round(total / len(nums), 2))


print(apply_discount(200))
print(apply_discount(200, 25))
print(summary(4, 8, 15))
`,
  "python-closures": raw`def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply


def make_counter():
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count
    return counter


double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))

c = make_counter()
print(c(), c(), c())
d = make_counter()
print(d())
`,
  "python-recursion": raw`def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)


def digit_sum(n):
    if n < 10:
        return n
    return n % 10 + digit_sum(n // 10)


print(factorial(10))
print(digit_sum(2026))
`,
};
