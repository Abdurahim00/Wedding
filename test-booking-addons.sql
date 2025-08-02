-- Test to see if BookingAddOn table has data
SELECT COUNT(*) as addon_count FROM wedding."BookingAddOn";

-- See all booking add-ons with details
SELECT 
  ba.id,
  ba."bookingId",
  ba."addOnId",
  ba.quantity,
  ba.price,
  b.name as booking_name,
  b.date as booking_date,
  a.name as addon_name,
  a.description as addon_description
FROM wedding."BookingAddOn" ba
JOIN wedding."Booking" b ON b.id = ba."bookingId"
JOIN wedding."AddOn" a ON a.id = ba."addOnId"
ORDER BY ba."createdAt" DESC
LIMIT 10;

-- Test the get_wedding_bookings_all function
SELECT id, name, email, "addOns" 
FROM public.get_wedding_bookings_all() 
WHERE "addOns"::text != '[]'
LIMIT 5;