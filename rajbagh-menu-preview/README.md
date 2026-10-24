# The Menu Edit · Raj Bagh

A mobile-first wedding menu voting site hosted at `/rajbagh-menu-preview/`.

## Deployment status
- Website code, audited menu bank and SQL setup are committed here.
- **Not yet connected to a live database.** Until `config.js` has real public project values and `setup.sql` has been run, the site is a **local-device demonstration**. Votes do not sync between phones.
- Never share the voting link with guests until a two-account database privacy test passes.

## Supabase setup (new project)
1. Connect the Supabase app to ChatGPT, or create a project in the Supabase dashboard.
2. Enable **Anonymous Sign-Ins** in Authentication > Providers. Guests still enter their own display names; Auth gives each browser a separate anonymous account.
3. Run [setup.sql](./setup.sql) using your project's **SQL Editor**. It seeds 412 audited menu preferences/items and 49 event/section limits; it creates `votes`, a private organizer registry, restricted policies, and aggregate vote functions.
4. Create an email/password Auth account for the organizer, verify it and copy the account's Auth user UUID from Authentication > Users. Privately run:
   ```sql
   insert into private.organizers(user_id) values ('YOUR-VERIFIED-AUTH-USER-UUID') on conflict do nothing;
   ```
5. Put your Supabase **Project URL** and **publishable (public anon) key** into [config.js](./config.js). Never put a service-role, database password or private secret key into GitHub or HTML.
6. Check live voting on two devices. Confirm that an ordinary guest can read only their own raw `votes` rows and that `vote_totals()` returns no names. Sign in through the site's profile menu as the verified organizer; the organizer should see names.
7. Only after passing these checks, share the site URL.

## Security / quota rules
- Guests enter a name, but results show anonymous totals. Authenticated organizer sees individual names.
- Main events: two non-vegetarian starters plus one optional backup **and separately** two non-vegetarian main courses plus one optional backup. No non-veg soup/salad.
- Each vegetarian course has its own PDF-specified event quota. Breakfast is an informal preferences ballot.
- Unknown achaar, papad and chutney varieties and non-veg biryanis are held pending venue confirmation. See audit in previous user conversation.
- Own-vote reset clears only that identity's ballots. Organizer reset all requires explicit typed confirmation. The backend rechecks quotas and protects names via row-level security.
- Anonymous identities are per browser/device; this is a casual preference poll, not one-human-one-vote verification.
- Live vote totals refresh approximately every 8 seconds; raw named votes are not published through Realtime.
