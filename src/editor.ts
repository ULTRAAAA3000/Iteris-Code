// Редактор коду: Monaco (з CDN, завантажується тільки на сторінках із завданням) з простим запасним варіантом.
export interface CodeEditor {
  getValue(): string;
  setValue(v: string): void;
  onChange(cb: () => void): void;
  focus(): void;
  dispose(): void;
}

interface MonacoEditor {
  getValue(): string;
  setValue(v: string): void;
  onDidChangeModelContent(cb: () => void): unknown;
  focus(): void;
  getModel(): { dispose(): void } | null;
  dispose(): void;
}
interface MonacoApi {
  editor: { create(el: HTMLElement, o: Record<string, unknown>): MonacoEditor; setTheme(t: string): void };
}
interface MonacoWindow extends Window {
  require?: { (deps: string[], ok: () => void, fail: (e: unknown) => void): void; config(c: { paths: Record<string, string> }): void };
  monaco?: MonacoApi;
  MonacoEnvironment?: { getWorkerUrl(): string };
  /** Прапорець для тестів: одразу використовувати запасний редактор */
  __IC_PLAIN_EDITOR?: boolean;
}

const BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs";
let loading: Promise<MonacoApi> | null = null;

const isDark = (): boolean => {
  const t = document.documentElement.getAttribute("data-theme");
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};

function loadMonaco(timeoutMs = 10000): Promise<MonacoApi> {
  const w = window as MonacoWindow;
  if (w.monaco) return Promise.resolve(w.monaco);
  loading ??= new Promise<MonacoApi>((resolve, reject) => {
    const timer = setTimeout(() => { loading = null; reject(new Error("timeout")); }, timeoutMs);
    const fail = (e: unknown) => { clearTimeout(timer); loading = null; reject(e); };
    const s = document.createElement("script");
    s.src = BASE + "/loader.js";
    s.onerror = () => fail(new Error("load"));
    s.onload = () => {
      const req = w.require;
      if (!req) return fail(new Error("no loader"));
      req.config({ paths: { vs: BASE } });
      // Воркери Monaco повинні завантажуватись із того ж походження: обходимо через Blob
      w.MonacoEnvironment = {
        getWorkerUrl: () => URL.createObjectURL(new Blob([`self.MonacoEnvironment={baseUrl:'${BASE}/'};importScripts('${BASE}/base/worker/workerMain.js');`], { type: "text/javascript" })),
      };
      req(["vs/editor/editor.main"], () => { clearTimeout(timer); w.monaco ? resolve(w.monaco) : fail(new Error("no monaco")); }, fail);
    };
    document.head.appendChild(s);
  });
  return loading;
}

function plainEditor(host: HTMLElement, value: string): CodeEditor {
  const ta = document.createElement("textarea");
  ta.className = "ws-plain";
  ta.value = value;
  ta.spellcheck = false;
  ta.setAttribute("aria-label", "Редактор коду");
  ta.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    const { selectionStart: a, selectionEnd: b } = ta;
    ta.value = ta.value.slice(0, a) + "  " + ta.value.slice(b);
    ta.selectionStart = ta.selectionEnd = a + 2;
    ta.dispatchEvent(new Event("input"));
  });
  host.replaceChildren(ta);
  return {
    getValue: () => ta.value,
    setValue: (v) => { ta.value = v; ta.dispatchEvent(new Event("input")); },
    onChange: (cb) => ta.addEventListener("input", cb),
    focus: () => ta.focus(),
    dispose: () => ta.remove(),
  };
}

export async function createEditor(host: HTMLElement, opts: { value: string; language: string }): Promise<CodeEditor> {
  if ((window as MonacoWindow).__IC_PLAIN_EDITOR) return plainEditor(host, opts.value);
  host.textContent = "Завантаження редактора…";
  try {
    const monaco = await loadMonaco();
    host.textContent = "";
    const ed = monaco.editor.create(host, {
      value: opts.value, language: opts.language, theme: isDark() ? "vs-dark" : "vs",
      automaticLayout: true, minimap: { enabled: false }, fontSize: 14, tabSize: 2,
      scrollBeyondLastLine: false, padding: { top: 12 },
    });
    const obs = new MutationObserver(() => monaco.editor.setTheme(isDark() ? "vs-dark" : "vs"));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return {
      getValue: () => ed.getValue(),
      setValue: (v) => ed.setValue(v),
      onChange: (cb) => { ed.onDidChangeModelContent(cb); },
      focus: () => ed.focus(),
      dispose: () => { obs.disconnect(); const m = ed.getModel(); ed.dispose(); m?.dispose(); },
    };
  } catch {
    return plainEditor(host, opts.value); // немає мережі або CDN недоступний
  }
}
