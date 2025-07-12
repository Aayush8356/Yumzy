ALTER TABLE "users" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expires" timestamp;