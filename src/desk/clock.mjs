/**
 * Analogue check-in / check-out clock for the Prime desk.
 * The booking tariff follows these same edges (roomNightUnits / checkOutUplift /
 * isLateArrival): 10:00 and 13:00 on the way out, 17:00 on the way in.
 * ClockPickSheet is injected into app/index.html by scripts/patch-prime-clock.mjs.
 */

export function ezhClockPointerAngle(cx, cy, x, y) {
  const deg = (Math.atan2(x - cx, cy - y) * 180) / Math.PI;
  return (deg + 360) % 360;
}

export function ezhClockAngleToHour(deg) {
  const d = ((Number(deg) % 360) + 360) % 360;
  const h = Math.round(d / 30) % 12;
  return h === 0 ? 12 : h;
}

export function ezhClockAngleToMinute(deg) {
  const d = ((Number(deg) % 360) + 360) % 360;
  return Math.round(d / 6) % 60;
}

export function ezhClockParse(value) {
  const raw = String(value || "12:00").trim();
  let h24 = 12;
  let mins = 0;
  const ampm = /(\d{1,2}):(\d{2})\s*([ap])/i.exec(raw);
  const hm = /^(\d{1,2}):(\d{2})/.exec(raw);
  if (ampm) {
    h24 = Number(ampm[1]) % 12;
    if (ampm[3].toLowerCase() === "p") h24 += 12;
    mins = Number(ampm[2]) % 60;
  } else if (hm) {
    h24 = Number(hm[1]) % 24;
    mins = Number(hm[2]) % 60;
  }
  const ap = h24 >= 12 ? "PM" : "AM";
  let hour = h24 % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: mins, ap };
}

export function ezhClockToHHMM(hour12, minute, ap) {
  let h = Number(hour12) % 12;
  if (ap === "PM") h += 12;
  if (ap === "AM" && Number(hour12) === 12) h = 0;
  const mm = String(Math.max(0, Math.min(59, Number(minute) || 0))).padStart(2, "0");
  const hh = String(h).padStart(2, "0");
  return hh + ":" + mm;
}

/** What the desk tariff does at this exact minute. */
export function ezhClockRateLine(title, hhmm) {
  const t = String(hhmm || "");
  if (/out/i.test(String(title || ""))) {
    if (t <= "10:00") return { text: "By 10:00 AM · no extra night", tone: "flat" };
    if (t <= "13:00") return { text: "By 1:00 PM · quarter night extra", tone: "up" };
    return { text: "After 1:00 PM · half night extra", tone: "up" };
  }
  if (t >= "17:00") return { text: "From 5:00 PM · quarter night less", tone: "down" };
  return { text: "Before 5:00 PM · full night", tone: "flat" };
}

export function ClockPickSheet({ open, title, value, accent, liveRate, onPick, onPreview, onClose }) {
  const parsed = ezhClockParse(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [ap, setAp] = useState(parsed.ap);
  const [phase, setPhase] = useState("hour");
  const [hand, setHand] = useState((parsed.hour % 12) * 30);
  const [dragging, setDragging] = useState(false);
  const faceRef = useRef(null);
  const phaseRef = useRef("hour");
  const hourRef = useRef(parsed.hour);
  const minuteRef = useRef(parsed.minute);
  const apRef = useRef(parsed.ap);
  const dragRef = useRef(false);
  const openedRef = useRef(value);
  const ink = accent === "orange" ? "#ea580c" : "#2563eb";
  const hhmm = ezhClockToHHMM(hour, minute, ap);
  const rate = ezhClockRateLine(title, hhmm);
  const rateColor = rate.tone === "up" ? "#c2410c" : rate.tone === "down" ? "#0369a1" : "#475569";

  function emit(h, m, a) {
    const next = ezhClockToHHMM(h, m, a);
    if (onPreview) onPreview(next);
    return next;
  }
  function dismiss() {
    if (onPreview) onPreview(openedRef.current);
    if (onClose) onClose();
  }
  useBackClose(true, dismiss);

  function point(e) {
    const el = faceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const src = e.touches && e.touches[0] ? e.touches[0] : e;
    const deg = ezhClockPointerAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, src.clientX, src.clientY);
    if (phaseRef.current === "hour") {
      const h = ezhClockAngleToHour(deg);
      hourRef.current = h;
      setHour(h);
      setHand(dragRef.current ? deg : (h % 12) * 30);
      emit(h, minuteRef.current, apRef.current);
    } else {
      const m = ezhClockAngleToMinute(deg);
      minuteRef.current = m;
      setMinute(m);
      setHand(dragRef.current ? deg : m * 6);
      emit(hourRef.current, m, apRef.current);
    }
  }
  function onDown(e) {
    if (e.preventDefault) e.preventDefault();
    dragRef.current = true;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) { /* older webview */ }
    point(e);
  }
  function onMove(e) {
    if (!dragRef.current) return;
    if (e.preventDefault) e.preventDefault();
    point(e);
  }
  function onUp() {
    if (!dragRef.current) return;
    dragRef.current = false;
    setDragging(false);
    if (phaseRef.current === "hour") {
      phaseRef.current = "minute";
      setPhase("minute");
      setHand(minuteRef.current * 6);
      return;
    }
    if (onPick) onPick(emit(hourRef.current, minuteRef.current, apRef.current));
  }
  function chooseAp(next) {
    apRef.current = next;
    setAp(next);
    emit(hourRef.current, minuteRef.current, next);
  }
  function showHour() {
    phaseRef.current = "hour";
    setPhase("hour");
    setHand((hourRef.current % 12) * 30);
  }
  function showMinute() {
    phaseRef.current = "minute";
    setPhase("minute");
    setHand(minuteRef.current * 6);
  }

  if (!open) return null;

  const size = 268;
  const cx = size / 2;
  const cy = size / 2;
  const numR = 96;
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const rad = (i * 6 * Math.PI) / 180;
    const inner = major ? 108 : 114;
    const outer = 122;
    ticks.push(React.createElement("line", {
      key: "t" + i,
      x1: cx + Math.sin(rad) * inner,
      y1: cy - Math.cos(rad) * inner,
      x2: cx + Math.sin(rad) * outer,
      y2: cy - Math.cos(rad) * outer,
      stroke: major ? "#94a3b8" : "#e2e8f0",
      strokeWidth: major ? 2 : 1,
      strokeLinecap: "round",
    }));
  }
  const numerals = [];
  for (let n = 1; n <= 12; n++) {
    const rad = ((n % 12) * 30 * Math.PI) / 180;
    const onMinuteMark = minute % 5 === 0 && (minute === 0 ? n === 12 : n === minute / 5);
    const active = phase === "hour" ? n === hour : onMinuteMark;
    numerals.push(React.createElement("text", {
      key: "n" + n,
      x: cx + Math.sin(rad) * numR,
      y: cy - Math.cos(rad) * numR,
      textAnchor: "middle",
      dominantBaseline: "central",
      fill: active ? ink : "#1e293b",
      fontSize: active ? 18 : 15,
      fontWeight: 800,
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    }, String(n)));
  }
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  const activeAngle = phase === "hour" ? (dragging ? hand : (hour % 12) * 30) : (dragging ? hand : minuteAngle);
  const quietAngle = phase === "hour" ? minuteAngle : hourAngle;

  function handEl(angle, length, width, color, opacity) {
    return React.createElement("div", {
      style: {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: width,
        height: length,
        marginLeft: -width / 2,
        marginTop: -length,
        borderRadius: width,
        background: color,
        opacity: opacity,
        transformOrigin: "50% 100%",
        transform: "rotate(" + angle + "deg)",
        transition: dragging ? "none" : "transform 180ms cubic-bezier(.22,.9,.24,1)",
        pointerEvents: "none",
      },
    }, React.createElement("div", {
      style: {
        position: "absolute",
        left: "50%",
        top: 0,
        width: 12,
        height: 12,
        marginLeft: -6,
        marginTop: -2,
        borderRadius: 99,
        background: color,
      },
    }));
  }

  const pill = (label, on) => React.createElement("button", {
    type: "button",
    "data-clock-ap": label,
    onClick: () => chooseAp(label),
    style: {
      border: "none",
      borderRadius: 12,
      padding: "8px 14px",
      fontWeight: 800,
      fontSize: 13,
      color: on ? "#fff" : "#475569",
      background: on ? ink : "#f1f5f9",
    },
  }, label);

  return React.createElement(React.Fragment, null,
    React.createElement("div", {
      "data-clock-backdrop": true,
      onClick: dismiss,
      style: { position: "fixed", inset: 0, zIndex: 90, background: "rgba(15,23,42,.5)" },
    }),
    React.createElement("div", {
      "data-clock-sheet": true,
      "data-clock-phase": phase,
      "data-clock-hhmm": hhmm,
      style: {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 91,
        background: "#fff",
        borderRadius: "28px 28px 0 0",
        padding: "10px 18px 22px",
        boxShadow: "0 -12px 40px rgba(15,23,42,.18)",
        userSelect: "none",
      },
    },
      React.createElement("div", { style: { width: 40, height: 4, borderRadius: 99, background: "#cbd5e1", margin: "0 auto 12px" } }),
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
        React.createElement("p", { style: { margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" } }, title || "Pick time"),
        React.createElement("button", {
          type: "button",
          "data-clock-close": true,
          onClick: dismiss,
          style: { border: "none", borderRadius: 999, background: "#f1f5f9", color: "#475569", fontWeight: 800, fontSize: 12, padding: "6px 12px" },
        }, "Close")
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 } },
        React.createElement("div", { "data-clock-readout": true, style: { display: "flex", alignItems: "baseline", gap: 2, fontVariantNumeric: "tabular-nums" } },
          React.createElement("button", {
            type: "button",
            "data-clock-hour": true,
            onClick: showHour,
            style: { border: "none", background: "transparent", fontSize: 40, fontWeight: 800, color: phase === "hour" ? ink : "#94a3b8", padding: 0, lineHeight: 1 },
          }, String(hour)),
          React.createElement("span", { style: { fontSize: 36, fontWeight: 800, color: "#cbd5e1" } }, ":"),
          React.createElement("button", {
            type: "button",
            "data-clock-minute": true,
            onClick: showMinute,
            style: { border: "none", background: "transparent", fontSize: 40, fontWeight: 800, color: phase === "minute" ? ink : "#94a3b8", padding: 0, lineHeight: 1 },
          }, String(minute).padStart(2, "0"))
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, pill("AM", ap === "AM"), pill("PM", ap === "PM"))
      ),
      React.createElement("p", {
        "data-clock-rate": true,
        style: { margin: "8px 0 0", textAlign: "center", fontSize: 13, fontWeight: 800, color: rateColor, minHeight: 18 },
      }, (liveRate ? liveRate + " · " : "") + rate.text),
      React.createElement("p", {
        style: { margin: "2px 0 8px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8" },
      }, phase === "hour" ? "Slide the hour hand" : "Slide the minute hand — it saves and closes"),
      React.createElement("div", {
        ref: faceRef,
        "data-clock-face": true,
        onPointerDown: onDown,
        onPointerMove: onMove,
        onPointerUp: onUp,
        onPointerCancel: onUp,
        style: { position: "relative", width: size, height: size, margin: "0 auto", touchAction: "none", borderRadius: "50%" },
      },
        React.createElement("svg", { width: size, height: size, viewBox: "0 0 " + size + " " + size, style: { display: "block" } },
          React.createElement("circle", { cx: cx, cy: cy, r: 128, fill: "#f8fafc" }),
          React.createElement("circle", { cx: cx, cy: cy, r: 124, fill: "#fff", stroke: "#e2e8f0", strokeWidth: 2 }),
          ticks,
          numerals
        ),
        handEl(quietAngle, phase === "hour" ? 72 : 50, phase === "hour" ? 3 : 5, "#94a3b8", 0.85),
        handEl(activeAngle, phase === "hour" ? 52 : 84, phase === "hour" ? 5 : 3, ink, 1),
        React.createElement("div", {
          style: {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 12,
            height: 12,
            marginLeft: -6,
            marginTop: -6,
            borderRadius: 99,
            background: ink,
            pointerEvents: "none",
          },
        })
      )
    )
  );
}

export function clockSheetBundle() {
  const helpers = [
    ezhClockPointerAngle,
    ezhClockAngleToHour,
    ezhClockAngleToMinute,
    ezhClockParse,
    ezhClockToHHMM,
    ezhClockRateLine,
    ClockPickSheet,
  ];
  return "/* ezh-analogue-clock */\n" + helpers.map((fn) => fn.toString()).join("\n");
}
