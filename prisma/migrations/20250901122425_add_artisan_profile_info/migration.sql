-- AlterTable
ALTER TABLE "artisans_profile" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "followers_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "products_count" INTEGER NOT NULL DEFAULT 0;
