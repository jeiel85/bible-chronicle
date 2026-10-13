#!/usr/bin/env python3
import json,pathlib,sys
p=pathlib.Path(__file__).resolve().parents[1]/'data/episode_index.json'
a=json.loads(p.read_text(encoding='utf-8'))
blocked=[e['id'] for e in a if not e['releaseReady'] or any(e['review'][k] not in ('approved','cleared') for k in ('historical','theological','rights','lesson'))]
print('BLOCKED' if blocked else 'APPROVED',len(blocked),'episodes waiting on reviews')
sys.exit(bool(blocked))
