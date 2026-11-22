# Roster enrollment and countdown rollout

Current production state — November 22, 2026.

Todd authorized every new roster member to receive Foundations using their roster email, a temporary password changed at first login, 60 days to finish, and countdowns at 45, 30, 15, 10, 5, 3, 2 and 1 days remaining. Foundations completion is required before full patch-in; it does not waive other membership requirements.

## Verified activation

- Firebase email/password accounts configured; user-approved terms and account permissions are in place.
- Active public member-login deployment: version 5, execute as club administrator. The older Workspace-only version 3 remains separate. Exact IDs are in service/deployment.json.
- Anonymous public endpoint check returned HTTP 200, member configuration and current assets without Google sign-in. A local multi-account Google session can still fail on the generic route; the website's canonical domain route displayed the member login.
- The owner Practice welcome test was sent ONCE on November 21. LMS Accounts confirms first login at 15:54:10.943Z and password change at 15:54:28.199Z. Account is Active. Do not resend the guarded test or retrieve its password.
- activateRosterTraining completed November 22 at 12:33:31 p.m. Eastern. Baseline: 61 existing people across current/next-year rosters. No historical invitations or reminders sent. Do not reset this baseline.
- Installed native Apps Script lmsRosterClock time-driven trigger. A brief every-minute verification ran automatically at 12:39:03 p.m. Eastern and completed in 3.574 seconds. Cloud log: Messages sent: 0. Identities needing review: 0. This verifies background owner identity and access; it is not a fabricated new-member enrollment.
- Changed the same trigger to Hour timer / Every hour after that successful run. No duplicate trigger is intended. Failure notifications remain daily to the owner.
- Seven updated Arlo videos, transcripts and player are live, total 59:04. All 89 slides preserved. Existing Drive/Classroom video attachment IDs were replaced in place.

## Operational behavior

Only additions after the captured baseline are eligible, with Active, Prospect or Pending roster status. Current/next-year copies are deduplicated. Missing names/emails, shared or conflicting email, an uncertain/backdated start date, existing accounts and ambiguous enrollment require review. No historical bulk invitation is authorized.

The worker reserves an outbox event, creates a private Official enrollment and Firebase account, and sends one branded welcome with a temporary password. The 60-calendar-day due date is recorded after successful send acceptance. Passwords exist only in memory for delivery and never enter roster rows, logs, source or audit exports. Password change is required before course access; password reset is available.

Hourly checks send only one current countdown after a missed scheduled run, after 9 a.m. Eastern. Delivery keys prevent duplicates. Reminders stop for verified completion, archived enrollment or inactive roster status. Unknown delivery outcomes are Needs review rather than blindly resent. Review cases are visible in Membership → BSSC LMS. Daily owner trigger failure notices supplement that view.

The completion gate requires seven passing section records (at least 4/5 each) and a matching official final attestation. The portal's prospect-to-full save path enforces this; direct authorized spreadsheet editing is outside that UI.

## Maintenance

Use pauseRosterTraining to pause invitations/countdowns without deleting records or resetting deadlines. Never rerun activateRosterTraining to reset a course clock. Keep one hourly trigger owned by bsscvb. Maintain the private roster workbook access boundary. Monitor LMS Outbox and account metadata; no real member was invited merely to test this rollout.

Source tests passed all 25 checks for the release. Actual first invitation to a future new member and future countdown delivery have not occurred yet; observe their real outbox audit when due. Current media, anonymous login, owner password change, baseline and actual automatic background execution are verified.
