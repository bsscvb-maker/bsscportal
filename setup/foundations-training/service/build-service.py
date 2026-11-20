import json,re
from pathlib import Path
r=Path(__file__).resolve().parent.parent
base=r/'training' if (r/'training/src').exists() else r
engine=(base/'src/engine.mjs').read_text().replace('export ','')
course=[{k:x[k] for k in ['id','title','duration']} for x in json.loads((base/'src/course.json').read_text())]
index=(base/'dist/index.html').read_text();index=index.replace('./assets/','https://bsscvb-maker.github.io/bsscportal/training/assets/').replace('../bssc-favicon.png','https://bsscvb-maker.github.io/bsscportal/bssc-favicon.png').replace('<head>','<head><script>window.BSSC_LMS_OFFICIAL=true;</script>')
s='const LMS_SCHEMA='+ (r/'lms-schema.json').read_text()+';\nconst LMS_COURSE='+json.dumps(course)+';\nconst LMS_BANK='+(base/'src/questions.json').read_text()+';\nconst LMS_HTML='+json.dumps(index)+';\n'+engine+'\n'+(r/'service/server-base.gs').read_text()
(r/'service/Code.gs').write_text(s)
print('Prepared private service code:',len(s),'characters.')
