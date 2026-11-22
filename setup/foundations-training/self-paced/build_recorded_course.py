"""Validate supplied Arlo WAVs, align every slide, and build a matched release.

Production inputs: audio/section-1.wav ... section-7.wav, revised deck frames,
and course-revised.json. This writes a candidate; publication is a separate step.
"""
import argparse,difflib,hashlib,json,re,subprocess
from pathlib import Path
from num2words import num2words
from faster_whisper import WhisperModel

root=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('--audio-dir',type=Path,required=True)
parser.add_argument('--model',default='small.en');parser.add_argument('--section',type=int)
args=parser.parse_args();course=json.loads((root/'course-revised.json').read_text())
out=root/'release';out.mkdir(exist_ok=True);work=root/'alignment';work.mkdir(exist_ok=True)
model=WhisperModel(args.model,device='cpu',compute_type='int8',cpu_threads=4)

def norm(text):
    text=text.lower().replace('’',"'").replace('bone shakers','boneshakers')
    for acronym in ['bssc','ymca','mc','rc','sc']:
        text=re.sub(r'\b'+acronym+r'\b',' '.join(acronym),text)
    text=re.sub(r'\$([\d,]+(?:\.\d+)?)',lambda m:num2words(float(m[1].replace(',','')))+' dollars',text)
    text=re.sub(r'\b\d+\b',lambda m:num2words(int(m[0])),text)
    return re.findall('[a-z]+',text)

reports=[]
for sec in course:
    n=sec['id'];audio=args.audio_dir/f'section-{n}.wav'
    if args.section and n!=args.section:continue
    assert audio.is_file(),f'Missing {audio}'
    asr_path=work/f'section-{n}-asr.json'
    digest=hashlib.sha256(audio.read_bytes()).hexdigest()
    if asr_path.exists() and json.loads(asr_path.read_text()).get('audioSha256')==digest:
        asr=json.loads(asr_path.read_text())['segments']
    else:
        segments,info=model.transcribe(str(audio),language='en',word_timestamps=True,beam_size=5,vad_filter=True)
        asr=[{'start':s.start,'end':s.end,'text':s.text,'words':[{'word':w.word,'start':w.start,'end':w.end} for w in s.words or []]} for s in segments]
        asr_path.write_text(json.dumps({'audioSha256':digest,'segments':asr},indent=2))
    reference=[]
    for slide in sec['slides']:
        slide['_a']=len(reference);reference+=norm(slide['text']);slide['_b']=len(reference)
    words=[{'token':t,'start':w['start'],'end':w['end']} for s in asr for w in s['words'] for t in norm(w['word'])]
    matcher=difflib.SequenceMatcher(None,reference,[w['token'] for w in words],autojunk=False)
    gaps=[{'expected':' '.join(reference[a:b]),'recognized':' '.join(w['token'] for w in words[c:d])} for op,a,b,c,d in matcher.get_opcodes() if op!='equal' and b-a>8]
    report={'section':n,'audioSha256':digest,'similarity':matcher.ratio(),'longGaps':gaps}
    (work/f'section-{n}-review.json').write_text(json.dumps(report,indent=2))
    assert matcher.ratio()>=.94 and not gaps,f'Audio mismatch requires review: section {n}; see report'
    mapping={i+k:j+k for i,j,size in matcher.get_matching_blocks() for k in range(size)}
    speech=[]
    for s in sec['slides']:
        first=next((k for k in range(s['_a'],min(s['_a']+8,s['_b'])) if k in mapping),None)
        last=next((k for k in range(s['_b']-1,max(s['_b']-9,s['_a']-1),-1) if k in mapping),None)
        assert first is not None and last is not None,f'Missing narration boundary: slide {s["number"]}'
        speech.append((max(0,words[mapping[first]]['start']-(first-s['_a'])*.2),words[mapping[last]]['end']))
    length=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(audio)]))
    bounds=[0]+[(speech[i-1][1]+speech[i][0])/2 for i in range(1,len(speech))]+[length]
    concat=['ffconcat version 1.0']
    for i,s in enumerate(sec['slides']):
        assert bounds[i+1]>bounds[i]
        s['start']=round(bounds[i],3);s.pop('_a');s.pop('_b')
        frame=root/'frames'/f'{s["number"]:02d}.png';assert frame.exists()
        concat += [f"file '{frame}'",f'duration {bounds[i+1]-bounds[i]:.6f}']
    concat.append(f"file '{frame}'")
    f=work/f'section-{n}.ffconcat';f.write_text('\n'.join(concat)+'\n')
    target=out/f'section-{n}-selfpaced.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(f),'-i',str(audio),'-vf','fps=2,scale=1280:720','-c:v','libx264','-preset','veryfast','-tune','stillimage','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-t',str(length),'-movflags','+faststart',str(target)],check=True)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(target)]))
    assert {s['codec_type'] for s in probe['streams']}=={'audio','video'}
    assert abs(float(probe['format']['duration'])-length)<1
    sec['duration']=length;sec['video']=f'https://bsscvb-maker.github.io/bsscportal/training/media/{target.name}'
    report.update(duration=length,slides=len(sec['slides']),videoBytes=target.stat().st_size,video=str(target))
    reports.append(report)
    (work/f'section-{n}-course.json').write_text(json.dumps(sec,indent=2,ensure_ascii=False))
    print(json.dumps(report),flush=True)

if not args.section:
    assert len(reports)==7 and sum(len(s['slides']) for s in course)==89
    (out/'course.json').write_text(json.dumps(course,indent=2,ensure_ascii=False)+'\n')
    lines=[]
    for sec in course:
        fmt=lambda t:f'{int(t)//60:02d}:{int(t)%60:02d}'
        lines += [f'SECTION {sec["id"]}: {sec["title"]}',f'Video duration: {fmt(sec["duration"])}','']
        for s in sec['slides']:lines += [f'Slide {s["number"]} · {fmt(s["start"])}',s['title'],'',s['text'],'']
    (out/'BSSC-Foundations-Narration-Transcript.txt').write_text('\n'.join(lines))
    (out/'validation.json').write_text(json.dumps(reports,indent=2)+'\n')
    print('Candidate complete. Verify media and gates before publishing; no live files were replaced.')
