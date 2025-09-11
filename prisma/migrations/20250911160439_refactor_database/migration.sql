/*
  Warnings:

  - The `raw_material` column on the `artisan_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `technique` column on the `artisan_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `finality_classification` column on the `artisan_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `fk_artisan_id` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `fk_product_id` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `device` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `ended_at` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `artisans_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_ratings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_profile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expires_at` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_agent` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('USER', 'ARTISAN', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('NOT_STARTED', 'SUBMITTED', 'POSTPONED');

-- DropForeignKey
ALTER TABLE "artisans_profile" DROP CONSTRAINT "artisans_profile_fk_user_id_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_fk_artisan_id_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_fk_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_likes" DROP CONSTRAINT "product_likes_fk_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_likes" DROP CONSTRAINT "product_likes_fk_user_id_fkey";

-- DropForeignKey
ALTER TABLE "product_ratings" DROP CONSTRAINT "product_ratings_fk_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_ratings" DROP CONSTRAINT "product_ratings_fk_user_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_fk_artisan_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_fk_category_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_fk_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users_profile" DROP CONSTRAINT "users_profile_fk_user_id_fkey";

-- AlterTable
ALTER TABLE "artisan_applications" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "form_status" "FormStatus" NOT NULL DEFAULT 'NOT_STARTED',
DROP COLUMN "raw_material",
ADD COLUMN     "raw_material" TEXT[],
DROP COLUMN "technique",
ADD COLUMN     "technique" TEXT[],
DROP COLUMN "finality_classification",
ADD COLUMN     "finality_classification" TEXT[],
ALTER COLUMN "sicab" DROP NOT NULL,
ALTER COLUMN "sicab_registration_date" DROP NOT NULL,
ALTER COLUMN "sicab_valid_until" DROP NOT NULL;

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "fk_artisan_id",
DROP COLUMN "fk_product_id",
DROP COLUMN "updated_at",
ADD COLUMN     "fk_artisan_application_id" TEXT;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "device",
DROP COLUMN "ended_at",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_used_at" TIMESTAMP(3),
ADD COLUMN     "user_agent" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "roles" "Roles"[],
ADD COLUMN     "social_name" TEXT;

-- DropTable
DROP TABLE "artisans_profile";

-- DropTable
DROP TABLE "product_categories";

-- DropTable
DROP TABLE "product_likes";

-- DropTable
DROP TABLE "product_ratings";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "users_profile";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "cpf" TEXT,
    "phone" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisan_profiles" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "artisan_user_name" TEXT NOT NULL,
    "raw_material" TEXT[],
    "technique" TEXT[],
    "finality_classification" TEXT[],
    "sicab" TEXT NOT NULL,
    "sicab_registration_date" TIMESTAMP(3) NOT NULL,
    "sicab_valid_until" TIMESTAMP(3) NOT NULL,
    "followers_count" INTEGER NOT NULL DEFAULT 0,
    "products_count" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artisan_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_fk_user_id_key" ON "user_profiles"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_cpf_key" ON "user_profiles"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_phone_key" ON "user_profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "artisan_profiles_fk_user_id_key" ON "artisan_profiles"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "artisan_profiles_artisan_user_name_key" ON "artisan_profiles"("artisan_user_name");

-- CreateIndex
CREATE INDEX "artisan_applications_fk_user_id_status_idx" ON "artisan_applications"("fk_user_id", "status");

-- CreateIndex
CREATE INDEX "attachments_fk_user_id_fk_artisan_application_id_idx" ON "attachments"("fk_user_id", "fk_artisan_application_id");

-- CreateIndex
CREATE INDEX "sessions_fk_user_id_is_revoked_idx" ON "sessions"("fk_user_id", "is_revoked");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_profiles" ADD CONSTRAINT "artisan_profiles_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_fk_artisan_application_id_fkey" FOREIGN KEY ("fk_artisan_application_id") REFERENCES "artisan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
