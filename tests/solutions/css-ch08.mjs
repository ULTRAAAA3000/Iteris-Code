// Еталони завдань курсу CSS, глава 08 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_08 = {
  "css-grid": `.gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.wide { grid-column: span 2; }
`,
  "css-grid-fr": `.page { display: grid; grid-template-columns: 200px 1fr; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
`,
  "css-grid-areas": `.page { display: grid; grid-template-columns: 200px 1fr; grid-template-areas:
  "header header"
  "sidebar main"
  "footer footer"; gap: 16px; }
header { grid-area: header; }
aside { grid-area: sidebar; }
main { grid-area: main; }
footer { grid-area: footer; }
.badge { height: 80px; display: grid; place-items: center; }
`,
  "css-grid-nested": `.page { display: grid; grid-template-columns: 1fr 3fr; gap: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card { display: grid; grid-row: span 3; grid-template-rows: subgrid; }
`,
};
