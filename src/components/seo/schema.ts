import { absoluteUrl } from '@/config/company';
import { categoryAnchorHref } from '@/content/services';

/**
 * Node identifiers shared by every JSON-LD block on the site.
 *
 * schema.org treats `@id` as identity: two nodes with the same `@id` are the
 * same thing, described from two places. Keeping the ids in one module is what
 * lets the offer catalogue reference a service node without either side
 * hard-coding a URL the other might change.
 *
 * Plain functions over a URL scheme, deliberately not a component: this is
 * data the JSON-LD components share, and neither of them should be importing
 * the other to get at it.
 */

/** The company node. Every `provider` and `publisher` points here. */
export const BUSINESS_ID = absoluteUrl('/#organisation');

/**
 * A service category's node id.
 *
 * Anchored to the category's section on the landing page, because since the
 * detail routes were retired (CLAUDE.md 7a) that anchor *is* the canonical
 * location of the offering. `-leistung` is appended so the schema node and the
 * DOM element that carries `id="gebaeudereinigung"` stay distinguishable — an
 * `@id` colliding with a real fragment on the same page is a needless
 * ambiguity for a consumer resolving either one.
 */
export function serviceNodeId(categorySlug: string): string {
  return absoluteUrl(`${categoryAnchorHref(categorySlug, { absolute: true })}-leistung`);
}
