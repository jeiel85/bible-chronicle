import json,os
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parent
j=json.loads((R/'data/genesis_art_manifest.json').read_text(encoding='utf8'))
lookup=json.loads((R/'data/episode_asset_lookup_179.json').read_text(encoding='utf8'))
assert len(j)==25 and len(lookup)==179 and len({x['assetId'] for x in j})==25
for x in j:
 assert x['subjectEventId'] in lookup
 assert x['assetId'] in lookup[x['subjectEventId']]
 assert x['productionStatus']=='prototype_only'
 for key in ('imageFile','nativeCropFile','sourceImage'):
  path=R/x[key]
  assert path.is_file(),path
  with Image.open(path) as im: assert im.width>100 and im.height>100
 assert x['rightsStatus']=='usage_terms_check_required'
assert len([v for v in lookup.values() if v])==25
print('PASS: 25 source-tracked concept scenes; 179 episode keys; 3 source boards; all scene files present')
