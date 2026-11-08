import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, base, openBrowser, accounts, login } from './browser.mjs';
import { TabRecorder } from './tab-recorder.mjs';
import { briefChapters } from '../script/brief-chapters.mjs';
const productionPython = path.join(
  root,
  '../doctorchart-video-tutorial/.local/voice-venv/Scripts/python.exe',
);
execFileSync(productionPython, [path.join(root, 'demo/runtime.py'), 'verify'], { stdio: 'pipe' });
const stateFile = path.join(root, '.local/brief-state.json');
const state = fs.existsSync(stateFile)
  ? JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  : {
      take: '20261108',
      companyName: 'Café del Puerto DEMO',
      slug: 'cafe-del-puerto-recorrido-20261108',
      person: {
        name: 'Ana Torres DEMO',
        dni: '99951008',
        country: 'Argentina',
        email: 'ana.recorrido@example.invalid',
        phone: '+5492235550199',
      },
    };
const persist = () => fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
persist();
const selected = process.argv.slice(2).filter((a) => a.startsWith('b'));
const x = await openBrowser();
const p = x.page;
p.setDefaultTimeout(25000);
p.setDefaultNavigationTimeout(60000);
const recorder = new TabRecorder(p, null);
await recorder.init();
let auth = '',
  phases = [],
  proof = [],
  current;
p.on('request', (r) => {
  const h = r.headers().authorization;
  if (h?.startsWith('Bearer ')) auth = h;
});
const pause = (ms) => p.waitForTimeout(ms);
const clock = () => p.evaluate(() => performance.timeOrigin + performance.now());
const field = (name) => p.locator(`[formcontrolname="${name}"]`).filter({ visible: true }).first();
const button = (name) =>
  p
    .getByRole('button', { name, exact: typeof name === 'string' })
    .filter({ visible: true })
    .first();
async function click(l) {
  await recorder.click(l);
  await pause(180);
}
async function fill(l, v) {
  await recorder.move(l);
  await l.fill('');
  if ((await l.getAttribute('type')) === 'date') await l.fill(String(v));
  else await l.pressSequentially(String(v), { delay: 18 });
  await l.blur();
  await pause(120);
}
async function ready() {
  await p.waitForLoadState('networkidle', { timeout: 25000 });
  await p.evaluate(() => document.fonts.ready);
  await pause(400);
}
async function go(route) {
  await p.goto(base + route, { waitUntil: 'domcontentloaded' });
  await ready();
}
async function company() {
  if (!state.company) throw Error('Capture the genuine company creation first');
  await go('/companies/' + state.slug);
  await p.getByRole('heading', { name: state.companyName, exact: true }).waitFor();
}
async function tab(name) {
  await click(
    p
      .getByRole('navigation', { name: 'Secciones del comercio' })
      .getByRole('button', { name: new RegExp('^' + name) }),
  );
  await pause(450);
}
async function note(label, data = {}) {
  await pause(450);
  const at = await clock();
  const file = `qa/${current.id}-${proof.length + 1}.png`;
  await p.screenshot({ path: path.join(root, file) });
  proof.push({ label, at, url: new URL(p.url()).pathname, frame: file, ...data });
}
async function phase(id, voice, fn) {
  console.log('PHASE', current.id, id);
  const start = await clock();
  await fn();
  await pause(450);
  phases.push({ id, voice, start, end: await clock() });
}
async function mutation(route, name) {
  const response = p.waitForResponse(
    (r) => new URL(r.url()).pathname === '/api/pointly' + route && r.request().method() === 'POST',
  );
  await click(button(name));
  const r = await response;
  if (!r.ok()) throw Error('Real mutation rejected: ' + route + ' ' + r.status());
  const body = await r.text();
  return body ? JSON.parse(body) : { status: r.status() };
}
async function api(method, route, body) {
  if (!auth) throw Error('No current merchant auth observed');
  const r = await x.context.request.fetch('https://localhost:25443/api/pointly' + route, {
    method,
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    data: body,
    ignoreHTTPSErrors: true,
  });
  if (!r.ok()) throw Error('Demo API rejected ' + method + ' ' + route + ' ' + r.status());
  return r.status() === 204 ? null : await r.json();
}
async function balance() {
  const a = await api('GET', `/companies/${state.company.id}/clients/${state.person.id}`);
  return a.balance;
}
async function personDetail() {
  await tab('Clientes');
  await fill(p.locator('#client-search'), 'Ana');
  await pause(500);
  await click(p.getByRole('link', { name: 'Ver detalle de ' + state.person.name }));
  await p.getByText('Puntos disponibles', { exact: true }).waitFor();
  await p.getByText('Historial de puntos', { exact: true }).waitFor();
  await pause(400);
}
const actions = {
  'b01-intro': async () => {
    await phase('overview', 'Pointly te ayuda', async () => {
      await note('Actual public Pointly home');
      await pause(1800);
    });
  },
  'b02-company': async () => {
    if (state.company)
      throw Error(
        'The company already exists. Use a fresh owned merchant/take instead of repeating a creation.',
      );
    await phase('login', 'Para comenzar', async () => {
      await fill(p.locator('input[type=email]'), accounts().BRIEF.email);
      await fill(p.locator('input[type=password]'), accounts().BRIEF.password);
      await click(button('Ingresar al panel'));
      await p.waitForURL((u) => !u.pathname.includes('/login'));
      await field('dni').waitFor();
    });
    await phase('profile', 'Si es tu primer ingreso', async () => {
      await fill(field('dni'), '99000908');
      await click(button(/Continuar al Panel/));
      await field('dni').waitFor({ state: 'hidden' });
      if (new URL(p.url()).pathname === '/login') {
        await click(p.locator('app-account-menu .account-toggle'));
        await click(p.getByRole('link', { name: 'Mis comercios', exact: true }));
      }
      await p.getByText('Mis comercios', { exact: true }).first().waitFor();
      await click(button(/Nueva Empresa|Crear Primera Empresa/));
      await field('name').waitFor();
    });
    await phase('name', 'Cargamos el nombre', async () => {
      await fill(field('name'), state.companyName);
      await fill(p.locator('#company-public-name'), state.slug);
      await p.getByText('Nombre disponible', { exact: false }).first().waitFor();
    });
    await phase('rule', 'Después definimos', async () => {
      await fill(field('amountStep'), '1000');
      await fill(field('pointsPerStep'), '10');
      await note('Base rule selected before company creation', {
        amountStep: 1000,
        pointsPerStep: 10,
      });
    });
    await phase('country', 'Elegimos el país', async () => {
      await click(p.locator('app-country-select button').first());
      await click(p.getByRole('button', { name: /Argentina/ }).last());
    });
    await phase('expiry-section', 'En este mismo formulario', async () => {
      await field('isPointsExpirationEnabled').scrollIntoViewIfNeeded();
      await recorder.move(field('isPointsExpirationEnabled'));
    });
    await phase('expiry', 'Activamos la opción', async () => {
      await click(field('isPointsExpirationEnabled'));
      await fill(field('pointsExpirationDays'), '90');
      await note('Expiry selected in CREATE form before saving', { enabled: true, days: 90 });
    });
    await phase('create', 'Revisamos el nombre', async () => {
      const data = await mutation('/companies', 'Crear empresa');
      state.company = { id: data.id, name: data.name, publicName: data.publicName };
      persist();
      await p.waitForURL((u) => !u.pathname.includes('/new'));
      await note('New company genuinely created with both rules', { companyId: data.id });
    });
    await phase('ready', 'Ahora tenemos', async () => {
      if (!new URL(p.url()).pathname.startsWith('/companies/' + state.slug))
        await click(p.getByRole('link', { name: /Ver Detalle/ }).first());
      await p.getByRole('heading', { name: state.companyName, exact: true }).waitFor();
      await note('Same newly created company ready for first client');
    });
  },
  'b03-client': async () => {
    if (state.person.id)
      throw Error(
        'Client already associated in this take; do not manufacture a second successful signup.',
      );
    await phase('open', 'Desde el comercio', async () => {
      await click(button(/Nuevo Cliente|Agregar cliente/i));
      await field('name').waitFor();
    });
    await phase('identity', 'Completamos el nombre', async () => {
      await fill(field('name'), state.person.name);
      await fill(field('dni'), state.person.dni);
    });
    await phase('contacts', 'Correo y teléfono', async () => {
      await fill(field('email'), state.person.email);
      await fill(field('phone'), state.person.phone);
    });
    await phase('save', 'Guardamos sus datos', async () => {
      const a = await mutation('/points-accounts', 'Guardar cliente');
      state.person.id = a.client.id;
      state.person.accountId = a.id;
      persist();
      await p.getByRole('heading', { name: state.companyName, exact: true }).waitFor();
      await click(button('Ver clientes'));
      await p.locator('#client-search').waitFor();
    });
    await phase('search', 'La búsqueda permite', async () => {
      await fill(p.locator('#client-search'), 'Ana');
      await pause(450);
      await click(p.getByRole('link', { name: 'Ver detalle de ' + state.person.name }));
      await p.getByText('Historial de puntos', { exact: true }).waitFor();
    });
    await phase('zero', 'En el detalle', async () => {
      const b = await balance();
      if (b !== 0) throw Error('New client is not at zero');
      await note('Ana starts at zero with no prior movements', { balance: b });
    });
    await phase('qr', 'También podés compartir', async () => {
      await click(p.getByRole('link', { name: 'Volver a clientes' }));
      await click(
        p
          .getByRole('navigation', { name: 'Secciones del comercio' })
          .getByRole('button', { name: 'Resumen General', exact: true }),
      );
      await click(button('Generar QR de Registro'));
      await button('Descargar PNG').waitFor();
      const download = p.waitForEvent('download');
      await click(button('Descargar PNG'));
      await (await download).saveAs(path.join(root, '.local/brief-qr.png'));
      await note('Actual registration QR for the same company downloaded');
    });
  },
  'b04-sale': async () => {
    if (state.sale) throw Error('Sale already recorded in this take');
    if ((await balance()) !== 0) throw Error('Ana must start this purchase at zero');
    await phase('open', 'Ana realiza una compra', async () => {
      await click(button('Registrar venta'));
      await field('dni').waitFor();
    });
    await phase('fill', 'Elegimos Registrar venta', async () => {
      await fill(field('dni'), state.person.dni);
      await fill(field('amount'), '8500');
      await p.getByText(state.person.name, { exact: false }).waitFor();
    });
    await phase('estimate', 'Antes de confirmar', async () => {
      await note('Real purchase estimate for Ana', {
        amount: 8500,
        expectedPoints: 80,
        balanceBefore: 0,
      });
    });
    await phase('confirm', 'Confirmamos una sola vez', async () => {
      state.sale = await mutation('/sales', 'Registrar venta y sumar puntos');
      persist();
      if ((await balance()) !== 80) throw Error('Purchase did not produce exactly 80 points');
    });
    await phase('detail', 'Después volvemos', async () => {
      await personDetail();
    });
    await phase('result', 'Su saldo pasó', async () => {
      await note('Ana now has 80 and the actual EARNED movement is visible', {
        balance: 80,
        saleId: state.sale.id,
      });
      await recorder.scroll(220);
      await pause(500);
    });
  },
  'b05-reward': async () => {
    if (state.reward || state.redemption) throw Error('Reward/canje already exists in this take');
    await phase('open', 'Ahora preparamos', async () => {
      await tab('Premios');
      await click(button(/Agregar Premio/i));
      await field('name').waitFor();
    });
    await phase('types', 'Podemos ofrecer', async () => {
      await recorder.move(
        p
          .locator('label')
          .filter({ has: p.locator('input[formcontrolname=kind][value=PHYSICAL]') }),
      );
    });
    await phase('define', 'Para este ejemplo', async () => {
      await fill(field('name'), 'Café de regalo');
      await fill(field('description'), 'Un café por canje. Entrega en el comercio.');
      await p.locator('#reward-photo').setInputFiles(path.join(root, 'demo/assets/cafe-demo.png'));
    });
    await phase('cost', 'Le asignamos', async () => {
      await fill(field('costInPoints'), '80');
      state.reward = await mutation('/rewards', 'Guardar Premio');
      persist();
      await tab('Premios');
      await p.getByText('Café de regalo', { exact: true }).waitFor();
    });
    await phase('card', 'La tarjeta ya muestra', async () => {
      await note('The newly created 80-point coffee reward', {
        rewardId: state.reward.id,
        cost: state.reward.costInPoints,
      });
    });
    await phase('redeem', 'Para entregárselo', async () => {
      await click(button('Canjear'));
      await fill(field('dni'), state.person.dni);
    });
    await phase('review', 'Revisamos el premio', async () => {
      if ((await balance()) !== 80) throw Error('Ana does not have exactly 80 before canje');
      await note('Same coffee and same Ana ready for a single redemption', {
        balanceBefore: 80,
        cost: 80,
      });
    });
    await phase('confirm', 'El canje descuenta', async () => {
      state.redemption = await mutation('/rewards/redeem', 'Descontar puntos y registrar canje');
      persist();
      if ((await balance()) !== 0) throw Error('Final balance is not zero');
    });
    await phase('history', 'Ana queda con cero', async () => {
      await personDetail();
      await recorder.scroll(180);
      await note('Ana ends at zero; both earned and redeemed movements visible', {
        balanceAfter: 0,
        cost: 80,
      });
    });
  },
  'b06-catalog': async () => {
    if (state.promotion || state.product)
      throw Error('Catalog examples already recorded in this take');
    await phase('open', 'También podés sumar', async () => {
      await tab('Promociones');
      await click(button(/Crear Promoción|Agregar Promoción/i));
      await field('name').waitFor();
    });
    await phase('promotion', 'En Promociones creamos', async () => {
      await fill(field('name'), 'Semana de puntos dobles');
      await fill(field('description'), 'Doble de puntos durante las fechas indicadas.');
      await click(p.locator('label').filter({ hasText: 'El doble' }).first());
      const day = (n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, '0'),
          String(d.getDate()).padStart(2, '0'),
        ].join('-');
      };
      await fill(field('startDate'), day(1));
      await fill(field('endDate'), day(8));
      state.promotion = await mutation('/promotions', 'Guardar Promoción');
      persist();
      await tab('Promociones');
      await p.getByText('Semana de puntos dobles', { exact: true }).waitFor();
    });
    await phase('future', 'La dejamos programada', async () => {
      await note('Double-points promotion scheduled AFTER the demonstrated base purchase', {
        promotionId: state.promotion.id,
      });
    });
    await phase('product', 'En Productos agregamos', async () => {
      await tab('Productos');
      await click(button(/Agregar Producto/i));
      await fill(field('name'), 'Café doble');
      await fill(field('price'), '3500');
      await fill(field('description'), 'Café de especialidad para acompañar tu día.');
      state.product = await mutation('/products', 'Guardar Producto');
      persist();
      await tab('Productos');
      await p.getByText('Café doble', { exact: true }).waitFor();
    });
    await phase('cards', 'Guardamos y revisamos', async () => {
      await note('Product retained in the same company catalog', {
        productId: state.product.id,
        price: 3500,
      });
    });
  },
  'b07-contact': async () => {
    await phase('inactive', 'Para acompañar', async () => {
      await tab('Sin actividad');
      await p.getByText('Luis Rojas DEMO', { exact: true }).waitFor();
    });
    await phase('period', 'Elegís el período', async () => {
      await click(button('30 días'));
      await pause(400);
      await note('Separate historical demonstration client, not Ana, in inactivity list');
    });
    await phase('whatsapp', 'Con Contactar por WhatsApp', async () => {
      await click(button(/Contactar por WhatsApp/i));
      await button('Copiar Mensaje').waitFor();
      await click(button('Copiar Mensaje'));
      await note('Actual WhatsApp draft copied; no outside message sent');
    });
    await phase('email', 'En Correos elegís', async () => {
      await click(
        p.locator('#workflow-page').getByRole('button', { name: '← Volver', exact: true }),
      );
      await tab('Correos');
      await p.getByRole('radio', { name: 'Sí', exact: true }).check();
      await pause(600);
    });
    await phase('preview', 'Las vistas previas', async () => {
      const group = p.getByRole('group', { name: 'Elegir correo de ejemplo' });
      await click(group.getByRole('button', { name: 'Cerca de un premio' }));
      await recorder.scroll(260);
      await note('Actual email preferences and preview; no external send claimed');
    });
  },
  'b08-points': async () => {
    await phase('lookup', 'Ahora veamos', async () => {
      await recorder.move(p.locator('#home-country'));
    });
    await phase('identify', 'Desde el inicio', async () => {
      await p.locator('#home-country').selectOption({ label: state.person.country });
      await fill(field('dni'), state.person.dni);
      await click(button(/Ver mis puntos/));
      await p.getByRole('link').filter({ hasText: state.companyName }).first().waitFor();
    });
    await phase('store', 'Abre Café del Puerto', async () => {
      await click(p.getByRole('link').filter({ hasText: state.companyName }).first());
      await p.getByText('Tus puntos disponibles', { exact: true }).waitFor();
    });
    await phase('balance', 'El saldo es cero puntos', async () => {
      await note('Public consultation shows the same zero balance after the one canje', {
        expectedBalance: 0,
        person: state.person.name,
      });
    });
    await phase('rewards', 'En cada premio', async () => {
      await recorder.scroll(230);
      await p.getByText('Café de regalo', { exact: true }).waitFor();
      await note('Same coffee reward remains in public consultation');
    });
    await phase('products', 'También puede recorrer', async () => {
      await click(button('Productos'));
      await p.getByText('Café doble', { exact: true }).waitFor();
      await note('Same product retained in public catalog');
    });
    await phase('return', 'Para obtener otro premio', async () => {
      await click(button('Premios'));
      await note('Customer consultation and merchant balance agree', { expectedBalance: 0 });
    });
  },
  'b09-close': async () => {
    await phase('recap', 'En el día a día', async () => {
      await note('Same final customer consultation for closing');
      await pause(1500);
    });
  },
};
try {
  for (const c of briefChapters.filter((c) => !selected.length || selected.includes(c.id))) {
    current = c;
    phases = [];
    proof = [];
    if (['b01-intro', 'b02-company'].includes(c.id))
      await go(c.id === 'b01-intro' ? '/' : '/login');
    else if (c.id === 'b08-points') {
      await x.context.clearCookies();
      if (p.url().startsWith(base + '/')) await p.evaluate(() => localStorage.clear());
      await go('/');
      await field('dni').waitFor();
    } else if (c.id !== 'b09-close') {
      if (!auth) {
        await login(p, 'BRIEF');
        await ready();
      }
      if (c.id === 'b07-contact') {
        execFileSync(productionPython, [path.join(root, 'demo/brief-retention-fixture.py')], {
          stdio: 'pipe',
        });
      }
      await company();
    }
    await recorder.begin({
      id: c.id,
      expected_state: c.objective,
      manifest: 'recordings/brief-manifest.json',
    });
    await actions[c.id]();
    await pause(800);
    const entry = await recorder.end();
    fs.writeFileSync(
      path.join(root, 'qa', c.id + '-evidence.json'),
      JSON.stringify(
        {
          scene: c.id,
          source: entry.file,
          phases,
          evidence: proof,
          network: entry.network_assertions,
          person: state.person.name,
          company: state.companyName,
        },
        null,
        2,
      ),
    );
    console.log('RECORDED', c.id, entry.probe.duration, phases.length, 'phases');
  }
} catch (error) {
  await p.screenshot({ path: path.join(root, 'qa/brief-capture-failure.png') });
  let retained = null;
  if (recorder.active) {
    try {
      retained = await recorder.end();
      const mf = path.join(root, 'recordings/brief-manifest.json'),
        m = JSON.parse(fs.readFileSync(mf));
      m.recordings = m.recordings.filter((r) => r.recording_id !== retained.recording_id);
      fs.writeFileSync(mf, JSON.stringify(m, null, 2));
    } catch {}
  }
  fs.writeFileSync(
    path.join(root, '.local/logs/brief-capture-failure.json'),
    JSON.stringify(
      {
        scene: current?.id,
        error: error.message,
        url: new URL(p.url()).pathname,
        retained,
        phases,
        evidence: proof,
        text: (await p.locator('body').innerText()).slice(-7000),
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await x.browser.close();
}
