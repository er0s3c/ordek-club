// Studio ortak düzenleme belgesinin biçimi (istemci ve sunucu ortak).
// meta: { title, description } · slides: Y.Array<Y.Map{ uid, json }> — her slayt JSON metni olarak tutulur.
// Farklı slaytlardaki eşzamanlı düzenlemeler birleşir; aynı slayt için son yazan kazanır (farkındalık kimin nerede
// olduğunu gösterir). Ekleme/silme/taşıma ayrı işlemlerdir, böylece eşzamanlı eklemeler çoğalmaz.
import * as Y from "yjs";
import { studioDeck, type Deck } from "@/lib/deck-schema";

export const COLLAB_PATH = "/ws/studio";
type Slide = Deck["slides"][number];

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function slideMap(s: Slide) {
  const m = new Y.Map<string>();
  m.set("uid", uid());
  m.set("json", JSON.stringify(s));
  return m;
}

export const slidesOf = (doc: Y.Doc) => doc.getArray<Y.Map<string>>("slides");
export const metaOf = (doc: Y.Doc) => doc.getMap<string>("meta");

export function seedDoc(doc: Y.Doc, deck: Deck) {
  doc.transact(() => {
    metaOf(doc).set("title", deck.title);
    metaOf(doc).set("description", deck.description);
    slidesOf(doc).push(deck.slides.map(slideMap));
  });
}

// Belgeden deste okunur; bozuk slayt JSON'u boş slayta düşer (içerik her zaman düz metin olarak çizilir).
export function readDoc(doc: Y.Doc): Deck | null {
  const arr = slidesOf(doc);
  if (arr.length === 0) return null;
  const slides = arr.toArray().map((m) => { try { return JSON.parse(m.get("json") ?? "{}") as unknown; } catch { return {}; } });
  return studioDeck({ title: metaOf(doc).get("title") ?? "", description: metaOf(doc).get("description") ?? "", slides });
}

export const ops = {
  update(doc: Y.Doc, i: number, s: Slide) { const m = slidesOf(doc).get(i); if (m) m.set("json", JSON.stringify(s)); },
  insert(doc: Y.Doc, i: number, s: Slide) { slidesOf(doc).insert(Math.min(i, slidesOf(doc).length), [slideMap(s)]); },
  remove(doc: Y.Doc, i: number) { if (i < slidesOf(doc).length) slidesOf(doc).delete(i, 1); },
  move(doc: Y.Doc, from: number, to: number) {
    const arr = slidesOf(doc);
    const m = arr.get(from);
    if (!m) return;
    const json = m.get("json") ?? "{}";
    arr.delete(from, 1);
    const n = new Y.Map<string>();
    n.set("uid", m.get("uid") ?? uid());
    n.set("json", json);
    arr.insert(Math.min(to, arr.length), [n]);
  },
  replace(doc: Y.Doc, deck: Deck) {
    const arr = slidesOf(doc);
    arr.delete(0, arr.length);
    metaOf(doc).set("title", deck.title);
    metaOf(doc).set("description", deck.description);
    arr.push(deck.slides.map(slideMap));
  },
  meta(doc: Y.Doc, title: string, description: string) {
    if (metaOf(doc).get("title") !== title) metaOf(doc).set("title", title);
    if (metaOf(doc).get("description") !== description) metaOf(doc).set("description", description);
  },
};
