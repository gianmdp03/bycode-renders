import React from "react";
import { progress, theme } from "../theme";
import { demo } from "../data";
import { Panel, WindowBar } from "./Stage";
import { Cursor } from "./Cursor";

export const DoctorUI: React.FC<{ frame: number; cursor?: boolean }> = ({
  frame,
  cursor = true,
}) => {
  const expand = progress(frame, 88, 26);
  return (
    <Panel>
      <WindowBar title="DoctorChart" color={theme.doctor} />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: "32px 34px",
          background: "#F4F8F8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "27px 24px",
            background: "white",
            border: "1px solid #DCE6E7",
            borderRadius: 23,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              flexShrink: 0,
              borderRadius: "50%",
              background: "#DDF1F2",
              color: theme.doctor,
              display: "grid",
              placeItems: "center",
              fontSize: 38,
              fontWeight: 700,
            }}
          >
            {demo.initials}
          </div>
          <div>
            <div
              style={{
                fontSize: 45,
                fontWeight: 700,
                color: "#21383E",
                letterSpacing: "-.025em",
              }}
            >
              {demo.patient}
            </div>
            <div style={{ fontSize: 28, color: "#7B8B91", marginTop: 10 }}>
              HC #{demo.record} · {demo.age} años · Particular
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            marginTop: 30,
            borderBottom: "1px solid #D4E0E2",
            fontSize: 31,
          }}
        >
          <span style={{ padding: "0 0 19px", color: "#7B8B91" }}>
            Datos del paciente
          </span>
          <span
            style={{
              padding: "0 6px 16px",
              color: theme.doctor,
              fontWeight: 700,
              borderBottom: `4px solid ${theme.doctor}`,
            }}
          >
            Consultas{" "}
            <span
              style={{
                marginLeft: 12,
                padding: "3px 11px",
                background: "#DDEFF0",
                borderRadius: 8,
                fontSize: 23,
              }}
            >
              2
            </span>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "30px 0 27px",
            gap: 12,
          }}
        >
          <strong style={{ fontSize: 35, color: "#253F45" }}>
            Historial de consultas
          </strong>
          <span
            style={{
              marginLeft: "auto",
              color: theme.doctor,
              background: "#E0EFEF",
              borderRadius: 10,
              padding: "8px 15px",
              fontSize: 25,
            }}
          >
            Todas
          </span>
        </div>
        <div style={{ position: "relative", paddingLeft: 26 }}>
          <div
            style={{
              position: "absolute",
              left: 5,
              top: 24,
              width: 3,
              height: 460,
              background: "#CAE1E3",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -2,
              top: 28,
              width: 17,
              height: 17,
              borderRadius: "50%",
              background: theme.doctor,
              boxShadow: "0 0 0 5px #E0EFEF",
            }}
          />
          <div
            style={{
              border: "1px solid #BFD6D9",
              background: "white",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 5px 16px #00687408",
            }}
          >
            <div
              data-qa-target="consultation"
              style={{
                padding: "24px 23px",
                display: "flex",
                alignItems: "center",
                color: "#28434A",
                gap: 22,
              }}
            >
              <strong style={{ fontSize: 34 }}>{demo.date}</strong>
              <span
                style={{
                  fontSize: 25,
                  padding: "8px 14px",
                  background: "#E1F1F2",
                  borderRadius: 10,
                  color: theme.doctor,
                }}
              >
                {demo.type}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 35,
                  rotate: `${180 * expand}deg`,
                }}
              >
                ⌄
              </span>
            </div>
            <div
              style={{ padding: "0 23px 24px", color: "#657A80", fontSize: 30 }}
            >
              Resumen: control de seguimiento
            </div>
            <div
              style={{
                height: 253 * expand,
                overflow: "hidden",
                background: "#F8FBFB",
              }}
            >
              <div
                style={{
                  padding: "26px 26px",
                  borderTop: "1px solid #E3ECEC",
                  opacity: expand,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 30,
                    color: theme.doctor,
                    marginBottom: 19,
                  }}
                >
                  Datos registrados
                </div>
                <div
                  style={{ fontSize: 29, color: "#4B626A", lineHeight: 1.42 }}
                >
                  <strong>Motivo:</strong> {demo.reason}
                  <br />
                  <div style={{ marginTop: 11 }}>
                    <strong>Observaciones:</strong>
                    <br />
                    {demo.note}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 22,
              border: "1px solid #DCE6E7",
              background: "white",
              borderRadius: 18,
              padding: "25px 24px",
              color: "#637A80",
              display: "flex",
              alignItems: "center",
              gap: 22,
            }}
          >
            <strong style={{ fontSize: 30 }}>{demo.previousDate}</strong>
            <span style={{ fontSize: 25 }}>Primera consulta</span>
            <span style={{ marginLeft: "auto", fontSize: 30 }}>⌄</span>
          </div>
        </div>
      </div>
      {cursor ? (
        <Cursor frame={frame} clickAt={86} from={[775, 734]} to={[792, 467]} />
      ) : null}
    </Panel>
  );
};
