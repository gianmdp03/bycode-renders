import { AbsoluteFill, Composition, Sequence } from 'remotion';
import { Chapter, type ChapterData } from './Chapter';
import timeline from './brief-timeline.json';

const scenes = timeline.chapters as (ChapterData & { from: number })[];
const Brief = () => (
  <AbsoluteFill>
    {scenes.map((scene) => (
      <Sequence
        key={scene.id}
        name={scene.title}
        from={scene.from}
        durationInFrames={scene.durationInFrames}
      >
        <Chapter data={scene} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const BriefCompositions = () =>
  timeline.durationInFrames > 0 ? (
    <>
      <Composition
        id="PointlyRecorridoBreve"
        component={Brief}
        durationInFrames={timeline.durationInFrames}
        fps={60}
        width={1920}
        height={1080}
      />
      {scenes.map((scene, index) => (
        <Composition
          key={scene.id}
          id={`BriefChapter${index + 1}`}
          component={Chapter}
          durationInFrames={scene.durationInFrames}
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{ data: scene, layerOnly: false }}
        />
      ))}
    </>
  ) : null;
