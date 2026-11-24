// Еталони завдань курсу CSS, глава 04 (id завдання -> повний style.css). У сайт не потрапляють.
export const SOLUTIONS_04 = {
  "css-colors-units": `h1 { color: #1565c0; }
.price { color: rgb(211, 47, 47); }
.btn { background-color: hsl(210, 80%, 40%); color: #ffffff; }
.overlay { background-color: rgba(0, 0, 0, 0.5); }
`,
  "css-length-units": `h1 { font-size: 2.5rem; }
.lead { font-size: 1.25rem; }
.box { border: 1px solid #b0bec5; padding: 1.5rem; }
.btn { font-size: 1.5rem; padding: 0.5em 1em; }
.hero { min-height: 60vh; }
`,
  "css-fonts": `body { font-family: system-ui, "Segoe UI", Arial, sans-serif; }
code { font-family: Consolas, "Courier New", monospace; }

@font-face {
  font-family: "Brand";
  src: url("fonts/brand.woff2") format("woff2");
  font-display: swap;
}

h1 { font-family: "Brand", Georgia, serif; }
.lead { font-weight: 300; }
.quote { font-style: italic; }
`,
  "css-text-spacing": `body { line-height: 1.6; }
h1 { text-transform: uppercase; letter-spacing: 2px; text-align: center; }
a { text-decoration: none; }
.comment { overflow-wrap: break-word; }
.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`,
  "css-text-backgrounds": `.hero {
  background-color: #0d47a1;
  background-image: linear-gradient(135deg, #0d47a1, #42a5f5);
  color: #ffffff;
}
.badge { background-image: radial-gradient(circle, #ffffff, #90caf9); }
.photo {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
`,
  "css-borders-shadows": `.card {
  border: 2px solid #1a237e;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.avatar { border-radius: 50%; }
.pill { border-radius: 999px; }
.pill:focus-visible { outline: 3px solid #ffb300; outline-offset: 2px; }
`,
};
