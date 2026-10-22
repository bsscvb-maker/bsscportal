# BSSC Chase sync

Private Google Apps Script project: BSSC Bank Sync (owned by the club Web Administrator).
Install `Setup.gs` and `Sync.gs` in that project. Secrets must remain in Script Properties;
never add credentials or permanent bank tokens to this repository.

The web app executes as its owner and is internet reachable. `doPost` requires a
valid Google access token issued to the portal OAuth client and a verified allowlisted
club finance administrator email. `doGet` returns only a service health response.
The handler supports only `sync`; it never returns bank tokens or transaction data.

Sync requests retrieve current and available USD balances for the explicitly mapped
club accounts ending 7707 and 8799. Bank activity is upserted into `Chase Bank Feed`
by Plaid transaction ID, including modified, pending-to-posted and removed records.
The sync cursor advances only after sheet writes succeed. Ledger classifications,
cleared flags and formulas are preserved. Bank feed imports do not post additional
income/expenses to Transactions-2026 automatically.

`Bank Sync Status` contains the last successful import timestamp and transaction
history status. The timestamp represents the import, not a guarantee that Chase has
made new transactions available to Plaid. Balance requests use `/accounts/balance/get`.

`installDailySchedule` creates one minute timer for `scheduledChaseSync`. The timer
does work only during 03:30–04:29 America/New_York, once per successful day, with
five minute retry spacing. Google may delay timer execution; exact second timing is
not guaranteed. Disable the earlier ChatGPT scheduled sync after verifying this timer
is installed to avoid two writers.

`portal.js` adds the real Sync button beside Finance Admin and displays a persistent
Eastern-time last-success timestamp. Chase activity opens the imported feed in a modal.
Only the deployment URL belongs in the public frontend.
