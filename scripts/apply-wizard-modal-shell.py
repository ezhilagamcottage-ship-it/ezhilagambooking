#!/usr/bin/env python3
"""Lift Check-In, Reservation, Enquiry, and Check-Out onto WizardModalShell.

The Prime app ships as one compiled index.html. This patches that file:
the master header is z-60, and the reservation / enquiry / check-out sheets
were z-50, so their titles rendered underneath it. Head count was also its
own nearly empty step. Dates, the nine-room grid, and occupancy now share
phase 1; guest and settlement share phase 2.
"""
import sys

SHELL_JS = r'''
function wizardRoomVerdict(name, checkIn, checkOut, bookings, states){
  const st=String(states&&states[name]||"");
  const cin=String(checkIn||"").slice(0,10);
  const cout=String(checkOut||"").slice(0,10);
  let overlap=false, turnover=false;
  (bookings||[]).forEach(b=>{
    if(!b)return;
    const status=String(b.status||b.state||"").toLowerCase();
    if(/cancel|no-show|noshow/.test(status))return;
    const raw=b.rooms||b.room||b.roomName||"";
    const rooms=Array.isArray(raw)?raw.map(String):String(raw).split(/[,+/&]/).map(s=>s.trim()).filter(Boolean);
    if(!rooms.includes(name))return;
    const bIn=String(b.checkIn||b.check_in||"").slice(0,10);
    const bOut=String(b.checkOut||b.check_out||"").slice(0,10);
    if(bOut&&cin&&bOut===cin)turnover=true;
    if(bIn&&bOut&&cin&&cout&&typeof overlaps==="function"&&overlaps(cin,cout,bIn,bOut))overlap=true;
  });
  const today=typeof TODAY!=="undefined"?TODAY:cin;
  if(overlap||(st==="checkedIn"&&cin===today))return "Occupied";
  if(turnover||st==="underCleaning"||st==="checkedOut"||st==="CHECKOUT_DUE")return "Turnover";
  return "Available";
}
function wizardPillProps(verdict, selected){
  const bg=selected?"rgba(255,255,255,.22)":verdict==="Occupied"?"#fee2e2":verdict==="Turnover"?"#ffedd5":"#d1fae5";
  const color=selected?"#fff":verdict==="Occupied"?"#b91c1c":verdict==="Turnover"?"#c2410c":"#047857";
  return { "data-room-pill":verdict, className:"mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide", style:{background:bg,color:color} };
}
function WizardModalShell({title,subtitle,badgeText,isOpen,onClose,currentStep,totalSteps,children,footerContent}){
  if(isOpen===false)return null;
  const steps=Math.max(1,Number(totalSteps==null?2:totalSteps)||1);
  const step=Math.max(1,Number(currentStep==null?1:currentStep)||1);
  return React.createElement("div",{"data-wizard-shell":true,className:"wizard-shell-root"},
    React.createElement("div",{"data-wizard-scrim":true,onClick:onClose,className:"wizard-shell-scrim"}),
    React.createElement("div",{className:"wizard-shell-sheet"},
      React.createElement("div",{className:"wizard-shell-bar"},
        React.createElement("div",{className:"wizard-shell-grab","aria-hidden":true}),
        React.createElement("div",{className:"wizard-shell-title-row"},
          React.createElement("div",{className:"min-w-0"},
            React.createElement("div",{className:"wizard-shell-title-line"},
              React.createElement("h3",{className:"wizard-shell-title"},title),
              badgeText?React.createElement("span",{className:"wizard-shell-badge"},badgeText):null
            ),
            subtitle?React.createElement("p",{className:"wizard-shell-sub"},subtitle):null
          ),
          React.createElement("button",{type:"button",onClick:onClose,"aria-label":"Close",className:"wizard-shell-x"},"\u2715")
        ),
        steps>1?React.createElement("div",{className:"wizard-shell-steps","data-wizard-steps":steps},
          Array.from({length:steps},(_,i)=>React.createElement("div",{key:i,className:"wizard-shell-step"+(step>=i+1?" is-on":"")}))
        ):null
      ),
      React.createElement("div",{"data-wizard-body":true,className:"wizard-shell-body"},children),
      React.createElement("div",{"data-wizard-footer":true,className:"wizard-shell-foot"},footerContent)
    )
  );
}
'''

SHELL_CSS = r'''
/* WizardModalShell — above the master header (z-60) and clear of its date bar. */
.wizard-shell-root{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;}
.wizard-shell-scrim{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);}
.wizard-shell-sheet{position:relative;width:100%;max-width:32rem;height:92dvh;background:#F8FAFC;border-radius:32px 32px 0 0;box-shadow:0 24px 60px rgba(15,23,42,.35);display:flex;flex-direction:column;overflow:hidden;border-top:1px solid #e2e8f0;animation:wizardSlideUp .28s cubic-bezier(.32,.72,.35,1);}
@keyframes wizardSlideUp{from{transform:translateY(28px);opacity:.55}to{transform:none;opacity:1}}
.wizard-shell-bar{padding:16px 20px 12px;background:#fff;border-bottom:1px solid rgba(226,232,240,.9);flex:none;}
.wizard-shell-grab{width:40px;height:4px;border-radius:99px;background:#cbd5e1;margin:0 auto 8px;}
.wizard-shell-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.wizard-shell-title-line{display:flex;align-items:center;gap:8px;min-width:0;}
.wizard-shell-title{margin:0;font-size:16px;font-weight:900;color:#0f172a;line-height:1.15;}
.wizard-shell-badge{padding:2px 8px;border-radius:99px;background:#f0fdfa;color:#0f766e;font-size:10px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;border:1px solid #99f6e4;white-space:nowrap;}
.wizard-shell-sub{margin:2px 0 0;font-size:11px;font-weight:600;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wizard-shell-x{width:32px;height:32px;border:0;border-radius:99px;background:#f1f5f9;color:#64748b;font-weight:800;cursor:pointer;flex:none;}
.wizard-shell-steps{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:8px;margin-top:10px;}
.wizard-shell-step{height:6px;border-radius:99px;background:#e2e8f0;}
.wizard-shell-step.is-on{background:#0d9488;}
.wizard-shell-body{flex:1;overflow-y:auto;min-height:0;padding:16px;display:flex;flex-direction:column;gap:16px;-webkit-overflow-scrolling:touch;}
.wizard-shell-foot{flex:none;padding:12px 16px calc(16px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid rgba(226,232,240,.9);}
.z-\[100\]{z-index:100}
'''


def once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {n}\n---\n{old[:180]}")
    return text.replace(old, new, 1)


def main():
    path = sys.argv[1]
    text = open(path, encoding="utf-8", errors="replace").read()
    if "function WizardModalShell(" in text:
        raise SystemExit("already patched")

    text = text.replace("const APP_VERSION=\"20.75\";const APP_VERSION_CODE=2075;",
                        "const APP_VERSION=\"20.76\";const APP_VERSION_CODE=2076;", 1)

    anchor = "function BookingPage("
    i = text.find(anchor)
    if i < 0:
        raise SystemExit("BookingPage missing")
    text = text[:i] + SHELL_JS + "\n" + text[i:]

    style_at = text.find("</style>")
    if style_at < 0:
        raise SystemExit("style missing")
    text = text[:style_at] + SHELL_CSS + text[style_at:]

    # --- Reservation: one stay phase, then guest & settlement ---
    text = once(text,
        'const stepReady=()=>{if(wizStep===0)return!!(form.checkIn&&form.checkOut&&form.checkInTime&&form.checkOutTime&&(form.checkOut>form.checkIn||(form.checkOut===form.checkIn&&dayUse)));if(wizStep===1)return form.rooms.length>0;if(wizStep===2)return form.adults>=1;if(wizStep===3)return!!(form.guest.trim()&&form.phone.replace(/\\D/g,"").length>=10);return true;};',
        'const stepReady=()=>{if(wizStep===0)return!!(form.checkIn&&form.checkOut&&form.checkInTime&&form.checkOutTime&&(form.checkOut>form.checkIn||(form.checkOut===form.checkIn&&dayUse))&&form.rooms.length>0&&form.adults>=1);if(wizStep>=1)return!!(form.guest.trim()&&form.phone.replace(/\\D/g,"").length>=10);return true;};',
        "stepReady")
    text = once(text,
        'const nextStep=()=>{setError("");if(!stepReady()){setError(wizStep===0?"Pick check-in and check-out dates and times.":wizStep===1?"Select at least one room.":wizStep===2?"Enter head count.":"Enter guest name and a 10-digit WhatsApp number.");return;}if(wizStep<3)setWizStep(s=>s+1);else submit();};',
        'const nextStep=()=>{setError("");if(!stepReady()){setError(wizStep===0?(form.rooms.length? "Pick check-in and check-out dates and times.":"Select at least one room."):"Enter guest name and a 10-digit WhatsApp number.");return;}if(wizStep<1)setWizStep(1);else submit();};',
        "nextStep")

    text = once(text,
        '(wizStep===0?/*#__PURE__*/React.createElement("div",{"data-reserve-wizard":"dates"',
        '(wizStep===0?/*#__PURE__*/React.createElement(React.Fragment,null,/*#__PURE__*/React.createElement("div",{"data-reserve-wizard":"dates"',
        "frag open")
    text = once(text,
        ':wizStep===1?/*#__PURE__*/React.createElement("div",{"data-reserve-wizard":"rooms"',
        ',/*#__PURE__*/React.createElement("p",{"data-stay-duration":true,className:"rounded-xl bg-white px-3 py-2 text-[12px] font-extrabold text-slate-700 shadow-sm"},n>0?(dayUse?"Day use · same day":n+(n>1?" nights":" night")+" · "+fmtDate(form.checkIn)+" → "+fmtDate(form.checkOut)):"Choose both dates — the nine rooms update immediately"),/*#__PURE__*/React.createElement("div",{"data-reserve-wizard":"rooms"',
        "duration")
    text = once(text, ':wizStep===2?', ',', "drop pax step")
    text = once(text,
        ')):/*#__PURE__*/React.createElement("div",{"data-reserve-wizard":"guest"',
        ')):/*#__PURE__*/React.createElement("div",{"data-reserve-wizard":"guest"',
        "close fragment")
    # the once() above is a no-op if old==new. Force the extra paren:
    old_guest = ')):/*#__PURE__*/React.createElement("div",{"data-reserve-wizard":"guest"'
    new_guest = '))):/*#__PURE__*/React.createElement("div",{"data-reserve-wizard":"guest"'
    text = once(text, old_guest, new_guest, "close fragment paren")

    old_chip = (
        'const tariffChip=`${r.name} • ${inr(r.rate)}`;return/*#__PURE__*/React.createElement("button",{key:r.name,onClick:()=>toggleRoom(r.name),disabled:blocked,"data-room-pick":r.name,"data-room-held":held?"1":undefined,"data-room-badge":true,className:`rounded-xl border px-1.5 py-2.5 text-center touch-manipulation transition-colors\n'
        '                        ${blocked?"border-slate-100 bg-slate-50 opacity-45":sel?"border-emerald-500 bg-emerald-500 text-white shadow-sm":shut?"border-purple-300 bg-purple-100 text-purple-800":held?"border-purple-400 bg-purple-50 text-purple-800":"border-slate-200 bg-white active:bg-emerald-50"}`},/*#__PURE__*/React.createElement("span",{className:`block text-[11px] font-extrabold leading-snug ${sel?"text-white":shut||held?"text-purple-800":blocked?"text-slate-400 line-through":"text-slate-700"}`},tariffChip),(blocked||shut||held||!canHaveAc(r.name))&&/*#__PURE__*/React.createElement("span",{className:`block text-[9px] font-bold ${sel?"text-emerald-100":blocked?"text-red-400":shut||held?"text-purple-600":"text-slate-400"}`},blocked?"Booked":shut?"Till 5 PM":held?"After 5 PM":"No AC"));})),'
    )
    new_chip = (
        'const verdict=blocked?"Occupied":(shut||held)?"Turnover":"Available";return/*#__PURE__*/React.createElement("button",{key:r.name,onClick:()=>toggleRoom(r.name),disabled:blocked,"data-room-pick":r.name,"data-room-status":verdict,"data-room-held":held?"1":undefined,"data-room-badge":true,className:`rounded-xl border px-1.5 py-2.5 text-center touch-manipulation transition-colors\n'
        '                        ${blocked?"border-slate-100 bg-slate-50 opacity-45":sel?"border-emerald-500 bg-emerald-500 text-white shadow-sm":shut?"border-purple-300 bg-purple-100 text-purple-800":held?"border-purple-400 bg-purple-50 text-purple-800":"border-slate-200 bg-white active:bg-emerald-50"}`},/*#__PURE__*/React.createElement("span",{className:`block text-[11px] font-extrabold leading-snug ${sel?"text-white":shut||held?"text-purple-800":blocked?"text-slate-400 line-through":"text-slate-700"}`},r.name),/*#__PURE__*/React.createElement("span",{className:`block text-[10px] font-bold ${sel?"text-emerald-50":"text-slate-500"}`},inr(r.rate),"/night"),/*#__PURE__*/React.createElement("span",wizardPillProps(verdict,sel),verdict),!canHaveAc(r.name)&&!blocked&&/*#__PURE__*/React.createElement("span",{className:`block text-[9px] font-bold ${sel?"text-emerald-100":"text-slate-400"}`},"No AC"));})),'
    )
    text = once(text, old_chip, new_chip, "room pills")

    text = once(text,
        'className:"flex-1 overflow-hidden px-4 pt-1 pb-28 space-y-3"',
        'className:"flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-28 space-y-3"',
        "scroll")
    text = once(text,
        '"data-reserve-page":true,className:"app-frame page-enter fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-100"',
        '"data-reserve-page":true,className:"app-frame page-enter fixed inset-0 z-[100] flex flex-col overflow-hidden bg-slate-100"',
        "reserve z")
    text = once(text, 'React.createElement(WizardDots,{total:4,at:wizStep})',
                'React.createElement(WizardDots,{total:2,at:Math.min(wizStep,1)})', "dots")
    text = once(text, '"Step "+(wizStep+1)+"/4 · Walk-In booking"',
                '"Step "+(Math.min(wizStep,1)+1)+"/2 · Stay, then guest"', "step label")
    text = once(text, 'onClick:()=>wizStep<3?nextStep():submit()',
                'onClick:()=>wizStep<1?nextStep():submit()', "footer click")
    if text.count('wizStep===3?') != 2:
        raise SystemExit("wizStep===3 count")
    text = text.replace('wizStep===3?', 'wizStep>=1?')

    # Reservation form view uses the shell instead of sitting under the master header.
    # The success screen keeps the full-page frame, raised to the same layer.
    old_open = 'return/*#__PURE__*/React.createElement("div",{"data-reserve-page":true,className:"app-frame page-enter fixed inset-0 z-[100] flex flex-col overflow-hidden bg-slate-100"},/*#__PURE__*/React.createElement("div",{className:"safe-t bg-slate-900 text-white shadow-md"},'
    # We'll splice the header out by locating HomeIcon close that belongs to this return.
    start = text.find(old_open)
    if start < 0:
        raise SystemExit("reserve open missing")
    home = text.find('React.createElement(HomeIcon,{size:20})))),view==="form"?', start)
    if home < 0 or home - start > 4000:
        raise SystemExit("reserve header end missing")
    header_end = home + len('React.createElement(HomeIcon,{size:20}))))')
    new_open = (
        'return view==="form"?/*#__PURE__*/React.createElement(WizardModalShell,{title:"New Reservation",subtitle:wizStep<1?"Dates, rooms and head count":"Guest, tariff and settlement",badgeText:"Walk-in",isOpen:true,onClose:bookBack,currentStep:Math.min(wizStep,1)+1,totalSteps:2,footerContent:null},/*#__PURE__*/React.createElement("div",{"data-reserve-page":true,className:"space-y-3"},'
    )
    # The old open included the header createElement start. Replace from start through header_end
    # with new_open, and the following `view==="form"?` fragment stays.
    text = text[:start] + new_open + text[header_end:]
    # header_end pointed at the comma before view===? We consumed through the closing parens
    # of the header, so the next chars are `,view==="form"?`.
    # new_open already ends ready for children. Drop `,view==="form"?` because the ternary
    # is now outside.
    marker = ',view==="form"?/*#__PURE__*/React.createElement(React.Fragment,null,/*#__PURE__*/React.createElement(WizardDots,{total:2,at:Math.min(wizStep,1)}),/*#__PURE__*/React.createElement("div",{className:"flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-28 space-y-3"},'
    if marker not in text:
        raise SystemExit("reserve fragment marker missing")
    text = text.replace(marker, '', 1)

    # Footer button moves into the shell footer. Remove the absolute bar and pass the button.
    foot_key = '/*#__PURE__*/React.createElement("div",{className:"pointer-events-none absolute inset-x-0 bottom-0"},/*#__PURE__*/React.createElement("div",{className:"pointer-events-auto border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur safe-b"},/*#__PURE__*/React.createElement("button",{type:"button","data-book-next":true,'
    # There may be more than one such footer. Restrict to the reservation button.
    idxs = []
    p = 0
    while True:
        j = text.find(foot_key, p)
        if j < 0:
            break
        idxs.append(j)
        p = j + 10
    # reservation footer contains data-book-next which is in foot_key. Filter those followed by wizStep.
    cands = [j for j in idxs if 'wizStep' in text[j:j+800]]
    if len(cands) != 1:
        raise SystemExit(f"reserve footer candidates {len(cands)} of {len(idxs)}")
    # paren match the footer element
    i = cands[0]
    paren = text.find("(", i)
    depth = 0
    k = paren
    instr = None
    while k < len(text):
        c = text[k]
        if instr:
            if c == "\\":
                k += 2
                continue
            if c == instr:
                instr = None
            k += 1
            continue
        if c in "\"'`":
            instr = c
            k += 1
            continue
        if c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                k += 1
                break
        k += 1
    footer_src = text[i:k]
    # pull the button element out
    bstart = footer_src.find('React.createElement("button"')
    if bstart < 0:
        raise SystemExit("button missing")
    # button is the last child; its end is the footer end minus two closing parens (inner div + outer div)
    button = footer_src[bstart:]
    # button currently ends with extra ) ) for the two wrappers. Strip the last two ')' if present.
    if not button.endswith("))"):
        raise SystemExit("footer tail " + button[-20:])
    button = button[:-2]
    # remove `,FOOTER` from the tree. The char before footer is a comma.
    if text[i-1] != ",":
        raise SystemExit("expected comma before footer")
    text = text[:i-1] + text[k:]
    text = text.replace("footerContent:null", "footerContent:" + button, 1)

    # The success branch used to be the else of view===form inside the page div.
    # After the splice, `):SUCCESS` still closes the shell ternary's false branch... 
    # We set `return view==="form"? Shell( ...children ) : SUCCESS`.
    # Children previously ended with timeSheet ternary then `):SUCCESS`.
    # That paren closed the Fragment. It now needs to close the inner space-y-3 div AND the shell call.
    # Original: Fragment( dots, div(steps), warns, footer, sheets ) : success ) page
    # We removed dots, the content div wrapper, and footer.
    # Remaining children of shell: space-y-3 div(steps), warns, sheets.
    # The paren that closed the content div still closes space-y-3.
    # The paren that closed Fragment now closes Shell. 
    # The paren that closed the page div is one extra.
    # We'll balance-check the script with node rather than guessing here, and fix if needed.

    text = text.replace(
        'setTimeSheet(null)}):null):/*#__PURE__*/React.createElement("div",{className:"flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-32 space-y-4"',
        'setTimeSheet(null)}):null):/*#__PURE__*/React.createElement("div",{className:"fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-slate-100 px-4 py-5 pb-32 space-y-4"',
        1)
    text = text.replace(
        'transition-transform"},"Done")))));}/* ================= Check-in page',
        'transition-transform"},"Done"))));}/* ================= Check-in page',
        1)

    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from wizard_phases import apply as apply_phases
    text = apply_phases(text)

    open(path, "w", encoding="utf-8").write(text)
    print("patched", path, "bytes", len(text))


if __name__ == "__main__":
    main()
