"""Restore two exact script sentences from the club's existing Arlo takes.

Inputs remain untouched. Cuts use independently recognized word boundaries and
silence around complete sentences; these are edits of supplied recordings.
"""
from pathlib import Path
import wave,json,hashlib
import numpy as np

root=Path(__file__).resolve().parent;workspace=root.parent.parent
fixes=[
 dict(section=1,new='Generated Audio November 22, 2026 - 11_44AM.wav',old='Generated Audio November 20, 2026 - 4_24PM.wav',remove=[517.0,521.1],take=[507.25,511.55],sentence='The number in the account does not tell you how much we can freely spend.'),
 dict(section=5,new='Generated Audio November 22, 2026 - 11_55AM.wav',old='Generated Audio November 20, 2026 - 4_35PM.wav',remove=[134.5,134.5],take=[136.05,139.75],sentence='Work, health, and family circumstances can affect anyone.'),
]
def read(path):
    with wave.open(str(path)) as f:
        assert f.getnchannels()==1 and f.getsampwidth()==2 and f.getframerate()==24000
        return np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(np.float64)
for item in fixes:
    new=workspace/'upload'/item['new'];old=workspace/'upload'/item['old'];a=read(new);b=read(old)
    start,end=[round(t*24000) for t in item['remove']];lo,hi=[round(t*24000) for t in item['take']];clip=b[lo:hi].copy()
    # Fade only the edges inside the surrounding silence, preserving words.
    fade=240;clip[:fade]*=np.linspace(0,1,fade);clip[-fade:]*=np.linspace(1,0,fade)
    out=root/'audio'/f'section-{item["section"]}-repaired.wav'
    samples=np.clip(np.concatenate([a[:start],clip,a[end:]]),-32768,32767).astype('<i2')
    with wave.open(str(out),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(24000);f.writeframes(samples.tobytes())
    target=root/'audio'/f'section-{item["section"]}.wav';assert target.is_symlink();target.unlink();target.symlink_to(out)
    item.update(originalSha256=hashlib.sha256(new.read_bytes()).hexdigest(),existingArloSha256=hashlib.sha256(old.read_bytes()).hexdigest(),repairedSha256=hashlib.sha256(out.read_bytes()).hexdigest(),duration=len(samples)/24000)
(root/'audio-repairs.json').write_text(json.dumps(fixes,indent=2)+'\n')
print(json.dumps(fixes,indent=2))
