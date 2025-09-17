-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "fk_product_id" TEXT;

-- CreateTable
CREATE TABLE "raw_materials" (
    "id" BIGSERIAL NOT NULL,
    "name_filter" TEXT NOT NULL,
    "name_exhibit" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "techniques" (
    "id" BIGSERIAL NOT NULL,
    "name_filter" TEXT NOT NULL,
    "name_exhibit" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "techniques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" BIGSERIAL NOT NULL,
    "name_filter" TEXT NOT NULL,
    "name_exhibit" TEXT NOT NULL,
    "description" TEXT,
    "raw_material_ids" BIGINT[],
    "technique_ids" BIGINT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "fk_artisan_id" TEXT NOT NULL,
    "category_ids" BIGINT[],
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price_in_cents" BIGINT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "fk_cover_image_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "productCategoryId" BIGINT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_ratings" (
    "id" TEXT NOT NULL,
    "fk_product_id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_likes" (
    "id" TEXT NOT NULL,
    "fk_product_id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "raw_materials_name_filter_key" ON "raw_materials"("name_filter");

-- CreateIndex
CREATE UNIQUE INDEX "techniques_name_filter_key" ON "techniques"("name_filter");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_filter_key" ON "product_categories"("name_filter");

-- CreateIndex
CREATE UNIQUE INDEX "products_fk_cover_image_id_key" ON "products"("fk_cover_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_fk_artisan_id_is_active_idx" ON "products"("fk_artisan_id", "is_active");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_ratings_fk_product_id_fk_user_id_key" ON "product_ratings"("fk_product_id", "fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_likes_fk_product_id_fk_user_id_key" ON "product_likes"("fk_product_id", "fk_user_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_fk_artisan_id_fkey" FOREIGN KEY ("fk_artisan_id") REFERENCES "artisan_profiles"("fk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_fk_cover_image_id_fkey" FOREIGN KEY ("fk_cover_image_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ratings" ADD CONSTRAINT "product_ratings_fk_product_id_fkey" FOREIGN KEY ("fk_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ratings" ADD CONSTRAINT "product_ratings_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_likes" ADD CONSTRAINT "product_likes_fk_product_id_fkey" FOREIGN KEY ("fk_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_likes" ADD CONSTRAINT "product_likes_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_fk_product_id_fkey" FOREIGN KEY ("fk_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
