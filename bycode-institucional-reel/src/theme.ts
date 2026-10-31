import {createProductBrand,bycodeFrontendTheme} from '@bycode/video-system/brand';
// Shared registry owns the source-derived draft theme. This is a layout adapter.
export const brand=createProductBrand('bycode',bycodeFrontendTheme);
export const t={...brand.colors,font:brand.typography.fontFamily,left:84,right:168,width:828};
