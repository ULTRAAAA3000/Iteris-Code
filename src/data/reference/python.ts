import type { RefSection } from "./types.ts";

const raw = String.raw;

export const python: RefSection[] = [
  { t: "Вивід і ввід", items: [
    { t: "print і коментарі", code: raw`print("Привіт, світе!")   # коментар
print("Сума:", 2 + 3)
print("a", "b", sep="-", end="!\n")`, note: "`print` виводить значення через пробіл. Параметри `sep` і `end` змінюють роздільник і закінчення рядка." },
    { t: "input", code: raw`name = input("Ім'я: ")
age = int(input("Вік: "))
print(f"{name}, вам {age}")`, note: "`input` завжди повертає рядок, числа перетворюють через `int()` або `float()`." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Основні типи", code: raw`n = 42            # int
x = 3.14          # float
s = "текст"       # str
ok = True         # bool
nothing = None    # відсутність значення
print(type(n), type(x))`, note: "Оголошувати тип не потрібно: змінна створюється присвоєнням." },
    { t: "Операції", code: raw`print(7 / 2, 7 // 2, 7 % 2, 2 ** 10)   # 3.5 3 1 1024
x = 5
x += 2                                  # x = x + 2
print(int("12"), float("1.5"), str(7), bool(0))`, note: "`/` дає дріб, `//` ділить націло, `%` повертає остачу, `**` підносить до степеня." },
  ] },
  { t: "Рядки", items: [
    { t: "Зрізи й методи", code: raw`s = "Python"
print(len(s), s[0], s[-1], s[1:4])    # 6 P n yth
print(s.upper(), s.lower(), s.replace("P", "J"))
print("a,b,c".split(","), " ".join(["a", "b"]))`, note: "Рядки незмінні: методи повертають новий рядок." },
    { t: "f-рядки", code: raw`name, price = "Хліб", 24.5
print(f"{name}: {price:.2f} грн")   # Хліб: 24.50 грн`, note: "Вирази в `{}` обчислюються, після двокрапки задається формат." },
  ] },
  { t: "Умови", items: [
    { t: "if / elif / else", code: raw`age = 17
if age < 12:
    print("дитина")
elif age < 18:
    print("підліток")
else:
    print("дорослий")`, note: "Блоки виділяються відступами (зазвичай 4 пробіли), а не дужками." },
    { t: "Логіка й порівняння", code: raw`x = 5
print(1 < x < 10, x == 5, x != 3)
print(x > 3 and x < 8, not (x > 3), x < 0 or x > 4)
print("a" in "cat", 3 in [1, 2, 3])`, note: "Порівняння можна ланцюжити: `1 < x < 10`." },
  ] },
  { t: "Цикли", items: [
    { t: "for і range", code: raw`for i in range(3):          # 0 1 2
    print(i)
for i in range(1, 10, 2):   # 1 3 5 7 9
    print(i)
for ch in "abc":
    print(ch)`, note: "`range(a, b, крок)` не включає `b`." },
    { t: "while, break, continue", code: raw`n = 0
while True:
    n += 1
    if n % 2 == 0:
        continue      # пропустити крок
    if n > 7:
        break         # вийти з циклу
    print(n)`, note: "`break` завершує цикл, `continue` переходить до наступної ітерації." },
  ] },
  { t: "Колекції", items: [
    { t: "Список", code: raw`nums = [3, 1, 2]
nums.append(5)
nums.sort()
print(nums, len(nums), nums[0], nums[-1])
print([x * 2 for x in nums])   # список із виразу`, note: "Список змінюваний. Генератор списку `[вираз for x in ...]` створює новий список." },
    { t: "Кортеж і множина", code: raw`point = (3, 4)          # кортеж: незмінний
x, y = point
tags = {"a", "b", "a"}   # множина: унікальні елементи
print(len(tags), "a" in tags)`, note: "Кортеж не можна змінити, множина не зберігає порядок і дублікатів." },
    { t: "Словник", code: raw`user = {"name": "Олена", "age": 16}
user["city"] = "Дніпро"
print(user["name"], user.get("phone", "немає"))
for key, value in user.items():
    print(key, value)`, note: "`get` повертає значення за замовчуванням, якщо ключа немає, і не кидає помилку." },
  ] },
  { t: "Функції", items: [
    { t: "def, return, параметри", code: raw`def area(w, h=1):
    return w * h

print(area(3, 4), area(5))
print(area(h=2, w=6))`, note: "Параметри можуть мати значення за замовчуванням, аргументи можна передавати за іменем." },
    { t: "*args, **kwargs і lambda", code: raw`def total(*nums):
    return sum(nums)

print(total(1, 2, 3))
square = lambda x: x * x
print(list(map(square, [1, 2, 3])))`, note: "`*args` збирає позиційні аргументи в кортеж, `**kwargs` іменовані в словник." },
  ] },
  { t: "Помилки й файли", items: [
    { t: "try / except", code: raw`try:
    n = int(input("Число: "))
    print(10 / n)
except ValueError:
    print("Це не число")
except ZeroDivisionError:
    print("На нуль ділити не можна")
finally:
    print("Готово")`, note: "Ловіть конкретні типи помилок, а не все підряд." },
    { t: "Читання й запис файлів", code: raw`with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("рядок 1\n")
with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())`, note: "Блок `with` сам закриє файл, навіть якщо сталася помилка." },
  ] },
  { t: "Класи", items: [
    { t: "Клас і метод", code: raw`class Dog:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name}: гав!"

rex = Dog("Рекс")
print(rex.speak())`, note: "`__init__` викликається під час створення об'єкта, `self` це сам об'єкт." },
  ] },
];
