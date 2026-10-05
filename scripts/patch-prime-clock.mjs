/**
 * Replace Prime's stacked hour/minute list with the analogue clock.
 *
 *   node scripts/patch-prime-clock.mjs path/to/app/index.html
 *
 * Choosing the minute saves, closes the sheet, and the existing handler
 * opens check-out time (or returns to the form). While the hand moves,
 * onPreview re-rates the stay.
 */
import fs from "node:fs";
import { clockSheetBundle } from "../src/desk/clock.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/patch-prime-clock.mjs <index.html>");
  process.exit(1);
}
const html = fs.readFileSync(file, "utf8");
if (html.includes("ezh-analogue-clock")) {
  console.log("already patched: " + file);
  process.exit(0);
}
const start = html.indexOf("function ClockPickSheet");
const end = html.indexOf("function WizardDots", start);
if (start < 0 || end < 0) {
  console.error("ClockPickSheet / WizardDots not found");
  process.exit(1);
}
const bookOld =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:form[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",onPick:val=>{setForm(f=>({...f,[timeSheet]:val}));if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const bookNew =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:form[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",liveRate:form.rooms&&form.rooms.length?inr(form.autoTotal):"",onPreview:val=>setStayTime(timeSheet,val),onPick:val=>{setStayTime(timeSheet,val);if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const otherOld =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:f[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",onPick:val=>{setF(x=>({...x,[timeSheet]:val}));if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const otherNew =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:f[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",liveRate:f.rooms&&f.rooms.length?inr(tariff):"",onPreview:val=>setF(x=>({...x,[timeSheet]:val})),onPick:val=>{setF(x=>({...x,[timeSheet]:val}));if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
if (!html.includes(bookOld) || html.split(otherOld).length - 1 !== 2) {
  console.error("clock call sites did not match the 20.77 desk");
  process.exit(1);
}
let next = html.slice(0, start) + clockSheetBundle() + "\n\n" + html.slice(end);
next = next.replace(bookOld, bookNew);
next = next.split(otherOld).join(otherNew);
fs.writeFileSync(file, next);
console.log("patched analogue clock in " + file);
