// Isolated real IPC/image processing; mock remove.bg only. No API charges.
const { _electron } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const sharp = require('sharp');
(async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'stashframe-effects-'));
  const app = await _electron.launch({ args: [path.resolve(__dirname, '..'), '--test-mode', `--test-data=${root}`] });
  try {
    const page = await app.firstWindow();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.waitForSelector('#settings-dialog[open]');
    assert.equal(await page.locator('#twitter-module, #twitter-workspace, #scrapecreators-key').count(), 0);
    assert.equal(await page.evaluate(() => 'searchTweets' in window.images), false);
    await page.locator('#close-settings').click();
    assert.equal(await page.title(), 'Stashframe');
    if (process.platform === 'darwin') assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisibleOnAllWorkspaces()), true);
    await page.evaluate(() => window.images.configure({ removebg: 'test-key-not-a-real-secret' }));
    const originalBytes = await sharp({ create: { width: 40, height: 40, channels: 4, background: '#dddddd' } }).png().toBuffer();
    const subject = await sharp({ create: { width: 20, height: 20, channels: 4, background: '#ff0000' } }).png().toBuffer();
    const cutoutBytes = await sharp({ create: { width: 40, height: 40, channels: 4, background: '#00000000' } }).composite([{ input: subject, left: 10, top: 10 }]).png().toBuffer();
    await app.evaluate((_electron, bytes) => {
      globalThis.removalCalls = 0;
      globalThis.fetch = async url => {
        if (String(url) !== 'https://api.remove.bg/v1.0/removebg') throw new Error('Unexpected network request');
        globalThis.removalCalls++;
        return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': 'image/png' } });
      };
    }, [...cutoutBytes]);
    const imported = await page.evaluate(bytes => window.images.importGeneration({ bytes, name: 'Test subject.png' }), [...originalBytes]);
    const original = imported.asset;
    const [cutout, sticker] = await page.evaluate(item => Promise.all(['removebg', 'sticker'].map(type => window.images.action({ type, item, query: 'Subject' }))), original);
    assert.equal(await app.evaluate(() => globalThis.removalCalls), 1);
    assert.equal(cutout.sticker, false); assert.equal(sticker.sticker, true); assert.equal(sticker.cutoutId, cutout.id);
    const rawCutout = await sharp(path.join(root, 'images', cutout.id + '.png')).raw().toBuffer({ resolveWithObject: true });
    assert.equal(rawCutout.info.width, 40); assert.equal(rawCutout.data[3], 0);
    for (let i=0; i<rawCutout.data.length; i+=4) assert.ok(!(rawCutout.data[i]===255 && rawCutout.data[i+1]===255 && rawCutout.data[i+2]===255 && rawCutout.data[i+3]>0), 'cutout must have no white border');
    const rawSticker = await sharp(path.join(root, 'images', sticker.id + '.png')).raw().toBuffer({ resolveWithObject: true });
    assert.ok(rawSticker.info.width > 40);
    let white = false; for (let i=0; i<rawSticker.data.length; i+=4) if (rawSticker.data[i]===255 && rawSticker.data[i+1]===255 && rawSticker.data[i+2]===255 && rawSticker.data[i+3]===255) white = true;
    assert.ok(white); assert.equal(rawSticker.data[3], 0);
    const restored = await page.evaluate(item => window.images.action({ type: 'removebg', item }), sticker);
    assert.equal(restored.id, cutout.id);
    const entries = await page.evaluate(items => Promise.all(items.map(item => window.images.action({ type: 'save', item, query: 'Subject' }))), [original,cutout,sticker]);
    assert.deepEqual(entries.map(e => e.name), ['Subject (1)', 'Subject (2)', 'Subject (3)']);
    assert.equal(new Set(entries.map(e => e.id)).size, 3);
    await page.evaluate(items => { const tab=current(); tab.browsingSaved=false; tab.query='Subject'; tab.draft='Subject'; tab.items=items; render(); }, [original,cutout,sticker]);
    assert.equal(await page.locator('.card-actions [data-action="removebg"]').count(), 3);
    assert.equal(await page.locator('.card-actions [data-action="sticker"]').count(), 3);
    await page.locator('.image-stage').first().click();
    await page.getByRole('button', { name: 'Sticker', exact: true }).last().click();
    await page.waitForFunction(() => preview.item.sticker === true && busy.size === 0);
    await page.getByRole('button', { name: 'Remove background', exact: true }).last().click();
    await page.waitForFunction(() => preview.item.cutout && !preview.item.sticker && busy.size === 0);
    assert.equal(await app.evaluate(() => globalThis.removalCalls), 1);
    await page.locator('#close-preview').click();
    await fs.mkdir(path.resolve('test-artifacts'), { recursive: true });
    await page.screenshot({ path: path.resolve('test-artifacts/stashframe-effects.png') });
    assert.deepEqual(errors, []);
    console.log('PASS: no social API/UI; cutout and sticker pixels differ; one removal request; three distinct saved variants; UI actions work; all-Spaces flag set.');
  } finally { await app.close(); await fs.rm(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
