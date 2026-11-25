/* Курс PHP: глави й уроки в порядку проходження. adv: true — урок лише для просунутого рівня, без нього базовий рівень лишається цілісним
   (базовий урок спирається тільки на раніші базові). keep — id завдання зі старої версії курсу (9 завдань), яке переходить до цього уроку.
   noTask: true — урок без завдання (у пісочниці немає бази даних; правило D13 шаблону).
   Версія мови: PHP 8.x. Запускані приклади тримаємо в межах 8.1 (match, enum, readonly, fibers, first-class callable); можливості 8.4
   (хуки властивостей, асиметрична видимість) показуємо лише блоками «// фрагмент:». Шаблон курсу: Documentation/course-template.md, лист PHP.
   Слот 07 «Паралелізм» у PHP: генератори, ітератори, Fibers (потоків у звичайному PHP немає). */
const ch = (id, name, lessons) => ({ id, name, lessons });
const L = (t, adv = false, keep, extra) => ({ t, adv, ...(keep ? { keep } : {}), ...(extra ?? {}) });

const CHAPTERS = [
  ch("01", "Початок", [
    L("Перша програма: <?php і echo", false, "php-hello-calc"),
    L("Теги PHP, коментарі й крапка з комою"),
    L("Запуск у терміналі: php, php -l і повідомлення про помилки"),
    L("Середовище: версія PHP, php.ini і Composer"),
  ]),
  ch("02", "Основи мови", [
    L("Змінні й типи: int, float, string, bool", false, "php-order-total"),
    L("Числа: цілі, float і точність"),
    L("Рядки: лапки, інтерполяція й heredoc"),
    L("Константи: const, define і магічні константи"),
    L("Перетворення типів і declare(strict_types=1)"),
    L("null, isset, empty і оператор ??"),
    L("Вивід і форматування: printf, sprintf і number_format"),
    L("Умови: if, elseif і match"),
    L("Цикли: for, while і foreach", false, "php-grade-loop"),
    L("Функції: параметри, значення за замовчуванням і return"),
    L("Іменовані аргументи, змінна кількість аргументів і spread"),
    L("Область видимості: global, static і use у замиканнях"),
    L("Стрілкові функції й першокласні callable", true),
    L("Рекурсія й глибина викликів", true),
  ]),
  ch("03", "Колекції", [
    L("Індексні масиви"),
    L("Асоціативні масиви", false, "php-arrays-products"),
    L("Багатовимірні масиви"),
    L("foreach, list і деструктуризація"),
    L("Функції масивів: count, in_array, array_keys і array_search"),
    L("array_map, array_filter і array_reduce"),
    L("Сортування: sort, usort і оператор космічного корабля"),
    L("Злиття й зрізи: array_merge, spread, array_slice і array_splice"),
    L("Практика: частотний словник"),
    L("array_column, array_combine, array_unique й array_chunk", true),
    L("Копіювання масивів і посилання &", true),
    L("Сортування за кількома ключами й array_multisort", true),
  ]),
  ch("04", "Типи користувача", [
    L("Класи й об'єкти", false, "php-product-class"),
    L("Властивості, методи й конструктор із промоцією"),
    L("Видимість: public, protected і private"),
    L("Статичні члени й константи класу"),
    L("readonly і value-об'єкти"),
    L("enum: чисті й зі значеннями"),
    L("Успадкування, parent і final"),
    L("Копіювання об'єктів: clone та ідентичність", true),
    L("Пізнє статичне зв'язування: static проти self", true),
  ]),
  ch("05", "Абстракція", [
    L("Інтерфейси"),
    L("Абстрактні класи"),
    L("Трейти"),
    L("Поліморфізм і перевизначення методів"),
    L("Типи: union, nullable, mixed й iterable"),
    L("Магічні методи: __toString, __get і __call"),
    L("Stringable, Countable й ArrayAccess"),
    L("Closure: bind, use і callable"),
    L("Generics у докблоках: типізована колекція", true),
    L("Атрибути", true),
    L("Рефлексія", true),
    L("Intersection-типи, never і new в ініціалізаторах", true),
  ]),
  ch("06", "Помилки", [
    L("Попередження й сповіщення: error_reporting і set_error_handler"),
    L("Виключення: try, catch і throw"),
    L("Ієрархія: Throwable, Error й Exception"),
    L("finally й очищення ресурсів"),
    L("Власні виключення й ланцюжок previous"),
    L("TypeError, ValueError і валідація вхідних даних", true),
    L("assert і контракти: передумови та постумови", true),
  ]),
  ch("07", "Генератори, ітератори й Fibers", [
    L("Функціональний стиль: композиція й чисті функції"),
    L("Ітератори: інтерфейс Iterator і foreach"),
    L("Генератори: yield"),
    L("Ключі в генераторах і yield from"),
    L("Конвеєри на генераторах"),
    L("Нескінченні генератори й ліниві обчислення"),
    L("IteratorAggregate і SPL-ітератори"),
    L("Лінива колекція: map, filter і take"),
    L("Мемоїзація й відкладені обчислення"),
    L("DateTimeImmutable: дати й арифметика"),
    L("Практика: потоковий обробник рядків"),
    L("Двосторонні генератори: send і return", true),
    L("Fibers: основи", true),
    L("Fibers: планувальник завдань", true),
    L("Корутини на генераторах: кооперативна багатозадачність", true),
  ]),
  ch("08", "Стандартна бібліотека", [
    L("Рядкові функції: пошук, заміна й підрядки", false, "php-strings-slug"),
    L("UTF-8 і mb_*: довжина, регістр, підрядки"),
    L("JSON: json_encode і json_decode"),
    L("Регулярні вирази: preg_match"),
    L("preg_replace, preg_split і preg_replace_callback"),
    L("Дати: формат, зсув і різниця"),
    L("Числа й випадковість: round, intdiv, mt_srand і random_int"),
    L("SPL: SplStack, SplQueue й SplObjectStorage"),
    L("SplHeap, SplPriorityQueue і SplFixedArray", true),
    L("Часові пояси: DateTimeZone і DatePeriod", true),
    L("Потоки в пам'яті й CSV: php://memory і fgetcsv", true),
    L("Серіалізація: serialize, var_export і __serialize", true),
  ]),
  ch("09", "Тестування й якість", [
    L("assert і перші перевірки"),
    L("Мінітестовий стенд: test() і assertSame"),
    L("Тестування виключень"),
    L("Табличні тести: набори даних"),
    L("Стаби й моки вручну", true),
    L("TDD, PHPUnit і статичний аналіз", true),
  ]),
  ch("10", "Запити й сервіси", [
    L("Модель «запит-відповідь»: класи Request і Response"),
    L("Форми й суперглобали: імітація $_POST і filter_var", false, "php-form-validate"),
    L("Маршрутизація: таблиця маршрутів і параметри"),
    L("JSON-API нотаток у пам'яті"),
    L("Middleware як викликані об'єкти"),
    L("Паролі й сесії: password_hash та емуляція сесії", false, "php-password-auth"),
    L("PSR-7 і PSR-15: ідеї та інтерфейси", true),
    L("Кеш відповіді: ETag і умовні запити", true),
  ]),
  ch("11", "Архітектура", [
    L("Шари: контролер, сервіс і репозиторій"),
    L("Репозиторій у пам'яті й інтерфейси"),
    L("Composer і автозавантаження PSR-4", false, "php-psr4-path"),
    L("DI-контейнер своїми руками", true),
    L("Конфігурація масивами й логер у дусі PSR-3", true),
    L("База даних: PDO", true, undefined, { noTask: true }),
  ]),
  ch("12", "Проєкти", [
    L("Проєкт: аналіз тексту"),
    L("Проєкт: REST-API нотаток у пам'яті"),
    L("Проєкт: конвеєр обробки даних на генераторах"),
    L("Проєкт: кеш із TTL", true),
    L("Проєкт: rate limiter і підсумок курсу", true),
  ]),
];

let n = 0;
export const PHP_CHAPTERS = CHAPTERS.map((c) => {
  const from = n + 1;
  n += c.lessons.length;
  return { id: c.id, name: c.name, from, to: n, lessons: c.lessons.map((l, i) => ({ n: from + i, ...l })) };
});
export const PHP_OUTLINE = PHP_CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ ...l, ch: c.name })));
