# Manual in-person attestation console

Live: Membership → BSSC LMS → Send attestations.

Select verified roster attendees, enter the actual required class date, optionally add instructor and notes, and confirm attendance. Queue attestation emails creates Requested attendance rows in one Sheets append. It does not sign an attestation or award online quiz scores. Existing same-course attendance, ambiguous names, and shared emails require review rather than automatic duplicate sends.

A native Apps Script Head trigger runs processInPersonInvitations every five minutes, under bsscvb@boneshakerssocialclub.com. It was installed through the Triggers UI; the manifest was not expanded with script.scriptapp. Existing hourly lmsRosterClock remains active. Both use the same lock and Outbox event keys to avoid duplicate sends. Delivery results appear in History.

On 2026-11-22 at 17:06 Eastern, Todd explicitly requested restarting ramhdcui@gmail.com onboarding. The owner-only guarded restart archived the prior enrollment and retained its signed attendance and certificate. A new official enrollment and unsigned attendance were created, the existing account was rebound and gated for password setup, existing setup/reset links were invalidated, and one welcome was sent. The prior chosen password was not retrieved or entered. No other members received invitations during verification.

Validation: 41 service/account tests and 6 portal record tests; live roster filtering, selection count, required date, pending owner record, and trigger configuration verified. No live batch invitation was submitted during UI testing.
