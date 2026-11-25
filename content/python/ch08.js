export const LESSONS_08 = [
  {
    t: "Рядки: join, split і методи обробки тексту",
    ch: "Стандартна бібліотека",
    easy: "Рядкові методи — це набір кухонних інструментів: ніж для нарізання, ситечко для відсіювання, миска для змішування. Знаючи, який інструмент для чого, ви перетворюєте сирий текст на потрібну форму за кілька рядків.",
    p: [
      "Ми вже знаємо базові рядкові методи, а тепер розглянемо ті, що найчастіше потрібні для обробки тексту. Головна ідея: рядки незмінні, тому кожен метод повертає новий рядок, а результат треба зберегти. Найпотужніші з них працюють у парі: <code>split</code> розбиває текст на частини, а <code>join</code> склеює їх назад. Між цими двома операціями зазвичай і відбувається вся обробка: очищення, фільтрація, перетворення.",
      "Метод <code>split(sep, maxsplit)</code> розбиває рядок за роздільником, а необов'язковий <code>maxsplit</code> обмежує кількість розрізів: <code>\"a=b=c\".split(\"=\", 1)</code> дає <code>['a', 'b=c']</code>. Для розбиття з кінця є <code>rsplit</code>. Метод <code>partition(sep)</code> завжди повертає трійку «до, роздільник, після», що зручно для розбору пар виду <code>ключ=значення</code>. Для тексту з кількох рядків є <code>splitlines()</code>, який коректно розуміє різні символи переносу.",
      "Прибирати зайве допомагають <code>strip</code>, <code>lstrip</code> і <code>rstrip</code>: без аргументів вони прибирають пробільні символи, а з аргументом — будь-які символи з наданого набору: <code>\"[[x]]\".strip(\"[]\")</code> дає <code>x</code>. Не плутайте це з видаленням префікса: <code>removeprefix</code> і <code>removesuffix</code> (з Python 3.9) прибирають точний префікс чи суфікс, а не набір символів. Різницю легко побачити на прикладі <code>\"abcab\".strip(\"ab\")</code>.",
      "Масове перетворення символів виконує <code>translate</code> із таблицею, створеною <code>str.maketrans</code>. Наприклад, <code>text.translate(str.maketrans(\"\", \"\", \".,!?\"))</code> видаляє всі розділові знаки за один прохід, а <code>str.maketrans(\"абв\", \"abv\")</code> замінює літери. Це швидше й чистіше за ланцюжок <code>replace</code>. Для нечутливого до регістру порівняння є <code>casefold</code>: сильніша версія <code>lower</code>, що правильно обробляє, зокрема, німецьке «ß».",
      "Для вирівнювання є <code>ljust</code>, <code>rjust</code> і <code>center</code> (з символом-заповнювачем), а для чисел — <code>zfill</code>: <code>\"7\".zfill(3)</code> дає <code>007</code>. Перевірки <code>isalpha</code>, <code>isdigit</code>, <code>isalnum</code>, <code>isspace</code>, <code>isupper</code> відповідають на питання про склад рядка, а <code>startswith</code> і <code>endswith</code> приймають навіть кортеж варіантів: <code>name.endswith((\".jpg\", \".png\"))</code>. Метод <code>count</code> рахує входження підрядка, а <code>find</code> повертає його позицію або -1.",
      "Продуктивність має значення. Склеювання рядка в циклі через <code>+=</code> створює кожного разу новий рядок і для великих обсягів повільне; правильний шлях — зібрати частини у список і викликати <code>\"\".join(parts)</code> один раз. Метод <code>join</code> вимагає, щоб усі елементи були рядками: <code>\", \".join([1, 2])</code> завершиться <code>TypeError</code>, тож числа спершу перетворюють: <code>\", \".join(str(n) for n in nums)</code>.",
      "Нарешті, звертайте увагу на кодування. Рядок <code>str</code> зберігає символи Unicode, а <code>bytes</code> — байти. Перетворення між ними — <code>text.encode(\"utf-8\")</code> і <code>data.decode(\"utf-8\")</code>. Для кирилиці в UTF-8 кожна літера займає два байти, тому <code>len(\"привіт\")</code> дорівнює 6, а <code>len(\"привіт\".encode())</code> — 12. Завжди явно вказуйте кодування при роботі з файлами й мережею, щоб не залежати від налаштувань системи.",
    ],
    code: [
      String.raw`line = "  host = example.com = main  "
print(line.split("="))
print(line.split("=", 1))
key, sep, value = "port=8080".partition("=")
print(key, sep, value)
print("a b\nc d\n".splitlines())
`,
      String.raw`print("[[x]]".strip("[]"))
print("abcab".strip("ab"), "abcab".removeprefix("ab"), "abcab".removesuffix("ab"))
print("photo.jpg".endswith((".jpg", ".png")), "7".zfill(3), "ab".center(6, "*"))
print("banana".count("an"), "banana".find("na"), "banana".find("x"))
`,
      String.raw`text = "Привіт, світе! Як справи?"
table = str.maketrans("", "", ".,!?")
print(text.translate(table))
print("абв".translate(str.maketrans("абв", "abv")))
print("Straße".casefold() == "STRASSE".casefold())
`,
      String.raw`words = ["рядок", "складається", "з", "слів"]
print(" ".join(words))
print(", ".join(str(n) for n in [1, 2, 3]))
print(len("привіт"), len("привіт".encode("utf-8")))
print("привіт".encode("utf-8").decode("utf-8"))
`,
      String.raw`# аварія: join працює лише з рядками
numbers = [1, 2, 3]
print(", ".join(str(n) for n in numbers))
print(", ".join(numbers))
`,
    ],
    note: "Збирайте частини в список і склеюйте через <code>join</code> один раз, а не додавайте рядки в циклі. <code>strip</code> прибирає набір символів, а <code>removeprefix</code> — точний префікс. Методи рядків повертають новий рядок.",
    work: "Обробка тексту — основа парсерів логів, чистки даних, генерації звітів і форматування повідомлень. Знання <code>split</code>, <code>partition</code>, <code>translate</code> і <code>join</code> дозволяє розв'язувати такі задачі без регулярних виразів і сторонніх бібліотек.",
    tasks: [
      "Приберіть із тексту розділові знаки через <code>translate</code>, приведіть його до малих літер і нормалізуйте пробіли, склеївши слова через <code>split</code> і <code>join</code>.",
      "Розберіть рядок виду <code>a=1; b=2</code> у словник за допомогою <code>split</code> і <code>partition</code>.",
    ],
  },
  {
    t: "io.StringIO і текстові потоки",
    ch: "Стандартна бібліотека",
    easy: "Файл — це довга стрічка тексту з курсором: ви читаєте з місця, де він стоїть, і пишете туди ж. Кожен об'єкт, що вміє так поводитися, називають файлоподібним, і StringIO — це такий файл у пам'яті.",
    p: [
      "Робота з файлами в Python будується на одному ідеалі: об'єкт із методами <code>read</code>, <code>write</code> і <code>close</code>, який не залежить від того, де саме лежать дані. Справжній файл відкривають <code>open(path, mode, encoding=...)</code>: режими <code>\"r\"</code> (читання), <code>\"w\"</code> (запис із очищенням), <code>\"a\"</code> (дописування), а додаткова літера <code>b</code> означає двійкові дані. Файл завжди відкривають через <code>with</code> й явно вказують <code>encoding=\"utf-8\"</code>.",
      "Інтерфейс однаковий для багатьох джерел. Клас <code>io.StringIO</code> створює «файл» у пам'яті для тексту, а <code>io.BytesIO</code> — для байтів. Вони підтримують ті самі методи, що й файли з диска, але не потребують диска. Це зручно для тестів, для побудови великих рядків і для місць, де файлової системи немає (як у нашому онлайн-середовищі). Функція, що приймає файлоподібний об'єкт, працюватиме і з реальним файлом, і з <code>StringIO</code>.",
      "Читання має кілька способів. <code>read()</code> повертає весь вміст, <code>read(n)</code> — наступні n символів, <code>readline()</code> — один рядок, <code>readlines()</code> — список усіх рядків. Найкращий спосіб для великих файлів — прямий цикл <code>for line in f:</code>: він читає по одному рядку й не завантажує файл у пам'ять. Рядки зберігають символ <code>\\n</code> наприкінці, тож зазвичай їх обрізають через <code>.rstrip(\"\\n\")</code> або <code>.strip()</code>.",
      "Запис виконують <code>write(text)</code> (повертає кількість записаних символів) і <code>writelines(list)</code> (не додає переноси сама). Символи переносу додаєте ви: <code>f.write(\"рядок\\n\")</code>. Альтернатива — функція <code>print(\"рядок\", file=f)</code>, яка додає перенос автоматично. Для запису в режимі <code>\"w\"</code> попередній вміст файла знищується, тому для додавання в кінець використовують режим <code>\"a\"</code>.",
      "Кожен файл має поточну позицію («курсор»). Після запису курсор стоїть у кінці, і якщо одразу викликати <code>read()</code>, ви отримаєте порожній рядок. Це найпоширеніша помилка зі <code>StringIO</code>: щоб прочитати щойно записане, потрібно повернути курсор на початок через <code>f.seek(0)</code>. Метод <code>tell()</code> показує поточну позицію, а <code>getvalue()</code> у <code>StringIO</code> повертає весь вміст незалежно від курсора.",
      "Вихід програми теж є файлоподібним об'єктом: <code>sys.stdout</code> — потік виводу, <code>sys.stderr</code> — потік помилок, <code>sys.stdin</code> — ввід. Тому функцію <code>print</code> можна спрямувати в будь-який файл через параметр <code>file</code>, а в тестах підміняти потік на <code>StringIO</code>, щоб перевірити, що програма надрукувала. Так само працюють форматувальники й бібліотеки журналювання, які пишуть у потік, а не прямо в консоль.",
      "Типові помилки: забути закрити файл (використовуйте <code>with</code>); не вказати кодування й отримати «кракозябри» на іншій системі; відкрити неіснуючий файл на читання (<code>FileNotFoundError</code>); спробувати записати текст у двійковий файл чи байти в текстовий (<code>TypeError</code>). А щодо шляхів і перевірок існування, їх зручно виконувати через <code>pathlib</code>, який розглянемо трохи далі.",
    ],
    code: [
      String.raw`import io

buf = io.StringIO()
buf.write("перший\n")
buf.write("другий\n")
print(repr(buf.read()))        # курсор у кінці: нічого не прочитано
buf.seek(0)
print(repr(buf.read()))
print(repr(buf.getvalue()))
`,
      String.raw`import io

f = io.StringIO("рядок 1\nрядок 2\nрядок 3\n")
print(f.readline().rstrip("\n"))
for line in f:
    print(line.strip())
f.seek(0)
print(f.readlines())
`,
      String.raw`import io

out = io.StringIO()
print("через print", file=out)
out.writelines(["a\n", "b\n"])
print(out.getvalue().splitlines())
print(out.tell())
`,
      String.raw`import io

data = io.BytesIO()
data.write("привіт".encode("utf-8"))
print(data.getvalue())
data.seek(0)
print(data.read().decode("utf-8"))
`,
      String.raw`# аварія: файлу не існує
with open("missing_file.txt", encoding="utf-8") as f:
    print(f.read())
`,
    ],
    note: "Після запису курсор стоїть у кінці, тому перед читанням викличте <code>seek(0)</code>. Файли відкривайте через <code>with</code> із явним <code>encoding=\"utf-8\"</code>, а великі файли читайте циклом по рядках.",
    work: "Файлоподібні об'єкти роблять код придатним для тестування: функція, що приймає потік, працює однаково з файлом, мережею й <code>StringIO</code>. Читання великих файлів по рядках дозволяє обробляти гігабайти даних із невеликою пам'яттю.",
    tasks: [
      "Запишіть три рядки у <code>StringIO</code>, поверніть курсор на початок і прочитайте їх списком без символів переносу.",
      "Спрямуйте вивід <code>print</code> у <code>StringIO</code> через параметр <code>file</code> і перевірте, що було надруковано.",
    ],
  },
  {
    t: "datetime: дати й інтервали",
    ch: "Стандартна бібліотека",
    easy: "Дати — це не рядки й не числа, а особливі об'єкти, які знають календар: скільки днів у місяці, який це день тижня й що буде через 100 днів. Їх можна віднімати, додавати й порівнювати.",
    p: [
      "Модуль <code>datetime</code> містить кілька основних класів. <code>date</code> зберігає рік, місяць і день: <code>date(2026, 11, 19)</code>. <code>time</code> — години, хвилини, секунди. <code>datetime</code> поєднує обидва: <code>datetime(2026, 11, 19, 14, 30)</code>. <code>timedelta</code> — тривалість (різниця між двома моментами). Від того, чи є вказівка часового поясу, залежить, чи об'єкт «наївний» (naive) чи «обізнаний» (aware), і це розрізнення вкрай важливе.",
      "Арифметика проста. Різниця двох дат — це <code>timedelta</code>: <code>(date(2026, 12, 25) - date(2026, 11, 19)).days</code> дає кількість днів. Додавання <code>timedelta(days=30)</code> до дати зсуває її. Можна порівнювати дати операторами <code>&lt;</code> і <code>==</code>. Конструктор <code>timedelta</code> приймає дні, секунди, хвилини, години й тижні, але не місяці й роки, бо їхня тривалість змінна: для таких обчислень використовують календарні функції чи сторонні бібліотеки.",
      "Перетворення між об'єктами й текстом виконують два методи. <code>strftime(формат)</code> перетворює дату на рядок: <code>d.strftime(\"%d.%m.%Y\")</code> дає <code>19.11.2026</code>. <code>datetime.strptime(текст, формат)</code> розбирає рядок у <code>datetime</code>. Найпоширеніші коди: <code>%Y</code> рік, <code>%m</code> місяць, <code>%d</code> день, <code>%H</code> години, <code>%M</code> хвилини, <code>%S</code> секунди, <code>%A</code> назва дня тижня. Для міжнародного формату ISO 8601 є простіші <code>isoformat()</code> і <code>fromisoformat()</code>.",
      "День тижня повертає <code>weekday()</code> (понеділок — 0, неділя — 6) і <code>isoweekday()</code> (понеділок — 1). Українські назви дня тижня краще брати зі свого списку, а не з <code>%A</code>, бо вивід залежить від локалі системи. Для перевірки високосного року є <code>calendar.isleap(year)</code>, а <code>calendar.monthrange(year, month)</code> повертає перший день тижня й кількість днів у місяці.",
      "Часові пояси — найтонша частина. Наївний <code>datetime</code> не знає, у якому поясі він, і два наївні значення з різних міст порівнювати некоректно. Обізнаний має <code>tzinfo</code>: <code>datetime(2026, 11, 19, 12, 0, tzinfo=timezone.utc)</code>. Правило: усередині програми й у базі зберігайте час у UTC, а у вказаний пояс (<code>zoneinfo.ZoneInfo(\"Europe/Kyiv\")</code>) перетворюйте лише для показу користувачу. Метод <code>astimezone(tz)</code> виконує перетворення.",
      "Порівнювати наївний і обізнаний час не можна: Python кине <code>TypeError: can't compare offset-naive and offset-aware datetimes</code>. Це свідомий захист від прихованих помилок. Поточний час дають <code>datetime.now()</code> (наївний) і <code>datetime.now(timezone.utc)</code> (обізнаний). Для вимірювання тривалості операції використовуйте не <code>datetime</code>, а монотонний годинник <code>time.perf_counter()</code>: системний час може стрибати.",
      "Практичні поради: у коді й тестах уникайте прямого виклику <code>now()</code>, а передавайте дату параметром, тоді поведінка детермінована й перевіряється; ніколи не розбирайте дати вручну зрізами рядків; зберігайте й передавайте дати у форматі ISO 8601; пам'ятайте про літній час, який робить деякі доби довшими чи коротшими. Для складних календарних завдань (повторювані події, місяці й роки) існують бібліотеки <code>dateutil</code> та <code>pendulum</code>.",
    ],
    code: [
      String.raw`from datetime import date, timedelta

start = date(2026, 11, 19)
end = date(2026, 12, 25)
print((end - start).days)
print(start + timedelta(days=30))
print(start < end, start == date(2026, 11, 19))
print(start.isoformat(), date.fromisoformat("2026-02-27") + timedelta(days=3))
`,
      String.raw`from datetime import datetime

d = datetime(2026, 11, 19, 14, 30)
print(d.strftime("%d.%m.%Y %H:%M"))
parsed = datetime.strptime("19.11.2026 08:05", "%d.%m.%Y %H:%M")
print(parsed, parsed.year, parsed.hour)
print(d - parsed)
`,
      String.raw`from datetime import date
import calendar

d = date(2026, 11, 21)
names = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"]
print(d.weekday(), names[d.weekday()])
print(calendar.isleap(2024), calendar.isleap(2026))
print(calendar.monthrange(2026, 2))
`,
      String.raw`from datetime import datetime, timezone, timedelta

utc = datetime(2026, 11, 19, 12, 0, tzinfo=timezone.utc)
kyiv = timezone(timedelta(hours=2))
print(utc)
print(utc.astimezone(kyiv))
print(utc == utc.astimezone(kyiv))
`,
      String.raw`# аварія: наївний і обізнаний час порівнювати не можна
from datetime import datetime, timezone

naive = datetime(2026, 11, 19, 12, 0)
aware = datetime(2026, 11, 19, 12, 0, tzinfo=timezone.utc)
print(naive.tzinfo, aware.tzinfo)
print(naive < aware)
`,
    ],
    note: "Різниця дат — це <code>timedelta</code>, а місяців і років у ній немає. Зберігайте час у UTC і передавайте дату параметром замість виклику <code>now()</code> усередині логіки, щоб код був детермінованим.",
    work: "Дати присутні в кожному бізнес-застосунку: терміни, замовлення, звіти за період, нагадування. Помилки з часовими поясами й літнім часом — класичне джерело багів, тому правило «усередині UTC, на межі пояс користувача» вважається обов'язковим.",
    tasks: [
      "Порахуйте, скільки днів лишилося між двома датами, і додайте до заданої дати кілька днів із переходом через кінець лютого.",
      "Визначте день тижня для заданої дати за власним списком українських назв і поясніть, чому не варто спиратися на <code>%A</code>.",
    ],
  },
  {
    t: "math, random із seed і statistics",
    ch: "Стандартна бібліотека",
    easy: "Модулі математики дають готові формули, <code>statistics</code> — типові підсумки даних, а <code>random</code> — випадковість. Але «випадковість» комп'ютера можна повторити, якщо зафіксувати початкове число, і це дуже корисно для тестів.",
    p: [
      "Модуль <code>math</code> містить математичні функції для дробових чисел: <code>sqrt</code>, <code>pow</code>, <code>log</code> (натуральний логарифм; другий аргумент — основа), <code>sin</code> і <code>cos</code>, <code>floor</code>, <code>ceil</code>, <code>hypot</code> (довжина гіпотенузи) і константи <code>pi</code> та <code>e</code>. Для цілих чисел корисні <code>gcd</code> (найбільший спільний дільник), <code>lcm</code>, <code>factorial</code>, <code>comb(n, k)</code> (кількість комбінацій) і <code>isqrt</code> (цілий корінь). Для порівняння дробових чисел служить <code>isclose</code>.",
      "Модуль <code>statistics</code> обчислює підсумки наборів даних. <code>mean</code> — середнє арифметичне, <code>median</code> — медіана (середнє значення в упорядкованому наборі), <code>mode</code> — найчастіше значення, <code>stdev</code> і <code>pstdev</code> — стандартне відхилення вибірки та генеральної сукупності, <code>variance</code>, <code>quantiles</code>. Для швидкого середнього дробових чисел є <code>fmean</code>. На порожніх даних вони викликають <code>StatisticsError</code>, тож порожній набір треба обробляти заздалегідь.",
      "Модуль <code>random</code> генерує псевдовипадкові числа: <code>random()</code> дає число від 0 до 1, <code>randint(a, b)</code> — ціле з обох включно, <code>uniform(a, b)</code> — дробове, <code>choice(seq)</code> — випадковий елемент, <code>sample(seq, k)</code> — k різних елементів, <code>shuffle(list)</code> — перемішує список на місці. Слово «псевдо» тут важливе: числа обчислює формула за внутрішнім станом, і вони лише <i>виглядають</i> випадковими.",
      "Із цього випливає потужна властивість: початковий стан можна зафіксувати. Виклик <code>random.seed(42)</code> задає «зерно» (seed), і послідовність, що буде згенерована далі, завжди однакова. Для тестів і повторюваних експериментів це корисно: результат відтворюється. Без явного <code>seed</code> Python бере випадкове зерно з системи. Для незалежних генераторів зручно створити власний об'єкт <code>random.Random(seed)</code>, який не заважає глобальному.",
      "Увага: точні значення, які видає генератор за конкретного зерна, гарантовано стабільні лише для базових функцій; алгоритми <code>choice</code>, <code>shuffle</code> і <code>sample</code> можуть змінюватися між версіями Python. Тому в тестах краще перевіряти властивості (кількість, діапазон, повторюваність двох запусків із тим самим зерном), а не зашивати конкретні числа. Властивості переживають оновлення мови, а конкретні числа — ні.",
      "Найважливіше застереження: <code>random</code> непридатний для безпеки. Його послідовність можна відновити за кількома значеннями. Паролі, токени, ключі й коди підтвердження генеруйте модулем <code>secrets</code> (<code>secrets.token_hex(16)</code>, <code>secrets.choice</code>), який бере випадковість від операційної системи. Використання <code>random</code> для токенів — відома вразливість, і її регулярно виявляють у реальних системах.",
      "Для великих числових обчислень стандартних модулів замало: бібліотеки NumPy й pandas виконують ті самі операції в десятки разів швидше й для масивів даних. Але для невеликих наборів і скриптів <code>math</code> і <code>statistics</code> цілком достатньо й не потребують установлення. Корисно також пам'ятати про модуль <code>decimal</code> для грошових розрахунків і <code>fractions</code> для точних дробів, які ми вже згадували.",
    ],
    code: [
      String.raw`import math

print(math.gcd(12, 18), math.lcm(4, 6), math.factorial(5), math.comb(5, 2))
print(math.isqrt(50), round(math.hypot(3, 4), 1), round(math.log(100, 10), 1))
print(math.floor(-2.5), math.ceil(-2.5), round(math.pi, 3))
`,
      String.raw`import statistics as st

data = [2, 4, 4, 4, 5, 5, 7, 9]
print(st.mean(data), st.median(data), st.mode(data))
print(st.pstdev(data), round(st.stdev(data), 3))
print(st.quantiles(data, n=4))
`,
      String.raw`import random

random.seed(42)
first = [random.randint(1, 100) for _ in range(3)]
random.seed(42)
second = [random.randint(1, 100) for _ in range(3)]
print(first == second)

rng = random.Random(7)
print(all(0 <= rng.random() < 1 for _ in range(10)))
`,
      String.raw`import random

random.seed(1)
items = [1, 2, 3, 4, 5]
sample = random.sample(items, 3)
shuffled = items[:]
random.shuffle(shuffled)
print(len(sample), len(set(sample)), sorted(shuffled) == items)
print(random.choice("abc") in "abc")
`,
      String.raw`# аварія: середнє порожнього набору
import statistics

print(statistics.mean([1, 2, 3]))
print(statistics.mean([]))
`,
    ],
    note: "Для відтворюваності фіксуйте <code>random.seed(...)</code> і перевіряйте у тестах властивості, а не конкретні числа. Для паролів і токенів використовуйте модуль <code>secrets</code>, а не <code>random</code>.",
    work: "Статистичні підсумки, вибірки для тестування, перемішування наборів і симуляції — типове застосування цих модулів. Помилка використання <code>random</code> для токенів безпеки трапляється в реальних системах, тому її перевіряють на код-рев'ю.",
    tasks: [
      "Порахуйте середнє, медіану, моду й відхилення для набору чисел і зберіть їх у словник із заокругленими значеннями.",
      "Перевірте, що два запуски генератора з однаковим <code>seed</code> дають однакові послідовності, а з різним зерном зазвичай різні.",
    ],
  },
  {
    t: "json",
    ch: "Стандартна бібліотека",
    easy: "JSON — це спільна мова обміну даними: майже кожен сервіс і програма розуміє її. Python вміє перетворювати свої словники й списки на JSON-текст і назад, ніби перекладач між двома мовами з дуже схожою граматикою.",
    p: [
      "JSON (JavaScript Object Notation) — текстовий формат для обміну даними. Його використовують API, файли налаштувань, бази даних, повідомлення між сервісами. Він простий: об'єкти у фігурних дужках з ключами-рядками, масиви у квадратних, рядки в подвійних лапках, числа, <code>true</code>, <code>false</code> і <code>null</code>. Саме тому він так схожий на словники й списки Python, що перетворення між ними майже прозоре.",
      "Модуль <code>json</code> має чотири основні функції. <code>json.dumps(obj)</code> перетворює об'єкт Python на рядок JSON, а <code>json.loads(text)</code> розбирає рядок у об'єкти Python. Функції <code>json.dump(obj, file)</code> і <code>json.load(file)</code> роблять те саме, але працюють із файлами (літера <code>s</code> означає <i>string</i>). Запам'ятайте: <code>s</code> — рядки, без <code>s</code> — файли.",
      "Відповідність типів така: <code>dict</code> ↔ об'єкт, <code>list</code> і <code>tuple</code> → масив, <code>str</code> ↔ рядок, <code>int</code> і <code>float</code> ↔ число, <code>True</code>/<code>False</code> ↔ <code>true</code>/<code>false</code>, <code>None</code> ↔ <code>null</code>. Зверніть увагу на втрати: кортеж після кругового проходу стає списком, а ключі словника завжди перетворюються на рядки, тож <code>{1: \"a\"}</code> повернеться як <code>{\"1\": \"a\"}</code>. Це властивості формату, а не помилки.",
      "Параметри <code>dumps</code> керують виглядом. <code>indent=2</code> робить багаторядковий відступами текст, зручний для людини. <code>sort_keys=True</code> впорядковує ключі, що корисно для порівняння й тестів. <code>ensure_ascii=False</code> лишає кирилицю читабельною: без нього <code>\"Оля\"</code> стане <code>\"\\u041e\\u043b\\u044f\"</code>. <code>separators=(\",\", \":\")</code> прибирає пробіли для компактного запису. Для виводу українською завжди додавайте <code>ensure_ascii=False</code>.",
      "Не всі об'єкти Python серіалізуються. Спроба перетворити множину, дату чи власний клас закінчується <code>TypeError: Object of type ... is not JSON serializable</code>. Найпростіший обхід — параметр <code>default=str</code>, який перетворює невідомі об'єкти на рядки, або власна функція <code>default</code>, що описує перетворення. Більш системні рішення розглянемо в наступному уроці про власні кодувальники.",
      "Розбір некоректного JSON викликає <code>json.JSONDecodeError</code> (нащадок <code>ValueError</code>) із вказівкою рядка й позиції помилки. Типові причини: одинарні лапки замість подвійних, кома після останнього елемента, коментарі (JSON їх не підтримує), <code>None</code> замість <code>null</code>. Дані ззовні розбирайте в <code>try/except</code> і перевіряйте їхню структуру: наявність потрібних ключів і типів значень, бо правильний JSON не гарантує правильного вмісту.",
      "Типовий шаблон роботи: прочитати JSON із зовнішнього джерела, перевірити структуру, перетворити на внутрішні об'єкти, обробити й за потреби записати назад. Для великих даних існує формат JSON Lines (по одному об'єкту на рядок), що дозволяє читати файл потоково. А для строгої перевірки схеми використовують бібліотеки на кшталт <code>pydantic</code> або <code>jsonschema</code>, які виходять за межі стандартної бібліотеки, але ґрунтуються на тих самих перетвореннях.",
    ],
    code: [
      String.raw`import json

data = {"name": "Оля", "age": 16, "langs": ["uk", "en"], "active": True, "score": None}
text = json.dumps(data)
print(text)
back = json.loads(text)
print(back == data, type(back).__name__)
`,
      String.raw`import json

data = {"b": 2, "a": {"x": "Київ"}}
print(json.dumps(data, ensure_ascii=False))
print(json.dumps(data, ensure_ascii=False, sort_keys=True, indent=2))
print(json.dumps(data, separators=(",", ":"), sort_keys=True))
`,
      String.raw`import json

original = {"point": (1, 2), 1: "one"}
restored = json.loads(json.dumps(original))
print(restored)
print(restored == original)
`,
      String.raw`import json
from datetime import date

print(json.dumps({"day": date(2026, 11, 19)}, default=str))
print(json.dumps({"tags": {1, 2}}, default=sorted))
`,
      String.raw`# аварія: некоректний JSON (одинарні лапки)
import json

print(json.loads('{"a": 1}'))
print(json.loads("{'a': 1}"))
`,
    ],
    note: "<code>dumps</code> і <code>loads</code> працюють із рядками, <code>dump</code> і <code>load</code> — з файлами. Для української додавайте <code>ensure_ascii=False</code>, пам'ятайте про втрату типів (кортеж стає списком, ключі — рядками) і перевіряйте структуру отриманих даних.",
    work: "JSON — це відповіді API, файли налаштувань, повідомлення в чергах і зберігання документів. Уміння безпечно розібрати, перевірити й перетворити JSON — одна з найчастіших задач бекенд-розробника, а помилки в ній лежать у основі багатьох інцидентів.",
    tasks: [
      "Розберіть JSON-рядок зі списком замовлень і порахуйте їхню сумарну вартість як суму <code>price * qty</code>.",
      "Перетворіть словник з українськими значеннями на JSON-рядок без екранування кирилиці й виведіть, як змінився кортеж після кругового проходу.",
    ],
  },
  {
    t: "JSON: власні кодувальники і dataclass",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Стандартний JSON знає лише прості типи. Власний кодувальник — це словник перекладача: ви пояснюєте, як записати дату чи об'єкт у вигляді тексту й як відновити їх, прочитавши цей запис назад.",
    p: [
      "Реальні програми оперують не лише словниками й числами, а й датами, десятковими числами, множинами, перерахуваннями та власними класами. Стандартний <code>json</code> не знає, як їх записати, і кидає <code>TypeError</code>. Є два основні способи навчити його: передати функцію <code>default</code> у <code>dumps</code> або створити підклас <code>json.JSONEncoder</code> із перевизначеним методом <code>default</code>. Результат однаковий, різниця у способі організації коду.",
      "Функція <code>default(obj)</code> викликається лише для об'єктів, які <code>json</code> не вміє серіалізувати. Вона повинна повернути щось, що серіалізується: рядок, число, список чи словник. Для дати це <code>obj.isoformat()</code>, для множини — <code>sorted(obj)</code>, для <code>Decimal</code> — рядок, для <code>Enum</code> — його значення. Для невідомих типів функція має кинути <code>TypeError</code>, щоб не маскувати проблему мовчазною підміною.",
      "Датакласи перетворюють через <code>dataclasses.asdict(obj)</code>, який рекурсивно перетворює об'єкт на словник, а в <code>default</code> достатньо додати гілку: якщо <code>dataclasses.is_dataclass(obj)</code>, повернути <code>asdict(obj)</code>. Для власних класів без датакласів зручний метод <code>to_dict()</code>, який описує, які поля потрапляють у JSON. Явний метод кращий за автоматичне вивантаження всіх атрибутів: ви контролюєте, що виходить назовні.",
      "Зворотний шлях складніший, бо JSON не зберігає типів: дата повертається рядком <code>\"2026-11-19\"</code>, а не <code>date</code>. Щоб відновити об'єкти, використовують параметр <code>object_hook</code> у <code>loads</code>: функція викликається для кожного розібраного словника й може перетворити його на потрібний об'єкт. Але без додаткової інформації про тип вона мусить вгадувати за формою словника. Надійніше явна функція <code>from_dict</code>, яка знає схему.",
      "Частий підхід — додавати в JSON службове поле типу (<code>\"__type__\": \"date\"</code>), за яким <code>object_hook</code> дізнається, у що перетворювати. Такий формат самоописовий, але ускладнює дані й прив'язує їх до вашого коду. Для обміну між різними системами краще залишати прості типи (рядки в ISO-форматі) і явно перетворювати їх на межі, ніж вигадувати власний протокол.",
      "Для потокових даних існує формат JSON Lines (NDJSON): по одному JSON-об'єкту на кожен рядок файла. Його зручно дописувати, читати рядок за рядком і обробляти великі обсяги без завантаження всього файла. Запис — <code>json.dumps(obj)</code> плюс <code>\"\\n\"</code>, читання — цикл по рядках з <code>json.loads(line)</code>. Такий формат поширений у логах, експортах і конвеєрах даних.",
      "Не забувайте про безпеку й сумісність. Не використовуйте <code>pickle</code> для обміну між системами чи даних від недовірених джерел: він може виконувати довільний код під час розпакування, тоді як JSON безпечний. Не покладайтеся на кругове перетворення без перевірки: тестуйте, що <code>decode(encode(x)) == x</code> для ваших типів. А для великих проєктів із жорсткою схемою бібліотеки валідації (pydantic, marshmallow) зроблять цей шар надійнішим.",
    ],
    code: [
      String.raw`import json
from datetime import date

def default(obj):
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"Тип {type(obj).__name__} не підтримується")

data = {"day": date(2026, 11, 19), "tags": {"b", "a"}}
print(json.dumps(data, default=default))
`,
      String.raw`import json
from dataclasses import dataclass, asdict, is_dataclass

@dataclass
class User:
    name: str
    age: int

class Encoder(json.JSONEncoder):
    def default(self, obj):
        if is_dataclass(obj):
            return asdict(obj)
        return super().default(obj)

print(json.dumps([User("Оля", 16), User("Іван", 17)], cls=Encoder, ensure_ascii=False))
`,
      String.raw`import json
from datetime import date

def hook(d):
    if "when" in d:
        d["when"] = date.fromisoformat(d["when"])
    return d

event = json.loads('{"name": "Конференція", "when": "2026-11-19"}', object_hook=hook)
print(event)
print(type(event["when"]).__name__)
`,
      String.raw`import json

records = [{"id": 1, "ok": True}, {"id": 2, "ok": False}]
lines = "\n".join(json.dumps(r) for r in records)
print(lines)
back = [json.loads(line) for line in lines.splitlines()]
print(back == records)
`,
      String.raw`# аварія: множину не можна записати в JSON без default
import json

print(json.dumps({"a": [1, 2]}))
print(json.dumps({"tags": {1, 2}}))
`,
    ],
    note: "<code>default</code> описує, як записати незвичні типи, а <code>object_hook</code> — як їх відновити. Для невідомого типу кидайте <code>TypeError</code>, а для обміну між системами залишайте прості типи в ISO-форматі й перетворюйте їх на межі.",
    work: "Серіалізація власних типів потрібна в API, кешах, чергах повідомлень і журналах подій. Формат JSON Lines — стандарт для логів та експортів, а валідаційні бібліотеки роблять цей шар надійним у великих проєктах.",
    tasks: [
      "Напишіть функцію <code>default</code> для <code>json.dumps</code>, що перетворює дату на рядок ISO, а множину на відсортований список.",
      "Опишіть dataclass і перетворіть його на JSON через <code>asdict</code>, а потім відновіть об'єкт функцією <code>from_dict</code>.",
    ],
  },
  {
    t: "re: регулярні вирази",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Регулярний вираз — це шаблон-трафарет для тексту: ви описуєте «чотири цифри, дефіс, дві цифри», а Python знаходить усі місця, що пасують під цей трафарет, і вирізає їх.",
    p: [
      "Регулярні вирази (regex) — це мова опису шаблонів для пошуку й заміни в тексті. Вони розв'язують задачі, з якими методи рядків не справляються: знайти всі дати чи адреси електронної пошти, перевірити формат номера, замінити схожі за формою фрагменти. У Python їх підтримує модуль <code>re</code>. Шаблон завжди пишуть у «сирому» рядку <code>r\"...\"</code>, щоб зворотні риски не плутались з escape-послідовностями рядка.",
      "Базові елементи шаблону: звичайні символи збігаються самі з собою; <code>.</code> — будь-який символ; <code>\\d</code> — цифра, <code>\\w</code> — літера, цифра чи підкреслення, <code>\\s</code> — пробільний символ (великі <code>\\D</code>, <code>\\W</code>, <code>\\S</code> означають протилежне); <code>[abc]</code> — один із перелічених; <code>[a-z]</code> — діапазон; <code>^</code> і <code>$</code> — початок і кінець рядка. Кількість повторів: <code>*</code> (нуль і більше), <code>+</code> (один і більше), <code>?</code> (нуль або один), <code>{3}</code> і <code>{2,4}</code> (задана кількість).",
      "Основні функції модуля. <code>re.search(p, text)</code> шукає перший збіг будь-де в рядку, <code>re.match</code> — лише на початку, <code>re.fullmatch</code> — збіг із усім рядком (його використовують для валідації). <code>re.findall</code> повертає список усіх збігів, <code>re.finditer</code> — ітератор об'єктів збігу, <code>re.sub(p, repl, text)</code> замінює збіги, а <code>re.split</code> розбиває рядок за шаблоном. Якщо збігу немає, <code>search</code> повертає <code>None</code>, тож його результат слід перевіряти.",
      "Дужки створюють групи, які виокремлюють частини збігу: у <code>(\\d{4})-(\\d{2})</code> перша група — рік, друга — місяць, і доступні вони через <code>m.group(1)</code> або <code>m.groups()</code>. Групам можна давати імена: <code>(?P&lt;year&gt;\\d{4})</code> і потім <code>m[\"year\"]</code> чи <code>m.groupdict()</code>. Якщо група потрібна лише для об'єднання, а не для захоплення, пишуть <code>(?:...)</code>. У <code>re.sub</code> групи можна підставляти через <code>\\1</code> або <code>\\g&lt;name&gt;</code>.",
      "Квантифікатори за замовчуванням «жадібні»: <code>.*</code> захоплює якомога більше. Щоб зробити їх «ледачими», додайте знак питання: <code>.*?</code> зупиняється на першій можливості. Це важливо для задач на кшталт «знайти текст між тегами». Прапорці змінюють поведінку: <code>re.IGNORECASE</code> ігнорує регістр, <code>re.MULTILINE</code> робить <code>^</code> і <code>$</code> чутливими до меж рядків, <code>re.VERBOSE</code> дозволяє розбивати шаблон на частини з коментарями для читабельності.",
      "Складні шаблони компілюють один раз: <code>pattern = re.compile(r\"...\")</code>, а потім викликають <code>pattern.search(text)</code>. Це швидше при повторах і дозволяє дати шаблону ім'я. Часті помилки: некоректний шаблон (<code>re.compile(\"(\")</code> дає <code>re.error</code>), забути сирий рядок, зловживати жадібністю, а також «катастрофічний бектрекінг» — шаблони на кшталт <code>(a+)+b</code>, які на деяких вхідних даних працюють експоненційно довго й можуть підвісити програму.",
      "Регулярні вирази потужні, але не всемогутні. Не розбирайте ними HTML чи JSON: для цього є спеціальні парсери. Не пишіть надто складних шаблонів: якщо шаблон займає екран і ніхто не може його прочитати, розбийте задачу на кілька простіших кроків або на кілька виразів. Для найпростіших перевірок (починається з, містить підрядок) методи рядків зрозуміліші. А шаблон для пошуку пошти чи URL краще брати з перевірених бібліотек, ніж вигадувати власний.",
    ],
    code: [
      String.raw`import re

text = "Зустріч 2026-11-19, дедлайн 2026-12-01."
print(re.search(r"\d{4}-\d{2}-\d{2}", text).group())
print(re.findall(r"\d{4}-\d{2}-\d{2}", text))
print(re.fullmatch(r"\d+", "12345") is not None, re.fullmatch(r"\d+", "12a45"))
`,
      String.raw`import re

m = re.search(r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})", "Дата: 2026-11-19")
print(m.groups())
print(m["year"], m.groupdict())
print(m.start(), m.end())
`,
      String.raw`import re

print(re.sub(r"\d", "*", "Тел: 050-123-45-67"))
print(re.sub(r"(\w+)@(\w+)", r"\2 at \1", "ann@example"))
print(re.sub(r"\s+", " ", "багато   зайвих \n пробілів"))
print(re.split(r"[,;]\s*", "a, b;c,d"))
`,
      String.raw`import re

html = "<b>один</b> і <b>два</b>"
print(re.findall(r"<b>(.*)</b>", html))
print(re.findall(r"<b>(.*?)</b>", html))
print(re.findall(r"^\w+", "рядок один\nрядок два", re.MULTILINE))
print(bool(re.search(r"python", "I love PYTHON", re.IGNORECASE)))
`,
      String.raw`# аварія: некоректний шаблон
import re

print(re.compile(r"\d+").findall("a1b22"))
re.compile("(")
`,
    ],
    note: "Шаблони пишіть у сирих рядках <code>r\"...\"</code>, для валідації користуйтеся <code>fullmatch</code>, а результат <code>search</code> перевіряйте на <code>None</code>. Не розбирайте регулярками HTML і уникайте жадібних <code>.*</code> там, де потрібен мінімальний збіг.",
    work: "Регулярки витягують дані з логів, валідують формати, чистять тексти й виконують масові заміни. Це універсальний інструмент, який однаково працює у Python, редакторах, <code>grep</code> і бази даних, тож вміти їх читати корисно будь-якому розробнику.",
    tasks: [
      "Витягніть із тексту всі дати формату РРРР-ММ-ДД і всі адреси електронної пошти двома окремими шаблонами.",
      "Замініть усі цифри телефонного номера зірочками через <code>re.sub</code> і розбийте рядок за комою або крапкою з комою через <code>re.split</code>.",
    ],
  },
  {
    t: "csv і табличні дані",
    ch: "Стандартна бібліотека",
    easy: "CSV — це таблиця, записана звичайним текстом: кожен рядок — один запис, а значення розділені комами. Модуль <code>csv</code> розуміє її лапки й кому всередині значень, чого простий <code>split</code> не вміє.",
    p: [
      "CSV (comma-separated values) — найпростіший формат таблиць: перший рядок зазвичай містить назви стовпців, наступні — записи. Його створюють Excel, експорти баз даних і звіти. Здається, що розібрати його можна через <code>line.split(\",\")</code>, але це хибний шлях: значення можуть містити коми в лапках (<code>\"Київ, Україна\"</code>), переноси рядків і самі лапки. Модуль <code>csv</code> обробляє всі ці випадки правильно.",
      "Читання виконує <code>csv.reader(f)</code>: він видає кожен рядок як список рядків. Зручніший <code>csv.DictReader(f)</code>: перший рядок використовується як назви ключів, а кожен запис стає словником. Тоді замість <code>row[2]</code> пишуть <code>row[\"price\"]</code>, і код не залежить від порядку стовпців. Джерело може бути будь-яким файлоподібним об'єктом: відкритий файл (з параметром <code>newline=\"\"</code>) або <code>io.StringIO(text)</code>.",
      "Головна особливість: усі значення, прочитані з CSV, — це рядки. Число <code>25</code> прийде як <code>\"25\"</code>, і перед обчисленнями його треба перетворити через <code>int</code> чи <code>float</code>. Порожні клітинки приходять порожніми рядками, а не <code>None</code>, і <code>int(\"\")</code> закінчується <code>ValueError</code>. Тому типові скрипти мають шар перетворення типів і перевірки порожніх значень одразу після читання.",
      "Запис виконують <code>csv.writer(f)</code> із методами <code>writerow(список)</code> і <code>writerows</code>, а також <code>csv.DictWriter(f, fieldnames=[...])</code>, який приймає словники й вимагає викликати <code>writeheader()</code> для рядка заголовків. Модуль сам береться за лапки там, де потрібно. Параметр <code>delimiter=\";\"</code> змінює роздільник: у деяких регіонах Excel використовує крапку з комою, бо кома там означає десятковий роздільник.",
      "Кодування важливе: файли з Excel часто мають позначку порядку байтів, тож для них використовують <code>encoding=\"utf-8-sig\"</code>, інакше перша назва стовпця отримає невидимий префікс. Параметр <code>newline=\"\"</code> при відкритті файла обов'язковий і для читання, і для запису, щоб модуль сам керував переносами рядків. Без нього на Windows з'являються порожні рядки між записами.",
      "Типові операції з табличними даними: групування й підсумки (<code>defaultdict</code> чи <code>Counter</code>), фільтрація (генератор списку), сортування за ключем, об'єднання таблиць за ідентифікатором. Для невеликих файлів їх достатньо виконати вручну. Для великих таблиць, статистики й складних перетворень краще використовувати <code>pandas</code>, який робить те саме на порядки швидше й зручніше. Але розуміння, як виглядає CSV та які у нього пастки, потрібне завжди.",
      "Пам'ятайте про помилки: відсутній стовпець у DictReader дає <code>KeyError</code>, рядки з різною кількістю значень дають <code>None</code> замість значень або зайві ключі, дублікати назв стовпців затирають одне одного. Дані ззовні потребують валідації: перевірте наявність потрібних стовпців одразу після відкриття файла, а не вже під час обчислень. Так збій буде зрозумілим і швидким, а не прихованим усередині логіки.",
    ],
    code: [
      String.raw`import csv
import io

text = "name,city,age\nОля,\"Київ, Україна\",25\nІван,Львів,30\n"
rows = list(csv.DictReader(io.StringIO(text)))
print(rows[0])
print([r["name"] for r in rows], type(rows[0]["age"]).__name__)
print(list(csv.reader(io.StringIO(text)))[1])
`,
      String.raw`import csv
import io

buf = io.StringIO()
writer = csv.writer(buf)
writer.writerow(["name", "note"])
writer.writerow(["Оля", "Київ, Україна"])
print(buf.getvalue().splitlines())

out = io.StringIO()
dw = csv.DictWriter(out, fieldnames=["id", "title"])
dw.writeheader()
dw.writerow({"id": 1, "title": "Нотатка"})
print(out.getvalue().splitlines())
`,
      String.raw`import csv
import io
from collections import defaultdict

data = "item,category,price,qty\nХліб,їжа,25,2\nСир,їжа,180,1\nЗошит,канцелярія,40,3\n"
totals = defaultdict(int)
for row in csv.DictReader(io.StringIO(data)):
    totals[row["category"]] += int(row["price"]) * int(row["qty"])
print(dict(totals))
`,
      String.raw`import csv
import io

text = "a;b\n1;2\n3;4\n"
rows = list(csv.reader(io.StringIO(text), delimiter=";"))
print(rows)
print(sum(int(x) for row in rows[1:] for x in row))
`,
      String.raw`# аварія: у CSV немає такого стовпця
import csv
import io

reader = csv.DictReader(io.StringIO("name,age\nОля,25\n"))
for row in reader:
    print(row["name"])
    print(row["email"])
`,
    ],
    note: "Усе, що читає <code>csv</code>, — рядки: числа перетворюйте самі й обробляйте порожні клітинки. Не розбивайте CSV через <code>split</code>, файли відкривайте з <code>newline=\"\"</code> і явним кодуванням, а наявність потрібних стовпців перевіряйте одразу.",
    work: "CSV — універсальний формат обміну даними між людьми й системами: експорти з бухгалтерії, звіти аналітиків, завантаження в бази. Надійний шар читання з перетворенням типів і перевіркою структури — звична задача, а більші обсяги переносять у pandas.",
    tasks: [
      "Прочитайте CSV із продажами, згрупуйте їх за категорією й порахуйте суму <code>price * qty</code> для кожної.",
      "Запишіть результат підсумків у CSV через <code>DictWriter</code> із заголовком і виведіть його рядками.",
    ],
  },
  {
    t: "logging",
    ch: "Стандартна бібліотека",
    easy: "Журнал — це чорна скринька програми: вона записує, що відбувалось, коли й наскільки це було важливо. Коли щось ламається вночі, саме журнал розповідає, що пішло не так, а <code>print</code> цього не вміє.",
    p: [
      "Для перегляду стану програми початківці користуються <code>print</code>, але в реальних проєктах для цього є модуль <code>logging</code>. Його переваги: повідомлення мають рівень важливості, їх можна вмикати й вимикати без зміни коду, до кожного додається час, назва модуля й місце виклику, а вивід можна спрямувати в консоль, файл, мережу чи систему моніторингу. <code>print</code> цього не вміє: він лише друкує текст у консоль.",
      "Є п'ять стандартних рівнів за зростанням важливості: <code>DEBUG</code> (подробиці для налагодження), <code>INFO</code> (звичайні події), <code>WARNING</code> (щось підозріле, але програма працює), <code>ERROR</code> (операція не вдалась), <code>CRITICAL</code> (програма не може продовжувати). Логер має поріг: повідомлення нижчого рівня відкидаються. Так у розробці вмикають <code>DEBUG</code>, а в проді лише <code>INFO</code> чи <code>WARNING</code>, не змінюючи жодного рядка коду, що пише в журнал.",
      "Основні об'єкти: логер (<code>logging.getLogger(name)</code>) приймає повідомлення, обробник (handler) надсилає їх у потрібне місце (<code>StreamHandler</code> — у потік, <code>FileHandler</code> — у файл), форматувальник (formatter) визначає вигляд рядка. Формат складається з полів: <code>%(asctime)s</code> час, <code>%(levelname)s</code> рівень, <code>%(name)s</code> ім'я логера, <code>%(message)s</code> текст. Швидкий спосіб налаштувати корінь — <code>logging.basicConfig(level=..., format=...)</code>, який діє лише один раз.",
      "У кожному модулі прийнято створювати логер за ім'ям модуля: <code>logger = logging.getLogger(__name__)</code>. Імена утворюють ієрархію через крапку: <code>app.db</code> є нащадком <code>app</code>, і повідомлення «піднімаються» до батьківських обробників (властивість <code>propagate</code>). Так налаштування робиться в одному місці (у точці входу програми), а бібліотеки лише пишуть у свої логери, не втручаючись у налаштування.",
      "Повідомлення форматують із відкладеним підставленням: <code>logger.info(\"Користувач %s увійшов\", name)</code>, а не f-рядком. У першому випадку рядок складається лише якщо повідомлення справді буде виведене, тож вимкнені рівні нічого не коштують. Для помилок є <code>logger.exception(\"текст\")</code>: викликана всередині <code>except</code>, вона записує повідомлення рівня ERROR разом з повним traceback. Це найкращий спосіб зберегти причину збою.",
      "Для тестування й детермінованого виводу журнал можна спрямувати в <code>io.StringIO</code> через <code>StreamHandler(stream)</code>. Тоді перевіряється точний текст повідомлень без файлів. Також корисно вимкнути <code>propagate</code>, щоб повідомлення не дублювалося в кореневому обробнику. У великих програмах налаштування журналу описують словником через <code>logging.config.dictConfig</code>, а для файлів із автоматичним ротуванням є <code>RotatingFileHandler</code>.",
      "Кілька правил. Не логуйте паролі, токени й персональні дані. Не використовуйте <code>print</code> у бібліотечному коді. Давайте повідомленням контекст (ідентифікатори, значення), але не зловживайте: журнал на кожен крок швидко тоне в шумі. Обирайте рівень свідомо: помилка, яку програма обробила й пішла далі, — це WARNING, а не ERROR. Тоді графіки помилок у моніторингу відображають реальні проблеми, а не звичайну роботу.",
    ],
    code: [
      String.raw`import io
import logging

stream = io.StringIO()
logger = logging.getLogger("app")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(stream)
handler.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
logger.addHandler(handler)
logger.propagate = False

logger.debug("це відкинуто")
logger.info("старт")
logger.warning("диск майже повний")
logger.error("збій %d", 42)
print(stream.getvalue())
`,
      String.raw`import io
import logging

stream = io.StringIO()
handler = logging.StreamHandler(stream)
handler.setFormatter(logging.Formatter("%(name)s %(levelname)s %(message)s"))

parent = logging.getLogger("shop")
parent.setLevel(logging.INFO)
parent.addHandler(handler)
parent.propagate = False

child = logging.getLogger("shop.db")
child.info("з'єднання відкрито")
print(stream.getvalue().strip())
print(child.parent.name, child.getEffectiveLevel() == logging.INFO)
`,
      String.raw`import io
import logging

stream = io.StringIO()
log = logging.getLogger("errors")
log.addHandler(logging.StreamHandler(stream))
log.propagate = False

try:
    1 / 0
except ZeroDivisionError:
    log.exception("не вдалось поділити")

lines = stream.getvalue().splitlines()
print(lines[0])
print(lines[-1])
`,
      String.raw`import logging

print(logging.DEBUG, logging.INFO, logging.WARNING, logging.ERROR, logging.CRITICAL)
print(logging.getLevelName(30), logging.getLogger("a.b").parent.name)
print(logging.getLogger("x") is logging.getLogger("x"))
`,
      String.raw`# аварія: рівень має бути числом або назвою
import logging

logger = logging.getLogger("demo")
logger.setLevel(logging.INFO)
logger.setLevel("ДУЖЕ ВАЖЛИВО")
`,
    ],
    note: "Створюйте логер за <code>__name__</code>, налаштовуйте журнал лише в точці входу, підставляйте значення через <code>%s</code>, а не f-рядком, і записуйте помилки через <code>logger.exception</code>. Не логуйте секрети.",
    work: "У продакшені журнали — головне джерело правди про поведінку системи: за ними розслідують інциденти, будують метрики й налаштовують сповіщення. Структуровані логи з рівнями й контекстом передують будь-якому серйозному моніторингу.",
    tasks: [
      "Налаштуйте логер із форматом <code>%(levelname)s: %(message)s</code>, що пише у <code>StringIO</code>, і виведіть повідомлення рівнів INFO та вище.",
      "Запишіть виняток через <code>logger.exception</code> і виведіть перший та останній рядок отриманого журналу.",
    ],
  },
  {
    t: "pathlib, os і argparse",
    ch: "Стандартна бібліотека",
    easy: "Шлях до файла — це адреса: ви розкладаєте її на вулицю, будинок і квартиру, а не сприймаєте як суцільний рядок. А argparse — це швейцар на вході програми, який розбирає, з чим до вас прийшли.",
    p: [
      "Шляхи до файлів зберігають у рядках, але працювати з ними як із рядками незручно й небезпечно: різні системи мають різні роздільники (<code>/</code> проти <code>\\</code>), і ручна склейка <code>dir + \"/\" + name</code> швидко ламається. Модуль <code>pathlib</code> пропонує об'єкти шляхів. Оператор <code>/</code> з'єднує частини: <code>Path(\"data\") / \"report.csv\"</code>. Код стає коротшим, портативним і читабельним.",
      "Об'єкт шляху має корисні властивості: <code>name</code> — ім'я файла з розширенням, <code>stem</code> — без розширення, <code>suffix</code> — розширення (з крапкою), <code>parent</code> — батьківська папка, <code>parts</code> — кортеж компонентів. Методи <code>with_suffix(\".txt\")</code> і <code>with_name(...)</code> створюють нові шляхи. Для чисто обчислювальних операцій, що не торкаються диска, є <code>PurePath</code> (<code>PurePosixPath</code> і <code>PureWindowsPath</code>): вони не потребують існування файла й працюють однаково на будь-якій системі.",
      "Звичайний <code>Path</code> вміє й працювати з диском: <code>exists()</code>, <code>is_file()</code>, <code>is_dir()</code>, <code>read_text(encoding=\"utf-8\")</code>, <code>write_text(...)</code>, <code>mkdir(parents=True, exist_ok=True)</code>, <code>iterdir()</code>, <code>glob(\"*.csv\")</code> (пошук за шаблоном) і <code>rglob</code> (рекурсивно). Короткі операції читання й запису цілого файла через <code>read_text</code> та <code>write_text</code> зручні, а для великих файлів відкривайте їх через <code>open()</code> і читайте по рядках.",
      "Модуль <code>os</code> дає доступ до операційної системи: <code>os.getcwd()</code> — поточна папка, <code>os.listdir()</code>, <code>os.environ</code> — змінні середовища як словник (<code>os.environ.get(\"HOME\", \"default\")</code>), <code>os.path.join</code>, <code>os.remove</code>. Багато задач із <code>os.path</code> тепер простіше розв'язати через <code>pathlib</code>, але змінні середовища й системні виклики лишаються за <code>os</code>. Конфігурацію й секрети зазвичай передають саме через змінні середовища.",
      "Програми, що запускаються з командного рядка, отримують аргументи. Прості випадки читають <code>sys.argv</code> (список рядків, перший елемент — ім'я програми), але для нормальних інтерфейсів є <code>argparse</code>. Створіть <code>parser = argparse.ArgumentParser(description=...)</code>, додайте аргументи й викличте <code>parser.parse_args()</code>. Бібліотека сама розбере аргументи, перевірить типи, створить довідку <code>--help</code> і повідомлення про помилки.",
      "Аргументи бувають позиційні (<code>add_argument(\"input\")</code>) та іменовані (<code>--limit</code>). Параметри <code>type=int</code> перетворює значення, <code>default</code> задає значення за замовчуванням, <code>choices=[...]</code> обмежує допустимі, <code>help</code> описує, а <code>action=\"store_true\"</code> створює прапорець без значення (<code>--verbose</code>). Для тестів у <code>parse_args</code> можна передати свій список: <code>parser.parse_args([\"file.txt\", \"--limit\", \"5\"])</code>, і тоді командний рядок не потрібен.",
      "Некоректні аргументи не викликають звичайний виняток: <code>argparse</code> друкує повідомлення про використання в <code>stderr</code> і завершує програму з кодом 2 через <code>SystemExit</code>. Це очікувана поведінка для інструментів командного рядка. Для складніших програм існують підкоманди (<code>add_subparsers</code>), як у <code>git commit</code> чи <code>git push</code>, а для швидкого створення інтерфейсів — сторонні бібліотеки на кшталт <code>click</code> і <code>typer</code>.",
    ],
    code: [
      String.raw`from pathlib import PurePosixPath

p = PurePosixPath("/data/reports/2026/summary.final.csv")
print(p.name, p.stem, p.suffix)
print(p.parent, p.parts[-2:])
print(p.with_suffix(".txt"))
print(PurePosixPath("data") / "sub" / "file.txt")
`,
      String.raw`import os

print(os.environ.get("DEFINITELY_MISSING_VARIABLE", "значення за замовчуванням"))
print(os.path.join("data", "file.txt"))
print(os.path.splitext("archive.tar.gz"))
print(type(os.getcwd()).__name__)
`,
      String.raw`import argparse

parser = argparse.ArgumentParser(description="Обробка файла")
parser.add_argument("input")
parser.add_argument("--limit", type=int, default=10)
parser.add_argument("--verbose", action="store_true")

args = parser.parse_args(["data.txt", "--limit", "5", "--verbose"])
print(args.input, args.limit, args.verbose)
print(parser.parse_args(["x"]).limit)
`,
      String.raw`import argparse

parser = argparse.ArgumentParser()
parser.add_argument("mode", choices=["fast", "safe"])
parser.add_argument("--count", type=int, default=1)
args = parser.parse_args(["safe", "--count", "3"])
print(vars(args))
`,
      String.raw`# аварія: недопустиме значення аргументу завершує програму з кодом 2
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("mode", choices=["fast", "safe"])
print(parser.parse_args(["safe"]).mode)
parser.parse_args(["turbo"])
`,
    ],
    note: "Для шляхів використовуйте <code>pathlib</code> з оператором <code>/</code> замість склейки рядків, змінні середовища беріть через <code>os.environ.get</code>, а аргументи командного рядка розбирайте через <code>argparse</code>, передаючи у <code>parse_args</code> список для тестів.",
    work: "Скрипти, утиліти й сервіси постійно працюють зі шляхами, змінними середовища й аргументами. Портативні шляхи, зрозуміла довідка <code>--help</code> й передбачувані коди помилок відрізняють акуратний інструмент від скрипта, який ніхто не хоче запускати.",
    tasks: [
      "Розберіть шлях <code>/data/reports/summary.final.csv</code> на ім'я, ім'я без розширення, розширення й батьківську папку через <code>PurePosixPath</code>.",
      "Опишіть парсер із позиційним аргументом, числовим параметром зі значенням за замовчуванням і прапорцем та розберіть через нього заданий список аргументів.",
    ],
  },
  {
    t: "functools: partial, lru_cache, reduce",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Модуль <code>functools</code> — це набір майстерних прийомів для функцій: заготовка з частково заповненими аргументами, пам'ять про попередні результати, згортання списку в одне значення.",
    p: [
      "Модуль <code>functools</code> збирає інструменти для роботи з функціями як зі значеннями. Деякі з них ми вже зустрічали: <code>wraps</code> зберігає ім'я під час декорування, <code>cache</code> запам'ятовує результати. Тепер розглянемо їх докладніше разом із кількома новими: <code>partial</code>, <code>reduce</code>, <code>singledispatch</code>, <code>cached_property</code> і <code>total_ordering</code>. Вони не потрібні щодня, але в потрібну мить скорочують код і роблять його виразнішим.",
      "<code>partial(func, *args, **kwargs)</code> створює нову функцію з уже зафіксованою частиною аргументів. Наприклад, <code>from functools import partial; square = partial(pow, exp=2)</code> або <code>int_from_binary = partial(int, base=2)</code>. Це зручно для колбеків, яким потрібні лише частина параметрів, і для створення спеціалізованих версій загальних функцій. Результат — звичайний викликуваний об'єкт, який зберігає зафіксовані аргументи в атрибутах.",
      "<code>reduce(func, items, initial)</code> «згортає» послідовність в одне значення, послідовно застосовуючи функцію двох аргументів: <code>reduce(lambda a, b: a * b, [1, 2, 3, 4])</code> дає 24. Початкове значення необов'язкове, але для порожніх послідовностей воно потрібне: без нього <code>reduce</code> кине <code>TypeError</code>. Для найчастіших згорток (сума, максимум) є готові функції <code>sum</code>, <code>max</code>, <code>math.prod</code>, і вони читаються краще: <code>reduce</code> лишають для нетипових операцій.",
      "<code>lru_cache(maxsize=128)</code> запам'ятовує результати виклику за аргументами й повертає збережене значення замість повторного обчислення (LRU — «найдавніше використане видаляється першим»). <code>cache</code> — те саме без обмеження розміру. Метод <code>func.cache_info()</code> показує кількість влучань (hits) і промахів (misses), <code>cache_clear()</code> очищає пам'ять. Умови: функція має бути «чистою» (результат залежить лише від аргументів), а аргументи — хешованими. Передача списку викличе <code>TypeError: unhashable type</code>.",
      "У кешу є пастки. Якщо функція повертає змінюваний об'єкт, усі виклики отримують один і той самий екземпляр, і зміна в одному місці видна всюди. Кеш методів класу тримає посилання на <code>self</code> і може не дати збирачу сміття видалити об'єкти (витік пам'яті), для таких випадків є <code>cached_property</code>, що обчислює значення атрибута один раз для кожного екземпляра. А для даних, що змінюються, кеш може повертати застарілі відповіді, тож його треба вміти скидати.",
      "<code>singledispatch</code> робить функцію, що поводиться по-різному залежно від типу першого аргумента, без громіздких <code>isinstance</code>. Головну функцію позначають <code>@singledispatch</code>, а реалізації для типів додають через <code>@describe.register(int)</code> (тип береться з анотації або аргументу). Це чистіше, ніж ланцюжок <code>if isinstance</code>, і дозволяє розширювати поведінку для нових типів без зміни вихідної функції. Для методів класів є <code>singledispatchmethod</code>.",
      "<code>total_ordering</code> — декоратор класу: якщо ви описали <code>__eq__</code> і один із <code>__lt__</code>, <code>__le__</code>, <code>__gt__</code>, <code>__ge__</code>, він згенерує решту. А <code>cmp_to_key</code> перетворює стару функцію порівняння на ключ для <code>sorted</code>. Разом із модулем <code>operator</code> (<code>itemgetter</code>, <code>attrgetter</code>, <code>add</code>), який дає готові функції замість лямбд, <code>functools</code> утворює «функціональний» набір Python. Користуйтеся ним помірно: читабельний цикл часто кращий за хитромудру згортку.",
    ],
    code: [
      String.raw`from functools import partial, reduce
import operator

square = partial(pow, exp=2)
binary = partial(int, base=2)
print(square(7), binary("1011"))
print(reduce(operator.mul, [1, 2, 3, 4]), reduce(lambda a, b: a + b, [], 0))
`,
      String.raw`from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))
info = fib.cache_info()
print(info.hits, info.misses, info.currsize)
fib.cache_clear()
print(fib.cache_info().currsize)
`,
      String.raw`from functools import singledispatch

@singledispatch
def describe(x):
    return f"щось {x}"

@describe.register(int)
def _(x):
    return f"ціле {x}"

@describe.register(list)
def _(x):
    return f"список із {len(x)}"

print(describe(5), describe([1, 2]), describe("a"))
`,
      String.raw`from functools import cached_property, total_ordering

class Report:
    calls = 0

    @cached_property
    def data(self):
        Report.calls += 1
        return [1, 2, 3]

r = Report()
print(r.data, r.data, Report.calls)

@total_ordering
class Version:
    def __init__(self, n):
        self.n = n
    def __eq__(self, other):
        return self.n == other.n
    def __lt__(self, other):
        return self.n < other.n

print(Version(1) < Version(2), Version(3) >= Version(2))
`,
      String.raw`# аварія: lru_cache не приймає список як аргумент
from functools import lru_cache

@lru_cache
def total(items):
    return sum(items)

print(total((1, 2, 3)))
print(total([1, 2, 3]))
`,
    ],
    note: "<code>partial</code> фіксує аргументи, <code>reduce</code> згортає послідовність (з початковим значенням для порожніх), <code>lru_cache</code> вимагає чистої функції й хешованих аргументів. Для кешу методів обирайте <code>cached_property</code>.",
    work: "Кешування результатів, створення заготовок функцій, диспетчеризація за типом — прийоми, які регулярно з'являються в бібліотеках і прикладному коді. Вони економлять час обчислень і скорочують код, але вимагають розуміння пасток на кшталт застарілого кешу.",
    tasks: [
      "Обчисліть добуток чисел через <code>reduce</code> і створіть функцію піднесення до квадрата через <code>partial</code>.",
      "Закешуйте функцію Фібоначчі через <code>lru_cache</code> і виведіть кількість промахів кешу після обчислення тридцятого числа.",
    ],
  },
  {
    t: "textwrap і string.Template: звіти",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Для охайного звіту потрібні дві речі: шаблон із місцями для даних і вміння красиво переносити довгий текст. Перше робить <code>string.Template</code>, друге — <code>textwrap</code>.",
    p: [
      "Коли програма формує повідомлення, листи чи звіти, текст складається з постійної частини й підставлених даних. Для простих випадків вистачає f-рядків, але вони виконуються в місці створення й не підходять, коли шаблон зберігається окремо від коду (у файлі, базі, налаштуваннях) або його редагують користувачі. Для таких випадків є <code>string.Template</code>: шаблон із місцями на кшталт <code>$name</code> і <code>${name}</code>, які заповнюють значеннями пізніше.",
      "Користуватися ним просто: <code>t = Template(\"Привіт, $name!\")</code>, далі <code>t.substitute(name=\"Оля\")</code> або <code>t.substitute({\"name\": \"Оля\"})</code>. Якщо потрібного ключа немає, <code>substitute</code> кидає <code>KeyError</code>, а <code>safe_substitute</code> залишає місце без змін (<code>$name</code>). Знак долара екранується подвоєнням: <code>$$</code>. Шаблони безпечніші за f-рядки та <code>format</code> для даних від користувачів, бо не виконують виразів і не дозволяють звертатися до атрибутів об'єктів.",
      "Ще один спосіб — <code>str.format_map</code> і <code>str.format</code> із іменованими полями: <code>\"{name} має {n}\".format(name=...)</code>. Вони потужніші (формати чисел, вирівнювання), але й небезпечніші для ненадійних шаблонів: у них можна звернутися до атрибутів, наприклад <code>{obj.__class__}</code>. Правило: шаблони, які редагують користувачі, робіть через <code>Template</code> або спеціальні бібліотеки (Jinja2), а не через <code>format</code>.",
      "Модуль <code>textwrap</code> працює з довгим текстом. <code>textwrap.wrap(text, width)</code> повертає список рядків, кожен не довший за задану ширину, а <code>textwrap.fill</code> повертає їх одним рядком із переносами. Слова не розриваються (за винятком надто довгих). Корисно для виводу в консоль, листів і текстових звітів із фіксованою шириною. Параметри <code>initial_indent</code> і <code>subsequent_indent</code> додають відступи для маркованих списків.",
      "Інші функції <code>textwrap</code>: <code>shorten(text, width, placeholder=\"...\")</code> обрізає текст до ширини за межею слова й додає заповнювач, <code>dedent</code> прибирає спільний відступ у багаторядковому тексті (корисно для рядків у потрійних лапках усередині функцій), <code>indent</code> додає префікс до кожного рядка. Разом вони дозволяють підготувати охайний текст без ручного підрахунку символів і пробілів.",
      "Для виводу складних структур є <code>pprint</code>: <code>pprint.pformat(data, width=40)</code> повертає читабельний багаторядковий запис словників і списків, а <code>reprlib</code> скорочує надто довгі подання. Вирівнювані колонки звітів зручно робити через <code>str.ljust</code>, <code>rjust</code> та специфікації f-рядків (<code>{name:&lt;10}</code>), які ви вже знаєте. А для більш складних документів (HTML, листи з умовами та циклами) використовують повноцінні шаблонізатори на кшталт Jinja2.",
      "Кілька порад. Тримайте шаблони окремо від логіки: це дозволяє змінювати тексти без редагування коду. Завжди вирішуйте, що робити з відсутніми значеннями: помилка (<code>substitute</code>) чи залишити як є (<code>safe_substitute</code>). Для багатомовних програм використовуйте переклади (<code>gettext</code>), а не склеювання фраз із частин. І перевіряйте звіти на крайніх випадках: порожні дані, дуже довгі слова, символи Unicode, що займають більше однієї позиції.",
    ],
    code: [
      String.raw`from string import Template

t = Template("Привіт, $name! Ваш баланс: $balance грн. Знижка $$5.")
print(t.substitute(name="Оля", balance=120))
print(t.safe_substitute(name="Іван"))
print(Template("Ціна: $price грн").substitute(price=5))
`,
      String.raw`import textwrap

text = "Python — це мова програмування, яку люблять за простоту й читабельність."
print(textwrap.wrap(text, width=25))
print(textwrap.fill(text, width=30))
print(textwrap.shorten(text, width=30, placeholder="…"))
`,
      String.raw`import textwrap

block = """
    перший рядок
      другий рядок
    третій
"""
print(textwrap.dedent(block).strip())
print(textwrap.indent("a\nb", "> "))
print(textwrap.fill("один два три чотири", width=10, initial_indent="* ", subsequent_indent="  "))
`,
      String.raw`import pprint

data = {"user": {"name": "Оля", "roles": ["admin", "editor"]}, "active": True}
print(pprint.pformat(data, width=30))
print(f"{'Товар':<10}|{'Ціна':>6}")
print(f"{'Хліб':<10}|{25:>6.2f}")
`,
      String.raw`# аварія: substitute вимагає всіх значень
from string import Template

t = Template("Привіт, $name! Баланс: $balance")
print(t.safe_substitute(name="Оля"))
print(t.substitute(name="Оля"))
`,
    ],
    note: "Шаблони, які редагують користувачі, робіть через <code>string.Template</code> (<code>safe_substitute</code> лишає відсутні значення). Довгий текст переносіть через <code>textwrap.wrap</code> чи <code>fill</code>, а скорочуйте через <code>shorten</code>.",
    work: "Листи, звіти, повідомлення й консольні таблиці — щоденна робота будь-якого бекенда. Окремі шаблони полегшують редагування текстів і переклади, а <code>textwrap</code> дає охайний вивід без ручного підрахунку символів і пробілів у консолі чи листі.",
    tasks: [
      "Заповніть шаблон привітання через <code>Template</code> двома способами: з усіма значеннями та з <code>safe_substitute</code>, коли одного значення бракує.",
      "Розбийте довгий текст на рядки заданої ширини через <code>textwrap.wrap</code> і скоротіть його через <code>shorten</code>.",
    ],
  },
];
