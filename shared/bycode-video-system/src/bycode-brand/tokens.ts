export type BrandTokens = {
  name: string;
  /** The defaults are a demo palette, never an approved ByCode identity. */
  status: "draft" | "approved";
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    onAccent: string;
    border: string;
    backgroundDark: string;
    onDark: string;
    accentLight: string;
  };
  typography: {
    fontFamily: string;
    titleWeight: number;
    bodyWeight: number;
    titleLineHeight: number;
    bodyLineHeight: number;
  };
  shape: { radius: number };
};

export type BrandOverrides = Partial<Omit<BrandTokens, "colors" | "typography" | "shape">> & {
  colors?: Partial<BrandTokens["colors"]>;
  typography?: Partial<BrandTokens["typography"]>;
  shape?: Partial<BrandTokens["shape"]>;
};

// Deliberately neutral: no experimental reel, font, product color or logo is canonical.
// Freeze nested objects as well, so one consumer cannot change another's defaults.
export const draftBrand: BrandTokens = Object.freeze({
  name: "Bycode",
  status: "draft",
  colors: Object.freeze({
    background: "#111111",
    surface: "#222222",
    text: "#FFFFFF",
    muted: "#CCCCCC",
    accent: "#FFFFFF",
    onAccent: "#111111",
    border: "#666666",
    backgroundDark: "#111111",
    onDark: "#FFFFFF",
    accentLight: "#FFFFFF",
  }),
  typography: Object.freeze({
    fontFamily: "sans-serif",
    titleWeight: 700,
    bodyWeight: 400,
    titleLineHeight: 1.12,
    bodyLineHeight: 1.4,
  }),
  shape: Object.freeze({ radius: 24 }),
});

/** Deep-merge the token groups without mutating defaults or the project's config. */
export const createBrand = (overrides: BrandOverrides = {}): BrandTokens => ({
  ...draftBrand,
  ...overrides,
  colors: { ...draftBrand.colors, ...overrides.colors },
  typography: { ...draftBrand.typography, ...overrides.typography },
  shape: { ...draftBrand.shape, ...overrides.shape },
});

/** Insets are in composition pixels, not device pixels or CSS viewport units. */
export type SafeInsets = { top: number; right: number; bottom: number; left: number };

// Layout suggestions only. Platform controls and captions require project-specific review.
export const suggestedSafeInsets = (width: number, height: number): SafeInsets => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new RangeError("Composition dimensions must be positive finite numbers");
  }
  return height > width
    ? { top: height * 0.1, right: width * 0.12, bottom: height * 0.2, left: width * 0.08 }
    : { top: height * 0.08, right: width * 0.06, bottom: height * 0.08, left: width * 0.06 };
};
