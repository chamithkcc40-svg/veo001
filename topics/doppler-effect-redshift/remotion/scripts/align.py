"""T4: align the final script (03-script.md) to the Whisper word timings of the real voiceover.
Output: data/alignment.json (script words with times in VOICE seconds, i.e. concat timeline without head),
plus a printed diff report (real word differences only)."""
import json, re, difflib, os
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); TOPIC=os.path.dirname(ROOT)
PART2_START=79.307771  # exact duration of part_01 (48 kHz decode)
script=open(os.path.join(TOPIC,'03-script.md')).read()
body=script.split('\n---\n')[1]
chapters=[];cur=None
for line in body.splitlines():
    line=line.strip()
    if not line: continue
    if line.startswith('#'):
        cur={'label':line.lstrip('# ').strip(),'text':''};chapters.append(cur)
    else: cur['text']+=(' ' if cur['text'] else '')+line
NUM={'1842':['eighteen','forty-two'],'1910s':['nineteen','tens'],'300':['three','hundred'],'1923':['nineteen','twenty-three'],'1929':['nineteen','twenty-nine']}
def norm(w): return re.sub(r"[^a-z0-9']","",w.lower().replace('’',"'").replace('î','i'))
tw=[]
for k,f in enumerate(['part_01_words.json','part_02_words.json']):
    off=0 if k==0 else PART2_START
    for w in json.load(open(os.path.join(ROOT,'data','transcript',f)))['words']:
        t=w['text'].strip(); key=re.sub(r"[^0-9a-zA-Z]","",t)
        if key in NUM:
            parts=NUM[key]; s,e=w['start'],w['end']; n=len(parts)
            for i,p in enumerate(parts):
                tw.append({'text':p,'start':off+s+(e-s)*i/n,'end':off+s+(e-s)*(i+1)/n,'part':k+1})
        else:
            tw.append({'text':t,'start':off+w['start'],'end':off+w['end'],'part':k+1})
sw=[]
for ci,c in enumerate(chapters):
    sents=re.findall(r"[^.?!]+[.?!]",c['text'])
    for s in sents:
        s=s.strip()
        for w in s.split():
            sw.append({'text':w,'chapter':ci,'sentence':s})
A=[norm(w['text']).replace('-','') for w in sw]
B=[norm(w['text']).replace('-','') for w in tw]
sm=difflib.SequenceMatcher(None,A,B,autojunk=False)
diffs=[]
for op,a0,a1,b0,b1 in sm.get_opcodes():
    if op=='equal':
        for i in range(a1-a0): sw[a0+i].update(start=tw[b0+i]['start'],end=tw[b0+i]['end'])
    else:
        diffs.append({'op':op,'script':' '.join(w['text'] for w in sw[a0:a1]),'heard':' '.join(w['text'] for w in tw[b0:b1])})
        # distribute the transcript span over the script words
        if a1>a0:
            if b1>b0: s,e=tw[b0]['start'],tw[b1-1]['end']
            else:
                s=tw[b0-1]['end'] if b0>0 else 0; e=tw[b0]['start'] if b0<len(tw) else s+0.3
            n=a1-a0
            for i in range(n): sw[a0+i].update(start=s+(e-s)*i/n,end=s+(e-s)*(i+1)/n)
# repair zero-length / overlapping words: give each word at least 0.08 s by borrowing from neighbours
for i,w in enumerate(sw):
    if w['end']-w['start']<0.08:
        nxt=sw[i+1]['start'] if i+1<len(sw) else w['end']+0.2
        w['end']=min(max(w['end'],w['start']+0.08),max(nxt,w['start']+0.08))
for i in range(1,len(sw)):
    if sw[i]['start']<sw[i-1]['start']: sw[i]['start']=sw[i-1]['start']
out={'part2_start':PART2_START,'chapters':[c['label'] for c in chapters],'words':sw,'diffs':diffs}
json.dump(out,open(os.path.join(ROOT,'data','alignment.json'),'w'),indent=1)
print('script words',len(sw),'transcript tokens',len(tw))
for d in diffs: print(d)
