import test from "node:test";
import assert from "node:assert/strict";
import {
  ezhClockPointerAngle,
  ezhClockAngleToHour,
  ezhClockAngleToMinute,
  ezhClockParse,
  ezhClockToHHMM,
  ezhClockRateLine,
  clockSheetBundle,
} from "./clock.mjs";

test("12 o'clock is up, 3 is right, 6 is down", () => {
  assert.equal(Math.round(ezhClockPointerAngle(100, 100, 100, 40)), 0);
  assert.equal(Math.round(ezhClockPointerAngle(100, 100, 160, 100)), 90);
  assert.equal(Math.round(ezhClockPointerAngle(100, 100, 100, 160)), 180);
});

test("hour and minute snap around the face", () => {
  assert.equal(ezhClockAngleToHour(0), 12);
  assert.equal(ezhClockAngleToHour(30), 1);
  assert.equal(ezhClockAngleToHour(90), 3);
  assert.equal(ezhClockAngleToHour(180), 6);
  assert.equal(ezhClockAngleToHour(359), 12);
  assert.equal(ezhClockAngleToMinute(0), 0);
  assert.equal(ezhClockAngleToMinute(90), 15);
  assert.equal(ezhClockAngleToMinute(180), 30);
  assert.equal(ezhClockAngleToMinute(359), 0);
  assert.equal(ezhClockAngleToMinute(33), 6);
});

test("12-hour hands become the 24-hour value the tariff uses", () => {
  assert.equal(ezhClockToHHMM(12, 0, "AM"), "00:00");
  assert.equal(ezhClockToHHMM(12, 0, "PM"), "12:00");
  assert.equal(ezhClockToHHMM(5, 7, "PM"), "17:07");
  assert.equal(ezhClockToHHMM(10, 0, "AM"), "10:00");
  assert.deepEqual(ezhClockParse("17:07"), { hour: 5, minute: 7, ap: "PM" });
  assert.deepEqual(ezhClockParse("5:07 PM"), { hour: 5, minute: 7, ap: "PM" });
  assert.deepEqual(ezhClockParse("00:15"), { hour: 12, minute: 15, ap: "AM" });
});

test("tariff line follows the same minute edges as the desk rate", () => {
  assert.equal(ezhClockRateLine("CHECK-IN TIME", "16:59").text, "Before 5:00 PM · full night");
  assert.equal(ezhClockRateLine("CHECK-IN TIME", "17:00").tone, "down");
  assert.equal(ezhClockRateLine("CHECK-OUT TIME", "10:00").tone, "flat");
  assert.equal(ezhClockRateLine("CHECK-OUT TIME", "10:01").text, "By 1:00 PM · quarter night extra");
  assert.equal(ezhClockRateLine("CHECK-OUT TIME", "13:00").tone, "up");
  assert.equal(ezhClockRateLine("CHECK-OUT TIME", "13:01").text, "After 1:00 PM · half night extra");
});

test("bundle parses as a script and is the analogue clock", () => {
  const src = clockSheetBundle();
  assert.match(src, /ezh-analogue-clock/);
  assert.match(src, /function ClockPickSheet/);
  assert.doesNotMatch(src, /Set time/);
  new Function(src + "\nreturn ClockPickSheet;");
});
