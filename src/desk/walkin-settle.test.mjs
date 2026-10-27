import test from "node:test";
import assert from "node:assert/strict";
import { walkInPayMethodList, walkInSettleBundle } from "./walkin-settle.mjs";

test("UPI and Cash are always offered, Card only when configured", () => {
  assert.deepEqual(walkInPayMethodList(["Cash", "UPI"]), ["UPI", "Cash"]);
  assert.deepEqual(walkInPayMethodList(undefined), ["UPI", "Cash"]);
  assert.deepEqual(walkInPayMethodList(["Cash", "UPI", "Card", "Bank"]), ["UPI", "Cash", "Card"]);
});

test("settlement bundle is the segmented clock-free payment row", () => {
  const src = walkInSettleBundle();
  assert.match(src, /ezh-walkin-settle/);
  assert.match(src, /function WalkInPayMethods/);
  assert.match(src, /function WalkInUpiPanel/);
  assert.match(src, /data-pay-method/);
  assert.match(src, /data-upi-panel/);
  assert.doesNotMatch(src, /Caution deposit/);
  assert.doesNotMatch(src, /<select/);
  new Function(src + "\nreturn WalkInUpiPanel;");
});
