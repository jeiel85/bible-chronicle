#!/usr/bin/env python3
"""Structural integrity checks, NOT historical or theological verification."""
from __future__ import annotations
import json
import sys
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
load=lambda path: json.loads((ROOT/path).read_text(encoding='utf-8'))
errors=[]
def check(test, message):
    if not test: errors.append(message)

books=load('data/books.json')
chapters=load('data/chapter_index.json')
claims=load('data/historical_claims.json')
events=load('data/events.sample.json')
schema=load('schemas/event.schema.json')
geo=load('data/places.sample.geojson')
check(len(books)==66, 'Must contain 66 books')
check([b['order'] for b in books]==list(range(1,67)), 'Canonical book order must be 1..66')
check(sum(b['chapters'] for b in books)==1189, 'Canonical chapter sum must be 1189')
check(sum(b['testament']=='OT' for b in books)==39, 'OT book count must be 39')
check(sum(b['testament']=='NT' for b in books)==27, 'NT book count must be 27')
check(len(chapters)==1189, 'Chapter manifest count must be 1189')
check(len({b['id'] for b in books})==len(books),'Duplicate book IDs')
check(len({c['id'] for c in chapters})==len(chapters),'Duplicate chapter IDs')
book_map={b['id']:b for b in books}
chapter_set={(c['bookId'],c['chapter']) for c in chapters}
for book in books:
    for ch in range(1, book['chapters']+1):
        check((book['id'],ch) in chapter_set, f'Missing chapter {book["id"]}.{ch}')
for c in chapters:
    book=book_map.get(c['bookId'])
    check(book is not None and 1 <= c['chapter'] <= book['chapters'], f'Chapter out of bounds {c["id"]}')
    check(c['content_status'] in {'not_authored','draft','in_review','published'},f'Invalid chapter status: {c["id"]}')

claim_map={c['claimId']:c for c in claims}
check(len(claim_map)==len(claims),'Duplicate historical claim IDs')
source_map={s['id']:s for c in claims for s in c.get('sources',[])}
for claim in claims:
    check(len(claim.get('sources',[]))>=1,f'Claim lacks sources: {claim["claimId"]}')
    check(bool(claim.get('limitations')),f'Claim lacks scope limitation: {claim["claimId"]}')
    for s in claim.get('sources',[]):
        check(s.get('url','').startswith('https://'),f'Claim has non-https source: {claim["claimId"]}')
    for sid in claim['sourceIds']:
        check(sid in {s['id'] for s in claim['sources']}, f'Unknown source ID in claim: {sid}')
    for ref in claim['passageRefs']:
        parts=ref.split('.')
        check(len(parts)==2 and parts[0] in book_map and parts[1].isdigit() and 1<=int(parts[1])<=book_map[parts[0]]['chapters'],f'Invalid claim passage: {ref}')

check(schema.get('$schema','').endswith('/2020-12/schema'),'Missing JSON Schema 2020-12')
ids={e['id'] for e in events}
check(len(ids)==len(events),'Duplicate event IDs')
place_ids={p['id'] for p in geo['features']}
for event in events:
    check(event['eventType']!='canonical_narrative' or len(event['scriptureRefs'])>0,f'Canonical event lacks bible refs {event["id"]}')
    check(event['contentStatus']!='published', f'Samples must never be marked published: {event["id"]}')
    check(bool(event['canonicalOutcomeId']),f'Outcome ID missing: {event["id"]}')
    check(len(event['historicalClaimIds'])>0,f'Sample claim missing: {event["id"]}')
    for claim_id in event['historicalClaimIds']:
        check(claim_id in claim_map,f'Unknown claim: {claim_id}')
    for ref in event['scriptureRefs']:
        book=book_map.get(ref['bookId'])
        check(book is not None and 1<=ref['chapterStart']<=ref['chapterEnd']<=book['chapters'],f'Event scripture ref invalid: {event["id"]}: {ref}')
    for sid in event['date'].get('sourceIds',[]):
        check(sid in source_map,f'Date source not found: {sid}')
    for pid in event['placeIds']:
        check(pid in place_ids,f'Place ID missing: {pid}')
    scene_ids={s['id'] for s in event['scenes']}
    check(len(scene_ids)==len(event['scenes']),f'Duplicate scene id in {event["id"]}')
    for scene in event['scenes']:
        for choice in scene['choices']:
            check(choice['nextSceneId'] in scene_ids,f'Unknown scene target {event["id"]}: {choice["id"]}')
            forbidden={'canonicalOutcomeId','canonicalNextEventIds','historyMutation','setFactionOwner','newKing','futureOutcome'}
            check(not forbidden.intersection(choice),f'Canonical history mutation in choice {choice["id"]}')

    # Every branch must eventually converge to a terminal scene; loops are invalid.
    scene_by_id={s['id']:s for s in event['scenes']}
    if event['scenes']:
        roots=[event['scenes'][0]['id']]
        visited=set()
        def check_graph(scene_id, ancestors):
            if scene_id in ancestors:
                errors.append(f'Scene graph cycle in {event["id"]}: {scene_id}')
                return
            if scene_id not in scene_by_id: return
            visited.add(scene_id)
            for ch in scene_by_id[scene_id]['choices']:
                check_graph(ch['nextSceneId'], ancestors | {scene_id})
        check_graph(roots[0], set())
        check(visited==scene_ids,f'Unreachable scenes in {event["id"]}: {sorted(scene_ids-visited)}')
        check(any(not s['choices'] for s in event['scenes']),f'No terminal scene in {event["id"]}')

check(geo.get('metadata',{}).get('status')=='illustrative_coordinates_unverified','Unverified map must be clearly marked')
check(all(f['properties'].get('publishable') is False for f in geo['features']),'Unverified map features must be nonpublishable')

try:
    import jsonschema
except ImportError:
    print('NOTE: jsonschema not installed; JSON Schema deep validation skipped (pip install jsonschema).')
else:
    for event in events:
        try: jsonschema.validate(event,schema)
        except Exception as e: errors.append(f'Schema validation failed in {event["id"]}: {e}')

print('Bible Chronicle — structural validation (does not fact-check historical truth)')
print(f'Books: {len(books)}; Chapters: {len(chapters)}; Authored chapters: {sum(c["content_status"] != "not_authored" for c in chapters)}')
print(f'Example claims: {len(claims)}; Demonstration events: {len(events)}; Unverified example places: {len(place_ids)}')
if errors:
    print('FAILED:')
    for e in errors: print(' -',e)
    sys.exit(1)
print('PASS: structural checks.')
