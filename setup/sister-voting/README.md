# Sister Patch voting

The public GoDaddy page uses the club-owned Apps Script deployment. The existing birth-date verification issues a 30-minute opaque session; ballots do not store birth dates. `Code.gs` is the deployed service and `page.html` is the GoDaddy HTML section.

Votes are saved in the membership workbook's `Sister Patch Votes` sheet. The seven columns are Review Year, Voter Key, Voter Name, Nominee Key, Nominee Name, Submitted At, and Receipt. The review year is the newest annual roster year minus one, matching the attendance comparison. There is no opening or closing schedule.

A script lock and a server-side member/year check enforce one final vote per member. Retrying after a lost response returns the existing receipt. The service rechecks active membership and nominee eligibility before writing and confirms the saved row before returning success. The `SISTER_VOTE_KEY_SECRET` Script Property must be retained; changing it would change member keys. Shared email addresses do not merge members.

The authenticated Membership → Sister Patches view shows aggregate counts and participation names. It does not pair participants with their choices. The underlying vote log remains available to people who already have access to the private workbook; this is not an anonymous-ballot system.

Run `node --test setup/sister-voting/voting.test.cjs` for isolated persistence checks. Live UI verification stops before Submit vote so it does not cast a real member's ballot. Any end-to-end live ballot must be the member's own choice.

Bike-night cards use the club-confirmed total of 10. The roster currently labels two of those entries January and February although the stated season is March–October; those source dates have not been silently changed.
