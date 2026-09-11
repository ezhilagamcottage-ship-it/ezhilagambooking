/* Staff desk service worker.
   Notification taps must open the related booking, not a blank launch.
   The click payload is set when the notification is shown; we turn it into
   the same /staff.html?type=&ref= URL the Android app can also fire. */
const CACHE = "ke-staff-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const dest = staffUrl(data);
  event.waitUntil(openDesk(dest));
});

function staffUrl(data) {
  const url = new URL("./staff.html", self.registration.scope);
  const type = data.type || data.n || "";
  const ref = data.ref || data.bookingId || "";
  if (type) url.searchParams.set("type", type);
  if (ref) url.searchParams.set("ref", ref);
  ["amount", "via", "from", "staff", "room", "guest", "pending", "id"].forEach((k) => {
    if (data[k] != null && data[k] !== "") url.searchParams.set(k, String(data[k]));
  });
  return url.href;
}

async function openDesk(dest) {
  const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of all) {
    if (client.url.includes("staff.html") && "focus" in client) {
      await client.navigate(dest);
      return client.focus();
    }
  }
  if (self.clients.openWindow) return self.clients.openWindow(dest);
}
