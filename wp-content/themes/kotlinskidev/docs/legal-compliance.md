# Legal & Privacy Compliance Checklist

A checklist for the regulatory obligations a professional website actually carries — distinct from `docs/security.md` (which covers *technical* data protection) and `docs/accessibility.md` (which covers WCAG conformance but not the separate legal duty to *publish* a statement about it). This is a working checklist, not a description of current state.

Scope: GDPR (Regulation (EU) 2016/679) as the primary framework since the business address in the footer is Katowice, Poland; Polish implementing law (ustawa o ochronie danych osobowych, ustawa o świadczeniu usług drogą elektroniczną); the EU ePrivacy Directive (cookie consent); the European Accessibility Act's accessibility-statement duty; and general e-commerce/consumer-disclosure norms. `functions/tracking-scripts.php`, `functions/contact-form.php`, `functions/page-view-tracking.php`, `src/scripts/cookie-consent.ts`, and the Complianz plugin are the main code touchpoints.

> This is not legal advice — it's an engineering checklist for what to verify with (or hand to) an actual lawyer/DPO, especially for §3–5 where the correct answer depends on the business's actual legal structure and what services it sells.

---

## 1. Cookie Consent & Tracking Script Governance

- [ ] **Concrete finding: `functions/tracking-scripts.php` fires Facebook Pixel and Google Analytics (`gtag.js`) unconditionally on `wp_head` for every page load**, gated only by `is_admin()`/`REST_REQUEST` checks — not by any Complianz consent state. `src/scripts/cookie-consent.ts` only re-skins Complianz's "manage consent" button icon; it doesn't gate these scripts either. If `custom_fb_pixel_loader_pixel_id`/`custom_ga_loader_ga_id` are set to real IDs in production, **this is a live ePrivacy Directive / GDPR violation** — non-essential tracking cookies/scripts must not fire before affirmative consent. Fix: route both through Complianz's script-blocking (its `type="text/plain" data-category="..."` pattern, or `complianz_load_scripts`-style hooks) so they only execute after the visitor consents to the marketing/statistics category.
- [ ] Confirm whether either pixel ID option is actually populated in production right now — if so, this is urgent, not theoretical.
- [ ] Complianz's own configuration is reviewed: correct region/law selected (GDPR for EU visitors, ensure geo-targeting if serving non-EU visitors under different rules), consent categories match what's actually loaded (necessary / statistics / marketing), and the cookie policy page it generates lists every cookie actually set (audit against what Complianz's own scanner reports vs. what `tracking-scripts.php` and any plugin actually sets).
- [ ] No cookie/localStorage/tracking write happens before consent for any *other* script too — audit `page-view-tracking.php` (fires via AJAX on every single/page view, no consent check visible in the excerpt reviewed) and any third-party embed (Swiper, GSAP don't set cookies, but confirm no analytics side-effect was missed).
- [ ] Reject-all is genuinely equivalent to accept-all in effect (no dark pattern where rejecting is harder or less prominent than accepting) — a specific, actively-enforced GDPR/EDPB requirement.
- [ ] Consent is re-obtained/re-prompted after a defined expiry period, and consent choice is stored per Complianz's own mechanism, not something the theme reinvents.

## 2. Privacy Policy Content Completeness (GDPR Art. 13/14)

- [ ] Privacy Policy (linked from the footer nav as confirmed in `docs/navigation-structure.md` work — PL & EN both exist) actually lists, per GDPR Art. 13: identity/contact of the data controller, purposes and legal basis for each processing activity, recipients/categories of recipients (including every third party below), retention periods, and the data subject's rights (access, rectification, erasure, restriction, portability, objection, and the right to lodge a complaint with a supervisory authority — in Poland, UODO).
- [ ] Every actual third-party data processor is named, not just implied: Google Analytics, Meta/Facebook Pixel (if live), Google reCAPTCHA and/or Cloudflare Turnstile, WP Mail SMTP's outbound relay provider, hosting (AWS), CDN (Cloudflare), and any WordPress.com/Notion/other SaaS the business itself uses for support.
- [ ] International data transfer basis is stated where relevant (Google/Meta/Cloudflare/AWS all transfer data outside the EU/EEA — Standard Contractual Clauses or an adequacy decision must be the stated basis).
- [ ] Privacy Policy content is fully translated and equivalent in both PL and EN, not a shorter/stale version in one language.
- [ ] Policy is dated with a "last updated" timestamp and there's a process for updating it when a new tracker/processor is added (directly relevant given the §1 finding — adding proper consent-gating to GA/FB Pixel doesn't remove the need to also disclose them here).

## 3. Legal Notice / Business Identity Disclosure

- [ ] A legal-notice equivalent (Polish law requires specific business-identifying information for services provided electronically — ustawa o świadczeniu usług drogą elektroniczną, and the EU e-Commerce Directive 2000/31/EC Art. 5 requires this EU-wide) is published somewhere reachable from every page: legal business name, registered address, contact email, and — if operating as a registered business rather than a sole individual — registration number (KRS/CEIDG) and NIP/VAT ID if applicable.
- [ ] If operating as a sole proprietor (jednoosobowa działalność gospodarcza) rather than a private individual's portfolio, confirm whether this disclosure is currently legally required for this specific business's activities — this is the one item in this checklist worth an actual lawyer's sign-off, since "personal portfolio site" vs. "commercial services business" changes the obligation.
- [ ] Contact information (email, and phone if advertised) shown in the legal notice matches what's actually monitored/functional — not a stale address.

## 4. Terms & Conditions Completeness

- [ ] Terms & Conditions (footer link confirmed to exist, PL & EN) actually cover: description of services offered, pricing/payment terms if services are sold directly through the site, delivery/engagement timelines, liability limitations, dispute resolution, and governing law/jurisdiction.
- [ ] If any service is sold as a "distance contract" to EU consumers, the mandatory 14-day right-of-withdrawal disclosure (Consumer Rights Directive 2011/83/EU) is present, along with the standard withdrawal-form model — unless services are exempted (e.g. custom/bespoke digital work started with the consumer's explicit consent to lose withdrawal rights, which itself must be disclosed and consented to before work begins).
- [ ] Terms are consistent with what the Contact form / project-inquiry flow actually promises (no mismatch between marketing copy and legal terms).

## 5. GDPR Data Subject Rights & Processing Records

- [ ] A documented (even if informal) record of processing activities exists: what personal data is collected (contact-form submissions: name/email/topic/message; page-view tracking: post ID + timestamp — confirm no IP/user-agent is also being stored beyond what was reviewed in `page-view-tracking.php`), why, how long it's kept, and who can access it.
- [ ] Contact-form submissions have a defined retention period with an actual deletion process (automated or manual/scheduled) — not indefinite accumulation in `wp_mail` logs or a CRM.
- [ ] A working process exists for a data-subject access/erasure request — WordPress core ships built-in Tools → Export/Erase Personal Data; confirm it's actually wired to cover custom data (page-view meta, contact-form-derived data if stored beyond the email send) not just core comments/users.
- [ ] Page-view tracking (`_kotlinskidev_page_views`/`_kotlinskidev_last_viewed` post meta) is confirmed to store only aggregate counts, not per-visitor identifiers — if it's ever extended to track by IP/user/session, that immediately becomes personal data requiring its own legal basis and Privacy Policy disclosure.
- [ ] Data Processing Agreements (DPAs) are in place with every processor that handles personal data on the business's behalf where required (most major providers — Google, Cloudflare, AWS, WP Mail SMTP's relay — offer a standard DPA; confirm one has actually been accepted, not just assumed).

## 6. Data Breach & Incident Response

- [ ] A basic breach-response plan exists: how to detect (ties to `docs/security.md` §9 logging/monitoring), who's notified internally, and the process for the GDPR-mandated **72-hour supervisory-authority notification** if personal data is affected.
- [ ] Given the MCP/Novamira integration (`docs/security.md` §15) can execute arbitrary PHP with full DB access, a leaked API key is *also* a potential personal-data breach (contact-form submissions, user accounts) — the key-rotation/incident process there should explicitly include the breach-notification step, not just "rotate the key."

## 7. Accessibility Statement (European Accessibility Act §14 cross-reference)

- [ ] A published, dedicated Accessibility Statement page exists (separate legal deliverable from actually *meeting* WCAG — `docs/accessibility.md` covers the technical conformance work, this is the publication duty) stating: the conformance standard targeted (WCAG 2.2 AA), known limitations/exceptions, a contact method for reporting accessibility barriers, and — where the EAA applies to the business's specific offerings — the formal complaint/enforcement-body escalation path.
- [ ] The statement is kept in sync with reality — don't publish "fully conformant" if `docs/accessibility.md`'s open items (carousel autoplay, `aria-live` gaps) haven't been resolved yet; either fix first or accurately list them as known limitations.
- [ ] Confirm whether this specific site's offerings actually fall under EAA's private-sector scope (e-commerce/paid digital services) as noted in `docs/accessibility.md` §14 — if out of scope, a voluntary accessibility statement is still good practice but not a legal requirement.

## 8. Email & Communications Compliance

- [ ] Transactional email (contact-form confirmations via WP Mail SMTP) sends from a properly authenticated domain — SPF, DKIM, and DMARC records are all configured for the sending domain, both for deliverability and as basic anti-spoofing hygiene.
- [ ] If any marketing/newsletter email is ever added, it requires separate opt-in consent from transactional email and a functioning unsubscribe link (CAN-SPAM if reaching US recipients, GDPR/PECR for EU) — currently out of apparent scope, flag for whoever adds that feature later.
- [ ] The sender/reply-to address on contact-form emails is a real, monitored mailbox, not a default that silently drops replies.

## 9. Cross-Border & Multi-Jurisdiction Considerations

- [ ] Since the site serves both PL and EN audiences, confirm the legal-notice/terms/privacy content is jurisdiction-appropriate for a Poland-based business serving an international audience — Polish law + GDPR is the baseline; a US-specific privacy notice (e.g. CCPA) is very likely out of scope given the business's probable size/revenue, but worth a one-time threshold check (CCPA applies above specific revenue/data-volume thresholds) rather than assuming.
- [ ] If services are ever marketed/sold specifically into a jurisdiction with its own stricter rules (UK GDPR post-Brexit divergence, etc.), confirm the Privacy Policy accounts for it or explicitly scopes itself to EU/EEA.

## 10. Review Cadence

- [ ] This checklist is re-reviewed whenever a new third-party script, plugin, or data-collecting feature is added — the §1 finding is exactly the kind of gap that accumulates silently when a tracking snippet gets added without anyone updating consent-gating or the Privacy Policy at the same time.
- [ ] Privacy Policy / Terms / Legal Notice / Accessibility Statement are all reviewed at least annually or on any material change to what data is collected or what services are offered.
