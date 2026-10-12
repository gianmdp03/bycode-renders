import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { PointlyMark } from "../components/Brand";
import { Stage } from "../components/Stage";
import { PointlyUI } from "../components/PointlyUI";
import { clamp, ease } from "../theme";

export const Pointly = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Interactive.Div
        name="Pointly portrait identity"
        style={{
          position: "absolute",
          left: 90,
          top: 273,
          opacity: interpolate(frame, [0, 14], [0.4, 1], clamp),
          translate: interpolate(frame, [0, 25], ["0px 22px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 27 }}>
          <PointlyMark size={100} />
          <strong style={{ fontSize: 112, letterSpacing: "-.05em" }}>
            Pointly
          </strong>
        </div>
        <div
          style={{
            fontSize: 52,
            lineHeight: 1.22,
            color: "#B8C7DF",
            marginTop: 30,
          }}
        >
          Fidelización con
          <br />
          <span style={{ color: "#80B0FF" }}>puntos y premios.</span>
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="Pointly portrait UI camera"
        style={{
          position: "absolute",
          left: 90,
          top: 610,
          transformOrigin: "50% 50%",
          scale: interpolate(frame, [0, 30, 120, 260], [0.975, 1, 1, 1.015], {
            ...clamp,
            easing: ease,
          }),
          translate: interpolate(frame, [0, 30], ["0px 36px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <PointlyUI frame={frame} />
      </Interactive.Div>
    </Stage>
  );
};
