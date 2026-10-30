import type { ReactNode } from "react";
import { BrandProvider, createBrand } from "../src/bycode-brand/index";
import { PromoCta } from "../src/bycode-promo/index";

// Adapter pattern: map the EXISTING project's values; this is not a brand proposal.
export const adaptExistingTheme = (existing: {
  ink: string; white: string; accent: string; onAccent: string; font: string;
}) => createBrand({
  name: "ByCode",
  status: "draft",
  colors: {
    background: existing.ink, text: existing.white,
    accent: existing.accent, onAccent: existing.onAccent,
  },
  typography: { fontFamily: existing.font },
});

// Keep the project's existing Root, Composition, Sequence, audio and captions.
export const AdoptContextOnly = ({ existingScene }: { existingScene: ReactNode }) => (
  <BrandProvider brand={createBrand()}>{existingScene}</BrandProvider>
);

// Render only inside the existing CTA's container/Sequence, using its current copy.
export const AdoptOneCta = ({ copy, destination }: { copy: string; destination: string }) => (
  <PromoCta destination={destination} fontSize={36} style={{ borderRadius: 16 }}>
    {copy}
  </PromoCta>
);
