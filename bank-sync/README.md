# BSSC Chase sync

Private Google Apps Script project: BSSC Bank Sync (owned by the club Web Administrator).
Install `Setup.gs`, `Sync.gs`, and `Ledger.gs` in that project. Secrets must remain in Script Properties;
never add credentials or permanent bank tokens to this repository.

The web app executes as its owner and is internet reachable. `doPost` requires a
valid Google access token issued to the portal OAuth client and a verified allowlisted
club finance administrator email. `doGet` returns only a service health response.
The handler supports only `sync`; it never returns bank tokens or transaction data.

Sync requests retrieve current and available USD balances for the explicitly mapped
club accounts ending 7707 and 8799. Bank activity is upserted into `Chase Bank Feed`
by Plaid transaction ID, including modified, pending-to-posted and removed records.
The sync cursor advances only after sheet writes succeed. Ledger classifications and running-balance formulas are preserved. New activity dated October 22, 2026 onward automatically enters Transactions-2026, or links to existing entries. Bank IDs and pending replacement IDs prevent repeated imports. Pending entries remain `Pending at Chase`; posted entries await manual reconciliation (`No`). Existing cleared entries stay cleared. Unknown categories remain blank for review; the fund initially follows the mapped bank account. Processor payouts match existing settlement groups rather than duplicating income. Removed auto-imports are voided with the original amount retained in notes.

`Bank Sync Status` contains the last successful import timestamp and transaction
history status. The timestamp represents the import, not a guarantee that Chase has
made new transactions available to Plaid. Balance requests use `/accounts/balance/get`. Transaction refresh is requested through `/transactions/refresh` at most once every 30 minutes; unavailable refresh is reported without blocking the available feed import. A refresh request is asynchronous and does not guarantee every recent bank transaction arrives in the same run.

`installDailySchedule` creates one minute timer for `scheduledChaseSync`. The timer
does work only during 03:30–04:29 America/New_York, once per successful day, with
five minute retry spacing. Google may delay timer execution; exact second timing is
not guaranteed. Disable the earlier ChatGPT scheduled sync after verifying this timer
is installed to avoid two writers.

`portal.js` adds the real Sync button beside Finance Admin and displays a persistent
Eastern-time last-success timestamp. Chase activity opens the imported feed in a modal.
Only the deployment URL belongs in the public frontend.
