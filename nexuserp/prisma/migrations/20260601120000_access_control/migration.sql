-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'BLOCKED', 'CANCELED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "accessEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "themePreference" TEXT NOT NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';
