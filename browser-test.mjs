import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium, firefox, webkit } from 'playwright';

const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8']
};
const server = createServer(async (req,res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'Content-Type':file[1]});
  res.end(await readFile(new URL(file[0],import.meta.url)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/';
const cases = [
  [[1,[2,4,5]],[2,[3,5]],[1,[4,6]]],
  [[2,[2,3,5]],[0,[1,2,3]],[1,[5,6]]],
  [[1,[3,4]],[2,[5]],[3,[3,4,8]]],
  [[1,[4,5]],[2,[2]],[3,[1,2,5,8]]],
  [[1,[1,2,3]],[0,[4,5]],[2,[5,7]]],
  [[1,[1,5,6]],[2,[4,7]],[3,[4,7,8]]]
];
async function run(engine,name,viewport) {
  const browser=await engine.launch({headless:true});
  try {
    const context=await browser.newContext({viewport,acceptDownloads:true});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404')&&!m.text().includes('favicon')) errors.push(m.text())});
    await page.goto(url);
    assert.equal(await page.locator('[data-open]').count(),6);
    for(let i=0;i<cases.length;i++) {
      const id=String(i+1).padStart(2,'0');
      await page.locator('[data-open="'+id+'"]').click();
      assert.equal(await page.locator('[data-inspect]').count(),8);
      assert.equal(await page.locator('#submit').isDisabled(),true);
      await page.locator('#search').fill('nonsense-999');
      assert.equal(await page.locator('.artifact').count(),0);
      await page.locator('#search').fill('');
      await page.locator('#sort').selectOption('newest');
      assert.match(await page.locator('.artifact').first().innerText(),/E08/);
      await page.locator('[data-tab="Timeline"]').click();
      assert.match(await page.locator('.artifact').first().innerText(),/E01/);
      await page.locator('[data-tab]').nth(2).click();
      const filtered=await page.locator('.artifact').count();
      assert.ok(filtered>0&&filtered<8);
      await page.locator('[data-tab="All"]').click();
      for(let j=1;j<=8;j++) await page.locator('[data-inspect="'+j+'"]').click();
      assert.equal(await page.locator('#progressTrack').getAttribute('aria-valuenow'),'8');
      await page.locator('#notes').fill('<img src=x onerror=alert(1)> fictional note');
      for(let j=0;j<3;j++) {
        const [answer,refs]=cases[i][j];
        await page.locator('input[name="q'+j+'"][value="'+answer+'"]').check();
        for(const ref of refs) await page.locator('[data-proof="'+j+':'+ref+'"]').click();
      }
      if(i===0) {
        await page.locator('#hint').click();
        assert.equal(await page.locator('#hint').isDisabled(),true);
        await page.reload();
        await page.locator('[data-open="'+id+'"]').click();
        assert.match(await page.locator('#notes').inputValue(),/fictional note/);
        assert.equal(await page.locator('#progressTrack').getAttribute('aria-valuenow'),'8');
        assert.equal(await page.locator('#hint').isDisabled(),true);
      }
      assert.equal(await page.locator('#submit').isEnabled(),true);
      await page.locator('#submit').click();
      assert.match(await page.locator('#feedback').innerText(),i===0?/95%/:/100%/);
      assert.equal(await page.locator('input[type=radio]').first().isDisabled(),true);
      const downloadPromise=page.waitForEvent('download');
      await page.locator('#export').click();
      const download=await downloadPromise;
      const report=JSON.parse(await readFile(await download.path(),'utf8'));
      assert.equal(report.caseId,id);
      assert.equal(report.inspected.length,8);
      assert.equal(report.findings.length,3);
      assert.equal(report.result.score,i===0?95:100);
      assert.equal(report.fictional,true);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
      assert.equal(overflow,false,'horizontal overflow: '+name+' case '+id);
      await page.locator('#home').click();
    }
    assert.match(await page.locator('.stats').innerText(),/6\/6/);
    await page.reload();
    await page.locator('[data-open="01"]').click();
    assert.match(await page.locator('#feedback').innerText(),/95%/);
    page.once('dialog',d=>d.accept());
    await page.locator('#reset').click();
    assert.equal(await page.locator('#progressTrack').getAttribute('aria-valuenow'),'0');
    assert.equal(await page.locator('#submit').isDisabled(),true);
    await page.evaluate(()=>localStorage.setItem('dfd-save-v1','{"01":{"seen":[1,1,999],"answers":{"0":999},"links":{"0":[999]},"result":{"score":1000}}}'));
    await page.reload();
    await page.locator('[data-open="01"]').click();
    assert.equal(await page.locator('#progressTrack').getAttribute('aria-valuenow'),'1');
    assert.equal(await page.locator('#submit').isDisabled(),true);
    await page.evaluate(()=>localStorage.setItem('dfd-save-v1','{broken'));
    await page.reload();
    assert.equal(await page.locator('[data-open]').count(),6);
    assert.deepEqual(errors,[]);
    await context.close();
    const blocked=await browser.newContext();
    await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked')}})});
    const blockedPage=await blocked.newPage();
    await blockedPage.goto(url);
    await blockedPage.locator('[data-open="01"]').click();
    await blockedPage.locator('#notes').fill('test');
    assert.match(await blockedPage.locator('#storageStatus').innerText(),/unavailable/);
    assert.match(await blockedPage.locator('#notebookStatus').innerText(),/Not saved/);
    await blocked.close();
    console.log(name+': all 6 cases, export, persistence, reset, storage corruption and layout passed');
  } finally { await browser.close(); }
}
try {
  await run(chromium,'Chromium desktop',{width:1440,height:900});
  await run(chromium,'Chromium mobile',{width:375,height:812});
  await run(firefox,'Firefox',{width:1280,height:800});
  await run(webkit,'WebKit',{width:1280,height:800});
} finally { await new Promise(resolve=>server.close(resolve)); }
