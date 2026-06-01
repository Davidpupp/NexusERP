-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "companySize" TEXT,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prefs" JSONB,
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_companyId_key" ON "CompanyProfile"("companyId");

-- AddForeignKey
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
