// Еталони завдань курсу CSS, глава 09 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_09 = {
  "css-responsive": `.layout { display: flex; flex-direction: column; gap: 16px; }
.box { padding: 16px; }
@media (min-width: 600px) {
  .layout { flex-direction: row; }
}
`,
  "css-fluid-sizes": `.title { font-size: clamp(1.5rem, 4vw, 3rem); }
.section { padding: clamp(16px, 4vw, 48px); }
.container { width: min(100%, 720px); margin: 0 auto; }
.sidebar { width: max(200px, 25%); }
`,
  "css-container-queries": `.card-wrap { container-type: inline-size; container-name: card; }
.card { display: grid; gap: 12px; }
@container card (min-width: 400px) {
  .card { grid-template-columns: 120px 1fr; }
}
`,
};
