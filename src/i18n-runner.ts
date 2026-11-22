// Англійські версії службових повідомлень раннера (вивід тестів і перевірок), які пишуться українською в src/runner/*.
// Потрібні для англійського демо на лендингу; завдання курсів лишаються українськими, тож ядро раннера не змінюємо.
const RULES: readonly [RegExp, string][] = [
  [/^очікувалось ≈ ([\s\S]*), отримано ([\s\S]*)$/, "expected ≈ $1, got $2"],
  [/^очікувалось істинне значення, отримано ([\s\S]*)$/, "expected a truthy value, got $1"],
  [/^очікувалось хибне значення, отримано ([\s\S]*)$/, "expected a falsy value, got $1"],
  [/^очікувалась довжина ([\s\S]*), отримано ([\s\S]*)$/, "expected length $1, got $2"],
  [/^очікувалось повідомлення, що містить ([\s\S]*), отримано ([\s\S]*)$/, "expected a message containing $1, got $2"],
  [/^очікувалось ([\s\S]*), отримано ([\s\S]*)$/, "expected $1, got $2"],
  [/^значення не мало дорівнювати ([\s\S]*)$/, "the value should not equal $1"],
  [/^значення не мало бути ([\s\S]*)$/, "the value should not be $1"],
  [/^([\s\S]*) має містити ([\s\S]*)$/, "$1 should contain $2"],
  [/^функція не кинула помилку$/, "the function did not throw an error"],
  [/^Тест не завершився за (\d+) мс$/, "The test did not finish within $1 ms"],
  [/^Синтаксична помилка: ([\s\S]*)$/, "Syntax error: $1"],
  [/^Помилка виконання: ([\s\S]*)$/, "Runtime error: $1"],
  [/^Перевищено час виконання\. Імовірно, у коді нескінченний цикл\.$/, "Time limit exceeded. The code probably has an infinite loop."],
  [/^Цей браузер не дозволяє запускати код у безпечному режимі$/, "This browser does not allow running code in safe mode"],
  [/^елемент «(.*)» не знайдено$/, "element “$1” not found"],
  [/^у «(.*)» немає тексту «(.*)»$/, "“$1” does not contain the text “$2”"],
  [/^у «(.*)» немає потрібного атрибута (.*)$/, "“$1” has no required attribute $2"],
  [/^знайдено (\d+), потрібно ([\s\S]*)$/, "found $1, expected $2"],
  [/^у коді не знайдено потрібної конструкції$/, "the required construct was not found in the code"],
  [/^перевірку описано неправильно.*$/, "the check is described incorrectly"],
  [/^не виконано$/, "not met"],
  [/^очікувалось: ([\s\S]*)\n    отримано:   ([\s\S]*)$/, "expected: $1\n    got:      $2"],
  [/^у виводі немає «(.*)»$/, "the output does not contain “$1”"],
  [/^код завершення (\d+)$/, "exit code $1"],
  [/^Немає зв'язку з сервером запуску\. Перевірте інтернет і спробуйте ще раз\.$/, "No connection to the run server. Check your internet and try again."],
  [/^Забагато запусків поспіль\. Зачекайте хвилину й спробуйте знову\.$/, "Too many runs in a row. Wait a minute and try again."],
  [/^Сервіс запуску тимчасово недоступний\. Спробуйте за хвилину\.$/, "The run service is temporarily unavailable. Try again in a minute."],
  [/^Не вдалося запустити код \(помилка (\d+)\)\. Спробуйте ще раз\.$/, "Could not run the code (error $1). Try again."],
];

/** Переклад службового повідомлення раннера англійською (невідомі рядки, наприклад тексти помилок рушія, лишаються як є) */
export function enResult(msg: string): string {
  for (const [re, to] of RULES) if (re.test(msg)) return msg.replace(re, to).replace(/\[функція\]/g, "[function]").replace(/\(порожньо\)/g, "(empty)");
  return msg.replace(/\[функція\]/g, "[function]");
}
