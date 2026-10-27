// Original Ördek Club vector rig, authored from geometry, not a downloaded asset.
// Rive v7 object/property definitions: rive-app/rive-runtime generated headers.
// Reproducible source for public/animations/ordek-club.riv. No editor/service needed.
import fs from "node:fs/promises";
import path from "node:path";
const output = path.resolve(import.meta.dirname, "../public/animations/ordek-club.riv");
const chunks = [Buffer.from("RIVE")];
function uint(n) { const bytes = []; do { let b = n & 127; n >>>= 7; if (n) b |= 128; bytes.push(b); } while (n); return Buffer.from(bytes); }
function float(n) { const b = Buffer.alloc(4); b.writeFloatLE(n); return b; }
function color(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; }
const u = (key, n) => [key, uint(n)], f = (key, n) => [key, float(n)];
const s = (key, text) => { const b = Buffer.from(text); return [key, Buffer.concat([uint(b.length), b])]; };
function object(type, ...props) { chunks.push(uint(type)); for (const [key, value] of props) chunks.push(uint(key), value); chunks.push(uint(0)); }
chunks.push(uint(7), uint(0), uint(0), uint(0)); // version, fileId, empty property ToC
object(23); // Backboard: required file-level owner of artboards (not an artboard component).
let nextId = 0;
function component(type, parent, name, ...props) { const id = nextId++; object(type, s(4, name), ...(parent === null ? [] : [u(5, parent)]), ...props); return id; }
component(1, null, "Ordek Club", f(7, 64), f(8, 64)); // artboard id 0
const ink = 0xff291747, gold = 0xffffd34d, beak = 0xffff9b3d;
function paint(shape, fill) { const id = component(20, shape, "fill"); component(18, id, "color", [37, color(fill)]); }
function ellipse(parent, name, x, y, w, h, fill) {
  const shape = component(3, parent, name, f(13, x), f(14, y));
  component(4, shape, "ellipse", f(20, w), f(21, h)); paint(shape, fill); return shape;
}
function polygon(parent, name, points, fill) {
  const shape = component(3, parent, name);
  const p = component(16, shape, "path", u(32, 1));
  for (const [x, y] of points) component(5, p, "vertex", f(24, x), f(25, y));
  paint(shape, fill); return shape;
}
// Rive's default drawable order is front-to-back in component order.
const sparkle = component(2, 0, "sparkle", f(13, 11), f(14, 12), f(16, 0), f(17, 0));
polygon(sparkle, "star", [[0,-5],[1.4,-1.4],[5,0],[1.4,1.4],[0,5],[-1.4,1.4],[-5,0],[-1.4,-1.4]], 0xff5c1fe2);
const rig = component(2, 0, "duck", f(13, 32), f(14, 37));
const wing = component(2, rig, "wing pivot", f(13, -8), f(14, 1));
ellipse(wing, "wing", 0, 3, 14, 9, 0xffffbf3f);
ellipse(wing, "wing outline", 0, 4, 17, 12, ink);
ellipse(rig, "eye glint", 13.5, -24.8, 1, 1, 0xffffffff);
const eye = ellipse(rig, "eye", 13, -24, 3.4, 4, ink);
ellipse(rig, "cheek", 12, -18, 4, 2, 0x66ff9b3d);
polygon(rig, "beak", [[19,-22.5],[25,-21],[19,-19]], beak);
polygon(rig, "beak outline", [[18,-24],[28,-21],[18,-17]], ink);
// Inner silhouette is painted over overlapping outer outlines to join the neck/body.
ellipse(rig, "head", 11, -21, 16, 16, gold);
ellipse(rig, "neck", 10, -8, 13, 30, gold);
ellipse(rig, "body", 0, 5, 38, 27, gold);
ellipse(rig, "head outline", 11, -21, 20, 20, ink);
ellipse(rig, "neck outline", 10, -8, 17, 33, ink);
ellipse(rig, "body outline", 0, 5, 42, 31, ink);
const shadow = ellipse(0, "shadow", 32, 58, 34, 4, 0x22291747);
function channel(id, key, frames) {
  object(25, u(51, id)); object(26, u(53, key));
  for (const [frame, value] of frames) object(30, u(67, frame), u(68, 1), f(70, value));
}
const poses = ["wave", "cheer", "search", "sleep", "level", "streak", "encourage"];
for (const pose of poses) {
  object(31, s(55, pose), u(56, 60), u(57, 60), u(59, 0));
  const celebrate = ["cheer", "level", "streak"].includes(pose);
  channel(rig, 14, celebrate ? [[0,37],[10,35],[22,30],[34,37],[42,35],[52,37],[60,37]] : [[0,37],[20,36],[40,37],[60,37]]);
  channel(rig, 15, pose === "search" ? [[0,0],[20,-.08],[40,.06],[60,0]] : [[0,0],[15,-.035],[35,.025],[60,0]]);
  channel(wing, 15, pose === "wave" || celebrate ? [[0,0],[12,-.8],[22,-.35],[32,-.8],[46,-.2],[60,0]] : [[0,0],[25,-.08],[60,0]]);
  channel(eye, 17, pose === "sleep" ? [[0,1],[20,.12],[60,.12]] : [[0,1],[26,1],[29,.15],[32,1],[60,1]]);
  channel(shadow, 16, celebrate ? [[0,1],[22,.78],[34,1],[60,1]] : [[0,1],[60,1]]);
  channel(sparkle, 16, celebrate ? [[0,0],[15,1],[40,1],[60,0]] : [[0,0],[60,0]]);
  channel(sparkle, 17, celebrate ? [[0,0],[15,1],[40,1],[60,0]] : [[0,0],[60,0]]);
}
// One small state machine per contextual pose; each enters its one-shot timeline.
poses.forEach((pose, index) => {
  object(53, s(55, `${pose}-state`)); object(57, s(138, "Pose"));
  object(63); object(65, u(151, 1)); // entry -> animation (layer state index 1)
  object(61, u(149, index)); object(64); object(62); // animation, exit, any
});
await fs.mkdir(path.dirname(output), { recursive: true });
const bytes = Buffer.concat(chunks);
await fs.writeFile(output, bytes);
console.log(`Original duck rig: ${bytes.length} bytes, ${poses.length} timelines/state machines.`);
