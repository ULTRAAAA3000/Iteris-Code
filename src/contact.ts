// Сторінка підтримки /contact: чисте розмітка форми (без DOM і мережі), щоб її могла заздалегідь створити збірка для пошуковиків.
// Поведінка (перевірка, відправка, ефекти) у contact-mount.ts.
import { DEFAULT_TOPIC, MSG_MAX, NAME_MAX, TOPICS, type Topic } from "./support.ts";

export function contactHtml(crumbs: string): string {
  const chips = (Object.keys(TOPICS) as Topic[])
    .map((k) => `<label class="onb-chip"><input type="radio" name="topic" value="${k}"${k === DEFAULT_TOPIC ? " checked" : ""}><span>${TOPICS[k]}</span></label>`).join("");
  return `${crumbs}
  <div class="sp">
    <aside class="card sp-info">
      <h1>Підтримка</h1>
      <p class="sp-lead">Щось мерехтить, «їде» чи виглядає не так? Або є ідея, як зробити сайт приємнішим? Напишіть нам, ми читаємо кожне звернення.</p>
      <ul class="sp-tips">
        <li><b>Ефекти та візуал.</b> Опишіть, що саме не так з анімацією, кольорами чи розкладкою, і де це видно.</li>
        <li><b>Що ми додаємо самі.</b> Адресу сторінки, розмір вікна, браузер і чи ввімкнено «зменшення руху». Більше нічого.</li>
        <li><b>Відповідь.</b> Прийде на пошту, яку ви вкажете. Ми використовуємо її лише для відповіді.</li>
      </ul>
    </aside>
    <div class="card sp-card">
      <form id="ct-form" novalidate>
        <fieldset class="sp-topics"><legend>Про що ви пишете?</legend><div class="onb-chips">${chips}</div></fieldset>
        <label class="fld"><span class="lbl">Ім'я <small>(необов'язково)</small></span><input name="name" type="text" maxlength="${NAME_MAX}" autocomplete="name"></label>
        <label class="fld"><span class="lbl">Пошта для відповіді</span><input name="email" type="email" maxlength="254" autocomplete="email" required></label>
        <label class="fld"><span class="lbl">Повідомлення</span>
          <textarea name="message" rows="5" maxlength="${MSG_MAX}" required placeholder="Що ви бачите і де: сторінка, пристрій, що очікували побачити"></textarea>
          <small class="sp-count" id="ct-count" aria-live="polite">0 / ${MSG_MAX}</small></label>
        <div class="sp-hp" aria-hidden="true"><label>Не заповнюйте це поле <input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
        <button class="btn primary" type="submit">Надіслати</button>
      </form>
      <p class="form-msg" id="ct-msg" role="alert"></p>
      <div class="sp-ok" id="ct-ok" hidden>
        <svg class="sp-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 15-17"/></svg>
        <h2 id="ct-ok-h" tabindex="-1">Дякуємо!</h2>
        <p id="ct-ok-text"></p>
        <button class="btn" id="ct-again" type="button">Написати ще</button>
      </div>
    </div>
  </div>`;
}
