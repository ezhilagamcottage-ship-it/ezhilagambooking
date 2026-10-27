# Kutralam Ezhilagam — guest website changelog

Versioning follows the APK's convention: a minor bump (1.0 → 1.1) for a change
or two, a major bump (1.9 → 2.0) for a large release or several features
together. The number in `VERSION` is the one that goes to Rakesh on WhatsApp
and the one in the Drive filename, and they must always be the same number.

---

## v8.0 — 27 Oct 2026

**New computer home page in navy and gold** (Rakesh). Phones keep the maroon lite site.
- First screen after the sample Rakesh chose: logo plate with the Duphora pill, gold pill menu (Home, Rooms, Gallery, Location, Contact, Chat with Shenba), "Live with Nature" in a large gold serif, six amenity icons (walk to the falls, home food on order, fast Wi-Fi, OTT premium, family friendly, smoke & alcohol free), Book now, address and both numbers, and the room photos rotating in a gold frame with gold leaves and dots.
- Photo library: Rakesh's 14 photos in `img/photos/` (labels and the camera watermark cropped off). Eight rotate in the frame; the room cards below use them too.
- Page turns: Rooms, Gallery, Location, Contact and Reserve each open their own page with a right-to-left page turn and a soft paper-flip sound. Home turns back. Gallery opens photos large; Location has the map inside the page; Reserve opens the dates-and-guests panel by itself. Chat and Talk with Shenba never turn the page.
- Reserve now: a gold floating button on every page, above Talk with Shenba.
- Shenba stands on the home page (her full photo, cut out with soft edges). Tapping her plays her spoken intro straight on the page (cut out of its background, `img/shenba-intro-cut.webm`), then she settles into a large circle and the Talk widget opens over the home page with the booking card beside her. Her thank-you clips are cut out too. Safari plays the original clips with soft faded edges.
- Opening: guests choose "Enter with sound & mic" (soft breeze and wind chimes under the logo animation, and the microphone question) or "Enter quietly"; it carries on quietly after 12 seconds.

## v7.5 — 27 Oct 2026

**One website, no Lite/Desk switch** (Rakesh). The Lite / Desk switch at the top of the home page and of the photo-album page is removed. kutralamezhilagam.com opens only the main website (phones still get the lite site, as before). The wooden-desk photo album stays available on its own address, https://www.kutralamezhilagam.com/album, for sharing elsewhere; nothing on the main website links to it any more. Its Reserve, Talk and Chat buttons still work.

## v7.4 — 27 Oct 2026

**Duphora pill beside the logo on computers** (Rakesh). On the computer home page the "Powered by Duphora" pill now sits right next to the Kutralam Ezhilagam logo plate, lined up with its bottom edge so it clears the Lite/Desk switch and the Reserve buttons at every screen width. At the end of the opening the pill glides from under the logo straight into that place, instead of fading out. Phones unchanged.

## v7.3 — 27 Oct 2026

**Duphora is now the builder on the site** (Rakesh). The builder's pill now reads "Powered by" with the Duphora logo, in the logo opening and in the phone header, on the full site and the lite site. The receipt card (after payment and in My Bookings) and the booking voucher carry a small "Powered by Duphora" line at the foot. The previous builder's logo file is removed and its name appears nowhere on the site.

## v7.2 — 26 Oct 2026

**60% advance on the lite site** (Rakesh). On "Review & pay" the guest chooses once: "Pay in full" (Recommended, nothing to pay at the desk) or "Pay 60% now" (shows the balance to pay before check-in). Prime takes exactly 60% for the advance and records the booking as Partial Advance with the balance, so the check-in screen asks for the balance and the 4:15 PM pending-balance reminder lists it. The receipt shows "Advance paid" and the balance before check-in.

## v7.1 — 26 Oct 2026

**Pay on the same page, no second payment screen** (Rakesh). On the lite site, "Review & pay" now opens Razorpay right on the page. The old booking page no longer appears in between asking to pay again. Prime prices the stay, Razorpay takes the money, Prime writes the booking, and the guest lands on "You're booked!" with a receipt (booking ID, room, stay, guests, amount, Razorpay reference).
- Review & pay screen: progress pills (Room ✓ · Details · Pay), stay summary with "Change dates or guests", "Who's checking in?", price details and one button "Pay ₹X · Confirm room". The button tells the guest what is still missing ("Add your 10-digit WhatsApp number").
- WhatsApp number: +91 shown, pasted +91 or 0 removed, "✓ We'll send your voucher here" when it is right.
- Sign in with Google before paying (ready, switched on once the Google sign-in key is added): name and email filled in, "Welcome back, <name>" on the home page and on My Bookings, receipts of every stay listed.
- The payment choice is asked once. Prime collects the stay in full today, so the page says "Pay once, nothing at the desk"; the 60% advance option appears only when Prime takes advances.

## v7.0 — 26 Oct 2026

**New lite site for phones** (Rakesh). Phones opening kutralamezhilagam.com now go to `/lite`, which plays the same logo intro and then opens a new maroon-and-beige page:
- A short introduction to the hotel with the full building photo, four highlights, and a room carousel that crossfades through all nine rooms with the nightly rate, a one-line description and the features of each.
- Tabs at the top (Home, Rooms, Favorites, Bookings) and two big buttons at the bottom that stay on screen: Talk with Shenba and Reserve Now.
- Reserve Now opens the dates on the home page (calendar with a sweep animation), then the guests (Adult / Teenager / Children), then shows only the rooms that are free on those dates and sleep the group, in Budget (studios) and Luxury (suites), with a Budget pick and a Luxury pick worked out the same way as the booking page.
- Payment: Pay in full is chosen by default and marked Recommended; the 60% advance shows the balance to be paid before check-in. Reserve Now · Pay opens the same secure Razorpay checkout as the booking page, with the rooms, dates and guest already filled in, so Prime writes the booking and the voucher goes out as before.
- Aambal and Shenbagam never offer A/C. Free rooms come live from Prime (publicAvail); rates are the booking page's own.
- "Full website" at the foot of the lite page (or `?full=1`) keeps the full site for the rest of the visit; links with #talk, #chat and the rest still open the full site.

**Payment page in the website colours.** `/pay` (the page Shenba's links open) is now maroon instead of green, with the same fonts as the lite site, and Razorpay's checkout window uses the maroon too.

**Booking page.** Accepts the rooms, A/C, payment choice, name and number from the lite site and opens the checkout straight away. The advance line now reads "balance before check-in".

## v6.8 — 26 Oct 2026

**Shenba's first words are heard** (Rakesh). On phones, tapping Talk started her intro and opened the microphone at the same moment; opening the mic switches the phone's speaker into call mode, which swallowed the first few seconds of her voice. Now the microphone opens first (the "allow microphone" question comes first on a first visit), the phone gets half a second to settle, and only then does she start speaking — so her greeting is heard from the first word. If the microphone is refused she still greets and the call explains how to allow it.

## v6.7 — 26 Oct 2026

**A smile while rooms are checked** (Rakesh). Instead of "Checking what is free…" the guest sees one of 24 polite, warm lines picked at random and changing every few seconds — e.g. "Peeking into our nine rooms for you…", "Fluffing the pillows while we check your dates…", "Brewing a fresh filter coffee while we look… ☕", "Placing jasmine at the door while we look… 🌼", "One moment — saving you the best stay in Courtallam…". The same lines show on the "Find available rooms" button while it waits.

## v6.6 — 26 Oct 2026

**PIN code before City** (Rakesh). The PIN code box now comes above City, so the city fills itself as soon as the 6th digit is typed ("City filled from the PIN code — change it if needed"; 641001 → Coimbatore, 600088 → Chennai). Changing the PIN updates a city it filled; a city the guest typed is never replaced. Typing the city first still offers the suggestions list and fills the PIN.

## v6.5 — 26 Oct 2026

**City suggestions and PIN filled for you** (Rakesh). As the guest types the city, a list drops down under the box — Tamil Nadu and nearby-state towns first, then the rest of India, each group A to Z ("c" shows Chengalpattu, Chennai, Chidambaram, Coimbatore …; "co" shows Coimbatore, Colachel, Coonoor, Courtallam). Tapping a city fills the PIN code with that city's head post office PIN from India Post ("PIN of Coimbatore head post office — change it if yours is different"). A PIN the guest typed is never overwritten, and typing a PIN with the city empty fills the city (627811 → Tenkasi). If India Post is slow or offline nothing is blocked — the guest just types it. City list: js/cities.js (1,264 Indian cities and towns).

## v6.4 — 26 Oct 2026

**WhatsApp number checked as you type** (Rakesh). The box takes numbers only (letters and spaces are dropped, the phone shows the number pad), a pasted +91 or leading 0 is removed, and it stops at 10 digits. A line under the box shows "5 of 10 digits", "✓ 10 digits", or "A mobile number starts with 6, 7, 8 or 9". Continue to payment only goes ahead with a real 10-digit mobile number. PIN code also takes numbers only.

## v6.3 — 26 Oct 2026

**No street address on the booking form** (Rakesh). Step 2 now asks only for name, WhatsApp number, city and PIN code. The full address is on the original photo ID every adult shows at check-in, so the guest is not asked for it twice; city and PIN still go to the booking sheet as before.

## v5.8 — 25 Oct 2026

**Rooftop wording** (Rakesh). "Blue-lit rooftop terrace" is now **"Spacious rooftop terrace"**; the description now reads "A spacious open terrace under a pergola for the whole family to relax together, with soft ambient lights in the evening and the hills all around." The welcome line says "relax with your family on the spacious rooftop terrace in the evening", and the photo description matches.

## v5.7 — 25 Oct 2026

**No pool — corrected.** The hotel has no pool; the rooftop has soft blue ambient lights. "Rooftop plunge pool" is now "Blue-lit rooftop terrace" ("An open terrace under a pergola, glowing with soft blue ambient lights after dark — a calm place to sit out in the evening with the hills all around"), the welcome line says "unwind on the blue-lit rooftop terrace in the evening" instead of "swim in the rooftop plunge pool", and the photo's description is corrected in both places.

## v5.6 — 25 Oct 2026

**Opening ends with a glide** (Rakesh). When the logo animation finishes, the Kutralam Ezhilagam logo glides from the centre to its place at the top-left corner and the Powered by Duphora pill glides to the top-right corner, while the white screen fades away behind them. On a computer the logo glides to its top-left plate and the pill fades out (the computer header has no pill). Skip does the same glide.

## v5.5 — 25 Oct 2026

**Phone header** (Rakesh). The Kutralam Ezhilagam logo moves to the left end and does what the bar icon did — tap it to go back to the top. The bar icon is gone on phones. The **Powered by Duphora** pill sits at the top right on the same line; the menu button sits just before it. Computer layout unchanged.

## v5.4 — 25 Oct 2026

**Floor and "No lift" on every booked room** (Rakesh). First- and second-floor rooms say "No lift" next to the room name: on the room list, on the Pay step (room name, floor, red NO LIFT tag), on the voucher card ("Room: Marutham · Second floor · No lift"), on the voucher picture (one line per room), in the note to the front desk, and on voucher.html. Room names sent to the sheet are unchanged.

## v5.3 — 25 Oct 2026

**One pay button.** The big "Pay ₹… · UPI, Card or Net Banking" button in the page is removed; only the bottom "Pay ₹… securely" button stays (Rakesh). Just above it: "Pay securely with Razorpay", the ways to pay (UPI, card, net banking) and the booking reference.

## v5.2 — 25 Oct 2026

**Razorpay is the only way to pay on the booking page** (Rakesh). The "Pay with any UPI app" button, the UPI QR code and the "type the last 4 digits of the UPI reference" box are gone. One button, "Pay ₹… · UPI, Card or Net Banking", opens Razorpay checkout; the footer button does the same. UPI is now switched ON inside Razorpay (it was off since 2 Sep, when UPI went to the hotel's own handle), so guests can still pay by GPay/PhonePe/any UPI app through Razorpay. Razorpay charges its usual fee on UPI payments. The booking is written only after Razorpay confirms the payment, as before.

## v5.1 — 25 Oct 2026

**Guest details: ID questions removed.** The booking form no longer asks "ID you will bring" or "Last 4 digits of that ID" (Rakesh). It now says to bring an original photo ID for every adult, checked at the desk. The booking still sends empty ID fields, so the sheet's columns are unchanged.

## v5.0 — 25 Oct 2026

**"Live with Nature" redesign, phone and computer** (Rakesh approved the preview, 14:35). Modelled on tandjungsarihotel.com: sand paper, a taupe rail, Caslon type, small red capitals for labels.
- **Logo opening:** the site starts with the Kutralam Ezhilagam logo animation (`img/logo-intro.mp4`, cut from the logo outro), a red line, "Courtallam · Live with Nature" and a **Powered by Duphora** pill (`img/duphora.webp`), then lifts away. Once per visit, Skip button, never on a #talk / #chat link, off for reduced motion.
- **Home:** the photo slider fills the screen with "Live with Nature" over it; welcome text and the rating badges; four spaces (hill view, rooftop pool, suites, A/C); **rooms carousel** of all nine rooms with their own photos (`img/rooms/`), arrows, drag/swipe and a red progress line; dark footer. A menu slides in from the rail. The page scrolls again.
- **Always on screen:** Talk with Shenba floats in her own card (face, title, mic); Reserve now and Chat with Shenba stay at the top right on a computer and in a bar at the bottom on a phone.
- **Reservation panel:** Reserve now drops a sand panel with Arrival, Departure, Adults, Children; each opens with an unfolding dropdown (calendar for dates). Check rates opens `book.html?ci=&co=&ad=&ch=`.
- **Booking page:** reads those values and skips the dates/guests questions; restyled in the same colours and type. Every step, payment and booking is unchanged.
All the old page's working parts (slider, Shenba talk and chat, call window) are moved into the new layout, not rebuilt.

## v4.1 — 25 Oct 2026

**Every guest page now has a computer layout; phones are unchanged.** On screens 1024px and wider:
- **Booking page (Reserve now):** a hotel photo panel holds the left of the screen (logo, "Nine rooms, a short walk from the Main Falls", what the rooms are, both phone numbers, Chat with Shenba, the house rules). The booking works on the right: the four steps as big tabs; your stay and the AC choice side by side; rooms in two columns that lift on hover (photo preview still shows); the details form in two columns; on Pay, what you are paying for on the left and the UPI / card buttons on the right; the voucher at its own width. The Continue bar sits under the right-hand column, and "Photos & walkthrough" opens as a drawer from the right.
- **Checkout page (Shenba's payment link):** the same photo panel, with a bigger room picture and the four highlights in one row.
- **Voucher page:** the same photo panel, with the voucher beside it. Printing still prints only the voucher.
- **Chat with Shenba:** opens as a full-height panel down the right side instead of a box in the middle.
Same steps, same buttons, same payment and booking code — the change is layout only. The A4 check-in slip is for printing and is unchanged.

## v4.0 — 25 Oct 2026

**A computer gets its own home page; the phone page is unchanged.** On screens 1024px wide and up, the room photos fill the whole screen and wipe from one to the next, with the room thumbnails and arrows along the foot. On the left, where the eye lands first: "Comfortable stay near Courtallam Main Falls", the nine rooms in one line, the A/C, family and power-backup chips, then **Reserve now** (green) and **Chat with Shenba** (white) side by side. On the right, Talk with Shenba is a concierge card: her face much larger with gold rings pulsing out, a "Voice assistant · Tamil & English" tag, rotating "Try saying…" examples (one in Tamil), and a **Tap to talk** button that turns green with a moving sound wave while she listens. Logo on a white plate (lens still gliding), the two numbers as glass buttons, rating badges cycling on the right; date, daily quote, house rules and address kept. Still one screen, no scrolling. Everything is in one `@media (min-width:1024px)` block plus four desktop-only elements hidden on phones.

## v3.4 — 25 Oct 2026

**ElevenLabs credits kept low.** The live call has a hard stop at 15 minutes (was 60). At 7 minutes, if the booking card is still empty (no dates and guests, room, price or number), Shenba wraps up warmly — "இதுக்கு மேல WhatsApp-ல பேசலாமா?…" — and ends the call; a sheet then offers **WhatsApp-ல continue பண்ணுங்க** (WhatsApp Shenba, with the dates already known) or **இங்கேயே chat பண்ணுங்க** (Chat with Shenba), both free of voice credits. A booking on its way stays live; a minute before the 15-minute stop she finishes the hold / payment link or moves to WhatsApp. A call that reaches the stop without a booking also gets the WhatsApp/chat sheet.

## v3.3 — 25 Oct 2026

**Outro ends on the numbers.** After the logo outro the screen stays on its last frame: tap the Booking (99622 22415) or Reception (82483 20685) box to call that number; a small Home button at the bottom right goes back to the home page.

**Shenba's order on the website call.** Check-in date → how many people → rooms and prices at once → then she offers to send them on WhatsApp and asks for the number → name → hold and payment link. She asks for the number earlier only if the guest is just checking, goes quiet or is leaving. The moment the guest gives a number she notes the enquiry (create_enquiry), so the room photos and details go to the guest's WhatsApp while she keeps talking.

## v3.2 — 25 Oct 2026

**Talk with Shenba is back on the ElevenLabs live agent.** The call runs on the same Shenba agent as the phone line (voice Vennila, live room, price and booking tools), so she answers in a moment and the guest can talk over her naturally. Her talking intro still opens the call (the mic is muted until it ends) and the agent carries on from the check-in date, without greeting again. The booking card fills in from her show_booking_details tool and from Prime (voiceCard, with the payment link); Proceed to pay asks her to hold the room; when she ends the call the nandri video, thank-you card and logo outro follow. The website asks the agent for a 60-minute limit (the phone line keeps 4 minutes) once the agent allows it. If the live agent cannot start (no ElevenLabs credits, network), the call carries on on our own server exactly as before (Google + Leda backup). Client library kept in `js/eleven-client-1.28.0.js` (@elevenlabs/client 1.28.0, MIT; the max-duration override added). Chat with Shenba stays on our server.

## v3.1 — 25 Oct 2026

**Talk over Shenba again.** While she speaks, the mic keeps listening (the phone's echo cancelling removes her own voice). If the guest speaks over her for about a third of a second, she stops at once and the guest's words, recorded from the moment they began, go to her as the next turn — no need to wait for her to finish or to tap her face. Fillers are not interrupted.

## v3.0 — 25 Oct 2026

**Shenba answers sooner and says what she is doing.** No filler on quick turns (name, date, head count) unless her answer takes more than 2.4 seconds. When she is about to look up rooms (dates and guests known, no price yet) she says so at once ("check பண்ணிட்டு சொல்றேன்…", and once the new clips are added: "Availability check பண்றேன்…", "நீங்க கேட்ட dates-ல room available-ஆ-ன்னு பாக்குறேன்…", "ஒரு second, rooms check பண்றேன்…"), only once for the same dates and guests. Proceed to pay: "Room hold பண்றேன், ஒரு second…". The "ம்ம்…" and "சரி…" lines are no longer used and no line repeats twice in a row. When her answer is ready, a filler that is still playing fades out at once instead of finishing. The screen says "Checking availability…" / "One moment…" instead of "Shenba is thinking…". The new clips go in `audio/filler-*.mp3` (Vennila voice only; with the Leda voice the server's own lines are used).

## v2.9 — 25 Oct 2026

**Shenba's nandri video and the logo outro.** At the end of a call, Shenba's circle opens into her own avatar video on the balcony, saying nandri in her Vennila voice (a room-held version and an enquiry version, `img/shenba-nandri*.mp4`, about 320 KB each, played muted with her voice from `audio/shenba-nandri*.mp3`). The Kutralam Ezhilagam logo builds behind her with a see-through background, and her sides fade softly. The thank-you card then shows over her last frame. After about 6 seconds, or when the guest taps Close, the logo outro (`img/ezhilagam-outro.mp4`) plays, the call window closes and the guest is back on the home page. The ending videos are fetched 15 seconds into a call. If a video can't play, the old photo walk is used.

## v2.8 — 25 Oct 2026

**Shenba's talking intro.** Tapping "Talk with Shenba" now opens with Shenba herself on video: her ElevenLabs avatar, lip-synced in her own Vennila voice, standing in front of the full Ezhilagam building with the logo on top, saying "வாங்க! எழிலகம் room booking-க்கு help பண்ண நான் இருக்கேன், ஷென்பா. உங்க check-in date சொல்லுங்க?". The call connects while she speaks, the server is told what she has already said, then she shrinks into her circle and listens for the check-in date. The video (`img/shenba-intro.mp4`) is 715 KB with a 96 KB still frame, and only starts loading 4 seconds after the page opens. If a phone cannot play it, the v2.7 photo welcome and greeting run as before.

---

## v2.7 — 23 Oct 2026

**Vanakkam and nandri animation.** When a call starts, Shenba appears full size with joined hands and "வணக்கம்!", stays while she greets, then shrinks into her circle. When the call ends she steps out of the circle, walks towards the guest saying "நன்றி!" in her own voice (a room-held version and an enquiry version, `audio/shenba-nandri*.mp3`), and the thank-you card follows. Phones set to reduce motion skip the movement.

**Natural mouth.** While Shenba talks, her lips open well but glide smoothly from one shape to the next, instead of snapping wide open.

**Natural blinks.** Shenba blinks at uneven gaps, sometimes twice quickly; a warm slow blink when she first greets the guest, a blink when it is the guest's turn to talk, and slow thoughtful blinks with her head tipped a little while she is thinking.

---

## v2.6 — 22 Oct 2026

**Payment opens in the same page.** Tapping "Proceed to pay" no longer opens an empty new tab (on phones the call page
paused behind it and the tab stayed blank). The button shows "Holding your room…" while Shenba holds the room; when the
payment link is ready and she has finished her sentence, this page goes straight to the payment page. The website also
accepts calls from ezhilagambooking.netlify.app again.

---

## v2.5 — 22 Oct 2026

**ElevenLabs first.** Shenba's website calls (and WhatsApp voice notes) speak with the ElevenLabs voice of the phone agent
(Vennila) whenever ElevenLabs has credits, and with the tuned Google Leda voice when it does not. Each call keeps one voice
from start to end; the fillers come in the same voice as the call.

---

## v2.4 — 22 Oct 2026

**One voice, one Shenba.** Shenba's voice no longer changes mid-call: if Google's voice is busy she waits a moment and
tries her own voice again instead of handing over to a different backup voice; if it still cannot be made, her words
show on the call page. Every clip (greeting, fillers, replies) is levelled to the same loudness. She also keeps the same tone and slang from the first line to the goodbye (language can change,
the tone does not).

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
