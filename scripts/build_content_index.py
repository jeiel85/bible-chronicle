#!/usr/bin/env python3
"""Maintainer helper: builds 66-book metadata and 1,189 chapter placeholders.
IMPORTANT: chapter placeholders do not constitute written/verified content.
"""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
# Format: code|Korean title|chapters|genre|example teaching focus|illustrative focus passage
RAW = '''GEN|창세기|50|torah_narrative|창조·족장·언약과 가족|1-3,12,37-50
EXO|출애굽기|40|torah_narrative|해방·언약·성막|1-15,19-20,25-40
LEV|레위기|27|law|거룩·제사·속죄일|1-7,16,19,23
NUM|민수기|36|torah_narrative|광야 공동체·계수·불신|1-4,13-14,21
DEU|신명기|34|law|언약 갱신과 회고|5-6,28-30
JOS|여호수아|24|historical_narrative|정착 서사와 땅·언약|1-6,23-24
JDG|사사기|21|historical_narrative|사사 시대의 위기와 회복|2-7,13-16
RUT|룻기|4|historical_narrative|가족·기업 무름·계보|1-4
1SA|사무엘상|31|historical_narrative|사무엘·사울·다윗의 등장|8-10,16-17
2SA|사무엘하|24|historical_narrative|다윗 왕권·언약·위기|5-7,11-12
1KI|열왕기상|22|historical_narrative|솔로몬·성전·왕국 분열|3-12,18
2KI|열왕기하|25|historical_narrative|분열 왕국·멸망과 포로|17-18,24-25
1CH|역대상|29|historical_narrative|계보·다윗·예배 준비|1-9,17,21-29
2CH|역대하|36|historical_narrative|성전·유다 왕들·포로|1-9,29-36
EZR|에스라|10|historical_narrative|귀환·성전 재건·공동체|1-6,9-10
NEH|느헤미야|13|historical_narrative|성벽 재건·언약 회복|1-6,8-10
EST|에스더|10|historical_narrative|디아스포라 공동체·위기|3-9
JOB|욥기|42|wisdom|고난과 신정론의 질문|1-2,38-42
PSA|시편|150|poetry|시편·기도·탄식·찬양|1,19,23,51,119
PRO|잠언|31|wisdom|지혜·언어·삶의 윤리|1-9,31
ECC|전도서|12|wisdom|삶의 허무·시간·경외|1-3,12
SNG|아가|8|poetry|사랑의 시·문학적 표현|1-8
ISA|이사야|66|prophecy|심판·위로·구원 약속|6,36-39,40,53
JER|예레미야|52|prophecy|유다 위기·새 언약·포로|1,25,31,39
LAM|예레미야애가|5|poetry|예루살렘 멸망을 애도|1-5
EZK|에스겔|48|prophecy|포로기 환상·회복|1,10,37,40-48
DAN|다니엘|12|apocalyptic|궁정 이야기·환상·제국|1-6,7-12
HOS|호세아|14|prophecy|언약·회복의 비유|1-3,11
JOL|요엘|3|prophecy|재앙·회개·영의 약속|1-3
AMO|아모스|9|prophecy|정의·심판·회복|1-2,5,9
OBA|오바댜|1|prophecy|에돔 심판·회복|1
JON|요나|4|prophecy|니느웨·회개·자비|1-4
MIC|미가|7|prophecy|정의·심판·희망|4-6
NAM|나훔|3|prophecy|니느웨에 대한 예언|1-3
HAB|하박국|3|prophecy|악과 정의에 관한 질문|1-3
ZEP|스바냐|3|prophecy|여호와의 날·회복|1-3
HAG|학개|2|prophecy|성전 재건에 대한 권면|1-2
ZEC|스가랴|14|prophecy|환상·회복·메시아적 전망|1-8,9-14
MAL|말라기|4|prophecy|예배·언약·정의|1-4
MAT|마태복음|28|gospel|예수의 가르침·수난·부활|1-2,5-7,26-28
MRK|마가복음|16|gospel|예수의 사역·수난·부활|1,8,14-16
LUK|누가복음|24|gospel|예수의 생애·비유·부활|1-2,10,15,24
JHN|요한복음|21|gospel|말씀·표적·예수의 정체|1,3,11,19-21
ACT|사도행전|28|historical_narrative|초대 교회·선교 확장|2,9,15,28
ROM|로마서|16|epistle|복음·의롭다 하심·윤리|3,8,12
1CO|고린도전서|16|epistle|교회 질서·사랑·부활|12-15
2CO|고린도후서|13|epistle|사도직·화해·연보|4-5,8-9
GAL|갈라디아서|6|epistle|자유·믿음·성령의 열매|3,5
EPH|에베소서|6|epistle|그리스도 안에서의 공동체|2,4,6
PHP|빌립보서|4|epistle|기쁨·겸손·동역|2-4
COL|골로새서|4|epistle|그리스도 중심·삶의 변화|1-3
1TH|데살로니가전서|5|epistle|소망·거룩·재림|4-5
2TH|데살로니가후서|3|epistle|인내·재림에 관한 가르침|1-3
1TI|디모데전서|6|epistle|목회·교회 질서|3-6
2TI|디모데후서|4|epistle|말씀·고난·사역의 지속|1-4
TIT|디도서|3|epistle|공동체 질서·선행|1-3
PHM|빌레몬서|1|epistle|관계와 화해의 호소|1
HEB|히브리서|13|epistle|대제사장·언약·믿음|4,8-11
JAS|야고보서|5|epistle|행함·말·공동체 윤리|1-5
1PE|베드로전서|5|epistle|고난 속 소망과 성결|1-5
2PE|베드로후서|3|epistle|거짓 교훈·인내|1-3
1JN|요한일서|5|epistle|사랑·진리·교제|1-5
2JN|요한이서|1|epistle|진리와 사랑|1
3JN|요한삼서|1|epistle|환대·공동체 갈등|1
JUD|유다서|1|epistle|거짓 가르침 경고|1
REV|요한계시록|22|apocalyptic|일곱 교회·환상·새 창조|1-3,4-5,21-22'''
books=[]; chapters=[]
for index,line in enumerate(RAW.splitlines()):
    code, ko, maxchap, genre, focus, passage = line.split('|')
    maxchap=int(maxchap)
    testament='OT' if index<39 else 'NT'
    books.append({'id':code,'order':index+1,'nameKo':ko,'chapters':maxchap,'testament':testament,'genre':genre,'teachingFocus':focus,'illustrativePassages':passage,'bookStatus':'not_authored'})
    for ch in range(1,maxchap+1):
        chapters.append({'id':f'{code}.{ch:03}', 'bookId':code, 'chapter':ch, 'content_status':'not_authored', 'canonicalCoverage':'index_only', 'literaryUnitIds':[], 'claimIds':[], 'reviewStatus':'not_reviewed'})
assert len(books)==66,(len(books))
assert sum(x['chapters'] for x in books)==1189
assert len(chapters)==1189
for name,obj in [('books.json',books),('chapter_index.json',chapters)]:
    (ROOT/'data'/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report={'canon':'Protestant 66-book','books':66,'chapters':len(chapters),'oldTestamentBooks':39,'newTestamentBooks':27,'authoredChapters':0,'reviewedChapters':0,'status':'index_only_not_authored','warning':'This manifest is not the Bible text nor a fact-checked commentary.'}
(ROOT/'data'/'coverage_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(report)
