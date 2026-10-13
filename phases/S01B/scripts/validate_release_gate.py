#!/usr/bin/env python3
"""Production MUST be blocked until every episode has reviewed source/rights/safety.
This script intentionally fails for this design-only draft; do not include it in build PASS smoke tests.
"""
import json,pathlib,sys
P=pathlib.Path(__file__).resolve().parents[1]
eps=json.loads((P/'data/episode_index.json').read_text(encoding='utf8'))
missing=[]
for e in eps:
 if not e['releaseReady'] or e['review']['historical']!='approved' or e['review']['theological']!='approved' or e['review']['rights']!='cleared' or e['review']['lesson']!='approved':
  missing.append(e['id'])
print('BLOCKED: S01B is a non-publishable authoring draft. Unapproved episodes:',len(missing))
sys.exit(1 if missing else 0)
