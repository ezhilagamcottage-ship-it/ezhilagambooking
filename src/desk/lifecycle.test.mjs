import test from "node:test";
import assert from "node:assert/strict";
import {
  lifecycleFlags,
  PRIME_TAG_FLAG_LINES,
  PRIME_TAG_FLAG_LINES_OLD,
} from "./lifecycle.mjs";

const TODAY = "2026-10-05";
const late = (t) => String(t || "") === "5:00 PM";

test("early check-in already in house is Stay, not today's pending arrival", () => {
  const cell = {
    statusKey: "IN_HOUSE",
    state: "IN_HOUSE",
    booking: {
      guest: "Rajavel",
      bookingId: "LOCT10526",
      room: "Shenbagam",
      checkIn: "2026-10-05",
      checkOut: "2026-10-07",
      checkInTime: "12:00 PM",
      arrivedAt: "4 Oct 2026 @ 10:51 PM",
      status: "Reserved",
    },
  };
  const flags = lifecycleFlags(cell, TODAY, late);
  assert.equal(flags.isArrival, false);
  assert.equal(flags.isEveningOut, false);
});

test("same-day check-in drops off Arrivals once the room is in house", () => {
  const cell = {
    statusKey: "IN_HOUSE",
    booking: {
      checkIn: TODAY,
      checkOut: "2026-10-06",
      arrivedAt: "5 Oct 2026 @ 2:10 PM",
      checkOutTime: "10:00 AM",
    },
  };
  assert.equal(lifecycleFlags(cell, TODAY, late).isArrival, false);
});

test("a reservation still waiting today stays an arrival", () => {
  const cell = {
    statusKey: "CHECKIN_PENDING",
    booking: {
      checkIn: TODAY,
      checkOut: "2026-10-07",
      checkInTime: "12:00 PM",
      checkOutTime: "10:00 AM",
      status: "Reserved",
    },
  };
  const flags = lifecycleFlags(cell, TODAY, late);
  assert.equal(flags.isArrival, true);
  assert.equal(flags.isEveningOut, false);
});

test("in-house late departure today is Eve Out until they actually leave", () => {
  const cell = {
    statusKey: "CHECKOUT_DUE",
    booking: {
      checkIn: "2026-10-04",
      checkOut: TODAY,
      checkOutTime: "5:00 PM",
      arrivedAt: "4 Oct 2026 @ 1:00 PM",
    },
  };
  const flags = lifecycleFlags(cell, TODAY, late);
  assert.equal(flags.isArrival, false);
  assert.equal(flags.isEveningOut, true);
});

test("early check-out already departed is not Eve Out", () => {
  const cell = {
    statusKey: "UNDER_CLEANING",
    booking: {
      checkIn: "2026-10-03",
      checkOut: TODAY,
      checkOutTime: "5:00 PM",
      departedAt: "5 Oct 2026 @ 8:40 AM",
    },
  };
  assert.equal(lifecycleFlags(cell, TODAY, late).isEveningOut, false);
});

test("departure stamp suppresses Eve Out even if the room key is still in house", () => {
  const cell = {
    statusKey: "IN_HOUSE",
    booking: {
      checkIn: "2026-10-03",
      checkOut: TODAY,
      checkOutTime: "5:00 PM",
      arrivedAt: "3 Oct 2026 @ 4:00 PM",
      departedAt: "4 Oct 2026 @ 9:15 PM",
    },
  };
  const flags = lifecycleFlags(cell, TODAY, late);
  assert.equal(flags.isArrival, false);
  assert.equal(flags.isEveningOut, false);
});

test("Prime tag snippet matches the helper on the Shenbagam cell", () => {
  const src = `function tag(cell, selectedDateStr){
    const b=cell&&cell.booking;
    const cin=b?String(b.checkIn||b.check_in_date||"").slice(0,10):"";
    const cout=b?String(b.checkOut||b.check_out_date||"").slice(0,10):"";
    const cot=b&&(b.checkOutTime||b.check_out_time);
${PRIME_TAG_FLAG_LINES}
    return cell;
  }`;
  assert.equal(src.includes(PRIME_TAG_FLAG_LINES_OLD), false);
  const tag = new Function(`${src}; return tag;`)();
  const isLateCheckout = (v) => v === "5:00 PM";
  globalThis.isLateCheckout = isLateCheckout;
  const cell = tag({
    statusKey: "IN_HOUSE",
    booking: {
      checkIn: "2026-10-05",
      checkOut: "2026-10-07",
      arrivedAt: "4 Oct 2026 @ 10:51 PM",
      checkOutTime: "10:00 AM",
    },
  }, TODAY);
  assert.equal(cell.isArrival, false);
  const waiting = tag({
    statusKey: "CHECKIN_PENDING",
    booking: { checkIn: TODAY, checkOut: "2026-10-07", checkOutTime: "10:00 AM" },
  }, TODAY);
  assert.equal(waiting.isArrival, true);
  delete globalThis.isLateCheckout;
});
