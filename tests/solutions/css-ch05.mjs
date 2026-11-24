// Еталони завдань курсу CSS, глава 05 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_05 = {
  "css-box-model": `.card {
  width: 300px;
  box-sizing: border-box;
  padding: 16px;
  border: 2px solid #1a237e;
  margin-top: 24px;
}
.wide { width: 100%; }
`,
  "css-spacing": `.item { padding: 12px 20px; }
.item + .item { margin-top: 16px; }
.note { width: 200px; margin-inline: auto; }
`,
  "css-sizing": `.container { max-width: 600px; margin-inline: auto; }
img { max-width: 100%; }
.list { max-height: 120px; overflow-y: auto; }
.cover { aspect-ratio: 16 / 9; }
`,
};
