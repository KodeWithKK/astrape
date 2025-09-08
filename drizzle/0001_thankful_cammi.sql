ALTER TABLE "carts" DROP CONSTRAINT "carts_size_id_sizes_id_fk";
--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "size_id" DROP NOT NULL;