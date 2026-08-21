# Duttarim content API

This Worker securely publishes score images and `content/songs.json` to the
GitHub repository in one atomic commit. Secrets are never bundled into the
mobile application.

Required Worker secrets:

- `ADMIN_TOKEN`: long random token used to open an admin session.
- `GITHUB_TOKEN`: fine-grained GitHub token with Contents read/write access to
  `SelmanKarakas/Duttarim-app` only.

Set them with `npx wrangler secret put ADMIN_TOKEN` and
`npx wrangler secret put GITHUB_TOKEN`, then run `npm run deploy`.
