// Cookie сесії для піддоменів: на iteris-code.org вхід діє і на dashboard.iteris-code.org; на pages.dev лишається по-старому.
import assert from "node:assert/strict";
import { cookieDomain, json, sessionCookie, sessionCookies } from "../lib/session.ts";

const req = (host) => new Request(`https://${host}/api/auth/login`, { method: "POST" });
let n = 0;
const t = (name, fn) => { fn(); n++; console.log("ok  -", name); };

t("cookieDomain: основний домен, його піддомени й www отримують спільну cookie", () => {
  for (const h of ["iteris-code.org", "www.iteris-code.org", "dashboard.iteris-code.org"]) assert.equal(cookieDomain(req(h)), "iteris-code.org", h);
});
t("cookieDomain: pages.dev, localhost і схожі чужі домени лишаються без Domain", () => {
  for (const h of ["iteris-code.pages.dev", "localhost", "evil-iteris-code.org", "iteris-code.org.evil.com"]) assert.equal(cookieDomain(req(h)), null, h);
  assert.equal(cookieDomain(undefined), null);
});
t("змінна COOKIE_DOMAIN перевизначає домен", () => {
  assert.equal(cookieDomain(req("app.example.com"), { COOKIE_DOMAIN: ".example.com" }), "example.com");
  assert.equal(cookieDomain(req("iteris-code.org"), { COOKIE_DOMAIN: "example.com" }), null);
});
t("sessionCookie: на основному домені є Domain=.iteris-code.org, HttpOnly, Secure, SameSite=Lax", () => {
  const c = sessionCookie("abc", 100, req("dashboard.iteris-code.org"));
  assert.match(c, /^session=abc; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=100; Domain=\.iteris-code\.org$/);
});
t("sessionCookie без домену (pages.dev) не містить Domain", () => {
  assert.ok(!/Domain=/i.test(sessionCookie("abc", 100, req("iteris-code.pages.dev"))));
  assert.ok(!/Domain=/i.test(sessionCookie("abc", 100)));
});
t("sessionCookies: на основному домені другою йде очистка старої cookie лише для хоста; на pages.dev одна cookie", () => {
  const two = sessionCookies("abc", 100, req("iteris-code.org"));
  assert.equal(two.length, 2);
  assert.match(two[0], /Domain=\.iteris-code\.org/);
  assert.match(two[1], /^session=; .*Max-Age=0$/);
  assert.ok(!/Domain=/i.test(two[1]));
  assert.equal(sessionCookies("abc", 100, req("iteris-code.pages.dev")).length, 1);
});
t("json: кілька Set-Cookie лишаються окремими заголовками", () => {
  const r = json({ ok: true }, 200, { "Set-Cookie": sessionCookies("abc", 100, req("iteris-code.org")) });
  assert.equal(r.headers.getSetCookie().length, 2);
  assert.equal(r.headers.get("Cache-Control"), "no-store");
  assert.equal(json({}, 200, { "Set-Cookie": "a=b" }).headers.getSetCookie().length, 1);
});

console.log(`\nУсі перевірки cookie піддоменів пройдено: ${n}`);
