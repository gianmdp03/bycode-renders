import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { Img } from "remotion";
import { draftBrand, type BrandTokens, type SafeInsets } from "./tokens";

export * from "./tokens";

const BrandContext = createContext<BrandTokens>(draftBrand);

/** Context only: no DOM wrapper, font loading, CSS injection or composition changes. */
export const BrandProvider = ({ brand, children }: { brand: BrandTokens; children: ReactNode }) => (
  <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
);

export const useBrand = (): BrandTokens => useContext(BrandContext);

export type BrandLockupProps = {
  name?: string;
  /** Resolved URL, e.g. staticFile("logos/approved.svg"). No guessed asset paths. */
  logoSrc?: string;
  logoAlt?: string;
  size?: number;
  iconSize?: number;
  style?: CSSProperties;
};

export const BrandLockup = ({
  name, logoSrc, logoAlt = "", size = 40, iconSize = size * 1.2, style,
}: BrandLockupProps) => {
  const brand = useBrand();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: iconSize * 0.28,
      color: brand.colors.text, fontFamily: brand.typography.fontFamily,
      fontSize: size, fontWeight: brand.typography.titleWeight, lineHeight: 1.1, ...style,
    }}>
      {logoSrc ? <Img src={logoSrc} alt={logoAlt} style={{ width: iconSize, height: iconSize, objectFit: "contain" }} /> : null}
      <span>{name ?? brand.name}</span>
    </div>
  );
};

/** Opt-in layout container; never wraps or shifts an existing scene automatically. */
export const SafeArea = ({ insets, children, style }: {
  insets: SafeInsets; children: ReactNode; style?: CSSProperties;
}) => (
  <div style={{
    position: "absolute", top: insets.top, right: insets.right,
    bottom: insets.bottom, left: insets.left, ...style,
  }}>{children}</div>
);
