// Özgün Lottie animasyonları: JSON elle değil küçük bir oluşturucuyla üretilir (dış dosya, CDN ya da lisanslı
// varlık yok). Slaytlarda dotLottie oynatıcısıyla, başarı ekranında lottie-web SVG oluşturucusuyla oynatılır.
type Vec = number[];
type Key = { t: number; s: Vec };
const ease = { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } };
const anim = (keys: Key[]) => ({ a: 1, k: keys.map((k, i) => (i < keys.length - 1 ? { ...k, ...ease } : k)) });
const fixed = (k: unknown) => ({ a: 0, k });
const rgba = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1]; };
const transform = { ty: "tr", p: fixed([0, 0]), a: fixed([0, 0]), s: fixed([100, 100]), r: fixed(0), o: fixed(100) };
const stroke = (hex: string, w: number) => ({ ty: "st", c: fixed(rgba(hex)), o: fixed(100), w: fixed(w), lc: 2, lj: 2 });
const fill = (hex: string) => ({ ty: "fl", c: fixed(rgba(hex)), o: fixed(100) });
const path = (pts: Vec[], closed = false) => ({ ty: "sh", ks: fixed({ c: closed, v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) }) });
const trim = (from: number, to: number) => ({ ty: "tm", s: fixed(0), e: anim([{ t: from, s: [0] }, { t: to, s: [100] }]), o: fixed(0), m: 1 });
const layer = (ind: number, shapes: object[], ks: Partial<Record<"p" | "s" | "o" | "r", object>> = {}) => ({
  ty: 4, ind, ip: 0, op: 90, st: 0, sr: 1, ao: 0, bm: 0,
  ks: { o: ks.o ?? fixed(100), r: ks.r ?? fixed(0), p: ks.p ?? fixed([100, 100, 0]), a: fixed([0, 0, 0]), s: ks.s ?? fixed([100, 100, 100]) },
  shapes: [{ ty: "gr", it: [...shapes, transform] }],
});
const comp = (layers: object[], op = 90) => ({ v: "5.7.4", fr: 30, ip: 0, op, w: 200, h: 200, nm: "club", ddd: 0, assets: [], layers });

const PURPLE = "#5c1fe2", GREEN = "#17ff74", CREAM = "#fffcf2", RED = "#ff5468";
const shield = [[0, -62], [52, -40], [46, 20], [0, 64], [-46, 20], [-52, -40]];

export const LOTTIE = {
  "shield-pulse": { title: "Kalkan (koruma)", data: comp([
    layer(1, [path(shield, true), fill(PURPLE), stroke(CREAM, 5)], { s: anim([{ t: 0, s: [92, 92, 100] }, { t: 22, s: [104, 104, 100] }, { t: 45, s: [96, 96, 100] }, { t: 90, s: [96, 96, 100] }]) }),
    layer(2, [path([[-22, 2], [-6, 18], [26, -16]]), stroke(GREEN, 9), trim(20, 45)]),
    layer(3, [{ ty: "el", p: fixed([0, 0]), s: fixed([150, 150]) }, stroke(PURPLE, 4)], { s: anim([{ t: 0, s: [70, 70, 100] }, { t: 60, s: [125, 125, 100] }]), o: anim([{ t: 0, s: [80] }, { t: 60, s: [0] }]) }),
  ]) },
  "lock-close": { title: "Kilit kapanıyor (şifreleme)", data: comp([
    layer(1, [{ ty: "rc", p: fixed([0, 22]), s: fixed([110, 84]), r: fixed(14) }, fill(PURPLE), stroke(CREAM, 5)]),
    layer(2, [path([[-34, -20], [-34, -52], [-20, -70], [20, -70], [34, -52], [34, 0]]), stroke(CREAM, 10)], { p: anim([{ t: 0, s: [100, 80, 0] }, { t: 28, s: [100, 100, 0] }]) }),
    layer(3, [{ ty: "el", p: fixed([0, 18]), s: fixed([18, 18]) }, fill(GREEN)], { o: anim([{ t: 26, s: [0] }, { t: 36, s: [100] }]) }),
  ]) },
  "check-draw": { title: "Onay işareti (doğru)", data: comp([
    layer(1, [{ ty: "el", p: fixed([0, 0]), s: fixed([150, 150]) }, stroke(GREEN, 8), trim(0, 24)]),
    layer(2, [path([[-36, 2], [-10, 28], [40, -26]]), stroke(GREEN, 12), trim(18, 40)]),
  ], 60) },
  "alert-blink": { title: "Uyarı (saldırı tespiti)", data: comp([
    layer(1, [path([[0, -66], [70, 58], [-70, 58]], true), fill(RED), stroke(CREAM, 4)], { o: anim([{ t: 0, s: [100] }, { t: 15, s: [45] }, { t: 30, s: [100] }, { t: 45, s: [45] }, { t: 60, s: [100] }]) }),
    layer(2, [path([[0, -24], [0, 18]]), stroke(CREAM, 12)]),
    layer(3, [{ ty: "el", p: fixed([0, 40]), s: fixed([14, 14]) }, fill(CREAM)]),
  ], 60) },
} as const;

export type LottieId = keyof typeof LOTTIE;
export const LOTTIE_IDS = Object.keys(LOTTIE) as [LottieId, ...LottieId[]];
