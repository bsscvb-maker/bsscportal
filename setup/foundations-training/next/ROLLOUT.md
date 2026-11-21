# Roster-driven Foundations accounts and countdowns

Approved by Todd on November 21, 2026: every new roster member, using their own roster email as username, a temporary password changed at first login, 60 calendar days to finish, reminders at 45/30/15/10/5/3/2/1 days remaining, and Foundations completion before full patch-in.

## Current state

The existing course remains the Workspace-authenticated version. The current test enrollment is bsscvb@boneshakerssocialclub.com. Its direct service link loads the saved 17% watch state; Google's account chooser can fail before the application for other existing sessions. The welcome page provides a direct current-session continuation in addition to account selection.

The new email templates and pure lifecycle rules are prepared and tested. They are NOT an enabled scheduler, active login provider, roster listener, or patch-in enforcement integration. No email, password, account, invitation, or real roster enrollment was created by this draft. The email preview uses fictional data only.

## Required account service

Use managed Firebase Authentication/Identity Platform email/password accounts, not passwords or password hashes in the membership spreadsheet. Provider Admin operations must create or rotate a cryptographically random initial password, set a server-controlled must-change-password state, expire unused initial credentials, and block course APIs until the initial password is changed. Refresh sessions after the change. Password reset must be available. No raw password, login token, or email body containing a temporary password may enter logs, source control, the roster, or audit exports. The initial password is supplied only in memory to the invitation renderer and cleared after dispatch. Reminder emails never contain passwords.

The API must verify the managed provider token and enrollment server-side before any record is read or written. Never authorize on a client-provided email or flag. Keep Google Workspace management sign-in separate from learner login. The existing Workspace-only Apps Script deployment cannot simply be made anonymous without first implementing and verifying the new authentication boundary. Provider project configuration, permissions, secrets, delivery authorization, and endpoint deployment are still required before activation.

## Roster and schedule contract

- Source: current membership roster (2026 now, controlled annual handover to 2027). Headers include Status, Last Name, First Name, Start Date, Email, and Member Classification. Do not treat yearly worksheet copies as new members. Use the portal's stable member identity, never a mutable row number.
- Capture a baseline of existing member identities at activation. Only subsequently added roster members are automatically invited. Existing members/prospects require a separate explicit backfill selection; do not send a historical bulk welcome or reset existing prospect clocks.
- Missing/duplicate/shared email identities, missing names, conflicting active enrollments, and uncertain matches go to administrator review instead of creating ambiguous accounts. Changes to existing emails do not create a second person or automatically reset their due date.
- Create a pending enrollment and managed account idempotently, then send one branded welcome. Record the successful invitation timestamp and start the 60-calendar-day clock only after successful send acceptance. Due date ends at 11:59 p.m. America/New_York, across daylight saving changes.
- Check for new roster members hourly and countdowns daily in the morning, with an operator-controlled pause switch. A disabled/dry-run deployment must create no accounts, send no messages, and alter no roster status.
- Use a private outbox with unique event key, enrollment ID, kind/milestone, due date, recipient, state, provider message ID, attempt time, sent time, and error category. Lock reservation; retry known failures with a cap. If send outcome is unknown, require review rather than risk a duplicate password/invitation email. Never save the plaintext password in the outbox.
- Only one current countdown per learner after a missed job; use actual days remaining in the subject and body. Preserve all send/audit references. Suppress reminders immediately after verified completion, archiving, withdrawal, or an inactive roster status.
- Verified completion means all seven ordered sections passed at >=80% plus matching-version final attestation and official completion record. Seven quiz passes alone do not release the patch-in gate.
- Enforce the same completion check in every new patch-in action, including the portal and server endpoint, with an explanatory message. Preserve historical patched-member records. Membership time/other eligibility rules remain additional requirements.
- Display invitation delivery, account activation/password-change status (never the password), deadline, countdown, progress, reminder history, and patch-in readiness under Membership → BSSC LMS.

## Launch checklist

1. Configure managed identity and verify an invited test account can change its initial password; confirm the initial password cannot be used after change and cannot access training before change.
2. Verify roster identity and all relevant roster entry/patch-in write paths; no activation without a stable baseline and shared-email review.
3. Configure verified club From identity (BoneShakers Social Club), logo, reply-to President, and authorized mail sender. Preview every email; send a clearly marked test to Todd only when explicitly requested.
4. Exercise actual clock, delivery ledger, duplicate suppression, retries, completion stop, and server-side patch gate in a sandbox. Current pure tests are not a substitute for these live checks.
5. Review concrete activation details with Todd before enabling roster invitations, reminders, provider access, or public learner service changes.

Reference docs: https://firebase.google.com/docs/auth/web/password-auth ; https://firebase.google.com/docs/auth/admin/manage-users ; https://firebase.google.com/docs/auth/admin/verify-id-tokens ; https://firebase.google.com/docs/auth/admin/email-action-links ; https://developers.google.com/apps-script/guides/projects (multi-account limitation).
