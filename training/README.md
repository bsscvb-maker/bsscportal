# BSSC Foundations Training

The primary course entry is training/index.html on the BSSC website. Member sign in opens the club-owned Apps Script web app. Learners use their roster email and invited Firebase training account, with a required change of the initial temporary password. Verified provider tokens are bound to one private enrollment before any course record is read or written. Learners do not receive access to the management portal or membership workbook.

The recorded course contains all 89 source slides in seven Arlo-narrated sections. It is written for independent learning: optional pauses, section recaps, private follow-up for clarification, five automatically graded questions per section, at least 80% to pass, and a complete rewatch before retry after failure. Passing all seven quizzes enables the attestation and a named printable certificate. The video time is 59 minutes 4 seconds, plus quizzes.

November 22 self-paced release: new versioned media and player assets, synchronized transcript and slide timestamps, matching server watch durations. Independent speech review and all 89 video/source frame comparisons passed. Existing grades and completion records were preserved. Previous assets are retained for the separate legacy deployment and rollback.

Browser-only preview (training/preview.html) stores clearly labeled practice progress on that device. It cannot certify official member completion. The production learner service saves private enrollment, section progress, immutable quiz attempts with feedback, and completion records. Management lives under Membership → BSSC LMS.

Automatic roster invitations and countdown reminders remain paused pending the owner's real login/password-change check and installation/verification of the clock trigger. Prepared source is not evidence of active scheduling. See setup/foundations-training/next/ROLLOUT.md and self-paced/PRODUCTION-STATUS.md.

Rebuild from setup/foundations-training: npm install, npm run build, npm run build:service. Publish launch.html as training/index.html; dist/index.html as training/preview.html; dist/assets as training/assets. Deploy matching Code.gs only after the new media/assets are available. Keep historical media, enrollment versions, and immutable attempts.
