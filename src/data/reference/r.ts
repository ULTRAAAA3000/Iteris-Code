import type { RefSection } from "./types.ts";

const raw = String.raw;

export const r: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`print("Привіт, світе!")
cat("Без переходу\n")
cat("a", "b", 42, "\n")
# коментар до кінця рядка
2 + 3`, note: "Окремої `main` не потрібно: скрипт виконується зверху вниз. `print` друкує значення з індексом `[1]`, `cat` виводить текст як є. У консолі вираз сам друкує результат." },
    { t: "Запуск", code: raw`Rscript hello.R

Rscript -e "print(2 + 3)"

R    # інтерактивна консоль`, note: "Скрипти з розширенням `.R` запускає `Rscript`. Прапор `-e` виконує один вираз, а команда `R` відкриває інтерактивну консоль, де зручно пробувати код." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Присвоєння", code: raw`x <- 10
y = 5
20 -> z
name <- "Olena"
x <- x + 1
print(c(x, y, z))
print(name)`, note: "Основний оператор присвоєння в R це `<-`, хоча `=` теж працює. Змінні створюються без оголошення типу, а імена чутливі до регістру." },
    { t: "Базові типи", code: raw`print(class(42L))
print(class(3.14))
print(class("text"))
print(class(TRUE))
print(class(NULL))
print(class(3 + 2i))
print(class(NA))`, note: "Основні типи: `integer` (з суфіксом `L`), `numeric`, `character`, `logical`, `complex`. `NULL` означає відсутність об'єкта, а `NA` позначає пропущене значення." },
    { t: "Перетворення типів", code: raw`print(as.numeric("12") + 1)
print(as.integer(3.9))
print(as.character(42))
print(as.logical("TRUE"))
print(is.numeric(5))
print(as.numeric("abc"))`, note: "Функції `as.numeric`, `as.integer`, `as.character` перетворюють тип. Невдале перетворення дає `NA` із попередженням, а `is.numeric` та подібні перевіряють тип." },
  ] },
  { t: "Рядки", items: [
    { t: "paste і paste0", code: raw`a <- "Hello"
b <- "World"
print(paste(a, b))
print(paste0(a, b, "!"))
print(paste("x", 1:3, sep = "-"))
print(paste(c("a", "b"), collapse = "+"))`, note: "`paste` склеює частини через пробіл, `paste0` без роздільника. Параметр `sep` задає роздільник, а `collapse` зливає вектор в один рядок." },
    { t: "Функції для рядків", code: raw`s <- "Hello, World"
print(nchar(s))
print(toupper(s))
print(substr(s, 1, 5))
print(sub("World", "R", s))
print(strsplit(s, ", ")[[1]])
print(grepl("World", s))
print(sprintf("%s: %d, %.2f", "x", 7L, 3.14159))`, note: "`nchar` рахує символи, `substr` вирізає частину з позиціями від `1`. `sub` і `gsub` замінюють за шаблоном, `grepl` перевіряє збіг, а `sprintf` форматує як у C." },
  ] },
  { t: "Умови", items: [
    { t: "if, else if, else", code: raw`n <- 15
if (n < 10) {
  print("мало")
} else if (n < 20) {
  print("середньо")
} else {
  print("багато")
}
print(n != 15 || n > 5)`, note: "Умова береться в круглі дужки, а `else` ставлять на одному рядку із закриттям `}`. Для одиночних логічних значень використовують `&&` та `||`, а для векторів `&` та `|`." },
    { t: "ifelse і switch", code: raw`x <- c(5, 12, 8, 20)
print(ifelse(x > 10, "big", "small"))
day <- "tue"
res <- switch(day,
  mon = "Monday",
  tue = "Tuesday",
  "other")
print(res)`, note: "`ifelse` застосовує умову до кожного елемента вектора. `switch` вибирає значення за іменем, а останній аргумент без імені править за варіант за замовчуванням." },
  ] },
  { t: "Цикли", items: [
    { t: "for", code: raw`for (i in 1:3) {
  print(i)
}
for (w in c("a", "b")) {
  cat(w, "")
}
cat("\n")
print(seq(10, 1, by = -4))
print(seq_len(3))`, note: "`for (x in вектор)` перебирає елементи, а `1:3` створює послідовність, яка включає обидві межі. `seq` задає крок, а `seq_len(n)` безпечна заміна `1:n` для порожніх випадків." },
    { t: "while, repeat, break", code: raw`n <- 0
while (n < 3) {
  n <- n + 1
}
print(n)
k <- 0
repeat {
  k <- k + 2
  if (k > 5) break
  if (k == 2) next
  print(k)
}`, note: "`while` перевіряє умову перед кроком, а `repeat` крутиться безкінечно, доки не зустріне `break`. Оператор `next` пропускає решту поточної ітерації." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення функції", code: raw`add <- function(a, b = 10) {
  a + b
}
print(add(2, 3))
print(add(2))
print(add(b = 1, a = 5))
sq <- function(x) return(x^2)
print(sq(4))`, note: "Функція це значення, яке зберігають у змінній. Результатом є останній обчислений вираз, `return` не обов'язковий. Аргументи можуть мати значення за замовчуванням та передаватися за іменем." },
    { t: "Змінна кількість аргументів", code: raw`total <- function(...) {
  args <- c(...)
  sum(args)
}
print(total(1, 2, 3, 4))
f <- function(...) length(list(...))
print(f("a", "b"))
print((function(x) x * 2)(21))`, note: "Три крапки `...` приймають довільну кількість аргументів, їх збирають через `c(...)` або `list(...)`. Анонімну функцію можна викликати одразу після оголошення." },
  ] },
  { t: "Вектори й списки", items: [
    { t: "Вектори", code: raw`v <- c(10, 20, 30, 40)
print(v[2])
print(v[-1])
print(v[v > 15])
print(length(v))
v <- c(v, 50)
names(v) <- c("a", "b", "c", "d", "e")
print(v["c"])`, note: "Вектор створює `c()`, елементи нумеруються з `1`. Від'ємний індекс виключає елемент, логічна маска `v[v > 15]` відбирає потрібні, а `names` дає елементам імена." },
    { t: "Списки", code: raw`p <- list(name = "Olena", age = 17, tags = c("a", "b"))
print(p$name)
print(p[["age"]])
p$city <- "Dnipro"
print(names(p))
print(length(p))
print(p$tags[2])`, note: "Список зберігає значення різних типів. Елемент беруть через `$` або `[[ ]]`, а одинарні `[ ]` повертають ще один список. Присвоєння `p$ключ` додає нове поле." },
    { t: "Матриці", code: raw`m <- matrix(1:6, nrow = 2)
print(m)
print(m[2, 3])
print(dim(m))
print(t(m))
print(m %*% t(m))`, note: "`matrix` заповнює таблицю по стовпцях. Елемент береться як `m[рядок, стовпець]`, `dim` дає розміри, `t` транспонує, а `%*%` виконує матричне множення." },
  ] },
  { t: "Векторизація й apply", items: [
    { t: "Векторні операції", code: raw`x <- c(1, 2, 3, 4)
print(x * 2)
print(x + c(10, 20, 30, 40))
print(sqrt(x))
print(sum(x))
print(cumsum(x))
print(rev(x))
print(x %% 2 == 0)`, note: "Арифметика в R працює над усім вектором одразу, цикл не потрібен. Короткий вектор повторюється, щоб збігтися за довжиною, а `sum`, `cumsum`, `rev` теж приймають вектор." },
    { t: "sapply і lapply", code: raw`x <- 1:4
print(sapply(x, function(v) v^2))
print(lapply(1:2, function(v) v * 10))
print(sapply(c("a", "bb", "ccc"), nchar))
print(vapply(x, function(v) v + 0.5, numeric(1)))
print(Map(function(a, b) a + b, 1:2, 3:4))`, note: "`lapply` повертає список, `sapply` спрощує результат до вектора, а `vapply` ще й перевіряє тип результату. `Map` застосовує функцію до кількох векторів паралельно." },
    { t: "apply для матриць", code: raw`m <- matrix(1:6, nrow = 2)
print(apply(m, 1, sum))
print(apply(m, 2, max))
print(rowSums(m))
print(colMeans(m))`, note: "`apply(m, 1, f)` застосовує функцію до кожного рядка, а `apply(m, 2, f)` до кожного стовпця. Для сум і середніх є швидші `rowSums`, `colMeans` та подібні." },
  ] },
  { t: "Таблиці даних", items: [
    { t: "data.frame", code: raw`df <- data.frame(
  name = c("Ann", "Bob", "Eva"),
  age = c(21, 35, 28),
  ok = c(TRUE, FALSE, TRUE)
)
print(df)
print(nrow(df))
print(df$age)
str(df)`, note: "`data.frame` це таблиця, де кожен стовпець є вектором свого типу. `nrow` та `ncol` дають розміри, `$` бере стовпець, а `str` показує структуру." },
    { t: "Вибірка й фільтрація", code: raw`df <- data.frame(name = c("Ann", "Bob", "Eva"), age = c(21, 35, 28))
print(df[2, ])
print(df[df$age > 25, ])
print(df[, "name"])
df$senior <- df$age > 30
print(df[order(df$age, decreasing = TRUE), ])`, note: "У `df[рядки, стовпці]` порожня частина означає все. Рядки відбирають умовою, новий стовпець додають присвоєнням, а `order` повертає індекси для сортування." },
    { t: "aggregate і merge", code: raw`df <- data.frame(g = c("a", "b", "a", "b"), v = c(1, 2, 3, 4))
print(aggregate(v ~ g, data = df, FUN = sum))
print(tapply(df$v, df$g, mean))
info <- data.frame(g = c("a", "b"), label = c("first", "second"))
print(merge(df, info, by = "g"))`, note: "`aggregate` та `tapply` рахують підсумки за групами. `merge` об'єднує дві таблиці за спільним стовпцем, подібно до `JOIN` у SQL." },
  ] },
  { t: "Фактори", items: [
    { t: "factor і levels", code: raw`sizes <- factor(c("M", "S", "L", "M", "S", "M"))
print(sizes)
print(levels(sizes))
print(table(sizes))
print(nlevels(sizes))
print(as.integer(sizes))`, note: "Фактор зберігає категорії як цілі коди з набором рівнів `levels`. `table` рахує, скільки разів зустрівся кожен рівень, а `as.integer` показує внутрішні коди." },
    { t: "Упорядкований фактор і cut", code: raw`lv <- factor(c("low", "high", "mid", "low"),
  levels = c("low", "mid", "high"), ordered = TRUE)
print(lv)
print(lv[1] < lv[2])
ages <- c(5, 17, 30, 65)
print(cut(ages, breaks = c(0, 18, 60, Inf)))`, note: "Параметр `levels` задає порядок рівнів, а `ordered = TRUE` дозволяє їх порівнювати. Функція `cut` розбиває числа на інтервали й повертає фактор." },
  ] },
  { t: "Статистика", items: [
    { t: "mean, median, sd", code: raw`x <- c(2, 4, 4, 4, 5, 5, 7, 9)
print(mean(x))
print(median(x))
print(sd(x))
print(var(x))
print(range(x))
print(max(x) - min(x))`, note: "`mean` це середнє, `median` медіана, `sd` стандартне відхилення, а `var` дисперсія вибірки. `range` повертає мінімум і максимум одним вектором." },
    { t: "summary і квантилі", code: raw`x <- c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
print(summary(x))
print(quantile(x, c(0.25, 0.75)))
y <- c(2, 4, 6, 8, 10, 12, 14, 16, 18, 21)
print(cor(x, y))
print(round(cor(x, y), 3))`, note: "`summary` показує мінімум, квартилі, середнє й максимум. `quantile` повертає потрібні відсотки, `cor` рахує кореляцію двох векторів, а `round` округлює результат." },
    { t: "Пропущені значення", code: raw`x <- c(4, NA, 6, 10)
print(mean(x))
print(mean(x, na.rm = TRUE))
print(is.na(x))
print(sum(is.na(x)))
print(x[!is.na(x)])`, note: "`NA` заражає обчислення: `mean` повертає `NA`. Параметр `na.rm = TRUE` ігнорує пропуски, а `is.na` показує, де вони. Використовуйте `!is.na` для фільтрації." },
  ] },
  { t: "Графіки", items: [
    { t: "plot і lines", code: raw`x <- 1:10
y <- x^2
plot(x, y, type = "b", main = "Squares",
     xlab = "x", ylab = "y", col = "blue")
lines(x, x * 5, col = "red")
abline(h = 50, lty = 2)
legend("topleft", legend = c("x^2", "5x"),
       col = c("blue", "red"), lty = 1)`, note: "`plot` будує базовий графік, `type = \"b\"` малює точки з лініями. Наступні виклики `lines`, `abline` і `legend` дорисовують елементи поверх поточного графіка." },
    { t: "hist, barplot, boxplot", code: raw`x <- c(2, 3, 3, 4, 4, 4, 5, 5, 6, 9)
hist(x, breaks = 5, col = "gray", main = "Histogram")
barplot(table(c("a", "b", "a", "c", "a")))
boxplot(x, horizontal = TRUE)`, note: "`hist` будує гістограму розподілу, `barplot` стовпчикову діаграму за підрахунками з `table`, а `boxplot` показує медіану, квартилі й викиди." },
    { t: "Збереження графіка", code: raw`png("chart.png", width = 600, height = 400)
plot(1:5, c(2, 4, 3, 5, 1), type = "l")
dev.off()

par(mfrow = c(1, 2))
hist(c(1, 2, 2, 3))
boxplot(c(1, 2, 2, 3))`, note: "Функція `png` відкриває файл для малювання, а `dev.off()` закриває його й зберігає. `par(mfrow = c(1, 2))` ділить вікно на два графіки поруч." },
  ] },
  { t: "Пакети й дані", items: [
    { t: "library і install.packages", code: raw`install.packages("jsonlite")
library(jsonlite)
print(requireNamespace("stats", quietly = TRUE))
print(toJSON(list(a = 1, b = "x"), auto_unbox = TRUE))
stats::sd(c(1, 2, 3))`, note: "`install.packages` встановлює пакет один раз, а `library` підключає його в кожному сеансі. Запис `пакет::функція` викликає функцію без підключення всього пакета." },
    { t: "Читання й запис CSV", code: raw`df <- data.frame(a = 1:3, b = c("x", "y", "z"))
write.csv(df, "data.csv", row.names = FALSE)
back <- read.csv("data.csv")
print(head(back, 2))
print(summary(back$a))
print(file.exists("data.csv"))`, note: "`write.csv` зберігає таблицю у файл, а `read.csv` читає її назад. `head` показує перші рядки. Параметр `row.names = FALSE` не дописує номери рядків." },
  ] },
];
