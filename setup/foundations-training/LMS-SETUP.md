# BSSC Foundations LMS — current production setup

Updated November 22, 2026. The website entry is https://bsscvb-maker.github.io/bsscportal/training/ . Use Member sign in for recorded enrollment; training/preview.html is a browser-local review only.

## Course

All 89 slides remain in seven sections. Recorded Arlo narration, on-screen wording, and transcripts now use self-paced language. Video time is 59:04, excluding quizzes and attestation. Forty narration passages and fifteen on-screen slides were revised. Section 1 budgeting and Section 5 circumstances sentences were restored with surgical edits from existing Arlo takes. Independent transcription and all 89 rendered video frames were checked. Source, scripts, hashes, timing, and production evidence are under self-paced/.

Each section requires full viewing and five questions with at least four correct. A failed attempt requires rewatching before another quiz. Seven passes plus the final attestation unlock the named printable certificate. Server validation controls watch time, grades, retries and completion; browser flags cannot award a pass. Existing learner records, attempt snapshots and historical media are retained.

## Member login and private records

The club-owned Apps Script service runs as bsscvb@boneshakerssocialclub.com. The active invited-member deployment is version 6; deployment.json has the exact IDs and URLs. Anyone can open the login form, including people without Google accounts. Independent anonymous HTTP verification returned the member configuration and current player assets without a Google sign-in redirect. The older Workspace-only version 3 deployment remains available separately.

Invited learners use their roster email and a Firebase-managed password. The welcome supplies a temporary password; a server-controlled gate requires a password change before course APIs are available. Accounts are bound by verified provider UID to a private enrollment; client email/IDs never select another learner. Passwords, tokens and temporary credentials are not stored in the roster, logs, source or exports. Todd's Practice account recorded first login and successful password change on November 21, 2026; its welcome test was sent once and must not be repeated.

Membership → BSSC LMS is the management view. The private roster workbook contains enrollments, progress, immutable quiz attempts, completions, settings, accounts and delivery outbox. It records learner identity, missed answers, scores, timestamps, deadlines and delivery history. Learners do not receive workbook or management access. The portal's prospect-to-full save path requires verified official training completion; direct authorized Sheets edits are outside that UI gate.

## Roster automation

The owner captured 61 existing current/next-year roster identities on November 22 at 12:33 p.m. Eastern, with no historical invitations or reminders. Only new members after that baseline are eligible. See next/ROLLOUT.md and deployment.json for the final installed trigger verification.

New eligible members receive a temporary-password welcome and 60 days from successful invitation. Branded countdowns are due at 45, 30, 15, 10, 5, 3, 2 and 1 days remaining, after 9 a.m. Eastern. Verified completion, inactive status or archiving suppresses further messages. Annual worksheet copies are deduplicated. Missing/shared/conflicting identities, uncertain start dates and unknown delivery outcomes require administrator review instead of a duplicate send. pauseRosterTraining disables new invitations and countdowns; never reset the captured baseline.

## Build and deployment

Run npm run build, npm run build:service and npm test. Publish launch.html as training/index.html, dist/index.html as training/preview.html, and dist/assets under training/assets. The generated service/Code.gs embeds the matching course metadata and assets; redeploy the existing invited-member deployment when those change. Preserve historical media for older private deployments. Publish through a fresh GitHub main tree and expected-head lease to preserve unrelated portal changes.

The November 22 release passed all 25 tests. GitHub Pages publication succeeded for e3803462622ae7a90d6f7518d55fc92578f24032. Live preview verified updated duration, transcript, section 1 media and locked quiz state. No learner passes, quiz attempts or certificates were fabricated. Phone-specific layout remains in place; a physical iPhone Safari check is still separate from browser viewport testing.

## In-person training — November 22, 2026

Record in-person training in Membership → BSSC LMS, selecting the exact member and roster email, confirming actual attendance, and entering the training date/instructor when known. Unknown values display Not recorded. The private LMS Attendance queue is processed by the existing hourly owner trigger. New accounts receive a temporary password and must change it before access; existing account passwords are preserved. Failed or ambiguous invitations require review.

History now joins attendance events, email delivery, quiz attempts and attestations. The in-person learner is routed directly to their personal acknowledgment. Their own full-name/checkbox submission atomically saves attendance signature, official completion and certificate reference. No online watch credit or quiz scores are awarded. A verified signed in-person record satisfies the Foundations patch-in gate. See next/IN-PERSON.md for operator details. All 32 tests passed for this extension.
