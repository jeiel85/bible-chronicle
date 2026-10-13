#!/usr/bin/env python3
"""v1.9 data checks only — not a textual-criticism or historical certification."""
import json,sys,hashlib
from pathlib import Path
from collections import Counter
base=Path(__file__).resolve().parents[2];p=base/'genesis_verse_annotation_v1_9'
read=lambda a:json.loads(a.read_text(encoding='utf-8'))
notes=read(p/'data/verse_commentary_1533.json');legacy=read(base/'genesis_editorial_v1_7/data/verse_review_matrix_1533.json');selected=read(base/'genesis_editorial_v1_7/data/selected_verse_notes.json')
hashes=read(p/'data/prior_file_sha256.json');stats=read(p/'data/status.json')
assert len(notes)==len(legacy)==1533
assert len({n['ref'] for n in notes})==1533
assert len({n['explanationKo'] for n in notes})>=1500
assert len(selected)==74 and len(hashes['files'])==237
m={v['ref']:v for v in legacy}; focus={(x['chapter'],x['verse']):x for x in selected}
for note in notes:
 ref=note['ref'];ch=note['chapter'];v=note['verse']
 assert ref==f'GEN.{ch}.{v}' and note['episodeId']==m[ref]['episodeId']
 assert len(note['explanationKo'])>=19 and note['editorialStage']=='first_pass_draft_complete'
 assert note['independentlyPeerReviewed']==False and note['publishedApproval']==False
 assert note['verseTextIncluded']==False and note['scriptureSource']['url']==f'https://ebible.org/engwebp/GEN{ch}.htm'
 f=focus.get((ch,v));assert note['priorFocusedNoteId']==(f['id'] if f else None)
 assert note['priorFocusedExplanationKo']==(f['explanationKo'] if f else None)
for ch in range(1,51):
 seq=[n['verse'] for n in notes if n['chapter']==ch]
 assert seq==list(range(1,len(seq)+1))
 assert (p/f'chapters/GEN_{ch:02d}.md').exists()
for filename,digest in hashes['files'].items():
 path=base.parent/filename
 assert path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest()==digest,filename
assert stats['verseSpecificIndependentFirstPassDraftCount']==1533
assert stats['externalExpertSignoffRequiredToIterate']==False
assert stats['readyToClaimScholarlyValidation']==False
print('PASS v1.9:',len(notes),'independent verse-specific Korean drafts; 50 chapters, 237 prior files preserved, 74 selected notes preserved')
