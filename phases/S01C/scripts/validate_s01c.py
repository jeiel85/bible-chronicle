#!/usr/bin/env python3
import json,pathlib,collections,sys
P=pathlib.Path(__file__).resolve().parents[1];ROOT=P.parents[1]
load=lambda n:json.loads((P/'data'/n).read_text(encoding='utf8'))
errs=[]
def ck(x,msg):
 if not x:errs.append(msg)
E=load('episode_index.json');SC=load('scenes.json');CV=load('verse_coverage.json');CH=load('chapters.json');AR=load('assets_manifest.json');LE=load('lessons.json');CL=load('claims.json');GE=load('geography.json');SRC=load('source_register.json');CHR=load('characters.json');PLC=load('place_catalog.json');HS=load('handoffs.json');RL=load('release_slice_v1_2.json');IX=load('intertext_links.json')
MAX={26:35,27:46,28:22,29:35,30:43,31:55,32:32,33:20,34:31,35:29,36:43}
ids=[e['id'] for e in E];expected_ids=[f'ep-gen-{i:03d}' for i in range(64,116)];ck(ids==expected_ids,'stable 52 ids')
ck(len(E)==len(SC)==len(AR)==len(LE)==len(CL)==len(GE)==52,'episode-matched arrays')
ck(len(CV)==391 and sum(MAX.values())==391,'391 verses')
ck(len(CH)==11,'11 chapters')
expected={(f'GEN.{ch:03d}',v) for ch,maximum in MAX.items() for v in range(1,maximum+1)}
counts=collections.Counter((x['chapterId'],x['verse']) for x in CV)
ck(set(counts)==expected and all(t==1 for t in counts.values()),'missing/duplicate verse')
chars={x['id'] for x in CHR};places={x['id'] for x in PLC};sources={x['id'] for x in SRC};claims={x['id'] for x in CL}
ck(len(chars)==len(CHR) and len(places)==len(PLC) and len(sources)==len(SRC),'unique catalogs')
for x in CH:
 ch=int(x['chapterId'].split('.')[1]);ck(x['verses']==MAX.get(ch),'wrong max '+x['chapterId'])
 ck(set(x['episodeIds'])=={v['episodeId'] for v in CV if v['chapterId']==x['chapterId']},'chapter associations')
for a in (SC,AR,LE,CL,GE):
 ck({x['episodeId'] for x in a}==set(ids),'entity episode linkage')
for i,e in enumerate(E):
 eid=e['id'];p=e['passage'];start=p['start'];end=p['end'];m=[x['verse'] for x in CV if x['episodeId']==eid]
 ck(start['chapter']==end['chapter'],'single chapter episode '+eid)
 ck(set(m)==set(range(start['verse'],end['verse']+1)) and len(m)==len(set(m)),'contiguous verses '+eid)
 ck(e['canonicalNextId']==(ids[i+1] if i<51 else 'handoff-gen-037'),'immutable next '+eid)
 ck(e['canonicalOutcomeLocked'] and e['canonicalOutcomeId']==f'canon-gen-{64+i:03d}','immutable canon '+eid)
 ck(not e['releaseReady'] and e['absoluteYearBce'] is None and e['historicalStatus']=='biblical_narrative_unverified_externally','historical/approval claim '+eid)
 ck(set(e['castIds'])<=chars and set(e['placeIds'])<=places,'orphan place/character '+eid)
 ck(set(e['claimIds'])<=claims,'orphan claim '+eid)
 sc=SC[i]['scenes'];sids={s['id'] for s in sc};ck(len(sc)==6 and len(sids)==6,'6 scenes '+eid)
 open_scene=next((s for s in sc if s['sceneType']=='canonical_intro'),None);finish=next((s for s in sc if s['sceneType']=='locked_canonical_outcome'),None)
 ck(bool(open_scene and finish),'scene types '+eid)
 if open_scene and finish:
  ck(len(open_scene['choices'])==4,'4 choices '+eid)
  ck(finish['autoNext']==e['canonicalNextId'] and finish['id']==eid+'/locked-outcome','finish locked '+eid)
  ck({x['id'] for x in open_scene['choices']}=={eid+'/choice-'+key for key in ['lens','evidence','atlas','reflection']},'choice IDs '+eid)
 for s in sc:
  for c in s['choices']:
   ck(c['next'] in sids and c['kind'] in ('inspection','learning_focus','narrative_perspective','reflection'),'choice invalid '+eid)
   ck(c['effect']['type'] in ('set_perspective','reveal_card','open_panel'),'illegal canonical mutation '+eid)
  if s['sceneType'] not in ('canonical_intro','locked_canonical_outcome'):
   ck(s['autoNext']==eid+'/locked-outcome' and not s['choices'],'not rejoining canon '+eid)
 if 34==start['chapter']:ck(e['sensitivity'] and e['review']['sensitiveContent']=='needs_child_safety_and_trauma_review','Dinah safety '+eid)
 gm=GE[i]; ck(gm['coordinatePin'] is None and gm['boundaryPolygon'] is None and gm['absoluteBce'] is None,'invented coordinate/chronology '+eid)
 art=AR[i];ck(art['imageFile'] is None and art['originalAssetProduced'] is False and art['rightsStatus']=='not_cleared','art license false '+eid)
 lesson=LE[i];ck(sum(x['isCorrect'] for x in lesson['answers'])==1 and lesson['reviewStatus']=='draft_not_educator_approved','lesson ready false '+eid)
 claim=CL[i];ck(claim['published'] is False and claim['externalHistoricalEvidence']=='not_established' and set(claim['sourceIds'])<=sources,'claim release or source '+eid)
ck(HS[0]['aliasId']=='handoff-gen-026' and HS[0]['resolvesTo']=='ep-gen-064' and HS[-1]['resolvesTo'] is None,'handoff link')
ck(RL['schemaVersion']=='1.2.0' and RL['content']=={'reviewStatus':'draft_only','published':False,'historicalClaimsVerified':False,'licensedTextEmbedded':False} and len(RL['episodes'])==52,'release draft guard')
try:
 import jsonschema
 jsonschema.validate(RL,json.loads((ROOT/'master/schemas/release_slice.schema.json').read_text(encoding='utf8')));schema='PASS'
except ImportError:schema='SKIPPED: jsonschema not installed'
except Exception as ex:errs.append('schema error '+str(ex));schema='FAIL'
res={'result':'PASS' if not errs else 'FAIL','chapters':len(CH),'episodes':len(E),'verses':len(CV),'sceneNodes':sum(len(s['scenes']) for s in SC),'choices':sum(len(x['choices']) for s in SC for x in s['scenes']),'lessonDrafts':len(LE),'artBriefs':len(AR),'externalHistoricalEpisodeApprovals':0,'published':False,'schema':schema,'errors':errs}
print(json.dumps(res,ensure_ascii=False,indent=2));sys.exit(1 if errs else 0)
