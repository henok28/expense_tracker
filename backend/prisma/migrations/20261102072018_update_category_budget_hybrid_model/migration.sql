/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,month,year,userId]` on the table `CategoryBudget` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `CategoryBudget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CategoryBudget" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "CategoryBudget_categoryId_month_year_userId_key" ON "CategoryBudget"("categoryId", "month", "year", "userId");

-- AddForeignKey
ALTER TABLE "CategoryBudget" ADD CONSTRAINT "CategoryBudget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
