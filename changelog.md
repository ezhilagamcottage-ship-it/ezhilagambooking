# Kutralam Ezhilagam — guest website changelog

Versioning follows the APK's convention: a minor bump (1.0 → 1.1) for a change
or two, a major bump (1.9 → 2.0) for a large release or several features
together. The number in `VERSION` is the one that goes to Rakesh on WhatsApp
and the one in the Drive filename, and they must always be the same number.

---

## v2.3 — 22 Oct 2026

**Tap to choose, pay at once, no repeating.** When Shenba offers rooms, the call page (and the chat) shows them as
Option 1 / Option 2 cards with the room photo, AC or non-AC and the total; the guest taps one and Shenba carries on with
it. "Proceed to pay" turns green as soon as a rate is on the card (with or without a discount): one tap tells Shenba to
hold the room, and the payment page opens by itself when the link is ready. Shenba no longer asks the name again or
reads the details back — she asks the guest to check the card on the screen before checking rooms.

---

## v2.2 — 22 Oct 2026

**Fillers and nothing lost while reading the code.** When Shenba needs a moment (checking rooms, prices or the guest's
earlier visits), a short natural line plays — "ம்ம்... ஒரு நிமிஷம்.", "Okay, check பண்ணிட்டு சொல்றேன்..." — instead of
silence; her answer follows straight after. While the guest goes to WhatsApp to read the 4-digit code, the card, the
conversation and the number are kept on the phone: if the page reloads, it reopens with the code box waiting and the
same conversation carries on. The typed number also reaches the hotel at once (enquiry report), even if never verified.

---

## v2.1 — 22 Oct 2026

**Returning guests, safe closing, thank-you.** Shenba asks the mobile number first; once verified she knows if the
number stayed or enquired before and welcomes them back ("Same head count-a varangala, illa new count-a?"). The code
box sits at the top (the keypad no longer hides Verify) and the keypad's Enter verifies. Closing Shenba, the Back
button or Escape while she is taking details asks "Should this window be closed?" (OK on the left, Stay is the
default). A call that ends with an enquiry shows Shenba in her silk saree, hands joined: "Unga enquiry register
aagiduchu! Nandri!".

---

## v2.0 — 22 Oct 2026

**Talk with Shenba: typed and verified mobile number, live card, discounts.** When Shenba needs the mobile number a
box opens to type it; a 4-digit code goes to that WhatsApp (shown in the phone's notification) to verify it. The booking
card fills in as the guest speaks (name, mobile, dates, adults, kids). A discount Shenba agrees shows at once: the old
price struck out, the saving, and "Proceed to pay" with the new amount (the /pay page shows the discount too).

---

## v1.9 — 21 Oct 2026

**Pay on our own page.** The /pay checkout page is redesigned in the website's style (progress steps, room photo
card, countdown, sticky Pay bar) and now takes the payment itself with Razorpay Checkout — Ezhilagam logo and green
theme — instead of sending the guest to Razorpay's blue page. The Talk with Shenba "Proceed to pay" opens this page too.

---

## v1.8 — 21 Oct 2026

**No call time limit on Talk with Shenba.** Shenba stays on the call until the booking is held,
the enquiry is noted, or the guest says bye. Only after 4 minutes of off-topic questions does she
politely end it. A single network or server hiccup no longer ends the call: she asks the guest to
say it again. New branded checkout page /pay for rooms Shenba holds.

---

## v1.7 — 20 Oct 2026

**Shenba works without ElevenLabs.** Talk with Shenba and Chat with Shenba now run on our
own server: what the guest says is turned into text by Google, Shenba answers with the
same prompt, knowledge and live room, price and booking tools as before (Claude), and she
speaks in her Google voice (Leda: warm, smiling, Chennai-style Tanglish). The booking card
and Proceed to pay work as before. Tap her face while she speaks to interrupt her. The old
/shenba link opens her on the homepage.

## v1.6 — 20 Oct 2026

**New homepage layout, one screen, no scrolling.** Logo and a cycling trust badge on
top (Google 4.7, Justdial Users' Choice 2026, Justdial stars, Goibibo 4.4, MakeMyTrip
4.3, 2 seconds each), Booking and Reception numbers that open the phone dialer, then
Reserve now, the photo slider, Talk with Shenba and Chat with Shenba. On a computer the
photos are on the left and Shenba and Reserve now on the right. Shenba no longer floats
over the page, so nothing is covered.

**New — photo slider.** Each photo wipes in with a slow zoom, with a row of small photos
underneath to jump to any room; swipe and full-size tap still work.

**New — touches.** Sharper logo with a magnifying lens gliding over it on computers;
on phones Reserve now has a light sweep and a pulsing ring.

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
