import type { RefSection } from "./types.ts";

const raw = String.raw;

export const cpp: RefSection[] = [
  { t: "Структура програми", items: [
    { t: "Мінімальна програма", code: raw`#include <iostream>
using namespace std;

int main() {
    cout << "Привіт, світе!" << endl;
    return 0;
}`, note: "Програма починається з `main`. Кожна інструкція завершується крапкою з комою." },
    { t: "Компіляція", code: raw`g++ main.cpp -o main
./main`, note: "C++ компілюється в виконуваний файл, потім запускається." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "Основні типи", code: raw`int age = 16;
double price = 24.5;
char letter = 'A';
bool ok = true;
string name = "Олена";    // потрібен #include <string>
const double PI = 3.14;`, note: "Тип вказується при оголошенні. Ділення цілих відкидає дріб: `7 / 2` дає 3." },
    { t: "Перетворення", code: raw`int n = (int) 3.9;          // 3
double d = 7 / 2.0;         // 3.5
int x = stoi("12");
string s = to_string(42);`, note: "`stoi` і `to_string` це зручні перетворення між рядками й числами." },
  ] },
  { t: "Ввід і вивід", items: [
    { t: "cin і cout", code: raw`string name;
int age;
cout << "Ім'я та вік: ";
cin >> name >> age;
cout << name << ", " << age + 5 << endl;`, note: "`cin >>` читає слово або число, `getline(cin, рядок)` читає весь рядок." },
  ] },
  { t: "Умови", items: [
    { t: "if і switch", code: raw`if (age < 12) {
    cout << "дитина" << endl;
} else if (age < 18) {
    cout << "підліток" << endl;
} else {
    cout << "дорослий" << endl;
}

switch (n) {
    case 1: cout << "один"; break;
    default: cout << "інше";
}`, note: "Один знак `=` присвоює, два знаки `==` порівнюють. У `switch` не забувайте `break`." },
  ] },
  { t: "Цикли", items: [
    { t: "for, while, do-while", code: raw`for (int i = 0; i < 3; i++) {
    cout << i << " ";
}
int n = 0;
while (n < 3) { n++; }
do { n--; } while (n > 0);`, note: "`do-while` виконується хоча б один раз." },
    { t: "Цикл за діапазоном", code: raw`int a[] = {1, 2, 3};
for (int x : a) {
    cout << x << " ";
}`, note: "Запис `for (тип x : колекція)` перебирає елементи по черзі." },
  ] },
  { t: "Масиви й вектори", items: [
    { t: "Масив", code: raw`int a[5] = {1, 2, 3};     // решта нулі
a[3] = 10;
cout << a[0] + a[3];`, note: "Індексація з нуля. Вихід за межі масиву це небезпечна помилка." },
    { t: "vector", code: raw`#include <vector>
#include <algorithm>

vector<int> v = {3, 1, 2};
v.push_back(5);
sort(v.begin(), v.end());
cout << v.size() << " " << v[0];`, note: "`vector` це масив змінного розміру." },
  ] },
  { t: "Функції", items: [
    { t: "Оголошення й виклик", code: raw`int add(int a, int b) {
    return a + b;
}

void hello(string name) {
    cout << "Привіт, " << name << endl;
}`, note: "Функцію потрібно оголосити до того, як її викликають." },
    { t: "Передача за посиланням", code: raw`void inc(int &x) {
    x++;
}

int n = 5;
inc(n);          // n == 6`, note: "`&` передає саму змінну, а не копію." },
  ] },
  { t: "Рядки", items: [
    { t: "string", code: raw`string s = "C++";
cout << s.length() << s[0] << s.substr(1) << endl;
s += " 17";
cout << (s == "C++ 17") << endl;`, note: "Рядки можна порівнювати через `==` і склеювати через `+`." },
  ] },
  { t: "Класи", items: [
    { t: "Клас і конструктор", code: raw`class Dog {
public:
    Dog(string n) : name(n) {}
    string speak() { return name + ": гав!"; }
private:
    string name;
};

Dog rex("Рекс");
cout << rex.speak();`, note: "Поля краще робити `private`, а доступ давати через методи в секції `public`." },
  ] },
  { t: "Вказівники", items: [
    { t: "Адреса й значення", code: raw`int x = 10;
int *p = &x;       // p зберігає адресу x
*p = 20;           // x тепер 20
cout << x << " " << *p;`, note: "`&` бере адресу, `*` дістає значення за адресою." },
  ] },
];
