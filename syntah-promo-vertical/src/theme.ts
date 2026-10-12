import { Easing, interpolate } from "remotion";

export const theme = {
  width: 1080,
  height: 1920,
  fps: 60,
  duration: 1440,
  ink: "#090D17",
  surface: "#111824",
  line: "#283447",
  white: "#F8FAFF",
  muted: "#A5B3C8",
  blue: "#397BFF",
  syntah: "#0F708B",
  pointly: "#1A73E8",
  doctor: "#006874",
  font: "Product Sans, sans-serif",
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const progress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: ease,
  });

// Editorial beat boundaries. No transition overlaps: exactly 24 seconds.
export const beats = [
  { id: "Opening", start: 0, frames: 180 },
  { id: "Products", start: 180, frames: 120 },
  { id: "Pointly", start: 300, frames: 300 },
  { id: "DoctorChart", start: 600, frames: 300 },
  { id: "Ecosystem", start: 900, frames: 240 },
  { id: "Closing", start: 1140, frames: 300 },
] as const;
