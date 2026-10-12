import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Self-contained: no font network requests during preview or rendering.
loadFont({
  family: "Product Sans",
  url: staticFile("fonts/ProductSans-Regular.woff"),
  weight: "400",
});
loadFont({
  family: "Product Sans",
  url: staticFile("fonts/ProductSans-Bold.woff"),
  weight: "700",
});
