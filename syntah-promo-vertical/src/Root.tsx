import { Composition, Folder } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { Opening } from "./scenes/Opening";
import { Products } from "./scenes/Products";
import { Pointly } from "./scenes/Pointly";
import { DoctorChart } from "./scenes/DoctorChart";
import { Ecosystem } from "./scenes/Ecosystem";
import { Closing } from "./scenes/Closing";
import "./fonts";
import "./style.css";

// Six authored scene nodes, with match cuts and motion within each scene.
// No overlap: 180 + 120 + 300 + 300 + 240 + 300 = 1440 frames.
export const SyntahVertical = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="01 · Syntah" durationInFrames={180}>
      <Opening />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence
      name="02 · Nuestros productos"
      durationInFrames={120}
    >
      <Products />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="03 · Pointly" durationInFrames={300}>
      <Pointly />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="04 · DoctorChart" durationInFrames={300}>
      <DoctorChart />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="05 · Ecosistema" durationInFrames={240}>
      <Ecosystem />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence name="06 · Conocé Syntah" durationInFrames={300}>
      <Closing />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

export const RemotionRoot = () => (
  <>
    <Composition
      id="Syntah-Vertical"
      component={SyntahVertical}
      width={1080}
      height={1920}
      fps={60}
      durationInFrames={1440}
    />
    <Folder name="Scenes">
      <Composition
        id="Opening"
        component={Opening}
        width={1080}
        height={1920}
        fps={60}
        durationInFrames={180}
      />
      <Composition
        id="Products"
        component={Products}
        width={1080}
        height={1920}
        fps={60}
        durationInFrames={120}
      />
      <Composition
        id="Pointly"
        component={Pointly}
        width={1080}
        height={1920}
        fps={60}
        durationInFrames={300}
      />
      <Composition
        id="DoctorChart"
        component={DoctorChart}
        width={1080}
        height={1920}
        fps={60}
        durationInFrames={300}
      />
      <Composition
        id="Ecosystem"
        component={Ecosystem}
        width={1080}
        height={1920}
        fps={60}
        durationInFrames={240}
      />
      <Composition
        id="Closing"
        component={Closing}
        width={1080}
        height={1920}
        fps={60}
        durationInFrames={300}
      />
    </Folder>
  </>
);
