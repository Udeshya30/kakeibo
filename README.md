# Kakeibo

![CI](https://github.com/Udeshya30/kakeibo/actions/workflows/deploy-pages.yml/badge.svg)

Kakeibo is a private, offline-first budgeting app. This repository is configured to run tests, build, and deploy the static site to GitHub Pages on every push to `main`.

How it works:

- Push to `main` → GitHub Actions runs tests (`npm test`).
- If tests pass, the site is built (`npm run build`) into `docs/` and deployed to GitHub Pages.

To trigger a build locally and push:

```bash
npm ci
npm test
npm run build
git add -A
git commit -m "Your commit message"
git push origin main
```
