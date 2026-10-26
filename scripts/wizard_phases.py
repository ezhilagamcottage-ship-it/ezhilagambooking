"""Second pass: two-phase enquiry, walk-in check-in, reserved check-in, check-out.

Reservation is wrapped by apply-wizard-modal-shell.py. This pass:

- Telephone enquiry and walk-in check-in use WizardModalShell, with dates,
  the nine-room matrix, and head count on phase 1.
- Reserved check-in and check-out keep their status-colored headers (those
  screens also render the confirmation) but move to z-100, above the master
  header, and collapse to the same two phases.
"""


def once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {n}")
    return text.replace(old, new, 1)


def statement_end(text, start):
    """Index just after the statement that begins at start."""
    depth_p = 0
    depth_b = 0
    depth_k = 0
    i = start
    n = len(text)
    instr = None
    begun = False
    while i < n:
        c = text[i]
        if instr:
            if c == "\\":
                i += 2
                continue
            if c == instr:
                instr = None
            i += 1
            continue
        if c in "\"'`":
            instr = c
            i += 1
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "/":
            nl = text.find("\n", i)
            i = n if nl < 0 else nl + 1
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "*":
            i = text.find("*/", i + 2) + 2
            continue
        if c == "(":
            depth_p += 1
            begun = True
        elif c == ")":
            depth_p -= 1
        elif c == "{":
            depth_b += 1
            begun = True
        elif c == "}":
            depth_b -= 1
        elif c == "[":
            depth_k += 1
        elif c == "]":
            depth_k -= 1
        elif c == ";" and begun and depth_p == 0 and depth_b == 0 and depth_k == 0:
            return i + 1
        i += 1
    raise SystemExit("statement did not end")


def func_span(text, name):
    i = text.find("function " + name + "(")
    if i < 0:
        raise SystemExit(name + " missing")
    p = text.find("(", i)
    depth_p = 0
    k = p
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
            depth_p += 1
        elif c == ")":
            depth_p -= 1
            if depth_p == 0:
                k += 1
                break
        k += 1
    while text[k] in " \n\r\t":
        k += 1
    if text[k] != "{":
        raise SystemExit(name + " body missing")
    depth = 0
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
        if c == "/" and k + 1 < len(text) and text[k + 1] == "/":
            nl = text.find("\n", k)
            k = len(text) if nl < 0 else nl + 1
            continue
        if c == "/" and k + 1 < len(text) and text[k + 1] == "*":
            k = text.find("*/", k + 2) + 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i, k + 1
        k += 1
    raise SystemExit(name + " did not close")


def call_end(text, start):
    """Index just after the createElement/call that starts at start."""
    p = text.find("(", start)
    depth = 0
    k = p
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
                return k + 1
        k += 1
    raise SystemExit("call did not end")


def in_func(text, name, mutator):
    a, b = func_span(text, name)
    return text[:a] + mutator(text[a:b]) + text[b:]


ROOM_GRID = (
    'React.createElement("div",{className:"grid grid-cols-3 gap-2","data-room-matrix":"enquiry"},'
    "ROOMS.map(r=>{const verdict=wizardRoomVerdict(r.name,f.checkIn,f.checkOut,bookings,states);"
    "const sel=f.room===r.name;const blocked=verdict===\"Occupied\";"
    "return React.createElement(\"button\",{key:r.name,type:\"button\",\"data-te-room\":r.name,\"data-room-status\":verdict,disabled:blocked,"
    "onClick:()=>{if(blocked)return;set(\"room\",r.name);},"
    "className:\"rounded-xl border px-1.5 py-2 text-center touch-manipulation \"+(blocked?\"border-slate-100 bg-slate-50 opacity-50\":sel?\"border-cyan-600 bg-cyan-600 text-white\":\"border-slate-200 bg-white\")},"
    "React.createElement(\"span\",{className:\"block text-[11px] font-extrabold leading-snug\"},r.name),"
    "React.createElement(\"span\",{className:\"block text-[10px] font-bold opacity-80\"},\"\\u20b9\"+Number(r.rate||0).toLocaleString(\"en-IN\")+\"/night\"),"
    "React.createElement(\"span\",wizardPillProps(verdict,sel),verdict));}))"
)

DCI_GRID = (
    "ROOMS.map(r=>{const verdict=wizardRoomVerdict(r.name,f.checkIn,f.checkOut,bookings,states);"
    "const sel=f.rooms.includes(r.name);const blocked=verdict===\"Occupied\"&&!sel;"
    "return React.createElement(\"button\",{key:r.name,type:\"button\",\"data-ci3-room\":r.name,\"data-room-status\":verdict,disabled:blocked,"
    "onClick:()=>{if(blocked)return;toggleRoom(r.name);},"
    "className:\"rounded-xl border px-1.5 py-2.5 text-center touch-manipulation \"+(blocked?\"border-slate-100 bg-slate-50 opacity-50\":sel?\"border-amber-500 bg-amber-500 text-white shadow-sm\":\"border-slate-200 bg-white\")},"
    "React.createElement(\"span\",{className:\"block text-[11px] font-extrabold leading-snug\"},r.name),"
    "React.createElement(\"span\",{className:\"block text-[10px] font-bold opacity-90\"},inr(r.rate)+\"/night\"),"
    "React.createElement(\"span\",wizardPillProps(verdict,sel),verdict));})"
)


def patch_enquiry(src):
    src = once(src, 'const STEPS=["dates","room","pax","guest"];',
               'const STEPS=["stay","guest"];', "te steps")
    src = once(
        src,
        "  const stepReady=()=>{\n"
        "    if(stepIdx===0)return !!(f.checkIn&&f.checkOut&&f.checkInTime&&f.checkOutTime&&(f.checkOut>f.checkIn||f.checkOut===f.checkIn));\n"
        "    if(stepIdx===1)return !!f.room&&Number(f.rate)>0;\n"
        "    if(stepIdx===2)return Number(f.adults)>=0&&Number(f.children)>=0;\n"
        "    return ready;\n"
        "  };",
        "  const stepReady=()=>{\n"
        "    if(stepIdx===0)return !!(f.checkIn&&f.checkOut&&f.checkInTime&&f.checkOutTime&&(f.checkOut>f.checkIn||f.checkOut===f.checkIn)&&f.room&&Number(f.rate)>0);\n"
        "    return ready;\n"
        "  };",
        "te ready",
    )
    src = once(
        src,
        'if(!stepReady()){setErr(stepIdx===0?"Pick check-in and check-out dates and times.":stepIdx===1?"Pick an available room.":stepIdx===2?"Enter head count.":"Fill guest name and a 10-digit WhatsApp number.");return;}\n'
        "    if(stepIdx<STEPS.length-1)setStepIdx(s=>s+1);",
        'if(!stepReady()){setErr(stepIdx===0?"Pick dates and an available room.":"Fill guest name and a 10-digit WhatsApp number.");return;}\n'
        "    if(stepIdx<1)setStepIdx(1);",
        "te next",
    )
    src = once(
        src,
        "  useBackClose(true,()=>{if(timeSheet){setTimeSheet(null);return;}if(dateSheet){setDateSheet(null);return;}if(stepIdx>0){setStepIdx(s=>s-1);return;}onClose&&onClose();});",
        "  useBackClose(true,()=>{if(timeSheet){setTimeSheet(null);return;}if(dateSheet){setDateSheet(null);return;}if(stepIdx>0){setStepIdx(s=>s-1);return;}onClose&&onClose();});\n"
        "  useEffect(()=>{setF(x=>{if(!x.room)return x;if(wizardRoomVerdict(x.room,x.checkIn,x.checkOut,bookings,states)!==\"Occupied\")return x;return {...x,room:\"\",rate:x.rateEdited?x.rate:\"\"};});},[f.checkIn,f.checkOut]);",
        "te dates effect",
    )
    old_select = 'avail.length?React.createElement("select",{className:inputCls,value:f.room,onChange:e=>set("room",e.target.value)},avail.map(r=>React.createElement("option",{key:r.name,value:r.name},r.name+" · ₹"+Number(r.rate||0).toLocaleString("en-IN")))):React.createElement("p",{className:"text-[13px] font-bold text-rose-600"},"No rooms free")'
    src = once(src, old_select, ROOM_GRID, "te grid")
    src = once(src, '},"Available room")', '},"Rooms")', "te room label")

    marker = "  const body=(()=>{"
    found = src.find(marker)
    if found < 0 or "data-te-step" not in src[found:found + 4000]:
        raise SystemExit("te body missing")
    b0 = src.find("if(stepIdx===0)return ", found)
    e0 = statement_end(src, b0 + len("if(stepIdx===0)return "))
    b1 = src.find("if(stepIdx===1)return ", e0)
    e1 = statement_end(src, b1 + len("if(stepIdx===1)return "))
    b2 = src.find("if(stepIdx===2)return ", e1)
    e2 = statement_end(src, b2 + len("if(stepIdx===2)return "))
    dates = src[b0 + len("if(stepIdx===0)return "):e0].strip().rstrip(";")
    room = src[b1 + len("if(stepIdx===1)return "):e1].strip().rstrip(";")
    pax = src[b2 + len("if(stepIdx===2)return "):e2].strip().rstrip(";")
    duration = (
        'React.createElement("p",{"data-stay-duration":true,className:"rounded-xl bg-white px-3 py-2 text-[12px] font-extrabold text-slate-700 shadow-sm"},'
        '(f.checkIn&&f.checkOut)?(f.checkOut===f.checkIn?"Day use · same day":(Math.max(1,typeof daysApart==="function"?daysApart(f.checkIn,f.checkOut):1)+" night"+((typeof daysApart==="function"?daysApart(f.checkIn,f.checkOut):1)>1?"s":"")+" · "+fmtDate(f.checkIn)+" → "+fmtDate(f.checkOut))):"Choose both dates — the nine rooms update immediately")'
    )
    merged = (
        'if(stepIdx===0)return React.createElement("div",{className:"space-y-3","data-te-phase":"stay"},'
        + duration + "," + dates + "," + room + "," + pax + ");"
    )
    src = src[:b0] + merged + src[e2:]

    shell_start = src.find("const shell=children=>")
    shell_end = statement_end(src, shell_start)
    new_shell = (
        'const shell=(children,footer)=>React.createElement(WizardModalShell,{'
        'title:done?"Enquiry saved":"Telephone Enquiry",'
        'subtitle:handler||"Desk",'
        'badgeText:done?"Saved":(stepIdx<1?"Stay & room":"Guest"),'
        'isOpen:true,'
        'onClose:()=>{if(timeSheet){setTimeSheet(null);return;}if(dateSheet){setDateSheet(null);return;}if(stepIdx>0){setStepIdx(0);return;}onClose&&onClose();},'
        'currentStep:done?1:Math.min(stepIdx,1)+1,'
        'totalSteps:done?1:2,'
        'footerContent:footer||null'
        '},children);'
    )
    src = src[:shell_start] + new_shell + src[shell_end:]

    ret = src.find("return shell(React.createElement(React.Fragment,null,")
    if ret < 0:
        raise SystemExit("te form return missing")
    end = statement_end(src, ret)
    old = src[ret:end]
    date_at = old.find("dateSheet?")
    time_at = old.find("timeSheet?")
    if date_at < 0 or time_at < 0:
        raise SystemExit("te sheets missing")
    date_expr = old[date_at:time_at].strip().rstrip(",")
    time_expr = old[time_at:].strip()
    if not time_expr.endswith(");"):
        raise SystemExit("te return tail " + time_expr[-30:])
    time_expr = time_expr[:-2].rstrip()
    if not time_expr.endswith(")"):
        raise SystemExit("te fragment tail")
    time_expr = time_expr[:-1].rstrip()
    button = (
        'React.createElement("button",{type:"button","data-te-next":true,"data-te-submit":stepIdx>=1?"1":undefined,onClick:next,disabled:busy||(stepIdx>=1&&!ready),'
        'className:"w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-extrabold text-white touch-manipulation "+(busy?"bg-cyan-400":stepIdx>=1?"bg-cyan-600":"bg-slate-800")},'
        'busy?"Saving enquiry…":(stepIdx>=1?"Save Enquiry & Alert Group":React.createElement(React.Fragment,null,"Next ",React.createElement(ChevronRight,{size:18}))))'
    )
    new_return = (
        "return shell(React.createElement(React.Fragment,null,body,"
        'err?React.createElement("p",{"data-te-err":true,className:"text-[12px] font-bold text-rose-600"},err):null,'
        + date_expr + "," + time_expr + ")," + button + ");"
    )
    src = src[:ret] + new_return + src[end:]
    if 'data-te-phase":"stay"' not in src or "WizardModalShell" not in src:
        raise SystemExit("te patch incomplete")
    return src


def patch_direct(src):
    src = once(src, 'const STEPS=["stay","pax","guest"];',
               'const STEPS=["stay","guest"];', "ci3 steps")
    src = once(
        src,
        "if(n>=0&&n<=2){window.__ezhCi3PreviewStep=null;return n;}",
        "if(n>=0&&n<=2){window.__ezhCi3PreviewStep=null;return n>=1?1:0;}",
        "ci3 preview",
    )
    src = once(
        src,
        "  const stepReady=()=>{\n"
        "    if(stepIdx===0)return !!(f.checkIn&&f.checkOut&&f.checkInTime&&f.checkOutTime&&f.rooms.length&&(f.checkOut>f.checkIn||dayUse));\n"
        "    if(stepIdx===1)return Number(f.adults)>=1;\n"
        "    if(stepIdx===2){",
        "  const stepReady=()=>{\n"
        "    if(stepIdx===0)return !!(f.checkIn&&f.checkOut&&f.checkInTime&&f.checkOutTime&&f.rooms.length&&(f.checkOut>f.checkIn||dayUse)&&Number(f.adults)>=1);\n"
        "    if(stepIdx>=1){",
        "ci3 ready",
    )
    src = once(
        src,
        'setErr(stepIdx===0?"Pick stay dates, times, and at least one free room.":stepIdx===1?"Enter adults (and beds if needed).":"Guest, WhatsApp number, and payment are required.");\n'
        "      return;\n"
        "    }\n"
        "    if(stepIdx<2)setStepIdx(s=>s+1);",
        'setErr(stepIdx===0?"Pick dates, a free room, and head count.":"Guest, WhatsApp number, and payment are required.");\n'
        "      return;\n"
        "    }\n"
        "    if(stepIdx<1)setStepIdx(1);",
        "ci3 next",
    )
    src = once(
        src,
        '  const avail=ROOMS.filter(r=>{',
        '  useEffect(()=>{setF(x=>{const keep=x.rooms.filter(rn=>wizardRoomVerdict(rn,x.checkIn,x.checkOut,bookings,states)!=="Occupied");'
        "if(keep.length===x.rooms.length)return x;return {...x,rooms:keep,acRooms:(x.acRooms||[]).filter(r=>keep.includes(r))};});},[f.checkIn,f.checkOut]);\n"
        "  const avail=ROOMS.filter(r=>{",
        "ci3 effect",
    )
    old_grid = """avail.map(r=>{
            const sel=f.rooms.includes(r.name);
            return React.createElement("button",{key:r.name,type:"button","data-ci3-room":r.name,onClick:()=>toggleRoom(r.name),className:"rounded-xl border px-1.5 py-2.5 text-center touch-manipulation "+(sel?"border-amber-500 bg-amber-500 text-white shadow-sm":"border-slate-200 bg-white")},
              React.createElement("span",{className:"block text-[11px] font-extrabold leading-snug"},r.name),
              React.createElement("span",{className:"block text-[10px] font-bold opacity-90"},inr(r.rate)+"/night")
            );
          })"""
    src = once(src, old_grid, DCI_GRID, "ci3 grid")
    src = once(
        src,
        'timeBtn("checkInTime","Check-in time"),timeBtn("checkOutTime","Check-out time"))\n      ),',
        'timeBtn("checkInTime","Check-in time"),timeBtn("checkOutTime","Check-out time")),\n'
        '        React.createElement("p",{"data-stay-duration":true,className:"text-[12px] font-extrabold text-slate-600"},'
        'dayUse?"Day use · same day":((nNights>0?nNights+(nNights>1?" nights":" night"):"Choose both dates")+" · "+fmtDate(f.checkIn)+" → "+fmtDate(f.checkOut)+" · rooms update with the dates"))\n'
        "      ),",
        "ci3 duration",
    )
    src = once(src, '},"Available rooms")', '},"Rooms")', "ci3 room label")
    src = once(
        src,
        '!avail.length?React.createElement("p",{className:"mt-2 text-[12px] font-bold text-rose-600"},"No rooms free"):null',
        '!ROOMS.some(r=>wizardRoomVerdict(r.name,f.checkIn,f.checkOut,bookings,states)!=="Occupied")?React.createElement("p",{className:"mt-2 text-[12px] font-bold text-rose-600"},"No rooms free"):null',
        "ci3 empty",
    )
    src = once(
        src,
        '"data-ci3-summary":true,className:"mx-4 mb-2 grid grid-cols-3 gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5"',
        '"data-ci3-summary":true,className:"mb-2 grid grid-cols-3 gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5"',
        "ci3 summary",
    )
    z80 = 'className:"app-frame page-enter fixed inset-0 z-[80] flex flex-col overflow-hidden bg-slate-100"'
    z100 = 'className:"app-frame page-enter fixed inset-0 z-[100] flex flex-col overflow-hidden bg-slate-100"'
    if src.count(z80) < 1:
        raise SystemExit("ci3 z missing")
    src = src.replace(z80, z100)

    join = "}else if(stepIdx===1){"
    i = src.find('data-ci3-step":"stay"')
    if i < 0:
        raise SystemExit("ci3 stay missing")
    j = src.find(join, i)
    guest_else = src.find("}else{", j)
    if j < 0 or guest_else < 0:
        raise SystemExit("ci3 branches missing")
    pax_body = src[j + len(join):guest_else]
    assign = pax_body.find("body=")
    consts = pax_body[:assign].strip()
    elem = pax_body[assign + len("body="):].strip()
    if elem.endswith(";"):
        elem = elem[:-1].rstrip()
    close_at = src.rfind(");", i, j)
    if close_at < 0:
        raise SystemExit("ci3 stay close missing")
    src = src[:close_at] + "," + elem + src[close_at:j] + src[guest_else:]
    src = once(src, "  let body=null;", "  " + consts + "\n  let body=null;", "ci3 hoist")
    src = once(
        src,
        '{"data-ci3-step":"stay",className:"space-y-3"}',
        '{"data-ci3-step":"stay","data-ci3-phase":"stay",className:"space-y-3"}',
        "ci3 phase attr",
    )

    ret = src.find('return React.createElement("div",{"data-ci3-modal":true,"data-ci3-stepidx":stepIdx')
    if ret < 0:
        raise SystemExit("ci3 form return missing")
    end = statement_end(src, ret)
    old = src[ret:end]
    date_at = old.find("dateSheet?")
    time_at = old.find("timeSheet?")
    if date_at < 0 or time_at < 0:
        raise SystemExit("ci3 sheets missing")
    date_expr = old[date_at:time_at].strip().rstrip(",")
    time_expr = old[time_at:].strip()
    if not time_expr.endswith(");"):
        raise SystemExit("ci3 return tail " + repr(time_expr[-40:]))
    time_expr = time_expr[:-2].rstrip()
    if time_expr.endswith(")"):
        time_expr = time_expr[:-1].rstrip()
    new_return = (
        'return React.createElement(WizardModalShell,{title:"Check In",'
        'subtitle:stepIdx<1?"Dates, rooms and head count":"Guest, tariff and settlement",'
        'badgeText:"Walk-in",isOpen:true,onClose:back,currentStep:Math.min(stepIdx,1)+1,totalSteps:2,'
        "footerContent:React.createElement(React.Fragment,null,summary,"
        'err?React.createElement("p",{"data-ci3-err":true,className:"pb-1 text-[12px] font-bold text-rose-600"},err):null,'
        'React.createElement("div",{className:"grid grid-cols-2 gap-2"},'
        'React.createElement("button",{type:"button","data-ci3-back":true,onClick:back,disabled:busy,className:"rounded-xl border border-slate-300 bg-white py-3 text-[14px] font-extrabold text-slate-700 touch-manipulation"},"Back"),'
        'React.createElement("button",{type:"button","data-ci3-next":true,onClick:next,disabled:busy,className:"flex items-center justify-center gap-1.5 rounded-xl py-3 text-[14px] font-extrabold text-white touch-manipulation "+(busy?"bg-amber-400":stepIdx>=1?"bg-amber-600":"bg-slate-800")},'
        'busy?"Saving…":stepIdx>=1?React.createElement(React.Fragment,null,"Confirm · ",inr(advance||tariff)):React.createElement(React.Fragment,null,"Next ",React.createElement(ChevronRight,{size:17})))'
        "))},"
        'React.createElement("div",{"data-ci3-modal":true,"data-ci3-stepidx":stepIdx,className:"space-y-3"},body,'
        + date_expr + "," + time_expr + "));"
    )
    src = src[:ret] + new_return + src[end:]
    if "WizardModalShell" not in src or 'data-ci3-phase":"stay"' not in src:
        raise SystemExit("ci3 patch incomplete")
    return src


def patch_checkin(src):
    src = once(
        src,
        'const stepKeys=needsPayment?["id","details","payment","members"]:["id","details","members"];useEffect(()=>{if(!previewDefer)return;const i=stepKeys.indexOf("payment");if(i>=0)setStepIdx(i);},[]);',
        'const stepKeys=["stay","settle"];useEffect(()=>{if(!previewDefer)return;setStepIdx(1);},[]);',
        "ci keys",
    )
    src = once(src, 'if(stepKey==="payment"){const stepFin=',
               'if((stepKey==="settle"||stepKey==="payment")&&needsPayment){const stepFin=', "ci pay validate")
    src = once(src, 'if(stepKey==="id"){if(!idPhoto)',
               'if(stepKey==="stay"||stepKey==="id"){if(!idPhoto)', "ci id validate")
    src = once(src, 'if(stepKey==="details"){if(!form.city',
               'if(stepKey==="stay"||stepKey==="details"){if(!form.city', "ci details validate")
    src = once(src, 'if(stepKey==="members"){if(form.male',
               'if(stepKey==="settle"||stepKey==="members"){if(form.male', "ci members validate")
    src = once(
        src,
        '(stepKey==="id"||stepKey==="details"?"overflow-hidden":"overflow-y-auto overscroll-contain")',
        '"overflow-y-auto overscroll-contain"',
        "ci scroll",
    )
    src = once(src, ',stepKey==="id"&&/*#__PURE__*/',
               ',(stepKey==="stay"||stepKey==="id")&&/*#__PURE__*/', "ci id ui")
    src = once(src, ',stepKey==="details"&&/*#__PURE__*/',
               ',(stepKey==="stay"||stepKey==="details")&&/*#__PURE__*/', "ci details ui")
    src = once(src, ',stepKey==="payment"&&/*#__PURE__*/',
               ',((stepKey==="settle"||stepKey==="payment")&&needsPayment)&&/*#__PURE__*/', "ci pay ui")
    src = once(src, ',stepKey==="members"&&/*#__PURE__*/',
               ',(stepKey==="settle"||stepKey==="members")&&/*#__PURE__*/', "ci members ui")
    src = once(
        src,
        '"data-checkin-wizard":true,"data-ci-step":stepKey,className:"app-frame page-enter fixed inset-0 z-[80] flex flex-col overflow-x-hidden bg-slate-100"',
        '"data-checkin-wizard":true,"data-ci-step":stepKey,className:"app-frame page-enter fixed inset-0 z-[100] flex flex-col overflow-x-hidden bg-slate-100"',
        "ci z",
    )
    return src


def patch_checkout(src):
    src = once(src, 'const STEPS=["charges","payment","review"];',
               'const STEPS=["close","settle"];', "co steps")
    src = once(
        src,
        "const stepKey=STEPS[stepIdx];",
        'const stepKey=STEPS[stepIdx];const phaseClose=stepKey==="close"||stepKey==="charges";const phaseSettle=stepKey==="settle"||stepKey==="payment"||stepKey==="review";',
        "co phase",
    )
    src = once(src, 'if(stepKey==="charges"&&!outRooms.length)',
               "if(phaseClose&&!outRooms.length)", "co val charges")
    src = once(src, 'if(stepKey==="payment"&&needsMode)',
               "if(phaseSettle&&needsMode)", "co val pay")
    src = once(src, 'if(stepKey==="review"&&needsMode&&!pay.mode)',
               "if(phaseSettle&&needsMode&&!pay.mode)", "co val review")
    if src.count('(stepKey==="payment"||stepKey==="review")') < 1:
        raise SystemExit("co settle gates missing")
    src = src.replace('(stepKey==="payment"||stepKey==="review")', "phaseSettle")
    src = once(src, ',stepKey==="charges"&&/*#__PURE__*/',
               ",phaseClose&&/*#__PURE__*/", "co ui charges")
    src = once(src, ',stepKey==="payment"&&/*#__PURE__*/',
               ",phaseSettle&&/*#__PURE__*/", "co ui pay")
    src = once(src, ',stepKey==="review"&&/*#__PURE__*/',
               ",phaseSettle&&/*#__PURE__*/", "co ui review")
    src = once(
        src,
        'className:"app-frame page-enter fixed inset-0 z-50 flex flex-col overflow-x-hidden bg-slate-100"',
        'className:"app-frame page-enter fixed inset-0 z-[100] flex flex-col overflow-x-hidden bg-slate-100"',
        "co z",
    )
    src = once(src, '},"Step 2 · Payment & staff")', '},"Settlement")', "co pay label")
    src = once(src, '},"Step 3 · Review & confirm")', '},"Review & confirm")', "co review label")
    return src


def apply(text):
    text = in_func(text, "TelephoneEnquiryPage", patch_enquiry)
    text = in_func(text, "DirectCheckInPage", patch_direct)
    text = in_func(text, "CheckInPage", patch_checkin)
    text = in_func(text, "CheckOutPage", patch_checkout)
    return text
