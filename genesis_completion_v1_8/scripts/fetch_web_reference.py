#!/usr/bin/env python3
"""Optional reproducible import of public-domain WEB Genesis JSON. Network required.
This script does not redistribute text in the packaged content. No API token needed.
"""
import hashlib, json, pathlib, urllib.request, sys
URL="https://raw.githubusercontent.com/TehShrike/world-english-bible/master/json/genesis.json"
EXPECTED_BLOB_SHA="f2367d08a90469c2e6287cb4a5bff8b3a2939b24"
TARGET=pathlib.Path(__file__).resolve().parents[1]/"data"/"web_genesis_reference.json"
def main():
    data=urllib.request.urlopen(URL,timeout=30).read()
    blob_hash=hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()
    if blob_hash!=EXPECTED_BLOB_SHA:
        raise SystemExit("Source has changed. Review new version and update pinned SHA before use. Got "+blob_hash)
    rows=json.loads(data)
    keys={(r['chapterNumber'],r['verseNumber']) for r in rows if r.get('chapterNumber') and r.get('verseNumber')}
    assert len(keys)==1533 and len({k[0] for k in keys})==50
    TARGET.write_bytes(data)
    print("WEB verse structure verified, source:", URL,"sha:",blob_hash,"path:",TARGET)
if __name__=="__main__":main()
