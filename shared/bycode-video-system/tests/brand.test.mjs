import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrandLockup, BrandProvider, createBrand, draftBrand, suggestedSafeInsets } from '@bycode/video-system/brand';
import { PromoCta, PromoTitle, entranceProgress,groupCaptionWords,captionGroupAt } from '@bycode/video-system/promo';

test('partial project config preserves other groups and never mutates shared defaults', () => {
  const first = createBrand({ colors: { accent: '#123456' }, typography: { fontFamily: 'Project Font' } });
  const second = createBrand();
  assert.equal(first.colors.text, draftBrand.colors.text);
  assert.equal(first.typography.titleWeight, draftBrand.typography.titleWeight);
  first.colors.text = '#abcdef';
  assert.equal(second.colors.text, '#FFFFFF');
  assert.equal(draftBrand.colors.text, '#FFFFFF');
  assert.equal(first.status, 'draft');
  assert.throws(() => { draftBrand.colors.text = '#abcdef'; }, TypeError);
});

test('provider adoption emits exactly the legacy markup without a wrapper', () => {
  const scene = h('div', { style: { color: 'tomato' } }, 'Existing scene');
  assert.equal(
    renderToStaticMarkup(h(BrandProvider, { brand: createBrand({ colors: { text: '#000000' } }) }, scene)),
    renderToStaticMarkup(scene),
  );
});

test('nested product brands remain isolated and logo is never guessed', () => {
  const markup = renderToStaticMarkup(h(BrandProvider, { brand: createBrand({ name: 'ByCode' }) },
    h(BrandLockup),
    h(BrandProvider, { brand: createBrand({ name: 'DoctorChart', colors: { text: '#123456' } }) }, h(BrandLockup)),
    h(BrandLockup),
  ));
  assert.equal((markup.match(/>ByCode</g) ?? []).length, 2);
  assert.equal((markup.match(/>DoctorChart</g) ?? []).length, 1);
  assert.match(markup, /color:#123456/);
  assert.doesNotMatch(markup, /<img/);
});

test('title and CTA consume project overrides; copy is escaped and caller styles win', () => {
  const brand = createBrand({ colors: { accent: '#123456', text: '#eeeeee' } });
  const markup = renderToStaticMarkup(h(BrandProvider, { brand },
    h(PromoTitle, { fontSize: 48 }, 'Demo <only>'),
    h(PromoCta, { destination: 'example.invalid', style: { borderRadius: 8 } }, 'View demo'),
  ));
  assert.match(markup, /Demo &lt;only&gt;/);
  assert.match(markup, /font-size:48px/);
  assert.match(markup, /background-color:#123456/);
  assert.match(markup, /border-radius:8px/);
  assert.match(markup, /example.invalid/);
});

test('safe inset suggestions follow composition pixels and reject invalid dimensions', () => {
  assert.deepEqual(suggestedSafeInsets(1080, 1920), { top: 192, right: 129.6, bottom: 384, left: 86.4 });
  assert.deepEqual(suggestedSafeInsets(1920, 1080), { top: 86.4, right: 115.19999999999999, bottom: 86.4, left: 115.19999999999999 });
  for (const width of [0, -1, Infinity, NaN]) assert.throws(() => suggestedSafeInsets(width, 1920), RangeError);
});

test('reveal clamps local frames, supports instant entrances, and rejects invalid timing', () => {
  assert.equal(entranceProgress(-1, 0, 12), 0);
  assert.equal(entranceProgress(0, 0, 12), 0);
  assert.equal(entranceProgress(6, 0, 12), 0.875);
  assert.equal(entranceProgress(12, 0, 12), 1);
  assert.equal(entranceProgress(999, 0, 12), 1);
  assert.equal(entranceProgress(11, 12, 0), 0);
  assert.equal(entranceProgress(12, 12, 0), 1);
  assert.throws(() => entranceProgress(0, 0, -1), RangeError);
  assert.throws(() => entranceProgress(NaN, 0, 12), RangeError);
});

test('captions respect phrase breaks, five-word limit and real timestamp boundaries',()=>{
 const caps=Array.from({length:9},(_,i)=>({text:` word${i}`,startMs:i*100,endMs:(i+1)*100,timestampMs:null,confidence:null,pageBreakAfter:i===2}));
 const groups=groupCaptionWords(caps);
 assert.deepEqual(groups.map(g=>g.length),[3,5,1]);
 assert.equal(captionGroupAt(groups,-1),undefined);
 assert.equal(captionGroupAt(groups,0),groups[0]);
 assert.equal(captionGroupAt(groups,370),groups[1]);
 assert.equal(captionGroupAt(groups,970),undefined);
 assert.deepEqual(groupCaptionWords([]),[]);
});
