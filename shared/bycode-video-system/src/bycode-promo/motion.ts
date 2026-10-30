/** Frame is relative to the nearest Sequence. Start/duration are local frame counts. */
export const entranceProgress = (frame: number, start: number, duration: number): number => {
  if (![frame, start, duration].every(Number.isFinite) || duration < 0) {
    throw new RangeError("Motion needs finite frames and a non-negative duration");
  }
  if (duration === 0) return frame >= start ? 1 : 0;
  const progress = Math.min(1, Math.max(0, (frame - start) / duration));
  return 1 - (1 - progress) ** 3;
};
