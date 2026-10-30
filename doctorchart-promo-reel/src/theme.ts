import {createProductBrand,portraitSafeInsets} from '@bycode/video-system/brand';
export const doctorChartBrand=createProductBrand('doctorchart');
const c=doctorChartBrand.colors;
// Adapter only: the maintained product identity is in the shared registry.
export const theme = {
  width:1080,height:1920,fps:60,
  ink:c.text,teal:c.accent,deep:c.backgroundDark,paper:c.background,muted:c.muted,line:c.border,
  font:doctorChartBrand.typography.fontFamily,
  safe:portraitSafeInsets,
};
