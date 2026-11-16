// Герої платформи (айдоли): одинадцять персонажів. Їх можна вибрати аватаркою, а згодом вони ведуть користувача по сайту.
// Список спільний для сайту й сервера (сервер перевіряє, що вибрано існуючого героя). Докладніше: Documentation/idols.md.
// Картинки: static/idols/<id>.webp (320 px, для аватарок) і static/idols/<id>-og.jpg (600 px, для карток у месенджерах).

export interface Idol {
  id: string;
  name: string;
  /** Колір фону картинки: використовується як рамка й підкладка, поки картинка вантажиться */
  color: string;
  /** Як виглядає, для alt-тексту */
  look: string;
}

export const IDOLS: readonly Idol[] = [
  { id: "mo", name: "Мо", color: "#8246FC", look: "м'ятно-бірюзовий герой із ноутбуком і піднятим великим пальцем" },
  { id: "teo", name: "Тео", color: "#FD8235", look: "помаранчевий герой у навушниках із планшетом" },
  { id: "mika", name: "Міка", color: "#4079FD", look: "білий котик із розкритою книгою та лампочкою-ідеєю" },
  { id: "nox", name: "Нокс", color: "#11D6DD", look: "темний робот зі світними очима-стрілками й зіркою на грудях" },
  { id: "lulu", name: "Лулу", color: "#FB65C8", look: "лавандова героїня з ракетою в руках" },
  { id: "andrew", name: "Ендрю", color: "#AAF784", look: "блакитний герой з ноутбуком і вікнами сайту поруч" },
  { id: "rex", name: "Рекс", color: "#8F45FC", look: "червоний геймер у навушниках із геймпадом" },
  { id: "zak", name: "Зак", color: "#AFF07F", look: "бірюзовий герой із сумкою через плече й знаком миру" },
  { id: "piko", name: "Піко", color: "#FCA447", look: "рожевий герой у в'язаній шапці й шарфі" },
  { id: "limo", name: "Лімо", color: "#5CADFC", look: "жовтий герой, що спить, обійнявши чорного кота" },
  { id: "noa", name: "Ноа", color: "#FB75DD", look: "фіолетовий герой в окулярах, що читає книгу" },
];

export const idolById = (id: unknown): Idol | undefined => (typeof id === "string" ? IDOLS.find((i) => i.id === id) : undefined);

/** Герой за замовчуванням для користувача без вибору: стабільний за нікнеймом (той самий нік дає того самого героя) */
export function defaultIdol(seed: string): Idol {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return IDOLS[h % IDOLS.length];
}

export const idolSrc = (id: string): string => `/idols/${id}.webp`;
export const idolOgSrc = (id: string): string => `/idols/${id}-og.jpg`;
