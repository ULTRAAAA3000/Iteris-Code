// Спільні UI-хуки, щоб модулі не залежали один від одного циклічно
export const ui = {
  render: (): void => {},
  authListeners: new Set<() => void>(),
  notifyAuth(): void {
    this.authListeners.forEach((f) => f());
  },
};

export function toast(msg: string): void {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}
