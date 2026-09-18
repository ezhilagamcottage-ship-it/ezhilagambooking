#!/usr/bin/env node
/**
 * Notify Rakesh (or a given phone) that a cloud-agent task finished.
 * Prefer WhatsApp Cloud API when credentials exist; otherwise print a wa.me
 * deep link so the message can be sent by hand.
 *
 * Usage:
 *   node scripts/notify-task-complete.js [phoneDigits] [message...]
 */
const phone = String(process.argv[2] || "919840213184").replace(/\D/g, "");
const message = process.argv.slice(3).join(" ").trim() ||
  "Kutralam Ezhilagam: booking form streamlined — Address removed; Razorpay Pay ₹ amount locked (order_id + paise, non-editable).";

const token = process.env.WHATSAPP_TOKEN || process.env.WA_TOKEN || "";
const fromId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WA_PHONE_NUMBER_ID || "";

async function sendViaCloudApi() {
  if (!token || !fromId) return false;
  const url = `https://graph.facebook.com/v19.0/${fromId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: message }
    })
  });
  const body = await res.text();
  if (!res.ok) {
    console.error("WhatsApp API error:", res.status, body);
    return false;
  }
  console.log("Notified", phone, "via WhatsApp Cloud API");
  return true;
}

(async () => {
  try {
    if (await sendViaCloudApi()) process.exit(0);
  } catch (e) {
    console.error("WhatsApp send failed:", e && e.message ? e.message : e);
  }
  const link = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  console.log("No WhatsApp API credentials in env. Open this link to notify:");
  console.log(link);
  process.exit(0);
})();
