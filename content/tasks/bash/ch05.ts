// Практичні завдання глави «Масиви й асоціативні масиви» (уроки 36–43). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base, sh } from "./base.ts";

export const TASKS_05: readonly RemoteTask[] = [
  {
    ...base, id: "bash-array-basic", lesson: "bash/36", xp: 15,
    title: "Масив: читання й додавання елемента",
    context: "Масив зберігає список значень під одним іменем, а доступ іде за номером із нуля. Від'ємні індекси рахують з кінця, а присвоєння за новим індексом додає елемент у кінець.",
    brief: [
      "Для масиву <code>fruits=(apple banana cherry)</code> виведіть перший елемент (<code>${fruits[0]}</code>) і останній через від'ємний індекс (<code>${fruits[-1]}</code>).",
      "Потім додайте <code>fruits[3]=date</code> і ще раз виведіть останній елемент. Має вийти <code>apple</code>, <code>cherry</code>, <code>date</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
fruits=(apple banana cherry)

# TODO 1: виведіть перший і останній (через [-1]) елементи
# TODO 2: fruits[3]=date, і знову виведіть останній
`,
    checks: [
      { on: "stdout", name: "Перший і останній елементи", has: "apple\ncherry", hint: "echo \"${fruits[0]}\" і echo \"${fruits[-1]}\": від'ємний індекс рахує з кінця." },
      { on: "stdout", name: "Після додавання останній — date", equals: "apple\ncherry\ndate", hint: "fruits[3]=date додає четвертий елемент, і [-1] тепер вказує на нього." },
      { on: "source", name: "Читання з фігурними дужками", matches: "\\$\\{fruits\\[0\\]\\}", hint: "Елемент масиву читають у повній формі: ${fruits[0]}." },
      { on: "source", name: "Від'ємний індекс", matches: "\\[-1\\]", hint: "Останній елемент: ${fruits[-1]}." },
    ],
  },
  {
    ...base, id: "bash-array-all", lesson: "bash/37", xp: 20,
    title: "Усі елементи: довжина, лапки й з'єднання",
    context: "Щоб передати чи вивести весь масив без втрати елементів із пробілами, треба знати запис із @ і лапками. Довжина, окремі дужки навколо кожного елемента й з'єднання через кому показують різні грані одного масиву.",
    brief: [
      "Масив <code>names</code> містить три імена, два з яких мають пробіл. Виведіть: кількість елементів, потім кожен елемент у квадратних дужках (<code>printf '[%s]\\n' \"${names[@]}\"</code>) і наприкінці всі імена через кому одним рядком (<code>IFS=,</code> і <code>\"${names[*]}\"</code> у підоболонці).",
    ],
    starter: sh`#!/usr/bin/env bash
names=("Олена Коваль" Богдан "Ірина Мельник")

# TODO 1: кількість елементів
# TODO 2: кожен елемент у дужках: printf '[%s]\n' "\${names[@]}"
# TODO 3: усі імена через кому: ( IFS=,; echo "\${names[*]}" )
`,
    checks: [
      { on: "stdout", name: "Елементів три", has: "3\n[Олена Коваль]", hint: "${#names[@]} дає кількість елементів, а не слів." },
      { on: "stdout", name: "Імена з пробілами цілі", has: "[Олена Коваль]\n[Богдан]\n[Ірина Мельник]", hint: "Лапки навколо \"${names[@]}\" зберігають кожен елемент окремим словом." },
      { on: "stdout", name: "Рівно п'ять рядків", equals: "3\n[Олена Коваль]\n[Богдан]\n[Ірина Мельник]\nОлена Коваль,Богдан,Ірина Мельник", hint: "Порядок: кількість, три рядки в дужках, рядок через кому." },
      { on: "source", name: "Довжина через ${#names[@]}", matches: "\\$\\{#names\\[@\\]\\}", hint: "Кількість елементів: ${#names[@]}." },
      { on: "source", name: "З'єднання через IFS і [*]", matches: "IFS=,[\\s\\S]*\\[\\*\\]", hint: "Для рядка через кому: ( IFS=,; echo \"${names[*]}\" )." },
    ],
  },
  {
    ...base, id: "bash-array-modify", lesson: "bash/38", xp: 20,
    title: "Додавання, видалення й зрізи",
    context: "Масив можна нарощувати оператором +=, зменшувати через unset і різати зрізами. Після видалення в нумерації лишається дірка, і її закривають перестворенням масиву.",
    brief: [
      "У масив <code>a=(a b c d e)</code> допишіть <code>f g</code> через <code>+=</code>, видаліть елемент з індексом 1 (<code>unset 'a[1]'</code>) і перенумеруйте масив (<code>a=(\"${a[@]}\")</code>).",
      "Виведіть всі елементи, потім список індексів і два останні елементи зрізом <code>${a[@]: -2}</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
a=(a b c d e)

# TODO 1: a+=(f g)
# TODO 2: unset 'a[1]' і перенумерація a=("\${a[@]}")
# TODO 3: echo "\${a[*]}"; echo "\${!a[@]}"; echo "\${a[@]: -2}"
`,
    checks: [
      { on: "stdout", name: "Елемент b видалено, f і g додано", has: "a c d e f g", hint: "Спершу a+=(f g), потім unset 'a[1]' (у лапках)." },
      { on: "stdout", name: "Індекси перенумеровано з нуля", has: "0 1 2 3 4 5", hint: "Без a=(\"${a[@]}\") індекс 1 лишився б дірою." },
      { on: "stdout", name: "Рівно три рядки", equals: "a c d e f g\n0 1 2 3 4 5\nf g", hint: "Порядок: усі елементи, індекси, два останні." },
      { on: "source", name: "Додавання через +=", matches: "a\\+=\\(", hint: "Дописати елементи: a+=(f g)." },
      { on: "source", name: "Зріз із пробілом перед мінусом", matches: "\\$\\{a\\[@\\]: -2\\}", hint: "Два останні: ${a[@]: -2} (пробіл перед -2 обов'язковий)." },
    ],
  },
  {
    ...base, id: "bash-array-loop", lesson: "bash/39", xp: 20,
    title: "Цикл по масиву: сума, максимум і фільтр",
    context: "Прохід по масиву дозволяє за один цикл порахувати суму, знайти найбільше й зібрати підходящі елементи. Вхідні дані лишаються в масиві, а результат — у змінних та новому масиві.",
    brief: [
      "Для <code>nums=(5 12 7 3 4)</code> за один прохід порахуйте суму, знайдіть максимум і зберіть у масив <code>big</code> числа, більші за 5.",
      "Виведіть <code>сума: 31</code>, <code>максимум: 12</code> та <code>більші за 5: 12 7</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
nums=(5 12 7 3 4)
sum=0
max=\${nums[0]}
big=()

# TODO: for n in "\${nums[@]}": додайте до sum, оновіть max, збирайте n > 5 у big
echo "сума: $sum"
echo "максимум: $max"
echo "більші за 5: \${big[*]}"
`,
    checks: [
      { on: "stdout", name: "Сума 31", has: "сума: 31", hint: "(( sum += n )) у циклі по \"${nums[@]}\"." },
      { on: "stdout", name: "Максимум 12", has: "максимум: 12", hint: "(( n > max )) && max=$n." },
      { on: "stdout", name: "Фільтр і підсумок", equals: "сума: 31\nмаксимум: 12\nбільші за 5: 12 7", hint: "big+=(\"$n\") для кожного n, більшого за 5." },
      { on: "source", name: "Прохід по значеннях у лапках", matches: "for\\s+\\w+\\s+in\\s+\"\\$\\{nums\\[@\\]\\}\"", hint: "Цикл: for n in \"${nums[@]}\"; do ... done." },
    ],
  },
  {
    ...base, id: "bash-mapfile", lesson: "bash/40", xp: 20,
    title: "mapfile і глоб: масиви з даних",
    context: "Рядки тексту краще збирати в масив через mapfile, а список файлів — глобом, а не розбором виводу ls. Обидва способи зберігають елементи цілими, навіть із пробілами в іменах.",
    brief: [
      "Рядок <code>text</code> містить три рядки. Прочитайте їх у масив <code>lines</code> командою <code>mapfile -t lines &lt;&lt;&lt; \"$text\"</code> і виведіть кількість рядків та останній рядок (<code>${lines[-1]}</code>).",
      "Потім у тимчасовій папці створіть файли <code>a.txt</code>, <code>my notes.txt</code> і <code>b.csv</code>, зберіть <code>.txt</code>-файли глобом у масив <code>txt=(*.txt)</code> і виведіть їх кількість.",
    ],
    starter: sh`#!/usr/bin/env bash
text="перший рядок
другий рядок
третій рядок"

# TODO 1: mapfile -t lines <<< "$text"; виведіть кількість рядків і останній рядок

work=$(mktemp -d)
cd "$work"
touch a.txt "my notes.txt" b.csv
# TODO 2: shopt -s nullglob; txt=(*.txt); виведіть кількість
`,
    checks: [
      { on: "stdout", name: "Три рядки й останній", has: "3\nтретій рядок", hint: "mapfile -t кладе кожен рядок в елемент; ${#lines[@]} і ${lines[-1]}." },
      { on: "stdout", name: "Два .txt-файли, зокрема з пробілом", equals: "3\nтретій рядок\n2", hint: "txt=(*.txt) знаходить a.txt і my notes.txt; ${#txt[@]} дає 2." },
      { on: "source", name: "Використано mapfile -t", matches: "mapfile\\s+-t", hint: "Рядки в масив: mapfile -t lines <<< \"$text\"." },
      { on: "source", name: "Файли зібрано глобом", matches: "\\(\\*\\.txt\\)", hint: "Список файлів: txt=(*.txt)." },
    ],
  },
  {
    ...base, id: "bash-assoc", lesson: "bash/41", xp: 20,
    title: "Асоціативний масив: столиці",
    context: "Словник «ключ — значення» потрібен там, де дані описуються парами. Ключі асоціативного масиву не мають гарантованого порядку, тож перед виводом їх сортують, а наявність ключа перевіряють окремо.",
    brief: [
      "Оголосіть <code>declare -A capital</code> і задайте <code>France=Paris</code>, <code>Poland=Warsaw</code>, <code>Ukraine=Kyiv</code>.",
      "Виведіть пари <code>ключ: значення</code> у відсортованому за ключами порядку, потім <code>записів: 3</code> і <code>Spain немає</code> (перевірка <code>[[ -v capital[Spain] ]]</code>).",
    ],
    starter: sh`#!/usr/bin/env bash
# TODO 1: declare -A capital і три записи
# TODO 2: for k in $(printf '%s\n' "\${!capital[@]}" | sort); do echo "$k: \${capital[$k]}"; done
# TODO 3: echo "записів: ..."; [[ -v capital[Spain] ]] || echo "Spain немає"
`,
    checks: [
      { on: "stdout", name: "Пари за алфавітом ключів", has: "France: Paris\nPoland: Warsaw\nUkraine: Kyiv", hint: "Ключі беріть із sort: порядок у асоціативного масиву не гарантований." },
      { on: "stdout", name: "Кількість і відсутній ключ", equals: "France: Paris\nPoland: Warsaw\nUkraine: Kyiv\nзаписів: 3\nSpain немає", hint: "${#capital[@]} дає кількість записів, а [[ -v capital[Spain] ]] перевіряє ключ." },
      { on: "source", name: "Масив оголошено через declare -A", matches: "declare\\s+-A\\s+capital", hint: "Без declare -A ключі-слова перетворилися б на числа." },
      { on: "source", name: "Перевірка ключа через -v", matches: "-v\\s+capital\\[", hint: "Наявність ключа: [[ -v capital[Spain] ]]." },
    ],
  },
  {
    ...base, id: "bash-word-frequency", lesson: "bash/42", xp: 25,
    title: "Частотний словник слів",
    context: "Підрахунок, скільки разів зустрівся кожен елемент, зводиться до одного лічильника на ключ. Щоб вивід був стабільним, слова з однаковою частотою сортують за алфавітом.",
    brief: [
      "Для тексту <code>to be or not to be</code> порахуйте слова в асоціативному масиві (<code>(( count[$word]++ ))</code>).",
      "Виведіть пари <code>кількість слово</code>, відсортовані за кількістю за спаданням, а за рівної кількості за алфавітом: <code>LC_ALL=C sort -k1,1nr -k2</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
text="to be or not to be"
declare -A count

# TODO 1: for word in $text; do (( count[$word]++ )); done
# TODO 2: for w in "\${!count[@]}"; do echo "\${count[$w]} $w"; done | LC_ALL=C sort -k1,1nr -k2
`,
    checks: [
      { on: "stdout", name: "Найчастіші слова першими", has: "2 be\n2 to", hint: "-k1,1nr сортує за кількістю за спаданням, -k2 розставляє однакові за алфавітом." },
      { on: "stdout", name: "Повний впорядкований список", equals: "2 be\n2 to\n1 not\n1 or", hint: "Усього чотири різні слова: be, to, not, or." },
      { on: "source", name: "Лічильник (( count[$word]++ ))", matches: "\\(\\(\\s*count\\[", hint: "(( count[$word]++ )) створює ключ і збільшує його." },
      { on: "source", name: "Сортування з LC_ALL=C", matches: "LC_ALL=C\\s+sort", hint: "LC_ALL=C sort -k1,1nr -k2 дає передбачуваний порядок." },
    ],
  },
  {
    ...base, id: "bash-array-function", lesson: "bash/43", xp: 25,
    title: "Масиви й функції: пошук і доповнення",
    context: "Масив у функцію передають розгорнутим, а щоб функція змінила оригінал, їй передають його ім'я й користуються посиланням local -n. Обидва прийоми потрібні в бібліотеках утиліт.",
    brief: [
      "Допишіть <code>longest</code>: друкує найдовше з переданих слів (довжина через <code>${#w}</code>). Для <code>kiwi banana fig</code> має вийти <code>banana</code>.",
      "Допишіть <code>append_to</code>: через <code>local -n</code> додає другий аргумент у масив, ім'я якого передано першим. Після <code>append_to list c</code> для <code>list=(a b)</code> має вийти <code>a b c</code>.",
    ],
    starter: sh`#!/usr/bin/env bash
longest() {
  # TODO: надрукувати найдовше слово з "$@"
  echo "?"
}
append_to() {
  # TODO: local -n _arr=$1; додати $2
  :
}

words=(kiwi banana fig)
longest "\${words[@]}"

list=(a b)
append_to list c
echo "\${list[*]}"
`,
    checks: [
      { on: "stdout", name: "Найдовше слово", has: "banana", hint: "Порівнюйте довжини: (( ${#w} > ${#best} )) && best=$w." },
      { on: "stdout", name: "Масив доповнено на місці", equals: "banana\na b c", hint: "local -n _arr=$1; _arr+=(\"$2\") змінює масив викликача." },
      { on: "source", name: "Використано local -n", matches: "local\\s+-n", hint: "Посилання на масив за іменем: local -n _arr=$1." },
    ],
  },
];
