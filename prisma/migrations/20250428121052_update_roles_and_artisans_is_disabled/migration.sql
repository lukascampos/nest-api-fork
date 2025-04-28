/*
  Warnings:

  - Changed the column `role` on the `users` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/

-- AlterTable
ALTER TABLE "artisans_profile" ALTER COLUMN "is_disabled" SET DEFAULT true;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "Role"[] NOT NULL DEFAULT ARRAY['USER']::"Role"[];