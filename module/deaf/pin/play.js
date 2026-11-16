// FR-DEAF-05: Play one sentence playlist in the floating sign window.
import { attachSignPlay } from "../sign-play.js";

export function createPlayback(win) {
  const state = {
    segments: [], index: 0, item: 0, front: 0, base: new URL("/demo/data/", import.meta.url).href, stall: 0, pauseAt: 0,
    armed: false, want: 0, hitTo: false, playId: 0
  };
  let paused = false;
  let finishId = 0;
  let onDone = () => {};
  const engine = attachSignPlay(win, state, {
    items: (segment) => segment?.playlist || [],
    rate: () => win.rate || 1,
    paused: () => paused,
    started: () => {},
    next: () => null,
    ended: () => done(),
    fail: () => done()
  });
  function done() {
    if (!finishId || finishId !== state.playId) return;
    finishId = 0;
    onDone();
  }
  return {
    play(list, doneWith) {
      state.playId += 1;
      finishId = state.playId;
      onDone = doneWith || (() => {});
      paused = false;
      clearTimeout(state.stall);
      state.segments = [{ playlist: list || [] }];
      state.index = 0;
      state.item = 0;
      state.hitTo = false;
      win.show("");
      if (!list?.length) {
        finishId = 0;
        onDone();
        return;
      }
      engine.playItem(list[0], list[0].from || 0);
    },
    pause() {
      paused = true;
      clearTimeout(state.stall);
      win.video?.pause();
      win.videoB?.pause();
    },
    resume() {
      paused = false;
      engine.active()?.play?.().catch(() => done());
    },
    stop() {
      state.playId += 1;
      finishId = 0;
      paused = true;
      clearTimeout(state.stall);
      win.hide();
    },
    toggleRate() {
      win.rate = win.rate === 0.75 ? 1 : 0.75;
      win.paint();
      engine.applyRate();
      return win.rate;
    }
  };
}
