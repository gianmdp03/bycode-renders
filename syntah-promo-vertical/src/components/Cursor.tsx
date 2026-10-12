import React from "react";
import { interpolate } from "remotion";
import { clamp, ease } from "../theme";

export const Cursor: React.FC<{
  frame: number;
  clickAt: number;
  from: [number, number];
  to: [number, number];
}> = ({ frame, clickAt, from, to }) => {
  const x = interpolate(frame, [clickAt - 40, clickAt - 4], [from[0], to[0]], {
    ...clamp,
    easing: ease,
  });
  const y = interpolate(frame, [clickAt - 40, clickAt - 4], [from[1], to[1]], {
    ...clamp,
    easing: ease,
  });
  const pulse = interpolate(frame, [clickAt, clickAt + 22], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: interpolate(
          frame,
          [clickAt - 42, clickAt - 34, clickAt + 25, clickAt + 43],
          [0, 1, 1, 0],
          clamp,
        ),
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          left: -40,
          top: -40,
          border: "3px solid #3987FF",
          borderRadius: "50%",
          opacity: frame >= clickAt ? 1 - pulse : 0,
          scale: 0.25 + pulse,
        }}
      />
      <svg
        width="39"
        height="49"
        viewBox="0 0 32 40"
        style={{
          filter: "drop-shadow(0 4px 5px #0004)",
          scale: interpolate(
            frame,
            [clickAt - 3, clickAt, clickAt + 8],
            [1, 0.82, 1],
            clamp,
          ),
        }}
      >
        <path
          d="M2 2v29l8-7 6 13 6-3-6-12 11-1L2 2Z"
          fill="#12243D"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
