# ZenAIGC

> AI-powered image and video generation with curated model catalog and
> pixel-perfect cost tracking.

ZenAIGC is an AI image/video generation suite built around a unified
cost-tracking engine that supports multiple vendors (Nano Banana, Midjourney,
GPT Image, Veo, Seedance) through a single interface.

This repository hosts:

- **SDK packages** — for integrating ZenAIGC into your own apps
- **Beta release artifacts** — `.pak` files for the [superone host](https://superone.com) miniapp

The main application source code is **proprietary** and lives in a private
repository. This public mirror is automatically synced via a strict allowlist
(see `.github/workflows/sync-to-public.yml` in the private monorepo).

---

## Beta Access

ZenAIGC is currently in private beta with limited slots.

1. Request an invite token at [zenaigc.com](https://zenaigc.com) _(coming soon)_
2. Download the latest miniapp `.pak` from the [Releases](../../releases) page
3. Install [superone host](https://superone.com) if you don't have it
4. Open the miniapp and enter your invite token on first launch
5. You'll receive a free credit balance to evaluate the app during beta

## SDK Packages

> ⚠️ These packages are mirrored from the private monorepo and are **not yet
> published to npm**. Beta SDK users will receive access instructions
> separately.

| Package | Purpose |
|---|---|
| `@zenaigc/zenapi-client` | Client library for the ZenAPI relay endpoint |
| `@zenaigc/zenaigc-auth-react` | React hooks & components for ZenAIGC auth |

## Feedback

- **Bugs / feature requests** — open a [GitHub issue](../../issues)
- **Beta user group** — chat group link sent with invite email

## License

- SDK code released under [MIT](./LICENSE)
- `.pak` release artifacts are licensed for **non-commercial beta evaluation
  only** during the beta period; commercial license terms will be published at
  1.0 release.
