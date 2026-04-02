-- Safe transition for role/session columns on existing databases.
-- This migration is idempotent and preserves existing platformRole values.
DO $$
DECLARE
  platform_role_type TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'platformRole'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "platformRole" TEXT;
  END IF;

  SELECT data_type
  INTO platform_role_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'User'
    AND column_name = 'platformRole';

  IF platform_role_type IS DISTINCT FROM 'text' THEN
    ALTER TABLE "User"
      ALTER COLUMN "platformRole" TYPE TEXT USING "platformRole"::text;
  END IF;

  UPDATE "User"
  SET "platformRole" = 'GENERAL_USER'
  WHERE "platformRole" IS NULL OR btrim("platformRole") = '';

  ALTER TABLE "User"
    ALTER COLUMN "platformRole" SET DEFAULT 'GENERAL_USER',
    ALTER COLUMN "platformRole" SET NOT NULL;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'sessionVersion'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER;
  END IF;

  UPDATE "User"
  SET "sessionVersion" = 1
  WHERE "sessionVersion" IS NULL;

  ALTER TABLE "User"
    ALTER COLUMN "sessionVersion" SET DEFAULT 1,
    ALTER COLUMN "sessionVersion" SET NOT NULL;
END $$;
