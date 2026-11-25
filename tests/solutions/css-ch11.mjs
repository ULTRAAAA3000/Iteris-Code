// Еталони завдань курсу CSS, глава 11 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_11 = {
  "css-portfolio-practice": `:root {
  color-scheme: light dark;
  --bg: #f5f7fb;
  --text: #1a1a1a;
  --accent: #1a237e;
}
body { background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; }
header { background: #1a237e; color: #ffffff; padding: 16px; }
nav { display: flex; gap: 16px; }
nav a { color: #ffffff; }
.projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card {
  background: #ffffff;
  color: #1a1a1a;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}
.card:hover { transform: translateY(-4px); }
footer { text-align: center; }
@media (max-width: 600px) {
  .projects { grid-template-columns: 1fr; }
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #14181f; --text: #e8eaed; }
}
`,
};
