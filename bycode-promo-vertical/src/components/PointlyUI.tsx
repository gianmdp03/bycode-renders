import React from "react";
import { progress, theme } from "../theme";
import { demo } from "../data";
import { Arrow, Check, Gift, PointlyMark } from "./Brand";
import { Panel, WindowBar } from "./Stage";
import { Cursor } from "./Cursor";

export const PointlyUI: React.FC<{ frame: number }> = ({ frame }) => {
  const reveal = progress(frame, 84, 24);
  const highlight = progress(frame, 130, 24);
  return (
    <Panel>
      <WindowBar title="Pointly" />
      <div
        style={{
          padding: "27px 34px",
          display: "flex",
          alignItems: "center",
          gap: 15,
          borderBottom: "1px solid #E8ECF2",
        }}
      >
        <PointlyMark size={44} />
        <strong style={{ fontSize: 33 }}>Puntos y beneficios</strong>
        <span style={{ marginLeft: "auto", color: "#718096", fontSize: 22 }}>
          {demo.customer} · Demo
        </span>
      </div>
      <div style={{ padding: "66px 40px", opacity: 1 - reveal }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              height: 84,
              width: 84,
              background: "#E8F0FE",
              borderRadius: 22,
              color: theme.pointly,
              display: "grid",
              placeItems: "center",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <div>
            <div style={{ fontSize: 47, fontWeight: 700 }}>{demo.shop}</div>
            <div style={{ fontSize: 29, color: "#728095", marginTop: 7 }}>
              Tus puntos. Tus beneficios.
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 45,
            padding: "34px 38px",
            background: "#F4F7FC",
            border: "1px solid #DDE5F0",
            borderRadius: 24,
          }}
        >
          <div style={{ fontSize: 32, color: "#637083" }}>
            Puntos disponibles
          </div>
          <div
            style={{
              fontSize: 92,
              color: theme.pointly,
              fontWeight: 700,
              lineHeight: 1.16,
              marginTop: 10,
            }}
          >
            {demo.balance} <span style={{ fontSize: 38 }}>pts</span>
          </div>
        </div>
        <div
          data-qa-target="catalog"
          style={{
            background: theme.pointly,
            color: "#FFF",
            fontSize: 34,
            fontWeight: 700,
            borderRadius: 19,
            height: 108,
            marginTop: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <Gift size={36} />
          Ver Premios y Catálogo
          <Arrow size={34} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 165,
          bottom: 0,
          background: "white",
          padding: "33px 36px",
          opacity: reveal,
          translate: `0 ${22 * (1 - reveal)}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 125,
          }}
        >
          <div>
            <div style={{ fontSize: 40, fontWeight: 700 }}>{demo.shop}</div>
            <div style={{ fontSize: 26, color: "#718096", marginTop: 8 }}>
              Premios y catálogo
            </div>
          </div>
          <div
            style={{
              padding: "20px 26px",
              borderRadius: 20,
              background: "#E8F0FE",
              color: theme.pointly,
            }}
          >
            <div style={{ fontSize: 26 }}>Saldo</div>
            <strong style={{ fontSize: 59, lineHeight: 1.2 }}>
              {demo.balance} <span style={{ fontSize: 28 }}>pts</span>
            </strong>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 29,
            alignItems: "center",
            marginTop: 30,
            marginBottom: 28,
            fontSize: 28,
            color: "#6D7785",
          }}
        >
          <span
            style={{
              color: "white",
              background: theme.pointly,
              borderRadius: 14,
              padding: "14px 25px",
              fontWeight: 700,
            }}
          >
            Premios
          </span>
          <span>Promociones</span>
          <span>Productos</span>
        </div>
        <div
          style={{
            border: `2px solid ${highlight > 0.1 ? "#71C6A2" : "#DDE3EB"}`,
            borderRadius: 26,
            background: "#F8FAFC",
            padding: "32px 34px",
            boxShadow: `0 0 0 ${highlight * 5}px #DCF4E766`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 25,
            }}
          >
            <div
              style={{
                background: "#E8F0FE",
                color: theme.pointly,
                padding: 23,
                borderRadius: 20,
              }}
            >
              <Gift size={47} />
            </div>
            <strong style={{ fontSize: 48, color: theme.pointly }}>
              {demo.cost} pts
            </strong>
          </div>
          <div
            style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-.03em" }}
          >
            {demo.reward}
          </div>
          <div style={{ fontSize: 28, color: "#6B7582", marginTop: 10 }}>
            Premio en {demo.shop}
          </div>
          <div
            style={{
              marginTop: 31,
              borderTop: "1px solid #DDE3EB",
              paddingTop: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                fontSize: 37,
                fontWeight: 700,
                minHeight: 89,
                padding: "15px 12px",
                borderRadius: 17,
                color: "#197447",
                background: "#E5F5EC",
                scale: 1 + Math.sin(highlight * Math.PI) * 0.015,
              }}
            >
              <Check size={32} />
              ¡Te alcanza este premio!
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#718096",
            marginTop: 27,
            textAlign: "center",
          }}
        >
          Solicitá tu premio en el mostrador del local.
        </div>
      </div>
      <Cursor frame={frame} clickAt={82} from={[790, 810]} to={[660, 662]} />
    </Panel>
  );
};
