/**
 * New Reservation walk-in step 2 (guest, tariff and settlement).
 * Injected into the Prime desk by scripts/patch-prime-walkin-settle.mjs.
 *
 * UPI and Cash are always offered. Card is added only when the desk's
 * configured method list includes it (DAYBOOK_METHODS). Cash and Card keep
 * the UPI proof row collapsed.
 */

export function walkInPayMethodList(configured) {
  const methods = ["UPI", "Cash"];
  const extra = Array.isArray(configured) ? configured : [];
  if (extra.some((m) => String(m).toLowerCase() === "card")) methods.push("Card");
  return methods;
}

export function WalkInPayMethods(mode, onPick) {
  const configured = typeof DAYBOOK_METHODS !== "undefined" ? DAYBOOK_METHODS : ["UPI", "Cash"];
  const methods = walkInPayMethodList(configured);
  const current = String(mode || "");
  return React.createElement(
    "div",
    {
      "data-pay-methods": methods.join(","),
      role: "group",
      "aria-label": "Payment method",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(" + methods.length + ", minmax(0, 1fr))",
        gap: 4,
        padding: 4,
        borderRadius: 14,
        background: "#f1f5f9",
      },
    },
    methods.map((val) => {
      const on = current.toLowerCase() === val.toLowerCase();
      return React.createElement(
        "button",
        {
          key: val,
          type: "button",
          "data-pay-method": val,
          onClick: () => onPick(val),
          style: {
            border: "none",
            borderRadius: 11,
            minHeight: 44,
            padding: "10px 6px",
            fontWeight: 800,
            fontSize: 14,
            background: on ? "#0f766e" : "transparent",
            color: on ? "#ffffff" : "#334155",
            boxShadow: on ? "0 1px 2px rgba(15,23,42,.12)" : "none",
            transition: "background 160ms ease, color 160ms ease",
          },
        },
        val
      );
    })
  );
}

export function WalkInUpiPanel(open, mandatory, shot, onShot, payRef, onRef) {
  return React.createElement(
    "div",
    {
      "data-upi-panel": "1",
      "data-upi-open": open ? "1" : "0",
      style: {
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transition: "grid-template-rows 240ms cubic-bezier(.22,.9,.24,1), opacity 180ms ease",
      },
    },
    React.createElement(
      "div",
      { style: { overflow: "hidden", minHeight: 0, pointerEvents: open ? "auto" : "none" } },
      React.createElement(
        "div",
        {
          "data-upi-shot": true,
          style: {
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.86fr) minmax(0, 1.14fr)",
            gap: 10,
            paddingTop: 8,
          },
        },
        React.createElement(PhotoField, {
          label: "Screenshot",
          mandatory: !!mandatory,
          compact: true,
          thumb: true,
          value: shot,
          onChange: onShot,
          hint: "Tap photo",
        }),
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            {
              style: {
                display: "block",
                marginBottom: 6,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#94a3b8",
              },
            },
            "UPI reference",
            mandatory
              ? React.createElement("span", { style: { color: "#ef4444" } }, " *")
              : null
          ),
          React.createElement("input", {
            "data-book-payref": true,
            value: payRef || "",
            placeholder: "Transaction ID",
            tabIndex: open ? 0 : -1,
            onChange: (e) => onRef(e.target.value),
            style: {
              width: "100%",
              boxSizing: "border-box",
              height: 44,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "#fff",
              padding: "12px",
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
            },
          })
        )
      )
    )
  );
}

export function walkInSettleBundle() {
  return (
    "/* ezh-walkin-settle */\n" +
    [walkInPayMethodList, WalkInPayMethods, WalkInUpiPanel].map((fn) => fn.toString()).join("\n")
  );
}
