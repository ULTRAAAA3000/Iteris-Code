// Еталони завдань курсу CSS, глава 03 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_03 = {
  "css-cascade": `h1 { color: #1565c0; }

.note { color: #1565c0; font-size: 20px; }
.warn { color: #c62828; }

h1 { color: #2e7d32; }
`,
  "css-specificity": `h1 { color: #1565c0; }
.big { color: #c62828; }
.card p { color: #424242; }

#title { color: #2e7d32; }

.card p.lead { color: #6a1b9a; }
`,
  "css-inherit-layers": `body { color: #263238; font-size: 18px; }
a { color: inherit; }

@layer base, theme;

@layer base {
  button.btn { background-color: #1565c0; }
}

@layer theme {
  .btn { background-color: #2e7d32; }
}
`,
};
