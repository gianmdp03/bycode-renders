import React from "react";
import { Img, staticFile } from "remotion";
import { theme } from "../theme";

export const ByCodeBrand: React.FC<{ size?: number; iconSize?: number }> = ({
  size = 36,
  iconSize = 46,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: iconSize * 0.28,
      color: theme.white,
    }}
  >
    <Img
      src={staticFile("logos/bycode.svg")}
      style={{ height: iconSize, width: iconSize, objectFit: "contain" }}
    />
    <span
      style={{
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "-.045em",
        lineHeight: 1.1,
      }}
    >
      ByCode
    </span>
  </div>
);

export const DoctorMark: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <Img
    src={staticFile("logos/doctorchart.svg")}
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      borderRadius: size * 0.28,
      background: "white",
    }}
  />
);

export const PointlyMark: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <Img
    src={staticFile("logos/pointly.svg")}
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      borderRadius: size * 0.28,
    }}
  />
);

export const Arrow: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12h15m-6-6 6 6-6 6" />
  </svg>
);

export const Gift: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 12v9H4v-9M2 7h20v5H2zM12 7v14M12 7H7.5A2.5 2.5 0 1 1 10 4.5L12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5L12 7Z" />
  </svg>
);

export const Check: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
);
