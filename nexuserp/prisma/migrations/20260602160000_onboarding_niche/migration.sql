-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "dashboardConfig" JSONB,
ADD COLUMN     "niche" TEXT,
ADD COLUMN     "onboardingAnswers" JSONB,
ADD COLUMN     "selectedModules" TEXT[] DEFAULT ARRAY[]::TEXT[];
