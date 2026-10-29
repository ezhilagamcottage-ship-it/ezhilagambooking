// Golden booking voucher — 720x1280 layout tree for satori (rendered at 1.5x = 1080x1920).
// Pure JS: no imports, so the same file runs in Node (tests) and Deno (edge function).

export const ROOMS = {
  Thillai:   { floor: "Ground floor", desc: "Deluxe studio room" },
  Aambal:    { floor: "Ground floor", desc: "Standard studio room" },
  Vaagai:    { floor: "Ground floor", desc: "Premium family suite, 4 cots" },
  Shenbagam: { floor: "First floor",  desc: "Family suite with kitchen" },
  Mavval:    { floor: "First floor",  desc: "Premium family suite" },
  Kurinji:   { floor: "Second floor", desc: "Deluxe studio, mountain view" },
  Mullai:    { floor: "Second floor", desc: "Deluxe studio room with balcony" },
  Marutham:  { floor: "Second floor", desc: "Deluxe studio room with balcony" },
  Paalai:    { floor: "Second floor", desc: "Deluxe studio room" },
};
const NO_AC = { Aambal: 1, Shenbagam: 1 };
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WD = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const bad = (v) => v == null || v === "" || /^(—|-|none|null|undefined|₹?0)$/i.test(String(v).trim());
const num = (v) => { const n = Number(String(v == null ? "" : v).replace(/[₹,\s]/g, "")); return isFinite(n) ? n : 0; };
export const inr = (n) => "₹" + Math.round(num(n)).toLocaleString("en-IN");
function parseDate(s) {
  if (bad(s)) return null;
  const t = String(s).trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = t.match(/^(\d{1,2})[\/\-\s]([A-Za-z]{3,}|\d{1,2})[\/\-\s,]+(\d{4})/);
  if (m) {
    const mo = /^\d+$/.test(m[2]) ? +m[2] - 1 : MON.findIndex((x) => m[2].toLowerCase().startsWith(x.toLowerCase()));
    if (mo >= 0) return new Date(Date.UTC(+m[3], mo, +m[1]));
  }
  const d = new Date(t);
  return isNaN(d) ? null : new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
const dayLabel = (d) => d ? d.getUTCDate() + " " + MON[d.getUTCMonth()] : "—";
const wdLabel = (d) => d ? WD[d.getUTCDay()] : "";
function phoneSpaced(p) {
  const s = String(p || "").replace(/\D/g, "").slice(-10);
  return s.length === 10 ? "+91 " + s.slice(0, 5) + " " + s.slice(5) : (p || "—");
}

/* Normalise whatever the caller sends (camelCase or snake_case) into one shape. */
export function normalise(raw) {
  const r = raw || {};
  const pick = (...k) => { for (const x of k) if (!bad(r[x])) return r[x]; return ""; };
  const ci = parseDate(pick("checkIn", "check_in", "check_in_date"));
  const co = parseDate(pick("checkOut", "check_out", "check_out_date"));
  let nights = num(pick("nights"));
  if (!nights && ci && co) nights = Math.max(1, Math.round((co - ci) / 864e5));
  if (!nights) nights = 1;
  let rooms = r.rooms;
  if (!Array.isArray(rooms) || !rooms.length) {
    const rn = pick("room", "room_name", "rooms");
    rooms = String(rn || "").split(/\s*[,+&]\s*/).filter(Boolean);
  }
  rooms = rooms.map((x) => typeof x === "string" ? { name: x } : (x || {})).map((x) => {
    const name = String(x.name || x.room || "").trim();
    const key = Object.keys(ROOMS).find((k) => k.toLowerCase() === name.toLowerCase()) || name;
    const facts = ROOMS[key] || {};
    let ac = x.ac;
    if (ac === true) ac = "AC"; else if (ac === false) ac = "Non-AC";
    if (bad(ac)) ac = NO_AC[key] ? "Non-AC" : (x.acChosen === false ? "Non-AC" : "");
    if (NO_AC[key]) ac = "Non-AC";
    const floor = String(x.floor || facts.floor || "");
    return { name: key || "To be assigned", ac: String(ac || ""), floor,
             noLift: /first|second/i.test(floor), desc: String(x.desc || facts.desc || "") };
  });
  if (!rooms.length) rooms = [{ name: "To be assigned", ac: "", floor: "", noLift: false, desc: "" }];
  const total = num(pick("total", "totalTariff", "total_tariff", "net_amount", "amount"));
  const listTotal = num(pick("listTotal", "list_total"));
  let payments = Array.isArray(r.payments) ? r.payments.filter((p) => num(p.amount) > 0) : [];
  let paid = num(pick("paid", "advance", "advance_paid", "reservationPaid"));
  if (payments.length) paid = Math.max(paid, payments.reduce((s, p) => s + num(p.amount), 0));
  let balance = r.balance != null && r.balance !== "" ? Math.max(0, num(r.balance)) : Math.max(0, total - paid);
  if (total > 0 && paid >= total) balance = 0;
  const fullyPaid = total > 0 && balance <= 0;
  if (!payments.length && paid > 0) payments = [{ method: pick("paymentMethod", "payment_mode", "paymentMode") || "", date: "", amount: paid }];
  return {
    fullyPaid,
    bookingId: String(pick("bookingId", "booking_id", "id") || ""),
    bookedOn: String(pick("bookedOn", "bookedAt", "booked_at") || ""),
    guest: String(pick("guest", "guestName", "guest_name", "name") || "Guest"),
    phone: phoneSpaced(pick("phone", "mobile", "mobileNumber", "whatsapp_number", "whatsapp")),
    ci, co, nights,
    ciTime: String(pick("checkInTime", "check_in_time") || "12:00 PM"),
    coTime: String(pick("checkOutTime", "check_out_time") || "10:00 AM"),
    adults: Math.max(1, num(pick("adults")) || 1), children: num(pick("children", "kids")),
    rooms, total, listTotal: listTotal > total ? listTotal : 0,
    discountNote: String(pick("discountNote") || ""),
    paid, payments, balance,
    deposit: num(pick("deposit", "cautionDeposit")) || 500,
    qr: String(pick("qr") || ("EZP1:" + String(pick("bookingId", "booking_id", "id") || ""))),
    channel: channelOf(pick("channel", "bookedVia", "booked_via", "handledBy", "handled_by", "source")),
  };
}

/* Where the booking came from, shown under "Booked on". */
export function channelOf(v) {
  const t = String(v || "").trim();
  if (!t) return null;
  if (/^shenba$/i.test(t)) return { label: "Shenba", dot: "#3ddc84" };
  if (/whats\s*app/i.test(t)) return { label: "Shenba · WhatsApp", dot: "#3ddc84" };
  if (/chat/i.test(t)) return { label: "Shenba · Website chat", dot: "#7cc4ff" };
  if (/call|voice|talk/i.test(t)) return { label: "Shenba · Voice call", dot: "#c9a7ff" };
  if (/reserve|website|web|online/i.test(t)) return { label: "Website · Reserve Now", dot: "#f3cd8e" };
  if (/walk/i.test(t)) return { label: "Walk-in", dot: "#f6ead6" };
  if (/phone/i.test(t)) return { label: "Phone booking", dot: "#f6ead6" };
  if (/desk|direct|reserved|reception/i.test(t)) return { label: "Front desk", dot: "#f6ead6" };
  return { label: t.slice(0, 28), dot: "#f6ead6" };
}

/* tiny hyperscript for satori */
function h(type, style, ...children) {
  const kids = children.flat().filter((c) => c !== null && c !== undefined && c !== false && c !== "");
  const props = { style: Object.assign({}, style) };
  if (type === "img") { props.src = style.src; props.width = style.width; props.height = style.height; delete props.style.src; }
  if (type === "div" && kids.length > 1 && !props.style.display) props.style.display = "flex";
  if (type === "div" && !props.style.display) props.style.display = "flex";
  props.children = kids.length === 0 ? undefined : (kids.length === 1 ? kids[0] : kids);
  return { type, props };
}

const BG = {
  reserved: "radial-gradient(130% 70% at 20% 0%, #173563 0%, #0f2342 48%, #0a1830 100%)",
  paid: "radial-gradient(130% 70% at 20% 0%, #14705a 0%, #0c4c3b 48%, #062a20 100%)",
};
function decoration() {
  return [
    h("div", { position: "absolute", width: 400, height: 400, left: 520, top: -210, borderRadius: 999, border: "1px solid rgba(243,205,142,0.16)" }),
    h("div", { position: "absolute", width: 490, height: 490, left: 475, top: -255, borderRadius: 999, border: "1px solid rgba(243,205,142,0.10)" }),
    h("div", { position: "absolute", left: 9, top: 9, width: 702, height: 1262, border: "2px solid rgba(227,173,95,0.9)", borderRadius: 22 }),
  ];
}
/* Background only (used once, offline, to make the background images). */
export function backgroundTree(paid) {
  return h("div", { width: 720, height: 1280, position: "relative", background: paid ? BG.paid : BG.reserved }, ...decoration());
}

export function voucherTree(raw, assets) {
  const d = normalise(raw);
  const paid = d.fullyPaid;
  const T = paid
    ? { bg: "radial-gradient(130% 70% at 20% 0%, #14705a 0%, #0c4c3b 48%, #062a20 100%)", deep: "#06281e", accent: "#a6ecc9", pillTxt: "#a6ecc9", amtOk: "#ffffff" }
    : { bg: "radial-gradient(130% 70% at 20% 0%, #173563 0%, #0f2342 48%, #0a1830 100%)", deep: "#0a1830", accent: "#a9cdf5", pillTxt: "#f3cd8e", amtOk: "#86e0a8" };
  const GOLD = "#e3ad5f", GOLD2 = "#f3cd8e", CREAM = "#f6ead6", CREAM2 = "rgba(246,234,214,0.9)";
  const PANEL = "rgba(255,255,255,0.065)", PANEL2 = "rgba(255,255,255,0.11)";
  const SERIF = "DM Serif Display", SANS = "Jost";
  const goldPlate = "linear-gradient(180deg, #f3cd8e, #e3ad5f)";
  const lbl = (t, extra) => h("div", Object.assign({ fontFamily: SANS, fontWeight: 600, fontSize: 21, color: GOLD }, extra || {}), t);
  const blk = (style, ...kids) => h("div", Object.assign({ marginTop: 8, marginLeft: 4, marginRight: 4, background: PANEL, borderRadius: 18, padding: "12px 20px", flexDirection: "column" }, style), ...kids);
  const chip = (t, red) => h("div", { padding: "8px 14px", borderRadius: 999, background: red ? "#b3261e" : PANEL2, fontFamily: SANS, fontWeight: red ? 700 : 600, fontSize: 22, color: red ? "#fff" : CREAM, letterSpacing: red ? 0.6 : 0 }, t);

  const guestsLine = d.adults + " adult" + (d.adults > 1 ? "s" : "") + (d.children ? " · " + d.children + " child" + (d.children > 1 ? "ren" : "") : "");
  const roomsLine = d.rooms.length + " room" + (d.rooms.length > 1 ? "s" : "");
  const guestSize = d.guest.length > 18 ? Math.max(28, Math.round(42 * 18 / d.guest.length)) : 42;
  const idSize = d.bookingId.length > 10 ? Math.max(28, Math.round(44 * 10 / d.bookingId.length)) : 44;

  const roomRows = d.rooms.slice(0, 3).map((r, i) => h("div", { flexDirection: "column", marginTop: i ? 8 : 6, paddingTop: i ? 8 : 0, borderTop: i ? "2px solid rgba(243,205,142,0.2)" : "0px solid transparent" },
    h("div", { alignItems: "center", flexWrap: "wrap", gap: 12 },
      h("span", { fontFamily: SERIF, fontSize: 40, color: CREAM }, r.name),
      r.ac ? h("span", { fontFamily: SANS, fontWeight: 700, fontSize: 26, color: GOLD }, r.ac) : null,
      r.floor ? chip(r.floor) : null,
      r.noLift ? chip("NO LIFT", true) : null),
    d.rooms.length === 1 && r.desc ? h("div", { marginTop: 8, fontFamily: SANS, fontWeight: 500, fontSize: 23, color: T.accent }, r.desc) : null));

  const pay0 = d.payments[0] || {};
  const payNote = d.payments.length > 1
    ? d.payments.length + " payments received"
    : [pay0.method, pay0.date].filter((x) => !bad(x)).join(" · ");
  const tile = (k, amount, note, okAmt, strike) => h("div", { flex: 1, flexDirection: "column", background: PANEL, borderRadius: 14, padding: "8px 14px" },
    h("div", { fontFamily: SANS, fontWeight: 600, fontSize: 22, color: T.accent }, k),
    h("div", { marginTop: 6, alignItems: "baseline" },
      strike ? h("span", { fontFamily: SANS, fontWeight: 500, fontSize: 22, color: CREAM2, textDecoration: "line-through", marginRight: 8 }, strike) : null,
      h("span", { fontFamily: SANS, fontWeight: 700, fontSize: 34, color: okAmt ? T.amtOk : CREAM }, amount)),
    note ? h("div", { marginTop: 6, fontFamily: SANS, fontWeight: 500, fontSize: 20, color: GOLD2 }, note) : null);

  const due = paid
    ? h("div", { marginTop: 10, padding: "12px 18px", borderRadius: 16, background: goldPlate, justifyContent: "space-between", alignItems: "center" },
        h("div", { flexDirection: "column" },
          h("div", { fontFamily: SANS, fontWeight: 700, fontSize: 27, color: T.deep }, "Nothing to pay"),
          h("div", { marginTop: 4, fontFamily: SANS, fontWeight: 600, fontSize: 21, color: "#0f5a3f" }, "All dues cleared")),
        h("div", { fontFamily: SANS, fontWeight: 700, fontSize: 46, color: T.deep }, "₹0"))
    : h("div", { marginTop: 10, padding: "12px 18px", borderRadius: 16, background: goldPlate, justifyContent: "space-between", alignItems: "center" },
        h("div", { flexDirection: "column" },
          h("div", { fontFamily: SANS, fontWeight: 700, fontSize: 27, color: T.deep }, "Balance at check-in"),
          h("div", { marginTop: 4, fontFamily: SANS, fontWeight: 600, fontSize: 21, color: "#7a3e0a" }, "Pay at the front desk")),
        h("div", { fontFamily: SANS, fontWeight: 700, fontSize: 46, color: T.deep }, inr(d.balance)));

  // A pre-rendered background (gradient + rings + gold frame) is far cheaper to draw than the live gradient.
  const bgImg = assets.bg ? (paid ? assets.bg.paid : assets.bg.reserved) : "";
  return h("div", { width: 720, height: 1280, position: "relative", background: bgImg ? (paid ? "#0c4c3b" : "#0f2342") : T.bg, color: CREAM, fontFamily: SANS, lineHeight: 1.1 },
    bgImg ? h("img", { src: bgImg, width: 720, height: 1280, position: "absolute", left: 0, top: 0 }) : null,
    ...(bgImg ? [] : decoration()),
    h("div", { position: "absolute", left: 20, top: 22, width: 680, height: 1242, flexDirection: "column", justifyContent: "space-between" },
    // header
    h("div", { flexDirection: "column", padding: "8px 12px 0" },
      h("div", { justifyContent: "space-between", alignItems: "flex-start" },
        h("div", { flexDirection: "column" },
          h("img", { src: assets.logo, width: 210, height: 75 }),
          h("div", { marginTop: 14, fontFamily: SERIF, fontSize: 50, color: "#ffffff", lineHeight: 1 }, "Booking confirmed"),
          d.bookedOn ? h("div", { marginTop: 8, fontFamily: SANS, fontSize: 22, color: GOLD2 },
            h("span", {}, "Booked on\u00a0"), h("span", { fontWeight: 700 }, d.bookedOn)) : null,
          d.channel ? h("div", { marginTop: 8, alignSelf: "flex-start", alignItems: "center", gap: 9, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.12)" },
            h("div", { width: 11, height: 11, borderRadius: 999, background: d.channel.dot }),
            h("span", { fontFamily: SANS, fontWeight: 600, fontSize: 21, color: "#ffffff" }, "Booked via " + d.channel.label)) : null),
        h("div", { flexDirection: "column", alignItems: "center" },
          h("div", { fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "#ffffff", letterSpacing: 1, marginBottom: 8 }, "Fast-track"),
          h("div", { background: "#ffffff", borderRadius: 16, padding: 10 },
            h("img", { src: assets.qr, width: 152, height: 152 })))),
      h("div", { marginTop: 10, padding: "10px 20px", borderRadius: 16, background: goldPlate, justifyContent: "space-between", alignItems: "center" },
        h("span", { fontFamily: SANS, fontWeight: 600, fontSize: 22, color: T.deep }, "Booking ID"),
        h("span", { fontFamily: SANS, fontWeight: 700, fontSize: idSize, color: T.deep, letterSpacing: 1.5 }, d.bookingId || "—"),
        h("div", { alignItems: "center", gap: 9, padding: "11px 20px", borderRadius: 999, background: T.deep },
          h("div", { width: 11, height: 11, borderRadius: 999, background: T.pillTxt }),
          h("span", { fontFamily: SANS, fontWeight: 600, fontSize: 22, color: T.pillTxt }, paid ? "Fully paid" : "Reserved")))),
    // guest
    blk({ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
      h("div", { flexDirection: "column" }, lbl("Guest name"),
        h("div", { marginTop: 6, fontFamily: SERIF, fontSize: guestSize, color: CREAM }, d.guest)),
      h("div", { flexDirection: "column", alignItems: "flex-end" }, lbl("Mobile"),
        h("div", { marginTop: 8, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: CREAM }, d.phone))),
    // stay
    blk({ flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
      h("div", { flexDirection: "column", flex: 1 }, lbl("Check-in"),
        h("div", { marginTop: 6, fontFamily: SERIF, fontSize: 48, color: CREAM }, dayLabel(d.ci)),
        h("div", { marginTop: 8, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: GOLD2 }, (wdLabel(d.ci) ? wdLabel(d.ci) + " · " : "") + d.ciTime)),
      h("div", { flexDirection: "column", alignItems: "center", width: 176 },
        h("div", { fontFamily: SERIF, fontSize: 38, color: GOLD }, d.nights + " night" + (d.nights > 1 ? "s" : "")),
        h("div", { width: 150, height: 3, marginTop: 8, marginBottom: 8, background: "linear-gradient(90deg, rgba(227,173,95,0), #e3ad5f, rgba(227,173,95,0))" }),
        h("div", { fontFamily: SANS, fontWeight: 600, fontSize: 21, color: CREAM }, guestsLine),
        h("div", { fontFamily: SANS, fontWeight: 600, fontSize: 21, color: T.accent }, roomsLine)),
      h("div", { flexDirection: "column", alignItems: "flex-end", flex: 1 }, lbl("Check-out"),
        h("div", { marginTop: 6, fontFamily: SERIF, fontSize: 48, color: CREAM }, dayLabel(d.co)),
        h("div", { marginTop: 8, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: GOLD2 }, (wdLabel(d.co) ? wdLabel(d.co) + " · " : "") + d.coTime))),
    // rooms
    blk({}, lbl(d.rooms.length > 1 ? "Your rooms" : "Your room"), ...roomRows),
    // payment
    blk({},
      h("div", { gap: 10 },
        tile("Total tariff", inr(d.total), d.discountNote, false, d.listTotal ? inr(d.listTotal) : ""),
        tile(paid ? "Paid" : "Advance paid", inr(d.paid), payNote, true)),
      due,
      h("div", { marginTop: 10, justifyContent: "space-between", alignItems: "baseline" },
        h("span", { fontFamily: SANS, fontWeight: 500, fontSize: 23, color: CREAM2 }, "Caution deposit · refundable"),
        h("span", { fontFamily: SANS, fontWeight: 700, fontSize: 28, color: CREAM }, inr(d.deposit)))),
    // footer
    blk({ flexDirection: "row", justifyContent: "space-between" },
      h("div", { flexDirection: "column", width: 340 }, lbl("Address"),
        h("div", { marginTop: 6, fontFamily: SANS, fontWeight: 500, fontSize: 21, color: CREAM, lineHeight: 1.35 },
          "No 46, Vairams Nagar, Five Falls Road, Courtallam, Tamil Nadu 627802 · near the Vairams Nagar arch")),
      h("div", { flexDirection: "column", alignItems: "flex-end" },
        h("div", { fontFamily: SANS, fontWeight: 500, fontSize: 20, color: CREAM2 }, "Point of contact"),
        h("div", { marginTop: 4, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: GOLD2 }, "82483 20685"),
        h("div", { marginTop: 10, fontFamily: SANS, fontWeight: 500, fontSize: 20, color: CREAM2 }, "Front desk"),
        h("div", { marginTop: 4, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: GOLD2 }, "04633 284004"))),
    // powered by
    h("div", { marginTop: 8, justifyContent: "center", alignItems: "center", gap: 12 },
      h("span", { fontFamily: SANS, fontWeight: 600, fontSize: 19, letterSpacing: 2.6, color: CREAM2 }, "POWERED BY"),
      h("div", { background: "#ffffff", borderRadius: 999, padding: "3px 4px" },
        h("img", { src: assets.duphora, width: 129, height: 38 })))));
}
