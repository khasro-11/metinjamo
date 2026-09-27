/**
 * OpenNext configuration for the Cloudflare adapter.
 *
 * Deliberately empty of overrides. `defineCloudflareConfig()` defaults the
 * incremental cache, the tag cache and the revalidation queue to `"dummy"`,
 * and this app needs none of them:
 *
 *   - Every page is fully prerendered at build time and served from the
 *     `ASSETS` binding. There is no `revalidate`, no `revalidateTag` and no
 *     `unstable_cache` anywhere in `src/` — so there is no ISR state to keep,
 *     and therefore no R2 bucket, D1 database or Durable Object to provision.
 *   - The one server route, `POST /api/anfrage`, is `force-dynamic` and caches
 *     nothing on purpose (`Cache-Control: no-store`).
 *
 * Adding a cache override before something actually revalidates would mean
 * paid infrastructure standing idle and one more thing to name in the privacy
 * notice. If a page ever gains a `revalidate`, revisit this file first — with
 * the dummy cache, revalidation silently does nothing.
 */

import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig();
