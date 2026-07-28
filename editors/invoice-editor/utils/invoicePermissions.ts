import type { Status } from "document-models/invoice";

/**
 * Invoice statuses in which attachments may still be added, replaced, or
 * removed. Every other status — `ISSUED`, `ACCEPTED`, `CANCELLED`, and the
 * `PAYMENT*` family — is view-only: existing attachments stay readable, but the
 * set of them is frozen.
 *
 * `REJECTED` is editable because a rejected invoice goes back to the issuer to
 * be corrected and resubmitted, which routinely means swapping the receipts or
 * the base invoice PDF.
 */
const ATTACHMENT_EDITABLE_STATUSES = [
  "DRAFT",
  "REJECTED",
] as const satisfies readonly Status[];

/**
 * Whether attachment add / replace / remove affordances should be offered for
 * an invoice in this status. Viewing is always allowed and is never gated on
 * this — callers should keep their "view" control visible regardless.
 */
export function canEditAttachments(status: Status): boolean {
  return (ATTACHMENT_EDITABLE_STATUSES as readonly Status[]).includes(status);
}
