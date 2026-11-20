// Еталонні рішення завдань Python, глава 01 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_01 = {
  "python-hello-run": raw`print("Привіт, Python!")
print(2 ** 10)
`,
  "python-print-sep-end": raw`print("Go", "Rust", "Python", sep="-")

print("Завантаження", end="... ")
print("готово")
`,
  "python-import-tools": raw`import math
from statistics import mean

if __name__ == "__main__":
    print(math.isqrt(144))
    print(mean([2, 4, 6]))
    print(round(math.pi, 2))
`,
  "python-fix-traceback": raw`price = 120
count = 3
total = price * count
print("Разом:", total)
print("Середня ціна:", total / count)
`,
};
