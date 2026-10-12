import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { DoctorMark, PointlyMark, Arrow } from "../components/Brand";
import { Stage } from "../components/Stage";
import { clamp, ease } from "../theme";

export const Products = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Interactive.Div
        name="Products heading"
        style={{
          position: "absolute",
          top: 300,
          left: 90,
          fontSize: 104,
          lineHeight: 1.06,
          letterSpacing: "-.05em",
          fontWeight: 700,
          translate: interpolate(frame, [0, 22], ["0px 22px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        Nuestros
        <br />
        productos<span style={{ color: "#397BFF" }}>.</span>
      </Interactive.Div>
      <Interactive.Div
        name="Pointly portrait card"
        style={{
          position: "absolute",
          left: 90,
          top: 668,
          width: 900,
          height: 346,
          borderRadius: 34,
          padding: "43px 46px",
          border: "1px solid #386DBD70",
          background: "linear-gradient(135deg, #172947, #111B2C)",
          opacity: interpolate(frame, [0, 12], [0.2, 1], clamp),
          translate: interpolate(frame, [0, 26], ["0px 40px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
          <PointlyMark size={96} />
          <strong style={{ fontSize: 82, letterSpacing: "-.04em" }}>
            Pointly
          </strong>
        </div>
        <div style={{ fontSize: 42, color: "#A7C8FB", marginTop: 36 }}>
          Puntos y premios
        </div>
        <div
          style={{
            position: "absolute",
            right: 48,
            bottom: 53,
            color: "#78AFFF",
          }}
        >
          <Arrow size={40} />
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="DoctorChart portrait card"
        style={{
          position: "absolute",
          left: 90,
          top: 1064,
          width: 900,
          height: 346,
          borderRadius: 34,
          padding: "43px 46px",
          border: "1px solid #24697580",
          background: "linear-gradient(135deg, #132F36, #111E28)",
          opacity: interpolate(frame, [5, 17], [0, 1], clamp),
          translate: interpolate(frame, [5, 31], ["0px 40px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
          <DoctorMark size={96} />
          <strong style={{ fontSize: 75, letterSpacing: "-.04em" }}>
            DoctorChart
          </strong>
        </div>
        <div style={{ fontSize: 42, color: "#A3D8DE", marginTop: 36 }}>
          Historias clínicas
        </div>
        <div
          style={{
            position: "absolute",
            right: 48,
            bottom: 53,
            color: "#77C8D0",
          }}
        >
          <Arrow size={40} />
        </div>
      </Interactive.Div>
    </Stage>
  );
};
