import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const nodes = new Map();
function element(id) {
  if (!nodes.has(id)) nodes.set(id, { innerHTML: '', textContent: '', value: '', style: {}, querySelectorAll: () => [], scrollIntoView() {} });
  return nodes.get(id);
}
const context = vm.createContext({
  document: { getElementById: element },
  localStorage: { getItem: () => null, setItem() {} },
  window: { scrollTo() {} }
});
vm.runInContext(script + '\nglobalThis.api = { CASES, grade, fresh, openCase, state, home, evidenceHTML, questionHTML };', context);
const { CASES, grade, fresh, openCase, state, home, evidenceHTML, questionHTML } = context.api;

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
    assert.equal(grade(c, answers, links, 9).score, 85);
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
