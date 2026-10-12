import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { DoctorMark } from "../components/Brand";
import { Stage } from "../components/Stage";
import { DoctorUI } from "../components/DoctorUI";
import { clamp, ease } from "../theme";

export const DoctorChart = () => {
  const frame = useCurrentFrame();
  return (
    <Stage accent="#135B64">
      <Interactive.Div
        name="DoctorChart portrait identity"
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
          <DoctorMark size={100} />
          <strong style={{ fontSize: 96, letterSpacing: "-.05em" }}>
            DoctorChart
          </strong>
        </div>
        <div
          style={{
            fontSize: 52,
            lineHeight: 1.22,
            color: "#B8CDCF",
            marginTop: 30,
          }}
        >
          Historias clínicas
          <br />
          <span style={{ color: "#8ACFD4" }}>organizadas.</span>
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="DoctorChart portrait UI camera"
        style={{
          position: "absolute",
          left: 90,
          top: 610,
          transformOrigin: "50% 50%",
          scale: interpolate(frame, [0, 32, 130, 260], [1.015, 1, 1, 1.015], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <DoctorUI frame={frame} />
      </Interactive.Div>
    </Stage>
  );
};
