-- Create AddOn table
CREATE TABLE IF NOT EXISTS wedding."AddOn" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create BookingAddOn table
CREATE TABLE IF NOT EXISTS wedding."BookingAddOn" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "bookingId" TEXT NOT NULL,
    "addOnId" TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingAddOn_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES wedding."Booking"(id) ON DELETE CASCADE,
    CONSTRAINT "BookingAddOn_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES wedding."AddOn"(id)
);

-- Create unique constraint
ALTER TABLE wedding."BookingAddOn" ADD CONSTRAINT "BookingAddOn_bookingId_addOnId_key" UNIQUE ("bookingId", "addOnId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "BookingAddOn_bookingId_idx" ON wedding."BookingAddOn"("bookingId");
CREATE INDEX IF NOT EXISTS "BookingAddOn_addOnId_idx" ON wedding."BookingAddOn"("addOnId");

-- Add trigger to update updatedAt
CREATE OR REPLACE FUNCTION wedding.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_addon_updated_at BEFORE UPDATE ON wedding."AddOn"
    FOR EACH ROW EXECUTE FUNCTION wedding.update_updated_at_column();