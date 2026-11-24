// Сторінка підтримки /contact: чисте розмітка форми (без DOM і мережі), щоб її могла заздалегідь створити збірка для пошуковиків.
// Поведінка (перевірка, відправка, ефекти) у contact-mount.ts.
import { tr } from "./i18n.ts";
import { DEFAULT_TOPIC, MSG_MAX, NAME_MAX, TOPICS, TOPICS_EN, type Topic } from "./support.ts";

export function contactHtml(crumbs: string): string {
  const chips = (Object.keys(TOPICS) as Topic[])
    .map((k) => `<label class="onb-chip"><input type="radio" name="topic" value="${k}"${k === DEFAULT_TOPIC ? " checked" : ""}><span>${tr(TOPICS[k], TOPICS_EN[k])}</span></label>`).join("");
  return `${crumbs}
  <div class="sp">
    <aside class="card sp-info">
      <h1>${tr("Підтримка", "Support")}</h1>
      <p class="sp-lead">${tr("Щось мерехтить, «їде» чи виглядає не так? Або є ідея, як зробити сайт приємнішим? Напишіть нам, ми читаємо кожне звернення.", "Something flickers, slides or just looks off? Or do you have an idea how to make the site more pleasant? Write to us, we read every message.")}</p>
      <ul class="sp-tips">
        <li>${tr("<b>Ефекти та візуал.</b> Опишіть, що саме не так з анімацією, кольорами чи розкладкою, і де це видно.", "<b>Effects and visuals.</b> Describe what exactly is wrong with an animation, colours or layout, and where you can see it.")}</li>
        <li>${tr("<b>Що ми додаємо самі.</b> Адресу сторінки, розмір вікна, браузер і чи ввімкнено «зменшення руху». Більше нічого.", "<b>What we add ourselves.</b> The page address, window size, browser and whether “reduce motion” is on. Nothing else.")}</li>
        <li>${tr("<b>Відповідь.</b> Прийде на пошту, яку ви вкажете. Ми використовуємо її лише для відповіді.", "<b>Reply.</b> It will come to the email you provide. We use it only to reply.")}</li>
      </ul>
    </aside>
    <div class="card sp-card">
      <form id="ct-form" novalidate>
        <fieldset class="sp-topics"><legend>${tr("Про що ви пишете?", "What is it about?")}</legend><div class="onb-chips">${chips}</div></fieldset>
        <label class="fld"><span class="lbl">${tr("Ім'я", "Name")} <small>${tr("(необов'язково)", "(optional)")}</small></span><input name="name" type="text" maxlength="${NAME_MAX}" autocomplete="name"></label>
        <label class="fld"><span class="lbl">${tr("Пошта для відповіді", "Email for the reply")}</span><input name="email" type="email" maxlength="254" autocomplete="email" required></label>
        <label class="fld"><span class="lbl">${tr("Повідомлення", "Message")}</span>
          <textarea name="message" rows="5" maxlength="${MSG_MAX}" required placeholder="${tr("Що ви бачите і де: сторінка, пристрій, що очікували побачити", "What you see and where: the page, the device, what you expected to see")}"></textarea>
          <small class="sp-count" id="ct-count" aria-live="polite">0 / ${MSG_MAX}</small></label>
        <div class="sp-hp" aria-hidden="true"><label>${tr("Не заповнюйте це поле", "Do not fill in this field")} <input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
        <button class="btn primary" type="submit">${tr("Надіслати", "Send")}</button>
      </form>
      <p class="form-msg" id="ct-msg" role="alert"></p>
      <div class="sp-ok" id="ct-ok" hidden>
        <svg class="sp-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 15-17"/></svg>
        <h2 id="ct-ok-h" tabindex="-1">${tr("Дякуємо!", "Thank you!")}</h2>
        <p id="ct-ok-text"></p>
        <button class="btn" id="ct-again" type="button">${tr("Написати ще", "Write another")}</button>
      </div>
    </div>
  </div>`;
}
