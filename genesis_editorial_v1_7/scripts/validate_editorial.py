#!/usr/bin/env python3
from pathlib import Path
import json,collections,sys
P=Path(__file__).resolve().parents[1]/'data'
load=lambda n:json.loads((P/n).read_text(encoding='utf-8'))
C=load('chapter_commentary_50.json');E=load('episode_commentary_179.json');V=load('verse_review_matrix_1533.json');N=load('selected_verse_notes.json');H=load('history_and_hermeneutic_audit.json');S=load('evidence_sources_verified.json');R=load('editorial_progress_report.json')
er=[]
def ck(v,msg):
 if not v:er.append(msg)
ck(len(C)==50 and [x['chapter'] for x in C]==list(range(1,51)),'chapter IDs')
ck(len(E)==179 and len({x['episodeId'] for x in E})==179,'episodes')
ck(len(V)==1533 and len({x['ref'] for x in V})==1533,'verse coverage')
ck(len(N)==74 and len({x['id'] for x in N})==74,'focus notes count')
ck(len(H)==34,'audited claims')
ck(len(S)==14,'registered sources')
ck(all(x['episodeId'] in {e['episodeId'] for e in E} for x in V),'episode foreign keys')
ck(all(x['verseSpecificNoteId'] in {n['id'] for n in N} for x in V if x['verseSpecificNoteId']),'verse note links')
ck(sum(bool(x['verseSpecificNoteId']) for x in V)==74,'focused vs unreviewed distinction')
ck(all(x['chapterGuideId']==f"GEN.{x['chapter']:03}" for x in V),'chapter guide links')
ck(all(not x['releaseReady'] for x in E),'no false release approvals')
ck(all(not h['archaeologistSignoff'] and not h['biblicalScholarSignoff'] for h in H),'no forged human review')
ck(all(x['noteStatus']=='not_yet_written_independently' for x in V if not x['verseSpecificNoteId']),'unwritten verses honestly labeled')
ids={s['id'] for s in S}
ck(all(set(x['sourceIds']).issubset(ids) for x in N+H+E),'valid source IDs')
ck(all(set(x['contextSourceIds']).issubset(ids) for x in C),'chapter source IDs')
ck(R['externalSpecialistSignOffs']==0 and not R['publicationApproved'] and not R['completeVerseByVerseExegesis'],'honest status')
print(json.dumps({'status':'PASS' if not er else 'FAIL','chapters':len(C),'episodes':len(E),'versesIndexed':len(V),'individuallyAuthoredVerseNotes':len(N),'remainingIndividualVerseNotes':len(V)-len(N),'historyClaimRecords':len(H),'errors':er},ensure_ascii=False,indent=2))
sys.exit(bool(er))
