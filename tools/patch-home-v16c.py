#!/usr/bin/env python3
"""Homepage v1.6 step 2 (Rakesh, 20 Oct 2026): run after patch-home-v16.py.

Phone: Book Room Now right under the numbers, then the photo slider, then
Talk with Shenba and Chat with Shenba. Computer layout is unchanged.
Slider style D: each photo wipes in from the right over the last one, with
a strip of thumbnails underneath; swipe still works and a tap still opens
the photo full size.

Usage: python3 tools/patch-home-v16c.py index.html
"""
import sys

P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()

s = s.replace('  <p class="sr" id="live" aria-live="polite"></p>\n  </div>\n',
              '  <div class="thumbs" id="thumbs" aria-label="Choose a photograph"></div>\n'
              '  <p class="sr" id="live" aria-live="polite"></p>\n  </div>\n', 1)
assert 'id="thumbs"' in s

REPL = [
 ('  btn.addEventListener("click", () => openFull(im.src, im.alt));',
  '  btn.addEventListener("click", () => { if (swiped) { swiped = false; return; } openFull(im.src, im.alt); });'),

 ("    dots.appendChild(d);\n  }\n  mark();\n}",
  """    dots.appendChild(d);
  }
  /* v1.6: the thumbnail strip under the photo, one per slide */
  const th = $("thumbs");
  if (th) {
    th.textContent = "";
    slides().forEach((f, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show photograph " + (i + 1));
      const im = document.createElement("img");
      im.src = f.querySelector("img").src; im.alt = ""; im.loading = "lazy"; im.decoding = "async";
      b.appendChild(im);
      b.addEventListener("click", () => { stop(); go(i); });
      th.appendChild(b);
    });
  }
  mark();
}"""),

 ("""function go(i, smooth = true){
  const all = slides();
  if (!all.length) return;
  at = (i + all.length) % all.length;
  track.scrollTo({
    left: all[at].offsetLeft - track.offsetLeft,
    behavior: (smooth && !calm) ? "smooth" : "auto"
  });
  mark();
}""",
  """/* v1.6 slider D: the next photo wipes in over the last one. */
let swiped = false;
function go(i, smooth = true){
  const all = slides();
  if (!all.length) return;
  const old = at;
  at = (i + all.length) % all.length;
  all.forEach((s, k) => { s.classList.remove("prev"); if (k !== at) s.classList.remove("on"); });
  if (old !== at && all[old]) all[old].classList.add("prev");
  const cur = all[at];
  if (!cur.classList.contains("on")) {
    cur.classList.toggle("instant", !(smooth && !calm));
    void cur.offsetWidth;
    cur.classList.add("on");
  }
  mark();
}"""),

 ("""  live.textContent = "Photograph " + (at + 1) + " of " + slides().length;
}""",
  """  live.textContent = "Photograph " + (at + 1) + " of " + slides().length;
  const th = $("thumbs");
  if (th) {
    [...th.children].forEach((b, i) => b.setAttribute("aria-current", i === at ? "true" : "false"));
    const b = th.children[at];
    if (b) th.scrollTo({ left: b.offsetLeft - th.offsetLeft - (th.clientWidth - b.clientWidth) / 2,
                         behavior: calm ? "auto" : "smooth" });
  }
}

/* swipe left / right on the photo */
let sx = null;
track.addEventListener("pointerdown", e => { sx = e.clientX; }, { passive:true });
track.addEventListener("pointerup", e => {
  if (sx == null) return;
  const dx = e.clientX - sx; sx = null;
  if (Math.abs(dx) > 40) {
    swiped = true; stop(); go(at + (dx < 0 ? 1 : -1));
    setTimeout(() => { swiped = false; }, 400);
  }
}, { passive:true });
track.addEventListener("pointercancel", () => { sx = null; }, { passive:true });"""),

 ("rebuildDots();\nstart();\n</script>", "rebuildDots();\ngo(0, false);\nstart();\n</script>"),
]
for old, new in REPL:
    assert s.count(old) == 1, old[:70]
    s = s.replace(old, new)

CSS = """/* ══ v1.6c: slider D (wipe + thumbnails) and the phone order ══════════════ */
.track{display:block;position:relative;overflow:hidden;scroll-snap-type:none}
.slide{position:absolute;inset:0;clip-path:inset(0 0 0 100%)}
.slide.on{clip-path:inset(0 0 0 0);z-index:2;transition:clip-path 1s cubic-bezier(.77,0,.18,1)}
.slide.on.instant{transition:none}
.slide.prev{clip-path:inset(0 0 0 0);z-index:1}
.slide.on img{animation:kbZoom 7s ease-out both}
@keyframes kbZoom{from{transform:scale(1.07)}to{transform:scale(1)}}
.dots{display:none}
.quote{margin:0;padding-bottom:16px}
.more-l{flex-direction:column;gap:8px}
.thumbs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;flex:0 0 auto;padding:3px}
.thumbs::-webkit-scrollbar{display:none}
.thumbs button{flex:0 0 64px;height:46px;padding:0;border:0;border-radius:9px;overflow:hidden;cursor:pointer;
  background:#e9e6e2;opacity:.5;outline:2px solid transparent;outline-offset:1px;transition:opacity .3s,outline-color .3s}
.thumbs button[aria-current="true"]{opacity:1;outline-color:var(--brand)}
.thumbs img{display:block;width:100%;height:100%;object-fit:cover}
@media (max-width:899px){
  .wrap{gap:10px}
  .mast,.hero{margin:0}
  .hero,.hero-act,.more{display:contents}
  .mast{order:0}
  #bookBtn{order:1;flex:0 0 auto}
  .more-l{order:2}
  .hero .sa-bar{order:3;flex:0 0 auto}
  .more-r{order:4}
}
@media (max-width:899px) and (max-height:700px){.thumbs{display:none}}
@media (min-width:900px){.thumbs button{flex-basis:76px;height:54px}}

"""
anchor = '/* A phone set to reduce motion gets no auto-advance'
assert s.count(anchor) == 1
s = s.replace(anchor, CSS + anchor)

open(P, "w", encoding="utf-8").write(s)
print("patched", P)

# ── Google Reviews trust badge, top right (Rakesh, 20 Oct 2026) ───────────
s = open(P, encoding="utf-8").read()
OLD = ('    <img src="img/logo.webp" alt="Kutralam Ezhilagam" width="200" height="69">\n')
NEW = ('    <div class="mast-top">\n'
       '      <span class="logo-wrap"><img class="logo" src="img/logo-hd.webp" alt="Kutralam Ezhilagam" width="484" height="163">'
       '<span class="lens" aria-hidden="true"></span></span>\n'
       '      <div class="gbadge" role="img" aria-label="Guest ratings: Google 4.7 out of 5, Justdial Users Choice 2026, Goibibo 4.4 out of 5, MakeMyTrip 4.3 out of 5">\n'
       '        <div class="gb-slide gb-g" aria-hidden="true">\n'
       '          <img src="img/google-reviews-badge.webp" alt="" width="178" height="114">\n'
       '          <b class="gb-n">4.7</b>\n'
       '          <span class="gb-stars" style="--r:4.7"><i>★★★★★</i><i>★★★★★</i></span>\n'
       '        </div>\n'
       '        <img class="gb-slide gb-pic" src="img/justdial-users-choice.webp" alt="" width="400" height="526" aria-hidden="true">\n'
       '        <img class="gb-slide gb-pic" src="img/justdial-rating.webp" alt="" width="400" height="526" aria-hidden="true">\n'
       '        <img class="gb-slide gb-pic" src="img/goibibo-rating.webp" alt="" width="320" height="372" aria-hidden="true">\n'
       '        <img class="gb-slide gb-pic" src="img/makemytrip-rating.webp" alt="" width="320" height="382" aria-hidden="true">\n'
       '      </div>\n'
       '    </div>\n')
assert s.count(OLD) == 1
s = s.replace(OLD, NEW)
CSS2 = """/* Google Reviews badge: top right, beside the logo on a phone, after the numbers on a computer */
.mast-top{display:grid;grid-template-columns:minmax(0,2.524fr) minmax(0,.762fr);gap:14px;align-items:center;width:100%}
/* the logo is exactly as tall as the badge beside it, edge to edge with the content */
/* logo and badge share the row edge to edge; the split makes the logo 85% of the badge's height, centred beside it */
.mast .mast-top .logo{width:100%;height:auto;max-height:none}
.logo-wrap{position:relative;display:block;min-width:0}
/* a magnifying lens glides over the logo; inside it the logo is shown larger,
   lined up with what is under the lens, so it reads like real glass. */
.lens{position:absolute;left:0;top:0;width:var(--d,60px);height:var(--d,60px);border-radius:50%;pointer-events:none;
  background:#fff url(img/logo-hd.webp) no-repeat;will-change:transform,background-position;
  box-shadow:0 0 0 2px rgba(255,255,255,.95),0 0 0 3px rgba(4,120,87,.35),0 8px 18px rgba(28,25,23,.22),inset 0 0 10px rgba(28,25,23,.12);
  opacity:0;transition:opacity .4s}
.lens.on{opacity:1}
.lens::after{content:"";position:absolute;inset:0;border-radius:50%;
  background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.75),rgba(255,255,255,0) 38%),
             radial-gradient(circle at 70% 78%,rgba(255,255,255,.18),rgba(255,255,255,0) 45%)}
@media (prefers-reduced-motion:reduce){.lens{display:none}}
.gbadge{position:relative;width:100%;height:auto;aspect-ratio:64/84;overflow:hidden;container-type:inline-size;
  background:#fff;border:1px solid #eceae8;border-radius:10px;box-shadow:0 4px 14px rgba(28,25,23,.08);line-height:1}
/* five badges in one box: Google, Justdial Users' Choice, Justdial stars, Goibibo, MakeMyTrip. Each shows 2 s, fading in and out, forever. */
.gb-slide{position:absolute;inset:0;opacity:0;animation:gbCycle 10s ease-in-out infinite}
/* one 10 s loop shared by all five, each offset by exactly 2 s, so every change
   (including the one from the last badge back to the first) comes after the same
   gap. Shifted by -0.4 s so the first badge is already showing when the page opens. */
.gb-slide:nth-child(1){opacity:1;animation-delay:-.4s}
.gb-slide:nth-child(2){animation-delay:1.6s}
.gb-slide:nth-child(3){animation-delay:3.6s}
.gb-slide:nth-child(4){animation-delay:5.6s}
.gb-slide:nth-child(5){animation-delay:7.6s}
@keyframes gbCycle{0%{opacity:0}3.5%{opacity:1}17.5%{opacity:1}21.5%{opacity:0}100%{opacity:0}}
.gb-g{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px}
.gb-g img{display:block;width:100%;height:auto;padding-bottom:3px;border-bottom:1px solid #e7e5e4}
.gbadge .gb-pic{display:block;width:100%;height:100%;object-fit:cover;background:#fff}
.gb-n{font-size:16px;font-size:25cqw;font-weight:800;color:#1c1917;margin:3px 0 2px;font-variant-numeric:tabular-nums}
.gb-stars{position:relative;display:block;font-size:10px;font-size:15.5cqw;letter-spacing:0;white-space:nowrap}
.gb-stars i{font-style:normal;display:block;color:#d6d3d1}
.gb-stars i+i{position:absolute;inset:0 auto 0 0;overflow:hidden;color:#f5b301;width:calc(var(--r) / 5 * 100%)}
@media (min-width:900px){
  .mast-top{display:contents}
  .mast .logo-wrap{order:0;width:272px}
  .mast .callrow{order:1;margin-left:auto}
  .gbadge{order:2;width:84px;height:108px;aspect-ratio:auto}
  .gb-g{padding:6px}
  .gb-n{font-size:21px}
  .gb-stars{font-size:13px}
}

"""
anchor = '/* A phone set to reduce motion gets no auto-advance'
s = s.replace(anchor, CSS2 + anchor)
LENS_JS = """<script>
/* Lens over the logo (v1.6). One loop every 7 s: left to right and back on a
   gentle wave. The zoomed logo inside the lens is positioned from the same
   centre point, so the magnified letters always match the ones underneath. */
(function () {
  var wrap = document.querySelector(".logo-wrap"), lens = wrap && wrap.querySelector(".lens");
  if (!lens || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var Z = 1.9, PERIOD = 7000, t0 = performance.now();
  function frame(now) {
    var W = wrap.clientWidth, H = wrap.clientHeight;
    if (W && H) {
      var D = Math.round(H * 0.92), a = ((now - t0) % PERIOD) / PERIOD * 2 * Math.PI;
      var cx = W * (0.14 + 0.72 * (0.5 - 0.5 * Math.cos(a))), cy = H * (0.5 + 0.18 * Math.sin(2 * a));
      lens.style.setProperty("--d", D + "px");
      lens.style.transform = "translate(" + (cx - D / 2) + "px," + (cy - D / 2) + "px)";
      lens.style.backgroundSize = (W * Z) + "px " + (H * Z) + "px";
      lens.style.backgroundPosition = (D / 2 - cx * Z) + "px " + (D / 2 - cy * Z) + "px";
      lens.classList.add("on");
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
</script>
"""
assert s.count("</body></html>") == 1
s = s.replace("</body></html>", LENS_JS + "</body></html>")
open(P, "w", encoding="utf-8").write(s)
print("badge added")

# ── phone: no lens; the button reads "Reserve now" everywhere, with a highlight on phones (Rakesh, 20 Oct 2026) ─────
s = open(P, encoding="utf-8").read()
old = '  <a class="cta cta-book" id="bookBtn" href="index.html">\n    Book Room Now\n'
assert s.count(old) == 1
s = s.replace(old, '  <a class="cta cta-book" id="bookBtn" href="index.html">\n'
                   '    Reserve now\n')
s = s.replace('if (!lens || matchMedia("(prefers-reduced-motion: reduce)").matches) return;',
              'if (!lens || matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(max-width: 899px)").matches) return;')
CSS3 = """/* phone: the lens is computer-only; Reserve now carries the movement instead —
   a light sweeps across the button and a soft green ring pulses out from it */
@media (max-width:899px){
  .lens{display:none}
  .hero #bookBtn{position:relative;overflow:hidden;isolation:isolate;animation:bookPulse 2.4s ease-out infinite}
  .hero #bookBtn::before{content:"";position:absolute;inset:0;z-index:-1;transform:translateX(-110%);
    background:linear-gradient(110deg,transparent 25%,rgba(4,120,87,.14) 42%,rgba(167,243,208,.9) 50%,rgba(4,120,87,.14) 58%,transparent 75%);
    animation:bookShine 2.4s ease-in-out infinite}
}
@keyframes bookShine{0%{transform:translateX(-110%)}55%,100%{transform:translateX(110%)}}
@keyframes bookPulse{0%{box-shadow:0 0 0 0 rgba(4,120,87,.40)}70%,100%{box-shadow:0 0 0 10px rgba(4,120,87,0)}}

"""
anchor = '/* A phone set to reduce motion gets no auto-advance'
s = s.replace(anchor, CSS3 + anchor)
open(P, "w", encoding="utf-8").write(s)
print("book highlight added")
