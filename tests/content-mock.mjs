// Підміна /api/courses та /api/lesson для UI-тестів: ті самі функції, що працюють на сервері, і та сама умова (лише після входу).
import { projectById } from "../content/projects/index.ts";
import { courseOutline, lessonPayload } from "../lib/content.ts";

const clone = (x) => JSON.parse(JSON.stringify(x));

/** [статус, тіло] для адрес змісту або null, якщо адреса не стосується уроків */
export function contentReply(url, me) {
  if (typeof url !== "string") return null;
  if (url === "/api/courses") return me ? [200, clone(courseOutline())] : [401, { error: "unauthorized" }];
  if (url.startsWith("/api/lesson?")) {
    if (!me) return [401, { error: "unauthorized" }];
    const q = new URL(url, "https://x.test").searchParams, p = lessonPayload(q.get("k") ?? "", Number(q.get("n")));
    return p ? [200, clone(p)] : [404, { error: "not_found" }];
  }
  if (url.startsWith("/api/project?")) {
    if (!me) return [401, { error: "unauthorized" }];
    const p = projectById(new URL(url, "https://x.test").searchParams.get("id") ?? "");
    return p ? [200, clone(p)] : [404, { error: "not_found" }];
  }
  return null;
}
