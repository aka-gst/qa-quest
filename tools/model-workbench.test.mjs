import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_DATASET_PACKS, makeModelDataset, createLinearModel, trainLinearModel, evaluateLinearModel } from '../src/game/model-workbench.js';

test('model workbench covers digits, letters and visual icons', () => {
  assert.deepEqual(Object.keys(MODEL_DATASET_PACKS), ['digits','letters','icons']);
  for (const id of Object.keys(MODEL_DATASET_PACKS)) {
    const data = makeModelDataset(id);
    assert.equal(data.classes.length, 3);
    assert.equal(data.training.length, 3);
    assert.equal(data.evalSet.length, 12);
    assert.ok(data.evalSet.every((row) => row.pixels.length === 25));
  }
});

test('a real linear softmax layer learns hidden noisy evals and loss falls', () => {
  for (const id of Object.keys(MODEL_DATASET_PACKS)) {
    const data = makeModelDataset(id);
    const initial = createLinearModel(data.classes);
    const before = evaluateLinearModel(initial, data.evalSet);
    const trained = trainLinearModel(initial, data.training, 10);
    const after = evaluateLinearModel(trained, data.evalSet);
    assert.ok(after.accuracy > before.accuracy, `${id}: ${before.accuracy} -> ${after.accuracy}`);
    assert.ok(trained.loss < initial.loss, `${id}: loss should fall`);
    assert.equal(initial.epochs, 0, 'training must not mutate previous model');
  }
});

test('data augmentation expands training memory with noisy labeled examples', () => {
  const clean = makeModelDataset('digits');
  const augmented = makeModelDataset('digits', {augmented:true});
  assert.equal(clean.training.length, 3);
  assert.equal(augmented.training.length, 15);
  assert.equal(augmented.training.filter((row)=>row.source === 'augmented').length, 12);
});

test('workbench DOM exposes epochs, weights, augmentation and three dataset packs', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  for (const id of ['modelWorkbench','modelEpoch1','modelEpoch10','modelAugment','modelWeights','modelConfusion']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  for (const pack of ['digits','letters','icons']) assert.match(html, new RegExp(`data-model-pack=["']${pack}["']`));
  assert.match(css, /\.model-weights/);
  assert.match(css, /min-height:58px/);
});
