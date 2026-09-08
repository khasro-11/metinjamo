import { absoluteUrl } from '@/config/company';
import { serviceHref } from '@/content/services';

/**
 * Node identifiers shared by every JSON-LD block on the site.
 *
 * schema.org treats `@id` as identity: two nodes with the same `@id` are the
 * same thing, described from two places. That is exactly the relationship
 * between the `Service` nodes in the landing page's offer catalogue and the
 * `Service` node on a detail page — one service, described twice. Deriving
 * both from this module is what keeps them one entity instead of two
 * competing definitions of the same offering.
 *
 * Plain functions over a URL scheme, deliberately not a component: this is
 * data the JSON-LD components share, and neither of them should be importing
 * the other to get at it.
 */

/** The company node. Every `provider` and `publisher` points here. */
export const BUSINESS_ID = absoluteUrl('/#organisation');

/**
 * A service's node id, anchored to its own detail page rather than to the
 * landing page. The detail page is the canonical description of the service,
 * so it is the URL the identifier should be rooted in.
 */
export function serviceNodeId(slug: string): string {
  return absoluteUrl(`${serviceHref(slug)}#leistung`);
}
