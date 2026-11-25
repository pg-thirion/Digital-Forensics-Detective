import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const nodes = new Map();
function element(id) {
  if (!nodes.has(id)) nodes.set(id, { innerHTML: '', textContent: '', value: '', style: {}, querySelectorAll: () => [], scrollIntoView() {}, setAttribute() {}, focus() {} });
  return nodes.get(id);
}
const context = vm.createContext({
  document: { getElementById: element },
  localStorage: { getItem: () => null, setItem() {} },
  window: { scrollTo() {} }
});
vm.runInContext(script + '\nglobalThis.api = { CASES, grade, fresh, openCase, state, home, evidenceHTML, questionHTML, normalise };', context);
const { CASES, grade, fresh, openCase, state, home, evidenceHTML, questionHTML, normalise } = context.api;

test('case identifiers are unique', () => {
  assert.equal(new Set(CASES.map(c => c.id)).size, CASES.length);
});
for (const c of CASES) {
  test(c.title + ': case data and scoring', () => {
    assert.ok(c.e.length >= 8);
    const answers = {}, links = {};
    c.q.forEach((q,i) => {
      assert.ok(q[2] >= 0 && q[2] < q[1].length);
      assert.ok(q[3].every(n => n > 0 && n <= c.e.length));
      answers[i] = q[2]; links[i] = q[3];
    });
    assert.equal(grade(c, answers, links, 0).score, 100);
    assert.equal(grade(c, {}, {}, 0).score, 0);
    assert.equal(grade(c, answers, links, 1).score, 95);
    assert.equal(grade(c, answers, {}, 0).score, 70);
    assert.equal(grade(c, answers, links, 9).score, 95);
  });
  test(c.title + ': workspace rendering and evidence gating', () => {
    openCase(c.id);
    assert.ok(element('app').innerHTML.includes(c.title));
    assert.ok(evidenceHTML().includes('Inspect artefact'));
    assert.ok(!evidenceHTML().includes(c.e[0][3]));
    const s = state(c);
    s.seen.push(1);
    assert.ok(evidenceHTML().includes('Inspected'));
    assert.ok(questionHTML().includes('data-proof="0:1"'));
  });
}
test('home renders case queue', () => {
  home();
  assert.ok(element('app').innerHTML.includes('Investigation queue'));
});
test('fresh state is independent', () => {
  const a = fresh(), b = fresh();
  a.seen.push(1);
  assert.equal(b.seen.length, 0);
});

test('malformed saves cannot crash the UI or inflate scores', () => {
  const c = CASES[0];
  const s = normalise(c, { seen: [1, 1, -1, 999, '2'], notes: 42, hints: 100, answers: { 0: 999 }, links: { 0: [1, 1, 2] }, result: { score: 999 } });
  assert.equal(s.seen.length, 1);
  assert.equal(s.notes, '');
  assert.equal(s.hints, 0);
  assert.equal(s.answers[0], undefined);
  assert.equal(s.links[0].length, 1);
  assert.equal(s.result, null);
});
test('duplicate or unrelated evidence cannot inflate support', () => {
  const c = CASES[0], q = c.q[0];
  assert.equal(grade(c, {0: q[2]}, {0:[q[3][0], q[3][0]]}, 0).supported, 0);
  const irrelevant = c.e.findIndex((e,i)=>!q[3].includes(i+1))+1;
  assert.equal(grade(c, {0: q[2]}, {0:[...q[3], irrelevant]}, 0).supported, 0);
});
test('no inline script or external runtime assets', () => {
  assert.ok(html.includes('script-src \'self\''));
  assert.ok(html.includes('src="app.js"'));
  assert.ok(!html.includes('<script>'));
});
