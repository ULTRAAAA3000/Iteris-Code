// Публичная конфигурация OAuth для фронтенда (client_id не секретный)
import { json } from "../../../lib/session.js";

export const onRequestGet = ({ env }) => json({ clientId: env.GOOGLE_CLIENT_ID || null });
