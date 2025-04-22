/*
  Warnings:

  - You are about to drop the column `is_disable` on the `artisans_profile` table. All the data in the column will be lost.
  - You are about to drop the column `pending_request` on the `artisans_profile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "artisans_profile" DROP COLUMN "is_disable",
DROP COLUMN "pending_request",
ADD COLUMN     "is_disabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "artisan_creation_requests" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "fk_user_reviewer_id" TEXT,
    "reviwed_at" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "artisan_creation_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "artisan_creation_requests" ADD CONSTRAINT "artisan_creation_requests_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_creation_requests" ADD CONSTRAINT "artisan_creation_requests_fk_user_reviewer_id_fkey" FOREIGN KEY ("fk_user_reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
