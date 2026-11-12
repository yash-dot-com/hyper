import React from "react";
import { Composition } from "remotion";
import { KineticParagraph } from "./KineticParagraph";

const fps = 30;
const durationSeconds = 5.6;

export const RemotionRoot = () => (
  <Composition
    id="KineticParagraph"
    component={KineticParagraph}
    width={1280}
    height={720}
    fps={fps}
    durationInFrames={Math.round(fps * durationSeconds)}
    defaultProps={{
      durationSeconds,
      text: "Listen. A spoon taps the rim of a glass in the kitchen. From the street below comes the soft rattle of a bicycle crossing the drain. For a moment the two sounds fall into step. Then the rider turns the corner, the spoon rests on the table, and the morning goes on.",
      background: "#F8F4EA",
      ink: "#20221F",
      blue: "#ABDBCA",
      yellow: "#FFC6A2",
    }}
  />
);
