# BSSC LMS management and learner service

Management lives under Membership → BSSC LMS. Reads and enrollment writes use the management portal's existing Google sign-in and the private Club Membership Roster workbook. No workbook sharing or management-portal permissions were expanded. Learners do not receive workbook or portal access.

The five LMS tabs hold enrollments, section progress, immutable quiz attempts, completions, and connection settings. All times are stored as ISO strings and displayed in Eastern Time. Quiz attempts capture the actual questions, options, chosen answers, correct answers, explanations, score, submission time, course version, and attempt reference. Earlier failed attempts are retained. Official and Practice enrollments are distinct. Incomplete or duplicate section records are rejected rather than converted into misleading completion totals.

The current public test drive remains browser-local. It does not silently write official records. Until activation, the management view explicitly reports that learner tracking is not connected. No real learners or grades were seeded.

## Prepared Google service

Project: BSSC LMS — Training Records
Editor: https://script.google.com/u/7/home/projects/1x4bnVBSW2n_XjaH6Th29c7lSQ5N8PObdg8U75oaYft2f9ZuZiyVBRgnK/edit

The saved Code.gs was checked byte-for-byte after normalizing Windows clipboard line endings. Google Sheets API v4 is selected in Add a service; the owner must accept Google's API terms and add it. Then run authorizeLmsService and approve the requested Google access. The authorization check does not create learner or grade records.

Deploy a Web app as bsscvb@boneshakerssocialclub.com, restricted to users within boneshakerssocialclub.com. Do not select anonymous public access. The service rejects an unavailable active-user email and any identity outside the club's Workspace domain. Each enrolled BSSC address can access only its own record; email or enrollment IDs in client input cannot change that identity. Account creation for prospects remains an administrator task; this service does not grant admin or portal access.

The learner page is served by this club-owned Apps Script service using the GitHub-hosted player assets, with google.script.run for authenticated requests. Record writes use one atomic Sheets batch for learner state, section progress, quiz attempts, and completion. Script locks prevent concurrent updates; quiz request references prevent duplicate retry records. Watch time and grading are checked on the server. No client flag can mark a section passed. Failed answers include explanations and reset the watch requirement. A named certificate is issued only after seven passes and the attestation.

After owner authorization, deploy and verify identity, enrollment, and saving with a clearly labeled Practice record before activation. Set LMS Settings → Learner Service URL to the actual verified deployment URL and Connection Status to Connected only after those checks. Do not use the local test drive as evidence that official identity and writing have been validated.

## Source and tests

The maintained player source is in src/. Run npm install, npm run build, then npm run build:service. Copy dist/index.html and assets to training/ in the Pages repository. Code.gs must be updated and redeployed together with video duration or course-version changes. Keep existing course versions and attempt snapshots for historical audit purposes.

Run node --test tests/lms-service.test.cjs for isolated identity, atomic save, gating, rewatch, retry, and certificate checks. Root tests/bssc-lms.test.cjs verifies the management view's progress and completion rules. All test records stay inside in-memory test fixtures.

Approved self-paced wording revisions remain a separate content pass; live instructor phrasing has not been represented as rewritten by this management integration.
