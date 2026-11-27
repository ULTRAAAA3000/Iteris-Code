import type { RefSection } from "./types.ts";

const raw = String.raw;

export const rust: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`fn main() {
    println!("Привіт, світе!");
}`, note: "Виконання починається з функції `main`. `println!` це макрос (його видно за знаком `!`), який друкує рядок і переходить на новий." },
    { t: "Cargo: збірка й запуск", code: raw`cargo new hello          # створити проєкт
cd hello
cargo run                # зібрати й запустити
cargo build --release    # оптимізована збірка
rustc main.rs            # компіляція одного файлу`, note: "`cargo` керує проєктом, залежностями й збіркою. Команди виконуються в терміналі, код лежить у `src/main.rs`." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "let, mut і const", code: raw`let age = 16;
let mut score = 0;
score += 10;
let age = age + 1;
const MAX: u32 = 100;
println!("{age} {score} {MAX}");`, note: "Змінні за замовчуванням незмінні, `mut` дозволяє змінювати. Повторний `let` створює нову змінну (затінення), а `const` потребує типу." },
    { t: "Базові типи", code: raw`let i: i32 = -42;
let n: u64 = 7;
let f: f64 = 3.14;
let b: bool = true;
let c: char = 'я';
let t: (i32, &str) = (1, "один");
println!("{} {}", t.0, t.1);`, note: "Цілі `i8`...`i128` зі знаком, `u8`...`u128` без знака, `f32` і `f64` дробові. `char` це символ Unicode. Тип зазвичай виводиться сам." },
    { t: "Перетворення типів", code: raw`let x: i32 = 7;
let y = x as f64 / 2.0;
let n: i32 = "12".parse().unwrap();
let s = n.to_string();
let big = i64::from(x);
println!("{y} {n} {s} {big}");`, note: "Неявних перетворень немає: `as` для чисел, `parse` для рядка в число, `From` та `into` для безпечних перетворень." },
  ] },
  { t: "Рядки", items: [
    { t: "String і &str", code: raw`let s: &str = "привіт";
let mut owned = String::from("Привіт");
owned.push_str(", світе");
owned.push('!');
println!("{owned} {} {}", owned.len(), owned.chars().count());`, note: "`&str` це посилання на текст, `String` володіє даними й може рости. `len` рахує байти, а `chars().count()` символи." },
    { t: "Форматування", code: raw`let name = "Олена";
let age = 16;
println!("{name} має {age} років");
println!("{:.2} {:>5} {:?}", 3.14159, 42, "текст");
let line = format!("{}-{}", name, age);`, note: "`println!` і `format!` підставляють значення в `{}`. `{:.2}` задає знаки після коми, `{:?}` виводить значення для налагодження." },
    { t: "Методи рядків", code: raw`let s = "  Hello, Rust  ";
let t = s.trim();
println!("{}", t.to_uppercase());
println!("{}", t.replace("Rust", "світ"));
println!("{:?}", t.split(", ").collect::<Vec<_>>());
println!("{}", t.contains("Rust"));`, note: "Методи `trim`, `replace`, `split`, `contains` не змінюють оригінал, а повертають новий рядок чи ітератор." },
  ] },
  { t: "Умови", items: [
    { t: "if як вираз", code: raw`let n = 7;
if n % 2 == 0 {
    println!("парне");
} else if n > 5 {
    println!("непарне й більше 5");
} else {
    println!("непарне");
}
let kind = if n < 0 { "мінус" } else { "плюс" };`, note: "Дужки навколо умови не потрібні, але сама умова має бути типу `bool`. `if` це вираз, тому повертає значення." },
    { t: "match", code: raw`let day = 6;
match day {
    1..=5 => println!("будній"),
    6 | 7 => println!("вихідний"),
    _ => println!("такого дня немає"),
}`, note: "`match` має покрити всі варіанти, інакше компілятор видасть помилку. `_` ловить решту, `..=` це діапазон включно, `|` означає «або»." },
    { t: "if let і let else", code: raw`let maybe: Option<i32> = Some(3);
if let Some(x) = maybe {
    println!("є {x}");
}
let Some(y) = maybe else { return };
println!("{y}");`, note: "`if let` розбирає один шаблон без повного `match`. `let ... else` виходить із функції, якщо шаблон не підійшов." },
  ] },
  { t: "Цикли", items: [
    { t: "loop, while, for", code: raw`let mut n = 0;
loop {
    n += 1;
    if n == 3 { break; }
}
while n > 0 { n -= 1; }
for i in 0..3 {
    println!("{i}");
}`, note: "`loop` крутиться вічно, поки не буде `break`. `0..3` це діапазон без кінця (0, 1, 2), а `0..=3` включає 3." },
    { t: "Ітерування й continue", code: raw`for i in 1..=5 {
    if i % 2 == 0 { continue; }
    println!("{i}");
}
for (i, ch) in "Rust".chars().enumerate() {
    println!("{i} {ch}");
}
let v = loop { break 42; };`, note: "`enumerate` додає номер елемента. `loop` теж вираз: значення після `break` стає результатом циклу." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення", code: raw`fn add(a: i32, b: i32) -> i32 {
    a + b
}
fn greet(name: &str) {
    println!("Привіт, {name}!");
}
println!("{}", add(2, 3));
greet("Олена");`, note: "Типи параметрів і результату обов'язкові. Останній вираз без `;` стає значенням функції, `return` потрібен для раннього виходу." },
    { t: "Замикання", code: raw`let factor = 3;
let triple = |x: i32| x * factor;
println!("{}", triple(5));
let mut count = 0;
let mut inc = || count += 1;
inc();
inc();
println!("{count}");`, note: "Замикання `|x| ...` захоплюють змінні з оточення. Щоб передати власність у замикання, перед ним пишуть `move`." },
    { t: "Кілька значень", code: raw`fn min_max(v: &[i32]) -> (i32, i32) {
    (*v.iter().min().unwrap(), *v.iter().max().unwrap())
}
let (lo, hi) = min_max(&[3, 1, 4]);
println!("{lo} {hi}");`, note: "Щоб повернути кілька значень, використовують кортеж `(A, B)`, а далі розпаковують його через `let (a, b) = ...`." },
  ] },
  { t: "Власність і позики", items: [
    { t: "Власність і переміщення", code: raw`let a = String::from("текст");
let b = a;
let c = b.clone();
println!("{b} {c}");
let n = 5;
let m = n;
println!("{n} {m}");`, note: "У значення один власник. Присвоєння `String` переміщує його (`a` стає недоступною), `clone` робить копію, прості типи копіюються самі." },
    { t: "Посилання й позичання", code: raw`fn len(s: &String) -> usize { s.len() }
fn shout(s: &mut String) { s.push('!'); }
let mut text = String::from("Привіт");
println!("{}", len(&text));
shout(&mut text);
println!("{text}");`, note: "`&` позичає значення лише для читання, `&mut` для зміни. Одночасно діє або багато `&`, або одне `&mut`." },
    { t: "Часи життя", code: raw`fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}
println!("{}", longest("ab", "abc"));`, note: "Анотація `'a` каже компілятору, що результат живе не довше за обидва аргументи. Здебільшого час життя виводиться автоматично." },
  ] },
  { t: "Колекції", items: [
    { t: "Vec", code: raw`let mut v = vec![1, 2, 3];
v.push(4);
v[0] = 10;
println!("{:?} {}", v, v.len());
println!("{:?}", v.get(9));
println!("{:?}", v.pop());`, note: "`Vec<T>` це динамічний масив. `v[i]` панікує поза межами, а `get` повертає `Option`." },
    { t: "Масив, зріз і кортеж", code: raw`let arr = [1, 2, 3];
let zeros = [0; 5];
let slice = &arr[1..];
let (x, y) = (1, 2.5);
println!("{} {:?} {:?} {x} {y}", arr.len(), zeros, slice);`, note: "Масив `[T; N]` має фіксовану довжину, зріз `&[T]` це вікно на його частину. Кортеж об'єднує значення різних типів." },
    { t: "HashMap", code: raw`use std::collections::HashMap;
let mut ages = HashMap::new();
ages.insert("Оля", 16);
ages.insert("Іван", 17);
*ages.entry("Оля").or_insert(0) += 1;
println!("{:?}", ages.get("Оля"));
println!("{}", ages.contains_key("Петро"));`, note: "`HashMap` зберігає пари ключ-значення. `entry().or_insert()` додає значення, якщо ключа ще немає. Порядок обходу не гарантований." },
  ] },
  { t: "Структури й перелічення", items: [
    { t: "struct і impl", code: raw`struct Point { x: i32, y: i32 }
impl Point {
    fn new(x: i32, y: i32) -> Self { Point { x, y } }
    fn dist2(&self) -> i32 { self.x * self.x + self.y * self.y }
}
let p = Point::new(3, 4);
println!("{}", p.dist2());`, note: "Методи пишуть у блоці `impl`. Перший параметр `&self` це позика екземпляра, `Self` позначає сам тип." },
    { t: "derive", code: raw`#[derive(Debug, Clone, PartialEq)]
struct User { name: String, age: u8 }
let u = User { name: "Олена".to_string(), age: 16 };
let u2 = User { age: 17, ..u.clone() };
println!("{:?} {}", u2, u == u2);`, note: "`derive` автоматично додає реалізацію трейтів: `Debug` для виводу `{:?}`, `Clone` для копій, `PartialEq` для `==`." },
    { t: "enum з даними", code: raw`enum Shape { Circle(f64), Rect { w: f64, h: f64 } }
fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => 3.14 * r * r,
        Shape::Rect { w, h } => w * h,
    }
}
println!("{}", area(&Shape::Rect { w: 2.0, h: 3.0 }));`, note: "Варіанти `enum` можуть нести дані різної форми. `match` дістає їх і змушує обробити кожен варіант." },
  ] },
  { t: "Трейти", items: [
    { t: "trait і impl", code: raw`trait Speak {
    fn name(&self) -> String;
    fn hello(&self) -> String { format!("Я {}", self.name()) }
}
struct Dog;
impl Speak for Dog {
    fn name(&self) -> String { "пес".to_string() }
}
println!("{}", Dog.hello());`, note: "Трейт описує набір методів, подібно до інтерфейсу. Метод може мати реалізацію за замовчуванням, її тип може перевизначити." },
    { t: "Узагальнення й обмеження", code: raw`fn largest<T: PartialOrd + Copy>(v: &[T]) -> T {
    let mut m = v[0];
    for &x in v { if x > m { m = x; } }
    m
}
fn show(x: impl std::fmt::Display) { println!("{x}"); }
println!("{}", largest(&[3, 9, 2]));
show(3.5);`, note: "`T: PartialOrd + Copy` обмежує узагальнений тип трейтами. Запис `impl Trait` у параметрі це коротка форма такого обмеження." },
    { t: "dyn Trait", code: raw`use std::fmt::Display;
let items: Vec<Box<dyn Display>> = vec![Box::new(1), Box::new("два"), Box::new(3.5)];
for it in &items {
    println!("{it}");
}`, note: "`Box<dyn Trait>` зберігає значення різних типів за спільним трейтом, а конкретний метод обирається під час виконання." },
  ] },
  { t: "Ітератори", items: [
    { t: "map, filter, collect", code: raw`let v = vec![1, 2, 3, 4, 5, 6];
let sq: Vec<i32> = v.iter()
    .filter(|&&x| x % 2 == 0)
    .map(|x| x * x)
    .collect();
println!("{:?}", sq);`, note: "Адаптери `filter` і `map` ліниві: працюють лише тоді, коли результат збирає `collect` чи інший споживач." },
    { t: "sum, max, fold", code: raw`let v = [3, 8, 1];
let total: i32 = v.iter().sum();
let max = v.iter().max();
let all_pos = v.iter().all(|&x| x > 0);
let first_big = v.iter().find(|&&x| x > 5);
let prod = v.iter().fold(1, |acc, x| acc * x);
println!("{total} {max:?} {all_pos} {first_big:?} {prod}");`, note: "Споживачі `sum`, `max`, `all`, `find`, `fold` перебирають елементи й повертають один результат." },
    { t: "zip, enumerate, rev", code: raw`let names = ["Оля", "Іван"];
let ages = [16, 17];
for (n, a) in names.iter().zip(ages.iter()) {
    println!("{n}: {a}");
}
for (i, x) in names.iter().enumerate().rev() {
    println!("{i} {x}");
}`, note: "`zip` поєднує дві послідовності в пари, `enumerate` додає індекс, `rev` обертає порядок." },
  ] },
  { t: "Обробка помилок", items: [
    { t: "Option", code: raw`fn find(v: &[i32], x: i32) -> Option<usize> {
    v.iter().position(|&a| a == x)
}
match find(&[5, 6, 7], 6) {
    Some(i) => println!("індекс {i}"),
    None => println!("немає"),
}
println!("{}", find(&[1], 9).unwrap_or(0));`, note: "`Option<T>` це `Some(значення)` або `None`. Так у Rust виражають відсутність значення замість `null`." },
    { t: "Result і ?", code: raw`use std::num::ParseIntError;
fn double(s: &str) -> Result<i32, ParseIntError> {
    let n: i32 = s.trim().parse()?;
    Ok(n * 2)
}
println!("{:?}", double("21"));
match double("abc") {
    Ok(v) => println!("{v}"),
    Err(e) => println!("помилка: {e}"),
}`, note: "`Result<T, E>` це `Ok` або `Err`. Оператор `?` повертає помилку з функції одразу, а при успіху дістає значення." },
    { t: "Методи Option і Result", code: raw`let x: Option<i32> = Some(4);
println!("{:?}", x.map(|n| n * 2));
println!("{}", x.unwrap_or(0));
let r: Result<i32, String> = "7".parse::<i32>().map_err(|e| e.to_string());
println!("{:?} {}", r, r.is_ok());
let n: i32 = "5".parse().expect("не число");`, note: "`unwrap_or` дає запасне значення, `map_err` змінює тип помилки. `unwrap` та `expect` панікують, тому їх лишають для прикладів і тестів." },
    { t: "main із Result", code: raw`use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let n: i32 = "42".parse()?;
    println!("{n}");
    Ok(())
}`, note: "`main` може повертати `Result`. Тоді `?` працює й у ній, а `Box<dyn Error>` приймає помилку будь-якого типу." },
  ] },
  { t: "Модулі й крейти", items: [
    { t: "mod і pub", code: raw`mod geometry {
    pub fn area(w: f64, h: f64) -> f64 { w * h }
    pub mod shapes {
        pub struct Square(pub f64);
    }
    fn hidden() {}
}
use geometry::shapes::Square;
println!("{} {}", geometry::area(2.0, 3.0), Square(2.0).0);`, note: "Усе в модулі за замовчуванням приватне, `pub` робить елемент публічним. `use` скорочує шлях до нього." },
    { t: "Модулі у файлах", code: raw`// src/main.rs
mod utils;
use utils::helper;

// src/utils.rs
pub fn helper() {}`, note: "Запис `mod utils;` підключає модуль із файлу `utils.rs` або `utils/mod.rs` поруч." },
    { t: "Залежності в Cargo.toml", code: raw`[dependencies]
serde = "1"
rand = "0.8"

# або командою:
# cargo add rand`, note: "Зовнішні бібліотеки (крейти) вказують у `Cargo.toml`, `cargo` сам завантажить їх із crates.io при збірці." },
  ] },
];
