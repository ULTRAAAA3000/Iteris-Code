// Еталони завдань курсу CSS, глава 02 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_02 = {
  "css-combinators": `section p { font-size: 18px; }
section > p { color: #1a237e; }
h2 + p { font-weight: 700; }
`,
  "css-attr-selectors": `a[href^="https"] { color: #2e7d32; }
a[href$=".pdf"] { font-weight: 700; }
input[type="email"] { background-color: #e8f0fe; }
input[disabled] { background-color: #eeeeee; }
`,
  "css-pseudo": `.list li { border-bottom: 1px solid #cccccc; }
.list li:last-child { border-bottom: none; }
.list li:first-child { font-weight: 700; }
.btn:hover { background-color: #283593; }
.btn:focus-visible { outline: 2px solid #ff9800; }
input:disabled { background-color: #eeeeee; }
`,
  "css-pseudo-elements": `.btn::after { content: "→"; }
.required::before {
  content: "*";
  color: #d32f2f;
}
.lead::first-letter { font-size: 32px; }
input::placeholder { color: #999999; }
`,
  "css-advanced-selectors": `.rows li:nth-child(odd) { background-color: #f0f4ff; }
:is(h1, h2) { color: #1a237e; }
.todo li:not(.done) { font-weight: 700; }
.card:has(img) { background-color: #fff8e1; }
`,
};
