KUTRALAM EZHILAGAM — GUEST WEB FOLDER
=====================================================================
Drag this WHOLE folder onto Netlify. img/ must travel with it.

  index.html         the digital visiting card — the FRONT DOOR
  book.html          the booking wizard
  checkin-slip.html  the desk's A4 check-in slip, for printing
  _redirects         Netlify routing — small file, do not delete
  img/               logo, photographs, Justdial award


---------------------------------------------------------------------
1. THE LINK YOU SHARE IS THE BARE ADDRESS
---------------------------------------------------------------------
   https://your-site.netlify.app

   No file name on the end. Netlify serves index.html at the root and
   nothing else, which is why the visiting card IS index.html and the
   booking wizard was renamed to book.html.

   That is the whole trick. If you ever want to swap them back you
   must change TWO things together:
       the file names, AND
       BOOKING_PAGE inside index.html
   Change only the names and Book Room Now points at itself: the
   button appears to do nothing when tapped.

   _redirects handles the rest:
     /card.html  ->  the root, 301, so any card link you already sent
                     out keeps working instead of showing "Page not
                     found"
     /book       ->  the booking wizard, a short link worth reading
                     out over the phone

   Netlify only reads _redirects from the TOP of the published
   folder. If you drag a folder that contains this folder, it stops
   working. Drag the folder whose contents are index.html, book.html
   and img/ — not its parent.


---------------------------------------------------------------------
2. ADDING OR CHANGING A PHOTOGRAPH
---------------------------------------------------------------------
   Three steps, in this order:

   a. Put the file in img/
   b. Open card.html, find the SLIDES list near the bottom, add a line:

          { src:"img/suite-living.webp",
            alt:"The suite living room, with the hills through the window" },

      alt is what somebody with images turned off gets instead of the
      picture. Describe the room. Do not write "photo 3".

   c. Re-drag the whole folder onto Netlify.

   The order of the list is the order on the card. The first one is
   the one that loads before the guest sees anything, so put your best
   photograph first.

   KEEP EACH FILE UNDER ABOUT 300 KB. These are opened on a phone
   signal at the falls. A 4 MB photograph straight off a camera will
   make the card look broken for several seconds, which is the moment
   the guest decides whether to bother.
   Convert with: https://squoosh.app  (WebP, quality 75, width 1200)

   A file that is missing or misnamed does not leave a broken-image
   box on the card — the slide drops out and the dots renumber.


---------------------------------------------------------------------
3. THE DATE AND THE DAILY QUOTE
---------------------------------------------------------------------
   Today's date sits at the top of the photograph so the card always
   reads as current, even to somebody opening a link you sent a
   fortnight ago. It is computed in Courtallam's time zone, not the
   guest's, so a booking enquiry from the Gulf still sees your date.

   Underneath is one quotation, chosen by the date. Every phone shows
   the same line on the same morning, and it changes at midnight IST.
   Thirteen quotes, so it comes round every thirteen days.

   To change the list, edit QUOTES in card.html.

   ONE RULE, and it is the one the daily flier already settled: only
   put real quotations in, and name the author correctly. A card that
   puts words in somebody's mouth is worse than a card with no quote.
   Three lines that appear on hotel pages everywhere are misattributed
   and are deliberately NOT in the list: "The earth has music for
   those who listen" (not Shakespeare), "Water is the driving force of
   all nature" (not da Vinci), and "Nature does not hurry, yet
   everything is accomplished" (not in the Tao Te Ching).

   A long quote is shrunk automatically until it stops covering the
   photograph, down to a floor of 12px. You do not have to count
   characters.


---------------------------------------------------------------------
4. HOW THE ROTATION BEHAVES
---------------------------------------------------------------------
   Advances every 4.5 seconds; change INTERVAL_MS in card.html.

   Eleven photographs at 4.5 seconds is about fifty seconds to see
   them all, and almost nobody stands on a visiting card that long.
   The first four or five are the ones that will actually be seen, so
   they are the facade, the hills through the window, the balcony and
   the pool. Trimming the list would make each one likelier to be
   seen; the order matters more than the count.

   It stops for good the moment the guest touches, swipes, scrolls or
   uses the arrows. That is deliberate — resuming would move the
   photograph out from under somebody still looking at it.

   A phone set to "reduce motion" gets no rotation at all, only swipe.
   For some people this is a medical setting, not a preference.

   One photograph in the list = no dots, no arrows, no rotation.


---------------------------------------------------------------------
5. THE BOOKING PAGE  (book.html)
---------------------------------------------------------------------
   N8N_WEBHOOK near the top is still blank; paste the n8n Production
   webhook URL there when you are ready.

   INCLUDED, a few lines below it, is the line printed on the voucher
   under "Included". It is the one thing on the card a guest can hold
   the desk to, so read it once. Blank it and the row is not drawn.

   WHERE THE MONEY GOES
   CFG.UPI is a list, and the FIRST one is what the guest gets:

     9840213184@hdfc        HDFC, the default
     9840213184@okbizaxis   Google Pay Business, the second button

   Reorder that list and you have moved every guest payment to a
   different bank account. There is no other switch.

   The page draws its own QR with the amount already in it, so the
   guest cannot mistype the figure. That is why the printed HDFC QR is
   not used here — a static code has no amount on it, and a guest
   typing 289 instead of 2,899 becomes a payment nobody can match.

   The HDFC handle is a PERSONAL one. Two things follow:

     * The guest's app shows "V P RAKESH", not the hotel. The page now
       says so first, in its own words, rather than letting them meet
       it cold on the payment screen. If the name on the account ever
       changes, change it in CFG.UPI too or the page is telling guests
       something untrue.
     * It carries no merchant category, so the page sends no mc and no
       tr for it and does not push the guest into Google Pay. Both are
       deliberate: some apps reject merchant fields on a personal
       address, and Google Pay is the app that would not approve the
       other handle.

   RECONCILING
   A booking is written with whatever reference the guest types. It
   only ties itself to real money when a credit notification for THAT
   account reaches the watched phone and lands in the Gpay tab. Adding
   a handle to CFG.UPI does not add it to the phone macro. If HDFC
   credits are not being forwarded, payments still arrive safely in
   the bank — but the sheet will show the booking as unmatched, and
   somebody has to reconcile it against the HDFC statement by hand.

   THE VOUCHER AFTER PAYMENT
   The confirmation screen is HTML and appears immediately — measured
   at about a quarter of a second after the desk phone sees the money,
   down from two and a half seconds. Three things make that true and
   all three are easy to undo by accident:

     * The security token and the two images are fetched the moment
       the ROOM IS HELD, not after payment confirms. By the time the
       money lands they are already in hand. Do not move warmVoucher()
       later in the flow.
     * The big canvas voucher is drawn only when the guest taps
       Download, and is then kept, so the n8n hand-off reuses it
       instead of drawing a second one.
     * The picture sent to n8n is built in idle time. Nothing is
       waiting on it.

   voucher.html is the same card as a standalone page with sample
   data — useful for showing somebody the design, or printing one by
   hand. It is not part of the booking flow.


---------------------------------------------------------------------
6. THE CHECK-IN SLIP  (checkin-slip.html)
---------------------------------------------------------------------
   Open it and press Print. A4, portrait, margins "Default", and turn
   OFF "Headers and footers" or Chrome prints the file path across
   the top of every slip.

   It is deliberately NOT linked from card.html: it carries the extra
   charges and the caution deposit, which is desk information. It is
   marked noindex, but that only asks search engines nicely — do not
   put the URL anywhere a guest can read it.


---------------------------------------------------------------------
7. RELEASING A NEW BUILD
---------------------------------------------------------------------
   ./release.sh minor "what changed, in one line"

   That bumps VERSION, writes the changelog entry, refreshes
   BUILD-MANIFEST.txt and produces ezhilagam-site-v<N>.zip. It stops
   there on purpose. The two steps that reach the outside world are
   done by hand so the sender and the link can be checked first:

     1. The zip goes into  G:\My Drive\Ezhilagamweb  with the version
        in the file name. Drive for Desktop uploads it — allow about a
        minute, and check the size in Drive matches before trusting
        the link. Take the link to the FILE, never to the folder: a
        folder link shows whoever opens it every build ever made, and
        does not download the one that was just announced.

     2. ONE WhatsApp to 9840213184, from rockyjio, carrying the
        version, the one-line changelog and that link together.

   THE SENDER IS THE PART THAT GOES WRONG.
   The message must come from rockyjio, not from the booking number.
   Whoever sends it must pass by:"rakesh" in lowercase, because that
   is the staff name rockyjio is mapped to. "Rakesh" with a capital R
   matches nothing, and rather than failing it falls through to
   Lakshmi — so the build note arrives from 99622 22415, the number
   guests reply to. It has already happened once.

   The reply is only {"ok":true,"row":N} and does not name the
   instance, so check ?action=evostatus first and confirm rockyjio
   still maps to staff "rakesh" and is open.

   A zip that lands in Drive inherits no sharing: it is private to the
   ezhilagamcottage account. Opened from any other Google account the
   link asks for access. Share it deliberately if it ever has to go
   further than that.
