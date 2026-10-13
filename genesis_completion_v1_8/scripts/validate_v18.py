#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,zipfile,collections,sys
ROOT=Path(__file__).resolve().parents[2]
N=ROOT/'genesis_completion_v1_8'/'data'
def read(n):return json.loads((N/n).read_text(encoding='utf8'))
def check(ok,msg):
 if not ok:raise AssertionError(msg)
 return True
cards=read('verse_study_cards_1533.json')
chap=read('chapter_teaching_guides_50.json')
eps=read('episode_release_profiles_179.json')
queue=read('remaining_verse_annotation_queue_1459.json')
claims=read('scoped_claims_31.json')
sources=read('public_source_register_20261013.json')
progress=read('accurate_progress.json')
rights=read('rights_and_distribution_gate.json')
oldroot=ROOT/'genesis_editorial_v1_7'/'data'
old_matrix=json.loads((oldroot/'verse_review_matrix_1533.json').read_text(encoding='utf8'))
old_selected=json.loads((oldroot/'selected_verse_notes.json').read_text(encoding='utf8'))
old_chap=json.loads((oldroot/'chapter_commentary_50.json').read_text(encoding='utf8'))
old_eps=json.loads((oldroot/'episode_commentary_179.json').read_text(encoding='utf8'))
check(len(cards)==1533 and len({r['ref'] for r in cards})==1533,'card coverage')
check(len(chap)==len(old_chap)==50,'chapter count')
check(len(eps)==len(old_eps)==179,'episode count')
check(len(queue)==1459,'open notes count')
check(len(claims)==31,'case files count')
check(len(sources)==12,'source count')
check(all(s['url'].startswith('https://') for s in sources),'source urls')
check({x['ref'] for x in old_matrix}=={x['ref'] for x in cards},'reference set')
check({x['episodeId'] for x in old_eps}=={x['episodeId'] for x in eps},'episode ids')
check(sum(bool(x['focusedNoteId']) for x in cards)==len(old_selected)==74,'focused note count')
check(sum(x['actualVerseExegesisStatus']=='not_written' for x in cards)==1459,'non-completed annotations')
check(all(not x['releaseApproved'] for x in cards),'gate forbidden early approval')
check(all(not x['readyToPublish'] and x['lockedOutcome'] for x in eps),'episode outcomes and gate')
check(all(not x['published'] for x in claims),'no unsupported publication')
check(not rights['NKRV']['verifiedUseGrant'] and not rights['museumImages']['bundledImage'],'license honesty')
check(progress['externalScholarSignoffs']==0,'expert clearance')
check((ROOT/'genesis_completion_v1_8/demo/Genesis_Content_Viewer.html').exists(),'HTML preview')
# Original 217 v1.7 SHA256 hashes verified against additive migration manifest.
oldmanifest=json.loads((ROOT/'genesis_completion_v1_8/data/v17_preservation_sha256.json').read_text())
for rel, expected in oldmanifest['files'].items():
 fp=ROOT/rel
 check(fp.is_file(),f'v1.7 missing {rel}')
 check(hashlib.sha256(fp.read_bytes()).hexdigest()==expected,f'v1.7 changed: {rel}')
print(json.dumps({'status':'PASS_structural_and_invariance_only','chapters':50,'episodes':179,'verseCards':1533,'focusedVerseDrafts':74,'remainingStandaloneExegesis':1459,'newCaseFiles':31,'existingFilesUnchanged':len(oldmanifest['files']),'expertApprovals':0},ensure_ascii=False,indent=2))
