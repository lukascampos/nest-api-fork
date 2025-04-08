/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ARTISAN', 'MODERATOR', 'ADMIN');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_user_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "is_disable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL;

-- DropTable
DROP TABLE "products";

-- CreateTable
CREATE TABLE "users_profile" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "social_name" TEXT,
    "cpf" TEXT NOT NULL,
    "dt_birth" TIMESTAMP(3) NOT NULL,
    "street" TEXT,
    "postal_code" TEXT,
    "city" TEXT,
    "number" TEXT,
    "phone" TEXT,
    "avatar" TEXT,

    CONSTRAINT "users_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisans_profile" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "raw_material" TEXT NOT NULL,
    "technique" TEXT NOT NULL,
    "finality_classification" TEXT NOT NULL,
    "sicab" TEXT NOT NULL,
    "sisab_cadastration_date" TIMESTAMP(3) NOT NULL,
    "sisab_valid_until" TIMESTAMP(3) NOT NULL,
    "pending_request" BOOLEAN NOT NULL DEFAULT false,
    "is_disable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "artisans_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "ip_host" TEXT NOT NULL,
    "device" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_fk_user_id_key" ON "users_profile"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_cpf_key" ON "users_profile"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "artisans_profile_fk_user_id_key" ON "artisans_profile"("fk_user_id");

-- AddForeignKey
ALTER TABLE "users_profile" ADD CONSTRAINT "users_profile_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisans_profile" ADD CONSTRAINT "artisans_profile_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
