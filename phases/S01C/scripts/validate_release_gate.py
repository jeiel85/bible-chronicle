#!/usr/bin/env python3
"""Intentionally BLOCKS public release of unreviewed editorial design."""
import json,pathlib,sys
P=pathlib.Path(__file__).resolve().parents[1]
eps=json.loads((P/'data/episode_index.json').read_text(encoding='utf8'))
blocked=[e['id'] for e in eps if not e['releaseReady'] or any(e['review'][k] not in ('approved','cleared') for k in ('historical','theological','rights','lesson'))]
print('BLOCKED' if blocked else 'APPROVED',len(blocked),'episodes lack approvals')
sys.exit(bool(blocked))
