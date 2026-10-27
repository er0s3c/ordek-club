import type { Dict } from "../translate";
import app from "./app.json";
import academy from "./academy.json";
import admin from "./admin.json";
import teach from "./teach.json";
import server from "./server.json";
import content from "./content.json";

// İngilizce sözlük: anahtar Türkçe kaynak metin, değer İngilizce karşılığı. Dosyalar alana göre
// bölünür (scripts/i18n.mjs extract ile güncellenir); eksik anahtar Türkçe görünür.
// İstemcide yalnızca dil İngilizce olduğunda tembel yüklenir (Türkçe kullanıcı indirmez).
export const EN: Dict = Object.freeze({ ...content, ...server, ...admin, ...teach, ...academy, ...app });
