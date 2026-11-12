#!/usr/bin/env node
/**
 * Patch Ezhilagam Prime app/index.html so same-day 6:00 AM → 5:00 PM
 * walk-ins are not refused as "not Day Use".
 *
 *   node tests/apply-prime-same-day-morning.mjs /path/to/ezhilagam-prime/app/index.html
 *
 * Default path: app/index.html (run from the Prime repo root).
 */
import fs from "node:fs";
import path from "node:path";

const target = path.resolve(process.argv[2] || "app/index.html");
let html = fs.readFileSync(target, "utf8");
const original = html;

const helper =
  "/* Same calendar day is valid when departure is later on the clock than arrival. " +
  "Day Use (noon–5 PM) already qualifies. A 6 AM walk-in leaving at 5 PM does too. */" +
  "const stayEndsAfterStart=(checkIn,checkOut,checkInTime,checkOutTime)=>{" +
  "if(!checkIn||!checkOut)return false;" +
  "if(checkOut>checkIn)return true;" +
  "if(checkOut<checkIn)return false;" +
  "const inT=to24h(checkInTime)||DEFAULT_CHECKIN_TIME;" +
  "const outT=to24h(checkOutTime)||DEFAULT_CHECKOUT_TIME;" +
  "return outT>inT;};";

const isDayUse =
  'const isDayUseSlot=(checkIn,checkOut,checkInTime,checkOutTime)=>!!checkIn&&checkIn===checkOut&&to24h(checkInTime)==="12:00"&&to24h(checkOutTime)==="17:00";';

const oldGate =
  "if(!form.checkIn||!form.checkOut||form.checkOut<form.checkIn||form.checkOut===form.checkIn&&!dayUse)return setError(\"Check-out must be after check-in, except for same-day Day Use from 12:00 PM to 5:00 PM.\");";

const newGate =
  "if(!form.checkIn||!form.checkOut||!stayEndsAfterStart(form.checkIn,form.checkOut,form.checkInTime,form.checkOutTime))return setError(\"Check-out must be after check-in, except for same-day Day Use from 12:00 PM to 5:00 PM.\");";

if (!html.includes(isDayUse)) {
  throw new Error(`${target}: isDayUseSlot definition not found`);
}
if (!html.includes(oldGate) && !html.includes(newGate)) {
  throw new Error(`${target}: walk-in date gate not found`);
}

if (!html.includes("const stayEndsAfterStart=")) {
  html = html.replace(isDayUse, isDayUse + helper);
}

if (html.includes(oldGate)) {
  html = html.replace(oldGate, newGate);
}

html = html.replace(
  /const APP_VERSION="17\.41"/,
  'const APP_VERSION="17.42"',
);

if (html === original) {
  if (html.includes("const stayEndsAfterStart=") && html.includes(newGate)) {
    console.log(`${target}: already patched`);
    process.exit(0);
  }
  throw new Error(`${target}: no changes applied`);
}

fs.writeFileSync(target, html);
const version = (html.match(/const APP_VERSION="([^"]+)"/) || [])[1] || "?";
console.log(`patched ${target}  APP_VERSION=${version}`);
