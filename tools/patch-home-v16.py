#!/usr/bin/env python3
"""Homepage v1.6 layout (Rakesh, 20 Oct 2026).

Logo + contact strip on top, then a hero: Talk with Shenba card (largest),
Chat with Shenba (solid green), Book Room Now (outlined), and the real dusk
facade photo (right column on desktop, below the buttons on a phone).
The big name/subtitle is gone from view. Nothing floats over the page any
more, so nothing can cover anything. Every id the scripts use is kept.

Usage: python3 tools/patch-home-v16.py index.html
"""
import sys

P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()


def cut(s, start, end):
    i = s.index(start)
    j = s.index(end, i) + len(end)
    return s[:i], s[i:j], s[j:]


PHONE = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
         'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 '
         '1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 '
         '0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 '
         '1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>')
MIC = ('<span class="sa-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
       'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" '
       'height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/></svg></span>')

# ── 1. pull out the pieces that move ──────────────────────────────────────
pre, bar, post = cut(s, '<!-- Shenba, the property\'s voice assistant: the only voice launcher on the page -->\n<div class="sa-bar" id="saBar">', '</aside>\n</div>\n')
s = pre + post
_, chat, rest = cut(bar, '<button type="button" class="sa-chat" id="chatBtn">', '</button>\n')
_, dock, _ = cut(rest, '<aside class="sa-dock sa-anim" id="saDock"', '</aside>\n')
chat = chat.replace('<span>Chat with<b>Shenba</b></span>', '<span>Chat with <b>Shenba</b></span>')
dock = dock.replace('<small>Our voice assistant (AI)</small>',
                    '<small>Our voice assistant (AI) · Tap to talk</small>')
dock = dock.replace('<span class="sa-stat" id="saStat" aria-live="polite">Tap her face to talk</span>',
                    '<span class="sa-stat" id="saStat" aria-live="polite"></span>')
dock = dock.replace('  <button type="button" class="sa-min"', '  ' + MIC + '\n  <button type="button" class="sa-min"')

pre, mast, post = cut(s, '  <!-- ── Masthead', '  </header>\n')
s = pre + '@@MAST@@' + post
pre, book, post = cut(s, '  <!-- ── Calls to action', '  </a>\n')
s = pre + post
pre, calls, post = cut(s, '  <div class="callrow">', '  </div>\n')
s = pre + post
calls = calls.replace('<a class="call" href="tel:+919962222415"><small>Booking</small><b>99622 22415</b></a>',
                      '<a class="call" href="tel:+919962222415">' + PHONE + '<span><small>Booking</small><b>99622 22415</b></span></a>')
calls = calls.replace('<a class="call" href="tel:+918248320685"><small>Reception</small><b>82483 20685</b></a>',
                      '<a class="call" href="tel:+918248320685">' + PHONE + '<span><small>Reception</small><b>82483 20685</b></span></a>')
assert calls.count(PHONE) == 2

# ── 2. the new top of the page ────────────────────────────────────────────
new_top = (
    '  <!-- ── Masthead: logo + contact strip (v1.6) ─────────────────────────── -->\n'
    '  <header class="mast">\n'
    '    <img src="img/logo.webp" alt="Kutralam Ezhilagam" width="200" height="69">\n'
    '    <h1 class="sr">Kutralam Ezhilagam · Comfortable Stay near Courtallam Main Falls</h1>\n'
    + calls.replace('  <div class="callrow">', '    <div class="callrow">').replace('\n  </div>', '\n    </div>') +
    '  </header>\n\n'
    '  <!-- ── Hero: Talk, Chat, Book + the building ────────────────────────── -->\n'
    '  <section class="hero" aria-label="Book with Shenba">\n'
    '    <div class="hero-act">\n'
    '<div class="sa-bar" id="saBar">\n' + dock + chat + '</div>\n'
    + book.replace('  <!-- ── Calls to action ──────────────────────────────────────────────── -->\n', '') +
    '    </div>\n'
    '  </section>\n\n'
    '  <div class="more">\n  <div class="more-l">\n'
)
s = s.replace('@@MAST@@', new_top)
s = s.replace('  <p class="sr" id="live" aria-live="polite"></p>\n',
              '  <p class="sr" id="live" aria-live="polite"></p>\n  </div>\n  <div class="more-r">\n', 1)
s = s.replace('  </footer>\n</div>\n', '  </footer>\n  </div>\n  </div>\n</div>\n', 1)

# ── 3. styles (appended, so the old rules stay readable above) ────────────
CSS = r'''
/* ══ v1.6 homepage layout ═══════════════════════════════════════════════
   Logo and numbers on top; the three actions in order of weight (Talk,
   Chat, Book); the real facade beside them on a wide screen and under them
   on a phone. Shenba no longer floats, so nothing on the page is covered. */
body{background:#fff}
.wrap{max-width:480px;padding:18px 16px 36px}
.mast{display:flex;flex-direction:column;align-items:center;gap:14px;margin:0 0 18px}
.mast img{height:54px;width:auto;margin:0}
.mast .callrow{width:100%;margin:0}
.call{display:flex;align-items:center;justify-content:center;gap:10px;text-align:left;
  border-color:#eceae8;box-shadow:0 2px 10px rgba(28,25,23,.05);padding:10px 12px}
.call svg{width:34px;height:34px;flex:0 0 auto;padding:8px;border-radius:50%;background:#ecfdf5;color:var(--brand)}
.call b{margin-top:1px;font-size:15.5px;white-space:nowrap}
.call span{min-width:0}
@media (max-width:440px){.call{gap:8px;padding:10px 8px}.call svg{width:28px;height:28px;padding:6px}.call b{font-size:14.5px}}
.call:hover{border-color:#a7f3d0}

.hero{display:flex;flex-direction:column;gap:16px;margin:0 0 26px}
.hero-act{display:flex;flex-direction:column;gap:12px}
.hero .sa-bar,.hero .sa-bar.dodge{position:static;transform:none;width:auto;left:auto;right:auto;top:auto;bottom:auto;
  display:flex;flex-direction:column;align-items:stretch;gap:12px;pointer-events:auto}
.hero .sa-dock,.hero .sa-dock.mini{padding:16px 16px 16px 14px;gap:16px;border-radius:22px;cursor:pointer;
  background:linear-gradient(135deg,#fffaf3,#fff1dd);border:1.5px solid #f1d3a6;
  box-shadow:0 14px 34px rgba(120,72,10,.12)}
.hero .sa-face,.hero .sa-dock.mini .sa-face{width:92px;height:92px;box-shadow:0 0 0 4px #fff,0 0 0 7px #f3d7b0}
.hero .sa-dock.on .sa-face{box-shadow:0 0 0 4px #fff,0 0 0 7px var(--brand)}
.hero .sa-dock.speaking .sa-face{box-shadow:0 0 0 4px #fff,0 0 0 7px var(--gold-lt)}
.hero .sa-txt,.hero .sa-dock.mini .sa-txt{display:block;flex:1}
.hero .sa-txt b{font-size:22px;line-height:1.15;color:#9a4a07;white-space:normal;font-weight:800}
.hero .sa-txt small{display:block;margin-top:4px;font-size:13px;white-space:normal;color:#78716c}
.hero .sa-stat{font-size:13px}
.hero .sa-stat:empty{display:none}
.hero .sa-min{display:none}
.sa-go{flex:0 0 auto;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;
  background:var(--gold);color:#fff;box-shadow:0 6px 16px rgba(180,83,9,.32)}
.sa-go svg{width:22px;height:22px}
.hero .sa-chat{justify-content:center;gap:10px;min-height:58px;padding:14px 18px;border-radius:16px;
  background:var(--brand);font-size:16.5px;font-weight:800;animation:none;
  box-shadow:0 10px 22px rgba(4,120,87,.28)}
.hero .sa-chat b{display:inline;font-size:inherit}
.hero .sa-chat:hover{background:var(--brand-dk)}
.hero .cta-book{margin:0;min-height:56px;background:#fff;color:var(--brand);border:1.5px solid var(--brand);box-shadow:none}
.hero .cta-book:hover{background:#ecfdf5}
.hero-pic{margin:0;border-radius:20px;overflow:hidden;background:#e9e6e2;aspect-ratio:4/3;
  box-shadow:0 18px 40px rgba(28,25,23,.14)}
.hero-pic img{display:block;width:100%;height:100%;object-fit:cover}

.more-l .gal{margin-bottom:16px}
@media (max-width:360px){.hero .sa-face{width:76px;height:76px}.hero .sa-txt b{font-size:19px}.sa-go{display:none}}

@media (min-width:900px){
  .wrap{max-width:1120px;padding:26px 32px 48px}
  .mast{flex-direction:row;justify-content:space-between;margin-bottom:28px}
  .mast img{height:60px}
  .mast .callrow{width:auto;grid-template-columns:repeat(2,minmax(210px,auto));gap:12px}
  .hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:36px;align-items:center;margin-bottom:40px}
  .hero-act{justify-content:center;gap:14px}
  .hero .sa-dock{padding:22px 22px 22px 18px;gap:20px}
  .hero .sa-face{width:116px;height:116px}
  .hero .sa-txt b{font-size:27px}
  .hero .sa-txt small{font-size:14px}
  .sa-go{width:54px;height:54px}
  .more{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:36px;align-items:start}
  .more-l .gal{margin:0}
}
'''
CSS = CSS + '\n/* ══ v1.6b: one screen, no scrolling ═══════════════════════════════════\n   Rakesh, 20 Oct 2026: no facade block, and the page must not scroll.\n   The page is exactly the height of the screen; the photo slider takes\n   whatever height is left, and on short screens the smaller extras step\n   aside (trust strip first, then amenities) instead of pushing past the\n   bottom. A phone held sideways is too short for that, so it may scroll. */\nhtml,body{height:100%;overflow:hidden}\n.wrap{height:100vh;height:100dvh;display:flex;flex-direction:column;\n  padding:max(12px,env(safe-area-inset-top)) 16px max(10px,env(safe-area-inset-bottom))}\n.mast{gap:10px;margin:0 0 12px;flex:0 0 auto}\n.mast img{height:44px}\n.call{min-height:0;padding:8px 10px}\n.hero{margin:0 0 12px;flex:0 0 auto}\n.hero-act,.hero .sa-bar{gap:10px}\n.hero .sa-dock,.hero .sa-dock.mini{padding:12px 14px 12px 12px;gap:14px}\n.hero .sa-face,.hero .sa-dock.mini .sa-face{width:78px;height:78px}\n.hero .sa-txt b{font-size:20px}\n.hero .sa-chat{min-height:52px;padding:12px 16px}\n.hero .cta-book{min-height:50px;padding:12px 16px}\n.more{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:10px}\n.more-l{flex:1 1 auto;min-height:0;display:flex}\n.more-l .gal{flex:1;margin:0;aspect-ratio:auto;height:auto;min-height:0}\n.more-r{flex:0 0 auto;display:flex;flex-direction:column;gap:8px}\n.amen{margin:0;gap:6px}\n.amen li{padding:7px 4px;display:flex;align-items:center;justify-content:center;gap:6px}\n.amen .ico{font-size:16px}\n.amen .txt{margin:0;font-size:10.5px;text-align:left}\n.trust{margin:0;padding:8px 12px}\n.trust img{height:30px}\n.trust p{font-size:11px;line-height:1.35}\nfooter{padding-top:8px}\n.notice{margin:0 0 4px;font-size:11px;line-height:1.45}\n.addr{font-size:10.5px;line-height:1.4}\n@media (max-width:899px) and (max-height:860px){.trust{display:none}}\n@media (max-width:899px) and (max-height:760px){.amen{display:none}.mast img{height:38px}\n  .hero .sa-face,.hero .sa-dock.mini .sa-face{width:64px;height:64px}.hero .sa-txt b{font-size:18px}}\n\n@media (min-width:900px){\n  .wrap{max-width:1180px;padding:22px 32px 18px;display:grid;\n    grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);grid-template-rows:auto 1fr auto;\n    grid-template-areas:"mast mast" "gal act" "gal info";column-gap:36px}\n  .mast{grid-area:mast;margin-bottom:18px}\n  .hero{grid-area:act;margin:0 0 16px;display:block;align-self:center}\n  .more{display:contents}\n  .more-l{grid-area:gal;min-height:0}\n  .more-r{grid-area:info;justify-content:flex-end;gap:10px;min-height:0}\n  .hero .sa-face{width:104px;height:104px}\n  .hero .sa-txt b{font-size:26px}\n  .hero .sa-chat{min-height:56px}\n  .hero .cta-book{min-height:54px}\n  .amen li{padding:10px 6px}\n  .amen .txt{font-size:11.5px}\n  footer{text-align:left}\n}\n@media (min-width:900px) and (max-height:700px){.trust{display:none}}\n@media (max-height:520px){html,body{height:auto;overflow:auto}.wrap{height:auto}.more-l .gal{aspect-ratio:4/3}}\n'
anchor = '/* A phone set to reduce motion gets no auto-advance'
assert s.count(anchor) == 1
s = s.replace(anchor, CSS.strip() + '\n\n' + anchor)

# ── 4. the whole Talk card opens the call, not only her face ──────────────
js_anchor = 'face.addEventListener("click", async () => { await endChat(); openCall(true); });\n'
assert s.count(js_anchor) == 1
s = s.replace(js_anchor, js_anchor +
    'dock.addEventListener("click", e => { if (!face.contains(e.target) && !$("saMin").contains(e.target)) face.click(); });\n')

# nothing floats any more, so the old "room for Shenba" under the page goes
s = s.replace('padding:22px 16px 112px} /* room under the last line for Shenba */',
              'padding:22px 16px 36px}')

open(P, "w", encoding="utf-8").write(s)
print("patched", P)
