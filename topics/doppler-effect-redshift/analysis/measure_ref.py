"""Measure pacing numbers of the reference clip (memory-light)."""
import numpy as np, json, sys
W,H=270,480
g=np.memmap('/tmp/rf/gray.raw',np.uint8,'r').reshape(-1,H,W)
n=len(g); dur=n/30
d=np.zeros(n-1); hd=np.zeros(n-1)
prevh=np.histogram(g[0],32,(0,255))[0]/(W*H)
for i in range(1,n):
    a=g[i].astype(np.int16); b=g[i-1].astype(np.int16)
    d[i-1]=np.abs(a-b).mean()
    h=np.histogram(g[i],32,(0,255))[0]/(W*H); hd[i-1]=0.5*np.abs(h-prevh).sum(); prevh=h
cuts=[]
for i in range(len(d)):
    med=np.median(d[max(0,i-15):i+15])
    if (d[i]>14 and d[i]>4*med+3) or hd[i]>0.35:
        if not cuts or i-cuts[-1]>6: cuts.append(i+1)
shots=np.diff([0]+cuts+[n])/30
step=8  # pairs 8 frames apart (~0.27 s), close to the 0.25 s window
mv=np.array([np.abs(g[i+step].astype(np.int16)-g[i].astype(np.int16)).mean() for i in range(0,n-step,step)])
moving=mv>1.5
best=cur=0
for m in moving:
    cur=0 if m else cur+1; best=max(best,cur)
out={'duration_s':dur,'cuts':len(cuts),'cut_times':[round(c/30,2) for c in cuts],'cuts_per_min':len(cuts)/dur*60,
 'shot_mean_s':float(shots.mean()),'shot_median_s':float(np.median(shots)),'shot_min_s':float(shots.min()),'shot_max_s':float(shots.max()),
 'motion_share':float(moving.mean()),'mean_motion':float(mv.mean()),'longest_static_s':best*step/30}
print(json.dumps(out,indent=1))
json.dump(out,open('analysis/ref_metrics.json','w'),indent=1)
