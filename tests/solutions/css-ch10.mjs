// Еталони завдань курсу CSS, глава 10 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_10 = {
  "css-variables-dark": `:root {
  --bg: #ffffff;
  --text: #111111;
  --accent: #1976d2;
}
body { background: var(--bg); color: var(--text); }
.btn { padding: 8px 14px; color: #ffffff; background: var(--accent); }
.note { color: var(--muted, #607d8b); }
.card { --accent: #d84315; }
`,
  "css-dark-theme": `:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --text: #111111;
}
body { background: var(--bg); color: var(--text); }
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #14181f;
    --text: #e8eaed;
  }
}
.badge { color: light-dark(#0d47a1, #90caf9); }
h1 { margin: 0 0 8px; }
`,
  "css-transitions": `.btn { background: #1976d2; color: #fff; border: 0; padding: 10px 16px; transition: background-color 0.3s ease; }
.btn:hover { background: #1565c0; transform: translateY(-2px); }
.card { transition: transform 0.2s; }
.card:hover { transform: scale(1.03); }
.icon:hover { transform: rotate(45deg); }
`,
  "css-keyframes": `@keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.pulse { color: #d32f2f; animation: pulse 1.5s ease-in-out infinite; }
.spinner { display: inline-block; animation: spin 1s linear infinite; }
.fade { animation: fade-in 0.6s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .pulse, .spinner, .fade { animation: none; }
}
`,
};
