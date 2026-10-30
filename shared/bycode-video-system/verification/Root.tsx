import { AbsoluteFill, Composition, Sequence, registerRoot, useVideoConfig } from "remotion";
import { BrandLockup, BrandProvider, SafeArea, createBrand, createProductBrand, suggestedSafeInsets } from "../src/bycode-brand/index";
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
    <Composition id="BycodeReuse" component={ProductPromo} defaultProps={{product:'bycode' as const}} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="PointlyReuse" component={ProductPromo} defaultProps={{product:'pointly' as const}} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="TutorialBare" component={Lesson} width={1920} height={1080} fps={30} durationInFrames={600} />
    <Composition id="TutorialBranded" component={BrandedLesson} width={1920} height={1080} fps={30} durationInFrames={600} />
  </>
);

const ProductPromo=({product}:{product:'bycode'|'pointly'})=><BrandProvider brand={createProductBrand(product)}><PromoStage><div style={{margin:100}}><BrandLockup/><PromoReveal duration={18}><PromoTitle fontSize={72}>Vista de prueba</PromoTitle><PromoCta>Conocé el producto</PromoCta></PromoReveal></div></PromoStage></BrandProvider>;

// Education fixture intentionally uses only brand context, no commercial components.
const Lesson=()=><AbsoluteFill style={{background:'#fff',fontFamily:'sans-serif',color:'#173B50',padding:80}}><div style={{fontSize:32}}>Capítulo 1 · Ejemplo educativo</div><h1 style={{fontSize:56}}>Abrí el directorio</h1><p style={{fontSize:36}}>Revisá los datos del paciente antes de continuar.</p></AbsoluteFill>;
const BrandedLesson=()=><BrandProvider brand={createProductBrand('bycode')}><Lesson/></BrandProvider>;

registerRoot(Root);
