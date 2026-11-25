// Еталони завдань курсу CSS, глава 06 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_06 = {
  "css-display-position": `.tag { display: inline-block; }
.button { display: block; }
.menu li { display: inline-block; }
.hidden { display: none; }
.note { display: inline; }
`,
  "css-position": `.card { position: relative; }
.badge { position: absolute; top: 8px; right: 8px; }
.header { position: sticky; top: 0; }
.to-top { position: fixed; bottom: 16px; right: 16px; }
`,
  "css-z-index": `.backdrop { position: fixed; z-index: 10; }
.modal { position: fixed; z-index: 20; }
.tooltip { position: absolute; z-index: 5; }
.card { isolation: isolate; }
`,
};
