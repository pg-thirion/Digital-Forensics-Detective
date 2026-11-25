"use strict";
const DFD = (() => {
const newCases=[
  {
    "id": "07",
    "title": "The phantom invoice",
    "level": "Intermediate",
    "topic": "Business email compromise",
    "brief": "A supplier's banking details changed before payment. Trace the request and establish whether funds were transferred.",
    "date": "2026-11-02",
    "suspects": [
      "Accounts payable",
      "Supplier billing",
      "Mail administrator"
    ],
    "e": [
      [
        "Email",
        "08:04",
        "Original invoice",
        "supplier.example | INV-81 | bank=OLD-18"
      ],
      [
        "AUTH",
        "08:16",
        "Identity audit",
        "ap-clerk | normal office sign-in"
      ],
      [
        "Email",
        "08:31",
        "Change request",
        "billing@supp1ier.example | asks to replace bank reference"
      ],
      [
        "File",
        "08:35",
        "Revised invoice",
        "INV-81 | bank=NEW-91 | author=unknown"
      ],
      [
        "AUTH",
        "08:42",
        "Payment audit",
        "INV-81 | beneficiary updated to NEW-91"
      ],
      [
        "File",
        "08:45",
        "Payment register",
        "INV-81 | draft | approval pending"
      ],
      [
        "Email",
        "08:52",
        "Independent callback",
        "Known supplier phone | supplier denies change"
      ],
      [
        "Network",
        "09:01",
        "Domain review",
        "supp1ier.example is separate from supplier.example"
      ]
    ],
    "q": [
      [
        "Which request is suspicious?",
        [
          "Original invoice",
          "Lookalike domain",
          "Callback",
          "Identity audit"
        ],
        1,
        [
          3,
          8
        ]
      ],
      [
        "What is the payment status?",
        [
          "Settled",
          "Reversed",
          "Draft awaiting approval",
          "Unknown"
        ],
        2,
        [
          5,
          6
        ]
      ],
      [
        "What independently contradicts the request?",
        [
          "Supplier callback",
          "Office login",
          "Attachment author",
          "Filename"
        ],
        0,
        [
          3,
          7
        ]
      ]
    ],
    "hint": "Compare domain names and the independent callback.",
    "explain": "The lookalike domain and callback undermine the request. Payment was still a draft. The records do not prove deliberate participation by the clerk."
  },
  {
    "id": "08",
    "title": "The pocket archive",
    "level": "Intermediate",
    "topic": "Removable media",
    "brief": "A restricted archive appears on removable media. Reconstruct the device session and its limitations.",
    "date": "2026-11-05",
    "suspects": [
      "LAB-12 workstation",
      "Drive D-43",
      "Training administrator"
    ],
    "e": [
      [
        "AUTH",
        "14:01",
        "Workstation login",
        "LAB-12 | training-user | success"
      ],
      [
        "Device",
        "14:03",
        "USB connection",
        "LAB-12 | serial=D-43 | mounted"
      ],
      [
        "File",
        "14:06",
        "Read audit",
        "restricted-training.zip | bytes=5242880"
      ],
      [
        "File",
        "14:07",
        "Destination audit",
        "D-43 | restricted-training.zip | bytes=5242880"
      ],
      [
        "File",
        "14:08",
        "Integrity comparison",
        "source and destination content fingerprints match"
      ],
      [
        "Device",
        "14:10",
        "USB removal",
        "LAB-12 | D-43 removed"
      ],
      [
        "AUTH",
        "14:12",
        "Workstation lock",
        "training-user | locked"
      ],
      [
        "Network",
        "14:20",
        "Proxy summary",
        "No matching external upload recorded in window"
      ]
    ],
    "q": [
      [
        "Which destination is supported?",
        [
          "Email",
          "Removable drive D-43",
          "Cloud",
          "Printer"
        ],
        1,
        [
          2,
          4
        ]
      ],
      [
        "What supports a matching copy?",
        [
          "Login",
          "Removal",
          "Matching content fingerprint",
          "Proxy absence"
        ],
        2,
        [
          3,
          4,
          5
        ]
      ],
      [
        "What is not established?",
        [
          "Drive mounted",
          "File read",
          "Drive removed",
          "Physical operator identity"
        ],
        3,
        [
          1,
          2,
          6
        ]
      ]
    ],
    "hint": "Correlate serial numbers and fingerprints.",
    "explain": "The records support a copy to D-43, but cannot identify the person operating the machine."
  },
  {
    "id": "09",
    "title": "The missing hour",
    "level": "Advanced",
    "topic": "Clock correlation",
    "brief": "Two systems report conflicting timestamps. Use the clock audit to reconstruct the true sequence.",
    "date": "2026-11-08",
    "suspects": [
      "Gateway G-01",
      "Endpoint E-09",
      "Time service"
    ],
    "e": [
      [
        "File",
        "09:00",
        "Clock audit",
        "Gateway display clock is UTC+00:10; endpoint UTC"
      ],
      [
        "Network",
        "09:02",
        "Normalised ingest",
        "collector UTC=09:02 | gateway displayed 09:12 | inbound session"
      ],
      [
        "AUTH",
        "09:03",
        "Endpoint login",
        "E-09 | UTC 09:03 | service account success"
      ],
      [
        "File",
        "09:04",
        "Endpoint alert",
        "E-09 | UTC 09:04 | unusual read burst"
      ],
      [
        "Network",
        "09:05",
        "Normalised ingest",
        "collector UTC=09:05 | gateway displayed 09:15 | response"
      ],
      [
        "File",
        "09:06",
        "Time service",
        "E-09 offset=0 seconds"
      ],
      [
        "Network",
        "09:07",
        "Gateway policy",
        "G-01 | session closed"
      ],
      [
        "File",
        "09:20",
        "Clock repair",
        "G-01 offset corrected | raw logs preserved"
      ]
    ],
    "q": [
      [
        "When did the inbound session occur in UTC?",
        [
          "09:12",
          "09:02",
          "09:22",
          "09:00"
        ],
        1,
        [
          1,
          2
        ]
      ],
      [
        "What followed the endpoint login?",
        [
          "Inbound session",
          "Clock repair",
          "Read burst",
          "No event"
        ],
        2,
        [
          3,
          4
        ]
      ],
      [
        "What should happen to original logs?",
        [
          "Overwrite timestamps",
          "Delete after repair",
          "Preserve and document correction",
          "Treat clocks as identical"
        ],
        2,
        [
          1,
          8
        ]
      ]
    ],
    "hint": "Use the collector UTC timestamps.",
    "explain": "Subtract ten minutes from gateway display timestamps. Preserve raw logs and document the correction separately."
  },
  {
    "id": "10",
    "title": "The unattended token",
    "level": "Advanced",
    "topic": "Session investigation",
    "brief": "A service account accessed unusual records after its scheduled task ended. Determine scope and containment.",
    "date": "2026-11-12",
    "suspects": [
      "svc-report account",
      "Report scheduler",
      "API gateway"
    ],
    "e": [
      [
        "AUTH",
        "05:00",
        "Token issuance",
        "svc-report | T-18 | reports:read"
      ],
      [
        "File",
        "05:01",
        "Scheduler",
        "daily report started"
      ],
      [
        "Network",
        "05:03",
        "API audit",
        "T-18 | daily reports | 200"
      ],
      [
        "File",
        "05:04",
        "Scheduler",
        "daily report completed"
      ],
      [
        "Network",
        "05:18",
        "API audit",
        "T-18 | archive reads | 200 | unusual volume"
      ],
      [
        "Network",
        "05:19",
        "API audit",
        "T-18 | admin change | 403"
      ],
      [
        "AUTH",
        "05:21",
        "Revocation",
        "T-18 revoked"
      ],
      [
        "Network",
        "05:22",
        "API audit",
        "T-18 | archive read | 401"
      ]
    ],
    "q": [
      [
        "Which access is anomalous?",
        [
          "Daily report",
          "Archive reads after task",
          "Token issuance",
          "Revocation"
        ],
        1,
        [
          4,
          5
        ]
      ],
      [
        "Did the admin change succeed?",
        [
          "Yes",
          "Unknown",
          "No, forbidden",
          "Yes, token exists"
        ],
        2,
        [
          5,
          6
        ]
      ],
      [
        "Which containment is supported?",
        [
          "Revoke T-18",
          "Delete archive",
          "Disable all accounts",
          "Reset clock"
        ],
        0,
        [
          7,
          8
        ]
      ]
    ],
    "hint": "Distinguish successful reads from denied writes.",
    "explain": "The token made unusual successful reads. The attempted write was denied and revocation was followed by an unauthorised response. The means of obtaining the token remain unknown."
  }
];

const checklist = ["Confirm scope and authority","Preserve original evidence","Record timestamps and clock differences","Corroborate independently","Document uncertainty and limitations"];
const glossary = [["Artefact","A record left by activity."],["Chain of custody","Documented handling of evidence."],["Hash","A digest for comparing data integrity."],["Metadata","Information describing a file or record."],["Clock skew","Difference between a device clock and a reference clock."],["Attribution","Linking activity to an account or device, not necessarily a person."],["Volatile evidence","Information potentially lost at shutdown."],["Corroboration","Independent support for a finding."]];
const classifications = ["Relevant","Uncertain","Irrelevant"];
const validDate = v => typeof v === "string" && v.length <= 30 && Number.isFinite(Date.parse(v));
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eid = n => "E"+String(n).padStart(2,"0");
const fresh = () => ({bookmarks:[],labels:{},annotations:{},timeline:[],custody:[],checklist:[],confidence:{},hypothesis:"",started:null,closed:null,attempts:[]});
function normalise(s,raw,c){
  const ids=v=>Array.isArray(v)?[...new Set(v.filter(n=>s.seen.includes(n)))]:[];
  s.bookmarks=ids(raw.bookmarks);s.timeline=ids(raw.timeline);
  for(const n of s.seen){
    if(classifications.includes(raw.labels?.[n]))s.labels[n]=raw.labels[n];
    if(typeof raw.annotations?.[n]==="string")s.annotations[n]=raw.annotations[n].slice(0,1000);
  }
  s.custody=Array.isArray(raw.custody)?raw.custody.filter(x=>x&&s.seen.includes(x.id)&&["Inspected","Bookmarked","Unbookmarked","Classified","Annotated"].includes(x.action)&&validDate(x.at)).slice(-500).map(x=>({id:x.id,action:x.action,at:x.at})):[];
  s.checklist=Array.isArray(raw.checklist)?[...new Set(raw.checklist.filter(n=>Number.isInteger(n)&&n>=0&&n<checklist.length))]:[];
  c.q.forEach((q,i)=>{if([1,2,3].includes(raw.confidence?.[i]))s.confidence[i]=raw.confidence[i]});
  s.hypothesis=typeof raw.hypothesis==="string"?raw.hypothesis.slice(0,3000):"";
  s.started=validDate(raw.started)?raw.started:null;s.closed=validDate(raw.closed)?raw.closed:null;
  s.attempts=Array.isArray(raw.attempts)?raw.attempts.filter(x=>x&&Number.isInteger(x.score)&&x.score>=0&&x.score<=100&&validDate(x.at)).slice(-30).map(x=>({score:x.score,at:x.at})):[];
}
function log(s,id,action,at=new Date().toISOString()){s.custody.push({id,action,at});s.custody=s.custody.slice(-500)}
const toggle=(arr,n)=>arr.includes(n)?arr.filter(x=>x!==n):[...arr,n];
function compareToggle(arr,n){return arr.includes(n)?arr.filter(x=>x!==n):[...arr.slice(-1),n]}
function move(arr,n,d){const out=[...arr],i=out.indexOf(n),j=i+d;if(i>=0&&j>=0&&j<out.length)[out[i],out[j]]=[out[j],out[i]];return out}
function chronological(c,arr){return arr.length>=2&&arr.every((n,i)=>i===0||c.e[arr[i-1]-1][1]<=c.e[n-1][1])}
function matches(s,n,f){return f==="All"||(f==="Inspected"&&s.seen.includes(n))||(f==="Uninspected"&&!s.seen.includes(n))||(f==="Bookmarked"&&s.bookmarks.includes(n))||s.labels[n]===f}
function visible(c,s,tab,search,filter,sort){
  let rows=c.e.map((e,i)=>({e,id:i+1})).filter(x=>(tab==="All"||tab==="Timeline"||tab===x.e[0])&&matches(s,x.id,filter)&&(!search||(s.seen.includes(x.id)?x.e.join(" "):x.e.slice(0,3).join(" ")).toLowerCase().includes(search.toLowerCase())));
  return sort==="newest"?rows.reverse():rows;
}
function elapsed(s,now=Date.now()){if(!s.started)return "Not timed";let end=s.closed?Date.parse(s.closed):now;return Math.max(0,Math.floor((end-Date.parse(s.started))/60000))+" min elapsed"}
function artifact(s,n,compare){
  return '<div class="bar tools"><button data-bookmark="'+n+'" aria-pressed="'+s.bookmarks.includes(n)+'">'+(s.bookmarks.includes(n)?'Bookmarked':'Bookmark')+'</button><button data-compare="'+n+'" aria-pressed="'+compare.includes(n)+'">Compare</button><button data-timeline="'+n+'" aria-pressed="'+s.timeline.includes(n)+'">Timeline</button><select data-label="'+n+'" aria-label="Classify '+eid(n)+'"><option value="">Unclassified</option>'+classifications.map(x=>'<option '+(s.labels[n]===x?'selected':'')+'>'+x+'</option>').join("")+'</select></div><label class="compact">Evidence note <input data-annotation="'+n+'" maxlength="1000" value="'+esc(s.annotations[n]||"")+'" placeholder="Observation or limitation"></label>';
}
function lab(c,s,compare){
  return '<h2>Investigation tools</h2><div class="bar"><span class="tag">'+s.bookmarks.length+' bookmarks</span><span class="tag">'+elapsed(s)+'</span><span class="tag">'+s.attempts.length+' attempts</span></div><details open><summary>Compare evidence ('+compare.length+'/2)</summary><div class="comparegrid">'+(compare.length?compare.map(n=>'<article class="artifact"><h3>'+eid(n)+' · '+esc(c.e[n-1][2])+'</h3><small>'+esc(c.e[n-1][1])+' UTC</small><pre>'+esc(c.e[n-1][3])+'</pre></article>').join(""):'<p class="muted">Select Compare on two inspected records.</p>')+'</div></details><details open><summary>Reconstruct timeline ('+s.timeline.length+')</summary><p class="muted">Add records using Timeline and arrange chronologically.</p>'+s.timeline.map((n,i)=>'<div class="bar timeline-row"><span>'+eid(n)+' · '+esc(c.e[n-1][1])+' · '+esc(c.e[n-1][2])+'</span><button data-move="'+n+':-1" aria-label="Move '+eid(n)+' earlier" '+(i===0?'disabled':'')+'>↑</button><button data-move="'+n+':1" aria-label="Move '+eid(n)+' later" '+(i===s.timeline.length-1?'disabled':'')+'>↓</button></div>').join("")+'<p class="muted">'+(s.timeline.length<2?'Add at least two records.':chronological(c,s.timeline)?'Chronological order verified.':'Review the sequence.')+'</p></details><details><summary>Chain of custody ('+s.custody.length+')</summary><p class="muted">Illustrative local activity log, not tamper-proof.</p>'+s.custody.slice().reverse().slice(0,30).map(x=>'<div class="logrow">'+eid(x.id)+' · '+esc(x.action)+' <small>'+esc(x.at)+'</small></div>').join("")+'</details><details><summary>Investigation checklist ('+s.checklist.length+'/5)</summary>'+checklist.map((x,i)=>'<label class="choice"><input type="checkbox" data-check="'+i+'" '+(s.checklist.includes(i)?'checked':'')+'>'+esc(x)+'</label>').join("")+'</details><details><summary>Working hypothesis</summary><textarea id="hypothesis" maxlength="3000" aria-label="Working hypothesis">'+esc(s.hypothesis)+'</textarea></details><details><summary>Attempt history</summary>'+(s.attempts.length?s.attempts.slice().reverse().map(x=>'<div class="logrow">'+x.score+'% <small>'+esc(x.at)+'</small></div>').join(""):'<p class="muted">No completed attempts.</p>')+'</details>';
}
function readiness(c,s){return '<div class="bar"><span class="tag">'+c.q.filter((q,i)=>s.answers[i]!==undefined).length+'/'+c.q.length+' answered</span><span class="tag">'+c.q.filter((q,i)=>(s.links[i]||[]).length>0).length+'/'+c.q.length+' with citations</span></div><div class="bar confidence">'+c.q.map((q,i)=>'<label class="compact">Q'+(i+1)+' confidence <select data-confidence="'+i+'" aria-label="Confidence for question '+(i+1)+'" '+(s.result?'disabled':'')+'><option value="0">Not rated</option>'+[1,2,3].map(n=>'<option value="'+n+'" '+(s.confidence[i]===n?'selected':'')+'>'+["","Low","Medium","High"][n]+'</option>').join("")+'</select></label>').join("")+'</div>'}
function csvCell(v){let x=String(v??"");if(/^\s*[=+\-@]/.test(x)||/^[\t\r\n]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"'}
function csv(c,s){return [["ID","Date UTC","Time UTC","Type","Title","Record","Classification","Annotation"],...s.seen.slice().sort((x,y)=>x-y).map(n=>[eid(n),c.date,c.e[n-1][1],c.e[n-1][0],c.e[n-1][2],c.e[n-1][3],s.labels[n],s.annotations[n]])].map(row=>row.map(csvCell).join(",")).join("\r\n")}
function report(c,s){return ["DIGITAL FORENSICS DETECTIVE | FICTIONAL TRAINING REPORT",c.title,"Score: "+(s.result?s.result.score+"%":"Not submitted"),"Hypothesis: "+s.hypothesis,"Notes: "+s.notes,"Evidence:",...s.seen.map(n=>eid(n)+" | "+c.date+" "+c.e[n-1][1]+" UTC | "+c.e[n-1][3]+" | "+(s.annotations[n]||"")),"Findings:",...c.q.map((q,i)=>q[0]+" | "+(q[1][s.answers[i]]||"Unanswered")+" | "+(s.links[i]||[]).map(eid).join(", ")+" | Confidence: "+(s.confidence[i]||"Not rated")),"Checklist: "+s.checklist.length+"/5","Limitations: synthetic evidence and local activity records."].join("\n")}
const status=s=>s.result?"Closed":s.started||s.seen.length||s.notes?"In progress":"New";
function filterCases(cases,state,level="All",phase="All",query="",sort="number"){
  let list=cases.filter(c=>(level==="All"||level===c.level)&&(phase==="All"||status(state(c))===phase)&&(!query||(c.title+" "+c.topic+" "+c.brief).toLowerCase().includes(query.toLowerCase())));
  if(sort==="title")list.sort((x,y)=>x.title.localeCompare(y.title));
  if(sort==="difficulty")list.sort((x,y)=>["Beginner","Intermediate","Advanced"].indexOf(x.level)-["Beginner","Intermediate","Advanced"].indexOf(y.level));
  if(sort==="score")list.sort((x,y)=>(state(y).result?.score??-1)-(state(x).result?.score??-1));return list;
}
function stats(cases,state){let all=cases.map(state),closed=all.filter(s=>s.result);return {seen:all.reduce((n,s)=>n+s.seen.length,0),total:cases.reduce((n,c)=>n+c.e.length,0),average:closed.length?Math.round(closed.reduce((n,s)=>n+s.result.score,0)/closed.length):0,closed:closed.length}}
function badges(cases,state){let all=cases.map(state),closed=all.filter(s=>s.result),seen=all.reduce((n,s)=>n+s.seen.length,0);return [["First findings",closed.length>0],["Evidence collector",seen>=24],["Perfect case",closed.some(s=>s.result.score===100)],["Advanced examiner",cases.some(c=>c.level==="Advanced"&&state(c).result?.score>=80)],["Case master",closed.length===cases.length]]}
const backup=save=>({format:"dfd-progress",version:1,cases:save});
function restore(raw,cases,normalise){if(!raw||raw.format!=="dfd-progress"||raw.version!==1||!raw.cases||typeof raw.cases!=="object"||Array.isArray(raw.cases))throw Error("Unsupported progress file.");const out=Object.create(null);for(const c of cases)out[c.id]=normalise(c,raw.cases[c.id]);return out}
function dashboard(cases,state){let s=stats(cases,state);return '<section class="panel dashboard"><h2>Examiner profile</h2><div class="bar"><span class="tag">'+s.seen+'/'+s.total+' evidence inspected</span><span class="tag">Average score: '+s.average+'%</span></div><div class="bar trophies">'+badges(cases,state).map(([name,earned])=>'<span class="tag '+(earned?'good':'')+'">'+(earned?'Earned: ':'Locked: ')+esc(name)+'</span>').join("")+'</div><details><summary>Forensics glossary</summary>'+glossary.map(([term,def])=>'<p><strong>'+esc(term)+'</strong> · '+esc(def)+'</p>').join("")+'</details><div class="bar"><button id="backup">Export all progress</button><label class="compact">Import progress <input id="restore" type="file" accept=".json,application/json"></label></div><p id="restoreStatus" aria-live="polite" class="muted"></p></section>'}
function queueControls(){return '<div class="bar"><input id="caseSearch" type="search" aria-label="Search cases" placeholder="Search case files"><select id="caseLevel" aria-label="Filter difficulty"><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select><select id="caseStatus" aria-label="Filter case status"><option>All</option><option>New</option><option>In progress</option><option>Closed</option></select><select id="caseSort" aria-label="Sort cases"><option value="number">Case number</option><option value="title">Title</option><option value="difficulty">Difficulty</option><option value="score">Score</option></select><button id="clearCases">Clear filters</button></div><p class="muted" id="caseCount"></p>'}
const theme=v=>v==="light"?"light":"dark";
return {newCases,fresh,normalise,log,toggle,compareToggle,move,chronological,matches,visible,elapsed,artifact,lab,readiness,csvCell,csv,report,status,filterCases,stats,badges,backup,restore,dashboard,queueControls,theme};
})();
