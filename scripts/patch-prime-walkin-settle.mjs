/**
 * New Reservation walk-in step 2: segmented pay method, compact UPI proof,
 * no caution-deposit field, tariff and advance pinned above Confirm.
 *
 *   node scripts/patch-prime-walkin-settle.mjs path/to/app/index.html
 */
import fs from "node:fs";
import { walkInSettleBundle } from "../src/desk/walkin-settle.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/patch-prime-walkin-settle.mjs <index.html>");
  process.exit(1);
}

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

const METHOD_OLD =
  '/*#__PURE__*/React.createElement("div",null,/*#__PURE__*/React.createElement("label",{className:labelCls},"Payment method"),/*#__PURE__*/React.createElement("select",{className:inputCls,value:form.mode,onChange:e=>set("mode",e.target.value)},/*#__PURE__*/React.createElement("option",null,"Cash"),/*#__PURE__*/React.createElement("option",null,"UPI"))),/^upi$/i.test(form.mode)&&/*#__PURE__*/React.createElement("div",{"data-upi-shot":true},/*#__PURE__*/React.createElement(PhotoField,{label:"UPI payment screenshot",mandatory:effectiveAdvance(finalTotal)>0,value:upiShot,onChange:v=>{setUpiShot(v);setError("");},hint:effectiveAdvance(finalTotal)>0?"Choose a file or take a photo of the UPI confirmation":"Not needed until an advance is taken"})),';
const METHOD_NEW =
  '/*#__PURE__*/React.createElement("div",null,/*#__PURE__*/React.createElement("label",{className:labelCls},"Payment method"),WalkInPayMethods(form.mode,function(v){set("mode",v);})),WalkInUpiPanel(/^upi$/i.test(form.mode),effectiveAdvance(finalTotal)>0,upiShot,function(v){setUpiShot(v);setError("");},form.payRef,function(v){set("payRef",v);setError("");}),';

const TOTAL_MARK =
  ',/*#__PURE__*/React.createElement("div",{className:"grid grid-cols-2 gap-2.5"},/*#__PURE__*/React.createElement("div",null,/*#__PURE__*/React.createElement("label",{className:labelCls},"Total Tariff")';
const BALANCE_MARK =
  ',finalTotal>0&&/*#__PURE__*/React.createElement("p",{className:"text-[11px] font-bold text-slate-500"},"Balance at check-in:';
const CAUTION_MARK = ',/*#__PURE__*/React.createElement("div",{"data-caution-deposit":"auto"';
const PAYREF_END = 'set("payRef",e.target.value);setError("");}}))';
const FOOTER_START = 'footerContent:React.createElement("button",{type:"button","data-book-next":true,';
const FOOTER_END =
  'React.createElement(ChevronRight,{size:17})))},/*#__PURE__*/React.createElement("div",{"data-reserve-page":true';

const PHOTO_FILE_OLD =
  '/*#__PURE__*/React.createElement("input",{ref:inputRef,type:"file",accept:"image/*",capture:capture,className:"hidden",onChange:pick})';
const PHOTO_FILE_NEW =
  '/*#__PURE__*/React.createElement("input",{ref:inputRef,type:"file",accept:"image/*",capture:capture,className:"hidden",style:{display:"none"},onChange:pick})';
const PHOTO_SIG = "function PhotoField({label,mandatory,capture,value,onChange,hint,compact})";
const PHOTO_SIG_NEW = "function PhotoField({label,mandatory,capture,value,onChange,hint,compact,thumb})";
const PHOTO_IMG_OLD =
  'value?/*#__PURE__*/React.createElement("div",{className:"relative overflow-hidden rounded-xl border border-emerald-300"},/*#__PURE__*/React.createElement("img",{src:value.dataUrl,alt:"",className:(compact?"max-h-24":"max-h-40")+" w-full object-cover"})';
const PHOTO_IMG_NEW =
  'value?/*#__PURE__*/React.createElement("div",{className:"relative overflow-hidden rounded-xl border border-emerald-300",style:thumb?{height:84}:null},/*#__PURE__*/React.createElement("img",{src:value.dataUrl,alt:"",className:thumb?"block w-full object-cover":(compact?"max-h-24":"max-h-40")+" w-full object-cover",style:thumb?{height:84,width:"100%",objectFit:"cover"}:null})';
const PHOTO_BTN_OLD =
  'className:`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed ${compact?"py-3.5":"py-6"} text-[13px] font-bold touch-manipulation active:scale-[.98] ${mandatory?"border-amber-400 bg-amber-50 text-amber-700":"border-slate-300 bg-white text-slate-500"}`}';
const PHOTO_BTN_NEW =
  'className:(thumb?"w-full flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-2 text-[11px] font-extrabold leading-tight touch-manipulation ":"w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] font-bold touch-manipulation active:scale-[.98] "+(compact?"py-3.5 ":"py-6 "))+(mandatory?"border-amber-400 bg-amber-50 text-amber-700":"border-slate-300 bg-white text-slate-500"),style:thumb?{height:84,padding:8}:null}';

let html = fs.readFileSync(file, "utf8");
const original = html;

if (
  html.includes("ezh-walkin-settle") &&
  html.includes("data-settle-summary") &&
  !html.includes('{"data-caution-deposit":"auto"')
) {
  console.log("already settled: " + file);
  process.exit(0);
}

if (!html.includes("ezh-walkin-settle")) {
  const at = html.indexOf("function BookingPage({");
  if (at < 0) {
    console.error("BookingPage not found");
    process.exit(1);
  }
  html = html.slice(0, at) + walkInSettleBundle() + "\n" + html.slice(at);
}

if (html.includes(PHOTO_SIG)) {
  html = once(html, PHOTO_SIG, PHOTO_SIG_NEW, "PhotoField signature");
  html = once(html, PHOTO_FILE_OLD, PHOTO_FILE_NEW, "PhotoField file input");
  html = once(html, PHOTO_IMG_OLD, PHOTO_IMG_NEW, "PhotoField preview");
  html = once(html, PHOTO_BTN_OLD, PHOTO_BTN_NEW, "PhotoField tap zone");
} else if (!html.includes(PHOTO_SIG_NEW)) {
  console.error("PhotoField signature did not match");
  process.exit(1);
}

const totalAt = html.indexOf(TOTAL_MARK);
const rateEnd = html.indexOf(",subTotal>0&&", totalAt);
const balanceAt = html.indexOf(BALANCE_MARK);
const cautionAt = html.indexOf(CAUTION_MARK);
const payrefEnd = html.indexOf(PAYREF_END, cautionAt);
if (totalAt < 0 || rateEnd < 0 || balanceAt < 0 || cautionAt < 0 || payrefEnd < 0) {
  if (html.includes("data-settle-summary") && !html.includes("data-caution-deposit")) {
    console.log("already settled: " + file);
    process.exit(0);
  }
  console.error("settlement blocks were not found");
  process.exit(1);
}

const totalAndRate = html.slice(totalAt, rateEnd);
const balanceExpr = html.slice(balanceAt, cautionAt);
const cautionAndRef = html.slice(cautionAt, payrefEnd + PAYREF_END.length);
const rateSplit = totalAndRate.indexOf(",form.totalEdited&&");
if (rateSplit < 0) {
  console.error("rate override was not next to the tariff");
  process.exit(1);
}
const totalChild = totalAndRate.slice(1, rateSplit);
const rateChild = totalAndRate.slice(rateSplit + 1);
const balanceChild = balanceExpr.replace(/^,/, "");

html = once(html, METHOD_OLD, METHOD_NEW, "payment method");
html = once(html, totalAndRate, "", "tariff row");
html = once(html, balanceExpr, "", "balance line");
html = once(html, cautionAndRef, "", "caution and reference");

const summary =
  'wizStep<1?null:React.createElement("div",{"data-settle-summary":true,style:{marginBottom:10,borderRadius:16,border:"1px solid #e2e8f0",background:"#ffffff",padding:"10px 10px 8px",display:"flex",flexDirection:"column",gap:8}},/*#__PURE__*/React.createElement("p",{style:{margin:"0 0 2px",fontSize:11,fontWeight:800,letterSpacing:".06em",textTransform:"uppercase",color:"#94a3b8"}},"Settlement"),' +
  totalChild +
  "," +
  rateChild +
  "," +
  balanceChild +
  "),";

html = once(html, FOOTER_START, "footerContent:React.createElement(React.Fragment,null," + summary + FOOTER_START.slice("footerContent:".length), "confirm footer");
html = once(
  html,
  FOOTER_END,
  "React.createElement(ChevronRight,{size:17}))))},/*#__PURE__*/React.createElement(\"div\",{\"data-reserve-page\":true",
  "footer close"
);

const problems = [];
if (html.includes("data-caution-deposit")) problems.push("caution");
if (html.includes("Caution deposit (auto)")) problems.push("caution label");
if (html.includes(METHOD_OLD)) problems.push("old method");
if (!html.includes("ezh-walkin-settle")) problems.push("bundle");
if (count(html, "data-settle-summary") !== 1) problems.push("summary " + count(html, "data-settle-summary"));
if (count(html, "WalkInPayMethods(form.mode") !== 1) problems.push("methods " + count(html, "WalkInPayMethods(form.mode"));
if (count(html, "WalkInUpiPanel(/^upi$/i.test(form.mode)") !== 1) problems.push("panel " + count(html, "WalkInUpiPanel(/^upi$/i.test(form.mode)"));
if (count(html, "data-book-payref") !== 1) problems.push("payref " + count(html, "data-book-payref"));
if (count(html, "data-book-next") !== 1) problems.push("next " + count(html, "data-book-next"));
if (html.includes('value:form.mode,onChange:e=>set("mode"')) problems.push("select");
if (problems.length) {
  console.error("walk-in settlement patch did not land cleanly: " + problems.join(", "));
  process.exit(1);
}

if (html === original) {
  console.log("already settled: " + file);
  process.exit(0);
}

fs.writeFileSync(file, html);
console.log("patched walk-in settlement in " + file);
