import type { RefSection } from "./types.ts";

const raw = String.raw;

export const lua: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`print("Привіт, світе!")
print("a", "b", 42)
io.write("Без переходу")
io.write("\n")
-- коментар до кінця рядка
--[[ багаторядковий
коментар ]]`, note: "Окремої `main` не потрібно: скрипт виконується зверху вниз. `print` ставить табуляцію між аргументами й переходить на новий рядок, а `io.write` не переходить." },
    { t: "Запуск", code: raw`lua hello.lua

lua -e "print(2 + 3)"

lua    -- інтерактивна консоль`, note: "Скрипти з розширенням `.lua` запускає інтерпретатор `lua`. Прапор `-e` виконує один рядок, а запуск без аргументів відкриває інтерактивну консоль." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Локальні й глобальні змінні", code: raw`local name = "Olena"
local score = 0
score = score + 10
count = 5
local a, b = 1, 2
a, b = b, a
print(name, score, count, a, b)`, note: "`local` створює змінну, видиму лише в поточному блоці. Без `local` змінна стає глобальною. Присвоєння кількох значень одразу дозволяє обміняти змінні місцями." },
    { t: "Типи", code: raw`print(type(42), type(3.14), type("s"))
print(type(true), type(nil), type({}))
print(type(print))
print(math.type(7), math.type(7.0))
print(7 // 2, 7 / 2, 7 % 3, 2 ^ 10)`, note: "Основні типи: `number`, `string`, `boolean`, `nil`, `table`, `function`. У Lua 5.4 є цілі та дробові числа, а `//` це цілочисельне ділення, `/` завжди дає дріб." },
    { t: "Перетворення типів", code: raw`print(tonumber("12") + 1)
print(tonumber("abc"))
print(tostring(42) .. "!")
print(tonumber("ff", 16))
print(math.floor(3.9), math.ceil(3.1))
print(10 == 10.0)`, note: "`tonumber` перетворює рядок на число й повертає `nil`, якщо це неможливо. `tostring` робить рядок із будь-якого значення, а `math.floor` округлює вниз." },
  ] },
  { t: "Рядки", items: [
    { t: "Конкатенація й довжина", code: raw`local a = "Hello"
local b = 'World'
print(a .. ", " .. b .. "!")
print(#a)
print("x" .. 1 .. 2)
local long = [[Рядок
на два рядки]]
print(long)`, note: "Рядки склеюються оператором `..`, а довжину повертає `#`. Подвійні й одинарні лапки рівноправні, а `[[ ... ]]` дає багаторядковий рядок без екранування." },
    { t: "Бібліотека string", code: raw`local s = "Hello, World"
print(s:upper(), s:lower())
print(s:sub(1, 5))
print(s:find("World"))
print(s:rep(2, "-"))
print(s:reverse())
print(string.format("%s: %d, %.2f", "x", 7, 3.14159))`, note: "Методи рядків викликаються через двокрапку: `s:upper()`. Індексація в `sub` та `find` починається з `1`, а `string.format` працює як `printf` у C." },
    { t: "Шаблони", code: raw`local s = "a1b22c333"
print(s:match("%d+"))
print(s:gsub("%d", "#"))
for w in ("one two three"):gmatch("%a+") do
  print(w)
end
print(("key=value"):match("(%w+)=(%w+)"))`, note: "Lua має власні шаблони, а не регулярні вирази: `%d` цифра, `%a` літера, `%w` літера або цифра, `+` повтор. Дужки захоплюють частини збігу, `gmatch` перебирає всі збіги." },
  ] },
  { t: "Умови", items: [
    { t: "if, elseif, else", code: raw`local n = 15
if n < 10 then
  print("мало")
elseif n < 20 then
  print("середньо")
else
  print("багато")
end
print(n ~= 15, not (n > 5))`, note: "Умова не береться в дужки, блок закінчується словом `end`, а гілка пишеться `elseif`. Нерівність записується як `~=`, а логічні оператори це `and`, `or`, `not`." },
    { t: "Істинність і and/or", code: raw`print(nil and 1, false or "default")
print(0 and "нуль теж істина")
print("" and "порожній рядок теж")
local x = nil
local y = x or 100
local z = (5 > 3) and "так" or "ні"
print(y, z)`, note: "Хибними є лише `nil` та `false`, а `0` і порожній рядок вважаються істиною. Вираз `a and b or c` слугує тернарним оператором, а `x or значення` задає типове." },
  ] },
  { t: "Цикли", items: [
    { t: "Числовий for", code: raw`for i = 1, 3 do
  print(i)
end
for i = 10, 1, -4 do
  print(i)
end
for i = 0, 1, 0.5 do
  print(i)
end`, note: "Форма `for i = початок, кінець, крок` включає обидві межі, а крок за замовчуванням дорівнює `1`. Змінна циклу локальна, її зміна не впливає на кількість ітерацій." },
    { t: "while і repeat", code: raw`local n = 0
while n < 3 do
  n = n + 1
end
print(n)
local k = 10
repeat
  k = k - 3
until k < 0
print(k)`, note: "`while` перевіряє умову перед кроком, а `repeat ... until` після нього, тож тіло виконається хоча б раз. Умова в `until` бачить локальні змінні з тіла циклу." },
    { t: "break і goto continue", code: raw`for i = 1, 10 do
  if i % 2 == 0 then goto continue end
  if i > 7 then break end
  print(i)
  ::continue::
end`, note: "`break` виходить із циклу. Оператора `continue` у Lua немає, натомість використовують `goto` на мітку `::continue::` в кінці тіла циклу." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення функції", code: raw`local function add(a, b)
  return a + b
end
local mul = function(a, b) return a * b end
print(add(2, 3), mul(2, 3))
local function minmax(a, b)
  if a < b then return a, b end
  return b, a
end
print(minmax(9, 4))`, note: "Функція це звичайне значення, її можна зберегти в змінну. Вона може повертати кілька значень через кому. Для рекурсії оголошуйте її як `local function`." },
    { t: "Змінна кількість аргументів", code: raw`local function sum(...)
  local total = 0
  for _, v in ipairs({...}) do
    total = total + v
  end
  return total, select("#", ...)
end
print(sum(1, 2, 3, 4))
print(select(2, "a", "b", "c"))`, note: "Три крапки `...` приймають довільну кількість аргументів. Їх збирають у таблицю `{...}`, а `select(\"#\", ...)` повертає кількість аргументів." },
    { t: "Замикання", code: raw`local function counter()
  local n = 0
  return function()
    n = n + 1
    return n
  end
end
local c = counter()
print(c(), c(), c())`, note: "Внутрішня функція пам'ятає локальні змінні зовнішньої, навіть коли та вже завершилась. Кожен виклик `counter()` створює власний незалежний лічильник `n`." },
  ] },
  { t: "Таблиці", items: [
    { t: "Таблиця як масив", code: raw`local t = {10, 20, 30}
table.insert(t, 40)
table.insert(t, 1, 5)
print(#t, t[1], t[#t])
print(table.remove(t))
print(table.concat(t, ", "))
table.sort(t, function(a, b) return a > b end)
print(table.concat(t, " "))`, note: "Таблиця це єдина структура даних Lua. Як масив вона індексується з `1`, `#t` дає довжину, а `table.insert`, `table.remove`, `table.sort` змінюють її на місці." },
    { t: "Таблиця як словник", code: raw`local p = {name = "Olena", age = 17}
p.city = "Dnipro"
p["age"] = 18
p.city = nil
for k, v in pairs(p) do
  print(k, v)
end
print(p.missing)`, note: "Запис `t.key` це скорочення для `t[\"key\"]`. Присвоєння `nil` видаляє ключ, а відсутній ключ дає `nil`. Порядок обходу через `pairs` не гарантований." },
    { t: "ipairs і вкладені таблиці", code: raw`local grid = { {1, 2}, {3, 4} }
print(grid[2][1])
for i, row in ipairs(grid) do
  print(i, #row)
end
local list = {"a", "b", nil, "d"}
print(#list >= 2)`, note: "`ipairs` обходить елементи з `1` до першого `nil`, тоді як `pairs` бере всі пари. Вкладені таблиці утворюють матриці, а діри з `nil` роблять довжину `#` ненадійною." },
  ] },
  { t: "Таблиці як об'єкти", items: [
    { t: "Методи й self", code: raw`local acc = {balance = 0}
function acc:deposit(n)
  self.balance = self.balance + n
end
function acc.show(a)
  print(a.balance)
end
acc:deposit(50)
acc:show()`, note: "Запис `obj:method(x)` це те саме, що `obj.method(obj, x)`: об'єкт автоматично стає першим параметром `self`. Так у таблицях зберігають і дані, і поведінку." },
    { t: "Клас через метатаблицю", code: raw`local Dog = {}
Dog.__index = Dog
function Dog.new(name)
  return setmetatable({name = name}, Dog)
end
function Dog:speak()
  return self.name .. " says woof"
end
local d = Dog.new("Rex")
print(d:speak())`, note: "Метатаблиця з полем `__index` вказує, де шукати відсутні поля й методи. `setmetatable` прив'язує її до об'єкта, тож усі екземпляри ділять методи класу." },
    { t: "Успадкування", code: raw`local Animal = {}
Animal.__index = Animal
function Animal:kind() return "animal" end
local Cat = setmetatable({}, {__index = Animal})
Cat.__index = Cat
function Cat:meow() return "meow" end
local c = setmetatable({}, Cat)
print(c:meow(), c:kind())`, note: "Клас-нащадок сам має метатаблицю з `__index` на батька. Пошук методу йде по ланцюжку: об'єкт, його клас, потім батьківський клас." },
  ] },
  { t: "Метатаблиці", items: [
    { t: "Оператори через метаметоди", code: raw`local V = {}
V.__index = V
V.__add = function(a, b) return setmetatable({x = a.x + b.x}, V) end
V.__tostring = function(v) return "V(" .. v.x .. ")" end
V.__eq = function(a, b) return a.x == b.x end
local a = setmetatable({x = 1}, V)
local b = setmetatable({x = 2}, V)
print(tostring(a + b), a == b)`, note: "Метаметоди `__add`, `__eq`, `__lt`, `__tostring` задають, як таблиця поводиться з операторами й функціями на кшталт `print`. Їх кладуть у метатаблицю." },
    { t: "__index, __newindex, __call", code: raw`local t = setmetatable({}, {
  __index = function(_, k) return "немає " .. k end,
  __newindex = function(tbl, k, v) rawset(tbl, k, v * 2) end,
  __call = function(_, x) return x + 1 end,
})
print(t.foo)
t.a = 5
print(t.a, t(10))`, note: "`__index` перехоплює читання відсутніх ключів, `__newindex` запис нових, а `__call` дозволяє викликати таблицю як функцію. `rawset` пише в обхід метатаблиці." },
  ] },
  { t: "Корутини", items: [
    { t: "create, resume, yield", code: raw`local co = coroutine.create(function(a)
  print("start", a)
  local b = coroutine.yield(a + 1)
  print("got", b)
  return "done"
end)
print(coroutine.resume(co, 10))
print(coroutine.resume(co, "x"))
print(coroutine.status(co))`, note: "Корутина це функція, яку можна призупинити. `resume` запускає її або продовжує, `yield` віддає значення назад і чекає. Статус показує `coroutine.status`." },
    { t: "Генератор через wrap", code: raw`local function range(n)
  return coroutine.wrap(function()
    for i = 1, n do coroutine.yield(i) end
  end)
end
for i in range(3) do
  print(i)
end`, note: "`coroutine.wrap` повертає функцію, яка при кожному виклику продовжує корутину. Це зручний спосіб зробити ітератор для циклу `for ... in`." },
  ] },
  { t: "Модулі й помилки", items: [
    { t: "Модуль як таблиця", code: raw`local M = {}
function M.square(x) return x * x end
M.pi = 3.14159
-- mymath.lua ends with: return M
-- main.lua: local mymath = require("mymath")
print(M.square(4), M.pi)`, note: "Модуль це файл, який повертає таблицю. Функція `require` завантажує його один раз і кешує результат. Усе, що не потрібно показувати, лишається `local`." },
    { t: "pcall й error", code: raw`local ok, err = pcall(function()
  error("щось пішло не так")
end)
print(ok, err)
print(select(2, pcall(error, {code = 42})).code)
local ok2, v = pcall(function() return 1 + 1 end)
print(ok2, v)`, note: "`pcall` виконує функцію й повертає `true` та результат або `false` та повідомлення про помилку. `error` кидає помилку, у яку можна передати і рядок, і таблицю." },
    { t: "assert і xpcall", code: raw`print(pcall(assert, false, "перевірка не пройшла"))
print(xpcall(function() error("boom") end,
  function(m) return "handled: " .. m end))
local f = io.open("no_such_file.txt")
print(f)`, note: "`assert(умова, повідомлення)` кидає помилку, якщо умова хибна. `xpcall` приймає ще й обробник помилки. Функції вводу-виводу, як `io.open`, повертають `nil` замість помилки." },
  ] },
];
