// Типи середовища Cloudflare Pages Functions
export interface Env {
  DB: D1Database;
  /** Статичні файли сайту (підставляє Cloudflare Pages): із них береться index.html для сторінок профілів */
  ASSETS?: Fetcher;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
  /** Домен, на якому cookie сесії діє і на піддоменах (кабінет живе на dashboard.<домен>). За замовчуванням iteris-code.org */
  COOKIE_DOMAIN?: string;
  /** Cloudflare Turnstile: публічний ключ віджета (його бачить браузер) */
  TURNSTILE_SITE_KEY?: string;
  /** Cloudflare Turnstile: секретний ключ перевірки на сервері */
  TURNSTILE_SECRET_KEY?: string;
  /** Resend: ключ API для листів (підтвердження пошти, відновлення пароля) */
  RESEND_API_KEY?: string;
  /** Адреса відправника, наприклад "Iteris Code <noreply@your-domain>" */
  MAIL_FROM?: string;
  /** Куди пересилати звернення з форми підтримки (/contact). Без нього звернення лише зберігаються в базі */
  SUPPORT_EMAIL?: string;
  /** Lemon Squeezy: секрет подписи вебхука */
  LEMONSQUEEZY_WEBHOOK_SECRET?: string;
  /** Lemon Squeezy: ссылка на оплату тарифа Pro, например https://магазин.lemonsqueezy.com/checkout/buy/<id> */
  LEMONSQUEEZY_CHECKOUT_URL?: string;
  /** Необязательно: принимать события только для этого варианта товара */
  LEMONSQUEEZY_VARIANT_ID?: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  is_pro: number;
  pro_until: string | null;
  streak_count: number;
  last_active_at: string | null;
  /** Публічний профіль (етап 4): нікнейм, вибраний герой-аватарка */
  nick?: string | null;
  avatar_id?: string | null;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isPro: boolean;
  proUntil: string | null;
  streak: number;
  /** Нікнейм публічного профілю (задається один раз) і вибраний герой-аватарка */
  nick?: string | null;
  avatarId?: string | null;
}
