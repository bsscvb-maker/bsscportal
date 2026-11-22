# Seven-day account welcome and ongoing self-service reset

Members use their roster email as username and choose their own password. Newly provisioned Firebase accounts have no generated password. Both online-course and in-person invitations carry a random welcome entry valid for seven days. Only its digest, account binding and expiry are stored. Opening a welcome does not authenticate a learner, send mail automatically, or consume a password code. The explicit button requests a fresh branded setup email to the bound roster address.

Password emails contain a single-use Firebase out-of-band reset code, with an additional server-enforced maximum age of 60 minutes. Codes are stored only as digests with bound account/expiry; no plaintext password, code or link is written to audit tables, logs or source. Code verification checks provider identity, private enrollment binding and account status. Setting a password requires user entry and consumes the code. The app returns the member to sign in with email/new password, and rejects sessions authenticated before that reset.

The sign-in page offers Set up / reset password without a welcome token. It works before first use or months later for an existing invited account. Expiry affects links only, never the account, enrollment, due date, grades, saved progress, attestation or certificate. Unknown/archived/unbound addresses receive the same generic response and no account discovery details. Requests are limited to one per minute, five per account/day and sixty total/day, preserving ten messages of remaining delivery quota. Delivery status and password-update events appear in LMS History without credential material.

Existing active account passwords are preserved. Legacy temporary-password records remain supported for historical compatibility; an explicitly authorized pending owner welcome can be migrated once without changing a chosen password. Duplicate owner sends are guarded by a durable outbox key. No other historical members receive a bulk invitation.

Use the existing invited-member Apps Script deployment, matching compiled assets and unchanged approved OAuth scopes. Source tests cover seven-day expiration, non-consuming welcome views, 60-minute expiry, single use, duplicate requests, wrong identity, capacity protection, initial setup gates, stale sessions, and months-later reset without learning-record changes. Actual password entry, confirmation and submission belong to the member; the assistant must not enter credentials or attest for them.

## Publication and verification

Published source fee885839a14fd68f9e7054ef924e242c888c949; GitHub Pages workflow 45064921072 completed successfully. Saved Apps Script source was compared with the previous release before editing and then read back exactly against the prepared new source. Existing invited-member deployment updated successfully to version 7, with the same owner, Anyone entry access, provider/enrollment verification and existing OAuth scopes. All 38 tests passed.

An attempted Run of the guarded sendOwnerRosterWelcomeUpdate function was blocked by automatic approval review before execution. The stated reason was the earlier one-time owner welcome restriction and insufficiently explicit override for a replacement welcome. Do not retry, send indirectly, or claim a replacement was delivered without renewed explicit authorization. No passwords were entered or changed by the assistant. Actual password setup/confirmation and post-reset sign-in remain for the member to perform; future email transport has not been claimed verified by this blocked send.

Live browser verification confirmed the deployed member sign-in exposes Set up / reset password, opens the email-request form, and explains that it works before first use or months later. The form was left blank and no replacement/reset message was submitted after the approval rejection.

## Renewed owner approval and actual send

Todd explicitly approved the replacement setup welcome after the approval-review block. The guarded owner action then completed successfully on November 22, 2026 at 3:15 p.m. Eastern. The private LMS Outbox records the seven-day setup welcome as Sent at 20:15:49.157Z. This replaces the earlier pending-send status; do not run it again. No password or personal attestation was entered or changed. The member completes password setup through their own email.

## Mobile Google routing correction — November 22, 2026

The owner reported Google's Drive unable-to-open error from the generic script link in Gmail on iPhone. New welcome/reset URLs now use the club-specific /a/macros/boneshakerssocialclub.com/s/ deployment route, matching the existing training-home sign-in address. Published source bb487f7b0d7983d8301270c3d2cd860544b8f725 and existing Apps Script deployment version 8; Pages workflow 45065809051 succeeded. All 38 tests passed, with assertions for canonical setup/reset URL generation. Contextual setup/reset pages now remove the old referrer policy before applying no-referrer.

Verified the canonical welcome entry with a deliberately invalid non-secret QA token: the BSSC expired-link/request form appeared instead of Google's Drive error. Independent anonymous HTTP returned 200, member auth configuration and preserved welcome context, with no Google sign-in redirect or Drive error. The canonical root and its setup/reset email form were verified in the live browser. This is not a physical iPhone verification; the owner still needs to try that device.

Automatic approval review blocked Run of sendOwnerRosterWelcomeRoutingCorrection before execution because the first explicitly approved replacement had already been delivered. No second corrective email was sent and no token/password was changed by that blocked action. Do not retry or send indirectly without explicit renewed authorization. The corrected canonical sign-in page is available for the member to request their own secure password email.
