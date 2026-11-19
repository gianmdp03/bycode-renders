import {createBrand, type BrandOverrides, type SafeInsets} from './tokens';

export type ProductId='bycode'|'doctorchart'|'pointly';

/** Opt-in adaptation from Pointly frontend styles.css and its authentic logo.
 * Audiovisual mapping remains draft; does not change neutral product defaults.
 */
export const pointlyFrontendTheme:BrandOverrides={
 status:'draft',
 colors:{background:'#FFFFFF',surface:'#F8F9FA',text:'#1F1F1F',muted:'#5F6368',accent:'#1A73E8',onAccent:'#FFFFFF',border:'#E2E8F0',backgroundDark:'#292D35',onDark:'#FFFFFF',accentLight:'#8AB4F8'},
 typography:{fontFamily:'"Google Sans", sans-serif',titleWeight:700,bodyWeight:400,titleLineHeight:1.04,bodyLineHeight:1.3},
 shape:{radius:24},
};

/** Source: local bycode-frontend styles.css, personal-theme.css and authentic logo.
 * Opt-in production mapping; the neutral defaults and other reels remain intact.
 * This source-derived adaptation is still draft, pending human audiovisual approval.
 */
export const bycodeFrontendTheme:BrandOverrides={
 status:'draft',
 colors:{background:'#FFFFFF',surface:'#F3F6FB',text:'#10284B',muted:'#576980',accent:'#2B7FFF',onAccent:'#FFFFFF',border:'#DCE3ED',backgroundDark:'#10284B',onDark:'#FFFFFF',accentLight:'#93BCFF'},
 typography:{fontFamily:'"Google Sans", sans-serif',titleWeight:700,bodyWeight:400,titleLineHeight:1.04,bodyLineHeight:1.3},
 shape:{radius:24},
};

// One maintained registry. No experimental render becomes an official identity.
// DoctorChart maps the existing reel theme to preserve its work; all remain draft.
const profiles:Record<ProductId,BrandOverrides>={
  bycode:{name:'Bycode',status:'draft'},
  doctorchart:{
    name:'DoctorChart',status:'draft',
    colors:{background:'#F4F8F8',surface:'#FFFFFF',text:'#173B50',muted:'#65818A',accent:'#12A89D',onAccent:'#FFFFFF',border:'#D9E7E8',backgroundDark:'#092A38',onDark:'#FFFFFF',accentLight:'#66DBCD'},
    typography:{fontFamily:'"Google Sans", sans-serif',titleWeight:700,bodyWeight:400,titleLineHeight:1.08,bodyLineHeight:1.25},
    shape:{radius:30},
  },
  pointly:{name:'Pointly',status:'draft'},
};

/** Fresh token groups per consumer; unspecified products never inherit DoctorChart's palette. */
export const createProductBrand=(product:ProductId,overrides:BrandOverrides={})=>{
  if(!Object.prototype.hasOwnProperty.call(profiles,product))throw new RangeError(`Unknown product: ${product}`);
  const base=createBrand(profiles[product]);
  return createBrand({...base,...overrides,colors:{...base.colors,...overrides.colors},typography:{...base.typography,...overrides.typography},shape:{...base.shape,...overrides.shape}});
};

/** Current portrait production layout, adjustable for each composition and social overlay. */
export const portraitSafeInsets:Readonly<SafeInsets>=Object.freeze({left:84,right:168,top:210,bottom:410});
