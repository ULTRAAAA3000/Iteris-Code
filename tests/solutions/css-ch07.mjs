// Еталони завдань курсу CSS, глава 07 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_07 = {
  "css-flexbox": `.header { display: flex; }
.sidebar { display: flex; flex-direction: column; }
.menu { display: flex; flex-direction: row-reverse; }
.tags { display: flex; flex-wrap: wrap; }
`,
  "css-flex-align": `.header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.hero { height: 120px; display: flex; justify-content: center; align-items: center; }
.buttons { display: flex; gap: 8px; }
.btn.last { align-self: flex-end; }
`,
  "css-flex-sizing": `.layout { display: flex; }
.sidebar { flex-basis: 240px; flex-shrink: 0; }
.content { flex-grow: 1; }
.cols { display: flex; }
.col { flex: 1; }
`,
  "css-flex-layouts": `.nav { display: flex; gap: 12px; }
body { display: flex; flex-direction: column; min-height: 100vh; margin: 0; }
main { flex: 1; }
.logout { margin-left: auto; }
.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.card { flex: 1 1 200px; }
`,
};
