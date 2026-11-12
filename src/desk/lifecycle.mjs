/**
 * Desk board lifecycle for the Arrivals and Eve Out chips.
 *
 * Prime's room matrix (`computeMatrixCell` → `tag`) used to set
 * `isArrival` from the scheduled check-in date alone. An early check-in
 * leaves that date where the reservation was booked (Rajavel / Shenbagam:
 * booked 5 Oct, walked in 4 Oct 10:51 PM, room already In-House) so the
 * same guest was counted as both Stay and a pending arrival.
 *
 * Booking status on the Direct sheet stays "Reserved" after check-in, so
 * the arrival signal is the room lifecycle (IN_HOUSE / CHECKED_IN /
 * CHECKOUT_DUE) or a real arrival stamp ("4 Oct 2026 @ 10:51 PM"), not
 * the status column.
 *
 * Scheduled `checkIn` / `checkOut` are the billed stay. They are not
 * rewritten when the guest arrives early or leaves early.
 */

const IN_HOUSE = new Set(["IN_HOUSE", "CHECKED_IN", "CHECKOUT_DUE"]);
const DEPARTED = new Set(["CHECKED_OUT", "UNDER_CLEANING", "MAINTENANCE", "AVAILABLE"]);

/** A desk stamp such as "4 Oct 2026 @ 10:51 PM", not a scheduled "12:00 PM". */
export function isDeskStamp(value) {
  const s = String(value || "").trim();
  return /@/.test(s) && /\d{4}/.test(s);
}

function bookingOf(cell) {
  return cell && cell.booking ? cell.booking : null;
}

function statusKey(cell) {
  return String((cell && (cell.statusKey || cell.state)) || "");
}

export function alreadyInHouse(cell) {
  const b = bookingOf(cell);
  if (IN_HOUSE.has(statusKey(cell))) return true;
  if (b && isDeskStamp(b.arrivedAt)) return true;
  return false;
}

export function alreadyDeparted(cell) {
  const b = bookingOf(cell);
  const sk = statusKey(cell);
  if (DEPARTED.has(sk)) return true;
  if (!b) return false;
  if (isDeskStamp(b.departedAt) || isDeskStamp(b.actualCheckOut) || isDeskStamp(b.actual_check_out)) return true;
  if (b.actualCheckOut || b.actual_check_out) return true;
  return false;
}

/**
 * @param {object} cell matrix cell (`statusKey` + `booking`)
 * @param {string} selectedDateStr YYYY-MM-DD
 * @param {(time: string) => boolean} [isLateCheckout]
 * @returns {{ isArrival: boolean, isEveningOut: boolean }}
 */
export function lifecycleFlags(cell, selectedDateStr, isLateCheckout) {
  const b = bookingOf(cell);
  const cin = b ? String(b.checkIn || b.check_in_date || "").slice(0, 10) : "";
  const cout = b ? String(b.checkOut || b.check_out_date || "").slice(0, 10) : "";
  const cot = b && (b.checkOutTime || b.check_out_time);
  const onArrivalDate = !!(cin && selectedDateStr && cin === selectedDateStr);
  const onDepartureDate = !!(cout && selectedDateStr && cout === selectedDateStr);
  const late = typeof isLateCheckout === "function" && !!isLateCheckout(cot);
  const departed = alreadyDeparted(cell);
  return {
    isArrival: onArrivalDate && !alreadyInHouse(cell) && !departed,
    isEveningOut: onDepartureDate && late && !departed,
  };
}

/** Replacement body for the two flag lines inside Prime's `tag` closure. */
export const PRIME_TAG_FLAG_LINES = `    const sk=String(cell.statusKey||cell.state||"");
    const arrivedStamp=String(b&&b.arrivedAt||"").trim();
    const depStamp=String(b&&(b.departedAt||b.actualCheckOut||b.actual_check_out)||"").trim();
    const realStamp=s=>/@/.test(s)&&/\\d{4}/.test(s);
    const alreadyIn=sk==="IN_HOUSE"||sk==="CHECKED_IN"||sk==="CHECKOUT_DUE"||realStamp(arrivedStamp);
    const alreadyOut=sk==="CHECKED_OUT"||sk==="UNDER_CLEANING"||sk==="MAINTENANCE"||sk==="AVAILABLE"||realStamp(depStamp)||!!(b&&(b.actualCheckOut||b.actual_check_out));
    cell.isArrival=!!(cin&&selectedDateStr&&cin===selectedDateStr&&!alreadyIn&&!alreadyOut);
    cell.isEveningOut=!!(cout&&selectedDateStr&&cout===selectedDateStr&&typeof isLateCheckout==="function"&&isLateCheckout(cot)&&!alreadyOut);`;

export const PRIME_TAG_FLAG_LINES_OLD = `    cell.isArrival=!!(cin&&selectedDateStr&&cin===selectedDateStr);
    cell.isEveningOut=!!(cout&&selectedDateStr&&cout===selectedDateStr&&typeof isLateCheckout==="function"&&isLateCheckout(cot));`;
