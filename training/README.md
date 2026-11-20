# BSSC Foundations prospect test drive

Standalone GitHub Pages training player. There is no ChatGPT dependency, sign-in, API, or iframe. All seven Arlo-narrated videos and 89 source slides are retained. Each section presents five automatically graded questions; four correct answers unlock the next section. Failure resets watched progress for that section. After all seven passes, the learner can save and print a practice attestation.

This is a prospect-experience test drive, not the production system of record. Progress is stored only in this browser's localStorage under bssc-foundations-practice-v1. It is not a verified identity, cannot transfer to another device, and can be changed by someone using browser developer tools. Quiz answers are necessarily present in the practice bundle. The practice banner and printed receipt identify this limitation. Do not use this build to certify member compliance or sync grades to Classroom.

The original server-backed course logic and private deployment have not been substituted as a hidden backend. A replacement club-owned backend is required for authoritative records, private answer keys, and member access. No management portal authentication, election services, roster, or financial records are changed.

Rebuild maintained source in setup/foundations-training with Node 22.13 or newer: npm install, then npm run build. Copy dist/index.html and dist/assets into training/. Keep training/media and training/posters. Site-relative paths support the existing bsscportal GitHub Pages deployment.

Videos use the existing Arlo audio; sections 3, 4, and 7 use a smaller AAC audio stream to fit GitHub's upload transport limit. Video frames and slide timings are unchanged.

The player now displays exact video lengths, overall course completion, and 100% section completion separately from quiz scores. A branded certificate preview is available from the sidebar and at ?certificate=preview. After passing all seven quizzes and submitting the attestation, the completion screen opens a named printable certificate. Printing uses a landscape Letter layout with a practice-only notice; preview certificates never award training credit or modify progress. The existing practice storage key is unchanged.
