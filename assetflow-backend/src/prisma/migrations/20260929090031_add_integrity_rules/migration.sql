-- Business rules enforced by the database itself.
-- (The Prisma schema language cannot express CHECK constraints or triggers.)

-- 1. An assignment is RETURNED if and only if it has a return date
ALTER TABLE "asset_assignments"
  ADD CONSTRAINT "asset_assignments_return_consistency_chk"
  CHECK (("status" = 'RETURNED') = ("returnedAt" IS NOT NULL));

-- 2. An asset cannot be returned before it was assigned
ALTER TABLE "asset_assignments"
  ADD CONSTRAINT "asset_assignments_return_after_assign_chk"
  CHECK ("returnedAt" IS NULL OR "returnedAt" >= "assignedAt");

-- 3. Money and dates must make sense
ALTER TABLE "assets"
  ADD CONSTRAINT "assets_purchase_price_non_negative_chk"
  CHECK ("purchasePrice" IS NULL OR "purchasePrice" >= 0);

ALTER TABLE "assets"
  ADD CONSTRAINT "assets_warranty_after_purchase_chk"
  CHECK ("warrantyExpiryDate" IS NULL OR "purchaseDate" IS NULL OR "warrantyExpiryDate" >= "purchaseDate");

-- 4. Asset history is an immutable audit log (append-only)
CREATE OR REPLACE FUNCTION "prevent_asset_history_changes"()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'asset_history is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "asset_history_append_only"
BEFORE UPDATE OR DELETE ON "asset_history"
FOR EACH ROW EXECUTE FUNCTION "prevent_asset_history_changes"();
