# BSSC online adoption certification setup

1. Sign in to the club Google account and open https://script.google.com/home/start.
2. Create a New project named **BSSC Governance Certification**. Replace Code.gs with the supplied Code.gs file.
3. In setupGovernanceCertification, replace the two placeholder addresses with the President's and Secretary's own Google sign-in email addresses. They must be different accounts. Do not share one login for signing.
4. Select **setupGovernanceCertification** and click **Run**. Approve Google's requested permissions. This creates a private **BSSC Governance Certifications** Drive folder.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Deploy and copy the URL ending in **/exec**. Although the endpoint is reachable, every record request verifies a Google session and the two allowed officer addresses. Do not add passwords or tokens to the source.
6. Open the BSSC Management Portal. Under **Club Records → Bylaws** or **Operating Policies**, click **Adoption certification**. Paste the /exec URL in Service setup and save. The portal saves the URL in a new **Governance Certification Setup** tab in its existing Membership workbook, so the Secretary uses the same service automatically.
7. Click **Load certificates**. Create a record only after the required adoption vote. Enter the adoption/effective dates, version and minutes reference. The service snapshots both current Word and PDF masters and records their SHA-256 fingerprints. Once created, those details cannot be edited through this service. If wrong, create a corrected certificate and document which one supersedes it in the minutes.
8. President and Secretary each sign from their own portal Google account: review the details, type their name and check the certification box. The service records the verified email, role and server time. Nobody may sign on the other's behalf.
9. After both signatures, open **Certificate PDF** to save the completed certificate. Keep it with the minutes. The private Drive folder retains the exact document snapshots and signature record; do not make it public.

## Operation and limitations

- The certificate records adoption; it does not perform or replace the adoption vote.
- The portal never sends emails or signs for you. Tokens are used only to verify the current Google identity and are not stored in the certification records.
- The backend refuses users other than the configured officers. Access to the Membership workbook is still required to read the shared service URL.
- Drive ownership can edit the underlying records; this is an internal audit record, not a tamper-proof commercial signature service. Google Drive activity/version history provides additional evidence. Keep ownership restricted and retain backups.
- Existing certificates keep their originally assigned officers. For a leadership change, update the two configured emails and run setup again; create new certificates for the new officers. Existing signatures remain unchanged.
- To update script code later, use Deploy → Manage deployments → Edit → New version → Deploy, retaining the same /exec URL.
- If Google blocks an officer's OAuth account, the administrator must grant that officer access to the portal's Google OAuth audience and Membership workbook first.
