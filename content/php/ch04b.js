export const LESSONS_04b = [
  {
    t: "enum: чисті й зі значеннями",
    ch: "Типи користувача",
    easy: `Enum це світлофор: у нього є рівно три стани, і четвертого не вигадаєш. Замість того щоб передавати слова «red» чи «grn» і сподіватися, що ніхто не помилиться в літері, ви вибираєте з закритого списку.`,
    p: [
      `Статус замовлення, роль користувача, масть карти: значення береться з невеликого фіксованого набору. Раніше його записували рядками (<code>'paid'</code>) або константами класу. Рядок легко написати з помилкою, <code>'payd'</code> PHP прийме без зауважень, а функція, що чекає статус, не має способу сказати «лише ці варіанти». З PHP 8.1 для таких випадків є окремий тип <code>enum</code>, у якому всі допустимі значення перераховані в одному місці.`,
      `Чистий (pure) enum оголошують так: <code>enum Suit { case Hearts; case Spades; }</code>. Кожен <code>case</code> це готовий об'єкт-одинак: <code>Suit::Hearts</code>. Його можна передавати у функції з типом <code>Suit</code>, порівнювати через <code>===</code>, і створити нове значення поза переліком неможливо. Властивість <code>name</code> віддає ім'я варіанта рядком: <code>Suit::Hearts-&gt;name</code> дасть <code>Hearts</code>. Метод <code>Suit::cases()</code> повертає масив усіх варіантів у порядку оголошення.`,
      `Якщо варіанти треба зберігати чи передавати зовні, наприклад у JSON або в базі, використовують backed enum, у якого кожен варіант має скалярне значення: <code>enum Status: string { case Paid = 'paid'; case New = 'new'; }</code>. Тип значення, <code>string</code> чи <code>int</code>, вказується після двокрапки, і всі варіанти мають його відповідати. Значення читають через <code>Status::Paid-&gt;value</code>, а перетворення назад виконують <code>Status::from('paid')</code> та <code>Status::tryFrom('x')</code>.`,
      `Різниця між <code>from</code> і <code>tryFrom</code> важлива. <code>from</code> кидає <code>ValueError</code>, якщо значення немає серед варіантів, а <code>tryFrom</code> повертає <code>null</code>. Для даних, що прийшли ззовні, берете <code>tryFrom</code> і самі вирішуєте, що робити з <code>null</code>; для внутрішніх, які мають бути коректними, підійде <code>from</code>. Enum не можна створити через <code>new</code>, не можна успадкувати й не можна порівняти з рядком: <code>Status::Paid === 'paid'</code> дає <code>false</code>, бо це різні типи.`,
      `Enum може мати методи, константи й навіть реалізовувати інтерфейси. Тому логіку, прив'язану до варіантів, пишуть просто в ньому: <code>public function label(): string { return match($this) { self::Paid =&gt; 'Оплачено', self::New =&gt; 'Нове' }; }</code>. Вираз <code>match</code> без гілки за замовчуванням гарантує, що при додаванні нового варіанта забутий випадок вибухне помилкою <code>UnhandledMatchError</code>, а не мовчки дасть <code>null</code>. Властивостей зі станом у enum немає, це лише набір значень.`,
      `Ідіоми. Імена варіантів пишуть у PascalCase, значення рядкових enum у snake_case чи нижньому регістрі, так само, як вони зберігаються в базі. Замість масиву рядків-ролей пишіть <code>enum Role</code>, а в підписах функцій указуйте <code>Role $role</code>. Щоб отримати список значень для форми, використовуйте <code>array_column(Status::cases(), 'value')</code>. Не варто сліпо використовувати enum там, де набір змінюється даними з бази: тоді це вже таблиця, а не тип.`,
      `У нас уже є класи, незмінні об'єкти й enum. Наступний крок це повторне використання коду: як зробити новий клас, який бере все від існуючого й додає своє. Так ми підійдемо до успадкування.`,
    ],
    code: [
      String.raw`<?php
enum Suit
{
    case Hearts;
    case Spades;
    case Clubs;
}

$s = Suit::Spades;
echo $s->name . "\n";
var_dump($s === Suit::Spades);
foreach (Suit::cases() as $case) {
    echo $case->name . ' ';
}
echo "\n";`,
      String.raw`<?php
enum Status: string
{
    case New = 'new';
    case Paid = 'paid';
    case Shipped = 'shipped';
}

echo Status::Paid->value . "\n";
$s = Status::from('shipped');
echo $s->name . "\n";
var_dump(Status::tryFrom('payd'));
var_dump(Status::Paid === 'paid');`,
      String.raw`<?php
declare(strict_types=1);

enum Status: string
{
    case New = 'new';
    case Paid = 'paid';
    case Shipped = 'shipped';

    public function label(): string
    {
        return match ($this) {
            self::New => 'Нове',
            self::Paid => 'Оплачено',
            self::Shipped => 'Відправлено',
        };
    }

    public function canCancel(): bool
    {
        return $this === self::New || $this === self::Paid;
    }
}

function describe(Status $s): string
{
    return $s->label() . ($s->canCancel() ? ', можна скасувати' : ', скасувати не можна');
}

foreach (Status::cases() as $s) {
    echo describe($s) . "\n";
}
$incoming = ['paid', 'refund', 'new'];
foreach ($incoming as $raw) {
    $s = Status::tryFrom($raw);
    echo $raw . ' -> ' . ($s?->label() ?? 'невідомий статус') . "\n";
}`,
      String.raw`<?php
// аварія: from() кидає ValueError, якщо такого значення немає
enum Status: string
{
    case New = 'new';
    case Paid = 'paid';
}

echo Status::from('paid')->name . "\n";
echo Status::from('refund')->name . "\n";`,
    ],
    note: `Enum це закритий набір значень: <code>case</code> створює об'єкт-одинак. У backed enum <code>from</code> кидає ValueError для невідомого значення, а <code>tryFrom</code> повертає null. Enum ніколи не дорівнює рядку.`,
    work: `Статуси замовлень, ролі, типи платежів і способи доставки в сучасних проєктах це enum. Laravel і Symfony вміють перетворювати колонку бази на enum автоматично, а редактор підказує всі допустимі варіанти.`,
    tasks: [
      `Чим from() відрізняється від tryFrom() у backed enum?`,
      `Чому Status::Paid не дорівнює рядку paid за оператором ===?`,
    ],
  },
  {
    t: "Успадкування, parent і final",
    ch: "Типи користувача",
    easy: `Успадкування схоже на рецепт «торт, як у бабусі, але з вишнями»: ви не переписуєте весь рецепт, а беретеся за готовий і змінюєте лише те, чим ваш торт відрізняється. Усе інше лишається як було.`,
    p: [
      `Інколи кілька класів мають багато спільного: працівник і менеджер мають ім'я, зарплату й метод розрахунку, а менеджер до того ж керує командою. Копіювати спільний код у кожен клас небезпечно: виправили помилку в одному місці, а в іншому вона лишилась. Успадкування вирішує це: новий клас оголошується як нащадок існуючого й автоматично отримує всі його властивості й методи, а додає або змінює лише своє.`,
      `Синтаксис: <code>class Manager extends Employee { ... }</code>. Employee тут батьківський клас, Manager дочірній. Нащадок бачить усі <code>public</code> і <code>protected</code> члени батька, але не <code>private</code> (про це ми говорили в уроці про видимість). Перевірка <code>$m instanceof Employee</code> поверне <code>true</code>: менеджер це різновид працівника, тож його можна передати всюди, де чекають <code>Employee</code>.`,
      `Дочірній клас може перевизначити (override) метод: оголосити метод із тим самим іменем. Якщо потрібно виконати ще й батьківську версію, звертаються до неї через <code>parent::</code>, наприклад <code>parent::describe()</code>. Особливо важливо це для конструктора. Якщо дочірній клас оголошує власний <code>__construct</code>, батьківський автоматично не викликається: його треба викликати вручну, <code>parent::__construct($name, $salary)</code>. Якщо дочірнього конструктора немає, працює батьківський.`,
      `Головна пастка саме тут: забули <code>parent::__construct()</code>, і властивості батька лишаються неініціалізованими. Звернення до них кине <code>Error</code> про читання типізованої властивості до ініціалізації. Друга пастка: сигнатуру перевизначеного методу не можна довільно змінювати, бо нащадок мусить лишатися сумісним із батьком (принцип підстановки Лісков): типи параметрів можна лише розширювати, а типи результату лише звужувати. Порушення дає фатальну помилку під час завантаження класу.`,
      `Ключове слово <code>final</code> закриває двері. Метод із <code>final</code> не можна перевизначити, а клас із <code>final</code> не можна наслідувати взагалі: <code>final class Money { ... }</code>. Це свідоме рішення, що клас не розрахований на розширення, і воно захищає від випадкових поломок. Багато сучасних проєктів роблять final усі класи за замовчуванням і знімають заборону лише там, де розширення справді задумане.`,
      `Ідіоми. Перевага композиції над успадкуванням: якщо зв'язок описується словом «має» (замовлення має клієнта), краще тримати об'єкт у властивості, а не наслідувати його. Успадкування доречне для зв'язку «є різновидом» (менеджер є працівником). Глибоких ланцюгів на кшталт п'яти рівнів уникайте: їх важко тримати в голові. PHP підтримує лише одне батьківське успадкування, тобто в класу не може бути двох батьків.`,
      `Тепер ми вміємо будувати ієрархії, але вони не бувають безкоштовними: об'єкти в PHP живуть за ручкою, і не кожне присвоєння створює копію. Як саме копіюються об'єкти й що таке ідентичність, ми розберемо в наступному, просунутому уроці.`,
    ],
    code: [
      String.raw`<?php
class Animal
{
    public function __construct(protected string $name)
    {
    }

    public function speak(): string
    {
        return $this->name . ' видає звук';
    }
}

class Dog extends Animal
{
    public function fetch(): string
    {
        return $this->name . ' приносить палицю';
    }
}

$d = new Dog('Рекс');
echo $d->speak() . "\n";
echo $d->fetch() . "\n";
var_dump($d instanceof Animal);`,
      String.raw`<?php
class Employee
{
    public function __construct(protected string $name, protected int $salary)
    {
    }

    public function describe(): string
    {
        return $this->name . ' отримує ' . $this->salary;
    }
}

class Manager extends Employee
{
    public function __construct(string $name, int $salary, private int $teamSize)
    {
        parent::__construct($name, $salary);
    }

    public function describe(): string
    {
        return parent::describe() . ', керує командою з ' . $this->teamSize;
    }
}

$people = [new Employee('Іван', 30000), new Manager('Оля', 50000, 5)];
foreach ($people as $p) {
    echo $p->describe() . "\n";
}`,
      String.raw`<?php
class Shape
{
    final public function name(): string
    {
        return static::class;
    }

    public function area(): int
    {
        return 0;
    }
}

final class Square extends Shape
{
    public function __construct(private int $side)
    {
    }

    public function area(): int
    {
        return $this->side * $this->side;
    }
}

$s = new Square(4);
echo $s->name() . ': ' . $s->area() . "\n";
echo (new Shape())->area() . "\n";`,
      String.raw`<?php
// аварія: дочірній конструктор не викликав parent::__construct, властивість батька не ініціалізована
class User
{
    public function __construct(protected string $email)
    {
    }

    public function email(): string
    {
        return $this->email;
    }
}

class Admin extends User
{
    public function __construct(private int $level)
    {
    }
}

$a = new Admin(2);
echo "Адміна створено\n";
echo $a->email();`,
    ],
    note: `<code>extends</code> дає нащадкові всі public і protected члени батька. Конструктор нащадка не викликає батьківський сам: пишіть <code>parent::__construct()</code>. <code>final</code> забороняє перевизначення методу чи наслідування класу.`,
    work: `Ієрархії класів виникають скрізь: винятки, моделі Eloquent, контролери, обробники. Усе це наслідування від базового класу фреймворку. Дисципліна із <code>parent::</code> і <code>final</code> рятує від типових помилок, коли хтось пізніше розширює ваш клас і випадково ламає його контракт.`,
    tasks: [
      `Що станеться, якщо дочірній клас оголосить власний конструктор і не викличе parent::__construct()?`,
      `Що забороняє слово final перед методом і що перед класом?`,
    ],
  },
  {
    t: "Копіювання об'єктів: clone та ідентичність",
    ch: "Типи користувача",
    adv: true,
    easy: `Змінна з об'єктом схожа на ключ від квартири. Якщо віддати другу копію ключа, квартира лишиться одна, і вона змінюється для обох. Щоб отримати другу квартиру, треба зробити клон самої квартири, а не ключа.`,
    p: [
      `Масиви в PHP копіюються за значенням: <code>$b = $a;</code> створює незалежну копію, і зміна $b не торкається $a. З об'єктами все інакше. Змінна зберігає ручку на об'єкт, тож присвоєння <code>$b = $a;</code> копіює лише ручку: обидві змінні вказують на той самий об'єкт, і зміна через одну видна через іншу. Те саме відбувається, коли об'єкт передають у функцію: функція може змінити його, і виклик це побачить.`,
      `Щоб створити справжню копію, використовують оператор <code>clone</code>: <code>$b = clone $a;</code>. PHP створює новий об'єкт і копіює в нього значення всіх властивостей. Тепер це два незалежні об'єкти, і зміна одного не зачіпає іншого. Це зручно, коли треба взяти існуючий об'єкт як шаблон і змінити пару полів: замовлення-чернетка, копія налаштувань, початковий стан для відкату.`,
      `Але <code>clone</code> робить поверхневу (shallow) копію. Скалярні властивості копіюються за значенням, а от якщо властивість містить інший об'єкт, копіюється лише ручка на нього. У результаті клон і оригінал ділять один вкладений об'єкт: змінюєте адресу доставки в клоні, і вона змінюється в оригіналі. Це найпоширеніша пастка. Масиви всередині копіюються за значенням, але масив об'єктів знову ділить самі об'єкти.`,
      `Для глибокого копіювання клас може оголосити магічний метод <code>__clone()</code>. PHP викликає його на новому об'єкті одразу після копіювання, і там ви самі клонуєте вкладені об'єкти: <code>$this-&gt;address = clone $this-&gt;address;</code>. Якщо метод зробити <code>private</code>, ззовні клонувати об'єкт не вийде: так забороняють копіювання, наприклад для одинака. Клонувати можна лише об'єкт: <code>clone 5</code> кидає <code>Error</code>.`,
      `Ідентичність і рівність це різні питання. Оператор <code>===</code> між об'єктами відповідає «це той самий екземпляр?»: для двох ручок на один об'єкт дає <code>true</code>, а для клона <code>false</code>. Оператор <code>==</code> відповідає «чи однакові класи й значення всіх властивостей?»: клон дорівнює оригіналові, поки їх не змінили. Але <code>==</code> порівнює властивості рекурсивно й нестрого, на вкладених об'єктах із циклічними посиланнями він може навіть зависнути, тож для значень пишіть явний <code>equals()</code>.`,
      `З <code>readonly</code> варто бути обережними: у PHP 8.1 і 8.2 властивість <code>readonly</code> не можна змінити навіть у <code>__clone()</code>, тому глибоку копію таких об'єктів роблять через <code>new</code>. Дозвіл перезаписувати <code>readonly</code> у <code>__clone</code> з'явився лише в PHP 8.3, і запускаємо ми код у межах 8.1. Для незмінних value-об'єктів клонування зазвичай не потрібне, адже достатньо створити новий.`,
      `Ідіоми. Метод, що повертає змінену копію, часто пишуть як <code>$c = clone $this; $c-&gt;qty = $qty; return $c;</code>: це «wither». Якщо передаєте колекцію об'єктів, вирішіть, чи отримувач має право їх змінювати, а за потреби віддавайте клони. А наступний урок цієї глави, також просунутий, показує ще одну тонкість об'єктної моделі: як статичні виклики поводяться в спадкоємцях.`,
    ],
    code: [
      String.raw`<?php
class Counter
{
    public int $n = 0;
}

$a = new Counter();
$b = $a;
$b->n = 5;
echo $a->n . "\n";
var_dump($a === $b);

$arr1 = [1, 2];
$arr2 = $arr1;
$arr2[] = 3;
echo count($arr1) . "\n";`,
      String.raw`<?php
class Address
{
    public function __construct(public string $city)
    {
    }
}

class Order
{
    public function __construct(public int $id, public Address $address)
    {
    }
}

$o1 = new Order(1, new Address('Київ'));
$o2 = clone $o1;
$o2->id = 2;
$o2->address->city = 'Львів';
echo $o1->id . ' ' . $o1->address->city . "\n";
echo $o2->id . ' ' . $o2->address->city . "\n";`,
      String.raw`<?php
class Address
{
    public function __construct(public string $city)
    {
    }
}

class Order
{
    public function __construct(public int $id, public Address $address)
    {
    }

    public function __clone()
    {
        $this->address = clone $this->address;
    }
}

$o1 = new Order(1, new Address('Київ'));
$o2 = clone $o1;
$o2->address->city = 'Львів';
echo $o1->address->city . ' ' . $o2->address->city . "\n";
var_dump($o1 == $o2);
var_dump($o1 === $o2);
$o3 = clone $o1;
var_dump($o1 == $o3);`,
      String.raw`<?php
// аварія: clone застосовують не до об'єкта
$n = 5;
echo "Клонуємо число\n";
$m = clone $n;
echo $m;`,
    ],
    note: `Присвоєння об'єкта копіює ручку, а не об'єкт. <code>clone</code> робить поверхневу копію: вкладені об'єкти лишаються спільними, поки не клонувати їх у <code>__clone()</code>. <code>===</code> перевіряє той самий екземпляр, <code>==</code> порівнює поля.`,
    work: `У реальних проєктах помилка «змінив копію, а змінився оригінал» трапляється часто, особливо з об'єктами конфігурації й запитів. Обережне клонування або незмінні об'єкти позбавляють від таких несподіванок, а код стає передбачуваним для колег.`,
    tasks: [
      `Чому після $b = $a зміна властивості через $b видна і через $a?`,
      `Яку проблему створює поверхневе копіювання і як її розв'язує __clone()?`,
    ],
  },
  {
    t: "Пізнє статичне зв'язування: static проти self",
    ch: "Типи користувача",
    adv: true,
    easy: `Уявіть візитівку, надруковану в типографії: слово «self» це завжди назва типографії, де її надрукували. А «static» це ім'я того, хто фактично роздає візитку зараз. Одна й та сама заготовка, а підписи різні.`,
    p: [
      `Коли метод оголошено в батьківському класі, а викликано через нащадка, виникає питання: на який клас вказує ім'я всередині методу? Ключове слово <code>self</code> завжди означає клас, у якому цей код написано. Воно визначається під час оголошення, тому <code>self::create()</code> у батьківському класі залишиться батьківським навіть тоді, коли метод викликали через нащадка. Для статичних фабрик це не те, що потрібно.`,
      `Слово <code>static</code> у цьому контексті має інший зміст: воно означає клас, через який виклик відбувся в рантаймі. Це і є пізнє статичне зв'язування (late static binding): вибір класу відкладається до моменту виклику. Якщо ви пишете <code>Child::make()</code>, а метод <code>make()</code> оголошено в Parent і використовує <code>static</code>, усередині <code>static</code> означатиме <code>Child</code>. Для <code>self</code> усередині того самого методу лишився б <code>Parent</code>.`,
      `Найчастіше це застосовують у фабриках: <code>public static function create(): static { return new static(); }</code>. Метод у батьківському класі, а об'єкт, який він повертає, того класу, через який його викликали. Не доведеться перевизначати фабрику в кожному нащадку. Тип результату <code>static</code> (PHP 8.0) так і виражає: «той самий клас, що й у виклику». Для порівняння, <code>new self()</code> завжди дає батьківський об'єкт.`,
      `Пастка у цьому і лежить: <code>self::create()</code> у батьківському класі повертає батька, і виклик методу, оголошеного лише в нащадку, кине <code>Error</code> «Call to undefined method». Помилка підступна, бо код працює, поки не з'являється перший нащадок. Друга пастка: статична властивість, не оголошена в нащадку заново, спільна з батьком, тож лічильник, інкрементований через <code>Child::</code>, змінює й <code>Parent::</code>. Щоб мати окремий лічильник у кожного класу, властивість оголошують у кожному.`,
      `Ще дві корисні форми. <code>static::class</code> дає ім'я фактичного класу рядком, зручно для логів і для вибору імені таблиці за ім'ям моделі. А виклик <code>static::method()</code> усередині методу береться з перевизначеного варіанта в нащадку, тож базовий метод може «покликати» поведінку нащадка. Конструкція <code>parent::method()</code> і <code>self::method()</code> зберігають переадресацію: late static binding зберігається, якщо виклик іде через них, а не через ім'я конкретного класу.`,
      `Ідіоми. Використовуйте <code>new static()</code> у фабриках і ланцюжках будівельників, <code>self</code> для констант і методів, які свідомо не повинні перевизначатися, а <code>static::class</code> для діагностики. Модель Active Record у фреймворках на цьому й будується: <code>User::find(1)</code> повертає саме <code>User</code>, а не загальний <code>Model</code>. Для констант теж є різниця: <code>static::TABLE</code> візьме значення з нащадка, а <code>self::TABLE</code> із батька.`,
      `Із цим уроком ми закінчуємо главу про типи користувача: класи, видимість, статичні члени, незмінність, enum, успадкування й тонкощі об'єктів. Далі йде абстракція: інтерфейси, абстрактні класи й трейти дадуть інструменти, щоб описувати поведінку, не прив'язуючись до конкретних класів.`,
    ],
    code: [
      String.raw`<?php
class ParentModel
{
    public static function whoSelf(): string
    {
        return self::class;
    }

    public static function whoStatic(): string
    {
        return static::class;
    }
}

class ChildModel extends ParentModel
{
}

echo ChildModel::whoSelf() . "\n";
echo ChildModel::whoStatic() . "\n";`,
      String.raw`<?php
class Model
{
    public static function create(): static
    {
        return new static();
    }

    public function kind(): string
    {
        return static::class;
    }
}

class User extends Model
{
}

class Post extends Model
{
}

echo User::create()->kind() . "\n";
echo Post::create()->kind() . "\n";
echo Model::create()->kind() . "\n";`,
      String.raw`<?php
class Model
{
    protected const TABLE = 'models';
    protected static int $count = 0;

    public static function table(): string
    {
        return static::TABLE;
    }

    public static function fixed(): string
    {
        return self::TABLE;
    }

    public static function bump(): int
    {
        return ++static::$count;
    }
}

class User extends Model
{
    protected const TABLE = 'users';
}

echo User::table() . ' ' . User::fixed() . "\n";
echo Model::bump() . User::bump() . Model::bump() . "\n";`,
      String.raw`<?php
// аварія: self створює батьківський клас, а метод є лише в нащадка
class Model
{
    public static function create(): self
    {
        return new self();
    }
}

class User extends Model
{
    public function greet(): string
    {
        return 'Привіт';
    }
}

$u = User::create();
echo get_class($u) . "\n";
echo $u->greet();`,
    ],
    note: `<code>self</code> це клас, де написано код, а <code>static</code> клас, через який викликали. <code>new static()</code> у фабриці повертає об'єкт нащадка, а <code>new self()</code> завжди батька. Статична властивість спільна з нащадками, поки її не оголосити знову.`,
    work: `Active Record у Laravel і Doctrine, фабрики тестових даних і базові класи колекцій спираються на static. Без нього кожен нащадок мусив би перевизначати фабричні методи вручну, і код швидко обріс би дублюванням.`,
    tasks: [
      `Чим new static() відрізняється від new self() у фабричному методі батьківського класу?`,
      `Що поверне static::class, якщо метод оголошено в батька, а викликано через дочірній клас?`,
    ],
  },
];
