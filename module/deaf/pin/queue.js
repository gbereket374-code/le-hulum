// FR-IN-04: Move through sentences, then the next block, and stop.
export function createQueue(blocks) {
  return {
    blocks: blocks || [],
    block: 0,
    sentence: 0,
    stopped: false,
    current() {
      const group = this.blocks[this.block];
      const item = group?.sentences?.[this.sentence];
      if (!group || !item) return null;
      return {
        block: this.block,
        sentence: this.sentence,
        blockCount: this.blocks.length,
        sentenceCount: group.sentences.length,
        item
      };
    },
    next(cont) {
      if (this.stopped) return null;
      const group = this.blocks[this.block];
      if (!group) return null;
      if (this.sentence + 1 < group.sentences.length) {
        this.sentence += 1;
        return this.current();
      }
      if (cont && this.block + 1 < this.blocks.length) {
        this.block += 1;
        this.sentence = 0;
        return this.current();
      }
      return null;
    },
    prev() {
      if (this.stopped) return null;
      if (this.sentence > 0) {
        this.sentence -= 1;
        return this.current();
      }
      if (this.block > 0) {
        this.block -= 1;
        this.sentence = Math.max(0, this.blocks[this.block].sentences.length - 1);
        return this.current();
      }
      return this.current();
    },
    stop() {
      this.stopped = true;
      return null;
    }
  };
}
