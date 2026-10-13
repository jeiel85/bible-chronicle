#!/usr/bin/env python3
import json,sys,collections,pathlib
P=pathlib.Path(__file__).resolve().parents[1]; ROOT=P.parents[1]; errors=[]
load=lambda f:json.loads((P/'data'/f).read_text(encoding='utf-8'))
chk=lambda cond,msg: errors.append(msg) if not cond else None
e=load('episode_index.json'); scenes=load('scenes.json'); vers=load('verse_coverage.json'); arts=load('assets_manifest.json'); lessons=load('lessons.json'); maps=load('geography.json'); chapters=load('chapters.json'); claims=load('claims.json'); sources=load('source_register.json'); chars=load('characters.json'); places=load('place_catalog.json'); handoffs=load('handoffs.json'); links=load('intertext_links.json'); rl=load('release_slice_v1_2.json')
MAX={12:20,13:18,14:24,15:21,16:16,17:27,18:33,19:38,20:18,21:34,22:24,23:20,24:67,25:34}
ids=[z['id'] for z in e]; chk(ids==[f'ep-gen-{i:03d}' for i in range(23,64)],'41 stable episode IDs')
chk(len(set(ids))==41,'unique episode ids')
chk(len(e)==len(scenes)==len(arts)==len(lessons)==len(maps)==len(claims)==41,'41 matching records')
chk(len(chapters)==14,'14 chapters')
chk(len(vers)==sum(MAX.values())==394,'394 indexed verses')
cs={x['id'] for x in chars};ps={x['id'] for x in places};src={x['id'] for x in sources};claimids={x['id'] for x in claims}
chk(len(cs)==len(chars) and len(ps)==len(places),'unique entity catalog IDs')
chk(len(src)==len(sources),'unique sources')
for c in claims: chk(set(c['sourceIds'])<=src and c['published'] is False and c['externalHistoricalEvidence']=='not_established','claim evidence/approval invalid '+c['id'])
for k in ('scenes','geography','assets_manifest','lessons','claims'):
 arr=load(k+'.json'); key='episodeId'; chk({x[key] for x in arr}==set(ids),'orphan or missing '+k)
for index,z in enumerate(e):
 id=z['id'];chk(z['canonicalOutcomeLocked'] and not z['releaseReady'],'unlocked or approved '+id)
 chk(z['canonicalNextId']==(ids[index+1] if index<40 else 'handoff-gen-026'),'canonicalNext changed '+id)
 chk(set(z['castIds'])<=cs and set(z['placeIds'])<=ps,'orphan actor/place '+id)
 chk(set(z['claimIds'])<=claimids,'missing claim '+id)
 chk(z['absoluteYearBce'] is None and z['historicalStatus']=='biblical_narrative_unverified_externally','invented date/evidence '+id)
 chk(z['review']['rights']=='not_cleared' and z['review']['historical']=='needs_human_review','false approval '+id)
 chk(z['illustrationId'] in {a['id'] for a in arts},'no art '+id)
 graph=next(g for g in scenes if g['episodeId']==id)
 ss=graph['scenes']; sid={x['id'] for x in ss}; chk(len(ss)==len(sid)==6 and graph['entrySceneId'] in sid,'6 scenes graph '+id)
 outcome=[x for x in ss if x['sceneType']=='locked_canonical_outcome'];chk(len(outcome)==1 and outcome[0]['autoNext']==z['canonicalNextId'],'fixed outcome '+id)
 opening=next(x for x in ss if x['sceneType']=='canonical_intro');chk(len(opening['choices'])==4,'4 choices '+id)
 lens=next(x for x in ss if x['sceneType']=='perspective_lens');opts=lens.get('perspectiveOptions',[])
 chk(len(opts)==3 and {x['id'] for x in opts}==set(z['allowedPerspectives']),'3 selectable perspectives '+id)
 chk(all(x['effect']['type']=='set_perspective' and x['effect']['value']==x['id'] for x in opts),'perspective cannot change canon '+id)
 for scene in ss:
  for c in scene['choices']:
   chk(c['next'] in sid,'dangling '+id)
   chk(c['kind'] in ('inspection','learning_focus','narrative_perspective','reflection'),'invalid kind '+id)
   chk(c['effect']['type'] in ('set_perspective','reveal_card','open_panel'),'mutation effect '+id)
  if scene['sceneType'] not in ('canonical_intro','locked_canonical_outcome'):
   chk(scene['autoNext']==outcome[0]['id'] and not scene['choices'],'nonconverging '+id)
 for prop in ('coordinatePin','boundaryPolygon','absoluteBce'):
  gm=next(x for x in maps if x['episodeId']==id);chk(gm[prop] is None,'unapproved map data '+id)
 ar=next(x for x in arts if x['episodeId']==id);chk(ar['imageFile'] is None and not ar['originalAssetProduced'] and ar['rightsStatus']=='not_cleared','art inflation '+id)
 ls=next(x for x in lessons if x['episodeId']==id);chk(ls['reviewStatus']=='draft_not_educator_approved' and sum(a['isCorrect'] for a in ls['answers'])==1,'invalid lesson '+id)
# exhaustive one-to-one chapter/verse coverage, each continuous within one chapter
count=collections.Counter((x['chapterId'],x['verse']) for x in vers)
expected={(f'GEN.{ch:03d}',v) for ch,maximum in MAX.items() for v in range(1,maximum+1)}
chk(set(count)==expected and all(t==1 for t in count.values()),'verse omission/duplication')
chk(set(x['chapterId'] for x in chapters)=={f'GEN.{c:03d}' for c in MAX},'chapter IDs')
for ch in chapters:
 n=int(ch['chapterId'].split('.')[1]);chk(ch['verses']==MAX[n],'wrong chapter verse count')
 chk(set(ch['episodeIds'])=={x['episodeId'] for x in vers if x['chapterId']==ch['chapterId']},'chapter coverage mismatch')
for ep in e:
 mapped=[(int(x['chapterId'].split('.')[1]),x['verse']) for x in vers if x['episodeId']==ep['id']]
 a=ep['passage']['start'];b=ep['passage']['end'];chk(len(mapped)==b['verse']-a['verse']+1 and min(mapped)==(a['chapter'],a['verse']) and max(mapped)==(b['chapter'],b['verse']),'episode non-contiguous '+ep['id'])
chk(handoffs[0]['aliasId']=='handoff-gen-012' and handoffs[0]['resolvesTo']==ids[0],'legacy handoff mismatch')
chk(handoffs[-1]['aliasId']=='handoff-gen-026' and handoffs[-1]['resolvesTo'] is None,'future handoff erroneously enabled')
chk(all(x['to'] in set(ids)|{'handoff-gen-026'} for x in links),'intertext links dangling')
chk(all(x['from'] in set(ids)|{'GEN.11.31-GEN.11.32'} for x in links),'intertext source dangling')
chk(rl['content']=={'reviewStatus':'draft_only','published':False,'historicalClaimsVerified':False,'licensedTextEmbedded':False} and len(rl['episodes'])==41,'release readiness falsified')
try:
 import jsonschema
 schema=json.loads((ROOT/'master/schemas/release_slice.schema.json').read_text(encoding='utf-8'))
 jsonschema.validate(rl,schema);schema_info='jsonschema pass'
except ImportError:schema_info='jsonschema not installed, structural checks only'
except Exception as ex:errors.append('schema violation: '+str(ex));schema_info='schema error'
res={'status':'PASS' if not errors else 'FAIL','episodes':len(e),'verses':len(vers),'chapters':len(chapters),'scenes':sum(len(g['scenes']) for g in scenes),'choices':sum(len(s['choices']) for g in scenes for s in g['scenes']),'assets':len(arts),'lessons':len(lessons),'claims':len(claims),'historicalPublishApprovals':0,'schema':schema_info,'errors':errors}
print(json.dumps(res,ensure_ascii=False,indent=2));sys.exit(0 if not errors else 1)
