"""Room cards for WhatsApp (Rakesh, 29 Oct 2026: room pics "with reserve now button on the images" like brand carousels).
Each card = room photo + navy band with the logo, room name, one line and a gold RESERVE NOW pill. Run from the repo root:
  python3 tools/make-room-cards.py   ->  img/cards/<room>.jpg (1080x1080)"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
F = '/usr/share/fonts/opentype/inter/Inter-%s.otf'
font = lambda w, s: ImageFont.truetype(F % w, s)
NAVY, NAVY2, GOLD, GOLDLT, WHITE = (15, 35, 66), (10, 24, 48), (192, 144, 47), (227, 173, 95), (255, 255, 255)
ROOMS = [
  ('aambal', 'Aambal', 'Garden studio · for 2'),
  ('thillai', 'Thillai', 'Family studio · A/C · ground floor'),
  ('marutham', 'Marutham', 'Balcony studio · A/C · sleeps 4'),
  ('mullai', 'Mullai', 'Quiet studio · A/C · sleeps 4'),
  ('paalai', 'Paalai', 'Family studio · A/C · sleeps 5'),
  ('kurinji', 'Kurinji', 'Family studio · A/C · sleeps 5'),
  ('shenbagam', 'Shenbagam', '3-bedroom suite with kitchen'),
  ('mavval', 'Mavval', '3-bedroom premium suite · A/C'),
  ('vaagai', 'Vaagai', '3-bedroom suite · ground floor'),
]
W, PH, BAND = 1080, 840, 240
logo = Image.open('img/logo-gold.webp').convert('RGBA')
logo = logo.resize((int(logo.width * 64 / logo.height), 64), Image.LANCZOS)
for key, name, line in ROOMS:
    ph = ImageOps.fit(Image.open('img/rooms/%s.webp' % key).convert('RGB'), (W, PH), Image.LANCZOS, centering=(0.5, 0.5))
    card = Image.new('RGB', (W, PH + BAND), NAVY)
    card.paste(ph, (0, 0))
    d = ImageDraw.Draw(card)
    # soft fade from the photo into the band, then a gold rule
    fade = Image.new('RGBA', (W, 90), (0, 0, 0, 0)); fd = ImageDraw.Draw(fade)
    for i in range(90): fd.line([(0, i), (W, i)], fill=NAVY + (int(170 * (i / 90) ** 1.6),))
    card.paste(fade, (0, PH - 90), fade)
    d.rectangle([0, PH, W, PH + 5], fill=GOLD)
    d.rectangle([0, PH + 5, W, PH + BAND], fill=NAVY)
    # logo badge top-left on the photo
    badge = Image.new('RGBA', (logo.width + 36, logo.height + 24), NAVY2 + (215,))
    bm = Image.new('L', badge.size, 0); ImageDraw.Draw(bm).rounded_rectangle([0, 0, badge.width - 1, badge.height - 1], 18, fill=255)
    badge.paste(logo, (18, 12), logo); card.paste(badge, (34, 34), bm)
    # text
    d.text((48, PH + 38), name.upper(), font=font('ExtraBold', 76), fill=WHITE)
    d.text((50, PH + 132), line, font=font('Medium', 36), fill=GOLDLT)
    d.text((50, PH + 182), 'Kutralam Ezhilagam · Courtallam', font=font('Regular', 26), fill=(190, 198, 214))
    # RESERVE NOW pill
    f = font('ExtraBold', 34); t = 'RESERVE NOW  ›'
    tw = d.textlength(t, font=f); pw, phh = int(tw + 64), 84
    x0, y0 = W - pw - 44, PH + 78
    sh = Image.new('RGBA', (pw + 30, phh + 30), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([15, 19, pw + 15, phh + 19], 42, fill=(0, 0, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(8)); card.paste(sh, (x0 - 15, y0 - 15), sh)
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + phh], 42, fill=GOLD)
    d.text((x0 + 32, y0 + phh / 2), t, font=f, fill=NAVY2, anchor='lm')
    card.save('img/cards/%s.jpg' % key, quality=86, optimize=True, progressive=True)
    print(key, card.size)
