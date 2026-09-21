import assert from "node:assert/strict";

/* Mirrors the time helpers in Ezhilagam Prime app/index.html (17.42).
   Walk-in same-day stays were refused unless they were exactly Day Use
   12:00–17:00. Morning 6 AM → 5 PM must pass. */
const DEFAULT_CHECKIN_TIME = "12:00";
const DEFAULT_CHECKOUT_TIME = "10:00";

const to24h = (v) => {
  const s = String(v || "").trim();
  let m = /^(\d{1,2}):(\d{2})\s*([AaPp])\.?[Mm]\.?$/.exec(s);
  if (m) {
    let h = Number(m[1]) % 12;
    if (/[Pp]/.test(m[3])) h += 12;
    return `${h < 10 ? "0" : ""}${h}:${m[2]}`;
  }
  m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (m) {
    const h = Number(m[1]) % 24;
    return `${h < 10 ? "0" : ""}${h}:${m[2]}`;
  }
  return "";
};

const isDayUseSlot = (checkIn, checkOut, checkInTime, checkOutTime) =>
  !!checkIn &&
  checkIn === checkOut &&
  to24h(checkInTime) === "12:00" &&
  to24h(checkOutTime) === "17:00";

const stayEndsAfterStart = (checkIn, checkOut, checkInTime, checkOutTime) => {
  if (!checkIn || !checkOut) return false;
  if (checkOut > checkIn) return true;
  if (checkOut < checkIn) return false;
  const inT = to24h(checkInTime) || DEFAULT_CHECKIN_TIME;
  const outT = to24h(checkOutTime) || DEFAULT_CHECKOUT_TIME;
  return outT > inT;
};

const wouldShowDateError = (checkIn, checkOut, checkInTime, checkOutTime) => {
  const dayUse = isDayUseSlot(checkIn, checkOut, checkInTime, checkOutTime);
  const oldGate =
    !checkIn ||
    !checkOut ||
    checkOut < checkIn ||
    (checkOut === checkIn && !dayUse);
  const newGate =
    !checkIn ||
    !checkOut ||
    !stayEndsAfterStart(checkIn, checkOut, checkInTime, checkOutTime);
  return { oldGate, newGate };
};

const morning = wouldShowDateError("2026-09-22", "2026-09-22", "06:00", "17:00");
assert.equal(morning.oldGate, true, "old gate wrongly blocked 6 AM → 5 PM");
assert.equal(morning.newGate, false, "new gate allows 6 AM → 5 PM same day");

const ampm = wouldShowDateError("2026-09-22", "2026-09-22", "6:00 AM", "5:00 PM");
assert.equal(ampm.newGate, false, "6:00 AM / 5:00 PM strings also allowed");

const dayUse = wouldShowDateError("2026-09-22", "2026-09-22", "12:00", "17:00");
assert.equal(dayUse.oldGate, false);
assert.equal(dayUse.newGate, false, "Day Use 12–5 still allowed");
assert.equal(isDayUseSlot("2026-09-22", "2026-09-22", "12:00", "17:00"), true);

const noonToTen = wouldShowDateError("2026-09-22", "2026-09-22", "12:00", "10:00");
assert.equal(noonToTen.newGate, true, "noon in / 10 AM out same day still blocked");

const overnight = wouldShowDateError("2026-09-22", "2026-09-23", "12:00", "10:00");
assert.equal(overnight.newGate, false);

const morningToStandardOut = wouldShowDateError("2026-09-22", "2026-09-22", "06:00", "10:00");
assert.equal(morningToStandardOut.newGate, false, "6 AM → 10 AM same day still ends later on the clock");

const eveningThenEarlier = wouldShowDateError("2026-09-22", "2026-09-22", "21:00", "17:00");
assert.equal(eveningThenEarlier.newGate, true, "9 PM in / 5 PM out same day still blocked");

const reversedDates = wouldShowDateError("2026-09-23", "2026-09-22", "06:00", "17:00");
assert.equal(reversedDates.newGate, true);

console.log("same-day morning 6 AM validation passed");
