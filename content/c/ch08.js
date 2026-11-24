export const LESSONS_08 = [
  {
    t: "stdio: файли, fopen і fclose",
    ch: "Стандартна бібліотека",
    easy: "Файл у C схожий на стрічку магнітофона з бігунком: ви відкриваєте її, читаєте чи записуєте байти там, де стоїть бігунок, і обов'язково закриваєте. Незакрита стрічка тримає зайнятим магнітофон і може втратити останній запис.",
    p: [
      "Програма, що не вміє зберігати дані, живе лише до закриття вікна. Бібліотека <code>&lt;stdio.h&gt;</code> дає єдиний спосіб працювати з файлами, терміналом і навіть шматком пам'яті: <b>потік</b> (stream). Потік це послідовність байтів із поточною позицією. Читаєте ви з файлу чи з клавіатури, код однаковий, тому <code>fgetc</code>, <code>fprintf</code> і <code>fclose</code> працюють з усім, що має вигляд потоку.",
      "У C потік представляє структура <code>FILE</code>. Її створює бібліотека (<code>fopen</code>, <code>tmpfile</code>), а у вашому коді живе лише вказівник <code>FILE *</code>. Всередині лежать позиція, буфер і два прапорці: помилка (<code>ferror</code>) та кінець даних (<code>feof</code>). Структуру не копіюють і не оголошують самі: передавайте лише вказівник. Три потоки готові від початку: <code>stdin</code>, <code>stdout</code>, <code>stderr</code>, а <code>printf(...)</code> це просто <code>fprintf(stdout, ...)</code>.",
      "Головне в моделі це <b>буфер</b>. Коли ви пишете байт, він спершу потрапляє в блок пам'яті на купі, а до носія іде порціями: коли буфер заповнився, після <code>fflush</code>, при <code>fclose</code> і при нормальному завершенні програми. Файли буферизуються повністю, <code>stdout</code> у терміналі построково, <code>stderr</code> без буфера. Тому аварія (<code>abort</code>, збій) без <code>fflush</code> губить хвіст запису: він ще лежав у пам'яті, а не на диску.",
      "<code>fopen(шлях, режим)</code> повертає <code>FILE *</code> або <code>NULL</code>. Режими: <code>\"r\"</code> читання (файл мусить існувати), <code>\"w\"</code> запис (файл створюється або <b>обнуляється</b>), <code>\"a\"</code> дописування в кінець. Плюс додає другий напрямок: <code>\"r+\"</code>, <code>\"w+\"</code>, <code>\"a+\"</code>. Літера <code>b</code> (<code>\"rb\"</code>) означає двійковий режим; на Linux різниці немає, у Windows вона є. Між читанням і записом в одному потоці потрібен <code>fflush</code>, <code>fseek</code> або <code>rewind</code>, такого вимагає стандарт C11.",
      "У цьому курсі шляхів немає, тому працюємо з потоками, які не потребують імені. <code>tmpfile()</code> створює тимчасовий файл у режимі <code>\"wb+\"</code>, що зникає після <code>fclose</code>. <code>fmemopen</code> показує шматок пам'яті як файл, а <code>open_memstream</code> збирає записане в буфер, який видає через <code>char **</code> і який потім треба звільнити через <code>free</code>. Дві останні функції з POSIX, тож з <code>-std=c11</code> перед усіма <code>#include</code> потрібен <code>#define _POSIX_C_SOURCE 200809L</code>. Реальні шляхи показуємо у блоках <code>// фрагмент:</code>.",
      "Закон один: кожен вдалий <code>fopen</code> закінчується одним <code>fclose</code> на всіх шляхах виходу. <code>fclose</code> скидає буфер, повертає пам'ять структури <code>FILE</code> і дескриптор системі. Забули, і це витік, який бачить LeakSanitizer, плюс ліміт відкритих файлів у процесі. Для файлу, у який писали, перевіряйте і результат <code>fclose</code>: помилка запису часто з'являється саме при скиданні буфера. Після <code>fclose</code> вказівник висить, користуватися ним вже не можна.",
      "Читання байтів робить <code>fgetc</code>, що повертає <code>int</code>, а не <code>char</code>: поруч з 256 значеннями байта потрібне ще одне, <code>EOF</code>. Класичний цикл: <code>while ((c = fgetc(f)) != EOF)</code>. Після виходу з циклу <code>feof</code> і <code>ferror</code> розрізняють, чи дані скінчилися, чи сталася помилка. Далі навчимося читати цілими рядками й форматувати запис.",
    ],
    code: [
      String.raw`#include <stdio.h>

int main(void) {
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    fputs("abc\n", f);
    fputc('Z', f);
    rewind(f);
    int c;
    int count = 0;
    while ((c = fgetc(f)) != EOF) {
        count++;
    }
    printf("прочитано байтів: %d\n", count);
    fclose(f);
    return 0;
}`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>

int main(void) {
    char data[] = "10 20 30";
    FILE *in = fmemopen(data, sizeof data - 1, "r");
    if (in == NULL) {
        return 1;
    }
    int a = 0, b = 0, c = 0;
    int n = fscanf(in, "%d %d %d", &a, &b, &c);
    printf("прочитано значень: %d, сума %d\n", n, a + b + c);
    printf("кінець даних: %s\n", feof(in) ? "так" : "ні");
    fclose(in);
    return 0;
}`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    char *text = NULL;
    size_t size = 0;
    FILE *out = open_memstream(&text, &size);
    if (out == NULL) {
        return 1;
    }
    for (int i = 1; i <= 3; i++) {
        fprintf(out, "рядок %d\n", i);
    }
    fclose(out);
    printf("записано %zu байтів:\n%s", size, text);
    free(text);
    return 0;
}`,
      String.raw`// фрагмент: реальний шлях; на платформі без файлової системи fopen поверне NULL
#include <stdio.h>

int main(void) {
    FILE *f = fopen("notes.txt", "w");
    if (f == NULL) {
        printf("файл не відкрито\n");
        return 1;
    }
    fputs("перший запис\n", f);
    if (fclose(f) == EOF) {
        printf("помилка запису\n");
        return 1;
    }
    return 0;
}`,
      String.raw`// аварія: запис у потік, відкритий лише для читання, повертає EOF
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>

int main(void) {
    char data[] = "abc";
    FILE *f = fmemopen(data, 3, "r");
    if (f == NULL) {
        return 1;
    }
    if (fputc('x', f) == EOF) {
        printf("запис не вдався\n");
        fclose(f);
        return 1;
    }
    fclose(f);
    return 0;
}`,
    ],
    note: "Кожному вдалому <code>fopen</code> відповідає один <code>fclose</code>. Режим <code>\"w\"</code> стирає старий вміст, а незбережений буфер при аварії пропадає. Результат <code>fopen</code> перевіряйте завжди, бо <code>NULL</code> у <code>fgetc</code> це аварія.",
    work: "Логи, конфігурації, кеші й експорт даних усе це потоки <code>FILE *</code>. У тестах і серверах замість диска часто беруть <code>tmpfile</code> чи <code>fmemopen</code>: функція, що читає з <code>FILE *</code>, не знає, де саме лежать дані.",
    tasks: [
      "Чому <code>fgetc</code> повертає <code>int</code>, а не <code>char</code>, і що станеться з розрізненням байта 255 та <code>EOF</code>, якщо змінна <code>c</code> матиме тип <code>char</code>?",
      "Що відбувається з буфером потоку при <code>fclose</code> і до чого призводить забутий <code>fclose</code> у функції, яку викликають багато разів?",
    ],
  },
  {
    t: "Текстові файли: fgets і fprintf",
    ch: "Стандартна бібліотека",
    easy: "Текстовий файл це стос аркушів, де кожен рядок закінчується позначкою «новий рядок». Читати його найзручніше аркуш за аркушем у коробку відомого розміру, а не літера за літерою.",
    p: [
      "Рядкові дані це основа: конфігурації, журнали, CSV, відповіді команд. Читати їх по одному символу незручно, а <code>fscanf</code> крихкий. Стійка схема така: <b>прочитати рядок цілком</b> функцією <code>fgets</code>, а потім розібрати його в пам'яті через <code>sscanf</code>, <code>strtol</code> чи <code>strchr</code>. Тоді один кривий рядок не ламає розбір усього файлу.",
      "<code>fgets(буфер, розмір, потік)</code> читає не більше <code>розмір - 1</code> символів, зупиняється після <code>'\\n'</code> (він <b>лишається</b> в буфері) і завжди дописує <code>'\\0'</code>. Повертає буфер, а на кінці даних чи при помилці <code>NULL</code>. Тому цикл пишуть як <code>while (fgets(line, sizeof line, f) != NULL)</code>. Стару <code>gets</code> видалено зі стандарту C11 назавжди: вона не знала розміру буфера й була джерелом переповнень.",
      "Рядок може бути довшим за буфер. Тоді <code>fgets</code> віддає лише частину, без <code>'\\n'</code> в кінці, а решту дасть наступним викликом. Саме відсутність <code>'\\n'</code> показує, що рядок обрізано (або це останній рядок файлу без переведення). Прибрати перенесення з кінця зручно ідіомою <code>line[strcspn(line, \"\\n\")] = '\\0'</code>: вона працює і тоді, коли <code>'\\n'</code> немає.",
      "Запис робить <code>fprintf(потік, формат, ...)</code> з тими ж специфікаторами, що й <code>printf</code>, та <code>fputs(рядок, потік)</code>, що не додає перенесення. Обидві повертають помилку (від'ємне число чи <code>EOF</code>), але в навчальному коді її перевіряють рідко; у серйозному краще перевіряти <code>ferror</code> чи результат <code>fclose</code> один раз наприкінці. Щоб прочитати щойно записане, зробіть <code>rewind(f)</code>: вказівник позиції знову стає на початок.",
      "Для розбору рядка є <code>sscanf(line, \"%31s %d\", name, &amp;score)</code>. Вона повертає <b>кількість успішно прочитаних значень</b>; якщо вона менша за очікувану, рядок зіпсований. Для <code>%s</code> завжди задавайте ширину на один менше за розмір масиву: інакше довге слово переповнить його. Це надійніше, ніж <code>fscanf</code> прямо з файлу, де після помилки позиція залишається посеред даних.",
      "Найпоширеніша пастка це <code>while (!feof(f))</code>. Прапорець кінця встановлюється лише після <b>невдалої</b> спроби читання. Тож після останнього рядка <code>feof</code> ще нуль, цикл робить ще один круг, <code>fgets</code> повертає <code>NULL</code> і лишає буфер без змін, а <code>printf</code> друкує останній рядок удруге. Умовою циклу має бути результат самого читання.",
      "Ще дві пастки. POSIX-функція <code>getline</code> сама збільшує буфер під довгий рядок, але вона не входить у C11. Кодування: кирилиця в UTF-8 це байти, і <code>fgets</code> може обрізати посеред символу. Наступний урок про двійкові дані: <code>fread</code>, <code>fwrite</code> та <code>fseek</code>.",
    ],
    code: [
      String.raw`#include <stdio.h>

int main(void) {
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    fprintf(f, "%s %d\n", "Оля", 90);
    fprintf(f, "%s %d\n", "Іван", 75);
    fputs("Марія 88\n", f);
    rewind(f);
    char line[64];
    int n = 0;
    while (fgets(line, sizeof line, f) != NULL) {
        n++;
        printf("%d: %s", n, line);
    }
    fclose(f);
    return 0;
}`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <string.h>

int main(void) {
    char data[] = "ok\na very long line\nend\n";
    FILE *in = fmemopen(data, sizeof data - 1, "r");
    if (in == NULL) {
        return 1;
    }
    char buf[8];
    while (fgets(buf, sizeof buf, in) != NULL) {
        size_t len = strcspn(buf, "\n");
        int whole = buf[len] == '\n';
        buf[len] = '\0';
        printf("[%s]%s\n", buf, whole ? "" : " ...далі");
    }
    fclose(in);
    return 0;
}`,
      String.raw`#define _POSIX_C_SOURCE 200809L
#include <stdio.h>

int main(void) {
    char data[] = "Оля 90\nІван x\nМарія 88\n";
    FILE *in = fmemopen(data, sizeof data - 1, "r");
    if (in == NULL) {
        return 1;
    }
    char line[64];
    char name[32];
    int score;
    int lineno = 0;
    while (fgets(line, sizeof line, in) != NULL) {
        lineno++;
        if (sscanf(line, "%31s %d", name, &score) == 2) {
            printf("%s: %d\n", name, score);
        } else {
            printf("рядок %d пропущено\n", lineno);
        }
    }
    fclose(in);
    return 0;
}`,
      String.raw`#include <stdio.h>

int main(void) {
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    fputs("a\nb\n", f);
    rewind(f);
    char line[16] = "";
    while (!feof(f)) {
        fgets(line, sizeof line, f);
        printf("рядок: %s", line);
    }
    fclose(f);
    return 0;
}`,
      String.raw`// аварія: рядок довший за буфер без перевірки завершується кодом 1
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <string.h>

int main(void) {
    char data[] = "short\nthis line does not fit\n";
    FILE *in = fmemopen(data, sizeof data - 1, "r");
    if (in == NULL) {
        return 1;
    }
    char buf[10];
    while (fgets(buf, sizeof buf, in) != NULL) {
        if (strchr(buf, '\n') == NULL) {
            printf("рядок задовгий\n");
            fclose(in);
            return 1;
        }
        printf("ок: %s", buf);
    }
    fclose(in);
    return 0;
}`,
    ],
    note: "<code>fgets</code> лишає <code>'\\n'</code> у буфері, а відсутність його означає обрізаний рядок. Умовою циклу є <code>fgets(...) != NULL</code>, ніколи не <code>!feof</code>: прапорець кінця спрацьовує після невдалого читання.",
    work: "Конфігурації, CSV, журнали й відповіді утиліт зазвичай читають саме так: <code>fgets</code> у буфер, потім <code>sscanf</code> чи <code>strtol</code>. Кривий рядок пропускають із номером у повідомленні, а не валять усю програму.",
    tasks: [
      "Чому цикл <code>while (!feof(f))</code> з <code>fgets</code> друкує останній рядок двічі, і як записати цикл правильно?",
      "Як за результатом <code>fgets</code> і вмістом буфера дізнатися, що рядок довший за буфер, і як прибрати з нього <code>'\\n'</code>?",
    ],
  },
  {
    t: "Бінарні файли: fread, fwrite і fseek",
    ch: "Стандартна бібліотека",
    easy: "Двійковий файл це шафа з однаковими шухлядами: щоб дістати п'яту, не треба відкривати чотири попередні, досить порахувати відстань від початку. Текст же схожий на довгий сувій, який розгортають із першого рядка.",
    p: [
      "Текст зручний людині, але витратний: число 2000000000 у файлі це десять символів, а в пам'яті чотири байти. Двійковий файл зберігає байти <b>так, як вони лежать у пам'яті</b>: швидко, компактно й з доступом за номером запису. Так влаштовані зображення, архіви, індекси баз даних і збереження ігор.",
      "<code>fwrite(вказівник, розмір_елемента, кількість, потік)</code> записує <code>кількість</code> елементів по <code>розмір_елемента</code> байтів, а <code>fread</code> читає їх у зворотний бік. Обидві повертають кількість <b>елементів</b>, не байтів. Якщо вийшло менше, ніж просили, то або дані скінчилися (<code>feof</code>), або сталася помилка (<code>ferror</code>). Порівнюйте результат із очікуваним завжди: короткий <code>fread</code> лишає частину масиву не заповненою.",
      "Що саме записувати? Лише дані без адрес: вказівник у файлі безглуздий, бо в наступному запуску об'єкт буде в іншому місці. Для переносності беріть типи фіксованого розміру з <code>&lt;stdint.h&gt;</code> (<code>int32_t</code> замість <code>int</code>). Структуру можна писати цілою, але компілятор вставляє між полями байти вирівнювання (padding), а порядок байтів (little- чи big-endian) залежить від процесора. Файл, записаний на одній платформі, на іншій може прочитатися неправильно. Страхуйтесь <code>_Static_assert(sizeof(struct rec) == 8, ...)</code>.",
      "Позицією керують <code>fseek(потік, зсув, звідки)</code>: <code>SEEK_SET</code> від початку, <code>SEEK_CUR</code> від поточного місця, <code>SEEK_END</code> від кінця. Повертає <code>0</code> при успіху. <code>ftell</code> каже поточну позицію в байтах, <code>rewind</code> повертає на початок. Розмір файлу знаходять так: <code>fseek(f, 0, SEEK_END)</code>, потім <code>ftell(f)</code>. Для двійкових потоків стандарт не гарантує підтримку <code>SEEK_END</code> на будь-яких носіях, але для звичайних файлів і <code>tmpfile</code> вона працює.",
      "Сила моделі у <b>записах фіксованого розміру</b>. Запис із номером <code>i</code> лежить за зсувом <code>i * sizeof(struct rec)</code>, тому <code>fseek</code> веде туди напряму, а решту файлу не читаємо. Оновлення на місці це <code>fseek</code> на запис і <code>fwrite</code>. Пам'ятайте правило з уроку 68: між читанням і записом в одному потоці потрібен <code>fseek</code> (чи <code>fflush</code>), навіть коли ви стоїте на потрібному місці.",
      "Пастки. Перша, переплутані аргументи: <code>fwrite(arr, sizeof arr, f)</code> без кількості не збереться. Друга, розмір і кількість у різному порядку: <code>fread(buf, 1, n, f)</code> повертає байти, <code>fread(buf, n, 1, f)</code> повертає лише <code>0</code> або <code>1</code>, і при коротких даних ви не дізнаєтеся, скільки прочитано. Третя, <code>fseek</code> у текстовому режимі: приймає лише значення, повернуті <code>ftell</code>. Четверта, запис «сирої» структури з вирівнюванням: у файл потрапляє сміття, і два однакових запити дають різні файли.",
      "Наступний урок про <code>&lt;stdlib.h&gt;</code>: перетворення рядків у числа й коректне завершення програми.",
    ],
    code: [
      String.raw`#include <stdint.h>
#include <stdio.h>

int main(void) {
    int32_t out[4] = {10, 20, 30, 40};
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    size_t w = fwrite(out, sizeof out[0], 4, f);
    printf("записано елементів: %zu\n", w);
    rewind(f);
    int32_t in[4] = {0};
    size_t r = fread(in, sizeof in[0], 4, f);
    printf("прочитано елементів: %zu, третій = %d\n", r, (int)in[2]);
    fclose(f);
    return 0;
}`,
      String.raw`#include <stdint.h>
#include <stdio.h>

struct rec {
    int32_t id;
    int32_t score;
};

_Static_assert(sizeof(struct rec) == 8, "у записі не має бути вирівнювання");

int main(void) {
    struct rec all[3] = {{1, 50}, {2, 60}, {3, 70}};
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    fwrite(all, sizeof all[0], 3, f);
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    printf("розмір: %ld байтів, записів: %ld\n", size, size / (long)sizeof(struct rec));
    fseek(f, 1 * (long)sizeof(struct rec), SEEK_SET);
    struct rec one;
    if (fread(&one, sizeof one, 1, f) == 1) {
        printf("запис 1: id=%d score=%d\n", (int)one.id, (int)one.score);
    }
    fclose(f);
    return 0;
}`,
      String.raw`#include <stdio.h>

int main(void) {
    char letters[] = "ABCDEFGHIJ";
    FILE *f = tmpfile();
    if (f == NULL) {
        return 1;
    }
    fwrite(letters, 1, 10, f);
    char tail[4] = "";
    fseek(f, -3, SEEK_END);
    size_t n = fread(tail, 1, 3, f);
    printf("останні %zu байти: %s\n", n, tail);
    fseek(f, 2, SEEK_SET);
    fseek(f, 3, SEEK_CUR);
    printf("позиція %ld, байт %c\n", ftell(f), fgetc(f));
    fclose(f);
    return 0;
}`,
      String.raw`// не компілюється: у fwrite пропущено кількість елементів
#include <stdio.h>

int main(void) {
    int out[2] = {1, 2};
    FILE *f = tmpfile();
    fwrite(out, sizeof out, f);
    fclose(f);
    return 0;
}`,
      String.raw`// фрагмент: структура з вирівнюванням, запис цілою небезпечний для переносності
#include <stdint.h>
#include <stdio.h>

struct bad {
    char tag;
    int32_t value;
};

void save(FILE *f, char tag, int32_t value) {
    struct bad b = {tag, value};
    fwrite(&b, sizeof b, 1, f);
    fputc(b.tag, f);
    fwrite(&b.value, sizeof b.value, 1, f);
}`,
    ],
    note: "<code>fread</code> і <code>fwrite</code> повертають кількість елементів, а не байтів, тож порівнюйте її з очікуваною. Пишіть типи фіксованого розміру, а не вказівники, і ставте <code>fseek</code> між читанням і записом в одному потоці.",
    work: "Збереження ігор, індекси баз, формати зображень, кеші й протоколи це записи фіксованого розміру, до яких потрапляють через <code>fseek</code> за номером. Переносність файлу між платформами забезпечують <code>stdint.h</code> і явний порядок байтів.",
    tasks: [
      "Що повертають <code>fread</code> і <code>fwrite</code>, і чим відрізняються <code>fread(buf, 1, n, f)</code> та <code>fread(buf, n, 1, f)</code> при короткому файлі?",
      "Чому запис цілої структури через <code>fwrite</code> непереносний між платформами, і як обчислити зсув запису з номером <code>i</code>?",
    ],
  },
  {
    t: "stdlib: strtol, abs, exit і atexit",
    ch: "Стандартна бібліотека",
    easy: "stdlib це ящик із інструментами на всі випадки: перетворити текст на число, взяти модуль, поділити з остачею й чемно вийти з будинку, вимкнувши світло за собою. Окремі інструменти прості, але кожен має свій підступ.",
    p: [
      "Заголовок <code>&lt;stdlib.h&gt;</code> зібрав усе, що не вписалося в інші теми: пам'ять (<code>malloc</code>, <code>free</code>), сортування (<code>qsort</code>), псевдовипадкові числа, а ще перетворення рядків, цілу арифметику й завершення програми. Тут розберемо три останні групи; пам'ять уже була в главі про купу, а <code>rand</code> чекає в уроці 76.",
      "Сімейство <code>strtol</code>, <code>strtoul</code>, <code>strtoll</code>, <code>strtod</code> перетворює початок рядка на число й через <code>endptr</code> каже, де зупинилося. Про перевірку <code>errno</code> і <code>endptr</code> ми говорили в главі про помилки; нове тут <b>основа</b>: <code>strtol(s, &amp;end, 16)</code> читає шістнадцяткове, <code>2</code> двійкове. Основа <code>0</code> вмикає автовизначення: <code>0x1F</code> це 31, а <code>017</code> це <b>вісімкове</b> 15. Початкові пробіли й знак розпізнаються. Будьте обережні зі <code>strtoul</code>: рядок <code>\"-1\"</code> вона приймає й повертає <code>ULONG_MAX</code>.",
      "Родичі <code>atoi</code> та <code>atof</code> здаються коротшими, але <b>не вміють повідомляти про помилку</b>: <code>atoi(\"abc\")</code> дає <code>0</code>, так само як і <code>atoi(\"0\")</code>, а при переповненні поведінка не визначена. Користуйтеся ними хіба що для тексту, у правильності якого ви впевнені, а вхід ззовні розбирайте через <code>strtol</code>.",
      "Модуль числа: <code>abs</code> для <code>int</code>, <code>labs</code> для <code>long</code>, <code>llabs</code> для <code>long long</code> (для дробів <code>fabs</code> з <code>math.h</code>). Підступ: <code>abs(INT_MIN)</code> це невизначена поведінка, бо в <code>int</code> немає значення <code>+2147483648</code>. Функція <code>div(a, b)</code> повертає структуру <code>div_t</code> з полями <code>quot</code> і <code>rem</code>. З C99 ділення <b>усікає до нуля</b>, тому <code>-7 / 2</code> дає <code>-3</code>, а <code>-7 % 2</code> дає <code>-1</code>: знак остачі збігається зі знаком діленого. Ділення на нуль це UB.",
      "Завершення. <code>return n</code> із <code>main</code> рівнозначний <code>exit(n)</code>. Виклик <code>exit(статус)</code> виконує зареєстровані <code>atexit</code>-обробники у <b>зворотному порядку</b> (останній зареєстрований іде першим), скидає й закриває всі потоки stdio (<code>tmpfile</code> теж зникає) і повертає статус системі. Використовуйте макроси <code>EXIT_SUCCESS</code> і <code>EXIT_FAILURE</code>. Є й брутальні виходи: <code>_Exit(n)</code> завершує негайно, без обробників і скидання буферів, а <code>abort()</code> валить процес сигналом.",
      "<code>atexit(void (*f)(void))</code> реєструє функцію без параметрів, яка виконається при завершенні. Гарантовано можна зареєструвати щонайменше 32 функції, результат <code>0</code> означає успіх. Обробник не бачить локальних змінних, тож він працює з глобальними чи статичними даними: закрити журнал, надрукувати підсумок. Не викликайте всередині обробника <code>exit</code> і не покладайтеся на порядок, окрім «останній зареєстрований іде першим».",
      "Типова пастка: <code>exit</code> із глибини викликів пропускає прибирання у функціях, які були на стеку, тож усе потрібне має лежати в обробниках. Далі: <code>math.h</code>.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

static void show(const char *s, int base) {
    char *end;
    long v = strtol(s, &end, base);
    printf("%s, основа %d -> %ld\n", s, base, v);
}

int main(void) {
    show("255", 10);
    show("ff", 16);
    show("0x1F", 0);
    show("017", 0);
    show("101", 2);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    printf("atoi(abc) = %d, atoi(12abc) = %d\n", atoi("abc"), atoi("12abc"));
    char *end;
    double d = strtod("3.5kg", &end);
    printf("strtod: %.1f, залишок «%s»\n", d, end);
    long v = strtol("12abc", &end, 10);
    printf("strtol: %ld, залишок «%s»\n", v, end);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    printf("abs(-5) = %d, labs(-100000) = %ld\n", abs(-5), labs(-100000L));
    div_t d = div(-7, 2);
    printf("div(-7, 2): quot=%d rem=%d\n", d.quot, d.rem);
    printf("-7 / 2 = %d, -7 %% 2 = %d\n", -7 / 2, -7 % 2);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

static void close_log(void) {
    puts("журнал закрито");
}

static void free_pool(void) {
    puts("пул звільнено");
}

int main(void) {
    atexit(close_log);
    atexit(free_pool);
    puts("працюємо");
    return 0;
}`,
      String.raw`// аварія: exit(EXIT_FAILURE) глибоко у викликах завершує програму з кодом 1
#include <stdio.h>
#include <stdlib.h>

static void bye(void) {
    puts("обробник виконано");
}

static void need(int ok) {
    if (!ok) {
        puts("критична помилка");
        exit(EXIT_FAILURE);
    }
}

int main(void) {
    atexit(bye);
    puts("початок");
    need(1);
    need(0);
    puts("недосяжний рядок");
    return 0;
}`,
    ],
    note: "<code>atoi</code> не повідомляє про помилку, <code>abs(INT_MIN)</code> це UB, а основа <code>0</code> у <code>strtol</code> читає <code>017</code> як вісімкове. Обробники <code>atexit</code> виконуються у зворотному порядку реєстрації.",
    work: "Аргументи командного рядка й змінні середовища розбирають через <code>strtol</code> із перевіркою, а критичні помилки завершують через <code>exit(EXIT_FAILURE)</code>. Закриття журналу чи скидання кешу кладуть в <code>atexit</code>, щоб це відбулося за будь-якого виходу.",
    tasks: [
      "Чому для вхідного тексту ззовні краще <code>strtol</code>, ніж <code>atoi</code>, і що дає основа <code>0</code> для рядків <code>0x1F</code> та <code>017</code>?",
      "У якому порядку виконаються обробники <code>atexit</code> і чим <code>exit</code> відрізняється від <code>_Exit</code> та <code>abort</code> щодо буферів stdio?",
    ],
  },
  {
    t: "math.h",
    ch: "Стандартна бібліотека",
    easy: "math.h це калькулятор з інженерними кнопками: корінь, степінь, округлення, тригонометрія. Але калькулятор працює з наближеними дробами, тож порівнювати його відповіді «на рівність» не можна.",
    p: [
      "Заголовок <code>&lt;math.h&gt;</code> містить функції над <code>double</code>: <code>sqrt</code>, <code>pow</code>, <code>fabs</code>, <code>fmod</code>, <code>hypot</code>, <code>sin</code>, <code>cos</code>, <code>atan2</code>, <code>exp</code>, <code>log</code>. Версії для <code>float</code> мають суфікс <code>f</code> (<code>sqrtf</code>), для <code>long double</code> суфікс <code>l</code>. Кути завжди в <b>радіанах</b>, а не в градусах.",
      "Перша особливість: функції живуть у бібліотеці <code>libm</code>, яку лінкер не підключає сам. Збірка без неї дає <code>undefined reference to 'sqrt'</code>, і треба дописати <code>-lm</code> наприкінці команди: <code>gcc main.c -lm</code>. Компілятор інколи обчислює сталі виклики ще на етапі збирання, тому помилка може не з'явитися й одразу, а вилізти пізніше. Тестер курсу вже додає <code>-lm</code>.",
      "Друга особливість: число пі. Константа <code>M_PI</code> не входить у стандарт C11, а лише в POSIX та GNU-розширення, тому з <code>-std=c11</code> вона не оголошена. Переносна ідіома: <code>const double PI = acos(-1.0);</code>. Усе інше про числа з рухомою комою: вони двійкові, тож <code>0.1 + 0.2</code> не дорівнює <code>0.3</code> точно. Порівнюють з допуском: <code>fabs(a - b) &lt; 1e-9</code>.",
      "Округлення має чотири різні функції, і на від'ємних числах вони розходяться. <code>floor</code> іде до мінус нескінченності, <code>ceil</code> до плюс нескінченності, <code>trunc</code> відкидає дробову частину (до нуля), <code>round</code> округлює до найближчого цілого, а половинки <b>від нуля</b>. Для <code>-2.5</code> вони дають -3, -2, -2, -3. Для грошей і лічильників обирайте функцію свідомо, а не «яка підвернулась».",
      "Третя особливість: <b>особливі значення</b>. Корінь з від'ємного числа це <code>NaN</code> (помилка області), <code>log(0)</code> це мінус нескінченність (помилка діапазону). Бібліотека може також виставити <code>errno</code> в <code>EDOM</code> чи <code>ERANGE</code>, але це залежить від реалізації. Надійніше перевіряти результат макросами <code>isnan</code>, <code>isinf</code> і <code>isfinite</code>. Порівняння <code>x == NAN</code> завжди хибне, навіть для самого <code>NaN</code>, тож лише <code>isnan(x)</code>.",
      "Четверта пастка: цілі числа в <code>pow</code>. Функція повертає <code>double</code>, і <code>pow(10, 2)</code> може дати 99.99999 замість 100, а перетворення в <code>int</code> усічення зробить 99. Для цілих степенів пишіть цикл, а для округленого результату користуйтеся <code>round</code> чи <code>lround</code>. Ще одна: <code>abs</code> із <code>stdlib.h</code> для <code>int</code>, а для дробів потрібна <code>fabs</code>; <code>abs(-2.5)</code> віддасть 2.",
      "Корисні дрібниці. <code>fma(x, y, z)</code> рахує <code>x * y + z</code> з одним округленням, <code>cbrt</code> дає кубічний корінь, <code>exp2</code> і <code>log2</code> працюють з основою два, <code>copysign</code> переносить знак, <code>lround</code> повертає <code>long</code> без проміжного <code>double</code>. Вони з C99 і в C11 є всюди, де є <code>libm</code>.",
      "Далі <code>ctype.h</code>: класифікація символів.",
    ],
    code: [
      String.raw`#include <math.h>
#include <stdio.h>

int main(void) {
    printf("sqrt(2) = %.4f\n", sqrt(2.0));
    printf("pow(2, 10) = %.1f\n", pow(2.0, 10.0));
    printf("hypot(3, 4) = %.1f\n", hypot(3.0, 4.0));
    printf("fabs(-7.5) = %.1f\n", fabs(-7.5));
    printf("fmod(10, 3) = %.1f\n", fmod(10.0, 3.0));
    return 0;
}`,
      String.raw`#include <math.h>
#include <stdio.h>

int main(void) {
    double v[] = {2.4, 2.5, -2.5};
    for (int i = 0; i < 3; i++) {
        printf("%4.1f: floor %.0f, ceil %.0f, round %.0f, trunc %.0f\n",
               v[i], floor(v[i]), ceil(v[i]), round(v[i]), trunc(v[i]));
    }
    return 0;
}`,
      String.raw`#include <math.h>
#include <stdio.h>

int main(void) {
    double s = 0.1 + 0.2;
    printf("0.1 + 0.2 == 0.3: %s\n", s == 0.3 ? "так" : "ні");
    printf("різниця менша за 1e-9: %s\n", fabs(s - 0.3) < 1e-9 ? "так" : "ні");
    double bad = sqrt(-1.0);
    printf("sqrt(-1) це NaN: %s\n", isnan(bad) ? "так" : "ні");
    printf("log(0) нескінченність: %s\n", isinf(log(0.0)) ? "так" : "ні");
    double pi = acos(-1.0);
    printf("пі = %.5f, sin(пі/2) = %.1f\n", pi, sin(pi / 2));
    return 0;
}`,
      String.raw`// не компілюється: M_PI не входить у стандарт C11
#include <math.h>
#include <stdio.h>

int main(void) {
    printf("%f\n", M_PI);
    return 0;
}`,
    ],
    note: "Лінкуйте <code>-lm</code>, пі беріть як <code>acos(-1.0)</code>, дроби порівнюйте з допуском, а <code>NaN</code> перевіряйте через <code>isnan</code>. На від'ємних числах <code>floor</code>, <code>trunc</code> і <code>round</code> дають різні відповіді.",
    work: "Відстані й кути в іграх, статистика, фінансові розрахунки та сигнали використовують <code>math.h</code> щодня. Типові помилки: порівняння дробів на рівність, <code>pow</code> замість цілого степеня й забутий <code>-lm</code> у Makefile.",
    tasks: [
      "Чому <code>0.1 + 0.2 == 0.3</code> у C хибне, і як правильно порівнювати числа з рухомою комою?",
      "Що повертають <code>floor</code>, <code>ceil</code>, <code>trunc</code> і <code>round</code> для <code>-2.5</code>, і чому з <code>-std=c11</code> недоступна <code>M_PI</code>?",
    ],
  },
  {
    t: "ctype.h",
    ch: "Стандартна бібліотека",
    easy: "ctype.h це контролер на вході: дивиться на кожен символ і каже, цифра це, літера, пробіл чи знак пунктуації. Але перевіряє він лише байти, а не те, що ви собі уявили під літерою.",
    p: [
      "Заголовок <code>&lt;ctype.h&gt;</code> дає функції класифікації: <code>isalpha</code>, <code>isdigit</code>, <code>isalnum</code>, <code>isspace</code>, <code>isupper</code>, <code>islower</code>, <code>ispunct</code>, <code>isxdigit</code>, і перетворення <code>toupper</code>, <code>tolower</code>. Вони потрібні скрізь, де програма розбирає текст: токенізатори, перевірка полів, підрахунок слів, шістнадцяткові числа.",
      "Функції повертають <b>ненульове значення</b> для істини (не обов'язково 1) і нуль для хибності. Тому пишіть <code>if (isdigit(c))</code>, а не <code>isdigit(c) == 1</code>. <code>toupper</code> і <code>tolower</code> повертають <code>int</code>, тож результат приводять назад: <code>(char)toupper(c)</code>. Для літери без пари (цифра, пробіл) вони повертають її саму.",
      "Найважливіше правило: аргумент типу <code>int</code> має бути <b>значенням <code>unsigned char</code> або <code>EOF</code></b>. Коли <code>char</code> знаковий, байти понад 127 стають від'ємними, і <code>isalpha(c)</code> тоді це невизначена поведінка (на практиці індекс поза таблицею). Ідіома: <code>isalpha((unsigned char)*p)</code>. Правило незручне, але чинне стандартом, і санітайзери ловлять його.",
      "Друга особливість: результат залежить від <b>локалі</b>. У локалі <code>\"C\"</code>, що діє, поки ви не викличете <code>setlocale</code>, літерами є лише латинські <code>A–Z</code> і <code>a–z</code>. Тому кирилиця, записана в UTF-8, класифікується як не-літери: кожен її символ це два байти понад 127. Для Unicode потрібні широкі символи й <code>&lt;wctype.h&gt;</code>, їх розберемо в окремому уроці.",
      "Типові ідіоми. Підрахунок слів: прапорець «усередині слова», що вмикається на не-пробілі й вимикається на пробілі. Пропуск пробілів: <code>while (isspace((unsigned char)*s)) s++;</code>. Перевірка, що рядок складається лише з цифр: цикл із <code>isdigit</code> і не порожній рядок. Значення шістнадцяткової цифри: <code>isdigit</code> дає <code>c - '0'</code>, інакше <code>tolower(c) - 'a' + 10</code>. Нарешті, обрізання пробілів з обох кінців рядка: спершу рухаємо початок уперед, поки <code>isspace</code>, потім кінець назад, поки <code>isspace</code>, і ставимо новий <code>'\\0'</code>. Усе це працює на місці, без додаткової пам'яті, і саме цим ctype відрізняється від важчих бібліотек для Unicode.",
      "Пастки. Не покладайтеся на те, що літери в таблиці символів ідуть підряд: ASCII це гарантує, але EBCDIC ні, тому <code>c - 'a'</code> для довільного алфавіту ненадійне, а для <code>isalpha</code> безпечне. Не плутайте <code>isspace</code> (пробіл, <code>\\t</code>, <code>\\n</code>, <code>\\v</code>, <code>\\f</code>, <code>\\r</code>) і порівняння з <code>' '</code>. <code>ispunct</code> істинна для будь-якого видимого символу, що не літера й не цифра.",
      "Далі <code>time.h</code>: дати й час, де знову виникає питання «залежить від середовища чи ні».",
    ],
    code: [
      String.raw`#include <ctype.h>
#include <stdio.h>

int main(void) {
    const char *s = "Hello, C11!\t42";
    int letters = 0, digits = 0, spaces = 0, punct = 0;
    for (const char *p = s; *p != '\0'; p++) {
        unsigned char c = (unsigned char)*p;
        if (isalpha(c)) {
            letters++;
        } else if (isdigit(c)) {
            digits++;
        } else if (isspace(c)) {
            spaces++;
        } else if (ispunct(c)) {
            punct++;
        }
    }
    printf("літер %d, цифр %d, пробілів %d, розділових %d\n", letters, digits, spaces, punct);
    return 0;
}`,
      String.raw`#include <ctype.h>
#include <stdio.h>

int main(void) {
    char word[] = "iteris Code";
    for (char *p = word; *p != '\0'; p++) {
        *p = (char)toupper((unsigned char)*p);
    }
    printf("%s\n", word);
    return 0;
}`,
      String.raw`#include <ctype.h>
#include <stdio.h>

int main(void) {
    const char *text = "  one two   three ";
    int words = 0;
    int inside = 0;
    for (const char *p = text; *p != '\0'; p++) {
        if (isspace((unsigned char)*p)) {
            inside = 0;
        } else if (!inside) {
            inside = 1;
            words++;
        }
    }
    printf("слів: %d\n", words);
    return 0;
}`,
      String.raw`#include <ctype.h>
#include <stdio.h>
#include <string.h>

int main(void) {
    const char *s = "Привіт";
    int letters = 0;
    for (const char *p = s; *p != '\0'; p++) {
        if (isalpha((unsigned char)*p)) {
            letters++;
        }
    }
    printf("байтів: %zu, літер за isalpha: %d\n", strlen(s), letters);
    return 0;
}`,
      String.raw`// аварія: порт містить не цифру, програма завершується з кодом 1
#include <ctype.h>
#include <stdio.h>

static int all_digits(const char *s) {
    if (*s == '\0') {
        return 0;
    }
    for (; *s != '\0'; s++) {
        if (!isdigit((unsigned char)*s)) {
            return 0;
        }
    }
    return 1;
}

int main(void) {
    const char *ports[] = {"8080", "80a"};
    for (int i = 0; i < 2; i++) {
        if (!all_digits(ports[i])) {
            printf("некоректний порт: %s\n", ports[i]);
            return 1;
        }
        printf("порт ок: %s\n", ports[i]);
    }
    return 0;
}`,
    ],
    note: "У функції ctype передавайте <code>(unsigned char)c</code>, а результат <code>toupper</code> приводьте до <code>char</code>. У локалі <code>\"C\"</code> кирилиця в UTF-8 не класифікується як літери: <code>isalpha</code> працює лише з байтами.",
    work: "Токенізатори, парсери конфігурацій, перевірки введення й лексери компіляторів стоять на <code>isdigit</code>, <code>isalpha</code> і <code>isspace</code>. Помилка з <code>char</code> без приведення довго лишається непоміченою, доки в тексті не з'явиться не-ASCII.",
    tasks: [
      "Чому в <code>isalpha</code> передають <code>(unsigned char)c</code>, і що може піти не так, коли <code>char</code> знаковий, а символ має код понад 127?",
      "Чому <code>isalpha</code> вважає кирилицю в UTF-8 не-літерами в локалі <code>\"C\"</code> і що повертають ці функції в разі істини?",
    ],
  },
  {
    t: "time.h: час без часового пояса",
    ch: "Стандартна бібліотека",
    easy: "Календар на стіні показує дату, а годинник у кишені залежить від міста, де ви стоїте. Якщо поділити час на «дні від початку епохи» і «секунди дня», вам не потрібен ні пояс, ні поточний час.",
    p: [
      "Тип <code>time_t</code> із <code>&lt;time.h&gt;</code> це арифметичне число, зазвичай секунди від 1970-01-01 00:00:00 UTC (для стандарту C11 епоха не фіксована, зате POSIX і Linux фіксують саме її). На старих системах він 32-бітний і переповнюється у 2038 році, на сучасних 64-бітний. Поточний час <code>time(NULL)</code> у курсі не друкуємо: вивід був би різним щоразу.",
      "Розкладена дата це <code>struct tm</code> з полями <code>tm_year</code> (роки <b>від 1900</b>), <code>tm_mon</code> (<b>0–11</b>), <code>tm_mday</code> (1–31), <code>tm_hour</code>, <code>tm_min</code>, <code>tm_sec</code>, <code>tm_wday</code> (0 — неділя), <code>tm_yday</code> (0–365) і <code>tm_isdst</code>. Дві відмінності від людських чисел, рік мінус 1900 і місяць з нуля, є джерелом половини помилок: пишіть <code>tm_year + 1900</code> і <code>tm_mon + 1</code>.",
      "Перетворення секунд у поля роблять <code>gmtime</code> (за UTC) і <code>localtime</code> (за поясом системи). Друга залежить від змінної <code>TZ</code> та налаштувань машини: на сервері й у вас вона дасть різний результат. Тому для відтворюваного коду беріть <code>gmtime</code> і фіксовані значення <code>time_t</code>: <code>gmtime(0)</code> завжди 1970-01-01, а мільярд секунд це 2001-09-09 01:46:40 UTC, неділя.",
      "Зворотну дію, поля у секунди, виконує <code>mktime</code>, але вона трактує поля як <b>локальний час</b>, тож результат залежить від пояса й від <code>tm_isdst</code> (задайте <code>0</code>, якщо не знаєте). Окрім того, <code>mktime</code> нормалізує поля: <code>tm_mday = 32</code> стане першим числом наступного місяця. Функції <code>timegm</code> немає в стандарті. Надійна альтернатива це власна функція «днів від епохи» за алгоритмом Хіннанта, а потім множення на 86400.",
      "<code>difftime(a, b)</code> повертає різницю в секундах як <code>double</code>: безпечніше, ніж віднімати <code>time_t</code>, бо тип не обов'язково цілий. <code>strftime(буфер, розмір, формат, &amp;tm)</code> форматує дату: <code>%Y-%m-%d %H:%M:%S</code>, <code>%A</code> назва дня, <code>%j</code> день року. Назви залежать від локалі, у \"C\" це англійські. Результат 0 означає, що буфер замалий.",
      "Головна пастка: <code>gmtime</code> і <code>localtime</code> повертають вказівник на <b>одну статичну структуру</b>. Кожен виклик її перезаписує, тож два результати поспіль вказують на однакові дані. Копіюйте структуру одразу (<code>struct tm a = *gmtime(&amp;t);</code>) або беріть POSIX-версію <code>gmtime_r</code>. Ще пастка: від'ємні значення часу до 1970 року і дати, що не існують, у <code>mktime</code> нормалізуються мовчки.",
      "Далі в главі межі типів: <code>limits.h</code>, <code>float.h</code> і <code>stdint.h</code>.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <time.h>

static void show(time_t t) {
    struct tm *g = gmtime(&t);
    printf("%04d-%02d-%02d %02d:%02d:%02d, wday=%d, yday=%d\n",
           g->tm_year + 1900, g->tm_mon + 1, g->tm_mday,
           g->tm_hour, g->tm_min, g->tm_sec, g->tm_wday, g->tm_yday);
}

int main(void) {
    show(0);
    show(1000000000);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <time.h>

int main(void) {
    time_t t = 1000000000;
    char buf[64];
    size_t n = strftime(buf, sizeof buf, "%Y-%m-%d %H:%M:%S, %A, день року %j", gmtime(&t));
    if (n == 0) {
        return 1;
    }
    printf("%s\n", buf);
    time_t later = t + 90 * 60;
    printf("через 90 хвилин: %.0f секунд\n", difftime(later, t));
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <time.h>

static long days_from_civil(int y, int m, int d) {
    y -= m <= 2;
    long era = (y >= 0 ? y : y - 399) / 400;
    long yoe = y - era * 400;
    long doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
    long doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    return era * 146097 + doe - 719468;
}

int main(void) {
    int dates[][3] = {{1970, 1, 1}, {2000, 2, 29}, {2024, 12, 31}};
    for (int i = 0; i < 3; i++) {
        long days = days_from_civil(dates[i][0], dates[i][1], dates[i][2]);
        time_t t = (time_t)days * 86400;
        struct tm *g = gmtime(&t);
        printf("%04d-%02d-%02d: %ld днів, gmtime каже %04d-%02d-%02d\n",
               dates[i][0], dates[i][1], dates[i][2], days,
               g->tm_year + 1900, g->tm_mon + 1, g->tm_mday);
    }
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <time.h>

int main(void) {
    time_t t1 = 0;
    time_t t2 = 1000000000;
    struct tm *a = gmtime(&t1);
    struct tm *b = gmtime(&t2);
    printf("той самий вказівник: %s\n", a == b ? "так" : "ні");
    printf("a->tm_year + 1900 = %d\n", a->tm_year + 1900);
    return 0;
}`,
      String.raw`// фрагмент: mktime залежить від поясу TZ, результат на різних машинах різний
#include <time.h>

time_t local_noon(int y, int m, int d) {
    struct tm t = {0};
    t.tm_year = y - 1900;
    t.tm_mon = m - 1;
    t.tm_mday = d;
    t.tm_hour = 12;
    t.tm_isdst = 0;
    return mktime(&t);
}`,
    ],
    note: "<code>tm_year</code> рахується від 1900, <code>tm_mon</code> від нуля. <code>gmtime</code> віддає спільну статичну структуру, а <code>mktime</code> залежить від поясу, тож для відтворюваного коду беріть <code>gmtime</code> і власний підрахунок днів.",
    work: "Журнали, ліцензії, терміни дії й планувальники зберігають час як секунди від епохи, а лише при показі перетворюють у дату. Баги з часовими поясами й переведенням годинників знайдені в усіх великих проєктах.",
    tasks: [
      "Чому <code>mktime</code> дає різний результат на різних машинах і чому для тестів надійніше <code>gmtime</code> з фіксованим <code>time_t</code>?",
      "Що не так з двома викликами <code>gmtime</code> поспіль у одному виразі й які поправки потрібні до <code>tm_year</code> та <code>tm_mon</code>?",
    ],
  },
  {
    t: "limits.h, float.h і stdint.h",
    ch: "Стандартна бібліотека",
    easy: "Типи в C схожі на відра різного розміру: одне вміщує вісім літрів, інше трохи більше, але точний об'єм залежить від виробника. Заголовки limits.h, float.h і stdint.h це етикетки з об'ємом на кожному відрі.",
    p: [
      "Стандарт C не фіксує розмір <code>int</code>: він обіцяє лише мінімум (16 біт), а на практиці це 32. <code>long</code> на Linux має 64 біти, а в 64-бітному Windows 32. Код, що мовчки покладається на розмір, ламається при зміні платформи. Тому межі типів беруть з макросів, а не з голови: <code>INT_MAX</code>, <code>INT_MIN</code>, <code>UINT_MAX</code>, <code>LONG_MAX</code>, <code>CHAR_BIT</code> (число бітів у байті) із <code>&lt;limits.h&gt;</code>.",
      "Поведінка при виході за межі різна. Для <b>беззнакових</b> типів результат визначений: обчислення за модулем <code>2^N</code>, тому <code>uint8_t x = 255; x++;</code> дає <code>0</code>. Для <b>знакових</b> переповнення це невизначена поведінка: <code>INT_MAX + 1</code> може дати мінус, а може й зовсім інше, бо компілятор має право вважати, що переповнення не буває, і на цьому оптимізує (наприклад, виразу <code>x + 1 &gt; x</code> дозволено завжди бути істинним).",
      "Заголовок <code>&lt;stdint.h&gt;</code> (C99) дає типи з точною шириною: <code>int8_t</code>, <code>int16_t</code>, <code>int32_t</code>, <code>int64_t</code> і беззнакові <code>uint8_t</code>…<code>uint64_t</code>, а ще <code>int_least32_t</code> (щонайменше), <code>int_fast32_t</code> (найшвидший), <code>intmax_t</code>, <code>intptr_t</code>. Є межі <code>INT32_MAX</code>, <code>UINT8_MAX</code>, <code>SIZE_MAX</code> і макроси сталих <code>INT64_C(1)</code>. Правило вибору: потрібна точна ширина (формат файлу, протокол) бери <code>intN_t</code>; розмір чи індекс бери <code>size_t</code>; звичайний лічильник це <code>int</code>.",
      "Друкувати типи з <code>stdint.h</code> допомагає <code>&lt;inttypes.h&gt;</code>: макроси <code>PRId32</code>, <code>PRIu64</code> розкриваються у правильний специфікатор, тож пишуть <code>printf(\"%\" PRId32 \"\\n\", x);</code>. Для <code>size_t</code> є окремий специфікатор <code>%zu</code>. Простіше приводити до <code>long long</code> і друкувати <code>%lld</code>, але макроси чистіші й не ховають звуження.",
      "Для дробових типів є <code>&lt;float.h&gt;</code>. <code>DBL_EPSILON</code> це різниця між <code>1.0</code> і найближчим більшим <code>double</code>, приблизно <code>2.2e-16</code>; <code>DBL_DIG</code> це кількість десяткових цифр, що точно зберігаються (15 для <code>double</code>, 6 для <code>float</code>); <code>DBL_MAX</code> і <code>DBL_MIN</code> задають найбільше й найменше нормальне значення. Допуск при порівнянні вибирають кратним <code>DBL_EPSILON</code> та величині чисел, а не абстрактним <code>1e-9</code>.",
      "Як безпечно додавати? Перевіряйте <b>до</b> операції. Для додатних: <code>if (a &gt; INT_MAX - b)</code> це переповнення. Для множення: <code>if (a &gt; INT_MAX / b)</code>. Перевірка після (<code>if (a + b &lt; a)</code>) не годиться для знакових: сама операція вже UB. Компілятор GCC дає <code>__builtin_add_overflow</code>, а C23 додає <code>&lt;stdckdint.h&gt;</code>, проте в C11 вони не входять.",
      "Типові пастки: <code>abs(INT_MIN)</code>; змішування знакових і беззнакових, де <code>-1</code> стає <code>UINT_MAX</code>; віднімання <code>size_t</code>, що обертається в величезне число; знаковість <code>char</code> (<code>CHAR_MIN</code> це <code>-128</code> чи <code>0</code>). Далі: <code>rand</code> і <code>srand</code>.",
    ],
    code: [
      String.raw`#include <inttypes.h>
#include <limits.h>
#include <stdint.h>
#include <stdio.h>

int main(void) {
    printf("біт у байті: %d, UCHAR_MAX: %d, SHRT_MAX: %d\n", CHAR_BIT, UCHAR_MAX, SHRT_MAX);
    printf("INT32_MAX: %" PRId32 "\n", INT32_MAX);
    printf("INT32_MIN: %" PRId32 "\n", INT32_MIN);
    printf("UINT16_MAX: %u\n", (unsigned)UINT16_MAX);
    return 0;
}`,
      String.raw`#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>

int main(void) {
    int64_t big = INT64_C(1) << 40;
    printf("1 << 40 = %" PRId64 "\n", big);
    printf("sizeof(int32_t) = %zu, sizeof(int64_t) = %zu\n", sizeof(int32_t), sizeof(int64_t));
    uint32_t id = 4000000000u;
    printf("id = %" PRIu32 "\n", id);
    return 0;
}`,
      String.raw`#include <float.h>
#include <stdio.h>

int main(void) {
    printf("DBL_EPSILON = %.3e\n", DBL_EPSILON);
    printf("DBL_DIG = %d, FLT_DIG = %d\n", DBL_DIG, FLT_DIG);
    volatile double one = 1.0;
    printf("1 + EPSILON/2 == 1: %s\n", one + DBL_EPSILON / 2 == one ? "так" : "ні");
    printf("1 + EPSILON == 1: %s\n", one + DBL_EPSILON == one ? "так" : "ні");
    return 0;
}`,
      String.raw`#include <limits.h>
#include <stdint.h>
#include <stdio.h>

int main(void) {
    uint8_t x = 255;
    x++;
    printf("255 + 1 у uint8_t = %d\n", x);
    unsigned zero = 0;
    printf("0 - 1 у unsigned це UINT_MAX: %s\n", zero - 1 == UINT_MAX ? "так" : "ні");
    int neg = -1;
    printf("(unsigned)(-1) це UINT_MAX: %s\n", (unsigned)neg == UINT_MAX ? "так" : "ні");
    return 0;
}`,
      String.raw`// аварія: перевірка до додавання виявляє переповнення, програма завершується з кодом 1
#include <limits.h>
#include <stdio.h>

int main(void) {
    int a = INT_MAX;
    int b = 1;
    if (a > INT_MAX - b) {
        printf("переповнення при додаванні\n");
        return 1;
    }
    printf("%d\n", a + b);
    return 0;
}`,
    ],
    note: "Знакове переповнення це UB, беззнакове обертається за модулем. Для точної ширини беріть <code>intN_t</code>, для розмірів <code>size_t</code>, а переповнення перевіряйте до операції: <code>a &gt; INT_MAX - b</code>.",
    work: "Формати файлів, мережеві протоколи й хеші вимагають точної ширини, тому там <code>uint32_t</code> і <code>uint64_t</code>. Безпечна арифметика розмірів при виділенні пам'яті це класичне джерело вразливостей: <code>n * size</code> переповнюється й дає замалий буфер.",
    tasks: [
      "Чим відрізняється поведінка при переповненні знакового <code>int</code> і беззнакового <code>uint8_t</code>, і чому <code>if (a + b &lt; a)</code> не годиться для перевірки знакового додавання?",
      "Коли обирати <code>int32_t</code>, коли <code>size_t</code>, коли <code>int_fast32_t</code> і для чого потрібні макроси <code>PRId32</code>?",
    ],
  },
  {
    t: "rand і srand: псевдовипадкові числа",
    ch: "Стандартна бібліотека",
    easy: "rand це колода карт, яку добре потасували за рецептом: послідовність виглядає випадковою, але якщо почати з тієї ж початкової позиції, карти йдуть у тому самому порядку. Для лотереї вона не годиться, для гри чи тесту цілком.",
    p: [
      "Генератор <code>rand()</code> із <code>&lt;stdlib.h&gt;</code> повертає <code>int</code> від <code>0</code> до <code>RAND_MAX</code> (щонайменше 32767, у glibc 2147483647). Числа не справді випадкові, а <b>псевдовипадкові</b>: кожне наступне обчислюється з попереднього за фіксованою формулою. Стан зберігається всередині бібліотеки, тому послідовність цілком визначена початковим числом, <b>зерном</b>.",
      "Зерно задає <code>srand(unsigned seed)</code>. Те саме зерно дає ту саму послідовність. Без виклику <code>srand</code> діє так, ніби викликано <code>srand(1)</code>, тому програма без нього при кожному запуску видає однакові «випадкові» числа. Для різних запусків зерно беруть із часу: <code>srand((unsigned)time(NULL))</code>, але лише <b>один раз</b> на початку <code>main</code>. Виклик у циклі скидає послідовність: за одну секунду всі кроки отримають те саме число.",
      "Конкретні значення залежать від реалізації: алгоритм у glibc, musl і MSVC різний, тож <code>srand(42); rand()</code> дасть різні числа. Через це в тестах і завданнях ми перевіряємо <b>властивості</b>, а не числа: результат у межах, однакове зерно дає однакову послідовність, перемішаний масив лишається перестановкою. Так само пишуть і тести реальних програм.",
      "Як отримати число в діапазоні? Класика <code>rand() % n</code> дає <code>0..n-1</code>, але має <b>зсув розподілу</b> (modulo bias): коли <code>RAND_MAX + 1</code> не ділиться на <code>n</code> націло, менші залишки випадають частіше. Для малих <code>n</code> зсув мізерний. Для точності використовують масштабування <code>(int)((double)rand() / ((double)RAND_MAX + 1) * n)</code> або відкидання великих значень. Кидок кубика: <code>1 + rand() % 6</code>.",
      "Тасування масиву виконує алгоритм Фішера та Йейтса: ідемо з кінця, для кожного <code>i</code> обираємо випадкове <code>j</code> в діапазоні <code>0..i</code> і міняємо місцями. Це дає рівномірну перестановку. Типова помилка: обирати <code>j</code> з усього масиву, тоді розподіл виходить нерівномірним і деякі перестановки зустрічаються частіше.",
      "Найважливіше застереження: <code>rand</code> <b>не криптографічний</b>. Зерно в 32 біти перебирається миттєво, а за кількома виходами стан відновлюється. Паролі, токени й ключі не генеруйте через <code>rand</code>; для цього є системні джерела (<code>getrandom</code>, <code>/dev/urandom</code>, <code>arc4random</code>). Ще одна пастка: <code>rand</code> не потокобезпечний: стан спільний між потоками.",
      "Підсумок: ставте зерно один раз, діапазон беріть через залишок чи масштабування, тасуйте за Фішером та Йейтсом і тестуйте властивості послідовності, а не самі числа. Далі просунуті уроки: змінна кількість аргументів, сигнали, локалі й потоки.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int a[5];
    int b[5];
    srand(123);
    for (int i = 0; i < 5; i++) {
        a[i] = rand();
    }
    srand(123);
    for (int i = 0; i < 5; i++) {
        b[i] = rand();
    }
    int same = 1;
    for (int i = 0; i < 5; i++) {
        if (a[i] != b[i]) {
            same = 0;
        }
    }
    printf("те саме зерно, та сама послідовність: %s\n", same ? "так" : "ні");
    printf("RAND_MAX не менший за 32767: %s\n", RAND_MAX >= 32767 ? "так" : "ні");
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    srand(7);
    int counts[7] = {0};
    for (int i = 0; i < 6000; i++) {
        int die = 1 + rand() % 6;
        counts[die]++;
    }
    int total = 0;
    int missing = 0;
    for (int face = 1; face <= 6; face++) {
        total += counts[face];
        if (counts[face] == 0) {
            missing++;
        }
    }
    printf("усього кидків: %d, граней без випадінь: %d\n", total, missing);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <stdlib.h>

static void shuffle(int *a, int n) {
    for (int i = n - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        int tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
}

int main(void) {
    int a[8] = {0, 1, 2, 3, 4, 5, 6, 7};
    srand(99);
    shuffle(a, 8);
    int seen[8] = {0};
    for (int i = 0; i < 8; i++) {
        seen[a[i]]++;
    }
    int perm = 1;
    for (int i = 0; i < 8; i++) {
        if (seen[i] != 1) {
            perm = 0;
        }
    }
    printf("результат є перестановкою: %s\n", perm ? "так" : "ні");
    return 0;
}`,
      String.raw`// фрагмент: зерно з часу задають один раз на початку main
#include <stdlib.h>
#include <time.h>

int main(void) {
    srand((unsigned)time(NULL));
    int n = 1 + rand() % 6;
    return n > 0 ? 0 : 1;
}`,
    ],
    note: "Одне зерно дає одну послідовність, а конкретні числа залежать від libc, тому тестуйте властивості. <code>srand</code> викликайте один раз; для паролів і ключів <code>rand</code> не годиться.",
    work: "Ігри, симуляції й тестові дані використовують <code>rand</code> із фіксованим зерном, щоб помилку можна було відтворити. Для безпеки беруть системний генератор, а для статистики сучасніші алгоритми, наприклад xoshiro чи PCG, які легко записати кількома рядками.",
    tasks: [
      "Чому послідовність <code>rand()</code> повторюється при кожному запуску без <code>srand</code> і чому тести не повинні перевіряти конкретні значення?",
      "У чому зсув розподілу <code>rand() % n</code> і яка помилка в тасуванні Фішера та Йейтса робить перестановки нерівномірними?",
    ],
  },
  {
    t: "stdarg.h: змінна кількість аргументів",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Функція зі змінною кількістю аргументів схожа на чергу до каси: вона не знає, скільки людей стоїть, і має домовитися про сигнал кінця. Це може бути число на початку, формат чи спеціальне порожнє значення.",
    p: [
      "Ви вже викликали <code>printf</code> з будь-якою кількістю аргументів. Свою функцію такого виду пишуть за допомогою <code>&lt;stdarg.h&gt;</code>: у списку параметрів після хоча б одного іменованого стоїть три крапки, <code>int sum(int n, ...)</code>. Компілятор не знає ні кількості, ні типів «зайвих» аргументів, тому <b>перевірка типів зникає</b>, і весь контракт лежить на вас.",
      "Модель така. Аргументи лежать у стеку чи регістрах підряд. <code>va_list ap</code> це «курсор» по них. <code>va_start(ap, останній_іменований)</code> ставить курсор на перший зайвий аргумент, <code>va_arg(ap, тип)</code> читає значення цього типу й зсуває курсор, <code>va_end(ap)</code> завершує обхід (його обов'язково викликати до виходу з функції). Для обходу вдруге потрібна копія курсора: <code>va_copy(dst, src)</code> з C99, закривати її теж через <code>va_end</code>.",
      "Як функція дізнається про кількість? Є три усталені способи. <b>Лічильник</b> першим параметром: <code>sum(3, 10, 20, 30)</code>. <b>Формат</b>: <code>printf</code> рахує специфікатори. <b>Сентинел</b>: останнім передають <code>NULL</code> чи <code>-1</code>. Для сентинела-вказівника пишіть <code>(char *)NULL</code>: просте <code>NULL</code> може бути цілим <code>0</code>, а <code>va_arg(ap, char *)</code> читає вказівник.",
      "Правила <b>типів</b>. Зайві аргументи проходять <b>типові просування</b>: <code>char</code> і <code>short</code> стають <code>int</code>, <code>float</code> стає <code>double</code>. Тому <code>va_arg(ap, char)</code> і <code>va_arg(ap, float)</code> є невизначеною поведінкою, читайте <code>int</code> і <code>double</code>. Передали <code>1</code> замість <code>1.0</code> у функцію, що читає <code>double</code>, і результат сміття, бо цілі й дроби лежать у різних регістрах. Компілятор мовчить.",
      "Типовий корисний шаблон: власна обгортка над <code>printf</code>. Для неї є <code>vprintf</code>, <code>vfprintf</code> і <code>vsnprintf</code>: вони приймають <code>va_list</code> замість трьох крапок. Функція <code>log_msg(const char *level, const char *fmt, ...)</code> робить <code>va_start</code>, формує рядок через <code>vsnprintf</code> у буфер відомого розміру й додає префікс. Атрибут <code>__attribute__((format(printf, 2, 3)))</code> у GCC змушує компілятор перевіряти формат у ваших викликах.",
      "Пастки. Читання більше аргументів, ніж передано, це UB. Невідповідність типу (передали <code>long</code>, прочитали <code>int</code>) теж UB. Не можна використовувати <code>ap</code> після <code>va_end</code> чи передавати у <code>vprintf</code>, а потім знову читати без копії. У C до C23 перед трьома крапками потрібен щонайменше один іменований параметр; C23 цю вимогу зняв.",
      "Тож часто краще передати масив і довжину або ланцюжок структур: це безпечніше. Трьома крапками користуються там, де потрібен саме стиль <code>printf</code>. Далі сигнали.",
    ],
    code: [
      String.raw`#include <stdarg.h>
#include <stdio.h>

static int sum_ints(int n, ...) {
    va_list ap;
    va_start(ap, n);
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += va_arg(ap, int);
    }
    va_end(ap);
    return total;
}

int main(void) {
    printf("sum(3): %d\n", sum_ints(3, 10, 20, 30));
    printf("sum(0): %d\n", sum_ints(0));
    return 0;
}`,
      String.raw`#include <stdarg.h>
#include <stdio.h>

static double average(int n, ...) {
    va_list ap;
    va_start(ap, n);
    double total = 0;
    for (int i = 0; i < n; i++) {
        total += va_arg(ap, double);
    }
    va_end(ap);
    return n > 0 ? total / n : 0;
}

int main(void) {
    printf("середнє: %.2f\n", average(4, 1.0, 2.0, 3.0, 4.0));
    return 0;
}`,
      String.raw`#include <stdarg.h>
#include <stdio.h>

static void log_msg(const char *level, const char *fmt, ...) {
    char buf[128];
    va_list ap;
    va_start(ap, fmt);
    vsnprintf(buf, sizeof buf, fmt, ap);
    va_end(ap);
    printf("[%s] %s\n", level, buf);
}

int main(void) {
    log_msg("INFO", "користувач %s, вік %d", "Оля", 17);
    log_msg("WARN", "заповнено %.1f%%", 93.5);
    return 0;
}`,
      String.raw`#include <stdarg.h>
#include <stdio.h>

static void print_all(int n, ...) {
    va_list ap;
    va_list copy;
    va_start(ap, n);
    va_copy(copy, ap);
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += va_arg(ap, int);
    }
    va_end(ap);
    printf("сума %d, елементи:", total);
    for (int i = 0; i < n; i++) {
        printf(" %d", va_arg(copy, int));
    }
    printf("\n");
    va_end(copy);
}

int main(void) {
    print_all(3, 4, 5, 6);
    return 0;
}`,
      String.raw`// фрагмент: невизначена поведінка, тип у va_arg не збігається з переданим
#include <stdarg.h>

double first(int n, ...) {
    va_list ap;
    va_start(ap, n);
    double d = va_arg(ap, double);
    va_end(ap);
    return d;
}

double bad(void) {
    return first(1, 1);
}`,
    ],
    note: "Тип у <code>va_arg</code> мусить збігатися з переданим після просувань: <code>int</code> і <code>double</code>, а не <code>char</code> чи <code>float</code>. Завжди викликайте <code>va_end</code> і самі домовляйтеся про кількість аргументів.",
    work: "Логери, обгортки над <code>printf</code>, виклики <code>open</code> та <code>execl</code> із сентинелом <code>NULL</code> влаштовані через <code>stdarg.h</code>. У нових інтерфейсах, де формат не потрібен, краще передавати масив і довжину: так компілятор перевіряє типи, а помилки видно на етапі збирання.",
    tasks: [
      "Чому <code>va_arg(ap, float)</code> некоректне, і як передати у функцію з <code>...</code> число <code>1</code> замість <code>1.0</code>, не отримавши сміття?",
      "Як функція зі змінною кількістю аргументів дізнається, скільки їх, і навіщо потрібні <code>va_copy</code> та <code>vsnprintf</code>?",
    ],
  },
  {
    t: "signal.h і асинхронні події",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Сигнал схожий на дзвінок у двері під час готування: ви кладете ложку, відчиняєте, говорите два слова й повертаєтеся до плити. Тож робити під час дзвінка слід якнайменше, а решту відкласти на потім.",
    p: [
      "<b>Сигнал</b> це повідомлення програмі від системи чи від неї самої: користувач натиснув Ctrl+C (<code>SIGINT</code>), просять завершитися (<code>SIGTERM</code>), помилка ділення (<code>SIGFPE</code>), доступ до чужої пам'яті (<code>SIGSEGV</code>), <code>abort()</code> (<code>SIGABRT</code>). Стандарт C описує лише їх і дві функції з <code>&lt;signal.h&gt;</code>: <code>signal</code> і <code>raise</code>. Решта (наприклад, <code>SIGUSR1</code>, <code>sigaction</code>) це POSIX.",
      "<code>signal(номер, обробник)</code> встановлює обробник: функцію <code>void h(int sig)</code>, <code>SIG_DFL</code> (дія за замовчуванням, зазвичай завершення) або <code>SIG_IGN</code> (ігнорувати). Повертає <b>попередній</b> обробник або <code>SIG_ERR</code>. Функція <code>raise(sig)</code> надсилає сигнал самій програмі: обробник виконується <b>синхронно</b>, до повернення з <code>raise</code>. Саме це дозволяє показувати сигнали в детермінованих прикладах.",
      "Справжні сигнали приходять <b>асинхронно</b>: будь-коли, посеред довільної інструкції. Тому в обробнику майже нічого не можна. Дозволено: присвоїти значення змінній типу <code>volatile sig_atomic_t</code> та викликати кілька функцій «async-signal-safe» (<code>_Exit</code>, <code>abort</code>). Заборонено <code>printf</code>, <code>malloc</code>, <code>free</code>, стандартні потоки: вони можуть бути посеред своєї роботи й зі спільним станом. Ідіома одна: обробник лише <b>піднімає прапорець</b>, а головний цикл перевіряє його й завершується акуратно.",
      "<code>volatile</code> каже компілятору не кешувати змінну в регістрі й читати її з пам'яті щоразу: без нього цикл <code>while (!stop)</code> міг би бути оптимізований у нескінченний. <code>sig_atomic_t</code> це тип, читання й запис якого неподільні. Але <code>volatile</code> не робить змінну придатною для потоків: для них є <code>_Atomic</code> і <code>stdatomic.h</code>.",
      "Нюанси <code>signal</code>. Після спрацювання обробник у класичній семантиці скидається до <code>SIG_DFL</code>: так поводиться glibc при збиранні з <code>-std=c11</code>, тоді як у режимі GNU за замовчуванням обробник лишається. Тому переносний код перевстановлює його першим рядком обробника. Для надійності й масок сигналів у POSIX є <code>sigaction</code>. Сигнали <code>SIGKILL</code> і <code>SIGSTOP</code> перехопити неможливо. Поведінка після повернення з обробника <code>SIGSEGV</code> чи <code>SIGFPE</code> не визначена: програма не може «просто продовжити».",
      "Типові ідіоми. Акуратне завершення сервера по <code>SIGTERM</code>: прапорець, цикл виходить, закривається журнал. Тимчасове блокування Ctrl+C під час критичної секції: <code>SIG_IGN</code> і потім відновлення збереженого обробника. Тест обробника через <code>raise</code>, без очікування реального сигналу.",
      "Пастки: <code>printf</code> в обробнику (може зависнути чи зіпсувати вивід); забутий <code>volatile</code>; сигнал, що перервав системний виклик (<code>read</code> може повернути помилку <code>EINTR</code>); припущення, що обробник виконається один раз. Далі локалі й широкі символи.",
    ],
    code: [
      String.raw`#include <signal.h>
#include <stdio.h>

static volatile sig_atomic_t got = 0;

static void on_int(int sig) {
    (void)sig;
    got = 1;
}

int main(void) {
    if (signal(SIGINT, on_int) == SIG_ERR) {
        return 1;
    }
    printf("до raise: %d\n", (int)got);
    raise(SIGINT);
    printf("після raise: %d\n", (int)got);
    return 0;
}`,
      String.raw`#include <signal.h>
#include <stdio.h>

static volatile sig_atomic_t stop = 0;

static void on_int(int sig) {
    (void)sig;
    stop = 1;
}

int main(void) {
    signal(SIGINT, on_int);
    int done = 0;
    for (int i = 1; i <= 5 && !stop; i++) {
        printf("крок %d\n", i);
        done++;
        if (i == 3) {
            raise(SIGINT);
        }
    }
    printf("виконано кроків: %d\n", done);
    return 0;
}`,
      String.raw`#include <signal.h>
#include <stdio.h>

static volatile sig_atomic_t hits = 0;

static void on_int(int sig) {
    signal(sig, on_int);
    hits++;
}

int main(void) {
    void (*prev)(int) = signal(SIGINT, SIG_IGN);
    raise(SIGINT);
    printf("під SIG_IGN програма жива\n");
    prev = signal(SIGINT, on_int);
    printf("попередній обробник був SIG_IGN: %s\n", prev == SIG_IGN ? "так" : "ні");
    raise(SIGINT);
    raise(SIGINT);
    printf("обробник спрацював %d рази\n", (int)hits);
    signal(SIGINT, SIG_DFL);
    return 0;
}`,
      String.raw`// аварія: SIGTERM без обробника завершує процес (ненульовий код завершення)
#include <signal.h>
#include <stdio.h>

int main(void) {
    signal(SIGTERM, SIG_DFL);
    raise(SIGTERM);
    printf("сюди програма не дійде\n");
    return 0;
}`,
    ],
    note: "В обробнику сигналу лише піднімайте прапорець типу <code>volatile sig_atomic_t</code>, а роботу робіть у головному коді. <code>printf</code>, <code>malloc</code> і <code>free</code> там небезпечні; <code>raise</code> викликає обробник синхронно.",
    work: "Сервери й утиліти реагують на <code>SIGTERM</code> і <code>SIGINT</code>, акуратно завершуючи роботу, а <code>SIGHUP</code> часто перечитує конфігурацію. Менеджери процесів і контейнери спершу шлють <code>SIGTERM</code>, дають кілька секунд на прибирання, і лише потім <code>SIGKILL</code>.",
    tasks: [
      "Чому в обробнику сигналу не можна викликати <code>printf</code> чи <code>malloc</code> і навіщо прапорцю типи <code>volatile</code> та <code>sig_atomic_t</code>?",
      "Що повертає <code>signal</code> і чим синхронний <code>raise</code> відрізняється від справжнього асинхронного сигналу від системи?",
    ],
  },
  {
    t: "locale.h і широкі символи",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Локаль це правила місцевості: у кого десяткова крапка, а в кого кома, як сортувати літери. Широкий символ це комірка достатньо велика, щоб вмістити будь-яку літеру, на відміну від байта, куди кирилиця не влазить.",
    p: [
      "Рядок <code>char *</code> це послідовність байтів. Для ASCII один символ це один байт, але кирилиця в UTF-8 займає два, ієрогліф три-чотири. Тому <code>strlen(\"Привіт\")</code> дорівнює 12, хоча літер шість, а <code>toupper</code> і <code>isalpha</code> не бачать у цих байтах літер. Розв'язок один із двох: або працювати з байтами, знаючи правила UTF-8, або перейти на <b>широкі символи</b>.",
      "<code>wchar_t</code> із <code>&lt;wchar.h&gt;</code> це ціле, що вміщує один символ. Його розмір залежить від платформи: 4 байти в Linux (UTF-32), 2 в Windows (UTF-16, і тоді частину символів представляють парою). Широкі рядки пишуть <code>L\"...\"</code>, довжину міряє <code>wcslen</code>, вивід робить <code>wprintf</code> із форматом <code>%ls</code> і <code>%lc</code>. Перетворення між байтовими й широкими рядками виконують <code>mbstowcs</code> та <code>wcstombs</code>, а класифікацію дає <code>&lt;wctype.h&gt;</code> (<code>iswalpha</code>, <code>towupper</code>).",
      "Усе це залежить від <b>локалі</b> з <code>&lt;locale.h&gt;</code>. При старті програма живе в мінімальній локалі <code>\"C\"</code>, тобто ASCII, десяткова крапка, англійські назви. <code>setlocale(LC_ALL, \"\")</code> бере налаштування середовища (<code>LANG</code>), <code>setlocale(LC_ALL, \"uk_UA.UTF-8\")</code> просить конкретну. Повертає назву або <code>NULL</code>, якщо такої локалі в системі немає. У контейнерах і пісочницях вона зазвичай відсутня, тож перевіряйте результат.",
      "Категорії локалі окремі: <code>LC_CTYPE</code> (класифікація й кодування), <code>LC_NUMERIC</code> (десяткова крапка), <code>LC_TIME</code>, <code>LC_COLLATE</code> (порядок сортування для <code>strcoll</code>). <code>localeconv()</code> віддає поточні символи форматування. Небезпека: у локалі з комою <code>printf(\"%f\")</code> надрукує <code>3,14</code>, а <code>strtod</code> розбере лише таке саме. Файли обміну даними пишіть у локалі <code>\"C\"</code>, а для людини форматуйте окремо.",
      "Пастка <b>орієнтації потоку</b>. Перший виклик над <code>stdout</code> фіксує його або вузьким (<code>printf</code>), або широким (<code>wprintf</code>). Подальші виклики іншого виду <b>не працюють</b>: вони повертають помилку й нічого не друкують. Змішувати <code>printf</code> і <code>wprintf</code> на одному потоці не можна, оберіть один вид для всього потоку.",
      "Сучасніше й переносніше рішення дає C11 з <code>&lt;uchar.h&gt;</code>: типи <code>char16_t</code> і <code>char32_t</code> та літерали <code>u\"...\"</code> і <code>U\"...\"</code>. <code>char32_t</code> завжди 32-бітний, тож <code>U\"Привіт\"</code> це шість елементів у будь-якій системі, незалежно від локалі. Для обробки UTF-8 вручну достатньо знати: байти, що починаються з бітів <code>10</code> (значення від <code>0x80</code> до <code>0xBF</code>), є <b>продовженням</b>; символи починаються з решти байтів. Рахуйте не-продовження, і матимете кількість символів.",
      "Пастки: розмір <code>wchar_t</code> різний; <code>setlocale</code> змінює глобальний стан усього процесу (небезпечно в потоках); довжина рядка в байтах, у символах і в колонках на екрані це три різні числа. Далі потоки C11.",
    ],
    code: [
      String.raw`#include <locale.h>
#include <stdio.h>

int main(void) {
    printf("локаль: %s\n", setlocale(LC_ALL, NULL));
    printf("десяткова крапка: %s\n", localeconv()->decimal_point);
    printf("%.2f\n", 3.14159);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <string.h>
#include <wchar.h>

int main(void) {
    const char *narrow = "Привіт";
    const wchar_t *wide = L"Привіт";
    printf("байтів: %zu, широких символів: %zu\n", strlen(narrow), wcslen(wide));
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <string.h>
#include <uchar.h>

static size_t utf8_len(const char *s) {
    size_t n = 0;
    for (; *s != '\0'; s++) {
        if (((unsigned char)*s & 0xC0) != 0x80) {
            n++;
        }
    }
    return n;
}

int main(void) {
    const char *text = "Привіт, C!";
    const char32_t *wide = U"Привіт, C!";
    size_t count = 0;
    while (wide[count] != 0) {
        count++;
    }
    printf("байтів: %zu, символів: %zu, char32_t: %zu\n", strlen(text), utf8_len(text), count);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <wchar.h>

int main(void) {
    wprintf(L"широкий вивід %d\n", 1);
    int r = printf("вузький вивід\n");
    wprintf(L"printf після wprintf повернув помилку: %d\n", r < 0);
    return 0;
}`,
      String.raw`// фрагмент: потрібна локаль, якої в пісочниці може не бути
#include <locale.h>
#include <wchar.h>
#include <wctype.h>

int main(void) {
    if (setlocale(LC_ALL, "uk_UA.UTF-8") == NULL) {
        return 1;
    }
    wprintf(L"%lc\n", (wint_t)towupper(L'ї'));
    return 0;
}`,
    ],
    note: "У локалі <code>\"C\"</code> працюють лише байти ASCII. Кількість символів в UTF-8 рахуйте за байтами не-продовження або через <code>char32_t</code>, а <code>printf</code> і <code>wprintf</code> на одному потоці не змішуйте.",
    work: "Програми для багатомовних користувачів і формати обміну (JSON, XML) рахують символи, а не байти. У переносному коді беруть UTF-8 з готовою бібліотекою, а <code>setlocale</code> викликають лише в точці входу.",
    tasks: [
      "Чому <code>strlen(\"Привіт\")</code> дає 12, і як порахувати кількість символів UTF-8 за байтами?",
      "Що станеться, якщо після <code>wprintf</code> на <code>stdout</code> викликати <code>printf</code>, і що повертає <code>setlocale</code>, коли локалі немає?",
    ],
  },
  {
    t: "threads.h: потоки C11",
    ch: "Стандартна бібліотека",
    adv: true,
    easy: "Потоки це кілька кухарів на одній кухні: інструменти й продукти спільні, а руки свої. Поки вони готують різні страви, усе добре; коли двоє тягнуть одну каструлю, потрібен порядок черги.",
    p: [
      "<b>Потік</b> (thread) це окрема лінія виконання всередині процесу. Усі потоки поділяють купу, глобальні й статичні змінні, але кожен має свій стек і свої локальні змінні. Потоки дозволяють завантажити всі ядра процесора та не блокувати програму на очікуванні. Ціна: усе спільне стає полем для помилок, які не відтворюються стабільно.",
      "C11 додав заголовок <code>&lt;threads.h&gt;</code>. Потік створює <code>thrd_create(&amp;t, функція, аргумент)</code>, де функція має вигляд <code>int f(void *arg)</code>; повертає <code>thrd_success</code> при успіху. Дочекатися завершення й отримати результат: <code>thrd_join(t, &amp;res)</code>. Кожен потік треба або <b>приєднати</b> (<code>thrd_join</code>), або від'єднати (<code>thrd_detach</code>), інакше ресурси витікають. Приєднувати двічі не можна. Аргумент передають як <code>void *</code>: вказівник на дані, що переживуть потік, не на локальну змінну, яка вже вийшла зі своєї функції.",
      "Збирання: <code>gcc -pthread</code>. Заголовок <code>threads.h</code> необов'язковий: якщо макрос <code>__STDC_NO_THREADS__</code> визначений, його немає. У glibc він з'явився у версії 2.28; у MSVC і деяких системах його нема, і тоді користуються POSIX <code>pthread</code>. Концепції ті самі, назви інші: <code>pthread_create</code>, <code>pthread_mutex_lock</code>.",
      "Головна небезпека це <b>гонка даних</b> (data race): два потоки одночасно звертаються до однієї змінної, і хоча б один пише. У C11 це невизначена поведінка, а не «просто неточне число». <code>counter++</code> це три кроки (читання, додавання, запис), і потоки втрачають оновлення одне одного. Вивід програми змінюється від запуску до запуску, а під налагоджувачем і зникає.",
      "Ліки: <b>м'ютекс</b> (<code>mtx_t</code>). <code>mtx_init(&amp;m, mtx_plain)</code>, далі пара <code>mtx_lock(&amp;m)</code> і <code>mtx_unlock(&amp;m)</code> навколо критичної секції, <code>mtx_destroy</code> наприкінці. Тримайте секцію короткою й завжди звільняйте м'ютекс на всіх шляхах виходу. Умовні змінні <code>cnd_t</code> дозволяють чекати події (<code>cnd_wait</code>, <code>cnd_signal</code>) без активного очікування. Ще є <code>call_once</code> для одноразової ініціалізації й <code>thread_local</code> для змінної з окремою копією в кожному потоці.",
      "Практичні правила. Розбивайте роботу на незалежні частини: кожен потік пише у <b>свою</b> структуру результату, а головний потік підсумовує після <code>thrd_join</code>. Тоді замки не потрібні. Не друкуйте з кількох потоків одночасно, якщо важливий порядок. Не припускайте нічого про порядок виконання потоків, лише про те, що відбувається <b>до</b> <code>join</code>.",
      "Пастки: передача адреси локальної змінної завершеного потоку; забутий <code>join</code>; блокування м'ютексів у різному порядку (взаємне блокування, deadlock); припущення, що <code>volatile</code> робить змінну безпечною для потоків: для цього є <code>_Atomic</code>. Це кінець глави про стандартну бібліотеку; далі структури даних.",
    ],
    code: [
      String.raw`#include <stdio.h>
#include <threads.h>

static int square(void *arg) {
    int x = *(int *)arg;
    return x * x;
}

int main(void) {
    thrd_t t;
    int x = 12;
    if (thrd_create(&t, square, &x) != thrd_success) {
        return 1;
    }
    int res = 0;
    thrd_join(t, &res);
    printf("квадрат: %d\n", res);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <threads.h>

static mtx_t lock;
static int counter = 0;

static int work(void *arg) {
    (void)arg;
    for (int i = 0; i < 1000; i++) {
        mtx_lock(&lock);
        counter++;
        mtx_unlock(&lock);
    }
    return 0;
}

int main(void) {
    thrd_t t[4];
    if (mtx_init(&lock, mtx_plain) != thrd_success) {
        return 1;
    }
    for (int i = 0; i < 4; i++) {
        if (thrd_create(&t[i], work, NULL) != thrd_success) {
            return 1;
        }
    }
    for (int i = 0; i < 4; i++) {
        thrd_join(t[i], NULL);
    }
    mtx_destroy(&lock);
    printf("лічильник: %d\n", counter);
    return 0;
}`,
      String.raw`#include <stdio.h>
#include <threads.h>

static once_flag flag = ONCE_FLAG_INIT;
static thread_local int local = 0;

static void init(void) {
    puts("ініціалізація один раз");
}

static int work(void *arg) {
    (void)arg;
    call_once(&flag, init);
    for (int i = 0; i < 5; i++) {
        local++;
    }
    return local;
}

int main(void) {
    thrd_t a, b;
    int ra = 0, rb = 0;
    thrd_create(&a, work, NULL);
    thrd_join(a, &ra);
    thrd_create(&b, work, NULL);
    thrd_join(b, &rb);
    printf("потоки: %d і %d, local у main: %d\n", ra, rb, local);
    return 0;
}`,
      String.raw`// фрагмент: гонка даних, лічильник без м'ютекса, результат різний від запуску до запуску
#include <threads.h>

static int counter = 0;

static int work(void *arg) {
    (void)arg;
    for (int i = 0; i < 100000; i++) {
        counter++;
    }
    return 0;
}

int run(void) {
    thrd_t a, b;
    thrd_create(&a, work, NULL);
    thrd_create(&b, work, NULL);
    thrd_join(a, NULL);
    thrd_join(b, NULL);
    return counter;
}`,
    ],
    note: "Спільні дані без захисту це гонка даних і UB. Давайте кожному потоку свою структуру результату або беріть <code>mtx_t</code>, приєднуйте кожен потік через <code>thrd_join</code> і не передавайте адресу локальної змінної, що вже зникла.",
    work: "Сервери, обробка зображень і пошук за базою розбивають роботу між потоками пулу. Найкраще масштабуються схеми, де потоки не ділять змінних, а результати збираються після <code>join</code>; замки лишають для рідкісних спільних структур.",
    tasks: [
      "Чому <code>counter++</code> з двох потоків без м'ютекса це гонка даних, і як це виправити за допомогою <code>mtx_t</code>?",
      "Навіщо кожен потік треба приєднати або від'єднати, і чому не можна передавати в потік адресу локальної змінної завершеної функції?",
    ],
  },
];
