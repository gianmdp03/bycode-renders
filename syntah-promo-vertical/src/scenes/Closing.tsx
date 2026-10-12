import {
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Arrow } from "../components/Brand";
import { Stage } from "../components/Stage";
import { clamp, ease } from "../theme";

export const Closing = () => {
  const frame = useCurrentFrame();
  return (
    <Stage brand={false}>
      <Interactive.Div
        name="Closing portrait identity"
        style={{
          position: "absolute",
          top: 363,
          width: 1080,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 43,
          translate: interpolate(frame, [0, 34], ["0px 35px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
          scale: interpolate(frame, [0, 34], [0.94, 1], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <Img
          src={staticFile("logos/syntah.svg")}
          style={{ width: 238, height: 276, objectFit: "contain" }}
        />
        <strong
          style={{ fontSize: 158, lineHeight: 1, letterSpacing: "-.055em" }}
        >
          Syntah
        </strong>
      </Interactive.Div>
      <Interactive.Div
        name="Portrait CTA"
        style={{
          position: "absolute",
          top: 961,
          left: 90,
          width: 900,
          textAlign: "center",
          fontSize: 66,
          lineHeight: 1.15,
          letterSpacing: "-.035em",
          opacity: interpolate(frame, [8, 26], [0, 1], clamp),
          translate: interpolate(frame, [8, 34], ["0px 20px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        Conocé nuestro
        <br />
        ecosistema
      </Interactive.Div>
      <Interactive.Div
        name="Portrait website"
        style={{
          position: "absolute",
          top: 1224,
          left: 155,
          width: 770,
          height: 134,
          borderRadius: 27,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 29,
          background: "linear-gradient(110deg, #215FDB, #286EE9)",
          border: "1px solid #78A6FF66",
          boxShadow: "0 16px 65px #174CA02E",
          fontSize: 63,
          fontWeight: 700,
          letterSpacing: "-.025em",
          opacity: interpolate(frame, [16, 32], [0, 1], clamp),
          translate: interpolate(frame, [16, 42], ["0px 26px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        syntah.com.ar
        <Arrow size={40} />
      </Interactive.Div>
    </Stage>
  );
};
