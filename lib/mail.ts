// Надсилання листів через Resend (HTTP API, працює у Cloudflare Workers без SMTP)
import type { Env } from "./env.ts";

export const mailConfigured = (env: Pick<Env, "RESEND_API_KEY" | "MAIL_FROM">): boolean => Boolean(env.RESEND_API_KEY && env.MAIL_FROM);

export async function sendMail(env: Pick<Env, "RESEND_API_KEY" | "MAIL_FROM">, to: string, subject: string, text: string): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export const verifyMail = (link: string): { subject: string; text: string } => ({
  subject: "Підтвердіть пошту — Iteris Code",
  text: `Вітаємо в Iteris Code!\n\nЩоб завершити реєстрацію, підтвердіть пошту за посиланням (діє 24 години):\n${link}\n\nЯкщо ви не реєструвалися, просто проігноруйте цей лист.`,
});

export const resetMail = (link: string): { subject: string; text: string } => ({
  subject: "Відновлення пароля — Iteris Code",
  text: `Ми отримали запит на відновлення пароля.\n\nЩоб задати новий пароль, перейдіть за посиланням (діє 1 годину):\n${link}\n\nЯкщо це були не ви, просто проігноруйте цей лист: ваш пароль не зміниться.`,
});
