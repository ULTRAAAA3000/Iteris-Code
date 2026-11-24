// Еталонні рішення завдань Python, глава 03 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_03 = {
  "python-list-basics": raw`temps = [18, 21, 19, 25, 23, 17, 20]

print(temps[0], temps[-1])
print(temps[1:4])
print(temps[::-1])
print(max(temps) - min(temps))
print(len(temps))
`,
  "python-top3-unique": raw`def unique(nums):
    result = []
    for x in nums:
        if x not in result:
            result.append(x)
    return result


def top3(nums):
    return sorted(nums, reverse=True)[:3]


data = [5, 3, 9, 3, 7, 9, 1, 5]
u = unique(data)
print(u)
print(top3(u))
`,
  "python-copy-traps": raw`base = [1, 2, 3]
backup = base.copy()
base.append(4)
print(backup)

grid = []
for _ in range(2):
    grid.append([0] * 3)
grid[0][0] = 1
print(grid)
`,
  "python-tuple-unpack": raw`point = (3, 4)
data = [10, 20, 30, 40, 50]
a, b = "left", "right"

x, y = point
print((x ** 2 + y ** 2) ** 0.5)

first, *middle, last = data
print(first, middle, last)

a, b = b, a
print(a, b)
`,
  "python-matrix-sums": raw`m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

row_sums = []
for row in m:
    row_sums.append(sum(row))
print(row_sums)

col_sums = []
for col in zip(*m):
    col_sums.append(sum(col))
print(col_sums)

diagonal = 0
for i in range(len(m)):
    diagonal += m[i][i]
print(diagonal)

print(list(zip(*m)))
`,
  "python-word-freq": raw`def word_count(text):
    counts = {}
    for word in text.split():
        counts[word] = counts.get(word, 0) + 1
    return counts


counts = word_count("to be or not to be that is the question to")
for word, n in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
    print(word, n)
`,
  "python-sets-tuples": raw`def min_max(nums):
    return min(nums), max(nums)


def common(a, b):
    return sorted(set(a) & set(b))


low, high = min_max([7, 2, 9, 4])
print("Мін:", low, "Макс:", high)
print("Спільні:", common([1, 2, 3, 4, 5], [4, 5, 6, 7]))
`,
  "python-comprehensions": raw`def squares_of_evens(nums):
    return [x * x for x in nums if x % 2 == 0]


def scores(names, points):
    return dict(zip(names, points))


def numbered(names):
    return [f"{i}. {n}" for i, n in enumerate(names, 1)]


print(squares_of_evens([1, 2, 3, 4, 5, 6]))
print(scores(["Оля", "Іван"], [90, 75]))
print(numbered(["Оля", "Іван"]))
`,
  "python-sort-key": raw`products = [
    {"name": "Хліб", "price": 25, "qty": 10},
    {"name": "Молоко", "price": 42, "qty": 3},
    {"name": "Сир", "price": 180, "qty": 3},
    {"name": "Яйця", "price": 60, "qty": 10},
]


def by_price(items):
    return [p["name"] for p in sorted(items, key=lambda p: p["price"])]


def by_qty_then_name(items):
    return [p["name"] for p in sorted(items, key=lambda p: (-p["qty"], p["name"]))]


print(by_price(products))
print(by_qty_then_name(products))
`,
  "python-collections-tools": raw`from collections import Counter, defaultdict, deque

text = "abracadabra"
words = ["apple", "avocado", "banana", "blueberry", "cherry"]

print(Counter(text).most_common(2))

groups = defaultdict(list)
for word in words:
    groups[word[0]].append(word)
print(dict(groups))

last3 = deque(maxlen=3)
for n in range(1, 6):
    last3.append(n)
print(list(last3))
`,
  "python-itertools-basics": raw`from itertools import chain, combinations, product, islice, count

print(list(chain([1, 2], [3])))
print(" ".join("".join(pair) for pair in combinations("abc", 2)))
print(len(list(product([0, 1], repeat=2))))
print(list(islice(count(0, 2), 5)))
`,
  "python-word-report": raw`text = "Python is great. Python is simple, and Python is popular! Simple is better than complex."
stop_words = {"is", "and", "than"}


def normalize(text):
    for mark in ".,!?;:":
        text = text.replace(mark, "")
    return text.lower()


def top_words(text, stop_words, n):
    counts = {}
    for word in normalize(text).split():
        if word in stop_words:
            continue
        counts[word] = counts.get(word, 0) + 1
    ordered = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return ordered[:n]


for word, count in top_words(text, stop_words, 3):
    print(f"{word}: {count}")
`,
};
