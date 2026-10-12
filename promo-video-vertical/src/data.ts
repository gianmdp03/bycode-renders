export const demo = {
  business: 'Café Aurora', branch: 'Sucursal Centro', secondBranch: 'Sucursal Norte',
  address: 'Av. Colón 1250', city: 'Mar del Plata', country: 'Argentina',
  customer: 'María García', firstName: 'María', dni: '40123456',
  email: 'maria@ejemplo.com', phone: '5492235550100',
  amountStep: 100, pointsPerStep: 10, purchase: 1000, firstAward: 100,
  reward: 'Café de especialidad', rewardCost: 100,
  secondReward: 'Desayuno para dos', secondRewardCost: 900,
  promotion: 'Fin de semana 2x', promoStart: '25/09/2026', promoEnd: '27/09/2026',
  retentionDate: '27/10/2026', inactiveDays: 33, finalBalance: 650,
};
// Tier for the NEXT purchase follows the number of completed recent purchases.
// No sale is shown under the separate 2x campaign: no unverified multiplier stacking.
export const ledger = [
  {date: '01/09', amount: 1000, award: 100, redeemed: 100, balance: 0, purchases: 1, tier: 'Bronce'},
  {date: '04/09', amount: 1000, award: 100, redeemed: 0, balance: 100, purchases: 2, tier: 'Bronce'},
  {date: '08/09', amount: 1000, award: 100, redeemed: 0, balance: 200, purchases: 3, tier: 'Plata'},
  {date: '12/09', amount: 1000, award: 150, redeemed: 0, balance: 350, purchases: 4, tier: 'Plata'},
  {date: '17/09', amount: 1000, award: 150, redeemed: 0, balance: 500, purchases: 5, tier: 'Plata'},
  {date: '24/09', amount: 1000, award: 150, redeemed: 0, balance: 650, purchases: 6, tier: 'Oro'},
];
// Native 60 FPS edit. Frame counts are the single source for scene boundaries.
const sceneDefinitions = [
  {id: '01-Promesa', name: 'La promesa', source: '01-Promise', frames: 192},
  {id: '02-Negocio', name: 'Tu programa', source: '02-Business', frames: 330},
  {id: '03-QR', name: 'Registro QR', source: '03-Join', frames: 390},
  {id: '04-Compra', name: 'Compra y puntos', source: '04-Purchase', frames: 396},
  {id: '05-Puntos', name: 'Saldo y catálogo', source: '05-Balance', frames: 468},
  {id: '06-Premios', name: 'Canje en el comercio', source: '06-Reward', frames: 408},
  {id: '07-Rangos', name: 'Visitas y rangos', source: '07-Tiers', frames: 420},
  {id: '08-Promociones', name: 'Promoción 2x', source: '08-Promotion', frames: 372},
  {id: '09-Retencion', name: 'Mensajes y retención', source: '09-Retention', frames: 612},
  {id: '10-Pointly', name: 'Pointly', source: '10-Closing', frames: 240},
];
export const beats = sceneDefinitions.map((scene, index) => {
  const startFrame = sceneDefinitions.slice(0, index).reduce((sum, item) => sum + item.frames, 0);
  return {...scene, startFrame, start: startFrame / 60, seconds: scene.frames / 60};
});
const frames = beats.reduce((sum, scene) => sum + scene.frames, 0);
export const VIDEO = {id: 'Pointly-Vertical-Master', width: 1080, height: 1920, fps: 60, seconds: frames / 60, frames};
export const money = (n: number) => '$' + n.toLocaleString('es-AR');
