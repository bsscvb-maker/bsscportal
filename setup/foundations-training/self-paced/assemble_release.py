"""Assemble validated per-section candidates without encoding them again."""
from pathlib import Path
import hashlib,json,subprocess
root=Path(__file__).resolve().parent;work=root/'alignment';out=root/'release'
course=[];reports=[]
for n in range(1,8):
    sec=json.loads((work/f'section-{n}-course.json').read_text())
    report=json.loads((work/f'section-{n}-review.json').read_text())
    audio=root/'audio'/f'section-{n}.wav';video=out/f'section-{n}-selfpaced.mp4'
    assert report['audioSha256']==hashlib.sha256(audio.read_bytes()).hexdigest(),f'Outdated audio alignment: {n}'
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
    assert {s['codec_type'] for s in probe['streams']}=={'audio','video'}
    assert abs(float(probe['format']['duration'])-sec['duration'])<1
    assert sec['id']==n and sec['slides'][0]['start']==0
    assert all(a['start']<b['start'] for a,b in zip(sec['slides'],sec['slides'][1:]))
    b=video.read_bytes();report.update(duration=sec['duration'],slides=len(sec['slides']),videoBytes=len(b),videoSha256=hashlib.sha256(b).hexdigest(),gitBlobSha=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest())
    course.append(sec);reports.append(report)
assert [s['number'] for sec in course for s in sec['slides']]==list(range(1,90))
fmt=lambda seconds:f'{round(seconds)//60:02d}:{round(seconds)%60:02d}'
lines=[]
for sec in course:
    lines += [f'SECTION {sec["id"]}: {sec["title"]}',f'Video duration: {fmt(sec["duration"])}','']
    for s in sec['slides']:lines += [f'Slide {s["number"]} · {int(s["start"])//60:02d}:{int(s["start"])%60:02d}',s['title'],'',s['text'],'']
(out/'course.json').write_text(json.dumps(course,indent=2,ensure_ascii=False)+'\n')
(out/'BSSC-Foundations-Narration-Transcript.txt').write_text('\n'.join(lines))
(out/'validation.json').write_text(json.dumps(reports,indent=2)+'\n')
print(json.dumps({'sections':7,'slides':89,'totalDuration':sum(s['duration'] for s in course),'displayDuration':fmt(sum(s['duration'] for s in course)),'reports':reports},indent=2))
