export const LESSONS_05a = [
  {
    t: "Інтерфейси",
    ch: "Абстракція",
    easy: "Інтерфейс це розетка стандартної форми: їй байдуже, що в неї вставлять, чайник чи зарядку, головне, щоб вилка підходила. Так і код вимагає від об'єкта не конкретний клас, а набір умінь.",
    p: [
      "Коли програма росте, виявляється, що різні класи роблять одну справу по-різному: одні логи пишуть у файл, інші в базу, треті в консоль. Якщо кожен виклик знає конкретний клас, замінити один на інший без правок усюди неможливо. Інтерфейс розв'язує це: він описує, <i>що</i> об'єкт уміє, і нічого не каже про те, <i>як</i>.",
      "Модель у голові така: інтерфейс це контракт без реалізації. Він оголошується словом <code>interface</code>, містить лише сигнатури публічних методів (без тіла) і, за потреби, константи. Клас підписує контракт ключовим словом <code>implements</code> і зобов'язаний реалізувати кожен метод із тією самою сигнатурою, інакше PHP не дасть програмі запуститися.",
      "Головна користь у типах. Параметр, оголошений як <code>Logger $logger</code>, приймає будь-який об'єкт, чий клас реалізує Logger. Функція не залежить від конкретики, тому в тесті ви підсовуєте простий замінник, а в проєкті справжній клас. Перевірити приналежність під час виконання можна оператором <code>instanceof</code>. Так одна функція обробляє десяток різних класів, а додати одинадцятий можна, не торкаючись її коду: достатньо, щоб він підписав той самий контракт.",
      "Клас може реалізувати кілька інтерфейсів, перелічивши їх через кому: <code>class A implements Countable, JsonSerializable</code>. Саме так PHP обходить відсутність множинного успадкування класів. Інтерфейс може розширювати інші інтерфейси через <code>extends</code>, і тоді клас мусить реалізувати всі методи ланцюга. Усі методи інтерфейсу автоматично публічні, <code>private</code> чи <code>protected</code> там не пишуть.",
      "Пастки. Інтерфейс не можна створити через <code>new</code>, і властивостей у ньому немає, лише методи й константи. Якщо передати у функцію об'єкт, що контракту не підписав, навіть із потрібними методами, вийде <code>TypeError</code>: PHP перевіряє заявлену приналежність, а не наявність методів «за зовнішнім виглядом». Також сигнатура реалізації не може бути вужчою за контрактну: змінити типи параметрів довільно не вийде.",
      "Ідіоми. Назви інтерфейсів описують роль: <code>Logger</code>, <code>PaymentGateway</code>, <code>Comparable</code>, а не <code>ILogger</code> чи <code>LoggerInterface</code> у новому коді (останній суфікс, щоправда, поширений у PSR). Залежність у конструкторі оголошують саме інтерфейсом. Маленькі інтерфейси з одним-двома методами зручніші за гігантські: їх легко реалізувати й підмінювати.",
      "Інтерфейс дає лише контракт, а ось спільний код між класами він не передає. Коли кілька реалізацій мають спільну частину, її зручно винести в базовий клас, який можна частково залишити недописаним. Це абстрактні класи, про них наступний урок. Разом інтерфейс і абстрактний клас дають гнучку схему: тип у сигнатурі, а спільний код у базі.",
    ],
    code: [
      String.raw`<?php
interface Greeter
{
    public function greet(string $name): string;
}

class UkGreeter implements Greeter
{
    public function greet(string $name): string
    {
        return "Привіт, $name!";
    }
}

class EnGreeter implements Greeter
{
    public function greet(string $name): string
    {
        return "Hello, $name!";
    }
}

$list = [new UkGreeter(), new EnGreeter()];
foreach ($list as $g) {
    echo $g->greet("Оля"), "\n";
}`,
      String.raw`<?php
interface Shape
{
    const SIDES_UNKNOWN = 0;
    public function area(): float;
}

interface Named
{
    public function name(): string;
}

class Square implements Shape, Named
{
    public function __construct(private float $side) {}
    public function area(): float { return $this->side ** 2; }
    public function name(): string { return "квадрат"; }
}

$s = new Square(3);
printf("%s: %.1f\n", $s->name(), $s->area());
var_dump($s instanceof Shape, $s instanceof Named, $s instanceof Countable);
echo Shape::SIDES_UNKNOWN, "\n";`,
      String.raw`<?php
declare(strict_types=1);

interface Logger
{
    public function log(string $message): void;
}

class ArrayLogger implements Logger
{
    public array $lines = [];
    public function log(string $message): void { $this->lines[] = $message; }
}

class EchoLogger implements Logger
{
    public function log(string $message): void { echo "[log] $message\n"; }
}

class OrderService
{
    public function __construct(private Logger $logger) {}

    public function place(string $item, int $qty): void
    {
        $this->logger->log("замовлено $qty x $item");
    }
}

$mem = new ArrayLogger();
(new OrderService($mem))->place("кава", 2);
(new OrderService(new EchoLogger()))->place("чай", 1);
echo count($mem->lines), " запис у пам'яті: ", $mem->lines[0], "\n";`,
      String.raw`<?php
// аварія: об'єкт не підписав контракт Logger, тож TypeError
interface Logger
{
    public function log(string $message): void;
}

class Quiet
{
    public function log(string $message): void {}
}

function run(Logger $logger): void
{
    $logger->log("старт");
    echo "готово\n";
}

run(new Quiet());`,
    ],
    note: "Інтерфейс це контракт: методи без тіла, усі публічні. Клас має заявити <code>implements</code>, мати метод у потрібній сигнатурі, а не лише «схожий» метод. Типізуйте залежності інтерфейсом, а не конкретним класом.",
    work: "У проєктах на Laravel і Symfony майже всі сервіси залежать від інтерфейсів: логер, кеш, платіжний шлюз, поштовий відправник. Тому в тестах їх легко замінюють заглушками, а в продакшені підключають справжні реалізації.",
    tasks: [
      "Чим інтерфейс відрізняється від класу, і чому його не можна створити через new?",
      "Що станеться, якщо передати у функцію з параметром типу інтерфейсу об'єкт, який має потрібні методи, але не оголосив implements?",
    ],
  },
  {
    t: "Абстрактні класи",
    ch: "Абстракція",
    easy: "Абстрактний клас схожий на бланк договору з уже заповненими стандартними пунктами й порожніми місцями для підпису. Тримати бланк можна, а діяти за ним може лише заповнена копія.",
    p: [
      "Інтерфейс описує лише контракт, але часто реалізації мають спільну частину: однакове зберігання даних, загальні перевірки, шаблон алгоритму. Копіювати її в кожен клас марно. Абстрактний клас дозволяє вкласти спільний код у батька й залишити «дірки», які кожен нащадок заповнить по-своєму.",
      "Модель у голові така: абстрактний клас це напівфабрикат. Він оголошується словом <code>abstract class</code>, може мати звичайні властивості, конструктор і готові методи, а також абстрактні методи: <code>abstract protected function area(): float;</code>. У абстрактного методу тіла немає, лише сигнатура й крапка з комою.",
      "Створити об'єкт абстрактного класу не можна: <code>new Shape()</code> завершиться помилкою <code>Cannot instantiate abstract class</code>. Звичайний (неабстрактний) клас із абстрактним методом PHP не прийме взагалі. Нащадок через <code>extends</code> мусить реалізувати всі абстрактні методи батька, інакше сам має бути оголошений абстрактним. Модифікатор доступу в реалізації можна лишити тим самим або зробити ширшим (з protected на public), але не вужчим.",
      "Найкорисніший прийом тут шаблонний метод. Батько пише скелет алгоритму в звичайному методі й викликає в потрібних місцях абстрактні кроки, які реалізують нащадки. Наприклад, <code>describe()</code> у батька збирає рядок із назви й площі, а площу рахує кожна фігура сама. Скелет написаний один раз і не розходиться між класами, а виправлення помилки в ньому одразу діє на всіх нащадків. Позначивши такий метод як <code>final</code>, ви забороняєте його перевизначати.",
      "Пастки. По-перше, клас успадковує лише від одного батька, тому абстрактний клас вичерпує «єдину» нитку успадкування, а інтерфейсів можна підписати скільки завгодно. По-друге, абстрактні методи не можуть бути <code>private</code>: нащадок не побачив би їх, тож PHP це забороняє. Абстрактний метод не може мати й тіла: навіть порожні фігурні дужки це помилка. По-третє, не зловживайте глибокими ієрархіями: три рівні абстрактних класів читаються важко.",
      "Ідіоми. Коли потрібен і контракт, і спільний код, роблять пару: інтерфейс для типів у сигнатурах і абстрактний клас, який його реалізує частково. Конструктор у абстрактному класі нормальний: нащадок викликає його через <code>parent::__construct()</code> або просто успадковує. Метод, який нащадкам перевизначати не слід, позначають <code>final</code>.",
      "Підсумуємо модель: інтерфейс каже «що», абстрактний клас каже «що» і частково «як». Тому абстрактний клас доречний, коли в нащадків справді є спільний стан чи алгоритм, а не лише спільні назви методів. Абстрактні класи кладуть спільне в одне місце, а коли спільне треба роздати класам з різних гілок, на допомогу приходять трейти, їх розберемо в наступному уроці.",
    ],
    code: [
      String.raw`<?php
abstract class Shape
{
    abstract public function area(): float;

    public function describe(): string
    {
        return static::class . ": " . number_format($this->area(), 2);
    }
}

class Rect extends Shape
{
    public function __construct(private float $w, private float $h) {}
    public function area(): float { return $this->w * $this->h; }
}

class Circle extends Shape
{
    public function __construct(private float $r) {}
    public function area(): float { return M_PI * $this->r ** 2; }
}

foreach ([new Rect(2, 3.5), new Circle(1)] as $shape) {
    echo $shape->describe(), "\n";
}`,
      String.raw`<?php
abstract class Report
{
    public function __construct(protected array $rows) {}

    abstract protected function title(): string;
    abstract protected function line(array $row): string;

    final public function render(): string
    {
        $out = "== " . $this->title() . " ==\n";
        foreach ($this->rows as $row) {
            $out .= $this->line($row) . "\n";
        }
        return $out . "Рядків: " . count($this->rows) . "\n";
    }
}

class SalesReport extends Report
{
    protected function title(): string { return "Продажі"; }
    protected function line(array $row): string
    {
        return $row['item'] . ": " . $row['qty'];
    }
}

echo (new SalesReport([['item' => 'кава', 'qty' => 3], ['item' => 'чай', 'qty' => 1]]))->render();`,
      String.raw`<?php
interface Notifier
{
    public function send(string $to, string $text): string;
}

abstract class BaseNotifier implements Notifier
{
    private int $sent = 0;

    public function send(string $to, string $text): string
    {
        $this->sent++;
        return "#" . $this->sent . " " . $this->deliver($to, trim($text));
    }

    abstract protected function deliver(string $to, string $text): string;
}

class EmailNotifier extends BaseNotifier
{
    protected function deliver(string $to, string $text): string
    {
        return "email -> $to: $text";
    }
}

class SmsNotifier extends BaseNotifier
{
    protected function deliver(string $to, string $text): string
    {
        return "sms -> $to: " . mb_substr($text, 0, 10);
    }
}

$list = [new EmailNotifier(), new SmsNotifier()];
foreach ($list as $n) {
    echo $n->send("Оля", "  Ваше замовлення відправлено  "), "\n";
}`,
      String.raw`<?php
// аварія: абстрактний клас не можна створити через new
abstract class Shape
{
    abstract public function area(): float;
}

echo "перед створенням\n";
$s = new Shape();
echo "сюди не дійдемо\n";`,
    ],
    note: "Абстрактний клас не можна створити, він містить спільний код і абстрактні методи без тіла, які нащадок зобов'язаний реалізувати. Одне успадкування на клас, тому контракти для типів краще виносити в інтерфейси.",
    work: "Абстрактні базові класи трапляються в консольних командах, обробниках подій, репозиторіях і драйверах: батько реалізує спільну частину й шаблон кроків, а конкретний клас дописує лише відмінності, як-от текст листа чи джерело даних.",
    tasks: [
      "Чому абстрактний метод не може бути private?",
      "Що має зробити клас-нащадок, щоб його можна було створити через new?",
    ],
  },
  {
    t: "Трейти",
    ch: "Абстракція",
    easy: "Трейт це набір інструментів у валізі, який можна взяти з собою в будь-який гараж. Йому байдуже, до якої родини належить гараж: інструменти просто стають доступні майстру на місці.",
    p: [
      "PHP дозволяє класу мати лише одного батька. Але буває, що однакова невелика поведінка потрібна класам з різних гілок: наприклад, і користувач, і замовлення мають вміти записувати «створено о…» чи тримати прапорець «видалено». Дублювати код погано, а спільного предка в них немає, і створювати його лише заради двох методів недоречно. Для цього існують трейти: спосіб повторно використати код без спільного предка. Вони особливо корисні для наскрізної поведінки, яка не вписується в жодну ієрархію.",
      "Модель у голові така: трейт це шматок коду, який компілятор копіює в клас, що його підключив. Оголошується він словом <code>trait</code>, а підключається всередині класу рядком <code>use Name;</code>. Після цього методи й властивості трейта поводяться так, ніби ви написали їх у самому класі, зокрема мають доступ до <code>$this</code> і до приватних членів класу.",
      "Трейт може містити властивості, звичайні й статичні методи та абстрактні методи. Абстрактний метод у трейті це вимога до класу: «щоб мене підключити, реалізуй такий метод». Статичні властивості теж копіюються окремо на кожен клас. Підключати можна кілька трейтів через кому: <code>use A, B;</code>. Кожен клас, що використовує трейт, отримує власну копію його властивостей і статичних змінних, вони між класами не діляться.",
      "Якщо два трейти мають метод з однаковою назвою, PHP повідомить про конфлікт, і його розв'язують у блоці після <code>use</code>: <code>A::hello insteadof B;</code> обирає версію, а <code>B::hello as helloB;</code> залишає другу під новим ім'ям. Власний метод класу завжди сильніший за трейтовий, а трейтовий сильніший за успадкований від батька.",
      "Пастки. Трейт не є типом: <code>instanceof</code> із назвою трейта завжди дає <code>false</code>, а параметр із типом-трейтом викликає <code>TypeError</code>. Для типів потрібен інтерфейс. Трейт з неочевидними залежностями від класу робить код крихким, бо читач не бачить, звідки береться <code>$this-&gt;items</code>. Конфліктні властивості з різними початковими значеннями теж дають помилку.",
      "Ідіоми. Трейти обирають для дрібної, чітко окресленої поведінки: часові мітки, простий лічильник, логування. Часто трейт поєднують з інтерфейсом: інтерфейс описує контракт, а трейт дає типову реалізацію, яку клас підключає одним рядком. Імена трейтів часто роблять прикметниками чи дієслівними: <code>Timestamps</code>, <code>Loggable</code>. Складну бізнес-логіку у трейтах ховати не варто, її краще робити окремим об'єктом, який передають у конструктор.",
      "Трейти вчать ділити код без ієрархії, а в наступному уроці повернемося до звичайних класів і розберемо, як нащадок змінює поведінку батька та як PHP вирішує, чий метод викликати.",
    ],
    code: [
      String.raw`<?php
trait Greets
{
    public function hello(): string
    {
        return "Привіт від " . $this->name;
    }
}

class User
{
    use Greets;
    public function __construct(public string $name) {}
}

class Robot
{
    use Greets;
    public string $name = "Р-2";
}

echo (new User("Оля"))->hello(), "\n";
echo (new Robot())->hello(), "\n";`,
      String.raw`<?php
trait Counts
{
    private int $count = 0;

    public function inc(): static
    {
        $this->count++;
        return $this;
    }

    public function count(): int
    {
        return $this->count;
    }
}

class Clicks { use Counts; }
class Visits { use Counts; }

$a = new Clicks();
$b = new Visits();
$a->inc()->inc()->inc();
$b->inc();
echo $a->count(), " ", $b->count(), "\n";`,
      String.raw`<?php
trait Timestamps
{
    private string $createdAt = "2025-01-15 10:00:00";

    public function created(): string
    {
        return $this->createdAt;
    }
}

trait Describes
{
    abstract public function id(): int;

    public function describe(): string
    {
        return static::class . " #" . $this->id();
    }
}

trait Loud
{
    public function say(): string { return "ГУЧНО"; }
}

trait Quiet
{
    public function say(): string { return "тихо"; }
}

class Order
{
    use Timestamps, Describes;
    use Loud, Quiet {
        Loud::say insteadof Quiet;
        Quiet::say as whisper;
    }

    public function id(): int { return 7; }
}

$o = new Order();
echo $o->describe(), " від ", $o->created(), "\n";
echo $o->say(), " / ", $o->whisper(), "\n";
var_dump(in_array('Timestamps', class_uses($o), true));
var_dump($o instanceof Timestamps);`,
      String.raw`<?php
// аварія: трейт не є типом, тож TypeError
trait Greets
{
    public function hello(): string { return "привіт"; }
}

class User
{
    use Greets;
}

function run(Greets $x): void
{
    echo $x->hello(), "\n";
}

run(new User());`,
    ],
    note: "Трейт копіює код у клас через <code>use</code>, але не створює тип: <code>instanceof</code> із ним завжди false. Конфлікти імен вирішують <code>insteadof</code> та <code>as</code>. Для типів у сигнатурах потрібен інтерфейс.",
    work: "У проєктах трейти додають моделям часові мітки, м'яке видалення, обробку подій, а тестовим класам допоміжні методи. Фреймворки поставляють готові трейти, які підключають одним рядком use замість наслідування від ще одного базового класу.",
    tasks: [
      "Чим трейт відрізняється від абстрактного класу з погляду успадкування?",
      "Як розв'язати конфлікт, коли два підключені трейти мають метод з однаковою назвою?",
    ],
  },
  {
    t: "Поліморфізм і перевизначення методів",
    ch: "Абстракція",
    easy: "Диспетчер каже всім водіям однакове «їдьте за адресою», а кожен їде по-своєму: хто автобусом, хто таксі. Команда спільна, а виконання залежить від того, хто її отримав.",
    p: [
      "Поліморфізм у ширшому сенсі означає, що один і той самий виклик працює по-різному залежно від справжнього типу об'єкта. Код, який перебирає список фігур і викликає <code>area()</code>, не питає, круг це чи прямокутник: кожен об'єкт сам знає, як порахувати. Саме це дозволяє додавати нові класи, не чіпаючи старий код. Для читача програми це велика зручність: умови «якщо це круг, то… інакше…» зникають із розгалужень.",
      "Модель у голові така: змінна може мати «заявлений» тип (з сигнатури), а об'єкт у ній має справжній клас. PHP під час виклику методу дивиться на справжній клас і шукає метод спершу в ньому, потім у батьків угору ланцюжком. Те, що нащадок оголосив метод із тим самим ім'ям, і є перевизначенням (override). Така ж логіка діє для змінної, у якій лежить об'єкт класу-нащадка, але яка в сигнатурі названа батьківським типом чи інтерфейсом: виклик усе одно піде за справжнім класом.",
      "Перевизначений метод можна розширити, а не замінити повністю: <code>parent::method()</code> викликає версію батька. Типовий випадок це конструктор нащадка, який спершу передає спільні дані батькові через <code>parent::__construct(...)</code>, а потім додає власні. Якщо цей виклик забути, батьківські властивості лишаться незаповненими, а типізована властивість без значення при читанні дасть помилку.",
      "Сигнатура перевизначення підпорядковується правилу сумісності. Параметри можна розширювати (приймати ширший тип), а тип повернення звужувати (повертати конкретніший). Зробити навпаки PHP не дасть. Метод із модифікатором <code>final</code> перевизначити неможливо, а <code>final class</code> узагалі не має нащадків. У PHP 8.3 є атрибут <code>#[\\Override]</code>, який дає помилку, якщо батьківського методу немає.",
      "Пастки. Приватні методи не перевизначаються: батьківський метод, який викликає <code>$this-&gt;helper()</code> із приватним helper, завжди знайде свій, навіть якщо нащадок оголосив такий самий. Нащадок може відкрити доступ: protected у батька можна зробити public, але не навпаки. Також перевизначення мовчки не спрацює через друкарську помилку в імені: нащадок просто отримає ще один метод, а батьківський лишиться в роботі.",
      "Ідіоми. Віддавайте перевагу композиції там, де «нащадок» насправді не є різновидом батька. Для перемикання поведінки замість ланцюжка <code>if</code> за типом використовуйте поліморфізм: додати клас простіше, ніж правити розгалуження. Перевірки <code>instanceof</code> у основному коді зазвичай ознака того, що метод варто перенести в класи. Ще одна корисна звичка: перевизначення робити невеликими й узгодженими з поведінкою батька, щоб нащадком можна було підмінити предка без сюрпризів.",
      "У цьому уроці ми працювали зі звичайними типами. У наступному розберемо, як описувати параметри, що приймають кілька типів: union, nullable, mixed та iterable.",
    ],
    code: [
      String.raw`<?php
class Animal
{
    public function __construct(protected string $name) {}

    public function speak(): string
    {
        return $this->name . " видає звук";
    }
}

class Dog extends Animal
{
    public function speak(): string
    {
        return $this->name . " гавкає";
    }
}

class Cat extends Animal
{
    public function speak(): string
    {
        return parent::speak() . ", а потім нявкає";
    }
}

foreach ([new Animal("Хтось"), new Dog("Рекс"), new Cat("Мурка")] as $a) {
    echo $a->speak(), "\n";
}`,
      String.raw`<?php
class Employee
{
    public function __construct(protected string $name, protected int $base) {}

    public function pay(): int
    {
        return $this->base;
    }

    public function line(): string
    {
        return $this->name . ": " . $this->pay();
    }
}

class Manager extends Employee
{
    public function __construct(string $name, int $base, private int $bonus)
    {
        parent::__construct($name, $base);
    }

    public function pay(): int
    {
        return parent::pay() + $this->bonus;
    }
}

$team = [new Employee("Іван", 1000), new Manager("Марія", 1500, 300)];
$total = 0;
foreach ($team as $e) {
    echo $e->line(), "\n";
    $total += $e->pay();
}
echo "Разом: $total\n";`,
      String.raw`<?php
class Base
{
    public function run(): string
    {
        return $this->step() . "/" . $this->hook();
    }

    private function step(): string { return "базовий крок"; }
    protected function hook(): string { return "базовий хук"; }
}

class Child extends Base
{
    private function step(): string { return "крок нащадка"; }
    protected function hook(): string { return "хук нащадка"; }
}

echo (new Child())->run(), "\n";`,
      String.raw`<?php
// аварія: у об'єкта Dog немає методу fly, а Error не оброблено
abstract class Animal
{
    abstract public function speak(): string;
}

class Dog extends Animal
{
    public function speak(): string { return "гав"; }
}

class Bird extends Animal
{
    public function speak(): string { return "цвірінь"; }
    public function fly(): string { return "летить"; }
}

foreach ([new Bird(), new Dog()] as $a) {
    echo $a->speak(), ": ", $a->fly(), "\n";
}`,
    ],
    note: "Метод шукається за справжнім класом об'єкта, а не за заявленим типом змінної. Приватні методи не перевизначаються, а <code>parent::</code> викликає версію батька. Сумісність сигнатур PHP перевіряє сам.",
    work: "Поліморфізм прибирає розгалуження за типом: платіжні способи, формати експорту, правила знижок додають як нові класи з одним методом. Основний код, який їх викликає, лишається без змін і не ламається.",
    tasks: [
      "Який метод викличеться, якщо змінна має тип батька, а об'єкт створений з класу нащадка?",
      "Чому батьківський метод не бачить приватний метод нащадка з тією самою назвою?",
    ],
  },
  {
    t: "Типи: union, nullable, mixed й iterable",
    ch: "Абстракція",
    easy: "Типи параметрів схожі на надписи на дверях: «лише для співробітників» чи «співробітники або гості». Вужчий напис захищає краще, а ширший дозволяє більше, і треба свідомо обирати між ними.",
    p: [
      "До цього ми оголошували один тип на параметр: <code>int</code>, <code>string</code>, назву класу. Але життя складніше: ідентифікатор буває числом або рядком, пошук повертає запис чи нічого, а обхід приймає і масив, і колекцію. PHP 8 дає для цього спеціальні типи, і вони допомагають ловити помилки на межі виклику, а не десь у глибині функції, де причину знайти значно важче.",
      "Union-тип перелічує дозволені варіанти через вертикальну риску: <code>int|string</code>. Значення мусить належати хоча б одному з них. Nullable-тип це скорочення для «тип або null»: <code>?string</code> означає те саме, що <code>string|null</code>. Повернення <code>?User</code> чесно каже: користувача може не бути, і виклик має це врахувати.",
      "Тип <code>mixed</code> це «будь-що», зокрема й null. Він вимикає перевірку, тому використовувати його варто лише тоді, коли значення справді довільне, наприклад у функції дампа. Тип <code>iterable</code> приймає масив або будь-який об'єкт, що реалізує <code>Traversable</code>, тож <code>foreach</code> працює з обома. Окремо є <code>void</code> (нічого не повертає) і <code>never</code> (не повертається взагалі).",
      "Режим перевірки залежить від <code>declare(strict_types=1);</code>. Без нього PHP охоче перетворює значення: рядок <code>\"5\"</code> стане числом 5 для параметра <code>int</code>. Зі strict_types такий виклик дає <code>TypeError</code>. Єдине дозволене розширення: ціле може піти в параметр <code>float</code>. Директива діє лише на виклики з того файлу, де вона оголошена.",
      "Пастки. У nullable-параметра без значення за замовчуванням аргумент усе одно треба передати, хоч би й <code>null</code>: <code>?int $x</code> не робить його необов'язковим. Union із <code>int|string</code> і нестрогий режим можуть неочевидно змінити тип: рядок <code>\"7\"</code> залишиться рядком, а <code>\"7.5\"</code> також. Тип <code>mixed</code> не можна об'єднувати з іншими, бо він і так включає всі. Так само не можна поєднувати <code>?int</code> з іншими union-типами: пишіть <code>int|string|null</code>.",
      "Ідіоми. Пишіть найвужчий тип, який працює, і не бійтеся nullable там, де відсутність значення нормальна. Замість <code>mixed</code> оголошуйте union, замість масиву для обходу <code>iterable</code>, якщо функції досить пройтися по елементах. Запис <code>int $x = null</code> у старому коді неявно робив тип nullable, а сучасний код пише явно <code>?int $x = null</code>. Перевіряйте union-значення через <code>is_int</code>, <code>is_string</code> чи <code>match(true)</code>. Для необов'язкового результату повертайте <code>?Тип</code> і відразу обробляйте null оператором <code>??</code>.",
      "Типи роблять код передбачуваним, а в наступному уроці побачимо магічні методи, через які PHP дозволяє об'єкту самому вирішувати, як його друкувати чи читати його недоступні властивості.",
    ],
    code: [
      String.raw`<?php
declare(strict_types=1);

function label(int|string $id): string
{
    return is_int($id) ? "число $id" : "рядок '$id'";
}

function shout(?string $text): string
{
    return $text === null ? "(порожньо)" : strtoupper($text);
}

echo label(42), "\n";
echo label("a-7"), "\n";
echo shout("ok"), " ", shout(null), "\n";`,
      String.raw`<?php
declare(strict_types=1);

function total(iterable $items): int
{
    $sum = 0;
    foreach ($items as $n) {
        $sum += $n;
    }
    return $sum;
}

function describe(mixed $v): string
{
    return match (true) {
        is_int($v) => "int",
        is_string($v) => "string",
        is_array($v) => "array",
        $v === null => "null",
        default => get_debug_type($v),
    };
}

echo total([1, 2, 3]), " ", total(new ArrayIterator([10, 20])), "\n";
foreach ([5, "x", [1], null, 1.5, true] as $v) {
    echo describe($v), " ";
}
echo "\n";`,
      String.raw`<?php
function findName(array $users, int $id): ?string
{
    return $users[$id] ?? null;
}

function toInt(int $n): int
{
    return $n;
}

$users = [1 => "Оля", 2 => "Ігор"];
echo findName($users, 1), "\n";
echo findName($users, 9) ?? "невідомо", "\n";

// без strict_types рядок "5" мовчки стає числом
var_dump(toInt("5"));`,
      String.raw`<?php
// аварія: strict_types забороняє рядок там, де потрібне int
declare(strict_types=1);

function double(int $n): int
{
    return $n * 2;
}

echo double(4), "\n";
echo double("5"), "\n";`,
    ],
    note: "Union <code>A|B</code> приймає один із типів, <code>?T</code> це <code>T|null</code>, mixed вимикає перевірку, iterable приймає масив і Traversable. Без strict_types PHP мовчки приводить значення, зі strict_types кидає TypeError.",
    work: "У реальних API ідентифікатори приходять то числом, то рядком, пошук повертає запис або null, а обробка списків приймає і масиви, і колекції. Точні типи ловлять помилки вже при виклику, а не десь у глибині логіки.",
    tasks: [
      "Що означає ?string і чим цей запис відрізняється від необов'язкового параметра?",
      "Що зміниться при виклику функції з параметром int і аргументом рядком \"5\", якщо ввімкнути strict_types?",
    ],
  },
  {
    t: "Магічні методи: __toString, __get і __call",
    ch: "Абстракція",
    easy: "Магічні методи це реакції на нестандартні дії з об'єктом, як автовідповідач: коли дзвінок не потрапляє нікуди, спрацьовує запасний сценарій. Ви самі описуєте, що тоді сказати.",
    p: [
      "Деякі операції з об'єктом PHP не може виконати сам: перетворити на рядок, прочитати властивість, якої немає, викликати неіснуючий метод. Замість помилки він шукає спеціальний метод із назвою, що починається з двох підкреслень, і викликає його. Це магічні методи, і вони дають об'єкту змогу самому вирішити, що робити. Їх не викликають напряму, їх запускає сама мова в певні моменти, тому імена починаються з двох підкреслень і зарезервовані.",
      "Найпростіший з них <code>__toString()</code>. Він викликається, коли об'єкт використовують як рядок: в <code>echo</code>, конкатенації, <code>strlen</code>. Метод має повертати <code>string</code>. Якщо його немає, спроба вивести об'єкт закінчується помилкою. Клас із <code>__toString</code> автоматично вважається <code>Stringable</code> (цей інтерфейс розберемо в наступному уроці).",
      "Методи <code>__get($name)</code> і <code>__set($name, $value)</code> перехоплюють читання й запис властивостей, які недоступні: приватних чи неіснуючих. Їм допомагає <code>__isset($name)</code>, який відповідає на <code>isset($obj-&gt;x)</code>. Типовий приклад це об'єкт, що ховає масив даних і віддає їх як властивості. Увага: для доступних публічних властивостей <code>__get</code> не викликається взагалі.",
      "Усі ці методи варто оголошувати з типами: <code>__get(string $name): mixed</code>. Метод <code>__call($name, $args)</code> ловить виклики неіснуючих або недоступних методів, а <code>__callStatic</code> робить те саме для статичних. Так будують динамічні обгортки: <code>$obj-&gt;getTitle()</code>, <code>$obj-&gt;getPrice()</code> без окремого методу на кожне поле. Імена методів PHP не розрізняє за регістром, а ось ім'я у <code>__call</code> приходить саме так, як написав викликач. Є й <code>__invoke</code>, який дозволяє викликати об'єкт, як функцію: <code>$obj(5)</code>.",
      "Пастки. Магія ховає помилки: друкарська помилка в імені методу не дасть <code>Error</code>, а піде в <code>__call</code>, і ви довго шукатимете причину. Середовище розробки не підказує такі методи й властивості, а статичний аналіз їх не бачить, поки не описати у PHPDoc. Крім того, <code>__get</code> повертає значення за копією для масивів: зміна <code>$obj-&gt;list[] = 1</code> не потрапить у збережений масив.",
      "Ідіоми. Магію використовують економно: <code>__toString</code> для зручного виведення, <code>__invoke</code> для одно-дієвих об'єктів, <code>__call</code> для проксі й обгорток. Ще одна тонкість: <code>__get</code> спрацьовує й для приватних властивостей, якщо звернення йде ззовні класу. Для звичайних даних зручніші явні геттери або публічні readonly-властивості. Якщо <code>__get</code> все ж потрібен, кидайте виняток на невідоме ім'я, щоб помилки не губилися.",
      "Магічні методи показали, що об'єкт можна навчити поводитись, як рядок, масив чи функція. У наступному уроці побачимо готові інтерфейси Stringable, Countable та ArrayAccess, які роблять це офіційно.",
    ],
    code: [
      String.raw`<?php
class Money
{
    public function __construct(private int $cents, private string $cur) {}

    public function __toString(): string
    {
        return number_format($this->cents / 100, 2) . " " . $this->cur;
    }
}

$price = new Money(1999, "UAH");
echo "Ціна: " . $price . "\n";
echo strlen((string) $price), "\n";`,
      String.raw`<?php
class Bag
{
    private array $data = [];

    public function __set(string $name, mixed $value): void
    {
        $this->data[$name] = $value;
    }

    public function __get(string $name): mixed
    {
        return $this->data[$name] ?? null;
    }

    public function __isset(string $name): bool
    {
        return isset($this->data[$name]);
    }
}

$b = new Bag();
$b->color = "червоний";
echo $b->color, "\n";
var_dump(isset($b->color), isset($b->size));
var_dump($b->size);`,
      String.raw`<?php
class Row
{
    public function __construct(private array $fields) {}

    public function __call(string $name, array $args): mixed
    {
        if (str_starts_with($name, 'get')) {
            $key = lcfirst(substr($name, 3));
            return $this->fields[$key] ?? throw new BadMethodCallException("немає поля $key");
        }
        throw new BadMethodCallException("невідомий метод $name");
    }

    public function __invoke(string $key): mixed
    {
        return $this->fields[$key] ?? null;
    }
}

$row = new Row(['title' => 'Книга', 'price' => 250]);
echo $row->getTitle(), " ", $row->getPrice(), " ", $row('title'), "\n";
try {
    $row->getAuthor();
} catch (BadMethodCallException $e) {
    echo "помилка: ", $e->getMessage(), "\n";
}`,
      String.raw`<?php
// аварія: у класі немає __toString, тож Error під час виведення
class Money
{
    public function __construct(public int $cents) {}
}

$m = new Money(500);
echo "до\n";
echo "Ціна: " . $m . "\n";`,
    ],
    note: "Магічні методи PHP викликає сам: <code>__toString</code> для рядка, <code>__get</code> і <code>__set</code> для недоступних властивостей, <code>__call</code> для неіснуючих методів. Вони ховають помилки в іменах, тому використовуйте їх економно.",
    work: "<code>__toString</code> зручний для логів і повідомлень, <code>__call</code> лежить в основі проксі та динамічних фасадів, а <code>__get</code> трапляється в ORM-моделях, де поля таблиці читаються як властивості. Усе це варто знати, щоб розуміти чужий код.",
    tasks: [
      "Коли PHP викликає __get, а коли ні?",
      "Що станеться при виведенні через echo об'єкта класу без методу __toString?",
    ],
  },
];
