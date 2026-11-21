# BSSC LMS management and learner service

Management lives under Membership → BSSC LMS. Reads and enrollment writes use the management portal's existing Google sign-in and the private Club Membership Roster workbook. No workbook sharing or management-portal permissions were expanded. Learners do not receive workbook or portal access.

The five LMS tabs hold enrollments, section progress, immutable quiz attempts, completions, and connection settings. All times are stored as ISO strings and displayed in Eastern Time. Quiz attempts capture the actual questions, options, chosen answers, correct answers, explanations, score, submission time, course version, and attempt reference. Earlier failed attempts are retained. Official and Practice enrollments are distinct. Incomplete or duplicate section records are rejected rather than converted into misleading completion totals.

## Connected Google service

Project: BSSC LMS — Training Records
Editor: https://script.google.com/u/7/home/projects/1x4bnVBSW2n_XjaH6Th29c7lSQ5N8PObdg8U75oaYft2f9ZuZiyVBRgnK/edit

Google Sheets API v4 is enabled and the owner granted the explicit spreadsheets and userinfo.email scopes. authorizeLmsService completed successfully.

Deploy a Web app as bsscvb@boneshakerssocialclub.com, restricted to users within boneshakerssocialclub.com. Do not select anonymous public access. The service rejects an unavailable active-user email and any identity outside the club's Workspace domain. Each enrolled BSSC address can access only its own record; email or enrollment IDs in client input cannot change that identity. Account creation for prospects remains an administrator task; this service does not grant admin or portal access.

The learner page is served by this club-owned Apps Script service using the GitHub-hosted player assets, with google.script.run for authenticated requests. Record writes use one atomic Sheets batch for learner state, section progress, quiz attempts, and completion. Script locks prevent concurrent updates; quiz request references prevent duplicate retry records. Watch time and grading are checked on the server. No client flag can mark a section passed. Failed answers include explanations and reset the watch requirement. A named certificate is issued only after seven passes and the attestation.

After owner authorization, deploy and verify identity, enrollment, and saving with a clearly labeled Practice record before activation. Set LMS Settings → Learner Service URL to the actual verified deployment URL and Connection Status to Connected only after those checks. Do not use the local test drive as evidence that official identity and writing have been validated.

## Source and tests

The maintained player source is in src/. Run npm install, npm run build, then npm run build:service. Copy dist/index.html and assets to training/ in the Pages repository. Code.gs must be updated and redeployed together with video duration or course-version changes. Keep existing course versions and attempt snapshots for historical audit purposes.

Run node --test tests/lms-service.test.cjs for isolated identity, atomic save, gating, rewatch, retry, and certificate checks. Root tests/bssc-lms.test.cjs verifies the management view's progress and completion rules. All test records stay inside in-memory test fixtures.

Approved self-paced wording revisions remain a separate content pass; live instructor phrasing has not been represented as rewritten by this management integration.

Activation update: Google authorization succeeded on November 20, 2026 at 7:00 PM Eastern. Version 1 was deployed as the club administrator with access restricted to Anyone within BSSC C3. deployment.json retains the verified URL and configuration. A clearly marked Practice enrollment for Todd Humphrey at bsscvb@boneshakerssocialclub.com was created, and actual video playback saved watch progress and server timestamps through the deployed service. No official learner grades or certificates were fabricated. LMS Settings now reports Connected and contains the verified deployment URL.

The website course entry is training/index.html, authored from launch.html. The compiled player from dist/index.html is published as training/preview.html for browser-local review; existing local practice progress is preserved. Apps Script still embeds the compiled player with the official-mode flag and the GitHub-hosted assets. To publish future changes, retain this distinction: launch.html → training/index.html, dist/index.html → training/preview.html, and dist/assets → training/assets. Certificate-preview links on the old root URL redirect to the preview player.

Management Practice-view and Classroom draft-link reviews remain separate pending checks. The learner service is now deployment version 2, with the existing address, access rules, course version, grades, and playback cadence retained.

## Phone layout — November 20, 2026

Phone-only screen media rules (650 CSS pixels and below) provide compact course progress, horizontally scrollable section cards, an edge-to-edge video, 44–48 px playback targets, a separate full-width seek row, full-width quiz actions, larger radio options, readable transcript spacing, and mobile certificate controls. The welcome page places the Start action before the large lesson artwork on phones. Existing desktop rules and print rules are retained verbatim. iPhone fullscreen uses webkitEnterFullscreen when available on phones; desktop retains its original fullscreen behavior.

Version 2 adds HtmlOutput.addMetaTag for Google's outer phone viewport. Confirmed successful deployment at the existing Workspace-only URL. Browser review confirmed the real enrolled learner resumes Section 1 at 1:36 with 17% watched. Checked the official player at approximately 337 and 449 CSS pixels with no horizontal page overflow; playback buttons measure at least 44×46 CSS pixels. The desktop screenshot retains its original layout. Browser viewport checks use browser zoom, not a physical iPhone. Native Safari fullscreen support still requires a physical-device check. No official quiz grades or completion records were created during this layout review.

The existing deployed CSS/JS asset URLs were retained to support the current Google-served player. Their phone-only styling/function update is also kept in maintained source. New installations may briefly use a cached asset until normal revalidation. Future player builds must keep source, assets, preview, and Apps Script references synchronized.
