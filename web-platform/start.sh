#!/bin/sh
set -e

echo "Applying safe user role migration..."
set +e
MIGRATION_OUTPUT=$(npx prisma db execute --file prisma/migrations/20260331153000_safe_user_role_columns/migration.sql 2>&1)
MIGRATION_EXIT=$?
set -e
echo "$MIGRATION_OUTPUT"

if [ "$MIGRATION_EXIT" -ne 0 ]; then
	if echo "$MIGRATION_OUTPUT" | grep -q "P1014"; then
		echo "User table not found yet. Skipping safe user role migration until schema exists."
	else
		echo "Safe user role migration failed for a non-recoverable reason."
		exit "$MIGRATION_EXIT"
	fi
fi

echo "Running Prisma schema sync..."
set +e
DB_PUSH_OUTPUT=$(npx prisma db push 2>&1)
DB_PUSH_EXIT=$?
set -e
echo "$DB_PUSH_OUTPUT"

if [ "$DB_PUSH_EXIT" -ne 0 ]; then
	if echo "$DB_PUSH_OUTPUT" | grep -q "Use the --accept-data-loss flag"; then
		if [ "${PRISMA_ACCEPT_DATA_LOSS:-false}" = "true" ]; then
			echo "Applying destructive Prisma changes because PRISMA_ACCEPT_DATA_LOSS=true"
			npx prisma db push --accept-data-loss
		else
			echo "Skipping destructive Prisma schema changes."
			echo "Set PRISMA_ACCEPT_DATA_LOSS=true to allow prisma db push --accept-data-loss on startup."
		fi
	else
		echo "Prisma db push failed for a non-data-loss reason."
		exit "$DB_PUSH_EXIT"
	fi
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Seeding database..."
npx prisma db seed

echo "Starting app..."
npm run dev