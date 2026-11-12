-- Early check-in / early check-out lifecycle.
-- Scheduled check_in and check_out stay the billed stay. The actual walk-in
-- and walk-out are recorded beside them so a guest already in the room is
-- not still an arrival, and a guest who has left is not still due out.
-- Desk stamps are India wall time ("4 Oct 2026 @ 10:51 PM").

SET LOCAL TIME ZONE 'UTC';

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS actual_check_in timestamptz;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS is_early_checkin boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.bookings.actual_check_in IS
  'Wall-clock arrival when the desk confirmed check-in. Scheduled check_in stays the billed stay start.';

COMMENT ON COLUMN public.bookings.is_early_checkin IS
  'True when the guest was in the room before the scheduled check_in date.';

UPDATE public.bookings
SET actual_check_in = (
  to_timestamp(check_in_time, 'FMDD Mon YYYY @ HH12:MI AM')::timestamp
  AT TIME ZONE 'Asia/Kolkata'
)
WHERE actual_check_in IS NULL
  AND check_in_time ~ '^[0-9]{1,2} [A-Za-z]{3,9} [0-9]{4} @';

UPDATE public.bookings
SET is_early_checkin = true
WHERE actual_check_in IS NOT NULL
  AND (actual_check_in AT TIME ZONE 'Asia/Kolkata')::date < check_in
  AND status ILIKE 'checked in%';

UPDATE public.bookings
SET is_early_checkout = true
WHERE actual_check_out IS NOT NULL
  AND (actual_check_out AT TIME ZONE 'Asia/Kolkata')::date < check_out
  AND COALESCE(is_early_checkout, false) = false;

-- Shenbagam is occupied by the early arrival. The rooms row had stayed Ready.
UPDATE public.rooms
SET status = 'Occupied',
    current_booking_id = 'LOCT10526',
    updated_at = now(),
    updated_by = 'lifecycle-sync'
WHERE room_name = 'Shenbagam'
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.booking_id = 'LOCT10526'
      AND b.status ILIKE 'checked in%'
      AND b.check_out > (now() AT TIME ZONE 'Asia/Kolkata')::date
  );

-- Cached board payload still said Reserved for a guest the room already
-- lists as checked in. Status on this copy is informational; the chip
-- itself is computed in the desk app from the scheduled date.
UPDATE public.app_sync_snapshot
SET payload = jsonb_set(
      payload,
      '{bookings,bookings}',
      (
        SELECT COALESCE(jsonb_agg(
          CASE
            WHEN elem->>'bookingId' = 'LOCT10526'
            THEN elem || jsonb_build_object(
              'status', 'Checked In',
              'arrivedAt', '4 Oct 2026 @ 10:51 PM'
            )
            ELSE elem
          END
        ), '[]'::jsonb)
        FROM jsonb_array_elements(payload->'bookings'->'bookings') elem
      ),
      true
    ),
    updated_at = now()
WHERE id = 'live'
  AND jsonb_typeof(payload->'bookings'->'bookings') = 'array';
