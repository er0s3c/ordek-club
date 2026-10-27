# Animation integrations

The application keeps its existing license. The following incorporated sources retain their own
licenses; the Animate UI adaptation is not relicensed as plain MIT.

| Source | Pinned version / source | Local use | License |
|---|---|---|---|
| motiondivision/motion | motion 14.6.0 (package-lock.json) | MotionConfig, LazyMotion, layout and native dialog animation | MIT, notice in installed package |
| ibelick/motion-primitives | commit 120f64f6ca60348e251f929e9c81f11ccbe45eda; components/core/animated-background.tsx | src/components/motion/AnimatedBackground.tsx, controlled accessible tab adaptation | [Original MIT notice](licenses/motion-primitives.txt) |
| formkit/auto-animate | 0.10.0 (package-lock.json) | AnimatedList; OS and account motion preferences | MIT, notice in installed package |
| imskyleen/animate-ui | registry primitives-radix-accordion, retrieved 2026-10-24; upstream main c28163655493f98bff9dc0362301a6242f74a1fd | src/components/motion/ModuleAccordion.tsx; adapted keepRendered Radix/Motion implementation | [MIT + Commons Clause notice](licenses/animate-ui.txt) |
| radix-ui/primitives | @radix-ui/react-accordion 1.3.1 | Keyboard/focus and accordion semantics | MIT, notice in installed package |
| rive-app/rive-react and rive-app/rive-wasm | @rive-app/react-canvas 4.37.1, @rive-app/canvas 2.45.1 | Lazy Rive mascot renderer and self-hosted WASM | MIT, [preserved runtime notice](licenses/rive.txt) |

Original asset: public/animations/ordek-club.riv is authored for this project by
scripts/build-duck-rive.mjs. It contains original vector geometry and seven contextual one-shot
timelines/state machines. It is not a marketplace/community animation. Rebuild with npm run motion:duck.
Runtime WASM files are copied from the pinned package using npm run motion:assets; no runtime CDN is used.

Sources:
- https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/animated-background.tsx
- https://animate-ui.com/r/primitives-radix-accordion.json
- https://github.com/imskyleen/animate-ui
- https://github.com/rive-app/rive-react
- https://github.com/rive-app/rive-wasm

# Slide, workshop and studio integrations (2026-10-24)

All packages are pinned in package.json and used unmodified. Runtime WASM, fonts and editor bundles are
copied from the installed packages by `npm run vendor:assets` into `public/vendor/` (git-ignored); no CDN.

| Package | Version | Local use | License |
|---|---|---|---|
| animejs | 4.5.0 | Packet trails / ripples in flow animations | MIT |
| gsap (+ DrawSVGPlugin) | 3.15.0 | Path drawing in flow animations | GSAP Standard "no charge" license (https://gsap.com/standard-license) |
| @motion-canvas/core, @motion-canvas/2d | 3.17.2 | Narrated scene blocks (src/animations/scenes.ts) | MIT |
| @lottiefiles/dotlottie-web | 0.81.0 | Lottie blocks (original animations in src/animations/lottie.ts) | MIT |
| lottie-web | 5.13.0 | Success check animation | MIT |
| shiki, shiki-magic-move | 4.5.0, 1.3.2 | Code highlighting and code morphs on slides | MIT |
| codehike | 1.1.0 | Annotated code in lessons (mark/diff/callout) | MIT |
| @theatre/core | 0.7.2 | Slide choreography playback | Apache-2.0 |
| @theatre/studio | 0.7.2 | Staff-only keyframe editor in Club Studio (lazy loaded) | **AGPL-3.0-only** — see note below |
| roughjs | 4.6.6 | Sketch style for flow animations | MIT |
| elkjs | 0.12.0 | Automatic layout for flow animations | EPL-2.0 OR GPL-3.0-or-later |
| asciinema-player | 3.17.0 | Typed terminal recordings on slides | Apache-2.0 |
| mermaid | 12.2.0 | Diagram blocks and lesson diagrams (securityLevel strict) | MIT |
| @excalidraw/excalidraw | 0.18.1 | Sketch blocks and whiteboard editor | MIT |
| @xyflow/react | 12.12.0 | Network and evidence-map workshops | MIT |
| cytoscape | 3.34.4 | Skill graph | MIT |
| monaco-editor | 0.57.0 | Secure-code workshop editor | MIT |
| pyodide | 314.0.7 | In-browser Python sandbox (secure-code workshop) | MPL-2.0 |
| v86 | 0.5.472 | In-browser Linux lab (BIOS/OS images supplied by the operator, see docs/V86-LAB.md) | BSD-2-Clause |
| @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities | 6.3.1, 10.0.0, 3.2.2 | Timeline workshop and slide sorting | MIT |
| yjs, y-protocols, lib0 | 13.6.33, 1.0.7, 0.2.119 | Club Studio co-editing (/ws/studio) | MIT |

Ideas only (no code copied): reveal.js auto-animate and presenter view, Slidev presenter mode, Marp Markdown
syntax (src/lib/marp-import.ts), CTFd dynamic scoring (src/server/ctf/data.ts), motion-primitives TextEffect /
AnimatedNumber / InView (src/components/motion/Primitives.tsx, original implementations).

**Note on @theatre/studio (AGPL-3.0-only):** the studio UI is shipped to staff browsers when they open the
keyframe editor. Operators who distribute or serve this application should review AGPL obligations; to drop it,
remove `ChoreoEditor` from Club Studio and the `@theatre/studio` dependency — playback uses only @theatre/core
(Apache-2.0).
