/**
 * Shared GraphQL utility for determining the correct Switchboard URL
 * based on the current environment.
 */

/**
 * Rewrites a Connect hostname to its sibling Switchboard hostname.
 *
 * Only the leftmost label (the subdomain) is touched, so the registrable domain
 * and any port survive untouched. Three deployment shapes exist:
 *
 * | Connect                        | Switchboard                        |
 * | ------------------------------ | ---------------------------------- |
 * | `mild-dove-63-connect.vetra.io`| `mild-dove-63-switchboard.vetra.io`|
 * | `connect.mild-dove-63.vetra.io`| `switchboard.mild-dove-63.vetra.io`|
 * | `connect-staging.powerhouse.xyz`| `switchboard-staging.powerhouse.xyz`|
 *
 * The first (current Vetra) form carries `connect` as a *suffix* of the label,
 * which a start-anchored pattern misses entirely — leaving requests pointed at
 * Connect. Hostnames with no `connect` label are returned unchanged.
 */
export function toSwitchboardHostname(hostname: string): string {
  const [label, ...domain] = hostname.split(".");

  let swapped: string;
  if (label === "connect") {
    swapped = "switchboard";
  } else if (label.startsWith("connect-")) {
    swapped = `switchboard-${label.slice("connect-".length)}`;
  } else if (label.endsWith("-connect")) {
    swapped = `${label.slice(0, -"-connect".length)}-switchboard`;
  } else {
    return hostname;
  }

  return [swapped, ...domain].join(".");
}

export function getGraphQLUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:4001/graphql";
  }

  const baseURI = window.document.baseURI;

  if (baseURI.includes("localhost")) {
    return "http://localhost:4001/graphql";
  }

  const url = new URL(baseURI);
  // Assign `hostname`, not `host`: it leaves `url.port` alone, so a non-default
  // port is preserved by `url.origin` below.
  url.hostname = toSwitchboardHostname(url.hostname);
  return `${url.origin}/graphql`;
}

/**
 * Returns the GraphQL endpoint for a custom subgraph.
 * Custom subgraphs are served at `/graphql/<subgraph-name>`.
 */
export function getSubgraphUrl(subgraph: string): string {
  return `${getGraphQLUrl()}/${subgraph}`;
}
