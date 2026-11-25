import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('./toolkit.js', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('./app.js', import.meta.url), 'utf8');
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
vm.runInContext(script + '\nglobalThis.api = { CASES, grade, fresh, openCase, state, home, evidenceHTML, questionHTML, normalise, DFD, queueCards };', context);
const { CASES, grade, fresh, openCase, state, home, evidenceHTML, questionHTML, normalise, DFD, queueCards } = context.api;

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

test('ten cases and 80 evidence records',()=>{assert.equal(CASES.length,10);assert.equal(CASES.reduce((n,c)=>n+c.e.length,0),80);assert.equal(CASES.reduce((n,c)=>n+c.q.length,0),30);});
test('search, difficulty, status and sort',()=>{assert.equal(DFD.filterCases(CASES,state,'Beginner').length,2);assert.equal(DFD.filterCases(CASES,state,'All','All','phantom invoice').length,1);assert.equal(DFD.filterCases(CASES,state,'All','All','zzzz').length,0);assert.equal(DFD.status(fresh()),'New');assert.equal(DFD.status({...fresh(),started:'x'}),'In progress');assert.equal(DFD.status({result:{score:100}}),'Closed');assert.equal(DFD.filterCases(CASES,state,'All','All','','title')[0].title,'The borrowed workstation');assert.ok(queueCards().includes('The phantom invoice'));});
test('bookmark, classification, bulk inspection eligibility and evidence filters',()=>{const c=CASES[0],s=fresh();s.seen=[1,2];s.bookmarks=DFD.toggle(s.bookmarks,1);assert.ok(DFD.matches(s,1,'Bookmarked'));assert.ok(!DFD.matches(s,2,'Bookmarked'));assert.ok(DFD.matches(s,3,'Uninspected'));s.labels[2]='Relevant';assert.ok(DFD.matches(s,2,'Relevant'));assert.equal(DFD.toggle(s.bookmarks,1).length,0);assert.equal(DFD.visible(c,s,'All','','Uninspected','oldest').length,6);assert.equal(DFD.visible(c,s,'All','','All','newest')[0].id,8);assert.equal(DFD.visible(c,s,'All',c.e[2][3],'All','oldest').length,0);});
test('comparison capacity, timeline reorder and verification',()=>{const c=CASES[0];assert.equal(DFD.compareToggle([1,2],3).join(','),'2,3');assert.equal(DFD.compareToggle([1,2],1).join(','),'2');assert.equal(DFD.chronological(c,[2,1]),false);assert.equal(DFD.chronological(c,DFD.move([2,1],1,-1)),true);assert.equal(DFD.move([1,2],1,-1).join(','),'1,2');});
test('new state validation and legacy migration',()=>{const c=CASES[0],s=normalise(c,{seen:[1,2],bookmarks:[1,9],timeline:[2,2,1],labels:{1:'Relevant',2:'bad'},annotations:{1:'<script>',2:12},checklist:[0,0,4,8],confidence:{0:3,1:9},hypothesis:'hyp',attempts:[{score:80,at:'2026-01-01T00:00:00Z'},{score:101,at:'2026-01-01T00:00:00Z'}],custody:[{id:1,action:'Inspected',at:'2026-01-01T00:00:00Z'},{id:99,action:'Inspected',at:'2026-01-01T00:00:00Z'}]});assert.equal(s.bookmarks.join(','),'1');assert.equal(s.timeline.join(','),'2,1');assert.equal(s.labels[2],undefined);assert.equal(s.annotations[1],'<script>');assert.equal(s.checklist.length,2);assert.equal(s.confidence[0],3);assert.equal(s.confidence[1],undefined);assert.equal(s.attempts.length,1);assert.equal(s.custody.length,1);assert.equal(s.hypothesis,'hyp');assert.equal(normalise(c,{seen:[1]}).bookmarks.length,0);});
test('custody limit and elapsed time',()=>{const s=fresh();for(let i=0;i<510;i++)DFD.log(s,1,'Inspected','2026-01-01T00:00:00Z');assert.equal(s.custody.length,500);s.started='2026-01-01T00:00:00Z';s.closed='2026-01-01T00:07:00Z';assert.equal(DFD.elapsed(s),'7 min elapsed');assert.equal(DFD.elapsed(fresh()),'Not timed');});
test('CSV formula safety and text report',()=>{const c=CASES[0],s=fresh();s.seen=[1];s.annotations[1]='=1+1';assert.ok(DFD.csv(c,s).includes("'=1+1"));assert.equal(DFD.csvCell('a"b'),'"a""b"');assert.ok(DFD.csvCell('  =1').includes("'  =1"));assert.ok(DFD.report(c,s).includes('FICTIONAL TRAINING REPORT'));});
test('progress backup roundtrip and invalid input',()=>{const raw=DFD.backup(Object.fromEntries(CASES.map(c=>[c.id,state(c)])));const s=DFD.restore(raw,CASES,normalise);assert.equal(Object.keys(s).length,10);assert.equal(s['01'].seen.length,state(CASES[0]).seen.length);assert.throws(()=>DFD.restore({format:'dfd-progress',version:99,cases:{}},CASES,normalise));});
test('annotation, hypothesis and report UI escape HTML',()=>{const s=fresh();s.seen=[1];s.annotations[1]='"><script>';s.hypothesis='<script>';assert.ok(DFD.artifact(s,1,[]).includes('&lt;script&gt;'));assert.ok(!DFD.artifact(s,1,[]).includes('<script>'));assert.ok(DFD.lab(CASES[0],s,[1]).includes('&lt;script&gt;'));assert.ok(DFD.readiness(CASES[0],s).includes('0/3 answered'));assert.ok(DFD.readiness(CASES[0],s).includes('Confidence'));});
test('achievements, statistics, glossary and theme',()=>{const s=DFD.stats(CASES,state);assert.equal(s.total,80);assert.equal(DFD.badges(CASES,state).length,5);assert.ok(DFD.dashboard(CASES,state).includes('Forensics glossary'));assert.equal(DFD.theme('light'),'light');assert.equal(DFD.theme('invalid'),'dark');});
