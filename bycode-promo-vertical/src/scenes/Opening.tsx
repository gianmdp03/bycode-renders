import {
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Stage } from "../components/Stage";
import { clamp, ease } from "../theme";

export const Opening = () => {
  const frame = useCurrentFrame();
  return (
    <Stage brand={false}>
      <Interactive.Div
        name="Portrait brand halo"
        style={{
          position: "absolute",
          left: 25,
          top: 300,
          width: 1030,
          height: 1330,
          border: "1px solid #3A6FA22C",
          borderRadius: "50%",
          scale: interpolate(frame, [0, 170], [0.8, 1.04], {
            ...clamp,
            easing: ease,
          }),
        }}
      />
      <Interactive.Div
        name="ByCode mark"
        style={{
          position: "absolute",
          top: 385,
          left: 410,
          width: 260,
          opacity: interpolate(frame, [0, 12], [0.25, 1], clamp),
          translate: interpolate(frame, [0, 33], ["0px 36px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <Img
          src={staticFile("logos/bycode.svg")}
          style={{
            width: 260,
            height: 296,
            objectFit: "contain",
            filter: "drop-shadow(0 0 35px #0F708B44)",
          }}
        />
      </Interactive.Div>
      <Interactive.Div
        name="ByCode name"
        style={{
          position: "absolute",
          top: 732,
          width: 1080,
          textAlign: "center",
          fontSize: 172,
          fontWeight: 700,
          letterSpacing: "-.055em",
          lineHeight: 1,
          opacity: interpolate(frame, [0, 12], [0.25, 1], clamp),
          scale: interpolate(frame, [0, 160], [0.94, 1], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        ByCode
      </Interactive.Div>
      <Interactive.Div
        name="Company descriptor"
        style={{
          position: "absolute",
          top: 1017,
          left: 90,
          width: 900,
          textAlign: "center",
          fontSize: 57,
          lineHeight: 1.25,
          letterSpacing: "-.025em",
          opacity: interpolate(frame, [12, 28], [0, 1], clamp),
          translate: interpolate(frame, [12, 40], ["0px 25px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        Soluciones de software
        <br />
        <span style={{ color: "#8DB7FF" }}>para simplificar tu día.</span>
      </Interactive.Div>
      <Interactive.Div
        name="Opening accent"
        style={{
          position: "absolute",
          left: 481,
          top: 1250,
          width: 118,
          height: 5,
          borderRadius: 5,
          background: "#397BFF",
          scale: interpolate(frame, [20, 50], [0, 1], {
            ...clamp,
            easing: ease,
          }),
        }}
      />
    </Stage>
  );
};
