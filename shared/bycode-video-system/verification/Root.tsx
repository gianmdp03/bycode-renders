import { AbsoluteFill, Composition, Sequence, registerRoot, useVideoConfig } from "remotion";
import { BrandLockup, BrandProvider, SafeArea, createBrand, suggestedSafeInsets } from "../src/bycode-brand/index";
import { PromoCta, PromoReveal, PromoStage, PromoTitle } from "../src/bycode-promo/index";

// QA fixtures only. These are not registered in any existing project's Root.
const Legacy = () => (
  <AbsoluteFill style={{ backgroundColor: "#334455", color: "white", fontFamily: "sans-serif" }}>
    <div style={{ margin: 80, fontSize: 64 }}>Existing composition</div>
  </AbsoluteFill>
);
const ProviderOnly = () => (
  <BrandProvider brand={createBrand({ colors: { background: "red" } })}><Legacy /></BrandProvider>
);
const Promo = () => {
  const { width, height } = useVideoConfig();
  return (
  <BrandProvider brand={createBrand()}>
    <PromoStage>
      <SafeArea insets={suggestedSafeInsets(width, height)}>
        <BrandLockup name="ByCode · demo" />
        <Sequence from={12} durationInFrames={48} layout="none">
          <PromoReveal duration={12}>
            <div style={{ marginTop: 200 }}><PromoTitle>Marca por definir</PromoTitle></div>
            <div style={{ marginTop: 100 }}>
              <PromoCta destination="example.invalid">Ver demostración</PromoCta>
            </div>
          </PromoReveal>
        </Sequence>
      </SafeArea>
    </PromoStage>
  </BrandProvider>
  );
};

const Root = () => (
  <>
    <Composition id="LegacyPortrait" component={Legacy} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="ProviderPortrait" component={ProviderOnly} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="LegacyLandscape" component={Legacy} width={1920} height={1080} fps={60} durationInFrames={60} />
    <Composition id="ProviderLandscape" component={ProviderOnly} width={1920} height={1080} fps={60} durationInFrames={60} />
    <Composition id="PromoPortrait" component={Promo} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="PromoLandscape" component={Promo} width={1920} height={1080} fps={60} durationInFrames={60} />
  </>
);

registerRoot(Root);
