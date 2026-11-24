export const LESSONS_05a = [
  {
    t: "Наслідування: базовий і похідний клас",
    ch: "Абстракція",
    easy: "Наслідування це родинна схожість: усі птахи мають крила й дзьоб, а горобець і пінгвін додають свої особливості. Спільне описують один раз у загальному класі, а окремі види лише доповнюють його.",
    p: [
      "У попередній главі ми вміли робити власні типи, але кожен клас стояв сам по собі. Реальні програми повні споріднених сутностей: користувач і адміністратор, кіт і собака, кнопка і текстове поле. Вони мають спільні властивості, і копіювати їх у кожен клас означає множити помилки. <b>Наслідування</b> дозволяє описати спільне в одному <b>базовому</b> класі, а потім створити <b>похідний</b> клас, який автоматично отримує все базове й додає своє.",
      "Модель у голові така: об'єкт похідного класу складається з двох шарів. Спершу лежить повний базовий підоб'єкт, а за ним поля самого нащадка. Тому нащадок <i>є</i> базовим класом із додатками: де потрібен <code>Animal</code>, можна використати <code>Dog</code>. Синтаксис: <code>class Dog : public Animal { ... };</code>. Слово <code>public</code> означає «відкрите наслідування»: усе відкрите в базі лишається відкритим у нащадка. Для звичайної роботи пишіть саме його.",
      "Рівні доступу діють і тут. Приватні (<code>private</code>) члени бази існують у нащадку, але напряму недоступні: нащадок має користуватися відкритими методами бази. Якщо базі треба поділитися даними лише з нащадками, а не з усім світом, є рівень <code>protected</code>. Не зловживайте ним: захищені поля знову розмивають інкапсуляцію, тож зазвичай краще лишити поля приватними й додати захищений метод.",
      "Порядок створення важливий. Коли ви робите <code>Dog d(\"Рекс\");</code>, спершу будується база, потім нащадок. Базовий конструктор із параметрами викликають у списку ініціалізації нащадка: <code>Dog(const std::string&amp; n) : Animal(n) {}</code>. Знищення йде у зворотному порядку: спершу нащадок, потім база. Це та сама дисципліна, що й для полів: хто створений останнім, прибирається першим.",
      "Нащадок може оголосити метод з тим самим іменем, що й у базі. Але без слова <code>virtual</code> (воно в наступному уроці) це лише <b>приховування імені</b>: те, яка версія викличеться, вирішує тип змінної, а не тип справжнього об'єкта. Через <code>Dog d; d.speak();</code> спрацює версія нащадка, а через <code>Animal&amp; a = d; a.speak();</code> уже базова. Це перша пастка, і вона веде до потреби у віртуальних функціях.",
      "Інші пастки. Нащадок не може звернутися до приватного поля бази, і компілятор зупинить вас помилкою. Не наслідуйте заради повторного використання коду, якщо зв'язку «є» немає: машина не <i>є</i> двигуном, вона <i>має</i> двигун, і тут краще поле-член. Ще одне правило: наслідування будує ієрархію типів, а не зручну копію методів, тому питайте себе, чи справді нащадка можна підставити всюди, де чекають базу.",
      "Підсумуємо: <code>class D : public B</code> дає нащадку все відкрите й захищене з бази, база будується першою, а знищується останньою. Поки що виклик методу залежить від типу змінної. У наступному уроці ми зробимо так, щоб виклик залежав від справжнього типу об'єкта, і наслідування розкриє свою головну силу: поліморфізм.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

class Animal {
public:
    Animal(const std::string& name) : name_(name) {}
    const std::string& name() const { return name_; }
    void eat() const { std::cout << name_ << " їсть\n"; }

private:
    std::string name_;
};

class Dog : public Animal {
public:
    Dog(const std::string& name) : Animal(name) {}
    void bark() const { std::cout << name() << " гавкає\n"; }
};

int main() {
    Dog d("Рекс");
    d.eat();
    d.bark();
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

class Base {
public:
    Base(int id) : id_(id) { std::cout << "Base(" << id_ << ")\n"; }
    ~Base() { std::cout << "~Base(" << id_ << ")\n"; }

protected:
    int id_;
};

class Derived : public Base {
public:
    Derived(int id, const std::string& tag) : Base(id), tag_(tag) {
        std::cout << "Derived(" << tag_ << ")\n";
    }
    ~Derived() { std::cout << "~Derived(" << tag_ << ")\n"; }
    void show() const { std::cout << tag_ << " має id " << id_ << "\n"; }

private:
    std::string tag_;
};

int main() {
    Derived d(7, "перший");
    d.show();
    std::cout << "кінець main\n";
    return 0;
}
`,
      String.raw`#include <iostream>

class Animal {
public:
    void speak() const { std::cout << "...\n"; }
};

class Cat : public Animal {
public:
    void speak() const { std::cout << "няв\n"; }
};

int main() {
    Cat c;
    c.speak();

    Animal& a = c;
    a.speak();

    Animal copy = c;
    copy.speak();
    return 0;
}
`,
      String.raw`// не компілюється: нащадок не має доступу до приватного поля бази
#include <iostream>

class Account {
public:
    Account(int money) : balance_(money) {}

private:
    int balance_;
};

class Savings : public Account {
public:
    Savings(int money) : Account(money) {}
    void show() const { std::cout << balance_ << "\n"; }
};

int main() {
    Savings s(100);
    s.show();
    return 0;
}
`,
    ],
    note: "<code>class D : public B</code> означає «D є B»: база будується першою, знищується останньою. Без <code>virtual</code> метод вибирається за типом змінної, а не об'єкта. Приватні члени бази нащадку недоступні.",
    work: "Ієрархії класів зустрічаються у графічних бібліотеках (віджети), у рушіях ігор (сутності), у фреймворках логування й мережі. Дуже часто базовий клас це загальний інтерфейс, а нащадки приховують деталі реалізації.",
    tasks: [
      "У якому порядку викликаються конструктори й деструктори, коли створюють і знищують об'єкт похідного класу?",
      "Чому виклик <code>a.speak()</code> через <code>Animal&amp; a</code> на об'єкті <code>Cat</code> без <code>virtual</code> друкує базову версію?",
    ],
  },
  {
    t: "Віртуальні функції й поліморфізм",
    ch: "Абстракція",
    easy: "Віртуальна функція це пульт, що керує будь-яким телевізором: кнопка «гучніше» одна, а кожна модель реагує по-своєму. Ви тримаєте пульт (вказівник на базу), а працює справжній пристрій.",
    p: [
      "У минулому уроці ми побачили проблему: через посилання на базовий клас викликалася базова версія методу, навіть якщо за посиланням ховався нащадок. Але саме заради виклику «справжньої» версії ми й будуємо ієрархії. Список фігур, обробників чи платіжних методів зберігають як контейнер вказівників на базу, а потім у циклі просто викликають <code>area()</code>, не знаючи, яка це фігура. Це і є <b>поліморфізм</b>: один виклик, різна поведінка залежно від реального типу.",
      "Щоб його ввімкнути, метод у базі позначають <code>virtual</code>. Модель така: кожен об'єкт із віртуальними функціями має прихований вказівник на таблицю, де записано, яка версія кожного методу діє саме для цього типу. Під час виклику програма заглядає в таблицю й вибирає потрібну версію. Це <b>динамічна диспетчеризація</b>: вибір відбувається під час виконання, а не під час компіляції. Вона коштує одного додаткового переходу, але для більшості програм це дрібниця.",
      "У нащадку метод, що перевизначає віртуальний, обов'язково позначайте <code>override</code>. Це підказка для компілятора: «я справді хочу перевизначити». Якщо ви помилилися в імені, забули <code>const</code> або змінили тип параметра, компілятор видасть помилку замість тихого створення нової, іншої функції. Без <code>override</code> така помилка живе непомітно, а базова версія викликається, і вивід дивний.",
      "Поліморфізм працює лише через <b>вказівник або посилання</b> на базу: <code>Shape*</code>, <code>Shape&amp;</code>, <code>std::unique_ptr&lt;Shape&gt;</code>. Якщо покласти нащадка у змінну типу самої бази за значенням, відбувається <b>зрізання</b> (slicing): копіюється тільки базова частина, решта відрізається, і об'єкт стає чистою базою. Тому контейнери поліморфних об'єктів завжди зберігають вказівники, а не значення: <code>std::vector&lt;std::unique_ptr&lt;Shape&gt;&gt;</code>.",
      "Друга обов'язкова річ: <b>віртуальний деструктор</b>. Якщо ви видаляєте нащадка через вказівник на базу, а деструктор бази не віртуальний, поведінка невизначена: деструктор нащадка не викличеться, ресурси потечуть. Правило просте: якщо в класі є хоч одна віртуальна функція, зробіть деструктор віртуальним: <code>virtual ~Shape() = default;</code>. Тоді <code>unique_ptr&lt;Shape&gt;</code> коректно знищить справжній тип.",
      "Ще одна пастка: у конструкторі й деструкторі віртуальність не працює. Поки будується база, нащадка ще немає, тому виклик віртуального методу з конструктора бази дасть базову версію. Не розраховуйте на перевизначення в конструкторах. Також не плутайте перевизначення (<code>override</code>, той самий підпис) із перевантаженням (інші параметри): це різні речі.",
      "Тепер у вас є повний набір: <code>virtual</code> у базі, <code>override</code> у нащадках, вказівники замість значень і віртуальний деструктор. Але іноді базовий клас узагалі не має сенсу створювати: що таке просто «фігура» без форми? Для таких випадків є абстрактні класи й інтерфейси, і вони у наступному уроці.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

class Animal {
public:
    virtual std::string sound() const { return "..."; }
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    std::string sound() const override { return "гав"; }
};

class Cat : public Animal {
public:
    std::string sound() const override { return "няв"; }
};

void talk(const Animal& a) {
    std::cout << a.sound() << "\n";
}

int main() {
    Dog d;
    Cat c;
    Animal generic;
    talk(d);
    talk(c);
    talk(generic);
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <string>
#include <vector>

class Shape {
public:
    virtual double area() const = 0;
    virtual std::string name() const = 0;
    virtual ~Shape() { std::cout << "~Shape\n"; }
};

class Square : public Shape {
public:
    Square(double s) : s_(s) {}
    ~Square() override { std::cout << "~Square\n"; }
    double area() const override { return s_ * s_; }
    std::string name() const override { return "Квадрат"; }

private:
    double s_;
};

class Rect : public Shape {
public:
    Rect(double w, double h) : w_(w), h_(h) {}
    ~Rect() override { std::cout << "~Rect\n"; }
    double area() const override { return w_ * h_; }
    std::string name() const override { return "Прямокутник"; }

private:
    double w_, h_;
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Square>(3));
    shapes.push_back(std::make_unique<Rect>(2, 5));

    double total = 0;
    for (const auto& s : shapes) {
        std::cout << s->name() << ": " << s->area() << "\n";
        total += s->area();
    }
    std::cout << "Разом: " << total << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <vector>

class Base {
public:
    virtual int id() const { return 1; }
    virtual ~Base() = default;
};

class Derived : public Base {
public:
    int id() const override { return 2; }
};

int main() {
    Derived d;
    Base& ref = d;
    Base* ptr = &d;
    Base sliced = d;

    std::cout << "ref: " << ref.id() << "\n";
    std::cout << "ptr: " << ptr->id() << "\n";
    std::cout << "slice: " << sliced.id() << "\n";

    std::vector<Base> values;
    values.push_back(d);
    std::cout << "вектор значень: " << values[0].id() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>

class Base {
public:
    Base() { hello(); }
    virtual void hello() const { std::cout << "Base::hello\n"; }
    virtual ~Base() = default;
};

class Derived : public Base {
public:
    void hello() const override { std::cout << "Derived::hello\n"; }
};

int main() {
    Derived d;
    d.hello();
    return 0;
}
`,
      String.raw`// не компілюється: override не збігається з віртуальною функцією бази (немає const)
#include <iostream>

class Base {
public:
    virtual void run() const { std::cout << "base\n"; }
    virtual ~Base() = default;
};

class Derived : public Base {
public:
    void run() override { std::cout << "derived\n"; }
};

int main() {
    Derived d;
    d.run();
    return 0;
}
`,
    ],
    note: "Для поліморфізму потрібні три речі: <code>virtual</code> у базі, виклик через вказівник чи посилання, а також віртуальний деструктор. Нащадок пише <code>override</code>, а за значенням база зрізає об'єкт.",
    work: "Платіжні методи, фігури в редакторі, обробники подій і плагіни працюють через віртуальні функції: код викликає інтерфейс бази й не знає, який нащадок усередині. Нові типи додають без правок старого коду.",
    tasks: [
      "Що станеться з об'єктом <code>Derived</code>, якщо скопіювати його у змінну типу <code>Base</code> за значенням, і як це називається?",
      "Чому базовий клас із віртуальними функціями має мати віртуальний деструктор, а нащадок позначає перевизначення <code>override</code>?",
    ],
  },
  {
    t: "Абстрактні класи й інтерфейси",
    ch: "Абстракція",
    easy: "Абстрактний клас це бланк договору з порожніми місцями: сам по собі він нічого не означає, але кожен, хто його підписує, мусить заповнити всі пункти. Так ви гарантуєте, що кожен виконавець уміє потрібне.",
    p: [
      "Часто базовий клас задає лише «що можна робити», а «як» залежить від нащадка. Що таке просто <code>Shape</code>? Площу порожньої «фігури» порахувати неможливо. Створювати такий об'єкт безглуздо, і добре було б, щоб компілятор цього не дозволяв. Саме для цього існують <b>абстрактні класи</b>: вони описують контракт, а реалізація лишається нащадкам.",
      "Клас стає абстрактним, коли має хоча б одну <b>чисто віртуальну функцію</b>: <code>virtual double area() const = 0;</code>. Запис <code>= 0</code> каже: тіла тут немає, нащадок зобов'язаний його надати. Модель у голові: у таблиці віртуальних функцій для цього методу порожнє місце, і поки воно не заповнене, об'єкт такого типу створити не можна. Але вказівники й посилання на абстрактний клас цілком законні: через них ми й працюємо з нащадками.",
      "Нащадок, що не реалізував усі чисто віртуальні функції, сам залишається абстрактним. Тільки коли заповнено всі місця, клас стає <b>конкретним</b>, і його можна створювати. Це корисна гарантія: забули метод, і компілятор не дасть створити об'єкт. А позначка <code>override</code> стереже від помилки в підписі.",
      "Клас, у якому всі функції чисто віртуальні, а полів немає, називають <b>інтерфейсом</b>. У C++ окремого ключового слова <code>interface</code> немає: це просто абстрактний клас за домовленістю, зазвичай з назвою на кшталт <code>Logger</code> чи <code>IStorage</code>. Інтерфейс обов'язково має віртуальний деструктор (<code>virtual ~Logger() = default;</code>), бо його видалятимуть через вказівник на базу.",
      "Навіщо інтерфейси? Щоб відокремити «що» від «як». Функція приймає <code>Logger&amp;</code> і не знає, куди йде запис: у консоль, у файл чи в пам'ять. Для тестів підсовують підроблену реалізацію, яка збирає повідомлення у вектор. Це ідіома <b>впровадження залежності</b>: код залежить від абстракції, а не від конкретного класу, і його легко міняти й перевіряти.",
      "Тонкощі. Чисто віртуальна функція може мати тіло, яке визначають поза класом: нащадок може викликати його як типову реалізацію. Це рідкість, але для деструктора бази так роблять навіть часто. Абстрактний клас може мати й звичайні функції, і поля: він не зобов'язаний бути «чистим» інтерфейсом. Але що менше стану в інтерфейсі, то легше його реалізовувати.",
      "Тепер ви вмієте описувати контракти й будувати розширювані системи без жодного знання про конкретні типи. Але наслідування прив'язує поведінку до ієрархії класів. Коли ж треба зробити те саме для <i>різних несуміжних типів</i>, наприклад «більший з двох» для чисел і рядків, потрібен інший інструмент: шаблони, наступний урок.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

class Logger {
public:
    virtual void log(const std::string& msg) = 0;
    virtual ~Logger() = default;
};

class ConsoleLogger : public Logger {
public:
    void log(const std::string& msg) override { std::cout << "[console] " << msg << "\n"; }
};

class PrefixLogger : public Logger {
public:
    PrefixLogger(const std::string& prefix) : prefix_(prefix) {}
    void log(const std::string& msg) override { std::cout << prefix_ << ": " << msg << "\n"; }

private:
    std::string prefix_;
};

int main() {
    ConsoleLogger a;
    PrefixLogger b("app");
    Logger& l1 = a;
    Logger& l2 = b;
    l1.log("старт");
    l2.log("робота");
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <vector>

class Logger {
public:
    virtual void log(const std::string& msg) = 0;
    virtual ~Logger() = default;
};

class MemoryLogger : public Logger {
public:
    void log(const std::string& msg) override { lines.push_back(msg); }
    std::vector<std::string> lines;
};

class ConsoleLogger : public Logger {
public:
    void log(const std::string& msg) override { std::cout << "> " << msg << "\n"; }
};

int process(int x, Logger& logger) {
    logger.log("отримано " + std::to_string(x));
    int result = x * x;
    logger.log("результат " + std::to_string(result));
    return result;
}

int main() {
    ConsoleLogger console;
    process(4, console);

    MemoryLogger mem;
    process(5, mem);
    std::cout << "у пам'яті " << mem.lines.size() << " рядки\n";
    std::cout << mem.lines[1] << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <memory>
#include <vector>

class Shape {
public:
    virtual double area() const = 0;
    virtual double perimeter() const = 0;
    virtual ~Shape() = default;
    void describe() const {
        std::cout << "площа " << area() << ", периметр " << perimeter() << "\n";
    }
};

class Square : public Shape {
public:
    Square(double s) : s_(s) {}
    double area() const override { return s_ * s_; }
    double perimeter() const override { return 4 * s_; }

private:
    double s_;
};

class Rect : public Shape {
public:
    Rect(double w, double h) : w_(w), h_(h) {}
    double area() const override { return w_ * h_; }
    double perimeter() const override { return 2 * (w_ + h_); }

private:
    double w_, h_;
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Square>(2));
    shapes.push_back(std::make_unique<Rect>(2, 3));
    for (const auto& s : shapes) s->describe();
    return 0;
}
`,
      String.raw`// не компілюється: не можна створити об'єкт абстрактного класу
#include <iostream>

class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

int main() {
    Shape s;
    std::cout << s.area() << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: Circle не реалізував чисто віртуальну name(), тож залишився абстрактним
#include <iostream>
#include <string>

class Shape {
public:
    virtual double area() const = 0;
    virtual std::string name() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    double area() const override { return 3.14 * 2 * 2; }
};

int main() {
    Circle c;
    std::cout << c.area() << "\n";
    return 0;
}
`,
    ],
    note: "<code>= 0</code> робить функцію чисто віртуальною, а клас абстрактним: об'єкт створити не можна, але вказівники й посилання допустимі. Нащадок мусить реалізувати все, інакше сам лишається абстрактним. В інтерфейсі потрібен віртуальний деструктор.",
    work: "Інтерфейси відокремлюють код від деталей: логери, сховища даних, платіжні шлюзи, мережеві клієнти. У тестах справжню реалізацію підміняють підробною, і перевірка не потребує ні мережі, ні диска, ні складного налаштування середовища.",
    tasks: [
      "Чим відрізняється абстрактний клас від інтерфейсу в C++ і що робить запис <code>= 0</code>?",
      "Чому, маючи абстрактний клас <code>Shape</code>, не можна написати <code>Shape s;</code>, але можна <code>Shape&amp; r = circle;</code>?",
    ],
  },
  {
    t: "Шаблони функцій",
    ch: "Абстракція",
    easy: "Шаблон функції це викрійка: один крій, а тканину ви обираєте щоразу нову. Ви пишете алгоритм «знайти більше з двох» один раз, а компілятор шиє з нього версію для чисел, дробів чи рядків.",
    p: [
      "Припустимо, вам потрібна функція «більше з двох». Для <code>int</code> ви пишете одну, для <code>double</code> другу, для <code>std::string</code> третю, і тіла в них однакові. Копіювати код нудно, а виправляти помилку доведеться в кожній копії. <b>Шаблон функції</b> розв'язує це: ви описуєте алгоритм через умовний тип <code>T</code>, а компілятор сам створює потрібні версії.",
      "Синтаксис: <code>template &lt;typename T&gt; T maxOf(T a, T b) { return a &lt; b ? b : a; }</code>. Рядок <code>template &lt;typename T&gt;</code> оголошує параметр типу. Під час виклику <code>maxOf(3, 7)</code> компілятор бачить, що <code>T</code> це <code>int</code>, і створює (<b>інстанціює</b>) звичайну функцію для <code>int</code>. Це відбувається під час компіляції: у готовій програмі жодних шаблонів немає, лише набір звичайних функцій, тому швидкість така сама, як у написаних вручну.",
      "Зазвичай тип виводиться з аргументів (<b>виведення типу</b>), але його можна вказати явно: <code>maxOf&lt;double&gt;(1, 2.5)</code>. Параметрів типу може бути кілька: <code>template &lt;typename A, typename B&gt;</code>. Шаблонам доступні й звичайні параметри функції, у тому числі посилання: для важких типів пишіть <code>const T&amp;</code>, щоб не копіювати рядки та вектори. Шаблон може повертати й інший тип, наприклад <code>T sum(const std::vector&lt;T&gt;&amp; v)</code>.",
      "Головне правило: шаблон не перевіряється «наперед», а лише під час інстанціювання. Якщо тіло використовує <code>a &lt; b</code>, то тип <code>T</code> зобов'язаний мати оператор <code>&lt;</code>. Підставите тип без нього, і компілятор видасть помилку десь усередині шаблона, нерідко довгу й незграбну. Читайте її з початку: там сказано, який саме тип і чого не вміє. Це так званий «неявний контракт» шаблона.",
      "Пастка номер один: виведення типу не вміє миритися з різними типами. Виклик <code>maxOf(1, 2.5)</code> дає помилку: з першого аргумента <code>T</code> це <code>int</code>, із другого <code>double</code>, і компілятор не вгадує. Розв'язок: привести аргументи до одного типу, вказати <code>maxOf&lt;double&gt;</code> або зробити два параметри шаблона. Пастка номер два: поруч із шаблоном можна написати звичайну функцію з тим самим іменем, і для точного збігу компілятор віддасть перевагу їй, це <b>перевантаження</b>.",
      "Де використовують? Там, де алгоритм не залежить від типу: <code>swap</code>, <code>min</code> і <code>max</code>, пошук, підрахунок суми. Уся стандартна бібліотека, від <code>std::sort</code> до <code>std::accumulate</code>, написана шаблонами. Тіло шаблона живе в заголовних файлах, бо компілятор мусить його бачити в місці виклику. Не робіть шаблони без потреби: якщо тип один, звичайна функція проста й зрозуміла.",
      "Ви навчилися відокремлювати алгоритм від типу. Але даних теж часто стосується те саме: контейнер для <code>int</code> і для рядків різниться лише елементом. Тому наступний крок природний: шаблони не лише функцій, а й класів. Саме так збудований <code>std::vector&lt;T&gt;</code>, і ви зараз напишете власний аналог.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>

template <typename T>
T maxOf(T a, T b) {
    return a < b ? b : a;
}

int main() {
    std::cout << maxOf(3, 7) << "\n";
    std::cout << maxOf(2.5, 1.5) << "\n";
    std::cout << maxOf(std::string("яблуко"), std::string("банан")) << "\n";
    std::cout << maxOf('a', 'z') << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>
#include <vector>

template <typename T>
T sum(const std::vector<T>& v) {
    T total{};
    for (const T& x : v) total += x;
    return total;
}

template <typename T>
void swapValues(T& a, T& b) {
    T tmp = a;
    a = b;
    b = tmp;
}

int main() {
    std::vector<int> nums{1, 2, 3, 4};
    std::vector<std::string> words{"до", "ме", "ні"};
    std::cout << sum(nums) << "\n";
    std::cout << sum(words) << "\n";

    std::string x = "перший", y = "другий";
    swapValues(x, y);
    std::cout << x << " " << y << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>

template <typename T>
T maxOf(T a, T b) {
    return a < b ? b : a;
}

template <typename A, typename B>
auto addAny(A a, B b) {
    return a + b;
}

int main() {
    std::cout << maxOf<double>(1, 2.5) << "\n";
    std::cout << addAny(1, 2.5) << "\n";
    std::cout << addAny(2, 3) << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>

template <typename T>
const char* kind(T) { return "шаблон"; }

const char* kind(int) { return "звичайна функція для int"; }

int main() {
    std::cout << kind(5) << "\n";
    std::cout << kind(5.0) << "\n";
    std::cout << kind('x') << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: T виводиться і як int, і як double
#include <iostream>

template <typename T>
T maxOf(T a, T b) {
    return a < b ? b : a;
}

int main() {
    std::cout << maxOf(1, 2.5) << "\n";
    return 0;
}
`,
    ],
    note: "<code>template &lt;typename T&gt;</code> описує алгоритм для будь-якого типу, а компілятор створює версію під кожен використаний тип. Тип має вміти все, що робить тіло шаблона. Різні типи аргументів із одним <code>T</code> не виводяться.",
    work: "Шаблонами написані <code>std::sort</code>, <code>std::min</code>, <code>std::swap</code> і майже вся стандартна бібліотека. У власних проєктах їх пишуть для утиліт: обмеження значення, пошук у контейнері, перетворення типів, прості математичні помічники.",
    tasks: [
      "Чому виклик <code>maxOf(1, 2.5)</code> із шаблоном <code>maxOf(T, T)</code> не компілюється і як це виправити?",
      "Коли компілятор перевіряє, чи тип підтримує оператор <code>&lt;</code> у тілі шаблона: під час оголошення чи під час використання?",
    ],
  },
  {
    t: "Шаблони класів",
    ch: "Абстракція",
    easy: "Шаблон класу це форма для випічки: одна форма, а начинку обираєте щоразу інакше. Клас «стек» описаний один раз, і з нього виходить стек чисел, стек рядків чи стек точок.",
    p: [
      "Контейнер не залежить від того, що в ньому лежить: стек однаково працює з числами й рядками. Писати <code>IntStack</code>, <code>StringStack</code> і ще десяток копій безглуздо. <b>Шаблон класу</b> описує клас через параметр типу: <code>template &lt;typename T&gt; class Stack { ... };</code>. Усередині класу <code>T</code> використовують як звичайний тип: для полів, параметрів і значень, що повертаються.",
      "Модель у голові: <code>Stack&lt;int&gt;</code> і <code>Stack&lt;std::string&gt;</code> це <i>два окремі, не пов'язані між собою класи</i>, які компілятор створює з одного шаблона. Параметри в кутових дужках вказують явно: <code>Stack&lt;int&gt; s;</code>. Для зручності дають псевдоніми: <code>using IntStack = Stack&lt;int&gt;;</code>. Шаблонний клас сам по собі не тип: тип виникає лише тоді, коли аргументи шаблона задані.",
      "Методи шаблонного класу теж шаблонні. Їх можна писати всередині класу, і тоді все працює без зайвих слів. Якщо ж вносите тіло поза класом, то перед кожним методом потрібно знову вказати параметри: <code>template &lt;typename T&gt; void Stack&lt;T&gt;::push(const T&amp; v) { ... }</code>. Тіла шаблонів тримають у заголовному файлі, а не в окремому <code>.cpp</code>, бо компілятор мусить побачити їх у місці використання.",
      "Крім типів, шаблон може приймати <b>значення</b> як параметри: <code>template &lt;typename T, std::size_t N&gt; class FixedArray</code>. Тоді <code>FixedArray&lt;int, 5&gt;</code> має розмір, відомий під час компіляції, і розмір входить у тип. Так влаштований <code>std::array&lt;int, 5&gt;</code>. Параметри можна задавати за замовчуванням: <code>template &lt;typename T = int&gt;</code>, і тоді <code>Box&lt;&gt;</code> означатиме <code>Box&lt;int&gt;</code>.",
      "Від C++17 компілятор вміє <b>виводити параметри класу з конструктора</b>: <code>std::pair p{1, 2.5};</code> стає <code>std::pair&lt;int, double&gt;</code>. Це зручно, але не всюди працює: якщо тип неможливо вивести (як у конструктора без аргументів), доведеться вказати його явно. Тож для <code>Stack s;</code> без аргументів і без <code>&lt;int&gt;</code> компілятор не здогадається.",
      "Пастки. Типи, створені з різних аргументів, несумісні: <code>Stack&lt;int&gt;</code> не можна присвоїти <code>Stack&lt;long&gt;</code>. Помилки в тілі шаблона виявляються лише при використанні: метод, який ніхто не викликав, може містити помилку, а компілятор промовчить. Тому пишіть тест, який викликає кожний метод хоча б для одного типу. І пам'ятайте про вартість: кожна комбінація аргументів дає окремий код, тож надмірна кількість інстанціювань роздуває програму.",
      "Тепер ви вмієте писати власні контейнери й узагальнені типи. Залишилося навчитися передавати в них <i>поведінку</i>: не лише дані різних типів, а й дії, наприклад «як порівнювати» чи «що робити з елементом». Для цього використовують виклики об'єктів і замикання, і вони у наступному уроці.",
    ],
    code: [
      String.raw`#include <iostream>
#include <string>
#include <vector>

template <typename T>
class Stack {
public:
    void push(const T& v) { items_.push_back(v); }
    T pop() {
        T top = items_.back();
        items_.pop_back();
        return top;
    }
    bool empty() const { return items_.empty(); }
    std::size_t size() const { return items_.size(); }

private:
    std::vector<T> items_;
};

int main() {
    Stack<int> nums;
    nums.push(1);
    nums.push(2);
    nums.push(3);
    std::cout << nums.pop() << " " << nums.pop() << " залишилось " << nums.size() << "\n";

    Stack<std::string> words;
    words.push("перший");
    words.push("другий");
    std::cout << words.pop() << "\n";
    return 0;
}
`,
      String.raw`#include <iostream>
#include <string>

template <typename K, typename V>
class Pair {
public:
    Pair(const K& key, const V& value) : key_(key), value_(value) {}
    const K& key() const { return key_; }
    const V& value() const { return value_; }
    void print() const;

private:
    K key_;
    V value_;
};

template <typename K, typename V>
void Pair<K, V>::print() const {
    std::cout << key_ << " => " << value_ << "\n";
}

int main() {
    Pair<std::string, int> a("вік", 30);
    a.print();

    Pair b(7, 2.5);
    b.print();

    using Entry = Pair<char, std::string>;
    Entry e('x', "ікс");
    e.print();
    return 0;
}
`,
      String.raw`#include <iostream>

template <typename T, std::size_t N>
class FixedArray {
public:
    FixedArray() : data_{} {}
    T& operator[](std::size_t i) { return data_[i]; }
    const T& operator[](std::size_t i) const { return data_[i]; }
    constexpr std::size_t size() const { return N; }
    T sum() const {
        T total{};
        for (std::size_t i = 0; i < N; ++i) total += data_[i];
        return total;
    }

private:
    T data_[N];
};

int main() {
    FixedArray<int, 4> a;
    for (std::size_t i = 0; i < a.size(); ++i) a[i] = static_cast<int>(i + 1) * 10;
    std::cout << "розмір " << a.size() << ", сума " << a.sum() << "\n";

    FixedArray<double, 2> d;
    d[0] = 0.5;
    d[1] = 1.25;
    std::cout << d.sum() << "\n";
    return 0;
}
`,
      String.raw`// не компілюється: параметр типу шаблона класу не виведено з нічого
#include <iostream>
#include <vector>

template <typename T>
class Stack {
public:
    void push(const T& v) { items_.push_back(v); }
    std::size_t size() const { return items_.size(); }

private:
    std::vector<T> items_;
};

int main() {
    Stack s;
    s.push(1);
    std::cout << s.size() << "\n";
    return 0;
}
`,
    ],
    note: "<code>Stack&lt;int&gt;</code> і <code>Stack&lt;std::string&gt;</code> це різні типи, створені з одного шаблона. Тіла шаблонів тримають у заголовках. Без аргументів компілятор виводить параметри лише з конструктора (C++17), інакше вкажіть їх у кутових дужках.",
    work: "Власні контейнери, обгортки, пули об'єктів і кеші пишуть шаблонами класів. Усі контейнери стандартної бібліотеки (<code>vector</code>, <code>map</code>, <code>optional</code>) це шаблони класів, і розуміння їх пристрою допомагає читати помилки компілятора та документацію.",
    tasks: [
      "Чому <code>Stack&lt;int&gt;</code> і <code>Stack&lt;long&gt;</code> вважаються різними типами і чи можна присвоїти один іншому?",
      "Що треба написати перед тілом методу, визначеного поза шаблонним класом, і чому тіла шаблонів кладуть у заголовки?",
    ],
  },
  {
    t: "Викликані об'єкти: std::function і замикання",
    ch: "Абстракція",
    easy: "Викликаний об'єкт це інструкція на листочку, яку можна передати комусь і сказати «виконай, коли буде треба». Листочок може навіть пам'ятати, для кого його написано: це і є замикання.",
    p: [
      "Досі ми передавали у функції дані, а іноді хочеться передати <i>дію</i>: «порівняй так», «що зробити після завершення», «яке перетворення застосувати». У C++ є кілька способів: вказівник на функцію, об'єкт зі своїм <code>operator()</code> і лямбда-вираз. Усі вони <b>викликані</b>: їх можна викликати як функцію, написавши дужки <code>f(1, 2)</code>.",
      "Найзручніший спосіб це <b>лямбда</b>: безіменна функція, що пишеться прямо там, де потрібна: <code>[](int a, int b) { return a + b; }</code>. Квадратні дужки на початку це <b>список захоплення</b>. Через нього лямбда бере змінні з місця створення: <code>[x]</code> копіює <code>x</code> усередину, <code>[&amp;x]</code> тримає посилання, <code>[=]</code> і <code>[&amp;]</code> захоплюють усе потрібне за значенням чи за посиланням. Лямбда із захопленням і називається <b>замиканням</b>: вона несе з собою частину оточення.",
      "У кожної лямбди свій унікальний тип, який неможливо назвати. Тому для змінних, полів і параметрів існує <code>std::function&lt;Ret(Args...)&gt;</code> із заголовка <code>&lt;functional&gt;</code>. Це універсальна обгортка: <code>std::function&lt;int(int, int)&gt;</code> може зберігати будь-який виклик із цим підписом: звичайну функцію, лямбду, об'єкт-функтор. Тож можна зробити вектор обробників чи словник «назва команди → дія».",
      "Захоплення за значенням робить <b>знімок</b>: після створення лямбди зміна оригіналу вже не впливає на копію. За замовчуванням ця копія нерухома (<code>const</code>); щоб змінювати її всередині, лямбду позначають <code>mutable</code>, і змінюється лише копія, а не оригінал. Захоплення за посиланням, навпаки, бачить змінні наживо: лямбда завжди читає актуальне значення.",
      "Головна небезпека це <b>висяче посилання</b>. Лямбда із <code>[&amp;]</code>, повернена з функції або збережена надовго, посилається на локальні змінні, що вже знищені, і подальший виклик це невизначена поведінка. Правило: якщо замикання житиме довше за поточну функцію, захоплюйте <i>за значенням</i>. Для швидких локальних викликів (наприклад, у <code>std::sort</code>) посилання цілком безпечні.",
      "Ще одна пастка: порожній <code>std::function</code>. Якщо обгортку створено без виклику й ви її викликаєте, програма кидає виняток <code>std::bad_function_call</code>, а необроблений виняток завершує програму аварійно. Тому перед викликом необов'язкового обробника перевіряйте його: <code>if (handler) handler(...)</code>. Також <code>std::function</code> трохи повільніша за чистий виклик лямбди через стирання типу, тож у гарячих місцях беруть шаблонний параметр.",
      "Ви навчилися передавати поведінку так само вільно, як дані: обробники подій, сортування за власним правилом, відкладені дії. Це завершує перший блок глави про абстракцію: наслідування, віртуальні функції, інтерфейси, шаблони й виклики об'єктів. Далі ми розглянемо типи, що виражають відсутність значення й вибір із кількох варіантів, і побачимо, як вони доповнюють усе вивчене.",
    ],
    code: [
      String.raw`#include <functional>
#include <iostream>

int add(int a, int b) { return a + b; }

int main() {
    auto mul = [](int a, int b) { return a * b; };
    std::function<int(int, int)> op = add;
    std::cout << op(3, 4) << "\n";

    op = mul;
    std::cout << op(3, 4) << "\n";

    int base = 100;
    op = [base](int a, int b) { return base + a + b; };
    std::cout << op(3, 4) << "\n";
    return 0;
}
`,
      String.raw`#include <functional>
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, std::function<double(double, double)>> ops;
    ops["+"] = [](double a, double b) { return a + b; };
    ops["-"] = [](double a, double b) { return a - b; };
    ops["*"] = [](double a, double b) { return a * b; };
    ops["/"] = [](double a, double b) { return b == 0 ? 0 : a / b; };

    for (const std::string name : {"+", "-", "*", "/"}) {
        std::cout << "8 " << name << " 2 = " << ops[name](8, 2) << "\n";
    }
    return 0;
}
`,
      String.raw`#include <functional>
#include <iostream>
#include <string>
#include <vector>

class Button {
public:
    void onClick(std::function<void(const std::string&)> handler) {
        handlers_.push_back(handler);
    }
    void click(const std::string& who) const {
        for (const auto& h : handlers_) h(who);
    }

private:
    std::vector<std::function<void(const std::string&)>> handlers_;
};

int main() {
    int clicks = 0;
    Button b;
    b.onClick([&clicks](const std::string&) { ++clicks; });
    b.onClick([](const std::string& who) { std::cout << "натиснув " << who << "\n"; });

    b.click("Ірина");
    b.click("Олег");
    std::cout << "кліків: " << clicks << "\n";
    return 0;
}
`,
      String.raw`#include <functional>
#include <iostream>

std::function<int()> makeCounter() {
    int n = 0;
    return [n]() mutable { return ++n; };
}

int main() {
    int x = 10;
    auto byValue = [x]() { return x; };
    auto byRef = [&x]() { return x; };
    x = 99;
    std::cout << "за значенням: " << byValue() << "\n";
    std::cout << "за посиланням: " << byRef() << "\n";

    auto c1 = makeCounter();
    auto c2 = makeCounter();
    std::cout << c1() << c1() << c1() << " " << c2() << "\n";
    return 0;
}
`,
      String.raw`// аварія: виклик порожнього std::function кидає bad_function_call, який ніхто не ловить
#include <functional>
#include <iostream>

int main() {
    std::function<void()> handler;
    std::cout << "перед викликом\n";
    handler();
    std::cout << "сюди не дійдемо\n";
    return 0;
}
`,
    ],
    note: "Лямбда <code>[захоплення](параметри) { тіло }</code> це безіменна функція; <code>std::function</code> зберігає будь-який виклик із заданим підписом. Замикання, що житиме довго, захоплюйте за значенням: посилання на знищену змінну небезпечне, а порожній <code>std::function</code> не можна викликати.",
    work: "Обробники подій і кнопок, зворотні виклики мережі, таблиці команд, відкладені завдання й сортування за власним правилом: усе це виклики об'єктів. Лямбди з <code>std::function</code> замінюють багато окремих класів-обробників.",
    tasks: [
      "Чим відрізняється захоплення <code>[x]</code> від <code>[&amp;x]</code> і яке з них небезпечне, коли замикання переживає функцію?",
      "Що станеться, якщо викликати порожній <code>std::function</code>, і як цього уникнути?",
    ],
  },
];
