// Web Worker: виконує код користувача в ізоляції (без доступу до DOM сторінки).
import { runSuite } from "./core.ts";

interface Request { code: string; tests: string; nonce: string }
interface WorkerScope {
  postMessage(message: unknown): void;
  onmessage: ((ev: MessageEvent<Request>) => void) | null;
}
const ctx = self as unknown as WorkerScope & Record<string, unknown>;

ctx.onmessage = (ev) => {
  const { code, tests, nonce } = ev.data;
  // Зберігаємо оригінальний postMessage і вимикаємо його для коду користувача,
  // щоб відповіді можна було підробити лише знаючи одноразовий nonce.
  const post = ctx.postMessage.bind(ctx);
  ctx.postMessage = () => {};
  ctx.onmessage = null;
  // Найпростіше обмеження: код користувача не має виходити в мережу чи сховища.
  for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches"]) {
    try { Object.defineProperty(ctx, name, { value: undefined, configurable: true }); } catch { /* ігноруємо */ }
  }
  let lines = 0;
  runSuite(code, tests, (line) => { if (lines++ < 200) post({ nonce, type: "log", line: line.slice(0, 500) }); }).then((res) => post({ nonce, type: "done", ...res }));
};
