/*
  Warnings:

  - Added the required column `commercial_name` to the `artisan_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "artisan_applications" ADD COLUMN     "address" TEXT,
ADD COLUMN     "address_complement" TEXT,
ADD COLUMN     "address_number" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "commercial_name" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zip_code" TEXT;

-- AlterTable
ALTER TABLE "artisan_profiles" ADD COLUMN     "commercial_name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "artisan_profile_addresses" (
    "id" BIGSERIAL NOT NULL,
    "fk_artisan_id" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "address_number" TEXT NOT NULL,
    "address_complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artisan_profile_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artisan_profile_addresses_fk_artisan_id_key" ON "artisan_profile_addresses"("fk_artisan_id");

-- AddForeignKey
ALTER TABLE "artisan_profile_addresses" ADD CONSTRAINT "artisan_profile_addresses_fk_artisan_id_fkey" FOREIGN KEY ("fk_artisan_id") REFERENCES "artisan_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
