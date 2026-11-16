# App v2 deviations

Accessibility wins where it conflicts with the App v2 prototype. Each conflict is listed here.

1. **Hero motion follows the reduced-motion setting.** The poster floats, the ring turns, and the gloss steps every 0.8 s, matching the prototype. If the device asks for reduced motion, or My settings chooses Reduce motion, those animations stop and the gloss stays still until Play is pressed.
2. **No hover-only actions.** Cards and controls do not depend on hover. Every action is a link or a button with a visible name.
3. **Focus ring.** The ring is a 3 px solid outline, offset 3 px, in the theme focus colour (`--lh-fc`). It is not a glow and it is not removed on click.
4. **Targets stay at least 44 px.** Prototype segments and waiting-pill buttons that were under 44 px are 44 px here. Player controls stay 56 px tall.
5. **Player controls stay on the bar.** The prototype puts seven controls in a More sheet. Hiding them behind that sheet would add a step before speed, mute, fullscreen, and keyboard help. Those controls stay visible. The signer window still has its own More menu for move, size, and pace.
6. **Settings is a modal dialog.** The prototype uses a custom overlay. This site uses `<dialog>.showModal()`, traps focus, and returns focus to My settings. Choices stay in `localStorage` under `db-demo:prefs` and are not sent anywhere.
7. **Text lesson has no video.** The article and the sign pin are the page. The pin launcher sits on the bottom left so it does not cover My settings on the bottom right.
8. **Signer without a photo is a drawn figure.** There is no empty black rectangle and no stock photo of a person. The lesson video uses `data/lesson-poster.webp` before play.
9. **Icons are inline, not a Material Symbols font.** A full icon font is not self-hosted. Buttons use text, or a small SVG where the old player already had one.
10. **Body type is Atkinson Hyperlegible.** The prototype names Atkinson Hyperlegible Next. The self-hosted face is Atkinson Hyperlegible (OFL). Display type is Bricolage Grotesque (OFL), self-hosted.
11. **Amharic size does not compound.** `lang="am"` on the page sets 112.5% once. Nested Amharic spans do not multiply that size. Line height stays 1.75 and letter-spacing stays 0.
12. **High contrast drops the glass blur.** The pill nav is a solid black bar with a white border. Other themes keep a solid-enough fill so text still meets contrast if blur is ignored.
13. **Placeholder numbers stay placeholders.** The coverage bar is labelled placeholder. The certificate mark is labelled as not a scannable code.
14. **Forms do not leave the device.** Contact and job apply validate locally and show a confirmation. They do not post to a server.
15. **Integrate lists only real attributes.** `src`, `poster`, `captions`, `sign`, `glossary`, `lang`, `api`, `lesson-id`, and `for` are the ones the player reads. Prototype names that the player does not implement are not shown as if they worked.
16. **Default theme is dark,** matching the prototype. `?theme=light`, `?theme=dark`, and `?theme=contrast` still switch the three themes for review.
