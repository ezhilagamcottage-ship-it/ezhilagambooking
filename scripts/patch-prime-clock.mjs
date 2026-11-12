/**
 * Replace Prime's stacked hour/minute list with the analogue clock.
 *
 *   node scripts/patch-prime-clock.mjs path/to/app/index.html
 *
 * The time rows stay as they are. The clock opens only when a check-in or
 * check-out time is tapped. Choosing the minute saves that time, updates the
 * tariff, and closes the sheet. It does not open the other clock, and picking
 * a date does not open a clock. While the hand moves, onPreview re-rates the stay.
 */
import fs from "node:fs";
import { clockSheetBundle } from "../src/desk/clock.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/patch-prime-clock.mjs <index.html>");
  process.exit(1);
}

const DATE_OPEN = 'setDateSheet(null);setTimeSheet("checkInTime")';
const DATE_STAY = "setDateSheet(null)";
const CHAIN = 'if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);';
const CLOSE = "setTimeSheet(null);";

const bookOld =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:form[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",onPick:val=>{setForm(f=>({...f,[timeSheet]:val}));if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const bookChained =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:form[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",liveRate:form.rooms&&form.rooms.length?inr(form.autoTotal):"",onPreview:val=>setStayTime(timeSheet,val),onPick:val=>{setStayTime(timeSheet,val);if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const bookClick =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:form[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",liveRate:form.rooms&&form.rooms.length?inr(form.autoTotal):"",onPreview:val=>setStayTime(timeSheet,val),onPick:val=>{setStayTime(timeSheet,val);setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const otherOld =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:f[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",onPick:val=>{setF(x=>({...x,[timeSheet]:val}));if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const otherChained =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:f[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",liveRate:f.rooms&&f.rooms.length?inr(tariff):"",onPreview:val=>setF(x=>({...x,[timeSheet]:val})),onPick:val=>{setF(x=>({...x,[timeSheet]:val}));if(timeSheet==="checkInTime")setTimeSheet("checkOutTime");else setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const otherClick =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:f[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",liveRate:f.rooms&&f.rooms.length?inr(tariff):"",onPreview:val=>setF(x=>({...x,[timeSheet]:val})),onPick:val=>{setF(x=>({...x,[timeSheet]:val}));setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const book80 =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:form[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",onPick:val=>{setForm(f=>({...f,[timeSheet]:val}));setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const other80 =
  'React.createElement(ClockPickSheet,{key:timeSheet,open:true,title:timeSheet==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:f[timeSheet],accent:timeSheet==="checkInTime"?"blue":"orange",onPick:val=>{setF(x=>({...x,[timeSheet]:val}));setTimeSheet(null);},onClose:()=>setTimeSheet(null)})';
const stay80 =
  'React.createElement(ClockPickSheet,{key:(stayClock.rn||"")+"-"+(stayClock.field||""),open:true,title:stayClock.field==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:(form.stays&&form.stays[stayClock.rn]&&form.stays[stayClock.rn][stayClock.field])||(stayClock.field==="checkInTime"?DEFAULT_CHECKIN_TIME:DEFAULT_CHECKOUT_TIME),accent:stayClock.field==="checkInTime"?"blue":"orange",onPick:val=>{setStay(stayClock.rn,{[stayClock.field]:val});setStayClock(null);},onClose:()=>setStayClock(null)})';
const stayClick =
  'React.createElement(ClockPickSheet,{key:(stayClock.rn||"")+"-"+(stayClock.field||""),open:true,title:stayClock.field==="checkInTime"?"CHECK-IN TIME":"CHECK-OUT TIME",value:(form.stays&&form.stays[stayClock.rn]&&form.stays[stayClock.rn][stayClock.field])||(stayClock.field==="checkInTime"?DEFAULT_CHECKIN_TIME:DEFAULT_CHECKOUT_TIME),accent:stayClock.field==="checkInTime"?"blue":"orange",liveRate:form.rooms&&form.rooms.length?inr(form.autoTotal):"",onPreview:val=>setStay(stayClock.rn,{[stayClock.field]:val}),onPick:val=>{setStay(stayClock.rn,{[stayClock.field]:val});setStayClock(null);},onClose:()=>setStayClock(null)})';
const revise80 =
  'React.createElement(ClockPickSheet,{"data-revise-clock":true,key:"revise-time",open:true,title:"CHECK-OUT TIME",value:time,accent:"orange",onPick:val=>{setTime(val);setErr("");setClockOpen(false);},onClose:()=>setClockOpen(false)})';
const reviseClick =
  'React.createElement(ClockPickSheet,{"data-revise-clock":true,key:"revise-time",open:true,title:"CHECK-OUT TIME",value:time,accent:"orange",onPreview:val=>{setTime(val);setErr("");},onPick:val=>{setTime(val);setErr("");setClockOpen(false);},onClose:()=>setClockOpen(false)})';
const ext80 =
  'React.createElement(ClockPickSheet,{"data-ext-clock":true,key:"ext-time",open:true,title:"CHECK-OUT TIME",value:time,accent:"orange",onPick:val=>{setTime(val);setError("");setClockOpen(false);},onClose:()=>setClockOpen(false)})';
const extClick =
  'React.createElement(ClockPickSheet,{"data-ext-clock":true,key:"ext-time",open:true,title:"CHECK-OUT TIME",value:time,accent:"orange",onPreview:val=>{setTime(val);setError("");},onPick:val=>{setTime(val);setError("");setClockOpen(false);},onClose:()=>setClockOpen(false)})';

function count(text, needle) {
  return text.split(needle).length - 1;
}

function once(text, from, to, label) {
  const hits = count(text, from);
  if (hits !== 1) {
    console.error(label + " matched " + hits + " times");
    process.exit(1);
  }
  return text.replace(from, to);
}

let html = fs.readFileSync(file, "utf8");
let next = html;

if (!next.includes("ezh-analogue-clock")) {
  const start = next.indexOf("function ClockPickSheet");
  const end = next.indexOf("function WizardDots", start);
  if (start < 0 || end < 0) {
    console.error("ClockPickSheet / WizardDots not found");
    process.exit(1);
  }
  next = next.slice(0, start) + clockSheetBundle() + "\n\n" + next.slice(end);
}

if (next.includes(bookOld)) next = once(next, bookOld, bookClick, "booking clock");
else if (next.includes(bookChained)) next = once(next, bookChained, bookClick, "booking clock chain");
else if (next.includes(book80)) next = once(next, book80, bookClick, "booking clock 20.80");
else if (!next.includes(bookClick)) {
  console.error("booking clock call site did not match");
  process.exit(1);
}

if (next.includes(otherOld)) {
  if (count(next, otherOld) !== 2) {
    console.error("telephone/direct clock matched " + count(next, otherOld) + " times");
    process.exit(1);
  }
  next = next.split(otherOld).join(otherClick);
} else if (next.includes(otherChained)) {
  if (count(next, otherChained) !== 2) {
    console.error("telephone/direct clock chain matched " + count(next, otherChained) + " times");
    process.exit(1);
  }
  next = next.split(otherChained).join(otherClick);
} else if (next.includes(other80)) {
  if (count(next, other80) !== 2) {
    console.error("telephone/direct clock 20.80 matched " + count(next, other80) + " times");
    process.exit(1);
  }
  next = next.split(other80).join(otherClick);
} else if (count(next, otherClick) !== 2) {
  console.error("telephone/direct clock call sites did not match");
  process.exit(1);
}

if (next.includes(stay80)) next = once(next, stay80, stayClick, "stay clock");
if (next.includes(revise80)) next = once(next, revise80, reviseClick, "revise clock");
if (next.includes(ext80)) next = once(next, ext80, extClick, "extension clock");

next = next.split(DATE_OPEN).join(DATE_STAY);

if (
  next.includes(DATE_OPEN) ||
  next.includes(CHAIN) ||
  next.includes("Set time") ||
  !next.includes("ezh-analogue-clock") ||
  count(next, bookClick) !== 1 ||
  count(next, otherClick) !== 2 ||
  count(next, 'onClick:()=>setTimeSheet("checkInTime")') !== 1 ||
  count(next, 'onClick:()=>setTimeSheet("checkOutTime")') !== 1 ||
  count(next, "onClick:()=>setTimeSheet(field)") !== 2 ||
  !next.includes(CLOSE)
) {
  console.error("clock still opens on its own, or a tap opener was lost");
  process.exit(1);
}

if (next === html) {
  console.log("already click-to-open: " + file);
  process.exit(0);
}

fs.writeFileSync(file, next);
console.log("patched click-to-open analogue clock in " + file);
