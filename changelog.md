# Kutralam Ezhilagam — guest website changelog

Versioning follows the APK's convention: a minor bump (1.0 → 1.1) for a change
or two, a major bump (1.9 → 2.0) for a large release or several features
together. The number in `VERSION` is the one that goes to Rakesh on WhatsApp
and the one in the Drive filename, and they must always be the same number.

---

## v1.5 — 19 Oct 2026

**New — two floating Shenba buttons.** Chat with Shenba (left, green) and Talk with
Shenba (right, gold, with her face) float at the foot of the screen with a soft glow,
and move to the top while Book Room Now is under them.

**New — the Talk with Shenba page.** Logo on top, Shenba in the centre, and a booking
card that fills in as the guest speaks (name, check-in, stay, room, adults, children,
rate). Proceed to pay opens the Razorpay link for that room; after payment the page
shows the booking ID. Lip sync uses six mouth shapes picked from her voice.

## v1.4 — 19 Oct 2026

**New — Shenba's face.** A photo of Shenba sits in the bottom corner as the one
voice launcher (the green ball pop-up is gone). Tap her face to talk, tap again
to end; same ElevenLabs agent and tools. She blinks and breathes while waiting,
nods while the guest talks, and her lips follow her voice while she speaks. She
moves to the top while Book Room Now is under her, shrinks with the – button,
and asks for the microphone only after the tap. Still pose for reduced motion.

## v1.3 — 19 Oct 2026

New branded page ezhilagam.cloud/shenba: Ezhilagam logo, "Talk with Shenba", call button and a Switch to Chat view — replaces the ElevenLabs page that opened from WhatsApp links. The Talk with Shenba pop-up on the home page now shows the logo and tagline too.

## v1.2 — 19 Oct 2026

"Chat on WhatsApp" is now "Chat with Shenba": a text chat on the page where Shenba introduces the property, asks the stay dates and guests, and quotes live rooms and prices. New "Talk with Shenba" button below it starts a voice call with Shenba right on the page. If the website Shenba is unavailable (e.g. ElevenLabs subscription ends), both buttons hand the guest to WhatsApp Shenba on the rockyjio number (63742 13184).

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
