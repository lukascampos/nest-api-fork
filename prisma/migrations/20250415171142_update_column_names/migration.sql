/*
  Warnings:

  - You are about to drop the column `sisab_cadastration_date` on the `artisans_profile` table. All the data in the column will be lost.
  - You are about to drop the column `is_disable` on the `users` table. All the data in the column will be lost.
  - Added the required column `sisab_registration_date` to the `artisans_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "artisans_profile" DROP COLUMN "sisab_cadastration_date",
ADD COLUMN     "sisab_registration_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_disable",
ADD COLUMN     "is_disabled" BOOLEAN NOT NULL DEFAULT false;
