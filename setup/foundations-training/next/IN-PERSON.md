# In-person Foundations attestation

Membership → BSSC LMS → Record in-person training selects the exact member and email from the current/next-year roster. Record the actual training date and instructor when known; unknown fields remain blank and display Not recorded. Confirm actual attendance, then request the invitation. This writes a private LMS Attendance request and displays it in History.

The existing hourly lmsRosterClock worker processes requests after validating unique roster identity, active membership, course version, duplicate attendance and compatible official enrollment. It records one delivery event, provisions a managed account only when necessary, and sends a branded personal-attestation invitation. Existing active account passwords remain unchanged. Unknown delivery outcomes require review instead of an automatic duplicate send. The service owner can run processInPersonInvitations for immediate processing.

Invited learners use their own email/password login; new accounts require a first-login password change. The server derives the in-person route from the private approved attendance row, never from client flags. The learner types their enrolled full name, checks the personal acknowledgment and submits. Attendance, enrollment completion and certificate reference save in one atomic Sheets batch. Retries return the same saved certificate. No watched-video flags, quiz passes or scores are manufactured. The certificate explicitly describes in-person attendance and personal attestation.

History includes attendance recorded by/at, actual training date, instructor, recipient, invitation delivery, quiz attempts if any, signed acknowledgment, timestamp and certificate reference. Official signed in-person completion also satisfies the management portal’s Foundations patch-in gate. Attendance alone does not.

Version 6 of the existing invited-member Apps Script deployment was published November 22, 2026. enableInPersonAttestations completed successfully and created the private attendance store. Existing permissions, old Workspace deployment, videos, Practice history, grades and roster baseline were preserved. Source tests: 32 passed, including signature identity, premature/forged routes, atomic save failure, idempotent delivery/completion and both online/in-person patch-in gates. Final live invitation and History verification are recorded separately after execution.

## Live verification

November 22, 2026: Used the production management portal’s actual Record in-person training form for the owner’s requested roster identity. The private attendance request appeared in History, and the invitation processor completed successfully: Sent 1, Needs review 0, No attestations signed. Refreshed History showed Sent email delivery and Attestation pending attendance; the linked Official learner record showed In person, Password change required, no quiz attempts and no completion/certificate. The unknown training date/instructor remain Not recorded. The owner must personally choose the first-login password and submit the acknowledgment. No credentials were read, logged or entered by the agent. No other members were invited.

GitHub Pages builds for the portal workflow and versioned LMS assets completed successfully. Existing Practice history and original online grades remain separate.
