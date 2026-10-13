#!/usr/bin/env python3
"""Validates master structure and optional preservation of v1.1, NOT historical truth."""
from pathlib import Path
import json,sys,collections,hashlib,zipfile
M=Path(__file__).resolve().parent.parent
D=M/'data'
errors=[]
def load(name): return json.loads((D/name).read_text(encoding='utf-8'))
def check(condition,message):
 if not condition: errors.append(message)
books=load('canon_books.json'); chapters=load('chapter_master_index.json'); units=load('literary_units.json')
phases=load('phase_manifest.json'); pars=load('parallel_groups.json'); arcs=load('story_arcs.json')
legacy=load('israel_campaign_reference_index.json');view=load('view_policy_by_genre.json');sources=load('source_register.json')
sample=load('release_slice_example.json');prior=load('v1_1_preservation_sha256.json')
byid={b['id']:b for b in books}; pids={p['id'] for p in phases}
check(len(books)==66 and len(byid)==66,'66 unique books')
check([b['order'] for b in books]==list(range(1,67)),'book order contiguous')
check(sum(b['chapters'] for b in books)==1189,'1189 expected chapters')
check(len(chapters)==1189 and len({c['id'] for c in chapters})==1189,'unique chapter registry')
check(len(units)==len({u['id'] for u in units}),'unique literary units')
check(len(legacy)==219 and len({x['id'] for x in legacy})==219,'219 old campaign IDs')
check([p['id'] for p in phases]==[f'S{i:02d}' for i in range(15)],'15 ordered phase ids')
check(set(b['stageId'] for b in books)==pids-{'S00','S14'},'all book-phase assignments valid')
check(len({p['id'] for p in pars})==len(pars),'parallel id uniqueness')
check(len({a['id'] for a in arcs})==len(arcs),'arc id uniqueness')
coverage=collections.defaultdict(list)
for u in units:
 check(u['bookId'] in byid,f'unit book {u["id"]}')
 if u['bookId'] not in byid:continue
 check(1<=u['chapterStart']<=u['chapterEnd']<=byid[u['bookId']]['chapters'],f'unit range {u["id"]}')
 check(u['draftStatus']!='publishable' and not u['bibleTextEmbedded'],f'macro unit must not claim published text {u["id"]}')
 for ch in range(u['chapterStart'],u['chapterEnd']+1):coverage[(u['bookId'],ch)].append(u['id'])
chapterkeys=set()
for c in chapters:
 key=(c['bookId'],c['chapter']);chapterkeys.add(key)
 check(key in coverage and coverage[key]==[c['literaryUnitId']],f'chapter exactly 1 macro unit {key}')
 check(c['chapterContentStatus']=='not_authored' and c['historyReview']=='not_reviewed',f'no false editorial approvals {key}')
 check(c['stageId']==byid[c['bookId']]['stageId'],f'stage mismatch {key}')
 check(c['readingMode'] in view,f'reading mode mismatch {key}')
expected={(b['id'],ch) for b in books for ch in range(1,b['chapters']+1)}
check(chapterkeys==expected,'chapter coverage exactly canonical registry')
check(set(coverage)==expected,'macro unit complete coverage')
legacyids={e['id'] for e in legacy}
for e in legacy:
 for ref in e['scriptureRefs']:
  check(ref['bookId'] in byid and 1<=ref['chapterStart']<=ref['chapterEnd']<=byid[ref['bookId']]['chapters'],f'legacy ref invalid {e["id"]}')
for c in chapters:
 for eventid in c['campaignIsraelEventIds']:check(eventid in legacyids,f'legacy ID missing {c["id"]}:{eventid}')
for p in phases:
 for bid in p['bookIds']:check(bid in byid and byid[bid]['stageId']==p['id'],f'phase book {p["id"]}:{bid}')
for g in pars:
 check(g['reviewStatus'].startswith('seed_') and g['verseLevelAlignment']=='not_reviewed','parallel verification status')
 check(len(g['passages'])>=2,f'parallel group min 2 {g["id"]}')
 for ref in g['passages']:
  check(ref['bookId'] in byid and 1<=ref['chapterStart']<=ref['chapterEnd']<=byid[ref['bookId']]['chapters'],f'parallel range {g["id"]}')
for a in arcs:
 for bid in a['bookIds']:check(bid in byid,f'arc {a["id"]} book {bid}')
for s in sources:check(s['url'].startswith('https://') and s['supports'] and s['limits'] and s['assetReuse'],f'source fields {s["id"]}')
check(sample['content']['published']==False and sample['content']['reviewStatus']=='draft_only','sample must not be publishable')
for e in sample['episodes']:
 check(e['outcomeLocked'] is True and e['notForPublicRelease'] is True,'outcome lock & draft warning')
 scenes={s['id'] for s in e['scenes']}
 for s in e['scenes']:
  for ch in s['choices']:
   check(ch['next'] in scenes,'dangling scene')
   check(ch['kind'] in ('inspection','learning_focus','narrative_perspective','reflection'),'choice kind must be non-divergent')
root=M.parent
if (root/'data/books.json').exists():
 for rel,sha in prior['files'].items():
  f=root/rel
  check(f.is_file() and hashlib.sha256(f.read_bytes()).hexdigest()==sha,f'v1.1 preserved file checksum mismatch: {rel}')
# Check JSON schema valid when optional dependency is installed; otherwise static structural inspection
schema=json.loads((M/'schemas/release_slice.schema.json').read_text())
check('properties' in schema and 'episodes' in schema['properties'],'schema availability')
try:
 import jsonschema
 jsonschema.Draft202012Validator.check_schema(schema)
 jsonschema.validate(sample,schema)
 schema_info='jsonschema installed: schema + sample validated'
except ImportError: schema_info='jsonschema not installed: schema syntax only checked'
except Exception as ex:errors.append(f'jsonschema validation error: {ex}');schema_info='schema validation failed'
print(json.dumps({'status':'PASS' if not errors else 'FAIL','books':len(books),'chapters':len(chapters),'macroLiteraryUnits':len(units),'parallelGroups':len(pars),'storyArcs':len(arcs),'phases':len(phases),'legacyIsraelEpisodes':len(legacy),'sourceRegister':len(sources),'schemaCheck':schema_info,'errors':errors},ensure_ascii=False,indent=2))
sys.exit(0 if not errors else 1)
