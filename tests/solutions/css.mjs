// Еталонні рішення завдань CSS (id завдання -> код стилів). У сайт не потрапляють
export const CSS = {
  "css-cascade": `body { font-size: 18px; }
h1 { color: #1565c0; }
.big { color: #c62828; }
#title { color: #2e7d32; }
.note { color: #c62828; }
`,
  "css-selectors": `nav a { color: #1a237e; }
nav a.active { font-weight: bold; }
section > p { margin-top: 0; }
`,
  "css-pseudo": `li:nth-child(odd) { background: #f0f4ff; }
a { text-decoration: none; }
a:hover { text-decoration: underline; }
.btn::after { content: "→"; }
`,
  "css-colors-units": `body { font-family: Arial, sans-serif; }
h1 { font-size: 2rem; }
.note { font-size: 0.875rem; }
.price { color: #d32f2f; }
`,
  "css-box-model": `.card {
  width: 300px;
  box-sizing: border-box;
  padding: 16px;
  border: 2px solid #1a237e;
  margin-top: 24px;
}
`,
  "css-text-backgrounds": `.hero {
  background: #0d47a1;
  color: #ffffff;
  text-align: center;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.hero h1 {
  text-transform: uppercase;
  letter-spacing: 2px;
}
`,
  "css-display-position": `.card { position: relative; }
.badge { position: absolute; top: 8px; right: 8px; }
.hidden { display: none; }
.tag { display: inline-block; }
`,
  "css-flexbox": `.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.layout { display: flex; }
.sidebar { display: flex; flex-direction: column; }
.content { flex: 1; }
`,
  "css-grid": `.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.wide { grid-column: span 2; }
`,
  "css-responsive": `.layout { display: flex; gap: 16px; }

@media (max-width: 600px) {
  .layout { flex-direction: column; }
}
`,
  "css-variables-dark": `:root {
  --bg: #ffffff;
  --text: #111111;
}

body {
  background: var(--bg);
  color: var(--text);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111111;
    --text: #eeeeee;
  }
}
`,
  "css-transitions": `.btn { background: #1976d2; color: #fff; border: 0; padding: 10px 16px; transition: background-color 0.3s ease; }
.btn:hover { background-color: #1565c0; }

@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
.pulse { animation: pulse 1.5s infinite; }
`,
  "css-portfolio-practice": `header { background: #1a237e; color: #ffffff; padding: 16px; }
nav { display: flex; gap: 16px; }
.projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card { background: #ffffff; padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }
footer { text-align: center; }

@media (max-width: 600px) {
  .projects { grid-template-columns: 1fr; }
}
`,
};
