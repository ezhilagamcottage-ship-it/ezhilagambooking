# Kutralam Ezhilagam — guest website changelog

Versioning follows the APK's convention: a minor bump (1.0 → 1.1) for a change
or two, a major bump (1.9 → 2.0) for a large release or several features
together. The number in `VERSION` is the one that goes to Rakesh on WhatsApp
and the one in the Drive filename, and they must always be the same number.

---

## v1.1 — 7 Sep 2026

UPI payments now go to 9840213184@hdfc by default, with the Google Pay Business handle kept as a second option.

## v1.0 — 6 Sep 2026

First versioned release of the guest web folder. Everything below was built in
one sitting, which is why this is 1.0 rather than a point release.

**New — the digital visiting card (`index.html`).** The link shared on
WhatsApp. Eleven property photographs on an auto-advancing carousel that stops
for good on first touch and never rotates at all on a phone set to reduce
motion. Today's date and one of thirteen quotations, both computed in
Courtallam's time zone rather than the guest's, so an enquiry from the Gulf
sees the hotel's date. Amenities, both phone numbers, the Justdial award, and
the couple/smoking notices.

**New — the check-in slip (`checkin-slip.html`).** The desk's A4 paper
register, one page, deliberately unlinked from anything public.

**New — `voucher.html`.** The booking voucher as a standalone page with sample
data, for showing the design or printing one by hand.

**Changed — the site root.** The visiting card is now `index.html` and the
booking wizard moved to `book.html`, because Netlify serves `index.html` at
the root and nothing else. `_redirects` keeps every previously shared
`/card.html` link working and adds `/book` as a short link.

**Changed — the booking voucher.** Redrawn from the bronze card to ivory and
gold, type raised about a third, and a tokenised QR at the foot that is drawn
only when the sheet issues a security token.

**Changed — the confirmation screen.** Now HTML rather than a canvas, and the
security token and images are fetched while the guest is still watching the
payment spinner. Measured: 2,362 ms of blank screen after payment, down to
about 250 ms. The downloadable JPEG is unchanged and is now built only when
the guest taps Download.

**Fixed — the guest's own name reached `innerHTML` unescaped** once the
confirmation became HTML. Everything interpolated now goes through `esc()`.

**Known, and not shipped by this release:** `?action=voucherToken` is still
undeployed, so no live booking carries a QR yet — the card shows the booking
reference instead, which is correct rather than degraded. `N8N_WEBHOOK` is
still blank. Three of the four `INCLUDED` items are unconfirmed.
