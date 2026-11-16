import type { RefSection } from "./types.ts";

const raw = String.raw;

export const git: RefSection[] = [
  { t: "Початок роботи", items: [
    { t: "Налаштування", code: raw`git config --global user.name "Ім'я Прізвище"
git config --global user.email "me@example.com"
git config --list`, note: "Це робиться один раз на комп'ютері: ім'я та пошта потраплять у кожен коміт." },
    { t: "Створення й клонування", code: raw`git init                          # новий репозиторій у папці
git clone https://github.com/user/repo.git`, note: "`clone` копіює весь репозиторій разом з історією." },
  ] },
  { t: "Звичайний цикл", items: [
    { t: "Стан, індекс, коміт", code: raw`git status                # що змінилося
git add file.txt           # додати файл в індекс
git add .                  # додати все
git commit -m "Додано форму входу"`, note: "Спочатку зміни потрапляють в індекс (`add`), потім фіксуються в коміті. Повідомлення коміту має пояснювати, що і навіщо зроблено." },
    { t: "Перегляд змін", code: raw`git diff                   # ще не додані зміни
git diff --staged          # вже додані в індекс
git log --oneline          # історія в один рядок
git show abc1234           # деталі коміту`, note: "Перед кожним комітом корисно дивитися `git diff`." },
  ] },
  { t: "Гілки", items: [
    { t: "Створення й перемикання", code: raw`git branch                  # список гілок
git switch -c feature-login # створити й перейти
git switch main             # повернутися
git branch -d feature-login # видалити після злиття`, note: "Нову функцію зручно робити в окремій гілці, щоб не ламати основну." },
    { t: "Злиття", code: raw`git switch main
git merge feature-login`, note: "Якщо однакові рядки змінено по-різному, Git покаже конфлікт: відкрийте файл, залиште правильний варіант, видаліть маркери `<<<<<<<`, `=======`, `>>>>>>>` та зробіть коміт." },
  ] },
  { t: "Віддалений репозиторій", items: [
    { t: "push, pull, fetch", code: raw`git remote add origin https://github.com/user/repo.git
git push -u origin main    # відправити
git pull                   # забрати й злити
git fetch                  # лише забрати зміни`, note: "Прапорець `-u` запам'ятовує гілку, далі достатньо писати просто `git push`." },
    { t: "Pull request", code: raw`git switch -c fix-typo
git commit -am "Виправлено помилку в тексті"
git push -u origin fix-typo
# далі на GitHub: Compare & pull request`, note: "Pull request дозволяє колегам переглянути зміни, перш ніж вони потраплять у `main`." },
  ] },
  { t: "Скасування", items: [
    { t: "Відкат змін", code: raw`git restore file.txt              # скасувати зміни у файлі
git restore --staged file.txt     # прибрати з індексу
git commit --amend -m "Нове повідомлення"   # виправити останній коміт
git revert abc1234                # новий коміт, що скасовує старий`, note: "`revert` безпечний для спільних гілок, бо не переписує історію." },
    { t: "Тимчасове збереження", code: raw`git stash          # відкласти незакомічені зміни
git stash pop      # повернути їх назад`, note: "`stash` корисний, коли потрібно швидко перейти на іншу гілку." },
  ] },
  { t: ".gitignore", items: [
    { t: "Ігнорування файлів", code: raw`node_modules/
.env
*.log
dist/`, note: "Файл `.gitignore` у корені проєкту. Паролі й ключі (`.env`) у репозиторій потрапляти не повинні." },
  ] },
  { t: "Корисні команди", items: [
    { t: "Допомога й пошук", code: raw`git help commit
git blame file.txt          # хто змінював кожен рядок
git tag v1.0                # позначка версії
git log --graph --oneline --all`, note: "`git help <команда>` відкриває повний опис." },
  ] },
];
