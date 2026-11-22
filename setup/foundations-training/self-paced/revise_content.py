"""Editorial conversion of the 89-slide course to independent recorded learning."""
import copy,json,re
from pathlib import Path
from pptx import Presentation

root=Path(__file__).resolve().parent.parent
original=json.loads((root/'src/course.json').read_text())
course=copy.deepcopy(original)
slides={s['number']:s for sec in course for s in sec['slides']}

def set_text(n,text): slides[n]['text']=text.strip()
def replace(n,old,new):
    assert old in slides[n]['text'],(n,old)
    slides[n]['text']=slides[n]['text'].replace(old,new)

set_text(1,"""Welcome to BSSC Foundations, a recorded training course for members and prospects. Its purpose is to help us become stronger as a club and closer as brothers and sisters.

BoneShakers has seen people come together in remarkable ways. That shared effort is something to be proud of and something to keep building on.

First, put yourself at ease. This course is not a disciplinary meeting. Taking it does not mean that you are in trouble or that the Board is angry with you. It establishes the same foundation for every person who joins the club.

The Board and President noticed recurring misunderstandings and took an honest look at their own responsibilities. Leadership had not consistently given everyone the explanations and guidance they needed. Assuming that an expectation was understood was not enough. Leadership owns that shortcoming, and this training is one way of correcting it.

Members deserve to understand an expectation, the reason behind it, and how to follow it. The President shares responsibility for making that guidance clear. Every prospect must complete BSSC Foundations before patching in as a full member, with the understanding and support needed to succeed.

Use this course to build that understanding. If something remains unclear, note the topic and contact club leadership through the appropriate channel. Your questions can help improve the training for the next member, too.

Consider what the club can accomplish together. The 2026 charity campaign raised more than twenty thousand dollars. Future efforts could potentially reach thirty or forty thousand dollars. Reaching that potential takes shared work, clear communication, and responsible planning.

We need a strong Board that communicates clearly and supports its members. We need a strong membership that helps each other and follows through. Every member and prospect has a part in making that happen.

Protect the friendships, brotherhood and sisterhood, and community service that make BoneShakers meaningful. This course is an opportunity to strengthen that trust and take care of something bigger than any one person.""")
set_text(2,"""Complete the seven sections in order. Watch each lesson in full, then answer its five quiz questions. You need at least four correct answers, or eighty percent, to continue. If you score below eighty percent, rewatch that section and try its quiz again.

Choose a place where you can concentrate. You may use a phone, tablet, or computer. Pause whenever you need a break. When signed in to your training account, your saved progress lets you return later. Check that your latest progress has saved before closing the course.

Take notes and review the transcript when useful. For clarification, contact the President or the appropriate club leader; the recording cannot answer questions in real time. After all seven quizzes are passed, submit your completion attestation and print or save your certificate.""")
replace(3,'Today I want to connect the pieces of being a BoneShaker','This course connects the pieces of being a BoneShaker')
replace(3,'Ask questions when something needs explaining. You do not need to memorize every detail today.','Note anything that needs clarification and contact club leadership afterward. You can revisit the lessons and transcript; you do not need to memorize every detail in one sitting.')
replace(11,'Our 2026 goal is','The 2026 goal was')
set_text(13,"""Review the key ideas from this section: BoneShakers began with friendship and riding, welcomes riders and nonriders, and gives back through shared community work. Responsible budgeting protects those commitments.

If you need clarification, note the topic and contact leadership. When this lesson ends, complete the five-question quiz. A score of at least eighty percent unlocks the next section on representing BoneShakers.""")
replace(20,'Bring those conversations to me','Bring those conversations to the President')
replace(21,'Over the last year, we have increased our presence with other clubs, and we have heard good comments about how we ride together and represent ourselves.','BoneShakers has increased its presence with other clubs and received positive comments about how members ride together and represent the organization.')
set_text(24,"""Before taking this section’s quiz, review patch ownership and placement, our identity as a Social Club, and the responsibility to protect our reputation. Refer official commitments and private business questions to leadership. If a point remains unclear, review the lesson or note it for follow-up with the President. After passing the quiz, continue to Board and leadership.""")
replace(26,'For today, remember','Remember')
replace(30,'My responsibilities include','The responsibilities include')
replace(30,'I use the authority of the office and the responsibilities the club has delegated.','The President uses the authority of the office and the responsibilities the club has delegated.')
replace(30,'come to me so I can get it to the right person.','start with the President, who can direct it to the right person.')
replace(36,'This applies to the person who follows me as President just as it applies while I am serving.','It applies to the current President and to each person who later serves in that office.')
replace(37,'a direct conversation with me.','a direct conversation with the President.')
replace(38,'I can involve the Board members as needed.','The President can involve Board members as needed.')
replace(38,'If my answer does not resolve the concern','If the President’s answer does not resolve the concern')
replace(39,'bring it to me.','bring it to the President.')
replace(39,'Bring me the facts, tell me what concerns you, and tell me what you are asking us to address.','Bring the facts, explain your concern, and state what you are asking leadership to address.')
replace(39,'If the concern involves me','If the concern involves the President')
set_text(40,"""Review how members elect directors, how officers are selected, and what each leadership role contributes. Remember where to bring an ordinary concern and the separate reporting route when the President is involved. Use the transcript to revisit any point you need to clarify before the quiz.""")
set_text(41,"""You have reached the end of the Board and leadership lesson. Complete its five-question quiz to continue. If you need a break, pause here and return when you are ready. Your signed-in training account saves your progress. The next section covers governing documents and shared standards.""")
replace(43,'We are going to read the Code of Conduct together. Listen to the wording and think about what it means at a meeting, on a ride, online, or at an event. If something needs explaining, ask.','This lesson reviews the Code of Conduct. Listen to the wording and think about what it means at a meeting, on a ride, online, or at an event. Pause or replay the recording if you need more time. Note any question to discuss with leadership afterward.')
replace(43,'That covers the written expectations. What would you like explained before we continue?','That covers the written expectations. Review any part you need to hear again and note anything that requires clarification from leadership.')
set_text(47,"""Review the distinctions between bylaws, operating policies, and the Code of Conduct. Consider how respect for personal boundaries, responsible confidentiality, and a fair review process apply to club activities. Keep names and personal situations out of public discussion; use the appropriate private reporting channel. Continue to the lesson on meetings and communication when you are ready.""")
replace(48,'for this class','for this course')
replace(50,'Tell me what happened','Explain to the President what happened')
replace(53,'Send me the link or a screenshot','Send the President the link or a screenshot')
replace(54,'Think about what protects','Pause the recording if you would like time to think about what protects')
replace(59,'talk to me early','talk to the President early')
replace(60,'speak with me privately','speak with the President privately')
set_text(61,"""Review the role of a sponsor, the steps in prospecting, the access associated with each membership stage, and your responsibility for participation and current records. Contact the President privately about an adjustment or hardship. Complete this section’s quiz before continuing to rides and event responsibilities.""")
set_text(66,"""Check your understanding of the Road Captain and Tail Gunner roles, pre-ride briefings, safe group riding, and arranging a safe trip home. If you are unsure about a riding procedure, review it and seek clarification before joining a ride. Next, consider how those same habits of preparation and communication apply to event responsibilities.""")
set_text(67,"""This is an optional pause point. Take a break whenever you need one, and resume the recording when you are ready. The rest of this section covers event responsibilities, community partners, and following through on volunteer commitments.""")
replace(70,'Direct official media questions and public statements to me as President.','Direct official media questions and public statements to the President.')
set_text(73,"""Review how to prepare for an event assignment, arrange relief, and make a clear handoff. Remember that community partners support BSSC through money, space, services, and time, and that dependable participation helps return their kindness. Complete this section’s quiz. After passing, continue to fundraising and club resources.""")
replace(74,'bring me a simple plan. Tell me who benefits','bring the President a simple plan. Explain who benefits')
replace(74,'Send the request directly to me.','Send the request directly to the President.')
replace(76,'Bring the proposal through me','Bring the proposal through the President')
replace(77,'bring the proof and intended use through me','bring the proof and intended use through the President')
set_text(79,"""Check the distinction between a personal gathering and an official BSSC event. Official commitments and the use of club names, logos, or artwork require the appropriate approval. When unsure, contact the President before making a commitment or producing an item. Continue with the review of fundraising and club resources.""")
replace(82,'tell me promptly so I can involve the coordinator and Treasurer.','tell the President promptly so the coordinator and Treasurer can be involved.')
replace(83,'bring the need and proposed beneficiary to me','bring the need and proposed beneficiary to the President')
set_text(85,"""Review the approved processes for fundraising, handling money, requests for assistance, and caring for shared property. You can return to the lesson or transcript whenever you need a refresher. Ask the appropriate leader before acting if a procedure is unclear. The following scenarios help you apply these responsibilities.""")
replace(86,'What is your next step in each case?','What is your next step in each case? Pause the recording if you would like time to consider your answers before hearing the explanation.')
replace(87,'I would like to hear a few answers.','Take a moment to reflect on your own answer. You may pause the recording or write down what matters most to you.')
replace(88,"I want BoneShakers to remain strong, welcoming, and enjoyable long after any one person's term ends.","The goal is for BoneShakers to remain strong, welcoming, and enjoyable long after any one person's term ends.")
replace(88,'What questions can I answer before we finish?','If you still need clarification, contact club leadership through the appropriate channel.')
set_text(89,"""You have reached the end of the recorded lessons. Complete the final section’s five-question quiz with at least eighty percent. If you do not pass, rewatch the section and try again. Once you have passed all seven quizzes, submit the final completion attestation. Your completion screen will then provide your certificate to print or save.

Completing Foundations is required before a prospect can be fully patched; other membership requirements still apply. Keep any remaining questions for the appropriate club leader. Thank you for taking the time to strengthen BoneShakers together.""")

# Text-only revisions preserve subject matter, assessments, and course credit rules.
changed=[s['number'] for a,b in zip(original,course) for old,s in zip(a['slides'],b['slides']) if old['text']!=s['text']]
(root/'self-paced/course-revised.json').write_text(json.dumps(course,ensure_ascii=False,indent=2)+'\n')
(root/'self-paced/changes.json').write_text(json.dumps({'changedNarrationSlides':changed,'slideCount':89,'sections':7,'voice':'Arlo','status':'prepared; media publication pending'},indent=2)+'\n')
for sec in course:
    (root/f"self-paced/section-{sec['id']}-script.txt").write_text('\n\n'.join(s['text'] for s in sec['slides']))

prs=Presentation(root/'self-paced/source.pptx')
assert len(prs.slides)==89
def replace_shape(n,old,new):
    found=0
    for sh in prs.slides[n-1].shapes:
        if not sh.has_text_frame or sh.text!=old: continue
        old_paras=list(sh.text_frame.paragraphs);parts=new.split('\n')
        assert len(parts)==len(old_paras),(n,old,new)
        for p,value in zip(old_paras,parts):
            # Each replacement retains the paragraph's original run properties.
            if p.runs:
                p.runs[0].text=value
                for r in p.runs[1:]: r.text=''
            else:p.text=value
        found+=1
    assert found==1,(n,old,found)

for n in [13,24,40,47,61,66,73,79,85]:replace_shape(n,'Any questions?','Quick recap')
replace_shape(2,'A few housekeeping rules','How this course works')
replace_shape(2,'15-minute breaks\nRestroom, smoke or stretch. Return on time.','Pause when needed\nResume your saved training progress.')
replace_shape(2,'One speaker at a time\nSave side conversations for the breaks.','Watch each lesson\nComplete all seven sections in order.')
replace_shape(2,'Phones silent and put away\nStep outside for an urgent call.','Five questions per section\nEarn at least 80% to continue.')
replace_shape(2,'Stay focused and participate\nListen, take notes and keep questions on topic.','Complete your attestation\nPrint or save your certificate afterward.')
replace_shape(2,'Stay on task. Stay on track. Learn something useful.','Learn. Review. Complete each step.')
for n in [41,67]:
    replace_shape(n,'TIME FOR A BREATHER','AT YOUR OWN PACE')
    replace_shape(n,'15-minute\nbreak','Pause and\nresume')
    replace_shape(n,'Bathroom or smoke','Take a break if needed')
    replace_shape(n,'Stretch your legs','Return when you are ready')
    replace_shape(n,'Please be back on time','Continue your training')
replace_shape(54,'LET’S TALK','THINK IT THROUGH')
replace_shape(86,'LET’S TALK','THINK IT THROUGH')
replace_shape(89,'Final questions','Complete Foundations')
replace_shape(89,'Anything still unclear?','Pass all seven quizzes')
replace_shape(89,'Any questions we saved?','Submit your attestation')
replace_shape(89,'What do you need from us?','Print or save your certificate')
for n,s in slides.items():prs.slides[n-1].notes_slide.notes_text_frame.text=s['text']
out=root/'self-paced/BSSC-Foundations-Self-Paced.pptx';prs.save(out)
print(json.dumps({'changedNarrationSlides':changed,'count':len(changed),'pptx':str(out)}))
