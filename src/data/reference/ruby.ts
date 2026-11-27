import type { RefSection } from "./types.ts";

const raw = String.raw;

export const ruby: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`puts "Привіт, світе!"
print "Без переходу"
puts
p "quoted"`, note: "Окремої `main` не потрібно: код виконується зверху вниз. `puts` друкує рядок і переходить на новий, `print` не переходить, а `p` показує значення так, як воно записується в коді." },
    { t: "Запуск", code: raw`ruby hello.rb

ruby -e 'puts 2 + 3'

irb    # інтерактивна консоль`, note: "Скрипти з розширенням `.rb` запускає інтерпретатор `ruby`. Прапор `-e` виконує один рядок, а `irb` дає інтерактивну консоль для швидких експериментів." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Змінні й константи", code: raw`name = "Olena"
score = 0
score += 10
MAX = 100
puts "#{name} #{score} #{MAX}"`, note: "Змінні створюються присвоєнням, тип оголошувати не потрібно. Ім'я з великої літери, як `MAX`, це константа, змінювати її не прийнято." },
    { t: "Базові типи", code: raw`i = 42
big = 10_000_000_000
d = 3.14
ok = true
nothing = nil
puts [i.class, big.class, d.class, ok.class, nothing.class].inspect`, note: "Основні типи: `Integer`, `Float`, `String`, `Symbol`, `true`, `false` та `nil`. Цілі числа можуть бути як завгодно великими, а `_` розділяє розряди." },
    { t: "Перетворення типів", code: raw`puts "12".to_i + 1
puts 7.to_f / 2
puts 3.9.to_i
puts 42.to_s + "!"
puts "abc".to_i
puts Integer("12")`, note: "Методи `to_i`, `to_f`, `to_s` перетворюють тип. Для нечислового рядка `to_i` дає `0`, а сувора `Integer(\"abc\")` викликає помилку." },
  ] },
  { t: "Рядки", items: [
    { t: "Інтерполяція", code: raw`name = "Ruby"
a = 3
b = 4
puts "Hello, #{name}!"
puts "Sum: #{a + b}"
puts 'Без підстановки: #{a}'`, note: "У подвійних лапках `#{вираз}` підставляє значення. В одинарних лапках підстановки не працюють, текст лишається як є." },
    { t: "Методи рядків", code: raw`s = "Hello, World"
puts s.length
puts s.upcase
puts s[0, 5]
puts s.sub("World", "Ruby")
puts s.include?("World")
p s.split(", ")`, note: "Метод із `?` на кінці повертає логічне значення, наприклад `include?`. Методи на кшталт `upcase` повертають новий рядок, а `upcase!` змінює наявний." },
    { t: "Багаторядкові рядки", code: raw`text = <<~TXT
  Line one
    Line two
TXT
puts text
puts "ab" * 3
s = "ab"
s << "c"
puts s`, note: "Heredoc `<<~` дозволяє писати текст на кілька рядків і прибирає спільний відступ. Оператор `*` повторює рядок, а `<<` дописує в кінець." },
  ] },
  { t: "Умови", items: [
    { t: "if, elsif, else", code: raw`age = 16
if age < 12
  puts "child"
elsif age < 18
  puts "teen"
else
  puts "adult"
end
puts "ok" unless age < 0`, note: "Умова не береться в дужки, а блок закінчується словом `end`. Гілка пишеться як `elsif`, а не `elseif`. `unless` виконується, коли умова хибна." },
    { t: "case і when", code: raw`day = 6
kind = case day
       when 1..5 then "weekday"
       when 6, 7 then "weekend"
       else "unknown"
       end
puts kind`, note: "`case` порівнює значення з варіантами в `when`, підтримує діапазони й кілька значень через кому. Як і `if`, він повертає значення." },
    { t: "Тернарний оператор і nil", code: raw`n = 5
puts n.even? ? "even" : "odd"
puts "big" if n > 3
name = nil
puts name || "unknown"
puts name.nil?
p name&.upcase`, note: "Тернарний оператор має вигляд `умова ? a : b`. Лише `false` і `nil` вважаються хибними, а `0` та порожній рядок істинні. Запис `&.` безпечно викликає метод у `nil`." },
  ] },
  { t: "Цикли", items: [
    { t: "times, upto, step", code: raw`3.times { |i| puts i }
1.upto(3) { |i| print i, " " }
puts
0.step(10, 5) { |i| print i, " " }
puts
(1..3).each { |i| puts i * i }`, note: "У Ruby цикли зазвичай пишуть через ітератори `times`, `upto`, `step` і `each` з блоком. Діапазон `1..3` включає кінець, а `1...3` не включає." },
    { t: "while і until", code: raw`n = 3
while n > 0
  puts n
  n -= 1
end
k = 0
k += 1 until k == 4
puts k`, note: "`while` виконується, поки умова істинна, а `until` поки вона хибна. Модифікатор `until` можна поставити після виразу в одному рядку." },
    { t: "loop, break і next", code: raw`i = 0
loop do
  i += 1
  next if i.odd?
  break if i > 6
  puts i
end`, note: "`loop do` це нескінченний цикл, який зупиняє `break`. Слово `next` пропускає решту ітерації й переходить до наступної." },
  ] },
  { t: "Блоки й ітератори", items: [
    { t: "Блок і yield", code: raw`def twice
  yield 1
  yield 2
end

twice { |x| puts x * 10 }
twice do |x|
  puts x + 100
end`, note: "Блок це шматок коду, який передають методу. Метод викликає його через `yield`. Короткий блок пишуть у `{ }`, а довгий між `do` та `end`." },
    { t: "map, select, reduce", code: raw`nums = [1, 2, 3, 4, 5]
p nums.map { |n| n * n }
p nums.select(&:even?)
p nums.reject(&:even?)
puts nums.reduce(0) { |sum, n| sum + n }
puts nums.sum`, note: "`map` перетворює кожен елемент, `select` залишає потрібні, `reject` відкидає їх, а `reduce` згортає список в одне значення. Запис `&:even?` це скорочення блока." },
    { t: "each_with_index", code: raw`fruits = %w[apple banana cherry]
fruits.each_with_index do |f, i|
  puts "#{i}: #{f}"
end
fruits.each_slice(2) { |pair| p pair }
p fruits.zip([1, 2, 3])`, note: "`each_with_index` дає елемент разом з індексом. Запис `%w[...]` створює масив рядків без лапок і ком, а `zip` склеює два масиви попарно." },
  ] },
  { t: "Методи", items: [
    { t: "Оголошення методу", code: raw`def add(a, b)
  a + b
end

def greet(name = "world")
  "Hello, #{name}!"
end

puts add(2, 3)
puts greet
puts greet("Ruby")`, note: "Метод оголошується через `def`, а останній обчислений вираз стає результатом, тому `return` зазвичай не потрібен. Параметри можуть мати значення за замовчуванням." },
    { t: "Іменовані аргументи", code: raw`def connect(host:, port: 80)
  "#{host}:#{port}"
end

puts connect(host: "localhost")
puts connect(port: 8080, host: "example.com")`, note: "Параметри з двокрапкою передаються за іменем у будь-якому порядку. Без значення за замовчуванням, як `host:`, параметр обов'язковий." },
    { t: "Змінна кількість аргументів", code: raw`def total(*nums)
  nums.sum
end

def info(**opts)
  opts
end

puts total(1, 2, 3)
p info(a: 1, b: 2)
def pair = [1, 2]
a, b = pair
puts a + b`, note: "`*nums` збирає зайві аргументи в масив, а `**opts` в хеш. Однорядковий метод пишуть через `=`, а множинне присвоєння `a, b = ...` розкладає масив." },
  ] },
  { t: "Колекції", items: [
    { t: "Масив", code: raw`a = [3, 1, 2]
a << 4
a.push(5)
p a
puts a.first, a.last, a.length
p a.sort
p a[1..2]
p a.include?(2)`, note: "Масив це впорядкований список будь-яких значень. `<<` і `push` додають в кінець, `first` та `last` беруть крайні елементи, а `sort` повертає відсортовану копію." },
    { t: "Корисні методи масивів", code: raw`a = [4, 1, 3, 1]
p a.uniq
p a.sort.reverse
p a.min, a.max
p a.each_slice(2).to_a
p a.partition(&:even?)
p a.take(2)
p a.compact`, note: "`uniq` прибирає дублікати, `partition` ділить на два масиви, `take` бере початок, а `compact` видаляє `nil`. Більшість методів повертають новий масив." },
    { t: "Діапазони", code: raw`r = (1..5)
p r.to_a
p (1...5).to_a
p ('a'..'e').to_a
puts r.sum
puts r.include?(3)
p r.step(2).to_a`, note: "Діапазон `a..b` включає обидва кінці, а `a...b` не включає правий. Його можна перетворити на масив через `to_a` або обійти методом `each`." },
  ] },
  { t: "Символи й хеші", items: [
    { t: "Символи", code: raw`s = :ruby
puts s
puts s.class
puts :a.equal?(:a)
puts "a".equal?("a")
puts "hello".to_sym.inspect
puts :hello.to_s`, note: "Символ `:name` це незмінне ім'я, яке існує в пам'яті в одному екземплярі. Тому символи зручні як ключі хешів. Перетворення виконують `to_sym` і `to_s`." },
    { t: "Хеш", code: raw`user = { name: "Olena", age: 16 }
puts user[:name]
user[:city] = "Dnipro"
p user
p user.fetch(:age)
p user[:none]
p user.fetch(:none, 0)
p user.key?(:age)`, note: "Хеш зберігає пари ключ і значення. Запис `name:` створює ключ-символ. Відсутній ключ через `[]` дає `nil`, а `fetch` дозволяє вказати значення за замовчуванням." },
    { t: "Обхід хешу", code: raw`prices = { apple: 3, pear: 5 }
prices.each { |k, v| puts "#{k} = #{v}" }
p prices.map { |k, v| [k, v * 2] }.to_h
p prices.select { |_, v| v > 3 }
p prices.keys
p prices.values
puts prices.sum { |_, v| v }
counts = Hash.new(0)
"abca".each_char { |c| counts[c] += 1 }
p counts`, note: "`each` для хешу бере пару `|ключ, значення|`. `to_h` збирає масив пар назад у хеш, а `Hash.new(0)` задає значення за замовчуванням, зручне для підрахунку." },
  ] },
  { t: "Класи й модулі", items: [
    { t: "Клас і attr_accessor", code: raw`class Person
  attr_accessor :name
  attr_reader :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def to_s = "#{@name} (#{@age})"
end

p1 = Person.new("Olena", 16)
p1.name = "Anna"
puts p1`, note: "Конструктор це метод `initialize`, а `@name` змінна екземпляра. `attr_accessor` створює геттер і сеттер, а `attr_reader` лише геттер. `to_s` задає текстовий вигляд." },
    { t: "Успадкування", code: raw`class Animal
  def initialize(name) = @name = name
  def speak = "..."
end

class Dog < Animal
  def speak = "#{@name}: Woof!"
end

puts Dog.new("Rex").speak
puts Dog.superclass
puts Dog.new("Rex").is_a?(Animal)`, note: "Знак `<` вказує батьківський клас. Дочірній клас перевизначає методи, а для виклику батьківської версії є `super`. Один клас успадковує лише від одного батька." },
    { t: "Модулі", code: raw`module Greeting
  def hello = "Hello, #{name}!"
end

module Util
  def self.double(x) = x * 2
end

class User
  include Greeting
  attr_reader :name
  def initialize(name) = @name = name
end

puts User.new("Ann").hello
puts Util.double(4)`, note: "`module` це набір методів. Через `include` його методи додаються в клас як домішка, а методи з `self.` викликаються прямо на модулі, як простір імен." },
  ] },
  { t: "Помилки", items: [
    { t: "begin, rescue, ensure", code: raw`begin
  puts Integer("abc")
rescue ArgumentError => e
  puts "Помилка: #{e.message}"
else
  puts "Без помилок"
ensure
  puts "Завжди виконується"
end`, note: "Код у `begin` захищений: помилку певного класу перехоплює `rescue`. Гілка `ensure` виконується завжди, а `else` лише тоді, коли помилки не було." },
    { t: "raise і власні помилки", code: raw`class NegativeError < StandardError; end

def root(x)
  raise NegativeError, "negative: #{x}" if x < 0
  Math.sqrt(x)
end

begin
  root(-1)
rescue NegativeError => e
  puts e.message
end
puts root(9)`, note: "`raise` викликає помилку. Власний клас помилки успадковують від `StandardError`. Конструкцію `rescue` також можна писати прямо в тілі методу." },
    { t: "retry і rescue в методі", code: raw`def safe_div(a, b)
  a / b
rescue ZeroDivisionError
  puts "ділення на нуль"
  nil
end

p safe_div(1, 0)
tries = 0
begin
  tries += 1
  raise "fail" if tries < 3
  puts "ok after #{tries}"
rescue
  retry
end`, note: "Блок `rescue` можна писати без `begin` усередині `def`. Команда `retry` повторює захищений код спочатку, що зручно для повторних спроб." },
  ] },
];
