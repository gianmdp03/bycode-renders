import { Interactive, interpolate, useCurrentFrame } from "remotion";
import {
  ByCodeBrand,
  DoctorMark,
  PointlyMark,
  Check,
} from "../components/Brand";
import { Stage } from "../components/Stage";
import { DoctorUI } from "../components/DoctorUI";
import { demo } from "../data";
import { clamp, ease, theme } from "../theme";

export const Ecosystem = () => {
  const frame = useCurrentFrame();
  return (
    <Stage brand={false}>
      <Interactive.Div
        name="ByCode ecosystem parent"
        style={{
          position: "absolute",
          top: 136,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          translate: interpolate(frame, [0, 24], ["0px -15px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <ByCodeBrand size={76} iconSize={88} />
      </Interactive.Div>
      <Interactive.Div
        name="Portrait ecosystem headline"
        style={{
          position: "absolute",
          top: 326,
          left: 90,
          width: 900,
          textAlign: "center",
          fontSize: 73,
          lineHeight: 1.16,
          letterSpacing: "-.045em",
          fontWeight: 700,
          opacity: interpolate(frame, [4, 24], [0, 1], clamp),
        }}
      >
        Dos productos.
        <br />
        <span style={{ color: "#8DB7FF" }}>Un mismo ecosistema.</span>
      </Interactive.Div>
      <Interactive.Div
        name="Pointly focused ecosystem card"
        style={{
          position: "absolute",
          left: 90,
          top: 610,
          width: 900,
          height: 418,
          borderRadius: 32,
          padding: "31px 37px",
          background: "#FFF",
          color: "#1F2937",
          border: "1px solid #D7E1F0",
          opacity: interpolate(frame, [6, 26], [0, 1], clamp),
          translate: interpolate(frame, [6, 38], ["0px 35px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <div style={{ display: "flex", gap: 19, alignItems: "center" }}>
          <PointlyMark size={64} />
          <strong style={{ fontSize: 48, letterSpacing: "-.035em" }}>
            Pointly
          </strong>
          <span
            style={{ marginLeft: "auto", color: theme.pointly, fontSize: 25 }}
          >
            Puntos y premios
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 30,
          }}
        >
          <div>
            <strong style={{ fontSize: 33 }}>{demo.shop}</strong>
            <div style={{ fontSize: 26, color: "#7A8796", marginTop: 7 }}>
              Saldo disponible
            </div>
          </div>
          <div
            style={{
              background: "#E8F0FE",
              color: theme.pointly,
              padding: "13px 21px",
              borderRadius: 16,
              fontSize: 51,
              fontWeight: 700,
            }}
          >
            {demo.balance} <span style={{ fontSize: 26 }}>pts</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 21,
            fontSize: 31,
          }}
        >
          <strong>{demo.reward}</strong>
          <span style={{ color: theme.pointly }}>{demo.cost} pts</span>
        </div>
        <div
          style={{
            marginTop: 21,
            background: "#E5F5EC",
            color: "#197447",
            minHeight: 62,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          <Check size={28} />
          ¡Te alcanza este premio!
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="DoctorChart portrait match shape"
        style={{
          position: "absolute",
          left: interpolate(frame, [0, 38], [83.25, 90], {
            ...clamp,
            easing: ease,
          }),
          top: interpolate(frame, [0, 38], [602.275, 1084], {
            ...clamp,
            easing: ease,
          }),
          width: interpolate(frame, [0, 38], [913.5, 900], {
            ...clamp,
            easing: ease,
          }),
          height: interpolate(frame, [0, 38], [1045.45, 480], {
            ...clamp,
            easing: ease,
          }),
          borderRadius: 32,
          background: "white",
          border: "1px solid #C7DCDF",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "32px 37px",
            color: "#21383E",
            opacity: interpolate(frame, [4, 20], [0, 1], clamp),
          }}
        >
          <div style={{ display: "flex", gap: 19, alignItems: "center" }}>
            <DoctorMark size={64} />
            <strong style={{ fontSize: 48, letterSpacing: "-.035em" }}>
              DoctorChart
            </strong>
          </div>
          <div style={{ marginTop: 27 }}>
            <strong style={{ fontSize: 41 }}>{demo.patient}</strong>
            <div style={{ fontSize: 26, color: "#7B8B91", marginTop: 8 }}>
              HC #{demo.record} · {demo.age} años · Particular
            </div>
          </div>
          <div
            style={{
              marginTop: 24,
              background: "#F2F8F8",
              border: "1px solid #D7E6E8",
              borderRadius: 19,
              padding: "21px 23px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <strong style={{ fontSize: 32 }}>{demo.date}</strong>
              <span
                style={{
                  fontSize: 24,
                  color: theme.doctor,
                  background: "#DDEFF0",
                  borderRadius: 10,
                  padding: "7px 12px",
                }}
              >
                {demo.type}
              </span>
            </div>
            <div style={{ fontSize: 29, color: "#657A80", marginTop: 14 }}>
              Resumen: control de seguimiento
            </div>
            <div
              style={{
                fontSize: 27,
                color: theme.doctor,
                fontWeight: 700,
                marginTop: 14,
              }}
            >
              Datos registrados
            </div>
          </div>
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="Outgoing consultation panel"
        style={{
          position: "absolute",
          left: 83.25,
          top: 602.275,
          transformOrigin: "top left",
          scale: 1.015,
          opacity: interpolate(frame, [0, 18], [1, 0], clamp),
        }}
      >
        <DoctorUI frame={299} cursor={false} />
      </Interactive.Div>
    </Stage>
  );
};
